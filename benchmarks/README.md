# Mediciones experimentales

Scripts para comparar Micronaut y Spring Boot en las mismas condiciones.

| Archivo | Descripción |
|---|---|
| `run-benchmarks.ps1` | Orquesta todas las mediciones y genera `results/<fecha>/summary.json` |
| `k6/load-test.js` | Prueba de carga k6 con usuarios virtuales constantes |

## Qué se mide

1. **Tiempo de arranque**: 10 arranques de cada JAR (alternando frameworks), midiendo el tiempo
   hasta la primera respuesta HTTP 200 y el tiempo que indica el propio framework en su log.
2. **Memoria en reposo** (10 s después de arrancar), con `jcmd`: memoria del proceso, heap usado
   (antes y después de un GC), metaspace, class space, memoria nativa comprometida (NMT),
   clases cargadas e hilos.
3. **Carga con k6**: respuesta pequeña (`/api/teams/1`) y grande (`/api/teams`, 1000 registros),
   con 10, 50 y 100 usuarios virtuales, 30 s por prueba, 3 repeticiones y calentamiento previo.
   Durante cada prueba se muestrea cada segundo el uso de CPU y memoria del proceso Java.
4. **Java Flight Recorder** durante la prueba más exigente (respuesta grande, máximo de usuarios):
   número de recolecciones de basura y tiempo total de pausa.

Ambas aplicaciones se ejecutan con las mismas opciones de JVM: `-Xmx512m -XX:+UseG1GC`.

## Cómo ejecutarlo

Requisitos: Java 21 (con `jcmd` y `jfr`), k6, PostgreSQL con la base de datos de `database/`.

```powershell
# 1. Compilar los JAR
cd Micronaut\tfm;      .\gradlew.bat shadowJar
cd ..\..\Spring\tfm-spring; .\gradlew.bat bootJar
cd ..\..

# 2. Medir (unos 30 minutos; no usar el equipo mientras tanto)
powershell -ExecutionPolicy Bypass -File benchmarks\run-benchmarks.ps1

# Prueba rápida del script (2-3 minutos, resultados no válidos para la memoria)
powershell -ExecutionPolicy Bypass -File benchmarks\run-benchmarks.ps1 -Quick
```

Los datos en bruto (logs, resúmenes de cada ejecución de k6, grabaciones `.jfr`) quedan en
`results/<fecha>/raw/` y no se suben al repositorio; `summary.json` sí.

## Limitaciones

- k6 y la aplicación medida se ejecutan en el mismo equipo y compiten por la CPU.
- La base de datos PostgreSQL también está en el mismo equipo.
- Los resultados dependen del hardware; se registran en `summary.json` (`environment`).
