/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */
/** @typedef {import('./tablas')} */

const MARCA_MIN_LENGTH = 2;
const MARCA_REGEX = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s-.]{2,}$/;

const modalNMarca = new bootstrap.Modal(document.getElementById('modalNuevaMarca'));
const modalEMarca = new bootstrap.Modal(document.getElementById('modalEditarMarca'));
const modalDelMarca = new bootstrap.Modal(document.getElementById('modalEliminarMarca'));

const tablaMarcas = crearDataTable("tabla_marcas", [
    { data: 'id', title: "Id Marca" },
    { data: 'name', title: "Nombre", render: renderString },
    { data: 'created_at', title: "Fecha de creación", render: renderFecha },
    { data: 'updated_at', title: "Fecha de modificación", render: renderFecha },
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    actions: tienePermisoSesion(PERMISOS.MARCAS_EDITAR) ? (marca) => ({
        edit: `ventanaEditarMarca(${marca.id})`,
        delete: `ventanaEliminarMarca(${marca.id})`,
        enable: null,
        disable: null
    }) : null
});

function btnGuardarMarca() {
    const nombreElem = document.getElementById("nombre");
    const nombre = nombreElem.value.trim().toUpperCase();
    if (!nombre) {
        mensajeError("El nombre de la marca es obligatorio");
        nombreElem.focus();
        return;
    }
    if (nombre.length < MARCA_MIN_LENGTH) {
        mensajeError("El nombre debe tener 5 caracteres como mínimo");
        nombreElem.focus();
        return;
    }
    if (!nombre.match(MARCA_REGEX)) {
        mensajeError("El nombre es inválido");
        nombreElem.focus();
        return;
    }
    if (cargarMarcas().find(m => m.name.toUpperCase() === nombre)) {
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
    cargarTablaMarcas();
    modalNMarca.hide();
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
    modalEMarca.show();
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
    }
    if (nombre.length < MARCA_MIN_LENGTH) {
        mensajeError(`El nombre debe tener ${MARCA_MIN_LENGTH} caracteres como mínimo`);
        nombreElem.focus();
        return;
    }
    if (!nombre.match(MARCA_REGEX)) {
        mensajeError("El nombre es inválido");
        nombreElem.focus();
        return;
    }
    if (cargarMarcas().some(m => m.name === nombre && m.id !== id)) {
        mensajeError("Ya existe otra marca con el mismo nombre");
        nombreElem.focus();
        return;
    }
    marca.name = nombre;
    marca.updated_at = new Date();
    guardarMarca(marca);
    cargarTablaMarcas();
    modalEMarca.hide();
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
    modalDelMarca.show();
}

function btnEliminarMarca() {
    const id = Number.parseInt(document.getElementById('del_id').value);
    const marca = cargarMarca(id);
    if (cargarProductos().some(p => p.brand_id === id)) {
        mensajeError("No se puede eliminar la marca porque está asociada a uno o más productos.");
        modalDelMarca.hide();
        return;
    }
    eliminarMarca(id);
    cargarTablaMarcas();
    modalDelMarca.hide();
    mensajeSuccess("Marca eliminada correctamente");
}

function cargarTablaMarcas() {
    cargarDataTable(tablaMarcas, cargarMarcas());
}

document.addEventListener('DOMContentLoaded', () => {
    if (validarPermiso(PERMISOS.MARCAS_VER)) cargarTablaMarcas();
});
