<?php

use Illuminate\Support\Facades\Route;

// Nhúng (Import) toàn bộ Controller vào đây
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\ProductImageController;
use App\Http\Controllers\Api\ProductVectorController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CartItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderDetailController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ChatSessionController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// --- NHÓM API BẮT BUỘC PHẢI ĐĂNG NHẬP (Bảo vệ bằng Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user/update', [UserController::class, 'updateProfile']);
    Route::put('/user/change-password', [UserController::class, 'changePassword']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    
    // Chỉ để 1 dòng này thôi
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
});
// Mở đường cho các bảng cốt lõi (Sản phẩm, Danh mục)
Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('product-variants', ProductVariantController::class);
Route::apiResource('product-images', ProductImageController::class);
Route::apiResource('product-vectors', ProductVectorController::class);

// Mở đường cho Giỏ hàng & Đơn hàng
Route::apiResource('carts', CartController::class);
Route::apiResource('cart-items', CartItemController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('order-details', OrderDetailController::class);
Route::apiResource('payments', PaymentController::class);

// Mở đường cho Người dùng & Tương tác
Route::apiResource('users', UserController::class);
Route::apiResource('reviews', ReviewController::class);

// Mở đường cho AI Chatbot
Route::apiResource('chat-sessions', ChatSessionController::class);
Route::apiResource('messages', MessageController::class);