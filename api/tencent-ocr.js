// api/tencent-ocr.js - 超简测试版
export default function handler(req, res) {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 返回成功响应
    return res.status(200).json({
        success: true,
        items: [
            { name: '测试商品1', total: 10.00 },
            { name: '测试商品2', total: 20.00 },
            { name: '测试商品3', total: 30.00 }
        ]
    });
}
