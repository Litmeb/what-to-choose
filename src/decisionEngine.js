const typeLabels = {
  food: '吃饭',
  outfit: '穿搭',
  study: '学习',
  other: '生活选择',
};

const USER_OPTION_RANDOMNESS = 8;

const foodOptions = [
  { name: '麻辣烫', price: 25, wait: 22, taste: '微辣', health: 62, step: '点常去店铺，蔬菜和蛋白质各选两样，主食减半。', backup: '如果不想吃辣，换成番茄砂锅。' },
  { name: '轻食饭', price: 30, wait: 18, taste: '清淡', health: 88, step: '选鸡胸肉或牛肉套餐，酱料分开放，饮料换成水。', backup: '如果想吃热乎的，换成砂锅粥。' },
  { name: '盖浇饭', price: 22, wait: 15, taste: '家常', health: 58, step: '选离宿舍近的店，米饭少一点，加一份青菜。', backup: '如果排队太久，换成便利店饭团加酸奶。' },
  { name: '砂锅粥', price: 26, wait: 25, taste: '清淡', health: 78, step: '选皮蛋瘦肉或鸡丝粥，配一份小菜，晚餐别点太撑。', backup: '如果时间紧，换成盖浇饭。' },
  { name: '食堂套餐', price: 18, wait: 10, taste: '家常', health: 70, step: '直接去最近窗口，按一荤两素组合，控制在 20 元内。', backup: '如果窗口太挤，换成盖浇饭。' },
  { name: '番茄牛腩饭', price: 28, wait: 20, taste: '家常', health: 72, step: '选少油版本，米饭半份，加一份青菜，适合想吃热乎但不重口的一餐。', backup: '如果牛腩售罄，换成番茄鸡蛋盖饭。' },
  { name: '鸡汤米线', price: 24, wait: 16, taste: '清淡', health: 74, step: '选清汤底，加青菜和鸡蛋，少放辣油，吃完更不容易犯困。', backup: '如果排队太长，换成砂锅粥。' },
  { name: '牛肉面', price: 23, wait: 14, taste: '家常', health: 61, step: '点小份或正常份，少加辣椒，多加青菜，适合赶课前快速解决。', backup: '如果想更清爽，换成鸡汤米线。' },
  { name: '日式肥牛饭', price: 27, wait: 18, taste: '家常', health: 60, step: '选温泉蛋或蔬菜套餐，酱汁少一点，预算控制在 30 元内。', backup: '如果今天想清淡，换成轻食饭。' },
  { name: '烤盘饭', price: 26, wait: 20, taste: '重口味', health: 52, step: '选鸡肉或牛肉，少加酱，配一份蔬菜，满足感强但别额外加炸物。', backup: '如果下午要学习，换成食堂套餐。' },
  { name: '饺子', price: 20, wait: 12, taste: '家常', health: 64, step: '点一份蒸饺或水饺，配紫菜汤，适合预算紧、想快点吃完。', backup: '如果不想面食，换成盖浇饭。' },
  { name: '沙县拌面套餐', price: 19, wait: 10, taste: '家常', health: 50, step: '拌面配蒸蛋或汤，别再加炸串，适合赶时间的午餐。', backup: '如果想更健康，换成轻食饭。' },
  { name: '酸菜鱼饭', price: 31, wait: 24, taste: '微辣', health: 57, step: '选小份微辣，米饭少一点，适合今天特别想吃下饭菜的时候。', backup: '如果预算要压低，换成麻辣烫。' },
  { name: '便利店饭团 + 酸奶', price: 16, wait: 5, taste: '清淡', health: 66, step: '拿一个饭团、一瓶酸奶，再加香蕉或茶叶蛋，适合课间快速补能。', backup: '如果还有 20 分钟空档，换成食堂套餐。' },
  { name: '热干面', price: 17, wait: 8, taste: '重口味', health: 45, step: '点小份，少酱少辣，配无糖豆浆，适合想省钱又想吃香的一餐。', backup: '如果胃口一般，换成鸡汤米线。' },
];

