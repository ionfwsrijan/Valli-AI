import type { QuestionPayload } from './types'

export type AppLanguage = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn'

export interface LocalizedOption {
  value: string
  label: string
  canonicalLabel: string
}

export interface LocalizedQuestion {
  text: string
  helperText: string | null
  whyText: string | null
  options: LocalizedOption[]
  promptText: string
}

const TAMIL_DIGITS: Record<string, string> = {
  '௦': '0',
  '௧': '1',
  '௨': '2',
  '௩': '3',
  '௪': '4',
  '௫': '5',
  '௬': '6',
  '௭': '7',
  '௮': '8',
  '௯': '9',
}

const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
}

const TELUGU_DIGITS: Record<string, string> = {
  '౦': '0',
  '౧': '1',
  '౨': '2',
  '౩': '3',
  '౪': '4',
  '౫': '5',
  '౬': '6',
  '౭': '7',
  '౮': '8',
  '౯': '9',
}

const MALAYALAM_DIGITS: Record<string, string> = {
  '൦': '0',
  '൧': '1',
  '൨': '2',
  '൩': '3',
  '൪': '4',
  '൫': '5',
  '൬': '6',
  '൭': '7',
  '൮': '8',
  '൯': '9',
}

const KANNADA_DIGITS: Record<string, string> = {
  '೦': '0',
  '೧': '1',
  '೨': '2',
  '೩': '3',
  '೪': '4',
  '೫': '5',
  '೬': '6',
  '೭': '7',
  '೮': '8',
  '೯': '9',
}

const UI_TEXT = {
  en: {
    home: 'Home',
    assessment: 'Assessment',
    report: 'Report',
    records: 'Records',
    syncSessions: 'Sync sessions',
    newAssessment: 'New assessment',
    launchNewAssessment: 'Launch new assessment',
    openRecords: 'Open records',
    language: 'Language',
    english: 'English',
    tamil: 'தமிழ்',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    malayalam: 'മലയാളം',
    kannada: 'ಕನ್ನಡ',
    patientInterview: 'Patient Interview',
    patientQuestionnaire: 'Patient questionnaire',
    voicePromptsOn: 'Voice prompts on',
    voicePromptsOff: 'Voice prompts off',
    startAssessment: 'Start assessment',
    startingAssessment: 'Starting assessment...',
    startingAssessmentHelper:
      'Opening your assessment now. If this is the first request in a while, it may take a few seconds.',
    resumeAssessment: 'Resume assessment',
    resumeHelper: 'Continue where you left off.',
    nextQuestion: 'Next question',
    resumeCameraExam: 'Continue with the camera airway examination.',
    startNewAssessmentPrompt: 'Start a new assessment to begin the patient questionnaire.',
    currentPrompt: 'Current prompt',
    whyAsked: 'Why am I being asked this?',
    hideWhy: 'Hide explanation',
    repeatPrompt: 'Repeat',
    rephrasePrompt: 'Rephrase',
    slowDownPrompt: 'Slow down',
    capturedResponse: 'Captured response',
    submitCapturedResponse: 'Submit captured response',
    submitResponse: 'Submit response',
    clear: 'Clear',
    saving: 'Saving...',
    yes: 'Yes',
    no: 'No',
    skip: 'Skip',
    typeOrDictate: "Type or dictate the patient's exact response here...",
    speechUnsupported: 'Speech recognition is not supported in this browser.',
    policyHelper:
      'You can also ask hospital-policy questions here, such as fasting or ride-home planning. The assistant will answer from the configured policy knowledge base and keep the assessment on track.',
  },
  ta: {
    home: 'முகப்பு',
    assessment: 'மதிப்பீடு',
    report: 'அறிக்கை',
    records: 'பதிவுகள்',
    syncSessions: 'பதிவுகளை ஒத்திசை',
    newAssessment: 'புதிய மதிப்பீடு',
    launchNewAssessment: 'புதிய மதிப்பீட்டை தொடங்கு',
    openRecords: 'பதிவுகளைத் திற',
    language: 'மொழி',
    english: 'English',
    tamil: 'தமிழ்',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    malayalam: 'മലയാളം',
    kannada: 'ಕನ್ನಡ',
    patientInterview: 'நோயாளர் நேர்காணல்',
    patientQuestionnaire: 'நோயாளர் கேள்வித்தாள்',
    voicePromptsOn: 'குரல் வழிகாட்டுதல் இயங்குகிறது',
    voicePromptsOff: 'குரல் வழிகாட்டுதல் நிறுத்தப்பட்டது',
    startAssessment: 'மதிப்பீட்டை தொடங்கு',
    startingAssessment: 'மதிப்பீடு தொடங்குகிறது...',
    startingAssessmentHelper:
      'உங்கள் மதிப்பீடு திறக்கப்படுகிறது. சில நேரம் பயன்பாடு அமைதியாக இருந்திருந்தால் இது சில வினாடிகள் எடுக்கலாம்.',
    resumeAssessment: 'மதிப்பீட்டைத் தொடர்க',
    resumeHelper: 'நீங்கள் நிறுத்திய இடத்திலிருந்து தொடருங்கள்.',
    nextQuestion: 'அடுத்த கேள்வி',
    resumeCameraExam: 'கேமரா காற்றுப்பாதை பரிசோதனையைத் தொடருங்கள்.',
    startNewAssessmentPrompt: 'நோயாளர் கேள்வித்தாளை தொடங்க புதிய மதிப்பீட்டைத் தொடங்குங்கள்.',
    currentPrompt: 'தற்போதைய கேள்வி',
    whyAsked: 'ஏன் இந்த கேள்வி கேட்கிறீர்கள்?',
    hideWhy: 'விளக்கத்தை மறை',
    repeatPrompt: 'மீண்டும் சொல்',
    rephrasePrompt: 'மாற்றிச் சொல்',
    slowDownPrompt: 'மெதுவாக சொல்',
    capturedResponse: 'பதிவு செய்யப்பட்ட பதில்',
    submitCapturedResponse: 'பதிவு செய்யப்பட்ட பதிலை அனுப்பு',
    submitResponse: 'பதிலை அனுப்பு',
    clear: 'அழி',
    saving: 'சேமிக்கிறது...',
    yes: 'ஆம்',
    no: 'இல்லை',
    skip: 'தவிர்',
    typeOrDictate: 'நோயாளியின் சரியான பதிலை இங்கே தட்டச்சு செய்யவும் அல்லது குரலில் சொல்லவும்...',
    speechUnsupported: 'இந்த உலாவியில் குரல் அடையாளம் காண்பது ஆதரிக்கப்படவில்லை.',
    policyHelper:
      'இங்கே உண்ணாவிரதம் அல்லது வீட்டிற்கு அழைத்து செல்லும் ஏற்பாடு போன்ற மருத்துவமனை கொள்கை கேள்விகளையும் கேட்கலாம். உதவியாளர் கொடுக்கப்பட்ட கொள்கை தகவலை பயன்படுத்தி பதிலளித்து மதிப்பீட்டை தொடர்ந்து வைத்திருப்பார்.',
  },
  hi: {
    home: 'होम',
    assessment: 'आकलन',
    report: 'रिपोर्ट',
    records: 'रिकॉर्ड्स',
    syncSessions: 'रिकॉर्ड्स सिंक करें',
    newAssessment: 'नया आकलन',
    launchNewAssessment: 'नया आकलन शुरू करें',
    openRecords: 'रिकॉर्ड्स खोलें',
    language: 'भाषा',
    english: 'English',
    tamil: 'தமிழ்',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    malayalam: 'മലയാളം',
    kannada: 'ಕನ್ನಡ',
    patientInterview: 'मरीज साक्षात्कार',
    patientQuestionnaire: 'मरीज प्रश्नावली',
    voicePromptsOn: 'वॉइस प्रॉम्प्ट चालू',
    voicePromptsOff: 'वॉइस प्रॉम्प्ट बंद',
    startAssessment: 'आकलन शुरू करें',
    startingAssessment: 'आकलन शुरू हो रहा है...',
    startingAssessmentHelper:
      'आपका आकलन खोला जा रहा है। अगर कुछ समय से कोई अनुरोध नहीं गया था, तो इसमें कुछ सेकंड लग सकते हैं।',
    resumeAssessment: 'आकलन फिर शुरू करें',
    resumeHelper: 'जहाँ छोड़ा था वहीं से जारी रखें।',
    nextQuestion: 'अगला प्रश्न',
    resumeCameraExam: 'कैमरा एयरवे जांच जारी रखें।',
    startNewAssessmentPrompt: 'मरीज प्रश्नावली शुरू करने के लिए नया आकलन शुरू करें।',
    currentPrompt: 'वर्तमान प्रश्न',
    whyAsked: 'मुझसे यह क्यों पूछा जा रहा है?',
    hideWhy: 'व्याख्या छुपाएँ',
    repeatPrompt: 'फिर बोलें',
    rephrasePrompt: 'आसान करके बोलें',
    slowDownPrompt: 'धीरे बोलें',
    capturedResponse: 'रिकॉर्ड किया गया उत्तर',
    submitCapturedResponse: 'रिकॉर्ड किया गया उत्तर भेजें',
    submitResponse: 'उत्तर भेजें',
    clear: 'साफ करें',
    saving: 'सेव हो रहा है...',
    yes: 'हाँ',
    no: 'नहीं',
    skip: 'छोड़ें',
    typeOrDictate: 'मरीज का सही उत्तर यहाँ टाइप करें या आवाज़ से बोलें...',
    speechUnsupported: 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है।',
    policyHelper:
      'आप यहाँ अस्पताल नीति से जुड़े प्रश्न भी पूछ सकते हैं, जैसे उपवास या घर वापस जाने की व्यवस्था। सहायक उपलब्ध नीति जानकारी का उपयोग करके उत्तर देगा और आकलन को जारी रखेगा।',
  },
  te: {
    home: 'హోమ్',
    assessment: 'అసెస్‌మెంట్',
    report: 'రిపోర్ట్',
    records: 'రికార్డులు',
    syncSessions: 'సెషన్‌లను సమకాలీకరించండి',
    newAssessment: 'కొత్త అసెస్‌మెంట్',
    launchNewAssessment: 'కొత్త అసెస్‌మెంట్ ప్రారంభించండి',
    openRecords: 'రికార్డులు తెరవండి',
    language: 'భాష',
    english: 'English',
    tamil: 'தமிழ்',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    malayalam: 'മലയാളം',
    kannada: 'ಕನ್ನಡ',
    patientInterview: 'రోగి ఇంటర్వ్యూ',
    patientQuestionnaire: 'రోగి ప్రశ్నావళి',
    voicePromptsOn: 'వాయిస్ ప్రాంప్ట్‌లు ఆన్‌లో ఉన్నాయి',
    voicePromptsOff: 'వాయిస్ ప్రాంప్ట్‌లు ఆఫ్‌లో ఉన్నాయి',
    startAssessment: 'అసెస్‌మెంట్ ప్రారంభించండి',
    startingAssessment: 'అసెస్‌మెంట్ ప్రారంభమవుతోంది...',
    startingAssessmentHelper:
      'మీ అసెస్‌మెంట్ ఇప్పుడు తెరుచుకుంటోంది. కొంతసేపటి తర్వాత మొదటి అభ్యర్థన అయితే కొన్ని సెకన్లు పట్టవచ్చు.',
    resumeAssessment: 'అసెస్‌మెంట్‌ను కొనసాగించండి',
    resumeHelper: 'మీరు ఆపిన చోటు నుంచే కొనసాగించండి.',
    nextQuestion: 'తదుపరి ప్రశ్న',
    resumeCameraExam: 'కెమెరా ఎయిర్‌వే పరీక్షను కొనసాగించండి.',
    startNewAssessmentPrompt: 'రోగి ప్రశ్నావళిని ప్రారంభించడానికి కొత్త అసెస్‌మెంట్ ప్రారంభించండి.',
    currentPrompt: 'ప్రస్తుత ప్రశ్న',
    whyAsked: 'ఈ ప్రశ్న ఎందుకు అడుగుతున్నారు?',
    hideWhy: 'వివరణ దాచండి',
    repeatPrompt: 'మళ్లీ చెప్పండి',
    rephrasePrompt: 'ఇంకా సులభంగా చెప్పండి',
    slowDownPrompt: 'నెమ్మదిగా చెప్పండి',
    capturedResponse: 'రికార్డ్ చేసిన సమాధానం',
    submitCapturedResponse: 'రికార్డ్ చేసిన సమాధానాన్ని పంపండి',
    submitResponse: 'సమాధానం పంపండి',
    clear: 'తొలగించండి',
    saving: 'సేవ్ అవుతోంది...',
    yes: 'అవును',
    no: 'కాదు',
    skip: 'దాటవేయండి',
    typeOrDictate: 'రోగి చెప్పిన సమాధానాన్ని ఇక్కడ టైప్ చేయండి లేదా వాయిస్‌తో చెప్పండి...',
    speechUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు.',
    policyHelper:
      'ఇక్కడ ఉపవాసం లేదా ఇంటికి తీసుకెళ్లే ఏర్పాట్ల వంటి ఆసుపత్రి సూచనల గురించి కూడా అడగవచ్చు. సహాయకుడు అందుబాటులో ఉన్న విధాన సమాచారంతో సమాధానం చెప్పి అసెస్‌మెంట్‌ను కొనసాగిస్తాడు.',
  },
  ml: {
    home: 'ഹോം',
    assessment: 'അസസ്‌മെന്റ്',
    report: 'റിപ്പോർട്ട്',
    records: 'റെക്കോർഡുകൾ',
    syncSessions: 'സെഷനുകൾ സമന്വയിപ്പിക്കുക',
    newAssessment: 'പുതിയ അസസ്‌മെന്റ്',
    launchNewAssessment: 'പുതിയ അസസ്‌മെന്റ് ആരംഭിക്കുക',
    openRecords: 'റെക്കോർഡുകൾ തുറക്കുക',
    language: 'ഭാഷ',
    english: 'English',
    tamil: 'தமிழ்',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    malayalam: 'മലയാളം',
    kannada: 'ಕನ್ನಡ',
    patientInterview: 'രോഗി അഭിമുഖം',
    patientQuestionnaire: 'രോഗി ചോദ്യാവലി',
    voicePromptsOn: 'വോയ്‌സ് പ്രോംപ്റ്റുകൾ ഓണാണ്',
    voicePromptsOff: 'വോയ്‌സ് പ്രോംപ്റ്റുകൾ ഓഫ് ആണ്',
    startAssessment: 'അസസ്‌മെന്റ് ആരംഭിക്കുക',
    startingAssessment: 'അസസ്‌മെന്റ് ആരംഭിക്കുന്നു...',
    startingAssessmentHelper:
      'നിങ്ങളുടെ അസസ്‌മെന്റ് ഇപ്പോൾ തുറക്കുകയാണ്. കുറച്ച് നേരത്തിന് ശേഷം ചെയ്യുന്ന ആദ്യ അഭ്യർത്ഥനയായാൽ ചില സെക്കൻഡ് എടുക്കാം.',
    resumeAssessment: 'അസസ്‌മെന്റ് തുടരുക',
    resumeHelper: 'നിങ്ങൾ നിർത്തിയിടത്ത് നിന്ന് തുടരുക.',
    nextQuestion: 'അടുത്ത ചോദ്യം',
    resumeCameraExam: 'ക്യാമറ എയർവേ പരിശോധന തുടരുക.',
    startNewAssessmentPrompt: 'രോഗി ചോദ്യാവലി ആരംഭിക്കാൻ പുതിയ അസസ്‌മെന്റ് ആരംഭിക്കുക.',
    currentPrompt: 'നിലവിലെ ചോദ്യം',
    whyAsked: 'ഈ ചോദ്യം എന്തിന് ചോദിക്കുന്നു?',
    hideWhy: 'വിവരണം മറയ്ക്കുക',
    repeatPrompt: 'വീണ്ടും പറയൂ',
    rephrasePrompt: 'കുറച്ച് ലളിതമായി പറയൂ',
    slowDownPrompt: 'ഇനിയും മന്ദഗതിയിൽ പറയൂ',
    capturedResponse: 'റെക്കോർഡ് ചെയ്ത മറുപടി',
    submitCapturedResponse: 'റെക്കോർഡ് ചെയ്ത മറുപടി അയയ്ക്കുക',
    submitResponse: 'മറുപടി അയയ്ക്കുക',
    clear: 'മായ്ക്കുക',
    saving: 'സേവ് ചെയ്യുന്നു...',
    yes: 'അതെ',
    no: 'ഇല്ല',
    skip: 'ഒഴിവാക്കുക',
    typeOrDictate: 'രോഗിയുടെ കൃത്യമായ മറുപടി ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ ശബ്ദമായി പറയുക...',
    speechUnsupported: 'ഈ ബ്രൗസറിൽ ശബ്ദം തിരിച്ചറിയൽ പിന്തുണയ്ക്കുന്നില്ല.',
    policyHelper:
      'ഇവിടെ ഉപവാസം അല്ലെങ്കിൽ വീട്ടിലേക്ക് മടങ്ങാനുള്ള ക്രമീകരണം പോലുള്ള ആശുപത്രി നിർദേശങ്ങളെയും കുറിച്ച് ചോദിക്കാം. സഹായി ലഭ്യമായ നയം അടിസ്ഥാനമാക്കി മറുപടി നൽകി അസസ്‌മെന്റ് തുടരും.',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    assessment: 'ಮೌಲ್ಯಮಾಪನ',
    report: 'ವರದಿ',
    records: 'ದಾಖಲೆಗಳು',
    syncSessions: 'ಸೆಷನ್‌ಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಿ',
    newAssessment: 'ಹೊಸ ಮೌಲ್ಯಮಾಪನ',
    launchNewAssessment: 'ಹೊಸ ಮೌಲ್ಯಮಾಪನ ಆರಂಭಿಸಿ',
    openRecords: 'ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಿರಿ',
    language: 'ಭಾಷೆ',
    english: 'English',
    tamil: 'தமிழ்',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    malayalam: 'മലയാളം',
    kannada: 'ಕನ್ನಡ',
    patientInterview: 'ರೋಗಿ ಸಂದರ್ಶನ',
    patientQuestionnaire: 'ರೋಗಿ ಪ್ರಶ್ನಾವಳಿ',
    voicePromptsOn: 'ವಾಯ್ಸ್ ಪ್ರಾಂಪ್ಟ್‌ಗಳು ಆನ್ ಇವೆ',
    voicePromptsOff: 'ವಾಯ್ಸ್ ಪ್ರಾಂಪ್ಟ್‌ಗಳು ಆಫ್ ಇವೆ',
    startAssessment: 'ಮೌಲ್ಯಮಾಪನ ಆರಂಭಿಸಿ',
    startingAssessment: 'ಮೌಲ್ಯಮಾಪನ ಆರಂಭವಾಗುತ್ತಿದೆ...',
    startingAssessmentHelper:
      'ನಿಮ್ಮ ಮೌಲ್ಯಮಾಪನ ಈಗ ತೆರೆದುಕೊಳ್ಳುತ್ತಿದೆ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರದ ಮೊದಲ ವಿನಂತಿಯಾಗಿದ್ದರೆ ಕೆಲವು ಸೆಕೆಂಡುಗಳು ಹಿಡಿಯಬಹುದು.',
    resumeAssessment: 'ಮೌಲ್ಯಮಾಪನ ಮುಂದುವರಿಸಿ',
    resumeHelper: 'ನೀವು ನಿಲ್ಲಿಸಿದ ಸ್ಥಳದಿಂದ ಮುಂದುವರಿಸಿ.',
    nextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ',
    resumeCameraExam: 'ಕ್ಯಾಮೆರಾ ಏರ್‌ವೇ ಪರೀಕ್ಷೆಯನ್ನು ಮುಂದುವರಿಸಿ.',
    startNewAssessmentPrompt: 'ರೋಗಿ ಪ್ರಶ್ನಾವಳಿಯನ್ನು ಆರಂಭಿಸಲು ಹೊಸ ಮೌಲ್ಯಮಾಪನ ಆರಂಭಿಸಿ.',
    currentPrompt: 'ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆ',
    whyAsked: 'ಈ ಪ್ರಶ್ನೆಯನ್ನು ಏಕೆ ಕೇಳಲಾಗುತ್ತಿದೆ?',
    hideWhy: 'ವಿವರಣೆಯನ್ನು ಮರೆಮಾಡಿ',
    repeatPrompt: 'ಮತ್ತೆ ಹೇಳಿ',
    rephrasePrompt: 'ಇನ್ನೂ ಸರಳವಾಗಿ ಹೇಳಿ',
    slowDownPrompt: 'ನಿಧಾನವಾಗಿ ಹೇಳಿ',
    capturedResponse: 'ದಾಖಲಿಸಿದ ಉತ್ತರ',
    submitCapturedResponse: 'ದಾಖಲಿಸಿದ ಉತ್ತರವನ್ನು ಸಲ್ಲಿಸಿ',
    submitResponse: 'ಉತ್ತರವನ್ನು ಸಲ್ಲಿಸಿ',
    clear: 'ಅಳಿಸಿ',
    saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    yes: 'ಹೌದು',
    no: 'ಇಲ್ಲ',
    skip: 'ಬಿಡಿ',
    typeOrDictate: 'ರೋಗಿ ಹೇಳಿದ ನಿಖರ ಉತ್ತರವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿಯಲ್ಲಿ ಹೇಳಿ...',
    speechUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.',
    policyHelper:
      'ಇಲ್ಲಿ ಉಪವಾಸ ಅಥವಾ ಮನೆಗೆ ಹಿಂತಿರುಗುವ ವ್ಯವಸ್ಥೆ ಮುಂತಾದ ಆಸ್ಪತ್ರೆಯ ಸೂಚನೆಗಳ ಬಗ್ಗೆ ಕೂಡ ಕೇಳಬಹುದು. ಸಹಾಯಕನು ಲಭ್ಯವಿರುವ ನೀತಿ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಉತ್ತರಿಸಿ ಮೌಲ್ಯಮಾಪನವನ್ನು ಮುಂದುವರಿಸುತ್ತಾನೆ.',
  },
} as const

