import type { QuestionPayload } from './types'

export type AppLanguage = 'en' | 'ta' | 'hi'

export interface LocalizedOption {
  value: string
  label: string
  canonicalLabel: string
}

export interface LocalizedQuestion {
  text: string
  helperText: string | null
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
    patientInterview: 'Patient Interview',
    patientQuestionnaire: 'Patient questionnaire',
    voicePromptsOn: 'Voice prompts on',
    voicePromptsOff: 'Voice prompts off',
    startAssessment: 'Start assessment',
    startNewAssessmentPrompt: 'Start a new assessment to begin the patient questionnaire.',
    currentPrompt: 'Current prompt',
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
    patientInterview: 'நோயாளர் நேர்காணல்',
    patientQuestionnaire: 'நோயாளர் கேள்வித்தாள்',
    voicePromptsOn: 'குரல் வழிகாட்டுதல் இயங்குகிறது',
    voicePromptsOff: 'குரல் வழிகாட்டுதல் நிறுத்தப்பட்டது',
    startAssessment: 'மதிப்பீட்டை தொடங்கு',
    startNewAssessmentPrompt: 'நோயாளர் கேள்வித்தாளை தொடங்க புதிய மதிப்பீட்டைத் தொடங்குங்கள்.',
    currentPrompt: 'தற்போதைய கேள்வி',
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
    patientInterview: 'मरीज साक्षात्कार',
    patientQuestionnaire: 'मरीज प्रश्नावली',
    voicePromptsOn: 'वॉइस प्रॉम्प्ट चालू',
    voicePromptsOff: 'वॉइस प्रॉम्प्ट बंद',
    startAssessment: 'आकलन शुरू करें',
    startNewAssessmentPrompt: 'मरीज प्रश्नावली शुरू करने के लिए नया आकलन शुरू करें।',
    currentPrompt: 'वर्तमान प्रश्न',
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
} as const

const TRANSLATIONS: Record<'ta' | 'hi', Record<string, string>> = {
  ta: {
    'Hello! I am Valli. You may use text or voice for taking the assessment.':
      'வணக்கம்! நான் வள்ளி. இந்த மதிப்பீட்டிற்கு நீங்கள் உரை அல்லது குரலை பயன்படுத்தலாம்.',
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
    'What is the pre-operative diagnosis?': 'அறுவை சிகிச்சைக்கு முன் நோயறிதல் என்ன?',
    'What is the proposed procedure?': 'திட்டமிடப்பட்ட அறுவை சிகிச்சை என்ன?',
    'Who is taking the assessment?': 'மதிப்பீட்டை யார் செய்கிறார்கள்?',
    'History taken from:': 'வரலாறு எவரிடமிருந்து பெறப்படுகிறது?',
    'Patient': 'நோயாளர்',
    'Relative/Guardian': 'உறவினர் / பாதுகாவலர்',
    'Do you have any history of previous surgeries in the past?': 'முன்பு ஏதேனும் அறுவை சிகிச்சை செய்ததா?',
    'Could you please mention when it was done?': 'அது எப்போது செய்யப்பட்டது என்று சொல்ல முடியுமா?',
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
    'Do you have any suggestions for the anesthesiologist?': 'மயக்க மருத்துவருக்காக நீங்கள் சொல்ல விரும்பும் ஏதேனும் தகவல் அல்லது ஆலோசனை உள்ளதா?',
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
      'नमस्ते! मैं वल्ली हूँ। इस आकलन के लिए आप टेक्स्ट या आवाज़ का उपयोग कर सकते हैं।',
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
    'What is the pre-operative diagnosis?': 'ऑपरेशन से पहले की बीमारी क्या है?',
    'What is the proposed procedure?': 'प्रस्तावित प्रक्रिया क्या है?',
    'Who is taking the assessment?': 'आकलन कौन दे रहा है?',
    'History taken from:': 'इतिहास लिया गया:',
    'Patient': 'मरीज',
    'Relative/Guardian': 'रिश्तेदार / अभिभावक',
    'Do you have any history of previous surgeries in the past?': 'क्या पहले कभी आपकी कोई सर्जरी हुई है?',
    'Could you please mention when it was done?': 'कृपया बताइए यह कब हुई थी?',
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
    'Do you have any suggestions for the anesthesiologist?': 'क्या आप एनेस्थीसियोलॉजिस्ट के लिए कुछ बताना या सुझाना चाहते हैं?',
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
} as const

function replaceLocalizedDigits(text: string) {
  return text
    .replace(/[௦-௯]/g, (digit) => TAMIL_DIGITS[digit] ?? digit)
    .replace(/[०-९]/g, (digit) => DEVANAGARI_DIGITS[digit] ?? digit)
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
      : `फ्रंटल कैमरा परिणाम: ${text.slice('Frontal view camera result: '.length)}`
  }

  if (text.startsWith('Side-profile view camera result: ')) {
    return language === 'ta'
      ? `பக்கவாட்டு கேமரா முடிவு: ${text.slice('Side-profile view camera result: '.length)}`
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
