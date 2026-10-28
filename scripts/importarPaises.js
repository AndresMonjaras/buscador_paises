import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";

const URL_API_PAISES = "https://api.restcountries.com/countries/v5";
const LIMITE_POR_PAGINA = 100;

const CAMPOS_API = [
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

function obtenerTexto(valor) {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim();

  return texto.length > 0 ? texto : null;
}

export function normalizarPais(paisExterno) {
  const codigo = obtenerTexto(paisExterno?.codes?.alpha_2)?.toUpperCase();
  const codigoAlpha3 = obtenerTexto(paisExterno?.codes?.alpha_3)?.toUpperCase();
  const nombreComun = obtenerTexto(paisExterno?.names?.common);

  const codigoValido = /^[A-Z]{2}$/.test(codigo ?? "");
  const codigoAlpha3Valido = /^[A-Z]{3}$/.test(codigoAlpha3 ?? "");

  if (!codigoValido || !codigoAlpha3Valido || !nombreComun) {
    return null;
  }

  const nombreOficial =
    obtenerTexto(paisExterno.names.official) ?? nombreComun;
  const capitalPrincipal = Array.isArray(paisExterno.capitals)
    ? obtenerTexto(paisExterno.capitals[0]?.name)
    : null;
  const poblacionEsValida =
    Number.isSafeInteger(paisExterno.population) && paisExterno.population >= 0;

  return {
    codigo,
    codigo_alpha3: codigoAlpha3,
    nombre_comun: nombreComun,
    nombre_oficial: nombreOficial,
    region: obtenerTexto(paisExterno.region),
    subregion: obtenerTexto(paisExterno.subregion),
    capital: capitalPrincipal,
    poblacion: poblacionEsValida ? paisExterno.population : null,
    bandera_url: obtenerTexto(paisExterno.flag?.url_svg),
    bandera_alt: obtenerTexto(paisExterno.flag?.description),
  };
}

export async function obtenerPaginaPaises(
  desde,
  apiKey,
  fetchImpl = fetch
) {
  const claveApi = obtenerTexto(apiKey);

  if (!claveApi) {
    throw new Error("Falta la clave REST_COUNTRIES_API_KEY.");
  }

  const url = new URL(URL_API_PAISES);
  url.searchParams.set("limit", String(LIMITE_POR_PAGINA));
  url.searchParams.set("offset", String(desde));
  url.searchParams.set("response_fields", CAMPOS_API);

  const respuesta = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${claveApi}`,
    },
  });

  if (!respuesta.ok) {
    throw new Error(
      `REST Countries respondió HTTP ${respuesta.status} para offset ${desde}.`
    );
  }

  let contenido;

  try {
    contenido = await respuesta.json();
  } catch {
    throw new Error(
      `REST Countries devolvió JSON inválido para offset ${desde}.`
    );
  }

  const total = contenido?.data?.meta?.total;
  const paises = contenido?.data?.objects;
  const totalValido = Number.isSafeInteger(total) && total >= 0;

  if (!totalValido || !Array.isArray(paises)) {
    throw new Error(
      "La respuesta de REST Countries no tiene el formato esperado " +
        `para offset ${desde}.`
    );
  }

  return { total, paises };
}

async function importarPaises() {
  const nombresVariablesRequeridas = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "REST_COUNTRIES_API_KEY",
  ];

  const variablesFaltantes = nombresVariablesRequeridas.filter(
    (nombre) => !obtenerTexto(process.env[nombre])
  );

  if (variablesFaltantes.length > 0) {
    throw new Error(
      "Configura estas variables en el entorno: " +
        `${variablesFaltantes.join(", ")}.`
    );
  }

  const clienteSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let desde = 0;
  let totalPaises = null;
  let cantidadInvalidos = 0;
  let cantidadImportados = 0;

  while (totalPaises === null || desde < totalPaises) {
    let pagina;

    try {
      pagina = await obtenerPaginaPaises(
        desde,
        process.env.REST_COUNTRIES_API_KEY
      );
    } catch (error) {
      throw new Error(
        `No se pudo consultar la página con offset ${desde}: ${error.message}`
      );
    }

    totalPaises = pagina.total;

    if (pagina.paises.length === 0 && desde < totalPaises) {
      throw new Error(
        "REST Countries devolvió una página vacía antes de completar " +
          `el catálogo (offset ${desde}).`
      );
    }

    const filasValidas = [];
    let invalidosPagina = 0;

    for (const paisExterno of pagina.paises) {
      const pais = normalizarPais(paisExterno);

      if (pais) {
        filasValidas.push(pais);
      } else {
        cantidadInvalidos += 1;
        invalidosPagina += 1;
      }
    }

    if (filasValidas.length > 0) {
      const actualizadoEn = new Date().toISOString();
      const filasParaGuardar = filasValidas.map((pais) => ({
        ...pais,
        actualizado_en: actualizadoEn,
      }));

      let errorSupabase;

      try {
        const resultado = await clienteSupabase
          .from("countries")
          .upsert(filasParaGuardar, { onConflict: "codigo" });

        errorSupabase = resultado.error;
      } catch (error) {
        throw new Error(
          `Supabase no pudo guardar la página con offset ${desde}: ` +
            error.message
        );
      }

      if (errorSupabase) {
        throw new Error(
          `Supabase no pudo guardar la página con offset ${desde}: ` +
            errorSupabase.message
        );
      }

      cantidadImportados += filasValidas.length;
    }

    console.log(
      `Página ${desde}: ${filasValidas.length} países guardados; ` +
        `${invalidosPagina} registros inválidos omitidos.`
    );

    desde += pagina.paises.length;
  }

  console.log(
    `Importación terminada: ${cantidadImportados} países guardados y ` +
      `${cantidadInvalidos} registros inválidos omitidos.`
  );
}

const esArchivoPrincipal =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (esArchivoPrincipal) {
  importarPaises().catch((error) => {
    console.error(`Error durante la importación: ${error.message}`);
    process.exitCode = 1;
  });
}
