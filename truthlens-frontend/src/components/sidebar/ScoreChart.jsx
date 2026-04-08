import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useApp } from "../../context/AppContext";
import { scoreColor } from "../../data/sources";

function CustomDot({ cx, cy, payload }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={scoreColor(payload.score)}
      stroke="white"
      strokeWidth={2}
    />
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-score" style={{ color: scoreColor(d.score) }}>
        {d.score}/100
      </p>
      <p className="chart-tooltip-verdict">{d.verdict}</p>
      <p className="chart-tooltip-text">{d.label}</p>
    </div>
  );
}

export default function ScoreChart() {
  const { history } = useApp();

  if (history.length < 2) {
    return (
      <div className="sidebar-card">
        <p className="sidebar-title">Score History</p>
        <p className="empty-msg">Analyze 2+ articles to see chart</p>
      </div>
    );
  }

  const data = [...history]
    .reverse()
    .slice(-10)
    .map((h, i) => ({
      index: i + 1,
      score: h.score,
      verdict: h.verdict,
      label: h.input.slice(0, 30) + "...",
    }));

  return (
    <div className="sidebar-card">
      <p className="sidebar-title">Score History</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: "#aaa" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#aaa" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={70}
            stroke="#639922"
            strokeDasharray="3 3"
            strokeOpacity={0.4}
          />
          <ReferenceLine
            y={40}
            stroke="#E24B4A"
            strokeDasharray="3 3"
            strokeOpacity={0.4}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#888"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="chart-legend">
        <span className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: "#639922" }} />
          Credible
        </span>
        <span className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: "#EF9F27" }} />
          Uncertain
        </span>
        <span className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: "#E24B4A" }} />
          Fake
        </span>
      </div>
    </div>
  );
}