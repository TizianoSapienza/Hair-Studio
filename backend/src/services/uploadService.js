import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

const s3 = new S3Client({
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
});

export async function createPresignedUpload({ folder, contentType, extension }) {
  const key = `${folder}/${randomUUID()}.${extension}`;
  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const publicUrl = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`;
  return { uploadUrl, publicUrl };
}

export async function listUploads(folder) {
  const { Contents } = await s3.send(
    new ListObjectsV2Command({ Bucket: env.s3.bucket, Prefix: `${folder}/`, MaxKeys: 100 })
  );
  return (Contents || [])
    .sort((a, b) => b.LastModified - a.LastModified)
    .map((obj) => ({
      key: obj.Key,
      url: `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${obj.Key}`,
      lastModified: obj.LastModified,
    }));
}
