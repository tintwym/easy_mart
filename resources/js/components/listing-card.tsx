import { Link, router, usePage } from '@inertiajs/react';
import { MoreVertical, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
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
};

type ListingCardProps = {
    listing: ListingCardListing;
};

export function ListingCard({ listing }: ListingCardProps) {
    const { auth } = usePage<SharedData>().props;
    const canEdit = auth?.user && listing.user_id === auth.user.id;

    return (
        <article className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-none transition-shadow hover:shadow-md dark:border-border/30 dark:bg-card">
            {/* User header */}
            <header className="flex items-center gap-3 px-4 pt-4">
                <Avatar className="size-9 shrink-0 overflow-hidden rounded-full">
                    <AvatarImage src={listing.user?.avatar} alt={listing.user?.name} />
                    <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        {listing.user ? getInitials(listing.user.name) : '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                        {listing.user?.name ?? 'Unknown'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {formatRelativeTime(listing.created_at)}
                    </p>
                </div>
                {canEdit && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0"
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
                )}
            </header>

            {/* Product image - clickable */}
            <Link href={`/listings/${listing.id}`} className="relative mt-3 block aspect-[4/3] w-full overflow-hidden bg-muted">
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
            </Link>

            {/* Product details */}
            <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
                <Link href={`/listings/${listing.id}`} className="block min-w-0">
                    <h3 className="line-clamp-2 font-semibold leading-tight text-foreground hover:underline">
                        {listing.title}
                    </h3>
                </Link>
                <Link href={`/listings/${listing.id}`} className="inline-block">
                    <p className="text-xl font-bold text-foreground hover:underline">
                        ${Number(listing.price).toFixed(2)}
                    </p>
                </Link>
                <p className="text-muted-foreground text-xs">
                    {CONDITION_LABELS[listing.condition] ?? listing.condition}
                </p>

                {/* Add to cart - only for business sellers */}
                {auth?.user &&
                    auth.user.id !== listing.user_id &&
                    listing.user?.seller_type === 'business' && (
                    <div className="mt-2 pt-1">
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
