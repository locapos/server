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
  "vars": {
    "REDIRECT_URI_BASE": "http://localhost:8787"
  },
  // "kv_namespaces": [
  //   {
  //     "binding": "MY_KV_NAMESPACE",
  //     "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  //   }
  // ],
  // "r2_buckets": [
  //   {
  //     "binding": "MY_BUCKET",
  //     "bucket_name": "my-bucket"
  //   }
  // ],
  "d1_databases": [
    {
      "binding": "SDB",
      "database_name": "${database_name}",
      "database_id": "${database_id}",
    }
  ],
  // "ai": {
  //   "binding": "AI"
  // },
  // "observability": {
  //   "enabled": true,
  //   "head_sampling_rate": 1
  // }
  "assets":{
    "directory": "./dist",
    "binding": "ASSETS",
  },
  "dev": {
    "ip": "*"
  }
}
