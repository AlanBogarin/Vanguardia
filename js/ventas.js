/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalNVenta = new bootstrap.Modal(document.getElementById('modalNuevaVenta'));
const modalVerDet = new bootstrap.Modal(document.getElementById('modalVerDetalles'));

let detallesTemporales = [];

function formatoMoneda(valor) {
    return 'Gs. ' + Number(valor).toLocaleString('es-PY');
}

function obtenerSiguienteId(arr) {
    if (arr.length === 0) return 1;
    return Math.max(...arr.map(item => item.id)) + 1;
}

function cargarSelects() {
    const clientes = cargarClientes();
    const productos = cargarProductos().filter(p => p.active);
    
    let cliOptions = '<option value="">Seleccione un cliente...</option>';
    clientes.forEach(c => {
        cliOptions += `<option value="${c.id}">${c.name} ${c.last_name} (${c.document_number})</option>`;
    });
    document.getElementById("client_id").innerHTML = cliOptions;

    let prodOptions = '<option value="">Seleccione un producto...</option>';
    productos.forEach(p => {
        prodOptions += `<option value="${p.id}" data-precio="${p.sale_price}" data-stock="${p.stock}">${p.name} (Stock: ${p.stock})</option>`;
    });
    document.getElementById("producto_select").innerHTML = prodOptions;
}

function actualizarPrecioSugerido() {
    const prodSelect = document.getElementById("producto_select");
    const opt = prodSelect.options[prodSelect.selectedIndex];
    const precioInput = document.getElementById("precio_input");
    
    if (opt && opt.value !== "") {
        precioInput.value = opt.getAttribute("data-precio");
    } else {
        precioInput.value = "";
    }
}

function agregarDetalle() {
    const prodSelect = document.getElementById("producto_select");
    const cantidadInput = document.getElementById("cantidad_input");
    const precioInput = document.getElementById("precio_input");

    const producto_id = parseInt(prodSelect.value);
    const cantidad = parseFloat(cantidadInput.value);
    const precio = parseFloat(precioInput.value);

    if (isNaN(producto_id) || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
        alertify.error("Debe seleccionar un producto, ingresar una cantidad válida y un precio unitario.");
        return;
    }

    const opt = prodSelect.options[prodSelect.selectedIndex];
    const stockDisponible = parseFloat(opt.getAttribute("data-stock"));
    const productoName = opt.text.split(" (")[0];

    // Verificar cantidad ya agregada a la temporal
    let cantidadTotalDeseada = cantidad;
    const existente = detallesTemporales.find(d => d.product_id === producto_id);
    if (existente) {
        cantidadTotalDeseada += existente.quantity;
    }

    if (cantidadTotalDeseada > stockDisponible) {
        alertify.error(`Stock insuficiente. Stock actual: ${stockDisponible}`);
        return;
    }

    if (existente) {
        existente.quantity = cantidadTotalDeseada;
        // Precio unitario no cambia porque es de venta
        existente.subtotal = existente.quantity * existente.unit_price;
    } else {
        detallesTemporales.push({
            product_id: producto_id,
            productoName: productoName,
            quantity: cantidad,
            unit_price: precio,
            subtotal: cantidad * precio
        });
    }

    prodSelect.value = "";
    cantidadInput.value = "";
    precioInput.value = "";
    
    renderizarDetalles();
}

function eliminarDetalle(producto_id) {
    detallesTemporales = detallesTemporales.filter(d => d.product_id !== producto_id);
    renderizarDetalles();
}

