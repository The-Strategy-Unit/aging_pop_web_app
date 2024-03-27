function _getCSSVariable(name, func = parseFloat) {
  const str = getComputedStyle(this).getPropertyValue(`--${name}`);
  return func ? func(str) : str;
}


export { _getCSSVariable };
