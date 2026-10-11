"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../app/context/auth-context";

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  function Button({
    children,
    href,
    onClick,
    variant = "primary",
  }: {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline";
  }) {
    const base =
      "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition";

    const styles = {
      primary: "bg-sky-600 text-white hover:bg-sky-700",
      secondary: "bg-white text-slate-900 hover:bg-slate-100",
      outline: "border border-slate-300 text-slate-900 hover:bg-slate-100",
    };

    const className = `${base} ${styles[variant]}`;

    if (href) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <div className="text-xl font-semibold">
          <Link href="/">Flixio</Link>
        </div>

        <div className="contents items-center text-xl font-semibold">
          <img width="5%" src="/logo-icon.png" alt="Flixio logo" />
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/feeds">App</Link>

          {user && (
            <Link href="/profile">
              <div
                role="button"
                className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
              >
                <div className="grid mr-4 place-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282-.083-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Profile
              </div>
            </Link>
          )}

          {user && <Button onClick={handleLogout}>Log out</Button>}

          {!user && (
            <Button href="/auth/login" variant="outline">
              Log in
            </Button>
          )}

          {!user && <Button href="/auth/signup">Sign up</Button>}
        </nav>
      </div>
    </header>
  );
};

export default Header;
