import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import History from '../pages/History.jsx';

function getDateOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function renderHistory() {
  return render(
    <MemoryRouter>
      <History />
    </MemoryRouter>
  );
}

function mockFetch(historyData = {}) {
  fetch.mockImplementation((url) => {
    if (url.includes('/api/notes')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => historyData });
  });
}

beforeEach(() => {
  mockFetch();
});

describe('History grid interactivity', () => {
  test('clicking an uncompleted dot marks it complete and shows checkmark', async () => {
    const today = getDateOffset(0);
    renderHistory();

    const dot = await screen.findByTestId(`dot-exercise-${today}`);
    expect(dot.textContent).toBe('');

    fireEvent.click(dot);
    expect(dot.textContent).toBe('✓');
  });

  test('clicking a completed dot removes the checkmark', async () => {
    const today = getDateOffset(0);
    mockFetch({ [today]: { exercise: true } });

    renderHistory();
    const dot = await screen.findByTestId(`dot-exercise-${today}`);
    await waitFor(() => expect(dot.textContent).toBe('✓'));

    fireEvent.click(dot);
    expect(dot.textContent).toBe('');
  });

  test('clicking a dot POSTs to /api/history', async () => {
    const today = getDateOffset(0);
    renderHistory();

    const dot = await screen.findByTestId(`dot-exercise-${today}`);
    fetch.mockClear();
    fireEvent.click(dot);

    const postCall = fetch.mock.calls.find(([_, opts]) => opts?.method === 'POST');
    expect(postCall).toBeDefined();
    expect(postCall[0]).toContain('/api/history');
  });

  test('clicking a dot updates the weekly summary count', async () => {
    const today = getDateOffset(0);
    renderHistory();

    const dot = await screen.findByTestId(`dot-exercise-${today}`);
    fireEvent.click(dot);

    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });
  });

  test('dots have cursor pointer style', async () => {
    const today = getDateOffset(0);
    renderHistory();

    const dot = await screen.findByTestId(`dot-exercise-${today}`);
    expect(dot.style.cursor).toBe('pointer');
  });

  test('dots have a title attribute', async () => {
    const today = getDateOffset(0);
    renderHistory();

    const dot = await screen.findByTestId(`dot-exercise-${today}`);
    expect(dot.getAttribute('title')).toBeTruthy();
  });
});
