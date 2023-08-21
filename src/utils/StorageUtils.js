const setValue = (key, value) => {
  chrome.storage.local.set({ [key]: value }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    console.log(`Value for ${key} is set to ${value}`);
  });
};

const getValue = (key, callback) => {
  chrome.storage.local.get([key], (result) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    callback(result[key]);
  });
};
