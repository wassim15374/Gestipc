import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const vide = { nom: '', contact: '', telephone: '', email: '', adresse: '' };

export default function Fournisseurs() {
  const { aRole } = useAuth();
  const peutEcrire = aRole('admin', 'magasinier');
  const [liste, setListe] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vide);
  const [editId, setEditId] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = () => api.get('/fournisseurs').then((r) => setListe(r.data));
  useEffect(() => { charger(); }, []);

  const ouvrir = (f = null) => {
    setForm(f ? { nom: f.nom, contact: f.contact || '', telephone: f.telephone || '', email: f.email || '', adresse: f.adresse || '' } : vide);
    setEditId(f?.id || null); setErreur(''); setModal(true);
  };
  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    try {
      if (editId) await api.put(`/fournisseurs/${editId}`, form);
      else await api.post('/fournisseurs', form);
      setModal(false); charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };
  const supprimer = async (f) => {
    if (!window.confirm(`Supprimer « ${f.nom} » ?`)) return;
    try { await api.delete(`/fournisseurs/${f.id}`); charger(); }
    catch (err) { alert(err.response?.data?.message || 'Suppression impossible.'); }
  };

  return (
    <div>
      <h1 className="page-title">Fournisseurs</h1>
      <p className="page-subtitle">Partenaires d'approvisionnement</p>
      <div className="toolbar">
        <div className="spacer" />
        {peutEcrire && <button className="btn btn-primary" onClick={() => ouvrir()}>+ Nouveau fournisseur</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nom</th><th>Contact</th><th>Téléphone</th><th>Email</th><th>Adresse</th>{peutEcrire && <th>Actions</th>}</tr></thead>
            <tbody>
              {liste.map((f) => (
                <tr key={f.id}>
                  <td className="fw-600">{f.nom}</td>
                  <td>{f.contact}</td>
                  <td>{f.telephone}</td>
                  <td className="text-muted">{f.email}</td>
                  <td className="text-muted">{f.adresse}</td>
                  {peutEcrire && (
                    <td><div className="actions">
                      <button className="btn btn-outline btn-sm" onClick={() => ouvrir(f)}>✏️</button>
                      {aRole('admin') && <button className="btn btn-outline btn-sm" onClick={() => supprimer(f)}>🗑️</button>}
                    </div></td>
                  )}
                </tr>
              ))}
              {liste.length === 0 && <tr><td colSpan={6} className="empty-state">Aucun fournisseur.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre={editId ? 'Modifier le fournisseur' : 'Nouveau fournisseur'} onClose={() => setModal(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Nom *</label>
                <input className="form-control" value={form.nom} required onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Personne de contact</label>
                  <input className="form-control" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-control" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input className="form-control" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
