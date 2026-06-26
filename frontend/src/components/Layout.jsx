import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Mise en page principale de l'application : barre latérale de navigation
 * (filtrée selon le rôle) + barre supérieure + zone de contenu (Outlet).
 */
export default function Layout() {
  const { utilisateur, deconnexion, aRole } = useAuth();

  // Définition des liens ; chaque lien peut restreindre l'accès à des rôles
  const liens = [
    { section: 'Pilotage' },
    { to: '/', label: 'Tableau de bord', icon: '📊', exact: true },
    { to: '/alertes', label: 'Alertes de stock', icon: '⚠️' },
    { section: 'Catalogue' },
    { to: '/produits', label: 'Produits', icon: '💻' },
    { to: '/categories', label: 'Catégories', icon: '🗂️' },
    { to: '/marques', label: 'Marques', icon: '🏷️' },
    { section: 'Opérations' },
    { to: '/commandes', label: 'Commandes fourn.', icon: '📦' },
    { to: '/ventes', label: 'Ventes', icon: '🧾' },
    { to: '/mouvements', label: 'Mouvements', icon: '🔄' },
    { section: 'Tiers' },
    { to: '/fournisseurs', label: 'Fournisseurs', icon: '🚚' },
    { to: '/clients', label: 'Clients', icon: '👥' },
    { section: 'Administration', roles: ['admin'] },
    { to: '/utilisateurs', label: 'Utilisateurs', icon: '👤', roles: ['admin'] },
  ];

  const initiales = `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo">⚡</span> GestiPC
        </div>
        <nav>
          {liens.map((lien, i) => {
            if (lien.roles && !aRole(...lien.roles)) return null;
            if (lien.section) return <div key={i} className="sidebar-section">{lien.section}</div>;
            return (
              <NavLink
                key={i}
                to={lien.to}
                end={lien.exact}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="icon">{lien.icon}</span> {lien.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>Gestion de stock — Composants &amp; accessoires informatiques</h1>
          <div className="user-box">
            <div className="user-meta">
              <div className="name">{utilisateur.prenom} {utilisateur.nom}</div>
              <div className="role">{utilisateur.role}</div>
            </div>
            <div className="avatar">{initiales}</div>
            <button className="btn btn-outline btn-sm" onClick={deconnexion}>Déconnexion</button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
