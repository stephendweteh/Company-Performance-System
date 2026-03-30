<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('users')->onDelete('cascade');
            $table->date('report_date');
            $table->string('title');
            $table->text('work_done');
            $table->text('challenges')->nullable();
            $table->text('wins')->nullable();
            $table->enum('status', ['submitted', 'reviewed', 'approved', 'needs_revision'])->default('submitted');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
