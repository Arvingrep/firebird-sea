<?php if (!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 数据库操作类
 *
 * @version        $Id: dsql.class.php 2013-7-13 下午18:04:40 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class dsql extends db_connect
{
    /**
     * 保存或生成一个DB对象，设定盐的长度
     *
     * @param object $db 数据库对象
     * @param int $saltLength 密码盐的长度
     */
    public $querynum = 0;  //查询的次数
    public $querytime = 0;  //查询的时间

    public $querysql = "";

    function __construct($db = NULL)
    {
        parent::__construct($db);
    }

    function dsql()
    {
        $this->__construct();
    }

    /**
     * 取得数据库的表信息
     * @access function
     * @return array
     */
    function getTables()
    {
        try {
            $stmt = $this->db->prepare("SHOW TABLES");

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_NUM);
            $stmt->closeCursor();

            $tabs = array();
            foreach ($results as $tab => $tbname) {
                $state = $this->getTableState("SHOW TABLE STATUS LIKE '%s'", $tbname[0]);
                $tabs[$tab]['name'] = $tbname[0];
                $tabs[$tab]['Rows'] = $state[0]['Rows'];
                $tabs[$tab]['Data_length'] = sizeformat($state[0]['Data_length']);
                $tabs[$tab]['Comment'] = $state[0]['Comment'];
            }
            return $tabs;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    /**
     * 取得数据表的详细信息
     * @access function
     * @return array
     */
    function getTableState($sql, $table = '')
    {
        $sql = sprintf($sql, $table);
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $results;
    }

    /**
     * 取得表字段
     * @access function
     * @return array
     */
    function getTableFields($table = '')
    {
        $stmt = $this->db->prepare("SELECT * FROM `" . $table . "` LIMIT 1");
        $stmt->execute();
        $fields = array();
        for ($i = 0; $i < $stmt->columnCount(); $i++) {
            $meta = $stmt->getColumnMeta($i);
            array_push($fields, $meta['name']);
        }
        return $fields;
    }

    /**
     * 优化所有表
     * @access function
     * @return string
     */
    function optimizeAllTables()
    {
        try {
            $stmt = $this->db->prepare("SHOW TABLES");

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_NUM);
            $stmt->closeCursor();

            foreach ($results as $tab => $tbname) {
                $this->optimizeTables($tbname[0]);
            }
            return json_encode("优化成功！");
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    /**
     * 优化表
     *
     * @param string $tables table1,table2,table3....
     * @return tables
     */
    public function optimizeTables($table)
    {
        $sql = sprintf('OPTIMIZE TABLE %s', $table);
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $results;
    }

    /**
     * 修复所有表
     * @access function
     * @return string
     */
    function repairAllTables()
    {
        try {
            $stmt = $this->db->prepare("SHOW TABLES");

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_NUM);
            $stmt->closeCursor();

            foreach ($results as $tab => $tbname) {
                $this->repairTables($tbname[0]);
            }
            return json_encode("修复成功！");
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    /**
     * 修复表
     *
     * @param string $tables table1,table2,table3....
     * @return tables
     */
    public function repairTables($table)
    {
        $sql = sprintf('REPAIR TABLE %s EXTENDED', $table);
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $results;
    }


    /**
     *  获取指定ID的分类
     *
     * @param     int    $id  大类ID
     * @return    array
     */
    function getOptionList($id = 0, $action)
    {
        $sql = $this->SetQuery("SELECT `id`, `typename` FROM `#@__" . $action . "type` WHERE `parentid` = $id ORDER BY 'weight'");
        try {
            $stmt = $this->db->prepare($sql);

            if (!empty($id)) {
                $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            }

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();

            return $results;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    /**
     *  遍历所有分类
     *
     * @return    array
     */
    function getTypeList($id = 0, $tab, $son = true, $page = 1, $pageSize = 100000, $cond = "", $more = "", $hideSameCity = false)
    {

        $id = (int)$id;
        $page = (int)$page;
        $pageSize = (int)$pageSize;
        
        $page = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 1000 : $pageSize;
        $atpage = $pageSize * ($page - 1);
        $where = " LIMIT $atpage, $pageSize";
        $return = array();

        //防止查询整张区域表导致的卡死，有些业务需要获取全国数据，这里暂时不做处理
        // if($tab == 'site_area' && !$id && $son) return;

        $sql = $this->SetQuery("SELECT * FROM `#@__" . $tab . "` WHERE `parentid` = $id" . $cond . " ORDER BY `weight`" . $where);

        //获取缓存数据
        // $_sql = strtolower($sql);
        // $_cacheFile = $tab . '-' . $id . '-' . (int)$son . '-' . md5($_sql) . '.php';
        
        //区域
        // if(strstr($_sql, 'area` where')){
        //     $cacheData = getCacheData($_sql, 'area');
        //     if($cacheData){
        //         return $cacheData['data'];
        //     }
        // }

        // $cacheData = cache_read($_cacheFile, 'typeList');
        // if($cacheData){
        //     return $cacheData;
        // }

        try {
            $stmt = $this->db->prepare($sql);

            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $count   = $stmt->rowCount();
            $stmt->closeCursor();

            if ($results && $count > 0) { //如果有子类

                //如果是获取区域
                if ($tab == "site_area") {
                    global $cfg_sameAddr_state;
                    $siteCityArr = array();
                    if ($id && $tab == 'site_area' && $hideSameCity && !$cfg_sameAddr_state) {
                        $siteConfigService = new siteConfig();
                        $siteCity = $siteConfigService->siteCity();

                        foreach ($siteCity as $key => $val) {
                            array_push($siteCityArr, $val['cityid']);
                        }
                    }
                }

                $kk = 0;
                foreach ($results as $k => $v) {

                    if ($siteCityArr && in_array($v['id'], $siteCityArr)) {
                        continue;
                    }

                    $return[$kk]['id']         = (int)$v['id'];
                    $return[$kk]['parentid']   = (int)$v['parentid'];
                    $return[$kk]['typename']   = $v['typename'];

                    if(isset($results[$kk]['level'])){
                        $return[$kk]["level"]     = $v['level'];
                    }
                    if(isset($results[$kk]['longitude'])){
                        $return[$kk]['longitude']   = $v['longitude'];
                        $return[$kk]['latitude']   = $v['latitude'];
                    }
                    $return[$kk]['title']     = $v['title'] ? $v['title'] : $v['typename'];
                    
                    if(isset($results[$kk]['note'])){
                        $return[$kk]['note']     = $v['note'];
                    }
                    if ($v['litpic']) {
                        $return[$kk]['litpic']     = $v['litpic'] ? getFilePath($v['litpic']) : '';
                    }

                    if (isset($v['icon'])) {
                        $return[$kk]['iconturl'] = empty($v['icon']) ? '' : getFilePath($v['icon']);
                        $return[$kk]['icon'] = HUONIAOADMIN ? $v['icon'] : $return[$kk]['iconturl'];
                    }
                    // 返回更多字段
                    if ($more) {
                        $moreArr = explode(",", $more);
                        foreach ($moreArr as $m_v) {
                            if (isset($v[$m_v])) {
                                $return[$kk][$m_v] = $v[$m_v];
                            }
                        }
                    }

                    //区域或地铁信息不需要链接地址
                    if (!strpos($tab, "addr") && !strpos($tab, "subway") && !strpos($tab, "site_area") && !strstr($tab, "task_member_level")) {

                        $par = array(
                            "service"     => preg_replace("/_?type/", "", preg_replace("/_?news/", "", preg_replace("/_?newstype/", "", preg_replace("/_?brandtype/", "", $tab)))),
                            "template"    => "list",
                            "typeid"      => $v['id']
                        );

                        if($tab == 'business_type'){
                            $par['param'] = 'typeid=' . $v['id'];
                        }

                        //获取链接时，去除分站信息
                        global $withoutCityDomain;
                        $withoutCityDomain = 1;
                        $return[$kk]["url"]    = getUrlPath($par);
                    }

                    //区域需要把城市天气ID和城市拼音输出
                    if ($tab == "site_area") {
                        $return[$kk]["pinyin"] = strtolower($v['pinyin']);
                        $return[$kk]["weather_code"] = $v['weather_code'];
                    }

                    //新闻、图片特殊字段【拼音、拼音首字母】
                    if ($tab == "car_brandtype" || $tab == "articletype" || $tab == "imagetype") {
                        $return[$kk]["pinyin"] = $v['pinyin'];
                        $return[$kk]["py"] = $v['py'];
                    }

                    //团购特殊用法【热门、文字颜色】
                    if ($tab == "tuantype" || $tab == "tuanaddr") {
                        $return[$kk]['hot'] = $v['hot'];
                        if ($tab != "tuanaddr") {
                            $return[$kk]['color'] = $v['color'];
                        }
                    }


                    //房产特殊用法【区域坐标】
                    if ($tab == "houseaddr") {
                        $return[$kk]['longitude'] = $v['longitude'];
                        $return[$kk]['latitude'] = $v['latitude'];
                    }


                    //直播分类输出flag
                    if ($tab == "livetype") {
                        $return[$kk]['flag'] = $v['flag'];
                    }

                    //分类信息需要输入redirect
                    if ($tab == "infotype") {
                        $return[$kk]["style"] = (int)$v['style'];
                        $return[$kk]["searchall"] = (int)$v['searchall'];
                        $return[$kk]["redirect"] = trim($v['redirect']);
                        //跳转链接改为自定义链接
                        if ($v['redirect'] != '') {
                            $return[$kk]["url"] = $v['redirect'];
                        }
                    }

                    //分类信息需要输入redirect
                    if ($tab == "tieba_type") {
                        $return[$kk]["redirect"] = trim($v['redirect']);
                        //跳转链接改为自定义链接
                        if ($v['redirect'] != '') {
                            $return[$kk]["url"] = trim($v['redirect']);
                        }
                    }

                    //任务悬赏输出单价和数量
                    if ($tab == "task_type") {
                        $return[$kk]['price'] = (float)$v['price'];
                        $return[$kk]['count'] = (int)$v['count'];
                        $return[$kk]['fabuParam'] = $v['fabuParam'] ? explode(',', $v['fabuParam']) : array();
                    }

                    //任务悬赏自定义菜单输出链接地址
                    if ($tab == "task_menu" || $tab == "task_business_link") {
                        $return[$kk]['url'] = $v['url'];
                    }

                    //任务悬赏会员等级
                    if ($tab == "task_member_level"){
                        $return[$kk]['price'] = (float)$v['price'];
                        $return[$kk]['mprice'] = (float)$v['mprice'];
                        $return[$kk]['duration_month'] = (int)$v['duration_month'];
                        $return[$kk]['duration_note'] = $v['duration_note'];
                        $return[$kk]['refresh_coupon'] = (int)$v['refresh_coupon'];
                        $return[$kk]['refresh_discount'] = (int)$v['refresh_discount'];
                        $return[$kk]['bid_coupon'] = (int)$v['bid_coupon'];
                        $return[$kk]['bid_discount'] = (int)$v['bid_discount'];
                        $return[$kk]['fabu_count'] = (int)$v['fabu_count'];
                        $return[$kk]['bgcolor'] = $v['bgcolor'];
                        $return[$kk]['fontcolor'] = $v['fontcolor'];
                        $return[$kk]['fabu_fee'] = (int)$v['fabu_fee'];
                        $return[$kk]['task_fee'] = (int)$v['task_fee'];
                        $return[$kk]['equity'] = $this->getTypeList($v['id'], 'task_member_level_equity', 0, 1, 100000, $cond, $more);
                    }

                    //任务悬赏会员等级权益
                    if ($tab == "task_member_level_equity"){
                        $return[$kk]['note'] = $v['note'];
                    }

                    //任务悬赏刷新套餐
                    if ($tab == "task_refresh_package"){
                        $return[$kk]['price'] = $v['price'];
                    }

                    //招聘企业标签
                    if ($tab == "job_companytag"){
                        $return[$kk]['color'] = $v['color'];
                    }


                    if ($son) {
                        $_son = $son;
                        if ($son === 'once') $_son = false;
                        $return[$kk]["lower"] = $this->getTypeList($v['id'], $tab, $_son, 1, 100000, $cond, $more);
                    } else {
                        $sql = $this->SetQuery("SELECT `id` FROM `#@__" . $tab . "` WHERE `parentid` = " . $v['id']);
                        $stmt = $this->db->prepare($sql);
                        $stmt->execute();
                        $count   = $stmt->rowCount();
                        $stmt->closeCursor();
                        if ($count > 0) {
                            $return[$kk]["lower"] = $count;
                        }
                    }
                    $kk++;
                }

                //数据写入缓存

                //区域
                // if(strstr($_sql, 'area` where')){
                //     setCacheData($_sql, $return, 'area');
                // }

                // cache_write($_cacheFile, $return, 'typeList');

                return $return;
            } else {
                return "";
            }
        } catch (Exception $e) {
            return array(
                'state' => 200,
                'info' => '分类获取失败！'
            );
            //			return '{"state": 200, "info": "分类获取失败！"}';
        }
    }

    /**
     *  获取分类名称
     *
     * @access    public
     * @param     int    $id  大类ID
     * @return    array
     */
    function getTypeName($sql)
    {
        return $this->dsqlOper($sql,"results");
//        try {
//
//            $stmt = $this->db->prepare($sql);
//            $stmt->execute();
//            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
//            $stmt->closeCursor();
//
//            return $results;
//        } catch (Exception $e) {
//            die($e->getMessage());
//        }
    }

    /**
     * 根据 SQL 语句的内容，判断是否属于指定的表，并返回匹配到表的所有字段
     * 如果 SQL 语句中包含指定的表，则返回该表的所有字段；否则返回空数组
     * 
     * @param string $sql 原始 SQL 语句
     * @param string $tableName 指定的表名
     * @return array 匹配到的表的所有字段
     */
    public function getFieldsFromSQL($sql) {

        //需要加密处理的表和字段
        //规则配置项，格式为 ['表名' => ['字段1', '字段2', ...]]
        //后续如果要增加新的表或字段，需要先将老数据加密，否则会出现数据异常问题，admin/siteConfig/siteSafe.php中也要一份，需要同步修改
        $_rules = array(
            'member' => array('realname', 'idcard', 'email', 'phone', 'address'),  //会员
            'member_address' => array('address', 'person', 'mobile'),  //收货地址
            'member_fenxiao_user' => array('phone'),  //分销商
            'member_withdraw' => array('cardnum', 'cardname'),  //提现记录
            'member_withdraw_card' => array('cardnum', 'cardname'),  //提现卡号
            'article_selfmedia' => array('op_name', 'op_idcard', 'op_phone', 'op_email'),  //媒体号
            'awardlegou_order' => array('useraddr', 'username', 'usercontact'),  //有奖乐购订单
            'business_dingzuo_order' => array('name', 'contact'),  //商家订座订单
            'car_appoint' => array('tel'),  //汽车预约到店
            'car_enturst' => array('contact'),  //汽车委托卖车
            'car_scrap' => array('name', 'phone'),  //汽车报废申请
            'education_order' => array('people', 'contact'),  //教育订单
            'education_word' => array('tel'),  //教育留言
            'education_yuyue' => array('tel'),  //教育预约
            'homemaking_order' => array('useraddr', 'username', 'usercontact'),  //家政订单
            'house_coop' => array('tel'),  //楼盘合作
            'house_entrust' => array('address', 'doornumber', 'username', 'contact'),  //房源委托
            'house_fenxiaobb' => array('username', 'usertel'),  //分销报备
            'house_loupantuan' => array('name', 'phone'),  //楼盘团购报名
            'house_notice' => array('name', 'phone'),  //楼盘降价通知
            'house_yuyue' => array('username', 'mobile'),  //房产预约
            'huodong_order' => array('property'),  //活动订单
            'huodong_reg' => array('property'),  //活动报名
            'integral_order' => array('people', 'address', 'contact'),  //积分商城订单
            'job_resume' => array('name', 'phone', 'email'),  //招聘简历
            'marry_contactlog' => array('tel', 'username'),  //婚嫁套餐咨询
            'marry_rese' => array('people', 'contact'),  //婚嫁预约
            'paimai_order' => array('useraddr', 'username', 'usercontact'),  //拍卖订单
            'paotui_order' => array('person', 'tel', 'address', 'getperson', 'gettel', 'buyaddress'),  //跑腿订单
            'shop_order' => array('people', 'address', 'contact'),  //商城订单
            'waimai_order' => array('person', 'tel', 'address'),  //外卖订单
            'waimai_order_all' => array('person', 'tel', 'address'),  //外卖订单
            'pension_elderly' => array('elderlyname', 'address', 'tel', 'email'),  //养老老人信息
            'pension_yuyue' => array('people', 'tel'),  //养老预约
            'renovation_entrust' => array('people', 'contact'),  //装修申请
            'renovation_rese' => array('address', 'people', 'contact'),  //装修预约
            'renovation_visit' => array('people', 'contact'),  //装修申请
            'renovation_zhaobiao' => array('address', 'people', 'contact', 'email'),  //装修招标
            'travel_order' => array('people', 'contact', 'idcard', 'email', 'backpeople', 'backcontact', 'backaddress'),  //旅游订单
            'tuan_order' => array('useraddr', 'username', 'usercontact'),  //团购订单
            'waimai_address' => array('person', 'tel', 'street', 'address'),  //外卖收货地址
        );

        //给表名增加前缀
        $rules = array();
        $tablePrefix = $GLOBALS['DB_PREFIX'];
        foreach($_rules as $key => $value){
            $rules[$tablePrefix.$key] = $value;
        }

        //判断SQL语句中是否包含指定的表
        $fieldsList = array();
        $tableName = '';  //需要查询出所有
        foreach($rules as $table => $fields){
            if(strpos($sql, '`'.$table.'`') !== false){
                $fieldsList = array_merge($fieldsList, $fields);

                //如果存在select * from的情况，需要做特殊处理，把所有字段都查询出来，并替换*内容
                //这里不判断复杂的多表查询，只判断单表查询
                if (preg_match('/select \* from/i', $sql, $matches)) {
                    $tableName = $table;
                }
            }
        }

        return array('fields' => array_unique($fieldsList), 'tableName' => $tableName);
    }


    /**
     * 根据 SQL 语句的类型自动加密或解密敏感字段。
     * 对 SELECT 使用 AES_DECRYPT，并带 AS 别名；对 WHERE 中使用 AES_DECRYPT，但不带 AS 别名；
     * 对 INSERT/UPDATE 使用 AES_ENCRYPT。
     * 
     * @param string $sql 原始 SQL 语句
     * @return string 修改后的 SQL 语句
     */
    public function processSensitiveFieldsInSQL($sql) {

        $key = trim($GLOBALS['cfg_aes_key']);  //AES 加密密钥

        if(!$sql || !$key) return $sql;
        
        $_sql = strtolower($sql);
        if(strstr($_sql, 'insert into') && strstr($_sql, 'site_module')) return $sql;

        // 定义需要加密/解密的字段
        $sensitiveData = $this->getFieldsFromSQL($sql);
        $sensitiveFields = $sensitiveData['fields'];
        $tableName = $sensitiveData['tableName'];

        if(!$sensitiveFields) return $sql;

        // 检查 SQL 语句的类型
        $operation = '';
        if (preg_match('/^\s*select/i', $sql)) {
            $operation = 'decrypt';
        } elseif (preg_match('/^\s*(insert|update)/i', $sql)) {
            $operation = 'encrypt';
        } else {
            return $sql;
        }

        //如果存在select * from的情况，需要做特殊处理，把所有字段都查询出来，并替换*内容
        //这里不判断复杂的多表查询，只判断单表查询
        if (preg_match('/select \* from/i', $sql, $matches) && $tableName) {
            
            //先将*替换为$sensitiveFields数据
            $sql = preg_replace('/select \*/i', 'select `'.implode('`,`', $sensitiveFields) . '` huoniao_fields_placeholder', $sql);  //最后用一个占位付

        }

        // 根据操作类型选择 AES 函数
        $aesFunction = $operation === 'encrypt' ? 'AES_ENCRYPT' : 'AES_DECRYPT';

        // 对 SELECT 语句的处理
        if ($operation === 'decrypt') {
            // 处理 SELECT 子句中的字段，且保留 AS 别名
            $sql = preg_replace_callback("/select(.*?)from /i", function ($matches) use ($aesFunction, $sensitiveFields, $key) {
                $selectClause = $matches[1];
                foreach ($sensitiveFields as $field) {
                    // 将 SELECT 子句中的敏感字段替换为 AES_DECRYPT 并保留别名
                    $selectClause = preg_replace_callback("/([a-zA-Z0-9_]+\.)?`$field`/", function ($matches) use ($aesFunction, $key, $field) {
                        $prefix = $matches[1] ?? '';  // 保留表前缀
                        return "CONVERT($aesFunction(UNHEX($prefix$field), '$key') USING utf8mb4) as `$field`";
                    }, $selectClause);
                }
                return "select $selectClause from ";
            }, $sql);

            // 保留 LEFT JOIN 部分不做处理
            // 不修改 LEFT JOIN 后的表名或字段
            $sql = preg_replace_callback("/left join(.*?)on/i", function ($matches) {
                return "left join{$matches[1]}on";
            }, $sql);

            // 处理 WHERE 子句中的字段（不使用 as），支持多种运算符，如 =, >, <, LIKE 等
            foreach ($sensitiveFields as $field) {
                $sql = preg_replace_callback("/([a-zA-Z0-9_]+\.)?`$field`\s*(=|>|<|LIKE|!=)\s*'([^']*)'/i", function ($matches) use ($aesFunction, $key, $field) {
                    $prefix = $matches[1] ?? '';  // 保留表前缀
                    return "CONVERT($aesFunction(UNHEX($prefix$field), '$key') USING utf8mb4) {$matches[2]} '{$matches[3]}'";
                }, $sql);
            }
        }

        // 对 INSERT 和 UPDATE 语句的处理（加密）
        if ($operation === 'encrypt') {
            // INSERT 语句处理
            if (preg_match('/insert\s+into\s+[`]?([a-zA-Z0-9_]+)[`]?/i', $sql)) {
                // 处理 INSERT 语句，匹配 VALUES 部分
                $sql = preg_replace_callback('/\(([^)]+)\)\s*VALUES\s*\((.*?)\)$/i', function ($matches) use ($aesFunction, $sensitiveFields, $key) {
                    // 匹配字段列表和对应的值
                    $fields = explode(',', $matches[1]);
                    
                    // 正确提取 VALUES 部分，支持引号和逗号，并处理空值和数字
                    preg_match_all("/'([^']*?)'|([^,\s]+)/", $matches[2], $valueMatches);
                    
                    $values = array_filter(array_map(function ($value) {
                        return $value ? "'" . trim($value, "'") . "'" : ($value == '0' ? 'hn_0' : 'hn_kong');
                    }, $valueMatches[0])); // 提取所有值并保留引号
                    
                    $oldValue = 'hn_0';
                    $newValue = 0;
                    $values = array_map(function($item) use ($oldValue, $newValue) {
                        return ($item === $oldValue) ? $newValue : $item;
                    }, $values);

                    // 对字段逐个检查并加密敏感字段
                    foreach ($fields as $index => $field) {
                        $field = trim($field, ' `');
                        if (in_array($field, $sensitiveFields)) {
                            // 替换对应的值为 AES_ENCRYPT
                            $values[$index] = "HEX($aesFunction({$values[$index]}, '$key'))";
                        }
                    }

                    // 重新组合成 INSERT 语句
                    return '(' . implode(',', $fields) . ') VALUES (' . implode(',', $values) . ')';
                }, $sql);
            }

            // UPDATE 语句处理
            elseif (preg_match('/update\s+[`]?([a-zA-Z0-9_]+)[`]?/i', $sql)) {
                foreach ($sensitiveFields as $field) {
                    $sql = preg_replace_callback("/(`?$field`?\s*=\s*)'([^']*)'/", function ($matches) use ($aesFunction, $key) {
                        return "{$matches[1]}HEX($aesFunction('{$matches[2]}', '$key'))";
                    }, $sql);
                }
            }
        }

        //如果存在select * from的情况，需要做特殊处理，把所有字段都查询出来，并替换*内容
        //这里不判断复杂的多表查询，只判断单表查询
        if ($tableName) {

            $columns_cache = cache_read($tableName . '.php', 'tableColumns');
            if($columns_cache){
                $columnNames = $columns_cache;
            }else{
                //查询$tableName表的所有字段
                $_sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '".$GLOBALS['DB_NAME']."' AND TABLE_NAME = '$tableName'";  
                $stmt2 = $this->db->prepare($_sql);
                $stmt2->execute();
                $res_2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
                $stmt2->closeCursor();

                // 使用array_map来提取COLUMN_NAME的值  
                $columnNames = array_map(function($item) {  
                    return $item['COLUMN_NAME'];  
                }, $res_2);

                //从字段中删除敏感字段
                $columnNames = array_diff($columnNames, $sensitiveFields);

                cache_write($tableName . '.php', $columnNames, 'tableColumns', 1);
            }

            if($columnNames){
                $sql = str_replace('huoniao_fields_placeholder', ',`'. join('`,`', $columnNames) . '`', $sql);
            }
        }

        return $sql;
    }

    /**
     * 根据业务需求，缓存SQL执行结果，减少重复查询
     * 主要用于系统配置类数据基本不会变动的SQL查询
    */
    public function cache($sql, $type, $fetch, $table_name, $sensitive)
    {

        $_this = $this;
        $_sql = strtolower($sql);

        //指定表的SQL进行缓存
        if(
            strstr($_sql, 'select') && 
            (
                strstr($_sql, '_site_module') ||
                strstr($_sql, '_domain') ||
                strstr($_sql, '_site_city') ||
                strstr($_sql, '_site_payment') ||
                strstr($_sql, '_app_config') ||
                strstr($_sql, '_site_config') ||
                strstr($_sql, '_member_level') ||
                strstr($_sql, '_site_area') ||
                strstr($_sql, '_attachment')
            )
        ){

            // 初始化文件缓存（自定义缓存目录和默认过期时间）
            $fileDataCache = new FileDataCache();

            $ret = $fileDataCache->get(
                $sql, // 唯一缓存key（建议：表名_用途_条件）
                function() use ($_this, $sql, $type, $fetch, $table_name, $sensitive) {
                    return $_this->dsqlOper($sql, $type, $fetch, $table_name, $sensitive, true);
                }
            );

            return $ret;

        }

    }

    /**
     * 执行SQL
     *
     * @param     string $sql 要操作的sql语句
     * @param     string $type  操作类型，update/results/lastid/totalCount
     * @param     string $fetch 查询结果返回类型，ASSOC/NUM  默认为ASSOC
     * @param     string $table_name 表名，用于有分表时，配合lastid使用
     * @param     string $sensitive 是否对敏感字段进行加密，1为加密，0为不加密，默认为1
     * @return    json
     */
    public function dsqlOper($sql, $type, $fetch = "ASSOC", $table_name = null, $sensitive = 1, $from_cache = false)
    {
        global $_G;
        global $cfg_siteDebug;
        try {

            $md5sql = base64_encode($sql) . '_' . $type;            

            //重复的SQL取当前请求的首次结果，避免重复查询，查询会员信息、分站、更新、订单相关的除外
            if(
                isset($_G[$md5sql]) != NULL &&
                !strstr($sql, "FROM `" . $GLOBALS['DB_PREFIX'] . "member`") &&
                !strstr($sql, "FROM `" . $GLOBALS['DB_PREFIX'] . "site_city`") &&
                $type != 'update' && $type != "lastid" &&
                !strstr($sql, "INSERT") &&
                !strstr($sql, "insert") &&
                !strstr($sql, "order") &&
                !strstr($sql, "COUNT") &&
                !strstr($sql, "count") &&
                !strstr($sql, "sub_tablelist") &&
                !strstr($sql, "`videoParse`!=0")
            ){
                return $_G[$md5sql];
            }


            //处理涉及加密数据的字段
            //由于骑手端三表联查的语句比较复杂，这里不做处理，由业务代码单独处理
            if(
                (
                    $_REQUEST['action'] == 'courierOrderList' && 
                    (strstr($sql, 'shop_order') || strstr($sql, 'waimai_order') || strstr($sql, 'paotui_order'))
                )
                || !$sensitive  //强制不处理
                || $from_cache //强制不处理
            ){

            }else{
                $sql = $this->processSensitiveFieldsInSQL($sql);
            }

            //查询缓存数据，后台不使用缓存
            if(HUONIAOADMIN == '' && $from_cache == false && !strstr($sql, "`videoParse`!=0")){
                $_ret = $this->cache($sql, $type, $fetch, $table_name, $sensitive);
                if($_ret !== null){
                    return $_ret;
                }
            }

            $s = microtime(true);
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            $t = number_format((microtime(true) - $s), 6);
            if($cfg_siteDebug == TRUE){
                $this->querynum++;

                if ($t >= ($_GET['t'] ? $_GET['t'] : 0.5)) {
                    $time = '<span style="color:red;">' . $t . ' s/per' . '</span>';
                } else {
                    $time = '<span style="color:green;">' . $t . ' s/per' . '</span>';
                }
                $this->querysql .= $sql . ";{$time}<br />";
            }

            $haslog = false;

            //执行超过1秒的，记录到日志中
            if($t > 2){
                //记录会员余额变动日志
                require_once HUONIAOROOT . "/api/payment/log.php";
                $_memberLog = new CLogFileHandler(HUONIAOROOT . '/log/slow/' . date('Y-m-d') . '.log', true);
                $_memberLog->DEBUG($t . "秒\r\n" . $sql, true);

                //跟踪错误堆栈，抓取报错的文件位置和行号
                $trace = debug_backtrace();
                $staceInfo = "";
                foreach ($trace as $item){
                    $staceInfo.=PHP_EOL.$item['file'].":".$item['line'];
                }
                $_memberLog->DEBUG($staceInfo, true);

                $haslog = true;
            }

            $sql_ = $sql;

            //如果是更新会员表，则删除会员缓存
            global $DB_PREFIX;
            global $HN_memory;
            $sql = strtolower($sql);
            $sql_ = $sql;
            $sql = str_replace(" ", "", $sql);
            $sql = str_replace("`", "", $sql);
            $sql = str_replace("'", "", $sql);

            //记录用户表的操作日志
            if ((strstr($sql, "update") && strstr($sql, "memberset") && !strstr($sql, "online") && !strstr($sql, "admin_common_function")) || (strstr($sql, "insertinto") && strstr($sql, "member("))) {
                $strArr = explode("where", $sql);
                if (strstr($strArr[1], 'id=')) {
                    $strArr2 = explode('=', $strArr[1]);
                    $lid = $strArr2[1];
                    $HN_memory->rm('member_' . $lid);
                    // update条件不是id：member_cleanExpired.php member_cleanOnline.php
                } elseif (is_numeric($strArr_[1])) {
                    $strArr_ = explode("where", $sql_);
                    $sql2 = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE " . $strArr_[1]);
                    $stmt2 = $this->db->prepare($sql2);
                    $stmt2->execute();
                    $res_2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
                    $stmt2->closeCursor();
                    if ($res_2) {
                        foreach ($res_2 as $k => $v) {
                            $HN_memory->rm('member_' . $v['id']);
                        }
                    }
                }

                //如果是更新token，记录为用户登录，更新登录次数和时间
                if (strstr($sql, "access_token")) {

                    //提取sql中的id，如：update `huoniao_member` set `access_token_wxmini` = 'xxx', `refresh_token_wxmini` = 'xxx' where `id` = '135285'
                    $strArr = explode("where", $sql_);
                    $strArr2 = explode("=", $strArr[1]);
                    $_uid = (int)trim(str_replace("'", '', $strArr2[1]));
                    
                    if($_uid){
                        $ip   = GetIP();
                        $ipaddr = getIpAddr($ip);
                        $time = GetMkTime(time());
                        $sql = $this->SetQuery("UPDATE `#@__member` SET `logincount` = `logincount` + 1, `lastlogintime` = '$time', `lastloginip` = '$ip', `lastloginipaddr` = '$ipaddr', `online` = '$time' WHERE `id` = $_uid");
                        $this->dsqlOper($sql, "update");

                        $loginPlatform = '电脑端';
                        if(isApp()){
                            $loginPlatform = (isAndroidApp() ? '安卓' : '苹果') .'APP';
                        }elseif(isWxMiniprogram()){
                            $loginPlatform = '微信小程序';
                        }elseif(isByteMiniprogram()){
                            $loginPlatform = '抖音小程序';
                        }elseif(isMobile()){
                            if(isWeixin()){
                                $loginPlatform = '微信公众号';
                            }else{
                                $loginPlatform = 'H5';
                            }
                        }

                        //记录登录日志
                        $useragent = $_SERVER['HTTP_USER_AGENT'];
                        $_ip = $ip . ($_SERVER['REMOTE_PORT'] ? ':' . $_SERVER['REMOTE_PORT'] : '');
                        $sql = $this->SetQuery("INSERT INTO `#@__member_login` (`userid`, `logintime`, `loginip`, `ipaddr`, `platform`, `useragent`) VALUES ('$_uid', '$time', '$_ip', '$ipaddr', '$loginPlatform', '$useragent')");
                        $this->dsqlOper($sql, "update");

                        //记录用户行为日志
                        memberLog($_uid, 'member', '', 0, 'insert', '用户登录('.$loginPlatform.')', '', $sql);
                    }
                }

                //记录会员余额变动日志
                require_once HUONIAOROOT . "/api/payment/log.php";
                $_memberLog = new CLogFileHandler(HUONIAOROOT . '/log/member/' . date('Y-m-d') . '.log', true);
                $_memberLog->DEBUG($sql_, true);
                $haslog = true;
            }

            //记录用户余额表的操作日志
            if ((strstr($sql, "insertinto") || strstr($sql, "update")) && (strstr($sql, "member_money") || strstr($sql, "member_withdraw"))) {
                //记录会员余额变动日志
                require_once HUONIAOROOT . "/api/payment/log.php";
                $_memberLog = new CLogFileHandler(HUONIAOROOT . '/log/member/' . date('Y-m-d') . '.log', true);
                $_memberLog->DEBUG($sql_, true);
                $haslog = true;
            }

            //记录外卖订单表的操作日志
            if ((strstr($sql, "insertinto") || strstr($sql, "update")) && strstr($sql, "waimai_order")) {
                //记录会员余额变动日志
                // require_once HUONIAOROOT . "/api/payment/log.php";
                // $_memberLog = new CLogFileHandler(HUONIAOROOT . '/log/waimaiOrder/' . date('Y-m-d') . '.log', true);
                // $_memberLog->DEBUG($sql_, true);
                // $haslog = true;
            }

            //记录商城订单表的操作日志
            if ((strstr($sql, "insertinto") || strstr($sql, "update")) && strstr($sql, "shop_order")) {
                //记录会员余额变动日志
                require_once HUONIAOROOT . "/api/payment/log.php";
                $_memberLog = new CLogFileHandler(HUONIAOROOT . '/log/shopOrder/' . date('Y-m-d') . '.log', true);
                $_memberLog->DEBUG($sql_, true);
                $haslog = true;
            }
            // if(strstr(strtolower($sql), 'update `'.$DB_PREFIX.'member`')){
            //     $strArr = explode(' ', $sql);
            //     $lid = $strArr[count($strArr)-1];
            //     $HN_memory->rm('member_'. $lid);
            // }

            $res = "";

            //最后一次插入的ID
            if ($type == "lastid") {
                // return $this->db->lastInsertId();
                $res = (int)$this->db->lastInsertId();
                if(is_numeric($res)){
                    if($table_name){
                        $sub = new SubTable("$table_name", "#@__$table_name");
                        $sub->checkCreateTable($res);
                    }
                }
                if($haslog){
                    $_memberLog->DEBUG($res, true);
                }
                //总条数
            } else if ($type == "totalCount") {
                // return $stmt->rowCount();
                $res = (int)$stmt->rowCount();

                //数据列表
            } else if ($type == "results") {
                $fetch = $fetch ?: "ASSOC";  // 默认值
                if ($fetch == "ASSOC") {
                    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } elseif ($fetch == "NUM") {
                    $res = $stmt->fetchAll(PDO::FETCH_NUM);
                }

                $res = is_array($res) ? $res : array();

                //更新数据
            } else if ($type == "update") {
                // return "ok";
                $res = "ok";
                if($haslog){
                    $_memberLog->DEBUG($res, true);
                }
            }

            $stmt->closeCursor();

            $this->querytime += $t;
            if ($t > 1) {
                // echo '<p style="color:red;">'.$sql_.";&nbsp;&nbsp;&nbsp;".$t." s</p>";
            } else {
                // echo '<p>'.$sql_."; ".$t." s</p>";
            }

            $_G[$md5sql] = $res;

            return $res;
        } catch (Exception $e) {
            //			$log_file = HUONIAODATA.'/checkSql_safe.txt';
            //			$time = date("Y-m-d H:i:s", time());
            // fputs(fopen($log_file,'a+'),"\r\n".$time." sql操作失败语句：".$sql."\n\r");
            
            $autoRun = 1;
            $asyncTable = "";
            $GLOBALS['autoRun'] = $autoRun;
            $msg = $e->getMessage();


            //需要修复并同步分表
            $needSyncArticle = false;
            if(strstr($msg, "is marked as crashed") && strstr($msg, "repair")){

                //提取表名  
                $pattern = '/Table \'.*?\/(\w+)\/(\w+)/';  
                
                if (preg_match($pattern, $errorString, $matches)) {  
                    // $matches[1] 将包含匹配到的表名  
                    $tableName = $matches[1];  
                }

                //资讯表
                if(strstr($msg, 'articlelist')){

                    //先修复主表
                    $articlelist = $this->SetQuery("#@__articlelist");
                    $this->repairTables($articlelist);
                    
                    //再查找所有分表并修复
                    $sql = $this->SetQuery("SELECT `table_name` FROM `#@__site_sub_tablelist` WHERE `service` = 'articlelist'");
                    $ret = $this->dsqlOper($sql, "results");
                    if($ret){
                        foreach($ret as $key => $val){
                            $this->repairTables($val['table_name']);
                        }
                    }

                    //最后再同步分表
                    $needSyncArticle = true;

                }

                elseif(strstr($msg, 'member') && $tableName){
                    $this->repairTables($tableName);
                }

            }

            $non_MyISAM = strstr($msg,"non-MyISAM");

            //1.自动同步新闻表
            if(strstr($msg,"articlelist_all' doesn't exist") || strstr($msg,"articlelist_all' is read only") || ($non_MyISAM && strstr($sql,"articlelist_all")) || $needSyncArticle){
                $autoRun = 2;
                $asyncTable = "articlelist";
            }
            //2.同步动态圈子表
            elseif(strstr($msg,"circle_dynamic_all' doesn't exist") || strstr($msg,"circle_dynamic_all' is read only") || ($non_MyISAM && strstr($sql,"circle_dynamic_all"))){
                $autoRun = 2;
                $asyncTable = "circle_dynamic";
            }
            //3.同步圈子点赞表
            elseif(strstr($msg,"circle_fabulous_all' doesn't exist") || strstr($msg,"circle_fabulous_all' is read only") || ($non_MyISAM && strstr($sql,"circle_fabulous_all"))){
                $asyncTable = "circle_fabulous";
                $autoRun = 2;
            }
            //4.同步圈子关注列表
            elseif(strstr($msg,"circle_follow_all' doesn't exist") || strstr($msg,"circle_follow_all' is read only") || ($non_MyISAM && strstr($sql,"circle_follow_all"))){
                $asyncTable = "circle_follow";
                $autoRun = 2;
            }
            //5.同步外卖表
            elseif(strstr($msg,"waimai_order_all' doesn't exist") || strstr($msg,"waimai_order_all' is read only") || ($non_MyISAM && strstr($sql,"waimai_order_all"))){
                $asyncTable = "waimai_order";
                $autoRun = 2;
            }
            //6.同步评论分表
            elseif(strstr($msg,"public_comment_all' doesn't exist") || strstr($msg,"public_comment_all' is read only") || ($non_MyISAM && strstr($sql,"public_comment_all"))){
                $asyncTable = "public_comment";
                $autoRun = 2;
            }
            //7.同步点赞分表
            elseif(strstr($msg,"public_up_all' doesn't exist") || strstr($msg,"public_up_all' is read only") || ($non_MyISAM && strstr($sql,"public_up_all"))){
                $asyncTable = "public_up";
                $autoRun = 2;
            }
            //8.同步用户行为日志分表
            elseif(strstr($msg,"member_log_all' doesn't exist") || strstr($msg,"member_log_all' is read only") || ($non_MyISAM && strstr($sql,"member_log_all"))){
                $asyncTable = "member_log";
                $autoRun = 2;
            }
            //end.是否需要执行分表同步
            if($autoRun==2){
                require_once(HUONIAOINC."/class/SubTableAsync.class.php");
                $asyncRes = SubTableAsync::run($asyncTable);  // 同步表
            }
            //需要修复
            if(strstr($msg, "try to repair it")){
                //提取表名
                //SQLSTATE[HY000]: General error: 126 Incorrect key file for table './库名/表名.MYI'; try to repair it
                $dataArr = explode('for table', $msg);
                $dataArr = explode('; try to repair', $dataArr[1]);
                $dataArr = explode('/', str_replace("'", '', $dataArr[0]));
                $dataArr = explode('.', $dataArr[count($dataArr)-1]);
                $this->repairTables($dataArr[0]);
            }
            //记录sql错误，写入日志文件
            if($sql && !strstr($msg, "MySQL server has gone away")){
                require_once HUONIAOROOT . "/api/payment/log.php";
                $_errorSqlLog = new CLogFileHandler(HUONIAOROOT . '/log/errorsql/' . date('Y-m-d') . '.log', true);
                //跟踪错误堆栈，抓取报错的文件位置和行号
                $trace = debug_backtrace();
                $staceInfo = "";
                foreach ($trace as $item){
                    $staceInfo.=PHP_EOL.$item['file'].":".$item['line'];
                }
                $_errorSqlLog->DEBUG("SQL:".$sql.PHP_EOL."MSG:".$msg.PHP_EOL."TRACE:".$staceInfo, true);
            }
            if ($cfg_siteDebug) {
                return '{"state": 200, "info": ' . json_encode($e->getMessage()) . '}';
            } else {
                return '{"state": 200, "info": "操作失败！"}';
            }
        }
    }

    //递归方式把数组或字符串 null转换为空''字符串
    public function _unsetNull($arr){
        if($arr !== null){
            if(is_array($arr)){
                if(!empty($arr)){
                    foreach($arr as $key => $value){
                        if($value === null){
                            $arr[$key] = '';
                        }else{
                            $arr[$key] = $this->_unsetNull($value);      //递归再去执行
                        }
                    }
                }else{ $arr = ''; }
            }else{
                if($arr === null){ $arr = ''; }         //注意三个等号
            }
        }else{ $arr = ''; }
        return $arr;
    }

    /**
     * by zfh
     * 执行更新操作，返回响应结果的条数
     */
    public function update(string $sql)
    {
        return $this->dsqlOper($sql,"update");
    }

    /** by zfh
     * 取结果集的第一行、第一列，返回一个变量（为空时返回空字符串）
     */
    public function getOne(string $sql,$param=array()){
        $result = $this->dsqlOper($sql,"results","NUM");  // 数字下标
        if(is_array($result) && is_array($result[0])){
            return $result[0][0];  // 返回第一行第一列
        }
        return $result ?: '';  // 返回results数据，默认空字符串
    }

    /** by zfh
     * 获取 多行一列 或 一行多列，返回一个Array
     */
    public function getArr($sql)
    {
        // 先假设为多行多列结果集
        $res = $this->dsqlOper($sql,"results");
        if(!is_array($res)){  // 失败了
            return $res;
        }
        // 判断是否为多行，如果是多行，取每行第一列（下标数组）
        if(count($res) > 1){
            $r = array();
            foreach ($res as $k=>$v){
                $r[] = current($v);
            }
            return $r;
        }
        // 假设为一行多列，返回第一行（关联数组）
        else{
            if(empty($res)){  // 如果数组为空，直接返回空数组
                return $res;
            }else{
                if(count($res[0])==1){  //单行单列？？？强制返回索引格式。因为单行单列，更可能是多行单列（索引数组），而不是单行多列（关联数组），有几列容易确定，但有时候有几行却不确定
                    return array(current($res[0]));
                }
                return $res[0];
            }
        }
    }

    /** by zfh
     *  获取多行多列，返回二维数组
     */
    public function getArrList(string $sql)
    {
        return $this->dsqlOper($sql,"results");
    }

    /** by zfh
     * 统计数量
     */
    public function count(string $sql): int
    {
        try {
            $pre = $this->db->prepare("select count(*) total from ( ".$sql." ) tmp_count");
            $pre->execute();
            $res =  $pre->fetch(PDO::FETCH_ASSOC);
            return (int)$res['total'];
        } catch (\Throwable $e) {
            return 0;
        }
    }

    /** by zfh
     * 分页查询函数
     * page 指定页数，
     * pageSize 指定大小
     * sql 为查询sql
     * type 默认为0，返回list和pageInfo，如果为1仅返回list，如果为2仅返回pageInfo
     */
    public function getPage(int $page, int $pageSize, string $sql,int $type=0)
    {
        // 查询数据
        $list = array();
        if($type==0 || $type==1){
            $r_start = ($page - 1) * $pageSize;
            $listSql = $sql ." limit $r_start,$pageSize";
            $list = $this->getArrList($listSql);
            if($type==1){  // 仅返回 list
                return $list;
            }
        }
        // 取得总数
        $total = $this->count($sql);
        // 封装info
        $pageInfo = array();
        $pageInfo['page'] = $page;      // 当前页数
        $pageInfo['pageSize'] = $pageSize;  // 页面大小
        $pageInfo['totalCount'] = $total;  // 总条数
        $pageInfo['totalPage'] = ceil($total / $pageSize);  // 总页数
        if($type==2){  // 仅返回 info
            return $pageInfo;
        }
        // 封装结果
        $RES['pageInfo'] = $pageInfo;
        $RES['list'] = $list;
        return $RES;
    }



    /**
     * 获取数据库的版本信息
     * @return array
     */
    public function getDriverVersion()
    {
        return $this->db->getAttribute(PDO::ATTR_SERVER_VERSION);
    }


    /**
     * 获取数据库的大小尺寸
     * @return array
     */
    public function getDriverSize()
    {
        return $this->db->getAttribute(PDO::ATTR_PERSISTENT);
    }


    public function my_sort($arrays, $sort_key, $sort_order = SORT_ASC, $sort_type = SORT_NUMERIC)
    {
        if (is_array($arrays)) {
            foreach ($arrays as $array) {
                if (is_array($array)) {
                    $key_arrays[] = $array[$sort_key];
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
        array_multisort($key_arrays, $sort_order, $sort_type, $arrays);
        return $arrays;
    }

    public function versionCompare($versionA, $versionB)
    {
        if ($versionA > 2147483646 || $versionB > 2147483646) {
            throw new Exception('版本号,位数太大暂不支持!', '101');
        }
        $dm = '.';
        $verListA = explode($dm, (string)$versionA);
        $verListB = explode($dm, (string)$versionB);

        $len = max(count($verListA), count($verListB));
        $i = -1;
        while ($i++ < $len) {
            $verListA[$i] = intval(@$verListA[$i]);
            if ($verListA[$i] < 0) {
                $verListA[$i] = 0;
            }
            $verListB[$i] = intval(@$verListB[$i]);
            if ($verListB[$i] < 0) {
                $verListB[$i] = 0;
            }

            if ($verListA[$i] > $verListB[$i]) {
                return 1;
            } else if ($verListA[$i] < $verListB[$i]) {
                return -1;
            } else if ($i == ($len - 1)) {
                return 0;
            }
        }
    }

    public function compare_database($new, $old)
    {
        $diff = array('table' => array(), 'field' => array(), 'index' => array());
        //table
        foreach ($old['table'] as $table_name => $table_detail) {
            if (!isset($new['table'][$table_name])) {
                $diff['table']['drop'][$table_name] = $table_name; //删除表
            }
        }
        foreach ($new['table'] as $table_name => $table_detail) {
            if (!isset($old['table'][$table_name])) {
                //新建表
                $diff['table']['create'][$table_name] = $table_detail;
                $diff['field']['create'][$table_name] = $new['field'][$table_name];
                $diff['index']['create'][$table_name] = $new['index'][$table_name];
            } else {
                //对比表
                $old_detail = $old['table'][$table_name];
                $change = array();
                if ($table_detail['Engine'] !== $old_detail['Engine'])
                    // $change['Engine'] = $table_detail['Engine'];
                    if ($table_detail['Row_format'] !== $old_detail['Row_format'])
                        $change['Row_format'] = $table_detail['Row_format'];
                if ($table_detail['Collation'] !== $old_detail['Collation'])
                    $change['Collation'] = $table_detail['Collation'];
                //if($table_detail['Create_options']!=$old_detail['Create_options'])
                //	$change['Create_options']=$table_detail['Create_options'];
                if ($table_detail['Comment'] !== $old_detail['Comment'])
                    $change['Comment'] = $table_detail['Comment'];
                if (!empty($change))
                    $diff['table']['change'][$table_name] = $change;
            }
        }

        //index
        foreach ($old['index'] as $table => $indexs) {
            if (isset($new['index'][$table])) {
                $new_indexs = $new['index'][$table];
                foreach ($indexs as $index_name => $index_detail) {
                    if (!isset($new_indexs[$index_name])) {
                        //索引不存在，删除索引
                        $diff['index']['drop'][$table][$index_name] = $index_name;
                    }
                }
            } else {
                if (!isset($diff['table']['drop'][$table])) {
                    foreach ($indexs as $index_name => $index_detail) {
                        $diff['index']['drop'][$table][$index_name] = $index_name;
                    }
                }
            }
        }
        foreach ($new['index'] as $table => $indexs) {
            if (isset($old['index'][$table])) {
                $old_indexs = $old['index'][$table];
                foreach ($indexs as $index_name => $index_detail) {
                    if (isset($old_indexs[$index_name])) {
                        //存在，对比内容
                        if ($index_detail['Non_unique'] !== $old_indexs[$index_name]['Non_unique'] || $index_detail['Column_name'] !== $old_indexs[$index_name]['Column_name'] || $index_detail['Collation'] !== $old_indexs[$index_name]['Collation'] || $index_detail['Index_type'] !== $old_indexs[$index_name]['Index_type']) {
                            $diff['index']['drop'][$table][$index_name] = $index_name;
                            $diff['index']['add'][$table][$index_name] = $index_detail;
                        }
                    } else {
                        //不存在，新建索引
                        $diff['index']['add'][$table][$index_name] = $index_detail;
                    }
                }
            } else {
                if (!isset($diff['table']['create'][$table])) {
                    foreach ($indexs as $index_name => $index_detail) {
                        $diff['index']['add'][$table][$index_name] = $index_detail;
                    }
                }
            }
        }

        //fields
        foreach ($old['field'] as $table => $fields) {
            if (isset($new['field'][$table])) {
                $new_fields = $new['field'][$table];
                foreach ($fields as $field_name => $field_detail) {
                    if (!isset($new_fields[$field_name])) {
                        //字段不存在，删除字段
                        $diff['field']['drop'][$table][$field_name] = $field_detail;
                    }
                }
            } else {
                //旧数据库中的表在新数据库中不存在，需要删除
            }
        }
        foreach ($new['field'] as $table => $fields) {
            if (isset($old['field'][$table])) {
                $old_fields = $old['field'][$table];
                $last_field = '';
                foreach ($fields as $field_name => $field_detail) {
                    if (isset($old_fields[$field_name])) {
                        //字段存在，对比内容
                        if ($field_detail['Type'] !== $old_fields[$field_name]['Type'] || $field_detail['Collation'] !== $old_fields[$field_name]['Collation'] || $field_detail['Null'] !== $old_fields[$field_name]['Null'] || $field_detail['Default'] !== $old_fields[$field_name]['Default'] || $field_detail['Extra'] !== $old_fields[$field_name]['Extra'] || $field_detail['Comment'] !== $old_fields[$field_name]['Comment']) {
                            $diff['field']['change'][$table][$field_name] = $field_detail;
                        }
                    } else {
                        //字段不存在，添加字段
                        $field_detail['After'] = $last_field;
                        $diff['field']['add'][$table][$field_name] = $field_detail;
                    }
                    $last_field = $field_name;
                }
            } else {
                //新数据库中的表在旧数据库中不存在，需要新建
            }
        }

        return $diff;
    }

    public function get_db_detail($server, $username, $password, $database, &$errors = array())
    {
        $connection = @mysqli_connect($server, $username, $password);
        if ($connection === false) {
            $errors[] = '无法连接数据库！' . mysqli_connect_error();
            return false;
        }
        $serverset = 'character_set_connection=utf8, character_set_results=utf8, character_set_client=binary';
        $serverset .= @mysqli_get_server_info($connection) > '5.0.1' ? ', sql_mode=\'\'' : '';
        @mysqli_query($connection, "SET $serverset");
        if (!@mysqli_select_db($connection, $database)) {
            $errors[] = '无法使用数据库！';
            @mysqli_close($connection);
            return false;
        }

        $detail = array('table' => array(), 'field' => array(), 'index' => array());
        $tables = $this->query($connection, "show table status");
        if ($tables) {
            foreach ($tables as $key_table => $table) {
                if (!strstr($table['Name'], $GLOBALS['DB_PREFIX'])) continue;
                $detail['table'][str_replace($GLOBALS['DB_PREFIX'], '#@__', $table['Name'])] = str_replace($GLOBALS['DB_PREFIX'], '#@__', $table);
                //字段
                $fields = $this->query($connection, "show full fields from `" . $table['Name'] . "`");
                if ($fields) {
                    foreach ($fields as $key_field => $field) {
                        $fields[$field['Field']] = $field;
                        unset($fields[$key_field]);
                    }
                    $detail['field'][str_replace($GLOBALS['DB_PREFIX'], '#@__', $table['Name'])] = $fields;
                } else {
                    // $errors[] = '无法获得表的字段:' . $database . ':' . $table['Name'];
                }
                //索引
                $indexes = $this->query($connection, "show index from `" . $table['Name'] . "`");
                if ($indexes) {
                    foreach ($indexes as $key_index => $index) {
                        $indexes[$index['Key_name']]['Table'] = str_replace($GLOBALS['DB_PREFIX'], '#@__', $index['Table']);
                        if (!isset($indexes[$index['Key_name']])) {
                            $index['Column_name'] = array($index['Seq_in_index'] => $index['Column_name']);
                            $indexes[$index['Key_name']] = $index;
                        } else {
                            $indexes[$index['Key_name']]['Column_name'][$index['Seq_in_index']] = $index['Column_name'];
                        }
                        unset($indexes[$key_index]);
                    }
                    $detail['index'][str_replace($GLOBALS['DB_PREFIX'], '#@__', $table['Name'])] = $indexes;
                } else {
                    //$errors[]='无法获得表的索引信息:'.$database.':'.$table['Name'];
                    $detail['index'][str_replace($GLOBALS['DB_PREFIX'], '#@__', $table['Name'])] = array();
                }
            }
            @mysqli_close($connection);
            return $detail;
        } else {
            $errors[] = '无法获得数据库的表详情！';
            @mysqli_close($connection);
            return false;
        }
    }

    public function query($connection, $sql)
    {
        if ($connection) {
            $result = @mysqli_query($connection, $sql);
            if ($result) {
                $result_a = array();
                while ($row = @mysqli_fetch_assoc($result))
                    $result_a[] = $row;
                return $result_a;
            }
        }
        return false;
    }

    public function build_query($diff)
    {
        $sqls = array();
        if ($diff) {
            if (isset($diff['table']['drop'])) {
                foreach ($diff['table']['drop'] as $table_name => $table_detail) {
                    $sqls[] = "DROP TABLE `{$table_name}`";
                }
            }
            if (isset($diff['table']['create'])) {
                foreach ($diff['table']['create'] as $table_name => $table_detail) {
                    $fields = $diff['field']['create'][$table_name];
                    $sql = "CREATE TABLE `$table_name` (";
                    $t = array();
                    $k = array();
                    foreach ($fields as $field) {
                        $t[] = "`{$field['Field']}` " . strtoupper($field['Type']) . $this->sqlnull($field['Null']) . $this->sqldefault($field['Default']) . $this->sqlextra($field['Extra']) . $this->sqlcomment($field['Comment']);
                    }
                    if (isset($diff['index']['create'][$table_name]) && !empty($diff['index']['create'][$table_name])) {
                        $indexs = $diff['index']['create'][$table_name];
                        foreach ($indexs as $index_name => $index_detail) {
                            if ($index_name == 'PRIMARY')
                                $k[] = "PRIMARY KEY (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                            else
                                $k[] = ($index_detail['Non_unique'] == 0 ? "INDEX" : "INDEX") . "`$index_name`" . " (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                        }
                    }
                    list($charset) = explode('_', $table_detail['Collation']);
                    $sql .= implode(', ', $t) . (!empty($k) ? ',' . implode(', ', $k) : '') . ') ENGINE = ' . $table_detail['Engine'] . ' DEFAULT CHARSET = ' . $charset;
                    $sqls[] = $sql;
                }
            }
            if (isset($diff['table']['change'])) {
                foreach ($diff['table']['change'] as $table_name => $table_changes) {
                    if (!empty($table_changes)) {
                        $sql = "ALTER TABLE `$table_name`";
                        foreach ($table_changes as $option => $value) {
                            if ($option == 'Collation') {
                                list($charset) = explode('_', $value);
                                $sql .= " DEFAULT CHARACTER SET $charset COLLATE $value";
                            } else {
                                if (strtoupper($option) == 'COMMENT') {
                                    $sql .= " " . strtoupper($option) . " = '$value' ";
                                } else {
                                    $sql .= " " . strtoupper($option) . " = $value ";
                                }
                            }
                        }
                        $sqls[] = $sql;
                    }
                }
            }
            if (isset($diff['index']['drop'])) {
                foreach ($diff['index']['drop'] as $table_name => $indexs) {
                    foreach ($indexs as $index_name => $index_detail) {
                        if ($index_name == 'PRIMARY')
                            $sqls[] = "ALTER TABLE `$table_name` DROP PRIMARY KEY";
                        else
                            $sqls[] = "ALTER TABLE `$table_name` DROP INDEX `$index_name`";
                    }
                }
            }
            if (isset($diff['field']['drop'])) {
                foreach ($diff['field']['drop'] as $table_name => $fields) {
                    foreach ($fields as $field_name => $field_detail) {
                        $sqls[] = "ALTER TABLE `$table_name` DROP `$field_name`";
                    }
                }
            }
            if (isset($diff['field']['add'])) {
                foreach ($diff['field']['add'] as $table_name => $fields) {
                    foreach ($fields as $field_name => $field_detail) {
                        $sqls[] = "ALTER TABLE `$table_name` ADD `{$field_name}` " . strtoupper($field_detail['Type']) . $this->sqlcol($field_detail['Collation']) . $this->sqlnull($field_detail['Null']) . $this->sqldefault($field_detail['Default']) . $this->sqlextra($field_detail['Extra']) . $this->sqlcomment($field_detail['Comment']) . " AFTER `{$field_detail['After']}`";
                    }
                }
            }
            if (isset($diff['index']['add'])) {
                foreach ($diff['index']['add'] as $table_name => $indexs) {
                    foreach ($indexs as $index_name => $index_detail) {
                        if ($index_name == 'PRIMARY')
                            $sqls[] = "ALTER TABLE `$table_name` ADD PRIMARY KEY (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                        else
                            $sqls[] = "ALTER TABLE `$table_name` ADD" . ($index_detail['Non_unique'] == 0 ? " INDEX " : " INDEX ") . "`$index_name`" . " (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                    }
                }
            }
            if (isset($diff['field']['change'])) {
                foreach ($diff['field']['change'] as $table_name => $fields) {
                    foreach ($fields as $field_name => $field_detail) {
                        $sqls[] = "ALTER TABLE `$table_name` CHANGE `{$field_name}` `{$field_name}` " . strtoupper($field_detail['Type']) . $this->sqlcol($field_detail['Collation']) . $this->sqlnull($field_detail['Null']) . $this->sqldefault($field_detail['Default']) . $this->sqlextra($field_detail['Extra']) . $this->sqlcomment($field_detail['Comment']);
                    }
                }
            }
        }

        return $sqls;
    }

    public function sqlkey($val)
    {
        switch ($val) {
            case 'PRI':
                return ' PRIMARY';
            case 'UNI':
                return ' UNIQUE';
            case 'MUL':
                return ' INDEX';
            default:
                return '';
        }
    }

    public function sqlcol($val)
    {
        switch ($val) {
            case null:
                return '';
            default:
                list($charset) = explode('_', $val);
                return ' CHARACTER SET ' . $charset . ' COLLATE ' . $val;
        }
    }

    public function sqldefault($val)
    {
        if ($val === null) {
            return '';
        } else {
            return " DEFAULT '" . stripslashes($val) . "'";
        }
    }

    public function sqlnull($val)
    {
        switch ($val) {
            case 'NO':
                return ' NOT NULL';
            case 'YES':
                return ' NULL';
            default:
                return '';
        }
    }

    public function sqlextra($val)
    {
        switch ($val) {
            case '':
                return '';
            default:
                return ' ' . strtoupper($val);
        }
    }

    public function sqlcomment($val)
    {
        switch ($val) {
            case '':
                return '';
            default:
                return " COMMENT '" . stripslashes($val) . "'";
        }
    }
}
