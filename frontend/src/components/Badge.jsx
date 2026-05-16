export default function Badge({ type, label }) {
  const map = {
    todo: 'To Do', in_progress: 'In Progress', review: 'Review', completed: 'Completed',
    low: 'Low', medium: 'Medium', high: 'High',
    active: 'Active', on_hold: 'On Hold',
    admin: 'Admin', member: 'Member',
  };
  return <span className={`badge badge-${type}`}>{label ?? map[type] ?? type}</span>;
}
