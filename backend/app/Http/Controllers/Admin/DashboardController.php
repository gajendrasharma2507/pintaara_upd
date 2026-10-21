<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionMaster;
use App\Models\GoldRate;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\JewelryPricingService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected JewelryPricingService $pricingService;

    public function __construct(JewelryPricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function index()
    {
        $currentGold22 = $this->pricingService->getBaseGoldRatePer10g();
        $currentPure24 = $this->pricingService->calculatePureGoldRatePerGram($currentGold22);
        $currentSilver10 = $this->pricingService->getBaseSilverRatePer10g();
        $purityRates = $this->pricingService->getAllPurityRates();

        // Metrics
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $activeProductsCount = Product::where('status', 'active')->count();
        $pendingOrdersCount = Order::whereIn('status', ['confirmed', 'in_production', 'inspection'])->count();
        $collectionsCount = CollectionMaster::where('status', 'active')->count();

        // Recent Orders
        $recentOrders = Order::with(['items.product'])->latest()->take(6)->get();

        // Recent Products
        $recentProducts = Product::with(['collectionMaster', 'primaryImage'])->latest()->take(5)->get();

        // Calculate sample prices for recent products
        $productPrices = [];
        foreach ($recentProducts as $prod) {
            $productPrices[$prod->id] = $this->pricingService->calculateProductPrice($prod);
        }

        return view('admin.dashboard', compact(
            'currentGold22',
            'currentPure24',
            'currentSilver10',
            'purityRates',
            'totalRevenue',
            'activeProductsCount',
            'pendingOrdersCount',
            'collectionsCount',
            'recentOrders',
            'recentProducts',
            'productPrices'
        ));
    }
}
