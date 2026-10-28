import { useCallback, useEffect, useState } from 'react'

import TarjetaPais from '../components/TarjetaPais.jsx'
import PanelDetallePais from '../components/PanelDetallePais.jsx'
import { buscarPaises } from '../services/paisesService.js'

const REGIONES = [
  { etiqueta: 'Todas', valor: 'Todas' },
  { etiqueta: 'África', valor: 'Africa' },
  { etiqueta: 'América', valor: 'Americas' },
  { etiqueta: 'Asia', valor: 'Asia' },
  { etiqueta: 'Europa', valor: 'Europe' },
  { etiqueta: 'Oceanía', valor: 'Oceania' },
  { etiqueta: 'Antártida', valor: 'Antarctic' },
]

const LIMITE = 24

export function ExploradorPaises() {
  const [texto, setTexto] = useState('')
  const [region, setRegion] = useState('Todas')
  const [pagina, setPagina] = useState(1)
  const [paises, setPaises] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [codigoDetalle, setCodigoDetalle] = useState(null)
  const [reintentos, setReintentos] = useState(0)
  const [textoBusqueda, setTextoBusqueda] = useState('')

  const cerrarDetalle = useCallback(() => {
    setCodigoDetalle(null)
  }, [])

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setTextoBusqueda(texto)
    }, 250)

    return () => {
      clearTimeout(temporizador)
    }
  }, [texto])

  useEffect(() => {
    if (texto !== textoBusqueda) {
      setCargando(true)
      setError(null)
      return undefined
    }

    let activo = true

    async function cargar() {
      setCargando(true)
      setError(null)

      try {
        const regionSeleccionada =
          region === 'Todas' ? null : region

        const resultado = await buscarPaises({
          texto: textoBusqueda,
          region: regionSeleccionada,
          pagina,
          limite: LIMITE,
        })

        if (!activo) {
          return
        }

        setPaises(resultado.paises)
        setTotal(resultado.total)
      } catch (errorConsulta) {
        if (!activo) {
          return
        }

        setError(
          errorConsulta?.message ??
            'No se pudo cargar el catálogo de países.'
        )
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [texto, textoBusqueda, region, pagina, reintentos])

  function manejarTexto(evento) {
    setTexto(evento.target.value)
    setPagina(1)
  }

  function manejarRegion(evento) {
    setRegion(evento.target.value)
    setPagina(1)

    if (texto.trim() === '') {
      setTextoBusqueda('')
    }
  }

  function reintentar() {
    setReintentos((valor) => valor + 1)
  }

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE))

  return (
    <main className="explorador">
      <header className="encabezado-explorador">
        <p className="ceja-acceso">ATLAS / BUSCADOR DE PAÍSES</p>
        <h1>Explorador de países</h1>
        <p className="texto-acceso">
          Filtra por nombre o región y abre la ficha de cualquier país.
        </p>
      </header>

      <section
        className="barra-filtros"
        aria-label="Filtros de búsqueda"
      >
        <input
          type="search"
          placeholder="Buscar por nombre común u oficial"
          value={texto}
          onChange={manejarTexto}
          aria-label="Buscar países"
        />

        <select
          value={region}
          onChange={manejarRegion}
          aria-label="Filtrar por región"
        >
          {REGIONES.map((regionActual) => (
            <option key={regionActual.valor} value={regionActual.valor}>
              {regionActual.etiqueta}
            </option>
          ))}
        </select>
      </section>

      {cargando && (
        <p className="pantalla-estado" role="status">
          Cargando países...
        </p>
      )}

      {!cargando && error && (
        <section className="pantalla-estado" role="alert">
          <p>{error}</p>
          <button type="button" onClick={reintentar}>
            Reintentar
          </button>
        </section>
      )}

      {!cargando && !error && paises.length === 0 && (
        <p className="pantalla-estado" role="status">
          No se encontraron países con esos filtros.
        </p>
      )}

      {!cargando && !error && paises.length > 0 && (
        <>
          <section className="rejilla-paises" aria-label="Catálogo de países">
            {paises.map((pais) => (
              <TarjetaPais
                key={pais.codigo}
                pais={pais}
                onAbrir={setCodigoDetalle}
              />
            ))}
          </section>

          <nav className="paginacion" aria-label="Paginación">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina <= 1}
            >
              Anterior
            </button>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() =>
                setPagina((p) =>
                  Math.min(totalPaginas, p + 1)
                )
              }
              disabled={pagina >= totalPaginas}
            >
              Siguiente
            </button>
          </nav>
        </>
      )}

      {codigoDetalle && (
        <PanelDetallePais
          codigo={codigoDetalle}
          onCerrar={cerrarDetalle}
        />
      )}
    </main>
  )
}
