/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

const tablaCuentas = crearDataTable("tabla_cuentas_pagar", TABLAS.CUENTA_POR_PAGAR, {
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
            ...(cuenta.status === ESTADO_PAGADA ? [] : [{
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
        if (estado === 'VENCIDO' && !vencida) return false;
        if (estado && estado !== 'VENCIDO' && c.status !== estado) return false;
        if (fechaDesde && fechaDesde > c.expire_at.substring(0, 10)) return false;
        if (fechaHasta && fechaHasta < c.expire_at.substring(0, 10)) return false;
        if (busquedaProv) {
            const prov = cargarProveedor(c.provider_id);
            if (!prov || !prov.legal_name.toLowerCase().includes(busquedaProv)) return false;
        }
        return true;
    });
}


function cargarDatos() {
    cargarDataTable(tablaCuentas, obtenerCuentasFiltradas());
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.CUENTAS_PAGAR_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_VER)) document.getElementById("verPagos").style.display = "none";
    document.getElementById('filtro_estado').addEventListener('change', cargarDatos);
    document.getElementById('filtro_fecha_desde').addEventListener('change', cargarDatos);
    document.getElementById('filtro_fecha_hasta').addEventListener('change', cargarDatos);
    document.getElementById('filtro_proveedor').addEventListener('input', cargarDatos);
    cargarDatalistProveedores();
    cargarDatos();
});
