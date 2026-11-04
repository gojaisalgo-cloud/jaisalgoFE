import {siteOrigin} from '@/lib/site-url';
export const config={name:'JaisalGo',url:siteOrigin(),phone:'8824548099',phoneHref:'tel:+918824548099',whatsapp:(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'').replace(/\D/g,'')};
