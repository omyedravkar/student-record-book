import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/add-achievement", label: "Add Activity" },
  { to: "/activities", label: "My Activities" },
  { to: "/rankings", label: "Rankings" },
  { to: "/mentor", label: "Mentor" },
  { to: "/admin", label: "Admin" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      background: "#1a237e", padding: "0 2rem",
      display: "flex", alignItems: "center", gap: "2rem", height: 56
    }}>
      <span style={{ color: "#fff", fontWeight: 500, fontSize: 18 }}>
        Student Record Book
      </span>
      <div style={{ display: "flex", gap: "1.5rem", marginLeft: "auto", flexWrap: "wrap" }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            color: pathname === l.to ? "#ef5350" : "#c5cae9",
            textDecoration: "none", fontSize: 13,
            borderBottom: pathname === l.to ? "2px solid #ef5350" : "none",
            paddingBottom: 4
          }}>{l.label}</Link>
        ))}
      </div>
    </nav>
  );
}