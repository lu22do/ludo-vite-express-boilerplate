import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ItemCard from "./ItemCard";
import ItemPage from "./pages/ItemPage";

function App() {
  const [count, setCount] = useState(0);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // new form state
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string>("");

  // items list state
  const [items, setItems] = useState<any[]>([]);

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

  const writeDB = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = {
        name,
        quantity: Number(quantity) || 0,
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Server returned ${res.status}`);
      }

      const created = await res.json();
      setServerMsg(`Created item: ${created.name} (id: ${created._id ?? "n/a"})`);
      // clear form
      setName("");
      setQuantity("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  // new: delete an item by id
  const deleteItem = async (id?: string) => {
    if (!id) {
      setError("Missing item id");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Server returned ${res.status}`);
      }
      setServerMsg(`Deleted item: ${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src="/vite.svg" className="logo" alt="Vite logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img src="react.svg" className="logo react" alt="React logo" />
          </a>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Vite + React</h1>
                <div className="card">
                  <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                  </button>

                  {/* server API result */}
                  <div style={{ marginTop: 16 }}>
                    {loading && <p>Loading server message...</p>}
                    {error && <p style={{ color: "red" }}>Error: {error}</p>}
                    {!loading && !error && (
                      <p>
                        Server says: <strong>{serverMsg ?? "no message"}</strong>
                      </p>
                    )}
                  </div>

                  {/* new: add item form */}
                  <div style={{ marginTop: 16 }}>
                    <div>
                      <label>
                        Name:{" "}
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Item name"
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label>
                        Quantity:{" "}
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="0"
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => writeDB()} disabled={loading || !name}>
                        Add item
                      </button>
                      <button
                        onClick={() => fetchItems()}
                        style={{ marginLeft: 8 }}
                        disabled={loading}
                      >
                        Load items
                      </button>
                    </div>
                  </div>

                  {/* items list */}
                  <div style={{ marginTop: 16 }}>
                    {items.length === 0 ? (
                      <p>No items loaded</p>
                    ) : (
                      <div>
                        {items.map((it) => (
                          <ItemCard key={it._id ?? `${it.name}-${it.quantity}`} item={it} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            }
          />
          <Route path="/items/:id" element={<ItemPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
