terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_d1_database" "locapos-db" {
  account_id = var.cloudflare_account_id
  name       = "locapos-db"
  primary_location_hint = "apac"
}

resource "local_file" "wrangler_config" {
  filename = "${path.root}/../wrangler.jsonc"
  content = templatefile("${path.module}/wrangler.jsonc.tpl", {
    database_id = cloudflare_d1_database.locapos-db.id
    database_name = cloudflare_d1_database.locapos-db.name
  })
}