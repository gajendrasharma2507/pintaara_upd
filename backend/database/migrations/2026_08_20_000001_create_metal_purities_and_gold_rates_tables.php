<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metal_purities', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "22KT", "18KT", "14KT", "925 Silver"
            $table->decimal('purity_fraction', 5, 3); // 0.916, 0.750, 0.585, 0.925
            $table->enum('type', ['gold', 'silver'])->default('gold');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('gold_rates', function (Blueprint $table) {
            $table->id();
            $table->enum('metal_type', ['gold', 'silver'])->default('gold');
            $table->decimal('rate_per_10g', 10, 2); // Base rate entered by admin (22KT for gold = ₹100,000)
            $table->foreignId('base_purity_id')->constrained('metal_purities')->cascadeOnDelete();
            $table->date('effective_date');
            $table->enum('source', ['manual', 'api'])->default('manual');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gold_rates');
        Schema::dropIfExists('metal_purities');
    }
};
