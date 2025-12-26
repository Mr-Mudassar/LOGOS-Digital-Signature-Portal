import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
  },
})

export async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'application/pdf'
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME

  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  const key = `contracts/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL removed - bucket must be configured with public access policy
  })

  await s3Client.send(command)

  // Return the S3 URL
  const region = process.env.AWS_S3_REGION || 'us-east-1'
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
}

export async function uploadToS3WithRetry(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'application/pdf',
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadToS3(buffer, fileName, contentType)
    } catch (error) {
      lastError = error as Error
      console.error(`S3 upload attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Failed to upload to S3 after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  )
}
