<?php
/**
 * 智慧城市支付主文件
 *
 * @version        $Id: wxpay.php $v1.0 2018-12-10 下午23:35:11 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "devpay";

    /* 名称 */
    $payment[$i]['pay_name'] = "智慧城市支付";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '用户使用智慧城市“扫一扫”扫描二维码后，引导用户完成支付。';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => 'APP支付',  'type' => 'split'),
        array('title' => 'APPID',     'name' => 'APPID',      'type' => 'text'),
        //array('title' => '商户号',     'name' => 'MCHID',     'type' => 'text'),
        //array('title' => 'KEY',       'name' => 'KEY',        'type' => 'text'),
        array('title' => 'APPSECRET', 'name' => 'APPSECRET',  'type' => 'text'),
        // array('title' => 'shopopenid', 'name' => 'shopopenid',  'type' => 'text'),
        //array('title' => 'APP支付',    'type' => 'split'),
        //array('title' => 'APPID',     'name' => 'APP_APPID',     'type' => 'text'),
        //array('title' => '商户号',     'name' => 'APP_MCHID',     'type' => 'text'),
        //array('title' => 'KEY',       'name' => 'APP_KEY',       'type' => 'text'),
        //array('title' => 'APPSECRET', 'name' => 'APP_APPSECRET', 'type' => 'text')
    );

    return;
}

 class devpay{

    private $appid;               //密钥ID
    private $appsecret;           //密钥
    private $shopopenid;          //商铺
    public  $version = "2018-12-06";   //API版本号
    public function __construct(){
        $dsql = new dsql($dbo);
        $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'devpay' AND `state` = 1");
        $payment = $dsql->dsqlOper($archives, "results");

        $pay_config = unserialize($payment[0]['pay_config']);
        $paymentArr = array();

        //验证配置
        foreach ($pay_config as $key => $value) {
            if (!empty($value['value'])) {
                $paymentArr[$value['name']] = $value['value'];
            }
        }

        $this->appid      = $paymentArr['APPID'];
        $this->appsecret  = $paymentArr['APPSECRET'];
        $this->shopopenid = $paymentArr['shopopenid'];
    }

    /**
     *  作用：生成签名
     * @param $obj 需要进行签名的数据
     * @param $key 接口验证密钥，在第三方开发配置中填入的Key值
     * @return string(32) sing的值
     */
    public function getSign($Obj, $key)
    {
        foreach ($Obj as $k => $v)
        {
            $Parameters[$k] = $v;
        }
        //签名步骤一：按字典序排序参数
        ksort($Parameters);
        $String = $this->formatBizQueryParaMap($Parameters);
        //echo '【string1】'.$String.'</br>';
        //签名步骤二：在string后加入KEY
        $String = $String.$key;
        #echo "【string2】" . $String . "</br>";
        //签名步骤三：MD5加密
        $String = md5($String);
        //echo "【string3】 ".$String."</br>";
        //签名步骤四：所有字符转为大写
        $result_ = strtoupper($String);
        //echo "【result】 ".$result_."</br>";
        return $result_;
    }

    /**
     *  作用：格式化参数，签名过程需要使用
     */
    public function formatBizQueryParaMap($paraMap)
    {
        return urldecode(http_build_query($paraMap));
    }

    /**
     * 预下单
     * @desc:appid  true    平台授权接口可用的appid
     * @desc:sign   true    签名参数
     * @desc:shop_openid    true    店铺openid
     * @desc:order_money    true    订单金额
     * @desc:out_trade_no   false   商户订单号 不传自动生成
     * @desc:member_openid  false   会员openid 不能与card_no同时传递
     * @desc:if_discount    false   是否优惠 传1表示有优惠，不传或传其他情况无优惠
     * @desc:callback_url   false   回调地址 http协议
     * @desc:card_no    false   匿名卡卡号 不能与member_openid同时传递
     */
    // public function pre_order($order){//下单 用户的钱去哪个账号了
    public function get_code($order, $payment){//下单 用户的钱去哪个账号了
        // print_r($order);
        // 加载支付方式操作函数
        loadPlug("payment");

        global $app;
        global $dsql;
        global $cfg_staticPath;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $huoniaoTag;
        global $userLogin;
        $cfg_basehost_ = $cfg_secureAccess.$cfg_basehost;

        $userid = $userLogin->getMemberID();
        $member_openid = "";
        if($userid > 0){
            $sql = $dsql->SetQuery("SELECT `discount` FROM `#@__member` WHERE `id` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            $member_openid = $res[0]['discount'];
        }

        $shop_openid = '';
        $module = $order['service'];
        $ordernum = $order['order_sn'];

        if($module == 'shop'){
            $sql = $dsql->SetQuery("SELECT s.`shop_openid` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE o.`ordernum` = '".$ordernum."'");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $shop_openid = $res[0]['shop_openid'];
            }
        }elseif($module == 'tuan'){
            $sql = $dsql->SetQuery("SELECT s.`shop_openid` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE `ordernum` = '".$ordernum."'");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $shop_openid = $res[0]['shop_openid'];
            }
        }elseif($module == 'waimai'){
            $sql = $dsql->SetQuery("SELECT s.`shop_openid` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`ordernum` = '".$ordernum."'");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $shop_openid = $res[0]['shop_openid'];
            }
        }elseif($module == 'info'){
            $sql = $dsql->SetQuery("SELECT s.`shop_openid`, o.`store` FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON s.`id` = o.`store` WHERE o.`ordernum` = '".$ordernum."'");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $shop_openid = $res[0]['store'] == 0 ? -1 : $res[0]['shop_openid'];
            }
        }else{
            $shop_openid = -1;
        }
        // echo $shop_openid;die;

        // $shop_openid为-1时说明不存在商家，该笔支付为充值、打赏等类型
        if($shop_openid == -1){

            if($userid <= 0){
                $url = $cfg_basehost_."/login.html";
                header("location:".$url);
                die;
                // die('<meta charset="UTF-8"><script type="text/javascript">alert("您还没有登陆");location.href = "'.$url.'";</script>');
            }

            // 打赏
            if($module == "article" || $module == "tieba"){
                if($userid <= 0){
                    $url = $cfg_basehost_."/login.html";
                    header("location:".$url);
                    die;
                    // die('<meta charset="UTF-8"><script type="text/javascript">alert("您还没有登陆");location.href = "'.$url.'";</script>');
                }
                $sql = $dsql->SetQuery("SELECT r.*, m1.`discount` uid_openid, m2.`discount` to_openid FROM `#@__member_reward` r LEFT JOIN `#@__member` m1 ON m1.`id` = r.`uid` LEFT JOIN `#@__member` m2 ON m2.`id` = r.`touid` WHERE r.`module` = '$module' AND r.`ordernum` = '$ordernum' AND r.`state` = 0");
                $res = $dsql->dsqlOper($sql, "results");
                if($res){

                    $dsr = $res[0]['uid_openid'];
                    $bdsr = $res[0]['to_openid'];
                    if($dsr == ''){
                        die('<meta charset="UTF-8"><script type="text/javascript">alert("登录信息错误");history.go(-1);</script>');
                    }
                    return $this->dashang($dsr, $bdsr, $res[0]['amount'], $res[0]);
                }
            }else{

                if($member_openid == ""){
                    die('<meta charset="UTF-8"><script type="text/javascript">alert("身份信息错误");location.href = "'.$cfg_basehost_.'";</script>');
                }
                if($module == "member"){
                    $sql = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordertype` = 'member' AND `ordernum` = '$ordernum'");
                    $res = $dsql->dsqlOper($sql, "results");
                    if($res){
                        $body = unserialize($res[0]['body']);
                        if(is_array($body)){
                            // 充值
                            if($body['type'] == 'deposit'){
                                $this->member_recharge($userid, $order['order_amount']);
                            }
                        }
                    }
                }
            }
            return;
        }elseif($shop_openid == ''){
            die('<meta charset="UTF-8"><script type="text/javascript">alert("商家shop_openid不存在，请联系商家或网站管理员");history.go(-1);</script>');
        }

        $param["appid"]        = $this->appid;
        $param["shop_openid"]  = $shop_openid;
        $param["order_money"]  = $order['order_amount'];
        $param["out_trade_no"] = $order['order_sn'];
        $param["member_openid"]= $member_openid;
        //$param["card_no "]     = $order['card_no'] ? $order['card_no'] : '';
        $param['callback_url'] = notify_url("devpay", "&out_trade_no=".$param["out_trade_no"]);
        $param['jump_url'] = return_url("devpay", "&module={$module}&sn={$ordernum}");

        $sign = $this->getSign($param, $this->appsecret);
        $param["sign"] = $sign;
        //print_r($param);die;

        $order_code = "";
        $queryOrder = $this->order_query($param);
        if(GetIP() == '114.219.20.130'){
            //print_r($queryOrder);die;
        }

        // 订单已存在
        if($queryOrder['state'] == '100'){
            $order_code = $queryOrder['data']['order_code'];

        // 无此订单 -> 预下单
        }else{
            $url = "http://hy.nmgzhcs.com/api/pay/pre_order";//传参地址
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL,$url);
            curl_setopt($ch, CURLOPT_HEADER,0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $param);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $datajson = curl_exec($ch);
            if ($datajson === FALSE){
                echo 'cURL Error:'.curl_error($ch);
                die('err');
            }
            curl_close($ch);
            $respObject = json_decode($datajson,true);
            //print_r($respObject);die;
            if($respObject['status'] == 'y'){
                $order_code = $respObject['data']['order_code'];
                //对数据重新拼装
                // $orderInfo = array(
                //     "sign"         => $sign,
                //     "order_code"   => $respObject['data']['order_code'],
                //     "order_money"  => $respObject['data']['order_money'],
                //     "out_trade_no" => $respObject['data']['out_trade_no'],
                //     "shop_openid"  => $payment["shop_openid"],
                // );
            }else{
                die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$respObject['info'].'");history.go(-1);</script>');
            }
        }

        $url = "http://hy.nmgzhcs.com/sk/q/h5_pay?order_code=".$order_code;
        header("location:".$url);
        die;
    }


    /**
     * 订单查询
     * @desc:appid  true    平台授权接口可用的appid
     * @desc:sign   true    签名参数
     * @desc:out_trade_no   true    string  商户订单号
     */
    public function order_query($order){
         $param["appid"]         = $this->appid;
         $param["out_trade_no"]  = $order['out_trade_no'];

         $sign = $this->getSign($param, $this->appsecret);
         $param["sign"] = $sign;

         //$data_string =  json_encode($param);

         $url = "http://hy.nmgzhcs.com/api/pay/order_query";//传参地址

         $ch = curl_init();
         curl_setopt($ch, CURLOPT_URL,$url);
         curl_setopt($ch, CURLOPT_HEADER,0);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
         curl_setopt($ch, CURLOPT_POST, 1);
         curl_setopt($ch, CURLOPT_POSTFIELDS, $param);
         curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
         $datajson = curl_exec($ch);
         if ($datajson === FALSE){
            return array("state"=>200, "info"=> "请求错误");
         }
         curl_close($ch);

         $respObject = json_decode($datajson,true);

         if($respObject['status'] == 'y'){
            return array("state"=>100, "info"=>$respObject['info'], "data"=>$respObject['data']);
         }else{
            return array("state"=>200, "info"=>$respObject['info']);
         }
         die;
    }


    /**
     * 响应操作
     */
    public function respond(){
        // 加载支付方式操作函数
        loadPlug("payment");

        $payment  = get_payment("devpay");

        /* GET */
        foreach($_GET as $k => $v) {
            $_GET[$k] = $v;
        }

        /* POST */
        foreach($_POST as $k => $v) {
            $_GET[$k] = $v;
        }

        //订单号
        $order_sn = $_GET['out_trade_no'];

        //签名
        //$sign = base64_decode($_GET['sign']);

        $order['out_trade_no'] = $_GET['out_trade_no'];

        require_once(HUONIAOROOT."/api/payment/log.php");
        $devpayLog = new CLogFileHandler(HUONIAOROOT . '/log/devpay.log');
        $devpayLog->DEBUG(date("Y-m-d H:i:s",time()) . "\r" . json_encode($_GET) . "\r\n\r\n");

        $res = $this->order_query($order);

        if($res['state']==100){
            $data = $res['data'];

            $order_sn    = $data['out_trade_no'];
            $order_money = $data['order_money'];

            if (!check_money($order_sn, $order_money)){
              return false;
            }

            if($data['pay_status'][0]['status']==2){//已付款
                order_paid($order_sn);
                return true;
            }
        }else{
            return false;
        }
    }

    /**
     * 会员充值
     */
    public function member_recharge($member_id, $money){
        // echo $member_recharge;die;
        $gourl = "http://hy.nmgzhcs.com/wxmember/recharge";
        header("location:".$url);
        die;

        $param = array();
        $param['appid'] = $this->appid;
        $param['member_id'] = $member_id;
        $param['sign'] = $this->getSign($param, $this->appsecret);

        $url = "http://hy.nmgzhcs.com/api/membercenter/member_recharge";//传参地址

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_HEADER,0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $param);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $datajson = curl_exec($ch);
        if ($datajson === FALSE){
            return array("state"=>200, "info"=> "请求错误");
        }
        curl_close($ch);
        $respObject = json_decode($datajson,true);

        if($respObject['status'] == 'y'){
            $order_code = $respObject['data']['code'];
            $this->sub_member_recharge($member_id, $order_code, $money);
        }else{
            return array("state"=>200, "info"=>$respObject['info']);
        }
        die;
    }

    /**
     * 提交充值订单
     * @return [type] [description]
     */
    public function sub_member_recharge($member_id, $order_code, $pay_money){
        $param = array();
        $param['appid'] = $this->appid;
        $param['sign'] = $this->getSign($param, $this->appsecret);
        $param['member_id'] = $member_id;
        $param['pay_method'] = 3;   //支付方式 传相对应的数字 微信3 支付宝4 电子市民卡9
        $param['origin'] = 1;       //来源 app传1 小程序传2
        $param['order_code'] = $order_code;   //充值单号
        $param['pay_money'] = $pay_money;   //充值单号

        $url = "http://hy.nmgzhcs.com/api/membercenter/sub_member_recharge";//传参地址

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_HEADER,0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $param);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $datajson = curl_exec($ch);
        if ($datajson === FALSE){
            return array("state"=>200, "info"=> "请求错误");
        }
        curl_close($ch);

        $respObject = json_decode($datajson,true);

        if($respObject['status'] == 'y'){
            return array("state"=>100, "info"=>$respObject['info'], "data"=>$respObject['data']);
        }else{
            return array("state"=>200, "info"=>$respObject['info']);
        }
        die;
    }

    private function dashang($dsr, $bdsr, $money, $order){
        $url = "http://hy.nmgzhcs.com/api/pay/ds";//传参地址

        $param = array();
        $param['appid'] = $this->appid;
        $param['dsr'] = $dsr;
        $param['bdsr'] = $bdsr;
        $param['money'] = $money;
        $param['sign'] = $this->getSign($param, $this->appsecret);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_HEADER,0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $param);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $datajson = curl_exec($ch);
        if ($datajson === FALSE){
            return array("state"=>200, "info"=> "请求错误");
        }
        curl_close($ch);
        $respObject = json_decode($datajson,true);

        if($respObject['status'] == 'y'){
            global $dsql;

            // 内部业务------------------
            // 更新订单状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_reward` SET `state` = 1 WHERE `id` = ".$order['id']);
            $dsql->dsqlOper($sql, "update");

            die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$respObject['info'].'");history.go(-1);</script>');
        }else{
            die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$respObject['info'].'");history.go(-1);</script>');
        }
        die;
    }

 }



?>