const WHY_HELPERS: Record<AppLanguage, Record<string, string>> = {
  en: {
    history_source:
      'This helps me frame the questions correctly and know whether I should ask about you or about the patient.',
    patient_age:
      'Age changes anesthesia planning and helps me understand safety risks before surgery.',
    body_metrics:
      'Weight and height help me calculate BMI and guide anesthesia dose and airway risk checks.',
    preoperative_diagnosis:
      'I ask this so the anesthesia team knows the medical problem the surgery is being done for.',
    proposed_procedure:
      'This tells me what operation is planned, which affects anesthesia preparation.',
    previous_surgery:
      'Past surgery and anesthesia history can reveal problems that matter again today.',
    drug_allergies:
      'Medicine allergies matter because the anesthesia team must avoid unsafe drugs.',
    smoking_history:
      'Smoking can affect breathing, oxygen levels, and recovery after anesthesia.',
    breathlessness:
      'Breathlessness can point to heart or lung strain, which changes anesthesia risk.',
    nyha_class:
      'This helps me understand how much activity causes symptoms so the team can judge heart-related risk.',
    snoring_history:
      'Snoring can be a clue to sleep apnea, which can affect breathing during anesthesia.',
    mmrc_grade:
      'This helps me understand how much breathlessness affects daily life before surgery.',
  },
  ta: {
    history_source:
      'கேள்விகளை சரியாக அமைக்கவும், நான் உங்களைப் பற்றிக் கேட்கிறேனா அல்லது நோயாளியைப் பற்றிக் கேட்கிறேனா என்பதை தெரிந்துகொள்ளவும் இது உதவும்.',
    patient_age:
      'வயது மயக்கத் திட்டத்தை பாதிக்கிறது, மேலும் அறுவை சிகிச்சைக்கு முன் பாதுகாப்பு அபாயங்களை புரிந்துகொள்ள உதவும்.',
    body_metrics:
      'எடை மற்றும் உயரம் BMI-ஐ கணக்கிடவும், மயக்க மருந்தளவு மற்றும் காற்றுப்பாதை அபாயத்தை மதிப்பிடவும் உதவும்.',
    preoperative_diagnosis:
      'அறுவை சிகிச்சை எந்த மருத்துவ பிரச்சினைக்காக செய்யப்படுகிறது என்பதை மயக்கக் குழுவுக்கு தெரிய இதை கேட்கிறேன்.',
    proposed_procedure:
      'எந்த அறுவை சிகிச்சை செய்யப்பட உள்ளது என்பதை இது காட்டும்; அதன்படி மயக்கத் தயாரிப்பு மாறும்.',
    previous_surgery:
      'முன்னைய அறுவை சிகிச்சை அல்லது மயக்க அனுபவம் இன்று மீண்டும் முக்கியமான சிக்கல்களை காட்டலாம்.',
    drug_allergies:
      'மருந்து ஒவ்வாமை இருந்தால் பாதுகாப்பற்ற மருந்துகளை தவிர்க்க மயக்கக் குழுவுக்கு தெரிந்திருக்க வேண்டும்.',
    smoking_history:
      'புகைத்தல் சுவாசம், ஆக்சிஜன் நிலை, மற்றும் மயக்கத்திற்குப் பிறகான மீட்பை பாதிக்கலாம்.',
    breathlessness:
      'மூச்சுத்திணறல் இதயம் அல்லது நுரையீரல் சிரமத்தை காட்டலாம்; அது மயக்க அபாயத்தை மாற்றும்.',
    nyha_class:
      'எவ்வளவு செயல்பாட்டில் அறிகுறிகள் வருகிறது என்பதை இது காட்டும்; அதனால் இதய அபாயத்தை மதிப்பிட முடியும்.',
    snoring_history:
      'குறட்டை தூக்கத்தில் சுவாச தடை இருப்பதற்கான அறிகுறியாக இருக்கலாம்; அது மயக்கத்தின் போது முக்கியம்.',
    mmrc_grade:
      'மூச்சுத்திணறல் தினசரி வாழ்க்கையை எவ்வளவு பாதிக்கிறது என்பதை இது புரிந்துகொள்ள உதவும்.',
  },
  hi: {
    history_source:
      'इससे मैं प्रश्न सही तरीके से पूछ पाती हूँ और समझ पाती हूँ कि मुझे आपसे पूछना है या मरीज के बारे में पूछना है।',
    patient_age:
      'उम्र एनेस्थीसिया की योजना बदल सकती है और सर्जरी से पहले सुरक्षा जोखिम समझने में मदद करती है।',
    body_metrics:
      'वजन और लंबाई से BMI निकलता है, और इससे दवा की योजना तथा एयरवे जोखिम समझने में मदद मिलती है।',
    preoperative_diagnosis:
      'मैं यह इसलिए पूछती हूँ ताकि एनेस्थीसिया टीम को पता रहे कि सर्जरी किस समस्या के लिए हो रही है।',
    proposed_procedure:
      'इससे पता चलता है कि कौन-सी सर्जरी होने वाली है, और उसी के अनुसार तैयारी बदलती है।',
    previous_surgery:
      'पुरानी सर्जरी या एनेस्थीसिया का अनुभव आज के लिए भी महत्वपूर्ण संकेत दे सकता है।',
    drug_allergies:
      'दवा से एलर्जी जानना जरूरी है ताकि एनेस्थीसिया टीम असुरक्षित दवाओं से बचे।',
    smoking_history:
      'धूम्रपान सांस, ऑक्सीजन स्तर और एनेस्थीसिया के बाद रिकवरी को प्रभावित कर सकता है।',
    breathlessness:
      'सांस फूलना दिल या फेफड़ों पर असर का संकेत हो सकता है, जिससे एनेस्थीसिया जोखिम बदलता है।',
    nyha_class:
      'इससे पता चलता है कि कितनी गतिविधि पर लक्षण आते हैं, ताकि दिल से जुड़े जोखिम का अंदाज़ा लगाया जा सके।',
    snoring_history:
      'खर्राटे स्लीप एपनिया का संकेत हो सकते हैं, जो एनेस्थीसिया के दौरान सांस पर असर डाल सकता है।',
    mmrc_grade:
      'इससे समझने में मदद मिलती है कि सांस फूलना रोज़मर्रा की ज़िंदगी को कितना प्रभावित करता है।',
  },
  te: {
    history_source:
      'దీనివల్ల నేను ప్రశ్నలను సరిగా అడగగలను, అలాగే నేను మీ గురించి అడుగుతున్నానా లేక రోగి గురించి అడుగుతున్నానా అనేది తెలుస్తుంది.',
    patient_age:
      'వయస్సు మత్తు ప్రణాళికను ప్రభావితం చేస్తుంది మరియు శస్త్రచికిత్సకు ముందు భద్రతా ప్రమాదాలను అర్థం చేసుకోవడానికి సహాయపడుతుంది.',
    body_metrics:
      'బరువు మరియు ఎత్తు BMI లెక్కించడానికి, అలాగే మత్తు మోతాదు మరియు ఎయిర్‌వే ప్రమాదాన్ని అంచనా వేయడానికి ఉపయోగపడతాయి.',
    preoperative_diagnosis:
      'శస్త్రచికిత్స ఏ ఆరోగ్య సమస్య కోసం జరుగుతోందో అనస్థీషియా బృందానికి తెలియడానికి ఈ ప్రశ్న అడుగుతున్నాను.',
    proposed_procedure:
      'ఏ శస్త్రచికిత్స లేదా చికిత్స చేయబోతున్నారు అనేది ఇది తెలియజేస్తుంది; దాని ఆధారంగా సిద్ధత మారుతుంది.',
    previous_surgery:
      'మునుపటి శస్త్రచికిత్స లేదా మత్తు అనుభవం ఈరోజు కూడా ముఖ్యమైన విషయాలను తెలియజేయవచ్చు.',
    drug_allergies:
      'మందులకు అలర్జీ ఉంటే అనస్థీషియా బృందం సురక్షితం కాని మందులను తప్పించుకోవచ్చు.',
    smoking_history:
      'పొగ త్రాగడం శ్వాస, ఆక్సిజన్ స్థాయి మరియు మత్తు తర్వాత కోలుకోవడంపై ప్రభావం చూపవచ్చు.',
    breathlessness:
      'శ్వాస తీసుకోవడంలో ఇబ్బంది గుండె లేదా ఊపిరితిత్తుల ఒత్తిడిని సూచించవచ్చు; ఇది మత్తు ప్రమాదాన్ని మార్చవచ్చు.',
    nyha_class:
      'ఎంత శారీరక శ్రమతో లక్షణాలు వస్తున్నాయో అర్థం చేసుకోవడానికి ఇది సహాయపడుతుంది.',
    snoring_history:
      'గురక నిద్రలో శ్వాస ఆగిపోవడం వంటి సమస్యలకు సంకేతం కావచ్చు; ఇది మత్తు సమయంలో ముఖ్యం.',
    mmrc_grade:
      'శ్వాస తీసుకోవడంలో ఇబ్బంది మీ రోజువారీ జీవితాన్ని ఎంతవరకు ప్రభావితం చేస్తుందో అర్థం చేసుకోవడానికి ఇది సహాయపడుతుంది.',
  },
  ml: {
    history_source:
      'ഇതിലൂടെ ഞാൻ ചോദ്യങ്ങൾ ശരിയായി ചോദിക്കാനും, നിങ്ങളെക്കുറിച്ചാണോ രോഗിയെക്കുറിച്ചാണോ ചോദിക്കേണ്ടത് എന്ന് മനസ്സിലാക്കാനും കഴിയും.',
    patient_age:
      'പ്രായം അനസ്തീഷ്യാ പദ്ധതി മാറ്റാം, ശസ്ത്രക്രിയക്ക് മുമ്പുള്ള സുരക്ഷാ അപകടങ്ങൾ മനസ്സിലാക്കാനും ഇത് സഹായിക്കും.',
    body_metrics:
      'ഭാരംയും ഉയരവും BMI കണക്കാക്കാനും, മരുന്ന് അളവും എയർവേ അപകടസാധ്യതയും മനസ്സിലാക്കാനും സഹായിക്കും.',
    preoperative_diagnosis:
      'ശസ്ത്രക്രിയ ഏത് ആരോഗ്യപ്രശ്നത്തിനാണ് നടത്തുന്നത് എന്ന് അനസ്തീഷ്യാ ടീമിന് അറിയാൻ ഞാൻ ഇത് ചോദിക്കുന്നു.',
    proposed_procedure:
      'ഏത് ശസ്ത്രക്രിയ അല്ലെങ്കിൽ ചികിത്സയാണ് ആസൂത്രണം ചെയ്തിരിക്കുന്നത് എന്ന് ഇത് വ്യക്തമാക്കുന്നു; അതനുസരിച്ച് തയ്യാറെടുപ്പ് മാറും.',
    previous_surgery:
      'മുമ്പത്തെ ശസ്ത്രക്രിയയോ അനസ്തീഷ്യ അനുഭവമോ ഇന്ന് പോലും പ്രധാന വിവരങ്ങൾ നൽകാം.',
    drug_allergies:
      'മരുന്ന് അലർജി ഉണ്ടെങ്കിൽ സുരക്ഷിതമല്ലാത്ത മരുന്നുകൾ ഒഴിവാക്കാൻ അനസ്തീഷ്യാ ടീമിന് സഹായിക്കും.',
    smoking_history:
      'പുകവലി ശ്വാസം, ഓക്സിജൻ നില, അനസ്തീഷ്യക്ക് ശേഷമുള്ള വീണ്ടെടുപ്പ് എന്നിവയെ ബാധിക്കാം.',
    breathlessness:
      'ശ്വാസംമുട്ടൽ ഹൃദയത്തിലോ ശ്വാസകോശത്തിലോ സമ്മർദ്ദം കാണിക്കാം; അതോടെ അനസ്തീഷ്യാ അപകടസാധ്യത മാറാം.',
    nyha_class:
      'എത്ര പ്രവർത്തനത്തിൽ ലക്ഷണങ്ങൾ വരുന്നു എന്ന് മനസ്സിലാക്കാൻ ഇത് സഹായിക്കും.',
    snoring_history:
      'കുരുൾ സ്ലീപ് അപ്നിയയുടെ സൂചനയായിരിക്കാം; അത് അനസ്തീഷ്യ സമയത്ത് പ്രധാനമാണ്.',
    mmrc_grade:
      'ശ്വാസംമുട്ടൽ ദിവസേന ജീവിതത്തെ എത്രമാത്രം ബാധിക്കുന്നു എന്ന് മനസ്സിലാക്കാൻ ഇത് സഹായിക്കുന്നു.',
  },
  kn: {
    history_source:
      'ಇದರಿಂದ ನಾನು ಪ್ರಶ್ನೆಗಳನ್ನು ಸರಿಯಾಗಿ ಕೇಳಬಹುದು, ಹಾಗೆಯೇ ನಿಮ್ಮ ಬಗ್ಗೆ ಕೇಳಬೇಕೆ ಅಥವಾ ರೋಗಿಯ ಬಗ್ಗೆ ಕೇಳಬೇಕೆ ಎಂಬುದು ತಿಳಿಯುತ್ತದೆ.',
    patient_age:
      'ವಯಸ್ಸು ಅನಸ್ಥೇಶಿಯಾ ಯೋಜನೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು ಮತ್ತು ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗೆ ಮೊದಲು ಸುರಕ್ಷತಾ ಅಪಾಯಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    body_metrics:
      'ತೂಕ ಮತ್ತು ಎತ್ತರ BMI ಲೆಕ್ಕಿಸಲು, ಹಾಗೆಯೇ ಔಷಧದ ಪ್ರಮಾಣ ಮತ್ತು ಏರ್‌ವೇ ಅಪಾಯವನ್ನು ಅಂದಾಜಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    preoperative_diagnosis:
      'ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಾಗಿ ಮಾಡಲಾಗುತ್ತಿದೆ ಎಂಬುದು ಅನಸ್ಥೇಶಿಯಾ ತಂಡಕ್ಕೆ ತಿಳಿಯಲು ನಾನು ಇದನ್ನು ಕೇಳುತ್ತೇನೆ.',
    proposed_procedure:
      'ಯಾವ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಅಥವಾ ಚಿಕಿತ್ಸೆಯನ್ನು ಮಾಡಲು ಹೋಗಿದ್ದಾರೆ ಎಂಬುದು ಇದರಿಂದ ತಿಳಿಯುತ್ತದೆ; ಅದರಂತೆ ಸಿದ್ಧತೆ ಬದಲಾಗುತ್ತದೆ.',
    previous_surgery:
      'ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಅಥವಾ ಅನಸ್ಥೇಶಿಯಾ ಅನುಭವವು ಇಂದಿಗೂ ಮುಖ್ಯ ಮಾಹಿತಿಯನ್ನು ನೀಡಬಹುದು.',
    drug_allergies:
      'ಔಷಧ ಅಲರ್ಜಿ ಇದ್ದರೆ ಸುರಕ್ಷಿತವಲ್ಲದ ಔಷಧಿಗಳನ್ನು ತಪ್ಪಿಸಲು ಅನಸ್ಥೇಶಿಯಾ ತಂಡಕ್ಕೆ ಸಹಾಯವಾಗುತ್ತದೆ.',
    smoking_history:
      'ಧೂಮಪಾನವು ಉಸಿರಾಟ, ಆಮ್ಲಜನಕ ಮಟ್ಟ ಮತ್ತು ಅನಸ್ಥೇಶಿಯಾದ ನಂತರದ ಚೇತರಿಕೆಯನ್ನು ಪರಿಣಾಮಗೊಳಿಸಬಹುದು.',
    breathlessness:
      'ಉಸಿರಾಟದ ತೊಂದರೆ ಹೃದಯ ಅಥವಾ ಶ್ವಾಸಕೋಶದ ಒತ್ತಡವನ್ನು ಸೂಚಿಸಬಹುದು; ಇದರಿಂದ ಅನಸ್ಥೇಶಿಯಾ ಅಪಾಯ ಬದಲಾಗಬಹುದು.',
    nyha_class:
      'ಎಷ್ಟು ಚಟುವಟಿಕೆಯಲ್ಲಿ ಲಕ್ಷಣಗಳು ಕಾಣಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    snoring_history:
      'ಗುರಗುಟ್ಟುವುದು ಸ್ಲೀಪ್ ಅಪ್ನಿಯಾದ ಸೂಚನೆಯಾಗಿರಬಹುದು; ಇದು ಅನಸ್ಥೇಶಿಯಾ ಸಮಯದಲ್ಲಿ ಮುಖ್ಯವಾಗಿರುತ್ತದೆ.',
    mmrc_grade:
      'ಉಸಿರಾಟದ ತೊಂದರೆ ದೈನಂದಿನ ಜೀವನವನ್ನು ಎಷ್ಟು ಪರಿಣಾಮಗೊಳಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
  },
}

