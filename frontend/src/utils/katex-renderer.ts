import katex from 'katex';

export const cleanMathTags = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/<math>(.*?)<\/math>/gi, '\\($1\\)')
    .replace(/<equation>(.*?)<\/equation>/gi, '$$$1$$')
    .replace(/<latex>(.*?)<\/latex>/gi, '\\($1\\)');
};

export const renderKaTeXHtml = (latex: string, displayMode: boolean): string => {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
  } catch {
    return `<code class="font-mono text-xs text-amber-500 bg-amber-50 px-1 py-0.5 rounded">${latex}</code>`;
  }
};
