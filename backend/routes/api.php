<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    UserController, CategoryController, ProductController, 
    ProductVariantController, ProductImageController, ProductVectorController,
    CartController, CartItemController, OrderController, 
    OrderDetailController, ReviewController,
    AuthController, 
    AdminController, BannerController,
    ProductSearchController,
    VoucherController,
    ChatbotController,
    NotificationController,
    ForgotPasswordController
};

// --- CÁC ROUTE CÔNG KHAI (Ai cũng xem được) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']); // Lấy review của 1 SP
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);

// Chatbot routes
Route::post('/chatbot/send', [ChatbotController::class, 'sendMessage']);
Route::get('/chatbot/history', [ChatbotController::class, 'getHistory']);

// Đặt hàng (Công khai, hỗ trợ cả đăng nhập và khách vãng lai)
Route::post('/orders/place', [OrderController::class, 'placeOrder']);

// Voucher - Áp dụng mã giảm giá (public, nhưng cần đăng nhập để check per-user limit)
Route::middleware('auth:sanctum')->post('/voucher/apply', [VoucherController::class, 'apply']);

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
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']); // Khách hủy đơn
    
    // ĐÁNH GIÁ (Quan trọng - Chỉ POST mới cần login)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Voucher khách hàng
    Route::get('/my-vouchers', [VoucherController::class, 'myVouchers']);
    Route::get('/vouchers/public', [VoucherController::class, 'publicVouchers']);
    Route::post('/vouchers/{id}/save', [VoucherController::class, 'saveVoucher']);

    // Thông báo (Yêu cầu đăng nhập)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // --- CÁC ROUTE DÀNH RIÊNG CHO ADMIN ---
    Route::middleware('admin')->group(function () {
        // Admin & Quản lý
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

        // Admin tặng voucher
        Route::post('/vouchers/{id}/gift', [VoucherController::class, 'giftVoucher']);
        Route::post('/vouchers/{id}/gift-random', [VoucherController::class, 'giftRandom']);
        Route::post('/vouchers/{id}/gift-birthday', [VoucherController::class, 'giftBirthday']);
        Route::post('/vouchers/{id}/gift-segment', [VoucherController::class, 'giftSegment']);
        Route::get('/vouchers/{id}/usages', [VoucherController::class, 'usages']);
        Route::get('/users/list', [VoucherController::class, 'allUsers']);

        // Voucher (Admin CRUD)
        Route::apiResource('vouchers', VoucherController::class);

        // Quản lý người dùng (CRUD Users)
        Route::prefix('admin')->group(function () {
            Route::get('/users', [UserController::class, 'indexAdmin']);
            Route::post('/users', [UserController::class, 'storeAdmin']);
            Route::put('/users/{id}', [UserController::class, 'updateAdmin']);
            Route::delete('/users/{id}', [UserController::class, 'destroyAdmin']);
        });
    });
});

// --- CÁC API RESOURCE KHÁC ---
Route::apiResource('product-variants', ProductVariantController::class);
Route::apiResource('product-images', ProductImageController::class);


// Tuyến đường tìm kiếm ảnh bằng CLIP AI
Route::post('/search/image', [ProductSearchController::class, 'searchByImage']);
// Tuyến đường để Admin chạy đồng bộ vector (Chỉ cần chạy 1 lần để nạp dữ liệu)
Route::get('/sync-vectors', [\App\Http\Controllers\Api\ProductSearchController::class, 'syncVectors']);