/** Coordinates async SDK readiness with route changes and React effect replays. */
export function pageLifecycle(){
  let path='',active=false,revision=0,landingSession='';
  return {
    start(next:string){if(active&&path===next)return;const previous=active?path:undefined,changed=next!==path;path=next;active=true;return {previous,changed,revision:++revision}},
    ready(version:number){return active&&version===revision},
    end(){if(!active)return;active=false;revision++;return path},
    landing(session:string){if(session===landingSession)return false;landingSession=session;return true},
    reset(){path='';active=false;revision++;landingSession=''},
  };
}

/** Count visible, recently active time; idle/background time is not engagement. */
export function engagementClock(start=Date.now()){
 let tick=start,lastInput=start,active=0,visible=true;
 const advance=(now:number)=>{if(visible)active+=Math.max(0,Math.min(now,lastInput+60000)-tick);tick=now};
 return {activity(now=Date.now()){advance(now);lastInput=now},visibility(shown:boolean,now=Date.now()){advance(now);visible=shown;if(shown)lastInput=now},snapshot(now=Date.now()){advance(now);return {active_seconds:Math.min(86400,Math.floor(active/1000)),elapsed_seconds:Math.max(0,Math.min(86400,Math.floor((now-start)/1000)))}}};
}
