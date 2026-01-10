// =====================================================
// CONTADOR INTELIGENTE DE REPETICIONES
// =====================================================

let repCounter = 0;
let exerciseStage = null; // 'up', 'down', null
let currentExerciseType = null;
let targetReps = 0; // Repeticiones objetivo
let targetTime = 0; // Tiempo objetivo en segundos
let isTimedExercise = false;
let timedExerciseStartTime = null;
let timedExerciseElapsed = 0;
let timedExerciseInterval = null;

// Configuración de ejercicios con sus landmarks y umbrales
const EXERCISE_CONFIG = {
    // FLEXIONES (Push-ups)
    'Push-ups (Flexiones)': {
        type: 'pushup',
        landmarks: {
            shoulder: 11, // Hombro izquierdo
            elbow: 13,    // Codo izquierdo
            wrist: 15     // Muñeca izquierda
        },
        thresholds: {
            up: 160,   // Ángulo cuando está arriba
            down: 90   // Ángulo cuando está abajo
        }
    },
    
    'Flexiones con Banda': {
        type: 'pushup',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 90
        }
    },

    'Flexiones Diamante': {
        type: 'pushup',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 85
        }
    },
    
    // SENTADILLAS
    'Goblet Squat': {
        type: 'squat',
        landmarks: {
            hip: 23,   // Cadera izquierda
            knee: 25,  // Rodilla izquierda
            ankle: 27  // Tobillo izquierdo
        },
        thresholds: {
            up: 160,
            down: 90
        }
    },
    
    'Sentadilla Sumo': {
        type: 'squat',
        landmarks: {
            hip: 23,
            knee: 25,
            ankle: 27
        },
        thresholds: {
            up: 160,
            down: 90
        }
    },

    // CURL DE BÍCEPS
    'Curl Bíceps + Tríceps': {
        type: 'bicep_curl',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 40
        }
    },

    'Curl Martillo': {
        type: 'bicep_curl',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 40
        }
    },

    // ZANCADAS
    'Zancada Búlgara': {
        type: 'lunge',
        landmarks: {
            hip: 23,
            knee: 25,
            ankle: 27
        },
        thresholds: {
            up: 160,
            down: 90
        }
    },

    // PESO MUERTO
    'Peso Muerto Rumano': {
        type: 'deadlift',
        landmarks: {
            hip: 23,
            knee: 25,
            ankle: 27
        },
        thresholds: {
            up: 160,
            down: 120
        }
    },

    // EJERCICIOS ISOMÉTRICOS (TIEMPO)
    'Dead Bug (Core)': {
        type: 'timed',
        isometric: true
    },

    'Plancha Abdominal': {
        type: 'timed',
        isometric: true
    },

    'Plancha con Toque': {
        type: 'timed',
        isometric: true
    }
};

// Procesar landmarks para contar repeticiones
function processRepCount(landmarks) {
    if (!currentExerciseType || !landmarks) return;

    const config = EXERCISE_CONFIG[currentExerciseType];
    if (!config) {
        console.log("⚠️ Ejercicio no configurado para conteo automático:", currentExerciseType);
        return;
    }

    // Si es ejercicio isométrico (de tiempo)
    if (config.isometric) {
        handleTimedExercise(landmarks);
        return;
    }

    try {
        // Obtener los 3 puntos necesarios
        const pointA = landmarks[config.landmarks.shoulder || config.landmarks.hip];
        const pointB = landmarks[config.landmarks.elbow || config.landmarks.knee];
        const pointC = landmarks[config.landmarks.wrist || config.landmarks.ankle];

        if (!pointA || !pointB || !pointC) {
            console.log("⚠️ No se detectaron todos los puntos necesarios");
            return;
        }

        // Calcular ángulo
        const angle = calculateAngle(pointA, pointB, pointC);

        // Lógica de conteo basada en el ángulo
        countRepetition(angle, config.thresholds);

        // Mostrar feedback visual en el canvas
        displayAngleFeedback(angle, config.thresholds);

    } catch (error) {
        console.error("Error al procesar repeticiones:", error);
    }
}

// Manejar ejercicios isométricos (de tiempo)
function handleTimedExercise(landmarks) {
    // Detectar si la persona está en posición correcta (cualquier pose detectada = está haciendo el ejercicio)
    if (landmarks && landmarks.length > 0) {
        // Si no ha empezado el cronómetro, iniciarlo
        if (!timedExerciseStartTime) {
            timedExerciseStartTime = Date.now();
            startTimedExerciseCounter();
            console.log("⏱️ Iniciando cronómetro de ejercicio isométrico");
        }
    } else {
        // Si no hay pose, pausar
        if (timedExerciseStartTime) {
            pauseTimedExercise();
        }
    }
}

// Iniciar contador de tiempo
function startTimedExerciseCounter() {
    if (timedExerciseInterval) return; // Ya está corriendo

    timedExerciseInterval = setInterval(() => {
        if (timedExerciseStartTime) {
            timedExerciseElapsed = Math.floor((Date.now() - timedExerciseStartTime) / 1000);
            updateTimedExerciseDisplay();

            // Verificar si alcanzó el objetivo
            if (targetTime > 0 && timedExerciseElapsed >= targetTime) {
                completeTimedExercise();
            }
        }
    }, 100);
}

