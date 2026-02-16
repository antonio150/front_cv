"use client";

import { useState, useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optionnel : fermer la modal avec la touche Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
     
    >
      {/* Empêche la propagation du clic vers l'arrière-plan */}
      <div
        className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
       

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-5 py-12">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-gray-800 font-semibold text-lg">
                Connexion en cours...
              </p>
              <p className="text-sm text-gray-500">
                Veuillez patienter quelques instants
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Connexion requise
              </h2>
              <p className="mt-2 text-gray-600">
                Connectez-vous avec Google pour continuer
              </p>
            </div>

            {error && (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                {error}
              </p>
            )}

            <div className="flex justify-center pt-2">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;

                  try {
                    setLoading(true);
                    setError(null);

                    const res = await axios.post(`${API_URL}/api/auth/google`, {
                            token: credentialResponse.credential,
                          });
                    
                          const { token, user } = res.data;
                          localStorage.setItem("token", token);
                          localStorage.setItem("utilisateur_id", user.id);
                          localStorage.setItem("user", JSON.stringify(user));
                          console.log("User Google connecté:", user);

                          location.reload()
                    onSuccess();
                    onClose();          // ← on ferme la modal
                    // window.location.reload();   // ← à éviter si possible
                  } catch (err: any) {
                    console.error(err);
                    setError(
                      err.message ||
                        "La connexion a échoué. Veuillez réessayer."
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError("Échec de la connexion Google");
                }}
                useOneTap={false} // optionnel
                theme="filled_blue"
                text="signin_with"
                shape="rectangular"
                size="large"
                width="100%"
              />
            </div>

            <p className="text-xs text-gray-500 pt-4">
              En continuant, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}