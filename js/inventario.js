/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 * 
 */

const modalAjusteStock = new bootstrap.Modal(document.getElementById("modalAjusteStock"));

const tablaInventario = crearDataTable("tabla_inventario", [
    { data: "code", title: "Código de Barra", align: "right", render: renderString },
    { data: "name", title: "Producto", align: "left", render: renderString },
    { data: "description", title: "Descripción", align: "left", render: renderString },
    { data: "stock", title: "Stock", align: "right", render: (data, type, row) => data <= row.min_stock ? `<span class="badge bg-danger">${data}</span>` : data },
    { data: "min_stock", title: "Stock Mínimo", align: "right", render: renderNumber },
    { data: "category_id", title: "Categoría", align: "left", render: data => cargarCategoria(data).name },
    { data: "brand_id", title: "Marca", align: "left", render: data => cargarMarca(data).name }
], {
    buttons: false, 
    pageLength: 5,
    searching: false,
    // exportTitle: "AJUSTE DE STOCK",
    actions: tienePermisoSesion(PERMISOS.INVENTARIO_EDITAR) ? (producto) => ({
        edit: `ventanaEditarStock(${producto.id})`,
        delete: null,
        enable: null,
        disable: null,
    }) : null
});

const tablaHistorial = crearDataTable("tabla_historial_ajustes", [
    ...TABLAS.AJUSTE_STOCK.slice(0, 1),
    { data: "product_id", title: "Código Barra", align: "left", render: data => cargarProducto(data).code },
    ...TABLAS.AJUSTE_STOCK.slice(1)
], {
    buttons: true,
    pageLength: 10,
    searching: true, // si se oculta, tambien oculta los botones exportar (bug?)
    exportTitle: "LISTADO DE AJUSTES DE STOCK"
});

/**
 * @param {number} id 
 */
function ventanaEditarStock(id) {
    const producto = cargarProducto(id);
    document.getElementById("ajuste_producto_id").value = producto.id;
    document.getElementById("ajuste_producto_nombre").value = producto.name;
    document.getElementById("ajuste_stock_actual").value = producto.stock;
    document.getElementById("ajuste_tipo").value = "ENTRADA";
    document.getElementById("ajuste_cantidad").value = "";
    document.getElementById("ajuste_motivo").value = "";
    modalAjusteStock.show();
}

function onClickGuardarAjuste() {
    const productoId = parseInt(document.getElementById("ajuste_producto_id").value);
    const tipoElem = document.getElementById("ajuste_tipo");
    const tipo = tipoElem.value;
    const cantidadElem = document.getElementById("ajuste_cantidad");
    const cantidad = parseInt(cantidadElem.value);
    const motivoElem = document.getElementById("ajuste_motivo");
    const motivo = motivoElem.value.trim().toUpperCase();
    const producto = cargarProducto(productoId);
    if (!producto) return;
    if (!AJUSTE_TIPO.includes(tipo)) {
        mensajeError("Seleccione un tipo de ajuste");
        tipoElem.focus();
        return;
    } else if (cantidad <= 0) {
        mensajeError("Ingrese una cantidad válida");
        cantidadElem.focus();
        return;
    } else if (tipo === AJUSTE_SALIDA && cantidad > producto.stock) {
        mensajeError("La cantidad excede al stock actual");
        cantidadElem.focus();
        return;
    } else if (!motivo) {
        mensajeError("Debe ingresar un motivo");
        motivoElem.focus();
        return;
    } else if (!motivo.match(REGEX_TEXTO)) {
        mensajeError("El motivo debe tener entre 5 a 50 caracteres");
        motivoElem.focus();
        return;
    }
    const stock_anterior = producto.stock
    const stock_nuevo = producto.stock + (tipo === AJUSTE_ENTRADA ? cantidad : -cantidad);
    producto.stock = stock_nuevo;
    producto.updated_at = new Date();
    guardarProducto(producto);
    guardarAjusteInventario({
        id: obtenerSiguienteId(cargarAjustesInventario()),
        product_id: producto.id,
        user_id: cargarSesion().user_id,
        type: tipo,
        quantity: cantidad,
        reason: motivo,
        previous_stock: stock_anterior,
        new_stock: stock_nuevo,
        created_at: new Date()
    });
    mensajeSuccess("Stock actualizado correctamente");
    cargarDatos();
    modalAjusteStock.hide();
}

function cargarDatos() {
    const texto = document.getElementById("filtro_producto").value.toUpperCase();
    const categoria = document.getElementById("filtro_categoria").value.toUpperCase();
    const marca = document.getElementById("filtro_marca").value.toUpperCase();
    const stock = document.getElementById("filtro_stock").value;
    const tipoAjuste = document.getElementById("filtro_tipo_ajuste").value.toUpperCase();
    const dlCategoria = document.getElementById("datalist_categoria");
    const dlMarca = document.getElementById("datalist_marca");
    cargarDataTable(tablaInventario, cargarProductos().filter(p => {
        if (!p.active) return false;
        if (texto && !(p.name.toUpperCase().includes(texto) || p.code.toUpperCase().includes(texto))) return false;
        if (categoria && !cargarCategoria(p.category_id).name.includes(categoria)) return false;
        if (marca && !cargarMarca(p.brand_id).name.includes(marca)) return false;
        if (stock === "BAJO" && p.stock > p.min_stock) return false;
        if (stock === "OK" && p.stock <= p.min_stock) return false;
        return true;
    }));
    cargarDataTable(tablaHistorial, cargarAjustesInventario().filter(a => {
        if (tipoAjuste && a.type !== tipoAjuste) return false;
        return true;
    }));
    dlCategoria.innerHTML = "<option value=\"\">TODAS</option>" + cargarCategorias()
        .map(c => `<option value="${c.name}">${c.description}</option>`).join("");
    dlMarca.innerHTML = "<option value=\"\">TODAS</option>" + cargarMarcas()
        .map(m => `<option value="${m.name}"></option>`).join("");
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.INVENTARIO_VER)) return;
    // if (!tienePermisoSesion(PERMISOS.COMPRAS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});