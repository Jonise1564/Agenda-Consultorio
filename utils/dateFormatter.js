
// ===============================
// NORMALIZAR FECHA A YYYY-MM-DD
// ===============================
const normalizarFecha = (fecha) => {
  // Si ya es string "YYYY-MM-DD"
  if (typeof fecha === 'string') {
    return fecha;
  }

  // Si es Date
  if (fecha instanceof Date) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  throw new Error('Formato de fecha inválido');
};

// ===============================
// FORMATEAR FECHA DD/MM/YYYY
// ===============================
const obtenerFechaFormateada = (fecha) => {
  const fechaStr = normalizarFecha(fecha);
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia}/${mes}/${anio}`;
};

// ===============================
// OBTENER DÍA DE LA SEMANA (LOCAL)
// ===============================
const obtenerDiaSemana = (fecha) => {
  const fechaStr = normalizarFecha(fecha);
  const [anio, mes, dia] = fechaStr.split('-').map(Number);

  const dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];

  // ⚠️ Date local (SIN UTC)
  const date = new Date(anio, mes - 1, dia);
  return dias[date.getDay()];
};

module.exports = {
  obtenerFechaFormateada,
  obtenerDiaSemana
};
