import React from 'react';
import FadeInWhenVisible from './FadeInWhenVisible';

const TechBadge = ({ label }) => (
  <span className="text-xs px-2 py-1 rounded-full border border-ui-border text-dark-subtext hover:text-primary transition-colors">
    {label}
  </span>
);

const ExternalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M14 3h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PortfolioCard = ({ title, description, tags = [], link, cover }) => (
  <FadeInWhenVisible>
    {/* 
      这是卡片的核心修改：
      1. 添加了半透明的边框 border-white/10。
      2. 使用 backdrop-blur-sm 实现毛玻璃效果。
      3. 悬停时，边框颜色会变成主题色，同时出现一个主题色的投影，创造出发光效果。
    */}
    <div 
      className="ui-card rounded-lg p-6 h-full 
                 group hover:shadow-glow-green overflow-hidden"
    >
      {cover && (
        <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden">
          <img src={cover} alt={title} loading="lazy" className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalIcon />
              </span>
            </a>
          )}
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-light-subtext dark:text-dark-subtext">
        {description}
      </p>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => <TechBadge key={t} label={t} />)}
        </div>
      )}
      {link && (
        <a href={link} target="_blank" rel="noreferrer" className="mt-6 inline-block ui-btn px-4 py-2 rounded-md">
          查看项目
        </a>
      )}
    </div>
  </FadeInWhenVisible>
);

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-20 px-6">
      <FadeInWhenVisible>
        <h2 className="text-4xl font-bold text-center mb-12 text-light-text dark:text-dark-text">作品展示</h2>
      </FadeInWhenVisible>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <FadeInWhenVisible delay={0.05}>
            <PortfolioCard
              title="项目一"
              description="基于 React + Vite 的个人主页，暗色主题与动效强化。"
              tags={['React','Vite','Tailwind','Framer Motion']}
              link="#"
              cover="/works/1.png"
            />
          </FadeInWhenVisible>
        </div>
        <div>
          <FadeInWhenVisible delay={0.15}>
            <PortfolioCard
              title="项目二"
              description="Three.js 粒子星云启动页，提供交互与淡出过渡。"
              tags={['Three.js','WebGL']}
              link="#"
              cover="/works/2.png"
            />
          </FadeInWhenVisible>
        </div>
        <div>
          <FadeInWhenVisible delay={0.25}>
            <PortfolioCard
              title="项目三"
              description="组件化卡片与时间线，强调科技质感与可读性。"
              tags={['UI/UX','组件设计']}
              link="#"
              cover="/works/3.png"
            />
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
