<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'tree_id', 'name', 'name_ne', 'gender', 'birth_date', 'status', 'death_date',
    'birthplace', 'phone', 'location', 'residency', 'bio', 'img', 'pids', 'father_id', 'mother_id',
])]
class Person extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'death_date' => 'date',
            'pids' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Tree, $this>
     */
    public function tree(): BelongsTo
    {
        return $this->belongsTo(Tree::class);
    }

    /**
     * @return BelongsTo<Person, $this>
     */
    public function father(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'father_id');
    }

    /**
     * @return BelongsTo<Person, $this>
     */
    public function mother(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'mother_id');
    }

    /**
     * Remove this person's stored photo file from disk, if any. Does not touch the `img` column -
     * callers clear or overwrite that separately.
     */
    public function deletePhotoFile(): void
    {
        if ($this->img) {
            Storage::disk('public')->delete($this->img);
        }
    }
}
