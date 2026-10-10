# Estudio del framework Micronaut

Trabajo Fin de Máster — Máster Universitario en Desarrollo Ágil de Software para la Web (Universidad de Alcalá).

Autor: Daniel Fernando Saigua Labre · Director: Sergio de la Mata Moratilla

## Contenido

| Carpeta | Descripción |
|---|---|
| `Micronaut/tfm` | API REST con Micronaut 4 (Micronaut Data JDBC, Serde, AOT) — puerto 8080 |
| `Micronaut/tfm/frontend` | Frontend React + Vite para consultar ambas APIs y mostrar resultados |
| `Micronaut/tfm/frontend/benchmarks` | Scripts de pruebas de carga con k6 |
| `Spring/tfm-spring` | API REST equivalente con Spring Boot 3 (Spring Data JDBC) — puerto 8081 |
| `database` | Scripts SQL para recrear la base de datos con los datos de las pruebas |
| `TFM 2026 v2.docx` | Memoria del trabajo |

Ambas APIs usan la misma base de datos PostgreSQL (`tfm_micronaut`).
