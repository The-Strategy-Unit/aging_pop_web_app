function createGetCssVariable(container) {
  const el = container.node();

  return function(name, func = parseFloat) {
    const str = getComputedStyle(el).getPropertyValue(`--${name}`);
    return func ? func(str) : str;
  };
}


export { createGetCssVariable };
