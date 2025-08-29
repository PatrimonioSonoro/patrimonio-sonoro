(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9615544623d2fa30',t:'MTc1Mjg3NjgzNy4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();

// Mapa Sonoro – Leaflet implementation
window.addEventListener('DOMContentLoaded', () => {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof L === 'undefined') return;

    const map = L.map('map', {
        zoomControl: true,
    }).setView([4.5709, -74.2973], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
    }).addTo(map);

    let soundLocations = [
        {
            name: 'Selva Amazónica',
            coords: [-1.2, -70.0],
            audio: 'https://archive.org/download/rainforest_202104/amazon_rainforest.mp3',
            author: 'Juan Gonzalez'
        },
        {
            name: 'Sabana Andina',
            coords: [4.7, -74.1],
            audio: 'https://archive.org/download/birdsong_202104/andina_birds.mp3',
            author: 'Anónimo'
        },
        {
            name: 'Costa Caribe',
            coords: [10.4, -75.5],
            audio: 'https://archive.org/download/seawaves_202003/caribe_waves.mp3',
            author: 'Anónimo'
        },
        {
            name: 'Litoral Pacífico',
            coords: [3.5, -77.4],
            audio: 'https://archive.org/download/rainstorm_201909/pacifico_rain.mp3',
            author: 'Anónimo'
        },
        {
            name: 'Región Insular',
            coords: [1.24, -81.3],
            audio: 'https://archive.org/download/oceanwaves_202001/insular_waves.mp3',
            author: 'Anónimo'
        }
    ];

    function updateMarkers() {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        soundLocations.forEach((loc, idx) => {
            const marker = L.marker(loc.coords).addTo(map);
            const popupContent = `
                <div class="text-center">
                    <h3 class="font-semibold text-azulInstitucional">${loc.name}</h3>
                    <span class="block text-sm text-gray-500 mb-2">Autor: ${loc.author}</span>
                    <audio controls class="w-full mt-1 rounded-lg overflow-hidden bg-grisClaro">
                        <source src="${loc.audio}" type="audio/mpeg">
                        Tu navegador no soporta la reproducción de audio.
                    </audio>
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    }


    updateMarkers();
});

      // Toggle user menu (desktop) using .user-dropdown.active and CSS transitions
      const avatarBtn = document.getElementById('avatar-button');
      const userDropdown = document.getElementById('user-dropdown');
      const userMenu = document.getElementById('user-menu');
      if (userMenu) {
        // Ensure Tailwind 'hidden' doesn't override our CSS visibility
        userMenu.classList.remove('hidden');
      }
      if (avatarBtn && userDropdown) {
        avatarBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          userDropdown.classList.toggle('active');
        });
        // Close on outside click
        document.addEventListener('click', function (e) {
          if (!userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
          }
        });
      }

// Logout functionality (desktop)
const logoutBtn = document.getElementById('logout-button') || document.getElementById('logout-button-dashboard');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof Swal !== 'undefined') {
          Swal.fire({
              title: '¿Estás seguro?',
              text: 'Quieres cerrar sesión.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, cerrar sesión',
              cancelButtonText: 'Cancelar'
          }).then((result) => {
              if (result.isConfirmed) {
                  window.location.href = '/login';
              }
          });
        } else {
          window.location.href = '/login';
        }
    });
}

// Set user initials and name (guard against missing elements)
    const elUserInitials = document.getElementById('user-initials');
    if (elUserInitials) elUserInitials.textContent = 'J';
    const elUserMenuInitials = document.getElementById('user-menu-initials');
    if (elUserMenuInitials) elUserMenuInitials.textContent = 'J';
    const elUserMenuName = document.getElementById('user-menu-name');
    if (elUserMenuName) elUserMenuName.textContent = 'Juan';
    const elUserMenuEmail = document.getElementById('user-menu-email');
    if (elUserMenuEmail) elUserMenuEmail.textContent = 'juan@gmail.com';
    const elDashUserName = document.getElementById('dash-user-name');
    if (elDashUserName) elDashUserName.textContent = 'Juan';
    const elDashUserEmail = document.getElementById('dash-user-email');
    if (elDashUserEmail) elDashUserEmail.textContent = 'juan@gmail.com';

    // --- Mobile menu functionality ---
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuBtn && mobileMenu) {
        const body = document.body;

        const openMenu = () => {
            mobileMenu.classList.add('open');
            mobileMenu.setAttribute('aria-hidden', 'false');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            mobileOverlay?.classList.remove('hidden');
            body.classList.add('overflow-hidden');
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileOverlay?.classList.add('hidden');
            body.classList.remove('overflow-hidden');
        };

        // Toggle on button
        mobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close on overlay click
        mobileOverlay?.addEventListener('click', closeMenu);

        // Close when any link inside it is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu();
            }
        });

        // Close on viewport >= md
        const mq = window.matchMedia('(min-width: 768px)');
        mq.addEventListener?.('change', (e) => {
            if (e.matches) closeMenu();
        });
        // Fallback for older browsers
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) closeMenu();
        });
    }