<?php
/**
 * 管理客服订单
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopKeFuOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopKeFuOrder.html";

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    $where .= getCityFilter('store.`cityid`');
    if ($adminCity){
        $where .= getWrongCityFilter('store.`cityid`', $adminCity);
    }
    if ($sKeyword){
        if ($sKeyword != "") {

            $where .= " AND (`ordernum` like '%$sKeyword%' OR `people` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `address` like '%$sKeyword%')";
        }
    }

    $where .= ' AND  o.`user_refundtype` = 2';

    $archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_order` l ON o.`orderid` = l.`id` LEFT JOIN `#@__shop_store` store ON store.`id` = l.`store` WHERE 1 = 1 AND l.`orderstate` = 6 AND o.`ret_ptaudittype` = 0" . $where);
    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    $atpage   = $pagestep * ($page - 1);
    $where1    = " LIMIT $atpage, $pagestep";
    $orderby  = " ORDER BY l.`id` DESC";
    $archives = $dsql->SetQuery("SELECT l.`ordernum`,l.`store`,l.`userid`,o.`logistic`, l.`amount`, o.`balance`, o.`point`, o.`payprice`,o.`refrundno`,o.`refrundamount`,l.`peerpay`,t.`is_tuikuan`,o.`ret_negotiate`,o.`platform`,o.`user_refundtype`,o.`proid`,o.`orderid`,o.`ret_ptaudittype`,o.`id` productid,o.`ret_date`  FROM `#@__shop_order` l LEFT JOIN `#@__shop_store` store ON store.`id` = l.`store`  LEFT JOIN  `#@__shop_order_product` o  ON o.`orderid` = l.`id` LEFT JOIN   `#@__shop_product` t  ON o.`proid` = t.`id`  WHERE o.`user_refundtype` = '2' AND l.`orderstate` = 6 AND o.`ret_ptaudittype` = 0".$where.$orderby.$where1);
    $results  = $dsql->dsqlOper($archives, "results");
    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $plat = unserialize($value['platform']);
            $list[$key]["id"] = $value["proid"];
            $list[$key]["retnote"] = $plat["retnote"];
            $list[$key]["rettype"] = $plat["rettype"];
            $list[$key]["name"] = $plat["name"];
            $list[$key]["price"] = $plat["price"];
            $list[$key]["mobile"] = $plat["mobile"];
            $imgArr = array();
            $pics   = $plat['pics'];
            if (!empty($pics)) {
                $picArr = explode(",", $pics);
                foreach ($picArr as $k => $v) {
                    $imgArr[$k] = getFilePath($v);
                }
            }
            $list[$key]["pics"] = $imgArr;
            $list[$key]["productid"] = $value["productid"];
            $list[$key]["ordernum"] = $value["ordernum"];
            $list[$key]["user_refundtype"] = $value["user_refundtype"];
            $list[$key]["orderid"] = $value["orderid"];
            $list[$key]["ret_ptaudittype"] = $value["ret_ptaudittype"];
            $list[$key]["ret_date"]         = $value["ret_date"];
            $list[$key]["ret_datetime"]     = date('Y-m-d H:i:s',$value["ret_date"]);
        }


        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "kefuOrder": ' . json_encode($list) . '}';
            die;
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}}';
        }

    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ' }}';
    }
    die;

//删除
}elseif($dopost == "del"){
    if (!testPurview("shopKeFuOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;
    $archives = $dsql->SetQuery("SELECT o.`ret_state`, o.`ordernum` FROM `#@__shop_order` ob LEFT JOIN `#@__shop_order_product` o ON o.`orderid` = ob.`id`   WHERE o.`orderid` = '$id'");
    $ret_state = $dsql->dsqlOper($archives, "results");
    $retstate = array_column($ret_state,'ret_state');
    if (!in_array(0,$retstate)){
        $each  = explode(",", $id);
        $error = array();
        foreach ($each as $val) {
        $archives = $dsql->SetQuery("DELETE FROM `#@__shop_order` WHERE `id` = " . $val);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }
        $archives = $dsql->SetQuery("DELETE FROM `#@__shop_order_product` WHERE `orderid` = " . $val);
        $dsql->dsqlOper($archives, "update");
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除商城平台介入订单", $id . '=>' . $ret_state[0]['ordernum']);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;
    }else{
        echo '{"state": 200, "info": ' . json_encode('多订单禁止删除') . '}';die;
    }
}elseif($dopost == "refund"){
    global  $userLogin;
    if (!testPurview("shopKeFuOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    $setAmount = (float)$amount;
    
    if (!empty($id) && !empty($orderid)) {
        $archives = $dsql->SetQuery("SELECT l.`ordernum`,l.`store`,l.`userid`, l.`paytype`,l.`orderstate`, l.`logistic`, l.`amount`, l.`balance`, l.`ret_amount`, l.`point`, l.`payprice`,l.`refrundno`,l.`refrundamount`,l.`peerpay`,t.`is_tuikuan`,l.`ret_negotiate`, l.`usequan`  FROM `#@__shop_order` l  LEFT JOIN  `#@__shop_order_product` o  ON o.`orderid` = l.`id` LEFT JOIN   `#@__shop_product` t  ON o.`proid` = t.`id`  WHERE o.`id` = $id AND l.`id` = " . $orderid);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $is_tuikuan   = $results[0]['is_tuikuan'];
            if ($is_tuikuan == 1) {
                echo '{"state": 200, "info": ' . json_encode("此商品不支持退款！") . '}';
                die;
            }

            if ((int)$tuikuantype == 1) {

                $ret_negotiate = $results[0]["ret_negotiate"] !='' ? unserialize($results[0]["ret_negotiate"]) : array () ; /*协商历史*/

                $refundinfo = array();
                $refundinfo['typename'] = '平台介入处理完成';
                $info = '';
                if ($isCheck == 1) {
                    $info = '同意退款';
                } elseif ($isCheck == 2) {
                    $info = '拒绝退款';
                }
                $refundinfo['refundinfo'] = $info;
                $now = GetMkTime(time());
                $refundinfo['datetime']   = $now;
                $refundinfo['type']       = 2;

                if ($ret_negotiate) {

                    array_push($ret_negotiate['refundinfo'],$refundinfo);

                } else {

                    $ret_negotiate['refundinfo'][0] = $refundinfo;

                }

                $ret_negotiatestr = serialize($ret_negotiate);

                $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order_product` SET `ret_ptaudittype` = '$isCheck',`ret_negotiate` = '$ret_negotiatestr' WHERE `id` ='$id' AND `orderid` = '$orderid'");
                $dsql->dsqlOper($orderOpera, "update");

                if ($isCheck == 2) {
                    echo '{"state": 100, "info": ' . json_encode("操作成功！") . '}';
                    die;
                }

            }

            $ordernum   = $results[0]['ordernum'];
            $userid     = (int)$results[0]["userid"];
            $orderstate = (int)$results[0]["orderstate"];
            $logistic   = (float)$results[0]["logistic"];
            // $amount     = sprintf('%.2f',$results[0]["amount"] + $results[0]["logistic"]);
            $balance    = (float)$results[0]["balance"];
            $point      = (int)$results[0]["point"];
            $store      = (int)$results[0]["store"];
            $paytype    = $results[0]["paytype"];
            $refrundno  = $results[0]["refrundno"];
            $payprice   = (float)$results[0]["payprice"];
            $peerpay    = (int)$results[0]["peerpay"];
            $usequan    = (int)$results[0]['usequan'];
            $ret_amount = (float)$results[0]['ret_amount'];

            if ($peerpay >= 0) {
                $balance += $payprice;
            }
            $refrundamount = $results[0]["refrundamount"];

            //积分抵扣金额
            global $cfg_pointRatio;
            $pointAmount = $point / $cfg_pointRatio;

            //订单总金额 = 余额支付+积分抵扣+在线支付
            $amount = sprintf('%.2f', $balance + $pointAmount + $payprice);

//			if(empty($setAmount)){
//				$orderTotalAmount = $balance + $payprice + $point/$cfg_pointRatio;
//
//			}else{
//
//				$orderTotalAmount = $setAmount;
//			}

            // 全额
            // $maxAmount = $amount - $refrundamount;
            // if (empty($setAmount)) {
            //     $this_amount = $maxAmount;
            // } else {
            //     $this_amount = $setAmount > $maxAmount ? $maxAmount : $setAmount;
            // }

            $this_amount = $ret_amount;
            $refrundamount_ = $refrundamount + $ret_amount;

            if ($refrundamount_ == $amount) {
                $refrundamount_ = 0;
            }
            $online_amount = $refrund_online = $this_amount;
            // if ($orderstate == 1 || $orderstate == 4 || $orderstate == 6 || $orderstate == 3) {

                //计算需要退回的积分及余额
                $totalPoint = 0;
                $totalMoney = $logistic;

                $opArr = array();

                $sql = $dsql->SetQuery("SELECT `proid`, `speid`, `count`, `point`, `balance`, `payprice` FROM `#@__shop_order_product` WHERE `orderid` = " . $orderid);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $key => $value) {
                        $totalPoint += $value['point'];
                        $totalMoney += $value['balance'] + $value['payprice'];

                        array_push($opArr, array(
                            "proid" => $value['proid'],
                            "speid" => $value['speid'],
                            "count" => $value['count']
                        ));
                    }
                }

                //会员信息
                $userSql    = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = " . $userid);
                $userResult = $dsql->dsqlOper($userSql, "results");

                if ($userResult) {
                    $patypem = 0;
                    if ($payprice != 0 && $balance != 0 && $point != 0) {
                        $patypem = 1;
                    } elseif ($payprice != 0 && $balance != 0 && $point == 0) {
                        $patypem = 2;
                    } elseif ($payprice != 0 && $point != 0 && $balance == 0) {
                        $patypem = 3;
                    } elseif ($balance != 0 && $point != 0 && $payprice == 0) {
                        $patypem = 4;
                    }
                    /*$patypem 1- 实际+money+point ,2- 实际+money ,3- 实际+point ,4 point + money*/
                    //混合支付退款
                    $r           = true;
                    $refrunddate = GetMkTime(time());
                    if ($patypem != 0) {
                        /*混合支付情况 退款金额大于实际支付金额 实际支付还可以退多少*/
                        if ($patypem == 1 || $patypem == 2 || $patypem == 3) {
                            if ($payprice <= $this_amount) {
                                /*实际支付小于本次退款*/
                                if ($payprice <= $refrundamount) {
                                    /*实际支付小于退款金额说明实际支付的钱已经全部退完*/
                                    $truemoneysy = 0;
                                } else {

                                    $truemoneysy = $payprice;
                                }
                            } else {
                                if ($payprice > $refrundamount) {
                                    /*实际支付大于等于退款记录 说明实际支付还有部分未退款*/
                                    $truemoneysy = bcsub($payprice, $refrundamount, 2);
                                    if ($truemoneysy > $this_amount) {
                                        /*实际部分未退款大于此次退款金额*/
                                        $truemoneysy = $this_amount;
                                    }
                                } else {
                                    /*实际支付小于退款记录 说明实际支付已经全部退完*/
                                    $truemoneysy = 0;
                                }
                            }

                            if ($patypem == 1 || $patypem == 2) {
                                /*余额部分*/
                                $money_amount = $this_amount - $truemoneysy;
                                $point = 0;
                            } else {

                                $point = ($this_amount - $truemoneysy) * $cfg_pointRatio;
                            }
                        } else {
                            if ($balance <= $this_amount) {
                                /*余额支付小于本次退款*/
                                if ($balance <= $refrundamount) {
                                    /*余额支付小于退款金额说明余额支付的钱已经全部退完*/
                                    $money_amount = 0;
                                } else {

                                    $money_amount = $balance;
                                }
                            } else {
                                if ($balance > $refrundamount) {
                                    /*实际支付大于等于退款记录 说明实际支付还有部分未退款*/
                                    $money_amount = bcsub($balance, $refrundamount, 2);
                                    if ($money_amount > $this_amount) {
                                        /*实际部分未退款大于此次退款金额*/
                                        $money_amount = $this_amount;
                                    }
                                } else {
                                    /*实际支付小于退款记录 说明实际支付已经全部退完*/
                                    $money_amount = 0;
                                }
                            }
                            $point = $this_amount * $cfg_pointRatio - $money_amount * $cfg_pointRatio;
                        }
                    } else {

                        $money_amount = $this_amount;

                        // $truemoneysy  = $this_amount >= $payprice ? (!empty($payprice) || $payprice != '0.00' ? $payprice : 0 ) : $this_amount;         // 在线支付金额
                        // if(empty($truemoneysy) || $truemoneysy == '0.00'){

                        //     $money_amount = $this_amount >= ($balance - $payprice) ? (!empty(($balance - $payprice)) || ($balance - $payprice) != '0.00' ? ($balance - $payprice) : 0 )  : $this_amount;         // 余额支付金额
                        // }

                    }

                    if ($patypem == 3) {
                        $pointtype = '1';
                    } else {
                        $pointtype = '0';
                    }

                    $arr = adminRefund('shop',$peerpay,$paytype,$truemoneysy,$ordernum,$refrundno,$balance,$orderid);    //后台退款
                    $r =$arr[0]['r'];
                    $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : GetMkTime(time());
                    $refrundno   = $arr[0]['refrundno'];
                    $refrundcode = $arr[0]['refrundcode'];
                    if ($r) {

                        //退回积分
                        if ($pointtype == '0' && $point != 0) {
                            global $userLogin;
                            $info = '商城订单退回：('.$cfg_pointName.'退款：' . (floatval($point)) . '，现金退款：' . (floatval($truemoneysy)) . '，余额退款：' . (floatval($money_amount)) . ')：' . $ordernum;
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$point);
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$info', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                            $dsql->dsqlOper($archives, "update");

                        }
                        //会员帐户充值
                        if ($patypem == 2) {
                            $balancetype = '1';
                        } else {
                            $balancetype = '0';
                        }
                        if ($balancetype == '0' && $money_amount != 0) {
                            $info = '商城订单退款：('.$cfg_pointName.'退款：' . (floatval($point)) . '，现金退款：' . (floatval($truemoneysy)) . '，余额退款：' . (floatval($money_amount)) . ')：' . $ordernum;
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $money_amount . " WHERE `id` = " . $userid);
                            $dsql->dsqlOper($userOpera, "update");


                            $pay_name    = '';
                            $pay_namearr = array();
                            $paramUser   = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "shop",
                                "id"       => $orderid
                            );
                            $urlParam    = serialize($paramUser);

                            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if (!empty($ret)) {
                                $pay_name = $ret[0]['pay_name'];
                            } else {
                                $pay_name = $ret[0]["paytype"];
                            }

                            if ($pay_name) {
                                array_push($pay_namearr, $pay_name);
                            }

                            if ($money_amount != '') {
                                array_push($pay_namearr, "余额");
                            }

                            if ($point != '') {
                                array_push($pay_namearr, $cfg_pointName);
                            }

                            if ($pay_namearr) {
                                $pay_name = join(',', $pay_namearr);
                            }

                            $tuikuan      = array(
                                'paytype'      => $pay_name,
                                'truemoneysy'  => $truemoneysy,
                                'money_amount' => $money_amount,
                                'point'        => $point,
                                'refrunddate'  => $refrunddate,
                                'refrundno'    => $refrundno
                            );
                            global  $userLogin;
                            $tuikuanparam = serialize($tuikuan);
                            //保存操作日志
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
//                            $money  = sprintf('%.2f',($usermoney + $money_amount));
                            //记录退款日志
                            $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (" . $userid . ", " . $money_amount . ", 1, '$info', " . GetMkTime(time()) . ",'shop','tuikuan','$urlParam','$ordernum','$tuikuanparam','商城消费','$usermoney')");
                            $dsql->dsqlOper($logs, "update");

                        }
                        /*商家扣除冻结金额*/
                        if($refrundamount >= $balance){
                            $freezeamount = 0;
                        }else{

                            $freezeamount = (float)$truemoneysy + (float)$money_amount;

                            if($balance <= $freezeamount){

                                $freezeamount = (float)$balance;
                            }
                        }

                        // $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $freezeamount WHERE `id` = " . $userid);
                        // $dsql->dsqlOper($usersql, "update");

                        //更新订单状态
                        // if ($amount == $refrundamount_) {
                        //     $refrundamount_ = '0';
                        // }
                        $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 7, `ret_state` = 0, `ret_ok_date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$refrundamount_', `refrundno` = '$refrundno' WHERE `id` = " . $orderid);
                        $dsql->dsqlOper($orderOpera, "update");

                        $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `ret_type` = '其他', `ret_note` = '平台授权退款' WHERE `ret_type` = '' AND `ret_note` = '' AND `id` = " . $orderid);
                        $dsql->dsqlOper($orderOpera, "update");

                        //如果使用了优惠券，更新优惠券的使用状态
                        if($usequan){
                            $sql = $dsql->SetQuery("UPDATE `#@__shop_quanlist` SET `state` = 0, `usedate` = 0 WHERE `id` = $usequan");
                            $dsql->dsqlOper($sql, 'update');
                        }


                        //更新商品已售数量及库存
                        foreach ($opArr as $key => $value) {

                            $_proid = $value['proid'];
                            $_count = $value['count'];
                            $_speid = $value['speid'];

                            //更新已购买数量
                            $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `sales` = `sales` - $_count, `inventory` = `inventory` + $_count WHERE `id` = " . $_proid);
                            $dsql->dsqlOper($sql, "update");

                            //更新库存
                            $sql = $dsql->SetQuery("SELECT `specification`,`inventoryCount` FROM `#@__shop_product` WHERE `id` = $_proid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $specification  = $ret[0]['specification'];
                                $inventoryCount = $ret[0]['inventoryCount'];
                                if (!empty($specification)) {
                                    $nSpec = array();
                                    if ($inventoryCount != 0) {
                                        $_count = 0;
                                    }
                                    $specification = explode("|", $specification);
                                    foreach ($specification as $k => $v) {
                                        $specArr = explode(",", $v);
                                        if ($specArr[0] == $_speid) {
                                            $spec   = explode("#", $v);
                                            $nCount = $spec[2] + $_count;
                                            array_push($nSpec, $spec[0] . "#" . $spec[1] . "#" . $nCount);
                                        } else {
                                            array_push($nSpec, $v);
                                        }
                                    }

                                    $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `specification` = '" . join("|", $nSpec) . "' WHERE `id` = '$_proid'");
                                    $dsql->dsqlOper($sql, "update");
                                }
                            }

                        }
                        echo '{"state": 100, "info": ' . json_encode("操作成功，款项已退还至会员帐户！") . '}';
                        die;
                    } else {
                        echo '{"state": 200, "info": ' . json_encode("退款失败，错误码：" . $refrundcode) . '}';
                        die;
                    }

                } else {
                    echo '{"state": 200, "info": ' . json_encode("会员不存在，无法继续退款！") . '}';
                    die;
                }

            // } else {
            //     echo '{"state": 200, "info": ' . json_encode("订单当前状态不支持手动退款！") . '}';
            //     die;
            // }
        } else {
            echo '{"state": 200, "info": ' . json_encode("订单不存在，请刷新页面！") . '}';
            die;
        }

    } else {
        echo '{"state": 200, "info": ' . json_encode("订单ID为空，操作失败！") . '}';
        die;
    }
} elseif ($dopost == "getDetail") {
    if($id == "") die;

    $where = ' AND `user_refundtype` = 2';

    $archives = $dsql->SetQuery("SELECT `user_exptype`, `ret_date`,`ret_negotiate`,`platform`,`ret_pics` FROM `#@__shop_order_product` WHERE `id` = ".$id.$where);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $plat = unserialize($results[0]['platform']);

        $results[0]["user_exptype"]  = $results[0]["user_exptype"];
        $user_exptypename = '';

        if ($results[0]["user_exptype"] == 1) {
            $user_exptypename = '快递';
        } else {
            $user_exptypename = '自行';
        }
        $results[0]["retnote"]         = $plat["retnote"];
        $results[0]["rettype"]         = $plat["rettype"];
        $results[0]["name"]            = $plat["name"];
        $results[0]["price"]           = $plat["price"];
        $results[0]["mobile"]          = $plat["mobile"];
        $imgArr = array();
        $pics   = $plat['pics'];
        if (!empty($pics)) {
            $picArr = explode(",", $pics);
            foreach ($picArr as $k => $v) {
                $imgArr[$k] = getFilePath($v);
            }
        }
        $results[0]['pics'] = $imgArr;
        $imgeArr = array();
        $pics   = $results[0]['ret_pics'];
        if (!empty($pics)) {
            $picArr = explode(",", $pics);
            foreach ($picArr as $k => $v) {
                $imgeArr[$k] = getFilePath($v);
            }
        }
        $results[0]['pic'] = $imgeArr;
        $results[0]["user_exptypename"] = $user_exptypename;
        $results[0]["ret_date"]         = $results[0]["ret_date"];
        $results[0]["ret_datetime"]     = date('Y-m-d H:i:s',$results[0]["ret_date"]);
        $results[0]["ret_negotiate"]    = $results[0]["ret_negotiate"] != '' ? unserialize($results[0]["ret_negotiate"]) : array ();

        echo json_encode($results);

    }else{
        echo '{"state": 200, "info": '.json_encode("订单信息获取失败！").'}';
    }
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/shop/shopKeFuOrder.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
