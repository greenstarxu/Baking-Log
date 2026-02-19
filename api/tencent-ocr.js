// api/tencent-ocr.js
export default function handler(req, res) {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持POST请求' });
    }

    // 成功响应
    return res.status(200).json({
        success: true,
        items: [
            { name: '牛奶', total: 5.99 },
            { name: '面包', total: 3.50 },
            { name: '鸡蛋', total: 4.99 }
        ]
    });
}
