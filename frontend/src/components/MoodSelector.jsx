const moods = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'energized', label: 'Energized' },
  { value: 'tired', label: 'Tired' },
  { value: 'stressed', label: 'Stressed' }
];

export default function MoodSelector({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {moods.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  );
}
