/**
 * 
 * @param {any} value
 * @param {Date} min 
 * @param {Date} max 
 * @param {boolean} mensajes 
 */
function validarFecha(value, min=null, max=null) {
    if (!value) return false;
    const fecha = new Date(value)
    if ((min && fecha < min) || (max && fecha > max)) return false;
    return true;
}


function validarRuc(value) {
    return value ? String(value).match(/\d+(-\d)?/) !== null : false;
}
