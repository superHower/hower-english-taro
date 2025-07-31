CLAUDE.md
本文档为 Claude Code（claude.ai/code）在处理本仓库代码时提供指导。
项目概述
Hower English Taro 是一个基于 Taro 和 React 构建的微信小程序，旨在帮助用户高效学习和记忆英语词汇。该应用基于艾宾浩斯遗忘曲线原理实现了间隔重复学习功能。
常用命令
安装
bash
# 安装依赖
npm install
# 或者
yarn install

开发
bash
# 微信小程序开发模式（主要平台）
npm run dev:weapp

# H5 开发模式
npm run dev:h5

# 其他平台：
npm run dev:swan     # 百度智能小程序
npm run dev:alipay   # 支付宝小程序
npm run dev:tt       # 字节跳动小程序
npm run dev:qq       # QQ 小程序
npm run dev:jd       # 京东小程序
npm run dev:harmony-hybrid  # 鸿蒙系统
构建
bash
# 为微信小程序构建
npm run build:weapp

# 为其他平台构建
npm run build:h5
npm run build:swan
npm run build:alipay
npm run build:tt
npm run build:qq
npm run build:jd
npm run build:harmony-hybrid
# 代码质量
项目使用以下工具保障代码质量：

- ESLint：用于 JavaScript/TypeScript 代码检查
- Stylelint：用于 CSS/SCSS 样式检查
- Husky：用于 Git 钩子管理
- CommitLint：用于规范提交信息格式
架构
# 技术栈
- 框架：Taro 4.1.4 + React 18.0.0
- 语言：TypeScript
- 样式：Sass
- 状态管理：React Hooks
- 构建工具：Vite
- 数据存储：通过 Taro Storage API 实现本地存储
# 核心模块与数据流
## 单词学习系统：
- 核心数据模型围绕 Word 接口设计
- 单词按教材（7A、7B 等）、单元和类型（动词、名词等）进行组织
- 单词包含跟踪数据：练习次数、错误次数、最后练习时间戳
- 系统基于错误率和时间间隔算法确定单词学习优先级
- 学习算法：
  - 针对新单词、易错单词和复习单词采用不同的排序算法
  - 易错单词：按 错误率 * 0.7 + 时间分数 * 0.3 排序
  - 复习单词：按 时间分数 * 0.6 + 次数分数 * 0.4 排序
## 该算法基于艾宾浩斯遗忘曲线实现间隔重复学习
# 应用流程
- 用户选择教材（7A、7B 等）→ 显示单词类型
- 用户选择单词类型（如动词、名词等）→ 用户选择学习或听写模式
- 学习模式：展示单词及其中文 / 英文释义供记忆
- 听写模式：通过展示中文释义，要求用户输入英文来测试学习效果
- 学习结果会被记录并影响未来单词的呈现方式
## 数据持久化
- 单词和学习进度通过 Taro 的 Storage API 存储在本地
- 存储格式：Taro.setStorageSync('word', JSON.stringify(wordData))
- 恢复方式：JSON.parse(Taro.getStorageSync('word'))
## 开发说明
添加新单词
新单词需遵循以下结构：

typescript
{
  id: number;        // 唯一标识符
  book: string;      // 教材标识符（7A、7B 等）
  unit: number | string; // 单元编号
  type: string;      // 单词类型（v=动词，n=名词，a=形容词，d=短语，o=其他）
  en: string;        // 英文单词/短语
  cn: string;        // 中文翻译
  cnt: number;       // 练习次数（新单词为 0）
  error: number;     // 错误次数（新单词为 0）
  time: number;      // 最后练习时间戳（新单词使用 Date.now()）
}
# 微信小程序注意事项
- 本应用主要针对微信小程序平台设计
- 样式使用 rpx 单位实现响应式设计
- 组件使用 Taro 封装的微信原生组件
- 本地存储使用 Taro API 而非浏览器的 localStorage
# 项目结构
关键文件和目录：

- src/pages/index/index.tsx - 主要词汇学习页面
- src/pages/analysis/index.tsx - 数据可视化和统计页面
- src/pages/profile/index.tsx - 用户资料和设置页面
- src/pages/index/word.ts - 包含词汇数据
- src/app.config.ts - 应用配置，包括 tab 栏和页面
- config/index.ts - Taro 构建配置
# 部署
部署微信小程序步骤：

- 使用 npm run build:weapp 构建项目
- 在微信开发者工具中打开生成的 /dist 目录
- 在模拟器中测试小程序
- 在微信小程序平台上传并提交审核