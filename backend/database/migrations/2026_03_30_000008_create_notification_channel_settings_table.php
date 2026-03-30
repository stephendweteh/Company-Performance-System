<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationChannelSettingsTable extends Migration
{
    public function up()
    {
        Schema::create('notification_channel_settings', function (Blueprint $table) {
            $table->id();
            $table->string('smtp_host')->nullable();
            $table->unsignedInteger('smtp_port')->nullable();
            $table->string('smtp_encryption', 10)->nullable();
            $table->string('smtp_username')->nullable();
            $table->text('smtp_password')->nullable();
            $table->string('smtp_from_email')->nullable();
            $table->string('smtp_from_name')->nullable();

            $table->text('arkesel_api_key')->nullable();
            $table->string('arkesel_sender_id', 30)->nullable();
            $table->string('arkesel_api_url')->nullable();

            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notification_channel_settings');
    }
}
