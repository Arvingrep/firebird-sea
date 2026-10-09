<?php
/**
 * 企业付款到零钱
 *
 * @version        $Id: wxpayTransfers.php $v1.0 2019-7-9 下午17:24:16 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

class AesUtil
{
    /**
     * AES key
     *
     * @var string
     */
    private $aesKey;

    const KEY_LENGTH_BYTE = 32;
    const AUTH_TAG_LENGTH_BYTE = 16;

    /**
     * Constructor
     */
    public function __construct($aesKey)
    {
        if (strlen($aesKey) != self::KEY_LENGTH_BYTE) {
            throw new InvalidArgumentException('无效的ApiV3Key，长度应为32个字节');
        }
        $this->aesKey = $aesKey;
    }

    /**
     * Decrypt AEAD_AES_256_GCM ciphertext
     *
     * @param string    $associatedData     AES GCM additional authentication data
     * @param string    $nonceStr           AES GCM nonce
     * @param string    $ciphertext         AES GCM cipher text
     *
     * @return string|bool      Decrypted string on success or FALSE on failure
     */
    public function decryptToString($associatedData, $nonceStr, $ciphertext)
    {
        $ciphertext = \base64_decode($ciphertext);
        if (strlen($ciphertext) <= self::AUTH_TAG_LENGTH_BYTE) {
            return false;
        }

        // ext-sodium (default installed on >= PHP 7.2)
        if (function_exists('\sodium_crypto_aead_aes256gcm_is_available') &&
            \sodium_crypto_aead_aes256gcm_is_available()) {
            return \sodium_crypto_aead_aes256gcm_decrypt($ciphertext, $associatedData, $nonceStr, $this->aesKey);
        }

        // ext-libsodium (need install libsodium-php 1.x via pecl)
        if (function_exists('\Sodium\crypto_aead_aes256gcm_is_available') &&
            \Sodium\crypto_aead_aes256gcm_is_available()) {
            return \Sodium\crypto_aead_aes256gcm_decrypt($ciphertext, $associatedData, $nonceStr, $this->aesKey);
        }

        // openssl (PHP >= 7.1 support AEAD)
        if (PHP_VERSION_ID >= 70100 && in_array('aes-256-gcm', \openssl_get_cipher_methods())) {
            $ctext = substr($ciphertext, 0, -self::AUTH_TAG_LENGTH_BYTE);
            $authTag = substr($ciphertext, -self::AUTH_TAG_LENGTH_BYTE);

            return \openssl_decrypt($ctext, 'aes-256-gcm', $this->aesKey, \OPENSSL_RAW_DATA, $nonceStr,
                $authTag, $associatedData);
        }

        throw new \RuntimeException('AEAD_AES_256_GCM需要PHP 7.1以上或者安装libsodium-php');
    }
}

/**
 * 类
 */
class wxpayTransfers {

    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $appId;
    public $rsaPrivateKey;
    public $wxpayrsaPublicKey;

    function __construct(){
        $this->wxpayTransfers();
    }

    //转账失败错误字典
    public $wxPayV3TransferError = array(
        'ACCOUNT_FROZEN'=>'账户冻结,该用户账户被冻结',
        'REAL_NAME_CHECK_FAIL'=>'用户未实名,收款人未实名认证，需要用户完成微信实名认证',
        'NAME_NOT_CORRECT'=>'用户姓名校验失败,收款人姓名校验不通过，请核实信息',
        'OPENID_INVALID'=>'Openid校验失败,Openid格式错误或者不属于商家公众账号',
        'TRANSFER_QUOTA_EXCEED'=>'超过用户单笔收款额度,超过用户单笔收款额度，核实产品设置是否准确',
        'DAY_RECEIVED_QUOTA_EXCEED'=>'超过用户单日收款额度,超过用户单日收款额度，核实产品设置是否准确',
        'MONTH_RECEIVED_QUOTA_EXCEED'=>'超过用户单月收款额度,超过用户单月收款额度，核实产品设置是否准确',
        'DAY_RECEIVED_COUNT_EXCEED'=>'超过用户单日收款次数,超过用户单日收款次数，核实产品设置是否准确',
        'PRODUCT_AUTH_CHECK_FAIL'=>'产品权限校验失败,未开通该权限或权限被冻结，请核实产品权限状态',
        'OVERDUE_CLOSE'=>'转账关闭,超过系统重试期，系统自动关闭',
        'ID_CARD_NOT_CORRECT'=>'用户身份证校验失败,收款人身份证校验不通过，请核实信息',
        'ACCOUNT_NOT_EXIST'=>'用户账户不存在,该用户账户不存在',
        'TRANSFER_RISK'=>'转账存在风险,该笔转账可能存在风险，已被微信拦截',
        'OTHER_FAIL_REASON_TYPE'=>'其它失败,其它失败原因',
        'REALNAME_ACCOUNT_RECEIVED_QUOTA_EXCEED'=>'用户账户收款受限,请引导用户在微信支付查看详情',
        'RECEIVE_ACCOUNT_NOT_PERMMIT'=>'未配置该用户为转账收款人,请在产品设置中调整，添加该用户为收款人',
        'PAYEE_ACCOUNT_ABNORMAL'=>'用户账户收款异常,请联系用户完善其在微信支付的身份信息以继续收款',
        'PAYER_ACCOUNT_ABNORMAL'=>'商户账户付款受限,可前往商户平台获取解除功能限制指引',
        'TRANSFER_SCENE_UNAVAILABLE'=>'该转账场景暂不可用,该转账场景暂不可用，请确认转账场景ID是否正确',
        'TRANSFER_SCENE_INVALID'=>'你尚未获取该转账场景,你尚未获取该转账场景，请确认转账场景ID是否正确',
        'TRANSFER_REMARK_SET_FAIL'=>'转账备注设置失败,转账备注设置失败， 请调整后重新再试',
        'RECEIVE_ACCOUNT_NOT_CONFIGURE'=>'未配置该用户在收款用户列表,请前往商户平台-商家转账到零钱-前往功能-转账场景中添加',
        'BLOCK_B2C_USERLIMITAMOUNT_BSRULE_MONTH'=>'超出用户单月转账收款20w限额,本月不支持继续向该用户付款',
        'BLOCK_B2C_USERLIMITAMOUNT_MONTH'=>'用户账户存在风险收款受限,本月不支持继续向该用户付款',
    );

    function wxpayTransfers(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("wxpay");

        $this->appId = $payment['APPID'];
        $this->mch_id = $payment['MCHID'];
        $this->key = $payment['KEY'];

        $this->app_appId = $payment['APP_APPID'];
        $this->app_mch_id = $payment['APP_MCHID'];
        $this->app_key = $payment['APP_KEY'];
    }

    //申请回单【支付完毕，receipting为3，此时为待申请，需执行此方法】
    function v3_applyReceipt($withdrawApply,$userAuth,$config){
        global $dsql;
        $url = "https://api.mch.weixin.qq.com/v3/transfer-detail/electronic-receipts";
        $param = array(
            'accept_type'=>'BATCH_TRANSFER',
            'out_batch_no'=>$withdrawApply['batch_no'],
            'out_detail_no'=>$withdrawApply['sn']
        );
        $token = $this->v3_token($url,"POST",$param,$config);
        $result = $this->v3_https_request($url,json_encode($param),$token);//发送请求
        $receipts = json_decode($result,true);
        if(isset($receipts['code']) && $receipts['code']=="SIGN_ERROR"){
            return array("state"=>200,"info"=>"商户证书序列号有误。请使用签名私钥匹配的证书序列号");
        }
        //如果电子回单申请成功、或提示已经存在，算是已经成功
        if(isset($receipts['signature_status']) && $receipts['signature_status']=="FINISHED" || isset($receipts['code']) && $receipts['code']=="ALREADY_EXISTS"){

            $this->v3_queryReceipt($withdrawApply,$userAuth,$config); //微信已经返回申请状态为FINISH，或已经申请过了，这时去查询回单内容，失败概率应该极小，否则微信有毒

            return array("state"=>100,"info"=>"电子回单获取成功");
        }
        //如果转账电子还是受理中
        elseif(isset($receipts['signature_status']) && $receipts['signature_status']=="ACCEPTED"){
            //记录这种状态，接下来可手动在页面上重新申请，或被定时任务识别
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 1 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请受理中...");
        }
        //仅改变receipting状态，用2标识
        else{
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 2 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请失败");
        }
    }

