<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReviewFieldsToWinsTable extends Migration
{
    public function up()
    {
        Schema::table('wins', function (Blueprint $table) {
            $table->unsignedBigInteger('reviewer_id')->nullable()->after('employee_id');
            $table->unsignedBigInteger('response_by')->nullable()->after('reviewer_id');
            $table->string('status')->default('submitted')->after('description');
            $table->unsignedTinyInteger('score')->nullable()->after('status');
            $table->text('response_comment')->nullable()->after('score');
            $table->timestamp('responded_at')->nullable()->after('response_comment');

            $table->foreign('reviewer_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('response_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('wins', function (Blueprint $table) {
            $table->dropForeign(['reviewer_id']);
            $table->dropForeign(['response_by']);
            $table->dropColumn(['reviewer_id', 'response_by', 'status', 'score', 'response_comment', 'responded_at']);
        });
    }
}
