"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithGeminiStories = generateWithGeminiStories;
const generative_ai_1 = require("@google/generative-ai");
const image_generation_1 = require("../../../utils/image_generation");
const config_1 = __importDefault(require("../../../config"));
const uuid_1 = require("uuid");
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.default.gemini_api_key);
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
        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
];
function generateWithGeminiStories(prompt_1) {
    return __awaiter(this, arguments, void 0, function* (prompt, wordLength = 250, numStories = 2) {
        try {
            const chatSession = model.startChat({
                generationConfig,
                safetySettings,
                history: [],
            });
            const response = yield chatSession.sendMessage(`Generate ${numStories} different short stories based on the following prompt: "${prompt}".
        Each story should be in JSON format with fields: "title", "content", and "tag".
        Ensure each story is approximately ${wordLength} words long.
        Return the output as a JSON array.`);
            const text = response.response.text();
            const stories = JSON.parse(text);
            const imagePromises = stories.map((story) => (0, image_generation_1.fetchImageURL)(story.tag));
            const imageResults = yield Promise.all(imagePromises);
            return stories.map((story, index) => (Object.assign(Object.assign({}, story), { imageURL: imageResults[index].imageUrl, uuid: (0, uuid_1.v4)() })));
        }
        catch (error) {
            return [];
        }
    });
}
