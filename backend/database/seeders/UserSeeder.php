<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo tài khoản Admin
        User::create([
            'Email' => 'admin@gmail.vn',
            'Password' => Hash::make('123456'),
            'Role' => 'Admin',
            'FullName' => 'Quản trị viên Vion',
            'Phone' => '0987654321'
        ]);

        // Tạo tài khoản Khách hàng
        User::create([
            'Email' => 'kh1@gmail.com',
            'Password' => Hash::make('123456'),
            'Role' => 'Customer',
            'FullName' => 'Nguyễn Văn Khách',
            'Phone' => '0123456789',
            'Address' => 'Hà Nội, Việt Nam'
        ]);
    }
}