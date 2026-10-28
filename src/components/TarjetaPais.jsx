function TarjetaPais({ pais, onAbrir }) {
  const tieneBandera = Boolean(pais.bandera_url)

  return (
    <article className="tarjeta-pais">
      <button
        type="button"
        className="boton-tarjeta-pais"
        onClick={() => onAbrir(pais.codigo)}
        aria-label={`Abrir detalles de ${pais.nombre_comun}`}
      >
        {tieneBandera ? (
          <img
            src={pais.bandera_url}
            alt={pais.bandera_alt || `Bandera de ${pais.nombre_comun}`}
            className="bandera-tarjeta"
          />
        ) : (
          <span
            className="bandera-tarjeta bandera-placeholder"
            role="img"
            aria-label={`Sin bandera disponible para ${pais.nombre_comun}`}
          >
            🌐
          </span>
        )}

        <span
          className="nombre-pais"
          role="heading"
          aria-level="2"
        >
          {pais.nombre_comun}
        </span>
        <span className="region-pais">
          {pais.region || 'Región no disponible'}
        </span>
      </button>
    </article>
  )
}

export default TarjetaPais
