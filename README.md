# Ejercicio de Integración de SonarQube

Este repositorio documenta un ejercicio práctico, realizado en mi universidad, sobre la configuración y uso de SonarQube para el análisis de la calidad del código, incluyendo tanto análisis local como implementación de CI/CD en la nube.

## Contexto

El objetivo de este ejercicio comprende dos fases principales:

1.  **Análisis Local:** Implementar SonarQube en un entorno local para analizar un proyecto existente, familiarizándose con la configuración de servicios, la creación de proyectos y la ejecución del scanner.
2.  **Análisis Automatizado:** Configurar un pipeline de CI/CD en una máquina virtual en Azure para que el análisis de SonarQube se ejecute automáticamente con cada cambio en el código, integrado con análisis de seguridad mediante Trivy.

## Parte 1: Análisis Local

La primera fase de este ejercicio se realizó sobre mi proyecto [**AppNest**](https://github.com/Ing-Daron11/AppNest.git), una aplicación desarrollada con NestJS.

El proceso detallado para configurar el entorno con Docker, levantar los servicios de SonarQube y ejecutar el análisis de código se encuentra documentado en el siguiente archivo:

- [**Ver Reporte de Análisis Local**](./proceso-local.md)

## Parte 2: Análisis Automatizado con CI/CD en Azure

La segunda fase implementa un pipeline completo de Integración y Entrega Continua (CI/CD) que automatiza el análisis de calidad de código en cada cambio del repositorio.

El proceso detallado se escuentra descrito y documentado en el siguiente archivo:

- [**Ver Reporte de Análisis Automatizado CI/CD en Azure**](./proceso-en-la-nube.md)

## Autor

**Daron** - Estudiante de Ingeniería de Software, Universidad Icesi

## Proyecto Base

[**AppNest Backend**](https://github.com/Ing-Daron11/AppNest.git) - API REST desarrollada con NestJS para sistema de alquiler de equipos deportivos.

## Licencia

Este proyecto es con fines académicos y de aprendizaje.

---

**Nota:** Este ejercicio forma parte del curso de Ingeniería de Software V, enfocado en prácticas de DevOps, CI/CD y análisis continuo de calidad de código.
