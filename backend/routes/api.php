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


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']); 
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);


Route::post('/chatbot/send', [ChatbotController::class, 'sendMessage']);
Route::get('/chatbot/history', [ChatbotController::class, 'getHistory']);
Route::post('/chatbot/clear', [ChatbotController::class, 'clearHistory']);


Route::post('/orders/place', [OrderController::class, 'placeOrder']);


Route::middleware('auth:sanctum')->post('/voucher/apply', [VoucherController::class, 'apply']);


Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user/update', [UserController::class, 'updateProfile']);
    
    
    Route::get('/my-cart', [CartController::class, 'myCart']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart-items/{id}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart-items/{id}', [CartController::class, 'removeItem']);
    
    
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder']); 
    Route::post('/orders/{id}/return', [OrderController::class, 'requestReturn']); 
    
    
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    
    Route::get('/my-vouchers', [VoucherController::class, 'myVouchers']);
    Route::get('/vouchers/public', [VoucherController::class, 'publicVouchers']);
    Route::post('/vouchers/{id}/save', [VoucherController::class, 'saveVoucher']);

    
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    
    Route::middleware('admin')->group(function () {
        
        Route::get('/admin/stats', [AdminController::class, 'getStats']);
        
        
        Route::post('/banners', [BannerController::class, 'store']);
        Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
        
        
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        
        Route::get('/orders', [OrderController::class, 'index']);
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

        
        Route::post('/vouchers/{id}/gift', [VoucherController::class, 'giftVoucher']);
        Route::post('/vouchers/{id}/gift-random', [VoucherController::class, 'giftRandom']);
        Route::post('/vouchers/{id}/gift-birthday', [VoucherController::class, 'giftBirthday']);
        Route::post('/vouchers/{id}/gift-segment', [VoucherController::class, 'giftSegment']);
        Route::get('/vouchers/{id}/usages', [VoucherController::class, 'usages']);
        Route::get('/users/list', [VoucherController::class, 'allUsers']);

        
        Route::apiResource('vouchers', VoucherController::class);

        
        Route::prefix('admin')->group(function () {
            Route::get('/users', [UserController::class, 'indexAdmin']);
            Route::post('/users', [UserController::class, 'storeAdmin']);
            Route::put('/users/{id}', [UserController::class, 'updateAdmin']);
            Route::delete('/users/{id}', [UserController::class, 'destroyAdmin']);
        });
    });
});


Route::apiResource('product-variants', ProductVariantController::class);
Route::apiResource('product-images', ProductImageController::class);



Route::post('/search/image', [ProductSearchController::class, 'searchByImage']);

Route::get('/sync-vectors', [\App\Http\Controllers\Api\ProductSearchController::class, 'syncVectors']);