@extends('layouts.admin')

@section('title', 'Dashboard Overview')
@section('page-title', 'Atelier Command Center')
@section('page-subtitle', 'Real-time market rates, production workflow, and active catalog inventory')

@section('content')
<div class="space-y-8" x-data="{
    simWeight: 8.500,
    simPurityFraction: 0.916,
    simPurityName: '22KT',
    simMakingCharge: 3000,
    simWastage: 0,
    goldRate22kt: {{ $currentGold22 }},
    gstPercent: 3.0,

    get effectiveRatePerGram() {
        // (22KT rate / 10) / 0.916 * purityFraction
        const pure24 = (this.goldRate22kt / 10) / 0.916;
        return pure24 * this.simPurityFraction;
    },
    get metalValue() {
        return this.simWeight * this.effectiveRatePerGram;
    },
    get wastageValue() {
        return this.metalValue * (this.simWastage / 100);
    },
    get subtotal() {
        return this.metalValue + this.wastageValue + Number(this.simMakingCharge);
    },
    get gst() {
        return this.subtotal * (this.gstPercent / 100);
    },
    get total() {
        return this.subtotal + this.gst;
    },
    formatCurrency(val) {
        return Math.round(val || 0).toLocaleString('en-IN');
    }
}">

    <!-- LIVE GOLD RATE BANNER -->
    <div class="bg-gradient-to-r from-pintaara-charcoal via-[#342D26] to-pintaara-charcoal rounded-2xl p-6 text-[#F5EDE4] border border-pintaara-gold/40 shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-pintaara-gold/10 blur-3xl pointer-events-none"></div>
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
                <div class="flex items-center space-x-2 mb-2">
                    <span class="relative flex h-2.5 w-2.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span class="text-xs uppercase font-bold tracking-[0.2em] text-pintaara-gold">Live Spot Market Rates</span>
                    <span class="text-[10px] text-[#A69D92] px-2 py-0.5 rounded bg-black/40 border border-[#4D453C]">Auto-computed for all catalog items</span>
                </div>
                <div class="flex items-baseline space-x-4">
                    <div>
                        <span class="text-xs text-[#C5BCB2] block">Gold 22KT / 10g:</span>
                        <span class="font-serif font-bold text-3xl text-pintaara-gold">₹{{ number_format($currentGold22) }}</span>
                    </div>
                    <div class="pl-4 border-l border-[#4D453C]">
                        <span class="text-xs text-[#C5BCB2] block">24KT Pure / g:</span>
                        <span class="font-serif font-semibold text-2xl text-white">₹{{ number_format($currentPure24, 1) }}</span>
                    </div>
                    <div class="pl-4 border-l border-[#4D453C]">
                        <span class="text-xs text-[#C5BCB2] block">Silver / 10g:</span>
                        <span class="font-serif font-semibold text-2xl text-[#E8E8E8]">₹{{ number_format($currentSilver10) }}</span>
                    </div>
                </div>
            </div>

            <!-- Purities Quick Conversion Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                @foreach($purityRates['purities'] as $p)
                    <div class="bg-black/30 border border-pintaara-gold/20 rounded-lg p-2.5 text-center">
                        <p class="text-[10px] uppercase tracking-wider text-pintaara-gold/80 font-bold">{{ $p['name'] }}</p>
                        <p class="font-serif font-semibold text-sm text-[#F5EDE4]">₹{{ number_format($p['rate_per_gram'], 1) }}<span class="text-[10px] text-[#A69D92]">/g</span></p>
                    </div>
                @endforeach
            </div>

            <!-- Quick Action -->
            <div class="flex items-center">
                <button @click="quickRateModal = true" class="w-full lg:w-auto px-5 py-3 rounded-lg bg-pintaara-gold hover:bg-pintaara-gold-dark text-pintaara-charcoal font-semibold text-xs uppercase tracking-wider shadow-md transition-all">
                    Update Spot Rates
                </button>
            </div>
        </div>
    </div>

    <!-- 4 KEY METRICS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Total Revenue -->
        <div class="bg-[#FAF6F0] rounded-xl p-5 border border-pintaara-line/80 shadow-xs flex items-center justify-between">
            <div>
                <p class="text-xs uppercase font-bold tracking-wider text-pintaara-charcoal-muted">Total Revenue</p>
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal mt-1">₹{{ number_format($totalRevenue) }}</p>
                <p class="text-[11px] text-emerald-700 font-medium mt-0.5">3% GST automatically itemized</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-pintaara-gold/15 border border-pintaara-gold/40 flex items-center justify-center text-pintaara-gold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
        </div>

        <!-- Active Catalog Designs -->
        <div class="bg-[#FAF6F0] rounded-xl p-5 border border-pintaara-line/80 shadow-xs flex items-center justify-between">
            <div>
                <p class="text-xs uppercase font-bold tracking-wider text-pintaara-charcoal-muted">Active Designs</p>
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal mt-1">{{ $activeProductsCount }}</p>
                <p class="text-[11px] text-pintaara-charcoal-muted mt-0.5">With Shopify Option Matrix</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-pintaara-charcoal/10 border border-pintaara-charcoal/20 flex items-center justify-center text-pintaara-charcoal">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
        </div>

        <!-- Orders In Production -->
        <div class="bg-[#FAF6F0] rounded-xl p-5 border border-pintaara-line/80 shadow-xs flex items-center justify-between">
            <div>
                <p class="text-xs uppercase font-bold tracking-wider text-pintaara-charcoal-muted">In Production</p>
                <p class="font-serif font-bold text-2xl text-indigo-900 mt-1">{{ $pendingOrdersCount }}</p>
                <p class="text-[11px] text-indigo-700 font-medium mt-0.5">5-Step atelier pipeline</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
        </div>

        <!-- Collections Master -->
        <div class="bg-[#FAF6F0] rounded-xl p-5 border border-pintaara-line/80 shadow-xs flex items-center justify-between">
            <div>
                <p class="text-xs uppercase font-bold tracking-wider text-pintaara-charcoal-muted">Collections Master</p>
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal mt-1">{{ $collectionsCount }}</p>
                <p class="text-[11px] text-pintaara-charcoal-muted mt-0.5">Grid tiles on storefront</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </div>
        </div>

    </div>

    <!-- 2-COLUMN SECTION: LIVE PRICE SIMULATOR & RECENT ORDERS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- RECENT ORDERS STREAM (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Recent Client Orders</h3>
                    <p class="text-xs text-pintaara-charcoal-muted">5-step tracking and frozen gold rate snapshot</p>
                </div>
                <a href="{{ route('admin.orders.index') }}" class="text-xs uppercase font-semibold text-pintaara-gold hover:underline tracking-wider">
                    View All Orders &rarr;
                </a>
            </div>

            <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-pintaara-line/60 text-left text-xs">
                        <thead class="bg-white/60 text-pintaara-charcoal-muted uppercase font-bold tracking-wider">
                            <tr>
                                <th class="px-4 py-3">Order #</th>
                                <th class="px-4 py-3">Client</th>
                                <th class="px-4 py-3">Item / Purity</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-pintaara-line/40 bg-white/20">
                            @forelse($recentOrders as $order)
                                <tr class="hover:bg-white/60 transition-colors">
                                    <td class="px-4 py-3.5 font-mono font-semibold text-pintaara-charcoal">
                                        <a href="{{ route('admin.orders.show', $order->id) }}" class="text-pintaara-charcoal hover:text-pintaara-gold underline">
                                            {{ $order->order_number }}
                                        </a>
                                    </td>
                                    <td class="px-4 py-3.5">
                                        <p class="font-medium text-pintaara-charcoal">{{ $order->customer_name ?? 'VIP Client' }}</p>
                                        <p class="text-[10px] text-pintaara-charcoal-muted">{{ $order->customer_phone ?? $order->customer_email }}</p>
                                    </td>
                                    <td class="px-4 py-3.5">
                                        @if($order->items->first())
                                            <p class="font-medium text-pintaara-charcoal">{{ $order->items->first()->product_name }}</p>
                                            <p class="text-[10px] text-pintaara-gold font-mono">{{ $order->items->first()->metal_purity }} · {{ $order->items->first()->weight_used }}g</p>
                                        @else
                                            <span class="text-gray-400">—</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3.5">
                                        <x-admin.status-badge :status="$order->status" />
                                    </td>
                                    <td class="px-4 py-3.5 text-right font-serif font-bold text-sm text-pintaara-charcoal">
                                        ₹{{ number_format($order->total_amount) }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-8 text-center text-pintaara-charcoal-muted">No orders found.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- QUICK JEWELER'S SIMULATOR & LEDGER (5 Cols) -->
        <div class="lg:col-span-5 space-y-4">
            <div>
                <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Jeweler's Quick Calculator</h3>
                <p class="text-xs text-pintaara-charcoal-muted">Test any custom gold weight and purity live</p>
            </div>

            <div class="bg-[#FAF6F0] rounded-xl p-5 border border-pintaara-line/80 space-y-4 shadow-xs">
                <!-- Weight Input -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Weight (Grams)</label>
                        <input type="number" step="0.01" x-model="simWeight" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-bold font-serif focus:border-pintaara-gold">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Purity</label>
                        <select x-model="simPurityFraction" 
                                @change="simPurityName = $event.target.options[$event.target.selectedIndex].text"
                                class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-xs font-semibold focus:border-pintaara-gold">
                            <option value="0.916">22KT Gold</option>
                            <option value="0.750">18KT Gold</option>
                            <option value="0.585">14KT Gold</option>
                            <option value="0.925">925 Silver</option>
                        </select>
                    </div>
                </div>

                <!-- Making Charge & Wastage -->
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Making Charge (₹)</label>
                        <input type="number" step="100" x-model="simMakingCharge" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono focus:border-pintaara-gold">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Wastage (%)</label>
                        <input type="number" step="0.5" x-model="simWastage" class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono focus:border-pintaara-gold">
                    </div>
                </div>

                <!-- Live Ledger Breakdown Box -->
                <div class="p-4 rounded-lg bg-pintaara-charcoal text-[#F5EDE4] border border-pintaara-gold/40 space-y-2 text-xs">
                    <div class="flex justify-between text-[#C5BCB2]">
                        <span>Metal Value:</span>
                        <span class="font-mono text-white">₹<span x-text="formatCurrency(metalValue)"></span></span>
                    </div>
                    <div class="flex justify-between text-[#C5BCB2]">
                        <span>Making + Wastage:</span>
                        <span class="font-mono text-white">₹<span x-text="formatCurrency(Number(simMakingCharge) + wastageValue)"></span></span>
                    </div>
                    <div class="flex justify-between text-[#A69D92] text-[11px]">
                        <span>GST (3%):</span>
                        <span class="font-mono">₹<span x-text="formatCurrency(gst)"></span></span>
                    </div>
                    <div class="pt-2 border-t border-[#3D362F] flex justify-between items-center text-sm font-serif font-bold text-pintaara-gold">
                        <span>Total Estimated:</span>
                        <span class="text-lg">₹<span x-text="formatCurrency(total)"></span></span>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- ACTIVE CATALOG SPOTLIGHT -->
    <div class="space-y-4 pt-4">
        <div class="flex items-center justify-between">
            <div>
                <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Catalog Master Spotlight</h3>
                <p class="text-xs text-pintaara-charcoal-muted">Active creations dynamically priced via Live Gold Engine</p>
            </div>
            <a href="{{ route('admin.products.create') }}" class="inline-flex items-center px-4 py-2 bg-pintaara-charcoal text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 hover:bg-black transition-colors shadow-xs">
                + New Master Piece
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach($recentProducts as $prod)
                @php $price = $productPrices[$prod->id] ?? null; @endphp
                <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs flex flex-col group hover:border-pintaara-gold/60 transition-all">
                    <div class="h-48 bg-pintaara-charcoal relative overflow-hidden">
                        @if($prod->primaryImage)
                            <img src="{{ $prod->primaryImage->url }}" alt="{{ $prod->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        @else
                            <div class="w-full h-full flex items-center justify-center text-pintaara-gold/40 font-serif text-2xl">PINTAARA</div>
                        @endif
                        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-black/70 text-pintaara-gold backdrop-blur-sm border border-pintaara-gold/30">
                            {{ $prod->tier }}
                        </span>
                        <span class="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/90 text-pintaara-charcoal font-bold">
                            {{ $prod->base_weight_grams }}g
                        </span>
                    </div>

                    <div class="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between text-[11px] text-pintaara-charcoal-muted mb-1 font-mono">
                                <span>{{ $prod->design_code }}</span>
                                <span>{{ $prod->collectionMaster->name ?? 'Fine Jewelry' }}</span>
                            </div>
                            <h4 class="font-serif font-bold text-base text-pintaara-charcoal group-hover:text-pintaara-gold transition-colors">{{ $prod->name }}</h4>
                            <p class="text-xs text-pintaara-charcoal-muted mt-1 line-clamp-2">{{ $prod->description }}</p>
                        </div>

                        <div class="mt-4 pt-3 border-t border-pintaara-line/60 flex items-center justify-between">
                            <div>
                                <p class="text-[10px] uppercase tracking-wider text-pintaara-charcoal-muted">Live 22KT Price</p>
                                <p class="font-serif font-bold text-lg text-pintaara-charcoal">
                                    ₹{{ number_format($price['total_price'] ?? 0) }}
                                </p>
                            </div>
                            <a href="{{ route('admin.products.edit', $prod->id) }}" class="px-3 py-1.5 rounded bg-white hover:bg-pintaara-sand text-xs font-semibold text-pintaara-charcoal border border-pintaara-line">
                                Edit Spec &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

</div>
@endsection
