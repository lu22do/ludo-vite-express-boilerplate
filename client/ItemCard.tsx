import React from "react";
import { Link } from "react-router-dom";

type Item = {
  _id?: string;
  name: string;
  quantity: number;
};

export default function ItemCard({ item }: { item: Item }) {
  return (
    <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>
      <Link to={`/items/${item._id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <strong>{item.name}</strong> — <span>{item.quantity}</span>
      </Link>
    </div>
  );
}