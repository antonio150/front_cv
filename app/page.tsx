"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [cv, setCv] = useState(null);
    const [hasValue, setHasValue] = useState(false);
    const [firstId, setFirstId] = useState(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const token = localStorage.getItem("token");
        const utilisateurId = localStorage.getItem("utilisateur_id");
        setHasValue(false);
        fetch(`${API_URL}/api/contenue/liste_cv?utilisateur_id=${utilisateurId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => res.json())
          .then((data) => {
            // si la réponse est vide ou nulle, rediriger vers le formulaire immédiatement
            if (!data || (Array.isArray(data) && data.length === 0)) {
              window.location.href = "/cv/form";
              return;
            }
    
            if (Array.isArray(data) && data.length > 0) {
              setCv(data[0]); // tu prends le premier CV retourné
              setFirstId(data[0].id);
            } else if (data && !Array.isArray(data)) {
              // si l'API retourne un objet unique
              setCv(data);
              if (data.id) setFirstId(data.id);
            }
            setHasValue(true);
          });
      }, []);
  return (
    <main>
      <Navbar/>
      {/* HERO */}
      <section className="py-20 text-center bg-gray-50">
        <h1 className="text-4xl font-bold mb-4">
          Créez un CV professionnel en quelques minutes
        </h1>
        <p className="text-gray-600 mb-6">
          Choisissez un template moderne et exportez en PDF instantanément.
        </p>

        <div className="flex justify-center gap-4">
          <a href={hasValue ? `/cv/form/?id=${firstId}` : `/cv/form`} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            {hasValue ? "Modifier" : "Créer"} mon CV
          </a>
          <a href="/template" className="border px-6 py-3 rounded-lg">
            Voir les templates
          </a>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">
          Comment ça marche ?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold">1. Remplissez vos infos</h3>
          </div>
          <div>
            <h3 className="font-semibold">2. Choisissez un template</h3>
          </div>
          <div>
            <h3 className="font-semibold">3. Exportez en PDF</h3>
          </div>
        </div>
      </section>
<Footer/>
    </main>
  );
}
