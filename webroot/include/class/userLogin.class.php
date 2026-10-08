<?php   if(!defined('HUONIAOINC')) exit('Request Error!');

/**
 *  检验用户是否有权使用某功能
 *  CheckPurview函数只是对他回值的一个处理过程
 *
 * @access    public
 * @param     string  $n  功能名称
 * @return    mix  如果具有则返回TRUE
 */
function testPurview($n){

    //去除不需要的信息
    $n = preg_replace('/\.php(\?action\=)?/', '', $n);
    $n = preg_replace('/\.php(\?type\=)?/', '', $n);
    $n = preg_replace('/\?action\=/', '', $n);
    $n = preg_replace('/\?type\=/', '', $n);
    $n = preg_replace('/\?typeid\=/', '', $n);
    $n = preg_replace('/\?tpl\=/', '', $n);
    $n = preg_replace('/&/', '', $n);
    $n = preg_replace('/=1/', '', $n);

    $rs = FALSE;
    global $userLogin;
    $purview = $userLogin->getPurview();
    if(preg_match('/founder/i', $purview)){
        return TRUE;
    }
    if($n == ''){
        return TRUE;
    }
    $ns = explode(',', $n);
    foreach($ns as $n){
        //只要找到一个匹配的权限，即可认为用户有权访问此页面
        if($n == ''){
            continue;
        }
        if(in_array($n, explode(',',$purview))){
            $rs = TRUE;
            break;
        }
    }
    return $rs;
}

/**
 *  对权限检测后返回操作对话框
 *
 * @access    public
 * @param     string  $n  功能名称
 * @return    string
 */
function checkPurview($n){
    if(!testPurview($n)){
        ShowMsg("对不起，您无权使用此功能！", 'javascript:;');
        exit();
    }
}

