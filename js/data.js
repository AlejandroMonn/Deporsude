const appData = {
    phases: [
        {
            id: 1,
            name: "Fase 1",
            label: "Cimentación",
            desc: "Mes 1-3 | Objetivo: Postura Perfecta y Hábito. Construyendo la base.",
            color: "from-blue-500 to-blue-600",
            weeks: [
                { num: 1, focus: "Técnica Base (RPE 6) - Conexión Mente-Músculo" },
                { num: 2, focus: "Progresión: +2 Repeticiones en todo" },
                { num: 3, focus: "Volumen: Añadir 1 Serie extra" },
                { num: 4, focus: "Descarga: 50% del esfuerzo (Recuperación)" }
            ],
            routines: {
                A: {
                    name: "Rutina A: Torso y Postura",
                    days: "Lunes y Jueves",
                    exercises: [
                        { 
                            n: "Chin Tucks (Pared)", 
                            s: "3x15", 
                            note: "Pega la nuca a la pared, mete barbilla sin bajar la mirada.", 
                            v: "https://www.youtube.com/results?search_query=chin+tucks+exercise+posture" 
                        },
                        { 
                            n: "Band Face Pulls", 
                            s: "4x20", 
                            note: "El ejercicio #1 para tu postura. Tira a la frente.", 
                            v: "https://www.youtube.com/results?search_query=band+face+pulls+proper+form" 
                        },
                        { 
                            n: "Push-ups (Flexiones)", 
                            s: "3x Fallo", 
                            note: "Cuerpo recto como tabla. Baja controlado.", 
                            v: "https://www.youtube.com/results?search_query=perfect+pushup+form" 
                        },
                        { 
                            n: "Remo Sentado (Banda)", 
                            s: "4x15", 
                            note: "Saca pecho al tirar. Aprieta la espalda 1 seg.", 
                            v: "https://www.youtube.com/results?search_query=seated+resistance+band+rows" 
                        },
                        { 
                            n: "Elevaciones Laterales", 
                            s: "4x15", 
                            note: "Usa tus mancuernas. No subas más allá de los hombros.", 
                            v: "https://www.youtube.com/results?search_query=dumbbell+lateral+raise+form" 
                        }
                    ]
                },
                B: {
                    name: "Rutina B: Piernas, Core y Brazos",
                    days: "Martes y Viernes",
                    exercises: [
                        { 
                            n: "Dead Bug (Core)", 
                            s: "3 series", 
                            note: "Espalda baja pegada al suelo. Movimiento lento.", 
                            v: "https://www.youtube.com/results?search_query=dead+bug+exercise+form",
                            seconds: 60 // Activa el temporizador
                        },
                        { 
                            n: "Goblet Squat", 
                            s: "4x20", 
                            note: "Sujeta las 2 mancuernas en el pecho. Baja profundo.", 
                            v: "https://www.youtube.com/results?search_query=goblet+squat+form" 
                        },
                        { 
                            n: "Zancada Búlgara", 
                            s: "3x12", 
                            note: "Pie trasero elevado. La mejor para crecer con poco peso.", 
                            v: "https://www.youtube.com/results?search_query=bulgarian+split+squat+dumbbells" 
                        },
                        { 
                            n: "Curl Bíceps + Tríceps", 
                            s: "3x15", 
                            note: "Superserie: Haz uno e inmediatamente el otro sin descanso.", 
                            v: "https://www.youtube.com/results?search_query=dumbbell+arm+workout" 
                        },
                        { 
                            n: "Plancha Abdominal", 
                            s: "3 series", 
                            note: "Aprieta glúteos fuerte. No dejes caer la cadera.", 
                            v: "https://www.youtube.com/results?search_query=perfect+plank+form",
                            seconds: 45 // Activa el temporizador
                        }
                    ]
                }
            }
        },
        {
            id: 2,
            name: "Fase 2",
            label: "V-Taper",
            desc: "Mes 4-7 | Objetivo: Hipertrofia 'Banded-DB'. Ensanchar espalda.",
            color: "from-blue-600 to-indigo-600",
            weeks: [
                { num: 1, focus: "Adaptación Carga Mixta (Banda + Pesa)" },
                { num: 2, focus: "Tempo 2-0-2 (2s bajar, 0s pausa, 2s subir)" },
                { num: 3, focus: "Densidad: Descansos cortos (45 seg)" },
                { num: 4, focus: "Descarga y Evaluación Visual" }
            ],
            routines: {
                A: {
                    name: "Rutina A: Anchura V-Shape",
                    days: "Lunes y Jueves",
                    exercises: [
                        { 
                            n: "Remo Inclinado (Mixto)", 
                            s: "4x12", 
                            note: "Sujeta mancuerna Y banda en la misma mano.", 
                            v: "https://www.youtube.com/results?search_query=band+and+dumbbell+row" 
                        },
                        { 
                            n: "Arnold Press", 
                            s: "4x12", 
                            note: "Gira las muñecas al subir. Control total.", 
                            v: "https://www.youtube.com/results?search_query=arnold+press+dumbbells" 
                        },
                        { 
                            n: "Pull-over con Banda", 
                            s: "3x15", 
                            note: "Brazos rectos. Jala desde arriba hasta tus muslos.", 
                            v: "https://www.youtube.com/results?search_query=standing+band+pullover" 
                        },
                        { 
                            n: "Flexiones con Banda", 
                            s: "3x Fallo", 
                            note: "Pasa la banda por tu espalda para más dificultad.", 
                            v: "https://www.youtube.com/results?search_query=resistance+band+push+ups" 
                        }
                    ]
                },
                B: {
                    name: "Rutina B: Poder Inferior",
                    days: "Martes y Viernes",
                    exercises: [
                        { 
                            n: "Sentadilla Sumo", 
                            s: "4x15", 
                            note: "Pies muy anchos. Mancuernas colgando al centro.", 
                            v: "https://www.youtube.com/results?search_query=sumo+squat+dumbbells" 
                        },
                        { 
                            n: "Puente de Glúteo", 
                            s: "4x15", 
                            note: "Pesas en la cadera. Aprieta arriba 1 seg.", 
                            v: "https://www.youtube.com/results?search_query=dumbbell+glute+bridge" 
                        },
                        { 
                            n: "Curl Martillo", 
                            s: "3x15", 
                            note: "Agarre neutro. Enfoca antebrazo y bíceps.", 
                            v: "https://www.youtube.com/results?search_query=hammer+curls" 
                        },
                        { 
                            n: "V-Ups", 
                            s: "3x20", 
                            note: "Toca la punta de los pies. Si cuesta, dobla rodillas.", 
                            v: "https://www.youtube.com/results?search_query=v+ups+exercise" 
                        }
                    ]
                }
            }
        },
        {
            id: 3,
            name: "Fase 3",
            label: "Atleta",
            desc: "Mes 8-12 | Objetivo: Densidad y Detalle. 5 Días a la semana.",
            color: "from-indigo-600 to-purple-600",
            weeks: [
                { num: 1, focus: "Pausas Isométricas (Aguanta 2s contracción)" },
                { num: 2, focus: "Fallo Técnico Total en cada serie" },
                { num: 3, focus: "Volumen Máximo (Añadir Dropsets)" },
                { num: 4, focus: "Descarga Total" }
            ],
            routines: {
                A: {
                    name: "Rutina A: Full Body Detalle",
                    days: "Lunes, Miércoles, Viernes",
                    exercises: [
                        { 
                            n: "Upright Row (Banda)", 
                            s: "4x15", 
                            note: "Codos siempre por encima de las muñecas.", 
                            v: "https://www.youtube.com/results?search_query=band+upright+row" 
                        },
                        { 
                            n: "Peso Muerto Rumano", 
                            s: "4x15", 
                            note: "Espalda recta. Baja hasta sentir tirón en femorales.", 
                            v: "https://www.youtube.com/results?search_query=romanian+deadlift+dumbbells" 
                        },
                        { 
                            n: "Flexiones Diamante", 
                            s: "4x Fallo", 
                            note: "Manos juntas formando un diamante. Tríceps.", 
                            v: "https://www.youtube.com/results?search_query=diamond+push+ups" 
                        },
                        { 
                            n: "Curl de Muñeca", 
                            s: "4x20", 
                            note: "Antebrazos apoyados en banca/pierna. Solo muñeca.", 
                            v: "https://www.youtube.com/results?search_query=wrist+curls+home" 
                        }
                    ]
                },
                B: {
                    name: "Rutina B: Hiper-Detalle",
                    days: "Martes y Jueves",
                    exercises: [
                        { 
                            n: "Elevación Pantorrillas", 
                            s: "5x20", 
                            note: "Hazlo a una sola pierna en un escalón.", 
                            v: "https://www.youtube.com/results?search_query=single+leg+calf+raise" 
                        },
                        { 
                            n: "Face Pulls (Iso Hold)", 
                            s: "4x15", 
                            note: "Aguanta 3 segundos atrás en cada repetición.", 
                            v: "https://www.youtube.com/results?search_query=face+pull+hold" 
                        },
                        { 
                            n: "Plancha con Toque", 
                            s: "3 series", 
                            note: "Toca hombro contrario sin balancear la cadera.", 
                            v: "https://www.youtube.com/results?search_query=plank+shoulder+taps",
                            seconds: 60 // Activa el temporizador
                        }
                    ]
                }
            }
        }
    ]
};