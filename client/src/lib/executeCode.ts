import { apiRequest } from "./queryClient";

export interface ExecutionResult {
  result: any;
  logs: string[];
  errors: string[];
  warnings: string[];
  infos: string[];
  error: {
    name: string;
    message: string;
    stack?: string;
  } | null;
  executionTime: number;
}

export const executeCode = async (
  code: string, 
  snippetId?: number
): Promise<ExecutionResult> => {
  try {
    const response = await apiRequest("POST", "/api/execute", {
      code,
      snippetId
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error executing code:", error);
    throw new Error("Failed to execute code");
  }
};