const outfitOptions = [
  { name: '卫衣 + 长裤 + 运动鞋', warm: 65, formal: 35, simple: 92, rain: 55, step: '带一件薄外套，鞋子选耐走的，上午出门前看一眼地面是否积水。', backup: '如果临时要见老师，外面加一件干净夹克。' },
  { name: '衬衫 + 直筒裤 + 小白鞋', warm: 52, formal: 68, simple: 72, rain: 45, step: '衬衫选免烫款，包里放伞，整体看起来清爽但不费力。', backup: '如果降温，加针织开衫。' },
  { name: '薄外套 + T 恤 + 牛仔裤', warm: 58, formal: 45, simple: 84, rain: 65, step: '外套选防风一点的，室内热了可以脱，适合课多的一天。', backup: '如果要正式一点，把 T 恤换成素色衬衫。' },
  { name: '针织衫 + 长裤 + 乐福鞋', warm: 73, formal: 74, simple: 62, rain: 38, step: '适合展示或小组汇报，颜色保持低饱和，别选太厚。', backup: '如果下雨，鞋子换成运动鞋。' },
  { name: '短袖 + 防晒衬衫 + 阔腿裤', warm: 38, formal: 44, simple: 80, rain: 42, step: '防晒衬衫当外搭，进教室可脱，颜色选浅色系，适合偏热的白天。', backup: '如果晚上降温，把阔腿裤换成长牛仔裤。' },
  { name: '风衣 + T 恤 + 直筒裤', warm: 68, formal: 66, simple: 70, rain: 72, step: '风衣选轻薄款，包里放伞，鞋子避开浅色帆布鞋。', backup: '如果风太大，换成连帽外套。' },
  { name: '棒球服 + 卫衣 + 工装裤', warm: 76, formal: 38, simple: 76, rain: 58, step: '适合早晚温差大的一天，内搭别太厚，方便室内调节。', backup: '如果要汇报，换成衬衫加直筒裤。' },
  { name: '西装外套 + 素色内搭 + 长裤', warm: 62, formal: 88, simple: 54, rain: 46, step: '适合面试、汇报或见老师，内搭保持纯色，整体干净利落。', backup: '如果当天活动多，鞋子换成干净运动鞋。' },
  { name: '毛衣 + 牛仔裤 + 板鞋', warm: 78, formal: 50, simple: 82, rain: 36, step: '毛衣选不过厚的，室内不会闷，适合阴天或气温偏低的日常课。', backup: '如果下雨，外面加防风外套。' },
  { name: '连帽外套 + 速干裤 + 运动鞋', warm: 56, formal: 24, simple: 90, rain: 78, step: '适合有体育课或通勤多的一天，外套选带帽款，应对小雨更省心。', backup: '如果临时正式场合，换成薄外套加牛仔裤。' },
  { name: '长袖 T 恤 + 马甲 + 休闲裤', warm: 66, formal: 42, simple: 79, rain: 48, step: '马甲提升保暖但不笨重，适合图书馆久坐和教室温差。', backup: '如果温度升高，去掉马甲即可。' },
  { name: 'POLO 衫 + 九分裤 + 小白鞋', warm: 44, formal: 70, simple: 74, rain: 40, step: '适合需要稍微精神一点但不正式的场合，颜色选白、灰、藏青。', backup: '如果降温，加薄针织开衫。' },
  { name: '羽绒马甲 + 卫衣 + 加绒裤', warm: 88, formal: 28, simple: 78, rain: 52, step: '适合低温但不想穿太臃肿，重点护住核心区域，鞋子选厚底。', backup: '如果风雨明显，外面换成防风外套。' },
  { name: '亚麻衬衫 + 短袖 + 休闲裤', warm: 34, formal: 56, simple: 73, rain: 30, step: '适合晴朗偏热的一天，衬衫可当防晒外搭，整体清爽。', backup: '如果教室空调冷，带一件薄开衫。' },
];

