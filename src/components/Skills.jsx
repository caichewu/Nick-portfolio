
import React, { useEffect, useState } from 'react';
import FadeInWhenVisible from './FadeInWhenVisible';

const Skills = () => {
  return (
    <section id="skills" className="relative py-20 px-6 transition-colors duration-300">
      <div className="relative container mx-auto">
        <FadeInWhenVisible>
          <h2 className="text-4xl font-bold text-center mb-12 text-light-text dark:text-dark-text">技能</h2>
        </FadeInWhenVisible>

        {/* 卡片版技能与经验（4 个能力域） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🎨', title: '视觉 / UI 设计', desc: '品牌视觉体系与暗黑科技风界面，沉淀可复用组件规范，多端响应式布局。' },
            { icon: '✨', title: '交互设计', desc: '梳理信息架构与用户路径，输出高保真原型，强调可访问性与易用性。' },
            { icon: '🧠', title: '产品设计', desc: '主导全链路设计（调研→交互→高保真），关注“简洁易用+科技感”的产品体验。' },
            { icon: '🤖', title: 'AI 训练技术', desc: '熟悉数据标注与清洗、提示词与评测、训练迭代与效果分析，提升模型与输出稳定性。' },
          ].map((c, i) => (
            <FadeInWhenVisible key={c.title} delay={0.05 + i * 0.06}>
              <div className="rounded-xl border border-ui-border bg-dark-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                <div className="text-4xl mb-3" aria-hidden="true">{c.icon}</div>
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-2">{c.title}</h3>
                <p className="text-sm text-light-subtext dark:text-dark-subtext">{c.desc}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;

function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 600;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}%</>;
}
