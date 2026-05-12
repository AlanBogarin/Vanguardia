// @type {}

// BD
const KEY_ROLES = "roles";
const KEY_USUARIOS = "usuarios";
const KEY_CLIENTES = "clientes";
const KEY_PROVEEDORES = "proveedores";
const KEY_CATEGORIAS = "categorias";
const KEY_MARCAS = "marcas";
const KEY_PRODUCTOS = "productos";
const KEY_COMPRAS = "compras";
const KEY_COMPRADETALLES = "compradetalles";
const KEY_VENTAS = "ventas";
const KEY_VENTADETALLES = "ventadetalles";
const KEY_CUENTASPORPAGAR = "cuentasporpagar";
const KEY_CUENTASPORCOBRAR = "cuentasporcobrar";
const KEY_PAGOS = "pagos";
const KEY_COBROS = "cobros";
const KEY_SESION = "sesion";

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

const PERMISOS = {
    // MODULO USUARIOS Y ROLES (Bits 0-3)
    GESTIONAR_USUARIOS: 1 << 0,  // 1
    GESTIONAR_ROLES:    1 << 1,  // 2
    // MODULO INVENTARIO (Bits 4-7)
    VER_PRODUCTOS:      1 << 4,  // 16
    EDITAR_PRODUCTOS:   1 << 5,  // 32
    GESTIONAR_STOCKS:   1 << 6,  // 64
    // MODULO VENTAS (Bits 8-11)
    CREAR_VENTA:        1 << 8,  // 256
    ANULAR_VENTA:       1 << 9,  // 512
    VER_REPORTES_VENTA: 1 << 10, // 1024
    // MODULO COMPRAS Y PROVEEDORES (Bits 12-15)
    GESTIONAR_COMPRAS:  1 << 12, // 4096
    VER_PROVEEDORES:    1 << 13, // 8192
    // MODULO FINANZAS (Bits 16-19)
    GESTIONAR_PAGOS:    1 << 16, // 65536
    GESTIONAR_COBROS:   1 << 17, // 131072
    // SUPER ADMIN
    ADMIN_TOTAL:        (1 << 30) // bypass
};

/**
 * Crea un número de flags a partir de un array de permisos
 * @param {number[]} permisos Lista de permisos Ej: [PERMISOS.USUARIOS, PERMISOS.VENTAS]
 * @returns {number}
 */
function agruparFlags(permisos) {
    return permisos.reduce((acc, current) => acc | current, 0);
}

/**
 * Convierte un número de flags en un array de permisos legibles
 * @param {number} flags Flags del rol (ej: 68)
 * @returns {number[]} Lista de permisos individuales (ej: [4, 64])
 */
function desagruparFlags(flags) {
    return Object.values(PERMISOS).filter(permiso => (flags & permiso) !== 0);
}

/**
 * Verifica si un rol tiene un permiso específico
 * @param {number} flags Flags del rol
 * @param {number} permiso Permiso a comprobar
 * @returns {boolean}
 */
function tienePermiso(flags, permiso) {
    // Si tiene el flag de ADMIN_TOTAL, siempre devuelve true
    if ((flags & PERMISOS.ADMIN_TOTAL) !== 0) return true;
    return (flags & permiso) !== 0;
}

/**
 * Agrega un permiso a un flag existente
 * @param {number} flags Flags del rol
 * @param {number} permiso Permiso a agregar
 */
function agregarPermiso(flags, permiso) {
    return flags | permiso;
}

/**
 * Quita un permiso de un flag existente
 * @param {number} flags Flags del rol
 * @param {number} permiso Permiso a quitar
 */
function quitarPermiso(flags, permiso) {
    return flags & ~permiso;
}

