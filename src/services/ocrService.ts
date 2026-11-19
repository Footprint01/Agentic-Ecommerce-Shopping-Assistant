import Tesseract from 'tesseract.js';

export const processShoppingListImage = async (imageFile: File): Promise<string[]> => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageFile,
      'eng',
      { logger: m => console.log(m) }
    );

    // Split text by newlines and filter empty lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);

    // Basic cleaning to remove numbers/bullets (e.g., "1. Milk" -> "Milk")
    const cleanedItems = lines.map(line => {
      return line.replace(/^[\d\-\.\)]+\s*/, '').trim();
    });

    return cleanedItems;
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to process image.");
  }
};
