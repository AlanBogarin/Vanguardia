import { hashPassword } from "./util";
// Compra: pago pendiente
// @type {}

const KEY_ROLES = "roles";
const KEY_USUARIOS = "usuarios";
const KEY_CLIENTES = "clientes";
const KEY_PROVEEDORES = "proveedores";
const KEY_CATEGORIAS = "categorias";
const KEY_MARCAS = "marcas";
const KEY_PRODUCTOS = "productos";

/**
 * Carga un elemento del Local Storage
 * @param {string} key 
 * @returns {Object?}
 */
function cargarBD(key) {
    return JSON.parse(localStorage.getItem(key));
}

/**
 * Guarda un objeto JS en Local Storage en JSON
 * @param {string} key 
 * @param {object} value 
 */
function guardarBD(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Elimina una elemento del Local Storage
 * @param {string} key 
 */
function eliminarBD(key) {
    localStorage.removeItem(key);
}

/**
 * @typedef {Object} Rol
 * @property {number} id Identificador unico del rol
 * @property {string} name Nombre del rol
 * @property {string} description Informacion del rol
 * @property {Date} created_at Fecha de creacion del rol
 * @property {Date?} updated_at Fecha de modificacion del rol
 */

/**
 * Recupera un rol a partir del identificador
 * @param {number} id 
 * @returns {Rol?}
 */
function cargarRol(id) {
    for (const rol of cargarRoles()) {
        if (rol.id === id) return rol;
    }
}

/**
 * Recupera todos los roles disponibles
 * @returns {Rol[]}
 */
function cargarRoles() {
    return Array.from(cargarBD(KEY_ROLES));
}

/**
 * Guarda un nuevo o existente rol
 * @param {Rol} rol 
 */
function guardarRol(rol) {
    const roles = cargarRoles();
    const index = roles.findIndex(item => item.id === rol.id);
    const data = {
        id: rol.id,
        name: rol.name,
        description: rol.description,
        created_at: rol.created_at,
        updated_at: rol.updated_at
    }
    if (index === -1) {
        roles.push(data)
    } else {
        roles[index] = data
    }
    guardarBD(KEY_ROLES, roles);
}

/**
 * Elimina un rol mediante el ID
 * @param {number} id 
 */
function eliminarRol(id) {
    const roles = cargarRoles();
    index = roles.findIndex(rol => rol.id === id);
    if (index === -1) return;
    roles.splice(index, 1);
    guardarBD(KEY_ROLES, roles);
}

/**
 * @typedef {Object} Usuario
 * @property {string} username Nombre corto identificador
 * @property {string} password_hash Hash de la contraseña
 * @property {string} name Nombre de usuario
 * @property {string} email Correo electronico
 * @property {number} rol_id Identificador del Rol
 * @property {boolean} active El usuario está activo
 * @property {Date} created_at Fecha de creacion del usuario
 * @property {Date?} updated_at Fecha de modificacion del usuario
 */

/**
 * Recupera un usuario mediante el username
 * @param {string} username 
 * @returns {Usuario?}
 */
function cargarUsuario(username) {
    for (const usuario of cargarUsuarios()) {
        if (usuario.username === username) return usuario;
    }
}

/**
 * Recupera todos los usuarios disponibles
 * @returns {Usuario[]}
 */
function cargarUsuarios() {
    return Array.from(cargarBD(KEY_USUARIOS));
}

/**
 * Guarda un nuevo o existente usuario
 * @param {Usuario} usuario 
 */
function guardarUsuario(usuario) {
    const usuarios = cargarUsuarios();
    const index = usuarios.findIndex(u => u.username === usuario.username);
    const data = {
        username: usuario.username,
        password_hash: usuario.password_hash,
        name: usuario.name,
        email: usuario.email,
        rolId: usuario.rolId,
        active: usuario.active,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at
    }
    if (index === -1) {
        usuarios.push(data)
    } else {
        usuarios[index] = data
    }
    guardarBD(KEY_USUARIOS, usuarios);
}

/**
 * Elimina un usuario mediante el username
 * @param {string} username
 */
function eliminarUsuario(username) {
    const usuarios = cargarUsuarios();
    const index = usuarios.findIndex(u => u.username === username);
    if (index !== -1) return;
    usuarios.splice(index, 1);
    guardarBD(KEY_USUARIOS, usuarios);
}

/**
 * @typedef {Object} Cliente
 * @property {number} id Identificador unico del cliente
 * @property {string} name Nombre del cliente
 * @property {string?} ruc RUC del cliente
 * @property {string?} tel Telefono del cliente
 * @property {string?} email Correo electronico del cliente
 * @property {string?} address Direccion fisica del cliente
 * @property {string?} active El cliente está activo
 * @property {Date} created_at Fecha de creacion del cliente
 * @property {Date?} updated_at Fecha de modificacion del cliente
 */

/**
 * Recupera un cliente mediante el ID
 * @param {number} id Identificador del cliente
 * @returns {Cliente?}
 */
function cargarCliente(id) {
    for (const cliente of cargarClientes()) {
        if (cliente.id === id) return cliente;
    }
}

/**
 * Recupera todos los clientes disponibles
 * @returns {Cliente[]}
 */
function cargarClientes() {
    return Array.from(cargarBD(KEY_CLIENTES));
}

/**
 * Guarda un cliente nuevo o existente
 * @param {Cliente} cliente 
 */
function guardarCliente(cliente) {
    const clientes = cargarClientes();
    const index = clientes.findIndex(c => c.id === cliente.id);
    const data = {
        id: cliente.id,
        name: cliente.name,
        ruc: cliente.ruc,
        tel: cliente.tel,
        email: cliente.email,
        address: cliente.address,
        active: cliente.active,        
        created_at: usuario.created_at,
        updated_at: usuario.updated_at
    }
    if (index === -1) {
        clientes.push(data)
    } else {
        clientes[index] = data
    }
    guardarBD(KEY_CLIENTES, clientes);
}

/**
 * Elimina un cliente mediante el ID
 * @param {number} id Identificador del cliente
 */
function eliminarCliente(id) {
    const clientes = cargarClientes();
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) return;
    clientes.splice(index, 1);
    guardarBD(KEY_CLIENTES, clientes);
}

