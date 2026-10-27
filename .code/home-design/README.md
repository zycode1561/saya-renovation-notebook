# 住宅 3D 模型维护源

本目录包含“我的家”的几何、材质、视线检查、第一人称碰撞与套区模型。`dist/home/` 是本站点实际使用的集成资源。

## 构建

在仓库根目录运行：

```bash
python3 .code/home-design/build.py
```

同一套源码生成 `dist/home/` 和本目录内的离线单文件 HTML。离线产物不提交 Git，集成资源提交以便直接静态托管。不要直接修改生成的 `model.js`、`model.css`、`view.html` 或 `three.js`。

## 验证

```bash
node .code/home-design/layout-clearance.test.cjs
node .code/home-design/suite.test.cjs
node .code/home-design/walkthrough.test.cjs
node .code/home-workspace.test.cjs
```

Python 3 用于构建，Node.js 用于检查，无需安装前端依赖。Three.js 本地发行版与 MIT 许可位于 `vendor/`。

`app.js`、`privacy.js`、`walkthrough.js`、`suite.js` 和 `styles.js` 维护共享模型；`build-integrated.py` 生成 ES 模块和原生 Shadow DOM 适配。宿主中的 `dist/home-workspace.js` 负责按需加载、控件与暂停恢复，`dist/app.js` 维护工作区筛选和浏览位置。

## 方案边界

默认方案保留 1.8 米床、入口屏风与窄桌、L 形衣柜和梳妆位、约 900 mm 干内廊、餐边柜及主卫干湿分区。参数和碰撞用于概念试摆，不能替代实测、结构、排水、防水及施工核验。
