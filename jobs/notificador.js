const db = require('../config/configDb'); 
const { enviarRecordatorio24hs } = require('../services/emailService');
const moment = require('moment');

const procesarRecordatorios = async () => {
    try {
        // Obtenemos la fecha de mañana
        const mañana = moment().add(1, 'days').format('YYYY-MM-DD');

      
        const sql = `
            SELECT 
                t.id,
                t.hora_inicio,
                p.email, 
                p.nombre, 
                m.apellido as medico_nombre, 
                e.nombre as especialidad_nombre 
            FROM turnos t
            INNER JOIN pacientes p ON t.id_paciente = p.id
            INNER JOIN agendas a ON t.id_agenda = a.id
            INNER JOIN medicos m ON a.id_medico = m.id
            INNER JOIN especialidades e ON m.id_especialidad = e.id
            WHERE t.fecha = ? AND t.notificado = 0
        `;

        // Ejecutamos la consulta
        const [turnos] = await db.query(sql, [mañana]);

        console.log(`[Cron] ${new Date().toLocaleString()}: Encontrados ${turnos.length} turnos para mañana (${mañana}).`);

        for (const turno of turnos) {
            if (turno.email) {
                try {
                    // Enviamos el mail de recordatorio
                    await enviarRecordatorio24hs(turno.email, {
                        nombre: turno.nombre,
                        hora: turno.hora_inicio,
                        medico: turno.medico_nombre,
                        especialidad: turno.especialidad_nombre
                    });

                    // Marcamos como notificado en la DB
                    await db.query('UPDATE turnos SET notificado = 1 WHERE id = ?', [turno.id]);
                    
                    console.log(`   ✅ Recordatorio enviado a: ${turno.email}`);
                } catch (mailError) {
                    console.error(`   ❌ Error al enviar mail a ${turno.email}:`, mailError.message);
                }
            } else {
                console.log(`   ⚠️ El turno ID ${turno.id} no tiene email asociado.`);
            }
        }
    } catch (error) {
        console.error('[Cron Error General]:', error);
    }
};


module.exports = { procesarRecordatorios };