/**
 * MÓDULO DE VENTAS - VANGUARDIA
 * Programación III - UNCA
 *
 * Usa las funciones y estructuras definidas en:
 *   bd.js      → cargarVentas, guardarVenta, guardarVentaDetalle, cargarClientes,
 *                cargarProductos, cargarUsuario, guardarCuentaPorCobrar,
 *                obtenerSiguienteId, KEY_SESION, cargarSesion, etc.
 *   alertas.js → validarSesion, mensajeSuccess, mensajeError, mensajeWarn,
 *                confirmar, alertar
 *   tablas.js  → crearDataTable, renderRaw, renderString, renderMoneda, renderFecha
 * 
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

// ─────────────────────────────────────────────────────────────
// 1. GUARD DE SESIÓN  (usa validarSesion de alertas.js)
// ─────────────────────────────────────────────────────────────
validarSesion();

// ─────────────────────────────────────────────────────────────
// 2. ESTADO LOCAL DEL MÓDULO
// ─────────────────────────────────────────────────────────────
/** @type {Array<{_uid:number, product_id:number, nombre:string, amount:number, unit_price:number, subtotal:number}>} */
let detallesTemp = [];
let _uidCounter  = 0;

// ─────────────────────────────────────────────────────────────
// 3. DATATABLE PRINCIPAL DE VENTAS
// ─────────────────────────────────────────────────────────────
const tablaVentas = crearDataTable("tabla_ventas", [
    { data: "id",           title: "Id Venta",     render: renderRaw    },
    { data: "client_id",    title: "Cliente",       render: data => renderString(cargarCliente(data).legal_name) },
    { data: "user_id",      title: "Usuario",       render: data => renderString(cargarUsuario(data).username).toLowerCase() },
    { data: "payment_type", title: "Cond. Cobro",   render: renderString },
    { data: "amount",       title: "Total",         render: renderMoneda },
    { data: "obs",          title: "Observaciones", render: renderString },
    { data: "created_at",   title: "Fecha",         render: renderFecha  }
], {
    buttons: true, 
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE USUARIOS",
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
            }
        ]
    })
});

// ─────────────────────────────────────────────────────────────
// 4. INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────
$(document).ready(function () {
    refrescarTablaVentas();
    cargarSelectClientes();
    cargarSelectProductos();
    bindEventos();
});

// ─────────────────────────────────────────────────────────────
// 5. REFRESCO DE TABLA
// ─────────────────────────────────────────────────────────────
function refrescarTablaVentas() {
    cargarDataTable(tablaVentas, cargarVentas());
}

// ─────────────────────────────────────────────────────────────
// 6. SELECTS DEL MODAL
// ─────────────────────────────────────────────────────────────
function cargarSelectClientes() {
    // Llenar datalist para búsqueda de clientes
    const $dl = $("#datalist_clientes").empty();
    cargarClientes()
        .filter(c => c.active !== false)
        .forEach(c => $dl.append(`<option data-id="${c.id}" value="${c.legal_name} — ${c.ruc}">`));
    $("#client_search").val("");
    $("#client_id").val("");
}

