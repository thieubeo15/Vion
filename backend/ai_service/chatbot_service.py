import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
import uvicorn
import pymysql
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI


# 1. Tải các biến môi trường từ file .env của Laravel
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path)


app = FastAPI(title="Vion Era Chatbot AI Service")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Định nghĩa hàm truy vấn MySQL
def search_products_fn(query: str, searched_products_list: list) -> str:
    # Làm sạch từ khóa phụ trợ tiếng Việt thường gặp để tránh trượt LIKE
    words_to_remove = [
        "còn hàng", "hết hàng", "cần tìm", "tìm kiếm", "tìm cho tôi",
        "tìm", "cho", "tôi", "các", "mẫu", "loại", "kiểu", "bán",
        "cửa hàng", "shop", "còn", "hàng", "không", "ạ", "nhỉ",
        "có", "những", "nào", "gợi ý", "nam", "nữ",
        "chào", "hi", "hello"
    ]

    cleaned_query = query.lower()

    for w in words_to_remove:
        cleaned_query = cleaned_query.replace(w, "")

    cleaned_query = cleaned_query.strip()

    if not cleaned_query:
        cleaned_query = query

    print(f"DEBUG: search_products_fn called with query={repr(query)}")
    print(f"DEBUG: cleaned_query={repr(cleaned_query)}")

    connection = None

    try:
        connection = pymysql.connect(
            host=os.environ.get("DB_HOST", "127.0.0.1"),
            user=os.environ.get("DB_USERNAME", "root"),
            password=os.environ.get("DB_PASSWORD", ""),
            database=os.environ.get("DB_DATABASE", "vion"),
            port=int(os.environ.get("DB_PORT", 3306)),
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor
        )

        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    p.ProductID, 
                    p.Name, 
                    p.Description, 
                    p.MainImage, 
                    v.VariantID, 
                    v.Size, 
                    v.Color, 
                    v.Price, 
                    v.Stock
                FROM products p
                LEFT JOIN product_variants v 
                    ON p.ProductID = v.ProductID
                WHERE p.Name LIKE %s 
                   OR p.Description LIKE %s
                LIMIT 30
            """

            search_pattern = f"%{cleaned_query}%"

            print(f"DEBUG: search_pattern={repr(search_pattern)}")

            cursor.execute(sql, (search_pattern, search_pattern))
            rows = cursor.fetchall()

            print(f"DEBUG: rows fetched={len(rows)}")

            # Fallback: nếu không tìm thấy, tách từng từ để tìm rộng hơn
            if not rows and " " in cleaned_query:
                parts = [p.strip() for p in cleaned_query.split() if p.strip()]

                if len(parts) > 1:
                    print(f"DEBUG: Fallback search with parts: {parts}")

                    conditions = []
                    params = []

                    for part in parts:
                        conditions.append("(p.Name LIKE %s OR p.Description LIKE %s)")
                        params.extend([f"%{part}%", f"%{part}%"])

                    sql_fallback = f"""
                        SELECT 
                            p.ProductID, 
                            p.Name, 
                            p.Description, 
                            p.MainImage, 
                            v.VariantID, 
                            v.Size, 
                            v.Color, 
                            v.Price, 
                            v.Stock
                        FROM products p
                        LEFT JOIN product_variants v 
                            ON p.ProductID = v.ProductID
                        WHERE {" AND ".join(conditions)}
                        LIMIT 30
                    """

                    cursor.execute(sql_fallback, params)
                    rows = cursor.fetchall()

                    print(f"DEBUG: Fallback rows fetched={len(rows)}")

            if not rows:
                print("DEBUG: No rows matched, returning not found string.")
                return f"Không tìm thấy sản phẩm nào khớp với từ khóa '{query}'."

            # Nhóm kết quả theo ProductID
            products_dict = {}

            for row in rows:
                p_id = row["ProductID"]

                if p_id not in products_dict:
                    description = row["Description"] or ""

                    products_dict[p_id] = {
                        "Name": row["Name"],
                        "Description": description[:150] + "..." if len(description) > 150 else description,
                        "MainImage": row["MainImage"],
                        "Variants": []
                    }

                if row["Price"] is not None:
                    products_dict[p_id]["Variants"].append({
                        "Size": row["Size"],
                        "Color": row["Color"],
                        "Price": float(row["Price"]),
                        "Stock": row["Stock"]
                    })

            # Lưu sản phẩm để frontend có thể hiển thị card
            for p_id, p_info in products_dict.items():
                price = 0

                if p_info["Variants"]:
                    price = min(v["Price"] for v in p_info["Variants"])

                # Tránh trùng sản phẩm
                if not any(p["id"] == p_id for p in searched_products_list):
                    img_path = p_info["MainImage"]
                    if img_path and not (img_path.startswith("http://") or img_path.startswith("https://")):
                        img_path = f"/storage/{img_path}"
                    searched_products_list.append({
                        "id": p_id,
                        "name": p_info["Name"],
                        "image": img_path,
                        "price": price
                    })

            # Định dạng dữ liệu trả về cho AI
            result = []

            for p_id, p_info in products_dict.items():
                p_str = f"Sản phẩm: {p_info['Name']} (Mã ID: {p_id})\n"
                p_str += f"- Mô tả: {p_info['Description']}\n"

                img_path = p_info["MainImage"]
                if img_path:
                    if not (img_path.startswith("http://") or img_path.startswith("https://")):
                        img_path = f"/storage/{img_path}"
                    p_str += f"- Ảnh chính: {img_path}\n"
                else:
                    p_str += "- Ảnh chính: Chưa có ảnh\n"

                if p_info["Variants"]:
                    p_str += "- Các biến thể có sẵn:\n"

                    for v in p_info["Variants"]:
                        stock = v["Stock"] if v["Stock"] is not None else 0
                        stock_status = "Còn hàng" if stock > 0 else "Hết hàng"

                        p_str += (
                            f"  * Màu: {v['Color']}, "
                            f"Kích cỡ (Size): {v['Size']}, "
                            f"Giá: {int(v['Price']):,}đ, "
                            f"Tồn kho: {stock} cái, "
                            f"Tình trạng: {stock_status}\n"
                        )
                else:
                    p_str += "- Các biến thể có sẵn: Chưa có biến thể\n"

                result.append(p_str)

            return "\n\n".join(result)

    except Exception as e:
        print(f"DEBUG EXCEPTION: Lỗi hệ thống khi tra cứu cơ sở dữ liệu: {e}")
        return f"Lỗi hệ thống khi tra cứu cơ sở dữ liệu: {str(e)}"

    finally:
        if connection:
            connection.close()


# 3. System Prompt thiết lập tính cách trợ lý thời trang
SYSTEM_PROMPT = """
Bạn là Vion Era Assistant - trợ lý mua sắm AI thông minh, thân thiện và am hiểu thời trang của thương hiệu Vion Era.

