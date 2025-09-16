import { supabase } from "@/lib/supabase";
import { db } from "@/server/db";


interface FileUploadResponse {
    id: string;
    name: string;
    type: string;
    size: number;
    path: string;
    url?: string;
  }
export async function uploadToSupabase(
    file: File,
    userId: string,
  ): Promise<FileUploadResponse> {
    const safeFileName = file.name.replace(/[^\w.]/gi, "_");
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `${new Date().getTime()}-${randomSuffix}-${safeFileName}`;
  
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(key, file);
  
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
  
    return {
      name: dbFile.name,
      size: dbFile.size,
      type: dbFile.fileType,
      path: dbFile.supabasePath,
      id: dbFile.id,
    };
  }
  