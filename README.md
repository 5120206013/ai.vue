# 拉卡拉智能客服（Lakala AI Customer Service）

企业级 AI 智能客服前端应用，提供智能问答、内部数据查询（NL2SQL）、知识库文档管理（RAG）、转人工客服与满意度评价等能力。

## ✨ 功能特性

- **智能客服对话**：与 AI 助手进行自然语言对话，支持快捷问题一键提问。
- **会话管理**：多会话列表、新建 / 切换 / 删除 / 清除会话，历史消息自动持久化。
- **内部数据查询（NL2SQL）**：切换「内部数据」模式，用自然语言查询数据库；`/分析` 前缀可查看数据库表结构与字段信息，查询结果以表格形式呈现。
- **知识库管理（RAG）**：上传 PDF / Markdown 文档构建知识库，支持文档列表、删除与一键重新索引。
- **转人工客服**：一键转接人工客服，含状态提示。
- **满意度评价**：五星评价客服服务。
- **消息流式反馈**：发送 / 取消生成、AI 回复流式光标、自动滚动到底部。

## 🛠 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端框架 | [Vue 3](https://vuejs.org/)（`<script setup>` 组合式 API） |
| 构建工具 | [Vite 6](https://vitejs.dev/) |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| 图标 | [lucide-vue-next](https://lucide.dev/) |
| 样式 | SCSS（Sass） |

## 📁 目录结构

```
ai.vue/
├── index.html                     # HTML 入口
├── package.json
├── vite.config.js                 # Vite 配置（含开发代理）
├── src/
│   ├── main.js                    # 应用入口，挂载 Vue + Pinia
│   ├── App.vue                    # 根组件，布局与业务编排
│   ├── api/
│   │   └── chat.js                # 后端 API 封装（统一请求层）
│   ├── stores/
│   │   └── chatStore.js           # Pinia store，核心业务状态与逻辑
│   ├── composables/
│   │   ├── useChat.js             # 聊天逻辑组合式函数
│   │   └── useSession.js          # 会话管理组合式函数
│   ├── components/
│   │   ├── Sidebar.vue            # 侧边栏（会话列表）
│   │   ├── ChatHeader.vue         # 顶栏（模式切换 / 知识库 / 更多）
│   │   ├── MessageList.vue        # 消息列表与欢迎态
│   │   ├── MessageItem.vue        # 单条消息渲染
│   │   ├── ChatInput.vue          # 输入框（发送 / 取消）
│   │   ├── QuickQuestions.vue     # 快捷问题
│   │   ├── MoreMenu.vue           # 更多菜单（评价 / 转人工 / 清空）
│   │   ├── TransferConfirm.vue    # 转人工确认弹窗
│   │   ├── StarRating.vue         # 满意度评价弹窗
│   │   └── RagDocumentPanel.vue   # 知识库管理面板
│   └── styles/
│       ├── global.scss            # 全局样式
│       └── variables.scss         # 主题变量（品牌色 / 尺寸等）
└── dist/                          # 构建产物
```

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm（或 pnpm / yarn）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认运行在 <http://localhost:5173>。

### 构建生产版本

```bash
npm run build
```

### 本地预览构建产物

```bash
npm run preview
```

## 🔌 后端接口

前端通过统一的 API 封装层（`src/api/chat.js`）与后端交互。后端接口均为 `POST` 请求（文档删除为 `DELETE`）。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/chat` | 发送聊天消息 |
| POST | `/api/chat/sessions` | 获取会话列表 |
| POST | `/api/chat/{sessionId}/history` | 获取会话历史（纯文本格式） |
| POST | `/api/chat/{sessionId}/clear` | 清除会话 |
| POST | `/api/rating` | 提交满意度评价 |
| POST | `/api/transfer-human` | 请求转人工客服 |
| POST | `/api/nl2sql/analyze` | 分析数据库表结构与关系 |
| POST | `/api/nl2sql` | 自然语言查询数据库（NL2SQL） |
| POST | `/api/rag/documents/upload` | 上传文档到知识库（multipart） |
| POST | `/api/rag/documents/list` | 获取已索引文档列表 |
| DELETE | `/api/rag/documents/{id}` | 删除指定文档 |
| POST | `/api/rag/reindex` | 重新索引全部文档 |

### 会话历史文本格式

`/api/chat/{sessionId}/history` 返回纯文本，逐行以角色前缀标注：

```
[USER]: 用户消息
[ASSISTANT]: AI 回复
[SYSTEM]: 系统提示
```

## ⚙️ 配置说明

### API 地址

后端请求地址在 `src/api/chat.js` 中通过 `API_BASE` 常量配置，默认指向：

```js
const API_BASE = 'http://47.109.206.24/api'
```

如需切换后端环境，直接修改该常量即可。

### 开发代理

`vite.config.js` 中已配置 `/api` 前缀的代理，默认将 `/api` 转发至 `http://localhost:8080`：

```js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

> 注意：由于 `API_BASE` 使用了绝对地址，开发代理默认不会被实际调用。若需走本地代理，请将 `API_BASE` 改为相对路径 `/api` 并在 `vite.config.js` 中配置目标后端地址。

## 📦 主要依赖

- `vue` `^3.5.13`
- `pinia` `^2.3.1`
- `lucide-vue-next` `^0.469.0`
- `vite` `^6.3.1`
- `@vitejs/plugin-vue` `^5.2.3`
- `sass-embedded` `^1.86.3`
