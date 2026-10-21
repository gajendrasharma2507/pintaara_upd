<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-[#F5EDE4]">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Admin Atelier') — PINTAARA Fine Jewelry</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        pintaara: {
                            cream: '#F5EDE4',
                            'cream-dark': '#E9DFD2',
                            'cream-light': '#FAF5EE',
                            charcoal: '#2B2620',
                            'charcoal-light': '#3D362F',
                            'charcoal-muted': '#524B43',
                            gold: '#C9A961',
                            'gold-light': '#DFC482',
                            'gold-dark': '#A38440',
                            line: '#D8CCBA',
                            sand: '#EFE7DA',
                        }
                    },
                    fontFamily: {
                        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
                        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
                        editorial: ['Cormorant Garamond', 'serif'],
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        
        /* Custom Pintaara Scrollbars */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #F5EDE4;
        }
        ::-webkit-scrollbar-thumb {
            background: #D8CCBA;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #C9A961;
        }
    </style>
    @stack('styles')
</head>
<body class="h-full font-sans antialiased text-pintaara-charcoal bg-[#F5EDE4]" x-data="{ quickRateModal: false, mobileSidebar: false }">

<div class="min-h-full flex">

    <!-- Mobile sidebar backdrop -->
    <div x-show="mobileSidebar" x-cloak 
         @click="mobileSidebar = false" 
         class="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm transition-opacity"></div>

    <!-- SIDEBAR -->
    <aside :class="mobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
           class="fixed inset-y-0 left-0 z-50 w-72 bg-pintaara-charcoal text-[#F5EDE4] flex flex-col transition-transform duration-300 ease-in-out border-r border-[#3D362F] shadow-2xl">
        
        <!-- Brand Header -->
        <div class="h-20 flex items-center justify-between px-6 border-b border-[#3D362F]/80">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center space-x-3 group">
                <div class="w-9 h-9 rounded border border-pintaara-gold/40 flex items-center justify-center bg-pintaara-charcoal-light shadow-inner group-hover:border-pintaara-gold transition-colors">
                    <span class="font-serif text-pintaara-gold font-bold text-xl tracking-wider">P</span>
                </div>
                <div>
                    <h1 class="font-serif text-lg tracking-[0.25em] font-semibold text-[#F5EDE4] uppercase group-hover:text-pintaara-gold transition-colors">PINTAARA</h1>
                    <p class="text-[10px] tracking-[0.2em] text-pintaara-gold/80 uppercase font-sans font-medium">Atelier Admin</p>
                </div>
            </a>
            <button @click="mobileSidebar = false" class="lg:hidden text-pintaara-gold/80 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <!-- Live Spot Rate Card in Sidebar -->
        @php
            $pricing = app(\App\Services\JewelryPricingService::class);
            $currentGold22 = $pricing->getBaseGoldRatePer10g();
            $currentPure24 = $pricing->calculatePureGoldRatePerGram($currentGold22);
            $latestRateRecord = $pricing->getLatestRate('gold');
        @endphp
        <div class="px-5 py-4 m-4 rounded-lg bg-[#221E19] border border-pintaara-gold/20 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span class="text-[11px] font-semibold tracking-wider uppercase text-pintaara-gold">Live Gold Rate</span>
                </div>
                <button @click="quickRateModal = true" class="text-[10px] uppercase tracking-wider text-pintaara-gold/70 hover:text-pintaara-gold underline">Edit</button>
            </div>
            <div class="flex items-baseline justify-between">
                <span class="text-xs text-[#C5BCB2]">22KT / 10g:</span>
                <span class="font-serif font-bold text-sm text-[#F5EDE4]">₹{{ number_format($currentGold22) }}</span>
            </div>
            <div class="flex items-baseline justify-between mt-1 pt-1 border-t border-[#3D362F]/60 text-[11px] text-[#A69D92]">
                <span>24KT Pure / g:</span>
                <span class="font-medium text-pintaara-gold">₹{{ number_format($currentPure24, 1) }}</span>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            <div class="px-3 pt-2 pb-1 text-[10px] uppercase font-bold tracking-[0.2em] text-pintaara-gold/60">Core Atelier</div>
            
            <a href="{{ route('admin.dashboard') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.dashboard') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.dashboard') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Dashboard Overview
            </a>

            <a href="{{ route('admin.gold-rate.index') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.gold-rate.*') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.gold-rate.*') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                Gold Rate Manager
            </a>

            <div class="px-3 pt-4 pb-1 text-[10px] uppercase font-bold tracking-[0.2em] text-pintaara-gold/60">Catalog & Craft</div>

            <a href="{{ route('admin.collections.index') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.collections.*') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.collections.*') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                Collections Master
            </a>

            <a href="{{ route('admin.products.index') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.products.*') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.products.*') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                Products & Matrix
            </a>

            <div class="px-3 pt-4 pb-1 text-[10px] uppercase font-bold tracking-[0.2em] text-pintaara-gold/60">Sales & Clients</div>

            <a href="{{ route('admin.orders.index') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.orders.*') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.orders.*') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Orders & Tracking
            </a>

            <a href="{{ route('admin.customers.index') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.customers.*') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.customers.*') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                VIP Clients
            </a>

            <div class="px-3 pt-4 pb-1 text-[10px] uppercase font-bold tracking-[0.2em] text-pintaara-gold/60">Configuration</div>

            <a href="{{ route('admin.settings.index') }}" 
               class="flex items-center px-3 py-2.5 rounded text-xs font-medium tracking-wide transition-all {{ request()->routeIs('admin.settings.*') ? 'bg-[#3D362F] text-pintaara-gold border-l-2 border-pintaara-gold font-semibold shadow-sm' : 'text-[#D8CCBA] hover:bg-[#342E27] hover:text-white' }}">
                <svg class="w-4 h-4 mr-3 {{ request()->routeIs('admin.settings.*') ? 'text-pintaara-gold' : 'text-[#968C7F]' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Atelier Settings
            </a>
        </nav>

        <!-- Footer Profile -->
        <div class="p-4 border-t border-[#3D362F] flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-pintaara-gold/20 border border-pintaara-gold flex items-center justify-center font-serif text-pintaara-gold font-bold text-xs">
                    DS
                </div>
                <div class="text-left">
                    <p class="text-xs font-medium text-[#F5EDE4]">Darshit Soni</p>
                    <p class="text-[10px] text-[#A69D92]">Master Jeweler</p>
                </div>
            </div>
        </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        <!-- TOPBAR -->
        <header class="h-20 bg-pintaara-cream border-b border-pintaara-line/80 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md bg-pintaara-cream/95">
            <div class="flex items-center space-x-4">
                <button @click="mobileSidebar = true" class="lg:hidden p-2 text-pintaara-charcoal hover:text-pintaara-gold">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <div>
                    <h2 class="font-serif text-xl font-semibold text-pintaara-charcoal tracking-wide">@yield('page-title', 'Dashboard')</h2>
                    <p class="text-xs text-pintaara-charcoal-muted tracking-wide">@yield('page-subtitle', 'PINTAARA Fine Jewelry Management System')</p>
                </div>
            </div>

            <!-- Topbar Right: Quick Rate Widget & Actions -->
            <div class="flex items-center space-x-4">
                <!-- Live Rate Badge -->
                <button @click="quickRateModal = true" 
                        class="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded border border-pintaara-gold/40 bg-white/80 hover:bg-white text-pintaara-charcoal shadow-xs transition-all group">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-xs font-semibold text-pintaara-charcoal font-sans">
                        Gold 22KT: <span class="text-pintaara-gold font-serif font-bold">₹{{ number_format($currentGold22) }}</span>/10g
                    </span>
                    <span class="text-[10px] text-pintaara-charcoal-muted bg-pintaara-sand px-1.5 py-0.5 rounded font-mono">
                        {{ $latestRateRecord ? $latestRateRecord->effective_date->format('d M') : 'Today' }}
                    </span>
                </button>

                <!-- Storefront Link -->
                <a href="http://localhost:3000" target="_blank" 
                   class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-pintaara-charcoal bg-white/60 hover:bg-white border border-pintaara-line rounded transition-colors shadow-2xs">
                    <svg class="w-3.5 h-3.5 mr-1.5 text-pintaara-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Storefront
                </a>
            </div>
        </header>

        <!-- FLASH NOTIFICATIONS -->
        <div class="px-6 lg:px-8 pt-4">
            @if(session('success'))
                <div class="p-4 mb-4 rounded border border-emerald-300 bg-emerald-50/90 text-emerald-900 flex items-center justify-between shadow-2xs">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span class="text-sm font-medium">{{ session('success') }}</span>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div class="p-4 mb-4 rounded border border-rose-300 bg-rose-50/90 text-rose-900 flex items-center justify-between shadow-2xs">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-rose-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span class="text-sm font-medium">{{ session('error') }}</span>
                    </div>
                </div>
            @endif
        </div>

        <!-- MAIN VIEW BODY -->
        <main class="flex-1 px-6 lg:px-8 py-6">
            @yield('content')
        </main>

        <!-- FOOTER -->
        <footer class="px-6 lg:px-8 py-4 border-t border-pintaara-line/60 text-center text-xs text-pintaara-charcoal-muted flex flex-col sm:flex-row items-center justify-between">
            <p>© {{ date('Y') }} PINTAARA Luxury Fine Jewelry Atelier. All pricing computed via pure Live Gold Formula.</p>
            <p class="font-serif italic text-pintaara-gold">Handcrafted in Mumbai & Ahmedabad</p>
        </footer>

    </div>

