<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;

class AdminController extends Controller
{
    public function getStats()
    {
        try {
            // 1. Tính doanh thu dựa trên cột TotalAmount
            $totalRevenue = Order::sum('TotalAmount');

            // 2. Đếm số lượng
            $totalOrders = Order::count();
            $totalProducts = Product::count();
            $totalCustomers = User::count();

            // 3. Lấy 5 đơn hàng mới nhất - Sắp xếp theo OrderDate hoặc OrderID
            $recentOrders = Order::with('user')
                ->orderBy('OrderDate', 'desc') 
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_revenue' => (float)$totalRevenue,
                    'total_orders' => $totalOrders,
                    'total_customers' => $totalCustomers,
                    'total_products' => $totalProducts,
                    'recent_orders' => $recentOrders
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi Database: ' . $e->getMessage()
            ], 500);
        }
    }
}