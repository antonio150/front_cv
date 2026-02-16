"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TemplatePage() {
  const searchParams = useSearchParams();
  const [firstId, setFirstId] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: "Template 1",
      image: "/templates/template1.jpg",
      endpoint: "export-pdf"
    },
    {
      id: 2,
      name: "Template 2",
      image: "/templates/template2.jpg",
      endpoint: "export-pdf2"
    },
    {
      id: 3,
      name: "Template 3",
      image: "/templates/template3.jpg",
      endpoint: "export-pdf3"
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const utilisateurId = localStorage.getItem("utilisateur_id");
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
          setFirstId(data[0].id);
        } else if (data && !Array.isArray(data)) {
          if (data.id) setFirstId(data.id);
        }
      });
  }, []);

  const exportPdf = async (endpoint, templateId) => {
    if (!firstId) return;

    try {
      setLoadingTemplate(templateId); // active le loading

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/contenue/${endpoint}/${firstId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        console.log("Erreur export PDF :", res.status, res.statusText);
        setLoadingTemplate(null);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "mon-cv.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoadingTemplate(null); // stop loading
    }
  };

  return (
    <div>
        <Navbar />
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-10">
        Liste de template CV disponible 
      </h1>
      <p className="text-center mb-10">Clicker sur le template pour exporter en pdf</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => exportPdf(template.endpoint, template.id)}
            className="relative cursor-pointer border rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
          >
            <Image
              src={template.image}
              alt={template.name}
              width={400}
              height={500}
              className="w-full h-auto"
            />

            <div className="p-4 text-center font-semibold">{template.name}</div>

            {/* LOADING OVERLAY */}
            {loadingTemplate === template.id && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </div>
  );
}
