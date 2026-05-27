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
        const name = p.legal_name || p.name || 'Proveedor';
        provOptions += `<option value="${p.id}">${name} (${p.ruc})</option>`;
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

    // Leemos directamente el tipo de IVA seleccionado por el usuario en el combo
    const tipoIva = parseInt(document.getElementById("iva_select_manual").value) || 0;

    const existente = detallesTemporales.find(d => d.product_id === producto_id);
    if (existente) {
        existente.quantity += cantidad;
        existente.unit_price = precio; 
        existente.subtotal = existente.quantity * existente.unit_price;
    } else {
        detallesTemporales.push({
            product_id: producto_id,
            productoName: productoName,
            quantity: cantidad,
            unit_price: precio,
            subtotal: cantidad * precio,
            iva_tipo: tipoIva // <-- Guardamos el IVA en el carrito temporal
        });
    }

    prodSelect.value = "";
    cantidadInput.value = "";
    precioInput.value = "";
    document.getElementById("iva_select_manual").value = "10"; // Vuelve a dejarlo en 10% por defecto
    
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
    let acumExenta = 0; 
    let acumIva5 = 0;   
    let acumIva10 = 0;  

    detallesTemporales.forEach(det => {
        total += det.subtotal;

        // Clasifica los subtotales según el IVA del producto
        if (det.iva_tipo === 5) {
            acumIva5 += det.subtotal;
        } else if (det.iva_tipo === 10) {
            acumIva10 += det.subtotal;
        } else {
            acumExenta += det.subtotal;
        }

        tbody.innerHTML += `
            <tr>
                <td>${det.productoName}</td>
                <td class="text-center fw-bold">${det.quantity}</td>
                <td>${formatoMoneda(det.unit_price)}</td>
                <!-- Nueva columna visual de IVA por fila -->
                <td class="text-center fw-bold text-secondary">${det.iva_tipo}%</td>
                <td class="fw-bold">${formatoMoneda(det.subtotal)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarDetalle(${det.product_id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });

    // Fórmulas de liquidación de IVA de Paraguay
    const liquidacionIva5 = Math.round(acumIva5 / 21);
    const liquidacionIva10 = Math.round(acumIva10 / 11);

    // Muestra los resultados en el nuevo diseño del pie de tabla
    document.getElementById("total_compra").textContent = formatoMoneda(total);
    document.getElementById("total_exenta").textContent = formatoMoneda(acumExenta);
    document.getElementById("total_iva5").textContent = formatoMoneda(liquidacionIva5);
    document.getElementById("total_iva10").textContent = formatoMoneda(liquidacionIva10);
}



function guardarNuevaCompra(e) {
    e.preventDefault();
    const proveedor_id = parseInt(document.getElementById("provider_id").value);
    const tipo_pago = document.getElementById("payment_type").value;
    const invoice = document.getElementById("invoice").value.trim();

    if (isNaN(proveedor_id)) {
        alertify.error("Debe seleccionar un proveedor.");
        return;
    }

    const regexInvoice = /^\d{3}-\d{3}-\d{7}$/;
    if (!regexInvoice.test(invoice)) {
        alertify.error("El número de factura debe tener el formato 000-000-0000000.");
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
        invoice: invoice,
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
            subtotal: det.subtotal,
            iva_tipo: det.iva_tipo // <-- AGREGA ESTA LÍNEA AQUÍ
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
    cargarSelects(); // Recargar opciones por defecto y resetear filtrado
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

        const elId = document.getElementById("ver_compra_id");
        const elProv = document.getElementById("ver_proveedor");
        const elUser = document.getElementById("ver_usuario");
        const elFecha = document.getElementById("ver_fecha");
        const elPago = document.getElementById("ver_tipo_pago");
        const elInvoice = document.getElementById("ver_invoice");

        if (elId) elId.textContent = compra.id;
        if (elProv) elProv.textContent = prov ? (prov.legal_name || prov.name || 'Proveedor') : 'Desconocido';
        if (elUser) elUser.textContent = user ? user.username : 'Desconocido';
        if (elFecha) elFecha.textContent = new Date(compra.created_at).toLocaleString();
        if (elPago) elPago.textContent = compra.payment_type;
        if (elInvoice) elInvoice.textContent = compra.invoice || 'SIN FACTURA';

        const detalles = cargarCompraDetalles().filter(d => d.purchase_id === compra.id);
        const productos = cargarProductos();

        const tbody = document.querySelector("#tabla_ver_detalles tbody");
        tbody.innerHTML = "";

        // AGREGA ESTAS 3 LÍNEAS PARA CONTABILIZAR EL IVA ABAJO:
        let verAcumExenta = 0;
        let verAcumIva5 = 0;
        let verAcumIva10 = 0;

    detalles.forEach(det => {
        const p = productos.find(prod => prod.id === det.product_id);
        const pName = p ? p.name : 'Desconocido';
        
        // Garantizamos leer la cantidad real (corrige el error de que salga 0)
        const cant = det.quantity !== undefined ? det.quantity : (det.amount || 1); 

        // Si es una compra vieja sin IVA, lo busca del producto actual
        let ivaTipo = det.iva_tipo;
        if (ivaTipo === undefined || ivaTipo === null) {
            ivaTipo = p ? parseInt(p.iva) : 0;
        }

        // Clasifica el subtotal según el tipo de IVA
        if (ivaTipo === 5) {
            verAcumIva5 += det.subtotal;
        } else if (ivaTipo === 10) {
            verAcumIva10 += det.subtotal;
        } else {
            verAcumExenta += det.subtotal;
        }

        tbody.innerHTML += `
            <tr>
                <td>${pName}</td>
                <td class="text-center fw-bold">${cant}</td>
                <td>${formatoMoneda(det.unit_price)}</td>
                <td class="text-center fw-bold text-secondary">${ivaTipo}%</td> <td class="fw-bold">${formatoMoneda(det.subtotal)}</td>
            </tr>
        `;
    });

        // Fórmulas matemáticas de liquidación de IVA
        const liquidacionVerIva5 = Math.round(verAcumIva5 / 21);
        const liquidacionVerIva10 = Math.round(verAcumIva10 / 11);

        // Inserta los totales en sus respectivas etiquetas del HTML
        const elTotal = document.getElementById("ver_total_compra");
        if (elTotal) elTotal.textContent = formatoMoneda(compra.amount);

        const elExenta = document.getElementById("ver_total_exenta");
        if (elExenta) elExenta.textContent = formatoMoneda(verAcumExenta);

        const elIva5 = document.getElementById("ver_total_iva5") || document.getElementById("total_ver_iva5");
        if (elIva5) elIva5.textContent = formatoMoneda(liquidacionVerIva5);

        const elIva10 = document.getElementById("ver_total_iva10");
        if (elIva10) elIva10.textContent = formatoMoneda(liquidacionVerIva10);

        // Abre la ventana flotante pase lo que pase
        modalVerDet.show();
    }
}

function habilitarBusquedaProveedor(habilitar) {
    const elBuscar = document.getElementById("buscar_proveedor");
    const elSelect = document.getElementById("provider_id");
    if (elBuscar) elBuscar.readOnly = !habilitar;
    if (elSelect) elSelect.disabled = !habilitar;
}

document.addEventListener('DOMContentLoaded', function () {
    cargarSelects();
    cargarTablaCompras();

    document.getElementById("btnAgregarDetalle").addEventListener("click", agregarDetalle);
    document.getElementById("formNuevaCompra").addEventListener("submit", guardarNuevaCompra);
    document.addEventListener("click", verDetallesCompra);

    // Filtrado interactivo de proveedor
    const elBuscarProv = document.getElementById("buscar_proveedor");
    if (elBuscarProv) {
        elBuscarProv.addEventListener("input", function () {
            const term = this.value.toLowerCase().trim();
            const proveedores = cargarProveedores();
            let provOptions = '<option value="">Seleccione un proveedor...</option>';
            proveedores.forEach(p => {
                const name = p.legal_name || p.name || 'Proveedor';
                const ruc = p.ruc || '';
                if (name.toLowerCase().includes(term) || ruc.toLowerCase().includes(term)) {
                    provOptions += `<option value="${p.id}">${name} (${ruc})</option>`;
                }
            });
            document.getElementById("provider_id").innerHTML = provOptions;
        });
    }

    // Al abrir el modal de nueva compra, asegurar que el buscador está activo y limpio
    const elModalNCompra = document.getElementById('modalNuevaCompra');
    if (elModalNCompra) {
        elModalNCompra.addEventListener('show.bs.modal', function () {
            const elBuscar = document.getElementById("buscar_proveedor");
            if (elBuscar) elBuscar.value = "";
            habilitarBusquedaProveedor(true);
            cargarSelects();
        });
    }
});
function cargarTablaCompras() {
    const proveedores = cargarProveedores();
    const usuarios = cargarUsuarios();

    const compras = cargarCompras().map(c => {
    const prov = proveedores.find(p => p.id === c.provider_id);
    const u = usuarios.find(user => user.id === c.user_id);

    // Buscamos los detalles de esta compra para obtener los distintos tipos de IVA aplicados
    const detallesBD = cargarCompraDetalles().filter(d => d.purchase_id === c.id);
    const productosBD = cargarProductos();
    
    let ivasPresentes = [];
    detallesBD.forEach(det => {
        const p = productosBD.find(prod => prod.id === det.product_id);
        let ivaTipo = det.iva_tipo !== undefined ? det.iva_tipo : (p ? parseInt(p.iva) : 0);
        if (!ivasPresentes.includes(ivaTipo)) {
            ivasPresentes.push(ivaTipo);
        }
    });

    // Ordenar de mayor a menor (ej. 10%, luego 5%, luego 0)
    ivasPresentes.sort((a, b) => b - a);

    // Formatear como porcentaje o "Exenta"
    let ivaTexto = ivasPresentes.map(iva => iva === 0 ? "Exenta" : iva + "%").join(", ");
    if (ivasPresentes.length === 0) {
        ivaTexto = "-";
    }

    return {
        ...c,
        proveedor_name: prov ? (prov.legal_name || prov.name) : 'Desconocido',
        usuario_name: u ? u.username : 'Desconocido',
        iva_fmt: ivaTexto, // <-- Ahora guardamos el texto de los tipos de IVA aplicados
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
            { data: 'iva_fmt' }, 
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
        // ... dentro de la función cargarTablaCompras ...
        // Busca esta parte en tu archivo compras.js y ajústala:

        // ... dentro de la función cargarTablaCompras ...
       buttons: [
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
                className: 'btn btn-info'
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
                className: 'btn btn-success'
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
                className: 'btn btn-danger'
            }
        ],
        // ... resto del código
// ... resto del código
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json"
        }
    });
}
