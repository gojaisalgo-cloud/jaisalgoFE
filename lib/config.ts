import {siteOrigin} from '@/lib/site-url';
export const config={name:'JaisalGo',url:siteOrigin(),whatsapp:(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'').replace(/\D/g,'')};
