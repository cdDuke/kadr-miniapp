import { genres, movies } from '../data';
import { useT } from '../i18n';
import { useStore } from '../store';
import { tg } from '../tg';
import Poster from '../components/Poster';

export default function Home() {
  const { t, lang, genre: genreName } = useT();
  const push = useStore((s) => s.push);
  const genre = useStore((s) => s.genre);
  const setGenre = useStore((s) => s.setGenre);
  const setLang = useStore((s) => s.setLang);
  const featured = movies[0];
  const list = genre === 'all' ? movies : movies.filter((m) => m.genre === genre);

  const open = (id: string) => {
    tg.haptic.impact('light');
    push({ name: 'movie', id });
  };

  return (
    <div className="screen home">
      <div className="topline">
        <span className="city">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="2.3" fill="currentColor" />
          </svg>
          {t('city')}
        </span>
        <div className="seg" role="group" aria-label="Language">
          {(['ru', 'en'] as const).map((l) => (
            <button key={l} className={lang === l ? 'is-on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button className="hero" onClick={() => open(featured.id)} style={{ ['--acc' as string]: featured.palette[2] }}>
        <span className="hero__bg" aria-hidden="true">
          <Poster movie={featured} lang={lang} decorative slice />
        </span>
        <span className="hero__poster">
          <Poster movie={featured} lang={lang} decorative />
        </span>
        <span className="hero__body">
          <span className="eyebrow">{t('featured')}</span>
          <span className="hero__title">{featured.title[lang]}</span>
          <span className="hero__tagline">{featured.tagline[lang]}</span>
          <span className="rating">★ {featured.rating.toFixed(1)}</span>
          <span className="hero__cta">{t('buy')} →</span>
        </span>
      </button>

      <div className="section-head">
        <h3>{t('now')}</h3>
      </div>
      <div className="chips" role="group">
        {['all', ...genres].map((g) => (
          <button
            key={g}
            className={`chip${genre === g ? ' is-on' : ''}`}
            aria-pressed={genre === g}
            onClick={() => {
              tg.haptic.select();
              setGenre(g);
            }}
          >
            {g === 'all' ? t('all') : genreName(g as (typeof genres)[number])}
          </button>
        ))}
      </div>

      <div className="grid">
        {list.map((m) => (
          <button key={m.id} className="card" onClick={() => open(m.id)}>
            <span className="card__poster">
              <Poster movie={m} lang={lang} decorative />
              <span className="card__rating">★ {m.rating.toFixed(1)}</span>
            </span>
            <b>{m.title[lang]}</b>
            <small>
              {genreName(m.genre)} · {m.age}
            </small>
          </button>
        ))}
      </div>
    </div>
  );
}
