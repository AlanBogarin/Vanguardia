/**
 * Para poder usar este script, es necesario importar en el html:
 * - dt/datatables.min.js
 * - dt/datatables.min.css
 * - dt/pdfmake.min.js
 * - dt/vfs_fonts.js
 * - dt/buttons.html5.min.js
 * - dt/jszip.min.js
 * 
 * @typedef {import("../menu/scripts")}
 * 
 * @typedef {Object} DataTableColumn
 * @property {string?} data
 * @property {string} title
 * @property {(function(any): any) | undefined} render
 * 
 * @typedef {Object} AccionCustom
 * @property {string} color Clase de Bootstrap para el botón (ej: 'btn-success')
 * @property {string} content Contenido HTML interno (ej: '<i class="bi bi-eye"></i>')
 * @property {string} title Texto descriptivo para el atributo title (tooltip)
 * @property {string?} href URL opcional para redirección. Si existe, renderiza un tag <a> en lugar de <button>
 * @property {string?} properties Atributos HTML adicionales opcionales (ej: 'onclick="..."')
 * 
 * @typedef {Object} Acciones
 * @property {string?} edit Valor para onclick del botón
 * @property {string?} delete Valor para onclick del botón
 * @property {string?} enable Valor para onclick del botón
 * @property {string?} disable Valor para onclick del botón
 * @property {AccionCustom[]?} customs Valor para onclick del botón
 * 
 * @typedef {Object} DataTableConfig
 * @property {boolean} searching Mostrar el buscador
 * @property {boolean} buttons Botones de exportar
 * @property {number} pageLength Limite de paginación
 * @property {string} exportTitle Título para las exportaciones
 * @property {(function(any): Acciones)?} actions Determinar acciones para cada fila
 */

/** @type {Promise<string>} */
const logoBase64 = descargarRecurso("img/logo_x128.jpg")
    .then(response => response.blob())
    .then(blob => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    }));

/**
 * 
 * @param {string?} data 
 * @returns {string}
 */
function renderFecha(data) {
    return data ? new Date(data).toLocaleString("es-PY") : "";
}

/**
 * 
 * @param {string | number?} data 
 * @returns {string}
 */
function renderMoneda(data) {
    return data ? Number.parseInt(new Number(data).toFixed(0)).toLocaleString("es-PY") : "0";
}

/**
 * Escapa caracteres especiales de HTML para prevenir inyección XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    if (!str) return "";
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 
 * @param {string?} data 
 * @returns {string}
 */
function renderString(data) {
    return data ? escapeHTML(data.toString().toUpperCase()) : "";
}

/**
 * 
 * @param {number | string?} data 
 * @returns {string}
 */
function renderNumber(data) {
    return data ? new Number(data).toLocaleString("es-PY") : "0";
}

/**
 * 
 * @param {boolean} data 
 * @returns {string}
 */
function renderBoolean(data) {
    return data ? "SI" : "NO";
}

/**
 * 
 * @param {any} data 
 * @returns {string}
 */
function renderRaw(data) {
    return data ? new String(data) : "";
}

/**
 * @param {string} elementId etiqueta id de la table en el html
 * @param {DataTableColumn[]} columns 
 * @param {DataTableConfig} config
 * @returns {any}
 */
function crearDataTable(elementId, columns, config) {
    const default_config = {
        searching: true,
        buttons: false,
        pageLength: 10,
        exportTitle: "Reporte",
        actions: null
    };
    if (config) {
        Object.assign(default_config, config);
    }

    if (default_config.actions) {
        columns.push({
            data: null,
            title: "Acciones",
            className: "text-center",
            render: function (data, type, row) {
                const acts = default_config.actions(row);
                if (!acts) return "";
                let html = '<div class="btn-group btn-group-sm" role="group">';
                if (acts.edit) html += `<button type="button" class="btn btn-warning text-dark" onclick="${acts.edit}" title="Editar"><i class="bi bi-pencil-square"></i></button>`;
                if (acts.delete) html += `<button type="button" class="btn btn-danger" onclick="${acts.delete}" title="Eliminar"><i class="bi bi-trash"></i></button>`;
                if (acts.enable) html += `<button type="button" class="btn btn-success" onclick="${acts.enable}" title="Habilitar"><i class="bi bi-check-circle"></i></button>`;
                if (acts.disable) html += `<button type="button" class="btn btn-secondary" onclick="${acts.disable}" title="Deshabilitar"><i class="bi bi-x-circle"></i></button>`;
                if (acts.customs) {
                    for (const c of acts.customs) {
                        if (c.href) {
                            html += `<a class="btn ${c.color}" href="${c.href}" title="${c.title}" ${c.properties || ''}>${c.content}</a>`;
                        } else {
                            html += `<button type="button" class="btn ${c.color}" title="${c.title}" ${c.properties || ''}>${c.content}</button>`;
                        }
                    }
                }
                html += '</div>';
                return html;
            }
        });
    }

    const dtConfig = {
        columns: columns,
        pageLength: default_config.pageLength,
        searching: default_config.searching,
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json"
        }
    };

    if (default_config.buttons) {
        dtConfig.dom = '<"d-flex justify-content-between align-items-center mb-2"Bf>rtip';
        dtConfig.buttons = botonesCorporativos(default_config.exportTitle, ':visible');
    }

    return new DataTable(`#${elementId}`, dtConfig);
}

