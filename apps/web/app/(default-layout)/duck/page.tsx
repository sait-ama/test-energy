export default function DuckPage() {
  return (
    <div style={{ width: '100%', height: '100vh', border: 'none' }}>
      <iframe
        src="/duck/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#0b0f19',
        }}
        title="Большой Утиный День"
      />
    </div>
  );
}
