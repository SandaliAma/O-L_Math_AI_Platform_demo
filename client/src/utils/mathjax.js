// MathJax configuration and utility functions
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    skipHtmlTags: ['script', 'style', 'textarea', 'pre', 'code'],
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  }
};

export const renderMath = (element) => {
  if (window.MathJax && window.MathJax.typesetPromise) {
    return window.MathJax.typesetPromise([element]);
  }
};

export const renderMathContent = (content) => {
  if (!content) return '';
  // Escape HTML and render LaTeX
  return content.replace(/\$([^$]+)\$/g, (match, math) => {
    return match; // MathJax will process this
  });
};