const BASE_TRANSLATIONS: Record<'ta' | 'hi', Record<string, string>> = {
  ta: {
    'Hello! I am Valli. You may use text or voice for taking the assessment.':
      'வணக்கம்! இந்த மதிப்பீட்டை வழிநடத்தும் மருத்துவர் நான். நீங்கள் உரை அல்லது குரலை பயன்படுத்தலாம்.',
    'Hello! I am the doctor guiding this assessment. You may use text or voice for taking the assessment.':
      'வணக்கம்! இந்த மதிப்பீட்டை வழிநடத்தும் மருத்துவர் நான். நீங்கள் உரை அல்லது குரலை பயன்படுத்தலாம்.',
    'Got it, thank you.': 'சரி, நன்றி.',
    'Doctor': 'மருத்துவர்',
    "The doctor's spoken voice is AI-generated.":
      'மருத்துவரின் குரல் செயற்கை நுண்ணறிவால் உருவாக்கப்படுகிறது.',
    "I'll say that again.": 'அதை மீண்டும் சொல்கிறேன்.',
    'Let me say that more simply.': 'அதை இன்னும் எளிமையாகச் சொல்கிறேன்.',
    "Sure, I'll slow down.": 'சரி, நான் மெதுவாகச் சொல்கிறேன்.',
    'Please answer yes or no.': 'தயவுசெய்து ஆம் அல்லது இல்லை என்று பதிலளிக்கவும்.',
    'Please choose the option that fits best.': 'உங்களுக்கு பொருத்தமான தேர்வைத் தேர்ந்தெடுக்கவும்.',
    'Your options are:': 'உங்கள் தேர்வுகள்:',
    "I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'நான் உங்கள் முன்-மயக்க மதிப்பீட்டுக்கு உதவுகிறேன், அதனால் இப்போது இதிலேயே கவனம் செலுத்தலாம். தற்போதைய கேள்விக்கு பதிலளிக்கவும், அல்லது அறுவை சிகிச்சை வழிமுறைகள் பற்றி கேட்கலாம்.',
    "I've recorded your answer. I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'உங்கள் பதிலை பதிவு செய்துவிட்டேன். நான் உங்கள் முன்-மயக்க மதிப்பீட்டுக்கு உதவுகிறேன், அதனால் இப்போது இதிலேயே கவனம் செலுத்தலாம். தற்போதைய கேள்விக்கு பதிலளிக்கவும், அல்லது அறுவை சிகிச்சை வழிமுறைகள் பற்றி கேட்கலாம்.',
    'What is your phone number?': 'உங்கள் தொலைபேசி எண் என்ன?',
    "What's the patient's phone number?": 'நோயாளியின் தொலைபேசி எண் என்ன?',
    'For this demo, use a registered 10-digit phone number.': 'இந்த டெமோவிற்காக பதிவு செய்யப்பட்ட 10 இலக்க தொலைபேசி எண்ணைப் பயன்படுத்துங்கள்.',
    "I found the patient's basic details from that phone number and filled them in.": 'அந்த தொலைபேசி எண்ணின் மூலம் நோயாளியின் அடிப்படை விவரங்களை கண்டுபிடித்து நிரப்பிவிட்டேன்.',
    "You're not an existing patient in the demo directory. Please enter a registered 10-digit number.": 'நீங்கள் டெமோ நோயாளர் பட்டியலில் உள்ள நோயாளி அல்ல. தயவுசெய்து பதிவு செய்யப்பட்ட 10 இலக்க எண்ணை உள்ளிடுங்கள்.',
    'Thanks. I just need a registered 10-digit phone number, for example 9876501234.': 'நன்றி. பதிவு செய்யப்பட்ட 10 இலக்க தொலைபேசி எண் மட்டும் வேண்டும், உதாரணம் 9876501234.',
    'What is your name?': 'உங்கள் பெயர் என்ன?',
    'What is your age?': 'உங்கள் வயது என்ன?',
    'For example, 42': 'உதாரணம்: 42',
    "What's your gender?": 'உங்கள் பாலினம் என்ன?',
    'Male': 'ஆண்',
    'Female': 'பெண்',
    'Other': 'மற்றவை',
    'What is your UHID number?': 'உங்கள் UHID எண் என்ன?',
    'What is your IP number?': 'உங்கள் IP எண் என்ன?',
    'You can skip this if you do not have it.': 'இது இல்லையெனில் தவிர்க்கலாம்.',
    'Please tell me both your weight in kilograms and your height in centimeters.':
      'உங்கள் எடையை கிலோகிராமிலும் உயரத்தை சென்டிமீட்டரிலும் சொல்லுங்கள்.',
    'For example: 68 kg and 162 cm.': 'உதாரணம்: 68 கிலோ மற்றும் 162 செ.மீ.',
    'What health problem are you being treated for?':
      'எந்த உடல்நலப் பிரச்சினைக்காக நீங்கள் சிகிச்சை பெறுகிறீர்கள்?',
    'What surgery or treatment are you going to have?':
      'நீங்கள் எந்த அறுவை சிகிச்சை அல்லது சிகிச்சையை பெறப் போகிறீர்கள்?',
    'Who is taking the assessment?': 'மதிப்பீட்டை யார் செய்கிறார்கள்?',
    'History taken from:': 'வரலாறு எவரிடமிருந்து பெறப்படுகிறது?',
    'Patient': 'நோயாளர்',
    'Relative/Guardian': 'உறவினர் / பாதுகாவலர்',
    'Medical Records': 'மருத்துவ பதிவுகள்',
    'Pre-Anesthetic Assessment': 'முன்-மயக்க மதிப்பீடு',
    'AI assisted pre operative assessment.':
      'செயற்கை நுண்ணறிவு உதவியுடன் முன் அறுவை சிகிச்சை மதிப்பீடு.',
    'Conduct the patient interview, complete the camera-based airway examination, and generate the final assessment report from one streamlined workflow.':
      'நோயாளர் நேர்காணலை முடித்து, கேமரா அடிப்படையிலான காற்றுப்பாதை பரிசோதனையை செய்து, ஒரே நடைமுறையில் இறுதி அறிக்கையை உருவாக்குங்கள்.',
    'Interview': 'நேர்காணல்',
    'Guided patient intake': 'வழிகாட்டப்பட்ட நோயாளர் பதிவு',
    'Collect the full pre-anesthetic history with text or voice input.':
      'உரை அல்லது குரல் மூலம் முழு முன்-மயக்க வரலாற்றையும் பதிவு செய்யுங்கள்.',
    'Camera': 'கேமரா',
    'Airway examination': 'காற்றுப்பாதை பரிசோதனை',
    'Capture the frontal and side-profile views after the questionnaire is complete.':
      'கேள்வித்தாள் முடிந்த பிறகு முன்புறமும் பக்கவாட்டும் கொண்ட படங்களை பதிவு செய்யுங்கள்.',
    'Report': 'அறிக்கை',
    'Printable final summary': 'அச்சிடக்கூடிய இறுதி சுருக்கம்',
    'Review the transcript, camera findings, and final report in one place.':
      'உரையாடல் பதிவு, கேமரா கண்டறிதல்கள், இறுதி அறிக்கை ஆகியவற்றை ஒரே இடத்தில் பாருங்கள்.',
    'Workflow': 'நடவடிக்கை ஓட்டம்',
    'Move from intake to camera examination to final report.':
      'நோயாளர் பதிவு முதல் கேமரா பரிசோதனை, அங்கிருந்து இறுதி அறிக்கை வரை செல்லுங்கள்.',
    'Assessment': 'மதிப்பீடு',
    'Patient questionnaire': 'நோயாளர் கேள்வித்தாள்',
    'Answer the interview questions in sequence and capture the full transcript.':
      'கேள்விகளுக்கு வரிசையாக பதிலளித்து முழு உரையாடல் பதிவையும் சேமிக்கவும்.',
    'Dedicated airway page': 'தனிப்பட்ட காற்றுப்பாதை பக்கம்',
    'Switch to the camera page after the questionnaire for the image-based examination.':
      'கேள்வித்தாளுக்குப் பிறகு பட அடிப்படையிலான பரிசோதனைக்காக கேமரா பக்கத்துக்கு செல்லுங்கள்.',
    'Separated findings': 'பிரித்துக் காட்டப்படும் முடிவுகள்',
    'Review the transcript and camera findings separately in the final report.':
      'இறுதி அறிக்கையில் உரையாடல் பதிவு மற்றும் கேமரா முடிவுகளை தனித்தனியாக பாருங்கள்.',
    'Records': 'பதிவுகள்',
    'Completed assessments only': 'முடிந்த மதிப்பீடுகள் மட்டும்',
    'Open previously completed reports from the records page.':
      'முந்தைய முடிக்கப்பட்ட அறிக்கைகளை பதிவுகள் பக்கத்தில் திறக்கலாம்.',
    'Start the interview and complete the patient questionnaire.':
      'நேர்காணலை தொடங்கி நோயாளர் கேள்வித்தாளை முடிக்கவும்.',
    'Move to the separate camera page for the airway examination.':
      'காற்றுப்பாதை பரிசோதனைக்காக தனி கேமரா பக்கத்துக்கு செல்லுங்கள்.',
    'Generate and print the final transcript and report after completion.':
      'முடிவில் இறுதி உரையாடல் பதிவு மற்றும் அறிக்கையை உருவாக்கி அச்சிடுங்கள்.',
    'Do you have any history of previous surgeries in the past?': 'முன்பு ஏதேனும் அறுவை சிகிச்சை செய்ததா?',
    'Could you please mention when it was done?': 'அது எப்போது செய்யப்பட்டது என்று சொல்ல முடியுமா?',
    'Could you please mention the month and year when it was done?': 'அது எந்த மாதம் மற்றும் எந்த ஆண்டில் செய்யப்பட்டது என்று சொல்ல முடியுமா?',
    'For example: March 2020.': 'உதாரணம்: மார்ச் 2020.',
    'Could you please mention the year?': 'எந்த ஆண்டில் செய்யப்பட்டது?',
    'Could you please mention the month?': 'எந்த மாதத்தில் செய்யப்பட்டது?',
    'Do you remember the type of anaesthesia used for the procedure?': 'அப்போது பயன்படுத்திய மயக்க மருந்து வகை நினைவிருக்கிறதா?',
    'GA': 'பொது மயக்கம்',
    'Spinal': 'முதுகுத்தண்டு மயக்கம்',
    'Regional Block': 'பகுதி நரம்பு தடுப்பு',
    'Do not remember': 'நினைவில்லை',
    'Were you admitted in ICU after the procedure?': 'அறுவை சிகிச்சைக்குப் பிறகு ICU-வில் அனுமதிக்கப்பட்டீர்களா?',
    'Do you remember the reason why you were admitted in the ICU?': 'ICU-வில் ஏன் அனுமதிக்கப்பட்டீர்கள் என்பது நினைவிருக்கிறதா?',
    'Could you mention the number of days you were in the ICU?': 'ICU-வில் எத்தனை நாட்கள் இருந்தீர்கள்?',
    'Were you on a ventilator?': 'வெண்டிலேட்டரில் வைத்தார்களா?',
    'If yes, for how many days?': 'ஆம் என்றால், எத்தனை நாட்கள்?',
    'Was O2 therapy taken?': 'ஆக்சிஜன் சிகிச்சை அளிக்கப்பட்டதா?',
    'Do you have diabetes?': 'உங்களுக்கு சர்க்கரை நோய் உள்ளதா?',
    'Do you have high BP (blood pressure)?': 'உங்களுக்கு உயர் இரத்த அழுத்தம் உள்ளதா?',
    'Do you have a thyroid disorder?': 'உங்களுக்கு தைராய்டு கோளாறு உள்ளதா?',
    'Do you have asthma?': 'உங்களுக்கு ஆஸ்துமா உள்ளதா?',
    'Do you have seizures?': 'உங்களுக்கு fits / fits history உள்ளதா?',
    'Do you have heart disease?': 'உங்களுக்கு இதய நோய் உள்ளதா?',
    'Do you have kidney disease?': 'உங்களுக்கு சிறுநீரக நோய் உள்ளதா?',
    'Do you have liver disease?': 'உங்களுக்கு கல்லீரல் நோய் உள்ளதா?',
    'Do you have a history of stroke?': 'உங்களுக்கு stroke வரலாறு உள்ளதா?',
    'Do you have any bleeding disorders?': 'உங்களுக்கு இரத்தப்போக்கு கோளாறு ஏதேனும் உள்ளதா?',
    'If yes, for how many years?': 'ஆம் என்றால், எத்தனை ஆண்டுகளாக உள்ளது?',
    'Are you currently taking any medicines for this?': 'இதற்காக தற்போது மருந்துகள் எடுத்து வருகிறீர்களா?',
    'Could you please mention the medicines you are taking for this illness?':
      'இந்த நோய்க்காக எடுத்து வரும் மருந்துகளைச் சொல்லுங்கள்.',
    'Could you please mention the dose or frequency of the inhaler?': 'இன்ஹேலர் அளவு அல்லது எத்தனை முறை பயன்படுத்துகிறீர்கள் என்பதைச் சொல்லுங்கள்.',
    'When was the last episode?': 'கடைசியாக இது எப்போது ஏற்பட்டது?',
    'Have you had any procedure with stenting done?': 'ஸ்டெண்ட் வைத்த சிகிச்சை ஏதேனும் செய்திருக்கிறீர்களா?',
    'Do you have any implants or pacemakers?': 'உங்களிடம் implant அல்லது pacemaker ஏதேனும் உள்ளதா?',
    'Are you on dialysis?': 'நீங்கள் டயாலிசிஸ் செய்து வருகிறீர்களா?',
    'How many cycles of dialysis has been done?': 'எத்தனை முறை டயாலிசிஸ் செய்யப்பட்டது?',
    'Could you mention any more details about your health problems?': 'உங்கள் உடல்நலப் பிரச்சினைகள் பற்றி இன்னும் ஏதேனும் சொல்ல விரும்புகிறீர்களா?',
    'Do you have any drug allergies?': 'உங்களுக்கு மருந்து ஒவ்வாமை ஏதேனும் உள்ளதா?',
    'Which drug are you allergic to?': 'எந்த மருந்திற்கு ஒவ்வாமை உள்ளது?',
    'Could you please mention any relevant family history of illness?': 'குடும்பத்தில் தொடர்புடைய நோய் வரலாறு ஏதேனும் உள்ளதா?',
    'Could you specify more relating to the condition?': 'அந்த நிலைமை பற்றி மேலும் விளக்க முடியுமா?',
    'Do you have a history of smoking?': 'புகைப்பிடிக்கும் பழக்கம் உள்ளதா?',
    'Could you mention the number of years of this habit, packs per day and the last puff?':
      'இந்த பழக்கம் எத்தனை ஆண்டுகளாக உள்ளது, ஒரு நாளில் எத்தனை pack, கடைசியாக எப்போது புகைத்தீர்கள் என்பதை சொல்லுங்கள்.',
    'Do you have a history of alcohol consumption?': 'மது அருந்தும் பழக்கம் உள்ளதா?',
    'Could you please mention the number of years of this habit and the last drink?':
      'இந்த பழக்கம் எத்தனை ஆண்டுகளாக உள்ளது மற்றும் கடைசியாக எப்போது குடித்தீர்கள் என்பதை சொல்லுங்கள்.',
    'Do you have any history of irregular heart beats?': 'இதய துடிப்பு ஒழுங்கில்லாத வரலாறு உள்ளதா?',
    'Could you please mention more details about the irregular heart beats?': 'ஒழுங்கில்லாத இதய துடிப்பு பற்றி மேலும் சொல்ல முடியுமா?',
    'Do you have any history of breathlessness?': 'உங்களுக்கு மூச்சுத்திணறல் வரலாறு உள்ளதா?',
    'Do you have any history of chest pain?': 'உங்களுக்கு நெஞ்சுவலி வரலாறு உள்ளதா?',
    'NYHA classification': 'NYHA வகைப்பாடு',
    'Class 1: Ordinary activity does not cause unusual tiredness, irregular heart beats, or shortness of breath.':
      'வகுப்பு 1: சாதாரண வேலைகள் சோர்வு, ஒழுங்கற்ற இதய துடிப்பு அல்லது மூச்சுத்திணறலை ஏற்படுத்தாது.',
    'Class 2: You are comfortable at rest, but ordinary activity such as walking up two flights of stairs causes tiredness, irregular heart beats, or shortness of breath.':
      'வகுப்பு 2: ஓய்வில் சிரமமில்லை. ஆனால் இரண்டு மாடி படிக்கட்டுகள் ஏறுவது போன்ற சாதாரண செயல்களில் சோர்வு, ஒழுங்கற்ற இதய துடிப்பு அல்லது மூச்சுத்திணறல் ஏற்படும்.',
    'Class 3: You are comfortable at rest, but less than ordinary activity such as walking one block or showering causes tiredness, irregular heart beats, or shortness of breath.':
      'வகுப்பு 3: ஓய்வில் சிரமமில்லை. ஆனால் சிறிய வேலைகளில்கூட சோர்வு, ஒழுங்கற்ற இதய துடிப்பு அல்லது மூச்சுத்திணறல் ஏற்படும்.',
    'Class 4: You have tiredness, irregular heart beats, or shortness of breath even at rest.':
      'வகுப்பு 4: ஓய்விலிருந்தாலும் சோர்வு, ஒழுங்கற்ற இதய துடிப்பு அல்லது மூச்சுத்திணறல் இருக்கும்.',
    'Do you have history of snoring?': 'உங்களுக்கு குறட்டை விடும் வரலாறு உள்ளதா?',
    'Making noises while sleeping?': 'தூங்கும்போது சத்தம் போடுகிறீர்களா?',
    'Do you snore loudly?': 'உங்கள் குறட்டை சத்தமாக இருக்கிறதா?',
    'Do you feel tired during the day?': 'பகலில் சோர்வாக உணருகிறீர்களா?',
    'Has anyone seen you stop breathing or gasp during sleep?': 'தூக்கத்தில் மூச்சு நின்றது அல்லது மூச்சை பற்றிக் கொண்டது யாராவது கவனித்திருக்கிறார்களா?',
    'Are you being treated for high blood pressure?': 'உயர் இரத்த அழுத்தத்திற்காக சிகிச்சை எடுத்து வருகிறீர்களா?',
    'Did you have any history of fever in the recent past?': 'சமீபத்தில் காய்ச்சல் இருந்ததா?',
    'How many days?': 'எத்தனை நாட்கள்?',
    'What medications did you take for it?': 'அதற்காக என்ன மருந்துகள் எடுத்தீர்கள்?',
    'Did you have a history of cough with or without discharge in the recent past?': 'சமீபத்தில் சளியுடன் அல்லது இல்லாமல் இருமல் இருந்ததா?',
    'Was the discharge discoloured?': 'வெளியேறிய சளியின் நிறம் மாறியிருந்ததா?',
    'Did you have a history of wheezing?': 'உங்களுக்கு வீசிங் வரலாறு உள்ளதா?',
    'Did you take any medications for it?': 'அதற்காக மருந்துகள் எடுத்தீர்களா?',
    'Modified Medical Research Council (MMRC) dyspnoea scale': 'MMRC மூச்சுத்திணறல் அளவுகோல்',
    'Grade 0: I feel breathless only with hard exercise.': 'தரம் 0: கடினமான உடற்பயிற்சியில் மட்டுமே மூச்சுத்திணறல் இருக்கும்.',
    'Grade 1: I feel short of breath when hurrying on level ground or walking up a slight hill.':
      'தரம் 1: சம நிலத்தில் வேகமாக நடந்தாலும் அல்லது சிறிய ஏற்றத்தில் நடந்தாலும் மூச்சுத்திணறல் இருக்கும்.',
    'Grade 2: I walk slower than people of my age on level ground because of breathlessness.':
      'தரம் 2: மூச்சுத்திணறலால் சம நிலத்தில் என் வயதினரைவிட மெதுவாக நடப்பேன்.',
    'Grade 3: I stop for breath after walking about 100 metres or after a few minutes on level ground.':
      'தரம் 3: சுமார் 100 மீட்டர் நடந்ததும் அல்லது சில நிமிடங்கள் நடந்ததும் மூச்சு விட நிற்க வேண்டி வரும்.',
    'Grade 4: I am too breathless to leave the house or I get breathless while dressing.':
      'தரம் 4: வீட்டை விட்டு வெளியே போக முடியாத அளவுக்கு அல்லது உடை அணியும் போதே மூச்சுத்திணறல் இருக்கும்.',
    'Is there any medical or personal information you would like your anesthetist to be aware of?': 'மயக்க மருத்துவர் தெரிந்துகொள்ள வேண்டிய மருத்துவ அல்லது தனிப்பட்ட தகவல் ஏதேனும் உள்ளதா?',
    'The questionnaire is complete. Please continue to the camera airway assessment page using a frontal view and a side profile to finish the assessment.':
      'கேள்வித்தாள் முடிந்தது. மதிப்பீட்டை முடிக்க முன்புறமும் பக்கவாட்டு முகப்பும் கொண்டு கேமரா காற்றுப்பாதை மதிப்பீட்டு பக்கத்துக்கு செல்லவும்.',
    'Please capture the remaining required airway view to finish the examination.':
      'மதிப்பீட்டை முடிக்க இன்னும் தேவையான கேமரா கோணத்தை பதிவு செய்யவும்.',
    'The camera-based examination is complete. Your final transcript and report are now ready.':
      'கேமரா அடிப்படையிலான பரிசோதனை முடிந்தது. உங்கள் இறுதி உரையாடல் பதிவு மற்றும் அறிக்கை தயாராக உள்ளன.',
    'Frontal view camera assessment was recorded. Detailed measurements are available in the final report.':
      'முன்புற கேமரா பதிவு செய்யப்பட்டது. விரிவான அளவீடுகள் இறுதி அறிக்கையில் கிடைக்கும்.',
    'Side-profile view camera assessment was recorded. Detailed measurements are available in the final report.':
      'பக்கவாட்டு கேமரா பதிவு செய்யப்பட்டது. விரிவான அளவீடுகள் இறுதி அறிக்கையில் கிடைக்கும்.',
  },
  hi: {
    'Hello! I am Valli. You may use text or voice for taking the assessment.':
      'नमस्ते! मैं इस आकलन का मार्गदर्शन करने वाला डॉक्टर हूँ। आप टेक्स्ट या आवाज़ का उपयोग कर सकते हैं।',
    'Hello! I am the doctor guiding this assessment. You may use text or voice for taking the assessment.':
      'नमस्ते! मैं इस आकलन का मार्गदर्शन करने वाला डॉक्टर हूँ। आप टेक्स्ट या आवाज़ का उपयोग कर सकते हैं।',
    'Got it, thank you.': 'ठीक है, धन्यवाद।',
    'Doctor': 'डॉक्टर',
    "The doctor's spoken voice is AI-generated.":
      'डॉक्टर की बोली जाने वाली आवाज़ एआई से बनाई गई है।',
    "I'll say that again.": 'मैं इसे फिर से कहती हूँ।',
    'Let me say that more simply.': 'मैं इसे थोड़ा आसान करके कहती हूँ।',
    "Sure, I'll slow down.": 'ठीक है, मैं धीरे बोलती हूँ।',
    'Please answer yes or no.': 'कृपया हाँ या नहीं में उत्तर दें।',
    'Please choose the option that fits best.': 'कृपया जो विकल्प सबसे सही लगे, उसे चुनें।',
    'Your options are:': 'आपके विकल्प हैं:',
    "I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'मैं आपके प्री-एनेस्थेटिक आकलन में मदद करने के लिए हूँ, इसलिए अभी इसी पर ध्यान रखें। कृपया वर्तमान प्रश्न का उत्तर दें, या जरूरत हो तो सर्जरी निर्देशों के बारे में पूछें।',
    "I've recorded your answer. I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'मैंने आपका उत्तर रिकॉर्ड कर लिया है। मैं आपके प्री-एनेस्थेटिक आकलन में मदद करने के लिए हूँ, इसलिए अभी इसी पर ध्यान रखें। कृपया वर्तमान प्रश्न का उत्तर दें, या जरूरत हो तो सर्जरी निर्देशों के बारे में पूछें।',
    'What is your phone number?': 'आपका फोन नंबर क्या है?',
    "What's the patient's phone number?": 'मरीज का फोन नंबर क्या है?',
    'For this demo, use a registered 10-digit phone number.': 'इस डेमो के लिए पंजीकृत 10 अंकों वाला फोन नंबर इस्तेमाल करें।',
    "I found the patient's basic details from that phone number and filled them in.": 'मैंने उस फोन नंबर से मरीज की बुनियादी जानकारी ढूंढकर भर दी है।',
    "You're not an existing patient in the demo directory. Please enter a registered 10-digit number.": 'आप डेमो मरीज निर्देशिका में मौजूद मरीज नहीं हैं। कृपया पंजीकृत 10 अंकों वाला नंबर दर्ज करें।',
    'Thanks. I just need a registered 10-digit phone number, for example 9876501234.': 'धन्यवाद। मुझे केवल पंजीकृत 10 अंकों वाला फोन नंबर चाहिए, जैसे 9876501234।',
    'What is your name?': 'आपका नाम क्या है?',
    'What is your age?': 'आपकी उम्र क्या है?',
    'For example, 42': 'उदाहरण: 42',
    "What's your gender?": 'आपका लिंग क्या है?',
    'Male': 'पुरुष',
    'Female': 'महिला',
    'Other': 'अन्य',
    'What is your UHID number?': 'आपका UHID नंबर क्या है?',
    'What is your IP number?': 'आपका IP नंबर क्या है?',
    'You can skip this if you do not have it.': 'यदि यह आपके पास नहीं है तो इसे छोड़ सकते हैं।',
    'Please tell me both your weight in kilograms and your height in centimeters.':
      'कृपया अपना वजन किलोग्राम में और लंबाई सेंटीमीटर में बताइए।',
    'For example: 68 kg and 162 cm.': 'उदाहरण: 68 किलोग्राम और 162 सेंटीमीटर।',
    'What health problem are you being treated for?':
      'आप किस स्वास्थ्य समस्या के लिए इलाज करा रहे हैं?',
    'What surgery or treatment are you going to have?':
      'आप कौन सी सर्जरी या इलाज कराने जा रहे हैं?',
    'Who is taking the assessment?': 'आकलन कौन दे रहा है?',
    'History taken from:': 'इतिहास लिया गया:',
    'Patient': 'मरीज',
    'Relative/Guardian': 'रिश्तेदार / अभिभावक',
    'Medical Records': 'मेडिकल रिकॉर्ड्स',
    'Pre-Anesthetic Assessment': 'प्री-एनेस्थेटिक आकलन',
    'AI assisted pre operative assessment.':
      'एआई सहायता से किया जाने वाला प्री-ऑपरेटिव आकलन।',
    'Conduct the patient interview, complete the camera-based airway examination, and generate the final assessment report from one streamlined workflow.':
      'मरीज का इंटरव्यू पूरा करें, कैमरा आधारित एयरवे जांच करें, और एक ही प्रक्रिया में अंतिम रिपोर्ट तैयार करें।',
    'Interview': 'इंटरव्यू',
    'Guided patient intake': 'मार्गदर्शित मरीज पंजीकरण',
    'Collect the full pre-anesthetic history with text or voice input.':
      'टेक्स्ट या आवाज़ से पूरा प्री-एनेस्थेटिक इतिहास दर्ज करें।',
    'Camera': 'कैमरा',
    'Airway examination': 'एयरवे जांच',
    'Capture the frontal and side-profile views after the questionnaire is complete.':
      'प्रश्नावली पूरी होने के बाद सामने और साइड प्रोफाइल दोनों दृश्य कैप्चर करें।',
    'Report': 'रिपोर्ट',
    'Printable final summary': 'प्रिंट करने योग्य अंतिम सारांश',
    'Review the transcript, camera findings, and final report in one place.':
      'ट्रांसक्रिप्ट, कैमरा निष्कर्ष और अंतिम रिपोर्ट को एक ही जगह देखें।',
    'Workflow': 'कार्यप्रवाह',
    'Move from intake to camera examination to final report.':
      'मरीज पंजीकरण से कैमरा जांच और फिर अंतिम रिपोर्ट तक बढ़ें।',
    'Assessment': 'आकलन',
    'Patient questionnaire': 'मरीज प्रश्नावली',
    'Answer the interview questions in sequence and capture the full transcript.':
      'प्रश्नों का क्रम से उत्तर दें और पूरा ट्रांसक्रिप्ट रिकॉर्ड करें।',
    'Dedicated airway page': 'अलग एयरवे पेज',
    'Switch to the camera page after the questionnaire for the image-based examination.':
      'प्रश्नावली के बाद इमेज आधारित जांच के लिए कैमरा पेज पर जाएँ।',
    'Separated findings': 'अलग-अलग निष्कर्ष',
    'Review the transcript and camera findings separately in the final report.':
      'अंतिम रिपोर्ट में ट्रांसक्रिप्ट और कैमरा निष्कर्ष अलग-अलग देखें।',
    'Records': 'रिकॉर्ड्स',
    'Completed assessments only': 'सिर्फ पूर्ण आकलन',
    'Open previously completed reports from the records page.':
      'रिकॉर्ड्स पेज से पहले से पूरी हुई रिपोर्ट्स खोलें।',
    'Start the interview and complete the patient questionnaire.':
      'इंटरव्यू शुरू करें और मरीज प्रश्नावली पूरी करें।',
    'Move to the separate camera page for the airway examination.':
      'एयरवे जांच के लिए अलग कैमरा पेज पर जाएँ।',
    'Generate and print the final transcript and report after completion.':
      'पूरा होने के बाद अंतिम ट्रांसक्रिप्ट और रिपोर्ट बनाकर प्रिंट करें।',
    'Do you have any history of previous surgeries in the past?': 'क्या पहले कभी आपकी कोई सर्जरी हुई है?',
    'Could you please mention when it was done?': 'कृपया बताइए यह कब हुई थी?',
    'Could you please mention the month and year when it was done?': 'कृपया बताइए यह किस महीने और किस साल हुई थी?',
    'For example: March 2020.': 'उदाहरण: मार्च 2020।',
    'Could you please mention the year?': 'कृपया वर्ष बताइए।',
    'Could you please mention the month?': 'कृपया महीना बताइए।',
    'Do you remember the type of anaesthesia used for the procedure?': 'क्या आपको उस प्रक्रिया में दिया गया एनेस्थीसिया याद है?',
    'GA': 'जनरल एनेस्थीसिया',
    'Spinal': 'स्पाइनल',
    'Regional Block': 'रीजनल ब्लॉक',
    'Do not remember': 'याद नहीं',
    'Were you admitted in ICU after the procedure?': 'क्या प्रक्रिया के बाद आपको ICU में भर्ती किया गया था?',
    'Do you remember the reason why you were admitted in the ICU?': 'क्या आपको ICU में भर्ती करने का कारण याद है?',
    'Could you mention the number of days you were in the ICU?': 'आप ICU में कितने दिन रहे?',
    'Were you on a ventilator?': 'क्या आपको वेंटिलेटर पर रखा गया था?',
    'If yes, for how many days?': 'यदि हाँ, तो कितने दिन?',
    'Was O2 therapy taken?': 'क्या ऑक्सीजन थेरेपी दी गई थी?',
    'Do you have diabetes?': 'क्या आपको डायबिटीज है?',
    'Do you have high BP (blood pressure)?': 'क्या आपको हाई BP (ब्लड प्रेशर) है?',
    'Do you have a thyroid disorder?': 'क्या आपको थायरॉयड की समस्या है?',
    'Do you have asthma?': 'क्या आपको अस्थमा है?',
    'Do you have seizures?': 'क्या आपको दौरे पड़ते हैं?',
    'Do you have heart disease?': 'क्या आपको हृदय रोग है?',
    'Do you have kidney disease?': 'क्या आपको किडनी की बीमारी है?',
    'Do you have liver disease?': 'क्या आपको लीवर की बीमारी है?',
    'Do you have a history of stroke?': 'क्या आपको स्ट्रोक का इतिहास है?',
    'Do you have any bleeding disorders?': 'क्या आपको खून बहने से जुड़ी कोई समस्या है?',
    'If yes, for how many years?': 'यदि हाँ, तो कितने वर्षों से?',
    'Are you currently taking any medicines for this?': 'क्या आप इसके लिए अभी कोई दवा ले रहे हैं?',
    'Could you please mention the medicines you are taking for this illness?':
      'कृपया इस बीमारी के लिए ली जा रही दवाओं के नाम बताइए।',
    'Could you please mention the dose or frequency of the inhaler?': 'कृपया इनहेलर की खुराक या कितनी बार लेते हैं, बताइए।',
    'When was the last episode?': 'आखिरी बार यह कब हुआ था?',
    'Have you had any procedure with stenting done?': 'क्या कभी स्टेंट डाला गया है?',
    'Do you have any implants or pacemakers?': 'क्या आपके शरीर में कोई इम्प्लांट या पेसमेकर है?',
    'Are you on dialysis?': 'क्या आप डायलिसिस पर हैं?',
    'How many cycles of dialysis has been done?': 'डायलिसिस के कितने चक्र हुए हैं?',
    'Could you mention any more details about your health problems?': 'क्या आप अपनी स्वास्थ्य समस्याओं के बारे में और कुछ बताना चाहेंगे?',
    'Do you have any drug allergies?': 'क्या आपको किसी दवा से एलर्जी है?',
    'Which drug are you allergic to?': 'किस दवा से एलर्जी है?',
    'Could you please mention any relevant family history of illness?': 'क्या परिवार में किसी बीमारी का संबंधित इतिहास है?',
    'Could you specify more relating to the condition?': 'कृपया उस स्थिति के बारे में थोड़ा और बताइए।',
    'Do you have a history of smoking?': 'क्या आपको धूम्रपान की आदत है?',
    'Could you mention the number of years of this habit, packs per day and the last puff?':
      'कृपया बताइए यह आदत कितने साल से है, रोज़ कितने पैक पीते हैं और आखिरी कश कब लिया था।',
    'Do you have a history of alcohol consumption?': 'क्या आपको शराब पीने की आदत है?',
    'Could you please mention the number of years of this habit and the last drink?':
      'कृपया बताइए यह आदत कितने साल से है और आखिरी बार कब शराब पी थी।',
    'Do you have any history of irregular heart beats?': 'क्या आपको अनियमित दिल की धड़कन का इतिहास है?',
    'Could you please mention more details about the irregular heart beats?': 'कृपया अनियमित दिल की धड़कन के बारे में और बताइए।',
    'Do you have any history of breathlessness?': 'क्या आपको सांस फूलने का इतिहास है?',
    'Do you have any history of chest pain?': 'क्या आपको छाती में दर्द का इतिहास है?',
    'NYHA classification': 'NYHA वर्गीकरण',
    'Class 1: Ordinary activity does not cause unusual tiredness, irregular heart beats, or shortness of breath.':
      'क्लास 1: सामान्य काम से असामान्य थकान, अनियमित धड़कन या सांस फूलना नहीं होता।',
    'Class 2: You are comfortable at rest, but ordinary activity such as walking up two flights of stairs causes tiredness, irregular heart beats, or shortness of breath.':
      'क्लास 2: आराम में ठीक रहते हैं, लेकिन दो मंज़िल सीढ़ियाँ चढ़ने जैसी सामान्य गतिविधि से थकान, अनियमित धड़कन या सांस फूलना होता है।',
    'Class 3: You are comfortable at rest, but less than ordinary activity such as walking one block or showering causes tiredness, irregular heart beats, or shortness of breath.':
      'क्लास 3: आराम में ठीक रहते हैं, लेकिन बहुत हल्की गतिविधि जैसे थोड़ा चलना या नहाना भी थकान, अनियमित धड़कन या सांस फूलना कर देता है।',
    'Class 4: You have tiredness, irregular heart beats, or shortness of breath even at rest.':
      'क्लास 4: आराम में भी थकान, अनियमित धड़कन या सांस फूलना रहता है।',
    'Do you have history of snoring?': 'क्या आपको खर्राटे लेने का इतिहास है?',
    'Making noises while sleeping?': 'क्या सोते समय आवाज़ करते हैं?',
    'Do you snore loudly?': 'क्या आपके खर्राटे बहुत तेज़ होते हैं?',
    'Do you feel tired during the day?': 'क्या दिन में थकान महसूस होती है?',
    'Has anyone seen you stop breathing or gasp during sleep?': 'क्या किसी ने आपको सोते समय सांस रुकते या हांफते देखा है?',
    'Are you being treated for high blood pressure?': 'क्या हाई ब्लड प्रेशर के लिए इलाज चल रहा है?',
    'Did you have any history of fever in the recent past?': 'क्या हाल ही में बुखार हुआ था?',
    'How many days?': 'कितने दिन?',
    'What medications did you take for it?': 'उसके लिए कौन सी दवाएँ ली थीं?',
    'Did you have a history of cough with or without discharge in the recent past?': 'क्या हाल ही में कफ या बिना कफ की खांसी हुई थी?',
    'Was the discharge discoloured?': 'क्या कफ का रंग बदला हुआ था?',
    'Did you have a history of wheezing?': 'क्या आपको घरघराहट का इतिहास है?',
    'Did you take any medications for it?': 'क्या उसके लिए कोई दवा ली थी?',
    'Modified Medical Research Council (MMRC) dyspnoea scale': 'MMRC सांस फूलने का स्केल',
    'Grade 0: I feel breathless only with hard exercise.': 'ग्रेड 0: केवल कठिन व्यायाम करने पर सांस फूलती है।',
    'Grade 1: I feel short of breath when hurrying on level ground or walking up a slight hill.':
      'ग्रेड 1: समतल ज़मीन पर तेज़ चलने या हल्की चढ़ाई पर सांस फूलती है।',
    'Grade 2: I walk slower than people of my age on level ground because of breathlessness.':
      'ग्रेड 2: सांस फूलने के कारण मैं अपनी उम्र के लोगों से धीमे चलता हूँ।',
    'Grade 3: I stop for breath after walking about 100 metres or after a few minutes on level ground.':
      'ग्रेड 3: लगभग 100 मीटर चलने या कुछ मिनट चलने के बाद सांस लेने के लिए रुकना पड़ता है।',
    'Grade 4: I am too breathless to leave the house or I get breathless while dressing.':
      'ग्रेड 4: मैं इतना सांस फूलता हूँ कि घर से बाहर नहीं जा पाता या कपड़े पहनते समय भी सांस फूलती है।',
    'Is there any medical or personal information you would like your anesthetist to be aware of?': 'क्या ऐसी कोई चिकित्सीय या व्यक्तिगत जानकारी है जिसके बारे में आप चाहते हैं कि एनेस्थेटिस्ट को पता हो?',
    'The questionnaire is complete. Please continue to the camera airway assessment page using a frontal view and a side profile to finish the assessment.':
      'प्रश्नावली पूरी हो गई है। आकलन पूरा करने के लिए कैमरा एयरवे आकलन पेज पर जाएँ और सामने तथा साइड प्रोफाइल दोनों दृश्य लें।',
    'Please capture the remaining required airway view to finish the examination.':
      'जाँच पूरी करने के लिए बाकी आवश्यक कैमरा दृश्य कैप्चर करें।',
    'The camera-based examination is complete. Your final transcript and report are now ready.':
      'कैमरा आधारित जाँच पूरी हो गई है। आपका अंतिम ट्रांसक्रिप्ट और रिपोर्ट तैयार है।',
    'Frontal view camera assessment was recorded. Detailed measurements are available in the final report.':
      'फ्रंटल कैमरा दृश्य रिकॉर्ड हो गया है। विस्तृत माप अंतिम रिपोर्ट में उपलब्ध हैं।',
    'Side-profile view camera assessment was recorded. Detailed measurements are available in the final report.':
      'साइड प्रोफाइल कैमरा दृश्य रिकॉर्ड हो गया है। विस्तृत माप अंतिम रिपोर्ट में उपलब्ध हैं।',
  },
}

