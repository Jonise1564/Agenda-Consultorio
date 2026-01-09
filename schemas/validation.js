



const { z } = require('zod');


// ======================================================
// MEDICO – CREATE
// ======================================================
const MedicoSchema = z.object({
    dni: z.string()
        .regex(/^\d+$/, 'El DNI debe ser numérico'),

    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),

    fechaNacimiento: z.date({
        required_error: 'La fecha de nacimiento es obligatoria'
    }),

    email: z.string().email('Formato de email inválido'),

    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),

    repeatPassword: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),

    matricula: z.string()
        .min(1, 'La matrícula es obligatoria'),

    // ✅ ARRAYS REALES
    especialidades: z.array(
        z.string().regex(/^\d+$/, 'Especialidad inválida')
    ).min(1, 'Debe seleccionar al menos una especialidad'),

    telefonos: z.array(
        z.string().regex(/^\d+$/, 'Teléfono inválido')
    ).optional()
})
.refine(data => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword']
});


// ======================================================
// MEDICO – UPDATE (PARCIAL)
// ======================================================
const MedicoUpdateSchema = z.object({
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    fechaNacimiento: z.date().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    repeatPassword: z.string().optional(),
    matricula: z.string().optional(),
    especialidades: z.array(z.number()).optional(),
    telefonos: z.array(z.number()).optional()
})
.refine(
    data => !data.password || data.password === data.repeatPassword,
    {
        message: 'Las contraseñas no coinciden',
        path: ['repeatPassword']
    }
);


// ======================================================
// PACIENTE – CREATE
// ======================================================
const PacienteSchema = z.object({
    dni: z.string()
        .regex(/^\d+$/, 'El DNI debe ser numérico'),

    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),

    fechaNacimiento: z.date({
        required_error: 'La fecha de nacimiento es obligatoria'
    }),

    email: z.string().email('Formato de email inválido'),

    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),

    repeatPassword: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),

    telefonos: z.array(
        z.string().regex(/^\d+$/, 'Teléfono inválido')
    ).optional(),

    obras_sociales: z.string().min(1, 'La obra social es obligatoria')
})
.refine(data => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword']
});


// ======================================================
// VALIDADORES EXPORTADOS
// ======================================================
const validateMedicos = (input) => {
    const result = MedicoSchema.safeParse(input);

    if (!result.success) {
        return result;
    }

    const data = result.data;

    return {
        success: true,
        data: {
            dni: Number(data.dni),
            nombre: data.nombre,
            apellido: data.apellido,
            fechaNacimiento: data.fechaNacimiento,
            email: data.email,
            password: data.password,
            repeatPassword: data.repeatPassword,
            matricula: data.matricula,
            especialidades: data.especialidades.map(Number),
            telefonos: data.telefonos?.map(Number) ?? []
        }
    };
};


const validatePartialMedicos = (input) => {
    return MedicoUpdateSchema.safeParse(input);
};


const validatePacientes = (input) => {
    const result = PacienteSchema.safeParse(input);

    if (!result.success) {
        return result;
    }

    const data = result.data;

    return {
        success: true,
        data: {
            dni: Number(data.dni),
            nombre: data.nombre,
            apellido: data.apellido,
            fechaNacimiento: data.fechaNacimiento,
            email: data.email,
            password: data.password,
            repeatPassword: data.repeatPassword,
            telefonos: data.telefonos?.map(Number) ?? [],
            obras_sociales: data.obras_sociales
        }
    };
};


const validatePartialPacientes = (input) => {
    return PacienteSchema.partial().safeParse(input);
};


// ======================================================
module.exports = {
    validateMedicos,
    validatePartialMedicos,
    validatePacientes,
    validatePartialPacientes
};

