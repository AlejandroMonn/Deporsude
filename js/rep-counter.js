// =====================================================
// CONTADOR INTELIGENTE DE REPETICIONES
// =====================================================

let repCounter = 0;
let exerciseStage = null; // 'up', 'down', null
let currentExerciseType = null;

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

        // Mostrar feedback visual en el canvas (opcional)
        displayAngleFeedback(angle, config.thresholds);

    } catch (error) {
        console.error("Error al procesar repeticiones:", error);
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

    console.log(`✅ Repetición #${repCounter}`);
}

// Actualizar display del contador
function updateRepDisplay() {
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        repDisplay.textContent = repCounter;
        
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
    updateRepDisplay();
    console.log("🔄 Contador reseteado");
}

// Establecer ejercicio actual
function setCurrentExercise(exerciseName) {
    currentExerciseType = exerciseName;
    resetRepCounter();
    console.log("🎯 Ejercicio configurado:", exerciseName);
    
    const config = EXERCISE_CONFIG[exerciseName];
    if (config) {
        console.log("✅ Conteo automático disponible para:", exerciseName);
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