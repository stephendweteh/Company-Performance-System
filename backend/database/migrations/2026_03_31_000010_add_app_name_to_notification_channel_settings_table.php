<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAppNameToNotificationChannelSettingsTable extends Migration
{
    public function up()
    {
        Schema::table('notification_channel_settings', function (Blueprint $table) {
            $table->string('app_name')->nullable()->after('id');
        });
    }

    public function down()
    {
        Schema::table('notification_channel_settings', function (Blueprint $table) {
            $table->dropColumn('app_name');
        });
    }
}