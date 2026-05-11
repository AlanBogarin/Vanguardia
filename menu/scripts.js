/** @typedef {import("alertify")} */
/** @typedef {import("../js/bd")} */
/** @typedef {import("../js/alertas")} */

// Mostrar y Ocultar el sidebar
window.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
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
});

// Cargar los componentes dinamicamente
window.addEventListener("DOMContentLoaded", () => {
    cargarComponente("contenedor-navbar", "/menu/navbar.html");
    cargarComponente("contenedor-sidebar", "/menu/sidebar.html");
    cargarComponente("contenedor-footer", "/menu/footer.html");
})

document.addEventListener("DOMContentLoaded", () => { validarSesion(); });
document.addEventListener("DOMContentLoaded", () => { cargarDatosNavbar(); });

/**
 * Funcion para cargar componentes especificos en el html
 * @param {string} id ID de la etiqueta html
 * @param {string} path Ruta del archivo html a cargar
 */
function cargarComponente(id, path) {
    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar " + path);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
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

// ── Abrir Configuración: pre-llenar datos ────────────────────────────────────
document.addEventListener('show.bs.modal', function (e) {
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
});

function guardarConfiguracion() {
    const usuario = cargarUsuario(cargarSesion().user_id);
    const nuevoNombre = document.getElementById('cfgNombre').value.trim().toUpperCase();
    const nuevoUsuario = document.getElementById('cfgUsuario').value.trim();
    // const nuevoCelular = document.getElementById('cfgCelular').value.trim();
    if (!nuevoNombre || !nuevoUsuario) {
        alertify.error('El nombre y usuario son obligatorios.');
        return;
    }
    usuario.nombre = nuevoNombre;
    usuario.username = nuevoUsuario;
    // usuario.tel = nuevoCelular;
    guardarUsuario(usuario);
    cargarDatosNavbar();
    bootstrap.Modal.getInstance(document.getElementById('modalConfiguracion')).hide();
    alertify.success('Configuración guardada correctamente.');
}

async function cambiarContrasena() {
    const usuario = cargarUsuario(cargarSesion().user_id)
    const actual    = document.getElementById('passActual').value;
    const nueva     = document.getElementById('passNueva').value;
    const confirmar = document.getElementById('passConfirmar').value;
    if (!actual || !nueva || !confirmar) {
        alertify.error('Completá todos los campos.');
        return;
    }
    if (nueva.length < 6) {
        alertify.error('La nueva contraseña debe tener mínimo 6 caracteres.');
        return;
    }
    if (nueva !== confirmar) {
        alertify.error('Las contraseñas no coinciden.');
        return;
    }
    if (usuario.password_hash !== await hashPassword(actual)) {
        alertify.error('La contraseña actual es incorrecta.');
        return;
    }
    usuario.password_hash = await hashPassword(nueva);
    guardarUsuario(usuario);
    bootstrap.Modal.getInstance(document.getElementById('modalCambiarContrasena')).hide();
    alertify.success('Contraseña cambiada correctamente.');
}

// cerrarSesion(): definido en `alertas.js`
