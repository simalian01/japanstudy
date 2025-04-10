/**
 * settings.js - 网站设置控制脚本 (改进版)
 * 处理暗黑模式、字体大小调整和布局选择等网站设置
 */

// 立即应用存储的主题设置，不等待DOMContentLoaded
(function() {
    try {
        // 立即应用主题设置，避免闪烁
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
        
        // 应用到文档根元素
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // 预先应用布局设置
        const storedLayout = localStorage.getItem('layout') || 'normal';
        document.documentElement.setAttribute('data-layout', storedLayout);

        // 记录应用情况，便于调试
        console.log(`[Settings] 立即应用主题: ${currentTheme}, 布局: ${storedLayout}`);
    } catch (e) {
        console.error('[Settings] 预加载设置时出错:', e);
    }
})();

// 在DOMContentLoaded事件中初始化其他设置
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Settings] DOM加载完成，初始化设置面板');
    // 初始化设置面板
    initSettingsPanel();
    
    // 转换注音格式
    convertRubyToBracketFormat();
});

/**
 * 初始化设置面板及其功能
 */
function initSettingsPanel() {
    // 判断是否使用新的导航栏设置控件
    const useNavSettings = true; // 切换为 true 启用新控件，false 使用旧控件
    
    if (useNavSettings) {
        // 创建并初始化导航栏设置控件
        initNavSettings();
    } else {
        // 初始化旧版悬浮设置控件 (向后兼容)
        initFloatingSettings();
    }
    
    // 应用已保存的设置
    applyStoredSettings();
}

/**
 * 创建并初始化新的导航栏设置控件
 */
function initNavSettings() {
    // 检查是否已存在设置控件
    if (document.querySelector('.nav-settings-container')) {
        return;
    }

    // 1. 查找导航栏
    const navElement = document.querySelector('.main-nav');
    if (!navElement) {
        console.error('无法找到主导航栏元素 .main-nav，无法添加设置控件');
        // 回退到旧版悬浮控件
        initFloatingSettings();
        return;
    }

    // 2. 创建设置控件容器
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'nav-settings-container';
    
    // 3. 创建设置按钮
    const settingsButton = document.createElement('button');
    settingsButton.className = 'nav-settings-button';
    settingsButton.innerHTML = '⚙️';
    settingsButton.setAttribute('aria-label', '网站设置');
    settingsButton.setAttribute('title', '打开网站设置');
    
    // 4. 创建设置下拉菜单
    const settingsDropdown = document.createElement('div');
    settingsDropdown.className = 'nav-settings-dropdown';
    
    // 5. 设置下拉菜单内容
    settingsDropdown.innerHTML = `
        <h3 class="settings-heading">网站设置</h3>
        
        <!-- 布局选择 -->
        <div class="layout-switch">
            <label>布局:</label>
            <div class="layout-options">
                <div class="layout-option" data-layout="compact" title="紧凑布局">紧凑</div>
                <div class="layout-option active" data-layout="normal" title="标准布局">标准</div>
            </div>
        </div>
        
        <!-- 暗黑模式开关 -->
        <div class="settings-option">
            <label for="nav-theme-toggle">暗黑模式</label>
            <label class="theme-switch">
                <input type="checkbox" id="nav-theme-toggle" />
                <span class="theme-slider"></span>
            </label>
        </div>
        
        <!-- 字体大小控制 -->
        <div class="settings-option">
            <label>字体大小</label>
            <div class="font-size-controls">
                <button id="nav-decrease-font" class="font-size-btn" aria-label="减小字体">−</button>
                <span id="nav-font-size-value" class="font-size-value">100%</span>
                <button id="nav-increase-font" class="font-size-btn" aria-label="增大字体">+</button>
            </div>
        </div>
    `;
    
    // 6. 将控件添加到导航栏
    settingsContainer.appendChild(settingsButton);
    settingsContainer.appendChild(settingsDropdown);
    navElement.parentNode.appendChild(settingsContainer);
    
    // 7. 绑定事件处理函数
    
    // 点击按钮切换下拉菜单显示
    settingsButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        settingsDropdown.classList.toggle('active');
    });
    
    // 点击外部区域关闭菜单
    document.addEventListener('click', function(e) {
        if (!settingsContainer.contains(e.target)) {
            settingsDropdown.classList.remove('active');
        }
    });
    
    // 初始化布局切换
    const layoutOptions = settingsDropdown.querySelectorAll('.layout-option');
    layoutOptions.forEach(option => {
        option.addEventListener('click', function() {
            const layout = this.getAttribute('data-layout');
            setLayout(layout);
            
            // 更新激活样式
            layoutOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // 关闭下拉菜单
            settingsDropdown.classList.remove('active');
        });
    });
    
    // 初始化暗黑模式开关
    const themeToggle = document.getElementById('nav-theme-toggle');
    themeToggle.addEventListener('change', function() {
        setTheme(this.checked ? 'dark' : 'light');
    });
    
    // 初始化字体大小控制
    const decreaseFontBtn = document.getElementById('nav-decrease-font');
    const increaseFontBtn = document.getElementById('nav-increase-font');
    const fontSizeValue = document.getElementById('nav-font-size-value');
    
    decreaseFontBtn.addEventListener('click', function() {
        changeFontSize(-10);
    });
    
    increaseFontBtn.addEventListener('click', function() {
        changeFontSize(10);
    });
}

