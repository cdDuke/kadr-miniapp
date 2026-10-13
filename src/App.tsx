import { useEffect, useRef, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useT } from './i18n';
import { useScreen, useStore } from './store';
import { ACCENT, inTelegram, tg, useBackButton } from './tg';
import { MockHeader, MockMainButton, MockPopup, TabBar } from './components/Chrome';
import Home from './screens/Home';
import Movie from './screens/Movie';
import Seats from './screens/Seats';
import Ticket from './screens/Ticket';
import Tickets from './screens/Tickets';

// Telegram theme presets for the browser demo (inside Telegram the client provides them)
const THEMES: Record<'day' | 'night', Record<string, string>> = {
  day: {
    bg: '#ffffff', 'secondary-bg': '#f0f1f5', 'section-bg': '#ffffff', text: '#111111', hint: '#8b8f98',
    link: '#2481cc', button: ACCENT, 'button-text': '#ffffff', 'subtitle-text': '#6d6d72', 'accent-text': '#2481cc', 'destructive-text': '#e53935',
  },
  night: {
    bg: '#17212b', 'secondary-bg': '#0e1621', 'section-bg': '#17212b', text: '#f5f5f5', hint: '#708499',
    link: '#6ab3f3', button: ACCENT, 'button-text': '#ffffff', 'subtitle-text': '#7d8b99', 'accent-text': '#6ab2f2', 'destructive-text': '#ec3942',
  },
};

function ScreenView() {
  const screen = useScreen();
  switch (screen.name) {
    case 'home':
      return <Home />;
    case 'movie':
      return <Movie id={screen.id} />;
    case 'seats':
      return <Seats sessionId={screen.sessionId} />;
    case 'ticket':
      return <Ticket ticketId={screen.ticketId} fresh={screen.fresh} />;
    default:
      return <Tickets />;
  }
}

export default function App() {
  const { t, lang } = useT();
  const stack = useStore((s) => s.stack);
  const direction = useStore((s) => s.direction);
  const pop = useStore((s) => s.pop);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const setLang = useStore((s) => s.setLang);
  const loadTickets = useStore((s) => s.loadTickets);
  const screen = stack[stack.length - 1];
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tg.ready();
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'ru' ? 'Кадр — билеты в кино · Telegram Mini App' : 'Kadr — cinema tickets · Telegram Mini App';
  }, [lang]);

  // inside Telegram follow the client's theme; in the demo use our presets
  useEffect(() => {
    if (!inTelegram) return;
    const paint = () => tg.paintChrome(getComputedStyle(document.documentElement).getPropertyValue('--tg-theme-secondary-bg-color').trim() || '#ffffff');
    paint();
    tg.onThemeChange(paint);
  }, []);

  useBackButton(stack.length > 1 ? pop : null);

  // reset scroll when the screen changes
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    if (inTelegram) window.scrollTo({ top: 0 });
  }, [screen]);

  const vars = inTelegram ? {} : (Object.fromEntries(Object.entries(THEMES[theme]).map(([k, v]) => [`--tg-theme-${k}-color`, v])) as CSSProperties);
  const showTabs = screen.name === 'home' || screen.name === 'tickets';
  const key = stack.length + ':' + JSON.stringify(screen);

  const app = (
    <div className={`app${inTelegram ? ' in-tg' : ''}`} style={vars} data-scheme={inTelegram ? tg.colorScheme() : theme === 'night' ? 'dark' : 'light'}>
      {!inTelegram && <MockHeader />}
      <div className="viewport" ref={scroller}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={key}
            className="page"
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '28%' : '-28%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? '-18%' : '18%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <ScreenView />
          </motion.div>
        </AnimatePresence>
      </div>
      {showTabs && <TabBar />}
      {!inTelegram && <MockMainButton />}
      {!inTelegram && <MockPopup />}
    </div>
  );

  if (inTelegram) return app;

  return (
    <div className="demo">
      <aside className="demo__info">
        <span className="demo__tag">
          <i className="demo__dot" aria-hidden="true" /> Telegram Mini App
        </span>
        <h1>
          {lang === 'ru' ? 'Кадр' : 'Kadr'}
          <span>.</span>
        </h1>
        <p className="demo__lead">{lang === 'ru' ? 'Билеты в кино прямо в Telegram: афиша, схема зала, оплата и билет с QR-кодом.' : 'Cinema tickets right inside Telegram: showtimes, seat map, checkout and a QR ticket.'}</p>
        <p className="demo__text">{t('demoText')}</p>
        <div className="demo__controls">
          <div>
            <small>{t('theme')}</small>
            <div className="seg seg--demo">
              {(['day', 'night'] as const).map((th) => (
                <button key={th} className={theme === th ? 'is-on' : ''} aria-pressed={theme === th} onClick={() => setTheme(th)}>
                  {t(th)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <small>{t('language')}</small>
            <div className="seg seg--demo">
              {(['ru', 'en'] as const).map((l) => (
                <button key={l} className={lang === l ? 'is-on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <a className="demo__link" href="https://github.com/cdDuke/kadr-miniapp">
          {t('code')} ↗
        </a>
      </aside>
      <div className="phone">
        <div className="phone__screen">{app}</div>
      </div>
    </div>
  );
}
