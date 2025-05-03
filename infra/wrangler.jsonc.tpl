{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "locapos-server",
  "main": "server/src/index.ts",
  "compatibility_date": "2025-04-17",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "durable_objects": {
    "bindings": [
      {
        "name": "STORAGE_DO",
        "class_name": "Storage"
      },
      {
        "name": "CONNECTION_DO",
        "class_name": "Connection"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v2",
      "new_sqlite_classes": [
        "Storage",
        "Connection"
      ]
    }
  ],
  "vars": {
    "REDIRECT_URI_BASE": "https://${custom_domain}",
    "GITHUB_CLIENT_ID": "${github_client_id}",
    "GOOGLE_CLIENT_ID": "${google_client_id}",
    "MSA_CLIENT_ID":"${msa_client_id}",
    "LINE_CHANNEL_ID":"${line_channel_id}",
  },
  "d1_databases": [
    {
      "binding": "SDB",
      "database_name": "${database_name}",
      "database_id": "${database_id}",
    }
  ],
  "assets":{
    "directory": "./dist",
    "binding": "ASSETS",
  },
  "routes": [
    {
      "pattern": "${custom_domain}",
      "custom_domain": true,
    }
  ],
  "observability": {
    "enabled": true,
    "head_sampling_rate": 0.1,
    "logs": {
      "invocation_logs": true,
    }
  },
  "dev": {
    "ip": "*"
  }
}
