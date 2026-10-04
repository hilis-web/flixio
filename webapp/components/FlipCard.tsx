"use client";

import { useState } from "react";
import "./flipcard.css";

interface FlipCardProps {
  front: string;
  back: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FlipCard({
  front,
  back,
  onEdit,
  onDelete,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative">
      <div
        className={`flip-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <p>{front}</p>
          </div>
          <div className="flip-card-back">
            <p>{back}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      {(onEdit || onDelete) && (
        <div className="flex justify-between mt-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
