/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

// MODALES
const modalSeleccionarCuenta = new bootstrap.Modal(document.getElementById("modalSeleccionarCuenta"));
const modalCobrosMultiples = new bootstrap.Modal(document.getElementById("modalCobrosMultiples"));

// ELEMENTOS HTML
const elemSelectCuenta = document.getElementById("cuenta_id");
const elemDivResumenCuenta = document.getElementById("div_resumen_cuenta");
const elemInputResumenTotal = document.getElementById("res_total");
const elemInputResumenAbonado = document.getElementById("res_abonado");
const elemInputResumenSaldo = document.getElementById("res_saldo");
const elemTablaResumenCuotas = document.getElementById("tbody_cuotas_cuenta");
const elemBtnCobrarCuenta = document.getElementById("btn_ir_cobrar");
const elemCobroStrongMontoPendiente = document.getElementById("cobro_saldo_cuenta");
const elemCobroInputMontoTotal = document.getElementById("cobro_monto_total");
const elemCobroSelectMetodo = document.getElementById("pm_metodo");
const elemCobroInputPMMonto = document.getElementById("pm_monto");
const elemCobroInputReferencia = document.getElementById("pm_obs");
const elemCobroDivBanco = document.getElementById("div_pm_banco");
const elemCobroSelectBanco = document.getElementById("pm_banco");

// ESTADO TEMPORAL
/** @type {CuentaPorCobrar?} */
let _cuentaTemp = null;

/** @type {{ method: string, banco: string, obs: string, amount: number }[]} */
const _metodosTemp = [];

// TABLA DE COBROS
const tablaCobros = crearDataTable("tabla_cobros", [
    ...TABLAS.COBRO.slice(0, 3),
    { data: null, title: "Cliente", render: data => {
        const client_id = data.sale_id 
            ? cargarVenta(data.sale_id)?.client_id 
            : cargarCuentaPorCobrar(cargarCuotaPorCobrar(data.installment_receivable_id)?.account_receivable_id)?.client_id;
        return client_id ? cargarCliente(client_id)?.legal_name : '—';
    }},
    ...TABLAS.COBRO.slice(3)
], {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE COBROS",
    actions: null
});

// LABELS MÉTODOS
const METODO_LABELS = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia Bancaria",
    TARJETA_CREDITO: "Tarjeta de Crédito",
    TARJETA_DEBITO: "Tarjeta de Débito",
    CHEQUE: "Cheque"
};

