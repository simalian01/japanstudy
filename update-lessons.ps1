# 批量更新所有课程文件，添加对settings.js的引用和导航栏
$lessonFiles = Get-ChildItem -Path "lessons\*.html"

foreach ($file in $lessonFiles) {
    Write-Host "处理文件: $($file.Name)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw
    $updatedContent = $false
    
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
        $updatedContent = $true
    }
    
    # 检查是否已经包含导航栏
    if (-not ($content -match "site-header")) {
        Write-Host "  添加导航栏"
        
        # 准备导航栏HTML
        $navbarHTML = @"

<!-- 统一的站点导航栏 -->
<header class="site-header">
    <div class="site-header-content">
        <div class="site-branding">西马利安的日语学习小站</div>
        <nav class="main-nav">
            <ul>
                <!-- 导航链接 -->
                <li><a href="../index.html">新标日语学习</a></li>
                <li><a href="../tools/katakana-quiz.html">片假名测试</a></li>
                <li><a href="#" class="disabled">关于本站 <span class="dev-note">(开发中)</span></a></li>
            </ul>
        </nav>
    </div>
</header>

"@
        
        # 查找<body>标签位置
        if ($content -match "<body[^>]*>") {
            $bodyTagIndex = $content.IndexOf($matches[0]) + $matches[0].Length
            $content = $content.Substring(0, $bodyTagIndex) + $navbarHTML + $content.Substring($bodyTagIndex)
            Write-Host "  导航栏已添加到<body>标签后"
            $updatedContent = $true
        }
        else {
            Write-Host "  无法找到<body>标签，导航栏添加失败" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  文件已包含导航栏，跳过"
    }
    
    # 更新返回链接样式
    if ($content -match 'style="padding: 10px 20px; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;"') {
        $content = $content -replace '<div style="padding: 10px 20px; background-color: #f8f9fa; border-bottom: 1px solid #dee2e6;">', '<div class="lesson-back-link">'
        $content = $content -replace '<a href="../index.html" style="text-decoration:none; color:#0056b3; font-weight: bold;">', '<a href="../index.html">'
        Write-Host "  已更新返回链接样式"
        $updatedContent = $true
    }
    
    # 更新内容区域样式
    if ($content -match 'class="lesson-page-content" style="padding: 20px;"') {
        $content = $content -replace 'class="lesson-page-content" style="padding: 20px;"', 'class="lesson-page-content"'
        Write-Host "  已更新内容区域样式"
        $updatedContent = $true
    }
    
    # 只有在内容发生变化时才写入文件
    if ($updatedContent) {
        # 写入文件
        Set-Content -Path $file.FullName -Value $content
        Write-Host "  文件已更新" -ForegroundColor Green
    }
    else {
        Write-Host "  无需更新" -ForegroundColor Yellow
    }
}

Write-Host "批量更新完成!" -ForegroundColor Green 