<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 投票模块API接口
 *
 * @version        $Id: vote.class.php 2014-3-24 下午14:51:14 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class vote {
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
     * 投票基本参数
     * @return array
     */
    public function config(){

        require(HUONIAOINC."/config/vote.inc.php");

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
        // global $customLogoUrl;            //logo地址
        // global $customSubDomain;          //访问方式
        // global $customChannelSwitch;      //模块状态
        // global $customCloseCause;         //模块禁用说明
        // global $customSeoTitle;           //seo标题
        // global $customSeoKeyword;         //seo关键字
        // global $customSeoDescription;     //seo描述
        // global $hotline_config;           //咨询热线配置
        // global $customHotline;            //咨询热线
        // global $customAtlasMax;           //图集数量限制
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

        // $domainHuangye = getDomain('vote', 'config');
        // $customChannelDomain = $domainHuangye['domain'];
        // if($customSubDomain == 0){
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('vote', $customSubDomain);

        //分站自定义配置
        $ser = 'vote';
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
            $return['atlasMax']      = $customAtlasMax;
            $return['template']      = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['atlasSize']     = $custom_atlasSize;
            $return['atlasType']     = $custom_atlasType;
        }

        return $return;

    }

    /**
     * 投票列表
     * @return array
     */
    public function vlist(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = $itemList = array();
        $title = $thumb = $orderby = $u = $state = $page = $pageSize = $where = $where1 = $return = "";
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $title      = $this->param['keywords'];
                $orderby    = $this->param['orderby'];
                $u          = $this->param['u'];
                $uid        = $this->param['uid'];
                $state      = $this->param['state'];
                $page       = $this->param['page'];
                $pageSize   = $this->param['pageSize'];
            }
        }

        //数据共享
        require(HUONIAOINC."/config/vote.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if($cityid){
                $where .= " AND `cityid` = ".$cityid;
            }
        }

        $admin = $userLogin->getMemberID();
        if($u == 1){
            if($admin != -1){
                $where = " AND `admin` = $admin";
                if($state){
                    $where1 .= " AND `state` = '$state'";
                }
            }else{
                $where = " AND 1 = 2";
            }
        }else{
            if($state){
                $where .= " AND `state` = '$state'";
            }else{
                $where .= " AND `state` != 0";
            }

            //取指定会员的信息
			if($uid){
				$where .= " AND `admin` = $uid";
			}
        }


        if(!$u || $admin == -1){
            $where .= " AND l.`arcrank` = 1 AND l.`waitpay` = 0";
        }

        $now = GetMkTime(time());

        if(!empty($title)){
            $where .= " AND `title` like '%".$title."%'";
        }

		if(!empty($orderby)){
			if($orderby==2){//访问总量
				$order = " ORDER BY l.`click` DESC, l.`weight` DESC, l.`id` DESC";
			}
		}else{
			$order = " ORDER BY l.`weight` DESC, l.`id` DESC";
		}

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__vote_list` as l WHERE 1 = 1".$where);
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

        //会员列表需要统计信息状态
        if($u == 1 && $admin > -1){
            //未开始
            $totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
            //进行中
            $totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
            //已结束
            $totalExpire = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

            $pageinfo['gray'] = $totalGray;
            $pageinfo['audit'] = $totalAudit;
            $pageinfo['expire'] = $totalExpire;
        }

        $archives = $dsql->SetQuery("SELECT l.* FROM `#@__vote_list` as l WHERE 1 = 1".$where.$where1);

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives.$order.$where, "results");

        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']          = $val['id'];
                $list[$key]['state']       = $val['state'];
                $list[$key]['arcrank']     = $val['arcrank'];
                $list[$key]['click']       = $val['click'];
                $list[$key]['title']       = $val['title'];
                $list[$key]['litpic']      = $val['litpic'] ? getFilePath($val['litpic']) : '';
                $list[$key]['waitpay']     = $val['waitpay'];
                $list[$key]['alonepay']    = $val['alonepay'];
                $list[$key]['description'] = $val['description'];
                $list[$key]['pubdate']     = $val['pubdate'];
                $list[$key]['pubdatef']    = date("Y-m-d H:i:s", $val['pubdate']);

                //计算选项数量
                $body = unserialize($val['body']);
                $xuan = 0;
                if($body){
                    foreach ($body as $k => $v){
                        if($v['xuan']){
                            $xuan += count($v['xuan']);
                        }
                    }
                }
                $list[$key]['optionCount'] = $xuan;

                // 统计已投票人数
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__vote_record` WHERE `tid` = ".$val['id']);
                $ret = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['join'] = $ret;

                // 累计投票数量
                $d = 0;
                $sql = $dsql->SetQuery("SELECT `id`, `result` FROM `#@__vote_record` WHERE `tid` = ".$val['id']);
                $res = $dsql->dsqlOper($sql, "results");
                foreach ($res as $k => $value) {
                    $retArr = unserialize($value['result']);
                    foreach ($retArr as $j => $row) {
                        $d += @count($row);
                    }
                }
                $list[$key]['total'] =  $d;

                $param = array(
                    "service"  => "vote",
                    "template" => "detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
            if($orderby==1){//投票数
            	array_multisort(array_column($list,'join'),SORT_DESC,$list);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 投票详情
     * @return array
     */
    public function detail(){
        global $dsql;
        global $userLogin;
        $infoDetail = array();
        $id = $this->param;
        $id = is_array($id) ? $id['id'] : $id;
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        //功能点：管理员和信息的发布者可以查看所有状态的信息
        $where = "";
        if($userLogin->getUserID() == -1){

            $where = " AND `arcrank` = 1 AND `waitpay` = 0";

            //如果没有登录再验证会员是否已经登录
            if($userLogin->getMemberID() != -1){
                $where = " AND (`arcrank` = 1 AND `waitpay` = 0 AND `state` != 0 OR `admin` = ".$userLogin->getMemberID().")";
            }

        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__vote_list` WHERE `id` = ".$id.$where);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            $now = GetMkTime(time());
            foreach ($results as $key => $value) {
                if($key == "body"){
                    $value = unserialize($value);
                    foreach ($value as $b_k => $b_v) {
                        $xuan = $b_v['xuan'];
                        foreach ($xuan as $x_k => $x_v) {
                            $value[$b_k]['xuan'][$x_k]['imgturl'] = $x_v['img'] ? getFilePath($x_v['img']) : '';
                        }
                    }
                }
                if($key == "description"){
                    $value = str_replace("\n", "<br />", $value);
                }
                $infoDetail[$key] = $value;
            }

            $infoDetail['litpicSource'] = $infoDetail['litpic'];
            $infoDetail['litpic'] = $infoDetail['litpic'] ? getFilePath($infoDetail['litpic']) : '';

            // 统计已投票人数
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__vote_record` WHERE `tid` = ".$id);
            $ret = $dsql->dsqlOper($sql, "totalCount");
            $infoDetail['join'] = $ret;

            // 登陆用户验证是否已投票
            $infoDetail['has_vote'] = 0;
            $uid = $userLogin->getMemberID();

            // 获取投票详情统计
            $totalCount = array();
            $sql = $dsql->SetQuery("SELECT `mid`, `result` FROM `#@__vote_record` WHERE `tid` = ".$id);
            $allvote = $dsql->dsqlOper($sql, "results");

            if($allvote){

                // 当前用户是否已投票
                $userVoteDetail = null;
                // 遍历问卷
                foreach ($allvote as $key => $value) {
                    $d = $value['result'];
                    $d = unserialize($d);
                    // 遍历题目
                    // $k: 题号
                    // $v: 被选中选项的序号
                    if($d){
                        foreach ($d as $k => $v) {
                            if(!isset($totalCount[$k])){
                                $totalCount[$k] = array();
                            }
                            if($v){
                                foreach ($v as $x_v) {
                                    if(isset($totalCount[$k][$x_v])){
                                        $totalCount[$k][$x_v] = $totalCount[$k][$x_v] + 1;
                                    }else{
                                        $totalCount[$k][$x_v] = 1;
                                    }
                                }
                            }
                            // 每道题的总票数
                            if(isset($totalCount[$k]['total_count'])){
                                $totalCount[$k]['total_count'] = $totalCount[$k]['total_count'] + count($v);
                            }else{
                                $totalCount[$k]['total_count'] += count($v);
                            }
                        }
                    }

                    if($value['mid'] == $uid){
                        $userVoteDetail = $value;
                    }
                }

                // 当前用户已投票，获取投票详情
                if($userVoteDetail){
                    $infoDetail['has_vote'] = 1;
                    $userVoteDetail = $userVoteDetail['result'];
                    $userVoteDetail = unserialize($userVoteDetail);
                }else{
                    $infoDetail['has_vote'] = 0;
                }

                $detail = $infoDetail['body'];
                $optionCount = 0;

                foreach ($detail as $key => $value) {
                    $detail[$key]['total_count'] = $totalCount[$key]['total_count'];

                    $xuan = $value['xuan'];

                    $optionCount += count($xuan);
                    foreach ($xuan as $x_k => $x_v) {
                        if($userVoteDetail && in_array($x_k, $userVoteDetail[$key])){
                            $detail[$key]['xuan'][$x_k]['active'] = 1;
                        }else{
                            $detail[$key]['xuan'][$x_k]['active'] = 0;
                        }
                        $detail[$key]['xuan'][$x_k]['count'] = isset($totalCount[$key][$x_k]) ? $totalCount[$key][$x_k] : 0;
                        $detail[$key]['xuan'][$x_k]['ratio'] = sprintf("%.0f", $detail[$key]['xuan'][$x_k]['count']/$detail[$key]['total_count']*100)."%";
                    }
                }
                $infoDetail['body'] = $detail;
                $infoDetail['optionCount'] = $optionCount;


            }else{
                $infoDetail['has_vote'] = 0;

                $detail = $infoDetail['body'];
                $optionCount = 0;

                foreach ($detail as $key => $value) {
                    $detail[$key]['total_count'] = 0;

                    $xuan = $value['xuan'];
                    $optionCount += count($xuan);
                    foreach ($xuan as $x_k => $x_v) {
                        $detail[$key]['xuan'][$x_k]['active'] = 0;
                        $detail[$key]['xuan'][$x_k]['count'] = 0;
                        $detail[$key]['xuan'][$x_k]['ratio'] = "0%";
                    }
                }
                $infoDetail['body'] = $detail;
                $infoDetail['optionCount'] = $optionCount;
            }



            $param = array(
                "service"  => "vote",
                "template" => "detail",
                "id"       => $id
            );
            $infoDetail['url'] = getUrlPath($param);

        }
        // print_r($infoDetail);
        return $infoDetail;
    }


    /*
     *投票用户列表
     * */

    public function piaomlist(){
        global $dsql;
        global $userLogin;
        $infoDetail = $userDetail = array();
        $id = $this->param;
        $id = is_array($id) ? $id['id'] : $id;
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $where = "";
        if($userLogin->getUserID() == -1){

            $where = " AND `arcrank` = 1 AND `waitpay` = 0";

            //如果没有登录再验证会员是否已经登录
            if($userLogin->getMemberID() != -1){
                $where = " AND (`arcrank` = 1 AND `waitpay` = 0 AND `state` != 0 OR `admin` = ".$userLogin->getMemberID().")";
            }

        }

        $archives = $dsql->SetQuery("SELECT `body`,`id`,`title` FROM `#@__vote_list` WHERE `id` = ".$id.$where."");
        $results  = $dsql->dsqlOper($archives, "results");

        if($results){
           $body  = unserialize($results[0]['body']);

           $tid   = $results[0]['id'];
           $title = $results[0]['title'];
           $memberlistsql  = $dsql->SetQuery("SELECT r.`result`,m.`username`,m.`phone` FROM `#@__vote_record`r LEFT JOIN `#@__member` m ON r.`mid` = m.`id` WHERE r.`tid` = ".$tid);
           $memberlistres  = $dsql->dsqlOper($memberlistsql, "results");

           if(!$memberlistres) return ;

           foreach ($memberlistres as $k =>$v) {
               $result = unserialize($v['result']);
               $piaolist = array();
               foreach ($body as $key => $value) {
                   $xuan = $value['xuan'];
                   foreach ($xuan as $x_k => $x_v) {
                       if (in_array($x_k, $result[$key])) {

                           $piaolist[$value['title']][$x_k] = $x_v['txt'];

                       }

                   }
               }

               $userDetail[$k]['username']  = $v['username'];
               $userDetail[$k]['phone']     = $v['phone'];
               $userDetail[$k]['title']     = $title;
               $userDetail[$k]['piaolist']  = $piaolist;
           }

           return $userDetail;

        }


    }

    /**
        * 删除信息
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

        $archives = $dsql->SetQuery("SELECT `title`, `admin`, `body` FROM `#@__vote_list` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['admin'] == $uid){
                $body = $results['body'];
                $body = unserialize($body);
                foreach ($body as $key => $value) {
                    $xuan = $value['xuan'];
                    foreach ($xuan as $x_k => $x_v) {
                        if($x_v['img']){
                            delPicFile($x_v['img'], "delThumb", "vote");
                        }
                    }
                }
                $archives = $dsql->SetQuery("DELETE FROM `#@__vote_list` WHERE `id` = ".$id);
                $ret = $dsql->dsqlOper($archives, "update");
                if($ret == "ok"){
                
                    //记录用户行为日志
                    memberLog($uid, 'vote', '', $id, 'delete', '删除信息('.$results['title'].')', '', $archives);

                    $sql = $dsql->SetQuery("DELETE FROM `#@__vote_record` WHERE `tid` = ".$id);
                    $dsql->dsqlOper($sql, "update");
                    dataAsync("vote",$id);    // 投票活动、删除

                    return array("state" => 100, "info" => '删除成功！');
                }
            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '信息不存在，或已经删除！');
        }

    }

    /**
        * 结束投票
        * @return array
        */
    public function stop(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $archives = $dsql->SetQuery("SELECT `admin`, `state` FROM `#@__vote_list` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['admin'] == $uid){
                if($results['state'] != 1){
                   return array("state" => 101, "info" => '投票状态异常，操作失败！');
                }
                $pubdate = GetMkTime(time());
                $archives = $dsql->SetQuery("UPDATE `#@__vote_list` SET `state` = 2, `end` = '$pubdate' WHERE `id` = ".$id);
                $ret = $dsql->dsqlOper($archives, "update");
                if($ret == "ok"){
                    return array("state" => 100, "info" => '操作成功！');
                }else{
                    return array("state" => 101, "info" => '操作失败！');
                }
            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '信息不存在，或已经删除！');
        }

    }


    /**
     * 发布投票
     * @return array
     */
    public function put(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        global $langData;

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => '登陆超时，请重新登陆');

        $param       = $this->param;
        $title       = $param['title'];
        $litpic      = $param['litpic'];
        $config      = $param['config'];
        $cityid      = (int)$param['cityid'];
        $description = addslashes($param['description']);

        if(empty($cityid)) return array("state" => 200, "info" => '请选择城市！');
        if(empty($title)) return array("state" => 200, "info" => '请填写标题！');
        if(empty($litpic)) return array("state" => 200, "info" => '请上传活动海报！');
        // if(empty($description)) return array("state" => 200, "info" => '请填写描述！');
        if(empty($config)) return array("state" => 200, "info" => '请填写描述！');

        if(!is_array($config)) return array("state" => 200, "info" => '参数错误，请重新提交！');

        foreach ($config as $key => $value) {
            if(empty($title)){
                unset($config[$key]);
                continue;
            }
            $xuan = $value['xuan'];
            if(empty($xuan)){
                unset($config[$key]);
                continue;
            }
            foreach ($xuan as $k => $v) {
                if(empty($v['txt'])){
                    unset($xuan[$k]);
                    continue;
                }
            }
            if(count($xuan) <= 1){
                unset($config[$key]);
                continue;
            }
        }
        if(empty($config)) return array("state" => 200, "info" => '请检查表单内容！');
        $config = serialize($config);
        $pubdate = GetMkTime(time());

        include HUONIAOINC."/config/vote.inc.php";
        $arcrank = (int)$customFabuCheck;

        //用户信息
        $userinfo = $userLogin->getMemberInfo();

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
                $articleCount = (int)$memberLevelAuth['vote'];

                //统计用户当天已发布数量 @
                // $today = GetMkTime(date("Y-m-d", time()));
                // $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

				//本周
				$today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
				$tomorrow = $today + 604800;

                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__vote_list` WHERE `admin` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $alreadyFabu = $ret[0]['total'];
                    if($alreadyFabu >= $articleCount){
                        $toMax = true;
                        // return array("state" => 200, "info" => '当天发布信息数量已达等级上限！');
                    }else{
                        $arcrank = 1;
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
                if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['vote'] <= $alreadyFabu) || !$fabuFreeCount)){
                    $alonepay = 1;
                    $amount = $fabuAmount["vote"];
                    $arcrank = 0;   //需要审核
                }

            }

        // }

        //保存到主表
        $waitpay = $amount > 0 ? 1 : 0;
        $sql = $dsql->SetQuery("INSERT INTO `#@__vote_list` (`cityid`, `title`, `litpic`, `description`, `body`, `admin`, `pubdate`, `arcrank`, `state`, `waitpay`, `alonepay`) VALUES ('$cityid', '$title', '$litpic', '$description', '$config', '$uid', '$pubdate', '$arcrank', 1, '$waitpay', '$alonepay')");
        $aid = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'vote',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'vote', '', $aid, 'insert', '发布信息('.$title.')', $url, $archives);

            //后台消息通知
            if(!$arcrank && !$waitpay){

                //微信通知
                $cityName = $siteCityInfo['name'];
            	$cityid  = $siteCityInfo['cityid'];
    	        $param = array(
    	        	'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
    	        	'cityid' => $cityid,
    	            'notify' => '管理员消息通知',
    	            'fields' =>array(
    		            'contentrn'  => $cityName.'分站——投票模块——用户:'.$userinfo['username'].' 发布了一条标题为: '.$title.'的投票',
    		            'date' => date("Y-m-d H:i:s", time()),
    		        )
    	        );

                updateAdminNotice("vote", "detail", $param);
            }

            if ($arcrank && !$toMax) {
                $countIntegral = countIntegral($uid);    //统计积分上限
                global $cfg_returnInteraction_vote;    //投票积分
                global $cfg_returnInteraction_commentDay;
                if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_vote > 0 ) {
                    $infoname = getModuleTitle(array('name' => 'vote'));
                    //发布投票得积分
                    $date = GetMkTime(time());
                    global  $userLogin;
                    //增加积分
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_vote' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($uid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$cfg_returnInteraction_vote);
                    //保存操作日志
                    $info = '发布'.$infoname;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_vote', '$info', '$date','zengsong','1','$userpoint')");//发布投票得积分
                    $dsql->dsqlOper($archives, "update");

                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "point"
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userinfo['username'],
                        "amount" => $cfg_returnInteraction_vote,
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
                    dataAsync("vote",$aid);    // 投票活动、新增

                }
            }

            if($userinfo['level']){
                $auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $articleCount);
            }else{
                $auth = array("level" => 0, "levelname" => "普通会员", "maxcount" => 0);
            }
            return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
            // return "提交成功";
        }else{
            return array("state" => 200, "info" => '提交失败，请重试');
        }

    }


    /**
     * 修改投票
     * @return array
     */
    public function edit(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => '登陆超时，请重新登陆');

        $param       = $this->param;
        $id          = $param['id'];
        $title       = $param['title'];
        $litpic      = $param['litpic'];
        $config      = $param['config'];
        $cityid      = (int)$param['cityid'];
        $description = addslashes($param['description']);

        if(empty($id)) return array("state" => 200, "info" => '参数错误！');
        if(empty($cityid)) return array("state" => 200, "info" => '请选择城市！');
        if(empty($title)) return array("state" => 200, "info" => '请填写标题！');
        if(empty($litpic)) return array("state" => 200, "info" => '请上传活动海报！');
        // if(empty($description)) return array("state" => 200, "info" => '请填写描述！');
        if(empty($config)) return array("state" => 200, "info" => '请填写描述！');

        if(!is_array($config)) return array("state" => 200, "info" => '参数错误，请重新提交！');

        foreach ($config as $key => $value) {
            if(empty($title)){
                unset($config[$key]);
                continue;
            }
            $xuan = $value['xuan'];
            if(empty($xuan)){
                unset($config[$key]);
                continue;
            }
            foreach ($xuan as $k => $v) {
                if(empty($v['txt'])){
                    unset($xuan[$k]);
                    continue;
                }
            }
            if(count($xuan) <= 1){
                unset($config[$key]);
                continue;
            }
        }
        if(empty($config)) return array("state" => 200, "info" => '请检查问卷！');
        $config = serialize($config);
        $pubdate = GetMkTime(time());

        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__vote_list` WHERE `admin` = '$uid' AND `id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if($ret[0]['state'] == 2){
                return array("state" => 200, "info" => '投票已结束！');
            }
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__vote_record` WHERE `tid` = '$id'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                return array("state" => 200, "info" => '该投票已有问卷，无法修改！');
            }
        }else{
            return array("state" => 200, "info" => '信息不存在或已经删除！');
        }

        include HUONIAOINC."/config/vote.inc.php";
        $arcrank = (int)$customFabuCheck;

        $sql = $dsql->SetQuery("UPDATE `#@__vote_list` SET `cityid` = '$cityid', `title` = '$title', `litpic` = '$litpic', `description` = '$description', `body` = '$config', `arcrank` = '$arcrank' WHERE `admin` = '$uid' AND `id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            $urlParam = array(
                'service' => 'vote',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'vote', '', $id, 'update', '修改信息('.$title.')', $url, $archives);

            dataAsync("vote",$id);    // 投票活动、更新

            return "修改成功";
        }else{
            return array("state" => 200, "info" => '修改失败，请重试');
        }

    }


    /**
     * 提交问卷
     * @return array
     */
    public function vote(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => '登陆超时，请重新登陆');

        $param  = $this->param;
        $id     = $param['id'];
        $result = $param['result'];

        if(empty($id)) return array("state" => 200, "info" => '参数错误！');
        if(empty($result)) return array("state" => 200, "info" => '请检查问卷！');

        if(!is_array($result)) return array("state" => 200, "info" => '参数错误，请重新提交！');


        $result = serialize($result);
        $pubdate = GetMkTime(time());

        $sql = $dsql->SetQuery("SELECT `id`, `state`, `waitpay` FROM `#@__vote_list` WHERE `id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if($ret[0]['waitpay']){
                return array("state" => 200, "info" => '该投票状态异常！');
            }
            if($ret[0]['state'] != 1){
                return array("state" => 200, "info" => '投票未开始或已结束！');
            }
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__vote_record` WHERE `tid` = '$id' AND `mid` = '$uid'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                return array("state" => 200, "info" => '您已经参与过此投票！');
            }else{
                $ip = GetIP();
                $ipaddr = getIpAddr($ip);
                $sql = $dsql->SetQuery("INSERT INTO `#@__vote_record` (`tid`, `mid`, `ip`, `ipaddr`, `pubdate`, `result`) VALUES ('$id', '$uid', '$ip', '$ipaddr', '$pubdate', '$result')");
                $ret = $dsql->dsqlOper($sql, "lastid");
                if(is_numeric($ret)){
                    autoShowUserModule($uid,'vote');  // 提交投票
                    return "提交成功";
                }else{
                    return array("state" => 200, "info" => '提交失败，请重试');
                }
            }
        }else{
            return array("state" => 200, "info" => '信息不存在或已经删除！');
        }

    }

    /**
     * 我参与的投票
     */
    public function joinList(){
        global $dsql;
        global $userLogin;
        $admin = $userLogin->getMemberID();
        if($admin == -1) return array("state" => 200, "info" => '登陆超时，请重新登陆');

        $where = $where1 = "";

        $param    = $this->param;
        $state    = $param['state'];
        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        if($state){
            $where1 = " AND l.`state` = '$state'";
        }

        $list = array();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__vote_list` l LEFT JOIN `#@__vote_record` r ON r.`tid` = l.`id` WHERE r.`mid` = $admin");
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
        //进行中
        $totalAudit = $dsql->dsqlOper($archives." AND l.`state` = 1", "totalCount");
        //已结束
        $totalExpire = $dsql->dsqlOper($archives." AND l.`state` = 2", "totalCount");

        $pageinfo['audit'] = $totalAudit;
        $pageinfo['expire'] = $totalExpire;

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $archives = $dsql->SetQuery("SELECT l.* FROM `#@__vote_list` l LEFT JOIN `#@__vote_record` r ON r.`tid` = l.`id` WHERE r.`mid` = $admin".$where1.$where);
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            foreach ($results as $key => $val) {
                $list[$key]['id']          = $val['id'];
                $list[$key]['state']       = $val['state'];
                $list[$key]['arcrank']     = $val['arcrank'];
                $list[$key]['click']       = $val['click'];
                $list[$key]['title']       = $val['title'];
                $list[$key]['description'] = $val['description'];
                $list[$key]['pubdate']     = $val['pubdate'];
                $list[$key]['pubdatef']    = date("Y-m-d H:i:s", $val['pubdate']);
                $list[$key]['litpic']      = $val['litpic'] ? getFilePath($val['litpic']) : '';

                // 统计已投票人数
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__vote_record` WHERE `tid` = ".$val['id']);
                $ret = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['join'] = $ret;

                // 累计投票数量
                $d = 0;
                $sql = $dsql->SetQuery("SELECT `id`, `result` FROM `#@__vote_record` WHERE `tid` = ".$val['id']);
                $res = $dsql->dsqlOper($sql, "results");
                if($res){
                    foreach ($res as $k => $value) {
                        $retArr = unserialize($value['result']);
                        if($retArr){
                            foreach ($retArr as $j => $row) {
                                if($row){
                                    $d += count($row);
                                }
                            }
                        }
                    }
                }
                $list[$key]['total'] =  $d;

                $param = array(
                    "service"  => "vote",
                    "template" => "detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }

}
