const { z } = require('zod');

// ======================================================
// REUTILIZABLE: Preprocesadores para evitar errores 422
// ======================================================
const datePreprocess = z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date({ required_error: 'La fecha es obligatoria' }));

const arrayPreprocess = z.preprocess((val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
}, z.array(z.string().regex(/^\d+$/, 'Formato inválido')).optional());

// ======================================================
// MEDICO – CREATE
// ======================================================
const MedicoSchema = z.object({
    dni: z.string().regex(/^\d+$/, 'El DNI debe ser numérico'),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),
    fechaNacimiento: datePreprocess,
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    repeatPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    matricula: z.string().min(1, 'La matrícula es obligatoria'),
    especialidades: z.array(z.string().regex(/^\d+$/, 'Especialidad inválida')).min(1, 'Mínimo una especialidad'),
    telefonos: arrayPreprocess
}).refine(data => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword']
});

// ======================================================
// PACIENTE – CREATE
// ======================================================
const PacienteSchema = z.object({
    dni: z.preprocess((val) => String(val), z.string().regex(/^\d+$/, 'El DNI debe ser numérico')),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),
    fechaNacimiento: datePreprocess,
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    repeatPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    telefonos: arrayPreprocess,
    obra_sociales: z.string().min(1, 'La obra social es obligatoria')
}).refine(data => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword']
});

// ======================================================
// FUNCIONES DE VALIDACIÓN (EXPORTADAS)
// ======================================================

const validateMedicos = (input) => {
    const result = MedicoSchema.safeParse(input);
    if (!result.success) return result;
    return {
        success: true,
        data: {
            ...result.data,
            dni: Number(result.data.dni),
            especialidades: result.data.especialidades.map(Number),
            telefonos: result.data.telefonos?.map(Number) ?? []
        }
    };
};

const validatePacientes = (input) => {
    const result = PacienteSchema.safeParse(input);
    if (!result.success) return result;
    return {
        success: true,
        data: {
            ...result.data,
            dni: Number(result.data.dni),
            telefonos: result.data.telefonos?.map(Number) ?? []
        }
    };
};

const validatePartialMedicos = (input) => {
    return MedicoSchema.partial().safeParse(input);
};

const validatePartialPacientes = (input) => {
    return PacienteSchema.partial().safeParse(input);
};

module.exports = {
    validateMedicos,
    validatePartialMedicos,
    validatePacientes,
    validatePartialPacientes
};
