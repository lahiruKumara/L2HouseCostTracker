import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "./firebase";
import Dashboard from "./Dashboard.jsx";
import CostList from "./CostList.jsx";
import CostForm from "./CostForm.jsx";
import Icon from "./Icons.jsx";

function Logo() {
  return (
    <img
      src="/logo.png"
      alt=""
      className="logo"
      onError={(e) => (e.target.style.display = "none")}
    />
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const go = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch {
      setErr("Email or password is incorrect.");
    }
  };
  return (
    <div className="login">
      <form onSubmit={go} className="card">
        <Logo />
        <h1>House Cost Tracker</h1>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
        </label>
        {err && <p className="err">{err}</p>}
        <button className="btn" style={{ marginTop:"60px" }}>Log in</button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [costs, setCosts] = useState([]);
  const [page, setPage] = useState("home");
  const [editing, setEditing] = useState(null);
  const [preset, setPreset] = useState({});
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "costs"), orderBy("date", "desc")),
      (s) => setCosts(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, [user]);
  if (user === undefined) return <p className="center">Loading…</p>;
  if (!user) return <Login />;
  const open = (p, f = {}) => {
    setPreset(f);
    setEditing(null);
    setPage(p);
  };
  return (
    <div className="app">
      <header>
        <Logo />
        <h1>House Cost Tracker</h1>
        <button
          className="ic"
          aria-label="Log out"
          title="Log out"
          onClick={() => signOut(auth)}
        >
          <Icon n="power" />
        </button>
      </header>
      <main>
        {page === "home" && <Dashboard costs={costs} open={open} />}
        {page === "list" && (
          <CostList
            key={JSON.stringify(preset)}
            costs={costs}
            preset={preset}
            edit={(c) => {
              setEditing(c);
              setPage("form");
            }}
          />
        )}
        {page === "form" && (
          <CostForm
            key={editing?.id || "new"}
            item={editing}
            done={() => open("list")}
          />
        )}
      </main>
      <nav>
        {[
          ["home", "Dashboard", "home"],
          ["list", "All costs", "list"],
          ["form", "Add cost", "plus"],
        ].map(([k, l, i]) => (
          <button
            key={k}
            className={page === k ? "on" : ""}
            onClick={() => open(k)}
          >
            <Icon n={i} />
            <span>{l}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
