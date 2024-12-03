import { useAtom } from "jotai";
import { authAtom } from "../store/AuthStore";
import { notify } from "../store/notifications";

const BASE_URL = "https://app.medispeak.in/";
// const BASE_URL = "http://localhost:3000/";

export function request(url, method = "GET", data) {
  const authToken = sessionStorage.getItem("access_token");
  const formData = new FormData();
  if (data) {
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
          notify({
            type: "error",
            title: "Something went wrong",
            message: error,
          });
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

const requestPost = (url, data, authToken) => {
  return request(url, "POST", data, authToken);
};

// https://www.app.medispeak.in/api/v1/pages/5/transcriptions"
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

export function findTemplate() {
  // https://www.app.medispeak.in/api/v1/webapps
  const url = `${BASE_URL}api/v1/templates/find_by_domain`;
  return request(url);
}

export function getTanscriptions(page) {
  // https://www.app.medispeak.in/api/v1/transcriptions/
  const url = `${BASE_URL}api/v1/transcriptions/${page ? `?page=${page}` : ""}`;
  return request(url);
}

export function getCurrentUser() {
  // https://www.app.medispeak.in/api/v1/me
  const url = `${BASE_URL}api/v1/me`;
  return request(url);
}
