<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductOptionGroup;
use App\Models\ProductOptionValue;
use App\Models\ProductOptionAssignment;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminOptionController extends Controller
{
    /**
     * Display all option groups and their values.
     */
    public function index()
    {
        $groups = ProductOptionGroup::with(['values' => function ($q) {
            $q->orderBy('sort_order', 'asc');
        }])->orderBy('sort_order', 'asc')->get();

        $totalGroups = $groups->count();
        $totalValues = ProductOptionValue::whereNotNull('group_id')->count();
        $activeGroups = $groups->where('is_active', true)->count();

        return view('admin.product-options.index', compact('groups', 'totalGroups', 'totalValues', 'activeGroups'));
    }

    /**
     * Create a new option group.
     */
    public function storeGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:100|unique:product_option_groups,code',
            'display_type' => 'required|in:image_swatch,text_button,dropdown',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'description' => 'nullable|string|max:500',
        ]);

        $code = !empty($validated['code'])
            ? strtoupper(preg_replace('/[^A-Za-z0-9_]/', '_', trim($validated['code'])))
            : strtoupper(preg_replace('/[^A-Za-z0-9_]/', '_', trim($validated['name'])));

        // Ensure unique code
        $baseCode = $code;
        $counter = 1;
        while (ProductOptionGroup::where('code', $code)->exists()) {
            $code = $baseCode . '_' . $counter++;
        }

        $maxSort = ProductOptionGroup::max('sort_order') ?? 0;

        $group = ProductOptionGroup::create([
            'name' => trim($validated['name']),
            'code' => $code,
            'display_type' => $validated['display_type'],
            'is_required' => $request->boolean('is_required', false),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $validated['sort_order'] ?? ($maxSort + 1),
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['status' => 'success', 'group' => $group]);
        }

        return redirect()->route('admin.product-options')->with('success', "Option Group '{$group->name}' created successfully.");
    }

    /**
     * Update an option group.
     */
    public function updateGroup(Request $request, $id)
    {
        $group = ProductOptionGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:100|unique:product_option_groups,code,' . $id,
            'display_type' => 'required|in:image_swatch,text_button,dropdown',
            'is_required' => 'nullable',
            'is_active' => 'nullable',
            'sort_order' => 'nullable|integer',
            'description' => 'nullable|string|max:500',
        ]);

        $group->update([
            'name' => trim($validated['name']),
            'code' => strtoupper(preg_replace('/[^A-Za-z0-9_]/', '_', trim($validated['code']))),
            'display_type' => $validated['display_type'],
            'is_required' => $request->boolean('is_required'),
            'is_active' => $request->boolean('is_active'),
            'sort_order' => (int)($validated['sort_order'] ?? $group->sort_order),
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['status' => 'success', 'group' => $group]);
        }

        return redirect()->route('admin.product-options')->with('success', "Option Group '{$group->name}' updated.");
    }

    /**
     * Delete an option group.
     */
    public function deleteGroup($id)
    {
        $group = ProductOptionGroup::findOrFail($id);
        $name = $group->name;

        // Cascade delete values & assignments
        ProductOptionValue::where('group_id', $id)->delete();
        ProductOptionAssignment::where('group_id', $id)->delete();
        $group->delete();

        return redirect()->route('admin.product-options')->with('success', "Option Group '{$name}' deleted.");
    }

    /**
     * Store a value under an option group.
     */
    public function storeValue(Request $request, $groupId)
    {
        $group = ProductOptionGroup::findOrFail($groupId);

        $validated = $request->validate([
            'value' => 'required|string|max:100',
            'code' => 'nullable|string|max:100',
            'color_code' => 'nullable|string|max:30',
            'price_delta' => 'nullable|numeric',
            'sku' => 'nullable|string|max:100',
            'stock_qty' => 'nullable|integer|min:0',
            'is_active' => 'nullable',
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg,gif|max:10240',
            'image_url' => 'nullable|string',
        ]);

        $imageUrl = $validated['image_url'] ?? null;
        if ($request->hasFile('image')) {
            $imageUrl = $this->saveUploadedFile($request->file('image'), 'opt_val');
        }

        $code = !empty($validated['code'])
            ? strtoupper(trim($validated['code']))
            : strtoupper(preg_replace('/[^A-Za-z0-9_]/', '_', trim($validated['value'])));

        $maxSort = ProductOptionValue::where('group_id', $groupId)->max('sort_order') ?? 0;

        $optionValue = ProductOptionValue::create([
            'group_id' => $groupId,
            'product_option_id' => null,
            'value' => trim($validated['value']),
            'code' => $code,
            'color_code' => $validated['color_code'] ?? null,
            'image' => $imageUrl,
            'price_delta' => (float)($validated['price_delta'] ?? 0),
            'sku' => $validated['sku'] ?? null,
            'stock_qty' => (int)($validated['stock_qty'] ?? 10),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $maxSort + 1,
        ]);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['status' => 'success', 'value' => $optionValue]);
        }

        return redirect()->route('admin.product-options')->with('success', "Added value '{$optionValue->value}' to {$group->name}.");
    }

    /**
     * Update an option value.
     */
    public function updateValue(Request $request, $id)
    {
        $optionValue = ProductOptionValue::findOrFail($id);

        $validated = $request->validate([
            'value' => 'required|string|max:100',
            'code' => 'nullable|string|max:100',
            'color_code' => 'nullable|string|max:30',
            'price_delta' => 'nullable|numeric',
            'sku' => 'nullable|string|max:100',
            'stock_qty' => 'nullable|integer|min:0',
            'is_active' => 'nullable',
            'image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg,gif|max:10240',
            'image_url' => 'nullable|string',
        ]);

        $imageUrl = $optionValue->image;
        if ($request->hasFile('image')) {
            $imageUrl = $this->saveUploadedFile($request->file('image'), 'opt_val');
        } elseif (!empty($validated['image_url'])) {
            $imageUrl = $validated['image_url'];
        }

        $code = !empty($validated['code'])
            ? strtoupper(trim($validated['code']))
            : ($optionValue->code ?: strtoupper(preg_replace('/[^A-Za-z0-9_]/', '_', trim($validated['value']))));

        $optionValue->update([
            'value' => trim($validated['value']),
            'code' => $code,
            'color_code' => $validated['color_code'] ?? null,
            'image' => $imageUrl,
            'price_delta' => (float)($validated['price_delta'] ?? $optionValue->price_delta ?? 0),
            'sku' => $validated['sku'] ?? $optionValue->sku,
            'stock_qty' => (int)($validated['stock_qty'] ?? $optionValue->stock_qty ?? 999),
            'is_active' => $request->boolean('is_active'),
        ]);

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json(['status' => 'success', 'value' => $optionValue]);
        }

        return redirect()->route('admin.product-options')->with('success', "Updated value '{$optionValue->value}'.");
    }

    /**
     * Delete an option value.
     */
    public function deleteValue($id)
    {
        $optionValue = ProductOptionValue::findOrFail($id);
        $name = $optionValue->value;
        $optionValue->delete();

        return redirect()->route('admin.product-options')->with('success', "Deleted value '{$name}'.");
    }

    /**
     * Reorder groups or values (drag-and-drop / ordering).
     */
    public function updateSort(Request $request)
    {
        $type = $request->input('type', 'groups'); // 'groups' or 'values'
        $order = $request->input('order', []); // array of IDs in new order

        if (!is_array($order)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid order array'], 400);
        }

        if ($type === 'groups') {
            foreach ($order as $index => $id) {
                ProductOptionGroup::where('id', $id)->update(['sort_order' => $index + 1]);
            }
        } elseif ($type === 'values') {
            foreach ($order as $index => $id) {
                ProductOptionValue::where('id', $id)->update(['sort_order' => $index + 1]);
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Return JSON of all active groups with values for product form AJAX.
     */
    public function apiGroups()
    {
        $groups = ProductOptionGroup::with(['activeValues' => function ($q) {
            $q->orderBy('sort_order', 'asc');
        }])->where('is_active', true)->orderBy('sort_order', 'asc')->get();

        return response()->json(['status' => 'success', 'data' => $groups]);
    }

    private function saveUploadedFile($file, $prefix = 'upload')
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = uniqid('atelier_' . $prefix . '_') . '.' . $extension;

        $publicDir = is_dir(base_path('public_html')) ? base_path('public_html') : public_path();
        $destPath = $publicDir . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads';
        if (!file_exists($destPath)) {
            @mkdir($destPath, 0777, true);
        }

        $file->move($destPath, $filename);
        return '/images/uploads/' . $filename;
    }
}
