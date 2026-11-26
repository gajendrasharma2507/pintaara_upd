<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurrencyRate extends Model
{
    protected $table = 'currency_rates';

    protected $fillable = [
        'currency_code',
        'currency_name',
        'currency_symbol',
        'country_name',
        'exchange_rate',
        'country_markup',
        'is_enabled',
        'rate_date',
        'last_synced_at',
    ];

    protected $casts = [
        'exchange_rate' => 'float',
        'country_markup' => 'float',
        'is_enabled' => 'boolean',
        'rate_date' => 'date:Y-m-d',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Convert an INR product price to this currency using:
     * Foreign price = (INR product price × INR-to-foreign exchange rate) + country markup.
     */
    public function convertFromInr(float $inrPrice): float
    {
        if (strtoupper($this->currency_code) === 'INR') {
            return round($inrPrice + (float) $this->country_markup, 2);
        }
        return round(($inrPrice * (float) $this->exchange_rate) + (float) $this->country_markup, 2);
    }

    /**
     * Seed default storefront currencies if table is empty.
     */
    public static function ensureDefaultsExist(): void
    {
        if (self::count() > 0) {
            return;
        }

        $defaults = [
            ['currency_code' => 'INR', 'currency_name' => 'Indian Rupee', 'currency_symbol' => '₹', 'country_name' => 'India', 'exchange_rate' => 1.0, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'USD', 'currency_name' => 'US Dollar', 'currency_symbol' => '$', 'country_name' => 'United States', 'exchange_rate' => 0.0118, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'GBP', 'currency_name' => 'British Pound', 'currency_symbol' => '£', 'country_name' => 'United Kingdom', 'exchange_rate' => 0.0093, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'EUR', 'currency_name' => 'Euro', 'currency_symbol' => '€', 'country_name' => 'Europe', 'exchange_rate' => 0.0112, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'AED', 'currency_name' => 'UAE Dirham', 'currency_symbol' => 'AED', 'country_name' => 'UAE', 'exchange_rate' => 0.0434, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'CAD', 'currency_name' => 'Canadian Dollar', 'currency_symbol' => 'CA$', 'country_name' => 'Canada', 'exchange_rate' => 0.0165, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'AUD', 'currency_name' => 'Australian Dollar', 'currency_symbol' => 'A$', 'country_name' => 'Australia', 'exchange_rate' => 0.0182, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'SGD', 'currency_name' => 'Singapore Dollar', 'currency_symbol' => 'S$', 'country_name' => 'Singapore', 'exchange_rate' => 0.0159, 'country_markup' => 0.00, 'is_enabled' => true],
            ['currency_code' => 'CHF', 'currency_name' => 'Swiss Franc', 'currency_symbol' => 'CHF', 'country_name' => 'Switzerland', 'exchange_rate' => 0.0104, 'country_markup' => 0.00, 'is_enabled' => false],
            ['currency_code' => 'JPY', 'currency_name' => 'Japanese Yen', 'currency_symbol' => '¥', 'country_name' => 'Japan', 'exchange_rate' => 1.8200, 'country_markup' => 0.00, 'is_enabled' => false],
        ];

        foreach ($defaults as $row) {
            self::updateOrCreate(['currency_code' => $row['currency_code']], $row);
        }
    }
}
