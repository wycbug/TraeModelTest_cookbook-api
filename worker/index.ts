export default {
  async fetch(
    request: Request,
    _env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // 菜谱API代理
    if (url.pathname.startsWith("/api/recipes")) {
      const searchQuery = url.searchParams.get("search");

      if (!searchQuery) {
        return Response.json(
          { error: "Missing search parameter" },
          { status: 400 }
        );
      }

      // 尝试从缓存获取结果
      const cacheKey = `recipe_${searchQuery.toLowerCase()}`;
      const cache = await caches.open("recipes");
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        return new Response(cachedResponse.body, {
          headers: { ...cachedResponse.headers, "X-Cached": "true" },
        });
      }

      try {
        // 调用外部菜谱API
        const apiUrl = `https://api.pearktrue.cn/api/cookbook/?search=${encodeURIComponent(
          searchQuery
        )}`;
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          throw new Error(
            `API request failed with status ${apiResponse.status}`
          );
        }

        const data = await apiResponse.json();

        // 缓存结果1小时
        const cacheResponse = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
        ctx.waitUntil(cache.put(cacheKey, cacheResponse));

        return Response.json(data, {
          headers: { "Content-Type": "application/json", "X-Cached": "false" },
        });
      } catch (error) {
        console.error("Recipe API error:", error);
        return Response.json(
          { error: "Failed to fetch recipes" },
          { status: 500 }
        );
      }
    }

    // 热门菜谱推荐
    if (url.pathname === "/api/popular") {
      // 这里可以从缓存或预定义列表返回热门菜谱
      const popularRecipes = [
        {
          name: "酸辣粉",
          image:
            "https://i3.meishichina.com/atta/recipe/201104/201104070729558.jpg?x-oss-process=style/p800",
        },
        {
          name: "宫保鸡丁",
          image:
            "https://i3.meishichina.com/recipe/2012/12/201212210936565757273.jpg?x-oss-process=style/p800",
        },
        {
          name: "鱼香肉丝",
          image:
            "https://i3.meishichina.com/recipe/2012/12/201212210936565757273.jpg?x-oss-process=style/p800",
        },
        {
          name: "麻婆豆腐",
          image:
            "https://i3.meishichina.com/recipe/2012/12/201212210936565757273.jpg?x-oss-process=style/p800",
        },
      ];

      return Response.json(popularRecipes);
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
