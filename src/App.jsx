import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  ChefHat,
  Clock3,
  History,
  Home,
  Plus,
  RefreshCw,
  Settings,
  Shirt,
  Sparkles,
  ThumbsDown,
  Trash2,
  Wand2,
} from 'lucide-react';
import { defaultPreferences, loadHistory, loadPreferences, saveHistory, savePreferences } from './storage.js';
import { detectType, feedbackLabel, generateRecommendation, makeRequest } from './decisionEngine.js';

const quickActions = [
  {
    label: '今天吃什么',
    icon: ChefHat,
    text: '今天中午吃什么？',
    type: 'food',
  },
  {
    label: '今天穿什么',
    icon: Shirt,
    text: '今天上课穿什么？',
    type: 'outfit',
  },
  {
    label: '现在先学什么',
    icon: BookOpen,
    text: '我今晚应该先复习哪一门？',
    type: 'study',
    params: {
      tasks: '高数第 3 章复习，英语作文框架，专业课论文文献整理，四六级听力精听，数据结构错题复盘，实验报告补充，课堂笔记整理，背单词 30 个，小组展示提纲，明天作业检查',
    },
  },
  {
    label: '安排今天任务',
    icon: Clock3,
    text: '帮我安排今天任务',
    type: 'study',
    params: {
      tasks: '晨间复盘 10 分钟，高数刷题 45 分钟，英语作文修改，专业课论文写作，实验报告提交，整理课程资料，完成线上讨论，背单词，运动 20 分钟，睡前明日计划',
    },
  },
  {
    label: '随机但合理',
    icon: Wand2,
    text: '帮我随机但合理地选一个',
    type: 'other',
    params: {
      options: '散步 20 分钟\n整理书桌\n洗衣服\n给家人发消息\n看一集轻松视频\n复盘今天待办\n提前准备明天衣服\n清理手机相册\n去便利店补给\n做 10 分钟拉伸',
    },
  },
];

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'decide', label: '决策', icon: Sparkles },
  { id: 'history', label: '历史', icon: History },
  { id: 'settings', label: '偏好', icon: Settings },
];

const initialForm = {
  rawText: '今天中午吃什么？',
  type: 'food',
  budget: 28,
  taste: '清淡',
  wait: 25,
  healthy: true,
  avoid: '',
  weather: '多云',
  temperature: 22,
  rain: '无雨',
  activity: '日常上课',
  formal: '不需要',
  state: '正常出门',
  tasks: '高数第 3 章复习，英语作文，专业课论文',
  energy: '中等',
  available: 120,
  options: '',
};

