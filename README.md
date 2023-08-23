# ryo_bot

- 基于 [ICQQ](https://github.com/icqqjs/icqq) 开发的QQ机器人

## 快速上手

> 环境要求：windows x64，java，node v14+

安装依赖 `npm i`

构建 `config.yaml`

进入 `unidbg-fetch-qsign` 执行 `qsign.bat` ，安装，启动

运行 `npm run dev`

## Todo List

这饼啊，吃不起总画得起吧

- [x] 添加配置文件
- [x] 完善找谱插件的功能
  - [x]  封装文件搜索功能
  - [x]  返回多个搜索结果
  - [x]  关键词模糊匹配
  - [x]  优先搜索数据库群
  - [x]  接收额外参数使搜索结果可选
- [ ]  完善找乐手插件的功能
  - [x]  展示乐手列表
  - [x]  展示指定乐手的曲目列表
  - [ ]  曲目列表排序
  - [ ]  接收额外参数实现序号找谱
- [x] 添加单个插件的配置文件
- [ ] 在配置文件内添加所有插件的通用配置（权限,黑名单等）
- [ ] 添加插件管理器（中间件）通过装饰器，将插件的通用配置实现
- [ ] 自动生成配置文件
- [ ] 写说明文档（我知道你很急，但你先别急）

## 就离谱

公司的电脑居然会把 .md 文件给锁掉

所以我现在用web编辑器来更新 README
