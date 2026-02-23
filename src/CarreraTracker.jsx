import React, { useState, useEffect } from 'react';

import {
    Plus, Edit2, Trash2, Save, X, Check, Calendar, BookOpen, User, LogOut,
    Clock, AlertCircle, Star, Target, TrendingUp, Award, BarChart3, CheckCircle,
    Bell, Settings, Download, Upload, Trophy, Clock3, CalendarDays, ChevronLeft,
    ChevronRight, Edit3, GitBranch, ArrowRight, Circle  // ⬅️ AGREGUÉ ESTOS 3
} from 'lucide-react';



// Firebase

import { initializeApp } from 'firebase/app';

import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';

import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';



const firebaseConfig = {

    apiKey: "AIzaSyCRBvf7gcn5xAbEeL90-M9umK1_FI0A_I4",

    authDomain: "organizacion-facu.firebaseapp.com",

    projectId: "organizacion-facu",

    storageBucket: "organizacion-facu.firebasestorage.app",

    messagingSenderId: "1059896693474",

    appId: "1:1059896693474:web:14b45a7eeb07dc975ac4bb",

    measurementId: "G-L7WBPHD53M"

};



const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
const TU_USER_ID_FIJO = "GeQyTcbhkZSjyX1aw2rjoZ06UoR2";



const ESTADOS = {

    NO_CURSADA: 'No Cursada',

    CURSANDO: 'Cursando',

    LIBRE: 'Libre',

    REGULAR: 'Regular',

    PROMOCION: 'Promoción'

};



const COLORES_ESTADO = {

    [ESTADOS.NO_CURSADA]: 'bg-gray-200 text-gray-700 border-gray-300',

    [ESTADOS.CURSANDO]: 'bg-blue-100 text-blue-700 border-blue-300',

    [ESTADOS.LIBRE]: 'bg-red-100 text-red-700 border-red-300',

    [ESTADOS.REGULAR]: 'bg-yellow-100 text-yellow-700 border-yellow-300',

    [ESTADOS.PROMOCION]: 'bg-green-100 text-green-700 border-green-300'

};



const MESAS_EXAMENES = {

    DICIEMBRE_1: 'Diciembre - 1ra Mesa',

    DICIEMBRE_2: 'Diciembre - 2da Mesa',

    FEBRERO_1: 'Febrero - 1ra Mesa',

    FEBRERO_2: 'Febrero - 2da Mesa',

    JUNIO_1: 'Junio - 1ra Mesa',

    JUNIO_2: 'Junio - 2da Mesa'

};



const FECHAS_MESAS = {

    [MESAS_EXAMENES.DICIEMBRE_1]: '2025-12-1',  // Cambiar a 2025

    [MESAS_EXAMENES.DICIEMBRE_2]: '2025-12-15',  // Cambiar a 2025

    [MESAS_EXAMENES.FEBRERO_1]: '2026-02-02',    // Ya está en 2025

    [MESAS_EXAMENES.FEBRERO_2]: '2026-02-16',    // Ya está en 2025

    [MESAS_EXAMENES.JUNIO_1]: '2026-07-01',      // Ya está en 2025

    [MESAS_EXAMENES.JUNIO_2]: '2026-07-08'       // Ya está en 2025

};



// 🎯 NUEVAS FUNCIONALIDADES - SISTEMA DE METAS Y RECORDATORIOS

const TIPOS_RECORDATORIO = {
    PARCIAL: 'Parcial',
    FINAL: 'Final',
    ENTREGA: 'Entrega',
    ESTUDIO: 'Sesión de Estudio'
};



