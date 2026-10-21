@props([
    'label' => null,
    'name',
    'type' => 'text',
    'value' => null,
    'placeholder' => '',
    'required' => false,
    'help' => null,
])

<div class="space-y-1">
    @if($label)
        <label for="{{ $name }}" class="block text-xs font-semibold uppercase tracking-wider text-pintaara-charcoal">
            {{ $label }}
            @if($required)
                <span class="text-rose-500">*</span>
            @endif
        </label>
    @endif

    <div class="relative">
        <input type="{{ $type }}" 
               name="{{ $name }}" 
               id="{{ $name }}" 
               value="{{ old($name, $value) }}" 
               placeholder="{{ $placeholder }}"
               {{ $required ? 'required' : '' }}
               {{ $attributes->merge(['class' => 'w-full px-3.5 py-2.5 bg-white border border-pintaara-line rounded text-sm text-pintaara-charcoal focus:border-pintaara-gold focus:ring-1 focus:ring-pintaara-gold focus:outline-none transition-colors shadow-2xs placeholder:text-pintaara-charcoal-muted/50']) }}>
    </div>

    @if($help)
        <p class="text-[11px] text-pintaara-charcoal-muted">{{ $help }}</p>
    @endif

    @error($name)
        <p class="text-xs text-rose-600 font-medium">{{ $message }}</p>
    @enderror
</div>
