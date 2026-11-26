<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('currency_rates')) {
            Schema::create('currency_rates', function (Blueprint $table) {
                $table->id();
                $table->string('currency_code', 10)->unique();
                $table->string('currency_name', 100)->nullable();
                $table->string('currency_symbol', 10)->nullable();
                $table->string('country_name', 100)->nullable();
                $table->decimal('exchange_rate', 18, 8)->default(1.00000000);
                $table->decimal('country_markup', 12, 2)->default(0.00);
                $table->boolean('is_enabled')->default(true);
                $table->date('rate_date')->nullable();
                $table->timestamp('last_synced_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('currency_rates');
    }
};
