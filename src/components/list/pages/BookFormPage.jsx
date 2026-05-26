import { useState, useEffect } from 'react'
import '../../../css/book-form.css';

const API = 'http://localhost:5000/books'

const GENRES = ['소설', '인문', '에세이', '경제/경영', 'IT/컴퓨터', '자기계발']

export default function BookFormPage({ mode, id, onBack, onSaved }) {
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    title: '', author: '', content: '', genre: '',
    publisher: '', pubDate: '', price: '', pages: '', isbn: '',
  })
  const [errors, setErrors] = useState({})
  const [changed, setChanged] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // 수정 모드: 기존 데이터 로딩
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await fetch(`${API}/${id}`)
        const data = await res.json()
        setForm({
          title: data.title || '',
          author: data.author || '',
          content: data.content || '',
          genre: data.genre || '',
          publisher: data.publisher || '',
          pubDate: data.pubDate || '',
          price: data.price || '',
          pages: data.pages || '',
          isbn: data.isbn || '',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
    setChanged(true)
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = '제목은 필수 입력 항목입니다.'
    if (!form.author.trim()) e.author = '저자는 필수 입력 항목입니다.'
    if (!form.content.trim()) e.content = '도서 내용은 필수 입력 항목입니다.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const now = new Date().toISOString()
    const body = {
      ...form,
      price: form.price ? Number(form.price) : null,
      pages: form.pages ? Number(form.pages) : null,
      updatedAt: now,
      ...(isEdit ? {} : { createdAt: now, coverImageUrl: '' }),
    }

    if (isEdit) {
      await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    onSaved()
  }

  if (loading) return <div className='loading'>불러오는 중...</div>

  return (
    <div className='page'>
      <div className='topbar'>
        <button className='back-btn' onClick={onBack}>
          <i className="ti ti-arrow-left" /> {isEdit ? '상세 페이지로' : '도서 목록으로'}
        </button>
        <div />
      </div>

      <div className='inner'>
        <div className='wrap'>
          <div className='page-title'>{isEdit ? '도서 수정' : '새 도서 등록'}</div>
          {isEdit && <div className='page-sub'>ID {id}</div>}

          {isEdit && changed && (
            <div className='banner'>
              <i className="ti ti-info-circle" /> 변경된 내용이 있습니다. 저장하기 버튼을 눌러 반영하세요.
            </div>
          )}

          {/* 기본 정보 */}
          <div className='card'>
            <div className='section-title'>
              <i className="ti ti-info-circle" /> 기본 정보
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: '#e74c3c' }}>* 필수</span>
            </div>

            <div className="form-group">
              <label className="label">제목 <span className="req">*</span></label>
              <input 
                className={`input ${errors.title ? 'error' : ''}`} 
                value={form.title} 
                onChange={(e) => set('title', e.target.value)} 
                placeholder="도서 제목" 
              />

              {errors.title && (
                <div className="err-msg">
                  <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />
                  {errors.title}
                </div>
              )}
            </div>
            
            <div className='row'>
              <div className="form-group">
                <label className="label">저자 <span className="req">*</span></label>
                <input 
                  className={`input ${errors.author ? 'error' : ''}`} 
                  value={form.author} 
                  onChange={(e) => set('author', e.target.value)} 
                  placeholder="저자명" 
                />
                {errors.author && (
                  <div className="err-msg">
                    <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />
                    {errors.author}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="label">장르</label>
              <select className="select" value={form.genre} onChange={(e) => set('genre', e.target.value)}>
                <option value="">장르 선택</option>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">
                도서 내용 <span className="req">*</span>
                <span style={{ fontWeight: 400, marginLeft: 4, color: '#6b6b67' }}>(AI 표지 생성에 활용됩니다)</span>
              </label>
              {/* 텍스트 영역 에러 상태 동적 바인딩 */}
              <textarea
                className={`textarea ${errors.content ? 'error' : ''}`}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="줄거리, 주제, 핵심 내용을 입력하세요."
                maxLength={500}
              />
              {errors.content && (
                <div className="err-msg">
                  <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />
                  {errors.content}
                </div>
              )}
              <div className="char-count">{form.content.length} / 500자</div>
            </div>
          
          </div>

          {/* 상세 정보 */}
          <div className='card'>
            <div className='section-title'>
              <i className="ti ti-list-details" /> 상세 정보
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>(선택)</span>
            </div>
            <div className="row">
              <div>
                <label className='label'>출판사</label>
                <input className="input" value={form.publisher} onChange={(e) => set('publisher', e.target.value)} placeholder="출판사명" />
              </div>
              <div>
                <label className='label'>출판일</label>
                <input className="input" type="date" value={form.pubDate} onChange={(e) => set('pubDate', e.target.value)} />
              </div>
            </div>
            <div className="row">
              <div>
                <label className='label'>가격 (원)</label>
                <input className="input" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="예: 16000" />
              </div>
              <div>
                <label className='label'>페이지 수</label>
                <input className="input" type="number" value={form.pages} onChange={(e) => set('pages', e.target.value)} placeholder="예: 280" />
              </div>
            </div>
            <div>
              <label className='label'>ISBN</label>
              <input className="input" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} placeholder="13자리 ISBN" maxLength={13} />
            </div>
          </div>

          <div className='foot'>
            <button className="cancel-btn" onClick={onBack}>취소</button>
            <button className="save-btn" onClick={handleSave}>
              <i className="ti ti-check" /> {isEdit ? '저장하기' : '등록하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
