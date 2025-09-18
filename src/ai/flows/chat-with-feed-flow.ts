'use server';
/**
 * @fileOverview AI flow to chat about an incident based on its context.
 *
 * - chatWithFeed - A function that handles chat interactions regarding an incident.
 * - ChatWithFeedInput - The input type for the chatWithFeed function.
 * - ChatWithFeedOutput - The return type for the chatWithFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string(),
});

const IncidentContextSchema = z.object({
  title: z.string().describe('The title of the incident.'),
  location: z.string().describe('The location of the incident.'),
  timestamp: z.string().describe('The timestamp of the incident.'),
  initialAISystemAnalysis: z
    .string()
    .optional()
    .describe('The initial AI-driven analysis of the incident, including detected anomalies.'),
  generatedSummary: z
    .string()
    .optional()
    .describe('A previously AI-generated summary of the incident, if available.'),
});

const ChatWithFeedInputSchema = z.object({
  userQuestion: z.string().describe('The user_s current question about the incident.'),
  incidentContext: IncidentContextSchema.describe('The context of the incident being discussed.'),
  chatHistory: z.array(ChatMessageSchema).optional().describe('The recent history of the conversation.'),
});
export type ChatWithFeedInput = z.infer<typeof ChatWithFeedInputSchema>;

const ChatWithFeedOutputSchema = z.object({
  aiResponse: z.string().describe('The AI_s response to the user_s question based on the provided context and history.'),
});
export type ChatWithFeedOutput = z.infer<typeof ChatWithFeedOutputSchema>;

export async function chatWithFeed(input: ChatWithFeedInput): Promise<ChatWithFeedOutput> {
  return chatWithFeedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithFeedPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: ChatWithFeedInputSchema},
  output: {schema: ChatWithFeedOutputSchema},
  prompt: `You are a helpful AI assistant for the VUDA Public Safety Platform. You are interacting with an operator viewing an incident report.
Your goal is to answer questions about the incident based *only* on the information provided in the "Incident Context" and the "Chat History".
Do not make up information. If the answer is not in the provided context, say that you don't have that information. Be concise.

Incident Context:
Title: {{incidentContext.title}}
Location: {{incidentContext.location}}
Timestamp: {{incidentContext.timestamp}}
{{#if incidentContext.initialAISystemAnalysis}}Initial AI System Analysis: {{incidentContext.initialAISystemAnalysis}}{{/if}}
{{#if incidentContext.generatedSummary}}Previously Generated AI Summary: {{incidentContext.generatedSummary}}{{/if}}

Chat History:
{{#if chatHistory}}
  {{#each chatHistory}}
    User: {{this.text}}
  {{/each}}
{{else}}
  No previous messages in this conversation.
{{/if}}

Current User Question: {{userQuestion}}

AI Response:`,
});

const chatWithFeedFlow = ai.defineFlow(
  {
    name: 'chatWithFeedFlow',
    inputSchema: ChatWithFeedInputSchema,
    outputSchema: ChatWithFeedOutputSchema,
  },
  async (input) => {
    // Ensure chatHistory is not too long to avoid exceeding token limits
    const maxHistoryLength = 10; // Keep last 5 user messages and 5 AI responses
    if (input.chatHistory && input.chatHistory.length > maxHistoryLength) {
      input.chatHistory = input.chatHistory.slice(-maxHistoryLength);
    }

    const {output} = await prompt(input);
    if (!output || !output.aiResponse) {
      // Fallback or error handling if the model doesn't return the expected structure
      return { aiResponse: "I'm sorry, I couldn't process that request. Please try rephrasing." };
    }
    return output;
  }
);
