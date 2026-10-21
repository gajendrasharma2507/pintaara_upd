<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAddressApiController extends Controller
{
    /**
     * List authenticated user's addresses.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $addresses = $user->addresses()->orderByDesc('is_default')->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $addresses,
        ]);
    }

    /**
     * Store new address.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $recipientName = $request->recipient_name ?? $request->fullName ?? $request->name ?? ($user->name ?? 'Patron');
        $phone = $request->phone ?? $request->contact ?? ($user->phone ?? '9999999999');
        $line1 = $request->address_line1 ?? $request->address1 ?? $request->line1 ?? '';
        $line2 = $request->address_line2 ?? $request->address2 ?? $request->line2 ?? null;
        $city = $request->city ?? '';
        $state = $request->state ?? $request->stateProvince ?? '';
        $pincode = $request->pincode ?? $request->pin ?? $request->pinCode ?? '';
        $country = $request->country ?? 'India';
        $isDefault = (bool) ($request->is_default ?? $request->makeDefault ?? false);

        if (empty($line1) || empty($city) || empty($pincode)) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Address line, city, and pin code are required.'
            ], 422);
        }

        if ($isDefault) {
            $user->addresses()->update(['is_default' => false]);
        }

        // Avoid duplicating exact same address
        $existing = $user->addresses()
            ->where('address_line1', $line1)
            ->where('pincode', $pincode)
            ->first();

        if ($existing) {
            $existing->update([
                'recipient_name' => $recipientName,
                'phone' => $phone,
                'address_line2' => $line2,
                'city' => $city,
                'state' => $state,
                'country' => $country,
                'is_default' => $isDefault ? true : $existing->is_default,
            ]);
            $address = $existing;
        } else {
            $address = $user->addresses()->create([
                'recipient_name' => $recipientName,
                'phone' => $phone,
                'address_line1' => $line1,
                'address_line2' => $line2,
                'city' => $city,
                'state' => $state,
                'pincode' => $pincode,
                'country' => $country,
                'is_default' => $isDefault,
            ]);
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Address saved successfully.',
            'data' => $address,
        ], 201);
    }

    /**
     * Update address.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $address = $user->addresses()->find($id);
        if (!$address) {
            return response()->json(['success' => false, 'message' => 'Address not found or unauthorized.'], 404);
        }

        $validated = $request->validate([
            'recipient_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'is_default' => 'nullable|boolean',
        ]);

        if (!empty($validated['is_default'])) {
            $user->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update(array_filter($validated, fn($v) => $v !== null));

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Address updated successfully.',
            'data' => $address,
        ]);
    }

    /**
     * Delete address.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $address = $user->addresses()->find($id);
        if (!$address) {
            return response()->json(['success' => false, 'message' => 'Address not found or unauthorized.'], 404);
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Address deleted successfully.',
        ]);
    }
}
