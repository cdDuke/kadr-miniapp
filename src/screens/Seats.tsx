import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { findCinema, findHall, movies, parseSession, seatMap, seatPrice, type Seat } from '../data';
import { useT } from '../i18n';
import { MAX_SEATS, useStore } from '../store';
import { tg, useMainButton } from '../tg';

export const fmtDate = (iso: string, locale: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, d));
};

const EMPTY: string[] = [];

export default function Seats({ sessionId }: { sessionId: string }) {
  const { t, lang, locale, money } = useT();
  const session = parseSession(sessionId)!;
  const movie = movies.find((m) => m.id === session.movieId)!;
  const cinema = findCinema(session.cinemaId);
  const hall = findHall(session.cinemaId, session.hallId);
  const picked = useStore((s) => s.picked[sessionId] ?? EMPTY);
  const tickets = useStore((s) => s.tickets);
  const toggleSeat = useStore((s) => s.toggleSeat);
  const clearSeats = useStore((s) => s.clearSeats);
  const addTicket = useStore((s) => s.addTicket);
  const replace = useStore((s) => s.replace);
  const [paying, setPaying] = useState(false);

  // seats bought earlier in this session are shown as taken
  const owned = useMemo(() => new Set(tickets.filter((x) => x.sessionId === sessionId).flatMap((x) => x.seats)), [tickets, sessionId]);
  const rows = useMemo(() => seatMap(session).map((row) => row.map((s) => (owned.has(s.key) ? { ...s, taken: true } : s))), [session, owned]);
  const seatByKey = useMemo(() => new Map(rows.flat().map((s) => [s.key, s])), [rows]);
  const total = picked.reduce((sum, k) => sum + seatPrice(session, seatByKey.get(k)!), 0);

  // size seats so the widest row fits the viewport
  const wrapRef = useRef<HTMLDivElement>(null);
  const [seat, setSeat] = useState(24);
  // a row of n seats with two aisles is ≈ (n + 1) seat-plus-gap units wide
  const maxUnits = Math.max(...rows.map((r) => r.length + (r.length >= 12 ? 1 : 0)));
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const usable = e.contentRect.width - 2 * 16 - 4;
      setSeat(Math.max(14, Math.min(30, Math.floor(usable / maxUnits) - 3)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxUnits]);

  const warnLimit = () => {
    tg.haptic.notify('warning');
    tg.popup({ message: t('max', { n: MAX_SEATS }), buttons: [{ type: 'ok' }] });
  };

  const tap = (s: Seat) => {
    const res = toggleSeat(sessionId, s.key);
    if (res === 'limit') warnLimit();
    else tg.haptic.select();
  };

  const tapPair = (a: Seat, b: Seat) => {
    const both = picked.includes(a.key) && picked.includes(b.key);
    if (both) {
      toggleSeat(sessionId, a.key);
      toggleSeat(sessionId, b.key);
      tg.haptic.select();
      return;
    }
    const missing = [a, b].filter((s) => !picked.includes(s.key));
    if (picked.length + missing.length > MAX_SEATS) return warnLimit();
    missing.forEach((s) => toggleSeat(sessionId, s.key));
    tg.haptic.impact('medium');
  };

  const pay = async () => {
    const id = await tg.popup({
      title: t('confirmTitle'),
      message: t('confirmMsg', { n: picked.length, m: movie.title[lang], d: fmtDate(session.date, locale), t: session.time, p: money(total) }),
      buttons: [
        { type: 'cancel', text: t('cancel') },
        { id: 'pay', type: 'default', text: t('confirmOk') },
      ],
    });
    if (id !== 'pay') return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1200));
    const ticketId = `KD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0')}`;
    await addTicket({ id: ticketId, sessionId, seats: [...picked].sort(sortKeys), total, createdAt: Date.now() });
    clearSeats(sessionId);
    setPaying(false);
    tg.haptic.notify('success');
    replace([{ name: 'home' }, { name: 'ticket', ticketId, fresh: true }]);
  };

  useMainButton({
    text: picked.length ? t('pay', { p: money(total) }) : t('pick'),
    visible: true,
    active: picked.length > 0,
    progress: paying,
    onClick: pay,
  });

  const renderSeat = (s: Seat) => {
    const on = picked.includes(s.key);
    return (
      <button
        key={s.key}
        className={`seat${s.vip ? ' is-vip' : ''}${on ? ' is-on' : ''}`}
        disabled={s.taken}
        aria-pressed={on}
        aria-label={t('seatAria', { r: s.row, s: s.num, p: money(seatPrice(session, s)) })}
        onClick={() => tap(s)}
      >
        {on ? s.num : ''}
      </button>
    );
  };

  return (
    <div className="screen seats" style={{ ['--acc' as string]: movie.palette[2], ['--seat' as string]: `${seat}px` } as CSSProperties}>
      <div className="seats__head">
        <h2>{movie.title[lang]}</h2>
        <p>
          {cinema.name[lang]} · {hall.name[lang]}
        </p>
        <div className="seats__chips">
          <span>{fmtDate(session.date, locale)}</span>
          <span>{session.time}</span>
          <span>{session.format}</span>
        </div>
      </div>

      <div className="hallmap" ref={wrapRef}>
        <svg className="screenarc" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="arc" x1="0" x2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset=".5" stopColor="var(--accent)" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="glow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity=".35" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M10 22 Q150 -6 290 22 L290 40 L10 40Z" fill="url(#glow)" />
          <path d="M10 22 Q150 -6 290 22" fill="none" stroke="url(#arc)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="screenlabel">{t('screen')}</p>

        <div className="rows">
          {rows.map((row, ri) => {
            const sofa = row[0]?.vip && hall.kind !== 'vip' && ri === rows.length - 1 && hall.vipPairs > 0;
            const isVipHallSofa = hall.kind === 'vip' && ri === rows.length - 1 && hall.vipPairs > 0;
            const pairs = sofa || isVipHallSofa;
            return (
              <div key={ri} className="row">
                <span className="row__n">{ri + 1}</span>
                <div className="row__seats">
                  {pairs
                    ? Array.from({ length: row.length / 2 }, (_, p) => {
                        const a = row[p * 2];
                        const b = row[p * 2 + 1];
                        const on = picked.includes(a.key) && picked.includes(b.key);
                        return (
                          <button
                            key={a.key}
                            className={`sofa${on ? ' is-on' : ''}`}
                            disabled={a.taken}
                            aria-pressed={on}
                            aria-label={`${t('sofa')}: ${t('seatAria', { r: a.row, s: `${a.num}–${b.num}`, p: money(seatPrice(session, a) * 2) })}`}
                            onClick={() => tapPair(a, b)}
                          >
                            {on ? `${a.num}·${b.num}` : 'VIP'}
                          </button>
                        );
                      })
                    : row.map((s, si) => (
                        <span key={s.key} className="cell">
                          {renderSeat(s)}
                          {row.length >= 12 && (si === 2 || si === row.length - 4) && <i className="aisle" aria-hidden="true" />}
                        </span>
                      ))}
                </div>
                <span className="row__n">{ri + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="legend">
        <span>
          <i className="seat seat--key" /> {t('free')}
        </span>
        <span>
          <i className="seat seat--key is-taken" /> {t('taken')}
        </span>
        <span>
          <i className="seat seat--key is-on" /> {t('chosen')}
        </span>
        {hall.vipPairs > 0 && (
          <span>
            <i className="seat seat--key is-vip" /> {t('sofa')}
          </span>
        )}
      </div>

      {picked.length > 0 && (
        <div className="picked">
          {[...picked].sort(sortKeys).map((k) => {
            const s = seatByKey.get(k)!;
            return (
              <button key={k} className="picked__chip" onClick={() => tap(s)} aria-label={`✕ ${t('seatAria', { r: s.row, s: s.num, p: '' })}`}>
                <b>
                  {s.row} {t('row')} · {s.num} {t('seat')}
                </b>
                <small>{money(seatPrice(session, s))}</small>
                <i aria-hidden="true">✕</i>
              </button>
            );
          })}
          <p className="picked__total">
            {t('total')}: <b>{money(total)}</b>
          </p>
        </div>
      )}
    </div>
  );
}

export function sortKeys(a: string, b: string) {
  const [ar, as] = a.split('-').map(Number);
  const [br, bs] = b.split('-').map(Number);
  return ar - br || as - bs;
}
