import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { findCinema, findHall, movies, parseSession } from '../data';
import { useT } from '../i18n';
import { useStore } from '../store';
import { canSendData, tg } from '../tg';
import Poster from '../components/Poster';
import { fmtDate } from './Seats';

export default function Ticket({ ticketId, fresh }: { ticketId: string; fresh?: boolean }) {
  const { t, lang, locale, money } = useT();
  const ticket = useStore((s) => s.tickets.find((x) => x.id === ticketId));
  const setTab = useStore((s) => s.setTab);
  const [qr, setQr] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!ticket) return;
    // the QR encoder is loaded on demand, only when a ticket is opened
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toString(`KADR|${ticket.id}|${ticket.sessionId}|${ticket.seats.join(',')}`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#ffffff' } }))
      .then(setQr);
  }, [ticket]);

  if (!ticket) return <div className="screen" />;
  const session = parseSession(ticket.sessionId)!;
  const movie = movies.find((m) => m.id === session.movieId)!;
  const cinema = findCinema(session.cinemaId);
  const hall = findHall(session.cinemaId, session.hallId);
  const seatsText = ticket.seats.map((k) => k.split('-')).map(([r, s]) => `${r}/${s}`).join(', ');

  const share = async () => {
    const text = `${movie.title[lang]} — ${fmtDate(session.date, locale)}, ${session.time}, ${cinema.name[lang]}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Кадр', text });
      else {
        await navigator.clipboard.writeText(text);
        setNote(t('copied'));
      }
    } catch {
      /* user dismissed */
    }
  };

  const sendToChat = () => {
    tg.sendData(JSON.stringify({ type: 'ticket', id: ticket.id, movie: movie.title.ru, date: session.date, time: session.time, cinema: cinema.name.ru, hall: hall.name.ru, seats: ticket.seats, total: ticket.total }));
  };

  return (
    <div className="screen ticket-screen" style={{ ['--acc' as string]: movie.palette[2] }}>
      {fresh && (
        <motion.div className="paid" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <motion.span className="paid__check" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.1 }}>
            ✓
          </motion.span>
          <b>{t('paid')}</b>
        </motion.div>
      )}

      <motion.article className="ticket" initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
        <div className="ticket__top">
          <div className="ticket__poster">
            <Poster movie={movie} lang={lang} decorative />
          </div>
          <div>
            <h2>{movie.title[lang]}</h2>
            <p>
              {fmtDate(session.date, locale)} · <b>{session.time}</b>
            </p>
            <p>
              {cinema.name[lang]} · {session.format}
            </p>
          </div>
        </div>
        <dl className="ticket__grid">
          <div>
            <dt>{t('hall')}</dt>
            <dd>{hall.name[lang].replace(/^\D*/, '') || hall.name[lang]}</dd>
          </div>
          <div>
            <dt>
              {t('row')} / {t('seat')}
            </dt>
            <dd>{seatsText}</dd>
          </div>
          <div>
            <dt>{t('total')}</dt>
            <dd>{money(ticket.total)}</dd>
          </div>
          <div>
            <dt>{t('order')}</dt>
            <dd className="mono">{ticket.id}</dd>
          </div>
        </dl>
        <div className="ticket__cut" aria-hidden="true" />
        <div className="ticket__qr">
          <div className="qr" role="img" aria-label={`QR ${ticket.id}`} dangerouslySetInnerHTML={{ __html: qr }} />
          <small>{t('showQr')}</small>
        </div>
      </motion.article>

      <div className="ticket-actions">
        {canSendData && (
          <button className="btn btn--accent" onClick={sendToChat}>
            {t('sendChat')}
          </button>
        )}
        <button className="btn" onClick={share}>
          {t('share')}
        </button>
        <button className="btn btn--ghost" onClick={() => setTab('afisha')}>
          {t('back')}
        </button>
        {note && <p className="note">{note}</p>}
      </div>
    </div>
  );
}
