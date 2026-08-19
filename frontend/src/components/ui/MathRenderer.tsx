import React from 'react';
import { cleanMathTags, renderKaTeXHtml } from '@/utils/katex-renderer';

export interface MathRendererProps {
  content: string;
  className?: string;
  dark?: boolean;
}

export const renderKaTeX = (latex: string, displayMode: boolean, key: string | number, dark = false) => {
  const html = renderKaTeXHtml(latex, displayMode);
  if (displayMode) {
    return (
      <div
        key={key}
        className={`my-3 py-3 px-4 rounded-xl border text-center overflow-x-auto ${
          dark
            ? 'bg-slate-950/80 border-slate-800 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <span
      key={key}
      className={`inline-block px-1 mx-0.5 align-middle ${dark ? 'text-slate-100' : 'text-slate-900'}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export { cleanMathTags };

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', dark = false }) => {
  if (!content) return null;

  const cleaned = cleanMathTags(content);
  const lines = cleaned.split('\n');

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-2" />;

        // Check if line is a bullet item
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim());
        const displayLine = isBullet ? line.trim().replace(/^[-*]\s+|\^\d+\.\s+/, '') : line;

        const regex = /(\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(displayLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(displayLine.substring(lastIndex, match.index));
          }

          const matchedStr = match[0];
          if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
            const latex = matchedStr.slice(2, -2).trim();
            parts.push(renderKaTeX(latex, false, `${lineIdx}-${match.index}`, dark));
          } else if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
            const latex = matchedStr.slice(2, -2).trim();
            parts.push(renderKaTeX(latex, true, `${lineIdx}-${match.index}`, dark));
          } else if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
            const latex = matchedStr.slice(2, -2).trim();
            parts.push(renderKaTeX(latex, true, `${lineIdx}-${match.index}`, dark));
          } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$') && matchedStr.length > 2) {
            const latex = matchedStr.slice(1, -1).trim();
            parts.push(renderKaTeX(latex, false, `${lineIdx}-${match.index}`, dark));
          } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className="font-bold text-slate-900 dark:text-white">
                {matchedStr.slice(2, -2)}
              </strong>
            );
          } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
            parts.push(
              <em key={`${lineIdx}-${match.index}`} className="italic text-slate-700 dark:text-slate-300">
                {matchedStr.slice(1, -1)}
              </em>
            );
          } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
            parts.push(
              <code
                key={`${lineIdx}-${match.index}`}
                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded font-mono text-xs border border-slate-200 dark:border-slate-700"
              >
                {matchedStr.slice(1, -1)}
              </code>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < displayLine.length) {
          parts.push(displayLine.substring(lastIndex));
        }

        return (
          <div key={lineIdx} className={isBullet ? 'flex items-start space-x-2 ml-2' : ''}>
            {isBullet && <span className="text-amber-500 font-bold select-none">•</span>}
            <div className="flex-1">{parts}</div>
          </div>
        );
      })}
    </div>
  );
};
