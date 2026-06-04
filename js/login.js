/**
 * @typedef {import('jquery')}
 * @typedef {import('./alertas')}
 * @typedef {import('./bd')}
 * @typedef {import('./tablas')}
 */

const tablaRoles = crearDataTable("tabla_roles", TABLAS.ROL);
const tablaUsuarios = crearDataTable("tabla_usuarios", TABLAS.USUARIO);
const tablaClientes = crearDataTable("tabla_clientes", TABLAS.CLIENTE);
const tablaProveedores = crearDataTable("tabla_proveedores", TABLAS.PROVEEDOR);
const tablaCategorias = crearDataTable("tabla_categorias", TABLAS.CATEGORIA);
const tablaMarcas = crearDataTable("tabla_marcas", TABLAS.MARCA);
const tablaProductos = crearDataTable("tabla_productos", TABLAS.PRODUCTO);
const tablaCompras = crearDataTable("tabla_compras", TABLAS.COMPRA);
const tablaCompraDetalles = crearDataTable("tabla_detallescompra", TABLAS.COMPRA_DETALLE);
const tablaVentas = crearDataTable("tabla_ventas", TABLAS.VENTA);
const tablaVentaDetalles = crearDataTable("tabla_detallesventa", TABLAS.VENTA_DETALLE);
const tablaCuentasPorPagar = crearDataTable("tabla_cuentasporpagar", TABLAS.CUENTA_POR_PAGAR);
const tablaCuentasPorCobrar = crearDataTable("tabla_cuentasporcobrar", TABLAS.CUENTA_POR_COBRAR);
const tablaCuotasPorPagar = crearDataTable("tabla_cuotasporpagar", TABLAS.CUOTA_POR_PAGAR)
const tablaCuotasPorCobrar = crearDataTable("tabla_cuotasporcobrar", TABLAS.CUOTA_POR_COBRAR)
const tablaPagos = crearDataTable("tabla_pagos", TABLAS.PAGO);
const tablaCobros = crearDataTable("tabla_cobros", TABLAS.COBRO);

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
    } else if (!usuario.active) {
        mensaje.textContent = "Usuario no disponible.";
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

/**
 * @param {KeyboardEvent} event 
 */
function onKeydownUsuario(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    document.getElementById("contra").focus();
}

/**
 * @param {KeyboardEvent} event 
 */
async function onKeydownContra(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    await login();
}


function verBD() {
    cargarDataTable(tablaRoles, cargarRoles());
    cargarDataTable(tablaUsuarios, cargarUsuarios());
    cargarDataTable(tablaClientes, cargarClientes());
    cargarDataTable(tablaProveedores, cargarProveedores());
    cargarDataTable(tablaCategorias, cargarCategorias());
    cargarDataTable(tablaMarcas, cargarMarcas());
    cargarDataTable(tablaProductos, cargarProductos());
    cargarDataTable(tablaCompras, cargarCompras());
    cargarDataTable(tablaCompraDetalles, cargarCompraDetalles());
    cargarDataTable(tablaVentas, cargarVentas());
    cargarDataTable(tablaVentaDetalles, cargarVentaDetalles());
    cargarDataTable(tablaCuentasPorPagar, cargarCuentasPorPagar());
    cargarDataTable(tablaCuentasPorCobrar, cargarCuentasPorCobrar());
    cargarDataTable(tablaCuotasPorPagar, cargarCuotasPorPagar());
    cargarDataTable(tablaCuotasPorCobrar, cargarCuotasPorCobrar());
    cargarDataTable(tablaPagos, cargarPagos());
    cargarDataTable(tablaCobros, cargarCobros());
}

function nuevoBD() {
    initDB();
    confirmar(
        "Cargar Base de Datos",
        "¿Desea cargar datos de prueba?",
        () => {
            cargarDatosPrueba();
            mensajeSuccess("Base de Datos de Prueba cargada!");
        },
        () => mensajeSuccess("Base de datos creada!")
    );
}

function borrarBD() {
    localStorage.clear();
    mensajeError("Base de datos eliminada");
}