import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/common/Header/Header';
import Home from './components/pages/Home';
import BookListPage from './components/list/pages/BookListPage';
import BookFormPage from './components/list/pages/BookFormPage';
import BookCoverEditor from './components/edit/BookCoverEditor';
import BookDetail from './components/detail/BookDetail';
import './css/global.css'

function BookListRoute() {
  const navigate = useNavigate();

  return (
    <BookListPage
      onClickNew={() => navigate('/books/new')}
      onClickBook={(book) => navigate(`/books/${book.id}`)}
    />
  );
}

function BookFormRoute() {
  const navigate = useNavigate();
  const goList = () => navigate('/books');

  return <BookFormPage mode="new" onBack={goList} onSaved={goList} />;
}

function BookDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <BookDetail
      id={id}
      onBack={() => navigate('/books')}
      onEdit={() => navigate(`/books/${id}/edit`)}
      onEditCover={() => navigate(`/books/${id}/cover-editor`)}
      onDeleted={() => navigate('/books')}
    />
  );
}

function BookEditRoute() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <BookFormPage
      mode="edit"
      id={id}
      onBack={() => navigate(`/books/${id}`)}
      onSaved={() => navigate(`/books/${id}`)}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Box component="main" sx={{ pt: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookListRoute />} />
          <Route path="/books/new" element={<BookFormRoute />} />
          <Route path="/books/:id" element={<BookDetailRoute />} />
          <Route path="/books/:id/edit" element={<BookEditRoute />} />
          <Route path="/books/:id/cover-editor" element={<BookCoverEditor />} />
          <Route path="/cover-editor" element={<BookCoverEditor />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;