// Pausar ejercicio de tiempo
function pauseTimedExercise() {
    if (timedExerciseInterval) {
        clearInterval(timedExerciseInterval);
        timedExerciseInterval = null;
    }
}

// Completar ejercicio de tiempo
function completeTimedExercise() {
    pauseTimedExercise();
    
    // Vibración y sonido
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    const sound = document.getElementById('timer-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play blocked"));
    }

    console.log("✅ ¡Ejercicio de tiempo completado!");

    // Esperar 2 segundos y pasar al siguiente
    setTimeout(() => {
        if (typeof nextExercise === 'function') {
            nextExercise();
        }
    }, 2000);
}

// Actualizar display de tiempo
function updateTimedExerciseDisplay() {
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        const minutes = Math.floor(timedExerciseElapsed / 60);
        const seconds = timedExerciseElapsed % 60;
        repDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Cambiar color según progreso
        if (targetTime > 0) {
            const progress = (timedExerciseElapsed / targetTime) * 100;
            if (progress >= 100) {
                repDisplay.style.color = '#10b981'; // Verde
            } else if (progress >= 50) {
                repDisplay.style.color = '#eab308'; // Amarillo
            }
        }
    }
}

// Contar repetición basada en ángulo
function countRepetition(angle, thresholds) {
    // Detectar posición "arriba" (extensión)
    if (angle > thresholds.up) {
        if (exerciseStage !== 'up') {
            exerciseStage = 'up';
        }
    }

    // Detectar posición "abajo" (flexión)
    if (angle < thresholds.down && exerciseStage === 'up') {
        exerciseStage = 'down';
        
        // ¡REPETICIÓN COMPLETADA!
        incrementRepCounter();
    }
}

// Incrementar contador de repeticiones
function incrementRepCounter() {
    repCounter++;
    updateRepDisplay();
    
    // Feedback sonoro
    const sound = document.getElementById('rep-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play blocked"));
    }

    // Vibración (si está disponible)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    console.log(`✅ Repetición #${repCounter}/${targetReps}`);

    // Verificar si completó el objetivo
    if (targetReps > 0 && repCounter >= targetReps) {
        completeExercise();
    }
}

// Completar ejercicio (alcanzó el objetivo)
function completeExercise() {
    console.log("🎉 ¡Ejercicio completado!");

    // Vibración especial
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Sonido de completado
    const sound = document.getElementById('timer-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play blocked"));
    }

    // Mostrar feedback visual
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        repDisplay.style.color = '#10b981'; // Verde
        repDisplay.style.transform = 'scale(1.5)';
        
        setTimeout(() => {
            repDisplay.style.transform = 'scale(1)';
        }, 500);
    }

    // Esperar 2 segundos y pasar al siguiente ejercicio
    setTimeout(() => {
        if (typeof nextExercise === 'function') {
            nextExercise();
        }
    }, 2000);
}

// Actualizar display del contador
function updateRepDisplay() {
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        repDisplay.textContent = repCounter;
        repDisplay.style.color = '#34d399'; // Verde esmeralda
        
        // Animación de pulso
        repDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            repDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

// Resetear contador
function resetRepCounter() {
    repCounter = 0;
    exerciseStage = null;
    timedExerciseStartTime = null;
    timedExerciseElapsed = 0;
    pauseTimedExercise();
    
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        repDisplay.style.color = '#34d399';
    }
    
    updateRepDisplay();
    console.log("🔄 Contador reseteado");
}

// Establecer ejercicio actual
function setCurrentExercise(exerciseName, reps, seconds) {
    currentExerciseType = exerciseName;
    resetRepCounter();
    
    // Parsear objetivo de repeticiones
    if (reps && reps !== 'Fallo') {
        const match = reps.match(/\d+/);
        targetReps = match ? parseInt(match[0]) : 0;
    } else {
        targetReps = 0; // Sin límite
    }

    // Verificar si es ejercicio de tiempo
    const config = EXERCISE_CONFIG[exerciseName];
    isTimedExercise = config && config.isometric;
    targetTime = seconds || 0;

    console.log("🎯 Ejercicio configurado:", exerciseName);
    console.log(`📊 Objetivo: ${targetReps > 0 ? targetReps + ' reps' : (targetTime > 0 ? targetTime + 's' : 'Fallo')}`);
    
    if (config) {
        console.log("✅ Conteo automático disponible");
    } else {
        console.log("ℹ️ Sin conteo automático. Usa el contador manual.");
    }
}

// Feedback visual de ángulo (dibujar en canvas)
function displayAngleFeedback(angle, thresholds) {
    const canvas = document.getElementById('pose-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Determinar color según rango
    let color = '#FFD700'; // Amarillo por defecto
    if (angle > thresholds.up) {
        color = '#00FF88'; // Verde - posición correcta arriba
    } else if (angle < thresholds.down) {
        color = '#FF6B6B'; // Rojo - posición correcta abajo
    }

    // Dibujar indicador de ángulo
    ctx.save();
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    
    const text = `${Math.round(angle)}°`;
    const x = canvas.width / 2;
    const y = 50;
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Obtener contador actual
function getCurrentRepCount() {
    return repCounter;
}

// Verificar si el ejercicio soporta conteo automático
function supportsAutoCount(exerciseName) {
    return !!EXERCISE_CONFIG[exerciseName];
}