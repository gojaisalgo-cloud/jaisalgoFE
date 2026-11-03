import type {ComponentPropsWithRef} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';

type Direction = 'left' | 'right' | 'up-right';
const arrows = {left:ArrowLeft,right:ArrowRight,'up-right':ArrowUpRight};

/** Decorative cue inside an existing link/button; never creates a second tab stop. */
export function DirectionalIcon({direction='up-right',className=''}:{direction?:Direction;className?:string}){
 const Arrow=arrows[direction];
 return <span className={`direction-icon ${className}`} aria-hidden="true"><Arrow size={18} strokeWidth={1.75}/></span>;
}

type IconButtonProps = ComponentPropsWithRef<'button'> & {'aria-label':string};
/** A single, labelled 44px target for gallery, menu and close controls. */
export function IconButton({className='',type='button',children,...props}:IconButtonProps){
 return <button {...props} type={type} className={`icon-button ${className}`}>{children}</button>;
}
