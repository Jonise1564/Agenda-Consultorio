// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'yonikcc@gmail.com', // Tu correo
//         pass: 'vnzpwvrgbmuwyuit'             // Tu contraseña de aplicación (16 letras)
//     }
// });

// const enviarConfirmacion = async (emailPaciente, datos) => {
//     const mailOptions = {
//         from: '"Consultorio Médico" <tu-email-de-estudiante@gmail.com>',
//         to: emailPaciente,
//         subject: `Confirmación de Turno - ${datos.fecha}`,
//         html: `
//             <div style="font-family: Arial, sans-serif; color: #333;">
//                 <h2 style="color: #2c3e50;">¡Hola ${datos.nombre}!</h2>
//                 <p>Tu turno ha sido agendado correctamente en nuestro sistema.</p>
//                 <hr />
//                 <p><strong>Detalles del turno:</strong></p>
//                 <ul>
//                     <li><strong>Fecha:</strong> ${datos.fecha}</li>
//                     <li><strong>Hora:</strong> ${datos.hora}</li>
//                     <li><strong>Motivo:</strong> ${datos.motivo}</li>
//                 </ul>
//                 <p style="font-size: 0.9em; color: #7f8c8d;">Por favor, llegue 10 minutos antes de la hora señalada.</p>
//             </div>
//         `
//     };

//     return transporter.sendMail(mailOptions);
// };

// module.exports = { enviarConfirmacion };



// const nodemailer = require('nodemailer');
// const ics = require('ics');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'yonikcc@gmail.com',
//         pass: 'vnzpwvrgbmuwyuit'
//     }
// });

// const enviarConfirmacion = async (emailPaciente, datos) => {
//     // 1. Lógica para crear el evento de Calendario (.ics)
//     // Descomponemos la fecha (YYYY-MM-DD) y hora (HH:mm)
//     const [year, month, day] = datos.fecha.split('-').map(Number);
//     const [hour, minute] = datos.hora.split(':').map(Number);

//     const event = {
//         start: [year, month, day, hour, minute],
//         duration: { minutes: 30 }, // Duración estándar del turno
//         title: `Turno Médico: ${datos.motivo}`,
//         description: `Turno agendado el ${datos.fecha} a las ${datos.hora}. Por favor, asistir con DNI.`,
//         location: 'Consultorio Médico Central',
//         status: 'CONFIRMED',
//         busyStatus: 'BUSY',
//         organizer: { name: 'Secretaría Médica', email: 'yonikcc@gmail.com' }
//     };

//     const { error, value } = ics.createEvent(event);
//     if (error) {
//         console.error("Error al crear evento ICS:", error);
//     }

//     // 2. Definición del Mail 
//     const mailOptions = {
//         from: '"Secretaría Médica" <yonikcc@gmail.com>',
//         to: emailPaciente,
//         subject: `✅ Turno Confirmado - ${datos.fecha} ${datos.hora}hs`,
//         html: `
//             <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
//                 <div style="background-color: #007bff; padding: 20px; text-align: center;">
//                     <h1 style="color: white; margin: 0; font-size: 22px;">Confirmación de Turno</h1>
//                 </div>
//                 <div style="padding: 30px; color: #444;">
//                     <p style="font-size: 16px;">Hola <strong>${datos.nombre}</strong>,</p>
//                     <p>Tu turno ha sido agendado con éxito. Aquí tienes los detalles:</p>
                    
//                     <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
//                         <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${datos.fecha}</p>
//                         <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
//                         <p style="margin: 5px 0;"><strong>📝 Motivo:</strong> ${datos.motivo}</p>
//                     </div>

//                     <p style="font-size: 14px; color: #666;">Hemos adjuntado un archivo a este correo para que puedas agregar el turno a tu <strong>Google Calendar</strong> o <strong>Outlook</strong> automáticamente.</p>
//                 </div>
//                 <div style="background-color: #f1f3f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
//                     <p>Si no puedes asistir, por favor cancela con anticipación.<br>Este es un mensaje automático, no lo respondas.</p>
//                 </div>
//             </div>
//         `,
//         attachments: [
//             {
//                 filename: 'invitacion-turno.ics',
//                 content: value,
//                 contentType: 'text/calendar; charset=utf-8',
//                 method: 'REQUEST'
//             }
//         ]
//     };

//     return transporter.sendMail(mailOptions);
// };

// module.exports = { enviarConfirmacion };


// const nodemailer = require('nodemailer');
// const ics = require('ics');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'yonikcc@gmail.com',
//         pass: 'vnzpwvrgbmuwyuit'
//     }
// });

// const enviarConfirmacion = async (emailPaciente, datos) => {
//     // 1. Formatear la fecha a algo lindo (ej: miércoles, 28 de enero de 2026)
//     const fechaObj = new Date(datos.fecha + 'T00:00:00');
//     const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
//         weekday: 'long',
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });

//     // 2. Lógica para crear el evento de Calendario (.ics)
//     const [year, month, day] = datos.fecha.split('-').map(Number);
//     const [hour, minute] = datos.hora.split(':').map(Number);

//     const event = {
//         start: [year, month, day, hour, minute],
//         duration: { minutes: 30 },
//         title: `Turno: ${datos.especialidad} - ${datos.medico}`,
//         description: `Turno confirmado con el profesional ${datos.medico}. Motivo: ${datos.motivo}`,
//         location: 'Consultorio Médico Central',
//         status: 'CONFIRMED',
//         busyStatus: 'BUSY',
//         organizer: { name: 'Secretaría Médica', email: 'yonikcc@gmail.com' }
//     };

//     const { error, value } = ics.createEvent(event);

