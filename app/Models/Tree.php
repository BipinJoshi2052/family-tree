<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['user_id', 'name', 'slug', 'starred', 'default_lang', 'layout', 'share_token'])]
class Tree extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starred' => 'boolean',
        ];
    }

    /**
     * Give every new tree a slug once its id is known - name-slug + id, so it's unique by
     * construction with no collision handling needed, and stable even if the tree is renamed later.
     */
    protected static function booted(): void
    {
        static::created(function (Tree $tree) {
            $tree->updateQuietly(['slug' => Str::slug($tree->name).'-'.$tree->id]);
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Person, $this>
     */
    public function people(): HasMany
    {
        return $this->hasMany(Person::class);
    }
}
