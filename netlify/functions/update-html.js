// Netlify Function لتحديث ملف index.html على GitHub
// يتطلب: GITHUB_TOKEN في متغيرات البيئة

const https = require('https');

// تسميات الفئات
const CATEGORY_LABELS = {
    education: 'شخصيات ساهمت في التعليم',
    religious: 'الشخصيات الدينية',
    leadership: 'الشخصيات القيادية',
    cultural: 'الشخصيات الثقافية',
    sports: 'الشخصيات الرياضية',
    medical: 'الشخصيات الطبية'
};

// دالة لإنشاء HTML للسيرة الذاتية
function generateBiographyHTML(bio) {
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

// دالة لاستدعاء GitHub API
function githubRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const token = process.env.GITHUB_TOKEN;
        const owner = process.env.GITHUB_OWNER || 'mairoor';
        const repo = process.env.GITHUB_REPO || 'www.majror.com';
        
        if (!token) {
            reject(new Error('GITHUB_TOKEN غير موجود في متغيرات البيئة'));
            return;
        }
        
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}${path}`,
            method: method,
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'Netlify-Function',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`GitHub API Error: ${res.statusCode} - ${parsed.message || body}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse Error: ${e.message}`));
                }
            });
        });
        
        req.on('error', (e) => {
            reject(new Error(`Request Error: ${e.message}`));
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

exports.handler = async (event, context) => {
    // التحقق من أن الطلب POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        // قراءة السير الذاتية من body
        const { biographies } = JSON.parse(event.body);
        
        if (!biographies || !Array.isArray(biographies)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'السير الذاتية غير صحيحة' })
            };
        }
        
        console.log(`📚 معالجة ${biographies.length} سيرة ذاتية...`);
        
        // قراءة ملف index.html من GitHub
        const fileResponse = await githubRequest('GET', '/contents/index.html');
        const currentContent = Buffer.from(fileResponse.content, 'base64').toString('utf-8');
        
        console.log('✅ تم قراءة index.html من GitHub');
        
        // تجميع السير الذاتية حسب التصنيف
        const categories = {
            education: biographies.filter(bio => bio.category === 'education'),
            religious: biographies.filter(bio => bio.category === 'religious'),
            leadership: biographies.filter(bio => bio.category === 'leadership'),
            cultural: biographies.filter(bio => bio.category === 'cultural'),
            sports: biographies.filter(bio => bio.category === 'sports'),
            medical: biographies.filter(bio => bio.category === 'medical')
        };
        
        let updatedContent = currentContent;
        
        // إدراج السير الذاتية في الأماكن الصحيحة
        Object.keys(categories).forEach(category => {
            const bios = categories[category];
            if (bios.length > 0) {
                const bioHTML = bios.map(generateBiographyHTML).join('\n');
                const placeholder = `<!-- السير الذاتية المضافة من admin ستظهر هنا -->\n        <div id="${category}Content" class="section-content"></div>`;
                const replacement = `<!-- السير الذاتية المضافة من admin -->\n        <div id="${category}Content" class="section-content">${bioHTML}\n        </div>`;
                
                if (updatedContent.includes(placeholder)) {
                    updatedContent = updatedContent.replace(placeholder, replacement);
                    console.log(`✅ تم إدراج ${bios.length} سيرة ذاتية في قسم ${CATEGORY_LABELS[category]}`);
                } else {
                    // محاولة البحث عن pattern آخر
                    const altPlaceholder = `<div id="${category}Content" class="section-content"></div>`;
                    if (updatedContent.includes(altPlaceholder)) {
                        updatedContent = updatedContent.replace(
                            altPlaceholder,
                            `<div id="${category}Content" class="section-content">${bioHTML}\n        </div>`
                        );
                        console.log(`✅ تم إدراج ${bios.length} سيرة ذاتية في قسم ${CATEGORY_LABELS[category]} (pattern بديل)`);
                    }
                }
            }
        });
        
        // إضافة تعليق تحديث
        const updateComment = `<!-- 
    تم تحديث هذا الملف تلقائياً من لوحة التحكم
    تاريخ التحديث: ${new Date().toLocaleString('ar-EG')}
    عدد السير الذاتية المدمجة: ${biographies.length}
-->`;
        
        if (!updatedContent.includes('تم تحديث هذا الملف تلقائياً')) {
            updatedContent = updatedContent.replace('<body>', `<body>\n    ${updateComment}`);
        }
        
        // تحديث الملف على GitHub
        const updateData = {
            message: `تحديث تلقائي: إضافة ${biographies.length} سيرة ذاتية`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: fileResponse.sha
        };
        
        await githubRequest('PUT', '/contents/index.html', updateData);
        
        console.log('✅ تم تحديث index.html على GitHub بنجاح');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: true,
                message: `تم تحديث index.html بنجاح مع ${biographies.length} سيرة ذاتية`,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

