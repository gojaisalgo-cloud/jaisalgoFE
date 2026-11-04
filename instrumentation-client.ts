import {initializePosthog,posthogNavigationStart} from './lib/analytics/posthog-client';
// Consent check happens before the SDK is imported; missing configuration does nothing.
void initializePosthog();
export function onRouterTransitionStart(url:string){posthogNavigationStart(url)}
