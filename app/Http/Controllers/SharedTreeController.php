<?php

namespace App\Http\Controllers;

use App\Models\Tree;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;

class SharedTreeController extends Controller
{
    /**
     * The public, read-only page for a tree someone shared. No auth - access control is the
     * token itself, which only exists in the URL the owner copied and handed out.
     */
    public function show(string $token): View
    {
        Tree::where('share_token', $token)->firstOrFail();

        return view('shared', ['token' => $token]);
    }

    /**
     * The tree's own fields and every person in it, scoped by the share token alone.
     */
    public function data(string $token): JsonResponse
    {
        $tree = Tree::where('share_token', $token)->firstOrFail();

        return response()->json([
            'tree' => [
                'id' => $tree->id,
                'name' => $tree->name,
                'default_lang' => $tree->default_lang,
                'layout' => $tree->layout,
            ],
            'people' => $tree->people,
        ]);
    }
}
