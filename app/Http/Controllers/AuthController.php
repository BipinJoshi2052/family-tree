<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class AuthController extends Controller
{
    /**
     * Show the combined login / sign-up page.
     */
    public function show(): RedirectResponse|View
    {
        if (Auth::check()) {
            return redirect()->route('trees');
        }

        return view('auth');
    }

    /**
     * Authenticate an existing user.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Those credentials don\'t match an account.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->route('trees');
    }

    /**
     * Register a new user.
     */
    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $colors = ['#039be5', '#fb8c00', '#7e57c2', '#26a69a', '#ec407a', '#5c6bc0', '#8d6e63', '#43a047'];

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'color' => $colors[array_rand($colors)],
        ]);

        $user->settings()->create(['ne' => false]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('trees');
    }

    /**
     * Log the current user out.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
