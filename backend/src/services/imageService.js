// services/imageService.js

export const getFoodImage = async (query) => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      },
    );

    const data = await res.json();
    console.log("Unsplash query:", query);
    console.log("Unsplash response:", data);

    return data.results[0]?.urls?.regular || null;
  } catch (error) {
    console.error("Image fetch failed:", error.message);
    return null;
  }
};
