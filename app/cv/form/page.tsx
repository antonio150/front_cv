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
  const [photoPreview, setPhotoPreview] = useState(null); // URL for selected file preview
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null); // URL from API when editing
  const [formationsErrors, setFormationsErrors] = useState([]);
  const [experienceErrors, setExperienceErrors] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessages, setModalMessages] = useState([]);

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
      titre: "",
      posteActuel: false,
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
    if (cvId) {
      setLoadingContent(true);
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

          if (data?.posteActuel) {
            setPosteActuel(data.posteActuel);
          }

          if (data?.Competence) {
            setCompetences(data.Competence.competenceContenus ?? []);
          }

          if (data?.Formation) {
            const mapped = (data.Formation.FormationContenu ?? []).map((f) => ({
              ...f,
              anneeDebut: formatDateForInput(f.anneeDebut),
              anneeFin: formatDateForInput(f.anneeFin)
            }));
            setFormations(mapped);
            setFormationsErrors(Array(mapped.length).fill(""));
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
            const mappedExp = (data.Experience.ExperienceContenu ?? []).map(
              (e) => ({
                ...e,
                anneeDebut: formatDateForInput(e.anneeDebut),
                anneeFin: formatDateForInput(e.anneeFin)
              })
            );
            setExperience(mappedExp);
            setExperienceErrors(Array(mappedExp.length).fill(""));
          }
          // photo existante si fournie par l'API
          if (data?.Photo?.pathRelative) {
            setExistingPhotoUrl(`${API_URL}${data.Photo.pathRelative}`);
          }
          setLoadingContent(false);
        });
    }
  }, []);

  // cleanup object URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (photoPreview) {
        try {
          URL.revokeObjectURL(photoPreview);
        } catch (e) {}
      }
    };
  }, [photoPreview]);

  const validateDateOrder = (start, end) => {
    if (!start || !end) return "";
    return start > end
      ? "La date de début ne peut pas être postérieure à la date de fin"
      : "";
  };

  const calculateDurationInMonths = (start, end) => {
    if (!start || !end) return "";
    // Dates sont au format YYYY-MM-DD
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return Math.max(0, months).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Re-validate dates before submit
    const newFormErrors = formations.map((f) =>
      validateDateOrder(f.anneeDebut, f.anneeFin)
    );
    const newExpErrors = experience.map((e) =>
      validateDateOrder(e.anneeDebut, e.anneeFin)
    );
    setFormationsErrors(newFormErrors);
    setExperienceErrors(newExpErrors);
    if (newFormErrors.some(Boolean) || newExpErrors.some(Boolean)) {
      // build messages indicating which section and which items have errors
      const details = [];
      if (newFormErrors.some(Boolean)) {
        newFormErrors.forEach((m, idx) => {
          if (m) details.push(`Formation ${idx + 1}: ${m}`);
        });
      }
      if (newExpErrors.some(Boolean)) {
        newExpErrors.forEach((m, idx) => {
          if (m) details.push(`Expérience ${idx + 1}: ${m}`);
        });
      }
      setModalTitle("Erreurs de validation");
      setModalMessages(details);
      setShowModal(true);
      return;
    }

    const formData = new FormData();
    const utilisateurId = localStorage.getItem("utilisateur_id") ?? null;
    const token = localStorage.getItem("token");
    formData.append("utilisateur_id", utilisateurId);
    /* =========================
   BIOGRAPHIE
========================= */
    Object.entries(biographies).forEach(([key, value]) => {
      formData.append(`Biographie[${key}]`, value ?? "");
    });

    /* =========================
   BIOGRAPHIE SUITE
========================= */
    biographiesSuite.forEach((b, i) => {
      formData.append(`BiographieSuite[contenus][${i}][titre]`, b.titre ?? "");
      formData.append(
        `BiographieSuite[contenus][${i}][contenue]`,
        b.contenue ?? ""
      );
    });

    /* =========================
   APROPOS
========================= */
    Object.entries(apropos).forEach(([key, value]) => {
      formData.append(`Apropos[${key}]`, value ?? "");
    });

    /* =========================
   FORMATIONS
========================= */
    formations.forEach((f, i) => {
      Object.entries(f).forEach(([key, value]) => {
        formData.append(`Formation[contenus][${i}][${key}]`, value ?? "");
      });
    });

    /* =========================
   EXPERIENCE
========================= */
    experience.forEach((exp, i) => {
      Object.entries(exp).forEach(([key, value]) => {
        const stringValue =
          value === null || value === undefined ? "" : String(value); // ← boolean devient "true" ou "false"

        formData.append(`Experience[contenus][${i}][${key}]`, stringValue);
      });
    });

    /* =========================
   COMPETENCES
========================= */
    competences.forEach((c, i) => {
      Object.entries(c).forEach(([key, value]) => {
        formData.append(`Competence[contenus][${i}][${key}]`, value ?? "");
      });
    });

    /* =========================
   LANGUES
========================= */
    langues.forEach((l, i) => {
      formData.append(`Langue[contenus][${i}][langue]`, l.langue ?? "");
      formData.append(`Langue[contenus][${i}][niveau]`, l.niveau ?? "");
    });

    /* =========================
   AUTRES ACTIVITES
========================= */
    autres.forEach((a, i) => {
      Object.entries(a).forEach(([key, value]) => {
        formData.append(`AutreActivite[contenus][${i}][${key}]`, value ?? "");
      });
    });

    /* =========================
   PHOTO
========================= */
    if (photo) {
      formData.append("file", photo);
    }
    setLoadingSubmit(true);
    const url = cvId
      ? `${API_URL}/api/contenue/update_contenue/${cvId}`
      : `${API_URL}/api/contenue/create_contenue`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (res.ok) {
      // ✅ Succès → redirection
      window.location.href = "/cv";
      console.log("OKKKK :", res);
      setLoadingSubmit(false);
    } else {
      // ❌ Erreur → log
      const errorData = await res.text(); // ou res.json()
      console.log("Erreur API :", errorData);
      setLoadingSubmit(false);
    }
  };

  if (loadingContent && cvId) {
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
  }
  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          {id ? "Modifier mon CV" : "Créer mon CV"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* PHOTO */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">📸 Photo</h2>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Photo de profil
              </label>
              <input
                type="file"
                accept="image/*"
                required={!existingPhotoUrl} // obligatoire si pas d'image existante
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setPhoto(file);
                  // revoke previous preview if any
                  if (photoPreview) {
                    try {
                      URL.revokeObjectURL(photoPreview);
                    } catch (err) {}
                  }
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPhotoPreview(url);
                  } else {
                    setPhotoPreview(null);
                  }
                }}
                className="text-sm text-gray-600"
              />

              {/* Preview: selected file takes precedence over existing image */}
              {(photoPreview || existingPhotoUrl) && (
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={photoPreview ?? existingPhotoUrl}
                    alt="Aperçu photo"
                    className="w-28 h-28 object-cover rounded-full border"
                  />
                </div>
              )}
            </div>
          </section>
          {/* BIOGRAPHIE (MULTI) */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🧍 Biographies</h2>

            <div className="border rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    id="nom"
                    required
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Nom"
                    value={biographies.nom}
                    onChange={(e) => {
                      setBiographies({ ...biographies, nom: e.target.value });
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    required
                    id="prenom"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Prénom"
                    value={biographies.prenom}
                    onChange={(e) => {
                      setBiographies({
                        ...biographies,
                        prenom: e.target.value
                      });
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    id="adresse"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Adresse"
                    required
                    value={biographies.adresse}
                    onChange={(e) => {
                      setBiographies({
                        ...biographies,
                        adresse: e.target.value
                      });
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    required
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Téléphone"
                    value={biographies.phone}
                    onChange={(e) => {
                      setBiographies({ ...biographies, phone: e.target.value });
                    }}
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Email"
                    required
                    value={biographies.email}
                    onChange={(e) => {
                      setBiographies({ ...biographies, email: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              🧍 Biographies (suite)
            </h2>

            {biographiesSuite.map((b, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Titre"
                      value={b.titre}
                      onChange={(e) => {
                        const c = [...biographiesSuite];
                        c[i].titre = e.target.value;
                        setBiographiesSuite(c);
                      }}
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Contenu
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Contenu"
                      value={b.contenue}
                      onChange={(e) => {
                        const c = [...biographiesSuite];
                        c[i].contenue = e.target.value;
                        setBiographiesSuite(c);
                      }}
                    />
                  </div>
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
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Titre du poste
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Titre du poste"
                  value={apropos.titre}
                  required
                  onChange={(e) =>
                    setApropos({ ...apropos, titre: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </label>
              <TiptapEditor
                content={apropos.description}
                setContent={(value) =>
                  setApropos({ ...apropos, description: value })
                }
              />
            </div>
          </section>
          {/* FORMATION (MULTI) */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🎓 Formations</h2>

            {formations.map((f, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      École
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="École"
                      required
                      value={f.ecole}
                      onChange={(e) => {
                        const c = [...formations];
                        c[i].ecole = e.target.value;
                        setFormations(c);
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Lieu
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Lieu"
                      value={f.lieu}
                      required
                      onChange={(e) => {
                        const c = [...formations];
                        c[i].lieu = e.target.value;
                        setFormations(c);
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Date début
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="date"
                      placeholder="Date début"
                      required
                      value={f.anneeDebut}
                      onChange={(e) => {
                        const c = [...formations];
                        c[i].anneeDebut = e.target.value;
                        setFormations(c);
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Date fin
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="date"
                      placeholder="Date fin"
                      required
                      value={f.anneeFin}
                      onChange={(e) => {
                        const c = [...formations];
                        c[i].anneeFin = e.target.value;
                        setFormations(c);
                      }}
                    />
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Diplôme
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Diplôme"
                      value={f.diplome}
                      required
                      onChange={(e) => {
                        const c = [...formations];
                        c[i].diplome = e.target.value;
                        setFormations(c);
                      }}
                    />
                  </div>
                </div>

                {formations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      remove(setFormations, i);
                      setFormationsErrors((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }}
                    className="text-sm text-red-600"
                  >
                    Supprimer cette formation
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                add(setFormations, {
                  ecole: "",
                  lieu: "",
                  anneeDebut: "",
                  anneeFin: "",
                  diplome: ""
                });
                setFormationsErrors((prev) => [...prev, ""]);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une formation
            </button>
          </section>

          {/* COMPETENCES */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">💡 Compétences</h2>
            {competences.map((c, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3"
              >
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Champ
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Champ"
                    value={c.champ}
                    required
                    onChange={(e) => {
                      const copy = [...competences];
                      copy[i].champ = e.target.value;
                      setCompetences(copy);
                    }}
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Contenu
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Contenu"
                    value={c.contenue}
                    required
                    onChange={(e) => {
                      const copy = [...competences];
                      copy[i].contenue = e.target.value;
                      setCompetences(copy);
                    }}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => remove(setCompetences, i)}
                    className="text-red-500"
                    aria-label={`Supprimer compétence ${i + 1}`}
                  >
                    Supprimer cette compétence
                  </button>
                </div>
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
            {experience.map((exp, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Entreprise"
                      required
                      value={exp.entreprise}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i].entreprise = e.target.value;
                        setExperience(copy);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Date début
                    </label>
                    <input
                      className={`w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 border ${experienceErrors[i] ? "border-red-500" : "border-gray-200"}`}
                      type="date"
                      placeholder="Date début"
                      required
                      value={exp.anneeDebut}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i].anneeDebut = e.target.value;
                        setExperience(copy);
                        const err = validateDateOrder(
                          copy[i].anneeDebut,
                          copy[i].anneeFin
                        );
                        setExperienceErrors((prev) => {
                          const ne = [...prev];
                          ne[i] = err;
                          return ne;
                        });
                      }}
                    />
                  </div>
                  {experienceErrors[i] && (
                    <p className="text-sm text-red-600 mt-1">
                      {experienceErrors[i]}
                    </p>
                  )}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Date fin
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="date"
                      placeholder="Date fin"
                      required
                      value={exp.anneeFin}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i].anneeFin = e.target.value;
                        setExperience(copy);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Vous occupe actuelement ce poste
                    </label>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-300"
                      checked={exp.posteActuel}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i].posteActuel = e.target.checked;
                        setExperience(copy);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Durée (en mois)
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                      type="text"
                      placeholder="Calculée automatiquement"
                      readOnly
                      value={calculateDurationInMonths(
                        exp.anneeDebut,
                        exp.anneeFin
                      )}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Type de travail
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Type de travail (CDI, Freelance…)"
                      required
                      value={exp.typeTravail}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i].typeTravail = e.target.value;
                        setExperience(copy);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <TiptapEditor
                    content={exp.description}
                    setContent={(value) => {
                      const copy = [...experience];
                      copy[i].description = value;
                      setExperience(copy);
                    }}
                  />
                </div>

                <div className="flex">
                  <button
                    type="button"
                    onClick={() => {
                      remove(setExperience, i);
                      setExperienceErrors((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      );
                    }}
                    className="text-red-500"
                    aria-label={`Supprimer expérience ${i + 1}`}
                  >
                    Supprimer cette expérience
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                add(setExperience, {
                  anneeDebut: "",
                  anneeFin: "",
                  entreprise: "",
                  titre: "",
                  description: "",
                  typeTravail: ""
                });
                setExperienceErrors((prev) => [...prev, ""]);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              + Ajouter une expérience
            </button>
          </section>

          {/* AUTRE ACTIVITÉ */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">🎯 Autres activités</h2>

            {autres.map((a, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3"
              >
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Champ
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Champ"
                    required
                    value={a.champ}
                    onChange={(e) => {
                      const copy = [...autres];
                      copy[i].champ = e.target.value;
                      setAutres(copy);
                    }}
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Contenu
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Contenu"
                    value={a.contenue}
                    required
                    onChange={(e) => {
                      const copy = [...autres];
                      copy[i].contenue = e.target.value;
                      setAutres(copy);
                    }}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => remove(setAutres, i)}
                    className="text-red-500"
                    aria-label={`Supprimer activité ${i + 1}`}
                  >
                    Supprimer cette activité
                  </button>
                </div>
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
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3"
              >
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Langue
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Langue"
                    value={l.langue}
                    required
                    onChange={(e) => {
                      const copy = [...langues];
                      copy[i].langue = e.target.value;
                      setLangues(copy);
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Niveau
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={l.niveau}
                    required
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
                </div>

                <div className="flex flex-col items-end">
                  <button
                    type="button"
                    onClick={() => remove(setLangues, i)}
                    className="text-red-500"
                    aria-label={`Supprimer langue ${i + 1}`}
                  >
                    Supprimer cette langue
                  </button>
                </div>
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

          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800"
          >
            {loadingSubmit
              ? "Envoi en cours..."
              : cvId
                ? "Mettre à jour"
                : "Créer mon CV"}
          </button>
        </form>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4">
            <h3 className="text-lg font-semibold mb-3">{modalTitle}</h3>
            <div className="text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                {modalMessages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
