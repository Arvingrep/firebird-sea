<?php

/**
 * huoniaoTag模板标签函数插件-外卖模块
 *
 * @param $params array 参数集
 * @return array
 */
function awardlegou($params, $content = "", &$smarty = array(), &$repeat = array())
{
    extract($params);
    $service = "awardlegou";
    global $template;
    if (empty($action)) return '';

    global $huoniaoTag;
    global $dsql;
    global $userLogin;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $do;
    global $cfg_awardlegouFee;
    global $cfg_fenxiaoAmount;
    global $cfg_fenxiaoLevel;
    include HUONIAOINC . "/config/awardlegou.inc.php";
    $fenXiao = (int)$customfenXiao;
    global $cfg_fenxiaoState;
    $userid   = $userLogin->getMemberID();
    $userinfo = $userLogin->getMemberInfo();
    $furl     = urlencode('' . $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    if ($action == 'detail') {
        $huoniaoTag->assign('fromShare', (int)$fromShare);
        $huoniaoTag->assign('pinid', (int)$pinid);

        //查询当前用户是否为分销商
        $archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`nickname`, m.`from_uid`, m.`cityid`, m2.`username` recuser, m2.`nickname` recname, m2.`mtype` from_mtype, f.`state`, f.`pubdate` FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` LEFT JOIN `#@__member` m2  ON m2.`id` = m.`from_uid` WHERE 1 = 1 AND m.`id` = $userid AND f.`state` = 1");
        $results  = $dsql->dsqlOper($archives, "results");

        //分销佣金比列
        $cfg_fenxiaoFee_awardlegou = 0;
        if($cfg_fenxiaoLevel && $fenXiao && $cfg_fenxiaoState && $results) {
            $level = unserialize($cfg_fenxiaoLevel);
            $levelProportion = $level[0]['fee'];
            $cfg_fenxiaoFee_awardlegou =  $cfg_fenxiaoAmount / 100 * $levelProportion / 100;
        }
        $huoniaoTag->assign('cfg_fenxiaoFee_awardlegou', $cfg_fenxiaoFee_awardlegou);

        if($_SESSION['awardlegouUrl']!==''){
            putSession('awardlegouUrl', '');
        }

        $noawardlegoutime = $userinfo['noawardlegoutime'];
        $is_noawardlegou  = $userinfo['is_noawardlegou'];

        if($pinid){
            $pinsql = $dsql->SetQuery("SELECT `people` FROM `#@__awardlegou_pin` WHERE `id` = '$pinid'");
            $pinres = $dsql->dsqlOper($pinsql,"results");
            $huoniaoTag->assign('people', (int)$pinres[0]['people']);
        }

        $huoniaoTag->assign('noawardlegoutime', (int)$noawardlegoutime);
        $huoniaoTag->assign('is_noawardlegou', (int)$is_noawardlegou);
        if($id) {
            $detailHandels = new handlers($service, "proDetail");
            $detailConfig  = $detailHandels->getHandle($id);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];//print_R($detailConfig);exit;
                if (is_array($detailConfig)) {

                    if ($template != 'config') {
                        detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                    }
                    global $detailArr;
                    $detailArr = $detailConfig;
                    //输出详细信息
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                    $state = 1;

                }
            }else{
                header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                return ;
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
            return ;
        }
    }elseif ($action == 'confirm-order'){
        $huoniaoTag->assign('proid', $proid);
        global $userLogin;
        global $custom_pointurl;
        $huoniaoTag->assign('custom_pointurl', $custom_pointurl);
        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }
        if($fromShare){
            /*乐购商品url*/
            $param = array(
                "service"  => "awardlegou",
                "template" => "detail",
                "id"       => $proid
            );
            $url   = getUrlPath($param);
            $url = $url.'&fromShare='.$fromShare;
            putSession('awardlegouUrl', $url);
        }
        $huoniaoTag->assign('from_uid', $fromShare);
        $huoniaoTag->assign('pinid', $pinid);
        if($proid){
            $detailHandels = new handlers($service, "proDetail");
            $detailConfig  = $detailHandels->getHandle($proid);
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];//print_R($detailConfig);exit;
                if (is_array($detailConfig)) {

                    if ($template != 'config') {
                        detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                    }

                    //输出详细信息
                    foreach ($detailConfig as $key => $value) {
                        $huoniaoTag->assign('detail_' . $key, $value);
                    }
                    $state = 1;

                }
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
            return ;
        }
    }elseif($action == "pay"){
        global $userLogin;
        $userid = $userLogin->getMemberID();

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        if($paytuikuanlogtic ==1 && $oid){
            $sql = $dsql->SetQuery("SELECT `ordernum` FROM `#@__awardlegou_order` WHERE `id` = '$oid'");
            $res = $dsql->dsqlOper($sql, "results");

            $ordernum = $res[0]['ordernum'];
        }

        if($ordernum){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_order` WHERE `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $huoniaoTag->assign('ordernum', $ordernum);
                $order = $ret[0];

                foreach ($order as $key => $value) {
                    $huoniaoTag->assign($key, $value);
                    if($key == 'proid'){
                        $prosql = $dsql->SetQuery("SELECT `price`,`usepoint`,`tuikuanlogtic` FROM `#@__awardlegou_list` WHERE `id` = '".$value."'");
                        $prores = $dsql->dsqlOper($prosql,'results');
                        if($prores){
                            if($paytuikuanlogtic == 1){
                                $tuikuanlogtic =  $prores[0]['tuikuanlogtic'];
                                $huoniaoTag->assign('price', $prores[0]['tuikuanlogtic']);
                            }else{
                                $huoniaoTag->assign('price', $prores[0]['price']);
                            }
                            $huoniaoTag->assign('usepoint', $prores[0]['usepoint']);
                        }
                    }
                }

                if($paytuikuanlogtic == 1){

                    $totalAmount = $tuikuanlogtic;
                    $huoniaoTag->assign('paytuikuanlogtic', (int)$paytuikuanlogtic);
                }else{

                    $totalAmount = $order['amount'];
                }
                $huoniaoTag->assign('totalAmount', $totalAmount);
                $huoniaoTag->assign('totalBalance', $order['point'] * $order['count']);

            }else{
                header('location:/404.html');
                die;
            }
        }else{
            header('location:/404.html');
            die;
        }

        // 支付完成
    }elseif($action == "payreturn"){
        global $userLogin;
        $userid = $userLogin->getMemberID();

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        if(!empty($ordernum)){

            //根据支付订单号查询支付结果
            $archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'integral' AND `ordernum` = '$ordernum' AND `uid` = $userid");
            $payDetail  = $dsql->dsqlOper($archives, "results");
            if($payDetail){

                $state = $payDetail[0]['state'];

                // 待支付或待发货
                if($state == 0 || $state == 1){
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__integral_order` WHERE `ordernum` = '".$payDetail[0]['body']."'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $ret = $ret[0];
                    foreach ($ret as $key => $value) {
                        $huoniaoTag->assign('order_'.$key, $value);
                    }
                    $id = $ret['id'];
                    $proid = $ret['proid'];
                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "orderdetail",
                        "module" => "awardlegou",
                        "id" => $id
                    );
                    $url = getUrlPath($param);
                    $huoniaoTag->assign("state", $state);
                    $huoniaoTag->assign("orderurl", $url);

                    $huoniaoTag->assign("ordernum", $ordernum);

                    $detailHandels = new handlers($service, "detail");
                    $detailConfig  = $detailHandels->getHandle($proid);
                    $detailConfig  = $detailConfig['info'];
                    if(is_array($detailConfig)){
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_'.$key, $value);
                        }
                    }
                }else{
                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "order",
                        "module" => "integral"
                    );
                    $url = getUrlPath($param);
                    header("location:$url");
                }
                //支付订单不存在
            }else{
                header("location:".$cfg_secureAccess.$cfg_basehost);
                die;
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost);
            die;
        }
    }elseif($action == "fabu"){
        global $userLogin;
        $userid = $userLogin->getMemberID();
        global $detailArr;
        //遍历所选分类ID
        if($userid != -1 && (!empty($typeid) || $detailArr)) {
            //修改信息
            if($detailArr){
                $typeid = $typeid ? $typeid : $detailArr['typeid'];

                $huoniaoTag->assign("typeid", $typeid);
            }
            global $data;
            $data = "";
            $proType = getParentArr("awardlegou_type", $typeid);
            $proType = array_reverse(parent_foreach($proType, "typename"));
            $huoniaoTag->assign('proType', join(" > ", $proType));
        }
    }
    global $custom_awardlegouGuize;
    $huoniaoTag->assign("guize", stripslashes($custom_awardlegouGuize));
    if (empty($smarty)) return;
    global $template;

    if (!isset($return))
        $return = 'row'; //返回的变量数组名

    //注册一个block的索引，照顾smarty的版本
    if (method_exists($smarty, 'get_template_vars')) {
        $_bindex = $smarty->get_template_vars('_bindex');
    } else {
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if (!$_bindex) {
        $_bindex = array();
    }

    if ($return) {
        if (!isset($_bindex[$return])) {
            $_bindex[$return] = 1;
        } else {
            $_bindex[$return]++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

    //对象$smarty上注册一个数组以供block使用
    if (!isset($smarty->block_data)) {
        $smarty->block_data = array();
    }

    //得一个本区块的专属数据存储空间
    $dataindex = md5(__FUNCTION__ . md5(serialize($params)));
    $dataindex = substr($dataindex, 0, 16);

    //使用$smarty->block_data[$dataindex]来存储
    if (!$smarty->block_data[$dataindex]) {
        //取得指定动作名
        $moduleHandels = new handlers($service, $action);

        //获取分类
        if ($action == "type" || $action == "addr" || $action == "hotype" || $action == "hotCircle" || $action == "circle") {
            $params['type']     = $type;
            $params['page']     = $page;
            $params['pageSize'] = $pageSize;
            $params['son']      = '0';

            //信息列表
        } elseif ($action == "tlist") {
            //如果是列表页面，则获取地址栏传过来的typeid
            if ($template == "list" && !$typeid) {
                global $typeid;
                $params['typeid'] = $typeid;
            }

        }

        $moduleReturn = $moduleHandels->getHandle($params);

        //只返回数据统计信息
        if ($pageData == 1) {
            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $pageInfo_ = array("totalCount" => 0);
            } else {
                $moduleReturn = $moduleReturn['info'];  //返回数据
                $pageInfo_    = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

            //正常返回
        } else {
            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';

            $moduleReturn = $moduleReturn['info'];  //返回数据

            $pageInfo_ = $moduleReturn['pageInfo'];
            if ($pageInfo_) {

                //如果有分页数据则提取list键
                $moduleReturn = $moduleReturn['list'];

                //把pageInfo定义为global变量
                global $pageInfo;
                $pageInfo = $pageInfo_;
                $smarty->assign('pageInfo', $pageInfo);
            }

            $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据
        }
    }

    //果没有数据，直接返回null,不必再执行了
    if (!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if (list($key, $item) = each($smarty->block_data[$dataindex])) {
        $smarty->assign($return, $item);
        $repeat = true;
    }

    //如果已经到达最后，重置数组指针，重复执行开关置位0
    if (!$item) {
        reset($smarty->block_data[$dataindex]);
        $repeat = false;
    }

    //打印内容
    print $content;
}