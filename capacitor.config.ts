import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The native app loads your Laravel app from this URL (your deployed site).
 * Set CAPACITOR_SERVER_URL when building, or edit this file before cap sync.
 */
const serverUrl =
    process.env.CAPACITOR_SERVER_URL ||
    'https://easymart-db88033013be.herokuapp.com';

const config: CapacitorConfig = {
    appId: 'com.easymart.app',
    appName: 'EasyMart',
    webDir: 'public',
    server: {
        url: serverUrl,
        cleartext: true, // allow http for local/staging if needed
    },
};

export default config;
