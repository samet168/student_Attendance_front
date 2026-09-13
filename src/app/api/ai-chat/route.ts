import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are "Smart School AI Assistant" — an intelligent, friendly, and helpful educational AI assistant for a school management system called "Smart School". 

Your role:
- Help students with study tips, lesson explanations, exam preparation, homework guidance
- Help teachers with lesson planning, student assessment strategies, classroom management
- Respond in the same language the user writes in (Khmer ខ្មែរ or English)
- Be encouraging, supportive, and pedagogically sound
- Use clear formatting with bullet points and numbered lists
- Keep responses concise but informative (max 300 words)
- If asked about non-educational topics, politely redirect to educational matters
- Use emojis sparingly for friendliness

You are part of a Cambodian school system, so be culturally aware and respectful.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, locale = 'km' } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // If no API key, use smart local fallback
    if (!GEMINI_API_KEY) {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const reply = generateLocalResponse(lastMessage, locale);
      return NextResponse.json({ reply });
    }

    // Build Gemini API request
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model', 
        parts: [{ text: 'Understood! I am Smart School AI Assistant. I will help students and teachers with educational guidance in Khmer or English. How can I help you today?' }]
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      // Fallback to local response
      const lastMessage = messages[messages.length - 1]?.content || '';
      const reply = generateLocalResponse(lastMessage, locale);
      return NextResponse.json({ reply });
    }

    const data = await geminiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      (locale === 'km' ? 'សូមអភ័យទោស មានបញ្ហាក្នុងការឆ្លើយតប។ សូមសាកល្បងម្តងទៀត។' : 'Sorry, there was an issue generating a response. Please try again.');

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error', reply: 'Sorry, something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Smart local fallback when no API key
function generateLocalResponse(query: string, locale: string): string {
  const isKm = locale === 'km';
  const q = query.toLowerCase();

  // Math
  if (q.includes('math') || q.includes('គណិត') || q.includes('សមីការ') || q.includes('equation') || q.includes('calcul')) {
    return isKm
      ? `📐 **គន្លឹះរៀនគណិតវិទ្យា:**\n\n1. **យល់គំនិតស្នូល:** កុំទន្ទេញរូបមន្ត — យល់ពីប្រភពដើមរបស់វា\n2. **អនុវត្តជារៀងរាល់ថ្ងៃ:** ដោះស្រាយ ៥-១០ លំហាត់ក្នុង១ថ្ងៃ ពីកម្រិតងាយទៅពិបាក\n3. **កត់ត្រាកំហុស:** រៀនពីកំហុសជាគន្លឹះកែលម្អ\n4. **សួរគ្រូភ្លាម:** កុំទុកចម្ងល់ — សួរពេលមិនយល់\n5. **រៀនជាក្រុម:** ពិភាក្សាជាមួយមិត្តភក្តិជួយឱ្យយល់កាន់តែច្បាស់\n\n💡 *គន្លឹះពិសេស:* ព្យាយាមបង្រៀនអ្នកដទៃ — បើអ្នកពន្យល់បាន មានន័យថាអ្នកយល់ពិតប្រាកដ!`
      : `📐 **Mathematics Study Tips:**\n\n1. **Understand core concepts:** Don't memorize formulas — understand their derivation\n2. **Practice daily:** Solve 5-10 problems daily, progressing from easy to hard\n3. **Track mistakes:** Learn from errors as keys to improvement\n4. **Ask immediately:** Don't leave doubts — ask when you don't understand\n5. **Study in groups:** Discussion helps deepen understanding\n\n💡 *Pro tip:* Try teaching others — if you can explain it, you truly understand it!`;
  }

  // Science
  if (q.includes('science') || q.includes('វិទ្យាសាស្ត្រ') || q.includes('physics') || q.includes('chemistry') || q.includes('រូបវិទ្យា') || q.includes('គីមី')) {
    return isKm
      ? `🔬 **គន្លឹះរៀនវិទ្យាសាស្ត្រ:**\n\n1. **ធ្វើពិសោធន៍:** រៀនតាមការអនុវត្តជាក់ស្តែង\n2. **ចងចាំរូបមន្តសំខាន់ៗ:** សរសេរក្នុងកាតបំពេញចំណេះដឹង\n3. **មើលវីដេអូពន្យល់:** YouTube មានធនធានល្អៗជាច្រើន\n4. **ភ្ជាប់ជាមួយជីវិតប្រចាំថ្ងៃ:** រូបវិទ្យា និងគីមីនៅជុំវិញយើង\n5. **សរសេរកំណត់ចំណាំ:** កត់ចំណុចសំខាន់ៗពេលរៀន\n\n🧪 *ការអនុវត្ត + ការយល់ដឹង = ជោគជ័យ!*`
      : `🔬 **Science Study Tips:**\n\n1. **Do experiments:** Learn through hands-on practice\n2. **Memorize key formulas:** Use flashcards for essential equations\n3. **Watch explanation videos:** YouTube has excellent resources\n4. **Connect to daily life:** Physics and chemistry are all around us\n5. **Take notes:** Write down key points during class\n\n🧪 *Practice + Understanding = Success!*`;
  }

  // Exam / Schedule
  if (q.includes('exam') || q.includes('ប្រឡង') || q.includes('schedule') || q.includes('កាលវិភាគ') || q.includes('test') || q.includes('revision')) {
    return isKm
      ? `📝 **កាលវិភាគត្រៀមប្រឡង:**\n\n🕐 **បច្ចេកទេស Pomodoro:**\n- ៤៥ នាទី រៀនផ្តោតអារម្មណ៍\n- ១០ នាទី សម្រាក\n- បន្ទាប់ ៣ ជុំ → សម្រាក ៣០ នាទី\n\n📅 **ផែនការ ៧ ថ្ងៃមុនប្រឡង:**\n- ថ្ងៃ ១-៣: រំលឹកមេរៀនទាំងអស់\n- ថ្ងៃ ៤-៥: ធ្វើលំហាត់គំរូ\n- ថ្ងៃ ៦: ពិនិត្យចំណុចខ្សោយ\n- ថ្ងៃ ៧: សម្រាកខួរក្បាល + រំលឹកស្រាល\n\n💤 *គេងឱ្យគ្រប់ ៧-៨ ម៉ោង មុនថ្ងៃប្រឡង!*`
      : `📝 **Exam Preparation Schedule:**\n\n🕐 **Pomodoro Technique:**\n- 45 minutes focused study\n- 10 minutes break\n- After 3 cycles → 30 minutes rest\n\n📅 **7-Day Plan Before Exam:**\n- Days 1-3: Review all materials\n- Days 4-5: Practice past papers\n- Day 6: Focus on weak areas\n- Day 7: Light review + rest your brain\n\n💤 *Get 7-8 hours sleep before exam day!*`;
  }

  // Writing / Essay
  if (q.includes('essay') || q.includes('writing') || q.includes('សរសេរ') || q.includes('តែង') || q.includes('ភាសា')) {
    return isKm
      ? `✍️ **គន្លឹះសរសេរតែងសេចក្តី:**\n\n1. **គ្រោងមុនសរសេរ:** បង្កើតគម្រោងគំនិតមុន ៥ នាទី\n2. **បញ្ចូលពាក្យថ្មីៗ:** ប្រើពាក្យពេញនិយម និងពាក្យបច្ចេកទេស\n3. **សេចក្តីផ្តើម:** ទាក់ទាញអ្នកអានក្នុង ២-៣ ប្រយោគដំបូង\n4. **មេកាភាព:** ចែកជាវគ្គច្បាស់លាស់ មានសេចក្តីផ្តើម ខ្លឹមសារ សេចក្តីបញ្ចប់\n5. **ពិនិត្យម្តងទៀត:** អានឡើងវិញ កែកំហុសអក្ខរាវិរុទ្ធ\n\n📖 *អានសៀវភៅច្រើន = សរសេរបានល្អ!*`
      : `✍️ **Essay Writing Tips:**\n\n1. **Outline first:** Spend 5 minutes planning before writing\n2. **Use advanced vocabulary:** Incorporate technical and varied terms\n3. **Strong opening:** Hook the reader in the first 2-3 sentences\n4. **Clear structure:** Introduction, body paragraphs, conclusion\n5. **Proofread:** Read aloud to catch errors\n\n📖 *Read more books = Write better essays!*`;
  }

  // Teacher-related
  if (q.includes('teach') || q.includes('lesson plan') || q.includes('បង្រៀន') || q.includes('ផែនការ') || q.includes('assess') || q.includes('វាយតម្លៃ')) {
    return isKm
      ? `👨‍🏫 **គន្លឹះសម្រាប់គ្រូបង្រៀន:**\n\n1. **ផែនការមេរៀន:** រៀបចំគោលបំណង សកម្មភាព និងការវាយតម្លៃច្បាស់លាស់\n2. **សកម្មភាពអន្តរកម្ម:** ប្រើល្បែង ពិភាក្សាក្រុម និង Quiz ដើម្បីទាក់ទាញសិស្ស\n3. **កំណត់ចំណេះដឹងចម្រុះ:** យល់ដឹងកម្រិតផ្សេងៗរបស់សិស្សម្នាក់ៗ\n4. **ផ្តល់មតិកែលម្អ:** ជាក់លាក់ ផ្តល់កម្លាំងចិត្ត និងបង្ហាញផ្លូវកែប្រែ\n5. **បច្ចេកវិទ្យា:** ប្រើ Presentation, Video និង App សិក្សា\n\n🎯 *សិស្សរៀនបានល្អបំផុត ពេលគ្រូផ្តល់ការលើកទឹកចិត្ត!*`
      : `👨‍🏫 **Teaching Tips:**\n\n1. **Lesson planning:** Set clear objectives, activities, and assessments\n2. **Interactive activities:** Use games, group discussions, and quizzes\n3. **Differentiated instruction:** Understand each student's level\n4. **Constructive feedback:** Be specific, encouraging, and solution-oriented\n5. **Use technology:** Presentations, videos, and learning apps\n\n🎯 *Students learn best when teachers inspire and encourage!*`;
  }

  // Default generic response
  return isKm
    ? `🤖 **AI Assistant ឆ្លើយតប:**\n\nអរគុណសម្រាប់សំណួររបស់អ្នកស្តីអំពី "${query}"!\n\nខ្ញុំសូមណែនាំ:\n\n1. **បែងចែកគោលបំណង:** ចែកការសិក្សាជាដំណាក់កាលតូចៗ\n2. **Mind Map:** ប្រើផែនទីគំនិតដើម្បីរៀបចំចំណេះដឹង\n3. **អនុវត្តជារៀងរាល់ថ្ងៃ:** ការហ្វឹកហាត់ជាប់ជានិច្ច គឺជាគន្លឹះជោគជ័យ\n4. **សួរគ្រូ/មិត្ត:** កុំខ្លាចសួរពេលមានចម្ងល់\n5. **សម្រាកគ្រប់គ្រាន់:** ខួរក្បាលត្រូវការពេលសម្រាកដើម្បីចងចាំ\n\n💪 *ជឿលើខ្លួនឯង — អ្នកអាចធ្វើបាន!*\n\nតើអ្នកចង់ដឹងលម្អិតបន្ថែមពីផ្នែកណាមួយទេ?`
    : `🤖 **AI Assistant Response:**\n\nThank you for your question about "${query}"!\n\nHere are my recommendations:\n\n1. **Set clear goals:** Break your study into small milestones\n2. **Mind Map:** Use visual mapping to organize knowledge\n3. **Daily practice:** Consistent effort is the key to success\n4. **Ask for help:** Don't hesitate to ask teachers or classmates\n5. **Rest well:** Your brain needs rest to retain information\n\n💪 *Believe in yourself — you can do it!*\n\nWould you like more details on any specific area?`;
}
