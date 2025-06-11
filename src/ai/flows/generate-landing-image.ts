
'use server';
/**
 * @fileOverview A Genkit flow to generate a relevant image for the landing page.
 *
 * - generateLandingPageImage - A function that triggers the image generation.
 * - GenerateLandingPageImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLandingPageImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The AI-generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateLandingPageImageOutput = z.infer<typeof GenerateLandingPageImageOutputSchema>;

// Input schema is an empty object as the prompt is hardcoded for this specific use case.
const GenerateLandingPageImageInputSchema = z.object({});


export async function generateLandingPageImage(): Promise<GenerateLandingPageImageOutput> {
  // This function calls the Genkit flow.
  // It's good practice to have this wrapper.
  return generateLandingImageFlow({});
}

const generateLandingImageFlow = ai.defineFlow(
  {
    name: 'generateLandingImageFlow',
    inputSchema: GenerateLandingPageImageInputSchema,
    outputSchema: GenerateLandingPageImageOutputSchema,
  },
  async () => {
    const imagePrompt = "A futuristic and optimistic depiction of AI enhancing public safety in a smart city. Abstract, clean lines, with subtle visual cues of technology and community. Focus on a sense of security and advanced monitoring without being dystopian. Minimalist, high-tech aesthetic, cinematic lighting.";
    
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Ensure this model is correct and supports image generation
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must provide both TEXT and IMAGE
        },
      });

      if (!media?.url) {
        console.error('Image generation failed or returned no media URL from Genkit.');
        throw new Error('Image generation did not produce a valid media URL.');
      }
      return { imageDataUri: media.url };

    } catch (error) {
      console.error("Error in generateLandingImageFlow during AI generation:", error);
      // Propagate the error so the client-side can handle it
      throw error; 
    }
  }
);