// PASO 1: Abrir modal de selección de cuenta
function ventanaNuevoCobro() {
    if (!tienePermisoSesion(PERMISOS.COBROS_CREAR)) {
        mensajeError("No tienes permiso para crear cobros");
        return;
    }
    // Limpiar estado previo
    _cuentaTemp = null;
    elemSelectCuenta.value = '';
    elemDivResumenCuenta.classList.add('d-none');
    elemBtnCobrarCuenta.disabled = true;
    
    // Cargar cuentas pendientes en el select
    const cuentasPendientes = cargarCuentasPorCobrar().filter(c => c.status !== ESTADO_COBRADA);
    elemSelectCuenta.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>' + cuentasPendientes.map(c => `
        <option value="${c.id}">
            ID ${c.id} — ${cargarCliente(c.client_id)?.legal_name} | Saldo: Gs. ${renderMoneda(calcularCuentaPorCobrar(c.id).amount_due)}
        </option>`).join('');
    modalSeleccionarCuenta.show();
}

// Al cambiar la cuenta seleccionada: mostrar cuotas
function onChangeCuenta() {
    _cuentaTemp = null;
    const cuentaId = parseInt(elemSelectCuenta.value);
    elemDivResumenCuenta.classList.add('d-none');
    elemBtnCobrarCuenta.disabled = true;
    if (!cuentaId) return;
    const cuenta = cargarCuentaPorCobrar(cuentaId);
    if (!cuenta || cuenta.status === ESTADO_COBRADA) return;
    _cuentaTemp = cuenta;
    const cuotas = cargarCuotasPorCobrar(cuentaId).sort((a, b) => a.installment_number - b.installment_number);
    const abonado = cuotas.reduce((s, c) => s + (c.amount_paid || 0), 0);
    const saldo = cuenta.amount_total - abonado;
    elemInputResumenTotal.textContent = `Gs. ${renderMoneda(cuenta.amount_total)}`;
    elemInputResumenAbonado.textContent = `Gs. ${renderMoneda(abonado)}`;
    elemInputResumenSaldo.textContent = `Gs. ${renderMoneda(saldo)}`;
    const hoy = new Date().setHours(0, 0, 0, 0);
    let foundFirstPending = false;
    elemTablaResumenCuotas.innerHTML = cuotas.map(c => {
        const vencida = c.status !== ESTADO_COBRADA && new Date(c.due_date) < hoy;
        const saldoCuota = c.amount - (c.amount_paid || 0);
        let isFirstPending = false;
        if (c.status !== ESTADO_COBRADA && !foundFirstPending) {
            isFirstPending = true;
            foundFirstPending = true;
        }
        let rowClass = '';
        if (c.status === ESTADO_COBRADA) {
            rowClass = 'table-success';
        } else if (vencida) {
            rowClass = 'table-danger';
        } else if (isFirstPending) {
            rowClass = 'table-info';
        } else if (c.status === ESTADO_PARCIAL) {
            rowClass = 'table-warning';
        }
        const badge = c.status === ESTADO_COBRADA
            ? '<span class="badge bg-success">COBRADA</span>'
            : (vencida ? '<span class="badge bg-danger">VENCIDA</span>'
            : (c.status === ESTADO_PARCIAL ? '<span class="badge bg-warning text-dark">PARCIAL</span>'
            : (isFirstPending ? '<span class="badge bg-info text-dark shadow-sm border border-info">SIGUIENTE A COBRAR</span>' 
            : '<span class="badge bg-secondary">PENDIENTE</span>')));
            
        return `<tr class="${rowClass}">
            <td class="text-center fw-bold">${c.installment_number}</td>
            <td class="text-end">Gs. ${renderMoneda(c.amount)}</td>
            <td class="text-end text-success fw-semibold">Gs. ${renderMoneda(c.amount_paid || 0)}</td>
            <td class="text-end text-danger fw-semibold">Gs. ${renderMoneda(saldoCuota)}</td>
            <td>${renderDate(c.due_date)}</td>
            <td class="text-center">${badge}</td>
        </tr>`;
    }).join('');
    elemDivResumenCuenta.classList.remove('d-none');
    elemBtnCobrarCuenta.disabled = false;
}

// PASO 2: Abrir modal de cobros múltiples
function ventanaCobrosMultiples() {
    if (!_cuentaTemp) return;
    modalSeleccionarCuenta.hide();
    // Limpiar estado
    _metodosTemp.splice(0);
    const { amount_paid, amount_due } = calcularCuentaPorCobrar(_cuentaTemp.id);
    const saldoTotal = amount_due;
    elemCobroStrongMontoPendiente.textContent = `Gs. ${renderMoneda(saldoTotal)}`;
    
    // Buscar la primera cuota pendiente para sugerir su saldo como monto a cobrar
    const cuotas = cargarCuotasPorCobrar(_cuentaTemp.id).sort((a, b) => a.installment_number - b.installment_number);
    let montoSugerido = saldoTotal;
    for (const c of cuotas) {
        if (c.status === ESTADO_COBRADA) continue;
        montoSugerido = c.amount - (c.amount_paid || 0);
        break;
    }
    elemCobroInputMontoTotal.value = montoSugerido;
    elemCobroInputMontoTotal.max = saldoTotal;
    // Reset campos de método
    elemCobroSelectMetodo.value = '';
    elemCobroInputPMMonto.value  = '';
    elemCobroInputReferencia.value    = '';
    elemCobroDivBanco.classList.add('d-none');
    elemCobroSelectBanco.value  = '';
    renderizarCobrosMultiples();
    modalCobrosMultiples.show();
}

// Mostrar/ocultar selector de banco según método elegido
function onChangePMMetodo() {
    const metodo = elemCobroSelectMetodo.value;
    if (metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) {
        elemCobroDivBanco.classList.remove('d-none');
    } else {
        elemCobroDivBanco.classList.add('d-none');
        elemCobroSelectBanco.value = '';
    }
    // Pre-llenar monto restante
    const montoTotal = parseInt(elemCobroInputMontoTotal.value) || 0;
    const ingresado = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const restante = montoTotal - ingresado;
    if (restante > 0) elemCobroInputPMMonto.value = restante;
}

// Agregar un método de cobro a la lista temporal
function onClickAgregarMetodoCobro() {
    const metodo = elemCobroSelectMetodo.value;
    const banco = elemCobroSelectBanco.value.trim().toUpperCase();
    const monto = parseInt(elemCobroInputPMMonto.value) || 0;
    const obs = elemCobroInputReferencia.value.trim().toUpperCase();
    const montoTotal = parseInt(elemCobroInputMontoTotal.value) || 0;
    if (!metodo) {
        mensajeError('Seleccione el método de cobro.');
        elemCobroSelectMetodo.focus();
        return;
    } else if ((metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) && !banco) {
        mensajeError('Debe seleccionar un banco para Transferencia o Cheque.');
        elemCobroSelectMetodo.focus();
        return;
    } else if (monto <= 0) {
        mensajeError('El monto debe ser mayor a 0.');
        elemCobroInputPMMonto.focus();
        return;
    } else if (montoTotal <= 0) {
        mensajeError('Primero defina el monto total a cobrar en esta operación.');
        elemCobroInputMontoTotal.focus();
        return;
    }
    const ingresado = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const restante  = montoTotal - ingresado;
    if (monto > restante) {
        mensajeError(`El monto excede el saldo restante de Gs. ${renderMoneda(restante)}.`);
        elemCobroInputPMMonto.focus();
        return;
    }
    _metodosTemp.push({ method: metodo, banco, obs, amount: monto });
    // Reset campos
    elemCobroSelectMetodo.value = '';
    elemCobroInputPMMonto.value = '';
    elemCobroInputReferencia.value = '';
    elemCobroSelectBanco.value  = '';
    elemCobroDivBanco.classList.add('d-none');
    renderizarCobrosMultiples();
}

// Quitar un método de la lista
function onClickEliminarMetodoCobro(index) {
    _metodosTemp.splice(index, 1);
    renderizarCobrosMultiples();
}

// Sumar el saldo de la siguiente cuota al monto actual
function onClickSumarSiguienteCuota() {
    if (!_cuentaTemp) return;
    const montoActual = parseFloat(elemCobroInputMontoTotal.value) || 0;
    const cuotas = cargarCuotasPorCobrar(_cuentaTemp.id).sort((a, b) => a.installment_number - b.installment_number);
    let acumulado = 0;
    let montoASumar = 0;
    for (const c of cuotas) {
        if (c.status === ESTADO_COBRADA) continue;
        const saldoCuota = c.amount - (c.amount_paid || 0);
        acumulado += saldoCuota;
        if (acumulado > montoActual) {
            montoASumar = Math.round(acumulado - montoActual);
            break;
        }
    }
    if (montoASumar > 0) {
        elemCobroInputMontoTotal.value = montoActual + montoASumar;
        renderizarCobrosMultiples();
    } else {
        mensajeError("Ya has alcanzado el total de la deuda.");
    }
}

// Renderizar tabla de métodos y actualizar totales
function renderizarCobrosMultiples() {
    const montoTotal = parseInt(elemCobroInputMontoTotal.value) || 0;
    const ingresado  = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const diferencia = montoTotal - ingresado;
    document.getElementById('cobro_monto_label').textContent  = `Gs. ${renderMoneda(montoTotal)}`;
    document.getElementById('cobro_ingresado').textContent    = `Gs. ${renderMoneda(ingresado)}`;
    document.getElementById('pm_total_ingresado').textContent = `Gs. ${renderMoneda(ingresado)}`;
    document.getElementById('pm_diferencia').textContent     = `Gs. ${renderMoneda(diferencia)}`;
    const tbody = document.getElementById('tbody_metodos_cobro');
    if (_metodosTemp.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin métodos de cobro agregados.</td></tr>';
    } else {
        tbody.innerHTML = _metodosTemp.map((m, i) => {
            const label = METODO_LABELS[m.method] || m.method;
            const banco = m.banco ? ` (${m.banco})` : '';
            return `<tr>
                <td>${label}${banco}</td>
                <td class="text-end fw-bold">Gs. ${renderMoneda(m.amount)}</td>
                <td>${m.obs || '—'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger" onclick="onClickEliminarMetodoCobro(${i})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }
    // Alerta y botón confirmar
    const alerta    = document.getElementById('div_alerta_cobro');
    const btnConf   = document.getElementById('btn_confirmar_cobro');
    if (montoTotal <= 0) {
        alerta.className = 'alert alert-warning mt-2';
        alerta.textContent = 'Defina el monto total a cobrar en esta operación.';
        alerta.classList.remove('d-none');
        btnConf.disabled = true;
    } else if (ingresado === 0) {
        alerta.className = 'alert alert-info mt-2';
        alerta.textContent = 'Agregue al menos un método de cobro.';
        alerta.classList.remove('d-none');
        btnConf.disabled = true;
    } else if (diferencia !== 0) {
        alerta.className = 'alert alert-danger mt-2';
        alerta.textContent = diferencia > 0
            ? `Faltan Gs. ${renderMoneda(diferencia)} por cubrir con un método de cobro.`
            : `El monto ingresado supera en Gs. ${renderMoneda(Math.abs(diferencia))} al monto a cobrar.`;
        alerta.classList.remove('d-none');
        btnConf.disabled = true;
    } else {
        alerta.classList.add('d-none');
        btnConf.disabled = false;
    }
}

