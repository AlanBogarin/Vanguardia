/**
 * @typedef {import("../js/bd")}
 * @typedef {import("../js/alertas")}
 */

/**
 * Descargar un recurso/archivo del sistema
 * @param {string} path 
 * @returns {Promise<Response>}
 */
async function descargarRecurso(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Error al cargar " + path);
    return response;
}

/**
 * Descargar una imagen del sistema
 * @param {string} path 
 * @returns {Promise<string>}
 */
async function descargarImagen(path) {
    const response = await descargarRecurso("img/logo_x128.jpg");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Error al convertir el blob a Base64"));
        reader.readAsDataURL(blob);
    });
}

/**
 * Funcion para cargar componentes especificos en el html
 * @param {string} id ID de la etiqueta html
 * @param {string} path Ruta del archivo html a cargar
 */
async function cargarComponente(id, path) {
    try {
        const response = await descargarRecurso(path)
        const data = await response.text();
        document.getElementById(id).innerHTML = data;
        if (id === "contenedor-sidebar") aplicarPermisosSidebar();
        if (id === "contenedor-navbar") cargarDatosNavbar();
    } catch (error) {
        console.error(error);
    }
}

function cargarDatosNavbar() {
    const sesion = cargarSesion();
    if (!sesion) return;
    const usuario = cargarUsuario(sesion.user_id);
    if (!usuario) return;
    const nombre = usuario.name;
    const nombreusuario = usuario.username;
    const inicial = nombre.charAt(0).toUpperCase();
    const a1 = document.getElementById('navAvatar');
    const a2 = document.getElementById('ddAvatar');
    if (a1) a1.textContent = inicial;
    if (a2) a2.textContent = inicial;
    const ddNombre  = document.getElementById('ddNombre');
    const ddUsuario = document.getElementById('ddUsuario');
    if (ddNombre)  ddNombre.textContent  = nombre;
    if (ddUsuario) ddUsuario.textContent = nombreusuario ? '@' + nombreusuario : '';
    // 
    const usuarioDiv = document.getElementById("usuario");
    if (usuarioDiv) usuarioDiv.innerHTML = nombre;
}

function aplicarPermisosSidebar() {
    const sesion = cargarSesion();
    if (!sesion) return;
    const rol = cargarRol(cargarUsuario(sesion.user_id).rol_id);
    if (!rol) return;
    const flags = rol.flags;

    document.querySelectorAll('[data-permission]').forEach(item => {
        const permiso = item.getAttribute('data-permission').toUpperCase().replace("-", "_");
        if (!tienePermiso(flags, PERMISOS[permiso])) {
            item.style.display = 'none';
            item.classList.add('d-none'); // Bootstrap class for hiding
        }
    });

    // Ocultar categorías principales si todos sus subelementos están ocultos
    const collapseMenus = document.querySelectorAll('.collapse');
    collapseMenus.forEach(menu => {
        const links = menu.querySelectorAll('.nav-link');
        const visibleLinks = Array.from(links).filter(link => !link.classList.contains('d-none'));
        
        if (visibleLinks.length === 0) {
            const controlledBy = document.querySelector(`[data-bs-target="#${menu.id}"]`);
            if (controlledBy) {
                controlledBy.style.display = 'none';
            }
        }
    });
}

function guardarConfiguracion() {
    const usuario = cargarUsuario(cargarSesion().user_id);
    const nuevoNombre = document.getElementById('cfgNombre').value.trim().toUpperCase();
    const nuevoUsuario = document.getElementById('cfgUsuario').value.trim();
    // const nuevoCelular = document.getElementById('cfgCelular').value.trim();
    if (!nuevoNombre || !nuevoUsuario) {
        mensajeError('El nombre y usuario son obligatorios.');
        return;
    }
    usuario.name = nuevoNombre;
    usuario.username = nuevoUsuario;
    // usuario.tel = nuevoCelular;
    guardarUsuario(usuario);
    cargarDatosNavbar();
    bootstrap.Modal.getInstance(document.getElementById('modalConfiguracion')).hide();
    mensajeSuccess('Configuración guardada correctamente.');
}

async function cambiarContrasena() {
    const usuario = cargarUsuario(cargarSesion().user_id)
    const actual = document.getElementById('passActual').value;
    const nueva = document.getElementById('passNueva').value;
    const confirmar = document.getElementById('passConfirmar').value;
    if (!actual || !nueva || !confirmar) {
        mensajeError('Completá todos los campos.');
        return;
    }
    if (nueva.length < 6) {
        mensajeError('La nueva contraseña debe tener mínimo 6 caracteres.');
        return;
    }
    if (nueva !== confirmar) {
        mensajeError('Las contraseñas no coinciden.');
        return;
    }
    if (usuario.password_hash !== await hashPassword(actual)) {
        mensajeError('La contraseña actual es incorrecta.');
        return;
    }
    usuario.password_hash = await hashPassword(nueva);
    guardarUsuario(usuario);
    bootstrap.Modal.getInstance(document.getElementById('modalCambiarContrasena')).hide();
    mensajeSuccess('Contraseña cambiada correctamente.');
}

function configurarSideBar() {
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (!sidebarToggle) return;
    // Sidebar persistente al refrescar pagina
    if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        document.body.classList.toggle('sb-sidenav-toggled');
    }
    sidebarToggle.addEventListener('click', event => {
        event.preventDefault();
        document.body.classList.toggle('sb-sidenav-toggled');
        localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
}

async function configurarComponentesDinamicos() {
    await cargarComponente("contenedor-navbar", "menu/navbar.html");
    await cargarComponente("contenedor-sidebar", "menu/sidebar.html");
    await cargarComponente("contenedor-footer", "menu/footer.html");
}

function configurarModales(e) {
        if (e.target.id === 'modalConfiguracion') {
            const usuario = cargarUsuario(cargarSesion().user_id);
            if (!usuario) return;
            document.getElementById('cfgNombre').value  = usuario.name;
            document.getElementById('cfgUsuario').value = usuario.username;
            // document.getElementById('cfgCelular').value = usuario.tel;
        } else if (e.target.id === 'modalCambiarContrasena') {
            ['passActual','passNueva','passConfirmar'].forEach(id => {
                document.getElementById(id).value = '';
            });
        }
    }

if (!window.location.href.endsWith("login.html")) {
    // Cargar los componentes dinamicamente
    document.addEventListener("DOMContentLoaded", () => configurarComponentesDinamicos().then(() => {
        configurarSideBar();
        validarSesion()
    }))
    document.addEventListener('show.bs.modal', configurarModales);
}
