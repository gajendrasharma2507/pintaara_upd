@props([
    'variant' => 'primary', // primary, secondary, outline, danger
    'size' => 'md', // sm, md, lg
    'type' => 'button',
    'href' => null,
])

@php
    $baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-xs tracking-wider uppercase';
    
    $variantClasses = match($variant) {
        'primary' => 'bg-pintaara-charcoal hover:bg-black text-pintaara-gold border border-pintaara-gold/40 shadow-sm',
        'secondary' => 'bg-pintaara-gold hover:bg-pintaara-gold-dark text-pintaara-charcoal border border-pintaara-gold shadow-sm font-semibold',
        'outline' => 'bg-white/80 hover:bg-white text-pintaara-charcoal border border-pintaara-line hover:border-pintaara-charcoal',
        'danger' => 'bg-rose-700 hover:bg-rose-800 text-white border border-rose-800',
        'ghost' => 'text-pintaara-charcoal hover:bg-pintaara-sand/60 shadow-none border-transparent',
        default => 'bg-pintaara-charcoal text-pintaara-gold',
    };

    $sizeClasses = match($size) {
        'sm' => 'px-3 py-1.5 text-[11px]',
        'md' => 'px-4 py-2 text-xs',
        'lg' => 'px-6 py-3 text-sm',
        default => 'px-4 py-2 text-xs',
    };

    $classes = "{$baseClasses} {$variantClasses} {$sizeClasses}";
@endphp

@if($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>
        {{ $slot }}
    </a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $classes]) }}>
        {{ $slot }}
    </button>
@endif
