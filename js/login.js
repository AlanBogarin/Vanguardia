/**
 * @typedef {import('jquery')}
 * @typedef {import('./alertas')}
 * @typedef {import('./bd')}
 * @typedef {import('./tablas')}
 */

const tablaRoles = crearDataTable("tabla_roles", [
    { data: "id", title: "Id Rol", render: renderRaw },
    { data: "name", title: "Nombre", render: renderString },
    { data: "description", title: "Descripción", render: renderString },
    { data: "flags", title: "Permisos" },
    { data: "created_at", title: "Fecha de creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de modificación", render: renderFecha }
]);
const tablaUsuarios = crearDataTable("tabla_usuarios", [
    { data: "id", title: "Id Usuario", render: renderRaw },
    { data: "username", title: "Nombre de Usuario", render: data => renderString(data).toLowerCase() },
    { data: "name", title: "Nombre del Personal", render: renderString },
    { data: "ruc", title: "Cédula o RUC", render: renderString },
    { data: "tel", title: "Teléfono", render: renderString },
    { data: "email", title: "Correo Electrónico", render: data => renderString(data).toLowerCase() },
    { data: "rol_id", title: "Rol", render: data => renderString(cargarRol(data).name) },
    { data: "active", title: "Activo", render: renderBoolean },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaClientes = crearDataTable("tabla_clientes", [
    { data: "id", title: "Id Cliente", render: renderRaw },
    { data: "legal_name", title: "Razón Social", render: renderString },
    { data: "ruc", title: "RUC", render: renderString },
    { data: "tel", title: "Teléfono", render: renderString },
    { data: "email", title: "Correo Electrónico", render: renderString },
    { data: "address", title: "Dirección", render: renderString },
    { data: "active", title: "Activo", renderBoolean },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaProveedores = crearDataTable("tabla_proveedores", [
    { data: "id", title: "Id Proveedor", render: renderRaw },
    { data: "legal_name", title: "Razón Social", render: renderString },
    { data: "ruc", title: "RUC", render: renderString },
    { data: "tel", title: "Teléfono", render: renderString },
    { data: "email", title: "Correo Electrónico", render: data => renderString(data).toLowerCase() },
    { data: "address", title: "Dirección", render: renderString },
    { data: "active", title: "Activo", render: renderBoolean },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaCategorias = crearDataTable("tabla_categorias", [
    { data: "id", title: "Id Categoria", render: renderRaw },
    { data: "name", title: "Nombre", render: renderString },
    { data: "description", title: "Descripción", render: renderString },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha },
]);
const tablaMarcas = crearDataTable("tabla_marcas", [
    { data: "id", title: "Id Marca", render: renderRaw },
    { data: "name", title: "Nombre", render: renderString },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaProductos = crearDataTable("tabla_productos", [
    { data: "id", title: "Id Producto", render: renderRaw },
    { data: "code", title: "Código de Barra", render: renderString },
    { data: "name", title: "Nombre", render: renderString },
    { data: "description", title: "Descripción", render: renderString },
    { data: "purchase_price", title: "Precio de Compra", render: renderMoneda },
    { data: "selling_price", title: "Precio de Venta", render: renderMoneda },
    { data: "stock", title: "Stock", render: renderNumber },
    { data: "min_stock", title: "Stock Mínimo", render: renderNumber },
    { data: "category_id", title: "Categoria", render: data => renderString(cargarCategoria(data).name) },
    { data: "brand_id", title: "Marca", render: data => renderString(cargarMarca(data).name) },
    { data: "iva", title: "IVA", render: data => data === 0 ? "EXENTA" : `${data}%` },
    { data: "active", title: "Activo", render: renderBoolean },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaCompras = crearDataTable("tabla_compras", [
    { data: "id", title: "Id Compra", render: renderRaw },
    { data: "provider_id", title: "Proveedor", render: data => renderString(cargarProveedor(data).legal_name) },
    { data: "user_id", title: "Usuario", render: data => renderString(cargarUsuario(data).username).toLowerCase() },
    { data: "payment_type", title: "Tipo de Pago", render: renderString },
    { data: "amount", title: "Monto", render: renderMoneda },
    { data: "obs", title: "Observaciones", render: renderString },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaCompraDetalles = crearDataTable("tabla_detallescompra", [
    { data: "id", title: "Id Detalle", render: renderRaw },
    { data: "purchase_id", title: "Id Compra", render: renderRaw },
    { data: "product_id", title: "Producto", render: data => renderString(cargarProducto(data).name) },
    { data: "amount", title: "Cantidad", render: renderNumber },
    { data: "unit_price", title: "Precio Unitario", render: renderMoneda },
    { data: "subtotal", title: "Subtotal", render: renderMoneda },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha }
]);
const tablaVentas = crearDataTable("tabla_ventas", [
    { data: "id", title: "Id Venta", render: renderRaw },
    { data: "client_id", title: "Cliente", render: data => renderString(cargarCliente(data).legal_name) },
    { data: "user_id", title: "Usuario", render: data => renderString(cargarUsuario(data).username).toLowerCase() },
    { data: "payment_type", title: "Tipo de Pago", render: renderString },
    { data: "amount", title: "Monto", render: renderMoneda },
    { data: "obs", title: "Observaciones", render: renderString },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaVentaDetalles = crearDataTable("tabla_detallesventa", [
    { data: "id", title: "Id Detalle", render: renderRaw },
    { data: "sale_id", title: "Id Venta", render: renderRaw },
    { data: "product_id", title: "Producto", render: data => renderString(cargarProducto(data).name) },
    { data: "amount", title: "Cantidad", render: renderNumber },
    { data: "unit_price", title: "Precio Unitario", render: renderMoneda },
    { data: "subtotal", title: "Subtotal", render: renderMoneda },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha }
]);
const tablaCuentasPorPagar = crearDataTable("tabla_cuentasporpagar", [
    { data: "id", title: "Id Cuenta", render: renderRaw },
    { data: "purchase_id", title: "Id Compra", render: renderRaw },
    { data: "provider_id", title: "Proveedor", render: data => renderString(cargarProveedor(data).legal_name) },
    { data: "amount_total", title: "Cantidad Total", render: renderMoneda },
    { data: "amount_paid", title: "Cantidad Pagada", render: renderMoneda },
    { data: "amount_due", title: "Cantidad Pendiente", render: renderMoneda },
    { data: "status", title: "Estado", render: renderString },
    { data: "expire_at", title: "Fecha de Vencimiento", render: renderFecha },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaCuentasPorCobrar = crearDataTable("tabla_cuentasporcobrar", [
    { data: "id", title: "Id Cuenta", render: renderRaw },
    { data: "sale_id", title: "Id Compra", render: renderRaw },
    { data: "client_id", title: "Cliente", render: data => renderString(cargarCliente(data).legal_name) },
    { data: "amount_total", title: "Cantidad Total", render: renderMoneda },
    { data: "amount_paid", title: "Cantidad Pagada", render: renderMoneda },
    { data: "amount_due", title: "Cantidad Pendiente", render: renderMoneda },
    { data: "status", title: "Estado", render: renderString },
    { data: "expire_at", title: "Fecha de Vencimiento", render: renderFecha },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha },
    { data: "updated_at", title: "Fecha de Modificación", render: renderFecha }
]);
const tablaPagos = crearDataTable("tabla_pagos", [
    { data: "id", title: "Id Pago", render: renderRaw },
    { data: "account_payable_id", title: "Id Cuenta", render: renderRaw },
    { data: "amount", title: "Monto", render: renderMoneda },
    { data: "payment_method", title: "Método de Pago", render: renderString },
    { data: "obs", title: "Observaciones", render: renderString },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha }
]);
const tablaCobros = crearDataTable("tabla_cobros", [
    { data: "id", title: "Id Cobro", render: renderRaw },
    { data: "account_receivable_id", title: "Id Cuenta", render: renderRaw },
    { data: "amount", title: "Monto", render: renderMoneda },
    { data: "payment_method", title: "Método de Pago", render: renderString },
    { data: "obs", title: "Observaciones", render: renderString },
    { data: "created_at", title: "Fecha de Creación", render: renderFecha }
]);

async function login() {
    const form = document.getElementById("login-form");
    const mensaje = document.getElementById("mensaje");
    const inputUsuario = document.getElementById("usuario");
    const usuarioIngresado = inputUsuario.value.trim();
    const inputContra = document.getElementById("contra");
    const contraIngresada = inputContra.value.trim();
    // Agregar la clase de Bootstrap para mostrar los textos rojos de invalid-feedback
    form.classList.add('was-validated');
    // Comprobar si el formulario NO es válido (es decir, si hay campos vacíos)
    if (!form.checkValidity()) {
        // Mostrar mensaje en el card-footer
        mensaje.textContent = "Por favor, complete los campos solicitados.";
        mensaje.style.color = "red";
        if (usuarioIngresado === "") {
            inputUsuario.focus();
        } else if (contraIngresada === "") {
            inputContra.focus();
        }
        // Ocultar el mensaje después de 5 segundos
        setTimeout(function () {
            mensaje.textContent = "";
        }, 5000);
        return;
    }
    // CUANDO AMBOS CAMPOS TIENEN TEXTO SE VALIDAN LOS CREDENCIALES.
    const usuario = cargarUsuario(null, usuarioIngresado);
    const hash = await hashPassword(contraIngresada);
    if (!usuario) {
        // Si el usuario es incorrecto
        mensaje.textContent = "Usuario no encontrado.";
        mensaje.style.color = "red";
        inputUsuario.focus();
        setTimeout(function () {
            mensaje.textContent = "";
        }, 5000);
    } else if (hash !== usuario.password_hash) {
        // Si la contraseña es incorrecta
        mensaje.textContent = "Contraseña incorrecta.";
        mensaje.style.color = "red";
        inputContra.focus();
        setTimeout(function () {
            mensaje.textContent = "";
        }, 5000);
    } else {
        const created_at = new Date();
        const expire_at = new Date(created_at);
        expire_at.setDate(created_at.getDate() + 1)
        guardarSesion({
            user_id: usuario.id,
            expire_at: expire_at,
            created_at: created_at
        })
        window.location.href = "menu.html";
    }
}

function verBD() {
    tablaRoles.clear().rows.add(cargarRoles()).draw();
    tablaUsuarios.clear().rows.add(cargarUsuarios()).draw();
    tablaClientes.clear().rows.add(cargarClientes()).draw();
    tablaProveedores.clear().rows.add(cargarProveedores()).draw();
    tablaCategorias.clear().rows.add(cargarCategorias()).draw();
    tablaMarcas.clear().rows.add(cargarMarcas()).draw();
    tablaProductos.clear().rows.add(cargarProductos()).draw();
    tablaCompras.clear().rows.add(cargarCompras()).draw();
    tablaCompraDetalles.clear().rows.add(cargarCompraDetalles()).draw();
    tablaVentas.clear().rows.add(cargarVentas()).draw();
    tablaVentaDetalles.clear().rows.add(cargarVentaDetalles()).draw();
    tablaCuentasPorPagar.clear().rows.add(cargarCuentasPorPagar()).draw();
    tablaCuentasPorCobrar.clear().rows.add(cargarCuentasPorCobrar()).draw();
    tablaPagos.clear().rows.add(cargarPagos()).draw();
    tablaCobros.clear().rows.add(cargarCobros()).draw();
}

function nuevoBD() {
    initDB();
    confirmar(
        "Cargar Base de Datos",
        "¿Desea cargar datos de prueba?",
        () => {
            cargarDatosPrueba();
            alertify.success("Base de Datos de Prueba cargada!");
        },
        () => alertify.success("Base de datos creada!")
    );
}

function borrarBD() {
    localStorage.clear();
    alertify.error("Base de datos eliminada");
}