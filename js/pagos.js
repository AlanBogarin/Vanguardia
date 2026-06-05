/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

// MODALES
const modalSeleccionarCuenta = new bootstrap.Modal(document.getElementById("modalSeleccionarCuenta"));
const modalPagosMultiples = new bootstrap.Modal(document.getElementById("modalPagosMultiples"));

// ELEMENTOS HTML
const elemSelectCuenta = document.getElementById("cuenta_id");
const elemDivResumenCuenta = document.getElementById("div_resumen_cuenta");
const elemInputResumenTotal = document.getElementById("res_total");
const elemInputResumenAbonado = document.getElementById("res_abonado");
const elemInputResumenSaldo = document.getElementById("res_saldo");
const elemTablaResumenCuotas = document.getElementById("tbody_cuotas_cuenta");
const elemBtnPagarCuenta = document.getElementById("btn_ir_pagar");
const elemPagoStrongMontoPendiente = document.getElementById("pago_saldo_cuenta");
const elemPagoInputMontoTotal = document.getElementById("pago_monto_total");
const elemPagoSelectMetodo = document.getElementById("pm_metodo");
const elemPagoInputPMMonto = document.getElementById("pm_monto");
const elemPagoInputReferencia = document.getElementById("pm_obs");
const elemPagoDivBanco = document.getElementById("div_pm_banco");
const elemPagoSelectBanco = document.getElementById("pm_banco");

// ESTADO TEMPORAL
/** @type {CuentaPorPagar?} */
let _cuentaTemp = null;

/** @type {{ method: string, banco: string, obs: string, amount: number }[]} */
const _metodosTemp = [];

