// src/components/ItemModal.jsx
import React from 'react'
import { Modal, Button, Badge } from 'react-bootstrap'
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function ItemModal({ show, onHide, item, onEdit, onDownloadPdf }) {
  const { id: myId, role } = useAuth()
  const navigate = useNavigate()

  if (!item) return null

  const ownerId =
    (item.owner && item.owner.toString && item.owner.toString()) ||
    (item.userId && item.userId.toString && item.userId.toString()) ||
    (item.sellerId && item.sellerId.toString && item.sellerId.toString()) ||
    null

  const isAdmin = role === 'admin'
  const isSeller = role === 'seller'
  const isOwner = !!(ownerId && myId && ownerId === myId)
  const canEdit = isAdmin || (isSeller && isOwner)

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-5">
            {item.coverImageFile || item.coverImageLink ? (
              <img src={item.coverImageFile || item.coverImageLink} className="img-fluid" alt={item.title} />
            ) : <div className="bg-light p-5 text-center">No image</div>}

            <div className="mt-2">
              <Badge bg="info" className="me-1">₹{item.price ?? 0}</Badge>{' '}
              <Badge bg={(item.stockQty ?? 0) > 0 ? 'success' : 'secondary'}>
                {item.stockQty ?? 0} in stock
              </Badge>
            </div>
          </div>

          <div className="col-md-7">
            <p><strong>Author:</strong> {item.author}</p>
            <p><strong>Genre:</strong> {item.genre}</p>
            <p>{item.description}</p>

            {item.pdfFile && (
              <div className="mt-3">
                <Button variant="outline-primary" size="sm" href={item.pdfFile} target="_blank" rel="noreferrer">Open PDF</Button>{' '}
                <Button variant="outline-secondary" size="sm" onClick={() => onDownloadPdf && onDownloadPdf(item)}>Download PDF</Button>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {canEdit && (
          <Button variant="warning" onClick={() => {
            // prefer onEdit prop; fallback to navigate /edit/:id
            if (typeof onEdit === 'function') return onEdit(item)
            navigate && navigate(`/edit/${item._id}`)
          }}>
            Edit
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
