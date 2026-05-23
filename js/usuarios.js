/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevo = new bootstrap.Modal(document.getElementById("modalNuevoUsuario"));
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarUsuario"));
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminarUsuario"));

const tablaUsuarios = crearDataTable("tabla_usuarios", [
    { data: "id", title: "Id Usuario", render: renderRaw },
    { data: "username", title: "Usuario", render: data => renderString(data).toLowerCase() },
    { data: "name", title: "Nombre Completo", render: renderString },
    { data: "ruc", title: "RUC/Cédula", render: renderString },
    { data: "tel", title: "Teléfono", render: renderString },
    { data: "email", title: "Correo", render: data => renderString(data).toLowerCase() },
    { data: "rol_id", title: "Rol", render: data => renderString(cargarRol(data).name) },
    { data: "active", title: "Activo", render: renderBoolean },
    { data: "created_at", title: "Fecha de creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de modificación", render: renderFecha }
], {
    buttons: true, 
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE USUARIOS",
    actions: tienePermisoSesion(PERMISOS.USUARIOS_EDITAR) ? (usuario) => {
        const anulable = cargarCompras().some(c => c.user_id === usuario.id) ||
            cargarVentas().some(v => v.user_id === usuario.id);
        return {
            edit: `ventanaEditarUsuario(${usuario.id})`,
            delete: anulable ? null : `ventanaEliminarUsuario(${usuario.id})`,
            enable: anulable && !usuario.active ? `ventanaHabilitarUsuario(${usuario.id})` : null,
            disable: anulable && usuario.active ? `ventanaAnularUsuario(${usuario.id})` : null
        };
    } : null
});

function ventanaNuevoUsuario() {
    modalNuevo.show();
}

async function btnNuevoUsuario() {
    if (!tienePermisoSesion(PERMISOS.USUARIOS_CREAR)) {
        mensajeError("No tienes permiso para crear usuarios");
        return;
    }
    const usernameElem = document.getElementById("new_username");
    const username = usernameElem.value.trim().toLowerCase();
    const contraElem = document.getElementById("new_password");
    const contra = contraElem.value.trim();
    const contra2Elem = document.getElementById("new_password_confirm");
    const contra2 = contra2Elem.value.trim();
    const nombreElem = document.getElementById("new_name");
    const nombre = nombreElem.value.trim().toUpperCase();
    const rucElem = document.getElementById("new_ruc");
    const ruc = rucElem.value.trim().toUpperCase();
    const telElem = document.getElementById("new_tel");
    const tel = telElem.value.trim();
    const correoElem = document.getElementById("new_email");
    const correo = correoElem.value.trim().toLowerCase();
    const direccionElem = document.getElementById("new_address");
    const direccion = direccionElem.value.trim().toUpperCase();
    const rolIdElem = document.getElementById("new_rol_id");
    const rolId = rolIdElem.value.trim();
    if (!username) {
        mensajeError("El usuario es obligatorio");
        usernameElem.focus();
        return;
    } else if (!username.match(REGEX_USUARIO)) {
        mensajeError("El usuario debe tener entre 5 a 20 dígitos con letras, números o ' _.-'");
        usernameElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.username === username)) {
        mensajeError("Ya existe otro usuario con el mismo usuario");
        usernameElem.focus();
        return;
    } else if (contra && !contra.match(REGEX_CONTRASENA)) {
        mensajeError("La nueva contraseña debe tener 8 caracteres con por lo menos una letra, un número y un carácter especial entre '$@$!%*?&._-'");
        contraElem.focus();
        return;
    // } else if (contra && cargarSesion().user_id === id) {
    //     mensajeError("Los administradores no pueden cambiar su contraseña");
    //     contra
    //     return;
    // }
    } else if (!nombre) {
        mensajeError("El nombre es obligatorio");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_NOMBRE)) {
        mensajeError("El usuario debe tener entre 5 a 50 caracteres");
        nombreElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.name === nombre)) {
        mensajeError("Ya existe otro usuario con el mismo nombre");
        nombreElem.focus();
        return;
    } else if (!ruc) {
        mensajeError("El ruc o cédula es obligatorio");
        rucElem.focus();
        return;
    } else if (!ruc.match(REGEX_RUC)) {
        mensajeError("El formato del ruc es invalido");
        rucElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.ruc === ruc)) {
        mensajeError("Ya existe un usuario con el mismo RUC/Cédula");
        rucElem.focus();
        return;
    } else if (!tel) {
        mensajeError("El teléfono es obligatorio");
        telElem.focus();
        return;
    } else if (!tel.match(REGEX_TELEFONO)) {
        mensajeError("El teléfono es invalido");
        telElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.tel === tel)) {
        mensajeError("Ya existe un usuario con el mismo teléfono");
        telElem.focus();
        return;
    } else if (!correo) {
        mensajeError("El correo es obligatorio");
        correoElem.focus();
        return;
    } else if (!correo.match(REGEX_CORREO)) {
        mensajeError("El correo es invalido");
        correoElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.email === correo)) {
        mensajeError("Ya existe otro usuario con el mismo correo");
        correoElem.focus();
        return;
    } else if (!direccion) {
        mensajeError("La dirección es obligatorio");
        direccionElem.focus();
        return;
    } else if (!direccion.match(REGEX_DIRECCION)) {
        mensajeError("La dirección es invalida");
        direccionElem.focus();
        return;
    } else if (!rolId) {
        mensajeError("El rol es obligatorio");
        rolIdElem.focus();
        return;
    } else if (!cargarRol(parseInt(rolId))) {
        mensajeError("El rol no existe");
        rolIdElem.focus();
        return;
    }
    guardarUsuario({
        id: obtenerSiguienteId(cargarUsuarios()),
        username: username,
        password_hash: await hashPassword(contra),
        name: nombre,
        ruc: ruc,
        tel: tel,
        email: correo,
        address: direccion,
        rol_id: parseInt(rolId),
        active: true,
        created_at: new Date(),
        updated_at: null
    });
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Usuario creado exitosamente");
}

