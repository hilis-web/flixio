"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";

interface Category {
  id: number;
  name: string;
}

export default function InterestsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    if (!user) return alert("You must be logged in.");

    try {
      await API.post(`/users/${user.id}/interests`, { interests: selected });
      alert("Interests saved!");
      router.push("/"); // بعدها يظهر Timeline مخصص
    } catch (err) {
      alert("Failed to save interests.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Choose Your Interests
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Select at least one category to customize your Timeline.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`p-3 border rounded-lg text-center transition ${
              selected.includes(cat.id)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white"
            }`}
            onClick={() => toggleCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white p-3 rounded-lg"
      >
        Save Interests
      </button>
    </div>
  );
}
