@extends('layouts.admin')

@section('title', 'Product Catalog & Matrix')
@section('page-title', 'Product Catalog & Matrix')
@section('page-subtitle', 'Fine jewelry creations dynamically priced by live spot market rates')

@section('content')
<div class="space-y-6">

    <!-- Filters & Actions Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Search & Filter Form -->
        <form method="GET" action="{{ route('admin.products.index') }}" class="flex flex-wrap items-center gap-3 flex-1">
            <div class="relative min-w-[240px]">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-pintaara-charcoal-muted pointer-events-none">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </span>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search design code, name..." 
                       class="w-full pl-9 pr-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
            </div>

            <select name="collection_id" onchange="this.form.submit()" class="px-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
                <option value="">All Collections</option>
                @foreach($collections as $col)
                    <option value="{{ $col->id }}" {{ request('collection_id') == $col->id ? 'selected' : '' }}>{{ $col->name }}</option>
                @endforeach
            </select>

            <select name="tier" onchange="this.form.submit()" class="px-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
                <option value="">All Tiers</option>
                <option value="Signature" {{ request('tier') === 'Signature' ? 'selected' : '' }}>Signature</option>
                <option value="Curated" {{ request('tier') === 'Curated' ? 'selected' : '' }}>Curated</option>
                <option value="Heritage" {{ request('tier') === 'Heritage' ? 'selected' : '' }}>Heritage</option>
            </select>

            <select name="status" onchange="this.form.submit()" class="px-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
                <option value="">All Statuses</option>
                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Archived</option>
            </select>

            @if(request()->hasAny(['search', 'collection_id', 'tier', 'status']))
                <a href="{{ route('admin.products.index') }}" class="px-3 py-2 text-xs text-rose-600 hover:underline">Reset</a>
            @endif
        </form>

        <!-- Create Button -->
        <a href="{{ route('admin.products.create') }}" class="inline-flex items-center px-4 py-2 bg-pintaara-charcoal text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 hover:bg-black transition-colors shadow-xs">
            + New Design Spec
        </a>
    </div>

    <!-- Products Table -->
    <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-pintaara-line/60 text-left text-xs">
                <thead class="bg-white/60 text-pintaara-charcoal-muted uppercase font-bold tracking-wider">
                    <tr>
                        <th class="px-4 py-3.5">Piece</th>
                        <th class="px-4 py-3.5">Design Code</th>
                        <th class="px-4 py-3.5">Collection / Tier</th>
                        <th class="px-4 py-3.5">Base Weight</th>
                        <th class="px-4 py-3.5">Making Charge</th>
                        <th class="px-4 py-3.5">Live Calculated Price</th>
                        <th class="px-4 py-3.5">Status</th>
                        <th class="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-pintaara-line/40 bg-white/20">
                    @forelse($products as $prod)
                        @php $price = $prices[$prod->id] ?? null; @endphp
                        <tr class="hover:bg-white/60 transition-colors">
                            <!-- Thumbnail + Name -->
                            <td class="px-4 py-3.5 flex items-center space-x-3">
                                <div class="w-11 h-11 rounded-lg bg-pintaara-charcoal overflow-hidden border border-pintaara-line shrink-0">
                                    @if($prod->primaryImage)
                                        <img src="{{ $prod->primaryImage->url }}" alt="{{ $prod->name }}" class="w-full h-full object-cover">
                                    @else
                                        <div class="w-full h-full flex items-center justify-center text-pintaara-gold text-xs font-serif font-bold">P</div>
                                    @endif
                                </div>
                                <div>
                                    <a href="{{ route('admin.products.edit', $prod->id) }}" class="font-serif font-bold text-sm text-pintaara-charcoal hover:text-pintaara-gold">
                                        {{ $prod->name }}
                                    </a>
                                    <p class="text-[10px] text-pintaara-charcoal-muted">
                                        {{ $prod->variants->count() }} Variants · 
                                        {{ $prod->designLog ? 'Spec Log Attached' : 'No Design Log' }}
                                    </p>
                                </div>
                            </td>

                            <!-- Code -->
                            <td class="px-4 py-3.5 font-mono font-bold text-pintaara-charcoal">
                                {{ $prod->design_code }}
                            </td>

                            <!-- Collection / Tier -->
                            <td class="px-4 py-3.5">
                                <p class="font-medium text-pintaara-charcoal">{{ $prod->collectionMaster->name ?? 'Unassigned' }}</p>
                                <span class="inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-pintaara-sand text-pintaara-charcoal mt-0.5">
                                    {{ $prod->tier }}
                                </span>
                            </td>

                            <!-- Weight -->
                            <td class="px-4 py-3.5 font-serif font-semibold text-pintaara-charcoal">
                                {{ number_format($prod->base_weight_grams, 3) }}g
                            </td>

                            <!-- Making Charge -->
                            <td class="px-4 py-3.5 font-mono text-pintaara-charcoal">
                                @if($prod->making_charge > 0)
                                    ₹{{ number_format($prod->making_charge) }} <span class="text-[10px] text-gray-500">(flat)</span>
                                @elseif($prod->making_charge_percent > 0)
                                    {{ $prod->making_charge_percent }}% <span class="text-[10px] text-gray-500">(metal)</span>
                                @else
                                    <span class="text-gray-400">₹0</span>
                                @endif
                            </td>

                            <!-- Live Price -->
                            <td class="px-4 py-3.5">
                                <p class="font-serif font-bold text-sm text-pintaara-charcoal">
                                    ₹{{ number_format($price['total_price'] ?? 0) }}
                                </p>
                                <p class="text-[10px] text-pintaara-gold font-mono">
                                    ₹{{ number_format($price['metal_value'] ?? 0) }} metal + ₹{{ number_format($price['gst_amount'] ?? 0) }} GST
                                </p>
                            </td>

                            <!-- Status -->
                            <td class="px-4 py-3.5">
                                <x-admin.status-badge :status="$prod->status" />
                            </td>

                            <!-- Actions -->
                            <td class="px-4 py-3.5 text-right space-x-2">
                                <a href="{{ route('admin.products.edit', $prod->id) }}" class="px-3 py-1 bg-white hover:bg-pintaara-sand border border-pintaara-line text-pintaara-charcoal rounded text-xs font-semibold transition-colors">
                                    Edit Spec
                                </a>
                                <form action="{{ route('admin.products.destroy', $prod->id) }}" method="POST" class="inline" onsubmit="return confirm('Archive design {{ $prod->name }}?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="px-2 py-1 text-rose-600 hover:text-rose-800 text-xs">
                                        &times;
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="px-4 py-12 text-center text-pintaara-charcoal-muted">
                                <p class="font-serif text-base text-pintaara-charcoal">No jewelry creations found.</p>
                                <p class="text-xs mt-1">Create your first master design spec sheet using the button above.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($products->hasPages())
            <div class="px-4 py-3 border-t border-pintaara-line/60 bg-white/40">
                {{ $products->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