function ventanaEditarUsuario(id) {
    const usuario = cargarUsuario(id);
    if (!usuario) {
        mensajeError(`El usuario con ID ${id} no existe`);
        return;
    }
    document.getElementById("edit_id").value = usuario.id;
    document.getElementById("edit_username").value = usuario.username;
    document.getElementById("edit_password").value = "";
    document.getElementById("edit_name").value = usuario.name;
    document.getElementById("edit_ruc").value = usuario.ruc;
    document.getElementById("edit_tel").value = usuario.tel;
    document.getElementById("edit_email").value = usuario.email;
    document.getElementById("edit_address").value = usuario.address;
    document.getElementById("edit_rol_id").value = usuario.rol_id;
    // document.getElementById("edit_active").value = usuario.active;
    modalEditar.show();
}

async function btnEditarUsuario() {
    const id = parseInt(document.getElementById("edit_id").value.trim());
    const usuario = cargarUsuario(id);
    if (!usuario) return;
    const usernameElem = document.getElementById("edit_username");
    const username = usernameElem.value.trim().toLowerCase();
    const contraElem = document.getElementById("edit_password");
    const contra = contraElem.value.trim();
    const nombreElem = document.getElementById("edit_name");
    const nombre = nombreElem.value.trim().toUpperCase();
    const rucElem = document.getElementById("edit_ruc");
    const ruc = rucElem.value.trim().toUpperCase();
    const telElem = document.getElementById("edit_tel");
    const tel = telElem.value.trim();
    const correoElem = document.getElementById("edit_email");
    const correo = correoElem.value.trim().toLowerCase();
    const direccionElem = document.getElementById("edit_address");
    const direccion = direccionElem.value.trim().toUpperCase();
    const rolIdElem = document.getElementById("edit_rol_id");
    const rolId = rolIdElem.value.trim();
    // const activoElem = document.getElementById("edit_active");
    // const activo = activoElem.checked;
    if (!username) {
        mensajeError("El usuario es obligatorio");
        usernameElem.focus();
        return;
    } else if (!username.match(REGEX_USUARIO)) {
        mensajeError("El usuario debe tener entre 5 a 20 dígitos con letras, números o ' _.-'");
        usernameElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.username === username) && u.id !== id) {
        mensajeError("Ya existe otro usuario con el mismo usuario");
        usernameElem.focus();
        return;
    } else if (contra && !contra.match(REGEX_CONTRASENA)) {
        mensajeError("La nueva contraseña debe tener 8 caracteres con por lo menos una letra, un número y un carácter especial entre '$@$!%*?&._-'");
        contraElem.focus();
        return;
    // } else if (contra && cargarSesion().user_id === id) {
    //     mensajeError("Los administradores no pueden cambiar su contraseña");
    //     contra
    //     return;
    // }
    } else if (!nombre) {
        mensajeError("El nombre es obligatorio");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_NOMBRE)) {
        mensajeError("El usuario debe tener entre 5 a 50 caracteres");
        nombreElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.name === nombre && u.id !== id)) {
        mensajeError("Ya existe otro usuario con el mismo nombre");
        nombreElem.focus();
        return;
    } else if (!ruc) {
        mensajeError("El ruc o cédula es obligatorio");
        rucElem.focus();
        return;
    } else if (!ruc.match(REGEX_RUC)) {
        mensajeError("El formato del ruc es invalido");
        rucElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.ruc === ruc && u.id !== id)) {
        mensajeError("Ya existe un usuario con el mismo RUC/Cédula");
        rucElem.focus();
        return;
    } else if (!tel) {
        mensajeError("El teléfono es obligatorio");
        telElem.focus();
        return;
    } else if (!tel.match(REGEX_TELEFONO)) {
        mensajeError("El teléfono es invalido");
        telElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.tel === tel && u.id !== id)) {
        mensajeError("Ya existe un usuario con el mismo teléfono");
        telElem.focus();
        return;
    
    } else if (!correo) {
        mensajeError("El correo es obligatorio");
        correoElem.focus();
        return;
    } else if (!correo.match(REGEX_CORREO)) {
        mensajeError("El correo es invalido");
        correoElem.focus();
        return;
    } else if (cargarUsuarios().some(u => u.email === correo && u.id !== id)) {
        mensajeError("Ya existe otro usuario con el mismo correo");
        correoElem.focus();
        return;
    } else if (!direccion) {
        mensajeError("La dirección es obligatorio");
        direccionElem.focus();
        return;
    } else if (!direccion.match(REGEX_DIRECCION)) {
        mensajeError("La dirección es invalida");
        direccionElem.focus();
        return;
    } else if (!rolId) {
        mensajeError("El rol es obligatorio");
        rolIdElem.focus();
        return;
    } else if (!cargarRol(parseInt(rolId))) {
        mensajeError("El rol no existe");
        rolIdElem.focus();
        return;
    }
    usuario.username = username;
    usuario.password_hash = await hashPassword(contra);
    usuario.name = nombre;
    usuario.ruc = ruc;
    usuario.tel = tel;
    usuario.email = correo;
    usuario.address = direccion;
    usuario.rol_id = parseInt(rolId);
    usuario.updated_at = new Date();
    guardarUsuario(usuario);
    cargarDatos();
    modalEditar.hide();
    mensajeSuccess("Usuario actualizado exitosamente");
}

