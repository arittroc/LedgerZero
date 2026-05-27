import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface ExtractedInvoice {
  clientName: string;
  amount: number;
  dueDate: string;
}

export async function extractInvoiceData(file: File): Promise<ExtractedInvoice | null> {
  try {
    // 1. Convert File to base64 for the AI SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "application/octet-stream";

    // 2. Prepare the prompt
    const prompt = `You are a financial extraction agent. Analyze this file (image, text, or CSV) and extract the invoice details. 
    You MUST return ONLY a raw JSON object with exactly these keys: 
    "clientName" (string), 
    "amount" (number, strictly positive float), 
    "dueDate" (string in YYYY-MM-DD format). 
    
    Rules:
    - If a date is missing, use today's date (${new Date().toISOString().split('T')[0]}). 
    - If a client name is missing, use 'Unknown Client'. 
    - Do not include markdown formatting like \`\`\`json or any other text. 
    - Only return the JSON object.`;

    // 3. Call Gemini 1.5 Flash
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    // 4. Parse and Validate JSON
    // Sometimes the AI might still include markdown even if told not to
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const extracted = JSON.parse(jsonString) as ExtractedInvoice;

    // Basic Validation
    if (!extracted.clientName || typeof extracted.amount !== "number" || isNaN(extracted.amount)) {
      throw new Error("Invalid data structure extracted from AI.");
    }

    return {
      clientName: extracted.clientName || "Unknown Client",
      amount: Math.abs(extracted.amount),
      dueDate: extracted.dueDate || new Date().toISOString().split('T')[0],
    };

  } catch (error) {
    console.error("AI Extraction Error:", error);
    return null;
  }
}
