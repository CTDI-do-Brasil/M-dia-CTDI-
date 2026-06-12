import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Configurações do MinIO carregadas de variáveis de ambiente do Vite
const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || "https://minio-api.ctdibrasil.com.br";
const bucketName = import.meta.env.VITE_MINIO_BUCKET || "midia-ctdi";
const accessKeyId = import.meta.env.VITE_MINIO_ACCESS_KEY || "admin";
const secretAccessKey = import.meta.env.VITE_MINIO_SECRET_KEY || "9e6014c2d78f6c84";

// Inicializa o cliente S3 configurado para o MinIO
const s3Client = new S3Client({
  endpoint: endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Faz o upload de um arquivo para o MinIO acompanhando o progresso
 * @param file O arquivo a ser enviado
 * @param onProgress Callback opcional para receber o percentual de progresso (0 a 100)
 * @returns A URL pública para acessar a mídia
 */
export const uploadFileToMinIO = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const fileKey = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    },
    partSize: 5 * 1024 * 1024, // Pedaços de 5MB
    queueSize: 3, // Concorrência máxima
  });

  if (onProgress) {
    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        onProgress(percent);
      }
    });
  }

  await upload.done();

  // Retorna a URL pública de acesso à mídia
  return `${endpoint}/${bucketName}/${fileKey}`;
};
