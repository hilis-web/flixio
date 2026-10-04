"use client";

import { useState } from "react";
import SideBar from "../../components/SideBar";
import Timeline from "../../components/Timeline";
import Discovery from "../../components/Discovery";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";
import Tabs from "../../components/Tabs";

export default function Feed() {
  const [activeTab, setActiveTab] = useState<"timeline" | "discovery">(
    "timeline"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 sticky top-6 h-fit">
          <SideBar />
        </aside>

        {/* Main Content */}
        <main className="w-full flex flex-col gap-6">
          {/* Search Bar */}
          <div className="sticky top-6 z-20 bg-white rounded-xl border p-4 shadow-md">
            <SearchBar />
          </div>

          {/* Tabs + Content as single card */}
          <div className="bg-white rounded-xl border shadow-md overflow-hidden">
            {/* Tabs as header of the card */}
            <div className="flex justify-center border-b bg-gray-50">
              <button
                className={`px-4 py-2 ${
                  activeTab === "timeline"
                    ? "border-b-4 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("timeline")}
              >
                Timeline
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === "discovery"
                    ? "border-b-4 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("discovery")}
              >
                Discovery
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {activeTab === "timeline" && <Timeline />}
              {activeTab === "discovery" && <Discovery />}
            </div>
          </div>
        </main>

        {/* Right Footer / Sidebar */}
        <aside className="w-64 shrink-0 sticky top-6 h-fit">
          <Footer variant="sidebar" />
        </aside>
      </div>
    </div>
  );
}
