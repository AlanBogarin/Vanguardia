/* global bootstrap */
/**
 * @typedef {import('jquery')}
 * @typedef {import('./bd')}
 * @typedef {import('./alertas')}
 * @typedef {import('./tablas')}
 */

// ─── MODALES ────────────────────────────────────────────────────────────────
let _modalSeleccionarCuenta = null;
let _modalPagosMultiples    = null;

// ─── ESTADO TEMPORAL ────────────────────────────────────────────────────────
/** @type {CuentaPorPagar|null} */
let _cuentaTemp = null;

/** @type {{ method: string, banco: string, obs: string, amount: number }[]} */
const _metodosTemp = [];

// ─── TABLA DE PAGOS ─────────────────────────────────────────────────────────
const tablaPagos = crearDataTable("tabla_pagos", TABLAS.PAGO, {
    buttons: true,
    pageLength: 10,
    searching: true,
    exportTitle: "LISTADO DE PAGOS",
    actions: null
});

// ─── LABELS MÉTODOS ─────────────────────────────────────────────────────────
const METODO_LABELS = {
    EFECTIVO:       'Efectivo',
    TRANSFERENCIA:  'Transferencia Bancaria',
    TARJETA_CREDITO:'Tarjeta de Crédito',
    TARJETA_DEBITO: 'Tarjeta de Débito',
    CHEQUE:         'Cheque'
};

// ────────────────────────────────────────────────────────────────────────────
// PASO 1: Abrir modal de selección de cuenta
// ────────────────────────────────────────────────────────────────────────────
function ventanaNuevoPago() {
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) {
        mensajeError("No tienes permiso para crear pagos");
        return;
    }
    if (!_modalSeleccionarCuenta) {
        _modalSeleccionarCuenta = new bootstrap.Modal(document.getElementById('modalSeleccionarCuenta'));
    }

    // Limpiar estado previo
    document.getElementById('cuenta_id').value = '';
    document.getElementById('div_resumen_cuenta').classList.add('d-none');
    document.getElementById('btn_ir_pagar').disabled = true;
    _cuentaTemp = null;

    // Cargar cuentas pendientes en el select
    const selectCuenta = document.getElementById('cuenta_id');
    const cuentasPendientes = cargarCuentasPorPagar().filter(c => c.status !== ESTADO_PAGADA);
    selectCuenta.innerHTML = '<option value="">Seleccione una cuenta pendiente...</option>'
        + cuentasPendientes.map(c => {
            const prov = cargarProveedor(c.provider_id);
            return `<option value="${c.id}">
                ID ${c.id} — ${prov ? prov.legal_name : '?'} | Saldo: Gs. ${renderMoneda(c.amount_due)}
            </option>`;
        }).join('');

    _modalSeleccionarCuenta.show();
}

