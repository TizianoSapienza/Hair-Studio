import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  databaseUrl: required("DATABASE_URL"),
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessTtlMinutes: Number(process.env.JWT_ACCESS_TTL_MINUTES || 15),
    refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS || 30),
  },
  bcryptCost: Number(process.env.BCRYPT_COST || 12),
  s3: {
    bucket: required("S3_BUCKET"),
    region: required("S3_REGION"),
    accessKeyId: required("S3_ACCESS_KEY_ID"),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
  },
};

export const isProduction = env.nodeEnv === "production";
