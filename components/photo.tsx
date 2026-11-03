import Image from 'next/image';
import type {CSSProperties} from 'react';
import {imageAsset} from '@/data/images';
export function Photo({id,className='',priority=false,sizes='(max-width: 700px) 100vw, 50vw'}:{id:string;className?:string;priority?:boolean;sizes?:string}){const im=imageAsset(id);return <div className={`photo ${className}`} style={{'--image-focus':im.focus||'50% 50%','--image-focus-mobile':im.mobileFocus||im.focus||'50% 50%'} as CSSProperties}><Image src={im.src} alt={im.alt} fill sizes={sizes} preload={priority}/></div>}
