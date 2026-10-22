<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthApiController extends Controller
{
    /**
     * Customer Registration: Step 1 - Validate & Dispatch Email OTP.
     * Endpoint: POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'string', 'min:6'],
            'password_confirmation' => 'required|same:password',
            'phone' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $idProofPath = $request->id_proof_name ?? $request->id_proof ?? null;
        if ($request->hasFile('id_proof_file')) {
            $file = $request->file('id_proof_file');
            $ext = $file->getClientOriginalExtension() ?: 'png';
            $fileName = 'id_' . time() . '_' . Str::random(8) . '.' . $ext;
            $file->storeAs('id_proofs', $fileName, 'public');
            $idProofPath = '/storage/id_proofs/' . $fileName;
        }

        $metadata = [
            'name' => trim($request->name),
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'id_proof_path' => $idProofPath,
        ];

        // Generate and dispatch OTP
        $otpRes = OtpService::sendOtp($email, 'registration', $metadata);

        if (!$otpRes['success']) {
            return response()->json([
                'success' => false,
                'message' => $otpRes['message'],
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => $otpRes['message'],
            'data' => [
                'email' => $email,
                'requires_otp' => true,
                'cooldown_seconds' => $otpRes['cooldown_seconds'],
                'dev_otp' => $otpRes['dev_otp'] ?? null,
            ],
        ], 200);
    }

    /**
     * Verify 6-Digit Email OTP and Complete Action.
     * Endpoint: POST /api/auth/verify-otp
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
            'purpose' => 'nullable|string|in:registration,email_change,password_reset',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification request format.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $purpose = $request->input('purpose', 'registration');
        $verifyRes = OtpService::verifyOtp($email, $request->otp, $purpose);

        if (!$verifyRes['valid']) {
            return response()->json([
                'success' => false,
                'message' => $verifyRes['message'],
            ], 422);
        }

        // Action based on verified purpose
        if ($purpose === 'registration') {
            $metadata = $verifyRes['metadata'] ?? [];

            // Check if user already exists
            $user = User::where('email', $email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $metadata['name'] ?? explode('@', $email)[0],
                    'email' => $email,
                    'password' => $metadata['password'] ?? Hash::make(Str::random(16)),
                    'role' => 'customer',
                    'phone' => $metadata['phone'] ?? null,
                    'id_proof_path' => $metadata['id_proof_path'] ?? null,
                    'status' => 'pending',
                    'is_approved' => false,
                    'is_disabled' => false,
                    'email_verified_at' => now(),
                ]);
            } else {
                $user->update(['email_verified_at' => now()]);
            }

            $token = $user->createToken('pintaara_customer_token')->plainTextToken;

            AuditLog::log('customer_registered', 'User', $user->id, null, [
                'email' => $email,
                'name' => $user->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account email verified successfully. Welcome to PINTAARA.',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'id_proof_path' => $user->id_proof_path,
                    'status' => $user->status ?? 'pending',
                    'is_approved' => (bool) ($user->is_approved ?? false),
                    'is_disabled' => (bool) ($user->is_disabled ?? false),
                ],
            ], 200);
        }

        if ($purpose === 'email_change') {
            $currentUser = $request->user();
            if ($currentUser) {
                $currentUser->update(['email' => $email]);
                AuditLog::log('email_changed', 'User', $currentUser->id, null, ['new_email' => $email]);
            }
            return response()->json([
                'success' => true,
                'message' => 'Email address successfully updated.',
            ]);
        }

        if ($purpose === 'password_reset') {
            return response()->json([
                'success' => true,
                'message' => 'OTP verified. You may now reset your password.',
                'data' => [
                    'email' => $email,
                    'verified' => true,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification completed.',
        ]);
    }

    /**
     * Resend 6-Digit Email OTP with Cooldown Enforcement.
     * Endpoint: POST /api/auth/resend-otp
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'purpose' => 'nullable|string|in:registration,email_change,password_reset',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid email address.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $purpose = $request->input('purpose', 'registration');
        $otpRes = OtpService::sendOtp($email, $purpose);

        if (!$otpRes['success']) {
            return response()->json([
                'success' => false,
                'message' => $otpRes['message'],
                'cooldown_seconds' => $otpRes['cooldown_seconds'] ?? 60,
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => $otpRes['message'],
            'data' => [
                'email' => $email,
                'cooldown_seconds' => 60,
                'dev_otp' => $otpRes['dev_otp'] ?? null,
            ],
        ]);
    }

    /**
     * Customer Login.
     * Endpoint: POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            AuditLog::log('login_failed', 'User', null, null, ['email' => $email]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address or password.',
            ], 401);
        }

        // Check if email was verified; if not, dispatch OTP and require verification
        if ($user->email_verified_at === null && $user->role === 'customer') {
            $otpRes = OtpService::sendOtp($email, 'registration');
            return response()->json([
                'success' => false,
                'requires_otp' => true,
                'email' => $email,
                'message' => 'Your email has not been verified yet. A 6-digit verification code has been dispatched.',
                'dev_otp' => $otpRes['dev_otp'] ?? null,
            ], 403);
        }

        // Check if user is disabled by administration
        if ($user->is_disabled || $user->status === 'disabled') {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Your account login has been disabled by the administration. Please contact the atelier.',
            ], 403);
        }

        // Check if user account was rejected
        if ($user->status === 'rejected') {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Your patron account application was rejected. Please contact the atelier.',
            ], 403);
        }

        $token = $user->createToken('pintaara_token')->plainTextToken;

        AuditLog::log('customer_login', 'User', $user->id, null, ['email' => $email]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'id_proof_path' => $user->id_proof_path,
                'status' => $user->status ?? 'active',
                'is_approved' => (bool) ($user->is_approved ?? true),
                'is_disabled' => (bool) ($user->is_disabled ?? false),
                'admin_notes' => $user->admin_notes,
            ],
        ]);
    }

    /**
     * Dedicated Admin Authentication.
     * Endpoint: POST /api/admin/auth/login
     */
    public function adminLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid credentials.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            AuditLog::log('admin_login_failed', 'User', null, null, ['email' => $email]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid administrative credentials.',
            ], 401);
        }

        if (!$user->isAdmin()) {
            AuditLog::log('admin_access_unauthorized', 'User', $user->id, null, ['email' => $email]);
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Account does not have administrative privileges.',
            ], 403);
        }

        $token = $user->createToken('pintaara_admin_token', ['admin'])->plainTextToken;

        AuditLog::log('admin_login_success', 'User', $user->id, null, ['email' => $email, 'role' => $user->role]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Administrative authorization granted.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Authenticated User Profile & Identity.
     * Endpoint: GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Calculate verified spend & tier server-side
        $ordersCount = $user->orders()->count();
        $totalSpend = (float) $user->orders()->sum('total_amount');

        $tier = 'Private Client';
        if ($totalSpend >= 500000) {
            $tier = 'VIP Private Client';
        } elseif ($totalSpend >= 200000) {
            $tier = 'Heritage Patron';
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'id_proof_path' => $user->id_proof_path,
                'status' => $user->status ?? 'pending',
                'is_approved' => (bool) ($user->is_approved ?? false),
                'is_disabled' => (bool) ($user->is_disabled ?? false),
                'admin_notes' => $user->admin_notes,
                'orders_count' => $ordersCount,
                'total_spend' => $totalSpend,
                'tier' => $tier,
                'email_verified' => $user->email_verified_at !== null,
            ],
        ]);
    }

    /**
     * Update Profile (Name, Phone, Address).
     * Endpoint: PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'id_proof_file' => 'nullable|file|max:15360',
            'id_proof_name' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('id_proof_file')) {
            $file = $request->file('id_proof_file');
            $ext = $file->getClientOriginalExtension() ?: 'pdf';
            $fileName = 'id_' . $user->id . '_' . time() . '.' . $ext;
            $file->storeAs('id_proofs', $fileName, 'public');
            $user->id_proof_path = '/storage/id_proofs/' . $fileName;
        } elseif (!empty($validated['id_proof_name'])) {
            $user->id_proof_path = $validated['id_proof_name'];
        }

        $old = ['name' => $user->name, 'phone' => $user->phone];
        $fieldsToUpdate = array_filter([
            'name' => $validated['name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'id_proof_path' => $user->id_proof_path,
        ], fn($val) => $val !== null);

        $user->update($fieldsToUpdate);

        AuditLog::log('profile_updated', 'User', $user->id, $old, $fieldsToUpdate);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'id_proof_path' => $user->id_proof_path,
                'status' => $user->status,
                'is_approved' => (bool) $user->is_approved,
                'is_disabled' => (bool) $user->is_disabled,
            ],
        ]);
    }

    /**
     * Change Password (Secure Server-Side Check).
     * Endpoint: POST /api/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'old_password' => 'required|string',
            'new_password' => ['required', 'string', 'min:6'],
            'new_password_confirmation' => 'required|same:new_password',
        ]);

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password does not match records.',
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);
        AuditLog::log('password_changed', 'User', $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Step 1: Send OTP for Email Change.
     * Endpoint: POST /api/auth/send-email-change-otp
     */
    public function sendEmailChangeOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'new_email' => 'required|string|email|max:255|unique:users,email',
        ]);

        $newEmail = strtolower(trim($request->new_email));
        $otpRes = OtpService::sendOtp($newEmail, 'email_change', ['user_id' => $user->id]);

        return response()->json($otpRes);
    }

    /**
     * Step 2: Verify OTP and Finalize Email Change.
     * Endpoint: POST /api/auth/verify-email-change-otp
     */
    public function verifyEmailChangeOtp(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'new_email' => 'required|string|email|max:255|unique:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $newEmail = strtolower(trim($request->new_email));
        $verifyRes = OtpService::verifyOtp($newEmail, $request->otp, 'email_change');

        if (!$verifyRes['valid']) {
            return response()->json([
                'success' => false,
                'message' => $verifyRes['message'],
            ], 422);
        }

        $oldEmail = $user->email;
        $user->update(['email' => $newEmail]);

        AuditLog::log('email_changed', 'User', $user->id, ['email' => $oldEmail], ['email' => $newEmail]);

        return response()->json([
            'success' => true,
            'message' => 'Email address successfully updated.',
            'user' => $user,
        ]);
    }

    /**
     * Request Password Reset OTP.
     * Endpoint: POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|string|email']);
        $email = strtolower(trim($request->email));

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No registered account found with this email address.',
            ], 404);
        }

        $otpRes = OtpService::sendOtp($email, 'password_reset', ['user_id' => $user->id]);

        if (!$otpRes['success']) {
            return response()->json([
                'success' => false,
                'message' => $otpRes['message'] ?? 'Please wait before requesting a new code.',
                'cooldown_seconds' => $otpRes['cooldown_seconds'] ?? 60,
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit verification code has been dispatched to your email.',
            'dev_otp' => $otpRes['dev_otp'] ?? null,
            'cooldown_seconds' => $otpRes['cooldown_seconds'] ?? 60,
        ]);
    }

    /**
     * Reset Password using Verified OTP.
     * Endpoint: POST /api/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'string', 'min:6'],
            'password_confirmation' => 'required|same:password',
        ]);

        $email = strtolower(trim($request->email));

        // Check if recently verified via verifyOtp (within 15 minutes) or verify now
        $recentVerified = \App\Models\EmailOtp::where('email', $email)
            ->where('purpose', 'password_reset')
            ->whereNotNull('used_at')
            ->where('used_at', '>=', now()->subMinutes(15))
            ->orderBy('id', 'desc')
            ->first();

        $valid = false;
        if ($recentVerified && Hash::check($request->otp, $recentVerified->otp_hash)) {
            $valid = true;
        } else {
            $verifyRes = OtpService::verifyOtp($email, $request->otp, 'password_reset');
            $valid = $verifyRes['valid'] ?? false;
        }

        if (!$valid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code. Please request a new code.',
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Invalidate used OTPs for this email and purpose
        \App\Models\EmailOtp::where('email', $email)->where('purpose', 'password_reset')->delete();

        AuditLog::log('password_reset_completed', 'User', $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. You may now sign in with your new credentials.',
        ]);
    }

    /**
     * Session Logout.
     * Endpoint: POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Logged out successfully.',
        ]);
    }
}