// TABLA DE PAGOS
const tablaPagos = crearDataTable("tabla_pagos", TABLAS.PAGO, {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE PAGOS",
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
function ventanaNuevoPago() {
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) {
        mensajeError("No tienes permiso para crear pagos");
        return;
    }
    // Limpiar estado previo
    _cuentaTemp = null;
    elemSelectCuenta.value = '';
    elemDivResumenCuenta.classList.add('d-none');
    elemBtnPagarCuenta.disabled = true;
    // Cargar cuentas pendientes en el select
    const cuentasPendientes = cargarCuentasPorPagar().filter(c => c.status !== ESTADO_PAGADA);
    elemSelectCuenta.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>' + cuentasPendientes.map(c => `
        <option value="${c.id}">
            ID ${c.id} — ${cargarProveedor(c.provider_id).legal_name} | Saldo: Gs. ${renderMoneda(calcularCuentaPorPagar(c.id).amount_due)}
        </option>`).join('');
    modalSeleccionarCuenta.show();
}

// Al cambiar la cuenta seleccionada: mostrar cuotas
function onChangeCuenta() {
    _cuentaTemp = null;
    const cuentaId = parseInt(elemSelectCuenta.value);
    elemDivResumenCuenta.classList.add('d-none');
    elemBtnPagarCuenta.disabled = true;
    if (!cuentaId) return;
    const cuenta = cargarCuentaPorPagar(cuentaId);
    if (!cuenta || cuenta.status === ESTADO_PAGADA) return;
    _cuentaTemp = cuenta;
    const cuotas = cargarCuotasPorPagar(cuentaId).sort((a, b) => a.installment_number - b.installment_number);
    const abonado = cuotas.reduce((s, c) => s + (c.amount_paid || 0), 0);
    const saldo = cuenta.amount_total - abonado;
    elemInputResumenTotal.textContent = `Gs. ${renderMoneda(cuenta.amount_total)}`;
    elemInputResumenAbonado.textContent = `Gs. ${renderMoneda(abonado)}`;
    elemInputResumenSaldo.textContent = `Gs. ${renderMoneda(saldo)}`;
    const hoy = new Date().setHours(0, 0, 0, 0);
    let foundFirstPending = false;
    elemTablaResumenCuotas.innerHTML = cuotas.map(c => {
        const vencida = c.status !== ESTADO_PAGADA && new Date(c.due_date) < hoy;
        const saldoCuota = c.amount - (c.amount_paid || 0);
        let isFirstPending = false;
        if (c.status !== ESTADO_PAGADA && !foundFirstPending) {
            isFirstPending = true;
            foundFirstPending = true;
        }
        let rowClass = '';
        if (c.status === ESTADO_PAGADA) {
            rowClass = 'table-success';
        } else if (vencida) {
            rowClass = 'table-danger';
        } else if (isFirstPending) {
            rowClass = 'table-info';
        } else if (c.status === ESTADO_PARCIAL) {
            rowClass = 'table-warning';
        }
        const badge = c.status === ESTADO_PAGADA
            ? '<span class="badge bg-success">PAGADA</span>'
            : (vencida ? '<span class="badge bg-danger">VENCIDA</span>'
            : (c.status === ESTADO_PARCIAL ? '<span class="badge bg-warning text-dark">PARCIAL</span>'
            : (isFirstPending ? '<span class="badge bg-info text-dark shadow-sm border border-info">SIGUIENTE A PAGAR</span>' 
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
    elemBtnPagarCuenta.disabled = false;
}

// PASO 2: Abrir modal de pagos múltiples
function ventanaPagosMultiples() {
    if (!_cuentaTemp) return;
    modalSeleccionarCuenta.hide();
    // Limpiar estado
    _metodosTemp.splice(0);
    const { amount_paid, amount_due } = calcularCuentaPorPagar(_cuentaTemp.id);
    const saldoTotal = amount_due;
    elemPagoStrongMontoPendiente.textContent = `Gs. ${renderMoneda(saldoTotal)}`;
    // Buscar la primera cuota pendiente para sugerir su saldo como monto a pagar
    const cuotas = cargarCuotasPorPagar(_cuentaTemp.id).sort((a, b) => a.installment_number - b.installment_number);
    let montoSugerido = saldoTotal;
    for (const c of cuotas) {
        if (c.status === ESTADO_PAGADA) continue;
        montoSugerido = c.amount - (c.amount_paid || 0);
        break;
    }
    elemPagoInputMontoTotal.value = montoSugerido;
    elemPagoInputMontoTotal.max = saldoTotal;
    // Reset campos de método
    elemPagoSelectMetodo.value = '';
    elemPagoInputPMMonto.value  = '';
    elemPagoInputReferencia.value    = '';
    elemPagoDivBanco.classList.add('d-none');
    elemPagoSelectBanco.value  = '';
    renderizarPagosMultiples();
    modalPagosMultiples.show();
}

// Mostrar/ocultar selector de banco según método elegido
function onChangePMMetodo() {
    const metodo = elemPagoSelectMetodo.value;
    if (metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) {
        elemPagoDivBanco.classList.remove('d-none');
    } else {
        elemPagoDivBanco.classList.add('d-none');
        elemPagoSelectBanco.value = '';
    }
    // Pre-llenar monto restante
    const montoTotal = parseInt(elemPagoInputMontoTotal.value) || 0;
    const ingresado = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const restante = montoTotal - ingresado;
    if (restante > 0) elemPagoInputPMMonto.value = restante;
}

// Agregar un método de pago a la lista temporal
function onClickAgregarMetodoPago() {
    const metodo = elemPagoSelectMetodo.value;
    const banco = elemPagoSelectBanco.value.trim().toUpperCase();
    const monto = parseInt(elemPagoInputPMMonto.value) || 0;
    const obs = elemPagoInputReferencia.value.trim().toUpperCase();
    const montoTotal = parseInt(elemPagoInputMontoTotal.value) || 0;
    if (!metodo) {
        mensajeError('Seleccione el método de pago.');
        elemPagoSelectMetodo.focus();
        return;
    } else if ((metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) && !banco) {
        mensajeError('Debe seleccionar un banco para Transferencia o Cheque.');
        elemPagoSelectMetodo.focus();
        return;
    } else if (monto <= 0) {
        mensajeError('El monto debe ser mayor a 0.');
        elemPagoInputPMMonto.focus();
        return;
    } else if (montoTotal <= 0) {
        mensajeError('Primero defina el monto total a pagar en esta operación.');
        elemPagoInputMontoTotal.focus();
        return;
    }
    const ingresado = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const restante  = montoTotal - ingresado;
    if (monto > restante) {
        mensajeError(`El monto excede el saldo restante de Gs. ${renderMoneda(restante)}.`);
        elemPagoInputPMMonto.focus();
        return;
    }
    _metodosTemp.push({ method: metodo, banco, obs, amount: monto });
    // Reset campos
    elemPagoSelectMetodo.value = '';
    elemPagoInputPMMonto.value = '';
    elemPagoInputReferencia.value = '';
    elemPagoSelectBanco.value  = '';
    elemPagoDivBanco.classList.add('d-none');
    renderizarPagosMultiples();
}

// Quitar un método de la lista
function onClickEliminarMetodoPago(index) {
    _metodosTemp.splice(index, 1);
    renderizarPagosMultiples();
}

// Sumar el saldo de la siguiente cuota al monto actual
function onClickSumarSiguienteCuota() {
    if (!_cuentaTemp) return;
    const montoActual = parseFloat(elemPagoInputMontoTotal.value) || 0;
    const cuotas = cargarCuotasPorPagar(_cuentaTemp.id).sort((a, b) => a.installment_number - b.installment_number);
    let acumulado = 0;
    let montoASumar = 0;
    for (const c of cuotas) {
        if (c.status === ESTADO_PAGADA) continue;
        const saldoCuota = c.amount - (c.amount_paid || 0);
        acumulado += saldoCuota;
        // Si el acumulado es estrictamente mayor al monto actual ingresado
        // significa que esta cuota no está cubierta (o está cubierta parcialmente).
        // Lo que falta para cubrirla por completo es (acumulado - montoActual).
        if (acumulado > montoActual) {
            // Prevenir errores de redondeo
            montoASumar = Math.round(acumulado - montoActual);
            break;
        }
    }
    if (montoASumar > 0) {
        elemPagoInputMontoTotal.value = montoActual + montoASumar;
        renderizarPagosMultiples();
    } else {
        mensajeError("Ya has alcanzado el total de la deuda.");
    }
}

// Renderizar tabla de métodos y actualizar totales
function renderizarPagosMultiples() {
    const montoTotal = parseInt(elemPagoInputMontoTotal.value) || 0;
    const ingresado  = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const diferencia = montoTotal - ingresado;
    document.getElementById('pago_monto_label').textContent  = `Gs. ${renderMoneda(montoTotal)}`;
    document.getElementById('pago_ingresado').textContent    = `Gs. ${renderMoneda(ingresado)}`;
    document.getElementById('pm_total_ingresado').textContent = `Gs. ${renderMoneda(ingresado)}`;
    document.getElementById('pm_diferencia').textContent     = `Gs. ${renderMoneda(diferencia)}`;
    const tbody = document.getElementById('tbody_metodos_pago');
    if (_metodosTemp.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin métodos de pago agregados.</td></tr>';
    } else {
        tbody.innerHTML = _metodosTemp.map((m, i) => {
            const label = METODO_LABELS[m.method] || m.method;
            const banco = m.banco ? ` (${m.banco})` : '';
            return `<tr>
                <td>${label}${banco}</td>
                <td class="text-end fw-bold">Gs. ${renderMoneda(m.amount)}</td>
                <td>${m.obs || '—'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger" onclick="onClickEliminarMetodoPago(${i})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }
    // Alerta y botón confirmar
    const alerta    = document.getElementById('div_alerta_pago');
    const btnConf   = document.getElementById('btn_confirmar_pago');
    if (montoTotal <= 0) {
        alerta.className = 'alert alert-warning mt-2';
        alerta.textContent = 'Defina el monto total a pagar en esta operación.';
        alerta.classList.remove('d-none');
        btnConf.disabled = true;
    } else if (ingresado === 0) {
        alerta.className = 'alert alert-info mt-2';
        alerta.textContent = 'Agregue al menos un método de pago.';
        alerta.classList.remove('d-none');
        btnConf.disabled = true;
    } else if (diferencia !== 0) {
        alerta.className = 'alert alert-danger mt-2';
        alerta.textContent = diferencia > 0
            ? `Faltan Gs. ${renderMoneda(diferencia)} por cubrir con un método de pago.`
            : `El monto ingresado supera en Gs. ${renderMoneda(Math.abs(diferencia))} al monto a pagar.`;
        alerta.classList.remove('d-none');
        btnConf.disabled = true;
    } else {
        alerta.classList.add('d-none');
        btnConf.disabled = false;
    }
}

// Cancelar modal de métodos de pago → volver a selección de cuenta
function cancelarPagoMultiple() {
    _metodosTemp.splice(0);
    modalPagosMultiples.hide();
    // Reabrir selección de cuenta si hay una cuenta cargada
    if (_cuentaTemp) modalSeleccionarCuenta.show();
}

// PASO 3: Confirmar el pago
function confirmarPagoMultiple() {
    const montoTotal = parseInt(elemPagoInputMontoTotal.value) || 0;
    const ingresado  = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    let { amount_paid, amount_due } = calcularCuentaPorPagar(_cuentaTemp.id);
    if (!_cuentaTemp) {
        mensajeError('No hay cuenta seleccionada.');
        return;
    }
    const cuenta = cargarCuentaPorPagar(_cuentaTemp.id);
    if (!cuenta) {
        mensajeError('No se pudo cargar la cuenta.');
        return;
    }
    if (montoTotal <= 0) {
        mensajeError('El monto a pagar debe ser mayor a 0.');
        return;
    }
    if (montoTotal > amount_due) {
        mensajeError(`El monto (Gs. ${renderMoneda(montoTotal)}) excede el saldo pendiente (Gs. ${renderMoneda(_cuentaTemp.amount_due)}).`);
        return;
    }
    if (ingresado !== montoTotal) {
        mensajeError('El total de los métodos de pago no coincide con el monto a pagar.');
        return;
    }
    // Actualizar totales de la cuenta
    amount_paid += montoTotal;
    amount_due = cuenta.amount_total - amount_paid;
    cuenta.status = amount_due <= 0 ? ESTADO_PAGADA : ESTADO_PARCIAL;
    cuenta.updated_at = new Date();
    // Distribuir el monto entre cuotas pendientes de forma correlativa
    const cuotas = cargarCuotasPorPagar(cuenta.id).sort((a, b) => a.installment_number - b.installment_number);
    let montoRestante = montoTotal;
    const installmentIds = []; // cuotas afectadas (para referencia en pagos)
    for (const cuota of cuotas) {
        if (montoRestante <= 0) break;
        if (cuota.status === ESTADO_PAGADA) continue;
        const saldoCuota = cuota.amount - (cuota.amount_paid || 0);
        if (saldoCuota <= 0) continue;
        const abono = Math.min(montoRestante, saldoCuota);
        cuota.amount_paid = (cuota.amount_paid || 0) + abono;
        cuota.status = cuota.amount_paid >= cuota.amount ? ESTADO_PAGADA : ESTADO_PARCIAL;
        cuota.updated_at = new Date();
        guardarCuotaPorPagar(cuota);
        installmentIds.push(cuota.id);
        montoRestante -= abono;
    }
    // Guardar un registro de pago por cada método utilizado
    const primeraInstallmentId = installmentIds[0] || null;
    for (const metodo of _metodosTemp) {
        const obsTexto = (metodo.method === METODO_TRANSFERENCIA || metodo.method === METODO_CHEQUE) && metodo.banco
            ? `BANCO: ${metodo.banco}${metodo.obs ? ' | ' + metodo.obs : ''}`
            : (metodo.obs || `PAGO CUENTA ID ${cuenta.id}`);
        guardarPago({
            id: obtenerSiguienteId(cargarPagos()),
            installment_payable_id: primeraInstallmentId,
            purchase_id: null,
            amount: metodo.amount,
            payment_method: metodo.method,
            obs: obsTexto,
            created_at: new Date()
        });
    }
    guardarCuentaPorPagar(cuenta);
    // Limpiar y cerrar
    _metodosTemp.splice(0);
    _cuentaTemp = null;
    modalPagosMultiples.hide();
    cargarDatos();
    mensajeSuccess(`Pago de Gs. ${renderMoneda(montoTotal)} registrado correctamente. Cuotas actualizadas en orden correlativo.`);
}

function cargarDatos() {
    try { repararCuentasPorPagar(); } catch(e) { console.error('repararCuentasPorPagar:', e); }
    const metodo = document.getElementById('filtro_metodo').value;
    const fechaDesde = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta = document.getElementById('filtro_fecha_hasta').value;
    const pagosFiltrados = cargarPagos().filter(p => {
        // Excluir pagos de entrega inicial (compras al contado sin cuenta ni cuota)
        if (p.purchase_id && !p.installment_payable_id && !p.account_payable_id) return false;
        if (metodo && p.payment_method !== metodo) return false;
        if (fechaDesde && fechaDesde > toISOLocalDate(p.created_at)) return false;
        if (fechaHasta && fechaHasta < toISOLocalDate(p.created_at)) return false;
        return true;
    });
    cargarDataTable(tablaPagos, pagosFiltrados);
    const sumatoria = pagosFiltrados.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('suma_pagos').textContent = renderMoneda(sumatoria) + ' Gs.';
    // Si viene con ?cuenta_id= en la URL, abrir directamente el pago de esa cuenta
    const cuenta_id = parseInt(new URLSearchParams(window.location.search).get('cuenta_id'));
    if (cuenta_id) {
        window.history.replaceState({}, document.title, window.location.pathname);
        const cuenta = cargarCuentaPorPagar(cuenta_id);
        if (cuenta && cuenta.status !== ESTADO_PAGADA) {
            _cuentaTemp = cuenta;
            const { amount_paid, amount_due } = calcularCuentaPorPagar(cuenta.id);
            // Abrir directamente el modal de pagos múltiples
            _metodosTemp.splice(0);
            elemPagoStrongMontoPendiente.textContent = `Gs. ${renderMoneda(amount_due)}`;
            // Buscar la primera cuota pendiente para sugerir su saldo
            const cuotas = cargarCuotasPorPagar(cuenta.id)
                .sort((a, b) => a.installment_number - b.installment_number);
            let montoSugerido = amount_due;
            for (const c of cuotas) {
                if (c.status !== ESTADO_PAGADA) {
                    montoSugerido = c.amount - (c.amount_paid || 0);
                    break;
                }
            }
            elemPagoInputMontoTotal.value = montoSugerido;
            elemPagoInputMontoTotal.max = amount_due;
            elemPagoSelectMetodo.value = '';
            elemPagoInputPMMonto.value  = '';
            elemPagoInputReferencia.value = '';
            elemPagoDivBanco.classList.add('d-none');
            renderizarPagosMultiples();
            modalPagosMultiples.show();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.PAGOS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) document.getElementById('btnModalNuevo').style.display = 'none';
    cargarDatos();
});
