const COLORS = [
  ['#6c63ff','#fff'],['#22c55e','#fff'],['#f59e0b','#000'],
  ['#38bdf8','#000'],['#ef4444','#fff'],['#a855f7','#fff'],
  ['#ec4899','#fff'],['#14b8a6','#fff'],
];

function getColor(name='') {
  const i = (name.charCodeAt(0) || 0) % COLORS.length;
  return COLORS[i];
}

export default function Avatar({ name='?', size='md', style={} }) {
  const initials = name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || '?';
  const [bg, color] = getColor(name);
  return (
    <div className={`avatar avatar-${size}`} style={{ background:bg, color, ...style }}>
      {initials}
    </div>
  );
}
