/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalNPago = new bootstrap.Modal(document.getElementById('modalNuevoPago'));

function formatoMoneda(valor) {
    return 'Gs. ' + Number(valor).toLocaleString('es-PY');
}

function obtenerSiguienteId() {
    const pagos = cargarPagos();
    if (pagos.length === 0) return 1;
    return Math.max(...pagos.map(p => p.id)) + 1;
}

function cargarOpcionesCuentas(preselectId = null) {
    const cuentas = cargarCuentasPorPagar().filter(c => c.status !== 'PAGADA');
    const proveedores = cargarProveedores();
    const select = document.getElementById("account_payable_id");
    
    let options = '<option value="">Seleccione una cuenta pendiente...</option>';
    cuentas.forEach(c => {
        const prov = proveedores.find(p => p.id === c.provider_id);
        const provName = prov ? prov.name : 'Desconocido';
        options += `<option value="${c.id}" data-saldo="${c.amount_due}">ID: ${c.id} - ${provName} (Pendiente: ${formatoMoneda(c.amount_due)})</option>`;
    });
    
    select.innerHTML = options;

    if (preselectId) {
        select.value = preselectId;
        actualizarSaldoPendiente();
    }
}

function actualizarSaldoPendiente() {
    const select = document.getElementById("account_payable_id");
    const option = select.options[select.selectedIndex];
    const saldoInput = document.getElementById("saldo_pendiente");
    const montoInput = document.getElementById("monto");
    
    if (option && option.value !== "") {
        const saldo = option.getAttribute("data-saldo");
        saldoInput.value = formatoMoneda(saldo);
        montoInput.max = saldo;
        montoInput.value = saldo; // Sugerir el saldo completo
    } else {
        saldoInput.value = "";
        montoInput.max = "";
        montoInput.value = "";
    }
}

function guardarNuevoPago(e) {
    e.preventDefault();
    const cuentaIdElem = document.getElementById("account_payable_id");
    const montoElem = document.getElementById("monto");
    const metodoElem = document.getElementById("metodo");
    const referenciaElem = document.getElementById("referencia");

    const cuenta_id = parseInt(cuentaIdElem.value);
    const monto = parseFloat(montoElem.value);
    const metodo = metodoElem.value;
    const referencia = referenciaElem.value.trim();

    if (!cuenta_id || isNaN(monto) || monto <= 0 || !metodo) {
        alertify.error("Complete los campos obligatorios correctamente.");
        return;
    }

    const cuenta = cargarCuentaPorPagar(cuenta_id);
    if (!cuenta) {
        alertify.error("La cuenta seleccionada no existe.");
        return;
    }

    if (monto > cuenta.amount_due) {
        alertify.error("El monto a pagar no puede ser mayor al saldo pendiente.");
        return;
    }

    // Guardar Pago
    const nuevo_id = obtenerSiguienteId();
    guardarPago({
        id: nuevo_id,
        account_payable_id: cuenta_id,
        amount: monto,
        payment_method: metodo,
        reference_number: referencia,
        created_at: new Date()
    });

    // Actualizar Cuenta Por Pagar
    cuenta.amount_paid += monto;
    cuenta.amount_due -= monto;
    if (cuenta.amount_due === 0) {
        cuenta.status = 'PAGADA';
    } else {
        cuenta.status = 'PARCIAL';
    }
    cuenta.updated_at = new Date();
    guardarCuentaPorPagar(cuenta);

    this.reset();
    document.getElementById("saldo_pendiente").value = "";
    
    cargarTablaPagos();
    cargarOpcionesCuentas(); // Refrescar cuentas (puede que la que se pagó ya no esté pendiente)
    modalNPago.hide();
    alertify.success("Pago registrado exitosamente");
}

document.addEventListener('DOMContentLoaded', function () {
    cargarTablaPagos();
    cargarOpcionesCuentas();

    document.getElementById("account_payable_id").addEventListener("change", actualizarSaldoPendiente);
    document.getElementById("formNuevoPago").addEventListener("submit", guardarNuevoPago);

    // Leer parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const cuentaParam = urlParams.get('cuenta_id');
    if (cuentaParam) {
        cargarOpcionesCuentas(parseInt(cuentaParam));
        modalNPago.show();
        // Limpiar la URL para evitar que se vuelva a abrir al recargar
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

function cargarTablaPagos() {
    const cuentas = cargarCuentasPorPagar();
    const proveedores = cargarProveedores();
    
    const pagos = cargarPagos().map(p => {
        const cuenta = cuentas.find(c => c.id === p.account_payable_id);
        const prov = cuenta ? proveedores.find(pr => pr.id === cuenta.provider_id) : null;
        
        return {
            ...p,
            proveedor_name: prov ? prov.name : 'Desconocido',
            monto_fmt: formatoMoneda(p.amount),
            fecha_fmt: new Date(p.created_at).toLocaleString()
        };
    });

    if (tabla) {
        tabla.clear().rows.add(pagos).draw();
        return;
    }

    tabla = new DataTable("#tabla_pagos", {
        data: pagos,
        order: [[0, 'desc']], // Ordenar por ID descendente (más nuevos primero)
        columns: [
            { data: 'id' },
            { data: 'account_payable_id' },
            { data: 'proveedor_name' },
            { data: 'monto_fmt' },
            { data: 'payment_method' },
            { data: 'reference_number' },
            { data: 'fecha_fmt' }
        ],
        dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rtip',
        buttons: [
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
            }
        ],
        language: {
            url: "dt/es-ES.json"
        }
    });
}
