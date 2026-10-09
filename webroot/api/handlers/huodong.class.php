<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 活动API接口
 *
 * @version        $Id: huodong.class.php 2016-12-22 上午10:43:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class huodong {
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
     * 贴吧基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/huodong.inc.php");

		global $cfg_fileUrl;                 //系统附件默认地址
		global $cfg_uploadDir;               //系统附件默认上传目录
		// global $customFtp;                //是否自定义FTP
		// global $custom_ftpState;          //FTP是否开启
		// global $custom_ftpUrl;            //远程附件地址
		// global $custom_ftpDir;            //FTP上传目录
		// global $custom_uploadDir;         //默认上传目录
		global $cfg_basehost;                //系统主域名
		global $cfg_hotline;                 //系统默认咨询热线

		// global $customChannelName;        //模块名称
		// global $customLogo;               //logo使用方式
		global $cfg_weblogo;                 //系统默认logo地址
		// global $customLogoUrl;            //logo地址
		// global $customSubDomain;          //访问方式
		// global $customChannelSwitch;      //模块状态
		// global $customCloseCause;         //模块禁用说明
		// global $customSeoTitle;           //seo标题
		// global $customSeoKeyword;         //seo关键字
		// global $customSeoDescription;     //seo描述
		// global $hotline_config;           //咨询热线配置
		// global $customHotline;            //咨询热线
		// global $customTemplate;           //模板风格

		// global $customUpload;             //上传配置是否自定义
		global $cfg_softSize;               //系统附件上传限制大小
		global $cfg_softType;               //系统附件上传类型限制
		global $cfg_thumbSize;             //系统缩略图上传限制大小
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

		// $domainInfo = getDomain('huodong', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('huodong', $customSubDomain);

        //分站自定义配置
        $ser = 'huodong';
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

			foreach($params as $key => $param){
				if($param == "channelName"){
					$return['channelName'] = str_replace('$city', $cityName, $customChannelName);
				}elseif($param == "logoUrl"){

					//自定义LOGO
					if($customLogo == 1){
						$customLogo = getAttachemntFile($customLogoUrl);
					}else{
						$customLogo = getAttachemntFile($cfg_weblogo);
					}

					$return['logoUrl'] = $customLogo;
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
				}
			}

		}else{

			//自定义LOGO
			if($customLogo == 1){
				$customLogo = getAttachemntFile($customLogoUrl);
			}else{
				$customLogo = getAttachemntFile($cfg_weblogo);
			}

			$return['channelName']   = str_replace('$city', $cityName, $customChannelName);
			$return['logoUrl']       = $customLogo;
			$return['subDomain']     = $customSubDomain;
			$return['channelDomain'] = $customChannelDomain;
			$return['channelSwitch'] = $customChannelSwitch;
			$return['closeCause']    = $customCloseCause;
			$return['title']         = str_replace('$city', $cityName, $customSeoTitle);
			$return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
			$return['description']   = str_replace('$city', $cityName, $customSeoDescription);
			$return['hotline']       = $hotline;
			$return['template']      = $customTemplate;
			$return['touchTemplate'] = $customTouchTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
		}

		return $return;

	}


	/**
     * 活动分类
     * @return array
     */
	public function type(){
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
		$results = $dsql->getTypeList($type, "huodong_type", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 活动地区
     * @return array
     */
	public function addr(){
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

		global $template;
		if($template && $template != 'page' && empty($type)){
			$type = getCityId();
		}
        //一级
        if(empty($type)){
            //可操作的城市，多个以,分隔
            $userLogin = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

            $cityArr = array();
            $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {

                    $lowerCount = array();
                    $sql   = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                    $ret   = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $lowerCount = $ret[0]['totalCount'];
                    }

                    array_push($cityArr, array(
                        "id" => $value['cid'],
                        "typename" => $value['typename'],
                        "pinyin" => $value['pinyin'],
                        "hot" => $value['hot'],
                        "lower" => $lowerCount
                    ));
                }
            }
            return $cityArr;

        }else {
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
            if ($results) {
                return $results;
            }
        }
	}


	/**
     * 活动列表
     * @return array
     */
	public function hlist(){
		global $dsql;
		global $userLogin;
		global $cfg_secureAccess;
		global $cfg_basehost;

		$pageinfo = $list = array();
		$typeid = $keywords = $addrid = $times = $orderby = $u = $uid = $state = $feetype = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid   = (int)$this->param['typeid'];
				$keywords = $this->param['keywords'];
				$addrid   = (int)$this->param['addrid'];
				$times    = $this->param['times'];
				$orderby  = $this->param['orderby'];
				$flag  	  = (int)$this->param['flag'];
				$u        = (int)$this->param['u'];
				$uid      = (int)$this->param['uid'];
				$fee_type = (int)$this->param['fee_type'];
				$state    = $this->param['state'];
				$feetype  = $this->param['feetype'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}

		//数据共享
		require(HUONIAOINC."/config/huodong.inc.php");
		$dataShare = (int)$customDataShare;

        $now = GetMkTime(time());

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid && $u !=1 && !$uid){
				$where .= " AND `cityid` = ".$cityid;
			}else{
				$where .= " AND `cityid` !=0 ";
			}
		}

		$userid = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1 && $u){
            if(!verificationStaff(array('module'=>'huodong','type'=>'1')))  return array("state" => 200, "info" => "商家权限验证失败！");  //商家权限验证失败！

            $userid = $userDetail['companyuid'];
        }

		//是否输出当前登录会员的信息
		if($u != 1){
			$where .= " AND l.`state` = 1 AND l.`waitpay` = 0";

            //列表只查询未结束的
            $time = time();
            $where .= " AND l.`end` > $time";
            
		}else{
			$where .= " AND l.`uid` = ".$userid;
			if($state != ""){
				$where1 = " AND l.`state` = ".$state;

                //活动中
                if($state == 3){
                    $where1 = " AND l.`state` = 1 AND l.`end` > $now";
                }
                //已结束
                elseif($state == 4){
                    $where1 = " AND l.`state` = 1 AND l.`end` < $now";
                }
			}

			// if(!verifyModuleAuth(array("module" => "huodong"))){
			// 	return array("state" => 200, "info" => '商家权限验证失败！');
			// }
		}

		//遍历分类
		if(!empty($typeid)){
			if($dsql->getTypeList($typeid, "huodong_type")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($typeid, "huodong_type"));
				$lower = $typeid.",".join(',',$lower);
			}else{
				$lower = $typeid;
			}
			$where .= " AND `typeid` in ($lower)";
		}

		//标签

		if($flag!=""){
			$where .=" AND FIND_IN_SET(".$flag.",`flag`)";
		}



		//模糊查询关键字
		if(!empty($keywords)){

			//搜索记录
			siteSearchLog("huodong", $keywords);

			$keywords = explode(" ", $keywords);
			$w = array();
			foreach ($keywords as $k => $v) {
				if(!empty($v)){
					$w[] = "`title` like '%".$v."%'";
				}
			}
			$where .= " AND (".join(" OR ", $w).")";
		}

		//遍历区域
		if(!empty($addrid)){
			if($dsql->getTypeList($addrid, "site_area")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$lower = $addrid.",".join(',',$lower);
			}else{
				$lower = $addrid;
			}
			$where .= " AND `addrid` in ($lower)";
		}
        //当天
        $todayk = strtotime(date('Y-m-d'));

        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));
        //昨天时间戳
        $time1 = strtotime(date('Y-m-d 00:00:00',time()-3600*24));
        $time2 = strtotime(date('Y-m-d 23:59:59',time()-3600*24));

        $start_time = mktime(0,0,0,date('m'),date('d'),date('Y'))+86400;  //明天开始
        $end_time = mktime(0,0,0,date('m'),date('d')+1,date('Y'))-1+86400; //明天结束

        //本周时间戳
        $time3 = mktime(0,0,0,date('m'),date('d')-date('N')+1,date('y'));
        $time4 = mktime(23,59,59,date('m'),date('d')-date('N')+7,date('Y'));

        $BeginDate = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
        $overDate  = date('Y-m-d', strtotime("$BeginDate +1 month"));//本月最后一天
        $btime     = strtotime($BeginDate);
        $ovtime    = strtotime($overDate);

		//时间筛选
		$time = GetMkTime(date("Y-m-d", time()));
		if(!empty($times)){

			//今天
			if($times == "today"){
				$where .= " AND `began` > $todayk AND `began` < $todaye";

			//明天
			}elseif($times == "tomorrow"){
				$where .= " AND `began` > $start_time AND `began` < $end_time";

			//一周以内
			}elseif($times == "week"){
				$where .= " AND `began` > $time3 AND `began` < $time4 AND `began` >= $time";

			//一月以内
			}elseif($times == "month"){
				$where .= " AND `began` > $btime AND `began` < $ovtime AND `began` >= $time AND `began` >= $time";

			//其他日期
			}else{
				$time = GetMkTime($times);
				if($time){
					$where .= " AND `began` = $time";
				}else{
					$where .= " AND 1 = 2";
				}
			}

		}

		//收费类型
		if($feetype != ""){
            $feetype = $feetype == 0 ? 1 : 0;
			$where .= " AND `feetype` = $feetype";
		}

		//指定会员的数据
		if(!empty($uid)){
			$where .= " AND `uid` = $uid";
		}

		$order = " ORDER BY `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//评论排行
		if($orderby == "reply"){
			$order = " ORDER BY reply DESC, `id` DESC";
		}
		if($orderby == "reg"){
			$order = " ORDER BY reg DESC, `id` DESC";
		}
		if($orderby == "click"){
			$order = " ORDER BY l.`click` DESC, `id` DESC";
		}

		if ($orderby == "pubdate") {
			$order = " ORDER BY l.`pubdate` DESC";
		}

		if($orderby =="suiji"){
			$order = " ORDER BY RAND()";
		}

		$archives = $dsql->SetQuery("SELECT l.`id`, l.`typeid`, l.`uid`, l.`title`, l.`litpic`, l.`began`, l.`end`, l.`baoming`, l.`baomingend`, l.`addrid`, l.`address`, l.`click`, l.`feetype`, l.`state`, l.`pubdate`, (SELECT COUNT(`id`)  FROM `#@__public_comment_all` WHERE `aid` = l.`id` AND `ischeck` = 1 AND `type` = 'huodong-detail' AND `pid` = 0) AS reply, (SELECT COUNT(`id`)  FROM `#@__huodong_reg` WHERE `hid` = l.`id` AND (`state` = 1 OR `state` = 2)) AS reg, l.`waitpay` FROM `#@__huodong_list` l WHERE 1 = 1".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__huodong_list` l WHERE 1 = 1".$where);

		//总条数
		$totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		$totalCount = (int)$totalResults[0][0];

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		//会员列表需要统计信息状态
		if($u == 1 && $userid > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND l.`state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND l.`state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND l.`state` = 2", "totalCount");
			//活动中
			$totalOngoing = $dsql->dsqlOper($archives." AND l.`state` = 1 AND l.`end` > $now", "totalCount");
			//已结束
			$totalEnded = $dsql->dsqlOper($archives." AND l.`state` = 1 AND l.`end` < $now", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
			$pageinfo['ongoing'] = $totalOngoing;
			$pageinfo['ended'] = $totalEnded;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		// var_dump($archives.$where1.$order.$where);die;
		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");
		$isMobile = isMobile();

		//当前登录会员ID
        $loginid = $userLogin->getMemberID();
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']     = $val['id'];

				//分类
				$list[$key]['typeid'] = $val['typeid'];
				global $data;
				$data = "";
				$typeArr = getParentArr("huodong_type", $val['typeid']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$list[$key]['typename']= $typeArr;

				//区域
				$list[$key]['addrid'] = $val['addrid'];
				global $data;
				$data = "";
				$addrArr = getParentArr("site_area", $val['addrid']);
				$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
				$list[$key]['addrname']= $addrArr;

				//会员信息
				$list[$key]['uid']    = $val['uid'];
				$username = $photo = "";
				$sql = $dsql->SetQuery("SELECT `mtype`,`level`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` = ".$val['uid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['mtype'] == 2 && !empty($ret[0]['company']) ? $ret[0]['company'] : $ret[0]['nickname'];
					$photo    = getFilePath($ret[0]['photo']);
				}
				$list[$key]['username']  	= $username;
				$list[$key]['usermtype']  	= $ret[0]['mtype'];
				$list[$key]['userlevel']  	= $ret[0]['level'];
				$list[$key]['userphoto'] 	= $photo;

				$list[$key]['title']      = $val['title'];
				$list[$key]['litpic']     = getFilePath($val['litpic']);
				$list[$key]['began']      = $val['began'];
				$list[$key]['end']        = $val['end'];
				$list[$key]['baoming']    = $val['baoming'];
				$list[$key]['baomingend'] = $val['baomingend'];
				$list[$key]['address']    = $val['address'];
				$list[$key]['click']      = $val['click'];
				$list[$key]['feetype']    = $val['feetype'];
				$list[$key]['pubdate']    = $val['pubdate'];

				//统计粉丝数量
	            $countsql  = $dsql->SetQuery("SELECT count(`id`) fansall FROM `#@__member_follow` WHERE `fid` =".$val['uid']);
	            $countres  = $dsql->dsqlOper($countsql,"results");
	         	//判断是否互相关注
	            if($loginid != -1){
	                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $loginid AND `fid` = ".$val['uid']);
	                $ret = $dsql->dsqlOper($sql, "results");
	                $isfollow = 0;
	                if($ret && is_array($ret)){
	                    $isfollow = 1;
	                }
	            }
	            //活动发布数量
	            $hdsql = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__huodong_list` WHERE `uid` = ".$val['uid']);
	            $hdres = $dsql->dsqlOper($hdsql,"results");

	            $list[$key]['fansall'] 		= $countres[0]['fansall'];
	            $list[$key]['isfollow']  	= $isfollow;
	            $list[$key]['hdcount']  	= $hdres[0]['countall'];

				//最低费用
				if($val['feetype']){
					$mprice = array();
					$sql = $dsql->SetQuery("SELECT `price` FROM `#@__huodong_fee` WHERE `hid` = ".$val['id']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						foreach ($ret as $k => $v) {
							array_push($mprice, $v['price']);
						}
					}
					$list[$key]['mprice'] = min($mprice);
				}


				//会员中心显示信息状态
				if($u == 1 && $userLogin->getMemberID() > -1){
					$list[$key]['state'] = $val['state'];
					$list[$key]['waitpay'] = $val['waitpay'];
				}

				$list[$key]['reply'] = $val['reply'];
				$list[$key]['reg']   = $val['reg'];

				$param = array(
					"service"     => "huodong",
					"template"    => "detail",
					"id"          => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);

				if($list[$key]['usermtype'] == 2){
					//商家id
					$businesssql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$val['uid']);
					$businessres = $dsql->dsqlOper($businesssql,"results");
					$param = array(
						"service"  => "business",
						"template" => "huodong",
						"id"       => $businessres[0]['id']
					);

					$list[$key]['memberurl'] = getUrlPath($param);
				}else{
					if ($isMobile) {
						$list[$key]['memberurl'] = $cfg_secureAccess . $cfg_basehost . '/user/'.$val['uid']."?qmodule=huodong";
					}else{
						$list[$key]['memberurl'] = $cfg_secureAccess . $cfg_basehost . '/user/'.$val['uid'].'/fabu.html?qmodule=huodong';
					}
				}

				//报名人数
				$reg = 0;
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__huodong_reg` WHERE `hid` = ".$val['id']." AND (`state` = 1 || `state` = 2)");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$reg = $ret[0]['t'];
				}
				$list[$key]['reg'] = $reg;

				//报名截止天数
				$now = GetMkTime(time());
				$list[$key]["surplus"] = ($val['baoming'] ? $val['end'] : $val['baomingend']) - $now;

			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 活动详细
     * @return array
     */
	public function detail(){
		global $dsql;
		global $userLogin;
		global $cfg_secureAccess;
		global $cfg_basehost;

		$detail = array();
		$id = $this->param;
       if(is_array($id)){
           $id = $id['id'];
       }
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//判断是否管理员已经登录
		//功能点：管理员和信息的发布者可以查看所有状态的信息
		$where = "";
		if($userLogin->getUserID() == -1){

			$where = " AND `state` = 1";

			//如果没有登录再验证会员是否已经登录
			if($userLogin->getMemberID() == -1){
				$where = " AND `state` = 1";
			}else{
				$where = " AND (`state` = 1 OR `uid` = ".$userLogin->getMemberID().")";
			}

		}
		$where .= " AND `waitpay` = 0";

		//当前登录会员ID
        $loginid = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();


        // if($userDetail['is_staff'] == 1){
        //     if(!verificationStaff(array('module'=>'huodong','type'=>'1')))  return array("state" => 200, "info" => "商家权限验证失败");  //商家权限验证失败！
		//
        //     $loginid = $userDetail['companyuid'];
        // }

		$archives = $dsql->SetQuery("SELECT * FROM `#@__huodong_list` WHERE `id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$detail["id"]          = $results[0]['id'];
			$detail["uid"]         = $results[0]['uid'];

			//父级ID
			$pid = 0;
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__huodong_type` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$pid = $ret[0]['parentid'];
			}

			$detail["pid"]         = $pid;
			$detail["cityid"]      = $results[0]['cityid'];
			$detail["sign"]      = $results[0]['sign'];
			$detail["state"]       = $results[0]['state'];
			$detail["typeid"]      = $results[0]['typeid'];
			$detail["title"]       = $results[0]['title'];
			$detail["litpic"]      = getFilePath($results[0]['litpic']);
			$detail["litpicSource"] = !empty($results[0]['litpic']) ? $results[0]['litpic'] : "";
			$detail["began"]       = $results[0]['began'];
			$detail["end"]         = $results[0]['end'];
			$detail["baoming"]     = $results[0]['baoming'];
			$detail["baomingend"]  = $results[0]['baomingend'];
			$detail["addrid"]      = $results[0]['addrid'];
			$detail["address"]     = $results[0]['address'];
			$detail["body"]        = nl2br($results[0]['body']);
			$detail["feetype"]     = $results[0]['feetype'];
			$detail["max"]         = $results[0]['max'];
			$detail["contact"]     = $results[0]['contact'];
			$detail["click"]       = $results[0]['click'];
			$detail["pubdate"]     = $results[0]['pubdate'];
			$detail["lng"]     	   = $results[0]['lng'];
			$detail["lat"]         = $results[0]['lat'];
			$detail["property"]    = $results[0]['property'] ? unserialize($results[0]['property']) : array();

			//报名截止天数
			$now = GetMkTime(time());
			$detail["surplus"] = ($results[0]['baoming'] ? $results[0]['end'] : $results[0]['baomingend']) - $now;

			//会员名
			$username = "";
			$photo = "";
			$sql = $dsql->SetQuery("SELECT `mtype`, `nickname`, `company`, `photo`,`mtype` FROM `#@__member` WHERE `id` = ".$results[0]['uid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['mtype'] && !empty($ret[0]['company']) ? $ret[0]['company'] : $ret[0]['nickname'];
				$photo    = $ret[0]['photo'];
				$mtype    = $ret[0]['mtype'];
			}

			$detail['uid']  = $results[0]['uid'];

			//举办过的活动&参与人数统计
			$huodongCount = 0;
			$regCount = 0;
			$sql = $dsql->SetQuery("SELECT count(l.`id`) lcount FROM `#@__huodong_list` l WHERE l.`uid` = ".$results[0]['uid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huodongCount = $ret[0]['lcount'];
			}
			$sql = $dsql->SetQuery("SELECT count(r.`id`) rcount FROM `#@__huodong_reg` r LEFT JOIN `#@__huodong_list` l ON l.`id` = r.`hid` WHERE (r.`state` = 1 || r.`state` = 2) AND l.`uid` = ".$results[0]['uid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$regCount = $ret[0]['rcount'];
			}

			//统计粉丝数量
            $countsql  = $dsql->SetQuery("SELECT count(`id`) fansall FROM `#@__member_follow` WHERE `fid` =".$results[0]['uid']);
            $countres  = $dsql->dsqlOper($countsql,"results");

         	//判断是否互相关注
            if($loginid != -1){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $loginid AND `fid` = ".$results[0]['uid']);
                $ret = $dsql->dsqlOper($sql, "results");
                $isfollow = 0;
                if($ret && is_array($ret)){
                    $isfollow = 1;
                }
            }
           	$isMobile = isMobile();
           	if($mtype == 2){
					//商家id
					$businesssql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$results[0]['uid']);
					$businessres = $dsql->dsqlOper($businesssql,"results");
					$param = array(
						"service"  => "business",
						"template" => "huodong",
						"id"       => $businessres[0]['id']
					);

					$memberurl = getUrlPath($param);
				}else{
					if ($isMobile) {
						$memberurl = $cfg_secureAccess . $cfg_basehost . '/user/'.$results[0]['uid']."?qmodule=huodong";
					}else{
						$memberurl = $cfg_secureAccess . $cfg_basehost . '/user/'.$results[0]['uid'].'/fabu.html?qmodule=huodong';
					}
				}
			$detail['user'] = array(
				"username" 		=> $username,
				"photo"    		=> getFilePath($photo),
				"huodongCount" 	=> (int)$huodongCount,
				"regCount" 		=> (int)$regCount,
				"fansCount" 	=> (int)$countres[0]['fansall'],
				"memberurl"		=> $memberurl,
                "isfollow"      => (int)$isfollow
			);
			//分类名称
			global $data;
			$data = "";
			$typeArr = getParentArr("huodong_type", $results[0]['typeid']);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
			$detail['typeid']    = $results[0]['typeid'];
			$detail['typename']  = $typeArr;

			//区域名称
			global $data;
			$data = "";
			$detail['addrid'] = $results[0]['addrid'];
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $results[0]['addrid']);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
      		$detail['addrname'] = $addrArr;

			//报名人数
			$reg = 0;
			$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__huodong_reg` WHERE `hid` = $id AND (`state` = 1 || `state` = 2)");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$reg = $ret[0]['t'];
			}
			$detail['reg'] = $reg;

			//评论人数
			$reply = 0;
			$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'huodong-detail' AND `aid` = '$id' AND `pid` = 0");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$reply = $ret[0]['t'];
			}
			$detail['reply'] = $reply;

			//收藏人数
			$collectsql = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__member_collect` WHERE `module` like '%huodong%' AND `aid` = ".$id);
			$collectres = $dsql->dsqlOper($collectsql,"results");

			$detail['countcollect'] = $collectres[0]['countall'];
			//电子票
			if($results[0]['feetype'] == 1){
				$feeList = array();
				$sql = $dsql->SetQuery("SELECT f.`id`, f.`title`, f.`price`, f.`max`, (SELECT count(`id`) FROM `#@__huodong_reg` WHERE `hid` = $id AND `fid` = f.`id` AND (`state` = 1 OR `state` = 2)) reg FROM `#@__huodong_fee` f WHERE `hid` = $id ORDER BY `id` ASC");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $key => $value) {
						array_push($feeList, array(
							"id" => $value['id'],
							"title" => $value['title'],
							"price" => $value['price'],
							"max"   => $value['max'],
							"reg"   => $value['reg']
						));
					}
				}
				$pricearr = array_column($feeList, 'price');
				$detail['minprice']	= min($pricearr);
				$detail['feeList'] 	= $feeList;
			}

			//查询是否已经报名
			$isbaoming = 0;
			$uid = $userLogin->getMemberID();
			if($uid != -1){
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_reg` WHERE `hid` = $id AND `uid` = $uid AND `state` = 1");
				$ret = $dsql->dsqlOper($sql, "totalCount");
				if($ret > 0){
					$isbaoming = 1;
				}
			}
			$detail['isbaoming'] = $isbaoming;


			//验证是否已经收藏
			if($uid != -1){
				$params = array(
					"module" => "huodong",
					"temp"   => "detail",
					"type"   => "add",
					"id"     => $id,
					"check"  => 1
				);
				$collect = checkIsCollect($params);
			}else{
				$collect = 'no';
			}
			$detail['collect'] = $collect;

		}
		return $detail;
	}


	/**
     * 主办方列表
     * @return array
     */
	public function organizer(){
		global $dsql;
		global $userLogin;
		global $cfg_secureAccess;
		global $cfg_basehost;

		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     		= $this->param['page'];
				$orderby  		= $this->param['orderby'];
				$orderbyfans  	= $this->param['orderbyfans'];
				$pageSize 		= $this->param['pageSize'];
			}
		}

		$order    = " ORDER BY count DESC";
		// if($orderby!=""){
		// 	$order    = " ORDER BY reg DESC";
		// }
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//数据共享
        $_where = '';
		require(HUONIAOINC."/config/huodong.inc.php");
		$dataShare = (int)$customDataShare;
		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				$_where .= " AND m.`cityid` = ".$cityid;
			}else{
				$_where .= " AND m.`cityid` != 0 ";
			}
		}

		$archives = $dsql->SetQuery("SELECT l.`uid`, count(l.`id`) as count, m.`photo`, m.`mtype`, m.`nickname`, m.`company`,m.`level`, (SELECT COUNT(`id`)  FROM `#@__huodong_reg` WHERE `hid` = l.`id` ) AS reg  FROM `#@__huodong_list` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1 = 1 AND m.`id` IS NOT NULL ".$_where." GROUP BY l.`uid`");


		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		if($orderby ==''){
			$where = " LIMIT $atpage, $pageSize";
		}
		// var_dump($archives.$order.$where);die;
		$results = $dsql->dsqlOper($archives.$order.$where, "results");
		//当前登录会员ID
        $loginid = $userLogin->getMemberID();
        $isMobile = isMobile();
		if($results){
			foreach($results as $key => $val){
				$list[$key]['uid']    = $val['uid'];
				$list[$key]['count']  = $val['count'];

				$list[$key]['nickname'] = $val['mtype'] && !empty($val['company']) ? $val['company'] : $val['nickname'];
				$list[$key]['photo']    = getFilePath($val['photo']);

				$list[$key]['usermtype']  = $val['mtype'];
				$list[$key]['userlevel']   = $val['level'];
				//回复数量
				$reg = 0;
				$sql = $dsql->SetQuery("SELECT count(r.`id`) count FROM `#@__huodong_reg` r LEFT JOIN `#@__huodong_list` l ON l.`id` = r.`hid` WHERE l.`uid` = ".$val['uid']);
				$ret = $dsql->dsqlOper($sql, "results");

				if($ret){
					$reg = $ret[0]['count'];
				}

				$list[$key]['reg'] = $reg;
				if($list[$key]['usermtype'] == 2){
					//商家id
					$businesssql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$val['uid']);
					$businessres = $dsql->dsqlOper($businesssql,"results");
					$param = array(
						"service"  => "business",
						"template" => "huodong",
						"id"       => $businessres[0]['id']
					);

					$list[$key]['url'] = getUrlPath($param);
				}else{
					if ($isMobile) {
						$list[$key]['url'] = $cfg_secureAccess . $cfg_basehost . '/user/'.$val['uid']."?qmodule=huodong";
					}else{
						$list[$key]['url'] = $cfg_secureAccess . $cfg_basehost . '/user/'.$val['uid'].'/fabu.html?qmodule=huodong';
					}
				}

	            //统计粉丝数量
	            $countsql  = $dsql->SetQuery("SELECT count(`id`) fansall FROM `#@__member_follow` WHERE `fid` =".$val['uid']);
	            $countres  = $dsql->dsqlOper($countsql,"results");
	            $list[$key]['fansall']  = $countres? $countres[0]['fansall'] >=10000 ? ($countres[0]['fansall']/10000)."万": $countres[0]['fansall'] : 0;

	            //判断是否互相关注
                if($loginid != -1){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $loginid AND `fid` = ".$val['uid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $list[$key]['isfollow'] = 0;
                    if($ret && is_array($ret)){
                        $list[$key]['isfollow'] = 1;
                    }
                }
			}
		}
		//参与榜第一个处理活动
		if( $orderby == "reg"){
			array_multisort(array_column($list, 'reg'),SORT_DESC,$list);
			foreach ($list as $key => &$value) {

					if($key == 0){
						$hdsql = $dsql->SetQuery("SELECT l.`id`,l.`title`,l.`litpic`,count(r.`id`) regnum FROM `#@__huodong_list`l LEFT JOIN `#@__huodong_reg` r ON r.`hid` = l.`id` WHERE  l.`uid` =  ".$value['uid']." ORDER BY `pubdate` DESC LIMIT 0,1" );
						$hdres = $dsql->dsqlOper($hdsql,"results");
						$hdres[0]['litpic'] = getFilePath($hdres[0]['litpic']);
						$value['hdarr'] = $hdres;
					}
				}
			return array("pageInfo" => $pageinfo, "list" => $list);

		}

		//粉丝
		if($orderby == "fans"){
			// echo '222222';
			array_multisort(array_column($list, 'fansall'),SORT_DESC,$list);
			foreach ($list as $key => &$value) {

					if($key == 0){
						$hdsql = $dsql->SetQuery("SELECT l.`id`,l.`title`,l.`litpic`,count(r.`id`) regnum FROM `#@__huodong_list`l LEFT JOIN `#@__huodong_reg` r ON r.`hid` = l.`id` WHERE  l.`uid` =  ".$value['uid']." ORDER BY `pubdate` DESC LIMIT 0,1" );
						$hdres = $dsql->dsqlOper($hdsql,"results");
						$hdres[0]['litpic'] = getFilePath($hdres[0]['litpic']);
						$value['hdarr'] = $hdres;
					}
				}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 评论列表
     * @return array
     */
	public function reply(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$hid = $uid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$hid      = $this->param['hid'];
				$uid      = $this->param['uid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if(empty($hid)) return array("state" => 200, "info" => '格式错误！');

		$where = " `state` = 1 AND `rid` = 0 AND `hid` = ".$hid;

		//指定会员ID
		if(!empty($uid)){
			$where .= " AND `uid` = ".$uid;
		}

		$order    = " ORDER BY `id` DESC";
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `uid`, `content`, `pubdate` FROM `#@__huodong_reply` WHERE ".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__huodong_reply` l WHERE ".$where);

		//总条数
		$totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		$totalCount = (int)$totalResults[0][0];

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$order.$where, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']     = $val['id'];
				$list[$key]['uid']    = $val['uid'];

				$list[$key]['content']  = $val['content'];
				$list[$key]['pubdate']  = $val['pubdate'];
				$list[$key]['floortime'] = FloorTime(GetMkTime(time()) - $val['pubdate'], 2);

				//回复数量
				$reply = 0;
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_reply` WHERE `state` = 1 AND `rid` = ".$val['id']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$reply = $ret[0]['t'];
				}
				$list[$key]['reply'] = $reply;

				//发布者信息
				$member = array();
				$memberID = $val['uid'];
				if($memberID){
					$memberInfo = $userLogin->getMemberInfo($memberID);
					if(is_array($memberInfo)){
						$member = array(
							"id" => $memberID,
							"photo" => $memberInfo['photo'],
							"nickname" => $memberInfo['nickname']
						);
					}
				}
				$list[$key]['member'] = $member;

				$list[$key]['lower']  = $this->getReplyList($val['id']);
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
	 * 遍历评论子级
	 * @param $id int 评论ID
	 * @return array
	 */
	function getReplyList($id){
		if(empty($id)) return false;
		global $dsql;
		global $userLogin;

		$archives = $dsql->SetQuery("SELECT `id`, `uid`, `content`, `pubdate` FROM `#@__huodong_reply` WHERE `state` = 1 AND `rid` = ".$id);
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		if($totalCount > 0){
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$list[$key]['id']     = $val['id'];
					$list[$key]['uid']    = $val['uid'];

					$list[$key]['content']  = $val['content'];
					$list[$key]['pubdate']  = $val['pubdate'];
					$list[$key]['floortime'] = FloorTime(GetMkTime(time()) - $val['pubdate'], 2);

					//回复数量
					$reply = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_reply` WHERE `state` = 1 AND `rid` = ".$val['id']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$reply = $ret[0]['t'];
					}
					$list[$key]['reply'] = $reply;

					//发布者信息
					$member = array();
					$memberID = $val['uid'];
					if($memberID){
						$memberInfo = $userLogin->getMemberInfo($memberID);
						if(is_array($memberInfo)){
							$member = array(
								"id" => $memberID,
								"photo" => $memberInfo['photo'],
								"nickname" => $memberInfo['nickname']
							);
						}
					}
					$list[$key]['member'] = $member;

					$list[$key]['lower']  = $this->getReplyList($val['id']);
				}
				return $list;
			}
		}
	}


	/**
		* 发表回复
		* @return array
		*/
	public function sendReply(){
		global $dsql;
		global $userLogin;

		$param = $this->param;

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$hid   = $param['hid'];
		$rid   = $param['rid'];
		$content = filterSensitiveWords($param['content']);
		$content = cn_substrR($content, 200);

		$ip = GetIp();
		$pubdate = GetMkTime(time());

		include HUONIAOINC."/config/huodong.inc.php";
		$state = (int)$customCommentCheck;

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__huodong_reply` (`hid`, `rid`, `uid`, `content`, `pubdate`, `ip`, `state`) VALUES ('$hid', '$rid', '$uid', '$content', '$pubdate', '$ip', '$state')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

			$info = array();
			$memberInfo = $userLogin->getMemberInfo($uid);
			if(is_array($memberInfo)){
				$info = array(
					"id" => $uid,
					"aid" => $aid,
					"photo" => $memberInfo['photo'],
					"nickname" => $memberInfo['nickname'],
					"content" => $content,
					"pubdate" => FloorTime(GetMkTime(time()) - $pubdate, 2),
					"state"   => $state
				);
			}
			return $info;

		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
		}

	}


	/**
		* 报名
		* @return array
		*/
	public function join(){
		global $dsql;
		global $userLogin;

		$param = $this->param;
		$id = (int)$param['id'];
		$fid = (int)$param['fid'];
		$property = json_decode($param['data'], true);
		$time = GetMkTime(time());

		if(empty($id)) return array("state" => 200, "info" => '活动参数传递错误，报名失败！');

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');

		if(!is_array($property)) return array("state" => 200, "info" => '请填写报名信息');

		array_push($property, array(
			'areaCode' => $param['areaCode']
		));

        //验证手机号码
        if($param['areaCode'] == 86){
            foreach($property as $key => $val){
                $_key = array_keys($val);
                $_val = array_values($val);
                if($_key[0] == '手机'){
                    // $phone = substr($_val[0], 0, 11);
                    preg_match('/0?(13|14|15|16|17|18|19)[0-9]{9}$/', $_val[0], $matchPhone);
                    if (!$matchPhone) {
                        return array("state" => 200, "info" => '手机号码格式错误！');
                    }
                }
            }
        }

		$property = serialize($property);

		//验证是否已经报名
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_reg` WHERE `hid` = $id AND `uid` = $uid AND `state` = 1");
		$ret = $dsql->dsqlOper($sql, "totalCount");
		if($ret > 0) return array("state" => 200, "info" => '您已经报过名，无须重复提交！');

		//查询活动ID
		$sql = $dsql->SetQuery("SELECT l.`title`, l.`began`, l.`end`, l.`addrid`, l.`address`, l.`baoming`, l.`baomingend`, l.`feetype`, l.`max`, l.`uid`, (SELECT count(`id`) FROM `#@__huodong_reg` r WHERE r.`hid` = $id AND r.`state` = 1) reg FROM `#@__huodong_list` l WHERE l.`state` = 1 AND l.`id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");

		$ordernum = create_ordernum();
		if($ret){

			$ret = $ret[0];
			$huodong = $ret['title'];
            $began = $ret['began'];
            $addrid = $ret['addrid'];
            $address = $ret['address'];
            $sid = $ret['uid'];
			$end  = $ret['baoming'] ? $ret['end'] : $ret['baomingend'];

			if($time > $end) return array("state" => 200, "info" => '报名时间已经截止，报名失败！');

            //区域名称
            global $data;
            $data = "";
            $addrArr = getParentArr("site_area", $addrid);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $addrname = array_slice($addrArr, -2);

            $address = join(' ', $addrname) . " " . $address;

            $times = date('Y-m-d H:i:s', $began) . ' - ' . date('Y-m-d H:i:s', $ret['end']);
            
            //报名人信息
            $user = $userLogin->getMemberInfo($uid);

            //报名成功通知-通知报名人
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "huodong-join"
            );

            //自定义配置
            $data = array(
                "user" => $user['nickname'],
                "title" => $huodong,
                "times" => $times,
                "began" => date('Y-m-d H:i:s', $began),
                "end" => date('Y-m-d H:i:s', $ret['end']),
                "address" => $address,
                "fields" => array(
                    'keyword1' => '活动名称',
                    'keyword2' => '活动时间',
                    'keyword3' => '活动地点',
                    'keyword4' => '会员姓名'
                )
            );

                
            //通知主办方
            $param_s = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "huodong-reg-" . $id
            );

            //自定义配置
            $data_s = array(
                "user" => $user['nickname'],
                "title" => $huodong,
                "times" => $times,
                "address" => $address,
                "fields" => array(
                    'keyword1' => '活动名称',
                    'keyword2' => '活动时间',
                    'keyword3' => '活动地点',
                    'keyword4' => '会员姓名'
                )
            );

			//收费类型，验证余票
			if($ret['feetype']){

				$sql = $dsql->SetQuery("SELECT f.`id`,f.`title`, f.`price`, f.`max`, (SELECT count(`id`) FROM `#@__huodong_reg` WHERE `hid` = $id AND `fid` = $fid AND (`state` = 1 OR `state` = 2)) reg FROM `#@__huodong_fee` f WHERE f.`hid` = $id AND f.`id` = $fid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$fee = $ret[0];
					if($fee['reg'] >= $fee['max'] && $fee['max'] != 0){
						return array("state" => 200, "info" => '名额已经用完，报名失败！');
					}

					//如果是免费的直接报名成功
					if($fee['price'] <= 0){
						$cardnum = genSecret(12, 1);
						$sql = $dsql->SetQuery("INSERT INTO `#@__huodong_reg` (`hid`, `fid`, `uid`, `date`, `property`, `code`) VALUES ('$id', '$fid', '$uid', '$time', '$property', '$cardnum')");
						$ret = $dsql->dsqlOper($sql, "lastid");
						if(is_numeric($ret)){
                            autoShowUserModule($uid,'huodong');  // 报名付费活动
                            updateMemberNotice($uid, "活动-报名成功通知", $param, $data);
                            updateMemberNotice($sid, "活动-有新的报名通知", $param_s, $data_s);

							return "报名成功！";
						}else{
							return array("state" => 200, "info" => '程序错误，报名失败！');
						}
					}else{

						$archives = $dsql->SetQuery("INSERT INTO `#@__huodong_order` (`ordernum`, `uid`, `hid`, `fid`, `price`, `date`, `state`, `paytype`, `point`, `balance`, `payprice`, `property`) VALUES ('$ordernum', '$uid', '$id', '$fid', '".$fee['price']."', ".GetMkTime(time()).", 0, '', 0, 0, 0, '$property')");

						$return = $dsql->dsqlOper($archives, "update");


					}

					//返回下单页面
//					$param = array(
//						"service"  => "huodong",
//						"template" => "order",
//						"id"       => $id,
//						"fid"      => $fid,
//						"ordernum" => $ordernum,
//						"param"    => "data=".urlencode($property)
//					);
//					return getUrlPath($param);
					if ($fee['price'] > 0 ){
                        $param = array(
                            "userid" => $uid,
                            "amount" => $fee['price'],
                            "balance" => $fee['price'],
                            "module" => 'huodong',
                            "ordernum" => $ordernum
                        );
                        $order = createPayForm("huodong", $ordernum, $fee['price'], '', '活动报名',$param,1);

                        $order['timeout'] =  GetMkTime(time()) + 1800;
                        $order['aid']     = $fee['id'];
                        return  $order;
                    }

				}else{
					return array("state" => 200, "info" => '报名失败，收费项不存在，请确认后重试！');
				}

			//免费类型的报名成功，添加报名数据
			}else{

				//验证余票
				if($ret['max'] <= $ret['reg']){
					return array("state" => 200, "info" => '名额已经用完，报名失败！');
				}

				$cardnum = genSecret(12, 1);
				$sql = $dsql->SetQuery("INSERT INTO `#@__huodong_reg` (`hid`, `fid`, `uid`, `date`, `property`, `code`) VALUES ('$id', '$fid', '$uid', '$time', '$property', '$cardnum')");
				$ret = $dsql->dsqlOper($sql, "lastid");
				if(is_numeric($ret)){
                
                    //记录用户行为日志
                    memberLog($uid, 'huodong', 'order', $ret, 'insert', '活动报名('.$huodong.')', '', $sql);

                    autoShowUserModule($uid,'huodong');  // 报名免费活动
                    updateMemberNotice($uid, "活动-报名成功通知", $param, $data);
                    updateMemberNotice($sid, "活动-有新的报名通知", $param_s, $data_s);

					return "报名成功！";
				}else{
					return array("state" => 200, "info" => '程序错误，报名失败！');
				}
			}

		}else{
			return array("state" => 200, "info" => '活动不存在，报名失败！');
		}

	}



	/**
		* 支付
		* @return array
		*/
	public function pay(){
		global $dsql;
		global $userLogin;




		$param 		= $this->param;
		$id 		= (int)$param['id'];
		$fid 		= (int)$param['fid'];
		$check 		= (int)$param['check'];
		$paytype 	= $param['paytype'];
		$data 		= $param['data'];
		$time 		= GetMkTime(time());
		$usePinput  = $param['usePinput'];   //是否使用积分
		$point      = $param['point'];       //使用的积分
		$useBalance = $param['useBalance'];  //是否使用余额
		$balance    = $param['balance'];     //使用的余额
		$paypwd     = $param['paypwd'];      //支付密码
		$ordernum   = $param['ordernum'];      //订单号
        $userDetail = $userLogin->getMemberInfo();
        $userid      = $userLogin->getMemberID();
        if ($userDetail['is_staff'] == 1) {
            return array("state" => 200, "info" => "员工账号不可以下单，如需购买请使用普通账号提交！");  //格式错误
        }
//		if(empty($id)) {
//			if($check){
//				return array("state" => 200, "info" => '活动参数传递错误，报名失败！');
//			}else{
//				die('活动参数传递错误，报名失败！');
//			}
//		}
        $archives = $dsql->SetQuery("SELECT * FROM `#@__huodong_order` WHERE `ordernum` = '$ordernum'");
        $res = $dsql->dsqlOper($archives,"results");
        $id 		= (int)$res[0]['hid'];
        $fid 		= (int)$res[0]['fid'];
		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1) {
			if($check){
				return array("state" => 200, "info" => '登录超时，请重新登录！');
			}else{
				die('登录超时，请重新登录！');
			}
		}

		//验证是否已经报名
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_reg` WHERE `hid` = $id AND `uid` = $uid AND `state` = 1");
		$ret = $dsql->dsqlOper($sql, "totalCount");
		if($ret > 0) {
			if($check){
				return array("state" => 200, "info" => '您已经报过名，无须重复提交！');
			}else{
				die('您已经报过名，无须重复提交！');
			}
		}

		$dedata = unserialize($data);
//		if(!is_array($dedata)) return array("state" => 200, "info" => '报名信息错误，请重新提交！');

		//查询活动ID
		$sql = $dsql->SetQuery("SELECT l.`title`, l.`end`, l.`baoming`, l.`baomingend`, l.`feetype`, l.`max`, (SELECT count(`id`) FROM `#@__huodong_reg` r WHERE r.`hid` = $id) reg FROM `#@__huodong_list` l WHERE l.`state` = 1 AND l.`id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$ret = $ret[0];
			$huodong = $ret['title'];
			$end  = $ret['baoming'] ? $ret['end'] : $ret['baomingend'];

			if($time > $end) {
				if($check){
					return array("state" => 200, "info" => '报名时间已经截止，报名失败！');
				}else{
					die('报名时间已经截止，报名失败！');
				}
			}

			//收费类型，验证余票
			if($ret['feetype']){

				$sql = $dsql->SetQuery("SELECT f.`title`, f.`price`, f.`max`, (SELECT count(`id`) FROM `#@__huodong_reg` WHERE `hid` = $id AND `fid` = $fid AND (`state` = 1 OR `state` = 2)) reg FROM `#@__huodong_fee` f WHERE f.`hid` = $id AND f.`id` = $fid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$fee = $ret[0];
					if($fee['reg'] >= $fee['max'] && $fee['max'] != 0){
						if($check){
							return array("state" => 200, "info" => '名额已经用完，报名失败！');
						}else{
							die('名额已经用完，报名失败！');
						}
					}

					//如果是免费的直接报名成功
					if($fee['price'] <= 0){
						if($check){
							return array("state" => 200, "info" => '免费活动无须支付！');
						}else{
							die('免费活动无须支付！');
						}
					}

					$price = $fee['price'];

					global $cfg_pointName;

					//查询会员信息
					$userinfo  = $userLogin->getMemberInfo();
					$usermoney = $userinfo['money'];
					$userpoint = $userinfo['point'];

					$tit      = array();
					$useTotal = 0;

					//判断是否使用积分，并且验证剩余积分
					if($usePinput == 1 && !empty($point)){
						if($userpoint < $point){
							if($check){
								return array("state" => 200, "info" => "您的可用".$cfg_pointName."不足，支付失败！");
							}else{
								die("您的可用".$cfg_pointName."不足，支付失败！");
							}
						}
						$useTotal += $point / $cfg_pointRatio;
						$tit[] = 'point';
					}else{
						$point = 0;
					}

					//判断是否使用余额，并且验证余额和支付密码
					if($useBalance == 1 && !empty($balance) && !empty($paypwd)){

						//验证支付密码
						$archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$uid'");
						$results  = $dsql->dsqlOper($archives, "results");
						$res = $results[0];
						$hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
						if($res['paypwd'] != $hash){
							if($check){
								return array("state" => 200, "info" => "支付密码输入错误，请重试！");
							}else{
								die("支付密码输入错误，请重试！");
							}
						}

						//验证余额
						if($usermoney < $balance){
							if($check){
								return array("state" => 200, "info" => "您的余额不足，支付失败！");
							}else{
								die("您的余额不足，支付失败！");
							}
						}

						$useTotal += $balance;
						$tit[] = "money";
					}else{
						$balance = 0;
					}

					if($useTotal > $price){
						if($check){
							return array("state" => 200, "info" => "您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit));
						}else{
							die("您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit));
						}
					}

					$payprice = $price - $useTotal;

					//验证
					if($check){
						return "ok";

					//跳转至第三方支付页面
					}else{
						$archives = $dsql->SetQuery("UPDATE `#@__huodong_order` SET `paytype` = '$paytype', `point` = '$point', `balance` = '$balance', `payprice` = '$payprice' WHERE `ordernum` = '$ordernum'");
						$return = $dsql->dsqlOper($archives, "update");
						if($return != "ok"){
							if($check){
								return array("state" => 200, "info" => '提交失败，请稍候重试！');
							}else{
								die('提交失败，请稍候重试！');
							}
						}

						if($payprice > 0){
						    $param = array(
                                "service" => "huodong",
                                "template" => "detail",
                                "id" => $id
                            );
							return createPayForm("huodong", $ordernum, $payprice, $paytype, "活动报名",$param);
						}else{

		                    $paysql   = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = $ordernum");
		                    $payre    = $dsql->dsqlOper($paysql,"results");
		                    if (!empty($payre)) {

		                        $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'huodong',  `uid` = '$userid', `amount` = '$payprice', `paytype` = '".join(",", $tit)."', `state` = 1, `pubdate` = '".GetMkTime(time())."'  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'huodong'");
		                        $dsql->dsqlOper($archives, "update");

		                    }else{

		                        $sql = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('huodong', '$ordernum', '$uid', '$ordernum', '$payprice', '".join(",", $tit)."', 1, ".GetMkTime(time()).")");
								$ret = $dsql->dsqlOper($sql, "lastid");


		                    }

							$param = array(
								"ordernum" => $ordernum,
								"paytype" => join(",", $tit)
							);
							$this->param = $param;
							$this->paySuccess();

							$param = array(
								"service" => "huodong",
								"template" => "payreturn",
								"ordernum" => $ordernum
							);
							$url = getUrlPath($param);

							//支付成功后跳转页面
							global $cfg_payReturnType;
							global $cfg_payReturnUrlPc;
							global $cfg_payReturnUrlTouch;

							if($cfg_payReturnType){

								//移动端自定义跳转链接
								if(isMobile() && $cfg_payReturnUrlTouch){
									$url = $cfg_payReturnUrlTouch;
								}

								//电脑端自定义跳转链接
								if(!isMobile() && $cfg_payReturnUrlPc){
									$url = $cfg_payReturnUrlPc;
								}
							}
                                return  $url;
//							header("location:".$url);
						}
					}

				}else{
					if($check){
						return array("state" => 200, "info" => '报名失败，收费项不存在，请确认后重试！');
					}else{
						die('报名失败，收费项不存在，请确认后重试！');
					}
				}

			//免费类型的报名成功，添加报名数据
			}else{
				if($check){
					return array("state" => 200, "info" => '免费活动，无须支付费用！');
				}else{
					die('免费活动，无须支付费用！');
				}
			}

		}else{
			if($check){
				return array("state" => 200, "info" => '活动不存在，支付失败！');
			}else{
				die('活动不存在，支付失败！');
			}
		}

	}


    //扫码code
    public function sweepcode(){
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;
        $param =  $this->param;
        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();
        //重置表单参数
        $this->param = $param;

        $param_     = $param;
        $ordernum   = $param['ordernum'];
        $paytype    = $param['paytype'];
        $amount     = $param['amount'];
        $final      = (int)$param['final']; // 最终支付
        $paytype    = $param['paytype'];
        $usePinput  = $param['usePinput'];
        $point      = (float)$param['point'];
        $useBalance = $param['useBalance'];
        $balance    = (float)$param['balance'];

        if (!is_array($payTotalAmount)) {
            $amount =  $payTotalAmount;
        }else{
            return $payTotalAmount;
        }
        //余额or积分混合支付
        if($final==1 &&($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

            $pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
            $balanceMoney = $balance;

            // foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                // $archives = $dsql->SetQuery("SELECT  `amount` FROM `#@__waimai_order_all` WHERE `ordernum` = '$value'");
                // $results  = $dsql->dsqlOper($archives, "results");
                // $res = $results[0];
                // $orderprice = $res['amount']; //单价
                $oprice = $amount;  //单个订单总价 = 数量 * 单价

                $usePointMoney = 0;
                $useBalanceMoney = 0;

                //先判断积分是否足够支付总价
                //如果足够支付：
                //1.把还需要支付的总价重置为0
                //2.积分总额减去用掉的
                //3.记录已经使用的积分
                if($oprice < $pointMoney){
                    $pointMoney -= $oprice;
                    $usePointMoney = $oprice;
                    $oprice = 0;
                //积分不够支付再判断余额是否足够
                //如果积分不足以支付总价：
                //1.总价减去积分抵扣掉的部部分
                //2.积分总额设置为0
                //3.记录已经使用的积分
                }else{
                    $oprice -= $pointMoney;
                    $usePointMoney = $pointMoney;
                    $pointMoney = 0;
                    //验证余额是否足够支付剩余部分的总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.余额减去用掉的部分
                    //3.记录已经使用的余额
                    if($oprice < $balanceMoney){
                        $balanceMoney -= $oprice;
                        $useBalanceMoney = $oprice;
                        $oprice = 0;
                    //余额不够支付的情况
                    //1.总价减去余额付过的部分
                    //2.余额设置为0
                    //3.记录已经使用的余额
                    }else{
                        $oprice -= $balanceMoney;
                        $useBalanceMoney = $balanceMoney;
                        $balanceMoney = 0;
                    }
                }



                //扫码支付 更新微信或者支付宝实际支付金额
                $paylogsql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$oprice' WHERE `ordernum` = '$ordernum'");
                $dsql->dsqlOper($paylogsql, "update");
            // }


        }
        $isMobile = isMobile();

        global $userLogin;
        global $langData;

        if($userLogin->getMemberID() == -1) die($langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        if($amount <= 0){
            die($langData['siteConfig'][21][254]);   //订单支付金额必须为整数或小数，小数点后不超过2位。
        }
        if(empty($paytype)){
            die($langData['siteConfig'][21][75]);   //请选择支付方式！
        }

        $ordernum = $ordernum ? $ordernum : create_ordernum();

        if($isMobile && empty($final)){
            $param_['ordernum'] = $ordernum;
            $param_['ordertype'] = 'deposit';
            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "pay",
                "param" => http_build_query($param_)
            );
            header("location:".getUrlPath($param));
            die;
        }
        return createPayForm("huodong", $ordernum, $amount, $paytype, "活动报名");   //订单支付

    }



    public function checkPayAmount(){
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;

        $userid   = $userLogin->getMemberID();
        $param    = $this->param;

        //订单状态验证
        // $payCheck = $this->payCheck();
        // if($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);
        $ordernum   = $param['ordernum'];    //订单号
        $amount     = $param['amount'];    //订单号
        $usePinput  = $param['usePinput'];   //是否使用积分
        $point      = $param['point'];       //使用的积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请登录后重试！
        // if(empty($ordernum)) return array("state" => 200, "info" => $langData['travel'][13][15]);//提交失败，订单号不能为空！
        if(!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => $langData['travel'][13][16]);//请输入支付密码！

        $totalPrice = 0;
        // $ordernumArr = explode(",", $ordernum);
        // foreach ($ordernumArr as $key => $value) {
        //     //查询订单信息
            $archives = $dsql->SetQuery("SELECT `price` FROM `#@__huodong_order` WHERE `ordernum` = '$ordernum'");
            $results  = $dsql->dsqlOper($archives, "results");
        //     $res = $results[0];
        //     $orderprice = $res['amount'];

            $totalPrice = $results[0]['price'];
        // }

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用积分，并且验证剩余积分
        if($usePinput == 1 && !empty($point)){
            if($userpoint < $point) return array("state" => 200, "info" => $langData['travel'][13][17].$cfg_pointName.$langData['travel'][13][18]);//您的可用".$cfg_pointName."不足，支付失败！
            $useTotal += $point / $cfg_pointRatio;
            $tit[] = $cfg_pointName;
        }

        //判断是否使用余额，并且验证余额和支付密码
        if($useBalance == 1 && !empty($balance) && !empty($paypwd)){
            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if($res['paypwd'] != $hash) return array("state" => 200, "info" => $langData['travel'][13][19]);//支付密码输入错误，请重试！
            //验证余额
            if($usermoney < $balance) return array("state" => 200, "info" => $langData['travel'][13][20]);//您的余额不足，支付失败！
            $useTotal += $balance;
            $tit[] = $langData['travel'][13][21];//余额
        }
        if($useTotal > $totalPrice) return array("state" => 200, "info" => $langData['travel'][13][22].join($langData['travel'][13][23], $tit).$langData['travel'][13][24].join($langData['travel'][13][23], $tit));//"您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit)

        //返回需要支付的费用
        return sprintf("%.2f", $totalPrice - $useTotal);

    }


	/**
	 * 支付成功
	 * 此处进行支付成功后的操作，例如发送短信等服务
	 *
	 */
	public function paySuccess(){
		global $cfg_basehost;
		global $dsql;
		global $userLogin;

		$param = $this->param;
		if(!empty($param)){

			$paytype  = $param['paytype'];
			$ordernum = $param['ordernum'];
			$date     = GetMkTime(time());

			//查询订单信息
			$sql = $dsql->SetQuery("SELECT * FROM `#@__huodong_order` WHERE `ordernum` = '$ordernum' AND 1 = 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$uid     = $ret[0]['uid'];
				$hid     = $ret[0]['hid'];
				$fid     = $ret[0]['fid'];
				$price   = $ret[0]['price'];
				$point   = $ret[0]['point'];
				$balance = $ret[0]['balance'];
				$balance = $ret[0]['balance'];
				$property = $ret[0]['property'];

				//查询活动信息
				$title = $began = $end = $addrid = $address = "";
				$sql = $dsql->SetQuery("SELECT `title`, `began`, `end`, `addrid`, `address`, `uid` FROM `#@__huodong_list` WHERE `id` = $hid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
					$began = $ret[0]['began'];
					$end = $ret[0]['end'];
					$addrid = $ret[0]['addrid'];
					$address = $ret[0]['address'];
					$sid = $ret[0]['uid'];

                    //区域名称
                    global $data;
                    $data = "";
                    $addrArr = getParentArr("site_area", $addrid);
                    $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                    $addrname = array_slice($addrArr, -2);

                    $address = join(' ', $addrname) . " " . $address;

                    $times = date('Y-m-d H:i:s', $began) . ' - ' . date('Y-m-d H:i:s', $end);
				}

				//更新订单状态
				$sql = $dsql->SetQuery("UPDATE `#@__huodong_order` SET `state` = 1, `paytype` = '$paytype' WHERE `ordernum` = '$ordernum'");
				$dsql->dsqlOper($sql, "update");

				if($point || $balance){
				    global  $userLogin;
					$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - $point, `money` = `money` - $balance WHERE `id` = $uid");
					$dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($uid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint-$point);
					if($point){
						//保存操作日志
						$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '0', '$point', '活动报名：$ordernum', '$date','xiaofei','$userpoint')");
						$dsql->dsqlOper($archives, "update");
					}

                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid ='';
                    if($ret){
                        $pid = $ret[0]['id'];
                    }
                    $param = array(
                        "service"  => "huodong",
                        "template" => "detail",
                        "id"       => $hid
                    );
                    $urlParam = serialize($param);
                    $user  = $userLogin->getMemberInfo($uid);
                    $usermoney = $user['money'];
                    //保存操作日志
                    $title = '活动报名消费';
                    if($paytype=="money"){
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$uid', '0', '$price', '活动报名：$title', '$date','huodong','xiaofei','$pid','$title','$ordernum','$urlParam','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }
				}

				//增加报名记录
				$cardnum = genSecret(12, 1);
				$sql = $dsql->SetQuery("INSERT INTO `#@__huodong_reg` (`hid`, `fid`, `uid`, `date`, `property`, `code`, `ordernum`) VALUES ('$hid', '$fid', '$uid', '$date', '$property', '$cardnum','$ordernum')");
				$ret = $dsql->dsqlOper($sql, "lastid");

                //记录用户行为日志
                memberLog($uid, 'huodong', 'order', $ret, 'insert', '活动报名('.$title.'=>'.$price.'元)', '', $sql);

                //报名成功通知-通知报名人
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "huodong-join"
                );

                //自定义配置
                $data = array(
                    "user" => $user['nickname'],
                    "title" => $title,
                    "times" => $times,
                    "began" => date('Y-m-d H:i:s', $began),
                    "end" => date('Y-m-d H:i:s', $end),
                    "address" => $address,
                    "fields" => array(
                        'keyword1' => '活动名称',
                        'keyword2' => '活动时间',
                        'keyword3' => '活动地点',
                        'keyword4' => '会员姓名'
                    )
                );

                updateMemberNotice($uid, "活动-报名成功通知", $param, $data);

                
                //通知主办方
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "huodong-reg-" . $hid
                );

                //自定义配置
                $data = array(
                    "user" => $user['nickname'],
                    "title" => $title,
                    "times" => $times,
                    "address" => $address,
                    "fields" => array(
                        'keyword1' => '活动名称',
                        'keyword2' => '活动时间',
                        'keyword3' => '活动地点',
                        'keyword4' => '会员姓名'
                    )
                );

                updateMemberNotice($sid, "活动-有新的报名通知", $param, $data);

			}

		}
	}


	/**
		* 报名详情
		* @return array
		*/
	public function regDetail(){
		global $dsql;
		global $userLogin;

		$param = $this->param;
		$id = (int)$param['id'];

		if(empty($id)) return array("state" => 200, "info" => '活动参数传递错误，操作失败！');

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');

		//验证是否已经报名
		$hid = 0;
		$date = 0;
		$property = array();
		$state = 0;
		$code = '';
		$nickname = '';
		$price = 0;
        $feeTitle = '';
        $ordernum = '';
		$sql = $dsql->SetQuery("SELECT r.`hid`, r.`date`, r.`property`, r.`state`, r.`code`, r.`ordernum`, m.`nickname`, f.`price`, f.`title` FROM `#@__huodong_reg` r LEFT JOIN `#@__member` m ON m.`id` = r.`uid` LEFT JOIN `#@__huodong_fee` f ON f.`id` = r.`fid` WHERE r.`id` = $id AND r.`uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$hid = $ret[0]['hid'];
			$date = $ret[0]['date'];
			$property = $ret[0]['property'];
			$property = $property ? unserialize($property) : array();
			if($property){
				$areaCode = '';
				$ii = 0;
				foreach ($property as $key => $value) {
				    $_key = array_keys($value);
				    $_key = $_key[0];
					if($_key == 'areaCode'){
						$areaCode = $value[$_key] == '86' ? '' : $value[$_key];
						array_splice($property, $ii, 1);
					}
					$ii++;
				}
				if($areaCode){
					foreach ($property as $key => $value) {
						$_key = array_keys($value);
    				    $_key = $_key[0];
    					if($_key == '手机'){
							$property[$key][$_key] = $areaCode . $value[$_key];
						}
					}
				}
			}
			$state = $ret[0]['state'];
			$code = $ret[0]['code'];
			$nickname = $ret[0]['nickname'];
			$price = $ret[0]['price'];
			$feeTitle = $ret[0]['title'];
            $ordernum = $ret[0]['ordernum'];
		}else{
			return array("state" => 200, "info" => '您还没有报名，或者已经取消！');
		}

		//查询活动ID
		$sql = $dsql->SetQuery("SELECT l.`title`, l.`litpic`, l.`contact`, l.`began`, l.`addrid`, l.`address`, m.`nickname`, m.`company`,l.`sign` FROM `#@__huodong_list` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE l.`state` = 1 AND l.`id` = $hid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$data = $ret[0];
			$title = $data['title'];
			$litpic  = $data['litpic'] ? getFilePath($data['litpic']) : '';
			$contact = $data['contact'];
			$began = $data['began'];
			$addrid = $data['addrid'];
			$address = $data['address'];
			$sign  = $data['sign'];
			$nickname = $data['company'] ? $data['company'] : $data['nickname'];

			//区域
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$address = join(" ", $addrArr) . ' ' . $address;

            //有订单号的话，查询订单表的实际支付金额
            $paytype = '';
            if($ordernum){
                $archives = $dsql->SetQuery("SELECT `price`, `paytype` FROM `#@__huodong_order` WHERE `ordernum` = '".$ordernum."'");
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $price = (float)$results[0]['price'];  //订单实际的支付费用
                    $paytype = getPaymentName($results[0]['paytype']);  //支付方式
                }
            }

			return array(
				'date' => $date,
				'property' => $property,
				'state' => $state,
				'code' => join(" ", str_split($code, 4)),
				'nickname' => $nickname,
				'price' => $price,
				'title' => $title,
				'feeTitle' => $feeTitle,
				'litpic' => $litpic,
				'began' => $began,
				'address' => $address,
				'sign' => $sign,
                'ordernum' => $ordernum,
                'paytype' => $paytype,
				'url' => getUrlPath(array("service" => "huodong", "template" => "detail", "id" => $hid)),
				'contact' => $contact
			);

		}else{
			return array("state" => 200, "info" => '活动不存在，操作失败！');
		}

	}


	/**
		* 取消报名
		* @return array
		*/
	public function cancelJoin(){
		global $dsql;
		global $userLogin;

		$param = $this->param;
		$id = (int)$param['id'];
		$time = GetMkTime(time());

		if(empty($id)) return array("state" => 200, "info" => '活动参数传递错误，操作失败！');

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');


		//验证是否已经报名
		$hid = 0;
		$fid = 0;
		$ordernum = "";
		$sql = $dsql->SetQuery("SELECT `id`, `hid`, `fid`,`ordernum` FROM `#@__huodong_reg` WHERE `state` = 1 AND `id` = $id AND `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$hid = $ret[0]['hid'];
			$fid = $ret[0]['fid'];
			$ordernum = $ret[0]['ordernum'];
		}else{
			$sql = $dsql->SetQuery("SELECT `id`, `hid`, `fid`,`ordernum` FROM `#@__huodong_reg` WHERE `state` = 1 AND `hid` = $id AND `uid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$id  = $ret[0]['id'];
				$hid = $ret[0]['hid'];
				$fid = $ret[0]['fid'];
                $ordernum = $ret[0]['ordernum'];
			}else{
				return array("state" => 200, "info" => '您还没有报名，或者已经取消！');
			}
		}

        //验证是否支持取消报名
        $sql = $dsql->SetQuery("SELECT `sign` FROM `#@__huodong_list` WHERE `state` = 1 AND `id` = $hid");
        $retsign = $dsql->dsqlOper($sql, "results");
        if ($retsign[0]['sign'] == 1){
            return array("state" => 200, "info" => '该活动报名成功后不支持取消，如有疑问请联系活动主办方！');
        }
		//查询活动ID
		$sql = $dsql->SetQuery("SELECT `title`, `end`, `feetype` FROM `#@__huodong_list` WHERE `state` = 1 AND `id` = $hid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$data = $ret[0];
			$huodong = $data['title'];
			$end  = $data['end'];

			// if($time > $end) return array("state" => 200, "info" => '活动已经结束，无法取消！');

			//收费类型，退回费用
			if($data['feetype']){

				$sql = $dsql->SetQuery("SELECT `title`, `price` FROM `#@__huodong_fee` WHERE `hid` = $hid AND `id` = $fid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$fee = $ret[0];
					$amount = $fee['price'];

                	$pay_name = '';
                	$paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "huodong",
                        "action"   => "join"
                    );
                    $urlParam = serialize($paramUser);

                    $paytype = '';
                    if($ordernum){
                        $archives = $dsql->SetQuery("SELECT `paytype`, `price` FROM `#@__huodong_order` WHERE `ordernum` = '".$ordernum."'");
                        $results = $dsql->dsqlOper($archives, "results");
                        if($results){
                            $paytype = $results[0]['paytype'];
                            $amount = (float)$results[0]['price'];  //订单实际的支付费用
                        }
                    }

                    //退还费用
                    if($amount > 0){

                        $arr = refund('huodong', 0, $paytype, $amount, $ordernum, '', 0, 0);
                        $r = $arr[0]['r'];
                        $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : GetMkTime(time());
                        $refrundno   = $arr[0]['refrundno'];
                        $refrundcode = $arr[0]['refrundcode'];
                        //更新订单状态
                        if ($r) {

                            //更新退款时间和退款单号
                            $sql = $dsql->SetQuery("UPDATE `#@__huodong_order` SET `refrunddate` = '$refrunddate', `refrundno` = '$refrundno' WHERE `ordernum` = '$ordernum'");
                            $dsql->dsqlOper($sql, "update");

                        }else{
                            return array("state" => 200, "info" => $refrundcode);
                        }
                    }

                    $tuikuan= array(
                    	'paytype' 				=> $paytype,
                    	'truemoneysy'			=> 0,
                    	'money_amount'  		=> $amount,
                    	'point'					=> 0,
                    	'refrunddate'			=> 0,
                    	'refrundno'				=> 0
                    );
                    $tuikuanparam = serialize($tuikuan);
					//退还费用
					if($amount > 0){
						$sql = $dsql->SetQuery("UPDATE `#@__huodong_reg` SET `state` = 4 WHERE `id` = $id AND `fid` = $fid AND `uid` = $uid");
					}else{
						$sql = $dsql->SetQuery("UPDATE `#@__huodong_reg` SET `state` = 3 WHERE `id` = $id AND `fid` = $fid AND `uid` = $uid");
					}

					//更新报名状态为已退款
					$ret = $dsql->dsqlOper($sql, "update");
					if($ret == "ok"){
                    
                        //记录用户行为日志
                        memberLog($uid, 'huodong', 'order', $hid, 'update', '取消活动报名('.$huodong.')', '', $sql);

                        //退还费用
					    if($amount > 0){

                            if($paytype == 'money' || $paytype == 'balance'){
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount' WHERE `id` = '$uid'");
                                $dsql->dsqlOper($archives, "update");
                                $user  = $userLogin->getMemberInfo($uid);
                                $usermoney = $user['money'];
        //                        $money      = sprintf('%.2f',($usermoney+$amount));
                                //保存操作日志
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$amount', '活动退款：$huodong', '$time','huodong','tuikuan','$urlParam','$ordernum','$tuikuanparam','活动消费','$usermoney')");
                                $dsql->dsqlOper($archives, "update");
                            }
                            
                        }
                        
						return "取消成功！";
					}else{
						return array("state" => 200, "info" => '程序错误，操作失败！');
					}

					//删除报名记录
					// $sql = $dsql->SetQuery("DELETE FROM `#@__huodong_reg` WHERE `hid` = $id AND `fid` = $fid AND `uid` = $uid");
					// $ret = $dsql->dsqlOper($sql, "update");
					// if($ret == "ok"){
					// 	return "取消成功！";
					// }else{
					// 	return array("state" => 200, "info" => '程序错误，操作失败！');
					// }

				}else{
					return array("state" => 200, "info" => '取消失败，收费项不存在，请联系主办方退款！');
				}

			//免费类型的删除报名记录
			}else{

				//更新报名状态为已取消
				$sql = $dsql->SetQuery("UPDATE `#@__huodong_reg` SET `state` = 3 WHERE (`id` = $id OR `hid` = $id) AND `fid` = $fid AND `uid` = $uid");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
                
                    //记录用户行为日志
                    memberLog($uid, 'huodong', 'order', $hid, 'update', '取消活动报名('.$huodong.')', '', $sql);

					return "取消成功！";
				}else{
					return array("state" => 200, "info" => '程序错误，操作失败！');
				}

				// $sql = $dsql->SetQuery("DELETE FROM `#@__huodong_reg` WHERE `hid` = $id AND `uid` = $uid");
				// $ret = $dsql->dsqlOper($sql, "update");
				// if($ret == "ok"){
				// 	return "取消成功！";
				// }else{
				// 	return array("state" => 200, "info" => '程序错误，操作失败！');
				// }
			}

		}else{
			return array("state" => 200, "info" => '活动不存在，操作失败！');
		}

	}


	/**
		* 完成报名
		* @return array
		*/
	public function compleateJoin(){
		global $dsql;
		global $userLogin;
		global $siteCityInfo;
		$param = $this->param;
		$id = (int)$param['id'];
		$time = GetMkTime(time());

		if(empty($id)) return array("state" => 200, "info" => '活动参数传递错误，操作失败！');

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');

		//验证是否已经报名
		$hid = 0;
		$fid = 0;
        $code = '';
		$sql = $dsql->SetQuery("SELECT `id`, `hid`, `fid`, `code` FROM `#@__huodong_reg` WHERE `state` = 1 AND `id` = $id AND `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$hid = $ret[0]['hid'];
			$fid = $ret[0]['fid'];
			$code = $ret[0]['code'];
		}else{
			return array("state" => 200, "info" => '您还没有报名，或者已经取消！');
		}

		//获取订单信息
		$transaction_id = $ordernum = $paytype = '';
		$sql = $dsql->SetQuery("SELECT l.`transaction_id`, l.`ordernum`, l.`paytype`,l.`id`,l.`amount` FROM `#@__huodong_order` o LEFT JOIN `#@__pay_log` l ON l.`ordernum` = o.`ordernum` WHERE o.`uid` = $uid AND o.`hid` = $hid AND o.`fid` = $fid AND l.`state` = 1 ORDER BY o.`id` DESC LIMIT 1");
		$ret = $dsql->dsqlOper($sql, "results");
		$truepayprice = 0;
		$pid = '';
		if($ret){
			$transaction_id = $ret[0]['transaction_id'];
			$ordernum 		= $ret[0]['ordernum'];
			$paytype  		= $ret[0]['paytype'];
			$pid      		= $ret[0]['id'];
			$truepayprice  	= $ret[0]['amount'];
		}

		//查询活动ID
		$sid = 0;
		$sql = $dsql->SetQuery("SELECT `title`, `end`, `feetype`, `uid`,`cityid` FROM `#@__huodong_list` WHERE `state` = 1 AND `id` = $hid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$data = $ret[0];
			$huodong = $data['title'];
			$end  	 = $data['end'];
			$sid  	 = $data['uid'];
			$cityid  = $data['cityid'];

			//收费类型，结算费用
			if($data['feetype']){

				$sql = $dsql->SetQuery("SELECT `title`, `price` FROM `#@__huodong_fee` WHERE `hid` = $hid AND `id` = $fid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$fee = $ret[0];
					$amount = $fee['price'];
					$title = $fee['title'];

					//扣除佣金
					global $cfg_huodongFee;
					global $cfg_fzhuodongFee;
					$cfg_huodongFee = (float)$cfg_huodongFee;
					$cfg_fzhuodongFee = (float)$cfg_fzhuodongFee;

					$fee = $amount * $cfg_huodongFee / 100;
                    $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
					$fee = $fee < 0.01 ? 0 : $fee;

					$amount_ = sprintf('%.2f', $amount - $fee);

					//分销信息
					global $cfg_fenxiaoState;
					global $cfg_fenxiaoSource;
					global $cfg_fenxiaoDeposit;
					global $cfg_fenxiaoAmount;
					include HUONIAOINC."/config/huodong.inc.php";
					$fenXiao = (int)$customfenXiao;

					//分销金额
					$_fenxiaoAmount = $amount;
					if($cfg_fenxiaoState && $fenXiao){

						//商家承担
						if($cfg_fenxiaoSource){
                            $fx_shouldMoney = ($amount * $cfg_fenxiaoAmount / 100);
							$amount_ = $amount_ - $fx_shouldMoney;

						//平台承担
						}else{
							$_fenxiaoAmount = $fee;
						}
					}

					$_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                    //分佣 开关
                    $paramarr['amount'] = $_fenxiaoAmount;
                    if($fenXiao == 1){
                        $_fx_title = $ordernum;
                        (new member())->returnFxMoney("huodong", $uid, $ordernum, $paramarr);
                        //查询一共分销了多少佣金
                        $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'huodong'");
                        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                        if($cfg_fenxiaoSource){
                            $fx_less = $fx_shouldMoney  - $fenxiaomonyeres[0]['allfenxiao'];
                            if(!$cfg_fenxiaoDeposit){
                                $amount_     += $fx_less; //没沉淀，还给商家
                            }else{
                                $precipitateMoney = $fx_less;
                                if($precipitateMoney > 0){
                                    (new member())->recodePrecipitationMoney($sid,$ordernum,$_fx_title,$precipitateMoney,$cityid,"huodong");
                                }
                            }
                        }
                    }
					$amount_ = $amount_ < 0.01 ? 0 : $amount_;

                    //分站佣金
                    $fzFee = cityCommission($cityid,'huodong');
					//分站
					$fztotalAmount_ =  $fee * (float)$fzFee / 100 ;
					$fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                    $fee-=$fztotalAmount_;//总站-=分站
					$cityName 	=  getSiteCityName($cityid);

					//费用转给商家
					if($amount_ > 0){
						$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount_' WHERE `id` = '$sid'");
						$dsql->dsqlOper($archives, "update");

						//保存操作日志
                        $title = "活动收入";
                        $param = array(
                            "service"  => "huodong",
                            "template" => "detail",
                            "id"       => $hid
                        );
                        $urlParam = serialize($param);
                        $user  = $userLogin->getMemberInfo($sid);
                        $usermoney = $user['money'];
//                        $money       = sprintf('%.2f',($usermoney+$amount));

                        $_info = "活动订单收入：".$huodong."，订单号：" . $ordernum;
						$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$sid', '1', '$amount_', '$_info', '$time','huodong','shangpinxiaoshou','$pid','$title','$ordernum','$urlParam','$usermoney')");
						$dsql->dsqlOper($archives, "update");

						//分站
						$fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
						$dsql->dsqlOper($fzarchives, "update");
						//保存操作日志
						$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$sid', '1', '$amount_', '$_info', '$time','$cityid','$fztotalAmount_','huodong',$fee,'1','shangpinxiaoshou','$usermoney')");
//						$dsql->dsqlOper($archives, "update");
                        $lastid = $dsql->dsqlOper($archives, "lastid");
                        substationAmount($lastid,$cityid);

		                if($truepayprice <=0){
							$truepayprice = $amount_;
						}
						//工行E商通银行分账
						if($transaction_id){
							rfbpShareAllocation(array(
								"uid" => $sid,
								"ordertitle" => "活动订单收入", //教育订单
								"ordernum" => $ordernum,
								"orderdata" => array('活动标题' => $huodong, '票型名称' => $title),
								"totalAmount" => $amount,
								"amount" => $amount_,
								"channelPayOrderNo" => $transaction_id,
								"paytype" => $paytype
							));
						}

						//微信通知
					    $param = array(
				    		'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
				        	'cityid' => $cityid,
				            'notify' => '管理员消息通知',
				            'fields' =>array(
					            'contentrn'  => $cityName.'分站——huodong模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
					            'date' => date("Y-m-d H:i:s", time()),
					        )
					    );

					    $params = array(
				    		'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
				        	'cityid' => $cityid,
				            'notify' => '管理员消息通知',
				            'fields' =>array(
					            'contentrn'  => $cityName.'分站——huodong模块——平台获得佣金 :'.$fee.' ——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
					            'date' => date("Y-m-d H:i:s", time()),
					        )
					    );
				        //后台微信通知
				        updateAdminNotice("huodong", "detail",$param);
				        updateAdminNotice("huodong", "detail",$params);
					}

					//更新报名状态为已完成
					$sql = $dsql->SetQuery("UPDATE `#@__huodong_reg` SET `state` = 2 WHERE `id` = $id AND `fid` = $fid AND `uid` = $uid");
					$ret = $dsql->dsqlOper($sql, "update");
					if($ret == "ok"){
                    
                        //记录用户行为日志
                        memberLog($uid, 'huodong', 'order', $hid, 'update', '完成活动('.$huodong.' => 订单号:'.$ordernum.')', '', $sql);

						return "操作成功！";
					}else{
						return array("state" => 200, "info" => '程序错误，操作失败！');
					}

				}else{
					return array("state" => 200, "info" => '取消失败，收费项不存在，请联系主办方退款！');
				}

			//免费类型的
			}else{

				//更新报名状态为已完成
				$sql = $dsql->SetQuery("UPDATE `#@__huodong_reg` SET `state` = 2 WHERE `id` = $id AND `fid` = $fid AND `uid` = $uid");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
                
                    //记录用户行为日志
                    memberLog($uid, 'huodong', 'order', $hid, 'update', '完成活动('.$huodong.' => 票号:'.$code.')', '', $sql);

					return "操作成功！";
				}else{
					return array("state" => 200, "info" => '程序错误，操作失败！');
				}

			}

		}else{
			return array("state" => 200, "info" => '活动不存在，操作失败！');
		}

	}



	/**
		* 发布活动
		* @return array
		*/
	public function fabu(){
		global $dsql;
		global $userLogin;
		global $siteCityInfo;
        global $langData;

        $param 		= $this->param;
		$typeid   	= $param['typeid'];
		$title    	= $param['title'];
		$litpic   	= $param['litpic'];
		$began    	= GetMkTime($param['began']);
		$end      	= GetMkTime($param['end']);
		$baoming  	= (int)$param['baoming'];
		$baomingend = (int)GetMkTime($param['baomingend']);
		$addrid   	= (int)$param['addrid'];
		$cityid   	= (int)$param['cityid'];
		$address  	= $param['address'];
		$body     	= filterSensitiveWords($param['body'], false);
		$fee      	= (int)$param['fee'];
		$max      	= (int)$param['max'];
		$fee_title 	= $param['fee_title'];
		$fee_price 	= $param['fee_price'];
		$fee_max   	= $param['fee_max'];
		$lnglat    	= $param['lnglat'];
		$contact   	= $param['contact'];
		$sign    	= (int)$param['sign'];
		$property  	= json_decode($param['property'], true);

		if(empty($cityid)){
			$cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
			$cityInfoArr = explode(',', $cityInfoArr);
			$cityid = $cityInfoArr[0];
		}

		global $dellink, $autolitpic;
		include HUONIAOINC."/config/huodong.inc.php";
		$arcrank = (int)$customFabuCheck;

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}


		//用户信息
		$userinfo = $userLogin->getMemberInfo();

        if($userinfo['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'huodong','type'=>'1')))  return array("state" => 200, "info" => '商家权限验证失败！');  //商家权限验证失败！

            $uid = $userinfo['companyuid'];
        }
		// 需要支付费用
		$amount = 0;

		// 是否独立支付 普通会员或者付费会员超出限制
		$alonepay = 0;

		$alreadyFabu = 0; // 付费会员当天已免费发布数量

		//企业会员或已经升级为收费会员的状态才可以发布 --> 普通会员也可发布
		if($userinfo['userType'] == 1 && $userinfo['is_staff']!=1){

			$toMax = false;

			// if($userinfo['level']){

				$memberLevelAuth = getMemberLevelAuth($userinfo['level']);
				$huodongCount = (int)$memberLevelAuth['huodong'];

				//统计用户当天已发布数量 @
				// $today = GetMkTime(date("Y-m-d", time()));
				// $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

				//本周
				$today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
				$tomorrow = $today + 604800;

				$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__huodong_list` WHERE `uid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$alreadyFabu = $ret[0]['total'];
					if($alreadyFabu >= $huodongCount){
						$toMax = true;
						// return array("state" => 200, "info" => '当天发布信息数量已达等级上限！');
					}else{
						// $arcrank = 1;
					}
				}
			// }

			// 普通会员或者付费会员当天发布数量达上限
			if($userinfo['level'] == 0 || $toMax){

				global $cfg_fabuAmount;
				global $cfg_fabuFreeCount;
				$fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
				$fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();

                //超出免费次数
                if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['huodong'] <= $alreadyFabu) || !$fabuFreeCount)){
                    $alonepay = 1;
                    $amount = $fabuAmount["huodong"];
                    $arcrank = 0;  //需要审核
                }

			}

		}

		// if($userinfo['userType'] == 2){
		// 	if(!verifyModuleAuth(array("module" => "huodong"))){
		// 		return array("state" => 200, "info" => '商家权限验证失败！');
		// 	}
		// }

		if(empty($typeid)) return array("state" => 200, "info" => '请选择活动类型');
		if(empty($title)) return array("state" => 200, "info" => '请输入活动主题');
		if(empty($litpic)) return array("state" => 200, "info" => '请添加活动海报');
		if(empty($began)) return array("state" => 200, "info" => '请选择活动开始时间');
		if(empty($end)) return array("state" => 200, "info" => '请选择活动结束');
		if(empty($baomingend) && $baomingend) return array("state" => 200, "info" => '请选择报名截止时间');
		if(empty($addrid)) return array("state" => 200, "info" => '请选择活动区域');
		if(empty($address)) return array("state" => 200, "info" => '请输入活动详细地址');
		// if(empty($lnglat)) return array("state" => 200, "info" => '请选择活动地址坐标');

		$feeArr = array();
		if($fee){

			if(empty($fee_title)) return array("state" => 200, "info" => '请填写电子票内容');

			//验证费用内容
			foreach ($fee_title as $key => $value) {
				$fee_tit = filterSensitiveWords($value);
				$fee_pri = (float)$fee_price[$key];
				$fee_cou = (int)$fee_max[$key];

				if(!empty($fee_tit)){
					array_push($feeArr, array(
						"title" => $fee_tit,
						"price" => $fee_pri,
						"max"   => $fee_cou
					));
				}
			}

			if(empty($feeArr)) return array("state" => 200, "info" => '请填写电子票内容');
		}else{
			if(empty($max)) return array("state" => 200, "info" => '请输入人数上限');
		}

		if(!is_array($property)) return array("state" => 200, "info" => '报名填写信息格式有误');

		if(empty($contact)) return array("state" => 200, "info" => '请输入主办方联系方式');

		$title   = cn_substrR($title, 100);
		$address = cn_substrR($address, 200);
		$contact = cn_substrR($contact, 200);
		$now     = GetMkTime(time());
		$ip      = GetIP();

		$property = serialize($property);

		$lng = $lat = '';
		if($lnglat){
			$lnglat = explode(",", $lnglat);

			$lng = $lnglat[0];
			$lat = $lnglat[1];
		}

		//保存到主表
		$waitpay = $amount > 0 ? 1 : 0;
		$archives = $dsql->SetQuery("INSERT INTO `#@__huodong_list` (`cityid`, `uid`, `typeid`, `title`, `litpic`, `began`, `end`, `baoming`, `baomingend`, `addrid`, `address`, `body`, `feetype`, `max`, `contact`, `pubdate`, `ip`, `state`, `waitpay`, `alonepay`, `property`,`lng`,`lat`,`sign`) VALUES ('$cityid', '$uid', '$typeid', '$title', '$litpic', '$began', '$end', '$baoming', '$baomingend', '$addrid', '$address', '$body', '$fee', '$max', '$contact', '$now', '$ip', '$arcrank', '$waitpay', '$alonepay', '$property','$lng','$lat','$sign')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'huodong',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'huodong', '', $aid, 'insert', '发布活动('.$title.')', $url, $archives);

			//保存费用
			if($fee && $feeArr){
				foreach($feeArr as $k => $v){
					$tit = $v['title'];
					$pri = $v['price'];
					$max = $v['max'];

					$price = $dsql->SetQuery("INSERT INTO `#@__huodong_fee` (`hid`, `title`, `price`, `max`) VALUES ('$aid', '$tit', '$pri', '$max')");
					$dsql->dsqlOper($price, "update");
				}
			}

			//后台消息通知
			if($arcrank && !$toMax) {
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid = $siteCityInfo['cityid'];
                $param = array(
                    'type' => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . '分站——homemaking模块——用户:' . $userinfo['username'] . '发布了活动: ' . $title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("huodong", "detail", $param);
                // return "发布成功，请等待管理员审核！";
                //活动发布得积分
                 global $cfg_returnInteraction_commentDay;
                $countIntegral = countIntegral($uid);    //统计积分上限
                global $cfg_returnInteraction_huodong;    //活动积分
                if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_huodong >0) {
                    $infoname = getModuleTitle(array('name'=>'huodong'));

                    $date = GetMkTime(time());
                    global  $userLogin;
                    //增加积分
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_huodong' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($uid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$cfg_returnInteraction_huodong);
                    //保存操作日志
                    $info = '发布'.$infoname;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_huodong', '$info', '$date','zengsong','1','$userpoint')");//发布活动得积分
                    $dsql->dsqlOper($archives, "update");

                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "point"
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userinfo['username'],
                        "amount" => $cfg_returnInteraction_huodong,
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
                    updateMemberNotice($uid, "会员-积分变动通知", $param, $config);
                }
            }

			if($userinfo['level']){
				$auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $huodongCount);
			}else{
				$auth = array("level" => 0, "levelname" => "普通会员", "maxcount" => 0);
			}
            dataAsync("huodong",$aid);  // 活动、新增

            return array("auth" => $auth, "aid" => $aid, "amount" => $amount);


		}else{

			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');

		}

	}



	/**
		* 修改活动
		* @return array
		*/
	public function edit(){
		global $dsql;
		global $userLogin;
		global $siteCityInfo;
		$param = $this->param;

		$id       = $param['id'];
		$typeid   = $param['typeid'];
		$title    = filterSensitiveWords(addslashes($param['title']));
		$litpic   = $param['litpic'];
		$began    = GetMkTime($param['began']);
		$end      = GetMkTime($param['end']);
		$baoming  = (int)$param['baoming'];
		$baomingend = (int)GetMkTime($param['baomingend']);
		$addrid   = (int)$param['addrid'];
		$cityid   = (int)$param['cityid'];
		$address  = filterSensitiveWords($param['address']);
		$body     = filterSensitiveWords($param['body'], false);
		$fee      = (int)$param['fee'];
		$max      = (int)$param['max'];
		$fee_title = $param['fee_title'];
		$fee_price = $param['fee_price'];
		$fee_max   = $param['fee_max'];
		$lnglat    	= $param['lnglat'];
		$sign    	= (int)$param['sign'];
		$contact   = filterSensitiveWords(addslashes($param['contact']));
		$property  = json_decode($param['property'], true);

		global $dellink, $autolitpic;
		include HUONIAOINC."/config/huodong.inc.php";
		$state = (int)$customFabuCheck;

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'huodong','type'=>'1')))  return array("state" => 200, "info" => "商家验证权限失败！");  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }

		//查询活动ID
		$reg = 0;
		$sql = $dsql->SetQuery("SELECT l.`uid`, (SELECT count(`id`) FROM `#@__huodong_reg` r WHERE r.`hid` = $id AND (`state` = 1 || `state` = 2)) reg FROM `#@__huodong_list` l WHERE l.`id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$data = $ret[0];

			if($data['uid'] != $uid) return array("state" => 200, "info" => '会员权限验证错误，修改失败！');
			$reg = $data['reg'];

		}else{
			return array("state" => 200, "info" => '活动不存在或已经删除，修改失败！');
		}

		if(empty($id)) return array("state" => 200, "info" => '活动信息传递错误，修改失败');
		if(empty($typeid)) return array("state" => 200, "info" => '请选择活动类型');
		if(empty($title)) return array("state" => 200, "info" => '请输入活动主题');
		if(empty($litpic)) return array("state" => 200, "info" => '请添加活动海报');
		if(empty($began)) return array("state" => 200, "info" => '请选择活动开始时间');
		if(empty($end)) return array("state" => 200, "info" => '请选择活动结束');
		if(empty($baomingend) && $baomingend) return array("state" => 200, "info" => '请选择报名截止时间');
		if(empty($addrid)) return array("state" => 200, "info" => '请选择活动区域');
		if(empty($address)) return array("state" => 200, "info" => '请输入活动详细地址');
		// if(empty($lnglat)) return array("state" => 200, "info" => '请选择活动地址坐标');


		//只有没报过名的活动才可以修改
		if($reg == 0){
			$feeArr = array();
			if($fee){

				if(empty($fee_title)) return array("state" => 200, "info" => '请填写电子票内容');

				//验证费用内容
				foreach ($fee_title as $key => $value) {
					$fee_tit = filterSensitiveWords($value);
					$fee_pri = (float)$fee_price[$key];
					$fee_cou = (int)$fee_max[$key];

					if(!empty($fee_tit)){
						array_push($feeArr, array(
							"title" => $fee_tit,
							"price" => $fee_pri,
							"max"   => $fee_cou
						));
					}
				}

				if(empty($feeArr)) return array("state" => 200, "info" => '请填写电子票内容');
			}else{
				if(empty($max)) return array("state" => 200, "info" => '请输入人数上限');
			}
		}

		if(!is_array($property)) return array("state" => 200, "info" => '报名填写信息格式有误');

		if(empty($contact)) return array("state" => 200, "info" => '请输入主办方联系方式');

		$title   = cn_substrR($title, 100);
		$address = cn_substrR($address, 200);
		$contact = cn_substrR($contact, 200);
		$now     = GetMkTime(time());
		$ip      = GetIP();

		$property = serialize($property);

		$lng = $lat = '';
		if($lnglat){
			$lnglat = explode(",", $lnglat);

			$lng = $lnglat[0];
			$lat = $lnglat[1];
		}

		//保存到主表
		if($reg > 0){
			$sql = $dsql->SetQuery("UPDATE `#@__huodong_list` SET `cityid` = '$cityid', `typeid` = '$typeid', `title` = '$title', `litpic` = '$litpic', `began` = '$began', `end` = '$end', `baoming` = '$baoming', `baomingend` = '$baomingend', `addrid` = '$addrid', `address` = '$address', `body` = '$body', `contact` = '$contact', `state` = '$state', `property` = '$property', `lng` = '$lng', `lat` = '$lat',`sign` = '$sign' WHERE `id` = $id");
		}else{
			$sql = $dsql->SetQuery("UPDATE `#@__huodong_list` SET `cityid` = '$cityid', `typeid` = '$typeid', `title` = '$title', `litpic` = '$litpic', `began` = '$began', `end` = '$end', `baoming` = '$baoming', `baomingend` = '$baomingend', `addrid` = '$addrid', `address` = '$address', `body` = '$body', `feetype` = '$fee', `max` = '$max', `contact` = '$contact', `state` = '$state', `property` = '$property', `lng` = '$lng', `lat` = '$lat',`sign` = '$sign' WHERE `id` = $id");
		}
		$ret = $dsql->dsqlOper($sql, "update");

		if($ret == "ok"){

            $urlParam = array(
                'service' => 'huodong',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'huodong', '', $id, 'update', '修改活动('.$title.')', $url, $sql);

			//保存费用
			if($fee && $feeArr && $reg == 0){

				//先删除现有收费项
				$sql = $dsql->SetQuery("DELETE FROM `#@__huodong_fee` WHERE `hid` = $id");
				$dsql->dsqlOper($sql, "update");

				foreach($feeArr as $k => $v){
					$tit = $v['title'];
					$pri = $v['price'];
					$max = $v['max'];

					$price = $dsql->SetQuery("INSERT INTO `#@__huodong_fee` (`hid`, `title`, `price`, `max`) VALUES ('$id', '$tit', '$pri', '$max')");
					$dsql->dsqlOper($price, "update");
				}
			}

			//后台消息通知
			if($state){
				//微信通知
	            $cityName = $siteCityInfo['name'];
			    $cityid  = $siteCityInfo['cityid'];
				$param = array(
				    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
				    'cityid' => $cityid,
				    'notify' => '管理员消息通知',
				    'fields' =>array(
						'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'更新了活动 id: '.$id,
						'date' => date("Y-m-d H:i:s", time()),
					)
				);
				updateAdminNotice("huodong", "detail",$param);
                dataAsync("huodong",$id);  // 活动、修改

                return "修改成功，请等待管理员审核！";
			}else{
				return "修改成功";
			}

		}else{

			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');

		}

	}


	/**
		* 删除活动
		* @return array
		*/
	public function del(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$archives = $dsql->SetQuery("SELECT l.*, (SELECT count(`id`) FROM `#@__huodong_reg` r WHERE r.`hid` = $id AND (r.`state` = 1 OR r.`state` = 2)) reg FROM `#@__huodong_list` l WHERE l.`id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['uid'] == $uid){

				//已经有报名的不可以删除
				if($results['reg'] > 0){
					return array("state" => 200, "info" => '已经有会员报名，不可以删除！');
				}else{

					//删除评论
					$archives = $dsql->SetQuery("DELETE FROM `#@__public_comment_all` WHERE `type` = 'huodong-detail' AND `aid` = ".$id);
					$dsql->dsqlOper($archives, "update");

					//删除缩略图
					delPicFile($results['litpic'], "delThumb", "huodong");

					if(!empty($results['body'])){
						delEditorPic($results['body'], "info");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__huodong_list` WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
                
                    //记录用户行为日志
                    memberLog($uid, 'huodong', '', $id, 'delete', '删除活动('.$results['title'].')', '', $archives);

                    dataAsync("huodong",$id);  // 活动、删除

                    return array("state" => 100, "info" => '删除成功！');
				}

			}else{
				return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
			}
		}else{
			return array("state" => 101, "info" => '活动不存在，或已经删除！');
		}

	}


	/**
	 * 报名记录
	 * @param $hid int 活动ID
	 * @return array
	 */
	function regList(){
		global $dsql;
		global $userLogin;

		$param = $this->param;
		$hid   = (int)$param['hid']; //活动ID
		$state = (int)$param['state']; //状态
		$page = (int)$param['page']; //页码
		$pageSize = (int)$param['pageSize']; //每页显示量
        $do = $param['do'];

		if($state){
			$where = " AND r.`state` = $state";
		}else{
			$where = " AND (r.`state` = 1 || r.`state` = 2)";
		}

		$pageSize = empty($pageSize) ? 10000 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$uid = $userLogin->getMemberID();

        //活动详情页也用到了，这里暂不做限制
        // if($uid == -1){
		// 	return array("state" => 200, "info" => '登录超时，请重新登录！');
		// }

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'huodong','type'=>'2')))  return array("state" => 200, "info" => "商家权限验证失败！");  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }

        //获取活动标题
        $_title = '';
        $sql = $dsql->SetQuery("SELECT `title` FROM `#@__huodong_list` WHERE `id` = $hid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_title = $ret[0]['title'];
        }else{
            return array("state" => 200, "info" => '活动不存在！');
        }

        // $where .= " AND l.`uid` = $uid";  //限制只能获取当前登录人的数据


		$archives = $dsql->SetQuery("SELECT m.`mtype`, m.`nickname`, m.`company`, m.`photo`, m.`phone`, r.`uid`, r.`date`, r.`fid`, r.`property`, r.`state`,r.`usedate`,f.`title`, f.`price`, l.`uid` userid FROM `#@__huodong_reg` r LEFT JOIN `#@__member` m ON m.`id` = r.`uid` LEFT JOIN `#@__huodong_fee` f ON f.`id` = r.`fid` LEFT JOIN `#@__huodong_list` l ON l.`id` = $hid WHERE r.`hid` = ".$hid);

		//总条数
		$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
		$totalPage = ceil($totalCount/$pageSize);

        if($do == "export"){ //循环导出【新】
            set_time_limit(0);      // 设置超时
            ini_set('memory_limit', '3072M');
            //开始导出
            $fileName = $_title . "-活动报名数据.csv";
            header('Content-Encoding: UTF-8');
            header("Content-type:application/vnd.ms-excel;charset=UTF-8");
            header('Content-Disposition: attachment;filename="' . $fileName . '"');
            //打开php标准输出流
            $fp = fopen('php://output', 'a');
            //添加BOM头，以UTF8编码导出CSV文件，如果文件头未添加BOM头，打开会出现乱码。
            fwrite($fp, chr(0xEF).chr(0xBB).chr(0xBF));
            //添加导出标题
            fputcsv($fp, ['报名会员', '票型', '报名金额', '报名资料', '报名时间', '状态', '验票时间']);
            $nums = 20000; //每次导出数量【如果这个值太小反而容易网络失败，一般来说2、3万没有问题】
            $step = ceil($totalCount/$nums); //循环次数
    
            for($i = 0; $i < $step; $i++) {
                $start = $i * $nums;
                $archives = $dsql->SetQuery($archives.$where . " LIMIT $start, $nums");
                $results = $dsql->dsqlOper($archives, "results");
                $list = array();
                foreach ($results as $value) {

                    $username = "未知";
                    if ($value["uid"]){
                        $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` =".$value["uid"]);
                        $ret      = $dsql->dsqlOper($sql, "results");
                        if ($ret[0]['nickname']) {
                            $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                        }
                    }

                    $list["nickname"] =$username;

                    if ($value['fid']){
                        $archives = $dsql->SetQuery("SELECT `title`,`price` FROM `#@__huodong_fee` WHERE `id` = ".$value['fid']);
                        $results = $dsql->dsqlOper($archives, "results");
                        $list["piaotitle"]    = $results[0]['title'];
                        $list["piaoprice"]    = $results[0]['price'];
                    }else{
                        $list["piaotitle"]    = '免费';
                        $list["piaoprice"]    = '0';
                    }

                    $Str = array();
                    $property = $value['property'] ? unserialize($value['property']) : array();
                    if (is_array($property)){
                        foreach ($property as $kk=>$vv){
                            $_kk = array_keys($vv)[0];
                            $_vv = $vv[$_kk];
                            if($_kk == 'areaCode'){
                                $_kk = '区号';
                            }
                            $Str[]= $_kk . '：' . $_vv;
                        }
                    }
                    $list["propertyStr"] = implode("\r\n", $Str);

                    $list["date"] = date('Y-m-d H:i:s',$value["date"]);

                    switch ($value["state"]) {
                        case "1":
                            $state = "待参与";
                            break;
                        case "2":
                            $state = "已完成";
                            break;
                        case "3":
                            $state = "已取消";
                            break;
                        case "4":
                            $state = "已退款";
                            break;
                    }

                    $list["state"] = $state;
                    $list["usedate"] = $value["usedate"] ? date('Y-m-d H:i:s',$value["usedate"]) : '';
    
                    fputcsv($fp, $list);
                }
                //每1万条数据就刷新缓冲区
                ob_flush();
                flush();
            }
            die;
        }

		$unchecked = $dsql->dsqlOper($archives . " AND r.`state` = 1", "totalCount");
		$checked = $dsql->dsqlOper($archives . " AND r.`state` = 2", "totalCount");

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"unchecked" => $unchecked,
			"checked" => $checked,
		);

		$atpage = $pageSize*($page-1);
		$where_ = " LIMIT $atpage, $pageSize";

		$list = array();
		if($totalCount > 0){
			$results = $dsql->dsqlOper($archives.$where." ORDER BY r.`id` DESC" . $where_, "results");
			if($results){
				foreach($results as $key => $val){
					$list[$key]['uid']      = $val['uid'];
					$list[$key]['nickname'] = $val['mtype'] && !empty($val['company']) ? $val['company'] : $val['nickname'];
					$list[$key]['photo']    = !empty($val['photo']) ? getFilePath($val['photo']) : "";
					$list[$key]['date']     = $val['date'];
					$list[$key]['usedate']  = $val['usedate'] !=0 ? date('Y-m-d H:i:s',$val['usedate']) : '';
					$list[$key]['property'] = $val['property'] ? unserialize($val['property']) : array();
					$list[$key]['state']    = $val['state'];

					//如果是发布者请求，列出报名的详细信息
					if($uid == $val['userid']){
						$list[$key]['phone'] = $val['phone'];
						$list[$key]['title'] = $val['title'];
						$list[$key]['price'] = $val['price'];
						$list[$key]['date']  = $val['date'];
					}
				}
			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
	 * 参与记录
	 * @return array
	 */
	function joinList(){
		global $dsql;
		global $userLogin;

		$uid      = $userLogin->getMemberID();
		$page     = (int)$this->param['page'];
		$pageSize = (int)$this->param['pageSize'];
		$state    = $this->param['state'];
		$now      = GetMkTime(time());

		if($uid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$where = "";
		if($state){

            if($state != 99){
			    $where .= " AND r.`state` = $state";
            }

            //待参与的不显示已经过期的
            if($state == 1){
                $where .= " AND l.`end` > $now";
            }

            //历史票
            if($state == 99){
                $where .= " AND (r.`state` != 1 OR l.`end` < $now)";
            }

		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$atpage = $pageSize*($page-1);
		$limit = " LIMIT $atpage, $pageSize";

		$archives = $dsql->SetQuery("SELECT r.`id`, r.`hid`, r.`fid`, r.`date`, r.`state`, l.`title`, l.`litpic`, l.`began`, l.`end`, l.`addrid`, l.`address`,l.`lng`,l.`lat`,l.`sign` FROM `#@__huodong_reg` r LEFT JOIN `#@__huodong_list` l ON l.`id` = r.`hid` WHERE r.`uid` = ".$uid." AND l.`waitpay` = 0 AND l.`state` = 1");
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//待参与
		$involved = $dsql->dsqlOper($archives." AND r.`state` = 1 AND l.`end` > $now", "totalCount");
		//已完成
		$success = $dsql->dsqlOper($archives." AND r.`state` = 2", "totalCount");
		//已取消
		$cancel = $dsql->dsqlOper($archives." AND r.`state` = 3", "totalCount");
		//已退款
		$refund = $dsql->dsqlOper($archives." AND r.`state` = 4", "totalCount");

		//总分页数
		$totalPage = ceil((int)$totalCount/(int)$pageSize);

		$archives .= $where." ORDER BY r.`id` DESC".$limit;

		$list = array();
		if($totalCount > 0){
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$list[$key]['id']     = $val['id'];
					$list[$key]['title']  = $val['title'];
					$list[$key]['litpic'] = getFilePath($val['litpic']);
					$list[$key]['date']   = $val['date'];
					$list[$key]['began']  = $val['began'];
					$list[$key]['end']  = $val['end'];
					$list[$key]['sign']  = $val['sign'];

					//区域
					global $data;
					$data = "";
					$addrArr = getParentArr("site_area", $val['addrid']);
					$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
					$list[$key]['addrname']= $addrArr;

					$list[$key]['address'] = $val['address'];
					$list[$key]['lng'] = $val['lng'];
					$list[$key]['lat'] = $val['lat'];
					$list[$key]['state'] = $val['state'];

					$param = array(
						"service"  => "huodong",
						"template" => "detail",
						"id"       => $val['hid']
					);
					$list[$key]['url'] = getUrlPath($param);

					$list[$key]['going'] = $val['end'] > $now ? 1 : 0;

					//报名人数
					$reg = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__huodong_reg` WHERE `hid` = ".$val['hid']." AND (`state` = 1 || `state` = 2)");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$reg = $ret[0]['t'];
					}
					$list[$key]['reg'] = $reg;

                    //费用信息
                    $feetitle = '';
                    $price = 0;
                    $fid = (int)$val['fid'];

                    if($fid){
                        $sql = $dsql->SetQuery("SELECT `title`, `price` FROM `#@__huodong_fee` WHERE `id` = " . $fid);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $feetitle = $ret[0]['title'];
                            $price = $ret[0]['price'];
                        }
                    }
                    $list[$key]['feetitle'] = $feetitle;
                    $list[$key]['price'] = $price;
				}
			}
		}
		return array("pageInfo" => array("totalCount" => $totalCount, "involved" => $involved, "success" => $success, "cancel" => $cancel, "refund" => $refund, "totalPage" => $totalPage), "list" => $list);
	}


	/**
	 * 验票签到
	 */
	public function verifyCode(){
		global $dsql;
		global $userLogin;
		global $siteCityInfo;
		$codes = preg_replace("/\s+/", "", $this->param['codes']);
		$hid   = $this->param['hid'];
		$now   = GetMkTime(time());
		$uid   = $userLogin->getMemberID();

		$userinfo = $userLogin->getMemberInfo();
		if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "huodong")) && $userinfo['is_staff'] !=1){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

        if($userinfo['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'huodong','type'=>'3')))  return array("state" => 200, "info" => "商家权限验证失败！");  //商家权限验证失败！

            $uid = $userinfo['companyuid'];
        }
		if(empty($hid)) return array("state" => 200, "info" => '活动ID传输错误！！');
		if(empty($codes)) return array("state" => 200, "info" => '请输入电子票号！');

		//查询当前会员是否是活动发布者
		$sql = $dsql->SetQuery("SELECT `id`,`cityid`,`title` FROM `#@__huodong_list` WHERE `id` = $hid AND `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret) return array("state" => 200, "info" => '商家权限验证失败！');

		$cityid = $ret[0]['cityid'];
        $title = $ret[0]['title'];

		$codeArr = explode(",", $codes);
		$success = 0;
        $now = GetMkTime(time());
		foreach ($codeArr as $key => $value) {

			//查询电子票
			$sql = $dsql->SetQuery("SELECT r.`id`, f.`price`,r.`uid`,r.`hid`,r.`ordernum` FROM `#@__huodong_reg` r LEFT JOIN `#@__huodong_fee` f ON f.`id` = r.`fid` WHERE r.`hid` = $hid AND r.`code` = '$value' AND r.`state` = 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$id 	= $ret[0]['id'];
				$hid 	= $ret[0]['hid'];
				$price = $ret[0]['price'];
				$reguid = $ret[0]['uid'];
                $ordernum = $ret[0]['ordernum'];

                //获取订单信息
                $transaction_id = $paytype = '';
                $sql = $dsql->SetQuery("SELECT `transaction_id`, `paytype`, `amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                $ret = $dsql->dsqlOper($sql, "results");
                $truepayprice = 0;
                if($ret){
                    $transaction_id = $ret[0]['transaction_id'];
                    $paytype  		= $ret[0]['paytype'];
                    $truepayprice  	= $ret[0]['amount'];
                }

				//更新电子票状态
				$sql = $dsql->SetQuery("UPDATE `#@__huodong_reg` SET `state` = 2,`usedate` = '".$now."' WHERE `id` = $id");
				$dsql->dsqlOper($sql, "update");
            
                //记录用户行为日志
                memberLog($uid, 'huodong', 'order', $id, 'update', '活动签到('.$title.'=>'.$value.')', '', $sql);

				//扣除佣金
				global $cfg_huodongFee;
				global $cfg_fzhuodongFee;
				$cfg_huodongFee = (float)$cfg_huodongFee;
				$cfg_fzhuodongFee = (float)$cfg_fzhuodongFee;

				$fee = $price * $cfg_huodongFee / 100;
				$fee = $fee < 0.01 ? 0 : $fee;
				$price_ = sprintf('%.2f', $price - $fee);

				//分销信息
				global $cfg_fenxiaoState;
				global $cfg_fenxiaoSource;
				global $cfg_fenxiaoAmount;
				global $cfg_fenxiaoDeposit;
				include HUONIAOINC."/config/huodong.inc.php";
				$fenXiao = (int)$customfenXiao;

				//分销金额
				$_fenxiaoAmount = $price;
				if($cfg_fenxiaoState && $fenXiao){

					//商家承担
					if($cfg_fenxiaoSource){
                        $fx_shouldMoney = ($price * $cfg_fenxiaoAmount / 100);
						$price_ = $price_ - $fx_shouldMoney;

					//平台承担
					}else{
						$_fenxiaoAmount = $fee;
					}
				}

				$_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                //分佣 开关
                $paramarr['amount'] = $_fenxiaoAmount;
                if($fenXiao == 1){
                    $_fx_title = $hid . "_" . time();
                    (new member())->returnFxMoney("huodong", $reguid, $_fx_title, $paramarr);
                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'huodong'");
                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    if($cfg_fenxiaoSource){
                        $fx_less = $fx_shouldMoney  - $fenxiaomonyeres[0]['allfenxiao'];
                        //如果系统没有开启资金沉淀才需要查询实际分销了多少
                        if(!$cfg_fenxiaoDeposit){
                            $price_     += $fx_less; //没沉淀，还给商家
                        }else{
                            $precipitateMoney = $fx_less;
                            if($precipitateMoney > 0){
                                (new member())->recodePrecipitationMoney($uid,$hid,$_fx_title,$precipitateMoney,$cityid,"huodong");
                            }
                        }
                    }
                }
				$price_ = $price_ < 0.01 ? 0 : $price_;

				
                //分站佣金
                $fzFee = cityCommission($cityid,'huodong');
				//分站提成
				$fztotalAmount_ =  $fee * (float)$fzFee / 100 ;
				$fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
				$fee-=$fztotalAmount_;//总站-=分站
				$cityName 	=  getSiteCityName($cityid);

				if($price_ > 0){
					//将费用转至商家帐户
					$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$price_' WHERE `id` = '$uid'");
					$dsql->dsqlOper($archives, "update");

                    $_title = "活动收入";
                    $param = array(
                        "service"  => "huodong",
                        "template" => "detail",
                        "id"       => $hid
                    );
                    $urlParam = serialize($param);
                    $user  = $userLogin->getMemberInfo($uid);
                    $usermoney = $user['money'];
//                    $money      = sprintf('%.2f',($usermoney+$price_));

                    $_info = "活动订单收入：".$title."，订单号：" . $ordernum;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$uid', '1', '$price_', '$_info', '$now','huodong','shangpinxiaoshou','$_title','$ordernum','$urlParam','$usermoney')");
                    $dsql->dsqlOper($archives, "update");

					//分站
					$fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
					$dsql->dsqlOper($fzarchives, "update");
					//保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$price_', '$_info', '$now','$cityid','$fztotalAmount_','huodong',$fee,'1','shangpinxiaoshou','$usermoney')");
                    $lastid = $dsql->dsqlOper($archives, "lastid");
                    substationAmount($lastid,$cityid);

                    if($truepayprice <=0){
                        $truepayprice = $price_;
                    }
                    //工行E商通银行分账
                    if($transaction_id){
                        rfbpShareAllocation(array(
                            "uid" => $uid,
                            "ordertitle" => "活动订单收入", //教育订单
                            "ordernum" => $ordernum,
                            "orderdata" => array('活动标题' => $huodong, '票型名称' => $title),
                            "totalAmount" => $price,
                            "amount" => $price_,
                            "channelPayOrderNo" => $transaction_id,
                            "paytype" => $paytype
                        ));
                    }

//                    $dsql->dsqlOper($archives, "update");

					//微信通知
				    $param = array(
				    		'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
				        	'cityid' => $cityid,
				            'notify' => '管理员消息通知',
				            'fields' =>array(
					            'contentrn'  => $cityName.'分站——huodong模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
					            'date' => date("Y-m-d H:i:s", time()),
					        )
				    );

				    $params = array(
				    		'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
				        	'cityid' => $cityid,
				            'notify' => '管理员消息通知',
				            'fields' =>array(
					            'contentrn'  => $cityName.'分站——huodong模块——平台获得佣金 :'.$fee.' ——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
					            'date' => date("Y-m-d H:i:s", time()),
					        )
				    );
			        //后台微信通知
			        updateAdminNotice("huodong", "detail",$param);
			        updateAdminNotice("huodong", "detail",$params);

				}


				$success++;
			}

		}

		if($success > 0){
			return "签到成功！";
		}else{
			return array("state" => 200, "info" => '签到失败，请检查您输入的电子票号！');
		}

	}


}
