"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CvPage() {
  const [cv, setCv] = useState(null);
  const [hasValue, setHasValue] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [firstId, setFirstId] = useState(null);

  const deleteCv = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API_URL}/api/contenue/delete_contenue/${firstId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (res.ok) {
      window.location.href = "/cv/form";
    }
  };

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

  
  if (!cv)
    return (
  
      <div className="min-h-screen flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="py-5 flex gap-4 justify-center">
        <a
          href={hasValue ? `/cv/form/?id=${firstId}` : `/cv/form`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-400 text-white font-medium shadow hover:bg-blue-700 hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {hasValue ? "✏️ Modifier" : "➕ Ajouter"}
        </a>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-400 text-white font-medium shadow hover:bg-red-700 hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={deleteCv}
        >
          🗑️ Supprimer
        </button>

        
      </div>

      <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
          {/* HEADER */}
          <div className="flex gap-6 items-center border-b pb-6 mb-6">
            <img
              src={`${API_URL}${cv.Photo?.pathRelative}`}
              alt="Photo"
              className="w-32 h-32 object-cover rounded-full border"
            />
            <div>
              <h1 className="text-3xl font-bold">
                {cv.Biographie?.nom} {cv.Biographie?.prenom}
              </h1>
              <p className="text-gray-600">{cv.Biographie?.email}</p>
              <p className="text-gray-600">{cv.Biographie?.phone}</p>
              <p className="text-gray-600">{cv.Biographie?.adresse}</p>
              {cv.Biographie?.biographieSuites?.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <p className="text-gray-600">{c?.titre} : </p>
                  <p className="text-gray-600">{c?.contenue}</p>
                </div>
              ))}
            </div>
          </div>
          {/* A propos */}
          <Section title="🏢 A propos">
            <p className="font-semibold">{cv.Apropos?.titre}</p>

            <p
              className="mt-2"
              dangerouslySetInnerHTML={{
                __html: cv.Apropos?.description ?? "Aucune description"
              }}
            />
          </Section>

          {/* EXPERIENCE */}
          <Section title="🏢 Expérience">
            <div className="flex flex-col gap-4">
              {cv.Experience?.ExperienceContenu?.map((c, i) => {
                const debut = c.anneeDebut
                  ? new Date(c.anneeDebut).toLocaleDateString("fr-FR", {
                      month: "short",
                      year: "numeric"
                    })
                  : "";

                var fin = c.anneeFin
                  ? new Date(c.anneeFin).toLocaleDateString("fr-FR", {
                      month: "short",
                      year: "numeric"
                    })
                  : "";
                 fin = c.posteActuel ? "A présent" : fin
                return (
                  <div key={i}>
                    <p className="font-semibold">{c?.titre}</p>
                    <p>{c?.entreprise}</p>
                    <p className="text-sm text-gray-500">
                      {debut} - {fin}
                    </p>

                    <p
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: c?.description ?? "Aucune description"
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Section>

          {/* FORMATION */}
          <Section title="🎓 Formation">
            <div className="flex flex-col gap-4">
              {cv.Formation?.FormationContenu?.map((c, i) => {
                const debut = c.anneeDebut
                  ? new Date(c.anneeDebut).getFullYear()
                  : "";
                const fin = c.anneeFin
                  ? new Date(c.anneeFin).getFullYear()
                  : "";

                return (
                  <div key={i}>
                    <p className="font-semibold">
                      {c.diplome || "Diplôme non précisé"}
                    </p>
                    <p>
                      {c.ecole} - {c.lieu}
                    </p>
                    <p className="text-sm text-gray-500">
                      {debut} → {fin}
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* COMPETENCES */}
          <Section title="💡 Compétences">
            <div className="flex flex-col gap-2">
              {cv.Competence?.competenceContenus?.map((c, i) => (
                <span key={i} className="px-3 py-1  text-sm">
                  {c.champ} : {c.contenue}
                </span>
              ))}
            </div>
          </Section>

          {/* LANGUES */}
          <Section title="🌍 Langues">
            <ul className="list-disc ml-5">
              {cv.Langue?.LangueContenue?.map((l, i) => (
                <li key={i}>
                  {l.language} – {l.niveau}
                </li>
              ))}
            </ul>
          </Section>

          {/* AUTRES ACTIVITÉS */}
          <Section title="🎯 Autres activités">
            <ul className="list-disc ml-5">
              {cv.AutreActivite?.autreActiviteContenues?.map((a, i) => (
                <li key={i}>
                  {a.champ} : {a.contenue}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2 border-b pb-1">{title}</h2>
      {children}
    </div>
  );
}