export default function CarreraTracker() {

    const [pestanaActiva, setPestanaActiva] = useState('materias');

    const [materias, setMaterias] = useState([]);

    const [planExamenes, setPlanExamenes] = useState([]);

    const [parcialesProgramados, setParcialesProgramados] = useState([]);

    const [recordatorios, setRecordatorios] = useState([]);

    const [metas, setMetas] = useState([]);

    const [editando, setEditando] = useState(null);

    const [nuevaMateria, setNuevaMateria] = useState({

        nombre: '',
        anio: 1,
        cuatrimestre: 1,
        estado: ESTADOS.NO_CURSADA,
        correlativas: [],
        notaFinal: null,
        notasParciales: []
    });

    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);


    // 3. AGREGA ESTE NUEVO BLOQUE EN SU LUGAR:
    useEffect(() => {
        // Forzamos a la app a usar tu ID fijo
        setUsuario({ uid: TU_USER_ID_FIJO });

        // Cargamos los datos de ESE ID
        cargarDatosUsuario(TU_USER_ID_FIJO);

        // Marcamos que la app ya no está "cargando"
        setCargando(false);

    }, []); // El array vacío [] hace que se ejecute solo una vez.



    const cargarDatosUsuario = async (userId) => {

        try {

            const materiasRef = collection(db, 'users', userId, 'materias');

            const unsubscribeMaterias = onSnapshot(materiasRef, (snapshot) => {

                const materiasData = snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...doc.data()

                }));

                setMaterias(materiasData);

            });



            const examenesRef = collection(db, 'users', userId, 'examenes');

            const unsubscribeExamenes = onSnapshot(examenesRef, (snapshot) => {

                const examenesData = snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...doc.data()

                }));

                setPlanExamenes(examenesData);

            });



            const recordatoriosRef = collection(db, 'users', userId, 'recordatorios');

            const unsubscribeRecordatorios = onSnapshot(recordatoriosRef, (snapshot) => {

                const recordatoriosData = snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...doc.data()

                }));

                setRecordatorios(recordatoriosData);

            });



            const metasRef = collection(db, 'users', userId, 'metas');

            const unsubscribeMetas = onSnapshot(metasRef, (snapshot) => {

                const metasData = snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...doc.data()

                }));

                setMetas(metasData);

            });



            return () => {

                unsubscribeMaterias();

                unsubscribeExamenes();

                unsubscribeRecordatorios();

                unsubscribeMetas();

            };

        } catch (error) {

            console.error('Error cargando datos:', error);

        }

    };



    // 🔄 FUNCIONES EXISTENTES (las mismas que antes)

    const agregarMateria = async () => {

        if (nuevaMateria.nombre.trim() && usuario) {

            const nuevaMateriaConId = {

                ...nuevaMateria,

                id: Date.now().toString(),

                fechaCreacion: new Date().toISOString()

            };



            try {

                await setDoc(doc(db, 'users', usuario.uid, 'materias', nuevaMateriaConId.id), nuevaMateriaConId);



                setNuevaMateria({

                    nombre: '',

                    anio: 1,

                    cuatrimestre: 1,

                    estado: ESTADOS.NO_CURSADA,

                    correlativas: [],

                    notaFinal: null,

                    notasParciales: []

                });

                setMostrandoFormulario(false);

            } catch (error) {

                console.error('Error agregando materia:', error);

            }

        }

    };



    const actualizarMateria = async (id, cambios) => {

        if (usuario) {

            try {

                await setDoc(doc(db, 'users', usuario.uid, 'materias', id),

                    { ...cambios },

                    { merge: true }

                );

            } catch (error) {

                console.error('Error actualizando materia:', error);

            }

        }

    };



    const eliminarMateria = async (id) => {

        if (usuario) {

            try {

                await deleteDoc(doc(db, 'users', usuario.uid, 'materias', id));



                const materiasConCorrelativas = materias.filter(m => m.correlativas.includes(id));

                for (const materia of materiasConCorrelativas) {

                    await actualizarMateria(materia.id, {

                        correlativas: materia.correlativas.filter(c => c !== id)

                    });

                }



                const examenesAEliminar = planExamenes.filter(p => p.materiaId === id);

                for (const examen of examenesAEliminar) {

                    await deleteDoc(doc(db, 'users', usuario.uid, 'examenes', examen.id));

                }

            } catch (error) {

                console.error('Error eliminando materia:', error);

            }

        }

    };

    const puedeCursar = (materia) => {

        if (materia.estado !== ESTADOS.NO_CURSADA) return false;

        if (materia.correlativas.length === 0) return true;



        return materia.correlativas.every(corrId => {

            const correlativa = materias.find(m => m.id === corrId);

            return correlativa && (correlativa.estado === ESTADOS.REGULAR || correlativa.estado === ESTADOS.PROMOCION);

        });

    };

    const agregarNotaParcial = async (materiaId, nota) => {

        if (usuario && nota >= 0 && nota <= 10) {

            const materia = materias.find(m => m.id === materiaId);

            const nuevasNotas = [...(materia.notasParciales || []), {

                nota,

                fecha: new Date().toISOString(),

                id: Date.now().toString()

            }];



            await actualizarMateria(materiaId, {

                notasParciales: nuevasNotas,

                estado: ESTADOS.CURSANDO

            });

        }

    };



    const calcularPromedioMateria = (materia) => {

        if (!materia.notasParciales || materia.notasParciales.length === 0) return null;

        const suma = materia.notasParciales.reduce((acc, curr) => acc + curr.nota, 0);

        return (suma / materia.notasParciales.length).toFixed(2);

    };



    const calcularPromedioGeneral = () => {

        const materiasConNota = materias.filter(m => m.notaFinal !== null && m.notaFinal !== undefined);

        if (materiasConNota.length === 0) return null;



        const suma = materiasConNota.reduce((acc, materia) => acc + materia.notaFinal, 0);

        return (suma / materiasConNota.length).toFixed(2);

    };



    const getEstadisticas = () => {

        const total = materias.length;

        const promocionadas = materias.filter(m => m.estado === ESTADOS.PROMOCION).length;

        const regulares = materias.filter(m => m.estado === ESTADOS.REGULAR).length;

        const cursando = materias.filter(m => m.estado === ESTADOS.CURSANDO).length;

        const libres = materias.filter(m => m.estado === ESTADOS.LIBRE).length;

        const noCursadas = materias.filter(m => m.estado === ESTADOS.NO_CURSADA).length;

        const disponibles = materias.filter(m => puedeCursar(m)).length;



        const porcentajeCompletado = total > 0 ? ((promocionadas + regulares) / total * 100).toFixed(1) : 0;

        const promedioGeneral = calcularPromedioGeneral();

        // ⬇️ AGREGAR ESTAS 3 LÍNEAS NUEVAS:
        const materiasCompletadas = promocionadas + regulares;
        const materiasProyectadas = materiasCompletadas + cursando;
        const porcentajeProyectado = total > 0 ? ((materiasProyectadas) / total * 100).toFixed(1) : 0;

        return {
            total,
            promocionadas,
            regulares,
            cursando,
            libres,
            noCursadas,
            disponibles,
            porcentajeCompletado,
            porcentajeProyectado,  // ⬅️ AGREGAR ESTA LÍNEA
            promedioGeneral
        };

    };



    const agregarExamen = async (materiaId, mesa) => {

        if (usuario) {

            const yaAgregado = planExamenes.find(p => p.materiaId === materiaId && p.mesa === mesa);

            if (!yaAgregado) {

                const nuevoExamen = {

                    id: Date.now().toString(),

                    materiaId,

                    mesa,

                    fechaMesa: FECHAS_MESAS[mesa]

                };



                try {

                    await setDoc(doc(db, 'users', usuario.uid, 'examenes', nuevoExamen.id), nuevoExamen);

                } catch (error) {

                    console.error('Error agregando examen:', error);

                }

            }

        }

    };



    const eliminarExamen = async (id) => {

        if (usuario) {

            try {

                await deleteDoc(doc(db, 'users', usuario.uid, 'examenes', id));

            } catch (error) {

                console.error('Error eliminando examen:', error);

            }

        }

    };



    const marcarComoPromovida = async (materiaId, examenId, nota = null) => {

        await actualizarMateria(materiaId, {

            estado: ESTADOS.PROMOCION,

            notaFinal: nota

        });

        await eliminarExamen(examenId);

    };



    // 🎯 NUEVAS FUNCIONALIDADES - RECORDATORIOS Y METAS

    const agregarRecordatorio = async (recordatorio) => {

        if (usuario) {

            const nuevoRecordatorio = {

                id: Date.now().toString(),

                ...recordatorio,

                completado: false,

                fechaCreacion: new Date().toISOString()

            };



            try {

                await setDoc(doc(db, 'users', usuario.uid, 'recordatorios', nuevoRecordatorio.id), nuevoRecordatorio);

            } catch (error) {

                console.error('Error agregando recordatorio:', error);

            }

        }

    };



    const eliminarRecordatorio = async (id) => {

        if (usuario) {

            try {

                await deleteDoc(doc(db, 'users', usuario.uid, 'recordatorios', id));

            } catch (error) {

                console.error('Error eliminando recordatorio:', error);

            }

        }

    };



    const toggleRecordatorioCompletado = async (id, completado) => {

        if (usuario) {

            try {

                await setDoc(doc(db, 'users', usuario.uid, 'recordatorios', id),

                    { completado },

                    { merge: true }

                );

            } catch (error) {

                console.error('Error actualizando recordatorio:', error);

            }

        }

    };



    const agregarMeta = async (meta) => {

        if (usuario) {

            const nuevaMeta = {

                id: Date.now().toString(),

                ...meta,

                completada: false,

                fechaCreacion: new Date().toISOString()

            };



            try {

                await setDoc(doc(db, 'users', usuario.uid, 'metas', nuevaMeta.id), nuevaMeta);

            } catch (error) {

                console.error('Error agregando meta:', error);

            }

        }

    };



    const toggleMetaCompletada = async (id, completada) => {

        if (usuario) {

            try {

                await setDoc(doc(db, 'users', usuario.uid, 'metas', id),

                    { completada },

                    { merge: true }

                );

            } catch (error) {

                console.error('Error actualizando meta:', error);

            }

        }

    };



    // 📊 CALCULAR PRÓXIMOS VENCIMIENTOS

    const getProximosVencimientos = () => {

        const hoy = new Date();

        const recordatoriosProximos = recordatorios

            .filter(r => !r.completado && new Date(r.fecha) >= hoy)

            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

            .slice(0, 5);



        return recordatoriosProximos;

    };



    const stats = getEstadisticas();

    const materiasParaExamen = materias.filter(m =>

        m.estado === ESTADOS.REGULAR || m.estado === ESTADOS.LIBRE || m.estado === ESTADOS.CURSANDO

    );



    // DEBUG temporal

    console.log('Materias para examen:', materiasParaExamen.map(m => ({

        nombre: m.nombre,

        estado: m.estado,

        id: m.id

    })));



    const proximosVencimientos = getProximosVencimientos();



    if (cargando) {

        return (

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">

                <div className="bg-white rounded-lg shadow-lg p-8 text-center">

                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>

                    <p className="text-gray-600">Cargando tu progreso académico...</p>

                </div>

            </div>

        );

    }



    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex justify-between items-center">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-1">

                            Visualizador de Progreso Académico

                        </h1>

                        <p className="text-sm text-gray-600">Gestiona tu avance y planifica tus exámenes</p>

                    </div>

                    <div className="flex items-center gap-2">

                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">

                            <User size={16} className="text-indigo-600" />

                            <span className="text-sm text-indigo-700">Anónimo</span>

                        </div>

                    </div>

                </div>



                {/* Barra de progreso principal */}

                {/* BARRA DE PROGRESO MEJORADA */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={18} />
                            Progreso de Carrera
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span className="text-sm text-gray-600">Real: {stats.porcentajeCompletado}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                                <span className="text-sm text-gray-600">Proyectado: {stats.porcentajeProyectado}%</span>
                            </div>
                            {stats.promedioGeneral && (
                                <span className="text-sm font-medium text-gray-600">
                                    Promedio: {stats.promedioGeneral}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Barra con dos capas */}
                    <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                        {/* Capa proyectada (azul) */}
                        <div
                            className="absolute top-0 left-0 bg-blue-400 h-6 rounded-full transition-all duration-500"
                            style={{ width: `${stats.porcentajeProyectado}%` }}
                        ></div>
                        {/* Capa real (verde) - se superpone */}
                        <div
                            className="absolute top-0 left-0 bg-green-500 h-6 rounded-full transition-all duration-500"
                            style={{ width: `${stats.porcentajeCompletado}%` }}
                        ></div>
                        {/* Texto centrado */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow">
                                {stats.promocionadas + stats.regulares} / {stats.total} materias
                                {stats.cursando > 0 && ` (+${stats.cursando} cursando)`}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>



                {/* Próximos vencimientos */}

                {proximosVencimientos.length > 0 && (

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">

                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">

                            <Bell size={16} />

                            Próximos Vencimientos

                        </h4>

                        <div className="space-y-1">

                            {proximosVencimientos.map(recordatorio => (

                                <div key={recordatorio.id} className="flex justify-between items-center text-sm">

                                    <span>{recordatorio.titulo}</span>

                                    <span className="text-orange-600 font-medium">

                                        {new Date(recordatorio.fecha).toLocaleDateString()}

                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                )}



                {/* Pestañas */}

                <div className="flex gap-2 mb-4 flex-wrap">

                    <button

                        onClick={() => setPestanaActiva('materias')}

                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${pestanaActiva === 'materias'

                            ? 'bg-indigo-600 text-white shadow-lg'

                            : 'bg-white text-gray-700 hover:bg-gray-100'

                            }`}

                    >

                        <BookOpen size={18} />

                        Materias

                    </button>
                    <button
                        onClick={() => setPestanaActiva('correlativas')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${pestanaActiva === 'correlativas'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <GitBranch size={18} />
                        Mapa de Correlativas
                    </button>
                    <button

                        onClick={() => setPestanaActiva('examenes')}

                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${pestanaActiva === 'examenes'

                            ? 'bg-indigo-600 text-white shadow-lg'

                            : 'bg-white text-gray-700 hover:bg-gray-100'

                            }`}

                    >

                        <Calendar size={18} />

                        Mesas de Exámenes

                    </button>

                    <button

                        onClick={() => setPestanaActiva('estadisticas')}

                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${pestanaActiva === 'estadisticas'

                            ? 'bg-indigo-600 text-white shadow-lg'

                            : 'bg-white text-gray-700 hover:bg-gray-100'

                            }`}

                    >

                        <BarChart3 size={18} />

                        Estadísticas

                    </button>

                    <button

                        onClick={() => setPestanaActiva('planificacion')}

                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${pestanaActiva === 'planificacion'

                            ? 'bg-indigo-600 text-white shadow-lg'

                            : 'bg-white text-gray-700 hover:bg-gray-100'

                            }`}

                    >

                        <CalendarDays size={18} />

                        Planificación

                    </button>



                    <button

                        onClick={() => setPestanaActiva('calendario')}

                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${pestanaActiva === 'calendario'

                            ? 'bg-indigo-600 text-white shadow-lg'

                            : 'bg-white text-gray-700 hover:bg-gray-100'

                            }`}

                    >

                        <CalendarDays size={18} />

                        Calendario

                    </button>

                </div>



                {/* Estadísticas */}

                <div className="grid grid-cols-3 md:grid-cols-8 gap-2 mb-4">

                    <div className="bg-white rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-gray-800">{stats.total}</div>

                        <div className="text-xs text-gray-600">Total</div>

                    </div>

                    <div className="bg-green-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-green-700">{stats.promocionadas}</div>

                        <div className="text-xs text-green-600">Promoción</div>

                    </div>

                    <div className="bg-yellow-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-yellow-700">{stats.regulares}</div>

                        <div className="text-xs text-yellow-600">Regulares</div>

                    </div>

                    <div className="bg-blue-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-blue-700">{stats.cursando}</div>

                        <div className="text-xs text-blue-600">Cursando</div>

                    </div>

                    <div className="bg-red-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-red-700">{stats.libres}</div>

                        <div className="text-xs text-red-600">Libres</div>

                    </div>

                    <div className="bg-gray-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-gray-700">{stats.noCursadas}</div>

                        <div className="text-xs text-gray-600">No Cursadas</div>

                    </div>

                    <div className="bg-purple-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-purple-700">{stats.disponibles}</div>

                        <div className="text-xs text-purple-600">Disponibles</div>

                    </div>

                    <div className="bg-orange-50 rounded-lg shadow p-2">

                        <div className="text-xl font-bold text-orange-700">{stats.porcentajeCompletado}%</div>

                        <div className="text-xs text-orange-600">Completado</div>

                    </div>

                </div>



                {/* Contenido según pestaña */}

                {/* Contenido según pestaña */}
                {
                    pestanaActiva === 'correlativas' ? (
                        <MapaCorrelativas materias={materias} />
                    ) : pestanaActiva === 'calendario' ? (
                        <CalendarioPrincipal
                            materias={materias}
                            recordatorios={recordatorios}
                            metas={metas}
                            planExamenes={planExamenes}
                        />
                    ) : pestanaActiva === 'materias' ? (
                        <VistaMaterias
                            materias={materias}
                            mostrandoFormulario={mostrandoFormulario}
                            setMostrandoFormulario={setMostrandoFormulario}
                            nuevaMateria={nuevaMateria}
                            setNuevaMateria={setNuevaMateria}
                            agregarMateria={agregarMateria}
                            actualizarMateria={actualizarMateria}
                            puedeCursar={puedeCursar}
                            eliminarMateria={eliminarMateria}
                            agregarNotaParcial={agregarNotaParcial}
                            calcularPromedioMateria={calcularPromedioMateria}
                        />
                    ) : pestanaActiva === 'examenes' ? (
                        <VistaMesasExamenes
                            materias={materias}
                            materiasParaExamen={materiasParaExamen}
                            planExamenes={planExamenes}
                            agregarExamen={agregarExamen}
                            eliminarExamen={eliminarExamen}
                            actualizarMateria={actualizarMateria}
                            marcarComoPromovida={marcarComoPromovida}
                        />
                    ) : pestanaActiva === 'estadisticas' ? (
                        <VistaEstadisticas
                            stats={stats}
                            materias={materias}
                        />
                    ) : (
                        <VistaPlanificacion
                            materias={materias}
                            recordatorios={recordatorios}
                            metas={metas}
                            agregarRecordatorio={agregarRecordatorio}
                            eliminarRecordatorio={eliminarRecordatorio}
                            toggleRecordatorioCompletado={toggleRecordatorioCompletado}
                            agregarMeta={agregarMeta}
                            toggleMetaCompletada={toggleMetaCompletada}
                        />
                    )}

            </div>

        </div>

    );

}

// 🆕 COMPONENTE MAPA DE CORRELATIVAS
// 🎨 MAPA DE CORRELATIVAS INTERACTIVO - VERSIÓN CON NODOS FLOTANTES
// Copia SOLO este componente y reemplaza el MapaCorrelativas que tienes

// 🆕 COMPONENTE MAPA DE CORRELATIVAS - VERSIÓN INTERACTIVA CON NODOS FLOTANTES
// 🎨 MAPA DE CORRELATIVAS MEJORADO - CON SCROLL, ZOOM Y MEJOR UX
// REEMPLAZA tu componente MapaCorrelativas con este

function MapaCorrelativas({ materias }) {
    const [nodos, setNodos] = useState([]);
    const [destacarMateria, setDestacarMateria] = useState(null);
    const [arrastrandoNodo, setArrastrandoNodo] = useState(null);
    const [mostrarConexiones, setMostrarConexiones] = useState(true);
    const [modoVista, setModoVista] = useState('automatico');
    const [zoom, setZoom] = useState(1);
    const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'criticas', 'finales', 'iniciales'
    const canvasRef = React.useRef(null);
    const [dimensionesCanvas, setDimensionesCanvas] = useState({ width: 2000, height: 1200 });

    // Calcular dimensiones necesarias del canvas
    useEffect(() => {
        if (materias.length === 0) return;

        // Calcular cuántas columnas necesitamos (5 años × 2 cuatrimestres = 10 columnas)
        const numColumnas = 10;
        const materiasMaxPorColumna = Math.max(
            ...Array.from({ length: numColumnas }, (_, col) =>
                materias.filter(m => (m.anio - 1) * 2 + (m.cuatrimestre - 1) === col).length
            )
        );

        const anchoNecesario = Math.max(2000, (numColumnas + 1) * 220);
        const altoNecesario = Math.max(1200, (materiasMaxPorColumna + 1) * 150);

        setDimensionesCanvas({ width: anchoNecesario, height: altoNecesario });
    }, [materias]);

    // Inicializar posiciones de nodos
    useEffect(() => {
        if (materias.length === 0) return;

        const nodosIniciales = materias.map((materia) => {
            const columna = (materia.anio - 1) * 2 + (materia.cuatrimestre - 1);
            const materiasMismaColumna = materias.filter(
                m => (m.anio - 1) * 2 + (m.cuatrimestre - 1) === columna
            );
            const indexEnColumna = materiasMismaColumna.indexOf(materia);

            return {
                id: materia.id,
                x: 150 + columna * 220,
                y: 100 + indexEnColumna * 150,
                materia: materia
            };
        });

        setNodos(nodosIniciales);
    }, [materias]);

    const getDependientes = (materiaId) => {
        return materias.filter(m => m.correlativas && m.correlativas.includes(materiaId));
    };

    const getMateriasCriticas = () => {
        return materias
            .map(m => ({
                ...m,
                dependientes: getDependientes(m.id).length
            }))
            .filter(m => m.dependientes >= 2)
            .sort((a, b) => b.dependientes - a.dependientes);
    };

    const getMateriasFinales = () => {
        // Materias que NO son correlativas de ninguna otra (mueren ahí)
        return materias.filter(m => getDependientes(m.id).length === 0);
    };

    const getMateriasIniciales = () => {
        // Materias sin correlativas (puedes empezar por ellas)
        return materias.filter(m => !m.correlativas || m.correlativas.length === 0);
    };

    const handleMouseDown = (e, nodoId) => {
        if (modoVista === 'manual') {
            setArrastrandoNodo(nodoId);
        }
    };

    const handleMouseMove = (e) => {
        if (arrastrandoNodo && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;

            setNodos(prev => prev.map(nodo =>
                nodo.id === arrastrandoNodo ? { ...nodo, x, y } : nodo
            ));
        }
    };

    const handleMouseUp = () => {
        setArrastrandoNodo(null);
    };

    const getNodoById = (id) => nodos.find(n => n.id === id);

    const autoOrganizar = () => {
        const nodosOrganizados = materias.map((materia) => {
            const columna = (materia.anio - 1) * 2 + (materia.cuatrimestre - 1);
            const materiasMismaColumna = materias.filter(
                m => (m.anio - 1) * 2 + (m.cuatrimestre - 1) === columna
            );
            const indexEnColumna = materiasMismaColumna.indexOf(materia);

            return {
                id: materia.id,
                x: 150 + columna * 220,
                y: 100 + indexEnColumna * 150,
                materia: materia
            };
        });

        setNodos(nodosOrganizados);
    };

    const materiasCriticas = getMateriasCriticas();
    const materiasFinales = getMateriasFinales();
    const materiasIniciales = getMateriasIniciales();

    // Filtrar nodos según el filtro activo
    const nodosFiltrados = nodos.filter(nodo => {
        if (filtroTipo === 'todos') return true;
        if (filtroTipo === 'criticas') return materiasCriticas.some(m => m.id === nodo.id);
        if (filtroTipo === 'finales') return materiasFinales.some(m => m.id === nodo.id);
        if (filtroTipo === 'iniciales') return materiasIniciales.some(m => m.id === nodo.id);
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Panel de controles mejorado */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <GitBranch className="text-indigo-600" />
                        Mapa de Correlativas Interactivo
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setMostrarConexiones(!mostrarConexiones)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${mostrarConexiones
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            {mostrarConexiones ? '🔗 Ocultar Líneas' : '🔗 Mostrar Líneas'}
                        </button>

                        <button
                            onClick={() => setModoVista(modoVista === 'automatico' ? 'manual' : 'automatico')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${modoVista === 'manual'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            {modoVista === 'manual' ? '✋ Modo Manual' : '🤖 Modo Auto'}
                        </button>

                        <button
                            onClick={autoOrganizar}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                            ↻ Reorganizar
                        </button>

                        <button
                            onClick={() => setDestacarMateria(null)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                        >
                            ✕ Limpiar
                        </button>
                    </div>
                </div>

                {/* Controles de Zoom */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <span className="text-sm font-medium text-gray-700">Zoom:</span>
                    <button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                    >
                        -
                    </button>
                    <span className="text-sm font-medium min-w-[60px] text-center">
                        {(zoom * 100).toFixed(0)}%
                    </span>
                    <button
                        onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setZoom(1)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                    >
                        Reset
                    </button>
                </div>

                {/* Filtros de tipo de materia */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setFiltroTipo('todos')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroTipo === 'todos'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        📚 Todas ({materias.length})
                    </button>
                    <button
                        onClick={() => setFiltroTipo('criticas')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroTipo === 'criticas'
                            ? 'bg-orange-600 text-white'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                    >
                        ⚠️ Críticas ({materiasCriticas.length})
                    </button>
                    <button
                        onClick={() => setFiltroTipo('finales')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroTipo === 'finales'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                    >
                        🎯 Finales ({materiasFinales.length})
                    </button>
                    <button
                        onClick={() => setFiltroTipo('iniciales')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroTipo === 'iniciales'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        🚀 Iniciales ({materiasIniciales.length})
                    </button>
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded-full"></div>
                        <span>Promoción</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded-full"></div>
                        <span>Regular</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded-full"></div>
                        <span>Cursando</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded-full"></div>
                        <span>Libre</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border-2 border-gray-500 rounded-full"></div>
                        <span>No Cursada</span>
                    </div>
                </div>

                {modoVista === 'manual' && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-2 text-sm text-purple-700">
                        💡 <strong>Modo Manual:</strong> Arrastra los nodos para reorganizar el mapa
                    </div>
                )}
            </div>

            {/* Información contextual según filtro */}
            {filtroTipo === 'criticas' && materiasCriticas.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                    <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        ⚠️ Materias Críticas - Te Traban el Avance
                    </h3>
                    <p className="text-sm text-orange-800 mb-3">
                        Estas materias son "cuellos de botella": bloquean 2 o más materias futuras. ¡Priorizalas!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {materiasCriticas.slice(0, 6).map(materia => (
                            <button
                                key={materia.id}
                                onClick={() => {
                                    setDestacarMateria(materia);
                                    setFiltroTipo('todos');
                                }}
                                className={`${COLORES_ESTADO[materia.estado]} p-3 rounded-lg border-2 text-left hover:shadow-lg transition-all`}
                            >
                                <div className="font-bold text-sm">{materia.nombre}</div>
                                <div className="text-xs mt-1 flex items-center gap-1">
                                    <span>🔒 Bloquea</span>
                                    <strong className="text-lg">{materia.dependientes}</strong>
                                    <span>materia{materia.dependientes > 1 ? 's' : ''}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {filtroTipo === 'finales' && materiasFinales.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                        🎯 Materias Finales - No Habilitan Nada Más
                    </h3>
                    <p className="text-sm text-red-800 mb-3">
                        Estas materias "mueren acá": no son correlativas de ninguna otra. Podés dejarlas para el final.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {materiasFinales.map(materia => (
                            <button
                                key={materia.id}
                                onClick={() => {
                                    setDestacarMateria(materia);
                                    setFiltroTipo('todos');
                                }}
                                className={`${COLORES_ESTADO[materia.estado]} px-3 py-2 rounded-lg text-sm font-medium border-2 hover:shadow-lg transition-all`}
                            >
                                {materia.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {filtroTipo === 'iniciales' && materiasIniciales.length > 0 && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        🚀 Materias Iniciales - Empezá Por Acá
                    </h3>
                    <p className="text-sm text-green-800 mb-3">
                        Estas materias no tienen correlativas. ¡Son tu punto de partida!
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {materiasIniciales.map(materia => (
                            <button
                                key={materia.id}
                                onClick={() => {
                                    setDestacarMateria(materia);
                                    setFiltroTipo('todos');
                                }}
                                className={`${COLORES_ESTADO[materia.estado]} px-3 py-2 rounded-lg text-sm font-medium border-2 hover:shadow-lg transition-all`}
                            >
                                {materia.nombre}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Panel de información de materia destacada */}
            {destacarMateria && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-4 shadow-xl">
                    <button
                        onClick={() => setDestacarMateria(null)}
                        className="float-right text-indigo-600 hover:text-indigo-800 font-bold text-xl"
                    >
                        ✕
                    </button>
                    <h4 className="font-bold text-indigo-900 mb-3 text-lg">
                        {destacarMateria.nombre}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="font-medium text-indigo-800">📍 Ubicación:</span>
                            <div className="text-sm text-indigo-700 mt-1">
                                {destacarMateria.anio}° Año • {destacarMateria.cuatrimestre === 1 ? '1er' : '2do'} Cuatrimestre
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${COLORES_ESTADO[destacarMateria.estado]}`}>
                                {destacarMateria.estado}
                            </div>
                        </div>

                        <div>
                            {destacarMateria.correlativas && destacarMateria.correlativas.length > 0 ? (
                                <>
                                    <span className="font-medium text-indigo-800">⬅️ Requiere ({destacarMateria.correlativas.length}):</span>
                                    <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                                        {destacarMateria.correlativas.map(corrId => {
                                            const corr = materias.find(m => m.id === corrId);
                                            return corr ? (
                                                <div key={corrId} className={`text-xs px-2 py-1 rounded ${COLORES_ESTADO[corr.estado]}`}>
                                                    {corr.nombre}
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-green-700 font-bold">
                                    ✅ Sin correlativas - ¡Puedes cursarla ya!
                                </div>
                            )}
                        </div>

                        {getDependientes(destacarMateria.id).length > 0 && (
                            <div className="md:col-span-2 mt-2 pt-2 border-t border-indigo-200">
                                <span className="font-medium text-indigo-800">
                                    ➡️ Habilita ({getDependientes(destacarMateria.id).length}):
                                </span>
                                <div className="mt-1 flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                    {getDependientes(destacarMateria.id).map(dep => (
                                        <span key={dep.id} className={`text-xs px-2 py-1 rounded ${COLORES_ESTADO[dep.estado]}`}>
                                            {dep.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {getDependientes(destacarMateria.id).length === 0 && (
                            <div className="md:col-span-2 mt-2 pt-2 border-t border-indigo-200">
                                <div className="text-sm text-red-700 font-bold">
                                    🎯 MATERIA FINAL - No habilita ninguna otra
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Canvas interactivo CON SCROLL */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Usa scroll horizontal/vertical para navegar por todo el mapa</span>
                </div>
                <div
                    className="overflow-auto border-2 border-gray-200 rounded-lg"
                    style={{ maxHeight: '600px' }}
                >
                    <div
                        ref={canvasRef}
                        className="relative bg-gradient-to-br from-gray-50 to-blue-50"
                        style={{
                            width: `${dimensionesCanvas.width * zoom}px`,
                            height: `${dimensionesCanvas.height * zoom}px`,
                            cursor: modoVista === 'manual' && arrastrandoNodo ? 'grabbing' : 'default',
                            minWidth: '100%'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* SVG para las conexiones */}
                        {mostrarConexiones && (
                            <svg
                                className="absolute inset-0 pointer-events-none"
                                style={{ width: '100%', height: '100%' }}
                            >
                                <defs>
                                    <marker
                                        id="arrowhead"
                                        markerWidth="10"
                                        markerHeight="10"
                                        refX="9"
                                        refY="3"
                                        orient="auto"
                                    >
                                        <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
                                    </marker>
                                    <marker
                                        id="arrowhead-critical"
                                        markerWidth="10"
                                        markerHeight="10"
                                        refX="9"
                                        refY="3"
                                        orient="auto"
                                    >
                                        <polygon points="0 0, 10 3, 0 6" fill="#f97316" />
                                    </marker>
                                </defs>
                                {nodosFiltrados.map(nodo => {
                                    if (!nodo.materia.correlativas) return null;
                                    return nodo.materia.correlativas.map(corrId => {
                                        const nodoOrigen = getNodoById(corrId);
                                        if (!nodoOrigen) return null;
                                        if (filtroTipo !== 'todos' && !nodosFiltrados.find(n => n.id === corrId)) return null;

                                        const esDestacada = destacarMateria &&
                                            (destacarMateria.id === nodo.id || destacarMateria.id === corrId);

                                        const esCritica = materiasCriticas.some(m => m.id === nodoOrigen.id);

                                        return (
                                            <g key={`${corrId}-${nodo.id}`}>
                                                <line
                                                    x1={(nodoOrigen.x + 80) * zoom}
                                                    y1={(nodoOrigen.y + 40) * zoom}
                                                    x2={nodo.x * zoom}
                                                    y2={(nodo.y + 40) * zoom}
                                                    stroke={esDestacada ? '#6366f1' : esCritica ? '#f97316' : '#cbd5e1'}
                                                    strokeWidth={esDestacada ? 3 * zoom : esCritica ? 2.5 * zoom : 2 * zoom}
                                                    markerEnd={esCritica ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                                                    className="transition-all duration-300"
                                                />
                                            </g>
                                        );
                                    });
                                })}
                            </svg>
                        )}

                        {/* Nodos flotantes */}
                        {nodosFiltrados.map(nodo => {
                            const esDestacada = destacarMateria?.id === nodo.id;
                            const estaConectada = destacarMateria && (
                                destacarMateria.correlativas?.includes(nodo.id) ||
                                getDependientes(destacarMateria.id).some(d => d.id === nodo.id)
                            );
                            const esCritica = materiasCriticas.some(m => m.id === nodo.id);
                            const esFinal = materiasFinales.some(m => m.id === nodo.id);
                            const esInicial = materiasIniciales.some(m => m.id === nodo.id);

                            return (
                                <div
                                    key={nodo.id}
                                    className={`absolute transition-all duration-300 ${modoVista === 'manual' ? 'cursor-grab active:cursor-grabbing' : ''
                                        } ${esDestacada ? 'z-50 scale-110' : estaConectada ? 'z-40 scale-105' : 'z-30'
                                        }`}
                                    style={{
                                        left: `${nodo.x * zoom}px`,
                                        top: `${nodo.y * zoom}px`,
                                        width: `${160 * zoom}px`,
                                        transform: zoom !== 1 ? `scale(${1})` : 'none',
                                        transformOrigin: 'top left'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, nodo.id)}
                                >
                                    <button
                                        onClick={() => setDestacarMateria(nodo.materia)}
                                        className={`w-full p-3 rounded-xl border-3 shadow-lg hover:shadow-2xl transition-all relative ${COLORES_ESTADO[nodo.materia.estado]
                                            } ${esDestacada ? 'ring-4 ring-indigo-400 border-indigo-500' : ''
                                            } ${estaConectada && !esDestacada ? 'ring-2 ring-purple-300' : ''
                                            } ${esCritica && !esDestacada ? 'ring-2 ring-orange-400' : ''
                                            }`}
                                    >
                                        {/* Badges de tipo */}
                                        <div className="absolute -top-2 -right-2 flex gap-1">
                                            {esCritica && (
                                                <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                                    ⚠️
                                                </span>
                                            )}
                                            {esFinal && (
                                                <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                                    🎯
                                                </span>
                                            )}
                                            {esInicial && (
                                                <span className="bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                                    🚀
                                                </span>
                                            )}
                                        </div>

                                        <div className="font-bold text-xs leading-tight mb-1">
                                            {nodo.materia.nombre}
                                        </div>
                                        <div className="text-[10px] opacity-75">
                                            {nodo.materia.anio}° • C{nodo.materia.cuatrimestre}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            {nodo.materia.correlativas && nodo.materia.correlativas.length > 0 && (
                                                <div className="text-[10px] font-medium flex items-center gap-1">
                                                    <span>⬅️</span>
                                                    <span>{nodo.materia.correlativas.length}</span>
                                                </div>
                                            )}
                                            {getDependientes(nodo.materia.id).length > 0 && (
                                                <div className="text-[10px] font-medium flex items-center gap-1">
                                                    <span>➡️</span>
                                                    <span>{getDependientes(nodo.materia.id).length}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}

                        {/* Indicadores de año en el fondo */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[1, 2, 3, 4, 5].map(anio => (
                                <div
                                    key={anio}
                                    className="absolute text-6xl font-bold opacity-5 text-gray-400"
                                    style={{
                                        left: `${(60 + (anio - 1) * 400) * zoom}px`,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: `${60 * zoom}px`
                                    }}
                                >
                                    {anio}°
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas mejoradas */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">📊 Análisis Completo del Mapa</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center cursor-pointer hover:bg-blue-100 transition"
                        onClick={() => setFiltroTipo('iniciales')}>
                        <div className="text-3xl font-bold text-blue-700">{materiasIniciales.length}</div>
                        <div className="text-xs text-blue-600 mt-1">🚀 Iniciales</div>
                        <div className="text-[10px] text-blue-500 mt-1">Sin correlativas</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center cursor-pointer hover:bg-orange-100 transition"
                        onClick={() => setFiltroTipo('criticas')}>
                        <div className="text-3xl font-bold text-orange-700">{materiasCriticas.length}</div>
                        <div className="text-xs text-orange-600 mt-1">⚠️ Críticas</div>
                        <div className="text-[10px] text-orange-500 mt-1">Te traban</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center cursor-pointer hover:bg-red-100 transition"
                        onClick={() => setFiltroTipo('finales')}>
                        <div className="text-3xl font-bold text-red-700">{materiasFinales.length}</div>
                        <div className="text-xs text-red-600 mt-1">🎯 Finales</div>
                        <div className="text-[10px] text-red-500 mt-1">Mueren ahí</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-3xl font-bold text-purple-700">
                            {materias.reduce((max, m) => Math.max(max, m.correlativas?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">Máx. requisitos</div>
                        <div className="text-[10px] text-purple-500 mt-1">Más compleja</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-3xl font-bold text-green-700">
                            {materias.reduce((sum, m) => sum + (m.correlativas?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">Conexiones</div>
                        <div className="text-[10px] text-green-500 mt-1">Red total</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// AGREGÁ ESTE COMPONENTE ANTES de VistaMaterias

function MateriaCard({

    materia,

    materias,

    puedeCursar,

    onActualizar,

    onEliminar,

    agregarNotaParcial,

    calcularPromedioMateria

}) {

    const [editando, setEditando] = useState(false);

    const [estado, setEstado] = useState(materia.estado);

    const [notaFinal, setNotaFinal] = useState(materia.notaFinal || '');

    const [nuevaNotaParcial, setNuevaNotaParcial] = useState('');



    const correlativasNombres = materia.correlativas

        .map(id => {

            const correlativa = materias.find(m => m.id === id);

            return correlativa ? {

                nombre: correlativa.nombre,

                estado: correlativa.estado,

                cumple: correlativa.estado === ESTADOS.REGULAR || correlativa.estado === ESTADOS.PROMOCION

            } : null;

        })

        .filter(Boolean);



    const promedio = calcularPromedioMateria(materia);

    const todasCorrelativasCumplidas = correlativasNombres.every(c => c.cumple);







    const handleGuardar = () => {

        const cambios = { estado };

        if (notaFinal !== '' && !isNaN(notaFinal)) {

            cambios.notaFinal = parseFloat(notaFinal);

        }

        onActualizar(materia.id, cambios);

        setEditando(false);

    };



    const handleAgregarNotaParcial = () => {

        if (nuevaNotaParcial !== '' && !isNaN(nuevaNotaParcial)) {

            agregarNotaParcial(materia.id, parseFloat(nuevaNotaParcial));

            setNuevaNotaParcial('');

        }

    };



    return (

        <div className={`border-2 rounded-lg p-3 ${COLORES_ESTADO[materia.estado]} transition-all hover:shadow-md`}>

            <div className="flex items-start justify-between gap-2">

                <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 mb-1">

                        <h4 className="font-semibold text-sm truncate">{materia.nombre}</h4>

                        {puedeCursar(materia) && (

                            <CheckCircle size={14} className="text-green-600 flex-shrink-0" />

                        )}

                    </div>



                    {/* Información de correlativas */}

                    {correlativasNombres.length > 0 && (

                        <div className="mb-2">

                            <p className="text-xs font-medium text-gray-600 mb-1">Correlativas:</p>

                            <div className="space-y-1">

                                {correlativasNombres.map((corr, index) => (

                                    <div key={index} className="flex items-center gap-1 text-xs">

                                        <div className={`w-2 h-2 rounded-full ${corr.cumple ? 'bg-green-500' : 'bg-red-500'

                                            }`}></div>

                                        <span className={corr.cumple ? 'text-green-700' : 'text-red-700'}>

                                            {corr.nombre} ({corr.estado})

                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}



                    {/* Notas y promedios */}

                    {(materia.notasParciales && materia.notasParciales.length > 0) && (

                        <div className="mb-2">

                            <p className="text-xs font-medium text-gray-600">Parciales:</p>

                            <div className="flex gap-1 flex-wrap">

                                {materia.notasParciales.map((notaObj, index) => (

                                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">

                                        P{index + 1}: {notaObj.nota}

                                    </span>

                                ))}

                                {promedio && (

                                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">

                                        Prom: {promedio}

                                    </span>

                                )}

                            </div>

                        </div>

                    )}



                    {materia.notaFinal !== null && materia.notaFinal !== undefined && (

                        <div className="mb-2">

                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">

                                Final: {materia.notaFinal}

                            </span>

                        </div>

                    )}



                    {/* Agregar nota parcial */}

                    {materia.estado === ESTADOS.CURSANDO && (

                        <div className="flex gap-1 mb-2">

                            <input

                                type="number"

                                min="0"

                                max="10"

                                step="0.1"

                                value={nuevaNotaParcial}

                                onChange={(e) => setNuevaNotaParcial(e.target.value)}

                                placeholder="Nota"

                                className="text-xs border rounded px-2 py-1 w-16"

                            />

                            <button

                                onClick={handleAgregarNotaParcial}

                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"

                            >

                                +

                            </button>

                        </div>

                    )}



                    {editando ? (

                        <div className="flex items-center gap-1 mt-2">

                            <select

                                value={estado}

                                onChange={(e) => setEstado(e.target.value)}

                                className="text-xs border rounded px-2 py-1 bg-white flex-1"

                            >

                                {Object.values(ESTADOS).map(e => (

                                    <option key={e} value={e}>{e}</option>

                                ))}

                            </select>

                            <input

                                type="number"

                                min="0"

                                max="10"

                                step="0.1"

                                value={notaFinal}

                                onChange={(e) => setNotaFinal(e.target.value)}

                                placeholder="Nota final"

                                className="text-xs border rounded px-2 py-1 w-16"

                            />

                            <button

                                onClick={handleGuardar}

                                className="p-1 bg-green-500 text-white rounded hover:bg-green-600 flex-shrink-0"

                            >

                                <Check size={12} />

                            </button>

                            <button

                                onClick={() => {

                                    setEditando(false);

                                    setEstado(materia.estado);

                                    setNotaFinal(materia.notaFinal || '');

                                }}

                                className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500 flex-shrink-0"

                            >

                                <X size={12} />

                            </button>

                        </div>

                    ) : (

                        <div className="flex items-center gap-1 mt-1 flex-wrap">

                            <span className="text-xs font-medium">{materia.estado}</span>

                            {puedeCursar(materia) && (

                                <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">

                                    Disponible

                                </span>

                            )}

                            {!todasCorrelativasCumplidas && materia.estado === ESTADOS.NO_CURSADA && (

                                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">

                                    Correlativas pendientes

                                </span>

                            )}

                        </div>

                    )}

                </div>



                <div className="flex gap-1 flex-shrink-0">

                    <button

                        onClick={() => setEditando(!editando)}

                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition"

                    >

                        <Edit2 size={12} />

                    </button>

                    <button

                        onClick={() => onEliminar(materia.id)}

                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition"

                    >

                        <Trash2 size={12} />

                    </button>

                </div>

            </div>

        </div>

    );

}

// 🆕 COMPONENTE VISTA MATERIAS (que faltaba)

function VistaMaterias({

    materias,

    mostrandoFormulario,

    setMostrandoFormulario,

    nuevaMateria,

    setNuevaMateria,

    agregarMateria,

    actualizarMateria,

    eliminarMateria,



    puedeCursar,

    agregarNotaParcial,

    calcularPromedioMateria

}) {


    return (

        <>

            {!mostrandoFormulario && (

                <button

                    onClick={() => setMostrandoFormulario(true)}

                    className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"

                >

                    <Plus size={18} />

                    Agregar Materia

                </button>

            )}



            {mostrandoFormulario && (

                <div className="bg-white rounded-lg shadow-lg p-4 mb-4">

                    <h3 className="text-lg font-bold mb-3">Nueva Materia</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

                        <input

                            type="text"

                            placeholder="Nombre de la materia"

                            value={nuevaMateria.nombre}

                            onChange={(e) => setNuevaMateria({ ...nuevaMateria, nombre: e.target.value })}

                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"

                        />

                        <select

                            value={nuevaMateria.anio}

                            onChange={(e) => setNuevaMateria({ ...nuevaMateria, anio: parseInt(e.target.value) })}

                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"

                        >

                            {[1, 2, 3, 4, 5].map(a => <option key={a} value={a}>Año {a}</option>)}

                        </select>

                        <select

                            value={nuevaMateria.cuatrimestre}

                            onChange={(e) => setNuevaMateria({ ...nuevaMateria, cuatrimestre: parseInt(e.target.value) })}

                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"

                        >

                            <option value={1}>1er Cuatrimestre</option>

                            <option value={2}>2do Cuatrimestre</option>

                        </select>

                        <select

                            value={nuevaMateria.estado}

                            onChange={(e) => setNuevaMateria({ ...nuevaMateria, estado: e.target.value })}

                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"

                        >

                            {Object.values(ESTADOS).map(e => <option key={e} value={e}>{e}</option>)}

                        </select>

                    </div>

                    <div className="mb-3">

                        <label className="block text-sm font-medium text-gray-700 mb-2">

                            Correlativas

                        </label>

                        <div className="border rounded-lg p-2 max-h-32 overflow-y-auto">

                            {materias.length === 0 ? (

                                <p className="text-gray-500 text-sm">No hay materias disponibles</p>

                            ) : (

                                materias.map(m => (

                                    <label key={m.id} className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm">

                                        <input

                                            type="checkbox"

                                            checked={nuevaMateria.correlativas.includes(m.id)}

                                            onChange={(e) => {

                                                if (e.target.checked) {

                                                    setNuevaMateria({

                                                        ...nuevaMateria,

                                                        correlativas: [...nuevaMateria.correlativas, m.id]

                                                    });

                                                } else {

                                                    setNuevaMateria({

                                                        ...nuevaMateria,

                                                        correlativas: nuevaMateria.correlativas.filter(c => c !== m.id)

                                                    });

                                                }

                                            }}

                                            className="rounded"

                                        />

                                        <span>{m.nombre} ({m.anio}° - C{m.cuatrimestre})</span>

                                    </label>

                                ))

                            )}

                        </div>

                    </div>

                    <div className="flex gap-2">

                        <button

                            onClick={agregarMateria}

                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition text-sm"

                        >

                            <Save size={16} />

                            Guardar

                        </button>

                        <button

                            onClick={() => {

                                setMostrandoFormulario(false);

                                setNuevaMateria({

                                    nombre: '',

                                    anio: 1,

                                    cuatrimestre: 1,

                                    estado: ESTADOS.NO_CURSADA,

                                    correlativas: []

                                });

                            }}

                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-400 transition text-sm"

                        >

                            <X size={16} />

                            Cancelar

                        </button>

                    </div>

                </div>

            )}



            {/* Grid compacto con todos los años visibles */}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

                {[1, 2, 3, 4, 5].map(anio => {

                    const materiasCuatri1 = materias.filter(m => m.anio === anio && m.cuatrimestre === 1);

                    const materiasCuatri2 = materias.filter(m => m.anio === anio && m.cuatrimestre === 2);



                    return (

                        <div key={anio} className="bg-white rounded-lg shadow-lg p-3">

                            <h2 className="text-lg font-bold text-gray-800 mb-2 text-center border-b pb-2">

                                {anio}° Año

                            </h2>



                            <div className="space-y-3">

                                <div>

                                    <h3 className="text-xs font-semibold text-gray-600 mb-2">1er Cuatrimestre</h3>

                                    <div className="space-y-1.5">

                                        {materiasCuatri1.length === 0 ? (

                                            <p className="text-gray-400 text-xs">Sin materias</p>

                                        ) : (

                                            materiasCuatri1.map(materia => (

                                                <MateriaCard

                                                    key={materia.id}

                                                    materia={materia}

                                                    materias={materias}

                                                    puedeCursar={puedeCursar}

                                                    onActualizar={actualizarMateria}

                                                    onEliminar={eliminarMateria}

                                                    agregarNotaParcial={agregarNotaParcial}

                                                    calcularPromedioMateria={calcularPromedioMateria}

                                                />

                                            ))

                                        )}

                                    </div>

                                </div>



                                <div>

                                    <h3 className="text-xs font-semibold text-gray-600 mb-2">2do Cuatrimestre</h3>

                                    <div className="space-y-1.5">

                                        {materiasCuatri2.length === 0 ? (

                                            <p className="text-gray-400 text-xs">Sin materias</p>

                                        ) : (

                                            materiasCuatri2.map(materia => (

                                                <MateriaCard

                                                    key={materia.id}

                                                    materia={materia}

                                                    materias={materias}

                                                    puedeCursar={puedeCursar}

                                                    onActualizar={actualizarMateria}

                                                    onEliminar={eliminarMateria}

                                                    agregarNotaParcial={agregarNotaParcial}

                                                    calcularPromedioMateria={calcularPromedioMateria}

                                                />

                                            ))

                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                    );

                })}

            </div>



            {materias.length === 0 && !mostrandoFormulario && (

                <div className="bg-white rounded-lg shadow-lg p-8 text-center">

                    <p className="text-gray-500 mb-2">No hay materias cargadas</p>

                    <p className="text-gray-400 text-sm">Comienza agregando las materias de tu carrera</p>

                </div>

            )}

        </>

    );

}



// 🆕 COMPONENTE VISTA PLANIFICACIÓN

function VistaPlanificacion({

    materias,

    recordatorios,

    metas,

    agregarRecordatorio,

    eliminarRecordatorio,

    toggleRecordatorioCompletado,

    agregarMeta,

    toggleMetaCompletada

}) {

    const [nuevoRecordatorio, setNuevoRecordatorio] = useState({

        titulo: '',

        tipo: TIPOS_RECORDATORIO.PARCIAL,

        fecha: '',

        materiaId: '',

        descripcion: ''

    });

    const [nuevaMeta, setNuevaMeta] = useState({

        titulo: '',

        fechaLimite: '',

        tipo: 'semanal'

    });

    const [mostrarFormRecordatorio, setMostrarFormRecordatorio] = useState(false);

    const [mostrarFormMeta, setMostrarFormMeta] = useState(false);



    const handleAgregarRecordatorio = () => {

        if (nuevoRecordatorio.titulo && nuevoRecordatorio.fecha) {

            agregarRecordatorio(nuevoRecordatorio);

            setNuevoRecordatorio({

                titulo: '',

                tipo: TIPOS_RECORDATORIO.PARCIAL,

                fecha: '',

                materiaId: '',

                descripcion: ''

            });

            setMostrarFormRecordatorio(false);

        }

    };



    const handleAgregarMeta = () => {

        if (nuevaMeta.titulo) {

            agregarMeta(nuevaMeta);

            setNuevaMeta({

                titulo: '',

                fechaLimite: '',

                tipo: 'semanal'

            });

            setMostrarFormMeta(false);

        }

    };



    const recordatoriosPendientes = recordatorios.filter(r => !r.completado);

    const recordatoriosCompletados = recordatorios.filter(r => r.completado);

    const metasPendientes = metas.filter(m => !m.completada);

    const metasCompletadas = metas.filter(m => m.completada);



    return (

        <div className="space-y-6">

            {/* Recordatorios */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <div className="flex justify-between items-center mb-4">

                    <h3 className="text-lg font-bold flex items-center gap-2">

                        <Bell className="text-blue-600" />

                        Recordatorios

                    </h3>

                    <button

                        onClick={() => setMostrarFormRecordatorio(!mostrarFormRecordatorio)}

                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition"

                    >

                        + Nuevo

                    </button>

                </div>



                {mostrarFormRecordatorio && (

                    <div className="bg-blue-50 p-3 rounded-lg mb-4">

                        <h4 className="font-medium mb-2">Nuevo Recordatorio</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">

                            <input

                                type="text"

                                placeholder="Título"

                                value={nuevoRecordatorio.titulo}

                                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, titulo: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            />

                            <select

                                value={nuevoRecordatorio.tipo}

                                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, tipo: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            >

                                {Object.values(TIPOS_RECORDATORIO).map(tipo => (

                                    <option key={tipo} value={tipo}>{tipo}</option>

                                ))}

                            </select>

                            <input

                                type="date"

                                value={nuevoRecordatorio.fecha}

                                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, fecha: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            />

                            <select

                                value={nuevoRecordatorio.materiaId}

                                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, materiaId: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            >

                                <option value="">Sin materia</option>

                                {materias.map(m => (

                                    <option key={m.id} value={m.id}>

                                        {m.nombre} ({m.anio}° - C{m.cuatrimestre}) - {m.estado}

                                    </option>

                                ))}

                            </select>

                        </div>

                        <textarea

                            placeholder="Descripción"

                            value={nuevoRecordatorio.descripcion}

                            onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, descripcion: e.target.value })}

                            className="border rounded px-2 py-1 text-sm w-full mb-2"

                            rows="2"

                        />

                        <div className="flex gap-2">

                            <button

                                onClick={handleAgregarRecordatorio}

                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"

                            >

                                Guardar

                            </button>

                            <button

                                onClick={() => setMostrarFormRecordatorio(false)}

                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"

                            >

                                Cancelar

                            </button>

                        </div>

                    </div>

                )}



                <div className="space-y-2">

                    {recordatoriosPendientes.length === 0 ? (

                        <p className="text-gray-500 text-sm">No hay recordatorios pendientes</p>

                    ) : (

                        recordatoriosPendientes.map(recordatorio => {

                            const materia = materias.find(m => m.id === recordatorio.materiaId);

                            return (

                                <div key={recordatorio.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">

                                    <div className="flex items-center gap-2">

                                        <input

                                            type="checkbox"

                                            checked={recordatorio.completado}

                                            onChange={(e) => toggleRecordatorioCompletado(recordatorio.id, e.target.checked)}

                                            className="rounded"

                                        />

                                        <div>

                                            <div className="font-medium text-sm">{recordatorio.titulo}</div>

                                            <div className="text-xs text-gray-600">

                                                {materia && `${materia.nombre} • `}{recordatorio.tipo} • {new Date(recordatorio.fecha).toLocaleDateString()}

                                            </div>

                                        </div>

                                    </div>

                                    <button

                                        onClick={() => eliminarRecordatorio(recordatorio.id)}

                                        className="text-red-500 hover:text-red-700"

                                    >

                                        <Trash2 size={14} />

                                    </button>

                                </div>

                            );

                        })

                    )}

                </div>

            </div>



            {/* Metas */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <div className="flex justify-between items-center mb-4">

                    <h3 className="text-lg font-bold flex items-center gap-2">

                        <Target className="text-green-600" />

                        Metas de Estudio

                    </h3>

                    <button

                        onClick={() => setMostrarFormMeta(!mostrarFormMeta)}

                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"

                    >

                        + Nueva Meta

                    </button>

                </div>



                {mostrarFormMeta && (

                    <div className="bg-green-50 p-3 rounded-lg mb-4">

                        <h4 className="font-medium mb-2">Nueva Meta</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">

                            <input

                                type="text"

                                placeholder="Título de la meta"

                                value={nuevaMeta.titulo}

                                onChange={(e) => setNuevaMeta({ ...nuevaMeta, titulo: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            />

                            <input

                                type="date"

                                value={nuevaMeta.fechaLimite}

                                onChange={(e) => setNuevaMeta({ ...nuevaMeta, fechaLimite: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            />

                        </div>

                        <div className="flex gap-2">

                            <button

                                onClick={handleAgregarMeta}

                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"

                            >

                                Guardar

                            </button>

                            <button

                                onClick={() => setMostrarFormMeta(false)}

                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"

                            >

                                Cancelar

                            </button>

                        </div>

                    </div>

                )}



                <div className="space-y-2">

                    {metasPendientes.length === 0 ? (

                        <p className="text-gray-500 text-sm">No hay metas establecidas</p>

                    ) : (

                        metasPendientes.map(meta => (

                            <div key={meta.id} className="flex items-center justify-between p-2 bg-green-50 rounded">

                                <div className="flex items-center gap-2">

                                    <input

                                        type="checkbox"

                                        checked={meta.completada}

                                        onChange={(e) => toggleMetaCompletada(meta.id, e.target.checked)}

                                        className="rounded"

                                    />

                                    <div>

                                        <div className="font-medium text-sm">{meta.titulo}</div>

                                        {meta.fechaLimite && (

                                            <div className="text-xs text-gray-600">

                                                Vence: {new Date(meta.fechaLimite).toLocaleDateString()}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>



            {/* Calendario de Estudio Sugerido */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                    <Clock3 className="text-purple-600" />

                    Plan de Estudio Semanal

                </h3>

                <div className="grid grid-cols-7 gap-1 text-xs">

                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (

                        <div key={dia} className="text-center font-medium text-gray-600 py-1">

                            {dia}

                        </div>

                    ))}

                    {Array.from({ length: 7 }, (_, i) => (

                        <div key={i} className="bg-gray-50 rounded p-1 min-h-16">

                            <div className="text-xs text-gray-500 mb-1">{i + 1}</div>

                            {/* Aquí irían las sesiones de estudio programadas */}

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}



// 🆕 COMPONENTE VISTA ESTADÍSTICAS (completo)

function VistaEstadisticas({ stats, materias }) {

    const materiasPorAño = [1, 2, 3, 4, 5].map(anio => {

        const materiasDelAño = materias.filter(m => m.anio === anio);

        const completadas = materiasDelAño.filter(m =>

            m.estado === ESTADOS.PROMOCION || m.estado === ESTADOS.REGULAR

        ).length;



        return {

            anio,

            total: materiasDelAño.length,

            completadas,

            porcentaje: materiasDelAño.length > 0 ? (completadas / materiasDelAño.length * 100).toFixed(1) : 0

        };

    });

    // Calcular estadísticas de parciales

    const estadisticasParciales = () => {

        const materiasConParciales = materias.filter(m => m.notasParciales && m.notasParciales.length > 0);

        const totalParciales = materias.reduce((acc, m) => acc + (m.notasParciales?.length || 0), 0);

        const aprobados = materias.reduce((acc, m) =>

            acc + (m.notasParciales?.filter(n => n.nota >= 6).length || 0), 0

        );



        return {

            totalParciales,

            aprobados,

            porcentajeAprobados: totalParciales > 0 ? ((aprobados / totalParciales) * 100).toFixed(1) : 0,

            materiasConParciales: materiasConParciales.length

        };

    };

    const mejoresNotas = materias

        .filter(m => m.notaFinal !== null && m.notaFinal !== undefined)

        .sort((a, b) => b.notaFinal - a.notaFinal)

        .slice(0, 5);



    const materiasEnRiesgo = materias.filter(m =>

        m.estado === ESTADOS.CURSANDO &&

        m.notasParciales &&

        m.notasParciales.some(n => n.nota < 6)

    );



    return (

        <div className="space-y-4">

            {/* Resumen general */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                    <Award className="text-indigo-600" />

                    Resumen General

                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="text-center">

                        <div className="text-2xl font-bold text-indigo-600">{stats.porcentajeCompletado}%</div>

                        <div className="text-sm text-gray-600">Carrera Completada</div>

                    </div>

                    <div className="text-center">

                        <div className="text-2xl font-bold text-green-600">{stats.promocionadas}</div>

                        <div className="text-sm text-gray-600">Promocionadas</div>

                    </div>

                    <div className="text-center">

                        <div className="text-2xl font-bold text-blue-600">{stats.cursando}</div>

                        <div className="text-sm text-gray-600">Cursando</div>

                    </div>

                    <div className="text-center">

                        <div className="text-2xl font-bold text-purple-600">{stats.disponibles}</div>

                        <div className="text-sm text-gray-600">Disponibles</div>

                    </div>

                </div>

            </div>



            {/* Progreso por año */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                    <TrendingUp className="text-indigo-600" />

                    Progreso por Año

                </h3>

                <div className="space-y-3">

                    {materiasPorAño.map(({ anio, total, completadas, porcentaje }) => (

                        <div key={anio}>

                            <div className="flex justify-between text-sm mb-1">

                                <span className="font-medium">{anio}° Año</span>

                                <span>{completadas}/{total} ({porcentaje}%)</span>

                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">

                                <div

                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"

                                    style={{ width: `${porcentaje}%` }}

                                ></div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>



            {/* Mejores notas */}

            {mejoresNotas.length > 0 && (

                <div className="bg-white rounded-lg shadow-lg p-4">

                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                        <Star className="text-yellow-600" />

                        Mejores Calificaciones

                    </h3>

                    <div className="space-y-2">

                        {mejoresNotas.map((materia, index) => (

                            <div key={materia.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">

                                <span className="font-medium">{materia.nombre}</span>

                                <span className="text-green-600 font-bold">{materia.notaFinal}</span>

                            </div>

                        ))}

                    </div>

                </div>

            )}



            {/* Materias en riesgo */}

            {materiasEnRiesgo.length > 0 && (

                <div className="bg-white rounded-lg shadow-lg p-4">

                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                        <AlertCircle className="text-red-600" />

                        Materias que Necesitan Atención

                    </h3>

                    <div className="space-y-2">

                        {materiasEnRiesgo.map(materia => (

                            <div key={materia.id} className="flex justify-between items-center p-2 bg-red-50 rounded">

                                <span className="font-medium">{materia.nombre}</span>

                                <span className="text-red-600 font-bold">

                                    Prom: {calcularPromedioMateria(materia)}

                                </span>

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>

    );

}



// 🆕 COMPONENTE MESA EXAMEN CARD (completo)

function MesaExamenCard({ titulo, mesa, examenes, materias, onEliminar, onPromover, calcularDiasRestantes }) {

    return (

        <div className="border-2 border-indigo-200 rounded-lg p-3 bg-indigo-50">

            <h3 className="font-bold text-indigo-900 mb-2">{titulo}</h3>

            {examenes.length === 0 ? (

                <p className="text-gray-500 text-sm">Sin exámenes planificados</p>

            ) : (

                <div className="space-y-2">

                    {examenes.map(examen => {

                        const materia = materias.find(m => m.id === examen.materiaId);

                        if (!materia) return null;

                        const diasRestantes = calcularDiasRestantes(examen.fechaMesa);



                        return (

                            <div



                                key={examen.id}

                                className={`${COLORES_ESTADO[materia.estado]} border-2 rounded-lg p-3 min-h-[80px] flex flex-col justify-between`}

                            >

                                <div className="flex items-start justify-between gap-2">

                                    <div className="flex-1">

                                        <h4 className="font-semibold text-sm">{materia.nombre}</h4>

                                        <p className="text-xs opacity-75">

                                            {materia.anio}° Año - C{materia.cuatrimestre} - {materia.estado}

                                        </p>

                                        <div className="flex items-center gap-1 mt-1">



                                            <Clock size={12} />

                                            <span className={`text-xs font-medium ${diasRestantes < 0 ? 'text-gray-500' :

                                                diasRestantes < 7 ? 'text-red-600' :

                                                    diasRestantes < 30 ? 'text-orange-600' : 'text-green-600'

                                                }`}>

                                                {diasRestantes < 0 ?

                                                    `Hace ${Math.abs(diasRestantes)} días` :

                                                    diasRestantes === 0 ?

                                                        'HOY' :

                                                        `${diasRestantes} días restantes`

                                                }



                                            </span>

                                        </div>



                                    </div>



                                    <div className="flex gap-1">

                                        <button

                                            onClick={() => {

                                                const nota = prompt(`Ingresa la nota final de ${materia.nombre}:`);

                                                if (nota && !isNaN(nota)) {

                                                    onPromover(materia.id, examen.id, parseFloat(nota));

                                                }

                                            }}

                                            className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition"

                                            title="Marcar como aprobada"

                                        >

                                            <Check size={14} />

                                        </button>

                                        <button

                                            onClick={() => onEliminar(examen.id)}

                                            className="p-1.5 hover:bg-black hover:bg-opacity-10 rounded transition"

                                            title="Quitar de la mesa"

                                        >

                                            <X size={14} />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}



// 🆕 COMPONENTE VISTA MESAS EXAMENES (completo)

// ENCONTRÁ el componente VistaMesasExamenes y AGREGÁ esta función dentro:

function VistaMesasExamenes({

    materias,

    materiasParaExamen,

    planExamenes,

    agregarExamen,

    eliminarExamen,

    actualizarMateria,

    marcarComoPromovida  // ← Esta prop debe estar en las props

}) {

    const [mesaSeleccionada, setMesaSeleccionada] = useState(MESAS_EXAMENES.DICIEMBRE_1);

    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');



    const handleAgregarExamen = () => {

        if (materiaSeleccionada) {

            console.log('Agregando examen:', materiaSeleccionada, mesaSeleccionada); // Debug

            agregarExamen(materiaSeleccionada, mesaSeleccionada); // ← SIN parseInt

            setMateriaSeleccionada('');

        }

    };



    const calcularDiasRestantes = (fechaMesa) => {

        try {

            const hoy = new Date();

            const fechaExamen = new Date(fechaMesa);



            // Validar que la fecha sea válida

            if (isNaN(fechaExamen.getTime())) {

                console.error('Fecha de examen inválida:', fechaMesa);

                return -1;

            }



            // Resetear horas para comparar solo fechas

            const hoyReset = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

            const examenReset = new Date(fechaExamen.getFullYear(), fechaExamen.getMonth(), fechaExamen.getDate());



            const diferencia = examenReset.getTime() - hoyReset.getTime();

            const dias = Math.ceil(diferencia / (1000 * 3600 * 24));



            console.log('Cálculo días:', {

                fechaMesa,

                hoy: hoyReset.toISOString(),

                examen: examenReset.toISOString(),

                diferencia,

                dias

            });



            return dias;

        } catch (error) {

            console.error('Error calculando días:', error);

            return -1;

        }

    };

    const getExamenesProximos = () => {

        return planExamenes.filter(examen => {

            const dias = calcularDiasRestantes(examen.fechaMesa);

            return dias >= 0 && dias <= 30; // Exámenes en los próximos 30 días

        });

    };

    // 🆕 FUNCIÓN PARA MARCAR COMO APROBADA

    // REEMPLAZÁ esta función completa:

    const handleMarcarAprobada = (materiaId, examenId) => {

        const nota = prompt(`Ingresa la nota final (1-10):`);

        if (nota && !isNaN(nota) && nota >= 1 && nota <= 10) {

            marcarComoPromovida(materiaId, examenId, parseFloat(nota));

        } else if (nota === null) {

            return; // Usuario canceló

        } else {

            alert('Por favor ingresa una nota válida entre 1 y 10');

        }

    };



    return (

        <div className="space-y-4">

            {/* Alertas de exámenes próximos */}

            {(() => {

                const examenesProximos = getExamenesProximos();

                if (examenesProximos.length > 0) {

                    return (

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">

                            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">

                                <Bell size={16} />

                                Exámenes Próximos ({examenesProximos.length})

                            </h4>

                            <div className="space-y-2">

                                {examenesProximos.map(examen => {

                                    const materia = materias.find(m => m.id === examen.materiaId);

                                    const dias = calcularDiasRestantes(examen.fechaMesa);

                                    return (

                                        <div key={examen.id} className="flex justify-between items-center text-sm">

                                            <span className="font-medium">{materia?.nombre}</span>

                                            <div className="flex items-center gap-2">

                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${dias < 7 ? 'bg-red-100 text-red-700' :

                                                    dias < 14 ? 'bg-orange-100 text-orange-700' :

                                                        'bg-yellow-100 text-yellow-700'

                                                    }`}>

                                                    {dias === 0 ? 'HOY' :

                                                        dias === 1 ? 'MAÑANA' :

                                                            `En ${dias} días`}

                                                </span>

                                                <span className="text-orange-600">

                                                    {examen.mesa.split(' - ')[1]}

                                                </span>

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    );

                }

            })()}

            {/* Selector de materia para agregar a mesa */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                    <Plus size={18} />

                    Agregar Materia a Mesa de Examen

                </h3>



                {materiasParaExamen.length === 0 ? (

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">

                        <AlertCircle size={24} className="mx-auto text-yellow-600 mb-2" />

                        <p className="text-yellow-700 font-medium">No tienes materias disponibles para rendir</p>

                        <p className="text-yellow-600 text-sm mt-1">

                            Solo puedes agregar materias en estado: Cursando, Regular o Libre

                        </p>

                    </div>

                ) : (

                    <div className="space-y-3">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Seleccionar Materia

                                </label>

                                <select

                                    value={materiaSeleccionada}

                                    onChange={(e) => setMateriaSeleccionada(e.target.value)}

                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"

                                >

                                    <option value="">-- Elegir materia --</option>

                                    {materiasParaExamen.map(m => (

                                        <option key={m.id} value={m.id.toString()}>

                                            {m.nombre} ({m.anio}° - C{m.cuatrimestre}) - {m.estado}

                                        </option>

                                    ))}

                                </select>

                            </div>



                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Mesa de Examen

                                </label>

                                <select

                                    value={mesaSeleccionada}

                                    onChange={(e) => setMesaSeleccionada(e.target.value)}

                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"

                                >

                                    {Object.values(MESAS_EXAMENES).map(mesa => (

                                        <option key={mesa} value={mesa}>

                                            {mesa}

                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>



                        <div className="flex gap-2">

                            <button

                                onClick={handleAgregarExamen}

                                disabled={!materiaSeleccionada}

                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"

                            >

                                <Plus size={16} />

                                Agregar a Mesa

                            </button>



                            {materiaSeleccionada && (

                                <div className="flex items-center gap-2 text-sm text-gray-600">

                                    <CheckCircle size={16} className="text-green-500" />

                                    <span>Materia seleccionada: {materias.find(m => m.id.toString() === materiaSeleccionada)?.nombre}</span>

                                </div>

                            )}

                        </div>

                    </div>

                )}

                {/* Filtro de estado */}

                {materiasParaExamen.length > 0 && (

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">

                        <h4 className="text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</h4>

                        <div className="flex flex-wrap gap-2">

                            {[ESTADOS.CURSANDO, ESTADOS.REGULAR, ESTADOS.LIBRE].map(estado => (

                                <button

                                    key={estado}

                                    onClick={() => {

                                        // Implementar filtro si querés

                                    }}

                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${COLORES_ESTADO[estado]

                                        } hover:shadow-md transition-all`}

                                >

                                    {estado} ({materiasParaExamen.filter(m => m.estado === estado).length})

                                </button>

                            ))}

                        </div>

                    </div>

                )}

                {/* Resumen de mesas */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">

                    <div className="bg-white rounded-lg shadow p-3 text-center">

                        <div className="text-xl font-bold text-indigo-600">{planExamenes.length}</div>

                        <div className="text-xs text-gray-600">Total Exámenes</div>

                    </div>

                    <div className="bg-white rounded-lg shadow p-3 text-center">

                        <div className="text-xl font-bold text-green-600">

                            {planExamenes.filter(e => calcularDiasRestantes(e.fechaMesa) > 0).length}

                        </div>

                        <div className="text-xs text-gray-600">Por Rendir</div>

                    </div>

                    <div className="bg-white rounded-lg shadow p-3 text-center">

                        <div className="text-xl font-bold text-blue-600">

                            {getExamenesProximos().length}

                        </div>

                        <div className="text-xs text-gray-600">Próximos 30 días</div>

                    </div>

                    <div className="bg-white rounded-lg shadow p-3 text-center">

                        <div className="text-xl font-bold text-orange-600">

                            {planExamenes.filter(e => calcularDiasRestantes(e.fechaMesa) < 0).length}

                        </div>

                        <div className="text-xs text-gray-600">Pasados</div>

                    </div>

                </div>

            </div>{/* DEBUG - Mostrar materias disponibles (remover después) */}

            {materiasParaExamen.length > 0 && (

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">

                    <p className="text-blue-700 text-sm font-medium">

                        Materias disponibles para rendir: {materiasParaExamen.length}

                    </p>

                    <div className="text-xs text-blue-600 mt-1">

                        {materiasParaExamen.map(m => `${m.nombre} (${m.estado})`).join(', ')}

                    </div>

                </div>

            )}



            {/* Mesas de examen por período */}

            {[['Diciembre', [MESAS_EXAMENES.DICIEMBRE_1, MESAS_EXAMENES.DICIEMBRE_2]],

            ['Febrero', [MESAS_EXAMENES.FEBRERO_1, MESAS_EXAMENES.FEBRERO_2]],

            ['Junio', [MESAS_EXAMENES.JUNIO_1, MESAS_EXAMENES.JUNIO_2]]].map(([periodo, mesas]) => (

                <div key={periodo} className="bg-white rounded-lg shadow-lg p-4">

                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">

                        <Calendar className="text-indigo-600" />

                        {periodo}

                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

                        {mesas.map(mesa => (

                            <MesaExamenCard

                                key={mesa}

                                titulo={mesa.split(' - ')[1]}

                                mesa={mesa}

                                examenes={planExamenes

                                    .filter(p => p.mesa === mesa)

                                    .sort((a, b) => new Date(a.fechaMesa) - new Date(b.fechaMesa))

                                }

                                materias={materias}

                                onEliminar={eliminarExamen}

                                onPromover={handleMarcarAprobada}  // ← Usar la nueva función

                                calcularDiasRestantes={calcularDiasRestantes}

                            />

                        ))}

                    </div>

                </div>

            ))}

        </div>

    );

}



// 🎯 FUNCIÓN CALCULAR PROMEDIO MATERIA (necesaria para las estadísticas)

function calcularPromedioMateria(materia) {

    if (!materia.notasParciales || materia.notasParciales.length === 0) return null;

    const suma = materia.notasParciales.reduce((acc, curr) => acc + curr.nota, 0);

    return (suma / materia.notasParciales.length).toFixed(2);

}

// ==============================================

// 🗓️ SISTEMA DE CALENDARIO INTERACTIVO

// ==============================================



// 🎯 TIPOS DE EVENTOS ACADÉMICOS

const TIPOS_EVENTO = {

    ESTUDIO: 'Estudio',

    PARCIAL: 'Parcial',

    FINAL: 'Final',

    ENTREGA: 'Entrega',

    CLASE: 'Clase',

    RECORDATORIO: 'Recordatorio'

};



// 🎯 ESTADO DEL CALENDARIO

// REEMPLAZÁ el hook useCalendario existente por este:

const useCalendario = () => {

    const [vistaActiva, setVistaActiva] = useState('semanal');

    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

    const [eventos, setEventos] = useState([]);

    const [arrastrandoEvento, setArrastrandoEvento] = useState(null);



    // Función para agregar evento

    const agregarEvento = (nuevoEvento) => {

        setEventos(prev => [...prev, { ...nuevoEvento, id: Date.now().toString() }]);

    };



    // Función para mover evento

    const moverEvento = (eventoId, nuevaFecha, nuevaHora) => {

        setEventos(prev => prev.map(evento => {

            if (evento.id === eventoId) {

                const fechaActualizada = new Date(nuevaFecha);

                fechaActualizada.setHours(nuevaHora, 0, 0, 0);



                return {

                    ...evento,

                    fecha: fechaActualizada.toISOString()

                };

            }

            return evento;

        }));

    };



    // Función para eliminar evento

    const eliminarEvento = (eventoId) => {

        setEventos(prev => prev.filter(evento => evento.id !== eventoId));

    };



    return {

        vistaActiva, setVistaActiva,

        fechaSeleccionada, setFechaSeleccionada,

        eventos, setEventos,

        arrastrandoEvento, setArrastrandoEvento,

        agregarEvento,

        moverEvento,

        eliminarEvento

    };

};



// 🆕 COMPONENTE CALENDARIO PRINCIPAL

// REEMPLAZÁ el componente CalendarioPrincipal por este:

function CalendarioPrincipal({ materias, recordatorios, metas, planExamenes }) {

    const calendario = useCalendario();

    function PanelParcialesRapidos({ materias, onAgregarEvento }) {

        const [mostrarForm, setMostrarForm] = useState(false);

        const [parcialSeleccionado, setParcialSeleccionado] = useState({

            materiaId: '',

            fecha: '',

            titulo: '',

            tipo: 'Parcial 1'

        });



        const materiasCursando = materias.filter(m => m.estado === ESTADOS.CURSANDO);



        const agregarParcial = () => {

            if (parcialSeleccionado.materiaId && parcialSeleccionado.fecha) {

                const materia = materias.find(m => m.id === parcialSeleccionado.materiaId);

                const evento = {

                    tipo: TIPOS_EVENTO.PARCIAL,

                    titulo: parcialSeleccionado.titulo || `${parcialSeleccionado.tipo} - ${materia.nombre}`,

                    fecha: new Date(parcialSeleccionado.fecha).toISOString(),

                    duracion: 3,

                    materiaId: parcialSeleccionado.materiaId,

                    esParcial: true,

                    tipoParcial: parcialSeleccionado.tipo

                };



                onAgregarEvento(evento);

                setParcialSeleccionado({ materiaId: '', fecha: '', titulo: '', tipo: 'Parcial 1' });

                setMostrarForm(false);

            }

        };

        // Función para agregar sesiones de estudio previo a parciales

        const agregarSesionesEstudioParcial = (parcialEvento) => {

            const sesiones = [];

            const fechaParcial = new Date(parcialEvento.fecha);



            // Sesión 1 semana antes

            const sesion1 = new Date(fechaParcial);

            sesion1.setDate(sesion1.getDate() - 7);

            sesiones.push({

                tipo: TIPOS_EVENTO.ESTUDIO,

                titulo: `Repaso: ${parcialEvento.titulo}`,

                fecha: sesion1.toISOString(),

                duracion: 2,

                materiaId: parcialEvento.materiaId,

                esRepaso: true

            });



            // Sesión 1 día antes

            const sesion2 = new Date(fechaParcial);

            sesion2.setDate(sesion2.getDate() - 1);

            sesiones.push({

                tipo: TIPOS_EVENTO.ESTUDIO,

                titulo: `Último repaso: ${parcialEvento.titulo}`,

                fecha: sesion2.toISOString(),

                duracion: 1.5,

                materiaId: parcialEvento.materiaId,

                esRepaso: true

            });



            sesiones.forEach(sesion => calendario.agregarEvento(sesion));

        };

        return (

            <div className="bg-white rounded-lg shadow-lg p-4">

                <div className="flex justify-between items-center mb-3">

                    <h3 className="text-lg font-bold flex items-center gap-2">

                        <BookOpen size={18} className="text-purple-600" />

                        Parciales Programados

                    </h3>

                    <button

                        onClick={() => setMostrarForm(!mostrarForm)}

                        className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition"

                    >

                        {mostrarForm ? 'Cancelar' : '+ Agregar Parcial'}

                    </button>

                </div>



                {mostrarForm && (

                    <div className="bg-purple-50 p-3 rounded-lg mb-3">

                        <h4 className="font-medium mb-2">Nuevo Parcial</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">

                            <select

                                value={parcialSeleccionado.materiaId}

                                onChange={(e) => setParcialSeleccionado({ ...parcialSeleccionado, materiaId: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            >

                                <option value="">Seleccionar materia</option>

                                {materiasCursando.map(m => (

                                    <option key={m.id} value={m.id}>{m.nombre}</option>

                                ))}

                            </select>



                            <select

                                value={parcialSeleccionado.tipo}

                                onChange={(e) => setParcialSeleccionado({ ...parcialSeleccionado, tipo: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            >

                                <option value="Parcial 1">Parcial 1</option>

                                <option value="Parcial 2">Parcial 2</option>

                                <option value="Recuperatorio">Recuperatorio</option>

                                <option value="TP Final">TP Final</option>

                            </select>



                            <input

                                type="date"

                                value={parcialSeleccionado.fecha}

                                onChange={(e) => setParcialSeleccionado({ ...parcialSeleccionado, fecha: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            />



                            <input

                                type="text"

                                placeholder="Título personalizado (opcional)"

                                value={parcialSeleccionado.titulo}

                                onChange={(e) => setParcialSeleccionado({ ...parcialSeleccionado, titulo: e.target.value })}

                                className="border rounded px-2 py-1 text-sm"

                            />

                        </div>

                        <button

                            onClick={agregarParcial}

                            disabled={!parcialSeleccionado.materiaId || !parcialSeleccionado.fecha}

                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:bg-gray-400"

                        >

                            Programar Parcial

                        </button>

                    </div>

                )}



                {/* Lista de parciales próximos */}

                <div className="space-y-2">

                    <h4 className="font-medium text-sm text-gray-700">Próximos Parciales</h4>

                    {materiasCursando.map(materia => (

                        <div key={materia.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">

                            <span className="font-medium text-sm">{materia.nombre}</span>

                            <div className="flex gap-1">

                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">

                                    {materia.notasParciales?.length || 0} rendidos

                                </span>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        );

    }

    // 🔄 Convertir metas y exámenes a eventos del calendario

    useEffect(() => {

        const eventosDeMetas = metas.map(meta => ({

            id: `meta-${meta.id}`,

            tipo: TIPOS_EVENTO.RECORDATORIO,

            titulo: `Meta: ${meta.titulo}`,

            fecha: meta.fechaLimite ? new Date(meta.fechaLimite).toISOString() : new Date().toISOString(),

            duracion: 1,

            completado: meta.completada,

            esMeta: true,

            metaId: meta.id

        }));

        const eventosDeExamenes = planExamenes.map(examen => {

            const materia = materias.find(m => m.id === examen.materiaId);

            // Asegurar que la fecha se parsea correctamente

            let fechaExamen;

            try {

                fechaExamen = examen.fechaMesa ? new Date(examen.fechaMesa).toISOString() : new Date().toISOString();

            } catch {

                fechaExamen = new Date().toISOString();

            }



            return {

                id: `examen-${examen.id}`,

                tipo: TIPOS_EVENTO.FINAL,

                titulo: `Examen: ${materia?.nombre || 'Materia sin nombre'}`,

                fecha: fechaExamen,

                duracion: 3,

                materiaId: examen.materiaId,

                esExamen: true,

                examenId: examen.id,

                mesa: examen.mesa // ← Agregar esta info

            };

        });



        const eventosDeRecordatorios = recordatorios.map(recordatorio => ({

            id: `recordatorio-${recordatorio.id}`,

            tipo: recordatorio.tipo,

            titulo: recordatorio.titulo,

            fecha: recordatorio.fecha,

            duracion: 1,

            materiaId: recordatorio.materiaId,

            esRecordatorio: true,

            recordatorioId: recordatorio.id

        }));



        // Combinar todos los eventos

        const eventosAutomaticos = [

            ...eventosDeMetas,

            ...eventosDeExamenes,

            ...eventosDeRecordatorios

        ];



        // Filtrar eventos que no están ya en el calendario

        const eventosExistentesIds = new Set(calendario.eventos.map(e => e.id));

        const nuevosEventos = eventosAutomaticos.filter(evento =>

            !eventosExistentesIds.has(evento.id)

        );



        if (nuevosEventos.length > 0) {

            calendario.setEventos(prev => [...prev, ...nuevosEventos]);

        }

    }, [metas, planExamenes, recordatorios, materias]);



    return (

        <div className="space-y-4">

            {/* Header del Calendario */}

            <div className="bg-white rounded-lg shadow-lg p-4">

                <div className="flex justify-between items-center mb-4">

                    <h2 className="text-xl font-bold text-gray-800">

                        Calendario Académico

                    </h2>

                    <div className="flex gap-2">

                        <button

                            onClick={() => calendario.setVistaActiva('semanal')}

                            className={`px-4 py-2 rounded-lg font-medium transition ${calendario.vistaActiva === 'semanal'

                                ? 'bg-indigo-600 text-white'

                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                                }`}

                        >

                            Semanal

                        </button>

                        <button

                            onClick={() => calendario.setVistaActiva('mensual')}

                            className={`px-4 py-2 rounded-lg font-medium transition ${calendario.vistaActiva === 'mensual'

                                ? 'bg-indigo-600 text-white'

                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                                }`}

                        >

                            Mensual

                        </button>

                    </div>

                </div>



                {/* Selector de fecha */}

                <div className="flex items-center gap-4 mb-4">

                    <button

                        onClick={() => {

                            const nuevaFecha = new Date(calendario.fechaSeleccionada);

                            nuevaFecha.setDate(nuevaFecha.getDate() - 7);

                            calendario.setFechaSeleccionada(nuevaFecha);

                        }}

                        className="p-2 hover:bg-gray-100 rounded-lg"

                    >

                        <ChevronLeft size={20} />

                    </button>



                    <h3 className="text-lg font-semibold text-gray-700 flex-1 text-center">

                        {calendario.fechaSeleccionada.toLocaleDateString('es-ES', {

                            weekday: 'long',

                            year: 'numeric',

                            month: 'long',

                            day: 'numeric'

                        })}

                    </h3>



                    <button

                        onClick={() => {

                            const nuevaFecha = new Date(calendario.fechaSeleccionada);

                            nuevaFecha.setDate(nuevaFecha.getDate() + 7);

                            calendario.setFechaSeleccionada(nuevaFecha);

                        }}

                        className="p-2 hover:bg-gray-100 rounded-lg"

                    >

                        <ChevronRight size={20} />

                    </button>

                </div>



                {/* Leyenda de colores */}

                <div className="flex flex-wrap gap-4 text-xs">

                    <div className="flex items-center gap-1">

                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>

                        <span>Estudio</span>

                    </div>

                    <div className="flex items-center gap-1">

                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>

                        <span>Exámenes</span>

                    </div>

                    <div className="flex items-center gap-1">

                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>

                        <span>Metas</span>

                    </div>

                    <div className="flex items-center gap-1">

                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>

                        <span>Recordatorios</span>

                    </div>

                </div>

            </div>



            {/* Contenido según vista */}

            {calendario.vistaActiva === 'semanal' ? (

                <VistaSemanal

                    fechaSeleccionada={calendario.fechaSeleccionada}

                    eventos={calendario.eventos}

                    materias={materias}

                    onMoverEvento={calendario.moverEvento}

                    onAgregarEvento={calendario.agregarEvento}

                    onEliminarEvento={calendario.eliminarEvento}

                />

            ) : (

                <VistaMensual

                    fechaSeleccionada={calendario.fechaSeleccionada}

                    eventos={calendario.eventos}

                />

            )}



            {/* Panel de Planificación SIMPLIFICADO */}

            <PanelPlanificacionSimplificado

                materias={materias}

                eventos={calendario.eventos}

                onAgregarEventos={(nuevosEventos) => {

                    nuevosEventos.forEach(evento => calendario.agregarEvento(evento));

                }}

            />

            <PanelParcialesRapidos

                materias={materias}

                onAgregarEvento={calendario.agregarEvento}

            />

        </div>

    );

}





function VistaSemanal({ fechaSeleccionada, eventos, materias, onMoverEvento, onAgregarEvento }) {

    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const horasDia = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 - 22:00



    // Obtener semana actual

    const getSemanaDesdeFecha = (fecha) => {

        const inicioSemana = new Date(fecha);

        const dia = inicioSemana.getDay();

        const diff = inicioSemana.getDate() - dia + (dia === 0 ? -6 : 1);

        inicioSemana.setDate(diff);



        return Array.from({ length: 7 }, (_, i) => {

            const dia = new Date(inicioSemana);

            dia.setDate(inicioSemana.getDate() + i);

            return dia;

        });

    };



    const semanaActual = getSemanaDesdeFecha(fechaSeleccionada);



    // Manejar drop de eventos

    const manejarDrop = (e, diaIndex, hora) => {

        e.preventDefault();

        const eventoId = e.dataTransfer.getData('text/plain');



        if (eventoId) {

            // Mover evento existente

            const fechaDestino = new Date(semanaActual[diaIndex]);

            fechaDestino.setHours(hora, 0, 0, 0);

            onMoverEvento(eventoId, fechaDestino, hora);

        }

    };



    // Manejar drag over

    const manejarDragOver = (e) => {

        e.preventDefault();

    };



    // Crear nuevo evento al hacer click

    const crearNuevoEvento = (diaIndex, hora) => {

        const titulo = prompt('¿Qué vas a estudiar?');

        if (titulo) {

            const fechaEvento = new Date(semanaActual[diaIndex]);

            fechaEvento.setHours(hora, 0, 0, 0);



            onAgregarEvento({

                tipo: TIPOS_EVENTO.ESTUDIO,

                titulo: titulo,

                fecha: fechaEvento.toISOString(),

                duracion: 2,

                completado: false

            });

        }

    };



    return (

        <div className="bg-white rounded-lg shadow-lg p-4">

            <div className="grid grid-cols-8 gap-1">

                {/* Header de horas */}

                <div className="p-2"></div>

                {diasSemana.map((dia, index) => (

                    <div key={dia} className="text-center font-medium text-gray-700 p-2 border-b">

                        <div>{dia}</div>

                        <div className="text-sm text-gray-500">

                            {semanaActual[index].getDate()}

                        </div>

                    </div>

                ))}



                {/* Filas de horas */}

                {horasDia.map(hora => (

                    <React.Fragment key={hora}>

                        <div className="p-2 text-sm text-gray-500 text-right border-r pr-2">

                            {hora}:00

                        </div>

                        {diasSemana.map((_, diaIndex) => (

                            <div

                                key={diaIndex}

                                className="min-h-16 border-b border-r p-1 hover:bg-gray-50 cursor-pointer transition-colors relative group"

                                onDrop={(e) => manejarDrop(e, diaIndex, hora)}

                                onDragOver={manejarDragOver}

                                onClick={() => crearNuevoEvento(diaIndex, hora)}

                            >

                                {/* Botón de agregar visible al hover */}

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                                    <div className="bg-indigo-500 text-white rounded-full p-1">

                                        <Plus size={14} />

                                    </div>

                                </div>



                                {/* Eventos para esta celda */}

                                {eventos

                                    .filter(evento => {

                                        const eventoFecha = new Date(evento.fecha);

                                        return (

                                            eventoFecha.getDate() === semanaActual[diaIndex].getDate() &&

                                            eventoFecha.getMonth() === semanaActual[diaIndex].getMonth() &&

                                            eventoFecha.getFullYear() === semanaActual[diaIndex].getFullYear() &&

                                            eventoFecha.getHours() === hora

                                        );

                                    })

                                    .map(evento => (

                                        <EventoAcademico

                                            key={evento.id}

                                            evento={evento}

                                            materias={materias}

                                            onEliminar={() => onEliminarEvento(evento.id)}

                                        />

                                    ))

                                }

                            </div>

                        ))}

                    </React.Fragment>

                ))}

            </div>

        </div>

    );

}



// 🆕 COMPONENTE EVENTO ACADÉMICO

// REEMPLAZÁ el componente EventoAcademico por este:

// REEMPLAZÁ el componente EventoAcademico por este:

function EventoAcademico({ evento, materias, onEliminar }) {

    const materia = materias.find(m => m.id === evento.materiaId);

    const [mostrarOpciones, setMostrarOpciones] = useState(false);



    // Determinar color según tipo de evento

    const getColorEvento = () => {

        if (evento.esParcial) return 'bg-purple-100 text-purple-700 border-purple-300';

        if (evento.esMeta) return 'bg-green-100 text-green-700 border-green-300';

        if (evento.esExamen) return 'bg-red-100 text-red-700 border-red-300';

        if (evento.esRecordatorio) return 'bg-yellow-100 text-yellow-700 border-yellow-300';

        if (materia) return COLORES_ESTADO[materia.estado];

        return 'bg-blue-100 text-blue-700 border-blue-300';

    };



    const getIcono = () => {

        if (evento.esMeta) return <Target size={10} />;

        if (evento.esParcial) return <Edit3 size={10} />;

        if (evento.esExamen) return <Calendar size={10} />;

        if (evento.esRecordatorio) return <Bell size={10} />;

        return <BookOpen size={10} />;

    };



    const colorEvento = getColorEvento();

    const icono = getIcono();



    return (

        <div

            className={`${colorEvento} rounded p-1 text-xs font-medium cursor-move hover:shadow-md transition-all border relative group`}

            draggable={!evento.esMeta && !evento.esExamen} // No arrastrar metas y exámenes automáticos

            onDragStart={(e) => {

                if (!evento.esMeta && !evento.esExamen) {

                    e.dataTransfer.setData('text/plain', evento.id);

                }

            }}

            onContextMenu={(e) => {

                e.preventDefault();

                setMostrarOpciones(true);

            }}

        >

            <div className="flex items-center gap-1">

                {icono}

                <div className="font-semibold truncate flex-1">

                    {materia ? materia.nombre : evento.titulo}

                </div>

            </div>

            <div className="text-xs opacity-75 truncate mt-1">

                {evento.tipo} • {evento.duracion}h

            </div>



            {/* Solo mostrar botón eliminar para eventos manuales */}

            {!evento.esMeta && !evento.esExamen && !evento.esRecordatorio && (

                <button

                    onClick={(e) => {

                        e.stopPropagation();

                        onEliminar();

                    }}

                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"

                >

                    ×

                </button>

            )}



            {/* Menú contextual */}

            {mostrarOpciones && (

                <div

                    className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-2 z-10 border"

                    onMouseLeave={() => setMostrarOpciones(false)}

                >

                    {!evento.esMeta && !evento.esExamen && !evento.esRecordatorio && (

                        <button

                            onClick={() => {

                                onEliminar();

                                setMostrarOpciones(false);

                            }}

                            className="flex items-center gap-2 text-red-600 text-sm hover:bg-red-50 p-1 rounded w-full"

                        >

                            <Trash2 size={12} />

                            Eliminar

                        </button>

                    )}

                    <div className="text-xs text-gray-500 p-1 border-t mt-1">

                        {evento.esMeta && 'Meta automática'}

                        {evento.esExamen && 'Examen automático'}

                        {evento.esRecordatorio && 'Recordatorio automático'}

                        {!evento.esMeta && !evento.esExamen && !evento.esRecordatorio && 'Evento manual'}

                    </div>

                </div>

            )}

        </div>

    );

}

// 🆕 COMPONENTE VISTA MENSUAL

// REEMPLAZÁ completamente el componente VistaMensual:

function VistaMensual({ fechaSeleccionada, eventos }) {

    const [mesActual, setMesActual] = useState(new Date());



    // Obtener días del mes

    const getDiasMes = (fecha) => {

        const año = fecha.getFullYear();

        const mes = fecha.getMonth();



        const primerDia = new Date(año, mes, 1);

        const ultimoDia = new Date(año, mes + 1, 0);

        const diasEnMes = ultimoDia.getDate();



        // Ajustar primer día de la semana (Lunes = 0)

        const primerDiaSemana = (primerDia.getDay() + 6) % 7;



        const dias = [];



        // Días del mes anterior (para completar primera semana)

        for (let i = 0; i < primerDiaSemana; i++) {

            const dia = new Date(año, mes, -i);

            dias.unshift({

                fecha: dia,

                esMesActual: false,

                eventos: []

            });

        }



        // Días del mes actual

        for (let i = 1; i <= diasEnMes; i++) {

            const dia = new Date(año, mes, i);

            const eventosDelDia = eventos.filter(evento => {

                const eventoFecha = new Date(evento.fecha);

                return (

                    eventoFecha.getDate() === dia.getDate() &&

                    eventoFecha.getMonth() === dia.getMonth() &&

                    eventoFecha.getFullYear() === dia.getFullYear()

                );

            });



            dias.push({

                fecha: dia,

                esMesActual: true,

                eventos: eventosDelDia

            });

        }



        return dias;

    };



    const diasMes = getDiasMes(mesActual);

    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const nombresMeses = [

        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',

        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'

    ];



    const cambiarMes = (incremento) => {

        const nuevoMes = new Date(mesActual);

        nuevoMes.setMonth(nuevoMes.getMonth() + incremento);

        setMesActual(nuevoMes);

    };



    const hoy = new Date();

    const esHoy = (fecha) => {

        return (

            fecha.getDate() === hoy.getDate() &&

            fecha.getMonth() === hoy.getMonth() &&

            fecha.getFullYear() === hoy.getFullYear()

        );

    };



    return (

        <div className="bg-white rounded-lg shadow-lg p-4">

            {/* Header del mes */}

            <div className="flex justify-between items-center mb-4">

                <button

                    onClick={() => cambiarMes(-1)}

                    className="p-2 hover:bg-gray-100 rounded-lg"

                >

                    <ChevronLeft size={20} />

                </button>



                <h3 className="text-xl font-bold text-gray-800">

                    {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}

                </h3>



                <button

                    onClick={() => cambiarMes(1)}

                    className="p-2 hover:bg-gray-100 rounded-lg"

                >

                    <ChevronRight size={20} />

                </button>

            </div>



            {/* Días de la semana */}

            <div className="grid grid-cols-7 gap-1 mb-2">

                {diasSemana.map(dia => (

                    <div key={dia} className="text-center font-medium text-gray-600 py-2 text-sm">

                        {dia}

                    </div>

                ))}

            </div>



            {/* Días del mes */}

            <div className="grid grid-cols-7 gap-1">

                {diasMes.map((dia, index) => (

                    <div

                        key={index}

                        className={`

                min-h-24 border rounded-lg p-2 transition-all

                ${dia.esMesActual

                                ? esHoy(dia.fecha)

                                    ? 'bg-blue-50 border-blue-300'

                                    : 'bg-white border-gray-200 hover:bg-gray-50'

                                : 'bg-gray-100 border-gray-300 text-gray-400'

                            }

                ${dia.eventos.length > 0 ? 'cursor-pointer' : ''}

                `}

                    >

                        {/* Número del día */}

                        <div className={`

                text-sm font-medium mb-1

                ${esHoy(dia.fecha) ? 'text-blue-600' : ''}

                ${!dia.esMesActual ? 'text-gray-400' : ''}

                `}>

                            {dia.fecha.getDate()}

                        </div>



                        {/* Eventos del día */}

                        <div className="space-y-1 max-h-20 overflow-y-auto">

                            {dia.eventos.slice(0, 3).map((evento, eventIndex) => (

                                <div

                                    key={eventIndex}

                                    className={`

                        text-xs p-1 rounded truncate border

                        ${evento.esExamen

                                            ? 'bg-red-100 text-red-700 border-red-300'

                                            : evento.esMeta

                                                ? 'bg-green-100 text-green-700 border-green-300'

                                                : evento.esRecordatorio

                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'

                                                    : 'bg-blue-100 text-blue-700 border-blue-300'

                                        }

                    `}

                                    title={evento.titulo}

                                >

                                    {evento.titulo}

                                </div>

                            ))}



                            {dia.eventos.length > 3 && (

                                <div className="text-xs text-gray-500 text-center">

                                    +{dia.eventos.length - 3} más

                                </div>

                            )}

                        </div>

                    </div>

                ))}

            </div>



            {/* Leyenda */}

            <div className="mt-4 flex flex-wrap gap-3 text-xs justify-center">

                <div className="flex items-center gap-1">

                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>

                    <span>Estudio/Clase</span>

                </div>

                <div className="flex items-center gap-1">

                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>

                    <span>Exámenes</span>

                </div>

                <div className="flex items-center gap-1">

                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>

                    <span>Metas</span>

                </div>

                <div className="flex items-center gap-1">

                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>

                    <span>Recordatorios</span>

                </div>

            </div>

        </div>

    );

}



// 🆕 COMPONENTE PANEL PLANIFICACIÓN

// REEMPLAZÁ el PanelPlanificacion por este MÁS SIMPLE:

function PanelPlanificacionSimplificado({ materias, eventos, onAgregarEventos }) {

    const materiasCursando = materias.filter(m =>

        m.estado === ESTADOS.CURSANDO || m.estado === ESTADOS.NO_CURSADA

    );



    const agregarSesionRapida = (materiaId) => {

        const materia = materias.find(m => m.id === materiaId);

        const ahora = new Date();

        // Poner para mañana a las 10:00

        ahora.setDate(ahora.getDate() + 1);

        ahora.setHours(10, 0, 0, 0);



        const nuevaSesion = {

            tipo: TIPOS_EVENTO.ESTUDIO,

            titulo: `Estudio: ${materia.nombre}`,

            fecha: ahora.toISOString(),

            duracion: 2,

            materiaId: materiaId,

            completado: false

        };



        onAgregarEventos([nuevaSesion]);

    };



    return (

        <div className="bg-white rounded-lg shadow-lg p-4">

            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">

                <Plus className="text-indigo-600" />

                Sesiones Rápidas

            </h3>



            <div className="mb-4">

                <p className="text-sm text-gray-600 mb-2">

                    Agregá sesiones de estudio rápido para tus materias:

                </p>

                <div className="flex flex-wrap gap-2">

                    {materiasCursando.map(materia => (

                        <button

                            key={materia.id}

                            onClick={() => agregarSesionRapida(materia.id)}

                            className={`${COLORES_ESTADO[materia.estado]} px-3 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all border`}

                        >

                            + {materia.nombre}

                        </button>

                    ))}

                </div>

            </div>



            {/* Resumen */}

            <div className="bg-indigo-50 rounded-lg p-3">

                <h4 className="font-medium text-indigo-800 mb-2">

                    Resumen del Calendario

                </h4>

                <div className="text-sm text-indigo-700 space-y-1">

                    <div>• <strong>{eventos.filter(e => e.tipo === TIPOS_EVENTO.ESTUDIO).length}</strong> sesiones de estudio</div>

                    <div>• <strong>{eventos.filter(e => e.esExamen).length}</strong> exámenes programados</div>

                    <div>• <strong>{eventos.filter(e => e.esMeta).length}</strong> metas con fecha límite</div>

                    <div>• <strong>{eventos.filter(e => e.esRecordatorio).length}</strong> recordatorios</div>

                </div>

            </div>

        </div>

    );

}