/**
 * @typedef {import('./alertas')}
 * 
 * @typedef {Object} Rol
 * @property {number} id Identificador unico del rol
 * @property {string} name Nombre del rol
 * @property {string} description Informacion del rol
 * @property {BigInt} flags Permisos del rol
 * @property {Date} created_at Fecha de creacion del rol
 * @property {Date?} updated_at Fecha de modificacion del rol
 * 
 * @typedef {Object} Usuario
 * @property {number} id Identificador único del usuario
 * @property {string} username Nombre de usuario
 * @property {string} password_hash Hash de la contraseña
 * @property {string} name Nombre completo
 * @property {string} ruc Cédula o RUC del usuario
 * @property {string} tel Teléfono
 * @property {string} email Correo electronico
 * @property {string} address Dirección física del usuario
 * @property {number} rol_id Identificador del Rol
 * @property {boolean} active El usuario está activo
 * @property {Date} created_at Fecha de creacion del usuario
 * @property {Date?} updated_at Fecha de modificacion del usuario
 * 
 * @typedef {Object} Cliente
 * @property {number} id Identificador unico del cliente
 * @property {string} legal_name Razón Social
 * @property {string} ruc Cédula o RUC del cliente
 * @property {string} tel Telefono del cliente
 * @property {string?} email Correo electronico del cliente
 * @property {string} address Direccion física del cliente
 * @property {boolean} active El cliente está activo
 * @property {Date} created_at Fecha de creacion del cliente
 * @property {Date?} updated_at Fecha de modificacion del cliente
 * 
 * @typedef {Object} Proveedor
 * @property {number} id Identificador unico del proveedor
 * @property {string} legal_name Razón Social
 * @property {string} ruc Cédula o RUC del proveedor
 * @property {string} tel Telefono del proveedor
 * @property {string} email Correo electronico del proveedor
 * @property {string} address Direccion fisica del proveedor
 * @property {string} city Ciudad del proveedor
 * @property {boolean} active El proveedor está activo
 * @property {Date} created_at Fecha de creacion del cliente
 * @property {Date?} updated_at Fecha de modificacion del cliente
 * 
 * @typedef {Object} Categoria
 * @property {number} id Identificador unico de la categoria
 * @property {string} name Nombre de la categoria
 * @property {string} description Descripcion de la categoria
 * @property {Date} created_at Fecha de creacion del cliente
 * @property {Date?} updated_at Fecha de modificacion del cliente
 * 
 * @typedef {Object} Marca
 * @property {number} id Identificador unico de la marca
 * @property {string} name Nombre de la marca
 * @property {Date} created_at Fecha de creacion del marca
 * @property {Date?} updated_at Fecha de modificacion del marca
 * 
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
 * 
 * @typedef {Object} AjusteInventario
 * @property {number} id Identificador único del ajuste
 * @property {number} product_id Identificador del producto
 * @property {number} user_id Identificador del usuario que realizo el ajuste
 * @property {"ENTRADA" | "SALIDA"} type Tipo de ajuste
 * @property {number} quantity Cantidad ajustada
 * @property {string} reason Motivo del ajuste
 * @property {number} previous_stock Stock antes del ajuste
 * @property {number} new_stock Stock después del ajuste
 * @property {Date} created_at Fecha de creación
 * 
 * @typedef {Object} Compra
 * @property {number} id Identificador unico de la compra
 * @property {number} provider_id Identificador del proveedor
 * @property {number} user_id Identificador del usuario que compra
 * @property {Condicion} condition Condición de pago
 * @property {number} amount Total de pago
 * @property {string} invoice Nro. Factura de la compra
 * @property {string} stamping Nro. Timbrado de la compra
 * @property {Date} created_at Fecha de creacion de la compra
 * 
 * @typedef {Object} CompraDetalle
 * @property {number} id Identificador unico del detalle de compra
 * @property {number} purchase_id Identificador de la compra
 * @property {number} product_id Identificador del producto
 * @property {number} quantity Cantidad del producto comprado
 * @property {number} unit_price Precio unitario
 * @property {number} subtotal Subtotal de compra: precio * cantidad
 * @property {number} iva Tipo de IVA (0 | 5 | 10)
 * @property {Date} created_at Fecha de creacion de la compra
 * 
 * @typedef {Object} Venta
 * @property {number} id Identificador unico de la venta
 * @property {number} client_id Identificador del cliente
 * @property {number} user_id Identificador del usuario que vendió
 * @property {Condicion} condition Condición de cobro
 * @property {number} amount Total de pago
 * @property {string} invoice Nro. Factura autogenerado
 * @property {Date} created_at Fecha de creacion de la compra
 * 
 * @typedef {Object} VentaDetalle
 * @property {number} id Identificador unico del detalle de venta
 * @property {number} sale_id Identificador de la venta
 * @property {number} product_id Identificador del producto
 * @property {number} quantity Cantidad del producto vendido
 * @property {number} unit_price Precio unitario
 * @property {number} subtotal Subtotal de compra: precio * cantidad
 * @property {0 | 5 | 10} iva Tipo de IVA
 * @property {Date} created_at Fecha de creacion de la compra
 * 
 * @typedef {Object} CuentaPorPagar
 * @property {number} id Identificador unico de la cuenta a pagar
 * @property {number} purchase_id Identificador de la compra
 * @property {number} provider_id Identificador del proveedor
 * @property {number} amount_total Cantidad total a pagar
 * @property {number} installments Cantidad de cuotas pactadas
 * @property {TipoCuota} installment_type Frecuencia de vencimiento de las cuotas
 * @property {EstadoPago} status Estado actual de la cuenta
 * @property {Date} created_at Fecha de creacion de la cuenta
 * @property {Date?} updated_at Fecha de modificacion de la cuenta
 * 
 * @typedef {Object} CuentaPorCobrar
 * @property {number} id Identificador unico de la cuenta a cobrar
 * @property {number} sale_id Identificador de la venta
 * @property {number} client_id Identificador del cliente
 * @property {number} amount_total Cantidad total a cobrar
 * @property {number} installments Cantidad de cuotas pactadas
 * @property {TipoCuota} installment_type Frecuencia de vencimiento de las cuotas
 * @property {EstadoCobro} status Estado actual de la cuenta
 * @property {Date} created_at Fecha de creacion de la cuenta
 * @property {Date?} updated_at Fecha de modificacion de la cuenta
 * 
 * @typedef {Object} CuotaPorPagar
 * @property {number} id Identificador unico de la cuota
 * @property {number} account_payable_id Identificador de la cuenta por pagar
 * @property {number} installment_number Numero secuencial de la cuota
 * @property {number} amount Importe correspondiente a la cuota
 * @property {number} amount_paid Monto abonado a la cuota
 * @property {EstadoPago} status Estado actual de la cuota
 * @property {Date} due_date Fecha de vencimiento de la cuota
 * @property {Date} created_at Fecha de creacion de la cuota
 * @property {Date?} updated_at Fecha de modificacion de la cuota
 * 
 * @typedef {Object} CuotaPorCobrar
 * @property {number} id Identificador unico de la cuota
 * @property {number} account_receivable_id Identificador de la cuenta por cobrar
 * @property {number} installment_number Numero secuencial de la cuota
 * @property {number} amount Importe correspondiente a la cuota
 * @property {number} amount_paid Monto cobrado de la cuota
 * @property {EstadoCobro} status Estado actual de la cuota
 * @property {Date} due_date Fecha de vencimiento de la cuota
 * @property {Date} created_at Fecha de creacion de la cuota
 * @property {Date?} updated_at Fecha de modificacion de la cuota
 *
 * @typedef {Object} Pago
 * @property {number} id Identificador unico del pago
 * @property {number?} installment_payable_id Identificador de la cuota por pagar
 * @property {number?} purchase_id Identificador de la compra pagada al CONTADO
 * @property {number} amount Monto pagada
 * @property {MetodoPago} payment_method Método de pago
 * @property {string} obs Nro. Referencia / Comprobante / Observaciones del pago
 * @property {Date} created_at Fecha de creacion del pago
 * 
 * @typedef {Object} Cobro
 * @property {number} id Identificador unico del cobro
 * @property {number?} installment_receivable_id Identificador de la cuota por cobrar
 * @property {number?} sale_id Identificador de la venta cobrada al CONTADO
 * @property {number} amount Monto cobrada
 * @property {MetodoPago} payment_method Método de pago
 * @property {string} obs Nro. Factura / Comprobante del cobro
 * @property {Date} created_at Fecha de creacion del cobro
 * 
 * @typedef {Object} Sesion
 * @property {number} user_id Identificador del usuario
 * @property {Date} expire_at Fecha de expiración de la sesión
 * @property {Date} created_at Fecha de creacion de la sesión
 * 
 * @typedef {Object} Empresa
 * @property {string} legal_name Razón Social de la empresa
 * @property {string} slogan Slogan de la empresa
 * @property {string} address Dirección del local
 * @property {string} tel Teléfono del local
 * @property {string} stamping Nro. Timbrado de la compra
 * @property {string} ruc RUC de la empresa
 * @property {string} purchase_code Código de seguridad para quitar un elemento de una compra temporal
 * @property {string} sale_code Código de seguridad para quitar un elemento de una venta temporal
 * 
 * @typedef {"TRANSFERENCIA" | "TARJETA_CREDITO" | "TARJETA_DEBITO" | "EFECTIVO" | "CREDITO" | "CHEQUE"} MetodoPago
 * @typedef {"PENDIENTE" | "PARCIAL" | "PAGADA"} EstadoPago
 * @typedef {"PENDIENTE" | "PARCIAL" | "COBRADA"} EstadoCobro
 * @typedef {"CONTADO" | "CREDITO"} Condicion
 * @typedef {"SEMANAL" | "QUINCENAL" | "MENSUAL"} TipoCuota
 * @typedef {"ENTRADA" | "SALIDA"} TipoAjuste
 */

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
const KEY_CUOTASPAGAR = "cuotaspagar";
const KEY_CUOTASCOBRAR = "cuotascobrar";
const KEY_PAGOS = "pagos";
const KEY_COBROS = "cobros";
const KEY_SESION = "sesion";
const KEY_EMPRESA = "empresa";
const KEY_AJUSTESINVENTARIO = "ajustesinventario";

