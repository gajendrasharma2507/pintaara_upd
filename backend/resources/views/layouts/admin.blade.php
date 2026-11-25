<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'PINTAARA Overview') — PINTAARA Admin</title>
  <link rel="icon" type="image/png" href="/images/logo-butterfly.png">
  <link rel="stylesheet" href="/css/admin.css">
  <style>
    .nav-item-active {
      background: var(--admin-primary-light) !important;
      color: var(--admin-primary) !important;
      font-weight: 700 !important;
    }
    .nav-item-active svg {
      color: var(--admin-primary) !important;
    }

    /* Fix Laravel Pagination & Giant SVGs */
    nav[role="navigation"] svg,
    .admin-pagination svg,
    .pagination svg,
    svg.w-5,
    svg.h-5 {
      width: 14px !important;
      height: 14px !important;
      max-width: 14px !important;
      max-height: 14px !important;
      display: inline-block !important;
      vertical-align: middle !important;
    }

    nav[role="navigation"] {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-wrap: wrap !important;
      gap: 12px !important;
      font-size: 13px !important;
      color: var(--admin-text-secondary) !important;
    }

    nav[role="navigation"] > div:first-child {
      display: none !important;
    }

    nav[role="navigation"] > div:last-child {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      width: 100% !important;
    }

    nav[role="navigation"] a,
    nav[role="navigation"] span.relative,
    nav[role="navigation"] span[aria-current="page"] > span {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 32px !important;
      height: 32px !important;
      padding: 4px 10px !important;
      border-radius: 6px !important;
      font-size: 12.5px !important;
      font-weight: 600 !important;
      text-decoration: none !important;
      color: var(--admin-text-primary) !important;
      background: var(--admin-surface) !important;
      border: 1px solid var(--admin-border) !important;
      transition: all 0.15s ease !important;
    }

    nav[role="navigation"] a:hover {
      background: var(--admin-surface-hover) !important;
      border-color: var(--admin-primary) !important;
      color: var(--admin-primary) !important;
    }

    nav[role="navigation"] span[aria-current="page"] > span {
      background: var(--admin-primary) !important;
      border-color: var(--admin-primary) !important;
      color: #FFFFFF !important;
    }

    /* Unified Theme Buttons */
    .admin-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      font-family: inherit !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      padding: 5px 12px !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      text-decoration: none !important;
      transition: all 0.15s ease !important;
      line-height: 1.4 !important;
      border: 1px solid transparent !important;
      white-space: nowrap !important;
    }

    /* Primary Theme Button: Solid Theme Blue #3C50E0 */
    .admin-btn-primary {
      background: #3C50E0 !important;
      color: #FFFFFF !important;
      border: 1px solid #3C50E0 !important;
      box-shadow: 0 1px 3px rgba(60, 80, 224, 0.25) !important;
    }
    .admin-btn-primary:hover {
      background: #3344BA !important;
      border-color: #3344BA !important;
      color: #FFFFFF !important;
      box-shadow: 0 3px 8px rgba(60, 80, 224, 0.35) !important;
    }

    /* Edit / Secondary Theme Button (Theme Soft Pill): #EFF2FE + #3C50E0 */
    .admin-btn-edit,
    .admin-btn-secondary {
      background: #EFF2FE !important;
      color: #3C50E0 !important;
      border: 1px solid #C7D2FE !important;
      font-weight: 600 !important;
    }
    .admin-btn-edit:hover,
    .admin-btn-secondary:hover {
      background: #3C50E0 !important;
      color: #FFFFFF !important;
      border-color: #3C50E0 !important;
      box-shadow: 0 2px 6px rgba(60, 80, 224, 0.25) !important;
    }

    /* Danger / Delete Button */
    .admin-btn-danger {
      background: #FEF2F2 !important;
      color: #DC2626 !important;
      border: 1px solid #FECACA !important;
      font-weight: 600 !important;
    }
    .admin-btn-danger:hover {
      background: #DC2626 !important;
      color: #FFFFFF !important;
      border-color: #DC2626 !important;
      box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25) !important;
    }
  </style>
