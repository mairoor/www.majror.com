// ==============================================
// نظام إدارة السير الذاتية - لوحة التحكم
// ==============================================

console.log('📦 تحميل نظام إدارة السير الذاتية...');

// تسميات الفئات
const CATEGORY_LABELS = {
    education: 'شخصيات ساهمت في التعليم',
    religious: 'الشخصيات الدينية',
    leadership: 'الشخصيات القيادية',
    cultural: 'الشخصيات الثقافية',
    sports: 'الشخصيات الرياضية',
    medical: 'الشخصيات الطبية'
};

// ==============================================
// 1. تحميل السير الذاتية عند فتح الصفحة
// ==============================================
function loadBiographies() {
    console.log('📚 تحميل السير الذاتية...');
    
    const biographies = JSON.parse(localStorage.getItem('biographyContent') || '[]');
    console.log(`✅ تم تحميل ${biographies.length} سيرة ذاتية`);
    
    const listContainer = document.getElementById('biographiesList');
    if (!listContainer) return;
    
    if (biographies.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem;">لا توجد سير ذاتية محفوظة بعد</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">ابدأ بإضافة سيرة ذاتية جديدة من النموذج على اليسار</p>
            </div>
        `;
        return;
    }
    
    // ترتيب السير الذاتية حسب تاريخ الإضافة (الأحدث أولاً)
    biographies.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    listContainer.innerHTML = biographies.map((bio, index) => `
        <div class="content-item">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3>${bio.name}</h3>
                    <span class="category-badge">${CATEGORY_LABELS[bio.category] || bio.category}</span>
                </div>
                <button class="delete-btn" onclick="deleteBiography(${bio.id})" title="حذف السيرة الذاتية">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
            ${bio.image ? `
                <div style="margin: 1rem 0;">
                    <img src="${bio.image}" alt="${bio.name}" onerror="this.style.display='none'">
                </div>
            ` : ''}
            <pre style="white-space: pre-wrap; font-family: 'Cairo', sans-serif; line-height: 1.8; background: #f9f9f9; padding: 1rem; border-radius: 8px; margin: 0; color: #333; font-size: 0.95rem; max-height: 300px; overflow-y: auto;">${bio.content}</pre>
            <div style="margin-top: 0.8rem; font-size: 0.85rem; color: #999;">
                <i class="fas fa-calendar"></i> تم الإضافة: ${bio.date || 'غير محدد'}
            </div>
        </div>
    `).join('');
}

// متغير لتخزين الصورة المرفوعة
let uploadedImage = null;

// ==============================================
// 2. معالجة رفع الصورة
// ==============================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
        alert('⚠️ الرجاء اختيار ملف صورة صالح (JPG, PNG, GIF)');
        event.target.value = '';
        return;
    }
    
    // التحقق من حجم الملف (حد أقصى 5 ميجابايت)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('⚠️ حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 5 ميجابايت');
        event.target.value = '';
        return;
    }
    
    // قراءة الصورة وتحويلها إلى base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result; // base64 string
        showImagePreview(uploadedImage);
        console.log('✅ تم تحميل الصورة بنجاح');
    };
    reader.onerror = function() {
        alert('❌ حدث خطأ أثناء قراءة الصورة');
        event.target.value = '';
    };
    reader.readAsDataURL(file);
}

// ==============================================
// 3. عرض معاينة الصورة
// ==============================================
function showImagePreview(imageSrc) {
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (previewDiv && previewImg) {
        previewImg.src = imageSrc;
        previewDiv.style.display = 'block';
    }
}

// ==============================================
// 4. إزالة الصورة
// ==============================================
function removeImage() {
    uploadedImage = null;
    const imageFileInput = document.getElementById('imageFile');
    const previewDiv = document.getElementById('imagePreview');
    
    if (imageFileInput) {
        imageFileInput.value = '';
    }
    if (previewDiv) {
        previewDiv.style.display = 'none';
    }
    console.log('🗑️ تم إزالة الصورة');
}

// ==============================================
// 5. حفظ سيرة ذاتية جديدة (مع حقن في HTML)
// ==============================================
async function saveBiography(event) {
    event.preventDefault();
    console.log('💾 محاولة حفظ سيرة ذاتية جديدة...');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const name = formData.get('name').trim();
    const category = formData.get('category');
    const content = formData.get('content').trim();
    
    // التحقق من البيانات
    if (!name || !category || !content) {
        alert('⚠️ الرجاء ملء جميع الحقول المطلوبة (الاسم، التصنيف، السيرة الذاتية)');
        return;
    }
    
    // تعطيل زر الحفظ مؤقتاً
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    }
    
    try {
        // إرسال البيانات إلى PHP لحقنها في HTML
        const response = await fetch('save-biography.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                category: category,
                content: content,
                image: uploadedImage || null
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ تم حفظ السيرة الذاتية بنجاح:', result.biography.name);
            console.log('📂 الفئة:', result.biography.categoryLabel);
            
            // حفظ نسخة في localStorage أيضاً للعرض في لوحة التحكم
            const biographies = JSON.parse(localStorage.getItem('biographyContent') || '[]');
            biographies.push({
                id: Date.now(),
                name: name,
                category: category,
                image: uploadedImage || null,
                content: content,
                date: result.biography.date
            });
            localStorage.setItem('biographyContent', JSON.stringify(biographies));
            
            // إظهار رسالة النجاح
            showSuccessMessage('تم الحفظ والحقن في HTML بنجاح!');
            
            // إعادة تحميل القائمة
            loadBiographies();
            
            // مسح النموذج
            form.reset();
            removeImage();
            
        } else {
            throw new Error(result.message || 'حدث خطأ غير معروف');
        }
        
    } catch (error) {
        console.error('❌ خطأ في حفظ السيرة الذاتية:', error);
        alert('❌ حدث خطأ: ' + error.message + '\n\nتأكد من تشغيل خادم PHP.');
    } finally {
        // إعادة تفعيل الزر
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ السيرة الذاتية';
        }
    }
}

// ==============================================
// 6. حذف سيرة ذاتية
// ==============================================
function deleteBiography(id) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه السيرة الذاتية؟\n\nلا يمكن التراجع عن هذه العملية.')) {
        return;
    }
    
    console.log('🗑️ محاولة حذف سيرة ذاتية برقم:', id);
    
    const biographies = JSON.parse(localStorage.getItem('biographyContent') || '[]');
    const filteredBiographies = biographies.filter(bio => bio.id !== id);
    
    if (filteredBiographies.length === biographies.length) {
        console.error('❌ لم يتم العثور على السيرة الذاتية');
        alert('❌ حدث خطأ: لم يتم العثور على السيرة الذاتية');
        return;
    }
    
    localStorage.setItem('biographyContent', JSON.stringify(filteredBiographies));
    
    console.log('✅ تم حذف السيرة الذاتية بنجاح');
    console.log('📊 إجمالي السير الذاتية المتبقية:', filteredBiographies.length);
    
    // إعادة تحميل القائمة
    loadBiographies();
    
    // إظهار رسالة النجاح
    showSuccessMessage('تم الحذف بنجاح!');
}

// ==============================================
// 7. إظهار رسالة النجاح
// ==============================================
function showSuccessMessage(message = 'تم الحفظ بنجاح!') {
    const successMsg = document.getElementById('successMessage');
    if (!successMsg) return;
    
    successMsg.textContent = `✓ ${message}`;
    successMsg.classList.add('show');
    
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// ==============================================
// 8. التهيئة عند تحميل الصفحة
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🎛️ لوحة التحكم - إدارة السير الذاتية   ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
    
    // ربط النموذج بحدث الحفظ
    const form = document.getElementById('biographyForm');
    if (form) {
        form.addEventListener('submit', saveBiography);
        console.log('✅ تم ربط نموذج الإضافة');
    } else {
        console.error('❌ لم يتم العثور على النموذج');
    }
    
    // ربط حقل رفع الصورة
    const imageFileInput = document.getElementById('imageFile');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', handleImageUpload);
        console.log('✅ تم ربط حقل رفع الصورة');
    }
    
    // تحميل السير الذاتية الموجودة
    loadBiographies();
    
    console.log('');
    console.log('✅ تم تحميل لوحة التحكم بنجاح');
    console.log('');
});

// ==============================================
// 9. تحديث ملف HTML تلقائياً على GitHub (الطريقة الجديدة)
// ==============================================
async function updateHTMLOnGitHub() {
    console.log('🚀 بدء تحديث index.html على GitHub...');
    
    try {
        // قراءة السير الذاتية من localStorage
        const biographies = JSON.parse(localStorage.getItem('biographyContent') || '[]');
        
        if (biographies.length === 0) {
            alert('⚠️ لا توجد سير ذاتية محفوظة للتحديث');
            return;
        }
        
        console.log(`📚 إرسال ${biographies.length} سيرة ذاتية للتحديث...`);
        
        // استدعاء Netlify Function
        const response = await fetch('/.netlify/functions/update-html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ biographies })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ تم تحديث index.html بنجاح على GitHub');
            showSuccessMessage('✅ تم تحديث index.html تلقائياً على GitHub!');
            
            // إظهار رسالة إضافية
            setTimeout(() => {
                alert(`✅ تم التحديث بنجاح!\n\n${result.message}\n\nسيتم تحديث الموقع خلال دقائق قليلة.`);
            }, 500);
        } else {
            throw new Error(result.error || 'حدث خطأ غير معروف');
        }
        
    } catch (error) {
        console.error('❌ خطأ في تحديث الملف:', error);
        alert('❌ حدث خطأ أثناء تحديث الملف:\n\n' + error.message + '\n\nتأكد من إعداد متغيرات البيئة في Netlify.');
    }
}

// ==============================================
// 10. تصدير ملف HTML محدث مع السير الذاتية (الطريقة اليدوية - احتياطية)
// ==============================================
async function exportUpdatedHTML() {
    console.log('📥 بدء تصدير ملف HTML محدث...');
    
    try {
        // قراءة ملف index.html الأصلي
        const response = await fetch('index.html');
        if (!response.ok) {
            throw new Error('فشل في قراءة ملف index.html');
        }
        let htmlContent = await response.text();
        
        // قراءة السير الذاتية من localStorage
        const biographies = JSON.parse(localStorage.getItem('biographyContent') || '[]');
        
        if (biographies.length === 0) {
            alert('⚠️ لا توجد سير ذاتية محفوظة للتصدير');
            return;
        }
        
        console.log(`📚 تم العثور على ${biographies.length} سيرة ذاتية`);
        
        // تجميع السير الذاتية حسب التصنيف
        const categories = {
            education: biographies.filter(bio => bio.category === 'education'),
            religious: biographies.filter(bio => bio.category === 'religious'),
            leadership: biographies.filter(bio => bio.category === 'leadership'),
            cultural: biographies.filter(bio => bio.category === 'cultural'),
            sports: biographies.filter(bio => bio.category === 'sports'),
            medical: biographies.filter(bio => bio.category === 'medical')
        };
        
        // إنشاء HTML للسير الذاتية لكل فئة (بنفس تنسيق السير الذاتية الموجودة)
        function generateBiographyHTML(bio) {
            // تنظيف الاسم من أي HTML tags خطيرة
            const cleanName = bio.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            return `
        <section>
            <span>
                ${cleanName}
            </span>
            ${bio.image ? `
            <div> <img src="${bio.image}" alt="${cleanName}"></div>
            ` : ''}
            <pre>
${bio.content}
    </pre>
        </section>
`;
        }
        
        // إدراج السير الذاتية في الأماكن الصحيحة
        Object.keys(categories).forEach(category => {
            const bios = categories[category];
            if (bios.length > 0) {
                const bioHTML = bios.map(generateBiographyHTML).join('\n');
                const placeholder = `<!-- السير الذاتية المضافة من admin ستظهر هنا -->\n        <div id="${category}Content" class="section-content"></div>`;
                const replacement = `<!-- السير الذاتية المضافة من admin -->\n        <div id="${category}Content" class="section-content">${bioHTML}\n        </div>`;
                
                if (htmlContent.includes(placeholder)) {
                    htmlContent = htmlContent.replace(placeholder, replacement);
                    console.log(`✅ تم إدراج ${bios.length} سيرة ذاتية في قسم ${CATEGORY_LABELS[category]}`);
                }
            }
        });
        
        // إضافة تعليق في بداية الملف يشير إلى أن الملف تم تحديثه
        const updateComment = `<!-- 
    تم تحديث هذا الملف تلقائياً من لوحة التحكم
    تاريخ التحديث: ${new Date().toLocaleString('ar-EG')}
    عدد السير الذاتية المدمجة: ${biographies.length}
-->`;
        
        // إدراج التعليق بعد <body>
        htmlContent = htmlContent.replace('<body>', `<body>\n    ${updateComment}`);
        
        // إنشاء ملف قابل للتحميل
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'index.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ تم تصدير ملف HTML بنجاح');
        showSuccessMessage('تم تصدير ملف index.html بنجاح!');
        
    } catch (error) {
        console.error('❌ خطأ في تصدير الملف:', error);
        alert('❌ حدث خطأ أثناء تصدير الملف: ' + error.message);
    }
}

// جعل الدوال متاحة عالمياً للاستخدام في HTML
window.deleteBiography = deleteBiography;
window.removeImage = removeImage;
window.exportUpdatedHTML = exportUpdatedHTML;
window.updateHTMLOnGitHub = updateHTMLOnGitHub;

console.log('✅ تم تحميل ملف admin.js بنجاح');

