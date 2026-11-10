'use client';
import {useEffect,useId,useRef,type ReactNode} from 'react';
import {X} from 'lucide-react';
import {IconButton} from '@/components/directional-control';

/** Native modal supplies focus trapping, inert background and Escape semantics. */
export function Modal({title,onClose,children,footer,className=''}:{title:string;onClose:()=>void;children:ReactNode;footer?:ReactNode;className?:string}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef(onClose),id=useId();
 useEffect(()=>{close.current=onClose},[onClose]);
 useEffect(()=>{const el=dialog.current;if(!el)return;const trigger=document.activeElement,overflow=document.body.style.overflow;el.showModal();document.body.style.overflow='hidden';return()=>{el.close();document.body.style.overflow=overflow;if(trigger instanceof HTMLElement&&trigger.isConnected)trigger.focus({preventScroll:true})}},[]);
 return <dialog ref={dialog} className={`discovery-modal ${className}`} aria-labelledby={id} onCancel={e=>{e.preventDefault();close.current()}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close.current()}}>
  <div className="discovery-modal-header"><h2 id={id}>{title}</h2><IconButton autoFocus aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}><X aria-hidden="true"/></IconButton></div>
  <div className="discovery-modal-content">{children}</div>{footer&&<div className="discovery-modal-footer">{footer}</div>}
 </dialog>;
}
