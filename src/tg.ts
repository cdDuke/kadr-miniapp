/**
 * Thin adapter over the Telegram Mini Apps API.
 * Inside Telegram it drives the native MainButton / BackButton / popups /
 * haptics / CloudStorage. In a regular browser the same calls update an
 * in-page mock, so the app is fully usable as a web demo.
 */
import { useEffect, useRef, useSyncExternalStore } from 'react';

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotifyType = 'error' | 'success' | 'warning';
type PopupButton = { id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string };
export type PopupParams = { title?: string; message: string; buttons?: PopupButton[] };

interface WebApp {
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  initData: string;
  initDataUnsafe: { user?: { first_name?: string; language_code?: string }; query_id?: string };
  ready(): void;
  expand(): void;
  isVersionAtLeast(v: string): boolean;
  setHeaderColor(c: string): void;
  setBackgroundColor(c: string): void;
  sendData(data: string): void;
  showPopup(p: PopupParams, cb?: (id: string) => void): void;
  onEvent(e: string, cb: () => void): void;
  MainButton: {
    setParams(p: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback: { impactOccurred(s: ImpactStyle): void; notificationOccurred(t: NotifyType): void; selectionChanged(): void };
  CloudStorage: { getItem(k: string, cb: (err: unknown, v?: string) => void): void; setItem(k: string, v: string, cb?: (err: unknown) => void): void };
}

declare global {
  interface Window {
    Telegram?: { WebApp: WebApp };
  }
}

const wa: WebApp | undefined = window.Telegram?.WebApp;
/** Opened inside a Telegram client (the SDK reports "unknown" in a plain browser). */
export const inTelegram = Boolean(wa && wa.platform && wa.platform !== 'unknown');
const canCloud = inTelegram && wa!.isVersionAtLeast('6.9');
/** Only keyboard-button launches may call sendData(); Telegram leaves initData empty for them. */
export const canSendData = inTelegram && !wa!.initData;

export const ACCENT = '#ff4d6d';

type MainButtonState = { text: string; visible: boolean; active: boolean; progress: boolean };
type PopupState = (PopupParams & { resolve: (id: string | null) => void }) | null;
type Snapshot = { main: MainButtonState; back: boolean; popup: PopupState };

let snapshot: Snapshot = { main: { text: '', visible: false, active: true, progress: false }, back: false, popup: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<Snapshot>) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
};

let mainHandler: (() => void) | null = null;
let backHandler: (() => void) | null = null;

export const tg = {
  ready() {
    if (!inTelegram) return;
    wa!.ready();
    wa!.expand();
  },

  user: wa?.initDataUnsafe?.user,
  colorScheme: (): 'light' | 'dark' => (inTelegram ? wa!.colorScheme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  onThemeChange(cb: () => void) {
    if (inTelegram) wa!.onEvent('themeChanged', cb);
  },
  paintChrome(bg: string) {
    if (!inTelegram) return;
    try {
      wa!.setHeaderColor(bg);
      wa!.setBackgroundColor(bg);
    } catch {
      /* older clients */
    }
  },

  setMainButton(p: Partial<MainButtonState>) {
    const main = { ...snapshot.main, ...p };
    if (inTelegram) {
      wa!.MainButton.setParams({ text: main.text, color: ACCENT, text_color: '#ffffff', is_active: main.active, is_visible: main.visible });
      if (main.progress) wa!.MainButton.showProgress(false);
      else wa!.MainButton.hideProgress();
    }
    set({ main });
  },
  onMainButton(fn: () => void) {
    if (inTelegram) {
      if (mainHandler) wa!.MainButton.offClick(mainHandler);
      wa!.MainButton.onClick(fn);
    }
    mainHandler = fn;
    return () => {
      if (inTelegram) wa!.MainButton.offClick(fn);
      if (mainHandler === fn) mainHandler = null;
    };
  },
  /** used by the in-page mock button */
  pressMainButton() {
    if (snapshot.main.active && !snapshot.main.progress) mainHandler?.();
  },

  setBackButton(fn: (() => void) | null) {
    if (inTelegram) {
      if (backHandler) wa!.BackButton.offClick(backHandler);
      if (fn) {
        wa!.BackButton.onClick(fn);
        wa!.BackButton.show();
      } else wa!.BackButton.hide();
    }
    backHandler = fn;
    set({ back: Boolean(fn) });
  },
  pressBackButton() {
    backHandler?.();
  },

  haptic: {
    impact(style: ImpactStyle = 'light') {
      if (inTelegram) wa!.HapticFeedback.impactOccurred(style);
      else navigator.vibrate?.(8);
    },
    select() {
      if (inTelegram) wa!.HapticFeedback.selectionChanged();
      else navigator.vibrate?.(4);
    },
    notify(type: NotifyType) {
      if (inTelegram) wa!.HapticFeedback.notificationOccurred(type);
      else navigator.vibrate?.(type === 'success' ? [10, 40, 10] : 30);
    },
  },

  popup(p: PopupParams): Promise<string | null> {
    return new Promise((resolve) => {
      if (inTelegram) wa!.showPopup(p, (id) => resolve(id || null));
      else set({ popup: { ...p, resolve } });
    });
  },
  closePopup(id: string | null) {
    snapshot.popup?.resolve(id);
    set({ popup: null });
  },

  storage: {
    get(key: string): Promise<string | null> {
      if (canCloud) return new Promise((r) => wa!.CloudStorage.getItem(key, (err, v) => r(err ? null : v || null)));
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    set(key: string, value: string): Promise<void> {
      if (canCloud) return new Promise((r) => wa!.CloudStorage.setItem(key, value, () => r()));
      try {
        localStorage.setItem(key, value);
      } catch {
        /* private mode */
      }
      return Promise.resolve();
    },
  },

  /** Works only when the app was opened from a keyboard button; the client then closes the app. */
  sendData(data: string) {
    if (!inTelegram) return false;
    try {
      wa!.sendData(data);
      return true;
    } catch {
      return false;
    }
  },

  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => snapshot,
};

export const useTg = () => useSyncExternalStore(tg.subscribe, tg.getSnapshot);

/** Declaratively control the MainButton from a screen. */
export function useMainButton(opts: { text: string; visible: boolean; active?: boolean; progress?: boolean; onClick: () => void }) {
  const ref = useRef(opts.onClick);
  ref.current = opts.onClick;
  useEffect(() => tg.onMainButton(() => ref.current()), []);
  useEffect(() => {
    tg.setMainButton({ text: opts.text, visible: opts.visible, active: opts.active ?? true, progress: opts.progress ?? false });
  }, [opts.text, opts.visible, opts.active, opts.progress]);
  useEffect(() => () => tg.setMainButton({ visible: false, progress: false }), []);
}

export function useBackButton(fn: (() => void) | null) {
  const ref = useRef(fn);
  ref.current = fn;
  const enabled = Boolean(fn);
  useEffect(() => {
    tg.setBackButton(enabled ? () => ref.current?.() : null);
    return () => tg.setBackButton(null);
  }, [enabled]);
}
