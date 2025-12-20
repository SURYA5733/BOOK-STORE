import React, { useState, useEffect } from 'react'
import api from '../api'
import { tSuccess, tError } from '../toast'
import { useNavigate } from 'react-router-dom'

export default function ItemForm({ initial = {}, isEdit = false }) {
  const [title, setTitle] = useState(initial.title || '')
  const [author, setAuthor] = useState(initial.author || '')
  const [genre, setGenre] = useState(initial.genre || '')
  const [description, setDescription] = useState(initial.description || '')
  const [price, setPrice] = useState(initial.price ?? '')
  const [stockQty, setStockQty] = useState(initial.stockQty ?? 0)
  const [coverLink, setCoverLink] = useState(initial.coverImageLink || '')
  const [coverFile, setCoverFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=> {
    setErrors({})
  }, [title, author, genre, price, stockQty])

  function validate() {
    const e = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!author.trim()) e.author = 'Author is required'
    if (!genre.trim()) e.genre = 'Genre is required'
    if (price !== '' && (isNaN(Number(price)) || Number(price) < 0)) e.price = 'Price must be a non-negative number'
    if (stockQty !== '' && (!Number.isInteger(Number(stockQty)) || Number(stockQty) < 0)) e.stockQty = 'Stock must be a non-negative integer'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const eObj = validate()
    if (Object.keys(eObj).length) { setErrors(eObj); window.scrollTo({top:0, behavior:'smooth'}); return }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('author', author)
      form.append('genre', genre)
      form.append('description', description)
      form.append('price', price)
      form.append('stockQty', stockQty)
      form.append('coverImageLink', coverLink)
      if (coverFile) form.append('coverImageFile', coverFile)
      if (pdfFile) form.append('pdfFile', pdfFile)

      let res
      if (isEdit && initial._id) {
        res = await api.put(`/items/${initial._id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        res = await api.post('/items', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      }

      const data = res.data
      navigate(`/item/${data._id}`)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || err.message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={title} onChange={e=>setTitle(e.target.value)} />
            <div className="invalid-feedback">{errors.title}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Author *</label>
            <input className={`form-control ${errors.author ? 'is-invalid' : ''}`} value={author} onChange={e=>setAuthor(e.target.value)} />
            <div className="invalid-feedback">{errors.author}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Genre *</label>
            <input className={`form-control ${errors.genre ? 'is-invalid' : ''}`} value={genre} onChange={e=>setGenre(e.target.value)} />
            <div className="invalid-feedback">{errors.genre}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="5" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">Price (₹)</label>
            <input type="number" className={`form-control ${errors.price ? 'is-invalid' : ''}`} value={price} onChange={e=>setPrice(e.target.value)} />
            <div className="invalid-feedback">{errors.price}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Stock Quantity</label>
            <input type="number" className={`form-control ${errors.stockQty ? 'is-invalid' : ''}`} value={stockQty} onChange={e=>setStockQty(e.target.value)} />
            <div className="invalid-feedback">{errors.stockQty}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Cover Image Link</label>
            <input className="form-control" value={coverLink} onChange={e=>setCoverLink(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Or Upload Cover Image</label>
            <input type="file" className="form-control" accept="image/*" onChange={e=>setCoverFile(e.target.files[0])} />
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Book PDF (optional)</label>
            <input type="file" className="form-control" accept="application/pdf" onChange={e=>setPdfFile(e.target.files[0])} />
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Book' : 'Add Book')}</button>
        <button type="button" className="btn btn-secondary" onClick={()=>window.history.back()}>Cancel</button>
      </div>
    </form>
  )
}
