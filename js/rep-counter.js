// =====================================================
// CONTADOR INTELIGENTE DE REPETICIONES
// =====================================================

let repCounter = 0;
let exerciseStage = null; // 'up', 'down', null
let currentExerciseType = null;
let targetReps = 0; // Repeticiones objetivo POR SERIE
let targetSets = 0; // Número de series objetivo
let currentSet = 1; // Serie actual
let targetTime = 0; // Tiempo objetivo en segundos
let isTimedExercise = false;
let timedExerciseStartTime = null;
let timedExerciseElapsed = 0;
let timedExerciseInterval = null;
let poseDetectedInLastFrame = false;
let isResting = false; // Flag para periodo de descanso
let restInterval = null;
let restTimeRemaining = 0;

// Configuración de ejercicios con sus landmarks y umbrales
const EXERCISE_CONFIG = {
    // FLEXIONES (Push-ups)
    'Push-ups (Flexiones)': {
        type: 'pushup',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 90
        },
        validation: (landmarks) => {
            // Validar que el cuerpo esté horizontal (posición de flexión)
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            const ankle = landmarks[27];
            
            if (!shoulder || !hip || !ankle) return false;
            
            // Verificar alineación corporal (cuerpo recto)
            const bodyAngle = calculateAngle(shoulder, hip, ankle);
            return bodyAngle > 160; // Cuerpo debe estar recto
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
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            if (!shoulder || !hip) return false;
            const bodyAngle = calculateAngle(shoulder, hip, landmarks[27]);
            return bodyAngle > 160;
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
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            if (!shoulder || !hip) return false;
            const bodyAngle = calculateAngle(shoulder, hip, landmarks[27]);
            return bodyAngle > 160;
        }
    },
    
    // SENTADILLAS
    'Goblet Squat': {
        type: 'squat',
        landmarks: {
            hip: 23,
            knee: 25,
            ankle: 27
        },
        thresholds: {
            up: 160,
            down: 90
        },
        validation: (landmarks) => {
            // Validar que está de pie (no sentado ni acostado)
            const hip = landmarks[23];
            const knee = landmarks[25];
            const ankle = landmarks[27];
            
            if (!hip || !knee || !ankle) return false;
            
            // Verificar que las piernas están visibles y en posición vertical
            const hipY = hip.y;
            const ankleY = ankle.y;
            
            // La cadera debe estar más arriba que los tobillos
            return hipY < ankleY - 0.1;
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
        },
        validation: (landmarks) => {
            const hip = landmarks[23];
            const ankle = landmarks[27];
            if (!hip || !ankle) return false;
            return hip.y < ankle.y - 0.1;
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
        },
        validation: (landmarks) => {
            // Validar que está de pie (hombros más arriba que caderas)
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            
            if (!shoulder || !hip) return false;
            
            // Verificar postura vertical
            return shoulder.y < hip.y;
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
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            if (!shoulder || !hip) return false;
            return shoulder.y < hip.y;
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
        },
        validation: (landmarks) => {
            const hip = landmarks[23];
            const ankle = landmarks[27];
            if (!hip || !ankle) return false;
            return hip.y < ankle.y;
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
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            const ankle = landmarks[27];
            
            if (!shoulder || !hip || !ankle) return false;
            
            // Verificar que está de pie
            return hip.y < ankle.y;
        }
    },

    // REMOS
    'Remo Sentado (Banda)': {
        type: 'row',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 60
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const elbow = landmarks[13];
            if (!shoulder || !elbow) return false;
            return true; // Más flexible para remos
        }
    },

    'Remo Inclinado (Mixto)': {
        type: 'row',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 160,
            down: 60
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            if (!shoulder || !hip) return false;
            return true;
        }
    },

    // ELEVACIONES
    'Elevaciones Laterales': {
        type: 'lateral_raise',
        landmarks: {
            shoulder: 11,
            elbow: 13,
            wrist: 15
        },
        thresholds: {
            up: 90,  // Brazos arriba (horizontal)
            down: 20  // Brazos abajo
        },
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const wrist = landmarks[15];
            if (!shoulder || !wrist) return false;
            return shoulder.y < landmarks[23].y; // De pie
        }
    },

    // EJERCICIOS ISOMÉTRICOS (TIEMPO)
    'Dead Bug (Core)': {
        type: 'timed',
        isometric: true,
        validation: (landmarks) => {
            // Debe estar acostado (hombros y caderas al mismo nivel aprox)
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            
            if (!shoulder || !hip) return false;
            
            // Verificar que está horizontal (diferencia Y pequeña)
            const diff = Math.abs(shoulder.y - hip.y);
            return diff < 0.15;
        }
    },

    'Plancha Abdominal': {
        type: 'timed',
        isometric: true,
        validation: (landmarks) => {
            // Cuerpo horizontal, hombros y caderas alineados
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            const ankle = landmarks[27];
            
            if (!shoulder || !hip || !ankle) return false;
            
            // Verificar alineación corporal
            const bodyAngle = calculateAngle(shoulder, hip, ankle);
            return bodyAngle > 160 && bodyAngle < 190;
        }
    },

    'Plancha con Toque': {
        type: 'timed',
        isometric: true,
        validation: (landmarks) => {
            const shoulder = landmarks[11];
            const hip = landmarks[23];
            const ankle = landmarks[27];
            
            if (!shoulder || !hip || !ankle) return false;
            
            const bodyAngle = calculateAngle(shoulder, hip, ankle);
            return bodyAngle > 160 && bodyAngle < 190;
        }
    }
};

