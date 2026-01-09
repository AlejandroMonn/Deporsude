// Variables para el modo entrenamiento
let activeExercisesList = [];
let currentExerciseIndex = 0;
let timerInterval = null;

// --- 1. Lógica de Recomendación Automática ---
function checkDailyRecommendation() {
    const day = new Date().getDay(); // 0=Domingo, 1=Lunes, ...
    const recDiv = document.getElementById('daily-recommendation');
    const dayNameSpan = document.getElementById('day-name');
    
    // Días: Lunes(1), Jueves(4) -> Rutina A
    // Días: Martes(2), Viernes(5) -> Rutina B
    // Miércoles(3), Sábado(6), Domingo(0) -> Descanso o A (opcional)
    
    let recommended = 'Rest';
    let dayName = '';

    const daysMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    dayName = daysMap[day];

    if(day === 1 || day === 4) recommended = 'A';
    else if(day === 2 || day === 5) recommended = 'B';
    
    // Auto-seleccionar si es día de entreno
    if(recommended !== 'Rest') {
        currentRoutineKey = recommended;
        renderDaySelector(appData.phases.find(p => p.id === currentPhaseId).routines); // Actualizar UI visual
        loadRoutine(recommended); // Cargar ejercicios
        
        recDiv.classList.remove('hidden');
        recDiv.innerHTML = `<i class="fas fa-calendar-check mr-1"></i> Hoy es ${dayName}: Te recomendamos <b>Rutina ${recommended}</b>`;
    } else {
        recDiv.classList.remove('hidden');
        recDiv.classList.replace('text-emerald-400', 'text-slate-500');
        recDiv.innerHTML = `<i class="fas fa-bed mr-1"></i> Hoy es ${dayName}: Día de Descanso o Repaso.`;
    }
}

// Llamar a esto al iniciar la app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setTimeout(checkDailyRecommendation, 500); // Pequeño delay para asegurar carga
});


// --- 2. Funciones del Modo Rutina (Workout Flow) ---

function startRoutineFlow() {
    // 1. Obtener ejercicios actuales
    const phase = appData.phases.find(p => p.id === currentPhaseId);
    if (!phase) return;
    activeExercisesList = phase.routines[currentRoutineKey].exercises;
    
    // 2. Resetear índices
    currentExerciseIndex = 0;
    
    // 3. Mostrar Overlay
    document.getElementById('workout-mode').classList.remove('hidden');
    document.getElementById('workout-mode').classList.add('flex');
    
    // 4. Cargar primer ejercicio
    loadActiveExercise();
}

function loadActiveExercise() {
    const ex = activeExercisesList[currentExerciseIndex];
    
    // Actualizar Textos
    document.getElementById('wo-title').innerText = ex.n;
    document.getElementById('wo-sets').innerText = ex.s.includes('x') ? ex.s.split('x')[0] + " Series" : "3 Series";
    document.getElementById('wo-reps').innerText = ex.s.includes('x') ? ex.s.split('x')[1] : ex.s;
    document.getElementById('wo-note').innerText = ex.note;
    document.getElementById('wo-progress').innerText = `Ejercicio ${currentExerciseIndex + 1}/${activeExercisesList.length}`;

    // Video (Convertir link de youtube normal a embed si es necesario, o usar el link directo)
    // Nota: Para que el video se vea bien dentro del app, idealmente usa links "embed". 
    // Si usas links de búsqueda (search_query), esto abrirá YouTube. Para la demo visual usaremos un placeholder o intentaremos cargar.
    // Hack simple: Si es link de búsqueda, mostramos un icono gigante de play.
    const videoFrame = document.getElementById('wo-video');
    if(ex.v.includes("embed")) {
        videoFrame.src = ex.v; 
        videoFrame.classList.remove('hidden');
    } else {
        // Si no es embed, dejamos el iframe vacío o ponemos un video genérico de loop fitnes
        // Ojo: YouTube bloqueará search_results en iframe. 
        // Solución Provisoria: Poner un video de "Gym Background"
        videoFrame.src = "https://www.youtube.com/embed/videoseries?list=PL_J8l4H9C_2w4-J3B7y8"; 
    }

    // Configurar Timer si es necesario
    const timerOverlay = document.getElementById('timer-overlay');
    const btnTimer = document.getElementById('btn-start-timer');
    
    if (ex.seconds) {
        timerOverlay.classList.remove('hidden'); // Mostrar pantalla negra del timer
        btnTimer.classList.remove('hidden');     // Mostrar botón iniciar
        document.getElementById('timer-display').innerText = formatTime(ex.seconds);
        btnTimer.onclick = () => runTimer(ex.seconds);
    } else {
        timerOverlay.classList.add('hidden');
        btnTimer.classList.add('hidden');
        stopTimer();
    }
}

function nextExercise() {
    stopTimer(); // Asegurar que no suene si cambian rápido
    
    if (currentExerciseIndex < activeExercisesList.length - 1) {
        currentExerciseIndex++;
        loadActiveExercise();
    } else {
        // Fin de la rutina
        closeWorkout();
        alert("¡Entrenamiento Terminado! 🔥 No olvides tu cinta bucal hoy.");
        // Aquí podrías lanzar confeti
    }
}

function closeWorkout() {
    stopTimer();
    document.getElementById('workout-mode').classList.add('hidden');
    document.getElementById('workout-mode').classList.remove('flex');
}

// --- 3. Lógica del Temporizador ---

function runTimer(seconds) {
    let timeLeft = seconds;
    const display = document.getElementById('timer-display');
    const btn = document.getElementById('btn-start-timer');
    const sound = document.getElementById('timer-sound');
    
    btn.classList.add('hidden'); // Ocultar botón mientras corre
    
    clearInterval(timerInterval);
    display.innerText = formatTime(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        display.innerText = formatTime(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            sound.play(); // SONIDO
            display.innerText = "¡LISTO!";
            display.classList.add('text-green-500');
            
            // Vibrar celular si es posible
            if(navigator.vibrate) navigator.vibrate([200, 100, 200]);

            setTimeout(() => {
                 display.classList.remove('text-green-500');
                 nextExercise(); // AVANZAR AUTOMÁTICAMENTE (Opcional, o esperar click)
            }, 1500);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function toggleSound() {
    const audio = document.getElementById('timer-sound');
    audio.muted = !audio.muted;
    document.getElementById('sound-icon').className = audio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
}