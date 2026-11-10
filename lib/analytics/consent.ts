/** Versioned, purpose-specific choices. Older consent cannot silently enable new purposes. */
export const analyticsConsentVersion='2026-11-10-v2';
export const analyticsPreferencesKey='jaisalgo_analytics_preferences';
export type AnalyticsPreferences={version:typeof analyticsConsentVersion;analytics:boolean;replay:boolean;location:boolean;at:number};
export function parseAnalyticsPreferences(raw:string|null):AnalyticsPreferences|undefined{
 try{const p=JSON.parse(raw||'null');if(p?.version===analyticsConsentVersion&&typeof p.analytics==='boolean'&&typeof p.replay==='boolean'&&typeof p.location==='boolean'&&Number.isFinite(p.at))return {version:analyticsConsentVersion,analytics:p.analytics,replay:p.analytics&&p.replay,location:p.analytics&&p.location,at:p.at}}catch{}
}
export function analyticsPreferences(){try{return parseAnalyticsPreferences(localStorage.getItem(analyticsPreferencesKey))}catch{return}}
export function analyticsAllowed(){try{return analyticsPreferences()?.analytics===true&&localStorage.getItem('jaisalgo_measurement')==='allow'&&!navigator.doNotTrack?.includes('1')&&!(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl}catch{return false}}
export const replayAllowed=()=>analyticsAllowed()&&analyticsPreferences()?.replay===true;
export const locationAllowed=()=>analyticsAllowed()&&analyticsPreferences()?.location===true;
