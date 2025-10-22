<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('bullying_reports')) {
            return;
        }

        // add ticket_id only if missing
        if (! Schema::hasColumn('bullying_reports', 'ticket_id')) {
            Schema::table('bullying_reports', function (Blueprint $table) {
                $table->string('ticket_id')->unique()->after('id');
            });
        }

        // add status only if missing
        if (! Schema::hasColumn('bullying_reports', 'status')) {
            Schema::table('bullying_reports', function (Blueprint $table) {
                $table->string('status')->default('Pending')->after('victim_spoken_to');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('bullying_reports')) {
            return;
        }

        if (Schema::hasColumn('bullying_reports', 'ticket_id')) {
            Schema::table('bullying_reports', function (Blueprint $table) {
                $table->dropColumn('ticket_id');
            });
        }

        if (Schema::hasColumn('bullying_reports', 'status')) {
            Schema::table('bullying_reports', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
