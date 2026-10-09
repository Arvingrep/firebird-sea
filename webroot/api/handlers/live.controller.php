<?php

/**
 * huoniaoTag模板标签函数插件-直播模块
 *
 * @param $params array 参数集
 * @return array
 */
function live($params, $content = "", &$smarty = array(), &$repeat = array())
{
    extract($params);
    $service = "live";
    if (empty($action)) return '';
    global $huoniaoTag;
    //var_dump($params);die;
    //获取指定分类详细信息
    if ($action == "livelist") {
        $huoniaoTag->assign('keywords', $keywords);
        $huoniaoTag->assign('typeid', $typeid);
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('orderby', $orderby);
        $huoniaoTag->assign('page', $page);
        $listHandels = new handlers($service, "typeDetail");
        $listConfig  = $listHandels->getHandle($typeid);
        //print_R($listConfig);exit;
        if (is_array($listConfig) && $listConfig['state'] == 100) {
            $listConfig = $listConfig['info'];
            if (is_array($listConfig)) {
                foreach ($listConfig[0] as $key => $value) {
                    $huoniaoTag->assign('live_' . $key, $value);
                }
            }
        }
        $param = array(
            "service" => "member",
            "type" => "user",
            "template" => "fabu-live"
        );
        $url   = getUrlPath($param);
        $huoniaoTag->assign('liveurl', $url);
        //搜索
    } elseif ($action == "search") {

        //关键字为空跳回首页
        if (empty($keywords)) {
            /* header("location:index.html");
            die; */
        }

        $huoniaoTag->assign('keywords', $keywords);
        $huoniaoTag->assign('page', (int)$page);
        $huoniaoTag->assign('type', (int)$type);
        $huoniaoTag->assign('orderby', $orderby);
        $huoniaoTag->assign('state', $state);
        return;

        //获取指定ID的详细信息
    } elseif ($action == "detail" || $action == "h_detail") {

        if(isMobile() && $action == "detail"){
            $url = getUrlPath(array(
                'service' => 'live',
                'template' => 'h_detail',
                'id' => $id
            ));
            header("location:" . $url);
            die;
        }elseif(!isMobile() && $action == "h_detail"){
            $url = getUrlPath(array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $id
            ));
            header("location:" . $url);
            die;
        }

        global $userLogin;
        global $dsql;
        $userid = $userLogin->getMemberID();

		//查询是否拉黑
		if($userid > -1){
			$sql = $dsql->SetQuery("SELECT `id`, `block` FROM `#@__live_member` WHERE `aid` = $id AND `uid` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$block = (int)$ret[0]['block'];
				if($block){
					$url = getUrlPath(array(
		                'service' => 'live',
		                'template' => 'index'
		            ));
					echo '<script>alert("您已被拉黑！");location.href="'.$url.'";</script>';
		            die;
				}
			}
		}

        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];

			//回放状态
			if(!$detailConfig[0]['replaystate'] && $detailConfig[0]['state'] == 2){
				$url = getUrlPath(array(
					'service' => 'live',
					'template' => 'index'
				));
				echo '<script>alert("回放已关闭，请观看其他直播间！");location.href="'.$url.'";</script>';
				die;
			}

            //判断直播类型
            $liveType     = $detailConfig[0]['catid'];
            $liveUserAuth = 0;
            if ($liveType != 0) {
                $sql_auth = $dsql->SetQuery("SELECT `is_auth` FROM `#@__livelist_auth` WHERE `live_id` = {$id} AND `user_id` = {$userid}");
                $ret_auth = $dsql->dsqlOper($sql_auth, "results");
                if (!isset($ret_auth[0])) {
                    $liveUserAuth = 0;
                    //添加当前用户与当前直播的权限关系
                    $sql_auth = $dsql->SetQuery("INSERT INTO `#@__livelist_auth` (`user_id`, `live_id`) VALUES ( $userid, $id)");
                    $ret_auth = $dsql->dsqlOper($sql_auth, "lastid");
                } else {
                    if ($ret_auth[0]['is_auth'] == 1) {
                        $liveUserAuth = 1;
                    } else {
                        $liveUserAuth = 0;
                    }
                }
            } else {
                $liveUserAuth = 1;
            }

			//自己观看或者管理员不需要付费
			if($userid == $detailConfig[0]['user'] || $userLogin->getUserID() > 0){
				$liveUserAuth = 1;
			}

            if ($liveType == 2) {
                $livemoney = $detailConfig[0]['startmoney'];
                //判断是否结束直播
                if ($detailConfig[0]['state'] == 2) {
                    $livemoney = $detailConfig[0]['endmoney'];
                }
                $huoniaoTag->assign('livemoney', $livemoney);
            } else if ($liveType == 1) {
                $param        = array(
                    "service" => "live",
                    "template" => "check_pass",
                    "id" => $id
                );
                $checkPassUrl = getUrlPath($param);
                $huoniaoTag->assign('check_pass_url', $checkPassUrl);

            }
            $huoniaoTag->assign('liveType', $liveType);
            $huoniaoTag->assign('liveUserAuth', $liveUserAuth);

            if (is_array($detailConfig)) {
                //print_R($detailConfig);exit;
                foreach ($detailConfig[0] as $key => $value) {
                    $huoniaoTag->assign('livedetail_' . $key, $value);
                }
            }
            //在线人数
            $detailHandels = new handlers($service, "describeLiveStreamOnlineUserNum");
            $onLineParm    = array('Streamname' => $detailConfig[0]['streamname']);
            $onLineConfig  = $detailHandels->getHandle($onLineParm);
            if ($onLineConfig['state'] == 100) {
                $huoniaoTag->assign('onLineNums', $onLineConfig['info']['TotalUserNumber']);
            }
            //判断当前登录会员是否已经关注过要访问的会员
            $userid = $userLogin->getMemberID();
            $fid    = $detailConfig[0]['user'];
            $sql    = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = $fid AND `fortype` = ''");
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret && is_array($ret)) {
                $huoniaoTag->assign('isfollow', 1);
            }
            $huoniaoTag->assign('fid', $fid);
            $huoniaoTag->assign('userid', $userid);
            //聊天室ID
            $chatRoomId = 'chatroom' . $id;
            $huoniaoTag->assign('detail_chatRoomId', $chatRoomId);
            $huoniaoTag->assign('detail_chatRoomIds', $id);

            if($detailConfig[0]['pulltype'] == 1){
                $huoniaoTag->assign('detail_mp4url', $detailConfig[0]['pullurl_pc']);
                $huoniaoTag->assign('detail_m3u8url', $detailConfig[0]['pullurl_touch']);
                $huoniaoTag->assign('detail_url', isMobile() ? $detailConfig[0]['pullurl_touch'] : $detailConfig[0]['pullurl_pc']);
            }else{
                //获取推流地址
                if ($detailConfig[0]['state'] == 2) {

                    include HUONIAOINC . "/config/live.inc.php";

                    //获取录播地址
                    if (empty($detailConfig[0]['ossurl'])) {

                        //查看录播的URL地址
                        $streamNameHandels = new handlers($service, "describeLiveStreamRecordIndexFiles");
                        $streamNameConfig  = $streamNameHandels->getHandle($detailConfig[0]['streamname']);
                        if ($streamNameConfig['state'] == 100 && is_array($streamNameConfig['info']['RecordIndexInfoList']['RecordIndexInfo'])) {
                            $requestUrl      = $streamNameConfig['info']['RecordIndexInfoList']['RecordIndexInfo'][0]['RecordUrl'];
                            $RecordIndexInfo = $streamNameConfig['info']['RecordIndexInfoList']['RecordIndexInfo'];
                            $mp4File         = $m3u8File = '';
                            // include_once(HUONIAOROOT."/api/live/alilive/alilive.class.php");
                            //include HUONIAOINC."/config/live.inc.php";
                            // $aliLive = new Alilive() ;

                            $OssObject = "";
                            $Duration = 0;
                            foreach ($RecordIndexInfo as $key => $value) {
                                if (strstr($value['OssObject'], 'm3u8')) {
                                    // $m3u8File = $value['RecordUrl'];
                                    $m3u8File  = $custom_server . $value['OssObject'];
                                    $OssObject = str_replace('.m3u8', '', $value['OssObject']);
                                    // $m3u8File = $custom_server . $aliLive->ossSignatureurl($requestUrl, $value['OssObject']);
                                }
                                if (strstr($value['OssObject'], 'mp4')) {
                                    // $mp4File = $value['RecordUrl'];
                                    $mp4File   = $custom_server . $value['OssObject'];
                                    $OssObject = str_replace('.mp4', '', $value['OssObject']);
                                    // $mp4File = $custom_server . $aliLive->ossSignatureurl($requestUrl, $value['OssObject']);
                                }
                                $Duration = $value['Duration'] * 1000;
                            }

                            $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `ossurl` = '$OssObject', `livetime` = $Duration WHERE `id` = " . $id);
                            $dsql->dsqlOper($archives, "update");

                            // $huoniaoTag->assign('detail_mp4url', $mp4File);
                            // $huoniaoTag->assign('detail_m3u8url', $m3u8File);
                        } else {
                            return array("state" => 200, "info" => '本次直播未录制！');
                        }

                        //取数据库数据
                    } else {
                        $m3u8File = $custom_server . $detailConfig[0]['ossurl'] . ".m3u8";
                        $mp4File  = $custom_server . $detailConfig[0]['ossurl'] . ".mp4";
                    }

                    $huoniaoTag->assign('detail_mp4url', $mp4File);
                    $huoniaoTag->assign('detail_m3u8url', $m3u8File);

                } else {
                    $PulldetailHandels = new handlers($service, "getPullSteam");
                    if (isMobile()) {
                        $param = array('id' => $id, 'type' => 'm3u8');
                    } else {
                        $param = array('id' => $id, 'type' => 'flv');
                    }
                    $PulldetailConfig = $PulldetailHandels->getHandle($param);
                    $huoniaoTag->assign('detail_url', $PulldetailConfig['info']);
                }
            }

            //更新浏览次数
            if($liveUserAuth){
				if ($detailConfig[0]['state'] == 2) {
		            $sql = $dsql->SetQuery("UPDATE `#@__livelist` SET `replay` = `replay` + 1 WHERE `id` = " . $id);
		            $dsql->dsqlOper($sql, "results");
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__livelist` SET `click` = `click` + 1 WHERE `id` = " . $id);
		            $dsql->dsqlOper($sql, "results");
				}
			}


            /*更新浏览足迹表   */
			if($userid != $detailConfig[0]['user'] && $userLogin->getUserID() > 0){
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig[0]['user']) {
                    $uphistoryarr = array(
                        'module'    => $service,
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig[0]['user'],
                        'module2'   => 'detail',
                    );

                    updateHistoryClick($uphistoryarr);
                }
			}

            //百度云 web播放器 accessKey，从视频模块获取
            $videoConfigInc = HUONIAOINC."/config/video.inc.php";
            if(file_exists($videoConfigInc)){
              require($videoConfigInc);
              $huoniaoTag->assign('AK', $AK);
            }


        } else {
            header("location:" . $cfg_basehost . "/404.html");
        }
        return;
    } elseif ($action == "anchor_index") {
        global $dsql;
        global $userLogin;
        //获取主播的信息
        if (!empty($userid)) {
            $member = getMemberDetail($userid);
            if ($member) {
                $huoniaoTag->assign('type', $type);
                //访问量
                $vsql    = $dsql->SetQuery("SELECT SUM(click) as views FROM `#@__livelist` WHERE user='$userid'");
                $viewret = $dsql->dsqlOper($vsql, "results");
                //$views = $viewret[0]['views']>=10000 ? round($viewret[0]['views']/10000,2) : $viewret[0]['views'];
                $huoniaoTag->assign('views', $viewret[0]['views']);

                //判断当前登录会员是否已经关注过要访问的会员
                $loginuserid = $userLogin->getMemberID();
                $fid         = $userid;
                $sql         = $dsql->SetQuery("SELECT `id` FROM `#@__live_follow` WHERE `tid` = $loginuserid AND `fid` = $fid");
                $ret         = $dsql->dsqlOper($sql, "results");
                if ($ret && is_array($ret)) {
                    $huoniaoTag->assign('isfollow', 1);
                }
                $huoniaoTag->assign('fid', $fid);
                $huoniaoTag->assign('userid', $loginuserid);

                $name  = !empty($member['username']) ? $member['username'] : $member['nickname'];
                $photo = !empty($member['photo']) ? $member['photo'] : '/static/images/noPhoto_40.jpg';
                $huoniaoTag->assign('anchor_name', $name);
                $huoniaoTag->assign('anchor_photo', $photo);
                $huoniaoTag->assign('anchor_id', $userid);

                $archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__live_follow` WHERE fid='$userid'");
                //总条数
                $ftotalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
                $ftotalCount   = (int)$ftotalResults[0][0];

                $archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__live_follow` WHERE tid='$userid'");
                //总条数
                $ttotalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
                $ttotalCount   = (int)$ttotalResults[0][0];

                $huoniaoTag->assign('ftotalCount', $ftotalCount);
                $huoniaoTag->assign('ttotalCount', $ttotalCount);
            } else {
                header("location:" . $cfg_basehost . "/404.html");
            }
        } else {
            header("location:" . $cfg_basehost . "/404.html");
        }

    } elseif ($action == 'index') {
        global $userLogin;
        global $dsql;

        $param = array(
            "service" => "member",
            "type" => "user",
            "template" => "fabu-live"
        );
        $url   = getUrlPath($param);
        $huoniaoTag->assign('liveurl', $url);

    } elseif ($action == 'fabu_live') {
        $param = array(
            "service" => "live",
            "template" => "live_details"
        );
        $url   = getUrlPath($param);
        $huoniaoTag->assign('url', $url);
    } elseif ($action == 'live_details') {
        global $userLogin;
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            header("location:" . $cfg_basehost . "/login.html");
        }
        //$sql = $dsql->SetQuery("SELECT `title`,`click`,`litpic`,`ftime`,`typeid`,`catid`,`flow`,`way`,`pushurl` FROM `huoniao_livelist` where id =(SELECT max(`id`) i FROM `#@__livelist` where user='$userid')");
        $sql = $dsql->SetQuery("SELECT `title`,`click`,`litpic`,`ftime`,`typeid`,`catid`,`flow`,`way`,`pushurl` FROM `huoniao_livelist` where id='$id'");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            //直播分类
            $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__livetype` WHERE `id` = " . $res[0]['typeid']);
            $result   = $dsql->dsqlOper($archives, "results");
            $typename = !empty($result[0]['typename']) ? $result[0]['typename'] : '';
            //直播类型
            $catidtype = empty($res[0]['catid']) ? '公开' : ($res[0]['catid'] == 1 ? '加密' : '收费');
            $title     = empty($res[0]['title']) ? '无标题' : $res[0]['title'];
            //流畅度
            $flowname = $res[0]['flow'] == 1 ? '流畅' : ($res[0]['flow'] == 2 ? '普清' : '高清');
            //直播方式
            $wayname = empty($res[0]['way']) ? '横屏' : '竖屏';
            $click   = empty($res[0]['click']) ? '0' : $res[0]['click'];
            $litpic  = !empty($res[0]['litpic']) ? (strpos($res[0]['litpic'], 'images') ? $cfg_secureAccess . $cfg_basehost . $res[0]['litpic'] : getFilePath($res[0]['litpic'])) : $cfg_secureAccess . $cfg_basehost . '/static/images/404.jpg';
            $ftime   = !empty($res[0]['ftime']) ? date("Y-m-d H:i:s", $res[0]['ftime']) : date("Y-m-d H:i:s", time());
            $pushurl = !empty($res[0]['pushurl']) ? $res[0]['pushurl'] : '';
            $huoniaoTag->assign('typename', $typename);
            $huoniaoTag->assign('catidtype', $catidtype);
            $huoniaoTag->assign('flowname', $flowname);
            $huoniaoTag->assign('click', $click);
            $huoniaoTag->assign('wayname', $wayname);
            $huoniaoTag->assign('ftime', $ftime);
            $huoniaoTag->assign('title', $title);
            $huoniaoTag->assign('pushurl', $pushurl);
            $huoniaoTag->assign('litpic', $litpic);
        }
    } elseif ($action == 'check_pass') {
        global $userLogin;
        global $dsql;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            header("location:" . $cfg_basehost . "/login.html");exit;
        }


        $sql = $dsql->SetQuery("SELECT * FROM `#@__livelist` where id = {$id}");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret[0]['catid'] == 1) {
            $pass = $ret[0]['password'];
            if ($password == $pass) {
                $sql_in = $dsql->SetQuery("UPDATE `#@__livelist_auth` set `is_auth` = 1 where `live_id` = {$id} AND `user_id` = {$userid}");
                $dsql->dsqlOper($sql_in, "update");

                if (isMobile()) {
                    if ($ret[0]['way'] == 1) {
                        $param = array(
                            "service" => "live",
                            "template" => "detail",
                            "id" => $id
                        );
                    } else {
                        $param = array(
                            "service" => "live",
                            "template" => "h_detail",
                            "id" => $id
                        );
                    }
                } else {
                    $param = array(
                        "service" => "live",
                        "template" => "detail",
                        "id" => $id
                    );
                }

                $url = getUrlPath($param);

                header("Location: $url");
                exit;

            } else {
                echo '密码错误';
                exit;
            }
        }

    } elseif ($action == 'returnLivePay') {
        global $dsql;

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_payorder` WHERE `order_id` = '$ordernum'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $lid = $ret[0]['live_id'];

            $sql_way = $dsql->SetQuery("SELECT * FROM `#@__livelist` WHERE `id` = '$lid'");
            $ret_way = $dsql->dsqlOper($sql_way, "results");

            if (isMobile()) {
                if ($ret_way[0]['way'] == 1) {
                    $param = array(
                        "service" => "live",
                        "template" => "detail",
                        "id" => $lid
                    );
                } else {
                    $param = array(
                        "service" => "live",
                        "template" => "h_detail",
                        "id" => $lid
                    );
                }
            } else {
                $param = array(
                    "service" => "live",
                    "template" => "detail",
                    "id" => $lid
                );
            }

            $url = getUrlPath($param);

            header("Location: $url");
            exit;
        }

    }else if ($action == 'sharePage'){
        //直播分享页面
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $userid = $userLogin->getMemberID();
        $huoniaoTag->assign('userInfo', getMemberDetail($userid));
        if($userid == -1){
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");exit;
        }
        if(!$liveid){
            echo '<script>alert(\'请求错误\');</script>';exit;
        }
        $date = time();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_share` WHERE `share_userid` = $userid AND `live_id` = $liveid");
        $count = $dsql->dsqlOper($sql, "totalCount");
        if(!$count){
            $sql = $dsql->SetQuery("INSERT INTO `#@__live_share` (`live_id`, `share_userid`, `date`) VALUES ($liveid, $userid, $date)");
            $dsql->dsqlOper($sql, "update");
        }