const EXTRA_TRANSLATIONS: Record<'te' | 'ml' | 'kn', Record<string, string>> = {
  te: {
    'Hello! I am Valli. You may use text or voice for taking the assessment.':
      'నమస్తే! ఈ అసెస్‌మెంట్‌ను మార్గనిర్దేశం చేస్తున్న డాక్టర్‌ను నేను. మీరు టెక్స్ట్ లేదా వాయిస్ ఉపయోగించవచ్చు.',
    'Hello! I am the doctor guiding this assessment. You may use text or voice for taking the assessment.':
      'నమస్తే! ఈ అసెస్‌మెంట్‌ను మార్గనిర్దేశం చేస్తున్న డాక్టర్‌ను నేను. మీరు టెక్స్ట్ లేదా వాయిస్ ఉపయోగించవచ్చు.',
    'Got it, thank you.': 'సరే, ధన్యవాదాలు.',
    'Doctor': 'డాక్టర్',
    "The doctor's spoken voice is AI-generated.":
      'డాక్టర్ మాటల స్వరం ఎఐ ద్వారా రూపొందించబడింది.',
    "I'll say that again.": 'నేను మళ్లీ చెబుతాను.',
    'Let me say that more simply.': 'ఇంకా సులభంగా చెబుతాను.',
    "Sure, I'll slow down.": 'సరే, నేను నెమ్మదిగా చెబుతాను.',
    'Please answer yes or no.': 'దయచేసి అవును లేదా కాదు అని సమాధానం చెప్పండి.',
    'Please choose the option that fits best.': 'మీకు సరిపోయే ఎంపికను ఎంచుకోండి.',
    'Your options are:': 'మీ ఎంపికలు ఇవి:',
    "I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'నేను మీ ప్రీ-అనస్థెటిక్ అసెస్‌మెంట్‌కు సహాయం చేయడానికి ఉన్నాను. కాబట్టి ఇప్పటికైతే ఇదిపైనే కొనసాగుదాం. ప్రస్తుత ప్రశ్నకు సమాధానం చెప్పండి, లేదా అవసరమైతే శస్త్రచికిత్స సూచనల గురించి అడగండి.',
    "I've recorded your answer. I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'మీ సమాధానాన్ని నమోదు చేసాను. నేను మీ ప్రీ-అనస్థెటిక్ అసెస్‌మెంట్‌కు సహాయం చేయడానికి ఉన్నాను. కాబట్టి ఇప్పటికైతే ఇదిపైనే కొనసాగుదాం. ప్రస్తుత ప్రశ్నకు సమాధానం చెప్పండి, లేదా అవసరమైతే శస్త్రచికిత్స సూచనల గురించి అడగండి.',
    'What is your phone number?': 'మీ ఫోన్ నంబర్ ఏమిటి?',
    "What's the patient's phone number?": 'రోగి ఫోన్ నంబర్ ఏమిటి?',
    'For this demo, use a registered 10-digit phone number.': 'ఈ డెమో కోసం నమోదు చేసిన 10 అంకెల ఫోన్ నంబర్ ఉపయోగించండి.',
    "I found the patient's basic details from that phone number and filled them in.": 'ఆ ఫోన్ నంబర్ ద్వారా రోగి ప్రాథమిక వివరాలను కనుగొని నింపేశాను.',
    "You're not an existing patient in the demo directory. Please enter a registered 10-digit number.": 'మీరు డెమో రోగి డైరెక్టరీలో ఉన్న రోగి కాదు. దయచేసి నమోదు చేసిన 10 అంకెల నంబర్ ఇవ్వండి.',
    'Thanks. I just need a registered 10-digit phone number, for example 9876501234.': 'ధన్యవాదాలు. నాకు నమోదు చేసిన 10 అంకెల ఫోన్ నంబర్ మాత్రమే కావాలి, ఉదాహరణకు 9876501234.',
    'What is your name?': 'మీ పేరు ఏమిటి?',
    'What is your age?': 'మీ వయస్సెంత?',
    'For example, 42': 'ఉదాహరణకు: 42',
    "What's your gender?": 'మీ లింగం ఏమిటి?',
    'Male': 'పురుషుడు',
    'Female': 'స్త్రీ',
    'Other': 'ఇతర',
    'What is your UHID number?': 'మీ UHID నంబర్ ఏమిటి?',
    'What is your IP number?': 'మీ IP నంబర్ ఏమిటి?',
    'You can skip this if you do not have it.': 'ఇది మీ వద్ద లేకపోతే దాటవేయవచ్చు.',
    'Please tell me both your weight in kilograms and your height in centimeters.':
      'దయచేసి మీ బరువును కిలోగ్రాముల్లో మరియు ఎత్తును సెంటీమీటర్లలో చెప్పండి.',
    'For example: 68 kg and 162 cm.': 'ఉదాహరణకు: 68 కిలోలు మరియు 162 సెం.మీ.',
    'What health problem are you being treated for?':
      'మీకు ఏ ఆరోగ్య సమస్యకు చికిత్స జరుగుతోంది?',
    'What surgery or treatment are you going to have?':
      'మీకు ఏ శస్త్రచికిత్స లేదా చికిత్స చేయబోతున్నారు?',
    'Who is taking the assessment?': 'ఈ అసెస్‌మెంట్‌ను ఎవరు చేస్తున్నారు?',
    'Patient': 'రోగి',
    'Relative/Guardian': 'బంధువు / సంరక్షకుడు',
    'Medical Records': 'మెడికల్ రికార్డులు',
    'Pre-Anesthetic Assessment': 'ప్రీ-అనస్థెటిక్ అసెస్‌మెంట్',
    'AI assisted pre operative assessment.':
      'ఏఐ సహాయంతో ముందస్తు శస్త్రచికిత్సా మూల్యాంకనం.',
    'Conduct the patient interview, complete the camera-based airway examination, and generate the final assessment report from one streamlined workflow.':
      'రోగి ఇంటర్వ్యూ పూర్తి చేసి, కెమెరా ఆధారిత ఎయిర్‌వే పరీక్ష పూర్తి చేసి, చివరి అసెస్‌మెంట్ నివేదికను ఒకే పనితీరులో తయారు చేయండి.',
    'Interview': 'ఇంటర్వ్యూ',
    'Guided patient intake': 'మార్గదర్శక రోగి నమోదు',
    'Camera': 'కెమెరా',
    'Airway examination': 'ఎయిర్‌వే పరీక్ష',
    'Report': 'రిపోర్ట్',
    'Records': 'రికార్డులు',
    'Do you have any history of previous surgeries in the past?': 'మీకు ఇంతకు ముందు ఎప్పుడైనా శస్త్రచికిత్స జరిగిందా?',
    'Could you please mention the month and year when it was done?': 'అది ఏ నెలలో, ఏ సంవత్సరంలో జరిగిందో చెప్పగలరా?',
    'For example: March 2020.': 'ఉదాహరణకు: మార్చి 2020.',
    'Do you have diabetes?': 'మీకు మధుమేహం ఉందా?',
    'Do you have high BP (blood pressure)?': 'మీకు అధిక రక్తపోటు ఉందా?',
    'Do you have asthma?': 'మీకు ఆస్థమా ఉందా?',
    'Do you have a history of smoking?': 'మీకు పొగ త్రాగే అలవాటు ఉందా?',
    'Do you have a history of alcohol consumption?': 'మీకు మద్యం సేవించే అలవాటు ఉందా?',
    'Do you have any history of breathlessness?': 'మీకు శ్వాస తీసుకోవడంలో ఇబ్బంది చరిత్ర ఉందా?',
    'Is there any medical or personal information you would like your anesthetist to be aware of?':
      'మీ అనస్థెటిస్ట్‌కు తెలియాలి అనుకునే వైద్య లేదా వ్యక్తిగత సమాచారం ఏదైనా ఉందా?',
    'The questionnaire is complete. Please continue to the camera airway assessment page using a frontal view and a side profile to finish the assessment.':
      'ప్రశ్నావళి పూర్తయింది. అసెస్‌మెంట్‌ను పూర్తి చేయడానికి ముందు మరియు పక్క ప్రొఫైల్‌తో కెమెరా ఎయిర్‌వే పేజీకి వెళ్లండి.',
    'Please capture the remaining required airway view to finish the examination.':
      'పరీక్ష పూర్తి చేయడానికి మిగిలిన అవసరమైన కెమెరా దృశ్యాన్ని రికార్డ్ చేయండి.',
    'The camera-based examination is complete. Your final transcript and report are now ready.':
      'కెమెరా ఆధారిత పరీక్ష పూర్తయింది. మీ చివరి ట్రాన్స్‌క్రిప్ట్ మరియు రిపోర్ట్ సిద్ధంగా ఉన్నాయి.',
    'Frontal view camera assessment was recorded. Detailed measurements are available in the final report.':
      'ముందు కెమెరా అంచనా రికార్డ్ అయింది. విపులమైన కొలతలు చివరి రిపోర్ట్‌లో ఉంటాయి.',
    'Side-profile view camera assessment was recorded. Detailed measurements are available in the final report.':
      'సైడ్ ప్రొఫైల్ కెమెరా అంచనా రికార్డ్ అయింది. విపులమైన కొలతలు చివరి రిపోర్ట్‌లో ఉంటాయి.',
  },
  ml: {
    'Hello! I am Valli. You may use text or voice for taking the assessment.':
      'നമസ്കാരം! ഈ അസസ്‌മെന്റ് നയിക്കുന്ന ഡോക്ടറാണ് ഞാൻ. ടെക്സ്റ്റ് അല്ലെങ്കിൽ ശബ്ദം ഉപയോഗിക്കാം.',
    'Hello! I am the doctor guiding this assessment. You may use text or voice for taking the assessment.':
      'നമസ്കാരം! ഈ അസസ്‌മെന്റ് നയിക്കുന്ന ഡോക്ടറാണ് ഞാൻ. ടെക്സ്റ്റ് അല്ലെങ്കിൽ ശബ്ദം ഉപയോഗിക്കാം.',
    'Got it, thank you.': 'ശരി, നന്ദി.',
    'Doctor': 'ഡോക്ടർ',
    "The doctor's spoken voice is AI-generated.":
      'ഡോക്ടറുടെ ശബ്ദം എഐ ഉപയോഗിച്ച് സൃഷ്ടിച്ചതാണ്.',
    "I'll say that again.": 'ഞാൻ അത് വീണ്ടും പറയും.',
    'Let me say that more simply.': 'ഞാൻ അത് കൂടുതൽ ലളിതമായി പറയും.',
    "Sure, I'll slow down.": 'ശരി, ഞാൻ മന്ദഗതിയിൽ പറയും.',
    'Please answer yes or no.': 'ദയവായി അതെ അല്ലെങ്കിൽ ഇല്ല എന്ന് മറുപടി പറയൂ.',
    'Please choose the option that fits best.': 'താങ്കൾക്ക് ഏറ്റവും അനുയോജ്യമായ ഓപ്ഷൻ തിരഞ്ഞെടുക്കൂ.',
    'Your options are:': 'നിങ്ങളുടെ ഓപ്ഷനുകൾ:',
    "I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'നിങ്ങളുടെ പ്രീ-അനസ്തീഷ്യ അസസ്‌മെന്റിന് സഹായിക്കാനാണ് ഞാൻ ഇവിടെ ഉള്ളത്, അതിനാൽ ഇപ്പോൾ ഇതിൽ തന്നെ തുടരാം. നിലവിലെ ചോദ്യത്തിന് മറുപടി നൽകുക, അല്ലെങ്കിൽ ആവശ്യമെങ്കിൽ ശസ്ത്രക്രിയ നിർദേശങ്ങളെക്കുറിച്ച് ചോദിക്കാം.',
    "I've recorded your answer. I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'നിങ്ങളുടെ മറുപടി ഞാൻ രേഖപ്പെടുത്തി. നിങ്ങളുടെ പ്രീ-അനസ്തീഷ്യ അസസ്‌മെന്റിന് സഹായിക്കാനാണ് ഞാൻ ഇവിടെ ഉള്ളത്, അതിനാൽ ഇപ്പോൾ ഇതിൽ തന്നെ തുടരാം. നിലവിലെ ചോദ്യത്തിന് മറുപടി നൽകുക, അല്ലെങ്കിൽ ആവശ്യമെങ്കിൽ ശസ്ത്രക്രിയ നിർദേശങ്ങളെക്കുറിച്ച് ചോദിക്കാം.',
    'What is your phone number?': 'നിങ്ങളുടെ ഫോൺ നമ്പർ എന്താണ്?',
    "What's the patient's phone number?": 'രോഗിയുടെ ഫോൺ നമ്പർ എന്താണ്?',
    'For this demo, use a registered 10-digit phone number.': 'ഈ ഡെമോയ്ക്ക് രജിസ്റ്റർ ചെയ്ത 10 അക്ക ഫോൺ നമ്പർ ഉപയോഗിക്കുക.',
    "I found the patient's basic details from that phone number and filled them in.": 'ആ ഫോൺ നമ്പറിൽ നിന്ന് രോഗിയുടെ അടിസ്ഥാന വിവരങ്ങൾ കണ്ടെത്തി ഞാൻ പൂരിപ്പിച്ചു.',
    "You're not an existing patient in the demo directory. Please enter a registered 10-digit number.": 'നിങ്ങൾ ഡെമോ രോഗി ഡയറക്ടറിയിലുള്ള രോഗിയല്ല. രജിസ്റ്റർ ചെയ്ത 10 അക്ക നമ്പർ നൽകുക.',
    'Thanks. I just need a registered 10-digit phone number, for example 9876501234.': 'നന്ദി. എനിക്ക് രജിസ്റ്റർ ചെയ്ത 10 അക്ക ഫോൺ നമ്പർ മാത്രം വേണം, ഉദാഹരണത്തിന് 9876501234.',
    'What is your name?': 'നിങ്ങളുടെ പേര് എന്താണ്?',
    'What is your age?': 'നിങ്ങളുടെ വയസ് എത്രയാണ്?',
    'For example, 42': 'ഉദാഹരണത്തിന്: 42',
    "What's your gender?": 'നിങ്ങളുടെ ലിംഗം എന്താണ്?',
    'Male': 'പുരുഷൻ',
    'Female': 'സ്ത്രീ',
    'Other': 'മറ്റ്',
    'What is your UHID number?': 'നിങ്ങളുടെ UHID നമ്പർ എന്താണ്?',
    'What is your IP number?': 'നിങ്ങളുടെ IP നമ്പർ എന്താണ്?',
    'You can skip this if you do not have it.': 'ഇത് ഇല്ലെങ്കിൽ ഒഴിവാക്കാം.',
    'Please tell me both your weight in kilograms and your height in centimeters.':
      'ദയവായി നിങ്ങളുടെ ഭാരം കിലോഗ്രാമിലും ഉയരം സെന്റിമീറ്ററിലും പറയൂ.',
    'For example: 68 kg and 162 cm.': 'ഉദാഹരണത്തിന്: 68 കിലോയും 162 സെ.മീ.യും.',
    'What health problem are you being treated for?':
      'ഏത് ആരോഗ്യപ്രശ്നത്തിനാണ് നിങ്ങള്‍ക്ക് ചികിത്സ ലഭിക്കുന്നത്?',
    'What surgery or treatment are you going to have?':
      'നിങ്ങള്‍ക്ക് ഏത് ശസ്ത്രക്രിയയോ ചികിത്സയോ നടത്താനാണ് പോകുന്നത്?',
    'Who is taking the assessment?': 'ഈ അസസ്‌മെന്റ് ആരാണ് നടത്തുന്നത്?',
    'Patient': 'രോഗി',
    'Relative/Guardian': 'ബന്ധു / രക്ഷിതാവ്',
    'Medical Records': 'മെഡിക്കൽ രേഖകൾ',
    'Pre-Anesthetic Assessment': 'പ്രീ-അനസ്തീഷ്യ അസസ്‌മെന്റ്',
    'AI assisted pre operative assessment.':
      'എഐ സഹായത്തോടെ നടത്തുന്ന പ്രീ-ഓപ്പറേറ്റീവ് വിലയിരുത്തൽ.',
    'Conduct the patient interview, complete the camera-based airway examination, and generate the final assessment report from one streamlined workflow.':
      'രോഗി അഭിമുഖം പൂർത്തിയാക്കി, ക്യാമറ അടിസ്ഥാനമാക്കിയ എയർവേ പരിശോധന നടത്തി, ഒറ്റ പ്രവർത്തനക്രമത്തിൽ അവസാന അസസ്‌മെന്റ് റിപ്പോർട്ട് തയ്യാറാക്കൂ.',
    'Interview': 'അഭിമുഖം',
    'Guided patient intake': 'മാർഗ്ഗനിർദേശ രോഗി രജിസ്ട്രേഷൻ',
    'Camera': 'ക്യാമറ',
    'Airway examination': 'എയർവേ പരിശോധന',
    'Report': 'റിപ്പോർട്ട്',
    'Records': 'റെക്കോർഡുകൾ',
    'Do you have any history of previous surgeries in the past?': 'മുമ്പ് ഒരിക്കലും ശസ്ത്രക്രിയ ഉണ്ടായിട്ടുണ്ടോ?',
    'Could you please mention the month and year when it was done?': 'അത് ഏത് മാസത്തിലും ഏത് വർഷത്തിലുമാണ് നടന്നത് എന്ന് പറയാമോ?',
    'For example: March 2020.': 'ഉദാഹരണം: മാർച്ച് 2020.',
    'Do you have diabetes?': 'നിങ്ങൾക്ക് പ്രമേഹം ഉണ്ടോ?',
    'Do you have high BP (blood pressure)?': 'നിങ്ങൾക്ക് ഉയർന്ന രക്തസമ്മർദ്ദമുണ്ടോ?',
    'Do you have asthma?': 'നിങ്ങൾക്ക് ആസ്ത്മയുണ്ടോ?',
    'Do you have a history of smoking?': 'നിങ്ങൾക്ക് പുകവലി ശീലം ഉണ്ടോ?',
    'Do you have a history of alcohol consumption?': 'നിങ്ങൾക്ക് മദ്യപാന ശീലം ഉണ്ടോ?',
    'Do you have any history of breathlessness?': 'നിങ്ങൾക്ക് ശ്വാസംമുട്ടൽ ചരിത്രമുണ്ടോ?',
    'Is there any medical or personal information you would like your anesthetist to be aware of?':
      'നിങ്ങളുടെ അനസ്തറ്റിസ്റ്റിന് അറിയേണ്ട മെഡിക്കൽ അല്ലെങ്കിൽ വ്യക്തിപരമായ വിവരങ്ങളുണ്ടോ?',
    'The questionnaire is complete. Please continue to the camera airway assessment page using a frontal view and a side profile to finish the assessment.':
      'ചോദ്യാവലി പൂർത്തിയായി. വിലയിരുത്തൽ പൂർത്തിയാക്കാൻ ഫ്രണ്ടൽ, സൈഡ് പ്രൊഫൈൽ കാഴ്ചകളോടെ ക്യാമറ എയർവേ പേജിലേക്ക് തുടരൂ.',
    'Please capture the remaining required airway view to finish the examination.':
      'പരിശോധന പൂർത്തിയാക്കാൻ ശേഷിക്കുന്ന ആവശ്യമായ ക്യാമറ കാഴ്ച പകർത്തൂ.',
    'The camera-based examination is complete. Your final transcript and report are now ready.':
      'ക്യാമറ അടിസ്ഥാനത്തിലുള്ള പരിശോധന പൂർത്തിയായി. നിങ്ങളുടെ അന്തിമ ട്രാൻസ്‌ക്രിപ്റ്റും റിപ്പോർട്ടും തയ്യാറായി.',
    'Frontal view camera assessment was recorded. Detailed measurements are available in the final report.':
      'ഫ്രണ്ടൽ ക്യാമറ വിലയിരുത്തൽ രേഖപ്പെടുത്തി. വിശദമായ അളവുകൾ അവസാന റിപ്പോർട്ടിൽ ലഭ്യമാണ്.',
    'Side-profile view camera assessment was recorded. Detailed measurements are available in the final report.':
      'സൈഡ്-പ്രൊഫൈൽ ക്യാമറ വിലയിരുത്തൽ രേഖപ്പെടുത്തി. വിശദമായ അളവുകൾ അവസാന റിപ്പോർട്ടിൽ ലഭ്യമാണ്.',
  },
  kn: {
    'Hello! I am Valli. You may use text or voice for taking the assessment.':
      'ನಮಸ್ಕಾರ! ಈ ಮೌಲ್ಯಮಾಪನವನ್ನು ಮುನ್ನಡೆಸುವ ವೈದ್ಯನು ನಾನು. ನೀವು ಪಠ್ಯ ಅಥವಾ ಧ್ವನಿಯನ್ನು ಬಳಸಬಹುದು.',
    'Hello! I am the doctor guiding this assessment. You may use text or voice for taking the assessment.':
      'ನಮಸ್ಕಾರ! ಈ ಮೌಲ್ಯಮಾಪನವನ್ನು ಮುನ್ನಡೆಸುವ ವೈದ್ಯನು ನಾನು. ನೀವು ಪಠ್ಯ ಅಥವಾ ಧ್ವನಿಯನ್ನು ಬಳಸಬಹುದು.',
    'Got it, thank you.': 'ಸರಿ, ಧನ್ಯವಾದಗಳು.',
    'Doctor': 'ವೈದ್ಯರು',
    "The doctor's spoken voice is AI-generated.":
      'ವೈದ್ಯರ ಮಾತಿನ ಧ್ವನಿ ಎಐ ಮೂಲಕ ಸೃಷ್ಟಿಸಲಾಗಿದೆ.',
    "I'll say that again.": 'ನಾನು ಅದನ್ನು ಮತ್ತೆ ಹೇಳುತ್ತೇನೆ.',
    'Let me say that more simply.': 'ನಾನು ಅದನ್ನು ಇನ್ನೂ ಸರಳವಾಗಿ ಹೇಳುತ್ತೇನೆ.',
    "Sure, I'll slow down.": 'ಸರಿ, ನಾನು ನಿಧಾನವಾಗಿ ಹೇಳುತ್ತೇನೆ.',
    'Please answer yes or no.': 'ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಉತ್ತರಿಸಿ.',
    'Please choose the option that fits best.': 'ನಿಮಗೆ ಸರಿಯಾದ ಆಯ್ಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    'Your options are:': 'ನಿಮ್ಮ ಆಯ್ಕೆಗಳು:',
    "I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'ನಾನು ನಿಮ್ಮ ಪ್ರೀ-ಅನಸ್ಥೆಟಿಕ್ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ, ಆದ್ದರಿಂದ ಈಗ ಇದಲ್ಲೇ ಮುಂದುವರಿಯೋಣ. ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ, ಅಥವಾ ಅಗತ್ಯವಿದ್ದರೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಸೂಚನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.',
    "I've recorded your answer. I'm here to help with your pre-anesthetic assessment, so let's stay with this for now. Please answer the current question, or ask me about surgery instructions if you need help.":
      'ನಿಮ್ಮ ಉತ್ತರವನ್ನು ದಾಖಲಿಸಿದ್ದೇನೆ. ನಾನು ನಿಮ್ಮ ಪ್ರೀ-ಅನಸ್ಥೆಟಿಕ್ ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ, ಆದ್ದರಿಂದ ಈಗ ಇದಲ್ಲೇ ಮುಂದುವರಿಯೋಣ. ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ, ಅಥವಾ ಅಗತ್ಯವಿದ್ದರೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಸೂಚನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.',
    'What is your phone number?': 'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ಏನು?',
    "What's the patient's phone number?": 'ರೋಗಿಯ ಫೋನ್ ಸಂಖ್ಯೆ ಏನು?',
    'For this demo, use a registered 10-digit phone number.': 'ಈ ಡೆಮೊಗಾಗಿ ನೋಂದಾಯಿತ 10 ಅಂಕೆಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ.',
    "I found the patient's basic details from that phone number and filled them in.": 'ಆ ಫೋನ್ ಸಂಖ್ಯೆಯಿಂದ ರೋಗಿಯ ಮೂಲ ವಿವರಗಳನ್ನು ಕಂಡುಹಿಡಿದು ತುಂಬಿದ್ದೇನೆ.',
    "You're not an existing patient in the demo directory. Please enter a registered 10-digit number.": 'ನೀವು ಡೆಮೋ ರೋಗಿ ಡೈರೆಕ್ಟರಿಯಲ್ಲಿರುವ ರೋಗಿಯಲ್ಲ. ದಯವಿಟ್ಟು ನೋಂದಾಯಿತ 10 ಅಂಕೆಯ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    'Thanks. I just need a registered 10-digit phone number, for example 9876501234.': 'ಧನ್ಯವಾದಗಳು. ನನಗೆ ನೋಂದಾಯಿತ 10 ಅಂಕೆಯ ಫೋನ್ ಸಂಖ್ಯೆ ಮಾತ್ರ ಬೇಕು, ಉದಾಹರಣೆಗೆ 9876501234.',
    'What is your name?': 'ನಿಮ್ಮ ಹೆಸರು ಏನು?',
    'What is your age?': 'ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?',
    'For example, 42': 'ಉದಾಹರಣೆಗೆ: 42',
    "What's your gender?": 'ನಿಮ್ಮ ಲಿಂಗ ಏನು?',
    'Male': 'ಪುರುಷ',
    'Female': 'ಸ್ತ್ರೀ',
    'Other': 'ಇತರೆ',
    'What is your UHID number?': 'ನಿಮ್ಮ UHID ಸಂಖ್ಯೆ ಏನು?',
    'What is your IP number?': 'ನಿಮ್ಮ IP ಸಂಖ್ಯೆ ಏನು?',
    'You can skip this if you do not have it.': 'ಇದು ಇಲ್ಲದಿದ್ದರೆ ಬಿಡಬಹುದು.',
    'Please tell me both your weight in kilograms and your height in centimeters.':
      'ದಯವಿಟ್ಟು ನಿಮ್ಮ ತೂಕವನ್ನು ಕಿಲೋಗ್ರಾಂಗಳಲ್ಲಿ ಮತ್ತು ಎತ್ತರವನ್ನು ಸೆಂಟಿಮೀಟರ್‌ಗಳಲ್ಲಿ ತಿಳಿಸಿ.',
    'For example: 68 kg and 162 cm.': 'ಉದಾಹರಣೆಗೆ: 68 ಕೆಜಿ ಮತ್ತು 162 ಸೆಂ.ಮೀ.',
    'What health problem are you being treated for?':
      'ನಿಮಗೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗೆ ಚಿಕಿತ್ಸೆ ನೀಡಲಾಗುತ್ತಿದೆ?',
    'What surgery or treatment are you going to have?':
      'ನಿಮಗೆ ಯಾವ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಅಥವಾ ಚಿಕಿತ್ಸೆ ನಡೆಯಲಿದೆ?',
    'Who is taking the assessment?': 'ಈ ಮೌಲ್ಯಮಾಪನವನ್ನು ಯಾರು ಮಾಡುತ್ತಿದ್ದಾರೆ?',
    'Patient': 'ರೋಗಿ',
    'Relative/Guardian': 'ಬಂಧು / ಪಾಲಕರವರು',
    'Medical Records': 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು',
    'Pre-Anesthetic Assessment': 'ಪ್ರೀ-ಅನಸ್ಥೆಟಿಕ್ ಮೌಲ್ಯಮಾಪನ',
    'AI assisted pre operative assessment.':
      'ಎಐ ಸಹಾಯದಿಂದ ನಡೆಸುವ ಪ್ರೀ-ಆಪರೇಟಿವ್ ಮೌಲ್ಯಮಾಪನ.',
    'Conduct the patient interview, complete the camera-based airway examination, and generate the final assessment report from one streamlined workflow.':
      'ರೋಗಿ ಸಂದರ್ಶನವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ, ಕ್ಯಾಮೆರಾ ಆಧಾರಿತ ಏರ್‌ವೇ ಪರೀಕ್ಷೆಯನ್ನು ಮುಗಿಸಿ, ಒಂದೇ ಕ್ರಮದಲ್ಲಿ ಅಂತಿಮ ಮೌಲ್ಯಮಾಪನ ವರದಿಯನ್ನು ಸಿದ್ಧಪಡಿಸಿ.',
    'Interview': 'ಸಂದರ್ಶನ',
    'Guided patient intake': 'ಮಾರ್ಗದರ್ಶಿತ ರೋಗಿ ನೋಂದಣಿ',
    'Camera': 'ಕ್ಯಾಮೆರಾ',
    'Airway examination': 'ಏರ್‌ವೇ ಪರೀಕ್ಷೆ',
    'Report': 'ವರದಿ',
    'Records': 'ದಾಖಲೆಗಳು',
    'Do you have any history of previous surgeries in the past?': 'ಹಿಂದೆ ಯಾವುದಾದರೂ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಆಗಿದೆಯೇ?',
    'Could you please mention the month and year when it was done?': 'ಅದು ಯಾವ ತಿಂಗಳಲ್ಲಿ ಮತ್ತು ಯಾವ ವರ್ಷದಲ್ಲಿ ನಡೆದಿತ್ತು ಎಂದು ಹೇಳಬಹುದೇ?',
    'For example: March 2020.': 'ಉದಾಹರಣೆ: ಮಾರ್ಚ್ 2020.',
    'Do you have diabetes?': 'ನಿಮಗೆ ಮಧುಮೇಹ ಇದೆಯೇ?',
    'Do you have high BP (blood pressure)?': 'ನಿಮಗೆ ಹೆಚ್ಚಿನ ರಕ್ತದೊತ್ತಡ ಇದೆಯೇ?',
    'Do you have asthma?': 'ನಿಮಗೆ ಆಸ್ಥಮಾ ಇದೆಯೇ?',
    'Do you have a history of smoking?': 'ನಿಮಗೆ ಧೂಮಪಾನದ ಇತಿಹಾಸ ಇದೆಯೇ?',
    'Do you have a history of alcohol consumption?': 'ನಿಮಗೆ ಮದ್ಯಪಾನದ ಇತಿಹಾಸ ಇದೆಯೇ?',
    'Do you have any history of breathlessness?': 'ನಿಮಗೆ ಉಸಿರಾಟದ ತೊಂದರೆಯ ಇತಿಹಾಸ ಇದೆಯೇ?',
    'Is there any medical or personal information you would like your anesthetist to be aware of?':
      'ನಿಮ್ಮ ಅನಸ್ಥೆಟಿಸ್ಟ್‌ಗೆ ತಿಳಿದಿರಬೇಕೆಂದು ನೀವು ಬಯಸುವ ವೈದ್ಯಕೀಯ ಅಥವಾ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಇದೆಯೇ?',
    'The questionnaire is complete. Please continue to the camera airway assessment page using a frontal view and a side profile to finish the assessment.':
      'ಪ್ರಶ್ನಾವಳಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ಮೌಲ್ಯಮಾಪನವನ್ನು ಮುಗಿಸಲು ಫ್ರಂಟಲ್ ಮತ್ತು ಸೈಡ್ ಪ್ರೊಫೈಲ್ ದೃಶ್ಯಗಳೊಂದಿಗೆ ಕ್ಯಾಮೆರಾ ಏರ್‌ವೇ ಪುಟಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ.',
    'Please capture the remaining required airway view to finish the examination.':
      'ಪರೀಕ್ಷೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಉಳಿದಿರುವ ಅಗತ್ಯ ಕ್ಯಾಮೆರಾ ದೃಶ್ಯವನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ.',
    'The camera-based examination is complete. Your final transcript and report are now ready.':
      'ಕ್ಯಾಮೆರಾ ಆಧಾರಿತ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ಅಂತಿಮ ಟ್ರಾನ್ಸ್‌ಕ್ರಿಪ್ಟ್ ಮತ್ತು ವರದಿ ಈಗ ಸಿದ್ಧವಾಗಿದೆ.',
    'Frontal view camera assessment was recorded. Detailed measurements are available in the final report.':
      'ಮುಂಭಾಗದ ಕ್ಯಾಮೆರಾ ಮೌಲ್ಯಮಾಪನ ದಾಖಲಾಗಿದೆ. ವಿವರವಾದ ಮಾಪನಗಳು ಅಂತಿಮ ವರದಿಯಲ್ಲಿ ಲಭ್ಯವಿವೆ.',
    'Side-profile view camera assessment was recorded. Detailed measurements are available in the final report.':
      'ಸೈಡ್-ಪ್ರೊಫೈಲ್ ಕ್ಯಾಮೆರಾ ಮೌಲ್ಯಮಾಪನ ದಾಖಲಾಗಿದೆ. ವಿವರವಾದ ಮಾಪನಗಳು ಅಂತಿಮ ವರದಿಯಲ್ಲಿ ಲಭ್ಯವಿವೆ.',
  },
}

