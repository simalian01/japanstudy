# 批量更新所有课程文件，添加对components.js的引用
$lessonFiles = Get-ChildItem -Path "..\src\lessons\*.html"

Write-Host "开始批量更新课程页面，添加components.js引用..." -ForegroundColor Cyan
Write-Host "找到 $($lessonFiles.Count) 个课程文件需要处理" -ForegroundColor Cyan

$successCount = 0

foreach ($file in $lessonFiles) {
    Write-Host "处理文件: $($file.Name)" -ForegroundColor Yellow
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw
    $updatedContent = $false
    
    # 检查文件是否已经包含components.js引用
    if ($content -match "components\.js") {
        Write-Host "  文件已包含components.js引用，跳过" -ForegroundColor Gray
    }
    else {
        # 查找settings.js引用的位置
        if ($content -match "<script src="".*?settings\.js"">") {
            # 在settings.js前添加components.js
            $settingsScript = $matches[0]
            $componentsScript = "<script src=""../assets/js/components.js""></script>`n    "
            
            # 替换内容
            $content = $content -replace [regex]::Escape($settingsScript), "$componentsScript$settingsScript"
            
            Write-Host "  已在settings.js前添加components.js引用" -ForegroundColor Green
            $updatedContent = $true
        }
        # 如果没有settings.js，但有script.js
        elseif ($content -match "<script src="".*?script\.js"">") {
            # 在script.js后添加components.js
            $scriptTag = $matches[0]
            $scriptCloseTag = "</script>"
            $insertPos = $content.IndexOf($scriptCloseTag, $content.IndexOf($scriptTag)) + $scriptCloseTag.Length
            
            # 插入components.js
            $componentsScript = "`n    <!-- 组件功能脚本 -->`n    <script src=""../assets/js/components.js""></script>"
            $content = $content.Insert($insertPos, $componentsScript)
            
            Write-Host "  已在script.js后添加components.js引用" -ForegroundColor Green
            $updatedContent = $true
        }
        # 如果都没有找到，在</body>前添加所有脚本
        else {
            $bodyEndPos = $content.LastIndexOf("</body>")
            if ($bodyEndPos -ne -1) {
                $scriptsToAdd = "`n    <!-- JavaScript 链接 -->`n    <script src=""../assets/js/script.js""></script>`n    `n    <!-- 组件功能脚本 -->`n    <script src=""../assets/js/components.js""></script>`n    `n    <!-- 网站设置脚本 -->`n    <script src=""../assets/js/settings.js""></script>`n"
                $content = $content.Insert($bodyEndPos, $scriptsToAdd)
                
                Write-Host "  已添加全部所需脚本" -ForegroundColor Green
                $updatedContent = $true
            }
            else {
                Write-Host "  无法找到</body>标签，更新失败" -ForegroundColor Red
            }
        }
    }
    
    # 只有在内容发生变化时才写入文件
    if ($updatedContent) {
        # 写入文件
        Set-Content -Path $file.FullName -Value $content
        $successCount++
        Write-Host "  文件已更新" -ForegroundColor Green
    }
}

Write-Host "`n批量更新完成! $successCount/$($lessonFiles.Count) 个文件已更新" -ForegroundColor Cyan 