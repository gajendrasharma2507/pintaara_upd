<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerApiController extends Controller
{
    /**
     * Get list of customers / patrons with order analytics, verification, and tier status.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search', '');

        // 1. Fetch registered users who are customers or patrons
        $users = User::all();

        // 2. Fetch all orders grouped by customer email
        $orders = Order::all();
        $ordersByEmail = $orders->groupBy(function ($o) {
            return strtolower(trim($o->customer_email ?? ''));
        });

        $customersList = [];
        $processedEmails = [];

        foreach ($users as $user) {
            $userEmailLower = strtolower(trim($user->email));
            $processedEmails[$userEmailLower] = true;

            $userOrders = $ordersByEmail->get($userEmailLower, collect());
            $ordersCount = $userOrders->count();
            $totalSpendVal = $userOrders->sum('total_amount');

            // Determine client tier
            $tier = 'Private Client';
            if ($totalSpendVal >= 500000) {
                $tier = 'VIP Private Client';
            } elseif ($totalSpendVal >= 200000) {
                $tier = 'Heritage Patron';
            }

            // Extract city from orders if available
            $city = 'India';
            $firstOrder = $userOrders->first();
            if ($firstOrder && !empty($firstOrder->shipping_address)) {
                $parts = explode(',', $firstOrder->shipping_address);
                if (count($parts) >= 2) {
                    $city = trim($parts[count($parts) - 2]);
                }
            }

            $customersList[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? ($firstOrder ? $firstOrder->customer_phone : '—'),
                'city' => $city,
                'ordersCount' => $ordersCount,
                'totalSpend' => '₹' . number_format($totalSpendVal, 0, '.', ','),
                'totalSpendRaw' => (float) $totalSpendVal,
                'tier' => $tier,
                'isRegistered' => true,
                'status' => $user->status ?? ($user->is_disabled ? 'disabled' : ($user->is_approved ? 'active' : 'pending')),
                'is_approved' => (bool) ($user->is_approved ?? true),
                'is_disabled' => (bool) ($user->is_disabled ?? false),
                'id_proof_path' => $user->id_proof_path,
                'admin_notes' => $user->admin_notes,
                'role' => $user->role ?? 'customer',
                'createdAt' => $user->created_at ? $user->created_at->format('d M Y') : 'Recent',
            ];
        }

        // 3. Include any guest patrons who placed orders but haven't created an explicit user account
        foreach ($ordersByEmail as $emailKey => $clientOrders) {
            if (empty($emailKey) || isset($processedEmails[$emailKey])) {
                continue;
            }

            $firstOrder = $clientOrders->first();
            $ordersCount = $clientOrders->count();
            $totalSpendVal = $clientOrders->sum('total_amount');

            $tier = 'Private Client';
            if ($totalSpendVal >= 500000) {
                $tier = 'VIP Private Client';
            } elseif ($totalSpendVal >= 200000) {
                $tier = 'Heritage Patron';
            }

            $city = 'India';
            if (!empty($firstOrder->shipping_address)) {
                $parts = explode(',', $firstOrder->shipping_address);
                if (count($parts) >= 2) {
                    $city = trim($parts[count($parts) - 2]);
                }
            }

            $customersList[] = [
                'id' => 'guest_' . md5($emailKey),
                'name' => $firstOrder->customer_name ?? 'Patron',
                'email' => $firstOrder->customer_email,
                'phone' => $firstOrder->customer_phone ?? '—',
                'city' => $city,
                'ordersCount' => $ordersCount,
                'totalSpend' => '₹' . number_format($totalSpendVal, 0, '.', ','),
                'totalSpendRaw' => (float) $totalSpendVal,
                'tier' => $tier,
                'isRegistered' => false,
                'status' => 'guest',
                'is_approved' => true,
                'is_disabled' => false,
                'id_proof_path' => null,
                'admin_notes' => null,
                'role' => 'patron',
                'createdAt' => $firstOrder->created_at ? $firstOrder->created_at->format('d M Y') : 'Recent',
            ];
        }

        // Search filter if provided
        if (!empty($search)) {
            $searchLower = strtolower($search);
            $customersList = array_values(array_filter($customersList, function ($c) use ($searchLower) {
                return str_contains(strtolower($c['name']), $searchLower) ||
                       str_contains(strtolower($c['email']), $searchLower) ||
                       str_contains(strtolower($c['phone']), $searchLower) ||
                       str_contains(strtolower($c['status']), $searchLower) ||
                       str_contains(strtolower($c['tier']), $searchLower);
            }));
        }

        return response()->json([
            'status' => 'success',
            'count' => count($customersList),
            'data' => $customersList,
        ]);
    }

    /**
     * Customer details including order history.
     */
    public function show(string $id): JsonResponse
    {
        $user = is_numeric($id) ? User::find((int) $id) : null;
        $email = $user ? $user->email : null;

        $orders = collect();
        if ($email) {
            $orders = Order::where('customer_email', $email)->orderBy('created_at', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user,
                'orders' => $orders,
            ],
        ]);
    }

    /**
     * Update customer verification, approval, and login status.
     * Actions:
     * - 'approve': marks profile as approved, status='active', is_disabled=false
     * - 'reject': marks profile as rejected, status='rejected', is_disabled=true, revokes tokens
     * - 'disable': disables login, status='disabled', is_disabled=true, revokes tokens
     * - 'enable': re-enables login, is_disabled=false, status='active' (or 'pending' if not approved)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Guest accounts cannot be directly modified.',
            ], 400);
        }

        $user = User::findOrFail((int) $id);
        $action = $request->input('action') ?? $request->input('status');
        $notes = $request->input('notes');

        if ($notes !== null) {
            $user->admin_notes = $notes;
        }

        switch (strtolower($action)) {
            case 'approve':
            case 'approved':
                $user->is_approved = true;
                $user->is_disabled = false;
                $user->status = 'active';
                $message = "Patron profile for {$user->name} has been approved.";
                break;

            case 'reject':
            case 'rejected':
                $user->is_approved = false;
                $user->is_disabled = true;
                $user->status = 'rejected';
                // Revoke active sessions
                $user->tokens()->delete();
                $message = "Patron profile for {$user->name} has been rejected.";
                break;

            case 'disable':
            case 'disabled':
                $user->is_disabled = true;
                $user->status = 'disabled';
                // Revoke active sessions
                $user->tokens()->delete();
                $message = "Account login for {$user->name} has been disabled.";
                break;

            case 'enable':
            case 'active':
                $user->is_disabled = false;
                $user->status = $user->is_approved ? 'active' : 'pending';
                $message = "Account login for {$user->name} has been re-enabled.";
                break;

            default:
                return response()->json([
                    'status' => 'error',
                    'message' => "Invalid action '{$action}'. Allowed: approve, reject, disable, enable.",
                ], 422);
        }

        $user->save();

        AuditLog::log('customer_status_updated', 'User', $user->id, null, [
            'action' => $action,
            'status' => $user->status,
            'is_approved' => $user->is_approved,
            'is_disabled' => $user->is_disabled,
            'admin_notes' => $user->admin_notes,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'is_approved' => $user->is_approved,
                'is_disabled' => $user->is_disabled,
                'admin_notes' => $user->admin_notes,
            ],
        ]);
    }

    /**
     * Delete patron record.
     */
    public function destroy(string $id): JsonResponse
    {
        if (!is_numeric($id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Guest accounts cannot be deleted directly.',
            ], 400);
        }

        $user = User::findOrFail((int) $id);
        $userName = $user->name;

        // Revoke tokens and delete user
        $user->tokens()->delete();
        $user->delete();

        AuditLog::log('customer_deleted', 'User', (int) $id, null, ['name' => $userName]);

        return response()->json([
            'status' => 'success',
            'message' => "Customer {$userName} has been removed successfully.",
        ]);
    }

    /**
     * Serve raw patron identity document file directly (PDF, image, etc.) in new tab.
     */
    public function viewDocument(string $id)
    {
        if (!is_numeric($id)) {
            abort(404, 'Invalid patron ID.');
        }

        $user = User::findOrFail((int) $id);
        $path = $user->id_proof_path;

        if (!$path) {
            abort(404, 'No identity document found for this patron.');
        }

        // Direct file in storage
        if (str_starts_with($path, '/storage/')) {
            $relativePath = str_replace('/storage/', 'public/', $path);
            if (\Illuminate\Support\Facades\Storage::exists($relativePath)) {
                return response()->file(\Illuminate\Support\Facades\Storage::path($relativePath));
            }
        }

        $cleanFileName = basename($path);
        if (\Illuminate\Support\Facades\Storage::exists('public/id_proofs/' . $cleanFileName)) {
            return response()->file(\Illuminate\Support\Facades\Storage::path('public/id_proofs/' . $cleanFileName));
        }

        abort(404, 'Uploaded document file does not exist on disk.');
    }
}
