/** @typedef {import('alertify')} */
/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */

var tabla = null;
const modalNMarca = new bootstrap.Modal(document.getElementById('modalNuevaMarca'));
const modalEMarca = new bootstrap.Modal(document.getElementById('modalEditarMarca'));
const modalDelMarca = new bootstrap.Modal(document.getElementById('modalEliminarMarca'));

function obtenerSiguienteId() {
    const marcas = cargarMarcas();
    if (marcas.length === 0) return 1;
    return Math.max(...marcas.map(m => m.id)) + 1;
}

function guardarNuevaMarca(e) {
    e.preventDefault();
    const nombreElem = document.getElementById("nombre");
    let nombre = nombreElem.value.trim();

    if (!nombre) {
        alertify.error("El nombre de la marca es obligatorio");
        nombreElem.focus();
        return;
    }

    const nuevo_id = obtenerSiguienteId();
    guardarMarca({
        id: nuevo_id,
        name: nombre.toUpperCase(),
        created_at: new Date(),
        updated_at: null
    });

    this.reset();
    cargarTablaMarcas();
    modalNMarca.hide();
    alertify.success("Marca guardada exitosamente");
}

function modalEditarMarca(e) {
    if (e.target.closest('.btn-editar')) {
        const id = parseInt(e.target.closest('.btn-editar').dataset.id);
        const marca = cargarMarca(id);
        if (!marca) return;
        document.getElementById('edit_id').value = marca.id;
        document.getElementById('edit_nombre').value = marca.name;
        document.getElementById('edit_creacion').value = marca.created_at;
        modalEMarca.show();
    }
}

function guardarMarcaEditada(e) {
    e.preventDefault();
    const idElem = document.getElementById("edit_id");
    let id = Number.parseInt(idElem.value.trim());
    const nombreElem = document.getElementById("edit_nombre");
    let nombre = nombreElem.value.trim();
    const creacionElem = document.getElementById("edit_creacion");
    let creacion = creacionElem.value;

    if (!nombre) {
        alertify.error("El nombre de la marca es obligatorio");
        nombreElem.focus();
        return;
    }

    guardarMarca({
        id: id,
        name: nombre.toUpperCase(),
        created_at: new Date(creacion),
        updated_at: new Date()
    });

    cargarTablaMarcas();
    modalEMarca.hide();
    alertify.success("Marca actualizada");
}

function modalEliminarMarca(e) {
    if (e.target.closest('.btn-eliminar')) {
        const id = parseInt(e.target.closest('.btn-eliminar').dataset.id);
        const marca = cargarMarca(id);
        if (!marca) return;
        document.getElementById('del_id').value = marca.id;
        document.getElementById('del_nombre').textContent = marca.name;
        modalDelMarca.show();
    }
}

function eliminarMarcaConfirmada() {
    const id = parseInt(document.getElementById('del_id').value);
    const marca = cargarMarca(id);
    if (!marca) return;
    
    // Verificación de si la marca está en uso en algún producto
    const productos = cargarProductos();
    const enUso = productos.some(p => p.brand_id === id);
    if (enUso) {
        alertify.error("No se puede eliminar la marca porque está asociada a uno o más productos.");
        modalDelMarca.hide();
        return;
    }

    eliminarMarca(id);
    cargarTablaMarcas();
    modalDelMarca.hide();
    alertify.success("Marca eliminada correctamente");
}

document.addEventListener('DOMContentLoaded', function () {
    cargarTablaMarcas();

    document.getElementById("formNuevaMarca").addEventListener("submit", guardarNuevaMarca);
    document.addEventListener("click", modalEditarMarca);
    document.getElementById("formEditarMarca").addEventListener("submit", guardarMarcaEditada);
    document.addEventListener('click', modalEliminarMarca);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', eliminarMarcaConfirmada);
});

function cargarTablaMarcas() {
    const marcas = cargarMarcas().map(m => {
        return {
            ...m,
            updated_at: m.updated_at ? new Date(m.updated_at).toLocaleString() : "",
            created_at: m.created_at ? new Date(m.created_at).toLocaleString() : ""
        };
    });

    if (tabla) {
        tabla.clear().rows.add(marcas).draw();
        return;
    }

    tabla = new DataTable("#tabla_marcas", {
        data: marcas,
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'created_at' },
            { data: 'updated_at' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-warning me-1 btn-editar" data-id="${row.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${row.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
                    `;
                }
            }
        ],
        dom: '<"d-flex justify-content-between align-items-center mb-2"Bf>rtip',
        buttons: [
            {
                extend: 'print',
                text: '<i class="bi bi-printer"></i> Imprimir',
                exportOptions: { columns: [0, 1, 2, 3] },
            },
            {
                extend: 'excelHtml5',
                text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
                exportOptions: { columns: [0, 1, 2, 3] },
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
                exportOptions: { columns: [0, 1, 2, 3] },
            }
        ],
        language: {
            url: "dt/es-ES.json"
        }
    });
}
