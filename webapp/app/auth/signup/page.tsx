"use client";

import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: any) => {
    e.preventDefault();
    try {
      const user = await signup(username, email, password);
      alert("Signup successful! Please login.");
      //router.push("/auth/login"); // بعد التسجيل نوجهه لصفحة login
      router.push("/interests");
    } catch (err) {
      alert("Signup failed, check your inputs.");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-2 rounded mb-3">
          Signup
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
