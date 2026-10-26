/**
 * TAKRAAR (तक्रार) - Duplex Argument Engine
 * Real-time Speech, Interruption Handling, Emotional Telemetry, Mind-Shift Detection
 */

// ==========================================================================
// 1. STATE & TELEMETRY
// ==========================================================================

const state = {
  heat: 28, // 0 to 100°C
  heatState: 'SIMMERING',
  interruptCount: 0,
  concessionCount: 0,
  currentFloor: null, // 'alpha', 'beta', or 'clash'
  disputeStartTime: Date.now(),
  sfxEnabled: true,
  ttsEnabled: true,
  currentScenario: 'startup',
  isSimulating: false,
  simPaused: false,
  simTurnIndex: 0,
  activeMic: null, // 'alpha' or 'beta'
  
  alpha: {
    name: 'Kabir (CTO)',
    lang: 'hi-IN',
    isSpeaking: false,
    currentUtterance: '',
    wpm: 0,
    concessions: []
  },
  beta: {
    name: 'Alex (CEO)',
    lang: 'en-US',
    isSpeaking: false,
    currentUtterance: '',
    wpm: 0,
    concessions: []
  }
};

// Built-in High-Voltage Argument Scenarios
const SCENARIOS = {
  startup: {
    title: 'Startup Equity Dilution & Weekend Outage',
    desc: 'Kabir claims Alex slashed 15% vested equity after a Sunday crash. Alex claims Kabir pushed unreviewed migrations that wiped the DB.',
    alphaName: 'Kabir (CTO)',
    betaName: 'Alex (CEO)',
    alphaLang: 'hi-IN',
    betaLang: 'en-US',
    alphaSlugs: [
      { text: "Yeh bilkul bakwaas hai! Main 90 ghante kaam kar raha hoon!", label: "Yeh bilkul bakwaas hai! 90 ghante..." },
      { text: "Tum sun bhi rahe ho mujhe? Code ka issue nahi tha, AWS region crash hua tha!", label: "Tum sun rahe ho? AWS crash hua tha!" },
      { text: "Ruko! Meri baat suno! Production logs dekhe bina ilzaam laga rahe ho?", label: "Ruko! Logs dekhe bina ilzaam lagaya?" },
      { text: "Theek hai, agar tum cloudwatch metrics dekhoge toh saaf dikhega downtime 2 baje shuru hua.", label: "Theek hai, cloudwatch metrics dekho saaf dikhega..." }
    ],
    betaSlugs: [
      { text: "Don't give me that! You pushed untested migrations straight to main on Sunday!", label: "Don't give me that! Untested migrations!" },
      { text: "Hold on! We lost our biggest enterprise client while you were completely unreachable!", label: "Hold on! We lost our biggest client!" },
      { text: "Wait... what AWS crash? The status page said everything was operational.", label: "Wait... what AWS crash? Status page was green." },
      { text: "Wait, look at this timestamp... the RDS outage actually started 20 minutes before your push. That was on AWS.", label: "Wait, look at timestamp... downtime started before push." }
    ],
    // Dialogue script designed for realistic interruptions and mind shift
    script: [
      {
        speaker: 'alpha',
        text: 'Alex, tumne bina mujhse baat kiye meri equity 15% cut kaise kar di? Main pichle teen mahine se roz raat ko 3 baje tak code kar raha hoon!',
        translation: 'Alex, how could you slash 15% of my equity without even speaking to me? I have been coding until 3 AM every single night for three months!',
        heatDelta: +18,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Don\'t give me the 3 AM martyr story! You pushed untested schema migrations directly to production on Sunday morning and wiped our primary replica!',
        translation: 'Mujhe 3 baje wali kahani mat sunao! Tumne Sunday subah untested schema migrations seedha prod pe push karke hamara primary replica uda diya!',
        heatDelta: +22,
        concession: false,
        interruptNext: true // Kabir will cut him off!
      },
      {
        speaker: 'alpha',
        text: 'Ruko! Bakwaas band karo! Tumhe lagta hai main paagal hoon? Main 10 saal se database architect hoon!',
        translation: 'Stop! Cut the bullshit! Do you think I am crazy? I have been a database architect for 10 years!',
        heatDelta: +15,
        concession: false,
        interruptNext: false,
        isInterruption: true // Cuts Alex off
      },
      {
        speaker: 'beta',
        text: 'Then explain why our enterprise client in Singapore couldn\'t log in for six hours! The board was breathing down my neck!',
        translation: 'Toh explain karo Singapore wale enterprise client 6 ghante log in kyun nahi kar paye! Board mere sar par chadh ke baitha tha!',
        heatDelta: +10,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'alpha',
        text: 'Kyunki tumne logs dekhe hi nahi! us-east-1 mein EBS volume IOPS throttle hua tha. Mere deployment se theek 18 minute pehle database freeze ho chuka tha!',
        translation: 'Because you never bothered to check the logs! EBS volume IOPS was throttled in us-east-1. The database was already frozen 18 minutes before my deployment!',
        heatDelta: -5,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Wait... wait, stop. Are you serious? Let me pull up Datadog right now... Holy shit. The incident report shows the disk queue spiked at 1:42 AM. Your push was at 2:05 AM.',
        translation: 'Ruko... ruko, kya tum serious ho? Mujhe Datadog kholne do... Shit. Incident report dikha raha hai disk queue 1:42 AM pe spike hui. Tumhara push 2:05 AM pe tha.',
        heatDelta: -30,
        concession: true,
        concessionText: 'Alex conceded: Confirmed server downtime was AWS infrastructure failure, not Kabir’s code migration.',
        commonGround: 'The Sunday outage was caused by AWS us-east-1 EBS throttling, not the database migration. Kabir’s code did not cause the incident.'
      },
      {
        speaker: 'alpha',
        text: 'Haan! Wahi toh keh raha tha main! Agar tum gusse mein aane ke bajaye pehle ek message kar lete toh yeh sab tamasha nahi hota.',
        translation: 'Yes! That is exactly what I was trying to say! If you had texted me first instead of exploding in rage, none of this drama would have happened.',
        heatDelta: -15,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Kabir, I was wrong. I panicked under board pressure. I\'m restoring your full 15% equity agreement right now, and I owe you a massive apology.',
        translation: 'Kabir, meri galti thi. Board ke pressure mein main panic ho gaya. Main abhi tumhara 15% equity agreement poora restore kar raha hoon, aur main dil se maafi maangta hoon.',
        heatDelta: -25,
        concession: true,
        concessionText: 'Alex conceded: Full 15% equity agreement restored with unreserved apology.',
        commonGround: 'Full 15% vested equity restored immediately. Protocol established: No disciplinary action or vesting changes without an engineering post-mortem.'
      }
    ]
  },

  wedding: {
    title: 'The Udaipur Muhurat & 300 Hungry Relatives',
    desc: 'Mother of the Bride vs British Wedding Director. 300 guests arrived 3 hours early in Udaipur, the dhol team is missing, and hotel contract strictly limits dining hall access.',
    alphaName: 'Mrs. Sharma',
    betaName: 'Marcus (Planner)',
    alphaLang: 'hi-IN',
    betaLang: 'en-US',
    alphaSlugs: [
      { text: "Aap pagal ho gaye hain kya? Humare mehmaan dhoop mein khade hain!", label: "Aap pagal hain? Mehmaan dhoop mein hain!" },
      { text: "Yeh England nahi hai Marcus! Hamare yahan mehmaan bhagwan hote hain!", label: "Yeh England nahi hai! Mehmaan bhagwan hain!" },
      { text: "Ruko! Contract baad mein dikhana, pehle chaach aur paani lagwao!", label: "Ruko! Pehle chaach aur paani lagwao!" },
      { text: "Theek hai, agar aap Courtyard khol dein toh hum dinner delay kar denge.", label: "Theek hai, Courtyard khol dein toh..." }
    ],
    betaSlugs: [
      { text: "Mrs. Sharma, the contract explicitly states hall access begins at 7 PM sharp!", label: "Contract states hall access begins at 7 PM!" },
      { text: "Please listen! The catering team cannot prepare 300 meals three hours ahead of schedule!", label: "Catering cannot serve 3 hours ahead of schedule!" },
      { text: "Wait... if they just need snacks and shaded seating, we can open the poolside lawn right now.", label: "Wait... we can open the poolside lawn right now." },
      { text: "Understood. My team will redirect beverages to the terrace immediately.", label: "Team will redirect beverages to terrace immediately." }
    ],
    script: [
      {
        speaker: 'alpha',
        text: 'Marcus! 300 rishtedaar dhoop mein khade hain aur aap bol rahe hain ki 7 baje se pehle darwaza nahi khulega?!',
        translation: 'Marcus! 300 relatives are standing outside in the blistering sun and you are telling me the doors won\'t open before 7 PM?!',
        heatDelta: +20,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Mrs. Sharma, with all due respect, your itinerary clearly stated guests would arrive at 6:30. The kitchen is still prepping!',
        translation: 'Mrs. Sharma, pooray ahtiram ke saath, aapke schedule mein likha tha mehmaan 6:30 aayenge. Kitchen abhi tayyari kar raha hai!',
        heatDelta: +15,
        concession: false,
        interruptNext: true
      },
      {
        speaker: 'alpha',
        text: 'Bas kijiye! Yeh koi corporate seminar nahi hai! Yeh meri beti ki shaadi hai! Hamare yahan mehmaan bhookhe nahi khade rehte!',
        translation: 'Enough! This is not a corporate seminar! This is my daughter\'s wedding! In our culture we do not leave guests starving outside!',
        heatDelta: +20,
        concession: false,
        interruptNext: false,
        isInterruption: true
      },
      {
        speaker: 'beta',
        text: 'I understand that, but if we let 300 people into the banquet room now, the flower centerpieces and air conditioning won\'t be ready for the pheras!',
        translation: 'Main samajhta hoon, lekin agar 300 log abhi banquet hall mein chale gaye toh pheron ke liye flower arrangements aur AC tayyar nahi honge!',
        heatDelta: +10,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'alpha',
        text: 'Hamein abhi banquet nahi chahiye! Humein bas budhe logon ke baithne ke liye chhaon, thanda paani aur chai chahiye!',
        translation: 'We don\'t need the banquet hall right now! We just need shade, cold water, and tea for the elderly relatives to sit down!',
        heatDelta: -10,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Wait... you only need shade and refreshments? Why didn\'t you say so! The heritage courtyard is fully shaded and has seating for 250 right now.',
        translation: 'Ruko... aapko sirf chhaon aur refreshment chahiye? Aapne pehle kyun nahi kaha! Heritage courtyard mein abhi chhaon hai aur 250 logon ke baithne ki jagah hai.',
        heatDelta: -25,
        concession: true,
        concessionText: 'Marcus conceded: Opened Heritage Courtyard immediately for guest reception and cold drinks.',
        commonGround: 'Guests directed to Heritage Courtyard with cold chaas and chairs immediately. Main banquet hall preserved until 7 PM for pheras.'
      },
      {
        speaker: 'alpha',
        text: 'Haan Marcus! Wahi toh hum keh rahe the! Courtyard khulwao, main halwai se bolti hoon samosa aur jalebi wahan bhijwa de.',
        translation: 'Yes Marcus! That is all we were asking for! Open the courtyard, and I will have the sweetmakers send samosas and jalebis there.',
        heatDelta: -20,
        concession: true,
        concessionText: 'Mrs. Sharma conceded: Agreed to delay main banquet opening to preserve ceremony decor.',
        commonGround: 'Mutual agreement reached: Courtyard hosts early arrivals; main hall opens at 7:00 PM in pristine condition.'
      }
    ]
  },

  freelance: {
    title: 'The 18 Unbilled Revisions & Missed Demo',
    desc: 'Mateo (Agency Designer, Madrid) vs Rachel (VP Product, NYC). 18 rounds of scope creep on a fixed-fee project.',
    alphaName: 'Mateo (Designer)',
    betaName: 'Rachel (VP Product)',
    alphaLang: 'es-ES',
    betaLang: 'en-US',
    alphaSlugs: [
      { text: "¡Esto es inaceptable, Rachel! ¡El contrato original era por dos rondas de revisión!", label: "¡Inaceptable! ¡Eran dos rondas!" },
      { text: "¿Me estás amenazando con no pagarme por un trabajo que ya entregué?", label: "¿Me amenazas con no pagar?" },
      { text: "¡Mira el documento de especificaciones que firmaste en enero!", label: "¡Mira las especificaciones de enero!" },
      { text: "De acuerdo, si pagas las horas extras, entregaré el diseño para el lunes.", label: "De acuerdo, con horas extras entrego lunes." }
    ],
    betaSlugs: [
      { text: "Mateo, none of the responsive mobile screens are functioning properly!", label: "Mobile screens aren't functioning!" },
      { text: "If we don't have the Figma assets by tomorrow, I am withholding final invoice payment.", label: "I am withholding final payment!" },
      { text: "Wait... let me check the original SOW from January... You're right, mobile was listed as an add-on.", label: "Wait... SOW listed mobile as an add-on." },
      { text: "Fair enough. Let's issue a change order right now for the additional $4,500.", label: "Let's issue change order for $4,500." }
    ],
    script: [
      {
        speaker: 'alpha',
        text: '¡Rachel, esto ya es el colmo! ¡Llevo 18 revisiones hechas y ahora me pides rediseñar toda la app móvil en fin de semana!',
        translation: 'Rachel, this is the absolute limit! I have done 18 revisions and now you are asking me to redesign the entire mobile app over the weekend!',
        heatDelta: +20,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Because our investors are testing on mobile, Mateo! If the mobile experience looks broken on Monday, this entire project is dead in the water!',
        translation: 'Porque nuestros inversores prueban en móvil, Mateo. ¡Si la experiencia móvil se ve rota el lunes, este proyecto está muerto!',
        heatDelta: +18,
        concession: false,
        interruptNext: true
      },
      {
        speaker: 'alpha',
        text: '¡Cállate un momento y escucha! ¡Revisa el contrato que firmamos en enero! ¡El alcance incluía SOLAMENTE versión de escritorio!',
        translation: 'Shut up for one second and listen! Check the contract we signed in January! The scope included ONLY the desktop web app!',
        heatDelta: +22,
        concession: false,
        interruptNext: false,
        isInterruption: true
      },
      {
        speaker: 'beta',
        text: 'Wait... what? Who signs a contract for only desktop web in 2026? Let me check the signed PDF in DocuSign...',
        translation: 'Espera... ¿qué? ¿Quién firma solo escritorio en 2026? Déjame revisar el PDF firmado en DocuSign...',
        heatDelta: -10,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'Oh damn it. Section 3.2: \'Mobile breakpoints excluded unless add-on selected\'. My former product manager wrote this SOW and never checked the box.',
        translation: 'Maldita sea. Sección 3.2: \'Breakpoints móviles excluidos salvo anexo\'. Mi antiguo gerente de producto escribió esto y nunca marcó la casilla.',
        heatDelta: -30,
        concession: true,
        concessionText: 'Rachel conceded: Admitted contract explicitly excluded mobile breakpoints; agency was in full compliance.',
        commonGround: 'The original contract strictly covered Desktop Web. Mobile app design was an omitted scope error by the client team.'
      },
      {
        speaker: 'alpha',
        text: 'Exacto. He trabajado gratis durante 3 semanas por amabilidad, pero no voy a tolerar amenazas de impago cuando he cumplido al 100%.',
        translation: 'Exactly. I have worked for free for 3 weeks out of goodwill, but I will not tolerate payment threats when I fulfilled 100% of my agreement.',
        heatDelta: -15,
        concession: false,
        interruptNext: false
      },
      {
        speaker: 'beta',
        text: 'You are completely right, Mateo. I am sending an immediate change order for $5,000 to cover the mobile work and paying your current invoice right now.',
        translation: 'Tienes toda la razón, Mateo. Estoy enviando una orden de cambio inmediata por $5,000 para el trabajo móvil y pagando tu factura ahora mismo.',
        heatDelta: -25,
        concession: true,
        concessionText: 'Rachel conceded: Approved $5,000 budget increase and paid open invoice immediately.',
        commonGround: 'Invoice approved for immediate settlement + $5,000 mobile extension order. Delivery scheduled for Wednesday.'
      }
    ]
  }
};

