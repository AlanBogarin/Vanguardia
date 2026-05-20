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
        const cuenta = cargarCuentaPorPagar(id);
        if (!cuenta) return;

        const proveedores = cargarProveedores();
        const prov = proveedores.find(p => p.id === cuenta.provider_id);

        document.getElementById('det_proveedor').textContent = prov ? prov.legal_name : "Desconocido";
        document.getElementById('det_compra').textContent = cuenta.purchase_id;
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
    const proveedores = cargarProveedores();
    const cuentas = cargarCuentasPorPagar().map(c => {
        const prov = proveedores.find(p => p.id === c.provider_id);
        
        let badgeClase = 'bg-secondary';
        if (c.status === 'PENDIENTE') badgeClase = 'bg-danger';
        else if (c.status === 'PARCIAL') badgeClase = 'bg-warning text-dark';
        else if (c.status === 'PAGADA') badgeClase = 'bg-success';

        return {
            ...c,
            proveedor_name: prov ? prov.legal_name : 'Desconocido',
            monto_total_fmt: formatoMoneda(c.amount_total),
            monto_pagado_fmt: formatoMoneda(c.amount_paid),
            monto_pendiente_fmt: formatoMoneda(c.amount_due),
            estado_html: `<span class="badge ${badgeClase}">${c.status}</span>`,
            vencimiento_fmt: new Date(c.expire_at).toLocaleDateString()
        };
    });

    if (tabla) {
        tabla.clear().rows.add(cuentas).draw();
        return;
    }

    tabla = new DataTable("#tabla_cuentas_pagar", {
        data: cuentas,
        columns: [
            { data: 'id' },
            { data: 'purchase_id' },
            { data: 'proveedor_name' },
            { data: 'monto_total_fmt' },
            { data: 'monto_pagado_fmt' },
            { data: 'monto_pendiente_fmt' },
            { data: 'estado_html' },
            { data: 'vencimiento_fmt' },
            {
                data: null,
                render: function (data, type, row) {
                    let btnPagar = "";
                    if (row.status !== 'PAGADA') {
                        btnPagar = `<a href="pagos.html?cuenta_id=${row.id}" class="btn btn-sm btn-success me-1" title="Realizar Pago"><i class="bi bi-cash"></i> Pagar</a>`;
                    }
                    return `
                        ${btnPagar}
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
