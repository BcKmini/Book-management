import { useState, useEffect } from 'react'

const DUMMY_BOOK = {
  id: 1,
  title: '채식주의자',
  author: '한강',
  genre: '소설',
  publisher: '창비',
  pubDate: '2007-06-01',
  price: 12000,
  pages: 247,
  isbn: '9788936434120',
  content: '어느 날 갑자기 채식을 선언한 아내 영혜와, 그녀를 둘러싼 가족들의 이야기를 세 편의 연작으로 담았다. 채식과 욕망, 자유와 억압이 뒤엉킨 이야기로 2016년 맨부커 국제상을 수상했다.',
  coverImageUrl: '',
  createdAt: '2026-04-24',
  updatedAt: '2026-04-24',
}

const GENRE_COLORS = {
  '소설':      { bg: '#E1F5EE', ic: '#0F6E56' },
  '인문':      { bg: '#FBEAF0', ic: '#993556' },
  '에세이':    { bg: '#EEEDFE', ic: '#534AB7' },
  '경제/경영': { bg: '#EAF3DE', ic: '#3B6D11' },
  'IT/컴퓨터': { bg: '#FAECE7', ic: '#993C1D' },
  '자기계발':  { bg: '#F1EFE8', ic: '#5F5E5A' },
}
const DEFAULT_COLOR = { bg: '#E6F1FB', ic: '#185FA5' }

function getCoverColor(genre) {
  return GENRE_COLORS[genre] || DEFAULT_COLOR
}
function fmtDate(dateStr) {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  return `${y}년 ${parseInt(m)}월`
}

