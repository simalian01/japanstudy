/**
 * main.js - 主要JavaScript入口点
 * 当DOM内容加载完成后，初始化网站的各个功能
 * 注意：依赖components.js和settings.js中定义的函数
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化站点组件 (component-loader.js 会处理 header/footer)
    // initializeComponents(); // components.js 可能不再需要或需要重构
    
    // 初始化课程交互 (假设 script.js 处理)
    // initializeLessonInteractions(); // 同样，功能可能移到 script.js
    
    // 设置初始化现在由 settings.js 自身和 component-loader.js 处理
    // initializeSettingsPanel(); // 移除此调用
    
    // 注音格式转换也应由相关脚本处理
    // convertRubyToBracketFormat(); // 移除此调用
}); 