// Cancelar modal de métodos de cobro → volver a selección de cuenta
function cancelarCobroMultiple() {
    _metodosTemp.splice(0);
    modalCobrosMultiples.hide();
    if (_cuentaTemp) modalSeleccionarCuenta.show();
}

// PASO 3: Confirmar el cobro
function confirmarCobroMultiple() {
    const montoTotal = parseInt(elemCobroInputMontoTotal.value) || 0;
    const ingresado  = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    let { amount_paid, amount_due } = calcularCuentaPorCobrar(_cuentaTemp.id);
    if (!_cuentaTemp) {
        mensajeError('No hay cuenta seleccionada.');
        return;
    }
    const cuenta = cargarCuentaPorCobrar(_cuentaTemp.id);
    if (!cuenta) {
        mensajeError('No se pudo cargar la cuenta.');
        return;
    }
    if (montoTotal <= 0) {
        mensajeError('El monto a cobrar debe ser mayor a 0.');
        return;
    }
    if (montoTotal > amount_due) {
        mensajeError(`El monto (Gs. ${renderMoneda(montoTotal)}) excede el saldo pendiente (Gs. ${renderMoneda(_cuentaTemp.amount_due)}).`);
        return;
    }
    if (ingresado !== montoTotal) {
        mensajeError('El total de los métodos de cobro no coincide con el monto a cobrar.');
        return;
    }
    // Actualizar totales de la cuenta
    amount_paid += montoTotal;
    amount_due = cuenta.amount_total - amount_paid;
    cuenta.status = amount_due <= 1 ? ESTADO_COBRADA : ESTADO_PARCIAL;
    cuenta.updated_at = new Date();
    
    // Distribuir el monto entre cuotas pendientes de forma correlativa
    const cuotas = cargarCuotasPorCobrar(cuenta.id).sort((a, b) => a.installment_number - b.installment_number);
    let montoRestante = montoTotal;
    const installmentIds = []; // cuotas afectadas (para referencia en cobros)
    for (const cuota of cuotas) {
        if (montoRestante <= 0) break;
        if (cuota.status === ESTADO_COBRADA) continue;
        const saldoCuota = Math.round(cuota.amount - (cuota.amount_paid || 0));
        if (saldoCuota <= 0) {
            if (cuota.status !== ESTADO_COBRADA) {
                cuota.status = ESTADO_COBRADA;
                cuota.updated_at = new Date();
                guardarCuotaPorCobrar(cuota);
            }
            continue;
        }
        const abono = Math.min(montoRestante, saldoCuota);
        cuota.amount_paid = Math.round((cuota.amount_paid || 0) + abono);
        // Tolerancia de 1 Gs: si el saldo restante es <= 1, marcar como cobrada
        const saldoTrasAbono = Math.round(cuota.amount - cuota.amount_paid);
        cuota.status = saldoTrasAbono <= 1 ? ESTADO_COBRADA : ESTADO_PARCIAL;
        if (saldoTrasAbono <= 1 && saldoTrasAbono > 0) {
            cuota.amount_paid = cuota.amount;
        }
        cuota.updated_at = new Date();
        guardarCuotaPorCobrar(cuota);
        installmentIds.push(cuota.id);
        montoRestante -= abono;
    }
    // Guardar un registro de cobro por cada método utilizado
    const primeraInstallmentId = installmentIds[0] || null;
    for (const metodo of _metodosTemp) {
        const obsTexto = (metodo.method === METODO_TRANSFERENCIA || metodo.method === METODO_CHEQUE) && metodo.banco
            ? `BANCO: ${metodo.banco}${metodo.obs ? ' | ' + metodo.obs : ''}`
            : (metodo.obs || `COBRO CUENTA ID ${cuenta.id}`);
        guardarCobro({
            id: obtenerSiguienteId(cargarCobros()),
            installment_receivable_id: primeraInstallmentId,
            sale_id: null,
            amount: metodo.amount,
            payment_method: metodo.method,
            obs: obsTexto,
            created_at: new Date()
        });
    }
    guardarCuentaPorCobrar(cuenta);
    // Limpiar y cerrar
    _metodosTemp.splice(0);
    _cuentaTemp = null;
    modalCobrosMultiples.hide();
    cargarDatos();
    mensajeSuccess(`Cobro de Gs. ${renderMoneda(montoTotal)} registrado correctamente. Cuotas actualizadas en orden correlativo.`);
}

