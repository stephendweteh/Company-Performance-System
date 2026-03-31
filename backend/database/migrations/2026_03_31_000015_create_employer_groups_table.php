<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group_name');
            $table->foreignId('manager_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('employer_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_group_id')->constrained('employer_groups')->onDelete('cascade');
            $table->foreignId('employer_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['employer_group_id', 'employer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_group_members');
        Schema::dropIfExists('employer_groups');
    }
};
