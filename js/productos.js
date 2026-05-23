/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

const modalNuevo = new bootstrap.Modal(document.getElementById("modalNuevoProducto"));
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarProducto"));
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminarProducto"));

const tablaProductos = crearDataTable("tabla_productos", [
    { data: "id", title: "Id Producto", render: renderRaw },
    { data: "code", title: "Código de Barra", render: renderString },
    { data: "name", title: "Nombre", render: renderString },
    { data: "purchase_price", title: "Precio de Compra", render: renderMoneda },
    { data: "selling_price", title: "Precio de Venta", render: renderMoneda },
    { data: null, title: "Stock", render: renderStock },
    { data: "active", title: "Activo", render: renderBoolean }
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE PRODUCTOS",
    actions: tienePermisoSesion(PERMISOS.PRODUCTOS_EDITAR) ? (producto) => {
        const anulable = cargarCompraDetalles().some(d => d.product_id === producto.id) ||
            cargarVentaDetalles().some(d => d.product_id === producto.id);
        return {
            edit: `ventanaEditarProducto(${producto.id})`,
            delete: anulable ? null : `ventanaEliminarProducto(${producto.id})`,
            enable: anulable && !producto.active ? `ventanaHabilitarProducto(${producto.id})` : null,
            disable: anulable && producto.active ? `ventanaAnularProducto(${producto.id})` : null
        };
    } : null
}
);

/**
 * 
 * @param {Producto} producto 
 * @returns {string}
 */
function renderStock(producto) {
    const clase = producto.stock <= producto.min_stock ? "bg-danger" : "bg-success";
    return `<span class="badge ${clase}">${producto.stock}</span>`;
}

function ventanaNuevoProducto() {
    if (!tienePermisoSesion(PERMISOS.PRODUCTOS_CREAR)) {
        mensajeError("No tienes permiso para crear productos");
        return;
    }
    const categoriaElem = document.getElementById("new_category_id");
    const marcaElem = document.getElementById("new_brand_id");
    if (categoriaElem) categoriaElem.innerHTML = '<option value="">Seleccione Categoría</option>'
        + cargarCategorias().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    if (marcaElem) marcaElem.innerHTML = '<option value="">Seleccione Marca</option>'
        + cargarMarcas().map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    modalNuevo.show();
}

