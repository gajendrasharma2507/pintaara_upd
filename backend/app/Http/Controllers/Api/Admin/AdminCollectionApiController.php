<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCollectionApiController extends Controller
{
    /**
     * Display a listing of collections for admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CollectionMaster::withCount('products')->orderBy('sort_order', 'asc');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
        }

        $collections = $query->get()->map(function ($col) {
            return [
                'id' => $col->id,
                'name' => $col->name,
                'slug' => $col->slug,
                'image' => $col->image ?: '/images/concept-hero1.png',
                'description' => $col->description ?: '',
                'sort_order' => $col->sort_order,
                'status' => $col->status,
                'piecesCount' => $col->products_count ?? 0,
                'created_at' => $col->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $collections,
        ]);
    }

    /**
     * Store a newly created collection in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|in:active,hidden',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['name']);
        $baseSlug = $slug;
        $counter = 1;
        while (CollectionMaster::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $collection = CollectionMaster::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'image' => $validated['image'] ?? '/images/concept-hero1.png',
            'description' => $validated['description'] ?? '',
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Collection '{$collection->name}' created successfully.",
            'data' => [
                'id' => $collection->id,
                'name' => $collection->name,
                'slug' => $collection->slug,
                'image' => $collection->image,
                'description' => $collection->description,
                'sort_order' => $collection->sort_order,
                'status' => $collection->status,
                'piecesCount' => 0,
            ],
        ], 201);
    }

    /**
     * Display the specified collection.
     */
    public function show(int $id): JsonResponse
    {
        $collection = CollectionMaster::withCount('products')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $collection->id,
                'name' => $collection->name,
                'slug' => $collection->slug,
                'image' => $collection->image,
                'description' => $collection->description,
                'sort_order' => $collection->sort_order,
                'status' => $collection->status,
                'piecesCount' => $collection->products_count,
            ],
        ]);
    }

    /**
     * Update the specified collection in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $collection = CollectionMaster::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|in:active,hidden',
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $collection->slug) {
            $baseSlug = Str::slug($validated['slug']);
            $slug = $baseSlug;
            $counter = 1;
            while (CollectionMaster::where('slug', $slug)->where('id', '!=', $collection->id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $collection->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $collection->slug,
            'image' => $validated['image'] ?? $collection->image,
            'description' => $validated['description'] ?? $collection->description,
            'sort_order' => $validated['sort_order'] ?? $collection->sort_order,
            'status' => $validated['status'] ?? $collection->status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Collection '{$collection->name}' updated successfully.",
            'data' => [
                'id' => $collection->id,
                'name' => $collection->name,
                'slug' => $collection->slug,
                'image' => $collection->image,
                'description' => $collection->description,
                'sort_order' => $collection->sort_order,
                'status' => $collection->status,
                'piecesCount' => $collection->products()->count(),
            ],
        ]);
    }

    /**
     * Remove the specified collection from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $collection = CollectionMaster::find($id);
        if (!$collection) {
            return response()->json([
                'status' => 'error',
                'message' => 'Collection not found.',
            ], 404);
        }

        $name = $collection->name;
        // Detach products before deleting collection
        \App\Models\Product::where('collection_master_id', $id)->update(['collection_master_id' => null]);
        $collection->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Collection '{$name}' deleted successfully.",
        ]);
    }

    /**
     * Handle collection image file upload.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:10240', // max 10MB
        ]);

        $file = $request->file('image');
        $fileName = 'col_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('collections', $fileName, 'public');

        $url = url('storage/collections/' . $fileName);

        return response()->json([
            'status' => 'success',
            'url' => $url,
        ]);
    }
}