const REGEX_USUARIO = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ._\-]{5,20}$/;
const REGEX_CONTRASENA = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&._\-])[A-Za-z\d$@$!%*?&._\-]{8,}$/;
const REGEX_NOMBRE = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s'.,&-]{5,50}$/;
const REGEX_RUC = /^\d{5,8}[A-Z]?(-\d)?$/;
const REGEX_TELEFONO = /^09\d{8}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_DIRECCION = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s,.:°#/-]{5,50}$/;
const REGEX_CODIGO_BARRA = /^\d{8}$|^\d{12,13}$/;
const REGEX_PRECIO = /^\d+(\.\d{1,2})?$/;
const REGEX_RAZON_SOCIAL = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s'\.,&\-]{5,50}$/;
const REGEX_MARCA = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s-.]{2,50}$/;
const REGEX_CATEGORIA = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s-.]{3,}$/;
const REGEX_PRODUCTO = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s-.]{5,}$/;
const REGEX_TIMBRADO = /^\d{8}$/;
const REGEX_FACTURA = /^\d{3}-\d{3}-\d{7}$/; // Establecimiento, Punto de Expedicion, Numero Secuencial
const REGEX_TEXTO = /^[A-Z0-9ÑÁÉÍÓÚÜ\s\-\.\,\/\(\)\%\+\*\&\#\[\]]{5,50}$/;

const METODO_TRANSFERENCIA = "TRANSFERENCIA";
const METODO_TARJETA_CREDITO = "TARJETA_CREDITO";
const METODO_TARJETA_DEBITO = "TARJETA_DEBITO";
const METODO_EFECTIVO = "EFECTIVO";
const METODO_CHEQUE = "CHEQUE";
const METODOS = [METODO_TRANSFERENCIA, METODO_TARJETA_CREDITO, METODO_TARJETA_DEBITO, METODO_EFECTIVO, METODO_CHEQUE]

const CONDICION_CONTADO = "CONTADO";
const CONDICION_CREDITO = "CREDITO";
const CONDICIONES = [CONDICION_CONTADO, CONDICION_CREDITO];

const ESTADO_PENDIENTE = "PENDIENTE";
const ESTADO_PARCIAL = "PARCIAL";
const ESTADO_PAGADA = "PAGADA";
const ESTADO_PAGO = [ESTADO_PENDIENTE, ESTADO_PARCIAL, ESTADO_PAGADA];

const ESTADO_COBRADA = "COBRADA";
const ESTADO_COBRO = [ESTADO_PENDIENTE, ESTADO_PARCIAL, ESTADO_COBRADA];

const CUOTA_SEMANAL = "SEMANAL";
const CUOTA_QUINCENAL = "QUINCENAL";
const CUOTA_MENSUAL = "MENSUAL";
const COUTAS = [CUOTA_SEMANAL, CUOTA_QUINCENAL, CUOTA_MENSUAL];

const AJUSTE_ENTRADA = "ENTRADA";
const AJUSTE_SALIDA = "SALIDA";
const AJUSTE_TIPO = [AJUSTE_ENTRADA, AJUSTE_SALIDA];

const PERMISOS = {
    // MODULO USUARIOS (Bits 1-6)
    ROLES_VER: 1n << 0n,
    ROLES_CREAR: 1n << 1n,
    ROLES_EDITAR: 1n << 2n,
    USUARIOS_VER: 1n << 3n,
    USUARIOS_CREAR: 1n << 4n,
    USUARIOS_EDITAR: 1n << 5n,
    // MODULO INVENTARIO (Bits 7-18)
    CATEGORIAS_VER: 1n << 6n,
    CATEGORIAS_CREAR: 1n << 7n,
    CATEGORIAS_EDITAR: 1n << 8n,
    MARCAS_VER: 1n << 9n,
    MARCAS_CREAR: 1n << 10n,
    MARCAS_EDITAR: 1n << 11n,
    PRODUCTOS_VER: 1n << 12n,
    PRODUCTOS_CREAR: 1n << 13n,
    PRODUCTOS_EDITAR: 1n << 14n,
    INVENTARIO_VER: 15n,
    INVENTARIO_CREAR: 16n,
    INVENTARIO_EDITAR: 17n,
    // MODULO COMPRAS (Bits 19-24)
    PROVEEDORES_VER: 1n << 18n,
    PROVEEDORES_CREAR: 1n << 19n,
    PROVEEDORES_EDITAR: 1n << 20n,
    COMPRAS_VER: 1n << 21n,
    COMPRAS_CREAR: 1n << 22n,
    COMPRAS_EDITAR: 1n << 23n,
    // MODULO VENTAS (Bits 25-30)
    CLIENTES_VER: 1n << 24n,
    CLIENTES_CREAR: 1n << 25n,
    CLIENTES_EDITAR: 1n << 26n,
    VENTAS_VER: 1n << 27n,
    VENTAS_CREAR: 1n << 28n,
    VENTAS_EDITAR: 1n << 29n,
    // MODULO FINANZAS (Bits 31-42)
    CUENTAS_PAGAR_VER: 1n << 30n,
    CUENTAS_PAGAR_CREAR: 1n << 31n,
    CUENTAS_PAGAR_EDITAR: 1n << 32n,
    PAGOS_VER: 1n << 33n,
    PAGOS_CREAR: 1n << 34n,
    PAGOS_EDITAR: 1n << 35n,
    CUENTAS_COBRAR_VER: 1n << 36n,
    CUENTAS_COBRAR_CREAR: 1n << 37n,
    CUENTAS_COBRAR_EDITAR: 1n << 38n,
    COBROS_VER: 1n << 39n,
    COBROS_CREAR: 1n << 40n,
    COBROS_EDITAR: 1n << 41n
};

/**
 * Carga un elemento del Local Storage
 * @param {string} key 
 * @returns {any}
 */
function cargarBD(key) {
    return JSON.parse(localStorage.getItem(key) || "null");
}

/**
 * Guarda un objeto JS en Local Storage en JSON
 * @param {string} key 
 * @param {object} value 
 */
function guardarBD(key, value) {
    localStorage.setItem(key, JSON.stringify(value, (k, v) => typeof v === 'bigint' ? v.toString() : v));
}

/**
 * Elimina una elemento del Local Storage
 * @param {string} key 
 */
function eliminarBD(key) {
    localStorage.removeItem(key);
}

/**
 * Crea un número de flags a partir de un array de permisos
 * @param {number[]} permisos Lista de permisos Ej: [PERMISOS.USUARIOS, PERMISOS.VENTAS]
 * @returns {number}
 */
function agruparFlags(permisos) {
    return permisos.reduce((acc, current) => acc | current, 0n);
}

/**
 * Convierte un número de flags en un array de permisos legibles
 * @param {number} flags Flags del rol (ej: 68)
 * @returns {number[]} Lista de permisos individuales (ej: [4, 64])
 */
function desagruparFlags(flags) {
    return Object.values(PERMISOS).filter(permiso => (flags & permiso) !== 0n);
}

/**
 * Verifica si un rol tiene un permiso específico
 * @param {number} flags Flags del rol
 * @param {number} permiso Permiso a comprobar
 * @returns {boolean}
 */
function tienePermiso(flags, permiso) {
    return (flags & permiso) !== 0n;
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
    const roles = Array.from(cargarBD(KEY_ROLES) || []);
    roles.forEach(rol => rol.flags = BigInt(rol.flags));
    return roles;
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
    const index = roles.findIndex(rol => rol.id === id);
    if (index === -1) return;
    roles.splice(index, 1);
    guardarBD(KEY_ROLES, roles);
}

/**
 * Recupera un usuario mediante el ID
 * @param {number?} id Identificador del usuario
 * @param {string?} username Nombre de usuario a mostrar
 * @returns {Usuario?}
 */
function cargarUsuario(id = null, username = null) {
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
        ruc: usuario.ruc,
        tel: usuario.tel,
        email: usuario.email.toLowerCase(),
        address: usuario.address.toUpperCase(),
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
        legal_name: cliente.legal_name.toUpperCase(),
        ruc: cliente.ruc,
        tel: cliente.tel,
        email: cliente.email ? cliente.email.toLowerCase() : null,
        address: cliente.address.toUpperCase(),
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
        legal_name: proveedor.legal_name.toUpperCase(),
        ruc: proveedor.ruc,
        tel: proveedor.tel,
        email: proveedor.email ? proveedor.email.toLowerCase() : null,
        address: proveedor.address ? proveedor.address.toUpperCase() : null,
        city: proveedor.city ? proveedor.city.toUpperCase() : null,
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
 * Recupera un ajuste de inventario mediante el ID
 * @param {number} id Identificador del ajuste
 * @returns {AjusteInventario?}
 */
function cargarAjusteInventario(id) {
    for (const ajuste of cargarAjustesInventario()) {
        if (ajuste.id === id) return ajuste;
    }
}

/**
 * Recupera todos los ajustes de inventario
 * @returns {AjusteInventario[]}
 */
function cargarAjustesInventario() {
    return Array.from(cargarBD(KEY_AJUSTESINVENTARIO) || []);
}

/**
 * Guarda un ajuste de inventario nuevo o existente
 * @param {AjusteInventario} ajuste
 */
function guardarAjusteInventario(ajuste) {
    const ajustes = cargarAjustesInventario();
    const index = ajustes.findIndex(a => a.id === ajuste.id);
    const data = {
        id: ajuste.id,
        product_id: ajuste.product_id,
        user_id: ajuste.user_id,
        type: ajuste.type,
        quantity: ajuste.quantity,
        reason: ajuste.reason,
        previous_stock: ajuste.previous_stock,
        new_stock: ajuste.new_stock,
        created_at: ajuste.created_at
    };
    if (index === -1) {
        ajustes.push(data);
    } else {
        ajustes[index] = data;
    }
    guardarBD(KEY_AJUSTESINVENTARIO, ajustes);
}

/**
 * Elimina un ajuste de inventario mediante el ID
 * @param {number} id Identificador del ajuste
 */
function eliminarAjusteInventario(id) {
    const ajustes = cargarAjustesInventario();
    const index = ajustes.findIndex(a => a.id === id);
    if (index === -1) return;
    ajustes.splice(index, 1);
    guardarBD(KEY_AJUSTESINVENTARIO, ajustes);
}

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
        condition: compra.condition,
        amount: compra.amount,
        invoice: compra.invoice.toUpperCase(),
        stamping: compra.stamping,
        created_at: compra.created_at
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
function cargarCompraDetalles(compra_id = null) {
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
        quantity: detalle.quantity,
        unit_price: detalle.unit_price,
        subtotal: detalle.subtotal,
        iva: detalle.iva,
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
        condition: venta.condition,
        amount: venta.amount,
        invoice: venta.invoice.toUpperCase(),
        created_at: venta.created_at
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
function eliminarVenta(id) {
    const ventas = cargarVentas();
    const index = ventas.findIndex(v => v.id === id);
    if (index === -1) return;
    ventas.splice(index, 1);
    guardarBD(KEY_VENTAS, ventas);
}

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
function cargarVentaDetalles(venta_id = null) {
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
        quantity: detalle.quantity,
        unit_price: detalle.unit_price,
        subtotal: detalle.subtotal,
        iva: detalle.iva,
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
 * Recupera una cuenta a pagar mediante el ID
 * @param {number} id Identificador de la cuenta
 * @param {number} compra_id Identificador de la compra
 * @returns {CuentaPorPagar?}
 */
function cargarCuentaPorPagar(id = null, compra_id = null) {
    if (!id && !compra_id) return null;
    for (const cuenta of cargarCuentasPorPagar()) {
        if (id && cuenta.id === id) return cuenta;
        else if (compra_id && cuenta.purchase_id === compra_id) return cuenta;
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
        installments: cuenta.installments,
        installment_type: cuenta.installment_type,
        status: cuenta.status,
        created_at: cuenta.created_at,
        updated_at: cuenta.updated_at || null
    };
    if (index === -1)
        cuentas.push(data);
    else
        cuentas[index] = data;
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
 * Calcula el monto pagado y restante
 * @param {number} id Id Cuenta por pagar
 */
function calcularCuentaPorPagar(id) {
    const pagos = cargarCuotasPorPagar(id).flatMap(c => cargarPagos(c.id));
    const amount_paid = pagos.reduce((sum, p) => sum + p.amount, 0);
    const amount_due = (cargarCuentaPorPagar(id)?.amount_total ?? 0) - amount_paid;
    return { amount_paid, amount_due };
}

/**
 * Repara estados inconsistentes en cuotas y cuentas por pagar.
 * Corrige saldos fantasma de 1 Gs. causados por errores de redondeo anteriores.
 * También sincroniza el estado (PENDIENTE / PARCIAL / PAGADA) de cada cuenta.
 */
function repararCuentasPorPagar() {
    const cuentas = cargarCuentasPorPagar();
    for (const cuenta of cuentas) {
        const cuotas = cargarCuotasPorPagar(cuenta.id);
        let cuentaModificada = false;

        // 1. Reparar cuotas con saldo residual de <= 1 Gs. (bug de redondeo antiguo)
        for (const cuota of cuotas) {
            if (cuota.status === ESTADO_PAGADA) continue;
            const saldoCuota = Math.round(cuota.amount - (cuota.amount_paid || 0));
            if (saldoCuota <= 1 && saldoCuota >= 0 && (cuota.amount_paid || 0) > 0) {
                // Absorber el residuo y marcar como pagada
                cuota.amount_paid = cuota.amount;
                cuota.status = ESTADO_PAGADA;
                cuota.updated_at = new Date();
                guardarCuotaPorPagar(cuota);
                cuentaModificada = true;
            }
        }

        // 2. Recalcular el estado de la cuenta según el estado real de sus cuotas
        const cuotasActualizadas = cargarCuotasPorPagar(cuenta.id);
        const todasPagadas  = cuotasActualizadas.every(c => c.status === ESTADO_PAGADA);
        const algunaPagada  = cuotasActualizadas.some(c => c.status === ESTADO_PAGADA || c.status === ESTADO_PARCIAL);
        const nuevoEstado   = todasPagadas ? ESTADO_PAGADA : (algunaPagada ? ESTADO_PARCIAL : ESTADO_PENDIENTE);

        if (cuenta.status !== nuevoEstado || cuentaModificada) {
            cuenta.status     = nuevoEstado;
            cuenta.updated_at = new Date();
            guardarCuentaPorPagar(cuenta);
        }
    }
}

/**
 * Recupera una cuenta a cobrar mediante el ID
 * @param {number} id Identificador de la cuenta
 * @param {number} venta_id Identificador de la venta
 * @returns {CuentaPorCobrar?}
 */
function cargarCuentaPorCobrar(id = null, venta_id = null) {
    if (!id && !venta_id) return null;
    for (const cuenta of cargarCuentasPorCobrar()) {
        if (id && cuenta.id === id) return cuenta;
        if (venta_id && cuenta.sale_id === venta_id) return cuenta;
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
        installments: cuenta.installments,
        installment_type: cuenta.installment_type,
        status: cuenta.status,
        created_at: cuenta.created_at,
        updated_at: cuenta.updated_at || null
    };
    if (index === -1)
        cuentas.push(data);
    else
        cuentas[index] = data;
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
 * Calcula el monto cobrado y pendiente
 * @param {number} id Id Cuenta por cobrar
 */
function calcularCuentaPorCobrar(id) {
    const cobros = cargarCuotasPorCobrar(id).flatMap(c => cargarCobros(c.id));
    const amount_paid = cobros.reduce((sum, c) => sum + c.amount, 0);
    const amount_due = cargarCuentaPorCobrar(id).amount_total - amount_paid;
    return { amount_paid, amount_due };
}

/**
 * Cargar una cuota por pagar mediante el Id
 * @param {number} id 
 * @returns {CuotaPorPagar?}
 */
function cargarCuotaPorPagar(id) {
    return cargarCuotasPorPagar().find(c => c.id === id) || null;
}

/**
 * Cargar cuotas por pagar
 * @param {number} account_payable_id Filtrar por Id Cuenta por pagar
 * @returns {CuotaPorPagar[]}
 */
function cargarCuotasPorPagar(account_payable_id = null) {
    return Array.from(cargarBD(KEY_CUOTASPAGAR) || []).filter(c => {
        if (account_payable_id && c.account_payable_id !== account_payable_id) return false;
        return true;
    });
}

/**
 * Guardar una cuota por pagar nueva o existente
 * @param {CuotaPorPagar} cuota 
 */
function guardarCuotaPorPagar(cuota) {
    const cuotas = cargarCuotasPorPagar();
    const index = cuotas.findIndex(c => c.id === cuota.id);
    const data = {
        id: cuota.id,
        account_payable_id: cuota.account_payable_id,
        installment_number: cuota.installment_number,
        amount: cuota.amount,
        amount_paid: cuota.amount_paid || 0,
        status: cuota.status,
        due_date: cuota.due_date,
        created_at: cuota.created_at,
        updated_at: cuota.updated_at || null
    };
    if (index === -1)
        cuotas.push(data);
    else
        cuotas[index] = data;
    guardarBD(KEY_CUOTASPAGAR, cuotas);
}

/**
 * Eliminar una cuota por pagar mediante el Identificador
 * @param {*} id 
 */
function eliminarCuotaPorPagar(id) {
    const cuotas = cargarCuotasPorPagar();
    const index = cuotas.findIndex(c => c.id === id);
    if (index === -1) return;
    cuotas.splice(index, 1);
    guardarBD(KEY_CUOTASPAGAR, cuotas);
}

/**
 * Cargar una cuota por cobrar
 * @param {number} id 
 * @returns {CuotaPorCobrar?}
 */
function cargarCuotaPorCobrar(id) {
    return cargarCuotasPorCobrar().find(c => c.id === id) || null;
}

/**
 * Cargar todas las cuotas por cobrar
 * @param {number} account_receivable_id Identificador de la cuenta por cobrar
 * @returns {CuotaPorCobrar[]}
 */
function cargarCuotasPorCobrar(account_receivable_id = null) {
    return Array.from(cargarBD(KEY_CUOTASCOBRAR) || []).filter(ca => {
        if (account_receivable_id && c.account_receivable_id !== account_receivable_id) return false;
        return true;
    });
}

/**
 * Guarda una cuota por cobrar nueva o existente
 * @param {CuotaPorCobrar} cuota 
 */
function guardarCuotaPorCobrar(cuota) {
    const cuotas = cargarCuotasPorCobrar();
    const index = cuotas.findIndex(c => c.id === cuota.id);
    const data = {
        id: cuota.id,
        account_receivable_id: cuota.account_receivable_id,
        installment_number: cuota.installment_number,
        amount: cuota.amount,
        amount_paid: cuota.amount_paid || 0,
        status: cuota.status,
        due_date: cuota.due_date,
        created_at: cuota.created_at,
        updated_at: cuota.updated_at || null
    };
    if (index === -1)
        cuotas.push(data);
    else
        cuotas[index] = data;
    guardarBD(KEY_CUOTASCOBRAR, cuotas);
}

/**
 * Elimina una cuota por cobrar
 * @param {number} id 
 */
function eliminarCuotaPorCobrar(id) {
    const cuotas = cargarCuotasPorCobrar();
    const index = cuotas.findIndex(c => c.id === id);
    if (index === -1) return;
    cuotas.splice(index, 1);
    guardarBD(KEY_CUOTASCOBRAR, cuotas);
}

/**
 * Genera un listado de cuotas distribuyendo el residuo en la última cuota.
 * Usa división entera para evitar saldos fantasma de 1 Gs. al pagar.
 * @param {number} total Monto total de pago/cobro (entero, en guaraníes)
 * @param {number} cantidad Cantidad de cuotas a crear
 * @returns {{ installment_number: number, amount: number }[]}
 */
function generarCuotas(total, cantidad) {
    const totalEntero = Math.round(total);
    const valorBase = Math.floor(totalEntero / cantidad);
    const residuo = totalEntero - (valorBase * cantidad);
    const cuotas = [];
    for (let i = 1; i <= cantidad; i++) {
        // El residuo se suma a la última cuota para que la suma total sea exacta
        const amount = (i === cantidad) ? valorBase + residuo : valorBase;
        cuotas.push({
            installment_number: i,
            amount
        });
    }
    return cuotas;
}

/**
 * @param {string | number | Date} inicio Fecha de inicio
 * @param {number} periodos Cantidad de periodos para el vencimiento
 * @param {TipoCuota} tipo Tipo de cuota
 * @returns {Date}
 */
function calcularVencimiento(inicio, periodos, tipo) {
    const fecha = new Date(inicio);
    switch (tipo) {
        case CUOTA_SEMANAL:
            fecha.setDate(fecha.getDate() + (periodos * 7));
            break;
        case CUOTA_QUINCENAL:
            fecha.setDate(fecha.getDate() + (periodos * 15));
            break;
        case CUOTA_MENSUAL:
            fecha.setMonth(fecha.getMonth() + periodos);
            break;
    }
    return fecha;
}

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
 * @param {number} installment_id Filtrar por Id Cuota por pagar
 * @returns {Pago[]}
 */
function cargarPagos(installment_id = null) {
    return Array.from(cargarBD(KEY_PAGOS) || []).filter(p => {
        if (installment_id && (!p.installment_payable_id || p.installment_payable_id !== installment_id)) return false;
        return true;
    });
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
        installment_payable_id: pago.installment_payable_id ?? null,
        purchase_id: pago.purchase_id ?? null,
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
 * @param {number} installment_id Filtrar por Id Cuota por cobrar
 * @returns {Cobro[]}
 */
function cargarCobros(installment_id = null) {
    return Array.from(cargarBD(KEY_COBROS) || []).filter(c => {
        if (installment_id && (!c.installment_receivable_id || c.installment_receivable_id !== installment_id)) return false;
        return true;
    });;
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
        installment_receivable_id: cobro.installment_receivable_id ?? null,
        sale_id: cobro.sale_id ?? null,
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
    if (!tienePermisoSesion(PERMISOS.GESTIONAR_COBROS)) {
        mensajeError("El usuario no tiene permisos para gestionar cobros");
        return;
    }
    const cobros = cargarCobros();
    const index = cobros.findIndex(c => c.id === id);
    if (index === -1) return;
    cobros.splice(index, 1);
    guardarBD(KEY_COBROS, cobros);
}

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
    localStorage.removeItem(KEY_SESION);
}

/**
 * Comprobar si el usuario actual tiene un permiso (flags)
 * @param {number} permiso 
 * @returns {boolean}
 */
function tienePermisoSesion(permiso) {
    const sesion = cargarSesion();
    if (!sesion) return false;
    const usuario = cargarUsuario(sesion.user_id);
    if (!usuario) return false;
    const rol = cargarRol(usuario.rol_id);
    if (!rol) return false;
    return tienePermiso(rol.flags, permiso);
}

/**
 * Recuperar datos de la empresa
 * @returns {Empresa?} Sesion actual 
 */
function cargarEmpresa() {
    return cargarBD(KEY_EMPRESA);
}

/**
 * Guarda datos de la empresa
 * @param {Empresa} empresa
 */
function guardarEmpresa(empresa) {
    const data = {
        legal_name: empresa.legal_name,
        slogan: empresa.slogan,
        address: empresa.address,
        tel: empresa.tel,
        stamping: empresa.stamping,
        ruc: empresa.ruc 
    }
    guardarBD(KEY_EMPRESA, data);
}

/**
 * Elimina los datos de la empresa actual
 */
function eliminarEmpresa() {
    localStorage.removeItem(KEY_EMPRESA);
}

function initDB() {
    for (const key of [KEY_ROLES, KEY_USUARIOS, KEY_CLIENTES, KEY_PROVEEDORES, KEY_CATEGORIAS,
            KEY_MARCAS, KEY_PRODUCTOS, KEY_COMPRAS, KEY_COMPRADETALLES, KEY_VENTAS,
            KEY_VENTADETALLES, KEY_CUENTASPORPAGAR, KEY_CUENTASPORCOBRAR, KEY_PAGOS, KEY_COBROS]) {
        guardarBD(key, []);
    }
    eliminarSesion();
    eliminarEmpresa();
    guardarRol({
        id: 1,
        name: "ADMIN",
        description: "Administrador con acceso total",
        flags: agruparFlags(Object.values(PERMISOS)),
        created_at: new Date(),
        updated_at: null
    });
    guardarUsuario({
        id: 1,
        username: "admin",
        // hash para "admin@123" 
        password_hash: "7676aaafb027c825bd9abab78b234070e702752f625b752e55e55b48e607e358", 
        name: "Administrador",
        ruc: "0000000",
        tel: "0971234567",
        email: "admin@vanguardia.com",
        address: "AVDA. ESPAÑA 1420, ASUNCIÓN",
        rol_id: 1,
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
    guardarEmpresa({
        address: "Previstero Juan Carlos García / Madrinas de Guerra - Bo. Villa Armando - Concepción",
        legal_name: "Vanguardia",
        ruc: "87654321-1",
        slogan: "Comercialización de Productos Informáticos y Tecnológicos",
        stamping: "12345678",
        tel: "0985495253",
        purchase_code: "12345678",
        sale_code: "12345678"
    });
}

function cargarDatosPrueba() {
    // 1. Roles
    guardarRol({ id: 2, name: "CAJERO", description: "Ventas y cobros", flags: agruparFlags([PERMISOS.VENTAS_VER, PERMISOS.VENTAS_CREAR, PERMISOS.COBROS_VER, PERMISOS.COBROS_CREAR]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 3, name: "VENDEDOR", description: "Solo ventas", flags: agruparFlags([PERMISOS.VENTAS_VER, PERMISOS.VENTAS_CREAR]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 4, name: "ENCARGADO COMPRAS", description: "Compras y proveedores", flags: agruparFlags([PERMISOS.COMPRAS_VER, PERMISOS.COMPRAS_CREAR, PERMISOS.COMPRAS_EDITAR, PERMISOS.PROVEEDORES_VER, PERMISOS.PROVEEDORES_CREAR, PERMISOS.PROVEEDORES_EDITAR]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 5, name: "GERENTE", description: "Reportes y visualización", flags: agruparFlags([PERMISOS.VENTAS_VER, PERMISOS.PRODUCTOS_VER, PERMISOS.COMPRAS_VER, PERMISOS.COBROS_VER, PERMISOS.PAGOS_VER, PERMISOS.CLIENTES_VER, PERMISOS.PROVEEDORES_VER]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 6, name: "REPOSITOR", description: "Stock de productos", flags: agruparFlags([PERMISOS.PRODUCTOS_VER, PERMISOS.PRODUCTOS_CREAR, PERMISOS.PRODUCTOS_EDITAR, PERMISOS.CATEGORIAS_VER, PERMISOS.MARCAS_VER]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 7, name: "CONTADOR", description: "Finanzas completas", flags: agruparFlags([PERMISOS.PAGOS_VER, PERMISOS.PAGOS_CREAR, PERMISOS.PAGOS_EDITAR, PERMISOS.COBROS_VER, PERMISOS.COBROS_CREAR, PERMISOS.COBROS_EDITAR, PERMISOS.CUENTAS_PAGAR_VER, PERMISOS.CUENTAS_PAGAR_CREAR, PERMISOS.CUENTAS_PAGAR_EDITAR, PERMISOS.CUENTAS_COBRAR_VER, PERMISOS.CUENTAS_COBRAR_CREAR, PERMISOS.CUENTAS_COBRAR_EDITAR]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 8, name: "SUPERVISOR", description: "Supervisor de ventas", flags: agruparFlags([PERMISOS.VENTAS_VER, PERMISOS.VENTAS_CREAR, PERMISOS.VENTAS_EDITAR, PERMISOS.CLIENTES_VER, PERMISOS.CLIENTES_CREAR, PERMISOS.CLIENTES_EDITAR]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 9, name: "ATENCION CLIENTE", description: "Gestion de clientes", flags: agruparFlags([PERMISOS.CLIENTES_VER, PERMISOS.CLIENTES_CREAR, PERMISOS.CLIENTES_EDITAR]), created_at: new Date(), updated_at: null });
    guardarRol({ id: 10, name: "AUDITOR", description: "Auditoria general", flags: agruparFlags([PERMISOS.PRODUCTOS_VER, PERMISOS.VENTAS_VER, PERMISOS.COMPRAS_VER, PERMISOS.CUENTAS_PAGAR_VER, PERMISOS.CUENTAS_COBRAR_VER, PERMISOS.PAGOS_VER, PERMISOS.COBROS_VER, PERMISOS.USUARIOS_VER, PERMISOS.ROLES_VER]), created_at: new Date(), updated_at: null });

    // 2. Usuarios (contraseña: {nombre}@123)
    guardarUsuario({ id: 2, username: "cajero", password_hash: "b83e76bcbbde2bda5e2d3781c8b4ae3d9765e3353495f101450898fc038b1a9c", name: "LUCAS MEDINA", ruc: "3444111", tel: "0971456456", email: "cajero@vanguardia.com", address: "AVDA. MARISCAL LÓPEZ 456, ASUNCIÓN", rol_id: 2, active: true, created_at: new Date(), updated_at: null });
    guardarUsuario({ id: 3, username: "vendedor", password_hash: "ac2ffb535559135abd405a030d939a7e19b76caabc3c9ea2446e94c81798d6fd", name: "SOFIA RECALDE", ruc: "5666222", tel: "0961789789", email: "ventas@vanguardia.com", address: "CALLE PALMA 789, ASUNCIÓN", rol_id: 3, active: true, created_at: new Date(), updated_at: null });
    guardarUsuario({ id: 4, username: "compras", password_hash: "8c361ffeb68201251eb110f2516b4ab99f1060e5d71533b0d89b488879f89278", name: "MARCOS VERA", ruc: "2333444", tel: "0991112233", email: "compras@vanguardia.com", address: "AVDA. AVIADORES DEL CHACO 1230, ASUNCIÓN", rol_id: 4, active: true, created_at: new Date(), updated_at: null });
    guardarUsuario({ id: 5, username: "gerencia", password_hash: "c04f81358bb5b8b0197e4171e7d376e4ae93da7c5552c8fcedb6fe48dc0569a7", name: "DIANA GOMEZ", ruc: "1222333", tel: "0985556677", email: "gerencia@vanguardia.com", address: "AVDA. SANTA TERESA 2450, ASUNCIÓN", rol_id: 5, active: true, created_at: new Date(), updated_at: null });
    guardarUsuario({ id: 6, username: "deposito", password_hash: "67ee7622ca365040fcf51d7e66060831cd19264d1d416374c2a43ca606e13c9d", name: "CARLOS RUIZ", ruc: "6777888", tel: "0972889900", email: "deposito@vanguardia.com", address: "RUTA TRANSCHACO KM 12, MARIANO ROQUE ALONSO", rol_id: 6, active: true, created_at: new Date(), updated_at: null });
    guardarUsuario({ id: 7, username: "contador", password_hash: "678937af7c10fc15f32109935e0fb55686aa864baa8d97af287011827b019079", name: "ANA SILVA", ruc: "4888999", tel: "0962334455", email: "conta@vanguardia.com", address: "AVDA. CARLOS ANTONIO LÓPEZ 612, ASUNCIÓN", rol_id: 7, active: true, created_at: new Date(), updated_at: null });
    guardarUsuario({ id: 8, username: "supervisor", password_hash: "36918746c2ccb348d9650cc99bf3101f4a56412aa8bcf59cf55aa2a72", name: "SUPERVISOR", ruc: "9999999", tel: "0950111222", email: "super@vanguardia.com", address: "AVDA. EUSEBIO AYALA 3340, ASUNCIÓN", rol_id: 8, active: true, created_at: new Date(), updated_at: null });

    // 3. Clientes
    guardarCliente({ id: 1, legal_name: "JUAN CARLOS LOPEZ", ruc: "1234567", tel: "0985111222", email: "juancarloslopez@gmail.com", address: "AV. BRASIL 123", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 2, legal_name: "MARIA ELENA GOMEZ", ruc: "2345678", tel: "0971333444", email: "mariaelenagomez@gmail.com", address: "CALLE SAN PEDRO 45", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 3, legal_name: "PEDRO ANTONIO MARTINEZ", ruc: "3456789", tel: "0961555666", email: "pedroantoniomartinez@gmail.com", address: "BARRIO SAN JORGE SN", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 4, legal_name: "ANA BEATRIZ BENITEZ", ruc: "4567890", tel: "0981777888", email: "anabeatrizbenitez@gmail.com", address: "AV. MCAL. LOPEZ 800", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 5, legal_name: "CARLOS DANIEL GIMENEZ", ruc: "5678901", tel: "0991999000", email: "carlosdanielgimenez@gmail.com", address: "CALLE INDEPENDENCIA 320", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 6, legal_name: "ROSA MERCEDES PAREDES", ruc: "6789012", tel: "0982121313", email: "rosamercedesparedes@gmail.com", address: "BO. REPUBLICANO MZ 5 CS 2", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 7, legal_name: "LUIS FERNANDO ROJAS", ruc: "7890123", tel: "0972414515", email: "luisfernandorojas@gmail.com", address: "AV. EUSEBIO AYALA 1100", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 8, legal_name: "PATRICIA NOEMI ACOSTA", ruc: "8901234", tel: "0962616717", email: "patricianoemiacosta@gmail.com", address: "CALLE PIRIBEBUY 21O", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 9, legal_name: "MIGUEL ANGEL SANCHEZ", ruc: "9012345", tel: "0992818919", email: "miguelangelsanchez@gmail.com", address: "AV. FERNANDO DE LA MORA 560", active: true, created_at: new Date(), updated_at: null });
    guardarCliente({ id: 10, legal_name: "LAURA VIRGINIA ESQUIVEL", ruc: "1357924", tel: "0983020121", email: "lauravirginiaesquivel@gmail.com", address: "CALLE CERRO CORA 78", active: true, created_at: new Date(), updated_at: null });

    // 4. Categorias
    guardarCategoria({ id: 1, name: "SMARTPHONES", description: "Teléfonos inteligentes", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 2, name: "LAPTOPS", description: "Computadoras portátiles", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 3, name: "TELEVISORES", description: "Smart TVs y pantallas", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 4, name: "AUDIO", description: "Auriculares y parlantes", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 5, name: "ACCESORIOS", description: "Cargadores, cables, fundas", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 6, name: "CONSOLAS", description: "Videojuegos y consolas", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 7, name: "SMARTWATCHES", description: "Relojes inteligentes", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 8, name: "TABLETS", description: "Tabletas y iPads", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 9, name: "COMPONENTES PC", description: "Placas, procesadores, RAM", created_at: new Date(), updated_at: null });
    guardarCategoria({ id: 10, name: "PERIFERICOS", description: "Mouses, teclados, monitores", created_at: new Date(), updated_at: null });

    // 5. Marcas
    guardarMarca({ id: 1, name: "APPLE", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 2, name: "SAMSUNG", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 3, name: "SONY", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 4, name: "LG", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 5, name: "HP", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 6, name: "DELL", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 7, name: "LENOVO", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 8, name: "ASUS", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 9, name: "NINTENDO", created_at: new Date(), updated_at: null });
    guardarMarca({ id: 10, name: "MICROSOFT", created_at: new Date(), updated_at: null });

    // 6. Proveedores
    guardarProveedor({ id: 1, legal_name: "DISTRIBUIDORA APPLE PY", ruc: "80001111-1", tel: "021444555", email: "ventas@apple.com.py", address: "AV. MCAL. LOPEZ 1234", city: "ASUNCION", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 2, legal_name: "SAMSUNG PARAGUAY SA", ruc: "80002222-2", tel: "021555666", email: "ventas@samsung.com.py", address: "AV. REPUBLICA 567", city: "FERNANDO DE LA MORA", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 3, legal_name: "SONY ENTERTAINMENT PY", ruc: "80003333-3", tel: "021666777", email: "pedidos@sony.com.py", address: "CALLE PALMA 890", city: "ASUNCION", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 4, legal_name: "LG ELECTRONICS PY", ruc: "80004444-4", tel: "021777888", email: "contacto@lg.com.py", address: "AV. SAN BLAS 321", city: "CIUDAD DEL ESTE", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 5, legal_name: "HP INC PARAGUAY", ruc: "80005555-5", tel: "021888999", email: "ventas@hp.com.py", address: "RUTA 2 KM 12", city: "SAN LORENZO", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 6, legal_name: "DELL TECHNOLOGIES PY", ruc: "80006666-6", tel: "021999000", email: "ventas@dell.com.py", address: "AV. MARISCAL ESTIGARRIBIA 456", city: "LUQUE", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 7, legal_name: "LENOVO GROUP LATAM", ruc: "80007777-7", tel: "021111222", email: "info@lenovo.com.py", address: "CALLE CABALLERO 789", city: "VILLA ELISA", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 8, legal_name: "ASUS TECH PARAGUAY", ruc: "80008888-8", tel: "021222333", email: "pedidos@asus.com.py", address: "AV. EUSEBIO AYALA 1100", city: "ASUNCION", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 9, legal_name: "NINTENDO LATAM", ruc: "80009999-9", tel: "021333444", email: "ventas@nintendo.com", address: "AV. ADRIAN JARA 654", city: "CIUDAD DEL ESTE", active: true, created_at: new Date(), updated_at: null });
    guardarProveedor({ id: 10, legal_name: "MICROSOFT CORPORATION PY", ruc: "80000000-0", tel: "021444111", email: "ventas@microsoft.com.py", address: "AV. ESPANA 1420", city: "ASUNCION", active: true, created_at: new Date(), updated_at: null });

    // 7. Productos
    guardarProducto({ id: 1, code: "78400111", name: "IPHONE 15 PRO MAX", description: "SMARTPHONE APPLE 256GB", purchase_price: 8000000, selling_price: 10000000, stock: 15, min_stock: 5, category_id: 1, brand_id: 1, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 2, code: "78400222", name: "GALAXY S24 ULTRA", description: "SMARTPHONE SAMSUNG 512GB", purchase_price: 7500000, selling_price: 9500000, stock: 20, min_stock: 5, category_id: 1, brand_id: 2, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 3, code: "78400333", name: "PLAYSTATION 5", description: "CONSOLA SONY PS5 1TB", purchase_price: 3500000, selling_price: 4500000, stock: 30, min_stock: 10, category_id: 6, brand_id: 3, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 4, code: "78400444", name: "SMART TV OLED 65", description: "TV LG OLED 4K 65 PULGADAS", purchase_price: 6000000, selling_price: 8000000, stock: 10, min_stock: 3, category_id: 3, brand_id: 4, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 5, code: "78400555", name: "LAPTOP ENVY 15", description: "NOTEBOOK HP 16GB RAM 512GB SSD", purchase_price: 5000000, selling_price: 6500000, stock: 12, min_stock: 4, category_id: 2, brand_id: 5, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 6, code: "78400666", name: "XPS 13", description: "NOTEBOOK DELL I7 16GB RAM", purchase_price: 7000000, selling_price: 9000000, stock: 8, min_stock: 2, category_id: 2, brand_id: 6, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 7, code: "78400777", name: "THINKPAD X1 CARBON", description: "NOTEBOOK LENOVO I7 32GB RAM", purchase_price: 8500000, selling_price: 10500000, stock: 5, min_stock: 2, category_id: 2, brand_id: 7, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 8, code: "78400888", name: "ROG STRIX G15", description: "NOTEBOOK GAMER ASUS RTX 4060", purchase_price: 9000000, selling_price: 11500000, stock: 6, min_stock: 2, category_id: 2, brand_id: 8, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 9, code: "78400999", name: "NINTENDO SWITCH OLED", description: "CONSOLA NINTENDO 64GB", purchase_price: 2000000, selling_price: 2800000, stock: 25, min_stock: 8, category_id: 6, brand_id: 9, iva: 10, active: true, created_at: new Date(), updated_at: null });
    guardarProducto({ id: 10, code: "78401000", name: "XBOX SERIES X", description: "CONSOLA MICROSOFT 1TB", purchase_price: 3500000, selling_price: 4500000, stock: 18, min_stock: 5, category_id: 6, brand_id: 10, iva: 10, active: true, created_at: new Date(), updated_at: null });

    // 8. Compras
    guardarCompra({ id: 1, provider_id: 1, user_id: 4, condition: CONDICION_CONTADO, amount: 120000000, invoice: "001-001-0000001", stamping: "12345678", created_at: new Date(Date.now() - 86400000 * 5) });
    guardarCompra({ id: 2, provider_id: 3, user_id: 4, condition: CONDICION_CREDITO, amount: 65000000, invoice: "001-001-0000002", stamping: "16782345", created_at: new Date(Date.now() - 86400000 * 4) });
    guardarCompra({ id: 3, provider_id: 5, user_id: 4, condition: CONDICION_CONTADO, amount: 85000000, invoice: "001-001-0000003", stamping: "15403921", created_at: new Date(Date.now() - 86400000 * 3) });
    guardarCompra({ id: 4, provider_id: 8, user_id: 4, condition: CONDICION_CREDITO, amount: 54000000, invoice: "001-001-0000004", stamping: "11223344", created_at: new Date(Date.now() - 86400000 * 2) });
    guardarCompra({ id: 5, provider_id: 9, user_id: 4, condition: CONDICION_CONTADO, amount: 20000000, invoice: "001-001-0000005", stamping: "14920511", created_at: new Date(Date.now() - 86400000 * 1) });
    guardarCompra({ id: 6, provider_id: 2, user_id: 4, condition: CONDICION_CREDITO, amount: 150000000, invoice: "001-001-0000006", stamping: "13049582", created_at: new Date() });
    guardarCompra({ id: 7, provider_id: 10, user_id: 4, condition: CONDICION_CONTADO, amount: 35000000, invoice: "001-001-0000007", stamping: "18504193", created_at: new Date() });
    guardarCompra({ id: 8, provider_id: 7, user_id: 4, condition: CONDICION_CREDITO, amount: 42500000, invoice: "001-001-0000008", stamping: "17492043", created_at: new Date() });
    guardarCompra({ id: 9, provider_id: 6, user_id: 4, condition: CONDICION_CONTADO, amount: 14000000, invoice: "001-001-0000009", stamping: "19203847", created_at: new Date() });
    guardarCompra({ id: 10, provider_id: 4, user_id: 4, condition: CONDICION_CREDITO, amount: 12000000, invoice: "001-001-0000010", stamping: "15382910", created_at: new Date() });

    // 9. CompraDetalles
    guardarCompraDetalle({ id: 1, purchase_id: 1, product_id: 1, quantity: 15, unit_price: 8000000, subtotal: 120000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 5) });
    guardarCompraDetalle({ id: 2, purchase_id: 2, product_id: 3, quantity: 10, unit_price: 3500000, subtotal: 35000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 4) });
    guardarCompraDetalle({ id: 3, purchase_id: 2, product_id: 4, quantity: 5, unit_price: 6000000, subtotal: 30000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 4) });
    guardarCompraDetalle({ id: 4, purchase_id: 3, product_id: 5, quantity: 10, unit_price: 5000000, subtotal: 50000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 3) });
    guardarCompraDetalle({ id: 5, purchase_id: 3, product_id: 6, quantity: 5, unit_price: 7000000, subtotal: 35000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 3) });
    guardarCompraDetalle({ id: 6, purchase_id: 4, product_id: 8, quantity: 6, unit_price: 9000000, subtotal: 54000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 2) });
    guardarCompraDetalle({ id: 7, purchase_id: 5, product_id: 9, quantity: 10, unit_price: 2000000, subtotal: 20000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 1) });
    guardarCompraDetalle({ id: 8, purchase_id: 6, product_id: 2, quantity: 20, unit_price: 7500000, subtotal: 150000000, iva: 10, created_at: new Date() });
    guardarCompraDetalle({ id: 9, purchase_id: 7, product_id: 10, quantity: 10, unit_price: 3500000, subtotal: 35000000, iva: 10, created_at: new Date() });
    guardarCompraDetalle({ id: 10, purchase_id: 8, product_id: 7, quantity: 5, unit_price: 8500000, subtotal: 42500000, iva: 10, created_at: new Date() });
    guardarCompraDetalle({ id: 11, purchase_id: 9, product_id: 6, quantity: 2, unit_price: 7000000, subtotal: 14000000, iva: 10, created_at: new Date() });
    guardarCompraDetalle({ id: 12, purchase_id: 10, product_id: 4, quantity: 2, unit_price: 6000000, subtotal: 12000000, iva: 10, created_at: new Date() });

    // 10. Ventas
    guardarVenta({ id: 1, client_id: 2, user_id: 2, condition: CONDICION_CONTADO, amount: 20000000, invoice: "001-001-000001", created_at: new Date(Date.now() - 86400000 * 3), updated_at: null });
    guardarVenta({ id: 2, client_id: 3, user_id: 3, condition: CONDICION_CREDITO, amount: 6500000, invoice: "001-001-000002", created_at: new Date(Date.now() - 86400000 * 2), updated_at: null });
    guardarVenta({ id: 3, client_id: 5, user_id: 2, condition: CONDICION_CONTADO, amount: 10500000, invoice: "001-001-000003", created_at: new Date(Date.now() - 86400000 * 1), updated_at: null });
    guardarVenta({ id: 4, client_id: 7, user_id: 3, condition: CONDICION_CREDITO, amount: 16100000, invoice: "001-001-000004", created_at: new Date(), updated_at: null });
    guardarVenta({ id: 5, client_id: 9, user_id: 2, condition: CONDICION_CONTADO, amount: 4500000, invoice: "001-001-000005", created_at: new Date(), updated_at: null });
    guardarVenta({ id: 6, client_id: 1, user_id: 3, condition: CONDICION_CONTADO, amount: 9500000, invoice: "001-001-000006", created_at: new Date(), updated_at: null });
    guardarVenta({ id: 7, client_id: 4, user_id: 2, condition: CONDICION_CREDITO, amount: 14500000, invoice: "001-001-000007", created_at: new Date(), updated_at: null });
    guardarVenta({ id: 8, client_id: 6, user_id: 3, condition: CONDICION_CONTADO, amount: 10000000, invoice: "001-001-000008", created_at: new Date(), updated_at: null });
    guardarVenta({ id: 9, client_id: 8, user_id: 2, condition: CONDICION_CREDITO, amount: 8000000, invoice: "001-001-000009", created_at: new Date(), updated_at: null });
    guardarVenta({ id: 10, client_id: 10, user_id: 3, condition: CONDICION_CONTADO, amount: 4500000, invoice: "001-001-000010", created_at: new Date(), updated_at: null });

    // 11. VentaDetalles
    guardarVentaDetalle({ id: 1, sale_id: 1, product_id: 1, quantity: 2, unit_price: 10000000, subtotal: 20000000, iva: 10, created_at: new Date(Date.now() - 86400000 * 3) });
    guardarVentaDetalle({ id: 2, sale_id: 2, product_id: 5, quantity: 1, unit_price: 6500000, subtotal: 6500000, iva: 10, created_at: new Date(Date.now() - 86400000 * 2) });
    guardarVentaDetalle({ id: 3, sale_id: 3, product_id: 7, quantity: 1, unit_price: 10500000, subtotal: 10500000, iva: 10, created_at: new Date(Date.now() - 86400000 * 1) });
    guardarVentaDetalle({ id: 4, sale_id: 4, product_id: 9, quantity: 2, unit_price: 2800000, subtotal: 5600000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 5, sale_id: 4, product_id: 7, quantity: 1, unit_price: 10500000, subtotal: 10500000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 6, sale_id: 5, product_id: 3, quantity: 1, unit_price: 4500000, subtotal: 4500000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 7, sale_id: 6, product_id: 2, quantity: 1, unit_price: 9500000, subtotal: 9500000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 8, sale_id: 7, product_id: 5, quantity: 1, unit_price: 6500000, subtotal: 6500000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 9, sale_id: 7, product_id: 4, quantity: 1, unit_price: 8000000, subtotal: 8000000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 10, sale_id: 8, product_id: 1, quantity: 1, unit_price: 10000000, subtotal: 10000000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 11, sale_id: 9, product_id: 4, quantity: 1, unit_price: 8000000, subtotal: 8000000, iva: 10, created_at: new Date() });
    guardarVentaDetalle({ id: 12, sale_id: 10, product_id: 10, quantity: 1, unit_price: 4500000, subtotal: 4500000, iva: 10, created_at: new Date() });

    // 12. CuentasPorPagar
    guardarCuentaPorPagar({ id: 1, purchase_id: 2, provider_id: 3, amount_total: 65000000, installments: 3, installment_type: CUOTA_MENSUAL, status: ESTADO_PARCIAL, created_at: new Date(Date.now() - 86400000 * 4), updated_at: null });
    guardarCuentaPorPagar({ id: 2, purchase_id: 4, provider_id: 8, amount_total: 54000000, installments: 2, installment_type: CUOTA_MENSUAL, status: ESTADO_PAGADA, created_at: new Date(Date.now() - 86400000 * 2), updated_at: null });
    guardarCuentaPorPagar({ id: 3, purchase_id: 6, provider_id: 2, amount_total: 150000000, installments: 5, installment_type: CUOTA_MENSUAL, status: ESTADO_PENDIENTE, created_at: new Date(), updated_at: null });
    guardarCuentaPorPagar({ id: 4, purchase_id: 8, provider_id: 7, amount_total: 42500000, installments: 2, installment_type: CUOTA_QUINCENAL, status: ESTADO_PENDIENTE, created_at: new Date(), updated_at: null });
    guardarCuentaPorPagar({ id: 5, purchase_id: 10, provider_id: 4, amount_total: 12000000, installments: 3, installment_type: CUOTA_SEMANAL, status: ESTADO_PARCIAL, created_at: new Date(), updated_at: null });

    // 16. CuotasPorPagar
    guardarCuotaPorPagar({ id: 1, account_payable_id: 1, installment_number: 1, amount: 21666667, amount_paid: 21666667, status: ESTADO_PAGADA, due_date: new Date(Date.now() - 86400000 * 15), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 2, account_payable_id: 1, installment_number: 2, amount: 21666667, amount_paid: 10000000, status: ESTADO_PARCIAL, due_date: new Date(Date.now() + 86400000 * 15), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 3, account_payable_id: 1, installment_number: 3, amount: 21666666, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 45), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 4, account_payable_id: 2, installment_number: 1, amount: 27000000, amount_paid: 27000000, status: ESTADO_PAGADA, due_date: new Date(Date.now() - 86400000 * 30), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 5, account_payable_id: 2, installment_number: 2, amount: 27000000, amount_paid: 27000000, status: ESTADO_PAGADA, due_date: new Date(Date.now() - 86400000), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 6, account_payable_id: 3, installment_number: 1, amount: 30000000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 30), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 7, account_payable_id: 3, installment_number: 2, amount: 30000000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 60), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 8, account_payable_id: 3, installment_number: 3, amount: 30000000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 90), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 9, account_payable_id: 3, installment_number: 4, amount: 30000000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 120), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 10, account_payable_id: 3, installment_number: 5, amount: 30000000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 150), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 11, account_payable_id: 4, installment_number: 1, amount: 21250000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 15), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 12, account_payable_id: 4, installment_number: 2, amount: 21250000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 30), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 13, account_payable_id: 5, installment_number: 1, amount: 4000000, amount_paid: 4000000, status: ESTADO_PAGADA, due_date: new Date(Date.now() - 86400000 * 7), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 14, account_payable_id: 5, installment_number: 2, amount: 4000000, amount_paid: 2000000, status: ESTADO_PARCIAL, due_date: new Date(Date.now() + 86400000 * 7), created_at: new Date(), updated_at: null });
    guardarCuotaPorPagar({ id: 15, account_payable_id: 5, installment_number: 3, amount: 4000000, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 14), created_at: new Date(), updated_at: null });

    // 13. Pagos
    guardarPago({ id: 1, installment_payable_id: 1, purchase_id: null, amount: 15000000, payment_method: METODO_TRANSFERENCIA, obs: "TRF. BANCO ATLAS NRO 54321", created_at: new Date(Date.now() - 86400000 * 3) });
    guardarPago({ id: 2, installment_payable_id: 1, purchase_id: null, amount: 6666667, payment_method: METODO_EFECTIVO, obs: "RECIBO OFICIAL NRO 001-001", created_at: new Date(Date.now() - 86400000 * 1) });
    guardarPago({ id: 3, installment_payable_id: 2, purchase_id: null, amount: 10000000, payment_method: METODO_CHEQUE, obs: "CHQ. BASA NRO 987654 AL DIA", created_at: new Date(Date.now() - 86400000 * 1) });
    guardarPago({ id: 4, installment_payable_id: 4, purchase_id: null, amount: 20000000, payment_method: METODO_EFECTIVO, obs: "RECIBO OFICIAL NRO 005-001", created_at: new Date() });
    guardarPago({ id: 5, installment_payable_id: 4, purchase_id: null, amount: 7000000, payment_method: METODO_TRANSFERENCIA, obs: "TRF. ITAU NRO TRANS 10293", created_at: new Date() });
    guardarPago({ id: 6, installment_payable_id: 5, purchase_id: null, amount: 27000000, payment_method: METODO_TARJETA_CREDITO, obs: "TARJETA VISA - AUT: 456789", created_at: new Date() });
    guardarPago({ id: 7, installment_payable_id: 13, purchase_id: null, amount: 4000000, payment_method: METODO_TARJETA_DEBITO, obs: "MASTERCARD DEB - AUT: 123456", created_at: new Date() });
    guardarPago({ id: 8, installment_payable_id: 14, purchase_id: null, amount: 2000000, payment_method: METODO_TRANSFERENCIA, obs: "TRF. UENO NRO TRANS 55521", created_at: new Date() });

    // 14. CuentasPorCobrar
    guardarCuentaPorCobrar({ id: 1, sale_id: 2, client_id: 3, amount_total: 6500000, installments: 2, installment_type: CUOTA_MENSUAL, status: ESTADO_PARCIAL, created_at: new Date(), updated_at: null });
    guardarCuentaPorCobrar({ id: 2, sale_id: 4, client_id: 7, amount_total: 16100000, installments: 2, installment_type: CUOTA_MENSUAL, status: ESTADO_COBRADA, created_at: new Date(), updated_at: null });
    guardarCuentaPorCobrar({ id: 3, sale_id: 7, client_id: 4, amount_total: 14500000, installments: 3, installment_type: CUOTA_QUINCENAL, status: ESTADO_PENDIENTE, created_at: new Date(), updated_at: null });
    guardarCuentaPorCobrar({ id: 4, sale_id: 9, client_id: 8, amount_total: 8000000, installments: 3, installment_type: CUOTA_MENSUAL, status: ESTADO_PARCIAL, created_at: new Date(), updated_at: null });

    // 17. CuotasPorCobrar
    guardarCuotaPorCobrar({ id: 1, account_receivable_id: 1, installment_number: 1, amount: 3250000, amount_paid: 1500000, status: ESTADO_PARCIAL, due_date: new Date(Date.now() + 86400000 * 8), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 2, account_receivable_id: 1, installment_number: 2, amount: 3250000, amount_paid: 2000000, status: ESTADO_PARCIAL, due_date: new Date(Date.now() + 86400000 * 16), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 3, account_receivable_id: 2, installment_number: 1, amount: 8050000, amount_paid: 8050000, status: ESTADO_COBRADA, due_date: new Date(Date.now() - 86400000 * 2), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 4, account_receivable_id: 2, installment_number: 2, amount: 8050000, amount_paid: 8050000, status: ESTADO_COBRADA, due_date: new Date(Date.now() - 86400000 * 1), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 5, account_receivable_id: 3, installment_number: 1, amount: 4833333, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 10), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 6, account_receivable_id: 3, installment_number: 2, amount: 4833333, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 20), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 7, account_receivable_id: 3, installment_number: 3, amount: 4833334, amount_paid: 0, status: ESTADO_PENDIENTE, due_date: new Date(Date.now() + 86400000 * 30), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 8, account_receivable_id: 4, installment_number: 1, amount: 2666666, amount_paid: 2666666, status: ESTADO_COBRADA, due_date: new Date(Date.now() - 86400000 * 2), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 9, account_receivable_id: 4, installment_number: 2, amount: 2666667, amount_paid: 2666667, status: ESTADO_COBRADA, due_date: new Date(Date.now() - 86400000 * 1), created_at: new Date(), updated_at: null });
    guardarCuotaPorCobrar({ id: 10, account_receivable_id: 4, installment_number: 3, amount: 2666667, amount_paid: 2666667, status: ESTADO_COBRADA, due_date: new Date(), created_at: new Date(), updated_at: null });

    // 15. Cobros
    guardarCobro({ id: 1, installment_receivable_id: 1, sale_id: null, amount: 1500000, payment_method: METODO_EFECTIVO, obs: "Pago parcial cuota 1", created_at: new Date() });
    guardarCobro({ id: 2, installment_receivable_id: 1, sale_id: null, amount: 2000000, payment_method: METODO_EFECTIVO, obs: "Completa cuota 1 + parcial cuota 2", created_at: new Date() });
    guardarCobro({ id: 3, installment_receivable_id: 2, sale_id: null, amount: 2000000, payment_method: METODO_TRANSFERENCIA, obs: "Pago parcial cuota 2", created_at: new Date() });
    guardarCobro({ id: 4, installment_receivable_id: 3, sale_id: null, amount: 8050000, payment_method: METODO_EFECTIVO, obs: "Cuota 1 completa", created_at: new Date() });
    guardarCobro({ id: 5, installment_receivable_id: 4, sale_id: null, amount: 8050000, payment_method: METODO_TRANSFERENCIA, obs: "Cuota 2 completa", created_at: new Date() });
    guardarCobro({ id: 6, installment_receivable_id: 8, sale_id: null, amount: 2666666, payment_method: METODO_EFECTIVO, obs: "Cuota 1 completa", created_at: new Date() });
    guardarCobro({ id: 7, installment_receivable_id: 9, sale_id: null, amount: 2666667, payment_method: METODO_EFECTIVO, obs: "Cuota 2 completa", created_at: new Date() });
    guardarCobro({ id: 8, installment_receivable_id: 10, sale_id: null, amount: 2666667, payment_method: METODO_EFECTIVO, obs: "Cuota 3 completa", created_at: new Date() });

    // 18. Inventario
    guardarAjusteInventario({ id: 1, product_id: 1, user_id: 6, type: AJUSTE_ENTRADA, quantity: 5, reason: "REPOSICION DE STOCK", previous_stock: 10, new_stock: 15, created_at: new Date(Date.now() - 86400000 * 7) });
    guardarAjusteInventario({ id: 2, product_id: 7, user_id: 6, type: AJUSTE_SALIDA, quantity: 2, reason: "PRODUCTO DANADO", previous_stock: 7, new_stock: 5, created_at: new Date(Date.now() - 86400000 * 3) });
    guardarAjusteInventario({ id: 3, product_id: 4, user_id: 6, type: AJUSTE_ENTRADA, quantity: 3, reason: "CORRECCION DE INVENTARIO", previous_stock: 7, new_stock: 10, created_at: new Date() });
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

/**
 * 
 * @param { { id: number }[] } array Array completa de la tabla
 * @returns {number}
 */
function obtenerSiguienteId(array) {
    if (array.length === 0) return 1;
    return Math.max(...array.map(c => c.id)) + 1;
}
