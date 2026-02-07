<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Models\Category;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function show(Listing $listing): Response
    {
        $listing->load(['category', 'user:id,name,seller_type', 'reviews' => fn ($q) => $q->with('user:id,name')->latest()]);

        return Inertia::render('listings/show', [
            'listing' => $listing,
            'averageRating' => round($listing->reviews()->avg('rating') ?? 0, 1),
            'reviewCount' => $listing->reviews()->count(),
        ]);
    }

    public function index(Request $request): Response
    {
        $listings = Listing::with('category')
            ->latest()
            ->paginate(12);

        return Inertia::render('listings/index', [
            'listings' => $listings,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Listing::class);

        return Inertia::render('listings/create', [
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function store(StoreListingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('listings', 'public');
        }

        Listing::create([
            'user_id' => $request->user()->id,
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'condition' => $data['condition'],
            'price' => $data['price'],
            'image_path' => $imagePath ? '/storage/'.$imagePath : null,
            'meetup_location' => $data['meetup_location'] ?? null,
        ]);

        return redirect()->route('dashboard')->with('status', 'Listing created.');
    }

    public function edit(Listing $listing): Response|RedirectResponse
    {
        $this->authorize('update', $listing);

        return Inertia::render('listings/edit', [
            'listing' => $listing->load('category'),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function update(UpdateListingRequest $request, Listing $listing): RedirectResponse
    {
        $data = $request->validated();
        $imagePath = $listing->image_path;

        if ($request->hasFile('image')) {
            if ($listing->image_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $listing->image_path));
            }
            $stored = $request->file('image')->store('listings', 'public');
            $imagePath = '/storage/'.$stored;
        }

        $listing->update([
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'condition' => $data['condition'],
            'price' => $data['price'],
            'image_path' => $imagePath,
            'meetup_location' => $data['meetup_location'] ?? null,
        ]);

        return redirect()->route('dashboard')->with('status', 'Listing updated.');
    }

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorize('delete', $listing);

        if ($listing->image_path) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $listing->image_path));
        }
        $listing->delete();

        return redirect()->route('dashboard')->with('status', 'Listing deleted.');
    }
}
