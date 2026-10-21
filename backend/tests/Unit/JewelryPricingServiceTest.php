<?php

namespace Tests\Unit;

use App\Services\JewelryPricingService;
use Tests\TestCase;

class JewelryPricingServiceTest extends TestCase
{
    /**
     * Test benchmark 8.5g 22KT ring calculation:
     * - Base 22KT / 10g: ₹1,00,000
     * - Weight: 8.5g
     * - Wastage: 0%
     * - Making Charge: ₹3,000
     * - Gems: ₹0
     * - Metal Value: 8.5 * (100,000 / 10) = ₹85,000
     * - Subtotal: 85,000 + 3,000 = ₹88,000
     * - GST (3%): ₹2,640
     * - Total: ₹90,640
     */
    public function test_ring_benchmark_calculation_matches_exact_90640(): void
    {
        $service = new JewelryPricingService();

        $breakdown = $service->calculatePrice(
            weightGrams: 8.500,
            purityFraction: 0.916,
            wastagePercent: 0.0,
            makingChargeFlat: 3000.0,
            makingChargePercent: null,
            stoneCharge: 0.0,
            metalType: 'gold',
            baseRate: 100000.0,
            gstPercent: 3.0
        );

        $this->assertEquals(85000.00, $breakdown['metal_value']);
        $this->assertEquals(0.00, $breakdown['wastage_value']);
        $this->assertEquals(3000.00, $breakdown['making_charge']);
        $this->assertEquals(88000.00, $breakdown['subtotal']);
        $this->assertEquals(2640.00, $breakdown['gst_amount']);
        $this->assertEquals(90640.00, $breakdown['total_price']);
    }

    /**
     * Test 18KT gold per gram calculation:
     * 22KT rate: 100,000 / 10g -> 10,000/g for 0.916
     * Pure 24KT = 10000 / 0.916 = 10917.030567...
     * 18KT (0.750) = 10917.030567 * 0.750 = ~8187.77
     */
    public function test_18kt_conversion(): void
    {
        $service = new JewelryPricingService();
        $rate18kt = $service->calculateRatePerGram(0.750, 'gold', 100000.0);

        $this->assertEquals(8187.7729, $rate18kt);
    }

    /**
     * Test Wastage and Percentage Making Charge calculations.
     */
    public function test_wastage_and_percentage_making_charge(): void
    {
        $service = new JewelryPricingService();

        $breakdown = $service->calculatePrice(
            weightGrams: 10.0,
            purityFraction: 0.916,
            wastagePercent: 5.0, // 5% wastage = 5% of 100,000 = 5,000
            makingChargeFlat: null,
            makingChargePercent: 10.0, // 10% making charge = 10,000
            stoneCharge: 500.0,
            metalType: 'gold',
            baseRate: 100000.0,
            gstPercent: 3.0
        );

        $this->assertEquals(100000.00, $breakdown['metal_value']);
        $this->assertEquals(5000.00, $breakdown['wastage_value']);
        $this->assertEquals(10000.00, $breakdown['making_charge']);
        $this->assertEquals(500.00, $breakdown['stone_charge']);
        // Subtotal = 100,000 + 5,000 + 10,000 + 500 = 115,500
        $this->assertEquals(115500.00, $breakdown['subtotal']);
        // GST (3%) = 115,500 * 0.03 = 3,465
        $this->assertEquals(3465.00, $breakdown['gst_amount']);
        $this->assertEquals(118965.00, $breakdown['total_price']);
    }
}