// ==========================================================================
// 2. WEB AUDIO & ACOUSTIC INTERRUPT ENGINE
// ==========================================================================

let audioCtx = null;
let alphaAnalyser = null;
let betaAnalyser = null;
let animationFrameId = null;

function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  } catch (e) {
    console.warn('Web Audio API not supported', e);
  }
}

// Sound: Interruption cut-off buzz
function playInterruptSfx() {
  if (!state.sfxEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Performed percussive square wave cut-off
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {
    console.error(err);
  }
}

// Sound: High-voltage clash impact
function playClashSfx() {
  if (!state.sfxEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.25);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  } catch (err) {
    console.error(err);
  }
}

// Sound: Mind shift / breakthrough chime
function playPivotSfx() {
  if (!state.sfxEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.6);
    });
  } catch (err) {
    console.error(err);
  }
}

// Emotionally Pitch-Shifted Text-To-Speech
function speakUtterance(text, lang, side, isHeated) {
  if (!state.ttsEnabled || !('speechSynthesis' in window)) return;
  
  // Clean text of markers
  const clean = text.replace(/\[.*?\]/g, '').trim();
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  
  // Modulate rate and pitch based on heat index:
  // When furious, people speak faster and at higher pitch
  if (state.heat > 70) {
    utterance.rate = 1.25;
    utterance.pitch = 1.2;
  } else if (state.heat > 45) {
    utterance.rate = 1.1;
    utterance.pitch = 1.05;
  } else {
    utterance.rate = 0.95;
    utterance.pitch = 0.95;
  }

  // Pick matching voice if available
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
  if (match) utterance.voice = match;

  window.speechSynthesis.speak(utterance);
}

