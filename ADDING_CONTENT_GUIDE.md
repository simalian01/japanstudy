# 如何添加新内容 (课程/模块) 到 JapanStudy 项目

本文档旨在指导你如何在项目重构后的新结构下添加新的学习内容，例如新的课程页面或其他独立的学习模块。

**基本流程:**

1.  **创建 HTML 文件:**
    *   **新课程:** 在 `src/lessons/` 目录下创建新的 HTML 文件，例如 `lesson29.html`。
    *   **新工具/模块:** 在 `src/tools/` 目录下创建一个新的子目录（例如 `src/tools/new-quiz/`），并在该子目录下创建 `index.html` (或其他主 HTML 文件)。

2.  **编写 HTML 内容:**
    *   **参考现有文件:** 复制一个现有的类似文件（如 `src/lessons/lesson1.html` 或 `src/tools/katakana-quiz.html`）作为模板。
    *   **主体内容:** 专注于编写课程或工具的核心 HTML 内容。
    *   **无需页头/页脚:** **不要**在新的 HTML 文件中包含站点通用的页头 (Header) 或页脚 (Footer) 的 HTML 代码。这些将由 `component-loader.js` 自动加载。
    *   **添加占位符:** 在你希望显示页头和页脚的位置，分别添加以下空的 HTML 标签：
        ```html
        <header id="main-header"></header>
        ```
        和
        ```html
        <footer id="main-footer"></footer>
        ```
        (通常 `header` 放在 `<body>` 开头，`footer` 放在 `</body>` 结束前，但在主内容容器之外)。

3.  **更新资源引用路径 (重要!):**
    *   **CSS:** 确保你的 HTML 文件正确引用了 CSS 文件。对于 `src/lessons/` 或 `src/tools/` 下的文件，主样式表的路径通常是 `../assets/css/style.css`。如果模块有自己的 CSS，路径类似，例如 `../assets/css/new-quiz.css`。
        ```html
        <link rel="stylesheet" href="../assets/css/style.css">
        <!-- 如果有特定模块的 CSS -->
        <link rel="stylesheet" href="../assets/css/your-module-specific.css">
        ```
    *   **JavaScript:** 确保引用了必要的 JS 文件。对于 `src/lessons/` 或 `src/tools/` 下的文件：
        *   **通用脚本 (如设置):** `../assets/js/settings.js`
        *   **课程特定脚本:** `../assets/js/script.js` (如果所有课程共用) 或 `../assets/js/lessonXX.js` (如果每课不同)
        *   **工具特定脚本:** `../assets/js/your-module-specific.js`
        ```html
        <!-- 示例：课程页面 -->
        <script src="../assets/js/script.js" defer></script>
        <script src="../assets/js/settings.js" defer></script>
        ```
    *   **导航链接:** 检查文件内所有 `<a>` 标签的 `href` 属性：
        *   **返回主页/课程列表:** 指向 `../pages/index.html`
        *   **跳转到其他工具:** 指向 `../tools/other-tool/index.html`
        *   **跳转到其他课程:** 指向 `../lessons/lessonYY.html` (如果课程间需要跳转)
        *   **站点导航 (在 header.html 中):** 这些由公共组件处理，无需在单个页面修改。

4.  **引入组件加载器:**
    *   在你的新 HTML 文件的 `</body>` 结束标签**之前**，添加以下脚本引用来加载公共页头和页脚：
        ```html
        <script src="../assets/js/component-loader.js" defer></script>
        ```
    *   **路径确认:** 对于放在 `src/lessons/` 或 `src/tools/` 目录下的 HTML 文件，到 `component-loader.js` 的相对路径是 `../assets/js/component-loader.js`。

5.  **更新课程列表 (如果添加了新课程):**
    *   打开主页文件 `src/pages/index.html`。
    *   找到 `<ul id="lessons-list">` 列表。
    *   添加一个新的 `<li>` 元素，包含指向你新课程 HTML 文件的链接：
        ```html
        <li><a href="../lessons/lesson29.html">第29課 新课程标题</a></li>
        ```

6.  **更新维护脚本 (如果适用):**
    *   如果你修改了位于 `scripts/` 目录下的维护脚本（例如 `batch-update-lessons.js` 或 `update-lessons-components.js`），并且这些脚本依赖于文件列表或特定结构，请确保更新脚本以适应新添加的内容。

**示例 (添加 `lesson29.html`):**

1.  创建 `src/lessons/lesson29.html`。
2.  复制 `lesson1.html` 内容到 `lesson29.html`。
3.  修改 `lesson29.html`：
    *   替换核心课程内容。
    *   确保文件顶部 `<link rel="stylesheet" href="../assets/css/style.css">` 路径正确。
    *   删除旧的 `<header class="site-header">...</header>` 和 `<footer class="site-footer">...</footer>` 代码块。
    *   在 `<body>` 之后添加 `<header id="main-header"></header>`。
    *   在 `<script src="../assets/js/component-loader.js" defer></script>` 之前添加 `<footer id="main-footer"></footer>`。
    *   确保底部的 JS 引用是 `<script src="../assets/js/script.js" defer></script>`、`<script src="../assets/js/settings.js" defer></script>` 和 `<script src="../assets/js/component-loader.js" defer></script>`，路径均为 `../assets/js/...`。
    *   检查页面内所有链接（如"返回课程列表"）指向 `../pages/index.html`。
4.  修改 `src/pages/index.html`，在课程列表中添加 `<li><a href="../lessons/lesson29.html">第29課 ...</a></li>`。

遵循这些步骤，你就可以方便地扩展网站内容了。 