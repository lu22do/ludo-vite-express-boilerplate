import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Item = {
  _id?: string;
  name: string;
  quantity: number;
};

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setItem(data);
        setName(data.name ?? "");
        setQuantity(String(data.quantity ?? ""));
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Failed to load item");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const updateItem = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const body = { name, quantity: Number(quantity) || 0 };
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? `Server returned ${res.status}`);
      }
      const updated = await res.json();
      setItem(updated);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? `Server returned ${res.status}`);
      }
      // go back to list after deletion
      navigate("/");
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  if (!id) return <p>Missing item id</p>;

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => navigate("/")}>&larr; Back</button>
      <h2>Item</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && item && (
        <div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Name:{" "}
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Quantity:{" "}
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
          </div>
          <div>
            <button onClick={updateItem} disabled={loading}>
              Save
            </button>
            <button
              onClick={deleteItem}
              disabled={loading}
              style={{ marginLeft: 8, color: "red" }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {!loading && !item && !error && <p>Item not found</p>}
    </div>
  );
}