const s = {
  page: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh', background: '#eeece6',
  },
  topbar: {
    background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.12)',
    padding: '0 20px', height: 52,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
    color: '#6b6b67', background: 'none', border: 'none', cursor: 'pointer',
  },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8,
    border: 'none', cursor: 'pointer', background: '#1a1a18', color: '#fff',
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.22)', cursor: 'pointer', background: '#fff', color: '#6b6b67',
  },
  inner: { flex: 1, padding: 24 },
  wrap: { maxWidth: 780, margin: '0 auto' },

  // 통계 카드
  statsRow: {
    display: 'flex', gap: 10, marginBottom: 14,
  },
  statCard: {
    flex: 1, background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12, padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  statIcon: (color) => ({
    width: 36, height: 36, borderRadius: 10,
    background: color + '22',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }),
  statLabel: { fontSize: 11, color: '#6b6b67', marginBottom: 2 },
  statVal: { fontSize: 20, fontWeight: 500, color: '#1a1a18' },

  // 메인 카드
  mainCard: {
    background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14, overflow: 'hidden', marginBottom: 14,
    display: 'flex',
  },

  // 표지
  coverWrap: {
    width: 220, minWidth: 220, flexShrink: 0,
    display: 'flex', flexDirection: 'column',
  },
  coverBox: (bg) => ({
    width: '100%', height: 300, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  }),
  favoriteBtn: (active) => ({
    position: 'absolute', top: 10, right: 10,
    width: 32, height: 32, borderRadius: '50%',
    background: active ? '#fff3e0' : '#fff',
    border: `0.5px solid ${active ? '#f59e0b' : 'rgba(0,0,0,0.15)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 16,
    color: active ? '#f59e0b' : '#aaa',
    transition: 'all 0.15s',
  }),
  coverEditBtn: {
    margin: 12, padding: '7px 0', borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.22)',
    background: '#fff', color: '#1a1a18',
    fontSize: 12, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  },

  // 정보
  infoWrap: { flex: 1, padding: '24px 24px 20px' },
  genreTag: {
    display: 'inline-block', fontSize: 11, padding: '3px 10px',
    borderRadius: 20, background: '#f5f5f4', color: '#6b6b67', marginBottom: 10,
  },
  bookTitle: { fontSize: 22, fontWeight: 500, color: '#1a1a18', marginBottom: 4 },
  bookAuthor: { fontSize: 14, color: '#6b6b67', marginBottom: 20 },
  divider: { height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0 0 16px' },
  infoRow: {
    display: 'flex', alignItems: 'center',
    fontSize: 13, marginBottom: 10, gap: 8,
  },
  infoLabel: {
    width: 72, color: '#6b6b67', flexShrink: 0,
    display: 'flex', alignItems: 'center', gap: 5,
  },
  infoVal: { color: '#1a1a18', fontWeight: 500 },
  dateRow: { marginTop: 16, fontSize: 11, color: '#aaa', display: 'flex', gap: 16 },

  // 내용 카드
  contentCard: {
    background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 14, padding: 24, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 500, color: '#6b6b67',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
  },
  contentText: { fontSize: 14, color: '#1a1a18', lineHeight: 1.8 },

  // 하단
  foot: { marginTop: 4 },
  goListBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 13, padding: '8px 16px', borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.22)',
    background: '#fff', color: '#1a1a18', cursor: 'pointer',
  },

  // 삭제 모달
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: '28px 28px 20px', width: 340,
  },
  modalTitle: { fontSize: 16, fontWeight: 500, color: '#1a1a18', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#6b6b67', lineHeight: 1.6, marginBottom: 20 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  modalCancelBtn: {
    fontSize: 13, padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
    border: '0.5px solid rgba(0,0,0,0.22)', background: '#fff', color: '#1a1a18',
  },
  modalDeleteBtn: {
    fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8,
    border: 'none', background: '#1a1a18', color: '#fff', cursor: 'pointer',
  },
}

export default function BookDetail() {
  const book = DUMMY_BOOK
  const { bg, ic } = getCoverColor(book.genre)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [favorite, setFavorite] = useState(false)
 const [dailyVisitors, setDailyVisitors] = useState(() => {
  return Number(localStorage.getItem('dailyVisitors') || 0)
})
const [totalViews, setTotalViews] = useState(() => {
  return Number(localStorage.getItem('totalViews') || 0)
})
  // 페이지 진입 시 방문자 수 / 누적 조회수 +1
useEffect(() => {
  setDailyVisitors((v) => {
    const newVal = v + 1
    localStorage.setItem('dailyVisitors', newVal)
    return newVal
  })
  setTotalViews((v) => {
    const newVal = v + 1
    localStorage.setItem('totalViews', newVal)
    return newVal
  })
}, [])

  return (
    <div style={s.page}>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>도서를 삭제하시겠어요?</div>
            <div style={s.modalDesc}>
              <strong>"{book.title}"</strong>이(가) 영구적으로 삭제됩니다.<br />
              이 작업은 되돌릴 수 없습니다.
            </div>
            <div style={s.modalActions}>
              <button style={s.modalCancelBtn} onClick={() => setShowDeleteModal(false)}>취소</button>
              <button style={s.modalDeleteBtn} onClick={() => setShowDeleteModal(false)}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 상단 바 */}
      <div style={s.topbar}>
        <button style={s.backBtn}>
          <i className="ti ti-arrow-left" /> 도서 목록으로
        </button>
      </div>

      <div style={s.inner}>
        <div style={s.wrap}>

          {/* 통계 카드 */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={s.statIcon('#3b82f6')}>
                <i className="ti ti-users" style={{ fontSize: 18, color: '#3b82f6' }} />
              </div>
              <div>
                <div style={s.statLabel}>오늘 방문자 수</div>
                <div style={s.statVal}>{dailyVisitors.toLocaleString()}</div>
              </div>
            </div>
            <div style={s.statCard}>
              <div style={s.statIcon('#8b5cf6')}>
                <i className="ti ti-eye" style={{ fontSize: 18, color: '#8b5cf6' }} />
              </div>
              <div>
                <div style={s.statLabel}>누적 조회수</div>
                <div style={s.statVal}>{totalViews.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* 메인 카드 */}
          <div style={s.mainCard}>

            {/* 표지 */}
            <div style={s.coverWrap}>
              <div style={s.coverBox(bg)}>
                {book.coverImageUrl
                  ? <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <i className="ti ti-book" style={{ fontSize: 80, color: ic }} />
                }
                {/* 즐겨찾기 버튼 */}
                <button
                  style={s.favoriteBtn(favorite)}
                  onClick={() => setFavorite(!favorite)}
                  title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                >
                  <i className="ti ti-star" style={{ color: favorite ? '#f59e0b' : '#aaa' }} />
                </button>
              </div>
              <button style={s.coverEditBtn}>
                <i className="ti ti-sparkles" style={{ fontSize: 13 }} />
                AI 표지 수정
              </button>
            </div>

            {/* 정보 */}
            <div style={s.infoWrap}>
              <span style={s.genreTag}>{book.genre}</span>
              <div style={s.bookTitle}>{book.title}</div>
              <div style={s.bookAuthor}>{book.author}</div>
              <div style={s.divider} />
              {[
                { icon: 'ti-building',      label: '출판사', val: book.publisher },
                { icon: 'ti-calendar',      label: '출판일', val: fmtDate(book.pubDate) },
                { icon: 'ti-currency-won',  label: '가격',   val: `${book.price.toLocaleString()}원` },
                { icon: 'ti-book-2',        label: '페이지', val: `${book.pages}쪽` },
                { icon: 'ti-barcode',       label: 'ISBN',   val: book.isbn },
              ].map(({ icon, label, val }) => (
                <div key={label} style={s.infoRow}>
                  <span style={s.infoLabel}>
                    <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
                    {label}
                  </span>
                  <span style={s.infoVal}>{val}</span>
                </div>
              ))}
              <div style={s.dateRow}>
                <span>등록 {book.createdAt}</span>
                <span>수정 {book.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* 도서 내용 */}
          <div style={s.contentCard}>
            <div style={s.sectionTitle}>
              <i className="ti ti-align-left" /> 도서 내용
            </div>
            <div style={s.contentText}>{book.content}</div>
          </div>

          {/* 하단 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button style={s.goListBtn}>
              <i className="ti ti-arrow-left" /> 도서 목록으로 돌아가기
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                <i className="ti ti-trash" /> 삭제
              </button>
              <button style={s.editBtn}>
                <i className="ti ti-edit" /> 수정
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}