const otherOptions = [
  { name: '选执行成本最低、能马上开始的方案', reason: '低风险生活选择最怕拖延，先行动通常比反复比较更划算。', step: '给自己 10 分钟窗口，选目前阻力最小的一项，完成后再复盘。', backup: '如果仍然犹豫，用随机选择并承诺执行 30 分钟。' },
  { name: '选更接近当前主要目标的方案', reason: '当选项没有明显优劣时，让长期目标决定短期选择可以减少内耗。', step: '写下今天最重要的一件事，选择最能支持它的选项。', backup: '如果目标不清晰，先选不会造成后悔成本的选项。' },
  { name: '选不会影响明天状态的方案', reason: '很多日常选择真正的成本会延迟出现，优先保护睡眠、精力和第二天节奏。', step: '排除会明显透支体力或拖到很晚的选项，再从剩余方案里选最顺手的一个。', backup: '如果每个选项都消耗大，就选最短版本先完成。' },
  { name: '选能在 15 分钟内验证的方案', reason: '不确定时，小规模试错比长时间比较更可靠。', step: '给最有希望的选项设置 15 分钟试运行，到点后决定继续或切换。', backup: '如果 15 分钟都无法开始，换成执行门槛更低的选项。' },
  { name: '选能减少后续杂事的方案', reason: '一次选择如果能顺便清掉连带问题，整体收益通常更高。', step: '挑一个能同时解决两个小麻烦的选项，先把相关物品或资料准备好。', backup: '如果时间不够，就只完成它的第一步。' },
  { name: '选最近一直被拖延的方案', reason: '被反复拖延的事项会持续占用注意力，先处理它可以释放心理空间。', step: '把这个方案缩小成一个 10 分钟动作，只要求开始，不要求一次做完。', backup: '如果抗拒很强，先做准备动作，比如打开文档或收拾桌面。' },
  { name: '选对别人影响最小的方案', reason: '涉及室友、同学或团队时，低干扰方案更稳，也更少产生额外沟通成本。', step: '优先选择不占用他人时间、不制造噪音、不需要反复协调的选项。', backup: '如果必须协作，先发一条明确消息确认时间。' },
  { name: '选能让环境变清爽的方案', reason: '环境改善会降低后续任务阻力，尤其适合状态一般或注意力分散时。', step: '先处理桌面、文件、衣物或待办列表里最碍眼的一项。', backup: '如果没有力气整理，就只清出一个可工作的平面。' },
  { name: '选最符合当前精力等级的方案', reason: '高估精力容易半途而废，匹配状态的选择更容易完成。', step: '精力高就做难事，精力中等做推进型任务，精力低做整理或恢复。', backup: '如果判断不准，先从中等强度选项开始。' },
  { name: '选已经有现成资源的方案', reason: '材料、地点或工具已经准备好的选项，启动成本更低。', step: '查看身边现成资源，选择不用额外准备的一项，立刻进入执行。', backup: '如果缺关键资源，换成能在线完成或就地完成的选项。' },
  { name: '选完成后最有成就感的方案', reason: '当几个选择差不多时，成就感能帮助你进入下一件事。', step: '选一个完成边界清晰、结束后能打勾的选项，先做 30 分钟。', backup: '如果任务太大，就拆成一个能打勾的小步骤。' },
  { name: '选最不需要额外决策的方案', reason: '选择困难时继续制造子选择会更累，流程清楚的方案更适合立刻执行。', step: '挑步骤最明确的一项，按默认做法执行，不再优化细节。', backup: '如果执行中又卡住，使用第一个可行选项继续推进。' },
];

export function detectType(text) {
  const value = text.trim();
  if (/吃|饭|午餐|晚餐|外卖|食堂|饿|喝/.test(value)) return 'food';
  if (/穿|衣|搭配|下雨|温度|天气|上课穿|正式/.test(value)) return 'outfit';
  if (/学|复习|论文|考试|作业|任务|课程|先做|安排|ddl|截止/.test(value)) return 'study';
  return 'other';
}

export function makeRequest(rawText, params = {}) {
  const type = params.type || detectType(rawText);
  return {
    rawText,
    type,
    params: { ...params, type },
    createdAt: new Date().toISOString(),
  };
}

