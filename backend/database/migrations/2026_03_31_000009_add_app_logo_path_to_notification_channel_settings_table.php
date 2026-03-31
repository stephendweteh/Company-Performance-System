<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAppLogoPathToNotificationChannelSettingsTable extends Migration
{
    public function up()
    {
        Schema::table('notification_channel_settings', function (Blueprint $table) {
            $table->string('app_logo_path')->nullable()->after('arkesel_api_url');
        });
    }

    public function down()
    {
        Schema::table('notification_channel_settings', function (Blueprint $table) {
            $table->dropColumn('app_logo_path');
        });
    }
}