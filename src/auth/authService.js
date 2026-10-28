import {
  errorConfiguracionSupabase,
  supabase,
} from '../config/supabaseClient.js'

function obtenerClienteSupabase() {
  if (!supabase) {
    throw new Error(errorConfiguracionSupabase)
  }

  return supabase
}

export function obtenerSesion() {
  return obtenerClienteSupabase().auth.getSession()
}

export function observarSesion(alCambiarSesion) {
  const cliente = obtenerClienteSupabase()
  const { data } = cliente.auth.onAuthStateChange((_evento, sesion) => {
    alCambiarSesion(sesion)
  })

  return data.subscription
}

export function iniciarSesionConGoogle() {
  const cliente = obtenerClienteSupabase()

  return cliente.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
}

export function cerrarSesion() {
  return obtenerClienteSupabase().auth.signOut()
}

export function obtenerErrorOAuth() {
  const parametrosUrl = new URLSearchParams(window.location.search)
  const parametrosHash = new URLSearchParams(window.location.hash.slice(1))
  const codigoError =
    parametrosUrl.get('error') ?? parametrosHash.get('error')

  if (!codigoError) {
    return null
  }

  const descripcion =
    parametrosUrl.get('error_description') ??
    parametrosHash.get('error_description')

  limpiarErroresOAuthDeUrl()

  return descripcion ?? 'No se pudo completar el inicio de sesión con Google.'
}

function limpiarErroresOAuthDeUrl() {
  const url = new URL(window.location.href)
  const nombresParametros = ['error', 'error_description', 'error_code']
  let cambioRealizado = false

  for (const nombre of nombresParametros) {
    if (url.searchParams.has(nombre)) {
      url.searchParams.delete(nombre)
      cambioRealizado = true
    }
  }

  const parametrosHash = new URLSearchParams(url.hash.slice(1))

  for (const nombre of nombresParametros) {
    if (parametrosHash.has(nombre)) {
      parametrosHash.delete(nombre)
      cambioRealizado = true
    }
  }

  if (!cambioRealizado) {
    return
  }

  const hashLimpio = parametrosHash.toString()
  url.hash = hashLimpio ? `#${hashLimpio}` : ''

  window.history.replaceState(
    window.history.state,
    document.title,
    `${url.pathname}${url.search}${url.hash}`
  )
}
