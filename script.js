document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed"); // DEBUG

    // --- Configuration ---
    const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const API_KEY = "AIzaSyBZyIGnmtQVAnYy-Lx4hIO6PLa4GpV01Vo"; // !! SECURITY RISK !! Replace with your actual key

    if (API_KEY === "YOUR_API_KEY") {
        alert("CRITICAL SECURITY WARNING:\n\nPlease replace 'YOUR_API_KEY' in script.js with your actual Google AI API Key.\n\nRemember: Exposing API keys in client-side code is extremely insecure for real applications. Use a backend proxy for production environments!");
        // Consider stopping execution if the key isn't real
        // return;
    }

    const characters = [
         {
            id: 'sarcastic-sam',
            name: 'Sarcastic Sam',
            emoji: '😒',
            description: 'Answers everything with maximum eye-roll potential.',
            promptPrefix: 'You are Sarcastic Sam, a chatbot that replies to every user message with extremely sarcastic, witty, and slightly condescending humor. Keep your answers relatively concise. User message: ',
            welcome: "Oh great, another human. What do you want? Make it quick, I've got important... napping to do. 😒"
        },
        {
            id: 'punny-penny',
            name: 'Punny Penny',
            emoji: '😂',
            description: 'Ready to drop puns that are so bad, they\'re good!',
            promptPrefix: 'You are Punny Penny, a cheerful chatbot that loves making puns. Respond to the user message with a relevant (or even slightly forced) pun. User message: ',
            welcome: "Hey there! Ready for some quali-tea puns? Let's get this party rolling! 😂"
        },
        {
            id: 'dad-joke-dave',
            name: 'Dad Joke Dave',
            emoji: '👴',
            description: 'Armed with classic (and maybe cringey) dad jokes.',
            promptPrefix: 'You are Dad Joke Dave. Tell a classic, slightly cheesy, dad joke related to the user message. If it\'s hard to relate, tell a general dad joke. User message: ',
            welcome: "Hiya kiddo! Pulled up a chair, have you? What's the topic? I'm ready to *sock* it to ya! 👴 Get it? Sock?"
        },
         {
            id: 'overly-excited-ollie',
            name: 'Excited Ollie',
            emoji: '🥳',
            description: 'EVERYTHING IS AMAZING! Gets way too enthusiastic.',
            promptPrefix: 'You are Overly Excited Ollie! Respond to the user message with extreme, over-the-top enthusiasm and positivity! Use lots of exclamation points and maybe some all caps for emphasis!!! User message: ',
            welcome: "OH MY GOSH HELLO!!! 🥳 It's SOOOO amazing to meet you! What fun thing are we talking about first?! LET'S GOOOO!"
        },
        // --- NEW CHARACTER DEFINITION ---
        {
            id: 'knock-knock-kelly',
            name: 'Knock-Knock Kelly',
            emoji: '✊', // Or maybe '🚪'
            description: 'Always ready with a knock-knock joke, good or bad!',
            // Instruct the AI clearly how to format the joke
            promptPrefix: 'You are Knock-Knock Kelly. Tell the user a complete knock-knock joke. Try to relate it to their message if possible, otherwise tell a general one. Structure it clearly like:\nKnock, knock.\nUser: Who\'s there?\n[Setup Name]\nUser: [Setup Name] who?\n[Punchline]\n\nUser message: ',
            welcome: "Knock, knock! ... No seriously, who's there? Oh, it's you! Ready for a joke? ✊"
        }
        // --- END OF NEW CHARACTER ---
    ];

    let selectedCharacter = null;

    // --- DOM Elements ---
    const characterSelectionContainer = document.getElementById('character-selection');
    const characterCardsContainer = characterSelectionContainer?.querySelector('.character-cards'); // Added safe navigation
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const currentBotNameSpan = document.getElementById('current-bot-name');
    const currentBotEmojiSpan = document.getElementById('current-bot-emoji');
    const changeBotButton = document.getElementById('change-bot-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const initialBotMessageElement = chatBox?.querySelector('.initial-bot-message'); // Added safe navigation

     // Check if essential elements were found
    if (!characterSelectionContainer || !characterCardsContainer || !chatContainer || !chatBox || !userInput || !sendButton || !currentBotNameSpan || !currentBotEmojiSpan || !changeBotButton || !loadingIndicator) {
        console.error("ERROR: One or more essential DOM elements not found. Check IDs in HTML and JS.");
        alert("Error: Could not initialize the chat interface. Please check the console (F12) for details.");
        return; // Stop execution if critical elements are missing
    }


    // --- Functions ---

    // Render Character Cards
    function renderCharacterCards() {
        console.log("renderCharacterCards called"); // DEBUG
        if (!characterCardsContainer) return; // Guard clause
        characterCardsContainer.innerHTML = ''; // Clear existing cards
        characters.forEach((char, index) => { // Added index for animation delay
            const card = document.createElement('div');
            card.classList.add('character-card');
            card.dataset.characterId = char.id;
            // Apply animation delay dynamically
            card.style.animationDelay = `${0.6 + index * 0.1}s`;
            card.innerHTML = `
                <h3><span class="emoji">${char.emoji}</span> ${char.name}</h3>
                <p>${char.description}</p>
            `;
            // Add event listener directly
            card.addEventListener('click', () => {
                 console.log(`Card clicked: ${char.name} (ID: ${char.id})`); // DEBUG
                 selectCharacter(char);
            });
            characterCardsContainer.appendChild(card);
        });
         console.log("Character cards rendered and listeners attached."); // DEBUG
    }

    // Select a Character
    function selectCharacter(character) {
        console.log(`selectCharacter called for: ${character.name}`); // DEBUG
        if (!character || !characterSelectionContainer || !chatContainer || !currentBotNameSpan || !currentBotEmojiSpan || !chatBox || !userInput) {
            console.error("selectCharacter called with null character or missing essential elements");
            return;
        }
        selectedCharacter = character;

        // Update selected state on cards
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.characterId === character.id) {
                card.classList.add('selected');
            }
        });

        // Update chat header
        currentBotNameSpan.textContent = character.name;
        currentBotEmojiSpan.textContent = character.emoji;

        // Hide character selection and show chat
        console.log("Hiding character selection, showing chat container..."); // DEBUG
        characterSelectionContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden'); // <<< THIS IS KEY TO SHOW CHAT

        // Clear chat box and add welcome message
        chatBox.innerHTML = ''; // Clear previous chats
        addMessageToChat(character.welcome, 'bot', character.emoji);

        // Focus input field - make sure it's visible first
        console.log("Attempting to focus user input field..."); // DEBUG
        userInput.disabled = false; // Ensure it's not disabled
        userInput.focus();
        console.log("selectCharacter finished."); // DEBUG
    }

    // Add a message to the chat interface
    function addMessageToChat(text, sender = 'user', emoji = '👤') { // Default user emoji
        if (!chatBox) return; // Guard clause
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        // Basic sanitization (more robust needed for production)
        // Preserve newlines from bot for jokes
        const sanitizedText = text
                                .replace(/</g, "<")
                                .replace(/>/g, ">")
                                .replace(/\n/g, "<br>"); // Convert newlines to <br> for display

        messageElement.innerHTML = `
            <span class="emoji">${emoji}</span>
            <p>${sanitizedText}</p>
        `;
        chatBox.appendChild(messageElement);

        // Scroll to the bottom smoothly
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    }

    // Show/Hide Loading Indicator
    function showLoading(isLoading) {
        if (!loadingIndicator || !sendButton || !userInput || !chatContainer) return; // Guard clause

        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            sendButton.disabled = true;
            userInput.disabled = true; // Disable input while loading
        } else {
            loadingIndicator.classList.add('hidden');
            sendButton.disabled = false;
            userInput.disabled = false; // Re-enable input
            if (!chatContainer.classList.contains('hidden')) { // Only focus if chat is visible
               userInput.focus();
            }
        }
    }

    // Handle Sending a Message
    async function handleSendMessage() {
         if (!userInput || !selectedCharacter) {
             console.warn("Send attempted but no character selected or input missing.");
             if (!selectedCharacter) addMessageToChat("Please select a character first!", 'bot', '🤖');
             return;
        }

        const messageText = userInput.value.trim();
        if (!messageText) {
            return; // Do nothing if input is empty
        }

        console.log(`User message: ${messageText}`); // DEBUG
        addMessageToChat(messageText, 'user'); // User emoji TBD or keep default
        userInput.value = '';
        showLoading(true);

        const prompt = selectedCharacter.promptPrefix + messageText;
        const requestBody = {
            contents: [{ parts: [{ "text": prompt }] }],
             // Add safety settings if needed:
             safetySettings: [
               { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
               { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
               { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
               { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
             ],
            generationConfig: { // Optional: Control output
                // temperature: 0.9, // Higher for more creative/random
                // topK: 1,
                // topP: 1,
                // maxOutputTokens: 256, // Limit response length
                // stopSequences: [], // e.g., ["User:"]
            }
        };

        try {
            console.log("Sending API request..."); // DEBUG
            const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            console.log(`API Response Status: ${response.status}`); // DEBUG

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Response Body:", errorData);
                let errorMsg = `API Error: ${response.status} ${response.statusText}.`;
                if (errorData.error?.message) {
                    errorMsg += ` Details: ${errorData.error.message}`;
                }
                 // Check for specific known errors
                 if (response.status === 400 && errorData.error?.message.includes('API key not valid')) {
                     errorMsg = "Uh oh! The API Key seems invalid. Please check the key in script.js. 🔑";
                 } else if (response.status === 429) {
                     errorMsg = "Whoa, slow down! We've hit the request limit. Please wait a bit and try again. ⏳";
                 }

                throw new Error(errorMsg); // Throw the constructed error message
            }

            const data = await response.json();
            console.log("API Response Data:", data); // DEBUG

            let botReply = "SYSTEM ERROR: Comedy module malfunction. Beep boop. 😵‍💫"; // Default funny error

             // More robust check for Gemini response structure including safety feedback
             if (data.candidates && data.candidates.length > 0) {
                 const candidate = data.candidates[0];
                 // Check finish reason first
                 if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
                     console.warn(`Response finished due to: ${candidate.finishReason}`);
                     if (candidate.finishReason === 'SAFETY') {
                          botReply = "Whoa there! My safety circuits prevented me from answering that one. Let's keep it light and funny! 😄";
                     } else {
                          botReply = `Hmm, my response was cut short because: ${candidate.finishReason}. Try asking differently? 🤔`;
                     }
                 } else if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
                     // Success case
                     botReply = candidate.content.parts[0].text;
                 } else {
                      // Got a candidate but no text?
                      console.warn("API response candidate missing expected text part:", candidate);
                      botReply = "I thought of something... but then I forgot. Try again? 🤔";
                 }
             } else if (data.promptFeedback?.blockReason) {
                  // Handle cases where the prompt itself was blocked immediately
                 console.warn(`Prompt blocked due to: ${data.promptFeedback.blockReason}`);
                 botReply = "Yikes! My safety filters didn't like that prompt input. Can we try a different topic? 🙏";
             }
              else {
                 // No candidates and no prompt block reason?
                 console.warn("Unexpected API response structure (no candidates or prompt block reason):", data);
                 botReply = "My wires got tangled! Received an unexpected response from the comedy cloud. 🤯";
             }

            addMessageToChat(botReply, 'bot', selectedCharacter.emoji);

        } catch (error) {
            console.error("Failed to fetch or process bot response:", error);
            // Display the specific error message from the caught error
            addMessageToChat(`Oops! My circuits sparked! (${error.message || 'Unknown error'}) Try again maybe?`, 'bot', '🤯');
        } finally {
            console.log("Finished processing message."); // DEBUG
            showLoading(false);
        }
    }

    // Go back to character selection
    function handleChangeBot() {
        console.log("handleChangeBot called"); // DEBUG
         if (!chatContainer || !characterSelectionContainer) return; // Guard clause
        selectedCharacter = null;
        chatContainer.classList.add('hidden'); // Hide chat
        characterSelectionContainer.classList.remove('hidden'); // Show selection

        // Clear chatbox
        if (chatBox) chatBox.innerHTML = '';

        // Reset selected card styles
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
        });
        console.log("Returned to character selection."); // DEBUG
    }


    // --- Event Listeners ---
    // Add checks to ensure elements exist before adding listeners
    if (sendButton) {
         sendButton.addEventListener('click', handleSendMessage);
         console.log("Send button listener attached."); // DEBUG
    } else { console.error("Send button not found!"); }

     if (userInput) {
         userInput.addEventListener('keypress', (event) => {
             if (event.key === 'Enter') {
                 // Prevent default form submission if it were in a form
                 event.preventDefault();
                 handleSendMessage();
             }
         });
         console.log("User input 'Enter' key listener attached."); // DEBUG
    } else { console.error("User input not found!"); }

     if (changeBotButton) {
         changeBotButton.addEventListener('click', handleChangeBot);
          console.log("Change Bot button listener attached."); // DEBUG
     } else { console.error("Change bot button not found!"); }


    // --- Initialisation ---
    renderCharacterCards(); // Render cards and attach their click listeners
    // Keep initial message element present in DOM but hidden
     if (initialBotMessageElement) {
         // It starts hidden via HTML class, no need to add here unless necessary
         // initialBotMessageElement.classList.add('hidden');
     }
    console.log("Initialization complete. Waiting for character selection."); // DEBUG


}); // End DOMContentLoaded
