/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevo = new bootstrap.Modal(document.getElementById("modalNuevoProveedor"));
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarProveedor"));
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminarProveedor"));

let _guardandoProveedor = false;
let _editandoProveedor = false;

const REGEX_RUC_PROVEEDOR = /^(\d+-\d|\d+)$/;
const REGEX_TEL_PROVEEDOR = /^\d{9,15}$/;

const tablaProveedores = crearDataTable("tabla_proveedores", TABLAS.PROVEEDOR, {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE PROVEEDORES",
    actions: tienePermisoSesion(PERMISOS.PROVEEDORES_EDITAR) ? (proveedor) => {
        const anulable = cargarCompras().some(c => c.provider_id === proveedor.id) || cargarCuentasPorPagar()
            .some(c => c.provider_id === proveedor.id);
        return {
            edit: `ventanaEditarProveedor(${proveedor.id})`,
            delete: anulable ? null : `ventanaEliminarProveedor(${proveedor.id})`,
            enable: anulable && !proveedor.active ? `ventanaHabilitarProveedor(${proveedor.id})` : null,
            disable: anulable && proveedor.active ? `ventanaAnularProveedor(${proveedor.id})` : null
        };
    } : null
});

function ventanaNuevoProveedor() {
    modalNuevo.show();
}

function btnNuevoProveedor() {
    if (_guardandoProveedor) return;
    _guardandoProveedor = true;
    try {
        if (!tienePermisoSesion(PERMISOS.PROVEEDORES_CREAR)) {
            mensajeError("No tienes permiso para crear proveedores");
            return;
        }
        const legalNameElem = document.getElementById("new_legal_name");
        const legalName = legalNameElem.value.trim();
        const rucElem = document.getElementById("new_ruc");
        const ruc = rucElem.value.trim();
        const telElem = document.getElementById("new_tel");
        const tel = telElem.value.trim();
        const emailElem = document.getElementById("new_email");
        const email = emailElem.value.trim().toLowerCase();
        const addressElem = document.getElementById("new_address");
        const address = addressElem.value.trim().toUpperCase();
        const cityElem = document.getElementById("new_city");
        const city = cityElem.value.trim().toUpperCase();

        if (!legalName) {
            mensajeError("La razón social es obligatoria");
            legalNameElem.focus();
            return;
        } else if (legalName.length < 5 || legalName.length > 30) {
            mensajeError("La razón social debe tener entre 5 y 30 caracteres");
            legalNameElem.focus();
            return;
        } else if (cargarProveedores().some(p => p.legal_name === legalName)) {
            mensajeError("Ya existe un proveedor con la misma razón social");
            legalNameElem.focus();
            return;
        } else if (!ruc) {
            mensajeError("El RUC o cédula es obligatorio");
            rucElem.focus();
            return;
        } else if (ruc.length < 6 || ruc.length > 15) {
            mensajeError("El RUC o cédula debe tener entre 6 y 15 caracteres");
            rucElem.focus();
            return;
        } else if (!ruc.match(REGEX_RUC_PROVEEDOR)) {
            mensajeError("El RUC o cédula debe contener solo números, o números con guión y dígito verificador (Ej: 1234567 o 80012345-1)");
            rucElem.focus();
            return;
        } else if (cargarProveedores().some(p => p.ruc === ruc)) {
            mensajeError("Ya existe un proveedor con el mismo RUC o cédula");
            rucElem.focus();
            return;
        } else if (!tel) {
            mensajeError("El teléfono es obligatorio");
            telElem.focus();
            return;
        } else if (!tel.match(REGEX_TEL_PROVEEDOR)) {
            mensajeError("El teléfono debe contener solo números, con mínimo 10 y máximo 15 dígitos");
            telElem.focus();
            return;
        } else if (!email) {
            mensajeError("El correo electrónico es obligatorio");
            emailElem.focus();
            return;
        } else if (!email.match(REGEX_CORREO)) {
            mensajeError("El correo electrónico es inválido");
            emailElem.focus();
            return;
        } else if (cargarProveedores().some(p => p.email === email)) {
            mensajeError("Ya existe un proveedor con el mismo correo");
            emailElem.focus();
            return;
        } else if (!address) {
            mensajeError("La dirección es obligatoria");
            addressElem.focus();
            return;
        } else if (address.length < 5 || address.length > 50) {
            mensajeError("La dirección debe tener entre 5 y 50 caracteres");
            addressElem.focus();
            return;
        } else if (!city) {
            mensajeError("La ciudad es obligatoria");
            cityElem.focus();
            return;
        } else if (city.length < 5 || city.length > 50) {
            mensajeError("La ciudad debe tener entre 5 y 50 caracteres");
            cityElem.focus();
            return;
        }

        guardarProveedor({
            id: obtenerSiguienteId(cargarProveedores()),
            legal_name: legalName,
            ruc: ruc,
            tel: tel,
            email: email,
            address: address,
            city: city,
            active: true,
            created_at: new Date(),
            updated_at: null
        });
        cargarDatos();
        modalNuevo.hide();
        mensajeSuccess("Proveedor creado exitosamente");
    } finally {
        _guardandoProveedor = false;
    }
}

