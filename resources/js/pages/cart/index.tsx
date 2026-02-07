import { Head, Link, router } from '@inertiajs/react';
import { Footprints, Shirt, ShoppingCart, Smartphone, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
type CartItem = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        price: number;
        user: { id: string; name: string };
    };
};

type Props = {
    items: CartItem[];
};

export default function CartIndex({ items }: Props) {
    const total = items.reduce(
        (sum, item) => sum + Number(item.listing.price),
        0,
    );

    const removeFromCart = (listingId: string) => {
        router.delete(`/listings/${listingId}/cart`);
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Cart" />
            <div className="mx-auto max-w-2xl px-0 sm:px-2">
                <h1 className="mb-6 text-xl font-bold">Cart</h1>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-8">
                            <ShoppingCart className="size-24 text-blue-500" strokeWidth={1.5} />
                            <Smartphone className="absolute -right-2 -top-4 size-8 text-muted-foreground/80" />
                            <Shirt className="absolute -left-6 top-2 size-7 text-red-400/90" />
                            <Footprints className="absolute -bottom-2 -left-4 size-6 text-green-500/80" />
                            <span className="absolute -right-6 top-1/2 size-2 -translate-y-1/2 rounded-full bg-cyan-400/60" />
                            <span className="absolute -left-2 top-4 size-1.5 rounded-full bg-cyan-400/50" />
                        </div>
                        <p className="text-foreground text-sm">
                            Add listings to your Cart to pay for them
                        </p>
                        <p className="text-foreground text-sm">
                            at one go and save on delivery!
                        </p>
                        <Link
                            href={dashboard().url}
                            className="mt-6 inline-block font-medium text-primary hover:underline"
                        >
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 rounded-lg border border-border/50 p-4"
                            >
                                <Link
                                    href={`/listings/${item.listing.id}`}
                                    className="shrink-0 overflow-hidden rounded-lg bg-muted"
                                >
                                    {item.listing.image_path ? (
                                        <img
                                            src={item.listing.image_path}
                                            alt=""
                                            className="size-20 object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-20 items-center justify-center text-muted-foreground text-xs">
                                            —
                                        </div>
                                    )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/listings/${item.listing.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {item.listing.title}
                                    </Link>
                                    <p className="text-muted-foreground text-sm">
                                        $
                                        {Number(
                                            item.listing.price,
                                        ).toFixed(2)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                        removeFromCart(item.listing.id)
                                    }
                                    aria-label="Remove from cart"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                            <p className="font-semibold">Total</p>
                            <p className="font-semibold">
                                ${total.toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
