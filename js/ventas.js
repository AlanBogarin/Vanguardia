/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 * 
 * @typedef {Object} DetalleTemp
 * @property {number} _uid 
 * @property {number} product_id 
 * @property {string} nombre 
 * @property {number} amount 
 * @property {number} unit_price 
 * @property {number} subtotal 
 */

const modalVerDetallesVenta = new bootstrap.Modal(document.getElementById("modalVerDetalles"));

/** @type {DetalleTemp} */
let detallesTemp = [];
let _uidCounter  = 0;

const tablaVentas = crearDataTable("tabla_ventas", [
    ...TABLAS.VENTA,
    { data: null, title: "DETALLES", subtable: TABLAS.VENTA_DETALLE, render: data => cargarVentaDetalles(data.id) }
], {
    buttons: true, 
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE VENTAS",
    actions: (venta) => ({
        edit: null,
        delete: null,
        enable: null,
        disable: null,
        customs: [
            {
                color: "btn-info",
                content: '<i class="bi bi-eye"></i>',
                properties: `onclick="abrirDetallesVenta(${venta.id})"`,
                title: "Ver detalles"
            },
            {
                color: "btn-danger",
                content: '<i class="bi bi-file-earmark-pdf"></i>',
                properties: `onclick="imprimirFacturaVenta(${venta.id})"`,
                title: "Reimprimir Factura"
            }
        ]
    })
});

function onClickLimpiarFiltros() {
    document.getElementById("filtro_condicion").value = "";
    document.getElementById("filtro_cliente_search").value = "";
    document.getElementById("filtro_total_min").value = "";
    document.getElementById("filtro_total_max").value = "";
    document.getElementById("filtro_fecha_desde").value = "";
    document.getElementById("filtro_fecha_hasta").value = "";
    cargarDatos();
}

function cargarSelectClientes() {
    const clientesElem = document.getElementById("datalist_clientes");
    const filtroClientesElem = document.getElementById("datalist_filtro_clientes");
    const ventas = cargarVentas();
    clientesElem.innerHTML = filtroClientesElem.innerHTML = cargarClientes()
        .filter(c => c.active && ventas.some(v => v.client_id === c.id))
        .map(c => `<option data-id="${c.id}" value="${c.legal_name}">${c.ruc}</option>`).join("");
    document.getElementById("client_search").value = "";
    document.getElementById("client_id").value = "";
}

function onInputCliente() {
    const texto = $("#client_search").val().trim();
    const opt   = $("#datalist_clientes option").filter(function() {
        return $(this).val() === texto;
    });
    if (opt.length) {
        $("#client_id").val(opt.data("id"));
    } else {
        $("#client_id").val("");
    }
}

function cargarSelectProductos() {
    // Llenar datalist para búsqueda de productos
    const $dl = $("#datalist_productos").empty();
    cargarProductos()
        .filter(p => p.active !== false && p.stock > 0)
        .forEach(p => $dl.append(
            `<option data-id="${p.id}" data-precio="${p.selling_price}" data-stock="${p.stock}"
                     value="${p.name} — Cód: ${p.code}">`
        ));
    $("#producto_search").val("");
    $("#precio_input").val("");
}

function onInputProducto() {
    const texto = $("#producto_search").val().trim();
    const opt   = $("#datalist_productos option").filter(function() {
        return $(this).val() === texto;
    });
    if (opt.length) {
        $("#precio_input").val(opt.data("precio"));
        $("#producto_search").data("selected-id",  opt.data("id"));
        $("#producto_search").data("selected-stock", opt.data("stock"));
        $("#cantidad_input").val("1").focus();
    } else {
        $("#precio_input").val("");
        $("#producto_search").data("selected-id", "");
        $("#producto_search").data("selected-stock", "");
    }
}

