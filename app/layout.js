import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles.css";
import AuthProvider from "./components/AuthProvider";
import SocialFloat from "./components/SocialFloat";
import Footer from "./components/Footer";
import MotionLayout from "./components/MotionLayout";

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
      { url: '/iconos/icono.jpg', type: 'image/jpeg', sizes: 'any' }
    ],
    shortcut: '/iconos/icono.jpg',
    apple: '/iconos/icono.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
    <head>
  {/* Favicon de música: muestra el icono de /images/favicon-sound.svg */}
    <link rel="icon" href="/iconos/icono.jpg" sizes="any" />
    <link rel="shortcut icon" href="/iconos/icono.jpg" />
    <link rel="apple-touch-icon" href="/iconos/icono.jpg" />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {/* Puedes pasar los links aquí o editarlos directamente en el componente */}
          <SocialFloat links={{
            instagram: 'https://www.instagram.com/patrimoniosonoro?igsh=MTJyYjdpc2NtczUzYQ==',
            facebook: 'https://www.facebook.com/share/1AYW6Q5TJu/',
            youtube: 'https://youtube.com/@patrimoniosonoro_audiobrand?si=buRBdvYKubfOsq-p',
            tiktok: 'https://www.tiktok.com/@patrimonio.sonoro?_t=ZS-8zaNfJhRgoK&_r=1'
          }} />
          <MotionLayout>
            {children}
          </MotionLayout>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
