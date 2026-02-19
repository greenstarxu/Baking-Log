// 腾讯云OCR API代理 - 使用官方SDK
import { OcrClient } from 'tencentcloud-sdk-nodejs-ocr/tencentcloud/services/ocr/v20181119/ocr_client';
import { SmartStructuralOCRRequest } from 'tencentcloud-sdk-nodejs-ocr/tencentcloud/services/ocr/v20181119/ocr_models';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';

export default async function handler(req, res) {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持POST请求' });
    }

    try {
        const { imageBase64 } = req.body;
        
        // 实例化OCR客户端
        // 根据您的海外位置选择最近的节点: ap-singapore (新加坡), na-siliconvalley (硅谷), eu-frankfurt (法兰克福)
        const client = new OcrClient({
            credential: {
                secretId: process.env.1405204338,
                secretKey: process.env.AKIDIxfEbmkW7XmqjQwOkxMcgZGl6FE3sV0J,
            },
            region: "ap-singapore", // 海外用户推荐使用新加坡节点，也可以根据实际位置调整
            profile: {
                signMethod: "TC3-HMAC-SHA256", // V3签名，支持大文件
                httpProfile: {
                    reqMethod: "POST",
                    reqTimeout: 30,
                    endpoint: "ocr.ap-singapore.tencentcloudapi.com" // 对应region的endpoint
                }
            }
        });

        // 创建请求对象 - 使用智能结构化识别，专门针对小票
        const params = {
            ImageBase64: imageBase64,
            // 可选：指定要识别的页面，对于多页PDF可以指定
            // 可以添加Config配置来优化识别效果
        };
        
        const request = new SmartStructuralOCRRequest(params);
        
        // 调用API
        const result = await client.SmartStructuralOCR(request);
        
        // 处理返回结果，提取行项目
        const lineItems = extractLineItems(result);
        
        res.status(200).json({ 
            success: true, 
            items: lineItems,
            rawResult: result // 保留原始结果以便调试
        });
        
    } catch (error) {
        console.error('腾讯云OCR识别失败:', error);
        
        // 根据错误类型返回友好提示
        let errorMessage = '识别失败，请重试';
        if (error.code === 'AuthFailure.SignatureFailure') {
            errorMessage = '签名验证失败，请检查API密钥';
        } else if (error.code === 'ResourceNotFound') {
            errorMessage = 'OCR服务未开通，请先在腾讯云控制台开通';
        } else if (error.code === 'FailedOperation.DownLoadError') {
            errorMessage = '图片下载失败，请检查图片格式';
        } else if (error.message && error.message.includes('exceeding request size limit')) {
            errorMessage = '图片过大，请压缩后重试';
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage,
            detail: error.message 
        });
    }
}

/**
 * 从OCR结果中提取行项目（商品名和价格）
 * 智能结构化返回的数据结构较复杂，需要解析
 */
function extractLineItems(result) {
    const items = [];
    
    try {
        // 智能结构化返回的字段在StructuralList中
        if (result.StructuralList && result.StructuralList.length > 0) {
            // 遍历所有识别出的字段
            for (const field of result.StructuralList) {
                // 查找可能是商品名称和价格的字段
                const name = findFieldValue(field, ['商品名称', '名称', '品名', '商品', 'description', 'item', 'product']);
                const price = findFieldValue(field, ['金额', '价格', '单价', '总价', '小计', 'amount', 'price', 'total', 'sum']);
                
                if (name && price) {
                    items.push({
                        name: name,
                        total: parseFloat(price) || 0
                    });
                } else if (name && !price) {
                    // 只有名称没有价格，可能是描述性文本
                    console.log('跳过只有名称的项:', name);
                }
            }
        }
        
        // 如果智能结构化没有提取到行项目，降级使用通用识别结果
        if (items.length === 0 && result.TextDetections) {
            // 简单启发式方法：查找数字可能是价格的行
            const lines = result.TextDetections.map(t => t.DetectedText);
            
            // 尝试解析：寻找"xxx $12.34"或"xxx 12.34"模式的文本
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // 匹配价格模式：数字带小数点
                const priceMatch = line.match(/\$?(\d+\.\d{2})/);
                if (priceMatch) {
                    const price = priceMatch[1];
                    // 假设当前行是商品名（简化处理）
                    items.push({
                        name: line.replace(priceMatch[0], '').trim() || '商品',
                        total: parseFloat(price)
                    });
                }
            }
        }
    } catch (error) {
        console.error('解析OCR结果失败:', error);
    }
    
    return items;
}

/**
 * 辅助函数：在字段中查找指定名称的值
 */
function findFieldValue(field, possibleNames) {
    if (!field.Name || !field.Value) return null;
    
    const fieldName = field.Name.toLowerCase();
    for (const name of possibleNames) {
        if (fieldName.includes(name.toLowerCase())) {
            return field.Value;
        }
    }
    return null;
}