VAI TRÒ:
- Tư vấn phong cách thời trang cho khách hàng.
- Hỗ trợ khách tìm sản phẩm phù hợp trong cửa hàng Vion Era.
- Trả lời các thông tin liên quan đến sản phẩm như tên, giá, size, màu sắc, tồn kho, mô tả và gợi ý phối đồ.

CÁCH XƯNG HÔ:
- Luôn thân thiện, lịch sự, tự nhiên và chuyên nghiệp.
- Có thể xưng là "mình" hoặc "Vion Era".
- Gọi khách hàng là "bạn" hoặc "quý khách".

QUY TẮC BẮT BUỘC VỀ DỮ LIỆU SẢN PHẨM:
1. Không được tự bịa sản phẩm, giá, size, màu sắc, số lượng tồn kho, mã ID hoặc ảnh sản phẩm.
2. Nếu khách hỏi về sản phẩm, giá, size, màu sắc, tồn kho, còn hàng/hết hàng hoặc muốn tìm sản phẩm cụ thể, bạn chỉ được trả lời dựa trên dữ liệu sản phẩm thực tế được cung cấp từ hệ thống hoặc công cụ `search_products`.
3. Khi nhắc đến sản phẩm có trong dữ liệu, phải ghi đúng tên sản phẩm và mã ID sản phẩm.
   Ví dụ: "Áo thun basic - Mã ID: 6".
4. Nếu dữ liệu không có sản phẩm phù hợp, hãy nói rõ:
   - "Hiện tại Vion Era chưa tìm thấy mẫu sản phẩm này trong cửa hàng."
   - Không được khẳng định cửa hàng có sản phẩm nếu dữ liệu không xác nhận.
5. Chỉ gợi ý sản phẩm thay thế nếu trong dữ liệu thực tế có sản phẩm phù hợp để gợi ý.
6. Không tự tạo đường dẫn ảnh, không tự suy đoán giá, không tự đoán size còn hàng.
7. Nếu dữ liệu trả về có nhiều biến thể, hãy trình bày rõ theo từng màu, size, giá và tồn kho.
8. Nếu sản phẩm hết hàng ở một số size/màu, hãy nói rõ size/màu đó hết hàng, không nói chung chung là toàn bộ sản phẩm hết hàng.

