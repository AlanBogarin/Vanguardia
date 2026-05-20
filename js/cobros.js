/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalNCobro = new bootstrap.Modal(document.getElementById('modalNuevoCobro'));

function formatoMoneda(valor) {
    return 'Gs. ' + Number(valor).toLocaleString('es-PY');
}

function obtenerSiguienteId() {
    const cobros = cargarCobros();
    if (cobros.length === 0) return 1;
    return Math.max(...cobros.map(c => c.id)) + 1;
}

function cargarOpcionesCuentas(preselectId = null) {
    const cuentas = cargarCuentasPorCobrar().filter(c => c.status !== 'COBRADA');
    const clientes = cargarClientes();
    const select = document.getElementById("account_receivable_id");

    let options = '<option value="">Seleccione una cuenta pendiente...</option>';
    cuentas.forEach(c => {
        const cli = clientes.find(client => client.id === c.client_id);
        const cliName = cli ? cli.legal_name : 'Desconocido';
        options += `<option value="${c.id}" data-saldo="${c.amount_due}">ID: ${c.id} - ${cliName} (Pendiente: ${formatoMoneda(c.amount_due)})</option>`;
    });

    select.innerHTML = options;

    if (preselectId) {
        select.value = preselectId;
        actualizarSaldoPendiente();
    }
}

function actualizarSaldoPendiente() {
    const select = document.getElementById("account_receivable_id");
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

function guardarNuevoCobro(e) {
    e.preventDefault();
    const cuentaIdElem = document.getElementById("account_receivable_id");
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

    const cuenta = cargarCuentaPorCobrar(cuenta_id);
    if (!cuenta) {
        alertify.error("La cuenta seleccionada no existe.");
        return;
    }

    if (monto > cuenta.amount_due) {
        alertify.error("El monto a cobrar no puede ser mayor al saldo pendiente.");
        return;
    }

    // Guardar Cobro
    const nuevo_id = obtenerSiguienteId();
    guardarCobro({
        id: nuevo_id,
        account_receivable_id: cuenta_id,
        amount: monto,
        payment_method: metodo,
        reference_number: referencia,
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

    this.reset();
    document.getElementById("saldo_pendiente").value = "";
    
    cargarTablaCobros();
    cargarOpcionesCuentas(); // Refrescar cuentas (puede que la que se cobró ya no esté pendiente)
    modalNCobro.hide();
    alertify.success("Cobro registrado exitosamente");
}

document.addEventListener('DOMContentLoaded', function () {
    cargarTablaCobros();
    cargarOpcionesCuentas();

    document.getElementById("account_receivable_id").addEventListener("change", actualizarSaldoPendiente);
    document.getElementById("formNuevoCobro").addEventListener("submit", guardarNuevoCobro);

    // Leer parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const cuentaParam = urlParams.get('cuenta_id');
    if (cuentaParam) {
        cargarOpcionesCuentas(parseInt(cuentaParam));
        modalNCobro.show();
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

function cargarTablaCobros() {
    const cuentas = cargarCuentasPorCobrar();
    const clientes = cargarClientes();
    
    const cobros = cargarCobros().map(c => {
        const cuenta = cuentas.find(acc => acc.id === c.account_receivable_id);
        const cli = cuenta ? clientes.find(client => client.id === cuenta.client_id) : null;
        
        return {
            ...c,
            cliente_name: cli ? cli.legal_name : 'Desconocido',
            monto_fmt: formatoMoneda(c.amount),
            fecha_fmt: new Date(c.created_at).toLocaleString()
        };
    });

    if (tabla) {
        tabla.clear().rows.add(cobros).draw();
        return;
    }

    tabla = new DataTable("#tabla_cobros", {
        data: cobros,
        order: [[0, 'desc']], // Ordenar por ID descendente
        columns: [
            { data: 'id' },
            { data: 'account_receivable_id' },
            { data: 'cliente_name' },
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
