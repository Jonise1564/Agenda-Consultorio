-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-11-2024 a las 22:15:21
-- Versión del servidor: 10.4.24-MariaDB
-- Versión de PHP: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `agenda_consultorio`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `crear_agenda` (IN `p_limite_sobreturnos` INT, IN `p_fecha_creacion` DATE, IN `p_fecha_fin` DATE, IN `p_hora_inicio` TIME, IN `p_hora_fin` TIME, IN `p_duracion_turnos` INT, IN `p_matricula` INT, IN `p_id_sucursal` INT, IN `p_id_clasificacion` INT)   BEGIN
    DECLARE v_id_agenda INT;
    DECLARE v_fecha DATE;
    DECLARE v_hora TIME;
    DECLARE v_hora_actual TIME;
    DECLARE v_sobreturno INT;

    -- Insertar la nueva agenda
    INSERT INTO agendas (limite_sobreturnos, fecha_creacion, fecha_fin, hora_inicio, hora_fin, duracion_turnos, matricula, id_sucursal, id_clasificacion)
    VALUES (p_limite_sobreturnos, p_fecha_creacion, p_fecha_fin, p_hora_inicio, p_hora_fin, p_duracion_turnos, p_matricula, p_id_sucursal, p_id_clasificacion);

    SET v_id_agenda = LAST_INSERT_ID();
    SET v_fecha = p_fecha_creacion;

    -- Generar turnos para cada día dentro del rango de fechas
    WHILE v_fecha <= p_fecha_fin DO
        SET v_hora_actual = p_hora_inicio;

        -- Generar turnos dentro del rango de horas
        WHILE v_hora_actual < p_hora_fin DO
            -- Insertar turno principal
            INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
            VALUES (v_fecha, v_hora_actual, NULL, 'Libre', NULL, NULL, v_id_agenda);

            -- Insertar sobreturnos
            SET v_sobreturno = 1;
            WHILE v_sobreturno <= p_limite_sobreturnos DO
                INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
                VALUES (v_fecha, v_hora_actual, NULL, 'Sobreturno', v_sobreturno, NULL, v_id_agenda);
                SET v_sobreturno = v_sobreturno + 1;
            END WHILE;

            -- Incrementar la hora actual según la duración de los turnos
            SET v_hora_actual = ADDTIME(v_hora_actual, SEC_TO_TIME(p_duracion_turnos * 60));
        END WHILE;

        -- Incrementar la fecha
        SET v_fecha = DATE_ADD(v_fecha, INTERVAL 1 DAY);
    END WHILE;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eliminar_agenda` (IN `p_id_agenda` INT)   BEGIN
    -- Eliminar los turnos asociados a la agenda
    DELETE FROM turnos WHERE id_agenda = p_id_agenda;

    -- Eliminar la agenda
    DELETE FROM agendas WHERE id = p_id_agenda;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `modificar_agenda` (IN `p_id_agenda` INT, IN `p_limite_sobreturnos` INT, IN `p_fecha_creacion` DATE, IN `p_fecha_fin` DATE, IN `p_hora_inicio` TIME, IN `p_hora_fin` TIME, IN `p_duracion_turnos` INT, IN `p_matricula` INT, IN `p_id_sucursal` INT, IN `p_id_clasificacion` INT)   BEGIN
    DECLARE v_fecha DATE;
    DECLARE v_hora TIME;
    DECLARE v_hora_actual TIME;
    DECLARE v_sobreturno INT;

    -- Actualizar la agenda
    UPDATE agendas
    SET limite_sobreturnos = p_limite_sobreturnos,
        fecha_creacion = p_fecha_creacion,
        fecha_fin = p_fecha_fin,
        hora_inicio = p_hora_inicio,
        hora_fin = p_hora_fin,
        duracion_turnos = p_duracion_turnos,
        matricula = p_matricula,
        id_sucursal = p_id_sucursal,
        id_clasificacion = p_id_clasificacion
    WHERE id = p_id_agenda;

    -- Eliminar los turnos existentes de la agenda
    DELETE FROM turnos WHERE id_agenda = p_id_agenda;

    -- Generar nuevos turnos para la agenda modificada
    SET v_fecha = p_fecha_creacion;

    WHILE v_fecha <= p_fecha_fin DO
        SET v_hora_actual = p_hora_inicio;

        -- Generar turnos dentro del rango de horas
        WHILE v_hora_actual < p_hora_fin DO
            -- Insertar turno principal
            INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
            VALUES (v_fecha, v_hora_actual, NULL, 'Libre', NULL, NULL, p_id_agenda);

            -- Insertar sobreturnos
            SET v_sobreturno = 1;
            WHILE v_sobreturno <= p_limite_sobreturnos DO
                INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
                VALUES (v_fecha, v_hora_actual, NULL, 'Sobreturno', v_sobreturno, NULL, p_id_agenda);
                SET v_sobreturno = v_sobreturno + 1;
            END WHILE;

            -- Incrementar la hora actual según la duración de los turnos
            SET v_hora_actual = ADDTIME(v_hora_actual, SEC_TO_TIME(p_duracion_turnos * 60));
        END WHILE;

        -- Incrementar la fecha
        SET v_fecha = DATE_ADD(v_fecha, INTERVAL 1 DAY);
    END WHILE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agendas`
--