TƯ VẤN PHONG CÁCH:
- Nếu khách hỏi về phối đồ, xu hướng, mặc gì đi học/đi làm/đi chơi/dự tiệc/hẹn hò, bạn có thể tư vấn bằng kiến thức thời trang chung.
- Nếu có dữ liệu sản phẩm phù hợp từ cửa hàng, hãy ưu tiên gợi ý sản phẩm của Vion Era.
- Lời khuyên nên thực tế, dễ áp dụng, phù hợp với hoàn cảnh sử dụng.
- Có thể gợi ý cách phối màu, chọn phụ kiện, giày dép hoặc kiểu dáng phù hợp.

KHI KHÁCH HỎI NGOÀI PHẠM VI:
- Trả lời ngắn gọn, lịch sự.
- Sau đó nhẹ nhàng điều hướng lại về thời trang hoặc sản phẩm của Vion Era.

ĐỊNH DẠNG TRẢ LỜI:
- Trả lời ngắn gọn, rõ ràng, dễ đọc.
- Có thể dùng bullet points khi liệt kê sản phẩm, size, màu sắc hoặc gợi ý phối đồ.
- Khi giới thiệu sản phẩm, ưu tiên format:

Tên sản phẩm - Mã ID:
- Giá:
- Size:
- Màu sắc:
- Tình trạng kho:
- Gợi ý phối đồ:

PHONG CÁCH:
- Trẻ trung, thời thượng, gần gũi.
- Không nói quá dài.
- Không máy móc.
- Không cam kết những điều không có trong dữ liệu.
- Luôn ưu tiên trải nghiệm mua sắm dễ chịu cho khách hàng.
"""


# 4. Định nghĩa dữ liệu đầu vào API
class MessageHistory(BaseModel):
    role: str  # 'user' hoặc 'assistant'
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[MessageHistory]
    gemini_api_key: Optional[str] = None


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Lấy API Key từ request hoặc .env
        api_key = request.gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if api_key and "," in api_key:
            import random
            keys = [k.strip() for k in api_key.split(",") if k.strip()]
            if keys:
                api_key = random.choice(keys)

        if api_key:
            print("DEBUG: Using Gemini (langchain_google_genai) for Chatbot Service")
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=api_key,
                temperature=0.0
            )
        else:
            print("DEBUG: Using Ollama for Chatbot Service (No Gemini API Key found)")
            # Lấy tên mô hình Ollama từ file .env hoặc sử dụng mặc định là qwen2.5:3b
            ollama_model = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")
            ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

            # Khởi tạo mô hình Ollama Local
            llm = ChatOllama(
                model=ollama_model,
                base_url=ollama_base_url,
                temperature=0.0
            )

        searched_products = []

        # RAG: tìm kiếm database trước dựa trên câu hỏi người dùng
        words_to_remove = [
            "còn hàng", "hết hàng", "cần tìm", "tìm kiếm", "tìm cho tôi",
            "tìm", "cho", "tôi", "các", "mẫu", "loại", "kiểu", "bán",
            "cửa hàng", "shop", "còn", "hàng", "không", "ạ", "nhỉ",
            "có", "những", "nào", "gợi ý", "nam", "nữ",
            "chào", "hi", "hello"
        ]

        cleaned_query = request.message.lower()

        for w in words_to_remove:
            cleaned_query = cleaned_query.replace(w, "")

        cleaned_query = cleaned_query.strip()

        db_products_info = ""

        if cleaned_query and len(cleaned_query) > 1:
            print(f"DEBUG RAG: Pre-emptively searching database for query={repr(cleaned_query)}")
            db_products_info = search_products_fn(cleaned_query, searched_products)
            print(f"DEBUG RAG: Pre-emptive search found {len(searched_products)} products.")

        @tool
        def search_products(query: str) -> str:
            """
            Tìm kiếm thông tin sản phẩm thời trang trong cửa hàng Vion Era.

            Tham số:
            - query: từ khóa sản phẩm cốt lõi, ví dụ: "áo thun", "áo phông", "quần jean", "váy", "sơ mi", "giày".

            Lưu ý:
            - Không truyền các từ phụ như: "còn hàng", "giá bao nhiêu", "tìm cho tôi", "đẹp", "không", "ạ".
            - Dùng công cụ này khi khách hỏi về sản phẩm, giá, size, màu sắc, tồn kho, còn hàng/hết hàng.
            - Kết quả trả về gồm tên sản phẩm, mô tả, ảnh chính và các biến thể gồm màu sắc, size, giá, tồn kho.
            """
            print(f"DEBUG: Tool search_products CALLED with query: {repr(query)}")
            res = search_products_fn(query, searched_products)
            print(f"DEBUG: Tool search_products found {len(searched_products)} products so far.")
            return res

        # Liên kết tool tra cứu sản phẩm vào LLM
        llm_with_tools = llm.bind_tools([search_products])

        # Tạo system prompt
        system_prompt_content = SYSTEM_PROMPT

        if db_products_info and "Không tìm thấy sản phẩm nào" not in db_products_info:
            system_prompt_content += f"""

