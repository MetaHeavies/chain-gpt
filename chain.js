import fs from 'fs';

export class MinimalChainable {
    static async run(context, model, callable, prompts) {
        let output = [];
        let contextFilledPrompts = [];
    
        for (let i = 0; i < prompts.length; i++) {
            let prompt = prompts[i];
    
            // Replace context variables
            for (let [key, value] of Object.entries(context)) {
                prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            }
    
            // Replace references to previous outputs
            for (let j = i; j > 0; j--) {
                let previousOutput = output[i - j];
                if (typeof previousOutput === 'object' && previousOutput !== null) {
                    // If the previous output has a 'content' key, use that
                    if (previousOutput.content) {
                        previousOutput = previousOutput.content;
                    }
                    // Try to parse the content as JSON if it's a string
                    if (typeof previousOutput === 'string') {
                        try {
                            previousOutput = JSON.parse(previousOutput.replace(/'/g, '"'));
                        } catch (e) {
                            // If parsing fails, keep it as a string
                        }
                    }
                    prompt = prompt.replace(new RegExp(`{{output\\[-${j}\\]}}`, 'g'), JSON.stringify(previousOutput));
                    for (let [key, value] of Object.entries(previousOutput)) {
                        prompt = prompt.replace(new RegExp(`{{output\\[-${j}\\]\\.${key}}}`, 'g'), String(value));
                    }
                } else {
                    prompt = prompt.replace(new RegExp(`{{output\\[-${j}\\]}}`, 'g'), String(previousOutput));
                }
            }
    
            contextFilledPrompts.push(prompt);
            console.log(`Processed Prompt #${i + 1}:`, prompt);
    
            try {
                let result = await callable(model, prompt);
                console.log(`Raw result for Prompt #${i + 1}:`, result);
    
                let parsedResult;
                try {
                    parsedResult = JSON.parse(result);
                    if (parsedResult.content) {
                        // If the content looks like JSON (starts with { and ends with }), try to parse it
                        if (typeof parsedResult.content === 'string' && 
                            parsedResult.content.trim().startsWith('{') && 
                            parsedResult.content.trim().endsWith('}')) {
                            try {
                                parsedResult = JSON.parse(parsedResult.content.replace(/'/g, '"'));
                            } catch (e) {
                                console.warn(`Failed to parse inner content as JSON for Prompt #${i + 1}:`, e);
                            }
                        } else {
                            parsedResult = parsedResult.content;
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to parse result as JSON for Prompt #${i + 1}:`, e);
                    parsedResult = { content: result };
                }
    
                console.log(`Parsed result for Prompt #${i + 1}:`, parsedResult);
                output.push(parsedResult);
            } catch (error) {
                console.error(`Error processing prompt #${i + 1}:`, error);
                output.push({ error: error.message });
            }
        }
    
        return { output, contextFilledPrompts };
    }

    static toDelimTextFile(name, content) {
        let resultString = "";
        let filePath = `${name}.txt`;
        let fileContent = content.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
                item = JSON.stringify(item, null, 2);
            }
            let chainTextDelim = `${'🔗'.repeat(index + 1)} -------- Prompt Chain Result #${index + 1} -------------\n\n`;
            return `${chainTextDelim}${item}\n\n`;
        }).join('');

        fs.writeFileSync(filePath, fileContent);

        resultString = fileContent;

        return resultString;
    }
}