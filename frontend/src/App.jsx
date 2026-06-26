import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import Categories from './pages/Categories';
import Marques from './pages/Marques';
import Fournisseurs from './pages/Fournisseurs';
import Clients from './pages/Clients';
import Commandes from './pages/Commandes';
import Ventes from './pages/Ventes';
import Mouvements from './pages/Mouvements';
import Alertes from './pages/Alertes';
import Utilisateurs from './pages/Utilisateurs';

// Route protégée : redirige vers /login si l'utilisateur n'est pas connecté,
// et vérifie éventuellement le rôle requis.
function RoutePrivee({ children, roles }) {
  const { utilisateur, aRole } = useAuth();
  if (!utilisateur) return <Navigate to="/login" replace />;
  if (roles && !aRole(...roles)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { utilisateur } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={utilisateur ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<RoutePrivee><Layout /></RoutePrivee>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/marques" element={<Marques />} />
        <Route path="/fournisseurs" element={<Fournisseurs />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/commandes" element={<Commandes />} />
        <Route path="/ventes" element={<Ventes />} />
        <Route path="/mouvements" element={<Mouvements />} />
        <Route path="/alertes" element={<Alertes />} />
        <Route
          path="/utilisateurs"
          element={<RoutePrivee roles={['admin']}><Utilisateurs /></RoutePrivee>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
