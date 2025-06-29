import { uiConfig } from '../styles/uiConfig';

export default function ProTip({ children }) {
  return (
    <div className={`mb-4 p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${uiConfig.layout.radius.lg}`}>
      <div className="flex items-start">
        <div className="mr-2 sm:mr-3 flex-shrink-0">
          <svg className={`${uiConfig.icons.size.sm} sm:${uiConfig.icons.size.md} ${uiConfig.colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
            <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> {children}
          </p>
        </div>
      </div>
    </div>
  );
}