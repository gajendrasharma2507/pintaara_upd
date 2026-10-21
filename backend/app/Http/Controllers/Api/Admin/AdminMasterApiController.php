<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomizationMaster;
use App\Models\CustomizationMasterValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminMasterApiController extends Controller
{
    /**
     * Factory default presets for the 5 Customization Masters.
     */
    public static function getDefaultMasters(): array
    {
        return [
            [
                'name' => 'METAL PURITY (KT)',
                'code' => 'PURITY',
                'description' => 'Precious gold hallmark and karat purity standards for casting & spot valuation.',
                'icon' => '🪙',
                'input_type' => 'swatch_image',
                'is_required' => true,
                'sort_order' => 1,
                'is_active' => true,
                'values' => [
                    ['value' => '24KT (99.9% Pure Gold)', 'code' => '24K', 'image' => 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=200&auto=format&fit=crop', 'price_delta' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['value' => '22KT (91.6% Royal Gold)', 'code' => '22K', 'image' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop', 'price_delta' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['value' => '18KT (75.0% Fine Gold)', 'code' => '18K', 'image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop', 'price_delta' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['value' => '14KT (58.5% Modern Gold)', 'code' => '14K', 'image' => 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=200&auto=format&fit=crop', 'price_delta' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['value' => 'PT950 (Platinum)', 'code' => 'PT950', 'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop', 'price_delta' => 0, 'sort_order' => 5, 'is_active' => true],
                    ['value' => '925 Sterling Silver', 'code' => '925', 'image' => 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=200&auto=format&fit=crop', 'price_delta' => 0, 'sort_order' => 6, 'is_active' => false],
                ],
            ],
            [
                'name' => 'FINISH OPTIONS',
                'code' => 'FINISH',
                'description' => 'Artisanal gold tone, surface luster texture and alloy electro-plating.',
                'icon' => '✨',
                'input_type' => 'swatch_image',
                'is_required' => true,
                'sort_order' => 2,
                'is_active' => true,
                'values' => [
                    ['value' => 'Yellow Gold', 'code' => 'YG', 'image' => '/images/products/pendant.png', 'hex_color' => '#D4AF37', 'price_delta' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['value' => 'Rose Gold', 'code' => 'RG', 'image' => '/images/concept-hero1.png', 'hex_color' => '#B76E79', 'price_delta' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['value' => 'White Gold', 'code' => 'WG', 'image' => '/images/concept-designlog.png', 'hex_color' => '#E8E8E8', 'price_delta' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['value' => 'Matte Satin Gold', 'code' => 'MSG', 'image' => '/images/concept-philosophy.png', 'hex_color' => '#C5A059', 'price_delta' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['value' => 'Antique Black Gold', 'code' => 'ABG', 'image' => '/images/concept-enter.png', 'hex_color' => '#2B2B2B', 'price_delta' => 0, 'sort_order' => 5, 'is_active' => false],
                ],
            ],
            [
                'name' => 'SIZE',
                'code' => 'SIZE',
                'description' => 'Dimensional sizing standards for rings, bangles, and chain lengths.',
                'icon' => '📏',
                'input_type' => 'text_button',
                'is_required' => false,
                'sort_order' => 3,
                'is_active' => true,
                'values' => [
                    ['value' => 'Ring Size 10', 'code' => 'R-10', 'image' => '', 'price_delta' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['value' => 'Ring Size 12', 'code' => 'R-12', 'image' => '', 'price_delta' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['value' => 'Ring Size 14', 'code' => 'R-14', 'image' => '', 'price_delta' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['value' => 'Ring Size 16', 'code' => 'R-16', 'image' => '', 'price_delta' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['value' => 'Ring Size 18', 'code' => 'R-18', 'image' => '', 'price_delta' => 0, 'sort_order' => 5, 'is_active' => true],
                    ['value' => 'Bangle 2.4', 'code' => 'B-2.4', 'image' => '', 'price_delta' => 0, 'sort_order' => 6, 'is_active' => true],
                    ['value' => 'Bangle 2.6', 'code' => 'B-2.6', 'image' => '', 'price_delta' => 0, 'sort_order' => 7, 'is_active' => true],
                    ['value' => 'Bangle 2.8', 'code' => 'B-2.8', 'image' => '', 'price_delta' => 0, 'sort_order' => 8, 'is_active' => true],
                    ['value' => 'Chain Length 16"', 'code' => 'CH-16', 'image' => '', 'price_delta' => 0, 'sort_order' => 9, 'is_active' => true],
                    ['value' => 'Chain Length 18"', 'code' => 'CH-18', 'image' => '', 'price_delta' => 0, 'sort_order' => 10, 'is_active' => true],
                    ['value' => 'Chain Length 20"', 'code' => 'CH-20', 'image' => '', 'price_delta' => 0, 'sort_order' => 11, 'is_active' => true],
                ],
            ],
            [
                'name' => 'GEM / STONE OPTIONS',
                'code' => 'GEM',
                'description' => 'Certified natural diamonds, precious gemstones, and cuts.',
                'icon' => '💎',
                'input_type' => 'swatch_image',
                'is_required' => false,
                'sort_order' => 4,
                'is_active' => true,
                'values' => [
                    ['value' => 'Natural Diamond (VVS-VS)', 'code' => 'DIA', 'image' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop', 'price_delta' => 25000, 'sort_order' => 1, 'is_active' => true],
                    ['value' => 'Zambian Emerald', 'code' => 'EMR', 'image' => 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=200&auto=format&fit=crop', 'price_delta' => 15000, 'sort_order' => 2, 'is_active' => true],
                    ['value' => 'Ceylon Blue Sapphire', 'code' => 'SAP', 'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop', 'price_delta' => 18000, 'sort_order' => 3, 'is_active' => true],
                    ['value' => 'Burmese Ruby', 'code' => 'RUB', 'image' => 'https://images.unsplash.com/photo-1611591475155-42a92b23a9b1?q=80&w=200&auto=format&fit=crop', 'price_delta' => 20000, 'sort_order' => 4, 'is_active' => true],
                    ['value' => 'No Stone / Solid Gold', 'code' => 'NONE', 'image' => '', 'price_delta' => 0, 'sort_order' => 5, 'is_active' => true],
                ],
            ],
            [
                'name' => 'CHAIN TYPE',
                'code' => 'CHAIN',
                'description' => 'Chain weaving links accompanying pendants & necklaces.',
                'icon' => '⛓️',
                'input_type' => 'swatch_image',
                'is_required' => false,
                'sort_order' => 5,
                'is_active' => true,
                'values' => [
                    ['value' => 'Box Chain (18")', 'code' => 'BOX', 'image' => '/images/products/chain.png', 'price_delta' => 8000, 'sort_order' => 1, 'is_active' => true],
                    ['value' => 'Cable Chain (18")', 'code' => 'CAB', 'image' => '/images/concept-hero1.png', 'price_delta' => 7500, 'sort_order' => 2, 'is_active' => true],
                    ['value' => 'Rope Chain (20")', 'code' => 'ROP', 'image' => '/images/products/necklace.png', 'price_delta' => 12000, 'sort_order' => 3, 'is_active' => true],
                    ['value' => 'Wheat Chain (18")', 'code' => 'WHT', 'image' => '/images/products/bracelet.png', 'price_delta' => 9500, 'sort_order' => 4, 'is_active' => true],
                    ['value' => 'Pendant Only (No Chain)', 'code' => 'NONE', 'image' => '', 'price_delta' => 0, 'sort_order' => 5, 'is_active' => true],
                ],
            ],
            [
                'name' => 'CERTIFICATE MASTER / TYPES',
                'code' => 'CERTIFICATE',
                'description' => 'Official authenticity certificates, gemstone grading reports, and hallmarking standards.',
                'icon' => '📜',
                'input_type' => 'text_button',
                'is_required' => false,
                'sort_order' => 6,
                'is_active' => true,
                'values' => [
                    ['value' => 'Authenticity Certificate', 'code' => 'AUTH_CERT', 'price_delta' => 0, 'sort_order' => 1, 'is_active' => true],
                    ['value' => 'Gem/Stone Certificate', 'code' => 'GEM_CERT', 'price_delta' => 0, 'sort_order' => 2, 'is_active' => true],
                    ['value' => 'Diamond Grading Report (IGI/GIA)', 'code' => 'DIA_REPORT', 'price_delta' => 0, 'sort_order' => 3, 'is_active' => true],
                    ['value' => 'BIS Hallmark Purity Card', 'code' => 'BIS_HALLMARK', 'price_delta' => 0, 'sort_order' => 4, 'is_active' => true],
                    ['value' => 'Assay Lab Purity Guarantee', 'code' => 'ASSAY_LAB', 'price_delta' => 0, 'sort_order' => 5, 'is_active' => true],
                ],
            ],
        ];
    }

    /**
     * Ensure default factory presets exist in database.
     */
    protected function ensureDefaultsSeeded(): void
    {
        $defaults = self::getDefaultMasters();
        foreach ($defaults as $masterData) {
            $values = $masterData['values'] ?? [];
            unset($masterData['values']);

            $existing = CustomizationMaster::where('code', $masterData['code'])->first();
            if (!$existing) {
                $master = CustomizationMaster::create($masterData);
                foreach ($values as $val) {
                    $master->values()->create($val);
                }
            }
        }
    }

    /**
     * Get all master categories and their configured values.
     */
    public function index(): JsonResponse
    {
        $this->ensureDefaultsSeeded();

        $masters = CustomizationMaster::with(['values' => function ($q) {
            $q->orderBy('sort_order', 'asc');
        }])
        ->orderBy('sort_order', 'asc')
        ->get();

        return response()->json([
            'status' => 'success',
            'count' => $masters->count(),
            'data' => $masters,
        ]);
    }

    /**
     * Create a brand-new master category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:20',
            'input_type' => 'nullable|in:swatch_image,text_button,dropdown,radio',
            'is_required' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'values' => 'nullable|array',
        ]);

        $code = !empty($validated['code'])
            ? strtoupper(Str::slug($validated['code'], '_'))
            : strtoupper(Str::slug($validated['name'], '_'));

        $baseCode = $code;
        $counter = 1;
        while (CustomizationMaster::where('code', $code)->exists()) {
            $code = "{$baseCode}_{$counter}";
            $counter++;
        }

        DB::beginTransaction();
        try {
            $master = CustomizationMaster::create([
                'name' => trim($validated['name']),
                'code' => $code,
                'description' => $validated['description'] ?? '',
                'icon' => $validated['icon'] ?? '💎',
                'input_type' => $validated['input_type'] ?? 'swatch_image',
                'is_required' => $validated['is_required'] ?? false,
                'sort_order' => $validated['sort_order'] ?? (CustomizationMaster::count() + 1),
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['values']) && is_array($validated['values'])) {
                foreach ($validated['values'] as $idx => $val) {
                    $vText = is_array($val) ? ($val['value'] ?? '') : (string) $val;
                    if (trim($vText)) {
                        $master->values()->create([
                            'value' => trim($vText),
                            'code' => is_array($val) ? ($val['code'] ?? null) : null,
                            'image' => is_array($val) ? ($val['image'] ?? null) : null,
                            'price_delta' => is_array($val) ? (float) ($val['price_delta'] ?? 0) : 0,
                            'hex_color' => is_array($val) ? ($val['hex_color'] ?? null) : null,
                            'sort_order' => is_array($val) ? ($val['sort_order'] ?? ($idx + 1)) : ($idx + 1),
                            'is_active' => is_array($val) ? ($val['is_active'] ?? true) : true,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Master category '{$master->name}' created successfully.",
                'data' => $master->load('values'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create master category: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retrieve a single master category with its values.
     */
    public function show(int $id): JsonResponse
    {
        $master = CustomizationMaster::with(['values' => function ($q) {
            $q->orderBy('sort_order', 'asc');
        }])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $master,
        ]);
    }

    /**
     * Update an existing master category.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $master = CustomizationMaster::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:20',
            'input_type' => 'nullable|in:swatch_image,text_button,dropdown,radio',
            'is_required' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'values' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $master->update([
                'name' => trim($validated['name']),
                'code' => !empty($validated['code']) ? strtoupper(Str::slug($validated['code'], '_')) : $master->code,
                'description' => $validated['description'] ?? $master->description,
                'icon' => $validated['icon'] ?? $master->icon,
                'input_type' => $validated['input_type'] ?? $master->input_type,
                'is_required' => array_key_exists('is_required', $validated) ? (bool) $validated['is_required'] : $master->is_required,
                'sort_order' => array_key_exists('sort_order', $validated) ? (int) $validated['sort_order'] : $master->sort_order,
                'is_active' => array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : $master->is_active,
            ]);

            // If values array is provided, sync values
            if (array_key_exists('values', $validated) && is_array($validated['values'])) {
                $master->values()->delete();
                foreach ($validated['values'] as $idx => $val) {
                    $vText = is_array($val) ? ($val['value'] ?? '') : (string) $val;
                    if (trim($vText)) {
                        $master->values()->create([
                            'value' => trim($vText),
                            'code' => is_array($val) ? ($val['code'] ?? null) : null,
                            'image' => is_array($val) ? ($val['image'] ?? null) : null,
                            'price_delta' => is_array($val) ? (float) ($val['price_delta'] ?? 0) : 0,
                            'hex_color' => is_array($val) ? ($val['hex_color'] ?? null) : null,
                            'sort_order' => is_array($val) ? ($val['sort_order'] ?? ($idx + 1)) : ($idx + 1),
                            'is_active' => is_array($val) ? ($val['is_active'] ?? true) : true,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Master category '{$master->name}' updated successfully.",
                'data' => $master->load('values'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update master category: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an entire master category and its values.
     */
    public function destroy(int $id): JsonResponse
    {
        $master = CustomizationMaster::find($id);
        if (!$master) {
            return response()->json(['status' => 'error', 'message' => 'Master category not found.'], 404);
        }

        $name = $master->name;
        $master->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Master category '{$name}' was deleted.",
        ]);
    }

    /**
     * Add a single value to a specific master.
     */
    public function storeValue(Request $request, int $masterId): JsonResponse
    {
        $master = CustomizationMaster::findOrFail($masterId);

        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'image' => 'nullable|string',
            'price_delta' => 'nullable|numeric',
            'hex_color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $value = $master->values()->create([
            'value' => trim($validated['value']),
            'code' => $validated['code'] ?? null,
            'image' => $validated['image'] ?? null,
            'price_delta' => (float) ($validated['price_delta'] ?? 0),
            'hex_color' => $validated['hex_color'] ?? null,
            'sort_order' => $validated['sort_order'] ?? ($master->values()->count() + 1),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Option value '{$value->value}' added to {$master->name}.",
            'data' => $value,
        ], 201);
    }

    /**
     * Update a specific master value.
     */
    public function updateValue(Request $request, int $valueId): JsonResponse
    {
        $value = CustomizationMasterValue::findOrFail($valueId);

        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'image' => 'nullable|string',
            'price_delta' => 'nullable|numeric',
            'hex_color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $value->update([
            'value' => trim($validated['value']),
            'code' => $validated['code'] ?? $value->code,
            'image' => array_key_exists('image', $validated) ? $validated['image'] : $value->image,
            'price_delta' => array_key_exists('price_delta', $validated) ? (float) $validated['price_delta'] : $value->price_delta,
            'hex_color' => array_key_exists('hex_color', $validated) ? $validated['hex_color'] : $value->hex_color,
            'sort_order' => array_key_exists('sort_order', $validated) ? (int) $validated['sort_order'] : $value->sort_order,
            'is_active' => array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : $value->is_active,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Value '{$value->value}' updated successfully.",
            'data' => $value,
        ]);
    }

    /**
     * Delete a specific master value.
     */
    public function destroyValue(int $valueId): JsonResponse
    {
        $value = CustomizationMasterValue::find($valueId);
        if (!$value) {
            return response()->json(['status' => 'error', 'message' => 'Value not found.'], 404);
        }

        $valName = $value->value;
        $value->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Option value '{$valName}' removed.",
        ]);
    }

    /**
     * Reset back to factory default presets.
     */
    public function reset(): JsonResponse
    {
        DB::beginTransaction();
        try {
            CustomizationMasterValue::query()->delete();
            CustomizationMaster::query()->delete();

            $defaults = self::getDefaultMasters();
            foreach ($defaults as $masterData) {
                $values = $masterData['values'] ?? [];
                unset($masterData['values']);

                $master = CustomizationMaster::create($masterData);
                foreach ($values as $val) {
                    $master->values()->create($val);
                }
            }

            DB::commit();

            $masters = CustomizationMaster::with(['values' => function ($q) {
                $q->orderBy('sort_order', 'asc');
            }])->orderBy('sort_order', 'asc')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Customization masters reset to atelier factory presets.',
                'data' => $masters,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reset presets: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle master swatch / gem image file upload.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:10240', // max 10MB
        ]);

        $file = $request->file('image');
        $fileName = 'gem_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $file->storeAs('masters/gems', $fileName, 'public');

        $url = url('storage/masters/gems/' . $fileName);

        return response()->json([
            'status' => 'success',
            'url' => $url,
        ]);
    }
}
