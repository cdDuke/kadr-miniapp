import { useMemo, type ReactNode } from 'react';
import { iso } from '../data';
import { useT } from '../i18n';
import { useStore, type Tab } from '../store';
import { tg, useTg } from '../tg';

/** Seven-day date picker used on the movie screen. */
export function DateStrip() {
  const { t, locale } = useT();
  const date = useStore((s) => s.date);
  const setDate = useStore((s) => s.setDate);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
      }),
    []
  );
  return (
    <div className="dates" role="tablist">
      {days.map((d, i) => {
        const value = iso(d);
        const label = i === 0 ? t('today') : i === 1 ? t('tomorrow') : new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
        const weekend = d.getDay() === 0 || d.getDay() === 6;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={date === value}
            className={`date${date === value ? ' is-on' : ''}${weekend ? ' is-weekend' : ''}`}
            onClick={() => {
              tg.haptic.select();
              setDate(value);
            }}
          >
            <small>{label}</small>
            <b>{d.getDate()}</b>
          </button>
        );
      })}
    </div>
  );
}

export function TabBar() {
  const { t } = useT();
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const count = useStore((s) => s.tickets.length);
  const items: [Tab, string, ReactNode][] = [
    ['afisha', t('afisha'), <path key="a" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Zm0 4h16M9 4v6.5M15 4v6.5" />],
    ['tickets', t('tickets'), <path key="t" d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Zm11-2v12" />],
  ];
  return (
    <nav className="tabbar" aria-label="Navigation">
      {items.map(([id, label, icon]) => (
        <button
          key={id}
          className={tab === id ? 'is-on' : ''}
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => {
            tg.haptic.select();
            setTab(id);
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </g>
          </svg>
          <span>{label}</span>
          {id === 'tickets' && count > 0 && <i className="tabbar__badge">{count}</i>}
        </button>
      ))}
    </nav>
  );
}

/** In-page imitation of Telegram's header, MainButton and popup (browser demo only). */
export function MockHeader() {
  const { back } = useTg();
  const { lang } = useT();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  return (
    <header className="tg-head">
      <button className="tg-head__btn" onClick={() => (back ? tg.pressBackButton() : undefined)} aria-label={back ? 'Back' : 'Close'}>
        {back ? (
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div className="tg-head__title">
        <b>{lang === 'ru' ? 'Кадр' : 'Kadr'}</b>
        <small>mini app</small>
      </div>
      <button className="tg-head__btn" onClick={() => setTheme(theme === 'day' ? 'night' : 'day')} aria-label="Toggle theme">
        {theme === 'day' ? (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </header>
  );
}

export function MockMainButton() {
  const { main } = useTg();
  if (!main.visible) return null;
  return (
    <div className="tg-main">
      <button className={`tg-main__btn${main.active ? '' : ' is-off'}`} onClick={() => tg.pressMainButton()} disabled={!main.active} aria-busy={main.progress}>
        {main.progress ? <span className="spinner" aria-hidden="true" /> : main.text}
      </button>
    </div>
  );
}

export function MockPopup() {
  const { popup } = useTg();
  if (!popup) return null;
  const buttons = popup.buttons?.length ? popup.buttons : [{ id: 'ok', type: 'ok' as const }];
  return (
    <div className="tg-popup" role="dialog" aria-modal="true" aria-label={popup.title || popup.message}>
      <div className="tg-popup__box">
        {popup.title && <h3>{popup.title}</h3>}
        <p>{popup.message}</p>
        <div className="tg-popup__actions">
          {buttons.map((b, i) => (
            <button key={b.id ?? i} className={`tg-popup__btn${b.type === 'destructive' ? ' is-danger' : ''}${b.type === 'cancel' ? ' is-muted' : ''}`} onClick={() => tg.closePopup(b.type === 'cancel' ? null : b.id ?? 'ok')}>
              {b.text || (b.type === 'cancel' ? 'Cancel' : 'OK')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