function ventanaEditarProveedor(id) {
    const proveedor = cargarProveedor(id);
    if (!proveedor) {
        mensajeError(`El proveedor con ID ${id} no existe`);
        return;
    }
    document.getElementById("edit_id").value = proveedor.id;
    document.getElementById("edit_legal_name").value = proveedor.legal_name;
    document.getElementById("edit_ruc").value = proveedor.ruc || "";
    document.getElementById("edit_tel").value = proveedor.tel || "";
    document.getElementById("edit_email").value = proveedor.email || "";
    document.getElementById("edit_address").value = proveedor.address || "";
    document.getElementById("edit_city").value = proveedor.city || "";
    modalEditar.show();
}

function btnEditarProveedor() {
    if (_editandoProveedor) return;
    _editandoProveedor = true;
    try {
        const id = parseInt(document.getElementById("edit_id").value);
        const proveedor = cargarProveedor(id);
        if (!proveedor) return;

        const legalNameElem = document.getElementById("edit_legal_name");
        const legalName = legalNameElem.value.trim();
        const rucElem = document.getElementById("edit_ruc");
        const ruc = rucElem.value.trim();
        const telElem = document.getElementById("edit_tel");
        const tel = telElem.value.trim();
        const emailElem = document.getElementById("edit_email");
        const email = emailElem.value.trim().toLowerCase();
        const addressElem = document.getElementById("edit_address");
        const address = addressElem.value.trim().toUpperCase();
        const cityElem = document.getElementById("edit_city");
        const city = cityElem.value.trim().toUpperCase();

        if (!legalName) {
            mensajeError("La razón social es obligatoria");
            legalNameElem.focus();
            return;
        } else if (legalName.length < 5 || legalName.length > 30) {
            mensajeError("La razón social debe tener entre 5 y 30 caracteres");
            legalNameElem.focus();
            return;
        } else if (cargarProveedores().some(p => p.legal_name === legalName && p.id !== id)) {
            mensajeError("Ya existe un proveedor con la misma razón social");
            legalNameElem.focus();
            return;
        } else if (!ruc) {
            mensajeError("El RUC o cédula es obligatorio");
            rucElem.focus();
            return;
        } else if (ruc.length < 6 || ruc.length > 15) {
            mensajeError("El RUC o cédula debe tener entre 6 y 15 caracteres");
            rucElem.focus();
            return;
        } else if (!ruc.match(REGEX_RUC_PROVEEDOR)) {
            mensajeError("El RUC o cédula debe contener solo números, o números con guión y dígito verificador (Ej: 1234567 o 80012345-1)");
            rucElem.focus();
            return;
        } else if (cargarProveedores().some(p => p.ruc === ruc && p.id !== id)) {
            mensajeError("Ya existe un proveedor con el mismo RUC o cédula");
            rucElem.focus();
            return;
        } else if (!tel) {
            mensajeError("El teléfono es obligatorio");
            telElem.focus();
            return;
        } else if (!tel.match(REGEX_TEL_PROVEEDOR)) {
            mensajeError("El teléfono debe contener solo números, con mínimo 5 y máximo 15 dígitos");
            telElem.focus();
            return;
        } else if (!email) {
            mensajeError("El correo electrónico es obligatorio");
            emailElem.focus();
            return;
        } else if (!email.match(REGEX_CORREO)) {
            mensajeError("El correo electrónico es inválido");
            emailElem.focus();
            return;
        } else if (cargarProveedores().some(p => p.email === email && p.id !== id)) {
            mensajeError("Ya existe un proveedor con el mismo correo");
            emailElem.focus();
            return;
        } else if (!address) {
            mensajeError("La dirección es obligatoria");
            addressElem.focus();
            return;
        } else if (address.length < 5 || address.length > 50) {
            mensajeError("La dirección debe tener entre 5 y 50 caracteres");
            addressElem.focus();
            return;
        } else if (!city) {
            mensajeError("La ciudad es obligatoria");
            cityElem.focus();
            return;
        } else if (city.length < 5 || city.length > 50) {
            mensajeError("La ciudad debe tener entre 5 y 50 caracteres");
            cityElem.focus();
            return;
        }

        const sinCambios =
            proveedor.legal_name === legalName &&
            proveedor.ruc === ruc &&
            proveedor.tel === tel &&
            proveedor.email === email &&
            proveedor.address === address &&
            proveedor.city === city;

        if (sinCambios) {
            mensajeInfo("No se ha modificado nada");
            return;
        }

        proveedor.legal_name = legalName;
        proveedor.ruc = ruc;
        proveedor.tel = tel;
        proveedor.email = email;
        proveedor.address = address;
        proveedor.city = city;
        proveedor.updated_at = new Date();
        guardarProveedor(proveedor);
        cargarDatos();
        modalEditar.hide();
        mensajeSuccess("Proveedor actualizado exitosamente");
    } finally {
        _editandoProveedor = false;
    }
}

