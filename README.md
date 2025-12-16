# 运动读书-积极向上社交小程序

一个集成了读书视频聚合、运动数据跟踪、匿名社交树洞的微信小程序。

## 项目结构

```
sports-reading-social-miniapp/
├── server/                 # 后端服务 (Node.js + Express)
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── db/            # 数据库脚本
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务服务
│   │   └── index.ts       # 入口文件
│   └── package.json
│
├── miniapp/               # 小程序前端 (Taro + React)
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── components/    # 公共组件
│   │   └── app.tsx        # 入口文件
│   └── package.json
│
└── README.md
```

## 功能模块

### 1. 读书模块 (Youtube聚合)
- 后端定时抓取指定Youtube频道的视频信息
- 小程序展示视频封面和标题
- 点击复制链接，提示用户在浏览器观看

> ⚠️ 注意：微信小程序无法直接播放Youtube视频，只能复制链接方式

### 2. 运动跟踪模块
- 调用微信运动API获取步数
- 自动计算卡路里消耗
- 记录历史运动数据

### 3. 社交树洞模块
- 匿名发布动态
- 支持图片上传
- 随机生成匿名昵称

## 快速开始

### 后端启动

```bash
cd server
npm install
npm run dev
```

### 数据库初始化

```bash
# 创建数据库
createdb sports_reading_social

# 执行初始化脚本
psql -d sports_reading_social -f src/db/init.sql
```

### 小程序启动

```bash
cd miniapp
npm install
npm run dev:weapp
```

然后用微信开发者工具打开 `miniapp/dist` 目录。

## 环境变量配置

### server/.env

```
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sports_reading_social
DB_PASSWORD=your_password
DB_PORT=5432

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# Youtube频道ID (逗号分隔)
YOUTUBE_CHANNELS=UCxxxx,UCyyyy
```

## 注意事项

1. **Youtube访问**：本地开发时后端需配置代理访问Youtube；生产环境建议部署在海外服务器
2. **图片上传**：生产环境需配置对象存储服务（如阿里云OSS）
3. **数据库安全**：所有数据库修改需先在本地测试通过，不要直接操作生产库
