// =============================================
//  MÓDULO DE ROLES - roles.js
// =============================================

// Verificar sesión activa al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    inicializarTabla();
    cargarTablaRoles();
});

/**
 * Redirige al login si no hay sesión activa o si expiró
 */
function verificarSesion() {
    const sesion = cargarSesion();
    if (!sesion) {
        window.location.href = "login.html";
        return;
    }
    const ahora = new Date();
    const expira = new Date(sesion.expire_at);
    if (ahora > expira) {
        eliminarSesion();
        window.location.href = "login.html";
    }
}

/**
 * Cierra la sesión y redirige al login
 */
function cerrarSesion() {
    eliminarSesion();
    window.location.href = "login.html";
}

// =============================================
//  DATATABLE
// =============================================

let dataTable = null;

/**
 * Inicializa el DataTable vacío
 */
function inicializarTabla() {
    dataTable = $("#tabla_roles").DataTable({
    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontraron resultados",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 a 0 de 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
        }
    },
        columns: [
            { data: "id",          title: "ID",                   width: "5%" },
            { data: "name",        title: "Nombre",               width: "15%" },
            { data: "description", title: "Descripción",          width: "35%" },
            { data: "created_at",  title: "Fecha de Creación",    width: "17%" },
            { data: "updated_at",  title: "Fecha de Modificación",width: "17%" },
            { data: "acciones",    title: "Acciones",             width: "11%", orderable: false }
        ],
        order: [[0, "asc"]],
        pageLength: 10
    });
}

/**
 * Carga (o recarga) los datos en el DataTable
 */
function cargarTablaRoles() {
    const roles = cargarRoles();
    const filas = roles.map(rol => ({
        id: rol.id,
        name: rol.name,
        description: rol.description || "—",
        created_at: formatearFecha(rol.created_at),
        updated_at: rol.updated_at ? formatearFecha(rol.updated_at) : "—",
        acciones: `
            <button class="btn btn-warning btn-sm me-1" title="Editar"
                    onclick="abrirModalEditar(${rol.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Eliminar"
                    onclick="abrirModalEliminar(${rol.id})">
                <i class="bi bi-trash"></i>
            </button>`
    }));

    dataTable.clear().rows.add(filas).draw();
}

// =============================================
//  MODAL NUEVO
// =============================================

/**
 * Abre el modal en modo "Nuevo"
 */
function abrirModalNuevo() {
    limpiarFormulario();
    document.getElementById("modalRolLabel").textContent = "Nuevo Rol";
    document.getElementById("rol_id").value = "";
    generarCheckboxesPermisos(0);
    const modal = new bootstrap.Modal(document.getElementById("modalRol"));
    modal.show();
}

// =============================================
//  MODAL EDITAR
// =============================================

/**
 * Abre el modal en modo "Editar" con los datos del rol
 * @param {number} id
 */
function abrirModalEditar(id) {
    const rol = cargarRol(id);
    if (!rol) {
        alertify.error("No se encontró el rol.");
        return;
    }
    limpiarFormulario();
    document.getElementById("modalRolLabel").textContent = "Editar Rol";
    document.getElementById("rol_id").value = rol.id;
    document.getElementById("rol_nombre").value = rol.name;
    document.getElementById("rol_descripcion").value = rol.description || "";
    generarCheckboxesPermisos(rol.flags || 0);
    const modal = new bootstrap.Modal(document.getElementById("modalRol"));
    modal.show();
}

// =============================================
//  GUARDAR (NUEVO O EDITAR)
// =============================================

/**
 * Valida y guarda el rol desde el formulario del modal
 */
function guardarRolForm() {
    if (!validarFormulario()) return;

    const idRaw = document.getElementById("rol_id").value;
    const nombre = document.getElementById("rol_nombre").value.trim().toUpperCase();
    const descripcion = document.getElementById("rol_descripcion").value.trim();
    const esNuevo = idRaw === "";

    // Verificar nombre duplicado
    const roles = cargarRoles();
    const duplicado = roles.find(r =>
        r.name.toUpperCase() === nombre && r.id !== parseInt(idRaw)
    );
    if (duplicado) {
        marcarInvalido("rol_nombre", "error_nombre", "Ya existe un rol con ese nombre.");
        return;
    }

    // Calcular flags
    let nuevosFlags = 0;
    const checkboxes = document.querySelectorAll(".chk-permiso");
    checkboxes.forEach(chk => {
        if (chk.checked) {
            nuevosFlags = agregarPermiso(nuevosFlags, parseInt(chk.value));
        }
    });

    if (esNuevo) {
        // Generar nuevo ID autoincremental
        const maxId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) : 0;
        guardarRol({
            id: maxId + 1,
            name: nombre,
            description: descripcion,
            flags: nuevosFlags,
            created_at: new Date(),
            updated_at: null
        });
        alertify.success("Rol creado correctamente.");
    } else {
        const rolExistente = cargarRol(parseInt(idRaw));
        guardarRol({
            id: parseInt(idRaw),
            name: nombre,
            description: descripcion,
            flags: nuevosFlags,
            created_at: rolExistente.created_at,
            updated_at: new Date()
        });
        alertify.success("Rol actualizado correctamente.");
    }

    bootstrap.Modal.getInstance(document.getElementById("modalRol")).hide();
    cargarTablaRoles();
}