/**
 * Recargar datos a un DataTable
 * @param {any} datatable DataTable creado
 * @param {any[]} datos Array de nuevos datos
 */
function cargarDataTable(datatable, datos) {
    datatable.clear().rows.add(datos).draw();
}

function determinarOrientacion(tabla) {
    const datatable = $(tabla).DataTable();
    // Según columnas visibles
    const columnasVisibles = datatable.columns(':visible').count();
    if (columnasVisibles > 5) return 'landscape';
    // Según cantidad de caracteres en los encabezados
    let total = 0;
    datatable.columns(':visible').every(() => { total += $(this.header()).text().trim().length; });
    if (total > 80) return 'landscape';
    return 'portrait';
}

function estilizarImpresion(win, title) {
    const fecha = new Date().toLocaleString('es-PY');
    $(win.document.body).css({
        'font-family': 'Arial, sans-serif',
        'font-size': '10pt',
        'color': '#212529',
        'padding': '20px'
    });
    // ELIMINAR TITULO AUTOMÁTICO
    $(win.document.body).find('h1').remove();
    // MEMBRETE
    $(win.document.body).prepend(`
        <div style="border-bottom:3px solid #0d6efd;padding-bottom:15px;margin-bottom:20px;">
            <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="width:90px;">
                        <img src="img/logo_x128.jpg" style="width:75px; height:auto;">
                    </td>
                    <td>
                        <div style="font-size:24px;font-weight:bold;color:#0d6efd;letter-spacing:1px;">
                            VANGUARDIA
                        </div>
                        <div style="font-size:11px;margin-top:3px;">
                            Comercialización de Productos Informáticos y Tecnológicos
                        </div>
                        <div style="font-size:10px;color:#555;margin-top:5px;">
                            Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción
                        </div>
                        <div style="font-size:10px;color:#555;">
                            Tel.: 0985-495-253
                        </div>
                    </td>
                    <td style="text-align:right;vertical-align:top;font-size:10px;color:#666;">
                        ${fecha}
                    </td>
                </tr>
            </table>
        </div>
        <div style="text-align:center;font-size:18px;font-weight:bold;margin-bottom:20px;color:#222;">
            ${title}
        </div>
    `);
    // TABLA
    $(win.document.body).find('table').addClass('compact').css({ 'font-size': '9pt', 'border-collapse': 'collapse', 'width': '100%' });
    // HEADER TABLA
    $(win.document.body).find('thead th').css({ 'background-color': '#0d6efd', 'color': 'white', 'padding': '8px', 'text-align': 'center', 'border': '1px solid #dee2e6' });
    // BODY TABLA
    $(win.document.body).find('tbody td').css({ 'padding': '6px', 'border': '1px solid #dee2e6' });
    // FILAS ALTERNADAS
    $(win.document.body).find('tbody tr:odd').css({ 'background-color': '#f8f9fa' });
    // FOOTER
    $(win.document.body).append(`
        <div style="margin-top:20px;border-top:1px solid #dee2e6;padding-top:10px;font-size:9px;color:#666;text-align:center;">
            VANGUARDIA © ${new Date().getFullYear()}
        </div>
    `);
}

function estilizarExcel(xlsx, title) {
    const sheet = xlsx.xl.worksheets['sheet1.xml'];
    const styles = xlsx.xl['styles.xml'];

    const cellXfs = $('cellXfs', styles);
    const nuevoStyleIndex = $('xf', cellXfs).length;
    cellXfs.append(`
        <xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1" xfId="0">
            <alignment horizontal="center" vertical="center" wrapText="1"/>
        </xf>
    `);
    cellXfs.attr('count', nuevoStyleIndex + 1);
    // DETECTAR ULTIMA COLUMNA
    const primeraFilaTabla = $('row', sheet).eq(0);
    const ultimaCelda = $('c', primeraFilaTabla).last().attr('r');
    const ultimaColumnaLetra = ultimaCelda ? ultimaCelda.replace(/[0-9]/g, '') : 'G';
    // ENCABEZADO
    const lineasEncabezado = [
        'VANGUARDIA',
        'Comercialización de Productos Informáticos y Tecnológicos',
        'Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción',
        'Tel.: 0985-495-253',
        '',
        title.toUpperCase()
    ];
    // DESPLAZAR FILAS
    const cantidadFilasNuevas = lineasEncabezado.length;
    $('row', sheet).each(function () {
        const nuevoR = parseInt($(this).attr('r')) + cantidadFilasNuevas;
        $(this).attr('r', nuevoR);
        $('c', this).each(function () {
            const r = $(this).attr('r');
            const letra = r.replace(/[0-9]/g, '');
            const numero = parseInt(r.replace(/[^0-9]/g, '')) + cantidadFilasNuevas;
            $(this).attr('r', letra + numero);
        });
    });
    // CREAR FILAS
    let filasXml = '';
    let mergeCellsXml = '';
    lineasEncabezado.forEach((texto, index) => {
        const fila = index + 1;
        filasXml += `<row r="${fila}">`;
        if (texto !== '') {
            filasXml += `
                <c r="A${fila}" t="inlineStr" s="${nuevoStyleIndex}">
                    <is>
                        <t>${texto}</t>
                    </is>
                </c>
            `;
            mergeCellsXml += `<mergeCell ref="A${fila}:${ultimaColumnaLetra}${fila}"/>`;
        }
        filasXml += `</row>`;
    });
    $('sheetData', sheet).prepend(filasXml);
    // COMBINAR CELDAS
    if (mergeCellsXml !== '') {
        let mergeCellsContainer = $('mergeCells', sheet);
        if (mergeCellsContainer.length === 0) {
            $('sheetData', sheet).after(`
                <mergeCells count="0">
                    ${mergeCellsXml}
                </mergeCells>
            `);
            mergeCellsContainer = $('mergeCells', sheet);
        } else {
            mergeCellsContainer.prepend(mergeCellsXml);
        }
        const totalMerge = $('mergeCell', mergeCellsContainer).length;
        mergeCellsContainer.attr('count', totalMerge);
    }
    // CENTRAR ENCABEZADOS
    $('row[r="7"] c', sheet).attr('s', nuevoStyleIndex);
}

