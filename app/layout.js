import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles.css";
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
    icon: [
      { url: '/images/favicon-sound.svg', type: 'image/svg+xml', sizes: 'any' }
    ],
    shortcut: '/images/favicon-sound.svg',
    apple: '/images/favicon-sound.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
    <head>
  {/* Favicon de música: muestra el icono de /images/favicon-sound.svg */}
  <link rel="icon" href="/images/favicon-sound.svg" sizes="any" />
  <link rel="shortcut icon" href="/images/favicon-sound.svg" />
  <link rel="apple-touch-icon" href="/images/favicon-sound.svg" />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