/**
 * @typedef {Object} Proveedor
 * @property {number} id Identificador unico del proveedor
 * @property {string} name Nombre del proveedor
 * @property {string?} ruc RUC del proveedor
 * @property {string?} tel Telefono del proveedor
 * @property {string?} email Correo electronico del proveedor
 * @property {string?} address Direccion fisica del proveedor
 * @property {string?} active El proveedor está activo
 * @property {Date} created_at Fecha de creacion del cliente
 * @property {Date?} updated_at Fecha de modificacion del cliente
 */

/**
 * Recupera un proveedor mediante el ID
 * @param {number} id Identificador del proveedor
 * @returns {Proveedor?}
 */
function cargarProveedor(id) {
    for (const proveedor of cargarProveedores()) {
        if (proveedor.id === id) return proveedor;
    }
}

/**
 * Recupera todos los proveedores disponibles
 * @returns {Proveedor[]}
 */
function cargarProveedores() {
    return Array.from(cargarBD(KEY_PROVEEDORES));
}

/**
 * Guarda un proveedor nuevo o existente
 * @param {Proveedor} proveedor 
 */
function guardarProveedor(proveedor) {
    const proveedores = cargarProveedores();
    const index = proveedores.findIndex(p => p.id === proveedor.id);
    const data = {
        id: cliente.id,
        name: cliente.name,
        ruc: cliente.ruc,
        tel: cliente.tel,
        email: cliente.email,
        address: cliente.address,
        active: cliente.active,        
        created_at: usuario.created_at,
        updated_at: usuario.updated_at
    }
    if (index === -1) {
        proveedores.push(data)
    } else {
        proveedores[index] = data
    }
    guardarBD(KEY_PROVEEDORES, proveedores);
}

/**
 * Elimina un proveedor mediante el ID
 * @param {number} id Identificador del proveedor
 */
function eliminarProveedor(id) {
    const proveedores = cargarProveedores();
    const index = proveedores.findIndex(p => p.id === id);
    if (index !== -1) return;
    proveedores.splice(index, 1);
    guardarBD(KEY_PROVEEDORES, proveedores);
}

/**
 * @typedef {Object} Categoria
 * @property {number} id Identificador unico de la categoria
 * @property {string} name Nombre de la categoria
 * @property {string} description Descripcion de la categoria
 * @property {Date} created_at Fecha de creacion del cliente
 * @property {Date?} updated_at Fecha de modificacion del cliente
 */

/**
 * Recupera una categoria mediante el ID
 * @param {number} id Identificador de la categoria
 * @returns {Categoria?}
 */
function cargarCategoria(id) {
    for (const categoria of cargarCategorias()) {
        if (categoria.id === id) return categoria;
    }
}

/**
 * Recupera todas las categorias disponibles
 * @returns {Categoria[]}
 */
function cargarCategorias() {
    return Array.from(cargarBD(KEY_CATEGORIAS));
}

/**
 * Guarda una categoria nueva o existente
 * @param {Categoria} categoria 
 */
