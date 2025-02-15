+++ title = "如何给 Hugo 博客添加一个可爱又有填充动画的点赞按钮" 
date = "2025-02-14" 
tags = ['博客装修'] 
draft = true
+++

{{<preface>}}
看到很多博友添加了点赞爱心，我一直心痒痒。然后又看到了 [Josh Comeau 的高端博客的爱心](https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/)，顿时忍不住了。在ChatGPT的帮助下用Cloudflare worker+D1给自己做了一个。这个按钮允许访客给每篇文章最多点赞 2 次。参考了Comeau的爱心，我的也做了点击填充动画。

{{</preface>}}

## 功能概览

- 每篇文章下显示一个可爱的心形点赞按钮。
- 每位访客**最多可以点赞 2 次**，填充的心形颜色根据点击次数动态变化。
- 点赞数据**保存在 Cloudflare D1 数据库**，刷新页面不会丢失点赞数。

---

## 具体步骤 
### 1、开通 Cloudflare Workers 和 D1 数据库

- 注册 Cloudflare 账号
- [参考官方指南](https://developers.cloudflare.com/workers/get-started/guide/) 创建一个 Worker project。
    - 这部分我也参考了这位博友的教程。不过对方使用了KV (Key-Value Store)，我后来选择了D1.
- 创建一个 D1 数据库，例如命名为 `likes-db`。
- 在 Worker 绑定 D1 数据库：进入 Worker 设置页面，在 **Bindings** 区域添加 D1 数据库，取名为 `DB`。
- 最后我的wrangler.jsonc 的代码如下

```jsonc
{
  "name": "heart-reaction",
  "main": "src/index.ts",
  "compatibility_date": "2024-02-14",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "likes-db",
      "database_id": "YOUR database_id"
    }
  ],
  "env": {
    "production": {
      "vars": {
        "SALT": "randomnumbers"
      }
    }
  }
}
```
- 目前没有用到SALT，但我还是保留了这个变量。后来又手动添加了一次variable (SALT)
    - Workers & Pages/heart-reaction (your worker name)/settings, and then find **Variables and Secrets**

### 2. 在Worker 项目下创建src/index.ts

```bash
cd heart-reaction
mkdir src
notepad src/index.ts
```

创建 `index.ts` 文件后，进入 Cloudflare Dashboard，绑定 D1 数据库，并将绑定名称写入 `wrangler.toml` 文件：

```toml
d1_databases = [
  { binding = "DB", database_name = "likes-db", database_id = "你的数据库ID" }
]
```

### 3. 创建数据库表

进入 Cloudflare D1 -- **Console**，创建 `likes` 表：

```sql
CREATE TABLE likes (
  post_slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  PRIMARY KEY (post_slug, visitor_id)
);
```

---

### 4. Cloudflare Worker 代码

在 `src/index.ts` 文件中写入以下代码：

```ts
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const slug = url.pathname.split('/')[2];
    const visitorId = request.headers.get('CF-Connecting-IP');

    if (request.method === 'GET') {
      const { results } = await env.DB.prepare(`SELECT SUM(like_count) as total FROM likes WHERE post_slug = ?`).bind(slug).all();
      const totalLikes = results[0]?.total || 0;

      const { results: userResults } = await env.DB.prepare(`SELECT like_count FROM likes WHERE post_slug = ? AND visitor_id = ?`).bind(slug, visitorId).all();
      const currentLikes = userResults[0]?.like_count || 0;

      return new Response(JSON.stringify({ totalLikes, currentLikes }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST') {
      const { results: userResults } = await env.DB.prepare(`SELECT like_count FROM likes WHERE post_slug = ? AND visitor_id = ?`).bind(slug, visitorId).all();
      const currentLikes = userResults[0]?.like_count || 0;

      if (currentLikes >= 2) {
        return new Response('Like limit reached', { status: 429 });
      }

      if (currentLikes === 0) {
        await env.DB.prepare(`INSERT INTO likes (post_slug, visitor_id, like_count) VALUES (?, ?, ?)`).bind(slug, visitorId, 1).run();
      } else {
        await env.DB.prepare(`UPDATE likes SET like_count = like_count + 1 WHERE post_slug = ? AND visitor_id = ?`).bind(slug, visitorId).run();
      }

      return new Response('Liked');
    }
  },
};
```

保存后执行：

```bash
npx wrangler deploy
```

---
### 5. 自定义域名绑定

为了避免暴露 Cloudflare 的 Workers 子域名，我设置了自定义域名 `api.thehdaze.com`。

- 进入 Cloudflare Dashboard → Workers & Pages → 选择 heart-reaction Worker → Settings → Domains & Routes → Add Custom Domain
    
- 填入 `api.thehdaze.com`。

---

### 6. Hugo 博客集成 Like 按钮

在 Hugo 博客目录下创建：

```
layouts/partials/like-button.html
```


Like 按钮 HTML 代码:

```html
<div class="like-button-wrapper" data-post-slug="{{ .File.BaseFileName }}">
  <div class="like-button">
    <div class="heart-fill-container">
      <svg class="heart-icon" viewBox="0 0 24 24" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradient Fill for Like Fill -->
          <linearGradient id="heart-fill-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#ffb3c1" />
            <stop class="heart-fill-stop" offset="0%" stop-color="#ff7096" />
            <stop class="heart-empty-stop" offset="0%" stop-color="#f9e9ec" />
            <stop offset="100%" stop-color="#f9e9ec" />
          </linearGradient>

          <!-- Glossy Shine -->
          <radialGradient id="heart-shine" cx="0.4" cy="0.3" r="0.8">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 1)" />
            <stop offset="80%" stop-color="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
          </radialGradient>
        </defs>

        <!-- Heart Path -->
        <path class="heart-path"
          d="M12 21s-8-5.5-8-11a4 4 0 018-1 4 4 0 018 1c0 5.5-8 11-8 11z"
          stroke="#ff7096"
          stroke-width="1.5"
          fill="url(#heart-fill-gradient)"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Glossy Shine Overlay -->
        <path
          d="M12 21s-8-5.5-8-11a4 4 0 018-1 4 4 0 018 1c0 5.5-8 11-8 11z"
          fill="url(#heart-shine)"
          opacity="0.7"
        />
      </svg>
    </div>
    <span class="like-count">0</span>
    <span class="like-hint">点击点赞</span>
  </div>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".like-button-wrapper");
    const slug = container.dataset.postSlug;
    const heartFillStop = container.querySelector(".heart-fill-stop");
    const heartEmptyStop = container.querySelector(".heart-empty-stop");
    const countDisplay = container.querySelector(".like-count");
    const heartIcon = container.querySelector(".heart-icon");

    const apiUrl = `https://api.thehdaze.com/likes/${slug}`;

    let currentLikes = 0;

    async function fetchLikes() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        countDisplay.textContent = data.totalLikes || 0;
        currentLikes = data.currentLikes || 0;
        updateHeartFill(currentLikes);
      } catch (error) {
        console.error("Failed to fetch likes", error);
        countDisplay.textContent = "Error";
      }
    }

    async function addLike() {
      try {
        const response = await fetch(apiUrl, { method: 'POST' });

        if (response.status === 429) {
          alert('点赞次数达到上限 (每人2次)');
        } else {
          currentLikes += 1;
          countDisplay.textContent = parseInt(countDisplay.textContent) + 1;
          updateHeartFill(currentLikes);
          heartIcon.classList.add('pop-full');
          setTimeout(() => heartIcon.classList.remove('pop-full'), 500);
        }
      } catch (error) {
        console.error("Failed to add like", error);
      }
    }

    function updateHeartFill(likes) {
      const fillPercent = Math.min((likes / 2) * 100, 100);
      heartFillStop.setAttribute('offset', `${fillPercent}%`);
      heartEmptyStop.setAttribute('offset', `${fillPercent}%`);
    }

    container.addEventListener('click', addLike);
    fetchLikes();
  });
</script>

<style>
  .like-button-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .like-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
  }

  .like-count {
    margin-top: 2px;
    font-size: 16px;
    color: #555;
  }

  .like-hint {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
  }

  .heart-icon {
    transition: transform 0.3s ease, filter 0.3s ease;
    filter: drop-shadow(0 4px 8px rgba(255, 160, 176, 0.4));
  }

  .heart-icon:hover {
    transform: scale(1.1);
    cursor: pointer;
    filter: drop-shadow(0 8px 14px rgba(255, 150, 170, 0.5));
  }

  .heart-icon.pop-full,
  .heart-icon.liked {
    animation: pulse 0.5s ease-in-out;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.4); }
    100% { transform: scale(1.2); }
  }
</style>

```



最后，将此 partial 挂载到文章页面，比如 `layouts/_default/single.html`：

```html
{{ partial "like-button.html" . }}
```

---

## 最终展示效果

- 默认空心心形，鼠标悬停放大。
- 点击后，根据点赞次数逐渐填充颜色，达到 2 次时心形完全填满。
- 点击达到上限时，心形轻微弹跳。
- 点赞数显示在心形下方，提示“点击点赞”。


下面就是我刚做的小爱心啦：👇
