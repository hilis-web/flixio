"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

interface Category {
  id: number;
  name: string;
}

interface CategorySelectProps {
  onChange?: (selectedIds: number[]) => void; // callback to parent
}

export default function CategorySelect({ onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsRes = await API.get("/api/interests/categories");
        setCategories(catsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (id: number) => {
    let newSelected: number[];
    if (selected.includes(id)) {
      newSelected = selected.filter((c) => c !== id);
    } else {
      newSelected = [...selected, id];
    }
    setSelected(newSelected);

    if (onChange) onChange(newSelected);
  };

  if (loading) return <p className="p-4 text-sm">Loading categories...</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-4 w-full max-w-md">
      <h3 className="font-semibold text-lg">Interests</h3>

      {/* flex wrap left-aligned */}
      <div className="flex flex-wrap gap-2 justify-start">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`px-3 py-1 rounded-full border transition text-sm font-medium whitespace-nowrap ${
              selected.includes(cat.id)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
