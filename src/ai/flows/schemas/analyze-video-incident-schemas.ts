
// src/ai/flows/schemas/analyze-video-incident-schemas.ts

/**
 * @fileOverview Schemas and types for the video incident analysis flow.
 * 
 * - AnalyzeVideoIncidentInputSchema - Zod schema for the input.
 * - AnalyzeVideoIncidentInput - The TypeScript type for the input.
 * - AnalyzeVideoIncidentOutputSchema - Zod schema for the output.
 * - AnalyzeVideoIncidentOutput - The TypeScript type for the output.
 * - ANOMALY_DEFINITIONS - A constant list of anomaly keys and descriptions.
 */

import { z } from 'genkit';

export const ANOMALY_DEFINITIONS = `
1. Violence & Aggression
   - Physical_Assault: One or more people physically attacking another.
   - Weapon_Visible: A knife, gun, or other weapon is clearly visible.
   - Fighting: A group or individuals engaged in a brawl.
   - Hostage_Situation: Someone being held against their will.
   - Domestic_Violence: Physical altercation in a domestic setting.

2. Medical Emergencies
   - Person_Collapsed: A person suddenly falling or lying unresponsive.
   - Seizure_Activity: Someone exhibiting seizure-like movements.
   - Unconscious_Person: A person who is not moving and appears unconscious.
   - Excessive_Bleeding: Visible signs of significant blood loss.
   - Overdose_Suspected: Signs of a potential drug overdose.

3. Public Safety Threats
   - Crowd_Stampede: A large crowd moving in a panicked, uncontrolled manner.
   - Riots_Or_Protest_Violence: A protest that has turned violent, with property damage or fighting.
   - Vandalism_In_Progress: Active destruction or defacement of property.
   - Arson: The act of deliberately setting fire to property.
   - Explosion_Or_Smoke: A sudden explosion or a large volume of smoke indicating a potential fire.

4. Suspicious Behavior
   - Loitering_With_Intent: Lingering in a sensitive area with no clear purpose.
   - Unauthorized_Access: Entering a restricted zone.
   - Stalking_Behavior: Following someone persistently.
   - Abandoned_Baggage: A bag or package left unattended in a high-traffic area.
   - Drug_Deal_Suspected: Behavior indicative of an illegal drug transaction.

5. Traffic & Road Incidents
   - Reckless_Driving: A vehicle being driven in a highly dangerous manner.
   - Hit_And_Run: A vehicle collision where one party leaves the scene.
   - Pedestrian_In_Danger: A pedestrian at immediate risk of being hit by a vehicle.
   - Accident_With_Injuries: A traffic accident where people are visibly injured.
   - Drunk_Person_Driving: A person exhibiting signs of intoxication while operating a vehicle.

6. Theft & Crime
   - Shoplifting: Concealing store items with the intent to steal.
   - Pickpocketing: Stealing from a person's pocket or bag.
   - Burglary_In_Progress: Unlawful entry into a building with intent to commit a crime.
   - Car_Theft: The act of stealing a motor vehicle.
   - Robbery: Forcibly taking property from another person.

7. Fire & Hazards
   - Fire_Outbreak: Visible flames indicating an uncontrolled fire.
   - Gas_Leak_Suspected: Signs that might indicate a gas leak (e.g., people reacting).
   - Electrical_Spark_Hazard: Visible and dangerous electrical arcing.
   - Flammable_Materials_Exposed: Improperly stored or handled flammable materials posing a risk.

8. Child & Vulnerable Person Alerts
   - Lost_Child: A young child appearing alone and distressed.
   - Child_Abduction_Attempt: An attempt to forcibly take a child.
   - Elderly_Person_Fallen: An elderly person who has fallen and cannot get up.
   - Disabled_Person_In_Distress: A person with a disability in a dangerous or difficult situation.

9. Public Nuisance & Disorder
   - Public_Intoxication: An individual who is clearly drunk and disorderly in public.
   arassment: Unwanted and aggressive verbal or physical interaction.
   - Indecent_Exposure: Exposure of private body parts in public.
   - Noise_Disturbance_Violence: A noise complaint that is escalating to violence.

10. Infrastructure Failures
    - Building_Collapse_Risk: Visible structural damage to a building.
    - Road_Blockage_Hazard: An obstruction on the road that poses a danger.
    - Broken_Escalator_Elevator: A malfunctioning escalator or elevator with people in danger.
    - Water_Leak_Flooding: A major water leak leading to flooding.
    
11. Normal Activity
    - Normal_Activity: No significant anomalies or threats detected. Standard public or private behavior.
`;


export const AnalyzeVideoIncidentInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of an incident, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVideoIncidentInput = z.infer<typeof AnalyzeVideoIncidentInputSchema>;

export const AnalyzeVideoIncidentOutputSchema = z.object({
    isSignificant: z.boolean().describe('Set to true if a significant anomaly is detected, otherwise false.'),
    incidentType: z.string().describe('The single most critical anomaly key (e.g., "Physical_Assault") from the provided list. Or "Normal_Activity" if not significant.'),
});
export type AnalyzeVideoIncidentOutput = z.infer<typeof AnalyzeVideoIncidentOutputSchema>;
