output "resource_group_name" {
  description = "Nombre del grupo de recursos"
  value       = azurerm_resource_group.main.name
}

output "public_ip_address" {
  description = "Dirección IP pública de la VM"
  value       = azurerm_public_ip.main.ip_address
}

output "sonarqube_url" {
  description = "URL de SonarQube"
  value       = "http://${azurerm_public_ip.main.ip_address}:9000"
}

output "ssh_connection_string" {
  description = "Cadena de conexión SSH"
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.main.ip_address}"
}

output "vm_name" {
  description = "Nombre de la máquina virtual"
  value       = azurerm_linux_virtual_machine.main.name
}