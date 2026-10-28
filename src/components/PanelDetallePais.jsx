import { useEffect, useRef, useState } from 'react'

import { obtenerPaisPorCodigo } from '../services/paisesService.js'

function PanelDetallePais({ codigo, onCerrar }) {
  const [pais, setPais] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const botonCerrarRef = useRef(null)
  const elementoPrevioRef = useRef(null)

  useEffect(() => {
    let activo = true

    async function cargar() {
      setCargando(true)
      setError(null)

      try {
        const resultado = await obtenerPaisPorCodigo(codigo)

        if (!activo) {
          return
        }

        setPais(resultado)
      } catch (errorConsulta) {
        if (!activo) {
          return
        }

        setError(
          errorConsulta?.message ??
            'No se pudo cargar el detalle del país.'
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
  }, [codigo])

  useEffect(() => {
    elementoPrevioRef.current = document.activeElement
    botonCerrarRef.current?.focus()

    function manejarEscape(evento) {
      if (evento.key === 'Escape') {
        onCerrar()
      }
    }

    document.addEventListener('keydown', manejarEscape)

    return () => {
      document.removeEventListener('keydown', manejarEscape)
      elementoPrevioRef.current?.focus()
    }
  }, [onCerrar])

  function manejarTeclado(evento) {
    if (evento.key !== 'Tab') {
      return
    }

    const selectorControles = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const controles = Array.from(
      evento.currentTarget.querySelectorAll(selectorControles)
    )

    if (controles.length === 0) {
      return
    }

    const primero = controles[0]
    const ultimo = controles[controles.length - 1]

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero.focus()
    }
  }

  return (
    <div
      className="fondo-panel"
      role="presentation"
      onClick={onCerrar}
    >
      <section
        className="panel-detalle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle"
        onClick={(evento) => evento.stopPropagation()}
        onKeyDown={manejarTeclado}
      >
        <header className="encabezado-panel">
          <h2 id="titulo-detalle">Detalle del país</h2>
          <button
            type="button"
            ref={botonCerrarRef}
            onClick={onCerrar}
            aria-label="Cerrar detalle"
          >
            Cerrar
          </button>
        </header>

        {cargando && <p role="status">Cargando detalle...</p>}

        {!cargando && error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        {!cargando && !error && !pais && (
          <p role="status">País no encontrado.</p>
        )}

        {!cargando && !error && pais && (
          <div className="detalle-contenido">
            {pais.bandera_url ? (
              <img
                src={pais.bandera_url}
                alt={pais.bandera_alt || `Bandera de ${pais.nombre_comun}`}
                className="bandera-detalle"
              />
            ) : (
              <div
                className="bandera-detalle bandera-placeholder"
                role="img"
                aria-label={`Sin bandera disponible para ${pais.nombre_comun}`}
              >
                🌐
              </div>
            )}

            <dl className="lista-detalle">
              <dt>Nombre común</dt>
              <dd>{pais.nombre_comun}</dd>

              <dt>Nombre oficial</dt>
              <dd>{pais.nombre_oficial || 'No disponible'}</dd>

              <dt>Región</dt>
              <dd>{pais.region || 'No disponible'}</dd>

              <dt>Subregión</dt>
              <dd>{pais.subregion || 'No disponible'}</dd>

              <dt>Capital</dt>
              <dd>{pais.capital || 'No disponible'}</dd>

              <dt>Población</dt>
              <dd>
                {typeof pais.poblacion === 'number'
                  ? pais.poblacion.toLocaleString('es-MX')
                  : 'No disponible'}
              </dd>
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}

export default PanelDetallePais
