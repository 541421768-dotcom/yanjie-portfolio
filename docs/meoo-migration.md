# Yanjie — Meoo 全栈迁移

此分支只改服务端和部署，不更改首页、项目展示、交互视觉、照片碎裂动画。

## 迁移前必须完成
GitHub 只备份了源码及演示素材，**不包含原站 D1/R2 的真实作品图片和文案**。保持旧站运行。
1. 从旧站已登录的后台，分别下载 /api/portfolio?admin=1、/api/intro、/api/footer 的 JSON。
2. 遍历这些数据中的 /media/<uuid>.<ext>，下载所有真实作品图、封面、长图和个人照片。
3. 在 Meoo Cloud 创建私有 Storage 桶、在 SQL 编辑器运行 db/meoo-schema.sql。
4. 按原 UUID 文件名上传图片并将 JSON 导入 portfolio、site_intro、site_footer 表中的 id=1 行；data 字段为 jsonb，revision 保持合法，updated_by 可设置为 migration。
5. 对照旧站核对内容、顺序、12 个精选项目、个人照片后，再切换公开地址。

## Meoo Secret（仅服务端，不得提交 Git）
MEOO_CLOUD_URL: Cloud 服务地址（Supabase/PostgREST 兼容）
MEOO_SERVICE_KEY: 服务端 service role key
MEOO_STORAGE_BUCKET: 已创建的私有存储桶
SESSION_SECRET: 至少32位强随机字符串
ADMIN_PASSWORD_SCRYPT: 执行 node scripts/hash-admin-password.mjs 生成
NODE_ENV: production
PORT: 由平台自动注入

Cloud 需要支持 /rest/v1 和 /storage/v1/object 接口。尚未使用真实 Meoo 凭据联调，不能声称线上已部署。

## 构建与发布
Node.js 24；执行 bash scripts/setup.sh 构建，bash scripts/start.sh 启动，监听 0.0.0.0:PORT。
配置好 Meoo 环境后，登录 CLI 并执行 meoo deploy --runtime image。
请优先在测试站运行完整联调，确认构建、后台登录、发布和图片上传成功后才公开。

## 安全
旧 ChatGPT Sites 注入的身份 Header 已失效，后台使用独立密码 + scrypt 哈希、签名 HttpOnly Cookie 和写操作 Origin 校验。生产环境需要在网关或 WAF 添加后台登录限流，建议进一步启用 MFA。服务器 service key 必须保密。

## 回滚
原站与 D1/R2 保留不动，新站未验收之前不修改原站域名或删除资源。
