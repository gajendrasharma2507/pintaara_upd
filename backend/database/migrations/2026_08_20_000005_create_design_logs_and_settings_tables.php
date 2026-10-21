<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->cascadeOnDelete();
            
            // 4-Stage Craft Documentation Builder
            $table->string('idea_image')->nullable();
            $table->text('idea_note')->nullable();
            
            $table->string('cad_image')->nullable();
            $table->text('cad_note')->nullable();
            
            $table->string('craft_image')->nullable();
            $table->text('craft_note')->nullable();
            
            $table->string('creation_image')->nullable();
            $table->text('creation_note')->nullable();
            
            $table->string('inspired_by')->nullable();
            $table->date('release_date')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, json, boolean
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('design_logs');
    }
};
