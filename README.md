# 了凡乐享交互原型

运动康复服务微信小程序高保真交互原型。基于 HTML、CSS 和 JavaScript 实现，无需安装依赖。

## 预览

使用 Python 启动静态服务器：

```powershell
python -m http.server 8765
```

在浏览器打开 `http://127.0.0.1:8765/index.html`。

也可以直接打开 `index.html`。页面中的场景图片通过相对路径引用 `assets/` 目录。

## 设备基准

- iPhone 13 竖屏逻辑画布：390 × 844 pt。
- 微信小程序外壳、状态栏、安全区、导航胶囊、TabBar 和手势条。
- 样机工具栏支持适应窗口、100% 原尺寸及安全区示意。
- 完整取值见 [iPhone设计规范.md](iPhone设计规范.md)。

## 版本记录

- 当前版本：查看 [VERSION](VERSION)。
- 版本更新记录：查看 [CHANGELOG.md](CHANGELOG.md)。
- 每次后续修改须按 [AGENTS.md](AGENTS.md) 的发布流程更新版本、记录变更并推送至 GitHub。