function cargarDatos() {
    try { repararCuentasPorCobrar(); } catch(e) { console.error('repararCuentasPorCobrar:', e); }
    const metodo = document.getElementById('filtro_metodo').value;
    const fechaDesde = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta = document.getElementById('filtro_fecha_hasta').value;
    const cobrosFiltrados = cargarCobros().filter(p => {
        // Excluir cobros de entrega inicial (ventas al contado sin cuenta ni cuota)
        if (p.sale_id && !p.installment_receivable_id) return false;
        if (metodo && p.payment_method !== metodo) return false;
        if (fechaDesde && fechaDesde > toISOLocalDate(p.created_at)) return false;
        if (fechaHasta && fechaHasta < toISOLocalDate(p.created_at)) return false;
        return true;
    });
    cargarDataTable(tablaCobros, cobrosFiltrados);
    const sumatoria = cobrosFiltrados.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('suma_cobros').textContent = renderMoneda(sumatoria) + ' Gs.';
    
    // Si viene con ?cuenta_id= en la URL, abrir directamente el cobro de esa cuenta
    const cuenta_id = parseInt(new URLSearchParams(window.location.search).get('cuenta_id'));
    if (cuenta_id) {
        window.history.replaceState({}, document.title, window.location.pathname);
        const cuenta = cargarCuentaPorCobrar(cuenta_id);
        if (cuenta && cuenta.status !== ESTADO_COBRADA) {
            _cuentaTemp = cuenta;
            const { amount_paid, amount_due } = calcularCuentaPorCobrar(cuenta.id);
            // Abrir directamente el modal de cobros múltiples
            _metodosTemp.splice(0);
            elemCobroStrongMontoPendiente.textContent = `Gs. ${renderMoneda(amount_due)}`;
            
            // Buscar la primera cuota pendiente para sugerir su saldo
            const cuotas = cargarCuotasPorCobrar(cuenta.id)
                .sort((a, b) => a.installment_number - b.installment_number);
            let montoSugerido = amount_due;
            for (const c of cuotas) {
                if (c.status !== ESTADO_COBRADA) {
                    montoSugerido = c.amount - (c.amount_paid || 0);
                    break;
                }
            }
            elemCobroInputMontoTotal.value = montoSugerido;
            elemCobroInputMontoTotal.max = amount_due;
            elemCobroSelectMetodo.value = '';
            elemCobroInputPMMonto.value  = '';
            elemCobroInputReferencia.value = '';
            elemCobroDivBanco.classList.add('d-none');
            elemCobroSelectBanco.value  = '';
            renderizarCobrosMultiples();
            modalCobrosMultiples.show();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.COBROS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.COBROS_CREAR)) document.getElementById('btnModalNuevo').style.display = 'none';
    cargarDatos();
});
