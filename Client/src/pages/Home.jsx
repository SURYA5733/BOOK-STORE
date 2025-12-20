// src/pages/Home.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../api'
import ItemCard from '../components/ItemCard'
import ItemModal from '../components/ItemModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import SkeletonGrid from '../components/SkeletonGrid'
import { Row, Col, Form, InputGroup, Button, Pagination } from 'react-bootstrap'
import { tError, tSuccess } from '../toast'

import HeroSection from '../components/HeroSection'
import TopCarousel from '../components/TopCarousel'
import CategoryCards from '../components/CategoryCards'
import { useLocation, useNavigate } from 'react-router-dom'

// debounce util
function useDebounced(value, delay = 400) {
  const [deb, setDeb] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return deb
}

const PAGE_SIZE = 9

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI state
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query, 450)
  const [genreFilter, setGenreFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [page, setPage] = useState(1)

  // modal state
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // fetch items (once on mount)
  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/item')
      // ensure array
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError('Failed to load items')
      tError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // read genre from URL ?genre=... and apply as filter
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('genre') || ''
    setGenreFilter(q)
  }, [location.search])

  // derived dropdown lists
  const genres = useMemo(() => [...new Set(items.map(i => i.genre).filter(Boolean))], [items])
  const authors = useMemo(() => [...new Set(items.map(i => i.author).filter(Boolean))], [items])

  // filtered using debounced query + filters
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    return items.filter(i => {
      if (genreFilter && i.genre !== genreFilter) return false
      if (authorFilter && i.author !== authorFilter) return false
      if (!q) return true
      return (i.title || '').toLowerCase().includes(q)
        || (i.author || '').toLowerCase().includes(q)
        || (i.genre || '').toLowerCase().includes(q)
    })
  }, [items, debouncedQuery, genreFilter, authorFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // reset page when filters/search change
  useEffect(() => { setPage(1) }, [debouncedQuery, genreFilter, authorFilter])

  function openView(item) {
    setSelected(item)
    setShowModal(true)
  }
  function openDelete(item) {
    setSelected(item)
    setShowDelete(true)
  }

  async function confirmDelete(id) {
    try {
      await api.delete(`/itemdelete/${id}`)
      setItems(prev => prev.filter(p => p._id !== id))
      setShowDelete(false)
      tSuccess('Book deleted')
    } catch (err) {
      tError('Delete failed')
    }
  }

  function changePage(n) {
    setPage(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const EmptyState = () => (
    <div className="text-center py-5">
      <h4 className="mb-3">No books found</h4>
      <p className="text-muted">Try clearing filters or adding a new book.</p>
      {localStorage.getItem('token') ? (
        <Button variant="primary" onClick={() => navigate('/add')}>Add your first book</Button>
      ) : (
        <Button variant="outline-primary" onClick={() => navigate('/login')}>Log in to add books</Button>
      )}
    </div>
  )

  // helper to open download (uses api baseURL so it works across environments)
  function openPdfDownload(bookId) {
    const base = api.defaults.baseURL || window.location.origin
    const url = `${base.replace(/\/$/, '')}/item/${bookId}/pdf/download`
    window.open(url, '_blank')
  }

  // Render
  return (
    <>
      <HeroSection />
      <div>
        <Row className="mb-3 align-items-center">
          <Col md={12}>
            <TopCarousel max={6} />
          </Col>
        </Row>

        <Row className="mb-3 align-items-center">
          <Col md={12}>
            <CategoryCards />
          </Col>
        </Row>

        <Row className="mb-3 align-items-center">
          <Col md={4}>
            <InputGroup>
              <Form.Control
                placeholder="Search by title, author or genre"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={() => { setQuery(''); setGenreFilter(''); setAuthorFilter('') }}>Clear</Button>
            </InputGroup>
          </Col>

          <Col md={3}>
            <Form.Select value={genreFilter} onChange={e => {
              const val = e.target.value
              setGenreFilter(val)
              // update URL so bookmark/share works
              const params = new URLSearchParams(location.search)
              if (val) params.set('genre', val)
              else params.delete('genre')
              navigate({ pathname: '/', search: params.toString() }, { replace: true })
            }}>
              <option value="">Filter by genre</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)}>
              <option value="">Filter by author</option>
              {authors.map(a => <option key={a} value={a}>{a}</option>)}
            </Form.Select>
          </Col>

          <Col md={2} className="text-end">
            <small className="text-muted">Results: {filtered.length}</small>
          </Col>
        </Row>

        {loading ? (
          <SkeletonGrid count={9} />
        ) : (
          <>
            {filtered.length === 0 ? <EmptyState /> : (
              <>
                <Row xs={1} sm={2} md={3} className="g-3">
                  {paged.map(item => (
                    <Col key={item._id}>
                      <ItemCard item={item} onView={openView} onDelete={openDelete} />
                    </Col>
                  ))}
                </Row>

                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First onClick={() => changePage(1)} disabled={page === 1} />
                    <Pagination.Prev onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1} />
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                      .map(p => (
                        <Pagination.Item key={p} active={p === page} onClick={() => changePage(p)}>{p}</Pagination.Item>
                      ))}
                    <Pagination.Next onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages} />
                    <Pagination.Last onClick={() => changePage(totalPages)} disabled={page === totalPages} />
                  </Pagination>
                </div>
              </>
            )}
          </>
        )}

        <ItemModal
          show={showModal}
          onHide={() => setShowModal(false)}
          item={selected}
          onEdit={(it) => {
            if (!it || !it._id) return
            navigate(`/edit/${it._id}`)
          }}
          onDownloadPdf={(it) => {
            if (!it || !it._id) return
            openPdfDownload(it._id)
          }}
        />

        <DeleteConfirmModal
          show={showDelete}
          onHide={() => setShowDelete(false)}
          item={selected}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  )
}
