/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalleCuenta'));

const tablaCuentas = crearDataTable("tabla_cuentas_cobrar", [
    ...TABLAS.CUENTA_POR_COBRAR.slice(0, 4), // 0: id, 1: sale_id, 2: client_id, 3: amount_total
    { data: "id", title: "Cobrado", align: "right", render: data => renderMoneda(calcularCuentaPorCobrar(data).amount_paid) },
    { data: "id", title: "Saldo", align: "right", render: data => renderMoneda(calcularCuentaPorCobrar(data).amount_due) },
    ...TABLAS.CUENTA_POR_COBRAR.slice(4, 5), // 4: installments
    { data: "id", title: "Cuotas Pend.", align: "right", render: data => {
        const cuotas = cargarCuotasPorCobrar(data);
        const pendientes = cargarCuotasPorCobrar(data).filter(c => c.status !== ESTADO_COBRADA);
        const vencida = pendientes.some(c => new Date(c.due_date) < new Date(new Date().setHours(0, 0, 0, 0)));
        const color = !pendientes.length ? "bg-success" : vencida ? "bg-danger" : "bg-primary";
        const mensaje = !pendientes.length ? "Completado" : `${pendientes.length} cuotas`;
        return `<span class="badge ${color}">${mensaje}</span>`; } },
    { data: "status", title: "Estado", align: "center", render: badgeEstadoCuenta },
    ...TABLAS.CUENTA_POR_COBRAR.slice(7) // 7: created_at, 8: updated_at
], {
    buttons: true,
    pageLength: 15,
    searching: true,
    exportTitle: "LISTADO DE CUENTAS POR COBRAR",
    order: [[1, 'desc']], // Ordenar por Id Venta descendente
    actions: cuenta => ({
        edit: null,
        delete: null,
        enable: null,
        disable: null,
        customs: [
            ...(cuenta.status !== ESTADO_COBRADA && tienePermisoSesion(PERMISOS.COBROS_CREAR) ? [{
                color: "btn-success",
                href: `cobros.html?cuenta_id=${cuenta.id}`,
                content: '<i class="bi bi-cash"></i> Cobrar',
                title: "Registrar Cobro a la Cuenta",
                properties: ""
            }] : []),
            {
                color: "btn-info",
                content: '<i class="bi bi-list-ol"></i> Ver Cuotas',
                title: "Ver Cuotas de la Cuenta",
                properties: `type="button" onclick="ventanaMostrarDetalle(${cuenta.id})"`
            }
        ]
    })
});

/**
 * Genera el badge HTML para el estado de una cuota
 * @param {string} status 
 * @param {boolean} vencida 
 * @returns {string}
 */
function badgeEstadoCuota(status, vencida) {
    if (status === ESTADO_COBRADA) return '<span class="badge bg-success">COBRADA</span>';
    if (vencida) return '<span class="badge bg-danger">VENCIDA</span>';
    if (status === ESTADO_PARCIAL) return '<span class="badge bg-warning text-dark">PARCIAL</span>';
    return '<span class="badge bg-secondary">PENDIENTE</span>';
}

/**
 * Genera el badge HTML para el estado de una cuenta
 * @param {string} status 
 * @returns {string}
 */
function badgeEstadoCuenta(status) {
    if (status === ESTADO_COBRADA)  return '<span class="badge bg-success fs-6">COBRADA</span>';
    if (status === ESTADO_PARCIAL) return '<span class="badge bg-warning text-dark fs-6">PARCIAL</span>';
    return '<span class="badge bg-secondary fs-6">PENDIENTE</span>';
}

/**
 * Construye las filas de Cuentas aplicando los filtros activos.
 * @returns {object[]}
 */
function obtenerCuotasFiltradas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const filtroEstado   = document.getElementById('filtro_estado').value;
    const fechaDesde     = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta     = document.getElementById('filtro_fecha_hasta').value;
    const busquedaCliente = document.getElementById('filtro_cliente').value.trim().toLowerCase();

    const cuentas = cargarCuentasPorCobrar();
    const resultado = [];

    for (const cuenta of cuentas) {
        const cliente = cargarCliente(cuenta.client_id);
        if (!cliente) continue;

        // Filtro de cliente
        if (busquedaCliente && !cliente.legal_name.toLowerCase().includes(busquedaCliente) && !cliente.ruc.includes(busquedaCliente)) continue;

        const cuotas = cargarCuotasPorCobrar(cuenta.id);

        let tieneVencida = false;
        let fechaVencimientoProx = null;
        for (const cuota of cuotas) {
            if (cuota.status !== ESTADO_COBRADA) {
                if (new Date(cuota.due_date) < hoy) tieneVencida = true;
                if (!fechaVencimientoProx || cuota.due_date < fechaVencimientoProx) {
                    fechaVencimientoProx = cuota.due_date;
                }
            }
        }

        // Filtro de estado
        if (filtroEstado === 'VENCIDO' && !tieneVencida) continue;
        if (filtroEstado && filtroEstado !== 'VENCIDO' && cuenta.status !== filtroEstado) continue;

        // Filtro de fecha
        const fechaComparar = fechaVencimientoProx
            ? toISOLocalDate(fechaVencimientoProx)
            : toISOLocalDate(cuenta.created_at);
        if (fechaDesde && fechaComparar < fechaDesde) continue;
        if (fechaHasta && fechaComparar > fechaHasta) continue;

        resultado.push(cuenta);
    }

    return resultado;
}

