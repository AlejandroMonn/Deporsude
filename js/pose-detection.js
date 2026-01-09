// =====================================================
// POSE DETECTION ENGINE - MediaPipe
// =====================================================

let pose = null;
let camera = null;
let canvasCtx = null;
let poseActive = false;
let currentLandmarks = null;

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
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
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
        width: 640,
        height: 480
    });

    console.log("✅ MediaPipe inicializado correctamente");
}

// Callback de resultados de detección
function onPoseResults(results) {
    if (!canvasCtx) return;

    const canvasElement = document.getElementById('pose-canvas');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Dibujar la imagen de video
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

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

        // Procesar para conteo de repeticiones
        if (typeof processRepCount === 'function') {
            processRepCount(results.poseLandmarks);
        }
    } else {
        currentLandmarks = null;
        updatePoseStatus(false);
    }

    canvasCtx.restore();
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

    // Ajustar tamaño del canvas
    canvasElement.width = 640;
    canvasElement.height = 480;

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