/**
 * 初始化旧版悬浮设置控件 (向后兼容)
 */
function initFloatingSettings() {
    // 如果设置面板不存在于当前页面，则创建并添加
    let settingsToggle = document.getElementById('settings-toggle');
    let settingsPanel = document.getElementById('settings-panel');
    
    // 如果设置面板不存在，创建它
    if (!settingsToggle || !settingsPanel) {
        createFloatingPanelDOM();
        // 重新获取元素引用
        settingsToggle = document.getElementById('settings-toggle');
        settingsPanel = document.getElementById('settings-panel');
    }
    
    // 获取设置控件
    const themeToggle = document.getElementById('theme-toggle');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const increaseFontBtn = document.getElementById('increase-font');
    
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 清除可能存在的事件监听器
    if (settingsToggle) {
        const oldToggle = settingsToggle.cloneNode(true);
        settingsToggle.parentNode.replaceChild(oldToggle, settingsToggle);
        settingsToggle = oldToggle;
    }
    
    // 根据设备类型添加不同的事件监听
    if (settingsToggle) {
        // 注意：修改为使用普通点击，移除长按需求
        settingsToggle.addEventListener('click', function(e) {
            e.preventDefault();
            settingsPanel.classList.toggle('visible');
        });
    }
    
    // 点击面板外部区域关闭面板
    document.addEventListener('click', function(e) {
        if (settingsPanel && settingsPanel.classList.contains('visible') && 
            !settingsPanel.contains(e.target) && 
            e.target !== settingsToggle && 
            !settingsToggle.contains(e.target)) {
            settingsPanel.classList.remove('visible');
        }
    });
    
    // 初始化暗黑模式开关
    themeToggle.addEventListener('change', function() {
        setTheme(this.checked ? 'dark' : 'light');
    });
    
    // 初始化字体大小控制
    decreaseFontBtn.addEventListener('click', function() {
        changeFontSize(-10);
    });
    
    increaseFontBtn.addEventListener('click', function() {
        changeFontSize(10);
    });
}

/**
 * 应用已保存的设置
 */
function applyStoredSettings() {
    console.log('[Settings] 应用已保存的设置到控件...');
    
    // 应用主题设置（读取当前DOM中的值而不是从本地存储读取）
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // 只更新控件状态，不重新设置主题（避免闪烁）
    updateThemeControls(currentTheme);
    
    // 应用字体大小设置
    const fontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    setFontSize(fontSize);
    
    // 应用布局设置（读取当前DOM中的值）
    const currentLayout = document.documentElement.getAttribute('data-layout') || 'normal';
    
    // 只更新控件状态，不重新设置布局
    updateLayoutControls(currentLayout);
}

/**
 * 仅更新主题控件状态，不修改DOM
 */
function updateThemeControls(theme) {
    // 更新控件状态
    const themeToggles = [
        document.getElementById('nav-theme-toggle'),
        document.getElementById('theme-toggle')
    ];
    
    themeToggles.forEach(toggle => {
        if (toggle) {
            toggle.checked = (theme === 'dark');
        }
    });
}

