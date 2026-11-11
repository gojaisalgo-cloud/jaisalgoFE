import {AnalyticsPreferences} from '@/components/analytics-provider';
import {Facebook,Instagram,Phone,Sun,Youtube} from 'lucide-react';
import Link from 'next/link';
import {config} from '@/lib/config';
import {footerGroups,footerSocialLinks,footerStories} from '@/data/footer';
import styles from './footer.module.css';

export function Footer(){
 const socials=footerSocialLinks();
 return <footer className={styles.footer}>
  <div className={`wrap ${styles.directory}`}>
   <div className={styles.intro}>
    <div><span className={styles.eyebrow}>JaisalGo travel directory</span><h2>A little local knowledge.<br/>A world of possibilities.</h2></div>
    <div className={styles.introAction}><p>Find your way through the Golden City,<br/>from sandstone lanes to desert nights.</p><Link href="/plan-your-trip" prefetch={false} className={styles.planButton}>Plan your Jaisalmer trip</Link></div>
   </div>
   <nav className={styles.groups} aria-label="Jaisalmer travel directory">
    {footerGroups.map(group=><section key={group.id} className={styles.group} aria-labelledby={`footer-${group.id}`}>
     <h3 id={`footer-${group.id}`}>{group.title}</h3>
     <div><ul className={styles.links}>{group.items.map(item=><li key={item.label}>{item.href?<Link href={item.href} prefetch={false}>{item.label}</Link>:<span className={styles.destination}>{item.label}</span>}</li>)}{group.id==='support'&&<li><a href={config.phoneHref}>Call {config.phone}</a></li>}{group.id==='support'&&config.whatsapp&&<li><a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer">Enquire on WhatsApp</a></li>}</ul>{group.note&&<p className={styles.groupNote}>{group.note}</p>}</div>
    </section>)}
   </nav>
  </div>
  <div className={styles.stories}><div className={`wrap ${styles.storyGrid}`}>{footerStories.map(story=><section key={story.title}><h2>{story.title}</h2><p>{story.text}</p></section>)}</div></div>
  <div className={styles.base}><div className={`wrap ${styles.baseInner}`}>
   <div className={styles.brandRow}>
    <div><Link href="/" className={styles.wordmark} aria-label="JaisalGo home" prefetch={false}><Sun size={34} strokeWidth={1.3} aria-hidden="true"/><span>Jaisal<span>Go</span></span></Link><p className={styles.tagline}>Rooted in Rajasthan. Inspired by the Desert.</p><p className={styles.greeting} lang="hi">पधारो म्हारे देस <span aria-hidden="true">•</span> खम्मा घणी सा</p></div>
    <div className={styles.brandContact}><span>Jaisalmer · Rajasthan · India</span><a href={config.phoneHref}><Phone size={16} aria-hidden="true"/>Booking assistance: {config.phone}</a>{socials.length>0&&<nav className={styles.socials} aria-label="JaisalGo social media">{socials.map(social=><a key={social.kind} href={social.href} target="_blank" rel="noreferrer" aria-label={`JaisalGo on ${social.label} (opens in a new tab)`}>{social.kind==='instagram'?<Instagram size={20} aria-hidden="true"/>:social.kind==='facebook'?<Facebook size={20} aria-hidden="true"/>:<Youtube size={20} aria-hidden="true"/>}</a>)}</nav>}</div>
   </div>
   <div className={styles.legalRow}><small>© {new Date().getFullYear()} JaisalGo. Made for the curious.</small><div className={styles.legalLinks}><Link href="/privacy-policy" prefetch={false}>Privacy</Link><Link href="/terms" prefetch={false}>Terms</Link><Link href="/cancellation-policy" prefetch={false}>Cancellation</Link><Link href="/admin" prefetch={false}>Travel desk</Link><AnalyticsPreferences/></div></div>
  </div></div>
 </footer>;
}
