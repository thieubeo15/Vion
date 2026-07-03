<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Banner;

class AdminController extends Controller
{
    public function getStats()
    {
        try {
            
            $totalRevenue = Order::where('Status', 'Completed')->sum('TotalAmount');

            
            $totalCost = \Illuminate\Support\Facades\DB::table('order_details')
                ->join('orders', 'orders.OrderID', '=', 'order_details.OrderID')
                ->where('orders.Status', 'Completed')
                ->sum(\Illuminate\Support\Facades\DB::raw('order_details.ImportPrice * order_details.Quantity'));
                
            $totalProfit = $totalRevenue - $totalCost;

            
            $totalOrders = Order::count();
            $totalProducts = Product::count();
            $totalCustomers = User::count();

            
            $recentOrders = Order::with('user')
                ->orderBy('OrderDate', 'desc') 
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_revenue' => (float)$totalRevenue,
                    'total_profit'  => (float)$totalProfit,
                    'total_orders'  => $totalOrders,
                    'total_customers' => $totalCustomers,
                    'total_products' => $totalProducts,
                    'total_banners'   => Banner::count(),
                   'recent_orders' => Order::with(['details.variant.product']) 
    ->orderBy('OrderDate', 'desc')
    ->take(5)
    ->get()
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