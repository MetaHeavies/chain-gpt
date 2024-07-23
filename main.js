import dotenv from 'dotenv';
import { MinimalChainable } from './chain.js';
import OpenAI from "openai";
import prompts from './prompts.js'; // Import the prompts array
console.log("Imported prompts:", prompts);

dotenv.config();

function buildModels() {
    const API_KEY = process.env.OPENAI_API_KEY;

    const openai = new OpenAI({
      apiKey: "Your Open API Key"
    });

    return openai;
}

async function llm(model, promptText) {
  const response = await model.chat.completions.create({
      model: "gpt-4",
      messages: [
          { role: "system", content: "Always respond with valid JSON. If the response is not inherently JSON, wrap it in a JSON object with a 'content' key." },
          { role: "user", content: promptText }
      ],
      temperature: 0.5
  });

  let content = response.choices[0].message.content;
  
  // Ensure the content is valid JSON
  try {
      JSON.parse(content);
  } catch (e) {
      content = JSON.stringify({ content: content });
  }

  console.log(`Response for Prompt: ${promptText}`, content);
  return content;
}

async function promptChainablePoc() {
    let model = buildModels();

    let { output: result, contextFilledPrompts } = await MinimalChainable.run(
        { topic: 'The changing expectations of digital desginers as genAI becomes ubiquitous specifically creatign new interaction design paradigms'},
        model,
        llm,
        prompts
    );

    let chainedPrompts = MinimalChainable.toDelimTextFile('poc_context_filled_prompts', contextFilledPrompts);
    let chainableResult = MinimalChainable.toDelimTextFile('poc_prompt_results', result);

    console.log(`\n\n📖 Prompts~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n\n${chainedPrompts}`);
    console.log(`\n\n📊 Results~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n\n${chainableResult}`);
}

function main() {
    promptChainablePoc();
}

main();