/**
 * 仅更新布局控件状态，不修改DOM
 */
function updateLayoutControls(layout) {
    // 更新布局选项的激活状态
    const layoutOptions = document.querySelectorAll('.layout-option');
    layoutOptions.forEach(option => {
        const optionLayout = option.getAttribute('data-layout');
        if (optionLayout === layout) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

/**
 * 设置主题 (暗/亮)
 * @param {string} theme - 'dark' 或 'light'
 */
function setTheme(theme) {
    // 获取当前主题
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // 如果主题没有变化，只更新控件状态
    if (currentTheme === theme) {
        console.log(`[Settings] 主题未变化: ${theme}, 仅更新控件`);
        updateThemeControls(theme);
        return;
    }
    
    console.log(`[Settings] 应用新主题: ${theme} (当前: ${currentTheme})`);
    
    // 应用新主题到DOM
    document.documentElement.setAttribute('data-theme', theme);
    
    // 保存到本地存储
    localStorage.setItem('theme', theme);
    
    // 更新控件状态
    updateThemeControls(theme);
}

/**
 * 设置字体大小
 * @param {number} size - 字体大小百分比 (70-150)
 */
function setFontSize(size) {
    // 确保大小在允许范围内
    size = Math.max(70, Math.min(150, size));
    
    // 设置根字体大小
    const baseFontSize = 16 * (size / 100);
    document.documentElement.style.setProperty('--font-size-base', `${baseFontSize}px`);
    
    // 保存设置
    localStorage.setItem('fontSize', size.toString());
    
    // 更新显示值
    const fontSizeDisplays = [
        document.getElementById('nav-font-size-value'),
        document.getElementById('font-size-value')
    ];
    
    fontSizeDisplays.forEach(display => {
        if (display) {
            display.textContent = `${size}%`;
        }
    });
}

/**
 * 改变字体大小
 * @param {number} change - 要改变的数值，正数为增加，负数为减小
 */
function changeFontSize(change) {
    const currentSize = parseInt(localStorage.getItem('fontSize')) || 100;
    const newSize = currentSize + change;
    
    if (newSize >= 70 && newSize <= 150) {
        setFontSize(newSize);
    }
}

/**
 * 设置布局
 * @param {string} layout - 'compact' 或 'normal'
 */
function setLayout(layout) {
    // 移除现有布局类
    document.documentElement.classList.remove('layout-compact', 'layout-normal');
    
    // 添加新布局类
    document.documentElement.classList.add(`layout-${layout}`);
    
    // 添加数据属性
    document.documentElement.setAttribute('data-layout', layout);
    
    // 保存设置
    localStorage.setItem('layout', layout);
    
    // 更新布局选项的激活状态
    const layoutOptions = document.querySelectorAll('.layout-option');
    layoutOptions.forEach(option => {
        const optionLayout = option.getAttribute('data-layout');
        if (optionLayout === layout) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

/**
 * 创建旧版悬浮设置面板DOM
 */
function createFloatingPanelDOM() {
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
        
        <!-- 布局选择 -->
        <div class="layout-switch">
            <label>布局:</label>
            <div class="layout-options">
                <div class="layout-option" data-layout="compact" title="紧凑布局">紧凑</div>
                <div class="layout-option active" data-layout="normal" title="标准布局">标准</div>
            </div>
        </div>
        
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

// 添加对convertRubyToBracketFormat函数的声明，以防main.js直接调用它
// 但实际实现在settings.js中
function convertRubyToBracketFormat() {
    try {
        const rubyElements = document.querySelectorAll('.grammar-explanation ruby');
        
        rubyElements.forEach(ruby => {
            const rtElement = ruby.querySelector('rt');
            if (rtElement) {
                // 设置data-reading属性
                ruby.setAttribute('data-reading', rtElement.textContent);
            }
        });
    } catch (e) {
        console.error('[Settings] 转换ruby注音格式时出错:', e);
    }
}

/**
 * 兼容main.js中的函数名（为避免冲突，使用不同名称）
 * 作为initSettingsPanel的别名
 */
function initializeSettingsPanel() {
    // 调用实际的初始化函数
    initSettingsPanel();
} 