function guardarCategoria(categoria) {
    const categorias = cargarCategorias();
    const index = categorias.findIndex(c => c.id === categoria.id);
    const data = {
        id: categoria.id,
        name: categoria.name,
        description: categoria.description,
        created_at: categoria.created_at,
        updated_at: categoria.updated_at
    }
    if (index === -1) {
        categorias.push(data)
    } else {
        categorias[index] = data
    }
    guardarBD(KEY_CATEGORIAS, categorias);
}

/**
 * Elimina una categoria mediante el ID
 * @param {number} id Identificador de la categoria
 */
function eliminarCategoria(id) {
    const categorias = cargarCategorias();
    const index = categorias.findIndex(c => c.id === id);
    if (index !== -1) return;
    categorias.splice(index, 1);
    guardarBD(KEY_CATEGORIAS, categorias);
}

/**
 * @typedef {Object} Marca
 * @property {number} id Identificador unico de la marca
 * @property {string} name Nombre de la marca
 * @property {Date} created_at Fecha de creacion del marca
 * @property {Date?} updated_at Fecha de modificacion del marca
 */

/**
 * Recupera una marca mediante el ID
 * @param {number} id Identificador de la marca
 * @returns {Marca?}
 */
function cargarMarca(id) {
    for (const marca of cargarMarcas()) {
        if (marca.id === id) return marca;
    }
}

/**
 * Recupera todas las marcas disponibles
 * @returns {Marca[]}
 */
function cargarMarcas() {
    return Array.from(cargarBD(KEY_MARCAS));
}

/**
 * Guarda una marca nueva o existente
 * @param {Marca} marca 
 */
function guardarMarca(marca) {
    const marcas = cargarMarcas();
    const index = marcas.findIndex(m => m.id === marca.id);
    const data = {
        id: marca.id,
        name: marca.name,
        created_at: marca.created_at,
        updated_at: marca.updated_at
    }
    if (index === -1) {
        marcas.push(data)
    } else {
        marcas[index] = data
    }
    guardarBD(KEY_MARCAS, marcas);
}

/**
 * Elimina una marca mediante el ID
 * @param {number} id Identificador de la marca
 */
function eliminarMarca(id) {
    const marcas = cargarMarcas();
    const index = marcas.findIndex(m => m.id === id);
    if (index !== -1) return;
    marcas.splice(index, 1);
    guardarBD(KEY_MARCAS, marcas);
}


/**
 * @typedef {Object} Producto
 * @property {number} id Identificador unico del producto
 * @property {string} code Código de barra del producto
 * @property {string} name Nombre del producto
 * @property {string} description Descripción del producto
 * @property {number} purchase_price Precio de compra
 * @property {number} selling_price Precio de venta
 * @property {number} stock Existencias del producto
 * @property {number} min_stock Existencia mínima del producto
 * @property {number} category_id Identificador de la categoria
 * @property {number} brand_id Identificador de la marca
 * @property {boolean} active El producto está activo
 * @property {Date} created_at Fecha de creacion del marca
 * @property {Date?} updated_at Fecha de modificacion del marca
 */

/**
 * Recupera un producto mediante el ID
 * @param {number} id Identificador del producto
 * @returns {Producto?}
 */
function cargarProducto(id) {
    for (const producto of cargarProductos()) {
        if (producto.id === id) return producto;
    }
}

/**
 * Recupera todos los productos disponibles
 * @returns {Producto[]}
 */
function cargarProductos() {
    return Array.from(cargarBD(KEY_PRODUCTOS));
}

/**
 * Guarda un producto nueva o existente
 * @param {Producto} producto 
 */
function guardarProducto(producto) {
    const productos = cargarProductos();
    const index = productos.findIndex(p => p.id === producto.id);
    const data = {
        id: producto.id,
        code: producto.code,
        name: producto.name,
        description: producto.description,
        purchase_price: producto.purchase_price,
        selling_price: producto.selling_price,
        stock: producto.stock,
        min_stock: producto.min_stock,
        category_id: producto.category_id,
        brand_id: producto.brand_id,
        active: producto.active,
        created_at: producto.created_at,
        updated_at: producto.updated_at
    }
    if (index === -1) {
        productos.push(data)
    } else {
        productos[index] = data
    }
    guardarBD(KEY_PRODUCTOS, productos);
}

/**
 * Elimina un producto mediante el ID
 * @param {number} id Identificador del producto
 */
