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

export default function Orders() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <h1 className="sr-only">My Orders</h1>

            <SettingsLayout>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="mb-4 size-16 text-muted-foreground" />
                    <Heading
                        variant="small"
                        title="My Orders"
                        description="Your orders will appear here."
                    />
                    <p className="mt-2 text-muted-foreground text-sm">
                        You have no orders yet.
                    </p>
                    <Link
                        href={dashboard().url}
                        className="mt-6 inline-block font-medium text-primary hover:underline"
                    >
                        Browse listings
                    </Link>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
