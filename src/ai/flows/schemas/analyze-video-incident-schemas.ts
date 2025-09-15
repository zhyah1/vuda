// src/ai/flows/schemas/analyze-video-incident-schemas.ts

/**
 * @fileOverview Schemas and types for the video incident analysis flow.
 * 
 * - AnalyzeVideoIncidentInputSchema - Zod schema for the input.
 * - AnalyzeVideoIncidentInput - The TypeScript type for the input.
 * - AnalyzeVideoIncidentOutputSchema - Zod schema for the output.
 * - AnalyzeVideoIncidentOutput - The TypeScript type for the output.
 * - DEPARTMENTS_LIST - A constant list of department names.
 */

import { z } from 'genkit';

export const DEPARTMENTS_LIST = ['Police', 'Fireforce', 'MVD', 'EMS', 'Disaster Management', 'Event Security', 'City Transit Authority', 'Public Works', 'Animal Control'];

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
