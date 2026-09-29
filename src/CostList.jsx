import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { FLOORS, CATEGORIES, TYPES, money, sum, days } from "./config";
import Icon from "./Icons.jsx";

export default function CostList({ costs, preset, edit }) {
  const [q, setQ] = useState({
    text: "",
    floor: "",
    category: "",
    type: "",
    paid: "",
    from: "",
    to: "",
    ...preset,
  });
  const s = (k) => (e) => setQ({ ...q, [k]: e.target.value });
  const t = q.text.toLowerCase();
  const list = costs.filter(
    (c) =>
      (!q.floor || c.floor === q.floor) &&
      (!q.category || c.category === q.category) &&
      (!q.type || c.type === q.type) &&
      (!q.paid || (q.paid === "paid") === !!c.paid) &&
      (!q.from || c.date >= q.from) &&
      (!q.to || c.date <= q.to) &&
      (!t ||
        [c.title, c.description, (c.workers || []).map((w) => w.name).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(t)),
  );
  const del = (c) =>
    window.confirm('Delete "' + c.title + '"?') &&
    deleteDoc(doc(db, "costs", c.id));
  const opts = (a) => a.map((x) => <option key={x}>{x}</option>);
  return (
    <>
      <div className="card filters">
        <input
          placeholder="Search title, description, worker"
          value={q.text}
          onChange={s("text")}
        />
        <div className="row2">
          <select value={q.floor} onChange={s("floor")}>
            <option value="">All floors</option>
            {opts(FLOORS)}
          </select>
          <select value={q.category} onChange={s("category")}>
            <option value="">All categories</option>
            {opts(CATEGORIES)}
          </select>
        </div>
        <div className="row2">
          <select value={q.type} onChange={s("type")}>
            <option value="">All types</option>
            {opts(TYPES)}
          </select>
          <select value={q.paid} onChange={s("paid")}>
            <option value="">Paid & unpaid</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        <div className="row3">
          <label style={{ width: "150px" }}>
            From
            <input type="date" value={q.from} onChange={s("from")} />
          </label>
          <label style={{ width: "150px" }}>
            To
            <input type="date" value={q.to} onChange={s("to")} />
          </label>
        </div>
      </div>
      <p className="sum">
        {list.length} entries · <b>{money(sum(list))}</b>
      </p>
      {!list.length && <p className="center">No costs match these filters.</p>}
      {list.map((c) => (
        <div key={c.id} className="card item">
          <div className="top">
            <div>
              <h3>{c.title}</h3>
              <small>
                {c.date} · {c.floor} · {c.category}
              </small>
            </div>
            <strong>{money(c.amount)}</strong>
          </div>
          <div>
            <span className="tag">{c.type}</span>
            <button
              className={"tag pay " + (c.paid ? "ok" : "no")}
              onClick={() =>
                updateDoc(doc(db, "costs", c.id), { paid: !c.paid })
              }
            >
              {c.paid ? "Paid" : "Unpaid"}
            </button>
          </div>
          {c.description && <p>{c.description}</p>}
          {c.workers?.length > 0 && (
            <div className="wk">
              {c.workers.map((w, i) => (
                <div key={i}>
                  <span>{w.name}</span>
                  <span>{w.period}</span>
                  <p>{money(w.amount)}</p>
                </div>
              ))}
              <div className="wt">
                <span>
                  {c.workers.length} workers 
                </span>
                <b>{money(sum(c.workers))}</b>
              </div>
            </div>
          )}
          {c.bills?.length > 0 && (
            <div className="thumbs">
              {c.bills.map((b, i) => (
                <a key={i} href={b} target="_blank" rel="noreferrer">
                  <img src={b} alt="Bill" />
                </a>
              ))}
            </div>
          )}
          <div className="acts">
            <button
              className="ic"
              aria-label="Edit"
              title="Edit"
              onClick={() => edit(c)}
            >
              <Icon n="edit" />
            </button>
            <button
              className="ic red"
              aria-label="Delete"
              title="Delete"
              onClick={() => del(c)}
            >
              <Icon n="del" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
