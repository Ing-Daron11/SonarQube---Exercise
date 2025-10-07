# Ejercicio de Integración de SonarQube

Este repositorio documenta un ejercicio práctico sobre la configuración y uso de SonarQube para el análisis de la calidad del código.

## Contexto

El objetivo de este ejercicio es doble:

1.  **Análisis Local:** Implementar SonarQube en un entorno local para analizar un proyecto existente, familiarizándose con la configuración de servicios, la creación de proyectos y la ejecución del scanner.
2.  **Análisis Automatizado (Próximamente):** Configurar un pipeline de CI/CD en una máquina virtual para que el análisis de SonarQube se ejecute automáticamente con cada cambio en el código.

## Parte 1: Análisis Local

La primera fase de este ejercicio se realizó sobre el proyecto [**AppNest**](https://github.com/Ing-Daron11/AppNest.git), una aplicación desarrollada con NestJS.

El proceso detallado para configurar el entorno con Docker, levantar los servicios de SonarQube y ejecutar el análisis de código se encuentra documentado en el siguiente archivo:

- [**Ver Reporte de Análisis Local**](./proceso-local.md)
