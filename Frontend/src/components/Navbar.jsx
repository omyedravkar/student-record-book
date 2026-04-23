import { Link, useLocation, useNavigate } from "react-router-dom";

const studentLinks = [
  { to: "/student", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
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

  return (
    <nav style={{
      background: "#1a237e", padding: "0 2rem",
      display: "flex", alignItems: "center", gap: "2rem", height: 56
    }}>
      <span style={{ color: "#fff", fontWeight: 500, fontSize: 18 }}>
        Student Record Book
      </span>
      <div style={{ display: "flex", gap: "1.5rem", marginLeft: "auto", alignItems: "center" }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            color: pathname === l.to ? "#ef5350" : "#c5cae9",
            textDecoration: "none", fontSize: 13,
            borderBottom: pathname === l.to ? "2px solid #ef5350" : "none",
            paddingBottom: 4
          }}>{l.label}</Link>
        ))}
        {name && <span style={{ color: "#c5cae9", fontSize: 13 }}>👤 {name}</span>}
        <button onClick={handleLogout} style={{
          backgroundColor: 'transparent', border: '1px solid #c5cae9',
          color: '#c5cae9', borderRadius: '6px', padding: '4px 12px',
          fontSize: 13, cursor: 'pointer'
        }}>Logout</button>
      </div>
    </nav>
  );
}