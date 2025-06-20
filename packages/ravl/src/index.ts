// Delayed recall instructions
import { JsPsych } from "jspsych";
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { englishText, WORD_LIST, WORD_LIST_B, RECOGNITION_WORDS, substituteText } from "./text";

interface TimelineConfig {
  num_learning_trials?: number; // Number of List A learning trials (A1-A5, default: 5)
  word_presentation_duration?: number; // Duration in ms for each word (default: 1000)
  inter_word_interval?: number; // Interval between words in ms (default: 1000)
  include_delayed_recall?: boolean; // Whether to include delayed recall phase (default: true)
  include_interference_trial?: boolean; // Whether to include List B interference trial (default: true)
  include_trial_a6?: boolean; // Whether to include Trial A6 after interference (default: true)
  include_recognition_trial?: boolean; // Whether to include recognition trial (default: true)
  delay_duration_minutes?: number; // Duration of delay period (default: 20)
  randomize_word_order?: boolean; // Whether to randomize word presentation order (default: false)
  show_word_grid?: boolean; // Whether to show word grid for recall vs free text (default: false for clinical accuracy)
  max_recall_time?: number; // Maximum time for recall phase in ms (default: null - no limit)
  min_delay_minutes?: number; // Minimum delay before delayed recall (default: 15)
  max_delay_minutes?: number; // Maximum delay before delayed recall (default: 30)
  show_delay_timer?: boolean; // Whether to show progress bar during delay (default: true)
  text_to_speech_enabled?: boolean; // Whether to enable text-to-speech for instructions (default: false)
  read_words_aloud?: boolean; // Whether to read words from the word list aloud during presentation (default: false)
}

