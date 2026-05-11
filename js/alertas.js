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
    alertify.alert(titulo, mensaje, onExit);
}

/**
 * Crear un dialogo Ok/Cancelar
 * @param {string} titulo 
 * @param {string} mensaje 
 * @param {Function?} onOk 
 * @param {Function?} onCancel 
 */
function confirmar(titulo, mensaje, onOk, onCancel) {
    alertify.confirm(titulo, mensaje, onOk, onCancel);
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
    alertify.prompt(titulo, mensaje, value || "", onOk, onCancel);
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
            document.location.href = "login.html";
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
    if (sesion) {
        const expire_at = new Date(sesion.expire_at);
        if (new Date() < expire_at) return;
        alertar("Sesión Expirada", `La sesión expiró en: ${expire_at}`);
    } else {
        alertar("Sesión Invalida", "Inicie sesión antes de continuar");
    }
    eliminarSesion();
    document.location.href = "login.html";
}
