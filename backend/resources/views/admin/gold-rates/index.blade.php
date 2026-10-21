@extends('layouts.admin')

@section('title', 'Gold Rate Manager')
@section('page-title', 'Daily Spot Market Rates')
@section('page-subtitle', 'Base 22KT & Silver rates driving real-time price calculations across all catalog items')

@section('content')
<div class="space-y-8">

    <!-- LIVE CONVERSION CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- 24KT Pure -->
        <div class="bg-pintaara-charcoal rounded-xl p-4 text-[#F5EDE4] border border-pintaara-gold/40 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-widest text-pintaara-gold">24KT Pure Benchmark</span>
                <span class="w-2 h-2 rounded-full bg-pintaara-gold"></span>
            </div>
            <div class="mt-3">
                <p class="font-serif font-bold text-2xl text-white">₹{{ number_format($currentPure24, 2) }}<span class="text-xs font-sans text-[#A69D92]">/g</span></p>
                <p class="text-[10px] text-[#A69D92] mt-0.5">100% Fine Gold fraction (1.000)</p>
            </div>
        </div>

        <!-- 22KT Standard -->
        <div class="bg-[#FAF6F0] rounded-xl p-4 border border-pintaara-line/80 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal">22KT Gold (91.6%)</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div class="mt-3">
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal">₹{{ number_format($currentGold22 / 10, 2) }}<span class="text-xs font-sans text-pintaara-charcoal-muted">/g</span></p>
                <p class="text-[10px] text-pintaara-charcoal-muted mt-0.5">₹{{ number_format($currentGold22) }} / 10g (Atelier Base)</p>
            </div>
        </div>

        <!-- 18KT Luxury -->
        <div class="bg-[#FAF6F0] rounded-xl p-4 border border-pintaara-line/80 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal">18KT Gold (75.0%)</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div class="mt-3">
                @php $rate18 = ($currentPure24 * 0.750); @endphp
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal">₹{{ number_format($rate18, 2) }}<span class="text-xs font-sans text-pintaara-charcoal-muted">/g</span></p>
                <p class="text-[10px] text-pintaara-charcoal-muted mt-0.5">₹{{ number_format($rate18 * 10, 1) }} / 10g</p>
            </div>
        </div>

        <!-- 14KT Everyday -->
        <div class="bg-[#FAF6F0] rounded-xl p-4 border border-pintaara-line/80 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal">14KT Gold (58.5%)</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div class="mt-3">
                @php $rate14 = ($currentPure24 * 0.585); @endphp
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal">₹{{ number_format($rate14, 2) }}<span class="text-xs font-sans text-pintaara-charcoal-muted">/g</span></p>
                <p class="text-[10px] text-pintaara-charcoal-muted mt-0.5">₹{{ number_format($rate14 * 10, 1) }} / 10g</p>
            </div>
        </div>

        <!-- 925 Silver -->
        <div class="bg-[#FAF6F0] rounded-xl p-4 border border-pintaara-line/80 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider text-pintaara-charcoal">925 Fine Silver</span>
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <div class="mt-3">
                <p class="font-serif font-bold text-2xl text-pintaara-charcoal">₹{{ number_format($currentSilver10 / 10, 2) }}<span class="text-xs font-sans text-pintaara-charcoal-muted">/g</span></p>
                <p class="text-[10px] text-pintaara-charcoal-muted mt-0.5">₹{{ number_format($currentSilver10) }} / 10g</p>
            </div>
        </div>
    </div>

    <!-- DAILY RATE ENTRY & AUDIT FORM -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- PUNCH DAILY RATE (1 Col) -->
        <div class="lg:col-span-1">
            <div class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs sticky top-24">
                <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal mb-1">Enter Today's Market Rates</h3>
                <p class="text-xs text-pintaara-charcoal-muted mb-5">Submitting updates the live spot price across all storefront and customizer views immediately.</p>

                <form action="{{ route('admin.gold-rate.store') }}" method="POST" class="space-y-4">
                    @csrf
                    
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                            22KT Gold Spot Rate (₹ / 10g) *
                        </label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-pintaara-charcoal-muted font-serif font-bold">₹</span>
                            <input type="number" step="0.01" name="gold_rate_22kt" value="{{ $currentGold22 }}" required
                                   class="w-full pl-8 pr-3 py-2.5 bg-white border border-pintaara-line rounded text-lg font-serif font-bold text-pintaara-charcoal focus:border-pintaara-gold focus:ring-1 focus:ring-pintaara-gold">
                        </div>
                        <p class="text-[11px] text-pintaara-charcoal-muted mt-1">E.g. 100000 for ₹1,00,000 / 10g</p>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                            Silver Rate (₹ / 10g)
                        </label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-pintaara-charcoal-muted font-serif font-bold">₹</span>
                            <input type="number" step="0.01" name="silver_rate_10g" value="{{ $currentSilver10 }}"
                                   class="w-full pl-8 pr-3 py-2.5 bg-white border border-pintaara-line rounded text-lg font-serif font-bold text-pintaara-charcoal focus:border-pintaara-gold focus:ring-1 focus:ring-pintaara-gold">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                            Effective Date *
                        </label>
                        <input type="date" name="effective_date" value="{{ date('Y-m-d') }}" required
                               class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm text-pintaara-charcoal">
                    </div>

                    <button type="submit" class="w-full py-3 bg-pintaara-charcoal hover:bg-black text-pintaara-gold rounded font-semibold text-xs uppercase tracking-wider border border-pintaara-gold/40 shadow-sm transition-colors">
                        Lock In Today's Spot Rates
                    </button>
                </form>
            </div>
        </div>

        <!-- HISTORICAL SPOT LOG (2 Cols) -->
        <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Spot Rate Audit Trail</h3>
                    <p class="text-xs text-pintaara-charcoal-muted">Permanent immutable log of past daily rates and recording master</p>
                </div>
            </div>

            <div class="bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 overflow-hidden shadow-xs">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-pintaara-line/60 text-left text-xs">
                        <thead class="bg-white/60 text-pintaara-charcoal-muted uppercase font-bold tracking-wider">
                            <tr>
                                <th class="px-4 py-3">Effective Date</th>
                                <th class="px-4 py-3">Metal</th>
                                <th class="px-4 py-3">Base Rate / 10g</th>
                                <th class="px-4 py-3">Pure 24KT / g</th>
                                <th class="px-4 py-3">Logged By</th>
                                <th class="px-4 py-3">Source</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-pintaara-line/40 bg-white/20">
                            @forelse($rates as $r)
                                @php 
                                    $pureG = $r->metal_type === 'gold' ? (($r->rate_per_10g / 10) / 0.916) : (($r->rate_per_10g / 10) / 0.925);
                                @endphp
                                <tr class="hover:bg-white/60 transition-colors">
                                    <td class="px-4 py-3 font-medium text-pintaara-charcoal">
                                        {{ $r->effective_date->format('d M, Y') }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider {{ $r->metal_type === 'gold' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-800 border border-slate-300' }}">
                                            {{ ucfirst($r->metal_type) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 font-serif font-bold text-pintaara-charcoal text-sm">
                                        ₹{{ number_format($r->rate_per_10g) }}
                                    </td>
                                    <td class="px-4 py-3 font-mono text-pintaara-charcoal">
                                        ₹{{ number_format($pureG, 2) }}
                                    </td>
                                    <td class="px-4 py-3 text-pintaara-charcoal-muted">
                                        {{ $r->creator->name ?? 'System Master' }}
                                    </td>
                                    <td class="px-4 py-3 font-mono text-[10px] uppercase text-pintaara-charcoal-muted">
                                        {{ $r->source }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-4 py-8 text-center text-pintaara-charcoal-muted">No spot rate records logged yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if($rates->hasPages())
                    <div class="px-4 py-3 border-t border-pintaara-line/60 bg-white/40">
                        {{ $rates->links() }}
                    </div>
                @endif
            </div>
        </div>

    </div>

</div>
@endsection
