/**
 * components.js - 核心组件初始化模块
 * 负责站点通用组件的初始化和交互功能
 */

/**
 * 初始化站点组件
 * 处理全局组件的初始化和配置
 */
function initializeComponents() {
    console.log('[Components] 初始化站点组件...');
    
    // 初始化导航栏高亮
    highlightActiveNavItem();
    
    // 初始化可能的全局事件监听器
    setupGlobalEventListeners();
}

/**
 * 初始化课程交互功能
 * 处理课程页面特定的交互功能
 */
function initializeLessonInteractions() {
    console.log('[Components] 初始化课程交互...');
    
    // 检查是否是课程页面
    if (!document.querySelector('.lesson')) {
        console.log('[Components] 不是课程页面，跳过课程交互初始化');
        return;
    }
    
    // 初始化句子交互
    initializeSentenceInteractions();
    
    // 初始化语法说明交互
    initializeGrammarExplanations();
}

/**
 * 高亮当前活动导航项
 */
function highlightActiveNavItem() {
    // 获取当前页面URL
    const currentPath = window.location.pathname;
    
    // 查找所有导航链接
    const navLinks = document.querySelectorAll('.main-nav a');
    
    // 遍历链接查找匹配项
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // 确定当前页面的路径，适应新的目录结构
        let isActive = false;
        
        // 处理不同目录深度的匹配
        if (href) {
            // 规范化路径，处理index.html和目录路径
            const hrefPath = href.split('/').pop();
            const currentFile = currentPath.split('/').pop() || 'index.html';
            
            if (hrefPath === currentFile) {
                isActive = true;
            } else if (href.endsWith('index.html') && currentPath.endsWith('/')) {
                isActive = true;
            } else if (currentPath.includes(href) && href !== '#') {
                isActive = true;
            }
        }
        
        // 应用active类
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 设置全局事件监听器
 */
function setupGlobalEventListeners() {
    // 处理键盘快捷键
    document.addEventListener('keydown', function(event) {
        // 例如，Escape键关闭模态框
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.modal-visible');
            modals.forEach(modal => {
                modal.classList.remove('modal-visible');
                document.documentElement.classList.remove('modal-open');
            });
        }
    });
}

/**
 * 初始化句子交互功能
 */
function initializeSentenceInteractions() {
    // 获取所有原始句子元素
    const sentences = document.querySelectorAll('.original-sentence');
    
    // 为每个句子添加点击事件
    sentences.forEach(sentence => {
        // 避免重复添加事件监听器
        if (sentence.getAttribute('data-initialized') === 'true') {
            return;
        }
        
        sentence.addEventListener('click', function() {
            // 切换展开状态
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            
            // 获取对应的详情元素
            const detailsId = this.getAttribute('aria-controls');
            if (detailsId) {
                const details = document.getElementById(detailsId);
                if (details) {
                    // 切换详情可见性
                    details.classList.toggle('details-visible');
                }
            }
        });
        
        // 标记为已初始化
        sentence.setAttribute('data-initialized', 'true');
    });
    
    console.log(`[Components] 已初始化 ${sentences.length} 个句子交互`);
}

/**
 * 初始化语法说明交互
 */
function initializeGrammarExplanations() {
    // 获取所有语法说明元素
    const explanations = document.querySelectorAll('.grammar-explanation');
    
    // 对每个语法说明应用交互逻辑
    explanations.forEach(explanation => {
        // 可能的交互增强
        enhanceGrammarExplanation(explanation);
    });
    
    console.log(`[Components] 已初始化 ${explanations.length} 个语法说明`);
}

/**
 * 增强语法说明显示
 * @param {HTMLElement} explanation - 语法说明元素
 */
function enhanceGrammarExplanation(explanation) {
    // 处理注音标记
    const rubyElements = explanation.querySelectorAll('ruby');
    rubyElements.forEach(ruby => {
        // 为每个ruby元素添加hover效果或其他交互
        const rt = ruby.querySelector('rt');
        if (rt) {
            // 存储原始注音文本
            ruby.setAttribute('data-reading', rt.textContent);
        }
    });
}

/**
 * Ruby注音格式转换代理函数
 * 调用settings.js中的实现，实现跨模块功能
 */
function convertRubyToBracketFormat() {
    // 尝试访问modules中的函数
    if (typeof window.convertRubyToBracketFormatImpl === 'function') {
        window.convertRubyToBracketFormatImpl();
    } else {
        console.warn('[Components] convertRubyToBracketFormatImpl函数未找到，确保settings.js已正确加载');
        
        // 备用实现，防止错误
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
            console.error('[Components] 转换ruby注音格式时出错:', e);
        }
    }
} 