function ventanaEliminarProveedor(id) {
    const proveedor = cargarProveedor(id);
    if (!proveedor) {
        mensajeError(`El proveedor con ID ${id} no existe`);
        return;
    }
    document.getElementById("del_id").value = proveedor.id;
    document.getElementById("del_legal_name").textContent = proveedor.legal_name;
    document.getElementById("del_ruc").textContent = proveedor.ruc || "-";
    document.getElementById("del_tel").textContent = proveedor.tel || "-";
    document.getElementById("del_email").textContent = proveedor.email || "-";
    document.getElementById("del_address").textContent = proveedor.address || "-";
    document.getElementById("del_city").textContent = proveedor.city || "-";
    modalEliminar.show();
}

function btnEliminarProveedor() {
    const id = parseInt(document.getElementById("del_id").value);
    const proveedor = cargarProveedor(id);
    if (!proveedor) return;
    confirmar(
        "Eliminar Proveedor",
        "¿Realmente deseas eliminar de forma permanente este proveedor?",
        () => {
            modalEliminar.hide();
            if (cargarCompras().some(c => c.provider_id === id)) {
                mensajeError("No se puede eliminar el proveedor porque está asociado a una o más compras");
                return;
            }
            eliminarProveedor(id);
            cargarDatos();
            mensajeSuccess("Proveedor eliminado correctamente");
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


/**
 * @param {number} id 
 */
function ventanaHabilitarProveedor(id) {
    confirmar(
        "Habilitar Proveedor",
        "¿Deseas proceder con la habilitación?",
        () => {
            const proveedor = cargarProveedor(id);
            proveedor.active = true;
            proveedor.updated_at = new Date();
            guardarProveedor(proveedor);
            cargarDatos();
            mensajeSuccess("Proveedor habilitado correctamente");
        },
        () => mensajeError("Habilitación cancelada")
    );
}

/**
 * @param {number} id 
 */
function ventanaAnularProveedor(id) {
    confirmar(
        "Anular Proveedor",
        "¿Deseas proceder con la anulación?",
        () => {
            if (cargarCuentasPorPagar().some(c => c.provider_id === id && c.status !== ESTADO_PAGADA)) {
                mensajeError("No se puede anular al proveedor porque se tiene cuentas por pagar pendientes.");
                return;
            }
            const proveedor = cargarProveedor(id);
            proveedor.active = false;
            proveedor.updated_at = new Date();
            guardarProveedor(proveedor);
            cargarDatos();
            mensajeSuccess("Proveedor anulado correctamente");
        },
        () => mensajeError("Anulación cancelada")
    );
}

function cargarDatos() {
    const estadoElem = document.getElementById('filtro_estado_proveedor');
    const estado = estadoElem.value;
    const ciudadElem = document.getElementById('filtro_ciudad_proveedor');
    const ciudad = ciudadElem.value;
    const provedores = cargarProveedores();
    // Cargar Filtro de ciudades
    const ciudades = [...new Set(provedores.map(p => p.city).filter(Boolean))].sort();
    ciudadElem.innerHTML = '<option value="">Todas</option>'
        + ciudades.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
    if (ciudades.includes(ciudad)) ciudadElem.value = ciudad;
    cargarDataTable(tablaProveedores, provedores.filter(p => {
        if (estado === 'ACTIVO' && !p.active) return false;
        if (estado === 'INACTIVO' &&  p.active) return false;
        if (ciudad && p.city !== ciudad) return false;
        return true;
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.PROVEEDORES_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PROVEEDORES_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
