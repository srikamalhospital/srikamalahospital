import React from 'react';

/** Consistent professional page wrapper */
const PageShell = ({ title, subtitle, children, className = '' }) => (
  <div className={`pro-page grainy ${className}`}>
    <div className="container mx-auto max-w-6xl">
      {(title || subtitle) && (
        <header className="mb-8 md:mb-10">
          {title && <h1 className="pro-title font-['Noto_Sans_Telugu']">{title}</h1>}
          {subtitle && <p className="pro-subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  </div>
);

export default PageShell;
