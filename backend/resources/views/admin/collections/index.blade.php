@extends('layouts.admin')

@section('title', 'Collections Master')
@section('page-title', 'Collections Master Grid')
@section('page-subtitle', 'Curate jewelry categories, hero tiles, and storefront taxonomy')

@section('content')
<div class="space-y-8" x-data="{ 
    createModal: false, 
    editModal: false,
    editData: { id: null, name: '', image: '', sort_order: 0, status: 'active' },
    openEdit(col) {
        this.editData = { ...col };
        this.editModal = true;
    }
}">

    <!-- Top Action Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Master Category Grid Tiles</h3>
            <p class="text-xs text-pintaara-charcoal-muted">Controls the visual category blocks rendered across the storefront</p>
        </div>
        <button @click="createModal = true" class="inline-flex items-center px-4 py-2.5 bg-pintaara-charcoal text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 hover:bg-black transition-colors shadow-xs">
            + Add New Collection
        </button>
    </div>

    <!-- Category Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        @foreach($collections as $col)
            <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs flex flex-col justify-between group hover:border-pintaara-gold/60 transition-all">
                <!-- Thumbnail -->
                <div class="h-44 bg-pintaara-charcoal relative overflow-hidden">
                    @if($col->image)
                        <img src="{{ $col->image }}" alt="{{ $col->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    @else
                        <div class="w-full h-full flex items-center justify-center text-pintaara-gold/40 font-serif text-xl">PINTAARA</div>
                    @endif
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest {{ $col->status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-zinc-700 text-zinc-300' }}">
                        {{ ucfirst($col->status) }}
                    </span>
                    <span class="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-pintaara-gold border border-pintaara-gold/30">
                        Order #{{ $col->sort_order }}
                    </span>

                    <div class="absolute bottom-3 left-3 right-3 text-white">
                        <h4 class="font-serif font-bold text-lg text-[#F5EDE4]">{{ $col->name }}</h4>
                        <p class="text-[11px] text-[#D8CCBA] font-mono">/collections/{{ $col->slug }}</p>
                    </div>
                </div>

                <!-- Info & Actions -->
                <div class="p-4 flex items-center justify-between bg-white/40 border-t border-pintaara-line/40">
                    <span class="text-xs text-pintaara-charcoal-muted">
                        <strong class="font-serif text-pintaara-charcoal font-semibold">{{ $col->products_count }}</strong> Designs
                    </span>

                    <div class="flex items-center space-x-2">
                        <button @click="openEdit({{ json_encode($col) }})" class="px-2.5 py-1 text-[11px] font-semibold text-pintaara-charcoal hover:text-pintaara-gold rounded bg-white hover:bg-pintaara-sand border border-pintaara-line transition-colors">
                            Edit
                        </button>
                        <form action="{{ route('admin.collections.destroy', $col->id) }}" method="POST" onsubmit="return confirm('Delete collection {{ $col->name }}?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="px-2 py-1 text-[11px] text-rose-600 hover:text-rose-800">
                                &times;
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

</div>

<!-- CREATE MODAL -->
<div x-show="createModal" x-cloak class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div @click.away="createModal = false" class="bg-[#FAF6F0] rounded-xl border border-pintaara-gold/40 shadow-2xl max-w-md w-full overflow-hidden">
        <div class="px-6 py-4 bg-pintaara-charcoal text-[#F5EDE4] flex items-center justify-between border-b border-pintaara-gold/30">
            <h3 class="font-serif font-semibold text-base text-pintaara-gold">Create New Collection Tile</h3>
            <button @click="createModal = false" class="text-gray-400 hover:text-white">&times;</button>
        </div>
        <form action="{{ route('admin.collections.store') }}" method="POST" class="p-6 space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Collection Name *</label>
                <input type="text" name="name" required placeholder="e.g. Necklaces" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Grid Image URL</label>
                <input type="url" name="image" placeholder="https://..." class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Sort Order</label>
                    <input type="number" name="sort_order" value="1" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Status</label>
                    <select name="status" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                        <option value="active">Active</option>
                        <option value="hidden">Hidden</option>
                    </select>
                </div>
            </div>
            <div class="pt-3 border-t border-pintaara-line flex justify-end space-x-3">
                <button type="button" @click="createModal = false" class="px-4 py-2 text-xs text-pintaara-charcoal hover:bg-pintaara-sand rounded">Cancel</button>
                <button type="submit" class="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-pintaara-charcoal text-pintaara-gold rounded border border-pintaara-gold/40">Save Collection</button>
            </div>
        </form>
    </div>
</div>

<!-- EDIT MODAL -->
<div x-show="editModal" x-cloak class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div @click.away="editModal = false" class="bg-[#FAF6F0] rounded-xl border border-pintaara-gold/40 shadow-2xl max-w-md w-full overflow-hidden">
        <div class="px-6 py-4 bg-pintaara-charcoal text-[#F5EDE4] flex items-center justify-between border-b border-pintaara-gold/30">
            <h3 class="font-serif font-semibold text-base text-pintaara-gold">Edit Collection</h3>
            <button @click="editModal = false" class="text-gray-400 hover:text-white">&times;</button>
        </div>
        <form :action="'/admin/collections-master/' + editData.id" method="POST" class="p-6 space-y-4">
            @csrf
            @method('PUT')
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Collection Name *</label>
                <input type="text" name="name" x-model="editData.name" required class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
            </div>
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Grid Image URL</label>
                <input type="url" name="image" x-model="editData.image" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Sort Order</label>
                    <input type="number" name="sort_order" x-model="editData.sort_order" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Status</label>
                    <select name="status" x-model="editData.status" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                        <option value="active">Active</option>
                        <option value="hidden">Hidden</option>
                    </select>
                </div>
            </div>
            <div class="pt-3 border-t border-pintaara-line flex justify-end space-x-3">
                <button type="button" @click="editModal = false" class="px-4 py-2 text-xs text-pintaara-charcoal hover:bg-pintaara-sand rounded">Cancel</button>
                <button type="submit" class="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-pintaara-charcoal text-pintaara-gold rounded border border-pintaara-gold/40">Update Collection</button>
            </div>
        </form>
    </div>
</div>
@endsection
