import os
import uvicorn
import pymysql
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langchain_ollama import ChatOllama

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
    words_to_remove = ["còn hàng", "hết hàng", "cần tìm", "tìm kiếm", "tìm cho tôi", "tìm", "cho", "tôi", "các", "mẫu", "loại", "kiểu", "bán", "cửa hàng", "shop", "còn", "hàng", "không", "ạ", "nhỉ", "có", "những", "nào", "gợi ý", "nam", "nữ", "chào", "hi", "hello"]
    cleaned_query = query.lower()
    for w in words_to_remove:
        cleaned_query = cleaned_query.replace(w, "")
    cleaned_query = cleaned_query.strip()
    if not cleaned_query:
        cleaned_query = query
        
    print(f"DEBUG: search_products_fn called with query={repr(query)}")
    print(f"DEBUG: cleaned_query={repr(cleaned_query)}")
    
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_name = os.environ.get("DB_DATABASE", "vion")
    db_user = os.environ.get("DB_USERNAME", "root")
    
    connection = None
    try:
        connection = pymysql.connect(
            host=os.environ.get("DB_HOST", "127.0.0.1"),
            user=os.environ.get("DB_USERNAME", "root"),
            password=os.environ.get("DB_PASSWORD", ""),
            database=os.environ.get("DB_DATABASE", "vion"),
            port=int(os.environ.get("DB_PORT", 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        with connection.cursor() as cursor:
            sql = """
                SELECT p.ProductID, p.Name, p.Description, p.MainImage, 
                       v.VariantID, v.Size, v.Color, v.Price, v.Stock
                FROM products p
                LEFT JOIN product_variants v ON p.ProductID = v.ProductID
                WHERE p.Name LIKE %s OR p.Description LIKE %s
                LIMIT 30
            """
            search_pattern = f"%{cleaned_query}%"
            print(f"DEBUG: search_pattern={repr(search_pattern)}")
            cursor.execute(sql, (search_pattern, search_pattern))
            rows = cursor.fetchall()
            print(f"DEBUG: rows fetched={len(rows)}")
            
            # Fallback: split by space and search
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
                        SELECT p.ProductID, p.Name, p.Description, p.MainImage, 
                               v.VariantID, v.Size, v.Color, v.Price, v.Stock
                        FROM products p
                        LEFT JOIN product_variants v ON p.ProductID = v.ProductID
                        WHERE {" AND ".join(conditions)}
                        LIMIT 30
                    """
                    cursor.execute(sql_fallback, params)
                    rows = cursor.fetchall()
                    print(f"DEBUG: Fallback rows fetched={len(rows)}")
            
            if not rows:
                print("DEBUG: No rows matched, returning not found string.")
                return f"Không tìm thấy sản phẩm nào khớp với từ khóa '{query}'."
            
            # Nhóm các kết quả theo ProductID
            products_dict = {}
            for row in rows:
                p_id = row['ProductID']
                if p_id not in products_dict:
                    products_dict[p_id] = {
                        'Name': row['Name'],
                        'Description': row['Description'][:150] + "..." if row['Description'] else "",
                        'MainImage': row['MainImage'],
                        'Variants': []
                    }
                if row['Price'] is not None:
                    products_dict[p_id]['Variants'].append({
                        'Size': row['Size'],
                        'Color': row['Color'],
                        'Price': float(row['Price']),
                        'Stock': row['Stock']
                    })
            
            # Lưu trữ vào danh sách sản phẩm dạng JSON cho frontend
            for p_id, p_info in products_dict.items():
                price = 0
                if p_info['Variants']:
                    price = min(v['Price'] for v in p_info['Variants'])
                
                # Tránh trùng lặp
                if not any(p['id'] == p_id for p in searched_products_list):
                    searched_products_list.append({
                        'id': p_id,
                        'name': p_info['Name'],
                        'image': f"/storage/{p_info['MainImage']}" if p_info['MainImage'] else None,
                        'price': price
                    })

            # Định dạng đầu ra
            result = []
            for p_id, p_info in products_dict.items():
                p_str = f"Sản phẩm: {p_info['Name']} (Mã ID: {p_id})\n"
                p_str += f"- Mô tả: {p_info['Description']}\n"
                p_str += f"- Ảnh chính: /storage/{p_info['MainImage']}\n"
                p_str += "- Các biến thể có sẵn:\n"
                for v in p_info['Variants']:
                    p_str += f"  * Màu: {v['Color']}, Kích cỡ (Size): {v['Size']}, Giá: {int(v['Price']):,}đ, Tồn kho: {v['Stock']} cái\n"
                result.append(p_str)
            
            return "\n\n".join(result)
    except Exception as e:
        print(f"DEBUG EXCEPTION: Lỗi hệ thống khi tra cứu cơ sở dữ liệu: {e}")
        return f"Lỗi hệ thống khi tra cứu cơ sở dữ liệu: {str(e)}"
    finally:
        if connection:
            connection.close()
 
# 3. System Prompt thiết lập tính cách trợ lý thời trang
SYSTEM_PROMPT = """Bạn là Vion Era Assistant - Trợ lý mua sắm AI thông minh, phong cách và cực kỳ thân thiện của thương hiệu thời trang Vion Era. 
Nhiệm vụ của bạn là tư vấn phong cách, hỗ trợ khách hàng tìm kiếm quần áo, giày dép, phụ kiện phù hợp, trả lời về giá cả, kích thước (size), màu sắc và số lượng hàng trong kho.

QUY TẮC PHẢN HỒI:
1. LUÔN LUÔN thân thiện, lịch sự, xưng hô là "Vion Era" hoặc "mình" và gọi khách hàng là "bạn" hoặc "quý khách".
2. KHÔNG ảo giác thông tin. Nếu người dùng hỏi về sản phẩm, giá cả, size hay hàng còn/hết, bạn BẮT BUỘC phải gọi công cụ `search_products` để tra cứu thông tin thực tế từ cơ sở dữ liệu trước khi trả lời.
3. Nếu sản phẩm khách hỏi không tồn tại trong kết quả tra cứu, hãy đề xuất nhẹ nhàng rằng hiện tại cửa hàng chưa có mẫu đó và gợi ý họ tham khảo các sản phẩm khác có tên gần giống hoặc cùng danh mục.
4. Giọng điệu của bạn nên thời thượng, am hiểu về thời trang, đưa ra lời khuyên phối đồ hữu ích nếu được yêu cầu.
5. Định dạng câu trả lời gọn gàng, sử dụng các dấu xuống dòng và ký tự danh sách (bullet points) để khách hàng dễ đọc.
"""

# 4. Định nghĩa dữ liệu đầu vào API
class MessageHistory(BaseModel):
    role: str # 'user' hoặc 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[MessageHistory]
    gemini_api_key: Optional[str] = None

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
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

        # RAG: Pre-emptive database search based on user request keywords
        words_to_remove = ["còn hàng", "hết hàng", "cần tìm", "tìm kiếm", "tìm cho tôi", "tìm", "cho", "tôi", "các", "mẫu", "loại", "kiểu", "bán", "cửa hàng", "shop", "còn", "hàng", "không", "ạ", "nhỉ", "có", "những", "nào", "gợi ý", "nam", "nữ", "chào", "hi", "hello"]
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
            """Tìm kiếm thông tin các sản phẩm thời trang trong cửa hàng Vion Era dựa trên từ khóa sản phẩm cốt lõi (ví dụ: 'áo thun', 'áo phông', 'quần', 'váy', 'sơ mi', 'giày').
            KHÔNG truyền các từ khóa phụ trợ như 'còn hàng', 'đẹp', 'giá bao nhiêu', 'tìm cho tôi', v.v. vào đối số 'query'.
            Trả về tên sản phẩm, mô tả ngắn, ảnh chính, và các biến thể chi tiết bao gồm màu sắc, kích cỡ, giá cả, số lượng tồn kho.
            Sử dụng công cụ này khi người dùng hỏi về sản phẩm, giá cả, kiểm tra còn hàng hay hết hàng, hỏi size áo/quần hoặc màu sắc có sẵn.
            """
            print(f"DEBUG: Tool search_products CALLED with query: {repr(query)}")
            res = search_products_fn(query, searched_products)
            print(f"DEBUG: Tool search_products found {len(searched_products)} products so far.")
            return res
        
        # Liên kết tool tra cứu sản phẩm vào LLM
        llm_with_tools = llm.bind_tools([search_products])

        # Tạo danh sách tin nhắn truyền vào mô hình bao gồm System Prompt và lịch sử hội thoại
        system_prompt_content = SYSTEM_PROMPT
        if db_products_info and "Không tìm thấy sản phẩm nào" not in db_products_info:
            system_prompt_content += f"\n\n[DỮ LIỆU SẢN PHẨM THỰC TẾ TRONG KHO]:\n{db_products_info}\n\nHãy BẮT BUỘC sử dụng dữ liệu thực tế này để tư vấn khách hàng. Khi giới thiệu hay nhắc tới bất kỳ sản phẩm nào có trong dữ liệu trên, bạn phải ghi đúng Tên sản phẩm và kèm theo ID sản phẩm (ví dụ: 'Mã ID: 6' hoặc 'Mã ID: 7') trong câu trả lời để hệ thống hiển thị thẻ sản phẩm cho khách hàng. Không tự bịa đặt sản phẩm hoặc ID khác."

        messages = [SystemMessage(content=system_prompt_content)]
        
        # Duyệt lịch sử hội thoại cũ để nạp vào ngữ cảnh của AI
        for msg in request.history:
            if msg.role == 'user':
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == 'assistant':
                # Loại bỏ phần PRODUCTS_JSON đính kèm ở lịch sử trước khi nạp vào AI
                import re
                clean_content = re.sub(r'\n\n\[PRODUCTS_JSON:\s*.*?\]', '', msg.content, flags=re.DOTALL)
                messages.append(AIMessage(content=clean_content))

        # Cuối cùng là câu hỏi mới của khách hàng
        messages.append(HumanMessage(content=request.message))

        print(f"DEBUG: Sending message to LLM: {repr(request.message)}")

        # Vòng lặp tối đa 5 bước gọi Tool nếu AI yêu cầu tra cứu dữ liệu (Agentic Loop)
        for i in range(5):
            print(f"DEBUG: Agentic loop iteration {i+1}")
            response = llm_with_tools.invoke(messages)
            messages.append(response)
            
            print(f"DEBUG: LLM response content: {repr(response.content)}")
            print(f"DEBUG: LLM response tool_calls: {repr(response.tool_calls)}")
            
            # Nếu AI không yêu cầu gọi thêm công cụ nào nữa, dừng vòng lặp
            if not response.tool_calls:
                break
                
            # Thực thi các yêu cầu gọi công cụ của AI
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                
                if tool_name == "search_products":
                    tool_result = search_products.invoke(tool_args)
                    messages.append(ToolMessage(
                        content=str(tool_result),
                        tool_call_id=tool_call["id"],
                        name=tool_name
                    ))

        # Lấy nội dung câu trả lời cuối cùng của AI
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
        for p in searched_products:
            name_lower = p['name'].lower()
            reply_lower = final_reply.lower()
            if name_lower in reply_lower or f"id: {p['id']}" in reply_lower or f"id {p['id']}" in reply_lower or str(p['id']) in reply_lower:
                mentioned_products.append(p)
        
        # Nếu có sản phẩm được nhắc tới, đính kèm vào cuối câu trả lời dưới dạng JSON cho frontend parse
        if mentioned_products:
            import json
            products_json_str = json.dumps(mentioned_products, ensure_ascii=False)
            final_reply += f"\n\n[PRODUCTS_JSON: {products_json_str}]"

        return {"success": True, "reply": final_reply}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý AI: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