// ==========================================================================
// 3. THE INTERRUPTION & FLOOR ARBITRATOR
// ==========================================================================

function handleInterruption(interrupterSide, interruptedSide, isRemote = false) {
  state.interruptCount++;
  updateHUDStats();
  playInterruptSfx();
  
  if (!isRemote && typeof broadcastDuplexEvent === 'function') {
    broadcastDuplexEvent({
      type: 'speech_interrupt',
      side: interrupterSide,
      targetSide: interruptedSide
    });
  }

  // Cut off speech synthesis immediately
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Update interrupted stream box with cut-off visual strike
  const interruptedStreamNative = document.getElementById(`${interruptedSide}-native-stream`);
  const interruptedStreamTrans = document.getElementById(`${interruptedSide}-translated-stream`);
  const alertBadge = document.getElementById(`${interruptedSide}-interrupted-alert`);
  
  if (interruptedStreamNative && state[interruptedSide].currentUtterance) {
    interruptedStreamNative.innerHTML = `
      <span class="cut-off-text">${state[interruptedSide].currentUtterance}</span>
      <span class="cut-off-marker">[CUT OFF ⚡]</span>
    `;
    interruptedStreamTrans.innerHTML = `
      <span class="cut-off-text">${interruptedStreamTrans.innerText}</span>
      <span class="cut-off-marker">[INTERRUPTED]</span>
    `;
  }

  // Flash the alert badge
  if (alertBadge) {
    alertBadge.classList.add('show');
    setTimeout(() => alertBadge.classList.remove('show'), 2800);
  }

  // Mark column states
  document.getElementById(`column-${interruptedSide}`).classList.remove('has-floor');
  document.getElementById(`column-${interrupterSide}`).classList.add('has-floor');

  // Trigger collision alert on center spine
  triggerCollisionAlert(interrupterSide);

  // Bump heat meter
  adjustHeat(+14, 'CLASH');
}

