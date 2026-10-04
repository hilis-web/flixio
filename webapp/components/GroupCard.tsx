"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import API from "../lib/api";
import { FaTrash, FaEdit, FaHeart } from "react-icons/fa";
import Link from "next/link";
// import router from "next/router";
import { useRouter } from "next/navigation";

interface GroupCardProps {
  group: {
    id: number;
    title: string;
    description: string;
    category_name?: string;
    image_url?: string;
    is_public?: boolean;
    cards?: { id: number; front_text: string; back_text: string }[];
  };
  editable?: boolean;
}

export default function GroupCard({ group, editable = false }: GroupCardProps) {
  console.log("group in group card", group);
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await API.post("/saved-groups", { user_id: 2, group_id: group.id });
      setSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await API.delete(`/groups/${group.id}`);
      alert("Group deleted!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async () => {
    alert("edit");
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      {/* Image */}
      <div className="relative h-40 w-full">
        <img
          src={group.image_url || "/placeholder.jpg"} // fallback للصور
          alt={group.title || "Group Image"} // fallback للalt
          className="h-full w-full object-cover"
        />

        {/* Public Toggle */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 shadow">
          <span className="text-xs font-medium text-gray-700">
            {group.is_public ? "Public" : "Private"}
          </span>
          <input
            type="checkbox"
            checked={!!group.is_public} // تأكد انه boolean
            onChange={() => {}}
            className="accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + Actions */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {group.title || "Untitled Group"}
            </h2>
            <span className="text-xs text-gray-500">
              {group.category_name || "Uncategorized"}
            </span>
          </div>

          <div className="flex gap-2">
            {editable && (
              <FaEdit
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={handleEdit}
              />
            )}
            {editable && (
              <FaTrash
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={handleDelete}
              />
            )}
            {!editable && (
              <FaHeart
                className={`cursor-pointer ${
                  saved ? "text-red-500" : "text-gray-400"
                }`}
                onClick={handleSave}
              />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {group.description || "No description"}
        </p>

        {/* Cards Preview */}
        {group.cards && group.cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.cards.slice(0, 2).map((card) => (
              <Card
                key={card.id}
                front={card.front_text || ""}
                back={card.back_text || ""}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <button
          className="mt-2 w-full py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={() => router.push(`/group/${group.id}`)}
        >
          View Group
        </button>
      </div>
    </motion.div>
  );
}
