// const nodemailer = require('nodemailer');
// const ics = require('ics');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'yonikcc@gmail.com',
//         pass: 'vnzpwvrgbmuwyuit'
//     }
// });

// // --- FUNCIÓN 1: CONFIRMACIÓN (Al momento de crear el turno) ---
// const enviarConfirmacion = async (emailPaciente, datos) => {
//     const fechaObj = new Date(datos.fecha + 'T00:00:00');
//     const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });

//     const fmtFecha = datos.fecha.replace(/-/g, '');
//     const fmtHora = datos.hora.replace(/:/g, '') + '00';
//     const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Turno: ' + datos.especialidad)}&dates=${fmtFecha}T${fmtHora}/${fmtFecha}T${fmtHora}&details=${encodeURIComponent('Médico: ' + datos.medico + '\nMotivo: ' + datos.motivo)}&location=${encodeURIComponent('Consultorio Médico Central')}&sf=true&output=xml`;

//     const [year, month, day] = datos.fecha.split('-').map(Number);
//     const [hour, minute] = datos.hora.split(':').map(Number);

//     const { error, value } = ics.createEvent({
//         start: [year, month, day, hour, minute],
//         duration: { minutes: 30 },
//         title: `Turno: ${datos.especialidad} - ${datos.medico}`,
//         description: `Turno confirmado con el profesional ${datos.medico}. Motivo: ${datos.motivo}`,
//         location: 'Consultorio Médico Central',
//         status: 'CONFIRMED',
//         organizer: { name: 'Secretaría Médica', email: 'yonikcc@gmail.com' }
//     });

//     const mailOptions = {
//         from: '"Consultorio Médico" <yonikcc@gmail.com>',
//         to: emailPaciente,
//         subject: `✅ Turno Confirmado - ${datos.especialidad}`,
//         html: `
//             <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
//                 <div style="background-color: #007bff; padding: 25px; text-align: center;">
//                     <h1 style="color: white; margin: 0; font-size: 22px;">Confirmación de Turno</h1>
//                 </div>
//                 <div style="padding: 30px; color: #444; line-height: 1.6;">
//                     <p style="font-size: 16px;">Hola <strong>${datos.nombre}</strong>,</p>
//                     <p>Tu turno ha sido agendado correctamente:</p>
//                     <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
//                         <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//                         <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
//                         <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${datos.medico}</p>
//                         <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> ${datos.especialidad}</p>
//                     </div>
//                     <div style="text-align: center; margin: 30px 0;">
//                         <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #28a745; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">📅 Agendar en Google Calendar</a>
//                     </div>
//                 </div>
//             </div>
//         `,
//         attachments: [{ filename: 'invitacion-turno.ics', content: value, contentType: 'text/calendar; charset=utf-8', method: 'REQUEST' }]
//     };

//     return transporter.sendMail(mailOptions);
// };

// // --- FUNCIÓN 2: RECORDATORIO (Se llama desde el Cron Job) ---
// const enviarRecordatorio24hs = async (emailPaciente, datos) => {
//     const mailOptions = {
//         from: '"Recordatorio Médico" <yonikcc@gmail.com>',
//         to: emailPaciente,
//         subject: `⏰ Recordatorio: Turno Mañana - ${datos.especialidad}`,
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ffc107; border-radius: 12px; overflow: hidden;">
//                 <div style="background-color: #ffc107; padding: 20px; text-align: center;">
//                     <h2 style="color: #000; margin: 0;">Recordatorio de Turno</h2>
//                 </div>
//                 <div style="padding: 30px; color: #444;">
//                     <p>Hola <strong>${datos.nombre}</strong>,</p>
//                     <p>Te recordamos tu turno para <strong>mañana</strong>:</p>
//                     <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
//                         <p><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
//                         <p><strong>👨‍⚕️ Médico:</strong> ${datos.medico}</p>
//                         <p><strong>🩺 Especialidad:</strong> ${datos.especialidad}</p>
//                     </div>
//                     <p style="font-size: 13px; color: #666;">Si no puedes asistir, por favor responde a este correo para avisar.</p>
//                 </div>
//             </div>
//         `
//     };
//     return transporter.sendMail(mailOptions);
// };

