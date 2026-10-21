@props([
    'title' => null,
    'subtitle' => null,
    'action' => null,
    'padding' => 'p-6',
])

<div {{ $attributes->merge(['class' => 'bg-[#FAF6F0] rounded-xl border border-pintaara-line/80 shadow-xs overflow-hidden']) }}>
    @if($title || $action)
        <div class="px-6 py-4 border-b border-pintaara-line/60 flex items-center justify-between bg-white/40">
            <div>
                @if($title)
                    <h3 class="font-serif font-semibold text-base text-pintaara-charcoal tracking-wide">{{ $title }}</h3>
                @endif
                @if($subtitle)
                    <p class="text-xs text-pintaara-charcoal-muted mt-0.5">{{ $subtitle }}</p>
                @endif
            </div>
            @if($action)
                <div class="flex items-center space-x-2">
                    {{ $action }}
                </div>
            @endif
        </div>
    @endif
    <div class="{{ $padding }}">
        {{ $slot }}
    </div>
</div>