/**
 * Muestra el modal con el detalle completo de todas las cuotas de una cuenta
 * @param {number} cuentaId
 */
function ventanaMostrarDetalle(cuentaId) {
    const cuenta = cargarCuentaPorCobrar(cuentaId);
    if (!cuenta) return;

    const cliente = cargarCliente(cuenta.client_id);
    const cuotas = cargarCuotasPorCobrar(cuentaId)
        .sort((a, b) => a.installment_number - b.installment_number);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Calcular totales desde cuotas
    const totalAbonado = cuotas.reduce((s, c) => s + (c.amount_paid || 0), 0);
    const totalSaldo   = cuenta.amount_total - totalAbonado;

    // Rellenar cabecera del modal
    document.getElementById('detalle_cliente').textContent  = cliente ? cliente.legal_name : '—';
    document.getElementById('detalle_venta').textContent     = cuenta.sale_id;
    document.getElementById('detalle_emision').textContent    = renderFecha(new Date(cuenta.created_at));
    document.getElementById('detalle_total').textContent      = `Gs. ${renderMoneda(cuenta.amount_total)}`;
    document.getElementById('detalle_abonado').textContent    = `Gs. ${renderMoneda(totalAbonado)}`;
    document.getElementById('detalle_saldo').textContent      = `Gs. ${renderMoneda(totalSaldo)}`;
    document.getElementById('detalle_estado_cuenta').innerHTML = badgeEstadoCuenta(cuenta.status);

    // Botón de cobrar
    const btnCobrar = document.getElementById('btn_cobrar_cuenta');
    if (cuenta.status === ESTADO_COBRADA || !tienePermisoSesion(PERMISOS.COBROS_CREAR)) {
        btnCobrar.style.display = 'none';
    } else {
        btnCobrar.style.display = '';
        btnCobrar.href = `cobros.html?cuenta_id=${cuenta.id}`;
    }

    // Rellenar tabla de cuotas
    const tbody = document.getElementById('tbody_detalle_cuotas');
    if (!cuotas.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin cuotas registradas</td></tr>';
    } else {
        let foundFirstPending = false;
        tbody.innerHTML = cuotas.map(cuota => {
            const vencida = cuota.status !== ESTADO_COBRADA && new Date(cuota.due_date) < hoy;
            const saldo = cuota.amount - (cuota.amount_paid || 0);
            
            let isFirstPending = false;
            if (cuota.status !== ESTADO_COBRADA && !foundFirstPending) {
                isFirstPending = true;
                foundFirstPending = true;
            }

            let rowClass = '';
            if (cuota.status === ESTADO_COBRADA) {
                rowClass = 'table-success';
            } else if (vencida) {
                rowClass = 'table-danger';
            } else if (isFirstPending) {
                rowClass = 'table-info';
            } else if (cuota.status === ESTADO_PARCIAL) {
                rowClass = 'table-warning';
            }
            
            const customBadge = isFirstPending && !vencida
                ? '<span class="badge bg-info text-dark shadow-sm border border-info">SIGUIENTE A COBRAR</span>'
                : badgeEstadoCuota(cuota.status, vencida);

            return `
                <tr class="${rowClass}">
                    <td class="text-center fw-bold">${cuota.installment_number}</td>
                    <td class="text-end">Gs. ${renderMoneda(cuota.amount)}</td>
                    <td class="text-end text-success fw-semibold">Gs. ${renderMoneda(cuota.amount_paid || 0)}</td>
                    <td class="text-end text-danger fw-semibold">Gs. ${renderMoneda(saldo)}</td>
                    <td>${renderDate(cuota.due_date)}</td>
                    <td class="text-center">${customBadge}</td>
                </tr>
            `;
        }).join('');
    }

    modalDetalle.show();
}

function cargarDatalistClientes() {
    document.getElementById('datalist_clientes').innerHTML =
        cargarClientes().map(c => `<option value="${escapeHTML(c.legal_name)}">`).join('');
}

function cargarDatos() {
    try { repararCuentasPorCobrar(); } catch(e) { console.error('repararCuentasPorCobrar:', e); }
    cargarDataTable(tablaCuentas, obtenerCuotasFiltradas());
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.CUENTAS_COBRAR_VER)) return;
    if (!tienePermisoSesion(PERMISOS.COBROS_VER)) {
        const linkCobros = document.getElementById("link-cobros");
        if (linkCobros) {
            const anchor = linkCobros.closest('a');
            if (anchor) anchor.style.display = "none";
        }
    }
    document.getElementById('filtro_estado').addEventListener('change', cargarDatos);
    document.getElementById('filtro_fecha_desde').addEventListener('change', cargarDatos);
    document.getElementById('filtro_fecha_hasta').addEventListener('change', cargarDatos);
    document.getElementById('filtro_cliente').addEventListener('input', cargarDatos);
    cargarDatalistClientes();
    cargarDatos();
});
