<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    /**
     * The current user's profile and preferences.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'color' => $user->color,
            'name_ne' => $user->name_ne,
            'ne' => (bool) $user->settings?->ne,
        ]);
    }

    /**
     * Update profile fields and/or the Nepali-language toggle.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:60'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'color' => ['sometimes', 'string', 'max:20'],
            'name_ne' => ['sometimes', 'nullable', 'string', 'max:60'],
            'ne' => ['sometimes', 'boolean'],
        ]);

        $user->update(collect($data)->only(['name', 'email', 'color', 'name_ne'])->all());

        if (array_key_exists('ne', $data)) {
            $user->settings()->updateOrCreate([], ['ne' => $data['ne']]);
        }

        return $this->show($request);
    }
}
