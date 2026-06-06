/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 * 
 * @typedef {Object} DetalleTemporal
 */

const modalNCompra = new bootstrap.Modal(document.getElementById('modalNuevaCompra'));
const modalVerDetalle = new bootstrap.Modal(document.getElementById('modalVerDetalles'));

let _modalCuotas = null;
let _datosCompraTemp = null;
let _modalPagosMultiples = null;
const _pagosMultiplesTemp = [];

/** @type {DetalleTemporal[]} */
const detallesTemporales = [];

const tablaCompras = crearDataTable("tabla_compras", [
    ...TABLAS.COMPRA,
    { data: null, title: "DETALLES", subtable: TABLAS.COMPRA_DETALLE, render: data => cargarCompraDetalles(data.id) }
], {
    buttons: true, 
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE COMPRAS",
    actions: (compra) => ({
        edit: null,
        delete: null,
        enable: null,
        disable: null,
        customs: [
            {
                color: "btn-info btn-ver-detalles",
                content: "<i class=\"bi bi-eye\"></i>",
                properties: `onclick="onClickVerDetalles(${compra.id})"`,
                title: "Ver Detalles",
            }
        ]
    })
});

function onClickNuevaCompra() {
    const facturaElem = document.getElementById("invoice");
    const id = obtenerSiguienteId(cargarCompras());
    facturaElem.value = `001-001-${String(id).padStart(7, "0")}`;
    modalNCompra.show();
}

/**
 * @param {number} id 
 */
function onClickVerDetalles(id) {
    const compra = cargarCompra(id);
    if (!compra) {
        mensajeError(`La compra con ID ${id} no existe`);
        return;
    };
    const compraElem = document.getElementById("ver_compra_id");
    const proveedorElem = document.getElementById("ver_proveedor");
    const usuarioElem = document.getElementById("ver_usuario");
    const fechaElem = document.getElementById("ver_fecha");
    const condicionElem = document.getElementById("ver_condicion");
    const facturaElem = document.getElementById("ver_invoice");
    const timbradoElem = document.getElementById("ver_timbrado");
    const proveedor = cargarProveedor(compra.provider_id);
    const usuario = cargarUsuario(compra.user_id);
    compraElem.textContent = compra.id;
    proveedorElem.textContent = proveedor.legal_name;
    usuarioElem.textContent = usuario.username;
    fechaElem.textContent = renderFecha(compra.created_at);
    condicionElem.textContent = compra.condition;
    facturaElem.textContent = compra.invoice;
    timbradoElem.textContent = compra.stamping;

    const detalles = cargarCompraDetalles(compra.id);
    const productos = cargarProductos();

    const tbody = document.querySelector("#tabla_ver_detalles tbody");
    tbody.innerHTML = "";

    // AGREGA ESTAS 3 LÍNEAS PARA CONTABILIZAR EL IVA ABAJO:
    let verAcumExenta = 0;
    let verAcumIva5 = 0;
    let verAcumIva10 = 0;

    detalles.forEach(det => {
        const p = productos.find(prod => prod.id === det.product_id);
        const pName = p.name;
        const cant = det.quantity;
        let ivaTipo = det.iva;
        // Clasifica el subtotal según el tipo de IVA
        if (ivaTipo === 5) {
            verAcumIva5 += det.subtotal;
        } else if (ivaTipo === 10) {
            verAcumIva10 += det.subtotal;
        } else {
            verAcumExenta += det.subtotal;
        }
        const montoIva = Math.round((det.subtotal * ivaTipo) / 100);
        tbody.innerHTML += `
            <tr>
                <td>${pName}</td>
                <td class="text-center fw-bold">${cant}</td>
                <td>${renderMoneda(det.unit_price)}</td>
                <td class="text-center fw-bold text-secondary">${ivaTipo}%</td>
                <td class="text-center fw-bold text-info">${renderMoneda(montoIva)}</td>
                <td class="fw-bold">${renderMoneda(det.subtotal)}</td>
            </tr>
        `;
    });

    // Fórmulas matemáticas de liquidación de IVA
    const liquidacionVerIva5 = Math.round((verAcumIva5 * 5) / 100);
    const liquidacionVerIva10 = Math.round((verAcumIva10 * 10) / 100);

    // Inserta los totales en sus respectivas etiquetas del HTML
    const elTotal = document.getElementById("ver_total_compra");
    if (elTotal) elTotal.textContent = renderMoneda(compra.amount);

    const elExenta = document.getElementById("ver_total_exenta");
    if (elExenta) elExenta.textContent = renderMoneda(verAcumExenta);

    const elIva5 = document.getElementById("ver_total_iva5") || document.getElementById("total_ver_iva5");
    if (elIva5) elIva5.textContent = renderMoneda(liquidacionVerIva5);

    const elIva10 = document.getElementById("ver_total_iva10");
    if (elIva10) elIva10.textContent = renderMoneda(liquidacionVerIva10);

    const elIvaSum = document.getElementById("ver_total_iva_sum");
    if (elIvaSum) elIvaSum.textContent = renderMoneda(liquidacionVerIva5 + liquidacionVerIva10);

    modalVerDetalle.show();
}

