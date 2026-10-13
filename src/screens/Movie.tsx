import { useMemo } from 'react';
import { cinemas, iso, movies, sessionsFor, type Session } from '../data';
import { duration, useT } from '../i18n';
import { useStore } from '../store';
import { tg } from '../tg';
import Poster from '../components/Poster';
import { DateStrip } from '../components/Chrome';

export default function Movie({ id }: { id: string }) {
  const { t, lang, money, genre } = useT();
  const movie = movies.find((m) => m.id === id)!;
  const date = useStore((s) => s.date);
  const push = useStore((s) => s.push);
  const sessions = useMemo(() => sessionsFor(movie, date), [movie, date]);

  const now = new Date();
  const isToday = date === iso(now);
  const started = (s: Session) => isToday && Number(s.time.slice(0, 2)) * 60 + Number(s.time.slice(3)) <= now.getHours() * 60 + now.getMinutes();

  const byCinema = cinemas
    .map((c) => ({
      cinema: c,
      halls: c.halls.map((h) => ({ hall: h, list: sessions.filter((s) => s.cinemaId === c.id && s.hallId === h.id) })).filter((x) => x.list.length),
    }))
    .filter((x) => x.halls.length);

  return (
    <div className="screen movie" style={{ ['--acc' as string]: movie.palette[2] }}>
      <div className="movie__hero">
        <div className="movie__bg" aria-hidden="true">
          <Poster movie={movie} lang={lang} decorative slice />
        </div>
        <div className="movie__poster">
          <Poster movie={movie} lang={lang} />
        </div>
        <div className="movie__info">
          <h1>{movie.title[lang]}</h1>
          <p className="movie__tagline">{movie.tagline[lang]}</p>
          <p className="movie__meta">
            {genre(movie.genre)} · {duration(movie.minutes, t)} · {movie.age}
          </p>
          <div className="movie__badges">
            <span className="rating">★ {movie.rating.toFixed(1)}</span>
            {movie.formats.map((f) => (
              <span key={f} className="fmt">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="movie__about">{movie.about[lang]}</p>
      <p className="movie__cast">
        <b>{t('cast')}:</b> {movie.cast.join(', ')}
      </p>

      <div className="section-head">
        <h3>{t('sessions')}</h3>
      </div>
      <DateStrip />

      {byCinema.length === 0 && <p className="empty-note">{t('noSessions')}</p>}
      {byCinema.map(({ cinema, halls }) => (
        <section key={cinema.id} className="cinema">
          <header>
            <b>{cinema.name[lang]}</b>
            <small>{cinema.metro[lang]}</small>
          </header>
          {halls.map(({ hall, list }) => (
            <div key={hall.id} className="hall">
              <span className="hall__name">{hall.name[lang]}</span>
              <div className="times">
                {list.map((s) => {
                  const off = started(s);
                  return (
                    <button
                      key={s.id}
                      className="time"
                      disabled={off}
                      onClick={() => {
                        tg.haptic.impact('light');
                        push({ name: 'seats', sessionId: s.id });
                      }}
                    >
                      <b>{s.time}</b>
                      <small>
                        {s.format === '3D' && '3D · '}
                        {off ? t('past') : t('from', { p: money(s.price) })}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
