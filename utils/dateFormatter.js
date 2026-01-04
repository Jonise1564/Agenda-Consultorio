// // Función para formatear fechas en el formato día-mes-año
// const obtenerFechaFormateada = (fecha) => {
//     const dia = fecha.getDate().toString().padStart(2, '0');
//     const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
//     const anio = fecha.getFullYear();
//     return `${dia}-${mes}-${anio}`;
//   };
  
//   module.exports = { obtenerFechaFormateada };
  

// ===============================
// FORMATEAR FECHA DD-MM-YYYY
// ===============================
const obtenerFechaFormateada = (fecha) => {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
};

// ===============================
// OBTENER DÍA DE LA SEMANA
// ===============================
const obtenerDiaSemana = (fechaStr) => {
  const dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];

  const fecha = new Date(fechaStr + 'T00:00:00');
  return dias[fecha.getDay()];
};

module.exports = {
  obtenerFechaFormateada,
  obtenerDiaSemana
};
