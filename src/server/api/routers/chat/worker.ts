import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HfInference } from "@huggingface/inference";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { supabase } from "@/lib/supabase";

interface FileJobData {
  fileId: string;
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
});

const collectionName = "document-embeddings-hf";

const ensureCollectionExists = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (collection) => collection.name === collectionName,
    );

    if (!collectionExists) {
      console.log(`Collection "${collectionName}" not found. Creating it...`);
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 384,
          distance: "Cosine",
        },
      });
    } else {
      console.log(`Collection "${collectionName}" already exists.`);
    }
  } catch (error) {
    console.error("Error ensuring collection exists:", error);
    process.exit(1);
  }
};

const worker = new Worker<FileJobData>(
  "file-upload-queue",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const { fileId } = job.data;

    const fileRecord = await db.file.findUnique({ where: { id: fileId } });
    if (!fileRecord) {
      throw new Error(`File with ID ${fileId} not found in the database.`);
    }

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("files")
      .download(fileRecord.supabasePath);

    if (downloadError || !fileBlob) {
      throw new Error(
        `Failed to download file from Supabase: ${fileRecord.supabasePath}`,
      );
    }

    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(docs);

    const texts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = (await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: texts,
    })) as number[][];

    console.log(`Generated ${embeddings.length} embeddings.`);
    const points = chunks.map((chunk, index) => {
      const metadata = chunk.metadata as { pageNumber?: number } | undefined;
      const pageNumber =
        metadata && typeof metadata.pageNumber === "number"
          ? metadata.pageNumber
          : index + 1;
      const vector = embeddings[index];
      if (!vector) {
        throw new Error(`Missing embedding for chunk ${index}`);
      }
      return {
        id: uuidv4(),
        vector,
        payload: {
          ...chunk.metadata,
          content: chunk.pageContent,
          fileId,
          loc: { pageNumber },
        },
      };
    });

    await qdrantClient.upsert(collectionName, { points });

    console.log(
      ` Successfully processed and stored HF embeddings for file ID: ${fileId}`,
    );
  },
  {
    concurrency: 10,
    connection: {
      host: process.env.REDIS_HOST ?? "localhost",
      port: parseInt(process.env.REDIS_PORT ?? "6379"),
    },
  },
);

ensureCollectionExists()
  .then(() => {
    console.log("Worker is listening for jobs...");
  })
  .catch((error) => {
    console.error("Failed to ensure collection exists:", error);
  });
