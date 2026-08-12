function flatten(obj, path = []) {
  let result = {};
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, currentPath));
    } else {
      result[currentPath.join('.')] = value;
    }
  }
  return result;
}

function computeModifiedFields(original, updated) {
  const flatOriginal = flatten(original);
  const flatUpdated = flatten(updated);

  const modified = {};

  for (const key in flatUpdated) {
    if (
      flatOriginal[key] === undefined || 
      JSON.stringify(flatOriginal[key]) !== JSON.stringify(flatUpdated[key])
    ) {
      modified[key] = flatUpdated[key];
    }
  }

  return modified;
}
export default  computeModifiedFields 

