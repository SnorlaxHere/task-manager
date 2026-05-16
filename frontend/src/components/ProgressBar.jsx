export default function ProgressBar({ value=0, color }) {
  const cls = value===100 ? 'success' : value>=50 ? '' : value>0 ? 'warning' : '';
  return (
    <div className="progress-bar">
      <div className={`progress-fill ${color||cls}`} style={{width:`${value}%`}} />
    </div>
  );
}