// =============================================
//  MODAL ELIMINAR
// =============================================

/**
 * Abre el modal de confirmación de eliminación
 * @param {number} id
 */
function abrirModalEliminar(id) {
    const rol = cargarRol(id);
    if (!rol) {
        alertify.error("No se encontró el rol.");
        return;
    }
    document.getElementById("id_a_eliminar").value = id;
    document.getElementById("nombre_a_eliminar").textContent = rol.name;
    const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
    modal.show();
}

/**
 * Ejecuta la eliminación del rol tras confirmación
 */
function confirmarEliminar() {
    const id = parseInt(document.getElementById("id_a_eliminar").value);

    // Verificar que no haya usuarios con este rol
    const usuarios = cargarUsuarios();
    const tieneUsuarios = usuarios.some(u => u.rol_id === id);
    if (tieneUsuarios) {
        bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
        alertify.error("No se puede eliminar: hay usuarios asignados a este rol.");
        return;
    }

    eliminarRol(id);
    bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
    alertify.success("Rol eliminado correctamente.");
    cargarTablaRoles();
}

// =============================================
//  VALIDACIONES
// =============================================

/**
 * Valida los campos del formulario
 * @returns {boolean}
 */
function validarFormulario() {
    let valido = true;
    limpiarValidaciones();

    const nombre = document.getElementById("rol_nombre").value.trim();
    if (nombre.length < 3) {
        marcarInvalido("rol_nombre", "error_nombre", "El nombre debe tener al menos 3 caracteres.");
        valido = false;
    } else if (nombre.length > 30) {
        marcarInvalido("rol_nombre", "error_nombre", "El nombre no puede superar 30 caracteres.");
        valido = false;
    }

    const descripcion = document.getElementById("rol_descripcion").value.trim();
    if (descripcion.length > 100) {
        marcarInvalido("rol_descripcion", "error_descripcion", "La descripción no puede superar 100 caracteres.");
        valido = false;
    }

    return valido;
}

/**
 * Marca un campo como inválido y muestra el mensaje de error
 * @param {string} campoId 
 * @param {string} errorId 
 * @param {string} mensaje 
 */
function marcarInvalido(campoId, errorId, mensaje) {
    const campo = document.getElementById(campoId);
    const error = document.getElementById(errorId);
    campo.classList.add("is-invalid");
    error.textContent = mensaje;
}

/**
 * Limpia todas las validaciones del formulario
 */
function limpiarValidaciones() {
    ["rol_nombre", "rol_descripcion"].forEach(id => {
        document.getElementById(id).classList.remove("is-invalid");
    });
    ["error_nombre", "error_descripcion"].forEach(id => {
        document.getElementById(id).textContent = "";
    });
}

/**
 * Limpia el formulario completo
 */
function limpiarFormulario() {
    document.getElementById("rol_id").value = "";
    document.getElementById("rol_nombre").value = "";
    document.getElementById("rol_descripcion").value = "";
    limpiarValidaciones();
}

// =============================================
//  UTILIDADES
// =============================================

/**
 * Formatea una fecha para mostrar en la tabla
 * @param {Date|string} fecha 
 * @returns {string}
 */
function formatearFecha(fecha) {
    if (!fecha) return "—";
    const d = new Date(fecha);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("es-PY", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function generarCheckboxesPermisos(flagsActuales) {
    const contenedor = document.getElementById("contenedor_permisos");
    contenedor.innerHTML = "";

    Object.keys(PERMISOS).forEach(key => {
        const valorPermiso = PERMISOS[key];
        const tienePermisoActualmente = tienePermiso(flagsActuales, valorPermiso);
        
        // Formatear nombre para mostrarlo amigable
        const nombreAmigable = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        const col = document.createElement("div");
        col.className = "col-md-6 mb-2";

        const formCheck = document.createElement("div");
        formCheck.className = "form-check form-switch";

        const input = document.createElement("input");
        input.className = "form-check-input chk-permiso";
        input.type = "checkbox";
        input.id = `chk-${key}`;
        input.value = valorPermiso;
        input.checked = tienePermisoActualmente;

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.htmlFor = `chk-${key}`;
        label.textContent = nombreAmigable;

        formCheck.appendChild(input);
        formCheck.appendChild(label);
        col.appendChild(formCheck);
        contenedor.appendChild(col);
    });
}
