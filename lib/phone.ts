import {z} from 'zod';
export function normalizePhone(value:string){const raw=value.trim().replace(/[ ()-]/g,'');return /^\d{10}$/.test(raw)?'+91'+raw:raw.startsWith('00')?'+'+raw.slice(2):raw}
export const phoneSchema=z.string().trim().max(24).transform(normalizePhone).refine(value=>/^\+[1-9]\d{7,14}$/.test(value),'Enter a 10-digit Indian mobile number or include your country code.');
