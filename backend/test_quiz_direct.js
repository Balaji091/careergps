import dotenv from 'dotenv';
dotenv.config();
import { generateTopicQuizQuestions } from './services/aiService.js';

async function test() {
  try {
    console.log("Testing quiz generation...");
    const content = await generateTopicQuizQuestions("semantic html5, dom trees & parsing", "HTML & CSS Core", "Beginner");
    console.log("Success! Questions count:", content.length);
    if (content.length > 0) {
      console.log("First Question:", content[0].question);
    }
  } catch (err) {
    console.error("Failed:", err.message);
    if (err.response) {
      console.error("API response error:", err.response.data);
    }
  }
}

test();
