/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

const tablaCuentas = crearDataTable("tabla_cuentas_cobrar", TABLAS.CUENTA_POR_COBRAR, {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE CUENTAS POR COBRAR",
    actions: tienePermisoSesion(PERMISOS.COBROS_CREAR) ? (cuenta) => ({
        customs: [
           ...(cuenta.status === ESTADO_COBRADA ? [] : [{
                color: "btn-success",
                content: "<i class=\"bi bi-cash-stack\"></i> Cobrar",
                title: "Cobrar",
               href: `cobros.html?cuenta_id=${cuenta.id}`
            }]),
            {
                color: "btn-info",
                content: "<i class=\"bi bi-eye\"></i>",
                properties: `onclick="ventanaVerDetalle(${cuenta.id})"`,
                title: "Ver Detalles"
            }
        ]
   }) : null
});

/**
 * @param {number} id 
 */
function ventanaVerDetalle(id) {
    const cuenta = cargarCuentaPorCobrar(id);
    if (!cuenta) return;
    const cliente = cargarCliente(cuenta.client_id);
    document.getElementById('det_cliente').textContent = cliente.legal_name;
    document.getElementById('det_ruc').textContent = cliente.ruc;
    document.getElementById('det_venta').textContent = cuenta.sale_id;
    document.getElementById('det_emision').textContent = renderFecha(cuenta.created_at);
    const cuotas = cargarCuotasPorCobrar(cuenta.id);
    const ultimaCuota = cuotas.length ? cuotas[cuotas.length - 1] : null;
    document.getElementById('det_vencimiento').textContent = ultimaCuota ? renderFecha(ultimaCuota.due_date) : '—';
    modalDetalle.show();
}


function cargarDatos() {
    const dlClientesElem = document.getElementById("datalist_clientes");
    const estado = document.getElementById("filtro_estado").value;
    const fechaDesde = document.getElementById("filtro_fecha_desde").value;
    const fechaHasta = document.getElementById("filtro_fecha_hasta").value;
    const cliente = document.getElementById("filtro_cliente").value.trim().toUpperCase();
    const idMap = {};
    dlClientesElem.innerHTML = cargarClientes().filter(c => c.active).map(c => {
        const key = `${c.legal_name} - ${c.ruc}`;
        idMap[key] = c.id;
        return `<option value="${key}"></option>`
    }).join("");
    cargarDataTable(tablaCuentas, cargarCuentasPorCobrar().filter(c => {
        if (estado && c.status !== estado) return false;
        if (fechaDesde && fechaDesde > c.expire_at.substring(0, 10)) return false;
        if (fechaHasta && fechaHasta < c.expire_at.substring(0, 10)) return false;
        const legal_name = cargarCliente(c.client_id).legal_name;
        if (cliente && !legal_name.includes(cliente) && idMap[cliente] !== c.id) return false;
        return true;
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.CUENTAS_COBRAR_VER)) return;
    if (!tienePermisoSesion(PERMISOS.COBROS_VER)) document.getElementById("link-cobros").style.display = "none";
    document.getElementById("filtro_estado").addEventListener("change", cargarDatos);
    document.getElementById("filtro_fecha_desde").addEventListener("change", cargarDatos);
    document.getElementById("filtro_fecha_hasta").addEventListener("change", cargarDatos);
    document.getElementById("filtro_cliente").addEventListener("input", cargarDatos);
    cargarDatos();
    document.getElementById("filtro_estado").addEventListener("change", cargarDatos);
    document.getElementById("filtro_fecha_desde").addEventListener("change", cargarDatos);
    document.getElementById("filtro_fecha_hasta").addEventListener("change", cargarDatos);
    document.getElementById("filtro_cliente").addEventListener("input", cargarDatos);
});
