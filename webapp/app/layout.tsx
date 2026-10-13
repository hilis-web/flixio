import "./globals.css";
import Navbar from "../components/Navbar";
import StudyReminderScheduler from "../components/StudyReminderScheduler";
import { AuthProvider } from "./context/auth-context";

export const metadata = {
  title: "Flixio Flashcards",
  description: "Flashcard app built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* <Navbar /> */}
        <AuthProvider>
          <StudyReminderScheduler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
