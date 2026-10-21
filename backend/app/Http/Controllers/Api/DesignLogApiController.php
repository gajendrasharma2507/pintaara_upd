<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DesignLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesignLogApiController extends Controller
{
    public function index(): JsonResponse
    {
        $logs = DesignLog::with('product')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'count' => $logs->count(),
            'data' => $logs,
        ]);
    }

    public function show(string $identifier): JsonResponse
    {
        $query = DesignLog::with('product');

        if (is_numeric($identifier)) {
            $log = $query->where('id', (int) $identifier)
                ->orWhere('product_id', (int) $identifier)
                ->first();
        } else {
            $log = $query->whereHas('product', function ($q) use ($identifier) {
                $q->whereRaw('UPPER(design_code) = UPPER(?)', [$identifier]);
            })->first();
        }

        if (!$log) {
            // Also try matching by product design_code or product id directly
            $product = \App\Models\Product::with('designLog')
                ->where(function ($q) use ($identifier) {
                    if (is_numeric($identifier)) {
                        $q->where('id', (int) $identifier);
                    }
                    $q->orWhereRaw('UPPER(design_code) = UPPER(?)', [$identifier]);
                })
                ->first();

            if ($product && $product->designLog) {
                $log = $product->designLog->load('product');
            } elseif ($product) {
                // Return synthesized design log from product attributes
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'id' => $product->id,
                        'product_id' => $product->id,
                        'blueprint_image' => $product->primary_image ?: "/images/design-log/{$product->design_code}.JPG",
                        'design_type' => 'BESPOKE DESIGN',
                        'status' => 'UNDER DEVELOPMENT',
                        'inspired_by' => null,
                        'specs' => [
                            'type' => 'BESPOKE DESIGN',
                            'material_options' => null,
                            'finish_options' => null,
                            'size_options' => null,
                            'gem_options' => null,
                            'inspired_by' => null,
                            'brand_origin' => 'A PINTAARA™ ORIGINAL',
                            'designed_by' => $product->designed_by ? "DESIGNED X {$product->designed_by}" : 'DESIGNED X Darshit Soni',
                        ],
                        'product' => $product,
                    ],
                ]);
            }
        }

        if (!$log) {
            // Also try matching by id or design_type
            $log = DesignLog::with('product')
                ->where('id', is_numeric($identifier) ? (int)$identifier : 0)
                ->orWhere('design_type', $identifier)
                ->first();
        }

        if (!$log) {
            return response()->json([
                'status' => 'error',
                'message' => 'Design log not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $log,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'blueprint_image' => 'nullable|string',
            'design_type' => 'nullable|string',
            'status' => 'nullable|string',
            'measurements' => 'nullable|array',
            'gem_details' => 'nullable|array',
            'specs' => 'nullable|array',
            'idea_image' => 'nullable|string',
            'idea_note' => 'nullable|string',
            'cad_image' => 'nullable|string',
            'cad_note' => 'nullable|string',
            'craft_image' => 'nullable|string',
            'craft_note' => 'nullable|string',
            'creation_image' => 'nullable|string',
            'creation_note' => 'nullable|string',
            'inspired_by' => 'nullable|string',
            'release_date' => 'nullable|date',
        ]);

        $log = DesignLog::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Design log created successfully',
            'data' => $log->load('product'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $log = DesignLog::find($id);

        if (!$log) {
            return response()->json([
                'status' => 'error',
                'message' => 'Design log not found',
            ], 404);
        }

        $log->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Design log updated successfully',
            'data' => $log->load('product'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $log = DesignLog::find($id);

        if (!$log) {
            return response()->json([
                'status' => 'error',
                'message' => 'Design log not found',
            ], 404);
        }

        $log->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Design log deleted successfully',
        ]);
    }
}
