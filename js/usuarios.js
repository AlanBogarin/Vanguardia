/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalNUsuario = new bootstrap.Modal(document.getElementById('modalNuevoUsuario'));
const modalEUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));

function obtenerSiguienteId() {
    const usuarios = cargarUsuarios();
    if (usuarios.length === 0) return 1;
    return Math.max(...usuarios.map(u => u.id)) + 1;
}

function cargarOpcionesRoles() {
    const roles = cargarRoles();
    let options = '<option value="">Seleccione un rol...</option>';
    roles.forEach(r => {
        options += `<option value="${r.id}">${r.name}</option>`;
    });
    document.getElementById("rol_id").innerHTML = options;
    document.getElementById("edit_rol_id").innerHTML = options;
}

async function guardarNuevoUsuario(e) {
    e.preventDefault();
    const usernameElem = document.getElementById("username");
    let username = usernameElem.value.trim();
    const passwordElem = document.getElementById("password");
    let password = passwordElem.value;
    const passwordConfirmElem = document.getElementById("password_confirm");
    let passwordConfirm = passwordConfirmElem.value;
    const nombreElem = document.getElementById("nombre");
    let nombre = nombreElem.value.trim();
    const correoElem = document.getElementById("correo");
    let correo = correoElem.value.trim();
    const rolElem = document.getElementById("rol_id");
    let rol_id = Number.parseInt(rolElem.value);

    if (!username || !password || !nombre || !correo || isNaN(rol_id)) {
        alertify.error("Todos los campos son obligatorios");
        return;
    }
    
    if (password !== passwordConfirm) {
        alertify.error("Las contraseñas no coinciden");
        passwordConfirmElem.focus();
        return;
    }

    if (cargarUsuario(null, username.toLowerCase())) {
        alertify.error("El nombre de usuario ya está en uso");
        usernameElem.focus();
        return;
    }

    const nuevo_id = obtenerSiguienteId();
    const passwordHash = await hashPassword(password);

    guardarUsuario({
        id: nuevo_id,
        username: username.toLowerCase(),
        password_hash: passwordHash,
        name: nombre.toUpperCase(),
        email: correo.toLowerCase(),
        rol_id: rol_id,
        active: true,
        created_at: new Date(),
        updated_at: null
    });

    this.reset();
    cargarTablaUsuarios();
    modalNUsuario.hide();
    alertify.success("Usuario creado exitosamente");
}

function modalEditarUsuario(e) {
    if (e.target.closest('.btn-editar')) {
        const id = parseInt(e.target.closest('.btn-editar').dataset.id);
        const usuario = cargarUsuario(id);
        if (!usuario) return;

        document.getElementById('edit_id').value = usuario.id;
        document.getElementById('edit_password_hash').value = usuario.password_hash;
        document.getElementById('edit_username').value = usuario.username;
        document.getElementById('edit_password').value = ""; // Dejar en blanco para no cambiar
        document.getElementById('edit_nombre').value = usuario.name;
        document.getElementById('edit_correo').value = usuario.email;
        document.getElementById('edit_rol_id').value = usuario.rol_id;
        document.getElementById('edit_activo').checked = usuario.active;
        document.getElementById('edit_creacion').value = usuario.created_at;

        modalEUsuario.show();
    }
}

