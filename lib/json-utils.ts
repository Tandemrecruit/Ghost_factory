/**
 * JSON parsing utilities with proper error logging.
 */

/**
 * Read and parse a JSON file with proper error logging.
 * 
 * @param filePath - Path to the JSON file
 * @param defaultValue - Default value to return on error (default: [])
 * @returns Parsed JSON data or default value on error
 */
export async function readJsonFile(
  filePath: string,
  defaultValue: any = []
): Promise<any> {
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
    // Log error with file path for debugging
    console.error(
      `[JSON Parse Error] Failed to read/parse ${filePath}: ${errorName} - ${errorMessage}`
    );
    
    return defaultValue;
  }
}

