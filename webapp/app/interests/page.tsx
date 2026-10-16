"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

export default function InterestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------
  // Load all categories
  // --------------------------
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const catsRes = await API.get("/api/interests/categories");
        setCategories(catsRes.data);

        const userRes = await API.get("/api/users/me");
        setSelected(
          userRes.data.interests.map((item: { category_id: number }) =>
            Number(item.category_id),
          ),
        );
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // --------------------------
  // Select / Unselect category
  // --------------------------
  const toggleCategory = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((c) => c !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // --------------------------
  // Save interests to DB
  // --------------------------
  const saveInterests = async () => {
    try {
      await API.put("/api/users/me/interests", {
        interests: selected,
      });

      router.push("/feeds");
    } catch (err) {
      console.error(err);
      alert("Failed to save interests");
    }
  };

  if (!user) return <p className="p-6">Please login first.</p>;
  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Choose your Interests</h1>
      <p className="mb-6 text-gray-600">
        Select categories you're interested in. These will be used to customize
        your timeline.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`p-4 rounded-lg cursor-pointer text-center border transition ${
              selected.includes(cat.id)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <button
        onClick={saveInterests}
        className="px-6 py-2 bg-green-600 text-white rounded-lg shadow"
      >
        Save & Continue
      </button>
    </div>
  );
}
