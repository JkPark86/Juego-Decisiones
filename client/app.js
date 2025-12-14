// client/app.js

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000'; 
    const QTE_DURATION = 30; 
    
    // --- MAPEO DE IMÁGENES (Asegúrate de que tus archivos coincidan con estos nombres) ---
    const SCENE_IMAGES_MAP = {
        'DEFAULT_MENU': 'Cielo-Estrellado.jpeg', 
        'START_SCREEN': 'Cielo-Estrellado.jpeg', 
        'E1-1': 'resurrección.jpg', 
        'N1-2': 'Espada-Gigante.jpg', 
        'N1-3': 'Flashback Inoportuno.jpg', 
        'E1-H': 'Baile.jpg', 
        'E1-C': 'Payaso.jpg', 
        'N2-1': 'Mapa-Confuso.jpg', 
        'N2-2': 'cofre.jpg', 
        'N2-3': 'Juicio.jpg', 
        'N3-1': 'Jefe-Final-Limpiando.jpg', 
        'N3-2': 'duelo.jpg', 
        'N3-3': 'duelo.jpg', 
        'N3-4': 'Golpe-Final.jpg', 
        // Finales
        'F1': 'Cristal-Fatal.jpg', 
        'F2': 'Guia-Furiosa.jpg', 
        'F3': 'Muerte-Optimista.jpg', 
        'F4': 'Vendedor-Puerta.jpg', 
        'F5': 'Agujero-Obvio.jpg', // ¡IMAGEN DEL EJEMPLO!
        'F6': 'Pensionado.jpg', 
        'F7': 'Señales.jpg', 
        'F8': 'duelo.jpg', 
        'F9': 'Golpe-Final.jpg', 
        'F10': 'Mascota-feroz.jpg', 
        'F11': 'Estatua-Fea.jpg', 
        'F12': 'Dios-Absurdo.jpg', 
    };

    // --- ELEMENTOS DEL DOM ---
    const mainMenu = document.getElementById('main-menu');
    const startButton = document.getElementById('start-button'); 
    const creditsButton = document.getElementById('credits-button');
    const creditsScreen = document.getElementById('credits-screen');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const startScreen = document.getElementById('start-screen'); 
    const gameScreen = document.getElementById('game-screen');
    const heroNameInput = document.getElementById('hero-name-input');
    const startGameButton = document.getElementById('start-game-button'); 
    
    // Elementos de la pantalla de juego principal
    const sceneTitleGame = document.getElementById('scene-title-game'); 
    const narrativeTextGame = document.getElementById('narrative-text-game');
    const decisionButtons = document.getElementById('decision-buttons');
    const gameStatusGame = document.getElementById('game-status-game');     
    const backgroundContainer = document.getElementById('background-container'); 

    // Elementos de la interfaz
    const gameConsole = document.getElementById('game-console');
    const toggleConsoleButton = document.getElementById('toggle-console-button'); 

    // Variables de Audio
    const audioMenu = document.getElementById('audio-menu');
    const audioTj = document.getElementById('audio-tj');
    const audioBf = document.getElementById('audio-bf');
    const audioComedy = document.getElementById('audio-comedy');
    // Variables de estado global
    let currentGameId = null;
    let currentHeroName = '';
    let currentDueloScene = ''; 
    let currentExtraLives = 0; 
    let currentVH = 0;
    
    // Control del estado de la consola
    let isConsoleVisible = true;


    // --- FUNCIONES DE CONTROL DE IMAGEN ---

    function setBackgroundImage(sceneId) {
        const imageFile = SCENE_IMAGES_MAP[sceneId] || SCENE_IMAGES_MAP['DEFAULT_MENU'];
        backgroundContainer.style.backgroundImage = `url('./assets/img/${imageFile}')`;
        backgroundContainer.style.backgroundPosition = 'center';
        backgroundContainer.style.backgroundSize = 'cover';
        backgroundContainer.style.backgroundRepeat = 'no-repeat';
    }
    
    function updateGameStatus(newVH, newLives) {
        currentVH = newVH;
        currentExtraLives = newLives;
        gameStatusGame.textContent = `Puntos de Valentía: ${newVH}. Vidas Extra: ${newLives}.`; 
    }

    // --- FUNCIONES DE CONTROL DE AUDIO Y PANTALLA ---

    function stopAllAudio() {
        if (audioMenu) { audioMenu.pause(); audioMenu.currentTime = 0; }
        if (audioTj) { audioTj.pause(); audioTj.currentTime = 0; }
        if (audioBf) { audioBf.pause(); audioBf.currentTime = 0; }
        if (audioComedy) { audioComedy.pause(); audioComedy.currentTime = 0; }
    }

    function playTrack(trackElement) {
        if (!trackElement) return;

        if (!trackElement.paused) {
            return;
        }

        stopAllAudio(); 
        
        trackElement.play().catch(error => {
            console.log("Error al reproducir el audio: Requiere interacción del usuario.", error);
        });
    }

    /**
     * Oculta todas las pantallas del juego y muestra la pantalla deseada.
     * Incluye lógica para el botón de Interfaz.
     * @param {HTMLElement} screenToShow - La pantalla a mostrar.
     */
    function showScreen(screenToShow) {
        // Oculta todas las pantallas
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('credits-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'none';
        
        // Control de audio y fondo
        if (screenToShow === mainMenu || screenToShow === creditsScreen) {
            playTrack(audioMenu);
            setBackgroundImage('DEFAULT_MENU');
        } else if (screenToShow === startScreen) {
             playTrack(audioTj);
             setBackgroundImage('START_SCREEN');
        } 
        
        // Muestra la pantalla solicitada
        screenToShow.style.display = 'block';

        // --- LÓGICA DEL BOTÓN Y CONSOLA ---
        if (screenToShow === gameScreen) {
            toggleConsoleButton.style.display = 'block'; 
            gameConsole.style.display = 'block'; 
            isConsoleVisible = true;
            toggleConsoleButton.textContent = '[ Ocultar Interfaz ]';
        } else {
            toggleConsoleButton.style.display = 'none'; 
        }
    }


    // --- LÓGICA DEL BOTÓN OCULTAR INTERFAZ ---
    toggleConsoleButton.addEventListener('click', () => {
        if (isConsoleVisible) {
            // Ocultar la Consola
            gameConsole.style.display = 'none';
            toggleConsoleButton.textContent = '[ Mostrar Interfaz ]';
            isConsoleVisible = false;
        } else {
            // Mostrar la Consola
            gameConsole.style.display = 'block';
            toggleConsoleButton.textContent = '[ Ocultar Interfaz ]';
            isConsoleVisible = true;
        }
    });

    // --- MANEJO DEL MENÚ PRINCIPAL ---
    
    startButton.onclick = () => { showScreen(startScreen); };
    creditsButton.onclick = () => { showScreen(creditsScreen); };
    backToMenuButton.onclick = () => { showScreen(mainMenu); };


    // --- INICIO DE PARTIDA ---

    startGameButton.onclick = async () => {
        const heroName = heroNameInput.value.trim();
        if (heroName.length < 2) {
            alert("Por favor, ingresa un nombre de héroe válido.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/start-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ heroName })
            });

            const data = await response.json();

            if (response.ok) {
                currentGameId = data.gameId;
                currentHeroName = heroName;
                updateGameStatus(0, 0); // Reset stats
                showScreen(gameScreen); 
                loadScene('E1-1'); 
            } else {
                alert(`Error al iniciar la partida: ${data.error}`);
            }
        } catch (error) {
            console.error('Error de conexión con el servidor:', error);
            alert('Error de conexión con el servidor. Asegúrate de que server.js está corriendo.');
        }
    };

    // --- NAVEGACIÓN Y LÓGICA GENERAL ---

    async function loadScene(sceneId) {
        decisionButtons.innerHTML = '';
        
        setBackgroundImage(sceneId); 

        if (!sceneId.startsWith('N3')) {
            playTrack(audioTj); 
        }
        
        // Rutas del Guion
        if (sceneId === 'E1-1') { 
            renderDecision1();
        } else if (sceneId === 'N1-2') { 
            renderDecision2();
        } else if (sceneId === 'N1-3') { 
            // NUEVO: Llamamos a la primera etapa del proceso, que espera un clic.
            processPA1_Stage1(); 
        } else if (sceneId === 'N2-1') { 
            renderDecision3();
        } else if (sceneId === 'N2-2') { 
            renderDecision4();
        } else if (sceneId === 'N2-3') { 
            renderDecision5();
        } else if (sceneId === 'N3-1') { 
            await startAct3(); 
        } else if (sceneId === 'N3-2' || sceneId === 'N3-3') { 
            renderDuelo(sceneId);
        } else if (sceneId === 'N3-4') { 
            renderDecision6();
        } else if (sceneId.startsWith('F')) {
            loadFinalScene(sceneId);
        }
    }

    async function handleDecision(event) {
        const choiceId = event.target.dataset.choice;
        
        try {
            const response = await fetch(`${API_URL}/api/make-decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId, choiceId: choiceId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                updateGameStatus(data.currentPoints, currentExtraLives); // Actualiza solo VH
                if (data.isFinal) {
                    loadFinalScene(data.newScene);
                } else {
                    loadScene(data.newScene);
                }
            } else {
                alert(`Error al tomar la decisión: ${data.error}`);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error de conexión con el servidor. Asegúrate de que server.js está corriendo.');
        }
    }
    
    function handleAutomaticAdvance(nextSceneId) {
        loadScene(nextSceneId);
    }

    // --- RENDERIZACIÓN DE DECISIONES Y FINALES (Sin cambios) ---

    function renderDecision1() { // E1-1
        sceneTitleGame.textContent = "Decisión 1: El Sentido del Deber";
        narrativeTextGame.innerHTML = `
            <p>"Moriste de forma impresionante, padre ${currentHeroName}. Tanto que tu ego duplicó su tamaño, sorprendente para un falso héroe. Ahora, el 'Gran Mal' o como a él le gusta ser llamado, 'El asombroso e imparable REY DEMONIO' ha regresado, y nuestro presupuesto solo alcanzó para traerte de vuelta a ti."</p>
            <p class="constellation-voice">"Levántate. El universo espera. Y sinceramente, el papeleo es interminable."</p>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D1-A">A. Se levanta, quejándose del dolor de espalda post-resurreción.</button>
            <button data-choice="D1-B">B. Se levanta, camina dos pasos y toca un Cristal Brillante en la pared.</button>
            <button data-choice="D1-C">C. Le grita a la Universo: ""¡Renuncio! ¿Dónde está la puerta de salida?""</button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision2() { // N1-2
        sceneTitleGame.textContent = "Decisión 2: La Ponderación";
        narrativeTextGame.innerHTML = `
            <p>"El universo te entrega tu espada. Es ridículamente grande. Si no tienes cuidado puedes acabar aplastado por tu propia arma."</p>
            <p class="constellation-voice">Constelación del sueño Eterno: "Esta espada contiene el 80% de tu poder. El otro 20% es tu carisma. Necesitas ambas cosas."</p>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D2-A">A. Aceptas la espada, ignorando el peso. ""Vamos por ese tal Rey Demonio.""</button>
            <button data-choice="D2-B">B. Dejas la espada y dices: ""No puedo con esto. Intentaré usar mi 20% de carisma.""</button>
            <button data-choice="D2-C">C. Intentas vender la espada por internet. ""Podríamos comprar dos espadas más pequeñas.""</button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision3() { // N2-1
        sceneTitleGame.textContent = "Decisión 3: La Ruta Menos Estúpida";
        narrativeTextGame.innerHTML = `
            <p>"Llegan a un cruce de caminos. El mapa se convierte en rayones sin sentido. El universo te da dos opciones, cada una con un nombre más estúpido que el anterior."</p>
            <p class="constellation-voice">"¿Cuál eliges, ${currentHeroName}? A: El camino lento pero seguro. B: El Atajo Obvio."</p>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D3-A">A. El camino lento, al menos es seguro... o eso espero.</button>
            <button data-choice="D3-C">B. El atajo obvio, para terminar esto ya.</button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision4() { // N2-2 (PA-2 y D4)
        sceneTitleGame.textContent = "Decisión 4: Aceptar el Botín";
        narrativeTextGame.innerHTML = `
            <p>"Encuentras un cofre. Está etiquetado como 'Artículos de Dudosa Moral'. Tienes que tomar una decisión."</p>
            <p class="warning-text">El impacto en tu Valentía dependerá del objeto que el destino te otorgue.</p>
        `;
        decisionButtons.innerHTML = `
            <button id="d4-a-button" data-choice="D4-A">A. Lo dejas. El universo te dará lo que mereces, no lo que necesitas.</button>
            <button id="d4-b-button" data-choice="D4-B">B. Lo tomas. ¡Lo mío es mío!</button>
        `;

        document.getElementById('d4-a-button').addEventListener('click', (event) => {
            processD4(event.target.dataset.choice);
        });
        document.getElementById('d4-b-button').addEventListener('click', (event) => {
            processD4(event.target.dataset.choice);
        });
    }

    function renderDecision5() { // N2-3
        sceneTitleGame.textContent = "Decisión 5: El Compromiso Final";
        narrativeTextGame.innerHTML = `
            <p>"El universo te mira con ojos penetrantes, haciendo un chequeo mental de tus puntos de heroísmo."</p>
            <p class="constellation-voice">"Tus acciones hasta ahora... han sido bastante confusas. ¿Realmente quieres hacer esto? Tu nivel de preparación es... dudoso."</p>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D5-A">A. "Soy ${currentHeroName}. Puedo (probablemente) hacerlo."</button>
            <button data-choice="D5-B">B. "No, no puedo. ¿Podemos renegociar los términos de mi resurrección?"</button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision6() { // N3-4
        sceneTitleGame.textContent = "Decisión 6: El Final de la Historia";
        setBackgroundImage('Golpe-Final.jpg'); 
        narrativeTextGame.innerHTML = `
            <p>"El Rey Demonio se queda sin réplicas. Está derrotado moralmente y se desvanece por la vergüenza, dejando un pequeño objeto."</p>
            <p class="constellation-voice">"Bien. Lo desintegraste con la ironía. Ahora, el golpe final al objeto que dejó. ¿Qué haces?"</p>
        `;
        decisionButtons.innerHTML = `
            <button id="d6-a-button" data-choice="D6-A">A. Usa todo lo que le queda para destruir el objeto de manera épica y sacrificada.</button>
            <button id="d6-b-button" data-choice="D6-B">B. Deja que la constelación se encargue de la 'basura demoníaca' y se queda a salvo.</button>
        `;
        document.getElementById('d6-a-button').addEventListener('click', (event) => {
            processD6(event.target.dataset.choice);
        });
        document.getElementById('d6-b-button').addEventListener('click', (event) => {
            processD6(event.target.dataset.choice);
        });
    }


    function loadFinalScene(finalId) {
        stopAllAudio(); 

        if (finalId === 'F8' || finalId === 'F9') {
            playTrack(audioBf); 
        } else {
            playTrack(audioComedy); 
        }
        
        setBackgroundImage(finalId);
        
        let finalNarrative = '';
        let finalTitle = `Final ${finalId}`;

        // Lógica de narración de Finales 
        if (finalId === 'F1') {
            finalTitle = 'Final 1: La Muerte por Curiosidad';
            finalNarrative = "Ese cristal era la batería de tu resurrección. Al tocarlo, se disuelve en diamantina. No salvaste el mundo, pero brillaste por un instante.";
        } else if (finalId === 'F2') {
            finalTitle = 'Final 2: El Despido Inminente';
            finalNarrative = "El universo, harto, te da una patada dimensional. Aterrizas en un mundo donde el peligro son las facturas sin pagar. Eres libre, pero la deuda cósmica te persigue.";
        } else if (finalId === 'F3') {
            finalTitle = 'Final 3: La Muerte por Optimismo';
            finalNarrative = "Fuera de la cueva, un orco te ve sin tu espada. Intentas negociar, pero el orco te ve muy apetitoso. Te come. Lo intentaste.";
        } else if (finalId === 'F4') {
            finalTitle = 'Final 4: El Agente de Ventas';
            finalNarrative = "Tienes futuro como emprendedor, ahora eres un Agente de Ventas Místico para financiar futuras resurrecciones. Vives, pero tu nueva enemiga es la cuota mensual. El Rey Demonio gana por defecto.";
        } else if (finalId === 'F5') {
            finalTitle = 'Final 5: La Muerte por Obviedad';
            finalNarrative = "Era una trampa. Caes en un agujero gigante. La constelación anota: 'Murió por seguir el atajo. ¡De nuevo!.'";
        } else if (finalId === 'F6') {
            finalTitle = 'Final 6: El Retiro Dorado';
            finalNarrative = "La Constelación del sueño eterno te permite retirarte con una pensión pequeña. Vives como un noble retirado y tranquilo.";
        } else if (finalId === 'F7') {
            finalTitle = 'Final 7: El Desaparecido en Combate';
            finalNarrative = "Intentas huir, pero la Constelación te marca con un 'Aquí Estuvo' permanente. Apareces en todos los carteles de 'Héroe Desaparecido'. Vives, pero con paranoia.";
        } else if (finalId === 'F8') {
            finalTitle = 'Final 8: Muerte por Insulto';
            finalNarrative = "Has muerto, mejor suerte en tu próxima vida. (El Rey Demonio te humilló hasta el punto de la desintegración.)";
        } else if (finalId === 'F9') {
            finalTitle = 'Final 9: Victoria Agotadora';
            finalNarrative = "El Rey Demonio se desintegra, pero el esfuerzo te deja al borde de la muerte. Te arrastras lejos para vivir una vida miserablemente corta y olvidada.";
        } else if (finalId === 'F10') {
            finalTitle = 'Final 10: El Cuidado de Mascotas';
            finalNarrative = "El Rey Demonio es derrotado. Te jubilas y usas tu nueva vida para cuidar a su mascota (un chihuahua rabioso). Vives en paz y con miedo constante.";
        } else if (finalId === 'F11') {
            finalTitle = 'Final 11: La Leyenda Olvidable';
            finalNarrative = "Moriste por un golpe dramático. Te recuerdan como 'ese tipo', y te construyen una estatua que es bastante fea. Salvaste el mundo, pero no el arte.";
        } else if (finalId === 'F12') {
            finalTitle = 'Final 12: La Fama Eterna';
            finalNarrative = "Tu sacrificio fue épico. Eres una entidad cósmica que protege la galaxia. Tu nueva labor: organizar la fila del supermercado universal. Tu fama es eterna.";
        }

        sceneTitleGame.innerHTML = `<span class="final-title">${finalTitle}</span>`;
        narrativeTextGame.innerHTML = `<p>${finalNarrative}</p><hr><p>FIN DE LA PARTIDA</p>`;
        decisionButtons.innerHTML = '<button onclick="location.reload()">Volver al Menú Principal</button>';
        gameStatusGame.textContent = `VH Final: ${currentVH}. Vidas Extra: ${currentExtraLives}.`;
    }

    // --- LÓGICA DE ESCENAS ESPECIALES (MODIFICADA) ---

    /**
     * Muestra la pantalla N1-3 y espera el primer clic del usuario para iniciar el proceso.
     */
    function processPA1_Stage1() {
        sceneTitleGame.textContent = "1.3 PA-1: El Flashback Inoportuno";
        narrativeTextGame.innerHTML = `
            <p>"Un fuerte golpe de estrés te activa un flashback inoportuno."</p>
            <p class="constellation-voice">Constelación del sueño Eterno: "¡Prepárate! Esto podría ser importante, o ridículo."</p>
        `;
        // Primer botón: Activa el proceso asíncrono y la siguiente escena
        decisionButtons.innerHTML = `<button id="activate-flashback">Activar Flashback (Ver Recuerdo)</button>`;
        document.getElementById('activate-flashback').addEventListener('click', processPA1_Stage2);
    }
    
    /**
     * Llama al servidor de forma asíncrona y, al obtener el resultado, renderiza la escena final del flashback.
     */
    async function processPA1_Stage2() {
        // Muestra un estado de carga mientras se llama a la API
        narrativeTextGame.innerHTML = `<p>...Procesando recuerdo y puntos de Valentía...</p>`;
        decisionButtons.innerHTML = '<p>Conectando con el universo...</p>';

        try {
            // 2. Contactar al servidor para obtener el resultado del flashback
            const response = await fetch(`${API_URL}/api/process-pa1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 3. Renderizar la escena del flashback con el botón de avance (controlado por el usuario)
                renderFlashbackScene(data.newScene, data.currentPoints);
            } else {
                alert(`Error en la ponderación: ${data.error}`);
            }
        } catch (e) {
            alert('Error de conexión con el servidor al procesar PA-1.');
        }
    }


    /**
     * Renderiza la escena del flashback (E1-H o E1-C) y añade un botón de Continuar.
     * @param {string} sceneId - ID de la escena (E1-H o E1-C).
     * @param {number} newPoints - Nuevos puntos de Valentía.
     */
    function renderFlashbackScene(sceneId, newPoints) {
        let narrative = '';
        
        setBackgroundImage(sceneId); 

        if (sceneId === 'E1-H') {
            narrative = `<p>"${currentHeroName}: Recordaste aquel concurso de baile. No salvaste vidas, pero salvaste la noche. Un poco de autoconfianza nada merecida te recorre."</p>`; 
        } else if (sceneId === 'E1-C') {
            narrative = `<p>"${currentHeroName}: Recordaste estar asustado por el payaso en una fiesta. La vergüenza te pesa tanto que casi sueltas la espada."</p>`; 
        }
        
        // El usuario tiene el control de la duración aquí
        sceneTitleGame.textContent = "Resultado del Flashback";
        narrativeTextGame.innerHTML = narrative;
        updateGameStatus(newPoints, currentExtraLives); 
        
        // Se añade el botón para avanzar al Acto 2 (N2-1)
        decisionButtons.innerHTML = `<button id="continue-button">Continuar al Acto 2: El Gran Mapa</button>`;
        document.getElementById('continue-button').addEventListener('click', () => {
            handleAutomaticAdvance('N2-1');
        });
    }

    async function processD4(choiceD4) {
        decisionButtons.innerHTML = '<p>Procesando decisión y ponderación del botín...</p>';

        try {
            const response = await fetch(`${API_URL}/api/process-n2-2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId, choiceD4: choiceD4 })
            });

            const data = await response.json();

            if (response.ok) {
                let objectName = data.foundObject === 'E2-OT' ? 'Cuchara de la Moral' : 'Sombrero del Poder';
                let narrativeResult = data.foundObject === 'E2-OT' ? 
                                            'Encontraste la Cuchara de la Moral. Es inútil en combate, pero te da una gran paz interior.' : 
                                            'Encontraste el Sombrero del Poder. Te da fuerza, pero te recuerda constantemente tus motivaciones egoístas.';
                
                sceneTitleGame.textContent = `El Botín: ${objectName}`;
                narrativeTextGame.innerHTML = `<p>${narrativeResult}</p><p>Tu elección (${choiceD4}) ha afectado tu temple heroico. ¡Sigue adelante!</p>`;
                updateGameStatus(data.currentPoints, currentExtraLives); 

                decisionButtons.innerHTML = `<button id="continue-n23-button">Continuar a N2-3: El Juicio</button>`;
                document.getElementById('continue-n23-button').addEventListener('click', () => {
                    handleAutomaticAdvance(data.newScene);
                });
            } else {
                alert(`Error al procesar D4: ${data.error}`);
            }

        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    }

    // --- LÓGICA DEL DUELO (ACTO 3) ---

    async function startAct3() {
        sceneTitleGame.textContent = "Acto 3: Inicio del Duelo";
        narrativeTextGame.innerHTML = `
            <p>"Llegan a la guarida. El Rey Demonio está puliendo un candelabro de huesos con evidente frustración."</p>
            <p class="constellation-voice">"Parece que ser malvado no significa vivir en un basurero."</p>
            <p>... Calculando Vidas Extra para el Duelo ...</p>`;
        decisionButtons.innerHTML = '';
        
        playTrack(audioBf); 

        try {
            const response = await fetch(`${API_URL}/api/start-act-3`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`¡Tienes ${data.extraLives} Vidas Extra para el Duelo!`);
                updateGameStatus(data.currentVH, data.extraLives);
                renderDuelo(data.newScene);
            } else {
                alert(`Error al iniciar el Acto 3: ${data.error}`);
            }
        } catch (e) {
            alert('Error de conexión con el servidor.');
        }
    }


    function renderDuelo(sceneId) {
        let insulto = '';
        let choiceA = '';
        let choiceB = '';
        let choiceC = '';
        let assaultText = '';
        
        setBackgroundImage(sceneId); 

        if (sceneId === 'N3-2') {
            insulto = "Esperaba a alguien más alto 'supuesto héroe' parece que solo alcanzaron a resucitar la mitad de ti, y por lo visto, no fue la mitad más lista";
            choiceA = "A. QTE: Aun incompleto sigo siendo mejor que tú demonio, y eso que llevas mil años practicando ser una decepción.";
            choiceB = "B.'Pues... tu ¡APESTAS!' no fue tu mejor intento, pero ánimo."; 
            choiceC = "C.Tu voz se quiebra mientras bajas la mirada: '¿La mitad...? Con razón siento que dejé mi autoestima en la tumba...'"; 
            assaultText = 'Asalto 1: La Apariencia';

        } else if (sceneId === 'N3-3') {
            insulto = "No viniste por valentía, héroe roto. Viniste porque tu conciencia te grita más fuerte que yo. Eres básicamente ansiedad con piernas.";
            choiceA = "A. QTE: Mi ansiedad me trajo hasta aquí y aun así tiene más iniciativa que tu ejército entero.";
            choiceB = "B.'¡Mi ansiedad funciona mejor que yo, déjame en paz!'";
            choiceC = "C.Te miras las manos temblorosas y murmuras: '…okay, quizá sí necesito otro exorcismo emocional…'";
            assaultText = 'Asalto 2: La Motivación Retorcida';
        } else if (sceneId === 'N3-4') {
            return renderDecision6();
        } 
        
        currentDueloScene = sceneId;
        
        sceneTitleGame.textContent = `Acto 3: Duelo de Insultos (${assaultText})`;
        
        narrativeTextGame.innerHTML = `
            <p>Vidas Extra restantes: **${currentExtraLives}**</p>
            <p class="demon-voice">REY DEMONIO: "${insulto}"</p>
            <h3>Elige tu Réplica</h3>
        `;
        
        decisionButtons.innerHTML = `
            <button id="duelo-a-button" data-choice="Duelo-A" data-key="A">${choiceA}</button>
            <button id="duelo-b-button" data-choice="Duelo-B" data-key="B">${choiceB}</button>
            <button id="duelo-c-button" data-choice="Duelo-C" data-key="C">${choiceC}</button>
        `;

        document.getElementById('duelo-a-button').addEventListener('click', () => {
            handleDueloChoice(currentDueloScene === 'N3-2' ? 'Duelo-A1-E' : 'Duelo-A2-E', 1, 'A'); 
        });
        document.getElementById('duelo-b-button').addEventListener('click', () => {
            handleDueloChoice(currentDueloScene === 'N3-2' ? 'Duelo-A1-F1' : 'Duelo-A2-F1', -1, 'B');
        });
        document.getElementById('duelo-c-button').addEventListener('click', () => {
            handleDueloChoice(currentDueloScene === 'N3-2' ? 'Duelo-A1-F2' : 'Duelo-A2-F2', -2, 'C');
        });
    }

    // --- MECÁNICA QTE (Sin cambios) ---

    function startTypingQTE(choiceId, textToType, impactVH) {
        const QTE_DURATION_LOCAL = QTE_DURATION; 
        
        sceneTitleGame.textContent = `¡QUICK TIME EVENT! (QTE)`;
        narrativeTextGame.innerHTML = `
            <p>Tienes **${QTE_DURATION_LOCAL} segundos** para teclear esta frase exactamente:</p>
            <blockquote id="qte-text">${textToType}</blockquote>
            <input type="text" id="qte-input" placeholder="Escribe aquí rápidamente..." autofocus>
            <p id="qte-timer">Tiempo restante: ${QTE_DURATION_LOCAL}</p>
        `;
        decisionButtons.innerHTML = '';
        
        let timer = QTE_DURATION_LOCAL;
        const inputElement = document.getElementById('qte-input');
        const timerElement = document.getElementById('qte-timer');
        
        const interval = setInterval(() => {
            timer -= 1;
            timerElement.textContent = `Tiempo restante: ${timer}`;
            
            if (timer <= 0) {
                clearInterval(interval);
                processDueloResult(choiceId, impactVH, false, 'A');
            }
        }, 1000);

        inputElement.onkeydown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                clearInterval(interval);
                const typedText = inputElement.value.trim();
                const success = typedText === textToType.trim();
                
                processDueloResult(choiceId, impactVH, success, 'A');
            }
        };
    }

    function handleDueloChoice(choiceId, impactVH, choiceKey) {
        let requiredText = '';

        if (currentDueloScene === 'N3-2') {
            requiredText = "Aun incompleto sigo siendo mejor que tú demonio, y eso que llevas mil años practicando ser una decepción.";
        } else if (currentDueloScene === 'N3-3') {
            requiredText = "Mi ansiedad me trajo hasta aquí y aun así tiene más iniciativa que tu ejército entero.";
        } 
        
        if (choiceKey === 'A') {
            startTypingQTE(choiceId, requiredText, impactVH);
        } else {
            // No QTE, fallo directo.
            processDueloResult(choiceId, impactVH, true, choiceKey); 
        }
    }


    async function processDueloResult(choiceId, baseImpactVH, qteSuccess, choiceKey) {
        decisionButtons.innerHTML = '<p>Procesando resultado...</p>';
        
        let finalImpactVH = baseImpactVH;
        let extraLivesLost = 0;
        let resultMessage = '';
        
        if (choiceKey === 'A' && !qteSuccess) {
            finalImpactVH = -3; 
            extraLivesLost = 1;
            resultMessage = `<p class="fail-message">¡ERROR CRÍTICO! Tu lengua tropezó. Pierdes **1 Vida Extra** y tu temple se desmorona (-3 VH).</p>`;
        } else if (choiceKey === 'A' && qteSuccess) {
            resultMessage = `<p class="success-message">¡ÉXITO en el TIPADO! Tu réplica fue perfecta. Ganas (+${finalImpactVH} VH).</p>`;
        } else if (choiceKey === 'B') { 
            finalImpactVH = -1; 
            extraLivesLost = 1;
            resultMessage = `<p class="fail-message">Réplica inefectiva. El Rey Demonio se ríe. Pierdes **1 Vida Extra**.</p>`;
        } else if (choiceKey === 'C') { 
            finalImpactVH = -2; 
            extraLivesLost = 2;
            resultMessage = `<p class="fail-message">Réplica vergonzosa. El pánico te hace perder **2 Vidas Extra**.</p>`;
        }
        
        // Llamar al servidor para actualizar el estado
        try {
            const response = await fetch(`${API_URL}/api/duelo-process-assault`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    gameId: currentGameId, 
                    choiceId: choiceId, 
                    vhImpact: finalImpactVH,
                    livesLost: extraLivesLost,
                    currentScene: currentDueloScene,
                    nextAssault: currentDueloScene === 'N3-2' ? 'N3-3' : 'N3-4' 
                })
            });

            const data = await response.json();

            if (response.ok) {
                updateGameStatus(data.currentVH, data.extraLives);
                narrativeTextGame.innerHTML = resultMessage;
                
                if (data.isFinal) {
                    loadFinalScene(data.newScene);
                } else if (data.newScene === 'N3-4') {
                    // Pasa a la decisión final (D6)
                    alert("¡FIN DEL DUELO! Pasa a la decisión final.");
                    loadScene(data.newScene);
                } else {
                    // Avanza al siguiente asalto
                    decisionButtons.innerHTML = `<button id="continue-duelo-button">Continuar al Asalto ${data.currentAssault + 1}</button>`;
                    document.getElementById('continue-duelo-button').addEventListener('click', () => {
                        renderDuelo(data.newScene);
                    });
                }
            } else {
                alert(`Error en el duelo: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    }

    async function processD6(choiceId) {
        try {
            const response = await fetch(`${API_URL}/api/make-final-decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId, choiceId: choiceId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                loadFinalScene(data.newScene);
            } else {
                alert(`Error en la decisión final: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    }
    
    // --- INICIALIZACIÓN ---
    showScreen(mainMenu); 

}); // CIERRE DEL DOMContentLoaded