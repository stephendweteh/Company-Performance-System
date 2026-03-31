import React from 'react';

const defaultName = 'PerformTrack';

const FallbackMark = ({ className }) => (
  <div className={className}>
    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

const AppLogo = ({
  branding,
  textClassName = '',
  fallbackMarkClassName = 'flex h-9 w-9 items-center justify-center rounded-full bg-primary',
  imageWrapperClassName = 'flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white p-1',
  imageClassName = 'h-full w-full object-contain',
  containerClassName = 'flex items-center gap-3',
  showText = true,
}) => {
  const appName = branding?.app_name || defaultName;
  const appLogoUrl = branding?.app_logo_url || null;

  return (
    <div className={containerClassName}>
      {appLogoUrl ? (
        <div className={imageWrapperClassName}>
          <img src={appLogoUrl} alt={`${appName} logo`} className={imageClassName} />
        </div>
      ) : (
        <FallbackMark className={fallbackMarkClassName} />
      )}
      {showText && <span className={textClassName}>{appName}</span>}
    </div>
  );
};

export default AppLogo;