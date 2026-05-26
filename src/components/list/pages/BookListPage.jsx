import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import BookListItem from '../components/BookListItem'
import styles from './BookListPage.module.css'

const API = 'http://localhost:5000/books'
const FAVORITES = '즐겨찾기'

function readFavoriteIds() {
  const ids = new Set()

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith('bookFavorite:') && localStorage.getItem(key) === 'true') {
      ids.add(key.replace('bookFavorite:', ''))
    }
  }

  return ids
}

export default function BookListPage({ onClickNew, onClickBook }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [genre, setGenre] = useState('전체')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds())

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

  useEffect(() => {
    const refreshFavorites = () => setFavoriteIds(readFavoriteIds())

    window.addEventListener('focus', refreshFavorites)
    window.addEventListener('storage', refreshFavorites)
    window.addEventListener('bookFavoriteChange', refreshFavorites)
    refreshFavorites()

    return () => {
      window.removeEventListener('focus', refreshFavorites)
      window.removeEventListener('storage', refreshFavorites)
      window.removeEventListener('bookFavoriteChange', refreshFavorites)
    }
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    localStorage.removeItem(`bookFavorite:${id}`)
    setFavoriteIds(readFavoriteIds())
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = books.filter((book) => {
    const genreOk =
      genre === '전체' ||
      (genre === FAVORITES ? favoriteIds.has(String(book.id)) : book.genre === genre)
    const lowerQuery = query.toLowerCase()
    const queryOk =
      !query ||
      book.title?.toLowerCase().includes(lowerQuery) ||
      book.author?.toLowerCase().includes(lowerQuery)

    return genreOk && queryOk
  })

  return (
    <div className={styles.shell}>
      <Sidebar
        genre={genre}
        books={books}
        favoriteIds={favoriteIds}
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
              placeholder="제목, 저자 검색"
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
              title="격자 보기"
            >
              <i className={`ti ti-layout-grid ${styles.toggleIcon}`} />
            </button>
            <button
              className={`${styles.toggleBtnLast} ${view === 'list' ? styles.toggleActive : ''}`}
              onClick={() => setView('list')}
              title="목록 보기"
            >
              <i className={`ti ti-menu-2 ${styles.toggleIcon}`} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {loading && <div className={styles.loading}>불러오는 중...</div>}
          {error && (
            <div className={styles.error}>
              오류: {error}
              <br />
              json-server가 실행 중인지 확인하세요.
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className={styles.empty}>
              <i className={`ti ti-book-off ${styles.emptyIcon}`} />
              {genre === FAVORITES ? '즐겨찾기한 도서가 없습니다.' : '해당 도서가 없습니다.'}
            </div>
          )}

          {!loading && !error && view === 'grid' && (
            <div className={styles.gridArea}>
              {filtered.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  rank={i + 1}
                  onClick={() => onClickBook?.(book)}
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
                  onClick={() => onClickBook?.(book)}
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