const TRANSLATIONS: Record<Exclude<AppLanguage, 'en'>, Record<string, string>> = {
  ...BASE_TRANSLATIONS,
  ...EXTRA_TRANSLATIONS,
}

const LANGUAGE_SETS = {
  ta: {
    yes: new Set(['ஆம்', 'ஆமாம்', 'ஆமா', 'சரி']),
    no: new Set(['இல்லை', 'இல்ல', 'வேண்டாம்']),
    skip: new Set(['தவிர்', 'தவிர்க்கவும்', 'தெரியாது']),
  },
  hi: {
    yes: new Set(['हाँ', 'हां', 'जी', 'हाँ जी']),
    no: new Set(['नहीं', 'नही', 'मत', 'न']),
    skip: new Set(['छोड़ें', 'छोड़ो', 'पता नहीं', 'मालूम नहीं']),
  },
  te: {
    yes: new Set(['అవును', 'అవున్', 'సరే']),
    no: new Set(['కాదు', 'లేదు', 'వద్దు']),
    skip: new Set(['దాటవేయండి', 'స్కిప్', 'తెలియదు']),
  },
  ml: {
    yes: new Set(['അതെ', 'ഉണ്ട്', 'ശരി']),
    no: new Set(['ഇല്ല', 'വേണ്ട', 'അല്ല']),
    skip: new Set(['ഒഴിവാക്കുക', 'സ്കിപ്പ്', 'അറിയില്ല']),
  },
  kn: {
    yes: new Set(['ಹೌದು', 'ಸರಿ', 'ಇದೆ']),
    no: new Set(['ಇಲ್ಲ', 'ಬೇಡ', 'ಅಲ್ಲ']),
    skip: new Set(['ಬಿಡಿ', 'ಸ್ಕಿಪ್', 'ಗೊತ್ತಿಲ್ಲ']),
  },
} as const