//        $url = $cfg_secureAccess.$cfg_basehost . "/include/live_share_after.php?share_user=$userid&share_live=$liveid";
        $url = $cfg_secureAccess.$cfg_basehost . "/live/sharePageAfter-$userid-$liveid.html";
        $huoniaoTag->assign('url', $url);

        //直播detail
        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($liveid);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            foreach ($detailConfig[0] as $key => $value){
                $huoniaoTag->assign('detail_'. $key, $value);
            }
        }

    }else if($action == 'sharePageAfter'){
        global $userLogin;
        global $cfg_basehost;
        global $cfg_secureAccess;
        global $dsql;

        $login_user = $userLogin->getMemberID();

        if($login_user == -1){
//            $url = $cfg_secureAccess.$cfg_basehost . "/include/live_share_after.php?share_user=$share_user&share_live=$share_live";
            $url = $cfg_secureAccess.$cfg_basehost . "/live/sharePageAfter-$share_user-$share_live.html";
            PutCookie("live_share_url", $url, 3600);
            $login_url =  $cfg_secureAccess.$cfg_basehost . "/login.html";
            echo "<script> window.onload = function (){alert(\"您必须先登录才能观看直播~\");window.location.href = '$login_url'; } </script>";
            exit;
        }

        if($login_user != $share_user){

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_share_success_user` WHERE `share_user` = $share_user AND `live_id` = $share_live AND `success_share_user` = $login_user ");
            $count = $dsql->dsqlOper($sql, "totalCount");
            if(!$count){
                $date = time();
                $sql = $dsql->SetQuery("INSERT INTO `#@__live_share_success_user` (`live_id`, `share_user`, `success_share_user`, `date`) VALUES ($share_live, $share_user, $login_user, $date)");
                $dsql->dsqlOper($sql, "update");
            }
        }


        $param = array(
            "service" => "live",
            "template" => "h_detail",
            "id" => $share_live
        );
        $redirect_url = getUrlPath($param);
        header("Location: $redirect_url");exit;

    }else if($action == 'pay'){
        global $userLogin;
        global $cfg_secureAccess;
        global $dsql;

        $uid = $userLogin->getMemberID();

        if($uid == -1){
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");exit;
            die;
        }

        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_payorder` WHERE `order_id` = '$ordernum'");
        $ret = $dsql->dsqlOper($sql, "results");

        if($ret){
            $amount = $ret[0]['amount'];
            $live_id = $ret[0]['live_id'];
            $paysee = $ret[0]['paysee'];
            $huoniaoTag->assign("totalAmount", $amount);
            $huoniaoTag->assign("ordernum", $ordernum);
            $huoniaoTag->assign("paysee", $paysee);

        }

    }elseif($action == 'redPacket'){
        global $userLogin;
        global $dsql;
        $huoniaoTag->assign('live_id', $liveid);
        $huoniaoTag->assign('chatid', $chatid);

    //支付结果页面
    }elseif($action == 'payreturn'){
        global $dsql;

		if(!empty($ordernum)){
			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT `state`, `amount`, `ordernum` FROM `#@__pay_log` WHERE `ordertype` = 'live' AND `ordernum` = '$ordernum'");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){
				$order_id = $payDetail[0]['ordernum'];
                $archives     = $dsql->SetQuery("SELECT `id`, `live_id` FROM `#@__live_payorder` WHERE `order_id` = '$order_id'");
                $orderDetail  = $dsql->dsqlOper($archives, "results");

				$title = "";
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__livelist` WHERE `id` = ".$orderDetail[0]['live_id']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
				}

				$param = array(
					"service"     => "live",
					"template"    => "h_detail",
					"id"          => $orderDetail[0]['live_id']
				);
				$url = getUrlPath($param);

				$huoniaoTag->assign('state', $payDetail[0]['state']);
				$huoniaoTag->assign('ordernum', $payDetail[0]['ordernum']);
				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('url', $url);
				$huoniaoTag->assign('amount', sprintf("%.2f", $payDetail[0]['amount']));

			//支付订单不存在
			}else{
				$huoniaoTag->assign('state', 0);
			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
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
        $param         = $params;
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
