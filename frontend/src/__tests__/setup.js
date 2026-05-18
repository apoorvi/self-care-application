import '@testing-library/jest-dom';
import { vi } from 'vitest';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

global.fetch = vi.fn();

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
