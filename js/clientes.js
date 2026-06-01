/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevo = new bootstrap.Modal(document.getElementById('modalNuevoCliente'));
const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarCliente'));
const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminarCliente'));

const tablaClientes = crearDataTable("tabla_clientes", [
    { data: 'id', title: 'Id Cliente' },
    { data: 'legal_name', title: 'Razón Social', render: renderString },
    { data: 'ruc', title: 'RUC', render: renderString },
    { data: 'tel', title: 'Teléfono', render: renderString },
    { data: 'email', title: 'Correo', render: renderString },
    { data: 'address', title: 'Dirección', render: renderString },
    { data: 'active', title: 'Activo', render: renderBoolean },
    { data: 'created_at', title: 'Fecha de creación', render: renderFecha },
    { data: 'updated_at', title: 'Fecha de modificación', render: renderFecha },
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE CLIENTES",
    actions: tienePermisoSesion(PERMISOS.CLIENTES_EDITAR) ? (cliente) => {
        const anulable = cargarVentas().some(v => v.client_id === cliente.id);
        return {
            edit: `ventanaEditarCliente(${cliente.id})`,
            delete: anulable ? null : `ventanaEliminarCliente(${cliente.id})`,
            enable: anulable && !cliente.active ? `ventanaHabilitarCliente(${cliente.id})` : null,
            disable: anulable && cliente.active ? `ventanaAnularCliente(${cliente.id})` : null
        };
    } : null
});

function ventanaNuevoCliente() {
    if (!tienePermisoSesion(PERMISOS.CLIENTES_CREAR)) {
        mensajeError("No tienes permiso para crear clientes");
        return;
    }
    modalNuevo.show();
}

/**
 * Guardar Nuevo Cliente
 * @param {SubmitEvent} e 
 */
function btnNuevoCliente() {
    const razonElem = document.getElementById("razonsocial");
    const razonsocial = razonElem.value.trim().toUpperCase();
    const rucElem = document.getElementById("ruc");
    const ruc = rucElem.value.trim().toUpperCase();
    const telElem = document.getElementById("telefono");
    const tel = telElem.value.trim();
    const correoElem = document.getElementById("correo");
    const correo = correoElem.value.trim().toLowerCase();
    const direccionElem = document.getElementById("direccion");
    const direccion = direccionElem.value.trim().toUpperCase();
    if (!razonsocial) {
        mensajeError("La razón social es obligatoria");
        razonElem.focus();
        return;
    } else if (!razonsocial.match(REGEX_RAZON_SOCIAL)) {
        mensajeError("La razón social es inválida");
        razonElem.focus();
        return;
    } else if (cargarClientes().some(c => c.legal_name === razonsocial)) {
        mensajeError("Ya existe un cliente con la misma razón social");
        razonElem.focus();
        return;
    } else if (!ruc) {
        mensajeError("El ruc o cédula es obligatorio");
        rucElem.focus();
        return;
    } else if (!ruc.match(REGEX_RUC)) {
        mensajeError("El formato del ruc es invalido");
        rucElem.focus();
        return;
    } else if (cargarClientes().some(c => c.ruc === ruc)) {
        mensajeError("Ya existe un cliente con el mismo RUC/Cédula");
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
    } else if (cargarClientes().some(c => c.tel === tel)) {
        mensajeError("Ya existe un cliente con el mismo teléfono");
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
    } else if (cargarClientes().some(c => c.email === correo)) {
        mensajeError("Ya existe un cliente con el mismo correo");
        correoElem.focus();
        return;
    } else if (!direccion) {
        mensajeError("La dirección es obligatoria");
        direccionElem.focus();
        return;
    } else if (!direccion.match(REGEX_DIRECCION)) {
        mensajeError("Dirección invalida");
        direccionElem.focus();
        return;
    } else if (cargarClientes().some(c => c.address === direccion)) {
        mensajeError("Ya existe un cliente con la misma dirección");
        direccionElem.focus();
        return;
    }
    guardarCliente({
        id: obtenerSiguienteId(cargarClientes()),
        legal_name: razonsocial,
        ruc: ruc,
        tel: tel,
        email: correo,
        address: direccion,
        active: true,
        created_at: new Date(),
        updated_at: null
    });
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Cliente guardado");
}

/**
 * Precargar los campos para editar
 * @param {number} id
 */
function ventanaEditarCliente(id) {
    const cliente = cargarCliente(id);
    if (!cliente) {
        mensajeError(`El cliente con ID ${id} no existe`);
        return;
    };
    document.getElementById('edit_id').value = cliente.id;
    document.getElementById('edit_razonsocial').value = cliente.legal_name;
    document.getElementById('edit_ruc').value = cliente.ruc || "";
    document.getElementById('edit_telefono').value = cliente.tel || "";
    document.getElementById('edit_correo').value = cliente.email || "";
    document.getElementById('edit_direccion').value = cliente.address || "";
    modalEditar.show();
}

/**
 * Guardar una edicion
 * @param {SubmitEvent} e 
 */
