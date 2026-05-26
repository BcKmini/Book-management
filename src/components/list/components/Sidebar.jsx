import styles from './Sidebar.module.css'

const GENRES = ['전체', '소설', '인문', '에세이', '경제/경영', 'IT/컴퓨터', '자기계발']

const GENRE_ICONS = {
  '전체': 'ti-layout-grid',
  '소설': 'ti-book',
  '인문': 'ti-bulb',
  '에세이': 'ti-feather',
  '경제/경영': 'ti-chart-line',
  'IT/컴퓨터': 'ti-code',
  '자기계발': 'ti-heart',
}

export default function Sidebar({ genre, books, onSelectGenre }) {
  const countByGenre = (g) =>
    g === '전체' ? books.length : books.filter((b) => b.genre === g).length

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <i className={`ti ti-books ${styles.logoIcon}`} />
        <span className={styles.logoText}>도서 관리</span>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>카테고리</span>
        {GENRES.map((g) => {
          const isActive = genre === g

          return (
            <button
              key={g}
              className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
              onClick={() => onSelectGenre(g)}
            >
              <i className={`ti ${GENRE_ICONS[g]} ${styles.itemIcon}`} />
              <span className={styles.itemLabel}>{g}</span>
              <span className={styles.badge}>{countByGenre(g)}</span>
            </button>
          )
        })}
        <div className={styles.divider} />
      </div>
    </aside>
  )
}
