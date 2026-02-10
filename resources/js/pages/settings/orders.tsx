import { Head, Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'My Orders', href: '/settings/orders' },
];

type OrderItem = {
    id: string;
    listing_id: string;
    quantity: number;
    price: number;
    listing: { id: string; title: string; image_path: string | null; price: number };
};

type Order = {
    id: string;
    status: string;
    total: number;
    created_at: string;
    items: OrderItem[];
};

type Props = {
    orders?: Order[];
};

export default function Orders({ orders = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <h1 className="mb-6 text-xl font-bold">My Orders</h1>

            <SettingsLayout>
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Package className="mb-4 size-16 text-muted-foreground" />
                        <Heading
                            variant="small"
                            title="No orders yet"
                            description="Your orders will appear here after you complete a purchase."
                        />
                        <Link
                            href={dashboard().url}
                            className="mt-6 inline-block font-medium text-primary hover:underline"
                        >
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-lg border border-border bg-card p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="font-medium">
                                        Order #{order.id.slice(-8)}
                                    </span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                                        {order.status}
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                    {order.items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-3"
                                        >
                                            {item.listing.image_path ? (
                                                <img
                                                    src={item.listing.image_path}
                                                    alt=""
                                                    className="size-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-12 items-center justify-center rounded bg-muted text-muted-foreground text-xs">
                                                    —
                                                </div>
                                            )}
                                            <Link
                                                href={`/listings/${item.listing.id}`}
                                                className="min-w-0 flex-1 truncate text-sm hover:underline"
                                            >
                                                {item.listing.title}
                                            </Link>
                                            <span className="text-sm font-medium">
                                                ${Number(item.price).toFixed(2)} ×{' '}
                                                {item.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 border-t border-border pt-4 font-semibold">
                                    Total: ${Number(order.total).toFixed(2)}
                                </p>
                                <p className="mt-1 text-muted-foreground text-xs">
                                    {new Date(
                                        order.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </SettingsLayout>
        </AppLayout>
    );
}