CREATE TABLE `agendas` (
  `id` int(11) NOT NULL,
  `limite_sobreturnos` int(11) NOT NULL,
  `fecha_creacion` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion_turnos` int(11) NOT NULL,
  `matricula` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `id_clasificacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `agendas`
--

INSERT INTO `agendas` (`id`, `limite_sobreturnos`, `fecha_creacion`, `fecha_fin`, `hora_inicio`, `hora_fin`, `duracion_turnos`, `matricula`, `id_sucursal`, `id_clasificacion`) VALUES
(1, 2, '2024-11-12', '2024-11-30', '08:00:00', '10:00:00', 30, 8402, 1, 1),
(8, 2, '2024-11-15', '2024-12-10', '08:00:00', '12:00:00', 30, 8100, 1, 1),
(9, 2, '2024-11-15', '2024-12-10', '08:00:00', '12:00:00', 30, 8100, 1, 1),
(10, 1, '2024-11-12', '2024-11-18', '08:00:00', '09:30:00', 30, 8104, 1, 1),
(11, 2, '2024-11-12', '2024-11-18', '08:00:00', '09:30:00', 30, 8777, 1, 1),
(12, 1, '2024-11-12', '2024-11-18', '08:00:00', '10:00:00', 30, 8405, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clasificaciones`
--

CREATE TABLE `clasificaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `clasificaciones`
--

INSERT INTO `clasificaciones` (`id`, `nombre`) VALUES
(2, 'Especial'),
(1, 'Normal'),
(3, 'Vip');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dias_disponibles`
--

CREATE TABLE `dias_disponibles` (
  `id_agenda` int(11) NOT NULL,
  `dia` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dias_no_laborables`
--

CREATE TABLE `dias_no_laborables` (
  `id` int(11) NOT NULL,
  `dia` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `dias_no_laborables`
--

INSERT INTO `dias_no_laborables` (`id`, `dia`) VALUES
(1, '2024-01-01'),
(2, '2024-02-12'),
(3, '2024-02-13'),
(4, '2024-03-24'),
(5, '2024-03-29'),
(6, '2024-04-02'),
(7, '2024-05-01'),
(8, '2024-05-25'),
(9, '2024-06-17'),
(10, '2024-06-20'),
(11, '2024-07-09'),
(12, '2024-08-17'),
(13, '2024-10-12'),
(14, '2024-11-20'),
(15, '2024-12-08'),
(16, '2024-12-25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `especialidades`
--

INSERT INTO `especialidades` (`id`, `nombre`, `estado`) VALUES
(1, 'Cardiología', 0),
(2, 'Dermatología', 0),
(3, 'Endocrinología', 0),
(4, 'Gastroenterología', 0),
(5, 'Geriatría', 0),
(6, 'Hematología', 0),
(7, 'Infectología', 0),
(8, 'Nefrología', 0),
(9, 'Neurología', 0),
(10, 'Oncología', 0),
(11, 'Pediatría', 0),
(12, 'Psiquiatría', 0),
(13, 'Reumatología', 0),
(14, 'Urología', 0),
(15, 'Oftalmología', 0),
(16, 'General', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos`
--

CREATE TABLE `medicos` (
  `id_usuario` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `medicos`
--

INSERT INTO `medicos` (`id_usuario`, `estado`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(48, 1),
(49, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medico_especialidad`
--

CREATE TABLE `medico_especialidad` (
  `id_medico` int(11) NOT NULL,
  `id_especialidad` int(11) NOT NULL,
  `matricula` int(11) NOT NULL,
  `estado` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `medico_especialidad`
--

INSERT INTO `medico_especialidad` (`id_medico`, `id_especialidad`, `matricula`, `estado`) VALUES
(1, 16, 8100, 1),
(2, 16, 8101, 1),
(3, 13, 8102, 1),
(4, 14, 8103, 1),
(5, 16, 8104, 1),
(6, 16, 8105, 1),
(33, 1, 8106, 1),
(34, 2, 8107, 1),
(35, 3, 8108, 1),
(36, 4, 8109, 1),
(7, 11, 8110, 1),
(8, 12, 8111, 1),
(9, 15, 8112, 1),
(10, 11, 8113, 1),
(37, 5, 8114, 1),
(38, 6, 8115, 1),
(39, 7, 8116, 1),
(40, 8, 8117, 1),
(41, 9, 8118, 1),
(42, 10, 8119, 1),
(33, 16, 8401, 1),
(34, 16, 8402, 1),
(35, 16, 8403, 0),
(36, 16, 8404, 1),
(37, 16, 8405, 0),
(33, 4, 8777, 1),
(48, 16, 8910, 0),
(49, 16, 8915, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medico_obra_social`
--

CREATE TABLE `medico_obra_social` (
  `id` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `id_obra_social` int(11) NOT NULL,
  `estado` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `medico_obra_social`
--

INSERT INTO `medico_obra_social` (`id`, `id_medico`, `id_obra_social`, `estado`) VALUES
(1, 1, 2, 1),
(2, 2, 3, 1),
(3, 3, 4, 1),
(4, 4, 2, 1),
(5, 5, 3, 1),
(6, 6, 4, 1),
(7, 7, 2, 1),
(8, 8, 3, 1),
(9, 9, 4, 1),
(10, 10, 2, 1),
(11, 33, 3, 1),
(12, 34, 4, 1),
(13, 35, 2, 1),
(14, 36, 3, 1),
(15, 37, 1, 1),
(16, 38, 1, 1),
(17, 39, 1, 1),
(18, 40, 1, 1),
(19, 41, 1, 1),
(20, 42, 1, 1),
(21, 1, 1, 1),
(22, 2, 1, 1),
(23, 3, 1, 1),
(24, 4, 1, 1),
(25, 34, 1, 1),
(26, 35, 1, 1),
(27, 36, 1, 0),
(28, 37, 1, 0),
(29, 38, 1, 0),
(30, 33, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obras_sociales`
--

CREATE TABLE `obras_sociales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `estado` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `obras_sociales`
--

INSERT INTO `obras_sociales` (`id`, `nombre`, `descripcion`, `direccion`, `estado`) VALUES
(1, 'Sin Obra Social', NULL, NULL, 1),
(2, 'Dosep', 'Cobertura Media', 'Calle Callejera 221', 1),
(3, 'Pami', 'Cobertura Básica', 'Av. Avenidera 331', 1),
(4, 'Sancor', 'Cobertura Básica', 'Av. Laboratorio 112', 1),
(5, 'Swiss Medical', 'Swiss Medical', 'Junin 9001', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `dni` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_obra_social` int(11) NOT NULL,
  `estado` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`dni`, `id_usuario`, `id_obra_social`, `estado`) VALUES
(1345678, 20, 3, 1),
(1456789, 30, 2, 1),
(7766776, 54, 1, 1),
(11234567, 11, 2, 1),
(11345678, 21, 4, 1),
(11456789, 31, 2, 1),
(21234567, 12, 1, 1),
(21345678, 22, 4, 1),
(21456789, 32, 3, 1),
(31234567, 13, 1, 1),
(41234567, 14, 1, 1),
(41345678, 24, 4, 1),
(51234567, 15, 2, 1),
(51345678, 25, 4, 1),
(61234567, 16, 2, 1),
(61345678, 26, 1, 1),
(71234567, 17, 2, 1),
(71345678, 27, 1, 1),
(81234567, 18, 2, 1),
(81345678, 28, 1, 1),
(91234567, 19, 3, 1),
(91345678, 29, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `dni` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nacimiento` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`dni`, `nombre`, `apellido`, `nacimiento`) VALUES
(123233, 'Prueba', 'Prueba', '2000-02-02'),
(667766, 'rufian', 'rufini', '2002-02-02'),
(783722, 'Julini', 'Flores', '2004-06-01'),
(888998, 'Melany', 'Lucero', '2003-05-01'),
(1230023, 'PruebaFInal', 'pruebaa', '2001-01-01'),
(1234567, 'Sofía', 'Escobar', '1999-10-12'),
(1236660, 'Prueba', 'Prueba', '2002-02-02'),
(1345678, 'Patricia', 'Cruz', '2009-08-20'),
(1456789, 'Carmen', 'Peña', '2019-06-30'),
(3216660, 'colega', 'colega', '1999-02-02'),
(3426660, 'drCongo', 'Flores', '2002-02-02'),
(3436660, 'drCongo', 'Flores', '2002-02-02'),
(3456660, 'drCongo', 'Flores', '2002-02-02'),
(7766776, 'Leon', 'Leonel', '2002-02-02'),
(7776660, 'drCongoBongo', 'Flores', '1990-01-01'),
(11234567, 'Pedro', 'Flores', '2003-11-11'),
(11345678, 'Ricardo', 'Jiménez', '2010-09-21'),
(11456789, 'Hugo', 'Suárez', '2020-07-31'),
(12121234, 'DrPrueba', 'pruebin', '2002-02-02'),
(12345678, 'Juan', 'Pérez', '1990-01-01'),
(12641257, 'Jose', 'Basco', '1970-10-12'),
(13352175, 'Paola', 'Fernandez', '1981-03-12'),
(14343464, 'Miguel', 'Martines', '1975-02-12'),
(15334346, 'Carlos', 'Montero', '1988-05-12'),
(16325635, 'Manuel', 'Montiel', '1997-06-12'),
(17316553, 'Jessica', 'Maldonado', '1969-07-12'),
(18307842, 'Jazmín', 'Gutierres', '1983-11-12'),
(19398724, 'Sandra', 'Dorado', '1976-12-12'),
(20389031, 'Julian', 'Bazan', '1985-09-12'),
(21234567, 'Lucía', 'Ramos', '2001-12-12'),
(21345678, 'Isabel', 'Ruiz', '2011-10-22'),
(21370913, 'Maria', 'Salomon', '1984-10-12'),
(21456789, 'Alicia', 'Romero', '2021-08-01'),
(22222222, 'Morito', 'Lucero', '2002-02-22'),
(23456789, 'María', 'García', '1991-02-02'),
(31234567, 'Diego', 'Díaz', '2002-01-13'),
(31345678, 'Roberto', 'Navarro', '2012-11-23'),
(34567890, 'Carlos', 'Rodríguez', '1992-03-03'),
(41234567, 'Marta', 'Morales', '2003-02-14'),
(41345678, 'Gabriela', 'Rojas', '2013-12-24'),
(45678901, 'Ana', 'Martínez', '1993-04-04'),
(51234567, 'Raúl', 'Ortega', '2004-03-15'),
(51345678, 'Francisco', 'Molina', '2014-01-25'),
(56789012, 'Luis', 'López', '1994-05-05'),
(61234567, 'Valeria', 'Castro', '2005-04-16'),
(61345678, 'Claudia', 'Silva', '2015-02-26'),
(66666660, 'congobongogo', 'flores', '1992-02-02'),
(67890123, 'Elena', 'González', '1995-06-06'),
(71234567, 'Andrés', 'Vega', '2006-05-17'),
(71345678, 'Albert', 'Ortiza', '2016-03-27'),
(78901234, 'Miguel', 'Sánchez', '1996-07-07'),
(81234567, 'Natalia', 'Mendoza', '2007-06-18'),
(81345678, 'Verónica', 'Iglesias', '2017-04-28'),
(89012345, 'Laura', 'Fernández', '1997-08-08'),
(90123456, 'Jorge', 'Ramírez', '1998-09-09'),
(91234567, 'Fernando', 'Herrera', '2008-07-19'),
(91345678, 'Daniel', 'Soto', '2018-05-29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'Admin'),
(3, 'Admisión '),
(4, 'Paciente'),
(2, 'Profesional');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursales`
--

CREATE TABLE `sucursales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `ciudad` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `sucursales`
--

INSERT INTO `sucursales` (`id`, `nombre`, `direccion`, `ciudad`) VALUES
(1, 'Clinica Argentina', 'Av. Argentina y Calle Lionel Messi', 'San Luis'),
(2, 'Clinica España', 'Av. España 123', 'Juana Koslay');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telefonos`
--

CREATE TABLE `telefonos` (
  `id_usuario` int(11) NOT NULL,
  `numero` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `telefonos`
--

INSERT INTO `telefonos` (`id_usuario`, `numero`) VALUES
(1, 24345678),
(1, 1543450033),
(2, 24544332),
(2, 154547773),
(3, 64102938),
(3, 154106662),
(4, 64304958),
(5, 64101918),
(6, 154564738),
(7, 154381065),
(8, 154119988),
(9, 154110066),
(10, 66123456),
(10, 154124433),
(11, 66234567),
(11, 154231133),
(12, 154762727),
(12, 2147483647),
(13, 64433221),
(13, 154430010),
(14, 64293847),
(15, 64405968),
(16, 64291038),
(17, 1230504),
(18, 1230403),
(19, 1230302),
(20, 1230909),
(21, 1230707),
(22, 1230505),
(24, 1230303),
(25, 1230202),
(26, 1230101),
(27, 1230908),
(28, 1230807),
(29, 1230605),
(30, 1230808),
(31, 1230606),
(32, 1230404),
(33, 66456789),
(33, 154452232),
(34, 66567890),
(34, 1544567777),
(35, 24677889),
(35, 154679900),
(36, 64789012),
(36, 154789292),
(37, 64899012),
(37, 154898873),
(38, 64900112),
(38, 154902211),
(39, 24099887),
(39, 154408844),
(40, 64988776),
(40, 154983342),
(41, 24877665),
(41, 154873232),
(42, 24655443),
(42, 154658383),
(48, 2314412),
(49, 233000),
(54, 8844488);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE `turnos` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `motivo` varchar(250) DEFAULT NULL,
  `estado` varchar(100) NOT NULL,
  `orden` int(11) DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_agenda` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `turnos`
--

INSERT INTO `turnos` (`id`, `fecha`, `hora_inicio`, `motivo`, `estado`, `orden`, `id_paciente`, `id_agenda`) VALUES
(4, '2024-11-15', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(5, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(6, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(7, '2024-11-15', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(8, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(9, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(10, '2024-11-15', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(11, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(12, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(13, '2024-11-15', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(14, '2024-11-15', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(15, '2024-11-15', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(16, '2024-11-15', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(17, '2024-11-15', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(18, '2024-11-15', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(19, '2024-11-15', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(20, '2024-11-15', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(21, '2024-11-15', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(22, '2024-11-15', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(23, '2024-11-15', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(24, '2024-11-15', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(25, '2024-11-15', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(26, '2024-11-15', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(27, '2024-11-15', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(28, '2024-11-16', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(29, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(30, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(31, '2024-11-16', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(32, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(33, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(34, '2024-11-16', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(35, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(36, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(37, '2024-11-16', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(38, '2024-11-16', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(39, '2024-11-16', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(40, '2024-11-16', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(41, '2024-11-16', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(42, '2024-11-16', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(43, '2024-11-16', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(44, '2024-11-16', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(45, '2024-11-16', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(46, '2024-11-16', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(47, '2024-11-16', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(48, '2024-11-16', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(49, '2024-11-16', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(50, '2024-11-16', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(51, '2024-11-16', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(52, '2024-11-17', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(53, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(54, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(55, '2024-11-17', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(56, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(57, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(58, '2024-11-17', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(59, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(60, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(61, '2024-11-17', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(62, '2024-11-17', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(63, '2024-11-17', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(64, '2024-11-17', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(65, '2024-11-17', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(66, '2024-11-17', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(67, '2024-11-17', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(68, '2024-11-17', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(69, '2024-11-17', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(70, '2024-11-17', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(71, '2024-11-17', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(72, '2024-11-17', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(73, '2024-11-17', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(74, '2024-11-17', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(75, '2024-11-17', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(76, '2024-11-18', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(77, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(78, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(79, '2024-11-18', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(80, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(81, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(82, '2024-11-18', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(83, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(84, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(85, '2024-11-18', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(86, '2024-11-18', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(87, '2024-11-18', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(88, '2024-11-18', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(89, '2024-11-18', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(90, '2024-11-18', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(91, '2024-11-18', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(92, '2024-11-18', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(93, '2024-11-18', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(94, '2024-11-18', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(95, '2024-11-18', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(96, '2024-11-18', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(97, '2024-11-18', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(98, '2024-11-18', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(99, '2024-11-18', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(100, '2024-11-19', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(101, '2024-11-19', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(102, '2024-11-19', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(103, '2024-11-19', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(104, '2024-11-19', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(105, '2024-11-19', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(106, '2024-11-19', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(107, '2024-11-19', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(108, '2024-11-19', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(109, '2024-11-19', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(110, '2024-11-19', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(111, '2024-11-19', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(112, '2024-11-19', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(113, '2024-11-19', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(114, '2024-11-19', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(115, '2024-11-19', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(116, '2024-11-19', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(117, '2024-11-19', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(118, '2024-11-19', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(119, '2024-11-19', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(120, '2024-11-19', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(121, '2024-11-19', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(122, '2024-11-19', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(123, '2024-11-19', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(124, '2024-11-20', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(125, '2024-11-20', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(126, '2024-11-20', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(127, '2024-11-20', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(128, '2024-11-20', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(129, '2024-11-20', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(130, '2024-11-20', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(131, '2024-11-20', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(132, '2024-11-20', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(133, '2024-11-20', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(134, '2024-11-20', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(135, '2024-11-20', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(136, '2024-11-20', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(137, '2024-11-20', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(138, '2024-11-20', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(139, '2024-11-20', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(140, '2024-11-20', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(141, '2024-11-20', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(142, '2024-11-20', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(143, '2024-11-20', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(144, '2024-11-20', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(145, '2024-11-20', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(146, '2024-11-20', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(147, '2024-11-20', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(148, '2024-11-21', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(149, '2024-11-21', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(150, '2024-11-21', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(151, '2024-11-21', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(152, '2024-11-21', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(153, '2024-11-21', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(154, '2024-11-21', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(155, '2024-11-21', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(156, '2024-11-21', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(157, '2024-11-21', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(158, '2024-11-21', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(159, '2024-11-21', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(160, '2024-11-21', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(161, '2024-11-21', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(162, '2024-11-21', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(163, '2024-11-21', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(164, '2024-11-21', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(165, '2024-11-21', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(166, '2024-11-21', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(167, '2024-11-21', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(168, '2024-11-21', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(169, '2024-11-21', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(170, '2024-11-21', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(171, '2024-11-21', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(172, '2024-11-22', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(173, '2024-11-22', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(174, '2024-11-22', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(175, '2024-11-22', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(176, '2024-11-22', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(177, '2024-11-22', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(178, '2024-11-22', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(179, '2024-11-22', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(180, '2024-11-22', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(181, '2024-11-22', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(182, '2024-11-22', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(183, '2024-11-22', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(184, '2024-11-22', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(185, '2024-11-22', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(186, '2024-11-22', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(187, '2024-11-22', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(188, '2024-11-22', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(189, '2024-11-22', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(190, '2024-11-22', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(191, '2024-11-22', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(192, '2024-11-22', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(193, '2024-11-22', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(194, '2024-11-22', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(195, '2024-11-22', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(196, '2024-11-23', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(197, '2024-11-23', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(198, '2024-11-23', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(199, '2024-11-23', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(200, '2024-11-23', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(201, '2024-11-23', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(202, '2024-11-23', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(203, '2024-11-23', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(204, '2024-11-23', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(205, '2024-11-23', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(206, '2024-11-23', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(207, '2024-11-23', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(208, '2024-11-23', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(209, '2024-11-23', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(210, '2024-11-23', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(211, '2024-11-23', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(212, '2024-11-23', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(213, '2024-11-23', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(214, '2024-11-23', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(215, '2024-11-23', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(216, '2024-11-23', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(217, '2024-11-23', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(218, '2024-11-23', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(219, '2024-11-23', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(220, '2024-11-24', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(221, '2024-11-24', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(222, '2024-11-24', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(223, '2024-11-24', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(224, '2024-11-24', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(225, '2024-11-24', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(226, '2024-11-24', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(227, '2024-11-24', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(228, '2024-11-24', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(229, '2024-11-24', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(230, '2024-11-24', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(231, '2024-11-24', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(232, '2024-11-24', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(233, '2024-11-24', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(234, '2024-11-24', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(235, '2024-11-24', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(236, '2024-11-24', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(237, '2024-11-24', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(238, '2024-11-24', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(239, '2024-11-24', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(240, '2024-11-24', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(241, '2024-11-24', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(242, '2024-11-24', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(243, '2024-11-24', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(244, '2024-11-25', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(245, '2024-11-25', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(246, '2024-11-25', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(247, '2024-11-25', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(248, '2024-11-25', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(249, '2024-11-25', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(250, '2024-11-25', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(251, '2024-11-25', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(252, '2024-11-25', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(253, '2024-11-25', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(254, '2024-11-25', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(255, '2024-11-25', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(256, '2024-11-25', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(257, '2024-11-25', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(258, '2024-11-25', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(259, '2024-11-25', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(260, '2024-11-25', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(261, '2024-11-25', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(262, '2024-11-25', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(263, '2024-11-25', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(264, '2024-11-25', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(265, '2024-11-25', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(266, '2024-11-25', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(267, '2024-11-25', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(268, '2024-11-26', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(269, '2024-11-26', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(270, '2024-11-26', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(271, '2024-11-26', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(272, '2024-11-26', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(273, '2024-11-26', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(274, '2024-11-26', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(275, '2024-11-26', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(276, '2024-11-26', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(277, '2024-11-26', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(278, '2024-11-26', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(279, '2024-11-26', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(280, '2024-11-26', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(281, '2024-11-26', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(282, '2024-11-26', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(283, '2024-11-26', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(284, '2024-11-26', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(285, '2024-11-26', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(286, '2024-11-26', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(287, '2024-11-26', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(288, '2024-11-26', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(289, '2024-11-26', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(290, '2024-11-26', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(291, '2024-11-26', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(292, '2024-11-27', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(293, '2024-11-27', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(294, '2024-11-27', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(295, '2024-11-27', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(296, '2024-11-27', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(297, '2024-11-27', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(298, '2024-11-27', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(299, '2024-11-27', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(300, '2024-11-27', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(301, '2024-11-27', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(302, '2024-11-27', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(303, '2024-11-27', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(304, '2024-11-27', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(305, '2024-11-27', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(306, '2024-11-27', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(307, '2024-11-27', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(308, '2024-11-27', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(309, '2024-11-27', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(310, '2024-11-27', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(311, '2024-11-27', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(312, '2024-11-27', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(313, '2024-11-27', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(314, '2024-11-27', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(315, '2024-11-27', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(316, '2024-11-28', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(317, '2024-11-28', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(318, '2024-11-28', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(319, '2024-11-28', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(320, '2024-11-28', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(321, '2024-11-28', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(322, '2024-11-28', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(323, '2024-11-28', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(324, '2024-11-28', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(325, '2024-11-28', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(326, '2024-11-28', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(327, '2024-11-28', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(328, '2024-11-28', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(329, '2024-11-28', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(330, '2024-11-28', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(331, '2024-11-28', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(332, '2024-11-28', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(333, '2024-11-28', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(334, '2024-11-28', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(335, '2024-11-28', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(336, '2024-11-28', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(337, '2024-11-28', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(338, '2024-11-28', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(339, '2024-11-28', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(340, '2024-11-29', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(341, '2024-11-29', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(342, '2024-11-29', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(343, '2024-11-29', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(344, '2024-11-29', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(345, '2024-11-29', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(346, '2024-11-29', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(347, '2024-11-29', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(348, '2024-11-29', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(349, '2024-11-29', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(350, '2024-11-29', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(351, '2024-11-29', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(352, '2024-11-29', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(353, '2024-11-29', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(354, '2024-11-29', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(355, '2024-11-29', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(356, '2024-11-29', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(357, '2024-11-29', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(358, '2024-11-29', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(359, '2024-11-29', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(360, '2024-11-29', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(361, '2024-11-29', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(362, '2024-11-29', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(363, '2024-11-29', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(364, '2024-11-30', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(365, '2024-11-30', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(366, '2024-11-30', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(367, '2024-11-30', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(368, '2024-11-30', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(369, '2024-11-30', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(370, '2024-11-30', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(371, '2024-11-30', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(372, '2024-11-30', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(373, '2024-11-30', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(374, '2024-11-30', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(375, '2024-11-30', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(376, '2024-11-30', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(377, '2024-11-30', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(378, '2024-11-30', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(379, '2024-11-30', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(380, '2024-11-30', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(381, '2024-11-30', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(382, '2024-11-30', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(383, '2024-11-30', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(384, '2024-11-30', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(385, '2024-11-30', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(386, '2024-11-30', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(387, '2024-11-30', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(388, '2024-12-01', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(389, '2024-12-01', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(390, '2024-12-01', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(391, '2024-12-01', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(392, '2024-12-01', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(393, '2024-12-01', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(394, '2024-12-01', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(395, '2024-12-01', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(396, '2024-12-01', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(397, '2024-12-01', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(398, '2024-12-01', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(399, '2024-12-01', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(400, '2024-12-01', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(401, '2024-12-01', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(402, '2024-12-01', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(403, '2024-12-01', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(404, '2024-12-01', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(405, '2024-12-01', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(406, '2024-12-01', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(407, '2024-12-01', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(408, '2024-12-01', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(409, '2024-12-01', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(410, '2024-12-01', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(411, '2024-12-01', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(412, '2024-12-02', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(413, '2024-12-02', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(414, '2024-12-02', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(415, '2024-12-02', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(416, '2024-12-02', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(417, '2024-12-02', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(418, '2024-12-02', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(419, '2024-12-02', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(420, '2024-12-02', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(421, '2024-12-02', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(422, '2024-12-02', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(423, '2024-12-02', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(424, '2024-12-02', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(425, '2024-12-02', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(426, '2024-12-02', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(427, '2024-12-02', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(428, '2024-12-02', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(429, '2024-12-02', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(430, '2024-12-02', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(431, '2024-12-02', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(432, '2024-12-02', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(433, '2024-12-02', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(434, '2024-12-02', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(435, '2024-12-02', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(436, '2024-12-03', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(437, '2024-12-03', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(438, '2024-12-03', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(439, '2024-12-03', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(440, '2024-12-03', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(441, '2024-12-03', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(442, '2024-12-03', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(443, '2024-12-03', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(444, '2024-12-03', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(445, '2024-12-03', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(446, '2024-12-03', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(447, '2024-12-03', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(448, '2024-12-03', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(449, '2024-12-03', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(450, '2024-12-03', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(451, '2024-12-03', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(452, '2024-12-03', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(453, '2024-12-03', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(454, '2024-12-03', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(455, '2024-12-03', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(456, '2024-12-03', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(457, '2024-12-03', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(458, '2024-12-03', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(459, '2024-12-03', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(460, '2024-12-04', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(461, '2024-12-04', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(462, '2024-12-04', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(463, '2024-12-04', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(464, '2024-12-04', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(465, '2024-12-04', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(466, '2024-12-04', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(467, '2024-12-04', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(468, '2024-12-04', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(469, '2024-12-04', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(470, '2024-12-04', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(471, '2024-12-04', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(472, '2024-12-04', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(473, '2024-12-04', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(474, '2024-12-04', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(475, '2024-12-04', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(476, '2024-12-04', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(477, '2024-12-04', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(478, '2024-12-04', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(479, '2024-12-04', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(480, '2024-12-04', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(481, '2024-12-04', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(482, '2024-12-04', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(483, '2024-12-04', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(484, '2024-12-05', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(485, '2024-12-05', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(486, '2024-12-05', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(487, '2024-12-05', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(488, '2024-12-05', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(489, '2024-12-05', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(490, '2024-12-05', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(491, '2024-12-05', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(492, '2024-12-05', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(493, '2024-12-05', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(494, '2024-12-05', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(495, '2024-12-05', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(496, '2024-12-05', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(497, '2024-12-05', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(498, '2024-12-05', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(499, '2024-12-05', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(500, '2024-12-05', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(501, '2024-12-05', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(502, '2024-12-05', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(503, '2024-12-05', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(504, '2024-12-05', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(505, '2024-12-05', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(506, '2024-12-05', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(507, '2024-12-05', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(508, '2024-12-06', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(509, '2024-12-06', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(510, '2024-12-06', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(511, '2024-12-06', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(512, '2024-12-06', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(513, '2024-12-06', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(514, '2024-12-06', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(515, '2024-12-06', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(516, '2024-12-06', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(517, '2024-12-06', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(518, '2024-12-06', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(519, '2024-12-06', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(520, '2024-12-06', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(521, '2024-12-06', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(522, '2024-12-06', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(523, '2024-12-06', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(524, '2024-12-06', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(525, '2024-12-06', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(526, '2024-12-06', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(527, '2024-12-06', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(528, '2024-12-06', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(529, '2024-12-06', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(530, '2024-12-06', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(531, '2024-12-06', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(532, '2024-12-07', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(533, '2024-12-07', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(534, '2024-12-07', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(535, '2024-12-07', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(536, '2024-12-07', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(537, '2024-12-07', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(538, '2024-12-07', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(539, '2024-12-07', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(540, '2024-12-07', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(541, '2024-12-07', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(542, '2024-12-07', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(543, '2024-12-07', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(544, '2024-12-07', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(545, '2024-12-07', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(546, '2024-12-07', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(547, '2024-12-07', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(548, '2024-12-07', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(549, '2024-12-07', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(550, '2024-12-07', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(551, '2024-12-07', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(552, '2024-12-07', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(553, '2024-12-07', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(554, '2024-12-07', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(555, '2024-12-07', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(556, '2024-12-08', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(557, '2024-12-08', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(558, '2024-12-08', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(559, '2024-12-08', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(560, '2024-12-08', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(561, '2024-12-08', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(562, '2024-12-08', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(563, '2024-12-08', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(564, '2024-12-08', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(565, '2024-12-08', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(566, '2024-12-08', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(567, '2024-12-08', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(568, '2024-12-08', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(569, '2024-12-08', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(570, '2024-12-08', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(571, '2024-12-08', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(572, '2024-12-08', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(573, '2024-12-08', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(574, '2024-12-08', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(575, '2024-12-08', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(576, '2024-12-08', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(577, '2024-12-08', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(578, '2024-12-08', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(579, '2024-12-08', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(580, '2024-12-09', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(581, '2024-12-09', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(582, '2024-12-09', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(583, '2024-12-09', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(584, '2024-12-09', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(585, '2024-12-09', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(586, '2024-12-09', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(587, '2024-12-09', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(588, '2024-12-09', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(589, '2024-12-09', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(590, '2024-12-09', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(591, '2024-12-09', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(592, '2024-12-09', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(593, '2024-12-09', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(594, '2024-12-09', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(595, '2024-12-09', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(596, '2024-12-09', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(597, '2024-12-09', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(598, '2024-12-09', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(599, '2024-12-09', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(600, '2024-12-09', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(601, '2024-12-09', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(602, '2024-12-09', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(603, '2024-12-09', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(604, '2024-12-10', '08:00:00', NULL, 'Libre', NULL, NULL, 9),
(605, '2024-12-10', '08:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(606, '2024-12-10', '08:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(607, '2024-12-10', '08:30:00', NULL, 'Libre', NULL, NULL, 9),
(608, '2024-12-10', '08:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(609, '2024-12-10', '08:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(610, '2024-12-10', '09:00:00', NULL, 'Libre', NULL, NULL, 9),
(611, '2024-12-10', '09:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(612, '2024-12-10', '09:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(613, '2024-12-10', '09:30:00', NULL, 'Libre', NULL, NULL, 9),
(614, '2024-12-10', '09:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(615, '2024-12-10', '09:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(616, '2024-12-10', '10:00:00', NULL, 'Libre', NULL, NULL, 9),
(617, '2024-12-10', '10:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(618, '2024-12-10', '10:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(619, '2024-12-10', '10:30:00', NULL, 'Libre', NULL, NULL, 9),
(620, '2024-12-10', '10:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(621, '2024-12-10', '10:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(622, '2024-12-10', '11:00:00', NULL, 'Libre', NULL, NULL, 9),
(623, '2024-12-10', '11:00:00', NULL, 'Sobreturno', 1, NULL, 9),
(624, '2024-12-10', '11:00:00', NULL, 'Sobreturno', 2, NULL, 9),
(625, '2024-12-10', '11:30:00', NULL, 'Libre', NULL, NULL, 9),
(626, '2024-12-10', '11:30:00', NULL, 'Sobreturno', 1, NULL, 9),
(627, '2024-12-10', '11:30:00', NULL, 'Sobreturno', 2, NULL, 9),
(628, '2024-11-12', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(629, '2024-11-12', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(630, '2024-11-12', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(631, '2024-11-12', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(632, '2024-11-12', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(633, '2024-11-12', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(634, '2024-11-13', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(635, '2024-11-13', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(636, '2024-11-13', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(637, '2024-11-13', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(638, '2024-11-13', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(639, '2024-11-13', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(640, '2024-11-14', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(641, '2024-11-14', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(642, '2024-11-14', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(643, '2024-11-14', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(644, '2024-11-14', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(645, '2024-11-14', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(646, '2024-11-15', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(647, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(648, '2024-11-15', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(649, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(650, '2024-11-15', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(651, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(652, '2024-11-16', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(653, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(654, '2024-11-16', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(655, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(656, '2024-11-16', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(657, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(658, '2024-11-17', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(659, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(660, '2024-11-17', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(661, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(662, '2024-11-17', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(663, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(664, '2024-11-18', '08:00:00', NULL, 'Libre', NULL, NULL, 10),
(665, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(666, '2024-11-18', '08:30:00', NULL, 'Libre', NULL, NULL, 10),
(667, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 1, NULL, 10),
(668, '2024-11-18', '09:00:00', NULL, 'Libre', NULL, NULL, 10),
(669, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 1, NULL, 10),
(670, '2024-11-12', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(671, '2024-11-12', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(672, '2024-11-12', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(673, '2024-11-12', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(674, '2024-11-12', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(675, '2024-11-12', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(676, '2024-11-12', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(677, '2024-11-12', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(678, '2024-11-12', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(679, '2024-11-13', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(680, '2024-11-13', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(681, '2024-11-13', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(682, '2024-11-13', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(683, '2024-11-13', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(684, '2024-11-13', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(685, '2024-11-13', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(686, '2024-11-13', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(687, '2024-11-13', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(688, '2024-11-14', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(689, '2024-11-14', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(690, '2024-11-14', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(691, '2024-11-14', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(692, '2024-11-14', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(693, '2024-11-14', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(694, '2024-11-14', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(695, '2024-11-14', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(696, '2024-11-14', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(697, '2024-11-15', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(698, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(699, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(700, '2024-11-15', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(701, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(702, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(703, '2024-11-15', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(704, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(705, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(706, '2024-11-16', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(707, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(708, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(709, '2024-11-16', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(710, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(711, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(712, '2024-11-16', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(713, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(714, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(715, '2024-11-17', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(716, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(717, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(718, '2024-11-17', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(719, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(720, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(721, '2024-11-17', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(722, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(723, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(724, '2024-11-18', '08:00:00', NULL, 'Libre', NULL, NULL, 11),
(725, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(726, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(727, '2024-11-18', '08:30:00', NULL, 'Libre', NULL, NULL, 11),
(728, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 1, NULL, 11),
(729, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 2, NULL, 11),
(730, '2024-11-18', '09:00:00', NULL, 'Libre', NULL, NULL, 11),
(731, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 1, NULL, 11),
(732, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 2, NULL, 11),
(733, '2024-11-12', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(734, '2024-11-12', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(735, '2024-11-12', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(736, '2024-11-12', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(737, '2024-11-12', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(738, '2024-11-12', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(739, '2024-11-12', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(740, '2024-11-12', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(741, '2024-11-13', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(742, '2024-11-13', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(743, '2024-11-13', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(744, '2024-11-13', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(745, '2024-11-13', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(746, '2024-11-13', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(747, '2024-11-13', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(748, '2024-11-13', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(749, '2024-11-14', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(750, '2024-11-14', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(751, '2024-11-14', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(752, '2024-11-14', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(753, '2024-11-14', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(754, '2024-11-14', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(755, '2024-11-14', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(756, '2024-11-14', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(757, '2024-11-15', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(758, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(759, '2024-11-15', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(760, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(761, '2024-11-15', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(762, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(763, '2024-11-15', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(764, '2024-11-15', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(765, '2024-11-16', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(766, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(767, '2024-11-16', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(768, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(769, '2024-11-16', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(770, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(771, '2024-11-16', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(772, '2024-11-16', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(773, '2024-11-17', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(774, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(775, '2024-11-17', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(776, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(777, '2024-11-17', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(778, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(779, '2024-11-17', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(780, '2024-11-17', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(781, '2024-11-18', '08:00:00', NULL, 'Libre', NULL, NULL, 12),
(782, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(783, '2024-11-18', '08:30:00', NULL, 'Libre', NULL, NULL, 12),
(784, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(785, '2024-11-18', '09:00:00', NULL, 'Libre', NULL, NULL, 12),
(786, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 1, NULL, 12),
(787, '2024-11-18', '09:30:00', NULL, 'Libre', NULL, NULL, 12),
(788, '2024-11-18', '09:30:00', NULL, 'Sobreturno', 1, NULL, 12),
(1441, '2024-11-12', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1442, '2024-11-12', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1443, '2024-11-12', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1444, '2024-11-12', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1445, '2024-11-12', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1446, '2024-11-12', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1447, '2024-11-12', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1448, '2024-11-12', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1449, '2024-11-12', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1450, '2024-11-12', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1451, '2024-11-12', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1452, '2024-11-12', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1453, '2024-11-13', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1454, '2024-11-13', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1);
INSERT INTO `turnos` (`id`, `fecha`, `hora_inicio`, `motivo`, `estado`, `orden`, `id_paciente`, `id_agenda`) VALUES
(1455, '2024-11-13', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1456, '2024-11-13', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1457, '2024-11-13', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1458, '2024-11-13', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1459, '2024-11-13', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1460, '2024-11-13', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1461, '2024-11-13', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1462, '2024-11-13', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1463, '2024-11-13', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1464, '2024-11-13', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1465, '2024-11-14', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1466, '2024-11-14', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1467, '2024-11-14', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1468, '2024-11-14', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1469, '2024-11-14', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1470, '2024-11-14', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1471, '2024-11-14', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1472, '2024-11-14', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1473, '2024-11-14', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1474, '2024-11-14', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1475, '2024-11-14', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1476, '2024-11-14', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1477, '2024-11-15', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1478, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1479, '2024-11-15', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1480, '2024-11-15', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1481, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1482, '2024-11-15', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1483, '2024-11-15', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1484, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1485, '2024-11-15', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1486, '2024-11-15', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1487, '2024-11-15', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1488, '2024-11-15', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1489, '2024-11-16', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1490, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1491, '2024-11-16', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1492, '2024-11-16', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1493, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1494, '2024-11-16', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1495, '2024-11-16', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1496, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1497, '2024-11-16', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1498, '2024-11-16', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1499, '2024-11-16', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1500, '2024-11-16', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1501, '2024-11-17', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1502, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1503, '2024-11-17', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1504, '2024-11-17', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1505, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1506, '2024-11-17', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1507, '2024-11-17', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1508, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1509, '2024-11-17', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1510, '2024-11-17', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1511, '2024-11-17', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1512, '2024-11-17', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1513, '2024-11-18', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1514, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1515, '2024-11-18', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1516, '2024-11-18', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1517, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1518, '2024-11-18', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1519, '2024-11-18', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1520, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1521, '2024-11-18', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1522, '2024-11-18', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1523, '2024-11-18', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1524, '2024-11-18', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1525, '2024-11-19', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1526, '2024-11-19', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1527, '2024-11-19', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1528, '2024-11-19', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1529, '2024-11-19', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1530, '2024-11-19', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1531, '2024-11-19', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1532, '2024-11-19', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1533, '2024-11-19', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1534, '2024-11-19', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1535, '2024-11-19', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1536, '2024-11-19', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1537, '2024-11-20', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1538, '2024-11-20', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1539, '2024-11-20', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1540, '2024-11-20', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1541, '2024-11-20', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1542, '2024-11-20', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1543, '2024-11-20', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1544, '2024-11-20', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1545, '2024-11-20', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1546, '2024-11-20', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1547, '2024-11-20', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1548, '2024-11-20', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1549, '2024-11-21', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1550, '2024-11-21', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1551, '2024-11-21', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1552, '2024-11-21', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1553, '2024-11-21', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1554, '2024-11-21', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1555, '2024-11-21', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1556, '2024-11-21', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1557, '2024-11-21', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1558, '2024-11-21', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1559, '2024-11-21', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1560, '2024-11-21', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1561, '2024-11-22', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1562, '2024-11-22', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1563, '2024-11-22', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1564, '2024-11-22', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1565, '2024-11-22', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1566, '2024-11-22', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1567, '2024-11-22', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1568, '2024-11-22', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1569, '2024-11-22', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1570, '2024-11-22', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1571, '2024-11-22', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1572, '2024-11-22', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1573, '2024-11-23', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1574, '2024-11-23', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1575, '2024-11-23', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1576, '2024-11-23', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1577, '2024-11-23', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1578, '2024-11-23', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1579, '2024-11-23', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1580, '2024-11-23', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1581, '2024-11-23', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1582, '2024-11-23', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1583, '2024-11-23', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1584, '2024-11-23', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1585, '2024-11-24', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1586, '2024-11-24', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1587, '2024-11-24', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1588, '2024-11-24', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1589, '2024-11-24', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1590, '2024-11-24', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1591, '2024-11-24', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1592, '2024-11-24', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1593, '2024-11-24', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1594, '2024-11-24', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1595, '2024-11-24', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1596, '2024-11-24', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1597, '2024-11-25', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1598, '2024-11-25', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1599, '2024-11-25', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1600, '2024-11-25', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1601, '2024-11-25', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1602, '2024-11-25', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1603, '2024-11-25', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1604, '2024-11-25', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1605, '2024-11-25', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1606, '2024-11-25', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1607, '2024-11-25', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1608, '2024-11-25', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1609, '2024-11-26', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1610, '2024-11-26', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1611, '2024-11-26', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1612, '2024-11-26', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1613, '2024-11-26', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1614, '2024-11-26', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1615, '2024-11-26', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1616, '2024-11-26', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1617, '2024-11-26', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1618, '2024-11-26', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1619, '2024-11-26', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1620, '2024-11-26', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1621, '2024-11-27', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1622, '2024-11-27', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1623, '2024-11-27', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1624, '2024-11-27', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1625, '2024-11-27', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1626, '2024-11-27', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1627, '2024-11-27', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1628, '2024-11-27', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1629, '2024-11-27', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1630, '2024-11-27', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1631, '2024-11-27', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1632, '2024-11-27', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1633, '2024-11-28', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1634, '2024-11-28', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1635, '2024-11-28', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1636, '2024-11-28', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1637, '2024-11-28', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1638, '2024-11-28', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1639, '2024-11-28', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1640, '2024-11-28', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1641, '2024-11-28', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1642, '2024-11-28', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1643, '2024-11-28', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1644, '2024-11-28', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1645, '2024-11-29', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1646, '2024-11-29', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1647, '2024-11-29', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1648, '2024-11-29', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1649, '2024-11-29', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1650, '2024-11-29', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1651, '2024-11-29', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1652, '2024-11-29', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1653, '2024-11-29', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1654, '2024-11-29', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1655, '2024-11-29', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1656, '2024-11-29', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1657, '2024-11-30', '08:00:00', NULL, 'Libre', NULL, NULL, 1),
(1658, '2024-11-30', '08:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1659, '2024-11-30', '08:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1660, '2024-11-30', '08:30:00', NULL, 'Libre', NULL, NULL, 1),
(1661, '2024-11-30', '08:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1662, '2024-11-30', '08:30:00', NULL, 'Sobreturno', 2, NULL, 1),
(1663, '2024-11-30', '09:00:00', NULL, 'Libre', NULL, NULL, 1),
(1664, '2024-11-30', '09:00:00', NULL, 'Sobreturno', 1, NULL, 1),
(1665, '2024-11-30', '09:00:00', NULL, 'Sobreturno', 2, NULL, 1),
(1666, '2024-11-30', '09:30:00', NULL, 'Libre', NULL, NULL, 1),
(1667, '2024-11-30', '09:30:00', NULL, 'Sobreturno', 1, NULL, 1),
(1668, '2024-11-30', '09:30:00', NULL, 'Sobreturno', 2, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `dni` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `id_rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `dni`, `email`, `password`, `id_rol`) VALUES
(1, 71345678, 'albert.ortiza', '12341234321', 2),
(2, 21456789, 'alicia.romero', NULL, 2),
(3, 45678901, 'ana.martinez', NULL, 2),
(4, 71234567, 'andres.vega', NULL, 2),
(5, 34567890, 'carlos.rodriguez', NULL, 2),
(6, 1456789, 'carmen.pena', NULL, 2),
(7, 61345678, 'claudia.silva', NULL, 2),
(8, 15334346, 'cMontero', NULL, 2),
(9, 91345678, 'daniel.soto', NULL, 2),
(10, 31234567, 'diego.diaz', NULL, 2),
(11, 67890123, 'elena.gonzalez', NULL, NULL),
(12, 91234567, 'fernando.herrera', NULL, NULL),
(13, 51345678, 'francisco.molina', NULL, NULL),
(14, 41345678, 'gabriela.rojas', NULL, NULL),
(15, 11456789, 'hugo.suarez', NULL, NULL),
(16, 21345678, 'isabel.ruiz', NULL, NULL),
(17, 12641257, 'jBasco', NULL, NULL),
(18, 20389031, 'jBazan', NULL, NULL),
(19, 18307842, 'JGutierres', NULL, NULL),
(20, 17316553, 'JMaldonado', NULL, NULL),
(21, 90123456, 'jorge.ramirez', NULL, NULL),
(22, 12345678, 'juan.perez', NULL, NULL),
(23, 12121234, 'juliofloresth', '12341234', 2),
(24, 89012345, 'laura.fernandez', NULL, NULL),
(25, 21234567, 'lucia.ramos', NULL, NULL),
(26, 56789012, 'luis.lopez', NULL, NULL),
(27, 23456789, 'maria.garcia', NULL, NULL),
(28, 41234567, 'marta.morales', NULL, NULL),
(29, 78901234, 'miguel.sanchez', NULL, NULL),
(30, 14343464, 'mMartines', NULL, NULL),
(31, 16325635, 'mMontiel', NULL, NULL),
(32, 21370913, 'MSalomon', NULL, NULL),
(33, 81234567, 'natalia.mendoza', NULL, 2),
(34, 1345678, 'patricia.cruz', NULL, 2),
(35, 11234567, 'pedrou.florez', '12341234', 2),
(36, 13352175, 'pFernandez', NULL, 2),
(37, 51234567, 'raul.ortega', NULL, 2),
(38, 11345678, 'ricardo.jimenez', NULL, 2),
(39, 31345678, 'roberto.navarro', NULL, 2),
(40, 19398724, 'SDorado', NULL, 2),
(41, 1234567, 'sofia.torres', NULL, 2),
(42, 61234567, 'valeria.castro', NULL, 2),
(43, 81345678, 'veronica.iglesias', NULL, NULL),
(48, 66666660, 'gogobongo', '12341234', 2),
(49, 123233, 'ppppp', '12341234', 2),
(50, 888998, 'mlucero', '12341234', 4),
(51, 783722, 'hashda', '12341234', 4),
(52, 1230023, 'pruebasss', '12341234', 4),
(53, 667766, 'rufil213', '12341234', 4),
(54, 7766776, 'leonel123', '12341234', 4);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `agendas`
--
ALTER TABLE `agendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `matricula` (`matricula`),
  ADD KEY `id_sucursal` (`id_sucursal`),
  ADD KEY `id_clasificacion` (`id_clasificacion`);

--
-- Indices de la tabla `clasificaciones`
--
ALTER TABLE `clasificaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `dias_disponibles`
--
ALTER TABLE `dias_disponibles`
  ADD KEY `id_agenda` (`id_agenda`);

--
-- Indices de la tabla `dias_no_laborables`
--
ALTER TABLE `dias_no_laborables`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unico` (`nombre`);

--
-- Indices de la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `medico_especialidad`
--
ALTER TABLE `medico_especialidad`
  ADD UNIQUE KEY `unico` (`matricula`),
  ADD KEY `id_medico` (`id_medico`),
  ADD KEY `id_especialidad` (`id_especialidad`);

--
-- Indices de la tabla `medico_obra_social`
--
ALTER TABLE `medico_obra_social`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_medico` (`id_medico`),
  ADD KEY `id_obra_social` (`id_obra_social`);

--
-- Indices de la tabla `obras_sociales`
--
ALTER TABLE `obras_sociales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unico` (`nombre`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`dni`),
  ADD KEY `id_obra_social` (`id_obra_social`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`dni`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `telefonos`
--
ALTER TABLE `telefonos`
  ADD UNIQUE KEY `unico` (`numero`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_agenda` (`id_agenda`),
  ADD KEY `id_paciente` (`id_paciente`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unico` (`email`),
  ADD KEY `dni` (`dni`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `agendas`
--
ALTER TABLE `agendas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `clasificaciones`
--
ALTER TABLE `clasificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `dias_no_laborables`
--
ALTER TABLE `dias_no_laborables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `medico_obra_social`
--
ALTER TABLE `medico_obra_social`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `obras_sociales`
--
ALTER TABLE `obras_sociales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `turnos`
--
ALTER TABLE `turnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1669;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `agendas`
--
ALTER TABLE `agendas`
  ADD CONSTRAINT `agendas_ibfk_1` FOREIGN KEY (`matricula`) REFERENCES `medico_especialidad` (`matricula`),
  ADD CONSTRAINT `agendas_ibfk_2` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id`),
  ADD CONSTRAINT `agendas_ibfk_3` FOREIGN KEY (`id_clasificacion`) REFERENCES `clasificaciones` (`id`);

--
-- Filtros para la tabla `dias_disponibles`
--
ALTER TABLE `dias_disponibles`
  ADD CONSTRAINT `dias_disponibles_ibfk_1` FOREIGN KEY (`id_agenda`) REFERENCES `agendas` (`id`);

--
-- Filtros para la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD CONSTRAINT `medicos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `medico_especialidad`
--
ALTER TABLE `medico_especialidad`
  ADD CONSTRAINT `medico_especialidad_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_usuario`),
  ADD CONSTRAINT `medico_especialidad_ibfk_2` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`);

--
-- Filtros para la tabla `medico_obra_social`
--
ALTER TABLE `medico_obra_social`
  ADD CONSTRAINT `medico_obra_social_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_usuario`);

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `pacientes_ibfk_4` FOREIGN KEY (`dni`) REFERENCES `personas` (`dni`);

--
-- Filtros para la tabla `telefonos`
--
ALTER TABLE `telefonos`
  ADD CONSTRAINT `telefonos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD CONSTRAINT `turnos_ibfk_1` FOREIGN KEY (`id_agenda`) REFERENCES `agendas` (`id`),
  ADD CONSTRAINT `turnos_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_usuario`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`dni`) REFERENCES `personas` (`dni`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
