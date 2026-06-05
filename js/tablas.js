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
 * @typedef {import("./bd.js")}
 * 
 * @typedef {Object} DataTableColumn
 * @property {string?} data Propiedad de cada registro a procesar, null todo el objeto
 * @property {string} title Nombre de la columna
 * @property {(function(any): any)?} render Funcion para transformar el valor
 * @property {"left" | "center" | "right"?} align Alineacion de los datos
 * @property {DataTableColumn[]?} subtable Subtabla para exportar
 * @property {any[][]} subtableData Generado automaticamente al cargar datos
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

const logoBase64 = descargarImagen("img/logo_x128.jpg");

/**
 * @param {string | number | Date?} data 
 * @returns {string}
 */
function renderDate(data) {
    return data ? new Date(data).toLocaleDateString(Intl.DateTimeFormat, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
}

/**
 * @param {string | number | Date?} data 
 * @returns {string}
 */
function renderTime(data) {
    return data ? new Date(data).toLocaleTimeString(Intl.DateTimeFormat, { hour: "2-digit", minute: "2-digit", second: "2-digit"}) : "";
}

/**
 * @param {string | number | Date?} data 
 * @returns {string}
 */
function renderFecha(data) {
    return data ? `${renderDate(data)} ${renderTime(data)}` : "";
}


/**
 * Formatear fecha para inputs de tipo datetime-local
 * @param {string | number | Date} data 
 * @returns {string}
 */
function toISOLocalString(data) {
    const fecha = new Date(data);
    return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

/**
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
 * @param {string?} data 
 * @returns {string}
 */
function renderString(data) {
    return data ? escapeHTML(data.toString().toUpperCase()) : "";
}

/**
 * @param {string?} data 
 * @returns {string}
 */
function renderLowerString(data) {
    return data ? escapeHTML(data.toString().toLowerCase()) : "";
}

/**
 * @param {number | string?} data 
 * @returns {string}
 */
function renderNumber(data) {
    return data ? new Number(data).toLocaleString("es-PY") : "0";
}

/**
 * @param {boolean} data 
 * @returns {string}
 */
function renderBoolean(data) {
    return data ? "ACTIVO" : "INACTIVO";
}

/**
 * @param {any} data 
 * @returns {string}
 */
function renderRaw(data) {
    return data ? new String(data) : "";
}

/**
 * @param {DataTableColumn} column 
 */
function interceptarFilas(column) {
    const filas = [];
    const render = column.render;
    return {
        rows: filas,
        render: row => {
            row = render ? render(row) : row;
            filas.push(row);
            return "";
        }
    };
}

/**
 * @param {string} elementId etiqueta id de la table en el html
 * @param {DataTableColumn[]} columns 
 * @param {DataTableConfig} config
 * @returns {any}
 */
function crearDataTable(elementId, columns, config) {
    const dtconfig = Object.assign({
        language: spanish,
        responsive: true,
        searching: false,
        lengthChange: false,
        pageLength: 5,
        order: [[0, 'desc']],
        dom: "rtip",
        exportTitle: "REPORTE"
    }, config);
    
    if (dtconfig.searching || dtconfig.actions) {
        dtconfig.dom = '<"d-'
            + (dtconfig.buttons ? 'flex' : 'grid')
            + ' justify-content-between align-items-center mb-2"'
            + (dtconfig.buttons ? 'B' : '')
            + (dtconfig.searching ? 'f' : '')
            + `>${dtconfig.dom}`;
    }
    // Alineacion
    columns.forEach(col => {
        const align = col.align || "left";
        delete col["align"];
        col.className = `dt-head-center dt-body-${align}`;
    });
    // Acciones
    if (dtconfig.actions) {
        columns.push({
            data: null,
            title: "Acciones",
            className: "text-center",
            render: data => {
                const actions = dtconfig.actions(data);
                const buttons = [
                    ...(actions.edit ? [{
                        color: "btn-warning",
                        content: "<i class=\"bi bi-pencil-square\"></i>",
                        title: "Editar",
                        properties: `onclick="${actions.edit}"`,
                    }] : []),
                    ...(actions.delete ? [{
                        color: "btn-danger",
                        content: "<i class=\"bi bi-trash\"></i>",
                        title: "Eliminar",
                        properties: `onclick="${actions.delete}"`,
                    }] : []),
                    ...(actions.enable ? [{
                        color: "btn-success",
                        content: "<i class=\"bi bi-check-circle\"></i>",
                        title: "Activar",
                        properties: `onclick="${actions.enable}"`,
                    }] : []),
                    ...(actions.disable ? [{
                        color: "btn-secondary",
                        content: "<i class=\"bi bi-ban\"></i>",
                        title: "Anular",
                        properties: `onclick="${actions.disable}"`,
                    }] : []),
                    ...(actions.customs || [])
                ];
                let actionsHtml = "";
                for (const button of buttons) {
                    const tag = button.href ? 'a' : 'button';
                    const href = button.href ? `href="${button.href}"` : '';
                    const properties = button.properties ? button.properties.trim() : '';
                    actionsHtml = `
                        <${tag} class="btn btn-sm ${button.color.trim()} me-1"
                                ${href}
                                ${properties}
                                title="${button.title.trim()}">
                            ${button.content.trim()}
                        </${tag}>
                    ` + actionsHtml;
                }
                return `<div class="d-flex align-items-center">${actionsHtml}</div>`;
            }
        });
    }
    // Exportar
    if (dtconfig.buttons) {
        dtconfig.buttons = botonesCorporativos(dtconfig.exportTitle, columns, elementId, Boolean(dtconfig.actions));
    }
    // Subtablas
    const columnDefs = [];
    for (let i = columns.length -1; i >= 0; i--) {
        if (!columns[i].subtable) continue;
        const { rows, render } = interceptarFilas(columns[i]);
        columns[i].render = render;
        columns[i].subtableData = rows;
        // Ocultar subtabla
        columnDefs.unshift({ targets: i, visible: false });
    }
    dtconfig.columns = columns;
    dtconfig.columnDefs = columnDefs;
    return new DataTable(`#${elementId}`, dtconfig);
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

/**
 * @param {any} win 
 * @param {string} title 
 * @param {DataTableColumn[]} subtables 
 */
function estilizarImpresion(win, title, subtables) {
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
    const emp = cargarEmpresa();
                const empNombre = emp?.legal_name?.toUpperCase() || 'VANGUARDIA';
                const empSlogan = emp?.slogan || '';
                const empDir = emp?.address || '';
                const empTel = emp?.tel || '';

    $(win.document.body).prepend(`
                    ...
                        <div style="font-size:24px;font-weight:bold;color:#0d6efd;letter-spacing:1px;">
                        ${empNombre}
                        </div>
                        <div style="font-size:11px;margin-top:3px;">
                        ${empSlogan}
                        </div>
                        <div style="font-size:10px;color:#555;margin-top:5px;">
                        Dir.: ${empDir}
                        </div>
                        <div style="font-size:10px;color:#555;">
                        Tel.: ${empTel}
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

/**
 * @param {any} xlsx 
 * @param {string} title 
 * @param {DataTableColumn[]} subtables 
 */
function estilizarExcel(xlsx, title, subtables) {
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

/**
 * @param {any} doc 
 * @param {string} title 
 * @param {DataTableColumn[]} subtables 
 */
async function estilizarPDF(doc, title, subtables) {
    const logo = await logoBase64;
    const fecha = renderFecha(new Date());
    const empresa = cargarEmpresa();
    if (!empresa) {
        mensajeError("No se pudo cargar los datos de la empresa");
        return;
    }
    const nombreEmpresa = empresa.legal_name.toUpperCase();
    const sloganEmpresa = empresa.slogan;
    const direccionEmpresa = empresa.address;
    const telEmpresa = empresa.tel;
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
                           { text: nombreEmpresa, fontSize: 22, bold: true, color: '#0d6efd' },
                           { text: sloganEmpresa, fontSize: 10, margin: [0, 3, 0, 0] },
                           { text: 'Dir.: ' + direccionEmpresa, fontSize: 8, color: '#666' },
                           { text: 'Tel.: ' + telEmpresa, fontSize: 8, color: '#666' }
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
    if (!tableIndex) return;
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
    // TABLA 100% ANCHO
    const body = doc.content[tableIndex].table.body;
    const numCols = body[0]?.length || 1;
    doc.content[tableIndex].table.widths = Array(numCols).fill('*');
    alinearColumnasNumericas(body);
    if (subtables === -1) return;
    const table = doc.content[tableIndex];
    const mainLayout = table.layout;
    const subLayout = {
        fillColor: i => i === 0 ? '#4e524f' : (i % 2 === 0 ? '#f8f9fa' : null),
        hLineColor: () => '#dee2e6',
        vLineColor: () => '#dee2e6',
        hLineWidth: () => 0.7,
        vLineWidth: () => 0.7,
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 4,
        paddingBottom: () => 4
    };
    // const body = table.table.body;
    const header = body[0];
    const content = [];
    for (let idx = 1; idx < body.length; idx++) {
        content.push({
            table: {
                headerRows: 1,
                widths: Array(header.length).fill("*"),
                body: [structuredClone(header), body[idx]]
            },
            layout: mainLayout,
            margin: [0, 0, 0, 4]
        })
        for (const subtable of subtables) {
            const tableData = subtable.subtableData[idx-1];
            const subHeader = subtable.subtable;
            const subBody = [
                subtable.subtable.map(col => ({
                    text: col.title,
                    style: 'tableHeader'
                })),
                ...tableData.map(row => subtable.subtable.map(col => {
                    let data = col.data ? row[col.data] : row;
                    if (col.render) data = col.render(data);
                    return {
                        text: String(data ?? ""),
                        style: "tableBodyOdd"
                    };
                }))
            ];
            alinearColumnasNumericas(subBody);
            content.push({
                table: {
                    headerRows: 1,
                    widths: Array(subHeader.length).fill("*"),
                    body: subBody
                },
                layout: subLayout,
                margin: [0, 0, 0, 8]
            });
            content.push({ text: '', margin: [0, 4, 0, 4] });
        }
    }
    doc.content.splice(tableIndex, 1, ...content);
}

/**
 * @param {any[][]} body 
 * @param {number} start 
 */
function alinearColumnasNumericas(body, start) {
    const reNumero = /^(?=.*\d)[^\p{L}]+$/u;
    for (let col = 0; col < body[0].length; col++) {
        const numerico = body.slice(start ?? 1).every(row => {
            const celda = row[col];
            const texto = typeof celda === 'object' ? (celda.text ?? '') : (celda ?? '');
            return String(texto).match(reNumero);
        });
        if (!numerico) continue;
        body.forEach((row, rowIdx) => {
            const celda = row[col];
            if (typeof celda === 'object') {
                celda.alignment = rowIdx === 0 ? 'center' : 'right';
            } else {
                row[col] = {
                    text: String(celda ?? ''),
                    alignment: rowIdx === 0 ? 'center' : 'right'
                };
            }
        });
    }
}

/**
 * @param {string} exportTitle 
 * @param {DataTableColumn[]} columns 
 * @param {string} elementId 
 * @param {boolean} actions 
 * @returns {Object}
 */
function botonesCorporativos(exportTitle, columns, elementId, actions) {
    const exportColumns = [];
    const subtables = [];
    columns.map((col, index) => col.subtable ? subtables.push(index) : exportColumns.push(index));
    if (actions) exportColumns.pop();
    exportTitle = exportTitle.toUpperCase();
    return {
        dom: { button: { className: "btn" } },
        buttons: [
            {
                extend: "print",
                text: "<i class=\"bi bi-printer-fill\"></i> Imprimir",
                titleAttr: "Imprimir",
                className: "btn btn-sm btn-info",
                exportOptions: { columns: exportColumns },
                customize: win => estilizarImpresion(win, exportTitle, subtables.map(i => columns[i]))
            },
            {
                extend: "excelHtml5",
                title: null,
                text: "<i class=\"bi bi-file-earmark-excel-fill\"></i> Exportar a Excel",
                titleAttr: "Exportar a Excel",
                className: "btn btn-sm btn-success",
                exportOptions: { columns: exportColumns },
                customize: xlsx => estilizarExcel(xlsx, exportTitle, subtables.map(i => columns[i])),
            },
            {
                extend: "pdfHtml5",
                title: null,
                text: "<i class=\"bi bi-file-earmark-pdf-fill\"></i> Exportar a PDF",
                titleAttr: "Exportar a PDF",
                className: "btn btn-sm btn-danger",
                exportOptions: { columns: exportColumns },
                // orientation: () => determinarOrientacion(`#${elementId}`),
                orientation: 'landscape',
                pageSize: 'A4',
                customize: doc => {console.log();estilizarPDF(doc, exportTitle, subtables.map(i => columns[i]));}
            }
        ]
    };
}

const TABLAS = {
    ROL: [
        { data: "id", title: "Id Rol", align: "right", render: renderRaw },
        { data: "name", title: "Nombre", align: "left", render: renderString },
        { data: "description", title: "Descripción", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    USUARIO: [
        { data: "id", title: "Id Usuario", align: "right", render: renderRaw },
        { data: "username", title: "Usuario", align: "left", render: renderString },
        { data: "name", title: "Nombre Completo", align: "left", render: renderString },
        { data: "ruc", title: "Cédula / RUC", align: "right", render: renderString },
        { data: "tel", title: "Teléfono", align: "right", render: renderString },
        { data: "email", title: "Correo Electrónico", align: "left", render: renderLowerString },
        { data: "address", title: "Dirección", align: "left", render: renderString },
        { data: "rol_id", title: "Rol", align: "left", render: data => renderString(cargarRol(data).name) },
        { data: "active", title: "Activo", align: "center", render: renderBoolean },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    CLIENTE: [
        { data: "id", title: "Id Cliente", align: "right", render: renderRaw },
        { data: "legal_name", title: "Razón Social", align: "left", render: renderString },
        { data: "ruc", title: "Cédula / RUC", align: "right", render: renderString },
        { data: "tel", title: "Teléfono", align: "right", render: renderString },
        { data: "email", title: "Correo Electrónico", align: "left", render: renderLowerString },
        { data: "address", title: "Dirección", align: "left", render: renderString },
        { data: "active", title: "Activo", align: "center", render: renderBoolean },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    PROVEEDOR: [
        { data: "id", title: "Id Proveedor", align: "right", render: renderRaw },
        { data: "legal_name", title: "Razón Social", align: "left", render: renderString },
        { data: "ruc", title: "Cédula / RUC", align: "right", render: renderString },
        { data: "tel", title: "Teléfono", align: "left", render: renderString },
        { data: "email", title: "Correo Electrónico", align: "left", render: renderLowerString },
        { data: "address", title: "Dirección", align: "left", render: renderString },
        { data: "city", title: "Ciudad", align: "left", render: renderString },
        { data: "active", title: "Activo", align: "center", render: renderBoolean },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    CATEGORIA: [
        { data: "id", title: "Id Categoría", align: "right", render: renderRaw },
        { data: "name", title: "Nombre", align: "left", render: renderString },
        { data: "description", title: "Descripción", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    MARCA: [
        { data: "id", title: "Id Marca", align: "right", render: renderRaw },
        { data: "name", title: "Nombre", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    PRODUCTO: [
        { data: "id", title: "Id Producto", align: "right", render: renderRaw },
        { data: "code", title: "Código de Barra", align: "right", render: renderString },
        { data: "name", title: "Nombre", align: "left", render: renderString },
        { data: "description", title: "Descripción", align: "left", render: renderString },
        { data: "purchase_price", title: "Precio Compra", align: "right", render: renderMoneda },
        { data: "selling_price", title: "Precio Venta", align: "right", render: renderMoneda },
        { data: "stock", title: "Stock", align: "right", render: renderNumber },
        { data: "min_stock", title: "Stock Mínimo", align: "right", render: renderNumber },
        { data: "category_id", title: "Categoría", align: "left", render: data => cargarCategoria(data).name },
        { data: "brand_id", title: "Marca", align: "left", render: data => cargarMarca(data).name },
        { data: "iva", title: "Tipo IVA", align: "center", render: data => data ? `${data}%` : "EXENTA" },
        { data: "active", title: "Activo", align: "center", render: renderBoolean },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
        AJUSTE_STOCK: [
        { data: "id", title: "Id Ajuste", align: "right", render: renderRaw },
        { data: "product_id", title: "Producto", align: "left", render: data => cargarProducto(data).name },
        { data: "type", title: "Tipo", align: "left", render: renderString },
        { data: "quantity", title: "Cantidad", align: "right", render: renderNumber },
        { data: "previous_stock", title: "Stock Anterior", align: "right", render: renderNumber },
        { data: "new_stock", title: "Stock Nuevo", align: "right", render: renderNumber },
        { data: "reason", title: "Motivo", align: "left", render: renderString },
        { data: "created_at", title: "Fecha", align: "left", render: renderFecha }
    ],
    COMPRA: [
        { data: "id", title: "Id Compra", align: "right", render: renderRaw },
        { data: "provider_id", title: "Proveedor", align: "left", render: data => cargarProveedor(data).legal_name },
        { data: "user_id", title: "Id Usuario", align: "left", render: data => cargarUsuario(data).username },
        { data: "condition", title: "Condición", align: "left", render: renderString },
        { data: null, title: "IVA", align: "left", render: data => {
            const tipos = [...new Set(cargarCompraDetalles(data.id).map(d => d.iva).filter(iva => iva > 0))];
            return tipos.length ? tipos.sort().map(t => `${t}%`).join(' / ') : 'EXENTA';
        }},
        { data: "amount", title: "Total Pago", align: "right", render: renderMoneda },
        { data: "invoice", title: "Nro. Factura", align: "right", render: renderString },
        { data: "stamping", title: "Nro. Timbrado", align: "right", render: renderString },
        { data: "created_at", title: "Fecha Compra", align: "left", render: renderFecha }
    ],
    COMPRA_DETALLE: [
        { data: "id", title: "Id Detalle", align: "right", render: renderRaw },
        { data: "purchase_id", title: "Id Compra", align: "right", render: renderRaw },
        { data: "product_id", title: "Producto", align: "left", render: data => cargarProducto(data).name },
        { data: "amount", title: "Cantidad", align: "right", render: renderNumber },
        { data: "unit_price", title: "Precio Unitario", align: "right", render: renderMoneda },
        { data: "subtotal", title: "Subtotal", align: "right", render: renderMoneda },
        { data: "iva", title: "Tipo IVA", align: "left", render: data => data ? `${data}%` : "EXENTA" },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha }
    ],
    VENTA: [
        { data: "id", title: "Id Venta", align: "right", render: renderRaw },
        { data: "client_id", title: "Cliente", align: "left", render: data => cargarCliente(data).legal_name },
        { data: "user_id", title: "Usuario", align: "left", render: data => cargarUsuario(data).username },
        { data: "condition", title: "Condición", align: "left", render: renderString },
        { data: "amount", title: "Total Pago", align: "right", render: renderMoneda },
        { data: "invoice", title: "Nro. Factura", align: "right", render: renderString },
        { data: "created_at", title: "Fecha Venta", align: "left", render: renderFecha }
    ],
    VENTA_DETALLE: [
        { data: "id", title: "Id Detalle", align: "right", render: renderRaw },
        { data: "sale_id", title: "Id Venta", align: "right", render: renderRaw },
        { data: "product_id", title: "Producto", align: "left", render: data => cargarProducto(data).name },
        { data: "amount", title: "Cantidad", align: "right", render: renderNumber },
        { data: "unit_price", title: "Precio Unitario", align: "right", render: renderMoneda },
        { data: "subtotal", title: "Subtotal", align: "right", render: renderMoneda },
        { data: "iva", title: "Tipo IVA", align: "left", render: data => data ? `${data}%` : "EXENTA" },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha }
    ],
    CUENTA_POR_PAGAR: [
        { data: "id", title: "Id Cuenta", align: "right", render: renderRaw },
        { data: "purchase_id", title: "Id Compra", align: "right", render: renderRaw },
        { data: "provider_id", title: "Proveedor", align: "left", render: data => cargarProveedor(data).legal_name },
        { data: "amount_total", title: "Total a Pagar", align: "right", render: renderMoneda },
        { data: "installments", title: "Cantidad Cuotas", align: "right", render: renderNumber },
        { data: "installment_type", title: "Frecuencia Cuotas", align: "left", render: renderString },
        { data: "status", title: "Estado", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    CUENTA_POR_COBRAR: [
        { data: "id", title: "Id Cuenta", align: "right", render: renderRaw },
        { data: "sale_id", title: "Id Venta", align: "right", render: renderRaw },
        { data: "client_id", title: "Cliente", align: "left", render: data => cargarCliente(data).legal_name },
        { data: "amount_total", title: "Monto Total", align: "right", render: renderMoneda },
        { data: "installments", title: "Cantidad Cuotas", align: "right", render: renderNumber },
        { data: "installment_type", title: "Frecuencia Cuotas", align: "left", render: renderString },
        { data: "status", title: "Estado", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    CUOTA_POR_PAGAR: [
        { data: "id", title: "Id Cuota", align: "right", render: renderRaw },
        { data: "account_payable_id", title: "Id Cuenta", align: "right", render: renderRaw },
        { data: "installment_number", title: "Número Cuota", align: "right", render: renderNumber },
        { data: "amount", title: "Importe", align: "right", render: renderMoneda },
        { data: "amount_paid", title: "Monto abonado", align: "right", render: renderMoneda },
        { data: "status", title: "Estado", align: "left", render: renderString },
        { data: "due_date", title: "Fecha Vencimiento", align: "left", render: renderFecha },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }
    ],
    CUOTA_POR_COBRAR: [
        { data: "id", title: "Id Cuota", align: "right", render: renderRaw },
        { data: "account_receivable_id", title: "Id Cuenta", align: "right", render: renderRaw },
        { data: "installment_number", title: "Número Cuota", align: "right", render: renderNumber },
        { data: "amount", title: "Importe", align: "right", render: renderMoneda },
        { data: "amount_paid", title: "Monto cobrado", align: "right", render: renderMoneda },
        { data: "status", title: "Estado", align: "left", render: renderString },
        { data: "due_date", title: "Fecha Vencimiento", align: "left", render: renderFecha },
        { data: "created_at", title: "Fecha Creación", align: "left", render: renderFecha },
        { data: "updated_at", title: "Fecha Modificación", align: "left", render: renderFecha }        
    ],
    PAGO: [
        { data: "id", title: "Id Pago", align: "right", render: renderRaw },
        { data: "installment_payable_id", title: "Id Cuota", align: "right", render: renderRaw },
        { data: "purchase_id", title: "Id Compra", align: "right", render: renderRaw },
        { data: "amount", title: "Monto Pagado", align: "right", render: renderMoneda },
        { data: "payment_method", title: "Método Pago", align: "left", render: renderString },
        { data: "obs", title: "Observaciones / Ref.", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Pago", align: "left", render: renderFecha }
    ],
    COBRO: [
        { data: "id", title: "Id Cobro", align: "right", render: renderRaw },
        { data: "installment_receivable_id", title: "Fac. Venta Credito", align: "center", render: data =>
            cargarVenta(cargarCuentaPorCobrar(cargarCuotaPorCobrar(data)?.account_receivable_id)?.sale_id)?.invoice ?? "" },
        { data: "sale_id", title: "Fac. Venta Contado", align: "center", render: data => cargarVenta(data)?.invoice ?? "" },
        { data: "amount", title: "Monto Cobrado", align: "right", render: renderMoneda },
        { data: "payment_method", title: "Método Cobro", align: "left", render: renderString },
        { data: "obs", title: "Factura / Comprobante", align: "left", render: renderString },
        { data: "created_at", title: "Fecha Cobro", align: "left", render: renderFecha }
    ]
};
