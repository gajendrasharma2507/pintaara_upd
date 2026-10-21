@props([
    'baseGoldRate22kt' => 100000.00,
    'defaultWeight' => 8.500,
    'defaultMakingCharge' => 3000.00,
    'defaultMakingPercent' => 0.00,
    'defaultWastage' => 0.00,
    'gstPercent' => 3.0,
])

<div {{ $attributes->merge(['class' => 'bg-[#2B2620] text-[#F5EDE4] rounded-xl border border-pintaara-gold/40 shadow-xl overflow-hidden']) }}>
    <!-- Header -->
    <div class="px-5 py-4 bg-[#201C17] border-b border-pintaara-gold/30 flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded border border-pintaara-gold/60 flex items-center justify-center bg-black/40">
                <span class="font-serif text-pintaara-gold text-xs font-bold">₹</span>
            </div>
            <div>
                <h4 class="font-serif text-sm font-semibold tracking-wide text-pintaara-gold uppercase">Jeweler's Ledger</h4>
                <p class="text-[10px] text-[#A69D92] tracking-wider uppercase font-sans">Live Pricing Matrix</p>
            </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest bg-pintaara-gold/20 text-pintaara-gold border border-pintaara-gold/40">
            Audit Ready
        </span>
    </div>

    <!-- Breakdown Content -->
    <div class="p-5 space-y-3.5 text-xs font-sans">
        
        <!-- Live Spot Reference -->
        <div class="p-2.5 rounded bg-black/30 border border-[#3D362F] flex items-center justify-between text-[11px]">
            <span class="text-[#B5ACA0]">22KT Base / 10g:</span>
            <span class="font-mono font-bold text-pintaara-gold">₹<span x-text="formatCurrency(goldRate22kt)">{{ number_format($baseGoldRate22kt) }}</span></span>
        </div>

        <!-- Weight & Purity Rate -->
        <div class="flex items-center justify-between py-1 border-b border-[#3D362F]/60">
            <span class="text-[#B5ACA0]">Weight & Selected Purity:</span>
            <span class="font-medium text-[#F5EDE4]">
                <span x-text="Number(weight).toFixed(3)">{{ number_format($defaultWeight, 3) }}</span>g @ 
                <span class="text-pintaara-gold font-mono" x-text="selectedPurityName || '22KT'">22KT</span>
            </span>
        </div>

        <div class="flex items-center justify-between py-1 border-b border-[#3D362F]/60 text-[11px]">
            <span class="text-[#8C8377]">Purity Rate / gram:</span>
            <span class="font-mono text-[#D8CCBA]">₹<span x-text="formatCurrency(effectiveRatePerGram)">10,000</span></span>
        </div>

        <!-- Itemized Rows -->
        <!-- 1. Metal Value -->
        <div class="flex items-center justify-between py-1 text-[#F5EDE4]">
            <span class="text-[#C5BCB2]">1. Metal Value:</span>
            <span class="font-mono font-semibold text-white">₹<span x-text="formatCurrency(metalValue)">85,000</span></span>
        </div>

        <!-- 2. Wastage -->
        <div class="flex items-center justify-between py-1 text-[#F5EDE4]">
            <span class="text-[#C5BCB2]">2. Wastage (<span x-text="wastagePercent || 0">0</span>%):</span>
            <span class="font-mono text-[#E4DDD3]">₹<span x-text="formatCurrency(wastageValue)">0</span></span>
        </div>

        <!-- 3. Making Charge -->
        <div class="flex items-center justify-between py-1 text-[#F5EDE4]">
            <span class="text-[#C5BCB2]">3. Making Charge:</span>
            <span class="font-mono text-[#E4DDD3]">₹<span x-text="formatCurrency(makingChargeValue)">3,000</span></span>
        </div>

        <!-- 4. Stone / Gem Charge -->
        <div class="flex items-center justify-between py-1 text-[#F5EDE4]">
            <span class="text-[#C5BCB2]">4. Gem / Stone Value:</span>
            <span class="font-mono text-[#E4DDD3]">₹<span x-text="formatCurrency(stoneChargeValue)">0</span></span>
        </div>

        <!-- 5. Taxable Subtotal -->
        <div class="pt-2 pb-1 border-t border-[#3D362F] flex items-center justify-between text-xs font-medium text-pintaara-gold">
            <span>Taxable Subtotal:</span>
            <span class="font-mono font-bold">₹<span x-text="formatCurrency(subtotalValue)">88,000</span></span>
        </div>

        <!-- 6. GST (3%) -->
        <div class="flex items-center justify-between py-1 text-[11px] text-[#A69D92]">
            <span>GST (<span x-text="gstPercent">3</span>% Fine Jewelry):</span>
            <span class="font-mono">₹<span x-text="formatCurrency(gstValue)">2,640</span></span>
        </div>

        <!-- 7. FINAL LIVE PRICE -->
        <div class="mt-3 p-3.5 rounded-lg bg-gradient-to-r from-black/80 to-[#1A1713] border border-pintaara-gold flex items-center justify-between shadow-lg">
            <div>
                <p class="text-[10px] uppercase font-bold tracking-widest text-pintaara-gold">Computed Live Price</p>
                <p class="text-[10px] text-[#8C8377]">All taxes & charges inclusive</p>
            </div>
            <div class="text-right">
                <span class="font-serif font-bold text-xl text-pintaara-gold tracking-wide">
                    ₹<span x-text="formatCurrency(finalPrice)">90,640</span>
                </span>
            </div>
        </div>

    </div>
</div>
