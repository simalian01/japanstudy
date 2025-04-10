/**
 * 批量更新所有课程页面的脚本
 * 为每个lesson.html添加components.js引用，确保网站功能正常
 */

const fs = require('fs');
const path = require('path');

// 主函数
async function main() {
    console.log('开始批量更新课程页面添加components.js引用...');
    
    const lessonsDir = path.join(__dirname, 'lessons');
    
    try {
        // 确保lessons目录存在
        if (!fs.existsSync(lessonsDir)) {
            console.error('Error: lessons目录不存在！');
            return;
        }
        
        // 获取所有lesson*.html文件
        const files = fs.readdirSync(lessonsDir)
            .filter(file => file.startsWith('lesson') && file.endsWith('.html'));
        
        console.log(`找到 ${files.length} 个课程文件需要处理`);
        
        // 更新每个文件
        let successCount = 0;
        for (const file of files) {
            try {
                const filePath = path.join(lessonsDir, file);
                const updated = updateLessonFile(filePath);
                
                if (updated) {
                    successCount++;
                    console.log(`✅ 成功更新: ${file}`);
                } else {
                    console.log(`⏩ 无需更新: ${file}`);
                }
            } catch (err) {
                console.error(`❌ 处理文件 ${file} 时出错: ${err.message}`);
            }
        }
        
        console.log(`\n批量更新完成! ${successCount}/${files.length} 个文件已更新`);
        
    } catch (err) {
        console.error('脚本运行出错:', err);
    }
}

/**
 * 更新单个lesson文件
 * @param {string} filePath - 文件路径 
 * @returns {boolean} - 是否更新了文件
 */
function updateLessonFile(filePath) {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    let needsUpdate = false;
    
    // 检查文件是否已经包含components.js引用
    if (!content.includes('components.js')) {
        needsUpdate = true;
        
        // 查找settings.js或script.js引用的位置
        let insertPosition;
        let insertCode;
        
        if (content.includes('settings.js')) {
            // 如果已存在settings.js引用，在其前添加components.js
            const settingsPos = content.lastIndexOf('<script src="../assets/js/settings.js');
            
            insertCode = '    <!-- 组件功能脚本 -->\n    <script src="../assets/js/components.js"></script>\n    \n';
            content = content.slice(0, settingsPos) + insertCode + content.slice(settingsPos);
        } else if (content.includes('script.js')) {
            // 如果存在script.js但没有settings.js，在script.js后添加
            const scriptPos = content.lastIndexOf('<script src="../assets/js/script.js');
            const scriptEndPos = content.indexOf('</script>', scriptPos) + 9;
            
            insertCode = '\n    <!-- 组件功能脚本 -->\n    <script src="../assets/js/components.js"></script>';
            content = content.slice(0, scriptEndPos) + insertCode + content.slice(scriptEndPos);
        } else {
            // 如果都不存在，在body结束前添加所有脚本
            const bodyEndPos = content.lastIndexOf('</body>');
            
            if (bodyEndPos === -1) {
                throw new Error('找不到</body>标签');
            }
            
            insertCode = '\n    <!-- JavaScript 链接 -->\n    <script src="../assets/js/script.js"></script>\n    \n    <!-- 组件功能脚本 -->\n    <script src="../assets/js/components.js"></script>\n    \n    <!-- 网站设置脚本 -->\n    <script src="../assets/js/settings.js"></script>\n';
            content = content.slice(0, bodyEndPos) + insertCode + content.slice(bodyEndPos);
        }
    }
    
    // 如果有需要更新的内容，写入文件
    if (needsUpdate) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    
    return false;
}

// 运行主函数
main().catch(err => {
    console.error('脚本执行失败:', err);
    process.exit(1);
}); 