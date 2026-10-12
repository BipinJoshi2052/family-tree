<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;

class PersonPhotoController extends Controller
{
    /**
     * Square-crop an uploaded photo and store it at storage/app/public/images/{user_id}/{person_id}.jpg.
     */
    public function store(Request $request, Person $person): JsonResponse
    {
        abort_unless($person->tree->user_id === $request->user()->id, 404);

        $request->validate([
            'photo' => ['required', 'image', 'max:8192'],
        ]);

        $person->deletePhotoFile();

        $manager = ImageManager::usingDriver(new Driver);
        $image = $manager->decodePath($request->file('photo')->getRealPath());
        $image->cover(600, 600);

        $path = "images/{$request->user()->id}/{$person->id}.jpg";
        Storage::disk('public')->put($path, (string) $image->encode(new JpegEncoder(quality: 86)));

        $person->update(['img' => $path]);

        return response()->json([
            'img' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    /**
     * Remove a person's stored photo.
     */
    public function destroy(Request $request, Person $person): JsonResponse
    {
        abort_unless($person->tree->user_id === $request->user()->id, 404);

        $person->deletePhotoFile();
        $person->update(['img' => null]);

        return response()->json(['ok' => true]);
    }
}
