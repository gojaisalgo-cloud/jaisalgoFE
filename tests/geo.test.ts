import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collections} from '../data/editorial';
import {attractionSchema,webPageSchema} from '../lib/geo';
import {aiReferral,referralSource} from '../lib/analytics/referrals';
import {aiReferralReport} from '../lib/analytics/ai-referrals';
import {contextSchema,type AnalyticsEvent} from '../lib/analytics/schema';
import {marketingTouch,trafficSource} from '../lib/analytics/posthog-schema';
import {readFileSync} from 'node:fs';
import publicPaths from '../data/analytics-public-paths.json';
test('every editorial guide has a substantive direct answer and comparisons remain rectangular',()=>{
 const seen=new Set<string>();for(const [collection,items] of Object.entries(collections))for(const item of items){assert.ok(item.answer&&item.answer.question.endsWith('?')&&item.answer.text.length>120,collection+'/'+item.slug);assert.ok(!seen.has(item.answer.text));seen.add(item.answer.text);if(item.comparison)assert.ok(item.comparison.rows.every(row=>row.length===item.comparison!.headers.length));for(const f of item.faqs||[])assert.ok(f.answer.length>70)}
});
test('attraction and page entities have canonical stable references without invented business facts',()=>{
 for(const item of collections.places){const node=attractionSchema(item)!;assert.equal(node['@type'],'TouristAttraction');assert.ok(node.name&&!/[?]/.test(node.name));assert.ok(String(node['@id']).endsWith('#attraction'));assert.equal(node.containedInPlace['@id'],'https://www.jaisalgo.com/#jaisalmer');assert.equal(node.containedInPlace['@type'],'TouristDestination');for(const field of ['offers','aggregateRating','review','address','openingHours','geo'])assert.ok(!(field in node))}
 const page=webPageSchema('A guide','Planning information','/travel-guide/how-to-reach');assert.equal(page['@id'],'https://www.jaisalgo.com/travel-guide/how-to-reach#webpage');assert.equal(page.isPartOf['@id'],'https://www.jaisalgo.com/#website');
});
test('AI attribution accepts exact approved hosts and discards private referring paths and spoofed domains',()=>{
 assert.equal(aiReferral('https://chatgpt.com/c/private?prompt=private'),'chatgpt');assert.equal(referralSource('https://gemini.google.com/app/private','https://www.jaisalgo.com'),'ai');assert.equal(referralSource('https://www.google.com/search?q=private','https://www.jaisalgo.com'),'search');
 for(const ref of ['https://chatgpt.com.attacker.example','https://attacker.example/?from=chatgpt.com','https://user:secret@chatgpt.com','http://chatgpt.com'])assert.equal(aiReferral(ref),undefined);
 const touch=marketingTouch('https://www.jaisalgo.com/travel-guide/how-to-reach','https://chatgpt.com/c/private?prompt=secret',{campaigns:'',content:'',terms:''});assert.equal(touch.referrer_origin,'https://chatgpt.com');assert.equal(trafficSource(touch),'ai');assert.ok(!JSON.stringify(touch).includes('private'));assert.equal(contextSchema.shape.source.safeParse('ai').success,true);
});
test('AI cohort only counts consenting observed sessions, not generic referrals or events before entry',()=>{
 const e=(session:string,source:string,name='website_visit',at=10):AnalyticsEvent=>({id:session+name,name,session,attempt:null,at,mode:'live',origin:'client',props:{source}});
 const r=aiReferralReport([e('ai','ai'),e('search','search'),e('other','referral'),e('ai','ai','package_info_opened',11),e('early','ai','package_info_opened',9)],[]);assert.equal(r.sessions,1);assert.equal(r.packageDetailSessions,1);assert.equal(r.verifiedReservations,0);assert.equal(aiReferralReport([],[]).conversionRate,null);
});
test('llms directory contains only canonical public links, without private or invented API resources',()=>{
 const text=readFileSync('public/llms.txt','utf8');for(const match of text.matchAll(/\]\(https:\/\/www\.jaisalgo\.com([^)]*)\)/g))assert.ok(publicPaths.includes(match[1]||'/'),match[0]);assert.match(text,/provisional estimates/);assert.ok(!/https:\/\/www\.jaisalgo\.com\/(book|api|reservations|verify|admin)/.test(text));
});
