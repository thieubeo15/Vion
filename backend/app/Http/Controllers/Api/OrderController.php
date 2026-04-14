<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index() {
        return response()->json(Order::with(['details.variant', 'payment'])->get());
    }

    public function store(Request $request) {
        $request->validate([
            'UserID' => 'nullable|exists:users,UserID',
            'OrderDate' => 'required|date',
            'TotalAmount' => 'required|numeric',
            'Status' => 'required|string|max:50',
            'details' => 'required|array',
            'details.*.VariantID' => 'required|exists:product_variants,VariantID',
            'details.*.Quantity' => 'required|integer|min:1',
            'details.*.Price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $order = Order::create($request->only('UserID', 'OrderDate', 'TotalAmount', 'Status'));

            foreach ($request->details as $item) {
                // Giảm tồn kho
                $variant = ProductVariant::find($item['VariantID']);
                if ($variant->Stock < $item['Quantity']) {
                    throw new \Exception("Not enough stock for variant {$variant->VariantID}");
                }
                $variant->decrement('Stock', $item['Quantity']);

                OrderDetail::create([
                    'OrderID' => $order->OrderID,
                    'VariantID' => $item['VariantID'],
                    'Quantity' => $item['Quantity'],
                    'Price' => $item['Price']
                ]);
            }

            DB::commit();
            return response()->json(Order::with('details')->find($order->OrderID), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function show($id) {
        $order = Order::with(['details.variant', 'payment'])->find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        return response()->json($order);
    }

    public function update(Request $request, $id) {
        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        
        $request->validate(['Status' => 'required|string|max:50']);
        $order->update($request->only('Status'));
        return response()->json($order);
    }

    public function destroy($id) {
        $order = Order::find($id);
        if ($order) $order->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
