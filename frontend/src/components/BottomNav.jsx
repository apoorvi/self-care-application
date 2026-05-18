import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/explore', label: 'Explore', icon: '🔍' },
  { to: '/history', label: 'History', icon: '📊' }
];

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--bg-elevated)',
    display: 'flex',
    paddingBottom: 'var(--safe-bottom)',
    zIndex: 100
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 0',
    gap: 2,
    fontSize: 11,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s'
  },
  icon: { fontSize: 20 }
};

export default function BottomNav() {
  return (
    <nav style={styles.nav}>
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            ...styles.tab,
            color: isActive ? 'var(--accent-soft)' : 'var(--text-secondary)'
          })}
        >
          <span style={styles.icon}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
