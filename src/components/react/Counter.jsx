import React, { useState } from "react";

export default function Counter({ start = 0, label = "React counter" }) {
  const [count, setCount] = useState(start);

  return (
    <div className="rounded border border-gray-300 dark:border-gray-700 p-4 mt-4 space-y-2">
      <p className="font-semibold">{label}</p>
      <p className="text-sm opacity-80">Count: {count}</p>
      <button
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        type="button"
        onClick={() => setCount((value) => value + 1)}
      >
        Increment
      </button>
    </div>
  );
}
