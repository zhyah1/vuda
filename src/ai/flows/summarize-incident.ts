// SummarizeIncident.ts
'use server';

/**
 * @fileOverview Generates a concise AI-synthesized report of an incident,
 * including its potential impact and recommended actions, based on video feed analysis.
 *
 * - generateIncidentSummary - A function that generates a summary of an incident.
 * - GenerateIncidentSummaryInput - The input type for the generateIncidentSummary function.
 * - GenerateIncidentSummaryOutput - The return type for the generateIncidentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIncidentSummaryInputSchema = z.object({
  eventTitle: z.string().describe('The title of the incident.'),
  location: z.string().describe('The location of the incident.'),
  timestamp: z.string().describe('The timestamp of the incident.'),
  aiAnalysis: z.string().describe(
    'The detailed AI-driven analysis of the incident, primarily based on video feed understanding. This should include observed actions, objects, and any automatically detected anomaly tags (e.g., Physical_Assault, Weapon_Visible, Person_Collapsed).'
  ),
  actionsTaken: z.string().describe('The actions taken in response to the incident.'),
});
export type GenerateIncidentSummaryInput = z.infer<typeof GenerateIncidentSummaryInputSchema>;

const GenerateIncidentSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the incident, its potential impact, and recommended actions, derived from the video feed analysis and other inputs.'),
});
export type GenerateIncidentSummaryOutput = z.infer<typeof GenerateIncidentSummaryOutputSchema>;

export async function generateIncidentSummary(input: GenerateIncidentSummaryInput): Promise<GenerateIncidentSummaryOutput> {
  return generateIncidentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIncidentSummaryPrompt',
  input: {schema: GenerateIncidentSummaryInputSchema},
  output: {schema: GenerateIncidentSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes incidents for emergency response teams based on detailed video analysis and other available data.

  Given the following information about an incident, generate a concise summary of the incident, its potential impact, and recommended actions. Pay close attention to the AI Video Feed Analysis.

  Event Title: {{{eventTitle}}}
  Location: {{{location}}}
  Timestamp: {{{timestamp}}}
  AI Video Feed Analysis (including detected anomalies): {{{aiAnalysis}}}
  Actions Taken: {{{actionsTaken}}}

  Summary:`,
});

const generateIncidentSummaryFlow = ai.defineFlow(
  {
    name: 'generateIncidentSummaryFlow',
    inputSchema: GenerateIncidentSummaryInputSchema,
    outputSchema: GenerateIncidentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

