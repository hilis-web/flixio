"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../../lib/api";
import { useAuth } from "../../context/auth-context";
import Card from "../../../components/Card";
import CommentsSection from "../../../components/CommentsSection";
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
  group_id?: number;
  front_text: string;
  back_text: string;
  is_new?: boolean;
  repetitions?: number;
  interval_days?: number;
  ease_factor?: number;
  due_at?: string | null;
  last_rating?: string | null;
}

type ReviewRating = "again" | "hard" | "good" | "easy";

const RATING_OPTIONS: {
  value: ReviewRating;
  label: string;
  className: string;
}[] = [
  {
    value: "again",
    label: "Again",
    className: "bg-red-600 hover:bg-red-700",
  },
  {
    value: "hard",
    label: "Hard",
    className: "bg-orange-500 hover:bg-orange-600",
  },
  {
    value: "good",
    label: "Good",
    className: "bg-green-600 hover:bg-green-700",
  },
  {
    value: "easy",
    label: "Easy",
    className: "bg-blue-600 hover:bg-blue-700",
  },
];

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const groupId = params.id;

  const [group, setGroup] = useState<any>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // Existing study mode
  const [studyMode, setStudyMode] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // Spaced repetition
  const [reviewSession, setReviewSession] = useState(false);
  const [reviewCards, setReviewCards] = useState<CardType[]>([]);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchGroup = useCallback(async () => {
    try {
      const res = await API.get(`/groups/${groupId}`);
      setGroup(res.data.group);
      setCards(res.data.cards);
    } catch (err) {
      console.error("Failed to fetch group:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Start spaced repetition for authenticated users.
  // Guests keep the existing shuffled study mode.
  const shuffleAndStart = async () => {
    setReviewError("");
    setKnownCount(0);
    setCurrentIndex(0);
    setAnswerVisible(false);
    setReviewCompleted(false);

    if (user?.id) {
      setReviewLoading(true);

      try {
        const res = await API.get(`/api/reviews/group/${groupId}`);

        const dueCards: CardType[] = res.data.cards ?? [];

        setReviewCards(dueCards);
        setReviewSession(true);
        setStudyMode(true);
      } catch (err) {
        console.error("Failed to load review cards:", err);
        setReviewError("Could not load review cards. Please try again.");
      } finally {
        setReviewLoading(false);
      }

      return;
    }

    const shuffled = [...cards].sort(() => Math.random() - 0.5);

    setShuffledCards(shuffled);
    setReviewSession(false);
    setStudyMode(true);
  };

  const closeStudyMode = () => {
    setStudyMode(false);
    setReviewSession(false);
    setAnswerVisible(false);
    setReviewSaving(false);
  };

  const nextCard = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  };

  const submitReview = async (rating: ReviewRating) => {
    const currentCard = reviewCards[currentIndex];

    if (!currentCard || reviewSaving || !answerVisible) {
      return;
    }

    setReviewSaving(true);
    setReviewError("");

    try {
      await API.post(`/api/reviews/${currentCard.id}`, {
        rating,
      });

      setKnownCount((count) =>
        rating === "good" || rating === "easy" ? count + 1 : count,
      );

      if (currentIndex >= reviewCards.length - 1) {
        setReviewCompleted(true);
      } else {
        setCurrentIndex((index) => index + 1);
        setAnswerVisible(false);
      }
    } catch (err) {
      console.error("Failed to save review:", err);
      setReviewError("Could not save your rating. Please try again.");
    } finally {
      setReviewSaving(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!studyMode) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeStudyMode();
        return;
      }

      if (reviewSession) {
        if (event.code === "Space") {
          event.preventDefault();

          if (!answerVisible && !reviewCompleted) {
            setAnswerVisible(true);
          }

          return;
        }

        if (
          event.key === "Enter" &&
          answerVisible &&
          !reviewCompleted &&
          !reviewSaving
        ) {
          event.preventDefault();
          void submitReview("good");
        }

        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        nextCard();
      }

      if (event.key === "Enter") {
        setKnownCount((count) => count + 1);
        nextCard();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [
    studyMode,
    reviewSession,
    answerVisible,
    reviewCompleted,
    reviewSaving,
    currentIndex,
    shuffledCards.length,
    reviewCards,
  ]);

  const isOwner = user?.id === group?.user_id;

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    try {
      await API.delete(`/api/cards/${cardId}`);
      setCards((current) => current.filter((card) => card.id !== cardId));
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

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!group) {
    return <p className="p-6">Group not found</p>;
  }

  const activeReviewCard = reviewCards[currentIndex];
  const activeShuffleCard = shuffledCards[currentIndex];

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-white">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-6xl">
          <h1 className="text-3xl font-bold">{group.title}</h1>

          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {group.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-500">{cards.length} Cards</span>

            <button
              onClick={() => setDarkMode((value) => !value)}
              className="rounded bg-gray-200 p-2 dark:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <button
              onClick={shuffleAndStart}
              disabled={reviewLoading || cards.length === 0}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reviewLoading ? "Loading review..." : "Start Study Mode"}
            </button>
          </div>

          {reviewError && !studyMode && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {reviewError}
            </p>
          )}

          {!user?.id && (
            <p className="mt-2 text-sm text-gray-500">
              Sign in to save your review progress and use spaced repetition.
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group rounded-xl bg-white p-3 shadow transition hover:shadow-lg dark:bg-gray-800"
            >
              <Card front={card.front_text} back={card.back_text} />

              <div className="mt-3 flex justify-center gap-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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

        {/* Group Discussion */}
        <div className="mx-auto mt-8 max-w-6xl">
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <h2 className="mb-3 text-xl font-bold">Group Discussion</h2>
            <CommentsSection groupId={Number(group.id)} defaultOpen />
          </div>
        </div>

        {/* Floating Add Card */}
        {isOwner && (
          <button
            onClick={() => router.push(`/group/${group.id}/create-card`)}
            className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg hover:bg-blue-700"
          >
            <FaPlus />
            Add Card
          </button>
        )}
      </div>

      {/* Study Mode Overlay */}
      {studyMode && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
          {reviewSession ? (
            <>
              {/* Spaced repetition progress */}
              <div className="mb-6 w-full max-w-xl">
                <div className="mb-2 flex justify-between text-sm">
                  <span>
                    {reviewCompleted
                      ? "Review complete"
                      : reviewCards.length === 0
                        ? "No cards due"
                        : `Card ${currentIndex + 1} / ${reviewCards.length}`}
                  </span>

                  <span>Good/Easy: {knownCount}</span>
                </div>

                {reviewCards.length > 0 && (
                  <div className="h-2 w-full rounded-full bg-gray-300">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{
                        width: `${
                          reviewCompleted
                            ? 100
                            : (currentIndex / reviewCards.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {reviewCompleted || reviewCards.length === 0 ? (
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow dark:bg-gray-800">
                  <h2 className="mb-3 text-2xl font-bold">
                    {reviewCompleted ? "Great work!" : "You're all caught up!"}
                  </h2>

                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {reviewCompleted
                      ? "You've reviewed all the cards that were due in this session."
                      : "There are no new or due cards in this group right now."}
                  </p>

                  <button
                    onClick={closeStudyMode}
                    className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                  >
                    Back to Group
                  </button>
                </div>
              ) : activeReviewCard ? (
                <>
                  <div className="mb-4 w-full max-w-md text-center text-sm text-gray-500">
                    {activeReviewCard.is_new
                      ? "New card"
                      : `Interval: ${activeReviewCard.interval_days ?? 0} day(s)`}
                  </div>

                  {/* Flashcard */}
                  <button
                    type="button"
                    onClick={() => setAnswerVisible(true)}
                    className={`flex min-h-72 w-full max-w-md items-center justify-center rounded-xl p-6 text-center text-xl font-semibold shadow transition ${
                      answerVisible
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    <span className="whitespace-pre-wrap break-words">
                      {answerVisible
                        ? activeReviewCard.back_text
                        : activeReviewCard.front_text}
                    </span>
                  </button>

                  <p className="mt-3 text-sm text-gray-500">
                    {answerVisible
                      ? "How well did you remember the answer?"
                      : "Click the card or Show Answer to reveal the answer."}
                  </p>

                  {!answerVisible ? (
                    <button
                      onClick={() => setAnswerVisible(true)}
                      className="mt-5 rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                    >
                      Show Answer (Space)
                    </button>
                  ) : (
                    <div className="mt-5 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
                      {RATING_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          disabled={reviewSaving}
                          onClick={() => void submitReview(option.value)}
                          className={`rounded px-3 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${option.className}`}
                        >
                          {reviewSaving ? "Saving..." : option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {reviewError && (
                    <p
                      role="alert"
                      className="mt-4 text-center text-sm text-red-600"
                    >
                      {reviewError}
                    </p>
                  )}
                </>
              ) : null}

              {!reviewCompleted && reviewCards.length > 0 && (
                <button
                  onClick={closeStudyMode}
                  className="mt-6 rounded bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
                >
                  Exit (Esc)
                </button>
              )}
            </>
          ) : (
            <>
              {/* Existing shuffled study mode for guests */}
              <div className="mb-6 w-full max-w-xl">
                <div className="mb-2 flex justify-between text-sm">
                  <span>
                    Card {shuffledCards.length > 0 ? currentIndex + 1 : 0} /{" "}
                    {shuffledCards.length}
                  </span>
                  <span>Known: {knownCount}</span>
                </div>

                {shuffledCards.length > 0 && (
                  <div className="h-2 w-full rounded-full bg-gray-300">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{
                        width: `${
                          ((currentIndex + 1) / shuffledCards.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {activeShuffleCard ? (
                <>
                  <div className="w-full max-w-md">
                    <Card
                      front={activeShuffleCard.front_text}
                      back={activeShuffleCard.back_text}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => {
                        setKnownCount((count) => count + 1);
                        nextCard();
                      }}
                      className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                      I Know (Enter)
                    </button>

                    <button
                      onClick={nextCard}
                      className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                      Next (Space)
                    </button>

                    <button
                      onClick={closeStudyMode}
                      className="rounded bg-gray-500 px-4 py-2 text-white"
                    >
                      Exit (Esc)
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-white p-8 text-center shadow dark:bg-gray-800">
                  <p className="mb-4">There are no cards to study.</p>
                  <button
                    onClick={closeStudyMode}
                    className="rounded bg-blue-600 px-5 py-2 text-white"
                  >
                    Back to Group
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
