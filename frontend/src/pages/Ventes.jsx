import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Facture from '../components/Facture';
import { useAuth } from '../context/AuthContext';

export default function Ventes() {
  const { aRole } = useAuth();
  const peutVendre = aRole('admin', 'magasinier');
  const [ventes, setVentes] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [modal, setModal] = useState(false);
  const [erreur, setErreur] = useState('');
  const [factureVente, setFactureVente] = useState(null);

  // Formulaire de vente
  const [clientId, setClientId] = useState('');
  const [lignes, setLignes] = useState([{ produitId: '', quantite: 1, prixUnitaire: 0, remise: 0 }]);

  const charger = () => api.get('/ventes').then((r) => setVentes(r.data));
  useEffect(() => {
    charger();
    api.get('/clients').then((r) => setClients(r.data));
    api.get('/produits').then((r) => setProduits(r.data));
  }, []);

  const ouvrir = () => {
    setClientId(''); setLignes([{ produitId: '', quantite: 1, prixUnitaire: 0, remise: 0 }]);
    setErreur(''); setModal(true);
  };

  const majLigne = (i, champ, valeur) => {
    const copie = [...lignes];
    copie[i][champ] = valeur;
    // Pré-remplit le prix de vente quand on choisit un produit
    if (champ === 'produitId') {
      const p = produits.find((x) => x.id === Number(valeur));
      if (p) copie[i].prixUnitaire = Number(p.prixVente);
    }
    setLignes(copie);
  };
  const ajouterLigne = () => setLignes([...lignes, { produitId: '', quantite: 1, prixUnitaire: 0, remise: 0 }]);
  const retirerLigne = (i) => setLignes(lignes.filter((_, idx) => idx !== i));

  const total = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * (1 - (l.remise || 0) / 100), 0);

  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    const lignesValides = lignes.filter((l) => l.produitId && l.quantite > 0);
    if (!clientId || lignesValides.length === 0) {
      setErreur('Sélectionnez un client et au moins un produit.');
      return;
    }
    try {
      const { data } = await api.post('/ventes', {
        clientId,
        lignes: lignesValides.map((l) => ({
          produitId: Number(l.produitId), quantite: Number(l.quantite),
          prixUnitaire: Number(l.prixUnitaire), remise: Number(l.remise) || 0,
        })),
      });
      setModal(false);
      charger();
      api.get('/produits').then((r) => setProduits(r.data)); // rafraîchit le stock
      voirFacture(data.id);
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur lors de la vente.'); }
  };

  const voirFacture = async (id) => {
    const { data } = await api.get(`/ventes/${id}`);
    setFactureVente(data);
  };

  const badgeStatut = (s) => {
    const map = { payee: ['badge-success', 'Payée'], en_attente: ['badge-warning', 'En attente'], annulee: ['badge-danger', 'Annulée'] };
    const [cls, txt] = map[s] || ['badge-gray', s];
    return <span className={`badge ${cls}`}>{txt}</span>;
  };

  return (
    <div>
      <h1 className="page-title">Ventes</h1>
      <p className="page-subtitle">Factures et opérations de vente</p>
      <div className="toolbar">
        <div className="spacer" />
        {peutVendre && <button className="btn btn-primary" onClick={ouvrir}>+ Nouvelle vente</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Facture</th><th>Date</th><th>Client</th><th>Vendeur</th><th className="text-right">Montant</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {ventes.map((v) => (
                <tr key={v.id}>
                  <td className="fw-600">{v.reference}</td>
                  <td>{v.date}</td>
                  <td>{v.client?.nom}</td>
                  <td className="text-muted">{v.utilisateur?.prenom} {v.utilisateur?.nom}</td>
                  <td className="text-right fw-600">{Number(v.montantTotal).toFixed(2)} TND</td>
                  <td>{badgeStatut(v.statut)}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => voirFacture(v.id)}>🧾 Facture</button></td>
                </tr>
              ))}
              {ventes.length === 0 && <tr><td colSpan={7} className="empty-state">Aucune vente.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre="Nouvelle vente" onClose={() => setModal(false)} large>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Client *</label>
                <select className="form-control" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                  <option value="">— Choisir un client —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>

              <label className="fw-600">Lignes de la vente</label>
              <table style={{ marginTop: 8 }}>
                <thead>
                  <tr><th>Produit</th><th style={{ width: 80 }}>Qté</th><th style={{ width: 110 }}>P.U. (TND)</th><th style={{ width: 90 }}>Remise %</th><th style={{ width: 110 }} className="text-right">Sous-total</th><th></th></tr>
                </thead>
                <tbody>
                  {lignes.map((l, i) => (
                    <tr key={i}>
                      <td>
                        <select className="form-control" value={l.produitId} onChange={(e) => majLigne(i, 'produitId', e.target.value)}>
                          <option value="">— Produit —</option>
                          {produits.map((p) => <option key={p.id} value={p.id}>{p.designation} (stock {p.quantiteStock})</option>)}
                        </select>
                      </td>
                      <td><input type="number" min="1" className="form-control" value={l.quantite} onChange={(e) => majLigne(i, 'quantite', e.target.value)} /></td>
                      <td><input type="number" step="0.001" className="form-control" value={l.prixUnitaire} onChange={(e) => majLigne(i, 'prixUnitaire', e.target.value)} /></td>
                      <td><input type="number" min="0" max="100" className="form-control" value={l.remise} onChange={(e) => majLigne(i, 'remise', e.target.value)} /></td>
                      <td className="text-right">{(l.quantite * l.prixUnitaire * (1 - (l.remise || 0) / 100)).toFixed(2)}</td>
                      <td>{lignes.length > 1 && <button type="button" className="btn btn-outline btn-sm" onClick={() => retirerLigne(i)}>✕</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="btn btn-outline btn-sm mt-2" onClick={ajouterLigne}>+ Ajouter une ligne</button>

              <div className="text-right mt-2" style={{ fontSize: 18, fontWeight: 700 }}>
                Total : {total.toFixed(2)} TND
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-success">Valider la vente</button>
            </div>
          </form>
        </Modal>
      )}

      {factureVente && <Facture vente={factureVente} onClose={() => setFactureVente(null)} />}
    </div>
  );
}
