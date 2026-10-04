"use client";
import { useState } from "react";

interface CardProps {
  front: string;
  back: string;
}

export default function Card({ front, back }: CardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-72 w-full perspective cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow flex items-center justify-center text-xl font-semibold backface-hidden p-4 text-center">
          <div className="overflow-auto max-h-full">{front}</div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-blue-600 text-white rounded-xl shadow flex items-center justify-center text-lg backface-hidden rotate-y-180 p-4 text-center">
          <div className="overflow-auto max-h-full">{back}</div>
        </div>
      </div>
    </div>
  );
}
