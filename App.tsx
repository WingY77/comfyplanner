import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, 
  Plus, 
  Trash2, 
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Globe,
  Pencil,
  Save,
  MoreVertical,
  Heart
} from 'lucide-react';

// --- Types ---

type Language = 'en' | 'zh';
type TabType = 'todo' | 'ideas';
type IdeaCategoryKey = 'life' | 'work' | 'art' | 'random';
type CalendarViewMode = 'month' | 'week' | 'day';

interface Todo {
  id: string;
  content: string;
  isDone: boolean;
  rotation: number;
  createdAt: number;
}

interface Idea {
  id: string;
  title: string;
  category: IdeaCategoryKey;
  content: string;
  createdAt: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO String YYYY-MM-DD
  startHour: number; // 8 to 22
  duration: number; // in hours
  color: string;
  description: string;
}

interface IdentityGoal {
  id: string;
  title: string;
  progress: number;
  deadline?: string; // ISO Date YYYY-MM-DD
}

interface IdentitySection {
  id: string;
  title: string;
  goals: IdentityGoal[];
}

interface ChatMessage {
  sender: 'user' | 'cat';
  text: string;
}

// --- Global Constants & Translations ---

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

// MACARON PALETTE (Pastel Colors)
const EVENT_COLORS = [
  '#FECACA', // Macaron Pink (red-200)
  '#FED7AA', // Macaron Peach (orange-200)
  '#FEF08A', // Macaron Lemon (yellow-200)
  '#BBF7D0', // Macaron Mint (green-200)
  '#BFDBFE', // Macaron Sky (blue-200)
  '#E9D5FF'  // Macaron Lavender (purple-200)
];

const CATEGORY_KEYS: IdeaCategoryKey[] = ['life', 'work', 'art', 'random'];

const CATEGORY_COLORS: Record<IdeaCategoryKey, string> = {
  life: '#BBF7D0', // Mint
  work: '#BFDBFE', // Sky
  art: '#FECACA',  // Pink
  random: '#FEF08A' // Lemon
};

// SOFT TSUNDERE PERSONA TRANSLATIONS
const TRANSLATIONS = {
  en: {
    appTitle: "Cozy Corner",
    todoTab: "Quick Notes", // Updated
    ideasTab: "Inspiration",
    todoInputPlaceholder: "New task...",
    noTodos: "Looks quite empty today ~",
    ideaTitlePlaceholder: "Idea Title...",
    ideaContentPlaceholder: "Describe it...",
    listening: "Listening...",
    voiceNotSupported: "Browser does not support Voice API",
    saveIdea: "Save Idea",
    noIdeas: "No ideas yet...",
    categories: {
      life: "Life",
      work: "Work",
      art: "Art",
      random: "Random"
    },
    newEvent: "New Event",
    editEvent: "Edit Event",
    title: "Title",
    date: "Date",
    startTime: "Start Time",
    duration: "Duration (h)",
    notes: "Notes / Details",
    color: "Color",
    delete: "Delete",
    saveChanges: "Save Changes",
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    dragHint: "Drag to move • Double click to add • Click to edit",
    identityTitle: "I want to be...",
    identityPlaceholder: "a Pro Chef",
    addSection: "Add New Domain",
    newSection: "New Domain",
    newGoal: "New Goal",
    
    // Naming System
    defaultCatName: "Momo",
    nameReaction: "You want to call me {name}? Fine, I like it!",
    
    catIntro: "Yawn... oh, you're here! I was waiting for you. Let's organize things together!",
    catRunaway: "Meow... you promised to finish this. I'm going to hide until you're done. I believe in you!",
    catSearchPlaceholder: "Search 'Meeting'...",
    
    // Soft Tsundere Search Logic
    catSearchIntro: "Did you forget again? Hehe, lucky you have me!",
    catFoundItem: "You have '{title}' on {date} at {time}!",
    catFoundNote: "Note: {note}",
    catSearchOutro: "Don't forget it this time~",
    
    catNoResult: "I looked everywhere but couldn't find it. Maybe check under the rug?",
    rewardMsg: "Wow! You actually did it! Here, you can pet me for 5 minutes. Just 5 minutes, okay?",
    
    overdue: "Overdue",
    editGoal: "Edit Goal",
    setDeadline: "Set Deadline",
    deleteSection: "Delete Domain"
  },
  zh: {
    appTitle: "温馨角落",
    todoTab: "随手记", // Updated
    ideasTab: "灵感收集",
    todoInputPlaceholder: "写下新的待办...",
    noTodos: "今天好清闲呀 ~",
    ideaTitlePlaceholder: "灵感标题...",
    ideaContentPlaceholder: "详细描述一下...",
    listening: "正在聆听...",
    voiceNotSupported: "浏览器不支持语音 API",
    saveIdea: "保存灵感",
    noIdeas: "脑洞空空如也...",
    categories: {
      life: "生活",
      work: "工作",
      art: "艺术",
      random: "随想"
    },
    newEvent: "新事件",
    editEvent: "编辑事件",
    title: "标题",
    date: "日期",
    startTime: "开始时间",
    duration: "时长 (小时)",
    notes: "备注 / 详情",
    color: "颜色标记",
    delete: "删除",
    saveChanges: "保存更改",
    today: "今天",
    month: "月视图",
    week: "周视图",
    day: "日视图",
    dragHint: "拖拽移动 • 双击添加 • 点击编辑",
    identityTitle: "我想成为...",
    identityPlaceholder: "一名大厨",
    addSection: "添加新领域",
    newSection: "新领域",
    newGoal: "小目标",
    
    // Naming System
    defaultCatName: "年年",
    nameReaction: "你想叫我 {name}？好吧，这名字还挺好听的！",
    
    catIntro: "呼... 你终于来啦！我等你好久了，快来一起整理吧！",
    catRunaway: "喵... 你答应过要完成的。我要躲起来了，等你做完再出来见你。我相信你做得到的！",
    catSearchPlaceholder: "搜索 '会议'...",
    
    // Soft Tsundere Search Logic
    catSearchIntro: "又忘啦？嘿嘿，幸好你有我！",
    catFoundItem: "你在 {date} {time} 有 '{title}'！",
    catFoundNote: "备注: {note}",
    catSearchOutro: "这次别再忘啦~",
    
    catNoResult: "找遍了也没看到... 会不会是你记在心里了？",
    rewardMsg: "哇！你居然做到了！好吧，奖励你可以摸摸我... 只有5分钟哦！",
    
    overdue: "已逾期",
    editGoal: "编辑目标",
    setDeadline: "截止日期",
    deleteSection: "删除领域"
  }
};

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomRotation = () => Math.random() * 6 - 3; // -3 to 3 degrees
const toISODate = (d: Date) => d.toISOString().split('T')[0];

