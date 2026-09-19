<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('courses', 'title') && ! Schema::hasColumn('courses', 'name')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->renameColumn('title', 'name');
            });
        }

        if (! Schema::hasColumn('enrollments', 'academic_year')) {
            Schema::table('enrollments', function (Blueprint $table) {
                $table->string('academic_year', 9)->nullable();
            });
        }

        if (! Schema::hasColumn('enrollments', 'status')) {
            Schema::table('enrollments', function (Blueprint $table) {
                $table->string('status', 10)->default('DRAFT');
            });
        }

        Schema::table('enrollments', function (Blueprint $table) {
            $table->unique(['student_id', 'course_id', 'academic_year', 'semester'], 'enrollments_student_course_year_semester_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropUnique('enrollments_student_course_year_semester_unique');
            $table->dropColumn(['academic_year', 'status']);
        });

        if (Schema::hasColumn('courses', 'name') && ! Schema::hasColumn('courses', 'title')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->renameColumn('name', 'title');
            });
        }
    }
};