function btnAgregarDetalle() {
    const cantidadInput = document.getElementById("cantidad_input");
    const precioInput = document.getElementById("precio_input");
    const buscarInput = document.getElementById("buscar_producto");
    const term = buscarInput.value.trim().toUpperCase();

    const productos = cargarProductos().filter(p => p.active);
    const productoData = productos.find(p => p.code && p.code.toString() === term)
        || productos.find(p => p.name.toUpperCase() === term)
        || productos.find(p => p.name.toUpperCase().includes(term));

    if (!productoData) {
        mensajeError("Debe seleccionar un producto válido.");
        buscarInput.focus();
        return false;
    }

    const cantidad = parseFloat(cantidadInput.value);
    const precio = parseFloat(precioInput.value);
    const tipoIva = parseInt(productoData.iva) || 0;

    const existente = detallesTemporales.find(d => d.product_id === productoData.id);
    if (existente) {
        existente.quantity += cantidad;
        existente.unit_price = precio; 
        existente.subtotal = existente.quantity * existente.unit_price;
    } else {
        detallesTemporales.push({
            product_id: productoData.id,
            productoName: productoData.name,
            quantity: cantidad,
            unit_price: precio,
            subtotal: cantidad * precio,
            iva: tipoIva
        });
    }

    buscarInput.value = "";
    cantidadInput.value = "";
    precioInput.value = "";
    document.getElementById("iva_select_manual").value = "";
    
    renderizarDetalles();
    return true;
}

