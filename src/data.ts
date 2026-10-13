export type Lang = 'ru' | 'en';
type T = Record<Lang, string>;
export type Genre = 'scifi' | 'drama' | 'action' | 'animation' | 'adventure' | 'musical';
export type Format = '2D' | '3D' | 'IMAX';

export type Movie = {
  id: string;
  title: T;
  tagline: T;
  about: T;
  genre: Genre;
  minutes: number;
  age: string;
  rating: number;
  formats: Format[];
  cast: string[];
  palette: [string, string, string]; // background top, background bottom, accent
};

export const movies: Movie[] = [
  {
    id: 'polar', genre: 'scifi', minutes: 134, age: '16+', rating: 8.4, formats: ['IMAX', '2D'], palette: ['#071a3a', '#02060f', '#5dffd0'],
    title: { ru: 'Полярная ночь', en: 'Polar Night' },
    tagline: { ru: 'Свет, которого не должно быть', en: 'A light that should not exist' },
    about: {
      ru: 'Экипаж арктической станции замечает в небе сияние, которое повторяет сигналы с их собственного передатчика. Чтобы понять, кто им отвечает, придётся пережить самую длинную ночь в истории.',
      en: 'An Arctic station crew sees an aurora that repeats signals from their own transmitter. To learn who is answering, they must survive the longest night in history.',
    },
    cast: ['Алина Северова', 'Марк Лядов', 'Ён Ха', 'Пётр Ильин'],
  },
  {
    id: 'tram', genre: 'drama', minutes: 112, age: '12+', rating: 7.9, formats: ['2D'], palette: ['#3a1d0b', '#120904', '#ffb347'],
    title: { ru: 'Последний трамвай', en: 'The Last Tram' },
    tagline: { ru: 'Одна поездка, которая меняет всё', en: 'One ride that changes everything' },
    about: {
      ru: 'Вагоновожатая в последний рабочий день везёт по ночному городу пассажиров, у каждого из которых — своя развилка. К утру маршрут уже не будет прежним.',
      en: 'On her last shift a tram driver carries night passengers, each at a crossroads of their own. By morning the route will never be the same.',
    },
    cast: ['Вера Ланская', 'Игорь Демин', 'Соня Ким'],
  },
  {
    id: 'phoenix', genre: 'action', minutes: 126, age: '18+', rating: 8.1, formats: ['IMAX', '3D', '2D'], palette: ['#2a0306', '#070102', '#ff3b3b'],
    title: { ru: 'Код Феникс', en: 'Phoenix Code' },
    tagline: { ru: 'Сгореть, чтобы перезагрузиться', en: 'Burn down to reboot' },
    about: {
      ru: 'Хакер, которого все считают погибшим, возвращается, чтобы остановить алгоритм, переписывающий городскую энергосеть. У него 36 часов и ни одного союзника.',
      en: 'A hacker believed dead returns to stop an algorithm rewriting the city grid. He has 36 hours and no allies.',
    },
    cast: ['Даниил Орлов', 'Майя Ро', 'Тимур Азиз', 'Кира Белл'],
  },
  {
    id: 'fox', genre: 'animation', minutes: 98, age: '6+', rating: 8.7, formats: ['3D', '2D'], palette: ['#0d3b2e', '#04140f', '#ff8a3d'],
    title: { ru: 'Лисья тропа', en: 'Fox Trail' },
    tagline: { ru: 'Самый смелый — самый маленький', en: 'The bravest is the smallest' },
    about: {
      ru: 'Лисёнок Рыжик теряет семью во время лесного пожара и отправляется через весь лес, чтобы найти их. По дороге он заводит самых неожиданных друзей.',
      en: 'Little fox Ginger loses his family in a forest fire and crosses the whole woods to find them, making the unlikeliest friends on the way.',
    },
    cast: ['голоса: Ника Лис', 'Олег Бор', 'Аня Ветер'],
  },
  {
    id: 'storm', genre: 'adventure', minutes: 141, age: '12+', rating: 7.6, formats: ['IMAX', '2D'], palette: ['#0f2a33', '#050c0f', '#7fd1ff'],
    title: { ru: 'Шторм над Ладогой', en: 'Storm over Ladoga' },
    tagline: { ru: 'Маяк должен гореть', en: 'The lighthouse must stay lit' },
    about: {
      ru: 'Смотритель маяка и его дочь остаются единственной надеждой для рыбацкой флотилии, застигнутой штормом века. Основано на реальной истории.',
      en: 'A lighthouse keeper and his daughter are the only hope for a fishing fleet caught in the storm of the century. Based on a true story.',
    },
    cast: ['Степан Ростов', 'Лиза Невская', 'Артём Гай'],
  },
  {
    id: 'jazz', genre: 'musical', minutes: 107, age: '12+', rating: 8.0, formats: ['2D'], palette: ['#2b0f3d', '#0b0412', '#ff7ad9'],
    title: { ru: 'Джаз на крыше', en: 'Jazz on the Roof' },
    tagline: { ru: 'Город звучит иначе после полуночи', en: 'The city sounds different after midnight' },
    about: {
      ru: 'Уличная саксофонистка и бывший звукорежиссёр собирают оркестр из соседей по дому, чтобы спасти его от сноса. Музыкальная комедия с живыми номерами.',
      en: 'A street saxophonist and a retired sound engineer form an orchestra of neighbours to save their building. A musical comedy with live numbers.',
    },
    cast: ['Ева Ривз', 'Глеб Крылов', 'Мира Сон'],
  },
];

export type Hall = { id: string; name: T; kind: 'standard' | 'imax' | 'vip'; rows: number[]; vipPairs: number };
export type Cinema = { id: string; name: T; metro: T; halls: Hall[] };

