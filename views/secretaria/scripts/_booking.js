/**
 * Lógica principal de gestión de turnos, disponibilidad y lista de espera
 */
document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha');
    const especialidadSelect = document.getElementById('especialidadSelect');
    const horaInput = document.getElementById('horaSeleccionadaInput');
    const btnGuardar = document.getElementById('btnGuardar');
    const slotsContainer = document.getElementById('slotsContainer');
    const legendContainer = document.getElementById('legendContainer');
    const mensajeVacio = document.getElementById('mensajeVacio');
    const checkSobreturno = document.getElementById('esSobreturno');
    const btnAbrirListaEspera = document.getElementById('btnAbrirListaEspera');
    const hoyISO = new Date().toLocaleDateString('sv-SE');

    if (fechaInput) fechaInput.setAttribute('min', hoyISO);

    // --- FUNCIÓN GLOBAL DE DISPONIBILIDAD ---
    window.buscarDisponibilidad = async function() {
        const id_medico = document.getElementById('medicoId').value;
        const id_especialidad = especialidadSelect.value;
        const id_paciente = document.getElementById('pacienteId').value;
        const fechaSeleccionada = fechaInput.value;

        if (!fechaSeleccionada) return;

        // Bloqueo fin de semana
        const dateObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = dateObj.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            fechaInput.value = '';
            resetDisponibilidad(false);
            return;
        }

        if (!id_medico || !id_especialidad) return;

        // Validar si ya tiene turno
        if (id_paciente) {
            try {
                const resDup = await fetch(`/secretaria/verificar-turno?id_paciente=${id_paciente}&id_medico=${id_medico}&id_especialidad=${id_especialidad}&fecha=${fechaSeleccionada}`);
                const dataDup = await resDup.json();
                if (dataDup.existe) {
                    resetDisponibilidad(true);
                    return Swal.fire({
                        title: 'Paciente con turno',
                        text: `El paciente ya tiene un turno agendado con este profesional para el día ${fechaSeleccionada}.`,
                        icon: 'warning',
                        confirmButtonColor: '#0d6efd'
                    });
                }
            } catch (err) { console.error(err); }
        }

        resetDisponibilidad(false);
        document.getElementById('loader').classList.remove('d-none');
        document.getElementById('instruccionInicial').classList.add('d-none');

        try {
            const res = await fetch(`/secretaria/disponibilidad?id_medico=${id_medico}&id_especialidad=${id_especialidad}&fecha=${fechaSeleccionada}`);
            const data = await res.json();
            document.getElementById('loader').classList.add('d-none');

            if (data.status === 'feriado') {
                slotsContainer.innerHTML = `<div class="alert alert-warning w-100 text-center border-0 shadow-sm p-4" style="border-radius: 15px;"><i class="fa-solid fa-umbrella-beach fs-1 mb-3 text-warning d-block"></i><h5 class="fw-bold">Día No Laborable</h5><hr class="opacity-25"><small class="text-muted">No es posible agendar turnos en feriados.</small></div>`;
                return;
            }

            if (data.status === 'success' && data.horarios.length > 0) {
                const ahora = new Date();
                const horaActualNum = (ahora.getHours() * 100) + ahora.getMinutes();
                legendContainer.classList.remove('d-none');

                slotsContainer.innerHTML = data.horarios.map(h => {
                    let esPasado = (fechaSeleccionada === hoyISO);
                    if (esPasado) {
                        const [hh, mm] = h.hora.split(':').map(Number);
                        esPasado = (hh * 100 + mm) <= horaActualNum;
                    }
                    return `<div class="slot-hora ${h.ocupado ? 'ocupado' : ''} ${esPasado ? 'disabled' : ''}" 
                        data-hora="${h.hora}" data-agenda="${h.id_agenda}" data-ocupado="${h.ocupado}" data-pasado="${esPasado}">
                        <span>${h.hora}</span>${h.ocupado ? '<span class="badge-ocupado">OCUPADO</span>' : ''}</div>`;
                }).join('');

                document.querySelectorAll('.slot-hora').forEach(slot => {
                    if (slot.dataset.pasado === "false") {
                        slot.addEventListener('click', () => validarSolapamiento(slot));
                    }
                });
            } else {
                mensajeVacio.classList.remove('d-none');
                btnAbrirListaEspera.classList.remove('d-none');
            }
        } catch (err) { document.getElementById('loader').classList.add('d-none'); }
    };

    async function validarSolapamiento(slotElement) {
        const id_paciente = document.getElementById('pacienteId').value;
        const fecha = fechaInput.value;
        const hora = slotElement.dataset.hora;

        if (!id_paciente) return proceedWithSelection(slotElement);

        try {
            const res = await fetch(`/secretaria/verificar-solapamiento?id_paciente=${id_paciente}&fecha=${fecha}&hora=${hora}`);
            const data = await res.json();
            if (data.solapado) {
                return Swal.fire({
                    title: 'Conflicto de Horario',
                    text: `El paciente ya tiene otro turno con el médico ${data.medico} a las ${hora}. ¿Desea continuar?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, agendar igual',
                    confirmButtonColor: '#ffc107'
                }).then((result) => { if (result.isConfirmed) proceedWithSelection(slotElement); });
            }
        } catch (e) { console.error(e); }
        proceedWithSelection(slotElement);
    }

    function proceedWithSelection(slotElement) {
        if (slotElement.dataset.ocupado === 'true') {
            Swal.fire({
                title: 'Horario Ocupado', text: "¿Desea agendar un SOBRETURNO?", icon: 'warning',
                showCancelButton: true, confirmButtonText: 'Sí, Sobreturno', confirmButtonColor: '#dc3545'
            }).then((result) => { if (result.isConfirmed) seleccionarSlot(slotElement, true); });
        } else { seleccionarSlot(slotElement, false); }
    }

    function seleccionarSlot(elemento, esSobre) {
        document.querySelectorAll('.slot-hora').forEach(s => s.classList.remove('selected'));
        elemento.classList.add('selected');
        horaInput.value = elemento.dataset.hora;
        document.getElementById('agendaIdHidden').value = elemento.dataset.agenda;
        checkSobreturno.checked = esSobre;
        checkSobreturno.disabled = !esSobre;
        btnGuardar.disabled = false;
    }

    function resetDisponibilidad(limpiarFecha = true) {
        if (limpiarFecha) fechaInput.value = '';
        slotsContainer.innerHTML = '';
        legendContainer.classList.add('d-none');
        mensajeVacio.classList.add('d-none');
        btnGuardar.disabled = true;
        horaInput.value = '--:--';
    }

    // --- EVENTOS ---
    if (especialidadSelect) especialidadSelect.addEventListener('change', window.buscarDisponibilidad);
    if (fechaInput) fechaInput.addEventListener('change', window.buscarDisponibilidad);

    // Formulario Reserva Submit
    const formReserva = document.getElementById('formReserva');
    if (formReserva) {
        formReserva.onsubmit = async function(e) {
            e.preventDefault();
            const esSobre = checkSobreturno.checked;
            const confirmacion = await Swal.fire({
                title: esSobre ? '¿Confirmar Sobreturno?' : '¿Confirmar Turno?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: esSobre ? '#dc3545' : '#0d6efd',
                confirmButtonText: 'Sí, confirmar'
            });

            if (confirmacion.isConfirmed) {
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                const response = await fetch(this.action, { method: 'POST', body: new FormData(this) });
                if (response.redirected) {
                    const status = new URL(response.url).searchParams.get('status');
                    if (status === 'success') {
                        Swal.fire('¡Éxito!', 'Turno agendado.', 'success').then(() => window.location.reload());
                    } else {
                        Swal.fire('Error', 'No se pudo agendar el turno.', 'error');
                    }
                }
            }
        };
    }

    // --- PREVISUALIZACIÓN IMAGEN ---
    const fotoInput = document.getElementById('fotoDocumento');
    if (fotoInput) {
        fotoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('imgPreview').src = e.target.result;
                    document.getElementById('previewContainer').classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    document.getElementById('removePreview')?.addEventListener('click', () => {
        fotoInput.value = '';
        document.getElementById('previewContainer').classList.add('d-none');
    });
});

// --- LISTA DE ESPERA ---
async function prepararListaEspera() {
    const idMed = document.getElementById('medicoId').value;
    const idPac = document.getElementById('pacienteId').value;
    const idEsp = document.getElementById('especialidadSelect').value;

    if (!idMed || !idPac || !idEsp) {
        Swal.fire('Atención', 'Selecciona Médico, Especialidad y Paciente primero.', 'info');
        return;
    }

    document.getElementById('le_id_medico').value = idMed;
    document.getElementById('le_id_paciente').value = idPac;
    document.getElementById('le_id_especialidad').value = idEsp;
    document.getElementById('le_nombre_medico').value = document.getElementById('buscarMedico').value;
    document.getElementById('le_nombre_especialidad').value = document.getElementById('especialidadSelect').options[document.getElementById('especialidadSelect').selectedIndex].text;
    document.getElementById('le_nombre_paciente').innerText = document.getElementById('buscarPaciente').value;

    const res = await fetch(`/secretaria/lista-espera/verificar?id_paciente=${idPac}&id_medico=${idMed}&id_especialidad=${idEsp}`);
    const data = await res.json();
    document.getElementById('alertaDuplicado').classList.toggle('d-none', !data.existe);
    document.getElementById('btnConfirmarLE').disabled = data.existe;

    new bootstrap.Modal(document.getElementById('modalListaEspera')).show();
}

document.getElementById('formListaEsperaModal')?.addEventListener('submit', function(e) {
    e.preventDefault();
    Swal.fire({ title: 'Registrando...', icon: 'success', timer: 1000, showConfirmButton: false, willClose: () => { this.submit(); } });
});