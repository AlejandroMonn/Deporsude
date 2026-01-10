// =====================================================
// POSE DETECTION ENGINE - MediaPipe
// =====================================================

let pose = null;
let camera = null;
let canvasCtx = null;
let poseActive = false;
let currentLandmarks = null;
let gestureDetector = null;

// Variables para detección de gestos
let leftHandRaised = false;
let rightHandRaised = false;
let gestureHoldTime = 0;
let lastGestureCheck = Date.now();

// Inicializar MediaPipe Pose
function initPoseDetection() {
    console.log("🎯 Inicializando MediaPipe Pose...");
    
    const videoElement = document.getElementById('pose-video');
    const canvasElement = document.getElementById('pose-canvas');
    
    if (!videoElement || !canvasElement) {
        console.error("❌ No se encontraron elementos de video/canvas");
        return;
    }

    canvasCtx = canvasElement.getContext('2d');

    // Configurar MediaPipe Pose
    pose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });

    // Callback cuando se detecta una pose
    pose.onResults(onPoseResults);

    // Inicializar cámara
    camera = new Camera(videoElement, {
        onFrame: async () => {
            if (poseActive) {
                await pose.send({image: videoElement});
            }
        },
        width: 1280,
        height: 720
    });

    console.log("✅ MediaPipe inicializado correctamente");
}

// Callback de resultados de detección
function onPoseResults(results) {
    if (!canvasCtx) return;

    const canvasElement = document.getElementById('pose-canvas');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Dibujar la imagen de video (espejo)
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvasElement.width, 0);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);

    if (results.poseLandmarks) {
        currentLandmarks = results.poseLandmarks;
        
        // Actualizar estado visual
        updatePoseStatus(true);

        // Dibujar conexiones del esqueleto
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00FF88',
            lineWidth: 4
        });

        // Dibujar puntos clave
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: '#FF0000',
            lineWidth: 2,
            radius: 6
        });

        // Detectar gestos para saltar ejercicio
        detectGestures(results.poseLandmarks);

        // Procesar para conteo de repeticiones
        if (typeof processRepCount === 'function') {
            processRepCount(results.poseLandmarks);
        }
    } else {
        currentLandmarks = null;
        updatePoseStatus(false);
        resetGestureDetection();
    }

    canvasCtx.restore();
}

// Detectar gestos para controlar la app
function detectGestures(landmarks) {
    if (!landmarks) return;

    const now = Date.now();
    
    // Puntos de referencia
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const nose = landmarks[0];

    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !nose) return;

    // GESTO: Ambas manos arriba por 2 segundos = Saltar al siguiente ejercicio
    const leftHandUp = leftWrist.y < leftShoulder.y - 0.1;
    const rightHandUp = rightWrist.y < rightShoulder.y - 0.1;
    
    if (leftHandUp && rightHandUp) {
        if (!leftHandRaised || !rightHandRaised) {
            // Inicio del gesto
            leftHandRaised = true;
            rightHandRaised = true;
            lastGestureCheck = now;
            gestureHoldTime = 0;
            console.log("🙌 Gesto detectado: Ambas manos arriba");
            showGestureIndicator('Mantén 2s para saltar ejercicio', 'yellow');
        } else {
            // Gesto mantenido
            gestureHoldTime = (now - lastGestureCheck) / 1000;
            
            if (gestureHoldTime >= 2) {
                // Gesto completado
                console.log("✅ Gesto completado - Saltando ejercicio");
                showGestureIndicator('¡Saltando!', 'green');
                triggerNextExercise();
                resetGestureDetection();
            } else {
                // Mostrar progreso
                const progress = Math.round((gestureHoldTime / 2) * 100);
                showGestureIndicator(`${progress}% - Mantén...`, 'yellow');
            }
        }
    } else {
        // Gesto interrumpido
        if (leftHandRaised || rightHandRaised) {
            console.log("❌ Gesto cancelado");
            resetGestureDetection();
        }
    }
}