function eliminarDetalle(producto_id) {
    pedir(
        "Código de Seguridad",
        "Ingrese el código de seguridad para eliminar este producto del detalle:",
        "",
        (evt, value) => {
            const empresa = cargarEmpresa();
            if (value === empresa.purchase_code) {
                detallesTemporales = detallesTemporales.filter(d => d.product_id !== producto_id);
                renderizarDetalles();
                mensajeSuccess("Producto eliminado del detalle.");
            } else {
                mensajeError("Código de seguridad incorrecto.");
            }
        },
        () => {}
    );
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
        if (det.iva === 5) {
            acumIva5 += det.subtotal;
        } else if (det.iva === 10) {
            acumIva10 += det.subtotal;
        } else {
            acumExenta += det.subtotal;
        }

        const montoIva = Math.round((det.subtotal * det.iva) / 100);
        tbody.innerHTML += `
            <tr>
                <td>${det.productoName}</td>
                <td class="text-center fw-bold">${det.quantity}</td>
                <td>${renderMoneda(det.unit_price)}</td>
                <td class="text-center fw-bold text-secondary">${det.iva}%</td>
                <td class="text-center fw-bold text-info">${renderMoneda(montoIva)}</td>
                <td class="fw-bold">${renderMoneda(det.subtotal)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarDetalle(${det.product_id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });

    // Fórmulas de liquidación de IVA
    const liquidacionIva5 = Math.round((acumIva5 * 5) / 100);
    const liquidacionIva10 = Math.round((acumIva10 * 10) / 100);

    // Muestra los resultados en el nuevo diseño del pie de tabla
    const elTotalCompra = document.getElementById("total_compra");
    if (elTotalCompra) elTotalCompra.textContent = renderMoneda(total);

    // const elTotalExenta = document.getElementById("total_exenta");
    // if (elTotalExenta) elTotalExenta.textContent = renderMoneda(acumExenta);

    const elTotalIva5 = document.getElementById("total_iva5");
    if (elTotalIva5) elTotalIva5.textContent = renderMoneda(liquidacionIva5);

    const elTotalIva10 = document.getElementById("total_iva10");
    if (elTotalIva10) elTotalIva10.textContent = renderMoneda(liquidacionIva10);

    const elTotalIvaSum = document.getElementById("total_iva_sum_nueva");
    if (elTotalIvaSum) elTotalIvaSum.textContent = renderMoneda(liquidacionIva5 + liquidacionIva10);
}

function btnGuardarNuevaCompra() {
    const proveedorElem = document.getElementById("provider_id");
    const proveedor = cargarProveedor(parseInt(proveedorElem.value));
    const condicionElem = document.getElementById("condition");
    const condicion = condicionElem.value;
    const facturaElem = document.getElementById("invoice");
    const factura = facturaElem.value.trim();
    const timbradoElem = document.getElementById("timbrado");
    const timbrado = timbradoElem.value.trim();
    const fechaElem = document.getElementById('fecha_compra');
    const fecha = new Date(fechaElem.value || new Date());
    const buscarProductoElem = document.getElementById("buscar_producto");
    if (!proveedor) {
        mensajeError("Debe seleccionar un proveedor.");
        proveedorElem.focus();
        return;
    } else if (!condicion) {
        mensajeError("La condicion es obligatoria");
        condicionElem.focus();
        return;
    } else if (!CONDICIONES.includes(condicion)) {
        mensajeError("Condición invalida");
        condicionElem.focus();
        return;
    } else if (!factura.match(REGEX_FACTURA)) {
        mensajeError("El número de factura debe tener el formato 000-000-000.");
        facturaElem.focus();
        return;
    } else if (cargarCompras().some(c => c.invoice === factura)) {
        mensajeError("Ya existe una compra con la misma factura");
        facturaElem.focus();
        return;
    } else if (!timbrado.match(REGEX_TIMBRADO)) {
        mensajeError("El número de timbrado debe tener 8 dígitos.");
        timbradoElem.focus();
        return;
    } else if (detallesTemporales.length === 0) {
        mensajeError("Debe agregar al menos un producto a la compra.");
        buscarProductoElem.focus();
        return;
    } else if (fecha > new Date()) {
        mensajeError('La fecha no puede ser futura.');
        fechaElem.focus();
        return;
    } else if (fecha < new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)) {
        mensajeError('Solo se permiten fechas de ayer o hoy.');
        fechaElem.focus();
        return;
    }
    const amount = detallesTemporales.reduce((acc, curr) => acc + curr.subtotal, 0);
    const mpElem = document.getElementById('metodo_pago');
    const metodo_pago = condicion === CONDICION_CONTADO && mpElem ? mpElem.value : null;

    _datosCompraTemp = {
        provider_id: proveedor.id,
        condicion,
        factura,
        timbrado,
        formattedFecha: fecha,
        amount,
        metodo_pago
    };

    if (condicion === CONDICION_CREDITO) {
        // Mostrar modal de cuotas antes de guardar
        if (!_modalCuotas) {
            _modalCuotas = new bootstrap.Modal(document.getElementById('modalConfigurarCuotas'));
        }
        document.getElementById('cuotas_total').value = `Gs. ${renderMoneda(amount)}`;
        document.getElementById('cuotas_cantidad').value = 3;
        document.getElementById('cuotas_tipo').value = 'MENSUAL';
        document.getElementById('cuotas_entrega').value = 0;
        document.getElementById('cuotas_primer_venc').value = '';
        previewCuotas();
        _modalCuotas.show();
    } else {
        // Contado: abrir modal de pagos múltiples
        abrirModalPagosMultiples();
    }
}


function habilitarBusquedaProveedor(habilitar) {
    const elBuscar = document.getElementById("buscar_proveedor");
    const elSelect = document.getElementById("provider_id");
    if (elBuscar) elBuscar.readOnly = !habilitar;
    if (elSelect) elSelect.disabled = !habilitar;
}

function onChangeProducto() {
    const ivaElem = document.getElementById("iva_select_manual");
    const cantidadElem = document.getElementById("cantidad_input");
    const precioElem = document.getElementById("precio_input");
    const select = document.getElementById("producto_select");
    const producto = cargarProducto(parseInt(select.value));
    if (!producto) return;
    ivaElem.value = producto.iva || "";
    cantidadElem.value = Math.max(producto.min_stock - producto.stock, 1);
    precioElem.value = producto.purchase_price;
}

// Buscar producto por nombre o código de barras (se asume que el campo del código de barras
function onInputProducto(event) {
    const term = event.target.value.trim().toUpperCase();
    if (!term) return;
    const productos = cargarProductos().filter(p => p.active);
    const exacto = productos.find(p => p.code && p.code.toString() === term);
    if (exacto) {
        document.getElementById('cantidad_input').value = Math.max(exacto.min_stock - exacto.stock, 1);
        document.getElementById('precio_input').value = exacto.purchase_price;
        document.getElementById('iva_select_manual').value = exacto.iva || '';
    }
}

function onKeydownProducto(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const buscarInput = document.getElementById('buscar_producto');
    const term = buscarInput.value.trim().toUpperCase();
    if (!term) return;

    const productos = cargarProductos().filter(p => p.active);
    const resultado = productos.find(p => p.code && (p.code.toString() === term || parseInt(p.code) === parseInt(term)))
        || productos.find(p => p.name.toUpperCase().includes(term));

    if (!resultado) {
        mensajeError("No se encontró ningún producto con: " + term);
        return;
    }

    document.getElementById('cantidad_input').value = Math.max(resultado.min_stock - resultado.stock, 1);
    document.getElementById('precio_input').value = resultado.purchase_price;
    document.getElementById('iva_select_manual').value = resultado.iva || '';

    const agregado = btnAgregarDetalle();
    if (agregado) {
        buscarInput.value = '';
        buscarInput.focus();
    }
}

// Filtrar solo números y guión en el campo de RUC
function filtrarSoloNumerosRUC(input) {
    input.value = input.value.replace(/[^0-9\-]/g, '');
}

// Filtrado Interactivo
function onInputProveedor() {
    const buscarElem = document.getElementById("buscar_proveedor");
    const datalistElem = document.getElementById('lista_proveedores');
    const proveedorElem = document.getElementById("provider_id");
    const nombreProveedorInput = document.getElementById('nombre_proveedor');
    const term = buscarElem.value.trim().toUpperCase();

    // Si el campo está vacío, limpiar nombre del proveedor y select
    if (!term) {
        proveedorElem.innerHTML = '<option value="">Seleccione un proveedor...</option>';
        datalistElem.innerHTML = '';
        if (nombreProveedorInput) nombreProveedorInput.value = '';
        return;
    }

    const proveedores = cargarProveedores().filter(p => p.active).filter(
        p => p.ruc.includes(term)).slice(0, 10);
    // select
    proveedorElem.innerHTML = '<option value="">Seleccione un proveedor...</option>'
        + proveedores.map(p => `<option value="${p.id}">${p.legal_name} (${p.ruc})</option>`).join("");
    // datalist
    datalistElem.innerHTML = proveedores.map(p => `<option value="${p.ruc}">${p.legal_name}</option>`).join("");
    //Si el usuario escribió un RUC exacto, selecciona automáticamente ese proveedor y completa el nombre.
    const rucMatch = proveedores.find(p => p.ruc === term);
    if (rucMatch) {
        proveedorElem.value = rucMatch.id;
        if (nombreProveedorInput) nombreProveedorInput.value = rucMatch.legal_name;
    } else if (!term) {
        if (nombreProveedorInput) nombreProveedorInput.value = '';
    }
}

function toggleMetodoPago() {
    const condicion = document.getElementById("condition").value;
    const divMetodoPago = document.getElementById("div_metodo_pago");
    const selectMetodoPago = document.getElementById("metodo_pago");
    if (condicion === "CONTADO") {
        if (divMetodoPago) divMetodoPago.classList.remove("d-none");
        if (selectMetodoPago) selectMetodoPago.setAttribute("required", "required");
    } else {
        if (divMetodoPago) divMetodoPago.classList.add("d-none");
        if (selectMetodoPago) selectMetodoPago.removeAttribute("required");
    }
}

function onShowModalNuevaCompra() {
    document.getElementById("buscar_proveedor").value = "";
    document.getElementById("nombre_proveedor").value = "";
    // Establecer restricciones de fecha: solo ayer y hoy.
    const fechaInput = document.getElementById('fecha_compra');
    if (fechaInput) {
        fechaInput.min = toISOLocalString(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0));
        fechaInput.max = toISOLocalString(new Date());
        //Establecer por defecto en hoy.
        fechaInput.value = toISOLocalString(new Date());
    }
    document.getElementById("condition").value = "CONTADO";
    const _mpEl = document.getElementById("metodo_pago");
    if (_mpEl) _mpEl.value = "EFECTIVO";
    toggleMetodoPago();
    habilitarBusquedaProveedor(true);
    cargarDatos();
}

function cargarDatos() {
    const proveedor = document.getElementById("filtro_proveedor").value.trim().toUpperCase();
    const tipoCondicion = document.getElementById("filtro_condicion").value.trim().toUpperCase();
    const fechaDesde = document.getElementById("filtro_fecha_desde").value.trim();
    const fechaHasta = document.getElementById("filtro_fecha_hasta").value.trim();
    const estadoPago = document.getElementById("filtro_estado_pago")?.value || "";
    // Restringir las fechas solo a ayer y hoy.
    const today = new Date();
    today.setHours(23,59,59,999);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);

    // Anular cualquier filtro de fecha proporcionado por el usuario para aplicar la restricción.
    const startLimit = yesterday;
    const endLimit = today;

    // Cargar y filtrar las compras dentro del rango de fechas permitido, luego ordenar por ID de forma descendente (las más recientes primero).
    cargarDataTable(tablaCompras, cargarCompras().filter(c => {
        const fechaCompra = new Date(c.created_at);
        const prov = cargarProveedor(c.provider_id);
        if (!prov || !prov.legal_name.includes(proveedor)) return false;
        if (tipoCondicion && c.condition !== tipoCondicion) return false;
        if (fechaDesde && fechaCompra < new Date(fechaDesde)) return false;
        if (fechaHasta && fechaCompra > new Date(fechaHasta + 'T23:59:59')) return false;
        if (estadoPago === 'CONTADO' && c.condition !== CONDICION_CONTADO) return false;
        if (estadoPago === 'CON_SALDO') {
            if (c.condition !== CONDICION_CREDITO) return false;
            const cuenta = cargarCuentaPorPagar(null, c.id);
            if (!cuenta || cuenta.status === ESTADO_PAGADA) return false;
        }
        if (estadoPago === 'PAGADAS') {
            if (c.condition !== CONDICION_CREDITO) return false;
            const cuenta = cargarCuentaPorPagar(null, c.id);
            if (!cuenta || cuenta.status !== ESTADO_PAGADA) return false;
        }
        return true;
    }));
    const selectProveedores = document.getElementById("provider_id");
    const proveedores = cargarProveedores().filter(p => p.active);
    selectProveedores.innerHTML = "<option value=\"\">Seleccione un proveedor...</option>"
        + proveedores.map(p => `<option value="${p.id}">${p.legal_name} (${p.ruc})</option>`).join("");
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.COMPRAS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.COMPRAS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
    document.getElementById('modalNuevaCompra').addEventListener('show.bs.modal', onShowModalNuevaCompra);
    // Agregar un listener (oyente) para completar automáticamente el nombre del proveedor cuando se seleccione mediante RUC o nombre.
    const providerSelect = document.getElementById('provider_id');
    const buscarProveedorInput = document.getElementById('buscar_proveedor');
    const nombreProveedorInput = document.getElementById('nombre_proveedor');
    providerSelect.addEventListener('change', () => {
        const prov = cargarProveedor(parseInt(providerSelect.value));
        if (prov) {
            buscarProveedorInput.value = prov.legal_name; // display provider name
            if (nombreProveedorInput) nombreProveedorInput.value = prov.legal_name; // auto-fill name field
        }
    });
    const buscarProdInput = document.getElementById('buscar_producto');
    if (buscarProdInput) {
        buscarProdInput.addEventListener('input', onInputProducto);
    }
});
let _modalSeleccionProveedor = null;

function abrirModalSeleccionProveedor() {
    if (!_modalSeleccionProveedor) {
        _modalSeleccionProveedor = new bootstrap.Modal(document.getElementById('modalSeleccionProveedor'));
    }
    document.getElementById('buscar_prov_modal').value = '';
    renderizarProveedoresModal(cargarProveedores().filter(p => p.active));
    _modalSeleccionProveedor.show();
}

function filtrarProveedoresModal() {
    const term = document.getElementById('buscar_prov_modal').value.trim().toUpperCase();
    const proveedores = cargarProveedores().filter(p => p.active).filter(p =>
        p.legal_name.toUpperCase().includes(term) || p.ruc.includes(term)
    );
    renderizarProveedoresModal(proveedores);
}

function renderizarProveedoresModal(proveedores) {
    const tbody = document.getElementById('tbody_modal_proveedores');
    if (!proveedores.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No se encontraron proveedores.</td></tr>';
        return;
    }
    tbody.innerHTML = proveedores.map(p => `
        <tr>
            <td>${escapeHTML(p.legal_name)}</td>
            <td>${escapeHTML(p.ruc)}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-success" onclick="seleccionarProveedorDesdeModal(${p.id})">
                    <i class="bi bi-check-lg"></i> Seleccionar
                </button>
            </td>
        </tr>
    `).join('');
}

function seleccionarProveedorDesdeModal(id) {
    const proveedor = cargarProveedor(id);
    if (!proveedor) {
        mensajeError('No se encontró el proveedor.');
        return;
    }
    document.getElementById('buscar_proveedor').value = proveedor.ruc;
    document.getElementById('nombre_proveedor').value = proveedor.legal_name;

    const providerSelect = document.getElementById('provider_id');
    let opt = providerSelect.querySelector(`option[value="${proveedor.id}"]`);
    if (!opt) {
        opt = document.createElement('option');
        opt.value = proveedor.id;
        opt.textContent = `${proveedor.legal_name} (${proveedor.ruc})`;
        providerSelect.appendChild(opt);
    }
    providerSelect.value = proveedor.id;

    if (_modalSeleccionProveedor) _modalSeleccionProveedor.hide();
}
let _modalSeleccionProducto = null;

function abrirModalSeleccionProducto() {
    if (!_modalSeleccionProducto) {
        _modalSeleccionProducto = new bootstrap.Modal(document.getElementById('modalSeleccionProducto'));
    }
    document.getElementById('buscar_prod_modal').value = '';
    renderizarProductosModal(cargarProductos().filter(p => p.active));
    _modalSeleccionProducto.show();
}

function filtrarProductosModal() {
    const term = document.getElementById('buscar_prod_modal').value.trim().toUpperCase();
    const productos = cargarProductos().filter(p => p.active).filter(p =>
        p.name.toUpperCase().includes(term) ||
        (p.code && p.code.toString().toUpperCase().includes(term))
    );
    renderizarProductosModal(productos);
}

/**
 * @param {Producto[]} productos 
 */
function renderizarProductosModal(productos) {
    const tbody = document.getElementById('tbody_modal_productos');
    if (!productos.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron productos.</td></tr>';
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${escapeHTML(p.name)}</td>
            <td>${p.code ? escapeHTML(p.code.toString()) : '-'}</td>
            <td class="text-center fw-bold">${renderNumber(p.stock)}</td>
            <td class="text-center fw-bold">${renderMoneda(p.purchase_price)}</td>
            <td class="text-center">${p.iva ? `${p.iva}%` : "EXENTA"}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-success" onclick="seleccionarProductoDesdeModal(${p.id})">
                    <i class="bi bi-check-lg"></i> Seleccionar
                </button>
            </td>
        </tr>
    `).join('');
}

