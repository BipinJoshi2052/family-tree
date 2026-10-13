<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\PersonPhotoController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TreeController;
use App\Http\Controllers\TreeImportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('trees') : redirect()->route('welcome');
});

Route::middleware('guest')->group(function () {
    Route::get('/welcome', [PageController::class, 'welcome'])->name('welcome');
    Route::get('/login', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
    Route::post('/register', [AuthController::class, 'register'])->name('register');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/trees', [PageController::class, 'trees'])->name('trees');
    Route::get('/editor/{tree:slug}', [PageController::class, 'editor'])->name('editor');

    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/trees', [TreeController::class, 'index'])->name('trees.index');
        Route::get('/trees/{tree:slug}', [TreeController::class, 'show'])->name('trees.show');
        Route::post('/trees', [TreeController::class, 'store'])->name('trees.store');
        Route::patch('/trees/{tree}', [TreeController::class, 'update'])->name('trees.update');
        Route::delete('/trees/{tree}', [TreeController::class, 'destroy'])->name('trees.destroy');
        Route::post('/trees/import', [TreeImportController::class, 'store'])->name('trees.import');

        Route::get('/trees/{tree}/people', [PersonController::class, 'index'])->name('people.index');
        Route::post('/trees/{tree}/people', [PersonController::class, 'store'])->name('people.store');
        Route::patch('/people/{person}', [PersonController::class, 'update'])->name('people.update');
        Route::delete('/people/{person}', [PersonController::class, 'destroy'])->name('people.destroy');
        Route::post('/people/{person}/photo', [PersonPhotoController::class, 'store'])->name('people.photo.store');
        Route::delete('/people/{person}/photo', [PersonPhotoController::class, 'destroy'])->name('people.photo.destroy');

        Route::get('/settings', [SettingsController::class, 'show'])->name('settings.show');
        Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
    });
});
