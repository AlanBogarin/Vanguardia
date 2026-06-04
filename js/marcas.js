/* global bootstrap */
/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

var modalNuevo = new bootstrap.Modal(document.getElementById('modalNuevaMarca'));
var modalEditar = new bootstrap.Modal(document.getElementById('modalEditarMarca'));
var modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminarMarca'));

const tablaMarcas = crearDataTable("tabla_marcas", [
    { data: 'id', title: "Id Marca" },
    { data: 'name', title: "Nombre", render: renderString },
    { data: 'created_at', title: "Fecha de creación", render: renderFecha },
    { data: 'updated_at', title: "Fecha de modificación", render: renderFecha },
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE MARCAS",
    actions: tienePermisoSesion(PERMISOS.MARCAS_EDITAR) ? (marca) => ({
        edit: `ventanaEditarMarca(${marca.id})`,
        delete: `ventanaEliminarMarca(${marca.id})`,
        enable: null,
        disable: null
    }) : null
});

function ventanaNuevaMarca() {
    if (!tienePermisoSesion) {
        mensajeError("No tienes permiso para crear marcas");
        return;
    }
    modalNuevo.show();
}

function btnGuardarMarca() {
    const nombreElem = document.getElementById("nombre");
    const nombre = nombreElem.value.trim().toUpperCase();
    if (!nombre) {
        mensajeError("El nombre de la marca es obligatorio");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_MARCA)) {
        mensajeError("El nombre es inválido o tiene insuficientes caracteres");
        nombreElem.focus();
        return;
    } else if (cargarMarcas().find(m => m.name.toUpperCase() === nombre)) {
        mensajeError("Ya existe una marca con el mismo nombre");
        nombreElem.focus();
        return;
    }
    guardarMarca({
        id: obtenerSiguienteId(cargarMarcas()),
        name: nombre,
        created_at: new Date(),
        updated_at: null
    });
    cargarDatos();
    modalNuevo.hide();
    mensajeSuccess("Marca guardada exitosamente");
}

/**
 * Mostrar el Modal para Editar una marca
 * @param {number} id Identificador de la marca
 */
function ventanaEditarMarca(id) {
    const marca = cargarMarca(id);
    if (!marca) {
        mensajeError(`La marca con ID ${id} no existe`);
        return;
    };
    document.getElementById('edit_id').value = marca.id;
    document.getElementById('edit_nombre').value = marca.name;
    modalEditar.show();
}

function btnEditarMarca() {
    const id = Number.parseInt(document.getElementById("edit_id").value.trim());
    const marca = cargarMarca(id);
    const nombreElem = document.getElementById("edit_nombre");
    const nombre = nombreElem.value.trim().toUpperCase();
    if (!nombre) {
        mensajeError("El nombre de la marca es obligatorio");
        nombreElem.focus();
        return;
    } else if (!nombre.match(REGEX_MARCA)) {
        mensajeError("El nombre es inválido o tiene insuficientes caracteres");
        nombreElem.focus();
        return;
    } else if (cargarMarcas().some(m => m.name === nombre && m.id !== id)) {
        mensajeError("Ya existe otra marca con el mismo nombre");
        nombreElem.focus();
        return;
    }
    marca.name = nombre;
    marca.updated_at = new Date();
    guardarMarca(marca);
    cargarDatos();
    modalEditar.hide();
    mensajeSuccess("Marca actualizada");
}

/**
 * Mostrar el Modal para Eliminar una marca
 * @param {number} id Identificador de la marca
 */
function ventanaEliminarMarca(id) {
    const marca = cargarMarca(id);
    if (!marca) {
        mensajeError(`La marca con ID ${id} no existe`);
        return;
    };
    document.getElementById('del_id').value = marca.id;
    document.getElementById('del_nombre').textContent = marca.name;
    modalEliminar.show();
}

function btnEliminarMarca() {
    const id = Number.parseInt(document.getElementById('del_id').value);
    const marca = cargarMarca(id);
    if (cargarProductos().some(p => p.brand_id === id)) {
        mensajeError("No se puede eliminar la marca porque está asociada a uno o más productos.");
        modalEliminar.hide();
        return;
    }
    eliminarMarca(id);
    cargarDatos();
    modalEliminar.hide();
    mensajeSuccess("Marca eliminada correctamente");
}

function cargarDatos() {
    const fechaDesde = document.getElementById('filtro_fecha_desde')?.value;
    const fechaHasta = document.getElementById('filtro_fecha_hasta')?.value;
    cargarDataTable(tablaMarcas, cargarMarcas().filter(m => {
        if (fechaDesde && fechaDesde > m.created_at.substring(0, 10)) return false;
        if (fechaHasta && fechaHasta < m.created_at.substring(0, 10)) return false;
        return true;
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.MARCAS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.MARCAS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
});