function resolverClienteDesdeInput() {
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

function resolverProductoDesdeInput() {
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

// ─────────────────────────────────────────────────────────────
// 7. BINDING DE EVENTOS
// ─────────────────────────────────────────────────────────────
function bindEventos() {
    // Autocompletar precio al escribir/seleccionar producto del datalist
    $("#producto_search").on("input change", resolverProductoDesdeInput);

    // Autocompletar cliente al escribir/seleccionar del datalist
    $("#client_search").on("input change", resolverClienteDesdeInput);

    // Botón agregar producto al detalle
    $("#btnAgregarDetalle").on("click", agregarDetalle);

    // Enter en cantidad → agregar
    $("#cantidad_input").on("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); agregarDetalle(); }
    });

    // Submit del formulario
    $("#formNuevaVenta").on("submit", function (e) {
        e.preventDefault();
        guardarNuevaVenta();
    });

    // Limpiar al cerrar modal
    $("#modalNuevaVenta").on("hidden.bs.modal", limpiarModalVenta);

    // Refrescar datalists al abrir modal y previsualizar nro factura
    $("#modalNuevaVenta").on("show.bs.modal", function () {
        cargarSelectClientes();
        cargarSelectProductos();
        generarVistaPreviewFactura();
    });
}

// ─────────────────────────────────────────────────────────────
// 8. AGREGAR / QUITAR DETALLE
// ─────────────────────────────────────────────────────────────
function agregarDetalle() {
    const productId = parseInt($("#producto_search").data("selected-id"));
    const stock     = parseInt($("#producto_search").data("selected-stock")) || 0;
    const cantidad  = parseInt($("#cantidad_input").val());
    const precio    = parseFloat($("#precio_input").val());

    if (!productId)                { mensajeWarn("Seleccione un producto de la lista.");                              return; }
    if (!cantidad || cantidad < 1) { mensajeWarn("Por favor ingrese cuántas unidades desea agregar (mínimo 1)."); return; }
    if (!precio   || precio   <= 0){ mensajeWarn("El precio no puede ser cero.");                                     return; }

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
                <td class="text-end">${formatGs(d.unit_price)}</td>
                <td class="text-end">${formatGs(d.subtotal)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="quitarDetalle(${d._uid})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });

    $("#total_venta").text(formatGs(total));
}

// ─────────────────────────────────────────────────────────────
// 9. GUARDAR VENTA
// ─────────────────────────────────────────────────────────────
function guardarNuevaVenta() {
    const clientId   = parseInt($("#client_id").val());  // resuelto por resolverClienteDesdeInput
    const paymentType = $("#payment_type").val();
    const obs        = $("#obs").val().trim().toUpperCase();

    if (!clientId) { mensajeWarn("Por favor busque y seleccione un cliente de la lista."); return; }
    if (detallesTemp.length === 0) { mensajeWarn("Agregue al menos un producto."); return; }

    const total = detallesTemp.reduce((s, d) => s + d.subtotal, 0);

    confirmar(
        "Confirmar Venta",
        `Total: <strong>Gs. ${formatGs(total)}</strong><br>Condición de cobro: ${paymentType}`,
        () => {
            const sesion  = cargarSesion();
            const ventas  = cargarVentas();
            const detalles = cargarVentaDetalles();
            const idVenta  = obtenerSiguienteId(ventas);
            const ahora    = new Date();

            // ── Guardar cabecera de venta ──────────────────────
            // Nro de factura autonumérico: 001-001-XXXXXXX (7 dígitos del id de venta)
            const nroFactura = `001-001-${String(idVenta).padStart(7, "0")}`;

            guardarVenta({
                id:           idVenta,
                client_id:    clientId,
                user_id:      sesion ? sesion.user_id : null,
                payment_type: paymentType,
                amount:       total,
                obs:          `FACT. ${nroFactura}${obs ? " | " + obs : ""}`,
                created_at:   ahora,
                updated_at:   null
            });

            // ── Guardar detalles y descontar stock ─────────────
            detallesTemp.forEach(d => {
                guardarVentaDetalle({
                    id:         obtenerSiguienteId(cargarVentaDetalles()),
                    sale_id:    idVenta,
                    product_id: d.product_id,
                    amount:     d.amount,
                    unit_price: d.unit_price,
                    subtotal:   d.subtotal,
                    created_at: ahora
                });

                // Actualizar stock del producto
                const prod = cargarProducto(d.product_id);
                if (prod) {
                    prod.stock -= d.amount;
                    prod.updated_at = ahora;
                    guardarProducto(prod);
                }
            });

            // ── Generar cuenta por cobrar si es CRÉDITO ────────
            if (paymentType === "CREDITO") {
                const cuentas = cargarCuentasPorCobrar();
                guardarCuentaPorCobrar({
                    id:           obtenerSiguienteId(cuentas),
                    sale_id:      idVenta,
                    client_id:    clientId,
                    amount_total: total,
                    amount_paid:  0,
                    amount_due:   total,
                    status:       ESTADO_PENDIENTE,
                    expire_at:    new Date(ahora.getTime() + 86400000 * 30),
                    created_at:   ahora,
                    updated_at:   null
                });
            }

            // ── Actualizar UI ──────────────────────────────────
            $("#modalNuevaVenta").modal("hide");
            limpiarModalVenta();
            refrescarTablaVentas();
            mensajeSuccess(`Venta #${idVenta} registrada correctamente.`);
        },
        () => {}
    );
}

// ─────────────────────────────────────────────────────────────
// 10. VER DETALLES DE UNA VENTA
// ─────────────────────────────────────────────────────────────
function abrirDetallesVenta(idVenta) {
    const v = cargarVenta(idVenta);
    if (!v) { mensajeError("Venta no encontrada."); return; }

    const cli = cargarCliente(v.client_id);
    const usr = cargarUsuario(v.user_id);

    $("#ver_venta_id").text(v.id);
    $("#ver_cliente").text(cli ? cli.legal_name : "—");
    $("#ver_fecha").text(v.created_at ? new Date(v.created_at).toLocaleString("es-PY") : "—");
    $("#ver_usuario").text(usr ? usr.username : "—");
    $("#ver_tipo_pago").text(v.payment_type);
    $("#ver_obs").text(v.obs || "—");

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
                <td class="text-end">${formatGs(d.unit_price)}</td>
                <td class="text-end">${formatGs(d.subtotal)}</td>
            </tr>
        `);
    });

    $("#ver_total_venta").text(formatGs(total));
    $("#modalVerDetalles").modal("show");
}

// ─────────────────────────────────────────────────────────────
// 11. REGISTRAR NUEVO CLIENTE DESDE EL MODAL DE VENTA
// Usa un modal Bootstrap dedicado (mismo patrón que clientes.html)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// 12. LIMPIAR MODAL
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// 13. UTILIDAD: Preview Nro. Factura
// ─────────────────────────────────────────────────────────────
function generarVistaPreviewFactura() {
    const ventas    = cargarVentas();
    const siguiente = obtenerSiguienteId(ventas);
    const preview   = `001-001-${String(siguiente).padStart(7, "0")}`;
    $("#nro_factura_preview").val(preview);
}

// ─────────────────────────────────────────────────────────────
// 14. UTILIDAD: Formatear Guaraníes
// ─────────────────────────────────────────────────────────────
function formatGs(n) {
    return new Intl.NumberFormat("es-PY", { minimumFractionDigits: 0 }).format(n || 0);
}