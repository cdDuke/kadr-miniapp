import { create } from 'zustand';
import { iso, type Lang, type Ticket } from './data';
import { inTelegram, tg } from './tg';

export type Screen =
  | { name: 'home' }
  | { name: 'movie'; id: string }
  | { name: 'seats'; sessionId: string }
  | { name: 'ticket'; ticketId: string; fresh?: boolean }
  | { name: 'tickets' };

export type Tab = 'afisha' | 'tickets';
export type MockTheme = 'day' | 'night';

const TICKETS_KEY = 'kadr_tickets';
export const MAX_SEATS = 6;

function initialLang(): Lang {
  const code = tg.user?.language_code;
  if (inTelegram && code) return /^(ru|uk|be|kk)/.test(code) ? 'ru' : 'en';
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return 'ru';
}

type State = {
  lang: Lang;
  theme: MockTheme;
  tab: Tab;
  stack: Screen[];
  direction: 1 | -1;
  date: string;
  genre: string;
  picked: Record<string, string[]>; // sessionId → seat keys
  tickets: Ticket[];

  setLang: (l: Lang) => void;
  setTheme: (t: MockTheme) => void;
  setTab: (t: Tab) => void;
  push: (s: Screen) => void;
  pop: () => void;
  replace: (stack: Screen[]) => void;
  setDate: (d: string) => void;
  setGenre: (g: string) => void;
  toggleSeat: (sessionId: string, key: string) => 'added' | 'removed' | 'limit';
  clearSeats: (sessionId: string) => void;
  addTicket: (t: Ticket) => Promise<void>;
  loadTickets: () => Promise<void>;
};

export const useStore = create<State>()((set, get) => ({
  lang: initialLang(),
  theme: tg.colorScheme() === 'dark' ? 'night' : 'day',
  tab: 'afisha',
  stack: [{ name: 'home' }],
  direction: 1,
  date: iso(new Date()),
  genre: 'all',
  picked: {},
  tickets: [],

  setLang: (lang) => {
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* ignore */
    }
    set({ lang });
  },
  setTheme: (theme) => set({ theme }),
  setTab: (tab) => set({ tab, stack: [tab === 'afisha' ? { name: 'home' } : { name: 'tickets' }], direction: 1 }),
  push: (s) => set({ stack: [...get().stack, s], direction: 1 }),
  pop: () => {
    const { stack } = get();
    if (stack.length > 1) set({ stack: stack.slice(0, -1), direction: -1 });
  },
  replace: (stack) => set({ stack, direction: 1 }),
  setDate: (date) => set({ date }),
  setGenre: (genre) => set({ genre }),

  toggleSeat: (sessionId, key) => {
    const current = get().picked[sessionId] ?? [];
    if (current.includes(key)) {
      set({ picked: { ...get().picked, [sessionId]: current.filter((k) => k !== key) } });
      return 'removed';
    }
    if (current.length >= MAX_SEATS) return 'limit';
    set({ picked: { ...get().picked, [sessionId]: [...current, key] } });
    return 'added';
  },
  clearSeats: (sessionId) => {
    const next = { ...get().picked };
    delete next[sessionId];
    set({ picked: next });
  },

  addTicket: async (t) => {
    const tickets = [t, ...get().tickets].slice(0, 30);
    set({ tickets });
    await tg.storage.set(TICKETS_KEY, JSON.stringify(tickets));
  },
  loadTickets: async () => {
    const raw = await tg.storage.get(TICKETS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Ticket[];
      if (Array.isArray(parsed)) set({ tickets: parsed });
    } catch {
      /* corrupted value — start fresh */
    }
  },
}));

export const useScreen = () => useStore((s) => s.stack[s.stack.length - 1]);
