# Benchmark de APIs

Arranca Micronaut en `8080`, Spring Boot en `8081` y verifica que ambos responden en `/api/teams/1`.

Desde esta carpeta frontend, ejecuta cada prueba por separado:

```powershell
npm run benchmark:micronaut
npm run benchmark:spring
```

La prueba principal usa una respuesta pequeña (`/api/teams/1`) para medir el overhead del framework: 1 usuario virtual inicial, subida hasta 10 usuarios, 30 segundos sostenidos y descenso progresivo. Los resultados se guardan en `micronaut-results.json` y `spring-results.json`.

Para repetir la prueba de respuesta grande anterior, ejecuta:

```powershell
npm run benchmark:micronaut:teams
npm run benchmark:spring:teams
```

Puedes cambiar el recurso y la carga sin editar el script:

```powershell
k6 run -e BASE_URL=http://localhost:8080 -e RESOURCE_PATH=/api/players/1 -e MAX_VUS=100 benchmarks/api-benchmark.js
```