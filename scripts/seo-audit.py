#!/usr/bin/env python3
"""Read-only SEO checks against rendered HTML. Python standard library only."""
import argparse
import concurrent.futures
import datetime as dt
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.title = []
        self.h1 = []
        self.meta = {}
        self.canonicals = []
        self.links = []
        self.images = []
        self.ids = set()
        self.scripts = []
        self.body = []
        self.in_title = False
        self.in_h1 = False
        self.in_script = False
        self.in_style = False
        self.json_script = False
        self.script = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.add(a['id'])
        if tag == 'title':
            self.in_title = True
        elif tag == 'h1':
            self.in_h1 = True
            self.h1.append('')
        elif tag == 'meta':
            key = a.get('name') or a.get('property')
            self.meta.setdefault(key, []).append(a.get('content', ''))
        elif tag == 'link' and a.get('rel') == 'canonical':
            self.canonicals.append(a.get('href', ''))
        elif tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        elif tag == 'img':
            self.images.append(a)
        elif tag == 'script':
            self.in_script = True
            self.json_script = a.get('type') == 'application/ld+json'
            self.script = []
        elif tag == 'style':
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'h1':
            self.in_h1 = False
        elif tag == 'script':
            if self.json_script:
                self.scripts.append(''.join(self.script))
            self.in_script = False
            self.json_script = False
        elif tag == 'style':
            self.in_style = False

    def handle_data(self, text):
        if self.in_script:
            self.script.append(text)
            return
        if self.in_style:
            return
        if self.in_title:
            self.title.append(text)
        if self.in_h1 and self.h1:
            self.h1[-1] += text
        self.body.append(text)

    def one(self, key):
        values = self.meta.get(key, [])
        return values[0] if len(values) == 1 else ''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:3001', help='Running local server, production or preview URL')
    parser.add_argument('--expect-origin', default='https://www.jaisalgo.com', help='Canonical production origin, including when testing localhost')
    parser.add_argument('--json', dest='report_path', help='Optional JSON report path')
    parser.add_argument('--preview', action='store_true', help='Expect noindex on a Vercel preview deployment')
    args = parser.parse_args()
    base = args.base_url.rstrip('/')
    origin = args.expect_origin.rstrip('/')
    issues = []
    warnings = []
    pages = {}
    image_urls = set()
    links = set()

    def fail(path, message):
        issues.append({'url': path, 'issue': message})

    def local_path(url, parent='/'):
        parsed = urllib.parse.urlsplit(urllib.parse.urljoin(origin + parent, url))
        if (parsed.scheme, parsed.netloc) != (urllib.parse.urlsplit(origin).scheme, urllib.parse.urlsplit(origin).netloc):
            return None
        return parsed.path + ('?' + parsed.query if parsed.query else '')

    def same_url(first, second):
        a, b = urllib.parse.urlsplit(first), urllib.parse.urlsplit(second)
        return a._replace(path=a.path or '/') == b._replace(path=b.path or '/')

    def request(path, redirects=0):
        url = base + path
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'JaisalGo-SEO-Audit/1.0 (read-only; owned-site validation)'})
            with urllib.request.urlopen(req, timeout=25) as response:
                body = response.read()
                return path, response.status, dict(response.headers), body, response.url
        except urllib.error.HTTPError as error:
            # Python 3.9 does not follow 308; Next.js intentionally uses it.
            if error.code in (301, 302, 303, 307, 308) and redirects < 4:
                target = urllib.parse.urlsplit(urllib.parse.urljoin(url, error.headers.get('Location', '')))
                if target.netloc == urllib.parse.urlsplit(base).netloc:
                    following = target.path + ('?' + target.query if target.query else '')
                    _, status, headers, body, final = request(following, redirects+1)
                    return path, status, headers, body, final
            return path, error.code, dict(error.headers), error.read(), error.url
        except Exception as error:
            return path, 0, {}, str(error).encode(), url

    def get_many(paths):
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            return list(pool.map(request, sorted(paths)))

    result = request('/sitemap.xml')
    if result[1] != 200:
        fail('/sitemap.xml', f'HTTP {result[1]}: cannot read sitemap')
        entries = []
    else:
        try:
            tree = ET.fromstring(result[3])
            ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
            entries = [{'url': node.findtext('s:loc', namespaces=ns), 'lastmod': node.findtext('s:lastmod', namespaces=ns)} for node in tree.findall('s:url', ns)]
        except ET.ParseError:
            fail('/sitemap.xml', 'Invalid XML')
            entries = []
    urls = [entry['url'] for entry in entries]
    if len(urls) != len(set(urls)):
        fail('/sitemap.xml', 'Duplicate canonical entries')
    paths = set()
    for entry in entries:
        url = entry['url'] or ''
        path = local_path(url)
        if not path or '?' in path or '#' in url or (path != '/' and path.endswith('/')):
            fail('/sitemap.xml', f'Noncanonical URL: {url}')
            continue
        if re.match(r'^/(?:api|admin|book|reservations|my-bookings)(?:/|$)', path):
            fail('/sitemap.xml', f'Private URL included: {url}')
        if entry['lastmod']:
            try:
                value = dt.datetime.fromisoformat(entry['lastmod'].replace('Z', '+00:00')).date()
                if value > dt.datetime.now(dt.timezone.utc).date():
                    fail(path, 'Sitemap lastmod is in the future')
            except ValueError:
                fail(path, 'Invalid sitemap lastmod')
        paths.add(path)
    if '/' not in paths or '/packages' not in paths or '/travel-guide' not in paths:
        fail('/sitemap.xml', 'A primary public hub is missing')
    if len(paths) > 1000:
        fail('/sitemap.xml', 'Audit safety limit of 1000 pages exceeded; split the crawl')
        paths = set()

    robots = request('/robots.txt')
    text = robots[3].decode(errors='replace')
    if robots[1] != 200 or f'Sitemap: {origin}/sitemap.xml' not in text:
        fail('/robots.txt', 'Missing production sitemap reference')
    for path in ['/book/', '/reservations/', '/my-bookings', '/admin', '/_next/', '/images/']:
        if f'Disallow: {path}' in text:
            fail('/robots.txt', f'Blocks assets or prevents reading noindex: {path}')

    collection_text=(Path(__file__).resolve().parent.parent/'data/package-collections.ts').read_text()
    collection_paths={'/packages/'+slug for slug in re.findall(r"slug:'([^']+)'",collection_text)}
    seen_titles, seen_descriptions = {}, {}
    schemas = {}
    for path, status, headers, body, final in get_many(paths):
        if status != 200:
            fail(path, f'Indexable URL returned HTTP {status}')
            continue
        if urllib.parse.urlsplit(final).path != path:
            fail(path, 'Sitemap URL redirects')
        doc = Document(body.decode(errors='replace'))
        title = ''.join(doc.title).strip()
        description = doc.one('description')
        expected = origin + path
        if not title:
            fail(path, 'Missing title')
        elif title in seen_titles:
            fail(path, f'Duplicate title with {seen_titles[title]}')
        seen_titles[title] = path
        if not description:
            fail(path, 'Missing or duplicate meta description')
        elif description in seen_descriptions:
            fail(path, f'Duplicate description with {seen_descriptions[description]}')
        seen_descriptions[description] = path
        if len(doc.canonicals) != 1 or not same_url(doc.canonicals[0], expected):
            fail(path, f'Canonical mismatch: {doc.canonicals}; expected {expected}')
        if len(doc.h1) != 1 or not doc.h1[0].strip():
            fail(path, f'Expected one nonempty H1, found {len(doc.h1)}')
        noindex = 'noindex' in (' '.join(doc.meta.get('robots', [])) + headers.get('X-Robots-Tag', '')).lower()
        if noindex != args.preview:
            fail(path, 'Unexpected indexing directives for this environment')
        for name in ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']:
            if not doc.one(name):
                fail(path, f'Missing or duplicate {name}')
        if doc.one('og:title') != title or doc.one('og:description') != description or not same_url(doc.one('og:url'), expected):
            fail(path, 'Social metadata does not match this page')
        nodes = []
        for source in doc.scripts:
            try:
                data = json.loads(source)
                if data.get('@context') != 'https://schema.org':
                    fail(path, 'Missing schema.org context')
                nodes.extend(data.get('@graph', [data]))
            except (ValueError, AttributeError):
                fail(path, 'Invalid JSON-LD')
        body_text = ' '.join(' '.join(doc.body).split())
        for node in nodes:
            kind = node.get('@type')
            schemas[kind] = schemas.get(kind, 0) + 1
            if kind in ['ItemList', 'BreadcrumbList']:
                elements = node.get('itemListElement', [])
                if [item.get('position') for item in elements] != list(range(1, len(elements) + 1)):
                    fail(path, 'Invalid list/breadcrumb positions')
            if kind == 'ItemList':
                if node.get('numberOfItems') != len(node.get('itemListElement', [])):
                    fail(path, 'ItemList count mismatch')
                for item in node.get('itemListElement', []):
                    target = local_path(item.get('url', ''))
                    if target not in [local_path(link, path) for link in doc.links]:
                        fail(path, f'Listed item has no HTML anchor: {target}')
            if kind == 'TouristTrip':
                for day in node.get('subTrip', []):
                    if ' '.join(day.get('description', '').split()) not in body_text:
                        fail(path, 'Itinerary exists only in JSON/JavaScript, not rendered HTML')
                if any(key in node for key in ['offers', 'aggregateRating', 'review']):
                    fail(path, 'Review provisional price/review markup before publishing')
            if kind == 'Article' and ' '.join(str(node.get('headline', '')).split()) not in body_text:
                fail(path, 'Article headline does not match rendered content')
        if path in collection_paths and not any(node.get('@type') == 'ItemList' for node in nodes):
            fail(path,'Missing collection item-list schema')
        if path.startswith('/packages/') and path not in collection_paths and not any(node.get('@type') == 'TouristTrip' for node in nodes):
            fail(path, 'Missing package trip schema')
        if path.startswith('/jaisalmer-travel-from/'):
            if not any(node.get('@type') == 'Article' for node in nodes) or not any(node.get('@type') == 'BreadcrumbList' for node in nodes):
                fail(path, 'Missing city guide article or breadcrumb')
            for anchor in ['travel-options', 'local-itinerary', 'your-group', 'trip-budget', 'arrival', 'questions', 'local-packages']:
                if anchor not in doc.ids:
                    fail(path, f'Incomplete city guide section: {anchor}')
            if 'separate' not in body_text.lower():
                fail(path, 'City guide does not explain separate origin travel')
        for href in doc.links:
            target = local_path(href, path)
            if target and not target.startswith('/api/'):
                links.add(target)
        for image in doc.images:
            if not image.get('alt', '').strip():
                fail(path, 'Missing image alt text')
            if not image.get('sizes') and not (image.get('width') and image.get('height')):
                fail(path, 'Image lacks responsive sizes/dimensions')
            source = local_path(image.get('src', ''), path)
            if source:
                image_urls.add(source)
        for name in ['og:image', 'twitter:image']:
            source = local_path(doc.one(name), path)
            if source:
                image_urls.add(source)
        if any('localhost' in value or '127.0.0.1' in value for value in doc.canonicals + [doc.one('og:url')]):
            fail(path, 'Local development origin leaked into metadata')
        pages[path] = {'title': title, 'description': description, 'canonical': doc.canonicals, 'h1': doc.h1, 'htmlBytes': len(body), 'titleCharacters':len(title), 'descriptionCharacters':len(description), 'schemaTypes': [node.get('@type') for node in nodes]}

    for path in paths - {'/'}:
        if path not in {link.split('?')[0].rstrip('/') or '/' for link in links}:
            fail(path, 'No crawlable incoming link found on public pages')
    for path, status, _, _, _ in get_many(links - paths):
        if status != 200:
            fail(path, f'Broken internal anchor target: HTTP {status}')
    for path, status, headers, _, _ in get_many(image_urls):
        if status != 200 or not headers.get('Content-Type', headers.get('content-type', '')).startswith('image/'):
            fail(path, f'Broken image or preview asset: HTTP {status}')
    package_path = next(iter(sorted(path for path in paths if 'TouristTrip' in pages.get(path,{}).get('schemaTypes',[]))), '/packages/city-and-dunes')
    slug = package_path.rsplit('/', 1)[-1]
    for path in [f'/book/{slug}', '/reservations/seo-audit-example', '/my-bookings', '/admin', '/terms', '/privacy-policy', '/cancellation-policy']:
        _, status, headers, body, _ = request(path)
        doc = Document(body.decode(errors='replace'))
        if status != 200 or 'noindex' not in ' '.join(doc.meta.get('robots', [])).lower():
            fail(path, 'Private/draft page must remain accessible with noindex')
        if re.match(r'^/(book/|reservations/|my-bookings|admin)', path) and 'noindex' not in headers.get('X-Robots-Tag', headers.get('x-robots-tag', '')).lower():
            fail(path, 'Missing private X-Robots-Tag header')
    for path, should_index in [('/packages?sort=price', False), ('/packages?days=3', False), ('/packages?utm_source=google', True), (package_path+'?section=price', False), (package_path+'?utm_source=google', True)]:
        _, status, _, body, _ = request(path)
        doc = Document(body.decode(errors='replace'))
        noindex = 'noindex' in ' '.join(doc.meta.get('robots', [])).lower()
        if status != 200 or noindex != (args.preview or not should_index) or doc.canonicals != [origin+path.split('?')[0]]:
            fail(path, 'Incorrect variant/tracking canonical or indexing policy')
    for path in ['/packages/seo-audit-nonexistent', '/travel-guide/seo-audit-nonexistent', '/seo-audit-nonexistent', '/jaisalmer-travel-from/noida', '/jaisalmer-travel-from/jaiselmer', '/jaisalmer-travel-from/unknown']:
        _, status, _, body, _ = request(path)
        if status != 404 or 'noindex' not in ' '.join(Document(body.decode(errors='replace')).meta.get('robots', [])).lower():
            fail(path, 'Unknown content must return HTTP 404 and noindex')
    for alias, canonical in [('new-delhi', 'delhi'), ('delhi-ncr', 'delhi'), ('baroda', 'vadodara'), ('bangalore', 'bengaluru')]:
        path = '/jaisalmer-travel-from/' + alias
        _, status, _, body, final = request(path)
        doc = Document(body.decode(errors='replace'))
        target = '/jaisalmer-travel-from/' + canonical
        if status != 200 or urllib.parse.urlsplit(final).path != target or doc.canonicals != [origin + target]:
            fail(path, 'City alias did not resolve to its canonical guide')
        if origin + path in urls:
            fail(path, 'Duplicate city alias in sitemap')
    for path in ['/packages/', package_path+'/']:
        _, status, _, _, final = request(path)
        if status != 200 or urllib.parse.urlsplit(final).path.endswith('/'):
            fail(path, 'Trailing-slash variant does not resolve to the canonical path')

    alias_text=(Path(__file__).resolve().parent.parent/'data/seo-aliases.ts').read_text()
    aliases=dict(re.findall(r"'(/[^']+)':'(/[^']+)'",alias_text))
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    direct=urllib.request.build_opener(NoRedirect)
    for alias,target in aliases.items():
        try:
            direct.open(base+alias,timeout=25)
            fail(alias,'Expected a permanent 301 alias redirect')
        except urllib.error.HTTPError as error:
            if error.code!=301 or urllib.parse.urlsplit(error.headers.get('Location','')).path!=target:
                fail(alias,f'Unexpected alias response {error.code}')
        except Exception as error:
            fail(alias,str(error))
        _,status,_,body,final=request(alias)
        doc=Document(body.decode(errors='replace'))
        if status!=200 or urllib.parse.urlsplit(final).path!=target or not any(same_url(c,origin+target) for c in doc.canonicals):
            fail(alias,'Alias does not finish at its canonical page')
        if origin+alias in urls:
            fail(alias,'Redirecting alias is included in the sitemap')

    warnings.append('This HTTP audit does not measure real-user Core Web Vitals, Google indexing, ranking, or Rich Results eligibility.')
    report = {'checkedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'baseUrl': base, 'canonicalOrigin': origin, 'summary': {'indexablePages': len(pages), 'sitemapEntries': len(entries), 'internalTargets': len(links), 'imageAssets': len(image_urls), 'criticalIssues': len(issues), 'schemaTypes': schemas}, 'issues': issues, 'warnings': warnings, 'pages': pages}
    if args.report_path:
        Path(args.report_path).write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n')
    print(json.dumps(report['summary'], indent=2))
    for issue in issues:
        print(f"FAIL {issue['url']}: {issue['issue']}")
    for warning in warnings:
        print('NOTE '+warning)
    return 1 if issues else 0


if __name__ == '__main__':
    sys.exit(main())
