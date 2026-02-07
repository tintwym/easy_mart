<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Services\RegionFromIp;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'cartCount' => fn () => request()->user()
                    ? request()->user()->cartItems()->count()
                    : 0,
                'cartListingIds' => fn () => request()->user()
                    ? request()->user()->cartItems()->pluck('listing_id')->toArray()
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'categories' => fn () => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'locations' => function () {
                $locations = config('shop.locations', []);
                if (! empty($locations)) {
                    return array_map(fn ($loc) => is_array($loc)
                        ? $loc
                        : ['name' => $loc, 'lat' => null, 'lng' => null],
                    $locations);
                }
                $region = RegionFromIp::detect(request());
                $regions = config('shop.regions', []);

                return $regions[$region] ?? $regions[config('shop.default_region', 'MM')] ?? [];
            },
            'regionLabel' => function () {
                $labels = ['SG' => 'Singapore', 'MM' => 'Myanmar', 'US' => 'United States'];
                $region = RegionFromIp::detect(request());

                return $labels[$region] ?? 'All';
            },
        ];
    }
}
