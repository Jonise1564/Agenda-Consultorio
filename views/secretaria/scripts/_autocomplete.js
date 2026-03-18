/**
 * Lógica de Autocompletado y carga de especialidades
 */
const setupAutocomplete = (inputId, suggestionsId, hiddenId, urlPath, onSelect = null) => {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    const hidden = document.getElementById(hiddenId);
    let timeout;

    if (!input) return;

    input.addEventListener('input', () => {
        clearTimeout(timeout);
        const query = input.value.trim();
        if (query.length < 2) { suggestions.innerHTML = ''; return; }

        timeout = setTimeout(async () => {
            try {
                const res = await fetch(`${urlPath}?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                suggestions.innerHTML = data.filter(i => i.estado != 0).map(item => `
                <button type="button" class="list-group-item list-group-item-action py-2" 
                  data-id="${item.id_paciente || item.id_medico || item.id}" 
                  data-name="${item.nombre} ${item.apellido}"
                  data-dni="${item.dni || ''}">
                  ${item.nombre} ${item.apellido} ${item.dni ? `<small class="text-muted">(${item.dni})</small>` : ''}
                </button>`).join('');

                suggestions.querySelectorAll('button').forEach(btn => {
                    btn.onclick = () => {
                        input.value = btn.dataset.name;
                        hidden.value = btn.dataset.id;
                        if (hiddenId === 'pacienteId') {
                            const dniEl = document.getElementById('le_dni_paciente');
                            if (dniEl) dniEl.innerText = 'DNI: ' + btn.dataset.dni;
                        }
                        suggestions.innerHTML = '';
                        if (onSelect) onSelect(btn.dataset.id);
                        if (typeof window.buscarDisponibilidad === 'function') window.buscarDisponibilidad();
                    };
                });
            } catch (err) { console.error("Error en búsqueda:", err); }
        }, 300);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Autocomplete Médicos
    setupAutocomplete('buscarMedico', 'sugerenciasMedico', 'medicoId', '/medicos/buscar', async (id) => {
        const especialidadSelect = document.getElementById('especialidadSelect');
        especialidadSelect.disabled = false;
        const res = await fetch(`/medicos/${id}/especialidades`);
        const especialidades = await res.json();
        especialidadSelect.innerHTML = '<option value="" selected disabled>Selecciona especialidad</option>' +
            especialidades.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
    });

    // Autocomplete Pacientes
    setupAutocomplete('buscarPaciente', 'sugerenciasPaciente', 'pacienteId', '/pacientes/buscar');
});