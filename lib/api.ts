const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL as string;

if (!API_BASE_URL) {
  console.warn("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables.");
}

export default API_BASE_URL;
