/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

const tablaCuentas = crearDataTable("tabla_cuentas_pagar", [
    { data: "id", title: "Id Cuenta", render: renderRaw },
    { data: "purchase_id", title: "Id Compra", render: renderRaw },
    { data: "provider_id", title: "Proveedor", render: data => renderString(cargarProveedor(data).legal_name) },
    { data: "amount_total", title: "Total a Pagar", render: renderMoneda },
    { data: "amount_paid", title: "Monto Pagado", render: renderMoneda },
    { data: "amount_due", title: "Monto Pendiente", render: renderMoneda },
    { data: "status", title: "Estado", render: data => `<span class="badge ${({
        [ESTADO_PENDIENTE]: "bg-danger",
        [ESTADO_PARCIAL]: "bg-warning text-dark",
        [ESTADO_PAGADA]: "bg-success"
    })[data] ?? "bg-secondary"}">${data}</span>`},
    { data: "expire_at", title: "Fecha de Vencimiento", render: renderFecha },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    // { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE CUENTAS POR PAGAR",
    actions: cuenta => ({
        edit: null,
        delete: null,
        enable: null,
        disable: null,
        customs: [
            ...(cuenta.status === "PAGADA" ? [] : [{
                color: "btn-success",
                href: `pagos.html?cuenta_id=${cuenta.id}`,
                content: '<i class="bi bi-cash"></i> Pagar',
                title: "Realizar Pago",
                properties: ""
            }]),
            {
                color: "btn-info",
                content: '<i class="bi bi-eye"></i>',
                title: "Detalles",
                properties: `type="button" onclick="ventanaMostrarDetalle(${cuenta.id})"`
            }
        ]
    })
});


/**
 * @param {number} id 
 */
function ventanaMostrarDetalle(id) {
    const cuenta = cargarCuentaPorPagar(id);
    if (!cuenta) return;
    const proveedor = cargarProveedor(cuenta.provider_id);
    document.getElementById('detalle_proveedor').textContent = proveedor.legal_name;
    document.getElementById('detalle_compra').textContent = cuenta.purchase_id;
    document.getElementById('detalle_emision').textContent = renderFecha(new Date(cuenta.created_at));
    document.getElementById('detalle_vencimiento').textContent = renderFecha(new Date(cuenta.expire_at));
    modalDetalle.show();
}

function cargarDatos() {
    cargarDataTable(tablaCuentas, cargarCuentasPorPagar());
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.CUENTAS_PAGAR_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_VER)) document.getElementById("verPagos").style.display = "none";
    cargarDatos();
});
