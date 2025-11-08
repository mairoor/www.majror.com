// Netlify Function لتحديث عداد تحميل التطبيق على GitHub
// يتطلب: GITHUB_TOKEN في متغيرات البيئة

const https = require('https');

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
    // السماح بجميع الطرق (GET للقراءة، POST للزيادة)
    const method = event.httpMethod;
    
    try {
        const filePath = '/contents/app-download-count.json';
        let currentCount = 0;
        let fileSha = null;
        
        // محاولة قراءة الملف الموجود
        try {
            const fileResponse = await githubRequest('GET', filePath);
            const fileContent = JSON.parse(Buffer.from(fileResponse.content, 'base64').toString('utf-8'));
            currentCount = fileContent.count || 0;
            fileSha = fileResponse.sha;
            console.log(`📊 عدد التحميلات الحالي: ${currentCount}`);
        } catch (error) {
            // الملف غير موجود، سننشئه
            console.log('📝 الملف غير موجود، سيتم إنشاؤه');
            currentCount = 0;
        }
        
        if (method === 'POST') {
            // زيادة العدد
            currentCount += 1;
            console.log(`➕ تم زيادة عدد التحميلات إلى: ${currentCount}`);
            
            const countData = {
                count: currentCount,
                lastUpdated: new Date().toISOString()
            };
            
            const updateData = {
                message: `تحديث عداد تحميل التطبيق: ${currentCount}`,
                content: Buffer.from(JSON.stringify(countData, null, 2)).toString('base64'),
                sha: fileSha
            };
            
            await githubRequest('PUT', filePath, updateData);
            console.log('✅ تم تحديث عداد التحميلات على GitHub');
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: true,
                count: currentCount,
                message: method === 'POST' ? 'تم تحديث العدد' : 'تم قراءة العدد'
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
                error: error.message,
                count: 0
            })
        };
    }
};