// Procesar landmarks para contar repeticiones
function processRepCount(landmarks) {
    if (!currentExerciseType || !landmarks || isResting) return;

    const config = EXERCISE_CONFIG[currentExerciseType];
    if (!config) return;

    // VALIDACIÓN CRÍTICA: Verificar que está haciendo el ejercicio correcto
    const isValidPose = config.validation ? config.validation(landmarks) : true;
    
    if (!isValidPose) {
        poseDetectedInLastFrame = false;
        updatePoseValidation(false);
        
        // Si es ejercicio de tiempo, pausar
        if (config.isometric && isTimedExercise && timedExerciseStartTime) {
            console.log("⚠️ Pose incorrecta - pausando cronómetro");
        }
        return;
    }

    // Pose válida
    updatePoseValidation(true);

    // Si es ejercicio isométrico (de tiempo)
    if (config.isometric && isTimedExercise) {
        handleTimedExercise(landmarks, config);
        return;
    }

    try {
        // Obtener los 3 puntos necesarios
        const pointA = landmarks[config.landmarks.shoulder || config.landmarks.hip];
        const pointB = landmarks[config.landmarks.elbow || config.landmarks.knee];
        const pointC = landmarks[config.landmarks.wrist || config.landmarks.ankle];

        if (!pointA || !pointB || !pointC) return;

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

// Actualizar validación visual de pose
function updatePoseValidation(isValid) {
    const canvas = document.getElementById('pose-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Mostrar indicador de validación en esquina superior izquierda
    ctx.save();
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    
    if (isValid) {
        ctx.fillStyle = '#10b981';
        ctx.fillText('✓ Postura Correcta', 10, 30);
    } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('✗ Postura Incorrecta', 10, 30);
    }
    
    ctx.restore();
}

// Manejar ejercicios isométricos (de tiempo)
function handleTimedExercise(landmarks, config) {
    const poseDetected = landmarks && landmarks.length > 10;
    
    if (poseDetected) {
        poseDetectedInLastFrame = true;
        
        // Si no ha empezado el cronómetro, iniciarlo
        if (!timedExerciseStartTime) {
            timedExerciseStartTime = Date.now();
            startTimedExerciseCounter();
            console.log("⏱️ Iniciando cronómetro de ejercicio isométrico");
            updateTimedExerciseStatus('started');
        }
    } else {
        // Si perdió la pose, pausar pero no resetear
        if (poseDetectedInLastFrame && timedExerciseStartTime) {
            console.log("⚠️ Pose perdida - pausando cronómetro");
            // Pausar tiempo (congelar el elapsed actual)
            const elapsed = Math.floor((Date.now() - timedExerciseStartTime) / 1000);
            timedExerciseStartTime = Date.now() - (elapsed * 1000); // Mantener el tiempo
            updateTimedExerciseStatus('paused');
        }
        poseDetectedInLastFrame = false;
    }
}

// Actualizar estado visual de ejercicio de tiempo
function updateTimedExerciseStatus(status) {
    const statusElement = document.getElementById('pose-status');
    if (!statusElement) return;

    if (status === 'started') {
        statusElement.className = "absolute top-4 right-4 px-3 py-2 rounded-full font-bold text-xs flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        statusElement.innerHTML = '<i class="fas fa-stopwatch"></i><span>Cronómetro activo</span>';
    } else if (status === 'paused') {
        statusElement.className = "absolute top-4 right-4 px-3 py-2 rounded-full font-bold text-xs flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        statusElement.innerHTML = '<i class="fas fa-pause"></i><span>Pausado</span>';
    }
}

// Iniciar contador de tiempo
function startTimedExerciseCounter() {
    if (timedExerciseInterval) return;

    timedExerciseInterval = setInterval(() => {
        // Solo contar si hay pose detectada
        if (timedExerciseStartTime && poseDetectedInLastFrame && !isResting) {
            timedExerciseElapsed = Math.floor((Date.now() - timedExerciseStartTime) / 1000);
            updateTimedExerciseDisplay();

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
    
    console.log("✅ ¡Serie de tiempo completada!");

    if (currentSet < targetSets) {
        currentSet++;
        
        // Vibración y sonido
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        const sound = document.getElementById('rep-sound');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play blocked"));
        }

        // Resetear para la siguiente serie
        timedExerciseStartTime = null;
        timedExerciseElapsed = 0;
        poseDetectedInLastFrame = false;
        
        updateSetDisplay();
        startRestPeriod(30); // 30 segundos de descanso
        
        console.log(`📊 Serie ${currentSet}/${targetSets} - Descansa 30s`);
    } else {
        completeAllSets();
    }
}

// INICIAR PERIODO DE DESCANSO
function startRestPeriod(seconds) {
    isResting = true;
    restTimeRemaining = seconds;
    
    const repDisplay = document.getElementById('rep-count');
    const statusElement = document.getElementById('pose-status');
    
    if (statusElement) {
        statusElement.className = "absolute top-4 right-4 px-3 py-2 rounded-full font-bold text-xs flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse";
        statusElement.innerHTML = `<i class="fas fa-mug-hot"></i><span>Descansa ${restTimeRemaining}s</span>`;
    }
    
    if (restInterval) clearInterval(restInterval);
    
    restInterval = setInterval(() => {
        restTimeRemaining--;
        
        if (statusElement) {
            statusElement.innerHTML = `<i class="fas fa-mug-hot"></i><span>Descansa ${restTimeRemaining}s</span>`;
        }
        
        if (restTimeRemaining <= 0) {
            clearInterval(restInterval);
            isResting = false;
            
            if (statusElement) {
                statusElement.className = "absolute top-4 right-4 px-3 py-2 rounded-full font-bold text-xs flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                statusElement.innerHTML = '<i class="fas fa-play"></i><span>¡Siguiente serie!</span>';
            }
            
            // Resetear display para la nueva serie
            if (repDisplay && !isTimedExercise) {
                repDisplay.textContent = '0:00';
                repDisplay.style.color = '#34d399';
            }
            
            console.log("✅ Descanso terminado - ¡A trabajar!");
        }
    }, 1000);
}

// Actualizar display de tiempo
function updateTimedExerciseDisplay() {
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        const minutes = Math.floor(timedExerciseElapsed / 60);
        const seconds = timedExerciseElapsed % 60;
        repDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (targetTime > 0) {
            const progress = (timedExerciseElapsed / targetTime) * 100;
            if (progress >= 90) {
                repDisplay.style.color = '#10b981';
            } else if (progress >= 50) {
                repDisplay.style.color = '#eab308';
            } else {
                repDisplay.style.color = '#34d399';
            }
        }
    }
}

// Contar repetición basada en ángulo
function countRepetition(angle, thresholds) {
    if (isResting) return; // No contar durante descanso

    if (angle > thresholds.up) {
        if (exerciseStage !== 'up') {
            exerciseStage = 'up';
        }
    }

    if (angle < thresholds.down && exerciseStage === 'up') {
        exerciseStage = 'down';
        incrementRepCounter();
    }
}

// Incrementar contador de repeticiones
function incrementRepCounter() {
    repCounter++;
    updateRepDisplay();
    
    const sound = document.getElementById('rep-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play blocked"));
    }

    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    console.log(`✅ Repetición #${repCounter}/${targetReps} - Serie ${currentSet}/${targetSets}`);

    if (targetReps > 0 && repCounter >= targetReps) {
        completeSet();
    }
}

// Completar una serie
function completeSet() {
    console.log(`🎯 Serie ${currentSet}/${targetSets} completada!`);

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    const sound = document.getElementById('timer-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play blocked"));
    }

    if (currentSet < targetSets) {
        currentSet++;
        repCounter = 0;
        exerciseStage = null;
        
        updateRepDisplay();
        updateSetDisplay();
        startRestPeriod(30); // 30 segundos de descanso
        
        console.log(`📊 Descansando 30s antes de la serie ${currentSet}/${targetSets}`);
    } else {
        completeAllSets();
    }
}

// Completar todas las series del ejercicio
function completeAllSets() {
    console.log("🔥 ¡Todas las series completadas!");

    if (restInterval) clearInterval(restInterval);
    isResting = false;

    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    const sound = document.getElementById('timer-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play blocked"));
    }

    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        repDisplay.style.color = '#10b981';
        repDisplay.style.transform = 'scale(1.5)';
        repDisplay.textContent = '✓ LISTO';
        
        setTimeout(() => {
            repDisplay.style.transform = 'scale(1)';
        }, 500);
    }

    setTimeout(() => {
        if (typeof nextExercise === 'function') {
            nextExercise();
        }
    }, 2000);
}

// Actualizar display del contador de repeticiones
function updateRepDisplay() {
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay && !isTimedExercise) {
        repDisplay.textContent = `${repCounter}/${targetReps}`;
        repDisplay.style.color = '#34d399';
        
        repDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            repDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

// Actualizar display de series
function updateSetDisplay() {
    const setsDisplay = document.getElementById('wo-sets');
    if (setsDisplay) {
        setsDisplay.textContent = `Serie ${currentSet}/${targetSets}`;
        setsDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            setsDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

// Resetear contador
function resetRepCounter() {
    repCounter = 0;
    currentSet = 1;
    exerciseStage = null;
    timedExerciseStartTime = null;
    timedExerciseElapsed = 0;
    poseDetectedInLastFrame = false;
    isResting = false;
    pauseTimedExercise();
    
    if (restInterval) {
        clearInterval(restInterval);
        restInterval = null;
    }
    
    const repDisplay = document.getElementById('rep-count');
    if (repDisplay) {
        repDisplay.style.color = '#34d399';
        repDisplay.style.transform = 'scale(1)';
    }
    
    updateRepDisplay();
    console.log("🔄 Contador reseteado");
}

// Establecer ejercicio actual
function setCurrentExercise(exerciseName, sets, reps, seconds) {
    currentExerciseType = exerciseName;
    resetRepCounter();
    
    const setsMatch = sets ? sets.match(/\d+/) : null;
    targetSets = setsMatch ? parseInt(setsMatch[0]) : 3;
    
    if (reps && reps !== 'Fallo') {
        const match = reps.match(/\d+/);
        targetReps = match ? parseInt(match[0]) : 0;
    } else {
        targetReps = 0;
    }

    const config = EXERCISE_CONFIG[exerciseName];
    isTimedExercise = config && config.isometric;
    targetTime = seconds || 0;

    console.log("🎯 Ejercicio configurado:", exerciseName);
    console.log(`📊 Objetivo: ${targetSets} series de ${targetReps > 0 ? targetReps + ' reps' : (targetTime > 0 ? targetTime + 's' : 'Fallo')}`);
    
    updateSetDisplay();
    
    if (isTimedExercise) {
        const repDisplay = document.getElementById('rep-count');
        if (repDisplay) {
            repDisplay.textContent = '0:00';
        }
    } else {
        updateRepDisplay();
    }
    
    if (config) {
        console.log("✅ Conteo automático disponible");
    } else {
        console.log("ℹ️ Sin conteo automático.");
    }
}

// Feedback visual de ángulo
function displayAngleFeedback(angle, thresholds) {
    const canvas = document.getElementById('pose-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    let color = '#FFD700';
    if (angle > thresholds.up) {
        color = '#00FF88';
    } else if (angle < thresholds.down) {
        color = '#FF6B6B';
    }

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

function getCurrentRepCount() {
    return repCounter;
}

function supportsAutoCount(exerciseName) {
    return !!EXERCISE_CONFIG[exerciseName];
}