import test from 'node:test'
import assert from 'node:assert/strict'

import { obtenerErrorOAuth } from './authService.js'

test('obtenerErrorOAuth muestra el error y limpia solo sus parámetros', () => {
  const estadoAnterior = globalThis.window
  const documentoAnterior = globalThis.document
  const estadoHistorial = { pagina: 'acceso' }
  let urlGuardada

  const urlInicial = new URL(
    'http://localhost:5173/?error=access_denied' +
      '&error_description=Acceso%20cancelado&vista=mapa' +
      '#state=pendiente&error=access_denied&access_token=token'
  )

  globalThis.window = {
    location: {
      href: urlInicial.href,
      search: urlInicial.search,
      hash: urlInicial.hash,
    },
    history: {
      state: estadoHistorial,
      replaceState(estado, titulo, url) {
        assert.equal(estado, estadoHistorial)
        assert.equal(titulo, 'Buscador de Países')
        urlGuardada = url
      },
    },
  }
  globalThis.document = { title: 'Buscador de Países' }

  try {
    assert.equal(obtenerErrorOAuth(), 'Acceso cancelado')
    assert.equal(
      urlGuardada,
      '/?vista=mapa#state=pendiente&access_token=token'
    )
  } finally {
    if (estadoAnterior === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = estadoAnterior
    }

    if (documentoAnterior === undefined) {
      delete globalThis.document
    } else {
      globalThis.document = documentoAnterior
    }
  }
})
