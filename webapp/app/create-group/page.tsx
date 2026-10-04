"use client";
import { useState, useEffect } from "react";
import API from "../../lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";

interface Category {
  id: number;
  name: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      await API.post("/groups", {
        user_id: user.id,
        title,
        description,
        category_id: categoryId,
        is_public: isPublic,
        image_url: imageUrl,
      });

      alert("Group created successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to create group.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create New Group</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Group title"
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          className="border p-2 w-full rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Category dropdown */}
        <select
          className="border p-2 w-full rounded"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value="">Select category</option>

          {loadingCategories ? (
            <option disabled>Loading...</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </select>

        {/* Image URL */}
        <input
          type="text"
          placeholder="Image URL"
          className="border p-2 w-full rounded"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {/* Public checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public Group
        </label>

        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Create Group
        </button>
      </form>
    </div>
  );
}
