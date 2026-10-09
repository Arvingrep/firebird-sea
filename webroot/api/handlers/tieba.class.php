<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 贴吧API接口
 *
 * @version        $Id: tieba.class.php 2016-11-17 上午11:16:22 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class tieba {
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

		require(HUONIAOINC."/config/tieba.inc.php");

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
		// global $hotline_config;           //咨询热线配置
		// global $customHotline;            //咨询热线
		// global $customTemplate;           //模板风格

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

		// $domainInfo = getDomain('tieba', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('tieba', $customSubDomain);

        //分站自定义配置
        $ser = 'tieba';
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
					$return['description'] = str_replace(PHP_EOL, ' ', str_replace('$city', $cityName, $customSeoDescription));
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
            $return['sharePic']      = getAttachemntFile($customSharePic ? $customSharePic : $cfg_sharePic);
			$return['subDomain']     = $customSubDomain;
			$return['channelDomain'] = $customChannelDomain;
			$return['channelSwitch'] = $customChannelSwitch;
			$return['closeCause']    = $customCloseCause;
			$return['title']         = str_replace('$city', $cityName, $customSeoTitle);
			$return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
			$return['description']   = str_replace(PHP_EOL, ' ', str_replace('$city', $cityName, $customSeoDescription));
			$return['hotline']       = $hotline;
			$return['template']      = $customTemplate;
			$return['touchTemplate'] = $customTouchTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
			$return['atlasSize']     = $custom_atlasSize;
			$return['atlasType']     = $custom_atlasType;
			$return['rewardSwitch']  = isByteMiniprogram() ? 1 : (int)$customRewardSwitch;  //抖音小程序中强制关闭
			$return['rewardLimit']  = $customRewardLimit ? (float)$customRewardLimit : 100;
			$return['rewardOption']  = $customRewardOption ? array_map('floatval', explode("\r\n", $customRewardOption)) : array(1,2,5,10,20);
		}

		return $return;

	}


	/**
     * 贴吧分类
     * @return array
     */
	public function type(){
		global $dsql;
		$type = $page = $pageSize = $where = "";

		$cityid = 0;

		//数据共享
		require(HUONIAOINC."/config/tieba.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			// $cityid = getCityId();
		}

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
		// $results = $dsql->getTypeList($type, "tieba_type", $son, $page, $pageSize);
        $results = getCache("tieba_type", function() use($dsql, $type, $son, $page, $pageSize){
            return $dsql->getTypeList($type, "tieba_type", $son, $page, $pageSize);
        }, 0, array("sign" => $type."_".(int)$son, "savekey" => 1));
		if($results){
			return $results;
		}
	}


	/**
     * 贴吧分类详情
     * @return array
     */
	public function typeDetail(){
		global $dsql;
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $return = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__tieba_type` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

            $this->param = array('typeid' => $id);
            $statistics = $this->getFormat();

            $return = array(
                'typename' => $results[0]['typename'],
                'icon' => getFilePath($results[0]['icon']),
                'statistics' => $statistics
            );
        }
        return $return;
	}


    /**
     * 城市分类
     * @return array
     */
    public function city(){
        $userLogin = new userLogin($dbo);
        $adminCityArr = $userLogin->getAdminCity();
        $results = empty($adminCityArr) ? array() : $adminCityArr;
        if($results){
            return $results;
        }
    }


	/**
     * 帖子列表
     * @return array
     */
	public function tlist(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$typeid = $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid   = $this->param['typeid'];
				$keywords = $this->param['keywords'];
				$name     = $this->param['username'];
				$orderby  = $this->param['orderby'];
				$u        = $this->param['u'];
				$notid    = $this->param['notid'];
				$uid      = $this->param['uid'];
				$state    = $this->param['state'];
				$ispic    = $this->param['ispic'];
				$istop    = $this->param['istop'];
				$jinghua  = $this->param['jinghua'];
				$tag1     = $this->param['tag1'];
				$tag2     = $this->param['tag2'];
				$tag3     = $this->param['tag3'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
                $day    = (int)$this->param['day'];        //根据时间筛选
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
		}

		//数据共享
		require(HUONIAOINC."/config/tieba.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid && $u != 1){
				$where .= " AND l.`cityid` = ".$cityid;
			}else{
				$where .= " AND l.`cityid` != 0";
			}
		}

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
            $where .= " AND l.`id` IN ($id)";
        }

		if ($day)
        {
            $daynumber =  time()-86400*$day;
           $where .= " AND  `pubdate` > $daynumber";
        }

        //不能包含哪些新闻
        if(!empty($notid)){
            $where .= " AND l.`id` not in ($notid)";
        }

		if(!empty($istop)){
			$where .=" AND l.`top` = 1";
		}

		if(!empty($jinghua)){
			$where .=" AND l.`jinghua` = 1";
		}

		if(!empty($tag1)){
			$where .=" AND l.`tag1` = 1";
		}

		if(!empty($tag2)){
			$where .=" AND l.`tag2` = 1";
		}

		if(!empty($tag3)){
			$where .=" AND l.`tag3` = 1";
		}

		$userid = $userLogin->getMemberID();

		//是否输出当前登录会员的信息
		if($u != 1){
			$where .= " AND l.`state` = 1 AND l.`waitpay` = 0 AND l.`del` = 0";

			//取指定会员的信息
			if($uid){
				$where .= " AND l.`uid` = $uid";
			}
		}else{
			$where .= " AND l.`del` = 0 AND l.`uid` = ".$userid;
			if($state != ""){
				$where1 = " AND l.`state` = ".$state;
			}
		}

		//遍历分类
		if(!empty($typeid)){
			if(strstr($typeid, ',')){

				$typeidArr = array();
				$typeid = explode(',', $typeid);
				foreach ($typeid as $key => $value) {
					if($dsql->getTypeList($value, "tieba_type")){
						global $arr_data;
						$arr_data = array();
						$lower = arr_foreach($dsql->getTypeList($value, "tieba_type"));
						$lower = $value.",".join(',',$lower);
					}else{
						$lower = $value;
					}
					array_push($typeidArr, $lower);
				}

				$typeidArr = join(',', $typeidArr);
				$where .= " AND `typeid` in ($typeidArr)";

			}else{
				if($dsql->getTypeList($typeid, "tieba_type")){
					global $arr_data;
					$arr_data = array();
					$lower = arr_foreach($dsql->getTypeList($typeid, "tieba_type"));
					$lower = $typeid.",".join(',',$lower);
				}else{
					$lower = $typeid;
				}
				$where .= " AND `typeid` in ($lower)";
			}
		}


		//模糊查询关键字
		if(!empty($keywords)){

			//搜索记录
			siteSearchLog("tieba", $keywords);

			$keywords = explode(" ", $keywords);
			$w = array();
			foreach ($keywords as $k => $v) {
				if(!empty($v)){
					$w[] = "`title` like '%".$v."%'";
				}
			}
			$where .= " AND (".join(" OR ", $w).")";
		}

		if(!empty($name)){
			//搜索记录
			siteSearchLog("tieba", $name);
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$name%' or `nickname` like '%$name%' or `company` like '%$name%'");
			$retname = $dsql->dsqlOper($sql, "results");
			if(!empty($retname) && is_array($retname)){
				$list_name = array();
				foreach ($retname as $key => $value) {
					$list_name[] = $value["id"];
				}
				$idList = join(",", $list_name);
				$where .= " AND  l.`uid` in ($idList) ";
			}
		}

		//1、视频 2、图片 3、音频
		if($ispic == 1){
			$where .= " AND `imgtype` = 1";
		}elseif($ispic == 2){
			$where .= " AND `videotype` = 1";
		}elseif($ispic == 3){
			$where .= " AND `audiotype` = 1";
		}

		$order = " ORDER BY `top` DESC, `jinghua` DESC, `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;
		//评论排行
//        AND `pubdate`> $day ;
		if($orderby == "reply"){
			$order = " ORDER BY comment DESC, `top` DESC, `jinghua` DESC, `weight` DESC, `id` DESC";
		}elseif($orderby == "pubdate"){
			$order = " ORDER BY pubdate DESC";
		}elseif($orderby == "click"){
			$order = " ORDER BY click DESC";
		}elseif($orderby == "up"){
			$order = " ORDER BY `up` DESC";
		}elseif($orderby == "active"){//发帖最多的用户
			$order = " GROUP BY uid order by count(id) desc";
		}elseif($orderby == "lastreply"){//最新回复  去除重复的tid
			// $sql = $dsql->SetQuery("SELECT max(id) as mid, `tid`, `pubdate` FROM `#@__tieba_reply` WHERE `state` = 1  GROUP BY tid ORDER BY  mid DESC, pubdate DESC");
			$sql = $dsql->SetQuery("SELECT max(id) as mid, `aid`, `dtime` FROM `#@__public_comment_all` WHERE `ischeck` = 1  AND `pid` = 0 AND `type` = 'tieba-detail' GROUP BY aid ORDER BY  mid DESC, dtime DESC");
			$retReply = $dsql->dsqlOper($sql, "results");
			if($retReply){
				foreach ($retReply as $key => $value) {
					$replyArr[] = $value['aid'];
				}
				$replyArr = join(',',$replyArr);
				$where .= " AND `id` in ($replyArr)";
				$order = " order by field (`id`,$replyArr)";
			}
		//本周阅读量排行
		}elseif($orderby == 'week'){
			// $order = " AND YEARWEEK(date_format(FROM_UNIXTIME(l.`pubdate`),'%Y-%m-%d')) = YEARWEEK(now()) ORDER BY l.`click` DESC, l.`weight` DESC, l.`id` DESC";
			$stime = GetMkTime(date("Y-m-d",strtotime("+7 day")));
			$etime = $stime + 86400;
			$order = " AND `pubdate` BETWEEN $stime AND $etime ORDER BY l.`click` DESC, l.`weight` DESC, l.`id` DESC";
		}

		$archives = $dsql->SetQuery("SELECT l.`up`, l.`id`, l.`typeid`, l.`uid`, l.`title`,l.`comment`,l.`pubdate`, l.`color`, l.`click`, l.`bold`, l.`jinghua`, l.`top`, l.`content`, l.`state`, l.`ip`, l.`ipaddr`, l.`waitpay` FROM `#@__tieba_list` l WHERE 1 = 1 AND `del` = 0".$where);


		$archives_count = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__tieba_list` l WHERE 1 = 1".$where);

		//总条数
		// $totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		// $totalCount = (int)$totalResults[0][0];
		$totalCount = (int)getCache("tieba_total", $archives_count, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));

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
			$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		// $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");
		$results = getCache("tieba_list", $archives.$where1.$order.$where, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']     = $val['id'];
				$list[$key]['typeid'] = $val['typeid'];
				$list[$key]['uid']    = $val['uid'];
				$username = $photo = "";
				$sql = $dsql->SetQuery("SELECT `nickname`, `photo` FROM `#@__member` WHERE `id` = ".$val['uid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['nickname'];
					$photo    = getFilePath($ret[0]['photo']);
				}
				$list[$key]['username'] = $username;
				$list[$key]['photo'] = $photo;

				$list[$key]['title']  = $val['title'];
				$list[$key]['color']  = $val['color'];
				$list[$key]['click']  = $val['click'];
				$list[$key]['bold']    = $val['bold'];
				$list[$key]['jinghua'] = $val['jinghua'];
				$list[$key]['top']     = $val['top'];
				$list[$key]['ip']     = '';
				$list[$key]["ipAddress"] = '';

				$archives   = $dsql->SetQuery("SELECT `id` FROM `#@__public_up_all` WHERE `module` = 'tieba' AND `action` = 'detail' AND `type` = '0' AND `tid` = {$val['id']}");
				$totalCount = $dsql->dsqlOper($archives, "totalCount");
				$list[$key]["up"]      = $totalCount;

				$content = $val['content'];
				if(strpos($content,'video')){
					$list[$key]['isvideo'] = 1;
				}
				$list[$key]['content'] = !empty($content) ? cn_substrR(strip_tags($content), 120) : "";

				global $data;
				$data = "";
				$typeArr = getParentArr("tieba_type", $val['typeid']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$list[$key]['typename'] = $typeArr;

				$list[$key]['pubdate']    = $val['pubdate'];
				$list[$key]['pubdate1']   = floor((GetMkTime(time()) - $val['pubdate'] / 86400) % 30) > 30 ? date("Y-m-d", $val['pubdate']) : FloorTime(GetMkTime(time()) - $val['pubdate']);

				//会员中心显示信息状态
				if($u == 1 && $userid > -1){
					$list[$key]['state'] = $val['state'];
					$list[$key]['waitpay'] = $val['waitpay'];
				}

				$list[$key]['reply'] = $val['comment'];
				$param = array(
					"service"     => "tieba",
					"template"    => "detail",
					"id"          => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);


				$imgGroup = array();
				$video = '';
				global $cfg_attachment;
				global $cfg_basehost;

				$attachment = str_replace("http://".$cfg_basehost, "", $cfg_attachment);
				$attachment = str_replace("https://".$cfg_basehost, "", $attachment);

				$attachment = str_replace("/", "\/", $attachment);
				$attachment = str_replace(".", "\.", $attachment);
				$attachment = str_replace("?", "\?", $attachment);
				$attachment = str_replace("=", "\=", $attachment);

				preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $content, $picList);
				$picList = array_unique($picList[1]);


				preg_match_all("/<[img|IMG].*?src=[\'|\"](.*?(?:[\.gif|\.jpg|\.png|\.jpeg|\.GIF|\.JPG|\.PNG|\.JPEG]))[\?|\'|\"].*?[\/]?>/i", $content, $picList_);
				$picList_ = array_unique($picList_[1]);

				if($picList_){
					foreach ($picList_ as $k => $v) {
						if(!strstr($v, 'attachment') && !strstr($v, 'emot')){
							array_push($picList, (strstr($v, 'http') || strstr($v, '/tieba/') ? '' : (strstr($v, '/static/images/ui/') ? '' : (strstr($v, '/uploads/') ? '' : '/tieba/'))) . $v);
						}
					}
				}
				
				//提取视频封面图片
			    preg_match_all("/poster\=[\"|'](.*)[\"|']/isU", $content, $_picList);
			    $_picList = array_unique($_picList[1]);
			    $_picList = str_replace(str_replace("https://".$cfg_basehost, "", $cfg_attachment), "", $_picList);
			    array_push($picList, $_picList[0]);
				
			    if((count($picList) == 2 || count($picList) == 3) && strstr($picList[1], $picList[0])){
			        unset($picList[0]);
			    }
			    
			    $picList = array_unique($picList);

				//内容图片  如果后台开启隐藏附件路径功能，这里就不获取不到图片了
				if(!empty($picList)){
					foreach($picList as $v_){
						$filePath = getRealFilePath($v_);
						$fileType = explode(".", $filePath);
						$fileType = strtolower($fileType[count($fileType) - 1]);
                        $fileType = explode('?', $fileType);
                        $fileType = $fileType[0];
						$ftype = array("jpg", "jpge", "gif", "jpeg", "png", "bmp");
						if(in_array($fileType, $ftype) && !strstr($filePath, 'video')){
							$imgGroup[] = $filePath;
						}elseif($fileType == 'mp4' || $fileType == 'mov'){
							if(strstr($filePath, 'snapshot')){
						        $imgGroup[] = $filePath;
						    }else{
							    $imgGroup[] = str_replace('.mp4', '.jpg', str_replace('.mov', '.jpg', $filePath));
						    }
							$video = $filePath;
						}
					}
				}
				$list[$key]['imgGroup'] = $imgGroup;
				$list[$key]['video'] = $video;

				//最新评论
				$lastReply = array();
				// $sql = $dsql->SetQuery("SELECT `uid`, `content`, `pubdate` FROM `#@__tieba_reply` WHERE `state` = 1 AND `tid` = ".$val['id']);
				$sql = $dsql->SetQuery("SELECT `userid` uid, `content`, `dtime` pubdate FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tieba-detail' AND `aid` = '".$val['id']."' AND `pid` = 0");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$username = "";
					$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$ret[0]['uid']);
					$ret_ = $dsql->dsqlOper($sql, "results");
					if($ret_){
						$username = $ret_[0]['nickname'];
					}

					$lastReply = array(
						"uid" => $ret[0]['uid'],
						"username" => $username,
						"content" => !empty($ret[0]['content']) ? cn_substrR(strip_tags($ret[0]['content']), 100) : "",
						"pubdate" => $ret[0]['pubdate'],
					);
				}

				$list[$key]['lastReply'] = $lastReply;

				// 打赏
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$val["id"]." AND `state` = 1");
				//总条数
				$totalCount = $dsql->dsqlOper($archives, "totalCount");
				if($totalCount){
					$archives = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$val["id"]." AND `state` = 1");
					$ret = $dsql->dsqlOper($archives, "results");
					$totalAmount = $ret[0]['totalAmount'];
				}else{
					$totalAmount = 0;
				}
				$list[$key]['reward'] = array("count" => $totalCount, "amount" => $totalAmount);

				if($orderby=='active'){
					//是否相互关注
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = " . $val['uid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$list[$key]['isfollow'] = 1;//关注
					}elseif($userid == $val['ruid']){
						$list[$key]['isfollow'] = 2;//自己
					}else{
						$list[$key]['isfollow'] = 0;//未关注
					}

					//帖子总数
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `uid` = " . $val['uid']);
					$ret = $dsql->dsqlOper($sql, "results");
					$list[$key]['tiziTotal'] = $ret[0]['t'];
					//粉丝人数
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $val['uid']);
					$fansret = $dsql->dsqlOper($sql, "results");
					$list[$key]['totalFans'] = $fansret[0]['t'];
				}


                //查询点赞用户信息
                $isdz = 0;
                if($userid > 0){
                    $diansql = $dsql->SetQuery("SELECT `id` FROM `#@__public_up_all` WHERE `module`= 'tieba' AND tid = " . $val['id'] . " AND `ruid` = " . $userid);
                    $dianres = $dsql->dsqlOper($diansql, "results");
                    if($dianres){
                        $isdz = 1;
                    }
                }
                $list[$key]['isdz'] = (int)$isdz;

			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 帖子详细
     * @return array
     */
	public function detail(){
		global $dsql;
		global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $from;  //来源，用于判断是否来自APP源生页面

		$detail = array();
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $userid = $userLogin->getMemberID();

		//判断是否管理员已经登录
		//功能点：管理员和信息的发布者可以查看所有状态的信息
		$where = "";
		if($userLogin->getUserID() == -1){

			$where = " AND `state` = 1";

			//如果没有登录再验证会员是否已经登录
			if($userid == -1){
				$where = " AND `state` = 1";
			}else{
				$where = " AND (`state` = 1 OR `uid` = ".$userid.")";
			}

		}
		$where .= " AND `waitpay` = 0";
        $where .= " AND `del` = 0 ";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__tieba_list` WHERE `id` = ".$id.$where);
		// $results  = $dsql->dsqlOper($archives, "results");
		$results = getCache("tieba_detail", $archives, 0, $id);
		if($results){
			$detail["id"]       = $results[0]['id'];
			$detail["typeid"]   = $results[0]['typeid'];

			$typename = "";
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__tieba_type` WHERE `id` = " . $results[0]['typeid']);
			$typename = getCache("tieba_type", $sql, 0, array("name" => "typename", "sign" => $results[0]['typeid']));
			$detail['typename'] = $typename;

			$detail["uid"]      = $results[0]['uid'];
			$detail["state"]    = $results[0]['state'];
			$detail["title"]    = $results[0]['title'];
			$detail["cityid"]   = $results[0]['cityid'];


            //将内容中的图片地址转为真实地址
            $body = str_replace(array("\r\n","\n","\r"), '<br />', $results[0]['content']);
            $u = str_replace('//', '\/\/', $cfg_secureAccess) . $cfg_basehost . '\/include\/attachment.php';
            $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

            //特殊情况兼容处理
            $u = str_replace('//', '\/\/', $cfg_secureAccess) . 'www.' . $cfg_basehost . '\/include\/attachment.php';
            $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

            global $cfg_attachment;
            $attachment = substr($cfg_attachment, 1, strlen($cfg_attachment));

            $attachment = substr("/include/attachment.php?f=", 1, strlen("/include/attachment.php?f="));

            global $cfg_basehost;
            $attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
            $attachment = str_replace("https://" . $cfg_basehost, "", $attachment);
            $attachment = substr($attachment, 1, strlen($attachment));

            $attachment = str_replace("/", "\/", $attachment);
            $attachment = str_replace(".", "\.", $attachment);
            $attachment = str_replace("?", "\?", $attachment);
            $attachment = str_replace("=", "\=", $attachment);

            preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $body, $fileList);
            $fileList = array_unique($fileList[1]);

            //内容图片
            $fileArr = array();
            if (!empty($fileList)) {
                foreach ($fileList as $v_) {
                    $filePath = getRealFilePath($v_);
                    array_push($fileArr, array(
                        'source' => '/include/attachment.php?f=' . $v_,
                        'turl' => $filePath
                    ));
                }
            }

            //替换内容中的文件地址
            if($fileArr){
                foreach ($fileArr as $key => $val){
                    $file_source = $val['source'];
                    $file_turl = $val['turl'];
                    $body = str_replace($file_source, $file_turl, $body);
                }
            }
			$detail["content"]  = $body;


            
			$detail["pubdate"]  = $results[0]['pubdate'];
			$detail["ip"]       = $results[0]['ip'];
			$detail["ipAddress"] = $results[0]['ipaddr'];
			$detail["iphome"]   = getIpHome($results[0]['ipaddr']);
			$detail["color"]    = $results[0]['color'];
			$detail["click"]    = $results[0]['click'];
			$detail["bold"]     = $results[0]['bold'];
			$detail["isreply"]  = $results[0]['isreply'];
			$detail["jinghua"]  = $results[0]['jinghua'];
			$detail["top"]      = $results[0]['top'];
            $detail['reply'] = $results[0]['comment'];;
			//楼主信息
			$louzu = array();
			if($results[0]['uid']){
				//帖子总数
				$$tizi_louzuTotal = 0;
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `uid` = " . $results[0]['uid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$tizi_louzuTotal = $ret[0]['t'];
				}
				//精华总数
				$tizi_louzuJinghuaTotal = 0;
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0  AND `jinghua` = 1 AND `uid` = " . $results[0]['uid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$tizi_louzuJinghuaTotal = $ret[0]['t'];
				}

				$louzuInfo = $userLogin->getMemberInfo($results[0]['uid'], 1);
				if($louzuInfo && is_array($louzuInfo)){
					$louzu = array(
						"uid" => $results[0]['uid'],
						"photo" => $louzuInfo['photo'],
						"nickname" => $louzuInfo['nickname'],
						"regtime" => $louzuInfo['regtime'],
						"tizi_louzuTotal" => $tizi_louzuTotal,
						"tizi_louzuJinghuaTotal" => $tizi_louzuJinghuaTotal
					);
				}
			}
			$detail["louzu"] = $louzu;


            // $imgGroup = array();
            // global $cfg_attachment;
            // global $cfg_basehost;

            // $attachment = str_replace("http://".$cfg_basehost, "", $cfg_attachment);
            // $attachment = str_replace("https://".$cfg_basehost, "", $attachment);

            // $attachment = str_replace("/", "\/", $attachment);
            // $attachment = str_replace(".", "\.", $attachment);
            // $attachment = str_replace("?", "\?", $attachment);
            // $attachment = str_replace("=", "\=", $attachment);

            // preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $results[0]['content'], $picList);
            // $picList = array_unique($picList[1]);

            // if(empty($picList)){
            //     preg_match_all("/\/tieba\/(.*)[\"|'| ]/isU", $results[0]['content'], $picList);
            //     $picList = array_unique($picList[1]);

            //     $newPicList = array();
            //     if($picList){
            //         foreach ($picList as $k => $v) {
            //             array_push($newPicList, '/tieba/' . $v);
            //         }
            //     }
            //     $picList = $newPicList;
            // }

            // //内容图片  如果后台开启隐藏附件路径功能，这里就不获取不到图片了
            // if(!empty($picList)){
            //     foreach($picList as $v_){
            //         $filePath = getRealFilePath($v_);
            //         $fileType = explode(".", $filePath);
            //         $fileType = strtolower($fileType[count($fileType) - 1]);
            //         $ftype = array("jpg", "jpge", "gif", "jpeg", "png", "bmp");
            //         if(in_array($fileType, $ftype)){
            //             $imgGroup[] = $filePath;
            //         }
            //     }
            // }
            // $detail['imgGroup'] = $imgGroup;


            $imgGroup = array();
            $video = '';
            global $cfg_attachment;
            global $cfg_basehost;

            $attachment = str_replace("http://".$cfg_basehost, "", $cfg_attachment);
            $attachment = str_replace("https://".$cfg_basehost, "", $attachment);

            $attachment = str_replace("/", "\/", $attachment);
            $attachment = str_replace(".", "\.", $attachment);
            $attachment = str_replace("?", "\?", $attachment);
            $attachment = str_replace("=", "\=", $attachment);

            preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $results[0]['content'], $picList);
            $picList = array_unique($picList[1]);


            preg_match_all("/<[img|IMG].*?src=[\'|\"](.*?(?:[\.gif|\.jpg|\.png|\.jpeg|\.GIF|\.JPG|\.PNG|\.JPEG]))[\?|\'|\"].*?[\/]?>/i", $results[0]['content'], $picList_);
            $picList_ = array_unique($picList_[1]);

            if($picList_){
                foreach ($picList_ as $k => $v) {
                    if(!strstr($v, 'attachment') && !strstr($v, 'emot')){
                        array_push($picList, (strstr($v, 'http') || strstr($v, '/tieba/') ? '' : (strstr($v, '/static/images/ui/') ? '' : (strstr($v, '/uploads/') ? '' : '/tieba/'))) . $v);
                    }
                }
            }

            //内容图片  如果后台开启隐藏附件路径功能，这里就不获取不到图片了
            if(!empty($picList)){
                foreach($picList as $v_){
                    $filePath = getRealFilePath($v_);
                    $fileType = explode(".", $filePath);
                    $fileType = strtolower($fileType[count($fileType) - 1]);
                    $fileType = explode('?', $fileType);
                    $fileType = $fileType[0];
                    $ftype = array("jpg", "jpge", "gif", "jpeg", "png", "bmp");
                    if(in_array($fileType, $ftype) && !strstr($filePath, 'video')){
                        $imgGroup[] = $filePath;
                    }elseif($fileType == 'mp4' || $fileType == 'mov'){
                        $video = $filePath;
                    }
                }
            }
            $detail['imgGroup'] = $imgGroup;
            $detail['video'] = $video;

            // 打赏
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$id." AND `state` = 1");
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            $detail['rewardcount'] = $totalCount;

            //是否关注
            $isfollow = 0;
            $userid = $userLogin->getMemberID();
            $ret = array();
            if($userid > 0){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = " . $results[0]['uid']);
                $ret = $dsql->dsqlOper($sql, "results");
            }
            if($ret){
                $detail['isfollow'] = 1;//关注
            }elseif($userid == $results[0]['uid']){
                $detail['isfollow'] = 2;//自己
            }else{
                $detail['isfollow'] = 0;//未关注
            }

            //验证是否已经收藏
            $params = array(
                "module" => "tieba",
                "temp" => "detail",
                "type" => "add",
                "id" => $id,
                "check" => 1
            );
            $collect = checkIsCollect($params);
            $detail['collect'] = $collect == "has" ? 1 : 0;

            //验证是否已经点赞
			$zanparams = array(
				"module" => "tieba",
				"temp"   => "detail",
				"id"     => $id,
				"check"  => 1
			);
			$zan = checkIsZan($zanparams);
			$detail['zan'] = $zan == "has" ? 1 : 0;
            $detail['zannum'] = (int)$results[0]['up'];



            //评论接口也会调用详情接口，导致阅读次数重复增加
            global $currentAction;
            if($_REQUEST['action'] != 'getComment' && $currentAction != 'getComment' && $_REQUEST['action'] != 'upList' && $currentAction != 'upList' && !$from){
                //更新阅读次数
                $sql = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `click` = `click` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

                $uid = $userid;
                if($uid >0 && $uid!=$results[0]['userid']) {
                    $uphistoryarr = array(
                        'module'    => 'tieba',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $results[0]['userid'],
                        'module2'   => 'detail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
            }

		}
		return $detail;
	}


	/**
     * 评论列表
     * @return array
     */
	public function reply(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$tid = $uid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$tid      = $this->param['tid'];
				$rid      = $this->param['rid'];
				$uid      = $this->param['uid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if(empty($tid)) return array("state" => 200, "info" => '格式错误！');

        $userid = $userLogin->getMemberID();

		$where = " `state` = 1 AND `tid` = ".$tid;

		//指定会员ID
		if(!empty($uid)){
			$where .= " AND `uid` = ".$uid;
		}

		//指定评论回复
		if(!empty($rid)){
			$where .= " AND `rid` = ".$rid;
		}else{
			$where .= " AND `rid` = 0";
		}

		$order    = " ORDER BY `id` ASC";
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `uid`, `content`, `pubdate`, `zan`, `zan_user` FROM `#@__tieba_reply` WHERE ".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__tieba_reply` l WHERE ".$where);

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
				$list[$key]['zan']    = $val['zan'];

				$list[$key]['content']  = preg_replace('/src="\/include\/attachment\.php/', 'class="r-pic" src="/include/attachment.php', $val['content']);
				$list[$key]['pubdate']  = $val['pubdate'];

				//是否点赞过
				if($val['zan_user']){
					$userArr               = explode(",", $val['zan_user']);
					$list[$key]['already'] = in_array($userid, $userArr) ? 1 : 0;
				}

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
					//帖子总数
					$$tizi_memberTotal = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `uid` = $memberID");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$tizi_memberTotal = $ret[0]['t'];
					}
					//精华总数
					$tizi_memberJinghuaTotal = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `jinghua` = 1 AND `uid` = $memberID");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$tizi_memberJinghuaTotal = $ret[0]['t'];
					}

					$memberInfo = $userLogin->getMemberInfo($memberID, 1);
					if(is_array($memberInfo)){
						$member = array(
							"id" => $memberID,
							"photo" => $memberInfo['photo'],
							"nickname" => $memberInfo['nickname'],
							"regtime" => $memberInfo['regtime'],
							"tizi_memberTotal" => $tizi_memberTotal,
							"tizi_memberJinghuaTotal" => $tizi_memberJinghuaTotal
						);
					}
				}
				$list[$key]['member'] = $member;

			}
		}//print_R($list);exit;

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
	 * 发表帖子
	 * @return array
	 */
	public function sendPublish(){
		global $dsql;
		global $userLogin;
		global $siteCityInfo;
        global $langData;

		$param = $this->param;
		$app   = (int)$param['app'];

		$ip = GetIp();
		$ipaddr = getIpAddr($ip);
		$pubdate = GetMkTime(time());

		include HUONIAOINC."/config/tieba.inc.php";
		$arcrank = (int)$customFabuCheck;

		//APP发贴
		if($app){

			$data = file_get_contents('php://input');
			if(empty($data)){
				return array("state" => 200, "info" => '要发表的内容为空！');
			}

			$data = json_decode($data, true);
			if(!is_array($data)){
				return array("state" => 200, "info" => '数据格式错误！');
			}

			$uid     = (int)$data['userid'];

		}else{
			//获取用户ID
			$uid = $userLogin->getMemberID();
			if($uid == -1){
				return array("state" => 200, "info" => '登录超时，请重新登录！');
			}
		}


		//用户信息
		$userinfo = $userLogin->getMemberInfo($uid);

		global $cfg_memberVerified;
		global $cfg_memberVerifiedInfo;
		if($cfg_memberVerified && $userinfo['userType'] == 1 && !$userinfo['certifyState']){
			return array("state" => 200, "info" => $cfg_memberVerifiedInfo);
		}
		// 手机认证
		global $cfg_memberBindPhone;
		global $cfg_memberBindPhoneInfo;
        global $cfg_periodicCheckPhone;
        global $cfg_periodicCheckPhoneCycle;
        $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
        $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天
		if($cfg_memberBindPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || ($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle))){
            return array("state" => 202, "info" => $periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle ? '请先验证手机号码' : $cfg_memberBindPhoneInfo);
		}
		// 关注公众号
		global $cfg_memberFollowWechat;
		global $cfg_memberFollowWechatInfo;
		if($cfg_memberFollowWechat && !$userinfo['wechat_subscribe']){
			return array("state" => 200, "info" => $cfg_memberFollowWechatInfo);
		}

		// 需要支付费用
		$amount = 0;

		// 是否独立支付 普通会员或者付费会员超出限制
		$alonepay = 0;

		$alreadyFabu = 0; // 付费会员当天已免费发布数量

		//企业会员或已经升级为收费会员的状态才可以发布 --> 普通会员也可发布
        //贴吧改为不验证是否企业会员，所有会员类型统一规则
		// if($userinfo['userType'] == 1){

			$toMax = false;

			// if($userinfo['level']){

				$memberLevelAuth = getMemberLevelAuth($userinfo['level']);
				$tiebaCount = (int)$memberLevelAuth['tieba'];

				//统计用户当天已发布数量 @
				// $today = GetMkTime(date("Y-m-d", time()));
				// $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

				//本周
				$today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
				$tomorrow = $today + 604800;

				$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__tieba_list` WHERE `uid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0 AND `del` = 0");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$alreadyFabu = $ret[0]['total'];
					if($alreadyFabu >= $tiebaCount){
						$toMax = true;
						// return array("state" => 200, "info" => '当天发布信息数量已达等级上限！');
					}else{
						// $arcrank = 1;   //如果在特权次数内，直接审核通过
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
				if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['tieba'] <= $alreadyFabu) || !$fabuFreeCount)){
					$alonepay = 1;
					$amount = $fabuAmount["tieba"];
                    $arcrank = 0;   //需要审核
				}

			}

		// }

		$waitpay = $amount > 0 ? 1 : 0;

		if($userinfo['level']){
			$auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $tiebaCount);
		}else{
			$auth = array("level" => 0, "levelname" => "普通会员", "maxcount" => 0);
		}

		//APP发贴
		if($app){

			$data = file_get_contents('php://input');
			if(empty($data)){
				return array("state" => 200, "info" => '要发表的内容为空！');
			}

			$data = json_decode($data, true);
			if(!is_array($data)){
				return array("state" => 200, "info" => '数据格式错误！');
			}

			$uid     = (int)$data['userid'];
			$title   = filterSensitiveWords($data['title']);
			$typeid  = $data['typeid'];
			$cityid  = $data['cityid'];
			$body    = $data['body'];
			$address = $data['address'];
			$lng     = $data['lng'];
			$lat     = $data['lat'];

			if(empty($uid) || $uid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');
			if(empty($title)) return array("state" => 200, "info" => '请填写标题！');
            if(empty($typeid)) return array("state" => 200, "info" => '请选择分类！');
			if(empty($cityid)) return array("state" => 200, "info" => '请选择城市！');
			if(!is_array($body)){
				return array("state" => 200, "info" => '内容格式错误！');
			}

			//组合内容
			$content = array();
			$imgtype = $videotype = $audiotype = 0;
			foreach ($body as $key => $value) {
				$k_ = array_keys($value);
				$v_ = array_values($value);
				$k = $k_[0];
				$v = $v_[0];
				if($k == "text"){
					array_push($content, '<div class="c-paragraph-text">' . preg_replace('/\/static\/images\/ui\/emot\/baidu\/(.*?)\.png/im','<img class="c-emot" src="/static/images/ui/emot/baidu/$1.png" />', str_replace(array("\r\n","\n","\r"), '<br />', $v)) . '</div>');
				}

				if($k == "image"){
					array_push($content, '<div class="c-paragraph-image"><img src="/include/attachment.php?f='.$v.'" /></div>');
                    $imgtype = 1;
				}

				if($k == "audio"){
					array_push($content, '<div class="c-paragraph-audio"><audio preload="auto"><source src="/include/attachment.php?f='.$v.'"></audio></div>');
                    $audiotype = 1;
				}

				if($k == "video"){
					array_push($content, '<div class="c-paragraph-video"><video class="video-js vjs-fluid" controls preload="auto" data-setup="{}"><source src="/include/attachment.php?f='.$v.'" type="video/mp4"></video></div>');
                    $videotype = 1;
				}

				if($k == "iframe"){
					array_push($content, '<div class="c-paragraph-iframe"><iframe src="'.$v.'" frameborder=0 "allowfullscreen"></iframe></div>');
				}
			}

			// return array("state" => 200, "info" => json_encode($content)."<br />".json_encode($data));

			if(empty($content)){
				return array("state" => 200, "info" => '内容为空，发表失败！');
			}

			$content = filterSensitiveWords(join("", $content), false);

			$content = str_replace('帖子内容', '', $content);

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__tieba_list` (`cityid`, `typeid`, `uid`, `title`, `content`, `pubdate`, `ip`, `ipaddr`, `state`, `isreply`, `address`, `lng`, `lat`, `waitpay`, `alonepay`, `weight`,`imgtype`,`videotype`,`audiotype`) VALUES ('$cityid', '$typeid', '$uid', '$title', '$content', '$pubdate', '$ip', '$ipaddr', '$arcrank', '1', '$address', '$lng', '$lat', '$waitpay', '$alonepay', 1,'$imgtype','$videotype','$audiotype')");
			$aid = $dsql->dsqlOper($archives, "lastid");

			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'tieba',
                    'template' => 'detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($uid, 'tieba', '', $aid, 'insert', '发布帖子('.$title.')', $url, $archives);

			    dataAsync("tieba",$aid);
                autoShowUserModule($uid,'tieba');  // app新发帖

				//微信通知
	            $cityName = $siteCityInfo['name'];
	        	$cityid  = $siteCityInfo['cityid'];
                $infoname = getModuleTitle(array('name' => 'tieba'));    //获取模块名

		        $param = array(
		        	'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
			            'contentrn'  => $cityName."分站\r\n".$infoname."模块\r\n用户：".$userinfo['nickname']."\r\n发布帖子：".$title,
			            'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

	            if(!$arcrank){
					updateAdminNotice("tieba", "detail",$param);
	            }

	            if ($arcrank && !$toMax){
                    //贴吧发布得积分
                    $date = GetMkTime(time());
                    global $cfg_returnInteraction_tieba;    //贴吧积分
                    global $cfg_returnInteraction_commentDay;
                    $countIntegral = countIntegral($uid);    //统计积分上限
                    global  $userLogin;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_tieba > 0) {
                        $tiebapoint = $cfg_returnInteraction_tieba;
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$tiebapoint' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user = $userLogin->getMemberInfo($uid, 1);
                        $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$tiebapoint);
                        //保存操作日志
                        $info = $langData['siteConfig'][19][223];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`interaction`,`balance`) VALUES ('$uid', '1', '$tiebapoint', '$info', '$date','tiebafabu','$userpoint')");//发布贴吧得积分
                        $dsql->dsqlOper($archives, "update");
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "point"
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userinfo['username'],
                        "amount" => $tiebapoint,
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



				$type = $amount > 0 ? "pay" : "free";

				$param = array(
					"service"     => "member",
					"type"        => "user",
					"action"      => "manage",
					"template"    => "tieba"
				);
				$url = getUrlPath($param);

				return array("url" => $url, "status" => $type);

				// return $amount > 0 ? "pay" : "free";
				// return array("auth" => $auth, "aid" => $aid, "amount" => $amount);

			}else{
				return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
			}
		}


		$typeid  = (int)$param['typeid'];
		$cityid  = (int)$param['cityid'];
		$title   = filterSensitiveWords($param['title']);
		$content = filterSensitiveWords($param['content'], false);
		$vdimgck = filterSensitiveWords($param['vdimgck']);
//        $patternv = '/<video.*>(.*?)<\/video>/is';
//        $patterna = '/<audio.*>/';
/*        $patterni = '/<img[\s\S]*?src\s*=\s*[\"|\'](.*?)[\"|\'][\s\S]*?>/';*/
		$videotype = strpos(trim($content),'/video') > 0 ? 1 :0;
        $audiotype = strpos(trim($content),'/audio') > 0 ? 1 :0;
//        $audiotype = preg_match($content,$patterna);
        $pattern="/<img.*?src=[\'|\"](.*?)[\'|\"].*?[\/]?>/";
        preg_match_all($pattern,htmlspecialchars_decode($content),$match);
        $imgtype = empty($match) ? 0:1;
        if(empty($cityid)) return array("state" => 200, "info" => '请选择城市！');
		if(empty($typeid)) return array("state" => 200, "info" => '请选择分类！');
		if(empty($title)) return array("state" => 200, "info" => '请填写标题！');
		if(empty($content)) return array("state" => 200, "info" => '请填写内容！');
		if(empty($vdimgck) && !isMobile()) return array("state" => 200, "info" => '请填写验证码！');

		$vdimgck = strtolower($vdimgck);
		if($vdimgck != $_SESSION['huoniao_vdimg_value'] && !isMobile()) return array("state" => 200, "info" => '验证码输入错误');		

		$content = str_replace('帖子内容', '', $content);

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__tieba_list` (`cityid`, `typeid`, `uid`, `title`, `content`, `pubdate`, `ip`, `ipaddr`, `state`, `isreply`, `waitpay`, `alonepay`, `weight`,`imgtype`,`videotype`,`audiotype`) VALUES ('$cityid', '$typeid', '$uid', '$title', '$content', '$pubdate', '$ip', '$ipaddr', '$arcrank', '1', '$waitpay', '$alonepay', 1,'$imgtype','$videotype','$audiotype')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'tieba',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'tieba', '', $aid, 'insert', '发布帖子('.$title.')', $url, $archives);

		    dataAsync("tieba",$aid);
            autoShowUserModule($uid,'tieba');  // 新发帖
            if ($arcrank && !$toMax) {
                $countIntegral = countIntegral($uid);    //统计积分上限
                global $cfg_returnInteraction_tieba;    //贴吧积分
                global $cfg_returnInteraction_commentDay;
                if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_tieba > 0) {
                    $infoname = getModuleTitle(array('name' => 'car'));
                    //贴吧发布得积分
                    $date = GetMkTime(time());
                    global $userLogin;
                    $tiebapoint = $cfg_returnInteraction_tieba;
                    //增加积分
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$tiebapoint' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($uid, 1);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$tiebapoint);
                    //保存操作日志
                    $info = $langData['siteConfig'][19][223];
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$tiebapoint', '$info', '$date','zengsong','1','$userpoint')");//发布贴吧得积分
                    $dsql->dsqlOper($archives, "update");

                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "point"
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userinfo['nickname'],
                        "amount" => $tiebapoint,
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
            if(!$arcrank){
                //微信通知
				$cityName = $siteCityInfo['name'];
				$cityid  = $siteCityInfo['cityid'];
				$infoname = getModuleTitle(array('name' => 'tieba'));    //获取模块名
				$param = array(
					'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
					'cityid' => $cityid,
					'notify' => '管理员消息通知',
					'fields' =>array(
						'contentrn'  => $cityName."分站\r\n".$infoname."模块\r\n用户：".$userinfo['nickname']."\r\n发布帖子：".$title,
						'date' => date("Y-m-d H:i:s", time()),
					)
				);
				updateAdminNotice("tieba", "detail",$param);
            }
			return array("auth" => $auth, "aid" => $aid, "amount" => $amount);

		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
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

		$tid   = $param['tid'];
		$rid   = $param['rid'];
		$content = filterSensitiveWords($param['content'], false);
//		$content = cn_substrR($content, 200);
		$vdimgck = filterSensitiveWords($param['vdimgck']);

		if(empty($content)){
			return array("state" => 200, "info" => '请输入回复内容！');
		}

		if(empty($rid) && !isMobile()){
			$vdimgck = strtolower($vdimgck);
			if($vdimgck != $_SESSION['huoniao_vdimg_value']) return array("state" => 200, "info" => '验证码输入错误');
		}

		$ip = GetIp();
		$pubdate = GetMkTime(time());

		include HUONIAOINC."/config/tieba.inc.php";
		$state = (int)$customCommentCheck;

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__tieba_reply` (`tid`, `rid`, `uid`, `content`, `pubdate`, `ip`, `state`, `zan_user`) VALUES ('$tid', '$rid', '$uid', '$content', '$pubdate', '$ip', '$state', '')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

			$info = array();
			$memberInfo = $userLogin->getMemberInfo($uid, 1);
			if(is_array($memberInfo)){
				$info = array(
					"id" => $uid,
					"photo" => $memberInfo['photo'],
					"nickname" => $memberInfo['nickname'],
					"regtime" => $memberInfo['regtime'],
					"content" => $content,
					"pubdate" => $pubdate,
					"state"   => $state
				);
			}
			return $info;

		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
		}

	}


	/**
		* 删除帖子
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
		$archives = $dsql->SetQuery("SELECT * FROM `#@__tieba_list` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['uid'] == $uid){

				// $body = $results[0]['content'];
				// if(!empty($body)){
				// 	delEditorPic($body, "tieba");
				// }

				//删除评论
				// $archives = $dsql->SetQuery("DELETE FROM `#@__tieba_reply` WHERE `tid` = ".$id);
				// $results = $dsql->dsqlOper($archives, "update");

				//删除表
				// $archives = $dsql->SetQuery("DELETE FROM `#@__tieba_list` WHERE `id` = ".$id);
				// $dsql->dsqlOper($archives, "update");

				//移到回收站
				$archives = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `del` = 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'tieba', '', $id, 'delete', '删除帖子('.$results['title'].')', '', $archives);

                dataAsync("tieba",$id);  // 删除贴子
				return array("state" => 100, "info" => '删除成功！');
			}else{
				return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
			}
		}else{
			return array("state" => 101, "info" => '信息不存在，或已经删除！');
		}

	}


	/**
		* 验证文章状态是否可以打赏
		* @return array
		*/
	public function checkRewardState(){
		global $dsql;
		global $userLogin;

		$aid = $this->param['aid'];

		if(!is_numeric($aid)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 100, "info" => 'true');
		}

		$archives = $dsql->SetQuery("SELECT `uid` FROM `#@__tieba_list` WHERE `id` = ".$aid);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			if($results[0]['uid'] == $uid){
				return array("state" => 200, "info" => '自己不可以给自己打赏！');
			}else{
				return array("state" => 100, "info" => 'true');
			}
		}else{
			return array("state" => 200, "info" => '信息不存在，或已经删除，不可以打赏，请确认后重试！');
		}

	}


	/**
	 * 打赏记录
	 * @param $fid int 评论ID
	 * @return array
	 */
	function rewardList(){
		global $dsql;

		$param   = $this->param;
		$aid     = (int)$param['aid']; //信息ID
        if(!$aid) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT m.`username`, m.`photo`, r.`uid`, r.`amount`, r.`date` FROM `#@__member_reward` r LEFT JOIN `#@__member` m ON m.`id` = r.`uid` WHERE r.`module` = 'tieba' AND r.`aid` = ".$aid." AND r.`state` = 1 ORDER BY r.`id` ASC");
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		$list = array();
		if($totalCount > 0){
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$list[$key]['id']       = (int)$val['uid'];
					$list[$key]['username'] = $val['username'] ? $val['username'] : '游客';
					$list[$key]['photo']    = !empty($val['photo']) ? getFilePath($val['photo']) : getFilePath('/static/images/noPhoto_100.jpg');
					$list[$key]['amount']   = (float)$val['amount'];
					$list[$key]['date']   	= date("Y-m-d H:i:s", $val['date']);
				}
			}
		}
		return array("pageInfo" => array("totalCount" => $totalCount), "list" => $list);
	}



	/**
	 * 打赏
	 * @return array
	 */
	public function reward(){
		global $dsql;
		global $userLogin;

		$param   = $this->param;
		$aid     = $param['aid'];      //信息ID
		$amount  = $param['amount'];   //打赏金额
		$paytype = $param['paytype'];  //支付方式
		$uid = $userLogin->getMemberID();  //当前登录用户

		$isMobile = isMobile();

		//信息url
		$param = array(
			"service"     => "tieba",
			"template"    => "detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		//验证金额
		if($amount <= 0 || !is_numeric($aid)){
			header("location:".$url);
			die;
		}

		//查询信息发布人
		$sql = $dsql->SetQuery("SELECT `cityid`, `uid` FROM `#@__tieba_list` WHERE `id` = ".$aid);
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			//信息不存在
			header("location:".$url);
			die;
		}
		$admin = $ret[0]['uid'];
		$cityid = $ret[0]['cityid'];

		//自己不可以给自己打赏
		if($admin == $uid){
			//信息不存在
			header("location:".$url);
			die;
		}

        /*查询有无生成订单*/

        $selectsql = $dsql->SetQuery("SELECT `ordernum`,`date` FROM `#@__member_reward` WHERE `module` = 'tieba' AND `amount` = '$amount' AND `uid` = '$uid' AND `touid` = '$admin' AND `cityid`='$cityid' AND `aid` = '$aid' AND `state` = 0 AND `date` > ".(GetMkTime(time())-3600));

        $selectres = $dsql->dsqlOper($selectsql,"results");

        $ordernum  = $selectres[0]['ordernum'];

        $timeout   = $selectres[0]['date'] + 3600;

        if(empty($selectres)) {
            //订单号
            $ordernum = create_ordernum();

            $archives = $dsql->SetQuery("INSERT INTO `#@__member_reward` (`ordernum`, `module`, `uid`, `touid`, `aid`, `amount`, `state`, `date`) VALUES ('$ordernum', 'tieba', '$uid', '$admin', '$aid', '$amount', 0, " . GetMkTime(time()) . ")");
            $return   = $dsql->dsqlOper($archives, "update");
            if ($return != "ok") {
                die("提交失败，请稍候重试！");
            }

            $timeout  = GetMkTime(time()) + 3600;

            // 删除一小时未付款的打赏记录
            $time = time() - 3600;
            $sql = $dsql->SetQuery("DELETE FROM `#@__member_reward` WHERE `state` = 0 AND `date` < $time");
            $dsql->dsqlOper($sql, "update");
        }

//		if($isMobile){
//            $param = array(
//                "service" => "tieba",
//                "template" => "pay",
//                "param" => "ordernum=".$ordernum
//            );
//            header("location:".getUrlPath($param));
//            die;
//        }

		//跳转至第三方支付页面
        $order    =  createPayForm("tieba", $ordernum, $amount, $paytype, "打赏帖子",array(),1);

        $order['timeout'] = 0;

        return $order;

	}

	/**
	 * 支付成功
	 * 此处进行支付成功后的操作，例如发送短信等服务
	 *
	 */
	public function paySuccess(){
		global $cfg_secureAccess;
		global $cfg_basehost;
		global $siteCityInfo;
        global $userLogin;
		$param = $this->param;
		if(!empty($param)){
			global $dsql;

			$paytype  = $param['paytype'];
			$ordernum = $param['ordernum'];
			$date     = GetMkTime(time());

			//查询订单信息
			$sql = $dsql->SetQuery("SELECT * FROM `#@__member_reward` WHERE `ordernum` = '$ordernum'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$rid    = $ret[0]['id'];
				$uid    = $ret[0]['uid'];
				$to     = $ret[0]['touid'];
				$aid    = $ret[0]['aid'];
				$amount = $ret[0]['amount'];

				//文章信息
				$sql = $dsql->SetQuery("SELECT `title`,`cityid` FROM `#@__tieba_list` WHERE `id` = $aid");
				$ret = $dsql->dsqlOper($sql, "results");
				$title 		= $ret[0]['title'];
				$tiebatitle = $ret[0]['title'];
				$cityid 	= $ret[0]['cityid'];

				$title_ = '<a href="'.$cfg_secureAccess.$cfg_basehost.'/index.php?service=tieba&template=detail&id='.$aid.'" target="_blank">'.$title.'</a>';

                $modulename = getModuleTitle(array('name' => 'tieba'));

				//如果是会员打赏，保存操作日志贴吧打赏
				if($uid != -1){
                    $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid ='';
                    $truepayprice = 0;
                    if($ret){
                        $pid          = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }
                    $userbalance = 0;
                    if($paytype == 'money'){
                        $userbalance = $truepayprice;
                    }else{
                        /*混合支付*/
                        $userbalance = $amount - $truepayprice;
                    }
                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                    $param = array(
                        "service"  => "tieba",
                        "template" => "detail",
                        "id"   => $aid
                    );
                    $urlParam = serialize($param);

                    $tousernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '$to'");
                    $tousernameres = $dsql->dsqlOper($tousernamesql,'results');
                    $tousername    = '未知';
                    if($tousernameres){
                        $tousername = $tousernameres[0]['nickname']!='' ? $tousernameres[0]['nickname'] : $tousernameres[0]['username'];
                    }
                    $user  = $userLogin->getMemberInfo($uid, 1);
                    $usermoney = $user['money'];
//                    $money = sprintf('%.2f',($usermoney - $amount));
                    $title = "打赏-赠与".$tousername;
					$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$modulename-$tiebatitle', '$date','tieba','dashang','$pid','$urlParam','$title','$ordernum','$usermoney')");
					$dsql->dsqlOper($archives, "update");
                    }

                    //记录用户行为日志
                    memberLog($uid, 'tieba', 'reward', $aid, 'insert', '打赏信息('.$title.' => '.$amount.'元)', getUrlPath($urlParam), $archives);

                }

				//扣除佣金
				global $cfg_rewardFee;
				global $cfg_fzrewardFee;
				$fee = $amount * $cfg_rewardFee / 100;
                $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
			    $fee = $fee < 0.01 ? 0 : $fee;

			    $amount_ = sprintf('%.2f', $amount - $fee);


				//分销信息
				global $cfg_fenxiaoState;
				global $cfg_fenxiaoSource;
				global $cfg_fenxiaoDeposit;
				global $cfg_fenxiaoAmount;
				include HUONIAOINC."/config/tieba.inc.php";
                $fenXiao = (int)$customfenXiao;

				//分销金额
				$_fenxiaoAmount = $amount;
				if($cfg_fenxiaoState && $fenXiao && $amount_>0.01){

					//商家承担
					if($cfg_fenxiaoSource){
						$_fenxiaoAmount = $amount_;
						$amount_ = $amount_ - ($amount_ * $cfg_fenxiaoAmount / 100);

					//平台承担
					}else{
						$_fenxiaoAmount = $fee;
					}
				}

				$_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                //分佣 开关
                $paramarr['amount'] = $_fenxiaoAmount;
                if($fenXiao == 1 && $uid != -1){
                    $_fx_title = $ordernum;
                    (new member())->returnFxMoney("tieba", $uid, $ordernum, $paramarr);
                    //查询一共分销了多少佣金
                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'tieba'");
                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    if($cfg_fenxiaoSource){
                        $fx_less = ($_fenxiaoAmount - $amount_)  - $fenxiaomonyeres[0]['allfenxiao'];
                        //如果系统没有开启资金沉淀才需要查询实际分销了多少
                        if(!$cfg_fenxiaoDeposit){
                            $amount_     += $fx_less; //没沉淀，还给商家
                        }else{
                            $precipitateMoney = $fx_less;
                            if($precipitateMoney > 0){
                                (new member())->recodePrecipitationMoney($to,$ordernum,$_fx_title,$precipitateMoney,$cityid,"tieba");
                            }
                        }
                    }
                }
				$amount_ = $amount_ < 0.01 ? 0 : $amount_;
                $amount_ = sprintf('%.2f', $amount_);

				//更新订单状态
				$sql = $dsql->SetQuery("UPDATE `#@__member_reward` SET `state` = 1, `amount` = '$amount_' WHERE `id` = ".$rid);
				$dsql->dsqlOper($sql, "update");

				//将费用打给文章作者
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount_' WHERE `id` = '$to'");
				$dsql->dsqlOper($archives, "update");

                $tousernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '$uid'");
                $tousernameres = $dsql->dsqlOper($tousernamesql,'results');
                $tousername    = '未知';
                if($tousernameres){
                    $tousername = $tousernameres[0]['nickname']!='' ? $tousernameres[0]['nickname'] : $tousernameres[0]['username'];
                }
                $user  = $userLogin->getMemberInfo($to, 1);
                $usermoney = $user['money'];
//                $money = sprintf('%.2f',($usermoney + $amount_));
                $urlParam = serialize(array(
                    "service"  => "tieba",
                    "template" => "detail",
                    "id"   => $aid
                ));
                $title = "打赏-来自".$tousername;;
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$to', '1', '$amount_', '贴吧打赏：$tiebatitle', '$date','tieba','dashang','$title','$ordernum','$urlParam','$usermoney')");
				$dsql->dsqlOper($archives, "update");
                //分站佣金
                $fzFee = cityCommission($cityid,'reward');
				//将费用打给分站
				$fztotalAmount_ =  $fee * (float)$fzFee / 100 ;
				$fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                $fee-=$fztotalAmount_;//总站-=分站
				$cityName 	=  getSiteCityName($cityid);

				$fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
				$dsql->dsqlOper($fzarchives, "update");
                //保存操作日志
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`urlParam`) VALUES ('$to', '1', '$amount_', '贴吧打赏：$title_', '$date','$cityid','$fztotalAmount_','tieba',$fee,'1','dashang','$urlParam')");
//				$dsql->dsqlOper($archives, "update");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                substationAmount($lastid,$cityid);

				if($truepayprice <=0){
					$truepayprice = $amount_;
				}
				//工行E商通银行分账
				global $transaction_id;
				$transaction_id = $param['transaction_id'];  //第三方平台支付订单号
				rfbpShareAllocation(array(
					"uid" => $to,
					"ordertitle" => "贴吧打赏",
					"ordernum" => $ordernum,
					"orderdata" => array('帖子标题' => $title_),
					"totalAmount" => $amount,
					"amount" => $truepayprice,
					"channelPayOrderNo" => $transaction_id,
					"paytype" => $paytype
				));


				//会员通知
				$param = array(
					"service"  => "tieba",
					"template" => "detail",
					"id"   => $aid
				);

				//获取会员名
				$username = "";
				$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $to");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
				}

				//自定义配置
				$config = array(
					"username" => $username,
					"title" => $title,
					"amount" => $amount_,
					"date" => date("Y-m-d H:i:s", $date),
					"fields" => array(
						'keyword1' => '打赏目标',
						'keyword2' => '打赏金额',
						'keyword3' => '时间'
					)
				);

				updateMemberNotice($to, "会员-打赏通知", $param, $config);

			}

		}
	}

	/**
	 * 帖子数据量、会员数调取
	 */
	public function getFormat(){
		global $dsql;

		$where = '';
		$cityid = 0;

		//数据共享
		require(HUONIAOINC."/config/tieba.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
	        $cityid = getCityId();
			$where = " AND `cityid` = " . $cityid;
		}

        $typeid = (int)$this->param['typeid'];
        if($typeid){

            $typelist = $dsql->getTypeList($typeid, "tieba_type");
            if($typelist){
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($typelist);
                if($typeid){
                    $lower = $typeid.",".join(',',$lower);
                }else{
                    $lower = join(',',$lower);
                }
            }else{
                $lower = $typeid;
            }

            $where .= " AND `typeid` in ($lower)";

        }

		//统计帖子数量
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1  AND `del` = 0 AND `waitpay` = 0" . $where);
		$Tiret = $dsql->dsqlOper($sql, "results");
		$tiziTotal = $Tiret[0]['t'];

		//今日发帖数量
		$stime = GetMkTime(date('Y-m-d', time()));
		$etime = $stime + 86400;
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1  AND `del` = 0 AND `waitpay` = 0 AND `pubdate` BETWEEN $stime AND $etime" . $where);
		$Tret = $dsql->dsqlOper($sql, "results");
		$tiziTodayTotal = $Tret[0]['t'];

        //总浏览量
        $sql = $dsql->SetQuery("SELECT sum(`click`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `waitpay` = 0" . $where);
		$Tret = $dsql->dsqlOper($sql, "results");
		$tiziClickTotal = (int)$Tret[0]['t'];

        //分类数据不统计以下信息
        if(!$typeid){
            //今日浏览量
            $sql = $dsql->SetQuery("SELECT sum(`click`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `waitpay` = 0 AND `pubdate` BETWEEN $stime AND $etime" . $where);
            $Tret = $dsql->dsqlOper($sql, "results");
            $tiziTodayClickTotal = (int)$Tret[0]['t'];

            //昨日
            $stime = GetMkTime(date("Y-m-d",strtotime("-1 day")));
            $etime = $stime + 86400;
            $sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1  AND `del` = 0 AND `waitpay` = 0 AND `pubdate` BETWEEN $stime AND $etime" . $where);
            $Yret = $dsql->dsqlOper($sql, "results");
            $tiziYestodayTotal = $Yret[0]['t'];

            //统计会员数量及在线人数
            $memberStatistics = array();
            $sql = $dsql->SetQuery("SELECT count(`id`) total, (SELECT count(`id`) FROM `#@__member` WHERE `state` = 1 AND (`mtype` = 1 OR `mtype` = 2) AND `online` > 0) online FROM `#@__member` WHERE `state` = 1 AND (`mtype` = 1 OR `mtype` = 2)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $memberStatistics['total'] = $ret[0]['total'];
                $memberStatistics['online'] = $ret[0]['online'];
            }

            //今日签到多少人
            if($cityid){
                global $data;
                $data = '';
                $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
                $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
                $cityAreaIDs = join(',', $cityAreaIDArr);
                if($cityAreaIDs){
                    $whereQ .= " AND b.`addr` in ($cityAreaIDs)";
                }else{
                    $whereQ .= " AND 3 = 4";
                }
            }

            $stime = GetMkTime(date('Y-m-d', time()));
            $etime = $stime + 86400;
            $sql = $dsql->SetQuery("select count(a.`id`) from `#@__member_qiandao` a LEFT JOIN `#@__member` b ON a.uid = b.id where 1=1 $whereQ AND a.`date` BETWEEN $stime AND $etime ORDER BY a.`date` DESC");
            $qiandaoCount = $dsql->dsqlOper($sql, "results", "NUM");
            if($qiandaoCount){
                $qiandaoTotal = $qiandaoCount[0][0];
            }
        }

		return array(
            "qiandaoTotal" => (int)$qiandaoTotal, 
            "memberOnline" => (int)$memberStatistics['online'],
            "memberTotal" => (int)$memberStatistics['total'], 
            "tiziTotal" => (int)$tiziTotal, 
            "tiziTodayTotal" => (int)$tiziTodayTotal, 
            "tiziYestodayTotal" => (int)$tiziYestodayTotal, 
            "tiziTodayClickTotal" => (int)$tiziTodayClickTotal, 
            "tiziClickTotal" => (int)$tiziClickTotal
        );
	}

	/**
	 * 点赞
	 */
	 public function getUp(){
		global $dsql;
		global $userLogin;
		$param = $this->param;

		$id       = $param['id'];
		$uid      = $param['uid'];

		$userid      = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		if(empty($id)) return array("state" => 200, "info" => '数据传递失败！');

		$puctime = time();

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__tieba_up`  WHERE `tid` = '$id' and `ruid` = '$userid'");
		$res = $dsql->dsqlOper($sql, "results");
		if(!empty($res)){
			$archives = $dsql->SetQuery("UPDATE `#@__tieba_list` SET  `up` = up - 1 WHERE `id` = '$id'");
			$results = $dsql->dsqlOper($archives, "update");
			if($results == 'ok'){
				$archives = $dsql->SetQuery("DELETE FROM `#@__tieba_up` WHERE `tid` = '$id' and `ruid` = '$userid'");
				$dsql->dsqlOper($archives, "update");
				return 'ok';
			}else{
				return array("state" => 200, "info" => '数据出错！');
			}
		}else{
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__tieba_list` SET  `up` = up + 1 WHERE `id` = '$id'");
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				return array("state" => 200, "info" => '数据出错！');
			}else{
				//插入点赞人信息
				$archives = $dsql->SetQuery("INSERT INTO `#@__tieba_up` (`uid`, `tid`, `ruid`, `puctime`) VALUES ('$uid', '$id', '$userid', '$puctime')");
				$dsql->dsqlOper($archives, "update");
				return 'ok';
			}
		}
	 }

	 /**
	  * 点赞人列表
	  */
	 public function upList(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$tid      = $this->param['tid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$userid = $userLogin->getMemberID();

		if(!empty($tid)){
			$where .=" and tid='$tid'";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$order = " ORDER BY `puctime` DESC, `id` DESC";

		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__tieba_up` l WHERE 1 = 1".$where);
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

		$archives = $dsql->SetQuery("SELECT `id`, `uid`, `tid`, `ruid`, `puctime` FROM `#@__tieba_up` l WHERE 1 = 1".$where);
		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");
		if($results){
			foreach($results as $key => $val){
				//楼主信息
				$upUsername = $upPhoto = "";
				$sql = $dsql->SetQuery("SELECT `nickname`, `photo` FROM `#@__member` WHERE `id` = ".$val['uid']);
				$upRet = $dsql->dsqlOper($sql, "results");
				if($upRet){
					$upUsername = $upRet[0]['nickname'];
					$upPhoto    = getFilePath($upRet[0]['photo']);
				}
				$list[$key]['upUsername'] = $upUsername;
				$list[$key]['upPhoto'] = $upPhoto;

				//点赞人信息
				$uid = $username = $photo = "";
				$sql = $dsql->SetQuery("SELECT `id`, `nickname`, `photo` FROM `#@__member` WHERE `id` = ".$val['ruid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['nickname'];
					$uid	  = $ret[0]['id'];
					$photo    = getFilePath($ret[0]['photo']);
				}
				$list[$key]['uid'] = $uid;
				$list[$key]['username'] = $username;
				$list[$key]['photo'] = $photo;
				//帖子总数
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `uid` = " . $val['ruid']);
				$ret = $dsql->dsqlOper($sql, "results");
				$list[$key]['tiziTotal'] = $ret[0]['t'];
				//关注人数
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `tid` = " . $val['ruid']);
				$followret = $dsql->dsqlOper($sql, "results");
				$list[$key]['followTotal'] = $followret[0]['t'];
				//粉丝人数
				$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $val['ruid']);
				$fansret = $dsql->dsqlOper($sql, "results");
				$list[$key]['totalFans'] = $fansret[0]['t'];

				//点赞人和楼主是否相互关注
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = " . $val['ruid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$list[$key]['isfollow'] = 1;
				}elseif($userid == $val['ruid']){
					$list[$key]['isfollow'] = 2;
				}else{
					$list[$key]['isfollow'] = 0;
				}
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	 }


	 /**
     * 评论点赞
     */
    public function dingComment(){
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $param   = $this->param;
        $id      = (int)$param['id'];
        $type    = $param['type'];

        if(empty($id)){
            return array("state" => 200, "info" => "参数错误");
        }

        // 评论信息
        $sql = $dsql->SetQuery("SELECT `uid`, `zan_user` FROM `#@__tieba_reply` WHERE `id` = $id AND `state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            if($userid == $ret[0]['uid']){
                return array("state" => 200, "info" => "自己不能给自己点赞哦~");
            }

            $zan_user = $ret[0]['zan_user'];

            $zan_user_arr = $zan_user ? explode(',', $zan_user) : array();

            $ip = GetIP();

            if($type == "add"){
                if(in_array($userid, $zan_user_arr)){
                    return array("state" => 200, "info" => "您已经赞过");
                }
                $zan_user_arr[] = $userid;
            }else{
                $k = array_search($userid, $zan_user_arr);
                if($k === false) return "操作成功";
                unset($zan_user_arr[$k]);
            }

            $sql = $dsql->SetQuery("UPDATE `#@__tieba_reply` SET `zan` = ".count($zan_user_arr).", `zan_user` = '".join(",", $zan_user_arr)."' WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret == "ok"){
                return "操作成功";
            }else{
                return array("state" => 200, "info" => "操作失败，请重试！");
            }

        }else{
            return array("state" => 200, "info" => "评价不存在！");
        }

    }

	/**
     * 支付验证
     */
    public function checkPayAmount()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        //订单状态验证
//        $payCheck = $this->payCheck();
//        if ($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $ordernum   = $param['ordernum'];    //订单号
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        // if ($userid == -1) return array("state" => 200, "info" => "登录超时，请登录后重试！");
        if (empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");
        if (!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");

        $totalPrice  = 0;

        //查询订单信息
        $archives = $dsql->SetQuery("SELECT `amount` FROM `#@__member_reward` WHERE `ordernum` = '$ordernum' AND `module` = 'tieba' AND `state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        $res      = $results[0];

        $orderprice = $res['amount'];
        $totalPrice += $orderprice;

		//未登录状态，不验证余额
		if($userid == -1) return $totalPrice;



        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用余额，并且验证余额和支付密码
        if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) return array("state" => 200, "info" => "支付密码输入错误，请重试！");

            //验证余额
            if ($usermoney < $balance) return array("state" => 200, "info" => "您的余额不足，支付失败！");

            $useTotal += $balance;
            $tit[]    = "余额";
        }
        if ($useTotal > $totalPrice) return array("state" => 200, "info" => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));

        //返回需要支付的费用
        return sprintf("%.2f", $totalPrice - $useTotal);

    }

    /**
     * 支付
     * @return [type] [description]
     */
    public function pay()
    {
        global $dsql;
        global $userLogin;

        $param          = $this->param;
        $paytype        = $param['paytype'];
        $ordernum       = $param['ordernum'];
        $useBalance     = $param['useBalance'];
        $balance        = $param['balance'];
        $paypwd         = $this->param['paypwd'];      //支付密码
        $payTotalAmount = $this->checkPayAmount();
        $userid         = $userLogin->getMemberID();

        if ($ordernum && $paytype) {
            $sql = $dsql->SetQuery("SELECT `amount`,`aid` FROM `#@__member_reward` WHERE `ordernum` = '$ordernum' AND `module` = 'tieba' AND `state` = 0");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $amount = $res[0]['amount'];
                $aid    = $res[0]['aid'];

                if(is_array($payTotalAmount)){
                    return $payTotalAmount;
                }

                if ($payTotalAmount > 0) {
                    //跳转至第三方支付页面
                    return createPayForm("tieba", $ordernum, $payTotalAmount, $paytype, "打赏帖子");

                } else {
                    $paytype = 'money';
                    $date    = GetMkTime(time());
                    $paysql  = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                    $payre   = $dsql->dsqlOper($paysql, "results");
                    if (!empty($payre)) {

                        $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'tieba',  `uid` = $userid, `amount` = '$amount', `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'tieba'");
                        $dsql->dsqlOper($archives, "update");

                    } else {

                        $body     = serialize($param);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('tieba', '$ordernum', '$userid', '$body', '$amount', '$paytype', 1, $date)");
                        $dsql->dsqlOper($archives, "results");

                    }

                    $this->param = array(
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();
                    $param    = array(
                        "service"  => "tieba",
                        "template" => "detail",
                        "id"       => $aid
                    );
                    $url      = getUrlPath($param);
                    return $url;
//                    header("location:" . $url);die;
                }
            }
        }
        header("location:/404.html");
        die;

    }

    public function  tiebaCom()
    {
        global $dsql;
        $sql = $dsql->SetQuery("SELECT count(u.`id`) up ,u.`tid`  FROM `#@__public_up_all` u LEFT JOIN `#@__tieba_list` l  ON u.`tid` = l.`id` WHERE u.`module` = 'tieba' GROUP BY u.`tid` ");
        $tieba = $dsql->dsqlOper($sql, "results");
        foreach ($tieba as $k){
            $up = $k['up'];
            $id = $k['tid'];
            $sql = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `up` = $up WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");
        }
        return  'ok';

    }


  public function alist_index8(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$typeid = $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
				if(!is_array($this->param)){
						return array("state" => 200, "info" => '格式错误！');
				}else{
						$typeid   = $this->param['typeid'];
						$keywords = $this->param['keywords'];
						$name     = $this->param['username'];
						$orderby  = $this->param['orderby'];
						$u        = $this->param['u'];
						$notid    = $this->param['notid'];
						$uid      = $this->param['uid'];
						$state    = $this->param['state'];
						$ispic    = $this->param['ispic'];
						$istop    = $this->param['istop'];
						$jinghua  = $this->param['jinghua'];
						$tag1     = $this->param['tag1'];
						$tag2     = $this->param['tag2'];
						$tag3     = $this->param['tag3'];
						$page     = $this->param['page'];
						$pageSize = $this->param['pageSize'];
						$day    = (int)$this->param['day'];        //根据时间筛选
				}
		}

		//数据共享
		require(HUONIAOINC."/config/tieba.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
				if($cityid && $u != 1){
						$where .= " AND l.`cityid` = ".$cityid;
				}else{
						$where .= " AND l.`cityid` != 0";
				}
		}

		if ($day)
		{
				$daynumber =  time()-86400*$day;
				$where .= " AND  `pubdate` > $daynumber";
		}

		//不能包含哪些新闻
		if(!empty($notid)){
				$where .= " AND l.`id` not in ($notid)";
		}

		if(!empty($istop)){
				$where .=" AND l.`top` = 1";
		}

		if(!empty($jinghua)){
				$where .=" AND l.`jinghua` = 1";
		}

		if(!empty($tag1)){
				$where .=" AND l.`tag1` = 1";
		}

		if(!empty($tag2)){
				$where .=" AND l.`tag2` = 1";
		}

		if(!empty($tag3)){
				$where .=" AND l.`tag3` = 1";
		}

		$userid = $userLogin->getMemberID();

		//是否输出当前登录会员的信息
		if($u != 1){
				$where .= " AND l.`state` = 1 AND l.`waitpay` = 0";

				//取指定会员的信息
				if($uid){
						$where .= " AND l.`uid` = $uid";
				}
		}else{
				$where .= " AND l.`uid` = ".$userid;
				if($state != ""){
						$where1 = " AND l.`state` = ".$state;
				}
		}

		//遍历分类
		if(!empty($typeid)){
				if(strstr($typeid, ',')){

						$typeidArr = array();
						$typeid = explode(',', $typeid);
						foreach ($typeid as $key => $value) {
								if($dsql->getTypeList($value, "tieba_type")){
										global $arr_data;
										$arr_data = array();
										$lower = arr_foreach($dsql->getTypeList($value, "tieba_type"));
										$lower = $value.",".join(',',$lower);
								}else{
										$lower = $value;
								}
								array_push($typeidArr, $lower);
						}

						$typeidArr = join(',', $typeidArr);
						$where .= " AND `typeid` in ($typeidArr)";

				}else{
						if($dsql->getTypeList($typeid, "tieba_type")){
								global $arr_data;
								$arr_data = array();
								$lower = arr_foreach($dsql->getTypeList($typeid, "tieba_type"));
								$lower = $typeid.",".join(',',$lower);
						}else{
								$lower = $typeid;
						}
						$where .= " AND `typeid` in ($lower)";
				}
		}


		//模糊查询关键字
		if(!empty($keywords)){

				//搜索记录
				siteSearchLog("tieba", $keywords);

				$keywords = explode(" ", $keywords);
				$w = array();
				foreach ($keywords as $k => $v) {
						if(!empty($v)){
								$w[] = "`title` like '%".$v."%'";
						}
				}
				$where .= " AND (".join(" OR ", $w).")";
		}

		if(!empty($name)){
				//搜索记录
				siteSearchLog("tieba", $name);
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$name%' or `nickname` like '%$name%' or `company` like '%$name%'");
				$retname = $dsql->dsqlOper($sql, "results");
				if(!empty($retname) && is_array($retname)){
						$list_name = array();
						foreach ($retname as $key => $value) {
								$list_name[] = $value["id"];
						}
						$idList = join(",", $list_name);
						$where .= " AND  l.`uid` in ($idList) ";
				}
		}

		//1、视频 2、图片 3、音频
		if($ispic == 1){
				$where .= " AND `imgtype` = 1";
		}elseif($ispic == 2){
				$where .= " AND `videotype` = 1";
		}elseif($ispic == 3){
				$where .= " AND `audiotype` = 1";
		}

		$order = " ORDER BY `top` DESC, `jinghua` DESC, `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;
		//评论排行
//        AND `pubdate`> $day ;
		if($orderby == "reply"){
				$order = " ORDER BY comment DESC, `top` DESC, `jinghua` DESC, `weight` DESC, `id` DESC";
		}elseif($orderby == "pubdate"){
				$order = " ORDER BY pubdate DESC";
		}elseif($orderby == "click"){
				$order = " ORDER BY click DESC";
		}elseif($orderby == "up"){
				$order = " ORDER BY `up` DESC";
		}elseif($orderby == "active"){//发帖最多的用户
				$order = " GROUP BY uid order by count(id) desc";
		}elseif($orderby == "lastreply"){//最新回复  去除重复的tid
				// $sql = $dsql->SetQuery("SELECT max(id) as mid, `tid`, `pubdate` FROM `#@__tieba_reply` WHERE `state` = 1  GROUP BY tid ORDER BY  mid DESC, pubdate DESC");
				$sql = $dsql->SetQuery("SELECT max(id) as mid, `aid`, `dtime` FROM `#@__public_comment_all` WHERE `ischeck` = 1  AND `pid` = 0 AND `type` = 'tieba-detail' GROUP BY aid ORDER BY  mid DESC, dtime DESC");
				$retReply = $dsql->dsqlOper($sql, "results");
				if($retReply){
						foreach ($retReply as $key => $value) {
								$replyArr[] = $value['aid'];
						}
						$replyArr = join(',',$replyArr);
						$where .= " AND `id` in ($replyArr)";
						$order = " order by field (`id`,$replyArr)";
				}
				//本周阅读量排行
		}elseif($orderby == 'week'){
				// $order = " AND YEARWEEK(date_format(FROM_UNIXTIME(l.`pubdate`),'%Y-%m-%d')) = YEARWEEK(now()) ORDER BY l.`click` DESC, l.`weight` DESC, l.`id` DESC";
				$stime = GetMkTime(date("Y-m-d",strtotime("+7 day")));
				$etime = $stime + 86400;
				$order = " AND `pubdate` BETWEEN $stime AND $etime ORDER BY l.`click` DESC, l.`weight` DESC, l.`id` DESC";
		}

		$archives = $dsql->SetQuery("SELECT l.`up`, l.`id`, l.`typeid`, l.`uid`, l.`title`,l.`comment`,l.`pubdate`, l.`color`, l.`click`, l.`bold`, l.`jinghua`, l.`top`, l.`content`, l.`state`, l.`ip`, l.`ipaddr`, l.`waitpay` FROM `#@__tieba_list` l WHERE 1 = 1 AND `del` = 0".$where);


		$archives_count = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__tieba_list` l WHERE 1 = 1".$where);

		//总条数
		// $totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		// $totalCount = (int)$totalResults[0][0];
		$totalCount = (int)getCache("tieba_total", $archives_count, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));

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
				$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
				//已审核
				$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
				//拒绝审核
				$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

				$pageinfo['gray'] = $totalGray;
				$pageinfo['audit'] = $totalAudit;
				$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		// $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");
		$results = getCache("tieba_list", $archives.$where1.$order.$where, 300, array("disabled" => $u));
		if($results){
				foreach($results as $key => $val){
						$list[$key]['id']     = $val['id'];
						$list[$key]['typeid'] = $val['typeid'];
						$list[$key]['uid']    = $val['uid'];
						$username = $photo = "";
						$sql = $dsql->SetQuery("SELECT `nickname`, `photo` FROM `#@__member` WHERE `id` = ".$val['uid']);
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
								$username = $ret[0]['nickname'];
								$photo    = getFilePath($ret[0]['photo']);
						}
						$list[$key]['username'] = $username;
						$list[$key]['photo'] = $photo;

						$list[$key]['title']  = $val['title'];
						$list[$key]['color']  = $val['color'];
						$list[$key]['click']  = $val['click'];
						$list[$key]['bold']    = $val['bold'];
						$list[$key]['jinghua'] = $val['jinghua'];
						$list[$key]['top']     = $val['top'];
						$list[$key]['ip']     = '';
						$list[$key]["ipAddress"] = '';

						$archives   = $dsql->SetQuery("SELECT `id` FROM `#@__public_up_all` WHERE `module` = 'tieba' AND `action` = 'detail' AND `type` = '0' AND `tid` = {$val['id']}");
						$totalCount = $dsql->dsqlOper($archives, "totalCount");
						$list[$key]["up"]      = $totalCount;

						$content = $val['content'];
						if(strpos($content,'video')){
								$list[$key]['isvideo'] = 1;
						}
						$list[$key]['content'] = !empty($content) ? cn_substrR(strip_tags($content), 120) : "";

						global $data;
						$data = "";
						$typeArr = getParentArr("tieba_type", $val['typeid']);
						$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
						$list[$key]['typename'] = $typeArr;

						$list[$key]['pubdate']    = $val['pubdate'];
						$list[$key]['pubdate1']   = floor((GetMkTime(time()) - $val['pubdate'] / 86400) % 30) > 30 ? date("Y-m-d", $val['pubdate']) : FloorTime(GetMkTime(time()) - $val['pubdate']);

						//会员中心显示信息状态
						if($u == 1 && $userLogin->getMemberID() > -1){
								$list[$key]['state'] = $val['state'];
								$list[$key]['waitpay'] = $val['waitpay'];
						}

						$list[$key]['reply'] = $val['comment'];
						$param = array(
								"service"     => "tieba",
								"template"    => "detail",
								"id"          => $val['id']
						);
						$list[$key]['url'] = getUrlPath($param);


						$imgGroup = array();
                        $video = '';
                        global $cfg_attachment;
                        global $cfg_basehost;

                        $attachment = str_replace("http://".$cfg_basehost, "", $cfg_attachment);
                        $attachment = str_replace("https://".$cfg_basehost, "", $attachment);

                        $attachment = str_replace("/", "\/", $attachment);
                        $attachment = str_replace(".", "\.", $attachment);
                        $attachment = str_replace("?", "\?", $attachment);
                        $attachment = str_replace("=", "\=", $attachment);

                        preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $content, $picList);
                        $picList = array_unique($picList[1]);


                        preg_match_all("/<[img|IMG].*?src=[\'|\"](.*?(?:[\.gif|\.jpg|\.png|\.jpeg|\.GIF|\.JPG|\.PNG|\.JPEG]))[\?|\'|\"].*?[\/]?>/i", $content, $picList_);
                        $picList_ = array_unique($picList_[1]);

                        if($picList_){
                            foreach ($picList_ as $k => $v) {
                                if(!strstr($v, 'attachment') && !strstr($v, 'emot')){
                                    array_push($picList, (strstr($v, 'http') || strstr($v, '/tieba/') ? '' : (strstr($v, '/static/images/ui/') ? '' : (strstr($v, '/uploads/') ? '' : '/tieba/'))) . $v);
                                }
                            }
                        }

                        //内容图片  如果后台开启隐藏附件路径功能，这里就不获取不到图片了
                        if(!empty($picList)){
                            foreach($picList as $v_){
                                $filePath = getRealFilePath($v_);
                                $fileType = explode(".", $filePath);
                                $fileType = strtolower($fileType[count($fileType) - 1]);
                                $fileType = explode('?', $fileType);
                                $fileType = $fileType[0];
                                $ftype = array("jpg", "jpge", "gif", "jpeg", "png", "bmp");
                                if(in_array($fileType, $ftype) && !strstr($filePath, 'video')){
                                    $imgGroup[] = $filePath;
                                }elseif($fileType == 'mp4' || $fileType == 'mov'){
                                    $video = $filePath;
                                }
                            }
                        }
                        $list[$key]['imgGroup'] = $imgGroup;
						$list[$key]['video'] = $video;

						//最新评论
						$lastReply = array();
						// $sql = $dsql->SetQuery("SELECT `uid`, `content`, `pubdate` FROM `#@__tieba_reply` WHERE `state` = 1 AND `tid` = ".$val['id']);
						$sql = $dsql->SetQuery("SELECT `userid` uid, `content`, `dtime` pubdate FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tieba-detail' AND `aid` = '".$val['id']."' AND `pid` = 0");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){

								$username = "";
								$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$ret[0]['uid']);
								$ret_ = $dsql->dsqlOper($sql, "results");
								if($ret_){
										$username = $ret_[0]['nickname'];
								}

								$lastReply = array(
										"uid" => $ret[0]['uid'],
										"username" => $username,
										"content" => !empty($ret[0]['content']) ? cn_substrR(strip_tags($ret[0]['content']), 100) : "",
										"pubdate" => $ret[0]['pubdate'],
								);
						}

						$list[$key]['lastReply'] = $lastReply;

						// 打赏
						$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$val["id"]." AND `state` = 1");
						//总条数
						$totalCount = $dsql->dsqlOper($archives, "totalCount");
						if($totalCount){
								$archives = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$val["id"]." AND `state` = 1");
								$ret = $dsql->dsqlOper($archives, "results");
								$totalAmount = $ret[0]['totalAmount'];
						}else{
								$totalAmount = 0;
						}
						$list[$key]['reward'] = array("count" => $totalCount, "amount" => $totalAmount);

						if($orderby=='active'){
								//是否相互关注
								$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = " . $val['uid']);
								$ret = $dsql->dsqlOper($sql, "results");
								if($ret){
										$list[$key]['isfollow'] = 1;//关注
								}elseif($userid == $val['ruid']){
										$list[$key]['isfollow'] = 2;//自己
								}else{
										$list[$key]['isfollow'] = 0;//未关注
								}

								//帖子总数
								$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `del` = 0 AND `uid` = " . $val['uid']);
								$ret = $dsql->dsqlOper($sql, "results");
								$list[$key]['tiziTotal'] = $ret[0]['t'];
								//粉丝人数
								$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $val['uid']);
								$fansret = $dsql->dsqlOper($sql, "results");
								$list[$key]['totalFans'] = $fansret[0]['t'];
						}

				}
		}else{
				return array("pageInfo" => $pageinfo, "list" => array());

		}
		$listHandels = new handlers('circle', "tlist");
		$listConfig  = $listHandels->getHandle(array('orderby' => 'getviedo', 'module' => 'all','pageSize'=>'2','page'=>$page));
		//获取广告
		$gaoHandels = new handlers('siteConfig', "adv");
		$adv  = $gaoHandels->getHandle(array('id' => 'stream', 'model' => 'all','title'=>'移动端首页贴吧流媒体广告'));

		$arr = array();
		if (!empty($list[0])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[0],
				));
		}

		if (!empty($list[1])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[1],
				));
		}

		if (!empty($list[2])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[2],
				));
		}
		if (!empty($list[3])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[3],
				));
		}
		if (!empty($listConfig['info']['list'][0])){
				array_push($arr,array(
						'type' => 'circle',
						'data' => !empty($listConfig['info']['list'][0]) ? $listConfig['info']['list'][0]  : ' ',
				));
		}
		if (!empty($adv['info']) && $adv['state']!=102 ){
				array_push($arr,array(
						'type' => 'adv',
						'data' => !empty($adv['info']) ? $adv['info']  : ' ',
				));
		}
		if (!empty($list[4])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[4],
				));
		}
		if (!empty($list[5])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[5],
				));
		}
		if (!empty($listConfig['info']['list'][1])){
				array_push($arr,array(
						'type' => 'circle',
						'data' => !empty($listConfig['info']['list'][0]) ? $listConfig['info']['list'][1]  : ' ',
				));
		}
		if (!empty($list[6])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[6],
				));
		}
		if (!empty($list[7])){
				array_push($arr,array(
						'type' => 'tieba',
						'data' =>$list[7],
				));
		}
		return array("pageInfo" => $pageinfo, "list" => $arr);
    }

    //打赏支付详情
    public function  checkOrder()
    {

        global $dsql;
        $ordernum = '';
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $ordernum = $this->param['ordernum'];
            }
        }

        if(!$ordernum){
            return array("state" => 200, "info" => '订单号必传！');
        }

        //根据支付订单号查询支付结果
        $archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`aid`, r.`date`, r.`state`, l.`amount` FROM `#@__pay_log` l LEFT JOIN `#@__member_reward` r ON r.`ordernum` = l.`body` WHERE r.`module` = 'tieba' AND l.`ordernum` = '$ordernum'");
        $payDetail  = $dsql->dsqlOper($archives, "results");
        if($payDetail){

            $title = "";
            $sql = $dsql->SetQuery("SELECT `title` FROM `#@__tieba_list` WHERE `id` = ".$payDetail[0]['aid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $title = $ret[0]['title'];
            }

            $param = array(
                "service"     => "tieba",
                "template"    => "detail",
                "id"          => $payDetail[0]['aid']
            );
            $url = getUrlPath($param);

            return array(
                'state' => (int)$payDetail[0]['state'],
                'ordernum' => $payDetail[0]['ordernum'],
                'title' => $title,
                'url' => $url,
                'date' => (int)$payDetail[0]['date'],
                'amount' => (float)sprintf("%.2f", $payDetail[0]['amount'])
            );

        //支付订单不存在
        }else{
            return array(
                'state' => 0
            );
        }

    }

}
