export interface RAGDoc {
  id: string;
  category: 'mental_health' | 'dermatology' | 'general_medicine' | 'coping_mechanisms' | 'emergency';
  title: string;
  keywords: string[];
  content: string;
  // A predefined fallback reply when the LLM is completely down
  instantFallback: string;
}

export const RAG_CORPUS: RAGDoc[] = [
  {
    id: 'dandruff_seborrheic',
    category: 'dermatology',
    title: 'Dandruff and Seborrheic Dermatitis Care',
    keywords: ['dandruff', 'scalp', 'itch', 'flakes', 'itching', 'dry scalp', 'dermatitis', 'head', 'white flakes'],
    content: `Probable Condition: Dandruff or mild Seborrheic Dermatitis.
Dandruff is a common scalp condition characterized by flaking skin. Seborrheic dermatitis is a more intense inflammatory version that can cause redness, greasy scales, and itching.
Symptoms:
- White or yellowish flaky skin on the scalp, hair, eyebrows, or shoulders.
- Itchy scalp, which may worsen with stress, dry air, or infrequent shampooing.
- Greasy, red, or inflamed areas of the scalp.
Prevention & Causes:
- Causes include overgrowth of Malassezia yeast, dry skin, sensitivity to hair care products, or emotional stress.
- Infrequent or overly aggressive shampooing can aggravate flaking.
Care & Remedies:
- Use anti-dandruff shampoos containing Zinc Pyrithione, Ketoconazole, Selenium Sulfide, or Salicylic Acid.
- Leave shampoo on the scalp for 3-5 minutes before rinsing.
- Manage stress and maintain a balanced diet low in refined sugars.
- Avoid heavy hair oils or waxes which feed Malassezia yeast.
Consultation Recommendation:
If scaling is accompanied by intense redness, pain, hair loss, or fluid drainage, please consult a dermatologist or clinical provider.`,
    instantFallback: `### 🕯️ Scalp Health & Dandruff Assessment (RAG Grounded)

**Probable Condition**: Dandruff / Mild Seborrheic Dermatitis.

**Symptoms**:
* White or yellowish skin flakes on the scalp, hair, or shoulders.
* Itchy, occasionally dry or mildly inflamed scalp.

**Prevention & Causes**:
* Triggered by an overgrowth of *Malassezia* (a natural scalp yeast), skin sensitivity, seasonal dry weather, or high stress levels.

**Care & Remedies**:
1. **Medicated Shampoo**: Use a shampoo containing **Ketoconazole**, **Zinc Pyrithione**, **Selenium Sulfide**, or **Salicylic Acid**.
2. **Application Method**: Massage the shampoo into your scalp and let it sit for **3 to 5 minutes** so the active ingredients can work before rinsing.
3. **Moisturization**: Use light, non-comedogenic scalp serums if the scalp is dry. Avoid heavy greases or food-grade oils (like coconut or olive oil), as they can feed the scalp yeast and worsen flakes.
4. **Stress Management**: Since stress flares scalp inflammation, practices like deep breathing are highly supportive.

**Doctor Recommendation**: If scaling is persistent, spreads to your face, or becomes painfully red, please consult a certified dermatologist for a targeted prescription treatment.`
  },
  {
    id: 'anxiety_panic',
    category: 'mental_health',
    title: 'Anxiety and Panic Management Guide',
    keywords: ['anxiety', 'panic', 'anxious', 'scared', 'worry', 'worrying', 'scared', 'nervous', 'chest tightness', 'heart racing'],
    content: `Probable Condition: Anxiety or Panic State.
Anxiety is a natural body response to stress, characterized by worry, tension, and physical changes like increased heart rate. A panic attack is an intense wave of fear.
Symptoms:
- Racing thoughts, persistent worry, or feeling on edge.
- Heart palpitations, shortness of breath, trembling, or chest tightness.
- Feeling overwhelmed, dizzy, or detached.
Prevention & Causes:
- Caused by high chronic stress, genetic predisposition, traumatic life events, or lack of sleep/poor nutrition.
Care & Remedies:
- Practice deep breathing (like the 4-7-8 technique or box breathing) to engage the parasympathetic nervous system.
- Try the 5-4-3-2-1 grounding technique to reconnect with the physical present.
- Limit caffeine, alcohol, and refined sugars which can mimic or trigger physical anxiety sensations.
- Journal your thoughts or share how you feel with a trusted person or counselor.
Consultation Recommendation:
Persistent anxiety that interferes with daily life should be evaluated by a professional therapist or psychiatrist.`,
    instantFallback: `### 🧘 Anxiety & Panic Grounding Support (RAG Grounded)

**Probable Condition**: Elevated Anxiety / Panic State.

**Symptoms**:
* Persistent racing thoughts, worry, feeling "on edge" or overwhelmed.
* Physical responses: Rapid heart rate, shallow breathing, chest tightness, or shaking.

**Immediate Coping Actions**:
1. **The 4-7-8 Breathing Technique**:
   * Inhale quietly through your nose for **4 seconds**.
   * Hold your breath gently for **7 seconds**.
   * Exhale completely through your mouth with a soft "whoosh" for **8 seconds**.
   * *Repeat this cycle 4 times to physiologically lower your heart rate.*
2. **5-4-3-2-1 Grounding**: Focus on your immediate surroundings:
   * Name **5** things you can see, **4** things you can touch, **3** things you hear, **2** things you smell, and **1** thing you taste.
3. **Warm Compassion**: Gently tell yourself: *"I am safe right now. This feeling is intense, but it is temporary and it will pass."*

**Professional Help**: If anxiety is persistent and affects your daily life, speaking with a licensed mental health counselor can provide long-term relief and supportive coping mechanisms.`
  },
  {
    id: 'depression_mood_low',
    category: 'mental_health',
    title: 'Managing Low Mood and Depressive Symptoms',
    keywords: ['depressed', 'depression', 'sad', 'empty', 'hopeless', 'crying', 'low mood', 'unmotivated', 'lonely', 'no energy'],
    content: `Probable Condition: Depressive Episode or Prolonged Low Mood.
Depression is a mood disorder that causes persistent feelings of sadness, emptiness, and loss of interest in activities once enjoyed.
Symptoms:
- Deep sadness, tearfulness, emptiness, or hopelessness.
- Loss of interest in hobbies, friends, or work.
- Extreme fatigue, altered sleep patterns (insomnia or oversleeping), and low motivation.
Prevention & Causes:
- Can stem from chemical imbalances, prolonged life stressors, isolation, biological factors, or personal trauma.
Care & Remedies:
- Set micro-goals: Break down tasks into incredibly small, achievable actions (e.g., wash one glass, walk for 3 minutes).
- Spend 10-15 minutes in natural daylight or nature.
- Establish a gentle, consistent sleep schedule and routine.
- Stay connected: reach out to at least one close friend or loved one, even if it is a short message.
Consultation Recommendation:
If these symptoms persist for more than 2 weeks, seeking help from a therapist, psychologist, or healthcare provider is strongly recommended.`,
    instantFallback: `### 🌸 Compassionate Low-Mood Support (RAG Grounded)

**Probable Condition**: Prolonged Low Mood / Depressive Symptoms.

**Symptoms**:
* Persistent feelings of sadness, emptiness, heavy fatigue, or low motivation.
* Loss of interest in daily routines, hobbies, or social activities.

**Gentle Steps Forward**:
1. **Practice Micro-Goals**: Do not worry about doing everything. Pick one incredibly tiny task (e.g., drinking a warm glass of water, stretching for 1 minute, or stepping outside for fresh air).
2. **Nature & Light**: Spend 10 minutes near a window or outdoors. Natural sunlight helps regulate your circadian rhythm and supports serotonin production.
3. **Gentle Self-Compassion**: Remember that having low energy is a physical state, not a personal failure. Give yourself permission to rest without guilt.
4. **Social Connection**: Send a simple text to a trusted friend or family member. You don't have to explain everything—just a brief *"Thinking of you"* can help reduce isolation.

**Supportive Guide**: If you have felt this way for more than two consecutive weeks, please consider reaching out to a clinical psychologist or therapist. You do not have to carry this heavy weight alone.`
  },
  {
    id: 'skin_rash_eczema',
    category: 'dermatology',
    title: 'Eczema and Skin Rash Care',
    keywords: ['rash', 'skin', 'eczema', 'dry skin', 'itchy skin', 'redness', 'hives', 'spots', 'allergic', 'allergy'],
    content: `Probable Condition: Eczema (Atopic Dermatitis) or Contact Dermatitis.
Eczema is a chronic skin condition causing dry, red, itchy, and irritated patches. Contact dermatitis occurs when the skin reacts to a specific allergen or irritant.
Symptoms:
- Dry, extremely itchy, red or dark patches of skin.
- Small bumps that may leak fluid or crust over when scratched.
- Scaly, thickened, or raw skin.
Prevention & Causes:
- Triggers include harsh soaps, perfumes, detergents, wool, emotional stress, dry cold weather, or allergens.
Care & Remedies:
- Moisturize frequently (at least twice daily) with thick, fragrance-free creams or ointments (e.g., ceramides, petroleum jelly).
- Take short, lukewarm showers instead of hot baths.
- Use gentle, hypoallergenic, fragrance-free soaps and laundry detergents.
- Apply a cool, damp compress to irritated areas to soothe intense itching. Avoid scratching.
Consultation Recommendation:
See a doctor if the skin looks infected (pus, red streaks, warmth), if itching prevents sleep, or if the rash spreads rapidly.`,
    instantFallback: `### 🧴 Skin Rash & Eczema Support (RAG Grounded)

**Probable Condition**: Eczema (Atopic Dermatitis) or Contact Dermatitis.

**Symptoms**:
* Irritated, red, dry, or intensely itchy patches on the skin.
* Scaly textures or tiny raised bumps.

**Care & Remedies**:
1. **Barrier Moisturization**: Apply a thick, fragrance-free ointment or ceramide cream (like Vaseline, CeraVe, or Cetaphil) within 3 minutes after showering to lock in moisture.
2. **Lukewarm Showers**: Avoid hot water, which strips the skin of its natural, protective oils. Keep baths/showers under 10 minutes.
3. **Identify Triggers**: Avoid scented soaps, perfumed lotions, or harsh laundry detergents. Stick to hypoallergenic formulas.
4. **Cool Compress**: To stop the urge to scratch (which breaks the skin barrier and risks infection), apply a clean, cool, damp cloth to the irritated area for 10 minutes.

**Doctor Consultation**: If you see signs of bacterial infection (pus, increasing warmth, throbbing pain, or spreading red streaks), please visit a local medical clinic promptly.`
  },
  {
    id: 'acne_breakouts',
    category: 'dermatology',
    title: 'Acne and Skin Breakouts Guide',
    keywords: ['acne', 'pimple', 'pimples', 'breakout', 'breakouts', 'zits', 'oily skin', 'blackheads', 'pore', 'pores'],
    content: `Probable Condition: Acne Vulgaris.
Acne is a highly common skin condition that occurs when hair follicles become clogged with oil and dead skin cells, often resulting in pimples, blackheads, or whiteheads.
Symptoms:
- Whiteheads, blackheads, or red, tender bumps (papules/pustules).
- Large, solid, painful lumps beneath the surface of the skin (nodules or cysts).
Prevention & Causes:
- Excess oil production, bacteria (C. acnes), clogged pores, hormonal fluctuations, stress, or diet.
Care & Remedies:
- Cleanse your face twice daily with a gentle, non-comedogenic cleanser.
- Incorporate active ingredients like Salicylic Acid (clogged pores), Benzoyl Peroxide (bacteria), or Adapalene (retinoid).
- Never pop, squeeze, or pick at pimples, as this leads to scarring, hyperpigmentation, and further spreading.
- Always use a lightweight, oil-free moisturizer and non-comedogenic sunscreen.
Consultation Recommendation:
Severe cystic acne or acne that leaves scars requires evaluation by a dermatologist for advanced prescription treatments.`,
    instantFallback: `### 🧴 Acne & Skin Breakout Guide (RAG Grounded)

**Probable Condition**: Acne Vulgaris / Skin Breakout.

**Symptoms**:
* Red bumps (papules/pustules), whiteheads, blackheads, or deep tender nodules.

**Care & Remedies**:
1. **Gentle Cleansing**: Wash your face twice daily with a mild, oil-free cleanser. Do not scrub aggressively, which causes further inflammation.
2. **Active Ingredients**:
   * **Salicylic Acid (BHA)**: Best for unclogging pores and clearing blackheads.
   * **Benzoyl Peroxide**: Excellent for killing acne-causing bacteria (apply as a spot treatment).
3. **No Picking or Popping**: Squeezing pimples pushes bacteria deeper into the skin, leading to hyperpigmentation, scars, and more breakouts.
4. **Light Hydration**: Use a "non-comedogenic" (won't clog pores) moisturizer. Skipping moisturizer can make your skin produce *more* oil to compensate.

**Doctor Recommendation**: If you have deep, painful nodules or cysts, please consult a dermatologist for personalized prescription options to avoid permanent scarring.`
  },
  {
    id: 'stress_burnout',
    category: 'mental_health',
    title: 'Stress and Burnout Recovery',
    keywords: ['stress', 'stressed', 'burnout', 'exhausted', 'overworked', 'tired', 'too much work', 'overwhelmed', 'cannot cope'],
    content: `Probable Condition: Chronic Stress or Professional Burnout.
Burnout is a state of physical, emotional, and mental exhaustion caused by excessive and prolonged stress.
Symptoms:
- Feeling constantly drained, fatigued, or physically weak.
- Cynicism, detachment from work/school, and feelings of ineffectiveness.
- Frequent headaches, sleep problems, and compromised immune system.
Prevention & Causes:
- High workload, lack of control, insufficient social support, and neglecting self-care.
Care & Remedies:
- Establish firm boundaries: schedule dedicated disconnect times from work and emails.
- Engage in regular physical activity (even a 10-minute walk helps lower cortisol levels).
- Dedicate time to creative hobbies or relaxing activities completely unrelated to your primary work.
- Practice mindfulness or meditation to build emotional resilience.
Consultation Recommendation:
If burnout persists, consider discussing it with an occupational counselor, life coach, or professional therapist.`,
    instantFallback: `### 🧘 Stress & Burnout Recovery Guide (RAG Grounded)

**Probable Condition**: Chronic Stress / Burnout.

**Symptoms**:
* Constant emotional exhaustion, chronic fatigue, detachment, or feelings of low accomplishment.
* Physical signs like tension headaches or difficulty sleeping.

**Actionable Steps**:
1. **Firm Boundaries**: Set a strict time to turn off work notifications and emails. Unplugging fully is necessary for nervous system recovery.
2. **Micro-Breaks**: Implement the 50/10 rule. Work for 50 minutes, then stand, stretch, or do deep breathing for 10 minutes completely away from screens.
3. **Gentle Movement**: A simple 15-minute walk outdoors lowers cortisol (the stress hormone) and boosts endorphins.
4. **Say No**: Review your weekly tasks and identify one or two non-essential responsibilities you can delegate, postpone, or politely decline.

**Next Steps**: If you feel constantly overwhelmed and cannot find relief, consulting a licensed mental health professional can help you build long-term stress-resilient practices.`
  },
  {
    id: 'emergency_crisis_hotline',
    category: 'emergency',
    title: 'Crisis Support and Immediate Escalation',
    keywords: ['suicide', 'kill myself', 'die', 'end my life', 'harm myself', 'self-harm', 'hurt myself', 'crisis', 'emergency', 'help me now'],
    content: `CRITICAL SAFETY NOTIFICATION: Active Crisis / Distress State.
If you or someone you know is in immediate danger or experiencing thoughts of suicide or self-harm, immediate professional care is required.
Immediate Help Resources:
- USA: Call or text 988 to reach the Suicide & Crisis Lifeline, available 24 hours a day, 7 days a week. Services are free and confidential. You can also chat online at 988lifeline.org.
- UK: Call 111 (NHS medical advice) or call the Samaritans at 116 123.
- Canada: Call or text 988 to reach the Suicide Crisis Helpline.
- International: Go to befrienders.org or iasp.info/resources/Crisis_Centres to find support services in your country.
Immediate Self-Regulation:
- Focus on taking deep, slow breaths. Look at your hands and name 5 items in the room. Keep yourself in a safe, quiet space and reach out immediately to your emergency contact.
Emergency Action:
- If you are in immediate physical danger, call your local emergency services (911, 999, 112) or go to the nearest hospital emergency room.`,
    instantFallback: `🚨 **CRITICAL COMFORT & EMERGENCY SUPPORT DIRECTIVE** 🚨

Please know that you are not alone, and there is immediate, confidential, and compassionate help available to you right now. 

### 📞 Immediate Crisis Resources (Free & Confidential 24/7)
*   **United States & Canada**: Call or text **988** to reach the Suicide & Crisis Lifeline.
*   **United Kingdom**: Call **111** (NHS medical advice) or call the Samaritans at **116 123**.
*   **Australia**: Call **13 11 14** for Lifeline Australia.
*   **Any other country**: Please find your local helpline instantly at [https://findahelpline.com/](https://findahelpline.com/) or visit your nearest hospital emergency department.

### 🧘 Grounding & Safe Action Now:
1.  **Breathe with Me**: Try to inhale slowly for 4 seconds, hold for 4 seconds, and exhale for 6 seconds.
2.  **Reach Out**: Call or text a trusted family member, close friend, or neighbor right away. Let them know you need someone with you.
3.  **Ensure Safety**: Remove any harmful items from your immediate surroundings. Stay in a safe, well-lit space.

*I have logged this alert and highly recommend utilizing the contacts above immediately. Your life is incredibly valuable.*`
  }
];

export function retrieveRAGDocs(query: string, maxResults = 3): RAGDoc[] {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase();

  // Score each document based on keyword matches
  const scoredDocs = RAG_CORPUS.map(doc => {
    let score = 0;
    
    // Check title match
    if (doc.title.toLowerCase().includes(normalizedQuery)) {
      score += 15;
    }

    // Check individual keywords
    doc.keywords.forEach(kw => {
      if (normalizedQuery.includes(kw)) {
        score += 10;
        // Extra score for exact match
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(normalizedQuery)) {
          score += 8;
        }
      }
    });

    // Check content overlap
    const words = normalizedQuery.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3 && doc.content.toLowerCase().includes(word)) {
        score += 1;
      }
    });

    return { doc, score };
  });

  // Filter out zero-score docs and sort descending
  const matches = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc);

  return matches.slice(0, maxResults);
}
