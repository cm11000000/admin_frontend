/**
 * Unit tests for resolveUserName utility.
 */

import { resolveUserName } from './utils';

describe('resolveUserName', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // @ts-ignore setup a mock window with localStorage
    global.window = {
      localStorage: (() => {
        let store: Record<string, string> = {};
        return {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => { store[key] = value; },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { store = {}; },
        };
      })(),
    } as any;
    // Clear storage before each test
    window.localStorage.clear();
  });

  afterEach(() => {
    // @ts-ignore restore window
    global.window = originalWindow as any;
  });

  test('prefers loginId when present', () => {
    window.localStorage.setItem('loginId', '10250');
    window.localStorage.setItem('userName', 'fallback@sp');
    expect(resolveUserName()).toBe('10250');
  });

  test('falls back to userName when loginId missing', () => {
    window.localStorage.setItem('userName', 'abh@sp');
    expect(resolveUserName()).toBe('abh@sp');
  });

  test('falls back to parsed user JSON (userName)', () => {
    window.localStorage.setItem('user', JSON.stringify({ userName: 'jsonuser@sp' }));
    expect(resolveUserName()).toBe('jsonuser@sp');
  });

  test('falls back to parsed user JSON (email)', () => {
    window.localStorage.setItem('user', JSON.stringify({ email: 'email@sp' }));
    expect(resolveUserName()).toBe('email@sp');
  });

  test('returns empty string when nothing present', () => {
    // Ensure storage empty
    expect(resolveUserName()).toBe('');
  });
});
