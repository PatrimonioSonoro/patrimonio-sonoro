import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Patrimonio Sonoro - AudioBrand",
  description: "Plataforma para explorar y preservar paisajes sonoros de Colombia",
  icons: {
  icon: '/favicon.ico',
  shortcut: '/images/logo_sin_letra_transparente.png',
  apple: '/images/logo_sin_letra_transparente.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
  {/* Prefer legacy favicon.ico for broadest support, PNG links remain as fallback */}
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" href="/images/logo_sin_letra_transparente.png" sizes="any" />
  <link rel="shortcut icon" href="/images/logo_sin_letra_transparente.png" />
  <link rel="apple-touch-icon" href="/images/logo_sin_letra_transparente.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
