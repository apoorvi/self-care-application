import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompletionHistory } from '../hooks/useCompletionHistory.js';

const today = () => new Date().toISOString().split('T')[0];

beforeEach(() => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
});

describe('useCompletionHistory', () => {
  test('fetches history from /api/history on mount', async () => {
    const stored = { '2024-06-01': { exercise: true } };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => stored });

    const { result } = renderHook(() => useCompletionHistory());

    await waitFor(() => {
      expect(result.current.history).toEqual(stored);
    });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/history'));
  });

  test('markComplete updates state optimistically and POSTs to backend', async () => {
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fetch.mockClear();
    act(() => { result.current.markComplete('exercise'); });

    const todayStr = today();
    expect(result.current.history[todayStr]?.exercise).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/history'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ date: todayStr, category: 'exercise', value: true })
      })
    );
  });

  test('toggleComplete on absent entry sets it to true and POSTs value: true', async () => {
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fetch.mockClear();
    act(() => { result.current.toggleComplete('2024-06-01', 'mental'); });

    expect(result.current.history['2024-06-01']?.mental).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/history'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ date: '2024-06-01', category: 'mental', value: true })
      })
    );
  });

  test('toggleComplete on true entry flips to false and POSTs value: false', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ '2024-06-01': { exercise: true } }) });
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(result.current.history['2024-06-01']?.exercise).toBe(true));

    fetch.mockClear();
    act(() => { result.current.toggleComplete('2024-06-01', 'exercise'); });

    expect(result.current.history['2024-06-01']?.exercise).toBe(false);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/history'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ date: '2024-06-01', category: 'exercise', value: false })
      })
    );
  });

  test('toggleComplete on false entry flips to true', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ '2024-06-01': { exercise: false } }) });
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(result.current.history).toEqual({ '2024-06-01': { exercise: false } }));

    act(() => { result.current.toggleComplete('2024-06-01', 'exercise'); });
    expect(result.current.history['2024-06-01']?.exercise).toBe(true);
  });

  test('toggleComplete preserves other categories on the same date', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ '2024-06-01': { exercise: true, mental: true } }) });
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(result.current.history['2024-06-01']?.mental).toBe(true));

    act(() => { result.current.toggleComplete('2024-06-01', 'exercise'); });
    expect(result.current.history['2024-06-01']?.mental).toBe(true);
  });

  test('toggleComplete preserves entries for other dates', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ '2024-06-01': { exercise: true }, '2024-06-02': { mental: true } })
    });
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(result.current.history['2024-06-02']?.mental).toBe(true));

    act(() => { result.current.toggleComplete('2024-06-01', 'exercise'); });
    expect(result.current.history['2024-06-02']?.mental).toBe(true);
  });

  test('getLast7Days reflects toggle reactively', async () => {
    const { result } = renderHook(() => useCompletionHistory());
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const todayStr = today();
    act(() => { result.current.toggleComplete(todayStr, 'reading'); });

    const days = result.current.getLast7Days();
    const todayEntry = days.find(d => d.date === todayStr);
    expect(todayEntry?.completions?.reading).toBe(true);
  });
});
