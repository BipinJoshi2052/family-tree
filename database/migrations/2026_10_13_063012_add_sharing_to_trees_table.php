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
        Schema::table('trees', function (Blueprint $table) {
            // Null until the owner first clicks "Share"; a public /shared/{token} link reads the
            // tree by this instead of the id, and stops working once it's cleared (unshared).
            $table->string('share_token', 64)->nullable()->unique()->after('slug');
            // Null means "use the app's own default" (Tree mode) - same convention as default_lang.
            // Persisted server-side rather than only in localStorage so a public viewer (who has no
            // access to the owner's browser storage) sees the same layout the owner chose.
            $table->enum('layout', ['tree', 'default'])->nullable()->after('default_lang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->dropColumn(['share_token', 'layout']);
        });
    }
};
