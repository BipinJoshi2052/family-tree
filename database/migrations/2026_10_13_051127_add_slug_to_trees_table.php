<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Backfill existing rows (name-slug + id is unique by construction, no collision handling needed).
        foreach (DB::table('trees')->select('id', 'name')->get() as $tree) {
            DB::table('trees')->where('id', $tree->id)->update([
                'slug' => Str::slug($tree->name).'-'.$tree->id,
            ]);
        }

        Schema::table('trees', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
