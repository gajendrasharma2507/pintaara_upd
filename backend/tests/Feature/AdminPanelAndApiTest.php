<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPanelAndApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test admin dashboard page loads with 200 OK.
     */
    public function test_admin_dashboard_loads(): void
    {
        $response = $this->get('/admin');
        $response->assertStatus(200);
        $response->assertSee('Atelier Command Center');
        $response->assertSee('Live Spot Market Rates');
    }

    /**
     * Test gold rate manager page loads.
     */
    public function test_admin_gold_rate_manager_loads(): void
    {
        $response = $this->get('/admin/gold-rate');
        $response->assertStatus(200);
        $response->assertSee('Daily Spot Market Rates');
    }

    /**
     * Test collections master loads.
     */
    public function test_admin_collections_loads(): void
    {
        $response = $this->get('/admin/collections-master');
        $response->assertStatus(200);
        $response->assertSee('Collections Master Grid');
    }

    /**
     * Test products list and create view load.
     */
    public function test_admin_products_load(): void
    {
        $response = $this->get('/admin/products');
        $response->assertStatus(200);
        $response->assertSee('Product Catalog & Matrix');

        $createResponse = $this->get('/admin/products/create');
        $createResponse->assertStatus(200);
        $createResponse->assertSee('Shopify-Style Option Dimensions');
        $createResponse->assertSee('Live Pricing Matrix');
    }

    /**
     * Test orders list and detail view load.
     */
    public function test_admin_orders_load(): void
    {
        $order = Order::first();
        $this->assertNotNull($order);

        $response = $this->get('/admin/orders');
        $response->assertStatus(200);

        $detailResponse = $this->get("/admin/orders/{$order->id}");
        $detailResponse->assertStatus(200);
        $detailResponse->assertSee('Frozen Rate Snapshot');
    }

    /**
     * Test GET /api/gold-rate/today endpoint.
     */
    public function test_api_gold_rate_today(): void
    {
        $response = $this->getJson('/api/gold-rate/today');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'effective_date',
            'base_22kt_rate_per_10g',
            'pure_24kt_rate_per_gram',
            'purities',
        ]);
    }

    /**
     * Test GET /api/collections endpoint.
     */
    public function test_api_collections(): void
    {
        $response = $this->getJson('/api/collections');
        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'data']);
    }

    /**
     * Test GET /api/products endpoint.
     */
    public function test_api_products(): void
    {
        $response = $this->getJson('/api/products');
        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'count', 'data']);
    }

    /**
     * Test POST /api/price/calculate customizer endpoint.
     */
    public function test_api_price_calculate(): void
    {
        $response = $this->postJson('/api/price/calculate', [
            'weight_grams' => 8.500,
            'purity' => '22KT',
            'making_charge_flat' => 3000.0,
            'wastage_percent' => 0.0,
        ]);

        $response->assertStatus(200);
        $this->assertEquals(90640.0, (float) $response->json('data.total_price'));
    }
}
