/**
 * main.js - 主要JavaScript入口点
 * 当DOM内容加载完成后，初始化网站的各个功能
 * 注意：依赖components.js和settings.js中定义的函数
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化站点组件
    initializeComponents();
    
    // 初始化课程交互
    initializeLessonInteractions();
    
    // 初始化设置面板
    initializeSettingsPanel();
    
    // 应用ruby注音括号格式转换
    convertRubyToBracketFormat();
}); 