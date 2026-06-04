/* global bootstrap */
/**
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 */

var modalEditar = new bootstrap.Modal(document.getElementById('modalEditarEmpresa'));

function cargarDatos() {
    const empresa = cargarEmpresa();
    if (!empresa) {
        mensajeWarn("No hay datos de empresa configurados.");
        return;
    }
    document.getElementById("ver_legal_name").textContent = empresa.legal_name || '—';
    document.getElementById("ver_slogan").textContent     = empresa.slogan     || '—';
    document.getElementById("ver_ruc").textContent        = empresa.ruc        || '—';
    document.getElementById("ver_address").textContent    = empresa.address    || '—';
    document.getElementById("ver_tel").textContent        = empresa.tel        || '—';
    document.getElementById("ver_stamping").textContent   = empresa.stamping   || '—';
}

function ventanaEditarEmpresa() {
    const empresa = cargarEmpresa();
    if (!empresa) return;
    document.getElementById("edit_legal_name").value = empresa.legal_name || '';
    document.getElementById("edit_slogan").value     = empresa.slogan     || '';
    document.getElementById("edit_ruc").value        = empresa.ruc        || '';
    document.getElementById("edit_address").value    = empresa.address    || '';
    document.getElementById("edit_tel").value        = empresa.tel        || '';
    document.getElementById("edit_stamping").value   = empresa.stamping   || '';
    modalEditar.show();
}

function btnGuardarEmpresa() {
    const legal_name = document.getElementById("edit_legal_name").value.trim();
    const slogan     = document.getElementById("edit_slogan").value.trim();
    const ruc        = document.getElementById("edit_ruc").value.trim();
    const address    = document.getElementById("edit_address").value.trim();
    const tel        = document.getElementById("edit_tel").value.trim();
    const stamping   = document.getElementById("edit_stamping").value.trim();

    if (!legal_name) { mensajeError("La razón social es obligatoria."); return; }
    if (!ruc)        { mensajeError("El RUC es obligatorio."); return; }
    if (!address)    { mensajeError("La dirección es obligatoria."); return; }
    if (!tel)        { mensajeError("El teléfono es obligatorio."); return; }
    if (!stamping)   { mensajeError("El timbrado es obligatorio."); return; }
    if (!stamping.match(REGEX_TIMBRADO)) { mensajeError("El timbrado debe tener exactamente 8 dígitos."); return; }

    guardarEmpresa({ legal_name, slogan, ruc, address, tel, stamping });
    cargarDatos();
    modalEditar.hide();
    mensajeSuccess("Datos de la empresa actualizados correctamente.");
}

document.addEventListener('DOMContentLoaded', () => {
    if (!tienePermisoSesion(PERMISOS.USUARIOS_EDITAR)) {
        document.getElementById("btnEditar").style.display = "none";
    }
    cargarDatos();
});