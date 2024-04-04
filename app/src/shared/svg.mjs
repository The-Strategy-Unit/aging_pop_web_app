function addGroup(container, className) {
  return container.append('g').attr('class', className);
}


function addGroups(container, classNames) {
  return classNames.map(function(className) {
    return addGroup(container, className);
  });
}


export { addGroup, addGroups };
