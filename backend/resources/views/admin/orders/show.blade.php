@extends('layouts.admin')

@section('title', 'Order Details — ' . $order->order_number)
@section('page-title', 'Order ' . $order->order_number)
@section('page-subtitle', 'Placed on ' . $order->created_at->format('d M, Y \a\t h:i A') . ' · Frozen Live Gold Snapshot')

@section('content')
<div class="space-y-8">

    <!-- TOP SUMMARY & 5-STEP TIMELINE BANNER -->
    <div class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pintaara-line/60 pb-4">
            <div>
                <div class="flex items-center space-x-3">
                    <h3 class="font-serif font-bold text-xl text-pintaara-charcoal">{{ $order->order_number }}</h3>
                    <x-admin.status-badge :status="$order->status" />
                </div>
                <p class="text-xs text-pintaara-charcoal-muted mt-1">Payment Method: <span class="uppercase font-bold text-pintaara-charcoal font-mono">{{ $order->payment_method }}</span> · Status: <span class="text-emerald-700 font-bold uppercase">{{ $order->payment_status }}</span></p>
            </div>

            <!-- Quick Status Transition Form -->
            <form action="{{ route('admin.orders.status', $order->id) }}" method="POST" class="flex items-center space-x-2">
                @csrf
                <select name="status" class="px-3 py-2 bg-white border border-pintaara-line rounded text-xs font-semibold focus:border-pintaara-gold">
                    <option value="confirmed" {{ $order->status === 'confirmed' ? 'selected' : '' }}>1. Confirmed</option>
                    <option value="in_production" {{ $order->status === 'in_production' ? 'selected' : '' }}>2. In Production</option>
                    <option value="inspection" {{ $order->status === 'inspection' ? 'selected' : '' }}>3. Quality Inspection</option>
                    <option value="shipped" {{ $order->status === 'shipped' ? 'selected' : '' }}>4. Shipped (Armored Transit)</option>
                    <option value="delivered" {{ $order->status === 'delivered' ? 'selected' : '' }}>5. Delivered</option>
                    <option value="cancelled" {{ $order->status === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                </select>
                <button type="submit" class="px-4 py-2 bg-pintaara-charcoal text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 hover:bg-black transition-colors shadow-xs">
                    Update Pipeline
                </button>
            </form>
        </div>

        <!-- 5-STEP VISUAL PROGRESSION TIMELINE -->
        <div class="py-2">
            <h4 class="text-xs uppercase font-bold tracking-widest text-pintaara-charcoal-muted mb-4">Atelier 5-Step Order Pipeline</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                @php
                    $stepKeys = array_keys($statusSteps);
                @endphp

                @foreach($statusSteps as $key => $step)
                    @php
                        $stepIndex = array_search($key, $stepKeys);
                        $isCompleted = ($currentStepIndex !== false && $stepIndex <= $currentStepIndex && $order->status !== 'cancelled');
                        $isCurrent = ($order->status === $key);
                    @endphp

                    <div class="p-3.5 rounded-lg border transition-all {{ $isCurrent ? 'bg-pintaara-charcoal text-white border-pintaara-gold shadow-md' : ($isCompleted ? 'bg-emerald-50/80 text-emerald-950 border-emerald-300' : 'bg-white/60 text-pintaara-charcoal-muted border-pintaara-line/60 opacity-60') }}">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold {{ $isCurrent ? 'bg-pintaara-gold text-pintaara-charcoal' : ($isCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600') }}">
                                {{ $stepIndex + 1 }}
                            </span>
                            @if($isCurrent)
                                <span class="w-2 h-2 rounded-full bg-pintaara-gold animate-pulse"></span>
                            @elseif($isCompleted)
                                <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                            @endif
                        </div>
                        <p class="font-serif font-bold text-xs {{ $isCurrent ? 'text-pintaara-gold' : 'text-pintaara-charcoal' }}">{{ $step['label'] }}</p>
                        <p class="text-[10px] mt-0.5 {{ $isCurrent ? 'text-[#C5BCB2]' : 'text-pintaara-charcoal-muted' }}">{{ $step['desc'] }}</p>
                    </div>
                @endforeach
            </div>
        </div>

    </div>

    <!-- 2-COLUMN SECTION: ITEM SPECS & FROZEN SNAPSHOT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- LEFT: ORDER ITEMS & ITEMIZED LEDGERS (8 Cols) -->
        <div class="lg:col-span-8 space-y-6">
            <div class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-6">
                <div class="flex items-center justify-between border-b border-pintaara-line/60 pb-3">
                    <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Ordered Fine Jewelry Items</h3>
                    <span class="text-xs text-pintaara-charcoal-muted">{{ $order->items->count() }} Line Item(s)</span>
                </div>

                <div class="space-y-6">
                    @foreach($order->items as $item)
                        <div class="p-5 rounded-xl bg-white border border-pintaara-line space-y-4">
                            <!-- Item Header -->
                            <div class="flex items-start justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-14 h-14 rounded-lg bg-pintaara-charcoal overflow-hidden border border-pintaara-line shrink-0">
                                        @if($item->product && $item->product->primaryImage)
                                            <img src="{{ $item->product->primaryImage->url }}" class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full flex items-center justify-center text-pintaara-gold font-serif font-bold text-sm">P</div>
                                        @endif
                                    </div>
                                    <div>
                                        <h4 class="font-serif font-bold text-base text-pintaara-charcoal">{{ $item->product_name }}</h4>
                                        <p class="text-xs text-pintaara-charcoal-muted font-mono">{{ $item->design_code }} · Qty: {{ $item->quantity }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-serif font-bold text-lg text-pintaara-charcoal">₹{{ number_format($item->total) }}</p>
                                    <p class="text-[10px] text-pintaara-charcoal-muted">₹{{ number_format($item->price) }} / unit</p>
                                </div>
                            </div>

                            <!-- Selected Specifications -->
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-pintaara-sand/30 p-3 rounded-lg border border-pintaara-line/60 font-sans">
                                <div><strong class="text-[10px] text-pintaara-charcoal-muted uppercase block">Purity:</strong> <span class="font-mono font-bold">{{ $item->metal_purity }}</span></div>
                                <div><strong class="text-[10px] text-pintaara-charcoal-muted uppercase block">Finish:</strong> <span>{{ $item->finish ?? 'Yellow Gold' }}</span></div>
                                <div><strong class="text-[10px] text-pintaara-charcoal-muted uppercase block">Size:</strong> <span>{{ $item->size ?? 'Standard' }}</span></div>
                                <div><strong class="text-[10px] text-pintaara-charcoal-muted uppercase block">Weight Used:</strong> <span class="font-bold">{{ number_format($item->weight_used, 3) }}g</span></div>
                            </div>

                            <!-- Frozen Jeweler's Ledger Itemized Table -->
                            <div class="pt-2">
                                <h5 class="text-[11px] uppercase font-bold tracking-wider text-pintaara-charcoal mb-2">Frozen Pricing Ledger (Locked at Checkout)</h5>
                                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs bg-pintaara-charcoal text-[#F5EDE4] p-3.5 rounded-lg border border-pintaara-gold/40">
                                    <div>
                                        <span class="text-[10px] text-[#A69D92] uppercase block">1. Metal Value</span>
                                        <span class="font-mono font-bold text-white">₹{{ number_format($item->metal_value) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[10px] text-[#A69D92] uppercase block">2. Wastage</span>
                                        <span class="font-mono text-[#D8CCBA]">₹{{ number_format($item->wastage_value) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[10px] text-[#A69D92] uppercase block">3. Making Charge</span>
                                        <span class="font-mono text-[#D8CCBA]">₹{{ number_format($item->making_charge) }}</span>
                                    </div>
                                    <div>
                                        <span class="text-[10px] text-[#A69D92] uppercase block">4. Stone / Gem</span>
                                        <span class="font-mono text-[#D8CCBA]">₹{{ number_format($item->stone_charge) }}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-[10px] text-pintaara-gold uppercase block">5. GST (3%)</span>
                                        <span class="font-mono font-bold text-pintaara-gold">₹{{ number_format($item->gst_amount) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>

                <!-- Order Totals -->
                <div class="p-4 rounded-xl bg-white border border-pintaara-line space-y-2 text-xs">
                    <div class="flex justify-between text-pintaara-charcoal">
                        <span>Subtotal (Metal + Wastage + Making + Gems):</span>
                        <span class="font-mono font-semibold">₹{{ number_format($order->subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-pintaara-charcoal-muted">
                        <span>GST (3% Fine Jewelry Tax):</span>
                        <span class="font-mono">₹{{ number_format($order->gst_amount) }}</span>
                    </div>
                    <div class="pt-2 border-t border-pintaara-line flex justify-between items-center text-sm font-serif font-bold text-pintaara-charcoal">
                        <span>Total Paid:</span>
                        <span class="text-xl text-pintaara-gold">₹{{ number_format($order->total_amount) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- RIGHT: CLIENT & FROZEN SNAPSHOT AUDIT (4 Cols) -->
        <div class="lg:col-span-4 space-y-6">
            
            <!-- Client & Shipping Details -->
            <div class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-4">
                <h3 class="font-serif font-semibold text-base text-pintaara-charcoal border-b border-pintaara-line/60 pb-2">
                    Client & Shipping Profile
                </h3>

                <div class="space-y-3 text-xs">
                    <div>
                        <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal-muted block">Client Name</span>
                        <p class="font-semibold text-sm text-pintaara-charcoal">{{ $order->customer_name ?? 'VIP Client' }}</p>
                    </div>

                    <div>
                        <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal-muted block">Email Address</span>
                        <p class="text-pintaara-charcoal font-mono">{{ $order->customer_email ?? '—' }}</p>
                    </div>

                    <div>
                        <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal-muted block">Phone Number</span>
                        <p class="text-pintaara-charcoal font-mono font-bold">{{ $order->customer_phone ?? '—' }}</p>
                    </div>

                    <div class="pt-2 border-t border-pintaara-line/60">
                        <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal-muted block">Armored Delivery Address</span>
                        <p class="text-pintaara-charcoal whitespace-pre-line leading-relaxed bg-white p-3 rounded border border-pintaara-line mt-1">{{ $order->shipping_address ?? 'No physical shipping address recorded.' }}</p>
                    </div>

                    @if($order->notes)
                        <div class="pt-2 border-t border-pintaara-line/60">
                            <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal-muted block">Order Notes</span>
                            <p class="text-xs text-pintaara-charcoal italic mt-0.5">{{ $order->notes }}</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Frozen Gold Rate Snapshot Inspector -->
            <div class="bg-pintaara-charcoal rounded-xl p-6 text-[#F5EDE4] border border-pintaara-gold/40 shadow-xl space-y-4">
                <div class="flex items-center justify-between border-b border-pintaara-gold/30 pb-2">
                    <h3 class="font-serif font-semibold text-base text-pintaara-gold">Frozen Rate Snapshot</h3>
                    <span class="px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-widest bg-black/50 text-pintaara-gold border border-pintaara-gold/40">Audit Locked</span>
                </div>

                <p class="text-[11px] text-[#A69D92]">
                    This order holds a permanent immutable snapshot of the market spot rates when the order was placed.
                </p>

                <div class="space-y-2 text-xs font-mono">
                    <div class="flex justify-between p-2 rounded bg-black/40 border border-[#3D362F]">
                        <span class="text-[#B5ACA0]">22KT Base / 10g:</span>
                        <span class="text-pintaara-gold font-bold">
                            ₹{{ number_format($order->gold_rate_snapshot['gold_22kt_per_10g'] ?? 100000) }}
                        </span>
                    </div>

                    <div class="flex justify-between p-2 rounded bg-black/40 border border-[#3D362F]">
                        <span class="text-[#B5ACA0]">24KT Pure / g:</span>
                        <span class="text-white">
                            ₹{{ number_format($order->gold_rate_snapshot['gold_24kt_per_g'] ?? 10917.03, 2) }}
                        </span>
                    </div>

                    <div class="flex justify-between p-2 rounded bg-black/40 border border-[#3D362F]">
                        <span class="text-[#B5ACA0]">Silver / 10g:</span>
                        <span class="text-[#E8E8E8]">
                            ₹{{ number_format($order->gold_rate_snapshot['silver_per_10g'] ?? 950) }}
                        </span>
                    </div>
                </div>
            </div>

        </div>

    </div>

</div>
@endsection
