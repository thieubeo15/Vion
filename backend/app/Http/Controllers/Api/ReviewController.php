<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
   // ReviewController.php

public function index(Request $request, $productId) // Thêm biến $productId
{
    $reviews = Review::with(['user'])
        ->where('ProductID', $productId)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $reviews
    ]);
}

public function store(Request $request)
{
    $user = $request->user();

    // 1. KIỂM TRA AN TOÀN: Nếu không có user thì báo lỗi ngay, không chạy tiếp
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Vui lòng đăng nhập để thực hiện chức năng này.'
        ], 401);
    }

    try {
        // 2. Logic kiểm tra mua hàng và lưu review của bro...
        // Bây giờ dùng $user->UserID sẽ không bao giờ bị lỗi "on null" nữa
        
        $hasBought = \App\Models\Order::where('UserID', $user->UserID)
            ->where('Status', 'Completed')
            ->whereHas('details.variant', function($q) use ($request) {
                // Chú ý: Ở đây nên dùng ProductID từ bảng products nếu details liên kết thẳng
                $q->where('ProductID', $request->ProductID); 
            })->exists();

        if (!$hasBought) {
            return response()->json([
                'message' => 'Bạn phải mua hàng và nhận hàng rồi mới được đánh giá nhé!'
            ], 403);
        }

      $review = Review::create([
    'UserID'    => $user->UserID,
    'ProductID' => $request->ProductID,
    'Rating'    => $request->Rating,
    
    // QUAN TRỌNG: Phải gán $request->Comment vào đúng cột 'Content'
    'Content'   => $request->Comment, 
    'Image'     => null,
]);

        return response()->json(['success' => true, 'data' => $review]);

    } catch (\Exception $e) {
        return response()->json(['message' => $e->getMessage()], 500);
    }
}

    public function show($id) {
        $r = Review::with(['user', 'product'])->find($id);
        return $r ? response()->json($r) : response()->json(['message' => 'Not found'], 404);
    }

    public function update(Request $request, $id) {
        $r = Review::find($id);
        if (!$r) return response()->json(['message' => 'Not found'], 404);
        $request->validate(['Rating' => 'sometimes|integer|min:1|max:5', 'Content' => 'nullable|string']);
        $r->update($request->only('Rating', 'Content', 'Image'));
        return response()->json($r);
    }

  // app/Http/Controllers/Api/ReviewController.php

public function destroy(Request $request, $id)
{
    $review = Review::find($id);

    if (!$review) {
        return response()->json(['message' => 'Không tìm thấy đánh giá'], 404);
    }

    // Kiểm tra: Nếu không phải chủ nhân của review thì không cho xóa
    if ($review->UserID !== $request->user()->UserID) {
        return response()->json(['message' => 'Bro không có quyền xóa đánh giá này!'], 403);
    }

    $review->delete();

    return response()->json(['success' => true, 'message' => 'Đã xóa đánh giá thành công']);
}
}
