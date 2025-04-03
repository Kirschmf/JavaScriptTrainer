// AI service for code-related AI features

/**
 * Request code completion from the AI service
 * @param code The current code in the editor
 * @param position The cursor position
 * @param language The programming language (defaults to javascript)
 * @returns The code completion suggestion
 */
export async function getCodeCompletion(
  code: string,
  position: { lineNumber: number; column: number },
  language = 'javascript'
): Promise<{ completion: string; isComplete: boolean }> {
  try {
    // Convert Monaco editor position to character offset
    const lines = code.split('\n');
    let offset = 0;
    
    for (let i = 0; i < position.lineNumber - 1; i++) {
      offset += lines[i].length + 1; // +1 for newline character
    }
    
    offset += position.column - 1;
    
    // Call API endpoint for completion
    const response = await fetch('/api/ai/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        position: offset,
        language
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return { 
      completion: data.completion || '', 
      isComplete: true
    };
  } catch (error) {
    console.error('Error getting code completion:', error);
    return { completion: '', isComplete: true };
  }
}

/**
 * Use AI to explain a JavaScript code snippet
 * @param code The code to explain
 * @returns A detailed explanation of the code
 */
export async function explainCode(code: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      throw new Error(`AI explanation request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.explanation || 'No explanation was generated.';
  } catch (error) {
    console.error('Error explaining code:', error);
    return 'Sorry, I could not generate an explanation at this time.';
  }
}

/**
 * Use AI to improve or refactor code
 * @param code The code to improve
 * @param instructions Optional specific instructions for improvement
 * @returns Improved version of the code with explanation
 */
export async function improveCode(code: string, instructions?: string): Promise<{ 
  improvedCode: string; 
  explanation: string;
}> {
  try {
    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code,
        instructions: instructions || 'Make this code more efficient and follow best practices'
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI code improvement request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return {
      improvedCode: data.improvedCode || code,
      explanation: data.explanation || 'No explanation provided.'
    };
  } catch (error) {
    console.error('Error improving code:', error);
    return { 
      improvedCode: code, 
      explanation: 'Sorry, I could not improve the code at this time. Please try again later.'
    };
  }
}

/**
 * Generate code examples based on a description
 * @param description Description of what the code should do
 * @param language Programming language (defaults to javascript)
 * @returns Generated code example
 */
export async function generateCodeExample(description: string, language = 'javascript'): Promise<string> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, language })
    });
    
    if (!response.ok) {
      throw new Error(`AI code generation request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.code || '// No code example was generated.';
  } catch (error) {
    console.error('Error generating code example:', error);
    return '// Sorry, I could not generate an example at this time.\n// Please try again with a different description.';
  }
}

/**
 * Use AI to debug code
 * @param code The code with issues
 * @param error The error message if available
 * @returns Debugging suggestions and fixed code
 */
export async function debugCode(code: string, error?: string): Promise<{ 
  fixedCode: string; 
  explanation: string;
}> {
  try {
    const response = await fetch('/api/ai/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, error })
    });
    
    if (!response.ok) {
      throw new Error(`AI debugging request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return {
      fixedCode: data.fixedCode || code,
      explanation: data.explanation || 'No debugging information was provided.'
    };
  } catch (error) {
    console.error('Error debugging code:', error);
    return { 
      fixedCode: code, 
      explanation: 'Sorry, I could not debug the code at this time. Please check your syntax manually.'
    };
  }
}