function eliminarProducto(id) {
    const productos = cargarProductos();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) return;
    productos.splice(index, 1);
    guardarBD(KEY_PRODUCTOS, productos);
}

    // Compras
    // id             SERIAL PRIMARY KEY,
    // proveedor_id   INTEGER NOT NULL REFERENCES proveedores(id),
    // usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
    // fecha          TIMESTAMP DEFAULT NOW(),
    // tipo_pago      VARCHAR(20) NOT NULL CHECK (tipo_pago IN ('CONTADO', 'CREDITO')),
    // total          DECIMAL(12,2) NOT NULL DEFAULT 0,
    // observaciones  TEXT,
    // created_at     TIMESTAMP DEFAULT NOW(),
    // updated_at     TIMESTAMP DEFAULT NOW()

    // DetalleCompras
    // id              SERIAL PRIMARY KEY,
    // compra_id       INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    // producto_id     INTEGER NOT NULL REFERENCES productos(id),
    // cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    // precio_unitario DECIMAL(12,2) NOT NULL,
    // subtotal        DECIMAL(12,2) NOT NULL,
    // created_at      TIMESTAMP DEFAULT NOW()

    // Ventas
    // id             SERIAL PRIMARY KEY,
    // cliente_id     INTEGER NOT NULL REFERENCES clientes(id),
    // usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
    // fecha          TIMESTAMP DEFAULT NOW(),
    // tipo_pago      VARCHAR(20) NOT NULL CHECK (tipo_pago IN ('CONTADO', 'CREDITO')),
    // total          DECIMAL(12,2) NOT NULL DEFAULT 0,
    // observaciones  TEXT,
    // created_at     TIMESTAMP DEFAULT NOW(),
    // updated_at     TIMESTAMP DEFAULT NOW()

    // DetalleVentas
    // id              SERIAL PRIMARY KEY,
    // venta_id        INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    // producto_id     INTEGER NOT NULL REFERENCES productos(id),
    // cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    // precio_unitario DECIMAL(12,2) NOT NULL,
    // subtotal        DECIMAL(12,2) NOT NULL,
    // created_at      TIMESTAMP DEFAULT NOW()

    // CuentasPorPagar
    // id                SERIAL PRIMARY KEY,
    // compra_id         INTEGER NOT NULL REFERENCES compras(id),
    // proveedor_id      INTEGER NOT NULL REFERENCES proveedores(id),
    // monto_total       DECIMAL(12,2) NOT NULL,
    // monto_pagado      DECIMAL(12,2) NOT NULL DEFAULT 0,
    // saldo             DECIMAL(12,2) NOT NULL,
    // estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PARCIAL', 'PAGADA')),
    // fecha_vencimiento DATE,
    // created_at        TIMESTAMP DEFAULT NOW(),
    // updated_at        TIMESTAMP DEFAULT NOW()

    // CuentasPorCobrar
    // id                SERIAL PRIMARY KEY,
    // venta_id          INTEGER NOT NULL REFERENCES ventas(id),
    // cliente_id        INTEGER NOT NULL REFERENCES clientes(id),
    // monto_total       DECIMAL(12,2) NOT NULL,
    // monto_cobrado     DECIMAL(12,2) NOT NULL DEFAULT 0,
    // saldo             DECIMAL(12,2) NOT NULL,
    // estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PARCIAL', 'COBRADA')),
    // fecha_vencimiento DATE,
    // created_at        TIMESTAMP DEFAULT NOW(),
    // updated_at        TIMESTAMP DEFAULT NOW()

    // Pagos
    // id                  SERIAL PRIMARY KEY,
    // cuenta_por_pagar_id INTEGER NOT NULL REFERENCES cuentas_por_pagar(id),
    // monto               DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    // fecha               TIMESTAMP DEFAULT NOW(),
    // metodo_pago         VARCHAR(50) DEFAULT 'EFECTIVO',
    // observaciones       TEXT,
    // created_at          TIMESTAMP DEFAULT NOW()

    // Cobros
    // id                   SERIAL PRIMARY KEY,
    // cuenta_por_cobrar_id INTEGER NOT NULL REFERENCES cuentas_por_cobrar(id),
    // monto                DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    // fecha                TIMESTAMP DEFAULT NOW(),
    // metodo_pago          VARCHAR(50) DEFAULT 'EFECTIVO',
    // observaciones        TEXT,
    // created_at           TIMESTAMP DEFAULT NOW()

function initDB() {
    guardarRol({
        id: 1,
        name: "ADMIN",
        description: "Administrador con acceso total",
        created_at: new Date(),
        updated_at: new Date()
    })
    guardarRol({
        id: 2,
        name: "VENDEDOR",
        description: "Vendedor con acceso limitado",
        created_at: new Date(),
        updated_at: new Date()
    })
    guardarUsuario({
        username: "admin",
        // hash para "admin123" 
        password_hash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", 
        name: "Administrador",
        email: "admin@vanguardia.com",
        rolId: 1,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
    })
    // guardarCategoria({
    //     name: "General",
    //     description: "Categoría general de productos"
    // });
    // guardarMarca({
    //     name: "Sin marca"
    // });
}

function cargarDatosPrueba() {}