const getWeekDays = (currentDate: Date) => {
  const start = new Date(currentDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
  start.setDate(diff);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

const getMonthDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = startPad; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, isCurrentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false });
  }
  return days;
};

// --- Web Speech API Polyfill ---
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Components ---

const LeftSidebar: React.FC<{
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  ideas: Idea[];
  addIdea: (title: string, cat: IdeaCategoryKey, content: string) => void;
  deleteIdea: (id: string) => void;
  updateIdeaCategory: (id: string, cat: IdeaCategoryKey) => void;
  lang: Language;
  t: any;
}> = ({ todos, addTodo, toggleTodo, deleteTodo, ideas, addIdea, deleteIdea, updateIdeaCategory, lang, t }) => {
  const [activeTab, setActiveTab] = useState<TabType>('todo');

  return (
    <div className="flex flex-col h-full">
      <div className="flex px-2 pt-2 gap-1">
        <button
          onClick={() => setActiveTab('todo')}
          className={`flex-1 py-2 rounded-t-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'todo' 
              ? 'bg-[#FDF6E3] text-wood-dark translate-y-[2px] z-10' 
              : 'bg-[#E6DCC0] text-wood-dark/60 hover:bg-[#F0E6D0]'
          }`}
        >
          <CheckSquare size={16} />
          <span>{t.todoTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={`flex-1 py-2 rounded-t-xl font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ideas' 
              ? 'bg-[#FDF6E3] text-wood-dark translate-y-[2px] z-10' 
              : 'bg-[#E6DCC0] text-wood-dark/60 hover:bg-[#F0E6D0]'
          }`}
        >
          <Lightbulb size={16} />
          <span>{t.ideasTab}</span>
        </button>
      </div>

      <div className="wood-panel flex-1 flex flex-col p-4 relative z-0 rounded-tl-none rounded-tr-none md:rounded-tr-3xl">
        {activeTab === 'todo' ? (
          <TodoView todos={todos} addTodo={addTodo} toggleTodo={toggleTodo} deleteTodo={deleteTodo} t={t} />
        ) : (
          <IdeaView ideas={ideas} addIdea={addIdea} deleteIdea={deleteIdea} updateIdeaCategory={updateIdeaCategory} t={t} />
        )}
      </div>
    </div>
  );
};

const TodoView: React.FC<{
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  t: any;
}> = ({ todos, addTodo, toggleTodo, deleteTodo, t }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addTodo(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.todoInputPlaceholder}
          className="w-full text-xl p-3 pr-12 rounded-xl border-2 border-[#E0D0B8] focus:border-wood-dark bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-yellow rounded-full text-wood-dark hover:scale-110 transition-transform bounce-click"
        >
          <Plus size={18} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`relative p-4 bg-[#FAF9F6] border border-gray-200 shadow-md transition-all duration-300 ${todo.isDone ? 'opacity-60 grayscale' : ''}`}
            style={{ 
              transform: `rotate(${todo.rotation}deg)`,
              borderRadius: '2px' 
            }}
          >
            <div className="absolute top-2 right-2 w-6 h-8 border-2 border-dotted border-gray-300 opacity-30 pointer-events-none"></div>
            <div className="flex items-start gap-3">
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  todo.isDone ? 'bg-accent-green border-accent-green' : 'border-wood-dark/40 hover:border-wood-dark'
                }`}
              >
                {todo.isDone && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1">
                <p className={`text-xl leading-snug text-wood-dark ${todo.isDone ? 'line-through decoration-wood-dark/30' : ''}`}>
                  {todo.content}
                </p>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="text-center opacity-50 text-lg mt-10 text-wood-dark">
            {t.noTodos}
          </div>
        )}
      </div>
    </div>
  );
};

const IdeaView: React.FC<{
  ideas: Idea[];
  addIdea: (title: string, cat: IdeaCategoryKey, content: string) => void;
  deleteIdea: (id: string) => void;
  updateIdeaCategory: (id: string, cat: IdeaCategoryKey) => void;
  t: any;
}> = ({ ideas, addIdea, deleteIdea, updateIdeaCategory, t }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IdeaCategoryKey>('life');
  const [content, setContent] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addIdea(title, category, content);
    setTitle('');
    setContent('');
    setCategory('life');
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.voiceNotSupported);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; // Defaulting to CN for voice for now as per previous req, or could detect
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <form onSubmit={handleSubmit} className="bg-white/50 p-4 rounded-xl border border-[#D7C9A8] flex flex-col gap-3">
        {/* Fixed Title Input: w-full to prevent protrusion */}
        <div>
            <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.ideaTitlePlaceholder}
            className="w-full font-bold text-lg p-2.5 rounded-lg border-2 border-[#E0D0B8] focus:border-wood-dark focus:outline-none bg-white placeholder-wood-dark/30"
            />
        </div>

        <div className="flex justify-end">
             <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as IdeaCategoryKey)}
                className="text-sm font-bold rounded-lg border-2 border-[#E0D0B8] bg-white px-2 py-1 text-wood-dark cursor-pointer focus:border-wood-dark focus:outline-none"
            >
                {CATEGORY_KEYS.map(k => (
                    <option key={k} value={k}>{t.categories[k]}</option>
                ))}
            </select>
        </div>
        
        <div className="relative">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isListening ? t.listening : t.ideaContentPlaceholder}
                className={`w-full text-lg p-2.5 pr-8 rounded-lg border-2 focus:outline-none resize-none h-20 transition-colors ${
                isListening ? 'border-accent-red bg-red-50' : 'border-[#E0D0B8] focus:border-wood-dark bg-white'
                }`}
            />
             <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all ${
                isListening ? 'bg-accent-red text-white animate-pulse' : 'bg-wood-light text-wood-dark hover:bg-gray-100'
              }`}
            >
              <Mic size={14} />
            </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-wood-dark text-wood-light font-bold rounded-lg text-sm hover:brightness-110 shadow-sm"
        >
          {t.saveIdea}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-4">
        {ideas.map((idea) => (
           <IdeaCard key={idea.id} idea={idea} deleteIdea={deleteIdea} updateIdeaCategory={updateIdeaCategory} t={t} />
        ))}
         {ideas.length === 0 && (
          <div className="text-center opacity-50 text-lg mt-10 text-wood-dark">
            {t.noIdeas}
          </div>
        )}
      </div>
    </div>
  );
};

