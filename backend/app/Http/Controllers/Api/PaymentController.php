<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index() { return response()->json(Payment::with('order')->get()); }
    
    public function store(Request $request) {
        $request->validate([
            'OrderID' => 'required|exists:orders,OrderID|unique:payments,OrderID',
            'Method' => 'required|string|max:100',
            'Status' => 'required|string|max:50',
            'PaymentDate' => 'nullable|date'
        ]);
        return response()->json(Payment::create($request->all()), 201);
    }

    public function show($id) {
        $p = Payment::with('order')->find($id);
        return $p ? response()->json($p) : response()->json(['message' => 'Not found'], 404);
    }

    public function update(Request $request, $id) {
        $p = Payment::find($id);
        if (!$p) return response()->json(['message' => 'Not found'], 404);
        $request->validate(['Status' => 'required|string|max:50']);
        $p->update($request->only('Status', 'PaymentDate'));
        return response()->json($p);
    }

    public function destroy($id) {
        $p = Payment::find($id);
        if ($p) $p->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
