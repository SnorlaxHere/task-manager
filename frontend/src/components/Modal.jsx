import { X } from '@phosphor-icons/react';

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal animate-slide-up" style={{background:'rgba(19, 27, 45, 0.85)', backdropFilter:'blur(24px)', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', borderRadius:'var(--radius-xl)'}}>
        <div className="modal-header" style={{borderBottom:'1px solid var(--border)', padding:'24px 32px'}}>
          <h3 style={{fontSize:'1.3rem', fontWeight:700, fontFamily:'Outfit, sans-serif'}}>{title}</h3>
          <button className="btn btn-ghost" style={{padding:'6px', color:'var(--text-muted)'}} onClick={onClose}><X size={20} weight="bold"/></button>
        </div>
        <div style={{padding:'24px 32px'}}>
          {children}
        </div>
        {footer && <div className="modal-footer" style={{padding:'20px 32px', background:'rgba(0,0,0,0.2)', borderTop:'1px solid var(--border)', display:'flex', gap:12, justifyContent:'flex-end'}}>{footer}</div>}
      </div>
    </div>
  );
}