function triggerCollisionAlert(winnerSide) {
  const banner = document.getElementById('collision-banner');
  const dot = document.getElementById('floor-state-dot');
  const floorText = document.getElementById('floor-state-text');
  
  banner.classList.add('show');
  dot.className = 'state-dot dot-clash';
  floorText.innerText = `FLOOR: CLASH! ${state[winnerSide].name.toUpperCase()} SEIZED MIC`;
  
  setTimeout(() => {
    banner.classList.remove('show');
    dot.className = `state-dot dot-${winnerSide}`;
    floorText.innerText = `FLOOR: ${state[winnerSide].name.toUpperCase()} HAS MIC`;
  }, 2200);
}

// ==========================================================================
// 4. EMOTIONAL HEAT & CONCESSION METRICS
// ==========================================================================

function adjustHeat(delta, reason) {
  state.heat = Math.max(5, Math.min(100, state.heat + delta));
  
  // Update heat state label
  if (state.heat >= 80) {
    state.heatState = 'BOILING POINT';
  } else if (state.heat >= 55) {
    state.heatState = 'HEATED';
  } else if (state.heat >= 30) {
    state.heatState = 'FRICTION';
  } else {
    state.heatState = 'SIMMERING';
  }

  // Update UI
  const heatValEl = document.getElementById('heat-value');
  const heatStateEl = document.getElementById('heat-state-text');
  const heatFillEl = document.getElementById('heat-bar-fill');
  
  heatValEl.innerText = `${Math.round(state.heat)}°C`;
  heatStateEl.innerText = state.heatState;
  heatFillEl.style.width = `${state.heat}%`;
  
  // Color code badge
  if (state.heat >= 80) {
    heatStateEl.style.color = 'var(--zip-crimson)';
    heatStateEl.style.borderColor = 'var(--zip-crimson)';
  } else if (state.heat >= 55) {
    heatStateEl.style.color = 'var(--zip-amber)';
    heatStateEl.style.borderColor = 'var(--zip-amber)';
  } else {
    heatStateEl.style.color = 'var(--zip-lime)';
    heatStateEl.style.borderColor = 'var(--zip-lime)';
  }
}

function recordConcession(speakerSide, concessionText, commonGroundText, isRemote = false) {
  state.concessionCount++;
  updateHUDStats();
  playPivotSfx();

  if (!isRemote && typeof broadcastDuplexEvent === 'function') {
    broadcastDuplexEvent({
      type: 'concession',
      side: speakerSide,
      text: concessionText,
      commonGround: commonGroundText
    });
  }

  // Pulse concession card
  const card = document.querySelector('.concession-card');
  card.classList.add('glow-active');
  setTimeout(() => card.classList.remove('glow-active'), 3000);

  // Remove empty state
  const emptyState = document.getElementById('concession-empty-state');
  if (emptyState) emptyState.style.display = 'none';

  // Add to concession list
  const list = document.getElementById('concession-list');
  const li = document.createElement('li');
  li.className = 'concession-item';
  li.innerHTML = `
    <span class="concession-speaker-tag">${state[speakerSide].name}:</span>
    <span>${concessionText}</span>
  `;
  list.appendChild(li);

  // Update Common Ground Box
  if (commonGroundText) {
    const cgBox = document.getElementById('common-ground-text');
    cgBox.className = 'cg-text breakthrough';
    cgBox.innerText = `💡 ${commonGroundText}`;
  }

  // Update trajectory steps
  document.getElementById('step-entrenched').className = 'spectrum-step';
  document.getElementById('step-clash').className = 'spectrum-step';
  document.getElementById('step-crack').className = 'spectrum-step resolved';
  document.getElementById('step-pivot').className = 'spectrum-step active resolved';
  document.getElementById('trajectory-badge').innerText = 'BREAKTHROUGH REACHED';
  document.getElementById('trajectory-badge').style.color = 'var(--zip-lime)';
}

