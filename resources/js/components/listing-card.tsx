import { Link, router, usePage } from '@inertiajs/react';
import { MoreVertical, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SharedData } from '@/types';

const CONDITION_LABELS: Record<string, string> = {
    new: 'New',
    like_new: 'Lightly used',
    good: 'Good',
    fair: 'Fair',
};

function formatRelativeTime(dateString: string | undefined): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
}

export type ListingCardListing = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    condition: string;
    price: number;
    image_path: string | null;
    created_at?: string;
    category?: { id: string; name: string; slug: string } | null;
    user?: { id: string; name: string; avatar?: string; seller_type?: string } | null;
    trending_until?: string | null;
};

type ListingCardProps = {
    listing: ListingCardListing;
};

export function ListingCard({ listing }: ListingCardProps) {
    const { auth } = usePage<SharedData>().props;
    const canEdit = auth?.user && listing.user_id === auth.user.id;
    const isTrending =
        listing.trending_until &&
        new Date(listing.trending_until) > new Date();

    return (
        <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-none transition-shadow hover:shadow-md dark:border-border/30 dark:bg-card">
            {/* Product image - Carousell style with overlay */}
            <Link href={`/listings/${listing.id}`} className="relative block aspect-square w-full overflow-hidden bg-muted">
                {listing.image_path ? (
                    <img
                        src={listing.image_path}
                        alt=""
                        className="size-full object-cover transition-opacity hover:opacity-95"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                        No image
                    </div>
                )}
                {/* Overlay: time (top-left), trending badge, ellipsis (top-right) */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                    <div className="flex flex-col gap-1">
                        <span className="rounded bg-black/40 px-1.5 py-0.5 text-white text-xs">
                            {formatRelativeTime(listing.created_at)}
                        </span>
                        {isTrending && (
                            <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground text-xs font-medium">
                                Trending
                            </span>
                        )}
                    </div>
                    {canEdit && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
                                        aria-label="Listing options"
                                    >
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/listings/${listing.id}/edit`}>
                                        <Pencil className="mr-2 size-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (window.confirm('Delete this listing?')) {
                                            router.delete(`/listings/${listing.id}`);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    )}
                </div>
            </Link>

            {/* Product details - compact Carousell style */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 pb-3 pt-2">
                <Link href={`/listings/${listing.id}`} className="block min-w-0">
                    <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground hover:underline">
                        {listing.title}
                    </h3>
                </Link>
                <Link href={`/listings/${listing.id}`} className="inline-block">
                    <p className="text-base font-bold text-foreground hover:underline sm:text-lg">
                        ${Number(listing.price).toFixed(2)}
                    </p>
                </Link>
                <p className="text-muted-foreground text-xs">
                    {CONDITION_LABELS[listing.condition] ?? listing.condition} · {listing.user?.name ?? 'Unknown'}
                </p>

                {/* Add to cart - only for business sellers */}
                {auth?.user &&
                    auth.user.id !== listing.user_id &&
                    listing.user?.seller_type === 'business' && (
                    <div className="mt-1.5 pt-1">
                        {auth.cartListingIds?.includes(listing.id) ? (
                            <Link
                                href="/cart"
                                className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
                            >
                                <ShoppingCart className="size-4" />
                                In cart
                            </Link>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-1 h-8 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                    router.post(
                                        `/listings/${listing.id}/cart`,
                                    )
                                }
                                aria-label="Add to cart"
                            >
                                <ShoppingCart className="mr-1 size-4" />
                                Add to cart
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
