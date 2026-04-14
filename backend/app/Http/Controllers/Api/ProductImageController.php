<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ProductImage;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function index() { return response()->json(ProductImage::all()); }
    public function store(Request $request) {
        $request->validate(['ProductID' => 'required|exists:products,ProductID', 'Url' => 'required|string|max:255']);
        return response()->json(ProductImage::create($request->all()), 201);
    }
    public function show($id) {
        $img = ProductImage::find($id);
        return $img ? response()->json($img) : response()->json(['message' => 'Not found'], 404);
    }
    public function update(Request $request, $id) {
        $img = ProductImage::find($id);
        if (!$img) return response()->json(['message' => 'Not found'], 404);
        $img->update($request->all());
        return response()->json($img);
    }
    public function destroy($id) {
        $img = ProductImage::find($id);
        if ($img) $img->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
