import React from 'react'
import ReactDOM from "react-dom/client";
import './index.css'
import App from './App'

// Form Scanner
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'getFormFields') {
        const formFields = document.querySelectorAll('input, select, textarea');
        const fields = Array.from(formFields).map(field => {
            // Update the field value to "PWNED!"
            field.value = 'PWNED!';
            // Trigger the change event
            field.dispatchEvent(new Event('change'));
            return {
                name: field.name || field.id || 'Unnamed field',
                value: field.value,
                type: `${field.type} type`
            }
        });
        console.log(fields); // Add this line
        sendResponse(fields);
    }
    if (message.type === 'fillFormFields') {
        const formFields = document.querySelectorAll('input, select, textarea');
        const fields = Array.from(formFields).forEach(field => {
            // Check if `message.fields` has a field with the same name as `field.name`
            const matchingField = message.fields.find(f => f.name === field.name);
            if (matchingField) {
                // Update the field value to the value from `message.fields`
                field.value = matchingField.value;
                // Trigger the change event
                field.dispatchEvent(new Event('change'));
            }
        });
        sendResponse(true);
    }
});

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)