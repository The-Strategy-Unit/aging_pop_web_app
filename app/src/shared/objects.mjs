// Wrapper around Object.assign to create new object
// rather than overriding and existing one
function combineObjects(...objs) {
  return Object.assign({}, ...objs);
}

export { combineObjects };