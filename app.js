// Integrated Voice Assistant Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const characterGrid = document.getElementById('character-grid');
    const sourceLanguageSelect = document.getElementById('sourceLanguage');
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    const recordingProgress = document.getElementById('recordingProgress');
    const textInput = document.getElementById('textInput');
    const sendTextBtn = document.getElementById('sendText');
    const responseText = document.getElementById('responseText');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioResponse = document.getElementById('audioResponse');
    const languageDropdownButton = document.getElementById('languageDropdownButton');
    const languageDropdownMenu = document.getElementById('languageDropdownMenu');
    const characterSelect = document.getElementById('character-select');

    // Variables
    let selectedCharacter = null;
    let selectedLanguage = null;
    let selectedLanguageCode = null;
    let characterData = {};
    let recordingSeconds = 0;
    const MAX_RECORDING_TIME = 60; // Maximum recording time in seconds

    // Fallback character data in case the API call fails
    const fallbackCharacters = {
        "Monika": {
            "id": "1qEiC6qsybMkmnNdVMbK",
            "api": "1",
            "description": "Versatile multilingual female voice with natural intonation",
            "languages": {
                "English": "en",
                "Hindi": "hi",
                "Arabic": "ar",
                "Bulgarian": "bg",
                "Czech": "cs",
                "Portuguese": "pt",
                "Finnish": "fi",
                "Indonesian": "id"
            }
        },
        "Meera": {
            "id": "1qEiC6qsybMkmnNdVMbK",
            "api": "1",
            "description": "Expressive female voice with diverse language capabilities",
            "languages": {
                "English": "en",
                "Tamil": "ta",
                "Spanish": "es",
                "Polish": "pl",
                "German": "de",
                "Italian": "it",
                "French": "fr",
                "Arabic": "ar"
            }
        },
        "Danielle": {
            "id": "FVQMzxJGPUBtfz1Azdoy",
            "api": "1",
            "description": "Clear and professional female voice with European language support",
            "languages": {
                "English": "en",
                "Bulgarian": "bg",
                "Czech": "cs",
                "German": "de",
                "Spanish": "es",
                "Hindi": "hi",
                "Italian": "it",
                "French": "fr",
                "Arabic": "ar"
            }
        },
        "Adam": {
            "id": "NFG5qt843uXKj4pFvR7C",
            "api": "2",
            "description": "A middle aged 'Brit' with a velvety laid back, late night talk show host timbre",
            "languages": {
                "English": "en",
                "Hindi": "hi",
                "Portuguese": "pt",
                "Greek": "el",
                "Polish": "pl",
                "French": "fr",
                "Indonesian": "id"
            }
        },
        "Neeraj": {
            "id": "zgqefOY5FPQ3bB7OZTVR",
            "api": "2",
            "description": "Veteran Indian actor voice, great for narrative work and documentaries",
            "languages": {
                "Hindi": "hi",
                "English": "en",
                "German": "de",
                "Spanish": "es",
                "Greek": "el",
                "Russian": "ru"
            }
        },
        "Mark": {
            "id": "UgBBYS2sOqTuMpoF3BR0",
            "api": "2",
            "description": "Casual, young-adult male voice speaking naturally, perfect for conversational AI",
            "languages": {
                "English": "en",
                "German": "de",
                "Spanish": "es",
                "Polish": "pl",
                "Portuguese": "pt",
                "Filipino": "tl",
                "Italian": "it",
                "Hindi": "hi",
                "Czech": "cs"
            }
        }
    };

    // Audio recording variables
    let recorder;
    let audio_context;
    let recording = false;
    let recordingTimer;
    let progressTimer;

    // Initialize by loading characters
    loadCharacters();

    // Add custom CSS for character selection
    addCustomCSS();

    // Set up event listeners
    startRecordingBtn.addEventListener('click', startRecording);
    stopRecordingBtn.addEventListener('click', stopRecording);
    sendTextBtn.addEventListener('click', sendTextMessage);
    
    // Set up character select dropdown if it exists
    if (characterSelect) {
        characterSelect.addEventListener('change', function() {
            const character = this.value;
            loadLanguagesForCharacter(character);
        });
        
        // Initial character load if a character is pre-selected
        if (characterSelect.value) {
            loadLanguagesForCharacter(characterSelect.value);
        }
    }

    // Function to add custom CSS
    function addCustomCSS() {
        document.head.insertAdjacentHTML('beforeend', `
        <style>
    .character-box {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        margin-right: 20px;
        background-color: rgba(0,0,0,0.1);
        position: relative; /* Added for dropdown positioning */
    }
    .character-box:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .character-box.selected {
        border: 2px solid #007bff;
    }
    .character-icon {
        font-size: 2rem;
        margin-bottom: 10px;
        text-align: center;
    }
    .character-name {
        font-weight: bold;
        margin-bottom: 5px;
    }
    .character-description {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 10px;
    }
    .dropdown-menu {
        display: none;
        position: absolute;
        background-color: #2a2a2a; /* Dark background to match your UI */
        border-radius: 8px;
        min-width: 160px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        z-index: 9999; /* Increased z-index significantly */
        margin-top: 5px;
        left: 0;
        right: 0;
        max-height: 300px;
        overflow-y: auto;
    }
    .dropdown-menu.show {
        display: block;
        position: absolute; /* Ensure it's absolutely positioned */
        top: 100%; /* Position it below the parent element */
    }
    .dropdown-item {
        color: white;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        text-align: left;
    }
    .dropdown-item:hover {
        background-color: #3a3a3a;
        border-radius: 6px;
    }
    /* Language selector styles */
    .language-select {
        position: relative;
        text-align: center;
        z-index: 1000; /* Add z-index to the container */
    }
    .language-select-button {
        background-color: transparent;
        color: #aaa;
        border: none;
        padding: 8px 20px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        position: relative;
        z-index: 1001; /* Higher than container */
    }
    .language-select-button::after {
        content: "▼";
        margin-left: 8px;
        font-size: 0.7em;
    }
    /* Alternative dropdown positioning that goes above instead */
    .dropdown-menu.dropup {
        bottom: 100%;
        top: auto;
        margin-bottom: 5px;
        margin-top: 0;
    }
</style>
        `);
    }

    // Function to show error messages
    function showError(message) {
        // You can replace this with a toast notification or other UI
        alert(message);
        console.error(message);
    }

    // Function to load characters
    function loadCharacters() {
        fetch('/get_characters')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    characterData = data.characters;
                    renderCharacterBoxes(characterData);
                } else {
                    console.error('Error loading characters:', data.error);
                    showError('Failed to load characters: ' + data.error);
                    // Use fallback characters if API fails
                    console.log('Using fallback character data');
                    renderCharacterBoxes(fallbackCharacters);
                }
            })
            .catch(error => {
                console.error('Error fetching characters:', error);
                showError('Network error when loading characters');
                // Use fallback characters if fetch fails
                console.log('Using fallback character data');
                renderCharacterBoxes(fallbackCharacters);
            });
    }

    // Function to handle dropdown toggle manually
    function toggleDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = e.currentTarget.nextElementSibling;
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        } else {
            // Close all other dropdowns first
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            dropdown.classList.add('show');
        }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.dropdown-toggle') && !e.target.matches('.dropdown-item')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Function to render character boxes with improved UI
    function renderCharacterBoxes(characters) {
        if (!characterGrid) return;
        
        characterGrid.innerHTML = '';
        
        // Icons for different characters
        const icons = {
            'Monika': '👩‍💼',
            'Meera': '👩',
            'Danielle': '👱‍♀️',
            'Adam': '🧔',
            'Neeraj': '👨‍🦱',
            'Mark': '👨'
        };
        
        Object.entries(characters).forEach(([name, data]) => {
            const characterBox = document.createElement('div');
            characterBox.className = 'character-box col-md-4 mb-3';
            characterBox.dataset.character = name;
            
            const icon = document.createElement('div');
            icon.className = 'character-icon';
            icon.textContent = icons[name] || '👤';
            
            const characterName = document.createElement('div');
            characterName.className = 'character-name';
            characterName.textContent = name;
            
            const description = document.createElement('div');
            description.className = 'character-description';
            description.textContent = data.description || 'No description available';
            
            // Create a language dropdown for this character
            const languageContainer = document.createElement('div');
            languageContainer.className = 'dropdown mt-2';
            
            const languageButton = document.createElement('button');
            languageButton.className = 'btn btn-sm btn-outline-secondary dropdown-toggle';
            languageButton.type = 'button';
            languageButton.textContent = 'Select Language';
            languageButton.setAttribute('data-bs-toggle', 'dropdown');
            languageButton.setAttribute('aria-expanded', 'false');
            
            // Add manual toggle handling
            languageButton.addEventListener('click', toggleDropdown);
            
            const languageMenu = document.createElement('ul');
            languageMenu.className = 'dropdown-menu';
            
            // Add languages to the dropdown
            if (data.languages) {
                Object.entries(data.languages).forEach(([langName, langCode]) => {
                    const langItem = document.createElement('li');
                    const langLink = document.createElement('a');
                    langLink.className = 'dropdown-item';
                    langLink.href = '#';
                    langLink.textContent = langName;
                    langLink.dataset.language = langName;
                    langLink.dataset.langCode = langCode;
                    
                    langLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        // Update the button text
                        languageButton.textContent = langName;
                        // Set the selected language
                        selectedLanguage = langName;
                        selectedLanguageCode = langCode;
                        // Update source language select to match
                        if (sourceLanguageSelect) {
                            populateSourceLanguageSelect(Object.keys(data.languages));
                            sourceLanguageSelect.value = selectedLanguage;
                        }
                        // Close the dropdown
                        languageMenu.classList.remove('show');
                    });
                    
                    langItem.appendChild(langLink);
                    languageMenu.appendChild(langItem);
                });
            }
            
            languageContainer.appendChild(languageButton);
            languageContainer.appendChild(languageMenu);
            
            characterBox.appendChild(icon);
            characterBox.appendChild(characterName);
            characterBox.appendChild(description);
            characterBox.appendChild(languageContainer);
            
            characterGrid.appendChild(characterBox);
            
            // Add click event to character box with visual selection
            characterBox.addEventListener('click', function(e) {
                // Don't process the click if we clicked on a dropdown or dropdown item
                if (e.target.matches('.dropdown-toggle') || e.target.matches('.dropdown-item') || 
                    e.target.closest('.dropdown-menu')) {
                    return;
                }
                
                // Remove selected class from all boxes
                document.querySelectorAll('.character-box').forEach(box => {
                    box.classList.remove('selected');
                });
                
                // Add selected class to this box
                this.classList.add('selected');
                
                // Select the character
                selectedCharacter = name;
                
                // Update character select dropdown if it exists
                if (characterSelect) {
                    characterSelect.value = name;
                }
                
                // Reset language selection
                const langButton = this.querySelector('.dropdown-toggle');
                if (langButton) {
                    langButton.textContent = 'Select Language';
                }
                
                // Auto-select the first language if available
                const firstLangItem = this.querySelector('.dropdown-item');
                if (firstLangItem) {
                    // Simulate a click on the first language
                    firstLangItem.click();
                }
            });
        });
        
        // Select first character by default
        if (Object.keys(characters).length > 0) {
            const firstCharName = Object.keys(characters)[0];
            const firstCharBox = document.querySelector(`.character-box[data-character="${firstCharName}"]`);
            if (firstCharBox) {
                // Simulate a click on the first character box
                firstCharBox.click();
            }
            
            // Also update the character select dropdown if it exists
            if (characterSelect) {
                characterSelect.value = firstCharName;
            }
        }
    }

    // Function to load languages for a character (for the dropdown select)
    function loadLanguagesForCharacter(character) {
        // Skip if no dropdown menu exists
        if (!languageDropdownMenu) return;
        
        fetch('/get_languages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ character: character })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateLanguageDropdown(data.languages);
                // Also update the character selection in the grid if available
                selectCharacterInGrid(character);
            } else {
                console.error('Error loading languages:', data.error);
                // Try using fallback data
                const fallbackData = fallbackCharacters[character];
                if (fallbackData && fallbackData.languages) {
                    populateLanguageDropdown(fallbackData.languages);
                    selectCharacterInGrid(character);
                } else {
                    showError('Failed to load languages: ' + data.error);
                }
            }
        })
        .catch(error => {
            console.error('Network error when loading languages:', error);
            // Try using fallback data
            const fallbackData = fallbackCharacters[character];
            if (fallbackData && fallbackData.languages) {
                populateLanguageDropdown(fallbackData.languages);
                selectCharacterInGrid(character);
            } else {
                showError('Network error when loading languages');
            }
        });
    }

    // Function to select a character in the grid
    function selectCharacterInGrid(character) {
        // Remove selection from all character boxes
        document.querySelectorAll('.character-box').forEach(box => {
            box.classList.remove('selected');
        });
        
        // Find and select the character box
        const characterBox = document.querySelector(`.character-box[data-character="${character}"]`);
        if (characterBox) {
            characterBox.classList.add('selected');
            selectedCharacter = character;
            
            // Auto-select the first language
            const firstLangItem = characterBox.querySelector('.dropdown-item');
            if (firstLangItem) {
                firstLangItem.click();
            }
        }
    }

    // Populate the language dropdown (for the main dropdown, not in character boxes)
    function populateLanguageDropdown(languages) {
        if (!languageDropdownMenu) return;
        
        // Clear current options
        languageDropdownMenu.innerHTML = '';
        
        // Add languages from the object
        Object.entries(languages).forEach(([lang, code]) => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            
            link.textContent = lang;
            link.className = 'dropdown-item';
            link.href = '#';
            link.dataset.value = code;
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update the button text
                if (languageDropdownButton) {
                    languageDropdownButton.textContent = lang;
                    languageDropdownButton.dataset.value = code;
                }
                
                // Set selected language
                selectedLanguage = lang;
                selectedLanguageCode = code;
                
                // Close the dropdown
                languageDropdownMenu.classList.remove('show');
                
                // Trigger a custom event for language selection
                const event = new CustomEvent('languageSelected', {
                    detail: { language: lang, code: code }
                });
                document.dispatchEvent(event);
            });
            
            item.appendChild(link);
            languageDropdownMenu.appendChild(item);
        });
        
        // Setup dropdown toggle event if not already set
        if (languageDropdownButton && !languageDropdownButton._hasToggleListener) {
            languageDropdownButton.addEventListener('click', toggleDropdown);
            languageDropdownButton._hasToggleListener = true;
        }
        
        // Also update source language select
        if (sourceLanguageSelect) {
            populateSourceLanguageSelect(Object.keys(languages));
        }
    }

    // Function to populate source language select
    function populateSourceLanguageSelect(languages) {
        if (!sourceLanguageSelect) return;
        
        // Clear existing options
        sourceLanguageSelect.innerHTML = '';
        
        // Add languages
        languages.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            sourceLanguageSelect.appendChild(option);
        });
    }
    
    // Function to initialize audio recording
    async function initRecording() {
        if (!audio_context) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                audio_context = new AudioContext();
                
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Create our own recorder implementation if Recorder isn't defined
                if (typeof Recorder === 'undefined') {
                    console.log('Recorder not defined, creating custom implementation');
                    
                    // Create a simple audio recorder using MediaRecorder
                    const chunks = [];
                    const mediaRecorder = new MediaRecorder(stream);
                    
                    mediaRecorder.ondataavailable = (e) => {
                        chunks.push(e.data);
                    };
                    
                    recorder = {
                        record: function() {
                            chunks.length = 0; // Clear previous chunks
                            mediaRecorder.start();
                        },
                        stop: function() {
                            mediaRecorder.stop();
                        },
                        clear: function() {
                            chunks.length = 0;
                        },
                        exportWAV: function(callback) {
                            mediaRecorder.onstop = () => {
                                const blob = new Blob(chunks, { type: 'audio/wav' });
                                callback(blob);
                            };
                        }
                    };
                } else {
                    // Use the external Recorder implementation
                    const input = audio_context.createMediaStreamSource(stream);
                    recorder = new Recorder(input);
                }
                
                console.log('Audio recording initialized');
                return true;
            } catch (e) {
                console.error('Error initializing audio recording:', e);
                showError('Could not initialize audio recording: ' + e.message);
                return false;
            }
        }
        return true;
    }
    //from here 
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Bootstrap dropdowns
        var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
        var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl)
        });
        
        // Handle dropdown item selection
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const value = this.getAttribute('data-value');
                const text = this.textContent;
                const dropdownButton = this.closest('.dropdown').querySelector('.dropdown-toggle');
                
                // Update button text
                dropdownButton.textContent = text;
                
                // Set selected value (you can use this value in your app)
                dropdownButton.setAttribute('data-selected', value);
                
                // Custom event so your app knows a selection was made
                const event = new CustomEvent('languageSelected', {
                    detail: { language: value }
                });
                document.dispatchEvent(event);
            });
        });
        
        // Alternative approach: fix non-functional select elements
        document.querySelectorAll('select.form-select').forEach(select => {
            // Force pointer events
            select.style.pointerEvents = 'auto';
            
            // Add explicit focus and click handlers
            select.addEventListener('mousedown', function(e) {
                this.focus();
                e.stopPropagation();
            });
            
            select.addEventListener('change', function(e) {
                console.log('Language selected:', this.value);
            });
        });
    });

    //till here the new code has been added 
    // Function to start recording with improved UI feedback
    async function startRecording() {
        if (recording) return;
        if (!selectedCharacter || !selectedLanguage) {
            showError('Please select a character and language first.');
            return;
        }
        
        const initialized = await initRecording();
        if (!initialized) return;
        
        recorder.clear();
        recorder.record();
        recording = true;
        recordingSeconds = 0;
        
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        startRecordingBtn.classList.add('recording');
        
        // Reset the progress bar
        recordingProgress.style.width = '0%';
        recordingProgress.setAttribute('aria-valuenow', 0);
        recordingProgress.textContent = '0s';
        
        // Start recording timer with seconds display
        recordingTimer = setInterval(() => {
            recordingSeconds++;
            const progress = (recordingSeconds / MAX_RECORDING_TIME) * 100;
            recordingProgress.style.width = `${progress}%`;
            recordingProgress.setAttribute('aria-valuenow', progress);
            recordingProgress.textContent = `${recordingSeconds}s`;
            
            if (recordingSeconds >= MAX_RECORDING_TIME) {
                stopRecording();
            }
        }, 1000);
    }

    // Function to stop recording with improved UI feedback
    function stopRecording() {
        if (!recording) return;
        
        recorder.stop();
        recording = false;
        clearInterval(recordingTimer);
        clearInterval(progressTimer);
        
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        startRecordingBtn.classList.remove('recording');
        
        // Update progress bar to show processing state
        recordingProgress.style.width = '100%';
        recordingProgress.setAttribute('aria-valuenow', 100);
        recordingProgress.textContent = 'Processing...';
        
        // Show processing message
        responseText.innerHTML = '<p>Processing your audio...</p>';
        
        // Export the recording
        recorder.exportWAV(blob => {
            sendAudioToServer(blob);
        });
    }

    // Function to send audio to server
    function sendAudioToServer(blob) {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.wav');
        formData.append('language', selectedLanguage);
        formData.append('language_code', selectedLanguageCode);
        formData.append('character', selectedCharacter);
        
        // Get character details from data
        const charData = characterData[selectedCharacter] || fallbackCharacters[selectedCharacter];
        if (charData) {
            formData.append('voice_id', charData.id || '');
            formData.append('api_version', charData.api || '1');
        }
        
        fetch('/process_audio', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Reset the progress bar
            recordingProgress.style.width = '0%';
            recordingProgress.setAttribute('aria-valuenow', 0);
            recordingProgress.textContent = '';
            
            if (data.success) {
                displayResponse(data);
            } else {
                console.error('Error processing audio:', data.error);
                showError('Error processing audio: ' + data.error);
                responseText.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred while processing your audio.');
            responseText.innerHTML = '<p class="text-danger">An error occurred while processing your audio.</p>';
            
            // Reset the progress bar
            recordingProgress.style.width = '0%';
            recordingProgress.setAttribute('aria-valuenow', 0);
            recordingProgress.textContent = '';
        });
    }

    // Function to send text message with improved display
    function sendTextMessage() {
        const text = textInput.value.trim();
        if (!text) {
            showError('Please enter a message.');
            return;
        }
        
        if (!selectedCharacter || !selectedLanguage) {
            showError('Please select a character and language first.');
            return;
        }
        
        // Show processing message
        responseText.innerHTML = '<p class="text-center"><i>Processing your message...</i></p>';
        
        // Get character details from data
        const charData = characterData[selectedCharacter] || fallbackCharacters[selectedCharacter];
        let voiceId = '';
        let apiVersion = '1';
        
        if (charData) {
            voiceId = charData.id || '';
            apiVersion = charData.api || '1';
        }
        
        // Get source language code
        const sourceLanguageName = sourceLanguageSelect ? sourceLanguageSelect.value : selectedLanguage;
        let sourceLanguageCode = selectedLanguageCode; // Default
        
        if (charData && charData.languages && charData.languages[sourceLanguageName]) {
            sourceLanguageCode = charData.languages[sourceLanguageName];
        }
        
        const requestData = {
            text: text,
            source_language: sourceLanguageName,
            source_language_code: sourceLanguageCode,
            target_language: selectedLanguage,
            target_language_code: selectedLanguageCode,
            character: selectedCharacter,
            voice_id: voiceId,
            api_version: apiVersion
        };
        
        fetch('/process_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display improved response with 'You:' and 'Response:' labels
                responseText.innerHTML = `
                    <p><strong>You:</strong> ${text}</p>
                    <p><strong>Response:</strong> ${data.response_text}</p>
                `;
                
                // Display audio response
                if (data.audio_file) {
                    audioResponse.src = data.audio_file;
                    audioPlayer.style.display = 'block';
                    audioResponse.play();
                }
                
                textInput.value = ''; // Clear the text input
            } else {
                console.error('Error processing text:', data.error);
                showError('Error processing text: ' + data.error);
                responseText.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred while processing your message.');
            responseText.innerHTML = '<p class="text-danger">An error occurred while processing your message.</p>';
        });
    }

    // Function to display response
    function displayResponse(data) {
        // Display text response with transcription
        if (data.transcribed_text) {
            responseText.innerHTML = `
                <p><strong>You said:</strong> ${data.transcribed_text}</p>
                <p><strong>Response:</strong> ${data.response_text}</p>
            `;
        } else {
            responseText.innerHTML = `<p>${data.response_text}</p>`;
        }
        
        // Display audio response
        if (data.audio_file) {
            audioResponse.src = data.audio_file;
            audioPlayer.style.display = 'block';
            audioResponse.play();
        }
    }
});