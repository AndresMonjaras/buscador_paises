import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import AccesoGoogle from './components/AccesoGoogle.jsx'
import { ExploradorPaises } from './pages/ExploradorPaises.jsx'
import './styles/paises.css'

function PantallaPrincipal() {
  const { usuario, cargando, error, cerrarSesion } = useAuth()

  if (cargando) {
    return (
      <main className="pantalla-estado" aria-live="polite">
        <p>Verificando tu sesión...</p>
      </main>
    )
  }

  if (!usuario) {
    return <AccesoGoogle />
  }

  const nombreUsuario =
    usuario.user_metadata?.full_name ?? usuario.email ?? 'Usuario'

  return (
    <div className="app-autenticada">
      <header className="barra-sesion">
        <p>Sesión de {nombreUsuario}</p>
        <button
          className="boton-sesion"
          type="button"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </header>

      {error && (
        <p className="mensaje-error mensaje-error-sesion" role="alert">
          {error}
        </p>
      )}

      <ExploradorPaises />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <PantallaPrincipal />
    </AuthProvider>
  )
}

export default App
