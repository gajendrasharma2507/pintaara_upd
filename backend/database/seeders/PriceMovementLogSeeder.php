<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PriceMovementLog;

class PriceMovementLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Price movements are dynamically and automatically logged from live market ticks and step threshold crossings.
     */
    public function run(): void
    {
        // No dummy data. Real price movements log automatically on live market ticks.
    }
}