function updateHUDStats() {
  document.getElementById('interrupt-count').innerText = state.interruptCount;
  document.getElementById('concession-count').innerText = state.concessionCount;
  document.getElementById('pivot-indicator-badge').innerText = `${state.concessionCount} CONCESSIONS`;
}

// ==========================================================================
// 5. STREAM TRANSLATION & COMMITTING TURNS
// ==========================================================================

// Realistic speculative translator for fast dynamic arguments
function translateText(text, fromLang, toLang) {
  // Built-in contextual lookup map for high-frequency aggressive phrases
  const map = {
    // Hindi to English
    'yeh bilkul bakwaas hai! main 90 ghante kaam kar raha hoon!': 'This is complete bullshit! I have been working 90 hours a week!',
    'tum sun bhi rahe ho mujhe? code ka issue nahi tha, aws region crash hua tha!': 'Are you even listening to me? It was not a code issue, the AWS region crashed!',
    'ruko! meri baat khatam nahi hui! logs dekhe tumne?': 'Stop! I am not finished speaking! Have you even checked the logs?',
    'theek hai, agar tum cloud bill dekhoge toh samajh aayega meri galti nahi thi.': 'Fine, if you look at the cloud logs you will realize it was not my fault.',
    'kya bakwaas hai': 'What nonsense',
    'meri baat suno': 'Listen to me',
    'ruko': 'Stop right there',
    'meri galti nahi thi': 'It was not my fault',
    'tum pagal ho gaye ho': 'Have you lost your mind',

    // English to Hindi
    'don\'t give me that! you pushed untested code straight to main on sunday!': 'Mujhe yeh sab mat bolo! Tumne Sunday ko untested code seedha main pe push kiya tha!',
    'hold on! we lost our biggest enterprise client while you were unreachable!': 'Ruko ek minute! Hamara sabse bada enterprise client chala gaya jab tum phone nahi utha rahe the!',
    'wait... what aws crash? nobody reported an aws region outage.': 'Ruko... kaunsa AWS crash? Kisi ne AWS outage report nahi kiya tha.',
    'wait, look at this timestamp... the downtime started before your push. that was us-east-1.': 'Ruko, yeh timestamp dekho... downtime tumhare push se pehle shuru hua tha. Woh us-east-1 tha.',
    'listen to me': 'Meri baat suno',
    'stop interrupting': 'Toko mat mujhe',
    'i was wrong': 'Meri galti thi',
    'i apologize': 'Main maafi maangta hoon'
  };

  const key = text.trim().toLowerCase();
  if (map[key]) return map[key];

  // Fallback heuristic: word-level colloquial substitution
  let translated = text;
  if (fromLang.startsWith('hi')) {
    translated = text
      .replace(/bakwaas/gi, 'bullshit')
      .replace(/ruko/gi, 'hold on')
      .replace(/meri baat/gi, 'my point')
      .replace(/suno/gi, 'listen')
      .replace(/nahi/gi, 'not')
      .replace(/kya/gi, 'what')
      .replace(/kyunki/gi, 'because')
      .replace(/galti/gi, 'mistake')
      .replace(/theek hai/gi, 'fine');
    return `[Translated]: ${translated}`;
  } else if (fromLang.startsWith('es')) {
    translated = text
      .replace(/inaceptable/gi, 'unacceptable')
      .replace(/escucha/gi, 'listen')
      .replace(/espera/gi, 'wait')
      .replace(/contrato/gi, 'contract')
      .replace(/mentira/gi, 'lie');
    return `[Traducido]: ${translated}`;
  } else {
    return `[Translated to ${toLang.slice(0, 2).toUpperCase()}]: ${text}`;
  }
}

// Simulates live real-time character typing / speech transcription
function streamUtterance(side, nativeText, translation, callback, isInterruption = false) {
  const otherSide = side === 'alpha' ? 'beta' : 'alpha';
  
  // If the other side was speaking, trigger interruption cut-off!
  if (state[otherSide].isSpeaking || isInterruption) {
    handleInterruption(side, otherSide);
  }

  state[side].isSpeaking = true;
  state[side].currentUtterance = nativeText;
  state.currentFloor = side;

  // Visual cues
  document.getElementById(`column-${side}`).classList.add('has-floor');
  document.getElementById(`column-${otherSide}`).classList.remove('has-floor');
  document.getElementById(`${side}-floor-badge`).classList.add('active');
  document.getElementById(`${side}-floor-badge`).innerText = 'SPEAKING';
  document.getElementById(`${otherSide}-floor-badge`).classList.remove('active');
  document.getElementById(`${otherSide}-floor-badge`).innerText = 'MUTED / LISTENING';

  document.getElementById(`${side}-stream-box`).classList.add('active-speaking');
  document.getElementById(`${otherSide}-stream-box`).classList.remove('active-speaking');

  const nativeEl = document.getElementById(`${side}-native-stream`);
  const transEl = document.getElementById(`${side}-translated-stream`);
  const wpmEl = document.getElementById(`${side}-wpm`);

  nativeEl.innerHTML = '';
  transEl.innerHTML = '';

  // Stream text word-by-word at human debate speed
  const words = nativeText.split(' ');
  const transWords = translation.split(' ');
  let idx = 0;
  const wordInterval = Math.max(90, Math.min(240, 2200 / words.length));

  // Voice synthesis triggered
  speakUtterance(nativeText, state[side].lang, side, state.heat > 60);

  const timer = setInterval(() => {
    if (!state[side].isSpeaking) {
      // Interrupted! Cancel remaining words
      clearInterval(timer);
      return;
    }

    if (idx < words.length) {
      nativeEl.innerHTML += (idx > 0 ? ' ' : '') + words[idx];
      
      // Speculatively advance translation
      const transSlice = transWords.slice(0, Math.ceil((idx + 1) * (transWords.length / words.length))).join(' ');
      transEl.innerHTML = transSlice;
      
      // Update WPM
      const currentWpm = Math.round((idx + 1) * (60000 / (wordInterval * (idx + 1))));
      wpmEl.innerText = `${currentWpm} WPM`;

      idx++;
    } else {
      clearInterval(timer);
      transEl.innerHTML = translation;
      commitTurn(side, nativeText, translation);
      if (callback) callback();
    }
  }, wordInterval);
}

