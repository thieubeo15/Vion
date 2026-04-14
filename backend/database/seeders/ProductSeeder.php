<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'CategoryID' => 4, // Polo Vion
                'Name' => 'Áo Polo Nam Mắt Chim Basic',
                'MainImage' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
                'Description' => 'Chất liệu thoáng mát, phù hợp công sở.'
            ],
            [
                'CategoryID' => 2, // Nữ
                'Name' => 'Váy Hoa Nhí Mùa Hè',
                'MainImage' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
                'Description' => 'Phong cách nhẹ nhàng, quyến rũ.'
            ],
            [
                'CategoryID' => 1, // Nam
                'Name' => 'Quần Jean Slimfit Nam',
                'MainImage' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
                'Description' => 'Dáng ôm vừa vặn, co giãn tốt.'
            ]
        ];

        foreach ($products as $prod) {
            Product::create($prod);
        }
    }
}