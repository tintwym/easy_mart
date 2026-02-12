import { Link, usePage, router } from '@inertiajs/react';
import {
    LogOut,
    Menu,
    MessageCircle,
    Search,
    Settings,
    ShoppingCart,
} from 'lucide-react';
import { ChevronDown, Layers, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslations } from '@/hooks/use-translations';
import { toUrl } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem, NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [];

const rightNavItems: NavItem[] = [];

const LOCALE_LABELS: Record<string, string> = {
    en: 'EN',
    zh: '中文',
    my: 'မြန်မာ',
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<SharedData>();
    const { t, categoryName, locale } = useTranslations();
    const [sidebarLogoutOpen, setSidebarLogoutOpen] = useState(false);
    const {
        auth,
        categories = [],
        regionLabel: regionLabelProp = 'All',
    } = page.props;
    const regionLabel = String(regionLabelProp ?? 'All');
    const searchQuery =
        (page.props as { searchQuery?: string }).searchQuery ?? '';
    const currentLocation = (() => {
        try {
            return (
                new URL(page.url, window?.location?.origin).searchParams.get(
                    'location',
                ) ?? null
            );
        } catch {
            return null;
        }
    })();
    const getInitials = useInitials();
    const mobileNavCleanup = useMobileNavigation();
    const [headerLogoutOpen, setHeaderLogoutOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const searchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q =
            (
                form.elements.namedItem('q') as HTMLInputElement | null
            )?.value?.trim() ?? '';
        const searchParams = new URLSearchParams();
        if (q) searchParams.set('q', q);
        if (currentLocation) searchParams.set('location', currentLocation);
        const queryString = searchParams.toString();
        router.get(
            queryString ? `/?${queryString}` : '/',
            {},
            { preserveState: false },
        );
    };

    return (
        <>
            {/* Amazon-style two-row navbar: dark top bar + category row */}
            <header
                className="sticky top-0 z-50 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                {/* Row 1: Logo, delivery, search, account, cart */}
                <div className="flex min-h-12 flex-wrap items-center gap-2 bg-nav-top px-3 py-2 text-white sm:px-4 md:gap-3">
                    {/* Mobile Menu trigger - hidden from tablet (md) up */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mr-1 flex h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation text-white hover:bg-white/10 hover:text-white sm:mr-2 sm:h-10 sm:w-10"
                            aria-label={t('nav.open_menu')}
                            onClick={() => setSheetOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2 text-white hover:text-white"
                    >
                        <AppLogo />
                    </Link>

                    {/* Delivery / Location - Amazon style (hidden on small mobile) */}
                    <div className="hidden flex-col sm:flex md:ml-1">
                        <span className="text-[10px] text-gray-300">
                            Delivering to {regionLabel}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-medium text-white">
                            <MapPin className="size-3.5" />
                            Update location
                        </span>
                    </div>

                    {/* Center: Search bar with All dropdown + input + button */}
                    <form
                        onSubmit={searchFormSubmit}
                        className="flex min-w-0 flex-1 items-stretch md:max-w-xl lg:max-w-2xl"
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-9 shrink-0 items-center gap-0.5 rounded-l-md border-0 bg-gray-200 px-2 text-sm text-gray-700 hover:bg-gray-300 md:px-3"
                                >
                                    All
                                    <ChevronDown className="size-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="max-h-[70vh] overflow-y-auto"
                            >
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/categories/${cat.slug}`}
                                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                    >
                                        {categoryName(cat)}
                                    </Link>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <input
                            type="search"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder={t('search.placeholder')}
                            className="min-w-0 flex-1 border-0 px-3 py-2 text-sm outline-none"
                            aria-label={t('search.aria')}
                        />
                        <button
                            type="submit"
                            className="flex h-9 w-10 shrink-0 items-center justify-center rounded-r-md bg-amber-400 text-gray-900 hover:bg-amber-500 md:w-12"
                            aria-label={t('search.button')}
                        >
                            <Search className="size-5" />
                        </button>
                    </form>

                    {/* Right: Language | Account & Lists | Returns & Orders | Cart (Amazon order) */}
                    <div className="flex flex-1 flex-wrap items-stretch justify-end gap-1 md:gap-2">
                        {/* Language: locale label + dropdown (e.g. EN ▼) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="hidden items-center gap-0.5 rounded px-2 py-1.5 text-white hover:bg-white/10 md:flex"
                                    aria-label="Language"
                                >
                                    <span className="text-xs font-semibold">
                                        {LOCALE_LABELS[locale] ??
                                            locale.toUpperCase()}
                                    </span>
                                    <ChevronDown className="size-3" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {[
                                    { code: 'en', label: 'English' },
                                    { code: 'zh', label: '中文' },
                                    { code: 'my', label: 'မြန်မာ' },
                                ].map(({ code, label }) => (
                                    <button
                                        key={code}
                                        type="button"
                                        className={
                                            locale === code
                                                ? 'flex w-full cursor-pointer items-center rounded-sm bg-accent px-2 py-1.5 text-sm'
                                                : 'flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent'
                                        }
                                        onClick={() =>
                                            router.post(
                                                '/locale',
                                                { locale: code },
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        {label}
                                    </button>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Account & Lists: two-line block with dropdown */}
                        <div className="hidden md:block [&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:hover:text-white">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex flex-col items-start rounded px-2 py-1.5 text-left hover:bg-white/10"
                                        aria-label={t('nav.account_and_lists')}
                                    >
                                        <span className="text-[10px] text-gray-300">
                                            {auth?.user
                                                ? `Hello, ${auth.user.name.split(/\s+/)[0] ?? 'User'}`
                                                : t('nav.hello_sign_in')}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs font-semibold">
                                            {t('nav.account_and_lists')}
                                            <ChevronDown className="size-3" />
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                >
                                    {auth?.user ? (
                                        <UserMenuContent
                                            user={auth.user}
                                            onOpenLogout={() =>
                                                setHeaderLogoutOpen(true)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                            >
                                                {t('nav.log_in')}
                                            </Link>
                                            <Link
                                                href={register()}
                                                className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                            >
                                                {t('nav.register')}
                                            </Link>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <LogoutConfirmDialog
                                open={headerLogoutOpen}
                                onOpenChange={setHeaderLogoutOpen}
                                onLogout={mobileNavCleanup}
                            />
                        </div>
                        {/* Returns & Orders: two-line link */}
                        <Link
                            href={
                                auth?.user
                                    ? '/settings/orders'
                                    : dashboard().url
                            }
                            className="hidden flex-col items-start rounded px-2 py-1.5 text-left text-white hover:bg-white/10 md:flex"
                        >
                            <span className="text-[10px] text-gray-300">
                                {t('nav.returns')}
                            </span>
                            <span className="text-xs font-semibold">
                                {t('nav.and_orders')}
                            </span>
                        </Link>
                        {/* Cart: icon + orange count + "Cart" label */}
                        <Link
                            href="/cart"
                            className="flex flex-col items-center rounded px-2 py-1.5 text-white hover:bg-white/10"
                            aria-label={t('nav.cart')}
                        >
                            <span className="relative flex items-center justify-center">
                                <ShoppingCart className="size-8" />
                                <span className="absolute -top-0.5 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-medium text-gray-900">
                                    {(auth?.cartCount ?? 0) > 99
                                        ? '99+'
                                        : (auth?.cartCount ?? 0)}
                                </span>
                            </span>
                            <span className="text-xs font-semibold">
                                {t('nav.cart')}
                            </span>
                        </Link>
                        {/* Mobile: Chat when logged in */}
                        {auth?.user && (
                            <Link
                                href="/chat"
                                className="flex items-center justify-center rounded p-2 text-white hover:bg-white/10 md:hidden"
                                aria-label={t('nav.chat')}
                            >
                                <MessageCircle className="size-6" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Row 2: Hamburger + All, category links, promo (Amazon style) */}
                <div className="flex flex-wrap items-center gap-2 bg-nav-row2 px-3 py-1.5 text-sm text-white sm:px-4">
                    <button
                        type="button"
                        className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10"
                        aria-label={t('nav.open_menu')}
                        onClick={() => setSheetOpen(true)}
                    >
                        <Menu className="size-4" />
                        <span>All</span>
                    </button>
                    <nav className="flex flex-wrap items-center gap-1">
                        {categories.slice(0, 10).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="rounded px-2 py-1 hover:bg-white/10"
                            >
                                {categoryName(cat)}
                            </Link>
                        ))}
                    </nav>
                    <span className="ml-auto font-medium">
                        {t('nav.shop_essentials')}
                    </span>
                </div>

                {/* Shared sidebar (opened by row 1 mobile hamburger or row 2 "All") */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent
                        side="left"
                        className="flex h-full w-[min(20rem,85vw)] flex-col items-stretch justify-between bg-sidebar pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)]"
                    >
                        <SheetTitle className="sr-only">
                            {t('nav.navigation_menu')}
                        </SheetTitle>
                        <SheetHeader className="flex justify-start text-left">
                            <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                        </SheetHeader>
                        <div className="flex h-full flex-1 flex-col p-4">
                            <div className="flex flex-1 flex-col gap-1 text-sm">
                                {auth?.user && (
                                    <Link
                                        href="/chat"
                                        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        {t('nav.chat')}
                                    </Link>
                                )}
                                {categories.length > 0 && (
                                    <Collapsible
                                        defaultOpen={false}
                                        className="group/cat"
                                    >
                                        <CollapsibleTrigger className="flex min-h-[44px] w-full touch-manipulation items-center justify-between rounded-md px-2 py-2 font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                            <span className="flex items-center gap-2">
                                                <Layers className="h-4 w-4" />
                                                {t('nav.categories')}
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/cat:rotate-180" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <ul className="ml-2 flex flex-col gap-0.5 border-l border-sidebar-border py-2 pl-4">
                                                {categories.map((cat) => (
                                                    <li key={cat.id}>
                                                        <Link
                                                            href={`/categories/${cat.slug}`}
                                                            className="block min-h-[44px] py-2.5 font-medium hover:underline active:opacity-80"
                                                        >
                                                            {categoryName(cat)}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                                {mainNavItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                    >
                                        {item.icon && (
                                            <item.icon className="h-5 w-5" />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="py-2">
                                <LanguageSwitcher />
                            </div>
                            <div className="mt-auto flex flex-col gap-2 border-t border-sidebar-border pt-4">
                                {rightNavItems.map((item) => (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium"
                                    >
                                        {item.icon && (
                                            <item.icon className="h-5 w-5" />
                                        )}
                                        <span>{item.title}</span>
                                    </a>
                                ))}
                                {auth?.user ? (
                                    <>
                                        <div className="flex min-h-[44px] items-center gap-3 rounded-md px-2 py-2">
                                            <Avatar className="size-9 shrink-0 overflow-hidden rounded-full">
                                                <AvatarImage
                                                    src={auth.user.avatar}
                                                    alt={auth.user.name}
                                                />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(
                                                        auth.user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate text-sm font-medium">
                                                {auth.user.name}
                                            </span>
                                        </div>
                                        <Link
                                            href={edit()}
                                            className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                        >
                                            <Settings className="h-4 w-4" />
                                            {t('nav.settings')}
                                        </Link>
                                        <button
                                            type="button"
                                            className="flex min-h-[44px] w-full touch-manipulation items-center gap-2 rounded-md px-2 py-2 text-left font-medium hover:bg-sidebar-accent"
                                            onClick={() =>
                                                setSidebarLogoutOpen(true)
                                            }
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('nav.log_out')}
                                        </button>
                                        <LogoutConfirmDialog
                                            open={sidebarLogoutOpen}
                                            onOpenChange={setSidebarLogoutOpen}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                        >
                                            {t('nav.log_in')}
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                        >
                                            {t('nav.register')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
                    <div className="mx-auto flex min-h-11 w-full max-w-7xl items-center justify-start px-3 py-2 text-neutral-500 sm:px-4 sm:py-2.5">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
