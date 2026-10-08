<?php
/**
 * 小程序支付成功通知
 */
require_once('common.inc.php');
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);


$content = file_get_contents('php://input');
$contentObj = simplexml_load_string($content, 'SimpleXMLElement', LIBXML_NOCDATA);
$content = (array)$contentObj;
if($content){

    $ordernum       = $content['out_trade_no'];
    $transaction_id = $content['transaction_id'];
    $date           = time();


    //查询订单信息
    $archive = $dsql->SetQuery("SELECT `body`, `amount` FROM `#@__pay_log` WHERE `ordertype` = 'waimai' AND `ordernum` = '$ordernum'");

    $results = $dsql->dsqlOper($archive, "results");
    if(!$results){
        return;
    }

    $onlineAmount = $results[0]['amount'];		// 在线支付金额
    $type = "waimai";

    if($type == "waimai"){

        $archives = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`sid`, o.`food`, o.`paydate`, o.`usequan`, o.`amount`, o.`priceinfo`, s.`shopname`, s.`bind_print`, s.`print_config`, s.`print_state` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE `ordernum` = '$ordernum'");

        $res = $dsql->dsqlOper($archives, "results");
        if($res){
            $id           = $res[0]['id'];
            $uid          = $res[0]['uid'];
            $sid          = $res[0]['sid'];
            $usequan      = $res[0]['usequan'];
            $paydate      = $res[0]['paydate'];
            $amount       = $res[0]['amount'];
            $shopname     = $res[0]['shopname'];
            $bind_print   = $res[0]['bind_print'];
            $print_config = $res[0]['print_config'];
            $print_state  = $res[0]['print_state'];
            $food         = $res[0]['food'];
            $priceinfo    = $res[0]['priceinfo'];

            //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
            if($paydate == 0){
                //当天
                $todayk = strtotime(date('Y-m-d'));
                //当天结束
                $todaye = strtotime(date('Y-m-d 23:59:59'));
                //最新订单号
                $paytypeState = "`state` != 0 AND `state` != 6";
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `sid` = $sid AND $paytypeState AND  `pubdate` > $todayk AND `pubdate` < $todaye");
                $no  = $dsql->dsqlOper($sql, "totalCount") + 1;
                $newOrdernumstore = date("Ymd") . "-" . $no;

                //更新订单状态
                $archives = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 2, `ordernumstore` = '$newOrdernumstore', `paytype` = 'waimai', `paydate` = '$paydate', `transaction_id` = '$transaction_id', `paylognum` = '' WHERE `ordernum` = '$ordernum'");
                $dsql->dsqlOper($archives, "update");

                // 扣除余额支付部分
                if($amount > $onlineAmount){
                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - ($amount - $onlineAmount) WHERE `id` = $uid");
                    $dsql->dsqlOper($sql, "update");
                }


                //打印机接单
                if($bind_print == 1 && $print_state == 1 && !empty($print_config)){
                    printerWaimaiOrder($id);
                }

                updateAdminNotice("waimai", "order");

                // 查询管理会员 推送给商家
                $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_shop_manager` WHERE `shopid` = $sid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $url = $cfg_secureAccess.$cfg_basehost."/wmsj/order/waimaiOrderDetail.php?id=".$id;

                    foreach ($ret as $k => $v) {
                        sendapppush($v['userid'], "您有一笔新订单！", "订单号：".$shopname.$newOrdernumstore, $url, "newshoporder");
                        // aliyunPush($v['userid'], "您有一笔新订单！", "订单号：".$shopname.$newOrdernumstore, "newshoporder", $url);
                    }
                }

                // 更新满送优惠券状态
                $sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 0 WHERE `from` = $id AND `state` = -1");
                $dsql->dsqlOper($sql, "update");


                // 更新优惠券状态使用订单id
                $pubdate = GetMkTime(time());
                if($usequan){
                    $sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 1, `oid` = '$id' WHERE `id` = $usequan");
                    $dsql->dsqlOper($sql, "update");
                }

                // 更新其他未支付订单价格信息
                if($priceinfo){
                    $priceinfo = unserialize($priceinfo);
                    foreach ($priceinfo as $key => $value) {
                        // 如果有首单减免，查询该用户未支付的订单
                        if($value['type'] == "shoudan"){

                            $sql = $dsql->SetQuery("SELECT `id`, `amount`, `priceinfo` FROM `#@__waimai_order_all` WHERE `uid` = $uid AND `state` = 0");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if($ret){
                                // $failedIds = array();
                                foreach ($ret as $k => $val) {
                                    $priceinfo_ = $val['priceinfo'];
                                    $amount = $val['amount'];
                                    $hasShoudan = false;
                                    if($priceinfo_){
                                        $priceinfo_ = unserialize($priceinfo_);
                                        foreach ($priceinfo_ as $n => $d) {
                                            // 如果有首单减免
                                            if($d['type'] == 'shoudan'){
                                                $hasShoudan = true;
                                                $amount += $d['amount'];
                                                unset($priceinfo_[$n]);
                                                // array_push($failedIds, $val['id']);
                                                break;
                                            }
                                        }
                                    }

                                    // 存在首单优惠
                                    if($hasShoudan){
                                        $priceinfo_ = serialize($priceinfo_);
                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `amount` = '$amount', `priceinfo` = '$priceinfo_' WHERE `id` = ".$val['id']);
                                        $ret = $dsql->dsqlOper($sql, "update");
                                    }

                                }

                            }

                        }
                        break;
                    }
                }


                // 更新库存
                $food = unserialize($food);
                foreach ($food as $k => $v) {
                    $id = $v['id'];
                    $count = $v['count'];

                    $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `stock` = `stock` - $count WHERE `id` = '$id' AND `stockvalid` = 1 AND `stock` > 0");
                    $dsql->dsqlOper($sql, "update");

                }

            }
        }

    }

}