/** @typedef {import('./bd')} */
/** @typedef {import('./alertas')} */
/** @typedef {import('./alertify')} */

// Redirigir a login.html si no hay sesion
window.onload = validarSesion;

// var clientes = JSON.parse(localStorage.getItem("clientes")) || [];
// let tabla;
// const modalNCliente = new bootstrap.Modal(document.getElementById('nuevoCliente'));

function nuevoCliente() {
    const nombreElem = document.getElementById("nombre");
    let nombre = nombreElem.value.trim();
    const rucElem = document.getElementById("ruc");
    let ruc = rucElem.value.trim();
    const telElem = document.getElementById("telefono");
    let tel = telElem.value.trim();
    const correoElem = document.getElementById("correo");
    let correo = correoElem.value.trim();
    const direccionElem = document.getElementById("direccion");
    let direccion = direccionElem.value.trim();

    if (!nombre) {
        alertify.error("El nombre es obligatorio");
        nombreElem.focus();
        return;
    } else if (ruc && !ruc.match(/^\d+(-\d)?$/)) {
        alertify.error("El formato del ruc es invalido");
        rucElem.focus();
        return;
    } else if (tel && !tel.match(/^09\d{8}$/)) {
        alertify.error("El teléfono es invalido");
        telElem.focus();
        return;
    } else if (correo && !correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)) {
        alertify.error("El correo es invalido");
        correoElem.focus();
        return;
    }
    const nuevo_id = cargarClientes().length;
    guardarCliente({
        id: nuevo_id,
        name: nombre.toUpperCase(),
        ruc: ruc || null,
        tel: tel || null,
        email: correo ? correo.toLowerCase() : null,
        address: direccion ? direccion.toUpperCase() : null,
        active: true,
        created_at: new Date(),
        updated_at: null
    });
}

document.addEventListener('DOMContentLoaded', function () {
    cargarComponentes();
    cargarTablaClientes();

    // Evento Nuevo Cliente
    document.getElementById('formNuevoCliente').addEventListener('submit', function (e) {
        e.preventDefault();
        const nuevoCliente = {
                idcliente:  obtenerSiguienteId(clientes),
                cedula:     document.getElementById('cedula').value.trim(),
                nombre:     document.getElementById('nombre').value.trim().toUpperCase(),
                direccion:  document.getElementById('direccion').value.trim().toUpperCase(),
                telefono:   document.getElementById('telefono').value.trim()
        };
        if (Object.values(nuevoCliente).some(val => val === '')) {
                alert('Todos los campos son obligatorios');
                return;
        }
        clientes.push(nuevoCliente);
        guardarClientes(clientes);
        this.reset();
        tabla.row.add(nuevoCliente).draw();
        modalNCliente.hide();
        alertify.success("Registro guardado");
    });

    // Evento Editar Cliente
    const modalECliente = new bootstrap.Modal(document.getElementById('modalEditarCliente'));

    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-editar')) {
                const id = parseInt(e.target.closest('.btn-editar').dataset.id);
                const cliente = clientes.find(c => c.idcliente === id);
                if (cliente) {
                    document.getElementById('edit_idcliente').value  = cliente.idcliente;
                    document.getElementById('edit_cedula').value     = cliente.cedula;
                    document.getElementById('edit_nombre').value     = cliente.nombre;
                    document.getElementById('edit_direccion').value  = cliente.direccion;
                    document.getElementById('edit_telefono').value   = cliente.telefono;
                    modalECliente.show();
                }
        }
    });

    document.getElementById('formEditarCliente').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit_idcliente').value);
        const index = clientes.findIndex(c => c.idcliente === id);
        if (index !== -1) {
                clientes[index] = {
                    idcliente: id,
                    cedula:    document.getElementById('edit_cedula').value.trim(),
                    nombre:    document.getElementById('edit_nombre').value.trim().toUpperCase(),
                    direccion: document.getElementById('edit_direccion').value.trim().toUpperCase(),
                    telefono:  document.getElementById('edit_telefono').value.trim()
                };
                guardarClientes(clientes);
                tabla.clear().rows.add(clientes).draw();
                modalECliente.hide();
                alertify.success("Cliente actualizado");
        }
    });

    // Evento Eliminar Cliente
    const modalDelCliente = new bootstrap.Modal(document.getElementById('modalEliminarCliente'));

    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-eliminar')) {
                const id = parseInt(e.target.closest('.btn-eliminar').dataset.id);
                const cliente = clientes.find(c => c.idcliente === id);
                if (cliente) {
                    document.getElementById('del_idcliente').value        = cliente.idcliente;
                    document.getElementById('del_cedula').textContent     = cliente.cedula;
                    document.getElementById('del_nombre').textContent     = cliente.nombre;
                    document.getElementById('del_direccion').textContent  = cliente.direccion;
                    document.getElementById('del_telefono').textContent   = cliente.telefono;
                    modalDelCliente.show();
                }
        }
    });

    document.getElementById('btnConfirmarEliminar').addEventListener('click', function () {
        const id = parseInt(document.getElementById('del_idcliente').value);
        alertify.confirm("Eliminar cliente", "¿Realmente deseas eliminar de forma permanente a este cliente?",
                function () {
                    clientes = clientes.filter(c => c.idcliente !== id);
                    guardarClientes(clientes);
                    tabla.clear().rows.add(clientes).draw();
                    modalDelCliente.hide();
                    alertify.success("Cliente eliminado correctamente");
                },
                function () {
                    modalDelCliente.hide();
                    alertify.error("Eliminación cancelada");
                }
        ).set('labels', { ok: 'Sí, eliminar', cancel: 'No, mantener' });
    });
});