// rows: seats per row (front → back); vipPairs: love-seat pairs in the last row
export const cinemas: Cinema[] = [
  {
    id: 'atrium', name: { ru: 'Кадр Атриум', en: 'Kadr Atrium' }, metro: { ru: 'м. Курская', en: 'Kurskaya' },
    halls: [
      { id: 'a1', name: { ru: 'Зал 1 · IMAX', en: 'Hall 1 · IMAX' }, kind: 'imax', rows: [12, 14, 14, 16, 16, 16, 16, 16, 14], vipPairs: 0 },
      { id: 'a2', name: { ru: 'Зал 2', en: 'Hall 2' }, kind: 'standard', rows: [10, 12, 12, 12, 14, 14, 14, 12], vipPairs: 4 },
    ],
  },
  {
    id: 'city', name: { ru: 'Кадр Сити', en: 'Kadr City' }, metro: { ru: 'м. Деловой центр', en: 'Delovoy Tsentr' },
    halls: [
      { id: 'c1', name: { ru: 'Зал 3 · VIP', en: 'Hall 3 · VIP' }, kind: 'vip', rows: [8, 8, 10, 10, 10], vipPairs: 5 },
      { id: 'c2', name: { ru: 'Зал 4', en: 'Hall 4' }, kind: 'standard', rows: [12, 12, 14, 14, 14, 14, 12, 12], vipPairs: 0 },
    ],
  },
  {
    id: 'park', name: { ru: 'Кадр Парк', en: 'Kadr Park' }, metro: { ru: 'м. Парк культуры', en: 'Park Kultury' },
    halls: [
      { id: 'p1', name: { ru: 'Зал 5', en: 'Hall 5' }, kind: 'standard', rows: [10, 10, 12, 12, 12, 12, 10], vipPairs: 3 },
    ],
  },
];

export type Session = {
  id: string; // movie|cinema|hall|date|time
  movieId: string;
  cinemaId: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  format: Format;
  price: number; // standard seat
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TIMES = ['10:20', '11:40', '13:10', '14:30', '16:00', '17:20', '18:45', '19:30', '20:50', '22:10', '23:30'];

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Deterministic schedule: every visitor sees the same sessions for a given day. */
export function sessionsFor(movie: Movie, date: string): Session[] {
  const out: Session[] = [];
  for (const c of cinemas) {
    const r = rng(hash(`${movie.id}|${c.id}|${date}`));
    for (const h of c.halls) {
      if (h.kind === 'imax' && !movie.formats.includes('IMAX')) continue;
      if (r() < 0.35) continue;
      const count = 2 + Math.floor(r() * 3);
      const picks = new Set<string>();
      while (picks.size < count) picks.add(TIMES[Math.floor(r() * TIMES.length)]);
      for (const time of [...picks].sort()) {
        const format: Format = h.kind === 'imax' ? 'IMAX' : movie.formats.includes('3D') && r() < 0.4 ? '3D' : '2D';
        const evening = Number(time.slice(0, 2)) >= 17;
        const base = format === 'IMAX' ? 690 : format === '3D' ? 490 : 390;
        const price = Math.round((base + (evening ? 160 : 0) + (h.kind === 'vip' ? 400 : 0)) / 10) * 10;
        out.push({ id: `${movie.id}|${c.id}|${h.id}|${date}|${time}`, movieId: movie.id, cinemaId: c.id, hallId: h.id, date, time, format, price });
      }
    }
  }
  return out;
}

export function parseSession(id: string): Session | null {
  const [movieId, , , date] = id.split('|');
  const movie = movies.find((m) => m.id === movieId);
  if (!movie || !date) return null;
  return sessionsFor(movie, date).find((s) => s.id === id) ?? null;
}

export const findCinema = (id: string) => cinemas.find((c) => c.id === id)!;
export const findHall = (cinemaId: string, hallId: string) => findCinema(cinemaId).halls.find((h) => h.id === hallId)!;

export type Seat = { row: number; num: number; vip: boolean; taken: boolean; key: string };

/** Rows of seats for a session; ~third of the hall is already sold. */
export function seatMap(session: Session): Seat[][] {
  const hall = findHall(session.cinemaId, session.hallId);
  const r = rng(hash(session.id));
  const fill = 0.22 + r() * 0.25;
  const rows: Seat[][] = hall.rows.map((count, ri) =>
    Array.from({ length: count }, (_, si) => ({ row: ri + 1, num: si + 1, vip: hall.kind === 'vip', taken: r() < fill * (ri > 2 && ri < hall.rows.length - 1 ? 1.3 : 0.7), key: `${ri + 1}-${si + 1}` }))
  );
  if (hall.vipPairs) {
    const row = hall.rows.length + 1;
    rows.push(Array.from({ length: hall.vipPairs * 2 }, (_, si) => ({ row, num: si + 1, vip: true, taken: false, key: `${row}-${si + 1}` })));
    // sofas are sold in pairs
    for (let p = 0; p < hall.vipPairs; p++) if (r() < 0.3) rows[row - 1][p * 2].taken = rows[row - 1][p * 2 + 1].taken = true;
  }
  return rows;
}

export const seatPrice = (session: Session, seat: Seat) => (seat.vip && findHall(session.cinemaId, session.hallId).kind !== 'vip' ? Math.round((session.price * 1.6) / 10) * 10 : session.price);

export type Ticket = {
  id: string;
  sessionId: string;
  seats: string[]; // "row-num"
  total: number;
  createdAt: number;
};

export const genres: Genre[] = ['scifi', 'drama', 'action', 'animation', 'adventure', 'musical'];
