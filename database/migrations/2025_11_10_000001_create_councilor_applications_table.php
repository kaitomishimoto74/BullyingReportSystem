<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCouncilorApplicationsTable extends Migration
{
    public function up()
    {
        if (! Schema::hasTable('councilor_applications')) {
            Schema::create('councilor_applications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('attachment_path')->nullable();
                $table->string('status')->default('pending'); // pending, approved, rejected
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('user_id');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('councilor_applications');
    }
}