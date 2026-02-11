const createConnection = require('../config/configDb'); 
const { enviarRecordatorio24hs } = require('../services/emailService');
const moment = require('moment');

const procesarRecordatorios = async () => {
    let conn; 
    try {
        conn = await createConnection();

        // Obtenemos la fecha de mañana (YYYY-MM-DD)
        const mañana = moment().add(1, 'days').format('YYYY-MM-DD');

        const sql = `
            SELECT 
                t.id,
                t.hora_inicio,
                u.email, 
                p_per.nombre, 
                m_per.apellido as medico_nombre, 
                e.nombre as especialidad_nombre 
            FROM turnos t
            INNER JOIN pacientes p ON t.id_paciente = p.id
            INNER JOIN personas p_per ON p.id_persona = p_per.id
            INNER JOIN usuarios u ON p_per.id = u.id_persona
            INNER JOIN agendas a ON t.id_agenda = a.id
            INNER JOIN medicos m ON a.id_medico = m.id_medico
            INNER JOIN personas m_per ON m.id_persona = m_per.id
            INNER JOIN especialidades e ON a.id_especialidad = e.id
            WHERE t.fecha = ? AND t.notificado = 0 AND t.estado = 'Reservado'
        `;

        const [turnos] = await conn.query(sql, [mañana]);

        console.log(`[Cron] ${new Date().toLocaleString()}: Encontrados ${turnos.length} turnos para mañana (${mañana}).`);

        // Definimos los links para Whatsapp y la ubicacion  
        const linkWhatsapp = "https://wa.me/5492665034044";
        const linkUbicacion = "https://maps.google.com/?q=-33.295,-66.335"; 

        for (const turno of turnos) {
            if (turno.email) {
                try {
                    await enviarRecordatorio24hs(turno.email, {
                        nombre: turno.nombre,
                        hora: turno.hora_inicio,
                        medico: turno.medico_nombre,
                        especialidad: turno.especialidad_nombre,
                        // Pasamos los nuevos links al servicio de mail
                        linkWhatsapp: linkWhatsapp,
                        linkUbicacion: linkUbicacion
                    });

                    await conn.query('UPDATE turnos SET notificado = 1 WHERE id = ?', [turno.id]);
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
    } finally {
        if (conn) await conn.end();
    }
};

module.exports = { procesarRecordatorios };