const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "You are a Playwright script refactoring and parameterization assistant. You will receive a Playwright script generated by codegen, and you will modify it based on the user's instructions. Your primary goal is to:\\n\\n1. **Remove Redundant Actions:** Eliminate duplicate clicks or actions recorded due to accidental user repetitions.\\n2. **Improve Waiting Logic:** Ensure proper `await page.waitForSelector()` or similar calls are in place where necessary to prevent race conditions and ensure elements are loaded before interaction.\\n3. **Parameterize User Inputs:** Replace hardcoded values (text inputs, dropdown selections, checkbox states, etc.) with parameters that can be passed during script execution.\\n4. **Generate Parameter Metadata:** Create a JSON object containing details about each parameter, including its name, description, and type.\\n5. **Ensure Modularity:** The refactored script should be in a function that accepts a list of arguments and can be executed with these arguments.\\n\\nYou will return a JSON object with two keys: \\\"script\\\" (containing the modified Playwright script) and \\\"parameters\\\" (containing the parameter metadata).\\n\\nIf the script has no issue, return the script and parameters as empty object.\\n\\nDo not execute the script. Do not add any extra comments or explanations in the script. Just return the script. Note:The runTest should always accept args list and it should internally destrucutre it to map it with the parameters, so that the outside function just has to pass the args list and rest the script handle itself. Try to aviod hardcoding any values in the script (ex. assigneName, assingneFullName).",
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
          {text: "```json\n{\n  \"script\": \"const { chromium } = require('playwright');\\n\\nconst runTest = async (args) => {\\n  const [username, password, documentId, assignee,assigneeFullName] = args;\\n  const browser = await chromium.launch({headless: false});\\n  const page = await browser.newPage();\\n  try {\\n    await page.goto('https://identity.athenahealth.com/oauth2/');\\n    await page.getByRole('textbox', { name: 'Username' }).fill(username);\\n    await page.getByRole('textbox', { name: 'Password' }).fill(password);\\n    await page.getByRole('button', { name: 'Log In' }).click();\\n    await page.getByRole('button', { name: 'Go' }).click();\\n    await page.locator(\\\"#GlobalNav\\\").contentFrame().getByText(\\\"Patients\\\").click();\\n    await page.getByText(\\\"Document Search\\\").click();\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .locator(\\\"#DOCUMENTID\\\")\\n      .fill(documentId);\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .getByRole(\\\"button\\\", { name: \\\"Search\\\" })\\n      .click();\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .getByText(\\\"VIEW ACTIONS\\\")\\n      .first()\\n      .click();\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .getByText(\\\"Leave in REVIEW\\\")\\n      .click();\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .getByRole(\\\"textbox\\\", { name: \\\"Select an Assignee\\\" })\\n      .fill(assignee);\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .getByText(assigneeFullName)\\n      .click();\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .getByRole(\\\"button\\\", { name: \\\"Save\\\" })\\n      .first()\\n      .click();\\n    await page\\n      .locator(\\\"#GlobalWrapper\\\")\\n      .contentFrame()\\n      .locator(\\\"#frameContent\\\")\\n      .contentFrame()\\n      .locator('iframe[name=\\\"frMain\\\"]')\\n      .contentFrame()\\n      .locator(\\\".close\\\")\\n      .first()\\n      .click();\\n  } catch (error) {\\n    console.error('Error during Playwright test:', error);\\n  } finally {\\n    await browser.close();\\n  }\\n};\\n\\nmodule.exports = runTest;\",\n  \"parameters\": [\n    {\n      \"name\": \"username\",\n      \"description\": \"Username for login\",\n      \"type\": \"string\"\n    },\n    {\n      \"name\": \"password\",\n      \"description\": \"Password for login\",\n      \"type\": \"string\"\n    },\n    {\n      \"name\": \"documentId\",\n      \"description\": \"Document ID to search for\",\n      \"type\": \"string\"\n    },\n    {\n      \"name\": \"assignee\",\n      \"description\": \"Assignee for the document review\",\n      \"type\": \"string\"\n    },\n     {\n      \"name\": \"assigneeFullName\",\n      \"description\": \"Assignee Full Name for the document review\",\n      \"type\": \"string\"\n    }\n  ]\n}\n```"},
        ],
      },
    ],
  });
  const result = await chatSession.sendMessage(
    `Please refactor and parameterize the following Playwright script:\\\\n\\\\n\`\`\`typescript\\\\n${script}\\\\n\`\`\``
  );
  return result.response.text();
}

module.exports = { refactorScript };
