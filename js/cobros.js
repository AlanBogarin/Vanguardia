/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevo = new bootstrap.Modal(document.getElementById('modalNuevoCobro'));

// Nro. Timbrado?
const tablaCobros = crearDataTable("tabla_cobros", [
    { data: "id", title: "Id Cobro", render: renderRaw },
    { data: "account_receivable_id", title: "Id Cuenta", render: renderRaw },
    { data: "sale_id", title: "Id Venta", render: renderRaw },
    { data: null, title: "Cliente", render: data => renderString(cargarCliente(
        (data.sale_id ? cargarVenta(data.sale_id) : cargarCuentaPorCobrar(data.account_receivable_id)).client_id
    ).legal_name) },
    { data: "amount", title: "Monto Cobrado", render: renderMoneda },
    { data: "payment_method", title: "Método de pago", render: renderString },
    { data: "invoice", title: "Nro. Factura / Comprobante", render: renderString },
    { data: "created_at", title: "Fecha de Cobro", render: renderFecha }
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE COBROS",
    actions: null
    // actions: tienePermisoSesion(PERMISOS.COBROS_EDITAR) ? (cobro) => ({
    //     edit: `ventanaEditarCobro(${cobro.id})`,
    //     delete: `ventanaEliminarCobro(${cobro.id})`,
    //     enable: null,
    //     disable: null
    // }) : null
});

function onchangeCuenta() {
    const select = document.getElementById("account_receivable_id");
    const option = select.options[select.selectedIndex];
    const saldoInput = document.getElementById("saldo_pendiente");
    const montoInput = document.getElementById("monto");
    
    if (option && option.value !== "") {
        const saldo = option.getAttribute("data-saldo");
        saldoInput.value = renderMoneda(saldo);
        montoInput.max = saldo;
        montoInput.value = saldo; // Sugerir el saldo completo
    } else {
        saldoInput.value = "";
        montoInput.max = "";
        montoInput.value = "";
    }
}

function btnGuardarCobro() {
    const cuentaIdElem = document.getElementById("account_receivable_id");
    const cuenta_id = parseInt(cuentaIdElem.value);
    const montoElem = document.getElementById("monto");
    const monto = parseFloat(montoElem.value);
    const metodoElem = document.getElementById("metodo");
    const metodo = metodoElem.value;
    const facturaElem = document.getElementById("factura");
    const factura = facturaElem.value.trim();
    if (!cuenta_id || isNaN(monto) || monto <= 0 || !metodo || !factura) {
        mensajeError("Complete los campos obligatorios correctamente.");
        return;
    }
    const cuenta = cargarCuentaPorCobrar(cuenta_id);
    if (!cuenta) {
        mensajeError("La cuenta seleccionada no existe.");
        return;
    }
    if (monto > cuenta.amount_due) {
        mensajeError("El monto a cobrar no puede ser mayor al saldo pendiente.");
        return;
    }
    // Guardar Cobro
    const nuevo_id = obtenerSiguienteId(cargarCobros());
    guardarCobro({
        id: nuevo_id,
        account_receivable_id: cuenta_id,
        sale_id: null,
        amount: monto,
        payment_method: metodo,
        invoice: factura,
        created_at: new Date()
    });

    // Actualizar Cuenta Por Cobrar
    cuenta.amount_paid += monto;
    cuenta.amount_due -= monto;
    if (cuenta.amount_due === 0) {
        cuenta.status = 'COBRADA';
    } else {
        cuenta.status = 'PARCIAL';
    }
    cuenta.updated_at = new Date();
    guardarCuentaPorCobrar(cuenta);

    document.getElementById("saldo_pendiente").value = "";
    
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Cobro registrado exitosamente");
}

function cargarDatos() {
    cargarDataTable(tablaCobros, cargarCobros());
    // Cargar select
    const cuentaElem = document.getElementById("account_receivable_id");
    cuentaElem.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>'
        + cargarCuentasPorCobrar().filter(c => c.status !== 'COBRADA').map(c => `
            <option value="${c.id}" data-saldo="${c.amount_due}">
                ID: ${c.id} - ${cargarCliente(c.client_id).legal_name} (Pendiente: ${renderMoneda(c.amount_due)})
            </option>`
    ).join("");
    // Precargar desde url
    const cuenta_id = parseInt(new URLSearchParams(window.location.search).get("cuenta_id"));
    if (!cuenta_id) return;
    const cuenta = cargarCuentaPorCobrar(cuenta_id);
    if (!cuenta) return;
    modalNuevo.show();
    window.history.replaceState({}, document.title, window.location.pathname);
    cuentaElem.value = cuenta_id;
    onchangeCuenta();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.COBROS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.COBROS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
