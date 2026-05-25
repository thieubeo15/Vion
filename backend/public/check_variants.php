<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ProductVariant;

$variants = ProductVariant::where('ProductID', 15)->get();
foreach ($variants as $v) {
    echo "Size: " . $v->Size . " | Color: " . $v->Color . " | Stock: " . $v->Stock . "\n";
}
