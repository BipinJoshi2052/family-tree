<?php

namespace App\Http\Controllers;

use App\Models\Tree;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * The welcome / onboarding carousel.
     */
    public function welcome(): View
    {
        return view('welcome');
    }

    /**
     * The "My trees" dashboard shell. Tree data itself loads via AJAX.
     *
     * Both this and editor() render the same `app` view - "My trees" and "Editor" are two
     * screens within one page, switched client-side (see core.js's showScreen()) without a full
     * reload. This route only decides which screen is active on first paint; everything after
     * that first paint is client-side navigation via history.pushState.
     */
    public function trees(): View
    {
        return view('app', ['initialView' => 'app', 'treeSlug' => null, 'fresh' => false]);
    }

    /**
     * The tree editor screen for one tree, addressed by slug. People data loads via AJAX.
     */
    public function editor(Tree $tree, Request $request): View
    {
        abort_unless($tree->user_id === auth()->id(), 404);

        return view('app', [
            'initialView' => 'editor',
            'treeSlug' => $tree->slug,
            'fresh' => $request->boolean('fresh'),
        ]);
    }
}
