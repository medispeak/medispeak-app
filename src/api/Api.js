const BASE_URL = "https://www.medispeak.in/";

export function request(url, data) {
  const formData = new FormData();
  data.forEach((field) => {
    formData.append(field.name, field.value);
  });

  // Add Auth Token
  const headers = new Headers();
  const authToken = "Bearer Zakpzw9JjgjZXrTh5ePpgqnk";
  headers.append("Authorization", authToken);

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: formData,
    redirect: "follow",
  };

  return fetch(url, requestOptions).then((response) =>
    response
      .json()
      .then((data) => {
        if (!response.ok) {
          const error = (data && data.message) || response.statusText;
          return Promise.reject({ status: response.status, message: error });
        }
        return data;
      })
      .catch((error) => {
        console.error("Error Parsing JSON", error);
        return Promise.reject({ message: "Error Parsing JSON" });
      })
  );
}

// https://www.medispeak.in/api/v1/pages/5/transcriptions"
export function transcribeAudio(data, page) {
  const url = `${BASE_URL}api/v1/pages/${page}/transcriptions`;
  return request(url, data);
}

// /api/v1/transcriptions/16/generate_completion
export function getCompletion(transcription) {
  const url = `${BASE_URL}api/v1/transcriptions/${transcription}/generate_completion`;
  return request(url);
}
