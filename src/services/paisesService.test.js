import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buscarPaises,
  crearPatronBusqueda,
  obtenerPaisPorCodigo,
} from './paisesService.js'

test('crearPatronBusqueda devuelve un patrón parcial para texto normal', () => {
  assert.equal(crearPatronBusqueda('  Brasil  '), '"%Brasil%"')
})

test('crearPatronBusqueda devuelve null cuando no hay texto', () => {
  assert.equal(crearPatronBusqueda('   '), null)
})

test('crearPatronBusqueda cambia caracteres de control por espacios', () => {
  assert.equal(crearPatronBusqueda('a\nb\u0000c'), '"%a b c%"')
})

test('crearPatronBusqueda mantiene puntuación dentro del valor', () => {
  assert.equal(
    crearPatronBusqueda('a,b(c).d:e'),
    '"%a,b(c).d:e%"'
  )
})

test('crearPatronBusqueda escapa comodines de ILIKE como texto literal', () => {
  assert.equal(
    crearPatronBusqueda('100%_real'),
    '"%100\\\\%\\\\_real%"'
  )
})

test('crearPatronBusqueda trata el asterisco como texto literal', () => {
  assert.equal(crearPatronBusqueda('50*'), '"%50\\\\*%"')
})

test('crearPatronBusqueda escapa comillas y barras invertidas', () => {
  assert.equal(
    crearPatronBusqueda('A"B\\C'),
    '"%A\\"B\\\\\\\\C%"'
  )
})

test('buscarPaises explica qué configurar si falta el cliente', async () => {
  await assert.rejects(
    () => buscarPaises(),
    /VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY/
  )
})

test('obtenerPaisPorCodigo devuelve null para un código inválido', async () => {
  assert.equal(await obtenerPaisPorCodigo('???'), null)
})
