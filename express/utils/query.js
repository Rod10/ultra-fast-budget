const getSearchStringFromStates = entries => {
  const search = new URLSearchParams();
  for (const entry of entries) {
    if (Array.isArray(entry.value)) {
      for (const value of entry.value) {
        search.append(entry.key, value);
      }
    } else {
      search.append(entry.key, entry.value);
    }
  }
  return search.toString();
};

module.exports = {getSearchStringFromStates};
