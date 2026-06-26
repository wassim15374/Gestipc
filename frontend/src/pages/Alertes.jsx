import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Alertes() {
  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get('/produits/alertes').then((r) => { setListe(r.data); setChargement(false); });
  }, []);

  return (
    <div>
      <h1 className="page-title">Alertes de stock</h1>
      <p className="page-subtitle">Produits dont la quantité a atteint ou dépassé le seuil d'alerte</p>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Référence</th><th>Désignation</th><th>Catégorie</th><th className="text-center">Stock actuel</th><th className="text-center">Seuil</th><th>État</th></tr></thead>
            <tbody>
              {chargement ? (
                <tr><td colSpan={6} className="empty-state">Chargement…</td></tr>
              ) : liste.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">✅ Aucun produit en alerte. Tout le stock est au-dessus du seuil.</td></tr>
              ) : liste.map((p) => (
                <tr key={p.id}>
                  <td className="fw-600">{p.reference}</td>
                  <td>{p.designation}</td>
                  <td>{p.categorie?.nom}</td>
                  <td className="text-center fw-600">{p.quantiteStock}</td>
                  <td className="text-center">{p.seuilAlerte}</td>
                  <td>
                    {p.quantiteStock === 0
                      ? <span className="badge badge-danger">Rupture de stock</span>
                      : <span className="badge badge-warning">Stock faible</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
