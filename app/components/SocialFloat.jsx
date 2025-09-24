import React from 'react'
import { trackSocialClick } from '../../lib/googleAnalytics'

export default function SocialFloat({ links = {} }) {
  
  // Deja aquí tus links (puedes pasarlos como prop o editar directamente)
  const {
    instagram = '',
    facebook = '',
    youtube = '',
    tiktok = ''
  } = links

  // Usamos clases CSS en globals.css para manejar estilos y hover

  const renderLink = (href, title, svg, platform) => {
    // Si href está vacío, devolvemos un elemento no-clickable para mantener el espacio
    if (!href) {
      return (
        <div title={title} className="social-cta" aria-hidden>
          {svg}
        </div>
      )
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className="social-cta"
        onClick={() => {
          trackSocialClick(platform, href);
        }}
      >
        {svg}
      </a>
    )
  }

  const imgStyle = {
    width: 22,
    height: 22,
    objectFit: 'contain'
  }

  return (
  <div className="social-float" aria-label="social-floating">
      {renderLink(
        instagram,
        'Instagram',
        <img src="/iconos/instagram.png" alt="Instagram" style={imgStyle} />,
        'instagram'
      )}

      {renderLink(
        facebook,
        'Facebook',
        <img src="/iconos/facebook.png" alt="Facebook" style={imgStyle} />,
        'facebook'
      )}

      {renderLink(
        youtube,
        'YouTube',
        <img src="/iconos/youtube.png" alt="YouTube" style={imgStyle} />,
        'youtube'
      )}

      {renderLink(
        tiktok,
        'TikTok',
        <img src="/iconos/tik-tok.png" alt="TikTok" style={imgStyle} />,
        'tiktok'
      )}
    </div>
  )
}
