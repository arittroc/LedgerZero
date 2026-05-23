export const runtime = 'edge';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define the expected schema for the AI extraction
const InvoiceSchema = z.object({
  clientName: z.string().describe("The name of the vendor, company, or person who issued the document."),
  totalAmount: z.number().describe("The final total amount due on the invoice."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("The due date in YYYY-MM-DD format."),
  items: z.array(z.object({
    description: z.string().describe("Brief description of the service or product."),
    quantity: z.number().describe("The number of units."),
    unitPrice: z.number().describe("The price per single unit.")
  })).describe("A list of line items found on the invoice.")
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Select Gemini 1.5 Flash for high-speed, high-accuracy vision processing
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64 for the Gemini SDK
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");

    const prompt = `
      You are a specialized OCR and financial data extraction engine for LedgerZero.
      Analyze the provided image of an invoice, bill, or receipt and extract the details with 100% accuracy.
      
      Return ONLY a JSON object that strictly adheres to this structure:
      {
        "clientName": "String",
        "totalAmount": Number,
        "dueDate": "YYYY-MM-DD",
        "items": [
          { "description": "String", "quantity": Number, "unitPrice": Number }
        ]
      }

      Guidelines:
      - If the due date is not explicitly found, estimate it based on the issue date or set it to 30 days from now.
      - Ensure 'totalAmount' and 'unitPrice' are numbers, not strings.
      - If quantities are missing, default to 1.
      - If items are not clear, create a single item summarizing the total.

      Do not include any preamble, markdown formatting, or explanation. Return raw JSON only.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    
    // Clean potential AI markdown wrappers
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const extractedData = JSON.parse(jsonString);
      
      // Validate with Zod to ensure type safety before returning to the UI
      const validatedData = InvoiceSchema.parse(extractedData);
      
      return NextResponse.json(validatedData);
    } catch (parseError) {
      console.error("AI Response Parsing Error:", responseText);
      return NextResponse.json({ 
        error: "AI returned unreadable data. Please ensure the image is clear and try again.",
        raw: responseText 
      }, { status: 422 });
    }

  } catch (error) {
    console.error("OCR Extraction Critical Error:", error);
    return NextResponse.json({ error: "Service currently unavailable. Please try manual entry." }, { status: 500 });
  }
}
