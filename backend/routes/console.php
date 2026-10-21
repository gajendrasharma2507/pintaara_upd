<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Pintaara Automated Jewellery Pricing Schedules:
 * 1. Market Hours Sync: Checks Aarav Bullion live spot rates every 15 minutes during bullion trading hours (09:00 - 18:00 IST).
 * 2. Daily Morning Opening Sync: Forces a clean rate sync every morning at 09:00 AM IST before customer visits.
 * 3. Daily Midday Benchmark: Syncs at 13:00 and 17:00 IST.
 */
Schedule::command('rates:sync --force')
    ->dailyAt('09:00')
    ->timezone('Asia/Kolkata')
    ->runInBackground();

Schedule::command('rates:sync')
    ->everyFifteenMinutes()
    ->between('09:00', '18:00')
    ->timezone('Asia/Kolkata')
    ->runInBackground();