function replaceLocalizedDigits(text: string) {
  return text
    .replace(/[௦-௯]/g, (digit) => TAMIL_DIGITS[digit] ?? digit)
    .replace(/[०-९]/g, (digit) => DEVANAGARI_DIGITS[digit] ?? digit)
    .replace(/[౦-౯]/g, (digit) => TELUGU_DIGITS[digit] ?? digit)
    .replace(/[൦-൯]/g, (digit) => MALAYALAM_DIGITS[digit] ?? digit)
    .replace(/[೦-೯]/g, (digit) => KANNADA_DIGITS[digit] ?? digit)
}

function normalizedToken(text: string) {
  return replaceLocalizedDigits(text).toLowerCase().replace(/[.,!?;:]/g, '').trim()
}

function dynamicTranslation(text: string, language: Exclude<AppLanguage, 'en'>): string | null {
  if (text.startsWith('Thank you. I still need ')) {
    const trailing = text.replace('Thank you. I still need ', '').replace(/\.$/, '')
    if (language === 'ta') {
      const translatedTrailing = trailing
        .replace('both your weight in kilograms and your height in centimeters', 'உங்கள் எடையும் உயரமும்')
        .replace('your weight in kilograms', 'உங்கள் எடை')
        .replace('your height in centimeters', 'உங்கள் உயரம்')
        .replace('the number of years of this habit', 'இந்த பழக்கம் எத்தனை ஆண்டுகள்')
        .replace('packs per day', 'ஒரு நாளில் எத்தனை pack')
        .replace('the last puff', 'கடைசி புகைத்த நேரம்')
        .replace('the last drink', 'கடைசி குடித்த நேரம்')
      return `நன்றி. இன்னும் ${translatedTrailing} வேண்டும்.`
    }

    if (language === 'te') {
      const translatedTrailing = trailing
        .replace('both your weight in kilograms and your height in centimeters', 'మీ బరువు మరియు ఎత్తు')
        .replace('your weight in kilograms', 'మీ బరువు')
        .replace('your height in centimeters', 'మీ ఎత్తు')
        .replace('the number of years of this habit', 'ఈ అలవాటు ఎన్ని సంవత్సరాలుగా ఉంది')
        .replace('packs per day', 'రోజుకు ఎన్ని ప్యాక్‌లు')
        .replace('the last puff', 'చివరిసారి పొగ తాగిన సమయం')
        .replace('the last drink', 'చివరిసారి మద్యం తీసుకున్న సమయం')
      return `ధన్యవాదాలు. నాకు ఇంకా ${translatedTrailing} కావాలి.`
    }

    if (language === 'ml') {
      const translatedTrailing = trailing
        .replace('both your weight in kilograms and your height in centimeters', 'നിങ്ങളുടെ ഭാരംയും ഉയരവും')
        .replace('your weight in kilograms', 'നിങ്ങളുടെ ഭാരം')
        .replace('your height in centimeters', 'നിങ്ങളുടെ ഉയരം')
        .replace('the number of years of this habit', 'ഈ ശീലം എത്ര വർഷമായി ഉണ്ട്')
        .replace('packs per day', 'ദിവസത്തിൽ എത്ര പാക്ക്')
        .replace('the last puff', 'അവസാനം പുകവലിച്ച സമയം')
        .replace('the last drink', 'അവസാനം മദ്യം കുടിച്ച സമയം')
      return `നന്ദി. എനിക്ക് ഇപ്പോഴും ${translatedTrailing} അറിയണം.`
    }

    if (language === 'kn') {
      const translatedTrailing = trailing
        .replace('both your weight in kilograms and your height in centimeters', 'ನಿಮ್ಮ ತೂಕ ಮತ್ತು ಎತ್ತರ')
        .replace('your weight in kilograms', 'ನಿಮ್ಮ ತೂಕ')
        .replace('your height in centimeters', 'ನಿಮ್ಮ ಎತ್ತರ')
        .replace('the number of years of this habit', 'ಈ ಅಭ್ಯಾಸ ಎಷ್ಟು ವರ್ಷಗಳಿಂದ ಇದೆ')
        .replace('packs per day', 'ದಿನಕ್ಕೆ ಎಷ್ಟು ಪ್ಯಾಕ್')
        .replace('the last puff', 'ಕೊನೆಯದಾಗಿ ಧೂಮಪಾನ ಮಾಡಿದ ಸಮಯ')
        .replace('the last drink', 'ಕೊನೆಯದಾಗಿ ಮದ್ಯ ಸೇವಿಸಿದ ಸಮಯ')
      return `ಧನ್ಯವಾದಗಳು. ನನಗೆ ಇನ್ನೂ ${translatedTrailing} ಬೇಕಾಗಿದೆ.`
    }

    const translatedTrailing = trailing
      .replace('both your weight in kilograms and your height in centimeters', 'आपका वजन और लंबाई')
      .replace('your weight in kilograms', 'आपका वजन')
      .replace('your height in centimeters', 'आपकी लंबाई')
      .replace('the number of years of this habit', 'यह आदत कितने वर्षों से है')
      .replace('packs per day', 'रोज़ कितने पैक')
      .replace('the last puff', 'आखिरी कश कब लिया था')
      .replace('the last drink', 'आखिरी बार कब शराब पी थी')
    return `धन्यवाद। मुझे अभी ${translatedTrailing} जानना है।`
  }

  if (text.startsWith('Frontal view camera result: ')) {
    return language === 'ta'
      ? `முன்புற கேமரா முடிவு: ${text.slice('Frontal view camera result: '.length)}`
      : language === 'te'
        ? `ముందు కెమెరా ఫలితం: ${text.slice('Frontal view camera result: '.length)}`
        : language === 'ml'
          ? `മുൻ ക്യാമറ ഫലം: ${text.slice('Frontal view camera result: '.length)}`
          : language === 'kn'
            ? `ಮುಂಭಾಗದ ಕ್ಯಾಮೆರಾ ಫಲಿತಾಂಶ: ${text.slice('Frontal view camera result: '.length)}`
      : `फ्रंटल कैमरा परिणाम: ${text.slice('Frontal view camera result: '.length)}`
  }

  if (text.startsWith('Side-profile view camera result: ')) {
    return language === 'ta'
      ? `பக்கவாட்டு கேமரா முடிவு: ${text.slice('Side-profile view camera result: '.length)}`
      : language === 'te'
        ? `సైడ్ ప్రొఫైల్ కెమెరా ఫలితం: ${text.slice('Side-profile view camera result: '.length)}`
        : language === 'ml'
          ? `സൈഡ്-പ്രൊഫൈൽ ക്യാമറ ഫലം: ${text.slice('Side-profile view camera result: '.length)}`
          : language === 'kn'
            ? `ಸೈಡ್-ಪ್ರೊಫೈಲ್ ಕ್ಯಾಮೆರಾ ಫಲಿತಾಂಶ: ${text.slice('Side-profile view camera result: '.length)}`
      : `साइड प्रोफाइल कैमरा परिणाम: ${text.slice('Side-profile view camera result: '.length)}`
  }

  return null
}

