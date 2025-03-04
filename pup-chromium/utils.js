const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction:
    'You are a Playwright script refactoring and parameterization assistant. You will receive a Playwright script generated by codegen, and you will modify it based on the user\'s instructions. Your primary goal is to:\\n\\n1. **Remove Redundant Actions:** Eliminate duplicate clicks or actions recorded due to accidental user repetitions.\\n2. **Improve Waiting Logic:** Ensure proper `await page.waitForSelector()` or similar calls are in place where necessary to prevent race conditions and ensure elements are loaded before interaction.\\n3. **Parameterize User Inputs:** Replace hardcoded values (text inputs, dropdown selections, checkbox states, etc.) with parameters that can be passed during script execution.\\n4. **Generate Parameter Metadata:** Create a JSON object containing details about each parameter, including its name, description, and type.\\n5. **Ensure Modularity:** The refactored script should be in a function that accepts a list of arguments and can be executed with these arguments.\\n\\nYou will return a JSON object with two keys: \\"script\\" (containing the modified Playwright script) and \\"parameters\\" (containing the parameter metadata).\\n\\nIf the script has no issue, return the script and parameters as empty object.\\n\\nDo not execute the script. Do not add any extra comments or explanations in the script. Just return the script. Note:The runTest should always accept args list and it should internally destrucutre it to map it with the parameters, so that the outside function just has to pass the args list and rest the script handle itself. Try to aviod hardcoding any values in the script (ex. assigneName, assingneFullName).',
});

const replayModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction:
    "You are an intelligent assistant for processing and modifying automation scripts or file operations based on user instructions. Your primary responsibilities include:\\n\\n" +
    "1. **Modifying or Saving Scripts:** If the user provides a script and requests modifications, return the modified script based on their instructions and hit the `/save-file` endpoint.\\n" +
    "2. **Fetching a File:** If the user requests to retrieve a file, return the appropriate response and hit the `/file/{uuid}` endpoint.\\n" +
    "3. **Executing a Script:** If the user requests to run or execute a script, trigger the `/replay` endpoint.\\n\\n" +
    "### Response Format:\\n" +
    "- Return a JSON object with `action`, `script` (if applicable), and `parameters` (if modifications are needed).\\n" +
    '- Possible values for `action`: `"save-file"`, `"fetch-file"`, `"execute-script"`.\\n' +
    "- If modifying a script, include a `script` key with the updated script and a `parameters` key containing metadata about any parameters used.\\n" +
    "- If no modification is needed, return an empty `parameters` object.\\n" +
    "- Do not execute the script. Do not add any extra comments or explanations in the script.\\n\\n" +
    "### Example Responses:\\n" +
    "#### 1. User Requests a Script Modification:\\n" +
    '{ "action": "save-file", "script": "<modified-script>", "parameters": [{ "name": "username", "description": "User login name", "type": "string" }] }\\n' +
    "#### 2. User Requests to Fetch a File:\\n" +
    '{ "action": "fetch-file" }\\n' +
    "#### 3. User Requests to Execute a Script:\\n" +
    '{ "action": "execute-script" }',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      script: {
        type: "string",
      },
      parameters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            description: {
              type: "string",
            },
            type: {
              type: "string",
              enum: ["string", "number", "boolean"],
            },
          },
          required: ["name", "description", "type"],
        },
      },
    },
    required: ["script", "parameters"],
  },
};