/**
 * @typedef {Object} Rol
 * @property {number} id Identificador unico del rol
 * @property {string} name Nombre del rol
 * @property {string} description Informacion del rol
 * @property {number} flags Permisos del rol
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
    return Array.from(cargarBD(KEY_ROLES) || []);
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
        name: rol.name.toUpperCase(),
        description: rol.description.toUpperCase(),
        flags: rol.flags,
        created_at: rol.created_at,
        updated_at: rol.updated_at || null
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
 * @property {number} id Identificador único del usuario
 * @property {string} username Nombre de usuario
 * @property {string} password_hash Hash de la contraseña
 * @property {string} name Nombre completo
 * @property {string} email Correo electronico
 * @property {number} rol_id Identificador del Rol
 * @property {boolean} active El usuario está activo
 * @property {Date} created_at Fecha de creacion del usuario
 * @property {Date?} updated_at Fecha de modificacion del usuario
 */

/**
 * Recupera un usuario mediante el ID
 * @param {number?} id Identificador del usuario
 * @param {string?} username Nombre de usuario a mostrar
 * @returns {Usuario?}
 */
function cargarUsuario(id=null, username=null) {
    if (id === null && username === null) return null;
    const usuarios = cargarUsuarios();
    const usuario = id !== null
        ? usuarios.find((u) => u.id === id)
        : usuarios.find((u) => u.username === username);
    return usuario || null;
}

/**
 * Recupera todos los usuarios disponibles
 * @returns {Usuario[]}
 */
function cargarUsuarios() {
    return Array.from(cargarBD(KEY_USUARIOS) || []);
}

/**
 * Guarda un nuevo o existente usuario
 * @param {Usuario} usuario 
 */