    //获取回执单【查询】
    function v3_queryReceipt($withdrawApply,$userAuth,$config){
        global $dsql;
        //查询电子单状态代码
        $url = "https://api.mch.weixin.qq.com/v3/transfer-detail/electronic-receipts?out_batch_no={$withdrawApply['batch_no']}&out_detail_no={$withdrawApply['sn']}&accept_type=BATCH_TRANSFER";
        $token = $this->v3_token($url,"GET",array(),$config);
        $result = $this->v3_https_request($url,array(),$token);//发送请求
        $receipts = json_decode($result,true);
        if(isset($receipts['code']) && $receipts['code']=="SIGN_ERROR"){
            return array("state"=>200,"info"=>"商户证书序列号有误。请使用签名私钥匹配的证书序列号");
        }
        //如果电子回单申请成功
        if(isset($receipts['signature_status']) && $receipts['signature_status']=="FINISHED"){
            global $cfg_uploadDir;
            $download_url = $receipts['download_url'];
            //下载电子回单到本地，并上传到远程服务器
            $token = $this->v3_token($download_url,"GET",array(),$config,false);
            $fileStr = $this->v3_https_request($download_url,array(),$token);//发送请求
            $fileDir = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/";
            if(!is_dir($fileDir)){
                mkdir($fileDir,0777,true);
            }
            $file_name = $dsql->getOne($dsql::SetQuery("select `note` from `#@__member_withdraw` where `id`={$config['id']}"));
            $fileRealPath = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/{$file_name}.pdf";
            $pngPath = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/{$file_name}.png";
            file_put_contents($fileRealPath,$fileStr);  //已知是pdf
            //尝试把pdf转换为图片
            if(is_callable("exec")){
                $cmd = "magick convert -density 200 -background white -alpha remove -quality 100 $fileRealPath -append $pngPath";
                exec($cmd);
                if(file_exists($pngPath)){
                    unlinkFile($fileRealPath); //删除pdf
                    $fileRealPath = $pngPath;
                }
            }
            //上传保存到远程服务器...
            global $cfg_ftpUrl;
            global $cfg_fileUrl;
            global $cfg_uploadDir;
            global $cfg_ftpType;
            global $cfg_ftpState;
            global $cfg_ftpDir;
            global $cfg_quality;
            global $cfg_softSize;
            global $cfg_softType;
            global $cfg_editorSize;
            global $cfg_editorType;
            global $cfg_videoSize;
            global $cfg_videoType;
            global $cfg_meditorPicWidth;
            global $cfg_ftpSSL;
            global $cfg_ftpPasv;
            global $cfg_ftpServer;
            global $cfg_ftpPort;
            global $cfg_ftpUser;
            global $cfg_ftpPwd;
            global $cfg_ftpTimeout;
            global $cfg_OSSUrl;
            global $cfg_OSSBucket;
            global $cfg_EndPoint;
            global $cfg_OSSKeyID;
            global $cfg_OSSKeySecret;
            global $cfg_QINIUAccessKey;
            global $cfg_QINIUSecretKey;
            global $cfg_QINIUbucket;
            global $cfg_QINIUdomain;
            global $cfg_OBSUrl;
            global $cfg_OBSBucket;
            global $cfg_OBSEndpoint;
            global $cfg_OBSKeyID;
            global $cfg_OBSKeySecret;
            global $cfg_COSUrl;
            global $cfg_COSBucket;
            global $cfg_COSRegion;
            global $cfg_COSSecretid;
            global $cfg_COSSecretkey;

            global $editorMarkState;
            global $editor_ftpType;
            global $editor_ftpState;
            global $customUpload;
            global $custom_uploadDir;
            global $customFtp;
            global $custom_ftpType;
            global $custom_ftpState;
            global $custom_ftpDir;
            global $custom_ftpServer;
            global $custom_ftpPort;
            global $custom_ftpUser;
            global $custom_ftpPwd;
            global $custom_ftpDir;
            global $custom_ftpUrl;
            global $custom_ftpTimeout;
            global $custom_ftpSSL;
            global $custom_ftpPasv;
            global $custom_OSSUrl;
            global $custom_OSSBucket;
            global $custom_EndPoint;
            global $custom_OSSKeyID;
            global $custom_OSSKeySecret;
            global $custom_QINIUAccessKey;
            global $custom_QINIUSecretKey;
            global $custom_QINIUbucket;
            global $custom_QINIUdomain;
            global $editor_ftpDir;
            global $custom_OBSUrl;
            global $custom_OBSBucket;
            global $custom_OBSEndpoint;
            global $custom_OBSKeyID;
            global $custom_OBSKeySecret;
            global $custom_COSUrl;
            global $custom_COSBucket;
            global $custom_COSRegion;
            global $custom_COSSecretid;
            global $custom_COSSecretkey;

            $cfg_softType = $cfg_softType ? explode("|", $cfg_softType) : array();
            $cfg_editorType = $cfg_editorType ? explode("|", $cfg_editorType) : array();
            $cfg_videoType = $cfg_videoType ? explode("|", $cfg_videoType) : array();

            global $editor_uploadDir;
            $editor_uploadDir = $cfg_uploadDir;
            // $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
            $editor_ftpType = $cfg_ftpType;

            $custom_ftpState = $editor_ftpState = $cfg_ftpState;
            $custom_ftpType = $cfg_ftpType;
            $custom_ftpSSL = $cfg_ftpSSL;
            $custom_ftpPasv = $cfg_ftpPasv;
            $custom_ftpUrl = $cfg_ftpUrl;
            $custom_ftpServer = $cfg_ftpServer;
            $custom_ftpPort = $cfg_ftpPort;
            $custom_ftpDir = $editor_ftpDir = $cfg_ftpDir;
            $custom_ftpUser = $cfg_ftpUser;
            $custom_ftpPwd = $cfg_ftpPwd;
            $custom_ftpTimeout = $cfg_ftpTimeout;
            $custom_OSSUrl = $cfg_OSSUrl;
            $custom_OSSBucket = $cfg_OSSBucket;
            $custom_EndPoint = $cfg_EndPoint;
            $custom_OSSKeyID = $cfg_OSSKeyID;
            $custom_OSSKeySecret = $cfg_OSSKeySecret;
            $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
            $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
            $custom_QINIUbucket = $cfg_QINIUbucket;
            $custom_QINIUdomain = $cfg_QINIUdomain;
            $custom_OBSUrl = $cfg_OBSUrl;
            $custom_OBSBucket = $cfg_OBSBucket;
            $custom_OBSEndpoint = $cfg_OBSEndpoint;
            $custom_OBSKeyID = $cfg_OBSKeyID;
            $custom_OBSKeySecret = $cfg_OBSKeySecret;
            $custom_COSUrl = $cfg_COSUrl;
            $custom_COSBucket = $cfg_COSBucket;
            $custom_COSRegion = $cfg_COSRegion;
            $custom_COSSecretid = $cfg_COSSecretid;
            $custom_COSSecretkey = $cfg_COSSecretkey;
            $remotePath = "..".$editor_uploadDir."/siteConfig/receipt/";
            $res = getRemoteImage(array($fileRealPath), array("savePath" => $remotePath), 'siteConfig', '..', false, 2);
            $fid = "";
            if($res){
                $res = json_decode($res,true);
                if($res['state']=="SUCCESS"){
                    if($res['list'][0]['state']=="SUCCESS"){
                        $fid = $res['list'][0]['fid'];
                    }
                }
            }
            //记录回单地址到数据库中，并更新状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipt` = '$fid',`receipting`=0 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>100,"info"=>"电子回单获取成功");
        }
        //如果转账电子还是受理中
        elseif(isset($receipts['signature_status']) && $receipts['signature_status']=="ACCEPTED"){
            //记录这种状态，接下来可手动在页面上重新申请，或被定时任务识别
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 1 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请受理中...");
        }
        //仅改变receipting状态，用2标识，这是申请失败的提示
        else{
            //电子签章任务还未完成时，不更新状态，等待计划任务下次再查询后判断
            if(isset($receipts['message']) && $receipts['message'] == '转账电子签章任务还未完成'){

            }else{
                $fail_reason = $receipts['code'] ? $receipts['code'] . '_' . $receipts['message'] : '申请失败';  //微信有毒其默认不返回失败错误描述，尝试取其状态码
                $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 2,`receipt_fail_reason`='$fail_reason' WHERE `id` = {$config['id']}");
                $dsql->dsqlOper($sql, "update");
                return array("state"=>200,"info"=>"电子回单申请失败");
            }
        }
    }

