"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import DashboardHero from "./components/DashboardHero";
import QuickActions from "./components/QuickActions";
import RecentSounds from "./components/RecentSounds";
import useDashboardData from "./hooks/useDashboardData";

export default function AppDashboardPage() {
  const { user, nombre, recentSounds, stats, campesenaAlbum } = useDashboardData();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 sm:pt-28 pb-12">
        <div className="space-y-10">
          <DashboardHero
            nombre={nombre}
            stats={stats}
            onSignOut={async () => {
              await supabase.auth.signOut();
            }}
          />

          <QuickActions />

          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-azulInstitucional/5 px-4 py-2 text-xs font-extrabold tracking-wide text-azulInstitucional ring-1 ring-azulInstitucional/10">
                  <span className="h-2 w-2 rounded-full bg-turquesaAudioBrand" />
                  Álbum destacado
                </div>
                <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-azulInstitucional">Álbum CampeSENA</h2>
                <p className="mt-2 text-sm text-gray-700 max-w-3xl">
                  {campesenaAlbum?.description ||
                    "Una experiencia musical y cultural que conecta el campo con el país. Explora las canciones, reproduce y consulta créditos."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-xs font-extrabold text-gray-700 ring-1 ring-black/5">
                    <span className="h-2 w-2 rounded-full bg-azulInstitucional/60" />
                    {Number.isFinite(campesenaAlbum?.songsCount) ? campesenaAlbum.songsCount : 0} canciones
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-xs font-extrabold text-gray-700 ring-1 ring-black/5">
                    <span className="h-2 w-2 rounded-full bg-turquesaAudioBrand/80" />
                    Créditos disponibles
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/app/albums/campesena"
                  className="inline-flex items-center justify-center rounded-full bg-azulInstitucional px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110"
                >
                  Abrir álbum
                </Link>
                <Link
                  href="/app/favoritos"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-azulInstitucional shadow-sm transition hover:bg-gray-50"
                >
                  Ver favoritos
                </Link>
              </div>
            </div>
          </section>

          <RecentSounds sounds={recentSounds} />
        </div>
      </div>
    </div>
  );
}
