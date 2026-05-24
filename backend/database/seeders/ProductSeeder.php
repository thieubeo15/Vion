<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Lấy ID danh mục
        $nam       = Category::where('Name', 'Thời trang Nam')->first();
        $nu        = Category::where('Name', 'Thời trang Nữ')->first();
        $treEm     = Category::where('Name', 'Đồ Trẻ Em')->first();
        $polo      = Category::where('Name', 'Áo Polo Vion')->first();
        $aoThunNam = Category::where('Name', 'Áo thun Nam')->first();
        $quanBoNam = Category::where('Name', 'Quần bò Nam')->first();
        $vayNu     = Category::where('Name', 'Váy Nữ')->first();
        $aoSomiNu  = Category::where('Name', 'Áo sơ mi Nữ')->first();

        $products = [

            /* 1 */
            [
                'Name'             => 'Áo Thun Nam Basic Oversize',
                'CategoryID'       => $aoThunNam->CategoryID,
                'MainImage'        => 'products/ao-thun-nam-basic.jpg',
                'Description'      => 'Áo thun nam oversize form rộng thoải mái, chất cotton 100% thoáng mát, phù hợp mặc đi chơi, đi học.',
                'Material'         => 'Cotton 100%',
                'UsageInstruction' => 'Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy, phơi trong bóng mát.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S',  'Color'=>'Trắng', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>90000,  'Stock'=>50],
                    ['Size'=>'M',  'Color'=>'Trắng', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>90000,  'Stock'=>80],
                    ['Size'=>'L',  'Color'=>'Trắng', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>90000,  'Stock'=>60],
                    ['Size'=>'XL', 'Color'=>'Trắng', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>90000,  'Stock'=>40],
                    ['Size'=>'S',  'Color'=>'Đen',   'Price'=>199000, 'ImportPrice'=>90000,  'Stock'=>55],
                    ['Size'=>'M',  'Color'=>'Đen',   'Price'=>199000, 'ImportPrice'=>90000,  'Stock'=>70],
                    ['Size'=>'L',  'Color'=>'Đen',   'Price'=>199000, 'ImportPrice'=>90000,  'Stock'=>65],
                    ['Size'=>'S',  'Color'=>'Xám',   'Price'=>199000, 'ImportPrice'=>90000,  'Stock'=>45],
                    ['Size'=>'M',  'Color'=>'Xám',   'Price'=>199000, 'ImportPrice'=>90000,  'Stock'=>60],
                ],
            ],

            /* 2 */
            [
                'Name'             => 'Áo Thun Nam In Logo Vion Classic',
                'CategoryID'       => $aoThunNam->CategoryID,
                'MainImage'        => 'products/ao-thun-logo-vion.jpg',
                'Description'      => 'Áo thun in logo thương hiệu Vion phía trước, chất liệu cotton mềm mại, giữ form lâu.',
                'Material'         => 'Cotton 95%, Spandex 5%',
                'UsageInstruction' => 'Giặt lộn mặt trong, nhiệt độ ≤30°C.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'M',  'Color'=>'Navy',  'Price'=>249000, 'DiscountPrice'=>199000, 'ImportPrice'=>110000, 'Stock'=>40],
                    ['Size'=>'L',  'Color'=>'Navy',  'Price'=>249000, 'DiscountPrice'=>199000, 'ImportPrice'=>110000, 'Stock'=>50],
                    ['Size'=>'XL', 'Color'=>'Navy',  'Price'=>249000, 'DiscountPrice'=>199000, 'ImportPrice'=>110000, 'Stock'=>30],
                    ['Size'=>'M',  'Color'=>'Đen',   'Price'=>249000, 'ImportPrice'=>110000, 'Stock'=>55],
                    ['Size'=>'L',  'Color'=>'Đen',   'Price'=>249000, 'ImportPrice'=>110000, 'Stock'=>45],
                    ['Size'=>'M',  'Color'=>'Trắng', 'Price'=>249000, 'ImportPrice'=>110000, 'Stock'=>60],
                ],
            ],

            /* 3 */
            [
                'Name'             => 'Quần Jeans Nam Slim Fit Co Giãn',
                'CategoryID'       => $quanBoNam->CategoryID,
                'MainImage'        => 'products/quan-jeans-slim.jpg',
                'Description'      => 'Quần jeans nam slim fit, chất vải denim co giãn 4 chiều, tôn dáng, dễ phối đồ.',
                'Material'         => 'Denim 98%, Spandex 2%',
                'UsageInstruction' => 'Giặt lộn mặt trong, nhiệt độ ≤30°C, không vắt mạnh.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'28', 'Color'=>'Xanh đậm',  'Price'=>459000, 'DiscountPrice'=>369000, 'ImportPrice'=>200000, 'Stock'=>25],
                    ['Size'=>'29', 'Color'=>'Xanh đậm',  'Price'=>459000, 'DiscountPrice'=>369000, 'ImportPrice'=>200000, 'Stock'=>30],
                    ['Size'=>'30', 'Color'=>'Xanh đậm',  'Price'=>459000, 'DiscountPrice'=>369000, 'ImportPrice'=>200000, 'Stock'=>35],
                    ['Size'=>'31', 'Color'=>'Xanh đậm',  'Price'=>459000, 'DiscountPrice'=>369000, 'ImportPrice'=>200000, 'Stock'=>25],
                    ['Size'=>'32', 'Color'=>'Xanh đậm',  'Price'=>459000, 'DiscountPrice'=>369000, 'ImportPrice'=>200000, 'Stock'=>20],
                    ['Size'=>'30', 'Color'=>'Xanh nhạt', 'Price'=>459000, 'ImportPrice'=>200000, 'Stock'=>30],
                    ['Size'=>'31', 'Color'=>'Xanh nhạt', 'Price'=>459000, 'ImportPrice'=>200000, 'Stock'=>25],
                    ['Size'=>'32', 'Color'=>'Xanh nhạt', 'Price'=>459000, 'ImportPrice'=>200000, 'Stock'=>20],
                ],
            ],

            /* 4 */
            [
                'Name'             => 'Quần Short Nam Kaki Linen',
                'CategoryID'       => $nam->CategoryID,
                'MainImage'        => 'products/quan-short-kaki.jpg',
                'Description'      => 'Quần short nam chất liệu linen mát mẻ, thoáng khí, phù hợp mùa hè.',
                'Material'         => 'Linen 55%, Cotton 45%',
                'UsageInstruction' => 'Giặt tay nhẹ nhàng hoặc giặt máy chế độ nhẹ.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'M',  'Color'=>'Be',       'Price'=>299000, 'ImportPrice'=>130000, 'Stock'=>40],
                    ['Size'=>'L',  'Color'=>'Be',       'Price'=>299000, 'ImportPrice'=>130000, 'Stock'=>35],
                    ['Size'=>'XL', 'Color'=>'Be',       'Price'=>299000, 'ImportPrice'=>130000, 'Stock'=>25],
                    ['Size'=>'M',  'Color'=>'Xanh rêu', 'Price'=>299000, 'ImportPrice'=>130000, 'Stock'=>30],
                    ['Size'=>'L',  'Color'=>'Xanh rêu', 'Price'=>299000, 'ImportPrice'=>130000, 'Stock'=>28],
                ],
            ],

            /* 5 */
            [
                'Name'             => 'Áo Polo Vion Pique Classic',
                'CategoryID'       => $polo->CategoryID,
                'MainImage'        => 'products/ao-polo-vion.jpg',
                'Description'      => 'Áo polo nam thêu logo Vion tinh tế, chất pique cao cấp, form regular fit lịch sự.',
                'Material'         => 'Pique Cotton 100%',
                'UsageInstruction' => 'Giặt máy ≤40°C, là ủi ở nhiệt độ thấp.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S',  'Color'=>'Trắng',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>60],
                    ['Size'=>'M',  'Color'=>'Trắng',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>80],
                    ['Size'=>'L',  'Color'=>'Trắng',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>70],
                    ['Size'=>'XL', 'Color'=>'Trắng',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>50],
                    ['Size'=>'S',  'Color'=>'Navy',   'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>55],
                    ['Size'=>'M',  'Color'=>'Navy',   'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>75],
                    ['Size'=>'L',  'Color'=>'Navy',   'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>65],
                    ['Size'=>'M',  'Color'=>'Đỏ đô',  'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>40],
                    ['Size'=>'L',  'Color'=>'Đỏ đô',  'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>35],
                ],
            ],

            /* 6 */
            [
                'Name'             => 'Áo Sơ Mi Nam Dài Tay Oxford',
                'CategoryID'       => $nam->CategoryID,
                'MainImage'        => 'products/ao-so-mi-nam.jpg',
                'Description'      => 'Áo sơ mi nam dài tay chất vải Oxford bền đẹp, form slim fit, phù hợp đi làm và đi chơi.',
                'Material'         => 'Oxford Cotton 100%',
                'UsageInstruction' => 'Là ủi ở nhiệt độ thấp đến trung bình, giặt tay hoặc máy chế độ nhẹ.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S',  'Color'=>'Xanh nhạt', 'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>30],
                    ['Size'=>'M',  'Color'=>'Xanh nhạt', 'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>45],
                    ['Size'=>'L',  'Color'=>'Xanh nhạt', 'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>40],
                    ['Size'=>'XL', 'Color'=>'Xanh nhạt', 'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>25],
                    ['Size'=>'M',  'Color'=>'Trắng',     'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>50],
                    ['Size'=>'L',  'Color'=>'Trắng',     'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>45],
                    ['Size'=>'M',  'Color'=>'Xám',       'Price'=>399000, 'ImportPrice'=>170000, 'Stock'=>35],
                ],
            ],

            /* 7 */
            [
                'Name'             => 'Áo Sơ Mi Nữ Linen Dáng Rộng',
                'CategoryID'       => $aoSomiNu->CategoryID,
                'MainImage'        => 'products/ao-so-mi-nu-linen.jpg',
                'Description'      => 'Áo sơ mi nữ chất linen mềm nhẹ, form suông rộng thoải mái, phong cách tối giản thanh lịch.',
                'Material'         => 'Linen 60%, Viscose 40%',
                'UsageInstruction' => 'Giặt tay nhẹ, phơi phẳng để tránh nhăn.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S', 'Color'=>'Be',          'Price'=>329000, 'DiscountPrice'=>259000, 'ImportPrice'=>140000, 'Stock'=>45],
                    ['Size'=>'M', 'Color'=>'Be',          'Price'=>329000, 'DiscountPrice'=>259000, 'ImportPrice'=>140000, 'Stock'=>60],
                    ['Size'=>'L', 'Color'=>'Be',          'Price'=>329000, 'DiscountPrice'=>259000, 'ImportPrice'=>140000, 'Stock'=>40],
                    ['Size'=>'S', 'Color'=>'Trắng',       'Price'=>329000, 'ImportPrice'=>140000, 'Stock'=>50],
                    ['Size'=>'M', 'Color'=>'Trắng',       'Price'=>329000, 'ImportPrice'=>140000, 'Stock'=>65],
                    ['Size'=>'L', 'Color'=>'Trắng',       'Price'=>329000, 'ImportPrice'=>140000, 'Stock'=>45],
                    ['Size'=>'M', 'Color'=>'Xanh pastel', 'Price'=>329000, 'ImportPrice'=>140000, 'Stock'=>35],
                ],
            ],

            /* 8 */
            [
                'Name'             => 'Váy Midi Nữ Dáng A Vải Linen',
                'CategoryID'       => $vayNu->CategoryID,
                'MainImage'        => 'products/vay-midi-linen.jpg',
                'Description'      => 'Váy midi dáng A thanh lịch, chất linen cao cấp thoáng mát, phù hợp đi làm và dạo phố.',
                'Material'         => 'Linen 100%',
                'UsageInstruction' => 'Giặt tay hoặc giặt máy chế độ nhẹ, phơi trong bóng râm.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S', 'Color'=>'Nâu đất', 'Price'=>489000, 'DiscountPrice'=>389000, 'ImportPrice'=>200000, 'Stock'=>30],
                    ['Size'=>'M', 'Color'=>'Nâu đất', 'Price'=>489000, 'DiscountPrice'=>389000, 'ImportPrice'=>200000, 'Stock'=>40],
                    ['Size'=>'L', 'Color'=>'Nâu đất', 'Price'=>489000, 'DiscountPrice'=>389000, 'ImportPrice'=>200000, 'Stock'=>25],
                    ['Size'=>'S', 'Color'=>'Đen',     'Price'=>489000, 'ImportPrice'=>200000, 'Stock'=>35],
                    ['Size'=>'M', 'Color'=>'Đen',     'Price'=>489000, 'ImportPrice'=>200000, 'Stock'=>45],
                    ['Size'=>'L', 'Color'=>'Đen',     'Price'=>489000, 'ImportPrice'=>200000, 'Stock'=>30],
                ],
            ],

            /* 9 */
            [
                'Name'             => 'Váy Wrap Nữ Hoa Nhí',
                'CategoryID'       => $vayNu->CategoryID,
                'MainImage'        => 'products/vay-wrap-hoa-nhi.jpg',
                'Description'      => 'Váy wrap nữ họa tiết hoa nhí dễ thương, cách buộc dây linh hoạt, vải voan mềm mại.',
                'Material'         => 'Voan Polyester',
                'UsageInstruction' => 'Giặt tay nhẹ nhàng bằng nước lạnh, không vắt xoắn.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S', 'Color'=>'Hồng hoa nhí', 'Price'=>359000, 'ImportPrice'=>150000, 'Stock'=>30],
                    ['Size'=>'M', 'Color'=>'Hồng hoa nhí', 'Price'=>359000, 'ImportPrice'=>150000, 'Stock'=>40],
                    ['Size'=>'L', 'Color'=>'Hồng hoa nhí', 'Price'=>359000, 'ImportPrice'=>150000, 'Stock'=>25],
                    ['Size'=>'S', 'Color'=>'Xanh hoa nhí', 'Price'=>359000, 'ImportPrice'=>150000, 'Stock'=>28],
                    ['Size'=>'M', 'Color'=>'Xanh hoa nhí', 'Price'=>359000, 'ImportPrice'=>150000, 'Stock'=>35],
                ],
            ],

            /* 10 */
            [
                'Name'             => 'Áo Thun Nữ Crop Top Cotton',
                'CategoryID'       => $nu->CategoryID,
                'MainImage'        => 'products/ao-crop-top-nu.jpg',
                'Description'      => 'Áo crop top nữ dáng ngắn tôn dáng, chất cotton co giãn nhẹ, phù hợp mặc đi chơi hoặc ra phố.',
                'Material'         => 'Cotton 90%, Spandex 10%',
                'UsageInstruction' => 'Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S', 'Color'=>'Trắng',    'Price'=>179000, 'DiscountPrice'=>139000, 'ImportPrice'=>75000, 'Stock'=>70],
                    ['Size'=>'M', 'Color'=>'Trắng',    'Price'=>179000, 'DiscountPrice'=>139000, 'ImportPrice'=>75000, 'Stock'=>85],
                    ['Size'=>'L', 'Color'=>'Trắng',    'Price'=>179000, 'DiscountPrice'=>139000, 'ImportPrice'=>75000, 'Stock'=>55],
                    ['Size'=>'S', 'Color'=>'Đen',      'Price'=>179000, 'ImportPrice'=>75000, 'Stock'=>65],
                    ['Size'=>'M', 'Color'=>'Đen',      'Price'=>179000, 'ImportPrice'=>75000, 'Stock'=>80],
                    ['Size'=>'S', 'Color'=>'Hồng',     'Price'=>179000, 'ImportPrice'=>75000, 'Stock'=>50],
                    ['Size'=>'M', 'Color'=>'Hồng',     'Price'=>179000, 'ImportPrice'=>75000, 'Stock'=>60],
                    ['Size'=>'S', 'Color'=>'Xanh mint','Price'=>179000, 'ImportPrice'=>75000, 'Stock'=>45],
                    ['Size'=>'M', 'Color'=>'Xanh mint','Price'=>179000, 'ImportPrice'=>75000, 'Stock'=>55],
                ],
            ],

            /* 11 */
            [
                'Name'             => 'Áo Khoác Nam Bomber Basic',
                'CategoryID'       => $nam->CategoryID,
                'MainImage'        => 'products/ao-khoac-bomber.jpg',
                'Description'      => 'Áo khoác bomber nam form regular, chất liệu nỉ bông giữ ấm tốt, phù hợp mặc thu đông.',
                'Material'         => 'Nỉ bông Polyester',
                'UsageInstruction' => 'Giặt máy chế độ nhẹ ≤30°C, phơi phẳng, không sấy khô.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'M',  'Color'=>'Đen',      'Price'=>599000, 'DiscountPrice'=>479000, 'ImportPrice'=>280000, 'Stock'=>25],
                    ['Size'=>'L',  'Color'=>'Đen',      'Price'=>599000, 'DiscountPrice'=>479000, 'ImportPrice'=>280000, 'Stock'=>30],
                    ['Size'=>'XL', 'Color'=>'Đen',      'Price'=>599000, 'DiscountPrice'=>479000, 'ImportPrice'=>280000, 'Stock'=>20],
                    ['Size'=>'M',  'Color'=>'Xanh rêu', 'Price'=>599000, 'ImportPrice'=>280000, 'Stock'=>22],
                    ['Size'=>'L',  'Color'=>'Xanh rêu', 'Price'=>599000, 'ImportPrice'=>280000, 'Stock'=>18],
                ],
            ],

            /* 12 */
            [
                'Name'             => 'Hoodie Unisex Nỉ Bông Vion',
                'CategoryID'       => $nam->CategoryID,
                'MainImage'        => 'products/hoodie-vion.jpg',
                'Description'      => 'Hoodie unisex form rộng chất nỉ bông dày dặn, mũ 2 lớp ấm áp, phù hợp cả nam lẫn nữ.',
                'Material'         => 'Nỉ bông 80% Cotton, 20% Polyester',
                'UsageInstruction' => 'Giặt lộn mặt trong, nhiệt độ ≤40°C, phơi trong bóng mát.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S',  'Color'=>'Xám đậm', 'Price'=>479000, 'DiscountPrice'=>379000, 'ImportPrice'=>210000, 'Stock'=>50],
                    ['Size'=>'M',  'Color'=>'Xám đậm', 'Price'=>479000, 'DiscountPrice'=>379000, 'ImportPrice'=>210000, 'Stock'=>70],
                    ['Size'=>'L',  'Color'=>'Xám đậm', 'Price'=>479000, 'DiscountPrice'=>379000, 'ImportPrice'=>210000, 'Stock'=>60],
                    ['Size'=>'XL', 'Color'=>'Xám đậm', 'Price'=>479000, 'DiscountPrice'=>379000, 'ImportPrice'=>210000, 'Stock'=>40],
                    ['Size'=>'M',  'Color'=>'Đen',     'Price'=>479000, 'ImportPrice'=>210000, 'Stock'=>65],
                    ['Size'=>'L',  'Color'=>'Đen',     'Price'=>479000, 'ImportPrice'=>210000, 'Stock'=>55],
                    ['Size'=>'M',  'Color'=>'Trắng',   'Price'=>479000, 'ImportPrice'=>210000, 'Stock'=>45],
                    ['Size'=>'L',  'Color'=>'Trắng',   'Price'=>479000, 'ImportPrice'=>210000, 'Stock'=>40],
                ],
            ],

            /* 13 */
            [
                'Name'             => 'Đồ Bộ Trẻ Em Cotton Mềm Mại',
                'CategoryID'       => $treEm->CategoryID,
                'MainImage'        => 'products/do-bo-tre-em.jpg',
                'Description'      => 'Bộ áo thun + quần short cho bé chất cotton mềm mại, an toàn cho da bé, màu sắc tươi sáng.',
                'Material'         => 'Cotton 100% cao cấp',
                'UsageInstruction' => 'Giặt máy ở nhiệt độ thấp ≤30°C, không dùng thuốc tẩy có clo.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'2T', 'Color'=>'Xanh dương', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>85000, 'Stock'=>40],
                    ['Size'=>'3T', 'Color'=>'Xanh dương', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>85000, 'Stock'=>45],
                    ['Size'=>'4T', 'Color'=>'Xanh dương', 'Price'=>199000, 'DiscountPrice'=>159000, 'ImportPrice'=>85000, 'Stock'=>35],
                    ['Size'=>'5T', 'Color'=>'Xanh dương', 'Price'=>219000, 'DiscountPrice'=>179000, 'ImportPrice'=>95000, 'Stock'=>30],
                    ['Size'=>'2T', 'Color'=>'Vàng',       'Price'=>199000, 'ImportPrice'=>85000, 'Stock'=>35],
                    ['Size'=>'3T', 'Color'=>'Vàng',       'Price'=>199000, 'ImportPrice'=>85000, 'Stock'=>40],
                    ['Size'=>'4T', 'Color'=>'Vàng',       'Price'=>199000, 'ImportPrice'=>85000, 'Stock'=>30],
                    ['Size'=>'5T', 'Color'=>'Vàng',       'Price'=>219000, 'ImportPrice'=>95000, 'Stock'=>25],
                ],
            ],

            /* 14 */
            [
                'Name'             => 'Áo Polo Nữ Vion Pastel',
                'CategoryID'       => $polo->CategoryID,
                'MainImage'        => 'products/ao-polo-nu.jpg',
                'Description'      => 'Áo polo nữ tông màu pastel thanh lịch, chất pique mềm mịn, cổ bẻ tinh tế phù hợp đi làm và dạo phố.',
                'Material'         => 'Pique Cotton 100%',
                'UsageInstruction' => 'Giặt máy ≤40°C, là ủi ở nhiệt độ thấp.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S', 'Color'=>'Hồng pastel',  'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>35],
                    ['Size'=>'M', 'Color'=>'Hồng pastel',  'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>50],
                    ['Size'=>'L', 'Color'=>'Hồng pastel',  'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>30],
                    ['Size'=>'S', 'Color'=>'Mint',         'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>30],
                    ['Size'=>'M', 'Color'=>'Mint',         'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>45],
                    ['Size'=>'L', 'Color'=>'Mint',         'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>25],
                    ['Size'=>'M', 'Color'=>'Tím lavender', 'Price'=>319000, 'ImportPrice'=>140000, 'Stock'=>40],
                ],
            ],

            /* 15 */
            [
                'Name'             => 'Quần Nỉ Nam Jogger Vion Active',
                'CategoryID'       => $nam->CategoryID,
                'MainImage'        => 'products/quan-jogger-ni.jpg',
                'Description'      => 'Quần jogger nam chất nỉ da cá co giãn 4 chiều, ống thun tiện lợi, phù hợp tập gym và đi chơi.',
                'Material'         => 'Da cá Polyester co giãn 4 chiều',
                'UsageInstruction' => 'Giặt máy ≤40°C, không sấy khô, phơi trong bóng mát.',
                'sold_count'       => 0,
                'variants' => [
                    ['Size'=>'S',  'Color'=>'Đen',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>45],
                    ['Size'=>'M',  'Color'=>'Đen',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>60],
                    ['Size'=>'L',  'Color'=>'Đen',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>50],
                    ['Size'=>'XL', 'Color'=>'Đen',  'Price'=>349000, 'DiscountPrice'=>279000, 'ImportPrice'=>150000, 'Stock'=>35],
                    ['Size'=>'M',  'Color'=>'Xám',  'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>55],
                    ['Size'=>'L',  'Color'=>'Xám',  'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>45],
                    ['Size'=>'M',  'Color'=>'Navy', 'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>40],
                    ['Size'=>'L',  'Color'=>'Navy', 'Price'=>349000, 'ImportPrice'=>150000, 'Stock'=>35],
                ],
            ],

        ];

        $cloudinary = null;
        if (config('services.cloudinary.cloud_name') && config('services.cloudinary.api_key') && config('services.cloudinary.api_secret')) {
            try {
                $cloudinary = new \App\Services\CloudinaryService();
                $this->command->info('☁️ Đang kết nối Cloudinary để tải ảnh lên...');
            } catch (\Exception $e) {
                $this->command->error('Lỗi cấu hình Cloudinary trong Seeder: ' . $e->getMessage());
            }
        }

        foreach ($products as $data) {
            $variants = $data['variants'];
            unset($data['variants']);

            if ($cloudinary && !empty($data['MainImage'])) {
                $localPath = storage_path('app/public/' . $data['MainImage']);
                if (file_exists($localPath)) {
                    try {
                        $cloudinaryUrl = $cloudinary->upload($localPath, 'vion/products');
                        $data['MainImage'] = $cloudinaryUrl;
                    } catch (\Exception $e) {
                        $this->command->error("Lỗi upload ảnh cho {$data['Name']} lên Cloudinary: " . $e->getMessage());
                    }
                }
            }

            $product = Product::create($data);

            if (!empty($product->MainImage)) {
                $mainImageRecord = $product->images()->create(['Url' => $product->MainImage]);
                
                \App\Http\Controllers\Api\ProductSearchController::vectorizeSingleImage(
                    $mainImageRecord->ImageID ?? $mainImageRecord->id ?? $mainImageRecord->getKey(),
                    $product->MainImage
                );
            }

            foreach ($variants as $v) {
                ProductVariant::create([
                    'ProductID'     => $product->ProductID,
                    'Size'          => $v['Size'],
                    'Color'         => $v['Color'],
                    'Price'         => $v['Price'],
                    'DiscountPrice' => $v['DiscountPrice'] ?? null,
                    'ImportPrice'   => $v['ImportPrice'],
                    'Stock'         => $v['Stock'],
                ]);
            }
        }

        $this->command->info('✅ Đã tạo 15 sản phẩm với đầy đủ biến thể!');
    }
}
