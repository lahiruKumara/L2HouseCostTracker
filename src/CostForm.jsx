import { useState } from "react";
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { FLOORS, CATEGORIES, TYPES, PERIODS, days, money } from "./config";
import Icon from "./Icons.jsx";

const shrink = (f) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const s = Math.min(1, 1000 / Math.max(i.width, i.height)),
          c = document.createElement("canvas");
        c.width = i.width * s;
        c.height = i.height * s;
        c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.6));
      };
      i.src = r.result;
    };
    r.readAsDataURL(f);
  });

export default function CostForm({ item, done }) {
  const [f, setF] = useState(
    item
      ? { workers: [], ...item }
      : {
          title: "",
          description: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
          floor: FLOORS[0],
          category: CATEGORIES[0],
          type: TYPES[0],
          workers: [],
          paid: false,
          bills: [],
        },
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) =>
    setF({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const setW = (i, v) =>
    setF({
      ...f,
      workers: f.workers.map((w, j) => (j === i ? { ...w, ...v } : w)),
    });
  const pick = async (e) => {
    const imgs = await Promise.all([...e.target.files].map(shrink));
    setF({ ...f, bills: [...f.bills, ...imgs].slice(0, 4) });
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const ws = f.type.includes("Wage")
        ? f.workers
            .filter((w) => w.name.trim())
            .map((w) => ({ ...w, amount: Number(w.amount || 0) }))
        : [];
      const { id, ...data } = {
        ...f,
        workers: ws,
        amount: ws.length
          ? ws.reduce((s, w) => s + w.amount, 0)
          : Number(f.amount),
      };
      if (item) await updateDoc(doc(db, "costs", item.id), data);
      else
        await addDoc(collection(db, "costs"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      done();
    } catch {
      setErr("Could not save. Try fewer or smaller bill photos.");
      setBusy(false);
    }
  };
  const wage = f.type.includes("Wage");
  const wtotal = f.workers.reduce((s, w) => s + Number(w.amount || 0), 0);
  const auto = wage && f.workers.length > 0;
  return (
    <form onSubmit={save} className="card form">
      <h2>{item ? "Edit cost" : "Add cost"}</h2>
      <label>
        Title
        <input
          value={f.title}
          onChange={set("title")}
          required
          placeholder="e.g. Cement 50 bags"
        />
      </label>
            <label>
        Cost type
        <select value={f.type} onChange={set("type")}>
          {TYPES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <div className="row2">
        <label>
          Amount{auto && " (auto total)"}
          <input
            type="number"
            min="0"
            step="any"
            value={auto ? wtotal : f.amount}
            readOnly={auto}
            onChange={set("amount")}
            required
          />
        </label>
        <label>
          Date
          <input type="date" value={f.date} onChange={set("date")} required />
        </label>
      </div>
      <div className="row2">
        <label>
          Floor
          <select value={f.floor} onChange={set("floor")}>
            {FLOORS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={f.category} onChange={set("category")}>
            {CATEGORIES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      {wage && (
        <div className="wk-form">
          <b>Workers</b>
          {f.workers.map((w, i) => (
            <div key={i} className="wrow">
              <input
                placeholder="Worker name"
                value={w.name}
                onChange={(e) => setW(i, { name: e.target.value })}
              />
              <select
                value={w.period}
                onChange={(e) => setW(i, { period: e.target.value })}
              >
                {PERIODS.map((p) => (
                  <option key={p[0]}>{p[0]}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Cost"
                value={w.amount ?? ""}
                onChange={(e) => setW(i, { amount: e.target.value })}
              />
              <button
                type="button"
                className="ic red"
                aria-label="Remove worker"
                onClick={() =>
                  setF({ ...f, workers: f.workers.filter((_, j) => j !== i) })
                }
              >
                <Icon n="x" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn ghost"
            onClick={() =>
              setF({
                ...f,
                workers: [
                  ...f.workers,
                  { name: "", period: "1 day", amount: "" },
                ],
              })
            }
          >
            <Icon n="plus" size={16} /> Add worker
          </button>
          {f.workers.length > 0 && (
            <small>
              {f.workers.length} workers · {days(f.workers)} days ·{" "}
              {money(wtotal)}
            </small>
          )}
        </div>
      )}
      <label>
        Description
        <textarea
          rows="3"
          value={f.description}
          onChange={set("description")}
          placeholder="Supplier, work done, notes…"
        />
      </label>
      <label className="chk">
        <input type="checkbox" checked={f.paid} onChange={set("paid")} /> Paid
      </label>
      <label>
        Bill pictures (up to 4)
        <input type="file" accept="image/*" multiple onChange={pick} />
      </label>
      <div className="thumbs">
        {f.bills.map((b, i) => (
          <div key={i} className="th">
            <img src={b} alt="Bill" />
            <button
              type="button"
              onClick={() =>
                setF({ ...f, bills: f.bills.filter((_, j) => j !== i) })
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {err && <p className="err">{err}</p>}
      <div className="row2">
        <button type="button" className="btn ghost" onClick={done}>
          Cancel
        </button>
        <button className="btn" disabled={busy}>
          {busy ? "Saving…" : "Save cost"}
        </button>
      </div>
    </form>
  );
}
