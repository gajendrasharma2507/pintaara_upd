<?php

namespace App\Console\Commands;

use App\Services\CurrencyExchangeService;
use Illuminate\Console\Command;

class SyncCurrencyRatesCommand extends Command
{
    protected $signature = 'currencies:sync';

    protected $description = 'Fetch and cache INR-based foreign exchange rates from Frankfurter API v2';

    public function handle(CurrencyExchangeService $service): int
    {
        $this->info('Syncing currency exchange rates from Frankfurter API (base=INR)...');
        $result = $service->syncEnabledCurrencies();

        if ($result['success']) {
            $this->info('✓ ' . $result['message']);
            return self::SUCCESS;
        }

        $this->warn('⚠ ' . $result['message']);
        return self::SUCCESS; // Non-fatal: fallback to last cached rates
    }
}
