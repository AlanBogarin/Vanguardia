/**
 * productos.js
 * Proyecto: Vanguardia - Gestión de Productos
 * Autor: Alexis Martínez Rodi
 * Carrera: Ingeniería Informática Empresarial
 */

let dataTable;
let idProductoSeleccionado = null;

// Modales
const modalNuevo = new bootstrap.Modal(document.getElementById("modalNuevoProducto"));
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarProducto"));
const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminarProducto"));

document.addEventListener("DOMContentLoaded", () => {
    cargarSelects();
    inicializarTabla();
    actualizarEstadisticas();
});

/**
 * Carga los select de Categoría y Marca desde bd.js
 */
function cargarSelects() {
    const categorias = cargarCategorias();
    const marcas = cargarMarcas();
    
    const selectsCat = [document.getElementById("new_category_id"), document.getElementById("edit_category_id")];
    const selectsMarca = [document.getElementById("new_brand_id"), document.getElementById("edit_brand_id")];

    const htmlCat = '<option value="">Seleccione Categoría</option>' + 
                   categorias.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    const htmlMarca = '<option value="">Seleccione Marca</option>' + 
                    marcas.map(m => `<option value="${m.id}">${m.name}</option>`).join("");

    selectsCat.forEach(s => { if(s) s.innerHTML = htmlCat; });
    selectsMarca.forEach(s => { if(s) s.innerHTML = htmlMarca; });
}

function inicializarTabla() {
    dataTable = $("#tabla_productos").DataTable({
        data: cargarProductos().map(p => {
            return {
                ...p,
                updated_at: p.updated_at || ""
            };
        }),
        columns: [
            { data: "id" },
            { data: "code" },
            { data: "name" },
            { 
                data: "selling_price",
                render: data => formatoGuarani(data)
            },
            { 
                data: null,
                render: row => renderStock(row)
            },
            {
                data: null,
                orderable: false,
                render: (data, type, row) => {
                    return `
                    <div class="text-center">
                        <button class="btn btn-sm btn-primary" onclick="abrirEditar(${data.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="abrirEliminar(${data.id})"><i class="bi bi-trash"></i></button>
                    </div>`;
                }
            }
        ],
        language: spanish
    });
}

/**
 * Prepara el modal de edición con los datos del producto
 */
function abrirEditar(id) {
    const p = cargarProducto(id); // Función de bd.js
    if (!p) return;

    document.getElementById("edit_id").value = p.id;
    document.getElementById("edit_code").value = p.code;
    document.getElementById("edit_name").value = p.name;
    document.getElementById("edit_purchase_price").value = p.purchase_price;
    document.getElementById("edit_selling_price").value = p.selling_price;
    document.getElementById("edit_stock").value = p.stock;
    document.getElementById("edit_min_stock").value = p.min_stock;
    document.getElementById("edit_category_id").value = p.category_id;
    document.getElementById("edit_brand_id").value = p.brand_id;
    document.getElementById("edit_iva").value = p.iva;

    modalEditar.show();
}

function abrirEliminar(id) {
    idProductoSeleccionado = id;
    modalEliminar.show();
}

// Evento Guardar Nuevo
document.getElementById("btnGuardarNuevo").addEventListener("click", () => {
    const nuevo = {
        id: Date.now(), // ID temporal basado en tiempo
        code: document.getElementById("new_code").value.trim(),
        name: document.getElementById("new_name").value.trim(),
        description: document.getElementById("new_description").value.trim(),
        purchase_price: Number(document.getElementById("new_purchase_price").value),
        selling_price: Number(document.getElementById("new_selling_price").value),
        stock: Number(document.getElementById("new_stock").value),
        min_stock: Number(document.getElementById("new_min_stock").value),
        category_id: Number(document.getElementById("new_category_id").value),
        brand_id: Number(document.getElementById("new_brand_id").value),
        iva: Number(document.getElementById("new_iva").value),
        active: true,
        created_at: new Date(),
        updated_at: null
    };

    guardarProducto(nuevo);
    refrescarTodo(modalNuevo);
    alertify.success("Producto creado con éxito");
});

// Evento Confirmar Eliminación
document.getElementById("btnConfirmarEliminar").addEventListener("click", (e) => {
    const producto = cargarProducto(idProductoSeleccionado);
    if (!producto) return;
    producto.active = !producto.active;
    guardarProducto(producto);
    // eliminarProducto(idProductoSeleccionado);
    refrescarTodo(modalEliminar);
    alertify.error("Producto eliminado");
});

function refrescarTodo(modal) {
    modal.hide();
    dataTable.clear().rows.add(cargarProductos()).draw();
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const prods = cargarProductos();
    document.getElementById("statTotal").innerText = prods.length;
    document.getElementById("statActivos").innerText = prods.filter(p => p.active).length;
}

function formatoGuarani(valor) {
    return "Gs. " + Number(valor).toLocaleString("es-PY");
}

function renderStock(p) {
    const clase = p.stock <= p.min_stock ? "bg-danger" : "bg-success";
    return `<span class="badge ${clase}">${p.stock}</span>`;
}