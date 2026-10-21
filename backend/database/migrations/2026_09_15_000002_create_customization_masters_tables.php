<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customization_masters', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "METAL PURITY (KT)", "FINISH OPTIONS", "SIZE"
            $table->string('code')->unique(); // e.g. "PURITY", "FINISH", "SIZE", "GEM", "CHAIN"
            $table->text('description')->nullable();
            $table->string('icon')->default('💎'); // e.g. "🪙", "✨", "📏", "💎", "⛓️"
            $table->enum('input_type', ['swatch_image', 'text_button', 'dropdown', 'radio'])->default('swatch_image');
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('customization_master_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_id')->constrained('customization_masters')->cascadeOnDelete();
            $table->string('value'); // Text label / definition (e.g. "22KT (91.6% Royal Gold)", "Yellow Gold", "Size 14")
            $table->string('code')->nullable();
            $table->string('image')->nullable(); // Swatch image or photo URL
            $table->decimal('price_delta', 10, 2)->default(0.00); // Optional extra surcharge in ₹
            $table->string('hex_color')->nullable(); // Optional color code e.g. "#D4AF37"
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customization_master_values');
        Schema::dropIfExists('customization_masters');
    }
};
