<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoleCompanyTeamToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('employee')->after('email'); // employer | employee
            $table->unsignedBigInteger('company_id')->nullable()->after('role');
            $table->unsignedBigInteger('team_id')->nullable()->after('company_id');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'company_id', 'team_id']);
        });
    }
}
