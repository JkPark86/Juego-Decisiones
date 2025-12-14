// server/server.js

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. CONEXIÓN A MONGODB ATLAS ---

let db;

async function connectDB() {
    if (db) return db;
    try {
        const client = new MongoClient(URI);
        await client.connect();
        console.log("Conectado a MongoDB Atlas con éxito.");
        db = client.db('JuegoDecisiones'); // Nombre de la base de datos
        return db;
    } catch (e) {
        console.error("ERROR al conectar a MongoDB Atlas:", e);
        // Si la conexión falla, asegúrate de que tu IP y credenciales son correctas.
        throw new Error('Falló la conexión a la base de datos.');
    }
}

// --- 2. MAPAS DE LÓGICA DE DECISIONES ---

const decisionMap = {
    // Acto 1 (N1-1)
    'D1-A': { impact: 1, nextScene: 'N1-2', final: null },
    'D1-B': { impact: 0, nextScene: 'F1', final: 'F1' },
    'D1-C': { impact: -1, nextScene: 'F2', final: 'F2' },
    
    // Acto 1 (N1-2)
    'D2-A': { impact: 1, nextScene: 'N1-3', final: null },  
    'D2-B': { impact: -1, nextScene: 'F3', final: 'F3' },  
    'D2-C': { impact: 0, nextScene: 'F4', final: 'F4' },    
    
    // Acto 2 (N2-1)
    'D3-A': { impact: 0, nextScene: 'N2-2', final: null },  // A. Prudente (Continúa)
    'D3-C': { impact: -1, nextScene: 'F5', final: 'F5' },    // B. Atajo Obvio (Fatal, usando C para ser coherente con el guion de 3 opciones)
    
    // Acto 2 (N2-3)
    'D5-A': { impact: 0, nextScene: 'N3-1', final: null },  // Continúa al Acto 3
    'D5-B': { impact: 0, nextScene: 'F6_F7_Check', final: 'F6/F7' } // Requiere comprobación
};

// Mapeo de Impactos para D4 (Acto 2, N2-2)
const impactMapD4 = {
    'E2-OT': { 'D4-A': 1, 'D4-B': -1 }, // Cuchara (OT): +1 / -1 VH
    'E2-OC': { 'D4-A': 1, 'D4-B': -2 }  // Sombrero (OC): +1 / -2 VH
};

// --- 3. FUNCIONES AUXILIARES ---

function calculateExtraLives(vh) {
    if (vh <= 0) return 0;
    if (vh <= 2) return 1;
    if (vh <= 4) return 2;
    return 3;
}

// --- 4. ENDPOINTS DE LA API ---

