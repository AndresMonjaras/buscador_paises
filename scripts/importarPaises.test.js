import test from "node:test";
import assert from "node:assert/strict";

import { normalizarPais, obtenerPaginaPaises } from "./importarPaises.js";

test("normalizarPais maps a valid v5 record to schema fields", () => {
  const externo = {
    codes: { alpha_2: "mx", alpha_3: "mex" },
    names: { common: "Mexico", official: "Estados Unidos Mexicanos" },
    region: "Americas",
    subregion: "North America",
    capitals: [{ name: "Mexico City" }],
    population: 126014024,
    flag: { url_svg: "https://flagcdn.com/mx.svg", description: "green white red" },
  };

  const fila = normalizarPais(externo);

  assert.deepEqual(fila, {
    codigo: "MX",
    codigo_alpha3: "MEX",
    nombre_comun: "Mexico",
    nombre_oficial: "Estados Unidos Mexicanos",
    region: "Americas",
    subregion: "North America",
    capital: "Mexico City",
    poblacion: 126014024,
    bandera_url: "https://flagcdn.com/mx.svg",
    bandera_alt: "green white red",
  });
});

test("normalizarPais returns null for invalid alpha-2 code", () => {
  const externo = {
    codes: { alpha_2: "X", alpha_3: "MEX" },
    names: { common: "Mexico" },
    region: "Americas",
  };

  assert.equal(normalizarPais(externo), null);
});

test("normalizarPais returns null for invalid alpha-3 code", () => {
  const externo = {
    codes: { alpha_2: "MX", alpha_3: "MX" },
    names: { common: "Mexico" },
    region: "Americas",
  };

  assert.equal(normalizarPais(externo), null);
});

test("normalizarPais returns null for missing common name", () => {
  const externo = {
    codes: { alpha_2: "MX", alpha_3: "MEX" },
    names: { common: "" },
    region: "Americas",
  };

  assert.equal(normalizarPais(externo), null);
});

test("normalizarPais fills optional fields with null and falls back official name", () => {
  const externo = {
    codes: { alpha_2: "mx", alpha_3: "mex" },
    names: { common: "Mexico" },
    region: "Americas",
    subregion: null,
    capitals: [],
    population: undefined,
    flag: {},
  };

  const fila = normalizarPais(externo);

  assert.equal(fila.nombre_oficial, "Mexico");
  assert.equal(fila.subregion, null);
  assert.equal(fila.capital, null);
  assert.equal(fila.poblacion, null);
  assert.equal(fila.bandera_url, null);
  assert.equal(fila.bandera_alt, null);
});

test("obtenerPaginaPaises builds URL params and Bearer header", async () => {
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url);
    const camposEsperados = [
      "codes.alpha_2",
      "codes.alpha_3",
      "names.common",
      "names.official",
      "region",
      "subregion",
      "capitals",
      "population",
      "flag.url_svg",
      "flag.description",
    ].join(",");

    assert.equal(parsed.searchParams.get("limit"), "100");
    assert.equal(parsed.searchParams.get("offset"), "50");
    assert.equal(parsed.searchParams.get("response_fields"), camposEsperados);
    assert.equal(options.headers.Authorization, "Bearer clave-secreta");

    return {
      ok: true,
      status: 200,
      json: async () => ({ data: { meta: { total: 1 }, objects: [] } }),
    };
  };

  const respuesta = await obtenerPaginaPaises(50, "clave-secreta", fetchImpl);
  assert.equal(respuesta.total, 1);
  assert.deepEqual(respuesta.paises, []);
});

test("obtenerPaginaPaises throws with status and offset on non-2xx", async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 429,
    json: async () => ({}),
  });

  await assert.rejects(
    () => obtenerPaginaPaises(100, "clave-secreta", fetchImpl),
    (error) => {
      assert.match(String(error.message), /429/);
      assert.match(String(error.message), /100/);
      return true;
    }
  );
});
