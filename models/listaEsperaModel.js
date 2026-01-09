
const createConnection = require('../config/configDb');

class ListaEspera {


  static async listar() {
    const conn = await createConnection();
    const [rows] = await conn.query(`
      SELECT
        le.id,
        CONCAT(per.apellido, ', ', per.nombre) AS paciente,
        DATE_FORMAT(le.fecha_registro, '%d/%m/%Y') AS fecha_registro,
        CONCAT(pm.apellido, ', ', pm.nombre) AS medico,
        e.nombre AS especialidad,
        le.observaciones
      FROM lista_espera le
      JOIN pacientes p ON p.id = le.id_paciente
      JOIN personas per ON per.id = p.id_persona
      JOIN medicos m ON m.id_medico = le.id_medico
      JOIN personas pm ON pm.id = m.id_persona
      JOIN especialidades e ON e.id = le.id_especialidad
      ORDER BY le.fecha_registro DESC
    `);
    conn.end();
    return rows;
  }




  static async crear(data) {
    const conn = await createConnection();
    await conn.query(
      `INSERT INTO lista_espera (id_paciente, id_medico, id_especialidad, observaciones)
     VALUES (?, ?, ?, ?)`,
      [
        data.id_paciente,
        data.id_medico,
        data.id_especialidad,
        data.observaciones
      ]
    );
    conn.end();
  }


  static async eliminar(id) {
    const conn = await createConnection();
    await conn.query(`DELETE FROM lista_espera WHERE id = ?`, [id]);
    conn.end();
  }
}

module.exports = ListaEspera;
