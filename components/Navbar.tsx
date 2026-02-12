"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";




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
    const token = localStorage.getItem("tokenAuth");
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


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <nav className="max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            Code With Navira
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
            <li><Link href="/home">Accueil</Link></li>
            <li><Link href="/home/realisation">Réalisations</Link></li>
            <li><Link href="/home/formation">Formation</Link></li>
            <li><Link href="https://www.youtube.com/@antoniorollandeyves6852">Youtube</Link></li>
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
            <Link onClick={() => setOpen(false)} href="/home" className="block">
              Accueil
            </Link>
            <Link onClick={() => setOpen(false)} href="/home/realisation" className="block">
              Réalisations
            </Link>
            <Link onClick={() => setOpen(false)} href="/home/formation" className="block">
              Formation
            </Link>
            <Link onClick={() => setOpen(false)} href="https://www.youtube.com/@antoniorollandeyves6852" className="block">
              Youtube
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
      

    </header>
  );
}
