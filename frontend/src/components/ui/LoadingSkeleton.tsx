export function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={style} />;
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div style={{ padding: '8px 12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <Skeleton style={{ width: 70, height: 14 }} />
          <Skeleton style={{ flex: 1, height: 14 }} />
          <Skeleton style={{ width: 60, height: 14 }} />
          <Skeleton style={{ width: 50, height: 14 }} />
          <Skeleton style={{ width: 60, height: 14 }} />
        </div>
      ))}
    </div>
  );
}
