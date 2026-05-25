// =============================================
//  MÓDULO DE ROLES - roles.js
// =============================================

// Verificar sesión activa al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    if (!validarPermiso(PERMISOS.ROLES_VER)) return;
    cargarDatos();
});

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

const tablaRoles = crearDataTable("tabla_roles", [
    { data: "id",          title: "ID",                    render: renderRaw  },
    { data: "name",        title: "Nombre",                render: renderString },
    { data: "description", title: "Descripción",           render: renderString },
    { data: "created_at",  title: "Fecha de Creación",     render: renderFecha },
    { data: "updated_at",  title: "Fecha de Modificación", render: renderFecha },
], {
    buttons: true,
    searching: true,
    pageLength: 10,
    exportTitle: "LISTADO DE ROLES",
    actions: rol => ({
        edit:   `abrirModalEditar(${rol.id})`,
        delete: `abrirModalEliminar(${rol.id})`,
    })
});

/**
 * Carga (o recarga) los datos en el DataTable
 */
function cargarDatos() {
    cargarDataTable(tablaRoles, cargarRoles());
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
    generarCheckboxesPermisos(0n);
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
    generarCheckboxesPermisos(rol.flags || 0n);
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

    // Calcular flags (BigInt)
    let nuevosFlags = 0n;
    document.querySelectorAll(".chk-permiso").forEach(chk => {
        if (chk.checked) {
            nuevosFlags = nuevosFlags | BigInt(chk.value);
        }
    });

    if (esNuevo) {
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
    cargarDatos();
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
    cargarDatos();
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

function marcarInvalido(campoId, errorId, mensaje) {
    document.getElementById(campoId).classList.add("is-invalid");
    document.getElementById(errorId).textContent = mensaje;
}

function limpiarValidaciones() {
    ["rol_nombre", "rol_descripcion"].forEach(id => {
        document.getElementById(id).classList.remove("is-invalid");
    });
    ["error_nombre", "error_descripcion"].forEach(id => {
        document.getElementById(id).textContent = "";
    });
}

function limpiarFormulario() {
    document.getElementById("rol_id").value = "";
    document.getElementById("rol_nombre").value = "";
    document.getElementById("rol_descripcion").value = "";
    limpiarValidaciones();
}

// =============================================
//  PERMISOS (CHECKBOXES)
// =============================================

function generarCheckboxesPermisos(flagsActuales) {
    const contenedor = document.getElementById("contenedor_permisos");
    contenedor.innerHTML = "";

    // Agrupar permisos por módulo
    const modulos = {
        "Usuarios": ["ROLES_VER", "ROLES_CREAR", "ROLES_EDITAR", "USUARIOS_VER", "USUARIOS_CREAR", "USUARIOS_EDITAR"],
        "Inventario": ["CATEGORIAS_VER", "CATEGORIAS_CREAR", "CATEGORIAS_EDITAR", "MARCAS_VER", "MARCAS_CREAR", "MARCAS_EDITAR", "PRODUCTOS_VER", "PRODUCTOS_CREAR", "PRODUCTOS_EDITAR"],
        "Compras": ["PROVEEDORES_VER", "PROVEEDORES_CREAR", "PROVEEDORES_EDITAR", "COMPRAS_VER", "COMPRAS_CREAR", "COMPRAS_EDITAR"],
        "Ventas": ["CLIENTES_VER", "CLIENTES_CREAR", "CLIENTES_EDITAR", "VENTAS_VER", "VENTAS_CREAR", "VENTAS_EDITAR"],
        "Finanzas": ["CUENTAS_PAGAR_VER", "CUENTAS_PAGAR_CREAR", "CUENTAS_PAGAR_EDITAR", "PAGOS_VER", "PAGOS_CREAR", "PAGOS_EDITAR", "CUENTAS_COBRAR_VER", "CUENTAS_COBRAR_CREAR", "CUENTAS_COBRAR_EDITAR", "COBROS_VER", "COBROS_CREAR", "COBROS_EDITAR"]
    };

    Object.entries(modulos).forEach(([nombreModulo, claves]) => {
        const colModulo = document.createElement("div");
        colModulo.className = "col-md-4 mb-3";

        const card = document.createElement("div");
        card.className = "card h-100";

        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header bg-success text-white py-1 px-2 d-flex justify-content-between align-items-center";
        cardHeader.innerHTML = `
            <small class="fw-bold"><i class="bi bi-shield-check me-1"></i>${nombreModulo}</small>
            <div>
                <button type="button" class="btn btn-xs btn-light btn-sm py-0 px-1 me-1" style="font-size:0.7rem"
                    onclick="seleccionarModulo('${nombreModulo}', true)">Todo</button>
                <button type="button" class="btn btn-xs btn-outline-light btn-sm py-0 px-1" style="font-size:0.7rem"
                    onclick="seleccionarModulo('${nombreModulo}', false)">Ninguno</button>
            </div>
        `;

        const cardBody = document.createElement("div");
        cardBody.className = "card-body py-2 px-3";

        claves.forEach(key => {
            const valorPermiso = PERMISOS[key];
            if (!valorPermiso) return;
            const tienePermisoActualmente = tienePermiso(flagsActuales, valorPermiso);
            const nombreAmigable = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

            const formCheck = document.createElement("div");
            formCheck.className = "form-check form-switch mb-1";
            formCheck.dataset.modulo = nombreModulo;

            const input = document.createElement("input");
            input.className = "form-check-input chk-permiso";
            input.type = "checkbox";
            input.id = `chk-${key}`;
            input.value = valorPermiso.toString();
            input.checked = tienePermisoActualmente;

            const label = document.createElement("label");
            label.className = "form-check-label small";
            label.htmlFor = `chk-${key}`;
            label.textContent = nombreAmigable;

            formCheck.appendChild(input);
            formCheck.appendChild(label);
            cardBody.appendChild(formCheck);
        });

        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        colModulo.appendChild(card);
        contenedor.appendChild(colModulo);
    });
}

/**
 * Selecciona o deselecciona todos los permisos de un módulo
 * @param {string} modulo 
 * @param {boolean} valor 
 */
function seleccionarModulo(modulo, valor) {
    document.querySelectorAll(`.form-check[data-modulo="${modulo}"] .chk-permiso`).forEach(chk => {
        chk.checked = valor;
    });
}