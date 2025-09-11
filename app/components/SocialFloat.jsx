import React from 'react'

export default function SocialFloat({ links = {} }) {
  // Deja aquí tus links (puedes pasarlos como prop o editar directamente)
  const {
    instagram = '',
    facebook = '',
    youtube = '',
    tiktok = ''
  } = links

  const iconClass = {
    container: {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
      gap: '0.6rem',
      alignItems: 'center'
    },
    button: {
      width: '44px',
      height: '44px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      transition: 'transform 120ms ease, box-shadow 120ms ease',
      textDecoration: 'none',
      color: 'inherit'
    },
    icon: {
      width: '22px',
      height: '22px'
    }
  }

  const renderLink = (href, title, svg) => {
    // Si href está vacío, devolvemos un elemento no-clickable para mantener el espacio
    if (!href) {
      return (
        <div title={title} style={iconClass.button} aria-hidden>
          {svg}
        </div>
      )
    }

    return (
      <a
        href={href}
        title={title}
        style={iconClass.button}
        target="_blank"
        rel="noopener noreferrer"
      >
        {svg}
      </a>
    )
  }

  const imgStyle = {
    width: iconClass.icon.width,
    height: iconClass.icon.height,
    objectFit: 'contain'
  }

  return (
    <div style={iconClass.container} aria-label="social-floating">
      {renderLink(
        instagram,
        'Instagram',
        <img src="/iconos/instagram.png" alt="Instagram" style={imgStyle} />
      )}

      {renderLink(
        facebook,
        'Facebook',
        <img src="/iconos/facebook.png" alt="Facebook" style={imgStyle} />
      )}

      {renderLink(
        youtube,
        'YouTube',
        <img src="/iconos/youtube.png" alt="YouTube" style={imgStyle} />
      )}

      {renderLink(
        tiktok,
        'TikTok',
        <img src="/iconos/tik-tok.png" alt="TikTok" style={imgStyle} />
      )}
    </div>
  )
}
