# Base de datos `tfm_micronaut`

Scripts para recrear la base de datos PostgreSQL que usan las dos APIs (Micronaut y Spring Boot),
con los mismos datos empleados en las pruebas experimentales.

| Archivo | Contenido |
|---|---|
| `01_schema.sql` | Tablas `teams`, `players`, `matches` y `player_statistics`, claves primarias, claves foráneas y secuencias |
| `02_data.sql` | 1000 registros por tabla (4000 en total) y ajuste de las secuencias |

Generados con `pg_dump` (PostgreSQL 17) a partir de la base de datos original y verificados
cargándolos en una base de datos nueva: el contenido resultante es idéntico (misma huella MD5 por tabla).

## Cómo cargarla

### Con psql

```bash
createdb -h localhost -U postgres -E UTF8 -T template0 tfm_micronaut
psql -h localhost -U postgres -d tfm_micronaut -v ON_ERROR_STOP=1 -f 01_schema.sql
psql -h localhost -U postgres -d tfm_micronaut -v ON_ERROR_STOP=1 -f 02_data.sql
```

### Con pgAdmin

1. Crear la base de datos `tfm_micronaut` (codificación UTF8).
2. Abrir el *Query Tool* sobre ella, cargar `01_schema.sql` y ejecutarlo.
3. Repetir con `02_data.sql`.

Ambas aplicaciones se conectan con el usuario `postgres` en `localhost:5432`
(ver `Micronaut/tfm/src/main/resources/application.yaml` y
`Spring/tfm-spring/src/main/resources/application.properties`).
