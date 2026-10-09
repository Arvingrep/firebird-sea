<?php
/**
 * huoniaoTag模板标签函数插件-团购模块
 * 任意页面，均由此后端解析
 */

// 把数据全部输出到页面上、会员提醒通知

function paimai($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
    $service = "paimai";

    if(empty($action)) return '';
    global $huoniaoTag;
    global $dsql;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $userLogin;
    $userid = $userLogin->getMemberID();
    global $cfg_returnPoint_tuan;

    if($action=="index"){  // 无需额外处理

    }

    elseif($action=="list"){
        $huoniaoTag->assign('typeid', $typeid);
    }

    elseif($action=="detail"){  // 商品详情

        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
        }
        return;

    }
    elseif($action=="store" || $action=="storeDetail"){  // 商家详情

		global $template;

        $detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle($uid);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
            }
        }else{
            if($template != 'config'){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

                die;
			}
        }
        return;
    }
    elseif($action=="confirm"){
        $type = $_GET['type'];
        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        $huoniaoTag->assign("id",$id);
        $huoniaoTag->assign("type",$type);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
                $errmsg = "";
                if($type=="pai"){
                    $archives = $dsql->SetQuery("select o.success_num,o.orderstate,l.jy_type from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` where proid=$id and userid=$userid and paistate=2");
                    $arr = $dsql->getArr($archives);
                    if(empty($arr) || empty($arr['success_num'])){
                        $errmsg = "您还未竞拍成功，不可下单！";
                        $huoniaoTag->assign("errmsg",$errmsg);
                        return;
                    }
                    if($arr['orderstate']==5){
                        $errmsg = "存在同类成功订单，不可再次下单！";
                        $huoniaoTag->assign("errmsg",$errmsg);
                        return;
                    }
                    $success_num = $arr['success_num'];
                    // 查询竞拍时的单价（用户竞拍最高价格即是正确价格）
                    $sql = $dsql->SetQuery("select price_avg from `#@__paimai_order_record` where `pid`=$id and `uid`=$userid order by price_avg desc limit 1");
                    $price_avg = (int)$dsql->getOne($sql);
                    $price = $success_num * $price_avg;  // 应该支付的金额
                    $huoniaoTag->assign("totalMoney",$price);
                }
                $huoniaoTag->assign("errmsg",$errmsg);
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
        }
        return;
    }
    elseif($action=="buy"){
        // buy，下单详情页
        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        $huoniaoTag->assign("id",$id);
        $huoniaoTag->assign("type",$type);
        $huoniaoTag->assign("num",$num);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
                $errmsg = "";
                if($type=="regist"){
                    $huoniaoTag->assign("totalMoney",$num*$detailConfig['amount']);
                }elseif($type=="pai"){
                    $archives = $dsql->SetQuery("select o.success_num,o.orderstate,l.jy_type from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` where proid=$id and userid=$userid and paistate=2");
                    $arr = $dsql->getArr($archives);
                    if(empty($arr) || empty($arr['success_num'])){
                        $errmsg = "您还未竞拍成功，不可下单！";
                        $huoniaoTag->assign("errmsg",$errmsg);
                        return;
                    }
                    if($arr['orderstate']==5){
                        $errmsg = "存在同类成功订单，不可再次下单！";
                        $huoniaoTag->assign("errmsg",$errmsg);
                        return;
                    }
                    $success_num = $arr['success_num'];
                    // 查询竞拍时的单价（用户竞拍最高价格即是正确价格）
                    $sql = $dsql->SetQuery("select price_avg from `#@__paimai_order_record` where `pid`=$id and `uid`=$userid order by price_avg desc limit 1");
                    $price_avg = (int)$dsql->getOne($sql);
                    $price = $success_num * $price_avg;  // 应该支付的金额
                    $huoniaoTag->assign("totalMoney",$price);
                }
                $huoniaoTag->assign("errmsg",$errmsg);
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
        }
        return;
    }
    elseif($action=="payreturn"){
        // //根据支付订单号查询支付结果（如果金额为0，则不应该执行此操作，余额支付时也不应该，另外应该直接返回订单详情页，而不要展示payReturn）
        global $userLogin;
        $userid = $userLogin->getMemberID();

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }
        if(!empty($ordernum)){
            //根据支付订单号查询支付结果
            $archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'paimai' AND `ordernum` = '$ordernum' AND `uid` = $userid");
            $payDetail  = $dsql->dsqlOper($archives, "results");
            if($payDetail){

            }else{
                //支付订单不存在
                header("location:".$cfg_secureAccess.$cfg_basehost);
                die;
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost);
            die;
        }
    }



    if(empty($smarty)) return;
    global $template;

    if(!isset($return))
        $return = 'row'; //返回的变量数组名

    //注册一个block的索引，照顾smarty的版本
    if(method_exists($smarty, 'get_template_vars')){
        $_bindex = $smarty->get_template_vars('_bindex');
    }else{
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if(!$_bindex){
        $_bindex = array();
    }

    if($return){
        if(!isset($_bindex[$return])){
            $_bindex[$return] = 1;
        }else{
            $_bindex[$return] ++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

    //对象$smarty上注册一个数组以供block使用
    if(!isset($smarty->block_data)){
        $smarty->block_data = array();
    }

    //得一个本区块的专属数据存储空间
    $dataindex = md5(__FUNCTION__.md5(serialize($params)));
    $dataindex = substr($dataindex, 0, 16);

    //使用$smarty->block_data[$dataindex]来存储
    if(!$smarty->block_data[$dataindex]){
        //取得指定动作名
        $moduleHandels = new handlers($service, $action);

        //获取分类
        if($action == "type" || $action == "addr" || $action == "hotype" || $action == "hotCircle" || $action == "circle"){
            $params['type']     = $type;
            $params['page']     = $page;
            $params['pageSize'] = $pageSize;
            $params['son']      = '0';

            //信息列表
        }elseif($action == "tlist"){
            //如果是列表页面，则获取地址栏传过来的typeid
            if($template == "list" && !$typeid){
                global $typeid;
                $params['typeid']   = $typeid;
            }

        }

        $moduleReturn  = $moduleHandels->getHandle($params);

        //只返回数据统计信息
        if($pageData == 1){
            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
                $pageInfo_ = array("totalCount" => 0);
            }else{
                $moduleReturn  = $moduleReturn['info'];  //返回数据
                $pageInfo_ = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

            //正常返回
        }else{
            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';

            $moduleReturn  = $moduleReturn['info'];  //返回数据

            $pageInfo_ = $moduleReturn['pageInfo'];
            if($pageInfo_){

                //如果有分页数据则提取list键
                $moduleReturn  = $moduleReturn['list'];

                //把pageInfo定义为global变量
                global $pageInfo;
                $pageInfo = $pageInfo_;
                $smarty->assign('pageInfo', $pageInfo);
            }

            $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据
        }
    }

    //果没有数据，直接返回null,不必再执行了
    if(!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if(list($key, $item) = each($smarty->block_data[$dataindex])){
        $smarty->assign($return, $item);
        $repeat = true;
    }

    //如果已经到达最后，重置数组指针，重复执行开关置位0
    if(!$item) {
        reset($smarty->block_data[$dataindex]);
        $repeat = false;
    }

    //打印内容
    print $content;

}