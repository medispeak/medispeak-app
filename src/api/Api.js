import { useAtom } from "jotai";
import { authAtom } from "../store/AuthStore";

const BASE_URL = "https://www.medispeak.in/";

export function request(
  url,
  method = "GET",
  data,
  authToken = "Zakpzw9JjgjZXrTh5ePpgqnk"
) {
  console.log("Requesting", url, "with", data);
  const formData = new FormData();
  if (data) {
    console.log("Appending data", data);
    data.forEach((field) => {
      formData.append(field.name, field.value);
    });
  } else {
    // Add an empty field to the form data
    formData.append("empty", "");
  }
  // Add Auth Token
  const headers = new Headers();
  const authHeader = `Bearer ${authToken}`;
  headers.append("Authorization", authHeader);

  const baseRequestOptions = {
    method,
    headers: headers,
    redirect: "follow",
  };

  const requestOptions =
    method === "GET"
      ? baseRequestOptions
      : {
          ...baseRequestOptions,
          body: formData,
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

// Needs to be
// export function useApi() {
//   const accessKey = useAtom(authAtom);
//   return {
//     transcribeAudio: (data, page) => {
//       const url = `${BASE_URL}api/v1/pages/${page}/transcriptions`;
//       return requestPost(url, data, accessKey);
//   }
// }

const requestPost = (url, data, authToken) => {
  return request(url, "POST", data, authToken);
};

// https://www.medispeak.in/api/v1/pages/5/transcriptions"
export function transcribeAudio(data, page) {
  const url = `${BASE_URL}api/v1/pages/${page}/transcriptions`;
  return requestPost(url, data);
}

// /api/v1/transcriptions/16/generate_completion
export function getCompletion(transcription) {
  const url = `${BASE_URL}api/v1/transcriptions/${transcription}/generate_completion`;
  return requestPost(url);
}

// /api/v1/webapps/16/generate_completion
export function getPageInfo(page) {
  const url = `${BASE_URL}api/v1/webapps/${page}/`;
  return request(url);
}

export function getPages() {
  // https://www.medispeak.in/api/v1/webapps
  const url = `${BASE_URL}api/v1/webapps`;
  return request(url);
}

export function getCurrentUser() {
  // https://www.medispeak.in/api/v1/users/me
  const url = `${BASE_URL}api/v1/users/me`;
  return request(url);
}
