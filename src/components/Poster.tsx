import { memo, useId, type ReactNode } from 'react';
import { rng, type Lang, type Movie } from '../data';

const W = 300;
const H = 450;

function motif(m: Movie, id: string): ReactNode {
  const [, , acc] = m.palette;
  const r = rng(m.id.length * 7919 + m.id.charCodeAt(0));
  switch (m.id) {
    case 'polar':
      return (
        <>
          {Array.from({ length: 60 }, (_, i) => (
            <circle key={i} cx={r() * W} cy={r() * 240} r={r() * 1.3 + 0.3} fill="#fff" opacity={0.3 + r() * 0.7} />
          ))}
          <g filter={`url(#${id}-blur)`} opacity="0.75">
            <path d="M-20 120 C 60 40, 140 170, 220 80 S 330 60, 340 30" stroke={acc} strokeWidth="38" fill="none" opacity=".55" />
            <path d="M-20 170 C 80 100, 160 210, 240 130 S 330 120, 340 90" stroke="#8b6cff" strokeWidth="30" fill="none" opacity=".5" />
          </g>
          <circle cx="150" cy="380" r="150" fill={`url(#${id}-planet)`} />
          <ellipse cx="150" cy="300" rx="190" ry="26" fill="none" stroke={acc} strokeOpacity=".5" strokeWidth="2" transform="rotate(-8 150 300)" />
        </>
      );
    case 'tram':
      return (
        <>
          <circle cx="150" cy="200" r="78" fill={`url(#${id}-sun)`} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="60" y={206 + i * 14} width="180" height={3 + i * 1.6} fill={m.palette[1]} opacity=".9" />
          ))}
          <rect x="0" y="262" width={W} height="190" fill="#120904" />
          {[-140, -70, 0, 70, 140].map((dx) => (
            <line key={dx} x1={150 + dx * 0.08} y1="262" x2={150 + dx * 2.6} y2={H} stroke={acc} strokeOpacity=".55" strokeWidth="1.5" />
          ))}
          {[280, 300, 330, 370, 420].map((y) => (
            <line key={y} x1="0" x2={W} y1={y} y2={y} stroke={acc} strokeOpacity={0.15 + (y - 262) / 600} />
          ))}
          <line x1="0" y1="120" x2={W} y2="150" stroke="#000" strokeOpacity=".6" />
          <line x1="0" y1="132" x2={W} y2="160" stroke="#000" strokeOpacity=".5" />
          <g transform="translate(118 222)">
            <rect width="64" height="40" rx="6" fill="#1b0e06" stroke={acc} strokeOpacity=".7" />
            {[6, 22, 38].map((x) => (
              <rect key={x} x={x} y="8" width="12" height="12" rx="2" fill={acc} opacity=".9" />
            ))}
            <line x1="32" y1="0" x2="40" y2="-24" stroke="#1b0e06" strokeWidth="2" />
          </g>
        </>
      );
    case 'phoenix':
      return (
        <>
          {[60, 100, 140, 180, 220].map((rr) => (
            <circle key={rr} cx="150" cy="190" r={rr} fill="none" stroke={acc} strokeOpacity=".16" strokeDasharray="4 8" />
          ))}
          <g fill={`url(#${id}-flame)`}>
            <path d="M150 200 L20 80 L70 190 L10 170 L90 250 L40 260 L140 290Z" />
            <path d="M150 200 L280 80 L230 190 L290 170 L210 250 L260 260 L160 290Z" />
            <path d="M150 120 L170 200 L150 330 L130 200Z" />
          </g>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={r() * 260} y={40 + r() * 300} width={20 + r() * 60} height="3" fill={i % 2 ? acc : '#fff'} opacity={0.25 + r() * 0.4} />
          ))}
        </>
      );
    case 'fox':
      return (
        <>
          <circle cx="210" cy="110" r="46" fill="#fff4d6" opacity=".9" />
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={r() * W} cy={140 + r() * 200} r={r() * 2 + 0.5} fill="#ffe08a" opacity={0.4 + r() * 0.6} />
          ))}
          {Array.from({ length: 9 }, (_, i) => {
            const x = i * 38 - 10;
            const h = 120 + r() * 80;
            return <path key={i} d={`M${x} 360 L${x + 30} ${360 - h} L${x + 60} 360Z`} fill={i % 2 ? '#0a2a20' : '#0f3a2c'} />;
          })}
          <g transform="translate(150 255)">
            <path d="M-62 -40 L-40 -98 L-14 -50 L14 -50 L40 -98 L62 -40 L0 50Z" fill={acc} />
            <path d="M-62 -40 L-20 -2 L0 50Z M62 -40 L20 -2 L0 50Z" fill="#fff3e6" />
            <path d="M-46 -56 L-40 -84 L-28 -58Z M46 -56 L40 -84 L28 -58Z" fill="#3b1a07" />
            <circle cx="-20" cy="-22" r="5" fill="#1c0c03" />
            <circle cx="20" cy="-22" r="5" fill="#1c0c03" />
            <path d="M-7 38 L7 38 L0 50Z" fill="#1c0c03" />
          </g>
          <rect x="0" y="355" width={W} height="100" fill="#04140f" />
        </>
      );
    case 'storm':
      return (
        <>
          {Array.from({ length: 40 }, (_, i) => {
            const x = r() * W;
            const y = r() * 300;
            return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 22} stroke="#bfe6ff" strokeOpacity=".25" />;
          })}
          <path d="M210 40 L180 120 L205 120 L170 200 L235 105 L208 105 L232 40Z" fill="#eaf6ff" opacity=".9" />
          <path d="M120 150 L-40 90 L-40 230Z" fill={`url(#${id}-beam)`} />
          <g transform="translate(120 150)">
            <path d="M-14 0 L14 0 L22 160 L-22 160Z" fill="#eef4f7" />
            {[30, 70, 110].map((y) => (
              <path key={y} d={`M${-14 - y * 0.05} ${y} L${14 + y * 0.05} ${y} L${15 + (y + 18) * 0.05} ${y + 18} L${-15 - (y + 18) * 0.05} ${y + 18}Z`} fill="#d64545" />
            ))}
            <rect x="-10" y="-18" width="20" height="18" fill="#ffe7a3" />
            <path d="M-14 -18 L0 -34 L14 -18Z" fill="#2b3b44" />
          </g>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M0 ${300 + i * 26} Q 40 ${280 + i * 26} 80 ${300 + i * 26} T 160 ${300 + i * 26} T 240 ${300 + i * 26} T 320 ${300 + i * 26} V 460 H0Z`} fill={['#1d4a57', '#16404c', '#103540', '#0a2a33'][i]} />
          ))}
        </>
      );
    default: // jazz
      return (
        <>
          <circle cx="190" cy="130" r="70" fill={`url(#${id}-moon)`} />
          {['♪', '♫', '♩', '♬'].map((n, i) => (
            <text key={i} x={40 + i * 60 + r() * 20} y={90 + r() * 120} fontSize={22 + r() * 18} fill={i % 2 ? acc : '#fff'} opacity=".75">
              {n}
            </text>
          ))}
          {Array.from({ length: 12 }, (_, i) => {
            const w = 22 + r() * 18;
            const h = 70 + r() * 120;
            const x = i * 26 - 6;
            return (
              <g key={i}>
                <rect x={x} y={360 - h} width={w} height={h + 100} fill={i % 2 ? '#170824' : '#1f0b30'} />
                {Array.from({ length: 4 }, (_, k) => (
                  <rect key={k} x={x + 4 + (k % 2) * 9} y={360 - h + 10 + Math.floor(k / 2) * 18} width="5" height="7" fill="#ffd36e" opacity={r() > 0.4 ? 0.9 : 0.15} />
                ))}
              </g>
            );
          })}
          <path d="M70 360 C 70 300, 110 290, 112 250 L 118 250 C 118 300, 80 310, 84 360Z" fill="#e8b84a" />
        </>
      );
  }
}

