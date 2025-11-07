<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// التحقق من الطلب POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'طريقة الطلب غير صحيحة']);
    exit;
}

// الحصول على البيانات
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name']) || !isset($data['category']) || !isset($data['content'])) {
    echo json_encode(['success' => false, 'message' => 'بيانات غير مكتملة']);
    exit;
}

$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$category = htmlspecialchars($data['category'], ENT_QUOTES, 'UTF-8');
$content = htmlspecialchars($data['content'], ENT_QUOTES, 'UTF-8');
$image = isset($data['image']) ? $data['image'] : null;
$date = date('Y-m-d H:i:s');

// تسميات الفئات
$categoryLabels = [
    'education' => 'شخصيات ساهمت في التعليم',
    'religious' => 'الشخصيات الدينية',
    'leadership' => 'الشخصيات القيادية',
    'cultural' => 'الشخصيات الثقافية',
    'sports' => 'الشخصيات الرياضية',
    'medical' => 'الشخصيات الطبية'
];

// قراءة ملف HTML
$htmlFile = __DIR__ . '/index.html';

if (!file_exists($htmlFile)) {
    echo json_encode(['success' => false, 'message' => 'ملف HTML غير موجود']);
    exit;
}

$htmlContent = file_get_contents($htmlFile);

// البحث عن علامات القسم المحدد
$startMarker = "<!-- {$category}_START -->";
$endMarker = "<!-- {$category}_END -->";

// إنشاء HTML للسيرة الذاتية الجديدة
$biographyHtml = "\n        <section style=\"background: white; padding: 2rem; margin-bottom: 2rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-right: 4px solid #d4a373;\">
            <h3 style=\"color: #2c5f7d; margin-top: 0; margin-bottom: 1rem; font-size: 1.5rem;\">{$name}</h3>";

if ($image) {
    $biographyHtml .= "
            <div style=\"margin-bottom: 1.5rem;\">
                <img src=\"{$image}\" alt=\"{$name}\" style=\"max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);\">
            </div>";
}

$biographyHtml .= "
            <pre style=\"white-space: pre-wrap; font-family: 'Cairo', sans-serif; line-height: 1.8; background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin: 0; color: #333; font-size: 1rem;\">{$content}</pre>
            <div style=\"margin-top: 1rem; font-size: 0.85rem; color: #999;\">
                <i class=\"fas fa-calendar\"></i> تم الإضافة: {$date}
            </div>
        </section>";

// البحث عن علامات البداية والنهاية
$startPos = strpos($htmlContent, $startMarker);
$endPos = strpos($htmlContent, $endMarker);

if ($startPos === false || $endPos === false) {
    echo json_encode([
        'success' => false, 
        'message' => "لا يمكن العثور على قسم {$categoryLabels[$category]} في HTML"
    ]);
    exit;
}

// حساب موقع الإدراج (بعد العلامة المبدئية مباشرة)
$insertPos = $startPos + strlen($startMarker);

// إدراج السيرة الذاتية الجديدة
$newHtmlContent = substr($htmlContent, 0, $insertPos) . $biographyHtml . substr($htmlContent, $insertPos);

// حفظ الملف
if (file_put_contents($htmlFile, $newHtmlContent) === false) {
    echo json_encode(['success' => false, 'message' => 'فشل في حفظ الملف']);
    exit;
}

echo json_encode([
    'success' => true, 
    'message' => 'تم حفظ السيرة الذاتية بنجاح',
    'biography' => [
        'name' => $name,
        'category' => $category,
        'categoryLabel' => $categoryLabels[$category],
        'content' => $content,
        'hasImage' => !empty($image),
        'date' => $date
    ]
]);
?>
