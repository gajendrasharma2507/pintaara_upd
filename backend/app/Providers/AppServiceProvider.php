<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::defaultView('vendor.pagination.admin');

        // Dynamically apply SMTP settings from database if configured
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $dbMailHost = \App\Models\Setting::get('mail_host');
                if (!empty($dbMailHost)) {
                    config([
                        'mail.default' => 'smtp',
                        'mail.mailers.smtp.transport' => 'smtp',
                        'mail.mailers.smtp.host' => $dbMailHost,
                        'mail.mailers.smtp.port' => (int) \App\Models\Setting::get('mail_port', 465),
                        'mail.mailers.smtp.encryption' => \App\Models\Setting::get('mail_encryption', 'ssl'),
                        'mail.mailers.smtp.username' => \App\Models\Setting::get('mail_username'),
                        'mail.mailers.smtp.password' => \App\Models\Setting::get('mail_password'),
                        'mail.from.address' => \App\Models\Setting::get('mail_from_address', config('mail.from.address')),
                        'mail.from.name' => \App\Models\Setting::get('mail_from_name', config('mail.from.name')),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            // Fail gracefully during migration or DB boot
        }
    }
}
