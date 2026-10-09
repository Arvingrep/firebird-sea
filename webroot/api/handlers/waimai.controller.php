<?php

/**
 * huoniaoTag模板标签函数插件-外卖模块
 *
 * @param $params array 参数集
 * @return array
 */
function waimai($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract($params);
    $service = "waimai";
    global $template;
    if(empty($action)) return '';

    global $huoniaoTag;
    global $dsql;
    global $userLogin;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $do;

    global $cfg_agreeProtocol;
    $huoniaoTag->assign('cfg_agreeProtocol', (int)$cfg_agreeProtocol);

    $userid = $userLogin->getMemberID();
    $userinfo = $userLogin->getMemberInfo();
    // echo $userid;
    // die;
    $furl = urlencode(''.$cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);

    /*查询通用券 首页推荐*/
//    $universalsql = $dsql->SetQuery("SELECT `money`,`id`,`limit` FROM `#@__waimai_quan` WHERE `shoptype` = 0 AND `recommend` = 1 AND `sent` !=0 ORDER BY `money` DESC limit 0,3");
//
//    $universalres = $dsql->dsqlOper($universalsql,"results");
//
//    $waimaituijianarr = array();
//    $is_show = 0;
//    if(is_array($universalres) && $universalres) {
//        foreach ($universalres as $k => $v) {
//            $waimaituijianarr[$k]['money'] = $v['money'];
//            $waimaituijianarr[$k]['id']    = $v['id'];
//
//            $myquansql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `id` = " . $v['id']." AND `userid` = ".$userid);
//            $myquanres = $dsql->dsqlOper($myquansql, "totalCount");
//
//            $myis_lingqu  = 0;
//            if($v['limit']<= $myquanres){
//                $myis_lingqu = 1;
//                $is_show+=1;
//
//            }
//
//
//            $waimaituijianarr[$k]['myis_lingqu']    = $myis_lingqu;
//            $waimaituijianarr[$k]['is_show']        = $is_show;
//
//
//        }
//    }
//    if($userid <0){
//        $is_show = 1;
//    }
//    $huoniaoTag->assign('is_show',$is_show);
//    $huoniaoTag->assign('waimaituijianquan', $waimaituijianarr ? $waimaituijianarr : array());

    if($do == "courier" && $action != "login"){
        $did  = GetCookie("courier"); /*骑手id*/
        $coursql = $dsql->SetQuery("SELECT `status` FROM `#@__waimai_courier` WHERE `id` = '$did'");
        $courres = $dsql->dsqlOper($coursql,"results");

        if($courres){
            if($courres[0]['status'] ==0){
                DropCookie("courier");
                header("location:/?service=waimai&do=courier&template=login");
                die;
            }
        }
    }

    //配送版登录
    if($do == "courier" && $action == "login"){
        if(checkCourierAccount() > -1){
            header("location:/?service=waimai&do=courier&template=index");
            die;
        }
        return;
    }


    //配送版退出
    if($do == "courier" && $action == "logout"){
        DropCookie("courier");
        header("location:/?service=waimai&do=courier&template=login");
        die;
    }


    //配送员订单详情
    if($do == "courier" && $action == "detail"){

        $id = (int)$id;
        $did = checkCourierAccount();
        global $customIsopencode;
        $huoniaoTag->assign('customIsopencode', $customIsopencode);
        if($did == -1){
            header("location:/?service=waimai&do=courier&template=login");
            die;
        }
        $ordertype = empty($ordertype) ? "waimai" : $ordertype;
        if($ordertype == "waimai"){
            $sub = new SubTable('waimai_order', '#@__waimai_order');
            $table = $sub->getSubTableById($id);

        }else{
            $table = '#@__'.$ordertype."_order";
        }

        //获取订单信息
        if($ordertype == "paotui"){
            $detailHandels = new handlers($service, "orderPaotuiDetail");
        }elseif($ordertype == "shop"){
            $detailHandels = new handlers('shop', "orderDetail");
        }else{
            $detailHandels = new handlers($service, "orderDetail");
        }
        $detailConfig  = $detailHandels->getHandle(array("id" => $id));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                if($detailConfig['peisongid'] && $detailConfig['peisongid'] != $did){
                    header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
                }

                //更新订单信息的推送状态为已查看
                $sql = $dsql->SetQuery("UPDATE `".$table."` SET `courier_pushed` = 1 WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }

            }else{
                header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=2");
            }



        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=3");
        }
        $huoniaoTag->assign("ordertype", $ordertype);

        return;

    }

    /*配送员信息*/
    if($do == "courier" && $action == "setting"){
        global $dsql;
        $did = checkCourierAccount();

        if($did == -1){
            header("location:/?service=waimai&do=courier&template=login");
            die;
        }

        $didsql = $dsql->SetQuery("SELECT * FROM `#@__waimai_courier` WHERE `id` = ".$did." AND `status` = 1");

        $didres = $dsql->dsqlOper($didsql,"results");

        if(!$didres){
            header("location:/?service=waimai&do=courier&template=login");
            die;
        }else{
            foreach ($didres[0] as $key => $value) {

                if ($key == 'photo') {
                    $value = getFilePath($value);
                }
                $huoniaoTag->assign('courier_'.$key, $value);
            }
        }

        global $cfg_miniProgramAppid;
        global $cfg_miniProgramId;
        global $cfg_cancellation_state;
        $huoniaoTag->assign("miniProgramAppid", $cfg_miniProgramAppid);
        $huoniaoTag->assign("miniProgramId", $cfg_miniProgramId);
        //注销账户显示开关
        $huoniaoTag->assign('cfg_cancellation_state', $cfg_cancellation_state);

    }


    //优惠推荐配置信息输出
    $inc = HUONIAOINC . "/config/waimai.inc.php";
    include $inc;
    $huoniaoTag->assign("customSaleState", (int)$customSaleState);
    $huoniaoTag->assign("customSaleTitle", $customSaleTitle ? $customSaleTitle : '优惠推荐');
    $huoniaoTag->assign("customSaleSubTitle", $customSaleSubTitle ? $customSaleSubTitle : '0元外卖限量抢~');



    //首页
    if($action == "index" || ($action == "comment" AND $do == "courier") || $action == "statistics" || $action == "statisticsHistory" || $action == 'map' || $action == 'mypocket'){
        global $installModuleArr;

        global $customIsopenqd;
        global $customIsopencode;
        $huoniaoTag->assign("customIsopenqd", $customIsopenqd);
        /*跑腿 验证取货码开关*/
        $huoniaoTag->assign("customIsopencode", $customIsopencode);

        $huoniaoTag->assign("installModuleArr", $installModuleArr);
        if($action == 'map'){
            return ;
        }
        if($action == "index"){
            $local = empty($local) ? "auto" : $local;
            $huoniaoTag->assign("local", $local);
        }

        $ordertype = empty($ordertype) ? "waimai" : $ordertype;

        //配送版需要验证是否登录
        if($do == "courier"){

            $userid = checkCourierAccount();

            if($userid == -1){
                header("location:/?service=waimai&do=courier&template=login");
                die;
            }
            $state = $_GET['state'] ? $_GET['state'] : "3";
            $huoniaoTag->assign("state", $state);
            $huoniaoTag->assign("userid", $userid);
            $huoniaoTag->assign("ordertype", $ordertype);

            $sql = $dsql->SetQuery("SELECT `state`,`name`,`money`,`quit`,`photo` FROM `#@__waimai_courier` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $huoniaoTag->assign("courier_state", $ret[0]['state']);
                $huoniaoTag->assign("money", $ret[0]['money']);
            }
            $couriername = $ret ? $ret[0]['name'] : '';
            $couriequit  = $ret ? $ret[0]['quit'] : 0;
            $photo       = $ret ? getFilePath($ret[0]['photo']) : '';
            //统计
            if($action == "statistics"){

                $stime = GetMkTime(date("Y-m-d") . " 00:00:00");
                $etime = GetMkTime(date("Y-m-d") . " 23:59:59");

                //成功
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $success = $ret[0]['total'];

                //收入（计算配送费）
                $amount = 0;
                $sql = $dsql->SetQuery("SELECT `priceinfo`,`courier_get` FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND (`refrundstate` = 0 OR (`refrundstate` = 1 AND `refrundamount` > 0)) AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $key => $value) {
                        $courier_get     = $value['courier_get'];
                        $courier_tuikuan = $value['courier_tuikuan'];
                        $value       = unserialize($value['priceinfo']);
                        if (is_array($value) && $courier_get == 0.00) {
                            foreach ($value as $k => $v) {
                                if ($v['type'] == 'peisong') {
                                    $amount += $v['amount'];
                                }
                            }
                        } else {
                            $amount += $courier_get;
                        }
//                        $value = unserialize($value['priceinfo']);
//                        if(is_array($value)){
//                            foreach ($value as $k => $v) {
//                                if($v['type'] == 'peisong'){
//                                    $amount += $v['amount'];
//                                }
//                            }
//                        }
//                        $amount += $value['courier_get'];

                        $amount -= $courier_tuikuan;
                    }
                }

                //失败
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND (`state` = 6 OR `state` = 7) AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $failed = $ret[0]['total'];

                //配送费
                // $peisong = 0;
                // $sql = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__waimai_order` WHERE `peisongid` = $userid AND `state` = 1 AND `pubdate` >= $stime AND `pubdate` <= $etime");
                // $ret = $dsql->dsqlOper($sql, "results");
                // if($ret){
                // 	foreach ($ret as $key => $value) {
                // 		$priceinfo = unserialize($value['priceinfo']);
                // 		foreach ($priceinfo as $k_ => $v_) {
                // 			if($v_['type'] == "peisong"){
                // 				$peisong += $v_['amount'];
                // 			}
                // 		}
                // 	}
                // }

                //收款（货到付款）
                $sql = $dsql->SetQuery("SELECT sum(`amount`) amount FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND `peisongid` = $userid AND `state` = 1 AND (`refrundstate` = 0 OR (`refrundstate` = 1 AND `refrundamount` > 0)) AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $peisong = $ret[0]['amount'];

                $huoniaoTag->assign('success', (int)$success);
                $huoniaoTag->assign('amount', sprintf("%.2f", $amount));
                $huoniaoTag->assign('failed', (int)$failed);
                $huoniaoTag->assign('peisong', sprintf("%.2f", $peisong));

                // 跑腿统计
                //成功、收入
                $sql = $dsql->SetQuery("SELECT `amount`,`courier_get`,`courier_tuikuan` FROM `#@__paotui_order` WHERE `peisongid` = $userid AND `state` = 1 AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $paotui_success = count($ret);
                $paotui_amount  = 0;

                if($ret){
                    foreach ($ret as $key => $value) {
                        $courier_get     = $value['courier_get'];
                        $courier_tuikuan = $value['courier_tuikuan'];
                        if ( $courier_get == 0.00) {
                            $paotui_amount += $value['amount'];
                        } else {
                            $paotui_amount += $courier_get;
                        }
                        //                        $value = unserialize($value['priceinfo']);
                        //                        if(is_array($value)){
                        //                            foreach ($value as $k => $v) {
                        //                                if($v['type'] == 'peisong'){
                        //                                    $amount += $v['amount'];
                        //                                }
                        //                            }
                        //                        }
                        //                        $amount += $value['courier_get'];
                        $paotui_amount -= $courier_tuikuan;
                    }
                }

                //失败
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `peisongid` = $userid AND (`state` = 6 OR `state` = 7) AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $paotui_failed = $ret[0]['total'];

                $huoniaoTag->assign('paotui_success', (int)$paotui_success);
                $huoniaoTag->assign('paotui_amount', sprintf("%.2f", $paotui_amount));
                $huoniaoTag->assign('paotui_failed', (int)$paotui_failed);


                //商城统计
                //成功、收入
                $sql = $dsql->SetQuery("SELECT count(`id`) total, sum(`qsamount`) amount FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime AND `songdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $success = $ret[0]['total'];
                $amount = $ret[0]['amount'];

                //失败
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 7 AND `songdate` >= $stime AND `songdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $failed = $ret[0]['total'];

                //收款（货到付款）
                $sql = $dsql->SetQuery("SELECT sum(`amount`) amount FROM `#@__shop_order` WHERE `paytype` = 'delivery' AND `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime AND `songdate` <= $etime");
                $ret = $dsql->dsqlOper($sql, "results");
                $peisong = $ret[0]['amount'];

                $huoniaoTag->assign('shop_success', (int)$success);
                $huoniaoTag->assign('shop_amount', sprintf("%.2f", $amount));
                $huoniaoTag->assign('shop_failed', (int)$failed);
                $huoniaoTag->assign('shop_peisong', sprintf("%.2f", $peisong));


                /*本月收入*/

                $yuebgtime  = GetMkTime(date("Y-m-01").' 00:00:00');
                $yueendtime = GetMkTime(time());

//                $sql = $dsql->SetQuery("SELECT SUM(`courier_get`) yuebgsum FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND `pubdate` >= $stime AND `pubdate` <= $etime");
                $sql = $dsql->SetQuery("SELECT `priceinfo`,`courier_get` FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND (`refrundstate` = 0 OR (`refrundstate` = 1 AND `refrundamount` > 0)) AND `okdate` >= $yuebgtime AND `okdate` <= $yueendtime");
                $res = $dsql->dsqlOper($sql,"results");
                $yuebgsum = 0;

                if ($res) {
                    foreach ($res as $key => $value) {
                        $courier_get     = $value['courier_get'];
                        $courier_tuikuan = $value['courier_tuikuan'];
                        $value       = unserialize($value['priceinfo']);
                        if (is_array($value) && $courier_get == 0.00 && $courier_tuikuan == 0.00) {
                            foreach ($value as $k => $v) {
                                if ($v['type'] == 'peisong') {
                                    $yuebgsum += $v['amount'];
                                }
                            }
                        } else {
                            $yuebgsum += $courier_get;
                        }

//                        $yuebgsum -= $courier_tuikuan;
                    }
                }

                $paotuiSql = $dsql->SetQuery("SELECT SUM(`courier_get`) paotuiget,SUM(`courier_tuikuan`) paotuituikuan FROM `#@__paotui_order` WHERE 1=1 AND `peisongid` = $userid AND `state` = 1 AND `okdate` >= $yuebgtime AND `okdate` <= $yueendtime");
                $paotuiRes = $dsql->dsqlOper($paotuiSql, "results");

                $paotuiget     = $paotuiRes ? $paotuiRes[0]['paotuiget'] : 0 ;

                $paotuituikuan = $paotuiRes ? $paotuiRes[0]['paotuituikuan'] : 0 ;

//                $paotuiget     =  $paotuiget - $paotuituikuan;

                $yuebgsum  += $paotuiget;
                $yuebgsum = sprintf("%.2f", $yuebgsum);

                /*总收入*/
                // $allshourusql = $dsql->SetQuery("SELECT SUM(`courier_get`) allshouru FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND (`refrundstate` = 0 OR (`refrundstate` = 1 AND `refrundamount` > 0))");
                // $allshourures = $dsql->dsqlOper($allshourusql,"results");

                /*跑腿*/
                // $allpaotuiSql = $dsql->SetQuery("SELECT SUM(`courier_get`) paotuiall,SUM(`courier_tuikuan`) paotuituikuanall FROM `#@__paotui_order`  WHERE `peisongid` = $userid AND `state` = 1");
                // $allpaotuiRes = $dsql->dsqlOper($allpaotuiSql, "results");
                // $paotuiall           = $paotuiRes ? $allpaotuiRes[0]['paotuiall'] : 0 ;
                // $paotuituikuanall    = $paotuiRes ? $allpaotuiRes[0]['paotuituikuanall'] : 0 ;

//                $allshouru    =  ($allshourures[0]['allshouru'] - $allshourures[0]['alltuikuan']) + $paotuiall - $paotuituikuanall;
                // $allshouru    =  $allshourures[0]['allshouru'] + $paotuiall ;

                //骑手总收入不再统计订单表，直接统计骑手的余额记录表
                $sql = $dsql->SetQuery("SELECT SUM(`amount`) allshouru FROM `#@__member_courier_money` WHERE `userid` = $userid AND `type` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                $allshouru    = sprintf("%.2f", $ret[0]['allshouru']);

                /*总接单量*/
                $alljiedansql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `peisongid` = $userid ");
                $alljiedanres = $dsql->dsqlOper($alljiedansql,"totalCount");
                $alljiedan    = (int)$alljiedanres;

                /*跑腿*/
                $paotuiSql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE 1=1 AND `peisongid` = $userid ");
                $paotuiRes = $dsql->dsqlOper($paotuiSql, "totalCount");

                $alljiedan += (int)$paotuiRes;

                /*总提现*/
                $allwithdrawsql = $dsql->SetQuery("SELECT SUM(`amount`) allwithdraw FROM `#@__member_withdraw` WHERE `usertype` = '1' AND `state` !=2 AND `uid` = '$userid'");
                $allwithdrawres = $dsql->dsqlOper($allwithdrawsql,"results");
                $allwithdraw    = sprintf("%.2f", $allwithdrawres[0]['allwithdraw']);

                $huoniaoTag->assign('yuebgsum', $yuebgsum);
                $huoniaoTag->assign('allshouru', $allshouru);
                $huoniaoTag->assign('alljiedan', (int)$alljiedan);
                $huoniaoTag->assign('allwithdraw', $allwithdraw);
            }
            //统计历史
//			if($action == "statisticsHistory"){
//
//				$stime_ = strtotime($stime);
//				$etime_ = strtotime($etime);
//
//				//商城统计
//				if($ordertype == 'shop'){
//
//					//成功、收入
//					$sql = $dsql->SetQuery("SELECT count(`id`) total, sum(`amount`) amount FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime_ AND `songdate` <= $etime_");
//					$ret = $dsql->dsqlOper($sql, "results");
//					$success = $ret[0]['total'];
//					$amount = $ret[0]['amount'];
//
//					//失败
//					$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 7 AND `songdate` >= $stime_ AND `songdate` <= $etime_");
//					$ret = $dsql->dsqlOper($sql, "results");
//					$failed = $ret[0]['total'];
//
//					//收款（货到付款）
//					$sql = $dsql->SetQuery("SELECT sum(`amount`) amount FROM `#@__shop_order` WHERE `paytype` = 'delivery' AND `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime_ AND `songdate` <= $etime_");
//					$ret = $dsql->dsqlOper($sql, "results");
//					$peisong = $ret[0]['amount'];
//
//					$huoniaoTag->assign('totalSuccess', (int)$success);
//					$huoniaoTag->assign('success', sprintf("%.2f", $amount));
//					$huoniaoTag->assign('totalFailed', (int)$failed);
//					$huoniaoTag->assign('peisong', sprintf("%.2f", $peisong));
//
//
//				//外卖、跑腿
//				}else{
//					if(empty($ordertype) || $ordertype != "paotui"){
//						$dbname = "waimai_order_all";
//					}else{
//						$dbname = "paotui_order";
//					}
//
//		            //$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__$dbname` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $totalSuccess = $dsql->dsqlOper($sql, "results");
//
//		            //$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__$dbname` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $totalFailed = $dsql->dsqlOper($sql, "results");
//
//		            //$sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__$dbname` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $success = $dsql->dsqlOper($sql, "results");
//
//		            //$sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order` WHERE `state` = 1 AND `paytype` = 'delivery' AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__$dbname` WHERE `state` = 1 AND `paytype` = 'delivery' AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $delivery = $dsql->dsqlOper($sql, "results");
//
//		            //$sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order` WHERE `state` = 1 AND `paytype` = 'money' AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__$dbname` WHERE `state` = 1 AND `paytype` = 'money' AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $money = $dsql->dsqlOper($sql, "results");
//
//		            //$sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order` WHERE `state` = 1 AND (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__$dbname` WHERE `state` = 1 AND (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            $online = $dsql->dsqlOper($sql, "results");
//
//		            $peisong = $fuwu = 0;
//		            //$sql = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__waimai_order` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//		            if($dbname == "waimai_order_all"){
//			            $sql = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__$dbname` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//			            $ret = $dsql->dsqlOper($sql, "results");
//			            if($ret){
//			                foreach ($ret as $k => $v) {
//			                    $priceinfo = empty($v['priceinfo']) ? array() : unserialize($v['priceinfo']);
//			                    foreach ($priceinfo as $k_ => $v_) {
//			                        if($v_['type'] == "peisong"){
//			                            $peisong += $v_['amount'];
//			                        }
//			                        if($v_['type'] == "fuwu"){
//			                            $fuwu += $v_['amount'];
//			                        }
//			                    }
//			                }
//			            }
//			        }else{
//			        	$sql = $dsql->SetQuery("SELECT SUM(`freight`) total FROM `#@__$dbname` WHERE `state` = 1 AND `pubdate` >= $stime_ AND `pubdate` <= $etime_ AND `peisongid` = " . $userid);
//			        	$peisong = $dsql->dsqlOper($sql, "results");
//			        	$peisong = $peisong[0]['total'];
//			        }
//
//					$huoniaoTag->assign('totalSuccess', (int)$totalSuccess[0]['total']);
//					$huoniaoTag->assign('totalFailed', (int)$totalFailed[0]['total']);
//					$huoniaoTag->assign('success', sprintf("%.2f", $success[0]['total']));
//					$huoniaoTag->assign('delivery', sprintf("%.2f", $delivery[0]['total']));
//					$huoniaoTag->assign('money', sprintf("%.2f", $money[0]['total']));
//					$huoniaoTag->assign('online', sprintf("%.2f", $online[0]['total']));
//					$huoniaoTag->assign('peisong', sprintf("%.2f", $peisong));
//					$huoniaoTag->assign('fuwu', sprintf("%.2f", $fuwu));
//				}
//
            $huoniaoTag->assign('stime', $stime);
            $huoniaoTag->assign('etime', $etime);
//
//			}

            $arc = $dsql->SetQuery("SELECT avg(`starps`) r FROM `#@__waimai_common` WHERE `peisongid` = $userid");
            // $arc = $dsql->SetQuery("SELECT avg(`starps`) r FROM `#@__public_comment_all` WHERE `peisongid` = '$userid'");
            $ret = $dsql->dsqlOper($arc, "results");
            $countallsql = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__waimai_common` WHERE `peisongid` = '$userid'");
            $countallres = $dsql->dsqlOper($countallsql, "results");

            $commentall    = $countallres ? $countallres[0]['countall'] : 0 ;
            if($ret){
                $rating = $ret[0]['r'];		//总评分
                $star = number_format($rating, 1);
            }else{
                $star = 0;
            }
            $huoniaoTag->assign("courier_star", $star);
            $huoniaoTag->assign("courier_name", $couriername);
            $huoniaoTag->assign("courier_photo", $photo);
            $huoniaoTag->assign("courier_quit", $couriequit);
            $huoniaoTag->assign("courier_commentall", $commentall);

            $huoniaoTag->assign("ordertype", $ordertype);

        }else{

            //店铺分类
            $typeArr = array();
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_type` WHERE `paotui` = 0 ORDER BY `sort` DESC, `id` DESC");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $key => $value) {
                    $typeArr[$key]['id'] = $value['id'];
                    $typeArr[$key]['title'] = $value['title'];
                }
            }
            $huoniaoTag->assign('typeArr', $typeArr);

            $sql = $dsql->SetQuery("SELECT `title`, `description`, `tel`, `share_pic`, `index_banner`, `tubiao_nav`, `ad1`, `huodong_nav`, `shop` FROM `#@__waimai_system` LIMIT 0, 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];

                $huoniaoTag->assign('title', $data['title']);
                $huoniaoTag->assign('description', $data['description']);
                $huoniaoTag->assign('tel', $data['tel']);
                $huoniaoTag->assign('share_pic', $data['share_pic'] ? getFilePath($data['share_pic']) : '');
                $huoniaoTag->assign('shop', $data['shop']);

                $bannerArr = array();
                $banner = $data['index_banner'];
                if(!empty($banner)){
                    $banner = explode(",", $banner);
                    foreach($banner as $key => $val){
                        $info = explode("##", $val);
                        array_push($bannerArr, array(
                            "pic"   => getFilePath($info[0]),
                            "title" => $info[1],
                            "link"  => $info[2]
                        ));
                    }
                }
                $huoniaoTag->assign('banner', $bannerArr);

                $tubiaoArr = array();
                $tubiao = $data['tubiao_nav'];
                if(!empty($tubiao)){
                    $tubiao = explode(",", $tubiao);
                    foreach($tubiao as $key => $val){
                        $info = explode("##", $val);
                        array_push($tubiaoArr, array(
                            "pic"   => getFilePath($info[0]),
                            "title" => $info[1],
                            "link"  => $info[2]
                        ));
                    }
                }
                $huoniaoTag->assign('tubiao', $tubiaoArr);

                $ad1Arr = array();
                $ad1 = $data['ad1'];
                if(!empty($ad1)){
                    $ad1 = explode(",", $ad1);
                    foreach($ad1 as $key => $val){
                        $info = explode("##", $val);
                        array_push($ad1Arr, array(
                            "pic"   => getFilePath($info[0]),
                            "title" => $info[1],
                            "link"  => $info[2]
                        ));
                    }
                }
                $huoniaoTag->assign('ad1', $ad1Arr);

                $huodongArr = array();
                $huodong = $data['huodong_nav'];
                if(!empty($huodong)){
                    $huodong = explode(",", $huodong);
                    foreach($huodong as $key => $val){
                        $info = explode("##", $val);
                        array_push($huodongArr, array(
                            "pic"   => getFilePath($info[0]),
                            "title" => $info[1],
                            "link"  => $info[2],
                            "desc"  => $info[3]
                        ));
                    }
                }
                $huoniaoTag->assign('huodong', $huodongArr);
            }

        }


        //店铺列表
    }elseif($action == "list" || $action == "slist"){

        $typeArr = array();
        $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_type` WHERE `paotui` = 0 ORDER BY `sort` DESC, `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {
                $typeArr[$key]['id'] = $value['id'];
                $typeArr[$key]['title'] = $value['title'];
            }
        }
        $huoniaoTag->assign('typeArr', $typeArr);

        $typeid = (int)$typeid;
        $typename = "全部分类";
        if($typeid){
            $sql = $dsql->SetQuery("SELECT `title`, `paotui` FROM `#@__waimai_shop_type` WHERE `id` = $typeid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $typename = $ret[0]['title'];
                $ispaotui = $ret[0]['paotui'];

                //跳到跑腿页面
                if($ispaotui){
                    $param = array(
                        "service"  => "waimai",
                        "template" => "paotui",
                        "param"    => "currentPageOpen=1"
                    );
                    $url = getUrlPath($param);
                    header('location:'.$url);
                    die;
                }
            }
        }
        $huoniaoTag->assign('typeid', $typeid);
        $huoniaoTag->assign('typename', $typename);

        if($action == "slist"){
            $huoniaoTag->assign('keywords', $keywords);
        }


        //商铺详细
    }elseif($action == "shop" || $action == "buy" || $action == "detail" || $action == "info" || $action == "range" || $action == "photo" || $action == "cart" || $action == "confirm" || $action == "address"){
        global $customZsbxy;
        global $customHyxy;
        global $langData;
        $totalPrice = 0;
        $cartArr = array();
        $huoniaoTag->assign("ispay", $ispay);
        $huoniaoTag->assign("addressid", $addressid);
        $huoniaoTag->assign("customHyxy", nl2br($customHyxy));
        $huoniaoTag->assign("customZsbxy", nl2br($customZsbxy));

        //代付开关
        include HUONIAOINC . '/config/waimai.inc.php';
        $huoniaoTag->assign('peerpayState', $custompeerpay);
        $huoniaoTag->assign('peerpay', (int)$peerpay);
        $huoniaoTag->assign('otherpeisong', (int)$custom_otherpeisong);

        //验证是否已经登录
        if(($action == "confirm" || $action == "cart" || $action == "address") && $userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        $huoniaoTag->assign("keywords", $keywords);
        //验证是否为首单
        include(HUONIAOROOT . "/include/config/waimai.inc.php");
        $where = $custom_firstOrderType == 0 ? "`uid` = $userid AND `state` != 0 AND `state` != 6" : "`uid` = $userid AND `sid` = $id AND `state` != 0 AND `state` != 6";

        $firstOrder = 1;
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE ".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $firstOrder = 0;
        }
        $huoniaoTag->assign("firstOrder", $firstOrder);


        $delivery = 0;
        $bsql = $dsql->SetQuery("SELECT `paytype`, `offline_limit`, `pay_offline_limit`,`shopname`,`shop_banner`,`instorestatus`,`wmstorestatus`,`underpay` FROM `#@__waimai_shop` WHERE `id` = $id");
        $bret = $dsql->dsqlOper($bsql, "results");
        $bret = $bret[0];
        // if($bret){

        // 	$delivery = 1;
        // 	if(strstr($bret['paytype'], "1") === false || ($bret['offline_limit'] && $amount > $bret['pay_offline_limit'])){
        // 		$delivery = 0;
        // 	}
        // }
        $huoniaoTag->assign("bret", $bret);

        if($bret['instorestatus'] ==1){/*是否开启店内点餐*/
            if($desk){
                $huoniaoTag->assign("desk", $desk);
                $shopin = 1;
                if(!isMobile()){
                    $param = array(
                        "service"  => "waimai"
                    );
                    $url = getUrlPath($param);
                    die(showMsg($langData['waimai'][9][18], $url, 1, 0, 1));
                }

            }elseif($bret['wmstorestatus']==0){
                $shopin = 0;
                $param = array(
                    "service"  => "waimai"
                );
                $url = getUrlPath($param);
                die(showMsg($langData['waimai'][9][6], $url, 1, 0, 1));
                die;
            }
        }else{
            $shopin = 0;
            if($bret['wmstorestatus']==0){
                $param = array(
                    "service"  => "waimai"
                );
                $url = getUrlPath($param);
                die(showMsg($langData['waimai'][9][19], $url, 1, 0, 1));
                die;
            }
        }
        $huoniaoTag->assign("shopin", $shopin);
        //验证订单是否包含会员价格
        //查找折扣商品
        $zksql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list` WHERE  `is_discount` = 1 AND `del` = 0  AND`sid` = ".$id);
        $zkre  = $dsql->dsqlOper($zksql,"results");

        // echo "<pre>";
        // var_dump($zkre);die;
        $huoniaoTag->assign("zkre", $zkre);

        // 购物车页面读取购物车信息
        $needInsertTab = false;
        // if($action == "cart"){

        $tsql = $dsql->SetQuery("SELECT * FROM `#@__waimai_order_temp` WHERE `sid` = $id AND `uid` = $userid");
        $tret = $dsql->dsqlOper($tsql, "results");
        if($tret){
            $info = $tret[0];
            $paytype = $info['paytype'];
            $note = $info['note'];
            $paypwd = $info['paypwd'];
            $quan = $quan != '' ? $quan : $info['quanid'];
            $presetData = json_decode($info['preset'], true);

            $huoniaoTag->assign("paypwd", $paypwd);
            $huoniaoTag->assign("presetData", $presetData);
        }
        // 会员特权
        $privilege = [];
        $today_amount = 0;
        $day = date('md');
        $userinfo = $userLogin->getMemberInfo();

        if($userinfo['level']){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__member_level` WHERE `id` = ".$userinfo['level']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $privilege         = unserialize($ret[0]['privilege']);
                // if($privilege){
                // 	// foreach ($privilege as $key => $value) {}

                // 	// 生日当天享受折扣需要判断当天订单总金额
                // 	if(!empty($userinfo['birthday']) && $day == date("md", $userinfo['birthday']) && $privilege['birthday']['type'] && $privilege['birthday']['val']['discount'] > 0 && $privilege['birthday']['val']['discount'] < 10 && $privilege['birthday']['val']['limit']){
                // 		$today_amount = todayOrderAmount($userid);
                // 	}
                // }
            }
        }
        $huoniaoTag->assign('privilege', $privilege);
        $huoniaoTag->assign('userphone', $userinfo['phone']);


        //获取用户的第一条地址信息
        $juli = $address_id = $address_lng = $address_lat = 0;
        $address_person = $address_areaCode = $address_tel = $address_street = $address_address = "";


        //指定收货地址
        if($address){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `id` = ".$address);
            $ret = $dsql->dsqlOper($sql, "results");

        }else{

            //获取默认地址
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `def` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){


            //没有默认地址，获取距离最近的位置
            }else{
                $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid ORDER BY `id`");

                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    // 读取用户位置信息,取距离最近的地址
                    $userAddr = GetCookie("waimai_useraddr");
                    // var_dump($userAddr);die;
                    // $userAddr = GetCookie("waimai_local");
                    if($userAddr){
                        $userAddr = explode(",", $userAddr);
                        $mid = 0;
                        $juliInit = 9999999999999999;
                        $ret_ = $ret;
                        foreach ($ret_ as $key => $value) {
                            $juli_ = getDistance($value['lng'], $value['lat'], $userAddr[1], $userAddr[0]);
                            if($juli_ < $juliInit){
                                $juliInit = $juli_;
                                $ret = array($value);
                                $address = $value['id'];
                            }
                        }
                    }
                }
            }

        }
        $huoniaoTag->assign("note", $note);
        $huoniaoTag->assign("paytype", $paytype);
        $huoniaoTag->assign("quanid", (int)$quan);

        if($ret){
            $data = $ret[0];
            $address_id      = $data['id'];
            $address_person  = $data['person'];
            $address_tel     = $data['tel'];
            $address_areaCode = $data['areaCode'];
            $address_street  = $data['street'];
            $address_address = $data['address'];
            $address_lng     = $data['lng'];
            $address_lat     = $data['lat'];
        }
        $huoniaoTag->assign("cart_address_id", $address_id);
        $huoniaoTag->assign("cart_address_person", $address_person);
        $huoniaoTag->assign("cart_address_areaCode", $address_areaCode);
        $huoniaoTag->assign("cart_address_tel", $address_tel);
        $huoniaoTag->assign("cart_address_street", $address_street);
        $huoniaoTag->assign("cart_address_address", $address_address);

        if($action == "address"){
            $huoniaoTag->assign("address", (int)$address);
        }
        if($action == "quan"){
            $huoniaoTag->assign("quan", (int)$quan);
        }



        //验证是否已经收藏
        $params = array(
            "module" => "waimai",
            "temp"   => "shop",
            "type"   => "add",
            "id"     => $id,
            "check"  => 1
        );
        $collect = checkIsCollect($params);
        $collect = $collect == "has" ? 1 : 0;
        $huoniaoTag->assign('collect', $collect);



        //获取店铺信息
        $detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        //读取店铺所在分站配置，进行恶劣天气配送费的计算，预定的订单不考虑恶劣天气
        $shopDetail = $detailConfig['info'];
        $badWeatherPrice = 0;
        if ($shopDetail['yingye'] == 1) {
            $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $shopDetail['cityid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $configArr = $ret[0]['config'];
                if ($configArr != null) {
                    $configArr = unserialize($configArr);
    
                    //如果有外卖的配置
                    if (isset($configArr['waimai'])) {
                        $configArr = $configArr['waimai'];
                        //如果有开启恶劣天气配送
                        if (isset($configArr['badWeatherState']) && $configArr['badWeatherState'] == 1) {
                            $badWeatherMoney = (float)$configArr['badWeatherMoney'];
                            $badWeatherStart = $configArr['badWeatherStart'];
                            $badWeatherEnd = $configArr['badWeatherEnd'];
    
                            //如果配送费大于0，而且有时间范围
                            if ($badWeatherMoney > 0 && $badWeatherStart != null && $badWeatherEnd != null) {
                                //判断当前时间是否在时间范围内
                                $nowTime = time();
                                $startTime = strtotime($badWeatherStart);
                                $endTime = strtotime($badWeatherEnd);
    
                                if ($nowTime >= $startTime && $nowTime <= $endTime) {
                                    $badWeatherPrice = sprintf("%.2f", $badWeatherMoney);
                                }
                            }
                        }
                    }
                }
            }
        }
        $huoniaoTag->assign('badWeatherPrice', $badWeatherPrice);

        //查找折扣最低
        $zksql = $dsql->SetQuery("SELECT `is_discount`,`discount_value` FROM `#@__waimai_list` WHERE `is_discount` = 1 AND `sid`  = ".$id);

        $zkre  = $dsql->dsqlOper($zksql,"results");



        if (!empty($zkre)) {

            $zkarr = array_column($zkre, "discount_value");

            $minzk = min($zkarr);

        }else{

            $minzk = '0';

        }
        $huoniaoTag->assign('minzk', $minzk);



        //商品销量统计
        $psalle  = 0;
        // $porder = $dsql ->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `state` = 1  AND  `sid` = $id");
        $porder = $dsql ->SetQuery("SELECT count(`id`) as psalle FROM `#@__waimai_order_all` WHERE `state` = 1  AND  `sid` = $id");
        $pre 	= $dsql->dsqlOper($porder,"results");
        // if($pre){
        // 	foreach ($pre as $key => $value) {
        // 		$food = $value['food'];
        // 		$food = unserialize($food);
        // 		if(is_array($food)){
        // 			foreach ($food as $k_ => $v_) {
        // 				$psalle += (int)$v_['count'];
        // 			}
        // 		}
        // 	}
        // }

        $huoniaoTag->assign('psalle', $pre[0]['psalle']);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){

            global $customZsbspe;

            $detailConfig  = $detailConfig['info'];

//			echo "<pre>";
//			var_dump($detailConfig);die;
            if(is_array($detailConfig)){
                // var_dump($service, $detailConfig['id'], $detailConfig['cityid'], $action);die;
                detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action,$desk);
                //计算送餐地址与店铺间的距离
                if($address_id && $action == "cart"){

                    $custom_otherpeisong = (int)$custom_otherpeisong;
                    $peisong_type = (int)$detailConfig['peisong_type'];

                    if ($custom_otherpeisong != 0 && $peisong_type != 1) {

                        if ($custom_otherpeisong == 1) {
                            $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                        } elseif($custom_otherpeisong == 2){
                            $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                        }elseif($custom_otherpeisong == 3){
                            $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";

                        }
                        include $pluginFile;
                        if (file_exists($pluginFile)) {

                            if ($custom_otherpeisong == 1) {
                                $uuPaoTuiClass = new uuPaoTui();

                                $cityname = getCityname($detailConfig['coordY'], $detailConfig['coordX']);

                                if ($cityname == '') {
                                    echo '<script>alert("UU跑腿：未获取到城市名称"); window.history.go(-1);</script>';
                                    die;
                                }
                                $Calculatepricearr = array(
                                    'city_name'     => $cityname,
                                    'from_address'  => $detailConfig['address'],
                                    'from_usernote' => $detailConfig['shopname'],
                                    'from_lat'      => $detailConfig['coordX'],
                                    'from_lng'      => $detailConfig['coordY'],
                                    'to_address'    => $address_street,
                                    'to_usernote'   => $address_address,
                                    'to_lat'        => $address_lat,
                                    'to_lng'        => $address_lng,
                                );

                                $results = $uuPaoTuiClass->Calculateprice($Calculatepricearr);

                                if (is_array($results)) {
                                    $detailConfig['delivery_fee'] = $results['need_paymoney'];

                                } else {

//                                echo '<script>alert("UU跑腿：'.$results.'"); window.history.go(-1);</script>';
//                                die;
                                }
                            } elseif($custom_otherpeisong == 2){
                                $youshansudaClass = new youshansuda();

                                $paotuitype = (int)$detailConfig['paotuitype'];

                                $paramArray = array(
                                    'ysshop_id'         => $detailConfig['ysshop_id'],
                                    'to_name'           => $address_person,
                                    'to_phone'          => $address_tel,
                                    'to_address'        => $address_street,
                                    'to_detail_address' => $address_street,
                                    'to_lat'            => $address_lat,
                                    'to_lng'            => $address_lng
                                );

                                $results = $youshansudaClass->calculationFrei($paramArray);

                                if (is_array($results)) {

                                    $data = $results['freight_dict'];

                                    $freightarr = array();
                                    if (is_array($data) && $data) {

                                        foreach ($data as $k => $v) {


                                            $arr = array(
                                                'ps_id'    => $v['ps_id'],
                                                'ps_name'  => $v['ps_name'],
                                                'freight'  => $v['freight_data']['freight'],
                                                'distance' => $v['freight_data']['distance'],
                                            );

                                            array_push($freightarr,$arr);
                                        }
                                    }

                                    if ( $paotuitype == 0) {
                                        $delivery_fee = min(array_column($freightarr,'freight'));
                                    } else {
                                        $freightarr   = array_column($freightarr,NULL,'ps_id');

                                        $delivery_fee = $freightarr[$paotuitype]['freight'];
                                    }
                                    $detailConfig['delivery_fee'] = $delivery_fee;

                                } else {

                                        $param = array(
                                            "service" => 'waimai',
                                        );

                                        $url = getUrlPath($param);
                                        echo '<script>alert("优闪速达：'.$results.'"); window.location='.$url.';</script>';
                                        die;
                                }

                            }elseif ($custom_otherpeisong == 3){

                                global $custom_map;
                                $map_type = (int)$custom_map;

                                global $cfg_map;  //系统默认地图
                                $map_type = !$map_type ? $cfg_map : $map_type;
                                
                                if($map_type == 2 || $map_type == 'baidu'){
                                    $map_type = 2;
                                }
                                if($map_type == 4 || $map_type == 'amap'){
                                    $map_type = 1;
                                }
                                
                                $maiyatianClass = new maiyatian();
                                $paotuitype = (int)$detailConfig['paotuitype'];
                                $paramArray = array (
                                    'shop_dismode'   => $detailConfig['billingtype'],
                                    'shop_logistic'  => $detailConfig['specify'],
                                    'shop_id'        => $detailConfig['id'],
                                    'lng'            => $address_lng,
                                    'lat'            => $address_lat,
                                    'address'        => $address_street . ' ' . $address_address,
                                    'map_type'       => $map_type
                                );

                                $results = $maiyatianClass->calculationFrei($paramArray);
                                if (is_array($results) && $results['code'] == 1) {

                                    $data = $results['data']['detail'];
                                    $logisprice = $data[0]['amount'];        //  运费
                                    $detailConfig['delivery_fee'] = $logisprice;
                                }else{
                                    $param = array(
                                        "service" => 'waimai',
                                        "template" => 'shop',
                                        "id" => $detailConfig['id']
                                    );
                                    // $url = getUrlPath($param);
                                    echo '<script>alert("麦芽田：'.$results['message'].'"); window.history.go(-1);</script>';
                                    die;
                                }
                            }
                        }
                    }else {
                        $juli = getDistance($detailConfig['coordX'], $detailConfig['coordY'], $address_lat, $address_lng) / 1000;
//                        var_dump($juli);die;
                        //根据区域计算起送价和配送费
                        if ($detailConfig['delivery_fee_mode'] == 2) {

                            $prices = array();

                            //验证送货地址是否在商家的服务区域
                            $service_area_data = $detailConfig['service_area_data'];
                            if ($service_area_data) {
                                foreach ($service_area_data as $key => $value) {
                                    $qi     = $value['qisong'];
                                    $pei    = $value['peisong'];
                                    $points = $value['points'];

                                    $pointsArr = array();
                                    if (!empty($points)) {
                                        $points = explode("|", $points);
                                        foreach ($points as $k => $v) {
                                            $po = explode(",", $v);
                                            array_push($pointsArr, array("lng" => $po[0], "lat" => $po[1]));
                                        }

                                        if (is_point_in_polygon(array("lng" => $address_lng, "lat" => $address_lat), $pointsArr)) {
                                            array_push($prices, array("qisong" => $qi, "peisong" => $pei));
                                        }
                                    }

                                }

                            }

                            //如果送货地址在服务区域，则将起送价和配送费更改为按区域的价格
                            if ($prices) {
                                $detailConfig['basicprice']   = $prices[0]['qisong'];
                                $detailConfig['delivery_fee'] = $prices[0]['peisong'];

                                //如果不在服务区域，提醒用户
                            } else {

                                $detailConfig['delivery_radius'] = 0.0000001;
                            }

                        }
                        $delivery_gudingarr = array();
                        if ($detailConfig['delivery_fee_mode'] == 1) {
                            $attach_fee = 0;
                            if ($juli >= $detailConfig['normaljuli'] && $detailConfig['normaljuli'] != '0' && $detailConfig['normaljuli'] != '') {
                                $attach_fee = sprintf('%.2f',ceil($juli - $detailConfig['normaljuli']) * $detailConfig['chaochuprice']);
                                $delivery_gudingarr['delivery_fee']         = $detailConfig['delivery_fee'];
                                $delivery_gudingarr['deliveryattach_fee']   = $attach_fee;
                            }
                        }
                        $detailConfig['delivery_gudingarr'] = $delivery_gudingarr;
                    }

                }

                $open_zsb = $detailConfig['open_zsb'];
                if ($open_zsb ==1) {
                    $zsbspe = unserialize($detailConfig['zsbspe']);

                }else{
                    $zsbspe = unserialize($customZsbspe);
                }
                $huoniaoTag->assign('zsbspe', $zsbspe);
                //输出详细信息
                $quanSql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` ORDER BY `id` ASC");
                $resu = $dsql->dsqlOper($quanSql, "results");
                $quanlist = array_column($resu,'money','id');

                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
                $huoniaoTag->assign("juli", (float)$juli);
                $huoniaoTag->assign("quanlist", $quanlist);

                //查找订单中有没有包含开通会员相关的
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `is_vipprice` = 1 AND `uid` = $userid AND `state` = 0");
                $ret = $dsql->dsqlOper($sql, "results");
                if($userinfo['level'] == 0 && empty($ret)){
                    $levelsql = $dsql->SetQuery("SELECT * FROM `#@__member_level` ORDER BY `id` ASC");
                    $levelre = $dsql->dsqlOper($levelsql, "results");

                    $levle = $levelre[0];
                    $levle['cost']      = $levle['cost']!= '' ? unserialize($levle['cost']) :'';
                    $levle['privilege'] = $levle['privilege']!='' ? unserialize($levle['privilege']):'';
                    $levle['discount']  = $levle['discount']!=''?unserialize($levle['discount']):'';
                    // foreach ($$levle['privilege']['quan'] as $key => $value) {

                    // }
//					 echo "<pre>";
//					 var_dump($levle);die;
                    $huoniaoTag->assign('levle', $levle);

                }
                $huoniaoTag->assign('zsbspe', $zsbspe);
                //如果是商品详细页
                if($action == "detail"){
                    //获取店铺信息
                    $detailHandels = new handlers($service, "menuDetail");
                    $detailConfig  = $detailHandels->getHandle($fid);

                    if(is_array($detailConfig) && $detailConfig['state'] == 100){
                        $detailConfig  = $detailConfig['info'];
                        if(is_array($detailConfig)){
                            //输出详细信息
                            foreach ($detailConfig as $key => $value) {
                                $huoniaoTag->assign('food_'.$key, $value);
                            }
                        }
                    }
                }

            }


        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }

        return;


        //获取指定ID的商铺详细
    }elseif($action == "storeDetail"){

        $detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle($id);
        $state = 0;

        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
                $state = 1;

            }
        }
        $huoniaoTag->assign('storeState', $state);
        return;

        //获取指定ID的商铺评分
    }elseif($action == "comment"){

        if(empty($id) || !is_numeric($id)){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
            die;
        }

        $detailHandels = new handlers($service, "storeDetailStar");
        $detailConfig  = $detailHandels->getHandle($id);
        $state = 0;

        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
                $state = 1;

            }
        }

        // 店铺名
        $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $shopname = $ret[0]['shopname'];
        }

        //验证是否已经收藏
        $params = array(
            "module" => "waimai",
            "temp"   => "shop",
            "type"   => "add",
            "id"     => $id,
            "check"  => 1
        );
        $collect = checkIsCollect($params);
        $collect = $collect == "has" ? 1 : 0;

        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('storeState', $state);
        $huoniaoTag->assign('shopname', $shopname);
        $huoniaoTag->assign('collect', $collect);


        return;

        //订单支付
    }elseif($action == "pay"){

        global $userLogin;
        global $cfg_secureAccess;
        global $langData;
        $uid = $userLogin->getMemberID();

        if($userid == -1 && !$peerpay){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

//        $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'wxpay' AND `state` = 1");
//        $payment = $dsql->dsqlOper($archives, "results");
//
//        $isWxMiniprogram = isWxMiniprogram();
//        if($payment && !$app && !$isWxMiniprogram){
//            //①、获取用户openid
//            $paymentFile = HUONIAOROOT . "/api/payment/wxpay/wxpay.php";
//            require_once($paymentFile);
//            $pay = new wxpay();
//            $order['order_amount'] = 0;
//
//            $pay_config = unserialize($payment[0]['pay_config']);
//            $paymentArr = array();
//
//            //验证配置
//            foreach ($pay_config as $key => $value) {
//                if (!empty($value['value'])) {
//                    $paymentArr[$value['name']] = $value['value'];
//                }
//            }
//            $pay->get_code($order,$paymentArr,2,1);
//        }

        $ordertype = empty($ordertype) || $ordertype != "paotui" ? "waimai" : "paotui";

        //代付开关
        include HUONIAOINC . '/config/tuan.inc.php';
        $huoniaoTag->assign('peerpayState', $custompeerpay);
        $huoniaoTag->assign('peerpay', (int)$peerpay);

        if($ordertype == "waimai"){

            //获取订单内容
            if($peerpay){
                //代付不需要核实下单人
                $sql = $dsql->SetQuery("SELECT `id`, `sid`, `state`, `amount`,`food`,`pubdate`,`ordertype` FROM `#@__waimai_order_all` WHERE `ordernum` = '$ordernum'");
            }else{
                $sql = $dsql->SetQuery("SELECT `id`, `sid`, `state`, `amount`,`food`,`pubdate`,`ordertype` FROM `#@__waimai_order_all` WHERE `ordernum` = '$ordernum' AND `uid` = $uid");
            }
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $data   = $ret[0];
                $sid    = $data['sid'];
                $state  = $data['state'];
                $amount = $data['amount'];

                if($state != 0){
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => $ordertype,
                        "id"       => $data['id']
                    );
                    $url = getUrlPath($param);
                    header("location:".$url);
                    die;
                }

                $delivery = 0;
                $bsql = $dsql->SetQuery("SELECT `paytype`, `offline_limit`, `pay_offline_limit`,`shopname`,`shop_banner` FROM `#@__waimai_shop` WHERE `id` = $sid");
                $bret = $dsql->dsqlOper($bsql, "results");
                if($bret){
                    $bret = $bret[0];

                    $delivery = 1;
                    if(strstr($bret['paytype'], "1") === false || ($bret['paytype'] && $bret['offline_limit'] && $amount > $bret['pay_offline_limit'])){
                        $delivery = 0;
                    }
                }
                $huoniaoTag->assign("delivery", $delivery);
                $huoniaoTag->assign("orderdate", ($data['pubdate']+1800)-time());
                $food = unserialize($data['food'])	;
                foreach ($food as $k => $v) {
                    $fdsql = $dsql->SetQuery("SELECT `pics` FROM `#@__waimai_list` WHERE `id` = ".$v['id']);
                    $fsres = $dsql->dsqlOper($fdsql,"results");
                    $food[$k]['pics'] = getFilePath($fsres['0']['pics']);
                }
                $huoniaoTag->assign("product",$food);
                $huoniaoTag->assign("ordertype1",$data['ordertype']);

                $huoniaoTag->assign("ordernum", $ordernum);
                $huoniaoTag->assign("shopid", $sid);
                $huoniaoTag->assign("shopname", $bret['shopname']);
                // $shop_banner  = explode(",",  $bret['shop_banner']);
                // $huoniaoTag->assign("shop_banner", getFilePath($shop_banner['0']));
                $huoniaoTag->assign("totalAmount", $amount);

            }else{
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "order-waimai"
                );
                $url = getUrlPath($param);
                header("location:".$url);
            }

        }else{

            //查询订单信息
            $sql = $dsql->SetQuery("SELECT `id`, `amount` FROM `#@__paotui_order` WHERE `ordernum` = '$ordernum' AND `state` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $data = $ret[0];
                $amount = $data['amount'];

                $huoniaoTag->assign("ordernum", $ordernum);
                $huoniaoTag->assign("totalAmount", $amount);

            }else{
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "order-paotui"
                );
                $url = getUrlPath($param);
                header("location:".$url);
            }

        }

        $huoniaoTag->assign('ordertypename', $langData['siteConfig'][21][255]);
