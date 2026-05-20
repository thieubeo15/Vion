<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Models\UserVoucher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    /**
     * Áp dụng mã giảm giá - Kiểm tra và tính toán số tiền được giảm
     * POST /api/voucher/apply
     */
    public function apply(Request $request)
    {
        $request->validate([
            'code'         => 'required|string',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();

        // Tìm voucher theo mã
        $voucher = Voucher::where('Code', $request->code)->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không tồn tại!'
            ], 404);
        }

        // Kiểm tra trạng thái kích hoạt
        if (!$voucher->IsActive) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã bị vô hiệu hóa!'
            ], 400);
        }

        // Kiểm tra ngày hiệu lực
        $now = now();
        if ($now->lt($voucher->StartDate)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá chưa đến thời gian sử dụng!'
            ], 400);
        }

        if ($now->gt($voucher->EndDate)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết hạn!'
            ], 400);
        }

        // Kiểm tra giới hạn sử dụng tổng
        if ($voucher->UsageLimit !== null && $voucher->UsedCount >= $voucher->UsageLimit) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng!'
            ], 400);
        }

        // Kiểm tra giới hạn sử dụng trên mỗi user
        if ($user) {
            $userUsageCount = VoucherUsage::where('VoucherID', $voucher->VoucherID)
                ->where('UserID', $user->UserID)
                ->count();

            if ($userUsageCount >= $voucher->PerUserLimit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn đã sử dụng mã giảm giá này đủ số lần cho phép!'
                ], 400);
            }
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if ($request->total_amount < $voucher->MinOrderAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format($voucher->MinOrderAmount) . 'đ để sử dụng mã này!'
            ], 400);
        }

        // Tính toán số tiền giảm
        $discountAmount = 0;
        if ($voucher->Type === 'fixed') {
            $discountAmount = $voucher->Value;
        } else {
            // percent
            $discountAmount = ($request->total_amount * $voucher->Value) / 100;
            // Giới hạn theo MaxDiscount nếu có
            if ($voucher->MaxDiscount !== null && $discountAmount > $voucher->MaxDiscount) {
                $discountAmount = $voucher->MaxDiscount;
            }
        }

        // Đảm bảo không giảm nhiều hơn tổng đơn hàng
        if ($discountAmount > $request->total_amount) {
            $discountAmount = $request->total_amount;
        }

        return response()->json([
            'success'         => true,
            'discount_amount' => round($discountAmount, 2),
            'voucher_info'    => [
                'VoucherID'      => $voucher->VoucherID,
                'Code'           => $voucher->Code,
                'Type'           => $voucher->Type,
                'Value'          => $voucher->Value,
                'MaxDiscount'    => $voucher->MaxDiscount,
                'MinOrderAmount' => $voucher->MinOrderAmount,
                'EndDate'        => $voucher->EndDate,
            ]
        ]);
    }

    /**
     * Danh sách tất cả voucher (Admin)
     * GET /api/vouchers
     */
    public function index()
    {
        $vouchers = Voucher::orderBy('created_at', 'desc')->get();
        return response()->json($vouchers);
    }

    /**
     * Tạo voucher mới (Admin)
     * POST /api/vouchers
     */
    public function store(Request $request)
    {
        $request->validate([
            'Code'           => 'required|string|max:50|unique:vouchers,Code',
            'Type'           => 'required|in:fixed,percent',
            'Value'          => 'required|numeric|min:0',
            'MaxDiscount'    => 'nullable|numeric|min:0',
            'MinOrderAmount' => 'nullable|numeric|min:0',
            'UsageLimit'     => 'nullable|integer|min:1',
            'PerUserLimit'   => 'nullable|integer|min:1',
            'StartDate'      => 'required|date',
            'EndDate'        => 'required|date|after:StartDate',
            'IsActive'       => 'nullable|boolean',
            'Description'    => 'nullable|string',
        ]);

        $voucher = Voucher::create($request->only([
            'Code', 'Type', 'Value', 'MaxDiscount', 'MinOrderAmount',
            'UsageLimit', 'PerUserLimit', 'StartDate', 'EndDate',
            'IsActive', 'Description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tạo mã giảm giá thành công!',
            'voucher' => $voucher
        ], 201);
    }

    /**
     * Cập nhật voucher (Admin)
     * PUT /api/vouchers/{id}
     */
    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá!'], 404);
        }

        $request->validate([
            'Code'           => 'sometimes|string|max:50|unique:vouchers,Code,' . $id . ',VoucherID',
            'Type'           => 'sometimes|in:fixed,percent',
            'Value'          => 'sometimes|numeric|min:0',
            'MaxDiscount'    => 'nullable|numeric|min:0',
            'MinOrderAmount' => 'nullable|numeric|min:0',
            'UsageLimit'     => 'nullable|integer|min:1',
            'PerUserLimit'   => 'nullable|integer|min:1',
            'StartDate'      => 'sometimes|date',
            'EndDate'        => 'sometimes|date|after:StartDate',
            'IsActive'       => 'nullable|boolean',
            'Description'    => 'nullable|string',
        ]);

        $voucher->update($request->only([
            'Code', 'Type', 'Value', 'MaxDiscount', 'MinOrderAmount',
            'UsageLimit', 'PerUserLimit', 'StartDate', 'EndDate',
            'IsActive', 'Description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật mã giảm giá thành công!',
            'voucher' => $voucher
        ]);
    }

    /**
     * Xóa voucher (Admin)
     * DELETE /api/vouchers/{id}
     */
    public function destroy($id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá!'], 404);
        }

        $voucher->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa mã giảm giá!'
        ]);
    }

    /**
     * Danh sách voucher đã lưu của user đang đăng nhập
     * GET /api/my-vouchers
     */
    public function myVouchers(Request $request)
    {
        $user = Auth::user();
        $userVouchers = UserVoucher::where('UserID', $user->UserID)
            ->with('voucher')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($uv) {
                $voucher = $uv->voucher;
                if (!$voucher) return null;
                return [
                    'id' => $uv->id,
                    'voucher_id' => $voucher->VoucherID,
                    'code' => $voucher->Code,
                    'type' => $voucher->Type,
                    'value' => $voucher->Value,
                    'max_discount' => $voucher->MaxDiscount,
                    'min_order' => $voucher->MinOrderAmount,
                    'description' => $voucher->Description,
                    'end_date' => $voucher->EndDate,
                    'source' => $uv->Source,
                    'is_used' => $uv->IsUsed,
                    'is_active' => $voucher->IsActive,
                    'is_expired' => now()->gt($voucher->EndDate),
                    'status' => $uv->IsUsed ? 'used' : (now()->gt($voucher->EndDate) ? 'expired' : ($voucher->IsActive ? 'active' : 'inactive')),
                ];
            })->filter();

        return response()->json(['success' => true, 'data' => $userVouchers->values()]);
    }

    /**
     * Danh sách voucher công khai (cho khách hàng xem và lưu)
     * GET /api/vouchers/public
     */
    public function publicVouchers()
    {
        $vouchers = Voucher::where('IsActive', true)
            ->where('Visibility', 'public')
            ->where('EndDate', '>=', now())
            ->where('StartDate', '<=', now())
            ->where(function($q) {
                $q->whereNull('UsageLimit')->orWhereColumn('UsedCount', '<', 'UsageLimit');
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $vouchers]);
    }

    /**
     * Lưu voucher vào ví của user
     * POST /api/vouchers/{id}/save
     */
    public function saveVoucher($id)
    {
        $user = Auth::user();
        $voucher = Voucher::find($id);

        if (!$voucher) return response()->json(['success' => false, 'message' => 'Voucher không tồn tại!'], 404);
        if ($voucher->Visibility !== 'public') return response()->json(['success' => false, 'message' => 'Voucher này không thể lưu!'], 403);

        $exists = UserVoucher::where('UserID', $user->UserID)->where('VoucherID', $id)->exists();
        if ($exists) return response()->json(['success' => false, 'message' => 'Bạn đã lưu voucher này rồi!'], 400);

        UserVoucher::create(['UserID' => $user->UserID, 'VoucherID' => $id, 'Source' => 'saved']);

        return response()->json(['success' => true, 'message' => 'Đã lưu voucher vào ví!']);
    }

    /**
     * Admin tặng voucher cho nhiều user
     * POST /api/vouchers/{id}/gift
     */
    public function giftVoucher(Request $request, $id)
    {
        $request->validate(['user_ids' => 'required|array|min:1', 'source' => 'nullable|string']);
        $voucher = Voucher::find($id);
        if (!$voucher) return response()->json(['success' => false, 'message' => 'Voucher không tồn tại!'], 404);

        $source = $request->source ?? 'gifted';
        $count = 0;
        foreach ($request->user_ids as $userId) {
            $exists = UserVoucher::where('UserID', $userId)->where('VoucherID', $id)->exists();
            if (!$exists) {
                UserVoucher::create(['UserID' => $userId, 'VoucherID' => $id, 'Source' => $source]);
                $count++;
            }
        }

        return response()->json(['success' => true, 'message' => "Đã tặng voucher cho {$count} người dùng!", 'count' => $count]);
    }

    /**
     * Admin tặng voucher ngẫu nhiên cho N user
     * POST /api/vouchers/{id}/gift-random
     */
    public function giftRandom(Request $request, $id)
    {
        $request->validate(['count' => 'required|integer|min:1|max:1000']);
        $voucher = Voucher::find($id);
        if (!$voucher) return response()->json(['success' => false, 'message' => 'Voucher không tồn tại!'], 404);

        $existingUserIds = UserVoucher::where('VoucherID', $id)->pluck('UserID');
        $users = User::whereNotIn('UserID', $existingUserIds)->where('Role', '!=', 'Admin')->inRandomOrder()->limit($request->count)->get();

        $count = 0;
        foreach ($users as $user) {
            UserVoucher::create(['UserID' => $user->UserID, 'VoucherID' => $id, 'Source' => 'gifted']);
            $count++;
        }

        return response()->json(['success' => true, 'message' => "Đã tặng ngẫu nhiên cho {$count} người dùng!", 'count' => $count]);
    }

    /**
     * Admin tặng voucher sinh nhật cho user có sinh nhật hôm nay
     * POST /api/vouchers/{id}/gift-birthday
     */
    public function giftBirthday($id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) return response()->json(['success' => false, 'message' => 'Voucher không tồn tại!'], 404);

        $today = now();
        $users = User::whereMonth('Birthday', $today->month)->whereDay('Birthday', $today->day)->where('Role', '!=', 'Admin')->get();

        $count = 0;
        foreach ($users as $user) {
            $exists = UserVoucher::where('UserID', $user->UserID)->where('VoucherID', $id)->exists();
            if (!$exists) {
                UserVoucher::create(['UserID' => $user->UserID, 'VoucherID' => $id, 'Source' => 'birthday']);
                $count++;
            }
        }

        return response()->json(['success' => true, 'message' => "Đã tặng sinh nhật cho {$count} người dùng!", 'count' => $count]);
    }

    /**
     * Danh sách tất cả user (cho Admin chọn khi tặng voucher)
     * GET /api/users/list
     */
    public function allUsers()
    {
        $users = User::select('UserID', 'FullName', 'Email', 'Birthday')->where('Role', '!=', 'Admin')->orderBy('FullName')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }
}
