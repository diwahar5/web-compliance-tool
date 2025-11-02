import { GoogleGenAI, Type } from "@google/genai";
import type { Violation } from "../types";

// FIX: Initialize GoogleGenAI with the API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (violation: Violation, framework: string): string => {
    let framework_instructions = '';
    if (violation.type === 'No Mechanism for Data Subject Rights (DSAR)' && framework === 'React') {
        framework_instructions = `
        - For React, generate a complete, self-contained, and stylish UI component in a single .tsx file.
        - The component should provide a basic form for users to submit DSAR requests.
        - Use Tailwind CSS for modern and clean styling.
        - Ensure the component is functional and includes placeholders for API submission logic.
        `;
    } else if (framework === 'HTML') {
        framework_instructions = `
        - For HTML, generate a clean, well-structured snippet.
        - The HTML must be properly indented with 2 spaces for readability.
        - Include comments where necessary to explain complex parts.
        - Ensure the code is ready to be copied and pasted directly into an existing HTML file.
        `;
    } else {
        framework_instructions = `
        - The code should be clean, efficient, and follow best practices for the specified framework/language.
        - For simple fixes like setting a cookie, provide the direct JavaScript command.
        `;
    }
    const getElementContextLine = (): string => {
        if (!violation.element) {
            return '';
        }
        let context_prefix = 'Affected Element/Context:';
        if (violation.type.toLowerCase().includes('cookie')) {
            context_prefix = 'Affected Cookie:';
        } else if (violation.type.toLowerCase().includes('script')) {
            context_prefix = 'Affected Script Source:';
        }
        return `- ${context_prefix} ${violation.element}`;
    }
    return `
        You are an expert AI developer creating code for a local development environment like VS Code. Your specialization is in web compliance and privacy law (GDPR, CCPA).
        Your task is to generate a production-ready, complete code file and a guide to fix a web compliance violation.

        Violation Details:
        - Type: ${violation.type}
        - Description: ${violation.description}
        ${getElementContextLine()}
        - Relevant Law(s): ${violation.law}
        - Recommendation: ${violation.recommendation}
        - Target Framework/Language: ${framework}

        Instructions:
        1.  Create a 'code' block containing a complete, self-contained code snippet. For frameworks like React, this should be a full component file including necessary imports and exports, ready to be saved as a .tsx file.
        2.  Ensure the generated code is well-formatted with proper indentation (using 2 spaces) for readability.
        3.  Create a 'guide' block with concise markdown bullet points explaining:
            - The purpose of the generated code.
            - How to integrate the code into a project.
            - Any necessary dependencies to install (e.g., using npm or yarn).
        4.  ${framework_instructions}

        Return ONLY a raw JSON object with the keys "code" and "guide".
    `.trim();
};

export const generateCodeFix = async (violation: Violation, framework: string): Promise<{code: string, guide: string}> => {
    const fallbackResponse = {
      code: `// Could not generate code for ${framework}.`,
      guide: `// No guide available. Please check your Gemini API key and network status.`
    };
    try {
        const prompt = generatePrompt(violation, framework);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        code: { type: Type.STRING },
                        guide: { type: Type.STRING }
                    },
                    required: ["code", "guide"],
                },
            },
        });
        const jsonString = response.text;
        if (jsonString) {
          // The response might contain markdown fences for JSON, which need to be stripped.
          const cleanedJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedJson);
          return parsed;
        }
        return fallbackResponse;
    } catch (error) {
        console.error("Error generating code fix with Gemini API:", error);
        return {
            code: `// Error generating code fix.`,
            guide: `// ${error instanceof Error ? error.message : String(error)}`
        };
    }
};