export function createTimeline(jsPsych: JsPsych, config: TimelineConfig = {}) {
  const { 
    num_learning_trials = 5, // Standard RAVLT: A1-A5
    word_presentation_duration = 1000, // NIH standard: 1 second per word
    inter_word_interval = 1000, // NIH standard: 1 second between words
    include_delayed_recall = true,
    include_interference_trial = true, // Standard RAVLT includes List B
    include_trial_a6 = true, // Standard RAVLT includes A6 after interference
    include_recognition_trial = true, // Standard RAVLT includes recognition
    delay_duration_minutes = 20, // NIH standard: 20 minutes
    randomize_word_order = false, // Clinical standard: fixed order
    show_word_grid = false, // Clinical standard: auditory only
    max_recall_time = null, // NIH standard: no time limit
    min_delay_minutes = 15, // More realistic minimum
    max_delay_minutes = 30,
    show_delay_timer = true,
    text_to_speech_enabled = false,
    read_words_aloud = false
  } = config;

  // Variables to store timing and results
  let ravltStartTime: number;
  let ravltEndTime: number;
  let delayStartTime: number;
  let learningTrialResults: Array<{trial: number, words_recalled: string[], correct_count: number, intrusion_errors: string[]}> = [];
  let interferenceResult: {words_recalled: string[], correct_count: number} | null = null;
  let trialA6Result: {words_recalled: string[], correct_count: number, intrusion_errors: string[]} | null = null;
  let delayResult: {words_recalled: string[], correct_count: number, intrusion_errors: string[]} | null = null;
  let recognitionResult: {words_selected: string[], correct_hits: number, false_alarms: number, correct_rejections: number, misses: number} | null = null;
  let assessmentNotes: string[] = [];

  // Helper function to add assessment notes
  function addAssessmentNote(note: string) {
    assessmentNotes.push(`${new Date().toISOString()}: ${note}`);
    console.log('Assessment Note:', note);
  }

  // Helper function to cancel all speech synthesis
  function cancelAllSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // Helper function to play a chime sound using Web Audio API
  function playChime() {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a sequence of bell-like tones
      const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure oscillator (sine wave for bell-like tone)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Configure envelope (quick attack, slow decay)
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Slow decay
        
        // Start and stop
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play a pleasant chime sequence (C-E-G chord arpeggiated)
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.8, 0.4);      // C5
      playTone(659.25, now + 0.1, 0.9, 0.3); // E5  
      playTone(783.99, now + 0.2, 1.0, 0.2); // G5
      
    } catch (error) {
      // Fallback: try to use a simple beep or notification sound
      console.warn('Web Audio API not available, chime sound skipped:', error);
    }
  }

  // Helper function for text-to-speech
  function speakText(text: string, delay: number = 500, onComplete?: () => void) {
    if (!text_to_speech_enabled || !window.speechSynthesis) {
      // If TTS is disabled but callback is provided, call it after the delay
      if (onComplete) {
        setTimeout(onComplete, delay);
      }
      return;
    }
    
    // Clean HTML tags from text for TTS
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanText.length === 0) {
      if (onComplete) {
        setTimeout(onComplete, delay);
      }
      return;
    }

    setTimeout(() => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Use a clear, neutral voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Call the completion callback when TTS finishes
      if (onComplete) {
        utterance.onend = onComplete;
      }
      
      window.speechSynthesis.speak(utterance);
    }, delay);
  }

    const delayedRecallInstructions = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h3>${englishText.delayed_recall}</h3>
        ${englishText.delayed_recall_instructions_text}
      </div>
    `,
    choices: [englishText.ready],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.delayed_recall}. ${englishText.delayed_recall_instructions_text}`);
    },
    data: {
      task: 'delayed_recall_instructions'
    }
  };


  // Helper function to validate delay timing
  function validateDelayTiming(): {valid: boolean, warning: string | null, timingInfo: any} {
    if (!ravltEndTime) {
      return {
        valid: false,
        warning: englishText.trial_warning,
        timingInfo: null
      };
    }

    const currentTime = Date.now();
    const timeSinceRavlt = (currentTime - ravltEndTime) / (1000 * 60); // minutes
    
    const timingInfo = {
      ravlt_end_time: new Date(ravltEndTime).toISOString(),
      current_time: new Date(currentTime).toISOString(),
      minutes_since_ravlt: Math.round(timeSinceRavlt * 10) / 10
    };

    if (timeSinceRavlt < min_delay_minutes) {
      return {
        valid: false,
        warning: substituteText(englishText.too_soon_warning, {
          minutes: Math.round(timeSinceRavlt * 10) / 10,
          minDelay: min_delay_minutes
        }),
        timingInfo
      };
    }

    if (timeSinceRavlt > max_delay_minutes) {
      return {
        valid: false,
        warning: substituteText(englishText.too_late_warning, {
          minutes: Math.round(timeSinceRavlt * 10) / 10,
          maxDelay: max_delay_minutes
        }),
        timingInfo
      };
    }

    return {
      valid: true,
      warning: null,
      timingInfo
    };
  }

  // Helper function to score recalled words from List A
  function scoreListARecall(recalledWords: string[]): {correct: string[], intrusion_errors: string[], score: number} {
    const correct: string[] = [];
    const intrusion_errors: string[] = [];
    
    recalledWords.forEach(word => {
      const normalizedWord = word.toLowerCase().trim();
      if (WORD_LIST.map(w => w.toLowerCase()).includes(normalizedWord)) {
        correct.push(word);
      } else {
        intrusion_errors.push(word);
      }
    });
    
    return {
      correct,
      intrusion_errors,
      score: correct.length
    };
  }

  // Helper function to score recalled words from List B
  function scoreListBRecall(recalledWords: string[]): {correct: string[], incorrect: string[], score: number} {
    const correct: string[] = [];
    const incorrect: string[] = [];
    
    recalledWords.forEach(word => {
      const normalizedWord = word.toLowerCase().trim();
      if (WORD_LIST_B.map(w => w.toLowerCase()).includes(normalizedWord)) {
        correct.push(word);
      } else {
        incorrect.push(word);
      }
    });
    
    return {
      correct,
      incorrect,
      score: correct.length
    };
  }

  // Helper function to score recognition trial
  function scoreRecognition(selectedWords: string[]): {correct_hits: number, false_alarms: number, correct_rejections: number, misses: number} {
    const selectedNormalized = selectedWords.map(w => w.toLowerCase().trim());
    const listANormalized = WORD_LIST.map(w => w.toLowerCase());
    const distractorsNormalized = RECOGNITION_WORDS.filter(w => !WORD_LIST.includes(w)).map(w => w.toLowerCase());
    
    // Hits: List A words correctly identified
    const hits = listANormalized.filter(word => selectedNormalized.includes(word));
    
    // False alarms: Distractor words incorrectly selected
    const falseAlarms = distractorsNormalized.filter(word => selectedNormalized.includes(word));
    
    // Misses: List A words not selected
    const misses = listANormalized.filter(word => !selectedNormalized.includes(word));
    
    // Correct rejections: Distractor words correctly not selected
    const correctRejections = distractorsNormalized.filter(word => !selectedNormalized.includes(word));
    
    return {
      correct_hits: hits.length,
      false_alarms: falseAlarms.length,
      correct_rejections: correctRejections.length,
      misses: misses.length
    };
  }

  // Get word list (potentially randomized)
  const getWordList = () => {
    return randomize_word_order ? [...WORD_LIST].sort(() => Math.random() - 0.5) : WORD_LIST;
  };

  // Welcome screen
  const welcome = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 20px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h2>${englishText.welcome_title}</h2>
        ${englishText.welcome_text}
      </div>
    `,
    choices: [englishText.welcome_start_button],
    on_load: function() {
      speakText(`${englishText.welcome_title}. ${englishText.welcome_text}`);
    },
    on_finish: function() {
      ravltStartTime = Date.now();
    }
  };

  // Trial instructions
  const createTrialInstructions = (trialNumber: number) => {
    let instructionText = '';
    
    if (trialNumber === 1) {
      instructionText = `
        <h3>${englishText.trial} ${trialNumber}</h3>
        <p>${englishText.instruction_text_trial1}</p>
      `;
    } else {
      instructionText = `
        <h3>${englishText.trial} ${trialNumber}</h3>
        <p>${englishText.instruction_text}</p>
      `;
    }
    
    return {
      type: htmlButtonResponse,
      stimulus: `
        <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          ${instructionText}
        </div>
      `,
      choices: [englishText.continue],
      on_load: function() {
        cancelAllSpeech();
        const textToSpeak = trialNumber === 1 ? 
          `${englishText.trial} ${trialNumber}. ${englishText.instruction_text_trial1}` :
          `${englishText.trial} ${trialNumber}. ${englishText.instruction_text}`;
        speakText(textToSpeak);
      },
      data: {
        task: 'ravlt_trial_instructions',
        trial_number: trialNumber
      }
    };
  };

  // Audio presentation (placeholder - in real implementation would use audio plugin)
  const createWordPresentation = (trialNumber: number) => {
    return {
      type: htmlButtonResponse,
      stimulus: `
        <div style="font-size: 24px; text-align: center; padding: 50px;">
          <h3>${englishText.trial} ${trialNumber}</h3>
          <p>${englishText.listen_carefully}.</p>
          <div style="margin: 40px 0;">
            <div id="word-display" style="font-size: 36px; font-weight: bold; height: 60px; line-height: 60px;">
              ${englishText.ready}
            </div>
          </div>
          <p style="font-size: 16px; color: #666;">
            ${englishText.create_word_presentation_text}.
          </p>
        </div>
      `,
      choices: [englishText.continue],
      on_load: function() {
        cancelAllSpeech();
        
        // Use potentially randomized word list
        const currentWordList = getWordList();
        let wordIndex = 0;
        const wordDisplay = document.getElementById('word-display');
        
        // Helper function to speak a word (if audio is enabled)
        const speakWord = (word: string) => {
          if (!read_words_aloud || !window.speechSynthesis) {
            return;
          }
          
          // Cancel any previous word speech for clarity (instruction TTS should be done by now)
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.rate = 0.8; // Slower rate for clear word pronunciation
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
          
          // Use a clear, neutral voice if available
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Google') || voice.name.includes('Microsoft'))
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        };
        
        const presentWord = () => {
          if (wordIndex < currentWordList.length) {
            // Update visual display
            wordDisplay!.textContent = currentWordList[wordIndex];
            
            // Read word aloud (instruction TTS should be complete by now)
            speakWord(currentWordList[wordIndex]);
            
            wordIndex++;
            setTimeout(presentWord, inter_word_interval);
          } else {
            // Clear the display and play chime sound when word presentation is complete
            wordDisplay!.textContent = '';
            playChime();
          }
        };
        
        // Function to start word presentation sequence
        const startWordPresentation = () => {
          setTimeout(presentWord, 1000); // Start after 1 second
        };
        
        // Announce trial instructions with TTS and start words when it completes
        if (text_to_speech_enabled) {
          // Start word presentation only after instruction TTS completes
          speakText(
            `${englishText.trial} ${trialNumber}. ${englishText.listen_carefully}. ${englishText.create_word_presentation_text}.`,
            500,
            startWordPresentation
          );
        } else {
          // No instruction TTS, start word presentation immediately
          startWordPresentation();
        }
      },
      data: {
        task: 'ravlt_word_presentation',
        trial_number: trialNumber,
        word_presentation_duration: word_presentation_duration,
        inter_word_interval: inter_word_interval,
        randomized_order: randomize_word_order
      }
    };
  };

  // Recall phase
  const createRecallPhase = (trialNumber: number) => {
    const recallStimulus = show_word_grid ? `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.trial} ${trialNumber} - ${englishText.recall}</h3>
        <p>${englishText.recall_instructions}</p>          
        <div id="word-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; max-width: 600px;">
          ${WORD_LIST.map(word => `
            <button type="button" class="word-button" data-word="${word}" 
                    style="padding: 10px; font-size: 14px; border: 2px solid #ddd; 
                           background: white; cursor: pointer; border-radius: 5px;">
              ${word}
            </button>
          `).join('')}
        </div>
        ${max_recall_time ? `<p><em>${substituteText(englishText.maximum_time, { seconds: Math.round(max_recall_time / 1000) })}</em></p>` : ''}
      </div>
    ` : `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.trial} ${trialNumber} - ${englishText.recall}</h3>
        <p>${englishText.recall_type_instructions}</p>
        <textarea id="recall-input" style="width: 100%; height: 150px; font-size: 16px; padding: 10px; margin: 20px 0;"></textarea>
        ${max_recall_time ? `<p><em>${substituteText(englishText.maximum_time, { seconds: Math.round(max_recall_time / 1000) })}</em></p>` : ''}
      </div>
    `;

    return {
      type: htmlButtonResponse,
      stimulus: recallStimulus,
      choices: [englishText.submit],
      trial_duration: max_recall_time,
      on_load: function() {
        cancelAllSpeech();
        
        // Announce recall instructions with TTS
        const recallInstructions = show_word_grid ? 
          `${englishText.trial} ${trialNumber} ${englishText.recall}. ${englishText.recall_instructions}` :
          `${englishText.trial} ${trialNumber} ${englishText.recall}. ${englishText.recall_type_instructions}`;
        speakText(recallInstructions);
        
        if (show_word_grid) {
          const selectedWords = new Set<string>();
          const wordButtons = document.querySelectorAll('.word-button');
          const selectedWordsDisplay = document.getElementById('selected-words');
          
          wordButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              const word = (button as HTMLElement).dataset.word!;
              
              if (selectedWords.has(word)) {
                selectedWords.delete(word);
                (button as HTMLElement).style.backgroundColor = 'white';
                (button as HTMLElement).style.borderColor = '#ddd';
                (button as HTMLElement).style.color = 'black';
              } else {
                selectedWords.add(word);
                (button as HTMLElement).style.backgroundColor = '#007cba';
                (button as HTMLElement).style.borderColor = '#005a87';
                (button as HTMLElement).style.color = 'white';
              }
              
              if (selectedWordsDisplay) {
                selectedWordsDisplay.textContent = selectedWords.size > 0 ? 
                  Array.from(selectedWords).join(', ') : englishText.none;
              }
            });
          });
          
          // Store selected words for access in on_finish
          (window as any).currentSelectedWords = selectedWords;
        }
      },
      on_finish: function(data: any) {
        let selectedWords: string[];
        
        if (show_word_grid) {
          selectedWords = Array.from((window as any).currentSelectedWords || []) as string[];
          delete (window as any).currentSelectedWords;
        } else {
          const textareaValue = (document.getElementById('recall-input') as HTMLTextAreaElement)?.value || '';
          selectedWords = textareaValue.split(',').map(word => word.trim()).filter(word => word.length > 0);
        }
        
        const results = scoreListARecall(selectedWords);
        
        learningTrialResults.push({
          trial: trialNumber,
          words_recalled: selectedWords,
          correct_count: results.score,
          intrusion_errors: results.intrusion_errors
        });
        
        // Add detailed results to jsPsych data
        jsPsych.data.addProperties({
          [`trial_${trialNumber}_recalled`]: selectedWords,
          [`trial_${trialNumber}_correct`]: results.correct,
          [`trial_${trialNumber}_intrusions`]: results.intrusion_errors,
          [`trial_${trialNumber}_score`]: results.score
        });

        // Mark RAVLT learning phase end time after the last learning trial
        if (trialNumber === num_learning_trials) {
          ravltEndTime = Date.now();
        }
      },
      data: {
        task: 'ravlt_recall',
        trial_number: trialNumber
      }
    };
  };

  // Interference trial instructions (List B)
  const interferenceInstructions = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h3>${englishText.interference_trial}</h3>
        ${englishText.interference_instruction_text}
      </div>
    `,
    choices: [englishText.continue],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.interference_trial}. ${englishText.interference_instruction_text}`);
    },
    data: {
      task: 'interference_instructions'
    }
  };

  // Interference trial word presentation (List B)
  const interferenceWordPresentation = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 24px; text-align: center; padding: 50px;">
        <h3>${englishText.interference_trial} - ${englishText.list_b}</h3>
        <p>${englishText.listen_carefully}.</p>
        <div style="margin: 40px 0;">
          <div id="word-display" style="font-size: 36px; font-weight: bold; height: 60px; line-height: 60px;">
            ${englishText.ready}
          </div>
        </div>
        <p style="font-size: 16px; color: #666;">
          ${englishText.create_word_presentation_text}.
        </p>
      </div>
    `,
    choices: [englishText.continue],
    on_load: function() {
      cancelAllSpeech();
      
      let wordIndex = 0;
      const wordDisplay = document.getElementById('word-display');
      
      // Helper function to speak a word (if audio is enabled)
      const speakWord = (word: string) => {
        if (!read_words_aloud || !window.speechSynthesis) {
          return;
        }
        
        // Cancel any previous word speech for clarity (instruction TTS should be done by now)
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8; // Slower rate for clear word pronunciation
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        
        // Use a clear, neutral voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      };
      
      const presentWord = () => {
        if (wordIndex < WORD_LIST_B.length) {
          // Update visual display
          wordDisplay!.textContent = WORD_LIST_B[wordIndex];
          
          // Read word aloud (instruction TTS should be complete by now)
          speakWord(WORD_LIST_B[wordIndex]);
          
          wordIndex++;
          setTimeout(presentWord, inter_word_interval);
        } else {
          // Clear the display and play chime sound when word presentation is complete
          wordDisplay!.textContent = '';
          playChime();
        }
      };
      
      // Function to start word presentation sequence
      const startWordPresentation = () => {
        setTimeout(presentWord, 1000); // Start after 1 second
      };
      
      // Announce trial instructions with TTS and start words when it completes
      if (text_to_speech_enabled) {
        // Start word presentation only after instruction TTS completes
        speakText(
          `${englishText.interference_trial} ${englishText.list_b}. ${englishText.listen_carefully}. ${englishText.create_word_presentation_text}.`,
          500,
          startWordPresentation
        );
      } else {
        // No instruction TTS, start word presentation immediately
        startWordPresentation();
      }
    },
    data: {
      task: 'interference_word_presentation',
      word_presentation_duration: word_presentation_duration,
      inter_word_interval: inter_word_interval
    }
  };

  // Interference trial recall (List B)
  const interferenceRecall = {
    type: htmlButtonResponse,
    stimulus: show_word_grid ? `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.interference_trial} - ${englishText.recall}</h3>
        <p>${englishText.recall_instructions}</p>          
        <div id="word-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; max-width: 600px;">
          ${WORD_LIST_B.map(word => `
            <button type="button" class="word-button" data-word="${word}" 
                    style="padding: 10px; font-size: 14px; border: 2px solid #ddd; 
                           background: white; cursor: pointer; border-radius: 5px;">
              ${word}
            </button>
          `).join('')}
        </div>
      </div>
    ` : `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.interference_trial} - ${englishText.recall}</h3>
        <p>${englishText.recall_type_instructions}</p>
        <textarea id="recall-input" style="width: 100%; height: 150px; font-size: 16px; padding: 10px; margin: 20px 0;"></textarea>
      </div>
    `,
    choices: [englishText.submit],
    trial_duration: max_recall_time,
    on_load: function() {
      cancelAllSpeech();
      
      const recallInstructions = show_word_grid ? 
        `${englishText.interference_trial} ${englishText.recall}. ${englishText.recall_instructions}` :
        `${englishText.interference_trial} ${englishText.recall}. ${englishText.recall_type_instructions}`;
      speakText(recallInstructions);
      
      if (show_word_grid) {
        const selectedWords = new Set<string>();
        const wordButtons = document.querySelectorAll('.word-button');
        
        wordButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const word = (button as HTMLElement).dataset.word!;
            
            if (selectedWords.has(word)) {
              selectedWords.delete(word);
              (button as HTMLElement).style.backgroundColor = 'white';
              (button as HTMLElement).style.borderColor = '#ddd';
              (button as HTMLElement).style.color = 'black';
            } else {
              selectedWords.add(word);
              (button as HTMLElement).style.backgroundColor = '#007cba';
              (button as HTMLElement).style.borderColor = '#005a87';
              (button as HTMLElement).style.color = 'white';
            }
          });
        });
        
        (window as any).currentSelectedWords = selectedWords;
      }
    },
    on_finish: function(data: any) {
      let selectedWords: string[];
      
      if (show_word_grid) {
        selectedWords = Array.from((window as any).currentSelectedWords || []) as string[];
        delete (window as any).currentSelectedWords;
      } else {
        const textareaValue = (document.getElementById('recall-input') as HTMLTextAreaElement)?.value || '';
        selectedWords = textareaValue.split(',').map(word => word.trim()).filter(word => word.length > 0);
      }
      
      const results = scoreListBRecall(selectedWords);
      
      interferenceResult = {
        words_recalled: selectedWords,
        correct_count: results.score
      };
      
      // Add detailed results to jsPsych data
      jsPsych.data.addProperties({
        interference_recalled: selectedWords,
        interference_correct: results.correct,
        interference_incorrect: results.incorrect,
        interference_score: results.score
      });
    },
    data: {
      task: 'interference_recall'
    }
  };

  // Trial A6 instructions (back to List A after interference)
  const trialA6Instructions = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h3>${englishText.trial_a6}</h3>
        ${englishText.trial_a6_instruction_text}
      </div>
    `,
    choices: [englishText.continue],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.trial_a6}. ${englishText.trial_a6_instruction_text}`);
    },
    data: {
      task: 'trial_a6_instructions'
    }
  };

  // Trial A6 recall (List A after interference)
  const trialA6Recall = {
    type: htmlButtonResponse,
    stimulus: show_word_grid ? `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.trial_a6} - ${englishText.original_list_recall}</h3>
        <p>${englishText.recall_instructions}</p>          
        <div id="word-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; max-width: 600px;">
          ${WORD_LIST.map(word => `
            <button type="button" class="word-button" data-word="${word}" 
                    style="padding: 10px; font-size: 14px; border: 2px solid #ddd; 
                           background: white; cursor: pointer; border-radius: 5px;">
              ${word}
            </button>
          `).join('')}
        </div>
      </div>
    ` : `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.trial_a6} - ${englishText.original_list_recall}</h3>
        <p>${englishText.recall_type_instructions}</p>
        <textarea id="recall-input" style="width: 100%; height: 150px; font-size: 16px; padding: 10px; margin: 20px 0;"></textarea>
      </div>
    `,
    choices: [englishText.submit],
    trial_duration: max_recall_time,
    on_load: function() {
      cancelAllSpeech();
      
      const recallInstructions = show_word_grid ? 
        `${englishText.trial_a6} ${englishText.original_list_recall}. ${englishText.recall_instructions}` :
        `${englishText.trial_a6} ${englishText.original_list_recall}. ${englishText.recall_type_instructions}`;
      speakText(recallInstructions);
      
      if (show_word_grid) {
        const selectedWords = new Set<string>();
        const wordButtons = document.querySelectorAll('.word-button');
        
        wordButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const word = (button as HTMLElement).dataset.word!;
            
            if (selectedWords.has(word)) {
              selectedWords.delete(word);
              (button as HTMLElement).style.backgroundColor = 'white';
              (button as HTMLElement).style.borderColor = '#ddd';
              (button as HTMLElement).style.color = 'black';
            } else {
              selectedWords.add(word);
              (button as HTMLElement).style.backgroundColor = '#007cba';
              (button as HTMLElement).style.borderColor = '#005a87';
              (button as HTMLElement).style.color = 'white';
            }
          });
        });
        
        (window as any).currentSelectedWords = selectedWords;
      }
    },
    on_finish: function(data: any) {
      let selectedWords: string[];
      
      if (show_word_grid) {
        selectedWords = Array.from((window as any).currentSelectedWords || []) as string[];
        delete (window as any).currentSelectedWords;
      } else {
        const textareaValue = (document.getElementById('recall-input') as HTMLTextAreaElement)?.value || '';
        selectedWords = textareaValue.split(',').map(word => word.trim()).filter(word => word.length > 0);
      }
      
      const results = scoreListARecall(selectedWords);
      
      trialA6Result = {
        words_recalled: selectedWords,
        correct_count: results.score,
        intrusion_errors: results.intrusion_errors
      };
      
      // Add detailed results to jsPsych data
      jsPsych.data.addProperties({
        trial_a6_recalled: selectedWords,
        trial_a6_correct: results.correct,
        trial_a6_intrusions: results.intrusion_errors,
        trial_a6_score: results.score
      });
    },
    data: {
      task: 'trial_a6_recall'
    }
  };

  // Dynamically create learning trials (A1-A5) based on num_learning_trials parameter
  const createTrialSequence = (trialNumber: number) => [
    createTrialInstructions(trialNumber),
    createWordPresentation(trialNumber),
    createRecallPhase(trialNumber)
  ];

  // Generate learning trials (A1-A5)
  const learningTrials = [];
  for (let i = 1; i <= num_learning_trials; i++) {
    learningTrials.push(...createTrialSequence(i));
  }

  // Create interference sequence (List B)
  const interferenceSequence = include_interference_trial ? [
    interferenceInstructions,
    interferenceWordPresentation,
    interferenceRecall
  ] : [];

  // Create Trial A6 sequence (back to original list)
  const trialA6Sequence = include_trial_a6 ? [
    trialA6Instructions,
    trialA6Recall
  ] : [];

  // Recognition trial (after delayed recall)
  const recognitionTrial = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.recognition_trial}</h3>
        ${englishText.recognition_instructions}
        <div id="word-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 20px 0; max-width: 800px;">
          ${RECOGNITION_WORDS.map(word => `
            <button type="button" class="word-button" data-word="${word}" 
                    style="padding: 8px; font-size: 13px; border: 2px solid #ddd; 
                           background: white; cursor: pointer; border-radius: 4px;">
              ${word}
            </button>
          `).join('')}
        </div>
        <div id="selected-words-display" style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <strong>${englishText.selected_words}:</strong> <span id="selected-words-list">${englishText.none}</span>
        </div>
      </div>
    `,
    choices: [englishText.submit],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.recognition_trial}. ${englishText.recognition_instructions}`);
      
      const selectedWords = new Set<string>();
      const wordButtons = document.querySelectorAll('.word-button');
      const selectedWordsDisplay = document.getElementById('selected-words-list');
      
      wordButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const word = (button as HTMLElement).dataset.word!;
          
          if (selectedWords.has(word)) {
            selectedWords.delete(word);
            (button as HTMLElement).style.backgroundColor = 'white';
            (button as HTMLElement).style.borderColor = '#ddd';
            (button as HTMLElement).style.color = 'black';
          } else {
            selectedWords.add(word);
            (button as HTMLElement).style.backgroundColor = '#007cba';
            (button as HTMLElement).style.borderColor = '#005a87';
            (button as HTMLElement).style.color = 'white';
          }
          
          if (selectedWordsDisplay) {
            selectedWordsDisplay.textContent = selectedWords.size > 0 ? 
              Array.from(selectedWords).join(', ') : englishText.none;
          }
        });
      });
      
      (window as any).currentSelectedWords = selectedWords;
    },
    on_finish: function(data: any) {
      const selectedWords = Array.from((window as any).currentSelectedWords || []) as string[];
      delete (window as any).currentSelectedWords;
      
      const results = scoreRecognition(selectedWords);
      
      recognitionResult = {
        words_selected: selectedWords,
        correct_hits: results.correct_hits,
        false_alarms: results.false_alarms,
        correct_rejections: results.correct_rejections,
        misses: results.misses
      };
      
      // Add detailed results to jsPsych data
      jsPsych.data.addProperties({
        recognition_selected: selectedWords,
        recognition_hits: results.correct_hits,
        recognition_false_alarms: results.false_alarms,
        recognition_correct_rejections: results.correct_rejections,
        recognition_misses: results.misses
      });
    },
    data: {
      task: 'recognition_trial'
    }
  };

  // Interim activities placeholder (5-25 minute delay)
  const interimActivities = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h3>${englishText.break_time}</h3>
        <p>${englishText.interim_text}</p>
        <p><em>${substituteText(englishText.delay_period, { minutes: delay_duration_minutes })}</em></p>
      </div>
    `,
    choices: [englishText.continue],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.break_time}. ${englishText.interim_text} ${substituteText(englishText.delay_period, { minutes: delay_duration_minutes })}`);
    },
    on_finish: function() {
      delayStartTime = Date.now();
    },
    data: {
      task: 'interim_break',
      delay_duration_minutes: delay_duration_minutes
    }
  };

  // Simple delay waiting screen that automatically advances after minimum time
  const delayWaitingScreen = {
    type: htmlButtonResponse,
    stimulus: function() {
      return `
        <div style="font-size: 18px; line-height: 1.5; max-width: 700px; margin: 0 auto;">
          <h3>${englishText.delay_period_header}</h3>
          <p>${substituteText(englishText.minimum_delay_text, { minDelay: min_delay_minutes, recommendedDelay: delay_duration_minutes })}</p>
          <p>${englishText.waiting_instructions}</p>
          
          <div style="margin: 30px 0;">
            <div style="background-color: #f0f0f0; border-radius: 10px; height: 30px; width: 100%; position: relative;">
              <div id="progress-fill" style="background: linear-gradient(90deg, #007cba, #005a87); height: 100%; width: 0%; border-radius: 10px; transition: width 1s ease;"></div>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #333; z-index: 10;">
                <span id="time-display">Starting...</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <div id="status-message" style="padding: 15px; background-color: #e8f4f8; border-radius: 5px; border: 1px solid #bee5eb;">
              <p><strong>ℹ️ Delay period in progress</strong></p>
              <p>${substituteText(englishText.delay_waiting_instructions, { minDelay: min_delay_minutes })}</p>
            </div>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
            <p><strong>${englishText.instructions_heading}</strong></p>
            <ul style="text-align: left; margin: 10px 0;">
              <li>${substituteText(englishText.delay_instructions.minimum_delay, { minDelay: min_delay_minutes })}</li>
              <li>${substituteText(englishText.delay_instructions.optimal_delay, { optimalDelay: delay_duration_minutes })}</li>
              <li>${englishText.delay_instructions.proceed_anytime}</li>
            </ul>
          </div>
        </div>
      `;
    },
    choices: [englishText.continue_to_delayed_recall],
    on_load: function() {
      cancelAllSpeech();
      
      // Announce delay period instructions with TTS
      speakText(`${englishText.delay_period_header}. ${substituteText(englishText.minimum_delay_text, { minDelay: min_delay_minutes, recommendedDelay: delay_duration_minutes })}. ${englishText.waiting_instructions}`);
      
      if (!delayStartTime) {
        delayStartTime = Date.now();
      }
      
      const startTime = delayStartTime;
      const minDelayMs = min_delay_minutes * 60 * 1000;
      const targetDelayMs = delay_duration_minutes * 60 * 1000;
      
      // Button is always visible - no hiding
      
      function updateDisplay() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / targetDelayMs) * 100, 100);
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
          progressFill.style.width = progress + '%';
        }
        
        // Update time display
        const elapsedMinutes = Math.floor(elapsed / 60000);
        const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
          const timeStr = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')} / ${delay_duration_minutes}:00`;
          timeDisplay.textContent = `${Math.round(progress)}% (${timeStr})`;
        }
        
        // Update status message
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
          if (elapsed >= minDelayMs) {
            statusMessage.innerHTML = `
              <p><strong>${englishText.minimum_delay_completed}</strong></p>
              <p>${englishText.optimal_timing_achieved}</p>
            `;
            statusMessage.style.backgroundColor = '#d4edda';
            statusMessage.style.borderColor = '#c3e6cb';
          } else {
            const remainingMs = minDelayMs - elapsed;
            const remainingMinutes = Math.floor(remainingMs / 60000);
            const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
            const remainingFormatted = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            statusMessage.innerHTML = `
              <p><strong>⏳ ${substituteText(englishText.delay_minimum_remaining, { remaining: remainingFormatted })}</strong></p>
              <p>${substituteText(englishText.delay_warning_proceed, { minDelay: min_delay_minutes })}</p>
            `;
            statusMessage.style.backgroundColor = '#fff3cd';
            statusMessage.style.borderColor = '#ffeaa7';
          }
        }
        
        // Continue updating
        setTimeout(updateDisplay, 1000);
      }
      
      // Start updates
      updateDisplay();
    },
    data: {
      task: 'delay_waiting_screen',
      min_delay_minutes: min_delay_minutes,
      delay_duration_minutes: delay_duration_minutes
    }
  };

  // Manual delay timer (user controls when to proceed)
  const delayProgressTimer = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 700px; margin: 0 auto;">
        <h3>${englishText.delay_period_in_progress}</h3>
        <p>${substituteText(englishText.minimum_delay_text, { minDelay: min_delay_minutes, recommendedDelay: delay_duration_minutes })}</p>
        <p>${englishText.waiting_instructions}</p>
        
        <div style="margin: 30px 0;">
          <div style="background-color: #f0f0f0; border-radius: 10px; height: 30px; width: 100%; position: relative;">
            <div id="progress-fill" style="background: linear-gradient(90deg, #007cba, #005a87); height: 100%; width: 0%; border-radius: 10px; transition: width 1s ease;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #333; z-index: 10;">
              <span id="time-display">${englishText.initial_elapsed_time}</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <div id="status-message" style="padding: 15px; background-color: #e8f4f8; border-radius: 5px; border: 1px solid #bee5eb;">
            <p><strong>ℹ️ Delay period in progress</strong></p>
            <p>${substituteText(englishText.delay_warning_proceed, { minDelay: min_delay_minutes })}</p>
          </div>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
          <p><strong>${englishText.instructions_heading}</strong></p>
          <ul style="text-align: left; margin: 10px 0;">
            <li>${substituteText(englishText.delay_instructions.minimum_delay, { minDelay: min_delay_minutes })}</li>
            <li>${substituteText(englishText.delay_instructions.optimal_delay, { optimalDelay: delay_duration_minutes })}</li>
            <li>${substituteText(englishText.delay_instructions.maximum_delay, { maxDelay: max_delay_minutes })}</li>
            <li>${englishText.delay_instructions.use_time}</li>
            <li>${englishText.delay_instructions.timing_warning}</li>
          </ul>
        </div>
      </div>
    `,
    choices: [englishText.proceed_to_delayed_recall],
    on_load: function() {
      cancelAllSpeech();
      
      // Announce delay progress timer instructions with TTS
      speakText(`${englishText.delay_period_in_progress}. ${substituteText(englishText.minimum_delay_text, { minDelay: min_delay_minutes, recommendedDelay: delay_duration_minutes })}. ${englishText.waiting_instructions}`);
      
      if (!delayStartTime) {
        delayStartTime = Date.now();
      }
      
      const startTime = delayStartTime;
      const minDelayMs = min_delay_minutes * 60 * 1000;
      const targetDelayMs = delay_duration_minutes * 60 * 1000;
      
      // Button is always visible - no hiding needed
      
      const updateInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / targetDelayMs) * 100, 100);
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
          progressFill.style.width = progress + '%';
        }
        
        // Update time display
        const elapsedMinutes = Math.floor(elapsed / 60000);
        const elapsedSeconds = Math.floor((elapsed % 60000) / 1000);
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
          timeDisplay.textContent = substituteText(englishText.elapsed_time, {
            minutes: elapsedMinutes,
            seconds: elapsedSeconds.toString().padStart(2, '0')
          });
        }
        
        // Update status based on elapsed time
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
          if (elapsed >= minDelayMs) {
            statusMessage.innerHTML = `
              <p><strong>${englishText.minimum_delay_completed}</strong></p>
              <p>${englishText.optimal_timing_achieved}</p>
            `;
            statusMessage.style.backgroundColor = '#d4edda';
            statusMessage.style.borderColor = '#c3e6cb';
          } else {
            const remainingMs = minDelayMs - elapsed;
            const remainingMinutes = Math.floor(remainingMs / 60000);
            const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
            const remainingFormatted = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            
            statusMessage.innerHTML = `
              <p><strong>⏳ ${substituteText(englishText.delay_minimum_remaining, { remaining: remainingFormatted })}</strong></p>
              <p>${substituteText(englishText.delay_warning_proceed, { minDelay: min_delay_minutes })}</p>
            `;
            statusMessage.style.backgroundColor = '#fff3cd';
            statusMessage.style.borderColor = '#ffeaa7';
          }
        }
      }, 1000);
      
      // Store interval for cleanup
      (window as any).delayUpdateInterval = updateInterval;
    },
    on_finish: function() {
      // Clean up interval
      if ((window as any).delayUpdateInterval) {
        clearInterval((window as any).delayUpdateInterval);
        delete (window as any).delayUpdateInterval;
      }
    },
    data: {
      task: 'delay_progress_timer',
      delay_duration_minutes: delay_duration_minutes,
      min_delay_minutes: min_delay_minutes
    }
  };

  // Delay timing validation screen
  const delayTimingValidation = {
    type: htmlButtonResponse,
    stimulus: function() {
      const validation = validateDelayTiming();
      
      if (validation.valid) {
        return `
          <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
            <h3>${englishText.timing_validation_passed}</h3>
            <p>${englishText.ready_to_begin_delayed_recall}</p>
            <p><strong>${substituteText(englishText.time_since_learning_trials, { minutes: validation.timingInfo.minutes_since_ravlt })}</strong></p>
          </div>
        `;
      } else {
        return `
          <div style="font-size: 18px; line-height: 1.5; max-width: 700px; margin: 0 auto;">
            <h3>${englishText.timing_validation_warning}</h3>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>${englishText.warning_label}</strong> ${validation.warning}</p>
              <p><strong>${substituteText(englishText.time_since_learning_trials, { minutes: validation.timingInfo?.minutes_since_ravlt || 'Unknown' })}</strong></p>
              <p><strong>${substituteText(englishText.recommended_delay_range, { minDelay: min_delay_minutes, maxDelay: max_delay_minutes })}</strong></p>
            </div>
            <p>${englishText.deviations_note}</p>
            <p><strong>${englishText.continue_anyway_question}</strong></p>
          </div>
        `;
      }
    },
    choices: function() {
      const validation = validateDelayTiming();
      return validation.valid ? [englishText.continue_btn] : [englishText.continue_anyway_btn, englishText.stop_assessment_btn];
    },
    on_load: function() {
      cancelAllSpeech();
      
      const validation = validateDelayTiming();
      if (validation.valid) {
        speakText(`${englishText.timing_validation_passed}. ${englishText.ready_to_begin_delayed_recall}. ${substituteText(englishText.time_since_learning_trials, { minutes: validation.timingInfo.minutes_since_ravlt })}`);
      } else {
        speakText(`${englishText.timing_validation_warning}. ${validation.warning} ${englishText.continue_anyway_question}`);
      }
    },
    on_finish: function(data: any) {
      const validation = validateDelayTiming();
      const choice = data.response;
      
      if (!validation.valid) {
        if (choice === 1) { // Stop Assessment
          addAssessmentNote(englishText.assessment_stopped_timing);
          // Record the early termination
          jsPsych.data.addProperties({
            assessment_terminated: true,
            termination_reason: 'timing_validation_failure',
            delay_timing_valid: validation.valid,
            delay_timing_warning: validation.warning,
            minutes_since_ravlt: validation.timingInfo?.minutes_since_ravlt,
            assessment_notes: [...assessmentNotes]
          });
          // Set flag to skip remaining trials
          data.skip_remaining = true;
          return;
        } else { // Continue Anyway
          addAssessmentNote(substituteText(englishText.outside_timing, {
            minutes: validation.timingInfo?.minutes_since_ravlt,
            minDelay: min_delay_minutes,
            maxDelay: max_delay_minutes
          }));
        }
      } else {
        addAssessmentNote(substituteText(englishText.within_timing, { 
          minutes: validation.timingInfo.minutes_since_ravlt 
        }));
      }
      
      // Record timing validation results
      jsPsych.data.addProperties({
        delay_timing_valid: validation.valid,
        delay_timing_warning: validation.warning,
        minutes_since_ravlt: validation.timingInfo?.minutes_since_ravlt,
        assessment_notes: [...assessmentNotes]
      });
    },
    data: {
      task: 'delay_timing_validation'
    }
  };

  // Delayed recall phase
  const delayedRecall = {
    type: htmlButtonResponse,
    stimulus: show_word_grid ? `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.delayed_recall}</h3>
        <p>${englishText.delayed_recall_text}</p>        
        <div id="word-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; max-width: 600px;">
          ${WORD_LIST.map(word => `
            <button type="button" class="word-button" data-word="${word}" 
                    style="padding: 10px; font-size: 14px; border: 2px solid #ddd; 
                           background: white; cursor: pointer; border-radius: 5px;">
              ${word}
            </button>
          `).join('')}
        </div>
      </div>
    ` : `
      <div style="font-size: 18px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.delayed_recall}</h3>
        <p>${englishText.recall_type_instructions}</p>
        <textarea id="recall-input" style="width: 100%; height: 150px; font-size: 16px; padding: 10px; margin: 20px 0;"></textarea>
      </div>
    `,
    choices: [englishText.submit],
    on_load: function() {
      cancelAllSpeech();
      
      // Announce delayed recall instructions with TTS
      const delayedRecallInstructions = show_word_grid ? 
        `${englishText.delayed_recall}. ${englishText.delayed_recall_text}` :
        `${englishText.delayed_recall}. ${englishText.recall_type_instructions}`;
      speakText(delayedRecallInstructions);
      
      if (show_word_grid) {
        const selectedWords = new Set<string>();
        const wordButtons = document.querySelectorAll('.word-button');
        const selectedWordsDisplay = document.getElementById('selected-words');
        
        wordButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const word = (button as HTMLElement).dataset.word!;
            
            if (selectedWords.has(word)) {
              selectedWords.delete(word);
              (button as HTMLElement).style.backgroundColor = 'white';
              (button as HTMLElement).style.borderColor = '#ddd';
              (button as HTMLElement).style.color = 'black';
            } else {
              selectedWords.add(word);
              (button as HTMLElement).style.backgroundColor = '#007cba';
              (button as HTMLElement).style.borderColor = '#005a87';
              (button as HTMLElement).style.color = 'white';
            }
            
            if (selectedWordsDisplay) {
              selectedWordsDisplay.textContent = selectedWords.size > 0 ? 
                Array.from(selectedWords).join(', ') : englishText.none;
            }
          });
        });
        
        // Store selected words for access in on_finish
        (window as any).currentSelectedWords = selectedWords;
      }
    },
    on_finish: function(data: any) {
      let selectedWords: string[];
      
      if (show_word_grid) {
        selectedWords = Array.from((window as any).currentSelectedWords || []) as string[];
        delete (window as any).currentSelectedWords;
      } else {
        const textareaValue = (document.getElementById('recall-input') as HTMLTextAreaElement)?.value || '';
        selectedWords = textareaValue.split(',').map(word => word.trim()).filter(word => word.length > 0);
      }
      
      const results = scoreListARecall(selectedWords);
      
      delayResult = {
        words_recalled: selectedWords,
        correct_count: results.score,
        intrusion_errors: results.intrusion_errors
      };
      
      // Add detailed results to jsPsych data
      jsPsych.data.addProperties({
        delayed_recalled: selectedWords,
        delayed_correct: results.correct,
        delayed_intrusions: results.intrusion_errors,
        delayed_score: results.score,
        delay_duration_ms: Date.now() - delayStartTime,
        assessment_notes: [...assessmentNotes]
      });
      
      // Clean up
      if (show_word_grid) {
        delete (window as any).currentSelectedWords;
      }
    },
    data: {
      task: 'delayed_recall'
    }
  };

  // Results summary
  const results = {
    type: htmlButtonResponse,
    stimulus: function() {
      let summaryHTML = `
        <div style="font-size: 16px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
          <h3>${englishText.RAVLT_results_summary}</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ddd; padding: 8px;">${englishText.trial}</th>
              <th style="border: 1px solid #ddd; padding: 8px;">${englishText.words_recalled}</th>
              <th style="border: 1px solid #ddd; padding: 8px;">${englishText.correct}</th>
            </tr>
      `;
      
      learningTrialResults.forEach(result => {
        summaryHTML += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${englishText.trial} A${result.trial}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${result.words_recalled.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${result.correct_count}/${WORD_LIST.length}</td>
          </tr>
        `;
      });
      
      if (interferenceResult) {
        summaryHTML += `
          <tr style="background-color: #ffe8cc;">
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${englishText.interference_trial}</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${interferenceResult.words_recalled.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${interferenceResult.correct_count}/${WORD_LIST_B.length}</td>
          </tr>
        `;
      }
      
      if (trialA6Result) {
        summaryHTML += `
          <tr style="background-color: #e8f4f8;">
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${englishText.trial_a6}</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${trialA6Result.words_recalled.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${trialA6Result.correct_count}/${WORD_LIST.length}</td>
          </tr>
        `;
      }
      
      if (delayResult) {
        summaryHTML += `
          <tr style="background-color: #fff3cd;">
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${englishText.delayed_recall}</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${delayResult.words_recalled.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${delayResult.correct_count}/${WORD_LIST.length}</td>
          </tr>
        `;
      }
      
      summaryHTML += `
          </table>
          
          ${recognitionResult ? `
            <h4>${englishText.recognition_trial} Results:</h4>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ddd; padding: 8px;">Hits</th>
                <th style="border: 1px solid #ddd; padding: 8px;">False Alarms</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Misses</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Correct Rejections</th>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${recognitionResult.correct_hits}/${WORD_LIST.length}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${recognitionResult.false_alarms}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${recognitionResult.misses}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${recognitionResult.correct_rejections}</td>
              </tr>
            </table>
          ` : ''}
          
          <h4>${englishText.original_word_list}:</h4>
          <p>${WORD_LIST.join(', ')}</p>
          
          ${interferenceResult ? `
            <h4>Interference List (List B):</h4>
            <p>${WORD_LIST_B.join(', ')}</p>
          ` : ''}
          
          ${assessmentNotes.length > 0 ? `
            <h4>${englishText.assessment_notes}</h4>
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; text-align: left; margin: 20px 0;">
              ${assessmentNotes.map(note => `<p style="margin: 5px 0; font-size: 14px;">• ${note}</p>`).join('')}
            </div>
          ` : ''}
          
          <p><strong>${englishText.select_below}.</strong></p>
        </div>
      `;
      
      return summaryHTML;
    },
    choices: [englishText.finish],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.RAVLT_results_summary}. Assessment completed. ${englishText.select_below}.`);
    },
    data: {
      task: 'results_summary'
    }
  };

  // Early termination screen
  const earlyTermination = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h3>${englishText.assessment_terminated}</h3>
        ${englishText.early_termination_text}
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>${englishText.assessment_notes}</h4>
          ${assessmentNotes.map(note => `<p style="margin: 5px 0; font-size: 14px;">• ${note}</p>`).join('')}
        </div>
      </div>
    `,
    choices: [englishText.end_assessment_btn],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.assessment_terminated}. ${englishText.early_termination_text}`);
    },
    data: {
      task: 'early_termination'
    }
  };

  // Conditional node to check if assessment should continue
  const checkContinuation = {
    type: htmlButtonResponse,
    stimulus: '',
    choices: [],
    trial_duration: 1,
    on_finish: function() {
      // This is a placeholder that gets replaced by conditional logic
    }
  };

  // Complete timeline with proper RAVLT structure: A1-A5, B1, A6
  const baseTimeline = [
    welcome,
    ...learningTrials,
    ...interferenceSequence,
    ...trialA6Sequence
  ];

  let delayedRecallTimeline: any[] = [];
  
  if (include_delayed_recall) {
    // Choose delay screen based on configuration
    const delayScreen = show_delay_timer ? delayProgressTimer : delayWaitingScreen;
    
    delayedRecallTimeline = [
      delayScreen,
      delayTimingValidation,
      // Use conditional timeline to handle early termination
      {
        timeline: [delayedRecallInstructions, delayedRecall],
        conditional_function: function() {
          // Check if the previous trial (validation) resulted in termination
          const lastTrial = jsPsych.data.get().last(1).values()[0];
          return !lastTrial.skip_remaining;
        }
      },
      // Recognition trial (conditional)
      {
        timeline: include_recognition_trial ? [recognitionTrial] : [],
        conditional_function: function() {
          const lastValidationTrial = jsPsych.data.get().filter({task: 'delay_timing_validation'}).last(1).values()[0];
          return include_recognition_trial && (!lastValidationTrial || !lastValidationTrial.skip_remaining);
        }
      },
      // Early termination screen (conditional)
      {
        timeline: [earlyTermination],
        conditional_function: function() {
          const lastValidationTrial = jsPsych.data.get().filter({task: 'delay_timing_validation'}).last(1).values()[0];
          return lastValidationTrial && lastValidationTrial.skip_remaining;
        }
      }
    ];
  }

  const timeline = [
    ...baseTimeline,
    ...delayedRecallTimeline,
    // Results only show if assessment wasn't terminated early
    {
      timeline: [results],
      conditional_function: function() {
        const terminationData = jsPsych.data.get().filter({task: 'delay_timing_validation'}).last(1).values()[0];
        return !terminationData || !terminationData.skip_remaining;
      }
    }
  ];

  return timeline;
}

// Factory functions to create individual timeline components
export function createTimelineComponents(jsPsych: JsPsych, config: TimelineConfig = {}) {
  // Create a timeline to get access to all components
  const timeline = createTimeline(jsPsych, config);
  
  // Extract configuration for component creation
  const { 
    num_learning_trials = 5, // Standard RAVLT: A1-A5
    word_presentation_duration = 1000, // NIH standard: 1 second per word
    inter_word_interval = 1000, // NIH standard: 1 second between words
    include_delayed_recall = true,
    include_interference_trial = true, // Standard RAVLT includes List B
    include_trial_a6 = true, // Standard RAVLT includes A6 after interference
    include_recognition_trial = true, // Standard RAVLT includes recognition
    delay_duration_minutes = 20, // NIH standard: 20 minutes
    randomize_word_order = false, // Clinical standard: fixed order
    show_word_grid = false, // Clinical standard: auditory only
    max_recall_time = null, // NIH standard: no time limit
    min_delay_minutes = 15, // More realistic minimum
    max_delay_minutes = 30,
    show_delay_timer = true,
    text_to_speech_enabled = false,
    read_words_aloud = false
  } = config;

  // Helper functions
  function cancelAllSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function playChime() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.8, 0.4);
      playTone(659.25, now + 0.1, 0.9, 0.3);
      playTone(783.99, now + 0.2, 1.0, 0.2);
      
    } catch (error) {
      console.warn('Web Audio API not available, chime sound skipped:', error);
    }
  }

  function speakText(text: string, delay: number = 500, onComplete?: () => void) {
    if (!text_to_speech_enabled || !window.speechSynthesis) {
      if (onComplete) {
        setTimeout(onComplete, delay);
      }
      return;
    }
    
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanText.length === 0) {
      if (onComplete) {
        setTimeout(onComplete, delay);
      }
      return;
    }

    setTimeout(() => {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      if (onComplete) {
        utterance.onend = onComplete;
      }
      
      window.speechSynthesis.speak(utterance);
    }, delay);
  }

  const getWordList = () => {
    return randomize_word_order ? [...WORD_LIST].sort(() => Math.random() - 0.5) : WORD_LIST;
  };

  // Individual components
  const welcome = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 20px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h2>${englishText.welcome_title}</h2>
        ${englishText.welcome_text}
      </div>
    `,
    choices: [englishText.welcome_start_button],
    on_load: function() {
      speakText(`${englishText.welcome_title}. ${englishText.welcome_text}`);
    },
    data: {
      task: 'welcome'
    }
  };

  const interimActivities = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h3>${englishText.break_time}</h3>
        <p>${englishText.interim_text}</p>
        <p><em>${substituteText(englishText.delay_period, { minutes: delay_duration_minutes })}</em></p>
      </div>
    `,
    choices: [englishText.continue],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.break_time}. ${englishText.interim_text} ${substituteText(englishText.delay_period, { minutes: delay_duration_minutes })}`);
    },
    data: {
      task: 'interim_break',
      delay_duration_minutes: delay_duration_minutes
    }
  };

  const results = {
    type: htmlButtonResponse,
    stimulus: `
      <div style="font-size: 16px; line-height: 1.5; max-width: 800px; margin: 0 auto;">
        <h3>${englishText.RAVLT_results_summary}</h3>
        <p>Results will be populated with actual trial data when used in context.</p>
        <p><strong>${englishText.select_below}.</strong></p>
      </div>
    `,
    choices: [englishText.finish],
    on_load: function() {
      cancelAllSpeech();
      speakText(`${englishText.RAVLT_results_summary}. Assessment completed. ${englishText.select_below}.`);
    },
    data: {
      task: 'results_summary'
    }
  };

  return {
    // Individual components
    welcome,
    interimActivities,
    results,
    
    // Factory functions for components that need parameters
    createTrialInstructions: (trialNumber: number) => {
      let instructionText = '';
      
      if (trialNumber === 1) {
        instructionText = `
          <h3>${englishText.trial} ${trialNumber}</h3>
          <p>${englishText.instruction_text_trial1}</p>
        `;
      } else {
        instructionText = `
          <h3>${englishText.trial} ${trialNumber}</h3>
          <p>${englishText.instruction_text}</p>
        `;
      }
      
      return {
        type: htmlButtonResponse,
        stimulus: `
          <div style="font-size: 18px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
            ${instructionText}
          </div>
        `,
        choices: [englishText.continue],
        on_load: function() {
          cancelAllSpeech();
          const textToSpeak = trialNumber === 1 ? 
            `${englishText.trial} ${trialNumber}. ${englishText.instruction_text_trial1}` :
            `${englishText.trial} ${trialNumber}. ${englishText.instruction_text}`;
          speakText(textToSpeak);
        },
        data: {
          task: 'ravlt_trial_instructions',
          trial_number: trialNumber
        }
      };
    },

    createWordPresentation: (trialNumber: number) => {
      return {
        type: htmlButtonResponse,
        stimulus: `
          <div style="font-size: 24px; text-align: center; padding: 50px;">
            <h3>${englishText.trial} ${trialNumber}</h3>
            <p>${englishText.listen_carefully}.</p>
            <div style="margin: 40px 0;">
              <div id="word-display" style="font-size: 36px; font-weight: bold; height: 60px; line-height: 60px;">
                ${englishText.ready}
              </div>
            </div>
            <p style="font-size: 16px; color: #666;">
              ${englishText.create_word_presentation_text}.
            </p>
          </div>
        `,
        choices: [englishText.continue],
        on_load: function() {
          cancelAllSpeech();
          
          const currentWordList = getWordList();
          let wordIndex = 0;
          const wordDisplay = document.getElementById('word-display');
          
          const speakWord = (word: string) => {
            if (!read_words_aloud || !window.speechSynthesis) {
              return;
            }
            
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
              voice.lang.startsWith('en') && 
              (voice.name.includes('Google') || voice.name.includes('Microsoft'))
            );
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
            
            window.speechSynthesis.speak(utterance);
          };
          
          const presentWord = () => {
            if (wordIndex < currentWordList.length) {
              wordDisplay!.textContent = currentWordList[wordIndex];
              speakWord(currentWordList[wordIndex]);
              wordIndex++;
              setTimeout(presentWord, inter_word_interval);
            } else {
              wordDisplay!.textContent = '';
              playChime();
            }
          };
          
          const startWordPresentation = () => {
            setTimeout(presentWord, 1000);
          };
          
          if (text_to_speech_enabled) {
            speakText(
              `${englishText.trial} ${trialNumber}. ${englishText.listen_carefully}. ${englishText.create_word_presentation_text}.`,
              500,
              startWordPresentation
            );
          } else {
            startWordPresentation();
          }
        },
        data: {
          task: 'ravlt_word_presentation',
          trial_number: trialNumber,
          word_presentation_duration: word_presentation_duration,
          inter_word_interval: inter_word_interval,
          randomized_order: randomize_word_order
        }
      };
    },

    // Helper functions
    cancelAllSpeech,
    playChime,
    speakText,
    getWordList
  };
}

