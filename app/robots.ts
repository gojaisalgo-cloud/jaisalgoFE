import type {MetadataRoute} from 'next';
import {config} from '@/lib/config';
// Let crawlers fetch noindex pages. Authentication and access keys protect private data.
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/']},sitemap:config.url+'/sitemap.xml'}}
