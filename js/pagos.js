/* global bootstrap */
/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevoPago = new bootstrap.Modal(document.getElementById('modalNuevoPago'));

const tablaPagos = crearDataTable("tabla_pagos", [
    { data: "id", title: "Id Pago", render: renderRaw },
    {
        data: "account_payable_id", title: "Cuenta por Pagar", render: data => {
            const cuenta = cargarCuentaPorPagar(data);
            return `
        ${data} - ${renderMoneda(cuenta.amount_total)} - ${cargarProveedor(cuenta.provider_id).legal_name}
        `
        }
    },
    { data: "amount", title: "Cantidad Pagada", render: renderMoneda },
    {
        data: "payment_method", title: "Método de pago", render: (data, type, row) => {
            return row.bank ? `${renderString(data)} (${renderString(row.bank)})` : renderString(data);
        }
    },
    { data: "obs", title: "Nro. Referencia / Comprobante / Observaciones", render: renderString },
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
    const metodoElem = document.getElementById("metodo");
    const divBanco = document.getElementById("div_banco");
    const bancoElem = document.getElementById("banco");
    const obsElem = document.getElementById("obs");

    saldoElem.value = "";
    montoElem.value = "";
    metodoElem.value = "";
    divBanco.classList.add("d-none");
    bancoElem.value = "";
    bancoElem.required = false;
    obsElem.value = "";
    obsElem.placeholder = "";

    modalNuevoPago.show();
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

function onchangeMetodoPago() {
    const metodo = document.getElementById("metodo").value;
    const obsElem = document.getElementById("obs");
    const divBanco = document.getElementById("div_banco");
    const bancoElem = document.getElementById("banco");

    if (metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) {
        divBanco.classList.remove("d-none");
        bancoElem.required = true;
    } else {
        divBanco.classList.add("d-none");
        bancoElem.value = "";
        bancoElem.required = false;
    }
    if (metodo === METODO_TARJETA_CREDITO || metodo === METODO_TARJETA_CREDITO) {
        obsElem.placeholder = "EJ: ÚLTIMOS 4 DÍGITOS + NRO DE AUTORIZACIÓN";
    } else if (metodo === METODO_TRANSFERENCIA) {
        obsElem.placeholder = "EJ: NRO DE TRANSACCIÓN";
    } else if (metodo === METODO_CHEQUE) {
        obsElem.placeholder = "EJ: NRO DE CHEQUE";
    // } else if (metodo === CONDICION_CREDITO) {
    //     obsElem.placeholder = "EJ: NRO DE CUENTA CORRIENTE O CONVENIO";
    } else if (metodo === METODO_EFECTIVO) {
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
    const bancoElem = document.getElementById("banco");
    const banco = bancoElem.value.trim().toUpperCase();
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
    } else if (!metodo || !METODOS.includes(metodo)) {
        mensajeError("Debe ingresar un método de pago para poder realizar el pago");
        metodoElem.focus();
        return;
    } else if ((metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) && !banco) {
        mensajeError("Debe seleccionar un banco para poder realizar el pago");
        bancoElem.focus();
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
        obs: (metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) && banco
            ? "Banco: " + banco + (obs ? " | " + obs : "")
            : obs,
        created_at: new Date()
    });
    guardarCuentaPorPagar(cuenta);
    cargarDatos();
    modalNuevoPago.hide();
    mensajeSuccess("Pago registrado exitosamente");
}

function aplicarFiltros() {
    cargarDatos();
}

function limpiarFiltros() {
    document.getElementById('filtro_metodo').value = '';
    document.getElementById('filtro_fecha_desde').value = '';
    document.getElementById('filtro_fecha_hasta').value = '';
    cargarDatos();
}

function obtenerPagosFiltrados() {
    const metodo = document.getElementById('filtro_metodo').value;
    const fechaDesde = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta = document.getElementById('filtro_fecha_hasta').value;

    return cargarPagos().filter(p => {
        // Filtro metodo de pago
        if (metodo && p.payment_method !== metodo) return false;

        // Filtro rango de fechas (created_at)
        const createdAt = new Date(p.created_at);
        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            desde.setHours(0, 0, 0, 0);
            if (createdAt < desde) return false;
        }
        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            if (createdAt > hasta) return false;
        }

        return true;
    });
}

function cargarDatos() {
    const pagosFiltrados = obtenerPagosFiltrados();
    cargarDataTable(tablaPagos, pagosFiltrados);

    // Sumatoria de pagos
    const sumatoria = pagosFiltrados.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById("suma_pagos").textContent = renderMoneda(sumatoria) + " Gs.";

    // Cargar Select
    const cuentaElem = document.getElementById("cuenta_id");
    cuentaElem.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>'
        + cargarCuentasPorPagar().filter(c => c.status !== ESTADO_PAGADA).map(c => `<option value="${c.id}">
            ID: ${c.id} - ${cargarProveedor(c.provider_id).legal_name} (Pendiente: ${renderMoneda(c.amount_due)})
        </option>`).join('');
    // Precargar desde url
    const cuenta_id = parseInt(new URLSearchParams(window.location.search).get('cuenta_id'));
    if (!cuenta_id) return;
    const cuenta = cargarCuentaPorPagar(cuenta_id);
    if (!cuenta) return;
    ventanaNuevoPago();
    window.history.replaceState({}, document.title, window.location.pathname);
    cuentaElem.value = cuenta_id;
    onchangeCuenta();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.PAGOS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
