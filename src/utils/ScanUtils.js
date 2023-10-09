export const triggerScan = (callback) => {
  const formFields = document.querySelectorAll("input, select, textarea");
  const fields = Array.from(formFields).map((field) => {
    return {
      identifier: field.name || field.id,
      name: field.name,
      id: field.id,
      value: field.value,
      type: `${field.type} type`,
    };
  });
  callback(fields);
};

const withMetadata = (metadata, callback) => {
  if (metadata && metadata !== "" && typeof metadata === "string") {
    // Check if metadata is a valid JSON
    try {
      console.log("Parsing metadata", `${metadata}`);
      const metadataObj = JSON.parse(metadata);
      if (metadataObj) {
        return callback(metadataObj);
      }
    } catch (e) {
      console.error("Error parsing metadata", e);
    }
  }
  return null;
};

function setNativeValue(element, value, metadata, delay) {
  let lastValue = element.value;
  element.value = value;
  let event = new Event("input", { value: value, bubbles: true });
  // React 15
  event.simulated = true;
  // React >= 16
  let tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  element.dispatchEvent(event);

  withMetadata(metadata, (meta) => {
    if (meta.routine === "dropdown")
      setTimeout(() => {
        console.log("Triggering dropdown with value", value);
        const inputElement = document.querySelector(meta.query);
        inputElement.focus();
        const tabEvent = new KeyboardEvent("keydown", {
          keyCode: 9,
          bubbles: true,
        });
        inputElement.dispatchEvent(tabEvent);
      }, delay);
  });
}

export const triggerUpdateFields = (updateFields) => {
  const recursiveScan = (field) => {
    console.log("recursiveScan", field);

    const metaMatch = withMetadata(field.metadata, (meta) => {
      return document.querySelector(meta.query);
    });

    if (metaMatch) {
      console.log("Found element by metadata", field.title);
      return metaMatch;
    }

    console.log("Getting element by name | id", field.title);
    const matchesByName = document.getElementsByName(field.title);

    if (matchesByName.length > 0) {
      console.log("Found element by name", field.title);
      return matchesByName[0];
    }

    const matchesById = document.getElementById(field.title);
    if (matchesById) {
      console.log("Found element by id", field.title);
      return matchesById;
    }

    console.log("No element found for", field.title);
    return null;
  };

  console.log("triggerUpdateFields", updateFields);
  updateFields.forEach((field, index) => {
    console.log("Updating field", field);

    const matchingField = recursiveScan(field);

    if (matchingField) {
      console.log("Updating field", field.title, "with value", field.value);
      setNativeValue(matchingField, field.value, field.metadata, index * 250);
    } else {
      console.error(
        `Field with name ${field.name} and id ${field.id} not found`
      );
    }
  });
};

const compare = (a, b) => {
  if (a === "" || a === undefined || a === null) {
    return false;
  }
  if (b === "" || b === undefined || b === null) {
    return false;
  }
  if (a === b) {
    return true;
  }
  return false;
};