function btnEditarCliente() {
    const id = parseInt(document.getElementById("edit_id").value.trim());
    const cliente = cargarCliente(id);
    if (!cliente) return;
    const razonElem = document.getElementById("edit_razonsocial");
    const razonsocial = razonElem.value.trim().toUpperCase();
    const rucElem = document.getElementById("edit_ruc");
    const ruc = rucElem.value.trim().toUpperCase();
    const telElem = document.getElementById("edit_telefono");
    const tel = telElem.value.trim();
    const correoElem = document.getElementById("edit_correo");
    const correo = correoElem.value.trim().toLowerCase();
    const direccionElem = document.getElementById("edit_direccion");
    const direccion = direccionElem.value.trim().toUpperCase();
    if (!razonsocial) {
        mensajeError("La razón social es obligatoria");
        razonElem.focus();
        return;
    } else if (!razonsocial.match(REGEX_RAZON_SOCIAL)) {
        mensajeError("La razón social es inválida");
        razonElem.focus();
        return;
    } else if (cargarClientes().some(c => c.legal_name === razonsocial && c.id !== id)) {
        mensajeError("Ya existe un cliente con la misma razón social");
        razonElem.focus();
        return;
    } else if (!ruc) {
        mensajeError("El ruc o cédula es obligatorio");
        rucElem.focus();
        return;
    } else if (!ruc.match(REGEX_RUC)) {
        mensajeError("El formato del ruc es invalido");
        rucElem.focus();
        return;
    } else if (cargarClientes().some(c => c.ruc === ruc && c.id !== id)) {
        mensajeError("Ya existe un cliente con el mismo RUC/Cédula");
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
    } else if (cargarClientes().some(c => c.tel === tel && c.id !== id)) {
        mensajeError("Ya existe un cliente con el mismo teléfono");
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
    } else if (cargarClientes().some(c => c.email === correo && c.id !== id)) {
        mensajeError("Ya existe un cliente con el mismo correo");
        correoElem.focus();
        return;
    } else if (!direccion) {
        mensajeError("La dirección es obligatoria");
        direccionElem.focus();
        return;
    } else if (!direccion.match(REGEX_DIRECCION)) {
        mensajeError("Dirección invalida");
        direccionElem.focus();
        return;
    } else if (cargarClientes().some(c => c.address === direccion && c.id !== id)) {
        mensajeError("Ya existe un cliente con la misma dirección");
        direccionElem.focus();
        return;
    }
    cliente.legal_name = razonsocial;
    cliente.ruc = ruc;
    cliente.tel = tel;
    cliente.email = correo;
    cliente.address = direccion;
    cliente.updated_at = new Date();
    guardarCliente(cliente);
    cargarDatos();
    modalEditar.hide();
    mensajeSuccess("Cliente actualizado");
}

/**
 * Precargar datos para eliminar cliente
 * @param {number} id 
 */
function ventanaEliminarCliente(id) {
    const cliente = cargarCliente(id);
    if (!cliente) {
        mensajeError(`El cliente con ID ${id} no existe`);
        return;
    };
    document.getElementById('del_id').value = cliente.id;
    document.getElementById('del_razonsocial').textContent = renderString(cliente.legal_name);
    document.getElementById('del_ruc').textContent = renderString(cliente.ruc);
    document.getElementById('del_direccion').textContent = renderString(cliente.address);
    document.getElementById('del_telefono').textContent = renderString(cliente.tel);
    modalEliminar.show();
}

function btnEliminarCliente() {
    const id = parseInt(document.getElementById('del_id').value);
    const cliente = cargarCliente(id);
    if (!cliente) return;
    confirmar(
        "Eliminar cliente",
        "¿Realmente deseas eliminar de forma permanente a este cliente?",
        () => {
            modalEliminar.hide();
            if (cargarVentas().some(v => v.client_id === id) || cargarCuentasPorCobrar().some(c => c.client_id === id)) {
                mensajeError("No se puede eliminar el cliente porque está asociada a uno o más registros.");
                return;
            }
            eliminarCliente(id);
            cargarDatos();
            mensajeSuccess("Cliente eliminado");
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
 * 
 * @param {number} id 
 */
function ventanaHabilitarCliente(id) {
    confirmar(
        "Habilitar Cliente",
        "¿Deseas proceder con la habilitación?",
        () => {
            const cliente = cargarCliente(id);
            cliente.active = true;
            cliente.updated_at = new Date();
            guardarCliente(cliente);
            cargarDatos();
            mensajeSuccess("Cliente habilitado correctamente");
        },
        () => mensajeError("Habilitación cancelada")
    );
}

/**
 * 
 * @param {number} id 
 */
function ventanaAnularCliente(id) {
    confirmar(
        "Anular Cliente",
        "¿Deseas proceder con la anulación?",
        () => {
            if (cargarCuentasPorCobrar().some(c => c.client_id === id && c.status !== ESTADO_COBRADA)) {
                mensajeError("No se puede anular el cliente porque tiene cuentas por cobrar pendientes.");
                return;
            }
            const cliente = cargarCliente(id);
            cliente.active = false;
            cliente.updated_at = new Date();
            guardarCliente(cliente);
            cargarDatos();
            mensajeSuccess("Cliente anulado correctamente");
        },
        () => mensajeError("Anulación cancelada")
    );
}

function cargarDatos() {
    cargarDataTable(tablaClientes, cargarClientes());
}

document.addEventListener('DOMContentLoaded', function () {
    if (!validarPermiso(PERMISOS.CLIENTES_VER)) return;
    if (!tienePermisoSesion(PERMISOS.CLIENTES_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});