function seleccionarProductoDesdeModal(id) {
    const producto = cargarProducto(id);
    if (!producto) {
        mensajeError('No se encontró el producto.');
        return;
    }

    // Llenar campos directamente
    document.getElementById('buscar_producto').value = producto.name;
    document.getElementById('cantidad_input').value = Math.max(producto.min_stock - producto.stock, 1);
    document.getElementById('precio_input').value = producto.purchase_price;
    document.getElementById('iva_select_manual').value = producto.iva || '';

    if (_modalSeleccionProducto) _modalSeleccionProducto.hide();
}
/**
 * Retorna la cantidad máxima de cuotas permitidas según la frecuencia (límite: 2 años).
 * @param {string} tipo - 'MENSUAL' | 'QUINCENAL' | 'SEMANAL'
 * @returns {number}
 */
function maxCuotasPorTipo(tipo) {
    switch (tipo) {
        case 'QUINCENAL': return 48;  // 2 años × 24 quincenas
        case 'SEMANAL':   return 104; // 2 años × 52 semanas
        default:          return 24;  // 2 años × 12 meses
    }
}

function previewCuotas() {
    const tipo = document.getElementById('cuotas_tipo').value;
    const maxCuotas = maxCuotasPorTipo(tipo);
    const inputCantidad = document.getElementById('cuotas_cantidad');
    const helpText = document.getElementById('cuotas_cantidad_help');
    // Actualizar atributo max e info de ayuda según la frecuencia
    inputCantidad.max = maxCuotas;
    if (helpText) {
        const labels = { MENSUAL: 'meses', QUINCENAL: 'quincenas', SEMANAL: 'semanas' };
        helpText.textContent = `Máx. ${maxCuotas} cuotas (2 años = ${maxCuotas} ${labels[tipo] || 'cuotas'})`;
    }
    // Corregir valor si supera el nuevo máximo
    let cantidad = parseInt(inputCantidad.value) || 1;
    if (cantidad > maxCuotas) {
        cantidad = maxCuotas;
        inputCantidad.value = maxCuotas;
    }
    let entrega = parseInt(document.getElementById('cuotas_entrega').value) || 0;
    const total_compra = _datosCompraTemp ? _datosCompraTemp.amount : 0;
    
    if (entrega > total_compra) {
        entrega = total_compra;
        document.getElementById('cuotas_entrega').value = entrega;
    }
    
    const aFinanciar = total_compra - entrega;
    document.getElementById('cuotas_total').value = `Gs. ${renderMoneda(aFinanciar)}`;

    const cuotas = generarCuotas(aFinanciar, cantidad);
    const tbody = document.getElementById('tbody_preview_cuotas');
    
    const primerVencElem = document.getElementById('cuotas_primer_venc');
    let fechaInicio = new Date();
    if (primerVencElem && primerVencElem.value) {
        fechaInicio = new Date(primerVencElem.value + 'T00:00:00'); 
    }

    tbody.innerHTML = cuotas.map((c, i) => {
        let venc;
        if (i === 0 && primerVencElem && primerVencElem.value) {
            venc = fechaInicio;
        } else if (primerVencElem && primerVencElem.value) {
            venc = calcularVencimiento(fechaInicio, i, tipo); 
        } else {
            venc = calcularVencimiento(fechaInicio, i + 1, tipo);
        }
        return `
            <tr>
                <td class="text-center fw-bold">${c.installment_number}</td>
                <td>Gs. ${renderMoneda(c.amount)}</td>
                <td>${renderDate(venc)}</td>
            </tr>
        `;
    }).join('');
}