const IdeaCard: React.FC<{ 
    idea: Idea; 
    deleteIdea: (id: string) => void;
    updateIdeaCategory: (id: string, cat: IdeaCategoryKey) => void;
    t: any;
}> = ({ idea, deleteIdea, updateIdeaCategory, t }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div 
            className="bg-white p-3 pb-8 shadow-md border border-gray-100 transform rotate-1 transition-transform hover:rotate-0 hover:z-10 duration-200 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex justify-between items-start mb-2">
                {expanded ? (
                    <select
                        value={idea.category}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateIdeaCategory(idea.id, e.target.value as IdeaCategoryKey)}
                        className="text-xs border rounded p-1 bg-gray-50 text-wood-dark focus:outline-none"
                    >
                        {CATEGORY_KEYS.map(k => (
                             <option key={k} value={k}>{t.categories[k]}</option>
                        ))}
                    </select>
                ) : (
                    <span 
                        className="text-[12px] font-bold px-2 py-0.5 rounded-full text-wood-dark tracking-wider border border-black/5"
                        style={{ backgroundColor: CATEGORY_COLORS[idea.category] || CATEGORY_COLORS['random'] }}
                    >
                        {t.categories[idea.category]}
                    </span>
                )}

                 <button
                    onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id); }}
                    className="text-gray-300 hover:text-red-400"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            
            <h3 className="font-bold text-wood-dark text-xl leading-tight mb-1">{idea.title}</h3>
            
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40' : 'max-h-0'}`}>
                <p className="text-wood-dark/80 mt-2 text-lg border-t pt-2 border-dashed border-gray-200">
                    {idea.content || <span className="italic opacity-50">...</span>}
                </p>
            </div>

            <div className="flex justify-center mt-1 opacity-20">
                {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>
        </div>
    )
}

