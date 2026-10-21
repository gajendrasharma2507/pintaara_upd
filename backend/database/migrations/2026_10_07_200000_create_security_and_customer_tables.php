<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Email OTPs Table
        if (!Schema::hasTable('email_otps')) {
            Schema::create('email_otps', function (Blueprint $table) {
                $table->id();
                $table->string('email')->index();
                $table->string('otp_hash');
                $table->string('purpose', 50)->default('registration'); // registration, email_change, password_reset
                $table->text('metadata')->nullable(); // JSON payload for pending registration or new email
                $table->integer('attempts')->default(0);
                $table->timestamp('resend_available_at')->nullable();
                $table->timestamp('expires_at')->index();
                $table->timestamp('used_at')->nullable();
                $table->timestamps();
            });
        }

        // 2. Audit Logs Table
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('action', 100);
                $table->string('entity', 100)->nullable();
                $table->string('entity_id', 100)->nullable();
                $table->text('old_values')->nullable();
                $table->text('new_values')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();

                $table->index(['entity', 'entity_id']);
                $table->index('created_at');
            });
        }

        // 3. Customer Saved Addresses Table
        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('recipient_name');
                $table->string('phone');
                $table->string('address_line1');
                $table->string('address_line2')->nullable();
                $table->string('city');
                $table->string('state');
                $table->string('pincode', 20);
                $table->string('country', 100)->default('India');
                $table->boolean('is_default')->default(false);
                $table->timestamps();
            });
        }

        // 4. Customer Custom Bespoke Designs Table
        if (!Schema::hasTable('customer_designs')) {
            Schema::create('customer_designs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->text('notes')->nullable();
                $table->string('metal_preference')->nullable();
                $table->string('gem_preference')->nullable();
                $table->string('media_path')->nullable();
                $table->string('status', 50)->default('submitted'); // draft, submitted, in_review, approved, in_production
                $table->timestamps();
            });
        }

        // 5. Add user_id to appointments table if not exists
        if (Schema::hasTable('appointments') && !Schema::hasColumn('appointments', 'user_id')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            });
        }

        // 6. Add indexes to orders for high performance and integrity
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'locked_gold_rate_24kt')) {
                    $table->decimal('locked_gold_rate_24kt', 10, 2)->nullable()->after('gold_rate_snapshot');
                    $table->decimal('locked_gold_rate_22kt', 10, 2)->nullable()->after('locked_gold_rate_24kt');
                    $table->decimal('locked_silver_rate', 10, 2)->nullable()->after('locked_gold_rate_22kt');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_designs');
        Schema::dropIfExists('user_addresses');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('email_otps');
    }
};