function btnAgregarDetalle() {
    const productId = parseInt($("#producto_search").data("selected-id"));
    const stock = parseInt($("#producto_search").data("selected-stock")) || 0;
    const cantidad = parseInt($("#cantidad_input").val());
    const precio = parseFloat($("#precio_input").val());

    if (!productId) {
        mensajeWarn("Seleccione un producto de la lista.");
        return;
    }
    if (!cantidad || cantidad < 1) {
        mensajeWarn("Por favor ingrese cuántas unidades desea agregar (mínimo 1).");
        return;
    }
    if (!precio || precio <= 0){
        mensajeWarn("El precio no puede ser cero.");
        return;
    }

    // Stock considerando lo ya cargado
    const yaAgregado = detallesTemp
        .filter(d => d.product_id === productId)
        .reduce((s, d) => s + d.amount, 0);

    if (yaAgregado + cantidad > stock) {
        mensajeWarn(`Stock insuficiente. Disponible: ${stock - yaAgregado}`);
        return;
    }

    // Acumular si ya existe el mismo producto
    const existe = detallesTemp.find(d => d.product_id === productId);
    if (existe) {
        existe.amount  += cantidad;
        existe.subtotal = existe.amount * existe.unit_price;
    } else {
        _uidCounter++;
        detallesTemp.push({
            _uid:       _uidCounter,
            product_id: productId,
            nombre:     $("#producto_search").val().split(" — Cód:")[0].trim(),
            amount:     cantidad,
            unit_price: precio,
            subtotal:   cantidad * precio
        });
    }
    renderTablaDetalle();
    $("#producto_search").val("").data("selected-id", "").data("selected-stock", "");
    $("#precio_input").val("");
    $("#cantidad_input").val("");
}

function quitarDetalle(uid) {
    // Requiere autorización del supervisor/admin
    confirmar(
        "Autorización requerida",
        "¿Confirma que está autorizado para quitar este artículo?",
        () => {
            detallesTemp = detallesTemp.filter(d => d._uid !== uid);
            renderTablaDetalle();
            mensajeSuccess("Artículo quitado de la venta.");
        },
        () => {}
    );
}