function btnGuardarProducto() {
    const codigobarraElem = document.getElementById("new_code");
    const codigobarra = codigobarraElem.value.trim();
    const nombreElem = document.getElementById("new_name");
    const nombre = nombreElem.value.trim().toUpperCase();
    const descripcionElem = document.getElementById("new_description");
    const descripcion = descripcionElem.value.trim().toUpperCase();
    const precioCompraElem = document.getElementById("new_purchase_price");
    const precioCompra = precioCompraElem.value.trim();
    const precioVentaElem = document.getElementById("new_selling_price");
    const precioVenta = precioVentaElem.value.trim();
    const stockMinimoElem = document.getElementById("new_min_stock");
    const stockMinimo = stockMinimoElem.value.trim();
    const categoriaElem = document.getElementById("new_category_id");
    const categoria = categoriaElem.value.trim();
    const marcaElem = document.getElementById("new_brand_id");
    const marca = marcaElem.value.trim();
    const ivaElem = document.getElementById("new_iva");
    const iva = ivaElem.value.trim();
    if (!codigobarra) {
        mensajeError("El código de barra es obligatorio");
        codigobarraElem.focus();
        return;
    } else if (!codigobarra.match(REGEX_CODIGO_BARRA)) {
        mensajeError("El código de barra debe tener 8 dígitos o entre 12 y 13 dígitos");
        codigobarraElem.focus();
        return;
    } else if (cargarProductos().some(p => p.code === codigobarra)) {
        mensajeError("Ya existe un producto con el mismo código de barra");
        codigobarraElem.focus();
        return;
    } else if (!nombre) {
        mensajeError("El nombre del producto es obligatorio");
        nombreElem.focus();
        return;
    } else if (nombre.length < 3 || nombre.length > 100) {
        mensajeError("El nombre debe tener entre 3 y 100 caracteres");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_PRODUCTO)) {
        mensajeError("El nombre contiene caracteres no válidos");
        nombreElem.focus();
        return;
    } else if (!descripcion) {
        mensajeError("La descripción es obligatoria");
        descripcionElem.focus();
        return;
    } else if (!descripcion.match(REGEX_TEXTO)) {
        mensajeError("La descripción es inválidos o no tiene entre 3 y 50 caracteres");
        descripcionElem.focus();
        return;
    } else if (!precioCompra) {
        mensajeError("El precio de compra es obligatorio");
        precioCompraElem.focus();
        return;
    } else if (!precioCompra.match(REGEX_PRECIO)) {
        mensajeError("El precio de compra debe ser un número entero o decimal válido (hasta 2 decimales)");
        precioCompraElem.focus();
        return;
    } else if (parseFloat(precioCompra) < 0 || parseFloat(precioCompra) > 999999999) {
        mensajeError("El precio de compra está fuera del rango permitido");
        precioCompraElem.focus();
        return;
    } else if (!precioVenta) {
        mensajeError("El precio de venta es obligatorio");
        precioVentaElem.focus();
        return;
    } else if (!precioVenta.match(REGEX_PRECIO)) {
        mensajeError("El precio de venta debe ser un número entero o decimal válido (hasta 2 decimales)");
        precioVentaElem.focus();
        return;
    } else if (parseFloat(precioVenta) < 0 || parseFloat(precioVenta) > 999999999) {
        mensajeError("El precio de venta está fuera del rango permitido");
        precioVentaElem.focus();
        return;
    } else if (parseFloat(precioVenta) < parseFloat(precioCompra)) {
        mensajeError("El precio de venta no puede ser menor al precio de compra");
        precioVentaElem.focus();
        return;
    } else if (!stockMinimo) {
        mensajeError("El stock mínimo es obligatorio");
        stockMinimoElem.focus();
        return;
    } else if (parseInt(stockMinimo) < 0 || parseInt(stockMinimo) > 999999) {
        mensajeError("El stock mínimo está fuera del rango permitido");
        stockMinimoElem.focus();
        return;
    } else if (!categoria) {
        mensajeError("Debe seleccionar una categoría");
        categoriaElem.focus();
        return;
    } else if (!cargarCategoria(parseInt(categoria))) {
        mensajeError("La categoría seleccionada no es válida o no existe");
        categoriaElem.focus();
        return;
    } else if (!marca) {
        mensajeError("Debe seleccionar una marca");
        marcaElem.focus();
        return;
    } else if (!cargarMarca(parseInt(marca))) {
        mensajeError("La marca seleccionada no es válida o no existe");
        marcaElem.focus();
        return;
    } else if (!iva) {
        mensajeError("Debe seleccionar el tipo de IVA");
        ivaElem.focus();
        return;
    } else if (iva !== "0" && iva !== "5" && iva !== "10") {
        mensajeError("El tipo de IVA no es válido");
        ivaElem.focus();
        return;
    }
    guardarProducto({
        id: obtenerSiguienteId(cargarProductos()),
        code: codigobarra,
        name: nombre,
        description: descripcion,
        purchase_price: parseFloat(precioCompra),
        selling_price: parseFloat(precioVenta),
        stock: 0,
        min_stock: parseFloat(stockMinimo),
        category_id: parseInt(categoria),
        brand_id: parseInt(marca),
        iva: parseInt(iva),
        active: true,
        created_at: new Date(),
        updated_at: null
    });
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Producto creado con éxito");
}

function ventanaEditarProducto(id) {
    const producto = cargarProducto(id);
    if (!producto) {
        mensajeError(`El producto con ID ${id} no existe`);
        return;
    }
    const categoriaElem = document.getElementById("edit_category_id");
    const marcaElem = document.getElementById("edit_brand_id");
    if (categoriaElem) categoriaElem.innerHTML = '<option value="">Seleccione Categoría</option>'
        + cargarCategorias().map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    if (marcaElem) marcaElem.innerHTML = '<option value="">Seleccione Marca</option>'
        + cargarMarcas().map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    document.getElementById("edit_id").value = producto.id;
    document.getElementById("edit_code").value = producto.code;
    document.getElementById("edit_name").value = producto.name;
    document.getElementById("edit_description").value = producto.description || "";
    document.getElementById("edit_purchase_price").value = producto.purchase_price;
    document.getElementById("edit_selling_price").value = producto.selling_price;
    document.getElementById("edit_stock").value = producto.stock;
    document.getElementById("edit_min_stock").value = producto.min_stock;
    document.getElementById("edit_category_id").value = producto.category_id;
    document.getElementById("edit_brand_id").value = producto.brand_id;
    document.getElementById("edit_iva").value = producto.iva;
    modalEditar.show();
}