//		$huoniaoTag->assign('allowUsePoint', false);

        $huoniaoTag->assign("ordertype", $ordertype);


        //支付结果页面
    }elseif($action == "payreturn"){

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "order",
            "module"   => "waimai"
        );
        $url = getUrlPath($param);
        if(!empty($ordernum)){

            //根据支付订单号查询支付结果
            $archives = $dsql->SetQuery("SELECT `body`, `amount`, `paytype`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'waimai' AND `ordernum` = '$ordernum' AND `uid` = $userid");
            $payDetail  = $dsql->dsqlOper($archives, "results");

            if($payDetail){

                $ordertype = $payDetail[0]['ordertype'];

                $state    = $payDetail[0]['state'];
                $paytype  = $payDetail[0]['paytype'];
                $body     = $payDetail[0]['body'];

                $body = unserialize($body);
                $type = $body['type'];


                $huoniaoTag->assign('state', $state);
                $huoniaoTag->assign('paytype', $paytype);
                $huoniaoTag->assign('ordernum', $ordernum);

                // 外卖
                if($type == 'waimai'){

                    $sql = $dsql->SetQuery("SELECT `id`, `sid` FROM `#@__waimai_order_all` WHERE `ordernum` = '$ordernum'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $huoniaoTag->assign('orderid', $ret[0]['id']);
                        $huoniaoTag->assign('sid',   $ret[0]['sid']);
                    }else{
                        header("location:".$url);
                        die;
                    }

                    // 跑腿
                }elseif($type == 'paotui'){

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "order",
                        "module"   => "paotui"
                    );
                    $url = getUrlPath($param);

                    $sql = $dsql->SetQuery("SELECT `id`, `shop` FROM `#@__paotui_order` WHERE `ordernum` = '$ordernum'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $huoniaoTag->assign('orderid', $ret[0]['id']);
                        $huoniaoTag->assign('shop',   $ret[0]['shop']);
                    }else{
                        header("location:".$url);
                        die;
                    }

                }

                $huoniaoTag->assign('ordertype', $type);



                //支付订单不存在
            }else{
                header("location:".$url);
            }

        }else{
            header("location:".$url);
        }

        //订单列表
    }elseif($action == "orderlist"){

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        $page = (int)$page;
        $huoniaoTag->assign("page", $page);
        $huoniaoTag->assign("state", $state);
        $huoniaoTag->assign("userid", $userid);

        //订单详细
    }elseif($action == "orderdetail"){

        if(empty($id) || !is_numeric($id)){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
            die;
        }

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        // $sql = $dsql->SetQuery("SELECT `ordernum`, `store`, `paytype`, `price`, `offer`, `peisong`, `people`, `contact`, `address`, `note`, `orderdate`, `state`, `paydate`, `songdate`, `confirm`, `peisong_note` FROM `#@__waimai_order` WHERE `id` = $id AND `userid` = $userid");
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret){
        //
        // 	$order = $ret[0];
        // 	$huoniaoTag->assign("order_id", $id);
        // 	$huoniaoTag->assign("order_ordernum", $order['ordernum']);
        // 	$huoniaoTag->assign("order_store", $order['store']);
        // 	$huoniaoTag->assign("order_paytype", $order['paytype']);
        // 	$huoniaoTag->assign("order_price", $order['price']);
        // 	$huoniaoTag->assign("order_offer", $order['offer']);
        // 	$huoniaoTag->assign("order_peisong", $order['peisong']);
        // 	$huoniaoTag->assign("order_people", $order['people']);
        // 	$huoniaoTag->assign("order_contact", $order['contact']);
        // 	$huoniaoTag->assign("order_address", $order['address']);
        // 	$huoniaoTag->assign("order_note", $order['note']);
        // 	$huoniaoTag->assign("order_orderdate", $order['orderdate']);
        // 	$huoniaoTag->assign("order_state", $order['state']);
        // 	$huoniaoTag->assign("order_paydate", $order['paydate']);
        // 	$huoniaoTag->assign("order_songdate", $order['songdate']);
        // 	$huoniaoTag->assign("order_confirm", $order['confirm']);
        // 	$huoniaoTag->assign("order_peisong_note", $order['peisong_note']);
        //
        // 	$paytype = $order["paytype"];
        // 	if(!$paytype){
        // 		$huoniaoTag->assign("order_paytype", "未知");
        // 	}else{
        // 		//主表信息
        // 		$sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '$paytype'");
        // 		$ret = $dsql->dsqlOper($sql, "results");
        // 		if(!empty($ret)){
        // 			$huoniaoTag->assign("order_paytype", $ret[0]['pay_name']);
        // 		}else{
        // 			$huoniaoTag->assign("order_paytype", $order["paytype"]);
        // 		}
        // 	}
        //
        // 	$menus = array();
        // 	$sql = $dsql->SetQuery("SELECT `pid`, `pname`, `price`, `count` FROM `#@__waimai_order_product` WHERE `orderid` = $id");
        // 	$ret = $dsql->dsqlOper($sql, "results");
        // 	if($ret){
        // 		foreach ($ret as $key => $value) {
        // 			array_push($menus, array(
        // 				"pid" => $value['pid'],
        // 				"pname" => $value['pname'],
        // 				"price" => $value['price'],
        // 				"count" => $value['count']
        // 			));
        // 		}
        // 	}
        // 	$huoniaoTag->assign("order_menus", $menus);
        //
        // 	//商家信息
        // 	$sql = $dsql->SetQuery("SELECT `title`, `addr`, `address`, `tel` FROM `#@__waimai_store` WHERE `id` = ".$order['store']);
        // 	$ret = $dsql->dsqlOper($sql, "results");
        // 	if($ret){
        // 		$data = $ret[0];
        // 		$huoniaoTag->assign("store_title", $data['title']);
        // 		$huoniaoTag->assign("store_address", $data['address']);
        // 		$huoniaoTag->assign("store_tel", $data['tel']);
        //
        // 		//区域
        // 		$addrSql = $dsql->SetQuery("SELECT `typename` FROM `#@__waimai_addr` WHERE `id` = ". $data["addr"]);
        // 		$addrname = $dsql->getTypeName($addrSql);
        // 		$huoniaoTag->assign("store_addr", $addrname[0]['typename']);
        // 	}
        //
        // }else{
        // 	header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
        // 	die;
        // }



        //发布菜单
    }elseif($action == "fabu"){

        //输出分类字段内容
        global $userLogin;
        $userid = $userLogin->getMemberID();

        global $detailArr;

        if($userid != -1 || $detailArr){

            $store = 0;
            $parentTypeid = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_store` WHERE `userid` = ".$userid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $storeid = $ret[0]['id'];
            }

            //修改信息
            if($id){

                $detailHandels = new handlers($service, "menuDetail");
                $detailConfig  = $detailHandels->getHandle($id);

                if(is_array($detailConfig) && $detailConfig['state'] == 100){
                    $detailConfig  = $detailConfig['info'];
                    if(is_array($detailConfig)){

                        if($storeid != $detailConfig['store']){
                            header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
                            die;
                        }
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_'.$key, $value);
                        }
                    }
                }else{
                    header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
                    die;
                }

            }

            $huoniaoTag->assign('storeid', $storeid);

        }


        // --------------------------------跑腿
        // 帮我买详情页
    }elseif($action == 'paotui' || $action == "paotui-buy" || $action == "addressPaotui" ){

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
//        global $serviceMoney;
        global $userLogin;
        global $siteCityInfo;
        $userinfo   = $userLogin->getMemberInfo();
        $cityid = $siteCityInfo['cityid'];

        if ($cityid == '') {
            $cityid = $userinfo['cityid'];
        }

        $serviceMoney =paotuiServiceMoney($cityid);

        $huoniaoTag->assign('serviceMoney', $serviceMoney);

        $huoniaoTag->assign('city', '');
        $huoniaoTag->assign('ptype', $ptype);
        $huoniaoTag->assign('stype', $stype);
        $huoniaoTag->assign('paotuiMaxjuli', $custompaotuiMaxjuli);
        $huoniaoTag->assign('district', '');
        $huoniaoTag->assign('shop', $shop);
        $huoniaoTag->assign('shopid', $shopid);
        $huoniaoTag->assign('maxtip', $maxtip);
        $huoniaoTag->assign('peerpayState', $custompeerpay);
        $huoniaoTag->assign('peerpay', (int)$peerpay);

        $paotui_delivery = empty(unserialize($custompaotui_delivery)) ? array() : unserialize($custompaotui_delivery) ;
        $ptweightconf    = empty(unserialize($customweight)) ? array() : unserialize($customweight) ;
        $addservice      = empty(unserialize($customaddservice)) ? array() : unserialize($customaddservice) ;
        array_multisort($paotui_delivery,SORT_ASC);
        $huoniaoTag->assign('paotui_delivery', json_encode($paotui_delivery));
        $huoniaoTag->assign('ptweightconf', json_encode($ptweightconf));
        $huoniaoTag->assign('addservice', json_encode($addservice));

        //验证是否已经登录
        if($userid == -1 && $action != 'paotui'){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        // 手机认证
        global $cfg_memberBindPhone;
		global $cfg_memberBindPhoneInfo;
        global $cfg_periodicCheckPhone;
        global $cfg_periodicCheckPhoneCycle;
        $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
        $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天
		if($cfg_memberBindPhone && $action != 'paotui' && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || ($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle))){
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "security",
                "doget"    => "chphone"
            );
            $certifyUrl = getUrlPath($param);
            $cfg_memberBindPhoneInfo = $cfg_memberBindPhoneInfo ? $cfg_memberBindPhoneInfo : $langData['siteConfig'][33][53];//请先进行手机认证！

            if($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle){
                $cfg_memberBindPhoneInfo = '请先验证手机号码';
            }
            
            die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$cfg_memberBindPhoneInfo.'");location.href="'.$certifyUrl.'";</script>');
        }


        // if($action == 'paotui' || $action == 'paotui-buy'){
        // 	// 判断是否在营业时间
        // 	$began = date("Y-m-d") . " 08:30";
        // 	$end = date("Y-m-d") . " 23:59";
        // 	$begantime = strtotime($began);
        // 	$endtime = strtotime($end);
        // 	$now = time();

        // 	$yingyeState = 1;
        // 	if($now < $begantime){
        // 		$yingyeState = -1;
        // 	}

        // 	$huoniaoTag->assign('yingyeState', $yingyeState);
        // 	$huoniaoTag->assign('begantime', explode(" ", $began)[1]);
        // 	$huoniaoTag->assign('endtime', explode(" ", $end)[1]);

        // 	if($action == 'paotui'){
        // 		return;
        // 	}

        // }

        $huoniaoTag->assign('shop', $shop);

        $frompage = $frompage ? $frompage : "paotui-buy";
        $huoniaoTag->assign('frompage', $frompage);


        //获取用户的第一条地址信息
        $address_id = $address_lng = $address_lat = 0;
        $address_person = $address_tel = $address_street = $address_address = "";
        if($qaddress && $userid > 0){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `id` = $qaddress");
            $ret = $dsql->dsqlOper($sql, "results");
        }

        if($ret){
            $data = $ret[0];
            $address_id      = $data['id'];
            $address_person  = $data['person'];
            $address_tel     = $data['tel'];
            $address_street  = $data['street'];
            $address_address = $data['address'];
            $address_lng     = $data['lng'];
            $address_lat     = $data['lat'];
        }
        $huoniaoTag->assign("qcart_address_id", $address_id);
        $huoniaoTag->assign("qcart_address_person", $address_person);
        $huoniaoTag->assign("qcart_address_tel", $address_tel);
        $huoniaoTag->assign("qcart_address_street", $address_street);
        $huoniaoTag->assign("qcart_address_address", $address_address);

        $huoniaoTag->assign("qcart_address_lng", $address_lng);
        $huoniaoTag->assign("qcart_address_lat", $address_lat);

        if($saddress && $userid > 0){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `id` = $saddress");
            $ret = $dsql->dsqlOper($sql, "results");
        }

        if($ret && $userid > 0){
            $data = $ret[0];
            $address_id      = $data['id'];
            $address_person  = $data['person'];
            $address_tel     = $data['tel'];
            $address_street  = $data['street'];
            $address_address = $data['address'];
            $address_lng     = $data['lng'];
            $address_lat     = $data['lat'];
        }
        $huoniaoTag->assign("scart_address_id", $address_id);
        $huoniaoTag->assign("scart_address_person", $address_person);
        $huoniaoTag->assign("scart_address_tel", $address_tel);
        $huoniaoTag->assign("scart_address_street", $address_street);
        $huoniaoTag->assign("scart_address_address", $address_address);

        $huoniaoTag->assign("scart_address_lng", $address_lng);
        $huoniaoTag->assign("scart_address_lat", $address_lat);


        if($action == "addressPaotui"){
            $huoniaoTag->assign("address", (int)$address);
        }

        if($action == "paotui-buy"){
            $huoniaoTag->assign("addr", $addr);
            $huoniaoTag->assign("lng", $lng);
            $huoniaoTag->assign("lat", $lat);
        }

        if($action == "paotui-song"){
//			if(empty($shop) || empty($weight) || empty($price)){
//				$param = array(
//					"service"  => "waimai",
//					"template" => "paotui"
//				);
//				$url = getUrlPath($param);
//				header("location:".$url);
//				die;
//			}

            //代付开关
        }
        $huoniaoTag->assign("weight", $weight);
        $huoniaoTag->assign("price", $price);

    }elseif($action == "paotui-song"){

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
//        global $serviceMoney;

        global $userLogin;
        global $siteCityInfo;
        $userinfo   = $userLogin->getMemberInfo();
        $cityid = $siteCityInfo['cityid'];

        if ($cityid == '') {
            $cityid = $userinfo['cityid'];
        }

        $serviceMoney =paotuiServiceMoney($cityid);

        $huoniaoTag->assign('serviceMoney', $serviceMoney);

//		if(empty($shop)){
//			$param = array(
//				"service" => 'waimai',
//				"template" => 'paotui'
//			);
//
//			$url = getUrlPath($param);
//			header("location:$url");
//			return;
//		}

        include HUONIAOINC . '/config/tuan.inc.php';
        $huoniaoTag->assign('peerpayState', $custompeerpay);
        $huoniaoTag->assign('peerpay', (int)$peerpay);

        $paotui_delivery = empty(unserialize($custompaotui_delivery)) ? array() : unserialize($custompaotui_delivery) ;
        $ptweightconf    = empty(unserialize($customweight)) ? array() : unserialize($customweight) ;
        $addservice      = empty(unserialize($customaddservice)) ? array() : unserialize($customaddservice) ;
        array_multisort($paotui_delivery,SORT_ASC);
        $huoniaoTag->assign('paotui_delivery', json_encode($paotui_delivery));
        $huoniaoTag->assign('ptweightconf', json_encode($ptweightconf));
        $huoniaoTag->assign('addservice', json_encode($addservice));
        $huoniaoTag->assign('city', '');
        $huoniaoTag->assign('maxtip', $maxtip);
        $huoniaoTag->assign('ptweight', $ptweight);
        $huoniaoTag->assign('district', '');

        //验证是否已经登录
        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        // 判断是否在营业时间
        $began = date("Y-m-d") . " 08:30";
        $end = date("Y-m-d") . " 23:59";
        $begantime = strtotime($began);
        $endtime = strtotime($end);
        $now = time();

        $yingyeState = 1;
        if($now < $begantime){
            $yingyeState = -1;
        }

        $huoniaoTag->assign('yingyeState', $yingyeState);
        $huoniaoTag->assign('begantime', explode(" ", $began)[1]);
        $huoniaoTag->assign('endtime', explode(" ", $end)[1]);

        $huoniaoTag->assign('shop', $shop);
        $huoniaoTag->assign('weight', empty($weight) ? 1 : (int)$weight);

        $prie = (int)$price;
        if($price == 0){
            $price = "100元以下";
        }elseif($price == 1){
            $price = "100-200元";
        }elseif($price == 2){
            $price = "200-300元";
        }elseif($price == 3){
            $price = "300-400元";
        }elseif($price == 4){
            $price = "400-500元";
        }else{
            $price = "500元以上";
        }
        $huoniaoTag->assign('price', $price);
        $huoniaoTag->assign('from', $from);

        //获取用户的第一条地址信息
        $address_id = $address_lng = $address_lat = 0;
        $address_person = $address_tel = $address_street = $address_address = "";
        if($address){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `id` = $address");
            $ret = $dsql->dsqlOper($sql, "results");
        }else{
            //获取默认地址
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `def` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                //没有默认地址，取最后添加的
                $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid ORDER BY `id` DESC LIMIT 0, 1");
                $ret = $dsql->dsqlOper($sql, "results");
            }
        }

        if($ret){
            $data = $ret[0];
            $address_id      = $data['id'];
            $address_person  = $data['person'];
            $address_tel     = $data['tel'];
            $address_street  = $data['street'];
            $address_address = $data['address'];
            $address_lng     = $data['lng'];
            $address_lat     = $data['lat'];
        }
        $huoniaoTag->assign("cart_address_id", $address_id);
        $huoniaoTag->assign("cart_address_person", $address_person);
        $huoniaoTag->assign("cart_address_tel", $address_tel);
        $huoniaoTag->assign("cart_address_street", $address_street);
        $huoniaoTag->assign("cart_address_address", $address_address);

        $huoniaoTag->assign("cart_address_lng", $address_lng);
        $huoniaoTag->assign("cart_address_lat", $address_lat);

    }elseif ($action == "addressBuy" || $action == "addressEdit") {
        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
        $huoniaoTag->assign('paotuiMaxjuli', $custompaotuiMaxjuli);
        $huoniaoTag->assign('shop', $shop);
        $huoniaoTag->assign('saddress',$saddress);
        $huoniaoTag->assign('shopid', $shopid);
        $huoniaoTag->assign('ptype', $ptype);
        $huoniaoTag->assign('stype', $stype);
        if($addressid){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $userid AND `id` = $addressid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $address_id      = $data['id'];
                $address_person  = $data['person'];
                $address_tel     = $data['tel'];
                $address_street  = $data['street'];
                $address_address = $data['address'];
                $address_lng     = $data['lng'];
                $address_lat     = $data['lat'];
                $areaCode        = $data['areaCode'];
            }
        }
        $huoniaoTag->assign("ecart_address_id", $address_id);
        $huoniaoTag->assign("ecart_address_person", $address_person);
        $huoniaoTag->assign("ecart_address_tel", $address_tel);
        $huoniaoTag->assign("ecart_address_street", $address_street);
        $huoniaoTag->assign("ecart_address_address", $address_address);

        $huoniaoTag->assign("ecart_address_lng", $address_lng);
        $huoniaoTag->assign("ecart_address_lat", $address_lat);
        $huoniaoTag->assign("ecart_address_areaCode", $areaCode);
        //订单继续支付
    }elseif($action == "paotuipay"){

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT `ordernum`, `amount` FROM `#@__paotui_order` WHERE `id` = $orderid AND `state` = 0");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $data = $ret[0];
            $ordernum = $data['ordernum'];
            $amount = $data['amount'];

            $huoniaoTag->assign("ordernum", $ordernum);
            $huoniaoTag->assign("amount", $amount);

        }else{
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => "waimai",
                "id"       => $orderid
            );
            $url = getUrlPath($param);
            header("location:".$url);
        }


        //支付结果页面
    }elseif($action == "paotuipayreturn"){

        if($userid == -1){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
            die;
        }

        $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "order",
            "module"   => "waimai"
        );
        $url = getUrlPath($param);

        if(!empty($ordernum)){

            //根据支付订单号查询支付结果
            $archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'waimai' AND `ordernum` = '$ordernum' AND `uid` = $userid");
            $payDetail  = $dsql->dsqlOper($archives, "results");
            if($payDetail){

                $state = $payDetail[0]['state'];
                $ordernum = $payDetail[0]['body'];
                $huoniaoTag->assign('state', $state);
                $huoniaoTag->assign('ordernum', $ordernum);

                $sql = $dsql->SetQuery("SELECT `id`, `sid` FROM `#@__waimai_order_all` WHERE `ordernum` = '$ordernum'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $huoniaoTag->assign('orderid', $ret[0]['id']);
                    $huoniaoTag->assign('sid',   $ret[0]['sid']);
                }else{
                    header("location:".$url);
                    die;
                }


                //支付订单不存在
            }else{
                header("location:".$url);
            }

        }else{
            header("location:".$url);
        }

        //优惠券
    }elseif($action == "quan"){
        $huoniaoTag->assign("shopid", (int)$id);
        $huoniaoTag->assign("cart_address_id", (int)$address);
    } elseif ($action == 'withdraw') {

        global $langData;
        $did = GetCookie("courier");

        if($did == -1){
            header("location:/?service=waimai&do=courier&template=login");
            die;
        }

        $couriersql   = $dsql->SetQuery("SELECT `money`,`openid`,`quit` FROM `#@__waimai_courier` WHERE `id` = '$did'");
        $courierres   = $dsql->dsqlOper($couriersql,"results");

        $couriermoney = (float)$courierres[0]['money'];
        $quit         = (int)$courierres[0]['quit'];
        $openid       = $courierres[0]['openid'];
        global $cfg_minWithdraw;  //起提金额
        global $cfg_maxWithdraw;  //最多提现
        global $cfg_courierWithdrawCycle;  //提现周期  0不限制  1每周  2每月
        global $cfg_courierWithdrawCycleWeek;  //周几
        global $cfg_courierWithdrawCycleDay;  //几日
        global $cfg_withdrawPlatform;  //提现平台
        global $cfg_courierwithdrawNote;  //提现说明
        global $customcourierFree;

        $cfg_minWithdraw = (float)$cfg_minWithdraw;
        $cfg_maxWithdraw = (float)$cfg_maxWithdraw;
        $cfg_withdrawCycle = (int)$cfg_courierWithdrawCycle;
        $withdrawPlatform = $cfg_withdrawPlatform ? unserialize($cfg_withdrawPlatform) : array('weixin', 'alipay', 'bank');

        //提现周期
        $withdrawCycleState = 1;
        $withdrawCycleNote = '';
        if($cfg_withdrawCycle){
            //周几
            if($cfg_withdrawCycle == 1){

                $week = date("w", time());
                if($week != $cfg_courierWithdrawCycleWeek){
                    $array = $langData['siteConfig'][34][5];  //array('周日', '周一', '周二', '周三', '周四', '周五', '周六')
                    $withdrawCycleState = 0;
                    $withdrawCycleNote = str_replace('1', $array[$cfg_courierWithdrawCycleWeek], $langData['siteConfig'][36][0]);  //当前不可提现，提现时间：每周一
                }

                //几日
            }elseif($cfg_withdrawCycle == 2){

                $day = date("d", time());
                if($day != $cfg_courierWithdrawCycleDay){
                    $withdrawCycleState = 0;
                    $withdrawCycleNote = str_replace('1', $cfg_courierWithdrawCycleDay, $langData['siteConfig'][36][1]);  //当前不可提现，提现时间：每月1日
                }

            }
        }

        global $cfg_miniProgramAppid;
        global $cfg_miniProgramId;
        $huoniaoTag->assign("miniProgramAppid", $cfg_miniProgramAppid);
        $huoniaoTag->assign("miniProgramId", $cfg_miniProgramId);
        $huoniaoTag->assign("openid", $openid);
        $huoniaoTag->assign("from", $from);
        $huoniaoTag->assign("quit", $quit);
        $huoniaoTag->assign("minWithdraw", $cfg_minWithdraw);
        $huoniaoTag->assign("maxWithdraw", $cfg_maxWithdraw);
        $huoniaoTag->assign("withdrawCycleState", $withdrawCycleState);
        $huoniaoTag->assign("withdrawCycleNote", $withdrawCycleNote);
        $huoniaoTag->assign("withdrawPlatform", $withdrawPlatform);
        $huoniaoTag->assign("couriermoney", (float)$couriermoney);
        $huoniaoTag->assign("courierFree", (float)$customcourierFree);
        $huoniaoTag->assign("withdrawNote", nl2br($cfg_withdrawNote));
        $huoniaoTag->assign("courierwithdrawNote", nl2br($cfg_courierwithdrawNote));

        //查询选用的帐号
        $id = (int)$id;
        $type = !empty($type) ? $type : ($withdrawPlatform ? $withdrawPlatform[0] : '');
        $bank = $alipay = array();
        if($id){
            $sql = $dsql->SetQuery("SELECT `bank`, `cardnum`, `cardname` FROM `#@__member_withdraw_card` WHERE `id` = $id AND `uid` = $did");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret && is_array($ret)){
                if($ret[0]['bank'] != 'alipay'){
                    $bank = $ret[0];
                    $bank['cardnumLast'] = substr($bank['cardnum'], -4);
                }else{
                    $type = "alipay";
                    $alipay = $ret[0];
                }
            }
        }

        //提取第一个帐号
        if(empty($bank)){
            $sql = $dsql->SetQuery("SELECT `bank`, `cardnum`, `cardname` FROM `#@__member_withdraw_card` WHERE `uid` = $did AND `usertype` = 1 AND `bank` != 'alipay' AND `bank` != 'weixin' ORDER BY `id` DESC LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret && is_array($ret)){
                $bank = $ret[0];
                $bank['cardnumLast'] = substr($bank['cardnum'], -4);
            }
        }
        if(empty($alipay)){
            $sql = $dsql->SetQuery("SELECT `bank`, `cardnum`, `cardname` FROM `#@__member_withdraw_card` WHERE `uid` = $did AND `usertype` = 1 AND `bank` = 'alipay' ORDER BY `id` DESC LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret && is_array($ret)){
                $alipay = $ret[0];
            }
        }

        $huoniaoTag->assign("type", $type);
        $huoniaoTag->assign("bank", $bank);
        $huoniaoTag->assign("alipay", $alipay);
        $huoniaoTag->assign("new", $new);
        $huoniaoTag->assign("mod", $mod);


    }

    //APP下载页面
    elseif(($template == 'qishou' || $template == 'wmsj') && isMobile()){

        //app配置
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){

            $ret = $ret[0];
            $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);

            //骑手端
            if($template == 'qishou'){

                $cfg_app_peisong_android_download = $ret['peisong_android_download'];  //安卓下载地址

                //华为手机
                if(strpos($useragent, 'huawei') !== false && $ret['peisong_huawei_download']){
                    $cfg_app_peisong_android_download = $ret['peisong_huawei_download'];
                }

                //荣耀手机
                if(strpos($useragent, 'honor') !== false && $ret['peisong_honor_download']){
                    $cfg_app_peisong_android_download = $ret['peisong_honor_download'];
                }

                //小米手机
                if((strpos($useragent, 'xiaomi') !== false || strpos($useragent, 'redmi') !== false || strpos($useragent, 'mi ') !== false) && $ret['peisong_mi_download']){
                    $cfg_app_peisong_android_download = $ret['peisong_mi_download'];
                }

                //OPPO手机
                if((strpos($useragent, 'oppo') !== false || strpos($useragent, 'opm') !== false) && $ret['peisong_oppo_download']){
                    $cfg_app_peisong_android_download = $ret['peisong_oppo_download'];
                }

                //VIVO手机
                if(strpos($useragent, 'vivo') !== false && $ret['peisong_vivo_download']){
                    $cfg_app_peisong_android_download = $ret['peisong_vivo_download'];
                }

                $huoniaoTag->assign('cfg_app_peisong_android_download', $cfg_app_peisong_android_download);

            }

            //商家端
            elseif($template == 'wmsj'){

                $cfg_app_business_android_download = $ret['business_android_download'];  //安卓下载地址

                //华为手机
                if(strpos($useragent, 'huawei') !== false && $ret['business_huawei_download']){
                    $cfg_app_business_android_download = $ret['business_huawei_download'];
                }

                //荣耀手机
                if(strpos($useragent, 'honor') !== false && $ret['business_honor_download']){
                    $cfg_app_business_android_download = $ret['business_honor_download'];
                }

                //小米手机
                if((strpos($useragent, 'xiaomi') !== false || strpos($useragent, 'redmi') !== false || strpos($useragent, 'mi ') !== false) && $ret['business_mi_download']){
                    $cfg_app_business_android_download = $ret['business_mi_download'];
                }

                //OPPO手机
                if((strpos($useragent, 'oppo') !== false || strpos($useragent, 'opm') !== false) && $ret['business_oppo_download']){
                    $cfg_app_business_android_download = $ret['business_oppo_download'];
                }

                //VIVO手机
                if(strpos($useragent, 'vivo') !== false && $ret['business_vivo_download']){
                    $cfg_app_business_android_download = $ret['business_vivo_download'];
                }

                $huoniaoTag->assign('cfg_app_business_android_download', $cfg_app_business_android_download);

            }

        }
    }




    if(empty($smarty)) return;

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

        $param = $params;
        $moduleReturn  = $moduleHandels->getHandle($param);

        //只返回数据统计信息
        if($pageData == 1){
            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
                $pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
            }else{
                $moduleReturn  = $moduleReturn['info'];  //返回数据
                $pageInfo_ = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

            //指定数据
        }elseif(!empty($get)){
            $retArr = $moduleReturn['state'] == 100 ? $moduleReturn['info'][$get] : "";
            $retArr = is_array($retArr) ? $retArr : array();
            $smarty->block_data[$dataindex] = $retArr;

            //正常返回
        }else{

            global $pageInfo;
            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $pageInfo = array();
                $smarty->assign('pageInfo', $pageInfo);
                return '';
            }
            $moduleReturn  = $moduleReturn['info'];  //返回数据
            $pageInfo_ = $moduleReturn['pageInfo'];
            if($pageInfo_){
                //如果有分页数据则提取list键
                $moduleReturn  = $moduleReturn['list'];
                $pageInfo = $pageInfo_;
            }else{
                $pageInfo = array();
            }
            $smarty->assign('pageInfo', $pageInfo);
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


//验证配送员是否已经登录，并且帐号正常
function checkCourierAccount(){
    global $dsql;
    $did = GetCookie("courier");
    if($did){

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE `id` = $did AND `status` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            PutCookie("courier", $did, 24 * 60 * 60 * 7, "/");
            return $did;
        }else{
            return -1;
        }

    }else{
        return -1;
    }

}
