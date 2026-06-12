import fs from 'fs';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Ler arquivo .env manualmente
const envContent = fs.readFileSync('.env', 'utf8');
const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : '';
};

const endpoint = getEnvVal('VITE_MINIO_ENDPOINT') || "http://127.0.0.1:9000";
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
  console.log(`Listando objetos no bucket "${bucketName}" em ${endpoint}...`);
  try {
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    if (!data.Contents || data.Contents.length === 0) {
      console.log("Nenhum objeto encontrado no bucket.");
    } else {
      console.log(`Encontrado(s) ${data.Contents.length} objeto(s):`);
      data.Contents.forEach((obj) => {
        console.log(`- ${obj.Key} (Tamanho: ${obj.Size} bytes)`);
      });
    }
  } catch (err) {
    console.error("Erro ao listar objetos:", err.message || err);
  }
}

run();