export function generateRecommendation(request, preferences, history, variant = 0) {
  if (request.type === 'food') return recommendFood(request, preferences, history, variant);
  if (request.type === 'outfit') return recommendOutfit(request, preferences, history, variant);
  if (request.type === 'study') return recommendStudy(request, preferences, history, variant);
  return recommendOther(request, preferences, history, variant);
}

export function feedbackLabel(feedback) {
  return {
    adopted: '已采纳',
    rejected: '不采纳',
    swapped: '已换一个',
    avoidSimilar: '少推荐记录',
    none: '未反馈',
  }[feedback] || '未反馈';
}

function recommendFood(request, preferences, history, variant) {
  const p = request.params;
  const budget = Number(p.budget || preferences.food.budget);
  const wait = Number(p.wait || 25);
  const taste = p.taste || preferences.food.tastes[0];
  const healthy = p.healthy ?? preferences.food.healthy;
  const avoid = `${preferences.food.avoid} ${p.avoid || ''}`;
  const scores = foodOptions.map((option, index) => {
    let score = 50;
    if (option.price <= budget) score += 18;
    else score -= (option.price - budget) * 2;
    if (option.wait <= wait) score += 14;
    if (option.taste === taste) score += 16;
    if (healthy) score += option.health / 8;
    score += historyBias(history, option.name);
    if (avoid && avoid.includes(option.name)) score -= 30;
    score += variety(index, variant);
    return { option, score: Math.round(score) };
  }).sort((a, b) => b.score - a.score);
  const best = scores[0];
  return buildRecommendation({
    type: 'food',
    title: `今天建议吃${best.option.name}`,
    reason: `它大概率能控制在 ${budget} 元预算附近，等待时间较短，并且符合你当前的${taste}偏好。`,
    steps: best.option.step,
    backup: best.option.backup,
    scoreBreakdown: [
      `预算匹配：${best.option.price} 元`,
      `预计等待：${best.option.wait} 分钟`,
      `健康度：${best.option.health}/100`,
      `记忆权重：${historyBias(history, best.option.name)}`,
    ],
  });
}

function recommendOutfit(request, preferences, history, variant) {
  const p = request.params;
  const temp = Number(p.temperature || preferences.environment.temperature);
  const rain = (p.rain || preferences.environment.rain) !== '无雨';
  const formal = p.activity === '汇报/面试' || p.formal === '需要';
  const simple = p.state === '想简单出门';
  const scores = outfitOptions.map((option, index) => {
    let score = 45;
    score += Math.max(0, 25 - Math.abs(option.warm - idealWarmth(temp)));
    if (rain) score += option.rain / 5;
    if (formal) score += option.formal / 4;
    if (simple) score += option.simple / 4;
    score += historyBias(history, option.name);
    score += variety(index, variant);
    return { option, score: Math.round(score) };
  }).sort((a, b) => b.score - a.score);
  const best = scores[0];
  return buildRecommendation({
    type: 'outfit',
    title: `今天建议穿${best.option.name}`,
    reason: `${temp}°C、${p.weather || preferences.environment.weather}${rain ? '且可能有雨' : ''}，这套兼顾舒适度和今天的活动需求。`,
    steps: best.option.step,
    backup: best.option.backup,
    scoreBreakdown: [
      `保暖匹配：${best.option.warm}/100`,
      `正式度：${best.option.formal}/100`,
      `省心程度：${best.option.simple}/100`,
      `记忆权重：${historyBias(history, best.option.name)}`,
    ],
  });
}

