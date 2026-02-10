import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import type { ListingCardListing } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// Set to true when carousel is ready to enable
const CAROUSEL_ENABLED = false;

type Props = {
    listings: ListingCardListing[];
};

export default function Dashboard({ listings = [] }: Props) {
    const { t } = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: dashboard().url,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />
            <div className="relative flex min-w-0 flex-1 flex-col gap-6 sm:gap-8">
                {/* First row: Carousel (disabled for now) */}
                {CAROUSEL_ENABLED && (
                    <section aria-label="Carousel" className="w-full">
                        <div className="grid gap-4 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-muted/30 dark:border-sidebar-border"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Product listing grid - Carousell style */}
                <section aria-label="Listings" className="w-full">
                    <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.length === 0 ? (
                            <p className="col-span-full text-center text-muted-foreground">
                                {t('dashboard.no_listings')}
                            </p>
                        ) : (
                            listings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* Add product FAB - safe area for mobile notches/home indicator */}
                <Button
                    size="icon"
                    className="fixed [right:max(1.5rem,env(safe-area-inset-right))] right-6 [bottom:max(1.5rem,env(safe-area-inset-bottom))] bottom-6 z-40 flex size-14 min-h-[56px] min-w-[56px] touch-manipulation rounded-full shadow-lg"
                    asChild
                >
                    <Link
                        href="/listings/create"
                        aria-label={t('dashboard.add_product')}
                    >
                        <Plus className="size-7" />
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}
