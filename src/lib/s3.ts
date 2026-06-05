import { S3Client } from "@aws-sdk/client-s3";

const s3Config = {
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};

if (
  !s3Config.region ||
  !s3Config.endpoint ||
  !s3Config.accessKeyId ||
  !s3Config.secretAccessKey
) {
  throw new Error("Missing S3 credentials");
}

export const s3 = new S3Client({
  region: s3Config.region,
  endpoint: s3Config.endpoint,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
  forcePathStyle: true,
});
