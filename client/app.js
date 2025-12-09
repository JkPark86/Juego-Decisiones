// client/app.js

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000'; // Asegúrate de que coincida con el puerto del servidor

    // Elementos del DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const heroNameInput = document.getElementById('hero-name-input');
    const startButton = document.getElementById('start-game-button');
    const narrativeText = document.getElementById('narrative-text');
    const decisionButtons = document.getElementById('decision-buttons');
    const gameStatus = document.getElementById('game-status');

    // Variables de estado global
    let currentGameId = null;
    let currentHeroName = '';
    let currentDueloScene = ''; 
    let currentExtraLives = 0; 

    // --- INICIO DE PARTIDA ---

    startButton.onclick = async () => {
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
                startScreen.style.display = 'none';
                gameScreen.style.display = 'block';
                loadScene(data.initialScene); // Inicia en E1-1
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
        
        // Rutas del Guion
        if (sceneId === 'E1-1') { 
            renderDecision1();
        } else if (sceneId === 'N1-2') { 
            renderDecision2();
        } else if (sceneId === 'N1-3') { 
            await processPA1();
        } else if (sceneId === 'N2-1') { 
            renderDecision3();
        } else if (sceneId === 'N2-2') { 
            renderDecision4();
        } else if (sceneId === 'N2-3') { 
            renderDecision5();
        } else if (sceneId === 'N3-1') { 
            await startAct3();
        } else if (sceneId === 'N3-2' || sceneId === 'N3-3') { // Duelo Asaltos
            renderDuelo(sceneId);
        } else if (sceneId === 'N3-4') { 
            renderDecision6();
        } else if (sceneId.startsWith('F')) {
            loadFinalScene(sceneId);
        }
    }

    async function handleDecision(event) {
        // El choiceId sigue siendo el ID de historial, pero está oculto al jugador
        const choiceId = event.target.dataset.choice;
        
        try {
            const response = await fetch(`${API_URL}/api/make-decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId, choiceId: choiceId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Solo mostramos el VH, sin el impacto específico por decisión
                gameStatus.textContent = `Puntos de Valentía: ${data.currentPoints}.`; 
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

    // --- RENDERIZACIÓN DE DECISIONES Y FINALES (SIN SPOILERS) ---

    function renderDecision1() { // E1-1
        narrativeText.innerHTML = `
            <p>"Moriste de forma impresionante, ${currentHeroName}. Ahora, el 'Gran Mal' o como a él le gusta ser llamado, 'El asombroso e imparable REY DEMONIO' ha regresado..."</p>
            <p class="constellation-voice">"Levántate. El universo espera. Y sinceramente, el papeleo es interminable."</p>
            <h3>Decisión 1: El Sentido del Deber</h3>
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
        narrativeText.innerHTML = `
            <p>"El universo te entrega tu espada. Es ridículamente grande. Si no tienes cuidado puedes acabar aplastado por tu propia arma."</p>
            <p class="constellation-voice">Constelación del sueño Eterno: "Esta espada contiene el 80% de tu poder. El otro 20% es tu carisma."</p>
            <h3>Decisión 2: La Ponderación</h3>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D2-A">A. Aceptas la espada, ignorando el peso. ""Vamos por ese tal Rey Demonio."" (Continúa)</button>
            <button data-choice="D2-B">B. Dejas la espada e intentas usar tu 20% de carisma. </button>
            <button data-choice="D2-C">C. Intentas vender la espada por internet. ""Podríamos comprar dos espadas más pequeñas.""</button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision3() { // N2-1
        narrativeText.innerHTML = `
            <p>"Llegan a un cruce de caminos. El mapa se convierte en rayones sin sentido."</p>
            <p class="constellation-voice">"¿Cuál eliges, ${currentHeroName}? A: El camino lento pero seguro. B: El Atajo Obvio."</p>
            <h3>Decisión 3: La Ruta Menos Estúpida</h3>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D3-A">A. El camino lento, al menos es seguro... o eso espero. (Continúa)</button>
            <button data-choice="D3-B">B. El atajo obvio, para terminar esto ya. </button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision4() { // N2-2 (PA-2 y D4)
        narrativeText.innerHTML = `
            <p>"Encuentras un cofre. Está etiquetado como 'Artículos de Dudosa Moral'. Tienes que tomar una decisión sobre el botín que el universo te dará."</p>
            <h3>Decisión 4: Aceptar el Botín</h3>
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
        narrativeText.innerHTML = `
            <p>"El universo te mira con ojos penetrantes, haciendo un chequeo mental de tus puntos de heroísmo."</p>
            <p class="constellation-voice">"Tus acciones hasta ahora... han sido bastante confusas. ¿Realmente quieres hacer esto? Tu nivel de preparación es... dudoso..."</p>
            <h3>Decisión 5: El Compromiso Final</h3>
        `;
        decisionButtons.innerHTML = `
            <button data-choice="D5-A">A. "Soy ${currentHeroName}. Puedo (probablemente) hacerlo." (Continúa a Acto 3)</button>
            <button data-choice="D5-B">B. "No, no puedo. ¿Podemos renegociar los términos de mi resurrección?" (Activa Retiro)</button>
        `;
        decisionButtons.querySelectorAll('button').forEach(button => {
            button.onclick = handleDecision;
        });
    }

    function renderDecision6() { // N3-4
        narrativeText.innerHTML = `
            <p>"El Rey Demonio se queda sin réplicas. Está derrotado moralmente y se desvanece por la vergüenza, dejando un pequeño objeto."</p>
            <p class="constellation-voice">"Bien. Lo desintegraste con la ironía. Ahora, el golpe final al objeto que dejó. ¿Qué haces?"</p>
            <h3>Decisión 6: El Final de la Historia</h3>
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
        let finalNarrative = '';
        let finalTitle = `Final ${finalId}`;

        // Lógica para todos los Finales (El LLM del servidor define el texto)
        if (finalId === 'F1') {
            finalTitle = 'Final 1: La Muerte por Curiosidad';
            finalNarrative = "Ese cristal era la batería de tu resurrección. Al tocarlo, se descarga y tu cuerpo revivido se disuelve en diamantina. No salvaste el mundo, pero brillaste por un instante.";
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
            finalNarrative = "Era una trampa no te puedes confiar. Un agujero gigante. Caes. La constelación del sueño eterno anota: 'Murió por seguir el atajo. De nuevo!.";
        } else if (finalId === 'F6') {
            finalTitle = 'Final 6: El Retiro Dorado';
            finalNarrative = "La Constelación del sueño eterno te permite retirarte con una pensión pequeña. Vives como un noble retirado y tranquilo. El Rey Demonio... bueno, ese no es tu problema.";
        } else if (finalId === 'F7') {
            finalTitle = 'Final 7: El Desaparecido en Combate';
            finalNarrative = "Intentas huir, pero la Constelación del sueño eterno te marca con un 'Aquí Estuvo' permanente. Apareces en todos los carteles de 'Héroe Desaparecido'. Vives, pero con la paranoia de ser encontrado.";
        } else if (finalId === 'F8') {
            finalTitle = 'Final 8: Muerte por Insulto';
            finalNarrative = "El Rey Demonio te humilló hasta el punto de la desintegración. Mueres de vergüenza y tu VH era demasiado bajo para evitarlo. Un final patético.";
        } else if (finalId === 'F9') {
            finalTitle = 'Final 9: Victoria (por Respeto)';
            finalNarrative = "Te quedaste sin Vidas Extra, pero tu alto VH final obligó al Rey Demonio a darte un golpe de respeto. Mueres con honor, aunque no completaste el duelo. No es un final feliz, pero es digno.";
        } else if (finalId === 'F10') {
            finalTitle = 'Final 10: El Cuidado de Mascotas';
            finalNarrative = "El Rey Demonio es derrotado. Te jubilas y usas tu nueva vida para cuidar a su mascota (un chihuahua rabioso). Vives en paz y con miedo constante.";
        } else if (finalId === 'F11') {
            finalTitle = 'Final 11: La Leyenda Olvidable';
            finalNarrative = "Moriste por un golpe dramático. Eres un verdadero héroe. Te recuerdan como 'ese tipo', y te construyen una estatua que es bastante fea. Salvaste el mundo, pero no el arte.";
        } else if (finalId === 'F12') {
            finalTitle = 'Final 12: La Fama Eterna';
            finalNarrative = "Tu sacrificio fue épico. Eres una entidad cósmica que protege la galaxia. Tu nueva labor: organizar la fila del supermercado universal. Tu fama es eterna.";
        }

        narrativeText.innerHTML = `
            <h1 class="final-title">${finalTitle}</h1>
            <p>${finalNarrative}</p>
            <hr>
            <p>FIN DE LA PARTIDA</p>
        `;
        decisionButtons.innerHTML = '<button onclick="location.reload()">Jugar de Nuevo</button>';
    }

    // --- LÓGICA DE ESCENAS ESPECIALES ---

    async function processPA1() {
        narrativeText.innerHTML = `<p>"Un fuerte golpe de estrés te activa un flashback inoportuno..."</p><p>...Calculando tu destino...</p>`;
        decisionButtons.innerHTML = '';
        
        try {
            const response = await fetch(`${API_URL}/api/process-pa1`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                renderFlashbackScene(data.newScene, data.currentPoints);
            } else {
                alert(`Error en la ponderación: ${data.error}`);
            }
        } catch (e) {
            alert('Error de conexión con el servidor al procesar PA-1.');
        }
    }

    function renderFlashbackScene(sceneId, newPoints) {
        let narrative = '';
        
        if (sceneId === 'E1-H') {
            narrative = `<p>"${currentHeroName}: Recordaste aquel concurso de baile. No salvaste vidas, pero salvaste la noche. Un poco de autoconfianza nada merecida te recorre."</p>`; 
        } else if (sceneId === 'E1-C') {
            narrative = `<p>"${currentHeroName}: Recordaste estar asustado por el payaso en una fiesta. La vergüenza te pesa tanto que casi sueltas la espada."</p>`; 
        }
        
        narrativeText.innerHTML = `<h3>Resultado del Flashback</h3> ${narrative}`;
        gameStatus.textContent = `Puntos de Valentía: ${newPoints}.`;
        
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
                
                narrativeText.innerHTML = `
                    <h3>El Botín: ${objectName}</h3>
                    <p>${narrativeResult}</p>
                    <p>Tu elección (${choiceD4}) ha afectado tu temple heroico. ¡Sigue adelante!</p>
                `;
                gameStatus.textContent = `Puntos de Valentía: ${data.currentPoints}.`;

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
        narrativeText.innerHTML = `<p>"Llegan a la guarida. El Rey Demonio está puliendo un candelabro..."</p>
                                <p>... Calculando Vidas Extra para el Duelo ...</p>`;
        decisionButtons.innerHTML = '';

        try {
            const response = await fetch(`${API_URL}/api/start-act-3`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: currentGameId })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`¡Tienes ${data.extraLives} Vidas Extra para el Duelo!`);
                currentExtraLives = data.extraLives;
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

        if (sceneId === 'N3-2') {
            insulto = "Esperaba a alguien más alto 'supuesto héroe' parece que solo alcanzaron a resucitar la mitad de ti, y por lo visto, no fue la mitad más lista";
            choiceA = "A. QTE: Aun incompleto sigo siendo mejor que tú demonio, y eso que llevas mil años practicando ser una decepción.";
            // ERROR CORREGIDO: Uso de comillas simples para el diálogo interno
            choiceB = "B. (Réplica Inefectiva) 'Pues... tu ¡APESTAS!' no fue tu mejor intento, pero ánimo."; 
            choiceC = "C. (Réplica Vergonzosa) Te miras las manos temblorosas: '…okay, quizá sí necesito otro exorcismo emocional…'"; 

        } else if (sceneId === 'N3-3') {
            insulto = "No viniste por valentía, héroe roto. Viniste porque tu conciencia te grita más fuerte que yo. Eres básicamente ansiedad con piernas.";
            choiceA = "A. QTE: Mi ansiedad me trajo hasta aquí y aun así tiene más iniciativa que tu ejército entero.";
            // ERROR CORREGIDO: Uso de comillas simples para el diálogo interno
            choiceB = "B. (Réplica Inefectiva) '¡Mi ansiedad funciona mejor que yo, déjame en paz!'";
            choiceC = "C. (Réplica Vergonzosa) Te miras las manos temblorosas: '…okay, quizá sí necesito otro exorcismo emocional…'";
        } else if (sceneId === 'N3-4') {
            return renderDecision6();
        } 
        
        currentDueloScene = sceneId;
        const assaultNumber = parseInt(sceneId.slice(2, 3)) - 1; 
        
        narrativeText.innerHTML = `
            <h1>Acto 3: Duelo de Insultos (Asalto ${assaultNumber})</h1>
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
            // Se envía 1 VH de impacto si el QTE es exitoso
            handleDueloChoice('Duelo-A' + assaultNumber + '-E', 1, 'A'); 
        });
        document.getElementById('duelo-b-button').addEventListener('click', () => {
             // Se envía -1 VH de impacto (Réplica Inefectiva)
            handleDueloChoice('Duelo-A' + assaultNumber + '-F1', -1, 'B');
        });
        document.getElementById('duelo-c-button').addEventListener('click', () => {
             // Se envía -2 VH de impacto (Réplica Vergonzosa)
            handleDueloChoice('Duelo-A' + assaultNumber + '-F2', -2, 'C');
        });
    }

    // --- MECÁNICA QTE (TIEMPO CORREGIDO A 15 SEGUNDOS) ---

    function startTypingQTE(choiceId, textToType, impactVH) {
        const QTE_DURATION = 15; // ¡15 segundos!
        narrativeText.innerHTML = `
            <h3>¡QUICK TIME EVENT! (QTE)</h3>
            <p>Tienes **${QTE_DURATION} segundos** para teclear esta frase exactamente (sin comillas y con mayúsculas):</p>
            <blockquote id="qte-text">${textToType}</blockquote>
            <input type="text" id="qte-input" placeholder="Escribe aquí rápidamente..." autofocus>
            <p id="qte-timer">Tiempo restante: ${QTE_DURATION}</p>
        `;
        decisionButtons.innerHTML = '';
        
        let timer = QTE_DURATION;
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
            processDueloResult(choiceId, impactVH, false, choiceKey);
        }
    }


    async function processDueloResult(choiceId, baseImpactVH, qteSuccess = true, choiceKey) {
        decisionButtons.innerHTML = '<p>Procesando resultado...</p>';
        
        let finalImpactVH = baseImpactVH;
        let extraLivesLost = 0;
        
        if (choiceKey === 'A' && !qteSuccess) {
            // Falla el Tipado (QTE) 
            finalImpactVH = -1; 
            extraLivesLost = 1;
            narrativeText.innerHTML += `<p class="fail-message">¡FALLÓ el TIPADO! Tu réplica fue lenta. Pierdes **1 Vida Extra**.</p>`;
        } else if (choiceKey === 'A' && qteSuccess) {
            narrativeText.innerHTML += `<p class="success-message">¡ÉXITO en el TIPADO! Tu réplica fue perfecta.</p>`;
        } else if (choiceKey === 'B') { 
            extraLivesLost = 1;
        } else if (choiceKey === 'C') { 
            extraLivesLost = 2;
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
                currentExtraLives = data.extraLives;
                gameStatus.textContent = `VH: ${data.currentVH}, Vidas Extra: ${data.extraLives}.`;
                
                if (data.isFinal) {
                    loadFinalScene(data.newScene);
                } else if (data.newScene === 'N3-4') {
                    alert("¡VICTORIA MORAL! El Rey Demonio ha sido derrotado.");
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
                gameStatus.textContent = `VH Final: ${data.currentPoints}.`;
                loadFinalScene(data.newScene);
            } else {
                alert(`Error en la decisión final: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    }

}); // CIERRE DEL DOMContentLoaded