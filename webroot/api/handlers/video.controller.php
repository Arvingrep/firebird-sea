<?php

/**
 * huoniaoTag模板标签函数插件-视频模块
 *
 * @param $params array 参数集
 * @return array
 */
function video($params, $content = "", &$smarty = array(), &$repeat = array())
{
    extract($params);
    $service = "video";
    if (empty($action)) return '';
    global $huoniaoTag;
    global $dsql;

    //获取指定分类详细信息
    if ($action == "list") {

        if (!empty($keywords)) {
            $huoniaoTag->assign('keywords', $keywords);
        }
        //404
		$typeid = $typeid ? $typeid : $id;
        if (empty($typeid)) {
            $huoniaoTag->assign('typeid', 0);
            return;
            // header("location:".$cfg_basehost."/404.html");
        }

        $huoniaoTag->assign('typeid', $typeid);

        $orderby = empty($orderby) ? 1 : $orderby;
        $huoniaoTag->assign('orderby', $orderby);

        $listHandels = new handlers($service, "typeDetail");
        $listConfig  = $listHandels->getHandle($typeid);

        if (is_array($listConfig) && $listConfig['state'] == 100) {
            $listConfig = $listConfig['info'];
            if (is_array($listConfig)) {
                foreach ($listConfig[0] as $key => $value) {
                    $huoniaoTag->assign('list_' . $key, $value);
                }

                //查询是否存在父级
                $sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__videotype` WHERE `id` = $typeid AND `parentid` != 0");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__videotype` WHERE `id` = " . $ret[0]['parentid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $huoniaoTag->assign('list_pid', $ret[0]['id']);
                        $huoniaoTag->assign('list_ptypename', $ret[0]['typename']);
                    } else {
                        $huoniaoTag->assign('list_pid', $typeid);
                        $huoniaoTag->assign('list_ptypename', $listConfig[0]['typename']);
                    }
                } else {
                    $huoniaoTag->assign('list_pid', $typeid);
                    $huoniaoTag->assign('list_ptypename', $listConfig[0]['typename']);
                }
            }
        }
        return;

        //搜索

    }elseif ($action == "search") {

        $huoniaoTag->assign('keywords', $keywords);

    } elseif ($action == "personal" || $action =='albumlist') {

        global $dsql;
        global $userLogin;
        // $userid = $userLogin->getMemberID();
        // if($userid == -1){
        //     header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");exit;
        // }
        // if(!$id ){
        //     $id = $userid;
        // }

        $id = (int)$id;

		//发布人主页
		$userid = $id;
		if($action == "personal"){
	        $userinfo = getMemberDetail($id);
		}elseif($action == "albumlist" && $id){
			$sql = $dsql->SetQuery("SELECT `uid` FROM `#@__video_album` WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			$userinfo = getMemberDetail($ret[0]['uid']);
			$userid = $ret[0]['uid'];
		}
        $huoniaoTag->assign('id', (int)$id);
        $huoniaoTag->assign('userinfo_per', $userinfo);
        $huoniaoTag->assign('service', $service);
        //发布数
        if($userid){
            $videoCount = $dsql->SetQuery("SELECT `id` FROM `#@__videolist` WHERE `del` = 0 AND `writer` = $userid ");
            $videoCount = $dsql->dsqlOper($videoCount, "totalCount");
        }
        /*  $qjCount    = $dsql->SetQuery("SELECT `id` FROM `#@__quanjinglist` WHERE `del` = 0 AND `admin` = $id ");
          $qjCount    = $dsql->dsqlOper($qjCount, "totalCount");
          $liveCount  = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `user` = $id ");
          $liveCount  = $dsql->dsqlOper($liveCount, "totalCount");*/
        // $fabuCount  = $videoCount + $qjCount + $liveCount;
        $fabuCount  = (int)$videoCount;
        $huoniaoTag->assign('fabuCount', $fabuCount);
        $huoniaoTag->assign('liveCount', $liveCount);
        //粉丝
        if($userid){
            $fCount = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `userid_b` = $userid  AND `temp` = 'video' ");
            $fCount = $dsql->dsqlOper($fCount, "totalCount");
        }
        $huoniaoTag->assign('fCount', (int)$fCount);
        //是否关注
        if($userid && $_userid){
            $is_follow = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `userid_b` = $userid AND `userid` = $_userid AND `temp` = 'video'");
            $is_follow = $dsql->dsqlOper($is_follow, "totalCount");
        }
        $huoniaoTag->assign('is_follow', (int)$is_follow);

    }elseif($action =='albumlist'){
        $pageTitle = '视频专辑';
        $userid = $userLogin->getMemberID();
        if ($id != '') {
            $archives = $dsql->SetQuery("SELECT `title`,`uid` FROM `#@__video_album` WHERE `id` = '" . $id . "'");
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $pageTitle = $results[0]['title'];
                $uid       = $results[0]['uid'];
            }
        }
        $huoniaoTag->assign('pageTitle', $pageTitle);
        $huoniaoTag->assign('aid', $id);

        $userinfo = getMemberDetail($uid);
        $huoniaoTag->assign('userid', $uid);
        $huoniaoTag->assign('userinfo_per', $userinfo);
        //发布数
        $videoCount = $dsql->SetQuery("SELECT `id` FROM `#@__videolist` WHERE `del` = 0 AND `writer` = $uid ");
        $videoCount = $dsql->dsqlOper($videoCount, "totalCount");
        /*  $qjCount    = $dsql->SetQuery("SELECT `id` FROM `#@__quanjinglist` WHERE `del` = 0 AND `admin` = $id ");
          $qjCount    = $dsql->dsqlOper($qjCount, "totalCount");
          $liveCount  = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `user` = $id ");
          $liveCount  = $dsql->dsqlOper($liveCount, "totalCount");*/
        // $fabuCount  = $videoCount + $qjCount + $liveCount;
        $fabuCount  = $videoCount;
        $huoniaoTag->assign('fabuCount', $fabuCount);
        $huoniaoTag->assign('liveCount', $liveCount);
        //粉丝
        $fCount = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `userid_b` = $uid  AND `temp` = 'video' ");
        $fCount = $dsql->dsqlOper($fCount, "totalCount");
        $huoniaoTag->assign('fCount', $fCount);
        //是否关注
        $is_follow = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `us erid_b` = $uid AND `userid` = $userid AND `temp` = 'video'");
        $is_follow = $dsql->dsqlOper($is_follow, "totalCount");
        $huoniaoTag->assign('is_follow', $is_follow);

    } elseif ($action == "detail" || $action == "comment") {
        global $userLogin;
        $userid   = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                $videocharge     = $detailConfig['videocharge'];
                $videochargeinfo = $detailConfig['videochargeinfo'];
                $price           = $detailConfig['price'];
                
                $openvideo = 0;
                $videochargearr = array();
                if($videocharge!=''){
                    $videochargearr = explode(',',$videocharge);
                    $huoniaoTag->assign('videochargearr',$videochargearr);
                }
                if(in_array('3',$videochargearr)){
                    //先查询order表，如果没有再查询pay_log
                    $sql = $dsql::SetQuery("select `id` from `#@__video_order` where `state`=1 and `uid`=$userid and `aid`=$id");
                    $exist = (int)$dsql->getOne($sql);
                    if($exist){
                        $openvideo = 1;
                    }
                    //没有的情况下，查老数据
                    else{
                        $payid = array();
                        if($userid > -1){
                            $paysql = $dsql ->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `uid` = '".$userid."' AND `state` = 1 AND `ordertype` = 'video'");
                            $payres = $dsql->dsqlOper($paysql,"results");
                            if($payres){
                                foreach ($payres as $k=>$v){
                                    $bdyarr = unserialize($v['body']);
                                    array_push($payid,$bdyarr['aid']);
                                }
                            }
                        }
                        if(in_array($id,$payid)){
                            $openvideo = 1;
                        }
                    }
                }else{
                    if($videocharge == 1 && in_array('1',$videochargearr)){
                        if(in_array($userinfo['level'],explode(',',$videochargeinfo))){
                            $openvideo = 1;
                        }
                    }elseif($videocharge ==0){
                        $openvideo = 1;
                    }
                }

                $huoniaoTag->assign('openvideo', $openvideo);
                $huoniaoTag->assign('price', $price);



                detailCheckCity("video", $detailConfig['id'], $detailConfig['cityid']);

                //跳转
                if (strpos($detailConfig['flag'], 't') !== false && !empty($detailConfig['redirecturl'])) {
                    header("location:" . $detailConfig['redirecturl']);
                    die;
                }

                //获取分类信息
                $listHandels = new handlers($service, "typeDetail");
                $listConfig  = $listHandels->getHandle($detailConfig['typeid']);
                if (is_array($listConfig) && $listConfig['state'] == 100) {
                    $listConfig = $listConfig['info'];
                    if (is_array($listConfig)) {
                        foreach ($listConfig[0] as $key => $value) {
                            $huoniaoTag->assign('list_' . $key, $value);
                        }
                    }
                }

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }

                //调取视频设置
                if ($detailConfig['videotype'] == 0) {
                    require(HUONIAOINC . "/config/video.inc.php");

                    $startlitpicPath = getFilePath($startlitpic);
                    $pauselitpicPath = getFilePath($pauselitpic);
                    $endlitpicPath   = getFilePath($endlitpic);

                    $mstartlitpicPath = getFilePath($mstartlitpic);
                    $mpauselitpicPath = getFilePath($mpauselitpic);
                    $mendlitpicPath   = getFilePath($mendlitpic);

                    $huoniaoTag->assign('AK', $AK);
                    $huoniaoTag->assign('startUrl', $startUrl);
                    $huoniaoTag->assign('startTime', $startTime);
                    $huoniaoTag->assign('startlitpicPath', $startlitpicPath);
                    $huoniaoTag->assign('pauseUrl', $pauseUrl);
                    $huoniaoTag->assign('pauselitpicPath', $pauselitpicPath);
                    $huoniaoTag->assign('endUrl', $endUrl);
                    $huoniaoTag->assign('endlitpicPath', $endlitpicPath);

                    $huoniaoTag->assign('mstartUrl', $mstartUrl);
                    $huoniaoTag->assign('mstartTime', $mstartTime);
                    $huoniaoTag->assign('mstartlitpicPath', $mstartlitpicPath);
                    $huoniaoTag->assign('mpauseUrl', $mpauseUrl);
                    $huoniaoTag->assign('mpauselitpicPath', $mpauselitpicPath);
                    $huoniaoTag->assign('mendUrl', $mendUrl);
                    $huoniaoTag->assign('mendlitpicPath', $mendlitpicPath);

                }

                global $p;
                global $all;
                $body    = $detailConfig['body'];
                $pagesss = '_huoniao_page_break_tag_';  //设定分页标签
                $a       = strpos($body, $pagesss);
                if ($a && !$all) {
                    $con = explode($pagesss, $body);
                    if ($p && $p > 0) {
                        $huoniaoTag->assign('detail_body', $con[$p - 1]);
                    } else {
                        $huoniaoTag->assign('detail_body', $con[0]);
                    }
                } else {
                    $huoniaoTag->assign('detail_body', str_replace($pagesss, "", $body));
                }
                $huoniaoTag->assign('detail_page', bodyPageList(array("body" => $body, "page" => $p)));

                //更新阅读次数
                global $dsql;
                $sql = $dsql->SetQuery("UPDATE `#@__" . $service . "list` SET `click` = `click` + 1 WHERE `id` = " . $id);
                $dsql->dsqlOper($sql, "update");

            }
        } else {
            header("location:" . $cfg_basehost . "/404.html");
        }
        return;

	//支付
	}elseif($action == 'pay'){

		global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if($userid == -1){
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");exit;
        }

		if($ordernum && $userid > 0){

			$sql = $dsql->SetQuery("SELECT `body`, `pubdate` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$body = $ret[0]['body'];
				$pubdate = $ret[0]['pubdate'];
				$body = unserialize($body);

				$amount = sprintf("%.2f", $body['amount'] + $body['balance']);
				$aid = $body['aid'];

				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__videolist` WHERE `id` = $aid");
				$ret = $dsql->dsqlOper($sql, "results");
				$title = $ret[0]['title'];

				$huoniaoTag->assign('totalAmount', $amount);
				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('aid', $aid);
				$huoniaoTag->assign('ordernum', $ordernum);
				$huoniaoTag->assign('orderdate', ($pubdate+1800)-time());  //半小时
			}else{
				$param = array(
					"service"     => "video",
				);
				header("location:" . getUrlPath($param));
				die;
			}
		}else{
			$param = array(
				"service"     => "video",
			);
			header("location:" . getUrlPath($param));
			die;
		}

    }elseif ($action == 'payreturn'){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if (!empty($ordernum)) {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `ordertype` = 'video' AND `uid` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $body = unserialize($res[0]['body']);
                $aid = $body['aid'];
                $param = array(
                    "service"     => "video",
                    "template"    => "detail",
                    "id"          => $aid
                );
                header("location:" . getUrlPath($param));
                die;
            }

        }else{
            header("location:" . $cfg_basehost . "/404.html");
            die;
        }
    }
    global $template;
    if (empty($smarty)) return;

    if (!isset($return))
        $return = 'row'; //返回的变量数组名

    //注册一个block的索引，照顾smarty的版本
    if (method_exists($smarty, 'get_template_vars')) {
        $_bindex = $smarty->get_template_vars('_bindex');
    } else {
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if (!$_bindex) {
        $_bindex = array();
    }

    if ($return) {
        if (!isset($_bindex[$return])) {
            $_bindex[$return] = 1;
        } else {
            $_bindex[$return]++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

    //对象$smarty上注册一个数组以供block使用
    if (!isset($smarty->block_data)) {
        $smarty->block_data = array();
    }

    //得一个本区块的专属数据存储空间
    $dataindex = md5(__FUNCTION__ . md5(serialize($params)));
    $dataindex = substr($dataindex, 0, 16);

    //使用$smarty->block_data[$dataindex]来存储
    if (!$smarty->block_data[$dataindex]) {
        //取得指定动作名
        $moduleHandels = new handlers($service, $action);

        $param = $params;

        //获取分类
        if ($action == "type" || $action == "addr") {
            $param['son'] = $son ? $son : 0;

            //信息列表
        } elseif ($action == "alist") {
            //如果是列表页面，则获取地址栏传过来的typeid
            if ($template == "list" && !$typeid) {
                global $typeid;
            }
            !empty($typeid) ? $param['typeid'] = $typeid : "";

        }

        $moduleReturn = $moduleHandels->getHandle($param);

        //只返回数据统计信息
        if ($pageData == 1) {
            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
            } else {
                $moduleReturn = $moduleReturn['info'];  //返回数据
                $pageInfo_    = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

            //正常返回
        } else {

            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';
            $moduleReturn = $moduleReturn['info'];  //返回数据
            $pageInfo_    = $moduleReturn['pageInfo'];
            if ($pageInfo_) {
                //如果有分页数据则提取list键
                $moduleReturn = $moduleReturn['list'];
                //把pageInfo定义为global变量
                global $pageInfo;
                $pageInfo = $pageInfo_;
                $smarty->assign('pageInfo', $pageInfo);
            }

            $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

        }
    }

    //果没有数据，直接返回null,不必再执行了
    if (!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    if ($action == "type") {
        //print_r($smarty->block_data[$dataindex]);die;
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if (list($key, $item) = each($smarty->block_data[$dataindex])) {
        if ($action == "type") {
            //print_r($item);die;
        }
        $smarty->assign($return, $item);
        $repeat = true;
    }

    //如果已经到达最后，重置数组指针，重复执行开关置位0
    if (!$item) {
        reset($smarty->block_data[$dataindex]);
        $repeat = false;
    }

    //打印内容
    print $content;
}
