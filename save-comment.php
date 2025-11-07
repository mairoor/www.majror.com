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

if (!$data || !isset($data['name']) || !isset($data['text'])) {
    echo json_encode(['success' => false, 'message' => 'بيانات غير مكتملة']);
    exit;
}

$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$text = htmlspecialchars($data['text'], ENT_QUOTES, 'UTF-8');
$date = date('Y-m-d H:i:s');

// قراءة ملف HTML
$htmlFile = __DIR__ . '/index.html';

if (!file_exists($htmlFile)) {
    echo json_encode(['success' => false, 'message' => 'ملف HTML غير موجود']);
    exit;
}

$htmlContent = file_get_contents($htmlFile);

// البحث عن قسم التعليقات
$commentsMarker = '<!-- COMMENTS_START -->';
$commentsEndMarker = '<!-- COMMENTS_END -->';

// إنشاء HTML للتعليق الجديد
$commentHtml = "
                    <div class=\"comment-item\" style=\"background: white; padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);\">
                        <div class=\"comment-header\" style=\"display: flex; justify-content: space-between; margin-bottom: 0.8rem;\">
                            <span class=\"comment-author\" style=\"font-weight: 600; color: #2c5f7d;\">{$name}</span>
                            <span class=\"comment-date\" style=\"font-size: 0.9rem; color: #999;\">{$date}</span>
                        </div>
                        <div class=\"comment-text\" style=\"line-height: 1.8; color: #333;\">{$text}</div>
                    </div>";

// البحث عن علامة بداية التعليقات
$startPos = strpos($htmlContent, $commentsMarker);
$endPos = strpos($htmlContent, $commentsEndMarker);

if ($startPos === false || $endPos === false) {
    echo json_encode(['success' => false, 'message' => 'لا يمكن العثور على قسم التعليقات في HTML']);
    exit;
}

// حساب موقع الإدراج (بعد العلامة المبدئية مباشرة)
$insertPos = $startPos + strlen($commentsMarker);

// إدراج التعليق الجديد
$newHtmlContent = substr($htmlContent, 0, $insertPos) . $commentHtml . substr($htmlContent, $insertPos);

// حفظ الملف
if (file_put_contents($htmlFile, $newHtmlContent) === false) {
    echo json_encode(['success' => false, 'message' => 'فشل في حفظ الملف']);
    exit;
}

echo json_encode([
    'success' => true, 
    'message' => 'تم حفظ التعليق بنجاح',
    'comment' => [
        'name' => $name,
        'text' => $text,
        'date' => $date
    ]
]);
?>
