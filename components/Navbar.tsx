"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";




export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  interface User {
    email: string;
    nom?: string;
  }
  const [userToken, setUserToken] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const userId = userString ? JSON.parse(userString) : null;
    setToken(token);
    setUserToken(userId);
    
  }, [])

  const handleLogout = async () => {
    setLogoutLoading(true);
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    await fetch(`${API_URL}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // router.push("/login");
  } catch (error) {
    console.error("Erreur logout", error);
  } finally {
    // 🔥 nettoyage local
    localStorage.clear();
    setToken(null);
    setUserToken(null);
    setLogoutLoading(false);
    window.location.reload();
  }
};

// Chargement initial du token + user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (token) {
      setToken(token);
    }

   

    // Si PAS de token → on montre la modal (et on peut commenter la redirection)
    if (!token) {
      setShowAuthModal(true);
      // router.push("/login");   ← à décommenter UNIQUEMENT si tu veux vraiment forcer la page login
    }
  }, [router]);
  return (
    <header className="sticky top-0 z-50 w-full bg-blue-100 border-b">
      <nav className="max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            Momba Ahy
          </Link>

          {/* Burger button (mobile) */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-700 focus:outline-none"
            aria-label="Menu"
          >
            ☰
          </button>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-6 text-gray-600">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/cv">Mon CV</Link></li>
            <li><Link href="/template">Template</Link></li>
           
              </ul>

          {/* Desktop buttons */}
          <div className="hidden md:flex gap-1">
            {(!token || !userToken) ? (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-1 border rounded-md text-sm hover:bg-gray-100"
                >
                  Se connecter
                </button>
            </>
            ) : (
              <div >
                  <div className="flex flex-col gap-1">
                    {/* contenu quand l'utilisateur est connecté */}
                   
                    <div>
                      {userToken.email}
                    </div>
                  </div> 
                  <div onClick={handleLogout} className="mt-1 px-4 py-1 bg-gray-800 text-white rounded-md text-center text-sm hover:bg-gray-700 cursor-pointer">
                    {logoutLoading ? "Déconnexion ..." : "Déconnecté"}
                  </div>
                </div>
                )}
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 space-y-4 border-t pt-4">
            <Link onClick={() => setOpen(false)} href="/" className="block">
              Accueil
            </Link>
            <Link onClick={() => setOpen(false)} href="/cv" className="block">
              Mon CV
            </Link>
            <Link onClick={() => setOpen(false)} href="/template" className="block">
              Template
            </Link>
          
            <div className="flex flex-col gap-3 pt-4">
                {(!token || !userToken) ? (
                  <>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-1 border rounded-md text-sm hover:bg-gray-100"
                    >
                      Se connecter
                    </button>


                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    {/* contenu quand l'utilisateur est connecté */}
                    
                    <div>
                      {userToken.email}
                    </div>
                    <div onClick={handleLogout} className="mt-1 px-4 py-1 bg-gray-800 text-white rounded-md text-center text-sm hover:bg-gray-700 cursor-pointer">
                      {logoutLoading ? "Déconnexion ..." : "Déconnecté"}
                    </div>
                  </div>
                )}
              </div>

          </div>
        )}
      </nav>
      {showAuthModal && (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          const token = localStorage.getItem("token");
          const userString = localStorage.getItem("user");
          const user = userString ? JSON.parse(userString) : null;

          setToken(token);
          setUserToken(user);
          setShowAuthModal(false);
        }}
      />
      
    )}
    </header>
  );
}
