/**
 * main.js - 主要JavaScript入口点
 * 当DOM内容加载完成后，初始化网站的各个功能
 * 
 * 此文件是网站JavaScript的核心入口点，负责协调和初始化所有功能模块
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Main] 页面加载完成，初始化网站组件...');
    
    // 初始化站点组件
    initializeComponents();
    
    // 初始化课程交互 (仅在课程页面)
    initializeLessonInteractions();
    
    // 初始化设置面板
    initializeSettingsPanel();
    
    // 应用ruby注音括号格式转换
    convertRubyToBracketFormat();
}); 