export default function FlagsSection({ redFlags, greenFlags }) {
  if (!redFlags?.length && !greenFlags?.length) return null;
  return (
    <div className="flags-row">
      {redFlags?.length > 0 && (
        <div className="flags-section">
          <p className="flags-title red">🚩 Red Flags</p>
          <div className="chips">
            {redFlags.map((f, i) => (
              <span key={i} className="chip red-chip">{f}</span>
            ))}
          </div>
        </div>
      )}
      {greenFlags?.length > 0 && (
        <div className="flags-section">
          <p className="flags-title green">✅ Green Flags</p>
          <div className="chips">
            {greenFlags.map((f, i) => (
              <span key={i} className="chip green-chip">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}