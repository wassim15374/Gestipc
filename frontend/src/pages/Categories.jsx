import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Categories() {
  const { aRole } = useAuth();
  const admin = aRole('admin');
  const [liste, setListe] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = () => api.get('/categories').then((r) => setListe(r.data));
  useEffect(() => { charger(); }, []);

  const ouvrir = (c = null) => {
    setForm(c ? { nom: c.nom, description: c.description || '' } : { nom: '', description: '' });
    setEditId(c?.id || null); setErreur(''); setModal(true);
  };
  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    try {
      if (editId) await api.put(`/categories/${editId}`, form);
      else await api.post('/categories', form);
      setModal(false); charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };
  const supprimer = async (c) => {
    if (!window.confirm(`Supprimer « ${c.nom} » ?`)) return;
    try { await api.delete(`/categories/${c.id}`); charger(); }
    catch (err) { alert(err.response?.data?.message || 'Suppression impossible.'); }
  };

  return (
    <div>
      <h1 className="page-title">Catégories</h1>
      <p className="page-subtitle">Familles de produits</p>
      <div className="toolbar">
        <div className="spacer" />
        {admin && <button className="btn btn-primary" onClick={() => ouvrir()}>+ Nouvelle catégorie</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nom</th><th>Description</th>{admin && <th>Actions</th>}</tr></thead>
            <tbody>
              {liste.map((c) => (
                <tr key={c.id}>
                  <td className="fw-600">{c.nom}</td>
                  <td className="text-muted">{c.description}</td>
                  {admin && (
                    <td><div className="actions">
                      <button className="btn btn-outline btn-sm" onClick={() => ouvrir(c)}>✏️</button>
                      <button className="btn btn-outline btn-sm" onClick={() => supprimer(c)}>🗑️</button>
                    </div></td>
                  )}
                </tr>
              ))}
              {liste.length === 0 && <tr><td colSpan={3} className="empty-state">Aucune catégorie.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre={editId ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onClose={() => setModal(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Nom *</label>
                <input className="form-control" value={form.nom} required
                  onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
