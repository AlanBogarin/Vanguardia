/** @typedef {import('alertify')} */
/** @typedef {import('./bd')} */

alertify.defaults.glossary.ok = "Aceptar";
alertify.defaults.glossary.cancel = "Cancelar"

/**
 * Crear un dialogo simple
 * @param {string} titulo 
 * @param {string} mensaje 
 * @param {Function?} onExit 
 */
function alertar(titulo, mensaje, onExit) {
    return alertify.alert(titulo, mensaje, onExit);
}

/**
 * Crear un dialogo Ok/Cancelar
 * @param {string} titulo 
 * @param {string} mensaje 
 * @param {Function?} onOk 
 * @param {Function?} onCancel 
 */
function confirmar(titulo, mensaje, onOk, onCancel) {
    return alertify.confirm(titulo, mensaje, onOk, onCancel);
}

/**
 * Pedir un valor
 * @param {string} titulo Titulo
 * @param {string} mensaje Mensaje
 * @param {string?} value Valor por defecto
 * @param {Function?} onOk Funcion (env: any, value: string)
 * @param {Function?} onCancel Funcion sin parametros
 */
function pedir(titulo, mensaje, value, onOk, onCancel) {
    return alertify.prompt(titulo, mensaje, value || "", onOk, onCancel);
}

/**
 * Mostrar un mensaje generico
 * @param {string} mensaje 
 */
function mensajeInfo(mensaje) {
    alertify.message(mensaje);
}

/**
 * Mostrar un mensaje de una acción existosa
 * @param {string} mensaje 
 */
function mensajeSuccess(mensaje) {
    alertify.success(mensaje);
}

/**
 * Mostrar un mensaje de advertencia
 * @param {string} mensaje 
 */
function mensajeWarn(mensaje) {
    alertify.warning(mensaje);
}

/**
 * Mostrar un mensaje de un error
 * @param {string} mensaje 
 */
function mensajeError(mensaje) {
    alertify.error(mensaje);
}

/**
 * Dialogo Apeptar/Cancelar para cerrar sesion
 * @param {Function?} onOk Funcion sin parametros
 * @param {Function?} onCancel Funcion sin parametros
 */
function cerrarSesion(onOk=null, onCancel=null) {
    alertify.confirm(
        "Vanguardia",
        "¿Desea cerrar la sesión actual?",
        () => {
            if (onOk) onOk();
            eliminarSesion();
            redirigir("login.html");
        },
        onCancel
    ).set('transition', 'slide').set('labels', {
        ok: 'Sí, salir',
        cancel: 'No'
    });
}

/**
 * Verifica la sesion actual y redirige a login si hace falta
 */
function validarSesion() {
    const sesion = cargarSesion();
    let titulo, mensaje;
    if (sesion) {
        const expire_at = new Date(sesion.expire_at);
        if (new Date() < expire_at) return;
        titulo = "Sesión Expirada";
        mensaje = `La sesión expiró en: ${expire_at}`;
        alertar("Sesión Expirada", `La sesión expiró en: ${expire_at}`);
    } else {
        titulo = "Sesión Invalida"
        mensaje = "Inicie sesión antes de continuar"
    }
    alertar(titulo, mensaje, () => {
        eliminarSesion();
        redirigir("login.html");
    });
}

function redirigir(path) {
    document.location.href = path;
}

/**
 * Validar que la sesion actual pueda acceder a una pagina html
 * @param {number} permiso Flags del permiso de rol 
 * @returns {boolean}
 */
function validarPermiso(permiso) {
    if (tienePermisoSesion(permiso)) return true;
    alertar(
        "Acceso Denegado",
        "No tienes permiso para usar este recurso",
        () => redirigir("menu.html")
    );
    return false;
}