// ────────────────────────────────────────────────────────────────────────────
// Al cambiar la cuenta seleccionada: mostrar cuotas
// ────────────────────────────────────────────────────────────────────────────
function onchangeCuenta() {
    const cuentaId = parseInt(document.getElementById('cuenta_id').value);
    const divResumen = document.getElementById('div_resumen_cuenta');
    const btnPagar   = document.getElementById('btn_ir_pagar');

    divResumen.classList.add('d-none');
    btnPagar.disabled = true;
    _cuentaTemp = null;

    if (!cuentaId) return;

    const cuenta = cargarCuentaPorPagar(cuentaId);
    if (!cuenta || cuenta.status === ESTADO_PAGADA) return;

    _cuentaTemp = cuenta;

    const cuotas = cargarCuotasPorPagar(cuentaId)
        .sort((a, b) => a.installment_number - b.installment_number);

    const abonado = cuotas.reduce((s, c) => s + (c.amount_paid || 0), 0);
    const saldo   = cuenta.amount_total - abonado;

    document.getElementById('res_total').textContent   = `Gs. ${renderMoneda(cuenta.amount_total)}`;
    document.getElementById('res_abonado').textContent = `Gs. ${renderMoneda(abonado)}`;
    document.getElementById('res_saldo').textContent   = `Gs. ${renderMoneda(saldo)}`;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let foundFirstPending = false;
    const tbody = document.getElementById('tbody_cuotas_cuenta');
    tbody.innerHTML = cuotas.map(c => {
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

    divResumen.classList.remove('d-none');
    btnPagar.disabled = false;
}

// ────────────────────────────────────────────────────────────────────────────
// PASO 2: Abrir modal de pagos múltiples
// ────────────────────────────────────────────────────────────────────────────
function abrirModalPagosMultiples() {
    if (!_cuentaTemp) return;
    if (!_modalPagosMultiples) {
        _modalPagosMultiples = new bootstrap.Modal(document.getElementById('modalPagosMultiples'));
    }

    // Cerrar modal anterior sin destruirlo
    if (_modalSeleccionarCuenta) _modalSeleccionarCuenta.hide();

    // Limpiar estado
    _metodosTemp.splice(0);

    const saldoTotal = _cuentaTemp.amount_due;
    document.getElementById('pago_saldo_cuenta').textContent = `Gs. ${renderMoneda(saldoTotal)}`;
    
    // Buscar la primera cuota pendiente para sugerir su saldo como monto a pagar
    const cuotas = cargarCuotasPorPagar(_cuentaTemp.id)
        .sort((a, b) => a.installment_number - b.installment_number);
    let montoSugerido = saldoTotal;
    for (const c of cuotas) {
        if (c.status !== ESTADO_PAGADA) {
            montoSugerido = c.amount - (c.amount_paid || 0);
            break;
        }
    }

    document.getElementById('pago_monto_total').value = montoSugerido;
    document.getElementById('pago_monto_total').max   = saldoTotal;

    // Reset campos de método
    document.getElementById('pm_metodo').value = '';
    document.getElementById('pm_monto').value  = '';
    document.getElementById('pm_obs').value    = '';
    document.getElementById('div_pm_banco').classList.add('d-none');
    document.getElementById('pm_banco').value  = '';

    renderizarPagosMultiples();
    _modalPagosMultiples.show();
}

// ────────────────────────────────────────────────────────────────────────────
// Mostrar/ocultar selector de banco según método elegido
// ────────────────────────────────────────────────────────────────────────────
function onChangePMMetodo() {
    const metodo = document.getElementById('pm_metodo').value;
    const divBanco = document.getElementById('div_pm_banco');
    if (metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) {
        divBanco.classList.remove('d-none');
    } else {
        divBanco.classList.add('d-none');
        document.getElementById('pm_banco').value = '';
    }
    // Pre-llenar monto restante
    const montoTotal = parseInt(document.getElementById('pago_monto_total').value) || 0;
    const ingresado  = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const restante   = montoTotal - ingresado;
    if (restante > 0) document.getElementById('pm_monto').value = restante;
}

// ────────────────────────────────────────────────────────────────────────────
// Agregar un método de pago a la lista temporal
// ────────────────────────────────────────────────────────────────────────────
function agregarPagoMultiplePago() {
    const metodo = document.getElementById('pm_metodo').value;
    const banco  = document.getElementById('pm_banco').value.trim().toUpperCase();
    const monto  = parseInt(document.getElementById('pm_monto').value) || 0;
    const obs    = document.getElementById('pm_obs').value.trim().toUpperCase();

    const montoTotal = parseInt(document.getElementById('pago_monto_total').value) || 0;

    if (!metodo) {
        mensajeError('Seleccione el método de pago.');
        return;
    }
    if ((metodo === METODO_TRANSFERENCIA || metodo === METODO_CHEQUE) && !banco) {
        mensajeError('Debe seleccionar un banco para Transferencia o Cheque.');
        return;
    }
    if (monto <= 0) {
        mensajeError('El monto debe ser mayor a 0.');
        return;
    }
    if (montoTotal <= 0) {
        mensajeError('Primero defina el monto total a pagar en esta operación.');
        return;
    }

    const ingresado = _metodosTemp.reduce((s, m) => s + m.amount, 0);
    const restante  = montoTotal - ingresado;

    if (monto > restante) {
        mensajeError(`El monto excede el saldo restante de Gs. ${renderMoneda(restante)}.`);
        return;
    }

    _metodosTemp.push({ method: metodo, banco, obs, amount: monto });

    // Reset campos
    document.getElementById('pm_metodo').value = '';
    document.getElementById('pm_monto').value  = '';
    document.getElementById('pm_obs').value    = '';
    document.getElementById('pm_banco').value  = '';
    document.getElementById('div_pm_banco').classList.add('d-none');

    renderizarPagosMultiples();
}

// ────────────────────────────────────────────────────────────────────────────
// Sumar el saldo de la siguiente cuota al monto actual
// ────────────────────────────────────────────────────────────────────────────
function sumarSiguienteCuota() {
    if (!_cuentaTemp) return;
    const inputTotal = document.getElementById('pago_monto_total');
    const montoActual = parseFloat(inputTotal.value) || 0;
    
    const cuotas = cargarCuotasPorPagar(_cuentaTemp.id)
        .sort((a, b) => a.installment_number - b.installment_number);
        
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
        inputTotal.value = montoActual + montoASumar;
        renderizarPagosMultiples();
    } else {
        mensajeError("Ya has alcanzado el total de la deuda.");
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Quitar un método de la lista
// ────────────────────────────────────────────────────────────────────────────
function eliminarMetodoPago(index) {
    _metodosTemp.splice(index, 1);
    renderizarPagosMultiples();
}

// ────────────────────────────────────────────────────────────────────────────
// Renderizar tabla de métodos y actualizar totales
// ────────────────────────────────────────────────────────────────────────────
function renderizarPagosMultiples() {
    const montoTotal = parseInt(document.getElementById('pago_monto_total').value) || 0;
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
                    <button class="btn btn-sm btn-danger" onclick="eliminarMetodoPago(${i})">
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

// ────────────────────────────────────────────────────────────────────────────
// Cancelar modal de métodos de pago → volver a selección de cuenta
// ────────────────────────────────────────────────────────────────────────────
function cancelarPagoMultiple() {
    _metodosTemp.splice(0);
    if (_modalPagosMultiples) _modalPagosMultiples.hide();
    // Reabrir selección de cuenta si hay una cuenta cargada
    if (_cuentaTemp && _modalSeleccionarCuenta) {
        _modalSeleccionarCuenta.show();
    }
}

// ────────────────────────────────────────────────────────────────────────────
// PASO 3: Confirmar el pago
// ────────────────────────────────────────────────────────────────────────────
function confirmarPagoMultiple() {
    const montoTotal = parseInt(document.getElementById('pago_monto_total').value) || 0;
    const ingresado  = _metodosTemp.reduce((s, m) => s + m.amount, 0);

    if (!_cuentaTemp) {
        mensajeError('No hay cuenta seleccionada.');
        return;
    }
    if (montoTotal <= 0) {
        mensajeError('El monto a pagar debe ser mayor a 0.');
        return;
    }
    if (montoTotal > _cuentaTemp.amount_due) {
        mensajeError(`El monto (Gs. ${renderMoneda(montoTotal)}) excede el saldo pendiente (Gs. ${renderMoneda(_cuentaTemp.amount_due)}).`);
        return;
    }
    if (ingresado !== montoTotal) {
        mensajeError('El total de los métodos de pago no coincide con el monto a pagar.');
        return;
    }

    const cuenta = cargarCuentaPorPagar(_cuentaTemp.id);
    if (!cuenta) {
        mensajeError('No se pudo cargar la cuenta.');
        return;
    }

    // Actualizar totales de la cuenta
    cuenta.amount_paid = (cuenta.amount_paid || 0) + montoTotal;
    cuenta.amount_due  = cuenta.amount_total - cuenta.amount_paid;
    cuenta.status      = cuenta.amount_due <= 0 ? ESTADO_PAGADA : ESTADO_PARCIAL;
    cuenta.updated_at  = new Date();

    // Distribuir el monto entre cuotas pendientes de forma correlativa
    const cuotas = cargarCuotasPorPagar(cuenta.id)
        .sort((a, b) => a.installment_number - b.installment_number);

    let montoRestante = montoTotal;
    const installmentIds = []; // cuotas afectadas (para referencia en pagos)

    for (const cuota of cuotas) {
        if (montoRestante <= 0) break;
        if (cuota.status === ESTADO_PAGADA) continue;

        const saldoCuota = cuota.amount - (cuota.amount_paid || 0);
        if (saldoCuota <= 0) continue;

        const abono = Math.min(montoRestante, saldoCuota);
        cuota.amount_paid  = (cuota.amount_paid || 0) + abono;
        cuota.status       = cuota.amount_paid >= cuota.amount ? ESTADO_PAGADA : ESTADO_PARCIAL;
        cuota.updated_at   = new Date();
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
            id:                     obtenerSiguienteId(cargarPagos()),
            installment_payable_id: primeraInstallmentId,
            account_payable_id:     cuenta.id,
            purchase_id:            null,
            amount:                 metodo.amount,
            payment_method:         metodo.method,
            obs:                    obsTexto,
            created_at:             new Date()
        });
    }

    guardarCuentaPorPagar(cuenta);

    // Limpiar y cerrar
    _metodosTemp.splice(0);
    _cuentaTemp = null;
    if (_modalPagosMultiples) _modalPagosMultiples.hide();

    cargarDatos();
    mensajeSuccess(`Pago de Gs. ${renderMoneda(montoTotal)} registrado correctamente. Cuotas actualizadas en orden correlativo.`);
}

// ────────────────────────────────────────────────────────────────────────────
// FILTROS Y CARGA DE TABLA
// ────────────────────────────────────────────────────────────────────────────
function aplicarFiltros() {
    cargarDatos();
}

function limpiarFiltros() {
    document.getElementById('filtro_metodo').value     = '';
    document.getElementById('filtro_fecha_desde').value = '';
    document.getElementById('filtro_fecha_hasta').value = '';
    cargarDatos();
}

function cargarDatos() {
    const metodo     = document.getElementById('filtro_metodo').value;
    const fechaDesde = document.getElementById('filtro_fecha_desde').value;
    const fechaHasta = document.getElementById('filtro_fecha_hasta').value;

    const pagosFiltrados = cargarPagos().filter(p => {
        // Excluir pagos de entrega inicial (compras al contado / entrega de crédito sin cuota)
        if (p.account_payable_id === null && p.installment_payable_id === null && p.purchase_id !== null) return false;
        if (metodo && p.payment_method !== metodo) return false;
        if (fechaDesde && fechaDesde > (p.created_at || '').substring(0, 10)) return false;
        if (fechaHasta && fechaHasta < (p.created_at || '').substring(0, 10)) return false;
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
            // Abrir directamente el modal de pagos múltiples
            if (!_modalPagosMultiples) {
                _modalPagosMultiples = new bootstrap.Modal(document.getElementById('modalPagosMultiples'));
            }
            _metodosTemp.splice(0);
            document.getElementById('pago_saldo_cuenta').textContent = `Gs. ${renderMoneda(cuenta.amount_due)}`;
            
            // Buscar la primera cuota pendiente para sugerir su saldo
            const cuotas = cargarCuotasPorPagar(cuenta.id)
                .sort((a, b) => a.installment_number - b.installment_number);
            let montoSugerido = cuenta.amount_due;
            for (const c of cuotas) {
                if (c.status !== ESTADO_PAGADA) {
                    montoSugerido = c.amount - (c.amount_paid || 0);
                    break;
                }
            }

            document.getElementById('pago_monto_total').value = montoSugerido;
            document.getElementById('pago_monto_total').max   = cuenta.amount_due;
            document.getElementById('pm_metodo').value = '';
            document.getElementById('pm_monto').value  = '';
            document.getElementById('pm_obs').value    = '';
            document.getElementById('div_pm_banco').classList.add('d-none');
            renderizarPagosMultiples();
            _modalPagosMultiples.show();
        }
    }
}

// ────────────────────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!validarPermiso(PERMISOS.PAGOS_VER)) return;
    if (!tienePermisoSesion(PERMISOS.PAGOS_CREAR)) {
        document.getElementById('btnModalNuevo').style.display = 'none';
    }
    cargarDatos();
});
