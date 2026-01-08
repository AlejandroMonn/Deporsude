// Estado Global
let currentPhaseId = 1;
let currentWeekNum = 1;
let currentRoutineKey = 'A';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderPhases();
    loadPhase(1); // Cargar Fase 1 por defecto
}

// 1. Renderizar Botones de Fase
function renderPhases() {
    const container = document.getElementById('phase-selector');
    container.innerHTML = '';
    
    appData.phases.forEach(phase => {
        const btn = document.createElement('button');
        btn.className = `phase-btn border border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center text-center group`;
        btn.onclick = () => loadPhase(phase.id);
        btn.id = `phase-btn-${phase.id}`;
        
        btn.innerHTML = `
            <span class="text-[10px] font-black uppercase text-slate-300 group-[.active]:text-white">${phase.name}</span>
            <span class="text-[9px] text-slate-500 leading-tight mt-1 group-[.active]:text-blue-200">${phase.label}</span>
        `;
        container.appendChild(btn);
    });
}

// 2. Cargar Fase Completa
function loadPhase(id) {
    currentPhaseId = id;
    const phaseData = appData.phases.find(p => p.id === id);

    // Actualizar Botones Activos
    document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`phase-btn-${id}`).classList.add('active');
    
    // Actualizar Badge en Header
    document.getElementById('current-phase-badge').innerText = phaseData.name;

    // Actualizar Barra IMC (Lógica visual de progreso)
    const imcProgress = id === 1 ? 20 : (id === 2 ? 60 : 100);
    document.getElementById('imc-bar').style.width = `${imcProgress}%`;

    renderWeeks(phaseData.weeks);
    renderDaySelector(phaseData.routines);
    loadRoutine(currentRoutineKey); // Recargar la rutina actual en la nueva fase
}

// 3. Renderizar Selector de Semanas
function renderWeeks(weeks) {
    const container = document.getElementById('week-selector');
    container.innerHTML = '';

    weeks.forEach(week => {
        const btn = document.createElement('button');
        btn.className = `week-btn flex-shrink-0 px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 whitespace-nowrap ${currentWeekNum === week.num ? 'active' : ''}`;
        btn.innerHTML = `Sem ${week.num}: <span class="font-normal opacity-70">${week.focus}</span>`;
        btn.onclick = () => {
            currentWeekNum = week.num;
            renderWeeks(weeks); // Re-render para actualizar clases active
            // Aquí podrías guardar en localStorage
        };
        container.appendChild(btn);
    });
}

// 4. Renderizar Selector de Días (Tabs)
function renderDaySelector(routines) {
    const container = document.getElementById('day-selector');
    container.innerHTML = '';
    
    Object.keys(routines).forEach(key => {
        const routine = routines[key];
        const btn = document.createElement('button');
        btn.className = `day-btn flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${currentRoutineKey === key ? 'active' : 'text-slate-500 hover:bg-slate-800/50'}`;
        btn.innerText = key === 'A' ? routine.name.split(':')[1] || 'Rutina A' : routine.name.split(':')[1] || 'Rutina B';
        btn.onclick = () => {
            currentRoutineKey = key;
            renderDaySelector(routines); // Re-render tabs
            loadRoutine(key);
        };
        container.appendChild(btn);
    });
}

// 5. Cargar Ejercicios (Core Function)
function loadRoutine(key) {
    const phaseData = appData.phases.find(p => p.id === currentPhaseId);
    const routine = phaseData.routines[key];
    const container = document.getElementById('exercise-list');
    
    // Animación de salida
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.innerHTML = '';
        
        // Info Header de la Rutina
        const infoDiv = document.createElement('div');
        infoDiv.className = "mb-4 px-2";
        infoDiv.innerHTML = `
            <h3 class="text-sm font-bold text-blue-400">${routine.name}</h3>
            <p class="text-[10px] text-slate-500 italic"><i class="far fa-calendar-alt mr-1"></i> ${routine.days}</p>
        `;
        container.appendChild(infoDiv);

        // Lista de Ejercicios
        routine.exercises.forEach((ex, index) => {
            const card = document.createElement('div');
            card.className = "exercise-card bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-sm relative overflow-hidden group animate-fade-in";
            card.style.animationDelay = `${index * 50}ms`; // Stagger effect

            card.innerHTML = `
                <div class="z-10 relative flex-1 pr-4">
                    <h4 class="text-sm font-bold text-slate-200 mb-1">${ex.n}</h4>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900/30 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/20 font-mono">${ex.s}</span>
                        <span class="text-[10px] text-slate-500 italic truncate">${ex.note}</span>
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
function toggleHabit(id) {
    const isChecked = document.getElementById(id).checked;
    localStorage.setItem(id, isChecked); // Guarda el estado en el navegador
}

// Al cargar la página, recuperar el estado
window.onload = () => {
    ['cinta-check', 'postura-check'].forEach(id => {
        const saved = localStorage.getItem(id) === 'true';
        document.getElementById(id).checked = saved;
    });
};