[DỮ LIỆU SẢN PHẨM THỰC TẾ TRONG KHO]
{db_products_info}

QUY TẮC SỬ DỤNG DỮ LIỆU TRÊN:
- Bắt buộc ưu tiên sử dụng dữ liệu sản phẩm thực tế ở trên để trả lời khách hàng.
- Khi giới thiệu hoặc nhắc tới bất kỳ sản phẩm nào trong dữ liệu, phải ghi đúng tên sản phẩm và kèm mã ID.
- Format bắt buộc khi nhắc sản phẩm: "Tên sản phẩm - Mã ID: số_id".
- Không tự bịa sản phẩm, giá, size, màu sắc, tồn kho, ảnh hoặc mã ID ngoài dữ liệu.
- Nếu dữ liệu không đủ để trả lời một chi tiết nào đó, hãy nói rõ rằng hiện tại Vion Era chưa có đủ thông tin cho chi tiết đó.
"""

        messages = [SystemMessage(content=system_prompt_content)]

        # Nạp lịch sử hội thoại
        for msg in request.history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))

            elif msg.role == "assistant":
                # Loại bỏ PRODUCTS_JSON cũ trước khi đưa vào AI
                import re
                clean_content = re.sub(
                    r"\n\n\[PRODUCTS_JSON:\s*.*?\]",
                    "",
                    msg.content,
                    flags=re.DOTALL
                )
                messages.append(AIMessage(content=clean_content))

        # Câu hỏi mới nhất của khách hàng
        messages.append(HumanMessage(content=request.message))

        print(f"DEBUG: Sending message to LLM: {repr(request.message)}")

        response = None

        # Vòng lặp tối đa 5 bước gọi tool nếu AI yêu cầu
        for i in range(5):
            print(f"DEBUG: Agentic loop iteration {i + 1}")

            response = llm_with_tools.invoke(messages)
            messages.append(response)

            print(f"DEBUG: LLM response content: {repr(response.content)}")
            print(f"DEBUG: LLM response tool_calls: {repr(response.tool_calls)}")

            # Nếu AI không yêu cầu gọi thêm tool thì dừng
            if not response.tool_calls:
                break

            # Thực thi tool calls
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]

                if tool_name == "search_products":
                    tool_result = search_products.invoke(tool_args)

                    messages.append(
                        ToolMessage(
                            content=str(tool_result),
                            tool_call_id=tool_call["id"],
                            name=tool_name
                        )
                    )

        if response is None:
            raise Exception("Không nhận được phản hồi từ mô hình AI.")

        # Lấy nội dung câu trả lời cuối cùng
        final_reply = response.content

        if isinstance(final_reply, list):
            text_parts = []

            for part in final_reply:
                if isinstance(part, dict) and "text" in part:
                    text_parts.append(part["text"])
                elif isinstance(part, str):
                    text_parts.append(part)

            final_reply = "".join(text_parts)

        elif not isinstance(final_reply, str):
            final_reply = str(final_reply)

        # Lọc lại các sản phẩm thực sự được AI nhắc tới trong câu trả lời để hiển thị thẻ
        mentioned_products = []
        reply_lower = final_reply.lower()

        for p in searched_products:
            name_lower = p["name"].lower()
            product_id = str(p["id"])

            is_mentioned = (
                name_lower in reply_lower
                or f"mã id: {product_id}" in reply_lower
                or f"mã id {product_id}" in reply_lower
                or f"id: {product_id}" in reply_lower
                or f"id {product_id}" in reply_lower
                or f"mã sản phẩm: {product_id}" in reply_lower
                or f"mã sản phẩm {product_id}" in reply_lower
            )

            if is_mentioned:
                mentioned_products.append(p)

        # Nếu có sản phẩm được nhắc tới, đính kèm JSON cho frontend parse
        if mentioned_products:
            import json
            products_json_str = json.dumps(mentioned_products, ensure_ascii=False)
            final_reply += f"\n\n[PRODUCTS_JSON: {products_json_str}]"

        return {
            "success": True,
            "reply": final_reply
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xử lý AI: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
