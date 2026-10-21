@extends('layouts.admin')

@section('title', 'Atelier Settings & Taxation')
@section('page-title', 'Atelier Configuration')
@section('page-subtitle', 'Global tax percentages, wastage margins, and atelier contact info')

@section('content')
<div class="max-w-3xl space-y-6">

    <div class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-6">
        <div class="border-b border-pintaara-line/60 pb-3">
            <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Taxation & Global Pricing Formula</h3>
            <p class="text-xs text-pintaara-charcoal-muted">Controls the pricing calculations across the Live Gold Engine</p>
        </div>

        <form action="{{ route('admin.settings.update') }}" method="POST" class="space-y-5">
            @csrf

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                        GST Rate (%) *
                    </label>
                    <div class="relative">
                        <input type="number" step="0.1" name="gst_percent" value="{{ $settings['gst_percent'] }}" required
                               class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono font-bold focus:border-pintaara-gold">
                    </div>
                    <p class="text-[11px] text-pintaara-charcoal-muted mt-1">Standard fine jewelry rate is 3.0%</p>
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                        Default Wastage (%)
                    </label>
                    <input type="number" step="0.5" name="default_wastage_percent" value="{{ $settings['default_wastage_percent'] }}"
                           class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-mono focus:border-pintaara-gold">
                    <p class="text-[11px] text-pintaara-charcoal-muted mt-1">Default applied to new products</p>
                </div>
            </div>

            <div class="pt-4 border-t border-pintaara-line/60">
                <h4 class="font-serif font-semibold text-base text-pintaara-charcoal mb-3">Brand & Concierge Identity</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Brand Name</label>
                        <input type="text" name="brand_name" value="{{ $settings['brand_name'] }}" required
                               class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">Currency Symbol</label>
                        <input type="text" name="currency_symbol" value="{{ $settings['currency_symbol'] }}" required
                               class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm font-serif font-bold focus:border-pintaara-gold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">VIP Concierge Email</label>
                        <input type="email" name="contact_email" value="{{ $settings['contact_email'] }}" required
                               class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">VIP Concierge Hotline</label>
                        <input type="text" name="contact_phone" value="{{ $settings['contact_phone'] }}"
                               class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                    </div>
                </div>
            </div>

            <div class="pt-4 border-t border-pintaara-line/60 flex justify-end">
                <button type="submit" class="px-6 py-2.5 bg-pintaara-charcoal hover:bg-black text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 shadow-sm">
                    Save Atelier Settings
                </button>
            </div>
        </form>
    </div>

    <!-- Update Password Section -->
    <div class="bg-[#FAF6F0] rounded-xl p-6 border border-pintaara-line/80 shadow-xs space-y-6 mt-6">
        <div class="border-b border-pintaara-line/60 pb-3">
            <h3 class="font-serif font-semibold text-lg text-pintaara-charcoal">Update Admin Password</h3>
            <p class="text-xs text-pintaara-charcoal-muted">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <form action="{{ route('admin.settings.password.update') }}" method="POST" class="space-y-5">
            @csrf
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2 max-w-md">
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                        Current Password *
                    </label>
                    <input type="password" name="current_password" required
                           class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                    @error('current_password')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="max-w-md">
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                        New Password *
                    </label>
                    <input type="password" name="password" required
                           class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                    @error('password')
                        <p class="text-xs text-red-600 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="max-w-md">
                    <label class="block text-xs font-bold uppercase tracking-wider text-pintaara-charcoal mb-1">
                        Confirm Password *
                    </label>
                    <input type="password" name="password_confirmation" required
                           class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-sm focus:border-pintaara-gold">
                </div>
            </div>

            <div class="pt-4 border-t border-pintaara-line/60 flex justify-end">
                <button type="submit" class="px-6 py-2.5 bg-pintaara-charcoal hover:bg-black text-pintaara-gold text-xs font-semibold uppercase tracking-wider rounded border border-pintaara-gold/40 shadow-sm">
                    Update Password
                </button>
            </div>
        </form>
    </div>

</div>
@endsection
