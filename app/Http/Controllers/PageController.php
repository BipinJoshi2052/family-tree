<?php

namespace App\Http\Controllers;

use App\Models\Tree;
use Illuminate\Contracts\View\View;

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
     */
    public function trees(): View
    {
        return view('trees');
    }

    /**
     * The tree editor shell for one tree. People data loads via AJAX.
     */
    public function editor(Tree $tree): View
    {
        abort_unless($tree->user_id === auth()->id(), 404);

        return view('editor', ['tree' => $tree]);
    }
}
