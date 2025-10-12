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
        Schema::table('bullying_reports', function (Blueprint $table) {
            $table->string('ticket_id')->unique()->after('id');
            $table->string('status')->default('Pending')->after('victim_spoken_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bullying_reports', function (Blueprint $table) {
            $table->dropColumn(['ticket_id', 'status']);
        });
    }
};
