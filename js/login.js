/**
 * @typedef {import('jquery')}
 * @typedef {import('./alertas')}
 * @typedef {import('./bd')}
 */

const tablaRoles = new DataTable("#tabla_roles", {
    columns: [
        { data: "id", title: "Id Rol" },
        { data: "name", title: "Nombre" },
        { data: "description", title: "Descripción" },
        { data: "flags", title: "Permisos" },
        { data: "created_at", title: "Fecha de creación" },
        { data: "updated_at", title: "Fecha de modificación", render: data => data || "" }
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaUsuarios = new DataTable("#tabla_usuarios", {
    columns: [
        { data: "id", title: "Id Usuario" },
        { data: "username", title: "Nombre de Usuario" },
        { data: "name", title: "Nombre del Personal" },
        { data: "ruc", title: "Cédula o RUC" },
        { data: "tel", title: "Teléfono" },
        { data: "email", title: "Correo Electrónico" },
        { data: "rol", title: "Rol", render: (data, type, row) => cargarRol(row.rol_id).name },
        { data: "active", title: "Activo" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
}); //ruc,tel
const tablaClientes = new DataTable("#tabla_clientes", {
    columns: [
        { data: "id", title: "Id Cliente" },
        { data: "legal_name", title: "Razón Social" },
        { data: "ruc", title: "RUC", render: data => data || "" },
        { data: "tel", title: "Teléfono", render: data => data || "" },
        { data: "email", title: "Correo Electrónico", render: data => data || "" },
        { data: "address", title: "Dirección", render: data => data || "" },
        { data: "active", title: "Activo" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaProveedores = new DataTable("#tabla_proveedores", {
    columns: [
        { data: "id", title: "Id Proveedor" },
        { data: "legal_name", title: "Razón Social" },
        { data: "ruc", title: "RUC", render: data => data || "" },
        { data: "tel", title: "Teléfono", render: data => data || "" },
        { data: "email", title: "Correo Electrónico", render: data => data || "" },
        { data: "address", title: "Dirección", render: data => data || "" },
        { data: "active", title: "Activo" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaCategorias = new DataTable("#tabla_categorias", {
    columns: [
        { data: "id", title: "Id Categoria" },
        { data: "name", title: "Nombre" },
        { data: "description", title: "Descripción" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaMarcas = new DataTable("#tabla_marcas", {
    columns: [
        { data: "id", title: "Id Marca" },
        { data: "name", title: "Nombre" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaProductos = new DataTable("#tabla_productos", {
    columns: [
        { data: "id", title: "Id Producto"},
        { data: "code", title: "Código de Barra"},
        { data: "name", title: "Nombre"},
        { data: "description", title: "Descripción"},
        { data: "purchase_price", title: "Precio de Compra"},
        { 
            data: "selling_price",
            title: "Precio de Venta",
            render: (data) => parseInt(data).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        },
        { 
            data: "stock",
            title: "Stock",
            render: (data) => parseFloat(data).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        },
        { data: "min_stock", title: "Stock Mínimo" },
        { data: "category", title: "Categoria", render: (data, type, row) => cargarCategoria(row.category_id).name },
        { data: "brand", title: "Marca", render: (data, type, row) => cargarMarca(row.brand_id).name },
        { data: "iva", title: "IVA", render: (data) => ({0: "EXENTA", 5: "5%", 10: "10%"})[data] ?? data },
        { data: "active", title: "Activo" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaCompras = new DataTable("#tabla_compras", {
    columns: [
        { data: "id", title: "Id Compra" },
        { data: "provider_id", title: "Proveedor", render: data => cargarProveedor(data).legal_name },
        { data: "user_id", title: "Usuario", render: data => cargarUsuario(data).username },
        { data: "payment_type", title: "Tipo de Pago" },
        { data: "amount", title: "Monto" },
        { data: "obs", title: "Observaciones" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaCompraDetalles = new DataTable("#tabla_detallescompra", {
    columns: [
        { data: "id", title: "Id Detalle" },
        { data: "purchase_id", title: "Id Compra" },
        { data: "product_id", title: "Producto", render: data => cargarProducto(data).name },
        { data: "amount", title: "Cantidad" },
        { data: "unit_price", title: "Precio Unitario" },
        { data: "subtotal", title: "Subtotal" },
        { data: "created_at", title: "Fecha de Creación" }
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaVentas = new DataTable("#tabla_ventas", {
    columns: [
        { data: "id", title: "Id Venta" },
        { data: "client", title: "Cliente", render: (data, type, row) => cargarCliente(row.client_id).legal_name },
        { data: "user", title: "Usuario", render: (data, type, row) => cargarUsuario(row.user_id).name },
        { data: "payment_type", title: "Tipo de Pago" },
        { data: "amount", title: "Monto" },
        { data: "obs", title: "Observaciones" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaVentaDetalles = new DataTable("#tabla_detallesventa", {
    columns: [
        { data: "id", title: "Id Detalle" },
        { data: "sale_id", title: "Id Venta" },
        { data: "product", title: "Producto", render: (data, type, row) => cargarProducto(row.product_id).name },
        { data: "amount", title: "Cantidad" },
        { data: "unit_price", title: "Precio Unitario" },
        { data: "subtotal", title: "Subtotal" },
        { data: "created_at", title: "Fecha de Creación", render: data => data || "" }
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaCuentasPorPagar = new DataTable("#tabla_cuentasporpagar", {
    columns: [
        { data: "id", title: "Id Cuenta" },
        { data: "purchase_id", title: "Id Compra" },
        { data: "provider", title: "Proveedor", render: (data, type, row) => cargarProveedor(row.provider_id).legal_name },
        { data: "amount_total", title: "Cantidad Total" },
        { data: "amount_paid", title: "Cantidad Pagada" },
        { data: "amount_due", title: "Cantidad Pendiente" },
        { data: "status", title: "Estado" },
        { data: "expire_at", title: "Fecha de Vencimiento" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaCuentasPorCobrar = new DataTable("#tabla_cuentasporcobrar", {
    columns: [
        { data: "id", title: "Id Cuenta" },
        { data: "sale_id", title: "Id Compra" },
        { data: "client", title: "Cliente", render: (data, type, row) => cargarCliente(row.client_id).legal_name },
        { data: "amount_total", title: "Cantidad Total" },
        { data: "amount_paid", title: "Cantidad Pagada" },
        { data: "amount_due", title: "Cantidad Pendiente" },
        { data: "status", title: "Estado" },
        { data: "expire_at", title: "Fecha de Vencimiento" },
        { data: "created_at", title: "Fecha de Creación" },
        { data: "updated_at", title: "Fecha de Modificación", render: data => data || "" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaPagos = new DataTable("#tabla_pagos", {
    columns: [
        { data: "id", title: "Id Pago" },
        { data: "account_payable_id", title: "Id Cuenta" },
        { data: "amount", title: "Monto" },
        { data: "payment_method", title: "Método de Pago" },
        { data: "obs", title: "Observaciones" },
        { data: "created_at", title: "Fecha de Creación" }
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});
const tablaCobros = new DataTable("#tabla_cobros", {
    columns: [
        { data: "id", title: "Id Cobro" },
        { data: "account_receivable_id", title: "Id Cuenta" },
        { data: "amount", title: "Monto" },
        { data: "payment_method", title: "Método de Pago" },
        { data: "obs", title: "Observaciones" },
        { data: "created_at", title: "Fecha de Creación" },
    ],
    language: spanish,
    searching: false,    // Oculta el buscador
    lengthChange: false, // Oculta el paginación
    pageLength: 5
});

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
    // FECHA year-month-day -> day/month/year
    // render: (data) => {
    //     if (!data) return "";
    //     const partes = data.split('-');
    //     return `${partes[2]}/${partes[1]}/${partes[0]}`;
    // }
    // SEPARADOR DE MILES
    // render: (data) => {
    //     parseInt(data).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    // }
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