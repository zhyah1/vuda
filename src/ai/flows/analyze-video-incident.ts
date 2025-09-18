
// src/ai/flows/analyze-video-incident.ts
'use server';

/**
 * @fileOverview Analyzes a video of an incident, identifies the most significant anomaly, and reports it.
 * 
 * - analyzeVideoIncident - A function that handles the video analysis.
 */

import { ai } from '@/ai/genkit';
import { 
  AnalyzeVideoIncidentInputSchema, 
  type AnalyzeVideoIncidentInput,
  AnalyzeVideoIncidentOutputSchema, 
  type AnalyzeVideoIncidentOutput,
  ANOMALY_DEFINITIONS
} from './schemas/analyze-video-incident-schemas';

export async function analyzeVideoIncident(input: AnalyzeVideoIncidentInput): Promise<AnalyzeVideoIncidentOutput> {
  return analyzeVideoIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVideoIncidentPrompt',
  model: 'googleai/gemini-2.5-flash-lite', // A model that supports video
  input: { schema: AnalyzeVideoIncidentInputSchema },
  output: { schema: AnalyzeVideoIncidentOutputSchema },
  prompt: `You are an AI public safety monitoring system. Your ONLY task is to analyze the provided video and determine if it contains any of the predefined anomalies listed below.

Watch the entire video carefully. Identify the SINGLE most critical and significant anomaly present. If you observe a large number of people congregated in a single area, you should identify this as a 'Crowd_Gathering'.

If a significant anomaly is detected, set "isSignificant" to true and set "incidentType" to the corresponding anomaly key (e.g., "Physical_Assault").
If the video shows normal, everyday activity with no threats or emergencies, set "isSignificant" to false and set "incidentType" to "Normal_Activity".

Do not provide a descriptive report. Your response must be only the JSON object with the two specified fields.

Anomaly Definitions:
---
${ANOMALY_DEFINITIONS}
---

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
     // Add a check for the output structure itself
    if (typeof output.isSignificant !== 'boolean' || typeof output.incidentType !== 'string') {
      throw new Error('The AI model returned an invalid data structure.');
    }
    return output;
  }
);
