<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportsTable extends Migration
{
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->date('report_date');
            $table->string('title');
            $table->text('work_done');
            $table->text('challenges')->nullable();
            $table->text('wins')->nullable();
            $table->string('status')->default('submitted'); // submitted | reviewed | approved | needs_revision
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reports');
    }
}