function cancelarCuotas() {
    _datosCompraTemp = null;
    if (_modalCuotas) _modalCuotas.hide();
}

function confirmarCuotas() {
    const cantidad = parseInt(document.getElementById('cuotas_cantidad').value);
    const tipo = document.getElementById('cuotas_tipo').value;
    const maxCuotas = maxCuotasPorTipo(tipo);
    if (!cantidad || cantidad <= 0) {
        mensajeError("Debes ingresar la cantidad de cuotas");
        return;
    }
    if (cantidad > maxCuotas) {
        mensajeError(`El máximo permitido es ${maxCuotas} cuotas (2 años) para la frecuencia seleccionada.`);
        document.getElementById('cuotas_cantidad').focus();
        return;
    }
    const primerVencElem = document.getElementById('cuotas_primer_venc');
    if (primerVencElem && !primerVencElem.value) {
        mensajeError("Debes definir la fecha de vencimiento de las cuota");
        return;
    }

    if (_modalCuotas) _modalCuotas.hide();
    guardarCompraFinal();
}

function guardarCompraFinal() {
    const { provider_id, condicion, factura, timbrado, formattedFecha, amount } = _datosCompraTemp;
    const currentUser = cargarSesion()?.user_id || 1;
    const nuevaCompraId = obtenerSiguienteId(cargarCompras());

    guardarCompra({
        id: nuevaCompraId,
        provider_id,
        user_id: currentUser,
        condition: condicion,
        amount: amount,
        invoice: factura,
        stamping: timbrado,
        created_at: formattedFecha
    });

    // Guardar detalles y actualizar stock
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
            iva: det.iva,
            created_at: new Date()
        });
        const p = productos.find(prod => prod.id === det.product_id);
        if (p) {
            p.stock += det.quantity;
            p.updated_at = new Date();
            guardarProducto(p);
        }
    });

    if (condicion === CONDICION_CREDITO) {
        const cantidad = parseInt(document.getElementById('cuotas_cantidad').value) || 3;
        const tipo = document.getElementById('cuotas_tipo').value;
        const entrega = parseInt(document.getElementById('cuotas_entrega').value) || 0;
        const aFinanciar = amount - entrega;
        
        if (entrega > 0) {
            guardarPago({
                id: obtenerSiguienteId(cargarPagos()),
                installment_payable_id: null,
                purchase_id: nuevaCompraId,
                amount: entrega,
                payment_method: METODO_EFECTIVO,
                obs: `ENTREGA INICIAL COMPRA NRO ${nuevaCompraId}`,
                created_at: new Date()
            });
        }

        const cuentaId = obtenerSiguienteId(cargarCuentasPorPagar());

        guardarCuentaPorPagar({
            id: cuentaId,
            purchase_id: nuevaCompraId,
            provider_id,
            amount_total: aFinanciar,
            installments: cantidad,
            installment_type: tipo,
            status: ESTADO_PENDIENTE,
            created_at: new Date(),
            updated_at: null
        });

        // Generar cuotas
        const cuotas = generarCuotas(aFinanciar, cantidad);
        let cuotaId = obtenerSiguienteId(cargarCuotasPorPagar());
        
        const primerVencElem = document.getElementById('cuotas_primer_venc');
        let fechaInicio = new Date();
        if (primerVencElem && primerVencElem.value) {
            fechaInicio = new Date(primerVencElem.value + 'T00:00:00'); 
        }

        cuotas.forEach((c, i) => {
            let venc;
            if (i === 0 && primerVencElem && primerVencElem.value) {
                venc = fechaInicio;
            } else if (primerVencElem && primerVencElem.value) {
                venc = calcularVencimiento(fechaInicio, i, tipo); 
            } else {
                venc = calcularVencimiento(fechaInicio, i + 1, tipo);
            }
            guardarCuotaPorPagar({
                id: cuotaId++,
                account_payable_id: cuentaId,
                installment_number: c.installment_number,
                amount: c.amount,
                amount_paid: 0,
                status: ESTADO_PENDIENTE,
                due_date: venc,
                created_at: new Date(),
                updated_at: null
            });
        });

        mensajeSuccess(`Compra a crédito guardada. Se generaron ${cantidad} cuotas.`);
    } else {
        // Contado: guardar pagos múltiples
        if (_pagosMultiplesTemp.length > 0) {
            _pagosMultiplesTemp.forEach(pago => {
                guardarPago({
                    id: obtenerSiguienteId(cargarPagos()),
                    installment_payable_id: null,
                    purchase_id: nuevaCompraId,
                    amount: pago.amount,
                    payment_method: pago.method,
                    obs: `PAGO CONTADO COMPRA NRO ${nuevaCompraId} - ${pago.method}`,
                    created_at: new Date()
                });
            });
        } else {
            guardarPago({
                id: obtenerSiguienteId(cargarPagos()),
                installment_payable_id: null,
                purchase_id: nuevaCompraId,
                amount: amount,
                payment_method: _datosCompraTemp.metodo_pago || METODO_EFECTIVO,
                obs: `PAGO CONTADO COMPRA NRO ${nuevaCompraId}`,
                created_at: new Date()
            });
        }
        _pagosMultiplesTemp.splice(0);
        mensajeSuccess("Compra al contado registrada correctamente.");
    }

    _datosCompraTemp = null;
    detallesTemporales.splice(0);
    renderizarDetalles();
    cargarDatos();
    modalNCompra.hide();
}

