export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedCategory = {
    id: string;
    name: string;
    slug: string;
};

export type SharedLocation = {
    name: string;
    lat: number | null;
    lng: number | null;
};

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    categories: SharedCategory[];
    locations: SharedLocation[];
    [key: string]: unknown;
};
