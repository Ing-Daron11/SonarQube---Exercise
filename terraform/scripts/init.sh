#!/bin/bash

# Script de inicialización para VM de Azure con SonarQube
# Este script se ejecuta al crear la VM y configura todo el entorno

set -e

# Log de inicio
echo "$(date): Iniciando configuración de SonarQube..." >> /var/log/sonarqube-init.log

# Actualizar el sistema
apt-get update -y
apt-get upgrade -y

# Instalar dependencias básicas
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    unzip \
    wget

# Instalar Docker
echo "$(date): Instalando Docker..." >> /var/log/sonarqube-init.log
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Agregar usuario al grupo docker
usermod -aG docker azureuser

# Instalar Docker Compose
echo "$(date): Instalando Docker Compose..." >> /var/log/sonarqube-init.log
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Crear directorio para SonarQube
mkdir -p /opt/sonarqube
cd /opt/sonarqube

# Crear docker-compose.yml para SonarQube
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  sonarqube:
    image: sonarqube:community
    container_name: sonarqube
    depends_on:
      - db
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    ports:
      - "9000:9000"
    networks:
      - sonar-network

  db:
    image: postgres:13
    container_name: sonarqube-db
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
      POSTGRES_DB: sonar
    volumes:
      - postgresql_data:/var/lib/postgresql/data
    networks:
      - sonar-network

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql_data:

networks:
  sonar-network:
    driver: bridge
EOF

# Configurar límites del sistema para SonarQube
echo "$(date): Configurando límites del sistema..." >> /var/log/sonarqube-init.log
echo 'vm.max_map_count=524288' >> /etc/sysctl.conf
echo 'fs.file-max=131072' >> /etc/sysctl.conf
sysctl -p

# Configurar límites de usuario
cat >> /etc/security/limits.conf << EOF
sonarqube   -   nofile   131072
sonarqube   -   nproc    8192
EOF

# Iniciar Docker y habilitar para inicio automático
systemctl start docker
systemctl enable docker

# Esperar un momento para que Docker se inicie completamente
sleep 10

# Iniciar SonarQube con Docker Compose
echo "$(date): Iniciando SonarQube..." >> /var/log/sonarqube-init.log
cd /opt/sonarqube
docker-compose up -d

# Crear script de monitoreo
cat > /opt/sonarqube/check-health.sh << 'EOF'
#!/bin/bash
echo "=== Estado de Docker ==="
docker ps

echo -e "\n=== Estado de SonarQube ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:9000 || echo "SonarQube no responde"

echo -e "\n=== Logs de SonarQube ==="
docker logs sonarqube --tail 20
EOF

chmod +x /opt/sonarqube/check-health.sh

# Crear servicio systemd para auto-restart
cat > /etc/systemd/system/sonarqube.service << 'EOF'
[Unit]
Description=SonarQube Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/sonarqube
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable sonarqube.service

# Instalar Node.js (para análisis de código)
echo "$(date): Instalando Node.js..." >> /var/log/sonarqube-init.log
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar SonarScanner CLI
echo "$(date): Instalando SonarScanner CLI..." >> /var/log/sonarqube-init.log
cd /opt
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
mv sonar-scanner-5.0.1.3006-linux sonar-scanner
chmod +x sonar-scanner/bin/sonar-scanner

# Agregar SonarScanner al PATH
echo 'export PATH="/opt/sonar-scanner/bin:$PATH"' >> /etc/profile
echo 'export PATH="/opt/sonar-scanner/bin:$PATH"' >> /home/azureuser/.bashrc

# Crear directorio para proyectos
mkdir -p /home/azureuser/projects
chown -R azureuser:azureuser /home/azureuser/projects

# Script de información del sistema
cat > /home/azureuser/system-info.sh << 'EOF'
#!/bin/bash
echo "======================================"
echo "    INFORMACIÓN DEL SISTEMA SONARQUBE"
echo "======================================"
echo "Fecha: $(date)"
echo "IP Pública: $(curl -s ifconfig.me)"
echo "URL SonarQube: http://$(curl -s ifconfig.me):9000"
echo ""
echo "Credenciales por defecto de SonarQube:"
echo "Usuario: admin"
echo "Contraseña: admin"
echo ""
echo "=== Estado de los servicios ==="
/opt/sonarqube/check-health.sh
EOF

chmod +x /home/azureuser/system-info.sh
chown azureuser:azureuser /home/azureuser/system-info.sh

# Configurar firewall básico
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 9000/tcp

echo "$(date): Configuración completada. SonarQube estará disponible en http://$(curl -s ifconfig.me):9000" >> /var/log/sonarqube-init.log

# Mostrar información final
echo "======================================"
echo "    CONFIGURACIÓN COMPLETADA"
echo "======================================"
echo "SonarQube URL: http://$(curl -s ifconfig.me):9000"
echo "SSH: ssh azureuser@$(curl -s ifconfig.me)"
echo "Log de instalación: /var/log/sonarqube-init.log"
echo "Script de información: ~/system-info.sh"