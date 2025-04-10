// 提取的 JavaScript (增强版 - 用于单个课程页面)

// --- 全局元素 (课程页面需要) ---
const translationModal = document.getElementById("translation-modal");
const modalTitle = document.getElementById("modal-lesson-title");
const modalBody = document.getElementById("modal-body");

// --- 核心功能 ---

/**
 * 切换句子详情的显示/隐藏状态，并带有动画和 ARIA 属性更新。
 * @param {HTMLElement} element - 触发切换的元素 (通常是 .original-sentence)。
 */
function toggleDetails(element) {
    // 检查元素和下一个兄弟元素是否存在
    if (!element || !element.nextElementSibling) {
        console.error("toggleDetails 错误: 无效的元素或未找到下一个兄弟元素:", element);
        return;
    }

    const detailsDiv = element.nextElementSibling; // 获取紧邻的下一个元素

    // 确认兄弟元素是句子详情容器
    if (detailsDiv && detailsDiv.classList.contains('sentence-details')) {
        const isVisible = detailsDiv.classList.contains('details-visible');

        // 切换触发元素的 ARIA 属性
        element.setAttribute('aria-expanded', !isVisible);
        // 切换详情元素的可见性 class
        detailsDiv.classList.toggle('details-visible');

        // 可选: 焦点管理 - 如果是展开操作，可以考虑将焦点移到详情区域或内部的第一个元素
        // if (!isVisible) {
        //     detailsDiv.focus(); // 需要 detailsDiv 设置 tabindex="-1"
        // }

    } else {
        console.error("toggleDetails 错误: 兄弟元素不是 '.sentence-details'，对于:", element);
    }
}

/**
 * 显示指定课程的翻译模态框。
 * @param {string} lessonId - 课程 div 的 ID (例如 'lesson1')。
 */
function showLessonTranslation(lessonId) {
    console.log(`尝试显示课程 ${lessonId} 的翻译`);

    // 检查必要的模态框元素是否存在
    if (!translationModal || !modalTitle || !modalBody) {
        console.error("无法显示翻译：模态框元素未找到！");
        alert("翻译功能组件缺失。(错误: Modal elements missing)");
        return;
    }

    const lessonDiv = document.getElementById(lessonId);
    if (!lessonDiv) {
        console.error(`翻译模态框错误: 未找到 ID 为 ${lessonId} 的课程元素。`);
        modalTitle.textContent = "错误 (Error)";
        modalBody.innerHTML = `<p>无法加载课程 ${lessonId} 的翻译数据。</p>`;
        // 即使出错也要显示模态框，告知用户
        translationModal.classList.add('modal-visible');
        document.body.classList.add('modal-open'); // 防止背景滚动
        document.documentElement.classList.add('modal-open'); // 确保html也禁止滚动
        translationModal.setAttribute('aria-hidden', 'false');
        translationModal.setAttribute('aria-modal', 'true');
        return;
    }

    // 获取课程标题
    const lessonTitleElement = lessonDiv.querySelector('h2');
    let lessonTitleText = "未知课程";
    if (lessonTitleElement) {
        // 尝试提取不含 <rt> 的文本
        lessonTitleText = Array.from(lessonTitleElement.childNodes)
                              .filter(node => node.nodeType === Node.TEXT_NODE || (node.tagName && node.tagName.toLowerCase() !== 'rt'))
                              .map(node => node.textContent)
                              .join('').trim() || lessonTitleElement.textContent.trim() || "课程标题";
    }

    // 查找并填充翻译数据
    const translationDataElement = lessonDiv.querySelector('.lesson-translation-data');
    modalTitle.textContent = `${lessonTitleText} - 中文翻译对照`;

    if (translationDataElement) {
         modalBody.innerHTML = translationDataElement.innerHTML;
         console.log(`翻译模态框已为 ${lessonId} 打开`);
    } else {
        modalBody.innerHTML = "<p>抱歉，该课的翻译数据尚未提供。</p>";
        console.warn(`未找到课程 ${lessonId} 的翻译数据 (.lesson-translation-data)`);
    }

    // 使用 class 显示模态框以触发动画
    translationModal.classList.add('modal-visible');
    document.body.classList.add('modal-open'); // 防止背景滚动
    document.documentElement.classList.add('modal-open'); // 确保html也禁止滚动
    translationModal.setAttribute('aria-hidden', 'false'); // 可访问性
    translationModal.setAttribute('aria-modal', 'true');  // 可访问性

    // 焦点管理: 打开后将焦点移到模态框容器或关闭按钮
    const closeButton = translationModal.querySelector('.modal-close-button');
    if (closeButton) {
        closeButton.focus();
    } else {
        translationModal.focus(); // 需要模态框设置 tabindex="-1"
    }


    // 当翻译模态框打开时，自动折叠该课程内所有已展开的句子详情
    const allSentenceDetails = lessonDiv.querySelectorAll('.sentence-details');
    allSentenceDetails.forEach(div => {
        if (div.classList.contains('details-visible')) {
            // 找到对应的触发器 (句子)
            const triggerId = div.getAttribute('aria-labelledby');
            const triggerElement = triggerId ? document.getElementById(triggerId) : null;
            // 如果找到了触发器，更新其 ARIA 状态
            if(triggerElement) {
                triggerElement.setAttribute('aria-expanded', 'false');
            }
            // 移除 'details-visible' 类来折叠详情
            div.classList.remove('details-visible');
        }
    });
}