export function uiText(language: AppLanguage) {
  return UI_TEXT[language]
}

export function speechLocale(language: AppLanguage) {
  if (language === 'ta') {
    return 'ta-IN'
  }
  if (language === 'hi') {
    return 'hi-IN'
  }
  if (language === 'te') {
    return 'te-IN'
  }
  if (language === 'ml') {
    return 'ml-IN'
  }
  if (language === 'kn') {
    return 'kn-IN'
  }
  return 'en-IN'
}

export function translateText(text: string, language: AppLanguage): string {
  if (language === 'en' || !text) {
    return text
  }

  if (text.includes('\n')) {
    return text
      .split('\n')
      .map((line) => translateText(line, language))
      .join('\n')
  }

  const direct = TRANSLATIONS[language][text]
  if (direct) {
    return direct
  }

  const dynamic = dynamicTranslation(text, language)
  if (dynamic) {
    return dynamic
  }

  if (text.startsWith('Hospital policy guidance: ')) {
    return language === 'ta'
      ? `மருத்துவமனை கொள்கை வழிகாட்டுதல்: ${text.slice('Hospital policy guidance: '.length)}`
      : language === 'te'
        ? `ఆసుపత్రి సూచనలు: ${text.slice('Hospital policy guidance: '.length)}`
        : language === 'ml'
          ? `ആശുപത്രി മാർഗ്ഗനിർദേശം: ${text.slice('Hospital policy guidance: '.length)}`
          : language === 'kn'
            ? `ಆಸ್ಪತ್ರೆ ಮಾರ್ಗದರ್ಶನ: ${text.slice('Hospital policy guidance: '.length)}`
      : `अस्पताल नीति मार्गदर्शन: ${text.slice('Hospital policy guidance: '.length)}`
  }

  return text
}

