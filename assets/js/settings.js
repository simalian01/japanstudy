/**
 * settings.js - 网站设置控制脚本
 * 处理暗黑模式和字体大小调整等网站设置
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化设置面板
    initSettingsPanel();
});

/**
 * 初始化设置面板及其功能
 */
function initSettingsPanel() {
    // 如果设置面板不存在于当前页面，则创建并添加
    let settingsToggle = document.getElementById('settings-toggle');
    let settingsPanel = document.getElementById('settings-panel');
    
    // 如果设置面板不存在，创建它
    if (!settingsToggle || !settingsPanel) {
        createSettingsPanelDOM();
        // 重新获取元素引用
        settingsToggle = document.getElementById('settings-toggle');
        settingsPanel = document.getElementById('settings-panel');
    }
    
    // 获取设置控件
    const themeToggle = document.getElementById('theme-toggle');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const increaseFontBtn = document.getElementById('increase-font');
    const fontSizeValue = document.getElementById('font-size-value');
    
    // 改进设置面板按钮响应
    if (settingsToggle) {
        // 移除可能存在的旧事件监听器
        settingsToggle.removeEventListener('click', toggleSettingsPanel);
        settingsToggle.removeEventListener('mousedown', toggleSettingsPanel);
        settingsToggle.removeEventListener('touchstart', toggleSettingsPanel);
        
        // 使用mousedown事件提高响应速度
        settingsToggle.addEventListener('mousedown', toggleSettingsPanel);
        // 对于触摸设备，添加触摸事件
        settingsToggle.addEventListener('touchstart', toggleSettingsPanel, {passive: true});
    }
    
    // 点击面板外部区域关闭面板，使用捕获阶段
    document.removeEventListener('click', handleOutsideClick, true);
    document.addEventListener('click', handleOutsideClick, true);
    
    // === 暗黑模式处理 ===
    // 从localStorage读取主题设置
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    } else {
        // 检查系统偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        }
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // 监听系统主题变化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', event => {
                const systemTheme = event.matches ? 'dark' : 'light';
                // 仅当用户未手动设置主题时，才跟随系统
                if (!localStorage.getItem('theme')) {
                    document.documentElement.setAttribute('data-theme', systemTheme);
                    themeToggle.checked = event.matches;
                }
            });
    }
    
    // === 字体大小处理 ===
    // 从localStorage读取字体大小设置
    let fontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    applyFontSize(fontSize);
    
    // 减小字体
    decreaseFontBtn.addEventListener('click', () => {
        if (fontSize > 70) {
            fontSize -= 10;
            applyFontSize(fontSize);
            localStorage.setItem('fontSize', fontSize.toString());
        }
    });
    
    // 增大字体
    increaseFontBtn.addEventListener('click', () => {
        if (fontSize < 150) {
            fontSize += 10;
            applyFontSize(fontSize);
            localStorage.setItem('fontSize', fontSize.toString());
        }
    });
}

/**
 * 创建设置面板DOM
 */
function createSettingsPanelDOM() {
    // 创建设置切换按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'settings-toggle';
    toggleBtn.className = 'settings-toggle';
    toggleBtn.setAttribute('aria-label', '打开设置面板');
    toggleBtn.innerHTML = '<span>⚙️</span>';
    
    // 创建设置面板容器
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel';
    
    // 设置面板内容
    panel.innerHTML = `
        <h3 class="settings-heading">网站设置</h3>
        
        <!-- 暗黑模式开关 -->
        <div class="settings-option">
            <label for="theme-toggle">暗黑模式</label>
            <label class="theme-switch">
                <input type="checkbox" id="theme-toggle" />
                <span class="theme-slider"></span>
            </label>
        </div>
        
        <!-- 字体大小控制 -->
        <div class="settings-option">
            <label>字体大小</label>
            <div class="font-size-controls">
                <button id="decrease-font" class="font-size-btn" aria-label="减小字体">−</button>
                <span id="font-size-value" class="font-size-value">100%</span>
                <button id="increase-font" class="font-size-btn" aria-label="增大字体">+</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(toggleBtn);
    document.body.appendChild(panel);
}

/**
 * 应用字体大小
 * @param {number} size - 字体大小百分比 (70-150)
 */
function applyFontSize(size) {
    // 设置根字体大小
    const baseFontSize = 16 * (size / 100);
    document.documentElement.style.setProperty('--font-size-base', `${baseFontSize}px`);
    
    // 更新显示值
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeValue) {
        fontSizeValue.textContent = `${size}%`;
    }
}

/**
 * 切换设置面板显示/隐藏
 * @param {Event} e - 事件对象
 */
function toggleSettingsPanel(e) {
    e.preventDefault(); // 阻止默认行为
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
        settingsPanel.classList.toggle('visible');
    }
}

/**
 * 处理点击面板外部区域
 * @param {Event} e - 事件对象
 */
function handleOutsideClick(e) {
    const settingsPanel = document.getElementById('settings-panel');
    const settingsToggle = document.getElementById('settings-toggle');
    
    if (settingsPanel && settingsPanel.classList.contains('visible') && 
        !settingsPanel.contains(e.target) && 
        e.target !== settingsToggle && 
        !settingsToggle.contains(e.target)) {
        settingsPanel.classList.remove('visible');
    }
} 