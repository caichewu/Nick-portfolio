
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const MotionDiv = motion.div;
  const stageRef = useRef(null);
  const clickTimesRef = useRef([]);
  const [easter, setEaster] = useState(false);
  const [wechatFlash, setWechatFlash] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [showWechat, setShowWechat] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const email = '268920699@qq.com';
  const phone = '19973857183';
  const wechatId = phone;
  const redUrl = 'https://www.xiaohongshu.com/user/profile/69cea0d400000000340149da';
  const githubUrl = 'https://github.com/';
  const linkedInUrl = 'https://www.linkedin.com/in/your-id';

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

  const copyEmail = async () => {
    const ok = await copyText(email);
    setEmailCopied(ok);
    setTimeout(() => setEmailCopied(false), 1200);
  };

  const copyPhone = async () => {
    const ok = await copyText(phone);
    setPhoneCopied(ok);
    setTimeout(() => setPhoneCopied(false), 1200);
  };

  const copyWechat = async () => {
    const ok = await copyText(wechatId);
    setWechatCopied(ok);
    setTimeout(() => setWechatCopied(false), 1200);
    if (ok) {
      setWechatFlash(true);
      setTimeout(() => setWechatFlash(false), 520);
    }
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    el.style.setProperty('--dx', '0px');
    el.style.setProperty('--dy', '0px');
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const dx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 60;
        const dy = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 60;
        el.style.setProperty('--dx', `${-dx}px`);
        el.style.setProperty('--dy', `${-dy}px`);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const triggerEaster = () => {
    const now = Date.now();
    const next = [...clickTimesRef.current, now].filter((t) => now - t <= 900);
    clickTimesRef.current = next;
    if (next.length >= 5) {
      clickTimesRef.current = [];
      setEaster(true);
      setTimeout(() => setEaster(false), 5200);
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section id="contact" className="py-20 px-6">
      <div ref={stageRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`contact-glow ${easter ? 'contact-glow-fast' : ''}`} style={{ width: 420, height: 420, left: '12%', top: '8%', animationDelay: '0.2s' }} />
        <div className={`contact-glow ${easter ? 'contact-glow-fast' : ''}`} style={{ width: 520, height: 520, left: '62%', top: '14%', animationDelay: '1.3s', opacity: 0.6 }} />
        {easter ? (
          <>
            <div className="contact-glow contact-glow-fast" style={{ width: 320, height: 320, left: '38%', top: '2%', animationDelay: '0.6s' }} />
            <div className="contact-glow contact-glow-fast" style={{ width: 380, height: 380, left: '78%', top: '42%', animationDelay: '0.9s' }} />
            <div className="contact-glow contact-glow-fast" style={{ width: 300, height: 300, left: '18%', top: '48%', animationDelay: '1.1s' }} />
          </>
        ) : null}
      </div>

      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-bold text-center mb-12 text-light-text dark:text-dark-text select-none"
          onClick={triggerEaster}
        >
          联系我
        </motion.h2>
        {easter ? (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-sm text-primary -mt-8 mb-8"
          >
            “少想点咯，先做起再说。”
          </motion.div>
        ) : null}

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col md:flex-row items-center justify-center gap-10">
          <MotionDiv variants={itemVariants} className="relative group w-fit">
            <button
              type="button"
              className={[
                'ui-card rounded-xl border border-ui-border bg-dark-card/60 backdrop-blur-sm px-5 py-4 text-left transition-all duration-300 min-w-[220px]',
                wechatFlash ? 'flash-green' : '',
              ].join(' ')}
              onMouseEnter={() => setWechatOpen(true)}
              onMouseLeave={() => setWechatOpen(false)}
              onClick={async () => {
                await copyWechat();
                setShowWechat((v) => !v);
              }}
              aria-label="复制微信号"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-dark-subtext">微信</div>
                  <div className="mt-1 text-base text-light-text dark:text-dark-text font-semibold">
                    {wechatCopied ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-primary">✔</span>
                        <span>已复制</span>
                      </span>
                    ) : (
                      wechatId
                    )}
                  </div>
                </div>
                <div className="text-xs text-dark-subtext whitespace-nowrap">{wechatCopied ? '复制成功' : '点击复制'}</div>
              </div>
            </button>

            <div
              className={[
                'pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] z-20',
                'opacity-0 translate-y-2 scale-[0.98] transition-all duration-200',
                'group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100',
                showWechat || wechatOpen ? 'opacity-100 translate-y-0 scale-100' : '',
              ].join(' ')}
            >
              <div className="ui-card rounded-xl px-4 py-3 border border-ui-border bg-dark-card/85 backdrop-blur-sm shadow-[0_0_32px_rgba(57,255,20,0.14)] w-[220px]">
                <div className="text-xs text-dark-subtext">微信二维码</div>
                <div className="mt-3 w-full rounded-lg overflow-hidden border border-ui-border/80 bg-black/30 flex items-center justify-center p-2 qr-scan">
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
            </div>
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="text-center">
            <p className="text-light-subtext dark:text-dark-subtext">也可通过以下方式联系我</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 justify-center">
              <a href={redUrl} target="_blank" rel="noreferrer" className="ui-btn ui-btn-outline px-4 py-2 rounded-md inline-block">小红书主页</a>
              <a href={githubUrl} target="_blank" rel="noreferrer" className="ui-btn ui-btn-outline px-4 py-2 rounded-md inline-block">GitHub</a>
              <a href={linkedInUrl} target="_blank" rel="noreferrer" className="ui-btn ui-btn-outline px-4 py-2 rounded-md inline-block">LinkedIn</a>
              <button type="button" className="ui-btn ui-btn-outline px-4 py-2 rounded-md inline-block" onClick={copyEmail}>
                {emailCopied ? '已复制' : '复制邮箱'}
              </button>
              <a href={`tel:${phone}`} className="ui-btn ui-btn-outline px-4 py-2 rounded-md inline-block">拨打电话</a>
              <button type="button" className="ui-btn ui-btn-outline px-4 py-2 rounded-md inline-block" onClick={copyPhone}>
                {phoneCopied ? '已复制' : '复制电话'}
              </button>
            </div>
          </MotionDiv>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