function guardarUsuario(usuario) {
    const usuarios = cargarUsuarios();
    const index = usuarios.findIndex(u => u.id === usuario.id);
    const data = {
        id: usuario.id,
        username: usuario.username.toLowerCase(),
        password_hash: usuario.password_hash,
        name: usuario.name.toUpperCase(),
        email: usuario.email.toLowerCase(),
        rol_id: usuario.rol_id,
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
 * Elimina un usuario mediante el ID
 * @param {number} id
 */
function eliminarUsuario(id) {
    const usuarios = cargarUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return;
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
 * @property {boolean} active El cliente está activo
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
    return Array.from(cargarBD(KEY_CLIENTES) || []);
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
        name: cliente.name.toUpperCase(),
        ruc: cliente.ruc,
        tel: cliente.tel,
        email: cliente.email ? cliente.email.toLowerCase() : null,
        address: cliente.address ? cliente.address.toUpperCase() : null,
        active: cliente.active,        
        created_at: cliente.created_at,
        updated_at: cliente.updated_at
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
    if (index === -1) return;
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
 * @property {boolean} active El proveedor está activo
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
    return Array.from(cargarBD(KEY_PROVEEDORES) || []);
}

/**
 * Guarda un proveedor nuevo o existente
 * @param {Proveedor} proveedor 
 */
function guardarProveedor(proveedor) {
    const proveedores = cargarProveedores();
    const index = proveedores.findIndex(p => p.id === proveedor.id);
    const data = {
        id: proveedor.id,
        name: proveedor.name.toUpperCase(),
        ruc: proveedor.ruc,
        tel: proveedor.tel,
        email: proveedor.email ? proveedor.email.toLowerCase() : null,
        address: proveedor.address ? proveedor.address.toUpperCase() : null,
        active: proveedor.active,        
        created_at: proveedor.created_at,
        updated_at: proveedor.updated_at
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
    if (index === -1) return;
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
    return Array.from(cargarBD(KEY_CATEGORIAS) || []);
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
        name: categoria.name.toUpperCase(),
        description: categoria.description.toUpperCase(),
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
    if (index === -1) return;
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
    return Array.from(cargarBD(KEY_MARCAS) || []);
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
        name: marca.name.toUpperCase(),
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
    if (index === -1) return;
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
 * @property {0 | 5 | 10} iva Tipo de IVA
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
    return Array.from(cargarBD(KEY_PRODUCTOS) || []);
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
        name: producto.name.toUpperCase(),
        description: producto.description.toUpperCase(),
        purchase_price: producto.purchase_price,
        selling_price: producto.selling_price,
        stock: producto.stock,
        min_stock: producto.min_stock,
        category_id: producto.category_id,
        brand_id: producto.brand_id,
        iva: producto.iva,
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
    if (index === -1) return;
    productos.splice(index, 1);
    guardarBD(KEY_PRODUCTOS, productos);
}

/**
 * @typedef {Object} Compra
 * @property {number} id Identificador unico de la compra
 * @property {number} provider_id Identificador del proveedor
 * @property {number} user_id Identificador del usuario que compra
 * @property {"CONTADO" | "CREDITO"} payment_type Tipo de pago
 * @property {number} amount Total de pago
 * @property {string} obs Observaciones de la compra
 * @property {Date} created_at Fecha de creacion de la compra
 * @property {Date?} updated_at Fecha de modificacion de la compra
 */

/**
 * Recupera una compra mediante el ID
 * @param {number} id Identificador de la compra
 * @returns {Compra?}
 */
function cargarCompra(id) {
    for (const compra of cargarCompras()) {
        if (compra.id === id) return compra;
    }
}

/**
 * Recupera todas las compras realizadas
 * @returns {Compra[]}
 */
function cargarCompras() {
    return Array.from(cargarBD(KEY_COMPRAS) || []);
}

/**
 * Guarda una compra nueva o existente
 * @param {Compra} compra 
 */
function guardarCompra(compra) {
    const compras = cargarCompras();
    const index = compras.findIndex(c => c.id === compra.id);
    const data = {
        id: compra.id,
        provider_id: compra.provider_id,
        user_id: compra.user_id,
        payment_type: compra.payment_type,
        amount: compra.amount,
        obs: compra.obs.toUpperCase(),
        created_at: compra.created_at,
        updated_at: compra.updated_at
    }
    if (index === -1) {
        compras.push(data)
    } else {
        compras[index] = data
    }
    guardarBD(KEY_COMPRAS, compras);
}

/**
 * Elimina una compra mediante el ID
 * @param {number} id Identificador de la compra
 */
function eliminarCompra(id) {
    const compras = cargarCompras();
    const index = compras.findIndex(c => c.id === id);
    if (index === -1) return;
    compras.splice(index, 1);
    guardarBD(KEY_COMPRAS, compras);
}

/**
 * @typedef {Object} CompraDetalle
 * @property {number} id Identificador unico del detalle de compra
 * @property {number} purchase_id Identificador de la compra
 * @property {number} product_id Identificador del producto
 * @property {number} amount Cantidad del producto comprado
 * @property {number} unit_price Precio unitario
 * @property {number} subtotal Subtotal de compra: precio * cantidad
 * @property {Date} created_at Fecha de creacion de la compra
 */

/**
 * Recupera un detalle de compra mediante el ID
 * @param {number} id Identificador de la compra
 * @returns {CompraDetalle?}
 */
function cargarCompraDetalle(id) {
    for (const compra of cargarCompraDetalles()) {
        if (compra.id === id) return compra;
    }
}

/**
 * Recupera todos los detalles de compra realizadas
 * @param {number?} compra_id Identificador de compra
 * @returns {CompraDetalle[]}
 */
function cargarCompraDetalles(compra_id=null) {
    /** @type {CompraDetalle[]} */
    const detalles = Array.from(cargarBD(KEY_COMPRADETALLES) || []);
    if (!compra_id) return detalles;
    return detalles.filter(d => d.purchase_id === compra_id);
}

/**
 * Guarda un detalle de compra nuevo o existente
 * @param {CompraDetalle} detalle 
 */
function guardarCompraDetalle(detalle) {
    const detalles = cargarCompraDetalles();
    const index = detalles.findIndex(d => d.id === detalle.id);
    const data = {
        id: detalle.id,
        purchase_id: detalle.purchase_id,
        product_id: detalle.product_id,
        amount: detalle.amount,
        unit_price: detalle.unit_price,
        subtotal: detalle.subtotal,
        created_at: detalle.created_at
    }
    if (index === -1) {
        detalles.push(data)
    } else {
        detalles[index] = data
    }
    guardarBD(KEY_COMPRADETALLES, detalles);
}

/**
 * Elimina un detalle de compra mediante el ID
 * @param {number} id Identificador del detalle de compra
 */
function eliminarCompraDetalle(id) {
    const detalles = cargarCompraDetalles();
    const index = detalles.findIndex(d => d.id === id);
    if (index === -1) return;
    detalles.splice(index, 1);
    guardarBD(KEY_COMPRADETALLES, detalles);
}

/**
 * @typedef {Object} Venta
 * @property {number} id Identificador unico de la venta
 * @property {number} client_id Identificador del cliente
 * @property {number} user_id Identificador del usuario que vendió
 * @property {"CONTADO" | "CREDITO"} payment_type Tipo de pago
 * @property {number} amount Total de pago
 * @property {string} obs Observaciones de la venta
 * @property {Date} created_at Fecha de creacion de la compra
 * @property {Date?} updated_at Fecha de modificacion de la compra
 */

/**
 * Recupera una venta mediante el ID
 * @param {number} id Identificador de la venta
 * @returns {Venta?}
 */
function cargarVenta(id) {
    for (const venta of cargarVentas()) {
        if (venta.id === id) return venta;
    }
}

/**
 * Recupera todas las ventas realizadas
 * @returns {Venta[]}
 */
function cargarVentas() {
    return Array.from(cargarBD(KEY_VENTAS) || []);
}

/**
 * Guarda una venta nueva o existente
 * @param {Venta} venta 
 */
function guardarVenta(venta) {
    const ventas = cargarVentas();
    const index = ventas.findIndex(v => v.id === venta.id);
    const data = {
        id: venta.id,
        client_id: venta.client_id,
        user_id: venta.user_id,
        payment_type: venta.payment_type,
        amount: venta.amount,
        obs: venta.obs.toUpperCase(),
        created_at: venta.created_at,
        updated_at: venta.updated_at
    }
    if (index === -1) {
        ventas.push(data)
    } else {
        ventas[index] = data
    }
    guardarBD(KEY_VENTAS, ventas);
}

/**
 * Elimina una venta mediante el ID
 * @param {number} id Identificador de la venta
 */
function eliminarCompra(id) {
    const ventas = cargarVentas();
    const index = ventas.findIndex(v => v.id === id);
    if (index === -1) return;
    ventas.splice(index, 1);
    guardarBD(KEY_VENTAS, ventas);
}

/**
 * @typedef {Object} VentaDetalle
 * @property {number} id Identificador unico del detalle de venta
 * @property {number} sale_id Identificador de la venta
 * @property {number} product_id Identificador del producto
 * @property {number} amount Cantidad del producto vendido
 * @property {number} unit_price Precio unitario
 * @property {number} subtotal Subtotal de compra: precio * cantidad
 * @property {Date} created_at Fecha de creacion de la compra
 */

/**
 * Recupera un detalle de venta mediante el ID
 * @param {number} id Identificador de la venta
 * @returns {VentaDetalle?}
 */
function cargarVentaDetalle(id) {
    for (const venta of cargarVentaDetalles()) {
        if (venta.id === id) return venta;
    }
}

/**
 * Recupera todos los detalles de venta realizadas
 * @param {number?} venta_id Identificador de venta
 * @returns {VentaDetalle[]}
 */
function cargarVentaDetalles(venta_id=null) {
    /** @type {VentaDetalle[]} */
    const detalles = Array.from(cargarBD(KEY_VENTADETALLES) || []);
    if (!venta_id) return detalles;
    return detalles.filter(d => d.sale_id === venta_id);
}

/**
 * Guarda un detalle de venta nuevo o existente
 * @param {VentaDetalle} detalle 
 */
function guardarVentaDetalle(detalle) {
    const detalles = cargarVentaDetalles();
    const index = detalles.findIndex(d => d.id === detalle.id);
    const data = {
        id: detalle.id,
        sale_id: detalle.sale_id,
        product_id: detalle.product_id,
        amount: detalle.amount,
        unit_price: detalle.unit_price,
        subtotal: detalle.subtotal,
        created_at: detalle.created_at
    }
    if (index === -1) {
        detalles.push(data)
    } else {
        detalles[index] = data
    }
    guardarBD(KEY_VENTADETALLES, detalles);
}

/**
 * Elimina un detalle de venta mediante el ID
 * @param {number} id Identificador del detalle de venta
 */
function eliminarVentaDetalle(id) {
    const detalles = cargarVentaDetalles();
    const index = detalles.findIndex(d => d.id === id);
    if (index === -1) return;
    detalles.splice(index, 1);
    guardarBD(KEY_VENTADETALLES, detalles);
}

/**
 * @typedef {Object} CuentaPorPagar
 * @property {number} id Identificador unico de la cuenta a pagar
 * @property {number} purchase_id Identificador de la compra
 * @property {number} provider_id Identificador del proveedor
 * @property {number} amount_total Cantidad total a pagar
 * @property {number} amount_paid Cantidad pagada
 * @property {number} amount_due Cantidad pendiente a pagar (amount_total - amount_paid)
 * @property {"PENDIENTE" | "PARCIAL" | "PAGADA"} status Estado de la cuenta
 * @property {Date} expire_at Fecha de vencimiento del pago
 * @property {Date} created_at Fecha de creacion de la compra
 * @property {Date?} updated_at Fecha de modificacion de la compra
 */

/**
 * Recupera una cuenta a pagar mediante el ID
 * @param {number} id Identificador de la cuenta
 * @returns {CuentaPorPagar?}
 */
function cargarCuentaPorPagar(id) {
    for (const cuenta of cargarCuentasPorPagar()) {
        if (cuenta.id === id) return cuenta;
    }
}

/**
 * Recupera todas las cuentas por pagar
 * @returns {CuentaPorPagar[]}
 */
function cargarCuentasPorPagar() {
    return Array.from(cargarBD(KEY_CUENTASPORPAGAR) || []);
}

/**
 * Guarda una cuenta por pagar nueva o existente
 * @param {CuentaPorPagar} cuenta 
 */
function guardarCuentaPorPagar(cuenta) {
    const cuentas = cargarCuentasPorPagar();
    const index = cuentas.findIndex(c => c.id === cuenta.id);
    const data = {
        id: cuenta.id,
        purchase_id: cuenta.purchase_id,
        provider_id: cuenta.provider_id,
        amount_total: cuenta.amount_total,
        amount_paid: cuenta.amount_paid,
        amount_due: cuenta.amount_due,
        status: cuenta.status,
        expire_at: cuenta.expire_at,
        created_at: cuenta.created_at,
        updated_at: cuenta.updated_at
    }
    if (index === -1) {
        cuentas.push(data)
    } else {
        cuentas[index] = data
    }
    guardarBD(KEY_CUENTASPORPAGAR, cuentas);
}

/**
 * Elimina una cuenta a pagar mediante el ID
 * @param {number} id Identificador de la cuenta
 */
function eliminarCuentaPorPagar(id) {
    const cuentas = cargarCuentasPorPagar();
    const index = cuentas.findIndex(c => c.id === id);
    if (index === -1) return;
    cuentas.splice(index, 1);
    guardarBD(KEY_CUENTASPORPAGAR, cuentas);
}

/**
 * @typedef {Object} CuentaPorCobrar
 * @property {number} id Identificador unico de la cuenta a cobrar
 * @property {number} sale_id Identificador de la venta
 * @property {number} client_id Identificador del cliente
 * @property {number} amount_total Cantidad total a cobrar
 * @property {number} amount_paid Cantidad pagada
 * @property {number} amount_due Cantidad pendiente a cobrar (amount_total - amount_paid)
 * @property {"PENDIENTE" | "PARCIAL" | "COBRADA"} status Estado de la cuenta
 * @property {Date} expire_at Fecha de vencimiento del cobro
 * @property {Date} created_at Fecha de creacion de la compra
 * @property {Date?} updated_at Fecha de modificacion de la compra
 */

/**
 * Recupera una cuenta a cobrar mediante el ID
 * @param {number} id Identificador de la cuenta
 * @returns {CuentaPorCobrar?}
 */
function cargarCuentaPorCobrar(id) {
    for (const cuenta of cargarCuentasPorCobrar()) {
        if (cuenta.id === id) return cuenta;
    }
}

/**
 * Recupera todas las cuentas por cobrar
 * @returns {CuentaPorCobrar[]}
 */
function cargarCuentasPorCobrar() {
    return Array.from(cargarBD(KEY_CUENTASPORCOBRAR) || []);
}

/**
 * Guarda una cuenta por cobrar nueva o existente
 * @param {CuentaPorCobrar} cuenta 
 */
function guardarCuentaPorCobrar(cuenta) {
    const cuentas = cargarCuentasPorCobrar();
    const index = cuentas.findIndex(c => c.id === cuenta.id);
    const data = {
        id: cuenta.id,
        sale_id: cuenta.sale_id,
        client_id: cuenta.client_id,
        amount_total: cuenta.amount_total,
        amount_paid: cuenta.amount_paid,
        amount_due: cuenta.amount_due,
        status: cuenta.status,
        expire_at: cuenta.expire_at,
        created_at: cuenta.created_at,
        updated_at: cuenta.updated_at
    }
    if (index === -1) {
        cuentas.push(data)
    } else {
        cuentas[index] = data
    }
    guardarBD(KEY_CUENTASPORCOBRAR, cuentas);
}

/**
 * Elimina una cuenta a cobrar mediante el ID
 * @param {number} id Identificador de la cuenta
 */
function eliminarCuentaPorCobrar(id) {
    const cuentas = cargarCuentasPorCobrar();
    const index = cuentas.findIndex(c => c.id === id);
    if (index === -1) return;
    cuentas.splice(index, 1);
    guardarBD(KEY_CUENTASPORCOBRAR, cuentas);
}

/**
 * @typedef {Object} Pago
 * @property {number} id Identificador unico del pago
 * @property {number} account_payable_id Identificador de la cuenta por pagar
 * @property {number} amount Cantidad pagada
 * @property {"EFECTIVO"} payment_method Método de pago
 * @property {string} obs Observaciones del pago
 * @property {Date} created_at Fecha de creacion del pago
 */

/**
 * Recupera un pago mediante el ID
 * @param {number} id Identificador del pago
 * @returns {Pago?}
 */
function cargarPago(id) {
    for (const pago of cargarPagos()) {
        if (pago.id === id) return pago;
    }
}

/**
 * Recupera todos los pagos realizadas
 * @returns {Pago[]}
 */
function cargarPagos() {
    return Array.from(cargarBD(KEY_PAGOS) || []);
}

/**
 * Guarda un pago nueva o existente
 * @param {Pago} pago 
 */
function guardarPago(pago) {
    const pagos = cargarPagos();
    const index = pagos.findIndex(p => p.id === pago.id);
    const data = {
        id: pago.id,
        account_payable_id: pago.account_payable_id,
        amount: pago.amount,
        payment_method: pago.payment_method,
        obs: pago.obs.toUpperCase(),
        created_at: pago.created_at
    }
    if (index === -1) {
        pagos.push(data)
    } else {
        pagos[index] = data
    }
    guardarBD(KEY_PAGOS, pagos);
}

/**
 * Elimina un pago mediante el ID
 * @param {number} id Identificador del pago
 */
function eliminarPago(id) {
    const pagos = cargarPagos();
    const index = pagos.findIndex(p => p.id === id);
    if (index === -1) return;
    pagos.splice(index, 1);
    guardarBD(KEY_PAGOS, pagos);
}

/**
 * @typedef {Object} Cobro
 * @property {number} id Identificador unico del cobro
 * @property {number} account_receivable_id Identificador de la cuenta por cobrar
 * @property {number} amount Cantidad cobrada
 * @property {"EFECTIVO"} payment_method Método de pago
 * @property {string} obs Observaciones del cobro
 * @property {Date} created_at Fecha de creacion del cobro
 */

/**
 * Recupera un cobro mediante el ID
 * @param {number} id Identificador del cobro
 * @returns {Cobro?}
 */
function cargarCobro(id) {
    for (const cobro of cargarCobros()) {
        if (cobro.id === id) return cobro;
    }
}

/**
 * Recupera todos los cobros realizadas
 * @returns {Cobro[]}
 */
function cargarCobros() {
    return Array.from(cargarBD(KEY_COBROS) || []);
}

/**
 * Guarda un cobro nueva o existente
 * @param {Cobro} cobro 
 */
function guardarCobro(cobro) {
    const cobros = cargarCobros();
    const index = cobros.findIndex(c => c.id === cobro.id);
    const data = {
        id: cobro.id,
        account_receivable_id: cobro.account_receivable_id,
        amount: cobro.amount,
        payment_method: cobro.payment_method,
        obs: cobro.obs.toUpperCase(),
        created_at: cobro.created_at
    }
    if (index === -1) {
        cobros.push(data)
    } else {
        cobros[index] = data
    }
    guardarBD(KEY_COBROS, cobros);
}

/**
 * Elimina un cobro mediante el ID
 * @param {number} id Identificador del cobro
 */
function eliminarCobro(id) {
    const cobros = cargarCobros();
    const index = cobros.findIndex(c => c.id === id);
    if (index === -1) return;
    cobros.splice(index, 1);
    guardarBD(KEY_COBROS, cobros);
}

/**
 * @typedef {Object} Sesion
 * @property {number} user_id Identificador del usuario
 * @property {Date} expire_at Fecha de expiración de la sesión
 * @property {Date} created_at Fecha de creacion de la sesión
 */

/**
 * Recuperar la sesion actual
 * @returns {Sesion?} Sesion actual 
 */
function cargarSesion() {
    return cargarBD(KEY_SESION);
}

/**
 * Guarda una sesion
 * @param {Sesion} sesion 
 */
function guardarSesion(sesion) {
    const data = {
        user_id: sesion.user_id,
        expire_at: sesion.expire_at,
        created_at: sesion.created_at
    }
    guardarBD(KEY_SESION, data);
}

/**
 * Elimina la sesion actual
 */
function eliminarSesion() {
    guardarBD(KEY_SESION, null);
}

function initDB() {
    for (const key of [KEY_ROLES, KEY_USUARIOS, KEY_CLIENTES, KEY_PROVEEDORES, KEY_CATEGORIAS,
            KEY_MARCAS, KEY_PRODUCTOS, KEY_COMPRAS, KEY_COMPRADETALLES, KEY_VENTAS,
            KEY_VENTADETALLES, KEY_CUENTASPORPAGAR, KEY_CUENTASPORCOBRAR, KEY_PAGOS, KEY_COBROS]) {
        guardarBD(key, []);
    }
    guardarBD(KEY_SESION, null);
    guardarRol({
        id: 1,
        name: "ADMIN",
        description: "Administrador con acceso total",
        flags: agruparFlags([PERMISOS.ADMIN_TOTAL]),
        created_at: new Date(),
        updated_at: null
    });
    guardarRol({
        id: 2,
        name: "VENDEDOR",
        description: "Vendedor con acceso limitado",
        flags: agruparFlags([PERMISOS.VER_PRODUCTOS, PERMISOS.EDITAR_PRODUCTOS, PERMISOS.CREAR_VENTA, PERMISOS.GESTIONAR_COBROS]),
        created_at: new Date(),
        updated_at: null
    });
    guardarUsuario({
        id: 1,
        username: "admin",
        // hash para "admin123" 
        password_hash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", 
        name: "Administrador",
        email: "admin@vanguardia.com",
        rol_id: 1,
        active: true,
        created_at: new Date(),
        updated_at: null
    });
    guardarUsuario({
        id: 2,
        username: "cajero",
        // hash para "admin123" 
        password_hash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", 
        name: "Cajero",
        email: "cajero@vanguardia.com",
        rol_id: 2,
        active: true,
        created_at: new Date(),
        updated_at: null
    });
    guardarCategoria({
        id: 1,
        name: "General",
        description: "Categoría general de productos",
        created_at: new Date(),
        updated_at: null
    });
    guardarMarca({
        id: 1,
        name: "Sin marca",
        created_at: new Date(),
        updated_at: null
    });

}

function cargarDatosPrueba() {
    guardarCliente({ id: 1, name: "JUAN CARLOS LOPEZ", ruc: "1234567", tel: "0985111222", email: null, address: "AV. BRASIL 123", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 2, name: "MARIA ELENA GOMEZ", ruc: "2345678", tel: "0971333444", email: null, address: "CALLE SAN PEDRO 45", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 3, name: "PEDRO ANTONIO MARTINEZ", ruc: "3456789", tel: "0961555666", email: null, address: "BARRIO SAN JORGE SN", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 4, name: "ANA BEATRIZ BENITEZ", ruc: "4567890", tel: "0981777888", email: null, address: "AV. MCAL. LOPEZ 800", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 5, name: "CARLOS DANIEL GIMENEZ", ruc: "5678901", tel: "0991999000", email: null, address: "CALLE INDEPENDENCIA 320", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 6, name: "ROSA MERCEDES PAREDES", ruc: "6789012", tel: "0982121313", email: null, address: "BO. REPUBLICANO MZ 5 CS 2", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 7, name: "LUIS FERNANDO ROJAS", ruc: "7890123", tel: "0972414515", email: null, address: "AV. EUSEBIO AYALA 1100", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 8, name: "PATRICIA NOEMI ACOSTA", ruc: "8901234", tel: "0962616717", email: null, address: "CALLE PIRIBEBUY 21O", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 9, name: "MIGUEL ANGEL SANCHEZ", ruc: "9012345", tel: "0992818919", email: null, address: "AV. FERNANDO DE LA MORA 560", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 10, name: "LAURA VIRGINIA ESQUIVEL", ruc: "1357924", tel: "0983020121", email: null, address: "CALLE CERRO CORA 78", active: true, created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 2, name: "BEBIDAS", description: "Cualquier tipo de bebida", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 3, name: "ALIMENTOS", description: "Cualquier tipo de comestible", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 2, name: "COCA COLA", created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 1, name: "COMPRA LOCAL", ruc: null, tel: null, email: null, address: null, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: Date.now(), code: "1111111", name: "COCA COLA 2L", description: "GASEOSA COCA COLA", purchase_price: 10000, selling_price: 15000, stock: 10, min_stock: 1, category_id: 2, brand_id: 2, iva: 10, active: true, created_at: new Date(), updated_at: null });
}

/**
 * Aplicar una funcion hash sobre una contraseña
 * 
 * Uso: `const hash = await hashPassword(password);`
 * @param {string} password Contraseña en texto plano
 * @returns {Promise<string>} Hash de la contraseña
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexArray = hashArray.map(b => b.toString(16).padStart(2, '0'));
    return hexArray.join('')
}