function btnEditarProducto() {
    const id = parseInt(document.getElementById('edit_id').value);
    const producto = cargarProducto(id);
    if (!producto) return;
    const codigobarraElem = document.getElementById("edit_code");
    const codigobarra = codigobarraElem.value.trim();
    const nombreElem = document.getElementById("edit_name");
    const nombre = nombreElem.value.trim().toUpperCase();
    const descripcionElem = document.getElementById("edit_description");
    const descripcion = descripcionElem.value.trim().toUpperCase();
    const precioCompraElem = document.getElementById("edit_purchase_price");
    const precioCompra = precioCompraElem.value.trim();
    const precioVentaElem = document.getElementById("edit_selling_price");
    const precioVenta = precioVentaElem.value.trim();
    // const stockElem = document.getElementById("edit_stock");
    // const stock = stockElem.value.trim();
    const stockMinimoElem = document.getElementById("edit_min_stock");
    const stockMinimo = stockMinimoElem.value.trim();
    const categoriaElem = document.getElementById("edit_category_id");
    const categoria = categoriaElem.value.trim();
    const marcaElem = document.getElementById("edit_brand_id");
    const marca = marcaElem.value.trim();
    const ivaElem = document.getElementById("edit_iva");
    const iva = ivaElem.value.trim();
    if (!codigobarra) {
        mensajeError("El código de barra es obligatorio");
        codigobarraElem.focus();
        return;
    } else if (!codigobarra.match(REGEX_CODIGO_BARRA)) {
        mensajeError("El código de barra debe tener 8 dígitos o entre 12 y 13 dígitos");
        codigobarraElem.focus();
        return;
    } else if (cargarProductos().some(p => p.code === codigobarra && p.id !== id)) {
        mensajeError("Ya existe otro producto con el mismo código de barra");
        codigobarraElem.focus();
        return;
    } else if (!nombre) {
        mensajeError("El nombre del producto es obligatorio");
        nombreElem.focus();
        return;
    } else if (nombre.length < 3 || nombre.length > 100) {
        mensajeError("El nombre debe tener entre 3 y 100 caracteres");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_PRODUCTO)) {
        mensajeError("El nombre contiene caracteres no válidos");
        nombreElem.focus();
        return;
    } else if (!descripcion) {
        mensajeError("La descripción es obligatoria");
        descripcionElem.focus();
        return;
    } else if (!descripcion.match(REGEX_TEXTO)) {
        mensajeError("La descripción es inválidos o no tiene entre 3 y 50 caracteres");
        descripcionElem.focus();
        return;
    } else if (!precioCompra) {
        mensajeError("El precio de compra es obligatorio");
        precioCompraElem.focus();
        return;
    } else if (!precioCompra.match(REGEX_PRECIO)) {
        mensajeError("El precio de compra debe ser un número entero o decimal válido (hasta 2 decimales)");
        precioCompraElem.focus();
        return;
    } else if (parseFloat(precioCompra) < 0 || parseFloat(precioCompra) > 999999999) {
        mensajeError("El precio de compra está fuera del rango permitido");
        precioCompraElem.focus();
        return;
    } else if (!precioVenta) {
        mensajeError("El precio de venta es obligatorio");
        precioVentaElem.focus();
        return;
    } else if (!precioVenta.match(REGEX_PRECIO)) {
        mensajeError("El precio de venta debe ser un número entero o decimal válido (hasta 2 decimales)");
        precioVentaElem.focus();
        return;
    } else if (parseFloat(precioVenta) < 0 || parseFloat(precioVenta) > 999999999) {
        mensajeError("El precio de venta está fuera del rango permitido");
        precioVentaElem.focus();
        return;
    } else if (parseFloat(precioVenta) < parseFloat(precioCompra)) {
        mensajeError("El precio de venta no puede ser menor al precio de compra");
        precioVentaElem.focus();
        return;
    // } else if (!stock) {
    //     mensajeError("El stock actual es obligatorio");
    //     stockElem.focus();
    //     return;
    // } else if (isNaN(stock) || parseFloat(stock) < 0) {
    //     mensajeError("El stock debe ser un número mayor o igual a 0");
    //     stockElem.focus();
    //     return;
    } else if (!stockMinimo) {
        mensajeError("El stock mínimo es obligatorio");
        stockMinimoElem.focus();
        return;
    } else if (parseInt(stockMinimo) < 0 || parseInt(stockMinimo) > 999999) {
        mensajeError("El stock mínimo está fuera del rango permitido");
        stockMinimoElem.focus();
        return;
    } else if (!categoria) {
        mensajeError("Debe seleccionar una categoría");
        categoriaElem.focus();
        return;
    } else if (!cargarCategoria(parseInt(categoria))) {
        mensajeError("La categoría seleccionada no es válida o no existe");
        categoriaElem.focus();
        return;
    } else if (!marca) {
        mensajeError("Debe seleccionar una marca");
        marcaElem.focus();
        return;
    } else if (!cargarMarca(parseInt(marca))) {
        mensajeError("La marca seleccionada no es válida o no existe");
        marcaElem.focus();
        return;
    } else if (!iva) {
        mensajeError("Debe seleccionar el tipo de IVA");
        ivaElem.focus();
        return;
    } else if (iva !== "0" && iva !== "5" && iva !== "10") {
        mensajeError("El tipo de IVA no es válido");
        ivaElem.focus();
        return;
    }
    producto.code = codigobarra;
    producto.name = nombre;
    producto.description = descripcion;
    producto.purchase_price = parseFloat(precioCompra);
    producto.selling_price = parseFloat(precioVenta);
    // producto.stock = parseFloat(stock);
    producto.min_stock = parseFloat(stockMinimo);
    producto.category_id = parseInt(categoria);
    producto.brand_id = parseInt(marca);
    producto.iva = parseInt(iva);
    producto.updated_at = new Date();
    guardarProducto(producto);
    cargarDatos();
    modalEditar.hide();
    mensajeSuccess("Producto actualizado exitosamente");
}

