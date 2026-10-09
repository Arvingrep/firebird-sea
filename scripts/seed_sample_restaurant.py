import time
import hashlib

now = int(time.time())

# Salted sha1 hash for password 'merchant123'
salt = "fbird88"
raw_pwd = "merchant123"
pwd_hash = salt + hashlib.sha1((salt + raw_pwd).encode('utf-8')).hexdigest()

sql = f"""
-- 1. 创建或更新商家会员账号 (merchant_test / merchant123)
DELETE FROM `huoniao_member` WHERE `username` = 'merchant_test';

INSERT INTO `huoniao_member` (
    `mtype`, `username`, `password`, `nickname`, `email`, `emailCheck`, 
    `areaCode`, `phone`, `phoneCheck`, `money`, `freeze`, `point`, 
    `regtime`, `regip`, `state`
) VALUES (
    2, 'merchant_test', '{pwd_hash}', '川香阁掌柜', 'merchant@fbird.men', 1,
    '63', '09178889999', 1, 1000.00, 0.00, 100, 
    {now}, '127.0.0.1', 0
);

-- 2. 获取会员ID并创建商家资料
SET @uid = (SELECT id FROM `huoniao_member` WHERE username = 'merchant_test');

DELETE FROM `huoniao_business_list` WHERE `uid` = @uid;

INSERT INTO `huoniao_business_list` (
    `cityid`, `uid`, `title`, `logo`, `typeid`, `addrid`, `address`, 
    `lng`, `lat`, `people`, `tel`, `opentime`, `amount`, `pubdate`, 
    `state`, `company`, `diancan_state`, `diancan_tableware_open`, 
    `diancan_tableware_price`, `maidan_state`, `type`, `click`
) VALUES (
    1, @uid, '川香阁·马尼拉中餐厅 (Szechuan Gourmet Manila)', 
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop', 
    1, 1, 'Salcedo Village, Ayala Ave, Makati, Metro Manila',
    '121.0244', '14.5547', '张经理', '0917-888-9999', '10:00 - 22:00',
    '450', {now}, 1, '川香阁餐饮管理有限公司', 1, 1, 10, 1, 2, 88
);

SET @busi_id = (SELECT id FROM `huoniao_business_list` WHERE uid = @uid LIMIT 1);

-- 3. 创建点餐菜品分类
DELETE FROM `huoniao_business_diancan_type` WHERE `uid` = @busi_id;

INSERT INTO `huoniao_business_diancan_type` (`uid`, `title`, `sort`, `status`) VALUES
(@busi_id, '招牌川湘硬菜', 1, 1),
(@busi_id, '主食与点心', 2, 1),
(@busi_id, '解辣特调饮品', 3, 1);

SET @type_hot = (SELECT id FROM `huoniao_business_diancan_type` WHERE uid = @busi_id AND title = '招牌川湘硬菜' LIMIT 1);
SET @type_staple = (SELECT id FROM `huoniao_business_diancan_type` WHERE uid = @busi_id AND title = '主食与点心' LIMIT 1);
SET @type_drink = (SELECT id FROM `huoniao_business_diancan_type` WHERE uid = @busi_id AND title = '解辣特调饮品' LIMIT 1);

-- 4. 创建示例菜品 (价格单位均为菲律宾比索 ₱)
DELETE FROM `huoniao_business_diancan_list` WHERE `uid` = @busi_id;

INSERT INTO `huoniao_business_diancan_list` 
(`uid`, `sort`, `title`, `price`, `typeid`, `tag`, `status`, `descript`, `pics`) VALUES
(@busi_id, 1, '麻婆豆腐 (Classic Mapo Tofu)', 260.00, @type_hot, '热销招牌', 1, '经典川味，麻辣鲜香，下饭绝配', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'),
(@busi_id, 2, '水煮牛肉 (Szechuan Boiled Beef)', 520.00, @type_hot, '主厨推荐', 1, '精选安格斯牛肉，麻辣醇厚，肉质鲜嫩', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop'),
(@busi_id, 3, '宫保鸡丁 (Kung Pao Chicken)', 380.00, @type_hot, '人气必点', 1, '香脆花生与嫩滑鸡丁的酸甜微辣交织', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop'),
(@busi_id, 4, '老坛酸菜鱼 (Pickled Cabbage Fish)', 680.00, @type_hot, '镇店之宝', 1, '古法老坛酸菜，鲜活黑鱼现切薄片，汤鲜味美', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop'),

(@busi_id, 5, '扬州炒饭 (Yangzhou Fried Rice)', 220.00, @type_staple, '主食特选', 1, '粒粒分明，金黄鲜香，配料丰富', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'),
(@busi_id, 6, '手工猪肉白菜水饺 (Dumplings 10pcs)', 200.00, @type_staple, '手工现包', 1, '北方老师傅手工包制，皮薄馅大爆汁', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop'),

(@busi_id, 7, '老北京冰镇酸梅汤 (Iced Plum Drink)', 90.00, @type_drink, '清爽解腻', 1, '乌梅山楂古法熬制，冰爽酸甜', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop'),
(@busi_id, 8, '加多宝凉茶 (Herbal Tea Can)', 80.00, @type_drink, '经典罐装', 1, '正品凉茶，怕上火喝加多宝', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop');
"""

with open('/tmp/seed_sample_restaurant.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print("SQL written successfully")
