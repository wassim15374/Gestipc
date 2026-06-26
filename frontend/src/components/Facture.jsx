/**
 * Facture imprimable d'une vente. Le bouton « Imprimer » déclenche
 * l'impression du navigateur ; une règle @media print (index.css)
 * masque l'interface et ne conserve que la zone facture.
 */
export default function Facture({ vente, onClose }) {
  const sousTotal = (l) => l.quantite * l.prixUnitaire * (1 - (l.remise || 0) / 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <h2>Facture {vente.reference}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Imprimer</button>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="modal-body">
          <div className="facture-imprimable" id="facture">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>⚡ GestiPC</div>
                <div className="text-muted">Composants &amp; accessoires informatiques</div>
                <div className="text-muted">Tunis, Tunisie</div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: 20, fontWeight: 700 }}>FACTURE</div>
                <div className="fw-600">{vente.reference}</div>
                <div className="text-muted">Date : {vente.date}</div>
                <div className="text-muted">Statut : {vente.statut}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 20 }}>
              <div className="text-muted" style={{ fontSize: 12 }}>FACTURÉ À</div>
              <div className="fw-600">{vente.client?.nom}</div>
              {vente.client?.adresse && <div className="text-muted">{vente.client.adresse}</div>}
              {vente.client?.telephone && <div className="text-muted">Tél : {vente.client.telephone}</div>}
            </div>

            <table>
              <thead>
                <tr><th>Désignation</th><th className="text-center">Qté</th><th className="text-right">P.U.</th><th className="text-center">Remise</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {vente.lignes?.map((l) => (
                  <tr key={l.id}>
                    <td>{l.produit?.designation}</td>
                    <td className="text-center">{l.quantite}</td>
                    <td className="text-right">{Number(l.prixUnitaire).toFixed(2)}</td>
                    <td className="text-center">{Number(l.remise) > 0 ? `${l.remise}%` : '—'}</td>
                    <td className="text-right">{sousTotal(l).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right" style={{ marginTop: 18, fontSize: 18, fontWeight: 700 }}>
              Montant total : {Number(vente.montantTotal).toFixed(2)} TND
            </div>

            <div className="text-center text-muted" style={{ marginTop: 30, fontSize: 12 }}>
              Merci de votre confiance — GestiPC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
