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
  const prompt = `Create an ultra-premium, high-end professional academic event poster for "${event.title}".
  
  CORE REQUIREMENTS:
  - The design MUST be world-class, comparable to elite Ivy League or top-tier global university announcements.
  - The typography MUST be sophisticated, using elegant sans-serif or refined serif fonts that look expensive and authoritative.
  - The layout MUST be clean, balanced, and utilize purposeful white space (minimalist yet powerful).
  
  TEXT TO INCLUDE CLEARLY (Legible and well-integrated):
  - Event Title: ${event.title}
  - Scheduled Date: ${event.date}
  - Official Venue: ${event.venue}
  
  VISUAL AESTHETIC:
  - Palette: Executive deep navy, sophisticated charcoal, brushed gold accents, or clinical white/teal. No "clipart" colors.
  - Background: Abstract high-tech patterns, architectural geometry, or subtle glassmorphism textures.
  - Mood: Inspiring, intellectual, high-authority, and premium.
  - Quality: Cinematic lighting, 8k resolution, razor-sharp edges.
  
  Do NOT include any generic "student" stock photos unless they look like high-art photography. Focus on the TITLE as a typographic masterpiece.`;

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
