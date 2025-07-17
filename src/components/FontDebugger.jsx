import { useEffect, useState } from 'react';

const fonts = [
  'Kalam',
  'Montserrat',
  'Dancing Script',
  'Pacifico',
  'Satisfy',
  'Caveat'
];

export default function FontDebugger() {
  const [fontStatus, setFontStatus] = useState({});

  useEffect(() => {
    const checkFonts = () => {
      const status = {};
      fonts.forEach(font => {
        status[font] = document.fonts.check(`12px "${font}"`);
      });
      setFontStatus(status);
    };

    // Check immediately
    checkFonts();

    // Check after fonts might have loaded
    document.fonts.ready.then(() => {
      checkFonts();
    });
  }, []); // No dependencies needed - fonts is a constant

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
      <h3 className="font-semibold mb-2">Font Loading Status:</h3>
      <ul className="space-y-1">
        {fonts.map(font => (
          <li key={font} className={fontStatus[font] ? 'text-green-600' : 'text-red-600'}>
            {fontStatus[font] ? '✓' : '✗'} {font}
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="font-montserrat">Montserrat Test</p>
        <p className="font-caveat">Caveat Test</p>
      </div>
    </div>
  );
}