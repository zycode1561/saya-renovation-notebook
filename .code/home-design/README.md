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

净距层由 `clearance.js` 的 `computeClearances` / `clearanceGap` 共享函数计算，测试与运行时使用相同 Three.js 家具外包和墙体内表面；米乘 1000 四舍五入为毫米。工具栏“空间净距”默认开启，仅显示当前房间，在漫游与隐私视角隐藏，套区餐厅使用替代家具。手机保留标签并避让相邻净距标签。当前六个主要房间各有 1–2 个局部直线净距，不代表全屋连续通行最窄处，也不包含拉开柜门的使用包络；卫浴、阳台未新增净距。

### 风格方案 B

`finishes.js` 管理用途标签、512px Canvas 木纹/石纹/织物/挂画纹理、一次性 PMREM 室内反射和日夜灯光预设。`mat` 可通过 `extra.finishRole` 明确指定用途，旧颜色调用使用兼容映射。纹理在模型生命周期内共享。

沙发靠背、茶几、两种布局餐椅、床头板、落地灯灯罩和挂画采用参数化低多边形部件；多段部件合并为一个 BufferGeometry，保持原网格锚点及包围盒。每次换风格释放上一组几何，同款部件共享新几何，不保留两套家具。床垫不换型，privacyBedBounds 保持原语义。净距即时刷新，漫游开启时重建障碍。

新增风格从 `finishPresets`、`styleNames` 与 `furnitureGeometry` 扩展。`disposeFinishResources` 负责释放本模块持有的纹理、几何和环境目标；切换风格只释放几何，避免重复上传共享贴图。

验证：`python3 .code/home-design/build.py` 后逐个运行 `.code/**/*.test.cjs`。`styles.test.cjs` 覆盖 20 次反复切换、所有换型部件外包、原/套系净距、床垫范围、漫游起点、共享资源及释放、日夜预设。