export function localizeQuestion(question: QuestionPayload | null, language: AppLanguage): LocalizedQuestion | null {
  if (!question) {
    return null
  }

  const localizedOptions: LocalizedOption[] = question.options.map((option) => ({
    value: option.value,
    label: translateText(option.label, language),
    canonicalLabel: option.label,
  }))

  const text = translateText(question.text, language)
  const helperText = question.helper_text ? translateText(question.helper_text, language) : null
  const promptParts = [text, helperText, ...localizedOptions.map((option) => option.label)].filter(Boolean)

  return {
    text,
    helperText,
    whyText: WHY_HELPERS[language][question.id] ?? null,
    options: localizedOptions,
    promptText: promptParts.join('\n'),
  }
}

export function normalizeAnswerForSubmission(
  question: QuestionPayload | null,
  answerText: string,
  language: AppLanguage,
): string {
  const normalizedText = replaceLocalizedDigits(answerText).trim()
  if (!normalizedText || language === 'en' || !question) {
    return normalizedText
  }

  const token = normalizedToken(normalizedText)
  const languageSet = LANGUAGE_SETS[language]

  if (question.optional && languageSet.skip.has(token)) {
    return 'skip'
  }

  if (question.input_type === 'boolean') {
    if (languageSet.yes.has(token)) {
      return 'Yes'
    }
    if (languageSet.no.has(token)) {
      return 'No'
    }
  }

  if (question.input_type === 'choice') {
    for (const option of question.options) {
      const translatedLabel = normalizedToken(translateText(option.label, language))
      const englishLabel = normalizedToken(option.label)
      const optionValue = normalizedToken(option.value)

      if (token === translatedLabel || token === englishLabel || token === optionValue) {
        return option.label
      }
    }
  }

  return normalizedText
}
