import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    apkAvailable: boolean;
    apkUrl: string | null;
};

export default function DownloadPage({ apkAvailable, apkUrl }: Props) {
    const { t } = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common.back'), href: '/' },
        { title: t('download.title'), href: '/download' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('download.title')} />
            <div className="mx-auto max-w-xl space-y-8 py-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <Smartphone className="size-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {t('download.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('download.description')}
                    </p>
                </div>

                {apkAvailable && apkUrl ? (
                    <div className="space-y-6">
                        <a
                            href={apkUrl}
                            download="easymart.apk"
                            className="flex w-full justify-center"
                        >
                            <Button
                                size="lg"
                                className="min-h-12 w-full gap-2 sm:w-auto sm:min-w-[240px]"
                            >
                                <Download className="size-5" />
                                {t('download.button')}
                            </Button>
                        </a>

                        <section className="rounded-lg border bg-muted/30 p-4 text-left">
                            <h2 className="mb-2 font-medium">
                                {t('download.instructions_title')}
                            </h2>
                            <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                <li>{t('download.step1')}</li>
                                <li>{t('download.step2')}</li>
                                <li>{t('download.step3')}</li>
                            </ol>
                        </section>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-muted-foreground">
                        <p>{t('download.coming_soon')}</p>
                    </div>
                )}

                <div className="flex justify-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            href={dashboard().url}
                            className="inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="size-4" />
                            {t('common.back')}
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
