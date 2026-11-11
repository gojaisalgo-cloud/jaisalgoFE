import styles from './loading.module.css';

export default function Loading(){
 return <div className={styles.loader} role="status" aria-live="polite">
  <svg className={styles.scene} viewBox="0 0 240 140" fill="none" aria-hidden="true">
   <circle className={styles.halo} cx="120" cy="57" r="35" fill="#f6ead1"/>
   <circle className={styles.sun} cx="120" cy="57" r="21" fill="#d6a958"/>
   <path d="M24 108C66 64 111 76 150 103C177 121 201 102 216 94" stroke="#d8bd8b" strokeWidth="2" strokeLinecap="round"/>
   <path d="M24 119C67 97 100 93 141 111C170 124 191 120 216 108" stroke="#263c35" strokeWidth="2" strokeLinecap="round"/>
   <path className={styles.trail} d="M74 131C100 122 128 121 154 129" stroke="#d6a958" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7"/>
  </svg>
  <span className={styles.brand}>JaisalGo<span aria-hidden="true">.</span></span>
  <p className={styles.message}>A little closer to the golden city.</p>
  <span className={styles.dots} aria-hidden="true"><i/><i/><i/></span>
  <span className="sr-only">Loading your page…</span>
 </div>;
}
