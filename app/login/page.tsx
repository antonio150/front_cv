"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter()


  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      console.log("User connecté:", user);
      router.push("/cv"); 
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("utilisateur_id", user.id);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User Google connecté:", user);
      router.push("/cv"); 

    } catch (e) {
      setError("Erreur connexion Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-xl font-bold text-center text-black">Connexion</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Se connecter
        </button>

        <div className="text-center text-gray-400">ou</div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Erreur Google Auth")}
          />
        </div>
      </form>
    </div>
  );
}
