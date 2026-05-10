/** @typedef {import('jquery')} */
/** @typedef {import('./bd')} */

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
    const tablas = ["#tabla_roles", "#tabla_usuarios", "#tabla_clientes", "#tabla_proveedores", "#tabla_categorias",
                    "#tabla_marcas", "#tabla_productos", "#tabla_compras", "#tabla_detallescompra", "#tabla_ventas",
                    "#tabla_detallesventa", "#tabla_cuentasporpagar", "#tabla_cuentasporcobrar", "#tabla_pagos",
                    "#tabla_cobros"];
    // Si ya existe una instancia de DataTable, destruirla
    // for (const tabla of tablas) {
    //     if ($.fn.DataTable.isDataTable(tabla)) {
    //         $(tabla).DataTable().clear().destroy();
    //     }
    // }

    const roles = cargarRoles();
    const rolMap = {};
    roles.forEach(r => { rolMap[r.id] = r.name });
    const usuarios = cargarUsuarios();
    const usuarioMap = {};
    usuarios.forEach(u => { usuarioMap[u.id] = u.username });
    const clientes = cargarClientes();
    const clienteMap = {};
    clientes.forEach(c => { clienteMap[c.id] = c.name });
    const proveedores = cargarProveedores();
    const proveedorMap = {};
    proveedores.forEach(p => { proveedorMap[p.id] = p.name })
    const categorias = cargarCategorias();
    const categoriaMap = {};
    categorias.forEach(c => { categoriaMap[c.id] = c.name });
    const marcas = cargarMarcas();
    const marcaMap = {};
    marcas.forEach(m => {marcaMap[m.id] = m.name });
    const productos = cargarProductos();
    const productoMap = {};
    productos.forEach(p => { productoMap[p.id] = p.name });
    const compras = cargarCompras();
    const compraDetalles = cargarCompraDetalles();
    const ventas = cargarVentas();
    const ventaDetalles = cargarVentaDetalles();
    const cuentasPorPagar = cargarCuentasPorPagar();
    const cuentasPorCobrar = cargarCuentasPorCobrar();
    const pagos = cargarPagos();
    const cobros = cargarCobros();

    console.log(roles.map(r => {
            return {
                ...r,
                updated_at: r.updated_at || ""
            };
        }));
    new DataTable("#tabla_roles", {
        data: roles.map(r => {
            return {
                ...r,
                updated_at: r.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Rol"},
            { data: "name", title: "Nombre"},
            { data: "description", title: "Descripción"},
            { data: "created_at", title: "Fecha de creación"},
            { data: "updated_at", title: "Fecha de modificación"}
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_usuarios", {
        data: usuarios.map(u => {
            return {
                ...u,
                rol: rolMap[u.rol_id],
                updated_at: u.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Usuario"},
            { data: "username", title: "Nombre de Usuario"},
            // { data: "password_hash", title: "Hash de Contraseña"},
            { data: "name", title: "Nombre del Personal"},
            { data: "email", title: "Correo Electrónico"},
            { data: "rol", title: "Rol"},
            { data: "active", title: "Activo"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_clientes", {
        data: clientes.map(c => {
            return {
                ...c,
                ruc: c.ruc || "",
                tel: c.tel || "",
                email: c.email || "",
                address: c.address || "",
                updated_at: c.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Cliente"},
            { data: "name", title: "Nombre"},
            { data: "ruc", title: "RUC"},
            { data: "tel", title: "Teléfono"},
            { data: "email", title: "Correo Electrónico"},
            { data: "address", title: "Dirección"},
            { data: "active", title: "Activo"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_proveedores", {
        data: proveedores.map(p => {
            return {
                ...p,
                ruc: p.ruc || "",
                tel: p.tel || "",
                email: p.email || "",
                address: p.address || "",
                updated_at: p.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Proveedor"},
            { data: "name", title: "Nombre"},
            { data: "ruc", title: "RUC"},
            { data: "tel", title: "Teléfono"},
            { data: "email", title: "Correo Electrónico"},
            { data: "address", title: "Dirección"},
            { data: "active", title: "Activo"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_categorias", {
        data: categorias.map(c => {
            return {
                ...c,
                updated_at: c.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Categoria"},
            { data: "name", title: "Nombre"},
            { data: "description", title: "Descripción"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_marcas", {
        data: marcas.map(m => {
            return {
                ...m,
                updated_at: m.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Marca"},
            { data: "name", title: "Nombre"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_productos", {
        data: productos.map(p => {
            return {
                ...p,
                category: categoriaMap[p.category_id],
                brand: marcaMap[p.brand_id],
                updated_at: p.updated_at || ""
            }
        }),
        columns: [
            { data: "id", title: "Id Producto"},
            { data: "code", title: "Código de Barra"},
            { data: "name", title: "Nombre"},
            { data: "description", title: "Descripción"},
            { data: "purchase_price", title: "Precio de Compra"},
            { 
                data: "selling_price",
                title: "Precio de Venta",
                render: (data) => {
                    parseInt(data).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                }
            },
            { 
                data: "stock",
                title: "Stock",
                render: (data) => {
                    parseFloat(data).toFixed(2).replace('.', ',')
                    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                }
            },
            { data: "min_stock", title: "Stock Mínimo"},
            { data: "category", title: "Categoria"},
            { data: "brand", title: "Marca"},
            { 
                data: "iva", title: "IVA", render: (data) => ({
                    0: "EXENTA",
                    5: "5%",
                    10: "10%"
                })[data] ?? data
            },
            { data: "active", title: "Activo"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_compras", {
        data: compras.map((c) => {
            return {
                ...c,
                provider: proveedorMap[c.provider_id],
                user: usuarioMap[c.user_id],
                updated_at: c.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Compra"},
            { data: "provider", title: "Proveedor"},
            { data: "user", title: "Usuario"},
            { data: "payment_type", title: "Tipo de Pago"},
            { data: "amount", title: "Monto"},
            { data: "obs", title: "Observaciones"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_detallescompra", {
        data: compraDetalles.map((d) => {
            return {
                ...d,
                product: productoMap[d.product_id]
            };
        }),
        columns: [
            { data: "id", title: "Id Detalle"},
            { data: "purchase_id", title: "Id Compra"},
            { data: "product", title: "Producto"},
            { data: "amount", title: "Cantidad"},
            { data: "unit_price", title: "Precio Unitario"},
            { data: "subtotal", title: "Subtotal"},
            { data: "created_at", title: "Fecha de Creación"}
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_ventas", {
        data: ventas.map((v) => {
            return {
                ...v,
                client: clienteMap[v.client_id],
                user: usuarioMap[v.user_id],
                updated_at: v.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Venta"},
            { data: "client", title: "Cliente"},
            { data: "user", title: "Usuario"},
            { data: "payment_type", title: "Tipo de Pago"},
            { data: "amount", title: "Monto"},
            { data: "obs", title: "Observaciones"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_detallesventa", {
        data: ventaDetalles.map((d) => {
            return {
                ...d,
                product: productoMap[d.product_id],
            };
        }),
        columns: [
            { data: "id", title: "Id Detalle"},
            { data: "sale_id", title: "Id Venta"},
            { data: "product", title: "Producto"},
            { data: "amount", title: "Cantidad"},
            { data: "unit_price", title: "Precio Unitario"},
            { data: "subtotal", title: "Subtotal"},
            { data: "created_at", title: "Fecha de Creación"}
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_cuentasporpagar", {
        data: cuentasPorPagar.map((c) => {
            return {
                ...c,
                provider: proveedorMap[c.provider_id],
                updated_at: c.updated_at || ""
            };
        }),
        columns: [
            { data: "id", title: "Id Cuenta"},
            { data: "purchase_id", title: "Id Compra"},
            { data: "provider", title: "Proveedor"},
            { data: "amount_total", title: "Cantidad Total"},
            { data: "amount_paid", title: "Cantidad Pagada"},
            { data: "amount_due", title: "Cantidad Pendiente"},
            { data: "status", title: "Estado"},
            { data: "expire_at", title: "Fecha de Vencimiento"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_cuentasporcobrar", {
        data: cuentasPorCobrar.map((c) => {
            return {
                ...c,
                client: clienteMap[c.client_id],
                updated_at: c.updated_at
            };
        }),
        columns: [
            { data: "id", title: "Id Cuenta"},
            { data: "sale_id", title: "Id Compra"},
            { data: "client", title: "Proveedor"},
            { data: "amount_total", title: "Cantidad Total"},
            { data: "amount_paid", title: "Cantidad Pagada"},
            { data: "amount_due", title: "Cantidad Pendiente"},
            { data: "status", title: "Estado"},
            { data: "expire_at", title: "Fecha de Vencimiento"},
            { data: "created_at", title: "Fecha de Creación"},
            { data: "updated_at", title: "Fecha de Modificación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_pagos", {
        data: pagos,
        columns: [
            { data: "id", title: "Id Pago"},
            { data: "account_payable_id", title: "Id Cuenta"},
            { data: "amount", title: "Monto"},
            { data: "payment_method", title: "Método de Pago"},
            { data: "obs", title: "Observaciones"},
            { data: "created_at", title: "Fecha de Creación"}
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
    new DataTable("#tabla_cobros", {
        data: cobros,
        columns: [
            { data: "id", title: "Id Cobro"},
            { data: "account_receivable_id", title: "Id Cuenta"},
            { data: "amount", title: "Monto"},
            { data: "payment_method", title: "Método de Pago"},
            { data: "obs", title: "Observaciones"},
            { data: "created_at", title: "Fecha de Creación"},
        ],
        language: spanish,
        searching: false,    // Oculta el buscador
        lengthChange: false, // Oculta el paginación
        pageLength: 5
    });
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
    cargarDatosPrueba();
    alertify.success("Base de datos original cargada");
}

function borrarBD() {
    localStorage.clear();
    alertify.error("Base de datos eliminada");
}