</head>
<body>
  <div class="admin-shell" style="display: flex; flex-direction: row; min-height: 100vh;">

    <!-- ==================== SIDEBAR ==================== -->
    <aside id="adminSidebar" class="admin-sidebar" style="width: 256px; min-width: 256px; background: var(--admin-surface); border-right: 1px solid var(--admin-border); display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; z-index: 50; transition: width 0.2s ease;">
      
      <!-- Brand & Collapse Header -->
      <div style="padding: 24px 22px 20px 22px; display: flex; align-items: center; justify-content: space-between;">
        <a href="{{ route('admin.dashboard') }}" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
          <span class="admin-sidebar-brand" style="display: flex; align-items: center;">
            <img src="/images/mobile/logo-wordmark.png" alt="PINTAARA" style="height: 22px; width: auto; max-width: 155px; object-fit: contain; display: block;">
          </span>
        </a>
        <button type="button" id="sidebarToggleBtn" style="background: transparent; border: none; cursor: pointer; color: var(--admin-text-muted); display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Section -->
      <div style="flex: 1; overflow-y: auto; padding: 10px 14px 20px 14px; display: flex; flex-direction: column; gap: 4px;">
        <!-- Executive Overview -->
        <a href="{{ route('admin.dashboard') }}" class="admin-filter-btn {{ request()->routeIs('admin.dashboard') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Executive Overview</span>
        </a>

        <!-- Orders & Invoices -->
        <a href="{{ route('admin.orders') }}" class="admin-filter-btn {{ request()->routeIs('admin.orders*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Orders & Invoices</span>
        </a>

        <!-- Jewellery Catalog -->
        <a href="{{ route('admin.products') }}" class="admin-filter-btn {{ request()->routeIs('admin.products*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Jewellery Catalog</span>
        </a>

        <!-- Product Options & Variants -->
        <a href="{{ route('admin.product-options') }}" class="admin-filter-btn {{ request()->routeIs('admin.product-options*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Options &amp; Variants</span>
        </a>

        <!-- Design Logs -->
        <a href="{{ route('admin.design-logs') }}" class="admin-filter-btn {{ request()->routeIs('admin.design-logs*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Design Logs</span>
        </a>

        <!-- Collections -->
        <a href="{{ route('admin.collections') }}" class="admin-filter-btn {{ request()->routeIs('admin.collections*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Collections</span>
        </a>

        <!-- Customers -->
        <a href="{{ route('admin.customers') }}" class="admin-filter-btn {{ request()->routeIs('admin.customers*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Customers</span>
        </a>

        <!-- Live Gold Spot Rates -->
        <a href="{{ route('admin.gold-rates') }}" class="admin-filter-btn {{ request()->routeIs('admin.gold-rates*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Live Gold Spot Rates</span>
        </a>

        <!-- Email Templates -->
        <a href="{{ route('admin.email-templates') }}" class="admin-filter-btn {{ request()->routeIs('admin.email-templates*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Email Templates</span>
        </a>

        <!-- Global Settings -->
        <a href="{{ route('admin.settings') }}" class="admin-filter-btn {{ request()->routeIs('admin.settings*') ? 'nav-item-active' : '' }}" style="width: 100%; justify-content: flex-start; padding: 10px 14px; border-radius: 8px; border: none; font-size: 13.5px; text-decoration: none; color: var(--admin-text-secondary);">
          <span>Global Settings</span>
        </a>
      </div>

      <!-- Bottom: Storefront Link & Live Status -->
      <div style="padding: 16px 20px; border-top: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between;">
        <a href="http://localhost:3000" target="_blank" style="text-decoration: none; color: #3C50E0; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
          <span>Visit Storefront</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;" title="Storefront connected"></span>
      </div>
    </aside>

    <!-- ==================== MAIN VIEWPORT ==================== -->
    <div style="flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--admin-bg);">

      <!-- Top Spot Rate Strip (Aarav Bullion Live Stream) -->
      <div style="background: var(--admin-surface-elevated); border-bottom: 1px solid var(--admin-border); padding: 5px 32px; display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; color: var(--admin-text-secondary); z-index: 45;">
        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981;"></span>
            <span style="font-weight: 800; font-size: 10.5px; letter-spacing: 0.05em; color: #10B981; text-transform: uppercase;">Aarav Bullion Live Spot</span>
          </div>
          <div id="layout_top_spot_ticker" style="display: flex; align-items: center; gap: 10px; font-family: monospace; font-size: 11.5px;">
            <span>24K Gold: <strong id="top_gold_24k" style="color: var(--admin-text-primary);">₹14,595/g</strong></span>
            <span style="color: var(--admin-border);">|</span>
            <span>22K Gold: <strong id="top_gold_22k" style="color: var(--admin-text-primary);">₹13,369/g</strong></span>
            <span style="color: var(--admin-border);">|</span>
            <span>Silver 999: <strong id="top_silver" style="color: var(--admin-text-primary);">₹191/g</strong></span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <a href="{{ route('admin.gold-rates') }}" style="color: #B8860B; font-weight: 700; text-decoration: none; font-size: 11px; display: flex; align-items: center; gap: 4px;">
            <span>Live Spot Terminal ↗</span>
          </a>
        </div>
      </div>

      <!-- TOP BAR -->
      <header style="background: var(--admin-surface); border-bottom: 1px solid var(--admin-border); padding: 14px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40;">
        
        <!-- Search Input with ⌘K Badge and Live Dropdown -->
        <div id="globalSearchContainer" class="admin-search-wrap" style="position: relative; width: 100%; max-width: 480px;">
          <form id="globalSearchForm" action="{{ route('admin.products') }}" method="GET" style="margin: 0; position: relative;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); pointer-events: none;">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="globalSearchInput"
              name="search"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="Search jewelry pieces, orders, HUIDs, clients..."
              style="width: 100%; padding: 9px 65px 9px 40px; background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); border-radius: 9999px; font-size: 13px; color: var(--admin-text-primary); outline: none; transition: border-color 0.15s, box-shadow 0.15s;"
            />
            <span id="globalSearchKbd" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: 700; color: var(--admin-text-muted); background: var(--admin-surface); border: 1px solid var(--admin-border); padding: 2px 7px; border-radius: 5px; pointer-events: none; user-select: none;">
              ⌘K
            </span>
          </form>

          <!-- Search Results Dropdown -->
          <div id="globalSearchResults" style="display: none; position: absolute; left: 0; top: calc(100% + 8px); width: 100%; min-width: 480px; max-width: 560px; max-height: 480px; overflow-y: auto; background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 14px; box-shadow: 0 16px 36px -8px rgba(0,0,0,0.22); z-index: 1000; padding: 6px 0;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Right Side Controls: Dark Mode, Bell, Profile Avatar -->
        <div style="display: flex; align-items: center; gap: 14px;">
          
          <!-- Dark Mode Toggle -->
          <button type="button" id="themeToggleBtn" style="background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--admin-text-secondary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <!-- Notification Bell -->
          <div style="position: relative;">
            <button type="button" style="background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--admin-text-secondary);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <span style="position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; background: #DC2626; border-radius: 50%; border: 1px solid #FFF;"></span>
          </div>

          <!-- User Profile Dropdown -->
          <div style="position: relative;">
            <button id="profileDropdownBtn" type="button" style="display: flex; align-items: center; gap: 10px; background: transparent; border: none; cursor: pointer; padding: 4px 8px; border-radius: 8px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #D4AF37, #9A7C38); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 700; font-size: 13.5px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                DS
              </div>
              <span style="font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary);">
                Darshit Soni
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--admin-text-muted);">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div id="profileDropdownMenu" style="display: none; position: absolute; right: 0; top: 46px; width: 200px; background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 12px; box-shadow: var(--admin-shadow-lg); padding: 6px 0; z-index: 100;">
              <div style="padding: 8px 16px; border-bottom: 1px solid var(--admin-border);">
                <div style="font-size: 13px; font-weight: 700; color: var(--admin-text-primary);">Darshit Soni</div>
                <div style="font-size: 11px; color: #9A7228; font-weight: 600;">Super Admin</div>
              </div>
              <a href="{{ route('admin.settings') }}" style="display: block; padding: 8px 16px; font-size: 13px; color: var(--admin-text-secondary); text-decoration: none;">Account Settings</a>
              <form action="{{ route('admin.logout') }}" method="POST" style="margin: 0;">
                @csrf
                <button type="submit" style="display: block; width: 100%; text-align: left; padding: 8px 16px; font-size: 13px; color: var(--admin-danger); background: none; border: none; cursor: pointer;">
                  Sign Out
                </button>
              </form>
            </div>
          </div>

        </div>
      </header>

      <!-- PAGE CONTENT VIEWPORT -->
      <main style="flex: 1; padding: 28px 32px 48px 32px; overflow-x: hidden;">
        @if(session('success'))
          <div style="background: #E6FBF2; border: 1px solid #10B981; color: #065F46; padding: 12px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
            <span>{{ session('success') }}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #065F46; cursor: pointer; font-size: 16px;">&times;</button>
          </div>
        @endif

        @if(session('error'))
          <div style="background: #FEF2F2; border: 1px solid #EF4444; color: #991B1B; padding: 12px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px;">⚠️</span>
              <span>{{ session('error') }}</span>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #991B1B; cursor: pointer; font-size: 16px;">&times;</button>
          </div>
        @endif

        @if(session('warning'))
          <div style="background: #FFFBEB; border: 1px solid #F59E0B; color: #92400E; padding: 12px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px;">⚠️</span>
              <span>{{ session('warning') }}</span>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #92400E; cursor: pointer; font-size: 16px;">&times;</button>
          </div>
        @endif

        @yield('content')
      </main>

    </div>
  </div>

  <script>
    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    themeBtn?.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('pintaara_theme', next);
    });
    if (localStorage.getItem('pintaara_theme')) {
      document.documentElement.setAttribute('data-theme', localStorage.getItem('pintaara_theme'));
    }

    // Profile Dropdown Toggle
    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdownMenu');
    profileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => {
      if (profileMenu) profileMenu.style.display = 'none';
    });

    // Sidebar Toggle
    const sidebar = document.getElementById('adminSidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    toggleBtn?.addEventListener('click', () => {
      if (sidebar.style.width === '80px') {
        sidebar.style.width = '256px';
        sidebar.querySelectorAll('span').forEach(s => s.style.display = '');
      } else {
        sidebar.style.width = '80px';
        sidebar.querySelectorAll('span').forEach(s => s.style.display = 'none');
      }
    });
    // Auto-update top spot rate strip from Aarav Bullion
    async function updateTopSpotBar() {
      try {
        const res = await fetch('{{ route("admin.gold-rates.feed") }}?realtime=1');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.liveData) {
          const g24 = data.liveData.gold_24kt_per_gram;
          const g22 = data.liveData.gold_22kt_per_gram;
          const sil = data.liveData.silver_per_gram;
          const el24 = document.getElementById('top_gold_24k');
          const el22 = document.getElementById('top_gold_22k');
          const elSil = document.getElementById('top_silver');
          if (el24 && g24) el24.textContent = '₹' + Math.round(g24).toLocaleString('en-IN') + '/g';
          if (el22 && g22) el22.textContent = '₹' + Math.round(g22).toLocaleString('en-IN') + '/g';
          if (elSil && sil) elSil.textContent = '₹' + Math.round(sil).toLocaleString('en-IN') + '/g';
        }
      } catch (e) {}
    }
    updateTopSpotBar();
    setInterval(updateTopSpotBar, 10000);

    // ==========================================
    // GLOBAL SEARCH & COMMAND PALETTE (Ctrl+K / ⌘K)
    // ==========================================
    const searchContainer = document.getElementById('globalSearchContainer');
    const searchInput = document.getElementById('globalSearchInput');
    const searchResults = document.getElementById('globalSearchResults');
    const searchForm = document.getElementById('globalSearchForm');
    const searchKbd = document.getElementById('globalSearchKbd');

    // Detect Mac vs Windows for badge
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || '');
    if (searchKbd) {
      searchKbd.textContent = isMac ? '⌘K' : 'Ctrl+K';
    }

    let searchDebounceTimer = null;
    let selectedIndex = -1;

    // Global keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          openSearchDropdown();
        }
      }
    });

    function getResultItems() {
      return searchResults ? Array.from(searchResults.querySelectorAll('.search-result-item')) : [];
    }

    function updateItemHighlight() {
      const items = getResultItems();
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.style.background = 'var(--admin-surface-elevated)';
          item.style.borderLeftColor = '#D4AF37';
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.style.background = 'transparent';
          item.style.borderLeftColor = 'transparent';
        }
      });
    }

    function openSearchDropdown() {
      if (!searchResults) return;
      searchResults.style.display = 'block';
      const query = (searchInput?.value || '').trim();
      if (!query) {
        renderQuickNav();
      } else {
        performSearch(query);
      }
    }

    function closeSearchDropdown() {
      if (searchResults) {
        searchResults.style.display = 'none';
        selectedIndex = -1;
      }
    }

    function renderQuickNav() {
      if (!searchResults) return;
      selectedIndex = -1;
      searchResults.innerHTML = `
        <div style="padding: 6px 16px 8px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted);">
          Quick PINTAARA Navigation
        </div>
        <div style="display: flex; flex-direction: column;">
          <a href="{{ route('admin.products') }}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; text-decoration: none; color: var(--admin-text-primary); border-left: 3px solid transparent; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 15px;">💍</span>
              <div>
                <div style="font-weight: 600;">Jewelry Pieces &amp; Products</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">Browse signature catalog, active designs &amp; inventory</div>
              </div>
            </div>
            <span style="font-size: 11px; color: var(--admin-text-muted);">Go ↗</span>
          </a>
          <a href="{{ route('admin.orders') }}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; text-decoration: none; color: var(--admin-text-primary); border-left: 3px solid transparent; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 15px;">📦</span>
              <div>
                <div style="font-weight: 600;">Client Orders &amp; Shipments</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">Track production, invoices, Sequel logistics &amp; deliveries</div>
              </div>
            </div>
            <span style="font-size: 11px; color: var(--admin-text-muted);">Go ↗</span>
          </a>
          <a href="{{ route('admin.design-logs') }}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; text-decoration: none; color: var(--admin-text-primary); border-left: 3px solid transparent; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 15px;">📐</span>
              <div>
                <div style="font-weight: 600;">PINTAARA Design Logs &amp; Blueprints</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">CAD models, bench craft notes &amp; HUID certificates</div>
              </div>
            </div>
            <span style="font-size: 11px; color: var(--admin-text-muted);">Go ↗</span>
          </a>
          <a href="{{ route('admin.gold-rates') }}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; text-decoration: none; color: var(--admin-text-primary); border-left: 3px solid transparent; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 15px;">⚡</span>
              <div>
                <div style="font-weight: 600;">Live Gold Rate Terminal</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">Aarav Bullion live stream feed &amp; Rate CAP engine</div>
              </div>
            </div>
            <span style="font-size: 11px; color: var(--admin-text-muted);">Go ↗</span>
          </a>
          <a href="{{ route('admin.customers') }}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; text-decoration: none; color: var(--admin-text-primary); border-left: 3px solid transparent; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 15px;">👥</span>
              <div>
                <div style="font-weight: 600;">Client &amp; Patron Directory</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">VIP client profiles, addresses &amp; order history</div>
              </div>
            </div>
            <span style="font-size: 11px; color: var(--admin-text-muted);">Go ↗</span>
          </a>
        </div>
        <div style="margin-top: 8px; border-top: 1px solid var(--admin-border); padding: 8px 16px 4px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--admin-text-muted); background: var(--admin-surface-elevated);">
          <span>Type to search catalog pieces, orders, HUIDs, clients</span>
          <span>ESC to close</span>
        </div>
      `;
    }

    async function performSearch(query) {
      if (!searchResults) return;
      selectedIndex = -1;
      searchResults.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--admin-text-secondary); font-size: 13px;">
          <div style="display: inline-block; width: 18px; height: 18px; border: 2px solid var(--admin-border); border-top-color: #D4AF37; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 8px;"></div>
          <div>Searching PINTAARA records...</div>
        </div>
      `;

      try {
        const res = await fetch(`{{ route('admin.global-search') }}?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        if (!data.categories || data.categories.length === 0) {
          searchResults.innerHTML = `
            <div style="padding: 28px 20px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
              <div style="font-size: 13.5px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 4px;">
                No matches found for "${escapeHtml(query)}"
              </div>
              <div style="font-size: 12px; color: var(--admin-text-muted); margin-bottom: 16px;">
                Check spelling or search by piece name, HUID, order #, or client phone.
              </div>
              <a href="{{ route('admin.products') }}?search=${encodeURIComponent(query)}" style="display: inline-block; padding: 7px 14px; background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--admin-text-primary); text-decoration: none;">
                Search all Products for "${escapeHtml(query)}" →
              </a>
            </div>
          `;
          return;
        }

        let html = '';
        data.categories.forEach(cat => {
          let catIcon = '💎';
          if (cat.type === 'order') catIcon = '📦';
          if (cat.type === 'design_log') catIcon = '📐';
          if (cat.type === 'customer') catIcon = '👤';

          html += `
            <div style="padding: 8px 16px 4px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-text-muted); display: flex; align-items: center; gap: 6px;">
              <span>${catIcon}</span>
              <span>${cat.name}</span>
              <span style="font-size: 10px; background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); padding: 1px 6px; border-radius: 999px;">${cat.items.length}</span>
            </div>
            <div style="display: flex; flex-direction: column; margin-bottom: 6px;">
          `;

          cat.items.forEach(item => {
            html += `
              <a href="${item.url}" class="search-result-item" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; text-decoration: none; color: var(--admin-text-primary); border-left: 3px solid transparent; font-size: 13px; transition: background 0.12s;">
                <div style="min-width: 0; padding-right: 12px;">
                  <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(item.title)}
                  </div>
                  <div style="font-size: 11.5px; color: var(--admin-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                    ${escapeHtml(item.subtitle)}
                  </div>
                </div>
                <div style="flex-shrink: 0;">
                  <span style="font-size: 10.5px; font-weight: 700; color: ${item.badge_color || '#B8860B'}; background: var(--admin-surface-elevated); border: 1px solid var(--admin-border); padding: 3px 8px; border-radius: 6px;">
                    ${escapeHtml(item.badge)}
                  </span>
                </div>
              </a>
            `;
          });

          html += `</div>`;
        });

        html += `
          <div style="border-top: 1px solid var(--admin-border); padding: 8px 16px 4px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--admin-text-muted); background: var(--admin-surface-elevated);">
            <span>${data.total} result${data.total === 1 ? '' : 's'} found</span>
            <span>↑↓ Navigate • ↵ Open • ESC Close</span>
          </div>
        `;

        searchResults.innerHTML = html;

      } catch (err) {
        searchResults.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--admin-text-muted); font-size: 12.5px;">
            Search could not be completed. Please try again.
          </div>
        `;
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Input events
    searchInput?.addEventListener('focus', () => {
      openSearchDropdown();
    });

    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.trim();
      clearTimeout(searchDebounceTimer);
      if (!q) {
        renderQuickNav();
      } else {
        searchDebounceTimer = setTimeout(() => {
          performSearch(q);
        }, 220);
      }
    });

    // Keyboard navigation inside input
    searchInput?.addEventListener('keydown', (e) => {
      const items = getResultItems();
      if (!items.length || searchResults.style.display === 'none') {
        if (e.key === 'Escape') {
          closeSearchDropdown();
          searchInput.blur();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateItemHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateItemHighlight();
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          items[selectedIndex].click();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSearchDropdown();
        searchInput.blur();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (searchContainer && !searchContainer.contains(e.target)) {
        closeSearchDropdown();
      }
    });
  </script>
</body>
</html>