async function guardarUsuarioEditado(e) {
    e.preventDefault();
    const idElem = document.getElementById("edit_id");
    let id = Number.parseInt(idElem.value.trim());
    const usernameElem = document.getElementById("edit_username");
    let username = usernameElem.value.trim();
    const passwordElem = document.getElementById("edit_password");
    let password = passwordElem.value;
    const currentHashElem = document.getElementById("edit_password_hash");
    let currentHash = currentHashElem.value;
    const nombreElem = document.getElementById("edit_nombre");
    let nombre = nombreElem.value.trim();
    const correoElem = document.getElementById("edit_correo");
    let correo = correoElem.value.trim();
    const rolElem = document.getElementById("edit_rol_id");
    let rol_id = Number.parseInt(rolElem.value);
    const activoElem = document.getElementById("edit_activo");
    let activo = activoElem.checked;
    const creacionElem = document.getElementById("edit_creacion");
    let creacion = creacionElem.value;

    if (!nombre || !correo || isNaN(rol_id)) {
        alertify.error("Los campos principales son obligatorios");
        return;
    }

    let passwordHash = currentHash;
    if (password.length > 0) {
        if (password.length < 6) {
            alertify.error("La nueva contraseña debe tener al menos 6 caracteres");
            passwordElem.focus();
            return;
        }
        passwordHash = await hashPassword(password);
    }

    guardarUsuario({
        id: id,
        username: username,
        password_hash: passwordHash,
        name: nombre.toUpperCase(),
        email: correo.toLowerCase(),
        rol_id: rol_id,
        active: activo,
        created_at: new Date(creacion),
        updated_at: new Date()
    });

    cargarTablaUsuarios();
    modalEUsuario.hide();
    alertify.success("Usuario actualizado exitosamente");
}

function desactivarUsuario(e) {
    if (e.target.closest('.btn-eliminar')) {
        const id = parseInt(e.target.closest('.btn-eliminar').dataset.id);
        const usuario = cargarUsuario(id);
        if (!usuario) return;

        alertify.confirm("Desactivar/Activar Usuario", `¿Deseas cambiar el estado del usuario <strong>${usuario.username}</strong>?`,
            function () {
                usuario.active = !usuario.active;
                usuario.updated_at = new Date();
                guardarUsuario(usuario);
                cargarTablaUsuarios();
                alertify.success(`Usuario ${usuario.active ? 'activado' : 'desactivado'}`);
            },
            function () {
                // Cancel
            }
        ).set("labels", { ok: "Sí, cambiar estado", cancel: "Cancelar" });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    cargarOpcionesRoles();
    cargarTablaUsuarios();

    document.getElementById("formNuevoUsuario").addEventListener("submit", guardarNuevoUsuario);
    document.addEventListener("click", modalEditarUsuario);
    document.getElementById("formEditarUsuario").addEventListener("submit", guardarUsuarioEditado);
    document.addEventListener('click', desactivarUsuario);
});

function cargarTablaUsuarios() {
    const roles = cargarRoles();
    const getRolName = (id) => {
        const r = roles.find(r => r.id === id);
        return r ? r.name : "Desconocido";
    };

    const usuarios = cargarUsuarios().map(u => {
        return {
            ...u,
            rol_name: getRolName(u.rol_id),
            estado: u.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'
        };
    });

    if (tabla) {
        tabla.clear().rows.add(usuarios).draw();
        return;
    }

    tabla = new DataTable("#tabla_usuarios", {
        data: usuarios,
        columns: [
            { data: 'id' },
            { data: 'username' },
            { data: 'name' },
            { data: 'email' },
            { data: 'rol_name' },
            { data: 'estado' },
            {
                data: null,
                render: function (data, type, row) {
                    const iconToggle = row.active ? 'bi-person-dash' : 'bi-person-check';
                    const btnClass = row.active ? 'btn-danger' : 'btn-success';
                    return `
                        <button class="btn btn-sm btn-warning me-1 btn-editar" data-id="${row.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm ${btnClass} btn-eliminar" data-id="${row.id}" title="Cambiar Estado"><i class="bi ${iconToggle}"></i></button>
                    `;
                }
            }
        ],
        dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rtip',
        buttons: [
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5] },
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5] },
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5] },
            }
        ],
        language: {
            url: "dt/es-ES.json" // Note: The existing files use script dt/es-ES.js directly instead, but passing the config works or we can omit it if global config exists. I'll omit it to be safe and let DataTables use its defaults if es-ES is loaded globally.
        }
    });
}