export default function App() {
  const [view, setView] = useState('home');
  const [preferences, setPreferences] = useState(loadPreferences);
  const [history, setHistory] = useState(loadHistory);
  const [form, setForm] = useState(initialForm);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [variant, setVariant] = useState(0);
  const [filter, setFilter] = useState('all');
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => savePreferences(preferences), [preferences]);
  useEffect(() => saveHistory(history), [history]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const homeQuickActions = useMemo(
    () => [
      ...quickActions,
      ...(preferences.other.quickEntries || []).map((entry) => ({
        ...entry,
        icon: Wand2,
        type: 'other',
      })),
    ],
    [preferences.other.quickEntries]
  );

  const dashboardTips = useMemo(
    () => buildDailyTips(preferences, history, homeQuickActions, now),
    [preferences, history, homeQuickActions, now]
  );

  const visibleHistory = filter === 'all'
    ? history
    : history.filter((item) => item.request.type === filter);

  function updateForm(key, value) {
    const next = { ...form, [key]: value };
    if (key === 'rawText') next.type = detectType(value);
    setForm(next);
  }

  function runDecision(overrides = {}) {
    const params = { ...form, ...overrides };
    if (params.type === 'other' && params.options?.trim()) {
      rememberOtherOptions(params.options);
    }
    const request = makeRequest(params.rawText, params);
    const result = generateRecommendation(request, preferences, history, variant);
    setCurrentRequest(request);
    setRecommendation(result);
    setVariant((value) => value + 1);
    setView('result');
  }

  function useQuickAction(action) {
    const next = { ...initialForm, ...form, ...action.params, rawText: action.text, type: action.type };
    setForm(next);
    runDecision(next);
  }

  function updateFeedback(feedback, shouldReturnHome = true) {
    if (!currentRequest || !recommendation) return;
    const record = {
      id: recommendation.id,
      request: currentRequest,
      recommendation,
      feedback,
    };
    setHistory((items) => [record, ...items.filter((item) => item.id !== record.id)].slice(0, 80));
    if (currentRequest.type === 'other' && feedback !== 'swapped') {
      updateOtherWeight(recommendation.title.replace('随机抽到：', ''), feedback);
    }
    if (shouldReturnHome) {
      setFeedbackNotice(feedback === 'adopted' ? '已记录采纳，后续会更偏向类似选项。' : '已记录不采纳，后续会降低类似选项权重。');
      setView('home');
    }
  }

  function swapRecommendation() {
    updateFeedback('swapped', false);
    if (!currentRequest) return;
    const result = generateRecommendation(currentRequest, preferences, history, variant + 1);
    setRecommendation(result);
    setVariant((value) => value + 2);
  }

  function resetPreferences() {
    setPreferences(defaultPreferences);
  }

  function rememberOtherOptions(options) {
    setPreferences((current) => ({
      ...current,
      other: {
        ...current.other,
        options,
      },
    }));
  }

  function updateOtherWeight(title, feedback) {
    setPreferences((current) => {
      const name = title.trim();
      if (!name) return current;
      const currentWeight = Number(current.other?.weights?.[name] || 0);
      const delta = feedback === 'adopted' ? 3 : -2;
      return {
        ...current,
        other: {
          ...current.other,
          weights: {
            ...current.other?.weights,
            [name]: currentWeight + delta,
          },
        },
      };
    });
  }

  function addQuickEntry(entry) {
    setPreferences((current) => {
      const nextEntry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label: entry.label,
        text: entry.text,
        params: entry.params,
      };
      return {
        ...current,
        other: {
          ...current.other,
          options: entry.params.options,
          quickEntries: [nextEntry, ...(current.other.quickEntries || [])].slice(0, 6),
        },
      };
    });
  }

  function addReminder(reminder) {
    setPreferences((current) => ({
      ...current,
      reminders: {
        ...current.reminders,
        items: [
          ...(current.reminders.items || []),
          { ...reminder, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` },
        ],
      },
    }));
  }

  function deleteReminder(id) {
    setPreferences((current) => ({
      ...current,
      reminders: {
        ...current.reminders,
        items: (current.reminders.items || []).filter((item) => item.id !== id),
      },
    }));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={22} /></div>
          <div>
            <strong>日常决策助手</strong>
            <span>少纠结，快行动</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.id ? 'nav-button active' : 'nav-button'}
                key={item.id}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main">
        {view === 'home' && (
          <HomeView
            quickActions={homeQuickActions}
            dashboardTips={dashboardTips}
            history={history}
            feedbackNotice={feedbackNotice}
            onQuickAction={useQuickAction}
            onStart={() => setView('decide')}
            onDismissNotice={() => setFeedbackNotice('')}
            onAddReminder={addReminder}
            onDeleteReminder={deleteReminder}
          />
        )}
        {view === 'decide' && (
          <DecisionView
            form={form}
            preferences={preferences}
            updateForm={updateForm}
            onAddQuickEntry={addQuickEntry}
            onSubmit={() => runDecision()}
          />
        )}
        {view === 'result' && recommendation && (
          <ResultView
            recommendation={recommendation}
            request={currentRequest}
            onFeedback={updateFeedback}
            onSwap={swapRecommendation}
            onNew={() => setView('decide')}
          />
        )}
        {view === 'history' && (
          <HistoryView
            history={visibleHistory}
            filter={filter}
            setFilter={setFilter}
          />
        )}
        {view === 'settings' && (
          <SettingsView
            preferences={preferences}
            setPreferences={setPreferences}
            onReset={resetPreferences}
          />
        )}
      </main>
    </div>
  );
}

function HomeView({ quickActions, dashboardTips, history, feedbackNotice, onQuickAction, onStart, onDismissNotice, onAddReminder, onDeleteReminder }) {
  const adopted = history.filter((item) => item.feedback === 'adopted').length;
  const [reminderDraft, setReminderDraft] = useState({ time: '09:00', actionLabel: quickActions[0]?.label || '' });

  useEffect(() => {
    if (!reminderDraft.actionLabel && quickActions[0]?.label) {
      setReminderDraft((draft) => ({ ...draft, actionLabel: quickActions[0].label }));
    }
  }, [quickActions, reminderDraft.actionLabel]);

  function submitReminder() {
    const action = quickActions.find((item) => item.label === reminderDraft.actionLabel);
    if (!reminderDraft.time || !action) return;
    onAddReminder({
      time: reminderDraft.time,
      actionLabel: action.label,
      actionText: action.text,
      kind: action.type,
      params: action.params || {},
    });
    setReminderDraft({ time: '09:00', actionLabel: action.label });
  }

  return (
    <section className="page">
      {feedbackNotice && (
        <div className="notice-bar">
          <span>{feedbackNotice}</span>
          <button onClick={onDismissNotice}>知道了</button>
        </div>
      )}
      <div className="hero-band">
        <div>
          <p className="eyebrow">AI 日常决策助手</p>
          <h1>把低风险选择交给系统，你负责开始行动。</h1>
          <p className="subcopy">输入一句话，系统会识别场景、补齐关键参数，并给出一个明确可执行的建议。</p>
        </div>
        <button className="primary-action" onClick={onStart}>
          <Sparkles size={18} />
          开始决策
        </button>
      </div>

      <div className="stats-row">
        <div><strong>{history.length}</strong><span>历史决策</span></div>
        <div><strong>{adopted}</strong><span>已采纳建议</span></div>
        <div><strong>{Math.max(0, history.length - adopted)}</strong><span>可优化记录</span></div>
      </div>

      <section>
        <div className="section-heading">
          <h2>一键入口</h2>
          <span>高频场景直接出结果</span>
        </div>
        <div className="quick-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button className="quick-card" key={action.label} onClick={() => onQuickAction(action)}>
                <Icon size={24} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>今日提醒</h2>
          <span>到点自动触发一键入口</span>
        </div>
        <div className="reminder-editor">
          <Input label="提醒时间" type="time" value={reminderDraft.time} onChange={(value) => setReminderDraft({ ...reminderDraft, time: value })} />
          <Select
            label="触发入口"
            value={reminderDraft.actionLabel}
            onChange={(value) => setReminderDraft({ ...reminderDraft, actionLabel: value })}
            options={quickActions.map((action) => action.label)}
          />
          <button className="primary-action" onClick={submitReminder}><Plus size={18} />添加入口提醒</button>
        </div>
        <div className="tip-grid">
          {dashboardTips.map((tip) => (
            <article className="tip-card" key={tip.id}>
              <div className="tip-top">
                <Bell size={18} />
                <span>{tip.time}</span>
                <button className="icon-action" onClick={() => onDeleteReminder(tip.id)} aria-label="删除提醒"><Trash2 size={16} /></button>
              </div>
              <h3>{tip.title}</h3>
              <span className={tip.isDue ? 'reminder-status active' : 'reminder-status'}>{tip.status}</span>
              <p>{tip.body}</p>
              {tip.isDue && (
                <button className="secondary-action wide" onClick={() => onQuickAction(tip.action)}>
                  <Sparkles size={17} />
                  查看完整推荐
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function DecisionView({ form, preferences, updateForm, onAddQuickEntry, onSubmit }) {
  return (
    <section className="page narrow">
      <div className="section-heading">
        <h1>决策输入</h1>
        <span>当前识别：{typeText(form.type)}</span>
      </div>

      <label className="field full">
        <span>你正在纠结什么？</span>
        <textarea
          value={form.rawText}
          onChange={(event) => updateForm('rawText', event.target.value)}
          rows={4}
          placeholder="例如：我现在有三篇论文和两个考试，先做什么？"
        />
      </label>

      <div className="segmented">
        {['food', 'outfit', 'study', 'other'].map((type) => (
          <button
            className={form.type === type ? 'active' : ''}
            key={type}
            onClick={() => updateForm('type', type)}
          >
            {typeText(type)}
          </button>
        ))}
      </div>

      {form.type === 'food' && <FoodFields form={form} updateForm={updateForm} />}
      {form.type === 'outfit' && <OutfitFields form={form} updateForm={updateForm} />}
      {form.type === 'study' && <StudyFields form={form} updateForm={updateForm} />}
      {form.type === 'other' && <OtherFields form={form} preferences={preferences} updateForm={updateForm} onAddQuickEntry={onAddQuickEntry} />}

      <button className="primary-action wide" onClick={onSubmit}>
        <Sparkles size={18} />
        生成明确建议
      </button>
    </section>
  );
}

function FoodFields({ form, updateForm }) {
  return (
    <div className="form-grid">
      <Input label="预算" suffix="元" type="number" value={form.budget} onChange={(value) => updateForm('budget', value)} />
      <Select label="口味偏好" value={form.taste} onChange={(value) => updateForm('taste', value)} options={['清淡', '微辣', '家常', '重口味']} />
      <Input label="可等待时间" suffix="分钟" type="number" value={form.wait} onChange={(value) => updateForm('wait', value)} />
      <Select label="健康一点" value={form.healthy ? '是' : '否'} onChange={(value) => updateForm('healthy', value === '是')} options={['是', '否']} />
      <Input label="特别不想吃" value={form.avoid} onChange={(value) => updateForm('avoid', value)} placeholder="例如：不要甜口" />
    </div>
  );
}

function OutfitFields({ form, updateForm }) {
  return (
    <div className="form-grid">
      <Select label="天气" value={form.weather} onChange={(value) => updateForm('weather', value)} options={['晴', '多云', '阴', '小雨', '大风']} />
      <Input label="温度" suffix="°C" type="number" value={form.temperature} onChange={(value) => updateForm('temperature', value)} />
      <Select label="是否下雨" value={form.rain} onChange={(value) => updateForm('rain', value)} options={['无雨', '小概率下雨', '正在下雨']} />
      <Select label="活动类型" value={form.activity} onChange={(value) => updateForm('activity', value)} options={['日常上课', '图书馆学习', '汇报/面试', '运动出门']} />
      <Select label="正式穿着" value={form.formal} onChange={(value) => updateForm('formal', value)} options={['不需要', '需要']} />
      <Select label="当前状态" value={form.state} onChange={(value) => updateForm('state', value)} options={['正常出门', '想简单出门']} />
    </div>
  );
}

function StudyFields({ form, updateForm }) {
  return (
    <div className="form-grid">
      <label className="field full">
        <span>任务列表</span>
        <textarea value={form.tasks} onChange={(event) => updateForm('tasks', event.target.value)} rows={4} />
      </label>
      <Select label="当前精力" value={form.energy} onChange={(value) => updateForm('energy', value)} options={['低', '中等', '高']} />
      <Input label="可用时间" suffix="分钟" type="number" value={form.available} onChange={(value) => updateForm('available', value)} />
    </div>
  );
}

function OtherFields({ form, preferences, updateForm, onAddQuickEntry }) {
  const options = form.options || preferences.other.options || '';
  function addEntry() {
    const firstOption = options.split(/[\n，,、；;]/).map((item) => item.trim()).find(Boolean);
    const entryLabel = form.rawText?.trim() || form.goal?.trim() || '自定义随机';
    onAddQuickEntry({
      label: entryLabel,
      text: form.rawText || '帮我从自定义选项里随机选一个',
      params: { options, goal: form.goal || '', constraint: form.constraint || '' },
    });
    if (!form.goal && firstOption) updateForm('goal', `${firstOption} 等选项`);
  }

  return (
    <div className="form-grid">
      <Input label="主要目标" value={form.goal || ''} onChange={(value) => updateForm('goal', value)} placeholder="例如：省时间 / 少花钱 / 不后悔" />
      <Input label="现实约束" value={form.constraint || ''} onChange={(value) => updateForm('constraint', value)} placeholder="例如：只有 30 分钟" />
      <div className="other-options-row">
        <label className="field">
          <span>候选选项</span>
          <textarea
            value={options}
            onChange={(event) => updateForm('options', event.target.value)}
            rows={5}
            placeholder="每行一个选项，例如：去图书馆 / 收拾房间 / 看电影"
          />
        </label>
        <button className="secondary-action" onClick={addEntry} type="button">
          <Plus size={18} />
          加入一键入口
        </button>
      </div>
    </div>
  );
}

function ResultView({ recommendation, request, onFeedback, onSwap, onNew }) {
  return (
    <section className="page narrow">
      <div className="result-panel">
        <p className="eyebrow">{typeText(request.type)}推荐</p>
        <h1>{recommendation.title}</h1>
        <div className="result-block">
          <strong>理由</strong>
          <p>{recommendation.reason}</p>
        </div>
        <div className="result-block">
          <strong>执行建议</strong>
          <p>{recommendation.steps}</p>
        </div>
        <div className="result-block">
          <strong>备用方案</strong>
          <p>{recommendation.backup}</p>
        </div>
        <div className="score-list">
          {recommendation.scoreBreakdown.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>

      <div className="feedback-row">
        <button onClick={() => onFeedback('adopted')}><Check size={17} />采纳</button>
        <button onClick={() => onFeedback('rejected')}><ThumbsDown size={17} />不采纳</button>
        <button onClick={onSwap}><RefreshCw size={17} />换一个</button>
      </div>
      <button className="secondary-action wide" onClick={onNew}>再问一个问题</button>
    </section>
  );
}

function HistoryView({ history, filter, setFilter }) {
  return (
    <section className="page">
      <div className="section-heading">
        <h1>历史记录</h1>
        <span>{history.length} 条记录</span>
      </div>
      <div className="segmented compact">
        {['all', 'food', 'outfit', 'study', 'other'].map((type) => (
          <button key={type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>
            {type === 'all' ? '全部' : typeText(type)}
          </button>
        ))}
      </div>
      <div className="history-list">
        {history.length === 0 && <p className="empty">还没有记录。完成一次推荐后，这里会显示采纳情况。</p>}
        {history.map((item) => (
          <article className="history-item" key={item.id}>
            <div>
              <span className="pill">{typeText(item.request.type)}</span>
              <h3>{item.recommendation.title}</h3>
              <p>{item.request.rawText}</p>
            </div>
            <div className="history-meta">
              <strong>{feedbackLabel(item.feedback)}</strong>
              <span>{new Date(item.request.createdAt).toLocaleString('zh-CN')}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsView({ preferences, setPreferences, onReset }) {
  function setNested(section, key, value) {
    setPreferences({
      ...preferences,
      [section]: { ...preferences[section], [key]: value },
    });
  }

  function setReminderTime(key, kind, value) {
    setPreferences({
      ...preferences,
      reminders: {
        ...preferences.reminders,
        [key]: value,
        items: (preferences.reminders.items || []).map((item) => (
          item.kind === kind ? { ...item, time: value } : item
        )),
      },
    });
  }

  return (
    <section className="page">
      <div className="section-heading">
        <h1>偏好设置</h1>
        <button className="secondary-action" onClick={onReset}>恢复默认</button>
      </div>
      <div className="settings-grid">
        <PreferencePanel title="饮食偏好">
          <Input label="预算范围" suffix="元" type="number" value={preferences.food.budget} onChange={(value) => setNested('food', 'budget', Number(value))} />
          <Input label="常吃内容" value={preferences.food.favorites} onChange={(value) => setNested('food', 'favorites', value)} />
          <Input label="忌口/少推荐" value={preferences.food.avoid} onChange={(value) => setNested('food', 'avoid', value)} />
        </PreferencePanel>
        <PreferencePanel title="穿衣偏好">
          <Input label="穿衣风格" value={preferences.outfit.style} onChange={(value) => setNested('outfit', 'style', value)} />
          <Input label="常用搭配" value={preferences.outfit.commonOutfits} onChange={(value) => setNested('outfit', 'commonOutfits', value)} />
          <Select label="冷热敏感" value={preferences.outfit.temperatureSensitivity} onChange={(value) => setNested('outfit', 'temperatureSensitivity', value)} options={['怕冷', '正常', '怕热']} />
        </PreferencePanel>
        <PreferencePanel title="学习偏好">
          <Input label="高效时段" value={preferences.study.bestTime} onChange={(value) => setNested('study', 'bestTime', value)} />
          <Input label="常见课程" value={preferences.study.courses} onChange={(value) => setNested('study', 'courses', value)} />
          <Input label="学习习惯" value={preferences.study.habit} onChange={(value) => setNested('study', 'habit', value)} />
        </PreferencePanel>
        <PreferencePanel title="环境与提醒">
          <Select label="默认天气" value={preferences.environment.weather} onChange={(value) => setNested('environment', 'weather', value)} options={['晴', '多云', '阴', '小雨', '大风']} />
          <Input label="默认温度" suffix="°C" type="number" value={preferences.environment.temperature} onChange={(value) => setNested('environment', 'temperature', Number(value))} />
          <Input label="早间提醒" type="time" value={preferences.reminders.morning} onChange={(value) => setReminderTime('morning', 'outfit', value)} />
          <Input label="午间提醒" type="time" value={preferences.reminders.noon} onChange={(value) => setReminderTime('noon', 'food', value)} />
          <Input label="晚间提醒" type="time" value={preferences.reminders.evening} onChange={(value) => setReminderTime('evening', 'study', value)} />
        </PreferencePanel>
      </div>
    </section>
  );
}

function PreferencePanel({ title, children }) {
  return (
    <article className="preference-panel">
      <h2>{title}</h2>
      <div className="panel-fields">{children}</div>
    </article>
  );
}

function Input({ label, value, onChange, suffix, type = 'text', placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function buildDailyTips(preferences, history, quickActions, now) {
  const fallback = [
    { id: 'morning-outfit', actionLabel: '今天穿什么', kind: 'outfit', time: preferences.reminders.morning },
    { id: 'noon-food', actionLabel: '今天吃什么', kind: 'food', time: preferences.reminders.noon },
    { id: 'evening-study', actionLabel: '现在先学什么', kind: 'study', time: preferences.reminders.evening },
  ];
  const items = Array.isArray(preferences.reminders.items) && preferences.reminders.items.length
    ? preferences.reminders.items
    : fallback;
  const currentTime = toTimeValue(now);

  return items.map((item, index) => {
    const action = resolveReminderAction(item, quickActions);
    const isDue = item.time <= currentTime;
    const request = makeRequest(action.text, { ...action.params, rawText: action.text, type: action.type });
    const generated = isDue ? generateRecommendation(request, preferences, history, index) : null;

    return {
      ...item,
      action,
      isDue,
      title: `${action.label}提醒`,
      status: isDue ? '已到时间，推荐已生成' : '等待到点自动生成',
      body: generated
        ? `${generated.title}。${generated.reason}`
        : `${item.time} 会自动触发「${action.label}」，到点后这里显示推荐结果。`,
    };
  }).sort((a, b) => a.time.localeCompare(b.time));
}

function resolveReminderAction(item, quickActions) {
  const matched = quickActions.find((action) => action.label === item.actionLabel)
    || quickActions.find((action) => action.type === item.kind)
    || quickActions[0];

  if (matched) return matched;

  return {
    label: item.actionLabel || item.title || '自定义选择',
    text: item.actionText || item.title || '帮我随机但合理地选一个',
    type: item.kind || 'other',
    params: item.params || {},
    icon: Wand2,
  };
}

function toTimeValue(date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function typeText(type) {
  return {
    food: '吃饭',
    outfit: '穿搭',
    study: '学习/任务',
    other: '其他选择',
  }[type];
}
