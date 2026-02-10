import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

type Category = {
    id: string;
    name: string;
    slug: string;
};

export default function Home({ categories = [] }: { categories?: Category[] }) {
    const { auth } = usePage<SharedData>().props;
    const { categoryName } = useTranslations();

    return (
        <>
            <Head title="Home" />
            <div className="flex min-h-screen flex-col p-6 lg:p-8">
                <header className="mb-6 flex w-full items-center justify-end gap-4">
                    {auth.user ? (
                        <Link href={dashboard()} className="text-sm underline">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={login()} className="text-sm underline">
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="text-sm underline"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </header>
                <main className="flex-1">
                    <h1 className="mb-4 text-2xl font-semibold">
                        Furniture categories
                    </h1>
                    {categories.length > 0 ? (
                        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="block rounded-lg border p-4 hover:bg-muted"
                                    >
                                        {categoryName(category)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">
                            No categories yet.
                        </p>
                    )}
                </main>
            </div>
        </>
    );
}
