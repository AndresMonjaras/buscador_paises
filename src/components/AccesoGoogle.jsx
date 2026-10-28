import { useAuth } from '../auth/AuthContext.jsx'

function AccesoGoogle() {
  const {
    error,
    configuracionValida,
    iniciarSesionConGoogle,
  } = useAuth()

  return (
    <main className="pantalla-acceso">
      <section className="tarjeta-acceso" aria-labelledby="titulo-acceso">
        <p className="ceja-acceso">ATLAS / BUSCADOR DE PAÍSES</p>
        <h1 id="titulo-acceso">El mundo, a una búsqueda de distancia.</h1>
        <p className="texto-acceso">
          Inicia sesión para explorar países, regiones y banderas desde un
          catálogo organizado.
        </p>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="boton-google"
          type="button"
          onClick={iniciarSesionConGoogle}
          disabled={!configuracionValida}
        >
          Continuar con Google
        </button>

        <p className="nota-acceso">
          El acceso protege el catálogo y sus datos almacenados.
        </p>
      </section>
    </main>
  )
}

export default AccesoGoogle
