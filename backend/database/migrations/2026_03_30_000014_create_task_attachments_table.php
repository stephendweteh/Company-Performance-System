<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaskAttachmentsTable extends Migration
{
    public function up()
    {
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type'); // mime type
            $table->unsignedBigInteger('file_size'); // in bytes
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->index('task_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_attachments');
    }
}
