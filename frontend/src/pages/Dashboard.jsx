import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import api from '../services/api';

const COULEURS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d', '#ca8a04', '#475569', '#0d9488'];

const formaterDinar = (v) => `${Number(v).toLocaleString('fr-TN', { minimumFractionDigits: 0 })} TND`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ventes, setVentes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/statistiques'),
      api.get('/dashboard/ventes-mensuelles'),
      api.get('/dashboard/repartition-categories'),
    ]).then(([s, v, c]) => {
      setStats(s.data);
      setVentes(v.data);
      setCategories(c.data);
    });
  }, []);

  if (!stats) return <div className="loading">Chargement du tableau de bord…</div>;

  const kpis = [
    { label: 'Produits référencés', value: stats.nbProduits, icon: '💻', couleur: 'bg-blue' },
    { label: 'Valeur du stock (achat)', value: formaterDinar(stats.valeurStockAchat), icon: '💰', couleur: 'bg-green' },
    { label: 'Chiffre d\'affaires', value: formaterDinar(stats.chiffreAffaires), icon: '📈', couleur: 'bg-blue' },
    { label: 'Produits en alerte', value: stats.nbAlertes, icon: '⚠️', couleur: 'bg-red' },
    { label: 'Clients', value: stats.nbClients, icon: '👥', couleur: 'bg-orange' },
    { label: 'Commandes en attente', value: stats.nbCommandesEnAttente, icon: '📦', couleur: 'bg-orange' },
  ];

  return (
    <div>
      <h1 className="page-title">Tableau de bord</h1>
      <p className="page-subtitle">Vue d'ensemble de l'activité du magasin</p>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className={`kpi-icon ${k.couleur}`}>{k.icon}</div>
            <div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h2>Évolution des ventes ({new Date().getFullYear()})</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mois" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => formaterDinar(v)} />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} name="Ventes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Répartition par catégorie</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories} dataKey="nombre" nameKey="categorie"
                  cx="50%" cy="50%" outerRadius={90} label={(e) => e.nombre}
                >
                  {categories.map((c, i) => <Cell key={i} fill={COULEURS[i % COULEURS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