function commitTurn(side, nativeText, translation, isRemote = false) {
  state[side].isSpeaking = false;
  document.getElementById(`${side}-floor-badge`).classList.remove('active');
  document.getElementById(`${side}-floor-badge`).innerText = 'OFF FLOOR';
  document.getElementById(`${side}-stream-box`).classList.remove('active-speaking');

  if (!isRemote && typeof broadcastDuplexEvent === 'function') {
    broadcastDuplexEvent({
      type: 'speech_commit',
      side: side,
      text: nativeText,
      translation: translation
    });
  }
  
  // Add to side history list
  const historyList = document.getElementById(`${side}-history-list`);
  const item = document.createElement('div');
  item.className = 'history-item';
  
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  item.innerHTML = `
    <div class="history-meta">
      <span>${state[side].name}</span>
      <span>${timeStr}</span>
    </div>
    <div class="history-native">${nativeText}</div>
    <div class="history-trans">↳ ${translation}</div>
  `;
  historyList.appendChild(item);
  historyList.scrollTop = historyList.scrollHeight;
}

// ==========================================================================
// 6. SCENARIO PLAYTHROUGH SIMULATOR
// ==========================================================================

function runScenarioStep(scenarioKey, stepIndex) {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario || stepIndex >= scenario.script.length) {
    stopSimulation();
    return;
  }

  state.simTurnIndex = stepIndex;
  const turn = scenario.script[stepIndex];
  
  const descEl = document.getElementById('sim-step-desc');
  descEl.innerText = `${state[turn.speaker].name} arguing... [Turn ${stepIndex + 1}/${scenario.script.length}]`;

  // Advance heat
  adjustHeat(turn.heatDelta, 'DIALOGUE');

  // Stream current turn
  streamUtterance(turn.speaker, turn.text, turn.translation, () => {
    // If turn has a concession, record it
    if (turn.concession) {
      recordConcession(turn.speaker, turn.concessionText, turn.commonGround);
    }

    if (!state.isSimulating || state.simPaused) return;

    // Small hesitation before next retort
    const delay = turn.interruptNext ? 400 : 1600;
    setTimeout(() => {
      if (state.isSimulating && !state.simPaused) {
        runScenarioStep(scenarioKey, stepIndex + 1);
      }
    }, delay);
  }, turn.isInterruption);
}

function startSimulation(scenarioKey) {
  initAudio();
  state.isSimulating = true;
  state.simPaused = false;
  state.simTurnIndex = 0;

  document.getElementById('simulation-bar').classList.remove('hidden');
  document.getElementById('sim-pause-btn').innerText = 'Pause';

  // Clear previous streams and logs
  document.getElementById('alpha-history-list').innerHTML = '';
  document.getElementById('beta-history-list').innerHTML = '';
  document.getElementById('concession-list').innerHTML = '';
  document.getElementById('common-ground-text').innerText = 'Positions are still opposed. No consensus reached.';
  document.getElementById('concession-empty-state').style.display = 'block';

  state.interruptCount = 0;
  state.concessionCount = 0;
  updateHUDStats();

  runScenarioStep(scenarioKey, 0);
}

function stopSimulation() {
  state.isSimulating = false;
  state.simPaused = false;
  document.getElementById('simulation-bar').classList.add('hidden');
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ==========================================================================
// 7. MULTI-MODE REAL-TIME DUPLEX SYNC (Vercel + Local + P2P)
// ==========================================================================

let socket = null;
let duplexChannel = null;
let serverlessPollingInterval = null;
let lastServerlessEventTime = Date.now();

// Native 0ms Cross-Tab Duplex Channel (Works instantly in all browsers, even without a server)
try {
  if ('BroadcastChannel' in window) {
    duplexChannel = new BroadcastChannel('takraar_duplex_channel');
    duplexChannel.onmessage = (event) => {
      handleRemoteDuplexMessage(event.data);
    };
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

function handleRemoteDuplexMessage(data) {
  if (!data || !data.type) return;
  try {
    if (data.type === 'speech_interrupt') {
      handleInterruption(data.side, data.targetSide, true);
    } else if (data.type === 'speech_commit') {
      commitTurn(data.side, data.text, data.translation, true);
    } else if (data.type === 'concession') {
      recordConcession(data.side, data.text, data.commonGround, true);
    } else if (data.type === 'heat_delta') {
      adjustHeat(data.delta, data.reason);
    }
  } catch (err) {
    console.error('Remote duplex message error:', err);
  }
}

// Broadcasts an action to other tabs, websockets, and Vercel /api/room
function broadcastDuplexEvent(eventData) {
  eventData.room = 'live-debate';
  eventData.sender = state.currentFloor || 'local';

  // 1. Instant 0ms BroadcastChannel for local tabs
  if (duplexChannel) {
    try { duplexChannel.postMessage(eventData); } catch (e) {}
  }

  // 2. WebSocket if active (local Node server)
  if (socket && socket.readyState === 1) { // 1 = OPEN
    try { socket.send(JSON.stringify(eventData)); } catch (e) {}
  }

  // 3. Vercel Serverless Sync via /api/room
  if (window.location.protocol.startsWith('http')) {
    fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).catch(() => {});
  }
}

// Polls /api/room for remote peers when hosted on Vercel
function startServerlessSync() {
  if (serverlessPollingInterval) return;
  serverlessPollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/room?room=live-debate&since=${lastServerlessEventTime}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.events && data.events.length > 0) {
        lastServerlessEventTime = data.now || Date.now();
        data.events.forEach(evt => {
          handleRemoteDuplexMessage(evt);
        });
      }
    } catch (e) {
      // Quiet fail if offline
    }
  }, 900);
}

