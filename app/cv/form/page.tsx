"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import TiptapEditor from "@/components/TiptapEditor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContenueCVForm() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [photo, setPhoto] = useState(null);

  const [biographies, setBiographies] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    phone: "",
    email: ""
  });
  const [biographiesSuite, setBiographiesSuite] = useState([
    { titre: "", contenue: "" }
  ]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [competences, setCompetences] = useState([{ champ: "", contenue: "" }]);
  const [apropos, setApropos] = useState({ titre: "", description: "" });
  const [formations, setFormations] = useState([
    { ecole: "", lieu: "", diplome: "", anneeDebut: "", anneeFin: "" }
  ]);
  const [langues, setLangues] = useState([{ langue: "", niveau: "" }]);
  const [autres, setAutres] = useState([{ champ: "", contenue: "" }]);
  const [experience, setExperience] = useState([
    {
      anneeDebut: "",
      anneeFin: "",
      entreprise: "",
      duree: "",
      titre: "",
      description: "",
      typeTravail: ""
    }
  ]);
  const searchParams = useSearchParams();
  const cvId = searchParams.get("id");
  const add = (set, obj) => set((v) => [...v, obj]);
  const remove = (set, i) => set((v) => v.filter((_, index) => index !== i));

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0]; // "2026-01-26"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/contenue/show_contenue?id=${cvId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA :", data);

        if (data?.Biographie) {
          setBiographies(data.Biographie);
          setBiographiesSuite(data.Biographie.biographieSuites ?? []);
        }

        if (data?.Apropos) {
          setApropos(data.Apropos);
        }

        if (data?.Competence) {
          setCompetences(data.Competence.competenceContenus ?? []);
        }

        if (data?.Formation) {
          setFormations(
            (data.Formation.FormationContenu ?? []).map((f) => ({
              ...f,
              anneeDebut: formatDateForInput(f.anneeDebut),
              anneeFin: formatDateForInput(f.anneeFin)
            }))
          );
        }

        if (data?.Langue) {
          setLangues(
            data.Langue.LangueContenue.map((l) => ({
              langue: l.language, // ⚠️ ton state attend "langue", pas "language"
              niveau: l.niveau
            })) ?? []
          );
        }

        if (data?.AutreActivite) {
          setAutres(data.AutreActivite.autreActiviteContenues ?? []);
        }

        if (data?.Experience) {
          setExperience(
            (data.Experience.ExperienceContenu ?? []).map((e) => ({
              ...e,
              anneeDebut: formatDateForInput(e.anneeDebut),
              anneeFin: formatDateForInput(e.anneeFin)
            }))
          );
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const utilisateurId = localStorage.getItem("utilisateur_id") ?? null;
    const token = localStorage.getItem("token");
    formData.append("utilisateur_id", utilisateurId);
    formData.append("Biographie", JSON.stringify(biographies));
    formData.append(
      "BiographieSuite[contenus]",
      JSON.stringify(biographiesSuite)
    );
    formData.append("Apropos", JSON.stringify(apropos));
    formData.append("Experience[contenus]", JSON.stringify(experience));
    formData.append("Competence[contenus]", JSON.stringify(competences));
    formData.append("Formation[contenus]", JSON.stringify(formations));
    formData.append("Apropos", JSON.stringify(apropos));
    formData.append("Langue[contenus]", JSON.stringify(langues));
    formData.append("AutreActivite[contenus]", JSON.stringify(autres));

    if (photo) formData.append("file", photo);
    setLoadingSubmit(true);
    const url = cvId
      ? `${API_URL}/api/contenue/update_contenue/${cvId}`
      : `${API_URL}/api/contenue/create_contenue`;

    const res = await fetch(url, {
      method:  cvId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (res.ok) {
      // ✅ Succès → redirection
      // window.location.href = "/cv";
      console.log("OKKKK :", res);
      setLoadingSubmit(false);
    } else {
      // ❌ Erreur → log
      const errorData = await res.text(); // ou res.json()
      console.log("Erreur API :", errorData);
      setLoadingSubmit(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          {id ? "Modifier mon CV" : "Créer mon CV"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* BIOGRAPHIE (MULTI) */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🧍 Biographies</h2>

            <div className="border rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="Nom"
                  value={biographies.nom}
                  onChange={(e) => {
                    setBiographies({ ...biographies, nom: e.target.value });
                  }}
                />

                <input
                  className="input"
                  placeholder="Prénom"
                  value={biographies.prenom}
                  onChange={(e) => {
                    setBiographies({ ...biographies, prenom: e.target.value });
                  }}
                />

                <input
                  className="input"
                  placeholder="Adresse"
                  value={biographies.adresse}
                  onChange={(e) => {
                    setBiographies({ ...biographies, adresse: e.target.value });
                  }}
                />

                <input
                  className="input"
                  placeholder="Téléphone"
                  value={biographies.phone}
                  onChange={(e) => {
                    setBiographies({ ...biographies, phone: e.target.value });
                  }}
                />
                <input
                  className="input"
                  placeholder="Email"
                  value={biographies.email}
                  onChange={(e) => {
                    setBiographies({ ...biographies, email: e.target.value });
                  }}
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              🧍 Biographies (suite)
            </h2>

            {biographiesSuite.map((b, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="Titre"
                    value={b.titre}
                    onChange={(e) => {
                      const c = [...biographiesSuite];
                      c[i].titre = e.target.value;
                      setBiographiesSuite(c);
                    }}
                  />
                  <textarea
                    className="input md:col-span-2"
                    placeholder="Contenu"
                    value={b.contenue}
                    onChange={(e) => {
                      const c = [...biographiesSuite];
                      c[i].contenue = e.target.value;
                      setBiographiesSuite(c);
                    }}
                  />
                </div>

                {biographiesSuite.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(setBiographiesSuite, i)}
                    className="text-sm text-red-600"
                  >
                    Supprimer cette biographie
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                add(setBiographiesSuite, {
                  titre: "",
                  contenue: ""
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une biographie
            </button>
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🏢 A propos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input"
                placeholder="Titre du poste"
                value={apropos.titre}
                onChange={(e) =>
                  setApropos({ ...apropos, titre: e.target.value })
                }
              />
            </div>

            <TiptapEditor
              content={apropos.description}
              setContent={(value) =>
                setApropos({ ...apropos, description: value })
              }
            />
          </section>
          {/* FORMATION (MULTI) */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🎓 Formations</h2>

            {formations.map((f, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="École"
                    value={f.ecole}
                    onChange={(e) => {
                      const c = [...formations];
                      c[i].ecole = e.target.value;
                      setFormations(c);
                    }}
                  />

                  <input
                    className="input"
                    placeholder="Lieu"
                    value={f.lieu}
                    onChange={(e) => {
                      const c = [...formations];
                      c[i].lieu = e.target.value;
                      setFormations(c);
                    }}
                  />

                  <input
                    className="input"
                    type="date"
                    placeholder="Année début"
                    value={f.anneeDebut}
                    onChange={(e) => {
                      const c = [...formations];
                      c[i].anneeDebut = e.target.value;
                      setFormations(c);
                    }}
                  />

                  <input
                    className="input"
                    type="date"
                    placeholder="Année fin"
                    value={f.anneeFin}
                    onChange={(e) => {
                      const c = [...formations];
                      c[i].anneeFin = e.target.value;
                      setFormations(c);
                    }}
                  />

                  <input
                    className="input md:col-span-2"
                    placeholder="Diplôme"
                    value={f.diplome}
                    onChange={(e) => {
                      const c = [...formations];
                      c[i].diplome = e.target.value;
                      setFormations(c);
                    }}
                  />
                </div>

                {formations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(setFormations, i)}
                    className="text-sm text-red-600"
                  >
                    Supprimer cette formation
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                add(setFormations, {
                  ecole: "",
                  lieu: "",
                  anneeDebut: "",
                  anneeFin: "",
                  diplome: ""
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une formation
            </button>
          </section>

          {/* COMPETENCES */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">💡 Compétences</h2>
            {competences.map((c, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <input
                  className="input"
                  placeholder="Champ"
                  value={c.champ}
                  onChange={(e) => {
                    const copy = [...competences];
                    copy[i].champ = e.target.value;
                    setCompetences(copy);
                  }}
                />
                <input
                  className="input flex-1"
                  placeholder="Contenu"
                  value={c.contenue}
                  onChange={(e) => {
                    const copy = [...competences];
                    copy[i].contenue = e.target.value;
                    setCompetences(copy);
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(setCompetences, i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => add(setCompetences, { champ: "", contenue: "" })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une compétence
            </button>
          </section>

          {/* EXPERIENCE */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🏢 Expérience</h2>
            {experience.map((e, i) => (
              <div key={i}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="input"
                    placeholder="Entreprise"
                    value={e.entreprise}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i].entreprise = e.target.value;
                      setExperience(copy);
                    }}
                  />

                  <input
                    className="input"
                    placeholder="Titre du poste"
                    value={e.titre}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i].titre = e.target.value;
                      setExperience(copy);
                    }}
                  />

                  <input
                    className="input"
                    type="date"
                    placeholder="Année début"
                    value={e.anneeDebut}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i].anneeDebut = e.target.value;
                      setExperience(copy);
                    }}
                  />

                  <input
                    className="input"
                    type="date"
                    placeholder="Année fin"
                    value={e.anneeFin}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i].anneeFin = e.target.value;
                      setExperience(copy);
                    }}
                  />

                  <input
                    className="input"
                    placeholder="Durée (en mois)"
                    value={e.duree}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i].duree = e.target.value;
                      setExperience(copy);
                    }}
                  />

                  <input
                    className="input"
                    placeholder="Type de travail (CDI, Freelance…)"
                    value={e.typeTravail}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i].typeTravail = e.target.value;
                      setExperience(copy);
                    }}
                  />
                </div>

                <TiptapEditor
                  content={e.description}
                  setContent={(value) => {
                    const copy = [...experience];
                    copy[i].description = value;
                    setExperience(copy);
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(setExperience, i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                add(setExperience, {
                  anneeDebut: "",
                  anneeFin: "",
                  entreprise: "",
                  duree: "",
                  titre: "",
                  description: "",
                  typeTravail: ""
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une expérience
            </button>
          </section>

          {/* AUTRE ACTIVITÉ */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🎯 Autres activités</h2>

            {autres.map((a, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <input
                  className="input flex-1"
                  placeholder="Champ"
                  value={a.champ}
                  onChange={(e) => {
                    const copy = [...autres];
                    copy[i].champ = e.target.value;
                    setAutres(copy);
                  }}
                />

                <input
                  className="input flex-1"
                  placeholder="Contenu"
                  value={a.contenue}
                  onChange={(e) => {
                    const copy = [...autres];
                    copy[i].contenue = e.target.value;
                    setAutres(copy);
                  }}
                />

                <button
                  type="button"
                  onClick={() => remove(setAutres, i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => add(setAutres, { champ: "", contenue: "" })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une activité
            </button>
          </section>

          {/* LANGUES */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🌐 Langues</h2>

            {langues.map((l, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <input
                  className="input flex-1"
                  placeholder="Langue"
                  value={l.langue}
                  onChange={(e) => {
                    const copy = [...langues];
                    copy[i].langue = e.target.value;
                    setLangues(copy);
                  }}
                />

                <select
                  className="input"
                  value={l.niveau}
                  onChange={(e) => {
                    const copy = [...langues];
                    copy[i].niveau = e.target.value;
                    setLangues(copy);
                  }}
                >
                  <option value="">Niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Courant">Courant</option>
                  <option value="Bilingue">Bilingue</option>
                </select>

                <button
                  type="button"
                  onClick={() => remove(setLangues, i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => add(setLangues, { langue: "", niveau: "" })}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une langue
            </button>
          </section>

          {/* PHOTO */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">📸 Photo</h2>
            <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
          </section>

          <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800">
           {loadingSubmit ? "Envoi en cours..." : cvId ? "Mettre à jour" : "Créer mon CV"}
          
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
