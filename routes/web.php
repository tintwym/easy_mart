<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ReviewController;
use App\Models\Category;
use App\Models\Listing;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Dashboard is the default page (public; login/register in navbar for guests)
Route::get('/', function (\Illuminate\Http\Request $request) {
    $query = Listing::with(['category', 'user:id,name,seller_type'])->latest();

    if ($q = $request->query('q')) {
        $query->where(function ($qry) use ($q) {
            $qry->where('title', 'like', '%' . $q . '%')
                ->orWhere('description', 'like', '%' . $q . '%');
        });
    }

    return Inertia::render('dashboard', [
        'listings' => $query->take(100)->get(),
        'searchQuery' => $request->query('q', ''),
    ]);
})->name('dashboard');

// Redirect old dashboard URL to home
Route::redirect('/dashboard', '/');

// Categories landing (optional)
Route::get('/home', [HomeController::class, 'index'])->name('home');

// Category page: browse listings by category
Route::get('/categories/{slug}', function (string $slug) {
    $category = Category::where('slug', $slug)->firstOrFail();
    $listings = Listing::with(['category', 'user:id,name,seller_type'])
        ->where('category_id', $category->id)
        ->latest()
        ->get();

    return Inertia::render('categories/show', [
        'category' => $category,
        'listings' => $listings,
    ]);
})->name('categories.show');

// Listings CRUD - define /create before /{listing} so "create" isn't matched as listing ID
Route::middleware(['auth'])->group(function () {
    Route::get('listings/create', [ListingController::class, 'create'])->name('listings.create');
});

Route::get('listings/{listing}', [ListingController::class, 'show'])->name('listings.show');
Route::post('listings/{listing}/reviews', [ReviewController::class, 'store'])->name('listings.reviews.store')->middleware('auth');
Route::post('listings/{listing}/chat', [ChatController::class, 'store'])->name('listings.chat.store')->middleware('auth');

Route::middleware(['auth'])->group(function () {
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/{conversation}/messages', [ChatController::class, 'sendMessage'])->name('chat.messages.store');
    Route::get('cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('listings/{listing}/cart', [CartController::class, 'store'])->name('listings.cart.store');
    Route::delete('listings/{listing}/cart', [CartController::class, 'destroy'])->name('listings.cart.destroy');
    Route::resource('listings', ListingController::class)->except(['index', 'show', 'create']);
});

require __DIR__.'/settings.php';
