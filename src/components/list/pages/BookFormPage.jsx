import { useState, useEffect } from 'react'
import {
  STYLE_PRESETS,
  BACKGROUND_PRESETS,
  LIGHTING_PRESETS,
  TYPOGRAPHY_PRESETS,
  buildStructuredPrompt,
  generateBookCover,
} from '../../../util/bookCoverService'
import '../../../css/book-form.css'

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

  if (loading) return <div className="loading">불러오는 중...</div>

  return (
    <div className="page">
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="ti ti-arrow-left" /> {isEdit ? '상세 페이지로' : '도서 목록으로'}
        </button>
        <div />
      </div>

      <div className="inner">
        <div className="wrap">
          <div className="page-title">{isEdit ? '도서 수정' : '새 도서 등록'}</div>
          {isEdit && <div className="page-sub">ID {id}</div>}

          {isEdit && changed && (
            <div className="banner">
              <i className="ti ti-info-circle" /> 변경된 내용이 있습니다. 저장하기 버튼을 눌러 반영하세요.
            </div>
          )}

          {/* 기본 정보 */}
          <div className="card">
            <div className="section-title">
              <i className="ti ti-info-circle" /> 기본 정보
              <span className="required-note">* 필수</span>
            </div>
            <div className="form-group">
              <label className="label">제목 <span className="req">*</span></label>
              <input className={`input ${errors.title ? 'error' : ''}`} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="도서 제목" />
              {errors.title && <div className="err-msg"><i className="ti ti-alert-circle err-icon" />{errors.title}</div>}
            </div>
            <div className="row">
              <div>
                <label className="label">저자 <span className="req">*</span></label>
                <input className={`input ${errors.author ? 'error' : ''}`} value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="저자명" />
                {errors.author && <div className="err-msg"><i className="ti ti-alert-circle err-icon" />{errors.author}</div>}
              </div>
              <div>
                <label className="label">장르</label>
                <select className="select" value={form.genre} onChange={(e) => set('genre', e.target.value)}>
                  <option value="">장르 선택</option>
                  {GENRES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">
                도서 내용 <span className="req">*</span>
                <span className="label-note">(AI 표지 생성에 활용됩니다)</span>
              </label>
              <textarea
                className={`textarea ${errors.content ? 'error' : ''}`}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="줄거리, 주제, 핵심 내용을 입력하세요."
                maxLength={500}
              />
              {errors.content && <div className="err-msg"><i className="ti ti-alert-circle err-icon" />{errors.content}</div>}
              <div className="char-count">{form.content.length} / 500자</div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="card">
            <div className="section-title">
              <i className="ti ti-list-details" /> 상세 정보
              <span className="optional-note">(선택)</span>
            </div>
            <div className="row">
              <div>
                <label className="label">출판사</label>
                <input className="input" value={form.publisher} onChange={(e) => set('publisher', e.target.value)} placeholder="출판사명" />
              </div>
              <div>
                <label className="label">출판일</label>
                <input className="input" type="date" value={form.pubDate} onChange={(e) => set('pubDate', e.target.value)} />
              </div>
            </div>
            <div className="row">
              <div>
                <label className="label">가격 (원)</label>
                <input className="input" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="예: 16000" />
              </div>
              <div>
                <label className="label">페이지 수</label>
                <input className="input" type="number" value={form.pages} onChange={(e) => set('pages', e.target.value)} placeholder="예: 280" />
              </div>
            </div>
            <div>
              <label className="label">ISBN</label>
              <input className="input" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} placeholder="13자리 ISBN" maxLength={13} />
            </div>
          </div>

          {/* AI 표지 생성 - 등록 모드 전용 */}
          {!isEdit && (
            <div className="card">
              <div className="section-title">
                <i className="ti ti-wand" /> AI 표지 생성
                <span className="optional-note">(선택)</span>
              </div>

              <div className="form-group">
                <label className="label">스타일</label>
                <div className="option-row">
                  {Object.keys(STYLE_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, style: key }))}
                      className={`chip-btn ${aiOptions.style === key ? 'active' : ''}`}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">배경 / 조명</label>
                <div className="option-row">
                  {Object.keys(BACKGROUND_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, background: key }))}
                      className={`chip-btn ${aiOptions.background === key ? 'active' : ''}`}>
                      {key}
                    </button>
                  ))}
                  <span className="option-divider">|</span>
                  {Object.keys(LIGHTING_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, lighting: key }))}
                      className={`chip-btn ${aiOptions.lighting === key ? 'active' : ''}`}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">타이포그래피</label>
                <div className="option-row">
                  {Object.keys(TYPOGRAPHY_PRESETS).map((key) => (
                    <button key={key} onClick={() => setAiOptions((p) => ({ ...p, typography: key }))}
                      className={`chip-btn ${aiOptions.typography === key ? 'active' : ''}`}>
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">프롬프트</label>
                <textarea className="textarea" placeholder="어떤 느낌의 표지를 원하시나요? 객체, 색감, 분위기 등을 자유롭게 적어주세요." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
              </div>

              <button onClick={handleGenerate} disabled={isGenerating}
                className="generate-btn">
                {isGenerating ? '이미지 생성 중...' : '표지 후보 3장 생성하기'}
              </button>

              <div className="preview-row">
                {[0, 1, 2].map((i) => (
                  <div key={i} onClick={() => generatedImages[i] && setSelectedImageIndex(i)}
                    className={`preview-card ${selectedImageIndex === i ? 'selected' : ''} ${generatedImages[i] ? 'clickable' : ''}`}>
                    {isGenerating
                      ? <span className="preview-placeholder">생성 중...</span>
                      : generatedImages[i]
                        ? <img src={generatedImages[i]} alt={`표지 후보 ${i + 1}`} className="preview-img" />
                        : <span className="preview-placeholder">Preview {i + 1}</span>}
                  </div>
                ))}
              </div>

              {selectedImageIndex !== null && (
                <div className="selected-message">
                  ✓ {selectedImageIndex + 1}번 이미지가 표지로 등록됩니다.
                </div>
              )}
            </div>
          )}

          <div className="foot">
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
