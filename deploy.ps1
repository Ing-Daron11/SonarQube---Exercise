# Script de despliegue para AppNest con SonarQube en Azure
# Ejecutar como administrador en PowerShell

param(
    [string]$Action = "deploy",
    [string]$ResourceGroup = "rg-sonarqube-appnest",
    [string]$Location = "East US"
)

# Colores para output
$Red = 'Red'
$Green = 'Green'
$Yellow = 'Yellow'
$Blue = 'Cyan'

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput $Blue "🚀 AppNest - Despliegue de SonarQube en Azure"
Write-ColorOutput $Blue "=============================================="

# Verificar que Azure CLI está instalado
try {
    $azVersion = az --version | Select-String "azure-cli" | Select-Object -First 1
    Write-ColorOutput $Green "✅ Azure CLI encontrado: $azVersion"
} catch {
    Write-ColorOutput $Red "❌ Azure CLI no está instalado. Instalar desde: https://aka.ms/installazurecliwindows"
    exit 1
}

# Verificar que Terraform está instalado
try {
    $tfVersion = terraform --version | Select-Object -First 1
    Write-ColorOutput $Green "✅ Terraform encontrado: $tfVersion"
} catch {
    Write-ColorOutput $Red "❌ Terraform no está instalado. Instalar desde: https://www.terraform.io/downloads.html"
    exit 1
}

# Verificar autenticación de Azure
try {
    $account = az account show --query "name" -o tsv 2>$null
    if ($account) {
        Write-ColorOutput $Green "✅ Autenticado en Azure: $account"
    } else {
        Write-ColorOutput $Yellow "⚠️  No autenticado en Azure. Ejecutando az login..."
        az login
    }
} catch {
    Write-ColorOutput $Yellow "⚠️  Ejecutando az login..."
    az login
}

switch ($Action.ToLower()) {
    "deploy" {
        Write-ColorOutput $Blue "📦 Desplegando infraestructura..."
        
        # Cambiar al directorio terraform
        Push-Location "terraform"
        
        try {
            # Inicializar Terraform
            Write-ColorOutput $Yellow "🔧 Inicializando Terraform..."
            terraform init
            
            # Crear plan
            Write-ColorOutput $Yellow "📋 Creando plan de despliegue..."
            terraform plan -out=tfplan
            
            # Aplicar plan
            Write-ColorOutput $Yellow "🚀 Aplicando infraestructura..."
            terraform apply tfplan
            
            # Mostrar outputs
            Write-ColorOutput $Green "📊 Información de despliegue:"
            terraform output
            
            Write-ColorOutput $Green "✅ Despliegue completado exitosamente!"
            Write-ColorOutput $Blue "🔍 Próximos pasos:"
            Write-ColorOutput $Blue "1. Esperar 5-10 minutos para que SonarQube inicie completamente"
            Write-ColorOutput $Blue "2. Acceder a la URL de SonarQube mostrada arriba"
            Write-ColorOutput $Blue "3. Iniciar sesión con admin/admin y cambiar contraseña"
            Write-ColorOutput $Blue "4. Crear proyecto 'appnest-backend' y generar token"
            Write-ColorOutput $Blue "5. Agregar secrets en GitHub (SONAR_TOKEN, SONAR_HOST_URL)"
            
        } catch {
            Write-ColorOutput $Red "❌ Error durante el despliegue: $_"
            Pop-Location
            exit 1
        }
        
        Pop-Location
    }
    
    "destroy" {
        Write-ColorOutput $Yellow "⚠️  ADVERTENCIA: Esto eliminará toda la infraestructura"
        $confirm = Read-Host "¿Estás seguro? (yes/no)"
        
        if ($confirm -eq "yes") {
            Push-Location "terraform"
            
            try {
                Write-ColorOutput $Yellow "🗑️  Destruyendo infraestructura..."
                terraform destroy -auto-approve
                Write-ColorOutput $Green "✅ Infraestructura eliminada exitosamente"
            } catch {
                Write-ColorOutput $Red "❌ Error durante la destrucción: $_"
                Pop-Location
                exit 1
            }
            
            Pop-Location
        } else {
            Write-ColorOutput $Blue "Operación cancelada"
        }
    }
    
    "status" {
        Push-Location "terraform"
        
        try {
            Write-ColorOutput $Blue "📊 Estado de la infraestructura:"
            terraform show
            
            Write-ColorOutput $Blue "`n🔍 Información de conexión:"
            terraform output
        } catch {
            Write-ColorOutput $Red "❌ Error al obtener estado: $_"
        }
        
        Pop-Location
    }
    
    "check" {
        Write-ColorOutput $Blue "🔍 Verificando recursos en Azure..."
        
        try {
            $resources = az resource list --resource-group $ResourceGroup --query "[].{Name:name, Type:type, Location:location}" -o table 2>$null
            
            if ($resources) {
                Write-ColorOutput $Green "✅ Recursos encontrados en el grupo '$ResourceGroup':"
                Write-Output $resources
                
                # Obtener IP pública
                $publicIP = az network public-ip show --resource-group $ResourceGroup --name "pip-sonarqube" --query "ipAddress" -o tsv 2>$null
                if ($publicIP) {
                    Write-ColorOutput $Green "🌐 IP Pública: $publicIP"
                    Write-ColorOutput $Green "🔗 SonarQube URL: http://$publicIP:9000"
                }
            } else {
                Write-ColorOutput $Yellow "⚠️  No se encontraron recursos en el grupo '$ResourceGroup'"
            }
        } catch {
            Write-ColorOutput $Red "❌ Error al verificar recursos: $_"
        }
    }
    
    default {
        Write-ColorOutput $Blue "💡 Uso del script:"
        Write-ColorOutput $Blue "  .\deploy.ps1 deploy   - Desplegar infraestructura"
        Write-ColorOutput $Blue "  .\deploy.ps1 destroy  - Eliminar infraestructura"
        Write-ColorOutput $Blue "  .\deploy.ps1 status   - Ver estado actual"
        Write-ColorOutput $Blue "  .\deploy.ps1 check    - Verificar recursos en Azure"
    }
}

Write-ColorOutput $Blue "`n🎉 Proceso completado!"