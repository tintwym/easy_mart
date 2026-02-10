import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    LogOut,
    Menu,
    MessageCircle,
    Search,
    Settings,
    ShoppingCart,
} from 'lucide-react';
import { ChevronDown, Layers, MapPin } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
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
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useSortedLocations } from '@/hooks/use-sorted-locations';
import { cn, toUrl } from '@/lib/utils';
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

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<SharedData>();
    const [sidebarLogoutOpen, setSidebarLogoutOpen] = useState(false);
    const {
        auth,
        categories = [],
        locations = [],
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
    const { sortedLocations, getDistanceKm } = useSortedLocations(locations);
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();
    return (
        <>
            <div
                className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-background pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
                style={{
                    paddingTop: 'env(safe-area-inset-top)',
                    paddingBottom: 0,
                }}
            >
                <div className="mx-auto flex h-14 min-h-[3.5rem] items-center px-3 sm:px-4 md:max-w-7xl">
                    {/* Mobile Menu - hidden from tablet (md) up */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-1 flex h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation sm:mr-2 sm:h-10 sm:w-10"
                                    aria-label="Open menu"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-[min(20rem,85vw)] flex-col items-stretch justify-between bg-sidebar pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)]"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
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
                                                Chat
                                            </Link>
                                        )}
                                        {/* Categories dropdown */}
                                        {categories.length > 0 && (
                                            <Collapsible
                                                defaultOpen={false}
                                                className="group/cat"
                                            >
                                                <CollapsibleTrigger className="flex min-h-[44px] w-full touch-manipulation items-center justify-between rounded-md px-2 py-2 font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                                    <span className="flex items-center gap-2">
                                                        <Layers className="h-4 w-4" />
                                                        Categories
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/cat:rotate-180" />
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <ul className="ml-2 flex flex-col gap-0.5 border-l border-sidebar-border py-2 pl-4">
                                                        {categories.map(
                                                            (cat) => (
                                                                <li
                                                                    key={cat.id}
                                                                >
                                                                    <Link
                                                                        href={`/categories/${cat.slug}`}
                                                                        className="block min-h-[44px] py-2.5 font-medium hover:underline active:opacity-80"
                                                                    >
                                                                        {
                                                                            cat.name
                                                                        }
                                                                    </Link>
                                                                </li>
                                                            ),
                                                        )}
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

                                    {/* Profile / Auth at bottom of sidebar */}
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
                                                            src={
                                                                auth.user.avatar
                                                            }
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
                                                    Settings
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="flex min-h-[44px] w-full touch-manipulation items-center gap-2 rounded-md px-2 py-2 text-left font-medium hover:bg-sidebar-accent"
                                                    onClick={() =>
                                                        setSidebarLogoutOpen(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Log out
                                                </button>
                                                <LogoutConfirmDialog
                                                    open={sidebarLogoutOpen}
                                                    onOpenChange={
                                                        setSidebarLogoutOpen
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={login()}
                                                    className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                                >
                                                    Log in
                                                </Link>
                                                <Link
                                                    href={register()}
                                                    className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                                >
                                                    Register
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation - full navbar from tablet (md) up */}
                    <div className="ml-4 hidden h-full items-center space-x-4 md:flex md:space-x-6">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {categories.length > 0 && (
                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <NavigationMenuTrigger
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                'h-9 cursor-pointer gap-1 px-3',
                                            )}
                                        >
                                            <Layers className="mr-1.5 h-4 w-4" />
                                            Categories
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[220px] gap-1 p-2">
                                                {categories.map((cat) => (
                                                    <li key={cat.id}>
                                                        <NavigationMenuLink
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/categories/${cat.slug}`}
                                                                className="block rounded-md px-3 py-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
                                                            >
                                                                {cat.name}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                )}
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            {auth?.user && (
                                <>
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="group flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer touch-manipulation sm:h-9 sm:w-9"
                                                    aria-label="Chat"
                                                    asChild
                                                >
                                                    <Link href="/chat">
                                                        <MessageCircle className="!size-5 opacity-80 group-hover:opacity-100" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Chat</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="group relative flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer touch-manipulation sm:h-9 sm:w-9"
                                                    aria-label="Cart"
                                                    asChild
                                                >
                                                    <Link href="/cart">
                                                        <ShoppingCart className="!size-5 opacity-80 group-hover:opacity-100" />
                                                        {(auth.cartCount ?? 0) >
                                                            0 && (
                                                            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                                                {(auth.cartCount ??
                                                                    0) > 99
                                                                    ? '99+'
                                                                    : auth.cartCount}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Cart</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </>
                            )}
                            <div className="ml-1 hidden gap-1 md:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider
                                        key={item.title}
                                        delayDuration={0}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.icon && (
                                                        <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                    )}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        {/* Profile / Auth - hidden on mobile (in sidebar instead), visible from tablet */}
                        <div className="hidden md:block">
                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex size-11 min-h-[44px] min-w-[44px] touch-manipulation rounded-full p-1 sm:size-10"
                                            aria-label="User menu"
                                        >
                                            <Avatar className="size-8 overflow-hidden rounded-full sm:size-8">
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
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="min-h-[44px] touch-manipulation sm:min-h-0"
                                        asChild
                                    >
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="min-h-[44px] touch-manipulation sm:min-h-0"
                                        asChild
                                    >
                                        <Link href={register()}>Register</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Carousell-style search bar */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const q =
                            (
                                form.elements.namedItem(
                                    'q',
                                ) as HTMLInputElement | null
                            )?.value?.trim() ?? '';
                        const searchParams = new URLSearchParams();
                        if (q) searchParams.set('q', q);
                        if (currentLocation)
                            searchParams.set('location', currentLocation);
                        const queryString = searchParams.toString();
                        const url = queryString ? `/?${queryString}` : '/';
                        router.get(url, {}, { preserveState: false });
                    }}
                    className="flex w-full flex-wrap items-center gap-2 border-t border-sidebar-border/60 bg-muted/30 px-3 py-3 sm:px-4 md:mx-auto md:max-w-7xl"
                >
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 sm:min-w-[200px]">
                        <Search className="size-5 shrink-0 text-muted-foreground" />
                        <input
                            type="search"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="Search for an item"
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            aria-label="Search"
                        />
                    </div>
                    {sortedLocations.length > 0 ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-9 max-w-[11rem] min-w-[11rem] shrink-0 items-center gap-2 overflow-hidden rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    <MapPin className="size-4 shrink-0" />
                                    <span className="min-w-0 flex-1 truncate">
                                        {currentLocation ??
                                            `All of ${regionLabel}`}
                                    </span>
                                    <ChevronDown className="size-4 shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[220px] p-1"
                            >
                                <Link
                                    href={dashboard().url}
                                    className="block rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    All of {regionLabel}
                                </Link>
                                {sortedLocations.map((loc) => {
                                    const km = getDistanceKm(loc);
                                    return (
                                        <Link
                                            key={loc.name}
                                            href={
                                                dashboard({
                                                    query: {
                                                        location: loc.name,
                                                    },
                                                }).url
                                            }
                                            className="block rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {loc.name}
                                            {km != null && (
                                                <span className="ml-1.5 text-muted-foreground">
                                                    ·{' '}
                                                    {km < 1
                                                        ? `${Math.round(km * 1000)} m`
                                                        : `${km.toFixed(1)} km`}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex h-9 max-w-[11rem] min-w-[11rem] shrink-0 items-center gap-2 overflow-hidden rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                            <MapPin className="size-4 shrink-0" />
                            <span className="min-w-0 truncate">
                                All of {regionLabel}
                            </span>
                        </div>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        className="shrink-0 bg-green-600 hover:bg-green-700"
                    >
                        Search
                    </Button>
                </form>
            </div>
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
