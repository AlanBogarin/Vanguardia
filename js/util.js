/**
 * Aplicar una funcion hash sobre una contraseña
 * 
 * Uso: `const hash = await hashPassword(password);`
 * @param {string} password Contraseña en texto plano
 * @returns {string} Hash de la contraseña
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexArray = hashArray.map(b => b.toString(16).padStart(2, '0'));
    return hexArray.join('')
}
