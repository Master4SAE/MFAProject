import { ErrorResponse } from '../types/Messages';

const fetchData = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  // console.log('fetching data from url: ', url);
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    const errorJson = json as unknown as ErrorResponse;
    if (errorJson.message) {
      throw new Error(errorJson.message);
    }
    throw new Error(`Error ${response.status} occurred`);
  }
  return json;
};

export default fetchData;
