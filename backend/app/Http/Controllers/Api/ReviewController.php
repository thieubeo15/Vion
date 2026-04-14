<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index() { return response()->json(Review::with(['user', 'product'])->get()); }
    
    public function store(Request $request) {
        $request->validate([
            'UserID' => 'required|exists:users,UserID',
            'ProductID' => 'required|exists:products,ProductID',
            'Rating' => 'required|integer|min:1|max:5',
            'Content' => 'nullable|string',
            'Image' => 'nullable|string'
        ]);
        return response()->json(Review::create($request->all()), 201);
    }

    public function show($id) {
        $r = Review::with(['user', 'product'])->find($id);
        return $r ? response()->json($r) : response()->json(['message' => 'Not found'], 404);
    }

    public function update(Request $request, $id) {
        $r = Review::find($id);
        if (!$r) return response()->json(['message' => 'Not found'], 404);
        $request->validate(['Rating' => 'sometimes|integer|min:1|max:5', 'Content' => 'nullable|string']);
        $r->update($request->only('Rating', 'Content', 'Image'));
        return response()->json($r);
    }

    public function destroy($id) {
        $r = Review::find($id);
        if ($r) $r->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
