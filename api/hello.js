// 最简单的版本，没有任何依赖
module.exports = (req, res) => {
    res.json({ 
        message: 'API is working!',
        time: new Date().toISOString()
    });
}