//     // 3. Definición del Mail con diseño mejorado y BOTÓN
//     const mailOptions = {
//         from: '"Secretaría Médica" <yonikcc@gmail.com>',
//         to: emailPaciente,
//         subject: `✅ Turno Confirmado: ${datos.especialidad}`,
//         html: `
//             <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
//                 <div style="background-color: #007bff; padding: 25px; text-align: center;">
//                     <h1 style="color: white; margin: 0; font-size: 22px;">Confirmación de Turno</h1>
//                 </div>
                
//                 <div style="padding: 30px; color: #444; line-height: 1.6;">
//                     <p style="font-size: 16px;">Hola <strong>${datos.nombre}</strong>,</p>
//                     <p>Tu turno ha sido agendado correctamente. Aquí tienes los detalles:</p>
                    
//                     <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
//                         <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
//                         <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
//                         <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${datos.medico}</p>
//                         <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> ${datos.especialidad}</p>
//                         <p style="margin: 5px 0;"><strong>📝 Motivo:</strong> ${datos.motivo}</p>
//                     </div>

//                     <div style="text-align: center; margin: 30px 0;">
//                         <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Haz clic abajo para abrir el recordatorio y guardarlo en tu agenda:</p>
//                         <div style="display: inline-block; padding: 12px 25px; background-color: #28a745; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px;">
//                             📌 Agendar en mi Calendario
//                         </div>
//                     </div>

//                     <p style="font-size: 13px; color: #888; text-align: center;">
//                         (Se ha adjuntado un archivo <strong>.ics</strong> compatible con Google Calendar, Outlook e iPhone)
//                     </p>
//                 </div>

//                 <div style="background-color: #f1f3f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e6ed;">
//                     <p style="margin: 0;">Si no puedes asistir, por favor avísanos con 24hs de antelación.</p>
//                     <p style="margin: 5px 0;"><strong>Consultorio Médico Central</strong></p>
//                 </div>
//             </div>
//         `,
//         attachments: [
//             {
//                 filename: 'invitacion-turno.ics',
//                 content: value,
//                 contentType: 'text/calendar; charset=utf-8',
//                 method: 'REQUEST'
//             }
//         ]
//     };

//     return transporter.sendMail(mailOptions);
// };

// module.exports = { enviarConfirmacion };


const nodemailer = require('nodemailer');
const ics = require('ics');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yonikcc@gmail.com',
        pass: 'vnzpwvrgbmuwyuit'
    }
});

const enviarConfirmacion = async (emailPaciente, datos) => {
    // 1. Formatear la fecha a formato humano
    const fechaObj = new Date(datos.fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // 2. Generar link para Google Calendar (Para que el botón FUNCIONE)
    const fmtFecha = datos.fecha.replace(/-/g, ''); // 20260128
    const fmtHora = datos.hora.replace(/:/g, '') + '00'; // Ejemplo: 083000
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Turno: ' + datos.especialidad)}&dates=${fmtFecha}T${fmtHora}/${fmtFecha}T${fmtHora}&details=${encodeURIComponent('Médico: ' + datos.medico + '\nMotivo: ' + datos.motivo)}&location=${encodeURIComponent('Consultorio Médico Central')}&sf=true&output=xml`;

    // 3. Crear el archivo de evento (.ics) para Outlook/iPhone
    const [year, month, day] = datos.fecha.split('-').map(Number);
    const [hour, minute] = datos.hora.split(':').map(Number);

    const { error, value } = ics.createEvent({
        start: [year, month, day, hour, minute],
        duration: { minutes: 30 },
        title: `Turno: ${datos.especialidad} - ${datos.medico}`,
        description: `Turno confirmado con el profesional ${datos.medico}. Motivo: ${datos.motivo}`,
        location: 'Consultorio Médico Central',
        status: 'CONFIRMED',
        organizer: { name: 'Secretaría Médica', email: 'yonikcc@gmail.com' }
    });

    // 4. Definición del Mail
    const mailOptions = {
        from: '"Consultorio Médico" <yonikcc@gmail.com>',
        to: emailPaciente,
        subject: `✅ Turno Confirmado - ${datos.especialidad}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e6ed; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background-color: #007bff; padding: 25px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">Confirmación de Turno</h1>
                </div>
                
                <div style="padding: 30px; color: #444; line-height: 1.6;">
                    <p style="font-size: 16px;">Hola <strong>${datos.nombre}</strong>,</p>
                    <p>Tu turno ha sido agendado correctamente. Aquí tienes los detalles:</p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${datos.hora} hs</p>
                        <p style="margin: 5px 0;"><strong>👨‍⚕️ Médico:</strong> ${datos.medico}</p>
                        <p style="margin: 5px 0;"><strong>🩺 Especialidad:</strong> ${datos.especialidad}</p>
                        <p style="margin: 5px 0;"><strong>📝 Motivo:</strong> ${datos.motivo}</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Haz clic en el botón para guardar en tu agenda de Google:</p>
                        <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #28a745; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                            📅 Agendar en Google Calendar
                        </a>
                    </div>

                    <p style="font-size: 12px; color: #999; text-align: center;">
                        Si usas Outlook o iPhone Mail, abre el archivo <strong>.ics</strong> adjunto.
                    </p>
                </div>

                <div style="background-color: #f1f3f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e6ed;">
                    <p style="margin: 0;">Si no puedes asistir, por favor avísanos con 24hs de antelación.</p>
                    <p style="margin: 5px 0;"><strong>Consultorio Médico Central</strong></p>
                </div>
            </div>
        `,
        attachments: [
            {
                filename: 'invitacion-turno.ics',
                content: value,
                contentType: 'text/calendar; charset=utf-8',
                method: 'REQUEST'
            }
        ]
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { enviarConfirmacion };