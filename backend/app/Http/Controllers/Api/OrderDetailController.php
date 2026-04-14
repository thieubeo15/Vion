<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderDetailController extends Controller
{
    public function show($id) {
        $detail = OrderDetail::find($id);
        return $detail ? response()->json($detail) : response()->json(['message' => 'Not found'], 404);
    }
}
