<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\Tree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        ]);

        if (($data['status'] ?? $person->status) !== 'deceased') {
            $data['death_date'] = null;
        }

        $person->update($data);
        $person->tree->touch();

        return response()->json($person->fresh());
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
