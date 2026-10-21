<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CustomerDesign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerDesignApiController extends Controller
{
    /**
     * List designs belonging to the authenticated customer.
     * Endpoint: GET /api/user/designs
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $designs = CustomerDesign::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $designs,
        ]);
    }

    /**
     * Store new customer bespoke design commission.
     * Endpoint: POST /api/user/designs
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string|max:3000',
            'metal_preference' => 'nullable|string|max:100',
            'gem_preference' => 'nullable|string|max:100',
            'media' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240', // 10MB max, safe mime types
        ]);

        $mediaPath = null;
        if ($request->hasFile('media') && $request->file('media')->isValid()) {
            $file = $request->file('media');
            $extension = strtolower($file->getClientOriginalExtension());
            $safeFilename = 'design_' . Str::random(24) . '.' . $extension;
            $destinationDir = public_path('uploads/designs');
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            $file->move($destinationDir, $safeFilename);
            $mediaPath = '/uploads/designs/' . $safeFilename;
        }

        $design = CustomerDesign::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'notes' => $validated['notes'] ?? null,
            'metal_preference' => $validated['metal_preference'] ?? null,
            'gem_preference' => $validated['gem_preference'] ?? null,
            'media_path' => $mediaPath,
            'status' => 'submitted',
        ]);

        AuditLog::log('customer_design_created', 'CustomerDesign', $design->id, null, [
            'user_id' => $user->id,
            'title' => $design->title,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Design log entry created successfully.',
            'data' => $design,
        ], 201);
    }

    /**
     * Show single design (IDOR Protected: customer can only view their own design).
     * Endpoint: GET /api/user/designs/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $design = CustomerDesign::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$design) {
            return response()->json(['success' => false, 'message' => 'Design record not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $design,
        ]);
    }

    /**
     * Update customer design entry.
     * Endpoint: PUT /api/user/designs/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $design = CustomerDesign::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$design) {
            return response()->json(['success' => false, 'message' => 'Design record not found.'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:3000',
            'metal_preference' => 'nullable|string|max:100',
            'gem_preference' => 'nullable|string|max:100',
            'media' => 'nullable|file|mimes:jpeg,png,jpg,webp,pdf|max:10240',
        ]);

        if ($request->hasFile('media') && $request->file('media')->isValid()) {
            $file = $request->file('media');
            $extension = strtolower($file->getClientOriginalExtension());
            $safeFilename = 'design_' . Str::random(24) . '.' . $extension;
            $destinationDir = public_path('uploads/designs');
            if (!file_exists($destinationDir)) {
                mkdir($destinationDir, 0755, true);
            }
            $file->move($destinationDir, $safeFilename);
            $validated['media_path'] = '/uploads/designs/' . $safeFilename;
        }

        $design->update(array_filter($validated, fn($v) => $v !== null));

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Design updated successfully.',
            'data' => $design,
        ]);
    }

    /**
     * Delete customer design entry.
     * Endpoint: DELETE /api/user/designs/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $design = CustomerDesign::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$design) {
            return response()->json(['success' => false, 'message' => 'Design record not found.'], 404);
        }

        $design->delete();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'message' => 'Design deleted successfully.',
        ]);
    }
}
