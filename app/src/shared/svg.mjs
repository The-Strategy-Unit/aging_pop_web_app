// Functions to make adding groups to SVGs a little easier

function addGroup(container, className) {
  return container.append('g').attr('class', className);
}


function addGroups(container, classNames) {
  return classNames.map(function(className) {
    return addGroup(container, className);
  });
}


export { addGroup, addGroups };