/**
 * 关闭翻译模态框。
 */
function closeTranslationModal() {
    if (translationModal) {
        // 使用 class 隐藏模态框以触发动画
        translationModal.classList.remove('modal-visible');
        document.body.classList.remove('modal-open'); // 允许背景滚动
        document.documentElement.classList.remove('modal-open'); // 确保html也恢复滚动
        translationModal.setAttribute('aria-hidden', 'true'); // 可访问性
        translationModal.removeAttribute('aria-modal');     // 可访问性

        // 可选: 在动画结束后清空内容 (如果需要，需要监听 transitionend 事件)
        // 为简单起见，这里直接清空
        if (modalBody) {
             modalBody.innerHTML = "";
        }
        console.log("翻译模态框已关闭。");

        // 可选: 焦点管理: 将焦点返回到打开模态框的元素 (如果已知)
        // 这需要存储触发元素，例如存储在全局变量或 data 属性中。
        // 示例 (简化): document.getElementById(lastFocusedElementId)?.focus();

    } else {
        console.error("无法关闭翻译模态框：元素未找到。");
    }
}


// --- 初始化和事件监听器 (单个课程页面逻辑) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM 已完全加载。正在初始化增强版单课程页面脚本。");

    // 查找当前页面的课程容器 div
    const currentLessonDiv = document.querySelector('.lesson'); // 基于 .lesson 类

    if (currentLessonDiv) {
        const lessonId = currentLessonDiv.id;
        console.log(`找到课程 div: #${lessonId}`);

        // 确保课程 div 有 ID
        if (!lessonId) {
             console.error("错误：课程 div 缺少 ID 属性！");
             // 如果没有 ID，后续依赖 ID 的功能会失败
        }

        // 为每个句子及其详情设置唯一的 ID，并链接 ARIA 属性以增强可访问性
        const sentences = currentLessonDiv.querySelectorAll('.original-sentence');
        sentences.forEach((sentence, index) => {
            const detailsDiv = sentence.nextElementSibling;
            // 确保下一个兄弟元素是详情 div
            if (detailsDiv && detailsDiv.classList.contains('sentence-details')) {
                const sentenceId = `${lessonId}-sentence-${index}`;
                const detailsId = `${lessonId}-details-${index}`;

                // 设置句子元素的属性
                sentence.setAttribute('id', sentenceId);
                sentence.setAttribute('role', 'button');      // 语义上作为按钮
                sentence.setAttribute('aria-expanded', 'false'); // 初始状态为折叠
                sentence.setAttribute('aria-controls', detailsId); // 控制哪个详情区域
                sentence.setAttribute('tabindex', '0');        // 使其可通过 Tab 键聚焦

                // 设置详情元素的属性
                detailsDiv.setAttribute('id', detailsId);
                detailsDiv.setAttribute('role', 'region');      // 内容区域
                detailsDiv.setAttribute('aria-labelledby', sentenceId); // 由哪个句子标签控制
                // detailsDiv.setAttribute('tabindex', '-1'); // 如果需要程序化聚焦详情区，则添加
            }

            // 移除旧的内联 onclick 事件处理器 (如果存在)
            if (sentence.hasAttribute('onclick')) {
                sentence.removeAttribute('onclick');
                console.log(`移除了句子 ${index} 的内联 onclick`);
            }

            // 添加健壮的事件监听器
            sentence.addEventListener('click', function() { toggleDetails(this); });
            sentence.addEventListener('keydown', function(event) { // 添加键盘支持 (Enter 或 Space)
                 if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault(); // 阻止空格键的默认滚动行为
                    toggleDetails(this);
                 }
            });
        });
        console.log(`已为 ${sentences.length} 个句子初始化 ARIA 属性和事件监听器。`);

        // 为课程标题设置监听器 (用于触发翻译模态框)
        const title = currentLessonDiv.querySelector('h2');
        if (title && lessonId) {
             // 移除旧的内联 onclick (如果存在)
             if (title.hasAttribute('onclick')) {
                 title.removeAttribute('onclick');
                 console.log('移除了标题的内联 onclick');
             }

             // 添加新的点击监听器
             title.addEventListener('click', () => {
                 // 再次检查模态框元素是否存在
                 if (translationModal && modalTitle && modalBody) {
                    showLessonTranslation(lessonId);
                 } else {
                     console.error("点击标题时错误：模态框元素丢失！");
                     alert("翻译功能组件缺失。");
                 }
             });
             // 使标题也可通过键盘触发
             title.setAttribute('role', 'button');
             title.setAttribute('tabindex', '0');
              title.addEventListener('keydown', (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      if (translationModal && modalTitle && modalBody) {
                          showLessonTranslation(lessonId);
                      } else {
                           console.error("键盘触发标题时错误：模态框元素丢失！");
                           alert("翻译功能组件缺失。");
                      }
                  }
              });
             console.log(`已为课程 ${lessonId} 的标题添加点击和键盘监听器。`);
        } else {
             console.warn(`未能为课程 ${lessonId} 设置标题监听器 (标题元素或 lessonId 缺失)。`);
        }
    } else {
        // console.log("当前页面不是课程页面 (未找到 '.lesson' 元素)。");
        // 这个脚本主要服务于课程页面，所以在索引页或其他页面此消息是正常的。
    }

    // --- 全局事件监听器 (翻译模态框) ---
    if (translationModal) {
        // 为模态框本身添加必要的 ARIA 属性
        translationModal.setAttribute('role', 'dialog');
        translationModal.setAttribute('aria-hidden', 'true'); // 初始状态为隐藏
        if(modalTitle) translationModal.setAttribute('aria-labelledby', 'modal-lesson-title'); // 指向标题
        // translationModal.setAttribute('tabindex', '-1'); // 如果需要使模态框本身可聚焦

        // 获取并绑定关闭按钮事件
        const modalCloseBtn = translationModal.querySelector('.modal-close-button');
        if (modalCloseBtn) {
             modalCloseBtn.addEventListener('click', closeTranslationModal);
             console.log("翻译模态框关闭按钮监听器已添加。");
        } else {
             console.warn("未找到翻译模态框的关闭按钮 '.modal-close-button'。");
        }

        // 点击模态框外部区域关闭模态框
        translationModal.addEventListener('click', (event) => {
            // 检查点击事件的目标是否是模态框背景本身
            if (event.target === translationModal) {
                closeTranslationModal();
            }
        });
        console.log("点击模态框外部关闭的监听器已添加。");

    } else {
        // 如果页面上没有翻译模态框（例如在 index.html 上），则跳过这些监听器
        // console.log("未找到翻译模态框元素。跳过翻译模态框相关的全局监听器。");
    }

    // Escape 键全局监听器 (用于关闭当前可见的模态框)
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" || event.key === "Esc") {
            // 检查翻译模态框是否可见并关闭它
            if (translationModal && translationModal.classList.contains('modal-visible')) {
                closeTranslationModal();
            }
            // 注意: 此处未处理 index.html 的使用指南弹窗，它的关闭逻辑在 index.html 的内联脚本中
        }
    });
    console.log("全局 Escape 键监听器已添加。");

    console.log("DOMContentLoaded 处理完成。");
});

console.log("增强版脚本已加载。等待 DOMContentLoaded 事件...");