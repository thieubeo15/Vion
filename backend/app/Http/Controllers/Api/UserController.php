<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;    // THÊM DÒNG NÀY
use App\Models\Product;  // THÊM DÒNG NÀY
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    // Lấy thông tin user đang đăng nhập
    public function profile() 
    {
        return response()->json(Auth::user());
    }

    // Cập nhật thông tin cá nhân
    public function updateProfile(Request $request) 
    {
        $user = Auth::user();
        $request->validate([
            'FullName' => 'sometimes|string|max:255',
            'Phone'    => 'sometimes|string|max:20',
            'Address'  => 'sometimes|string',
            'Birthday' => 'sometimes|nullable|date',
        ]);

        $user->update($request->only('FullName', 'Phone', 'Address', 'Birthday'));
        return response()->json(['success' => true, 'message' => 'Vion đã cập nhật hồ sơ!', 'user' => $user]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if (!Hash::check($request->current_password, $user->Password)) {
            return response()->json(['success' => false, 'message' => 'Mật khẩu hiện tại không đúng.'], 422);
        }

        $user->update(['Password' => Hash::make($request->new_password)]);
        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công!']);
    }

    // --- CÁC HÀM QUẢN TRỊ ---
    public function index() { return response()->json(User::all()); }
    
    public function show($id) {
        $u = User::find($id);
        return $u ? response()->json($u) : response()->json(['message' => 'Không tìm thấy'], 404);
    }

    public function getStats() {
        // Kiểm tra quyền Admin
        if (Auth::user()->Role !== 'Admin') {
            return response()->json(['message' => 'Quyền truy cập bị từ chối!'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'totalRevenue' => (float)Order::whereIn('Status', ['Success', 'Completed', 'Paid'])->sum('TotalAmount'),
                'totalOrders' => Order::count(),
                'totalCustomers' => User::where('Role', 'User')->count(),
                'totalProducts' => Product::count(),
                // Lấy thêm 5 đơn hàng mới nhất để Dashboard nhìn cho xịn
                'recentOrders' => Order::with('user')->orderBy('created_at', 'desc')->take(5)->get()
            ]
        ]);
    }

    // --- CÁC HÀM QUẢN LÝ USER DÀNH CHO ADMIN ---

    // Lấy danh sách user kèm phân trang và tìm kiếm
    public function indexAdmin(Request $request)
    {
        $query = User::query();

        // Tìm kiếm theo Email, FullName, Phone
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('Email', 'like', "%{$search}%")
                  ->orWhere('FullName', 'like', "%{$search}%")
                  ->orWhere('Phone', 'like', "%{$search}%");
            });
        }

        // Lọc theo Role
        if ($request->filled('role')) {
            $query->where('Role', $request->input('role'));
        }

        // Phân trang mặc định 10 dòng
        $users = $query->orderBy('UserID', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    // Admin tạo tài khoản mới
    public function storeAdmin(Request $request)
    {
        $request->validate([
            'Email' => 'required|email|unique:users,Email',
            'Password' => 'required|string|min:6',
            'FullName' => 'required|string|max:255',
            'Phone' => 'nullable|string|max:20',
            'Address' => 'nullable|string',
            'Birthday' => 'nullable|date',
            'Role' => 'required|in:Admin,Customer',
        ], [
            'Email.required' => 'Vui lòng nhập Email.',
            'Email.email' => 'Email không đúng định dạng.',
            'Email.unique' => 'Email này đã tồn tại trong hệ thống.',
            'Password.required' => 'Vui lòng nhập mật khẩu.',
            'Password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.',
            'FullName.required' => 'Vui lòng nhập họ và tên.',
            'Role.required' => 'Vui lòng chọn vai trò.',
            'Role.in' => 'Vai trò phải là Admin hoặc Customer.',
        ]);

        $user = User::create([
            'Email' => $request->Email,
            'Password' => Hash::make($request->Password),
            'FullName' => $request->FullName,
            'Phone' => $request->Phone,
            'Address' => $request->Address,
            'Birthday' => $request->Birthday,
            'Role' => $request->Role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo tài khoản thành công!',
            'user' => $user
        ], 201);
    }

    // Admin cập nhật thông tin và quyền của user
    public function updateAdmin(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng này.'
            ], 404);
        }

        $request->validate([
            'Email' => 'sometimes|required|email|unique:users,Email,' . $id . ',UserID',
            'Password' => 'nullable|string|min:6',
            'FullName' => 'sometimes|required|string|max:255',
            'Phone' => 'nullable|string|max:20',
            'Address' => 'nullable|string',
            'Birthday' => 'nullable|date',
            'Role' => 'sometimes|required|in:Admin,Customer',
        ], [
            'Email.required' => 'Email không được để trống.',
            'Email.email' => 'Email không đúng định dạng.',
            'Email.unique' => 'Email đã được sử dụng bởi tài khoản khác.',
            'Password.min' => 'Mật khẩu phải từ 6 ký tự trở lên.',
            'FullName.required' => 'Họ và tên không được để trống.',
            'Role.required' => 'Vai trò không được để trống.',
            'Role.in' => 'Vai trò phải là Admin hoặc Customer.',
        ]);

        $updateData = $request->only('Email', 'FullName', 'Phone', 'Address', 'Birthday', 'Role');

        // Nếu admin cập nhật mật khẩu mới cho user
        if ($request->filled('Password')) {
            $updateData['Password'] = Hash::make($request->Password);
        }

        // Ngăn Admin tự hạ quyền của chính mình để tránh khóa hệ thống
        if ($user->UserID === Auth::id() && isset($updateData['Role']) && $updateData['Role'] !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể tự hạ quyền Admin của chính mình!'
            ], 400);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công!',
            'user' => $user
        ]);
    }

    // Admin xóa tài khoản
    public function destroyAdmin($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng này.'
            ], 404);
        }

        // Chặn tự xóa chính mình
        if ($user->UserID === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể tự xóa tài khoản của chính mình!'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa tài khoản thành công!'
        ]);
    }
}