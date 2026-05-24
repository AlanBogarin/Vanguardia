/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

/**
 * @typedef {Object} CuentaPorPagar
 * @property {number} id Identificador unico de la cuenta a pagar
 * @property {number} purchase_id Identificador de la compra
 * @property {number} provider_id Identificador del proveedor
 * @property {number} amount_total Cantidad total a pagar
 * @property {number} amount_paid Cantidad pagada
 * @property {number} amount_due Cantidad pendiente a pagar (amount_total - amount_paid)
 * @property {EstadoPago} status Estado de la cuenta
 * @property {Date} expire_at Fecha de vencimiento del pago
 * @property {Date} created_at Fecha de creacion de la compra
 * @property {Date?} updated_at Fecha de modificacion de la compra
 * 
 * @typedef {Object} Pago
 * @property {number} id Identificador unico del pago
 * @property {number} account_payable_id Identificador de la cuenta por pagar
 * @property {number} amount Cantidad pagada
 * @property {MetodoPago} payment_method Método de pago
 * @property {string} obs Observaciones del pago
 * @property {Date} created_at Fecha de creacion del pago
 */

const modalNuevo = new bootstrap.Modal(document.getElementById('modalNuevoPago'));

const tablaPagos = crearDataTable("tabla_pagos", [
    { data: "id", title: "Id Pago", render: renderRaw },
    { data: "account_payable_id", title: "Cuenta por Pagar", render: data => {
        const cuenta = cargarCuentaPorPagar(data);
        return `
        ${data} - ${renderMoneda(cuenta.amount_total)} - ${cargarProveedor(cuenta.provider_id).legal_name}
        `
    }},
    { data: "amount", title: "Cantidad Pagada", render: renderMoneda },
    { data: "payment_method", title: "Método de pago", render: renderString },
    { data: "obs", title: "Observaciones", render: renderString },
    { data: "created_at", title: "Fecha de creación", render: renderFecha }
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE PAGOS",
    actions: null
    // actions: tienePermisoSesion(PERMISOS.PAGOS_EDITAR) ? (pago) => ({
    //     edit: `ventanaEditarPago(${pago.id})`,
    //     delete: `ventanaEliminarPago(${pago.id})`,
    //     enable: null,
    //     disable: null
    // }) : null
});

function ventanaNuevoPago() {
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) {
        mensajeError("No tienes permiso para crear pagos");
        return;
    }
    const cuentaElem = document.getElementById("cuenta_id");
    const saldoElem = document.getElementById("saldo_pendiente");
    const montoElem = document.getElementById("monto");
    
    cuentaElem.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>'
        + cargarCuentasPorPagar().filter(c => c.status !== "PAGADA").map(c => `<option value="${c.id}">
            ID: ${c.id} - ${cargarProveedor(c.provider_id).legal_name} (Pendiente: ${renderMoneda(c.amount_due)})
        </option>`).join('');
    saldoElem.value = "";
    montoElem.value = "";
    modalNuevo.show();
}

function onchangeCuenta() {
    const cuenta_id = document.getElementById("cuenta_id").value;
    const saldoElem = document.getElementById("saldo_pendiente");
    const montoElem = document.getElementById("monto");
    saldoElem.value = montoElem.value = montoElem.max = "";
    if (!cuenta_id) return;
    const cuenta = cargarCuentaPorPagar(parseInt(cuenta_id));
    if (!cuenta) return;
    saldoElem.value = renderMoneda(cuenta.amount_due);
    montoElem.value = montoElem.max = cuenta.amount_due;
}

/**
 * @param {Event} e 
 */
function onchangeMetodoPago() {
    const metodo = document.getElementById("metodo").value;
    const obsElem = document.getElementById("obs");
    if (metodo === "TARJETA_CREDITO" || metodo === "TARJETA_DEBITO") {
        obsElem.placeholder = "EJ: ÚLTIMOS 4 DÍGITOS + NRO DE AUTORIZACIÓN";
    } else if (metodo === "TRANSFERENCIA") {
        obsElem.placeholder = "EJ: NRO DE TRANSACCIÓN / CÓDIGO DE BANCO";
    } else if (metodo === "CHEQUE") {
        obsElem.placeholder = "EJ: NRO DE CHEQUE / BANCO";
    } else if (metodo === "CREDITO") {
        obsElem.placeholder = "EJ: NRO DE CUENTA CORRIENTE O CONVENIO";
    } else if (metodo === "EFECTIVO") {
        obsElem.placeholder = "EJ: EFECTIVO EN CAJA / NRO RECIBO";
    } else {
        obsElem.placeholder = "";
    }
}

function btnGuardarPago() {
    const cuentaElem = document.getElementById("cuenta_id");
    const cuenta = cargarCuentaPorPagar(parseInt(cuentaElem.value.trim()));
    const montoElem = document.getElementById("monto");
    const monto = parseInt(montoElem.value.trim()) || 0;
    const metodoElem = document.getElementById("metodo");
    const metodo = metodoElem.value.trim().toUpperCase();
    const obsElem = document.getElementById("obs");
    const obs = obsElem.value.trim().toUpperCase();
    if (!cuenta) {
        mensajeError("Debe seleccionar una cuenta para poder realizar el pago");
        cuentaElem.focus();
        return;
    } else if (cuenta.status === ESTADO_PAGADA) {
        mensajeError("La cuenta ya ha sido pagada");
        cuentaElem.focus();
        return;
    } else if (!monto || monto <= 0) {
        mensajeError("Debe ingresar un monto para poder realizar el pago");
        montoElem.focus();
        return;
    } else if (monto > cuenta.amount_due) {
        mensajeError("El monto a pagar no puede ser mayor al saldo pendiente.");
        montoElem.focus();
        return;
    } else if (!metodo || !METODO_PAGO.includes(metodo)) {
        mensajeError("Debe ingresar un método de pago para poder realizar el pago");
        metodoElem.focus();
        return;
    } else if (!obs) {
        mensajeError("Debe ingresar una observación para poder realizar el pago");
        obsElem.focus();
        return;
    } else if (!obs.match(REGEX_TEXTO)) {
        mensajeError("La observación es inválida o no tiene entre 5 a 50 caracteres");
        obsElem.focus();
        return;
    }
    cuenta.amount_paid += monto;
    cuenta.amount_due = cuenta.amount_total - cuenta.amount_paid;
    cuenta.status = cuenta.amount_due ? ESTADO_PARCIAL : ESTADO_PAGADA;
    cuenta.updated_at = new Date();
    guardarPago({
        id: obtenerSiguienteId(cargarPagos()),
        account_payable_id: cuenta.id,
        amount: monto,
        payment_method: metodo,
        obs: obs,
        created_at: new Date(), 
    });
    guardarCuentaPorPagar(cuenta);
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Pago registrado exitosamente");
}

function cargarDatos() {
    cargarDataTable(tablaPagos, cargarPagos());
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.PAGOS_EDITAR)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
