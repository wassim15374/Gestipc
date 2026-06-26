import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const vide = { nom: '', telephone: '', email: '', adresse: '' };

export default function Clients() {
  const { aRole } = useAuth();
  const peutEcrire = aRole('admin', 'magasinier');
  const [liste, setListe] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vide);
  const [editId, setEditId] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = () => api.get('/clients').then((r) => setListe(r.data));
  useEffect(() => { charger(); }, []);

  const ouvrir = (c = null) => {
    setForm(c ? { nom: c.nom, telephone: c.telephone || '', email: c.email || '', adresse: c.adresse || '' } : vide);
    setEditId(c?.id || null); setErreur(''); setModal(true);
  };
  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    try {
      if (editId) await api.put(`/clients/${editId}`, form);
      else await api.post('/clients', form);
      setModal(false); charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };
  const supprimer = async (c) => {
    if (!window.confirm(`Supprimer « ${c.nom} » ?`)) return;
    try { await api.delete(`/clients/${c.id}`); charger(); }
    catch (err) { alert(err.response?.data?.message || 'Suppression impossible.'); }
  };

  return (
    <div>
      <h1 className="page-title">Clients</h1>
      <p className="page-subtitle">Fichier clients du magasin</p>
      <div className="toolbar">
        <div className="spacer" />
        {peutEcrire && <button className="btn btn-primary" onClick={() => ouvrir()}>+ Nouveau client</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nom / Raison sociale</th><th>Téléphone</th><th>Email</th><th>Adresse</th>{peutEcrire && <th>Actions</th>}</tr></thead>
            <tbody>
              {liste.map((c) => (
                <tr key={c.id}>
                  <td className="fw-600">{c.nom}</td>
                  <td>{c.telephone}</td>
                  <td className="text-muted">{c.email}</td>
                  <td className="text-muted">{c.adresse}</td>
                  {peutEcrire && (
                    <td><div className="actions">
                      <button className="btn btn-outline btn-sm" onClick={() => ouvrir(c)}>✏️</button>
                      {aRole('admin') && <button className="btn btn-outline btn-sm" onClick={() => supprimer(c)}>🗑️</button>}
                    </div></td>
                  )}
                </tr>
              ))}
              {liste.length === 0 && <tr><td colSpan={5} className="empty-state">Aucun client.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre={editId ? 'Modifier le client' : 'Nouveau client'} onClose={() => setModal(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Nom / Raison sociale *</label>
                <input className="form-control" value={form.nom} required onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input className="form-control" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
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
