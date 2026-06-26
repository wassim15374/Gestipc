import { useEffect, useState } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const vide = { nom: '', prenom: '', email: '', motDePasse: '', role: 'magasinier' };

export default function Utilisateurs() {
  const [liste, setListe] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(vide);
  const [editId, setEditId] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = () => api.get('/utilisateurs').then((r) => setListe(r.data));
  useEffect(() => { charger(); }, []);

  const ouvrir = (u = null) => {
    setForm(u ? { nom: u.nom, prenom: u.prenom, email: u.email, motDePasse: '', role: u.role } : vide);
    setEditId(u?.id || null); setErreur(''); setModal(true);
  };
  const soumettre = async (e) => {
    e.preventDefault(); setErreur('');
    try {
      if (editId) {
        const donnees = { ...form };
        if (!donnees.motDePasse) delete donnees.motDePasse;
        await api.put(`/utilisateurs/${editId}`, donnees);
      } else {
        await api.post('/utilisateurs', form);
      }
      setModal(false); charger();
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur.'); }
  };
  const supprimer = async (u) => {
    if (!window.confirm(`Supprimer l'utilisateur « ${u.prenom} ${u.nom} » ?`)) return;
    try { await api.delete(`/utilisateurs/${u.id}`); charger(); }
    catch (err) { alert(err.response?.data?.message || 'Suppression impossible.'); }
  };

  const badgeRole = (r) => {
    const map = { admin: 'badge-danger', magasinier: 'badge-info', gerant: 'badge-warning' };
    return <span className={`badge ${map[r] || 'badge-gray'}`}>{r}</span>;
  };

  return (
    <div>
      <h1 className="page-title">Utilisateurs</h1>
      <p className="page-subtitle">Gestion des comptes et des rôles</p>
      <div className="toolbar">
        <div className="spacer" />
        <button className="btn btn-primary" onClick={() => ouvrir()}>+ Nouvel utilisateur</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Rôle</th><th>État</th><th>Actions</th></tr></thead>
            <tbody>
              {liste.map((u) => (
                <tr key={u.id}>
                  <td className="fw-600">{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>{badgeRole(u.role)}</td>
                  <td>{u.actif ? <span className="badge badge-success">Actif</span> : <span className="badge badge-gray">Désactivé</span>}</td>
                  <td><div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => ouvrir(u)}>✏️</button>
                    <button className="btn btn-outline btn-sm" onClick={() => supprimer(u)}>🗑️</button>
                  </div></td>
                </tr>
              ))}
              {liste.length === 0 && <tr><td colSpan={6} className="empty-state">Aucun utilisateur.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal titre={editId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'} onClose={() => setModal(false)}>
          <form onSubmit={soumettre}>
            <div className="modal-body">
              {erreur && <div className="alert alert-error">{erreur}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input className="form-control" value={form.nom} required onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input className="form-control" value={form.prenom} required onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" className="form-control" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mot de passe {editId && '(laisser vide si inchangé)'}</label>
                  <input type="password" className="form-control" value={form.motDePasse} required={!editId} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rôle *</label>
                  <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="admin">Administrateur</option>
                    <option value="magasinier">Magasinier</option>
                    <option value="gerant">Gérant</option>
                  </select>
                </div>
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
