/**
 * Request code completion from the AI service
 * @param code The current code in the editor
 * @param position The cursor position
 * @param language The programming language (defaults to javascript)
 * @returns The code completion suggestion
 */
export async function getCodeCompletion(
  code: string,
  position: number,
  language: string = "javascript"
): Promise<string> {
  try {
    const response = await fetch("/api/ai/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        position,
        language,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.completion || "";
  } catch (error) {
    console.error("Error getting AI completion:", error);
    return "";
  }
}