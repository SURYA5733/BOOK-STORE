// src/components/DeleteConfirmModal.jsx
import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default function DeleteConfirmModal({ show, onHide, onConfirm, item, deleting=false }) {
  // show modal even if item is null to allow animation/closing; but render content conditionally
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{item ? `Delete "${item.title}"` : 'Delete item'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {item ? 'Are you sure you want to delete this book? This cannot be undone.' : 'Preparing to delete...'}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={deleting}>Cancel</Button>
        <Button variant="danger" onClick={() => item && onConfirm(item._id)} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