function recommendStudy(request, preferences, history, variant) {
  const tasks = parseTasks(request.params.tasks || request.rawText, preferences.study.courses);
  const energy = request.params.energy || '中等';
  const available = Number(request.params.available || 120);
  const scored = tasks.map((task, index) => {
    let score = task.urgency * 22 + task.importance * 18 + task.difficulty * 12;
    if (energy === '低') score -= task.difficulty * 6;
    if (available < 60 && task.difficulty >= 4) score -= 12;
    score += historyBias(history, task.name);
    score += variety(index, variant);
    return { task, score: Math.round(score) };
  }).sort((a, b) => b.score - a.score);
  const best = scored[0];
  return buildRecommendation({
    type: 'study',
    title: `现在先做：${best.task.name}`,
    reason: `它的紧急度和重要度最高，适合用你当前 ${available} 分钟的可用时间先推进。`,
    steps: `先用 25 分钟处理最卡的一小块，再休息 5 分钟；完成后把剩余任务按截止时间重排。`,
    backup: `如果状态突然变差，先做 15 分钟资料整理或错题标记，保持推进。`,
    scoreBreakdown: [
      `紧急度：${best.task.urgency}/5`,
      `重要度：${best.task.importance}/5`,
      `难度：${best.task.difficulty}/5`,
      `精力状态：${energy}`,
    ],
  });
}

function recommendOther(request, preferences, history, variant) {
  const userOptions = parseChoiceOptions(request.params.options || preferences.other?.options || '');
  if (userOptions.length) {
    const weighted = userOptions.map((name, index) => {
      const preference = Number(preferences.other?.weights?.[name] || 0);
      const historyScore = historyBias(history, name);
      const random = randomScore(variant, index) * USER_OPTION_RANDOMNESS;
      return {
        name,
        preference,
        history: historyScore,
        random,
        score: preference + historyScore + random,
      };
    }).sort((a, b) => b.score - a.score);
    const best = weighted[0];
    return buildRecommendation({
      type: 'other',
      title: `随机抽到：${best.name}`,
      reason: '这次从你填写的选项里随机抽取，同时保留偏好和历史反馈影响；随机波动稍微变大，让接近的选项更容易轮换出现。',
      steps: `直接执行「${best.name}」，先给它一个明确的开始动作。`,
      backup: `如果现在确实不适合，就在剩余选项里再抽一次，但只重抽一次。`,
      scoreBreakdown: [
        `候选项：${userOptions.length} 个`,
        `偏好权重：${best.preference}`,
        `历史权重：${best.history}`,
        `随机扰动：${best.random.toFixed(1)}`,
      ],
    });
  }

  const option = otherOptions[variant % otherOptions.length];
  return buildRecommendation({
    type: 'other',
    title: option.name,
    reason: option.reason,
    steps: option.step,
    backup: option.backup,
    scoreBreakdown: [
      `问题类型：${typeLabels.other}`,
      `历史相似采纳：${history.filter((item) => item.feedback === 'adopted' && item.request.type === 'other').length} 次`,
    ],
  });
}

function buildRecommendation(data) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    ...data,
  };
}

function parseTasks(text, fallbackCourses) {
  const source = text.trim() || fallbackCourses;
  const pieces = source
    .split(/[，,、\n；;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
  const base = pieces.length ? pieces : ['高数复习', '英语阅读', '论文写作'];
  return base.map((name, index) => ({
    name,
    urgency: /明天|今晚|ddl|截止|考试/.test(name) ? 5 : Math.max(2, 5 - index),
    importance: /考试|论文|高数|专业/.test(name) ? 5 : 3,
    difficulty: /高数|论文|专业|考试/.test(name) ? 4 : 2 + (index % 2),
  }));
}

function parseChoiceOptions(text) {
  return String(text || '')
    .split(/[\n，,、；;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function historyBias(history, name) {
  return history.reduce((sum, item) => {
    if (!item.recommendation.title.includes(name)) return sum;
    if (item.feedback === 'adopted') return sum + 10;
    if (item.feedback === 'avoidSimilar') return sum - 18;
    if (item.feedback === 'rejected') return sum - 8;
    return sum;
  }, 0);
}

function idealWarmth(temp) {
  if (temp <= 8) return 90;
  if (temp <= 15) return 75;
  if (temp <= 23) return 60;
  if (temp <= 30) return 42;
  return 25;
}

function variety(index, variant) {
  return ((index + 1) * 7 + variant * 13) % 17;
}

function randomScore(variant, index) {
  const value = Math.sin((variant + 1) * 999 + (index + 3) * 1337) * 10000;
  return value - Math.floor(value);
}
