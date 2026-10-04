"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkStyle = (path: string) =>
    pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600 transition";

  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-blue-600">Flixio</h1>

      <div className="flex space-x-6 text-lg">
        <Link href="/timeline" className={linkStyle("/timeline")}>
          Timeline
        </Link>

        <Link href="/my-groups" className={linkStyle("/my-groups")}>
          My Groups
        </Link>

        <Link href="/saved" className={linkStyle("/saved")}>
          Saved
        </Link>

        <Link href="/create-group" className={linkStyle("/create-group")}>
          Create Group
        </Link>

        {/* إضافة رابط My Profile */}
        <Link href="/profile" className={linkStyle("/profile")}>
          My Profile
        </Link>
      </div>
    </nav>
  );
}