async function estilizarPDF(doc, title) {
    const logo = await logoBase64;
    const fecha = new Date().toLocaleString('es-PY');
    // MARGENES
    doc.pageMargins = [30, 110, 30, 60];
    // ENCABEZADO
    doc.header = {
        margin: [30, 20, 30, 0],
        stack: [
            { canvas: [{ type: 'rect', x: 0, y: 0, w: 760,h: 8, color: '#0d6efd'}] },
            {
                margin: [0, 12, 0, 0],
                columns: [
                    { image: logo, width: 60 },
                    {
                        width: '*',
                        margin: [15, 0, 0, 0],
                        stack: [
                            { text: 'VANGUARDIA', fontSize: 22, bold: true, color: '#0d6efd' },
                            { text: 'Comercialización de Productos Informáticos y Tecnológicos', fontSize: 10, margin: [0, 3, 0, 0] },
                            { text: 'Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción', fontSize: 8, color: '#666' },
                            { text: 'Tel.: 0985-495-253', fontSize: 8, color: '#666' }
                        ]
                    },
                    { width: 120, alignment: 'right', text: fecha, fontSize: 8, color: '#666' }
                ]
            }
        ]
    };
    // PIE DE PAGINA
    doc.footer = (currentPage, pageCount) => ({
        margin: [30, 0, 30, 15],
        stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 1, lineColor: '#dee2e6' }] },
            {
                margin: [0, 8, 0, 0],
                columns: [
                    { text: 'VANGUARDIA © ' + new Date().getFullYear(), fontSize: 8, color: '#666' },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 8, color: '#666' }
                ]
            }
        ]
    });
    // TITULO
    doc.content.unshift({ text: title, alignment: 'center', fontSize: 16, bold: true, margin: [0, 0, 0, 15], color: '#222' });
    // TABLA
    const tableIndex = doc.content.findIndex(c => c.table);
    if (tableIndex !== -1) {
        doc.content[tableIndex].layout = {
            fillColor: rowIndex => rowIndex === 0 ? '#0d6efd' : (rowIndex % 2 === 0 ? '#f8f9fa' : null),
            hLineColor: () => '#dee2e6',
            vLineColor: () => '#dee2e6',
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4
        };
        doc.styles.tableHeader = { bold: true, color: 'white', alignment: 'center', fontSize: 9 };
        doc.defaultStyle.fontSize = 8;
    }
}

function botonesCorporativos(titulo, columns) {
    titulo = titulo.toUpperCase();
    return [
        {
            extend: 'print',
            text: '<i class="bi bi-printer-fill"></i> Imprimir',
            titleAttr: 'Imprimir',
            className: 'btn btn-sm btn-info',
            exportOptions: { columns: columns },
            customize: estilizarImpresion 
        },
        {
            extend: 'excelHtml5',
            text: '<i class="bi bi-file-earmark-excel-fill"></i> Excel',
            titleAttr: 'Exportar a Excel',
            className: 'btn btn-sm btn-success',
            exportOptions: { columns: columns },
            title: null,
            messageTop: 'VANGUARDIA\n' + 
                'Comercialización de Productos Informáticos y Tecnológicos\n' +
                'Dir.: Previstero Juan Carlos García / Madrinas de Guerra – Bo. Villa Armando – Concepción\n' +
                'Tel.: 0985-495-253\n\n' +
                titulo,
            messageBottom: '\nReporte generado: ' + renderFecha(new Date()),
            customize: estilizarExcel 
        },
        {
            extend: 'pdfHtml5',
            text: '<i class="bi bi-file-earmark-pdf-fill"></i> PDF',
            titleAttr: 'Exportar a PDF',
            className: 'btn btn-sm btn-danger',
            exportOptions: { columns: columns },
            orientation: 'landscape',
            pageSize: 'A4',
            customize: estilizarPDF 
        }
    ];
}