// Mostrar indicador visual de gesto
function showGestureIndicator(text, color) {
    const canvas = document.getElementById('pose-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.save();
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color === 'green' ? '#10b981' : color === 'yellow' ? '#eab308' : '#ef4444';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    
    const x = canvas.width / 2;
    const y = canvas.height - 50;
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Resetear detección de gestos
function resetGestureDetection() {
    leftHandRaised = false;
    rightHandRaised = false;
    gestureHoldTime = 0;
}

// Activar siguiente ejercicio mediante gesto
function triggerNextExercise() {
    if (typeof nextExercise === 'function') {
        // Vibración de confirmación
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
        
        // Sonido
        const sound = document.getElementById('timer-sound');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio blocked"));
        }
        
        // Esperar un momento antes de cambiar
        setTimeout(() => {
            nextExercise();
        }, 500);
    }
}

// Actualizar estado visual de detección
function updatePoseStatus(detected) {
    const statusElement = document.getElementById('pose-status');
    if (!statusElement) return;

    if (detected) {
        statusElement.className = "absolute top-4 right-4 px-3 py-2 rounded-full font-bold text-xs flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>Pose detectada</span>';
    } else {
        statusElement.className = "absolute top-4 right-4 px-3 py-2 rounded-full font-bold text-xs flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        statusElement.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Buscando pose...</span>';
    }
}

// Activar detección de pose
async function startPoseDetection() {
    console.log("📹 Activando cámara...");
    
    const videoElement = document.getElementById('pose-video');
    const canvasElement = document.getElementById('pose-canvas');
    const iframeElement = document.getElementById('wo-video');
    const repCounter = document.getElementById('rep-counter');
    const poseStatus = document.getElementById('pose-status');
    const resetBtn = document.getElementById('reset-counter-btn');

    // Mostrar elementos de cámara
    videoElement.classList.remove('hidden');
    canvasElement.classList.remove('hidden');
    iframeElement.classList.add('hidden');
    repCounter.classList.remove('hidden');
    poseStatus.classList.remove('hidden');
    resetBtn.classList.remove('hidden');

    // Ajustar tamaño del canvas (más grande)
    canvasElement.width = 1280;
    canvasElement.height = 720;

    try {
        poseActive = true;
        await camera.start();
        console.log("✅ Cámara activada");
        
        // Reproducir sonido de confirmación
        const sound = document.getElementById('rep-sound');
        if (sound) sound.play().catch(e => console.log("Audio blocked"));
        
    } catch (error) {
        console.error("❌ Error al activar cámara:", error);
        alert("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
        stopPoseDetection();
    }
}

// Detener detección de pose
function stopPoseDetection() {
    console.log("⏹️ Deteniendo cámara...");
    
    poseActive = false;
    currentLandmarks = null;
    resetGestureDetection();
    
    if (camera) {
        camera.stop();
    }

    const videoElement = document.getElementById('pose-video');
    const canvasElement = document.getElementById('pose-canvas');
    const iframeElement = document.getElementById('wo-video');
    const repCounter = document.getElementById('rep-counter');
    const poseStatus = document.getElementById('pose-status');
    const resetBtn = document.getElementById('reset-counter-btn');

    // Ocultar elementos de cámara
    videoElement.classList.add('hidden');
    canvasElement.classList.add('hidden');
    iframeElement.classList.remove('hidden');
    repCounter.classList.add('hidden');
    poseStatus.classList.add('hidden');
    resetBtn.classList.add('hidden');

    console.log("✅ Cámara detenida");
}

// Calcular ángulo entre 3 puntos (A-B-C)
function calculateAngle(pointA, pointB, pointC) {
    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) - 
                    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
    
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    
    return angle;
}

// Obtener landmarks actuales
function getCurrentLandmarks() {
    return currentLandmarks;
}

// Verificar si la pose está activa
function isPoseActive() {
    return poseActive;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que MediaPipe se cargue
    setTimeout(() => {
        try {
            initPoseDetection();
        } catch (error) {
            console.error("Error al inicializar MediaPipe:", error);
        }
    }, 1000);
});