function renderTablaDetalle() {
    const $tbody = $("#tabla_detalles_venta tbody").empty();
    let total = 0;

    detallesTemp.forEach(d => {
        total += d.subtotal;
        $tbody.append(`
            <tr>
                <td>${d.nombre}</td>
                <td class="text-center">${d.amount}</td>
                <td class="text-end">${renderMoneda(d.unit_price)}</td>
                <td class="text-end">${renderMoneda(d.subtotal)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="quitarDetalle(${d._uid})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });

    $("#total_venta").text(renderMoneda(total));
}

function btnGuardarNuevaVenta() {
    const clientId = parseInt($("#client_id").val());
    const condition = $("#condition").val();

    if (!clientId) { mensajeWarn("Por favor busque y seleccione un cliente de la lista."); return; }
    if (detallesTemp.length === 0) { mensajeWarn("Agregue al menos un producto."); return; }

    const total = detallesTemp.reduce((s, d) => s + d.subtotal, 0);

    if (condition === "CONTADO") {
        abrirModalCobroContado(total);
    } else {
        confirmar(
            "Confirmar Venta a Crédito",
            `Total: <strong>Gs. ${renderMoneda(total)}</strong><br>Condición de cobro: CRÉDITO`,
            () => {
                ejecutarGuardadoVenta(CONDICION_CREDITO, total, []);
            },
            () => {}
        );
    }
}

let cobrosTemp = [];
let ventaTotalTemp = 0;
let ultimaVentaIdParaFactura = null;

function abrirModalCobroContado(total) {
    cobrosTemp = [];
    ventaTotalTemp = total;
    $("#cobro_total_pagar").text(renderMoneda(total) + " Gs.");
    $("#cobro_monto").val("");
    actualizarTablaCobrosTemp();
    $("#modalCobroContado").modal("show");
}

function actualizarTablaCobrosTemp() {
    const $tbody = $("#tabla_cobros_temp tbody").empty();
    let totalPagado = 0;
    cobrosTemp.forEach((c, idx) => {
        totalPagado += c.amount;
        $tbody.append(`
            <tr>
                <td>${c.payment_method}</td>
                <td class="text-end">${renderMoneda(c.amount)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger py-0" onclick="quitarCobroTemp(${idx})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `);
    });
    $("#cobro_total_pagado").text(renderMoneda(totalPagado) + " Gs.");
    const diferencia = totalPagado - ventaTotalTemp;
    if (diferencia >= 0) {
        $("#cobro_restante").text(
            `Vuelto: ${renderMoneda(diferencia)} Gs.`
        );
        $("#btnConfirmarCobro").prop("disabled", false);
    } else {
        $("#cobro_restante").text(
            `Faltante: ${renderMoneda(Math.abs(diferencia))} Gs.`
        );
        $("#btnConfirmarCobro").prop("disabled", true);
    }
}

function quitarCobroTemp(idx) {
    cobrosTemp.splice(idx, 1);
    actualizarTablaCobrosTemp();
}

function btnAgregarCobro() {
    const method = $("#cobro_metodo").val();
    const amount = parseFloat($("#cobro_monto").val());
    if (!amount || amount <= 0) {
        mensajeWarn("Ingrese un monto válido.");
        return;
    }
    cobrosTemp.push({ payment_method: method, amount: amount });
    $("#cobro_monto").val("");
    actualizarTablaCobrosTemp();
}

function btnConfirmarCobro() {
    const totalPagado = cobrosTemp.reduce((sum, c) => sum + c.amount, 0);
    if (totalPagado < ventaTotalTemp) {
        mensajeWarn("El monto pagado es insuficiente.");
        return;
    }
    const vuelto = totalPagado - ventaTotalTemp;
    if (vuelto > 0) {
        mensajeSuccess(`Vuelto: ${renderMoneda(vuelto)} Gs.`);
    }
    $("#modalCobroContado").modal("hide");
    ejecutarGuardadoVenta("CONTADO", ventaTotalTemp, cobrosTemp);
}

function ejecutarGuardadoVenta(condition, total, cobrosArray) {
    const clientId = parseInt($("#client_id").val());
    const sesion  = cargarSesion();
    const ventas  = cargarVentas();
    const idVenta  = obtenerSiguienteId(ventas);
    const ahora    = new Date();

    const nroFactura = `001-001-${String(idVenta).padStart(7, "0")}`;

    guardarVenta({
        id:           idVenta,
        client_id:    clientId,
        user_id:      sesion ? sesion.user_id : null,
        condition:    condition,
        amount:       total,
        invoice:      nroFactura,
        created_at:   ahora
    });

    detallesTemp.forEach(d => {
        const prod = cargarProducto(d.product_id);
        const iva = prod ? prod.iva : 10;
        guardarVentaDetalle({
            id:         obtenerSiguienteId(cargarVentaDetalles()),
            sale_id:    idVenta,
            product_id: d.product_id,
            amount:     d.amount,
            unit_price: d.unit_price,
            subtotal:   d.subtotal,
            iva:        iva,
            created_at: ahora
        });

        if (prod) {
            prod.stock -= d.amount;
            prod.updated_at = ahora;
            guardarProducto(prod);
        }
    });

    if (condition === CONDICION_CREDITO) {
        const cuentas = cargarCuentasPorCobrar();
        guardarCuentaPorCobrar({
            id: obtenerSiguienteId(cuentas),
            sale_id: idVenta,
            client_id: clientId,
            amount_total: total,
            amount_paid: 0,
            amount_due: total,
            status: ESTADO_PENDIENTE,
            expire_at: new Date(ahora.getTime() + 86400000 * 30),
            created_at: ahora,
            updated_at: null
        });
    } else if (condition === CONDICION_CONTADO) {
        cobrosArray.forEach(c => {
            guardarCobro({
                id: obtenerSiguienteId(cargarCobros()),
                account_receivable_id: null,
                sale_id: idVenta,
                amount: c.amount,
                payment_method: c.payment_method,
                obs: "VENTA AL CONTADO",
                created_at: ahora
            });
        });
    }

    ultimaVentaIdParaFactura = idVenta;

    $("#modalNuevaVenta").modal("hide");
    limpiarModalVenta();
    cargarDatos();
    $("#modalImprimirFactura").modal("show");
}

function simularImpresionPDF() {
    if (!ultimaVentaIdParaFactura) return;
    imprimirFacturaVenta(ultimaVentaIdParaFactura);
    $("#modalImprimirFactura").modal("hide");
}

/**
 * @param {number} idVenta 
 */
function numeroALetras(num) {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
        'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
        'DIECIOCHO', 'DIECINUEVE'];
    const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const centenas = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
        'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    if (num === 0) return 'CERO GUARANÍES';

    function convertirGrupo(n) {
        let resultado = '';
        if (n >= 100) {
            if (n === 100) return 'CIEN';
            resultado += centenas[Math.floor(n / 100)] + ' ';
            n = n % 100;
        }
        if (n >= 20) {
            resultado += decenas[Math.floor(n / 10)];
            if (n % 10 !== 0) resultado += ' Y ' + unidades[n % 10];
        } else if (n > 0) {
            resultado += unidades[n];
        }
        return resultado.trim();
    }

    let resultado = '';
    const millones = Math.floor(num / 1000000);
    const miles    = Math.floor((num % 1000000) / 1000);
    const resto    = num % 1000;

    if (millones > 0) resultado += (millones === 1 ? 'UN MILLÓN' : convertirGrupo(millones) + ' MILLONES') + ' ';
    if (miles > 0)    resultado += (miles === 1 ? 'MIL' : convertirGrupo(miles) + ' MIL') + ' ';
    if (resto > 0)    resultado += convertirGrupo(resto);

    return resultado.trim() + ' GUARANÍES';
}

function imprimirFacturaVenta(idVenta) {
    const v = cargarVenta(Number(idVenta));
    if (!v) return;

    const cli = cargarCliente(v.client_id);
    const detalles = cargarVentaDetalles(v.id);
    const fechaEmision = new Date(v.created_at);
    const totalEnLetras = numeroALetras(v.amount);

    // Timbrado ficticio basado en el año
    const timbrado = 'N° 798765432';
    const vigencia = 'VÁLIDO HASTA DICIEMBRE ' + (fechaEmision.getFullYear() + 1);
    const rucEmpresa = '80012345-6';

    // --- Construir tabla de detalles con columnas IVA ---
    const bodyDetalles = [
        // Fila de encabezado (2 filas de header para el sub-header de "VALOR DE VENTA")
        [
            { text: 'CANT.', bold: true, alignment: 'center', rowSpan: 2, margin: [0, 6, 0, 0] },
            { text: 'DESCRIPCIÓN', bold: true, alignment: 'center', rowSpan: 2, margin: [0, 6, 0, 0] },
            { text: 'PRECIO\nUNITARIO', bold: true, alignment: 'center', rowSpan: 2 },
            { text: 'VALOR DE VENTA', bold: true, alignment: 'center', colSpan: 3 },
            {}, {}
        ],
        [
            {}, {},  {},
            { text: 'EXENTAS', bold: true, alignment: 'center' },
            { text: '5%', bold: true, alignment: 'center' },
            { text: '10%', bold: true, alignment: 'center' }
        ]
    ];

    let totalExentas = 0;
    let total5 = 0;
    let total10 = 0;

    detalles.forEach(d => {
        const p = cargarProducto(d.product_id);
        const iva = d.iva !== undefined ? d.iva : (p ? p.iva : 10);
        const nombre = p ? p.name : 'Producto';

        let exenta = '', cinco = '', diez = '';
        if (iva === 0) {
            exenta = renderMoneda(d.subtotal);
            totalExentas += d.subtotal;
        } else if (iva === 5) {
            cinco = renderMoneda(d.subtotal);
            total5 += d.subtotal;
        } else {
            diez = renderMoneda(d.subtotal);
            total10 += d.subtotal;
        }

        bodyDetalles.push([
            { text: d.amount.toString(), alignment: 'center' },
            { text: nombre, alignment: 'left' },
            { text: renderMoneda(d.unit_price), alignment: 'right' },
            { text: exenta, alignment: 'right' },
            { text: cinco, alignment: 'right' },
            { text: diez, alignment: 'right' }
        ]);
    });

    // Fila de subtotales por columna IVA
    bodyDetalles.push([
        { text: 'Sub-Total:', bold: true, colSpan: 3, alignment: 'right' }, {}, {},
        { text: renderMoneda(totalExentas) || '', alignment: 'right', bold: true },
        { text: renderMoneda(total5) || '', alignment: 'right', bold: true },
        { text: renderMoneda(total10) || '', alignment: 'right', bold: true }
        
    ]);

    // --- Liquidación del IVA ---
    const iva5 = Math.round(total5 / 21);    // 5/105
    const iva10 = Math.round(total10 / 11);   // 10/110
    const totalIva = iva5 + iva10;

    // --- Condición de venta con marcas ---
    const esContado = v.condition === 'CONTADO';
    const esCredito = v.condition === 'CREDITO';

    const docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 30, 40, 30],
        content: [
            // ========== ENCABEZADO ==========
            {
                table: {
                    widths: ['55%', '45%'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: 'VANGUARDIA', bold: true, fontSize: 16, margin: [0, 0, 0, 3] },
                                    { text: 'Distribuidora de Mercadería', italics: true, fontSize: 9, margin: [0, 0, 0, 2] },
                                    { text: 'Av. España 1420, Asunción', fontSize: 8 },
                                    { text: 'Tel. 021-424035', fontSize: 8, margin: [0, 0, 0, 0] }
                                ],
                                border: [true, true, false, true]
                            },
                            {
                                stack: [
                                    { text: 'TIMBRADO ' + timbrado, bold: true, fontSize: 9, alignment: 'center' },
                                    { text: vigencia, fontSize: 8, alignment: 'center' },
                                    { text: 'RUC: ' + rucEmpresa, bold: true, fontSize: 9, alignment: 'center', margin: [0, 2, 0, 0] },
                                    { text: 'FACTURA', bold: true, fontSize: 12, alignment: 'center', margin: [0, 3, 0, 0] },
                                    { text: 'Nº ' + v.invoice, bold: true, fontSize: 11, alignment: 'center' }
                                ],
                                border: [false, true, true, true]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#000',
                    vLineColor: () => '#000'
                }
            },

            // ========== FECHA Y CONDICIÓN ==========
            {
                table: {
                    widths: ['40%', '60%'],
                    body: [
                        [
                            {
                                text: [
                                    { text: 'FECHA DE EMISIÓN:  ', bold: true, fontSize: 9 },
                                    { text: fechaEmision.toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' }), fontSize: 9 }
                                ]
                            },
                            {
                                text: [
                                    { text: 'CONDICIÓN DE VENTA:   ', bold: true, fontSize: 9 },
                                    { text: 'CONTADO ', fontSize: 9 },
                                    { text: esContado ? '[X]' : '[  ]', fontSize: 9, bold: true },
                                    { text: '   CRÉDITO ', fontSize: 9 },
                                    { text: esCredito ? '[X]' : '[  ]', fontSize: 9, bold: true }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1 : 0,
                    hLineColor: () => '#000',
                    vLineColor: () => '#000'
                },
                margin: [0, 0, 0, 0]
            },

            // ========== DATOS DEL CLIENTE ==========
            {
                table: {
                    widths: ['100%'],
                    body: [
                        [
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'RUC: ', bold: true, fontSize: 9 },
                                            { text: cli ? cli.ruc : '', fontSize: 9 }
                                        ]
                                    },
                                    {
                                        text: [
                                            { text: 'NOMBRE O RAZÓN SOCIAL: ', bold: true, fontSize: 9 },
                                            { text: cli ? cli.legal_name : '', fontSize: 9 }
                                        ],
                                        margin: [0, 2, 0, 0]
                                    }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#000',
                    vLineColor: () => '#000'
                },
                margin: [0, 0, 0, 0]
            },

            // ========== TABLA DE DETALLES ==========
            {
                table: {
                    headerRows: 2,
                    widths: [35, '*', 65, 70, 70, 70],
                    body: bodyDetalles
                },
                layout: {
                    hLineWidth: (i, node) => {
                        if (i === 0 || i === 2 || i === node.table.body.length - 1 || i === node.table.body.length) return 1;
                        return 0;
                    },
                    vLineWidth: () => 1,
                    hLineColor: () => '#000',
                    vLineColor: () => '#000',
                    paddingTop: () => 2,
                    paddingBottom: () => 2
                },
                margin: [0, 0, 0, 0]
            },
            // TOTAL EN LETRAS
            {
                table: {
                    widths: ['100%'],
                    body: [[{
                        text: [
                            { text: 'TOTAL A PAGAR GUARANÍES: ', bold: true, fontSize: 9 },
                            { text: totalEnLetras, fontSize: 9 }
                        ]
                    }]]
                },
                layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#000', vLineColor: () => '#000' },
                margin: [0, 0, 0, 0]
            },
            // ========== TOTAL A PAGAR ==========
            {
                table: {
                    widths: ['70%', '30%'],
                    body: [
                        [
                            { text: 'TOTAL A PAGAR', bold: true, fontSize: 11, alignment: 'left' },
                            { text: renderMoneda(v.amount), bold: true, fontSize: 11, alignment: 'right' }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#000',
                    vLineColor: () => '#000'
                },
                margin: [0, 0, 0, 0]
            },

            // ========== LIQUIDACIÓN DEL IVA ==========
            {
                table: {
                    widths: ['100%'],
                    body: [
                        [
                            {
                                text: [
                                    { text: 'LIQUIDACIÓN DEL IVA:   ', bold: true, fontSize: 9 },
                                    { text: '(5%)  ', fontSize: 9 },
                                    { text: renderMoneda(iva5), bold: true, fontSize: 9 },
                                    { text: '     (10%)  ', fontSize: 9 },
                                    { text: renderMoneda(iva10), bold: true, fontSize: 9 },
                                    { text: '          TOTAL IVA  ', fontSize: 9 },
                                    { text: renderMoneda(totalIva), bold: true, fontSize: 9 }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#000',
                    vLineColor: () => '#000'
                },
                margin: [0, 0, 0, 0]
            },

            // ========== PIE DE FACTURA ==========
            {
                columns: [
                    { text: 'ORIGINAL: CLIENTE', fontSize: 7, alignment: 'right', margin: [0, 8, 10, 0] },
                    { text: 'DUPLICADO: ARCHIVO TRIBUTARIO', fontSize: 7, alignment: 'right', margin: [0, 8, 0, 0] }
                ]
            }
        ],
        defaultStyle: {
            font: 'Roboto',
            fontSize: 9
        }
    };

    pdfMake.createPdf(docDefinition).print();
    // .download(`Factura_${v.invoice}.pdf`);
    mensajeSuccess("Generando y descargando PDF...");
}

function abrirDetallesVenta(idVenta) {
    const v = cargarVenta(Number(idVenta));
    if (!v) { mensajeError("Venta no encontrada."); return; }

    const cli = cargarCliente(v.client_id);
    const usr = cargarUsuario(v.user_id);

    $("#ver_venta_id").text(v.id);
    $("#ver_cliente").text(cli ? cli.legal_name : "—");
    $("#ver_fecha").text(v.created_at ? new Date(v.created_at).toLocaleString("es-PY") : "—");
    $("#ver_usuario").text(usr ? usr.username : "—");
    $("#ver_tipo_pago").text(v.condition);
    $("#ver_obs").text(v.invoice || "—");

    const detalles = cargarVentaDetalles(idVenta);
    const $tbody = $("#tabla_ver_detalles tbody").empty();
    let total = 0;

    detalles.forEach(d => {
        total += d.subtotal;
        const prod = cargarProducto(d.product_id);
        $tbody.append(`
            <tr>
                <td>${prod ? prod.name : d.product_id}</td>
                <td class="text-center">${d.amount}</td>
                <td class="text-end">${renderMoneda(d.unit_price)}</td>
                <td class="text-end">${renderMoneda(d.subtotal)}</td>
            </tr>
        `);
    });

    $("#ver_total_venta").text(renderMoneda(total));
    $("#modalVerDetalles").modal("show");
}

function abrirModalNuevoCliente() {
    document.getElementById("formNuevoCliente").reset();
    document.getElementById("formNuevoCliente").classList.remove("was-validated");
    $("#modalNuevoCliente").modal("show");
}

function btnGuardarNuevoCliente() {
    const form       = document.getElementById("formNuevoCliente");
    const legal_name = document.getElementById("nc_legal_name").value.trim().toUpperCase();
    const ruc        = document.getElementById("nc_ruc").value.trim();
    const tel        = document.getElementById("nc_tel").value.trim();
    const address    = document.getElementById("nc_address").value.trim().toUpperCase();
    const email      = document.getElementById("nc_email").value.trim().toLowerCase() || null;

    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    const clientes = cargarClientes();
    if (clientes.find(c => c.ruc === ruc)) {
        mensajeWarn("Ya existe un cliente con ese RUC/CI.");
        return;
    }

    const nuevoCliente = {
        id:         obtenerSiguienteId(clientes),
        legal_name: legal_name,
        ruc:        ruc,
        tel:        tel,
        email:      email,
        address:    address,
        active:     true,
        created_at: new Date(),
        updated_at: null
    };
    guardarCliente(nuevoCliente);

    $("#modalNuevoCliente").modal("hide");

    cargarSelectClientes();
    $("#client_id").val(nuevoCliente.id);
    mensajeSuccess(`Cliente "${nuevoCliente.legal_name}" registrado y seleccionado.`);
}

function limpiarModalVenta() {
    detallesTemp = [];
    _uidCounter  = 0;
    document.getElementById("formNuevaVenta")?.reset();
    $("#tabla_detalles_venta tbody").empty();
    $("#total_venta").text("0");
    $("#precio_input").val("");
    // Limpiar campos datalist
    $("#client_search").val("");
    $("#client_id").val("");
    $("#producto_search").val("").data("selected-id", "").data("selected-stock", "");
    // Generar y mostrar el próximo nro de factura
    generarVistaPreviewFactura();
}

function generarVistaPreviewFactura() {
    const siguiente = obtenerSiguienteId(cargarVentas());
    const preview = `001-001-${String(siguiente).padStart(7, "0")}`;
    $("#invoice").val(preview);
}

function cargarDatos() {
    const condicion = document.getElementById("filtro_condicion").value.toUpperCase();
    const cliente = document.getElementById("filtro_cliente_search").value.toUpperCase();
    const totalMin = parseFloat(document.getElementById("filtro_total_min").value);
    const totalMax = parseFloat(document.getElementById("filtro_total_max").value);
    const fechaDesde = document.getElementById("filtro_fecha_desde").value;
    const fechaHasta = document.getElementById("filtro_fecha_hasta").value;
    cargarDataTable(tablaVentas, cargarVentas().filter(v => {
        const c = cargarCliente(v.client_id);
        if (condicion && v.condition !== condicion) return false;
        if (cliente && !c.legal_name.includes(cliente) && !c.ruc.includes(cliente)) return false;
        if (!isNaN(totalMin) && totalMin > 0 && v.amount < totalMin) return false;
        if (!isNaN(totalMax) && totalMax > 0 && v.amount > totalMax) return false;
        if (fechaDesde && fechaDesde > v.created_at.substring(0, 10)) return false;
        if (fechaHasta && fechaHasta < v.created_at.substring(0, 10)) return false;
        return true;
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.VENTAS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.VENTAS_CREAR)) document.getElementById("btnModalNuevo").style.display = "none";
    cargarDatos();
    cargarSelectClientes();
    cargarSelectProductos();
    // Enter en cantidad → agregar
    // $("#cantidad_input").on("keydown", function (e) {
    //     if (e.key === "Enter") { e.preventDefault(); btnAgregarDetalle(); }
    // });
    // Limpiar al cerrar modal
    $("#modalNuevaVenta").on("hidden.bs.modal", limpiarModalVenta);
    // Refrescar datalists al abrir modal y previsualizar nro factura
    $("#modalNuevaVenta").on("show.bs.modal", function () {
        cargarSelectClientes();
        cargarSelectProductos();
        generarVistaPreviewFactura();
    });
});
