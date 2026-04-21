<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    UserController, CategoryController, ProductController, 
    ProductVariantController, ProductImageController, ProductVectorController,
    CartController, CartItemController, OrderController, 
    OrderDetailController, PaymentController, ReviewController,
    ChatSessionController, MessageController, AuthController, 
    AdminController, BannerController
};

// --- CÁC ROUTE CÔNG KHAI (Ai cũng xem được) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']); // Lấy review của 1 SP
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);

// --- NHÓM API BẮT BUỘC PHẢI ĐĂNG NHẬP (Bảo vệ bằng Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    // User & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user/update', [UserController::class, 'updateProfile']);
    
    // Giỏ hàng
    Route::get('/my-cart', [CartController::class, 'myCart']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart-items/{id}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart-items/{id}', [CartController::class, 'removeItem']);
    
    // Đơn hàng
    Route::post('/orders/place', [OrderController::class, 'placeOrder']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    
    // ĐÁNH GIÁ (Quan trọng - Chỉ POST mới cần login)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Admin & Quản lý (Chỗ này sau này bro nên check thêm quyền Admin)
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
    
    // Banner
    Route::post('/banners', [BannerController::class, 'store']);
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
    
    // Category
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Product (Admin CRUD)
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Orders (Admin Quản lý)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
});

// --- CÁC API RESOURCE KHÁC (Nếu thực sự cần thiết) ---
// Lưu ý: Đã xoá các apiResource gây xung đột với group auth ở trên
Route::apiResource('product-variants', ProductVariantController::class);
Route::apiResource('product-images', ProductImageController::class);
Route::apiResource('chat-sessions', ChatSessionController::class);
Route::apiResource('messages', MessageController::class);