/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevo = new bootstrap.Modal(document.getElementById('modalNuevoCobro'));

// Nro. Timbrado?
const tablaCobros = crearDataTable("tabla_cobros", [
    ...TABLAS.COBRO.slice(0, 3),
    { data: null, title: "Cliente", render: data => cargarCliente((data.sale_id ? cargarVenta(data.sale_id)
        : cargarCuentaPorCobrar(data.account_receivable_id)).client_id).legal_name },
    ...TABLAS.COBRO.slice(3)
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
        obs: "",
        created_at: new Date()
    });

    // Actualizar Cuenta Por Cobrar
    cuenta.amount_paid += monto;
    cuenta.amount_due -= monto;
    if (cuenta.amount_due === 0) {
        cuenta.status = ESTADO_COBRADA;
    } else {
        cuenta.status = ESTADO_PARCIAL;
    }
    cuenta.updated_at = new Date();
    guardarCuentaPorCobrar(cuenta);

    document.getElementById("saldo_pendiente").value = "";
    
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Cobro registrado exitosamente");
}

function cargarDatos() {
    const metodo = document.getElementById("filtro_metodo")?.value;
    const fechaDesde = document.getElementById("filtro_fecha_desde")?.value;
    const fechaHasta = document.getElementById("filtro_fecha_hasta")?.value;
    cargarDataTable(tablaCobros, cargarCobros().filter(c => {
        if (metodo && c.payment_method !== metodo) return false;
        if (fechaDesde && c.created_at) {
            const fd = new Date(fechaDesde);
            fd.setHours(0, 0, 0, 0);
            if (new Date(c.created_at) < fd) return false;
        }
        if (fechaHasta && c.created_at) {
            const fh = new Date(fechaHasta);
            fh.setHours(23, 59, 59, 999);
            if (new Date(c.created_at) > fh) return false;
        }
        return true;
    }));
    // Cargar select
    const cuentaElem = document.getElementById("account_receivable_id");
    cuentaElem.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>'
        + cargarCuentasPorCobrar().filter(c => c.status !== ESTADO_COBRADA).map(c => `
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
