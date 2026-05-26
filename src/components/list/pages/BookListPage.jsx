import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import BookListItem from '../components/BookListItem'
import styles from './BookListPage.module.css'

const API = 'http://localhost:5000/books'

export default function BookListPage({ onClickNew }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [genre, setGenre] = useState('전체')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(API)
        if (!res.ok) throw new Error('서버 오류')
        const data = await res.json()
        setBooks(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = books.filter((b) => {
    const genreOk = genre === '전체' || b.genre === genre
    const queryOk =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
    return genreOk && queryOk
  })

  return (
    <div className={styles.shell}>
      <Sidebar
        genre={genre}
        books={books}
        onSelectGenre={setGenre}
      />

      <div className={styles.main}>
        <div className={styles.topbar}>
          <span className={styles.title}>
            {genre === '전체' ? '전체 도서' : genre}
          </span>
          <div className={styles.searchWrap}>
            <i className={`ti ti-search ${styles.searchIcon}`} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="제목, 저자..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.subbar}>
          <div className={styles.subLeft}>
            <span className={styles.count}>총 {filtered.length}권</span>
            <select className={styles.sortSelect}>
              <option>등록일순</option>
              <option>제목순</option>
              <option>가격순</option>
            </select>
          </div>
          <div className={styles.toggleWrap}>
            <button
              className={`${styles.toggleBtn} ${view === 'grid' ? styles.toggleActive : ''}`}
              onClick={() => setView('grid')}
              title="크게 보기"
            >
              <i className={`ti ti-layout-grid ${styles.toggleIcon}`} />
            </button>
            <button
              className={`${styles.toggleBtnLast} ${view === 'list' ? styles.toggleActive : ''}`}
              onClick={() => setView('list')}
              title="상세히 보기"
            >
              <i className={`ti ti-menu-2 ${styles.toggleIcon}`} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {loading && <div className={styles.loading}>불러오는 중...</div>}
          {error && <div className={styles.error}>오류: {error}<br />json-server가 실행 중인지 확인하세요.</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className={styles.empty}>
              <i className={`ti ti-book-off ${styles.emptyIcon}`} />
              해당 도서가 없습니다.
            </div>
          )}

          {!loading && !error && view === 'grid' && (
            <div className={styles.gridArea}>
              {filtered.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  rank={i + 1}
                  onDelete={() => handleDelete(book.id)}
                />
              ))}
            </div>
          )}

          {!loading && !error && view === 'list' && (
            <div>
              {filtered.map((book, i) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  rank={i + 1}
                  onDelete={() => handleDelete(book.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
