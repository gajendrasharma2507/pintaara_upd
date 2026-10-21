<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections_master', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Pendants, Rings, Bracelets, Earrings, Chains, Necklaces, Mangalsutras, Bangles
            $table->string('slug')->unique(); // pendants, rings, etc.
            $table->string('image')->nullable(); // tile image shown on storefront grid
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'hidden'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections_master');
    }
};