// [INICIO DE PARTIDA] Crea la partida inicial y guarda el nombre del héroe
app.post('/api/start-game', async (req, res) => {
    const db = await connectDB();
    const { heroName } = req.body;

    if (!heroName) {
        return res.status(400).json({ error: 'Falta el nombre del héroe.' });
    }

    try {
        const result = await db.collection('gamesaves').insertOne({
            heroName: heroName,
            braveryPoints: 0, // Inicia en 0
            extraLives: 0,
            currentScene: 'E1-1', // Inicia en el Acto 1
            currentAct: 'Acto 1',
            qteFails: 0, 
            history: [{ id: 'START', impact: 0, timestamp: new Date() }]
        });
        
        // Devuelve el ID de MongoDB (ObjectId)
        res.status(201).json({ 
            gameId: result.insertedId.toString(), 
            initialScene: 'E1-1' 
        });

    } catch (e) {
        console.error('Error al iniciar partida:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// [DECISIONES GENERALES] (D1, D2, D3, D5-A)
app.post('/api/make-decision', async (req, res) => {
    const db = await connectDB();
    const { gameId, choiceId } = req.body;

    if (!gameId || !choiceId) {
        return res.status(400).json({ error: 'Faltan datos de decisión.' });
    }

    const decisionData = decisionMap[choiceId];
    if (!decisionData) {
        return res.status(400).json({ error: 'Decisión no válida.' });
    }

    try {
        const gameSave = await db.collection('gamesaves').findOne({ _id: new ObjectId(gameId) });
        if (!gameSave) {
            return res.status(440).json({ error: 'Partida no encontrada.' });
        }

        let newPoints = gameSave.braveryPoints + decisionData.impact;
        newPoints = Math.max(-3, Math.min(5, newPoints)); 

        let nextScene = decisionData.nextScene;
        let isFinal = !!decisionData.final;

        // LÓGICA ESPECIAL PARA D5-B (Retiro)
        if (choiceId === 'D5-B') {
            isFinal = true;
            if (newPoints >= 1) { // VH >= 1 (Retiro con Dignidad)
                nextScene = 'F6'; 
            } else { // VH <= 0 (Retiro con Pánico)
                nextScene = 'F7';
            }
        }
        // FIN LÓGICA ESPECIAL

        const updateData = {
            $set: { 
                braveryPoints: newPoints,
                currentScene: nextScene,
                currentAct: isFinal ? 'Final' : gameSave.currentAct 
            },
            $push: { history: { id: choiceId, impact: decisionData.impact, timestamp: new Date() } }
        };

        await db.collection('gamesaves').updateOne({ _id: new ObjectId(gameId) }, updateData);

        res.status(200).json({ 
            newScene: nextScene,
            isFinal: isFinal,
            currentPoints: newPoints
        });

    } catch (e) {
        console.error('Error al procesar decisión:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// [PONDERACIÓN PA-1] (Acto 1, N1-3)
app.post('/api/process-pa1', async (req, res) => {
    const db = await connectDB();
    const { gameId } = req.body;

    // ... (Validaciones y try/catch) ...
    try {
        const gameSave = await db.collection('gamesaves').findOne({ _id: new ObjectId(gameId) });
        if (!gameSave) return res.status(440).json({ error: 'Partida no encontrada.' });

        const currentVH = gameSave.braveryPoints;
        let selectedScene;
        let impact;

        // Lógica de Ponderación (PA-1)
        const roll = Math.random(); 

        if (currentVH >= 1) { // VH >= 1: 70% Héroe (E1-H)
            if (roll < 0.70) { selectedScene = 'E1-H'; impact = 1; }
            else { selectedScene = 'E1-C'; impact = -1; }
        } else { // VH <= 0: 70% Cobarde (E1-C)
            if (roll < 0.70) { selectedScene = 'E1-C'; impact = -1; }
            else { selectedScene = 'E1-H'; impact = 1; }
        }

        let newPoints = gameSave.braveryPoints + impact;
        newPoints = Math.max(-3, Math.min(5, newPoints)); 

        const updateData = {
            $set: { braveryPoints: newPoints, currentScene: selectedScene },
            $push: { history: { id: selectedScene, impact: impact, timestamp: new Date() } }
        };

        await db.collection('gamesaves').updateOne({ _id: new ObjectId(gameId) }, updateData);

        res.status(200).json({ 
            newScene: selectedScene,
            currentPoints: newPoints
        });
    } catch (e) {
        console.error('Error al procesar PA-1:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// [PONDERACIÓN PA-2 y DECISIÓN D4] (Acto 2, N2-2)
app.post('/api/process-n2-2', async (req, res) => {
    const db = await connectDB();
    const { gameId, choiceD4 } = req.body; 

    try {
        const gameSave = await db.collection('gamesaves').findOne({ _id: new ObjectId(gameId) });
        if (!gameSave) return res.status(440).json({ error: 'Partida no encontrada.' });

        const currentVH = gameSave.braveryPoints;
        const roll = Math.random(); 
        let foundObject; 

        // 1. Determinar el objeto (PA-2)
        if (currentVH >= 2) { // VH >= 2: 80% Cuchara (E2-OT)
            foundObject = (roll < 0.80) ? 'E2-OT' : 'E2-OC';
        } else { // VH <= 1: 80% Sombrero (E2-OC)
            foundObject = (roll < 0.80) ? 'E2-OC' : 'E2-OT';
        }

        // 2. Aplicar el impacto de D4
        const impact = impactMapD4[foundObject][choiceD4];
        let newPoints = currentVH + impact;
        newPoints = Math.max(-3, Math.min(5, newPoints)); 

        const nextScene = 'N2-3'; // Continúa siempre a N2-3

        await db.collection('gamesaves').updateOne(
            { _id: new ObjectId(gameId) }, 
            { $set: { braveryPoints: newPoints, currentScene: nextScene },
              $push: { history: { id: choiceD4, object: foundObject, impact: impact, timestamp: new Date() } }
            }
        );

        res.status(200).json({ 
            newScene: nextScene,
            foundObject: foundObject,
            currentPoints: newPoints,
            impact: impact
        });

    } catch (e) {
        console.error('Error al procesar N2-2:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// [INICIO ACTO 3] (N3-1) - Calcula Vidas Extra
app.post('/api/start-act-3', async (req, res) => {
    const db = await connectDB();
    const { gameId } = req.body;

    try {
        const gameSave = await db.collection('gamesaves').findOne({ _id: new ObjectId(gameId) });
        if (!gameSave) return res.status(440).json({ error: 'Partida no encontrada.' });

        const currentVH = gameSave.braveryPoints;
        const extraLives = calculateExtraLives(currentVH); // Conversión VH a VE

        const updateData = {
            $set: { 
                braveryPoints: currentVH,
                extraLives: extraLives,
                currentScene: 'N3-2', // Pasa directamente al Asalto 1
                currentAct: 'Acto 3'
            }
        };

        await db.collection('gamesaves').updateOne({ _id: new ObjectId(gameId) }, updateData);

        res.status(200).json({ 
            newScene: 'N3-2', 
            extraLives: extraLives,
            currentVH: currentVH
        });

    } catch (e) {
        console.error('Error al iniciar Acto 3:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// [DUELO DE INSULTOS] (N3-2, N3-3, N3-4) - Procesa Asalto y QTE
app.post('/api/duelo-process-assault', async (req, res) => {
    const db = await connectDB();
    const { gameId, choiceId, vhImpact, livesLost, currentScene, nextAssault } = req.body;

    try {
        const gameSave = await db.collection('gamesaves').findOne({ _id: new ObjectId(gameId) });
        if (!gameSave) return res.status(440).json({ error: 'Partida no encontrada.' });

        // Estado actual del duelo
        let newVH = gameSave.braveryPoints + vhImpact;
        newVH = Math.max(-3, Math.min(5, newVH)); 
        let newLives = gameSave.extraLives - livesLost;
        if (newLives < 0) newLives = 0;
        
        let currentQTEFails = gameSave.qteFails || 0; 
        
        let nextScene = nextAssault;
        let isFinal = false;

        // --- LÓGICA DE CONTEO DE FALLOS DE QTE ---
        const isSuccessfulQTE = choiceId.includes('-E') && vhImpact > 0;
        const isFailedQTE = choiceId.includes('-E') && vhImpact < 0; // -3 VH por fallo de tipeo (QTE fallido)

        if (isSuccessfulQTE) {
            currentQTEFails = 0; // Éxito: Reinicia el contador
        } else if (isFailedQTE) {
            currentQTEFails += 1; // Fallo de QTE: Incrementa el contador
        }
        
        // --- LÓGICA DE DERROTA INCONDICIONAL (Doble Fallo QTE) ---
        if (currentQTEFails >= 2) { 
            isFinal = true;
            nextScene = 'F8'; // Derrota Absoluta (Muerte por Insulto)
        } 
        
        // --- LÓGICA DE DERROTA/AVANCE POR AGOTAMIENTO DE VIDAS ---
        else if (newLives === 0 && !isSuccessfulQTE) { 
            if (newVH < 2) { 
                isFinal = true;
                nextScene = 'F8'; // Derrota Absoluta (VH bajo)
            } else { 
                // VH >= 2 (Héroe/Fuerte): Permanece NO final y avanza a la decisión final.
                isFinal = false; // No es final, solo pierde las vidas.
                nextScene = 'N3-4'; // Avanza directamente a la Decisión Final D6
            }
        } 
        
        // --- LÓGICA DE VICTORIA EN DUELO (Completar Asaltos) ---
        else if (nextAssault === 'N3-4' && !isFinal) {
            nextScene = 'N3-4'; // Avanza a la Decisión Final D6
        }

        // 3. Guardar y Responder
        await db.collection('gamesaves').updateOne(
            { _id: new ObjectId(gameId) }, 
            { $set: { 
                braveryPoints: newVH, 
                extraLives: newLives,
                currentScene: nextScene,
                qteFails: currentQTEFails, 
                currentAct: isFinal ? 'Final' : 'Acto 3'
            },
              $push: { history: { id: choiceId, vh: vhImpact, ve_lost: livesLost, timestamp: new Date() } }
            }
        );

        res.status(200).json({ 
            newScene: nextScene,
            isFinal: isFinal,
            currentVH: newVH,
            extraLives: newLives,
            currentAssault: parseInt(currentScene.slice(2, 3)) 
        });

    } catch (e) {
        console.error('Error al procesar duelo:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// [DECISIÓN FINAL D6] (N3-4) - Determina F10, F11, F12
app.post('/api/make-final-decision', async (req, res) => {
    const db = await connectDB();
    const { gameId, choiceId } = req.body; // choiceId es D6-A o D6-B

    try {
        const gameSave = await db.collection('gamesaves').findOne({ _id: new ObjectId(gameId) });
        if (!gameSave) return res.status(440).json({ error: 'Partida no encontrada.' });

        const currentVH = gameSave.braveryPoints;
        let finalId;
        let vhImpact = 0;

        if (choiceId === 'D6-B') { // El Sobreviviente (No sacrificio)
            finalId = 'F10'; // Final 10: Cuidado de Mascotas
        } else if (choiceId === 'D6-A') { // El Mártir Dramático (Sacrificio)
            vhImpact = 1;
            const finalVH = currentVH + vhImpact;
            if (finalVH < 4) { // VH Final < 4
                finalId = 'F11'; // Final 11: Leyenda Olvidable
            } else { // VH Final >= 4
                finalId = 'F12'; // Final 12: Fama Eterna
            }
        } else {
            return res.status(400).json({ error: 'Decisión final (D6) no válida.' });
        }

        const newVH = Math.max(-3, Math.min(5, currentVH + vhImpact)); 

        await db.collection('gamesaves').updateOne(
            { _id: new ObjectId(gameId) }, 
            { $set: { 
                braveryPoints: newVH, 
                currentScene: finalId,
                currentAct: 'Final'
            },
              $push: { history: { id: choiceId, vh: vhImpact, timestamp: new Date() } }
            }
        );

        res.status(200).json({ 
            newScene: finalId,
            currentPoints: newVH,
            isFinal: true
        });

    } catch (e) {
        console.error('Error al procesar decisión final:', e);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// --- 5. INICIO DEL SERVIDOR ---

app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
    connectDB().catch(err => console.error("El servidor no pudo iniciar debido al error de DB."));
});