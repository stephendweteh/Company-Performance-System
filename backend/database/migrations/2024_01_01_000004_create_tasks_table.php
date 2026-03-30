<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTasksTable extends Migration
{
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->unsignedBigInteger('assigned_to');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('team_id')->nullable();
            $table->date('start_date');
            $table->date('due_date');
            $table->string('status')->default('pending');   // pending | in_progress | completed
            $table->string('priority')->default('medium');  // low | medium | high | critical
            $table->timestamps();

            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tasks');
    }
}
