// --- ESTADO GLOBAL ---
let currentPhaseId = 1;
let currentWeekNum = 1;
let currentRoutineKey = 'A';

// Variables para el modo entrenamiento
let activeExercisesList = [];
let currentExerciseIndex = 0;
let timerInterval = null;
let cameraMode = true; // TRUE = Cámara AI activada por defecto

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Verificación de seguridad: ¿Existen los datos?
    if (typeof appData === 'undefined') {
        console.error("ERROR CRÍTICO: No se encontró appData. Verifica que data.js esté cargado antes que main.js");
        alert("Error: No se pudieron cargar los datos de entrenamiento.");
        return;
    }

    initApp();
    
    // Cargar hábitos guardados
    loadHabits();

    // Pequeño delay para la recomendación diaria
    setTimeout(checkDailyRecommendation, 500);
});

function initApp() {
    console.log("Iniciando App...");
    renderPhases();
    // Cargar Fase 1 por defecto
    loadPhase(1); 
}

// --- RENDERIZADO ---

function renderPhases() {
    const container = document.getElementById('phase-selector');
    if (!container) return console.error("Falta el elemento ID: phase-selector");
    
    container.innerHTML = '';
    
    appData.phases.forEach(phase => {
        const btn = document.createElement('button');
        // Estilos base
        btn.className = `phase-btn border border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center text-center group transition-all duration-300 hover:bg-slate-800`;
        btn.onclick = () => loadPhase(phase.id);
        btn.id = `phase-btn-${phase.id}`;
        
        btn.innerHTML = `
            <span class="text-[10px] font-black uppercase text-slate-300 group-[.active]:text-white pointer-events-none">${phase.name}</span>
            <span class="text-[9px] text-slate-500 leading-tight mt-1 group-[.active]:text-blue-200 pointer-events-none">${phase.label}</span>
        `;
        container.appendChild(btn);
    });
}

