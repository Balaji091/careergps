import dotenv from 'dotenv';
dotenv.config();
import { generateLearnContent } from './services/aiService.js';

async function test() {
  try {
    console.log("Testing learn content generation...");
    const content = await generateLearnContent("semantic html5, dom trees & parsing", "HTML & CSS Core", "Beginner");
    console.log("Success! Content definition:", content.definition);
  } catch (err) {
    console.error("Failed:", err.message);
    if (err.response) {
      console.error("API response error:", err.response.data);
    }
  }
}

test();
