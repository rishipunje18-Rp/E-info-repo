import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const generateEventDescription = async (event: {
  title: string;
  date: string;
  venue: string;
  purpose: string;
  targetAudience: string;
}) => {
  const prompt = `Generate a professional academic event description for an event titled "${event.title}" on "${event.date}" at "${event.venue}". 
  The purpose of the event is: "${event.purpose}". 
  The target audience is: "${event.targetAudience}". 
  
  Please provide a structured description including:
  1. An engaging introduction.
  2. Key highlights of the event.
  3. Why one should attend.
  
  Format the output in clean Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};

export const generateEventPoster = async (event: { title: string; date: string; venue: string }) => {
  const prompt = `Create a masterpiece-level, high-fidelity professional academic event poster for "${event.title}".
  
  CORE DESIGN GUIDELINES:
  - THEME: Modern, Minimalist, and Scholarly. Think "Apple event meets Ivy League University".
  - TYPOGRAPHY: Use bold, elegant, and sophisticated sans-serif fonts for the title. The text must be perfectly integrated into the design, not just floating on top.
  - COMPOSITION: Masterful use of hierarchy. The Title "${event.title}" must be the hero.
  - DETAILS: Include "${event.date}" and "${event.venue}" in a refined, legible section.
  
  VISUAL ELEMENTS:
  - COLOR PALETTE: Deep Obsidian and Teal gradients, or Sophisticated Slate with subtle Gold accents.
  - BACKGROUND: Use high-level abstract geometry, subtle glassmorphism effects, or blurred architectural depth. No generic stock photos.
  - MOOD: Technical, Innovative, and Elite.
  - FINAL QUALITY: 8k Resolution, stunning clarity, studio-grade lighting.
  
  CRITICAL: The poster must look like a high-end physical print. Do NOT include any watermark or generic 'student' imagery.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4", // Tall poster format
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