function loadPhase(id) {
    currentPhaseId = id;
    const phaseData = appData.phases.find(p => p.id === id);
    if (!phaseData) return;

    // 1. Actualizar Botones Activos
    document.querySelectorAll('.phase-btn').forEach(b => {
        b.classList.remove('active', 'bg-blue-600', 'border-blue-500');
        b.classList.add('border-slate-700');
    });
    
    const activeBtn = document.getElementById(`phase-btn-${id}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-600', 'border-blue-500');
        activeBtn.classList.remove('border-slate-700');
    }
    
    // 2. Actualizar Badge Header
    const badge = document.getElementById('current-phase-badge');
    if (badge) badge.innerText = phaseData.name;

    // 3. Actualizar Barra IMC
    const bar = document.getElementById('imc-bar');
    if (bar) {
        const imcProgress = id === 1 ? 20 : (id === 2 ? 60 : 100);
        bar.style.width = `${imcProgress}%`;
    }

    renderWeeks(phaseData.weeks);
    renderDaySelector(phaseData.routines);
    loadRoutine(currentRoutineKey); 
}

function renderWeeks(weeks) {
    const container = document.getElementById('week-selector');
    if (!container) return;
    container.innerHTML = '';

    weeks.forEach(week => {
        const btn = document.createElement('button');
        const isActive = currentWeekNum === week.num;
        // Clases condicionales
        const activeClass = isActive ? 'bg-slate-700 text-blue-400 border-blue-500' : 'text-slate-500 border-slate-800 hover:bg-slate-900';
        
        btn.className = `week-btn flex-shrink-0 px-4 py-2 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all ${activeClass}`;
        btn.innerHTML = `Sem ${week.num}: <span class="font-normal opacity-70">${week.focus}</span>`;
        
        btn.onclick = () => {
            currentWeekNum = week.num;
            renderWeeks(weeks); // Re-render para actualizar estilos
        };
        container.appendChild(btn);
    });
}

function renderDaySelector(routines) {
    const container = document.getElementById('day-selector');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(routines).forEach(key => {
        const routine = routines[key];
        const isActive = currentRoutineKey === key;
        const activeClass = isActive ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300';

        const btn = document.createElement('button');
        btn.className = `day-btn flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeClass}`;
        
        // Extraer nombre corto
        const shortName = key === 'A' ? (routine.name.split(':')[1] || 'Rutina A') : (routine.name.split(':')[1] || 'Rutina B');
        btn.innerText = shortName;
        
        btn.onclick = () => {
            currentRoutineKey = key;
            renderDaySelector(routines); 
            loadRoutine(key);
        };
        container.appendChild(btn);
    });
}

function loadRoutine(key) {
    const phaseData = appData.phases.find(p => p.id === currentPhaseId);
    if (!phaseData) return;
    
    const routine = phaseData.routines[key];
    const container = document.getElementById('exercise-list');
    if (!container) return;
    
    // Efecto de desvanecimiento
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.innerHTML = '';
        
        // Info Header
        const infoDiv = document.createElement('div');
        infoDiv.className = "mb-4 px-2";
        infoDiv.innerHTML = `
            <h3 class="text-sm font-bold text-blue-400">${routine.name}</h3>
            <p class="text-[10px] text-slate-500 italic"><i class="far fa-calendar-alt mr-1"></i> ${routine.days}</p>
        `;
        container.appendChild(infoDiv);

        // Lista Ejercicios
        routine.exercises.forEach((ex, index) => {
            const card = document.createElement('div');
            card.className = "exercise-card bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-sm relative overflow-hidden group mb-3";
            // Animación CSS simple
            card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
            card.style.opacity = '0'; // Inicio oculto para animación

            card.innerHTML = `
                <div class="z-10 relative flex-1 pr-4">
                    <h4 class="text-sm font-bold text-slate-200 mb-1">${ex.n}</h4>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="bg-blue-900/30 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/20 font-mono">${ex.s}</span>
                        <span class="text-[10px] text-slate-500 italic truncate max-w-[150px]">${ex.note}</span>
                    </div>
                </div>
                <a href="${ex.v}" target="_blank" class="z-10 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors border border-slate-700">
                    <i class="fas fa-play text-[10px]"></i>
                </a>
                <div class="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-slate-900 to-transparent z-0"></div>
            `;
            container.appendChild(card);
        });

        container.style.opacity = '1';
    }, 150);
}

// --- LOGICA RECOMENDACIÓN DIARIA ---
function checkDailyRecommendation() {
    const day = new Date().getDay(); // 0=Domingo
    const recDiv = document.getElementById('daily-recommendation');
    if (!recDiv) return;

    const daysMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayName = daysMap[day];

    let recommended = 'Rest';
    if(day === 1 || day === 4) recommended = 'A'; // Lunes, Jueves
    else if(day === 2 || day === 5) recommended = 'B'; // Martes, Viernes
    
    recDiv.classList.remove('hidden');

    if(recommended !== 'Rest') {
        currentRoutineKey = recommended;
        // Forzar actualización visual
        const phase = appData.phases.find(p => p.id === currentPhaseId);
        if(phase) {
            renderDaySelector(phase.routines);
            loadRoutine(recommended);
        }
        recDiv.innerHTML = `<i class="fas fa-calendar-check mr-1"></i> Hoy es ${dayName}: Toca <b>Rutina ${recommended}</b>`;
        recDiv.className = "mt-2 text-center text-[10px] text-emerald-400 font-bold animate-pulse";
    } else {
        recDiv.innerHTML = `<i class="fas fa-bed mr-1"></i> Hoy es ${dayName}: Descanso o Cardio suave.`;
        recDiv.className = "mt-2 text-center text-[10px] text-slate-500 font-bold";
    }
}

// --- MODO WORKOUT ---
function startRoutineFlow() {
    const phase = appData.phases.find(p => p.id === currentPhaseId);
    if (!phase) return;
    
    activeExercisesList = phase.routines[currentRoutineKey].exercises;
    currentExerciseIndex = 0;
    
    const modal = document.getElementById('workout-mode');
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        loadActiveExercise();
    }
}

function loadActiveExercise() {
    const ex = activeExercisesList[currentExerciseIndex];
    if(!ex) return;

    // Parsear series/reps
    let sets = "3 Series", reps = "12 Reps";
    if(ex.s.includes('x')) {
        const parts = ex.s.split('x');
        sets = parts[0] + " Series";
        reps = parts[1];
    } else {
        reps = ex.s;
    }

    // Configurar el ejercicio actual para el contador AI
    if (typeof setCurrentExercise === 'function') {
        setCurrentExercise(ex.n, reps, ex.seconds || 0);
    }

    // Actualizar UI
    document.getElementById('wo-title').innerText = ex.n;
    document.getElementById('wo-sets').innerText = sets;
    document.getElementById('wo-reps').innerText = reps;
    document.getElementById('wo-note').innerText = ex.note;
    document.getElementById('wo-progress').innerText = `Ejercicio ${currentExerciseIndex + 1}/${activeExercisesList.length}`;

    // CÁMARA ACTIVADA POR DEFECTO
    if (cameraMode) {
        // Ya está en modo cámara, solo actualizar
        console.log("📹 Modo cámara activo");
    } else {
        // Activar cámara al cargar ejercicio
        setTimeout(() => {
            toggleCameraMode();
        }, 500);
    }

    // Si el ejercicio tiene video de YouTube como referencia (modo cámara OFF)
    if (!cameraMode) {
        const videoFrame = document.getElementById('wo-video');
        if(ex.v.includes('embed')) {
            videoFrame.src = ex.v;
        } else {
            videoFrame.src = "https://www.youtube.com/embed/videoseries?list=PL_J8l4H9C_2w4-J3B7y8";
        }
    }

    // Timer manual (solo si NO hay soporte de conteo automático)
    const timerOverlay = document.getElementById('timer-overlay');
    const btnTimer = document.getElementById('btn-start-timer');
    
    // Ocultar timer manual si hay conteo automático
    const hasAutoCount = typeof supportsAutoCount === 'function' && supportsAutoCount(ex.n);
    
    if (ex.seconds && !hasAutoCount) {
        timerOverlay.classList.remove('hidden');
        btnTimer.classList.remove('hidden');
        document.getElementById('timer-display').innerText = formatTime(ex.seconds);
        
        const newBtn = btnTimer.cloneNode(true);
        btnTimer.parentNode.replaceChild(newBtn, btnTimer);
        newBtn.onclick = () => runTimer(ex.seconds);
    } else {
        timerOverlay.classList.add('hidden');
        btnTimer.classList.add('hidden');
        stopTimer();
    }
}

function nextExercise() {
    stopTimer();
    
    if (currentExerciseIndex < activeExercisesList.length - 1) {
        currentExerciseIndex++;
        loadActiveExercise();
    } else {
        closeWorkout();
        
        // Mensaje de felicitación
        setTimeout(() => {
            alert("🔥 ¡Entrenamiento completado! Excelente trabajo 💪");
        }, 300);
    }
}

function closeWorkout() {
    stopTimer();
    
    // Detener cámara si está activa
    if (cameraMode && typeof stopPoseDetection === 'function') {
        stopPoseDetection();
        cameraMode = false;
    }
    
    const modal = document.getElementById('workout-mode');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Limpiar src del video
    document.getElementById('wo-video').src = "";
}

// --- TOGGLE CÁMARA AI ---
function toggleCameraMode() {
    cameraMode = !cameraMode;
    
    const toggleBtn = document.getElementById('camera-toggle');
    
    if (cameraMode) {
        // Activar modo cámara AI
        console.log("🎥 Activando modo cámara AI...");
        
        if (typeof startPoseDetection === 'function') {
            startPoseDetection();
            toggleBtn.innerHTML = '<i class="fas fa-video text-emerald-400 text-lg"></i>';
        } else {
            console.error("❌ Función de detección de pose no disponible");
            alert("Error: El sistema de visión por computadora no está disponible.");
            cameraMode = false;
        }
    } else {
        // Volver a modo video
        console.log("📺 Volviendo a modo video...");
        
        if (typeof stopPoseDetection === 'function') {
            stopPoseDetection();
        }
        
        toggleBtn.innerHTML = '<i class="fas fa-video text-lg"></i>';
        loadActiveExercise(); // Recargar para mostrar video de YouTube
    }
}

// --- TIMER UTILS (para ejercicios sin conteo automático) ---
function runTimer(seconds) {
    let timeLeft = seconds;
    const display = document.getElementById('timer-display');
    const btn = document.getElementById('btn-start-timer');
    const sound = document.getElementById('timer-sound');
    
    btn.classList.add('hidden');
    
    clearInterval(timerInterval);
    display.innerText = formatTime(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        display.innerText = formatTime(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if(sound) sound.play().catch(e => console.log("Audio play failed", e));
            display.innerText = "¡LISTO!";
            display.classList.add('text-green-500');
            
            if(navigator.vibrate) navigator.vibrate([200, 100, 200]);

            setTimeout(() => {
                 display.classList.remove('text-green-500');
                 nextExercise();
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

// --- LOCAL STORAGE (HÁBITOS) ---
function toggleHabit(id) {
    const checkbox = document.getElementById(id);
    if(checkbox) localStorage.setItem(id, checkbox.checked);
}

function loadHabits() {
    ['cinta-check', 'postura-check'].forEach(id => {
        const saved = localStorage.getItem(id) === 'true';
        const el = document.getElementById(id);
        if(el) el.checked = saved;
    });
}