# Yanjie 个人作品集 — 源码备份

在线网站：https://yanjie-visual-portfolio.yanyongjie1991.chatgpt.site

管理后台：https://yanjie-visual-portfolio.yanyongjie1991.chatgpt.site/admin

本仓库保存网站及后台源码；现有 Sites 托管、D1 数据库和 R2 图片存储继续运行。本次不是 GitHub Pages 部署。后台保存内容即可更新网站，无需提交代码；首页精选最多 12 个。上传的作品图片、文案数据和数据库不包含在源码备份中。GitHub 与现有托管代码未配置双向自动同步，修改本仓库不会自动发布到现有网站。源码运行依赖 Cloudflare Workers、D1/R2 和现有 Sites 身份验证；迁移需另行配置这些服务。

源码版本：c597e27b7d1b6bee62ec875c73d00f4c47393b0a

---

# Yanjie portfolio

A minimal portfolio with mouse-following imagery, masonry covers and full-width, scrolling project details. `/admin` is the owner-only Chinese project editor.

## Homepage copy

The top of `/admin` includes editable greeting, name line and personal introduction with a live text preview. The separate save action persists the copy in `site_intro`, with its own revision; project changes never overwrite homepage copy. The homepage renders saved copy on every visit with HTML escaping.

## Portrait and footer

The homepage portrait is a centered 300 × 400 px frame. Upload or replace it in the homepage editor; it uses a centered cover crop. No personal photo is assumed: an explicit neutral placeholder is shown until the owner saves one. Hover disperses 96 pre-rasterized triangular fragments on one cached canvas; leaving restores the image. A critically damped spring preserves motion on quick reversals. Image preparation runs ahead of interaction, with no per-hover PNG encoding, DOM fragment allocation or destruction. Rendering stops at rest or offscreen. Touch toggles the effect and reduced-motion visitors receive a simple opacity change. Photo edits are stored with intro copy. Legacy text-only saves preserve existing photos.

The independent footer editor controls its eyebrow, body, emphasized line, signature, bottom descriptions and back-to-top label. Data is stored in `site_footer` with a separate revision and is HTML-escaped when rendered. The site's existing public audience and owner-only management authorization are preserved.

## Content updates

1. Sign in with the site owner's ChatGPT account and open `/admin`.
2. Create or select a project. Edit its title, category and description.
3. Choose an independent cover and up to 30 ordered detail images. JPEG, PNG, WebP and GIF are supported, up to 30 MB per file.
4. Enable “在网站展示” and save to publish the project. Leave it off to save a draft.
5. Use up/down controls to reorder saved projects. Open the website to review.

Projects persist in D1; uploads persist in R2. Uploaded files are immutable. Deleting a project removes its record, but retained image objects are not automatically deleted to avoid breaking shared references. Updates use a revision check to prevent another editing tab from silently overwriting content.

The owner allowlist is enforced server-side in `lib/portfolio-server.ts` against the Sites-injected identity. The existing owner-private site audience is preserved. If ownership is intentionally transferred, update that authorization together with platform access. Browser callers cannot provide the dispatch-owned identity themselves.

## Source

- `home-template.html`, `public/style.css`, `public/app.js`: portfolio view.
- `admin-template.html`, `public/admin.css`, `public/admin.js`: owner editor.
- `scripts/sync-pages.mjs`: compiles the two HTML templates into server imports during every build.
- `app/api/portfolio`, `app/api/upload`, `app/media`: persistence and image routes.
- `db/schema.ts`, `drizzle`: schema and migrations.
- `tests/portfolio.test.mjs`: route tests with SQLite-backed D1 adapter and in-memory R2.

Build with the Sites build helper. `npm test` checks access, origin checks, persistence, revision conflicts, publishing, sorting, uploads and long-image metadata. Browser interaction QA requires the supported browser tool.

The initial sample projects are clearly marked demos; two illustrative product photographs are from Unsplash. They are not represented as Yanjie's commissioned work.

## 首页精选展
首页展示最多 12 个正式项目。首版精选顺序记录在 `public/curation.mjs`，通过稳定作品 ID 关联已上传内容；不改写或删除原有作品数据。管理页读取后显示相同精选，保存作品或排序时会持久保存 `featured` 标记。可先取消一个精选并保存，再选入新项目；↑↓ 调整排列，海报类统一置后。公开状态和精选状态分开，草稿及示例不会出现在精选展。
桌面两列、手机单列，间距 16px，封面固定 4:3 居中裁切，圆角 16px（手机 12px）；详情图片仍按原始比例完整展示。管理页封面预览采用相同裁切。
