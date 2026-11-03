import type {MetadataRoute} from 'next';
import {config} from '@/lib/config';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin','/book/','/reservations/','/my-bookings']},sitemap:config.url+'/sitemap.xml'}}