function connectWebSocket() {
  const isVercel = window.location.hostname.includes('vercel.app');
  
  // Start serverless sync & broadcast channel immediately
  startServerlessSync();

  if (isVercel) {
    document.getElementById('subagent-status').innerText = 'Vercel Serverless Sync: ACTIVE (0ms P2P + Cloud)';
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      document.getElementById('subagent-status').innerText = 'P2P Duplex WebSocket: CONNECTED';
      socket.send(JSON.stringify({ type: 'join', room: 'live-debate' }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleRemoteDuplexMessage(data);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    socket.onclose = () => {
      document.getElementById('subagent-status').innerText = 'Duplex Engine: Standalone Mode (0ms Local + Serverless)';
    };

    socket.onerror = () => {
      document.getElementById('subagent-status').innerText = 'Duplex Engine: Standalone Mode (0ms Local + Serverless)';
    };
  } catch (err) {
    document.getElementById('subagent-status').innerText = 'Duplex Engine: Standalone Mode (0ms Local + Serverless)';
  }
}

// ==========================================================================
// 8. REAL SPEECH RECOGNITION (WEB SPEECH API)
// ==========================================================================

let alphaRecognition = null;
let betaRecognition = null;

function setupSpeechRecognition(side) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech Recognition is not supported on this browser. Use rapid ammunition buttons or text input!');
    return null;
  }

  const recog = new SpeechRecognition();
  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = state[side].lang;

  recog.onresult = (event) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    const currentText = final || interim;
    if (currentText) {
      const otherSide = side === 'alpha' ? 'beta' : 'alpha';
      const toLang = state[otherSide].lang;
      const translated = translateText(currentText, state[side].lang, toLang);

      // If other side is active, trigger interrupt!
      if (state[otherSide].isSpeaking) {
        handleInterruption(side, otherSide);
      }

      state[side].isSpeaking = true;
      state.currentFloor = side;
      document.getElementById(`${side}-native-stream`).innerText = currentText;
      document.getElementById(`${side}-translated-stream`).innerText = translated;

      if (final) {
        commitTurn(side, final, translated);
      }
    }
  };

  recog.onerror = (err) => {
    console.warn(`Speech recognition error on ${side}:`, err);
  };

  return recog;
}

function toggleMic(side) {
  initAudio();
  const btn = document.getElementById(`${side}-mic-btn`);
  const pulse = document.getElementById(`${side}-pulse`);

  if (state.activeMic === side) {
    // Turn off mic
    if (side === 'alpha' && alphaRecognition) alphaRecognition.stop();
    if (side === 'beta' && betaRecognition) betaRecognition.stop();
    state.activeMic = null;
    btn.classList.remove('active-recording');
    pulse.classList.remove('active-mic');
    btn.querySelector('.mic-text').innerText = 'Hold or Click to Speak';
  } else {
    // Turn on mic
    if (side === 'alpha') {
      if (!alphaRecognition) alphaRecognition = setupSpeechRecognition('alpha');
      if (alphaRecognition) alphaRecognition.start();
    } else {
      if (!betaRecognition) betaRecognition = setupSpeechRecognition('beta');
      if (betaRecognition) betaRecognition.start();
    }

    state.activeMic = side;
    btn.classList.add('active-recording');
    pulse.classList.add('active-mic');
    btn.querySelector('.mic-text').innerText = '🎙️ Listening... (Speak Now!)';
  }
}

// ==========================================================================
// 9. WAVEFORM CLASH ANIMATION CANVAS
// ==========================================================================

function initWaveformCanvas() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let phase = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    phase += 0.05;

    // Draw Alpha Channel (Orange)
    ctx.beginPath();
    ctx.strokeStyle = state.alpha.isSpeaking ? 'rgba(255, 92, 0, 0.95)' : 'rgba(255, 92, 0, 0.25)';
    ctx.lineWidth = state.alpha.isSpeaking ? 2.5 : 1;
    
    const alphaAmp = state.alpha.isSpeaking ? (state.heat / 2.5) : 3;

    for (let x = 0; x < width; x += 3) {
      const y = midY + Math.sin(x * 0.04 + phase) * Math.cos(x * 0.02 + phase) * alphaAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Beta Channel (Cyan)
    ctx.beginPath();
    ctx.strokeStyle = state.beta.isSpeaking ? 'rgba(0, 229, 255, 0.95)' : 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = state.beta.isSpeaking ? 2.5 : 1;

    const betaAmp = state.beta.isSpeaking ? (state.heat / 2.5) : 3;

    for (let x = 0; x < width; x += 3) {
      const y = midY + Math.cos(x * 0.04 - phase) * Math.sin(x * 0.02 - phase) * betaAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Mutual Collision / Acoustic Overlap
    const overlapEl = document.getElementById('overlap-metric');
    if (state.alpha.isSpeaking && state.beta.isSpeaking) {
      overlapEl.innerText = '94% CLASH';
      overlapEl.style.color = 'var(--zip-crimson)';

      // Draw red interference spikes
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 42, 77, 0.8)';
      ctx.lineWidth = 3;
      for (let x = 0; x < width; x += 8) {
        const spike = (Math.random() - 0.5) * (state.heat * 0.8);
        ctx.moveTo(x, midY - spike);
        ctx.lineTo(x, midY + spike);
      }
      ctx.stroke();
    } else {
      overlapEl.innerText = '0% OVERLAP';
      overlapEl.style.color = 'var(--bone-muted)';
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();
}

// ==========================================================================
// 10. SCENARIO SWITCHING & INITIALIZATION
// ==========================================================================

function loadScenario(scenarioKey) {
  state.currentScenario = scenarioKey;
  const sc = SCENARIOS[scenarioKey];
  if (!sc) return;

  // Set titles
  document.getElementById('dispute-title').innerText = sc.title;
  document.getElementById('dispute-summary').innerText = sc.desc;

  // Set speaker names
  document.getElementById('alpha-name').innerText = sc.alphaName;
  document.getElementById('beta-name').innerText = sc.betaName;
  state.alpha.name = sc.alphaName;
  state.beta.name = sc.betaName;

  // Set languages
  document.getElementById('alpha-lang-select').value = sc.alphaLang;
  document.getElementById('beta-lang-select').value = sc.betaLang;
  state.alpha.lang = sc.alphaLang;
  state.beta.lang = sc.betaLang;

  // Populate quick ammunition slugs
  const alphaSlugsContainer = document.getElementById('alpha-slugs');
  alphaSlugsContainer.innerHTML = '';
  sc.alphaSlugs.forEach(slug => {
    const btn = document.createElement('button');
    btn.className = 'slug-pill';
    btn.setAttribute('data-side', 'alpha');
    btn.setAttribute('data-text', slug.text);
    btn.innerText = `"${slug.label}"`;
    btn.onclick = () => {
      initAudio();
      const toLang = state.beta.lang;
      const translation = translateText(slug.text, state.alpha.lang, toLang);
      streamUtterance('alpha', slug.text, translation);
    };
    alphaSlugsContainer.appendChild(btn);
  });

  const betaSlugsContainer = document.getElementById('beta-slugs');
  betaSlugsContainer.innerHTML = '';
  sc.betaSlugs.forEach(slug => {
    const btn = document.createElement('button');
    btn.className = 'slug-pill';
    btn.setAttribute('data-side', 'beta');
    btn.setAttribute('data-text', slug.text);
    btn.innerText = `"${slug.label}"`;
    btn.onclick = () => {
      initAudio();
      const toLang = state.alpha.lang;
      const translation = translateText(slug.text, state.beta.lang, toLang);
      streamUtterance('beta', slug.text, translation);
    };
    betaSlugsContainer.appendChild(btn);
  });

  // Highlight active scenario in modal
  document.querySelectorAll('.scenario-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-scenario') === scenarioKey);
  });

  // Close modal
  document.getElementById('scenario-modal').classList.add('hidden');
}

