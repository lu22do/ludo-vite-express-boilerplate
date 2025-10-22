import "./App.css";

import { useState, useEffect } from "react";

import reactLogo from "./assets/react.svg";

function App() {
  const [count, setCount] = useState(0);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/hello");
        // try JSON first, fall back to text
        const contentType = res.headers.get("content-type") || "";
        let data: any;
        if (contentType.includes("application/json")) {
          data = await res.json();
          data = data?.message ?? JSON.stringify(data);
        } else {
          data = await res.text();
        }
        if (mounted) setServerMsg(String(data));
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Fetch error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>

        {/* server API result */}
        <div style={{ marginTop: 16 }}>
          {loading && <p>Loading server message...</p>}
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
          {!loading && !error && (
            <p>
              Server says:{" "}
              <strong>{serverMsg ?? "no message"}</strong>
            </p>
          )}
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
