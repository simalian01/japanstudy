/**
 * 批量更新所有课程页面的脚本
 * 为每个lesson.html添加settings.js引用，确保黑暗模式正常工作
 */

const fs = require('fs');
const path = require('path');

// 主函数
async function main() {
    console.log('开始批量更新课程页面...');
    
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
    
    // 检查文件是否已经包含settings.js引用
    if (content.includes('settings.js')) {
        return false; // 已经包含引用，无需更新
    }
    
    // 查找body结束标签的位置
    const bodyEndPos = content.lastIndexOf('</body>');
    
    if (bodyEndPos === -1) {
        throw new Error('找不到</body>标签');
    }
    
    // 检查是否有script.js引用
    const hasScriptJs = content.includes('script.js');
    
    // 准备要插入的代码
    let insertCode;
    if (hasScriptJs) {
        // 如果已存在script.js引用，在其后添加settings.js
        const scriptPos = content.lastIndexOf('<script src="../assets/js/script.js');
        const scriptEndPos = content.indexOf('</script>', scriptPos) + 9;
        
        insertCode = '\n    <!-- 网站设置脚本 -->\n    <script src="../assets/js/settings.js"></script>';
        content = content.slice(0, scriptEndPos) + insertCode + content.slice(scriptEndPos);
    } else {
        // 如果不存在script.js引用，添加两个脚本
        insertCode = '\n    <!-- JavaScript 链接 -->\n    <script src="../assets/js/script.js"></script>\n    \n    <!-- 网站设置脚本 -->\n    <script src="../assets/js/settings.js"></script>\n';
        content = content.slice(0, bodyEndPos) + insertCode + content.slice(bodyEndPos);
    }
    
    // 写入更新后的内容
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

// 运行主函数
main().catch(err => {
    console.error('脚本执行失败:', err);
    process.exit(1);
}); 