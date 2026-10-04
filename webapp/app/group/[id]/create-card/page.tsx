"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../../../lib/api";
import { useAuth } from "../../../context/auth-context";

export default function CreateCardPage() {
  const { user } = useAuth();
  const params = useParams();
  const groupId = params.id;
  const router = useRouter();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!front || !back) {
      setError("Both front and back text are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/cards", {
        group_id: Number(groupId),
        front_text: front,
        back_text: back,
      });

      // بعد الإضافة، ارجع للصفحة الرئيسية للمجموعة
      router.push(`/group/${groupId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create card");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="p-6">Please login to create cards.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-4">Create New Card</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-2 font-medium">Front Text</label>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          rows={3}
        />

        <label className="block mb-2 font-medium">Back Text</label>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? "Creating..." : "Create Card"}
        </button>
      </form>
    </div>
  );
}
