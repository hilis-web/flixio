"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../../lib/api";
import { useAuth } from "../../context/auth-context";
import Card from "../../../components/Card";
import {
  FaPlus,
  FaMoon,
  FaSun,
  FaTrash,
  FaEdit,
  FaHeart,
  FaComment,
} from "react-icons/fa";

interface CardType {
  id: number;
  front_text: string;
  back_text: string;
}

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const groupId = params.id;

  const [group, setGroup] = useState<any>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // Study Mode States
  const [studyMode, setStudyMode] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await API.get(`/groups/${groupId}`);
        setGroup(res.data.group);
        setCards(res.data.cards);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!studyMode) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        nextCard();
      }
      if (e.key === "Enter") {
        setKnownCount((k) => k + 1);
        nextCard();
      }
      if (e.key === "Escape") {
        setStudyMode(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [studyMode, currentIndex]);

  const shuffleAndStart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setKnownCount(0);
    setStudyMode(true);
  };

  const nextCard = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const isOwner = user?.id === group?.user_id;

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      await API.delete(`/api/cards/${cardId}`);
      setCards(cards.filter((c) => c.id !== cardId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCard = (cardId: number) => {
    console.log("Save card:", cardId);
  };

  const handleCommentCard = (cardId: number) => {
    console.log("Comment on card:", cardId);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!group) return <p className="p-6">Group not found</p>;

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl font-bold">{group.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {group.description}
          </p>

          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-gray-500">{cards.length} Cards</span>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <button
              onClick={shuffleAndStart}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Study Mode
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition p-3"
            >
              <Card front={card.front_text} back={card.back_text} />

              {/* Actions */}
              <div className="flex justify-center gap-4 mt-3 opacity-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {isOwner && (
                  <button
                    onClick={() =>
                      router.push(`/group/${group.id}/edit-card/${card.id}`)
                    }
                    className="text-yellow-500 hover:text-yellow-600"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                )}
                <button
                  onClick={() => handleSaveCard(card.id)}
                  className="text-green-500 hover:text-green-600"
                  title="Save"
                >
                  <FaHeart />
                </button>
                <button
                  onClick={() => handleCommentCard(card.id)}
                  className="text-blue-500 hover:text-blue-600"
                  title="Comment"
                >
                  <FaComment />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Card */}
        {isOwner && (
          <button
            onClick={() => router.push(`/group/${group.id}/create-card`)}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
          >
            <FaPlus />
            Add Card
          </button>
        )}
      </div>

      {/* Study Mode Overlay */}
      {studyMode && (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
          {/* Progress */}
          <div className="w-full max-w-xl mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Card {currentIndex + 1} / {shuffledCards.length}
              </span>
              <span>Known: {knownCount}</span>
            </div>

            <div className="w-full bg-gray-300 h-2 rounded-full">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    ((currentIndex + 1) / shuffledCards.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="w-full max-w-md">
            <Card
              front={shuffledCards[currentIndex].front_text}
              back={shuffledCards[currentIndex].back_text}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setKnownCount((k) => k + 1);
                nextCard();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              I Know (Enter)
            </button>

            <button
              onClick={nextCard}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next (Space)
            </button>

            <button
              onClick={() => setStudyMode(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Exit (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