export const timelineUnits = {
  // Main timeline creation function
  createTimeline,
  
  // Component factory function
  createTimelineComponents,
  
  // For convenience - creates components with default config
  getDefaultComponents: (jsPsych: JsPsych) => createTimelineComponents(jsPsych, {})
}

// Helper functions that can be used independently
export function cancelAllSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function playChime() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    playTone(523.25, now, 0.8, 0.4);
    playTone(659.25, now + 0.1, 0.9, 0.3);
    playTone(783.99, now + 0.2, 1.0, 0.2);
    
  } catch (error) {
    console.warn('Web Audio API not available, chime sound skipped:', error);
  }
}

export function speakText(text: string, config: {
  text_to_speech_enabled?: boolean;
  delay?: number;
  onComplete?: () => void;
} = {}) {
  const {
    text_to_speech_enabled = true,
    delay = 500,
    onComplete
  } = config;

  if (!text_to_speech_enabled || !window.speechSynthesis) {
    if (onComplete) {
      setTimeout(onComplete, delay);
    }
    return;
  }
  
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (cleanText.length === 0) {
    if (onComplete) {
      setTimeout(onComplete, delay);
    }
    return;
  }

  setTimeout(() => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    if (onComplete) {
      utterance.onend = onComplete;
    }
    
    window.speechSynthesis.speak(utterance);
  }, delay);
}

export const utils = {
  substituteText,
  cancelAllSpeech,
  playChime,
  speakText
}