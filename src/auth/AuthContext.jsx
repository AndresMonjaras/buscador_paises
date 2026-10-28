import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  cerrarSesion as cerrarSesionServicio,
  iniciarSesionConGoogle as iniciarSesionServicio,
  obtenerErrorOAuth,
  obtenerSesion,
  observarSesion,
} from './authService.js'
import {
  errorConfiguracionSupabase,
  supabase,
} from '../config/supabaseClient.js'

const AuthContext = createContext(null)

function obtenerMensajeError(error) {
  return error?.message ?? 'Ocurrió un error de autenticación.'
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const errorOAuth = obtenerErrorOAuth()

    if (errorOAuth) {
      setError(errorOAuth)
    }

    if (!supabase) {
      setError(errorConfiguracionSupabase)
      setCargando(false)
      return undefined
    }

    let componenteActivo = true
    let suscripcion

    try {
      suscripcion = observarSesion((sesion) => {
        if (!componenteActivo) {
          return
        }

        setUsuario(sesion?.user ?? null)

        if (sesion) {
          setError(null)
        }
      })
    } catch (errorSesion) {
      setError(obtenerMensajeError(errorSesion))
      setCargando(false)

      return () => {
        componenteActivo = false
      }
    }

    async function restaurarSesion() {
      try {
        const { data, error: errorConsulta } = await obtenerSesion()

        if (errorConsulta) {
          throw errorConsulta
        }

        if (componenteActivo) {
          setUsuario(data.session?.user ?? null)
        }
      } catch (errorSesion) {
        if (componenteActivo) {
          setError(obtenerMensajeError(errorSesion))
        }
      } finally {
        if (componenteActivo) {
          setCargando(false)
        }
      }
    }

    restaurarSesion()

    return () => {
      componenteActivo = false
      suscripcion?.unsubscribe()
    }
  }, [])

  async function iniciarSesionConGoogle() {
    setError(null)

    try {
      const { error: errorInicio } = await iniciarSesionServicio()

      if (errorInicio) {
        setError(obtenerMensajeError(errorInicio))
      }
    } catch (errorInicio) {
      setError(obtenerMensajeError(errorInicio))
    }
  }

  async function cerrarSesion() {
    setError(null)

    try {
      const { error: errorCierre } = await cerrarSesionServicio()

      if (errorCierre) {
        setError(obtenerMensajeError(errorCierre))
      } else {
        setUsuario(null)
      }
    } catch (errorCierre) {
      setError(obtenerMensajeError(errorCierre))
    }
  }

  const valorContexto = {
    usuario,
    cargando,
    error,
    configuracionValida: Boolean(supabase),
    iniciarSesionConGoogle,
    cerrarSesion,
  }

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  }

  return contexto
}
