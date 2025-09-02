"use client";
import React from "react";

export default function HeroClient() {
  return (
    <section id="inicio" className="hero-section min-h-screen flex items-center justify-center relative">
      <div className="sound-wave" />
      <div className="container mx-auto px-4 text-center text-white z-10">
        <div className="flex justify-center mb-6 hero-waves-top">
          <div className="flex items-center space-x-1 waves-inline">
            <div className="sound-bar h-12" />
            <div className="sound-bar h-16" />
            <div className="sound-bar h-20" />
            <div className="sound-bar h-16" />
            <div className="sound-bar h-12" />
          </div>
        </div>

        <div className="hero-spacer" />

        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 hero-buttons">
          <a href="#explora" className="bg-turquesaAudioBrand hover:bg-opacity-90 text-white px-8 py-3 rounded-full text-lg font-medium transition-all transform hover:scale-105">Explorar sonidos</a>
          <a href="#que-es" className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-3 rounded-full text-lg font-medium transition-all">Conocer más</a>
        </div>
      </div>
    </section>
  );
}
