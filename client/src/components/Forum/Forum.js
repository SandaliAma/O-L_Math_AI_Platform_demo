import React, { useState } from 'react';
import { Send, User, MessageSquare, Menu, Plus } from 'lucide-react';
import './SinhalaChatForm.css';

const Forum = ({ user }) => {
  const [message, setMessage] = useState('');
  const [sinhalaEnabled, setSinhalaEnabled] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('si');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'ආයුබෝවන් සංවාදය', date: 'අද', messages: [] }
  ]);
  const [currentChatId, setCurrentChatId] = useState(1);

  const [messages, setMessages] = useState([
    { id: 1, type: 'received', text: 'ආයුබෝවන්! මට ඔබට ගණිත ප්‍රශ්න වලට උදව් කළ හැකිය. ප්‍රශ්නයක් අහන්න!' },
  ]);

  // Function to call Groq backend
  const getGeminiResponse = async (userQuestion) => {
    try {
      setIsLoading(true);
      console.log('📤 Sending question to backend:', userQuestion);

      const res = await fetch('http://localhost:5000/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      console.log('📥 Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || 'Backend Error');
      }

      const data = await res.json();
      console.log('✅ Received answer:', data.answer.substring(0, 100) + '...');
      
      return data.answer;
      
    } catch (err) {
      console.error('❌ Error calling backend:', err);
      
      if (err.message.includes('Failed to fetch')) {
        return '⚠️ සේවාදායකය සම්බන්ධ කළ නොහැක.\n\nකරුණාකර පරුක්ෂා කරන්න:\n1. Backend server එක ධාවනය වේද? (node server.js)\n2. පෝට් 5000 භාවිතයේද?\n3. CORS සක්‍රිය වී ඇද්ද?';
      }
      
      return `⚠️ දෝෂයක්: ${err.message}\n\nකරුණාකර නැවත උත්සාහ කරන්න.`;
      
    } finally {
      setIsLoading(false);
    }
  };

  // Language translations
  const translations = {
    si: {
      title: 'Discussion Forum',
      welcomeMsg: 'ආයුබෝවන්! මට කෙසේ උදව් කළ හැකිද?',
      sinhalaTyping: 'සිංහල ටයිප් කිරීම සක්‍රීයයි',
      englishTyping: 'English Typing',
      yourMessage: 'ඔබගේ පණිවිඩය',
      placeholder: "Type in English, press SPACE to convert (e.g., 'mama ' → 'මම')",
      sendBtn: 'යවන්න',
      newChat: 'නව සංවාදය',
      today: 'අද',
      loading: 'පණිවිඩය යවමින්...'
    },
    en: {
      title: 'Discussion Forum',
      welcomeMsg: 'Hello! How can I help you?',
      sinhalaTyping: 'Sinhala Typing Enabled',
      englishTyping: 'English Typing',
      yourMessage: 'Your Message',
      placeholder: "Type your message here...",
      sendBtn: 'Send',
      newChat: 'New Chat',
      today: 'Today',
      loading: 'Sending message...'
    },
  };

  const t = translations[language];

  const createNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: t.newChat || 'නව සංවාදය',
      date: t.today || 'අද',
      messages: [{ id: 1, type: 'received', text: t.welcomeMsg }]
    };
    setChatHistory([newChat, ...chatHistory]);
    setCurrentChatId(newChatId);
    setMessages([{ id: 1, type: 'received', text: t.welcomeMsg }]);
    setMessage('');
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setMessage('');
    }
  };

  // Sinhala transliteration map
  const sinhalaMap = {
    'a': 'අ', 'aa': 'ආ', 'ae': 'ඇ', 'aae': 'ඈ', 'i': 'ඉ', 'ii': 'ඊ', 'u': 'උ', 'uu': 'ඌ',
    'e': 'එ', 'ee': 'ඒ', 'ai': 'ඓ', 'o': 'ඔ', 'oo': 'ඕ', 'au': 'ඖ',
    'ka': 'ක', 'kaa': 'කා', 'ki': 'කි', 'kii': 'කී', 'ku': 'කු', 'kuu': 'කූ', 'ke': 'කෙ', 'kee': 'කේ', 'ko': 'කො', 'koo': 'කෝ',
    'ga': 'ග', 'gaa': 'ගා', 'gi': 'ගි', 'gii': 'ගී', 'gu': 'ගු', 'guu': 'ගූ', 'ge': 'ගෙ', 'gee': 'ගේ', 'go': 'ගො', 'goo': 'ගෝ',
    'nga': 'ඞ', 'ngaa': 'ඞා', 'ngi': 'ඞි', 'ngii': 'ඞී', 'ngu': 'ඞු', 'nguu': 'ඞූ',
    'ca': 'ච', 'caa': 'චා', 'ci': 'චි', 'cii': 'චී', 'cu': 'චු', 'cuu': 'චූ', 'ce': 'චෙ', 'cee': 'චේ', 'co': 'චො', 'coo': 'චෝ',
    'ja': 'ජ', 'jaa': 'ජා', 'ji': 'ජි', 'jii': 'ජී', 'ju': 'ජු', 'juu': 'ජූ', 'je': 'ජෙ', 'jee': 'ජේ', 'jo': 'ජො', 'joo': 'ජෝ',
    'nya': 'ඤ', 'nyaa': 'ඤා', 'nyi': 'ඤි', 'nyii': 'ඤී', 'nyu': 'ඤු', 'nyuu': 'ඤූ',
    'ta': 'ට', 'taa': 'ටා', 'ti': 'ටි', 'tii': 'ටී', 'tu': 'ටු', 'tuu': 'ටූ', 'te': 'ටෙ', 'tee': 'ටේ', 'to': 'ටො', 'too': 'ටෝ',
    'da': 'ඩ', 'daa': 'ඩා', 'di': 'ඩි', 'dii': 'ඩී', 'du': 'ඩු', 'duu': 'ඩූ', 'de': 'ඩෙ', 'dee': 'ඩේ', 'do': 'ඩො', 'doo': 'ඩෝ',
    'na': 'න', 'naa': 'නා', 'ni': 'නි', 'nii': 'නී', 'nu': 'නු', 'nuu': 'නූ', 'ne': 'නෙ', 'nee': 'නේ', 'no': 'නො', 'noo': 'නෝ',
    'pa': 'ප', 'paa': 'පා', 'pi': 'පි', 'pii': 'පී', 'pu': 'පු', 'puu': 'පූ', 'pe': 'පෙ', 'pee': 'පේ', 'po': 'පො', 'poo': 'පෝ',
    'ba': 'බ', 'baa': 'බා', 'bi': 'බි', 'bii': 'බී', 'bu': 'බු', 'buu': 'බූ', 'be': 'බෙ', 'bee': 'බේ', 'bo': 'බො', 'boo': 'බෝ',
    'ma': 'ම', 'maa': 'මා', 'mi': 'මි', 'mii': 'මී', 'mu': 'මු', 'muu': 'මූ', 'me': 'මෙ', 'mee': 'මේ', 'mo': 'මො', 'moo': 'මෝ',
    'ya': 'ය', 'yaa': 'යා', 'yi': 'යි', 'yii': 'යී', 'yu': 'යු', 'yuu': 'යූ', 'ye': 'යෙ', 'yee': 'යේ', 'yo': 'යො', 'yoo': 'යෝ',
    'ra': 'ර', 'raa': 'රා', 'ri': 'රි', 'rii': 'රී', 'ru': 'රු', 'ruu': 'රූ', 're': 'රෙ', 'ree': 'රේ', 'ro': 'රො', 'roo': 'රෝ',
    'la': 'ල', 'laa': 'ලා', 'li': 'ලි', 'lii': 'ලී', 'lu': 'ලු', 'luu': 'ලූ', 'le': 'ලෙ', 'lee': 'ලේ', 'lo': 'ලො', 'loo': 'ලෝ',
    'va': 'ව', 'vaa': 'වා', 'vi': 'වි', 'vii': 'වී', 'vu': 'වු', 'vuu': 'වූ', 've': 'වෙ', 'vee': 'වේ', 'vo': 'වො', 'voo': 'වෝ',
    'sa': 'ස', 'saa': 'සා', 'si': 'සි', 'sii': 'සී', 'su': 'සු', 'suu': 'සූ', 'se': 'සෙ', 'see': 'සේ', 'so': 'සො', 'soo': 'සෝ',
    'ha': 'හ', 'haa': 'හා', 'hi': 'හි', 'hii': 'හී', 'hu': 'හු', 'huu': 'හූ', 'he': 'හෙ', 'hee': 'හේ', 'ho': 'හො', 'hoo': 'හෝ',
    'tha': 'ත', 'thaa': 'තා', 'thi': 'ති', 'thii': 'තී', 'thu': 'තු', 'thuu': 'තූ', 'the': 'තෙ', 'thee': 'තේ', 'tho': 'තො', 'thoo': 'තෝ',
    'dha': 'ද', 'dhaa': 'දා', 'dhi': 'දි', 'dhii': 'දී', 'dhu': 'දු', 'dhuu': 'දූ', 'dhe': 'දෙ', 'dhee': 'දේ', 'dho': 'දො', 'dhoo': 'දෝ',
    'pha': 'ඵ', 'phaa': 'ඵා', 'phi': 'ඵි', 'phii': 'ඵී', 'phu': 'ඵු', 'phuu': 'ඵූ',
    'bha': 'භ', 'bhaa': 'භා', 'bhi': 'භි', 'bhii': 'භී', 'bhu': 'භු', 'bhuu': 'භූ',
    'k': 'ක්', 'g': 'ග්', 'ng': 'ං', 'c': 'ච්', 'j': 'ජ්', 't': 'ට්', 'd': 'ඩ්', 'n': 'න්',
    'p': 'ප්', 'b': 'බ්', 'm': 'ම්', 'y': 'ය්', 'r': 'ර්', 'l': 'ල්', 'v': 'ව්', 'w': 'ව්',
    's': 'ස්', 'h': 'හ්', 'f': 'ෆ්', 'th': 'ත්', 'dh': 'ද්'
  };

  const convertToSinhala = (text) => {
    if (!sinhalaEnabled) return text;
    
    const words = text.split(' ');
    const convertedWords = words.map((word, index) => {
      if (index === words.length - 1) {
        return word;
      }
      
      let result = '';
      let i = 0;
      
      while (i < word.length) {
        let matched = false;
        
        for (let len = Math.min(4, word.length - i); len > 0; len--) {
          const substr = word.substr(i, len).toLowerCase();
          if (sinhalaMap[substr]) {
            result += sinhalaMap[substr];
            i += len;
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          result += word[i];
          i++;
        }
      }
      
      return result;
    });
    
    return convertedWords.join(' ');
  };

  const handleMessageChange = (e) => {
    const input = e.target.value;
    setMessage(input);
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === ' ' && sinhalaEnabled) {
      const converted = convertToSinhala(message + ' ');
      setMessage(converted);
      e.preventDefault();
    }
  };

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const finalMessage = sinhalaEnabled ? convertToSinhala(message + ' ').trim() : message;
      
      let newMessages = [...messages, { id: Date.now(), type: 'sent', text: finalMessage }];
      setMessages(newMessages);
      setMessage('');
      
      // Get AI response from backend
      const aiResponse = await getGeminiResponse(finalMessage);
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'received',
        text: aiResponse
      };
      
      const messagesWithBot = [...newMessages, botResponse];
      setMessages(messagesWithBot);
      
      // Update chat history
      const updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId ? { 
          ...chat, 
          messages: messagesWithBot, 
          title: finalMessage.substring(0, 30) + '...' 
        } : chat
      );
      setChatHistory(updatedHistory);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-wrapper ${theme}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus className="icon" />
            <span>{t.newChat}</span>
          </button>
        </div>
        
        <div className="chat-list">
          <div className="chat-group">
            <h4>{t.today}</h4>
            {chatHistory.filter(chat => chat.date === (t.today)).map(chat => (
              <div 
                key={chat.id}
                className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                onClick={() => loadChat(chat.id)}
              >
                <MessageSquare className="chat-icon" />
                <span className="chat-title">{chat.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="header-left">
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="icon" />
              </button>
              <h1>{t.title}</h1>
            </div>
            {/* <div className="user-avatar">
              <User className="icon" />
            </div> */}
          </div>
        </div>

        {/* Content Area - Chat Only */}
        <div className="content-area">
          {/* Messages */}
          <div className="messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.type}`}
              >
                <div className={`message-bubble ${msg.type}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper received">
                <div className="message-bubble received">
                  <p>⏳ {t.loading}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="sinhala-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={sinhalaEnabled}
                  onChange={(e) => setSinhalaEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">
                {sinhalaEnabled ? t.sinhalaTyping : t.englishTyping}
              </span>
            </div>
            <div className="input-wrapper">
              <div className="input-group">
                <label>{t.yourMessage}</label>
                <textarea
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={handleTextareaKeyDown}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  rows="2"
                  disabled={isLoading}
                />
              </div>
              <button 
                onClick={handleSend} 
                className="send-button"
                disabled={isLoading || !message.trim()}
              >
                <span>{t.sendBtn}</span>
                <Send className="icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;