// Inicializar DataTable
function cargarTablaClientes() {
    tabla = new DataTable("#tabla_clientes", {
        data: clientes,
        columns: [
                { data: 'idcliente',  title: 'Id Cliente' },
                { data: 'cedula',     title: 'N° Cédula' },
                { data: 'nombre',     title: 'Nombre' },
                { data: 'direccion',  title: 'Dirección' },
                { data: 'telefono',   title: 'Teléfono' },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <button class="btn btn-sm btn-warning me-1 btn-editar" data-id="${row.idcliente}"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${row.idcliente}"><i class="bi bi-trash"></i></button>
                        `;
                    }
                }
        ],
        dom: '<"d-flex justify-content-between align-items-center mb-2"B<"ms-auto"f>>rtip',
        buttons: [
                {
                    extend: 'print',
                    text: '<i class="bi bi-printer"></i> Imprimir',
                    exportOptions: { columns: [0, 1, 2, 3, 4] },
                    customize: function (win) {
                        // Membrete para impresión
                        var membrete = `
                            <div style="text-align:center; margin-bottom:16px; font-family:Arial, sans-serif; border-bottom:2px solid #000; padding-bottom:10px;">
                                    <div style="font-size:22px; font-weight:bold; letter-spacing:2px;">VANGUARDIA</div>
                                    <div style="font-size:12px;">Comercialización de Productos Informáticos y Tecnológicos</div>
                                    <div style="font-size:11px;">Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción</div>
                                    <div style="font-size:11px;">Tel.: 0985-495-253</div>
                                    <div style="font-size:13px; font-weight:bold; margin-top:8px;">LISTADO DE CLIENTES</div>
                            </div>
                        `;
                        $(win.document.body).find('h1').remove();
                        $(win.document.body).prepend(membrete);
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="bi bi-filetype-xlsx"></i> Exportar a Excel',
                    exportOptions: { columns: [0, 1, 2, 3, 4] },
                    title: 'VANGUARDIA - Listado de Clientes',
                    messageTop: 'Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción | Tel.: 0985-495-253'
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="bi bi-filetype-pdf"></i> Exportar a PDF',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4]
                    },
                    customize: function (doc) {
                        const now = new Date();
                        const fecha = now.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const hora  = now.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                        const fechaHora = fecha + ' ' + hora;

                        // Membrete al inicio del PDF
                        doc.content.unshift(
                            {
                                    text: 'VANGUARDIA',
                                    style: { fontSize: 18, bold: true, alignment: 'center' },
                                    margin: [0, 0, 0, 4]
                            },
                            {
                                    text: 'Comercialización de Productos Informáticos y Tecnológicos',
                                    style: { fontSize: 10, alignment: 'center' },
                                    margin: [0, 0, 0, 2]
                            },
                            {
                                    text: 'Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción',
                                    style: { fontSize: 9, alignment: 'center' },
                                    margin: [0, 0, 0, 2]
                            },
                            {
                                    text: 'Tel.: 0985-495-253',
                                    style: { fontSize: 9, alignment: 'center' },
                                    margin: [0, 0, 0, 4]
                            },
                            {
                                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
                                    margin: [0, 0, 0, 4]
                            },
                            {
                                    text: 'LISTADO DE CLIENTES',
                                    style: { fontSize: 13, bold: true, alignment: 'center' },
                                    margin: [0, 0, 0, 8]
                            }
                        );

                        // Pie de página con fecha y número de página
                        doc.footer = function (currentPage, pageCount) {
                            return {
                                    columns: [
                                        { alignment: 'left',  text: fechaHora, margin: [20, 10], fontSize: 8 },
                                        { alignment: 'right', text: 'Pág. ' + currentPage + '/' + pageCount, margin: [20, 10], fontSize: 8 }
                                    ]
                            };
                        };

                        for (let i = 0; i < doc.content.length; i++) {
                            if (doc.content[i].table !== undefined) {
                                    doc.content[i].table.widths = ['auto', 'auto', '*', '*', 'auto'];
                                    break;
                            }
                        }
                    }
                }
        ],
        responsive: true,
        language: spanish,
        initComplete: function () {
                // Botón Nuevo arriba del buscador
                var btnNuevo = '<button class="btn btn-sm btn-primary me-2" id="btnNuevoCliente" onclick="$(\'#nuevoCliente\').modal(\'show\')"><i class="bi bi-person-plus-fill"></i> Nuevo cliente</button>';
                $('.dataTables_filter').before(btnNuevo);
                $('.dt-button:contains("Imprimir")')
                    .removeClass('dt-button')
                    .addClass('btn btn-sm btn-info');

                $('.dt-button:contains("Exportar a Excel")')
                    .removeClass('dt-button')
                    .addClass('btn btn-sm btn-success');

                $('.dt-button:contains("Exportar a PDF")')
                    .removeClass('dt-button')
                    .addClass('btn btn-sm btn-danger');
        }
    });
}

function guardarClientes(data) {
    localStorage.setItem('clientes', JSON.stringify(data));
}

function obtenerSiguienteId(arr) {
    if (arr.length === 0) return 1;
    return Math.max(...arr.map(c => c.idcliente || 0)) + 1;
}