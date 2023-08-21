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

export const triggerUpdateFields = (updateFields) => {
  console.log("triggerUpdateFields", updateFields);
  const formFields = document.querySelectorAll("input, select, textarea");
  const fields = Array.from(formFields).forEach((field) => {
    console.log(
      "Updating field",
      field.name,
      field.id,
      "with value",
      field.value
    );
    // Check if `message.fields` has a field with the same name as `field.name`

    console.log("New Compare");

    const matchingField = updateFields.find(
      (f) => compare(f.name, field.name) || compare(f.id, field.id)
    );
    if (matchingField) {
      // Update the field value to the value from `message.fields`
      field.value = matchingField.value;
      // Trigger the change event
      let event = new Event("change", { bubbles: true });
      field.dispatchEvent(event);
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
