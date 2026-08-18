import React, { useState, useMemo } from 'react';
import { IChatMessage } from '@/types/ai.types';
import { CitationCard } from './CitationCard';
import { Bot, User, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface IMessageItemProps {
  message: IChatMessage;
}

const renderKaTeX = (latex: string, displayMode: boolean, key: string | number) => {
  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
    if (displayMode) {
      return (
        <div
          key={key}
          className="my-3 py-2.5 px-4 bg-slate-950/70 rounded-xl border border-slate-800/80 text-center overflow-x-auto text-slate-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return (
      <span
        key={key}
        className="inline-block px-1 mx-0.5 text-slate-100 align-middle"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <code key={key} className="font-mono text-xs text-emerald-300">{latex}</code>;
  }
};

const cleanMathTags = (str: string): string => {
  return str
    .replace(/<math>(.*?)<\/math>/gi, '\\($1\\)')
    .replace(/<equation>(.*?)<\/equation>/gi, '$$$1$$')
    .replace(/<latex>(.*?)<\/latex>/gi, '\\($1\\)');
};

const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /(\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
      const latex = matchedStr.slice(2, -2).trim();
      parts.push(renderKaTeX(latex, false, match.index));
    } else if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
      const latex = matchedStr.slice(2, -2).trim();
      parts.push(renderKaTeX(latex, true, match.index));
    } else if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      const latex = matchedStr.slice(2, -2).trim();
      parts.push(renderKaTeX(latex, true, match.index));
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$') && matchedStr.length > 2) {
      const latex = matchedStr.slice(1, -1).trim();
      parts.push(renderKaTeX(latex, false, match.index));
    } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {matchedStr.slice(1, -1)}
        </em>
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-emerald-400"
        >
          {matchedStr.slice(1, -1)}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

const FormattedMarkdown: React.FC<{ content: string; isStreaming?: boolean }> = ({
  content,
  isStreaming,
}) => {
  if (!content && isStreaming) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm italic py-1">
        <span>Thinking...</span>
        <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  const cleanedContent = cleanMathTags(content);
  const lines = cleanedContent.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inMathBlock = false;
  let mathBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Multi-line display math $$ ... $$ or \[ ... \]
    if (trimmed === '$$' || trimmed === '\\[' || trimmed === '\\]') {
      if (inMathBlock) {
        const latexStr = mathBuffer.join('\n').trim();
        if (latexStr) {
          elements.push(renderKaTeX(latexStr, true, `math-block-${i}`));
        }
        mathBuffer = [];
        inMathBlock = false;
      } else {
        inMathBlock = true;
      }
      continue;
    }

    if (inMathBlock) {
      mathBuffer.push(line);
      continue;
    }

    // Single-line display math $$ ... $$ or \[ ... \]
    if ((trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) ||
        (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length > 4)) {
      const latexStr = trimmed.startsWith('$$') ? trimmed.slice(2, -2).trim() : trimmed.slice(2, -2).trim();
      elements.push(renderKaTeX(latexStr, true, `math-single-${i}`));
      continue;
    }

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-t border-slate-800" />);
      continue;
    }

    if (trimmed.startsWith('####')) {
      const headingText = trimmed.replace(/^####\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-2">
          {renderInlineMarkdown(headingText)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('###')) {
      const headingText = trimmed.replace(/^###\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2">
          {renderInlineMarkdown(headingText)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('##')) {
      const headingText = trimmed.replace(/^##\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-white mt-4 mb-2 flex items-center gap-2">
          {renderInlineMarkdown(headingText)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('#') && !trimmed.startsWith('##')) {
      const headingText = trimmed.replace(/^#\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold text-white mt-4 mb-2 flex items-center gap-2">
          {renderInlineMarkdown(headingText)}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 p-3.5 pl-4 bg-slate-950/60 border-l-2 border-emerald-500 rounded-r-lg text-slate-200 text-sm leading-relaxed italic"
        >
          {renderInlineMarkdown(quoteText)}
        </blockquote>
      );
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-slate-200 text-sm leading-relaxed">
          <span className="font-semibold text-emerald-400 shrink-0">{numMatch[1]}.</span>
          <div className="flex-1">{renderInlineMarkdown(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    const bulletMatch = trimmed.match(/^[*•\-]\s+(.*)/);
    if (bulletMatch) {
      const indentMatch = line.match(/^(\s*)/);
      const isSubItem = indentMatch && indentMatch[1].length >= 2;

      elements.push(
        <div
          key={`bullet-${i}`}
          className={`flex items-start gap-2 my-1 text-slate-200 text-sm leading-relaxed ${
            isSubItem ? 'pl-6 text-slate-300' : 'pl-2'
          }`}
        >
          <span className="text-emerald-400 shrink-0 font-bold">•</span>
          <div className="flex-1">{renderInlineMarkdown(bulletMatch[1])}</div>
        </div>
      );
      continue;
    }

    if (trimmed === '') {
      elements.push(<div key={`blank-${i}`} className="h-2" />);
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-slate-200 text-sm leading-relaxed my-1">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre
        key="code-unclosed"
        className="my-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed"
      >
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return (
    <div className="space-y-1 text-sm leading-relaxed break-words">
      {elements}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
      )}
    </div>
  );
};

export const MessageItem: React.FC<IMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'User';
  const [copied, setCopied] = useState(false);

  const formattedTime = useMemo(() => {
    if (!message.createdAt) return '';
    try {
      return new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }, [message.createdAt]);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isError =
    !isUser &&
    (message.content.toLowerCase().startsWith('error') ||
      message.content.includes('Failed to generate response'));

  if (isError) {
    return (
      <div className="flex gap-3 p-4 rounded-xl transition-all bg-red-950/40 border border-red-800/80 text-red-200 shadow-md max-w-[95%]">
        <div className="w-8 h-8 rounded-full bg-red-900/80 text-red-300 flex items-center justify-center shrink-0 border border-red-700/50">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-red-300">ExamNavigator Tutor Error</span>
            {formattedTime && <span className="text-[11px] text-red-400/80">{formattedTime}</span>}
          </div>
          <p className="text-sm leading-relaxed text-red-200 break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 p-4 md:p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-slate-800/90 border border-slate-700/60 shadow-sm ml-auto max-w-[85%] text-slate-100'
          : 'bg-slate-900 border border-slate-800 shadow-md max-w-[95%] text-slate-100'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {isUser ? 'You' : 'ExamNavigator Tutor'}
            </span>
            {!isUser && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Gemini 2.5 Pro
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {formattedTime && <span>{formattedTime}</span>}
            {!isUser && message.content && (
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Message Content Body */}
        {isUser ? (
          <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <FormattedMarkdown content={message.content} isStreaming={message.isStreaming} />
        )}

        {/* RAG Grounding Sources */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <CitationCard citations={message.citations} />
        )}
      </div>
    </div>
  );
};

