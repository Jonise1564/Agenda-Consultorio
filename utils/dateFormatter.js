// // // Función para formatear fechas en el formato día-mes-año
// // const obtenerFechaFormateada = (fecha) => {
// //     const dia = fecha.getDate().toString().padStart(2, '0');
// //     const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
// //     const anio = fecha.getFullYear();
// //     return `${dia}-${mes}-${anio}`;
// //   };
  
// //   module.exports = { obtenerFechaFormateada };
  

// // ===============================
// // FORMATEAR FECHA DD-MM-YYYY
// // ===============================
// // const obtenerFechaFormateada = (fecha) => {
// //   const dia = fecha.getDate().toString().padStart(2, '0');
// //   const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
// //   const anio = fecha.getFullYear();
// //   return `${dia}-${mes}-${anio}`;
// // };

// const obtenerFechaFormateada = (fecha) => {
//   const dia = fecha.getDate().toString().padStart(2, '0');
//   const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
//   const anio = fecha.getFullYear();
//   return `${dia}/${mes}/${anio}`;
// };


// // ===============================
// // OBTENER DÍA DE LA SEMANA
// // ===============================
// const obtenerDiaSemana = (fechaStr) => {
//   const dias = [
//     'Domingo',
//     'Lunes',
//     'Martes',
//     'Miércoles',
//     'Jueves',
//     'Viernes',
//     'Sábado'
//   ];

//   const fecha = new Date(fechaStr + 'T00:00:00');
//   return dias[fecha.getDay()];
// };

// module.exports = {
//   obtenerFechaFormateada,
//   obtenerDiaSemana
// };


// // ===============================
// // FORMATEAR FECHA DD/MM/YYYY
// // ===============================
// const obtenerFechaFormateada = (fechaStr) => {
//   // fechaStr = "YYYY-MM-DD"
//   const [anio, mes, dia] = fechaStr.split('-');
//   return `${dia}/${mes}/${anio}`;
// };

// // ===============================
// // OBTENER DÍA DE LA SEMANA (SIN UTC)
// // ===============================
// const obtenerDiaSemana = (fechaStr) => {
//   const dias = [
//     'Domingo',
//     'Lunes',
//     'Martes',
//     'Miércoles',
//     'Jueves',
//     'Viernes',
//     'Sábado'
//   ];

//   const [anio, mes, dia] = fechaStr.split('-').map(Number);

//   // Fecha creada en horario LOCAL
//   const fecha = new Date(anio, mes - 1, dia);

//   return dias[fecha.getDay()];
// };

// module.exports = {
//   obtenerFechaFormateada,
//   obtenerDiaSemana
// };

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
