
const { ChatGroq } = require("@langchain/groq");
const { TavilySearch } = require("@langchain/tavily");


// Patch: Ensure TavilySearch always receives { query: ... }
class TavilySearchPatched extends TavilySearch {
    async call(input, config) {
        if (typeof input === "string") {
            return super.call({ query: input }, config);
        }
        return super.call(input, config);
    }
}

const searchTool = new TavilySearchPatched({
    apiKey: "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",
});

const llm = new ChatGroq({
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    apiKey: "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",
});

// Accepts chatHistory: [{role: 'user'|'assistant', content: string}, ...]
async function simpleAnswer(chatHistory) {
    // chatHistory is an array of messages
    // The last message is the latest user input
    if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
        throw new Error("chatHistory must be a non-empty array");
    }

    // Try to get a direct answer from the LLM using the full chat history
    const llmResponse = await llm.invoke(chatHistory);

    // If the LLM is unsure, fallback to search
    const unsurePhrases = [
        "I'm not sure",
        "I don't know",
        "As an AI language model",
        "cannot provide",
        "don't have enough information"
    ];
    const isUnsure = unsurePhrases.some(phrase =>
        llmResponse.content && llmResponse.content.toLowerCase().includes(phrase)
    );

    if (!llmResponse.content || isUnsure) {
        // Use Tavily search tool with the latest user message
        const lastUserMsg = chatHistory.slice().reverse().find(m => m.role === 'user');
        const searchResult = await searchTool.call({ query: lastUserMsg ? lastUserMsg.content : "" });
        return searchResult;
    }

    return llmResponse.content;
}

module.exports = {
    simpleAnswer
};