    //支付退款
    function v3_payFailReturn($fail_reason,$withdrawApply,$userAuth,$config){
        global $dsql;
        $time = time();
        //记录该失败原因到数据库中
        $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 2,`note`='$fail_reason',`rdate`=$time WHERE `id` = {$config['id']}");
        $dsql->dsqlOper($sql, "update");
        //开始退款
        $sql = $dsql->SetQuery("SELECT `uid`, `amount`, `type`,`usertype`,`ordernum`,`point`  FROM `#@__member_withdraw` WHERE `id` = ".$config['id']);
        $withdrawId = $config['id'];
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret) {
            $uid    = $ret[0]['uid'];
            $amount = $ret[0]['amount'];
            $ordernum = $ret[0]['ordernum'];
            $drawtype = $ret[0]['type'] ? $ret[0]['type'] : '';
            $usertype = $ret[0]['usertype'] ? $ret[0]['usertype'] : '';
            $point = $ret[0]['point'] ? $ret[0]['point'] : '';
            $cityid = getCityId();
            //用户名
            if ($usertype == 0) {
                $userSql  = $dsql->SetQuery("SELECT `username`,`cityid` FROM `#@__member` WHERE `id` = " . $uid);
                $username = $dsql->dsqlOper($userSql, "results");
                if (count($username) > 0) {
                    $username = $username[0]['username'];
                    $cityid = $username[0]['cityid'];
                } else {
                    $username = "未知";
                }
            }else{
                $couriersql = $dsql->SetQuery("SELECT `name`,`cityid` FROM `#@__waimai_courier` WHERE `id` = " . $uid);
                $courierres = $dsql->dsqlOper($couriersql,"results");
                if ($courierres) {
                    $username = "骑手：".$courierres[0]['name'];
                    $cityid = $courierres[0]['cityid'];
                } else {
                    $username = "未知";
                }
            }
        }
        if ($drawtype == 0) {  //用户提现
            //提现失败
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "withdraw_log_detail",
                "id"       => $config['id']
            );
            $info_notice = $fail_reason;  //优化失败通知
            if(strstr($info_notice,"Openid校验失败") || strstr($info_notice,"产品权限异常")){
                $info_notice = "提现失败，请联系平台管理员";
            }
            //自定义配置
            $config = array(
                "username" => $username,
                "amount" => $amount,
                "date" => date("Y-m-d H:i:s", ),
                "info" => $info_notice,
                "fields" => array(
                    'keyword1' => '提现金额',
                    'keyword2' => '提现时间',
                    'keyword3' => '提现状态'
                )
            );
            //增加交易记录
            if ($usertype == 0) {
                /*普通用户*/
                global $userLogin;
                $user      = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
                $money     = sprintf('%.2f', ($usermoney + $amount));
                $title     = '提现退回';
                $archives  = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`,`pid`) VALUES ('$uid', '1', '$amount', '$title', '$time','member','tixian','$title','$ordernum','$money','{$withdrawId}')");
                $dsql->dsqlOper($archives, "update");

                //更新账户余额
                $archivess = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount', `freeze` = `freeze` - '$amount' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archivess, "update");

                //增加操作日志
                // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`,`substation`) VALUES ('$uid', '1', '$amount', '提现退回', '$time','$cityid','$amount','member','','1','tixian','','')");
                // $lastid   = $dsql->dsqlOper($archives, "lastid");
                // substationAmount($lastid, $cityid);

                updateMemberNotice($uid, "会员-提现申请审核失败", $param, $config);

                //退积分
                if($point>0){
                    $archivess = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archivess, "update");

