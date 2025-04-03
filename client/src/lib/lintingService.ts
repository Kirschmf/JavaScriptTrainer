// Import necessary libraries for code linting and formatting
import * as prettier from 'prettier';
import * as jsBeautify from 'js-beautify';

// Define interfaces for our linting results
export interface LintingResult {
  errors: {
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
    ruleId?: string;
  }[];
}

export interface CodeErrorAnnotation {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: 1 | 2 | 3 | 4 | 8; // Monaco severity levels: 1=Error, 2=Warning, 3=Info, 8=Hint
}

/**
 * Lint code using a simple syntax check
 * Note: For a production app, we'd use ESLint, but for our project
 * we'll use a simpler approach to avoid TypeScript errors
 */
export async function lintCode(code: string): Promise<LintingResult> {
  try {
    const errors: LintingResult['errors'] = [];
    
    // Basic syntax check using Function constructor
    try {
      // This will throw an error if there's a syntax issue
      new Function(code);
    } catch (syntaxError: any) {
      // Try to extract line and column from error message
      const errorMsg = syntaxError.toString();
      const lineMatch = errorMsg.match(/line\s+(\d+)/i);
      const colMatch = errorMsg.match(/column\s+(\d+)/i);
      
      errors.push({
        line: lineMatch ? parseInt(lineMatch[1], 10) : 1,
        column: colMatch ? parseInt(colMatch[1], 10) : 1,
        message: errorMsg,
        severity: 'error',
        ruleId: 'syntax-error'
      });
    }
    
    // Very basic checks for common JavaScript issues
    const lines = code.split('\n');
    lines.forEach((line, i) => {
      // Check for var (suggest using let/const)
      if (line.match(/\bvar\s+/)) {
        errors.push({
          line: i + 1,
          column: line.indexOf('var') + 1,
          message: 'Consider using let or const instead of var',
          severity: 'warning',
          ruleId: 'no-var'
        });
      }
      
      // Check for console.log in code (might be unintentional)
      if (line.match(/console\.log\(/)) {
        errors.push({
          line: i + 1,
          column: line.indexOf('console.log') + 1,
          message: 'Console statement found',
          severity: 'warning',
          ruleId: 'no-console'
        });
      }
      
      // Check for potential unused variables (very basic check)
      const varDeclaration = line.match(/\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (varDeclaration) {
        const varName = varDeclaration[2];
        if (code.split(varName).length === 2) { // If variable name appears only once
          errors.push({
            line: i + 1,
            column: line.indexOf(varName) + 1,
            message: `'${varName}' is declared but never used`,
            severity: 'warning',
            ruleId: 'no-unused-vars'
          });
        }
      }
    });
    
    return { errors };
  } catch (error) {
    console.error('Error linting code:', error);
    return { errors: [] };
  }
}

/**
 * Format code using Prettier
 */
export async function formatCode(code: string, parser = 'babel'): Promise<string> {
  try {
    const formattedCode = await prettier.format(code, {
      parser,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2,
    });
    return formattedCode;
  } catch (error) {
    console.error('Error formatting with prettier:', error);
    
    // Fallback to js-beautify if prettier fails
    try {
      return jsBeautify.js_beautify(code, {
        indent_size: 2,
        space_in_empty_paren: true,
      });
    } catch (fallbackError) {
      console.error('Fallback formatter also failed:', fallbackError);
      return code; // Return the original code if both formatters fail
    }
  }
}

/**
 * Convert linting errors to Monaco editor annotations
 */
export function convertToEditorAnnotations(lintingResult: LintingResult): CodeErrorAnnotation[] {
  return lintingResult.errors.map(error => ({
    startLineNumber: error.line,
    startColumn: error.column,
    endLineNumber: error.line,
    endColumn: error.column + 1,
    message: `${error.message} ${error.ruleId ? `(${error.ruleId})` : ''}`,
    severity: error.severity === 'error' ? 1 : 2,
  }));
}

/**
 * Detect code style (Standard, Airbnb, etc.) and provide suggestions
 */
export function detectCodeStyle(code: string): string {
  // This is a simplified version. In a real implementation, we would
  // analyze multiple aspects of the code style
  if (code.includes('var ')) {
    return 'Legacy - consider using let/const instead of var';
  } else if (code.includes('function (') && !code.includes('=>')) {
    return 'Traditional - consider using arrow functions';
  } else if (code.includes('async/await')) {
    return 'Modern - good use of async/await';
  } else if (code.includes('=>')) {
    return 'ES6+ - good use of arrow functions';
  } else {
    return 'Unknown';
  }
}