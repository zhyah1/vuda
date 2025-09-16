
// src/ai/flows/analyze-video-incident.ts
'use server';

/**
 * @fileOverview Analyzes a video of an incident, generates a report, and suggests a response department.
 * 
 * - analyzeVideoIncident - A function that handles the video analysis.
 */

import { ai } from '@/ai/genkit';
import { 
  AnalyzeVideoIncidentInputSchema, 
  type AnalyzeVideoIncidentInput,
  AnalyzeVideoIncidentOutputSchema, 
  type AnalyzeVideoIncidentOutput,
  DEPARTMENTS_LIST 
} from './schemas/analyze-video-incident-schemas';

export async function analyzeVideoIncident(input: AnalyzeVideoIncidentInput): Promise<AnalyzeVideoIncidentOutput> {
  return analyzeVideoIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVideoIncidentPrompt',
  model: 'googleai/gemini-1.5-flash', // A model that supports video
  input: { schema: AnalyzeVideoIncidentInputSchema },
  output: { schema: AnalyzeVideoIncidentOutputSchema },
  prompt: `You are an AI assistant for a public safety platform. Your task is to analyze the provided video of an incident.
  
Watch the entire video carefully and provide the following information in the specified JSON format:
1.  **report**: A clear and concise summary of what is happening in the video. Describe the key events, people, objects, and the environment from the whole video.
2.  **incidentType**: Classify the most significant event in the video into one of the following categories: Violent Crime, Medical Emergency, Fire Alert, Traffic Accident, Suspicious Activity, Public Safety Threat, or Other. If nothing significant is happening, classify as 'Normal'.
3.  **suggestedDepartment**: Based on your analysis, suggest the single most appropriate department to handle this incident. Choose one from the following list: ${DEPARTMENTS_LIST.join(', ')}. If 'Normal', suggest 'None'.

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