</div>

<!-- QUICK GOLD RATE MODAL -->
<div x-show="quickRateModal" x-cloak 
     class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div @click.away="quickRateModal = false" 
         class="bg-[#FAF6F0] rounded-xl border border-pintaara-gold/40 shadow-2xl max-w-md w-full overflow-hidden">
        <div class="px-6 py-4 bg-pintaara-charcoal text-[#F5EDE4] flex items-center justify-between border-b border-pintaara-gold/30">
            <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-pintaara-gold animate-pulse"></span>
                <h3 class="font-serif font-semibold text-lg text-pintaara-gold tracking-wide">Quick Update Market Rate</h3>
            </div>
            <button @click="quickRateModal = false" class="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <form action="{{ route('admin.gold-rate.store') }}" method="POST" class="p-6 space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-pintaara-charcoal mb-1">
                    22KT Gold Rate (₹ per 10g)
                </label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-pintaara-charcoal-muted font-serif">₹</span>
                    <input type="number" step="0.01" name="gold_rate_22kt" value="{{ $currentGold22 }}" required
                           class="w-full pl-8 pr-4 py-2.5 bg-white border border-pintaara-line rounded text-pintaara-charcoal focus:border-pintaara-gold focus:ring-1 focus:ring-pintaara-gold font-serif text-lg font-bold">
                </div>
                <p class="text-[11px] text-pintaara-charcoal-muted mt-1">24KT pure gold benchmark will be computed automatically.</p>
            </div>

            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-pintaara-charcoal mb-1">
                    Silver Rate (₹ per 10g)
                </label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-pintaara-charcoal-muted font-serif">₹</span>
                    <input type="number" step="0.01" name="silver_rate_10g" value="{{ $pricing->getBaseSilverRatePer10g() }}" required
                           class="w-full pl-8 pr-4 py-2.5 bg-white border border-pintaara-line rounded text-pintaara-charcoal focus:border-pintaara-gold focus:ring-1 focus:ring-pintaara-gold font-serif text-lg font-bold">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-pintaara-charcoal mb-1">
                    Effective Date
                </label>
                <input type="date" name="effective_date" value="{{ date('Y-m-d') }}" required
                       class="w-full px-3 py-2 bg-white border border-pintaara-line rounded text-pintaara-charcoal text-sm">
            </div>

            <div class="pt-3 border-t border-pintaara-line flex justify-end space-x-3">
                <button type="button" @click="quickRateModal = false" class="px-4 py-2 text-xs font-medium text-pintaara-charcoal hover:bg-pintaara-sand rounded">Cancel</button>
                <button type="submit" class="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-pintaara-charcoal text-pintaara-gold hover:bg-black rounded shadow-md border border-pintaara-gold/40">
                    Save Daily Rates
                </button>
            </div>
        </form>
    </div>
</div>

@stack('scripts')
</body>
</html>
