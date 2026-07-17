# 🌐 VakyaVerse.

> **Intelligent AI Translation Platform**  
> Translate text, voice, and images across Indian languages and world's top languages — all in real-time, no API keys required.

<div align="center">

![VakyaVerse Banner](https://img.shields.io/badge/VakyaVerse-AI%20Translation-7C3AED?style=for-the-badge&logo=googletranslate&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.2-FF0055?style=for-the-badge&logo=framer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)

</div>

---

## ✨ Features

### 🔤 Text Translation
- Auto-detects source language from script (Devanagari, Telugu, Tamil, etc.)
- Detects **romanized Indian languages** (e.g., typing `emaindi` → detects as Telugu)
- Real-time sentiment analysis (Positive / Negative / Neutral)
- Copy to clipboard & text-to-speech output
- Language swap button

### 🎙 Voice Translation
- Speak in any Indian/world language using the **Web Speech API**
- Translates spoken words and **auto-speaks** the translation in the target language
- Live "Listening…" indicator with animated pulse rings
- Supports all listed languages as voice input

### 📸 Image OCR Translation
- Drag-and-drop or click-to-upload images (JPEG, PNG, WebP · up to 10MB)
- OCR powered by **Tesseract.js** — extracts text from images locally (no upload to server)
- Animated scan-line effect during processing
- Live progress bar · Copy extracted text & translation

### 💬 Two-Way Conversation Mode
- Person A and Person B each speak their own language
- After each utterance, translation is shown in the chat and **spoken back** in the other language
- Real-time live transcript display while speaking
- Chat history with clear-all option

### 🎨 UI / UX Highlights
- **3D TiltCard** hover effect on all interactive cards (physics-based, cursor-tracked glow)
- **Three.js** animated particle background
- Glassmorphism card design with multi-layer elevation shadows
- Smooth **AnimatePresence** transitions between tabs
- **Navbar** always above all content (z-index layered correctly)
- Fully responsive layout

---

## 🌍 Supported Languages

### Indian Languages
| Language | Code | Script |
|---|---|---|
| Hindi | `hi` | Devanagari |
| Telugu | `te` | Telugu |
| Tamil | `ta` | Tamil |
| Bengali | `bn` | Bengali |
| Marathi | `mr` | Devanagari |
| Gujarati | `gu` | Gujarati |
| Kannada | `kn` | Kannada |
| Malayalam | `ml` | Malayalam |
| Punjabi | `pa` | Gurmukhi |
| Urdu | `ur` | Nastaliq |
| Odia | `or` | Odia |

### World Top 5
| Language | Code |
|---|---|
| English | `en` |
| Mandarin Chinese | `zh` |
| Spanish | `es` |
| Arabic | `ar` |
| French | `fr` |

---

## 🔠 Romanized Language Detection

VakyaVerse can detect when you type an Indian language using English letters (romanized form):

| You type | Detected as |
|---|---|
| `emaindi`, `ela unnaru` | Telugu |
| `kaise ho`, `kya haal` | Hindi |
| `vanakkam`, `nandri` | Tamil |
| `kemon acho`, `ki korcho` | Bengali |
| `namaskara`, `hegiddira` | Kannada |
| `namaskar`, `kasa kai` | Marathi |
| `kem cho`, `shu chhe` | Gujarati |
| `sat sri akal`, `ki haal` | Punjabi |
| `sugamaano`, `enthanu` | Malayalam |

> **How it works:** Pattern matching on common romanized words → maps to the correct BCP-47 language code → sends to Lingva/MyMemory API which handles the romanized → native script translation automatically.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Animations | Framer Motion 11, GSAP 3 |
| 3D Background | Three.js + @react-three/fiber |
| OCR | Tesseract.js 5 (runs locally in browser) |
| HTTP Client | Axios |
| Local Storage | IndexedDB via `idb` |
| Primary Translation API | [Lingva Translate](https://lingva.ml) (free Google Translate proxy) |
| Fallback Translation API | [MyMemory](https://mymemory.translated.net) (free, no key needed) |
| Voice Input | Web Speech API (`SpeechRecognition`) |
| Voice Output | Web Speech API (`SpeechSynthesis`) |
| Styling | Vanilla CSS with CSS custom properties |

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18+**
- npm **9+**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sarweshwargoud/VakyaVerse.git
cd VakyaVerse

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
# Output is in the /dist folder

# Preview the production build
npm run preview
```

---

## 📁 Project Structure

```
VakyaVerse/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── TextTranslator.jsx  # Text tab — input/output with detection
│   │   ├── VoiceTranslator.jsx # Voice tab — mic + real-time translation
│   │   ├── ImageTranslator.jsx # Image tab — OCR + translation
│   │   ├── ConversationMode.jsx# Convo tab — two-way chat
│   │   ├── TiltCard.jsx        # 3D hover card wrapper (forwardRef)
│   │   ├── HeroSection.jsx     # Hero with VakyaVerse branding + tagline
│   │   ├── Navbar.jsx          # Top nav with theme toggle + history
│   │   ├── HistoryPanel.jsx    # Slide-in translation history (IndexedDB)
│   │   ├── ThreeBackground.jsx # Three.js animated background
│   │   ├── ExplanationPanel.jsx# Word explanation panel
│   │   ├── SentimentPanel.jsx  # Sentiment analysis display
│   │   └── TTSControls.jsx     # Text-to-speech controls
│   ├── utils/
│   │   ├── translationAPI.js   # Language list, detection, Lingva+MyMemory
│   │   ├── historyManager.js   # IndexedDB CRUD for translation history
│   │   ├── ttsEngine.js        # SpeechSynthesis wrapper
│   │   └── animations.js       # GSAP helpers (magnetic, debounce)
│   ├── styles/
│   │   └── globals.css         # Design system — tokens, glass cards, utils
│   └── App.jsx                 # Root — tab routing, backgrounds, layout
├── package.json
├── vite.config.js
└── README.md
```

---

## 🌐 Translation APIs

VakyaVerse uses **free, public APIs** — no API keys required:

### Primary: Lingva Translate
- A free, privacy-respecting Google Translate proxy
- Endpoint: `https://lingva.ml/api/v1/{source}/{target}/{text}`
- Handles romanized Indian language input automatically
- No rate limits for reasonable usage

### Fallback: MyMemory
- Free machine translation API (200 free requests/day per IP)
- Endpoint: `https://api.mymemory.translated.net/get?q={text}&langpair={src}|{tgt}`
- Activates automatically if Lingva is unreachable

---

## ⚠️ Browser Requirements

| Feature | Required API | Supported Browsers |
|---|---|---|
| Voice Input | `SpeechRecognition` | Chrome, Edge (not Firefox/Safari) |
| Voice Output | `SpeechSynthesis` | Chrome, Edge, Firefox, Safari |
| Image OCR | Tesseract.js (WASM) | All modern browsers |
| Text Translation | Fetch/Axios | All modern browsers |

> **Best experience:** Google Chrome or Microsoft Edge on desktop

---

## 🔒 Privacy

- **No data is sent to any server** except the translation APIs
- OCR runs **entirely in your browser** using WebAssembly — images never leave your device
- Translation history is stored **locally** in your browser's IndexedDB
- No tracking, no analytics, no accounts required

---

## 🗺 Roadmap

- [ ] Document translation (PDF / DOCX upload)
- [ ] Offline translation via on-device models
- [ ] Browser extension
- [ ] Mobile PWA support
- [ ] More Indian languages (Sindhi, Assamese, Konkani)
- [ ] Translation confidence scores
- [ ] Export history as CSV/PDF

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**VakyaVerse** · Intelligent AI Translation Platform  
Built with ❤️ by **Sarweshwar**

*"Vakya" (वाक्य) means "sentence" in Sanskrit*

</div>
