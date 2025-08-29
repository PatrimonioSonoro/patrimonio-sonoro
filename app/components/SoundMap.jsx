"use client";

import { useEffect, useRef } from "react";

export default function SoundMap() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Helper to inject a stylesheet once
    const ensureLeafletStyles = () => {
      const existing = document.querySelector(
        'link[href*="unpkg.com/leaflet@1.9.4/dist/leaflet.css"]'
      );
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
    };

    // Helper to load Leaflet script once
    const loadLeafletScript = () =>
      new Promise((resolve, reject) => {
        if (typeof window !== "undefined" && window.L) return resolve(window.L);
        const existing = document.querySelector(
          'script[src*="unpkg.com/leaflet@1.9.4/dist/leaflet.js"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(window.L));
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.body.appendChild(script);
      });

    const initMap = async () => {
      ensureLeafletStyles();
      const L = await loadLeafletScript();
      if (!containerRef.current || !L) return;

      // Initialize map
      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        [4.5709, -74.2973],
        5
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      const soundLocations = [
        {
          name: "Selva Amazónica",
          coords: [-1.2, -70.0],
          audio:
            "https://archive.org/download/rainforest_202104/amazon_rainforest.mp3",
          author: "Juan Gonzalez",
        },
        {
          name: "Sabana Andina",
          coords: [4.7, -74.1],
          audio: "https://archive.org/download/birdsong_202104/andina_birds.mp3",
          author: "Anónimo",
        },
        {
          name: "Costa Caribe",
          coords: [10.4, -75.5],
          audio: "https://archive.org/download/seawaves_202003/caribe_waves.mp3",
          author: "Anónimo",
        },
        {
          name: "Litoral Pacífico",
          coords: [3.5, -77.4],
          audio: "https://archive.org/download/rainstorm_201909/pacifico_rain.mp3",
          author: "Anónimo",
        },
        {
          name: "Región Insular",
          coords: [1.24, -81.3],
          audio: "https://archive.org/download/oceanwaves_202001/insular_waves.mp3",
          author: "Anónimo",
        },
      ];

      // Add markers
      soundLocations.forEach((loc) => {
        const marker = L.marker(loc.coords).addTo(map);
        const popupContent = `
          <div class="text-center">
            <h3 class="font-semibold text-azulInstitucional">${loc.name}</h3>
            <span class="block text-sm text-gray-500 mb-2">Autor: ${loc.author}</span>
            <audio controls class="w-full mt-1 rounded-lg overflow-hidden bg-grisClaro">
              <source src="${loc.audio}" type="audio/mpeg" />
              Tu navegador no soporta la reproducción de audio.
            </audio>
          </div>
        `;
        marker.bindPopup(popupContent);
      });
    };

    initMap();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "480px", borderRadius: 12, overflow: "hidden", position: "relative", zIndex: 0 }}
      aria-label="Mapa Sonoro de Colombia"
    />
  );
}
