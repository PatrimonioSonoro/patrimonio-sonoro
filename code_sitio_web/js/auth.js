// auth.js - Simulación de autenticación con roles usando localStorage y SweetAlert2

function initAuth(){
    /* Elementos del DOM */
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginModal = document.getElementById('login-modal');

    const loginButton = document.getElementById('login-button');
    const mobileLoginButton = document.getElementById('mobile-login-button');
    const logoutButton = document.getElementById('logout-button');
    const mobileLogoutButton = document.getElementById('mobile-logout-button');

    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileUserName = document.getElementById('mobile-user-name');
    const mobileUserEmail = document.getElementById('mobile-user-email');
    const mobileUserInitials = document.getElementById('mobile-user-initials');
    // Dashboard elements
    const dashUserName = document.getElementById('dash-user-name');
    const dashUserEmail = document.getElementById('dash-user-email');
    const dashLogout = document.getElementById('logout-button-dashboard');
    // Desktop profile elements
    const userDropdown = document.getElementById('user-dropdown');
    const userInitialsDom = document.getElementById('user-initials');
    const userMenuInitials = document.getElementById('user-menu-initials');
    const userMenuName = document.getElementById('user-menu-name');
    const userMenuEmail = document.getElementById('user-menu-email');

    /* Utilidades */
    const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
    const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

    const getCurrentUser = () => JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || 'null');
    const setCurrentUser = (user) => sessionStorage.setItem('currentUser', JSON.stringify(user));
    const clearCurrentUser = () => {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
    };

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(p => p[0]).join('').toUpperCase();
    };

    /* Interfaz */
    const updateUI = () => {
        const user = getCurrentUser();

        if (user) {
            // Ocultar botones de inicio de sesión
            loginButton?.classList.add('hidden');
            mobileLoginButton?.classList.add('hidden');

            // Mostrar info de usuario en menú móvil
            if (mobileUserInfo) {
                mobileUserInfo.classList.remove('hidden');
                mobileUserName.textContent = user.name;
                mobileUserEmail.textContent = user.email;
                mobileUserInitials.textContent = getInitials(user.name);
            }
            // Desktop dropdown
            if (userDropdown) {
                userDropdown.classList.remove('hidden');
                userInitialsDom.textContent = getInitials(user.name);
                userMenuInitials.textContent = getInitials(user.name);
                userMenuName.textContent = user.name;
                userMenuEmail.textContent = user.email;
            }

            // Mostrar botones de cerrar sesión
            logoutButton?.classList.remove('hidden');
            mobileLogoutButton?.classList.remove('hidden');
        } else {
            loginButton?.classList.remove('hidden');
            mobileLoginButton?.classList.remove('hidden');
            mobileUserInfo?.classList.add('hidden');
            logoutButton?.classList.add('hidden');
            userDropdown?.classList.add('hidden');
            mobileLogoutButton?.classList.add('hidden');
        }
    };

    const closeModal = () => {
        // El modal se muestra/oculta usando la clase "open" (ajusta si es diferente)
        loginModal?.classList.remove('active');
    };

    /* Registro */
    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const role = document.getElementById('register-role').value;

        if (!role) {
            Swal.fire('Rol requerido', 'Por favor selecciona un rol para continuar', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
            return;
        }

        const users = getUsers();
        if (users.some(u => u.email === email)) {
            Swal.fire('Error', 'El correo ya está registrado', 'error');
            return;
        }

        users.push({ name, email, password, role });
        saveUsers(users);

        Swal.fire('¡Registro exitoso!', 'Ahora puedes iniciar sesión', 'success');
        registerForm.reset();

        // Cambiar a pestaña de inicio de sesión
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });

    /* Inicio de sesión */
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        const user = getUsers().find(u => u.email === email && u.password === password);
        if (!user) {
            Swal.fire('Error', 'Credenciales incorrectas', 'error');
            return;
        }

        // Persistencia según "Recordarme"
        const remember = document.getElementById('remember-me').checked;
        if (remember) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        Swal.fire({
            title: `¡Bienvenido, ${user.name}!`,
            text: 'Ya perteneces a Patrimonio Sonoro',
            icon: 'success',
            confirmButtonColor: '#00B8A9',
            background: '#fdfdfd',
        });
        closeModal();
        updateUI();

            // Redirigir al dashboard luego de bienvenida
            Swal.fire({
                title: `¡Bienvenido, ${user.name}!`,
                text: 'Ya perteneces a Patrimonio Sonoro',
                icon: 'success',
                confirmButtonColor: '#00B8A9',
                background: '#fdfdfd',
            }).then(()=>{
                window.location.href = 'dashboard.html';
            });
    });

    /* Cerrar sesión */
    const handleLogout = () => {
        clearCurrentUser();
        updateUI();
        Swal.fire('Sesión cerrada', 'Has cerrado sesión correctamente', 'info').then(()=>{
            window.location.href = 'index.html';
        });
    };

    logoutButton?.addEventListener('click', handleLogout);
    mobileLogoutButton?.addEventListener('click', handleLogout);

    /* Tabs dentro del modal */
    const authTabs = document.querySelectorAll('.auth-tab');
    const authContents = document.querySelectorAll('.auth-content');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            authContents.forEach(c => c.classList.remove('active'));
            document.getElementById(`${target}-content`).classList.add('active');
        });
    });

    /* Toggle de visibilidad de contraseña */
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            if (input?.type === 'password') {
                input.type = 'text';
                toggle.classList.add('active');
            } else if (input) {
                input.type = 'password';
                toggle.classList.remove('active');
            }
        });
    });

    /* Funcionalidad "Olvidaste tu contraseña" */
    document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        Swal.fire('Recuperar contraseña', 'Por favor contacta al administrador para restablecer tu contraseña.', 'info');
    });

    /* Mostrar modal */
    const openModal = () => loginModal?.classList.add('active');
    loginButton?.addEventListener('click', openModal);
    mobileLoginButton?.addEventListener('click', openModal);

    /* Cerrar modal al hacer clic fuera del contenido */
    loginModal?.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    /* Inicialización */
    updateUI();

    // Poblar campos en dashboard si existen
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (dashUserName) dashUserName.textContent = currentUser.name;
        if (dashUserEmail) dashUserEmail.textContent = currentUser.email;
    }

    // Toggle user dropdown
    const avatarButton = document.getElementById('avatar-button');
    const userMenu = document.getElementById('user-menu');
    avatarButton?.addEventListener('click', (e)=>{
        e.stopPropagation();
        userMenu?.classList.toggle('hidden');
    });
    document.addEventListener('click',(e)=>{
        if(!userMenu?.classList.contains('hidden') && !userMenu?.contains(e.target) && e.target!==avatarButton){
            userMenu.classList.add('hidden');
        }
    });

    // Bind logout in dashboard
    dashLogout?.addEventListener('click', handleLogout);

    // Si había una sesión persistente almacenada en localStorage, actualizar UI directamente
    if (getCurrentUser()) updateUI();
}

// Ejecutar inicialización inmediatamente o tras cargar el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
