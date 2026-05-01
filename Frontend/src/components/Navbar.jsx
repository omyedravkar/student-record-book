import { Link, useLocation, useNavigate } from "react-router-dom";

const studentLinks = [
  { to: "/student", label: "Dashboard" },
  //{ to: "/profile", label: "Profile" },
  { to: "/add-achievement", label: "Add Activity" },
  { to: "/activities", label: "My Activities" },
];

const mentorLinks = [
  { to: "/mentor", label: "Dashboard" },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/rankings", label: "Search Students" },
];

const placementLinks = [
  { to: "/rankings", label: "Rankings" },
  { to: "/recruiter", label: "Recruiter Search" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const links = role === 'student' ? studentLinks
    : role === 'mentor' ? mentorLinks
    : role === 'admin' ? adminLinks
    : role === 'placement' ? placementLinks
    : [];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>Student Record Book</span>

      <div style={styles.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            ...styles.link,
            color: pathname === l.to ? '#fff' : '#9fa8da',
            borderBottom: pathname === l.to ? '2px solid #fff' : '2px solid transparent',
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={styles.right}>
        {name && (
          //change for profile page
          <div style={{...styles.avatarWrap, cursor: 'pointer'}} onClick={() => navigate('/profile')}>
            <div style={styles.avatar}>{initial}</div>
            <span style={styles.nameText}>{name}</span>
          </div>
        )}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#1a237e',
    height: 54,
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '-0.2px',
    whiteSpace: 'nowrap',
    fontFamily: "'Segoe UI', sans-serif",
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  link: {
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    transition: 'color 0.15s',
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom: 4,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: '#3949ab',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    color: '#c5cae9',
    fontSize: 13,
    fontFamily: "'Segoe UI', sans-serif",
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(197,202,233,0.5)',
    color: '#c5cae9',
    borderRadius: 6,
    padding: '5px 14px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
    transition: 'border-color 0.15s',
  },
};