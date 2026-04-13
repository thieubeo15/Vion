<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        "message" => "Backend OK"
    ]);
});


Route::get('/products', function () {
    return response()->json([
        [
            "id" => 1,
            "name" => "Áo thun",
            "price" => 200000
        ],
        [
            "id" => 2,
            "name" => "Quần jeans",
            "price" => 500000
        ]
    ]);
});