// Timer for dispute duration
function startDisputeTimer() {
  const timerEl = document.getElementById('dispute-timer');
  setInterval(() => {
    const elapsedSecs = Math.floor((Date.now() - state.disputeStartTime) / 1000);
    const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
    const secs = String(elapsedSecs % 60).padStart(2, '0');
    timerEl.innerText = `${mins}:${secs}`;
  }, 1000);
}

// Event Bindings
function bindEvents() {
  // Mic buttons
  document.getElementById('alpha-mic-btn').addEventListener('click', () => toggleMic('alpha'));
  document.getElementById('beta-mic-btn').addEventListener('click', () => toggleMic('beta'));

  // Interrupt buttons
  document.getElementById('alpha-interrupt-btn').addEventListener('click', () => {
    initAudio();
    const retort = state.currentScenario === 'startup' 
      ? 'Ruko! Meri baat khatam nahi hui! Logs dekhe tumne?'
      : '¡Cállate un momento y escucha!';
    const trans = translateText(retort, state.alpha.lang, state.beta.lang);
    streamUtterance('alpha', retort, trans, null, true);
  });

  document.getElementById('beta-interrupt-btn').addEventListener('click', () => {
    initAudio();
    const retort = state.currentScenario === 'startup'
      ? 'Hold on! We lost our biggest enterprise client while you were unreachable!'
      : 'Hold on! You are violating the original agreement!';
    const trans = translateText(retort, state.beta.lang, state.alpha.lang);
    streamUtterance('beta', retort, trans, null, true);
  });

  // Manual inputs
  document.getElementById('alpha-send-btn').addEventListener('click', () => {
    const input = document.getElementById('alpha-manual-input');
    const val = input.value.trim();
    if (!val) return;
    initAudio();
    const trans = translateText(val, state.alpha.lang, state.beta.lang);
    streamUtterance('alpha', val, trans);
    input.value = '';
  });

  document.getElementById('alpha-manual-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('alpha-send-btn').click();
  });

  document.getElementById('beta-send-btn').addEventListener('click', () => {
    const input = document.getElementById('beta-manual-input');
    const val = input.value.trim();
    if (!val) return;
    initAudio();
    const trans = translateText(val, state.beta.lang, state.alpha.lang);
    streamUtterance('beta', val, trans);
    input.value = '';
  });

  document.getElementById('beta-manual-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('beta-send-btn').click();
  });

  // Language selectors
  document.getElementById('alpha-lang-select').addEventListener('change', (e) => {
    state.alpha.lang = e.target.value;
  });
  document.getElementById('beta-lang-select').addEventListener('change', (e) => {
    state.beta.lang = e.target.value;
  });

  // Audio toggles
  document.getElementById('toggle-audio-sfx').addEventListener('click', () => {
    state.sfxEnabled = !state.sfxEnabled;
    const btn = document.getElementById('toggle-audio-sfx');
    btn.classList.toggle('active', state.sfxEnabled);
    document.getElementById('sfx-icon').innerText = state.sfxEnabled ? '🔊' : '🔇';
  });

  document.getElementById('tts-toggle').addEventListener('change', (e) => {
    state.ttsEnabled = e.target.checked;
    if (!state.ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  });

  // Scenario Modal
  const modal = document.getElementById('scenario-modal');
  document.getElementById('scenario-selector-btn').addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  document.querySelectorAll('.btn-select-scenario').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenarioKey = btn.getAttribute('data-scenario');
      loadScenario(scenarioKey);
    });
  });

  // Quick Demo Playthrough Button
  document.getElementById('quick-demo-btn').addEventListener('click', () => {
    loadScenario('startup');
    startSimulation('startup');
  });

  // Simulation Controls
  document.getElementById('sim-pause-btn').addEventListener('click', () => {
    state.simPaused = !state.simPaused;
    document.getElementById('sim-pause-btn').innerText = state.simPaused ? 'Resume' : 'Pause';
    if (!state.simPaused) {
      runScenarioStep(state.currentScenario, state.simTurnIndex + 1);
    }
  });

  document.getElementById('sim-stop-btn').addEventListener('click', () => {
    stopSimulation();
  });
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  loadScenario('startup');
  bindEvents();
  startDisputeTimer();
  initWaveformCanvas();
  connectWebSocket();
});
