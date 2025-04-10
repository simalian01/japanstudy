# 批量更新所有课程文件，添加对settings.js的引用
$lessonFiles = Get-ChildItem -Path "lessons\*.html"

foreach ($file in $lessonFiles) {
    Write-Host "处理文件: $($file.Name)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw
    
    # 检查文件是否已经包含settings.js引用
    if ($content -match "settings\.js") {
        Write-Host "  文件已包含settings.js引用，跳过"
    }
    else {
        # 替换结束标签前的内容，添加settings.js引用
        $content = $content -replace "</body>", @"
    <!-- JavaScript 链接 (相对路径, 放在 body 结束前) -->
    <script src="../assets/js/script.js"></script>
    
    <!-- 网站设置脚本 -->
    <script src="../assets/js/settings.js"></script>
</body>
"@
        
        # 如果已经有script.js引用，则不再重复添加
        if ($content -match "script\.js") {
            $content = $content -replace "</body>", @"
    
    <!-- 网站设置脚本 -->
    <script src="../assets/js/settings.js"></script>
</body>
"@
        }
        
        Write-Host "  已添加settings.js引用"
    }
    
    # 更新返回链接样式
    if ($content -match 'style="padding: 10px 20px; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;"') {
        $content = $content -replace '<div style="padding: 10px 20px; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">', '<div class="lesson-back-link">'
        $content = $content -replace '<a href="../index.html" style="text-decoration:none; color:#0056b3; font-weight: bold;">', '<a href="../index.html">'
        Write-Host "  已更新返回链接样式"
    }
    
    # 更新内容区域样式
    if ($content -match 'class="lesson-page-content" style="padding: 20px;"') {
        $content = $content -replace 'class="lesson-page-content" style="padding: 20px;"', 'class="lesson-page-content"'
        Write-Host "  已更新内容区域样式"
    }
    
    # 写入文件
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "  文件处理完成"
}

Write-Host "批量更新完成!" 