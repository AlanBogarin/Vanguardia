/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

function formatoMoneda(valor) {
    return 'Gs. ' + Number(valor).toLocaleString('es-PY');
}
function cargarDatalistClientes() {
    document.getElementById('datalist_clientes').innerHTML =
        cargarClientes()
            .map(c => `<option value="${c.legal_name}">`)
            .join('');
}

function verDetalle(e) {
    if (e.target.closest('.btn-detalle')) {
        const id = parseInt(e.target.closest('.btn-detalle').dataset.id);
        const cuenta = cargarCuentaPorCobrar(id);
        if (!cuenta) return;

        const clientes = cargarClientes();
        const cli = clientes.find(c => c.id === cuenta.client_id);

        document.getElementById('det_cliente').textContent = cli ? cli.legal_name : "Desconocido";
        document.getElementById('det_venta').textContent = cuenta.sale_id;
        document.getElementById('det_emision').textContent = new Date(cuenta.created_at).toLocaleDateString();
        document.getElementById('det_vencimiento').textContent = new Date(cuenta.expire_at).toLocaleDateString();

        modalDetalle.show();
    }
}

document.addEventListener('DOMContentLoaded', function () {

    cargarDatalistClientes();

    cargarTablaCuentas();

    document.addEventListener("click", verDetalle);
});

function cargarTablaCuentas() {
    const clientes = cargarClientes();
    const cuentas = obtenerCuentasFiltradas().map(c => {
        const cli = clientes.find(client => client.id === c.client_id);
        
        let badgeClase = 'bg-secondary';
        if (c.status === ESTADO_PENDIENTE) badgeClase = 'bg-danger';
        else if (c.status === ESTADO_PARCIAL) badgeClase = 'bg-warning text-dark';
        else if (c.status === ESTADO_COBRADA) badgeClase = 'bg-success';

        return {
            ...c,
            cliente_name: cli ? cli.legal_name : 'Desconocido',
            monto_total_fmt: formatoMoneda(c.amount_total),
            monto_cobrado_fmt: formatoMoneda(c.amount_paid),
            monto_pendiente_fmt: formatoMoneda(c.amount_due),
            estado_html: `<span class="badge ${badgeClase}">${c.status}</span>`,
            vencimiento_fmt: new Date(c.expire_at).toLocaleDateString()
        };
    });

    if (tabla) {
        tabla.clear().rows.add(cuentas).draw();
        return;
    }

    tabla = new DataTable("#tabla_cuentas_cobrar", {
        data: cuentas,
        columns: [
            { data: 'id' },
            { data: 'sale_id' },
            { data: 'cliente_name' },
            { data: 'monto_total_fmt' },
            { data: 'monto_cobrado_fmt' },
            { data: 'monto_pendiente_fmt' },
            { data: 'estado_html' },
            { data: 'vencimiento_fmt' },
            {
                data: null,
                render: function (data, type, row) {
                    let btnCobrar = "";
                    if (row.status !== ESTADO_COBRADA) {
                        btnCobrar = `<a href="cobros.html?cuenta_id=${row.id}" class="btn btn-sm btn-success me-1" title="Realizar Cobro"><i class="bi bi-cash-stack"></i> Cobrar</a>`;
                    }
                    return `
                        ${btnCobrar}
                        <button class="btn btn-sm btn-info btn-detalle" data-id="${row.id}" title="Ver Detalles"><i class="bi bi-eye"></i></button>
                    `;
                }
            }
        ],
        dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rtip',
        buttons: botonesCorporativos(
            "LISTADO DE CUENTAS POR COBRAR",
            [0,1,2,3,4,5,6,7]
        ),
        language: {
            url: "dt/es-ES.json"
        }
    });
}

function obtenerCuentasFiltradas() {

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const estado = document.getElementById("filtro_estado").value;
    const fechaDesde = document.getElementById("filtro_fecha_desde").value;
    const fechaHasta = document.getElementById("filtro_fecha_hasta").value;
    const cliente = document.getElementById("filtro_cliente").value.trim().toLowerCase();

    const clientes = cargarClientes();

    return cargarCuentasPorCobrar().filter(c => {

        const vencida =
            c.status !== ESTADO_COBRADA &&
            new Date(c.expire_at) < hoy;

        if (estado === "VENCIDO" && !vencida)
            return false;

        if (
            estado &&
            estado !== "VENCIDO" &&
            c.status !== estado
        )
            return false;

        const fechaVenc = new Date(c.expire_at);

        if (fechaDesde && fechaVenc < new Date(fechaDesde))
            return false;

        if (fechaHasta) {

            const hasta = new Date(fechaHasta);
            hasta.setHours(23,59,59,999);

            if (fechaVenc > hasta)
                return false;
        }

        if (cliente) {

            const cli =
                clientes.find(x => x.id === c.client_id);

            if (
                !cli ||
                !cli.legal_name
                    .toLowerCase()
                    .includes(cliente)
            )
                return false;
        }

        return true;
    });
}
function aplicarFiltros() {
    cargarTablaCuentas();
}

function limpiarFiltros() {

    document.getElementById("filtro_estado").value = "";
    document.getElementById("filtro_fecha_desde").value = "";
    document.getElementById("filtro_fecha_hasta").value = "";
    document.getElementById("filtro_cliente").value = "";

    cargarTablaCuentas();
}