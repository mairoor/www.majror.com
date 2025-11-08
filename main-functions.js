// ==============================================
// نظام عرض السير الذاتية والمحتوى - موقع المجرور
// ==============================================

console.log('📦 تحميل ملف main-functions.js...');

// تسميات الفئات
const CATEGORY_LABELS = {
    education: 'شخصيات التعليم',
    religious: 'الشخصيات الدينية',
    leadership: 'الشخصيات القيادية',
    cultural: 'الشخصيات الثقافية',
    sports: 'الشخصيات الرياضية',
    medical: 'الشخصيات الطبية'
};

// ==============================================
// 1. عداد الزوار (يتم حفظه على GitHub)
// ==============================================
async function initVisitorCounter() {
    console.log('👥 تهيئة عداد الزوار...');
    
    const counterElement = document.getElementById('visitorCount');
    if (!counterElement) {
        console.warn('⚠️ عنصر عداد الزوار غير موجود');
        return;
    }
    
    try {
        // التحقق من أن الزائر لم يزور الموقع في هذه الجلسة
        const sessionKey = 'visitorCounted_' + new Date().toDateString();
        const hasCounted = sessionStorage.getItem(sessionKey);
        
        // قراءة العدد الحالي من GitHub
        const response = await fetch('/.netlify/functions/visitor-counter', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            let currentCount = result.count || 0;
            
            // إذا لم يتم العد في هذه الجلسة، قم بزيادة العدد
            if (!hasCounted) {
                console.log('➕ زيادة عدد الزوار...');
                
                const incrementResponse = await fetch('/.netlify/functions/visitor-counter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const incrementResult = await incrementResponse.json();
                
                if (incrementResult.success) {
                    currentCount = incrementResult.count;
                    sessionStorage.setItem(sessionKey, 'true');
                    console.log(`✅ تم تحديث عدد الزوار إلى: ${currentCount}`);
                } else {
                    console.warn('⚠️ لم يتم تحديث العدد، استخدام العدد الحالي');
                }
            }
            
            // عرض العدد في الموقع
            counterElement.textContent = currentCount.toLocaleString('ar-EG');
            console.log(`📊 عدد الزوار الحالي: ${currentCount}`);
        } else {
            throw new Error(result.error || 'حدث خطأ في قراءة العدد');
        }
        
    } catch (error) {
        console.error('❌ خطأ في عداد الزوار:', error);
        // في حالة الخطأ، استخدم localStorage كبديل
        let visitorCount = parseInt(localStorage.getItem('visitorCount') || '0') + 1;
        localStorage.setItem('visitorCount', visitorCount);
        counterElement.textContent = visitorCount.toLocaleString('ar-EG');
        console.log(`⚠️ استخدام العدد المحلي: ${visitorCount}`);
    }
}

// ==============================================
// 2. تحميل المحتوى الديناميكي
// ==============================================
function loadDynamicContent() {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('📦 بدء تحميل المحتوى الديناميكي...');
    console.log('═══════════════════════════════════════════');
    
    // قراءة السير الذاتية من localStorage
    const biographies = JSON.parse(localStorage.getItem('biographyContent') || '[]');
    console.log(`📚 عدد السير الذاتية المحفوظة: ${biographies.length}`);
    
    // عرض تفاصيل السير الذاتية
    if (biographies.length > 0) {
        console.log('');
        console.log('✅ السير الذاتية الموجودة:');
        biographies.forEach((bio, index) => {
            console.log(`   ${index + 1}. ${bio.name} → الفئة: ${CATEGORY_LABELS[bio.category] || bio.category}`);
        });
        console.log('');
    } else {
        console.warn('⚠️ لا توجد سير ذاتية محفوظة في localStorage');
        console.log('💡 لإضافة سيرة: افتح admin/secure-admin.html');
        console.log('');
    }
    
    // تحميل محتوى كل فئة
    const categories = ['education', 'religious', 'leadership', 'cultural', 'sports', 'medical'];
    
    categories.forEach(category => {
        console.log(`───────────────────────────────────────────`);
        console.log(`🔄 معالجة فئة: ${CATEGORY_LABELS[category]}`);
        
        // قراءة المحتوى العادي
        const normalContent = JSON.parse(localStorage.getItem(`${category}Content`) || '[]');
        
        // تصفية السير الذاتية لهذه الفئة
        const categoryBios = biographies.filter(bio => bio.category === category);
        
        console.log(`   📝 محتوى عادي: ${normalContent.length}`);
        console.log(`   📖 سير ذاتية: ${categoryBios.length}`);
        console.log(`   📊 إجمالي: ${normalContent.length + categoryBios.length}`);
        
        // الحصول على الحاوية
        const container = document.getElementById(`${category}Content`);
        
        if (!container) {
            console.error(`   ❌ الحاوية #${category}Content غير موجودة في HTML!`);
            return;
        }
        
        // مسح المحتوى القديم
        container.innerHTML = '';
        
        let htmlContent = '';
        
        // إضافة المحتوى العادي
        if (normalContent.length > 0) {
            console.log(`   ✏️ إضافة المحتوى العادي...`);
            normalContent.forEach(item => {
                htmlContent += `
                    <div class="person-card" style="background: white; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h4 style="color: #2c5f7d; margin-top: 0; margin-bottom: 0.8rem;">${item.name}</h4>
                        <p style="line-height: 1.8; color: #333;">${item.description}</p>
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem;">` : ''}
                    </div>
                `;
            });
        }
        
        // إضافة السير الذاتية
        if (categoryBios.length > 0) {
            console.log(`   📖 إضافة السير الذاتية...`);
            categoryBios.forEach(bio => {
                console.log(`      → ${bio.name}`);
                htmlContent += `
                    <section style="background: white; padding: 2rem; margin-bottom: 2rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-right: 4px solid #d4a373;">
                        <h3 style="color: #2c5f7d; margin-top: 0; margin-bottom: 1rem; font-size: 1.5rem;">${bio.name}</h3>
                        ${bio.image ? `
                            <div style="margin-bottom: 1.5rem;">
                                <img src="${bio.image}" alt="${bio.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            </div>
                        ` : ''}
                        <pre style="white-space: pre-wrap; font-family: 'Cairo', sans-serif; line-height: 1.8; background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin: 0; color: #333; font-size: 1rem;">${bio.content}</pre>
                    </section>
                `;
            });
        }
        
        // إضافة المحتوى إلى الحاوية
        if (htmlContent.length > 0) {
            container.innerHTML = htmlContent;
            console.log(`   ✅ تم إضافة ${container.children.length} عنصر إلى الحاوية`);
            console.log(`   📏 حجم HTML: ${htmlContent.length} حرف`);
        } else {
            console.log(`   ⚪ لا يوجد محتوى لهذه الفئة`);
        }
    });
    
    console.log('───────────────────────────────────────────');
    console.log('✅ انتهى تحميل المحتوى الديناميكي');
    console.log('═══════════════════════════════════════════');
    console.log('');
    
    // إخفاء الأقسام الفارغة بعد فترة قصيرة
    setTimeout(hideEmptySections, 300);
}

// ==============================================
// 3. إخفاء الأقسام الفارغة
// ==============================================
function hideEmptySections() {
    console.log('🔍 فحص الأقسام الفارغة...');
    console.log('');
    
    const sections = document.querySelectorAll('.content-section');
    let hiddenCount = 0;
    let visibleCount = 0;
    
    sections.forEach(section => {
        const container = section.querySelector('.section-content');
        if (!container) return;
        
        const childCount = container.children.length;
        const htmlLength = container.innerHTML.trim().length;
        const htmlWithoutComments = container.innerHTML.replace(/<!--[\s\S]*?-->/g, '').trim();
        const hasContent = childCount > 0 || htmlWithoutComments.length > 10;
        
        console.log(`   🔍 فحص #${container.id}:`);
        console.log(`      - عدد العناصر: ${childCount}`);
        console.log(`      - طول HTML: ${htmlLength} حرف`);
        console.log(`      - بعد إزالة التعليقات: ${htmlWithoutComments.length} حرف`);
        
        if (hasContent) {
            section.style.display = 'block';
            visibleCount++;
            console.log(`      ✅ النتيجة: معروض`);
        } else {
            section.style.display = 'none';
            hiddenCount++;
            console.log(`      ⚪ النتيجة: مخفي`);
        }
    });
    
    console.log('');
    console.log(`📊 الإحصائيات: ${visibleCount} معروض، ${hiddenCount} مخفي`);
    console.log('');
}

// ==============================================
// 4. نظام الإعجابات
// ==============================================
function initLikesSystem() {
    console.log('👍 تهيئة نظام الإعجابات...');
    
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    
    if (!likeBtn || !likeCount) {
        console.warn('⚠️ عناصر نظام الإعجابات غير موجودة');
        return;
    }
    
    // تحميل عدد الإعجابات
    let likes = parseInt(localStorage.getItem('siteLikes') || '0');
    likeCount.textContent = likes;
    
    // التحقق إذا كان المستخدم قد أعجب مسبقاً
    const hasLiked = localStorage.getItem('userHasLiked') === 'true';
    if (hasLiked) {
        likeBtn.classList.add('liked');
        likeBtn.disabled = true;
    }
    
    // حدث النقر
    likeBtn.addEventListener('click', function() {
        if (!hasLiked) {
            likes++;
            localStorage.setItem('siteLikes', likes);
            localStorage.setItem('userHasLiked', 'true');
            likeCount.textContent = likes;
            likeBtn.classList.add('liked');
            likeBtn.disabled = true;
            
            // تأثير بصري
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 300);
            
            console.log('👍 تم الإعجاب! العدد الجديد:', likes);
        }
    });
    
    console.log('✅ نظام الإعجابات جاهز');
}

// ==============================================
// 5. نظام التعليقات
// ==============================================
function initCommentsSystem() {
    console.log('💬 تهيئة نظام التعليقات...');
    
    const submitBtn = document.getElementById('submitComment');
    const commentsList = document.getElementById('commentsList');
    
    if (!submitBtn || !commentsList) {
        console.warn('⚠️ عناصر نظام التعليقات غير موجودة');
        return;
    }
    
    // تحميل التعليقات الموجودة
    loadComments();
    
    // حدث إضافة تعليق
    submitBtn.addEventListener('click', function() {
        const nameInput = document.getElementById('commentName');
        const textInput = document.getElementById('commentText');
        
        if (!nameInput || !textInput) return;
        
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        
        if (!name || !text) {
            alert('⚠️ الرجاء إدخال الاسم والتعليق');
            return;
        }
        
        const comment = {
            id: Date.now(),
            name: name,
            text: text,
            date: new Date().toLocaleString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // حفظ التعليق في localStorage
        let comments = JSON.parse(localStorage.getItem('siteComments') || '[]');
        comments.unshift(comment);
        localStorage.setItem('siteComments', JSON.stringify(comments));
        
        // مسح النموذج
        nameInput.value = '';
        textInput.value = '';
        
        // إعادة تحميل التعليقات
        loadComments();
        
        console.log('💬 تم إضافة تعليق جديد من:', name);
        alert('✅ تم إضافة تعليقك بنجاح!');
    });
    
    console.log('✅ نظام التعليقات جاهز');
}

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    const comments = JSON.parse(localStorage.getItem('siteComments') || '[]');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments" style="text-align: center; color: #999; padding: 2rem;">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item" style="background: white; padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <div class="comment-header" style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                <span class="comment-author" style="font-weight: 600; color: #2c5f7d;">${comment.name}</span>
                <span class="comment-date" style="font-size: 0.9rem; color: #999;">${comment.date}</span>
            </div>
            <div class="comment-text" style="line-height: 1.8; color: #333;">${comment.text}</div>
        </div>
    `).join('');
    
    console.log(`💬 تم تحميل ${comments.length} تعليق`);
}

// ==============================================
// 6. التمرير السلس
// ==============================================
function initSmoothScroll() {
    console.log('🎯 تهيئة التمرير السلس...');
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                console.log('🎯 انتقال إلى:', targetId);
            }
        });
    });
    
    console.log('✅ التمرير السلس جاهز');
}

// ==============================================
// 7. التهيئة الرئيسية
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    console.clear();
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     🌟 موقع المجرور - النظام الجديد      ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
    console.log('🚀 بدء تحميل الصفحة...');
    console.log('⏰ الوقت:', new Date().toLocaleString('ar-EG'));
    console.log('');
    
    try {
        // تهيئة جميع الأنظمة
        initVisitorCounter();
        loadDynamicContent();
        initLikesSystem();
        initCommentsSystem();
        initSmoothScroll();
        
        console.log('');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║      ✅ تم تحميل الصفحة بنجاح! 🎉       ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الصفحة:', error);
        console.error('📍 التفاصيل:', error.message);
    }
});

console.log('✅ تم تحميل ملف main-functions.js بنجاح');