// // --- EXPORTACIÓN (Ambas funciones al mismo nivel) ---
// module.exports = { enviarConfirmacion, enviarRecordatorio24hs };



const nodemailer = require('nodemailer');
const ics = require('ics');

// Configuración del transporte usando variables de entorno
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- FUNCIÓN 1: CONFIRMACIÓN (Al momento de crear el turno) ---
const enviarConfirmacion = async (emailPaciente, datos) => {
    // Manejo de fecha para evitar errores de zona horaria
    const fechaObj = new Date(datos.fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Formateo para enlaces y archivos de calendario
    const fmtFecha = datos.fecha.replace(/-/g, '');
    const fmtHora = datos.hora.replace(/:/g, '') + '00';
    
    // URL para agendar en Google Calendar rápidamente
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Turno: ' + datos.especialidad)}&dates=${fmtFecha}T${fmtHora}/${fmtFecha}T${fmtHora}&details=${encodeURIComponent('Médico: ' + datos.medico + '\nMotivo: ' + datos.motivo)}&location=${encodeURIComponent('Consultorio Médico Central')}&sf=true&output=xml`;

    // Generación de archivo de invitación .ics
    const [year, month, day] = datos.fecha.split('-').map(Number);
    const [hour, minute] = datos.hora.split(':').map(Number);

    const { error, value } = ics.createEvent({
        start: [year, month, day, hour, minute],
        duration: { minutes: 30 },
        title: `Turno: ${datos.especialidad} - ${datos.medico}`,
        description: `Turno confirmado con el profesional ${datos.medico}. Motivo: ${datos.motivo}`,
        location: 'Consultorio Médico Central',
        status: 'CONFIRMED',
        organizer: { name: 'Secretaría Médica', email: process.env.EMAIL_USER }
    });

    const mailOptions = {
        from: `"Consultorio Médico" <${process.env.EMAIL_USER}>`,
        to: emailPaciente,
        subject: `✅ Turno Confirmado - ${datos.especialidad}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background-color: #007bff; padding: 25px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">Confirmación de Turno</h1>
                </div>
                <div style="padding: 30px; color: #444; line-height: 1.6;">
                    <p style="font-size: 16px;">Hola <strong>${datos.nombre}</strong>,</p>
                    <p>Tu turno ha sido agendado correctamente desde la lista de espera:</p>
                    <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
                        <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${datos.medico}</p>
                        <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> ${datos.especialidad}</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #28a745; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">📅 Agendar en Google Calendar</a>
                    </div>
                    <p style="font-size: 12px; color: #888; text-align: center;">Adjuntamos una invitación de calendario a este correo.</p>
                </div>
            </div>
        `,
        attachments: value ? [{ 
            filename: 'invitacion-turno.ics', 
            content: value, 
            contentType: 'text/calendar; charset=utf-8', 
            method: 'REQUEST' 
        }] : []
    };

    return transporter.sendMail(mailOptions);
};

// --- FUNCIÓN 2: RECORDATORIO (Se llama desde el Cron Job) ---
const enviarRecordatorio24hs = async (emailPaciente, datos) => {
    const mailOptions = {
        from: `"Recordatorio Médico" <${process.env.EMAIL_USER}>`,
        to: emailPaciente,
        subject: `⏰ Recordatorio: Turno Mañana - ${datos.especialidad}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ffc107; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #ffc107; padding: 20px; text-align: center;">
                    <h2 style="color: #000; margin: 0;">Recordatorio de Turno</h2>
                </div>
                <div style="padding: 30px; color: #444;">
                    <p>Hola <strong>${datos.nombre}</strong>,</p>
                    <p>Te recordamos tu turno para <strong>mañana</strong>:</p>
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
                        <p><strong>👨‍⚕️ Médico:</strong> ${datos.medico}</p>
                        <p><strong>🩺 Especialidad:</strong> ${datos.especialidad}</p>
                    </div>
                    <p style="font-size: 13px; color: #666;">Si no puedes asistir, por favor contáctanos a la brevedad.</p>
                </div>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { enviarConfirmacion, enviarRecordatorio24hs };