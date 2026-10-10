<?php
/**
 * 菲鸟外卖 - 马尼拉标杆演示商户与菜品数据注入脚本
 * 适用于 Canary 与 Manila 生产数据库
 */

$dbHost = getenv('DB_HOST') ?: 'mysql.zxem.svc.cluster.local';
$dbUser = getenv('DB_USER') ?: 'firebird_user';
$dbPass = getenv('DB_PASS') ?: 'firebirdpassword';
$targetDb = $argv[1] ?? 'firebird_canary';

echo ">>> 连接数据库: {$targetDb} @ {$dbHost} ...\n";
try {
    $pdo = new PDO("mysql:host={$dbHost};dbname={$targetDb};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    die("数据库连接失败: " . $e->getMessage() . "\n");
}

$now = time();
$gcsBase = "https://storage.googleapis.com/fbird-sea-uploads/waimai";

// 1. 初始化 5 大外卖商户主营分类
$shopTypes = [
    [1, '中式经典', 1, "{$gcsBase}/chuan_banner.jpg"],
    [2, '菲律宾风味', 2, "{$gcsBase}/inasal_banner.jpg"],
    [3, '奶茶饮品', 3, "{$gcsBase}/tea_banner.jpg"],
    [4, '东南亚特色', 4, "{$gcsBase}/inasal_banner.jpg"],
    [5, '24H便民商超', 5, "{$gcsBase}/tea_banner.jpg"]
];

foreach ($shopTypes as $st) {
    $stmt = $pdo->prepare("INSERT INTO huoniao_waimai_shop_type (id, title, sort, icon, paotui, index_show) 
        VALUES (?, ?, ?, ?, 0, 1) 
        ON DUPLICATE KEY UPDATE title = VALUES(title), sort = VALUES(sort), icon = VALUES(icon), index_show = 1");
    $stmt->execute([$st[0], $st[1], $st[2], $st[3]]);
}
echo "✓ 5 个外卖主营分类初始化完成\n";

// 2. 初始化 3 家马尼拉核心商圈标杆商户
$shops = [
    [
        'id' => 1,
        'shopname' => '川妹子川湘私房菜 (Makati店)',
        'typeid' => 1,
        'cityid' => 10000,
        'phone' => '0917-123-4567',
        'address' => 'Makati Avenue, Poblacion, Makati City, Metro Manila',
        'coordX' => '121.0315',
        'coordY' => '14.5645',
        'basicprice' => 250.00,
        'delivery_fee' => 49.00,
        'delivery_time' => 35,
        'shop_banner' => "{$gcsBase}/chuan_banner.jpg",
        'star' => 4.9,
        'sale' => 520,
        'description' => '地道川湘风味，现炒小菜，麻辣鲜香，在菲华人聚餐下饭首选！'
    ],
    [
        'id' => 2,
        'shopname' => 'Mang Inasal 传统菲式烤鸡 (BGC旗舰店)',
        'typeid' => 2,
        'cityid' => 10000,
        'phone' => '0928-888-9999',
        'address' => 'High Street, Bonifacio Global City, Taguig, Metro Manila',
        'coordX' => '121.0508',
        'coordY' => '14.5507',
        'basicprice' => 180.00,
        'delivery_fee' => 39.00,
        'delivery_time' => 30,
        'shop_banner' => "{$gcsBase}/inasal_banner.jpg",
        'star' => 4.8,
        'sale' => 860,
        'description' => '经典菲式炭火烤鸡、热气腾腾的铁板 Sisig，地道原汁原味，本地第一国民美食。'
    ],
    [
        'id' => 3,
        'shopname' => 'KOI Thé 鲜茶果饮 (Pasay商圈店)',
        'typeid' => 3,
        'cityid' => 10000,
        'phone' => '0966-666-8888',
        'address' => 'Mall of Asia Complex, Pasay City, Metro Manila',
        'coordX' => '120.9822',
        'coordY' => '14.5352',
        'basicprice' => 150.00,
        'delivery_fee' => 29.00,
        'delivery_time' => 25,
        'shop_banner' => "{$gcsBase}/tea_banner.jpg",
        'star' => 4.9,
        'sale' => 1240,
        'description' => '精选台湾原叶茶与新鲜水果，现煮黄金波霸珍珠，清爽解腻。'
    ]
];

foreach ($shops as $sp) {
    $stmt = $pdo->prepare("INSERT INTO huoniao_waimai_shop (
        id, peisong_type, cityid, userid, sort, shopname, typeid, phone, address,
        coordX, coordY, status, ordervalid, closeorder, merchant_deliver, selftake, cancelorder,
        weeks, start_time1, end_time1, delivery_radius, delivery_fee_mode, basicprice, delivery_fee,
        delivery_time, shop_banner, share_pic, star, sale, description, jointime
    ) VALUES (
        ?, 0, ?, 1, 1, ?, ?, ?, ?,
        ?, ?, 1, 1, 0, 1, 1, 1,
        '1,2,3,4,5,6,7', '09:00', '23:30', 10000, 1, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE 
        shopname = VALUES(shopname), typeid = VALUES(typeid), phone = VALUES(phone), address = VALUES(address),
        coordX = VALUES(coordX), coordY = VALUES(coordY), status = 1, ordervalid = 1,
        basicprice = VALUES(basicprice), delivery_fee = VALUES(delivery_fee),
        shop_banner = VALUES(shop_banner), share_pic = VALUES(share_pic),
        star = VALUES(star), sale = VALUES(sale), description = VALUES(description)");
    
    $stmt->execute([
        $sp['id'], $sp['cityid'], $sp['shopname'], $sp['typeid'], $sp['phone'], $sp['address'],
        $sp['coordX'], $sp['coordY'], $sp['basicprice'], $sp['delivery_fee'],
        $sp['delivery_time'], $sp['shop_banner'], $sp['shop_banner'], $sp['star'], $sp['sale'],
        $sp['description'], $now
    ]);
}
echo "✓ 3 家标杆商户注入完成\n";

// 3. 初始化店内分类
$dishCategories = [
    // 店铺 1
    ['id' => 1, 'sid' => 1, 'title' => '招牌热炒', 'sort' => 1],
    ['id' => 2, 'sid' => 1, 'title' => '川味硬菜', 'sort' => 2],
    ['id' => 3, 'sid' => 1, 'title' => '特色主食', 'sort' => 3],
    // 店铺 2
    ['id' => 4, 'sid' => 2, 'title' => '招牌烤鸡套餐', 'sort' => 1],
    ['id' => 5, 'sid' => 2, 'title' => '铁板与小吃', 'sort' => 2],
    ['id' => 6, 'sid' => 2, 'title' => '特色甜点', 'sort' => 3],
    // 店铺 3
    ['id' => 7, 'sid' => 3, 'title' => '经典波霸奶茶', 'sort' => 1],
    ['id' => 8, 'sid' => 3, 'title' => '鲜萃果茶系列', 'sort' => 2],
    ['id' => 9, 'sid' => 3, 'title' => '芝士奶盖精选', 'sort' => 3]
];

foreach ($dishCategories as $dc) {
    $stmt = $pdo->prepare("INSERT INTO huoniao_waimai_list_type (id, sid, title, sort, status, start_time, end_time, weekshow, del)
        VALUES (?, ?, ?, ?, 1, '00:00', '00:00', 0, 0)
        ON DUPLICATE KEY UPDATE title = VALUES(title), sort = VALUES(sort), status = 1, start_time = '00:00', end_time = '00:00', weekshow = 0, del = 0");
    $stmt->execute([$dc['id'], $dc['sid'], $dc['title'], $dc['sort']]);
}
echo "✓ 店内菜品分类初始化完成\n";

// 4. 初始化菜品商品库
$dishes = [
    // 店铺 1: 川妹子
    ['id' => 1, 'sid' => 1, 'typeid' => 1, 'title' => '招牌麻婆豆腐', 'price' => 220.00, 'formerprice' => 250.00, 'unit' => '份', 'pics' => "{$gcsBase}/chuan_banner.jpg", 'sale' => 156],
    ['id' => 2, 'sid' => 1, 'typeid' => 1, 'title' => '农家小炒肉', 'price' => 380.00, 'formerprice' => 420.00, 'unit' => '份', 'pics' => "{$gcsBase}/chuan_banner.jpg", 'sale' => 210],
    ['id' => 3, 'sid' => 1, 'typeid' => 2, 'title' => '正宗秘制水煮牛肉', 'price' => 580.00, 'formerprice' => 650.00, 'unit' => '大份', 'pics' => "{$gcsBase}/chuan_banner.jpg", 'sale' => 188],
    ['id' => 4, 'sid' => 1, 'typeid' => 1, 'title' => '酸辣土豆丝', 'price' => 180.00, 'formerprice' => 200.00, 'unit' => '份', 'pics' => "{$gcsBase}/chuan_banner.jpg", 'sale' => 140],
    ['id' => 5, 'sid' => 1, 'typeid' => 3, 'title' => '手工水饺 (猪肉白菜/15个)', 'price' => 260.00, 'formerprice' => 280.00, 'unit' => '份', 'pics' => "{$gcsBase}/chuan_banner.jpg", 'sale' => 95],
    
    // 店铺 2: Mang Inasal
    ['id' => 6, 'sid' => 2, 'typeid' => 4, 'title' => '招牌炭火烤鸡腿饭 (PM1)', 'price' => 195.00, 'formerprice' => 220.00, 'unit' => '套', 'pics' => "{$gcsBase}/inasal_banner.jpg", 'sale' => 450],
    ['id' => 7, 'sid' => 2, 'typeid' => 5, 'title' => '铁板 Pork Sisig (配温泉蛋)', 'price' => 260.00, 'formerprice' => 290.00, 'unit' => '份', 'pics' => "{$gcsBase}/inasal_banner.jpg", 'sale' => 320],
    ['id' => 8, 'sid' => 2, 'typeid' => 5, 'title' => '菲式香脆炸春卷 (Lumpiang)', 'price' => 150.00, 'formerprice' => 170.00, 'unit' => '份', 'pics' => "{$gcsBase}/inasal_banner.jpg", 'sale' => 210],
    ['id' => 9, 'sid' => 2, 'typeid' => 6, 'title' => '经典彩虹冰 (Halo-Halo Extra)', 'price' => 135.00, 'formerprice' => 150.00, 'unit' => '杯', 'pics' => "{$gcsBase}/inasal_banner.jpg", 'sale' => 180],

    // 店铺 3: KOI Thé
    ['id' => 10, 'sid' => 3, 'typeid' => 7, 'title' => '黄金波霸奶茶 (Large)', 'price' => 165.00, 'formerprice' => 180.00, 'unit' => '大杯', 'pics' => "{$gcsBase}/tea_banner.jpg", 'sale' => 680],
    ['id' => 11, 'sid' => 3, 'typeid' => 8, 'title' => '满杯鲜柚果茶 (Large)', 'price' => 185.00, 'formerprice' => 200.00, 'unit' => '大杯', 'pics' => "{$gcsBase}/tea_banner.jpg", 'sale' => 420],
    ['id' => 12, 'sid' => 3, 'typeid' => 7, 'title' => '黑糖波霸厚鲜奶 (Medium)', 'price' => 190.00, 'formerprice' => 210.00, 'unit' => '中杯', 'pics' => "{$gcsBase}/tea_banner.jpg", 'sale' => 530],
    ['id' => 13, 'sid' => 3, 'typeid' => 9, 'title' => '芝士厚乳四季春 (Large)', 'price' => 175.00, 'formerprice' => 190.00, 'unit' => '大杯', 'pics' => "{$gcsBase}/tea_banner.jpg", 'sale' => 310]
];

foreach ($dishes as $d) {
    $stmt = $pdo->prepare("INSERT INTO huoniao_waimai_list (
        id, sid, typeid, sort, title, price, formerprice, unit, is_dabao, dabao_money,
        status, stockvalid, stock, sale, pics, body, nature, pubdate
    ) VALUES (
        ?, ?, ?, 1, ?, ?, ?, ?, 1, 10.00,
        1, 1, 999, ?, ?, '', '', ?
    ) ON DUPLICATE KEY UPDATE
        title = VALUES(title), price = VALUES(price), formerprice = VALUES(formerprice),
        unit = VALUES(unit), pics = VALUES(pics), status = 1, stock = 999, sale = VALUES(sale)");
    
    $stmt->execute([
        $d['id'], $d['sid'], $d['typeid'], $d['title'], $d['price'], $d['formerprice'],
        $d['unit'], $d['sale'], $d['pics'], $now
    ]);
}
echo "✓ 13 道爆款菜品商品入库完成\n";

echo "🎉 菲鸟外卖全景演示数据已成功注入 {$targetDb}！\n";
