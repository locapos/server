variable "cloudflare_api_token" {
  description = "API token for Cloudflare"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "database_name" {
  description = "Name of the D1 database"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain for the D1 database"
  type        = string
  default     = ""
}

variable "github_client_id" {
  description = "GitHub client ID for authentication"
  type        = string
}

variable "google_client_id" {
  description = "Google client ID for authentication"
  type        = string
}

variable "msa_client_id" {
  description = "Microsoft client ID for authentication"
  type        = string
}

variable "line_channel_id" {
  description = "LINE channel ID for authentication"
  type        = string
}