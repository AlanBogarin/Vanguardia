/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalNCompra = new bootstrap.Modal(document.getElementById('modalNuevaCompra'));
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
    const proveedores = cargarProveedores();
    const productos = cargarProductos().filter(p => p.active);
    
    let provOptions = '<option value="">Seleccione un proveedor...</option>';
    proveedores.forEach(p => {
        provOptions += `<option value="${p.id}">${p.name} (${p.ruc})</option>`;
    });
    document.getElementById("provider_id").innerHTML = provOptions;

    let prodOptions = '<option value="">Seleccione un producto...</option>';
    productos.forEach(p => {
        prodOptions += `<option value="${p.id}" data-precio="${p.sale_price}">${p.name} (Stock: ${p.stock})</option>`;
    });
    document.getElementById("producto_select").innerHTML = prodOptions;
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

    const productoName = prodSelect.options[prodSelect.selectedIndex].text.split(" (")[0];

    const existente = detallesTemporales.find(d => d.product_id === producto_id);
    if (existente) {
        existente.quantity += cantidad;
        existente.unit_price = precio; // Actualizar precio al último ingresado
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
    const tbody = document.querySelector("#tabla_detalles_compra tbody");
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

    document.getElementById("total_compra").textContent = formatoMoneda(total);
}

function guardarNuevaCompra(e) {
    e.preventDefault();
    const proveedor_id = parseInt(document.getElementById("provider_id").value);
    const tipo_pago = document.getElementById("payment_type").value;
    const obs = document.getElementById("obs").value.trim();

    if (isNaN(proveedor_id)) {
        alertify.error("Debe seleccionar un proveedor.");
        return;
    }

    if (detallesTemporales.length === 0) {
        alertify.error("Debe agregar al menos un producto a la compra.");
        return;
    }

    const compras = cargarCompras();
    const nuevaCompraId = obtenerSiguienteId(compras);
    let amount = detallesTemporales.reduce((acc, curr) => acc + curr.subtotal, 0);
    const currentUser = 1; // Asumimos usuario 1 por ahora hasta que haya sesión

    const nuevaCompra = {
        id: nuevaCompraId,
        provider_id: proveedor_id,
        user_id: currentUser,
        payment_type: tipo_pago,
        amount: amount,
        obs: obs,
        created_at: new Date(),
        updated_at: null
    };

    guardarCompra(nuevaCompra);

    const detallesBD = cargarCompraDetalles();
    let detalleId = obtenerSiguienteId(detallesBD);
    const productos = cargarProductos();

    detallesTemporales.forEach(det => {
        guardarCompraDetalle({
            id: detalleId++,
            purchase_id: nuevaCompraId,
            product_id: det.product_id,
            quantity: det.quantity,
            unit_price: det.unit_price,
            subtotal: det.subtotal
        });

        // Actualizar stock del producto
        const p = productos.find(prod => prod.id === det.product_id);
        if (p) {
            p.stock += det.quantity;
            p.updated_at = new Date();
            guardarProducto(p);
        }
    });

    // Generar Cuenta por Pagar si es a CRÉDITO
    if (tipo_pago === 'CREDITO') {
        const cuentasPagar = cargarCuentasPorPagar();
        const vto = new Date();
        vto.setDate(vto.getDate() + 30); // 30 días de vencimiento por defecto

        guardarCuentaPorPagar({
            id: obtenerSiguienteId(cuentasPagar),
            purchase_id: nuevaCompraId,
            provider_id: proveedor_id,
            amount_total: amount,
            amount_paid: 0,
            amount_due: amount,
            status: 'PENDIENTE',
            expire_at: vto,
            created_at: new Date(),
            updated_at: null
        });
        alertify.success("Compra a crédito guardada. Se generó Cuenta por Pagar.");
    } else {
        alertify.success("Compra al contado registrada correctamente.");
    }

    // Reset Form
    e.target.reset();
    detallesTemporales = [];
    renderizarDetalles();
    cargarTablaCompras();
    modalNCompra.hide();
}

function verDetallesCompra(e) {
    if (e.target.closest('.btn-ver-detalles')) {
        const id = parseInt(e.target.closest('.btn-ver-detalles').dataset.id);
        const compra = cargarCompra(id);
        if (!compra) return;

        const proveedores = cargarProveedores();
        const usuarios = cargarUsuarios();
        
        const prov = proveedores.find(p => p.id === compra.provider_id);
        const user = usuarios.find(u => u.id === compra.user_id);

        document.getElementById("ver_compra_id").textContent = compra.id;
        document.getElementById("ver_proveedor").textContent = prov ? prov.name : 'Desconocido';
        document.getElementById("ver_usuario").textContent = user ? user.username : 'Desconocido';
        document.getElementById("ver_fecha").textContent = new Date(compra.created_at).toLocaleString();
        document.getElementById("ver_tipo_pago").textContent = compra.payment_type;
        document.getElementById("ver_obs").textContent = compra.obs || 'N/A';

        const detalles = cargarCompraDetalles().filter(d => d.purchase_id === compra.id);
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

        document.getElementById("ver_total_compra").textContent = formatoMoneda(compra.amount);
        modalVerDet.show();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    cargarSelects();
    cargarTablaCompras();

    document.getElementById("btnAgregarDetalle").addEventListener("click", agregarDetalle);
    document.getElementById("formNuevaCompra").addEventListener("submit", guardarNuevaCompra);
    document.addEventListener("click", verDetallesCompra);

    // Sugerir precio al seleccionar producto (opcional, para ayudar al usuario)
    document.getElementById("producto_select").addEventListener("change", function(e) {
        const opt = this.options[this.selectedIndex];
        if (opt && opt.value !== "") {
            // Se asume que en la compra ingresamos nosotros el precio de costo, pero podemos prellenarlo con algo si quisieramos
            // document.getElementById("precio_input").value = opt.getAttribute("data-precio");
        }
    });
});

function cargarTablaCompras() {
    const proveedores = cargarProveedores();
    const usuarios = cargarUsuarios();

    const compras = cargarCompras().map(c => {
        const prov = proveedores.find(p => p.id === c.provider_id);
        const u = usuarios.find(user => user.id === c.user_id);

        return {
            ...c,
            proveedor_name: prov ? prov.name : 'Desconocido',
            usuario_name: u ? u.username : 'Desconocido',
            total_fmt: formatoMoneda(c.amount),
            fecha_fmt: new Date(c.created_at).toLocaleString()
        };
    });

    if (tabla) {
        tabla.clear().rows.add(compras).draw();
        return;
    }

    tabla = new DataTable("#tabla_compras", {
        data: compras,
        order: [[0, 'desc']],
        columns: [
            { data: 'id' },
            { data: 'proveedor_name' },
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
