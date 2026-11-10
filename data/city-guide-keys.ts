import {nationalCityGuideKeys} from './national-city-guide-keys';
/** Small allowlist for anonymous measurement; this alone never publishes a route. */
export const cityGuideKeys=['delhi','ahmedabad','surat','vadodara','jaipur','bengaluru','mumbai','hyderabad','chennai','kolkata','pune',...nationalCityGuideKeys] as const;
export type CityGuideKey=typeof cityGuideKeys[number];
export function cityGuideAtPath(path:string):CityGuideKey|undefined {
  const match=/^\/jaisalmer-travel-from\/([a-z-]+)\/?$/.exec(path);
  return match&&cityGuideKeys.includes(match[1] as CityGuideKey)?match[1] as CityGuideKey:undefined;
}