async function refactorScript(script) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Please refactor and parameterize the following Playwright script:\\\\n\\\\n```tyepscript\\\\n import { test, expect } from '@playwright/test';\\n\\ntest('test', async ({ page }) => {\\n  await page.goto('[https://identity.athenahealth.com/oauth2/](https://identity.athenahealth.com/oauth2/)');\\n  await page.getByRole('textbox', { name: 'Username' }).click();\\n  await page.getByRole('textbox', { name: 'Username' }).fill('p-bkumar1');\\n  await page.getByRole('textbox', { name: 'Password' }).click();\\n  await page.getByRole('textbox', { name: 'Password' }).fill('Xcaliber@12345');\\n  await page.getByRole('button', { name: 'Log In' }).click();\\n  await page.goto('[https://preview.athenahealth.com/195903/5/login/choosedepartment.esp](https://preview.athenahealth.com/195903/5/login/choosedepartment.esp)');\\n  await page.getByRole('button', { name: 'Go' }).click();\\n  await page.locator('#GlobalNav').contentFrame().getByText('Patients').click();\\n  await page.getByText('Document Search').click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().locator('#DOCUMENTID').click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().locator('#DOCUMENTID').fill('116873');\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByRole('button', { name: 'Search' }).click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByText('VIEW ACTIONS').first().click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByText('Leave in REVIEW').click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByRole('textbox', { name: 'Select an Assignee' }).click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByRole('textbox', { name: 'Select an Assignee' }).click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByRole('textbox', { name: 'Select an Assignee' }).fill('p-kumar');\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByText('BhupenderKumarClinical Staff').click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByRole('textbox', { name: 'Select an Assignee' }).click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().getByRole('button', { name: 'Save' }).first().click();\\n  await page.locator('#GlobalWrapper').contentFrame().locator('#frameContent').contentFrame().locator('iframe[name=\\\"frMain\\\"]').contentFrame().locator('.close').first().click();\\n});```",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '```json\n{\n  "script": "const { chromium } = require(\'playwright\');\\n\\nconst runTest = async (page,args) => {\\n  const [username, password, documentId, assignee,assigneeFullName] = args;\\n try {\\n    await page.goto(\'https://identity.athenahealth.com/oauth2/\');\\n    await page.getByRole(\'textbox\', { name: \'Username\' }).fill(username);\\n    await page.getByRole(\'textbox\', { name: \'Password\' }).fill(password);\\n    await page.getByRole(\'button\', { name: \'Log In\' }).click();\\n    await page.getByRole(\'button\', { name: \'Go\' }).click();\\n    await page.locator(\\"#GlobalNav\\").contentFrame().getByText(\\"Patients\\").click();\\n    await page.getByText(\\"Document Search\\").click();\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .locator(\\"#DOCUMENTID\\")\\n      .fill(documentId);\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .getByRole(\\"button\\", { name: \\"Search\\" })\\n      .click();\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .getByText(\\"VIEW ACTIONS\\")\\n      .first()\\n      .click();\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .getByText(\\"Leave in REVIEW\\")\\n      .click();\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .getByRole(\\"textbox\\", { name: \\"Select an Assignee\\" })\\n      .fill(assignee);\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .getByText(assigneeFullName)\\n      .click();\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .getByRole(\\"button\\", { name: \\"Save\\" })\\n      .first()\\n      .click();\\n    await page\\n      .locator(\\"#GlobalWrapper\\")\\n      .contentFrame()\\n      .locator(\\"#frameContent\\")\\n      .contentFrame()\\n      .locator(\'iframe[name=\\"frMain\\"]\')\\n      .contentFrame()\\n      .locator(\\".close\\")\\n      .first()\\n      .click();\\n  } catch (error) {\\n    console.error(\'Error during Playwright test:\', error);\\n  }\\n};\\n\\nmodule.exports = runTest;",\n  "parameters": [\n    {\n      "name": "username",\n      "description": "Username for login",\n      "type": "string"\n    },\n    {\n      "name": "password",\n      "description": "Password for login",\n      "type": "string"\n    },\n    {\n      "name": "documentId",\n      "description": "Document ID to search for",\n      "type": "string"\n    },\n    {\n      "name": "assignee",\n      "description": "Assignee for the document review",\n      "type": "string"\n    },\n     {\n      "name": "assigneeFullName",\n      "description": "Assignee Full Name for the document review",\n      "type": "string"\n    }\n  ]\n}\n```',
          },
        ],
      },
    ],
  });
  const result = await chatSession.sendMessage(
    `Please refactor and parameterize the following Playwright script:\\\\n\\\\n\`\`\`typescript\\\\n${script}\\\\n\`\`\``
  );
  return result.response.text();
}

async function processPrompt(prompt, uuid) {
  try {
    const geminiResponse = await replayModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const responseData = await geminiResponse.response.text();
    const content = JSON.parse(responseData);

    console.log("Gemini AI Response:", content);

    if (!content.action) {
      throw new Error("Missing action in Gemini AI response");
    }

    let endpoint = "";
    let payload = { prompt, uuid };
    const BASE_URL = "http://localhost:3000";
    let response;

    switch (content.action) {
      case "save-file":
        endpoint = `${BASE_URL}/save-file/${uuid}`;
        payload.code = content.script || "";
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        break;

      case "fetch-file":
        endpoint = `${BASE_URL}/file/${uuid}`;
        response = await fetch(endpoint);
        return await response.json();

      case "execute-script":
        endpoint = `${BASE_URL}/replay`;
        payload.parameters = content.parameters || {};
        payload.uuid = uuid;
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        break;

      default:
        throw new Error("Unrecognized action from Gemini AI");
    }

    if (!response.ok) {
      throw new Error(`Error from ${endpoint}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing prompt:", error);
    throw error;
  }
}

module.exports = { refactorScript, processPrompt };
