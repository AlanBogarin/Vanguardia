/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

function formatoMoneda(valor) {
    return 'Gs. ' + Number(valor).toLocaleString('es-PY');
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
    cargarTablaCuentas();
    document.addEventListener("click", verDetalle);
});

function cargarTablaCuentas() {
    const clientes = cargarClientes();
    const cuentas = cargarCuentasPorCobrar().map(c => {
        const cli = clientes.find(client => client.id === c.client_id);
        
        let badgeClase = 'bg-secondary';
        if (c.status === 'PENDIENTE') badgeClase = 'bg-danger';
        else if (c.status === 'PARCIAL') badgeClase = 'bg-warning text-dark';
        else if (c.status === 'COBRADA') badgeClase = 'bg-success';

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
                    if (row.status !== 'COBRADA') {
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
        buttons: [
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
            }
        ],
        language: {
            url: "dt/es-ES.json"
        }
    });
}
