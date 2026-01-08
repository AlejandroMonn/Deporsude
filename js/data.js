const appData = {
    phases: [
        {
            id: 1,
            name: "Fase 1",
            label: "Cimentación",
            desc: "Mes 1-3 | Objetivo: Postura Perfecta y Hábito.",
            color: "from-blue-500 to-blue-600",
            weeks: [
                { num: 1, focus: "Técnica Base (RPE 6)" },
                { num: 2, focus: "Técnica + 2 Reps" },
                { num: 3, focus: "Volumen (+1 Serie)" },
                { num: 4, focus: "Descarga (50% esfuerzo)" }
            ],
            routines: {
                A: {
                    name: "Rutina A: Torso y Postura",
                    days: "Lunes y Jueves",
                    exercises: [
                        { n: "Chin Tucks", s: "3x15", note: "Pega la nuca a la pared", v: "https://www.youtube.com/results?search_query=chin+tucks+exercise+posture" },
                        { n: "Band Face Pulls", s: "4x20", note: "Clave para V-Shape", v: "https://www.youtube.com/results?search_query=band+face+pulls+proper+form" },
                        { n: "Push-ups (Flexiones)", s: "3x Fallo", note: "Cuerpo recto", v: "https://www.youtube.com/results?search_query=perfect+pushup+form" },
                        { n: "Remo Sentado (Banda)", s: "4x15", note: "Saca pecho al tirar", v: "https://www.youtube.com/results?search_query=seated+resistance+band+rows" },
                        { n: "Elevaciones Laterales", s: "4x15", note: "Mancuernas 2.5kg", v: "https://www.youtube.com/results?search_query=dumbbell+lateral+raise+form" }
                    ]
                },
                B: {
                    name: "Rutina B: Piernas y Core",
                    days: "Martes y Viernes",
                    exercises: [
                        { n: "Dead Bug", s: "3x1min", note: "Espalda pegada al suelo", v: "https://www.youtube.com/results?search_query=dead+bug+exercise+form" },
                        { n: "Goblet Squat", s: "4x20", note: "2 mancuernas al pecho", v: "https://www.youtube.com/results?search_query=goblet+squat+form" },
                        { n: "Zancada Búlgara", s: "3x12", note: "Pie trasero elevado", v: "https://www.youtube.com/results?search_query=bulgarian+split+squat+dumbbells" },
                        { n: "Bíceps + Tríceps", s: "3x15", note: "Superserie brazos", v: "https://www.youtube.com/results?search_query=dumbbell+arm+workout" },
                        { n: "Plancha Abdominal", s: "3x45s", note: "Aprieta glúteos", v: "https://www.youtube.com/results?search_query=perfect+plank+form" }
                    ]
                }
            }
        },
        {
            id: 2,
            name: "Fase 2",
            label: "V-Taper",
            desc: "Mes 4-7 | Objetivo: Hipertrofia (Banda + DB).",
            color: "from-blue-600 to-indigo-600",
            weeks: [
                { num: 1, focus: "Adaptación Carga Mixta" },
                { num: 2, focus: "Tempo 2-0-2 (Lento)" },
                { num: 3, focus: "Descansos Cortos (45s)" },
                { num: 4, focus: "Descarga" }
            ],
            routines: {
                A: {
                    name: "Rutina A: Anchura V-Shape",
                    days: "Lunes y Jueves",
                    exercises: [
                        { n: "Remo Inclinado (Mixto)", s: "4x12", note: "Banda + Mancuerna", v: "https://www.youtube.com/results?search_query=band+and+dumbbell+row" },
                        { n: "Arnold Press", s: "4x12", note: "Gira muñecas al subir", v: "https://www.youtube.com/results?search_query=arnold+press+dumbbells" },
                        { n: "Pull-over con Banda", s: "3x15", note: "Brazos rectos", v: "https://www.youtube.com/results?search_query=standing+band+pullover" },
                        { n: "Flexiones con Banda", s: "3x Fallo", note: "Resistencia en espalda", v: "https://www.youtube.com/results?search_query=resistance+band+push+ups" }
                    ]
                },
                B: {
                    name: "Rutina B: Poder Inferior",
                    days: "Martes y Viernes",
                    exercises: [
                        { n: "Sentadilla Sumo", s: "4x15", note: "Pies anchos, pesas centro", v: "https://www.youtube.com/results?search_query=sumo+squat+dumbbells" },
                        { n: "Puente de Glúteo", s: "4x15", note: "Pesas en cadera", v: "https://www.youtube.com/results?search_query=dumbbell+glute+bridge" },
                        { n: "Curl Martillo", s: "3x15", note: "Antebrazo y bíceps", v: "https://www.youtube.com/results?search_query=hammer+curls" },
                        { n: "V-Ups", s: "3x20", note: "Abdomen bajo", v: "https://www.youtube.com/results?search_query=v+ups+exercise" }
                    ]
                }
            }
        },
        {
            id: 3,
            name: "Fase 3",
            label: "Atleta",
            desc: "Mes 8-12 | Objetivo: Densidad y Detalle (5 días).",
            color: "from-indigo-600 to-purple-600",
            weeks: [
                { num: 1, focus: "Pausas Isométricas (2s)" },
                { num: 2, focus: "Fallo Técnico Total" },
                { num: 3, focus: "Volumen Máximo" },
                { num: 4, focus: "Descarga Total" }
            ],
            routines: {
                A: {
                    name: "Rutina: Full Body Detalle",
                    days: "Lunes, Miércoles, Viernes",
                    exercises: [
                        { n: "Upright Row (Banda)", s: "4x15", note: "Trapecio y hombro", v: "https://www.youtube.com/results?search_query=band+upright+row" },
                        { n: "Peso Muerto Rumano", s: "4x15", note: "Espalda recta", v: "https://www.youtube.com/results?search_query=romanian+deadlift+dumbbells" },
                        { n: "Flexiones Diamante", s: "4x Fallo", note: "Tríceps enfoque", v: "https://www.youtube.com/results?search_query=diamond+push+ups" },
                        { n: "Curl de Muñeca", s: "4x20", note: "Antebrazo masivo", v: "https://www.youtube.com/results?search_query=wrist+curls+home" }
                    ]
                },
                B: {
                    name: "Rutina: Hiper-Detalle",
                    days: "Martes y Jueves",
                    exercises: [
                        { n: "Elevación Pantorrillas", s: "5x20", note: "A una pierna", v: "https://www.youtube.com/results?search_query=single+leg+calf+raise" },
                        { n: "Face Pulls (Pausa)", s: "4x15", note: "Aguanta 3 seg atrás", v: "https://www.youtube.com/results?search_query=face+pull+hold" },
                        { n: "Plancha con Toque", s: "3x1min", note: "Sin mover cadera", v: "https://www.youtube.com/results?search_query=plank+shoulder+taps" }
                    ]
                }
            }
        }
    ]
};