/** `decorative` hides the poster from assistive tech when the title is already next to it (cards, tickets). */
function Poster({ movie, lang, className, decorative, slice }: { movie: Movie; lang: Lang; className?: string; decorative?: boolean; slice?: boolean }) {
  const id = 'p' + useId().replace(/:/g, '');
  const [top, bottom, acc] = movie.palette;
  const words = movie.title[lang].toUpperCase().split(' ');
  const lines = words.length <= 2 ? words : [words[0], words.slice(1).join(' ')];
  const size = lang === 'ru' ? 33 : 36;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={slice ? 'xMidYMid slice' : undefined} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': movie.title[lang] })}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${id}-planet`} cx="40%" cy="20%">
          <stop offset="0" stopColor="#1c3b6e" />
          <stop offset=".7" stopColor="#081428" />
          <stop offset="1" stopColor={acc} stopOpacity=".6" />
        </radialGradient>
        <linearGradient id={`${id}-sun`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="1" stopColor="#ff6a3d" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset=".5" stopColor={acc} />
          <stop offset="1" stopColor="#5a0610" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="1" x2="0">
          <stop offset="0" stopColor="#fff6c9" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff6c9" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-moon`}>
          <stop offset="0" stopColor="#ffe0f4" />
          <stop offset="1" stopColor={acc} />
        </radialGradient>
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".85" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      {motif(movie, id)}
      <rect width={W} height={H} fill={`url(#${id}-fade)`} />
      <text className="poster__brand" x="20" y="34" fill="#fff" opacity=".7" fontSize="11" fontWeight="700" letterSpacing="3" fontFamily="Manrope, system-ui, sans-serif">
        KADR · ORIGINAL
      </text>
      <rect x={W - 56} y="18" width="38" height="22" rx="6" fill="#000" fillOpacity=".45" stroke="#fff" strokeOpacity=".4" />
      <text x={W - 37} y="33.5" fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Manrope, system-ui, sans-serif">
        {movie.age}
      </text>
      {lines.map((ln, i) => (
        <text
          key={i}
          x="20"
          y={H - 34 - (lines.length - 1 - i) * (size + 6)}
          fill="#fff"
          fontSize={size}
          fontWeight="800"
          fontFamily="Unbounded, system-ui, sans-serif"
          letterSpacing="-0.5"
          textLength={ln.length > 9 ? W - 40 : undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {ln}
        </text>
      ))}
      <rect x="20" y={H - 22} width="40" height="3" rx="1.5" fill={acc} />
    </svg>
  );
}

export default memo(Poster);
