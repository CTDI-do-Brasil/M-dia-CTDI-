import https from 'https';

const endpoints = [
  "https://s3.ctdibrasil.com.br",
  "https://minio-api.ctdibrasil.com.br",
  "https://s3-api.ctdibrasil.com.br",
  "https://api-minio.ctdibrasil.com.br",
  "https://minio-s3.ctdibrasil.com.br"
];

function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (data.includes('AccessDenied') || data.includes('ListBucketResult') || res.statusCode === 403) {
          console.log(`[SUCESSO] ${url} respondeu com Status: ${res.statusCode} -> API S3 VÁLIDA!`);
          resolve({ url, works: true, isS3: true });
        } else {
          resolve({ url, works: true, isS3: false });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ url, works: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, works: false });
    });
  });
}

async function run() {
  console.log("Testando subdomínios comuns de API S3...");
  for (const ep of endpoints) {
    const res = await testEndpoint(ep);
    if (res.isS3) {
      console.log(`\n🎉 ENCONTRADO! O endpoint da API S3 é: ${res.url}`);
      return;
    }
  }
  console.log("Nenhum subdomínio comum respondeu como API S3.");
}

run();
