export const triggerScan = (callback) => {
  const formFields = document.querySelectorAll("input, select, textarea");
  const fields = Array.from(formFields).map((field) => {
    return {
      identifier: field.name || field.id,
      name: field.name,
      id: field.id,
      value: field.value,
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
  let event;
  element.value = value;
  event = new Event("input", { value: value, bubbles: true });

  // React 15
  event.simulated = true;
  // React >= 16
  let tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  element.dispatchEvent(event);

  // withMetadata(metadata, (meta) => {
  //   if (meta.routine === "dropdown")
  //     setTimeout(() => {
  //       console.log("Triggering dropdown with value", value);
  //       const inputElement = document.querySelector(meta.query);
  //       inputElement.focus();
  //       const tabEvent = new KeyboardEvent("keydown", {
  //         keyCode: 9,
  //         bubbles: true,
  //       });
  //       inputElement.dispatchEvent(tabEvent);
  //     }, delay);
  // });
}

// High Level Structure of triggerUpdateFields
// recursiveScan: Find the element using metadata, name or id
// setNativeValue: Update the value of the element

// Strategy for Updating Fields for Different Inputs
// 1. Text Input: Scan for name or id; fill value using setNativeValue
const updateTextInput = (field, value, metadata, delay) => {
  console.log(
    "updateTextInput called with field:",
    field,
    "value:",
    value,
    "metadata:",
    metadata,
    "delay:",
    delay
  );
  const element = document.querySelector(
    `[name="${field.title}"], [id="${field.title}"]`
  );
  if (element) {
    setNativeValue(element, value, metadata, delay);
  }
};

// 2. Select Input: Find the option that has innerText equal to the target value;
//    Mark the option as selected;
//    Skip the field when triggering setNativeValue
const updateSelectInput = (field, value, metadata, delay) => {
  console.log(
    "updateSelectInput called with field:",
    field,
    "value:",
    value,
    "metadata:",
    metadata,
    "delay:",
    delay
  );
  const element = document.querySelector(
    `[name="${field.title}"], [id="${field.title}"]`
  );
  if (element) {
    const selectOption = Array.from(element.options).find(
      (option) => option.innerText === value
    );
    if (selectOption) {
      selectOption.selected = true;
    }
  }
};

// 3. Dropdown: This is a custom dropdown field;
//    Find the input element using the query in metadata;
//    Focus on the input element;
//    Fill the value using setNativeValue;
//    Trigger a tab event;
const updateDropdown = (field, value, metadata, delay) => {
  console.log(
    "updateDropdown called with field:",
    field,
    "value:",
    value,
    "metadata:",
    metadata,
    "delay:",
    delay
  );
  withMetadata(metadata, (meta) => {
    if (meta.routine === "dropdown") {
      const inputElement = document.querySelector(meta.query);
      setNativeValue(inputElement, value, metadata, delay);
      setTimeout(() => {
        if (inputElement) {
          inputElement.focus();
          const tabEvent = new KeyboardEvent("keydown", {
            keyCode: 9,
            bubbles: true,
          });
          inputElement.dispatchEvent(tabEvent);
        }
      }, delay);
    }
  });
};

// 4. Date Input: Scan for the name or id; update valueAsDate using setNativeValue;
const updateDateInput = (field, value, metadata, delay) => {
  console.log(
    "updateDateInput called with field:",
    field,
    "value:",
    value,
    "metadata:",
    metadata,
    "delay:",
    delay
  );
  const element = document.querySelector(`input[name="${field.title}"]`);
  if (element) {
    element.valueAsDate = new Date(value);
  } else {
    console.log("Couldn't find an element for", field.title);
  }
};

// 5. Checkbox: Find the checkboxes with the same name;
//    Check the checkbox if the value is equal to the checkbox value;
//    Uncheck the checkbox if the value is not equal to the checkbox value;
//    Skip the field when triggering setNativeValue;
const updateCheckbox = (field, value, metadata, delay) => {
  console.log(
    "updateCheckbox called with field:",
    field,
    "value:",
    value,
    "metadata:",
    metadata,
    "delay:",
    delay
  );
  const checkboxes = document.querySelectorAll(`[name="${field.title}"]`);
  if (checkboxes.length > 0) {
    checkboxes.forEach((checkbox) => {
      // For checkbox inputs, since multiple values can be selected
      // value may have multiple values separated by a comma
      const checkboxValues = value.split(",").map((v) => v.trim());
      if (checkboxValues.includes(checkbox.value)) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
    });
  }
};

// 6. Radio: Find the radio button with label that has innerText equal to the target value;
//    Check the radio button;
//    Skip the field when triggering setNativeValue;
const updateRadio = (field, value, metadata, delay) => {
  console.log(
    "updateRadio called with field:",
    field,
    "value:",
    value,
    "metadata:",
    metadata,
    "delay:",
    delay
  );
  const radio = document.querySelector(
    `[name="${field.title}"][value="${value}"]`
  );
  if (radio) {
    radio.checked = true;
  } else
    console.log(
      "Couldn't find radio button with name",
      field.title,
      "and value",
      value
    );
};

// 7. Button: Find the button with the given text as `title`;
//    Click the button;
const updateButton = (field, value, metadata, delay) => {
  console.log("updateButton called with field:", field, "value:", value);
  const button = document.querySelector(`button[title="${value}"]`);
  if (button) {
    button.click();
  }
};

export const triggerUpdateFields = (updateFields) => {
  const recursiveScan = (field) => {
    console.log("recursiveScan", field);

    const metaMatch = withMetadata(field.metadata, (meta) => {
      if (meta.routine === "select") {
        const targetValue = updateFields.find(
          (dataField) => dataField.title === field.title
        );
        // Find the option that has innerText equal to the target value
        const selectOption = Array.from(
          document.querySelectorAll(meta.query)
        ).find((option) => option.innerText === targetValue.value);
        if (selectOption) {
          console.log("Found select option", selectOption);
          return selectOption;
        }
      }
      return null;
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

    console.log("Element not found", field.title);
    return null;
  };

  updateFields.forEach((field, i) => {
    const updatedWithMetadata = withMetadata(field.metadata, (meta) => {
      console.log("Updating field with metadata", meta);
      switch (meta.routine) {
        case "select":
          updateSelectInput(field, field.value, field.metadata, 0);
          break;
        case "dropdown":
          updateDropdown(field, field.value, field.metadata, i * 200);
          break;
        case "date":
          updateDateInput(field, field.value, field.metadata, 0);
          break;
        case "checkbox":
          updateCheckbox(field, field.value, field.metadata, 0);
          break;
        case "radio":
          updateRadio(field, field.value, field.metadata, 0);
          break;
        case "button":
          updateButton(field, field.value, field.metadata, 0);
          break;
        default:
          console.log(
            "This version of medispeak does not support this field type",
            meta.routine
          );
          return false;
      }
      return true;
    });
    if (!updatedWithMetadata) {
      updateTextInput(field, field.value, field.metadata, 0);
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
