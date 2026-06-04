/* global bootstrap */
/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

var modalNuevo = new bootstrap.Modal(document.getElementById('modalNuevaCategoria'));
var modalEditar = new bootstrap.Modal(document.getElementById('modalEditarCategoria'));
var modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminarCategoria'));

const tablaCategorias = crearDataTable("tabla_categorias", TABLAS.CATEGORIA, {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE CATEGORIAS",
    actions: tienePermisoSesion(PERMISOS.CATEGORIAS_EDITAR) ? (categoria) => ({
        edit: `ventanaEditarCategoria(${categoria.id})`,
        delete: `ventanaEliminarCategoria(${categoria.id})`,
        enable: null,
        disable: null
    }) : null
});

function ventanaNuevaCategoria() {
    modalNuevo.show();
}

function btnGuardarCategoria() {
    const nombreElem = document.getElementById("nombre");
    const nombre = nombreElem.value.trim().toUpperCase();
    const descripcionElem = document.getElementById("descripcion");
    const descripcion = descripcionElem.value.trim().toUpperCase();
    if (!nombre) {
        mensajeError("El nombre de la categoria es obligatorio");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_CATEGORIA)) {
        mensajeError("El nombre es inválido o tiene insuficientes caracteres");
        nombreElem.focus();
        return;
    } else if (cargarCategorias().find(c => c.name.toUpperCase() === nombre)) {
        mensajeError("Ya existe una categoria con el mismo nombre");
        nombreElem.focus();
        return;
    } else if (!descripcion) {
        mensajeError("La descripción de la categoria es obligatorio");
        descripcionElem.focus();
        return;
    } else if (!descripcion.match(REGEX_TEXTO)) {
        mensajeError("La descripción es inválida o no tiene entre 5 a 50 caracteres");
        descripcionElem.focus();
        return;
    }
    guardarCategoria({
        id: obtenerSiguienteId(cargarCategorias()),
        name: nombre,
        description: descripcion,
        created_at: new Date(),
        updated_at: null
    });
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Categoria guardada exitosamente");
}

function ventanaEditarCategoria(id) {
    const categoria = cargarCategoria(id);
    if (!categoria) {
        mensajeError(`La categoria con ID ${id} no existe`);
        return;
    }
    document.getElementById("edit_id").value = categoria.id;
    document.getElementById("edit_nombre").value = categoria.name;
    document.getElementById("edit_descripcion").value = categoria.description;
    modalEditar.show();
}

function btnEditarCategoria() {
    const id = parseInt(document.getElementById("edit_id").value.trim());
    const categoria = cargarCategoria(id);
    const nombreElem = document.getElementById("edit_nombre");
    const nombre = nombreElem.value.trim().toUpperCase();
    const descripcionElem = document.getElementById("edit_descripcion");
    const descripcion = descripcionElem.value.trim().toUpperCase();
    if (!nombre) {
        mensajeError("El nombre de la categoria es obligatorio");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_CATEGORIA)) {
        mensajeError("El nombre es inválido o tiene insuficientes caracteres");
        nombreElem.focus();
        return;
    } else if (cargarCategorias().find(c => c.name.toUpperCase() === nombre && c.id !== id)) {
        mensajeError("Ya existe una categoria con el mismo nombre");
        nombreElem.focus();
        return;
    } else if (!descripcion) {
        mensajeError("La descripción de la categoria es obligatorio");
        descripcionElem.focus();
        return;
    } else if (!descripcion.match(REGEX_TEXTO)) {
        mensajeError("La descripción es inválida o no tiene entre 5 a 50 caracteres");
        descripcionElem.focus();
        return;
    }
    categoria.name = nombre;
    categoria.description = descripcion;
    guardarCategoria(categoria);
    cargarDatos();
    modalEditar.hide();
    mensajeSuccess("Categoria actualizada");
}

function ventanaEliminarCategoria(id) {
    const categoria = cargarCategoria(id);
    if (!categoria) {
        mensajeError(`La categoria con ID ${id} no existe`);
        return;
    }
    document.getElementById("del_id").value = categoria.id;
    document.getElementById("del_nombre").textContent = categoria.name;
    document.getElementById("del_descripcion").textContent = categoria.description;
    modalEliminar.show();
}

function btnEliminarCategoria() {
    const id = parseInt(document.getElementById('del_id').value);
    const categoria = cargarCategoria(id);
    if (!categoria) return;
    if (cargarProductos().some(p => p.category_id === id)) {
        mensajeError("No se puede eliminar la categoria porque está asociada a uno o más productos.");
        modalEliminar.hide();
        return;
    }
    eliminarCategoria(id);
    cargarDatos();
    modalEliminar.hide();
    mensajeSuccess("Categoria eliminada correctamente");
}

function cargarDatos() {
    const fechaDesde = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta = document.getElementById('filtro_fecha_hasta').value;
    cargarDataTable(tablaCategorias, cargarCategorias().filter(c => {
        if (fechaDesde && fechaDesde > c.created_at.substring(0, 10)) return false;
        if (fechaHasta && fechaDesde < c.created_at.substring(0, 10)) return false;
        return true;
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.CATEGORIAS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.CATEGORIAS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});