// ======== PAGOS MÚLTIPLES CONTADO ========
function abrirModalPagosMultiples() {
    if (!_modalPagosMultiples) {
        _modalPagosMultiples = new bootstrap.Modal(document.getElementById('modalPagosMultiples'));
    }
    _pagosMultiplesTemp.splice(0);
    const total = _datosCompraTemp ? _datosCompraTemp.amount : 0;
    document.getElementById('pagos_total').textContent = `Gs. ${renderMoneda(total)}`;
    document.getElementById('pagos_monto_input').value = '';
    // Reset payment method selector
    const metodoInput = document.getElementById('pagos_metodo_input');
    if (metodoInput) metodoInput.value = '';
    renderizarPagosMultiples();
    _modalPagosMultiples.show();
}

function agregarPagoMultiple() {
    const metodo = document.getElementById('pagos_metodo_input').value;
    const monto = parseInt(document.getElementById('pagos_monto_input').value) || 0;
    const total = _datosCompraTemp ? _datosCompraTemp.amount : 0;

    if (!metodo) {
        mensajeError('Seleccione el metodo de pago');
        return;
    }

    if (monto <= 0) {
        mensajeError('El monto debe ser mayor a 0.');
        return;
    }

    const pagado = _pagosMultiplesTemp.reduce((acc, p) => acc + p.amount, 0);
    const saldo = total - pagado;

    if (monto > saldo) {
        mensajeError(`El monto excede el saldo restante de Gs. ${renderMoneda(saldo)}`);
        return;
    }

    // Add the payment to the list
    _pagosMultiplesTemp.push({ method: metodo, amount: monto });

    // Reset method selector after adding payment
    const metodoInput = document.getElementById('pagos_metodo_input');
    if (metodoInput) metodoInput.value = '';

    // Update UI
    renderizarPagosMultiples();

    // Pre-fill remaining balance in the amount input
    const nuevoPagado = _pagosMultiplesTemp.reduce((acc, p) => acc + p.amount, 0);
    const nuevoSaldo = total - nuevoPagado;
    document.getElementById('pagos_monto_input').value = nuevoSaldo > 0 ? nuevoSaldo : '';
}



