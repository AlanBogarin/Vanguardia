/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

const tablaCuentas = crearDataTable("tabla_cuentas_pagar", [
    { data: "id",           title: "Id Cuenta",            render: renderRaw },
    { data: "purchase_id",  title: "Id Compra",            render: renderRaw },
    { data: "provider_id",  title: "Proveedor",            render: data => renderString(cargarProveedor(data).legal_name) },
    { data: "amount_total", title: "Total a Pagar",        render: renderMoneda },
    { data: "amount_paid",  title: "Monto Pagado",         render: renderMoneda },
    { data: "amount_due",   title: "Monto Pendiente",      render: renderMoneda },
    { data: "status",       title: "Estado",               render: (data, type, row) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencida = data !== ESTADO_PAGADA && new Date(row.expire_at) < hoy;
        if (vencida) return '<span class="badge bg-dark">VENCIDO</span>';
        return `<span class="badge ${{
            [ESTADO_PENDIENTE]: "bg-danger",
            [ESTADO_PARCIAL]:   "bg-warning text-dark",
            [ESTADO_PAGADA]:    "bg-success"
        }[data] ?? "bg-secondary"}">${data}</span>`;
    }},
    { data: "expire_at",    title: "Fecha de Vencimiento", render: renderFecha },
    { data: "created_at",   title: "Fecha de Creación",    render: renderFecha },
    { data: "updated_at",   title: "Fecha de Modificación",render: renderFecha }
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
    document.getElementById('detalle_compra').textContent    = cuenta.purchase_id;
    document.getElementById('detalle_emision').textContent   = renderFecha(new Date(cuenta.created_at));
    document.getElementById('detalle_vencimiento').textContent = renderFecha(new Date(cuenta.expire_at));
    modalDetalle.show();
}

function cargarDatalistProveedores() {
    document.getElementById('datalist_proveedores').innerHTML =
        cargarProveedores().map(p => `<option value="${escapeHTML(p.legal_name)}">`).join('');
}

/**
 * Lee los valores de los filtros y devuelve las cuentas que los cumplen.
 * @returns {CuentaPorPagar[]}
 */
function obtenerCuentasFiltradas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const estado      = document.getElementById('filtro_estado').value;
    const fechaDesde  = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta  = document.getElementById('filtro_fecha_hasta').value;
    const busquedaProv = document.getElementById('filtro_proveedor').value.trim().toLowerCase();

    return cargarCuentasPorPagar().filter(c => {
        const vencida = c.status !== ESTADO_PAGADA && new Date(c.expire_at) < hoy;

        // Filtro estado (incluye "VENCIDO" como estado visual)
        if (estado === 'VENCIDO' && !vencida) return false;
        if (estado && estado !== 'VENCIDO' && c.status !== estado) return false;

        // Filtro rango de fechas de vencimiento
        const expireAt = new Date(c.expire_at);
        if (fechaDesde && expireAt < new Date(fechaDesde)) return false;
        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            if (expireAt > hasta) return false;
        }

        // Filtro proveedor
        if (busquedaProv) {
            const prov = cargarProveedor(c.provider_id);
            if (!prov || !prov.legal_name.toLowerCase().includes(busquedaProv)) return false;
        }

        return true;
    });
}

function aplicarFiltros() {
    cargarDatos();
}

function limpiarFiltros() {
    document.getElementById('filtro_estado').value       = '';
    document.getElementById('filtro_fecha_desde').value  = '';
    document.getElementById('filtro_fecha_hasta').value  = '';
    document.getElementById('filtro_proveedor').value    = '';
    cargarDatos();
}

function cargarDatos() {
    cargarDataTable(tablaCuentas, obtenerCuentasFiltradas());
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.CUENTAS_PAGAR_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_VER)) document.getElementById("verPagos").style.display = "none";
    tablaCuentas.buttons().container().appendTo('#contenedor-botones-exportar');
    cargarDatalistProveedores();
    cargarDatos();
});