function ventanaEliminarProducto(id) {
    const producto = cargarProducto(id);
    if (!producto) {
        mensajeError(`El producto con ID ${id} no existe`);
        return;
    };
    document.getElementById('del_id').value = producto.id;
    document.getElementById('del_name').textContent = renderString(producto.name);
    document.getElementById('del_description').textContent = renderString(producto.description);
    document.getElementById('del_brand').textContent = renderString(cargarMarca(producto.brand_id).name);
    document.getElementById('del_iva').textContent = producto.iva === 0 ? "EXENTA" : `${producto.iva}%`;
    modalEliminar.show();
}

function btnEliminarProducto() {
    const id = parseInt(document.getElementById('del_id').value);
    const producto = cargarProducto(id);
    if (!producto) return;
    confirmar(
        "Eliminar Producto",
        "¿Realmente deseas eliminar de forma permanente este producto?",
        () => {
            modalEliminar.hide();
            if (cargarCompraDetalles().some(d => d.product_id === id) || cargarVentaDetalles().some(d => d.product_id === id)) {
                mensajeError("No se puede eliminar el producto porque está asociada a uno o más registros.");
                return;
            }
            eliminarProducto(id);
            cargarDatos();
            mensajeSuccess("Producto eliminado");
        },
        () => {
            modalEliminar.hide();
            mensajeError("Eliminación cancelada");
        }
    ).set("labels", {
        ok: "Sí, eliminar",
        cancel: "No, mantener"
    });
}

/**
 * @param {number} id 
 */
function ventanaHabilitarProducto(id) {
    confirmar(
        "Habilitar Producto",
        "¿Deseas proceder con la habilitación?",
        () => {
            const producto = cargarProducto(id);
            producto.active = true;
            producto.updated_at = new Date();
            guardarProducto(producto);
            cargarDatos();
            mensajeSuccess("Producto habilitado correctamente");
        },
        () => mensajeError("Habilitación cancelada")
    );
}

/**
 * @param {number} id 
 */
function ventanaAnularProducto(id) {
    confirmar(
        "Anular Producto",
        "¿Deseas proceder con la anulación?",
        () => {
            const producto = cargarProducto(id);
            const pagoPendiente = cargarCompraDetalles().filter(d => d.product_id === id).map(d => cargarCompra(d.purchase_id)).filter(
                c => c.payment_type === "CREDITO").some(c => cargarCuentaPorPagar(null, c.id).status !== "PAGADA");
            const cobroPendiente = cargarVentaDetalles().filter(d => d.product_id === id).map(d => cargarVenta(d.sale_id)).filter(
                c => c.payment_type === "CREDITO").some(c => cargarCuentaPorCobrar(null, c.id).status !== "COBRADA");
            if (pagoPendiente || cobroPendiente) {
                mensajeError("No se puede anular el producto porque tiene pagos o cobros pendientes.");
                return;
            }
            producto.active = false;
            producto.updated_at = new Date();
            guardarProducto(producto);
            cargarDatos();
            mensajeSuccess("Producto anulado correctamente");
        },
        () => mensajeError("Anulación cancelada")
    );
}

function cargarDatos() {
    cargarDataTable(tablaProductos, cargarProductos());
    const productos = cargarProductos();
    document.getElementById("statTotal").innerText = productos.length;
    document.getElementById("statActivos").innerText = productos.filter(p => p.active).length;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!validarPermiso(PERMISOS.PRODUCTOS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PRODUCTOS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
