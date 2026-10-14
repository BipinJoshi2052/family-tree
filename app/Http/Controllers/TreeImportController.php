<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TreeImportController extends Controller
{
    /**
     * Import a tree-format JSON file (the shape documented in designs/README.txt) as a new tree.
     * The file's own person ids are strings chosen by the old app; this remaps them to the new
     * auto-increment ids in a second pass, once every person has a row.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $raw = json_decode($request->file('file')->get(), true);

        if (! is_array($raw) || ! isset($raw['people']) || ! is_array($raw['people']) || $raw['people'] === []) {
            return response()->json(['message' => 'That file is not a family tree export.'], 422);
        }

        $tree = DB::transaction(function () use ($request, $raw) {
            $tree = $request->user()->trees()->create([
                'name' => is_string($raw['name'] ?? null) ? $raw['name'] : 'Imported tree',
                'starred' => (bool) ($raw['starred'] ?? false),
                'default_lang' => ($raw['defaultLang'] ?? 'en') === 'ne' ? 'ne' : 'en',
                'layout' => in_array($raw['layout'] ?? null, ['tree', 'default'], true) ? $raw['layout'] : null,
            ]);

            $idMap = [];

            foreach ($raw['people'] as $p) {
                if (! is_array($p) || empty($p['id']) || empty($p['name'])) {
                    continue;
                }

                $rawImg = $p['img'] ?? null;
                $isDataUri = is_string($rawImg) && str_starts_with($rawImg, 'data:image/');

                $person = $tree->people()->create([
                    'name' => (string) $p['name'],
                    'name_ne' => $p['nameNe'] ?? null,
                    'gender' => ($p['gender'] ?? 'male') === 'female' ? 'female' : 'male',
                    'birth_date' => $this->validDate($p['birthDate'] ?? null),
                    'status' => ($p['status'] ?? 'living') === 'deceased' ? 'deceased' : 'living',
                    'death_date' => $this->validDate($p['deathDate'] ?? null),
                    'birthplace' => $p['birthplace'] ?? null,
                    'phone' => $p['phone'] ?? null,
                    'location' => $p['location'] ?? null,
                    'residency' => ($p['residency'] ?? 'local') === 'abroad' ? 'abroad' : 'local',
                    'bio' => $p['bio'] ?? null,
                    'img' => $isDataUri ? null : $this->sanitizeImg($rawImg),
                    'sort_order' => is_int($p['sortOrder'] ?? null) ? $p['sortOrder'] : null,
                ]);

                if ($isDataUri) {
                    $path = $this->storeDataUriPhoto($rawImg, $request->user()->id, $person->id);
                    if ($path) {
                        $person->update(['img' => $path]);
                    }
                }

                $idMap[(string) $p['id']] = $person->id;
            }

            foreach ($raw['people'] as $p) {
                if (! is_array($p) || empty($p['id']) || ! isset($idMap[(string) $p['id']])) {
                    continue;
                }

                $person = Person::find($idMap[(string) $p['id']]);
                $person->father_id = isset($p['fid'], $idMap[(string) $p['fid']]) ? $idMap[(string) $p['fid']] : null;
                $person->mother_id = isset($p['mid'], $idMap[(string) $p['mid']]) ? $idMap[(string) $p['mid']] : null;
                $person->pids = collect($p['pids'] ?? [])
                    ->map(fn ($pid) => $idMap[(string) $pid] ?? null)
                    ->filter()
                    ->values()
                    ->all();
                $person->save();
            }

            return $tree;
        });

        return response()->json($tree->fresh(), 201);
    }

    private function validDate(mixed $value): ?string
    {
        if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return null;
        }

        return $value;
    }

    /**
     * Keep http(s) URLs as-is; anything that looks like a path into the old app's local
     * "images/..." folder won't resolve here, so fall back to the generated placeholder. Image
     * data URIs are handled separately (storeDataUriPhoto) since the `img` column is a varchar(255)
     * and can't hold one directly.
     */
    private function sanitizeImg(mixed $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        if ($value === '@auto') {
            return $value;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return strlen($value) <= 255 ? $value : '@auto';
        }

        return '@auto';
    }

    /**
     * Decode an embedded "data:image/...;base64,..." photo and write it to its own file, keyed by
     * the new person's own id (mirrors PersonController::branch()'s clone-photo handling) - the
     * `img` column then stores just the short path, not the whole image.
     */
    private function storeDataUriPhoto(string $value, int $userId, int $personId): ?string
    {
        if (! preg_match('/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/', $value, $m)) {
            return null;
        }

        $binary = base64_decode($m[1], true);
        if ($binary === false) {
            return null;
        }

        $path = "images/{$userId}/{$personId}.jpg";
        Storage::disk('public')->put($path, $binary);

        return $path;
    }
}