function renderizarDetalles() {
    const tbody = document.querySelector("#tabla_detalles_venta tbody");
    tbody.innerHTML = "";
    let total = 0;

    detallesTemporales.forEach(det => {
        total += det.subtotal;
        tbody.innerHTML += `
            <tr>
                <td>${det.productoName}</td>
                <td>${det.quantity}</td>
                <td>${formatoMoneda(det.unit_price)}</td>
                <td>${formatoMoneda(det.subtotal)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarDetalle(${det.product_id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });

    document.getElementById("total_venta").textContent = formatoMoneda(total);
}

function guardarNuevaVenta(e) {
    e.preventDefault();
    const cliente_id = parseInt(document.getElementById("client_id").value);
    const tipo_pago = document.getElementById("payment_type").value;
    const obs = document.getElementById("obs").value.trim();

    if (isNaN(cliente_id)) {
        alertify.error("Debe seleccionar un cliente.");
        return;
    }

    if (detallesTemporales.length === 0) {
        alertify.error("Debe agregar al menos un producto a la venta.");
        return;
    }

    const ventas = cargarVentas();
    const nuevaVentaId = obtenerSiguienteId(ventas);
    let amount = detallesTemporales.reduce((acc, curr) => acc + curr.subtotal, 0);
    const currentUser = 1; // Asumimos usuario 1

    const nuevaVenta = {
        id: nuevaVentaId,
        client_id: cliente_id,
        user_id: currentUser,
        payment_type: tipo_pago,
        amount: amount,
        obs: obs,
        created_at: new Date(),
        updated_at: null
    };

    guardarVenta(nuevaVenta);

    const detallesBD = cargarVentaDetalles();
    let detalleId = obtenerSiguienteId(detallesBD);
    const productos = cargarProductos();

    detallesTemporales.forEach(det => {
        guardarVentaDetalle({
            id: detalleId++,
            sale_id: nuevaVentaId,
            product_id: det.product_id,
            quantity: det.quantity,
            unit_price: det.unit_price,
            subtotal: det.subtotal
        });

        // Actualizar stock del producto (restar)
        const p = productos.find(prod => prod.id === det.product_id);
        if (p) {
            p.stock -= det.quantity;
            p.updated_at = new Date();
            guardarProducto(p);
        }
    });

    // Generar Cuenta por Cobrar si es a CRÉDITO
    if (tipo_pago === 'CREDITO') {
        const cuentasCobrar = cargarCuentasPorCobrar();
        const vto = new Date();
        vto.setDate(vto.getDate() + 30); // 30 días de vencimiento por defecto

        guardarCuentaPorCobrar({
            id: obtenerSiguienteId(cuentasCobrar),
            sale_id: nuevaVentaId,
            client_id: cliente_id,
            amount_total: amount,
            amount_paid: 0,
            amount_due: amount,
            status: 'PENDIENTE',
            expire_at: vto,
            created_at: new Date(),
            updated_at: null
        });
        alertify.success("Venta a crédito guardada. Se generó Cuenta por Cobrar.");
    } else {
        alertify.success("Venta al contado registrada correctamente.");
    }

    // Reset Form
    e.target.reset();
    detallesTemporales = [];
    renderizarDetalles();
    cargarTablaVentas();
    cargarSelects(); // Refrescar stocks en el select
    modalNVenta.hide();
}

function verDetallesVenta(e) {
    if (e.target.closest('.btn-ver-detalles')) {
        const id = parseInt(e.target.closest('.btn-ver-detalles').dataset.id);
        const venta = cargarVenta(id);
        if (!venta) return;

        const clientes = cargarClientes();
        const usuarios = cargarUsuarios();
        
        const cli = clientes.find(c => c.id === venta.client_id);
        const user = usuarios.find(u => u.id === venta.user_id);

        document.getElementById("ver_venta_id").textContent = venta.id;
        document.getElementById("ver_cliente").textContent = cli ? `${cli.name} ${cli.last_name}` : 'Desconocido';
        document.getElementById("ver_usuario").textContent = user ? user.username : 'Desconocido';
        document.getElementById("ver_fecha").textContent = new Date(venta.created_at).toLocaleString();
        document.getElementById("ver_tipo_pago").textContent = venta.payment_type;
        document.getElementById("ver_obs").textContent = venta.obs || 'N/A';

        const detalles = cargarVentaDetalles().filter(d => d.sale_id === venta.id);
        const productos = cargarProductos();

        const tbody = document.querySelector("#tabla_ver_detalles tbody");
        tbody.innerHTML = "";
        
        detalles.forEach(det => {
            const p = productos.find(prod => prod.id === det.product_id);
            const pName = p ? p.name : 'Desconocido';
            tbody.innerHTML += `
                <tr>
                    <td>${pName}</td>
                    <td>${det.quantity}</td>
                    <td>${formatoMoneda(det.unit_price)}</td>
                    <td>${formatoMoneda(det.subtotal)}</td>
                </tr>
            `;
        });

        document.getElementById("ver_total_venta").textContent = formatoMoneda(venta.amount);
        modalVerDet.show();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    cargarSelects();
    cargarTablaVentas();

    document.getElementById("producto_select").addEventListener("change", actualizarPrecioSugerido);
    document.getElementById("btnAgregarDetalle").addEventListener("click", agregarDetalle);
    document.getElementById("formNuevaVenta").addEventListener("submit", guardarNuevaVenta);
    document.addEventListener("click", verDetallesVenta);
});

function cargarTablaVentas() {
    const clientes = cargarClientes();
    const usuarios = cargarUsuarios();

    const ventas = cargarVentas().map(v => {
        const cli = clientes.find(c => c.id === v.client_id);
        const u = usuarios.find(user => user.id === v.user_id);

        return {
            ...v,
            cliente_name: cli ? `${cli.name} ${cli.last_name}` : 'Desconocido',
            usuario_name: u ? u.username : 'Desconocido',
            total_fmt: formatoMoneda(v.amount),
            fecha_fmt: new Date(v.created_at).toLocaleString()
        };
    });

    if (tabla) {
        tabla.clear().rows.add(ventas).draw();
        return;
    }

    tabla = new DataTable("#tabla_ventas", {
        data: ventas,
        order: [[0, 'desc']],
        columns: [
            { data: 'id' },
            { data: 'cliente_name' },
            { data: 'usuario_name' },
            { data: 'payment_type' },
            { data: 'total_fmt' },
            { data: 'fecha_fmt' },
            {
                data: null,
                render: function (data, type, row) {
                    return `<button class="btn btn-sm btn-info btn-ver-detalles" data-id="${row.id}" title="Ver Detalles"><i class="bi bi-eye"></i></button>`;
                }
            }
        ],
        dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rtip',
        buttons: [
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
            }
        ],
        language: {
            url: "dt/es-ES.json"
        }
    });
}
