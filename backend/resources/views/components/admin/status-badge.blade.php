@props(['status'])

@php
    $classes = match(strtolower($status)) {
        'confirmed' => 'bg-amber-100/80 text-amber-900 border-amber-300',
        'in_production' => 'bg-indigo-100/80 text-indigo-900 border-indigo-300',
        'inspection' => 'bg-purple-100/80 text-purple-900 border-purple-300',
        'shipped' => 'bg-blue-100/80 text-blue-900 border-blue-300',
        'delivered' => 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
        'active' => 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
        'draft' => 'bg-zinc-100/80 text-zinc-800 border-zinc-300',
        'archived', 'hidden', 'cancelled' => 'bg-rose-100/80 text-rose-900 border-rose-300',
        default => 'bg-[#FAF6F0] text-pintaara-charcoal border-pintaara-line',
    };

    $label = match(strtolower($status)) {
        'in_production' => 'In Production',
        'inspection' => 'Quality Inspection',
        'active' => 'Active',
        'draft' => 'Draft',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'confirmed' => 'Confirmed',
        'hidden' => 'Hidden',
        'cancelled' => 'Cancelled',
        default => ucfirst(str_replace('_', ' ', $status)),
    };
@endphp

<span {{ $attributes->merge(['class' => "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wider uppercase border {$classes}"]) }}>
    <span class="w-1.5 h-1.5 rounded-full mr-1.5 {{ match(strtolower($status)) {
        'confirmed' => 'bg-amber-500',
        'in_production' => 'bg-indigo-500 animate-pulse',
        'inspection' => 'bg-purple-500',
        'shipped' => 'bg-blue-500',
        'delivered', 'active' => 'bg-emerald-500',
        'draft' => 'bg-zinc-400',
        default => 'bg-rose-500',
    } }}"></span>
    {{ $label }}
</span>
