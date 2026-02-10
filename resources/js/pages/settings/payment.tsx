import { Head, usePage } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment method',
        href: '/settings/payment',
    },
];

export default function PaymentSettings() {
    const { props } = usePage<SharedData & { region?: string }>();
    const region = props.region ?? '';
    const isSingapore = region === 'SG';
    const paymentMethod = isSingapore ? 'Stripe' : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment method" />

            <h1 className="sr-only">Payment method</h1>

            <SettingsLayout>
                <Heading
                    variant="small"
                    title="Payment method"
                    description="Manage how you pay and get paid"
                />

                <div className="rounded-lg border border-border bg-card p-4">
                    {paymentMethod ? (
                        <div className="flex items-center gap-3">
                            <CreditCard className="size-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{paymentMethod}</p>
                                <p className="text-sm text-muted-foreground">
                                    {isSingapore
                                        ? 'Payments for Singapore are processed securely via Stripe.'
                                        : ''}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Payment method is not configured for your region
                            yet.
                        </p>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
