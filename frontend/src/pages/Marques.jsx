import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Marques() {
  const { aRole } = useAuth();
  const admin = aRole('admin');
  const [liste, setListe] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom: '' });
  const [editId, setEditId] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = () => api.get('/marques').then((r) => setListe(r.data));
  useEffect(() => { charger(); }, []);

  const ouvrir = (m = null) => { setForm({ nom: m?.nom || '' }); setEditId(m?.id || null); setErreur(''); setModal(true); };
  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    try {
      if (editId) await api.put(`/marques/${editId}`, form);
      else await api.post('/marques', form);
      setModal(false); charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };
  const supprimer = async (m) => {
    if (!window.confirm(`Supprimer « ${m.nom} » ?`)) return;
    try { await api.delete(`/marques/${m.id}`); charger(); }
    catch (err) { alert(err.response?.data?.message || 'Suppression impossible.'); }
  };

  return (
    <div>
      <h1 className="page-title">Marques</h1>
      <p className="page-subtitle">Fabricants des produits</p>
      <div className="toolbar">
        <div className="spacer" />
        {admin && <button className="btn btn-primary" onClick={() => ouvrir()}>+ Nouvelle marque</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nom</th>{admin && <th>Actions</th>}</tr></thead>
            <tbody>
              {liste.map((m) => (
                <tr key={m.id}>
                  <td className="fw-600">{m.nom}</td>
                  {admin && (
                    <td><div className="actions">
                      <button className="btn btn-outline btn-sm" onClick={() => ouvrir(m)}>✏️</button>
                      <button className="btn btn-outline btn-sm" onClick={() => supprimer(m)}>🗑️</button>
                    </div></td>
                  )}
                </tr>
              ))}
              {liste.length === 0 && <tr><td colSpan={2} className="empty-state">Aucune marque.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre={editId ? 'Modifier la marque' : 'Nouvelle marque'} onClose={() => setModal(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-group">
                <label>Nom *</label>
                <input className="form-control" value={form.nom} required
                  onChange={(e) => setForm({ nom: e.target.value })} />
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
