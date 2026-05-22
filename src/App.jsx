import { useState } from 'react'
import BookListPage from './pages/BookListPage'
import BookFormPage from './pages/BookFormPage'

export default function App() {
  const [page, setPage] = useState('list')
  const [selectedId, setSelectedId] = useState(null)

  const goList = () => { setPage('list'); setSelectedId(null) }
  const goNew = () => { setSelectedId(null); setPage('new') }

  if (page === 'new') {
    return <BookFormPage mode="new" onBack={goList} onSaved={goList} />
  }
  return <BookListPage onClickNew={goNew} />
}
