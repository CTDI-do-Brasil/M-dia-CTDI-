import fs from 'fs';
import { S3Client, PutBucketPolicyCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";

// Ler arquivo .env manualmente
const envContent = fs.readFileSync('.env', 'utf8');
const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : '';
};

const endpoint = getEnvVal('VITE_MINIO_ENDPOINT') || "https://minio-api.ctdibrasil.com.br";
const bucketName = getEnvVal('VITE_MINIO_BUCKET') || "midia-ctdi";
const accessKeyId = getEnvVal('VITE_MINIO_ACCESS_KEY') || "admin";
const secretAccessKey = getEnvVal('VITE_MINIO_SECRET_KEY') || "9e6014c2d78f6c84";

const s3Client = new S3Client({
  endpoint: endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true,
});

async function run() {
  console.log(`Configurando CORS no bucket "${bucketName}" em ${endpoint}...`);

  // Configurar política pública (Read-Only)
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: "*" },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  try {
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    }));
    console.log(`Política de acesso pública aplicada com sucesso.`);
  } catch (err) {
    console.error("Erro ao aplicar política pública:", err.message || err);
  }

  // Configurar regras de CORS (CORS simplificado compatível com MinIO)
  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["GET", "PUT", "POST", "DELETE"],
        AllowedOrigins: ["*"],
        MaxAgeSeconds: 3000
      }
    ]
  };

  try {
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    }));
    console.log(`CORS configurado com sucesso!`);
  } catch (err) {
    console.error("Erro ao configurar CORS:", err.message || err);
  }
}

run();
