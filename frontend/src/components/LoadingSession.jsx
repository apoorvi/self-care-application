const cardStyle = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius)',
  padding: 20,
  marginBottom: 12
};

function SkeletonBar({ width = '100%', height = 14, mb = 8 }) {
  return (
    <div
      className="shimmer"
      style={{ width, height, borderRadius: 4, marginBottom: mb }}
    />
  );
}

function SkeletonCard() {
  return (
    <div style={cardStyle}>
      <SkeletonBar width="60%" height={16} mb={12} />
      <SkeletonBar width="90%" />
      <SkeletonBar width="75%" />
      <SkeletonBar width="45%" height={12} mb={0} />
    </div>
  );
}

export default function LoadingSession() {
  return (
    <div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