/**
 * 管理员登陆类
 *
 * @version        $Id: userlogin.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class userLogin extends db_connect{
    var $userName = '';
    var $userPwd = '';
    var $userID = '';
    var $userPASSWORD = '';
    var $userPurview = '';
    var $keepUserID = 'admin_auth';
    var $keepMemberID = 'login_user';
    var $keepUserPurview = 'keepuserpurview';

    private $_saltLength = 7;

    /**
     * 保存或生成一个DB对象，设定盐的长度
     *
     * @param object $db 数据库对象
     * @param int $saltLength 密码盐的长度
     */
    function __construct($db = NULL, $saltLength = NULL){
        global $admin_path;

        parent::__construct($db);

        /*
         * 若传入一个整数，则用它来设定saltLength的值
         */
        if(is_int($saltLength)){
            $this->_saltLength = $saltLength;
        }

        if(isset($_SESSION[$this->keepUserID])){
            $this->userID = $_SESSION[$this->keepUserID];
        }

        if(isset($_SESSION[$this->keepUserPurview])){
            $this->userPurview = $_SESSION[$this->keepUserPurview];
        }
    }

    function userLogin(){
        $this->__construct();
    }

    /**
     *  检验用户是否正确
     *
     * @access    public
     * @param     string    $username  用户名
     * @param     string    $userpwd  密码
     * @return    string
     */
    function checkUser($username, $userpwd, $admin = false){
        //只允许用户名和密码用0-9,a-z,A-Z,'@','_','.','-'这些字符
        // $this->userName = preg_replace("/[^0-9a-zA-Z_@!\.-]/", '', $username);
        // $this->userPwd = preg_replace("/[^0-9a-zA-Z_@!\.-]/", '', $userpwd);
        $this->userName = $username;
        $this->userPwd = $userpwd;

        global $cfg_errLoginCount;
        global $cfg_loginLock;
        global $dsql;

        $ip = GetIP();
        $archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            //验证错误次数，并且上次登录错误是在15分钟之内
            if($results[0]['count'] >= $cfg_errLoginCount){
                $timedifference = GetMkTime(time()) - $results[0]['date'];
                if($timedifference/60 < $cfg_loginLock){
                    return -1;
                }
            }
        }

        //mtype为0表示系统管理员，3为城市管理员
        $where = " AND member.`mtype` != 0";
        if($admin) $where = " AND (member.`mtype` = 0 OR member.`mtype` = 3)";

        $sql = $dsql->SetQuery("SELECT member.*,admin.purviews FROM `#@__member` member LEFT JOIN `#@__admingroup` admin ON admin.id = member.mgroupid WHERE member.username = '".$this->userName."' AND member.mgroupid != ''".$where." LIMIT 1");
        $results = $dsql->dsqlOper($sql, "results");
        $user = $results[0];

        //根据用户输入的密码生成散列后的密码
        $hash = $this->_getSaltedHash($this->userPwd, $user['password']);

        //若用户名在数据库中不存在则返回出错信息
        if(!isset($user)){
            return -1;
        }

        if($user['state'] == 1){
            return -3;
        }

        //判断账号是否已经过期
        $_now = GetMkTime(time());
        $_expired = (int)$user['expired'];
        if($_expired && $_now > $_expired){
            return -4;
        }

        //检查散列后的密码是否与数据库中保存的密码一致
        if($user['password'] == $hash){
            $this->userID = $user['id'];
            $this->userPASSWORD = $user['password'];
            // $this->userPurview = $user['purviews'];
            $this->keepUser();

            //向管理员发送登录通知
            if($user['wechat_openid']){
                $param = array(
                    'type' 	 => 3, //指定openid
                    'openid' => $user['wechat_openid'],
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => '您的账号刚刚通过（账号密码）的方式登录了后台，如非本人操作，请立即访问后台修改密码！',
                        'date' => date("Y-m-d H:i:s", GetMkTime(time())),
                    )
                );
                updateAdminNotice("siteConfig", "admin", $param);
            }

            return 1;
        }

        //如果密码不正确返回出错信息
        else{
            return -2;
        }
    }

    /**
     *  根据手机号码和验证码登录后台
     *
     * @access    public
     * @param     string    $phone  用户名
     * @param     string    $code  密码
     * @return    string
     */
    function checkAdminUserByPhone($phone, $code){
        global $dsql;
        global $langData;
        $phone = (int)$phone;
        $code = (int)$code;

        //验证输入的验证码
        $archives = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'sms_login' AND `user` = '".$phone."' AND `code` = '$code'");
        $results  = $dsql->dsqlOper($archives, "results");
        if(!$results){
            return $langData['siteConfig'][21][222];  //验证码输入错误，请重试！
        }else{

            //5分钟有效期
            $now = GetMkTime(time());
            if($now - $results[0]['pubdate'] > 300) return $langData['siteConfig'][21][33];  //验证码已过期，请重新获取！

            //验证通过删除发送的验证码
            $archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'sms_login' AND `user` = '".$phone."' AND `code` = '$code'");
            $dsql->dsqlOper($archives, "update");
        }

        $where = " AND (member.`mtype` = 0 OR member.`mtype` = 3)";
        $sql = $dsql->SetQuery("SELECT member.*,admin.purviews FROM `#@__member` member LEFT JOIN `#@__admingroup` admin ON admin.id = member.mgroupid WHERE member.phone = '".$phone."' AND member.mgroupid != ''".$where." LIMIT 1");

        $results = $dsql->dsqlOper($sql, "results");
        $user = $results[0];

        //若用户名在数据库中不存在则返回出错信息
        if(!isset($user)){
            return -1;
        }

        if($user['state'] == 1){
            return -2;
        }

        //验证通过
        $this->userID = $user['id'];
        $this->userPASSWORD = $user['password'];
        $this->keepUser();

        //向管理员发送登录通知
        if($user['wechat_openid']){
            $param = array(
                'type' 	 => 3, //指定openid
                'openid' => $user['wechat_openid'],
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => '您的账号刚刚通过（短信验证码）的方式登录了后台，如非本人操作，请立即访问后台修改密码！',
                    'date' => date("Y-m-d H:i:s", GetMkTime(time())),
                )
            );
            updateAdminNotice("siteConfig", "admin", $param);
        }

        return 1;
    }

    /**
     *  微信扫码登录后台
     *
     * @access    public
     * @param     string    $openid
     * @return    string
     */
    function checkAdminUserByOpenid($openid){
        global $dsql;
        global $langData;

        $where = " AND (member.`mtype` = 0 OR member.`mtype` = 3)";
        $sql = $dsql->SetQuery("SELECT member.*,admin.purviews FROM `#@__member` member LEFT JOIN `#@__admingroup` admin ON admin.id = member.mgroupid WHERE member.wechat_openid = '".$openid."' AND member.mgroupid != ''".$where." LIMIT 1");

        $results = $dsql->dsqlOper($sql, "results");
        $user = $results[0];

        //若用户名在数据库中不存在则返回出错信息
        if(!isset($user)){
            return -1;
        }

        if($user['state'] == 1){
            return -2;
        }

        //验证通过
        $this->userID = $user['id'];
        $this->userPASSWORD = $user['password'];
        $this->keepUser();

        //向管理员发送登录通知
        if($user['wechat_openid']){
            $param = array(
                'type' 	 => 3, //指定openid
                'openid' => $user['wechat_openid'],
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => '您的账号刚刚通过（微信扫码）的方式登录了后台，如非本人操作，请立即访问后台修改密码！',
                    'date' => date("Y-m-d H:i:s", GetMkTime(time())),
                )
            );
            updateAdminNotice("siteConfig", "admin", $param);
        }
        
        return 1;
    }

    /**
     * 验证用户是否存在
     * @param  int  $udi  用户ID
     * @return  boolean
     *
     */
    function checkUserNull($uid){
        global $dsql;
        if($uid){
            if(!is_numeric($uid)){
                $RenrenCrypt = new RenrenCrypt();
                $uid = $RenrenCrypt->php_decrypt(base64_decode($uid));
                $uid = explode("&", $uid);
                $uid = $uid[0];
            }
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`state` = 1 OR `mtype` = 0 OR `mtype` = 3) AND `id` = ".(int)$uid);
            $res = $dsql->dsqlOper($sql, "results");
            if($res[0]){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }


    /**
     *  检验用户是否正确
     *
     * @access    public
     * @param     string    $username  用户名
     * @param     string    $userpwd  密码
     * @return    string
     */
    function memberLogin($username, $userpwd){
        $this->userName = addslashes($username);
        $this->userPwd = addslashes($userpwd);

        global $cfg_errLoginCount;
        global $cfg_loginLock;
        global $dsql;

        $ip = GetIP();
        $archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            //验证错误次数，并且上次登录错误是在15分钟之内
            if($results[0]['count'] >= $cfg_errLoginCount){
                $timedifference = GetMkTime(time()) - $results[0]['date'];
                if($timedifference/60 < $cfg_loginLock){
                    return -1;
                }
            }
        }

        $sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE (`username` = '".$this->userName."' OR `email` = '".$this->userName."' OR `phone` = '".$this->userName."') AND `mtype` != 0 AND `mtype` != 3");
        $user = $dsql->dsqlOper($sql, "results");

        //若用户名在数据库中不存在则返回出错信息
        if(!isset($user) || !$user){
            return -1;
        }
        // 查询结果不止1条并且填写的用户名是手机号
        if(count($user) == 2 && is_numeric($this->userName)){
            $r1 = $this->memberLoginCheck($user[0]);
            if($r1 == 1){
                $r2 = $this->memberLoginCheck($user[1]);
                if($r2 == 1){
                    $k = 0;
                    if($user[0]['phone'] == $this->userName){
                        $k = 0;
                    }elseif($user[1]['phone'] == $this->userName){
                        $k = 1;
                    }elseif($user[0]['username'] == $this->userName){
                        $k = 0;
                    }elseif($user[1]['username'] == $this->userName){
                        $k = 1;
                    }
                    if($k == 1){
                        return $r2;
                    }else{
                        return $this->memberLoginCheck($user[$k]);
                    }
                }else{
                    return $r1;
                }
            }else{
                return $this->memberLoginCheck($user[1]);
            }
        }else{
            return $this->memberLoginCheck($user[0]);
        }



    }

    /**
     * 登录绑定上级
     * @param $user
     * @return int
     */
    function bindSuperior($userid, $fromShare = ''){
        global $cfg_memberBinding;
        if($userid) {

            if (!is_numeric($userid)) {
                $RenrenCrypt = new RenrenCrypt();
                $userid = $RenrenCrypt->php_decrypt(base64_decode($userid));
            }

            if(is_numeric($userid)){

                $data = GetMkTime(time());
                //查询会员是不是老用户  根据注册时间
                $archives = $this->SetQuery("SELECT `regtime`, `from_uid` FROM `#@__member` WHERE `id` = " . $userid);
                $results = $this->db->prepare($archives);
                $results->execute();
                $results = $results->fetchAll(PDO::FETCH_ASSOC);
                $datatime = $data - $results[0]['regtime'];
                $fromShare_ = $fromShare ? $fromShare : GetCookie('fromShare');
                $fromuid = $results['0']['from_uid'];

                if ((($datatime > 300 && $cfg_memberBinding == 0) || $datatime < 300) && ($fromuid == 0 && $fromShare_ != "" && $fromShare_ != $userid)) {

                    //防止出现两个会员之前循环推荐
                    $sj_uidsql = $this->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = " . $fromShare_);
                    $sj_uidres = $this->db->prepare($sj_uidsql);
                    $sj_uidres->execute();
                    $sj_uidres = $sj_uidres->fetchAll(PDO::FETCH_ASSOC);
                    if($sj_uidres[0]['from_uid'] != $userid){

                        $nowTime = GetMkTime(time());//当前时间，绑定的时候保存绑定时间

                        require_once(HUONIAOINC.'/config/fenxiaoConfig.inc.php');
                        $fenxiaoBinding = (int)$cfg_fenxiaoBinding;

                        $pass = false;
                        if ($fenxiaoBinding == 1) {
                            //分销商查询
                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` where `uid` = '$fromShare_' AND `state`=1");
                            $fxuid = $dsql->getOne($sql);
                            $pass = $fxuid ? true : false;
                        } else {
                            $pass = true;
                        }

                        if ($pass) {
                            $archives = $this->SetQuery("UPDATE `#@__member` SET `from_uid` = $fromShare_, `from_bindtime` = '$nowTime' WHERE `id` = '$userid'");
                            $results = $this->db->prepare($archives);
                            $results->execute();
                        }

                        //记录会员变动日志
                        require_once HUONIAOROOT . "/api/payment/log.php";
                        $_memberLog = new CLogFileHandler(HUONIAOROOT . '/log/member/' . date('Y-m-d') . '.log', true);
                        $_memberLog->DEBUG($archives, true);
                    }

                }
                
            }
        }

    }


    /**
     * 短信验证码登录
     * @param $user
     * @return int
     */
    function memberLoginCheckForSmsCode($user){
        //根据用户输入的密码生成散列后的密码
        // $hash = $this->_getSaltedHash($this->userPwd, $user['password']);

        //会员状态
        if($user['state'] != 1){
            return '该账户状态异常，登录失败！';
        }
        if($user['is_cancellation']){
            return '该账户已申请注销';
        }

        $data = $user;
        $data['uPwd'] = $this->userPwd;

        //验证论坛是否可以登录
        global $cfg_bbsState;
        global $cfg_bbsType;

        if($cfg_bbsState == 1 && $cfg_bbsType != ""){

        }else{
            // 如果用户输入密码为空并且实际密码也为空，验证此时是否存为第三方登陆 用于第三方登陆绑定手机号后自动登陆
            $is_loginConnect = false;
            if(empty($this->userPwd) && empty($user['password'])){
                $this->keepUserID = $this->keepMemberID;
                $this->userID = $user['id'];
                $this->userPASSWORD = $user['password'];
                $this->keepUser();

                //登录成功，重置登录失败次数
                $ip = GetIP();
                $archives = $this->SetQuery("UPDATE `#@__failedlogin` SET `count` = 0 WHERE `ip` = '$ip'");
                $results = $this->db->prepare($archives);
                $results->execute();
                return 1;
            }
            if($user['password'] || $is_loginConnect){
                $this->keepUserID = $this->keepMemberID;
                $this->userID = $user['id'];
                $this->userPASSWORD = $user['password'];
                $this->keepUser();

                //登录成功，重置登录失败次数
                $ip = GetIP();
                $archives = $this->SetQuery("UPDATE `#@__failedlogin` SET `count` = 0 WHERE `ip` = '$ip'");
                $results = $this->db->prepare($archives);
                $results->execute();
                return 1;
            }
        }
    }
    /**
     * 登陆验证,分离出来是为了处理手机号作为一个账号的用户名的同时又被另一个账号绑定的情况
     * @param  [type] $user [description]
     * @return [type]       [description]
     */
    function memberLoginCheck($user){
        //根据用户输入的密码生成散列后的密码
        $hash = $this->_getSaltedHash($this->userPwd, $user['password']);

        //会员状态
        if($user['state'] == 0){
            return -3;
        }
        if($user['state'] == 2){
            return -4;
        }

        if($user['is_cancellation'] == 1){
            return -5;
        }

        $data = $user;
        $data['uPwd'] = $this->userPwd;

        //验证论坛是否可以登录
        global $cfg_bbsState;
        global $cfg_bbsType;
        $bbsID = $this->bbsSync($data, "login");

        if($cfg_bbsState == 1 && $cfg_bbsType != ""){
            if($bbsID > 0){
                //登录成功，重置登录失败次数
                $ip = GetIP();
                $archives = $this->SetQuery("UPDATE `#@__failedlogin` SET `count` = 0 WHERE `ip` = '$ip'");
                $results = $this->db->prepare($archives);
                $results->execute();

                //如果是通过论坛验证的，则更新主站密码
                $npass = $this->_getSaltedHash($this->userPwd);
                $archives = $this->SetQuery("UPDATE `#@__member` SET `password` = '$npass' WHERE `id` = ".$user['id']);
                $results = $this->db->prepare($archives);
                $results->execute();

                //论坛同步操作
                $this->bbsSync($data, "synlogin");

                //如果验证通过，则返回成功
                $this->keepUserID = $this->keepMemberID;
                $this->userID = $user['id'];
                $this->userPASSWORD = $npass;
                $this->keepUser();
                //绑定上下级
                $this->bindSuperior($user['id']);
                return 1;

            }else{

                //如果论坛用户不存在或已删除，再与主站数据进行匹配
                if($user['password'] == $hash){
                    $this->keepUserID = $this->keepMemberID;
                    $this->userID = $user['id'];
                    $this->userPASSWORD = $user['password'];
                    $this->keepUser();

                    //登录成功，重置登录失败次数
                    $ip = GetIP();
                    $archives = $this->SetQuery("UPDATE `#@__failedlogin` SET `count` = 0 WHERE `ip` = '$ip'");
                    $results = $this->db->prepare($archives);
                    $results->execute();

                    //更新论坛密码
                    $update['username'] = $user['username'];
                    $update['newpw'] = $this->userPwd;
                    $update['email'] = $user['email'];
                    $this->bbsSync($update, "edit");

                    //论坛同步操作
                    $this->bbsSync($data, "synlogin");

                    //绑定上下级
                    $this->bindSuperior($user['id']);
                    return 1;

                    //如果密码不正确返回出错信息
                }else{
                    return -2;
                }
            }

            //验证本站数据
        }else{

            // 如果用户输入密码为空并且实际密码也为空，验证此时是否存为第三方登陆 用于第三方登陆绑定手机号后自动登陆
            $is_loginConnect = false;
            if(empty($this->userPwd) && empty($user['password'])){
                $uid = $_REQUEST['bindMobile'] ?: GetCookie("connect_uid");
                if($uid){
                    $RenrenCrypt = new RenrenCrypt();
                    $userid = $RenrenCrypt->php_decrypt(base64_decode($uid));
                    if($userid == $user['id']){
                        $is_loginConnect = true;
                        DropCookie("connect_uid");
                    }
                }
            }
            //检查散列后的密码是否与数据库中保存的密码一致

            if($user['password'] == $hash || $is_loginConnect){
                $this->keepUserID = $this->keepMemberID;
                $this->userID = $user['id'];
                $this->userPASSWORD = $user['password'];
                $this->keepUser();

                //登录成功，重置登录失败次数
                $ip = GetIP();
                $archives = $this->SetQuery("UPDATE `#@__failedlogin` SET `count` = 0 WHERE `ip` = '$ip'");
                $results = $this->db->prepare($archives);
                $results->execute();

                //更新论坛密码
                $update['username'] = $user['username'];
                $update['newpw'] = $this->userPwd;
                $update['email'] = $user['email'];
                $this->bbsSync($update, "edit");

                //论坛同步操作
                $this->bbsSync($data, "synlogin");

                //绑定上下级
                $this->bindSuperior($user['id']);
                return 1;

                //如果密码不正确返回出错信息
            }else{
                return -2;
            }

        }
    }


    /**
     * 获取登录用户信息
     * @return array
     */
    function getMemberInfo($uid = '', $simple = 0){
        $mid = empty($uid) ? $this->getMemberID() : $uid;
        $memberInfo = array();

        if($mid > -1){
            global $handler;
            $handler = true;
            $handels = new handlers("member", "detail");
            $memberInfo = $handels->getHandle(array("id" => $mid, "simple" => $simple));
            $memberInfo = $memberInfo["info"];
        }

        return $memberInfo;
    }


    /**
     * 获取用户模块信息
     * @return array
     */
    function getMemberModule($uid = ''){
        $mid = empty($uid) ? $this->getMemberID() : $uid;
        $memberInfo = array();

        if($mid > -1){
            global $handler;
            $handler = true;
            $handels = new handlers("member", "memberModule");
            $memberInfo = $handels->getHandle(array("id" => $mid));
            $memberInfo = $memberInfo["info"];
        }
        return $memberInfo;
    }


    /**
     * 获取企业用户套餐信息
     * @return array
     */
    function getMemberPackage($uid = ''){
        global $memberPackageByUID;
        if(!$memberPackageByUID){
            $memberPackageByUID = array();
        }
        $mid = empty($uid) ? $this->getMemberID() : $uid;
        $memberInfo = array();

        if($mid > -1){

            if($memberPackageByUID[$mid]){
                return $memberPackageByUID[$mid];
            }

            global $handler;
            $handler = true;
            $handels = new handlers("member", "memberPackage");
            $memberInfo = $handels->getHandle(array("id" => $mid));
            $memberInfo = $memberInfo["info"];
        }

        $memberPackageByUID[$mid] = $memberInfo;
        
        return $memberInfo;
    }


    /**
     * 整合第三方登录
     * @param    string    $code      类型
     * @param    string    $key       唯一值
     * @param    string    $nickname  昵称
     * @param    string    $photo     头像
     * @return   array
     */
    function loginConnect($params){
        global $langData;

        extract($params);
        global $cfg_secureAccess;
        global $cfg_basehost;
        $cfg_basehost = $cfg_secureAccess.$cfg_basehost;
        $loginRedirect = $_SESSION['loginRedirect'] ? $_SESSION['loginRedirect'] : GetCookie("loginRedirect");
        $loginRedirect = $loginRedirect ? $loginRedirect : $cfg_basehost;

        //如果路径中有/pages/关键字，用首页地址，用于location.href
        $_loginRedirect = strstr($loginRedirect, '/pages/') ? $cfg_basehost : $loginRedirect;

        //如果有城市ID参数，更新用户信息时，需要同步更新下用户的城市ID，此功能与分站绑定独立公众号有关，涉及到给用户发模板消息
        $_updateCityid = '';
        $_cityid = (int)$_GET['_cityid'];
        if($_cityid){
            $_updateCityid = ", `cityid` = '$_cityid'";
        }

        //限制注册
        global $cfg_regstatus;
        global $cfg_regclosemessage;
        if ($cfg_regstatus == 0) {
            die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$cfg_regclosemessage.'");window.close();top.location="'.$_loginRedirect.'";</script>');
        }

        global $cfg_bindMobile;  //第三方登录必须绑定手机号码
        global $cfg_wechatBindPhone;   //微信注册必须绑定手机

        $fromShare = GetCookie('fromShare');
        $platform = $_GET['platform']; //用于区分APP原生登录  值为：app

		$weixinSubscribe = '';
		if(isset($params['wechat_subscribe'])){
	        $wechat_subscribe = (int)$wechat_subscribe; //是否关注微信公众号
			$weixinSubscribe = ", `wechat_subscribe` = '$wechat_subscribe'";
		}

        //如果有传入app的openid，则保存一下
        if (isset($params['app_openid']) && $params['app_openid'] != null) {
            $weixinSubscribe .= ", `wechat_app_openid` = '".$params['app_openid']."'";
        }

        //苹果新版本不再传设备信息，为了使用推送功能，这里需要记录苹果设备
        $isIOSApp = isIOSApp() && !isAndroidApp();
        $deviceTitle = $isIOSApp ? 'iphone' : $deviceTitle;
        $deviceType = $isIOSApp ? 'iphone' : $deviceType;
        $deviceSerial = $isIOSApp ? 'iphone' : $deviceSerial;

         //记录当前设备s
        $sourceArr = array(
            "title" => $deviceTitle,
            "type"  => $deviceType,
            "serial" => str_replace('-', '_', $deviceSerial),
            "pudate" => time()
        );
         //记录当前设备e

		 // 在设备上已登录状态的账号，通过扫码后自动登录此账号，此功能会造成扫码登录的不是设备绑定的账号，而是当前已登录的账号，所以将此功能删除。  by gz 20200525
        // $uid = $this->getMemberID();

        // PC端已登录，扫码时如果后台设置微信访问自动登陆，会创建新用户
        // 所以在PC端已登陆的情况下，使用PC端已登录uid
        // 只要验证微信号是否已被其他用户绑定
        if($state && !is_numeric($state)){
            $archives = $this->SetQuery("SELECT `loginUid` FROM `#@__site_wxlogin` WHERE `state` = '$state'");
            $results = $this->db->prepare($archives);
            $results->execute();
            $results = $results->fetchAll(PDO::FETCH_ASSOC);
            if($results){
                $pc_uid = $results[0]['loginUid'];
                if($pc_uid){
                    if($openid){
                        $archives = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` != $pc_uid AND (`mtype` = 1 OR `mtype` = 2) AND (`".$code."_conn` = '$key' OR `wechat_openid` = '$key' OR `".$code."_conn` = '$openid' OR `wechat_openid` = '$openid')");
                    }else{
                        $archives = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` != $pc_uid AND (`mtype` = 1 OR `mtype` = 2) AND (`".$code."_conn` = '$key' OR `wechat_openid` = '$key')");
                    }
                    $results = $this->db->prepare($archives);
                    $results->execute();
                    $results = $results->fetchAll(PDO::FETCH_ASSOC);
                    if($results){
                        $sql = $this->SetQuery("UPDATE `#@__site_wxlogin` SET `sameConn` = '".$results[0]['id']."&".$key."' WHERE `loginUid` = $pc_uid");
                        $res = $this->db->prepare($sql);
                        $res->execute();
                        die('<meta charset="UTF-8"><script type="text/javascript">alert("您的帐号已经绑定其他用户，请在电脑端进行重新绑定的操作！");window.close();top.location="'.$_loginRedirect.'";</script>');
                    }
                    $uid = $pc_uid;
                }
            }
        }

		//移动端绑定微信
        if($state && is_numeric($state)){
        	$uid = $state;
        }

        //关注公众号，不创建新用户，原因：2021年12月27日之后，微信接口不再输出头像、昵称信息。
        //https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId
        if($wechat_subscribe && !$uid){

            //根据key查询是否已经注册过账号，如果已经注册过，更新用户关注公众号字段
            if($openid){
                $archives = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2) AND (`".$code."_conn` = '$key' OR `wechat_openid` = '$key' OR `".$code."_conn` = '$openid' OR `wechat_openid` = '$openid')");
            }else{
                $archives = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2) AND (`".$code."_conn` = '$key' OR `wechat_openid` = '$key')");
            }
            $results = $this->db->prepare($archives);
            $results->execute();
            $results = $results->fetchAll(PDO::FETCH_ASSOC);
            if($results){
                $uid = $results[0]['id'];

                $sql = $this->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = 1 ".$_updateCityid." WHERE `id` = '$uid'");
                $res = $this->db->prepare($sql);
                $res->execute();
            }

            die('userLogin.667');
            return false;
        }

        //判断是否为已经登录的用户，如果是则绑定此社交账号
        if($uid > -1){

            $archives = $this->SetQuery("SELECT `id`, `username`, `password`, `is_cancellation` FROM `#@__member` WHERE `id` = '$uid'");
            $results = $this->db->prepare($archives);
            $results->execute();
            $results = $results->fetchAll(PDO::FETCH_ASSOC);

            if(!$results){
                if(!$noRedir){
                    die('要绑定社交账号的用户不存在！');
                }
            }else{

                if($results[0]['is_cancellation']){
                    die('<meta charset="UTF-8"><script type="text/javascript">alert("该账户已申请注销");top.location="'.$_loginRedirect.'";</script>');
                }

                $username = $results[0]['username'];

                //如果是扫码登录
                if($state && !is_numeric($state)){

                    $this->keepUserID = $this->keepMemberID;
                    $this->userID = $uid;
                    $this->userPASSWORD = $results[0]['password'];
                    $this->keepUser();
                    //绑定上下级
                    $this->bindSuperior($userid,$fromShare);

                    $archives_ = $this->SetQuery("UPDATE `#@__site_wxlogin` SET `uid` = '$uid' WHERE `state` = '$state'");
                    $results_ = $this->db->prepare($archives_);
                    $results_->execute();

                    //论坛同步
                    global $cfg_bbsState;
                    global $cfg_bbsType;
                    if($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()){
                        $data['username'] = $username;
                        $data['uPwd']     = md5(uniqid(rand(), TRUE));
                        $this->bbsSync($data, "synlogin");
                    }

                    if($code == 'wechat'){
                        $archives = $this->SetQuery("UPDATE `#@__member` SET `".$code."_conn` = '$key', `wechat_openid` = '$openid'".$weixinSubscribe.$_updateCityid." WHERE `id` = '$uid'");
                    }else{
                        $archives = $this->SetQuery("UPDATE `#@__member` SET `".$code."_conn` = '$key' WHERE `id` = '$uid'");
                    }
                    $results = $this->db->prepare($archives);
                    $results->execute();


                    if(isMobile()){
                        die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$_loginRedirect.'";</script>');
                    }else{
                        die('<meta charset="UTF-8"><script type="text/javascript">window.close();top.location="'.$_loginRedirect.'";</script>');
                    }


                }else{
                    if($openid){
                        $archives = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE (`".$code."_conn` = '$key' OR `wechat_openid` = '$key' OR `".$code."_conn` = '$openid' OR `wechat_openid` = '$openid') AND (`mtype` = 1 OR `mtype` = 2)");
                    }else{
                        $archives = $this->SetQuery("SELECT `id` FROM `#@__member` WHERE (`".$code."_conn` = '$key' OR `wechat_openid` = '$key') AND (`mtype` = 1 OR `mtype` = 2)");
                    }
                    $results = $this->db->prepare($archives);
                    $results->execute();
                    $results = $results->fetchAll(PDO::FETCH_ASSOC);
                    if($results){

                        //关注公众号
                        if(isset($params['wechat_subscribe'])){
                            $archives = $this->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = 1 ".$_updateCityid." WHERE `id` = '$uid'");
                            $results = $this->db->prepare($archives);
                            $results->execute();
                		}

                        if(!$noRedir){
                            // 打开弹出层请用户确认是否修改绑定
                            $sameConn = $results[0]['id']."&".$key;
                            $RenrenCrypt = new RenrenCrypt();
                            $sameConn = base64_encode($RenrenCrypt->php_encrypt($sameConn));

                            // die('您的帐号已经绑定其他用户！');
                            // die('<meta charset="UTF-8"><script type="text/javascript">window.opener.hasBindOtherUser("'.$sameConn.'");window.close();</script>');
                            // die('<meta charset="UTF-8"><script type="text/javascript">if(hasBindOtherUser){hasBindOtherUser("'.$sameConn.'");}else{window.opener.hasBindOtherUser("'.$sameConn.'");window.close();}</script>');

                            if(isMobile()){
								if($isapp){
									die('<script type="text/javascript">alert("您的帐号已经绑定其他用户，请在电脑端进行重新绑定的操作！");</script>');
								}else{
	                                global $cfg_cookiePath;
	                                PutCookie("sameConnData", $code.'#'.$sameConn, 15, $cfg_cookiePath);
	                                $furl = GetCookie("furl");
	                                if($furl){
	                                    die('<meta charset="UTF-8"><script type="text/javascript">alert("您的帐号已经绑定其他用户，请在电脑端进行重新绑定的操作！");window.close();top.location="'.$furl.'";</script>');
	                                }else{
	                                    die('<meta charset="UTF-8"><script type="text/javascript">setTimeout(function(){history.go(-1);},500)</script>');
	                                }
								}

                            }else{
                                die('<meta charset="UTF-8"><script type="text/javascript">window.opener.hasBindOtherUser("'.$sameConn.'");window.close();</script>');
                            }
                        }
                    }else{
                        $archives = $this->SetQuery("UPDATE `#@__member` SET `".$code."_conn` = '$key', `wechat_openid` = '$openid'".$weixinSubscribe.$_updateCityid." WHERE `id` = '$uid'");
                        $results = $this->db->prepare($archives);
                        $results->execute();
                        if(!$noRedir){
                            $furl = GetCookie("furl");
                            $loginRedirect = $furl ? $furl : $loginRedirect;

                            //如果路径中有/pages/关键字，用首页地址，用于location.href
                            $_loginRedirect = strstr($loginRedirect, '/pages/') ? $cfg_basehost : $loginRedirect;

                            if(isMobile()){
                                die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$_loginRedirect.'";</script>');
                            }else{
                                die('<meta charset="UTF-8"><script type="text/javascript">window.close();top.location="'.$_loginRedirect.'";</script>');
                            }
                            // echo '<script type="text/javascript">setTimeout(function(){window.close();}, 500);</script>绑定成功！';
                        }
                    }
                }
            }

            return;
        }

        if(!$noRedir){
            if(isMobile()){
                if(empty($key)) die('<meta charset="UTF-8"><script type="text/javascript">setTimeout(function(){top.location="'.$_loginRedirect.'";}, 5000);</script>登录失败！');
            }else{
                if(empty($key)) die('<meta charset="UTF-8"><script type="text/javascript">setTimeout(function(){window.close();top.location="'.$_loginRedirect.'";}, 5000);</script>登录失败！');
            }
        }

        $_nickcode = array('wechat' => '微信用户');
        $_nickcode = $_nickcode[$code];

        //生成用户名【昵称+随机】
        $chcode = strtolower(create_check_code(4));
        // $username = $chcode."@".(strlen($code) > 6 ? substr($code, 0, 5) : $code);
        $username = $chcode."@".$code;
        $nickname = $nickname ? $nickname : ($_nickcode ? $_nickcode : $code) . $chcode;
        $nickname = addslashes($nickname);
        // $password = substr($key, 0, 20);
        $password = "";  //第三方快捷登录，不设置密码，主要为了在会员中心修改密码时不输原密码

        $ip   = GetIP();
        $ipaddr = getIpAddr($ip);
        $time = GetMkTime(time());

        //验证用户是否已存在
        if($openid){
            $archives = $this->SetQuery("SELECT `id`, `username`, `phoneCheck`, `state`, `password`, `sourceclient`,`mtype`, `is_cancellation` FROM `#@__member` WHERE (`".$code."_conn` = '$key' OR `wechat_openid` = '$key' OR `".$code."_conn` = '$openid' OR `wechat_openid` = '$openid') AND (`mtype` = 1 OR `mtype` = 2)");
        }else{
            $archives = $this->SetQuery("SELECT `id`, `username`, `phoneCheck`, `state`, `password`, `sourceclient`,`mtype`, `is_cancellation` FROM `#@__member` WHERE (`".$code."_conn` = '$key' OR `wechat_openid` = '$key') AND (`mtype` = 1 OR `mtype` = 2)");
        }
        // echo $archives;die;
        global $dsql;
        $results = $this->db->prepare($dsql->processSensitiveFieldsInSQL($archives));
        $results->execute();
        $results = $results->fetchAll(PDO::FETCH_ASSOC);

        //如果已经存在，如果已绑定手机号，则自动登录
        if($results){

            if($results[0]['is_cancellation']){
                die('<meta charset="UTF-8"><script type="text/javascript">alert("该账户已申请注销");top.location="'.$_loginRedirect.'";</script>');
            }

            $userid = $results[0]['id'];
            $mtype  = $results[0]['mtype'];
             //记录当前设备s
            if($results[0]['sourceclient']){
                $sourceclientAll = unserialize($results[0]['sourceclient']);
            }
             //记录当前设备e

            //如果是微信扫码登录，需要更新临时登录日志
            if($state){
                $archives_ = $this->SetQuery("UPDATE `#@__site_wxlogin` SET `uid` = '$userid' WHERE `state` = '$state'");
                $results_ = $this->db->prepare($archives_);
                $results_->execute();
            }

            // 会员状态未审核，但设置了微信自动登陆
            if($results[0]['state'] == 0 && $code == "wechat" && $cfg_wechatBindPhone){
                global $cfg_cookiePath;
                $RenrenCrypt = new RenrenCrypt();
                $userid_ = base64_encode($RenrenCrypt->php_encrypt($userid));
                PutCookie("connect_uid", $userid_, 300, $cfg_cookiePath);
                PutCookie("connect_code", $code, 300, $cfg_cookiePath);
            }

            if($results[0]['state'] == 0 && $results[0]['phoneCheck'] == 0 && $cfg_bindMobile){

                //如果开启了微信注册必须绑定手机，则跳转到绑定手机页面
                // if(isMobile() && ($code != "wechat" || ($code == "wechat" && $cfg_wechatBindPhone))){
                if(($code != "wechat" || ($code == "wechat" && $cfg_wechatBindPhone))){
                    global $cfg_cookiePath;
                    $RenrenCrypt = new RenrenCrypt();
                    $userid = base64_encode($RenrenCrypt->php_encrypt($userid));
                    PutCookie("connect_uid", $userid, 300, $cfg_cookiePath);
                    PutCookie("connect_code", $code, 300, $cfg_cookiePath);

                    //原生登录需要输出json
                    if($platform == 'app'){
                        die(json_encode(array(
                            'state' => '101',
                            'info' => 'bindMobile',
                            'url' => $cfg_basehost . '/bindMobile.html?type=' . $code . '&connect_uid=' . $userid . '&connect_code=' . $code
                        )));

                    //H5和APP混合需要由脚本来做跳转
                    }elseif(isApp()){
                        die('bindMobile');
                    }else {
                        echo '跳转中...';
                        header("location:/bindMobile.html?from=1&type=" . $code . '&connect_uid=' . $userid);
                    }
                    die;

                    //没有开启则更新会员状态为已审核，并自动登录
                }else{
                    $archives = $this->SetQuery("UPDATE `#@__member` SET `state` = '1' WHERE `id` = ".$userid);
                    $results_ = $this->db->prepare($archives);
                    $results_->execute();
                }
            }

            //账号未审核
            if($results[0]['state'] == 0){
                die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$langData['siteConfig'][21][256].'");top.location="'.$_loginRedirect.'";</script>');  //账号等待审核中，请稍候重试！
            }

            //账号未审核
            if($results[0]['state'] == 2){
                die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$langData['siteConfig'][21][257].'");top.location="'.$_loginRedirect.'";</script>');  //账号审核被拒绝，请联系客服处理！
            }


            $this->keepUserID = $this->keepMemberID;
            $this->userID = $userid;
            $this->userPASSWORD = $results[0]['password'];
            $this->keepUser();

            //绑定上下级
            $this->bindSuperior($userid,$fromShare);
            $username = $results[0]['username'];

            if($code == 'wechat'){
                $archives = $this->SetQuery("UPDATE `#@__member` SET `".$code."_conn` = '$key', `wechat_openid` = '$openid'".$weixinSubscribe.$_updateCityid." WHERE `id` = '$userid'");
            }else{
                $archives = $this->SetQuery("UPDATE `#@__member` SET `".$code."_conn` = '$key' WHERE `id` = '$userid'");
            }
            $results = $this->db->prepare($archives);
            $results->execute();

            //登录成功，重置登录失败次数
            $archives = $this->SetQuery("UPDATE `#@__failedlogin` SET `count` = 0 WHERE `ip` = '$ip'");
            $results = $this->db->prepare($archives);
            $results->execute();


            $addStaff = GetCookie('addStaff');
            if(!empty($addStaff) && $mtype !=2){
                /*商家添加员工*/
                $staffsql = $this->SetQuery("SELECT `id` FROM `#@__staff` WHERE `uid` = '$userid' ");

                $staffres = $this->db->prepare($staffsql);
                $staffres->execute();
                $staffres = $staffres->fetchAll(PDO::FETCH_ASSOC);

                if(!$staffres&&is_array($staffres)){
                    $businseesql = $this->SetQuery("SELECT `id`,`title` FROM `#@__business_list` WHERE `id` = '$addStaff' AND `uid` != '$userid'");

                    $businessres = $this->db->prepare($businseesql);

                    $businessres->execute();
                    $businessres = $businessres->fetchAll(PDO::FETCH_ASSOC);

                    if($businessres && is_array($businessres)) {

                        $storetitle = $businessres[0]['title'];

                        $nowtime = GetMkTime(time());

                        $upstaffsql = $this->SetQuery("INSERT INTO `#@__staff` (`sid`,`uid`,`pubdate`)VALUES ('$addStaff','$userid','$nowtime')");

                        $results = $this->db->prepare($upstaffsql);
                        $results->execute();

                        global $cfg_onlinetime;
                        PutCookie('is_staffsuccess', 1, $cfg_onlinetime * 60 * 60);
                        PutCookie('storetitle', "您已成为" . $storetitle . "员工", $cfg_onlinetime * 60 * 60);

                        DropCookie('addStaff');
                    }
                }


            }

            //记录当前设备s
            $sourceclients = array();
            if(!empty($deviceTitle) && !empty($deviceSerial) && !empty($deviceType)){
                if(!empty($sourceclientAll)){
                    $sourceclients = $sourceclientAll;
                    //$foundTitle  = array_search($deviceTitle, array_column($sourceclientAll, 'title'));
                    $foundSerial = array_search($deviceSerial, array_column($sourceclientAll, 'serial'));
                    //$foundType   = array_search($deviceType, array_column($sourceclientAll, 'type'));
                    if($foundSerial){
                        //如果已有，更新时间，以Serial为准
                        $sourceclients[$foundSerial]['pudate'] = time();
                    }else{
                        array_push($sourceclients, $sourceArr);
                    }
                }else{
                    $sourceclients[] = $sourceArr;
                }
                $sourceclients = serialize($sourceclients);

                $where_ = "`sourceclient` = '$sourceclients',";
            }
            //记录当前设备e

            //APP端和小程序端需要创建令牌
            $tokenField = $access_token = $refresh_token = "";

            $createApiTokenByPlatform = createApiTokenByPlatform($userid);
            $access_token = $createApiTokenByPlatform['access_token'];
            $refresh_token = $createApiTokenByPlatform['refresh_token'];
            if($access_token && $refresh_token){
                $_platform = '';
                if(isApp() || isWxMiniprogram() || isByteMiniprogram()){
                    $_platform = getCurrentTerminal();
                }
                $tokenField = ", `access_token_".$_platform."` = '" . urldecode($access_token) . "', `refresh_token_".$_platform."` = '" . urldecode($refresh_token) . "'";
            }

            $archives = $this->SetQuery("UPDATE `#@__member` SET $where_ `logincount` = `logincount` + 1, `lastlogintime` = '$time', `lastloginip` = '$ip', `lastloginipaddr` = '$ipaddr', `online` = '$time' ".$tokenField.$_updateCityid." WHERE `id` = ".$userid);
            $results = $this->db->prepare($archives);
            $results->execute();

            $loginPlatform = '电脑端('.$code.')';
            if(isApp()){
                $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP('.$code.')';
            }elseif(isWxMiniprogram()){
                $loginPlatform = '微信小程序('.$code.')';
            }elseif(isByteMiniprogram()){
                $loginPlatform = '抖音小程序('.$code.')';
            }elseif(isMobile()){                
                if(isWeixin()){
                    $loginPlatform = '微信公众号('.$code.')';
                }else{
                    $loginPlatform = 'H5('.$code.')';
                }
            }
            
            //保存到主表
            $useragent = $_SERVER['HTTP_USER_AGENT'];
            $_ip = $ip.':'.getRemotePort();
            $archives = $this->SetQuery("INSERT INTO `#@__member_login` (`userid`, `logintime`, `loginip`, `ipaddr`, `platform`, `useragent`) VALUES ('$userid', '$time', '$_ip', '$ipaddr', '$loginPlatform', '$useragent')");
            $results = $this->db->prepare($archives);
            $results->execute();

            //记录用户行为日志
            memberLog($userid, 'member', '', 0, 'insert', '用户登录('.$loginPlatform.')', '', $archives);

            //论坛同步
            global $cfg_bbsState;
            global $cfg_bbsType;
            if($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()){
                $data['username'] = $username;
                $data['uPwd']     = $password;
                $this->bbsSync($data, "synlogin");
            }

            if(!$noRedir || $state){
                if($notclose){
                    die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$_loginRedirect.'";</script>');
                }else{
                    if(isMobile()){

                        $userinfoArr = array();
                        $userinfo = $this->getMemberInfo($userid);
                        
                        if(is_array($userinfo)){
                            $userinfo['access_token'] = $access_token;
                            $userinfo['refresh_token'] = $refresh_token;
                            $userinfo['url'] = $loginRedirect;
                        }

                        //原生登录需要输出json
                        if($platform == 'app'){
                            if(!is_array($userinfo)){
                                die(json_encode(array(
                                    'state' => '200',
                                    'info' => '账号状态异常，登录失败！'
                                )));
                            }else{
                                die(json_encode(array(
                                    'state' => '100',
                                    'passport' => $userid,
                                    'username' => $userinfo['username'],
                                    'nickname' => $userinfo['nickname'],
                                    'userid_encode' => $userinfo['userid_encode'],
                                    'cookiePre' => $userinfo['cookiePre'],
                                    'photo' => $userinfo['photo'],
                                    'dating_uid' => $userinfo['dating_uid'],
                                    'access_token' => $access_token,
                                    'refresh_token' => $refresh_token
                                )));
                            }

                        //H5和APP混合需要由脚本来做跳转
                        }elseif(isApp()){
                            unset($userinfo['description']);
                            foreach ($userinfo as $key => $value) {
                                array_push($userinfoArr, '"'.$key.'": "'.$value.'"');
                            }
                            $userinfoStr = '<script>var userinfo = {'.join(', ', $userinfoArr).'}</script>';
                            echo '<span style="display:none;">'.$userinfoStr.'100|</span>';
                            die;

                        }else{
                            $loginRedirect = htmlspecialchars_decode($loginRedirect);                            

                            //微信小程序端需要单独处理
                            if(isWxMiniprogram()){

                                $sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = $userid");
                                $ret = $dsql->dsqlOper($sql, "results");
                                $data = array(
                                    0 => $ret[0]['wechat_conn'],
                                    1 => $ret[0]['wechat_mini_openid'],
                                    2 => $ret[0]['wechat_mini_session'],
                                    3 => $ret[0]['phone'],
                                );
                
                                //返回unionid、openid、session_key的加密信息，以供系统登录
                                $RenrenCrypt = new RenrenCrypt();
                                $key = base64_encode($RenrenCrypt->php_encrypt(join("@@@@", $data)));

                                $path = strstr($loginRedirect, '/pages/') ? $loginRedirect : '';
                                $redirect = strstr($loginRedirect, '/pages/') ? '' : urlencode(preg_replace("/forcelogout/", 'loginsuccess', $loginRedirect));
                
                                $_url = urlencode($cfg_basehost . '/?action=wxMiniProgramLogin&key=' . $key . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&uid=' . $userid . '&path=' . $path . '&redirect=' . $redirect);

                                header("Location: /include/json.php?action=wxMiniProgramLogin&uid=$userid&access_token=$access_token&refresh_token=$refresh_token&url=$_url&path=".$path);
                                die;
                            }
                            else{
                                die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$loginRedirect.'";</script>');
                            }
                        }

                    }else{
                        die('<meta charset="UTF-8"><script type="text/javascript">window.close();top.location="'.$loginRedirect.'";</script>');
                    }
                }
            }
            // echo '<script type="text/javascript">setTimeout(function(){window.close();}, 500);</script>授权成功！';

            //如果不存在则新建用户
        }else{

            // $pwd = $this->_getSaltedHash($password);
            $pwd = '';
            $sex = $gender == "男" ? 1 : 0;

            //头像   直接使用远程地址，不需要下载到本地  by gz 20190823
            $photo = str_replace('http://', 'https://', $photo);
            // if(!empty($photo)){
            //
            //     require_once(HUONIAOINC."/config/siteConfig.inc.php");
            //
            //     global $cfg_attachment;
            //     global $cfg_uploadDir;
            //     global $cfg_photoSize;
            //     global $cfg_atlasType;
            //     global $editor_uploadDir;
            //     global $cfg_ftpType;
            //     global $editor_ftpType;
            //     global $cfg_ftpState;
            //     global $editor_ftpState;
            //     global $cfg_ftpDir;
            //     global $editor_ftpDir;
            //
            //     global $cfg_photoSmallWidth;
            //     global $cfg_photoSmallHeight;
            //     global $cfg_photoMiddleWidth;
            //     global $cfg_photoMiddleHeight;
            //     global $cfg_photoLargeWidth;
            //     global $cfg_photoLargeHeight;
            //     global $cfg_photoCutType;
            //     global $cfg_photoCutPostion;
            //     global $cfg_quality;
            //
            //     $editor_uploadDir = $cfg_uploadDir;
            //     $editor_ftpType = $cfg_ftpType;
            //     $editor_ftpState = $cfg_ftpState;
            //     $editor_ftpDir = $cfg_ftpDir;
            //
            //     /* 上传配置 */
            //     $config = array(
            //         "savePath" => ($noRedir ? "../" : "")."..".$cfg_uploadDir."/siteConfig/photo/large/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
            //         "maxSize" => $cfg_photoSize,
            //         "allowFiles" => explode("|", $cfg_atlasType)
            //     );
            //
            //     $photoList = array();
            //     array_push($photoList, $photo);
            //
            //     $pic = "";
            //     $photoArr = getRemoteImage($photoList, $config, "siteConfig", ($noRedir ? "../" : "")."..", true);
            //     if($photoArr){
            //         $photoArr = json_decode($photoArr, true);
            //         if(is_array($photoArr) && $photoArr['state'] == "SUCCESS"){
            //             $pic = $photoArr['list'][0]['fid'];
            //         }
            //     }
            // }

            //记录当前设备s
            if(!empty($deviceTitle) && !empty($deviceSerial) && !empty($deviceType)){
                $sourceclient[] = $sourceArr;
                $sourceclient   = serialize($sourceclient);
            }
            //记录当前设备e

            //APP端和小程序端需要创建令牌
            $tokenFieldKey = $tokenFieldVal = $access_token = $refresh_token = "";

            //保存到主表
            global $dsql;
			$wechat_subscribe = (int)$wechat_subscribe; //是否关注微信公众号
            $regfrom = getCurrentTerminal();

            //如果有传入app的openid，则保存起来
            $wechat_app_openid = '';
            if (isset($params['app_openid']) && $params['app_openid'] != null) {
                $wechat_app_openid = $params['app_openid'];
            }

            if($code == "wechat"){
                $state_ = $cfg_wechatBindPhone ? 0 : 1;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `emailCheck`, `phoneCheck`, `sex`, `photo`, `regtime`, `logincount`, `lastlogintime`, `lastloginip`, `lastloginipaddr`, `regip`, `regipaddr`, `state`, `regfrom`, `".$code."_conn`, `wechat_openid`, `purviews`, `sourceclient`, `wechat_subscribe`".$tokenFieldKey.", `wechat_app_openid`) VALUES (1, '$username', '$pwd', '$nickname', '0', '0', '$sex', '$photo', '$time', '1', '$time', '$ip', '$ipaddr', '$ip', '$ipaddr', '$state_', '$regfrom', '$key', '$openid', '', '$sourceclient', '$wechat_subscribe'".$tokenFieldVal.", '$wechat_app_openid')");
            }else{
                $state_ = $cfg_bindMobile ? 0 : 1;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `emailCheck`, `phoneCheck`, `sex`, `photo`, `regtime`, `logincount`, `lastlogintime`, `lastloginip`, `lastloginipaddr`, `regip`, `regipaddr`, `state`, `regfrom`, `".$code."_conn`, `purviews`, `sourceclient`, `wechat_subscribe`".$tokenFieldKey.", `wechat_app_openid`) VALUES (1, '$username', '$pwd', '$nickname', '0', '0', '$sex', '$photo', '$time', '1', '$time', '$ip', '$ipaddr', '$ip', '$ipaddr', '$state_', '$regfrom', '$key', '', '$sourceclient', '$wechat_subscribe'".$tokenFieldVal.", '$wechat_app_openid')");
            }
            $aid = $dsql->dsqlOper($archives, "lastid");

            if(is_numeric($aid)){

                //如果是微信扫码登录，需要更新临时登录日志
                if($state){
                    $archives = $this->SetQuery("UPDATE `#@__site_wxlogin` SET `uid` = '$aid' WHERE `state` = '$state'");
                    $results = $this->db->prepare($archives);
                    $results->execute();
                }
                //如果关注了微信公众号则更新字段
                if($code == "wechat"){
                    $openidsql = $this->SetQuery("SELECT `wxkey` FROM `#@__site_wxid` WHERE `wxkey` = '$key' ");
                    $openidres = $this->db->prepare($openidsql);
                    $openidres->execute();
                    $openidres = $openidres->fetchAll(PDO::FETCH_ASSOC);
                    $openKey = $openidres[0]['wxkey'];
                    if (!empty($openKey)){
                        $archives = $this->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = '1' ".$_updateCityid." WHERE `wechat_conn` = '$openKey'");
                        $results = $this->db->prepare($archives);
                        $results->execute();
                    }else{

                        //如果不是通过关注注册的
                        //已经关注过，但是网站没有注册的，一般用于老的公众号已经有用户，但是网站是新对接的，所以网站里没有这些会员数据
                        //这种情况，查询site_wechat_member表(从公众号同步过来的openid和关注情况)
                        $openidsql = $this->SetQuery("SELECT `subscribe` FROM `#@__site_wechat_member` WHERE `openid` = '$openid' ");
                        $openidres = $this->db->prepare($openidsql);
                        $openidres->execute();
                        $openidres = $openidres->fetchAll(PDO::FETCH_ASSOC);
                        $openKey = $openidres[0]['subscribe'];
                        if (!empty($openKey)){
                            $archives = $this->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = '1' ".$_updateCityid." WHERE `wechat_openid` = '$openid'");
                            $results = $this->db->prepare($archives);
                            $results->execute();
                        }

                    }

                }

                
                //APP端和小程序端需要创建令牌
                $tokenField = $access_token = $refresh_token = "";
                $createApiTokenByPlatform = createApiTokenByPlatform($aid);
                $access_token = $createApiTokenByPlatform['access_token'];
                $refresh_token = $createApiTokenByPlatform['refresh_token'];
                if($access_token && $refresh_token){
                    $_platform = '';
                    if(isApp() || isWxMiniprogram() || isByteMiniprogram()){
                        $_platform = getCurrentTerminal();
                    }
                    $tokenField = "`access_token_".$_platform."` = '" . urldecode($access_token) . "', `refresh_token_".$_platform."` = '" . urldecode($refresh_token) . "'";

                    $archives = $this->SetQuery("UPDATE `#@__member` SET ".$tokenField.$_updateCityid." WHERE `id` = ".$aid);
                    $results = $this->db->prepare($archives);
                    $results->execute();
                }


                $loginPlatform = '电脑端('.$code.')';
                if(isApp()){
                    $loginPlatform = (isAndroidApp() ? '安卓' : (isIOSApp() ? '苹果' : (isHarmonyApp() ? '鸿蒙' : '未知'))) . 'APP('.$code.')';
                }elseif(isWxMiniprogram()){
                    $loginPlatform = '微信小程序('.$code.')';
                }elseif(isByteMiniprogram()){
                    $loginPlatform = '抖音小程序('.$code.')';
                }elseif(isMobile()){
                    if(isWeixin()){
                        $loginPlatform = '微信公众号('.$code.')';
                    }else{
                        $loginPlatform = 'H5('.$code.')';
                    }
                }

                //保存到主表
                $useragent = $_SERVER['HTTP_USER_AGENT'];
                $_ip = $ip.':'.getRemotePort();
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_login` (`userid`, `logintime`, `loginip`, `ipaddr`, `platform`, `useragent`) VALUES ('$aid', '$time', '$_ip', '$ipaddr', '$loginPlatform', '$useragent')");
                $results = $dsql->dsqlOper($archives, 'update');

                //记录用户行为日志
                memberLog($aid, 'member', '', 0, 'insert', '用户登录('.$loginPlatform.')', '', $archives);


                global $cfg_cookiePath;
                $RenrenCrypt = new RenrenCrypt();
                $userid = base64_encode($RenrenCrypt->php_encrypt($aid));

                // if(isMobile() && !$noRedir && $cfg_wechatBindPhone){
                if(isMobile() && $cfg_bindMobile && !$noRedir && ($code != "wechat" || ($code == "wechat" && $cfg_wechatBindPhone))){
                    PutCookie("connect_uid", $userid, 300, $cfg_cookiePath);
                    PutCookie("connect_code", $code, 300, $cfg_cookiePath);

                    //原生登录需要输出json
                    if($platform == 'app'){
                        die(json_encode(array(
                            'state' => '101',
                            'info' => 'bindMobile',
                            'url' => $cfg_basehost . '/bindMobile.html?type=' . $code . '&connect_uid=' . $userid . '&connect_code=' . $code
                        )));

                    //H5和APP混合需要由脚本来做跳转
                    }elseif(isApp()){
                        die('bindMobile');
                    }else {
                        echo '跳转中...';
                        header("location:/bindMobile.html?from=2&type=" . $code . '&connect_uid=' . $userid);
                    }
                    die;
                }

                //如果是微信，并且微信注册必须绑定手机
                if(($code == "wechat" && $cfg_wechatBindPhone) || ($code != "wechat" && $cfg_bindMobile)){
                    PutCookie("connect_uid", $userid, 300, $cfg_cookiePath);
                    PutCookie("connect_code", $code, 300, $cfg_cookiePath);

                    if(isMobile()){

                        //原生登录需要输出json
                        if($platform == 'app'){
                            die(json_encode(array(
                                'state' => '101',
                                'info' => 'bindMobile',
                                'url' => $cfg_basehost . '/bindMobile.html?type=' . $code . '&connect_uid=' . $userid . '&connect_code=' . $code
                            )));

                        //H5和APP混合需要由脚本来做跳转
                        }elseif(isApp()){
                            die('bindMobile');
                        }else {
                            echo '跳转中...';
                            header("location:/bindMobile.html?from=3&type=" . $code . '&connect_uid=' . $userid);
                        }
                    }
                    return;
                }

                //如果开启了必须绑定手机，在绑定手机页面需要调用注册送积分等操作
                $this->registGiving($aid);

                // return;

                //论坛同步
                global $cfg_bbsState;
                global $cfg_bbsType;
                if($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()){
                    $data['username'] = $username;
                    $data['password'] = $password;
                    $data['email']    = $chcode."@qq.com";
                    $this->bbsSync($data, "register");
                }

                //站点登录
                $this->keepUserID = $this->keepMemberID;
                $this->userID = $aid;
                $this->userPASSWORD = $pwd;
                $this->keepUser();

                //绑定上下级
                $this->bindSuperior($userid,$fromShare);

                //论坛登录
                if($cfg_bbsState == 1 && $cfg_bbsType != "" && !isMobile()){
                    $data['username'] = $username;
                    $data['uPwd']     = $password;
                    $this->bbsSync($data, "synlogin");
                }

                if(!$noRedir || $state){

                    //原生登录需要输出json
                    if($platform == 'app'){
                        $userinfo = $this->getMemberInfo($aid);

                        if(is_array($userinfo)){
                            $userinfo['access_token'] = $access_token;
                            $userinfo['refresh_token'] = $refresh_token;
                        }

                        if(!is_array($userinfo)){
                            die(json_encode(array(
                                'state' => '200',
                                'info' => '账号状态异常，登录失败！'
                            )));
                        }else{
                            die(json_encode(array(
                                'state' => '100',
                                'passport' => $aid,
                                'username' => $userinfo['username'],
                                'nickname' => $userinfo['nickname'],
                                'userid_encode' => $userinfo['userid_encode'],
                                'cookiePre' => $userinfo['cookiePre'],
                                'photo' => $userinfo['photo'],
                                'dating_uid' => $userinfo['dating_uid'],
                                'access_token' => $access_token,
                                'refresh_token' => $refresh_token
                            )));
                        }

                    }else{

                        //微信小程序端需要单独处理
                        if(isWxMiniprogram()){

                            $sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = $userid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            $data = array(
                                0 => $ret[0]['wechat_conn'],
                                1 => $ret[0]['wechat_mini_openid'],
                                2 => $ret[0]['wechat_mini_session'],
                                3 => $ret[0]['phone'],
                            );
            
                            //返回unionid、openid、session_key的加密信息，以供系统登录
                            $RenrenCrypt = new RenrenCrypt();
                            $key = base64_encode($RenrenCrypt->php_encrypt(join("@@@@", $data)));

                            $path = strstr($loginRedirect, '/pages/') ? $loginRedirect : '';
                            $redirect = strstr($loginRedirect, '/pages/') ? '' : urlencode(preg_replace("/forcelogout/", 'loginsuccess', $loginRedirect));
            
                            $_url = urlencode($cfg_basehost . '/?action=wxMiniProgramLogin&key=' . $key . '&access_token=' . $access_token . '&refresh_token=' . $refresh_token . '&uid=' . $userid . '&path=' . $path . '&redirect=' . $redirect);

                            header("Location: /include/json.php?action=wxMiniProgramLogin&uid=$userid&access_token=$access_token&refresh_token=$refresh_token&url=$_url&path=".$path);
                            die;
                        }
                        else{
                            if($notclose){
                                die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$loginRedirect.'";</script>');
                            }else{
                                if(isMobile()){
                                    die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$loginRedirect.'";</script>');
                                }else{
                                    die('<meta charset="UTF-8"><script type="text/javascript">window.close();top.location="'.$loginRedirect.'";</script>');
                                }
                                // echo '<script type="text/javascript">setTimeout(function(){window.close();}, 500);</script>授权成功！';
                            }
                        }
                    }
                }

            }else{

                //原生登录需要输出json
                if($platform == 'app'){
                    die(json_encode(array(
                        'state' => '200',
                        'info' => '系统错误，登录失败！'
                    )));

                }else{
                    if(!$noRedir || $state){
                        if($notclose){
                            die('<meta charset="UTF-8"><script type="text/javascript">top.location="'.$loginRedirect.'";</script>');
                        }else{
                            if(isMobile()){
                                die('<meta charset="UTF-8"><script type="text/javascript">setTimeout(function(){top.location="'.$loginRedirect.'";}, 5000);</script>登录失败！');
                            }else{
                                die('<meta charset="UTF-8"><script type="text/javascript">setTimeout(function(){window.close();top.location="'.$loginRedirect.'";}, 5000);</script>登录失败！');
                            }
                            // die("登录失败！");
                        }
                    }
                }
            }

        }

    }


    /**
     *  保持用户的会话状态
     *
     * @access    public
     * @return    int    成功返回 1 ，失败返回 -1
     */
    function keepUser(){
        global $dsql;
        $time = GetMkTime(time());
        if($this->userID != '' && $this->checkUserNull($this->userID)){
            global $cfg_cookiePath;
            global $cfg_onlinetime;
            $data = $this->userID.'&'.$this->userPASSWORD;
            $RenrenCrypt = new RenrenCrypt();
            $userid = base64_encode($RenrenCrypt->php_encrypt($data));
            PutCookie($this->keepUserID, $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);
            if($this->keepUserID != 'admin_auth'){
                PutCookie('userid', $this->userID, $cfg_onlinetime * 60 * 60);
            }

            //距离上次更新超过60秒，再更新在线时间
            $_expireTime = $time - 60;
            $archives = $dsql->SetQuery("SELECT `online` FROM `#@__member` WHERE `id` = ".$this->userID);
            $_online = (int)$dsql->getOne($archives);
            
            if($_online < $_expireTime){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `online` = $time WHERE `id` = ".$this->userID);
                $dsql->dsqlOper($archives, "update");
            }

            $this->keepUserID = "admin_auth";


            return 1;
        }else{
            if(GetCookie($this->keepUserID) != '' && $this->checkUserNull(GetCookie($this->keepUserID))){
                global $cfg_cookiePath;
                global $cfg_onlinetime;

                $RenrenCrypt = new RenrenCrypt();
                $userid = $RenrenCrypt->php_decrypt(base64_decode(GetCookie($this->keepUserID)));
                $userinfo = explode('&', $userid);
                if(count($userinfo) != 2){
                    $this->exitUser();
                    $this->keepUserID = "admin_auth";
                    return -1;
                }
                $userid = $userinfo[0];

                //距离上次更新超过60秒，再更新在线时间
                $_expireTime = $time - 60;
                $archives = $dsql->SetQuery("SELECT `online` FROM `#@__member` WHERE `id` = ".$userid);
                $_online = (int)$dsql->getOne($archives);
                
                if($_online < $_expireTime){
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `online` = $time WHERE `id` = ".$userid);
                    $dsql->dsqlOper($archives, "update");
                }

                global $HN_memory;
                $HN_memory->rm('member_' . $userid);

                PutCookie($this->keepUserID, GetCookie($this->keepUserID), $cfg_onlinetime * 60 * 60, $cfg_cookiePath);
                if($this->keepUserID != 'admin_auth'){
                    PutCookie('userid', $this->userID, $cfg_onlinetime * 60 * 60);
                }

                $this->keepUserID = "admin_auth";
                return 1;
            }else{
                $this->keepUserID = "admin_auth";
                return -1;
            }
        }
    }

    /**
     *  结束用户的会话状态
     *
     * @access    public
     * @return    void
     */
    function exitUser(){
        putSession($this->keepUserID);
        DropCookie($this->keepUserID);
        DropCookie("userid");
        DropCookie("admin_userType");
        //$_SESSION = array();
    }

    /**
     *  结束用户的会话状态
     *
     * @access    public
     * @return    void
     */
    function exitMember(){
        putSession($this->keepMemberID);

        $RenrenCrypt = new RenrenCrypt();
        $userid = $RenrenCrypt->php_decrypt(base64_decode(GetCookie($this->keepMemberID)));
        $userinfo = explode('&', $userid);
        $userid = (int)$userinfo[0];

        // if($userid == 17283){
        //     include_once(HUONIAOROOT."/api/payment/log.php");
        //
        //     //初始化日志
        //     $logHandler= new CLogFileHandler(HUONIAOROOT . '/api/logout.log');
        //     $log = Log::Init($logHandler, 15);
        //     Log::DEBUG('退出：' . $userid);
        // }

        if($userid){
            $archives = $this->SetQuery("UPDATE `#@__member` SET `online` = 0 WHERE `id` = ".$userid);
            // if($userid == 17283){
            //     Log::DEBUG($archives);
            // }
            $results = $this->db->prepare($archives);
            $results->execute();

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

            //记录用户行为日志
            // memberLog($userid, 'member', '', 0, 'update', '用户退出登录('.$loginPlatform.')', '', $archives);
        }

        DropCookie($this->keepMemberID);

        global $HN_memory;
        $HN_memory->rm('member_' . $userid);

        global $cfg_bbsState;
        global $cfg_bbsType;
        if($cfg_bbsState == 1 && $cfg_bbsType != ""){
            $this->bbsSync($this->keepMemberID, "logout");
        }
        //$_SESSION = array();
    }

    /**
     *  获得用户的ID
     *
     * @access    public
     * @return    int
     */
    function getUserID(){
        if($this->userID != ''){
            return $this->userID;
        }else{
            if(GetCookie($this->keepUserID) != ''){
                $RenrenCrypt = new RenrenCrypt();
                $userid = $RenrenCrypt->php_decrypt(base64_decode(GetCookie($this->keepUserID)));
                $userinfo = explode('&', $userid);
                if(count($userinfo) != 2){
                    $this->exitUser();
                    return -1;
                }
                $userid = $userinfo[0];
                $password = $userinfo[1];
                $sql = $this->SetQuery("SELECT `id`, `expired` FROM `#@__member` WHERE `id` = ".$userid." AND `password` = '$password' AND `state` = 0");
                $res = $this->db->prepare($sql);
                $res->execute();
                $res = $res->fetchAll(PDO::FETCH_ASSOC);
                if(!$res[0]){
                    $this->exitUser();
                    return -1;
                }

                //判断账号是否已经过期
                $_now = GetMkTime(time());
                $_expired = (int)$res[0]['expired'];
                if($_expired && $_now > $_expired){
                    return -1;
                }

                return $userid;
            }else{
                return -1;
            }
        }
    }

    /**
     *  获得用户的类型
     *
     * @access    public
     * @return    int
     */
    function getUserType(){
        global $dsql;
        $userid = $this->getUserID();
        if(is_numeric($userid)){
            $sql = $dsql->SetQuery("SELECT `mtype` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                return $ret[0]['mtype'];
            }
        }
    }

    /**
     *  获得用户的ID
     *
     * @access    public
     * @return    int
     */
    function getMemberID(){

        //如果是客户端签名方式获取接口，并且传了用户ID，这里直接返回传过来的用户ID
        global $platform_userid;
        if($platform_userid){
            return $platform_userid;
        }

        // global $_G;
        // $md5GetMemberIDKey = base64_encode("getMemberID");

        // if(isset($_G[$md5GetMemberIDKey])){
        //     return $_G[$md5GetMemberIDKey];
        // }

        // 小程序使用userkey确定id
        if(isset($_REQUEST['userkey']) && $_REQUEST['userkey']){
            $userkey = $_REQUEST['userkey'];
            $RenrenCrypt = new RenrenCrypt();
            $userinfo = $RenrenCrypt->php_decrypt(base64_decode($userkey));
            $userinfo = explode('@@@@', $userinfo);
            if(count($userinfo) == 2){
                $openid  = $userinfo[0];
                $session = $userinfo[1];
                $sql = $this->SetQuery("SELECT `id`, `wechat_mini_session` FROM `#@__member` WHERE `wechat_mini_openid` = '$openid' AND `state` = 1");
                $res = $this->db->prepare($sql);
                $res->execute();
                $res = $res->fetchAll(PDO::FETCH_ASSOC);
                if($res){
                    $now = GetMktime(time());
                    $session_ = $res[0]['wechat_mini_session'];
                    if($session_){
                        $session_arr = explode("#", $session_);
                        $session_val = $session_arr[0];
                        $session_time = $session_arr[1];

                        global $cfg_onlinetime;
                        if($session_val == $session && $session_time + $cfg_onlinetime * 3600 > $now){
                            return $res[0]['id'];
                        }
                    }
                    // $_G[$md5GetMemberIDKey] = -1;
                    return -1;
                }
            }
        }
        if($this->userID != '' && $this->checkUserNull($this->userID)){
            // $_G[$md5GetMemberIDKey] = $this->userID;
            return $this->userID;
        }else{
            if(GetCookie($this->keepMemberID) != '' && $this->checkUserNull(GetCookie($this->keepMemberID))){
                $RenrenCrypt = new RenrenCrypt();
                $userid = $RenrenCrypt->php_decrypt(base64_decode(GetCookie($this->keepMemberID)));
                $userinfo = explode('&', $userid);
                if(count($userinfo) != 2){
                    $this->exitUser();
                    // $_G[$md5GetMemberIDKey] = -1;
                    return -1;
                }
                $userid = (int)$userinfo[0];
                $password = substr($userinfo[1], 0, 47);
                if(!is_numeric($userid)){
                    $this->exitUser();
                    // $_G[$md5GetMemberIDKey] = -1;
                    return -1;
                }
                $sql = $this->SetQuery("SELECT `id`, `online` FROM `#@__member` WHERE `id` = ".$userid." AND `password` = '$password' AND `state` = 1");
                $res = $this->db->prepare($sql);
                $res->execute();
                $res = $res->fetchAll(PDO::FETCH_ASSOC);
                if(!$res[0]){
                    $this->exitMember();
                    // $_G[$md5GetMemberIDKey] = -1;
                    return -1;
                    // 已退出但cookie还存在:独立域名情况下会有这种情况
                }elseif($res[0]['online'] == 0){

                    //APP端偶尔会出现登录后，登录不成功的情况，此处先做注释，遇到此问题时再做处理。
                    //$this->exitMember();
                    //return -2;

                    // DropCookie($this->keepMemberID);
                    // die('<meta charset="UTF-8"><script type="text/javascript">location.reload();</script>');
                    // die;
                }

                // $_G[$md5GetMemberIDKey] = $userid;
                return $userid;
            }else{
                putSession($this->keepMemberID);
                //$this->exitMember();
                // $_G[$md5GetMemberIDKey] = -1;
                return -1;
            }
        }
    }

    /**
     *  获得用户的权限值
     *
     * @access    public
     * @return    int
     */
    function getPurview(){
        global $dsql;
        $mtype = $this->getUserType();
        if($this->userPurview != ''){
            return $this->userPurview;
        }else{
            $userid = $this->getUserID();
            if(is_numeric($userid)){
                $purview = "";

                //系统管理员
                if($mtype == 0){
                    $sql = $dsql->SetQuery("SELECT member.*,admin.purviews FROM `#@__member` member LEFT JOIN `#@__admingroup` admin ON admin.id = member.mgroupid WHERE member.id = '".$userid."' AND member.mgroupid != '' LIMIT 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $purview = $ret[0]['purviews'];
                    }

                    //城市管理员
                }elseif($mtype == 3){
                    $sql = $dsql->SetQuery("SELECT `mtype`, `purviews` FROM `#@__member` WHERE `id` = $userid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $mtype = $ret[0]['mtype'];
                        if($mtype == 3){
                            // $purview = $this->getAdminPermissions();
                            // $purview = join(",", $purview);
                            $purview = $ret[0]['purviews'];
                        }
                    }
                }
                return $purview;
            }else{
                $this->exitUser();
                header("location:".HUONIAOADMIN."/login.php");
                die;
            }
        }
    }

    /**
     * 为给定的字符串生成一个加“盐”的散列值
     *
     * @param string $string 即将被散列的字符串
     * @param string $salt 从这个串中提取“盐”
     * @return string 加“盐”之后的散列值
     */
    function _getSaltedHash($string, $salt=NULL){

        //如果没有传入“盐”，则生成一个“盐”
        if($salt == NULL){
            $salt = substr(md5(time()), 0, $this->_saltLength);

            //如果传入了salt，则从中提取真正的"盐"
        }else{
            $salt = substr($salt, 0, $this->_saltLength);
        }
        //将“盐”添加到散列之前并返回散列值
        return $salt.sha1($salt.$string);

    }


    /**
     * 判断会员是否已经登录，如果没有登录，则根据会员类型跳转到不同的登录页面
     *
     */
    function checkUserIsLogin($returnRet = ""){

        global $dirDomain;     //当前页面
        global $cfg_secureAccess;
        global $cfg_secureAccess;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $template;

        $param = array("service"  => "member");
        $busiDomain = getUrlPath($param);     //商家会员域名

        $basehost = $cfg_secureAccess.$cfg_basehost;  //网站首页域名

        $ischeck = explode($busiDomain, $dirDomain);

        $uid = $this->getMemberID();
        $url = "";
        $changeUser = 0;

        $param = array("service" => "member",	"type" => "user");
        $userDomain = getUrlPath($param);     //个人会员域名

        //如果没有登录，根据访问地址进入不同的登录页面
        if($uid == -1){

            // $url = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
            $url = $basehost."/login.html?furl=".urlencode($dirDomain);
            // if(count($ischeck) > 1){
            // 	$basehost = $busiDomain;

            // 	//如果访问的是企业会员中心的域名，如果是独立域名
            // 	if($cfg_basehost != $_SERVER['HTTP_HOST']){
            // 		$url = $cfg_secureAccess.$cfg_basehost."/index.php?service=member&template=login&furl=".urlencode($dirDomain);
            // 		header("location:".$cfg_secureAccess.$cfg_basehost."/index.php?service=member&template=login&furl=".urlencode($dirDomain));
            // 		die;
            // 	}
            // }else{
            // 	$url = $basehost."/login.html?furl=".urlencode($dirDomain);
            // }
            // header("location:".$basehost."/login.html?furl=".urlencode($dirDomain));
            // die;

            //如果已退出
        }elseif($uid == -2){
            $changeUser = 1;
            $url = $basehost."/login.html?furl=".urlencode($dirDomain);
            //如果已经登录，判断用户类型是否符合进入当前页面
        }else{

            $webrul = str_replace($basehost.'/','',$dirDomain);

            $webrularr = explode('/',$webrul);
            $userinfo = $this->getMemberInfo();  //当前登录会员信息
            //个人会员不得进入商家会员中心，如果在商家会员的页面，则自动跳转至开通页面
            if($userinfo['userType'] == 1){

                $currentmodule = '';
                if(isset($webrularr[1]) && $webrularr[1] !=''){
                    $currentmodule = str_replace('.html','',$webrularr[1]);

                    $currentmodule = str_replace('-','',$currentmodule);
                }
                $ischeck = explode($userDomain, $dirDomain);


                $staffauth = $userinfo['autharr'];

                //绑定邮箱、保障金、提现、缴纳、员工平台等不受身份限制
                if(count($ischeck) <= 1 && $template != "bindemail" && $template != "promotion" && $template != "extract" && $template != "payment" && $template != "history" && $userinfo['is_staff'] ==0 && !in_array($currentmodule,$staffauth)){

                    $param = array("service" => "member", "type" => "user");

                    // 判断是否已经成功提交了入驻申请
                    $archives = $this->SetQuery("SELECT * FROM `#@__business_list` WHERE `uid` = '$uid' AND `state` != 4");
                    $results = $this->db->prepare($archives);
                    $results->execute();
                    $results = $results->fetchAll(PDO::FETCH_ASSOC);
                    if($results){
                        // PutCookie("notice_enter_in_wait_audit", 1, 20);
                        // $param = array("service" => "member", "type" => "user", "template" => "business-config");
                        // $url = getUrlPath($param);
                        // header("location:".$url);
                        // die;
                        // die('<meta charset="UTF-8"><script type="text/javascript">alert("您的入驻申请已提交，请耐心等待审核");top.location="'.$url.'";</script>');
                        $url = getUrlPath($param);
                        if($returnRet){
                            $data = array(
                                "uid" => $uid,
                                "url" => $url,
                                "changeUser" => $changeUser
                            );
                            return $data;
                        }
                        return;
                    }else{
                        $param['template'] = 'enter';
                    }

                    $business = getUrlPath($param);
                    $url = $business;
                    if($param['template'] == 'enter') $url .= "#join";
                    // header("location:".$business);
                    // die;
                }

                //商家会员不得进入个人中心页面，否则自动跳转商家会员首页
            }elseif($userinfo['userType'] == 2){
                $ischeck = explode($busiDomain, $dirDomain);
                if(count($ischeck) <= 1){
                    //header("location:".$busiDomain);
                    //die;
                }

                //其它情况，跳转到网站个人登录页面
            }else{
                $url = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
                $url = $basehost."/login.html?furl=".$url;
                header("location:".$basehost."/login.html?furl=".$url);
                die;
            }

        }
        if($returnRet){
            $data = array(
                "uid" => $uid,
                "url" => $url,
                "changeUser" => $changeUser
            );
            return $data;
        }elseif($url){
            header("location:".$url);
            die;
        }

    }


    /**
     * 论坛同步操作
     * @param array $data     要操作的会员数据
     * @param string $action  动作
     * @return null
     */
    function bbsSync($data, $action){
        global $cfg_bbsState;
        global $cfg_bbsType;
        if($cfg_bbsState == 1 && $cfg_bbsType != "" && $data && !isMobile()){

            //discuz
            //if($cfg_bbsType == "discuz"){
            include_once(HUONIAOROOT."/api/bbs/".$cfg_bbsType."/config.inc.php");
            include_once(HUONIAOROOT."/api/bbs/discuz/uc_client/client.php");

            //判断登录
            if($action == "login"){
                $username = $data['username'];
                $password = $data['uPwd'];
                list($uid, $uname, $pword, $email_) = uc_user_login($username, $password);
                return $uid;

                //同步登录
            }elseif($action == "synlogin"){
                $username = $data['username'];
                $password = $data['uPwd'];
                list($uid, $uname, $pword, $email_) = uc_user_login($username, $password);
                if($uid > 0) {
                    $ucsynlogin = uc_user_synlogin($uid);
                    echo $ucsynlogin;
                }

                //同步退出
            }elseif($action == "logout"){
                $ucsynlogout = uc_user_synlogout();
                echo $ucsynlogout;

                //同步注册
            }elseif($action == "register"){
                $username = $data['username'];
                $password = $data['password'];
                $email    = $data['email'];
                $nickname = $data['nickname'];
                $phone    = $data['phone'];
                $qq       = $data['qq'];
                $sex      = $data['sex'];
                $birthday = $data['birthday'];
                $uid = uc_user_register($username, $password, $email, $nickname, $phone, $qq, $sex, $birthday);
                if($uid <= 0) {
                    if($uid == -1) {
                        return '用户名不合法';
                    } elseif($uid == -2) {
                        return '包含要允许注册的词语';
                    } elseif($uid == -3) {
                        return '用户名已经存在';
                    } elseif($uid == -4) {
                        return 'Email 格式有误';
                    } elseif($uid == -5) {
                        return 'Email 不允许注册';
                    } elseif($uid == -6) {
                        return '该 Email 已经被注册';
                    } else {
                        return '未定义';
                    }
                }else {
                    $username = $username;
                }
                if($username) {
                    return '同步成功';
                }

                //同步删除
            }elseif($action == "delete"){
                //根据用户名查询UCenter用户ID
                $info = uc_get_user($data);
                $ucsyndelete = uc_user_delete($info[0]);

                //同步修改
            }elseif($action == "edit"){
                $username = $data['username'];
                $newpw    = $data['newpw'];
                $email    = $data['email'];
                $ucresult = uc_user_edit($username, "", $newpw, $email, 1);

            }

            //phpwind
            //}elseif($cfg_bbsType == "phpwind"){

            //}

        }
    }


    /**
     * 注册送积分
     * @param array $userid   要操作的会员ID
     * @return null
     */
    function registGiving($userid, $givePoint = true,$isfanquan = true){
		global $dsql;
		global $cfg_pointName;
		global $userLogin;
        include HUONIAOINC."/config/pointsConfig.inc.php";

        $date = GetMkTime(time());

        /*给注册人的 首次注册*/
        if($isfanquan){
            if($cfg_pointRegGiving > 0 && $givePoint){
                $sql = $this->SetQuery("UPDATE `#@__member` SET `point` = `point` + $cfg_pointRegGiving WHERE `id` = $userid");
                $ret = $this->db->prepare($sql);
                $ret->execute();
                $ret->closeCursor();
                $user  = $userLogin->getMemberInfo($userid);

                //考虑到新注册用户状态为未审核，这里会获取不到用户余额
                if(is_array($user)){
                    $userpoint = (float)$user['point'];
                }else{
                    $userpoint = (float)$cfg_pointRegGiving;
                }
//                $pointuser = (int)($userpoint+$cfg_pointRegGiving);
                //保存操作日志
                $info = '注册获得'.$cfg_pointName;
                $sql = $this->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$cfg_pointRegGiving', '$info', '$date','zengsong','$userpoint')");
                $ret = $this->db->prepare($sql);
                $ret->execute();
                $ret->closeCursor();
            }
            //注册送优惠券
            if($cfg_regGivingQuan){
                $regGivingQuan = explode(',', $cfg_regGivingQuan);

                foreach ($regGivingQuan as $k => $v) {
                    $reg = explode("_",$v);
                    $modulename = $reg[0];              //模块  shop/外卖
                    $qid        = $reg[1];              //quan  优惠券id
//                    $qid = $v;  //优惠券id
                    $num = 1;  //发放一张
                    if ($modulename == 'waimai'){
                        // 验证优惠券
                        $checkSql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` WHERE `id` = $qid");
                        $checkRet = $dsql->dsqlOper($checkSql, "results");
                        if($checkRet){
                            $data = $checkRet[0];
                            foreach ($data as $key => $value) {
                                $$key = $value;
                            }
                            if($id == $usequan){
                                $num-=1;
                            }
                            $pubdate = GetMkTime(time());

                            // 过期时间根据充值时间设置
                            $deadline = strtotime("+ 1 month");


                            if($shoptype == 0){
                                $shopids = "";
                            }
                            if($is_relation_food == 0){
                                $fid = "";
                            }

                            $list = [];
                            for ($i = 0; $i < $num; $i++) {
                                $list[] = "('$id', '$userid', '$name', '$des', '$money', '$basic_price', '$deadline', '$shopids', '$fid', '$pubdate', '$bear', 0)";
                            }

                            $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_quanlist` (`qid`, `userid`, `name`, `des`, `money`, `basic_price`, `deadline`, `shopids`, `fid`, `pubdate`, `bear`,`formtype`) VALUES ".join(",", $list));
                            $aid = $dsql->dsqlOper($sql, "lastid");

                        }

                    }elseif ($modulename == 'shop'){
                        // 验证优惠券
                        $checkSql = $dsql->SetQuery("SELECT * FROM `#@__shop_quan` WHERE `id` = $qid");
                        $checkRet = $dsql->dsqlOper($checkSql, "results");
                        if($checkRet){
                            $data = $checkRet[0];
                            foreach ($data as $key => $value) {
                                $$key = $value;
                            }
                            if($id == $usequan){
                                $num-=1;
                            }
                            $pubdate = GetMkTime(time());
                            $ktime   = GetMkTime(time());

                            // 过期时间根据充值时间设置
                            $deadline = strtotime("+ 1 month");


                            if($shoptype == 0){
                                $shopids = "";
                            }
//                            if($is_relation_food == 0){
//                                $fid = "";
//                            }

                            $list = [];
                            for ($i = 0; $i < $num; $i++) {
                                $list[] = "('$id', '$userid', '$name', '$des', '$promotio', '$basic_price','$ktime','$deadline', '$shopids', '$fid', '$pubdate', '$bear', 0)";
                            }

                            $sql = $dsql->SetQuery("INSERT INTO `#@__shop_quanlist` (`qid`, `userid`, `name`, `des`, `promotio`, `basic_price`,`ktime`,`etime`, `shopids`, `fid`, `pubdate`, `bear`,`formtype`) VALUES ".join(",", $list));
                            $aid = $dsql->dsqlOper($sql, "lastid");

                        }
                    }

                }
            }

        }


        // 推荐注册送积分 给推荐人
        $fromShare_ = GetCookie('fromShare');
        $fromShare = $fromShare_ ? (int)$fromShare_ : 0;
        if($fromShare && $fromShare != $userid){
            $sql = $dsql->SetQuery("SELECT `id`, `cityid` FROM `#@__member` WHERE `id` = '$fromShare' AND `state` = 1");
            $results = $dsql->dsqlOper($sql, "results");

			$_cityid = $results[0]['cityid'];

			/*查询当前用户有无绑定邀请者*/
            $fromusersql = $dsql->SetQuery("SELECT `from_uid` FROM  `#@__member`  WHERE `id` = '$userid'");
            $fromresults = $dsql->dsqlOper($fromusersql, "results");

            $from_uid = (int)$fromresults[0]['from_uid'];
            if($givePoint && $from_uid ==0){
                $now = time();

				if($cfg_pointRegGivingRec){
	                $point = (int)$cfg_pointRegGivingRec;
	                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + $point WHERE `id` = $fromShare");
	                $ret = $dsql->dsqlOper($sql, "update");
				}

                //不管有没有设置推荐送现金，都记录推荐日志
				// if($cfg_moneyRegGivingRec){

					//身份权限
					$cfg_moneyRegGivingState = (int)$cfg_moneyRegGivingState;

					//查询推荐人是否为分销商
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` WHERE `uid` = $fromShare AND `state` = 1");
					$ret = $dsql->dsqlOper($sql, "totalCount");
					$isFxs = $ret && $ret > 0 ? true : false;

                    //默认为所有人推荐注册都送现金，如果勾选分销商，则表示只有分销商推荐新会员注册才会送现金！
					if(!$cfg_moneyRegGivingState || $isFxs){
		                $money = (float)$cfg_moneyRegGivingRec;

						// 旧模式直接加余额，新模式，插入新表，记录邀请记录，分销商身份还是直接到余额
						if($isFxs){
			                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $money WHERE `id` = $fromShare");
						}else{
			                $sql = $dsql->SetQuery("INSERT INTO `#@__member_invite` (`uid`, `fid`, `time`, `money`) VALUES ('$userid', '$fromShare', '$date', '$money')");
						}
		                $ret = $dsql->dsqlOper($sql, "update");

						//如果是分销商推荐，收入同步到分销商佣金明细
						if($isFxs && $money > 0){
							$product = serialize(array());
				            $archives = $dsql->SetQuery("INSERT INTO `#@__member_fenxiao` (`module`, `uid`, `byuid`, `child`, `ordernum`, `level`, `amount`, `pubdate`, `product`, `fee`) VALUES ('member', $fromShare, $userid, $userid, '推广奖励', '1', '$money', '$now', '$product', '100')");
				            $dsql->dsqlOper($archives, "update");
						}
					}
				// }

				$from = '';
				$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $fromShare");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$from = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
				}

				$to = '';
				$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$to = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
				}

				if($cfg_pointRegGivingRec){
                    $user  = $userLogin->getMemberInfo($fromShare);
                    $userpoint = $user['point'];
                    $pointuser = (int)($userpoint);  //上面已经加过了，这里直接取余额
	                $title = "推荐注册送积分，来自用户：".$to."，用户ID：".$userid;
	                //保存操作日志
	                $sql = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$fromShare', '1', '$point', '$title', '$now','zengsong','$pointuser')");
	                $ret = $dsql->dsqlOper($sql, "update");
				}

				if($cfg_moneyRegGivingRec){

                    //默认为所有人推荐注册都送现金，如果勾选分销商，则表示只有分销商推荐新会员注册才会送现金！
					if(!$cfg_moneyRegGivingState || $isFxs){
                        if($isFxs){
                            $user  = $userLogin->getMemberInfo($fromShare);
                            $usermoney = $user['money'];
                            $moneyy      = sprintf('%.2f',($usermoney));  //上面已经加过了，这里直接取余额
                            $title = "推荐注册送现金，来自用户：".$to."，用户ID：".$userid;
                            //保存操作日志
                            $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$fromShare', '1', '$money', '$title', '$now','member','yongjin','$moneyy')");
                            $ret = $dsql->dsqlOper($sql, "update");
                        }
                    }
                    
				}

				//会员-推荐成功通知

				//会员通知
				$param = array(
					"service"  => "member",
					"type" => "user",
					"template" => "point"
				);

				//自定义配置
				$config = array(
					"from" => $from,
					"to" => $to,
					"point" => $point,
					"fields" => array(
						'keyword1' => '推荐人',
						'keyword2' => '被推荐人'
					)
				);

				updateMemberNotice($fromShare, "会员-推荐成功通知", $param, $config);
            }
            if(is_file(HUONIAOINC.'/config/fenxiaoConfig.inc.php')){
                include HUONIAOINC.'/config/fenxiaoConfig.inc.php'; //分销配置
                global $cfg_memberBinding;
                $data = GetMkTime(time());
                //查询会员是不是老用户  根据注册时间
                $archives = $this->SetQuery("SELECT `regtime`, `cityid` FROM `#@__member` WHERE `id` = " . $userid);
                $results = $this->db->prepare($archives);
                $results->execute();
                $results = $results->fetchAll(PDO::FETCH_ASSOC);
                $datatime = $data - $results[0]['regtime'];
                $__cityid = (int)$results[0]['cityid'];
                if (($datatime > 300 && $cfg_memberBinding == 0) || $datatime < 300) {
                if($cfg_fenxiaoState && $cfg_fenxiaoState){

                    //防止出现两个会员之前循环推荐
                    $sj_uidsql = $this->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = " . $fromShare);
                    $sj_uidres = $this->db->prepare($sj_uidsql);
                    $sj_uidres->execute();
                    $sj_uidres = $sj_uidres->fetchAll(PDO::FETCH_ASSOC);
                    if($sj_uidres[0]['from_uid'] != $userid){

                        //如果新注册的用户还没有绑定分站，则以推荐用户的分站为准

                        $nowTime = GetMkTime(time());//当前时间，绑定的时候保存绑定时间

                        $fenxiaoBinding = (int)$cfg_fenxiaoBinding;
                        $pass = false;
                        if ($fenxiaoBinding == 1) {
                            //分销商查询
                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` where `uid` = '$fromShare' AND `state`=1");
                            $fxuid = $dsql->getOne($sql);
                            $pass = $fxuid ? true : false;
                        } else {
                            $pass = true;
                        }

                        if ($pass) {
                            if (!$__cityid) {
                                $sql = $this->SetQuery("UPDATE `#@__member` SET `from_uid` = $fromShare, `cityid` = '$_cityid', `from_bindtime` = '$nowTime' WHERE `id` = $userid AND `from_uid` = 0");
                            } else {
                                $sql = $this->SetQuery("UPDATE `#@__member` SET `from_uid` = $fromShare, `from_bindtime` = '$nowTime' WHERE `id` = $userid AND `from_uid` = 0");
                            }
                            $ret = $this->db->prepare($sql);
                            $ret->execute();
                            $ret->closeCursor();
                        }

                        //记录会员变动日志
                        require_once HUONIAOROOT."/api/payment/log.php";
                        $_memberLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);
                        $_memberLog->DEBUG($sql, true);
                    }

                }
            }
          }

            DropCookie('fromShare');
        }

    }


    /**
     * 获取后台操作权限集合
     * by 20180116
     * @return array
     */
    function getAdminPermissions(){

        global $dsql;
        $menusArr = array();

        //此处参考了/admin/member/adminGroup.php，如果修改规则，请一并修改
        //载入全局目录（普通功能最多分五级、功能模块最多为六级）
        require(HUONIAODATA."/admin/config_permission.php");
        if(!empty($menuData)){
            //一级
            foreach($menuData as $key => $menu){
                $data = array();
                $menuId = $menu['menuId'];
                if($menu['subMenu']){
                    //二级
                    foreach($menu['subMenu'] as $s_key => $subMenu){
                        $subdata = array();
                        $menuId = $menuId ? $menuId : $subMenu['menuId'];
                        if($subMenu['subMenu']){
                            //三级
                            foreach($subMenu['subMenu'] as $c_key => $childMenu){
                                if($childMenu['subMenu']){
                                    //四级
                                    foreach($childMenu['subMenu'] as $t_key => $threeMenu){
                                        if($threeMenu['menuChild']){
                                            //五级
                                            foreach($threeMenu['menuChild'] as $f_key => $fourMenu){
                                                if($fourMenu['menuChild']){
                                                    //六级
                                                    foreach($fourMenu['menuChild'] as $five_key => $fiveMenu){
                                                        if($fiveMenu['city'] && testPurview($fiveMenu['menuMark'])){
                                                            array_push($data, array(
                                                                "title" => $fiveMenu['menuName'],
                                                                "mark" => $fiveMenu['menuMark']
                                                            ));
                                                            array_push($subdata, array(
                                                                "title" => $fiveMenu['menuName'],
                                                                "mark" => $fiveMenu['menuMark']
                                                            ));
                                                        }
                                                    }
                                                }
                                                if($fourMenu['city'] && testPurview($fourMenu['menuMark'])){
                                                    array_push($data, array(
                                                        "title" => $fourMenu['menuName'],
                                                        "mark" => $fourMenu['menuMark']
                                                    ));
                                                    array_push($subdata, array(
                                                        "title" => $fourMenu['menuName'],
                                                        "mark" => $fourMenu['menuMark']
                                                    ));
                                                }
                                            }
                                        }

                                        $value = $threeMenu['menuUrl'];
                                        if(strpos($value, "/") !== false){
                                            $value = explode("/", $value);
                                            $value = $value[1];
                                        }
                                        $value = preg_replace('/\.php(\?action\=)?/', '', $value);
                                        $value = preg_replace('/\.php(\?type\=)?/', '', $value);
                                        $value = preg_replace('/\?action\=/', '', $value);
                                        $value = preg_replace('/\?type\=/', '', $value);
                                        $value = preg_replace('/\.php(\?tpl\=)?/', '', $value);
										$value = preg_replace('/\?tpl\=/', '', $value);
                                        $value = preg_replace('/\?typeid\=/', '', $value);
                                        $value = preg_replace('/&/', '', $value);
                                        $value = preg_replace('/=1/', '', $value);

                                        if($threeMenu['city'] && testPurview($value)){
                                            array_push($data, array(
                                                "title" => $threeMenu['menuName'],
                                                "mark" => $value
                                            ));
                                            array_push($subdata, array(
                                                "title" => $threeMenu['menuName'],
                                                "mark" => $value
                                            ));
                                        }
                                    }
                                }else{
                                    if($childMenu['menuChild']){
                                        //四级
                                        foreach($childMenu['menuChild'] as $f_key => $fourMenu){
                                            if($fourMenu['menuChild']){
                                                //五级
                                                foreach($fourMenu['menuChild'] as $five_key => $fiveMenu){
                                                    if($fiveMenu['city'] && testPurview($fiveMenu['menuMark'])){
                                                        array_push($data, array(
                                                            "title" => $fiveMenu['menuName'],
                                                            "mark" => $fiveMenu['menuMark']
                                                        ));
                                                        array_push($subdata, array(
                                                            "title" => $fiveMenu['menuName'],
                                                            "mark" => $fiveMenu['menuMark']
                                                        ));
                                                    }
                                                }
                                            }
                                            if($fourMenu['city'] && testPurview($fourMenu['menuMark'])){
                                                array_push($data, array(
                                                    "title" => $fourMenu['menuName'],
                                                    "mark" => $fourMenu['menuMark']
                                                ));
                                                array_push($subdata, array(
                                                    "title" => $fourMenu['menuName'],
                                                    "mark" => $fourMenu['menuMark']
                                                ));
                                            }
                                        }
                                    }

                                    $value = $childMenu['menuUrl'];
                                    if(strpos($value, "/") !== false){
                                        $value = explode("/", $value);
                                        $value = $value[1];
                                    }
                                    $value = preg_replace('/\.php(\?action\=)?/', '', $value);
                                    $value = preg_replace('/\.php(\?type\=)?/', '', $value);
                                    $value = preg_replace('/\?action\=/', '', $value);
                                    $value = preg_replace('/\?type\=/', '', $value);
                                    $value = preg_replace('/\.php(\?tpl\=)?/', '', $value);
                                    $value = preg_replace('/\?tpl\=/', '', $value);
                                    $value = preg_replace('/\?typeid\=/', '', $value);
                                    $value = preg_replace('/&/', '', $value);
                                    $value = preg_replace('/=1/', '', $value);

                                    if($childMenu['city'] && testPurview($value)){
                                        array_push($data, array(
                                            "title" => $childMenu['menuName'],
                                            "mark" => $value
                                        ));
                                        array_push($subdata, array(
                                            "title" => $childMenu['menuName'],
                                            "mark" => $value
                                        ));
                                    }
                                }

                            }
                        }

                        if($subdata && $menu['menuName'] == '模块'){
                            array_push($menusArr, array(
                                "name" => $subMenu['menuName'],
                                "list" => $subdata
                            ));
                        }
                    }
                }

                if($data && $menu['menuName'] != '模块'){
                    array_push($menusArr, array(
                        "name" => $menu['menuName'],
                        "list" => $data
                    ));
                }
            }

        }

        return $menusArr;

    }


    /**
     * 根据当前登录人获取可查看的管理员ID
     * by 20180117
     * @return array
     */
    function getAdminIds(){
        $adminIds = array();
        $adminList = $this->getAdminList();
        if($adminList){
            foreach ($adminList as $key => $value) {
                if($value['list']){
                    foreach ($value['list'] as $k => $v) {
                        array_push($adminIds, $v['id']);
                    }
                }
            }
        }
        return join(',', $adminIds);
    }


    /**
     * 根据当前登录人获取可查看的分站城市ID
     * by 20180117
     * @return array
     */
    function getAdminCityIds(){
        $cityIds = array();
        $adminCity = $this->getAdminCity();
        if($adminCity){
            foreach ($adminCity as $key => $value) {
                array_push($cityIds, $value['id']);
            }
        }
        return join(',', $cityIds);
    }


    /**
     * 根据当前登录人获取可管理的分站城市
     * by 20180117
     * @return array
     */
    function getAdminCity(){
        global $dsql;
        $userid = $this->getUserID();
        $mtype = $this->getUserType();
        $cityArr = array();

        if($mtype == 3){
            $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` LEFT JOIN `#@__member` m ON m.`mgroupid` = a.`id` WHERE m.`mtype` = 3 AND m.`id` = $userid AND a.`id` != '' AND c.`state` = 1 ORDER BY c.`id`");

            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {
                    array_push($cityArr, array(
                        "id" => $value['cid'],
                        "name" => $value['typename'],
                        "hot" => (int)$value['hot'],
                        "pinyin" => strtolower(mb_substr($value['pinyin'], 0, 1))
                    ));
                }
            }
        }else{
            // array_push($cityArr, array(
            //     "id" => 0,
            //     "name" => '未指定',
            //     "pinyin" => 'null'
            // ));
            $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` != '' AND c.`state` = 1 ORDER BY c.`id`");
            // var_dump($sql);die;
            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {
                    array_push($cityArr, array(
                        "id" => $value['cid'],
                        "name" => $value['typename'],
                        "hot" => (int)$value['hot'],
                        "pinyin" => strtolower(mb_substr($value['pinyin'], 0, 1))
                    ));
                }
            }
        }
        return $cityArr;
    }


    /**
     * 根据当前登录人获取可查看的管理员列表
     * by 20180117
     * @return array
     */
    function getAdminList($module = ''){
        global $dsql;
        $groupArr = array();
        $mtype = $this->getUserType();
        $userid = $this->getUserID();

        //如果有模块，就只查看关联模块的管理员
        $where = '';
        $where1 = '';
        if ($module != null) {
            $where .= " AND `discount` = '".$module."'";
            $where1 .= " AND m.`discount` = '".$module."'";
        }

        //判断是否有权限查看管理员列表，没有权限的，只能看自己
        if(!testPurview('adminList')){
            $where .= " AND `id` = $userid";
            $where1 .= " AND m.`id` = $userid";
        }

        //系统管理员可查看所有管理员
        if($mtype == 0){
            $sql = $dsql->SetQuery("SELECT `id`, `groupname` FROM `#@__admingroup`");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $k => $v) {
                    $groupid = $v['id'];
                    $groupname = $v['groupname'];

                    //管理组下的管理员
                    $memberArr = array();
                    $sql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `mtype` = 0 AND `mgroupid` = $groupid".$where);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        foreach ($ret as $key => $value) {
                            array_push($memberArr, array(
                                "id" => $value['id'],
                                "username" => $value['username'],
                                "nickname" => $value['nickname']
                            ));
                        }
                    }
                    if($memberArr){
                        array_push($groupArr, array(
                            "id" => $groupid,
                            "name" => $groupname,
                            "list" => $memberArr
                        ));
                    }
                }
            }

            //分站城市
            $cityArr = array();
            $sql = $dsql->SetQuery("SELECT a.`id` cid, a.`typename`, m.`id` mid, m.`username`, m.`nickname` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` LEFT JOIN `#@__member` m ON m.`mgroupid` = a.`id` WHERE m.`mtype` = 3".$where1." ORDER BY c.`id`");
            // $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` ORDER BY c.`id`");
            $result = $dsql->dsqlOper($sql, "results");
            if($result){

                $fzAdminArr = array();
                foreach ($result as $k => $v) {
                    $cityid = $v['cid'];
                    $cityname = $v['typename'];

                    $mid = $v['mid'];
                    $username = $v['username'];
                    $nickname = $v['nickname'];

                    if($fzAdminArr[$cityid]){
                        array_push($fzAdminArr[$cityid]['list'], array(
                            "id" => $mid,
                            "username" => $username,
                            "nickname" => $nickname
                        ));
                    }else{
                        $fzAdminArr[$cityid] = array(
                            "id" => $cityid,
                            "name" => $cityname . '分站管理员',
                            "list" => array(array(
                                "id" => $mid,
                                "username" => $username,
                                "nickname" => $nickname
                            ))
                        );
                    }

                }

                if($fzAdminArr){
                    foreach ($fzAdminArr as $key => $value) {
                        array_push($groupArr, $value);
                    }
                }

            }

            //城市管理员只可以查看自己和下属管理员
        }elseif($mtype == 3){

            //首先查看所属城市
            $cityid = 0;
            $cityname = "未知分站管理员";
            $sql = $dsql->SetQuery("SELECT a.`id`, a.`typename` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` LEFT JOIN `#@__member` m ON m.`mgroupid` = a.`id` WHERE m.`id` = " . $userid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityid = $ret[0]['id'];
                $cityname = $ret[0]['typename'];

                //查看城市分站下的管理员
                $memberArr = array();
                $sql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `mtype` = 3 AND `mgroupid` = $cityid".$where);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $key => $value) {
                        array_push($memberArr, array(
                            "id" => $value['id'],
                            "username" => $value['username'],
                            "nickname" => $value['nickname']
                        ));
                    }
                }
            }

            if($memberArr){
                array_push($groupArr, array(
                    "id" => $cityid,
                    "name" => $cityname . '分站管理员',
                    "list" => $memberArr
                ));
            }

        }

        return $groupArr;

    }

}
