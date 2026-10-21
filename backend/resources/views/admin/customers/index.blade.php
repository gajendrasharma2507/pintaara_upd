@extends('layouts.admin')

@section('title', 'VIP Client Directory')
@section('page-title', 'VIP Client Directory')
@section('page-subtitle', 'Patron relationships, lifetime valuation, and bespoke commissions')

@section('content')
<div class="space-y-6">

    <div class="flex items-center justify-between">
        <div>
            <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Atelier Client Registry</h3>
            <p class="text-xs text-pintaara-charcoal-muted">High-net-worth collectors and fine jewelry patrons</p>
        </div>
    </div>

    <!-- Customers Table -->
    <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-pintaara-line/60 text-left text-xs">
                <thead class="bg-white/60 text-pintaara-charcoal-muted uppercase font-bold tracking-wider">
                    <tr>
                        <th class="px-4 py-3.5">Client Patron</th>
                        <th class="px-4 py-3.5">Contact Details</th>
                        <th class="px-4 py-3.5">Total Orders</th>
                        <th class="px-4 py-3.5">Lifetime Valuation</th>
                        <th class="px-4 py-3.5">Last Commission</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-pintaara-line/40 bg-white/20">
                    @forelse($customers as $c)
                        <tr class="hover:bg-white/60 transition-colors">
                            <td class="px-4 py-3.5 flex items-center space-x-3">
                                <div class="w-9 h-9 rounded-full bg-pintaara-charcoal text-pintaara-gold border border-pintaara-gold/40 flex items-center justify-center font-serif font-bold text-xs">
                                    {{ substr($c['name'], 0, 2) }}
                                </div>
                                <div>
                                    <p class="font-serif font-bold text-sm text-pintaara-charcoal">{{ $c['name'] }}</p>
                                    <span class="text-[10px] uppercase tracking-wider text-pintaara-gold font-bold">VIP Patron</span>
                                </div>
                            </td>

                            <td class="px-4 py-3.5">
                                <p class="text-pintaara-charcoal font-mono">{{ $c['email'] }}</p>
                                <p class="text-[10px] text-pintaara-charcoal-muted font-mono">{{ $c['phone'] }}</p>
                            </td>

                            <td class="px-4 py-3.5 font-medium text-pintaara-charcoal">
                                {{ $c['orders_count'] }} Order(s)
                            </td>

                            <td class="px-4 py-3.5 font-serif font-bold text-sm text-pintaara-charcoal">
                                ₹{{ number_format($c['total_spent']) }}
                            </td>

                            <td class="px-4 py-3.5 text-pintaara-charcoal-muted font-mono text-[11px]">
                                {{ $c['last_order_at']->format('d M, Y') }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-4 py-12 text-center text-pintaara-charcoal-muted">
                                No customer records found.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection
