import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await connexion(email, motDePasse);
      navigate('/');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">⚡ GestiPC</div>
        <p className="subtitle">Gestion de stock — Composants informatiques</p>

        {erreur && <div className="alert alert-error">{erreur}</div>}

        <form onSubmit={soumettre}>
          <div className="form-group">
            <label>Adresse e-mail</label>
            <input
              type="email" className="form-control" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@gestipc.tn" required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password" className="form-control" value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••" required
            />
          </div>
          <button className="btn btn-primary" disabled={chargement}>
            {chargement ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="demo-hint">
          <b>Comptes de démonstration :</b><br />
          Admin : admin@gestipc.tn / admin123<br />
          Magasinier : magasinier@gestipc.tn / magasin123<br />
          Gérant : gerant@gestipc.tn / gerant123
        </div>
      </div>
    </div>
  );
}
