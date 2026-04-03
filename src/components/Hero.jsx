
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const MotionDiv = motion.div;
  const blobRef = useRef(null);
  const tailRef = useRef(null);
  const stageRef = useRef(null);
  const [wechatCopied, setWechatCopied] = useState(false);
  const wechatId = '19973857183';
  const [altName, setAltName] = useState(false);
  const [showTitles, setShowTitles] = useState(true);
  const clickTimesRef = useRef([]);
  const [burst, setBurst] = useState(false);
  const [wechatTilt, setWechatTilt] = useState({ rx: 0, ry: 0 });
  const [wechatHover, setWechatHover] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [wechatFlash, setWechatFlash] = useState(false);
  const tagRefs = useRef([]);
  const rafRef = useRef(0);
  const [tagOffsets, setTagOffsets] = useState([]);
  const [hoverInfo, setHoverInfo] = useState('');

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  };

  const triggerEaster = () => {
    const now = Date.now();
    const next = [...clickTimesRef.current, now].filter((t) => now - t <= 650);
    clickTimesRef.current = next;
    if (next.length >= 3) {
      clickTimesRef.current = [];
      setAltName((v) => !v);
      setShowTitles((v) => !v);
      setBurst(true);
      window.setTimeout(() => setBurst(false), 700);
    }
  };

  const tagItems = [
    { front: 'UI/UX DESIGN', back: '作品：3' },
    { front: 'FIGMA EXPERT', back: '偏好：暗黑科技' },
    { front: 'AIGC CREATOR', back: '最近：训练/评测' },
  ];

  const onTagMove = (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const next = tagItems.map((_, i) => {
        const el = tagRefs.current[i];
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const vx = cx - mx;
        const vy = cy - my;
        const dist = Math.hypot(vx, vy);
        const radius = 120;
        if (!dist || dist > radius) return { x: 0, y: 0 };
        const k = (1 - dist / radius) * 18;
        return { x: (vx / dist) * k, y: (vy / dist) * k };
      });
      setTagOffsets(next);
    });
  };

  const resetTags = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTagOffsets(tagItems.map(() => ({ x: 0, y: 0 })));
  };
  useEffect(() => {
    const stage = stageRef.current;
    const blob = blobRef.current;
    const tail = tailRef.current;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let vx = 0;
    let vy = 0;
    let running = true;
    const onMove = (e) => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };
    const onClick = (e) => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const ring = document.createElement('span');
      ring.style.position = 'absolute';
      ring.style.left = `${cx}px`;
      ring.style.top = `${cy}px`;
      ring.style.width = '12px';
      ring.style.height = '12px';
      ring.style.border = '1px solid rgba(57,255,20,0.8)';
      ring.style.borderRadius = '9999px';
      ring.style.transform = 'translate(-50%, -50%) scale(0.7)';
      ring.style.opacity = '1';
      ring.style.transition = 'transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms linear';
      stage.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transform = 'translate(-50%, -50%) scale(8)';
        ring.style.opacity = '0';
      });
      setTimeout(() => {
        stage.removeChild(ring);
      }, 800);
    };
    const loop = () => {
      if (!blob || !stage) return;
      vx += (targetX - x) * 0.12;
      vy += (targetY - y) * 0.12;
      vx *= 0.78;
      vy *= 0.78;
      x += vx;
      y += vy;
      blob.style.transform = `translate(${x}px, ${y}px)`;
      const speed = Math.min(1, Math.hypot(vx, vy) / 18);
      const scale = 1 + speed * 0.15;
      blob.style.scale = `${scale}`;
      tx += (x - tx) * 0.08;
      ty += (y - ty) * 0.08;
      if (tail) tail.style.transform = `translate(${tx}px, ${ty}px)`;
      const rect = stage.getBoundingClientRect();
      const px = Math.min(100, Math.max(0, (x / Math.max(1, rect.width)) * 100));
      const py = Math.min(100, Math.max(0, (y / Math.max(1, rect.height)) * 100));
      stage.style.setProperty('--px', `${100 - px}%`);
      stage.style.setProperty('--py', `${100 - py}%`);
      if (running) requestAnimationFrame(loop);
    };
    // 全屏范围监听
    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    requestAnimationFrame(loop);
    return () => {
      running = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-[88vh] flex items-center bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* 全域交互舞台（覆盖整个 Hero 区域） */}
      <div
        ref={stageRef}
        className="pointer-events-none absolute inset-0"
        style={{ '--px': '60%', '--py': '50%' }}
      >
        <MotionDiv
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(60% 60% at var(--px) var(--py), rgba(168,85,247,0.45) 0%, rgba(0,0,0,0) 60%), radial-gradient(50% 50% at calc(100% - var(--px)) var(--py), rgba(59,130,246,0.35) 0%, rgba(0,0,0,0) 60%)',
            filter: 'blur(18px)',
          }}
          animate={{
            opacity: burst ? 0.95 : [0.55, 0.75, 0.55],
            scale: burst ? 1.18 : [1, 1.06, 1],
          }}
          transition={{ duration: burst ? 0.6 : 4.6, repeat: burst ? 0 : Infinity, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute w-10 h-10 rounded-full pointer-events-none" ref={blobRef} style={{ transform: 'translate(50%, 50%)' }}>
          <div className="w-full h-full rounded-full" style={{ background: '#39FF14' }} />
        </div>
        <div className="absolute w-6 h-6 rounded-full opacity-70 pointer-events-none" ref={tailRef} style={{ transform: 'translate(50%, 50%)' }}>
          <div className="w-full h-full rounded-full" style={{ background: 'rgba(57,255,20,0.5)', filter: 'blur(2px)' }} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="order-2 md:order-1"
        >
          <h1 className="hero-title font-extrabold tracking-tight text-left leading-[0.9] text-light-text dark:text-dark-text">
            {[
              { text: 'HELLO', delay: 0.05, x: -6 },
              { text: "I'M", delay: 0.22, x: 8 },
              { text: altName ? '周尼克' : 'NICK', delay: 0.4, x: -2, clickable: true },
            ].map((l, idx) => (
              <MotionDiv
                key={l.text}
                initial={{ opacity: 0, y: 18, x: l.x }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.55, delay: l.delay, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <span className="hero-cursor" style={{ animationDelay: `${0.08 + idx * 0.18}s` }} />
                <span
                  className={`hero-glitch block text-[16vw] md:text-[8vw] ${l.clickable ? 'cursor-pointer select-none' : ''}`}
                  onClick={l.clickable ? triggerEaster : undefined}
                >
                  {l.text}
                </span>
              </MotionDiv>
            ))}
          </h1>
          {showTitles ? (
            <div className="mt-6 flex flex-wrap gap-3" onMouseMove={onTagMove} onMouseLeave={resetTags}>
              {tagItems.map((t, i) => {
                const o = tagOffsets[i] || { x: 0, y: 0 };
                const pad = 'px-3 py-1';
                return (
                  <div
                    key={t.front}
                    ref={(el) => {
                      tagRefs.current[i] = el;
                    }}
                    style={{ transform: `translate3d(${o.x}px, ${o.y}px, 0)` }}
                  >
                    <div className="tag-bubble" style={{ animationDelay: `${i * 0.45}s` }}>
                      <div className="tag-flip">
                        <div className="tag-flip-inner">
                          <span className={`tag-sizer ${pad} rounded-md border border-ui-border text-sm`}>{t.front}</span>
                          <div className={`tag-face ${pad} rounded-md border border-ui-border text-sm text-dark-subtext bg-black/10`}>
                            {t.front}
                          </div>
                          <div className={`tag-back ${pad} rounded-md border border-primary text-sm text-light-bg bg-primary`}>
                            {t.back}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div
            className="mt-10 relative w-fit"
            onMouseEnter={() => setWechatHover(true)}
            onMouseLeave={() => {
              setWechatHover(false);
              setWechatTilt({ rx: 0, ry: 0 });
            }}
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const r = el.getBoundingClientRect();
              const px = (e.clientX - r.left) / Math.max(1, r.width);
              const py = (e.clientY - r.top) / Math.max(1, r.height);
              const ry = (px - 0.5) * 10;
              const rx = (0.5 - py) * 10;
              setWechatTilt({ rx, ry });
            }}
          >
            <button
              type="button"
              className={[
                'ui-card rounded-xl border border-ui-border bg-dark-card/60 backdrop-blur-sm px-5 py-4 text-left transition-all duration-300',
                wechatFlash ? 'flash-green' : '',
              ].join(' ')}
              onClick={async () => {
                const ok = await copyText(wechatId);
                setWechatCopied(ok);
                window.setTimeout(() => setWechatCopied(false), 1100);
                if (ok) {
                  setWechatFlash(true);
                  window.setTimeout(() => setWechatFlash(false), 560);
                  setWechatOpen(true);
                }
              }}
              aria-label="复制微信号"
              style={{
                transform: `translateY(${wechatHover ? -2 : 0}px) perspective(900px) rotateX(${wechatTilt.rx}deg) rotateY(${wechatTilt.ry}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="text-xs text-dark-subtext">Nick 的微信</div>
              <div className="mt-1 text-base text-light-text dark:text-dark-text font-semibold">
                {wechatCopied ? '已复制微信号' : wechatId}
              </div>
              <div className="mt-1 text-[11px] text-dark-subtext">鼠标悬停显示二维码 · 点击复制</div>
              <div
                className={[
                  'mt-3 overflow-hidden transition-all duration-300',
                  wechatHover || wechatOpen ? 'max-h-[220px] opacity-100' : 'max-h-0 opacity-0',
                ].join(' ')}
                style={{ transform: 'translateZ(14px)' }}
              >
                <div className="w-full rounded-lg overflow-hidden border border-ui-border/80 bg-black/30 flex items-center justify-center p-2">
                  <img
                    src="/wechat-qr.jpg"
                    alt="微信二维码"
                    className="w-[180px] h-[180px] object-contain"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallbackTried) {
                        img.dataset.fallbackTried = '1';
                        img.src = '/wechat-qr.png';
                      } else {
                        img.style.display = 'none';
                        img.parentElement.innerHTML =
                          '<span style="color:#9aa0a6;font-size:12px">请放置 wechat-qr.png 或 wechat-qr.jpg 到 public 目录</span>';
                      }
                    }}
                  />
                </div>
              </div>
            </button>
          </div>
        </MotionDiv>

        <div className="order-1 md:order-2 h-[44vh] md:h-[56vh]" />
      </div>

      <div className="absolute right-6 bottom-6 z-10 hidden md:block">
        <MotionDiv
          initial={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative ui-card rounded-xl border border-ui-border bg-dark-card/60 backdrop-blur-sm px-5 py-4 w-[340px] overflow-hidden"
        >
          <MotionDiv
            aria-hidden="true"
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background:
                'radial-gradient(40% 60% at 20% 40%, rgba(57,255,20,0.08) 0%, rgba(0,0,0,0) 70%), radial-gradient(60% 60% at 80% 30%, rgba(168,85,247,0.10) 0%, rgba(0,0,0,0) 70%)',
            }}
          />
          <MotionDiv
            aria-hidden="true"
            className="absolute -inset-y-6 w-28 pointer-events-none opacity-40"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(57,255,20,0.18) 50%, rgba(0,0,0,0) 100%)',
              filter: 'blur(10px)',
            }}
            animate={{ x: ['-40%', '120%'] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
          />

          <MotionDiv
            className="absolute inset-0 pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0 rgba(57,255,20,0.00)',
                '0 0 18px rgba(57,255,20,0.12)',
                '0 0 0 rgba(57,255,20,0.00)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
          />

          <div className="relative grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-sm">
            {[
              { label: '名字', value: altName ? '周尼克' : 'Nick' },
              { label: '生日', value: '2.8' },
              { label: '星座', value: '水瓶座' },
              { label: '籍贯', value: '湖南' },
              { label: 'MBTI', value: 'INTJ', upper: true },
            ].map((r, idx) => {
              const active = !hoverInfo || hoverInfo === r.label;
              return (
                <div
                  key={r.label}
                  className="contents"
                  onMouseEnter={() => setHoverInfo(r.label)}
                  onMouseLeave={() => setHoverInfo('')}
                >
                  <div className={`text-dark-subtext transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-35'}`}>
                    <TypewriterValue value={r.label} delay={680 + idx * 140} />
                  </div>
                  <div className={`text-light-text dark:text-dark-text transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-35'}`}>
                    <TypewriterValue
                      value={r.upper ? r.value.toUpperCase() : r.value}
                      delay={760 + idx * 140}
                      className={r.upper ? 'uppercase font-medium' : 'font-medium'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative mt-3 border-t border-ui-border/60 pt-3 text-sm">
            <Motto value="知难上，戒骄戎，常自省，穷途明" />
          </div>
        </MotionDiv>
      </div>
    </section>
  );
};

export default Hero;

function TypewriterValue({ value, delay = 0, speed = 24, className = '' }) {
  const [out, setOut] = useState('');
  useEffect(() => {
    const v = String(value ?? '');
    let i = 0;
    let cancelled = false;
    let timer = window.setTimeout(function tick() {
      if (cancelled) return;
      i += 1;
      setOut(v.slice(0, i));
      if (i < v.length) timer = window.setTimeout(tick, speed);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, delay, speed]);
  return <span className={className}>{out}</span>;
}

function Motto({ value }) {
  const MotionSpan = motion.span;
  const chars = String(value ?? '').split('');
  return (
    <span className="text-light-subtext dark:text-dark-subtext font-serif tracking-wide">
      {chars.map((ch, i) => (
        <MotionSpan
          key={`${ch}-${i}`}
          initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 1.15 + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block' }}
        >
          {ch}
        </MotionSpan>
      ))}
    </span>
  );
}
