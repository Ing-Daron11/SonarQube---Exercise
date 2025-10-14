# Parte 2: Pipeline CI/CD con SonarQube en Azure

## 📋 Descripción

Esta implementación integra SonarQube en una máquina virtual de Azure con un pipeline de CI/CD automatizado que incluye:

- ✅ **Trivy Security Scan**: Análisis de vulnerabilidades de seguridad
- ✅ **Tests & Coverage**: Pruebas unitarias y de cobertura
- ✅ **SonarQube Analysis**: Análisis de calidad de código
- ✅ **Infraestructura como Código**: Terraform para Azure

## 🏗️ Arquitectura

```
GitHub Repository (AppNest)
         │
         │ Push Event
         ▼
┌─────────────────────────────────────┐
│      GitHub Actions Pipeline        │
│  ┌────────┐ ┌─────────┐ ┌─────────┐│
│  │ Trivy  │ │ Tests & │ │SonarQube││
│  │Security│ │Coverage │ │Analysis ││
│  └────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────┘
         │
         │ Analysis Results
         ▼
┌─────────────────────────────────────┐
│        Azure Cloud (East US)        │
│  ┌───────────────────────────────┐  │
│  │ Resource Group: rg-sonarqube- │  │
│  │               appnest         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ VM: vm-sonarqube        │  │  │
│  │  │ Ubuntu 22.04 LTS        │  │  │
│  │  │ Standard_D2s_v3         │  │  │
│  │  │ ┌─────────────────────┐ │  │  │
│  │  │ │ Docker Containers   │ │  │  │
│  │  │ │ ┌─────────┐ ┌─────┐ │ │  │  │
│  │  │ │ │SonarQube│ │ DB  │ │ │  │  │
│  │  │ │ │  :9000  │ │:5432│ │ │  │  │
│  │  │ │ └─────────┘ └─────┘ │ │  │  │
│  │  │ └─────────────────────┘ │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🚀 Paso a Paso

### Paso 1: Preparación de Azure CLI

Primero necesitas instalar Azure CLI y autenticarte:

```bash
# Instalar Azure CLI (Windows)
winget install Microsoft.AzureCLI

# O descargar desde: https://aka.ms/installazurecliwindows

# Autenticarte en Azure
az login

# Verificar tu suscripción
az account show

# Si tienes múltiples suscripciones, seleccionar la correcta
az account set --subscription "tu-subscription-id"
```

### Paso 2: Desplegar Infraestructura con Terraform

```bash
# Navegar al directorio terraform
cd terraform

# Inicializar Terraform
terraform init

# Revisar el plan
terraform plan

# Aplicar la infraestructura
terraform apply

# Guardar las salidas importantes
terraform output
```

### Paso 3: Configurar GitHub Secrets

En tu repositorio de GitHub, ve a **Settings > Secrets and variables > Actions** y agrega:

```
SONAR_TOKEN=tu-token-de-sonarqube
SONAR_HOST_URL=http://TU-IP-PUBLICA:9000
RAILWAY_TOKEN=tu-token-de-railway (opcional)
```

### Paso 4: Configurar SonarQube

1. Accede a `http://TU-IP-PUBLICA:9000`
2. Credenciales iniciales: `admin/admin`
3. Cambia la contraseña
4. Crea un nuevo proyecto llamado `appnest-backend`
5. Genera un token de autenticación

### Paso 5: Activar el Pipeline

El pipeline se ejecuta automáticamente con cada push. Para probarlo:

```bash
# Hacer un cambio y push
git add .
git commit -m "feat: activar pipeline CI/CD con SonarQube"
git push origin main
```

## 📊 Componentes del Pipeline

### 1. Trivy Security Scan
- Escanea vulnerabilidades en dependencias
- Genera reportes SARIF para GitHub Security
- Clasifica por severidad (CRITICAL, HIGH, MEDIUM, LOW)

### 2. Tests & Coverage
- Ejecuta pruebas unitarias con Jest
- Pruebas E2E con supertest
- Genera reportes de cobertura
- Sube resultados a Codecov

### 3. SonarQube Analysis
- Análisis estático de código
- Métricas de calidad y complejidad
- Detección de code smells
- Quality Gate automático

### 4. Security Report
- Consolida resultados de seguridad
- Genera reporte unificado
- Almacena artefactos para revisión

## 🔧 Configuración del Proyecto

### SonarQube Properties

Crea un archivo `sonar-project.properties` en la raíz:

```properties
sonar.projectKey=appnest-backend
sonar.projectName=AppNest Backend
sonar.projectVersion=1.0

# Paths
sonar.sources=src
sonar.tests=test
sonar.exclusions=node_modules/**,dist/**,coverage/**

# TypeScript/JavaScript specific
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.tsconfigPath=tsconfig.json

# Test exclusions
sonar.coverage.exclusions=**/*.spec.ts,**/*.e2e-spec.ts,**/node_modules/**,**/dist/**
```

## 📈 Monitoreo y Resultados

### En GitHub
- **Actions**: Ver ejecuciones del pipeline
- **Security**: Alertas de Trivy
- **Pull Requests**: Quality Gate status

### En SonarQube
- Dashboard con métricas de calidad
- Historial de análisis
- Issues y code smells
- Coverage y duplicación

## 🛠️ Comandos Útiles

### Terraform
```bash
# Ver estado actual
terraform show

# Destruir infraestructura
terraform destroy

# Formatear archivos
terraform fmt

# Validar configuración
terraform validate
```

### Azure CLI
```bash
# Ver recursos creados
az resource list --resource-group rg-sonarqube-appnest

# Ver IP pública
az network public-ip show --resource-group rg-sonarqube-appnest --name pip-sonarqube

# Conectar por SSH
ssh azureuser@TU-IP-PUBLICA
```

### SonarScanner (local)
```bash
# Instalar scanner
npm install -g sonar-scanner

# Ejecutar análisis local
sonar-scanner \
  -Dsonar.projectKey=appnest-backend \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://TU-IP:9000 \
  -Dsonar.login=TU-TOKEN
```

## 🎯 Próximos Pasos

1. ✅ Configurar Quality Gates personalizados
2. ✅ Integrar notificaciones de Slack/Teams
3. ✅ Configurar deployment automático
4. ✅ Implementar análisis de ramas de feature
5. ✅ Configurar retention de artefactos

## 🔍 Troubleshooting

### SonarQube no responde
```bash
# Conectar a la VM
ssh azureuser@TU-IP-PUBLICA

# Verificar estado de Docker
sudo docker ps

# Ver logs de SonarQube
sudo docker logs sonarqube

# Reiniciar servicios
cd /opt/sonarqube
sudo docker-compose restart
```

### Pipeline falla en análisis
1. Verificar que `SONAR_TOKEN` y `SONAR_HOST_URL` estén configurados
2. Confirmar que SonarQube esté accesible públicamente
3. Revisar logs del job en GitHub Actions

### Problemas de cobertura
1. Verificar que las pruebas generen `coverage/lcov.info`
2. Confirmar paths en configuración de SonarQube
3. Revisar exclusiones en `sonar-project.properties`