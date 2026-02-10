<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Models\Category;
use App\Models\Listing;
use App\Services\RegionFromIp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function show(Listing $listing): Response
    {
        $listing->load(['category', 'user:id,name,seller_type,region', 'reviews' => fn ($q) => $q->with('user:id,name')->latest()]);

        $currency = $this->currencyForRequest(request());
        $trendPrice = config('shop.trend_price', 10);
        $trendDays = config('shop.trend_duration_days', 7);

        return Inertia::render('listings/show', [
            'listing' => $listing,
            'averageRating' => round($listing->reviews()->avg('rating') ?? 0, 1),
            'reviewCount' => $listing->reviews()->count(),
            'trendPriceLabel' => $currency['symbol'].$trendPrice.' for '.$trendDays.' days',
            'trendDurationDays' => $trendDays,
        ]);
    }

    public function index(Request $request): Response
    {
        $listings = Listing::with(['category', 'user:id,name,seller_type,region'])
            ->latest()
            ->paginate(12);

        return Inertia::render('listings/index', [
            'listings' => $listings,
        ]);
    }

    public function create(): Response
    {
        $user = request()->user();
        $listingCount = $user->listingCount();
        $maxSlots = $user->maxListingSlots();
        $currency = $this->currencyForRequest(request());
        $slotPrice = config('shop.slot_price', 5);

        return Inertia::render('listings/create', [
            'categories' => Category::orderBy('name')->get(),
            'listingCount' => $listingCount,
            'maxListingSlots' => $maxSlots,
            'canCreate' => $user->canCreateListing(),
            'slotPrice' => $slotPrice,
            'slotPriceLabel' => $currency['symbol'].$slotPrice.' per slot',
        ]);
    }

    public function store(StoreListingRequest $request): RedirectResponse
    {
        $this->authorize('create', Listing::class);

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

    public function promote(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorize('update', $listing);

        $days = config('shop.trend_duration_days', 7);
        $listing->update([
            'trending_until' => now()->addDays($days),
        ]);

        return redirect()
            ->route('listings.show', $listing)
            ->with('status', "Listing promoted for {$days} days. It will appear higher in search.");
    }

    /** @return array{code: string, symbol: string, decimals: int} */
    private function currencyForRequest(Request $request): array
    {
        $region = RegionFromIp::detect($request);
        $currencies = config('shop.currencies', []);
        $default = config('shop.default_currency', ['code' => 'USD', 'symbol' => '$', 'decimals' => 2]);

        return $currencies[$region] ?? $default;
    }
}
