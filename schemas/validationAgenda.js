// const { z } = require('zod');

// // ===========================================================
// // SCHEMA COMPLETO PARA CREAR AGENDA
// // ===========================================================
// const AgendaSchema = z.object({
//     fecha_creacion: z.date({
//         required_error: "La fecha de creación es obligatoria",
//         invalid_type_error: "La fecha debe ser un tipo Date válido"
//     }),

//     fecha_fin: z.date({
//         required_error: "La fecha fin es obligatoria",
//         invalid_type_error: "La fecha debe ser un tipo Date válido"
//     }),

//     hora_inicio: z.string({
//         required_error: "La hora inicio es obligatoria"
//     }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
//         message: "Formato de hora inválido (usar HH:MM)"
//     }),

//     hora_fin: z.string({
//         required_error: "La hora fin es obligatoria"
//     }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
//         message: "Formato de hora inválido (usar HH:MM)"
//     }),

//     limite_sobreturnos: z.number({
//         invalid_type_error: "El límite de sobreturnos debe ser un número",
//         required_error: "El límite de sobreturnos es obligatorio"
//     }),

//     duracion_turnos: z.number({
//         invalid_type_error: "La duración debe ser un número",
//         required_error: "La duración es obligatoria"
//     }),

//     nromatricula: z.number({
//         invalid_type_error: "La matrícula debe ser un número",
//         required_error: "La matrícula es obligatoria"
//     }),

//     id_sucursal: z.number({
//         invalid_type_error: "La sucursal debe ser un número",
//         required_error: "La sucursal es obligatoria"
//     }),

//     id_clasificacion: z.number({
//         invalid_type_error: "La clasificación debe ser un número",
//         required_error: "La clasificación es obligatoria"
//     })
// });


// // ===========================================================
// // FUNCIÓN DE VALIDACIÓN PARA STORE
// // ===========================================================
// const validateAgendas = (input) => {
//     // Convertimos manualmente los valores numéricos
//     const normalized = {
//         ...input,
//         limite_sobreturnos: Number(input.limite_sobreturnos),
//         duracion_turnos: Number(input.duracion_turnos),
//         nromatricula: Number(input.nromatricula),
//         id_sucursal: Number(input.id_sucursal),
//         id_clasificacion: Number(input.id_clasificacion),
//     };

//     const result = AgendaSchema.safeParse(normalized);

//     return result;
// };


// // ===========================================================
// // SCHEMA PARCIAL PARA UPDATE
// // ===========================================================
// const AgendasValidationSchema = z.object({
//     fecha_creacion: z.date().optional(),
//     fecha_fin: z.date().optional(),
//     hora_inicio: z.string().optional(),
//     hora_fin: z.string().optional(),
//     limite_sobreturnos: z.number().optional(),
//     duracion_turnos: z.number().optional(),
//     nromatricula: z.number().optional(),
//     id_sucursal: z.number().optional(),
//     id_clasificacion: z.number().optional(),
// });

// const validatePartialAgendas = (input) => {
//     // Normalizamos números igual que arriba
//     const normalized = { 
//         ...input,
//         limite_sobreturnos: input.limite_sobreturnos !== undefined ? Number(input.limite_sobreturnos) : undefined,
//         duracion_turnos: input.duracion_turnos !== undefined ? Number(input.duracion_turnos) : undefined,
//         nromatricula: input.nromatricula !== undefined ? Number(input.nromatricula) : undefined,
//         id_sucursal: input.id_sucursal !== undefined ? Number(input.id_sucursal) : undefined,
//         id_clasificacion: input.id_clasificacion !== undefined ? Number(input.id_clasificacion) : undefined,
//     };

//     return AgendasValidationSchema.safeParse(normalized);
// };

// module.exports = { validateAgendas, validatePartialAgendas };


const { z } = require('zod');

// ===========================================================
// SCHEMA COMPLETO PARA CREAR AGENDA
// ===========================================================
const AgendaSchema = z.object({
    fecha_creacion: z.date({
        required_error: "La fecha de creación es obligatoria",
        invalid_type_error: "La fecha debe ser un tipo Date válido"
    }),

    fecha_fin: z.date({
        required_error: "La fecha fin es obligatoria",
        invalid_type_error: "La fecha debe ser un tipo Date válido"
    }),

    hora_inicio: z.string({
        required_error: "La hora inicio es obligatoria"
    }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "Formato de hora inválido (usar HH:MM)"
    }),

    hora_fin: z.string({
        required_error: "La hora fin es obligatoria"
    }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "Formato de hora inválido (usar HH:MM)"
    }),

    limite_sobreturnos: z.number({
        invalid_type_error: "El límite de sobreturnos debe ser un número",
        required_error: "El límite de sobreturnos es obligatorio"
    }).int().min(0),

    duracion_turnos: z.number({
        invalid_type_error: "La duración debe ser un número",
        required_error: "La duración es obligatoria"
    }).int().positive(),

    id_medico: z.number({
        invalid_type_error: "El médico debe ser un número",
        required_error: "El médico es obligatorio"
    }).int().positive(),

    id_especialidad: z.number({
        invalid_type_error: "La especialidad debe ser un número",
        required_error: "La especialidad es obligatoria"
    }).int().positive(),

    id_sucursal: z.number({
        invalid_type_error: "La sucursal debe ser un número",
        required_error: "La sucursal es obligatoria"
    }).int().positive(),

    id_clasificacion: z.number({
        invalid_type_error: "La clasificación debe ser un número",
        required_error: "La clasificación es obligatoria"
    }).int().positive()
});

// ===========================================================
// FUNCIÓN DE VALIDACIÓN PARA STORE
// ===========================================================
const validateAgendas = (input) => {
    const normalized = {
        ...input,
        limite_sobreturnos: Number(input.limite_sobreturnos),
        duracion_turnos: Number(input.duracion_turnos),
        id_medico: Number(input.id_medico),
        id_especialidad: Number(input.id_especialidad),
        id_sucursal: Number(input.id_sucursal),
        id_clasificacion: Number(input.id_clasificacion),
    };

    return AgendaSchema.safeParse(normalized);
};

// ===========================================================
// SCHEMA PARCIAL PARA UPDATE
// ===========================================================
const AgendasValidationSchema = z.object({
    fecha_creacion: z.date().optional(),
    fecha_fin: z.date().optional(),
    hora_inicio: z.string().optional(),
    hora_fin: z.string().optional(),
    limite_sobreturnos: z.number().optional(),
    duracion_turnos: z.number().optional(),
    id_medico: z.number().optional(),
    id_especialidad: z.number().optional(),
    id_sucursal: z.number().optional(),
    id_clasificacion: z.number().optional(),
});

// ===========================================================
// VALIDACIÓN PARCIAL
// ===========================================================
const validatePartialAgendas = (input) => {
    const normalized = {
        ...input,
        limite_sobreturnos: input.limite_sobreturnos !== undefined ? Number(input.limite_sobreturnos) : undefined,
        duracion_turnos: input.duracion_turnos !== undefined ? Number(input.duracion_turnos) : undefined,
        id_medico: input.id_medico !== undefined ? Number(input.id_medico) : undefined,
        id_especialidad: input.id_especialidad !== undefined ? Number(input.id_especialidad) : undefined,
        id_sucursal: input.id_sucursal !== undefined ? Number(input.id_sucursal) : undefined,
        id_clasificacion: input.id_clasificacion !== undefined ? Number(input.id_clasificacion) : undefined,
    };

    return AgendasValidationSchema.safeParse(normalized);
};

module.exports = { validateAgendas, validatePartialAgendas };
