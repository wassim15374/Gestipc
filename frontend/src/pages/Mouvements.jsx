import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Mouvements() {
  const { aRole } = useAuth();
  const peutAjuster = aRole('admin', 'magasinier');
  const [liste, setListe] = useState([]);
  const [produits, setProduits] = useState([]);
  const [filtreType, setFiltreType] = useState('');
  const [modal, setModal] = useState(false);
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState({ produitId: '', type: 'entree', quantite: 1, motif: '' });

  const charger = () => {
    const params = {};
    if (filtreType) params.type = filtreType;
    api.get('/mouvements', { params }).then((r) => setListe(r.data));
  };
  useEffect(() => { charger(); }, [filtreType]);
  useEffect(() => { api.get('/produits').then((r) => setProduits(r.data)); }, []);

  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    try {
      await api.post('/mouvements', { ...form, quantite: Number(form.quantite), produitId: Number(form.produitId) });
      setModal(false); setForm({ produitId: '', type: 'entree', quantite: 1, motif: '' });
      charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };

  const formaterDate = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div>
      <h1 className="page-title">Mouvements de stock</h1>
      <p className="page-subtitle">Historique des entrées et sorties</p>
      <div className="toolbar">
        <select className="form-control" style={{ maxWidth: 200 }} value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
          <option value="">Tous les mouvements</option>
          <option value="entree">Entrées</option>
          <option value="sortie">Sorties</option>
        </select>
        <div className="spacer" />
        {peutAjuster && <button className="btn btn-primary" onClick={() => { setErreur(''); setModal(true); }}>+ Ajustement d'inventaire</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Produit</th><th>Type</th><th className="text-center">Quantité</th><th>Motif</th><th>Opérateur</th></tr></thead>
            <tbody>
              {liste.map((m) => (
                <tr key={m.id}>
                  <td className="text-muted">{formaterDate(m.date)}</td>
                  <td className="fw-600">{m.produit?.designation}</td>
                  <td>
                    {m.type === 'entree'
                      ? <span className="badge badge-success">▲ Entrée</span>
                      : <span className="badge badge-danger">▼ Sortie</span>}
                  </td>
                  <td className="text-center fw-600">{m.type === 'entree' ? '+' : '-'}{m.quantite}</td>
                  <td className="text-muted">{m.motif}</td>
                  <td className="text-muted">{m.utilisateur?.prenom} {m.utilisateur?.nom}</td>
                </tr>
              ))}
              {liste.length === 0 && <tr><td colSpan={6} className="empty-state">Aucun mouvement.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre="Ajustement d'inventaire" onClose={() => setModal(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Produit *</label>
                <select className="form-control" value={form.produitId} required onChange={(e) => setForm({ ...form, produitId: e.target.value })}>
                  <option value="">— Choisir —</option>
                  {produits.map((p) => <option key={p.id} value={p.id}>{p.designation} (stock {p.quantiteStock})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="entree">Entrée (+)</option>
                    <option value="sortie">Sortie (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantité *</label>
                  <input type="number" min="1" className="form-control" value={form.quantite} required onChange={(e) => setForm({ ...form, quantite: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Motif</label>
                <input className="form-control" value={form.motif} placeholder="Ex : correction d'inventaire, casse, retour…" onChange={(e) => setForm({ ...form, motif: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary">Valider</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
