export const checkStatus = (response) => {
  if (!response.ok) {
    throw Error("Error in request: " + response.statusText);
  }
  return response;
};
