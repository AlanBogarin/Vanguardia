/** @typedef {import('./bd')} */

function formatoMoneda(valor) {
    return 'Gs. ' + Number(valor).toLocaleString('es-PY');
}

function cargarDashboard() {
    const clientes = cargarClientes();
    const productos = cargarProductos().filter(p => p.active);
    const ventas = cargarVentas();
    const cuentasCobrar = cargarCuentasPorCobrar().filter(c => c.status !== 'COBRADA');

    // KPIs
    document.getElementById("kpi_clientes").textContent = clientes.length;
    document.getElementById("kpi_productos").textContent = productos.length;

    const totalVentas = ventas.reduce((acc, v) => acc + v.amount, 0);
    document.getElementById("kpi_ventas").textContent = formatoMoneda(totalVentas);

    const totalCobrar = cuentasCobrar.reduce((acc, c) => acc + c.amount_due, 0);
    document.getElementById("kpi_cobrar").textContent = formatoMoneda(totalCobrar);

    // Bajo Stock
    const bajoStock = productos.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);
    const tbodyBajoStock = document.getElementById("tabla_bajo_stock");
    if (bajoStock.length === 0) {
        tbodyBajoStock.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay productos con bajo stock.</td></tr>';
    } else {
        let rows = '';
        bajoStock.slice(0, 10).forEach(p => {
            const badgeClass = p.stock === 0 ? 'bg-danger' : 'bg-warning text-dark';
            rows += `
                <tr>
                    <td>${p.code}</td>
                    <td>${p.name}</td>
                    <td><span class="badge ${badgeClass}">${p.stock}</span></td>
                </tr>
            `;
        });
        tbodyBajoStock.innerHTML = rows;
    }

    // Últimas Ventas
    const tbodyUltimasVentas = document.getElementById("tabla_ultimas_ventas");
    if (ventas.length === 0) {
        tbodyUltimasVentas.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay ventas registradas.</td></tr>';
    } else {
        // Ordenar por ID descendente
        const ultimas = ventas.sort((a, b) => b.id - a.id).slice(0, 5);
        let rows = '';
        ultimas.forEach(v => {
            const cli = cargarCliente(v.client_id);
            const cliName = cli ? `${cli.legal_name}` : 'Desconocido';
            rows += `
                <tr>
                    <td>#${v.id}</td>
                    <td>${cliName}</td>
                    <td>${formatoMoneda(v.amount)}</td>
                    <td>${new Date(v.created_at).toLocaleDateString()}</td>
                </tr>
            `;
        });
        tbodyUltimasVentas.innerHTML = rows;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDashboard();
});
