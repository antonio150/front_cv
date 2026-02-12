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
        if (data.length > 0) {
          setCv(data[0]); // tu prends le dernier CV
        }
        console.log(cv)
        console.log(data[0].id)
        setFirstId(data[0].id);
        setHasValue(true);
      });
  }, []);

  if (!cv) return <p className="p-8">Chargement du CV...</p>;

  return (
    <div>
      <Navbar />
      <div className="pt-5 flex gap-4">
        <a
          href={hasValue ? `/cv/form/?id=${firstId}` : `/cv/form`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {hasValue ? "✏️ Modifier" : "➕ Ajouter"}
        </a>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium shadow hover:bg-red-700 hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
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
                  ? new Date(c.anneeDebut).getFullYear()
                  : "";
                const fin = c.anneeFin
                  ? new Date(c.anneeFin).getFullYear()
                  : "";

                return (
                  <div key={i}>
                    <p className="font-semibold">{c?.titre}</p>
                    <p>{c?.entreprise}</p>
                    <p className="text-sm text-gray-500">
                      {debut} → {fin}
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
                      {c.ecole} – {c.lieu}
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
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                >
                  {c.champ} – {c.contenue}
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
