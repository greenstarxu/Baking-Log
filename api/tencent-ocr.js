// api/tencent-ocr.js - 使用ES Module语法
export default async function handler(req, res) {
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

    try {
        const { imageBase64 } = req.body;
        
        console.log('收到图片请求，图片长度:', imageBase64?.length || 0);

        // 返回测试数据（先测试API是否通）
        const testItems = [
            { name: '🥛 Milk', total: 5.99 },
            { name: '🍞 Bread', total: 3.50 },
            { name: '🥚 Eggs', total: 4.99 },
            { name: '🧈 Butter', total: 2.99 }
        ];

        return res.status(200).json({ 
            success: true, 
            items: testItems,
            message: 'API连接成功！'
        });

    } catch (error) {
        console.error('API错误:', error);
        return res.status(500).json({ 
            success: false, 
            error: '服务器内部错误',
            detail: error.message 
        });
    }
}
