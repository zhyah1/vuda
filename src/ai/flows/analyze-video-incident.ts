// src/ai/flows/analyze-video-incident.ts
'use server';

/**
 * @fileOverview Analyzes a video of an incident, generates a report, and suggests a response department.
 * 
 * - analyzeVideoIncident - A function that handles the video analysis.
 * - AnalyzeVideoIncidentInput - The input type for the function.
 * - AnalyzeVideoIncidentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DEPARTMENTS_LIST = ['Police', 'Fireforce', 'MVD', 'EMS', 'Disaster Management', 'Event Security', 'City Transit Authority', 'Public Works', 'Animal Control'];

export const AnalyzeVideoIncidentInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of an incident, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVideoIncidentInput = z.infer<typeof AnalyzeVideoIncidentInputSchema>;

export const AnalyzeVideoIncidentOutputSchema = z.object({
  report: z.string().describe('A concise report summarizing the events in the video.'),
  incidentType: z.string().describe('The classified type of the incident (e.g., Traffic Accident, Fire, Medical Emergency).'),
  suggestedDepartment: z.enum(DEPARTMENTS_LIST as [string, ...string[]]).describe('The single most appropriate department to handle this incident from the provided list.'),
});
export type AnalyzeVideoIncidentOutput = z.infer<typeof AnalyzeVideoIncidentOutputSchema>;

export async function analyzeVideoIncident(input: AnalyzeVideoIncidentInput): Promise<AnalyzeVideoIncidentOutput> {
  return analyzeVideoIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVideoIncidentPrompt',
  model: 'googleai/gemini-1.5-flash', // A model that supports video
  input: { schema: AnalyzeVideoIncidentInputSchema },
  output: { schema: AnalyzeVideoIncidentOutputSchema },
  prompt: `You are an AI assistant for a public safety platform. Your task is to analyze the provided video of an incident.
  
Watch the video carefully and provide the following information in the specified JSON format:
1.  **report**: A clear and concise summary of what is happening in the video. Describe the key events, people, objects, and the environment.
2.  **incidentType**: Classify the incident into one of the following categories: Violent Crime, Medical Emergency, Fire Alert, Traffic Accident, Suspicious Activity, Public Safety Threat, or Other.
3.  **suggestedDepartment**: Based on your analysis, suggest the single most appropriate department to handle this incident. Choose one from the following list: ${DEPARTMENTS_LIST.join(', ')}.

Video to analyze:
{{media url=videoDataUri}}
`,
});

const analyzeVideoIncidentFlow = ai.defineFlow(
  {
    name: 'analyzeVideoIncidentFlow',
    inputSchema: AnalyzeVideoIncidentInputSchema,
    outputSchema: AnalyzeVideoIncidentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
