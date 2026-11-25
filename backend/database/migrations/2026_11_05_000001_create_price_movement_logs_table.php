<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_movement_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('metal_type', ['gold', 'silver'])->default('gold');
            $table->string('purity', 30)->default('24KT');
            $table->decimal('old_rate_per_10g', 12, 2)->default(0);
            $table->decimal('new_rate_per_10g', 12, 2);
            $table->decimal('old_rate_per_gram', 12, 2)->default(0);
            $table->decimal('new_rate_per_gram', 12, 2);
            $table->decimal('market_spot_10g', 12, 2)->nullable();
            $table->decimal('step_gap', 10, 2)->default(0);
            $table->enum('direction', ['up', 'down', 'initial'])->default('initial');
            $table->decimal('difference_10g', 12, 2)->default(0);
            $table->string('reason')->default('Aarav Live Market Tick');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_movement_logs');
    }
};

