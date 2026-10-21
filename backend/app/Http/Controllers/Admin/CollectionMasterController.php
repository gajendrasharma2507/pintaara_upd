<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionMasterController extends Controller
{
    public function index()
    {
        $collections = CollectionMaster::withCount('products')->orderBy('sort_order')->get();
        return view('admin.collections.index', compact('collections'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string|max:1000',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:active,hidden',
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;
        while (CollectionMaster::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        CollectionMaster::create([
            'name' => $request->name,
            'slug' => $slug,
            'image' => $request->image,
            'sort_order' => $request->sort_order ?? 0,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.collections.index')->with('success', "Collection '{$request->name}' created successfully.");
    }

    public function update(Request $request, $id)
    {
        $collection = CollectionMaster::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string|max:1000',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:active,hidden',
        ]);

        $collection->update([
            'name' => $request->name,
            'image' => $request->image,
            'sort_order' => $request->sort_order ?? $collection->sort_order,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.collections.index')->with('success', "Collection '{$collection->name}' updated successfully.");
    }

    public function destroy($id)
    {
        $collection = CollectionMaster::findOrFail($id);
        $name = $collection->name;
        $collection->delete();

        return redirect()->route('admin.collections.index')->with('success', "Collection '{$name}' deleted.");
    }
}
