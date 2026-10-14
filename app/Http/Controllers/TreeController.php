<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
     * A single tree's own metadata (not its people) - used to resolve a slug from the URL into
     * the tree id the rest of the API works with.
     */
    public function show(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        return response()->json($tree->loadCount('people'));
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
     * Rename a tree, toggle its star, or change its default display language or layout.
     */
    public function update(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:60'],
            'starred' => ['sometimes', 'boolean'],
            'default_lang' => ['sometimes', 'in:en,ne'],
            'layout' => ['sometimes', 'nullable', 'in:tree,default'],
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

    /**
     * A tree's full data as a standalone JSON file (matching TreeImportController's shape), with
     * any server-stored photo embedded as a base64 data URI so the file can be edited elsewhere
     * (e.g. to regenerate names) and re-imported with photos intact, with no separate images folder.
     */
    public function export(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        return response()->json([
            'app' => 'Family Tree',
            'version' => 1,
            'name' => $tree->name,
            'starred' => $tree->starred,
            'defaultLang' => $tree->default_lang,
            'layout' => $tree->layout,
            'people' => $tree->people->map(fn (Person $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'nameNe' => $p->name_ne,
                'gender' => $p->gender,
                'birthDate' => $p->birth_date?->format('Y-m-d'),
                'status' => $p->status,
                'deathDate' => $p->death_date?->format('Y-m-d'),
                'birthplace' => $p->birthplace,
                'phone' => $p->phone,
                'location' => $p->location,
                'residency' => $p->residency,
                'bio' => $p->bio,
                'img' => $this->exportImg($p->img),
                'fid' => $p->father_id,
                'mid' => $p->mother_id,
                'pids' => $p->pids,
                'sortOrder' => $p->sort_order,
            ])->values(),
        ]);
    }

    /**
     * A stored photo (images/{user}/{person}.jpg) is public with no auth required, so it's
     * exported as that public URL rather than embedded - far smaller, and still openable directly
     * in a browser. TreeImportController recognises this app's own storage URLs and copies the
     * underlying file into the new tree, rather than leaving a cross-tree pointer.
     */
    private function exportImg(?string $img): ?string
    {
        if (! $img || ! str_starts_with($img, 'images/')) {
            return $img;
        }

        if (! Storage::disk('public')->exists($img)) {
            return null;
        }

        return Storage::disk('public')->url($img);
    }

    /**
     * Turn on public read-only sharing for a tree, generating its link's token the first time.
     */
    public function share(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        if (! $tree->share_token) {
            $tree->update(['share_token' => Str::random(32)]);
        }

        return response()->json(['share_token' => $tree->share_token, 'share_url' => url('/shared/'.$tree->share_token)]);
    }

    /**
     * Turn off public sharing - the old link stops working immediately.
     */
    public function unshare(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        $tree->update(['share_token' => null]);

        return response()->json(['ok' => true]);
    }
}
