/** Lightweight route identifiers for client-side analytics; no editorial copy in the bundle. */
export const packageCollectionKeys=['jaisalmer-family-packages','jaisalmer-honeymoon-packages','budget-jaisalmer-packages','jaisalmer-solo-packages','jaisalmer-group-packages','luxury-jaisalmer-packages','2-nights-3-days-jaisalmer'] as const;
export type PackageCollectionKey=typeof packageCollectionKeys[number];
export function isPackageCollectionPath(path:string){return packageCollectionKeys.some(slug=>path==='/packages/'+slug)}
