<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $listingCount = $user->listingCount();
        $maxSlots = $user->maxListingSlots();

        return Inertia::render('upgrades/index', [
            'listingCount' => $listingCount,
            'maxListingSlots' => $maxSlots,
            'slotPrice' => config('shop.slot_price', 5),
            'slotPriceLabel' => config('shop.slot_price_label', '$5 per slot'),
            'trendPrice' => config('shop.trend_price', 10),
            'trendPriceLabel' => config('shop.trend_price_label', '$10 for 7 days'),
            'trendDurationDays' => config('shop.trend_duration_days', 7),
        ]);
    }

    public function purchaseSlots(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->increment('extra_listing_slots');

        return redirect()
            ->route('upgrades.index')
            ->with('status', 'Extra slot purchased. You can now list one more item.');
    }
}
