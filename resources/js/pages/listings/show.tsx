import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    MapPin,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Star,
    Tag,
    Users,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types';

const CONDITION_LABELS: Record<string, string> = {
    new: 'New',
    like_new: 'Lightly used',
    good: 'Good',
    fair: 'Fair',
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60)
        return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24)
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;
    return formatDate(dateString);
}

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user: { id: string; name: string } | null;
};

type Category = {
    id: string;
    name: string;
    slug: string;
};

type Listing = {
    id: string;
    title: string;
    description: string;
    condition: string;
    price: number;
    image_path: string | null;
    image_url?: string | null;
    meetup_location: string | null;
    created_at: string;
    category?: Category | null;
    user?: {
        id: string;
        name: string;
        seller_type?: string;
        region?: string | null;
    } | null;
    reviews: Review[];
};

type Props = {
    listing: Listing & { trending_until?: string | null };
    averageRating: number;
    reviewCount: number;
    trendPriceLabel: string;
    trendDurationDays: number;
};

export default function ShowListing({
    listing,
    averageRating,
    reviewCount,
    trendPriceLabel,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const { formatPrice } = useCurrency();
    const { t, categoryName } = useTranslations();
    const userReview = listing.reviews.find(
        (r) => r.user?.id === auth?.user?.id,
    );
    const { data, setData, post, processing, errors } = useForm({
        rating: userReview?.rating ?? 5,
        comment: userReview?.comment ?? '',
    });

    const canReview = auth?.user && auth.user.id !== listing.user?.id;
    const isOwner = auth?.user && auth.user.id === listing.user?.id;
    const isTrending =
        listing.trending_until && new Date(listing.trending_until) > new Date();
    const isBuyer = auth?.user && auth.user.id !== listing.user?.id;
    const isGuest = !auth?.user;
    const showBuyerActions = !isOwner && (isBuyer || isGuest);
    const isBusinessSeller = listing.user?.seller_type === 'business';

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/listings/${listing.id}/reviews`);
    };

    /* Sidebar: full-width stacked buttons (Buy first, Add to cart second) */
    const sidebarBuyerActions = isBusinessSeller ? (
        <div className="flex flex-col gap-2">
            {auth?.cartListingIds?.includes(listing.id) ? (
                <>
                    <Button className="w-full" asChild>
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2"
                        >
                            <ShoppingBag className="mr-2 size-4" />
                            Buy
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2"
                        >
                            <ShoppingCart className="mr-2 size-4" />
                            In cart
                        </Link>
                    </Button>
                </>
            ) : (
                <>
                    <Button
                        className="w-full"
                        onClick={() =>
                            router.post(`/listings/${listing.id}/cart`, {
                                intent: 'buy',
                            })
                        }
                    >
                        <ShoppingBag className="mr-2 size-4" />
                        Buy
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            router.post(`/listings/${listing.id}/cart`)
                        }
                    >
                        <ShoppingCart className="mr-2 size-4" />
                        Add to cart
                    </Button>
                </>
            )}
        </div>
    ) : (
        <Button
            variant="outline"
            className="w-full"
            onClick={() => router.post(`/listings/${listing.id}/chat`)}
        >
            Make Offer
        </Button>
    );

    const sidebarGuestActions = isBusinessSeller ? (
        <div className="flex flex-col gap-2">
            <Button className="w-full" asChild>
                <Link href="/login" className="inline-flex items-center gap-2">
                    <ShoppingBag className="mr-2 size-4" />
                    Sign in to buy
                </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/login" className="inline-flex items-center gap-2">
                    <ShoppingCart className="mr-2 size-4" />
                    Sign in to add to cart
                </Link>
            </Button>
        </div>
    ) : (
        <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Sign in to make offer</Link>
        </Button>
    );

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={listing.title} />
            <div className="mx-auto w-full max-w-6xl px-0 pb-24 sm:px-2 lg:pb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-1 flex min-h-[44px] touch-manipulation justify-start sm:min-h-8"
                    asChild
                >
                    <Link
                        href={dashboard().url}
                        className="inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>

                {/* Large product image at top (Carousell-style) */}
                <div className="mb-8 aspect-square w-full overflow-hidden rounded-xl bg-muted sm:aspect-[4/3]">
                    {(listing.image_url ?? listing.image_path) ? (
                        <img
                            src={listing.image_url ?? listing.image_path ?? ''}
                            alt={listing.title}
                            className="size-full object-contain"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>

                <div className="grid gap-8 md:grid-cols-[1fr,320px]">
                    {/* Main content - left */}
                    <div className="min-w-0 space-y-8">
                        {/* Title + price */}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {listing.title}
                            </h1>
                            <p className="mt-2 text-3xl font-bold">
                                {formatPrice(
                                    listing.price,
                                    listing.user?.region,
                                )}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Tag className="size-4 shrink-0" />
                                    {CONDITION_LABELS[listing.condition] ??
                                        listing.condition}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="size-4 shrink-0" />
                                    {listing.meetup_location
                                        ? 'Meetup'
                                        : 'Meet-up'}
                                </span>
                                {listing.meetup_location && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="size-4 shrink-0" />
                                        {listing.meetup_location}
                                    </span>
                                )}
                                {listing.category && (
                                    <span>
                                        {t('listing.category')}{' '}
                                        <Link
                                            href={`/categories/${listing.category.slug}`}
                                            className="font-medium text-foreground hover:underline"
                                        >
                                            {categoryName(listing.category)}
                                        </Link>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <section>
                            <h2 className="mb-4 font-semibold">Details</h2>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm text-muted-foreground">
                                        Listed
                                    </dt>
                                    <dd className="mt-1">
                                        {formatRelativeTime(listing.created_at)}
                                        {listing.user && (
                                            <>
                                                {' by '}
                                                <span className="font-medium">
                                                    {listing.user.name}
                                                </span>
                                            </>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        {/* Description */}
                        <section>
                            <h2 className="mb-4 font-semibold">Description</h2>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {listing.description ||
                                    'No description provided.'}
                            </p>
                        </section>

                        {/* Deal method */}
                        <section>
                            <h2 className="mb-4 font-semibold">Deal method</h2>
                            <p className="text-muted-foreground">
                                {listing.meetup_location
                                    ? `Meetup · ${listing.meetup_location}`
                                    : 'Meet-up'}
                            </p>
                        </section>

                        {/* Reviews for [Seller] */}
                        <section className="border-t pt-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold">
                                    Reviews for {listing.user?.name ?? 'Seller'}
                                    {reviewCount > 0 && (
                                        <span className="ml-2 font-normal text-muted-foreground">
                                            {averageRating.toFixed(1)}★ (
                                            {reviewCount}{' '}
                                            {reviewCount === 1
                                                ? 'review'
                                                : 'reviews'}
                                            )
                                        </span>
                                    )}
                                </h2>
                                {reviewCount > 0 && (
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`size-5 ${
                                                    star <=
                                                    Math.round(averageRating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {canReview && (
                                <form
                                    onSubmit={submitReview}
                                    className="mt-6 rounded-lg border border-border/50 bg-muted/20 p-4 sm:p-6"
                                >
                                    <h3 className="mb-4 font-medium">
                                        {userReview
                                            ? 'Update your review'
                                            : 'Write a review'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Rating</Label>
                                            <InputError
                                                message={errors.rating}
                                            />
                                            <div className="mt-2 flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'rating',
                                                                star,
                                                            )
                                                        }
                                                        className="focus:outline-none"
                                                    >
                                                        <Star
                                                            className={`size-8 transition-colors ${
                                                                star <=
                                                                data.rating
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-muted-foreground hover:text-amber-400/70'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="comment">
                                                Comment (optional)
                                            </Label>
                                            <textarea
                                                id="comment"
                                                rows={4}
                                                value={data.comment}
                                                onChange={(e) =>
                                                    setData(
                                                        'comment',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Share your experience with this product..."
                                                className="mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            />
                                            <InputError
                                                message={errors.comment}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {userReview
                                                ? 'Update review'
                                                : 'Submit review'}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {!auth?.user && (
                                <p className="mt-6 text-sm text-muted-foreground">
                                    <Link
                                        href="/login"
                                        className="font-medium hover:underline"
                                    >
                                        Sign in
                                    </Link>{' '}
                                    to leave a review.
                                </p>
                            )}

                            <div className="mt-8 space-y-6">
                                {listing.reviews.length === 0 ? (
                                    <p className="text-muted-foreground">
                                        No reviews yet. Be the first to review!
                                    </p>
                                ) : (
                                    listing.reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="rounded-lg border border-border/50 p-4"
                                        >
                                            <div className="flex gap-4">
                                                <Avatar className="size-10 shrink-0">
                                                    <AvatarFallback className="text-xs font-medium">
                                                        {review.user
                                                            ? getInitials(
                                                                  review.user
                                                                      .name,
                                                              )
                                                            : '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="font-medium">
                                                            {review.user
                                                                ?.name ??
                                                                'Anonymous'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatRelativeTime(
                                                                review.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1 flex">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`size-4 ${
                                                                        star <=
                                                                        review.rating
                                                                            ? 'fill-amber-400 text-amber-400'
                                                                            : 'text-muted-foreground'
                                                                    }`}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                    {review.comment && (
                                                        <p className="mt-3 text-sm text-muted-foreground">
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        {listing.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Meet the seller + Buy/Add to cart (right side, Carousell-style) */}
                    <aside className="hidden md:sticky md:top-4 md:block md:self-start">
                        <div className="space-y-6 rounded-xl border border-border/50 bg-muted/20 p-6">
                            <h2 className="font-semibold">Meet the seller</h2>
                            {listing.user && (
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-14 shrink-0">
                                        <AvatarImage
                                            src={undefined}
                                            alt={listing.user.name}
                                        />
                                        <AvatarFallback className="text-base font-medium">
                                            {getInitials(listing.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">
                                            {listing.user.name}
                                        </p>
                                        {reviewCount > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                {averageRating.toFixed(1)}★ (
                                                {reviewCount}{' '}
                                                {reviewCount === 1
                                                    ? 'review'
                                                    : 'reviews'}
                                                )
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                {isOwner ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link
                                                href={`/listings/${listing.id}/edit`}
                                            >
                                                Edit listing
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            disabled={isTrending}
                                            onClick={() =>
                                                !isTrending &&
                                                router.post(
                                                    `/listings/${listing.id}/promote`,
                                                )
                                            }
                                        >
                                            <Sparkles className="mr-2 size-4" />
                                            {isTrending
                                                ? 'Promoted'
                                                : `Make it trend (${trendPriceLabel})`}
                                        </Button>
                                    </>
                                ) : (
                                    showBuyerActions &&
                                    (auth?.user
                                        ? sidebarBuyerActions
                                        : sidebarGuestActions)
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Mobile sticky footer - Buy first, Add to cart second. Shown when sidebar hidden (below md). */}
                {showBuyerActions && isBusinessSeller && auth?.user && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        {auth.cartListingIds?.includes(listing.id) ? (
                            <>
                                <Button
                                    className="min-h-12 flex-1 touch-manipulation"
                                    asChild
                                >
                                    <Link
                                        href="/cart"
                                        className="inline-flex items-center gap-2"
                                    >
                                        <ShoppingBag className="size-4" />
                                        Buy
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="min-h-12 flex-1 touch-manipulation"
                                    asChild
                                >
                                    <Link
                                        href="/cart"
                                        className="inline-flex items-center gap-2"
                                    >
                                        <ShoppingCart className="size-4" />
                                        In cart
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    className="min-h-12 flex-1 touch-manipulation"
                                    onClick={() =>
                                        router.post(
                                            `/listings/${listing.id}/cart`,
                                            { intent: 'buy' },
                                        )
                                    }
                                >
                                    <ShoppingBag className="mr-2 size-4" />
                                    Buy
                                </Button>
                                <Button
                                    variant="outline"
                                    className="min-h-12 flex-1 touch-manipulation"
                                    onClick={() =>
                                        router.post(
                                            `/listings/${listing.id}/cart`,
                                        )
                                    }
                                >
                                    <ShoppingCart className="mr-2 size-4" />
                                    Add to cart
                                </Button>
                            </>
                        )}
                    </div>
                )}
                {showBuyerActions && !isBusinessSeller && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        <Button
                            variant="outline"
                            className="min-h-12 flex-1 touch-manipulation"
                            onClick={() =>
                                router.post(`/listings/${listing.id}/chat`)
                            }
                        >
                            Make Offer
                        </Button>
                    </div>
                )}
                {isGuest && isBusinessSeller && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        <Button
                            className="min-h-12 flex-1 touch-manipulation"
                            asChild
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2"
                            >
                                <ShoppingBag className="size-4" />
                                Sign in to buy
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="min-h-12 flex-1 touch-manipulation"
                            asChild
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2"
                            >
                                <ShoppingCart className="size-4" />
                                Sign in to add to cart
                            </Link>
                        </Button>
                    </div>
                )}
                {isGuest && !isBusinessSeller && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        <Button
                            variant="outline"
                            className="min-h-12 flex-1 touch-manipulation"
                            asChild
                        >
                            <Link href="/login">Sign in to make offer</Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