                    $userpoint = (int)$dsql->getOne($dsql::SetQuery("select `point` from `#@__member` where `id`=".$uid));
                    $archives  = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '提现退回', '$time','tixian','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }
            } else {
                /*骑手*/
                $archivess = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money` + '$amount' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archivess, "update");

                $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$uid'");           //查询骑手余额
                $courieMoney = $dsql->dsqlOper($selectsql,"results");
                $courierMoney = $courieMoney[0]['money'];
                $date = GetMkTime(time());
                $info = '提现退回-'.$fail_reason;
                //记录操作日志
                $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`,`cattype`) VALUES ('$uid','1','$amount','$info','$date','$courierMoney','1')");
                $dsql->dsqlOper($insertsql,"update");

                //更新骑手提现记录状态
                $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 3 WHERE `wid` = {$param['id']}");
                $dsql->dsqlOper($sql, "update");

                //初始化日志
                include_once(HUONIAOROOT."/api/payment/log.php");
                $_courierLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                $_courierLog->DEBUG('courierInsert:'.$insertsql);
                $_courierLog->DEBUG('骑手提现撤回:'.$amount.'骑手账户剩余:'.$courierMoney);
            }
        }
    }

    //查询支付成功或失败
    function v3_queryPaying($withdrawApply,$userAuth,$config){
        global $dsql;
        //通过商家明细单号【ordernum】，查询是否成功   /v3/transfer/batches/out-batch-no/{out_batch_no}/details/out-detail-no/{out_detail_no}
        $url = "https://api.mch.weixin.qq.com/v3/transfer/batches/out-batch-no/{$withdrawApply['batch_no']}/details/out-detail-no/{$withdrawApply['sn']}";
        $token = $this->v3_token($url,"GET",array(),$config);
        $result = $this->v3_https_request($url,array(),$token);//发送请求
        $trans_arr = json_decode($result,true);
        $IS_SIGN_ERROR = isset($trans_arr['code']) && $trans_arr['code']=="SIGN_ERROR";  //是否签名错误
        //如果成功，尝试申请转账明细电子回单API
        if($trans_arr['detail_status']=="SUCCESS"){
            //记录等待生成回单状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 3 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>100,"info"=>"支付成功","type"=>"SUCCESS","note"=>$trans_arr['batch_id']);
        }
        //转账失败，找出失败原因
        elseif($trans_arr['detail_status']=="FAIL"){
            $fail_reason = $trans_arr['fail_reason'];
            $wxPayV3TransferError = $this->wxPayV3TransferError; //失败字典
            $fail_reason = isset($wxPayV3TransferError[$fail_reason]) ? $wxPayV3TransferError[$fail_reason] : $fail_reason;  //优先获取中文提示
            return array("state"=>200,"info"=>$fail_reason,"type"=>"FAIL","signError"=>$IS_SIGN_ERROR);
        }
        // 转账中，这是一种特殊状态
        else{ //"PROCESSING" 或其他情况，归结为支付中，稍后再查
            //记录这种状态【3】，接下来的操作由定时计划代理
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 3 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"操作成功，微信转账中，请等待...","type"=>"PROCESSING","signError"=>$IS_SIGN_ERROR);
        }
    }


    function v3_transfer($withdrawApply,$userAuth,$config){
        //请求URL
        $url = 'https://api.mch.weixin.qq.com/v3/transfer/batches';
        //请求方式
        $http_method = 'POST';
        //请求参数
        $data = [
            'appid' => $config['app_id'],//申请商户号的appid或商户号绑定的appid（企业号corpid即为此appid）
            'out_batch_no' => $withdrawApply['batch_no'],//商户系统内部的商家批次单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
            'batch_name' => '余额提现',//该笔批量转账的名称
            'batch_remark' => '余额提现',//转账说明，UTF8编码，最多允许32个字符
            'total_amount' => intval($withdrawApply['left_money'] * 100),//转账金额单位为“分”。转账总金额必须与批次内所有明细转账金额之和保持一致，否则无法发起转账操作
            'total_num' => 1,//一个转账批次单最多发起三千笔转账。转账总笔数必须与批次内所有明细之和保持一致，否则无法发起转账操作
            'transfer_detail_list' => [
                [//发起批量转账的明细列表，最多三千笔
                    'out_detail_no' => $withdrawApply['sn'],//商户系统内部区分转账批次单下不同转账明细单的唯一标识，要求此参数只能由数字、大小写字母组成
                    'transfer_amount' => intval($withdrawApply['left_money'] * 100),//转账金额单位为分
                    'transfer_remark' => '余额提现',//单条转账备注（微信用户会收到该备注），UTF8编码，最多允许32个字符
                    'openid' => $userAuth['openid'],//openid是微信用户在公众号appid下的唯一用户标识（appid不同，则获取到的openid就不同），可用于永久标记一个用户
                ]]
        ];

        $token  = $this->v3_token("https://api.mch.weixin.qq.com/v3/certificates","GET",array(),$config);//获取token
        $result = $this->v3_https_request("https://api.mch.weixin.qq.com/v3/certificates",array(),$token);//发送请求
        $ser_arr = json_decode($result,true);
        if(empty($ser_arr['data'])){
            return array("state"=>200,"info"=>$ser_arr['message']);
        }
        //解密平台证书
        $aesUtil = new AesUtil($config['app_key']); //apiKey
        $server_zhengshu = $aesUtil->decryptToString($ser_arr['data'][0]['encrypt_certificate']['associated_data'],$ser_arr['data'][0]['encrypt_certificate']['nonce'],$ser_arr['data'][0]['encrypt_certificate']['ciphertext']);
        $config['server_key'] = $server_zhengshu; //解密后的平台证书
        if(empty($server_zhengshu)){
            return array("state"=>200,"info"=>"平台证书获取失败");
        }
        //使用平台证书，进行数据加密
        $data['transfer_detail_list'][0]['user_name'] = $this->v3_getEncrypt($withdrawApply['real_name'],$config);
        //获取token
        $token  = $this->v3_token($url,$http_method,$data,$config);//获取token
        //取得平台证书序列号
        $serial_no = $ser_arr['data'][0]['serial_no'];
        //请求转账
        $result = $this->v3_https_request($url,json_encode($data),$token,$serial_no);//发送请求
        $result_arr = json_decode($result,true);

        if(!isset($result_arr['create_time'])) {//批次受理失败
            return array("state"=>200,"info"=>$result_arr['message']);
        }
        /* 转账成功后，禁止立刻查询【容易出问题】，只能返回转账种的提示 */
        //记录这种状态【3】，接下来的操作由定时计划代理【这里记录订单号，后续不再更改，防止订单号出问题】
        global $dsql;
        if($config['id']){
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 3,`ordernum`='{$withdrawApply['batch_no']}' WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
        }
        return array("state"=>200,"info"=>"操作成功，微信转账中，请等待...","type"=>"PROCESSING");

//        $result_arr['state'] = 100;
//        return $result_arr;
    }

    function v3_getEncrypt($str,$config){
        //$str是待加密字符串
        $public_key = $config['server_key'];
        $encrypted = '';
        if (openssl_public_encrypt($str, $encrypted, $public_key, OPENSSL_PKCS1_OAEP_PADDING)) {
            //base64编码
            $sign = base64_encode($encrypted);
        } else {
            return array("state"=>200,"info"=>"加密失败");
        }
        return $sign;
    }

    function v3_https_request($url,$data,$token,$serial_no=""){
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, (string)$url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if (!empty($data)){
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        //添加请求头
        $headers = [
            'Authorization:'.$token,
            'Accept: application/json',
            'Content-Type: application/json; charset=utf-8',
            'User-Agent:Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
        ];
        if(!empty($serial_no)){
            array_push($headers,'Wechatpay-Serial: '.$serial_no);
        }
        if(!empty($headers)){
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        }
        $output = curl_exec($curl);
        curl_close($curl);
        return $output;
    }

    function v3_token($url,$http_method,$data,$config,$bodyEol=true){
        $timestamp   = time();//请求时间戳
        $url_parts   = parse_url($url);//获取请求的绝对URL
        $nonce       = $timestamp.rand('10000','99999');//请求随机串
        $body        = empty($data) ? '' : json_encode((object)$data);//请求报文主体
        $stream_opts = [
            "ssl" => [
                "verify_peer"=>false,
                "verify_peer_name"=>false,
            ]
        ];

        $apiclient_cert_arr = openssl_x509_parse(file_get_contents($config['cert_path'],false, stream_context_create($stream_opts)));
        $serial_no          = $apiclient_cert_arr['serialNumberHex'];//商户证书序列号
        $mch_private_key    = file_get_contents($config['key_path'],false, stream_context_create($stream_opts));//密钥
        $merchant_id = $config['mch_id'];//商户id
        $canonical_url = ($url_parts['path'] . (!empty($url_parts['query']) ? "?${url_parts['query']}" : ""));
        $message = $http_method."\n".
            $canonical_url."\n".
            $timestamp."\n".
            $nonce."\n".
            $body.($bodyEol?"\n":"");
        openssl_sign($message, $raw_sign, $mch_private_key, 'sha256WithRSAEncryption');
        $sign = base64_encode($raw_sign);//签名
        $schema = 'WECHATPAY2-SHA256-RSA2048';
        $token = sprintf('mchid="%s",nonce_str="%s",timestamp="%d",serial_no="%s",signature="%s"',
            $merchant_id, $nonce, $timestamp, $serial_no, $sign);//微信返回token
        return $schema.' '.$token;
    }

    //2025年新版，微信发起转账接口
    function v4_transfer($withdrawApply,$userAuth,$config){
        global $cfg_secureAccess;
        global $cfg_basehost;
        $cfg_basedomain = $cfg_secureAccess.$cfg_basehost;

        //根据传入的场景名称和场景内容，生成场景报备信息数组
        $sceneValues = $withdrawApply['sceneLabel'];
        $sceneContent = $withdrawApply['sceneContent'];
        $sceneInfos = array();
        foreach ($sceneValues as $key => $value) {
            $sceneInfos[] = array(
                'info_type' => $value,
                'info_content' => $sceneContent[$key]
            );
        }

        //请求URL
        $url = 'https://api.mch.weixin.qq.com/v3/fund-app/mch-transfer/transfer-bills';
        //请求方式
        $http_method = 'POST';
        //请求参数
        $data = array(
            'appid' => $config['app_id'],//申请商户号的appid或商户号绑定的appid（企业号corpid即为此appid）
            'out_bill_no' => $withdrawApply['batch_no'],//商户系统内部的商家批次单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
            'transfer_scene_id' => $withdrawApply['sceneId'],//转账场景ID，可前往“商户平台-产品中心-商家转账”中申请。如：1000（现金营销），1006（企业报销）等
            'openid' => $userAuth['openid'],//openid
            'user_name' => $withdrawApply['real_name'],//收款用户姓名，需要加密传入，支持标准RSA算法和国密算法，公钥由微信侧提供。转账金额 >= 2,000元或需要电子回单时必填
            'transfer_amount' => intval($withdrawApply['left_money'] * 100),//转账金额单位为分
            'transfer_remark' => '余额提现',//单条转账备注（微信用户会收到该备注），UTF8编码，最多允许32个字符
            'notify_url' => $cfg_basedomain.'/api/payment/wxpayTransferNotifyV4.php',//回调地址，必须为https，不能携带参数
            'transfer_scene_report_infos' => $sceneInfos, //转账场景报备信息，各转账场景下需报备的内容
        );

        /*var_dump($data);
        var_dump($config);*/

        $token = $this->v3_token("https://api.mch.weixin.qq.com/v3/certificates","GET",array(),$config);//获取token，新版签名认证逻辑和v3版一样，所以先用v3版
        $result = $this->v4_https_request("https://api.mch.weixin.qq.com/v3/certificates",array(),$token,'','GET');//发送请求
        $ser_arr = json_decode($result,true);
        if(empty($ser_arr['data'])){
            return array("state"=>200,"info"=>$ser_arr['message']);
        }

        //如果金额大于0.3，则对姓名进行签名加密，如果小于0.3，则不传入姓名，否则会报错
        if ($withdrawApply['left_money'] >= 0.3) {
            if ($withdrawApply['real_name'] == null) {
                return array("state"=>200,"info"=>'用户姓名不能为空！');
            }

            //解密平台证书
            $aesUtil = new AesUtil($config['app_key']); //apiKey
            $server_zhengshu = $aesUtil->decryptToString($ser_arr['data'][0]['encrypt_certificate']['associated_data'],$ser_arr['data'][0]['encrypt_certificate']['nonce'],$ser_arr['data'][0]['encrypt_certificate']['ciphertext']);
            $config['server_key'] = $server_zhengshu; //解密后的平台证书
            if(empty($server_zhengshu)){
                return array("state"=>200,"info"=>"平台证书获取失败");
            }
            //使用平台证书，进行数据加密
            $data['user_name'] = $this->v3_getEncrypt($withdrawApply['real_name'],$config);
        } else {
            unset($data['user_name']);
        }
        
        //获取token
        $token  = $this->v3_token($url,$http_method,$data,$config);
        //取得平台证书序列号
        $serial_no = $ser_arr['data'][0]['serial_no'];
        //请求转账
        $result = $this->v4_https_request($url,json_encode($data),$token,$serial_no);//发送请求
        $result_arr = json_decode($result,true);

        //var_dump($result);

        if(!isset($result_arr['create_time'])) {
            return array("state"=>200,"info"=>$result_arr['message'],"code" => $result_arr['code']);
        }

        //返回结果里增加appid和mchid
        $result_arr['appid'] = $config['app_id'];
        $result_arr['mchid'] = $config['mch_id'];

        //修改状态为转账中
        global $dsql;
        if($config['id']){
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 6,`ordernum`='{$withdrawApply['batch_no']}',`transferJson`='".json_encode($result_arr)."' WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");

            //如果是骑手，则同步更新骑手的订单信息
            if ($withdrawApply['usertype'] == 1) {
                $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 1 WHERE `wid` = {$config['id']}");
                $dsql->dsqlOper($sql, "update");
            }
        }

        //兼容以前的逻辑，增加相关参数
        $list = array("state"=>100,"info"=>$result_arr);
        $list['date'] = GetMkTime(time());
        $list['payment_no'] = $result_arr['transfer_bill_no'];
        $list['processing'] = 1; //此项设为1，说明正在打款中，防止状态被更新

        //return array("state"=>100,"info"=>json_encode($result_arr));
        return $list;
    }

    //撤销转账接口
    function v4_revoke($orderInfo, $app = false){
        //版本校验，只有4.0版才支持这个接口
        global $cfg_withdrawWxVersion;
        if ($cfg_withdrawWxVersion != 4) {
            return array("state"=>200,"info"=>"微信接口版本不支持！",'noretry' => 1);
        }

        if($app){
            $appId = $this->app_appId;
            $mch_id = $this->app_mch_id;
            $key = $this->app_key;
        }else{
            $appId = $this->appId;
            $mch_id = $this->mch_id;
            $key = $this->key;
        }

        //如果是app端，则修改参数
        if ($orderInfo['source'] == 2) {
            $appId = $this->app_appId;
            $mch_id = $this->app_mch_id;
            $key = $this->app_key;
            $app = true;
        } else if ($orderInfo['source'] == 1) { 
            //小程序端
            require(HUONIAOINC."/config/wechatConfig.inc.php");
            $appId = $cfg_miniProgramAppid;
        }

        $config = array(
            'app_id'=>$appId,
            'cert_path'=>dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_cert.pem',
            'key_path'=>dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_key.pem',
            'mch_id'=>$mch_id,
            'app_key'=>$key,
        );

        //请求URL
        $url = 'https://api.mch.weixin.qq.com/v3/fund-app/mch-transfer/transfer-bills/out-bill-no/'.$orderInfo['ordernum'].'/cancel';
        //请求方式
        $http_method = 'POST';
        //请求参数
        $data = array();

        //获取token
        $token = $this->v3_token($url,$http_method,$data,$config);
        //发送请求
        $result = $this->v4_https_request($url,$data,$token,'',$http_method);
        $result_arr = json_decode($result,true);

        if(!isset($result_arr['update_time'])) {
            return array("state"=>200,"info"=>"请求发送失败！错误原因：".$result_arr['message']);
        }

        //修改状态为撤销中
        global $dsql;
        if($orderInfo['wid']){
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 4,`note` = '".$orderInfo['note']."' WHERE `id` = {$orderInfo['wid']}");
            $dsql->dsqlOper($sql, "update");

            //如果是骑手，则同步更新骑手的订单信息
            if ($orderInfo['usertype'] == 1) {
                $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 4 WHERE `wid` = {$orderInfo['wid']}");
                $dsql->dsqlOper($sql, "update");
            }
        }
        return array("state"=>100,"info"=>"请求发送成功！");
    }

    //查询转账单号状态
    function v4_queryPaying($withdrawApply,$userAuth,$config){
        //版本校验，只有4.0版才支持这个接口
        global $cfg_withdrawWxVersion;
        if ($cfg_withdrawWxVersion != 4) {
            return array("state"=>200,"info"=>"微信接口版本不支持！","type"=>"FAIL","signError"=>false);
        }

        global $dsql;
        //通过商家明细单号【ordernum】，查询是否成功
        $url = "https://api.mch.weixin.qq.com/v3/fund-app/mch-transfer/transfer-bills/out-bill-no/{$withdrawApply['batch_no']}";
        $token = $this->v3_token($url,"GET",array(),$config);
        $result = $this->v4_https_request($url,array(),$token,'','GET');//发送请求
        $trans_arr = json_decode($result,true);
        $IS_SIGN_ERROR = isset($trans_arr['code']) && $trans_arr['code']=="SIGN_ERROR";  //是否签名错误
        //如果成功，尝试申请转账明细电子回单API
        if($trans_arr['state']=="SUCCESS"){
            //记录等待生成回单状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 3 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>100,"info"=>"支付成功","type"=>"SUCCESS","note"=>$trans_arr['transfer_bill_no']);
        }
        //转账失败，找出失败原因
        elseif($trans_arr['state']=="FAIL" || $trans_arr['state']=="CANCELLED"){
            //失败了暂时不更新原因
            return array("state"=>200,"info"=>$withdrawApply['note'],"type"=>"FAIL","signError"=>$IS_SIGN_ERROR);
        }
        // 转账中，这是一种特殊状态
        else{ //"PROCESSING" 或其他情况，归结为支付中，稍后再查
            //记录这种状态【3】，接下来的操作由定时计划代理
            /*$sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 3 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");*/
            return array("state"=>200,"info"=>"操作成功，转账中，请等待...","type"=>"PROCESSING","signError"=>$IS_SIGN_ERROR);
        }
    }

    function v4_https_request($url,$data,$token,$serial_no="",$method = "POST"){
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, (string)$url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);

        //有可能会出现post请求，但是不传请求数据的情况，因此这里把请求方式另外定义
        if ($method == "POST"){
            curl_setopt($curl, CURLOPT_POST, 1);
            if (!empty($data)){
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
            }
        }

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        //curl_setopt($curl, CURLOPT_HEADER, true); //是否获取返回的header，如果要对返回值进行验签操作，则此项需要开启
        //添加请求头
        $headers = [
            'Authorization:'.$token,
            'Accept: application/json',
            'Content-Type: application/json; charset=utf-8',
            'User-Agent:Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
        ];
        if(!empty($serial_no)){
            array_push($headers,'Wechatpay-Serial: '.$serial_no);
        }
        if(!empty($headers)){
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        }
        $output = curl_exec($curl);
        curl_close($curl);
        return $output;
    }

    //申请回单【支付完毕，receipting为3，此时为待申请，需执行此方法】
    function v4_applyReceipt($withdrawApply,$userAuth,$config){
        global $dsql;
        $url = "https://api.mch.weixin.qq.com/v3/fund-app/mch-transfer/elecsign/out-bill-no";
        $param = array(
            'out_bill_no'=>$withdrawApply['batch_no'],
        );
        $token = $this->v3_token($url,"POST",$param,$config);
        $result = $this->v4_https_request($url,json_encode($param),$token);//发送请求
        $receipts = json_decode($result,true);
        if(isset($receipts['code']) && $receipts['code']=="SIGN_ERROR"){
            return array("state"=>200,"info"=>"商户证书序列号有误。请使用签名私钥匹配的证书序列号");
        }
        //如果电子回单申请成功、或提示已经存在，算是已经成功
        if(isset($receipts['state']) && $receipts['state']=="FINISHED"){

            $this->v4_queryReceipt($withdrawApply,$userAuth,$config); //微信已经返回申请状态为FINISH，或已经申请过了，这时去查询回单内容，失败概率应该极小，否则微信有毒

            return array("state"=>100,"info"=>"电子回单获取成功");
        }
        //如果转账电子还是受理中
        elseif(isset($receipts['state']) && $receipts['state']=="GENERATING"){
            //记录这种状态，接下来可手动在页面上重新申请，或被定时任务识别
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 1 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请受理中...");
        }
        //仅改变receipting状态，用2标识
        else{
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 2 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请失败");
        }
    }

    //获取回执单【查询并下载】
    function v4_queryReceipt($withdrawApply,$userAuth,$config){
        global $dsql;
        //查询电子单状态代码
        $url = "https://api.mch.weixin.qq.com/v3/fund-app/mch-transfer/elecsign/out-bill-no/{$withdrawApply['batch_no']}";
        $token = $this->v3_token($url,"GET",array(),$config);
        $result = $this->v4_https_request($url,array(),$token,'','GET');//发送请求
        $receipts = json_decode($result,true);
        if(isset($receipts['code']) && $receipts['code']=="SIGN_ERROR"){
            return array("state"=>200,"info"=>"商户证书序列号有误。请使用签名私钥匹配的证书序列号");
        }
        //如果电子回单申请成功
        if(isset($receipts['state']) && $receipts['state']=="FINISHED"){
            global $cfg_uploadDir;
            $download_url = $receipts['download_url'];
            //下载电子回单到本地，并上传到远程服务器
            $token = $this->v3_token($download_url,"GET",array(),$config);
            $fileStr = $this->v4_https_request($download_url,array(),$token,'','GET');//发送请求
            $fileDir = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/";
            if(!is_dir($fileDir)){
                mkdir($fileDir,0777,true);
            }
            $file_name = $dsql->getOne($dsql::SetQuery("select `note` from `#@__member_withdraw` where `id`={$config['id']}"));
            $fileRealPath = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/{$file_name}.pdf";
            $pngPath = HUONIAOROOT.$cfg_uploadDir."/siteConfig/receipt/{$file_name}.png";
            file_put_contents($fileRealPath,$fileStr);  //已知是pdf
            //尝试把pdf转换为图片
            if(is_callable("exec")){
                $cmd = "magick convert -density 200 -background white -alpha remove -quality 100 $fileRealPath -append $pngPath";
                exec($cmd);
                if(file_exists($pngPath)){
                    unlinkFile($fileRealPath); //删除pdf
                    $fileRealPath = $pngPath;
                }
            }
            //上传保存到远程服务器...
            global $cfg_ftpUrl;
            global $cfg_fileUrl;
            global $cfg_uploadDir;
            global $cfg_ftpType;
            global $cfg_ftpState;
            global $cfg_ftpDir;
            global $cfg_quality;
            global $cfg_softSize;
            global $cfg_softType;
            global $cfg_editorSize;
            global $cfg_editorType;
            global $cfg_videoSize;
            global $cfg_videoType;
            global $cfg_meditorPicWidth;
            global $cfg_ftpSSL;
            global $cfg_ftpPasv;
            global $cfg_ftpServer;
            global $cfg_ftpPort;
            global $cfg_ftpUser;
            global $cfg_ftpPwd;
            global $cfg_ftpTimeout;
            global $cfg_OSSUrl;
            global $cfg_OSSBucket;
            global $cfg_EndPoint;
            global $cfg_OSSKeyID;
            global $cfg_OSSKeySecret;
            global $cfg_QINIUAccessKey;
            global $cfg_QINIUSecretKey;
            global $cfg_QINIUbucket;
            global $cfg_QINIUdomain;
            global $cfg_OBSUrl;
            global $cfg_OBSBucket;
            global $cfg_OBSEndpoint;
            global $cfg_OBSKeyID;
            global $cfg_OBSKeySecret;
            global $cfg_COSUrl;
            global $cfg_COSBucket;
            global $cfg_COSRegion;
            global $cfg_COSSecretid;
            global $cfg_COSSecretkey;

            global $editorMarkState;
            global $editor_ftpType;
            global $editor_ftpState;
            global $customUpload;
            global $custom_uploadDir;
            global $customFtp;
            global $custom_ftpType;
            global $custom_ftpState;
            global $custom_ftpDir;
            global $custom_ftpServer;
            global $custom_ftpPort;
            global $custom_ftpUser;
            global $custom_ftpPwd;
            global $custom_ftpDir;
            global $custom_ftpUrl;
            global $custom_ftpTimeout;
            global $custom_ftpSSL;
            global $custom_ftpPasv;
            global $custom_OSSUrl;
            global $custom_OSSBucket;
            global $custom_EndPoint;
            global $custom_OSSKeyID;
            global $custom_OSSKeySecret;
            global $custom_QINIUAccessKey;
            global $custom_QINIUSecretKey;
            global $custom_QINIUbucket;
            global $custom_QINIUdomain;
            global $editor_ftpDir;
            global $custom_OBSUrl;
            global $custom_OBSBucket;
            global $custom_OBSEndpoint;
            global $custom_OBSKeyID;
            global $custom_OBSKeySecret;
            global $custom_COSUrl;
            global $custom_COSBucket;
            global $custom_COSRegion;
            global $custom_COSSecretid;
            global $custom_COSSecretkey;

            $cfg_softType = $cfg_softType ? explode("|", $cfg_softType) : array();
            $cfg_editorType = $cfg_editorType ? explode("|", $cfg_editorType) : array();
            $cfg_videoType = $cfg_videoType ? explode("|", $cfg_videoType) : array();

            global $editor_uploadDir;
            $editor_uploadDir = $cfg_uploadDir;
            // $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
            $editor_ftpType = $cfg_ftpType;

            $custom_ftpState = $editor_ftpState = $cfg_ftpState;
            $custom_ftpType = $cfg_ftpType;
            $custom_ftpSSL = $cfg_ftpSSL;
            $custom_ftpPasv = $cfg_ftpPasv;
            $custom_ftpUrl = $cfg_ftpUrl;
            $custom_ftpServer = $cfg_ftpServer;
            $custom_ftpPort = $cfg_ftpPort;
            $custom_ftpDir = $editor_ftpDir = $cfg_ftpDir;
            $custom_ftpUser = $cfg_ftpUser;
            $custom_ftpPwd = $cfg_ftpPwd;
            $custom_ftpTimeout = $cfg_ftpTimeout;
            $custom_OSSUrl = $cfg_OSSUrl;
            $custom_OSSBucket = $cfg_OSSBucket;
            $custom_EndPoint = $cfg_EndPoint;
            $custom_OSSKeyID = $cfg_OSSKeyID;
            $custom_OSSKeySecret = $cfg_OSSKeySecret;
            $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
            $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
            $custom_QINIUbucket = $cfg_QINIUbucket;
            $custom_QINIUdomain = $cfg_QINIUdomain;
            $custom_OBSUrl = $cfg_OBSUrl;
            $custom_OBSBucket = $cfg_OBSBucket;
            $custom_OBSEndpoint = $cfg_OBSEndpoint;
            $custom_OBSKeyID = $cfg_OBSKeyID;
            $custom_OBSKeySecret = $cfg_OBSKeySecret;
            $custom_COSUrl = $cfg_COSUrl;
            $custom_COSBucket = $cfg_COSBucket;
            $custom_COSRegion = $cfg_COSRegion;
            $custom_COSSecretid = $cfg_COSSecretid;
            $custom_COSSecretkey = $cfg_COSSecretkey;
            $remotePath = "..".$editor_uploadDir."/siteConfig/receipt/";
            $res = getRemoteImage(array($fileRealPath), array("savePath" => $remotePath), 'siteConfig', '..', false, 2);
            $fid = "";
            if($res){
                $res = json_decode($res,true);
                if($res['state']=="SUCCESS"){
                    if($res['list'][0]['state']=="SUCCESS"){
                        $fid = $res['list'][0]['fid'];
                    }
                }
            }
            //记录回单地址到数据库中，并更新状态
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipt` = '$fid',`receipting`=0 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>100,"info"=>"电子回单获取成功");
        }
        //如果转账电子还是受理中
        elseif(isset($receipts['state']) && $receipts['state']=="GENERATING"){
            //记录这种状态，接下来可手动在页面上重新申请，或被定时任务识别
            $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 1 WHERE `id` = {$config['id']}");
            $dsql->dsqlOper($sql, "update");
            return array("state"=>200,"info"=>"电子回单申请受理中...");
        }
        //仅改变receipting状态，用2标识，这是申请失败的提示
        else{
            //电子签章任务还未完成时，不更新状态，等待计划任务下次再查询后判断
            if(isset($receipts['message']) && $receipts['message'] == '转账电子签章任务还未完成'){

            }else{
                $fail_reason = $receipts['code'] ? $receipts['code'] . '_' . $receipts['message'] : '申请失败';  //微信有毒其默认不返回失败错误描述，尝试取其状态码
                $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `receipting` = 2,`receipt_fail_reason`='$fail_reason' WHERE `id` = {$config['id']}");
                $dsql->dsqlOper($sql, "update");
                return array("state"=>200,"info"=>"电子回单申请失败");
            }
        }
    }


    function transfers($order, $app = false){

        if($app){
            $appId = $this->app_appId;
            $mch_id = $this->app_mch_id;
            $key = $this->app_key;
        }else{
            $appId = $this->appId;
            $mch_id = $this->mch_id;
            $key = $this->key;
        }

        global $cfg_shortname;

        // 随机数
        $nonce_str = genSecret(16, 2);

        // ----------订单信息
        // 商户订单号
        $out_trade_no = $order['ordernum'];
        // 绑定微信的openid
        $openid = $order['openid'];
        $wechat_mini_openid = $order['wechat_mini_openid'];
        // 姓名
        $name = $order['name'];
        // 提现金额
        $amount = $order['amount'] * 100;
        // 备注
        $desc = "余额提现";

        //通过小程序直接登录的，会没有openid，只有mini_openid，这时openid要用小程序的，appid也要用小程序的
        if(!$openid && $wechat_mini_openid){
            require(HUONIAOINC."/config/wechatConfig.inc.php");
            $openid = $wechat_mini_openid;
            $appId = $cfg_miniProgramAppid;
        }

        $transfers = array(
            'amount' => $amount,                  //金额
            'check_name' => 'FORCE_CHECK',        //NO_CHECK：不校验真实姓名  FORCE_CHECK：强校验真实姓名
            'desc' => $desc,                      //企业付款备注
            'mch_appid' => $appId,                //应用ID，固定
            'mchid' => $mch_id,                   //商户号，固定
            'nonce_str' => $nonce_str,            //随机字符串
            'openid' => $openid,                  //用户openid
            'partner_trade_no' => $out_trade_no,  //商户内部唯一退款单号
            're_user_name' => $name,              //收款用户姓名
            'spbill_create_ip' => GetIP()         //IP地址
        );

        //判断微信支付版本，原2.0不动，新版3.0调用新方法
        global $cfg_withdrawWxVersion;

        if($cfg_withdrawWxVersion==3){
            $withdrawApply = array(
                'real_name'=>$name,
                'left_money'=>$order['amount'],  //金额，单位：分，函数内部还会 * 100
                'batch_no'=>$out_trade_no,  //只有一笔，则ordernum是总单号和第一批单号
                'sn'=>$out_trade_no
            );
            $userAuth = array(
                'openid'=>$openid
            );
            $config = array(
                'app_id'=>$appId,
                'cert_path'=>dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_cert.pem',
                'key_path'=>dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_key.pem',
                'mch_id'=>$mch_id,
                'app_key'=>$key,
                'id'=>$order['wid']
            );

            $resBody =  $this->v3_transfer($withdrawApply,$userAuth,$config);
            if($resBody['state']!=100 && !strstr($resBody['info'], '微信转账中')){
                return $resBody;
            }else{
                $create_time = $resBody['create_time'];
                $batch_id = $resBody['batch_id'];
                return array("state" => 100, "date" => GetMkTime($create_time), "payment_no" => $batch_id, "processing" => $resBody['type'] == 'PROCESSING' ? 1 : 0);
            }
        }

        //如果是2025年新的微信转账，就调用新接口
        if($cfg_withdrawWxVersion == 4){
            global $dsql;

            /*global $cfg_maxWithdrawOnceV4; //单笔限额
            global $cfg_maxWithdrawPerdayEveryoneV4; //单用户转账限额
            global $cfg_maxWithdrawPerdayV4; //单日转账额度*/

            $order['amount'] = (float)$order['amount'];

            //参数合法性校验
            if ($order['amount'] <= 0) {
                return array("state" => 200,"info" => '转账金额必须为正数！','noretry' => 1);
            }

            if ($order['ordernum'] == null) {
                return array("state" => 200,"info" => '转账单号不能为空！','noretry' => 1);
            }

            //校验单笔转账金额是否超出了单笔限额
            /*if ($order['amount'] > (float)$cfg_maxWithdrawOnceV4) {
                return array("state" => 200,"info" => '转账金额超过了单笔最大额度！');
            }

            $nowTime = GetMkTime(time()); //当前时间
            $startTime = strtotime(date('Y-m-d 00:00:00',$nowTime)); //当天开始时间
            $endTime = $startTime + 86400; //当天结束时间*/

            //查询提现详情
            $sql = $dsql->SetQuery("SELECT `uid`,`usertype`,`isauto`,`bank`,`state`,`auditstate`,`usertype`,`source` FROM `#@__member_withdraw` WHERE `id` = ".$order['wid']);
            $result = $dsql->dsqlOper($sql, "results");
            if ($result == null || !is_array($result)) {
                return array("state" => 200,"info" => '没有找到对应的转账信息！','noretry' => 1);
            }
            $withdrawInfo = $result[0];

            //判断支付方式是微信支付，且状态是否正确
            if ($withdrawInfo['bank'] != 'weixin') {
                return array("state" => 200,"info" => '支付方式错误！','noretry' => 1);
            }
            if ($withdrawInfo['auditstate'] != 1 || !in_array($withdrawInfo['state'], array(0,3,6))) {
                return array("state" => 200,"info" => '当前状态不允许发起转账申请！','noretry' => 1);
            }

            //如果来源是小程序，则使用小程序的openid
            if ($withdrawInfo['source'] == 1) {
                require(HUONIAOINC."/config/wechatConfig.inc.php");
                $openid = $wechat_mini_openid;
                $appId = $cfg_miniProgramAppid;
            } else if ($withdrawInfo['source'] == 2 && $withdrawInfo['usertype'] != 1) {
                //如果来源是APP，则使用APP的openid
                $appId = $this->app_appId;
                $mch_id = $this->app_mch_id;
                $key = $this->app_key;
                $app = true;
                $openid = $order['wechat_app_openid'];
            }

            if ($openid == null) {
                return array("state" => 200,"info" => '缺少openid！','noretry' => 1);
            }

            //校验当天对该用户的转账金额是否超出限额
            /*$sql = $dsql->SetQuery("SELECT SUM(`amount`) totalCount FROM `#@__member_withdraw` WHERE `state` IN (0,1,3,4,6) AND `bank` = 'weixin' AND `uid` = ".$withdrawInfo['uid']." AND `tdate` > ".$startTime." AND `tdate` < ".$endTime);
            $amountPerdayEveryone = (float)$dsql->getOne($sql);
            if ($amountPerdayEveryone > (float)$cfg_maxWithdrawPerdayEveryoneV4) {
                return array("state" => 200,"info" => '当日累计转账金额超过了单用户转账限额！');
            }

            //校验单日转账金额是否超出限额
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) totalCount FROM `#@__member_withdraw` WHERE `state` IN (0,1,3,4,6) AND `bank` = 'weixin' AND `tdate` > ".$startTime." AND `tdate` < ".$endTime);
            $amountPerday = (float)$dsql->getOne($sql);
            if ($amountPerday > (float)$cfg_maxWithdrawPerdayV4) {
                return array("state" => 200,"info" => '当日累计转账金额超过了单日转账限额！');
            }*/

            //获取提现类型，读取后台配置的提现场景字段
            $sceneId = ''; //场景ID
            $sceneName = ''; //场景名称
            $sceneLabel = ''; //场景label数组
            $sceneContent = ''; //场景label对应的内容数组
            if ($withdrawInfo['usertype'] == 1) {
                //骑手提现
                global $cfg_courierWithdrawSceneIdV4;
                global $cfg_courierWithdrawSceneNameV4;
                global $cfg_courierWithdrawSceneLabelV4;
                global $cfg_courierWithdrawSceneContentV4;

                $sceneId = $cfg_courierWithdrawSceneIdV4;
                $sceneName = $cfg_courierWithdrawSceneNameV4;
                $sceneLabel = $cfg_courierWithdrawSceneLabelV4;
                $sceneContent = $cfg_courierWithdrawSceneContentV4;
            } else if ($withdrawInfo['isauto'] == 1) {
                //商家自动提现
                global $cfg_businessAutoWithdrawSceneIdV4;
                global $cfg_businessAutoWithdrawSceneNameV4;
                global $cfg_businessAutoWithdrawSceneLabelV4;
                global $cfg_businessAutoWithdrawSceneContentV4;

                $sceneId = $cfg_businessAutoWithdrawSceneIdV4;
                $sceneName = $cfg_businessAutoWithdrawSceneNameV4;
                $sceneLabel = $cfg_businessAutoWithdrawSceneLabelV4;
                $sceneContent = $cfg_businessAutoWithdrawSceneContentV4;
            } else {
                //普通用户提现
                global $cfg_commonWithdrawSceneIdV4;
                global $cfg_commonWithdrawSceneNameV4;
                global $cfg_commonWithdrawSceneLabelV4;
                global $cfg_commonWithdrawSceneContentV4;

                $sceneId = $cfg_commonWithdrawSceneIdV4;
                $sceneName = $cfg_commonWithdrawSceneNameV4;
                $sceneLabel = $cfg_commonWithdrawSceneLabelV4;
                $sceneContent = $cfg_commonWithdrawSceneContentV4;
            }
            if ($sceneId == null || $sceneName == null || $sceneLabel == null || $sceneContent == null) {
                return array("state" => 200,"info" => '场景信息错误！','noretry' => 1);
            }
            
            $withdrawApply = array(
                'real_name'=>$name,
                'left_money'=>$order['amount'],  //金额，单位：分，函数内部还会 * 100
                'batch_no'=>$out_trade_no,  //只有一笔，则ordernum是总单号和第一批单号
                'sceneId'=>$sceneId,
                'sceneName'=>$sceneName,
                'sceneLabel'=>json_decode($sceneLabel,true),
                'sceneContent'=>json_decode($sceneContent,true),
                'usertype'=>$withdrawInfo['usertype'],
            );
            $userAuth = array(
                'openid'=>$openid
            );
            $config = array(
                'app_id'=>$appId,
                'cert_path'=>dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_cert.pem',
                'key_path'=>dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_key.pem',
                'mch_id'=>$mch_id,
                'app_key'=>$key,
                'id'=>$order['wid']
            );

            $resBody = $this->v4_transfer($withdrawApply,$userAuth,$config);

            if ($resBody['state'] != 100) {
                $resBody['noretry'] = 1;
            }
            return $resBody;
        }

        //以下为原 wx 支付2.0方法

        $stringA = "";
        foreach ($transfers as $k => $v) {
            $stringA = $stringA.$k."=".$v."&";
        }

        $stringSignTemp = $stringA."key=".$key; //注：key为商户平台设置的密钥key

        $sign = strtoupper(MD5($stringSignTemp)); //注：MD5签名方式

        $transfers['sign'] = $sign;

        $url = "https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers";  //企业付款到零钱，请求Url
        $xml = arrayToXml($transfers);

        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL,$url);
        curl_setopt($ch,CURLOPT_HEADER,1);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,0);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,0);//证书检查
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'pem');
        curl_setopt($ch,CURLOPT_SSLCERT,dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_cert.pem');
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'pem');
        curl_setopt($ch,CURLOPT_SSLKEY,dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/apiclient_key.pem');
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'pem');
        curl_setopt($ch,CURLOPT_CAINFO,dirname(__FILE__).'/cert'. ($app ? '/app' : '') .'/rootca.pem');
        curl_setopt($ch,CURLOPT_POST,1);
        curl_setopt($ch,CURLOPT_POSTFIELDS,$xml);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 5);
        curl_setopt($ch,CURLOPT_TIMEOUT, 10);

        $data = curl_exec($ch);

        //返回来的是xml格式需要转换成数组再提取值，用来做更新
        if($data){

            curl_close($ch);
            $data = strstr($data, "<xml");

            $r = false;
            $errcode = "";

            $p = xml_parser_create();
            $parse = xml_parse_into_struct($p, $data, $vals, $title);
            xml_parser_free($p);

            foreach ($title as $k => $value) {
                $k = strtoupper($k);
                $res = $vals[$value[0]]['value'];
                $$k = strtoupper($res);
            }

            // 请求结果
            if($RETURN_CODE == "SUCCESS"){

                // 业务结果 提现申请接收成功
                if($RESULT_CODE == "SUCCESS"){
                    return array("state" => 100, "date" => GetMkTime($PAYMENT_TIME), "payment_no" => $PAYMENT_NO);
                }else{

                    if($ERR_CODE == 'NAME_MISMATCH'){
                        $ERR_CODE_DES = '实名认证姓名与提现的微信实名信息不一致！';
                    }elseif($ERR_CODE == 'NOTENOUGH'){
                        $ERR_CODE_DES = '系统账户余额不足！';
                    }

                    return array("state" => 200, "info" => "提现失败，错误信息：" . $ERR_CODE_DES);
                }

            }else{
                return array("state" => 200, "info" => "$RETURN_MSG");
            }
        }else{
            $error = curl_error($ch);
            curl_close($ch);
            return array("state" => 200, "info" => "curl出错，错误代码：$error");
        }

    }

}

function arrayToXml($arr){
    $xml = "<xml>";
    foreach ($arr as $key=>$val){
        if(is_array($val)){
            $xml.="<".$key.">".arrayToXml($val)."</".$key.">";
        }else{
            $xml.="<".$key.">".$val."</".$key.">";
        }
    }
    $xml.="</xml>";
    return $xml ;
}
