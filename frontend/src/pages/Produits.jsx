import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const champsVides = {
  reference: '', designation: '', description: '',
  prixAchat: '', prixVente: '', seuilAlerte: 5,
  categorieId: '', marqueId: '', quantiteStock: 0,
};

export default function Produits() {
  const { aRole } = useAuth();
  const peutEcrire = aRole('admin', 'magasinier');
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreCat, setFiltreCat] = useState('');
  const [chargement, setChargement] = useState(true);

  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState(champsVides);
  const [editionId, setEditionId] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    setChargement(true);
    const params = {};
    if (recherche) params.recherche = recherche;
    if (filtreCat) params.categorie = filtreCat;
    const { data } = await api.get('/produits', { params });
    setProduits(data);
    setChargement(false);
  }, [recherche, filtreCat]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
    api.get('/marques').then((r) => setMarques(r.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(charger, 250);
    return () => clearTimeout(t);
  }, [charger]);

  const ouvrirCreation = () => {
    setForm(champsVides); setEditionId(null); setErreur(''); setModalOuvert(true);
  };
  const ouvrirEdition = (p) => {
    setForm({
      reference: p.reference, designation: p.designation, description: p.description || '',
      prixAchat: p.prixAchat, prixVente: p.prixVente, seuilAlerte: p.seuilAlerte,
      categorieId: p.categorieId, marqueId: p.marqueId,
    });
    setEditionId(p.id); setErreur(''); setModalOuvert(true);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      if (editionId) await api.put(`/produits/${editionId}`, form);
      else await api.post('/produits', form);
      setModalOuvert(false);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  const supprimer = async (p) => {
    if (!window.confirm(`Supprimer le produit « ${p.designation} » ?`)) return;
    try { await api.delete(`/produits/${p.id}`); charger(); }
    catch (err) { alert(err.response?.data?.message || 'Suppression impossible.'); }
  };

  const badgeStock = (p) => {
    if (p.quantiteStock === 0) return <span className="badge badge-danger">Rupture</span>;
    if (p.quantiteStock <= p.seuilAlerte) return <span className="badge badge-warning">Stock faible</span>;
    return <span className="badge badge-success">En stock</span>;
  };

  return (
    <div>
      <h1 className="page-title">Produits</h1>
      <p className="page-subtitle">Catalogue des composants et accessoires</p>

      <div className="toolbar">
        <input
          className="form-control search-input" placeholder="🔍 Rechercher (réf. ou désignation)…"
          value={recherche} onChange={(e) => setRecherche(e.target.value)}
        />
        <select className="form-control" style={{ maxWidth: 220 }} value={filtreCat} onChange={(e) => setFiltreCat(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <div className="spacer" />
        {peutEcrire && <button className="btn btn-primary" onClick={ouvrirCreation}>+ Nouveau produit</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Référence</th><th>Désignation</th><th>Catégorie</th><th>Marque</th>
                <th className="text-right">Prix vente</th><th className="text-center">Stock</th>
                <th>État</th>{peutEcrire && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {chargement ? (
                <tr><td colSpan={8} className="empty-state">Chargement…</td></tr>
              ) : produits.length === 0 ? (
                <tr><td colSpan={8} className="empty-state">Aucun produit trouvé.</td></tr>
              ) : produits.map((p) => (
                <tr key={p.id}>
                  <td className="fw-600">{p.reference}</td>
                  <td>{p.designation}</td>
                  <td>{p.categorie?.nom}</td>
                  <td>{p.marque?.nom}</td>
                  <td className="text-right">{Number(p.prixVente).toFixed(2)} TND</td>
                  <td className="text-center fw-600">{p.quantiteStock}</td>
                  <td>{badgeStock(p)}</td>
                  {peutEcrire && (
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => ouvrirEdition(p)}>✏️</button>
                        {aRole('admin') && <button className="btn btn-outline btn-sm" onClick={() => supprimer(p)}>🗑️</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOuvert && (
        <Modal titre={editionId ? 'Modifier le produit' : 'Nouveau produit'} onClose={() => setModalOuvert(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Référence *</label>
                  <input className="form-control" value={form.reference} required
                    onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Désignation *</label>
                  <input className="form-control" value={form.designation} required
                    onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select className="form-control" value={form.categorieId} required
                    onChange={(e) => setForm({ ...form, categorieId: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marque *</label>
                  <select className="form-control" value={form.marqueId} required
                    onChange={(e) => setForm({ ...form, marqueId: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {marques.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix d'achat (TND) *</label>
                  <input type="number" step="0.001" className="form-control" value={form.prixAchat} required
                    onChange={(e) => setForm({ ...form, prixAchat: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Prix de vente (TND) *</label>
                  <input type="number" step="0.001" className="form-control" value={form.prixVente} required
                    onChange={(e) => setForm({ ...form, prixVente: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Seuil d'alerte</label>
                  <input type="number" className="form-control" value={form.seuilAlerte}
                    onChange={(e) => setForm({ ...form, seuilAlerte: e.target.value })} />
                </div>
                {!editionId && (
                  <div className="form-group">
                    <label>Stock initial</label>
                    <input type="number" className="form-control" value={form.quantiteStock}
                      onChange={(e) => setForm({ ...form, quantiteStock: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModalOuvert(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
