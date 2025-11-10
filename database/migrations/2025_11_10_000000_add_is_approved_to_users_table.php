<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsApprovedToUsersTable extends Migration
{
    public function up()
    {
        if (! Schema::hasColumn('users', 'is_approved')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_approved')->default(false)->after('role');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('users', 'is_approved')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_approved');
            });
        }
    }
}