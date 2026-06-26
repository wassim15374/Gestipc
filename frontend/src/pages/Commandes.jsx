import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Commandes() {
  const { aRole } = useAuth();
  const peutGerer = aRole('admin', 'magasinier');
  const [commandes, setCommandes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [erreur, setErreur] = useState('');

  const [fournisseurId, setFournisseurId] = useState('');
  const [lignes, setLignes] = useState([{ produitId: '', quantite: 1, prixUnitaire: 0 }]);

  const charger = () => api.get('/commandes').then((r) => setCommandes(r.data));
  useEffect(() => {
    charger();
    api.get('/fournisseurs').then((r) => setFournisseurs(r.data));
    api.get('/produits').then((r) => setProduits(r.data));
  }, []);

  const ouvrir = () => {
    setFournisseurId(''); setLignes([{ produitId: '', quantite: 1, prixUnitaire: 0 }]); setErreur(''); setModal(true);
  };

  const majLigne = (i, champ, valeur) => {
    const copie = [...lignes];
    copie[i][champ] = valeur;
    if (champ === 'produitId') {
      const p = produits.find((x) => x.id === Number(valeur));
      if (p) copie[i].prixUnitaire = Number(p.prixAchat);
    }
    setLignes(copie);
  };
  const ajouterLigne = () => setLignes([...lignes, { produitId: '', quantite: 1, prixUnitaire: 0 }]);
  const retirerLigne = (i) => setLignes(lignes.filter((_, idx) => idx !== i));
  const total = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);

  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    const valides = lignes.filter((l) => l.produitId && l.quantite > 0);
    if (!fournisseurId || valides.length === 0) { setErreur('Sélectionnez un fournisseur et au moins un produit.'); return; }
    try {
      await api.post('/commandes', {
        fournisseurId,
        lignes: valides.map((l) => ({ produitId: Number(l.produitId), quantite: Number(l.quantite), prixUnitaire: Number(l.prixUnitaire) })),
      });
      setModal(false); charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };

  const receptionner = async (c) => {
    if (!window.confirm(`Réceptionner la commande ${c.reference} ? Le stock sera mis à jour.`)) return;
    try { await api.put(`/commandes/${c.id}/reception`); charger(); api.get('/produits').then((r) => setProduits(r.data)); }
    catch (err) { alert(err.response?.data?.message || 'Erreur.'); }
  };

  const voirDetail = async (id) => { const { data } = await api.get(`/commandes/${id}`); setDetail(data); };

  const badgeStatut = (s) => {
    const map = { en_attente: ['badge-warning', 'En attente'], recue: ['badge-success', 'Reçue'], annulee: ['badge-danger', 'Annulée'] };
    const [cls, txt] = map[s] || ['badge-gray', s];
    return <span className={`badge ${cls}`}>{txt}</span>;
  };

  return (
    <div>
      <h1 className="page-title">Commandes fournisseurs</h1>
      <p className="page-subtitle">Approvisionnement du stock</p>
      <div className="toolbar">
        <div className="spacer" />
        {peutGerer && <button className="btn btn-primary" onClick={ouvrir}>+ Nouvelle commande</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Référence</th><th>Date</th><th>Fournisseur</th><th className="text-right">Montant</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id}>
                  <td className="fw-600">{c.reference}</td>
                  <td>{c.date}</td>
                  <td>{c.fournisseur?.nom}</td>
                  <td className="text-right fw-600">{Number(c.montantTotal).toFixed(2)} TND</td>
                  <td>{badgeStatut(c.statut)}</td>
                  <td><div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => voirDetail(c.id)}>👁️ Détail</button>
                    {peutGerer && c.statut === 'en_attente' && (
                      <button className="btn btn-success btn-sm" onClick={() => receptionner(c)}>📥 Réceptionner</button>
                    )}
                  </div></td>
                </tr>
              ))}
              {commandes.length === 0 && <tr><td colSpan={6} className="empty-state">Aucune commande.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {modal && (
        <Modal titre="Nouvelle commande fournisseur" onClose={() => setModal(false)} large>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Fournisseur *</label>
                <select className="form-control" value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)} required>
                  <option value="">— Choisir —</option>
                  {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <label className="fw-600">Lignes de la commande</label>
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>Produit</th><th style={{ width: 90 }}>Qté</th><th style={{ width: 120 }}>P.U. achat</th><th style={{ width: 110 }} className="text-right">Sous-total</th><th></th></tr></thead>
                <tbody>
                  {lignes.map((l, i) => (
                    <tr key={i}>
                      <td>
                        <select className="form-control" value={l.produitId} onChange={(e) => majLigne(i, 'produitId', e.target.value)}>
                          <option value="">— Produit —</option>
                          {produits.map((p) => <option key={p.id} value={p.id}>{p.designation}</option>)}
                        </select>
                      </td>
                      <td><input type="number" min="1" className="form-control" value={l.quantite} onChange={(e) => majLigne(i, 'quantite', e.target.value)} /></td>
                      <td><input type="number" step="0.001" className="form-control" value={l.prixUnitaire} onChange={(e) => majLigne(i, 'prixUnitaire', e.target.value)} /></td>
                      <td className="text-right">{(l.quantite * l.prixUnitaire).toFixed(2)}</td>
                      <td>{lignes.length > 1 && <button type="button" className="btn btn-outline btn-sm" onClick={() => retirerLigne(i)}>✕</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn btn-outline btn-sm mt-2" onClick={ajouterLigne}>+ Ajouter une ligne</button>
              <div className="text-right mt-2" style={{ fontSize: 18, fontWeight: 700 }}>Total : {total.toFixed(2)} TND</div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary">Enregistrer la commande</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de détail */}
      {detail && (
        <Modal titre={`Commande ${detail.reference}`} onClose={() => setDetail(null)} large>
          <div className="modal-body">
            <p><b>Fournisseur :</b> {detail.fournisseur?.nom}</p>
            <p><b>Date :</b> {detail.date} &nbsp; | &nbsp; <b>Statut :</b> {badgeStatut(detail.statut)}</p>
            <table className="mt-2">
              <thead><tr><th>Produit</th><th className="text-center">Qté</th><th className="text-right">P.U.</th><th className="text-right">Sous-total</th></tr></thead>
              <tbody>
                {detail.lignes?.map((l) => (
                  <tr key={l.id}>
                    <td>{l.produit?.designation}</td>
                    <td className="text-center">{l.quantite}</td>
                    <td className="text-right">{Number(l.prixUnitaire).toFixed(2)}</td>
                    <td className="text-right">{(l.quantite * l.prixUnitaire).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2 fw-600">Total : {Number(detail.montantTotal).toFixed(2)} TND</div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setDetail(null)}>Fermer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
