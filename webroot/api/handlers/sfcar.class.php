<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 顺风车模块API接口
 *
 * @version        $Id: sfcar.class.php 2019-10-22 上午11:57:30 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class sfcar {
	private $param;  //参数

	/**
     * 构造函数
	 *
     * @param string $action 动作名
     */
    public function __construct($param = array()){
		$this->param = $param;
	}

	/**
     * 顺风车基本参数
     * @return array

     */
	public function config(){

		require(HUONIAOINC."/config/sfcar.inc.php");

		global $cfg_fileUrl;              //系统附件默认地址
		global $cfg_uploadDir;            //系统附件默认上传目录
		// global $customFtp;                //是否自定义FTP
		// global $custom_ftpState;          //FTP是否开启
		// global $custom_ftpUrl;            //远程附件地址
		// global $custom_ftpDir;            //FTP上传目录
		// global $custom_uploadDir;         //默认上传目录
		global $cfg_basehost;             //系统主域名
		global $cfg_hotline;              //系统默认咨询热线

		// global $customChannelName;        //模块名称
		// global $customLogo;               //logo使用方式
		global $cfg_weblogo;              //系统默认logo地址
        global $cfg_sharePic;             //分享默认图片
		// global $customLogoUrl;            //logo地址
		// global $customSubDomain;          //访问方式
		// global $customChannelSwitch;      //模块状态
		// global $customCloseCause;         //模块禁用说明
		// global $customSeoTitle;           //seo标题
		// global $customSeoKeyword;         //seo关键字
		// global $customSeoDescription;     //seo描述
		// global $customHotline;            //咨询热线
		// global $submission;               //投稿邮箱
		// global $customAtlasMax;           //图集数量限制
		// global $customTemplate;           //模板风格
		//
		// global $customUpload;             //上传配置是否自定义
		global $cfg_softSize;             //系统附件上传限制大小
		global $cfg_softType;             //系统附件上传类型限制
		global $cfg_thumbSize;            //系统缩略图上传限制大小
		global $cfg_thumbType;            //系统缩略图上传类型限制
		global $cfg_atlasSize;            //系统图集上传限制大小
		global $cfg_atlasType;            //系统图集上传类型限制

		// global $custom_softSize;          //附件上传限制大小
		// global $custom_softType;          //附件上传类型限制
		// global $custom_thumbSize;         //缩略图上传限制大小
		// global $custom_thumbType;         //缩略图上传类型限制
		// global $custom_atlasSize;         //图集上传限制大小
		// global $custom_atlasType;         //图集上传类型限制

		//获取当前城市名
		global $siteCityInfo;
		if(is_array($siteCityInfo)){
			$cityName = $siteCityInfo['name'];
		}

		//如果上传设置为系统默认，则以下参数使用系统默认
		if($customUpload == 0){
			$custom_softSize = $cfg_softSize;
			$custom_softType  = $cfg_softType;
			$custom_thumbSize = $cfg_thumbSize;
			$custom_thumbType = $cfg_thumbType;
			$custom_atlasSize = $cfg_atlasSize;
			$custom_atlasType = $cfg_atlasType;
		}

		$hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;

		$params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

		// $domainInfo = getDomain('image', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('sfcar', $customSubDomain);

        //分站自定义配置
        $ser = 'sfcar';
        global $siteCityAdvancedConfig;
        if($siteCityAdvancedConfig && $siteCityAdvancedConfig[$ser]){
            if($siteCityAdvancedConfig[$ser]['title']){
                $customSeoTitle = $siteCityAdvancedConfig[$ser]['title'];
            }
            if($siteCityAdvancedConfig[$ser]['keywords']){
                $customSeoKeyword = $siteCityAdvancedConfig[$ser]['keywords'];
            }
            if($siteCityAdvancedConfig[$ser]['description']){
                $customSeoDescription = $siteCityAdvancedConfig[$ser]['description'];
            }
            if($siteCityAdvancedConfig[$ser]['logo']){
                $customLogoUrl = $siteCityAdvancedConfig[$ser]['logo'];
            }
            if($siteCityAdvancedConfig[$ser]['hotline']){
                $hotline = $siteCityAdvancedConfig[$ser]['hotline'];
            }
        }

		$customSeoDescription = trim($customSeoDescription);

		$return = array();
		if(!empty($params) > 0){

			$return['customhot'] = $customhot;

			foreach($params as $key => $param){
				if($param == "channelName"){
					$return['channelName'] = str_replace('$city', $cityName, $customChannelName);
				}elseif($param == "logoUrl"){

					//自定义LOGO
					if($customLogo == 1){
						$customLogoPath = getAttachemntFile($customLogoUrl);
					}else{
						$customLogoPath = getAttachemntFile($cfg_weblogo);
					}

					$return['logoUrl'] = $customLogoPath;
				}elseif($param == "subDomain"){
					$return['subDomain'] = $customSubDomain;
				}elseif($param == "channelDomain"){
					$return['channelDomain'] = $customChannelDomain;
				}elseif($param == "channelSwitch"){
					$return['channelSwitch'] = $customChannelSwitch;
				}elseif($param == "closeCause"){
					$return['closeCause'] = $customCloseCause;
				}elseif($param == "title"){
					$return['title'] = str_replace('$city', $cityName, $customSeoTitle);
				}elseif($param == "keywords"){
					$return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
				}elseif($param == "description"){
					$return['description'] = str_replace('$city', $cityName, $customSeoDescription);
				}elseif($param == "hotline"){
					$return['hotline'] = $hotline;
				}elseif($param == "customhot"){
					$return['customhot'] = $customhot;
				}elseif($param == "atlasMax"){
					$return['atlasMax'] = $customAtlasMax;
				}elseif($param == "template"){
					$return['template'] = $customTemplate;
				}elseif($param == "touchTemplate"){
					$return['touchTemplate'] = $customTouchTemplate;
				}elseif($param == "softSize"){
					$return['softSize'] = $custom_softSize;
				}elseif($param == "softType"){
					$return['softType'] = $custom_softType;
				}elseif($param == "thumbSize"){
					$return['thumbSize'] = $custom_thumbSize;
				}elseif($param == "thumbType"){
					$return['thumbType'] = $custom_thumbType;
				}elseif($param == "atlasSize"){
					$return['atlasSize'] = $custom_atlasSize;
				}elseif($param == "atlasType"){
					$return['atlasType'] = $custom_atlasType;
				}
			}

		}else{

			//自定义LOGO
			if($customLogo == 1){
				$customLogoPath = getAttachemntFile($customLogoUrl);
			}else{
				$customLogoPath = getAttachemntFile($cfg_weblogo);
			}

			$return['channelName']   = str_replace('$city', $cityName, $customChannelName);
			$return['logoUrl']       = $customLogoPath;
            $return['sharePic']      = getAttachemntFile($customSharePic ? $customSharePic : $cfg_sharePic);
			$return['subDomain']     = $customSubDomain;
			$return['channelDomain'] = $customChannelDomain;
			$return['channelSwitch'] = $customChannelSwitch;
			$return['closeCause']    = $customCloseCause;
			$return['title']         = str_replace('$city', $cityName, $customSeoTitle);
			$return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
			$return['description']   = str_replace('$city', $cityName, $customSeoDescription);
			$return['hotline']       = $hotline;
			$return['customhot']           = $customhot;
			$return['atlasMax']      = $customAtlasMax;
			$return['template']      = $customTemplate;
			$return['touchTemplate'] = $customTouchTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
			$return['atlasSize']     = $custom_atlasSize;
			$return['atlasType']     = $custom_atlasType;
			$return['displayConfig']     = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
                array('title' => '人找车', 'subtitle' => '乘用载货'),
                array('title' => '车找人', 'subtitle' => '找客找货'),
            );
		}

		return $return;

	}


	/**
     * 顺风车新增
     * @return array

     */
	public function put(){

		global $dsql;
		global $customFabuCheck; /*目的地输入分类*/
		global $userLogin;
		global $langData;
        global $siteCityInfo;
        
        require(HUONIAOINC . "/config/sfcar.inc.php");
        $fabuCheckPhone = (int)$customFabuCheckPhone;

        $displayConfig = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
            array('title' => '人找车', 'subtitle' => '乘用载货'),
            array('title' => '车找人', 'subtitle' => '找客找货'),
        );

		if(!empty($this->param)){
			if(!is_array($this->param)){

				return array("state" => 200, "info" => '格式错误！');

			}else{
				$param 			= $this->param;
				$userid 	  	= $userLogin->getMemberID();
				$userinfo 	  	= $userLogin->getMemberInfo();

				$startaddr		= trim($param['startaddr']);
				$startaddrid	= (int)$param['startaddrid'];
				$startAdress	= trim($param['startAdress']);
				$type			= $param['fabutype'];/*发布分类*/
				$cityid			= (int)$param['cityid'];
				$endaddr		= trim($param['endaddr']);
				$endaddrid		= (int)$param['endaddrid'];
				$endAddress		= trim($param['endAddress']);
				$missiontype	= (int)$param['startType']; /*发车时间分类*/
				$startTime      = $param['startTime']?date('Y-m-d',strtotime($param['startTime'])):'';

				$startClock     = $param['startClock']?date('H:i',strtotime($param['startClock'])):'';
				$missiontime	= $missiontype == 1 ? $startClock : $startTime.' '. $startClock;	/*发车时间*/
				$usetype		= (int)$param['usetype'];
				$tel			= $param['tel'];
				$areaCode		= (int)$param['areaCode'];
				$username		= $param['person'];
				$tag			= is_array($param['flag']) ? implode(',', $param['flag']) : $param['flag']  ;
				$number         = (int)$param['number'];
				$carseat        = (int)$param['carseat'];
				$note        	= $param['note'];
				$piclsit        = $param['imglist'];
				$accessaddr     = $param['route']; /*途径地*/
				$cartype     	= (int)$param['cartype'];
				$vercode     	= (int)$param['vercode'];
				$pubdate     	= time();
			}

            $startaddr = str_replace('选择出发地', '', $startaddr);
            $endaddr = str_replace('选择目的地', '', $endaddr);

			//获取用户ID
	        $uid = $userLogin->getMemberID();
	        if ($uid == -1) {
	            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
	        }

	        //用户信息
	        $userinfo = $userLogin->getMemberInfo();

	        // 需要支付费用
	        $amount = 0;

	        // 是否独立支付 普通会员或者付费会员超出限制
	        $alonepay = 0;

            $arcrank = (int)$customFabuCheck;

            $alreadyFabu = 0; // 付费会员当天已免费发布数量

	        //权限验证
	        // if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "sfcar"))) {
	        //     return array("state" => 200, "info" => $langData['info'][1][60]);//'商家权限验证失败！'
	        // }

            //企业会员或已经升级为收费会员的状态才可以发布 --> 普通会员也可发布
	        // if ($userinfo['userType'] == 1) {

	            $toMax = false;

	            // if ($userinfo['level']) {

	                $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
	                $infoCount       = (int)$memberLevelAuth['sfcar'];
	                //统计用户当天已发布数量 @
	                // $today    = GetMkTime(date("Y-m-d", time()));
	                // $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

	                //本周
					$today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
					$tomorrow = $today + 604800;

	                $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__sfcar_list` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
	                $ret      = $dsql->dsqlOper($sql, "results");
	                if ($ret) {
	                    $alreadyFabu = $ret[0]['total'];
	                    if ($alreadyFabu >= $infoCount) {
	                        $toMax = true;
	                        // return array("state" => 200, "info" => $langData['info'][1][82]);//'当天发布信息数量已达等级上限！'
	                    } else {
	                        // $arcrank = 1;
	                    }
	                }
	            // }

	            // 普通会员或者付费会员当天发布数量达上限
	            if ($userinfo['level'] == 0 || $toMax) {

	                global $cfg_fabuAmount;
	                global $cfg_fabuFreeCount;
	                $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
	                // var_dump($fabuAmount);
	                // echo "<hr>";
	                $fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();
	                // var_dump($fabuFreeCount);die;

	                //超出免费次数
	                if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['sfcar'] <= $alreadyFabu) || !$fabuFreeCount)){
	                    $alonepay = 1;
	                    $amount = $fabuAmount["sfcar"];
                        $arcrank = 0;   //需要审核
	                }

	            }

	        // }

			if(empty($startaddr)) return array("state" => 200, "info" => "请填写出发地");
			if(empty($endaddr)) return array("state" => 200, "info" => "请填写目的地");

			if((!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel) && !$fabuCheckPhone){

                
				if(empty($vercode)) return array("state" => 200, "info" => $langData['sfcar'][2][40]);//请填写验证码

				//国际版需要验证区域码
				$cphone_ = $tel;
				$archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$international = $results[0]['international'];
					if($international){
						$cphone_ = $areaCode.$tel;
					}
				}

				$ip = GetIP();
				$sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
				$res_code = $dsql->dsqlOper($sql_code, "results");

				if($res_code){
					$code 		= $res_code[0]['code'];
					$codeID 	= $res_code[0]['id'];

					if(strtolower($vercode) != $code){
						return array('state' =>200, 'info' => $langData['sfcar'][2][41]);//验证码输入错误，请重试！
					}

					//5分钟有效期
					$now = GetMkTime(time());
					if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！

				}else{

					return array('state' =>200, 'info' => $langData['sfcar'][2][41]);//验证码输入错误，请重试！
				}
			}
			//数据表查询
 			// $sub = new SubTable('sfcar_list', '#@__sfcar_list');
    //     	$insert_table_name = $sub->getLastTable();
        	if($type ==1){
        		$typename = $displayConfig[1]['title'];  //我是车主
        	}else{
        		$typename = $displayConfig[0]['title'];  //我要用车
        	}
        	$title = "【".$typename."】" . $startaddr." — ".$endaddr;
        	$waitpay  = $amount > 0 ? 1 : 0;
        	$insertsql = $dsql->SetQuery("INSERT INTO `#@__sfcar_list` (`title`,`cityid`,`type`,`missiontype`,`missiontime`,`usetype`,`userid`,`username`,`tel`,`tag`,`number`,`carseat`,`note`,`piclsit`,`accessaddr`,`cartype`,`startaddr`,`endaddr`,`endaddrid`,`startaddrid`,`endAddress`,`startAdress`,`waitpay`,`alonepay`,`pubdate`,`state`) VALUES ('$title','$cityid','$type','$missiontype','$missiontime','$usetype','$userid','$username','$tel','$tag','$number','$carseat','$note','$piclsit','$accessaddr','$cartype','$startaddr','$endaddr','$endaddrid','$startaddrid','$endAddress','$startAdress','$waitpay','$alonepay','$pubdate','$arcrank') ");
        	$sfcarid = $dsql->dsqlOper($insertsql,'lastid');
        	if(is_numeric($sfcarid)){

                $urlParam = array(
                    'service' => 'sfcar',
                    'template' => 'detail',
                    'id' => $sfcarid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'sfcar', '', $sfcarid, 'insert', '发布信息('.$sfcarid . '=>' .$title.')', $url, $insertsql);

        	    autoShowUserModule($uid,'sfcar');  // 发布顺风车
        		//分表
	   //      	$sql = $dsql->SetQuery("SELECT COUNT(*) total FROM $insert_table_name");
				// $res = $dsql->dsqlOper($sql, "results");
		  //       $breakup_table_count = $res[0]['total'];
		  //       if($breakup_table_count >= $sub::MAX_SUBTABLE_COUNT){
		  //           $new_table = $sub->createSubTable($dyid); //创建分表并保存记录
		  //       }

				//微信通知
				$title = $startaddr.'到'.$endaddr;
	            $cityName = $siteCityInfo['name'];
			    $cityid  = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'sfcar'));    //获取模块名
		        $paramAdmin = array(
		        	'type' 	 => '2', //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
                        'contentrn' => $cityName."分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布信息：" . $title,
			            'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

		        if ($userinfo['level']) {
	                $auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $infoCount);
	            } else {
	                $auth = array("level" => 0, "levelname" => $langData['info'][1][89], "maxcount" => 0);//普通会员
	            }

                if($arcrank && !$toMax) {
                    updateCache("sfcar_list", 300);
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    global $cfg_returnInteraction_sfcar;    //顺风车积分
                    global $cfg_returnInteraction_commentDay;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_sfcar > 0 ) {
                        $infoname = getModuleTitle(array('name' => 'sfcar'));
                        //顺风车发布得积分
                        $date = GetMkTime(time());
                        global $userLogin;
                        $sfcarpoint = $cfg_returnInteraction_sfcar;
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$sfcarpoint' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint+$sfcarpoint);
                        //保存操作日志
                        $info = '发布'.$infoname;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$sfcarpoint', '$info', '$date','zengsong','1','$userpoint')");//发布顺风车得积分
                        $dsql->dsqlOper($archives, "update");
                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $sfcarpoint,
                            "point" => $userinfo['point'],
                            "date" => date("Y-m-d H:i:s", $date),
                            "info" => $info,
                            "fields" => array(
                                'keyword1' => '变动类型',
                                'keyword2' => '变动积分',
                                'keyword3' => '变动时间',
                                'keyword4' => '积分余额'
                            )
                        );
                        updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                    }
                }
                dataAsync("sfcar",$sfcarid);  // 发布顺风车
				updateAdminNotice("sfcar", "detail",$paramAdmin);
				return array("auth" => $auth, "aid" => $sfcarid, "amount" => $amount, "arcrank" =>$arcrank);
				// return array( "aid" => $sfcarid,"arcrank" =>$arcrank);

        	}else{

        		return array('state'=>"200",'info'=>"发表失败");
        	}
        }
	}

	/**
     * 顺风车获取
     * @return array

    */
	public function edit(){

		global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        
        require(HUONIAOINC . "/config/sfcar.inc.php");
        $fabuCheckPhone = (int)$customFabuCheckPhone;

        $displayConfig = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
            array('title' => '人找车', 'subtitle' => '乘用载货'),
            array('title' => '车找人', 'subtitle' => '找客找货'),
        );

        $param = $this->param;
        $id = $param['id'];
        if (empty($id)) return array("state" => 200, "info" => $langData['info'][1][91]);
        $cityid 		= (int)$param['cityid'];
        $type 			= (int)$param['fabutype'];
        $startaddr 		= $param['startaddr'];
        $startaddrid 	= (int)$param['startaddrid'];
        $endaddr 		= $param['endaddr'];
        $endaddrid 		= (int)$param['endaddrid'];
        $startAdress 	= $param['startAdress'];
        $endAddress 	= $param['endAddress'];

        $accessaddr     = $param['route']; /*途径地*/
        $missiontype 	= (int)$param['startType'];

        $startTime      = $param['startTime']?date('Y-m-d',strtotime($param['startTime'])):'';

		$startClock     = $param['startClock']?date('H:i',strtotime($param['startClock'])):'';

       	$missiontime	= $missiontype == 1 ? $startClock : $startTime.' '. $startClock;	/*发车时间*/
        $usetype 		= (int)$param['usetype'];
        $number 		= (int)$param['number'];
        $carseat 		= (int)$param['carseat'];
        $tel 			= $param['tel'];
        $areaCode 		= (int)$param['areaCode'];
        $vercode 		= (int)$param['vercode'];
        $username 		= $param['person'];
        $piclsit 		= $param['imglist'];
        $cartype 		= (int)$param['cartype'];
        $tag 			= is_array($param['flag']) ? implode(',',$param['flag'] ) : $param['flag'];
        $note 			= $param['note'];

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//'登录超时，请重新登录！'
        }

        $userinfo = $userLogin->getMemberInfo();

        //权限验证
        // if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "sfcar"))) {
        //     return array("state" => 200, "info" => $langData['info'][1][50]);//'商家权限验证失败！'
        // }

        $archives = $dsql->SetQuery("SELECT `id`,`tel` FROM `#@__sfcar_list` WHERE `id` = " . $id . " AND `userid` = " . $uid);
        $results  = $dsql->dsqlOper($archives, "results");

        if (!$results) {

            return array("state" => 200, "info" => $langData['info'][1][82]);//'权限不足，修改失败！'
        }

        $detail = $results[0];

        if( isset($param['vercode']) && $detail['tel'] != $tel && !$fabuCheckPhone) {

	        if(empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
	        //国际版需要验证区域码
	        $cphone_ = $contact;
	        $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
	        $results = $dsql->dsqlOper($archives, "results");
	        if($results){
	            $international = $results[0]['international'];
	            if($international){
	                $cphone_ = $areaCode.$contact;
	            }
	        }

	        $ip = GetIP();
	        $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
	        $res_code = $dsql->dsqlOper($sql_code, "results");
	        if($res_code){
	            $code = $res_code[0]['code'];
	            $codeID = $res_code[0]['id'];

	            if(strtolower($vercode) != $code){
	                return array('state' =>200, 'info' => '验证码输入错误，请重试！');
	            }

	            //5分钟有效期
	            $now = GetMkTime(time());
	            if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
	        }else{
	            return array('state' =>200, 'info' => '验证码输入错误，请重试！');
	        }
        }

        if($type == 1){
            $typename = $displayConfig[1]['title'];  //我是车主
        }else{
            $typename = $displayConfig[0]['title'];  //我要用车
        }
        $title = "【".$typename."】" . $startaddr." — ".$endaddr;

        $archives = $dsql->SetQuery("UPDATE `#@__sfcar_list` SET `title` = '$title', `type` = '$type',`startaddr` = '$startaddr', `startaddrid` = '$startaddrid',`endaddr` = '$endaddr',`endaddrid` = '$endaddrid',`accessaddr` = '$accessaddr',`missiontype` = '$missiontype',`missiontime` = '$missiontime',`usetype` = '$usetype',`number` = '$number',`carseat` = '$carseat',`tel` = '$tel',`areaCode` = '$areaCode',`username` = '$username',`cartype`='$cartype',`tag`='$tag',`note`='$note',`startAdress` = '$startAdress',`endAddress` = '$endAddress',`piclsit` = '$piclsit'  WHERE `id` = ".$id);

        $results = $dsql->dsqlOper($archives, "update");

        if($results == "ok"){

            $urlParam = array(
                'service' => 'sfcar',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'sfcar', '', $id, 'update', '修改信息('.$id.'=>'.$title.')', $url, $archives);

        	//微信通知
	            $cityName = $siteCityInfo['name'];
			    $cityid  = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'shop'));    //获取模块名
				$param = array(
				    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
				    'cityid' => $cityid,
				    'notify' => '管理员消息通知',
				    'fields' =>array(
                        'contentrn' => $cityName."分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新信息：" . $id,
						'date' => date("Y-m-d H:i:s", time()),
					)
				);
				updateAdminNotice("sfcar", "detail",$param);

                if(isset($codeID)){
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }
                dataAsync("sfcar",$id);  // 更新顺风车

				return "修改成功！";
        }else{

        	return array("state" => 101, "info" => '保存到数据时发生错误，请检查字段内容！');
        }

	}

	/**
     * 顺风车获取
     * @return array

    */
	public function getsfcarlist(){

		global $dsql;
		global $customInsertselect; /*目的地输入分类*/
		global $userLogin;
		global $langData;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //VIP会员免费查看

		if(!empty($this->param)){
			if(!is_array($this->param)){

				return array("state" => 200, "info" => '格式错误！');

			}else{
				$param = $this->param;
				$type 		= $param['type'] != null ? $param['type'] : $_REQUEST['type'];
                // $type = $type == 0 ? 1 : 0;
				// $usetype 	= $param['usetype'];
				$timetype 	= (int)$param['timetype'];
				$startaddr 	= addslashes(convertStrToPageShow($param['startaddr']));
				$endaddr 	= addslashes(convertStrToPageShow($param['endaddr']));
				$orderby 	= (int)$param['orderby'];
				$cartype 	= $param['cartype'];
				$state 		= $param['state'];
				$u        	= (int)$param['u'];
                $page     	= (int)$param['page'];
                $pageSize 	= (int)$param['pageSize'];
                $keywords 	= addslashes(convertStrToPageShow($param['keywords']));
                $id = $this->param['id'];  //指定信息id，多个用,分隔
                $isbid = (int)$param['isbid'];  //是否推广中
                $expired = (int)$param['expired'];  //已过期/已失效

                $pageSize = empty($pageSize) ? 10 : $pageSize;
                $page     = empty($page) ? 1 : $page;

				$where 	= "";
				$where1 = "";
                $where3 = "";
                $where4 = "";
                require(HUONIAOINC."/config/sfcar.inc.php");
                if($customInsertselect == 1){
                    $cityid = getCityId($this->param['cityid']);
		            if ($cityid && $u != 1) {
		                $where .= " AND `cityid` = " . $cityid;
		            } else {
		                $where .= " AND `cityid` != 0";
		            }
		        }

                $displayConfig = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
                    array('title' => '人找车', 'subtitle' => '乘用载货'),
                    array('title' => '车找人', 'subtitle' => '找客找货'),
                );

                //指定信息id
                if($id){
                    $_id = array();
                    $_idArr = explode(',', $id);
                    foreach($_idArr as $v){
                        $v = (int)$v;
                        if($v){
                            array_push($_id, $v);
                        }
                    }
                    $id = join(',', $_id);
                    $where .= " AND `id` IN ($id)";
                }
                
				if(is_numeric($type)){
                    $_type = $type == 0 ? 1 : 0;
					$where .=" AND `type` = ".$_type;
				}

                //推广中
                if ($isbid) {       
                    $where4 .= " AND (`isbid` = 1 OR `refreshSmart` = 1)";
                }

				if ($startaddr) {

					$where .=" AND (locate('".$startaddr."',startaddr) or locate('".$startaddr."',accessaddr ))";
				}

				if($endaddr){
					$where .=" AND (locate('".$endaddr."',accessaddr) or locate('".$endaddr."',endaddr ))";
				}

                if($keywords){
                    $where .=" AND ((locate('".$keywords."',startaddr) or locate('".$keywords."',accessaddr )) OR (locate('".$keywords."',accessaddr) or locate('".$keywords."',endaddr )))";
                }

				$order = " ORDER BY `isbid` DESC, `pubdate` DESC";
				if ($orderby == 3) {

					$where .= " AND `missiontype` = 1";

				}else{
					if($orderby == 1 ){

						$order = " ORDER BY `isbid` DESC,`pubdate` DESC, `id` DESC";

					}elseif($orderby == 2){

						// $order = " ORDER BY unix_timestamp(`missiontime`) DESC, `id` DESC";
						$where .= " AND (unix_timestamp(`missiontime`) >= ".time()." OR `missiontype` = 1)";

						$order = " ORDER BY `isbid` DESC,unix_timestamp(`missiontime`) ASC, `id` DESC";

					}

				}

				if(isset($cartype) && $cartype!=''){
                    $cartype = (int)$cartype;
					$where .=" AND `usetype` = ".$cartype;
				}
				if ($u != 1) {
		            $where .= " AND `state` = 1 AND `waitpay` = 0";

		        } else {
                    $uid      = $userLogin->getMemberID();
                    $userinfo = $userLogin->getMemberInfo();

		            // if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "sfcar"))) {
		            //     return array("state" => 200, "info" => $langData['info'][1][73]);//'商家权限验证失败！'
		            // }

		            $where .= " AND `userid` = " . $uid;
		            // $where1 .= " AND `userid` = " . $uid;

		            // if ($state != "") {

		            //         $where .= " AND `state` = " . $state;
		            //         // $where1 .= " AND `state` = " . $state;
		            // }
		        }
//                $time =date("Y-m-d H:i",GetMkTime(time()));
                $time = GetMkTime(time());

				if ($u != 1) {
                    $where .= " AND ((`missiontype` = 0 AND `missiontime` > now()) or `missiontype` = 1) ";
                }

                //移动端新版增加了已失效筛选
                if($u == 1 && $_REQUEST['platform_name'] && !$expired){
                    $where3 = " AND ((`missiontype` = 0 AND `missiontime` > now()) or `missiontype` = 1) ";
                }
				
                //总条数
		        $archives	= $dsql->SetQuery("SELECT * FROM `#@__sfcar_list`  WHERE 1 = 1");
                $sql 		= $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__sfcar_list`  WHERE 1 = 1 ".$where.$where3.$where4 );
		        $totalCount = (int)getCache("sfcar_total", $sql, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));

		        //总分页数
		        $totalPage 	= ceil($totalCount / $pageSize);
		        if ($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
		        $pageinfo = array(
		            "page" => $page,
		            "pageSize" => $pageSize,
		            "totalPage" => $totalPage,
		            "totalCount" => $totalCount
		        );
                //会员列表需要统计信息状态
		        if ($u == 1 && $userLogin->getMemberID() > -1) {
		            //待审核
		            $totalGray = $dsql->dsqlOper($archives. $where.$where3 ." AND `state` = 0", "totalCount");
		            //已审核
		            $totalAudit = $dsql->dsqlOper($archives . $where.$where3 ." AND `state` = 1", "totalCount");
		            //拒绝审核
		            $totalRefuse = $dsql->dsqlOper($archives . $where.$where3 ." AND `state` = 2", "totalCount");
                    //推广中
                    $totalExtension = $dsql->dsqlOper($archives . $where.$where3 . " AND (`isbid` = 1 OR `refreshSmart` = 1)", "totalCount");
                    //已失效
                    $totalExpired = $dsql->dsqlOper($archives . $where . " AND `missiontype` = 0 AND `missiontime` < now()", "totalCount");

		            $pageinfo['gray']   = $totalGray;
		            $pageinfo['audit']  = $totalAudit;
		            $pageinfo['refuse'] = $totalRefuse;
                    $pageinfo['extension'] = $totalExtension;
		            $pageinfo['expired'] = $totalExpired;
		        }

				//状态
				if ($state != "") {
					$where .= " AND `state` = " . $state;
				}

                //已失效的
                if($expired){
                    $where .= " AND `missiontype` = 0 AND `missiontime` < now()";
                }

		        $atpage  = $pageSize*($page-1);
				$where1  = " LIMIT $atpage, $pageSize";

				// var_dump($archives.$where.$where3.$where4.$order.$where1);die;
				$results = getCache("sfcar_list", $archives.$where.$where3.$where4.$order.$where1, 300, array("disabled" => $u));
				$resList = array();

				//固定字段
				$itemsql = $dsql->SetQuery("SELECT * FROM `#@__sfcaritem` WHERE `parentid`!=0");
				$itemres = $dsql->dsqlOper($itemsql,"results");
				$itemarr = array_combine(array_column($itemres, 'id'), array_column($itemres, 'typename'));

				if($results){

                    $loginUserID = $userLogin->getMemberID();
                    $loginUserInfo = $userLogin->getMemberInfo();

					foreach ($results as $k => $v) {
						$accessaddrserch ='';
						$tagarr = array();
						$resList[$k]['id'] 			= $v['id'];
						// $resList[$k]['startaddr'] 	= $v['startaddr'];

						$className  = '';
		                $className1 = '';
		                $htmlName   = '';
		                $htmlName1  = '';
		                if($v['titleRed']){
		                    $className  = '<font style="color:#ff3d08">';
		                    $className1 = '</font>';
		                }
		                if($v['titleBlod']){
		                    $htmlName  = '<strong>';
		                    $htmlName1 = '</strong>';
		                }
		                $resList[$k]["startaddr"]  = $className . $htmlName . $v['startaddr'] . $htmlName1 . $className1;


						// $resList[$k]['endaddr'] 	= $v['endaddr'];

						$className  = '';
		                $className1 = '';
		                $htmlName   = '';
		                $htmlName1  = '';
		                if($v['titleRed']){
		                    $className  = '<font style="color:#ff3d08">';
		                    $className1 = '</font>';
		                }
		                if($v['titleBlod']){
		                    $htmlName  = '<strong>';
		                    $htmlName1 = '</strong>';
		                }
		                $resList[$k]["endaddr"]  = $className . $htmlName . $v['endaddr'] . $htmlName1 . $className1;

						$resList[$k]['missiontype'] = $v['missiontype'];

                        //判断是否已经付过查看电话号码的费用
                        $payPhoneState = $loginUserID == -1 ? 0 : 1;
                        if($cfg_payPhoneState && in_array('sfcar', $cfg_payPhoneModule) && $loginUserID != $v['userid']){

                            //判断是否开启了会员免费
                            if($cfg_payPhoneVipFree && $loginUserInfo['level']){
                                $payPhoneState = 1;
                            }
                            else{
                                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'sfcar' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $v['id']);
                                $ret = $dsql->dsqlOper($sql, "results");
                                if(!$ret){
                                    $payPhoneState = 0;
                                }
                            }
                        }
                        
                        $resList[$k]['payPhoneState'] = $payPhoneState; //当前信息是否支付过
						$resList[$k]['tel'] 		= $v['tel'] ? (!$payPhoneState && $cfg_payPhoneState && in_array('sfcar', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('sfcar', $cfg_privatenumberModule) && $loginUserID != $v['userid'] ? '请使用隐私号' : $v['tel'])) : '';
						$resList[$k]['accessaddr']  = $v['accessaddr'];
						$resList[$k]['note']  		= $v['note'];
						$resList[$k]['waitpay']  	= $v['waitpay'];

						if($v['accessaddr'] != ''){
							if($startaddr!=''){
								$accessaddray =  explode(",", $v['accessaddr']);
								foreach ($accessaddray as $key => $value) {
									if($startaddr == $value){
										$accessaddrserch = $value;
									}
								}
							}

							if($endaddr!=''){
								$accessaddray =  explode(",", $v['accessaddr']);
								foreach ($accessaddray as $key => $value) {
									if($endaddr == $value){
										if($accessaddrserch ==''){

											$accessaddrserch = $endaddr;
										}else{
											$accessaddrserch .=','.$endaddr;
										}
									}
								}
							}
						}
						$resList[$k]['accessaddrserch'] = $accessaddrserch;

						if($v['missiontype'] ==0){
							$time 			= weekday(strtotime($v['missiontime']));
							$missiontime 	= explode(' ', $v['missiontime']);

							$resList[$k]['missiontime']  	= $missiontime[0];
							$resList[$k]['missiontime1']  	= "(".$time.")  " . $missiontime[1];

						}else{
							$resList[$k]['missiontime'] 	= "天天发车";
							$resList[$k]['missiontime1'] 	= strlen($v['missiontime']) < 6 ? $v['missiontime'] : date("H:i", $v['missiontime']);
						}

						if($v['type'] == 1){
							if($v['usetype'] == 0 ){
								$resList[$k]['usetypename'] 	= '乘用车';
								$resList[$k]['Specifications'] 	= $v['carseat']."座";

							}else{
								$resList[$k]['usetypename'] 	= '载货车';
							}
							$resList[$k]['typename'] 	= $displayConfig[1]['title'];

						}else{
							if($v['usetype'] == 0 ){
								$resList[$k]['usetypename'] 	= '乘客';
								$resList[$k]['Specifications'] 	= $v['number']."人";

							}else{
								$resList[$k]['usetypename'] 	= '货物';

							}
							$resList[$k]['typename'] 	= $displayConfig[0]['title'];

						}

						$resList[$k]['usetype'] 		= $v['usetype'];
						$resList[$k]['type'] 			= $v['type'];

						$tag =  $v['tag'] ? explode(",", $v['tag']) : array();
						foreach ($tag as $a => $b) {
							array_push($tagarr, $itemarr[$b]);

						}

						$resList[$k]['tag'] 		= $tagarr;
						$resList[$k]['pubdate']  	= $v['pubdate'];
						$resList[$k]['pubdatetime']  = date('Y-m-d H:i',$v['pubdate']);

						$param = array(
			                "service" => "sfcar",
			                "template" => "detail",
			                "id" => $v['id']
			            );
			            $resList[$k]['url']			= getUrlPath($param);
			            $resList[$k]['onclick']		= $v['onclick'];
			            $resList[$k]['state']		= $v['state'];
			            $resList[$k]['isbid']		= (int)$v['isbid'];

                        //会员中心显示信息状态
		                if ($u == 1 && $userLogin->getMemberID() > -1) {
		                    //显示置顶信息
		                    if ($v['isbid']) {
		                        $resList[$k]['bid_type']  = $v['bid_type'];
		                        $resList[$k]['bid_price'] = $v['bid_price'];
		                        $resList[$k]['bid_start'] = $v['bid_start'];
		                        $resList[$k]['bid_end']   = $v['bid_end'];

		                        //计划置顶详细
		                        if ($v['bid_type'] == 'plan') {
		                            $tp_beganDate 	= date('Y-m-d', $v['bid_start']);
		                            $tp_endDate   	= date('Y-m-d', $v['bid_end']);

		                            $diffDays   	= (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
		                            $tp_planArr 	= array();

		                            $weekArr 		= array('周日', '周一', '周二', '周三', '周四', '周五', '周六');

		                            //时间范围内每天的明细
		                            for ($i = 0; $i < $diffDays; $i++) {
		                                $began = GetMkTime($tp_beganDate);
		                                $day   = AddDay($began, $i);
		                                $week  = date("w", $day);

		                                if ($v['bid_week' . $week]) {
		                                    array_push($tp_planArr, array(
		                                        'date' => date('Y-m-d', $day),
		                                        'week' => $weekArr[$week],
		                                        'type' => $v['bid_week' . $week],
		                                        'state' => $day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
		                                    ));
		                                }
		                            }

		                            $resList[$k]['bid_plan'] = $tp_planArr;
		                        }
		                    }


		                    //智能刷新
		                    $refreshSmartState = (int)$v['refreshSmart'];
		                    if ($v['refreshSurplus'] <= 0) {
		                        $refreshSmartState = 0;
		                    }
		                    $resList[$k]['refreshSmart'] = $refreshSmartState;
		                    if ($refreshSmartState) {
		                        $resList[$k]['refreshCount']   = $v['refreshCount'];
		                        $resList[$k]['refreshTimes']   = $v['refreshTimes'];
		                        $resList[$k]['refreshPrice']   = $v['refreshPrice'];
		                        $resList[$k]['refreshBegan']   = $v['refreshBegan'];
		                        $resList[$k]['refreshNext']    = $v['refreshNext'];
		                        $resList[$k]['refreshSurplus'] = $v['refreshSurplus'];
		                    }
		                }

					}
					// echo '<pre>';
					// var_dump($resList);die;
					return array("pageInfo" => $pageinfo, "list" => $resList);
				}

			}
		}
	}



	/**
     * 顺风车获取
     * @return array

     */
	public function detail(){
		global $dsql;
		global $langData;
		global $userLogin;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree; //会员免费查看
        global $from;  //来源，用于判断是否来自APP源生页面

		$id = $this->param;
		$sfcarDetail = array();
		$id = is_numeric($id) ? $id : $id['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$userid  = $userLogin->getMemberID();/*当前登录id*/
		//判断是否管理员已经登录
        $where = "";


        // 此处是为了判断信息在未审核状态下，只有管理员和发布者可以在前台浏览
        if ($userid == -1) {

            $where = " AND `state` = 1";

            //如果没有登录再验证会员是否已经登录
            if ($userLogin->getMemberID() == -1) {
                $where = " AND `state` = 1";
            } else {
                $where = " AND (`state` = 1 OR `userid` = " . $userid . ")";
            }

        }

		$sfcarsql = $dsql->SetQuery("SELECT * FROM `#@__sfcar_list` WHERE 1 = 1 AND `id` = ".$id.$where);
		$sfcarres = $dsql->dsqlOper($sfcarsql,"results");

		//固定字段
		$itemsql = $dsql->SetQuery("SELECT * FROM `#@__sfcaritem` WHERE `parentid`!=0");

		$itemres = $dsql->dsqlOper($itemsql,"results");

		$itemarr = array_combine(array_column($itemres, 'id'), array_column($itemres, 'typename'));
		$tagarr  = array();
		$tagay  = array();
		if($sfcarres){

            require(HUONIAOINC . "/config/sfcar.inc.php");
            $displayConfig = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
                array('title' => '人找车', 'subtitle' => '乘用载货'),
                array('title' => '车找人', 'subtitle' => '找客找货'),
            );
            
			$sfcarDetail['id'] 			= $sfcarres[0]['id'];
			$sfcarDetail['cityid'] 		= $sfcarres[0]['cityid'];
			$sfcarDetail['type'] 		= $sfcarres[0]['type'];
			$sfcarDetail['typename']    = $sfcarres[0]['type'] == 0 ? $displayConfig[0]['title'] : $displayConfig[1]['title'];
			$sfcarDetail['missiontype'] = $sfcarres[0]['missiontype'];
			$sfcarDetail['userid'] 		= $sfcarres[0]['userid'];
			$sfcarDetail['title'] 		= "【".$sfcarDetail['typename']."】" . $sfcarres[0]['startaddr'] . " — " . $sfcarres[0]['endaddr'];

			if($sfcarres[0]['missiontype'] == 0){

				$ymdhis = explode(' ',$sfcarres[0]['missiontime']);
				$sfcarDetail['ymd']  	= $ymdhis[0];
				$sfcarDetail['his']  	= $ymdhis[1];
				$sfcarDetail['missiontime'] = $sfcarres[0]['missiontime'];

                $time 			= weekday(strtotime($sfcarres[0]['missiontime']));
                $sfcarDetail['missiontime1'] = "(".$time.")  ";

                $ymd = date('m月d日', GetMkTime($ymdhis[0]));
                $sfcarDetail['title'] .= "，" . $ymd . ' ' . $ymdhis[1] . '出发';

            }else{
				$ymdhis = explode(' ',$sfcarres[0]['missiontime']);
				$sfcarDetail['his']  	= $ymdhis[0];
				$sfcarDetail['missiontime'] = '天天发车 '.(strlen($sfcarres[0]['missiontime']) < 6 ? $sfcarres[0]['missiontime'] : date('H:i', GetMkTime($sfcarres[0]['missiontime'])));

                $sfcarDetail['title'] .= "，" . $sfcarDetail['missiontime'];
			}

            $time = GetMkTime(time());

            if ($sfcarres[0]['missiontype'] == 0 && GetMkTime($sfcarres[0]['missiontime']) < $time){
                $sfcarDetail["invalid"] = 1;
            }else{
                $sfcarDetail["invalid"] = 0;
            }
			$sfcarDetail['usetype'] 	= $sfcarres[0]['usetype'];
			$sfcarDetail['startaddrid'] = $sfcarres[0]['startaddrid'];
			$sfcarDetail['endaddrid'] 	= $sfcarres[0]['endaddrid'];
			if($sfcarres[0]['type'] == 1){

				if($sfcarres[0]['usetype'] == 0 ){
					$sfcarDetail['usetypename'] = '乘用车';
                    $sfcarDetail['title'] .= "（".$sfcarres[0]['carseat']."空位）";

				}else{
					$sfcarDetail['usetypename'] = '载货车';
                    $sfcarDetail['title'] .= "（货车）";
				}

			}else{

				if($sfcarres[0]['usetype'] == 0 ){
					$sfcarDetail['usetypename'] = '乘客';
                    $sfcarDetail['title'] .= "（".$sfcarres[0]['number']."人）";

				}else{
					$sfcarDetail['usetypename'] = '货物';
                    $sfcarDetail['title'] .= "（拉货）";
				}
			}
			$sfcarDetail['userid'] 		= $sfcarres[0]['userid'];
			$sfcarDetail['username'] 	= $sfcarres[0]['username'];

            //判断是否已经付过查看电话号码的费用
            $loginUserID = $userLogin->getMemberID();
            $loginUserInfo = $userLogin->getMemberInfo();
            $payPhoneState = $loginUserID == -1 ? 0 : 1;
            if($cfg_payPhoneState && in_array('sfcar', $cfg_payPhoneModule) && $loginUserID != $sfcarres[0]['userid']){

                //判断是否开启了会员免费
                if($cfg_payPhoneVipFree && $loginUserInfo['level']){
                    $payPhoneState = 1;
                }
                else{
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'sfcar' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $sfcarres[0]['id']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(!$ret){
                        $payPhoneState = 0;
                    }
                }
            }

            $sfcarDetail['payPhoneState'] = $payPhoneState; //当前信息是否支付过

			$sfcarDetail['tel'] 		= $sfcarres[0]['tel'] ? (!$payPhoneState && $cfg_payPhoneState && in_array('sfcar', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('sfcar', $cfg_privatenumberModule) && $loginUserID != $sfcarres[0]['userid'] ? '请使用隐私号' : $sfcarres[0]['tel'])) : '';
			$tag 						= $sfcarres[0]['tag'] ? explode(',',$sfcarres[0]['tag'])  : array() ;
			if($tag){

				foreach ($tag as $a => $b) {
						$tagay['id'] 		= $b;
						$tagay['typename'] 	= $itemarr[$b];
						array_push($tagarr, $tagay);

				}
			}
			$sfcarDetail['tag']         = $sfcarres[0]['tag'];
			$sfcarDetail['tagarr']      = $tagarr;
			$sfcarDetail['number'] 		= $sfcarres[0]['number'];
			$sfcarDetail['carseat'] 	= $sfcarres[0]['carseat'];

            global $isUserEdit;
			$sfcarDetail['note'] 		= $isUserEdit == "member" ? $sfcarres[0]['note'] : nl2br($sfcarres[0]['note']);

			$sfcarDetail['accessaddr']  = $sfcarres[0]['accessaddr'];
			$sfcarDetail['accessaddray']= $sfcarres[0]['accessaddr'] ? explode(',', $sfcarres[0]['accessaddr']):array();
			$sfcarDetail['cartype']  	= $sfcarres[0]['cartype'];
			$sfcarDetail['cartypename'] = $itemarr[$sfcarres[0]['cartype']];
			$sfcarDetail['startaddr']  	= $sfcarres[0]['startaddr'];
			$sfcarDetail['endaddr']  	= $sfcarres[0]['endaddr'];
			$sfcarDetail['endAddress'] 	= $sfcarres[0]['endAddress'];
			$sfcarDetail['startAdress'] = $sfcarres[0]['startAdress'];
			$sfcarDetail['onclick']  	= $sfcarres[0]['onclick'];
			$sfcarDetail['pubdate']  	= date("Y-m-d H:i",$sfcarres[0]['pubdate']);
			$sfcarDetail['piclsitt']  	= $sfcarres[0]['piclsit'];
			$sfcarDetail['state']  	    = $sfcarres[0]['state'];

			$piclsitarr = $sfcarres[0]['piclsit']!='' ? explode(',', $sfcarres[0]['piclsit']) : '';
			$piclsitarray = array();
			$piclsiay 	  = array();

			if($piclsitarr){

				for ($i=0; $i <count($piclsitarr) ; $i++) {
                    $_pic = explode('|', $piclsitarr[$i]);
					$piclsiay['pic'] = $_pic[0];
					$piclsiay['picpath'] = getFilePath($_pic[0]);
					$piclsiay['note'] = $_pic[1];

					array_push($piclsitarray,$piclsiay);
				}

			}
			$sfcarDetail['piclsit'] 	= $piclsitarray;


            $archives    = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `module` = 'sfcar' AND `action` = 'detail' AND `aid` = " . $id." AND `userid` = ".$userid);
            $collectnum  = $dsql->dsqlOper($archives, "results");
            $sfcarDetail['iscollect'] = is_array($collectnum) && !empty($collectnum) ? 1 : 0 ;

            //评论接口也会调用详情接口，导致阅读次数重复增加
            global $currentAction;
            if($_REQUEST['action'] != 'getComment' && $currentAction != 'getComment' && $_REQUEST['action'] != 'upList' && $currentAction != 'upList' && !$from){

                //更新阅读次数
                $sql = $dsql->SetQuery("UPDATE `#@__sfcar_list` SET `onclick` = `onclick` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$sfcarres[0]['userid']) {
                    $uphistoryarr = array(
                        'module'    => 'sfcar',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $sfcarres[0]['userid'],
                        'module2'   => 'detail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
            }

			return $sfcarDetail;

		}else{

			return array("state" => 200, "info" => $langData['siteConfig'][20][282]);//信息不存在
		}
	}

	public function del(){
		global $dsql;
		global $langData;
        global $userLogin;

        $userid  = $userLogin->getMemberID();/*当前登录id*/

        if ($userid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//'登录超时，请重新登录！'
        }

		$id = (int)$this->param['id'];

		if($id ==''){
			return array("state" => 200, "info" => $langData['car'][7][0]);//信息不存在
		}

		//删除表
		$archives = $dsql->SetQuery("DELETE FROM `#@__sfcar_list` WHERE `userid` = $userid AND `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			return array("state" => 200, "info" => $langData['sfcar'][2][43]);//信息不存在
		}else{
        
            //记录用户行为日志
            memberLog($userid, 'sfcar', '', $id, 'delete', '删除信息('.$id.')', '', $archives);

		    dataAsync("sfcar",$id);  // 删除顺风车
			return array("state" => 100, "info" => $langData['sfcar'][2][42]);//信息不存在

		}
	}

	/**
     * 顺风车字段
     * @return array
     */
	public function item(){
		global $dsql;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
        $results = getCache("sfcar_item_all", function() use($dsql, $type, $son, $page, $pageSize){
            return $dsql->getTypeList($type, "sfcaritem", $son, $page, $pageSize);
        }, 0, $type);
		if($results){
			return $results;
		}
	}

}
