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
