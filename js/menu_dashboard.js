/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

function formatoMoneda(valor) {
    return 'Gs. ' + renderMoneda(valor);
}

function cargarDatos() {
    // Si no hay sesión iniciada, no hacer nada
    if (!cargarSesion()) return;

    // CLIENTES
    const tieneClientesVer = tienePermisoSesion(PERMISOS.CLIENTES_VER);
    const cardClientes = document.getElementById("card_clientes_col");
    if (tieneClientesVer) {
        const clientes = cargarClientes();
        document.getElementById("kpi_clientes").textContent = clientes.length;
        if (cardClientes) cardClientes.classList.remove("d-none");
    } else {
        if (cardClientes) cardClientes.classList.add("d-none");
    }

    // PRODUCTOS & STOCK BAJO
    const tieneProductosVer = tienePermisoSesion(PERMISOS.PRODUCTOS_VER);
    const cardProductos = document.getElementById("card_productos_col");
    const panelBajoStock = document.getElementById("panel_bajo_stock");
    if (tieneProductosVer) {
        const productos = cargarProductos().filter(p => p.active);
        document.getElementById("kpi_productos").textContent = productos.length;
        if (cardProductos) cardProductos.classList.remove("d-none");

        // Tabla bajo stock
        const bajoStock = productos.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
        const tbodyBajoStock = document.getElementById("tabla_bajo_stock");
        if (tbodyBajoStock) {
            if (bajoStock.length === 0) {
                tbodyBajoStock.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">No hay productos con bajo stock.</td></tr>';
            } else {
                let rows = '';
                bajoStock.slice(0, 10).forEach(p => {
                    const badgeClass = p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark';
                    rows += `
                        <tr>
                            <td><code class="text-primary fw-bold">${p.code}</code></td>
                            <td>${p.name}</td>
                            <td><span class="badge ${badgeClass} px-2 py-1 fs-6">${p.stock}</span></td>
                        </tr>
                    `;
                });
                tbodyBajoStock.innerHTML = rows;
            }
        }
        if (panelBajoStock) panelBajoStock.classList.remove("d-none");
    } else {
        if (cardProductos) cardProductos.classList.add("d-none");
        if (panelBajoStock) panelBajoStock.classList.add("d-none");
    }

    // 3. VENTAS & ÚLTIMAS VENTAS
    const tieneVentasVer = tienePermisoSesion(PERMISOS.VENTAS_VER);
    const cardVentas = document.getElementById("card_ventas_col");
    const panelUltimasVentas = document.getElementById("panel_ultimas_ventas");
    if (tieneVentasVer) {
        const ventas = cargarVentas();
        const totalVentas = ventas.reduce((acc, v) => acc + v.amount, 0);
        document.getElementById("kpi_ventas").textContent = formatoMoneda(totalVentas);
        if (cardVentas) cardVentas.classList.remove("d-none");

        // Tabla últimas ventas
        const tbodyUltimasVentas = document.getElementById("tabla_ultimas_ventas");
        if (tbodyUltimasVentas) {
            if (ventas.length === 0) {
                tbodyUltimasVentas.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay ventas registradas.</td></tr>';
            } else {
                const ultimas = ventas.sort((a, b) => b.id - a.id).slice(0, 5);
                let rows = '';
                ultimas.forEach(v => {
                    const cli = cargarCliente(v.client_id);
                    const cliName = cli ? cli.legal_name : 'Desconocido';
                    rows += `
                        <tr>
                            <td><span class="badge bg-secondary">#${v.id}</span></td>
                            <td>${cliName}</td>
                            <td class="text-success fw-bold">${formatoMoneda(v.amount)}</td>
                            <td class="text-muted">${new Date(v.created_at).toLocaleDateString('es-PY')}</td>
                        </tr>
                    `;
                });
                tbodyUltimasVentas.innerHTML = rows;
            }
        }
        if (panelUltimasVentas) panelUltimasVentas.classList.remove("d-none");
    } else {
        if (cardVentas) cardVentas.classList.add("d-none");
        if (panelUltimasVentas) panelUltimasVentas.classList.add("d-none");
    }

    // 4. COMPRAS (Opcional)
    const tieneComprasVer = tienePermisoSesion(PERMISOS.COMPRAS_VER);
    const cardCompras = document.getElementById("card_compras_col");
    if (tieneComprasVer) {
        const compras = cargarCompras();
        const totalCompras = compras.reduce((acc, c) => acc + c.amount, 0);
        document.getElementById("kpi_compras").textContent = formatoMoneda(totalCompras);
        if (cardCompras) cardCompras.classList.remove("d-none");
    } else {
        if (cardCompras) cardCompras.classList.add("d-none");
    }

    // 5. CUENTAS POR COBRAR
    const tieneCobrarVer = tienePermisoSesion(PERMISOS.CUENTAS_COBRAR_VER);
    const cardCobrar = document.getElementById("card_cobrar_col");
    if (tieneCobrarVer) {
        const cuentasCobrar = cargarCuentasPorCobrar().filter(c => c.status !== ESTADO_COBRADA);
        const totalCobrar = cuentasCobrar.reduce((acc, c) => acc + c.amount_due, 0);
        document.getElementById("kpi_cobrar").textContent = formatoMoneda(totalCobrar);
        if (cardCobrar) cardCobrar.classList.remove("d-none");
    } else {
        if (cardCobrar) cardCobrar.classList.add("d-none");
    }

    // 6. CUENTAS POR PAGAR (Opcional)
    const tienePagarVer = tienePermisoSesion(PERMISOS.CUENTAS_PAGAR_VER);
    const cardPagar = document.getElementById("card_pagar_col");
    if (tienePagarVer) {
        const cuentasPagar = cargarCuentasPorPagar().filter(p => p.status !== ESTADO_PAGADA);
        const totalPagar = cuentasPagar.reduce((acc, p) => acc + p.amount_due, 0);
        document.getElementById("kpi_pagar").textContent = formatoMoneda(totalPagar);
        if (cardPagar) cardPagar.classList.remove("d-none");
    } else {
        if (cardPagar) cardPagar.classList.add("d-none");
    }

    // Ajustar anchos y visibilidad de las tablas si solo una es visible
    const tablesRow = document.getElementById("dashboard_tables_row");
    if (tablesRow) {
        const showBajoStock = tieneProductosVer && panelBajoStock;
        const showUltimasVentas = tieneVentasVer && panelUltimasVentas;

        if (!showBajoStock && !showUltimasVentas) {
            tablesRow.classList.add("d-none");
        } else {
            tablesRow.classList.remove("d-none");
            if (showBajoStock && !showUltimasVentas) {
                panelBajoStock.className = "col-xl-12 mb-4";
            } else if (!showBajoStock && showUltimasVentas) {
                panelUltimasVentas.className = "col-xl-12 mb-4";
            } else {
                panelBajoStock.className = "col-xl-6 col-12 mb-4";
                panelUltimasVentas.className = "col-xl-6 col-12 mb-4";
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

