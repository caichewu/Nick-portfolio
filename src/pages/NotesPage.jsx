import React, { useEffect, useMemo, useState } from 'react';
import FadeInWhenVisible from '../components/FadeInWhenVisible';

const NotesPage = () => {
  const titleText = 'Nick 的碎碎念';
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState('');
  const [openSection, setOpenSection] = useState('');
  const [typedTitle, setTypedTitle] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredDateId, setHoveredDateId] = useState('');
  const [entryOpen, setEntryOpen] = useState(false);
  const [panel, setPanel] = useState('');
  const [floatNudge, setFloatNudge] = useState(() => {
    try {
      return !localStorage.getItem('nick_notes_float_seen_v1');
    } catch {
      return false;
    }
  });
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: '我系 Nick 的 AI 替身。湖南口味，话不多但不冷血：能帮你把事捋顺、给步骤、做清单。隐私/违法/医疗法律这种就不聊咯。你想先聊啥？作品集、学习，还是 AI 训练？' },
  ]);
  const [guestbookName, setGuestbookName] = useState('');
  const [guestbookText, setGuestbookText] = useState('');
  const [guestbookItems, setGuestbookItems] = useState(() => {
    try {
      const raw = localStorage.getItem('nick_guestbook_v1');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const notes = useMemo(
    () => [
      {
        date: '2026-04-03',
        title: 'Nick 的碎碎念：把复杂的事做简单',
        intro: '做硬件平台最难的不是做出一个功能，而是把规则、数据、流程统一起来，让系统在变复杂时依然可控。',
        sections: [
          {
            key: 'do',
            label: '关于做事',
            items: [
              '先完成，再完美。很多时候我们卡在“准备阶段”，其实迈出第一步就已经赢了大多数人。粗糙的开始胜过完美的犹豫。',
              '设定“最低可行努力”。不想运动时，告诉自己“只换鞋出门走五分钟”；不想学习时，告诉自己“只打开书看一页”。惯性一旦启动，往往会做得更多。',
              '保护你的注意力。它比时间更稀缺。做事时手机放另一个房间，关闭通知，进入“深度工作”状态。质量永远打败数量。',
              '接受波动。状态好就多做一些，状态差就允许自己少做一些。人生是马拉松，不是每一天都要冲刺。',
            ],
          },
          {
            key: 'learn',
            label: '关于学习',
            items: [
              '输出倒逼输入。看完书试着讲给别人听，学完知识马上做一道题。能用自己的话讲清楚，才是真懂了。',
              '间隔重复 > 临时突击。今天学一点、明天复习一点，比考前熬夜有效得多。大脑需要时间来“消化”信息。',
              '建立知识连接。不要孤立地记知识点，多问“这和之前学的有什么关系？”知识网络越密，记得越牢。',
              '允许自己“笨”。遇到不懂的很正常，卡住的时候正是大脑在建立新连接。别急着否定自己，多问、多查、多试错。',
              '休息也是学习的一部分。散步、发呆、睡觉，都是大脑在后台整理信息。别觉得“没在学习”就是浪费时间。',
            ],
          },
          {
            key: 'act',
            label: '敢做比敢想更重要',
            items: [
              '想都是问题，做才有答案。大脑擅长编织“万一失败”的剧情，但真实世界里，大部分恐惧在迈出第一步后就会消散。你不是在“想清楚”后行动，而是在行动中想清楚的。',
              '小步快跑，快速验证。不用等一个完美的计划，做个粗糙的版本丢出去，让真实反馈告诉你方向对不对。市场、成绩、他人的反应——这些才是靠谱的指南针。',
              '允许自己“浪费”第一步。第一次尝试大概率笨拙、难看、不尽人意，但这恰恰是入场券。那些看起来从容的人，只是比你多“浪费”了几次而已。',
              '行动本身会改变你。不是“准备好了才去做”，而是“做了才慢慢准备好”。能力、信心、资源，往往是在过程中长出来的，不是等来的。',
              '当然，敢想也有价值——但想太久就是逃避。区分“战略性思考”和“拖延性焦虑”：前者有 deadline、有框架、有下一步；后者是循环播放的“如果……怎么办”。',
            ],
          },
        ],
      },
      {
        date: '2026-03-18',
        title: '关于“指标”',
        content: '指标不是用来好看，而是用来对齐目标和推动协作的。找一个能反映真实体验的指标，持续迭代。',
      },
      {
        date: '2026-04-03',
        title: '如何做好 AI 训练师',
        sections: [
          {
            key: 'mindset',
            label: '心态与目标',
            items: [
              '把自己当成“质量负责人”，而不是只做任务的人：你的产出决定模型学到什么、学得有多稳。',
              '先定义“好答案”的标准：准确、完整、可复现、可解释，避免只追求速度。',
              '用“错误案例”驱动进步：记录常见误判/漏判/歧义点，持续迭代规则与示例库。',
            ],
          },
          {
            key: 'rules',
            label: '标注规范',
            items: [
              '规范要“可操作”：每条规则尽量配 2-3 个正例/反例，减少主观发挥空间。',
              '遇到模糊边界先建“兜底策略”：例如优先级、冲突处理、无法判断时的标记方式。',
              '版本化管理：规则改动要记录原因、影响范围与生效时间，避免同一数据集口径不一致。',
            ],
          },
          {
            key: 'data',
            label: '数据与分布',
            items: [
              '关注数据分布而非数量：类别不平衡会让模型“偏科”，要主动补齐长尾与关键场景。',
              '做抽检与一致性：双人标注/仲裁机制、抽检比例、Kappa/一致率指标，确保可控。',
              '建立“困难样本池”：把模型容易错的样本长期沉淀下来，作为迭代的靶子。',
            ],
          },
          {
            key: 'prompt',
            label: '提示词与评测',
            items: [
              '输出可复现：同样输入在不同时间/不同人手里，应该得到一致结论。',
              '评测要贴近真实场景：把业务最关心的失败方式（幻觉、遗漏、错误拒答）纳入评测集。',
              '把评测变成闭环：发现问题 -> 归因（数据/规则/提示/模型）-> 修正 -> 回归验证。',
            ],
          },
          {
            key: 'habits',
            label: '工作习惯',
            items: [
              '所有决策“留痕”：为什么这样标、为什么改规则、为什么判为歧义，方便复盘和对齐。',
              '用清单减少低级错误：输入检查、标签检查、边界检查、敏感信息检查。',
              '持续学习领域知识：模型训练不是纯体力活，懂业务语境才能把规则写得对、判得稳。',
            ],
          },
        ],
      },
      {
        date: '2026-02-05',
        title: '产品经理的边界',
        content: '边界感来自对问题的理解：什么该推动、什么该放手、什么该交给机制。',
      },
    ],
    [],
  );

  const quotePool = useMemo(
    () => [
      '先完成，再完美。',
      '粗糙的开始，胜过完美的犹豫。',
      '注意力比时间更稀缺。',
      '小步快跑，快速验证。',
      '输出倒逼输入。',
      '接受波动，别跟自己较劲。',
    ],
    [],
  );

  const [quote] = useState(() => quotePool[Math.floor(Math.random() * quotePool.length)]);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedTitle(titleText.slice(0, i));
      if (i >= titleText.length) window.clearInterval(id);
    }, 90);
    return () => window.clearInterval(id);
  }, [titleText]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      setScrollProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      if (!floatNudge) return;
      localStorage.setItem('nick_notes_float_seen_v1', '1');
      const t = window.setTimeout(() => setFloatNudge(false), 900);
      return () => window.clearTimeout(t);
    } catch {
      return undefined;
    }
  }, [floatNudge]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const text = [
        n.title,
        n.intro,
        n.content,
        ...(n.sections ? n.sections.flatMap((s) => [s.label, ...(s.items || [])]) : []),
      ]
        .filter(Boolean)
        .join(' ');
      return text.toLowerCase().includes(q);
    });
  }, [notes, query]);

  const getExcerpt = (note) => {
    const base = [
      note.intro,
      note.content,
      ...(note.sections ? note.sections.flatMap((s) => s.items || []) : []),
    ]
      .filter(Boolean)
      .join(' ');
    const text = String(base || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const max = 64;
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  const getRelativeDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.floor((startToday.getTime() - d.getTime()) / 86400000);
    if (days <= 0) return '今天';
    if (days === 1) return '1天前';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
  };

  const closePanel = () => {
    setPanel('');
    setEntryOpen(false);
  };

  const openAi = () => {
    setPanel('ai');
    setEntryOpen(false);
  };

  const openGuestbook = () => {
    setPanel('guestbook');
    setEntryOpen(false);
  };

  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const aiReply = (text, lastAiText) => {
    const t = String(text || '').trim();
    const lower = t.toLowerCase();
    const end = '你随便回一句也行：你想达成啥，或者你卡在哪。';
    if (!t) return `先别空着咯。你今天最烦的是啥？${end}`;
    if (lower.includes('隐私') || t.includes('身份证') || t.includes('银行卡') || t.includes('账号') || t.includes('密码')) {
      return '这种别发给我咯。你只讲“问题现象 + 你想达成什么”，敏感信息全部打码。';
    }
    if (
      t.includes('僵硬') ||
      t.includes('机器人') ||
      t.includes('灵活') ||
      t.includes('不像人') ||
      t.includes('别那么') ||
      t.includes('太死板')
    ) {
      return pick([
        '行咯，我放松点讲话。你现在想聊啥：作品集、学习、AI 训练，还是随便唠两句？',
        '可以更像个人咯。你先抛个具体问题，我按你说话的节奏来，不跟你背模板。',
        '晓得咯。你讲重点：你要我帮你“想办法”，还是帮你“把事做成”？',
      ]);
    }
    if (t.includes('没改') || t.includes('没有改') || t.includes('还是那样') || t.includes('没变化')) {
      return pick([
        '哪里没改到位？是语气、内容，还是一直在重复？你把你刚刚那句原话再发一遍我看看。',
        '你说“没改”，我理解可能是我没接住。你把你要的效果讲一句：更温柔？更高冷？更像兄弟？',
      ]);
    }
    if (t.includes('吃') || t.includes('菜') || t.includes('做饭') || t.includes('拌面') || t.includes('辣椒炒肉')) {
      return `行咯，湖南人这题会一点。辣椒炒肉拌面我给你一个不翻车版本：\n1）肉：梅花肉/五花瘦多点，切薄片，盐+生抽+一点淀粉抓匀，腌 10 分钟。\n2）椒：青椒斜切，别太细，锅热下油，先把肉大火滑散到变色就先盛出。\n3）回锅：同锅下蒜片+豆豉（有就更香），下青椒大火炒到断生，回肉，来一勺生抽+少许老抽上色，出锅前一点点醋提味。\n4）拌面：面煮好过冷水，拌一勺猪油/香油+少许生抽，再盖上辣椒炒肉。\n你能吃多辣？还有你家有豆豉吗？`;
    }
    if (t.includes('你给我做') || t.includes('帮我做') || t.includes('直接给我做') || t.includes('替我做')) {
      return pick([
        '可以咯。你把需求讲清楚点：你要我做的是文案、规划，还是代码？你现在这件事的目标是什么？',
        '行，那我来带你做。你先回三样：你现在的现状一句话、你要的结果一句话、你能投入的时间。',
        '没问题。你先把你手头的材料/链接/截图丢过来，我按步骤给你做成一个可用版本。',
      ]);
    }
    if (lower.includes('简历') || t.includes('作品集') || t.includes('面试')) {
      return `可以咯。你把目标岗位 + 城市 + 你最强的 1 个项目（做了啥/结果/你负责哪块）发我，我帮你把“定位一句话 + 3 个量化成果 + 项目结构”顺一遍。${end}`;
    }
    if (t.includes('焦虑') || t.includes('拖延') || t.includes('坚持') || t.includes('自律')) {
      return `我懂你那个感觉咯。先别硬扛，把任务缩到“最低可行努力”，先做 5 分钟就行。做起来以后，再顺手多做一点。你现在拖的是哪一件事？`;
    }
    if (t.includes('学习') || t.includes('训练') || t.includes('提升')) {
      return `学习别贪多咯。今天学一点点，马上做个输出（笔记/复述/小实验）就够了；明天再回看 10 分钟。你现在在学啥？`;
    }
    if (t.includes('AI') || t.includes('训练师') || t.includes('标注') || t.includes('数据') || t.includes('评测')) {
      return `AI 训练这块，核心就两句：口径一致 + 迭代闭环。规则清楚、抽检一致率有数、错例池沉淀、回归评测跑起来，就稳。你现在做的是文本、图片，还是对话数据？随便回一个。`;
    }
    if (t.includes('怎么做') || t.includes('怎么办') || t.includes('计划') || t.includes('路线')) {
      return `可以，我不跟你空谈咯。你给我 3 个信息：现状一句话、目标一句话、约束（时间/资源）一句话。我就给你一套 3 步计划。`;
    }
    const fallback = pick([
      '嗯，讲得明白。你更想我给你一个方向，还是直接给你一套可执行的步骤？',
      '行，我懂你意思。你把“你现在手上有什么 + 你想要什么”这两句补一下，我就能往下走。',
      '可以。你先说清楚一个点：你要的是结果，还是过程？',
    ]);
    if (fallback === lastAiText) {
      return pick([
        '我明白了。你现在卡住的那一步是什么？一句话讲清楚就行。',
        '行咯。你把你最想解决的 1 个问题讲清楚，我先给你一个能落地的做法。',
      ]);
    }
    return fallback;
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => {
      const lastAiText = [...prev].reverse().find((m) => m.role === 'ai')?.text;
      const reply = aiReply(text, lastAiText);
      return [...prev, { role: 'user', text }, { role: 'ai', text: reply }];
    });
    setChatInput('');
  };

  const saveGuestbook = () => {
    const name = guestbookName.trim() || '匿名';
    const text = guestbookText.trim();
    if (!text) return;
    const item = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name, text, at: new Date().toISOString() };
    setGuestbookItems((prev) => {
      const next = [item, ...prev].slice(0, 50);
      try {
        localStorage.setItem('nick_guestbook_v1', JSON.stringify(next));
      } catch {
        return next;
      }
      return next;
    });
    setGuestbookText('');
    setGuestbookName('');
  };

  return (
    <section className="relative py-20 px-6 transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-transparent">
        <div className="h-full bg-primary" style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      <div className="fixed right-6 top-24 z-50">
        <div className="relative group">
          {(() => {
            const hour = new Date().getHours();
            const isLate = hour >= 22;
            const icon = isLate ? '🌙' : '🤖';
            const tip = isLate ? 'Nick 睡了，AI 醒着' : '聊聊？';
            const idle = !entryOpen && !panel;
            return (
              <>
          <button
            type="button"
            className={[
              'ui-btn w-12 h-12 rounded-full flex items-center justify-center border border-ui-border bg-dark-card/70 backdrop-blur-sm',
              'shadow-[0_0_18px_rgba(57,255,20,0.14)]',
              idle ? 'float-breathe' : '',
              floatNudge ? 'float-shake' : '',
            ].join(' ')}
            aria-label="AI 替身与留言板入口"
            onClick={() => setEntryOpen((v) => !v)}
          >
            {icon}
          </button>
          <div className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            <div className="ui-card rounded-lg px-3 py-2 border border-ui-border bg-dark-card/85 backdrop-blur-sm text-xs text-light-text whitespace-nowrap">
              {tip}
            </div>
          </div>

          {entryOpen ? (
            <div className="absolute right-0 mt-3 w-[240px] ui-card rounded-xl border border-ui-border bg-dark-card/85 backdrop-blur-sm overflow-hidden">
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm text-light-text hover:bg-black/20"
                onClick={openAi}
              >
                🤖 和 AI 聊聊
              </button>
              <div className="h-px bg-ui-border/70" />
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm text-light-text hover:bg-black/20"
                onClick={openGuestbook}
              >
                📝 写留言
              </button>
            </div>
          ) : null}
              </>
            );
          })()}
        </div>
      </div>

      {panel ? (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) closePanel();
          }}
        >
          <div className="ui-card w-full max-w-[760px] rounded-2xl border border-ui-border bg-dark-card/90 backdrop-blur-sm shadow-[0_0_36px_rgba(57,255,20,0.14)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ui-border">
              <div className="text-sm font-semibold text-light-text">
                {panel === 'ai' ? '🤖 Nick 的 AI 替身' : '📝 留言板'}
              </div>
              <button type="button" className="ui-btn px-3 py-2 rounded-md text-xs" onClick={closePanel}>
                关闭
              </button>
            </div>

            {panel === 'ai' ? (
              <div className="px-5 py-4">
                <div className="h-[320px] overflow-auto rounded-xl border border-ui-border bg-black/20 p-4 space-y-3">
                  {chatMessages.map((m, i) => (
                    <div
                      key={`${m.role}-${i}`}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-xl px-4 py-2 text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-primary text-light-bg'
                            : 'bg-dark-card/70 border border-ui-border text-light-text'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendChat();
                    }}
                    placeholder="输入一句话，回车发送"
                    className="flex-1 px-4 py-2 rounded-md border border-ui-border bg-dark-card/40 backdrop-blur-sm text-light-text outline-none"
                  />
                  <button type="button" className="ui-btn px-4 py-2 rounded-md" onClick={sendChat}>
                    发送
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="ui-card rounded-xl border border-ui-border bg-black/20 p-4">
                    <div className="text-xs text-dark-subtext">写点什么</div>
                    <input
                      value={guestbookName}
                      onChange={(e) => setGuestbookName(e.target.value)}
                      placeholder="你的称呼（可选）"
                      className="mt-3 w-full px-4 py-2 rounded-md border border-ui-border bg-dark-card/40 backdrop-blur-sm text-light-text outline-none"
                    />
                    <textarea
                      value={guestbookText}
                      onChange={(e) => setGuestbookText(e.target.value)}
                      placeholder="留言内容"
                      rows={5}
                      className="mt-3 w-full px-4 py-2 rounded-md border border-ui-border bg-dark-card/40 backdrop-blur-sm text-light-text outline-none resize-none"
                    />
                    <div className="mt-3 flex justify-end">
                      <button type="button" className="ui-btn px-4 py-2 rounded-md" onClick={saveGuestbook}>
                        提交
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] text-dark-subtext">本地保存（当前浏览器可见），无需登录。</div>
                  </div>

                  <div className="ui-card rounded-xl border border-ui-border bg-black/20 p-4">
                    <div className="text-xs text-dark-subtext">最新留言</div>
                    <div className="mt-3 h-[260px] overflow-auto space-y-3">
                      {guestbookItems.length ? (
                        guestbookItems.map((it) => (
                          <div key={it.id} className="rounded-xl border border-ui-border bg-dark-card/50 px-4 py-3">
                            <div className="text-xs text-primary">{it.name}</div>
                            <div className="mt-1 text-sm text-light-text leading-relaxed">{it.text}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-dark-subtext">还没有留言，来做第一个。</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="container mx-auto max-w-[980px]">
        <FadeInWhenVisible>
          <h2 className="text-4xl font-bold text-center mb-4 text-light-text dark:text-dark-text">
            {typedTitle}
            <span className="type-cursor" aria-hidden="true" />
          </h2>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.08}>
          <div className="text-center text-light-subtext dark:text-dark-subtext">
            记录一些想法、总结与小片段。
          </div>
        </FadeInWhenVisible>

        <div className="mt-10">
          <div className="text-center text-xs text-dark-subtext">{quote}</div>
          <div className="flex items-center gap-3 justify-center">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenId('');
                setOpenSection('');
                setEntryOpen(false);
                setPanel('');
              }}
              placeholder="搜索标题 / 内容"
              className="w-full max-w-[420px] px-4 py-2 rounded-md border border-ui-border bg-dark-card/40 backdrop-blur-sm text-light-text dark:text-dark-text outline-none mt-3"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            {filtered.map((n) => {
              const id = `${n.date}-${n.title}`;
              const isOpen = openId === id;
              const hasSections = Array.isArray(n.sections) && n.sections.length > 0;
              const sectionKey = isOpen ? openSection || n.sections?.[0]?.key || '' : '';
              const currentSection = hasSections ? n.sections.find((s) => s.key === sectionKey) || n.sections[0] : null;
              return (
                <FadeInWhenVisible key={id} delay={0.05}>
                  <div className="ui-card note-card rounded-xl p-6">
                    <button
                      type="button"
                      className="w-full text-left"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setOpenId((prev) => (prev === id ? '' : id));
                        setOpenSection('');
                      }}
                    >
                      <div className="text-xs text-primary tracking-wider">
                        <span
                          className="inline-block"
                          onMouseEnter={() => setHoveredDateId(id)}
                          onMouseLeave={() => setHoveredDateId('')}
                        >
                          {hoveredDateId === id ? getRelativeDate(n.date) : n.date}
                        </span>
                      </div>
                      <div className="mt-1 text-xl font-semibold text-light-text dark:text-dark-text">{n.title}</div>
                      <div className="mt-3 text-light-subtext dark:text-dark-subtext leading-relaxed">
                        {isOpen ? '点击收起' : getExcerpt(n)}
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="mt-4 text-light-subtext dark:text-dark-subtext leading-relaxed">
                        {n.intro ? <div className="mb-4">{n.intro}</div> : null}
                        {hasSections ? (
                          <div>
                            <div className="flex flex-wrap gap-2">
                              {n.sections.map((s) => (
                                <button
                                  key={s.key}
                                  type="button"
                                  className={`ui-btn px-3 py-1.5 rounded-md text-xs ${sectionKey === s.key ? 'bg-primary text-light-bg border-primary' : ''}`}
                                  onClick={() => setOpenSection(s.key)}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                            <div className="mt-4 space-y-3">
                              {currentSection?.items?.map((t, i) => (
                                <div key={`${currentSection.key}-${i}`}>{t}</div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>{n.content}</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </FadeInWhenVisible>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotesPage;
