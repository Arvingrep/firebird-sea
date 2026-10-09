<?php
/**
 * 订单管理
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_order";
$templates = "waimaiOrderSearch.html";

checkPurview("waimaiOrderSearch");
global $cfg_pointRatio;
// 搜索结果 或导出
if($action == "search" || $action == "export"){

    $where = "";

    $where = getCityFilter('s.`cityid`');
    if ($cityid){
        $where .= getWrongCityFilter('s.`cityid`', $cityid);
    }

    //订单编号
    if(!empty($ordernum)){
      $where .= " AND (o.`ordernum` like '%$ordernum%' OR o.`ordernumstore` like '%$ordernum%')";
    }

    //店铺名称
    if(!empty($shopname)){
      $where .= " AND s.`shopname` like '%$shopname%'";
    }

    //店铺ID
    if(!empty($shopid)){
      $where .= " AND o.`sid` = $shopid";
    }

    //姓名
    if(!empty($person)){
      $where .= " AND o.`person` LIKE '%$person%'";
    }

    //顾客ID
    if(!empty($personId)){
      $checkMore = true;
      if(is_numeric($personId)){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = $personId");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
          $where .= " AND o.`uid` = $personId";
          $checkMore = false;
        }
      }

      if($checkMore){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` LIKE '%$personId%' || `phone` LIKE '%$personId%' || `email` LIKE '%$personId%' || `nickname` LIKE '%$personId%'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
          $uids = arr_foreach($ret);
          $where .= " AND o.`uid` IN (".join(",", $uids).")";
        }else{
          $where .= " AND 1 = 2";
        }
      }
    }

    //电话
    if(!empty($tel)){
      $where .= " AND o.`tel` like '%$tel%'";
    }

    //收货地址
    if(!empty($address)){
      $where .= " AND o.`address` like '%$address%'";
    }

    //下单时间
    if(!empty($paydate)){
      $start = $paydate[0];
      $end = $paydate[1];

      $where1 = "";
      if(!empty($start)){
        $start = GetMkTime($start);
        $where1 = "o.`pubdate` >= $start";
      }
      if(!empty($end)){
        $end = GetMkTime($end);
        $where1 = $where1 == "" ? "o.`pubdate` <= $end" : ($where1." AND "."o.`pubdate` <= $end");
      }

      if($where1 != ""){
        $where .= " AND (".$where1.")";
      }
    }

    //配送员
    if(!empty($peisongid)){
        if(strstr($peisongid, 'o_')){
            $peisongid = str_replace('o_', '', $peisongid);
            $where .= " AND o.`is_other` = $peisongid AND o.`peisongid` = 0";
        }else{
            $where .= " AND o.`is_other` = 0 AND o.`peisongid` = $peisongid";
        }
    }

    //支付方式
    if(!empty($paytype)){
        if($paytype == 'online'){
            $where .= " AND (o.`paytype` = 'alipay' || `paytype` = 'wxpay')";
        }else{
            $where .= " AND o.`paytype` = '$paytype'";
        }
    }

    //订单金额
    if(!empty($amount)){
        $min = $amount[0];
        $max = $amount[1];

        $min = $min ? (int)$min : 0;
        $max = $max ? (int)$max : 0;

        $where1 = "";

        if(!empty($min)){
          $where1 = "o.`amount` >= $min";
        }
        if(!empty($max)){
          $where1 = $where1 == "" ? "o.`amount` <= $max" : ($where1." AND "."o.`amount` <= $max");
        }

        if($where1 != ""){
          $where .= " AND (".$where1.")";
        }

    }

    //订单状态
    if($state != ""){
        $where .= " AND o.`state` = '$state'";
    }

    //完成时间
    if($comtime && $state != 1){
        $time = $comtime * 60;
        $where .= " AND (o.`state` = 1 && (o.`okdate` - o.`paydate` <= $time))";
    }



    $list = array();
    $pageSize = $action == "export" ? 99999999999 : 15;
        $sql = $dsql->SetQuery("SELECT o.`point`,o.`id`, o.`uid`, o.`sid`, o.`ordernum`, o.`ordernumstore`, o.`state`, o.`food`, o.`person`, o.`tel`, o.`address`,o.`priceinfo`, o.`paytype`, o.`preset`, o.`note`, o.`pubdate`,o.`paydate`,o.`confirmdate`,o.`tostoredate`,o.`mealtime`,o.`peidate`,o.`songdate`, o.`okdate`,o.`cpmoney`,o.`cptype`, o.`amount`, o.`peisongid`, o.`peisongidlog`, o.`failed`,o.`fencheng_foodprice`,o.`fencheng_delivery`,o.`fencheng_dabao`,o.`fencheng_addservice`,o.`fencheng_discount`,o.`fencheng_promotion`,o.`fencheng_firstdiscount`,o.`fencheng_offline`,o.`fencheng_quan`,o.`refrundstate`,o.`refrundamount`,o.`peerpay`,s.`cityid`,s.`shopname`,s.`phone` 'shoptel',o.`mytcancel_fee`,o.`is_other`,o.`othercourierparam` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1".$where." ORDER BY o.`id` DESC");

    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");

    if($totalCount == 0){

      $huoniaoTag->assign("list", $list);

    }else{

      //总分页数
      $totalPage = ceil($totalCount/$pageSize);

      $p = (int)$p == 0 ? 1 : (int)$p;
      $atpage = $pageSize * ($p - 1);
      $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

      foreach ($results as $key => $value) {
          $staticmoney = 0;
        $list[$key]['id']         = $value['id'];
        $list[$key]['uid']        = $value['uid'];
        if($value['id']){

            $staticmoney              = getwaimai_staticmoney('2',$value['id']);
        }
        //用户名
        $userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value["uid"]);
        $username = $dsql->dsqlOper($userSql, "results");
        if(count($username) > 0){
            $list[$key]["username"] = $username[0]['nickname'] ?: $username[0]['username'];
        }else{
            $list[$key]["username"] = "未知";
        }

        $list[$key]['sid']           = $value['sid'];
        $list[$key]['shopname']      = $value['shopname'];
        $list[$key]['shoptel']      = $value['shoptel'];
	    $list[$key]['cityname']      = getSiteCityName($value['cityid']);
        $list[$key]['ordernum']      = $value['ordernum'];
        $list[$key]['ordernumstore'] = $value['ordernumstore'];
        $list[$key]['state']         = $value['state'];
        //查询佣金是平台还是商家承担

        $pingsql = $dsql->SetQuery("SELECT `bear`  FROM `#@__member_money`  WHERE `showtype` = '1' AND  `info` like '%{$value['ordernum']}%'");
        $pingres= $dsql->dsqlOper($pingsql,"results");
        $list[$key]['bearfenyong'] = $pingres[0]['bear'];
        //佣金金额明细
        $fenxiaomoneysql = $dsql->SetQuery("SELECT f.`amount`,f.`uid` ,m.`username`  FROM `#@__member_fenxiao` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE f.`ordernum` = '".$value['ordernum']."' AND f.`module`= 'waimai'");
        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
        $allfenxiao     = array_sum(array_column($fenxiaomonyeres, 'amount'));
        $list[$key]['allfenxiao'] = $allfenxiao;
        $list[$key]['fenxiaomonyeres'] = $fenxiaomonyeres;

        $list[$key]['food']          = unserialize($value['food']);
        $list[$key]['person']        = $value['person'];
        $list[$key]['mytcancel_fee'] = $value['mytcancel_fee'];
        $list[$key]['tel']           = $value['tel'];
        $list[$key]['address']       = $value['address'];
        $list[$key]['ptyd']          = $staticmoney['ptyd'];
        $list[$key]['business']      = $staticmoney['business'];
        // $list[$key]['paytype']       = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : $value['paytype']);
        $_paytype = getPaymentName($value['paytype']);

        if($value['peerpay'] > 0){
            $userinfo = $userLogin->getMemberInfo($value['peerpay']);
            if(is_array($userinfo)){
                $_paytype = '['.$userinfo['nickname'].']'.$_paytype.'代付';
            }else{
                $_paytype = '['.$value['peerpay'].']'.$_paytype.'代付';
            }
        }

        $list[$key]['paytype']      = $_paytype;
        $list[$key]['preset']        = unserialize($value['preset']);
        $list[$key]['note']          = $value['note'];
        $list[$key]['pubdate']       = $value['pubdate'];
        $list[$key]['paydate']      = $value['paydate'];
        $list[$key]['confirmdate']       = $value['confirmdate'];
        $list[$key]['tostoredate']       = $value['tostoredate'];
        $list[$key]['mealtime']       = $value['mealtime'];
        $list[$key]['peidate']       = $value['peidate'];
        $list[$key]['songdate']       = $value['songdate'];
        $list[$key]['okdate']        = $value['okdate'];
        $list[$key]['cpmoney']        = $value['cpmoney'];
        $list[$key]['cptype']        = $value['cptype'];
        $point                       = $value['point'] / $cfg_pointRatio;                  //积分
        $list[$key]['amount']        = $value['amount'] + $point ;
        $list[$key]['peisongid']     = $value['peisongid'];
        $list[$key]['peisongidlog']  = $value['peisongidlog'] ? substr($value['peisongidlog'], 0, -4) : "";
        $list[$key]['failed']        = $value['failed'];
        $list[$key]['refrundstate']  = $value['refrundstate'] == 1 ? '是': '否';
        $list[$key]['refrundamount'] = $value['refrundamount'];
        $list[$key]['priceinfo']      = unserialize($value['priceinfo']);
        if(is_array($list[$key]['priceinfo'])){
          foreach ($list[$key]['priceinfo'] as $item){
              if($item['type']=="peisong"){
                  $list[$key]['amount_deliver'] = $item['amount'];
              }
              elseif($item['type']=="dabao"){
                  $list[$key]['amount_dabao'] = $item['amount'];
              }
          }
        }
        $list[$key]['amount_deliver'] = $list[$key]['amount_deliver'] ?: "0.00";
        $list[$key]['amount_dabao'] = $list[$key]['amount_dabao'] ?: "0.00";

        $list[$key]['fencheng_foodprice']           = (int)$value['fencheng_foodprice'];
        $list[$key]['fencheng_delivery']            = (int)$value['fencheng_delivery'];
        $list[$key]['fencheng_dabao']               = (int)$value['fencheng_dabao'];
        $list[$key]['fencheng_addservice']          = (int)$value['fencheng_addservice'];
        $list[$key]['fencheng_discount']            = (int)$value['fencheng_discount'];
        $list[$key]['fencheng_promotion']           = (int)$value['fencheng_promotion'];
        $list[$key]['fencheng_firstdiscount']       = (int)$value['fencheng_firstdiscount'];
        $list[$key]['fencheng_offline']             = (int)$value['fencheng_offline'];
        $list[$key]['fencheng_quan']                = (int)$value['fencheng_quan'];
        $list[$key]['fencheng_quan']                = (int)$value['fencheng_quan'];
        $list[$key]['is_other']                     = (int)$value['is_other'];

        if ($value['is_other'] == 0) {
            $sql = $dsql->SetQuery("SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = " . $value['peisongid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $list[$key]['peisongname'] = $ret[0]['name'];
                $list[$key]['peisongtel']  = $ret[0]['phone'];
            }
        } else {
            $otherCourier = $value['othercourierparam'] != '' ? unserialize($value['othercourierparam']) : array();
    
            if ($otherCourier) {
    
                $list[$key]['peisongname'] = $otherCourier['driver_name'];
                $list[$key]['peisongtel']  = $otherCourier['driver_mobile'];
                $peisonglogistic = $otherCourier['driver_logistic'];
                $list[$key]['peisonglogistic'] = '';
                $peisongbiaoshi=array('mtps' => '美团', 'fengka' => '蜂鸟', 'dada' => '达达','shunfeng' => '顺丰','bingex' => '闪送','uupt' => 'UU跑腿','dianwoda' => '点我达','aipaotui' => '爱跑腿','caocao' => '曹操','fuwu' => '快服务');
                foreach ($peisongbiaoshi as $kk=>$vv){
                    if ($kk == $peisonglogistic){
                        $list[$key]['peisonglogistic'] = $vv;
                    }
                }
            } else {
    
                $list[$key]['peisongname'] = '未知';
                $list[$key]['peisongtel']  = '';
                $list[$key]['peisonglogistic'] = '';
            }
        }
        
      }
      $huoniaoTag->assign("state", $state);
      $huoniaoTag->assign("list", $list);

      $pagelist = new pagelist(array(
        "list_rows"   => $pageSize,
        "total_pages" => $totalPage,
        "total_rows"  => $totalCount,
        "now_page"    => $p
      ));
      $huoniaoTag->assign("pagelist", $pagelist->show());

    }

    // 导出表格
    if($action == "export"){

      if(empty($list)){
        echo '{"state": 200, "info": "暂无数据！"}';
        die;
      }
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单编号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '店铺'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '店铺电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '顾客ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '详情'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '备注'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '总价'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送费'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打包费'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '费用明细'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '确认时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '骑手到店时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家出餐时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '接单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '完成时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '完成速度（分钟）'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '超时赔付'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '赔付承担'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商品原价分成'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送费分'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打包分成'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '增值服务费分成'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '折扣分摊'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '满减分摊'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '首单减免分摊'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '是否扣除货到付款项'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '优惠卷分'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '真实订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '是否退款'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '退款金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '佣金明细'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家收入'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台收入'));
        if ($state == 7){
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单取消违约金'));
        }


        $filename = date("YmdHis").time().".csv";
        $folder = HUONIAOROOT . "/uploads/waimai/export/";
        $filePath = $folder.$filename;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        fputcsv($file, $tit);

      foreach($list as $data){
        // 详情
          $data['business'] = number_format($data['business'],2);
          $data['ptyd'] = number_format($data['ptyd'],2);
        $foods = array();
        if(is_array($data['food'])){
          foreach($data['food'] as $food){
              if (empty($food['ntitle'])){
                  array_push($foods, $food['title']."【".$food['count']."】");
              }else{
                  array_push($foods, $food['title']."-".$food['ntitle']."【".$food['count']."】");

              }
          }
        }

          $arr = array();
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernumstore']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['shopname']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['shoptel']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['uid']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['person']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['tel']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['address']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', join(",", $foods)));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount_deliver']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount_dabao']));
          $price_info = $data['priceinfo'] ?: array();
          $price_info_str = "";
          foreach ($price_info as $item){
                $price_info_str .= $item['body'];
                if($item['type']== "youhui" || $item['type']=="" || $item['type']==""){
                    $price_info_str .= "-";
                }
                $price_info_str .= $item['amount'];
                $price_info_str .= PHP_EOL;
          }
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $price_info_str));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peisongname']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date("Y-m-d H:i:s", $data['pubdate'])));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date("Y-m-d H:i:s", $data['paydate'])));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['confirmdate'] ? date("Y-m-d H:i:s", $data['confirmdate'])  : ""));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['tostoredate'] ? date("Y-m-d H:i:s", $data['tostoredate'])  : ""));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['mealtime'] ? date("Y-m-d H:i:s", $data['mealtime'])  : ""));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peidate'] ? date("Y-m-d H:i:s", $data['peidate']) : ""));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['songdate'] ? date("Y-m-d H:i:s", $data['songdate']) : ""));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['okdate'] ? date("Y-m-d H:i:s", $data['okdate']) : ""));
          if($data['state']==1){
             $use_time = ceil(($data['okdate']-$data['pubdate'])/60);
          }
          else{
             $use_time = "";
          }
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $use_time));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cpmoney'] == 0 ? "" : $data['cpmoney']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cptype'] == 1 ? "商家" : ( $data['cptype']==2 ? "骑手" : "平台")));
          if($data['state']==1){
              $orderstate = "已完成";
          }
          elseif($data['state']==2){
              $orderstate = "未处理";
          }
          elseif($data['state']==3){
              $orderstate = "已确认";
          }
          elseif($data['state']==4){
              $orderstate = "已接单";
          }
          elseif($data['state']==6){
              $orderstate = "已取消";
          }
          elseif($data['state']==7){
              $orderstate = "失败";
          }
          else{
              $orderstate = "未知";
          }
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $orderstate));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paytype']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_foodprice'])."%,平台:".$data['fencheng_foodprice']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_delivery'])."%,平台:".$data['fencheng_delivery']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_dabao'])."%,平台:".$data['fencheng_dabao']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_addservice'])."%,平台:".$data['fencheng_addservice']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_discount'])."%,平台:".$data['fencheng_discount']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_promotion'])."%,平台:".$data['fencheng_promotion']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_firstdiscount'])."%,平台:".$data['fencheng_firstdiscount']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_offline'])."%,平台:".$data['fencheng_offline']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_quan'])."%,平台:".$data['fencheng_quan']."%"));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refrundstate']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refrundamount']));
          if($data['bearfenyong']==2){
              $bearfenyong = "[商家承担]";
          }
          elseif($data['bearfenyong']==1){
              $bearfenyong = "[平台承担]";
          }
          else{
              $bearfenyong = "";
          }
          if($data['fenxiaomonyeres']){
              $fenyongyusers = array_column($data['fenxiaomonyeres'],"username");
              $bearfenyong .= PHP_EOL."(分佣用户：".join("、",$fenyongyusers).")";
          }
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "佣金总额:".$data['allfenxiao'].$bearfenyong));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['business']));
          array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ptyd']));
          if ($state == 7){
              array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['mytcancel_fee']));
          }



          //写入文件
          fputcsv($file, $arr);
      }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename =".$filename."");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
        die;
    }

// 搜索表单
}else{

        // 店铺列表
        $shop = array();
        $sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__waimai_shop` s WHERE 1 = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $shop = $ret;
        }
        $huoniaoTag->assign('shop', $shop);

    //配送员
    $courier = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` ORDER BY `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            array_push($courier, array(
                "id" => $value['id'],
                "name" => $value['name']
            ));
        }
    }
    $huoniaoTag->assign("courier", $courier);


    // 完成时间 分钟
    for($i = 1; $i <=60; $i++){
        $comtime[] = $i;
    }
    $huoniaoTag->assign("comtime", $comtime);

}

$huoniaoTag->assign("action", $action);

$huoniaoTag->assign('city', $adminCityArr);

//验证模板文件
if(file_exists($tpl."/".$templates)){

  //css
	$cssFile = array(
		'admin/jquery-ui.css',
		'admin/styles.css',
		'admin/ace-fonts.min.css',
		'admin/select.css',
		'admin/ace.min.css',
		'admin/animate.css',
		'admin/font-awesome.min.css',
		'admin/simple-line-icons.css',
    'ui/jquery.chosen.css',
    'admin/chosen.min.css',
		'admin/font.css',
		// 'admin/app.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //配送员
    $courier = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` ORDER BY `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            array_push($courier, array(
                "id" => $value['id'],
                "name" => $value['name']
            ));
        }
    }
    $huoniaoTag->assign("courier", $courier);

    //查询是否安装第三方配送插件
    $otherpeisongArr = array();
    $sql = $dsql->SetQuery("SELECT `pid`, `title` FROM `#@__site_plugins` WHERE `pid` in (13,19)");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            array_push($otherpeisongArr, array(
                'id' => $val['pid'] == 13 ? 1 : 3,
                'title' => $val['title']
            ));
        }
    }
    $huoniaoTag->assign('otherpeisongArr', $otherpeisongArr);

    $personId = empty($personId) ? 0 : $personId;
    $huoniaoTag->assign("personId", $personId);

    //js
	$jsFile = array(
		'ui/bootstrap.min.js',
    'ui/jquery-ui.min.js',
    'ui/jquery.form.js',
		'ui/chosen.jquery.min.js',
    'ui/jquery-ui-timepicker-addon.js',
		'admin/waimai/waimaiOrderSearch.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
