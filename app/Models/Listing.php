<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids; // Required for ULIDs
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory, HasUlids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'condition',
        'price',
        'image_path',
        'meetup_location',
        'trending_until',
    ];

    protected function casts(): array
    {
        return [
            'trending_until' => 'datetime',
        ];
    }

    /**
     * Relationship: A listing belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: A listing belongs to a category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relationship: A listing has many reviews.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relationship: A listing has many conversations.
     */
    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Average rating (1-5) from reviews.
     */
    public function averageRating(): float
    {
        return (float) $this->reviews()->avg('rating');
    }

    public function isTrending(): bool
    {
        return $this->trending_until && $this->trending_until->isFuture();
    }

    public function scopeOrderByTrendingFirst($query)
    {
        return $query->orderByRaw('CASE WHEN trending_until IS NOT NULL AND trending_until > CURRENT_TIMESTAMP THEN 0 ELSE 1 END')
            ->orderByDesc('trending_until')
            ->latest();
    }
}
