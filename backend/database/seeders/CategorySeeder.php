<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Tạo các danh mục cha
        $nam = Category::create(['Name' => 'Thời trang Nam']);
        $nu = Category::create(['Name' => 'Thời trang Nữ']);
        $treEm = Category::create(['Name' => 'Đồ Trẻ Em']);
        $polo = Category::create(['Name' => 'Áo Polo Vion']);

        // Tạo các danh mục con
        Category::create(['Name' => 'Áo thun Nam', 'ParentID' => $nam->CategoryID]);
        Category::create(['Name' => 'Quần bò Nam', 'ParentID' => $nam->CategoryID]);
        
        Category::create(['Name' => 'Váy Nữ', 'ParentID' => $nu->CategoryID]);
        Category::create(['Name' => 'Áo sơ mi Nữ', 'ParentID' => $nu->CategoryID]);
    }
}