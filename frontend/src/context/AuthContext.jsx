import { createContext, useContext, useState } from 'react';
import api from '../services/api';

/**
 * Contexte d'authentification : conserve l'utilisateur connecté et le jeton,
 * et expose les fonctions de connexion / déconnexion à toute l'application.
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stocke = localStorage.getItem('utilisateur');
    return stocke ? JSON.parse(stocke) : null;
  });

  const connexion = async (email, motDePasse) => {
    const { data } = await api.post('/auth/login', { email, motDePasse });
    localStorage.setItem('token', data.token);
    localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
    setUtilisateur(data.utilisateur);
    return data.utilisateur;
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  };

  // Vérifie si l'utilisateur courant possède l'un des rôles autorisés
  const aRole = (...roles) => utilisateur && roles.includes(utilisateur.role);

  return (
    <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, aRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
