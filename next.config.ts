import type {NextConfig} from 'next';
import path from 'node:path';
import {seoAliases} from './data/seo-aliases';
const nextConfig:NextConfig={distDir:process.env.NEXT_DIST_DIR||'.next',env:{NEXT_PUBLIC_GA4_ENABLED:process.env.ANALYTICS_ENABLED==='false'?'false':process.env.NEXT_PUBLIC_GA4_ENABLED||'false',NEXT_PUBLIC_POSTHOG_ENABLED:process.env.ANALYTICS_ENABLED==='false'?'false':process.env.NEXT_PUBLIC_POSTHOG_ENABLED||'true',NEXT_PUBLIC_POSTHOG_ENVIRONMENT:process.env.NEXT_PUBLIC_POSTHOG_ENVIRONMENT||process.env.VERCEL_ENV||'development'},turbopack:{root:path.resolve('.')},poweredByHeader:false,images:{formats:['image/avif','image/webp']},async redirects(){return Object.entries(seoAliases).map(([source,destination])=>({source,destination,statusCode:301}))},serverExternalPackages:['pdfkit'],outputFileTracingIncludes:{'/api/booking/ticket':['./public/fonts/manrope-pdf.ttf']},async headers(){return [
 {source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]},
 ...['/book/:path*','/reservations/:path*','/my-bookings','/verify/:path*','/admin/:path*','/api/:path*'].map(source=>({source,headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive, nosnippet'}]})),
]}};
export default nextConfig;
