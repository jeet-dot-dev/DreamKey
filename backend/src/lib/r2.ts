import { randomUUID } from "crypto";
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
	throw new Error("Missing R2 environment variables");
}

export const r2Client = new S3Client({
	region: "auto",
	endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
	forcePathStyle: true,
});

export const R2_BUCKET_NAME = bucketName;

export function createR2ObjectKey(params: {
	folder: string;
	fileName: string;
}) {
	const safeName = params.fileName
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

	return `${params.folder}/${Date.now()}-${randomUUID()}-${safeName}`;
}

export function getR2ObjectUrl(objectKey: string) {
	if (!publicBaseUrl) {
		return null;
	}

	const baseUrl = publicBaseUrl.replace(/\/$/, "");
	return `${baseUrl}/${objectKey}`;
}

export async function createR2UploadUrl(params: {
	objectKey: string;
	contentType: string;
	expiresInSeconds?: number;
}) {
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: params.objectKey,
		ContentType: params.contentType,
	});

	const url = await getSignedUrl(r2Client, command, {
		expiresIn: params.expiresInSeconds ?? 900,
	});

	return url;
}

export async function deleteR2Object(objectKey: string) {
	await r2Client.send(
		new DeleteObjectCommand({
			Bucket: bucketName,
			Key: objectKey,
		})
	);
}
