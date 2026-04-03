import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="ui-card rounded-xl p-8 text-center max-w-[520px] w-full">
        <div className="text-2xl font-semibold text-light-text dark:text-dark-text">页面不存在</div>
        <div className="mt-2 text-light-subtext dark:text-dark-subtext">你访问的地址不存在，返回首页继续浏览。</div>
        <div className="mt-6">
          <Link to="/" className="ui-btn px-5 py-2 rounded-md inline-block">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
