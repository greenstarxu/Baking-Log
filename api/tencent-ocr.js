import { OcrClient } from 'tencentcloud-sdk-nodejs-ocr/tencentcloud/services/ocr/v20181119/ocr_client';

export default async function handler(req, res) {
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

    try {
        const { imageBase64 } = req.body;
        
        // 检查环境变量
        if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: '腾讯云密钥未配置' 
            });
        }

        // 创建客户端
        const client = new OcrClient({
            credential: {
                secretId: process.env.TENCENT_SECRET_ID,
                secretKey: process.env.TENCENT_SECRET_KEY,
            },
            region: "ap-singapore",
            profile: {
                httpProfile: {
                    endpoint: "ocr.ap-singapore.tencentcloudapi.com"
                }
            }
        });

        // 调用OCR接口
        const result = await client.SmartStructuralOCR({
            ImageBase64: imageBase64
        });

        // 提取商品项
        const items = extractItems(result);

        res.status(200).json({ 
            success: true, 
            items: items 
        });

    } catch (error) {
        console.error('OCR错误:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

function extractItems(result) {
    const items = [];
    try {
        if (result.StructuralList) {
            for (const field of result.StructuralList) {
                if (field.Name && field.Value) {
                    items.push({
                        name: field.Name,
                        total: parseFloat(field.Value) || 0
                    });
                }
            }
        }
    } catch (e) {
        console.error('解析失败:', e);
    }
    return items;
}