function ventanaEliminarUsuario(id) {
    const usuario = cargarUsuario(id);
    if (!usuario) {
        mensajeError(`El usuario con ID ${id} no existe`);
        return;
    }
    document.getElementById("del_id").value = usuario.id;
    document.getElementById("del_username").textContent = usuario.username;
    document.getElementById("del_name").textContent = usuario.name;
    document.getElementById("del_email").textContent = usuario.email;
    document.getElementById("del_rol").textContent = cargarRol(usuario.rol_id).name;
    modalEliminar.show();
}

function btnEliminarUsuario() {
    const id = parseInt(document.getElementById("del_id").value);
    const usuario = cargarUsuario(id);
    if (!usuario) return;
    confirmar(
        "Eliminar Usuario",
        "¿Realmente deseas eliminar de forma permanente este usuario?",
        () => {
            modalEliminar.hide();
            if (id === cargarSesion().user_id) {
                mensajeError("No puedes eliminarte a ti mismo");
                return;
            }
            if (cargarCompras().some(c => c.user_id === id) || cargarVentas().some(c => c.user_id === id)) {
                mensajeError("No se puede eliminar el usuario porque está asociada a uno o más registros");
                return;
            }
            eliminarUsuario(id);
            cargarDatos();
            mensajeSuccess("Usuario eliminado correctamente");
        },
        () => {
            modalEliminar.hide();
            mensajeError("Eliminación cancelada");
        }
    ).set("labels", {
        ok: "Sí, eliminar",
        cancel: "No, mantener"
    });
}

function ventanaHabilitarUsuario(id) {
    const usuario = cargarUsuario(id);
    if (!usuario) {
        mensajeError(`El usuario con ID ${id} no existe`);
        return;
    }
    confirmar(
        "Habilitar Usuario",
        "¿Deseas proceder con la habilitación?",
        () => {
            usuario.active = true;
            usuario.updated_at = new Date();
            guardarUsuario(usuario);
            cargarDatos();
            mensajeSuccess("Usuario habilitado correctamente");
        },
        () => mensajeError("Habilitación cancelada")
    );
}

function ventanaAnularUsuario(id) {
    const usuario = cargarUsuario(id);
    if (!usuario) {
        mensajeError(`El usuario con ID ${id} no existe`);
        return;
    }
    confirmar(
        "Anular Usuario",
        "¿Deseas proceder con la anulación?",
        () => {
            const pagoPendiente = cargarCompras().filter(c => c.user_id === usuario.id)
                .some(c => cargarCuentaPorPagar(null, c.id).status !== "PAGADA");
            const cobroPendiente = cargarVentas().filter(c => c.user_id === usuario.id)
                .some(c => cargarCuentaPorCobrar(null, c.id).status !== "COBRADA");
            if (pagoPendiente || cobroPendiente) {
                mensajeError("No se puede anular el usuario porque tiene pagos o cobros pendientes");
                return;
            }
            usuario.active = false;
            usuario.updated_at = new Date();
            guardarUsuario(usuario);
            cargarDatos();
            mensajeSuccess("Usuario anulado correctamente");
        },
        () => mensajeError("Anulación cancelada")
    );
}

function cargarDatos() {
    cargarDataTable(tablaUsuarios, cargarUsuarios());
    const rolElem = document.getElementById("new_rol_id");
    const editRolElem = document.getElementById("edit_rol_id");
    const options = `<option value="">Seleccione Rol</option>` +
        cargarRoles().map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    rolElem.innerHTML = editRolElem.innerHTML = options;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.USUARIOS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.USUARIOS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
