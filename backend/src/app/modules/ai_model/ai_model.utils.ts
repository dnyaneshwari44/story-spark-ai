import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { fetchImageURL } from "../../../utils/image_generation";
import config from "../../../config";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

interface Story {
  title: string;
  content: string;
  tag: string;
  imageURL?: string;
}

export async function generateWithGeminiStories(
  prompt: string,
  wordLength: number = 250,
  numStories: number = 2
): Promise<Story[]> {
  try {
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });
    const response = await chatSession.sendMessage(
      `Generate ${numStories} different short stories based on the following prompt: "${prompt}".
        Each story should be in JSON format with fields: "title", "content", and "tag".
        Ensure each story is approximately ${wordLength} words long.
        Return the output as a JSON array.`
    );
    const text = response.response.text();
    const stories: Story[] = JSON.parse(text);
    const imagePromises = stories.map((story) => fetchImageURL(story.tag));
    const imageResults = await Promise.all(imagePromises);
    return stories.map((story, index) => ({
      ...story,
      imageURL: imageResults[index].imageUrl,
      uuid: uuidv4(),
    }));
  } catch (error) {
    return [];
  }
}
