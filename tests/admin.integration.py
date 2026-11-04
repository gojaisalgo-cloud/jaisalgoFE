import os, subprocess, tempfile, secrets, time, json, urllib.request, urllib.error, http.cookiejar, datetime, sqlite3, socket, shutil
root=os.getcwd(); node=os.environ.get('JAISALGO_NODE') or shutil.which('node')
with socket.socket() as sock:
 sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
base='http://127.0.0.1:'+str(port)
with tempfile.TemporaryDirectory(prefix='jaisalgo-admin-qa-') as tmp:
 env=os.environ.copy(); password=secrets.token_urlsafe(24); env.update(ADMIN_PASSWORD=password,ADMIN_SESSION_SECRET=secrets.token_hex(32),BOOKING_MODE='demo',DATABASE_URL='file:'+tmp+'/qa.db')
 log=open(tmp+'/server.log','w'); proc=subprocess.Popen([node,'scripts/run.mjs','start','-p',str(port)],cwd=root,env=env,stdout=log,stderr=log)
 jar=http.cookiejar.CookieJar(); owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar)); guest=urllib.request.build_opener()
 def request(path,body=None,auth=True,origin=base,method=None):
  headers={'Origin':origin}; payload=None
  if body is not None:headers['Content-Type']='application/json';payload=json.dumps(body).encode()
  req=urllib.request.Request(base+path,data=payload,headers=headers,method=method)
  try:
   with (owner if auth else guest).open(req,timeout=20) as r:
    raw=r.read().decode(); return r.status,json.loads(raw) if r.headers.get('Content-Type','').startswith('application/json') else raw
  except urllib.error.HTTPError as e:
   raw=e.read().decode();return e.code,json.loads(raw) if e.headers.get('Content-Type','').startswith('application/json') else raw
 try:
  for attempt in range(60):
   try:
    if request('/admin',auth=False)[0]==200:break
   except (urllib.error.URLError,TimeoutError):pass
   time.sleep(.25)
  else:raise RuntimeError('QA server did not start')
  assert request('/api/admin/manage',auth=False)[0]==401
  assert request('/api/admin/analytics',auth=False)[0]==401
  assert request('/api/admin/session',{'password':'incorrect-password'})[0]==401
  assert request('/api/admin/session',{'password':password})[0]==200
  assert any(c.name=='jaisalgo_admin' and c.has_nonstandard_attr('HttpOnly') for c in jar)
  assert request('/api/admin/analytics?mode=demo&period=week')[0]==200
  assert request('/api/admin/analytics',{'action':'feedback','mode':'demo','category':'pricing'},origin='https://wrong.invalid')[0]==403
  assert request('/api/admin/analytics',{'action':'feedback','mode':'demo','category':'pricing','responseMinutes':5})[0]==200
  status,data=request('/api/admin/manage');assert status==200 and len(data['tours'])==24
  t=dict(data['tours'][0]);t.update(slug='qa-private-escape',title='QA private escape',published=False,revision=0)
  assert request('/api/admin/manage',{'action':'save','tour':t},origin='https://wrong.invalid')[0]==403
  assert request('/api/admin/manage',{'action':'save','tour':t})[0]==200
  assert request('/packages/qa-private-escape',auth=False)[0]==404
  assert '/packages/qa-private-escape' not in request('/sitemap.xml',auth=False)[1]
  t=next(x for x in request('/api/admin/manage')[1]['tours'] if x['slug']==t['slug']);content_date=t['contentModifiedAt']
  assert request('/api/admin/manage',{'action':'save','tour':t})[0]==200
  t=next(x for x in request('/api/admin/manage')[1]['tours'] if x['slug']==t['slug']);assert t['contentModifiedAt']==content_date
  t['published']=True
  assert request('/api/admin/manage',{'action':'save','tour':t})[0]==200
  assert request('/packages/qa-private-escape',auth=False)[0]==200
  assert '/packages/qa-private-escape' in request('/sitemap.xml',auth=False)[1]
  assert request('/api/admin/manage',{'action':'save','tour':t})[0]==400
  date=(datetime.date.today()+datetime.timedelta(days=25)).isoformat()
  assert request('/api/admin/manage',{'action':'departure','slug':t['slug'],'date':date,'capacity':12})[0]==200
  import uuid
  access=secrets.token_hex(32);i=dict(slug=t['slug'],date=date,travelers=2,stay='Comfort',transport=True,jeep=False,guide=False,name='QA Traveler',phone='+919999999999',consent=True,website='',access=access,idempotency=str(uuid.uuid4()))
  ctx=dict(consent=True,sessionId=str(uuid.uuid4()),attemptId=str(uuid.uuid4()),device='mobile',source='direct',campaign='unassigned')
  i['measurement']=ctx
  ev=dict(id=str(uuid.uuid4()),name='website_visit',context=ctx,props={})
  assert request('/api/analytics/events',{'events':[ev]},origin='https://wrong.invalid')[0]==403
  assert request('/api/analytics/events',{'events':[dict(ev,props={'phone':'private'})]})[0]==400
  assert request('/api/analytics/events',{'events':[dict(ev,name='booking_confirmed')]})[0]==400
  assert request('/api/analytics/events',{'events':[ev]})[0]==204
  assert request('/api/analytics/events',{'events':[ev]})[0]==204
  status,r=request('/api/booking',{'action':'create','input':i});assert status==200,r;draft=r['id']
  assert request('/api/booking',{'action':'create','input':i})[1]['id']==draft
  status,s=request('/api/booking',{'action':'status','id':draft,'access':access});assert status==200 and s['booking'] is None
  assert request('/api/booking',{'action':'availability','input':i})[1]['remaining']==10
  assert request('/api/booking',{'action':'prepare','id':draft,'access':access})[1]['state']=='pending'
  assert request('/api/booking',{'action':'resume','idempotency':i['idempotency'],'access':access})[1]['id']==draft
  assert request('/api/admin/manage',{'action':'departure','slug':t['slug'],'date':date,'capacity':1})[0]==400
  assert request('/api/admin/manage',{'action':'departure','slug':t['slug'],'date':'2027-02-30','capacity':1})[0]==400
  assert request('/api/booking',{'action':'status','id':draft,'access':'wrong'})[0]==400
  for outcome in ['pending','failed']:
   status,s=request('/api/booking',{'action':'demo','id':draft,'access':access,'outcome':outcome});assert status==200 and s['booking'] is None
  status,s=request('/api/booking',{'action':'demo','id':draft,'access':access,'outcome':'captured'});assert status==200,s;b=s['booking'];assert b['paid']==9900 and b['quote']['total']-9900==b['quote']['balance']
  assert request('/api/booking',{'action':'demo','id':draft,'access':access,'outcome':'captured'})[1]['booking']['id']==b['id']
  assert request('/api/booking',{'action':'balance','id':draft,'access':access})[0]==400
  ops=dict(reporting='16:00',pickup='QA meeting point',instructions='Bring your ticket.')
  assert request('/api/admin/manage',{'action':'operations','id':b['id'],'operations':ops},auth=False)[0]==403
  assert request('/api/admin/manage',{'action':'operations','id':b['id'],'operations':ops})[0]==200
  current=request('/api/booking',{'action':'status','id':draft,'access':access})[1]['booking'];assert current['operations']==ops and current['paid']==9900 and current['status']=='reserved'
  assert request('/api/admin/manage',{'action':'operations','id':b['id'],'operations':dict(ops,reporting='x'*501)})[0]==400
  assert request('/api/admin/manage',{'action':'mark_paid','id':b['id']})[0]==400
  assert 'checkouts' in request('/api/admin/manage')[1]

  report=request('/api/admin/analytics?mode=demo&period=month')[1]
  assert report['totals']['sessions']==1 and report['totals']['reservations']==1 and report['totals']['completed']==0
  assert not any(x in json.dumps(report) for x in [i['name'],i['phone'],access])
  assert request('/api/admin/analytics',{'action':'complete','id':b['id'],'complete':True})[0]==400
  assert request('/api/admin/manage',{'action':'expenses','id':b['id'],'amount':100000})[0]==200
  conn=sqlite3.connect(tmp+'/qa.db');now=datetime.date.today().isoformat()
  row=conn.execute('SELECT payload FROM bookings WHERE id=?',(b['id'],)).fetchone();stored=json.loads(row[0]);stored['date']=now;conn.execute('UPDATE bookings SET payload=? WHERE id=?',(json.dumps(stored),b['id']));conn.commit();conn.close()
  status,result=request('/api/admin/manage',{'action':'offline','id':b['id'],'receipt':'QA-RECEIPT-0001'});assert status==200,result
  assert request('/api/admin/manage',{'action':'offline','id':b['id'],'receipt':'QA-RECEIPT-0001'})[0]==400
  bk=next(x for x in request('/api/admin/manage')[1]['bookings'] if x['id']==b['id']);assert bk['status']=='paid' and bk['paid']==bk['quote']['total'] and bk['actualExpenses']==100000
  assert request('/api/admin/analytics',{'action':'complete','id':b['id'],'complete':True,'gatewayFees':123})[0]==200
  report=request('/api/admin/analytics?mode=demo&period=month')[1]
  assert report['totals']['completed']==1 and report['totals']['contribution']==bk['quote']['total']-100000-123
  assert request('/api/admin/analytics',{'action':'complete','id':b['id'],'complete':False})[0]==200
  assert request('/api/admin/analytics?mode=demo&period=month')[1]['totals']['completed']==0
  assert request('/api/admin/manage',{'action':'cancel','id':b['id']})[0]==200
  status,result=request('/api/admin/manage',{'action':'refund','id':b['id']});assert status==200,result
  bk=next(x for x in request('/api/admin/manage')[1]['bookings'] if x['id']==b['id']);assert bk['status']=='refunded' and bk['refunded']==bk['paid']
  assert request('/api/admin/manage',{'action':'refund','id':b['id']})[0]==400
  assert request('/api/analytics/events',{'sessionId':ctx['sessionId']},method='DELETE')[0]==204
  assert request('/api/admin/analytics?mode=demo&period=month')[1]['totals']['sessions']==0
  assert request('/api/admin/session',method='DELETE')[0]==200
  assert request('/api/admin/manage')[0]==401
  print('PASS: isolated admin authentication, CSRF, private/published catalog, stale-edit rejection, departures, idempotent demo payment states, early-balance block, approved offline receipt, expenses, cancellation, refund ledger and logout; analytics auth/CSRF, PII rejection, verified-only events, deduplication, completion safeguards, actual contribution and consent withdrawal.')
 finally:
  proc.terminate()
  try:proc.wait(timeout=5)
  except subprocess.TimeoutExpired:proc.kill();proc.wait()
  log.close()
