<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PersonController extends Controller
{
    /**
     * List every person in a tree, for the editor canvas.
     */
    public function index(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        return response()->json($tree->people()->get());
    }

    /**
     * Add a relative to an existing person: mother, father, partner, son, or daughter.
     * Mirrors the relation wiring the editor's "add relative" form already uses.
     */
    public function store(Request $request, Tree $tree): JsonResponse
    {
        abort_unless($tree->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'rel' => ['required', 'in:mother,father,partner,son,daughter'],
            'relative_id' => ['required', 'integer', 'exists:people,id'],
            'co_parent_id' => ['nullable', 'integer', 'exists:people,id'],
            'name' => ['required', 'string', 'max:80'],
            'name_ne' => ['nullable', 'string', 'max:80'],
            'gender' => ['required', 'in:male,female'],
            'birth_date' => ['nullable', 'date'],
            'birthplace' => ['nullable', 'string', 'max:80'],
            'status' => ['required', 'in:living,deceased'],
            'death_date' => ['nullable', 'date'],
            'residency' => ['sometimes', 'in:local,abroad'],
        ]);

        $relative = $tree->people()->findOrFail($data['relative_id']);

        $person = DB::transaction(function () use ($tree, $relative, $data) {
            $person = $tree->people()->create([
                'name' => $data['name'],
                'name_ne' => $data['name_ne'] ?? null,
                'gender' => $data['gender'],
                'birth_date' => $data['birth_date'] ?? null,
                'birthplace' => $data['birthplace'] ?? null,
                'status' => $data['status'],
                'death_date' => $data['status'] === 'deceased' ? ($data['death_date'] ?? null) : null,
                'residency' => $data['residency'] ?? 'local',
                'pids' => [],
            ]);

            match ($data['rel']) {
                'mother' => $this->linkParent($relative, $person, 'mother_id'),
                'father' => $this->linkParent($relative, $person, 'father_id'),
                'partner' => $this->linkPartners($relative, $person),
                default => $this->linkChild($relative, $person, $data['rel'], $data['co_parent_id'] ?? null),
            };

            return $person->fresh();
        });

        return response()->json($person, 201);
    }

    /**
     * Remove a person from the tree. Children keep their place but lose this recorded parent
     * (the father_id/mother_id foreign keys are set null on delete); any spouse's own `pids`
     * list - a plain JSON column, not a foreign key - is cleaned up here instead.
     */
    public function destroy(Request $request, Person $person): JsonResponse
    {
        abort_unless($person->tree->user_id === $request->user()->id, 404);

        if ($person->tree->people()->count() <= 1) {
            return response()->json(['message' => 'A tree needs at least one person. Delete the tree itself instead.'], 422);
        }

        DB::transaction(function () use ($person) {
            foreach ($person->pids ?? [] as $spouseId) {
                $spouse = Person::find($spouseId);
                if ($spouse) {
                    $spouse->pids = collect($spouse->pids ?? [])->reject(fn ($id) => $id === $person->id)->values()->all();
                    $spouse->save();
                }
            }

            $person->deletePhotoFile();
            $person->delete();
        });

        $person->tree->touch();

        return response()->json(['ok' => true]);
    }

    /**
     * Spin off this person's branch - every ancestor (both parents, every generation up) and
     * their own direct line of descendants (with each generation's spouses, so no co-parent is
     * left dangling) - into a brand new, independent tree. Siblings, cousins, and anyone else off
     * that direct line are left out entirely; nothing links the two trees together afterwards.
     */
    public function branch(Request $request, Person $person): JsonResponse
    {
        abort_unless($person->tree->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:60'],
        ]);

        $sourceTree = $person->tree;
        $all = $sourceTree->people()->get()->keyBy('id');

        $included = $this->collectBranch($person, $all);

        $tree = DB::transaction(function () use ($request, $data, $sourceTree, $all, $included) {
            $tree = $request->user()->trees()->create([
                'name' => $data['name'],
                'default_lang' => $sourceTree->default_lang,
                'layout' => $sourceTree->layout,
            ]);

            $idMap = [];
            foreach ($included as $id) {
                $source = $all[$id];
                $isStoredFile = $source->img && str_starts_with($source->img, 'images/');

                $new = $tree->people()->create([
                    'name' => $source->name,
                    'name_ne' => $source->name_ne,
                    'gender' => $source->gender,
                    'birth_date' => $source->birth_date,
                    'birthplace' => $source->birthplace,
                    'status' => $source->status,
                    'death_date' => $source->death_date,
                    'phone' => $source->phone,
                    'location' => $source->location,
                    'residency' => $source->residency,
                    'bio' => $source->bio,
                    'img' => $isStoredFile ? null : $source->img,
                    'sort_order' => $source->sort_order,
                    'pids' => [],
                ]);

                // A server-stored photo's path is tied to the person's own id (images/<user>/<id>.jpg),
                // so it can't just be copied as a string - the clone needs its own copy of the file
                // at its own path, or deleting either person's photo later would delete the other's too.
                if ($isStoredFile && Storage::disk('public')->exists($source->img)) {
                    $newPath = "images/{$request->user()->id}/{$new->id}.jpg";
                    Storage::disk('public')->copy($source->img, $newPath);
                    $new->update(['img' => $newPath]);
                }

                $idMap[$id] = $new->id;
            }

            foreach ($included as $id) {
                $source = $all[$id];
                $new = Person::find($idMap[$id]);
                $new->father_id = $source->father_id && isset($idMap[$source->father_id]) ? $idMap[$source->father_id] : null;
                $new->mother_id = $source->mother_id && isset($idMap[$source->mother_id]) ? $idMap[$source->mother_id] : null;
                $new->pids = collect($source->pids ?? [])
                    ->map(fn ($pid) => $idMap[$pid] ?? null)
                    ->filter()
                    ->values()
                    ->all();
                $new->save();
            }

            return $tree;
        });

        return response()->json($tree->loadCount('people'), 201);
    }

    /**
     * @param  Collection<int, Person>  $all
     * @return array<int, int>
     */
    private function collectBranch(Person $person, Collection $all): array
    {
        $included = [];

        $ancestorQueue = [$person->id];
        while ($ancestorQueue) {
            $cur = $all[array_pop($ancestorQueue)];
            foreach ([$cur->father_id, $cur->mother_id] as $parentId) {
                if ($parentId && ! isset($included[$parentId]) && isset($all[$parentId])) {
                    $included[$parentId] = true;
                    $ancestorQueue[] = $parentId;
                }
            }
        }

        $included[$person->id] = true;
        $descendantQueue = [$person->id];
        while ($descendantQueue) {
            $curId = array_pop($descendantQueue);
            $cur = $all[$curId];

            foreach ($cur->pids ?? [] as $spouseId) {
                if (! isset($included[$spouseId]) && isset($all[$spouseId])) {
                    $included[$spouseId] = true;
                }
            }

            foreach ($all as $candidate) {
                if (($candidate->father_id === $curId || $candidate->mother_id === $curId) && ! isset($included[$candidate->id])) {
                    $included[$candidate->id] = true;
                    $descendantQueue[] = $candidate->id;
                }
            }
        }

        return array_keys($included);
    }

    /**
     * Update a person's own details (not their relationships).
     */
    public function update(Request $request, Person $person): JsonResponse
    {
        abort_unless($person->tree->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:80'],
            'name_ne' => ['sometimes', 'nullable', 'string', 'max:80'],
            'gender' => ['sometimes', 'in:male,female'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'birthplace' => ['sometimes', 'nullable', 'string', 'max:80'],
            'status' => ['sometimes', 'in:living,deceased'],
            'death_date' => ['sometimes', 'nullable', 'date'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'location' => ['sometimes', 'nullable', 'string', 'max:80'],
            'residency' => ['sometimes', 'in:local,abroad'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:600'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'father_id' => ['sometimes', 'nullable', 'integer', Rule::exists('people', 'id')->where('tree_id', $person->tree_id)],
            'mother_id' => ['sometimes', 'nullable', 'integer', Rule::exists('people', 'id')->where('tree_id', $person->tree_id)],
        ]);

        if (($data['status'] ?? $person->status) !== 'deceased') {
            $data['death_date'] = null;
        }

        foreach (['father_id', 'mother_id'] as $slot) {
            if (! array_key_exists($slot, $data) || ! $data[$slot]) {
                continue;
            }
            if ($data[$slot] === $person->id) {
                return response()->json(['message' => 'A person cannot be their own parent.'], 422);
            }
            if (in_array($data[$slot], $this->descendantIds($person), true)) {
                return response()->json(['message' => 'That person is already recorded as a descendant, so they cannot also be a parent here.'], 422);
            }
        }

        $person->update($data);

        // Editing a parent link directly (rather than through the "add relative" ghosts, which
        // already do this) should still marry the two parents to one another once both are set,
        // same as linkParent() does - otherwise this is the one path that can leave a child with
        // two recorded parents who aren't shown as spouses of each other.
        if ((array_key_exists('father_id', $data) || array_key_exists('mother_id', $data)) && $person->father_id && $person->mother_id) {
            $this->linkPartners($person->father, $person->mother);
        }

        $person->tree->touch();

        return response()->json($person->fresh());
    }

    /**
     * Every descendant of `$person` (children, grandchildren, ...) - used to stop a parent-link
     * edit from pointing at someone already below `$person` in the tree, which would create a cycle.
     *
     * @return array<int, int>
     */
    private function descendantIds(Person $person): array
    {
        $all = $person->tree->people()->get(['id', 'father_id', 'mother_id']);
        $ids = [];
        $queue = [$person->id];

        while ($queue) {
            $curId = array_pop($queue);
            foreach ($all as $candidate) {
                if (($candidate->father_id === $curId || $candidate->mother_id === $curId) && ! in_array($candidate->id, $ids, true)) {
                    $ids[] = $candidate->id;
                    $queue[] = $candidate->id;
                }
            }
        }

        return $ids;
    }

    /**
     * Record `$child` as a child of `$parent` (and, if given, of `$coParentId` too).
     */
    private function linkChild(Person $parent, Person $child, string $rel, ?int $coParentId): void
    {
        if ($parent->gender === 'male') {
            $child->father_id = $parent->id;
            if ($coParentId) {
                $child->mother_id = $coParentId;
            }
        } else {
            $child->mother_id = $parent->id;
            if ($coParentId) {
                $child->father_id = $coParentId;
            }
        }
        $child->save();
    }

    /**
     * Record `$newParent` as the other parent of `$existingChild's` recorded parent, and marry
     * them to one another (as spouses) in the process.
     */
    private function linkParent(Person $existingChild, Person $newParent, string $slot): void
    {
        $otherParentId = $existingChild->{$slot === 'mother_id' ? 'father_id' : 'mother_id'};
        $existingChild->{$slot} = $newParent->id;
        $existingChild->save();

        if ($otherParentId) {
            $this->linkPartners(Person::findOrFail($otherParentId), $newParent);
        }
    }

    /**
     * Record two people as spouses of one another.
     */
    private function linkPartners(Person $a, Person $b): void
    {
        $aPids = $a->pids ?? [];
        if (! in_array($b->id, $aPids, true)) {
            $aPids[] = $b->id;
            $a->pids = $aPids;
            $a->save();
        }

        $bPids = $b->pids ?? [];
        if (! in_array($a->id, $bPids, true)) {
            $bPids[] = $a->id;
            $b->pids = $bPids;
            $b->save();
        }
    }
}
