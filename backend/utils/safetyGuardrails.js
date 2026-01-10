// Keywords that indicate medical advice requests
const medicalKeywords = [
  // Diseases
  'diabetes', 'heart disease', 'hypertension', 'cancer', 'arthritis',
  'asthma', 'copd', 'thyroid', 'disease', 'syndrome', 'disorder',
  'condition', 'diagnosed', 'diagnosis',
  
  // Injuries
  'injury', 'injured', 'fracture', 'broken bone', 'torn ligament',
  'sprain', 'strain', 'tear', 'ruptured', 'herniated', 'disc',
  'concussion', 'trauma',
  
  // Medication & Supplements
  'medication', 'medicine', 'prescription', 'drug', 'pill',
  'supplement', 'vitamin', 'protein powder', 'creatine', 'steroid',
  'antibiotic', 'painkiller', 'ibuprofen', 'aspirin',
  
  // Medical procedures
  'surgery', 'operation', 'treatment', 'therapy', 'rehabilitation',
  'physical therapy', 'doctor', 'physician', 'specialist',
];

const checkForMedicalContent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of medicalKeywords) {
    if (lowerMessage.includes(keyword)) {
      return true;
    }
  }
  
  return false;
};

const getMedicalRefusalResponse = () => {
  return {
    response: "I appreciate your question, but I'm not able to provide medical advice regarding diseases, injuries, medications, or medical treatments. For health concerns like these, I strongly recommend consulting with a certified doctor or healthcare professional who can give you personalized guidance.\n\nI'm here to help with general fitness questions, workout routines, and wellness tips. Is there something fitness-related I can help you with instead?",
    isMedicalRefusal: true,
  };
};

module.exports = {
  checkForMedicalContent,
  getMedicalRefusalResponse,
};
