variable "resource_group_name" {
  description = "Nombre del grupo de recursos"
  type        = string
  default     = "rg-sonarqube-appnest"
}

variable "location" {
  description = "Ubicación de los recursos de Azure"
  type        = string
  default     = "East US"
}

variable "vm_size" {
  description = "Tamaño de la máquina virtual"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "admin_username" {
  description = "Nombre de usuario administrador"
  type        = string
  default     = "azureuser"
}

variable "admin_password" {
  description = "Contraseña del administrador"
  type        = string
  default     = "SonarQube2024!@#"
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "appnest"
}