<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ProductVector;
use Illuminate\Http\Request;

class ProductVectorController extends Controller
{
    public function index() { return response()->json(ProductVector::all()); }
    public function store(Request $request) {
        $request->validate(['ImageID' => 'required|exists:product_images,ImageID|unique:product_vectors,ImageID', 'VectorData' => 'required|string']);
        return response()->json(ProductVector::create($request->all()), 201);
    }
    public function show($id) {
        $v = ProductVector::find($id);
        return $v ? response()->json($v) : response()->json(['message' => 'Not found'], 404);
    }
    public function destroy($id) {
        $v = ProductVector::find($id);
        if ($v) $v->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
