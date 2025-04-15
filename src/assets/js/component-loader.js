// src/assets/js/component-loader.js
async function loadComponent(componentPath, targetElementId, pageLevel) {
  const targetElement = document.getElementById(targetElementId);
  if (!targetElement) {
    console.error(`Target element with ID "${targetElementId}" not found.`);
    return Promise.reject(`Target element with ID "${targetElementId}" not found.`); // 返回拒绝的 Promise
  }
  try {
    // 简化路径逻辑：对于 src 子目录下的所有页面，访问 components 都用 ../
    const basePath = '../components/';

    // 返回 fetch promise
    return fetch(`${basePath}${componentPath}`)
      .then(response => {
        if (!response.ok) {
          const attemptedUrl = new URL(`${basePath}${componentPath}`, window.location.href).href;
          console.error(`Failed to load component: ${response.status} ${response.statusText} from ${attemptedUrl}`);
          throw new Error(`Failed to load component: ${response.statusText} from ${basePath}${componentPath}. Attempted URL: ${attemptedUrl}`);
        }
        return response.text();
      })
      .then(html => {
        targetElement.innerHTML = html;

        // 组件加载后，调整页眉链接并初始化设置控件
        if (targetElementId === 'main-header') {
            updateHeaderLinks(pageLevel);
            // 确保 settings.js 中的初始化函数可用
            if (typeof initializeHeaderSettings === 'function') {
                initializeHeaderSettings();
            } else {
                console.error("[Loader] initializeHeaderSettings function not found in settings.js");
            }
        }
        // console.log(`Component ${componentPath} loaded into #${targetElementId}`);
        // 返回成功信号（或可以返回html）
        return true;
      });

  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
    targetElement.innerHTML = `<p style="color: red;">Error loading ${componentPath}. Check console for details.</p>`;
    return Promise.reject(error); // 返回拒绝的 Promise
  }
}

// 更新页眉导航链接的辅助函数
function updateHeaderLinks(pageLevel) {
    const headerNav = document.querySelector('#main-header .main-nav');
    if (!headerNav) return;

    const links = headerNav.querySelectorAll('a');
    links.forEach(link => {
        const originalHref = link.getAttribute('data-original-href') || link.getAttribute('href'); // 存储原始 href
        if (!link.hasAttribute('data-original-href')) { // 确保只设置一次
             link.setAttribute('data-original-href', originalHref);
        }

        let newHref = originalHref;
        if (pageLevel === 'root') {
            // 从 pages/ 访问
            if (originalHref === 'index.html') {
                 newHref = 'index.html'; // 目标是 src/pages/index.html
            } else if (originalHref.startsWith('../tools/')) {
                 // 当 root (pages/index.html) 加载时，'../tools/...' 是正确的相对路径
                 newHref = originalHref;
            } else if (originalHref.startsWith('tools/')) { 
                 // 如果原始 href 缺少 ../，补充上
                 newHref = `../${originalHref}`;
            }
            // 可以在此添加对其他根目录链接的判断
        } else if (pageLevel === 'level1') {
             // 从 lessons/ 或 tools/ 访问
            if (originalHref === 'index.html') {
                 newHref = '../pages/index.html'; // 目标是 src/pages/index.html
            } else if (originalHref.startsWith('../tools/')){
                 // 目标是 src/tools/..., 路径已正确
                 newHref = originalHref;
            } else if (originalHref.startsWith('tools/')) { 
                 newHref = `../${originalHref}`; // 需要补充 ../
            }
             // 可以添加对 lessons/ 目录链接的处理
        }

        link.setAttribute('href', newHref);

        // --- 更新 active 状态 --- 
         const currentPath = window.location.pathname;
         const linkTargetHref = link.getAttribute('href'); // 获取更新后的 href

         // 移除所有 active
         document.querySelectorAll('#main-header .main-nav a.active').forEach(a => a.classList.remove('active'));

         // 根据当前页面路径和链接目标添加 active
         // 1. 主页 (新标日语学习)
         if ((currentPath.endsWith('/pages/index.html') || currentPath.endsWith('/pages/')) && linkTargetHref === 'index.html') {
             link.classList.add('active');
         }
         // 2. 片假名测试
         else if (currentPath.includes('/tools/katakana-quiz.html') && linkTargetHref.includes('tools/katakana-quiz.html')) {
             link.classList.add('active');
         }
         // 3. 可以在此添加规则处理其他链接的 active 状态 (例如 "关于本站")

    });
}


async function loadCommonComponents() {
    // 简化层级判断：只区分 pages 和其他
    const path = window.location.pathname;
    const level = path.includes('/pages/') ? 'root' : 'level1';

    // 使用 Promise.all 等待 header 和 footer 加载完成
    try {
        await Promise.all([
            loadComponent('header.html', 'main-header', level),
            loadComponent('footer.html', 'main-footer', level)
        ]);
        // console.log('Header and Footer loaded successfully.');
        // 所有组件加载完成后，分发一个自定义事件
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    } catch (error) {
        console.error('Error loading one or more common components:', error);
        // 即使出错，也可能需要通知其他脚本（或不通知，取决于需求）
        // document.dispatchEvent(new CustomEvent('componentsLoadFailed'));
    }
}

// 页面加载后自动执行加载
document.addEventListener('DOMContentLoaded', loadCommonComponents); 