@extends('layouts.admin')

@section('title', 'Orders & 5-Step Pipeline')
@section('page-title', 'Orders & Atelier Pipeline')
@section('page-subtitle', 'Track orders through Confirmed, Production, Inspection, Transit, and Delivery')

@section('content')
<div class="space-y-6">

    <!-- 5-STEP STATUS FILTER TABS -->
    <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-pintaara-line/60">
        @php
            $currentStatus = request('status', 'all');
        @endphp

        <a href="{{ route('admin.orders.index', ['status' => 'all']) }}" 
           class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors {{ $currentStatus === 'all' ? 'bg-pintaara-charcoal text-pintaara-gold border-pintaara-gold/40 shadow-xs' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand' }}">
            All ({{ $counts['all'] }})
        </a>

        <a href="{{ route('admin.orders.index', ['status' => 'confirmed']) }}" 
           class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors {{ $currentStatus === 'confirmed' ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs font-bold' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand' }}">
            1. Confirmed ({{ $counts['confirmed'] }})
        </a>

        <a href="{{ route('admin.orders.index', ['status' => 'in_production']) }}" 
           class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors {{ $currentStatus === 'in_production' ? 'bg-indigo-100 text-indigo-900 border-indigo-300 shadow-xs font-bold' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand' }}">
            2. In Production ({{ $counts['in_production'] }})
        </a>

        <a href="{{ route('admin.orders.index', ['status' => 'inspection']) }}" 
           class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors {{ $currentStatus === 'inspection' ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-xs font-bold' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand' }}">
            3. Inspection ({{ $counts['inspection'] }})
        </a>

        <a href="{{ route('admin.orders.index', ['status' => 'shipped']) }}" 
           class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors {{ $currentStatus === 'shipped' ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-xs font-bold' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand' }}">
            4. Shipped ({{ $counts['shipped'] }})
        </a>

        <a href="{{ route('admin.orders.index', ['status' => 'delivered']) }}" 
           class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors {{ $currentStatus === 'delivered' ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs font-bold' : 'bg-white text-pintaara-charcoal border-pintaara-line hover:bg-pintaara-sand' }}">
            5. Delivered ({{ $counts['delivered'] }})
        </a>
    </div>

    <!-- Search Bar -->
    <form method="GET" action="{{ route('admin.orders.index') }}" class="flex items-center space-x-3">
        <input type="hidden" name="status" value="{{ request('status', 'all') }}">
        <div class="relative w-full max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-pintaara-charcoal-muted pointer-events-none">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by order #, client name, email, phone..." 
                   class="w-full pl-9 pr-3 py-2 bg-white border border-pintaara-line rounded text-xs focus:border-pintaara-gold">
        </div>
        <button type="submit" class="px-4 py-2 bg-pintaara-charcoal text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40">
            Search
        </button>
    </form>

    <!-- Orders Table -->
    <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-pintaara-line/60 text-left text-xs">
                <thead class="bg-white/60 text-pintaara-charcoal-muted uppercase font-bold tracking-wider">
                    <tr>
                        <th class="px-4 py-3.5">Order #</th>
                        <th class="px-4 py-3.5">Date</th>
                        <th class="px-4 py-3.5">Client Information</th>
                        <th class="px-4 py-3.5">Items & Specs</th>
                        <th class="px-4 py-3.5">5-Step Status</th>
                        <th class="px-4 py-3.5">Locked Rate</th>
                        <th class="px-4 py-3.5 text-right">Total Amount</th>
                        <th class="px-4 py-3.5 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-pintaara-line/40 bg-white/20">
                    @forelse($orders as $order)
                        <tr class="hover:bg-white/60 transition-colors">
                            <td class="px-4 py-3.5 font-mono font-bold text-pintaara-charcoal">
                                <a href="{{ route('admin.orders.show', $order->id) }}" class="text-pintaara-charcoal hover:text-pintaara-gold underline">
                                    {{ $order->order_number }}
                                </a>
                            </td>

                            <td class="px-4 py-3.5 text-pintaara-charcoal-muted">
                                {{ $order->created_at->format('d M, Y') }}
                                <span class="block text-[10px]">{{ $order->created_at->format('h:i A') }}</span>
                            </td>

                            <td class="px-4 py-3.5">
                                <p class="font-medium text-pintaara-charcoal">{{ $order->customer_name ?? 'VIP Client' }}</p>
                                <p class="text-[10px] text-pintaara-charcoal-muted">{{ $order->customer_email }}</p>
                                <p class="text-[10px] text-pintaara-charcoal-muted font-mono">{{ $order->customer_phone }}</p>
                            </td>

                            <td class="px-4 py-3.5">
                                @foreach($order->items as $item)
                                    <div class="mb-1 last:mb-0">
                                        <p class="font-medium text-pintaara-charcoal">{{ $item->product_name }}</p>
                                        <p class="text-[10px] text-pintaara-gold font-mono">
                                            {{ $item->metal_purity }} · {{ $item->finish }} · {{ $item->weight_used }}g
                                        </p>
                                    </div>
                                @endforeach
                            </td>

                            <td class="px-4 py-3.5">
                                <x-admin.status-badge :status="$order->status" />
                            </td>

                            <td class="px-4 py-3.5 font-mono text-[11px] text-pintaara-charcoal">
                                @if(isset($order->gold_rate_snapshot['gold_22kt_per_10g']))
                                    ₹{{ number_format($order->gold_rate_snapshot['gold_22kt_per_10g']) }}/10g
                                @else
                                    <span class="text-gray-400">Locked</span>
                                @endif
                            </td>

                            <td class="px-4 py-3.5 text-right font-serif font-bold text-sm text-pintaara-charcoal">
                                ₹{{ number_format($order->total_amount) }}
                                <span class="block text-[10px] text-emerald-700 font-sans font-medium uppercase">Paid</span>
                            </td>

                            <td class="px-4 py-3.5 text-right">
                                <a href="{{ route('admin.orders.show', $order->id) }}" class="px-3 py-1.5 bg-pintaara-charcoal text-pintaara-gold rounded text-xs font-semibold uppercase tracking-wider hover:bg-black border border-pintaara-gold/40">
                                    Manage &rarr;
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="px-4 py-12 text-center text-pintaara-charcoal-muted">
                                <p class="font-serif text-base text-pintaara-charcoal">No orders found for this status filter.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($orders->hasPages())
            <div class="px-4 py-3 border-t border-pintaara-line/60 bg-white/40">
                {{ $orders->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
