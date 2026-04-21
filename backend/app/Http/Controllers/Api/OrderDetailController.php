<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderDetailController extends Controller
{
  public function show($id) {
    // Lấy chi tiết kèm theo thông tin biến thể và sản phẩm chính
    $detail = OrderDetail::with(['variant.product'])->find($id);
    
    return $detail 
        ? response()->json($detail) 
        : response()->json(['message' => 'Không tìm thấy chi tiết này'], 404);
}
}
