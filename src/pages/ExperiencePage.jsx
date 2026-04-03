import React from 'react';
import FadeInWhenVisible from '../components/FadeInWhenVisible';

const ExperiencePage = () => {
  const timeline = [
    {
      time: '2024.06 - 2026.03',
      title: '青岛倬智青云物联网科技有限公司 · 硬件产品经理',
      desc: '主导AI芯片管理平台从0到1建设，覆盖资产管理、固件管理、远程诊断与OTA全生命周期。搭建数据标注与质检体系，推动模型训练数据标准化。',
      points: [
        '制定设备遥测、日志与错误码上报规范，统一多厂商芯片数据格式，资产可视化覆盖率≥95%',
        '设计双盲标注流程与gold set构建机制，建立标注质量评估体系，固件一致率≥98%',
        '推动OTA灰度发布与回滚机制落地，升级成功率≥99%，故障平均修复时间（MTTR）下降约50%',
        '协调研发/测试/运维/厂商完成API对接，新芯片接入周期从4周缩短至2周',
      ],
    },
    {
      time: '2024.03 - 2024.06',
      title: '青岛倬智青云物联网科技有限公司 · 硬件产品经理助理',
      desc: '参与AI芯片管理平台需求调研与数据基础建设，协助完成标注规范制定与首批数据标注。',
      points: [
        '主导运维团队深度访谈，挖掘隐性需求并输出需求文档3份，为平台功能设计提供输入',
        '协助设计错误码映射表与故障分类体系，标注历史故障记录200+条，形成初始训练数据集',
        '跟进3个功能模块的验收测试，整理用户反馈150+条，推动5项体验优化落地',
      ],
    },
  ];

  return (
    <section className="relative py-20 px-6 transition-colors duration-300">
      <div className="container mx-auto">
        <FadeInWhenVisible>
          <h2 className="text-4xl font-bold text-center mb-12 text-light-text dark:text-dark-text">工作经验</h2>
        </FadeInWhenVisible>

        <div className="relative border-l border-white/10 ml-4">
          {timeline.map((item, idx) => (
            <FadeInWhenVisible key={idx} delay={0.1 + idx * 0.1}>
              <div className="mb-10 ml-4">
                <div className="w-3 h-3 bg-primary rounded-full -ml-5 mt-1.5"></div>
                <div className="text-xs uppercase tracking-wider text-primary mb-1">{item.time}</div>
                <div className="text-lg font-semibold text-light-text dark:text-dark-text">{item.title}</div>
                {item.desc && <div className="text-light-subtext dark:text-dark-subtext mt-1">{item.desc}</div>}
                {item.points && (
                  <ul className="mt-3 list-disc pl-5 text-light-subtext dark:text-dark-subtext space-y-1">
                    {item.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperiencePage;
