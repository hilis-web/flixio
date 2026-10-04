"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import API from "../../../../lib/api";

export default function AddCardPage() {
  const router = useRouter();
  const { id } = useParams(); // group id

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const addCard = async () => {
    if (!front.trim() || !back.trim()) {
      alert("Please fill both sides.");
      return;
    }

    try {
      await API.post("/cards", {
        group_id: id,
        front_text: front,
        back_text: back,
      });

      alert("Card added successfully!");

      router.push(`/group/${id}`); // go back to group page
    } catch (error) {
      console.error(error);
      alert("Error adding card");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Card</h1>

      {/* Front */}
      <div className="mb-4">
        <label className="font-semibold">Front Text</label>
        <textarea
          className="w-full p-2 border rounded mt-1"
          rows={3}
          placeholder="Enter front text..."
          value={front}
          onChange={(e) => setFront(e.target.value)}
        ></textarea>
      </div>

      {/* Back */}
      <div className="mb-4">
        <label className="font-semibold">Back Text</label>
        <textarea
          className="w-full p-2 border rounded mt-1"
          rows={3}
          placeholder="Enter back text..."
          value={back}
          onChange={(e) => setBack(e.target.value)}
        ></textarea>
      </div>

      <button
        onClick={addCard}
        className="w-full bg-blue-600 text-white py-3 rounded text-lg font-semibold"
      >
        Add Card
      </button>
    </div>
  );
}
