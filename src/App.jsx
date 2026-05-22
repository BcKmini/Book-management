import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toolbar } from '@mui/material'
import Header from './components/Header'
import Home from './pages/Home'
import BookList from './pages/BookList'
import BookForm from './pages/BookForm'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Toolbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/books/new" element={<BookForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App