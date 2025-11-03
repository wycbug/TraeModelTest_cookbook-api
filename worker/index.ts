interface ApiResponse {
  code: number;
  msg: string;
  search: string;
  data: Recipe[];
}

interface Recipe {
  name: string;
  image: string;
  description: string;
  materials: string[];
  practice: string[];
}

export default {
  async fetch(request, _env, ctx) {
    const url = new URL(request.url);
    const cache = caches.default;

    // Handle API requests
    if (url.pathname.startsWith("/api/recipe")) {
      const searchParam = url.searchParams.get("search");

      // Validate search parameter
      if (!searchParam) {
        return Response.json({ error: "搜索参数不能为空" }, { status: 400 });
      }

      // Check cache first
      const cacheKey = new Request(url.toString(), request);
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        console.log("Using cached response");
        return cachedResponse;
      }

      try {
        // Call external recipe API
        const apiUrl = `https://api.pearktrue.cn/api/cookbook/?search=${encodeURIComponent(
          searchParam
        )}`;
        const apiResponse = await fetch(apiUrl);
        const data = (await apiResponse.json()) as ApiResponse;

        // Check if API returned successfully
        if (data.code !== 200) {
          throw new Error(data.msg || "API请求失败");
        }

        // Create a response to cache
        const response = new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
          },
        });

        // Cache the response
        ctx.waitUntil(cache.put(cacheKey, response.clone()));

        return response;
      } catch (error) {
        console.error("Error fetching recipes:", error);
        return Response.json(
          { error: "获取菜谱失败，请稍后重试" },
          { status: 500 }
        );
      }
    }

    // Handle other requests (return 404)
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
