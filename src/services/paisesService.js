import {
  errorConfiguracionSupabase,
  supabase,
} from '../config/supabaseClient.js'

const LIMITE_POR_DEFECTO = 24

function obtenerClienteSupabase() {
  if (!supabase) {
    throw new Error(errorConfiguracionSupabase)
  }

  return supabase
}

function escaparPatronIlike(texto) {
  // Evita que los comodines de ILIKE cambien el significado de la búsqueda.
  return texto
    .replaceAll('\\', '\\\\')
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_')
    .replaceAll('*', '\\*')
}

function escaparTextoPostgrest(texto) {
  // .or() recibe filtros PostgREST en texto, así que protegemos comillas y barras.
  return texto
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
}

export function crearPatronBusqueda(texto) {
  if (typeof texto !== 'string') {
    return null
  }

  const textoLimpio = texto
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()

  if (!textoLimpio) {
    return null
  }

  const patronEscapado = escaparPatronIlike(textoLimpio)
  const valorEscapado = escaparTextoPostgrest(patronEscapado)

  return `"%${valorEscapado}%"`
}

export async function buscarPaises({
  texto = '',
  region = null,
  pagina = 1,
  limite = LIMITE_POR_DEFECTO,
} = {}) {
  const cliente = obtenerClienteSupabase()
  const paginaValida = Number.isInteger(pagina) && pagina > 0 ? pagina : 1
  const limiteValido =
    Number.isInteger(limite) && limite > 0
      ? limite
      : LIMITE_POR_DEFECTO
  const patronBusqueda = crearPatronBusqueda(texto)
  const regionLimpia = typeof region === 'string' ? region.trim() : ''

  let consulta = cliente
    .from('countries')
    .select('*', { count: 'exact' })

  if (patronBusqueda) {
    consulta = consulta.or(
      `nombre_comun.ilike.${patronBusqueda},` +
        `nombre_oficial.ilike.${patronBusqueda}`
    )
  }

  if (regionLimpia) {
    consulta = consulta.eq('region', regionLimpia)
  }

  const desde = (paginaValida - 1) * limiteValido
  const hasta = desde + limiteValido - 1

  const { data, error, count } = await consulta
    .order('nombre_comun', { ascending: true })
    .range(desde, hasta)

  if (error) {
    throw new Error(`No se pudieron buscar los países: ${error.message}`)
  }

  return {
    paises: data ?? [],
    total: count ?? 0,
  }
}

export async function obtenerPaisPorCodigo(codigo) {
  const codigoNormalizado =
    typeof codigo === 'string' ? codigo.trim().toUpperCase() : ''

  if (!/^[A-Z]{2}$/.test(codigoNormalizado)) {
    return null
  }

  const cliente = obtenerClienteSupabase()
  const { data, error } = await cliente
    .from('countries')
    .select('*')
    .eq('codigo', codigoNormalizado)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo obtener el país: ${error.message}`)
  }

  return data ?? null
}
