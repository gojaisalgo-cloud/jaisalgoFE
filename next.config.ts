import type {NextConfig} from 'next';
import path from 'node:path';
const nextConfig:NextConfig={turbopack:{root:path.resolve('.')},poweredByHeader:false,async headers(){return [
 {source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]},
 ...['/book/:path*','/reservations/:path*','/my-bookings','/admin/:path*','/api/:path*'].map(source=>({source,headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive, nosnippet'}]})),
]}};
export default nextConfig;
