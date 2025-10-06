import { supabase } from "@/lib/supabase";
import { Queue } from "bullmq";
import { db } from "@/server/db";

interface FileUploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  url?: string;
}

const fileQueue = new Queue("file-upload-queue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});
export async function uploadToSupabase(
  file: File,
  userId: string,
): Promise<FileUploadResponse> {
  const safeFileName = file.name.replace(/[^\w.]/gi, "_");
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${new Date().getTime()}-${randomSuffix}-${safeFileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("files")
    .upload(key, file, {
      cacheControl: "3600",
      upsert: false,
      duplex: "half",
      metadata: {
        user_id: userId,
      },
    });

  if (uploadError || !uploadData) {
    console.error("Error uploading file to Supabase:", uploadError);
    throw new Error("Failed to upload file");
  }

  const dbFile = await db.file.create({
    data: {
      name: safeFileName,
      fileType: file.type || "application/octet-stream",
      supabaseFileId: uploadData.id,
      supabasePath: uploadData.path,
      size: file.size,
      userId,
    },
  });

  await fileQueue.add("file-ready", { fileId: dbFile.id });
  return {
    name: dbFile.name,
    size: dbFile.size,
    type: dbFile.fileType,
    path: dbFile.supabasePath,
    id: dbFile.id,
  };
}
