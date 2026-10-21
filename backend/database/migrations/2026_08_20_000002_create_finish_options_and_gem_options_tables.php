<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finish_options', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Yellow Gold, White Gold, Rose Gold, Black Gold
            $table->string('hex_color')->default('#D4AF37'); // #D4AF37, #E8E8E8, #B76E79, #2B2B2B
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('gem_options', function (Blueprint $table) {
            $table->id();
            $table->string('stone_type'); // Diamond, Ruby, Emerald, Sapphire, None
            $table->decimal('carat', 5, 3)->nullable();
            $table->decimal('default_stone_charge', 10, 2)->default(0.00); // in ₹
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gem_options');
        Schema::dropIfExists('finish_options');
    }
};
