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
        Schema::create('bullying_reports', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id')->unique();
            $table->date('date');
            $table->string('reporter_name');
            $table->string('reporter_phone')->nullable();
            $table->string('reporter_email')->nullable();
            $table->json('reporter_type')->nullable();
            $table->string('victim_names');
            $table->string('offender_names')->nullable();
            $table->string('offender_age')->nullable();
            $table->string('offender_is_student')->nullable();
            $table->json('bullying_type')->nullable();
            $table->text('bullying_explanation')->nullable();
            $table->json('bullying_location')->nullable();
            $table->string('bullying_location_other')->nullable();
            $table->json('victim_spoken_to')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bullying_reports');
    }
};