const EventModal: React.FC<{
  event: CalendarEvent;
  onSave: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  t: any;
}> = ({ event, onSave, onDelete, onClose, t }) => {
  const [editedEvent, setEditedEvent] = useState(event);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="wood-panel bg-white p-6 w-80 md:w-96 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-4 border-b-2 border-wood-dark/10 pb-2">
          <h3 className="font-bold text-2xl text-wood-dark">
            {event.id.startsWith('new') ? t.newEvent : t.editEvent}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-wood-dark">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-wood-dark mb-1">{t.title}</label>
            <input 
              value={editedEvent.title}
              onChange={e => setEditedEvent({...editedEvent, title: e.target.value})}
              className="w-full p-2 border-2 border-[#E6DCC0] rounded-lg text-xl focus:border-wood-dark focus:outline-none"
            />
          </div>

          <div>
             <label className="block text-lg font-bold text-wood-dark mb-1">{t.date}</label>
             <input 
               type="date"
               value={editedEvent.date}
               onChange={e => setEditedEvent({...editedEvent, date: e.target.value})}
               className="w-full p-2 border-2 border-[#E6DCC0] rounded-lg text-xl focus:border-wood-dark focus:outline-none"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-bold text-wood-dark mb-1">{t.startTime}</label>
              <select 
                value={editedEvent.startHour}
                onChange={e => setEditedEvent({...editedEvent, startHour: Number(e.target.value)})}
                className="w-full p-2 border-2 border-[#E6DCC0] rounded-lg text-lg bg-white"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-bold text-wood-dark mb-1">{t.duration}</label>
              <input 
                type="number"
                min="1"
                max="8"
                value={editedEvent.duration}
                onChange={e => setEditedEvent({...editedEvent, duration: Number(e.target.value)})}
                className="w-full p-2 border-2 border-[#E6DCC0] rounded-lg text-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-bold text-wood-dark mb-1">{t.notes}</label>
            <textarea 
              value={editedEvent.description}
              onChange={e => setEditedEvent({...editedEvent, description: e.target.value})}
              className="w-full p-2 border-2 border-[#E6DCC0] rounded-lg text-lg focus:border-wood-dark focus:outline-none h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-wood-dark mb-1">{t.color}</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditedEvent({...editedEvent, color: c})}
                  className={`w-8 h-8 rounded-full border-2 ${editedEvent.color === c ? 'border-wood-dark scale-110' : 'border-black/5 hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-2 border-t border-wood-dark/10">
            <button 
              onClick={() => onDelete(event.id)}
              className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-lg hover:bg-red-200 transition-colors"
            >
              {t.delete}
            </button>
            <button 
              onClick={() => onSave(editedEvent)}
              className="flex-[2] py-2 bg-wood-dark text-wood-light rounded-lg font-bold text-lg hover:bg-[#4A332C] transition-colors"
            >
              {t.saveChanges}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarColumn: React.FC<{
  events: CalendarEvent[];
  updateEvent: (event: CalendarEvent) => void;
  addEvent: (dateStr: string, startHour: number) => void;
  deleteEvent: (id: string) => void;
  t: any;
  lang: Language;
}> = ({ events, updateEvent, addEvent, deleteEvent, t, lang }) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEventId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); 
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, dateStr: string, hour: number) => {
    e.preventDefault();
    if (draggedEventId) {
      const event = events.find((ev) => ev.id === draggedEventId);
      if (event) {
        updateEvent({ 
          ...event, 
          date: dateStr,
          startHour: hour 
        });
      }
      setDraggedEventId(null);
    }
  };

  const renderTimeGrid = () => {
    const isWeek = viewMode === 'week';
    const displayedDays = isWeek 
      ? getWeekDays(currentDate).map(d => ({ date: d, name: d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: isWeek ? 'short' : 'long' }) }))
      : [{ date: currentDate, name: currentDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long' }) }];

    return (
      <div className="flex-1 flex overflow-y-auto">
        <div className="w-16 flex-shrink-0 bg-[#F2E8CF] border-r-2 border-[#D7C9A8] pt-10">
          {HOURS.map((hour) => (
            <div key={hour} className="h-20 text-right pr-2 text-gray-500 text-sm -mt-2">
              {hour}:00
            </div>
          ))}
        </div>

        <div className="flex-1 flex">
          {displayedDays.map(({ date, name }) => {
            const dateStr = toISODate(date);
            const isToday = toISODate(new Date()) === dateStr;
            
            return (
              <div key={dateStr} className={`flex-1 border-r border-[#D7C9A8] relative ${isWeek ? 'min-w-[80px]' : 'min-w-[200px]'}`}>
                <div className={`h-12 text-center pt-2 bg-[#F9F3E0] sticky top-0 z-10 border-b-2 border-[#D7C9A8] flex flex-col justify-center items-center ${isToday ? 'bg-accent-yellow/20' : ''}`}>
                   <span className="font-bold text-wood-dark text-xs uppercase tracking-wide">{name}</span>
                   <span className={`font-bold text-lg leading-none ${isToday ? 'text-accent-red' : 'text-wood-dark'}`}>{date.getDate()}</span>
                </div>

                <div className="relative">
                  {HOURS.map((hour) => (
                    <div
                      key={`${dateStr}-${hour}`}
                      className="h-20 border-b border-dashed border-[#E6DCC0] hover:bg-white/40 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dateStr, hour)}
                      onDoubleClick={() => addEvent(dateStr, hour)}
                    />
                  ))}

                  {events
                    .filter((ev) => ev.date === dateStr)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ev.id)}
                        onClick={() => setEditingEvent(ev)}
                        className="absolute left-[2px] right-[2px] rounded-lg border border-black/5 shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-start px-2 py-1 hover:brightness-110 transition-all z-20 group overflow-hidden"
                        style={{
                          top: `${(ev.startHour - 8) * 5}rem`, 
                          height: `${ev.duration * 5}rem`,
                          backgroundColor: ev.color,
                        }}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="font-bold text-wood-dark text-sm leading-tight truncate">
                            {ev.title}
                          </span>
                        </div>
                        {ev.duration >= 1 && (
                            <p className="text-wood-dark/70 text-xs leading-tight mt-0.5 line-clamp-2">
                                {ev.description}
                            </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthGrid = () => {
    const days = getMonthDays(currentDate);
    const dayNames = lang === 'zh' 
        ? ['一', '二', '三', '四', '五', '六', '日']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex border-b-2 border-[#D7C9A8] bg-[#F9F3E0]">
                {dayNames.map(d => (
                    <div key={d} className="flex-1 py-2 text-center font-bold text-wood-dark text-sm">{d}</div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {days.map((dayObj, idx) => {
                    const dateStr = toISODate(dayObj.date);
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isToday = toISODate(new Date()) === dateStr;

                    return (
                        <div 
                            key={idx} 
                            onClick={() => {
                                setCurrentDate(dayObj.date);
                                setViewMode('day');
                            }}
                            className={`border-r border-b border-[#D7C9A8] p-1 relative cursor-pointer hover:bg-white/30 transition-colors flex flex-col gap-1 overflow-hidden ${!dayObj.isCurrentMonth ? 'bg-gray-100/50 text-gray-400' : 'bg-[#FDF6E3] text-wood-dark'}`}
                        >
                            <span className={`text-sm font-bold block ${isToday ? 'bg-accent-red text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                {dayObj.date.getDate()}
                            </span>
                            
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                {dayEvents.slice(0, 3).map(ev => (
                                    <div 
                                      key={ev.id} 
                                      className="rounded-sm w-full px-1 text-[10px] truncate leading-tight text-wood-dark/80" 
                                      style={{ backgroundColor: ev.color }} 
                                      title={ev.title}
                                    >
                                      {ev.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-wood-dark/50 text-center leading-none">+ {dayEvents.length - 3}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const headerTitle = useMemo(() => {
    return currentDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' });
  }, [currentDate, lang]);

  return (
    <div className="h-full flex flex-col relative">
       {editingEvent && (
        <EventModal 
          event={editingEvent}
          onSave={(updated) => {
            updateEvent(updated);
            setEditingEvent(null);
          }}
          onDelete={(id) => {
            deleteEvent(id);
            setEditingEvent(null);
          }}
          onClose={() => setEditingEvent(null)}
          t={t}
        />
      )}

      <div className="absolute -top-6 left-10 w-4 h-12 bg-wood-dark rounded-full -z-10"></div>
      <div className="absolute -top-6 right-10 w-4 h-12 bg-wood-dark rounded-full -z-10"></div>

      <div className="wood-panel flex-1 flex flex-col overflow-hidden bg-[#FDF6E3]">
        <div className="h-16 border-b-4 border-wood-dark flex items-center justify-between px-2 md:px-4 bg-[#F8F0D8] rounded-t-[1.3rem]">
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className="p-1 hover:bg-black/5 rounded-full text-wood-dark"><ChevronLeft/></button>
            <button onClick={handleToday} className="px-3 py-1 bg-wood-dark/10 rounded-lg text-sm font-bold text-wood-dark hover:bg-wood-dark/20">{t.today}</button>
            <button onClick={handleNext} className="p-1 hover:bg-black/5 rounded-full text-wood-dark"><ChevronRight/></button>
            <span className="font-bold text-xl text-wood-dark ml-2 min-w-[140px] text-center">{headerTitle}</span>
          </div>
          
          <div className="flex bg-[#FDF6E3] rounded-lg p-1 border-2 border-[#E6DCC0]">
             {[{k:'month', l: t.month}, {k:'week', l: t.week}, {k:'day', l: t.day}].map((m) => (
                 <button 
                    key={m.k}
                    onClick={() => setViewMode(m.k as CalendarViewMode)}
                    className={`px-2 md:px-3 py-1 rounded-md text-sm font-bold transition-colors ${viewMode === m.k ? 'bg-wood-dark text-wood-light' : 'text-wood-dark hover:bg-black/5'}`}
                 >
                    {m.l}
                 </button>
             ))}
          </div>
        </div>

        {viewMode === 'month' ? renderMonthGrid() : renderTimeGrid()}
      </div>
      
      <div className="text-center mt-2 text-wood-dark font-bold text-sm md:text-lg bg-white/50 inline-block mx-auto px-4 rounded-full backdrop-blur-sm">
        {t.dragHint}
      </div>
    </div>
  );
};

const IdentityColumn: React.FC<{
  identityName: string;
  setIdentityName: (name: string) => void;
  sections: IdentitySection[];
  addGoalProgress: (sectionId: string, goalId: string) => void;
  addSection: () => void;
  deleteSection: (id: string) => void;
  updateSectionTitle: (id: string, title: string) => void;
  addGoal: (sectionId: string) => void;
  updateGoal: (sectionId: string, goalId: string, title: string, deadline?: string) => void;
  t: any;
}> = ({ identityName, setIdentityName, sections, addGoalProgress, addSection, deleteSection, updateSectionTitle, addGoal, updateGoal, t }) => {
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  const startEditing = (goal: IdentityGoal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditDate(goal.deadline || "");
  };

  const saveEditing = (sectionId: string, goalId: string) => {
    updateGoal(sectionId, goalId, editTitle, editDate);
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 bg-[#FDF0D5] border-4 border-dashed border-[#8D6E63] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col">
        <div className="mb-6 text-center z-10">
          <label className="block text-2xl text-[#8D6E63] mb-1">{t.identityTitle}</label>
          <input
            value={identityName}
            onChange={(e) => setIdentityName(e.target.value)}
            className="w-full text-center font-bold text-3xl bg-transparent border-b-4 border-[#8D6E63]/30 focus:border-[#8D6E63] focus:outline-none text-wood-dark placeholder-[#8D6E63]/40"
            placeholder={t.identityPlaceholder}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 z-10 pr-2">
          {sections.map((section) => (
            <div key={section.id} className="bg-white/40 p-4 rounded-xl border border-[#8D6E63]/20 hover:bg-white/60 transition-colors group/section">
              <div className="flex justify-between items-center mb-3">
                <input 
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="font-bold text-xl text-wood-dark bg-transparent border-b-2 border-transparent focus:border-wood-dark/30 focus:outline-none w-full mr-2"
                />
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => addGoal(section.id)}
                        className="p-1 hover:bg-[#8D6E63]/10 rounded-full text-[#8D6E63]"
                        title={t.newGoal}
                    >
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={() => { if(confirm(t.delete + '?')) deleteSection(section.id); }}
                        className="p-1 hover:bg-red-100 rounded-full text-gray-300 hover:text-red-400 opacity-0 group-hover/section:opacity-100 transition-opacity"
                        title={t.deleteSection}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {section.goals.map((goal) => {
                    const isOverdue = goal.deadline && new Date(goal.deadline) < new Date(new Date().toDateString()) && goal.progress < 100;
                    const isEditing = editingId === goal.id;

                    return (
                        <div key={goal.id} className="flex flex-col gap-1">
                            {isEditing ? (
                              <div className="bg-white p-2 rounded shadow-sm flex flex-col gap-2">
                                <label className="text-xs font-bold text-[#8D6E63]">{t.editGoal}</label>
                                <input 
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  className="border rounded p-1 text-sm text-wood-dark"
                                />
                                <label className="text-xs font-bold text-[#8D6E63] mt-1">{t.setDeadline}</label>
                                <input 
                                  type="date"
                                  value={editDate}
                                  onChange={e => setEditDate(e.target.value)}
                                  className="border rounded p-1 text-sm text-wood-dark"
                                />
                                <button 
                                  onClick={() => saveEditing(section.id, goal.id)}
                                  className="bg-accent-green text-white rounded p-1 text-sm font-bold flex items-center justify-center gap-1 hover:brightness-110"
                                >
                                  <Save size={12} /> {t.saveChanges}
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 group">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-lg mb-1 text-wood-dark items-center">
                                            <div className="flex items-center gap-2">
                                              <span>{goal.title}</span>
                                              <button onClick={() => startEditing(goal)} className="opacity-0 group-hover:opacity-100 text-[#8D6E63] hover:text-wood-dark transition-opacity">
                                                <Pencil size={12} />
                                              </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isOverdue && (
                                                  <div title={t.overdue}>
                                                    <AlertCircle size={14} className="text-red-500" />
                                                  </div>
                                                )}
                                                <span className={isOverdue ? "text-red-500" : ""}>{goal.progress}%</span>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-[#8D6E63]/10 rounded-full overflow-hidden">
                                            <div 
                                            className={`h-full transition-all duration-500 ease-out ${goal.progress === 100 ? 'bg-accent-yellow' : isOverdue ? 'bg-red-400' : 'bg-accent-green'}`}
                                            style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                      onClick={() => addGoalProgress(section.id, goal.id)}
                                      disabled={goal.progress >= 100}
                                      className={`w-8 h-8 flex items-center justify-center border-2 border-wood-dark rounded-full shadow-sm bounce-click text-wood-dark transition-all ${goal.progress >= 100 ? 'bg-gray-200 opacity-50' : 'bg-accent-yellow hover:brightness-110'}`}
                                    >
                                    <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                                {goal.deadline && (
                                  <div className={`flex items-center justify-end gap-1 mt-0.5 text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-[#8D6E63]/70'}`}>
                                    <Clock size={10} />
                                    <span>{goal.deadline}</span>
                                    {isOverdue && <span>({t.overdue})</span>}
                                  </div>
                                )}
                              </>
                            )}
                        </div>
                    );
                })}
              </div>
            </div>
          ))}
          
          <button 
            onClick={addSection}
            className="w-full py-3 border-2 border-dashed border-[#8D6E63]/40 rounded-xl text-lg text-[#8D6E63] hover:bg-[#8D6E63]/5 hover:border-[#8D6E63] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> {t.addSection}
          </button>
        </div>
      </div>
    </div>
  );
};

const CatCompanion: React.FC<{
  todos: Todo[];
  ideas: Idea[];
  events: CalendarEvent[];
  identitySections: IdentitySection[];
  onRewardTrigger: (callback: (msg: string) => void) => void;
  lang: Language;
  t: any;
}> = ({ todos, ideas, events, identitySections, onRewardTrigger, lang, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Naming System State
  const [customName, setCustomName] = useState<string | null>(() => localStorage.getItem('cozy_cat_custom_name'));
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const displayName = customName || t.defaultCatName;

  // Check for Runaway Condition
  const isCatRunaway = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return identitySections.some(sec => 
        sec.goals.some(g => g.deadline && g.deadline < todayStr && g.progress < 100)
    );
  }, [identitySections]);

  // Initial Message Effect
  useEffect(() => {
    setChatHistory([{ sender: 'cat', text: t.catIntro }]);
  }, [lang, t.catIntro]);

  useEffect(() => {
      onRewardTrigger((msg) => {
          setIsOpen(true);
          setChatHistory(prev => [...prev, { sender: 'cat', text: msg }]);
      });
  }, [onRewardTrigger]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chatHistory, isOpen]);

  const handleCatClick = () => {
      setIsOpen(true);
      if (isCatRunaway) {
          setChatHistory(prev => [...prev, { sender: 'cat', text: t.catRunaway }]);
      }
  };

  const handleNameSave = () => {
    if (!tempName.trim()) {
        setIsEditingName(false);
        return;
    }
    setCustomName(tempName);
    localStorage.setItem('cozy_cat_custom_name', tempName);
    setIsEditingName(false);
    
    // Trigger reaction
    setIsOpen(true);
    setChatHistory(prev => [...prev, { 
        sender: 'cat', 
        text: t.nameReaction.replace('{name}', tempName) 
    }]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: query }]);
    const lowerQuery = query.toLowerCase();
    
    // Search Collections
    const foundEvents = events.filter(e => 
        e.title.toLowerCase().includes(lowerQuery) || 
        (e.description && e.description.toLowerCase().includes(lowerQuery))
    );

    let responses: string[] = [];

    if (foundEvents.length > 0) {
        // Soft Tsundere Logic: Intro
        responses.push(t.catSearchIntro);

        foundEvents.forEach(ev => {
            const dateObj = new Date(ev.date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric' });
            const timeStr = `${ev.startHour}:00`;
            
            // Template replacement
            let itemMsg = t.catFoundItem
              .replace('{title}', ev.title)
              .replace('{date}', dateStr)
              .replace('{time}', timeStr);

            if (ev.description && ev.description.trim() !== '') {
                const noteMsg = t.catFoundNote.replace('{note}', ev.description);
                itemMsg += ` (${noteMsg})`;
            }
            responses.push(itemMsg);
        });

        // Soft Tsundere Logic: Outro
        responses.push(t.catSearchOutro);
    } else {
        responses.push(t.catNoResult);
    }

    setTimeout(() => {
        responses.forEach((resp, idx) => {
            setTimeout(() => {
                setChatHistory(prev => [...prev, { sender: 'cat', text: resp }]);
            }, idx * 1200); // Slower pace for dramatic effect
        });
    }, 600);
    setQuery('');
  };

  return (
    <div className="fixed bottom-0 right-[25%] z-40 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto mb-12 mr-10 w-80 bg-white border-4 border-wood-dark rounded-2xl p-4 shadow-xl relative animate-[fadeIn_0.3s_ease-out]">
          <div className="absolute bottom-[-16px] right-8 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-wood-dark border-r-[16px] border-r-transparent"></div>
          <div className="absolute bottom-[-10px] right-8 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white border-r-[12px] border-r-transparent"></div>
          
          <div className="flex justify-between items-center mb-2 border-b pb-2">
            <span className="font-bold text-wood-dark text-lg flex items-center gap-1">
                <Heart size={14} className="text-accent-red fill-accent-red" />
                {displayName}
            </span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
          </div>

          <div className="h-40 overflow-y-auto space-y-2 mb-3 pr-1">
            {chatHistory.map((msg, i) => (
                <div key={i} className={`p-2 rounded-lg text-lg ${msg.sender === 'user' ? 'bg-blue-100 ml-8 text-right' : 'bg-orange-50 mr-8 text-left'}`}>
                    {msg.text}
                </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {!isCatRunaway && (
             <form onSubmit={handleSearch} className="relative">
                <input 
                   className="w-full border-2 border-gray-200 rounded-full px-3 py-1 text-sm focus:border-wood-dark outline-none pr-8"
                   placeholder={t.catSearchPlaceholder}
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1.5 text-wood-dark hover:scale-110 transition-transform">
                   <Search size={14} />
                </button>
             </form>
          )}
        </div>
      )}

      <div 
        className="pointer-events-auto relative cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
        onDoubleClick={handleCatClick}
        onClick={isCatRunaway ? handleCatClick : undefined}
      >
        {/* Name Tag */}
        {!isCatRunaway && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-wood-dark/20 flex items-center gap-2 whitespace-nowrap z-20 backdrop-blur-sm hover:scale-105 transition-transform"
             onClick={(e) => { e.stopPropagation(); if (!isEditingName) { setTempName(displayName); setIsEditingName(true); } }}
          >
            {isEditingName ? (
              <input 
                 autoFocus
                 value={tempName}
                 onChange={e => setTempName(e.target.value)}
                 onBlur={handleNameSave}
                 onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                 className="w-20 bg-transparent border-b border-wood-dark text-center text-xs font-bold text-wood-dark focus:outline-none"
              />
            ) : (
              <>
                <span className="text-xs font-bold text-wood-dark">{displayName}</span>
                <Pencil size={10} className="text-wood-dark/50" />
              </>
            )}
          </div>
        )}

        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-wood-dark shadow-2xl relative bg-orange-100">
             <img 
                src={isCatRunaway 
                    ? "https://images.unsplash.com/photo-1596489397636-2244249be55d?q=80&w=300&auto=format&fit=crop" // Empty Bed (Abstract/Cozy)
                    : "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=250&auto=format&fit=crop" // Cute Cat
                } 
                alt="Disney Cat" 
                className="w-full h-full object-cover"
             />
             {isCatRunaway && (
                 <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                     <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Gone...</span>
                 </div>
             )}
        </div>
        
        {!isCatRunaway && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-16 h-8 z-10 flex items-center justify-center drop-shadow-md">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-accent-red border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent"></div>
                <div className="w-4 h-4 bg-accent-red rounded-full z-10 -ml-1 -mr-1"></div>
                <div className="w-0 h-0 border-r-[15px] border-r-transparent border-l-[15px] border-l-accent-red border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent"></div>
            </div>
        )}

        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1 rounded-full text-sm font-bold border-2 border-wood-dark whitespace-nowrap">
            {isCatRunaway ? "Where is cat?" : "Double click"}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const rewardCallbackRef = useRef<((msg: string) => void) | null>(null);

  const t = TRANSLATIONS[lang];

  // State: Todos
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('cozy_todos_v2');
    return saved ? JSON.parse(saved) : [
        { id: '1', content: 'Design new Logo', isDone: false, rotation: -2, createdAt: Date.now() },
        { id: '2', content: 'Buy turnips', isDone: true, rotation: 1.5, createdAt: Date.now() }
    ];
  });

  // State: Ideas
  const [ideas, setIdeas] = useState<Idea[]>(() => {
      const saved = localStorage.getItem('cozy_ideas_v2');
      return saved ? JSON.parse(saved) : [
          { id: '1', title: 'Game Concept', category: 'work', content: 'A cozy game about organizing a library.', createdAt: Date.now() }
      ]
  });

  // State: Events
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('cozy_events_v2');
    const initialDate = toISODate(new Date());
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Deep Work', date: initialDate, startHour: 9, duration: 2, color: '#FEF08A', description: 'Focus on new features.' },
      { id: '2', title: 'Lunch', date: initialDate, startHour: 12, duration: 1, color: '#BBF7D0', description: '' }
    ];
  });

  // State: Identity
  const [identityName, setIdentityName] = useState(() => localStorage.getItem('cozy_identity_name_v2') || '');
  const [identitySections, setIdentitySections] = useState<IdentitySection[]>(() => {
    const saved = localStorage.getItem('cozy_identity_sections_v2');
    return saved ? JSON.parse(saved) : [
      { 
        id: 's1', 
        title: 'Core Skills', 
        goals: [{ id: 'g1', title: 'Figma Mastery', progress: 30 }] 
      }
    ];
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('cozy_todos_v2', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('cozy_ideas_v2', JSON.stringify(ideas)), [ideas]);
  useEffect(() => localStorage.setItem('cozy_events_v2', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('cozy_identity_name_v2', identityName), [identityName]);
  useEffect(() => localStorage.setItem('cozy_identity_sections_v2', JSON.stringify(identitySections)), [identitySections]);

  // Handlers
  const addTodo = (text: string) => {
    setTodos(prev => [{ id: generateId(), content: text, isDone: false, rotation: getRandomRotation(), createdAt: Date.now() }, ...prev]);
  };
  const toggleTodo = (id: string) => setTodos(prev => prev.map(n => n.id === id ? { ...n, isDone: !n.isDone } : n));
  const deleteTodo = (id: string) => setTodos(prev => prev.filter(n => n.id !== id));

  const addIdea = (title: string, category: IdeaCategoryKey, content: string) => {
      setIdeas(prev => [{ id: generateId(), title, category, content, createdAt: Date.now() }, ...prev]);
  };
  const deleteIdea = (id: string) => setIdeas(prev => prev.filter(i => i.id !== id));
  const updateIdeaCategory = (id: string, cat: IdeaCategoryKey) => {
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, category: cat } : i));
  }

  const updateEvent = (updatedEvent: CalendarEvent) => setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  const addEvent = (dateStr: string, startHour: number) => {
    setEvents(prev => [...prev, { id: generateId(), title: t.newEvent, date: dateStr, startHour, duration: 1, color: EVENT_COLORS[0], description: '' }]);
  };
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const addGoalProgress = (sectionId: string, goalId: string) => {
    setIdentitySections(prev => prev.map(sec => {
        if (sec.id !== sectionId) return sec;
        return {
            ...sec,
            goals: sec.goals.map(g => {
                if (g.id !== goalId) return g;
                const newProgress = Math.min(g.progress + 10, 100);
                // Trigger Reward
                if (newProgress === 100 && g.progress < 100 && rewardCallbackRef.current) {
                    rewardCallbackRef.current(t.rewardMsg);
                }
                return { ...g, progress: newProgress };
            })
        };
    }));
  };

  const addSection = () => {
    setIdentitySections(prev => [...prev, { id: generateId(), title: t.newSection, goals: [{ id: generateId(), title: t.newGoal, progress: 0 }] }]);
  };

  const updateSectionTitle = (id: string, title: string) => {
    setIdentitySections(prev => prev.map(sec => sec.id === id ? { ...sec, title } : sec));
  };

  const deleteSection = (id: string) => {
    setIdentitySections(prev => prev.filter(sec => sec.id !== id));
  };

  const addGoal = (sectionId: string) => {
      setIdentitySections(prev => prev.map(sec => {
          if (sec.id !== sectionId) return sec;
          return { ...sec, goals: [...sec.goals, { id: generateId(), title: t.newGoal, progress: 0 }] };
      }));
  };

  const updateGoal = (sectionId: string, goalId: string, title: string, deadline?: string) => {
      setIdentitySections(prev => prev.map(sec => {
          if (sec.id !== sectionId) return sec;
          return {
              ...sec,
              goals: sec.goals.map(g => g.id === goalId ? { ...g, title, deadline } : g)
          };
      }));
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden text-wood-dark ${lang === 'zh' ? 'font-cute-cn' : 'font-cute-en'}`}>
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center" 
        style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop")',
            filter: 'brightness(0.9) contrast(0.95)'
        }} 
      />

      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setLang(prev => prev === 'en' ? 'zh' : 'en')}
          className="bg-white/90 border-2 border-wood-dark rounded-full px-3 py-1 font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Globe size={16} />
          {lang === 'en' ? 'EN' : '中文'}
        </button>
      </div>

      <div className="container mx-auto h-screen p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="h-[30vh] lg:h-[90vh] lg:col-span-3 min-h-[300px]">
          <LeftSidebar 
            todos={todos} 
            addTodo={addTodo} 
            toggleTodo={toggleTodo} 
            deleteTodo={deleteTodo} 
            ideas={ideas}
            addIdea={addIdea}
            deleteIdea={deleteIdea}
            updateIdeaCategory={updateIdeaCategory}
            lang={lang}
            t={t}
          />
        </div>

        <div className="h-[50vh] lg:h-[90vh] lg:col-span-6 min-h-[500px]">
          <CalendarColumn 
            events={events} 
            updateEvent={updateEvent} 
            addEvent={addEvent}
            deleteEvent={deleteEvent}
            lang={lang}
            t={t}
          />
        </div>

        <div className="h-[30vh] lg:h-[90vh] lg:col-span-3 min-h-[300px]">
            <IdentityColumn 
                identityName={identityName} 
                setIdentityName={setIdentityName}
                sections={identitySections}
                addGoalProgress={addGoalProgress}
                addSection={addSection}
                deleteSection={deleteSection}
                updateSectionTitle={updateSectionTitle}
                addGoal={addGoal}
                updateGoal={updateGoal}
                t={t}
            />
        </div>
      </div>

      <CatCompanion 
        todos={todos} 
        ideas={ideas} 
        events={events} 
        identitySections={identitySections}
        onRewardTrigger={(cb) => { rewardCallbackRef.current = cb; }}
        lang={lang}
        t={t}
      />
    </div>
  );
};

export default App;