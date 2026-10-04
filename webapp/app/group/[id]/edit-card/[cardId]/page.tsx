"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../../../../lib/api";
import { useAuth } from "../../../../context/auth-context";

export default function EditCardPage() {
  const { user } = useAuth();
  const params = useParams();
  const { groupId, cardId } = params;
  const router = useRouter();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------
  // Fetch card data
  // --------------------------
  useEffect(() => {
    const fetchCard = async () => {
      try {
        console.log("card id", cardId);
        const res = await API.get(`cards/${cardId}`);
        console.log("card res", res);

        setFront(res.data.front_text);
        setBack(res.data.back_text);
      } catch (err) {
        console.error(err);
        setError("Failed to load card data");
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [cardId]);

  // --------------------------
  // Submit edited card
  // --------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!front || !back) {
      setError("Both front and back text are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await API.put(`/cards/${cardId}`, {
        front_text: front,
        back_text: back,
      });

      alert(`${groupId}`);

      router.push(`/group/${groupId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update card");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p className="p-6">Please login to edit cards.</p>;
  if (loading) return <p className="p-6">Loading card...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-4">Edit Card</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-2 font-medium">Front Text</label>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          rows={3}
        />

        <label className="block mb-2 font-medium"></label>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={3}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
