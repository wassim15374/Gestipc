/**
 * Composant de fenêtre modale réutilisable (formulaires de création/édition).
 */
export default function Modal({ titre, onClose, children, large }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${large ? 'modal-lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titre}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
