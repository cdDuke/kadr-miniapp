import { findCinema, movies, parseSession } from '../data';
import { useT } from '../i18n';
import { useStore } from '../store';
import { tg } from '../tg';
import Poster from '../components/Poster';
import { fmtDate } from './Seats';

export default function Tickets() {
  const { t, lang, locale } = useT();
  const tickets = useStore((s) => s.tickets);
  const push = useStore((s) => s.push);
  const setTab = useStore((s) => s.setTab);

  const items = tickets
    .map((tk) => ({ tk, s: parseSession(tk.sessionId) }))
    .filter((x): x is { tk: (typeof tickets)[number]; s: NonNullable<ReturnType<typeof parseSession>> } => Boolean(x.s))
    .sort((a, b) => `${a.s.date} ${a.s.time}`.localeCompare(`${b.s.date} ${b.s.time}`));

  if (!items.length) {
    return (
      <div className="screen tickets empty">
        <svg viewBox="0 0 120 90" width="140" aria-hidden="true" className="empty__art">
          <path d="M10 22a8 8 0 0 0 8-8h84a8 8 0 0 0 8 8v12a10 10 0 0 0 0 20v12a8 8 0 0 0-8 8H18a8 8 0 0 0-8-8V54a10 10 0 0 0 0-20Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M78 16v58" stroke="currentColor" strokeWidth="3" strokeDasharray="5 6" />
          <path d="M30 40h30M30 50h20" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <h2>{t('emptyTitle')}</h2>
        <p>{t('emptyText')}</p>
        <button className="btn btn--accent" onClick={() => setTab('afisha')}>
          {t('afisha')}
        </button>
      </div>
    );
  }

  return (
    <div className="screen tickets">
      <div className="section-head">
        <h3>{t('upcoming')}</h3>
      </div>
      <ul className="tlist">
        {items.map(({ tk, s }) => {
          const m = movies.find((x) => x.id === s.movieId)!;
          return (
            <li key={tk.id}>
              <button
                className="tlist__item"
                onClick={() => {
                  tg.haptic.impact('light');
                  push({ name: 'ticket', ticketId: tk.id });
                }}
              >
                <span className="tlist__poster">
                  <Poster movie={m} lang={lang} decorative />
                </span>
                <span className="tlist__body">
                  <b>{m.title[lang]}</b>
                  <span>
                    {fmtDate(s.date, locale)} · {s.time}
                  </span>
                  <small>
                    {findCinema(s.cinemaId).name[lang]} · {t('seats')}: {tk.seats.length}
                  </small>
                </span>
                <span className="tlist__arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
