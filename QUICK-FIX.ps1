# سكريبت سريع لحل مشكلة رفع الملفات إلى GitHub
# قم بتشغيل هذا السكريبت بعد إضافة GitHub Token

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  حل مشكلة رفع الملفات إلى GitHub     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# الانتقال إلى مجلد المشروع
$projectPath = "D:\www.majror.com-main"
Set-Location $projectPath

Write-Host "📍 المجلد الحالي: $projectPath" -ForegroundColor Yellow
Write-Host ""

# طلب GitHub Token من المستخدم
Write-Host "يرجى إدخال GitHub Personal Access Token:" -ForegroundColor Cyan
Write-Host "(يمكنك إنشاؤه من: https://github.com/settings/tokens/new)" -ForegroundColor Gray
Write-Host ""
$token = Read-Host "GitHub Token (يبدأ بـ ghp_)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ لم يتم إدخال Token!" -ForegroundColor Red
    exit
}

# تحديث remote URL مع Token
Write-Host ""
Write-Host "🔄 تحديث Git remote URL..." -ForegroundColor Yellow
$remoteUrl = "https://$token@github.com/mairoor/www.majror.com.git"
git remote set-url origin $remoteUrl

Write-Host "✅ تم تحديث remote URL" -ForegroundColor Green
Write-Host ""

# محاولة رفع الملفات
Write-Host "🚀 رفع الملفات إلى GitHub..." -ForegroundColor Yellow
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ تم رفع الملفات بنجاح!" -ForegroundColor Green
    Write-Host ""
    Write-Host "الخطوات التالية:" -ForegroundColor Cyan
    Write-Host "1. اذهب إلى Netlify Dashboard" -ForegroundColor White
    Write-Host "2. أضف متغيرات البيئة:" -ForegroundColor White
    Write-Host "   - GITHUB_TOKEN = $token" -ForegroundColor Gray
    Write-Host "   - GITHUB_OWNER = mairoor" -ForegroundColor Gray
    Write-Host "   - GITHUB_REPO = www.majror.com" -ForegroundColor Gray
    Write-Host "3. اختبر النظام من admin.html" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ حدث خطأ أثناء رفع الملفات" -ForegroundColor Red
    Write-Host "التفاصيل: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "تأكد من:" -ForegroundColor Yellow
    Write-Host "- Token صحيح وله صلاحية repo" -ForegroundColor White
    Write-Host "- حسابك لديه صلاحية الوصول للـ repository" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

