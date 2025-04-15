/**
 * settings.js - 网站设置控制脚本 (改进版)
 * 处理暗黑模式、字体大小调整和布局选择等网站设置
 */

// 定义常量
const THEME_STORAGE_KEY = 'themePreference';
const FONT_SIZE_STORAGE_KEY = 'fontSizePreference';
// const LAYOUT_STORAGE_KEY = 'layoutPreference'; // Removed
const FONT_SIZE_STEP = 10; // 每次调整 10%
const MIN_FONT_SIZE = 70;
const MAX_FONT_SIZE = 150;

// DOM 元素引用 (由 initializeHeaderSettings 填充)
let fontSizeValueDisplay_header;
// let normalLayoutButton_header; // Removed
// let compactLayoutButton_header; // Removed

// 当前设置状态
let currentTheme = 'light';
let currentFontSize = 100;
// let currentLayout = 'normal'; // Removed

/**
 * 应用主题 (light/dark) 到 <html> 元素
 * @param {string} theme 主题名称 ('light' or 'dark')
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    console.log(`[Settings] 应用主题: ${theme}`);
}

/**
 * 应用字体大小到 <html> 元素
 * @param {number} size 字体大小百分比 (e.g., 100)
 */
function applyFontSize(size) {
    const validSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
    document.documentElement.style.fontSize = `${validSize}%`;
    currentFontSize = validSize;
    updateFontSizeDisplay();
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, validSize);
    console.log(`[Settings] 应用字体大小: ${validSize}%`);
}

/**
 * 更新字体大小显示 (仅页眉)
 */
function updateFontSizeDisplay() {
    if (fontSizeValueDisplay_header) {
        fontSizeValueDisplay_header.textContent = `${currentFontSize}%`;
    }
}

/**
 * 新函数：专门初始化页眉中的设置控件
 */
function initializeHeaderSettings() {
    console.log("[Settings] 初始化页眉设置控件...");
    const themeToggleButton_header = document.getElementById('header-theme-toggle');
    const decreaseFontButton_header = document.getElementById('header-decrease-font');
    const increaseFontButton_header = document.getElementById('header-increase-font');
    fontSizeValueDisplay_header = document.getElementById('header-font-size-value');
    // normalLayoutButton_header = document.getElementById('header-layout-normal'); // Removed
    // compactLayoutButton_header = document.getElementById('header-layout-compact'); // Removed

    if (!themeToggleButton_header) {
        console.error("[Settings] 未找到页眉主题切换按钮 (#header-theme-toggle)");
        return;
    }

    // --- 绑定事件监听器 ---
    themeToggleButton_header.addEventListener('click', () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    if (decreaseFontButton_header) {
        decreaseFontButton_header.addEventListener('click', () => {
            applyFontSize(currentFontSize - FONT_SIZE_STEP);
        });
    }

    if (increaseFontButton_header) {
        increaseFontButton_header.addEventListener('click', () => {
            applyFontSize(currentFontSize + FONT_SIZE_STEP);
        });
    }

    // Removed layout button listeners

    // --- 初始化控件状态 ---
    updateFontSizeDisplay();
    // updateLayoutControls(); // Removed
}

/**
 * 初始化设置（加载并应用存储的值）
 */
function initializeSettings() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    const savedFontSize = parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY), 10) || 100;
    // const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY) || 'normal'; // Removed

    console.log(`[Settings] 加载存储设置 - 主题: ${savedTheme}, 字体: ${savedFontSize}%`);
    applyTheme(savedTheme);
    applyFontSize(savedFontSize);
    // Set default layout to compact
    if (document.body) {
        document.body.setAttribute('data-layout', 'compact');
        console.log(`[Settings] 应用默认布局: compact`);
    } else {
        console.warn("[Settings] 尝试应用默认布局时 body 尚未加载。将在 DOMContentLoaded 时重试。");
    }

    // currentLayout = savedLayout; // Removed
    // applyLayout(savedLayout); // Removed
}

// --- 执行初始化 ---

// 优先应用主题以避免闪烁
const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
applyTheme(initialTheme);

// DOM 加载完成后初始化核心设置
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Settings] DOM加载完成，初始化核心设置（非页眉控件）");
    initializeSettings(); // 加载存储的值并应用默认布局

    // 如果 body 尚未加载，则在此处再次尝试应用默认布局
    if (!document.body.hasAttribute('data-layout')) {
         document.body.setAttribute('data-layout', 'compact');
         console.log(`[Settings] 在 DOMContentLoaded 时应用默认布局: compact`);
    }
    // 注意：initializeHeaderSettings() 将由 component-loader 调用
});

// Removed legacy functions (initSettingsPanel, initNavSettings, initFloatingSettings, applyStoredSettings, updateLayoutControls, setLayout)
// Keep only the header-based initialization and the core applyTheme/applyFontSize functions.

// Make initializeHeaderSettings globally accessible for component-loader
window.initializeHeaderSettings = initializeHeaderSettings; 