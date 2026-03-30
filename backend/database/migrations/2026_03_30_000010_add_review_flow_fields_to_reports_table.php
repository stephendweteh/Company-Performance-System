<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReviewFlowFieldsToReportsTable extends Migration
{
    public function up()
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedBigInteger('reviewer_id')->nullable()->after('employee_id');
            $table->unsignedBigInteger('response_by')->nullable()->after('reviewer_id');
            $table->text('response_comment')->nullable()->after('status');
            $table->timestamp('responded_at')->nullable()->after('response_comment');

            $table->foreign('reviewer_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('response_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['reviewer_id']);
            $table->dropForeign(['response_by']);
            $table->dropColumn(['reviewer_id', 'response_by', 'response_comment', 'responded_at']);
        });
    }
}
