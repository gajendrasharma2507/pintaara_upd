<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                if (!Schema::hasColumn('appointments', 'reminder_1h_sent_at')) {
                    $table->timestamp('reminder_1h_sent_at')->nullable()->after('status');
                }
                if (!Schema::hasColumn('appointments', 'reminder_15m_sent_at')) {
                    $table->timestamp('reminder_15m_sent_at')->nullable()->after('reminder_1h_sent_at');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                $cols = [];
                if (Schema::hasColumn('appointments', 'reminder_1h_sent_at')) {
                    $cols[] = 'reminder_1h_sent_at';
                }
                if (Schema::hasColumn('appointments', 'reminder_15m_sent_at')) {
                    $cols[] = 'reminder_15m_sent_at';
                }
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};
