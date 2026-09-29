import { FLOORS, CATEGORIES, money, sum } from "./config";
const COLORS = [
  "#12472a",
  "#1f7a45",
  "#3fa66a",
  "#7bc99a",
  "#b7e2c6",
  "#8a9a2b",
  "#bbc927ff",
  "#2f6f73",
  "#5aa9a0",
  "#a3b18a",
];

function Pie({ data, onPick }) {
  const total = data.reduce((s, d) => s + d.v, 0);
  if (!total)
    return <p>No costs yet.</p>;
  let a = -Math.PI / 2;
  const R = 90;
  const arcs = data.map((d, i) => {
    const t = (d.v / total) * 2 * Math.PI,
      x1 = 100 + R * Math.cos(a),
      y1 = 100 + R * Math.sin(a);
    a += t;
    const x2 = 100 + R * Math.cos(a),
      y2 = 100 + R * Math.sin(a);
    return {
      ...d,
      col: COLORS[i % COLORS.length],
      p:
        data.length > 1
          ? `M100 100L${x1} ${y1}A${R} ${R} 0 ${t > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`
          : null,
    };
  });
  return (
    <div className="pie">
      <svg viewBox="0 0 200 200" role="img" aria-label="Pie chart of costs">
        {arcs.map((s) =>
          s.p ? (
            <path
              key={s.k}
              d={s.p}
              fill={s.col}
              stroke="#fff"
              strokeWidth="2"
              onClick={() => onPick(s.k)}
            />
          ) : (
            <circle key={s.k} cx="100" cy="100" r={R} fill={s.col} />
          ),
        )}
      </svg>
      <ul>
        {arcs.map((s) => (
          <li key={s.k} onClick={() => onPick(s.k)}>
            <i style={{ background: s.col }} />
            {s.k}
            <b>{Math.round((s.v / total) * 100)}%</b>
            <small>{money(s.v)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard({ costs, open }) {
  const paid = costs.filter((c) => c.paid),
    unpaid = costs.filter((c) => !c.paid);
  const by = (list, key) =>
    list
      .map((k) => ({ k, v: sum(costs.filter((c) => c[key] === k)) }))
      .filter((d) => d.v > 0)
      .sort((a, b) => b.v - a.v);
  return (
    <>
      <section className="total">
        <span>Total spent</span>
        <strong>{money(sum(costs))}</strong>
        <div className="split">
          <div>
            Paid<b>{money(sum(paid))}</b>
          </div>
          <div>
            Unpaid<b className="warn">{money(sum(unpaid))}</b>
          </div>
        </div>
      </section>
      <h2>By floor</h2>
      <div className="grid">
        {FLOORS.map((f) => {
          const l = costs.filter((c) => c.floor === f);
          const u = l.filter((c) => !c.paid);
          return (
            <button
              key={f}
              className="card floor"
              onClick={() => open("list", { floor: f })}
            >
              <h3>{f}</h3>
              <strong>{money(sum(l))}</strong>
              <small>
                {l.length} entries · Unpaid {money(sum(u))}
              </small>
            </button>
          );
        })}
      </div>
      <h2>Cost share by floor</h2>
      <div className="card">
        <Pie
          data={by(FLOORS, "floor")}
          onPick={(k) => open("list", { floor: k })}
        />
      </div>
      <h2>Cost share by category</h2>
      <div className="card">
        <Pie
          data={by(CATEGORIES, "category")}
          onPick={(k) => open("list", { category: k })}
        />
      </div>
      <h2>Paid wages</h2>
      <div className="card">
        <b>{money(sum(paid.filter((c) => c.type.includes("Wage"))))}</b> paid to workers
        <button
          className="link"
          onClick={() => open("list", { paid: "paid", type: "Daily Wage" })}
        >
          Daily
        </button>
      
      </div>
    </>
  );
}
