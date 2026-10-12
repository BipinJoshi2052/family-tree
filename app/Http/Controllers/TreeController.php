<?php

namespace App\Http\Controllers;

use App\Models\Tree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TreeController extends Controller
{
    /**
     * List the authenticated user's trees, most recently updated first.
     */
    public function index(Request $request): JsonResponse
    {
        $trees = $request->user()->trees()
            ->withCount('people')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($trees);
    }

    /**
     * Create a new tree with its first person (the only person with no relative to attach to).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'default_lang' => ['nullable', 'in:en,ne'],
            'person' => ['required', 'array'],
            'person.name' => ['required', 'string', 'max:80'],
            'person.name_ne' => ['nullable', 'string', 'max:80'],
            'person.gender' => ['required', 'in:male,female'],
        ]);

        $tree = DB::transaction(function () use ($request, $data) {
            $tree = $request->user()->trees()->create([
                'name' => $data['name'],
                'default_lang' => $data['default_lang'] ?? 'en',
            ]);

            $tree->people()->create([
                'name' => $data['person']['name'],
                'name_ne' => $data['person']['name_ne'] ?? null,
                'gender' => $data['person']['gender'],
                'pids' => [],
            ]);

            return $tree;
        });

        return response()->json($tree->loadCount('people'), 201);
    }

    /**
     * Rename a tree, toggle its star, or change its default display language.
     */
    public function update(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:60'],
            'starred' => ['sometimes', 'boolean'],
            'default_lang' => ['sometimes', 'in:en,ne'],
        ]);

        $tree->update($data);

        return response()->json($tree);
    }

    /**
     * Delete a tree, its people, and their stored photo files.
     */
    public function destroy(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        $tree->people->each(fn ($person) => $person->deletePhotoFile());
        $tree->delete();

        return response()->json(['ok' => true]);
    }
}
