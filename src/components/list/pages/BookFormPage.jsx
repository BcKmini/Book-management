import { useState, useEffect } from 'react'
import {
  STYLE_PRESETS,
  BACKGROUND_PRESETS,
  LIGHTING_PRESETS,
  TYPOGRAPHY_PRESETS,
  buildStructuredPrompt,
  generateBookCover,
} from '../../../util/bookCoverService'
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

  const [aiOptions, setAiOptions] = useState({ style: '수채화', background: '베이지', lighting: '자연광', typography3: '클래식 명조' })
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState([null, null, null])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

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

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('어떤 스타일의 표지를 원하시는지 프롬프트를 작성해주세요!')
      return
    }
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      alert('.env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.')
      return
    }
    try {
      setIsGenerating(true)
      setSelectedImageIndex(null)
      setGeneratedImages([null, null, null])
      const combinedInfo = {
        title: form.title,
        author: form.author,
        content: `[Book Story]: ${form.content} / [User Design Request]: ${aiPrompt}`,
      }
      const finalPrompt = buildStructuredPrompt(combinedInfo, aiOptions)
      const newImages = await Promise.all([
        generateBookCover(apiKey, finalPrompt),
        generateBookCover(apiKey, finalPrompt),
        generateBookCover(apiKey, finalPrompt),
      ])
      setGeneratedImages(newImages)
    } catch (error) {
      console.error(error)
      alert(`이미지 생성 중 오류가 발생했습니다: ${error.message}`)
      setGeneratedImages([null, null, null])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!validate()) return
    const now = new Date().toISOString()
    const coverImageUrl = (!isEdit && selectedImageIndex !== null) ? generatedImages[selectedImageIndex] : ''
    const body = {
      ...form,
      price: form.price ? Number(form.price) : null,
      pages: form.pages ? Number(form.pages) : null,
      updatedAt: now,
      ...(isEdit ? {} : { createdAt: now, coverImageUrl }),
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

          <div className='card'>
            <div className='section-title'>
              <i className="ti ti-info-circle" /> 기본 정보
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: '#e74c3c' }}>* 필수</span>
            </div>

            <div className="form-group">
              <label className="label">제목 <span className="req">*</span></label>
              <input className={`input ${errors.title ? 'error' : ''}`} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="도서 제목" />
              {errors.title && <div className="err-msg"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.title}</div>}
            </div>

            <div className='row'>
              <div className="form-group">
                <label className="label">저자 <span className="req">*</span></label>
                <input className={`input ${errors.author ? 'error' : ''}`} value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="저자명" />
                {errors.author && <div className="err-msg"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.author}</div>}
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
              <textarea className={`textarea ${errors.content ? 'error' : ''}`} value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="줄거리, 주제, 핵심 내용을 입력하세요." maxLength={500} />
              {errors.content && <div className="err-msg"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.content}</div>}
              <div className="char-count">{form.content.length} / 500자</div>
            </div>
          </div>

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

          {!isEdit && (
            <div className='card'>
              <div className='section-title'>
                <i className="ti ti-wand" /> AI 표지 생성
                <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>(선택)</span>
              </div>

              <div className="form-group">
                <label className="label">스타일</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.keys(STYLE_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, style: key }))}
                      style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `0.5px solid ${aiOptions.style === key ? '#1a1a18' : 'rgba(0,0,0,0.22)'}`, background: aiOptions.style === key ? '#1a1a18' : '#fff', color: aiOptions.style === key ? '#fff' : '#1a1a18' }}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">배경 / 조명</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {Object.keys(BACKGROUND_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, background: key }))}
                      style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `0.5px solid ${aiOptions.background === key ? '#1a1a18' : 'rgba(0,0,0,0.22)'}`, background: aiOptions.background === key ? '#1a1a18' : '#fff', color: aiOptions.background === key ? '#fff' : '#1a1a18' }}>
                      {key}
                    </button>
                  ))}
                  <span style={{ color: '#ccc' }}>|</span>
                  {Object.keys(LIGHTING_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, lighting: key }))}
                      style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `0.5px solid ${aiOptions.lighting === key ? '#1a1a18' : 'rgba(0,0,0,0.22)'}`, background: aiOptions.lighting === key ? '#1a1a18' : '#fff', color: aiOptions.lighting === key ? '#fff' : '#1a1a18' }}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">타이포그래피</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.keys(TYPOGRAPHY_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, typography: key }))}
                      style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `0.5px solid ${aiOptions.typography === key ? '#1a1a18' : 'rgba(0,0,0,0.22)'}`, background: aiOptions.typography === key ? '#1a1a18' : '#fff', color: aiOptions.typography === key ? '#fff' : '#1a1a18' }}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">프롬프트</label>
                <textarea className="textarea" placeholder="어떤 느낌의 표지를 원하시나요?" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
              </div>

              <button onClick={handleGenerate} disabled={isGenerating}
                style={{ width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: isGenerating ? 'not-allowed' : 'pointer', background: isGenerating ? '#aaa' : '#1a1a18', color: '#fff', border: 'none' }}>
                {isGenerating ? '이미지 생성 중...' : '표지 후보 3장 생성하기'}
              </button>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} onClick={() => generatedImages[i] && setSelectedImageIndex(i)}
                    style={{ flex: 1, aspectRatio: '2/3', borderRadius: 8, overflow: 'hidden', border: `2px solid ${selectedImageIndex === i ? '#1a1a18' : 'rgba(0,0,0,0.1)'}`, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: generatedImages[i] ? 'pointer' : 'default' }}>
                    {isGenerating
                      ? <span style={{ fontSize: 11, color: '#aaa' }}>생성 중...</span>
                      : generatedImages[i]
                        ? <img src={generatedImages[i]} alt={`표지 후보 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 11, color: '#bbb' }}>Preview {i + 1}</span>}
                  </div>
                ))}
              </div>

              {selectedImageIndex !== null && (
                <div style={{ fontSize: 12, color: '#1a1a18', marginTop: 8, textAlign: 'center', fontWeight: 500 }}>
                  ✓ {selectedImageIndex + 1}번 이미지가 표지로 등록됩니다.
                </div>
              )}
            </div>
          )}

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