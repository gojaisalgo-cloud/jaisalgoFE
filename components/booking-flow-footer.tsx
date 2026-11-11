'use client';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
/** Transaction routes keep their own support and legal links without the travel directory. */
export function BookingFlowFooter({children}:{children:ReactNode}){
 const path=usePathname();
 if(/^\/(book|reservations|verify|payment|payments|checkout)(\/|$)/.test(path))return null;
 return children;
}
