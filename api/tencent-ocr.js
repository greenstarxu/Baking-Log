// api/tencent-ocr.js - 极简测试版本
export default function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // 只接受POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: '只支持POST请求' });
    }

    // 直接返回测试数据
    return res.status(200).json({ 
        success: true, 
        items: [
            { name: '🥛 牛奶', total: 5.99 },
            { name: '🍞 面包', total: 3.50 },
            { name: '🥚 鸡蛋', total: 4.99 },
            { name: '🧈 黄油', total: 2.99 }
        ],
        message: 'API连接成功！'
    });
}