function eliminarPagoMultiple(index) {
    _pagosMultiplesTemp.splice(index, 1);
    renderizarPagosMultiples();
    const total = _datosCompraTemp ? _datosCompraTemp.amount : 0;
    const pagado = _pagosMultiplesTemp.reduce((acc, p) => acc + p.amount, 0);
    document.getElementById('pagos_monto_input').value = total - pagado > 0 ? total - pagado : '';
}

function renderizarPagosMultiples() {
    const total = _datosCompraTemp ? _datosCompraTemp.amount : 0;
    const pagado = _pagosMultiplesTemp.reduce((acc, p) => acc + p.amount, 0);
    const saldo = total - pagado;

    document.getElementById('pagos_abonado').textContent = `Gs. ${renderMoneda(pagado)}`;
    document.getElementById('pagos_saldo').textContent = `Gs. ${renderMoneda(saldo)}`;

    const tbody = document.getElementById('tbody_pagos_multiples');
    const metodoLabels = {
        'EFECTIVO': 'Efectivo',
        'TRANSFERENCIA': 'Transferencia Bancaria',
        'TARJETA_CREDITO': 'Tarjeta de Crédito',
        'TARJETA_DEBITO': 'Tarjeta de Débito',
        'CHEQUE': 'Cheque',
        'QR': 'Pago QR'
    };

    if (_pagosMultiplesTemp.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No se agregaron pagos aún.</td></tr>';
    } else {
        tbody.innerHTML = _pagosMultiplesTemp.map((p, i) => `
            <tr>
                <td>${metodoLabels[p.method] || p.method}</td>
                <td class="fw-bold">Gs. ${renderMoneda(p.amount)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarPagoMultiple(${i})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    const btnConfirmar = document.getElementById('btn_confirmar_pagos');
    if (btnConfirmar) btnConfirmar.disabled = (saldo !== 0);
}

function cancelarPagosMultiples() {
    _pagosMultiplesTemp.splice(0);
    _datosCompraTemp = null;
    if (_modalPagosMultiples) _modalPagosMultiples.hide();
}

function confirmarPagosMultiples() {
    const total = _datosCompraTemp ? _datosCompraTemp.amount : 0;
    const pagado = _pagosMultiplesTemp.reduce((acc, p) => acc + p.amount, 0);
    if (pagado !== total) {
        mensajeError(`El total pagado (Gs. ${renderMoneda(pagado)}) no coincide con el total (Gs. ${renderMoneda(total)}).`);
        return;
    }
    if (_modalPagosMultiples) _modalPagosMultiples.hide();
    guardarCompraFinal();
}