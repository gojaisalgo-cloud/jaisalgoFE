import {DirectionalIcon} from '@/components/directional-control';
import Link from 'next/link';
export default function NotFound(){return <section className="wrap empty"><div className="overline">A SMALL DETOUR · 404</div><h1>This lane leads somewhere else.</h1><p>We couldn’t find that page. There’s still plenty of Jaisalmer to discover.</p><Link className="button" href="/">Back to the Golden City <DirectionalIcon direction="right"/></Link></section>}
