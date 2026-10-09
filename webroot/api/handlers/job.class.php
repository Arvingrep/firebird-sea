<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 招聘模块API接口
 *
 * @version        $Id: job.class.php 2014-4-4 上午09:06:25 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class job
{
    private $param;  //参数

    public $right = false; //超级权限
    /**
     * 关注公司的简历【人】【默认简历】
     * 1.有简历
     * 2.简历能打开
     * 3.符合投递规则【未实现】
     * 4.显示收藏（或浏览）和收藏内容和收藏时间
    */
    public function interestCompany(){
        global $dsql;
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 10;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $jobs = $dsql->getArr($dsql::SetQuery("select `id` from `#@__job_post` where `company`=$cid and `del`=0"));
        if(empty($jobs)){
            $collectSql = $dsql::SetQuery("select 'collect' as 'type','company' as 'contentType',c.`aid`,c.`userid`,c.`pubdate` 'date' from `#@__member_collect` c where c.`module`='job' and (c.`action`='company' and c.`aid`=$cid)");
            $clickSql = $dsql::SetQuery("select 'click' as 'type','company' as 'contentType',h.`aid`,h.`uid` 'userid',h.`date` from `#@__job_historyclick` h where h.`module`='job' and (h.`module2`='companyDetail' and h.`aid`=$cid)");
        }else{
            $jobs = join(",",$jobs);
            $collectSql = $dsql::SetQuery("select 'collect' as 'type',(case when `action`='company' then 'company' else 'job' end ) as 'contentType',c.`aid`,c.`userid`,c.`pubdate` 'date' from `#@__member_collect` c where c.`module`='job' and ((c.`action`='company' and c.`aid`=$cid) or (c.`action`='job' and c.`aid` in ($jobs)))");
            $clickSql = $dsql::SetQuery("select 'click' as 'type',(case when `module2`='companyDetail' then 'company' else 'job' end) as 'contentType',h.`aid`,h.`uid` 'userid',h.`date` from `#@__job_historyclick` h where h.`module`='job' and ((h.`module2`='postDetail' and h.`aid` in($jobs)) or (h.`module2`='companyDetail' and h.`aid`=$cid))");
        }
        //收藏我、看过我
        $type = $param['type'];
        //4种都有
        if($type=="" || empty($type)){
            $allSql = "SELECT t.*,r.`id` 'rid' FROM (".$collectSql." UNION ALL ".$clickSql.") t";
        }
        //收藏我【公司主页 || 职位】
        elseif($type==1){
            //member_collect ==> `module` = 'job' AND `action` = 'company' || `module` = 'job' AND `action` = 'job'
            $allSql = "SELECT t.*,r.`id` 'rid' FROM (".$collectSql.") t";
        }
        //看过我【公司 || 职位】
        elseif($type==2){
            //job_historyclick ==> `module`='job' and `module2`='postDetail' || `module`='job' and `module2`='companyDetail'
            $allSql = "SELECT t.*,r.`id` 'rid' FROM (".$clickSql.") t";
        }else{
            return array("state"=>200,"info"=>"state参数异常");
        }
        $allSql .= " left join ".$dsql::SetQuery("`#@__job_resume`")." r on t.`userid`=r.`userid` where r.`default`=1 and r.`private`=0 and r.`state`=1 and r.`del`=0 and r.`id` is not null order by t.`date` desc";
        $pageObj = $dsql->getPage($page,$pageSize,$allSql);
        $this->right = true;
        foreach ($pageObj['list'] as & $item){
            $item['userid'] = (int)$item['userid'];
            $item['date'] = (int)$item['date'];
            $item['aid'] = (int)$item['aid'];
            $item['rid'] = (int)$item['rid'];
            //找出默认简历
            $this->param = array("id"=>$item['rid']);
            $item['resume'] = $this->resumeDetail();
            //职位
            if($item['contentType']=="job"){
                $this->param = array("id"=>$item['aid']);
                $item['post'] = $this->postDetail();
            }else{
                $item['post'] = (object)array();
            }
        }
        $this->right = false;
        unset($item);
        return $pageObj;
    }

    /**
     * 商家浏览记录【简历】
    */
    public function getCompanyFooter(){
        global $dsql;
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 10;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $uid = $this->getUid();
        //从historyclick中获取
        $sql = $dsql::SetQuery("select h.`aid` 'id',h.`date` from `#@__job_historyclick` h left join `#@__job_resume` r on h.`aid`=r.`id` where h.`uid`=$uid and h.`module2`='resumeDetail' and r.`id` is not null order by `date` desc");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        $this->right = true;
        foreach ($pageObj['list'] as & $item){
            $this->param = array("id"=>$item['id']);
            $item['id'] = (int)$item['id'];
            $item['date'] = (int)$item['date'];
            $item['resume'] = $this->resumeDetail();
        }
        unset($item);
        $this->right = false;
        return $pageObj;
    }

    /**
     * 面试详情【商家端】
    */
    public function interviewDetail(){
        global $dsql;
        $param = $this->param;
        $id = $param['id'] ?? ''; //面试的id
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $sql = $dsql::SetQuery("select i.*,case when unix_timestamp(current_timestamp)<=i.`date` && i.`state`=1 then 0 
else 1 end as 'stating' from `#@__job_invitation` i where i.`cid`=$cid and i.`id`=$id");
        $detail = $dsql->getArr($sql);
        $detail['id'] = (int)$detail['id'];
        $detail['cid'] = (int)$detail['cid'];
        $detail['pid'] = (int)$detail['pid'];
        $detail['rid'] = (int)$detail['rid'];
        $detail['userid'] = (int)$detail['userid'];
        $detail['date'] = (int)$detail['date'];
        $detail['state'] = (int)$detail['state'];
        $detail['rz_date'] = (int)$detail['rz_date'];
        $detail['rz_state'] = (int)$detail['rz_state'];
        $detail['refuse_time'] = (int)$detail['refuse_time'];
        //简历信息
        $this->right = true;
        $this->param = array("id"=>$detail['rid']);
        $detail['resume'] = $this->resumeDetail();
        //职位信息
        $this->param = array("id"=>$detail['pid']);
        $detail['job'] = $this->postDetail();
        $this->right = false;
        //标注信息
        $detail['remark'] = $this->getRemark($detail['rid'],$detail['cid']);

        //查询面试地址
        $detail['lng'] = '';
        $detail['lat'] = '';
        if(is_numeric($detail['place'])){
            $ret = $dsql->getArr($dsql::SetQuery("select `addrid`, `address`, `lng`, `lat` from `#@__job_address` where id = " . $detail['place']));
            if($ret){
                global $data;
                $data = "";
                $addrArr = getParentArr("site_area", $ret['addrid']);
                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                $detail['addr'] = $addrArr;

                $detail['place'] = $ret['address'];
                $detail['lng'] = $ret['lng'];
                $detail['lat'] = $ret['lat'];
            }else{                    
                $detail['place'] = '未知';
            }
        }

        return $detail;
    }

    /**
     * 投递初筛开关
    */
    public function deliveryFilter(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $filter = isset($param['filter']) ? (int)$param['filter'] : 0;
        $filter = $filter ? 1 : 0;
        $dsql->update($dsql::SetQuery("update `#@__job_company` set `delivery_filter`=$filter where `id`=$cid"));

        return array("state"=>100,"info"=>($filter ? "开启" : "关闭")."成功");
    }

    /**
     * 清空下载的简历
    */
    public function clearDownLoadResume(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        //下载的简历，已回绝、已失效
        $refuse = isset($param['refuse']) ? (int)$param['refuse'] : 0;
        $del = isset($param['del']) ? (int)$param['del'] : 0;
        $where = "";
        if($refuse){
            $where .= " or `id` in ( select * from (select dl.`id` from `#@__job_resume_download` dl left join `#@__job_delivery` d on dl.`did`=d.`id` where dl.`del`=0 and d.`state`=2) temp )";
        }
        if($del){
            $where .= " or `id` in ( select * from (select dl.`id` from `#@__job_resume_download` dl left join `#@__job_resume` r on dl.`rid`=r.`id` where dl.`del`=0 and (r.`del`=0 or r.`id` is null )) temp )";
        }
        //至少选择一种
        if(empty($refuse) && empty($del)){
            return array("state"=>200,"info"=>"参数异常");
        }
        $sql = $dsql::SetQuery("update `#@__job_resume_download` set `del`=1 where 1=1 ".$where);
        $dsql->update($sql);
        return array("state"=>200,"info"=>"数据删除成功");
    }

    /**
     * 清空投递信息【已回绝、已失效】
    */
    public function clearDelivery(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $where = "";
        //简历已删除
        $del = isset($param['del']) ? (int)$param['del'] : 0;
        if(!empty($del)){
            $where .= " or r.`del`=1 or r.`id` is null"; //用户已经删除了，或者数据被删除了。
        }
        //简历已回绝
        $unSuit = isset($param['unSuit']) ? (int)$param['unSuit']: 0 ;
        if(!empty($unSuit)){
            $where .= " or d.`state`=2";
        }
        //至少选择一种
        if(empty($unSuit) && empty($del)){
            return array("state"=>200,"info"=>"参数异常");
        }
        $sql = $dsql::SetQuery("update `#@__job_delivery` set `del`=1 where id in ( select * from( select d.`id` from `#@__job_delivery` d left join `#@__job_resume` r on d.`rid`=r.`id` where 1=1 and d.`del`=0".$where.")  temp)");
        $dsql->update($sql);

        return array("state"=>200,"info"=>"数据删除成功");
    }


    /**
     * 职位详情的处理记录
    */
    public function processRecord(){
        global $dsql;
        $param = $this->param;

        $rid = (int)$param['rid'];  //简历id
        $pid = (int)$param['pid'];  //1.前端是否指定了职位id
        if(empty($rid)){
            return array("state"=>200,"info"=>"缺少rid");
        }
        //简历信息
        $sql = $dsql::SetQuery("select `userid`,`job` from `#@__job_resume` where `id`=$rid");
        $resumeDetail = $dsql->getArr($sql);
        if(empty($resumeDetail)){
            return array("state"=>200,"info"=>"简历异常");
        }
        $uid = $resumeDetail['userid'];
        //当前登录公司id
        $cuid = $this->getUid();
        $cid = $this->getCid();
        if(is_array($cid)){  //校验公司信息
            return $cid;
        }
        //2.如果不存在pid，则尝试取最后投递、面试的一个pid【比较谁的时间更迟】
        $hasDelivery = array();
        if(empty($pid)){
            //2.尝试取最后一次该用户的投递记录【无论职位】
            $sql = $dsql::SetQuery("select `pid`,`date` from `#@__job_delivery` where `cid`=$cid and `userid`=$uid order by `date` desc limit 1");
            $lastPost = $dsql->getArr($sql);
            if($lastPost){
                $hasDelivery = $lastPost;
            }
        }
        //尝试获取面试职位
        $hasInvitation = array();
        if(empty($pid)){
            //2.尝试取最后一次该用户的面试记录【无论职位】
            $sql = $dsql::SetQuery("select `pid`,`pubdate` from `#@__job_invitation` where `cid`=$cid and `userid`=$uid order by `date` desc limit 1");
            $lastInvitation = $dsql->getArr($sql);
            if($lastInvitation){
                $hasInvitation = $lastInvitation;
            }
        }
        if($hasDelivery && $hasInvitation){
            if($hasDelivery['date']>$hasInvitation['pubdate']){
                $pid = $hasDelivery['pid'];
            }else{
                $pid = $hasInvitation['pid'];
            }
        }elseif($hasDelivery){
            $pid = $hasDelivery['pid'];
        }
        //如果有邀请面试记录，优先使用邀请面试中的职位ID，因为用户可以给同一个公司投递多个职位，如果邀请后，又投递了其他职位，这种情况下取消面试时，如果用了投递的职位ID，会导致取消异常
        if($hasInvitation){
            $pid = $hasInvitation['pid'];
        }
        //3.如果还不存在pid，尝试取该简历期望职位相同的职位
        if(empty($pid)){
            $expectJob = $resumeDetail['job'];
            if(!empty($expectJob)){
                $sql = $dsql::SetQuery("select `id` from `#@__job_post` where `company`=$cid and `off`=0 and `del`=0 and `type` in ($expectJob) order by `pubdate` desc limit 1");
                $lastPost = $dsql->getOne($sql);
                if($lastPost){
                    $pid = $lastPost;
                }
            }
        }
        //如果还是空的，没有相关信息需要处理，直接返回空
        if(empty($pid)){
            return array("state"=>200,"info"=>"暂无相关信息");
        }
        //获取职位信息
        $sql = $dsql::SetQuery("select p.`id`,p.`title`,c.`people`,c.`people_job` from `#@__job_post` p,`#@__job_company` c where p.`company`=c.`id` and p.`id`=$pid");
        $postDetail = $dsql->getArr($sql);
        if(empty($postDetail)){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        $return = array();  //返回的信息
        $noEmpty = false;
        //1.返回企业阅读阅读简历信息
        $sql = $dsql::SetQuery("select `first` from `#@__job_historyclick` where `module`='job' and `module2`='resumeDetail' and `aid`={$rid} and `fuid`=$cuid and `uid`=$uid");
        $firstReadResume = $dsql->getOne($sql);
        if($firstReadResume){
            $noEmpty = true;
            $return["read"] = array(
                'type'=>'read',
                'time'=>$firstReadResume,
            );
        }else{
            $return['read'] = array();
        }
        //2.用户阅读职位的时间，date是每次阅读都会更新的时间，first是最开始阅读的时间，根据实际情况调取
        $sql = $dsql::SetQuery("select `date` from `#@__job_historyclick` where `module`='job' and `module2`='postDetail' and `aid`=$pid and `uid`=$uid");
        $firstReadPost = $dsql->getOne($sql);
        if($firstReadPost){
            $noEmpty = true;
            $return["u_read"] = array(
                'type'=>"u_read",
                'time'=>$firstReadPost
            );
        }else{
            $return['u_read'] = array();
        }
        //2.1是否有简历备注【普通的备注，这个备注可以取消】
        $sql = $dsql::SetQuery("select `custom_unsuit`,`remark_resume`,`remark_resume_time`,`remark_type` from `#@__job_remark` where `cid`=$cid and `rid`=$rid and (`custom_unsuit` = 1 or (`remark_type` != 0 && `remark_type` != 1))");
        $remark = $dsql->getArr($sql);
        if($remark){
            $noEmpty = true;
            $return['remark'] = array(
                'type'=>'remark',
                'state'=>$remark['custom_unsuit'],
                'msg'=>$remark['remark_resume'],
                'time'=>$remark['remark_resume_time'],
                'remark_type'=>$remark['remark_type']
            );
        }else{
            $return['remark'] = array();
        }
        //3.是否有投递信息
        $sql = $dsql::SetQuery("select p.`title`,d.`date`,d.`id`,d.`state`,d.`refuse_msg`,d.`refuse_time` from `#@__job_delivery` d left join `#@__job_post` p on d.`pid`=p.`id` where d.`cid`=$cid and d.`pid`=$pid and d.`rid`={$rid} order by `id` desc limit 1");
        $delivery = $dsql->getArr($sql);
        if($delivery){
            $noEmpty = true;
            $return['delivery'] = array(
                "type"=>"delivery",
                "id"=>$delivery['id'],
                'time'=>$delivery['date'],
                'state'=>$delivery['state'],
                'refuse_time'=>$delivery['refuse_time'],
                'refuse_msg'=>$delivery['refuse_msg']
            );
        }else{
            $return['delivery'] = array();
        }
        //4.查看是否有面试信息
        $sql = $dsql::SetQuery("select `id`,`pubdate`,`state`,`rz_state`,`refuse_msg`,`refuse_author`,`refuse_time` from `#@__job_invitation` where `cid`=$cid and `pid`=$pid and `rid`={$rid} order by `id` desc limit 1");
        $invition = $dsql->getArr($sql);
        if($invition){
            $noEmpty = true;
            $return['invitation'] = array(
                'type'=>"invitation",
                'time'=>$invition['pubdate'],
                'id'=>$invition['id'],
                'state'=>$invition['state'],
                'rz_state'=>$invition['rz_state'],
                'refuse_author'=>$invition['refuse_author'],
                'refuse_time'=>$invition['refuse_time'],
                'refuse_msg'=>$invition['refuse_msg']
            );
        }else{
            $return['invitation'] = array();
        }
        //不为空
        if($noEmpty){
            $return['post'] = array(
                "id"=>$postDetail['id'],
                "title"=>$postDetail['title'],
                "company"=>array(
                    "people"=>$postDetail['people'],
                    "people_job"=>$postDetail['people_job'],
                )
            );
            return $return;
        }
        return array("state"=>200,"info"=>"暂无相关数据");
    }


    /**
     * 查询工商信息，仅获取当前登录企业的工商信息，如果获取信息为空，则远程获取【要钱】，
     * 如果该企业已经查询过工商信息或手动编辑过，直接返回该信息而不要付费查询
    */
    public function gongShangXinxi(){
       global $dsql;
       $cid = $this->getCid();
       if(is_array($cid)){
           return $cid;
       }
       $param = $this->param;
       $full_name = $param['full_name'];  //传递一个全称
       if(empty($full_name)){
           return array("state"=>200,"info"=>"请传递要查询的公司全称");
       }
       //检测是否已经有工商信息
       $sql = $dsql::SetQuery("select `full_name`,`enterprise_type`,`enterprise_establish`,`enterprise_money`,`enterprise_people`,`enterprise_code` from `#@__job_company` where `id`=$cid");
       $gsDetail = $dsql->getArr($sql);
        //没有信用代码【该值不可前端传递】，说明未成功过
        if(empty($gsDetail['enterprise_code'])){
            //根据全称查询数据
            $gs = getEnterpriseBusinessData($gsDetail['full_name']);
            //查询接口正常，并且返回了数据，保存数据并返回
            if(!empty($gs) && isset($gs['result']['creditCode']) && !empty($gs['result']['creditCode'])){
                $enterprise_type = $gs['result']['regType'];
                $enterprise_establish = strtotime($gs['result']['regDate']);
                $enterprise_people = $gs['result']['faRen'];
                $enterprise_money = $gs['result']['regMoney'];
                $enterprise_code = $gs['result']['creditCode'];
                //保存信用代码到数据库中
                $sql = $dsql::SetQuery("update `#@__job_company` set `full_name`='$full_name',`enterprise_type`='$enterprise_type',`enterprise_establish`='$enterprise_establish',`enterprise_money`='$enterprise_money',`enterprise_people`='$enterprise_people', `enterprise_code`='$enterprise_code' where `id`=$cid");
                $dsql->update($sql);
                $gsDetail = array(
                    'full_name'=>$full_name,
                    'enterprise_type'=>$enterprise_type,
                    'enterprise_establish'=>$enterprise_establish,
                    'enterprise_money'=>$enterprise_money,
                    'enterprise_people'=>$enterprise_people,
                    'enterprise_code'=>$enterprise_code,
                );
                return $gsDetail;
            }
            //查询失败了，返回错误提示
            else{
                //返回值是空的，非正常
                if(empty($gs) || !is_array($gs)){
                    return array("state"=>200,"info"=>"查询失败，请联系管理员");
                }
                //查询成功，是一个数组，但是没有返回信用代码，说明第三方接口返回的数据不是正常的数据，返回该错误
                else{
                    return array($gs);
                }
            }
        }
        //之前已经成功了，不允许再次查询【因为要付费】，直接返回该数据
        else{
            return $gsDetail;
        }
    }

    /**
     * 招聘首页pc求职身份数据
    */
    public function homePcQiuzhiData(){
        global $dsql;
        $userid = $this->getUid();
        //未登录
        if(is_array($userid)){
            return $userid;
        }
        $return = array();
        //职位投递记录统计
        $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `userid`=$userid");
        $return['deliveryCount'] = (int)$dsql->getOne($sql);
        //面试日程统计
        $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `userid`=$userid");
        $return['interviewCount'] = (int)$dsql->getOne($sql);
        //收藏量统计
        $sql = $dsql::SetQuery("select count(*) from `#@__member_collect` where `userid`=$userid and `module`='job'");
        $return['collectCount'] = (int)$dsql->getOne($sql);
        return $return;
    }

    /**
     * 获取海报模板
    */
    public function getPosterTemplate(){
        global $dsql;
        $param = $this->param;
        $type = $param['type'] ?? "";  //海报类型，默认无
        $where = "";
        if($type!=""){
            $where .= " and `type`='$type'";
        }
        $sql = $dsql::SetQuery("select `id`,`title`,`type`,`litpic` from `#@__poster_template` where `module`='job'".$where);
        $templates = $dsql->getArrList($sql);
        if(!is_array($templates)){
            return $templates;
        }
        foreach ($templates as & $item){
            $item['id'] = (int)$item['id'];
            $item['litpic'] = getFilePath($item['litpic']);
        }
        unset($item);
        return $templates;
    }


    /**
     * 获取用户登录信息
    */
    public function getMemberInfo(){
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $cid = $this->getCid();
        $cid = is_numeric($cid) ? $cid : 0;
        global $userLogin;
        $memberInfo = $userLogin->getMemberInfo();
        $memberInfo['job_id'] = $cid;
        return $memberInfo;
    }

    /**
     * 普通标记
    */
    public function customRemark(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $rid = $param['rid'];
        if(empty($rid)){
            return array("state"=>200,"info"=>"请传递rid");
        }
        $remark = $param['remark'] ?: '';
        $unsuit = $param['unsuit'] ?: 0;
        $type = $param['type'];
        $sql = $dsql::SetQuery("select `id` from `#@__job_remark` where `cid`=$cid and `rid`=$rid");
        $exist = $dsql->getOne($sql);
        $time = GetMkTime(time());
        if(empty($exist)){
            if($type!=""){
                $sql = $dsql::SetQuery("insert into `#@__job_remark`(`remark_resume`,`custom_unsuit`,`remark_resume_time`,`progress`,`rid`,`cid`,`remark_type`) values('$remark',$unsuit,$time,0,$rid,$cid,$type)");
            }else{
                $sql = $dsql::SetQuery("insert into `#@__job_remark`(`remark_resume`,`custom_unsuit`,`remark_resume_time`,`progress`,`rid`,`cid`) values('$remark',$unsuit,$time,0,$rid,$cid)");
            }
        }else{
            if($type!=""){
                $sql = $dsql::SetQuery("update `#@__job_remark` set `remark_resume`='$remark',`custom_unsuit`=$unsuit,`remark_resume_time`=$time,`remark_type`=$type where `id`=$exist");
            }else{
                $sql = $dsql::SetQuery("update `#@__job_remark` set `remark_resume`='$remark',`custom_unsuit`=$unsuit,`remark_resume_time`=$time where `id`=$exist");
            }
        }
        $dsql->update($sql);
        return "操作成功";
    }

    /**
     * 添加页面点击浏览记录
    */
    public function addClickHistory(){
        global $dsql;
        $param = $this->param;
        $aid = $param['aid'];
        $type = $param['type'];  //资源分类
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        if($type=="pg"){
            $sql = $dsql::SetQuery("select `userid` from `#@__job_pg` where `id`=$aid");
            $fuid = $dsql->getOne($sql);
        }
        elseif($type=="qz"){
            $sql = $dsql::SetQuery("select `userid` from `#@__job_qz` where `id`=$aid");
            $fuid = $dsql->getOne($sql);
        }
        if(empty($fuid)){
            return array("state"=>200,"info"=>"记录不存在");
        }
        if($uid == $fuid){
            return array("state"=>200,"info"=>"发布者本人不可添加记录");
        }
        $uphistoryarr = array(
            'module'    => "job",
            'uid'       => $uid,
            'aid'       => $aid,
            'fuid'      => $fuid,
            'module2'   => $type."Detail",
        );
        updateHistoryClick($uphistoryarr);
        return array("state"=>100,"info"=>"执行成功");
    }

    /**
     * 推荐添加职位
    */
    public function recommendAddJobType(){
        global $dsql;
        $param = $this->param;
        $title = $param['title'];
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        if(empty($title)){
            return array("state"=>200,"info"=>"title不能为空");
        }
        //取用户
        //添加到推荐表中
        $time = time();
        //判断该标题是否存在
        $sql = $dsql::SetQuery("select `id` from `#@__job_type_rec` where `title`='$title'");
        $exist = $dsql->getOne($sql);
        if($exist){
            return array("state"=>100,"info"=>"添加成功");
        }
        $sql = $dsql::SetQuery("insert into `#@__job_type_rec`(`uid`,`title`,`pubdate`) values($uid,'$title',$time)");
        $res = $dsql->update($sql);
        if($res=="ok"){
            return array("state"=>100,"info"=>"添加成功");
        }else{
            return array("state"=>200,"info"=>"添加失败");
        }
    }

    /**
     * 推荐添加普工职位
    */
    public function recommendAddPgJobType(){
        global $dsql;
        $param = $this->param;
        $title = $param['title'];
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        if(empty($title)){
            return array("state"=>200,"info"=>"title不能为空");
        }
        //取用户
        //添加到推荐表中
        $time = time();
        //判断该标题是否存在
        $sql = $dsql::SetQuery("select `id` from `#@__job_type_pg_rec` where `title`='$title'");
        $exist = $dsql->getOne($sql);
        if($exist){
            return array("state"=>100,"info"=>"添加成功");
        }
        $sql = $dsql::SetQuery("insert into `#@__job_type_pg_rec`(`uid`,`title`,`pubdate`) values($uid,'$title',$time)");
        $res = $dsql->update($sql);
        if($res=="ok"){
            return array("state"=>100,"info"=>"添加成功");
        }else{
            return array("state"=>200,"info"=>"添加失败");
        }
    }

    /**
     * 更新个性化主页
    */
    public function updatePersonalize(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $homePage = $param['homePage'];  //个性化主页
        if(empty($homePage)){
            return array("state"=>200,"info"=>"缺少参数：".$homePage);
        }
        if(is_array($homePage) || is_object($homePage)){
            $homePage = json_encode($homePage);
        }
        $sql = $dsql::SetQuery("update `#@__job_company` set `personalize`='$homePage' where `id`=$cid");
        $res = $dsql->update($sql);
        if($res=="ok"){
            return "保存成功";
        }else{
            return array("state"=>200,"info"=>"保存失败");
        }
    }

    /**
     * 更新消息通知
    */
    public function updateCompanyNotice(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $append = "";
        $args = array();
        if(isset($param['email'])){ //邮箱设置
            $args['email'] = $param['email'];
        }
        if(isset($param['sms_delivery'])){ //短信_投递简历通知
            $args['sms_delivery'] = (int)$param['sms_delivery'];
        }
        if(isset($param['sms_onlineNotice'])){ //短信_在线消息通知
            $args['sms_onlineNotice'] = (int)$param['sms_onlineNotice'];
        }
        if(isset($param['sms_interviewRefuse'])){ //短信_面试取消通知
            $args['sms_interviewRefuse'] = (int)$param['sms_interviewRefuse'];
        }
        if(isset($param['sms_fair'])){ //短信_招聘会通知
            $args['sms_fair'] = (int)$param['sms_fair'];
        }
        if(isset($param['email_delivery'])){ //邮件_投递简历通知
            $args['email_delivery'] = (int)$param['email_delivery'];
        }
        if(isset($param['email_fair'])){ //邮件_招聘会通知
            $args['email_fair'] = (int)$param['email_fair'];
        }
        if(isset($param['email_buyResume'])){ //邮件_购买简历发送
            $args['email_buyResume'] = (int)$param['email_buyResume'];
        }
        //校验和生成
        $sql = $dsql::SetQuery("update `#@__job_company` set ");
        $dbParamIndex = 1;
        $dbParamCount = count($args);
        if($dbParamCount==0){
            return array("state"=>200,"info"=>"缺少参数");
        }
        foreach ($args as $dbParamK => $dbParamV){
            $sql .= "`".$dbParamK."`=";
            if(is_string($dbParamV)){
                $dbParamV = addslashes($dbParamV);
                $sql .= "'$dbParamV'";
            }else{
                $sql .= strval($dbParamV);
            }
            if($dbParamIndex<$dbParamCount){
                $sql .= ",";
            }
            $dbParamIndex ++;
        }
        $sql .= " where `id`=$cid";
        $res = $dsql->update($sql);
        if($res=="ok"){
            return "保存成功";
        }else{
            return array("state"=>200,"info"=>"保存失败");
        }
    }


    /**
     * 更新投递限制
     */
    public function updateDeliveryLimit(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $delivery_smart = 0;  //是否智能处理
        $delivery_limit = $param['delivery_limit'];  // {"time":3,"account":"1,2"}
        if(is_string($delivery_limit)){
            $delivery_limit = json_decode($delivery_limit,true);
        }
        elseif(is_object($delivery_limit)){
            $delivery_limit = (array)$delivery_limit;
        }
        if(empty($delivery_limit)){
            return array("state"=>200,"info"=>"缺少参数：delivery_limit");
        }
        //校验格式
        if(!isset($delivery_limit['time'])){
            return array("state"=>200,"info"=>"缺少投递限制时间");
        }
        $delivery_limit_interval = (int)$delivery_limit['time'];
        if(!isset($delivery_limit['account'])){
            // return array("state"=>200,"info"=>"缺少delivery_limit.account");
        }
        $delivery_limit_account = $delivery_limit['account'];
        $delivery_limit_certifyState = 0;  //投递实名认证限制
        $delivery_limit_phoneCheck = 0;  //投递手机认证限制

        if(isset($delivery_limit_account)){
            if(in_array("1",$delivery_limit_account)){
                $delivery_limit_certifyState = 1;
                $delivery_smart = 1;
            }
            if(in_array("2",$delivery_limit_account)){
                $delivery_limit_phoneCheck = 1;
                $delivery_smart = 1;
            }
        }
        
        //投递自动拒绝设置
        $delivery_refuse = $param['delivery_refuse'];
        if(empty($delivery_refuse)){
            return array("state"=>200,"info"=>"缺少参数：delivery_refuse");
        }
        if(is_string($delivery_refuse)){
            $delivery_refuse = json_decode($delivery_refuse,true);
        }elseif(is_object($delivery_refuse)){
            $delivery_refuse = (array)$delivery_refuse;
        }
        //判断是否智能处理
        if($delivery_refuse['salary']!=-1 || $delivery_refuse['experience']!=-1 || $delivery_refuse['education']!=-1 || $delivery_refuse['min_age']!=-1 || $delivery_refuse['max_age']!=-1 || $delivery_refuse['complete']!=-1){
            $delivery_smart = 1;
        }
        $delivery_refuse = json_encode($delivery_refuse);
        $sql = $dsql::SetQuery("update `#@__job_company` set `delivery_limit_interval`=$delivery_limit_interval,`delivery_limit_certifyState`=$delivery_limit_certifyState,`delivery_limit_phoneCheck`=$delivery_limit_phoneCheck,`delivery_refuse`='$delivery_refuse',`delivery_smart`=$delivery_smart where `id`=$cid");
        $res = $dsql->update($sql);
        if($res=="ok"){
            clearCache("job_company_detail", $cid);
            return "保存成功";
        }else{
            return array("state"=>200,"info"=>"保存失败");
        }
    }


    /**
     * 资讯信息详细
     * @return array
     */
    public function newsDetail()
    {
        global $dsql;
        $newsDetail = array();
        $id         = $this->param;
        $id         = is_numeric($id) ? $id : $id['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__job_news` WHERE `arcrank` = 0 AND `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("job_news_detail", $archives, 0, $id);
        if ($results) {
            $newsDetail["id"]     = $results[0]['id'];
            $newsDetail["title"]  = $results[0]['title'];
            $newsDetail["typeid"] = $results[0]['typeid'];
            $newsDetail["cityid"] = $results[0]['cityid'];

            $typename = "";
            $sql      = $dsql->SetQuery("SELECT `typename` FROM `#@__job_newstype` WHERE `id` = " . $results[0]['typeid']);
            // $ret      = $dsql->dsqlOper($sql, "results");
            $typename = getCache("job_newstype", $sql, 0, array("name" => "typename", "sign" => $results[0]['typeid']));
            $newsDetail['typename'] = $typename;

            $newsDetail["litpic"]      = $results[0]['litpic'] ? getFilePath($results[0]['litpic']) : "";
            $newsDetail["click"]       = $results[0]['click'];
            $newsDetail["source"]      = $results[0]['source'];
            $newsDetail["sourceUrl"]   = $results[0]['sourceUrl'];
            $newsDetail["writer"]      = $results[0]['writer'];
            $newsDetail["keyword"]     = $results[0]['keyword'];
            $newsDetail["description"] = $results[0]['description'];
            $newsDetail["body"]        = $results[0]['body'];
            $newsDetail["pubdate"]     = $results[0]['pubdate'];
            $param             = array(
                "service" => "job",
                "template" => "news-detail",
                "id" => $newsDetail["id"]
            );
            $newsDetail["url"] = getUrlPath($param);

            //上一篇
            $sql = $dsql::SetQuery("select `id`,`title` from `#@__job_news` where `id`<{$newsDetail["id"]} limit 1");
            $prevDetail = $dsql->getArr($sql);
            if($prevDetail){
                $prevDetail['id'] = (int)$prevDetail['id'];
                $param             = array(
                    "service" => "job",
                    "template" => "news-detail",
                    "id" => $prevDetail['id']
                );
                $prevDetail["url"] = getUrlPath($param);
            }
            $newsDetail['prev'] = (object)$prevDetail;
            //下一篇
            $sql = $dsql::SetQuery("select `id`,`title` from `#@__job_news` where `id`>{$newsDetail["id"]} limit 1");
            $nextDetail = $dsql->getArr($sql);
            if($nextDetail){
                $nextDetail['id'] = (int)$nextDetail['id'];
                $param             = array(
                    "service" => "job",
                    "template" => "news-detail",
                    "id" => $nextDetail['id']
                );
                $nextDetail["url"] = getUrlPath($param);
            }
            $newsDetail['next'] = (object)$nextDetail;

            //更新浏览次数
            $sql = $dsql->SetQuery("UPDATE `#@__job_news` SET `click` = `click` + 1 WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "results");

            //记录足迹
            global $userLogin;
            $uid = $userLogin->getMemberID();
            if($uid >0) {
                $uphistoryarr = array(
                    'module'    => 'job',
                    'uid'       => $uid,
                    'aid'       => $id,
                    'fuid'      => '',
                    'module2'   => 'newsDetail',
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }
        }
        return $newsDetail;
    }

    /**
     * 招聘资讯
     * @return array
     */
    public function news()
    {
        global $dsql;
        $pageinfo = $list = array();
        $typeid   = $orderby = $title = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid   = $this->param['typeid'];
                $orderby  = $this->param['orderby'];
                $title    = $this->param['skeyWord'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $hasPicture = $this->param['hasPicture'];
            }
        }

        //数据共享
        require(HUONIAOINC."/config/job.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //遍历分类
        if (!empty($typeid)) {
            $type = $dsql->getTypeList($typeid, "job_newstype");
            if ($type) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($type);
                $lower[] = $typeid;
                $lower = join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        //关键字
        if (!empty($title)) {
            $where .= " AND `title` like '%" . $title . "%'";
        }

        //有图
        if(!empty($hasPicture)){
            $where .= " AND `litpic` != ''";
        }

        //当天
        $todayk = strtotime(date('Y-m-d'));

        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));

        //昨天时间戳
        $time1 = strtotime(date('Y-m-d 00:00:00',time()-3600*24));
        $time2 = strtotime(date('Y-m-d 23:59:59',time()-3600*24));

        //本周时间戳
        $time3 = mktime(0,0,0,date('m'),date('d')-date('N')+1,date('y'));
        $time4 = mktime(23,59,59,date('m'),date('d')-date('N')+7,date('Y'));

        $BeginDate = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
        $overDate  = date('Y-m-d', strtotime("$BeginDate +1 month"));//本月最后一天
        $btime     = strtotime($BeginDate);
        $ovtime    = strtotime($overDate);


        $by = " ORDER BY `weight` DESC, `pubdate` DESC";

        //按点击排行
        if ($orderby == 1) {
            $by = " ORDER BY `click` DESC, `weight` DESC, `pubdate` DESC";

            //今日浏览量
        } elseif ($orderby == 2) {
            $by = " AND `pubdate` > $todayk AND `pubdate` < $todaye  ORDER BY `click` DESC, `weight` DESC, `pubdate` DESC";

            //本周浏览量
        } elseif ($orderby == 3) {
            $by = " AND `pubdate` > $time3 AND `pubdate` < $time4  ORDER BY `click` DESC, `weight` DESC, `pubdate` DESC";

            //本月浏览量
        } elseif ($orderby == 4) {
            $by = " AND `pubdate` > $btime AND `pubdate` < $ovtime ORDER BY `click` DESC, `weight` DESC, `pubdate` DESC";
        }
        //发布时间倒序
        elseif ($orderby == 5){
            $by = " ORDER BY `pubdate` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `recommand`, `title`, `typeid`, `litpic`, `click`, `description`, `pubdate`, `body` FROM `#@__job_news` WHERE `arcrank` = 0" . $where . $by);
        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_news` WHERE `arcrank` = 0" . $where . $by);
        $totalCount = getCache("job_news_total", $arc, 86400, array("name" => "total", "savekey" => true));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $list    = array();
        // $results = $dsql->dsqlOper($archives . $where, "results");
        $results = getCache("job_news_list", $archives.$where, 86400);
        if ($results) {
            foreach ($results as $key => $value) {
                $list[$key]['id']     = (int)$value['id'];
                $list[$key]['title']  = $value['title'];
                $list[$key]['typeid'] = (int)$value['typeid'];
                $list[$key]['litpic'] = $value['litpic'];
                $list[$key]['recommand'] = (int)$value['recommand'];
                $maxLength = 150;
                $body = strip_tags(str_replace(array("&nbsp;","&amp;nbsp;","\t","\r\n","\r","\n"),"",$value['body']));
                $length = mb_strlen($body);  //去标签后的内容长度
                $body = mb_substr($body,0,$maxLength);
                if($length>$maxLength){
                    $body .= "...";
                }
                $list[$key]['body'] = $body;
                $list[$key]['litpic'] = !empty($value['litpic']) ? getFilePath($value['litpic']) : "";

                $typename = "";
                $sql      = $dsql->SetQuery("SELECT `typename` FROM `#@__job_newstype` WHERE `id` = " . $value['typeid']);
                // $ret      = $dsql->dsqlOper($sql, "results");
                $typename = getCache("job_newstype", $sql, 0, array("name" => "typename", "sign" => $value['typeid']));
                $list[$key]['typename'] = $typename;

                $list[$key]['click']       = $value['click'];
                $list[$key]['description'] = $value['description'];
                $list[$key]['pubdate']     = $value['pubdate'];
                $list[$key]["date"]        = date('Y-m-d H:i:s', $value["pubdate"]);
                $list[$key]["date_b"]      = FloorTime(time()-$value["pubdate"]);

                $param             = array(
                    "service" => "job",
                    "template" => "news-detail",
                    "id" => $value['id']
                );
                $list[$key]["url"] = getUrlPath($param);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }



    /**
     * 资讯分类
     * @return array
     */
    public function newsType()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "job_newstype", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }


    /**
     * 参加招聘会
     */
    public function joinFairs(){
        global $dsql;

        //获取 company
        $cid = $this->getCidCheck();

        if(is_array($cid) && $cid['state'] == 200 && $cid['info'] == '店铺还在审核中'){
            return array("state"=>200,"info"=>"您的企业资料还未审核通过，暂时不能报名参加招聘会，请等待审核通过后再报名！");
        }

        $param = $this->param;

        $fid = $param['fid'];
        if(empty($fid)){
            return array("state"=>200,"info"=>"缺少参数：fid");
        }
        //根据fid，查询招聘会信息
        $sql = $dsql::SetQuery("select * from `#@__job_fairs` where `id`=$fid");
        $fairDetail = $dsql->getArr($sql);
        if(empty($fairDetail) || !is_array($fairDetail)){
            return array("state"=>200,"info"=>"招聘会不存在");
        }
        $time = time();
        //校验时间，如果已经结束
        if($fairDetail['enddate']<$time){
            return array("state"=>200,"info"=>"招聘会已结束");
        }
        $company = $param['company'];
        $phone = $param['phone'];
        $vercode  = $param['vercode'];
        $hasData = 1;
        //如果已经登录company，根据 cid ，获取企业名称，联系电话
        if(!is_array($cid) && !$company && !$phone){
            $sql = $dsql::SetQuery("select `title`,`contact` from `#@__job_company` where `id`=$cid");
            $store = $dsql->getArr($sql);
            $company = $store['title'];
            $phone = $store['contact'];
            $hasData = 0;
        }
        if(is_numeric($cid) && $company && $phone){
            $hasData = 0;
        }
        //线下招聘会
        if($fairDetail['type']==1){
            //未登录
            // if(is_array($cid)){
                //校验名称
                if(empty($company)){
                    return array("state"=>200,"info"=>"请输入企业名称");
                }
                
                if((is_array($cid) || $hasData) && $vercode){
                    //校验短信验证码
                    $ip = GetIP();
                    if(!$vercode){
                        return array("state"=>200,"info"=>"请输入验证码");
                    }
                    $msgId = 0;
                    $sql_code = $dsql->SetQuery("SELECT `id`, `code` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$phone' ORDER BY `id` DESC LIMIT 1");
                    $res_code = $dsql->dsqlOper($sql_code, "results");
                    if (strtolower($vercode) != $res_code[0]['code']) {
                        return array ('state' => 200, 'info' => "验证码输入错误，请重试！");
                    }
                    $msgId = $res_code[0]['id'];
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $msgId");
                    $dsql->dsqlOper($sql, "update");
                }
            // }
        }
        //如果是网络招聘会，检测当前上架职位数量
        elseif($fairDetail['type']==2){
            if(is_array($cid)){
                return array("state"=>200,"info"=>"请登录");
            }
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_post` WHERE `state` = 1 and `off`=0 and `del`=0 AND (`valid` = 0 OR `valid` > " . time() . " OR `long_valid` = 1) AND `company` = " . $cid);
            $pcount = (int)$dsql->getOne($sql);

            $jobConfig = $this->config();
            $fair_join_jobs = (int)$jobConfig['fair_join_jobs'];

            if($pcount<$fair_join_jobs){
                return array("state"=>200,"info"=>"至少上架".$fair_join_jobs."条招聘职位才可报名");
            }
        }
        //校验是否重复报名（同一个手机号码，同一个招聘会，多次报名不会重复插入记录)
        $sql = $dsql->SetQuery("select count(*) from `#@__job_fairs_join` where `cid`=$cid and `fid`=$fid");
        $is_join = (int)$dsql->getOne($sql);
        //如果确实没报名，添加报名信息
        if(!$is_join){
            $config = $this->config();
            $FairsJoinState = $config['jobFairJoinState'];
            $sql = $dsql::SetQuery("insert into `#@__job_fairs_join`(`fid`,`cid`,`company`,`phone`,`pubdate`,`state`) values($fid,$cid,'$company','$phone',$time,$FairsJoinState)");
            $dsql->update($sql);
            //刷新招聘会地区列表和职位分类列表
            $this->param = array("fid"=>$fid);
            $this->fairsFixAddrTypes();
            return "报名成功";
        }else{
            return array ('state' => 200, 'info' => "您已报名，无须重复提交！");
        }
    }

    /**
     * 招聘会参会企业、职位信息。（网络）
     */
    public function fairsJoinCJ_job(){
        global $dsql;
        $param = $this->param;
        $fid = $param['fid'];
        if(empty($fid)){
            return array("state"=>200,"info"=>"缺少招聘会id，参数名：fid");
        }
        //从fid找出符合的cid
        $cids = $dsql->getArr($dsql::SetQuery("select `cid` from `#@__job_fairs_join` where `fid`=$fid and `state`=1"));
        $cids = join(",",$cids);
        if(empty($cids)){
            $cids = "-1";
        }
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 30;
        //地区筛选
        $addrid = $param['addrid'];
        $where = " AND c.`id` in($cids)";

        if ($addrid != "") {
            if ($dsql->getTypeList($addrid, "site_area")) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower = $addrid . "," . join(',', $lower);
            } else {
                $lower = $addrid;
            }

            $where .= " AND a.`addrid` in (" . $lower . ")";

        }

        // if($addrid){
        //     $where .= " AND a.`addrid`=$addrid";
        // }
        //职位筛选
        $type = $param['type'];
        if($type){
            $where .= " AND p.`type`=$type";
        }
        //关键字筛选
        $keyword = $param['keyword'];
        if($keyword){
            $where .= " AND p.`title` like '%$keyword%'";
        }
        //列表信息和基本的信息差不多
        $sql = $dsql::SetQuery("select p.`id`,p.`title`,p.`min_salary`,p.`max_salary`,p.`salary_type`,p.`dy_salary`,p.`mianyi`,p.`educational`,p.`experience`,p.`nature`,p.`job_addr`,c.`addrid` 'c_addrid',a.`addrid` 'a_addrid',c.`title` 'ctitle' from `#@__job_post` p LEFT JOIN `#@__job_company` c ON c.`id`=p.`company` LEFT JOIN `#@__job_address` a ON a.`id`=p.`job_addr` where p.`state`=1 and p.`del`=0 and p.`off`=0$where");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        foreach ($pageObj['list'] as & $item){
            $item['min_salary'] = $item['min_salary']==0 ? 0 : $item['min_salary'];
            $item['max_salary'] = $item['max_salary']==0 ? 0 : $item['max_salary'];
            $min_salary = $item['min_salary'];
            $max_salary = $item['max_salary'];
            $item['show_salary'] = salaryFormat($item['salary_type'], $min_salary, $max_salary, $item['mianyi']);
            $item['dy_salary'] = (int)$item['dy_salary'];
            $item['mianyi'] = (int)$item['mianyi'];
            $item['educational'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$item['educational']));
            $experienceName = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$item['experience']));
            $testRes = $this->testExperience($experienceName);
            $item['experience'] = $testRes['text'];
            $item['nature'] = $dsql->getOne($dsql::SetQuery("select `zh` from `#@__job_int_static_dict` where `name`='jobNature' and `value`='".$item['nature']."'"));
            //公司地址？
            $addrid = 0;
            if($item['job_addr']==-1){
                $addrid = $item['c_addrid'];
            }
            else{
                $addrid = $item['a_addrid'];
            }
            unset($item['job_addr']);
            unset($item['c_addrid']);
            unset($item['a_addrid']);
            $item['addrid'] = (int)$addrid;
            $addrInfo = $this->getAddr_list($item['addrid']);
            $item['addr_list'] = $addrInfo['addr_list'];
            $item['addr_list_Name'] = $addrInfo['addr_list_Name'];
            $urlParam = array(
                "service" => "job",
                "template" => "job",
                "id" => $item['id']
            );
            $item["url"] = getUrlPath($urlParam);
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 辅助函数，通过 addrid ，获取父级id和列表
     */
    private function getAddr_list($addrid){

        $addrName = getParentArr("site_area", $addrid);
        $return = array();
        global $data;
        $data                 = "";
        $addrNames             = array_reverse(parent_foreach($addrName, "typename"));
        $return['addr_list_Name'] = $addrNames;
        // 区域id
        $data = "";
        $addrid = array_reverse(parent_foreach($addrName, "id"));
        $addrid = join(",",$addrid);
        $addrid = json_decode("[".$addrid."]",true);
        $return['addr_list'] = $addrid;
        return $return;
    }

    /**
     * 招聘会参会企业、公司信息。（网络）
     */
    public function fairsJoinCJ_company(){
        global $dsql;
        $param = $this->param;
        $fid = $param['fid'];
        $jobs = $param['jobs'] ?: 2;
        if(empty($fid)){
            return array("state"=>200,"info"=>"缺少招聘会id，参数名：fid");
        }
        //从fid找出符合的cid
        $cids = $dsql->getArr($dsql::SetQuery("select `cid` from `#@__job_fairs_join` where `fid`=$fid and `state`=1 order by `pubdate` desc"));
        $cids = join(",",$cids);
        if(empty($cids)){
            $cids = "-1";
        }
        $page = (int)$param['page'] ?: 1;
        $pageSize = (int)$param['pageSize'] ?: 30;
        //关键字筛选
        $keyword = $param['keyword'];
        $where = " AND c.`id` in($cids)";
        if($keyword){
            $where .= " AND (c.`title` like '%$keyword%' OR p.`title` like '%$keyword%')";
        }
        //公司地区筛选
        $addrid = $param['addrid'];
        if($addrid!="" && $addrid != 0){
            $addrids = explode(",",$addrid);
            //多个直接 in
            if(count($addrids)>1){
                $where .= " and `addrid` in ($addrid)";
            }
            //单个，可以遍历子级
            else{
                if($dsql->getTypeList($addrid, "site_area")){
                    global $arr_data;
                    $arr_data = array();
                    $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));  //该项子id列表
                    $lower[] = $addrid;
                    $lower = join(",",$lower);
                }else{
                    $lower = $addrid;
                }
                $where .= " and `addrid` in ($lower)";
            }
        }
        //职位薪资筛选
        $_min_salary = (float)$param['min_salary'];
        $_max_salary = (float)$param['max_salary'];
        $time = GetMkTime(time());
        //先查找公司信息、然后找出两条职位信息
        if($keyword){
            $sql = $dsql::SetQuery("select c.`id`,c.`title`,c.`logo`,c.`userid`,c.`industry`,c.`scale`,c.`famous`,c.`nature` from `#@__job_company` c LEFT JOIN `#@__job_post` p ON p.`company` = c.`id` where p.`del` = 0 and p.`off` = 0 and (p.`valid`=0 OR p.`valid`>$time OR p.`long_valid` = 1) $where GROUP BY c.`id` ORDER BY FIELD(c.`id`, $cids)");
        }else{
            $sql = $dsql::SetQuery("select c.`id`,c.`title`,c.`logo`,c.`userid`,c.`industry`,c.`scale`,c.`famous`,c.`nature` from `#@__job_company` c where 1=1$where ORDER BY FIELD(c.`id`, $cids)");
        }
        $pageObj = $dsql->getPage($page,$pageSize,$sql);

        //搜索关键字没有数据时，只搜索公司名称再查询一次
        if($keyword && $pageObj['pageInfo']['totalCount'] == 0){
            $sql = $dsql::SetQuery("select c.`id`,c.`title`,c.`logo`,c.`userid`,c.`industry`,c.`scale`,c.`famous`,c.`nature` from `#@__job_company` c LEFT JOIN `#@__job_post` p ON p.`company` = c.`id` where 1 = 1 $where GROUP BY c.`id` ORDER BY FIELD(c.`id`, $cids)");
            $pageObj = $dsql->getPage($page,$pageSize,$sql);
        }

        foreach ($pageObj['list'] as $ii => & $item){
            $item['id'] = (int)$item['id'];
            $item['userid'] = (int)$item['userid'];
            $item['famous'] = (int)$item['famous'];
            $item['nature'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$item['nature']));
            $item['logo'] = getFilePath($item['logo']);
            $item['industry'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".$item['industry']));
            $item['scale'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$item['scale']));
            //url
            $item['url'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$item["id"]
            ));
            //统计在招职位个数
            $item['pcount'] = $dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_post` where `company`={$item['id']} and `state`=1 and `del`=0 and `off`=0 and (`valid`=0 OR `valid`>$time OR `long_valid` = 1)"));
            //获取两个在招职位
            $plist = array();
            $whereJob = "";
            if ($_min_salary!="") {
                $whereJob .= " AND `mianyi` = 0 AND `min_salary` >= " . $_min_salary;
            }
            if ($_max_salary!="") {
                $whereJob .= " AND `mianyi` = 0 AND `max_salary` <= " . $_max_salary;
            }

            //如果传了搜索关键字，这里优先搜索相关的职位，如果没有找到，再查询所有的职位
            if($keyword){
                $sql = $dsql::SetQuery("select `id`,`title`,`min_salary`,`max_salary`,`salary_type`,`dy_salary`,`mianyi` from `#@__job_post` where `company`={$item['id']} and `del`=0 and `off`=0 and `title` like '%$keyword%' $whereJob limit $jobs");
                $hasPost = $dsql->getArrList($sql);
                foreach ($hasPost as & $post){
                    $post['min_salary'] = $post['min_salary']==0 ? 0 : $post['min_salary'];
                    $post['max_salary'] = $post['max_salary']==0 ? 0 : $post['max_salary'];
                    $min_salary = $post['min_salary'];
                    $max_salary = $post['max_salary'];
                    $post['show_salary'] = salaryFormat($post['salary_type'], $min_salary, $max_salary, $post['mianyi']);
                    $post['dy_salary'] = (int)$post['dy_salary'];
                    $post['mianyi'] = (int)$post['mianyi'];
                    $urlParam = array(
                        "service" => "job",
                        "template" => "job",
                        "id" => $post['id']
                    );
                    $post["url"] = getUrlPath($urlParam);
                    array_push($plist,$post);
                }
                unset($post);
            }

            if(!$plist){
                $sql = $dsql::SetQuery("select `id`,`title`,`min_salary`,`max_salary`,`salary_type`,`dy_salary`,`mianyi` from `#@__job_post` where `company`={$item['id']} and `del`=0 and `off`=0 $whereJob limit $jobs");
                $hasPost = $dsql->getArrList($sql);
                foreach ($hasPost as & $post){
                    $post['min_salary'] = $post['min_salary']==0 ? 0 : $post['min_salary'];
                    $post['max_salary'] = $post['max_salary']==0 ? 0 : $post['max_salary'];
                    $min_salary = $post['min_salary'];
                    $max_salary = $post['max_salary'];
                    $post['show_salary'] = salaryFormat($post['salary_type'], $min_salary, $max_salary, $post['mianyi']);
                    $post['dy_salary'] = (int)$post['dy_salary'];
                    $post['mianyi'] = (int)$post['mianyi'];
                    $urlParam = array(
                        "service" => "job",
                        "template" => "job",
                        "id" => $post['id']
                    );
                    $post["url"] = getUrlPath($urlParam);
                    array_push($plist,$post);
                }
                unset($post);
            }
            
            $item['plist'] = $plist;
            if(empty($plist)){
                // unset($pageObj['list'][$ii]);
            }
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 招聘会参会企业、职位信息。（现场）
     */
    public function fairsJoinCJ_xc(){
        global $dsql;
        $param = $this->param;
        $fid = (int)$param['fid'];
        if(empty($fid)){
            return array("state"=>200,"info"=>"缺少招聘会id，参数名：fid");
        }
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 10000;
        $keyword = $param['keyword'];
        $where = " AND `fid`=$fid AND `jobs`!='' AND `seat`!=''";  // jobs 不为空，且已经分配了展位号，否则不显示
        if($keyword){
            $where .= " AND (`jobs` like '%$keyword%' OR `company` like '%$keyword%')";
        }
        $sql = $dsql::SetQuery("select `company`,`jobs`,`seat` from `#@__job_fairs_join` where 1=1 $where order by `id` desc");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        foreach ($pageObj['list'] as & $item){
            $item['jobs'] = json_decode($item['jobs'],true);
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 招聘会更新区域和分类
     */
    public function fairsFixAddrTypes(){
        global $dsql;
        $param = $this->param;
        $fid = $param['fid'];
        if(empty($fid)){
            return array("缺少参数fid");
        }
        //提取招聘会所有地区
        $sql = $dsql::SetQuery("select j.`addrid` from `#@__job_post` p LEFT JOIN `#@__job_address` j ON p.`job_addr`=j.`id` where p.`company` in (select `cid` from `#@__job_fairs_join` where `fid`=$fid and `state`=1)");
        $addrs = $dsql->getArr($sql);
        $addrs = array_unique($addrs);
        $addrs = array_filter($addrs);
        $sql = $dsql::SetQuery("update `#@__job_fairs` set `job_addrs`='".join(",",$addrs)."' where `id`=$fid");
        $dsql->update($sql);
        //提取招聘会职位分类
        $sql = $dsql::SetQuery("select p.`type` from `#@__job_post` p where p.`company` in (select `cid` from `#@__job_fairs_join` where `fid`=$fid and `state`=1)");
        $types = $dsql->getArr($sql);
        $types = array_unique($types);
        $types = array_filter($types);
        $sql = $dsql::SetQuery("update `#@__job_fairs` set `job_types`='".join(",",$types)."' where `id`=$fid");
        $dsql->update($sql);
        return array("addrs"=>$addrs,"types"=>$types);
    }



    /**
     * 招聘会详细信息
     * @return array
     */
    public function fairsDetail()
    {
        global $dsql;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__job_fairs` WHERE `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("job_fairs_detail", $archives, 864000, $id);
        if ($results) {

            $this->param         = $results[0]['fid'];
            $fairsCenterDetail   = $this->fairsCenterDetail();
            $results[0]['fairs'] = $fairsCenterDetail;
            //判断状态
            $time = time();
            if($time<$results[0]['startdate']){
                $stating = 0;  // 即将开始
            }
            elseif($time>$results[0]['enddate']){ //已结束
                $stating = 2;
            }
            else{ //进行中
                $stating = 1;
            }
            $results[0]['stating'] = $stating;
            $oid = $results[0]['oid'];
            $oid = explode(",",$oid);
            foreach ($oid as $oid_i){
                $this->param         = $oid_i;
                $fairsCenterDetail   = $this->fairsOrganizerDetail();
                $results[0]['organizer'][] = $fairsCenterDetail;
            }
            $results[0]['organizer'] = $results[0]['organizer'] ?: array();
            $results[0]['head_img'] = getFilePath($results[0]['head_img']);
            $pics = $results[0]['picture'];
            $picsArr = array();
            if (!empty($pics)) {
                $pics = explode("###", $pics);
                foreach ($pics as $key => $value) {
                    $v = explode("||", $value);
                    array_push($picsArr, array("pic" => getFilePath($v[0]), "title" => $v[1]));
                }
            }
            $results[0]['picture'] = $picsArr;

            if($results[0]['type']==2){
                $sql = $dsql::SetQuery("select j.`cid` from `#@__job_fairs` f inner JOIN `#@__job_fairs_join` j ON j.`fid`=f.`id` where f.`id`=$id and j.`state`=1 and f.`type`=2");
                $cids = $dsql->getArr($sql) ?: array();
                //参与公司的数量
                $results[0]['company_count'] = count($cids);
                //统计这些商家的在招职位
                if($cids){
                    $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where state=1 and del=0 and off=0 and company in (".join(",",$cids).")");
                    $jobs_count = (int)$dsql->getOne($sql);
                }else{
                    $jobs_count = 0;
                }
                $results[0]['jobs_count'] = $jobs_count;
                //统计招收的人数
                if($cids){
                    $sql = $dsql::SetQuery("select sum(number) from `#@__job_post` where state=1 and del=0 and off=0 and company in (".join(",",$cids).")");
                    $zhao_count = (int)$dsql->getOne($sql);
                }else{
                    $zhao_count = 0;
                }
                $results[0]['zhao_count'] = $zhao_count;
                //投递的简历数
                if($cids){
                    $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `date`>{$results[0]['startdate']} and `date`<{$results[0]['enddate']} and cid in (".join(",",$cids).")");
                    $resume_count = (int)$dsql->getOne($sql);
                }else{
                    $resume_count = 0;
                }
                $results[0]['resume_count'] = $resume_count;
                //用户点击记录，取5条
                $viewLogs = array();
                //取出所有的参会公司
                $sql = $dsql::SetQuery("select `cid` from `#@__job_fairs_join` where `fid`=$id and `state`=1");
                $cids = $dsql->getArr($sql);
                //取出所有的职位
                if($cids){
                    $sql  = $dsql::SetQuery("select `id` from `#@__job_post` where `company` in (".join(",",$cids).") and `off`=0 and `del`=0");
                    $jids = $dsql->getArr($sql);
                    //取出所有符合的浏览记录
                    if($jids){
                        $sql = $dsql::SetQuery("select `uid`,`date`,`aid` from `#@__job_historyclick` where module='job' and module2='postDetail' and `date`>{$results[0]['startdate']} and `date`<{$results[0]['enddate']} and `aid` in (".join(",",$jids).") order by `date` desc limit 5");
                        $views = $dsql->getArrList($sql);
                        //如果存在浏览记录 [nickname 、 时间(Floortime) 、 公司名称]
                        if($views){
                            foreach ($views as $view_item){
                                $sql = $dsql::SetQuery("select c.`title`,m.`nickname` from `#@__job_post` p left join `#@__job_company` c on p.`company`=c.`id` left join `#@__member` m on m.`id`={$view_item['uid']}  where p.`id`=".$view_item['aid']);
                                $view_item_res = $dsql->getArr($sql);
                                //获取用户头像
                                $sql = $dsql::SetQuery("select `photo` from `#@__member` where `id`={$view_item['uid']}");
                                $userPhoto = $dsql->getOne($sql);
                                //计算时间
                                $viewLogs[] = array(
                                    "nickname" => $view_item_res['nickname'],
                                    "company" => $view_item_res['title'],
                                    "time" => FloorTime(time()-$view_item['date']),
                                    "photo" =>getFilePath($userPhoto)
                                );
                            }
                        }
                    }
                }
                $results[0]['view_logs'] = $viewLogs;
                //地区列表
                $results[0]['addr_list'] = json_decode("[".$results[0]['job_addrs']."]",true);
                $addr_list_name = array();
                foreach ($results[0]['addr_list'] as $item){
                    array_push($addr_list_name,$dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`=$item")));
                }
                $results[0]['addr_list_name'] = $addr_list_name;
                //分类列表
                $results[0]['job_types'] = $results[0]['job_types'] ? json_decode("[".$results[0]['job_types']."]",true) : array();
                $job_types_name = array();
                foreach ($results[0]['job_types'] as $item){
                    array_push($job_types_name,$dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_type` where `id`=$item")));
                }
                $results[0]['job_types_name'] = $job_types_name;
            }

            //简介，从内容中提取前100个无格式的字
            $results[0]['description'] = cn_substrR(strip_tags($results[0]['note']), 100);

            $join_img = $results[0]['join_img'];

            //将附件地址转为真实地址
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

            preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $join_img, $fileList);
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
                    $join_img = str_replace($file_source, $file_turl, $join_img);
                }
            }

            $results[0]['join_img'] = $join_img;

            //查询当前登录账号是否参加了此招聘会
            $is_join = 0;
            $join_data = array();
            $cid = $this->getCid();
            if(is_numeric($cid)){
                $sql = $dsql::SetQuery("select `id`, `company`, `pubdate` from `#@__job_fairs_join` where `fid`=$id and `cid`=$cid");
                $cids = $dsql->getArr($sql) ?: array();
                if($cids){
                    $is_join = 1;
                    $join_data = array(
                        'company' => $cids['company'],
                        'date' => (int)$cids['pubdate']
                    );
                }
            }
            $results[0]['is_join'] = $is_join;
            $results[0]['join_data'] = $join_data;

            //更新浏览次数
            $sql = $dsql->SetQuery("UPDATE `#@__job_fairs` SET `click` = `click` + 1 WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "results");

            global $userLogin;
            $uid = $userLogin->getMemberID();
            if($uid >0) {
                $uphistoryarr = array(
                    'module'    => 'job',
                    'uid'       => $uid,
                    'aid'       => $id,
                    'fuid'      => '',
                    'module2'   => 'fairsDetail',
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }

            return $results[0];
        }
    }


    /**
     * 招聘会列表
     * @return array
     */
    public function fairs()
    {
        global $dsql;
        $pageinfo = $list = array();
        $time     = $addr = $center = $date = $title = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $time     = $this->param['time'];
                $addr     = (int)$this->param['addrid'];
                $center   = $this->param['center'];
                $date     = $this->param['date'];
                $title    = $this->param['title'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $u        = $this->param['u'];
                $type        = $this->param['type'];
                $current = $this->param['current'];
            }
        }

        $where = " WHERE 1 = 1";

        /**
         * 获取商家参与的招聘会
         */
        if($u){
            $cid = $this->getCid();
            if(is_array($cid)){
                return $cid;
            }
            //查询join表，取得参与连接的id
            $sql = $dsql::SetQuery("select f.`id` from `#@__job_fairs` f LEFT JOIN `#@__job_fairs_join` j ON f.`id`=j.`fid` where j.`cid`=$cid");
            $joinIds = $dsql->getArr($sql);
            if(empty($joinIds)){
                return array("state"=>200,"info"=>"暂无相关信息");
            }
            $where .= " AND `id` in(".join(",",$joinIds).")";
        }

        //数据共享
        require(HUONIAOINC."/config/job.inc.php");
        $dataShare = (int)$customDataShare;

        $cityid = getCityId($this->param['cityid']);
        if(!$dataShare){
            if ($cityid) {
                $fids     = array();
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE `cityid` = $cityid");
                $fairs    = $dsql->dsqlOper($archives, "results");
                if ($fairs) {

                    foreach ($fairs as $key => $value) {
                        $fids[] = $value['id'];
                    }

                    if($fids){
                        $where .= " AND `fid` in (" . join(",", $fids) . ")";
                    }else{
                        $where .= " AND 1 = 2";
                    }

                } else {
                    $where .= " AND 1 = 2";
                }
            }
        }

        if($type!=""){
            $where .= " AND `type`=".$type;
        }

        if($current==1){
            $where .= " AND `enddate`>=".time();
        }

        if (!empty($time)) {
            $times = GetMkTime($time);
            $where .= " AND `date` = '$times'";
        }

        if(!$addr){
            $addr = $cityid;
        }
        if ($addr != "") {
            if ($dsql->getTypeList($addr, "site_area")) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addr, "site_area"));
                $lower = $addr . "," . join(',', $lower);
            } else {
                $lower = $addr;
            }

            $fids     = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE `addr` in (" . $lower . ")");
            $fairs    = $dsql->dsqlOper($archives, "results");
            if ($fairs) {

                foreach ($fairs as $key => $value) {
                    $fids[] = $value['id'];
                }

                $where .= " AND `fid` in (" . join(",", $fids) . ")";

            } else {
                $where .= " AND 1 = 2";
            }

        }

        if (!empty($center)) {
            $where .= " AND `fid` = $center";
        }

        if (!empty($date)) {
            $date  = GetMkTime($date);
            $where .= " AND `date` = " . $date;
        }

        if (!empty($title)) {
            $where .= " AND `title` like '%" . $title . "%'";
        }

        $orderby = " order by FIELD(`stating`,1,0,2) asc,`enddate` desc";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("select * from (select `id`,`type`,`fid`,`oid`,`title`,`startdate`,`enddate`,`picture`,`phone`,`obj`,`click`,`note`,`join_type`,`join_img`,`pubdate`,`head_img`,`job_addrs`,`job_types`,case when unix_timestamp(current_timestamp)<startdate then 0 when unix_timestamp(current_timestamp)>enddate then 2 else 1 end as 'stating' from `#@__job_fairs` $where) as alias " . $orderby);

        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_fairs`" . $where);
        $totalCount = (int)getCache("job_fairs_total", $arc, 86400, array("name" => "total", "savekey" => true));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无相关信息！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);

        $results = getCache("job_fairs_list", $archives." LIMIT $atpage, $pageSize", 86400);
        $list    = array();

        $time = time();
        if ($results) {

            $newItem = array();
            foreach ($results as $key => $val) {
                $list[$key]['id']  = (int)$val['id'];
                $list[$key]['fid'] = (int)$val['fid'];
                $list[$key]['type'] = (int)$val['type'];
                $list[$key]['startdate'] = (int)$val['startdate'];
                $list[$key]['enddate'] = (int)$val['enddate'];
                $list[$key]['phone'] = $val['phone'];
                $pics = $val['picture'];
                $picsArr = array();
                if (!empty($pics)) {
                    $pics = explode("###", $pics);
                    foreach ($pics as $key2 => $value) {
                        $v = explode("||", $value);
                        array_push($picsArr, array("pic" => getFilePath($v[0]), "title" => $v[1]));
                    }
                }else{
                    $picsArr = array(array(
                        'pic' => getFilePath('/static/images/404.jpg'),
                        'title' => ''
                    ));
                }
                $list[$key]['picture'] = $picsArr;
                $list[$key]['obj'] = $val['obj'];
                $list[$key]['head_img'] = getFilePath($val['head_img']);
                $list[$key]['stating'] = (int)$val['stating'];
                //判断状态
                if($val['stating']==0){
                    $show_text = date("n/j H:i",$val['startdate'])." - ".date("n/j H:i",$val['enddate']);
                }
                elseif($val['stating']==2){ //已结束
                    $show_text = date("n/j H:i",$val['startdate'])." - ".date("n/j H:i",$val['enddate']);
                }
                else{ //进行中，值为1
                    $day = ($val['enddate'] - $val['startdate'])/86400;
                    $hour = (($val['enddate'] - $val['startdate'])%86400) / 3600;
                    $show_text = "距结束";
                    if(floor($day)!=0){
                        $show_text .= "<b>".floor($day)."</b>天";
                    }
                    if(floor($hour)!=0){
                        $show_text .= "<b>".floor($hour)."</b>小时";
                    }
                    if(floor($day)==0 && floor($hour)==0){
                        $show_text = "1小时内结束";
                    }
                }
                $list[$key]['show_text'] = $show_text;

                $this->param         = $val['fid'];
                $fairsCenterDetail   = $this->fairsCenterDetail();
                $list[$key]['fairs'] = $fairsCenterDetail;

                $oid = $val['oid'];
                $oid = explode(",",$oid);
                foreach ($oid as $oid_i){
                    $this->param         = $oid_i;
                    $fairsCenterDetail   = $this->fairsOrganizerDetail();
                    $list[$key]['organizer'][] = $fairsCenterDetail;
                }
                $list[$key]['organizer'] = $list[$key]['organizer'] ?: array();

                /**
                 * 商家后台获取，返回报名信息
                 */
                if($u){
                    $list[$key]['joinDetail'] = $this->fairsJoin($val['id'],$cid);
                }

                $list[$key]['title'] = $val['title'];
                $list[$key]['date']  = date("Y-m-d", $val['date']);
                $list[$key]['click'] = (int)$val['click'];
                $list[$key]['noteText'] = str_replace(array("&nbsp;","&amp;"," ","&ensp;","&emsp;","&thinsp;","　","\t","\n","\r\n"), "", strip_tags($val['note']));

                $param = array(
                    "service" => "job",
                    "template" => "zhaopinhui",
                    "id" => $val['id'],
                    "type" => $list[$key]['type']
                );
                $list[$key]["url"] = getUrlPath($param);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 获取招聘会报名信息
     */
    private function fairsJoin($fid,$cid){
        global $dsql;
        $sql = $dsql::SetQuery("select * from `#@__job_fairs_join` where `fid`=$fid and `cid`=$cid");
        $joinDetail = $dsql->getArr($sql);
        if(empty($joinDetail)){
            return array("state"=>200,"info"=>"暂无相关信息");
        }
        $joinDetail['id'] = (int)$joinDetail['id'];
        $joinDetail['fid'] = (int)$joinDetail['fid'];
        $joinDetail['cid'] = (int)$joinDetail['cid'];
        $joinDetail['state'] = (int)$joinDetail['state'];
        $joinDetail['pubdate'] = (int)$joinDetail['pubdate'];
        return $joinDetail;
    }


    /**
     * 主办单位详情
     */
    public function fairsOrganizerDetail(){
        global $dsql;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');
        $archives = $dsql->SetQuery("SELECT * FROM `#@__job_fairs_organizer` WHERE `id` = " . $id);
        $results = $dsql->getArr($archives);
        if ($results) {

            $results['id'] = (int)$results['int'];
            $results['cityid'] = (int)$results['cityid'];
            $results['addrid'] = (int)$results['addrid'];
            $results['pubdate'] = (int)$results['pubdate'];

            return $results;
        }else{
            return array("state"=>200,"info"=>"数据不存在");
        }
    }


    /**
     * 招聘会场详细信息
     * @return array
     */
    public function fairsCenterDetail()
    {
        global $dsql;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__job_fairs_center` WHERE `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("job_fairs_center_detail", $archives, 0, $id);
        if ($results) {

            $results[0]['id'] = (int)$results[0]['id'];
            $results[0]['cityid'] = (int)$results[0]['cityid'];
            $results[0]['pubdate'] = (int)$results[0]['pubdate'];
            $results[0]['tel'] = $results[0]['tel'];

            global $data;
            $data               = "";
            $addrArr            = getParentArr("site_area", $results[0]['addr']);
            $addrArr            = array_reverse(parent_foreach($addrArr, "typename"));
            $results[0]['addr'] = $addrArr;

            $results[0]['lnglat'] = explode(",", $results[0]['lnglat']);
            $results[0]['seat_picture'] = getFilePath($results[0]['seat_picture']);

            $picsArr = array();
            $pics    = $results[0]['pics'];
            if (!empty($pics)) {
                $pics = explode("###", $pics);
                foreach ($pics as $key => $value) {
                    $v = explode("||", $value);
                    array_push($picsArr, array("pic" => getFilePath($v[0]), "title" => $v[1]));
                }
            }
            $results[0]['pics'] = $picsArr;

            $results[0]['traffic'] = nl2br($results[0]['traffic']);

            return $results[0];

        }
    }


    /**
     * 求职列表
     */
    public function qzList(){
        global $dsql;
        global $userLogin;
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $u = (int)$param['u'];
        $id = $this->param['id'];  //指定信息id，多个用,分隔

        //条件
        $where = " and `del`=0";

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

        //当前登录用户
        if($u){
            $uid = $this->getUid();
            if(is_array($uid)){
                return $uid;
            }
            $memberInfo = $userLogin->getMemberInfo(0, 1);
            $where .= " AND (`userid`=$uid";
            if($memberInfo['phoneCheck']==1){
                $where .= " or `phone`='{$memberInfo['phone']}'";
            }
            $where .= ")";
        }else{
            $where .= " and `state`=1";
        }

        //数据共享
        require(HUONIAOINC."/config/job.inc.php");
        $dataShare = (int)$customDataShare;
        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }
        $filterId = $param['filterId'] ?: "";
        if(!empty($filterId)){
            $where .= " AND `id` not in({$filterId})";
        }
        //地区
        $addrid = (int)$param['addrid'];
        if($addrid){
            $where .= " ANd `addrid`=$addrid";
        }
        //学历
        $education = (int)$param['education'];
        if($education){
            $where .= " AND `education`=$education";
        }
        //经验
        $min_experience = $param['min_experience'];
        $max_experience = $param['max_experience'];
        if($min_experience){
            $where .= " AND `experience`>=$min_experience";
        }
        if($max_experience){
            $where .= " AND `experience`<=$max_experience";
        }
        //性别
        $sex = (int)$param['sex'];
        if($sex){
            $where .= " AND `sex`=$sex";
        }
        //年龄
        $min_age = $param['min_age'];
        $max_age = $param['max_age'];
        if($min_age!=""){
            $where .= " AND `age`>=$min_age";
        }
        if($max_age!=""){
            $where .= " AND `age`<=$max_age";
        }
        $key = $param['keyword'];
        if($key){
            $key = trim($key);
            $where .= " AND `title` like '%$key%'";
        }
        $orderby = $param['orderby'] ?: 0;
        if($orderby==2){
            $where .= " order by `pubdate` desc";
        }else{
            $where .= " order by `id` desc";
        }

        $sql = $dsql::SetQuery("select `id` from `#@__job_qz` where 1=1".$where);
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        foreach ($pageObj['list'] as & $item){
            $this->param = array("id"=>$item['id']);
            $item = $this->qzDetail();
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 求职详情
     */
    public function qzDetail(){
        global $dsql;
        global $userLogin;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //VIP会员免费查看
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("select * from `#@__job_qz` where `id`=$id and `del`=0");
        $qzDetail = $dsql->getArr($sql);
        if(empty($qzDetail) || !is_array($qzDetail)){
            return array("state"=>200,"info"=>"数据不存在");
        }
        $qzDetail['id'] = (int)$qzDetail['id'];
        $qzDetail['userid'] = (int)$qzDetail['userid'];
        $sql = $dsql::SetQuery("select `photo` from `#@__member` where `id`=".$qzDetail['userid']);
        $photo = $dsql->getOne($sql);
        $qzDetail['photo'] = getFilePath($photo);
        //当前登录会员的信息
        $userinfo = $userLogin->getMemberInfo();
        //当前登录会员的绑定手机状态，小程序端隐私号功能需要用到
        $userPhoneCheck = 0;
        if($userinfo && $userinfo['phoneCheck']){
            $userPhoneCheck = 1;
        }
        $qzDetail['userPhoneCheck'] = $userPhoneCheck;
        //判断是否已经付过查看电话号码的费用
        $loginUserID = $userLogin->getMemberID();
        $loginUserInfo = $userinfo;
        $adminID = $userLogin->getUserID();
        if($qzDetail['state']!=1 && $qzDetail['userid']!=$loginUserID && $adminID == -1){
            return array("state"=>200,"info"=>"信息待审核");
        }
        $payPhoneState = $loginUserID == -1 ? 0 : 1;
        $cpayphoneModule = $cfg_payPhoneModule;
        $cpayphoneModule = $cpayphoneModule ? is_string($cpayphoneModule) ? explode(",",$cpayphoneModule) : $cpayphoneModule : array();
        if($cfg_payPhoneState && in_array('job', $cpayphoneModule) && $loginUserID != $qzDetail['userid']){

            //判断是否开启了会员免费
            if($cfg_payPhoneVipFree && $loginUserInfo['level']){
                $payPhoneState = 1;
            }
            else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'job' AND `temp` = 'qz' AND `uid` = '$loginUserID' AND `aid` = " . $qzDetail['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    $payPhoneState = 0;
                }
            }

        }
        $qzDetail['payPhoneState'] = $payPhoneState; //当前信息是否支付过
        $qzDetail['phone']     = !$payPhoneState && $loginUserID != $qzDetail['userid'] ? '请先付费' : ($cfg_privatenumberState && in_array('job', $cfg_privatenumberModule) && $loginUserID != $qzDetail['userid']? '请使用隐私号' : $qzDetail['phone']);
        $tel = (int)$qzDetail['phone'];
        $qzDetail['phone_']    = is_numeric($tel) ? (substr($tel, 0, 2) . '****' . substr($tel, -2)) : '****';

        $qzDetail['cityid'] = (int)$qzDetail['cityid'];
        $qzDetail['education'] = (int)$qzDetail['education'];
        $qzDetail['experience'] = (int)$qzDetail['experience'];
        $qzDetail['age'] = (int)$qzDetail['age'];
        $qzDetail['state'] = (int)$qzDetail['state'];
        $qzDetail['weight'] = (int)$qzDetail['weight'];
        $qzDetail['sex'] = (int)$qzDetail['sex'];
        $qzDetail['phone_login'] = (int)$qzDetail['phone_login'];
        $qzDetail['pubdate'] = (int)$qzDetail['pubdate'];
        $qzDetail['area_code'] = (int)$qzDetail['area_code'];
        $qzDetail['sex_name'] = $qzDetail['sex']==1 ? "男" : "女";
        $qzDetail['experience_name'] = $qzDetail['experience']==0 ? '不限' : $qzDetail['experience']."年";
        $qzDetail['education_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$qzDetail['education']));
        //多级job
        $qzDetail['job'] = $qzDetail['job'] ? json_decode("[".$qzDetail['job']."]",true) : array();
        $job_name = array();
        $job_list = array();
        $job_list_name = array();
        foreach ($qzDetail['job'] as $job_i){
            $sql = $dsql::SetQuery("select `typename` from `#@__job_type_pg` where `id`=".$job_i);
            $job_name[] = $dsql->getOne($sql) ?: "";
            //获取父分类
            global $data;
            $data = "";
            $typeArr = getParentArr("job_type_pg", $job_i);
            $ids = array_reverse(parent_foreach($typeArr, "id"));
            if($ids){
                $ids = join(",",$ids);
                $jobs_parent = json_decode("[".$ids."]",true);
            }else{
                $jobs_parent = array($job_i);
            }
            $job_list[] = $jobs_parent;
            global $data;
            $data = "";
            $typeArr = getParentArr("job_type_pg", $job_i);
            $typenames = array_reverse(parent_foreach($typeArr, "typename"));
            $job_list_name[] = $typenames;
        }
        $qzDetail['job_name'] = $job_name;
        $qzDetail['job_list'] = $job_list;
        $qzDetail['job_list_name'] = $job_list_name;
        //多级地址
        $qzDetail['addrid'] = (int)$qzDetail['addrid'];
        $qzDetail['addrName'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`=".$qzDetail['addrid']));
        $addrName = getParentArr("site_area", $qzDetail['addrid']);
        global $data;
        $data = "";
        $qzDetail['addrName'] = array_reverse(parent_foreach($addrName, "typename"));
        $data = "";
        $addrName = getParentArr("site_area", $qzDetail['addrid']);
        $addrid = array_reverse(parent_foreach($addrName, "id"));
        if(empty($addrid)){
            $addrid = array();
        }
        foreach ($addrid as $addrid_k => $addrid_i){
            $addrid[$addrid_k] = (int)$addrid_i;
        }
        $qzDetail['addrid_list'] = $addrid;
        unset($qzDetail['del']);

        $urlParam = array(
            "service"=>"job",
            "template"=>"general-detailqz",
            "id"=>$qzDetail['id']
        );
        $url = getUrlPath($urlParam);
        $qzDetail['url'] = $url;

        return $qzDetail;
    }


    /**
     * 删除求职
     */
    public function delQz()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }

        $memberInfo = $userLogin->getMemberInfo();

        $where = array("`userid`=$userid");
        if($memberInfo['phoneCheck']==1){
            array_push($where, "`phone`='{$memberInfo['phone']}'");
        }
        $where = "(" . join(' or ', $where) . ")";

        $ids = $param['id'];
        if(empty($ids)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("update `#@__job_qz` set `del`=1 where id in($ids) and " . $where);
        $up = $dsql->update($sql);

        return "操作成功";
    }


    /**
     * 发布，编辑求职
     */
    public function aeQz()
    {
        global $dsql;
        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }
        $param = $this->param;
        $id = (int)$param['id'];
        $cityid = $param['cityid'];
        if(empty($cityid)){
            return array("state"=>200,"info"=>"请传递cityid");
        }
        $job = $param['job'];
        if(empty($job)){
//            return array("state"=>200,"info"=>"请选择求职职位");
        }
        if(is_array($job)){
            $job = join(",",$job);
        }
        $addrid = (int)$param['addrid'];
        if(empty($addrid)){
            return array("state"=>200,"info"=>"请选择工作地区");
        }
        $experience = (int)$param['experience'];
        $age = (int)$param['age'];
        if(empty($age)){
            return array("state"=>200,"info"=>"请选择年龄");
        }
        $sex = (int)$param['sex'];
        if(empty($sex)){
            return array("state"=>200,"info"=>"请选择性别");
        }
        $title = $param['title'];
        if(empty($title)){
            return array("state"=>200,"info"=>"请输入求职标题");
        }
        $description = $param['description'] ?: "";
        $nickname = $param['nickname'];
        if(empty($nickname)){
            return array("state"=>200,"info"=>"请输入昵称");
        }
        $phone = $param['phone'];
        if(empty($phone)){
            return array("state"=>200,"info"=>"请输入联系电话");
        }
        $phone_login = (int)$param['phone_login'];
        $area_code = (int)$param['area_code'];
        if(empty($area_code)){
            return array("state"=>200,"info"=>"缺少区号");
        }
        $pubdate = time();
        $ip = GetIP();
        //是否验证手机号？
        $checkPhone = false;
        // if(empty($id)){
        //     $checkPhone = true;
        // }else{
            global $userLogin;
            //校验会员中心的手机号码，是否和该号码一致，并且已验证
            $memberInfo = $userLogin->getMemberInfo();
            $uPhone = $memberInfo['phone'];
            $uPhoneCheck = $memberInfo['phoneCheck'];
            //如果新旧手机号码不一致，则要验证新手机号码
            $oldPhone = $dsql::SetQuery("select `phone` from `#@__job_qz` where `id`=$id");
            $oldPhone = $dsql->getOne($oldPhone);
            if(($oldPhone!=$phone && $uPhone!=$phone) || ($uPhone==$phone && !$uPhoneCheck)){
                $checkPhone = true;
            }
        // }
        if($checkPhone){
            $vercode  = $param['vercode'];
            if(!$vercode){
                return array("state"=>200,"info"=>"请输入验证码");
            }
            $sql_code = $dsql->SetQuery("SELECT `code` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$phone' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->getOne($sql_code);
            if (strtolower($vercode) != $res_code) {
                return array ('state' => 200, 'info' => "验证码输入错误，请重试！");
            }
        }
        require(HUONIAOINC."/config/job.inc.php");
        global $custom_fabuCheck;
        $adminState = $custom_fabuCheck;
        //新增
        if(empty($id)){
            $sql = $dsql::SetQuery("insert into `#@__job_qz`(`cityid`,`userid`,`job`,`addrid`,`experience`,`age`,`sex`,`title`,`description`,`nickname`,`phone`,`phone_login`,`pubdate`,`area_code`,`state`) values($cityid,$userid,'$job',$addrid,$experience,$age,$sex,'$title','$description','$nickname','$phone',$phone_login,$pubdate,$area_code,$adminState)");
            $up = $dsql->dsqlOper($sql,"lastid");
            if(is_numeric($up)){
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'general-detailqz',
                    'id'=>$up
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'qz', $id, 'update', '新增求职('.$title.')', $url, $sql);
                return "操作成功";
            }
            else{
                return array("state"=>200,"info"=>"操作失败");
            }
        }
        //更新
        else{
            $sql = $dsql::SetQuery("update `#@__job_qz` set `cityid`='$cityid',`job`='$job',`addrid`=$addrid,`experience`=$experience,`age`=$age,`sex`=$sex,`title`='$title',`description`='$description',`nickname`='$nickname',`phone`='$phone',`phone_login`=$phone_login,`pubdate`=$pubdate,`area_code`=$area_code,`state`=$adminState where `id`=$id and `userid`=$userid");
            $up = $dsql->update($sql);
            if($up=="ok"){
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'general-detailqz',
                    'id'=>$id
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'qz', $id, 'update', '更新求职('.$title.')', $url, $sql);
                return "操作成功";
            }
            else{
                return array("state"=>200,"info"=>"操作失败");
            }
        }
    }

    /**
     * 普工热招公司
     */
    public function pgHotCompany(){
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        $param = $this->param;
        $limit = $param['limit'] ?: 5;
        $top = $param['top'] ?: 0;
        //普工热招置顶，后台配置
        if($top==1){
            $sql = $dsql::SetQuery("select `id`,`addrid`,`logo`,`title`,`industry` from `#@__job_company` where `state`=1 and `promotion`=1 order by `weight` desc");
            $list = $dsql->getArrList($sql);
        }
        //普工热招公司
        else{
            $nlimit = $limit * 2; //先至多抓取两倍，因为后续筛选可能会去掉一部分
            $sql = $dsql::SetQuery("select `id`,`addrid`,`logo`,`title`,`industry` from `#@__job_company` where `state`=1 and `pgactive`!=0 order by `pgactive` desc limit $nlimit");
            $list = $dsql->getArrList($sql);
        }
        if(count($list)==0){
            return array("state"=>200,"info"=>"暂无相关信息");
        }
        $delids = array();
        $index = 0;
        foreach ($list as & $item){
            $item['id'] = (int)$item['id'];
            $item['addrid'] = (int)$item['addrid'];
            $item['addr_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`={$item['addrid']}"));
            $item['logo'] = getFilePath($item['logo']);
            $item['url'] = getUrlPath(array("service"=>"job","template"=>"company","id"=>$item['id']));
            $item['industry_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`={$item['industry']}"));
            //统计普工有效职位
            $sql = $dsql::SetQuery("select count(*) from `#@__job_pg` where `userid`= $uid and `del`=0 and `pubdate`+valid*86400 > unix_timestamp(current_timestamp)");
            $pgCount = (int)$dsql->getOne($sql);
            //统计职位
            $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`={$item['id']} and `del`=0 and `off`=0");
            $jobCount = $dsql->getOne($sql);
            $count = (int)$pgCount + $jobCount;
            $item['job_count'] = $count;
            if($count>0){
                $jobs = array();
                //取两个职位
                if($pgCount>0 && $jobCount>0){
                    $sql = $dsql::SetQuery("select `title` from `#@__job_pg` where `userid`={$item['id']} limit 1");
                    $item['job_title'] = $dsql->getOne($sql);

                    //普通职位
                    $sql = $dsql::SetQuery("select `id`,`title` from `#@__job_post` where `company`={$item['id']} limit 1");
                    $JobDetail = $dsql->getArr($sql);
                    $JobDetail['type'] = 'post';
                    $jobs[] = $JobDetail;
                    //普工职位
                    $sql = $dsql::SetQuery("select `id`,`title` from `#@__job_pg` where `userid`=$uid limit 1");
                    $pgJobDetail = $dsql->getArr($sql);
                    $pgJobDetail['type'] = 'pg';
                    $jobs[] = $pgJobDetail;
                    $item['jobs'] = $jobs;
                }
                //仅职位
                elseif($jobCount>0){
                    $sql = $dsql::SetQuery("select `title` from `#@__job_post` where `company`={$item['id']} limit 1");
                    $item['job_title'] = $dsql->getOne($sql);

                    $sql = $dsql::SetQuery("select `id`,`title`,'post' as 'type' from `#@__job_post` where `company`={$item['id']} limit 2");
                    $jobs = $dsql->getArrList($sql);
                    $item['jobs'] = $jobs;
                }
                //仅普工
                else{
                    $sql = $dsql::SetQuery("select `title` from `#@__job_pg` where `userid`=$uid limit 1");
                    $item['job_title'] = $dsql->getOne($sql);

                    $sql = $dsql::SetQuery("select `id`,`title`,'pg' as 'type' from `#@__job_pg` where `userid`=$uid limit 2");
                    $jobs = $dsql->getArrList($sql);
                    $item['jobs'] = $jobs;
                }
            }else{
                $delids[] = $index;
            }
            $index++;
        }
        unset($item);
        foreach ($delids as $k){
            unset($list[$k]);
        }
        $newList= array_values($list);
        $newList = array_slice($list,0,$limit);
        if(empty($newList)){
            return array("state"=>200,"info"=>"暂无相关信息");
        }
        $return['pageInfo']['page'] = 1;
        $return['pageInfo']['pageSize'] = (int)$limit;
        $return['pageInfo']['totalCount'] = count($newList);
        $return['pageInfo']['totalPage'] = 1;
        $return['list'] = $newList;
        return $return;
    }


    /**
     * 普工列表
     */
    public function pgList(){

        global $dsql;
        global $userLogin;
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $id = $this->param['id'];  //指定信息id，多个用,分隔
        //筛选条件...
        $where = " and `del`=0";

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

        $u = (int)$param['u'];
        //当前登录用户
        if($u){
            $uid = $this->getUid();
            if(is_array($uid)){
                return $uid;
            }
            $memberInfo = $userLogin->getMemberInfo();
            $where .= " AND (`userid`=$uid";
            if($memberInfo['phoneCheck']==1){
                $where .= " or `phone`='{$memberInfo['phone']}'";
            }
            $where .= ")";
        }else{
            $where .= " and `state`=1";
        }
        //区域id
        $addrid = $param['addrid'];
        if(is_array($addrid)){
            $addrid = join(",",$addrid);
        }
        if($addrid){
            $where .= " AND `addrid` in ($addrid)";
        }
        //福利（多选）
        $welfare = $param['welfare'];
        if($welfare){
            $welfares = explode(",",$welfare);
            foreach ($welfares as $welfare_i){
                $where .= " AND FIND_IN_SET('$welfare_i',`welfare`)";
            }
        }
        $filterId = $param['filterId'] ?: "";
        if(!empty($filterId)){
            $where .= " AND `id` not in({$filterId})";
        }
        //薪资筛选（为了方便前端传参，直接转int，如果是0则不生效）
        $min_salary = (int)$param['min_salary'];
        $max_salary = (int)$param['max_salary'];
        if($min_salary || $max_salary){
            if($min_salary && $max_salary){
                $where .= " AND `min_salary`>=$min_salary && `max_salary`<=$max_salary";
            }
            elseif($min_salary){
                $where .= " AND `min_salary`>=$min_salary";
            }
            else{ //max
                $where .= " AND `max_salary`<=$max_salary";
            }
        }
        //数据共享
        require(HUONIAOINC."/config/job.inc.php");
        $dataShare = (int)$customDataShare;
        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }
        //学历要求
        $education = (int)$param['education'];
        if($education){
            $where .= " AND `education`=$education";
        }
        //最低最高工作经验年份要求
        $min_experience = (int)$param['min_experience'];
        if($min_experience){
            $where .= " AND `experience`>=$min_experience";
        }
        $max_experience = (int)$param['max_experience'];
        if($max_experience){
            $where .= " AND `experience`<=$max_experience";
        }
        //发布时间（筛选新的数据，也就是大于等于这个时间）
        $pubdate = (int)$param['pubdate'];
        if($pubdate){
            if($pubdate==1){ //本周
                $pubdate = strtotime(date("Y-m-d 00:00:00")) - (date("N") -1) * 86400;
            }
            elseif($pubdate==2){ //本月
                $pubdate = strtotime(date("Y-m-d 00:00:00")) - (date("d")-1) * 86400;
            }
            $where .= " AND `pubdate`>=$pubdate";
        }
        //最小年龄
        $min_age = (int)$param['min_age'];
        if($min_age){
            $where.= " and `min_age`>=$min_age";
        }
        $max_age = (int)$param['max_age'];
        if($max_age){
            $where .= " and `max_age`<=$max_age";
        }
        //关键字搜索
        $key = $param['keyword'];
        if($key){
            $key = trim($key);
            $where .= " AND `title` like '%$key%'";
        }
        //性质
        $nature = (int)$param['nature'];
        if($nature){
            $where .= " and `nature`=$nature";
        }

        //职位分类
        $job = $param['stype']; //可多个
        if(!empty($job)){
            //传多个ID的，不支持遍历下级
            if(strstr($job, ',')){
                $job = explode(",",$job);
                $where .= " and(";
                foreach ($job as $index => $jobi){
                    if($index!=0){
                        $where .= " or";
                    }
                    $where .= " FIND_IN_SET('$jobi',`job`)";
                }
                $where .=")";
            }else{
                //遍历分类
                $typeArr = $dsql->getTypeList($job, "job_type_pg");
                if($typeArr){
                    global $arr_data;
                    $arr_data = array();
                    $lower = arr_foreach($typeArr);
                    $lower = $job.",".join(',',$lower);
                }else{
                    $lower = $job;
                }
                $where .= " AND `job` in ($lower)";
            }
        }

        //排序
        $order = (int)$param['order'];
        if($order==2){ // 最新发布排序
            $where .= " order by `pubdate` desc";
        }else{
            $where .= " order by `id` desc";
        }

        $sql = $dsql::SetQuery("select `id` from `#@__job_pg` where 1=1.$where");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        //用户登录获取统计信息头
        if($u){
            $pageObj['pageInfo']['pg'] = $pageObj['pageInfo']['totalCount'];
            $sql = $dsql::SetQuery("select count(*) from `#@__job_qz` where `userid`=$uid and `del`=0");
            $pageObj['pageInfo']['qz'] = (int)$dsql->getOne($sql);
        }
        //非用户获取
        else{
            if($pageObj['pageInfo']['totalCount']==0){
                return array("state"=>200,"info"=>"暂无相关数据");
            }
        }
        foreach ($pageObj['list'] as & $item){
            $this->param = array("id"=>$item['id']);
            $item = $this->pgDetail();
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 相似普工列表
    */
    public function similarPgList(){
        global $dsql;
        $param = $this->param;
        $id = $param['id'] ?? 0;  //要和那个普工相似
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $limit = $param['limit'] ?? 5;
        //找出普工的分类
        $sql = $dsql::SetQuery("select `job` from `#@__job_pg` where `id`=$id");
        $jobs = $dsql->getOne($sql);
        $jobs = explode(",",$jobs);
        $find_pg = array();
        //尝试查找同分类
        foreach ($jobs as $jobs_i){
            $sql = $dsql::SetQuery("select `id` from `#@__job_pg` where `id`!=$id and `state`=1 and `del`=0 and FIND_IN_SET('$jobs_i',`job`)");
            $item_pg = $dsql->getArr($sql);  //取出n个
            $find_pg = array_merge($find_pg,$item_pg);
            $find_pg = array_unique($find_pg);
            if(count($find_pg)>=$limit){
                $find_pg = array_slice($find_pg,0,$limit);
                break;
            }
        }
        //如果同级分类不足，继续查找上级【直接上级】
        if(count($find_pg)<$limit){
            foreach ($jobs as $jobs_i){
                //找出每个上级
                $sql = $dsql::SetQuery("select `parentid` 'id' from `#@__job_type_pg` where `id`=$jobs_i");
                $parent_id = $dsql->getOne($sql);
                if($parent_id!=0){
                    //尝试找出对应职位
                    $sql = $dsql::SetQuery("select `id` from `#@__job_pg` where `id`!=$id and `state`=1 and `del`=0 and FIND_IN_SET('$parent_id',`job`)");
                    $item_pg = $dsql->getArr($sql);  //取出n个
                    $find_pg = array_merge($find_pg,$item_pg);
                    $find_pg = array_unique($find_pg);
                    if(count($find_pg)>=$limit){
                        $find_pg = array_slice($find_pg,0,$limit);
                        break;
                    }
                }
            }
        }
        //如果前面一个都没找到，取最新n条
        if(count($find_pg)==0){
            $sql = $dsql::SetQuery("select `id` from `#@__job_pg` where `id`!=$id and `state`=1 and `del`=0 order by `id` desc limit $limit");
            $find_pg = $dsql->getArr($sql);
        }
        //如果还是空，那么没有数据
        if(count($find_pg)==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        //取出数据，并返回
        $list = array();
        foreach ($find_pg as & $find_pg_id){
            $this->param = array("id"=>$find_pg_id);
            $list[] = $this->pgDetail();
        }
        unset($find_pg_id);
        $pageObj['list'] = $list;
        $pageObj['count'] = count($list);
        return $pageObj;
    }



    /**
     * 普工详情
     */
    public function pgDetail(){
        global $dsql;
        global $userLogin;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //VIP会员免费查看
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("select * from `#@__job_pg` where `id`=$id and `del`=0");
        $pgDetail = $dsql->getArr($sql);
        if(empty($pgDetail) || !is_array($pgDetail)){
            return array("state"=>200,"info"=>"数据不存在");
        }
        $pgDetail['id'] = (int)$pgDetail['id'];
        $pgDetail['userid'] = (int)$pgDetail['userid'];
        $sql = $dsql::SetQuery("select `photo` from `#@__member` where `id`=".$pgDetail['userid']);
        $photo = $dsql->getOne($sql);
        $pgDetail['photo'] = getFilePath($photo);
        //当前登录会员的信息
        $userinfo = $userLogin->getMemberInfo();
        //当前登录会员的绑定手机状态，小程序端隐私号功能需要用到
        $userPhoneCheck = 0;
        if($userinfo && $userinfo['phoneCheck']){
            $userPhoneCheck = 1;
        }
        $pgDetail['userPhoneCheck'] = $userPhoneCheck;
        //判断是否已经付过查看电话号码的费用
        $loginUserID = $userLogin->getMemberID();
        $loginUserInfo = $userinfo;
        $adminID = $userLogin->getUserID();
        if($pgDetail['state']!=1 && $pgDetail['userid']!=$loginUserID && $adminID == -1){
            return array("state"=>200,"info"=>"信息待审核");
        }
        $payPhoneState = $loginUserID == -1 ? 0 : 1;
        $cPhoneModule = $cfg_payPhoneModule;
        $cPhoneModule = $cPhoneModule ? is_string($cPhoneModule) ? explode(",",$cPhoneModule) : $cPhoneModule : array();
        if($cfg_payPhoneState && in_array('job', $cPhoneModule) && $loginUserID != $pgDetail['userid']){

            //判断是否开启了会员免费
            if($cfg_payPhoneVipFree && $loginUserInfo['level']){
                $payPhoneState = 1;
            }
            else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'job' AND `temp` = 'zg' AND `uid` = '$loginUserID' AND `aid` = " . $pgDetail['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    $payPhoneState = 0;
                }
            }
        }
        $pgDetail['payPhoneState'] = $payPhoneState; //当前信息是否支付过
        $pgDetail['phone']     = !$payPhoneState && $loginUserID != $pgDetail['userid'] ? '请先付费' : ($cfg_privatenumberState && in_array('job', $cfg_privatenumberModule) && $loginUserID != $pgDetail['userid'] ? '请使用隐私号' : $pgDetail['phone']);
        $tel = (int)$pgDetail['phone'];
        $pgDetail['phone_']    = is_numeric($tel) ? (substr($tel, 0, 2) . '****' . substr($tel, -2)) : '****';

        //判断是否为招聘公司【不一定存在，此时返回空的array】
        $sql = $dsql::SetQuery("select `id`,`title` from `#@__job_company` where `userid`=".$pgDetail['userid']);
        $companyDetail = $dsql->getArr($sql) ?: array();
        if(!empty($companyDetail)){
            $companyDetail['id'] = (int)$companyDetail['id'];
            $companyDetail['url'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$companyDetail['id']
            ));
        }
        $pgDetail['companyDetail'] = $companyDetail;
        $pgDetail['cityid'] = (int)$pgDetail['cityid'];
        $pgDetail['min_salary'] = (int)$pgDetail['min_salary'];
        $pgDetail['max_salary'] = (int)$pgDetail['max_salary'];
        $pgDetail['salary_type'] = (int)$pgDetail['salary_type'];
        $pgDetail['valid'] = (int)$pgDetail['valid'];
        $pgDetail['valid_end'] = (int)$pgDetail['valid_end'];
        $pgDetail['pubdate'] = (int)$pgDetail['pubdate'];
        $pgDetail['addrid'] = (int)$pgDetail['addrid'];
        $age_name = "不限";
        if(!empty($pgDetail['min_age']) && !empty($pgDetail['max_age'])){
            $age_name = $pgDetail['min_age']."-".$pgDetail['max_age']."岁";
        }elseif(!empty($pgDetail['min_age'])){
            $age_name = $pgDetail['min_age']."岁以上";
        }elseif(!empty($pgDetail['max_age'])){
            $age_name = $pgDetail['max_age']."岁以下";
        }
        $pgDetail['age_name'] = $age_name;
        $pgDetail['education'] = (int)$pgDetail['education'];
        $pgDetail['experience'] = (int)$pgDetail['experience'];
        $pgDetail['phone_login'] = (int)$pgDetail['phone_login'];
        $pgDetail['area_code'] = (int)$pgDetail['area_code'];
        $pgDetail['nature'] = (int)$pgDetail['nature'];
        $pgDetail['nature_name'] = $pgDetail['nature'] == 1 ? '全职' : '兼职';
        $pgDetail['experience_name'] = $pgDetail['experience']==0 ? '不限' : $pgDetail['experience']."年";
        $pgDetail['education_name'] = $pgDetail['education'] == 0 ? '不限' : $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`={$pgDetail['education']}"));
        $pgDetail['welfare'] = $pgDetail['welfare'] ? json_decode("[".$pgDetail['welfare']."]",true) : array();
        $welfareNames = array();
        foreach ($pgDetail['welfare'] as $welfareI){
            $sql = $dsql::SetQuery("select `typename` from `#@__jobitem` where `id`={$welfareI}");
            $welfareNames[] = $dsql->getOne($sql);
        }
        $pgDetail['welfare_name'] = $welfareNames;
        //多级job
        $pgDetail['job'] = $pgDetail['job'] ? json_decode("[".$pgDetail['job']."]",true) : array();
        $job_name = array();
        $job_list = array();
        $job_list_name = array();
        foreach ($pgDetail['job'] as $job_i){
            $sql = $dsql::SetQuery("select `typename` from `#@__job_type_pg` where `id`=".$job_i);
            $job_name[] = $dsql->getOne($sql) ?: "";
            //获取父分类
            global $data;
            $data = "";
            $typeArr = getParentArr("job_type_pg", $job_i);
            $ids = array_reverse(parent_foreach($typeArr, "id"));
            if($ids){
                $ids = join(",",$ids);
                $jobs_parent = json_decode("[".$ids."]",true);
            }else{
                $jobs_parent = array($job_i);
            }
            $job_list[] = $jobs_parent;
            global $data;
            $data = "";
            $typeArr = getParentArr("job_type_pg", $job_i);
            $typenames = array_reverse(parent_foreach($typeArr, "typename"));
            $job_list_name[] = $typenames;
        }
        $pgDetail['job_name'] = $job_name;
        $pgDetail['job_list'] = $job_list;
        $pgDetail['job_list_name'] = $job_list_name;
        //多级地址
        $pgDetail['addrid'] = (int)$pgDetail['addrid'];
        $pgDetail['addrName'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`=".$pgDetail['addrid']));
        $addrName = getParentArr("site_area", $pgDetail['addrid']);
        global $data;
        $data = "";
        $pgDetail['addrName'] = array_reverse(parent_foreach($addrName, "typename"));
        $data = "";
        $addrName = getParentArr("site_area", $pgDetail['addrid']);
        $addrid = array_reverse(parent_foreach($addrName, "id"));
        if(empty($addrid)){
            $addrid = array();
        }
        foreach ($addrid as $addrid_k => $addrid_i){
            $addrid[$addrid_k] = (int)$addrid_i;
        }
        $pgDetail['addrid_list'] = $addrid;
        unset($pgDetail['del']);
        $urlParam = array(
            "service"=>"job",
            "template"=>"general-detailzg",
            "id"=>$pgDetail['id']
        );
        $url = getUrlPath($urlParam);
        $pgDetail['url'] = $url;
        return $pgDetail;
    }

    /**
     * 删除普工
     */
    public function delPg()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }

        $memberInfo = $userLogin->getMemberInfo();

        $where = array("`userid`=$userid");
        if($memberInfo['phoneCheck']==1){
            array_push($where, "`phone`='{$memberInfo['phone']}'");
        }
        $where = "(" . join(' or ', $where) . ")";

        $ids = $param['id'];
        if(empty($ids)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("update `#@__job_pg` set `del`=1 where id in($ids) and " . $where);
        $up = $dsql->update($sql);

        return "操作成功";
    }

    /**
     * 计算一个置顶当前剩余量
     */
    private function countTopLess($item){
        global $dsql;
        $time = time();
        //总量（秒）
        $total = $item['top_total'] * 86400 -1;
        //如果没开始，直接返回总量
        if($item['top_start']>$time){
            return $total;
        }
        //已经开始了，则要遍历所有日期，对每天进行计算
        $noTopArr = explode(",",$item['no_top']);
        //没有不置顶
        if(empty($noTopArr)){
            //减去已使用的
            $use = $time -$item['top_start'];
            return $total - $use;
        }
        //可能不置顶
        else{
            //今天是特殊计算的（今天 != 开始的第一天）
            $now_day = date("Y-m-d 00:00:00");
            $NN = date("N");
            $use = 0;  //总使用量
            //减去今天使用的量
            if($now_day != date("Y-m-d 00:00:00",$item['top_start'])){
                if(in_array($NN,$noTopArr)){
                    $use = 0;
                }else{
                    $use = $time-$now_day; //今天过去了n秒
                }
            }
            //中间的天数，可以循环计算
            $top_start_date = date("Y-m-d 00:00:00",$item['top_start']);

            $loop_start = $now_day; //从今天开始倒退（今天！=开始的第一天）
            while($loop_start>$item['top_start'] && $loop_start!=$top_start_date){  //只要大于开始时间，且没到达第一天，就说明在中间的n天
                //算出该天是否为不置顶日
                $NN = date("N",$loop_start);
                //该天不在“不置顶日”，则use+=86400
                if(!in_array($NN,$noTopArr)){
                    $use +=86400;
                }
                $loop_start -= 86400;
            }
            //开始的那天，也是特殊计算
            //开始第一天是以 00:00:00 开始
            if(date("Y-m-d 00:00:00",$item['top_start']) == $item['top_start']){
                //今天是否==开始的第一天？
                if($now_day == date("Y-m-d 00:00:00",$item['top_start'])){
                    $use = time() - strtotime(date("Y-m-d 00:00:00"));
                }else{
                    $use = 86400;
                }
            }
            //开始第一天，不是00
            else{
                //今天是否==开始的第一天？
                if($now_day == date("Y-m-d 00:00:00",$item['top_start'])){
                    $use = time() - $item['top_start'];
                }else{
                    $start_day_next = strtotime(date("Y-m-d 00:00:00",$item['top_start'])) + 86400; //下一天开始的时间
                    $use = 86400 - ($start_day_next - $item['top_start']);
                }
            }
            $total -= $use;
        }
        return $total;
    }

    /**
     * 获取一个职位的置顶详情
    */
    public function getTopDetail($pid){
        global $dsql;
        $time = time();
        $sql = $dsql::SetQuery("select `id`,`top_total`,`top_start`,`top_end`,`no_top` from `#@__job_top_recode` where `pid`=$pid AND `top_end`>=$time limit 1");
        $item = $dsql->getArr($sql);
        $item['id'] = (int)$item['id'];
        $item['top_total'] = (int)$item['top_total'];
        $item['top_start'] = (int)$item['top_start'];
        $item['top_end'] = (int)$item['top_end'];
        $noTopZh = array();
        $noTop = array();
        if(!empty($item['no_top'])){
            $noTop = json_decode("[".$item['no_top']."]",true);
            if(in_array(1,$noTop)){
                $noTopZh[] = "周一";
            }
            if(in_array(2,$noTop)){
                $noTopZh[] = "周二";
            }
            if(in_array(3,$noTopZh)){
                $noTopZh[] = "周三";
            }
            if(in_array(4,$noTop)){
                $noTopZh[] = "周四";
            }
            if(in_array(5,$noTop)){
                $noTopZh[] = "周五";
            }
            if(in_array(6,$noTop)){
                $noTopZh[] = "周六";
            }
            if(in_array(7,$noTop)){
                $noTopZh[] = "周日";
            }
        }
        $item['no_top'] = $noTop;  //不置顶
        $item['no_top_zh'] = $noTopZh;  //不置顶的中文
        $info = "置顶时长：".$item['top_total']."天，开始时间：".date("Y-m-d H:i:s",$item['top_start'])."，结束时间：".date("Y-m-d H:i:s",$item['top_end']);
        if($noTopZh){
            $info .= "，不置顶日：";
            $info .= join(",",$noTopZh);
        }
        $item['info'] = $info;
        return $item;
    }

    /**
     * 置顶职位列表
     */
    public function top_job_list(){
        global $dsql;
        $time = time();
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $sql = $dsql::SetQuery("select * from `#@__job_top_recode` where `cid`=$cid AND `top_end`>=$time");
        $arrList = $dsql->getArrList($sql);
        if(empty($arrList)){
            return array("state"=>200,"info"=>"暂无相关信息");
        }
        $NN = date("N");
        foreach ($arrList as & $item){
            $item['id'] = (int)$item['id'];
            $item['top_total'] = (int)$item['top_total'];
            $item['pid'] = (int)$item['pid'];
            $item['cid'] = (int)$item['cid'];
            $item['top_start'] = (int)$item['top_start'];
            $item['top_end'] = (int)$item['top_end'];
            $item['use_combo'] = (int)$item['use_combo'];
            $item['use_package'] = (int)$item['use_package'];
            $item['pubdate'] = (int)$item['pubdate'];
            //没开始
            if($item['top_start'] > $time){
                $item['state'] = 0;
            }
            //已经开始
            else{
                $noTopArr = explode(",",$item['no_top']);
                //不置顶日
                if(in_array($NN,$noTopArr)){
                    $item['state'] = 0;
                }else{
                    $item['state'] = 1;
                }
            }
            //置顶剩余计算
            $item['top_less'] = $this->countTopLess($item);
            //获取职位名称
            $sql = $dsql::SetQuery("select `title`,`click` from `#@__job_post` where `id`=".$item['pid']);
            $postDetail = $dsql->getArr($sql);
            $item['title'] = $postDetail['title'];
            $item['click'] = (int)$postDetail['click'];
            $item['no_top'] = empty($item['no_top']) ? array() : json_decode("[".$item['no_top']."]",true);
            //投递量
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `pid`=".$item['pid']);
            $item['td'] = (int)$dsql->getOne($sql);
            //统计被收藏量
            $sql = $dsql->SetQuery("SELECT count(*) FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'job' AND `aid` =".$item['id']);
            $item['collect'] = (int)$dsql->getOne($sql);;
        }
        unset($item);
        return $arrList;
    }


    /**
     * 置顶记录
     */
    public function top_log_list(){
        global $dsql;

        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $time = time();
        $NN = date("N");
        $where = "";

        $start_time = $param['start_time'];
        //匹配时间段1
        if($start_time!=""){
            $where .= " AND (t.`top_start`>=$start_time OR t.`top_end`<=$start_time)";
        }
        $end_time = $param['end_time'];
        //匹配时间段2
        if($end_time!=""){
            $where .= " AND (t.`top_start`>=$end_time OR t.`top_end`<=$end_time)";
        }

        //状态筛选
        $state = $param['state']; // {1.未结束、2.已结束}
        if($state!=""){
            if($state==1){ //未结束
                $where .= " AND t.`top_end`>$time";
            }
            //已结束
            else{
                $where .= " AND t.`top_end`<=$time";
            }
        }

        $orderby = $param['orderby'] ?: 1;  //排序 {1.正序，2.倒序}
        if($orderby==2){
            $where .= " order by t.`pubdate` desc";
        }else{
            $where .= " order by t.`pubdate` asc";
        }
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 30;
        $sql = $dsql::SetQuery("select t.*,p.`title` from `#@__job_top_recode` t LEFT JOIN `#@__job_post` p ON t.`pid`=p.`id` where t.`cid`=$cid".$where);
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $item['top_total'] = (int)$item['top_total'];
            $item['pid'] = (int)$item['pid'];
            $item['cid'] = (int)$item['cid'];
            $item['top_start'] = (int)$item['top_start'];
            $item['top_end'] = (int)$item['top_end'];
            //如果当前时间大于结束时间，已结束
            if($item['top_end']<=$time){
                $item['state'] = 2;
            }
            //未结束
            else{
                //没开始
                if($item['top_start'] > $time){
                    $item['state'] = 0;
                }
                //已经开始
                else{
                    $noTopArr = explode(",",$item['no_top']);
                    //不置顶日
                    if(in_array($NN,$noTopArr)){
                       $item['state'] = 0;
                    }else{
                        $item['state'] = 1;
                    }
                }
            }
            $item['no_top'] = empty($item['no_top']) ? array() : json_decode("[".$item['no_top']."]",true);
            $item['pubdate'] = (int)$item['pubdate'];
            $item['use_combo'] = (int)$item['use_combo'];
            $item['use_package'] = (int)$item['use_package'];
        }
        unset($item);
        return $pageObj;
    }


    /**
     * 智能刷新职位列表
     */
    public function smarty_refresh_list(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        //一次获取所有的智能刷新
        $sql = $dsql::SetQuery("select r.* from `#@__job_refresh_record` r where `cid`=$cid and `type`=2 and `less`<`refresh_count`");
        $arrList = $dsql->getArrList($sql);
        if(empty($arrList)){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        $arr_count = count($arrList);

        $newArrlist = array();
        //遍历，如果是多个职位，则变成多条数据
        for ($i=0;$i<$arr_count;$i++){
            $posts = $arrList[$i]['posts'];
            $posts = explode(",",$posts);
            //说明是多个职位一起智能刷新
            if(count($posts)>1){
                //生成多条记录
                $item = $arrList[$i];
                foreach ($posts as $post){
                    $item['posts'] = $post;
                    $newArrlist[] = $item;
                }
            }
            //单个职位刷新
            else{
                $newArrlist[] = $arrList[$i];
            }
        }
        //处理数据
        foreach ($newArrlist as & $item){
            $item['id'] = (int)$item['id'];
            $item['refresh_count'] = (int)$item['refresh_count'];
            $item['interval'] = (int)$item['interval'];
            $item['start_date'] = (int)$item['start_date'];
            $item['end_date'] = (int)$item['end_date'];
            $item['type'] = (int)$item['type'];
            $item['posts'] = (int)$item['posts'];
            $item['pubdate'] = (int)$item['pubdate'];
            //剩余多少次
            $item['less'] = (int)($item['refresh_count']-$item['less']);
            //上次刷新时间
            $item['last'] = (int)$item['last'];
            //下一次将要刷新的时间
            $item['next'] = (int)$item['next'];
            $item['cid'] = (int)$item['cid'];
            unset($item['use_combo']);
            unset($item['use_package']);
            $sql = $dsql::SetQuery("select `title` from `#@__job_post` where `id`=".$item['posts']);
            $item['posts_name'] = $dsql->getOne($sql);
            $urlParam = array(
                'service'=>'job',
                'action'=>'job',
                'id'=>$item['posts']
            );
            $item["url"] = getUrlPath($urlParam);
        }
        unset($item);
        return $newArrlist;
    }


    /**
     * 获取指定职位的智能刷新记录
    */
    public function getSmartyRefresh($pid){
        global $dsql;
        $sql = $dsql::SetQuery("select r.`id`,r.`refresh_count`,r.`interval`,r.`start_date`,r.`end_date`,r.`last`,r.`less`,r.`next`,r.`limit_start`,r.`limit_end` from `#@__job_refresh_record` r where `type`=2 and FIND_IN_SET($pid,`posts`) order by `id` desc limit 1");
        $arr = $dsql->getArr($sql);
        if(empty($arr)){
            return array();
        }else{
            $info = "";
            if($arr['less']!=0){
                $info .= "上次刷新：".date("Y-m-d H:i",$arr['last'])."，";
            };
            $arr['id'] = (int)$arr['id'];
            $arr['refresh_count'] = (int)$arr['refresh_count'];
            $arr['interval'] = (int)$arr['interval'];
            $arr['start_date'] = (int)$arr['start_date'];
            $arr['end_date'] = (int)$arr['end_date'];
            //剩余多少次
            $info .= "下次刷新：".date("Y-m-d H:i",$arr['next'])."，开始时间：".date("Y-m-d",$arr['start_date'])." ".$arr['limit_start']."，结束时间：".date("Y-m-d",$arr['end_date'])." ".$arr['limit_end'];
            $arr['less'] = (int)($arr['refresh_count']-$arr['less']);
            $info .= "，刷新统计：剩余".$arr['less']."次/共".$arr['refresh_count']."次";
            //上次刷新时间
            $arr['last'] = (int)$arr['last'];
            //下一次将要刷新的时间
            $arr['next'] = (int)$arr['next'];
            //短提示
            $arr['info'] = $info;
        }
        return $arr;
    }

    /**
     * 获取刷新记录
     */
    public function refresh_log(){
        global $dsql;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }

        $param = $this->param;
        $page  = $param['page'] ?: 1;
        $pageSize  = $param['pageSize'] ?: 30;
        $where = "";

        //类型
        $type = (int)$param['type'];
        if(!empty($type)){
            $where .= " AND g.`type`=$type";
        }
        //状态
        $state = $param['state'];
        if($state!=""){
            //刷新中
            if($state==1){
                $where .= " AND r.`less`<r.`refresh_count`";
            }
            if($state==2){
                $where .= " AND r.`less`=r.`refresh_count`";
            }
        }

        //开始时间和结束时间
        $start_time = $param['start_time'];
        if($start_time!=""){
            $where .= " AND g.`pubdate`>=$start_time";
        }
        $end_time = $param['end_time'];
        if($end_time!=""){
            $where .= " AND g.`pubdate`<=$end_time";
        }

        //排序
        $orderby = $param['orderby'] ?: 1;
        if($orderby==1){
            $where .= " order by g.`pubdate` asc";
        }
        elseif($orderby==2){
            $where .= " order by g.`pubdate` desc";
        }
        $sql = $dsql::SetQuery("select g.*,p.`title`,p.`nature`,r.`less`,r.`refresh_count` from `#@__job_refresh_log` g LEFT JOIN `#@__job_post` p ON g.`pid`=p.`id` LEFT JOIN `#@__job_refresh_record` r ON g.`rid`=r.`id` where g.`cid`=$cid" . $where);
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }

        $natureArr = array('', '全职', '兼职', '实习/校招', '假期工');
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $item['cid'] = (int)$item['cid'];
            $item['pid'] = (int)$item['pid'];
            $item['type'] = (int)$item['type'];
            $item['nature'] = (int)$item['nature'];
            $item['nature_name'] = $natureArr[$item['nature']];
            $item['pubdate'] = (int)$item['pubdate'];
            $item['current'] = (int)$item['current'];
            $item['total'] = (int)$item['total'];
            if($item['less']<$item['refresh_count']){ //未完成
                $item['state'] = 1;
            }else{  //已完成
                $item['state'] = 2;
            }
            unset($item['rid']);
            unset($item['less']);
            unset($item['refresh_count']);
        }
        unset($item);
        return $pageObj;
    }


    /**
     * 增加、编辑普工
     */
    public function aePg()
    {
        global $dsql;
        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }
        $param = $this->param;
        $id = (int)$param['id'];
        $cityid = $this->param['cityid'];
        if(empty($cityid)){
            return array("state"=>200,"info"=>"请传递cityid");
        }
        $job = $param['job'];
        if(empty($job)){
            return array("state"=>200,"info"=>"请选择职位");
        }
        if(is_array($job)){
            $job = join(",",$job);
        }
        $min_salary = (int)$param['min_salary'];
        $max_salary = (int)$param['max_salary'];
        if(empty($min_salary) && empty($max_salary)){
            return array("state"=>200,"info"=>"请填写薪资");
        }
        // if(empty($max_salary)){
        //     return array("state"=>200,"info"=>"请填写最高薪资");
        // }
        $salary_type = $param['salary_type'];
        if($salary_type!=1 && $salary_type!=2){
            return array("state"=>200,"info"=>"请指定正确的薪资类型");
        }
        $valid = (int)$param['valid'];
        $valid_end = (int)$param['valid_end']; //有效期截至时间
        $pubdate = time();

        $company = trim($param['company']);  //公司名称
        if(empty($company)){
            return array("state"=>200,"info"=>"请填写实际工作的公司名称");
        }

        $addrid = (int)$param['addrid'];
        if(empty($addrid)){
            return array("state"=>200,"info"=>"请选择工作地址");
        }
        $address = $param['address'] ?: "";  //选填
        $title = $param['title'];
        if(empty($title)){
            return array("state"=>200,"info"=>"请填写标题");
        }
        $lnglat = $param['lnglat'] ?: "";
        if(!empty($lnglat)){
            $lnglat = explode(",",$lnglat);
            $lng = $lnglat[0];
            $lat = $lnglat[1];
        }else{
            $lng = "";
            $lat = "";
        }
        $description = $param['description'] ?: "";
        $nature = $param['nature'];
        if($nature!=1 && $nature!=2){
            return array("state"=>200,"info"=>"请指定招聘性质");
        }
        $min_age = (int)$param['min_age'];
        $max_age = (int)$param['max_age'];
        $education = (int)$param['education'];
        $experience = (int)$param['experience'];
        $welfare = $param['welfare'];
        if(is_array($welfare)){
            $welfare = join(",",$welfare);
        }
        $number = (int)$param['number'];

        $nickname = $param['nickname'];
        if(empty($nickname)){
            return array("state"=>200,"info"=>"请填写姓名");
        }
        $phone = $param['phone'];
        $phone_login = (int)$param['phone_login'];
        $area_code = (int)$param['area_code'];
        if(empty($area_code)){
            return array("state"=>200,"info"=>"缺少区号");
        }
        $ip = GetIP();
        //是否验证手机号？
        $checkPhone = false;
        // if(empty($id)){
        //     $checkPhone = true;
        // }else{
            global $userLogin;
            //校验会员中心的手机号码，是否和该号码一致，并且已验证
            $memberInfo = $userLogin->getMemberInfo();
            $uPhone = $memberInfo['phone'];
            $uPhoneCheck = $memberInfo['phoneCheck'];
            //如果新旧手机号码不一致，则要验证新手机号码
            $oldPhone = $dsql::SetQuery("select `phone` from `#@__job_pg` where `id`=$id");
            $oldPhone = $dsql->getOne($oldPhone);
            if(($oldPhone!=$phone && $uPhone!=$phone) || ($uPhone==$phone && !$uPhoneCheck)){
                $checkPhone = true;
            }
        // }
        if($checkPhone){
            $vercode  = $param['vercode'];
            if(!$vercode){
                return array("state"=>200,"info"=>"请输入验证码");
            }
            $sql_code = $dsql->SetQuery("SELECT `code` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$phone' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->getOne($sql_code);
            if (strtolower($vercode) != $res_code) {
                return array ('state' => 200, 'info' => "验证码输入错误，请重试！");
            }
        }
        require(HUONIAOINC."/config/job.inc.php");
        global $custom_fabuCheck;
        $adminState = $custom_fabuCheck;
        //新增
        if(empty($id)){
            $sql = $dsql::SetQuery("insert into `#@__job_pg`(`userid`,`cityid`,`job`,`min_salary`,`max_salary`,`number`,`valid`,`valid_end`,`pubdate`,`company`,`addrid`,`address`,`lng`,`lat`,`title`,`description`,`min_age`,`max_age`,`education`,`experience`,`welfare`,`nickname`,`phone`,`phone_login`,`nature`,`salary_type`,`area_code`,`state`) values($userid,$cityid,'$job',$min_salary,$max_salary,'$number',$valid,$valid_end,$pubdate,'$company',$addrid,'$address','$lng','$lat','$title','$description',$min_age,$max_age,$education,$experience,'$welfare','$nickname','$phone',$phone_login,$nature,$salary_type,$area_code,$adminState)");
            $up = $dsql->dsqlOper($sql,"lastid");
            if(is_numeric($up)){
                $this->pgCompanyActive();
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'general-detailzg',
                    'id'=>$up
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'pg', $up, 'insert', '新增普工('.$title.')', $url, $sql);
                return array("state"=>100,"info"=>"操作成功","aid"=>$up);
            }
        }
        //更新
        else{
            $sql = $dsql::SetQuery("update `#@__job_pg` set `cityid`=$cityid,`job`='$job',`min_salary`=$min_salary,`max_salary`=$max_salary,`valid`=$valid,`valid_end`=$valid_end,`company`='$company',`addrid`=$addrid,`address`='$address',`lng`='$lng',`lat`='$lat',`title`='$title',`description`='$description',`min_age`=$min_age,`max_age`=$max_age,`education`=$education,`experience`=$experience,`welfare`='$welfare',`nickname`='$nickname',`phone`='$phone',`phone_login`=$phone_login,`nature`=$nature,`salary_type`=$salary_type,`area_code`=$area_code,`state`=$adminState,`number`='$number',`pubdate`='$pubdate' where `id`=$id and (`userid`=$userid or `phone`='$oldPhone')");
            $up = $dsql->update($sql);
            if($up=="ok"){
                $this->pgCompanyActive();
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'general-detailzg',
                    'id'=>$id
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'pg', $id, 'update', '更新普工('.$title.')', $url, $sql);
                return "操作成功";
            }
        }
        return array("state"=>200,"info"=>"操作失败，请检查字段");
    }

    /**
     * 记录普工公司相关信息
     */
    public function pgCompanyActive(){
        global $dsql;
        //判断是否为企业
        $cid = $this->getCid();
        if(!is_array($cid)){
            //记录最后一次活跃的时间
            $time = time();
            $sql = $dsql::SetQuery("update `#@__job_company` set `pgactive`=$time where `id`=$cid");
            $dsql->update($sql);
        }
    }


    /**
     * 校验支付金额
     */
    public function checkPayAmount(){
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid<1){
            return array("state"=>200,"info"=>"请登录");
        }
        $param = $this->param;
        $ordernum = $param['ordernum'];
        $paytype = $param['paytype'];
        $paypwd  = $param['paypwd'];
        if(!$ordernum){
            return array("state"=>200,"info"=>"缺少订单号");
        }
        //验证订单支付状态
        $sql = $dsql::SetQuery("select * from `#@__job_order` where `ordernum`='$ordernum'");
        $orderArr = $dsql->getArr($sql);
        if(empty($orderArr)){
            return array("state"=>200,"info"=>"订单不存在");
        }
        if($orderArr['orderstate']!=0){
            return array("state"=>200,"info"=>"订单状态异常，不可支付");
        }
        if($orderArr['type']==4){
            $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
            $body = $dsql->getOne($sql);
            $body = unserialize($body);
            //调用校验方法
            $this->param = array(
                'pid'=>$body['id'],
                'top_date'=>$body['top_date'],
                'noTopDay'=>$body['noTopDay']
            );

            $countRes = $this->countTopAmount($body['cid']);
            if($countRes['amount']!=$orderArr['amount']){
                return array("state"=>200,"info"=>"套餐或增值包资源抵扣不足，请重新下单");
            }

            //恢复表单参数
            $this->param = $param;
        }
        //如果订单类型是5（职位刷新），应该取出下单参数（pay_log ['body']），再重新计算金额，如果金额前后不一致，则响应失败（因为涉及了套餐免费额度）
        elseif($orderArr['type']==5){
            $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
            $body = $dsql->getOne($sql);
            $body = unserialize($body);

            //调用校验方法
            $this->param = array(
                'pid'=>$body['aid'],
                'refresh_type'=>$body['refresh_type'],
                'start_date'=>$body['start_date'],
                'end_date'=>$body['end_date'],
                'interval'=>$body['interval'],
                'limit_start'=>$body['limit_start'],
                'limit_end'=>$body['limit_end'],
                'next'=>$body['next']
            );
            $countRes = $this->countRefreshAmount($body['cid']);
            if($countRes['amount']!=$orderArr['amount']){
                return array("state"=>200,"info"=>"套餐或增值包资源抵扣不足，请重新下单");
            }

            //恢复表单参数
            $this->param = $param;
        }

        //取得应该支付的金额
        $money = (float)$orderArr['amount'];

        //如果是余额支付，校验余额是否充足
        if($paytype=="money"){
            if (empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");
            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `paypwd`,`money` FROM `#@__member` WHERE `id` = $uid");
            $userArr  = $dsql->getArr($archives);
            $hash     = $userLogin->_getSaltedHash($paypwd, $userArr['paypwd']);
            if ($userArr['paypwd'] != $hash) return array("state" => 200, "info" => "支付密码输入错误，请重试！");
            //比较余额
            if($userArr['money']<$money) return array("state"=>200,"info"=>"账户余额不足");
        }
        return sprintf("%.2f", $money);
    }


    /**
     * 支付成功
     */
    public function paySuccess(){
        global $dsql;

        $param = $this->param;
        //非法参数
        if (empty($param)) {
            return false;
        }
        $paytype  = $param['paytype'];
        $ordernum = $param['ordernum'];
        if(empty($paytype) || empty($ordernum)){
            return false;
        }
        //查询订单信息
        $sql = $dsql::SetQuery("select * from `#@__job_order` where `ordernum`='$ordernum'");
        $arr = $dsql->getArr($sql);
        if(empty($arr)){
            return array("state"=>200,"info"=>"订单号有误");
        }
        //是否已经更新过？
        if($arr['paydate']){
            return false;
        }
        $time = time();
        //更新 job_order 表
        $sql = $dsql::SetQuery("update `#@__job_order` set `paydate`=$time,`paytype`='$paytype',`orderstate`=1 where `ordernum`='$ordernum'");
        $up1 = $dsql->update($sql);
        //更新pay_log表的状态
        $sql = $dsql::SetQuery("update `#@__pay_log` set `state`=1,`paytype`='$paytype' where `ordernum`='$ordernum'");
        $up2 = $dsql->update($sql);
        //判断 type 是什么类型，增加已购买的数量

        //取得商家id
        $sql = $dsql::SetQuery("select `id` from `#@__job_company` where `userid`={$arr['uid']}");
        $cid = (int)$dsql->getOne($sql);

        //取得商家具体信息（包括现有套餐）
        $this->param = array();
        $this->param['id'] = $cid;
        clearCache("job_company_detail", $cid);
        $company = $this->companyDetail();
        
        if($arr['type']==1){
            //更新套餐表的购买数量
            $sql = $dsql::SetQuery("update `#@__job_combo` set `buy`=`buy`+1 where `id`={$arr['aid']}");
            $up3 = $dsql->update($sql);
            //取得套餐信息
            $sql = $dsql::SetQuery("select * from `#@__job_combo` where `id`={$arr['aid']}");
            $combo = $dsql->getArr($sql);

            //判断套餐过期时间，如果已经过期？（从未开通过，也同理）
            if($company['combo_enddate'] < $time && $company['combo_enddate']!=-1){
                //把套餐信息存入company中
                $enddate = $combo['valid']==-1 ? -1 : ($time + 86400 * $combo['valid']);
                $sql = $dsql::SetQuery("update `#@__job_company` set `combo_id`={$combo['id']},`combo_enddate`=$enddate,`combo_job`={$combo['job']},`combo_resume`={$combo['resume']},`combo_refresh`={$combo['refresh']},`combo_top`={$combo['top']} where `userid`={$arr['uid']}");
                $up4 = $dsql->update($sql);
            }
            //已有套餐，且套餐相同（续费）
            elseif($company['combo_id']==$arr['aid']){
                //置顶时长相加，套餐过期时间相加【永久除外】
                $valid = $combo['valid']==-1 ? 0 : 86400 * $combo['valid'];
                $sql = $dsql::SetQuery("update `#@__job_company` set `combo_enddate`=`combo_enddate`+$valid,`combo_top`=`combo_top`+{$combo['top']} where `userid`={$arr['uid']}");
                $up4 = $dsql->update($sql);
            }
            //新套餐与原套餐不同，新套餐立即生效，原套餐封存、如果新套餐比旧套餐更少，则按时间倒序保留最新的n个套餐
            else{
                //新套餐立即生效，封存原套餐（什么时候取出封存数据？也就是套餐过期后(具体在哪不确定，应该是companyDetail每次获取时检测一下)，尝试取出封存数据）
                $combo_wait = array();
                $combo_wait['id'] = $company['combo_id'];
                $combo_wait['enddate'] = $company['combo_enddate']==-1 ? -1 : ($company['combo_enddate'] + 86400 * $combo['valid']); //旧套餐的有效期，延长当前套餐的天数
                $combo_wait['job'] = $company['combo_job'];
                $combo_wait['resume'] = $company['combo_resume'];
                $combo_wait['refresh'] = $company['combo_refresh'];
                $combo_wait['top'] = $company['combo_top'];
                $sql = $dsql::SetQuery("select `title` from `#@__job_combo` where `id`={$combo_wait['id']}");
                $combo_wait['title'] = $dsql->getOne($sql);
                $combo_wait = json_encode($combo_wait,256);
                $enddate = $combo['valid']==-1 ? -1 : ($time + 86400 * $combo['valid']);
                $sql = $dsql::SetQuery("update `#@__job_company` set `combo_id`={$combo['id']},`combo_enddate`=$enddate,`combo_job`={$combo['job']},`combo_resume`={$combo['resume']},`combo_refresh`={$combo['refresh']},`combo_top`={$combo['top']},`combo_wait`='$combo_wait' where `userid`={$arr['uid']}");
                $up4 = $dsql->update($sql);
                //如果旧套餐比新套餐更少，则按发布时间保留n个职位，其余的下架处理
                if($combo['job']<$company['combo_job'] && $combo['job']!=-1){
                    //找出职位列表，按时间倒序，取现有套餐的个数的 id 列表
                    $postSql = $dsql::SetQuery("select `id` from `#@__job_post` where `company`=$cid and `off`=0 and `del`=0 order by `pubdate` desc limit {$combo['job']}");
                    $postId = $dsql->getArr($postSql);
                    //把属于该公司的、不在这些 id 列表的数据全部下架
                    $where = " AND `company`=$cid";
                    if($postId){
                        $where .= " AND `id` not in(".join(",",$postId).")";
                    }
                    $sql = $dsql::SetQuery("update `#@__job_post` set `off`=1,`offdate`=".GetMkTime(time())." where 1=1".$where);
                    $up5 = $dsql->update($sql);
                }
            }
            clearCache("job_company_detail", $cid);
        }
        elseif($arr['type']==2){
            //更新增值包的购买数量
            $sql = $dsql::SetQuery("update `#@__job_package` set `buy`=`buy`+1 where `id`={$arr['aid']}");
            $up3 = $dsql->update($sql);
            //取得增值包信息，把增值包信息加到商家中
            $sql = $dsql::SetQuery("select * from `#@__job_package` where `id`={$arr['aid']}");
            $package = $dsql->getArr($sql);

            $sql = $dsql::SetQuery("update `#@__job_company` set `package_job`=`package_job`+{$package['job']},`package_resume`=`package_resume`+{$package['resume']},`package_refresh`=`package_refresh`+{$package['refresh']},`package_top`=`package_top`+{$package['top']}  where `userid`={$arr['uid']}");
            $up4 = $dsql->update($sql);

            clearCache("job_company_detail", $cid);
        }
        elseif($arr['type']==3){
            //加入到简历下载表中
            $sql = $dsql::SetQuery("insert into `#@__job_resume_download`(`rid`,`cid`,`delivery`,`use_combo`,`pubdate`) values({$arr['aid']},$cid,0,0,$time)");
            $up1 = $dsql->update($sql);
            //取出body，查看是否需要发送到邮箱
            $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
            $body = $dsql->getOne($sql);
            $body = unserialize($body);
            //是否需要发送邮件？
            if($body['postEmail']==1){
                global $userLogin;
                $userInfo = $userLogin->getMemberInfo();
                $email = $dsql->getOne($dsql::SetQuery("select `email` from `#@__job_company` where `userid`=".$userInfo['userid']));
                //发送简历到邮箱中
                global $huoniaoTag;
                if(is_null($huoniaoTag)){
                    $huoniaoTag = initTemplateTag();
                }
                global $cfg_staticPath;
                $huoniaoTag->assign("cfg_staticPath",$cfg_staticPath);
                $host = $huoniaoTag->tpl_vars["cfg_currentHost"]->value;  //域名
                $huoniaoTag->assign("templets_skin",$host."/templates/poster/job/resume/skin1/");
                $html = $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/header.html');
                $handlers = new handlers("job","resumeDetail");
                $res = $handlers->getHandle(array("id"=>$arr['aid']));
                $res = $res['info'];
                foreach ($res as $key => $item){
                    $huoniaoTag->assign("detail_".$key, $item);
                }
                $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/body.html');
                $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/footer.html');
                $pdf = strToPdf($html) ?: array();

                $html = addslashes($html);  // 加反义，否则无法存到数据库

                if($pdf && is_array($pdf)){
                    $sql = $dsql::SetQuery("select `name` from `#@__job_resume` where `id`=".$arr['aid']);
                    $name = $dsql->getOne($sql);
                    global $cfg_shortname;
                    $send = sendmail($email, $name . "的简历【".$cfg_shortname."】","<small>请直接在附件中下载</small>",array("attaches"=>array(array("path"=>$pdf['path'],"name"=>$name."的简历.pdf"))));
                    //如果发送成功，记录日志等（成功时无return）
                    if(empty($send)){
                        unlinkFile($pdf['path']);
                        messageLog("email", "resume", $email, "简历下载", $html, $arr['uid'], 0, "");
                    }
                    //发送失败，记录失败邮件日志。
                    else{
                        messageLog("email", "resume", $email, "简历下载", $html, $arr['uid'], 1, "");
                    }
                }
            }
        }
        elseif($arr['type']==4){//置顶

            $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
            $body = $dsql->getOne($sql);
            $body = unserialize($body);

            //添加记录
            $sql = $dsql::SetQuery("insert into `#@__job_top_recode`(`top_total`,`pid`,`cid`,`top_start`,`top_end`,`no_top`,`use_combo`,`use_package`,`pubdate`,`ordernum`) values({$body['top_date']},{$body['id']},{$body['cid']},{$body['top_start']},{$body['top_end']},'{$body['noTopDay']}',{$body['use_combo']},{$body['use_package']},$time,'{$ordernum}')");
            $dsql->update($sql);

            //一次性扣除资源
            $sql = $dsql::SetQuery("update `#@__job_company` set `combo_top`=`combo_top`-{$body['use_combo']},`package_top`=`package_top`-{$body['use_package']} where `id`={$body['cid']}");
            $dsql->update($sql);
            //由计划任务执行置顶
            
            clearCache("job_company_detail", $cid);
        }
        elseif($arr['type']==5){//刷新

            $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
            $body = $dsql->getOne($sql);
            $body = unserialize($body);

            //调用校验方法
            $this->param = array(
                'pid'=>$body['aid'],
                'refresh_type'=>$body['refresh_type'],
                'start_date'=>$body['start_date'],
                'end_date'=>$body['end_date'],
                'interval'=>$body['interval'],
                'limit_start'=>$body['limit_start'],
                'limit_end'=>$body['limit_end'],
            );

            if($body['aid'] == 'undefined'){
                return false;
            }

            //记录套餐资源消耗
            $start_date = (int)strtotime($body['start_date']);
            $end_date = (int)strtotime($body['end_date']);
            $sql = $dsql::SetQuery("insert into `#@__job_refresh_record`(`refresh_count`,`interval`,`start_date`,`end_date`,`limit_start`,`limit_end`,`type`,`use_combo`,`use_package`,`pubdate`,`cid`,`posts`,`next`,`ordernum`) values({$body['count']},{$body['interval']},$start_date,$end_date,'{$body['limit_start']}','{$body['limit_end']}',{$body['refresh_type']},{$body['use_combo']},{$body['use_package']},$time,{$body['cid']},'{$body['aid']}',{$body['next']},'{$ordernum}')");
            $dsql->update($sql);

            //一次性扣除增值包资源
            $sql = $dsql::SetQuery("update `#@__job_company` set `package_refresh`=`package_refresh`-{$body['use_package']} where `id`={$body['cid']}");
            $dsql->update($sql);

            clearCache("job_company_detail", $cid);

            //刷新职位
            $pids = $body['aid'];
            //普通刷新，更新pubdate
            if($body['refresh_type']==1){
                $sql = $dsql::SetQuery("update `#@__job_post` set `update_time`=$time where `company`={$body['cid']} and `id` in($pids)");
                $dsql->update($sql);
                //立刻记录成功信息
                $pids = explode(",",$pids);
                foreach ($pids as $pid){
                    $sql = $dsql::SetQuery("insert into `#@__job_refresh_log`(`pid`,`type`,`pubdate`) values($pid,{$body['refresh_type']},$time)");
                    $dsql->update($sql);
                }
            }
            //如果是智能刷新，还需要记录正在智能刷新的状态
            else{
                $sql = $dsql::SetQuery("update `#@__job_post` set `is_refreshing`=1,`pubdate`=$time where `company`={$body['cid']} and `id` in($pids)");
                $dsql->update($sql);
                //计划任务中执行刷新，并非立刻刷新
            }
        }
        elseif($arr['type']==6){ //职位
            //取出职位数、cid
            $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
            $body = $dsql->getOne($sql);
            $body = unserialize($body);
            $sql = $dsql::SetQuery("update `#@__job_company` set `package_job`=`package_job`+{$body['num']} where `id`={$body['cid']}");
            $dsql->update($sql);

            clearCache("job_company_detail", $cid);
        }
        //增加分站、平台收入记录【type为1，2，3，4，5，6均为商家，取商家cityid】
        $fzMoney = 0;
        $ptMoney = $arr['amount'];  //默认全是平台收入
        // 尝试计算分站管理员佣金
        if(in_array($arr['type'],array(1,2,3,4,5,6))){
            global $cfg_fzjobFee;
            $cfg_fzjobFee = (float)$cfg_fzjobFee;  //强制float
            $sql = $dsql::SetQuery("select `cityid` from `#@__job_company` where `userid`=".$arr['uid']);
            $cityid = (int)$dsql->getOne($sql);
            //查询该分站是否存在
            $sql = $dsql::SetQuery("select `id` from `#@__site_city` where `cid`=$cityid");
            $cityid = (int)$dsql->getOne($sql);
            //分钱给分站
            if(!empty($cityid)){
                $fzMoney = sprintf('%.2f',($ptMoney * $cfg_fzjobFee)/100);  //分站按比例取得金额
                //平台佣金 -= 分站佣金
                $ptMoney -= $fzMoney;
            }
        }

        //取得cityid
        $sql = $dsql::SetQuery("select `cityid` from `#@__member` where `id`={$arr['uid']}");
        $cityid = (int)$dsql->getOne($sql);

        //更新分站余额
        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fzMoney' WHERE `cid` = '$cityid'");
        $dsql->dsqlOper($fzarchives, "update");

        //取得subject
        $sql = $dsql::SetQuery("select `param_data` from `#@__pay_log` where `ordernum`={$arr['ordernum']}");
        $param_data = $dsql->getOne($sql);
        $param_data = unserialize($param_data);
        $subject = $param_data['subject'];

        //保存操作日志平台
        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('{$arr['uid']}', '1', '{$arr['amount']}', '{$subject}：{$arr['ordernum']}', '$time','$cityid','$fzMoney','job',$ptMoney,'1','shangpinxiaoshou','{$arr['ordernum']}')");
        $lastid = $dsql->dsqlOper($archives, "lastid");
        substationAmount($lastid,$cityid);
    }


    /**
     * 下单
     */
    public function deal(){
        global $dsql;
        $param = $this->param;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if(empty($uid)){
            return array("state"=>200,"info"=>"请先登录");
        }
        //订单类型 {1.套餐，2.增值包，3.简历下载，4.职位置顶，5.职位刷新，6.职位上架}
        $type = $param['type'];
        $comboid = $param['comboid'];
        $packageid = $param['packageid'];
        $onlyBuy = (int)$param['onlyBuy'];

        $body = array();  //一个空的参数存放

        //根据不同的类型，进行不同的处理
        if($type==1){
            if(empty($comboid)){
                return array("state"=>200,"info"=>"缺少参数：comboid");
            }
            //根据套餐id，取得套餐信息
            $sql = $dsql::SetQuery("select `title`,`money` from `#@__job_combo` where `id`=$comboid");
            $comboArr = $dsql->getArr($sql);
            if(!is_array($comboArr) || empty($comboArr)){
                return array("state"=>200,"info"=>"错误！套餐不存在");
            }
            $price = (float)$comboArr['money'];  //金额
            $subject = "招聘套餐：".$comboArr['title'];  //标题

            $aid = $comboid;

        }elseif($type==2){
            //校验公司信息、以及必须已开通过套餐的情况下才可以
            $sql = $dsql::SetQuery("select `id`,`combo_id` from `#@__job_company` where `userid`=$uid");
            $storeArr = $dsql->getArr($sql);
            if(!$storeArr || !is_array($storeArr)){
                return array("state"=>200,"info"=>"公司信息不正常");
            }
            if(!$storeArr['combo_id']){
                return array("state"=>200,"info"=>"还未开通套餐"); //套餐过期是可以的，只要开通过一次
            }
            if(empty($packageid)){
                return array("state"=>200,"info"=>"缺少参数：packageid");
            }
            //根据增值包id，查询增值包信息
            $sql = $dsql::SetQuery("select `title`,`price` from `#@__job_package` where `id`=$packageid");
            $packageArr = $dsql->getArr($sql);
            if(!is_array($packageArr) || empty($packageArr)){
                return array("state"=>200,"info"=>"错误！增值包不存在");
            }
            $price = (float)$packageArr['price'];  //金额
            $subject = "招聘增值包：".$packageArr['title'];  //标题

            $aid = $packageid;

        }elseif($type==3){
            //判断是否为公司（个人不可购买简历）
            $cid = $this->getCid();
            if(is_array($cid)){
                return $cid;
            }
            //获取简历id（要下载的简历）
            $aid = $param['rid'];
            require(HUONIAOINC."/config/job.inc.php");
            $price = $customResume_down_fee;  //每一份金额多少钱？后台配置【不能配置是0，如果是0则会异常，不被允许配置为0】
            //判断简历是否存在
            $sql = $dsql::SetQuery("select * from `#@__job_resume` where `id`=$aid");
            $resumeArr = $dsql->getArr($sql);
            if(!$resumeArr || !is_array($resumeArr)){
                return array("state"=>200,"info"=>"简历不存在");
            }
            //先尝试直接下载，如果免费下载成功则直接返回
            $this->param = array("id"=>$param['rid'],"postEmail"=>$param['postEmail'],"local"=>$param['local'],"email"=>$param['email'],"onlyBuy"=>$param['onlyBuy']);
            $downLoadRes = $this->downloadResume();
            if(is_string($downLoadRes)){ //免费下载成功
                return $downLoadRes;
            }elseif($downLoadRes['type']!="pay"){ //其他错误，直接返回
                return $downLoadRes;
            }
            //正常购买
            $subject = "下载简历：".$resumeArr['name'];

            //校验是否已经购买过该简历（校验重复购买）
            $sql = $dsql::SetQuery("select * from `#@__job_resume_download` where `rid`=$aid and `cid`=$cid");
            $buyArr = $dsql->getArr($sql);
            if($buyArr and is_array($buyArr)){
                return array("state"=>200,"info"=>"您已购买该简历，不应重复下单");
            }
            //是否发送简历到邮箱
            $postEmail = $param['postEmail'];
            if($postEmail){
                //校验企业邮箱是否存在
                $userInfo = $userLogin->getMemberInfo();
                $email = $dsql->getOne($dsql::SetQuery("select `email` from `#@__job_company` where `userid`=".$userInfo['userid']));
                if(empty($email)){
                    if($onlyBuy){
                        $postEmail = 0;
                    }else{
                        return array("state"=>200,"info"=>"请先配置邮箱");
                    }
                }
            }
            $body['postEmail'] = $postEmail;
        }elseif($type==4){  //单独购买职位置顶

            //计算刷新置顶
            $topDetail = $this->countTopAmount();

            if($topDetail['state']==200){
                return $topDetail;
            }

            $subject = $topDetail['subject'];
            $price = $topDetail['amount'];
            $aid = $topDetail['pid'];
            $cid = $topDetail['cid'];

            //记录到 body 中
            $body['top_date'] = $topDetail['top_date'];
            $body['noTopDay'] = $topDetail['noTopDay'];
            $body['cid'] = $cid;
            $body['use_combo'] = $topDetail['use_combo'];
            $body['use_package'] = $topDetail['use_package'];
            $body['top_start'] = $topDetail['top_start'];
            $body['top_end'] = $topDetail['top_end'];
            $time = time();

            //如果免费置顶？直接成功
            if($price<=0){
                //虽然不用钱，也生成order记录【为了保持和支付同样的结构】
                $ordernum = create_ordernum();
                $time = time();
                $sql = $dsql::SetQuery("insert into `#@__job_order`(`uid`, `type`, `ordernum`, `orderdate`, `aid`, `amount`, `orderstate`, `paydate`, `paytype`) values($uid, 4, '$ordernum', $time, $aid, 0, 1, $time, 'money')");
                $dsql->update($sql);
                //info
                $postTitle = $dsql->getOne($dsql::SetQuery("select `title` from `#@__job_post` where `id` =".$aid));
                $subject = "职位置顶：".$postTitle;
                $paramData = array("service"=>"job","subject"=>$subject);
                $paramData = serialize($paramData);
                $sql = $dsql::SetQuery("insert into `#@__pay_log`(`ordertype`, `ordernum`, `uid`, `amount`, `paytype`, `state`, `pubdate`, `param_data`) values('job','$ordernum',$uid, 0, 'money', 1,$time,'$paramData')");
                $dsql->update($sql);
                //添加记录
                $sql = $dsql::SetQuery("insert into `#@__job_top_recode`(`top_total`,`pid`,`cid`,`top_start`,`top_end`,`no_top`,`use_combo`,`use_package`,`pubdate`,`ordernum`) values({$topDetail['top_date']},$aid,$cid,{$topDetail['top_start']},{$topDetail['top_end']},'{$topDetail['noTopDay']}',{$topDetail['use_combo']},{$topDetail['use_package']},$time,'$ordernum')");
                $dsql->update($sql);
                //一次性扣除资源
                $sql = $dsql::SetQuery("update `#@__job_company` set `combo_top`=`combo_top`-{$topDetail['use_combo']},`package_top`=`package_top`-{$topDetail['use_package']} where `id`=$cid");
                $dsql->update($sql);
                //置顶逻辑，开始置顶、结束置顶由计划任务控制，这里先直接返回
                return array("msg"=>"无需支付，且请求成功","type"=>"top","top_start"=>$topDetail['top_start']);
            }

        }elseif($type==5){ //单独购买职位刷新

            //调用计算刷新价格方法
            $refreshDetail = $this->countRefreshAmount();
            //如果失败
            if($refreshDetail['state']==200){
                return $refreshDetail;
            }
            if($refreshDetail['count']<=0){
                return array("state"=>200,"info"=>"选择错误，可刷新次数为0");
            }
            //获取计算详情
            $amount = $refreshDetail['amount'];  //总价格
            $refresh_type = $refreshDetail['type']=="plain" ? 1 : 2; //刷新类型
            $use_package = $refreshDetail['use_package'] ?: 0;  //消耗的增值包
            if($amount==0){ // 不用钱，直接成功
                $start_date = strtotime($refreshDetail['start_date']) ?: 0;
                $end_date = strtotime($refreshDetail['end_date']) ?: 0;
                $time = time();
                $ordernum = create_ordernum();
                $sql = $dsql::SetQuery("insert into `#@__job_order`(`uid`, `type`, `ordernum`, `orderdate`, `aid`, `amount`, `orderstate`, `paydate`, `paytype`) values($uid, 5, '$ordernum', $time, '{$refreshDetail['aid']}', 0, 1, $time, 'money')");
                $dsql->update($sql);
                //info
                $postTitle = $dsql->getOne($dsql::SetQuery("select `title` from `#@__job_post` where `id` in({$refreshDetail['aid']}) limit 1"));
                $subject = "职位刷新：".$postTitle;
                $aidArr = explode(",",$refreshDetail['aid']);
                if(count($aidArr)>1){
                    $subject .= "...等".count($aidArr)."个职位";
                }
                $paramData = array("service"=>"job","subject"=>$subject);
                $paramData = serialize($paramData);
                $sql = $dsql::SetQuery("insert into `#@__pay_log`(`ordertype`, `ordernum`, `uid`, `amount`, `paytype`, `state`, `pubdate`, `param_data`) values('job','$ordernum',$uid, 0, 'money', 1,$time,'$paramData')");
                $dsql->update($sql);
                //添加记录
                $sql = $dsql::SetQuery("insert into `#@__job_refresh_record`(`refresh_count`,`interval`,`start_date`,`end_date`,`limit_start`,`limit_end`,`type`,`use_combo`,`use_package`,`pubdate`,`cid`,`posts`,`next`,`ordernum`) values({$refreshDetail['count_one']},{$refreshDetail['interval']},$start_date,$end_date,'{$refreshDetail['limit_start']}','{$refreshDetail['limit_end']}',$refresh_type,{$refreshDetail['use_combo']},{$refreshDetail['use_package']},$time,{$refreshDetail['cid']},'{$refreshDetail['aid']}',{$refreshDetail['next']},'$ordernum')");
                $dsql->update($sql);
                //扣除增值包
                $sql = $dsql::SetQuery("update `#@__job_company` set `package_refresh`=`package_refresh`-$use_package where `id`={$refreshDetail['cid']}");
                $dsql->update($sql);
                //刷新职位
                $pids = $refreshDetail['aid'];
                //普通刷新，更新pubdate
                if($refresh_type==1){
                    $sql = $dsql::SetQuery("update `#@__job_post` set `update_time`=$time where `company`={$refreshDetail['cid']} and `id` in($pids)");
                    $dsql->update($sql);
                    //立刻记录成功信息
                    $pids = explode(",",$pids);
                    foreach ($pids as $pid){
                        $sql = $dsql::SetQuery("insert into `#@__job_refresh_log`(`cid`,`pid`,`type`,`pubdate`) values({$refreshDetail['cid']},$pid,$refresh_type,$time)");
                        $dsql->update($sql);
                    }
                }
                //如果是智能刷新，还需要记录正在智能刷新的状态
                else{
                    $sql = $dsql::SetQuery("update `#@__job_post` set `is_refreshing`=1,`pubdate`=$time where `company`={$refreshDetail['cid']} and `id` in($pids)");
                    $dsql->update($sql);
                    //计划任务中执行刷新，并非立刻刷新
                }
                return array("msg"=>"无需支付，且请求成功","next"=>$refreshDetail['next'],"next2"=>$refreshDetail['next2'],"type"=>"refresh");
            }
            $count = $refreshDetail['count'];  //刷新总次数
            $use_combo = $refreshDetail['use_combo'];  //消耗的套餐当日刷新量
            $aid = $refreshDetail['aid'];  //刷新的职位列表
            $body['aid'] = $aid;
            $interval = $refreshDetail['interval']; //刷新间隔
            $start_date = $refreshDetail['start_date']; //开始时间
            $end_date = $refreshDetail['end_date']; //结束时间
            $limit_start = $refreshDetail['limit_start']; //限制时间段开始
            $limit_end = $refreshDetail['limit_end']; //限制时间段结束
            $subject = $refreshDetail['subject']; //账单标题
            $cid = $refreshDetail['cid']; //公司id
            $price = $refreshDetail['amount']; //价格
            $next = $refreshDetail['next']; //下一次刷新的时间
            $next2 = $refreshDetail['next2']; //下两次刷新的时间
            $count_one = $refreshDetail['count_one']; //刷新次数（单职位）

            //记录到 body 中，以便订单完成后查看
            $body['refresh_type'] = $refresh_type;
            $body['interval'] = $interval;
            $body['count'] = $count;
            $body['use_combo'] = $use_combo;
            $body['use_package'] = $use_package;
            $body['start_date'] = $start_date;
            $body['end_date'] = $end_date;
            $body['limit_start'] = $limit_start;
            $body['limit_end'] = $limit_end;
            $body['cid'] = $cid;
            $body['next'] = $next;
            $body['next2'] = $next2;
            $body['count_one'] = $count_one;

            $aid = $refreshDetail['aid'];  //记录到 order 表中，

        }elseif($type==6){ //职位上架
            $num = (int)$param['num'];  //职位上架数
            if(empty($num)){
                return array("state"=>200,"info"=>"请指定职位上架数");
            }
            $cid = $this->getCid();
            if(is_array($cid)){
                return $cid;
            }
            require(HUONIAOINC."/config/job.inc.php");
            //获取配置的单项金额，并计算总价格
            $price = $customJob_fee * $num;  //金额
            $subject = "职位上架：".$num."个";  //标题
            $body['cid'] = $cid;
            $body['num'] = $num;
            $aid = 0;  //无需，因为买的是上架数量，而不是指定某个职位的上架

        }else{
            return array("state"=>200,"info"=>"参数值错误：type");
        }

        //再次校验金额不为0（应该在前面就直接返回，或直接成功而无需支付）
        if(!$price || $price<=0){
            return array("state"=>200,"info"=>"订单异常，金额为0");
        }

        //把一些必要的参数存在body中
        $body['service'] = "job";
        $body['type'] = $type;
        $body['id'] = $aid;

        //生成 ordernum
        $ordernum =  create_ordernum();
        // 插入记录到order表
        $time = time();
        $archives = $dsql->SetQuery("INSERT INTO `#@__job_order` (`ordernum`, `uid`, `type`, `amount`, `aid`, `orderdate`) VALUES ('$ordernum', '$uid',$type,$price,'$aid',$time)");
        $res = $dsql->dsqlOper($archives, "update");
        if ($res != "ok") {
            return array("state" => 200, "info" => "下单失败");
        }
        //生成支付订单（paytype 是空的，因为还没到下单）（createtype这里为1，第三方支付时为0）
        $payForm = createPayForm("job", $ordernum, $price, '', $subject, $body, 1);
        $payForm['timeout'] = time() + 1800;
        return $payForm;
    }

    /**
     * 计算置顶金额
     */
    public function countTopAmount($company=-1){
        global $dsql;

        //如果是传递的 cid
        if($company!=-1){
            $cid = $company;
        }
        //登录的cid
        else{
            $cid = $this->getCidCheck();
            if(is_array($cid)){
                return $cid;
            }
        }

        $param = $this->param;
        $return = array();

        $return['cid'] = $cid;

        $top_date = (int)$param['top_date']; //要置顶几天？
        $return['top_date'] = $top_date;
        if(empty($top_date)){
            return array("state"=>200,"info"=>"缺少置顶天数：top_date");
        }

        $noTopDay = $param['noTopDay'] ?: ""; //不置顶的时间（可选）（置顶消耗时可用）
        $return['noTopDay'] = $noTopDay;
        //判断是否全选 1-7 ？
        if($noTopDay){
            $noTopDay_arr = explode(",",$noTopDay);
            if(in_array(1,$noTopDay_arr) && in_array(2,$noTopDay_arr) && in_array(3,$noTopDay_arr) && in_array(4, $noTopDay_arr) && in_array(5, $noTopDay_arr) && in_array(6, $noTopDay_arr) && in_array(7, $noTopDay_arr)){
                return array("state"=>200,"info"=>"不能全选不置顶日");
            }
        }

        //计算置顶开始时间，尝试计算开始时间
        $cur_day = (int)date("N");
        if($noTopDay){
            //循环计算，找出一个不置顶的时间
            $index = $cur_day;
            while($index<$cur_day+7){
                //找到一个 not in array ，则该天开始
                if(!in_array($index,$noTopDay_arr)){
                    break;
                }
                $index++;
            }
            //如果今天刚好可以，则从现在开始
            if($index==$cur_day){
                $return['top_start'] = time();
            }
            //否则，从该天的 00:00:00 开始
            else{
                //判断是否为一天？
                if($index==$cur_day+1){
                    $flag = "+1 day";
                }else{
                    $flag = ($index-$cur_day);
                    $flag = "+$flag days";
                }
                //取得的是秒数，但不是从 00:00:00 开始，继续转换格式
                $start_time = strtotime($flag);
                $start_time = date("Y-m-d 00:00:00",$start_time);
                $return['top_start'] = strtotime($start_time);
            }
        }
        //没有不置顶日，则开始时间为现在
        else{
            $return['top_start'] = time();
        }
        //计算置顶的结束时间
        //如果没有不置顶日，则置顶结束时间 = 置顶开始时间 + 置顶时长
        if(!$noTopDay){
            //只置顶1天？
            if($top_date==1){
                $flag = "+1 day";
            }else{
                $flag = "+$top_date days";
            }
            $return['top_end'] = strtotime(date("Y-m-d H:i:s",$return['top_start'])." ".$flag);
            $return['top_end'] = $return['top_end']-1; //总体减少一秒，比如 00:00:00 开始，则 23:59:59 结束
        }
        //如果有不置顶日，循环遍历每一天进行匹配，当日符合则符合剩余匹配天数--
        else{
            //判断开始时间是否为 00:00:00 ，它影响一天是否切分为两半
            $split_day = date("Y-m-d H:i:s",$return['top_start']) != date("Y-m-d 00:00:00",$return['top_start']);
            //如果分割了
            if($split_day){
                //需要匹配的天数
                $wait_day = $top_date;
                //开始测试的时间（开始时间+1天）
                //如果开始的时间，是 00:00:00 ，则当日 23:59:59 结束
                $test_day = strtotime(date("Y-m-d H:i:s",$return['top_start'])." +1 day");
                while ($wait_day>0){
                    //取得测试天的星期
                    $NN = date("N",$test_day);
                    //如果当天不在“不置顶日”，则当天可以置顶
                    if(!in_array($NN,$noTopDay_arr)){
                        $wait_day --;
                        if($wait_day<=0){ //如果已经结束了，立刻退出
                            break;
                        }
                    }
                    //继续遍历下一日
                    $test_day += 86400; //测试时间+1天
                }
                $test_day -= 1;
            }else{
                //如果不分割,从当天开始测试
                $test_day = strtotime(date("Y-m-d H:i:s",$return['top_start']));
                //需要匹配的天数少一天（因为当天是完整符合的一天）
                $wait_day = $top_date -1;
                while ($wait_day>0){
                    //取得测试天的星期
                    $NN = date("N",$test_day);
                    //如果当天不在“不置顶日”，则当天可以置顶
                    if(!in_array($NN,$noTopDay_arr)){
                        $wait_day --;
                        if($wait_day<=0){ //如果已经结束了，立刻退出
                            break;
                        }
                    }
                    //继续遍历下一日
                    $test_day += 86400; //测试时间+1天
                }
                $test_day += 86399;  //加上最后的一天（少一秒）
            }
            //匹配完成后，取得结束时间
            $return['top_end'] = $test_day;
        }

        //单个置顶的pid
        $aid = (int)$param['pid'];
        if(empty($aid)){
            return array("state"=>200,"info"=>"缺少参数：pid");
        }

        $return['pid'] = $aid;

        //获取职位信息？
        $sql = $dsql::SetQuery("select * from `#@__job_post` where `id`=$aid");
        $postDetail = $dsql->getArr($sql);
        if(empty($postDetail)){
            return array("state"=>200,"info"=>"职位不存在，请校验pid参数是否正确");
        }
        $subject = "职位置顶：".$postDetail['title'];
        $return['subject'] = $subject;
        //获取公司的套餐刷新余量和增值包刷新余量
        $companyDetail = $this->companyDetail();
        $combo_top = $companyDetail['combo_top']; //套餐剩余置顶量
        $package_top = $companyDetail['package_top']; //增值包剩余量

        //单价
        require(HUONIAOINC."/config/job.inc.php");
        $price = $customJob_top_fee;
        $return['price'] = $price;

        //如果套餐足够
        if($combo_top>=$top_date){
            $return['use_combo'] = $top_date;
            $price = 0;
        }
        //如果套餐+增值包足够
        elseif(($combo_top+$package_top)>=$top_date){
            $return['use_combo'] = $combo_top;
            $return['use_package'] =  $top_date - $combo_top;
            $price = 0;
        }
        //需要购买
        else{
            $return['use_combo'] = $combo_top;
            $return['use_package'] = $package_top;
            $return['pay_count'] = $top_date - $combo_top - $package_top;
            $price = $price * $return['pay_count'];  //需要支付的金额，单价 * 数量
        }

        $return['amount'] = floatval($price);

        //格式化输出
        $return['use_package'] = $return['use_package']?: 0;
        $return['pay_count'] = $return['pay_count'] ?: 0;

        return $return;
    }


    /**
     * 计算批量刷新价格
     */
    public function countRefreshAmount($company=-1){
        global $dsql;
        //如果是传递的 cid
        if($company!=-1){
            $cid = $company;
        }
        //登录的cid
        else{
            $cid = $this->getCidCheck();
            if(is_array($cid)){
                return $cid;
            }
        }

        $param = $this->param;

        $return = array(
            'count' => 0,  // 总刷新次数
            'amount' => 0,  // 总价格
            'type' => 'plain',  // 普通刷新 plain 或 智能刷新 smarty
            'subject' => '',   // xxx等n个职位
        );

        //批量刷新的pid
        $aid = $param['pid'] ?: "";
        if(empty($aid)){
            return array("state"=>200,"info"=>"缺少参数：pid（多个职位id）");
        }
        $return['aid'] = $aid;
        $return['cid'] = $cid;
        $pids = explode(",",$aid);
        //取第一个职位信息作为标题
        $aid_one = $pids[0];
        $return['aid_one'] = $aid_one;
        $sql = $dsql::SetQuery("select * from `#@__job_post` where `id`={$aid_one}");
        $postDetail = $dsql->getArr($sql);
        if(empty($postDetail)){
            return array("state"=>200,"info"=>"职位不存在，请校验pid参数是否正确");
        }
        $subject = "职位刷新：".$postDetail['title'];
        $pids_count = count($pids);  //一共多少个职位
        if($pids_count>1){
            $subject .= "...等".$pids_count."个职位";
        }
        //单条刷新价格
        //job_refresh_fee
        require(HUONIAOINC."/config/job.inc.php");
        $price = $customJob_refresh_fee;
        $return['price'] = $price;
        $return['fix_count'] = 0;  //无用次数累计

        //刷新类型{1.普通刷新、2.智能刷新}
        $refresh_type = (int)$param['refresh_type'];
        if(!in_array($refresh_type,array(1,2))){
            return array("state"=>200,"info"=>"错误的参数：refresh_type，仅支持1（普通刷新），2（智能刷新）");
        }
        $return['type'] = $refresh_type==1 ? "plain" : "smarty";
        if($refresh_type==1){
            $price = $price * $pids_count;  // 普通刷新，则价格就是： 单价 * 数量
            $all_count = $pids_count;
        }
        elseif($refresh_type==2) {
            if (empty($param['start_date']) || empty($param['end_date'])) {
                return array("state" => 200, "info" => "填写开始时间（start_date）（年-月-日）和结束时间（end_date）（年-月-日）");
            }
            if (empty($param['limit_start']) || empty($param['limit_end'])){
                return array("state" => 200, "info" => "填写开始的小时，和结束的时分：比如开始 00:00 结束 24:00");
            }
            //计算得到总刷新次数
            $interval = (int)$param['interval'];
            $return['interval'] = $interval;
            if (empty($interval)) {
                return array("state" => 200, "info" => "缺少刷新间隔：interval（分钟）");
            }
            $return['limit_start'] = $param['limit_start'];
            $return['limit_end'] = $param['limit_end'];
            //实际开始的时间、终止时间【-s是带秒】
            $return['start_date'] = $param['start_date'];
            $return['start_date_s'] = strtotime($param['start_date']." ".$param['limit_start']);
            $return['end_date'] = $param['end_date'];
            $return['end_date_s'] = strtotime($param['end_date']." ".$param['limit_end']);
            $all_count = 0;
            //判断第一天是否今天，第一天单独处理
            $is_firstDayCurrent = $param['start_date'] == date("Y-m-d") ? 1 : 0;
            $real_startDate = $param['start_date'];  //真正开始的日期【年-月-日】（排除第一天的时间）
            //处理第一天的数据
            $realStartTime = strtotime($param['start_date']." ".$param['limit_start']);
            $nowTime = strtotime(date('Y-m-d H:i'));
            $realEndTime = strtotime($param['end_date']." ".$param['limit_end']);
            if($is_firstDayCurrent){
                //得到后续真正开始的时间
                $real_startDate = strtotime($real_startDate." ".$param['limit_start']);
                $real_startDate += 86400;
                $real_startDate = date("Y-m-d",$real_startDate);
                //第一天的数据单独处理
                //今天开始的限制时间，今天结束的限制时间
                if($company==-1){  //当company!=-1时，说明为校验时调用，此时仅校验金额【套餐、增值包等】，因为传来的时间经过第一次计算已经得出，不再考虑开始时间是否已经过去了，否则计算金额可能不对。
                    while($realStartTime<$nowTime){ //过滤已经去掉的时间，这样就得到真正的开始时间
                        $realStartTime += $interval * 60;  //下一次间隔
                    }
                }else{
                    $realStartTime = $param['next'];  //校验金额时，已经指定了第一次开始的时间【下单时计算的第一次时间】
                }
                $firstDayEndTime = strtotime($param['start_date']." ".$param['limit_end']);
                // var_dump($realStartTime, $firstDayEndTime);die;
                //取次数【第一天、单个职位能刷新多少次】
                $firstDayCount = floor(($firstDayEndTime - $realStartTime) / $interval / 60);
                if($firstDayCount>0){
                    //多个职位，第一天一共刷新多少次
                    $first_all_count = $firstDayCount * $pids_count;
                    $all_count += $first_all_count;
                }else{
                    //说明今日根本无刷新全部都过去了，直接为下一天的起始【校验金额时，不考虑】
                    if($company==-1){
                        $realStartTime = strtotime($real_startDate." ".$param['limit_start']);
                    }
                }
            }
            //如果结束时间，也是今天，后续一定没有次数了，否则要计算后续的天数
            $isJustCurrentDay = $param['end_date'] == date("Y-m-d") ? 1 : 0;
            if(!$isJustCurrentDay){
                //先取限制时间段，看单职位单天能刷新几次
                $real_day_count = floor((strtotime(date("Y-m-d")." ".$param['limit_end']) - strtotime(date("Y-m-d")." ".$param['limit_start'])) / $interval / 60);
                //后续共有多少天？
                $real_day = 1 + (strtotime($param['end_date'])-strtotime($real_startDate)) / 86400;
                //多个职位，多天一共刷新多少次
                $real_all_count = $real_day_count * $real_day * $pids_count;
                $all_count += $real_all_count;
            }
            //第一次的时间【前端未校验第一次刷新时间，后端进行了过滤无效时间，导致这里计算出的第一次刷新时间很重要】
            $return['next'] = $realStartTime;
        }

        //获取公司的套餐刷新余量和增值包刷新余量
        $companyDetail = $this->companyDetail();
        $can_job_refresh = $companyDetail['can_job_refresh'];
        $return['can_job_refresh'] = $can_job_refresh;
        $package_refresh = $companyDetail['package_refresh'];
        $return['package_refresh'] = $package_refresh;
        //如果套餐足够
        if ($can_job_refresh >= $all_count) {
            $return['use_combo'] = $all_count;
            $return['use_package'] = 0;
            $price = 0;
        }
        //如果套餐+增值包足够
        elseif (($can_job_refresh + $package_refresh) >= $all_count) {
            $return['use_combo'] = $can_job_refresh; // 套餐全用了
            $return['use_package'] = $all_count - $can_job_refresh;
            $price = 0;
        }else{
            $return['use_combo'] = $can_job_refresh;  // 套餐全用
            $return['use_package'] = $package_refresh; // 增值包全用
            $return['pay_count'] = $all_count - $can_job_refresh - $package_refresh;

            $price = $return['pay_count'] * $price;
        }

        $return['count'] = $all_count;
        $return['amount'] = floatval(sprintf("%.2f",$price));
        $return['subject'] = $subject;

        //表中记录的刷新次数（支付的总次数是count，实际刷新的次数是单职位次数）
        $return['count_one'] = $all_count/$pids_count;
        //第二次刷新时间？
        if($return['count_one']>1){  //如果存在第二次，则计算第二次
            $next2 = $return['next'] + $interval * 60;
            $hour = date("H:i",$next2); //新的hour
            $date = date("Y-m-d",$next2); //新的日期
            //如果下一次时间，还没到达允许时间，则：next = 当天开始时间
            if($hour < $return['limit_start']){
                $next2 = strtotime($date." ".$return['limit_start']);
            }
            //如果下一次时间，已经过了当天允许的最大时间，则：next = 下一天开始时间
            elseif($hour > $return['limit_end']){
                $next2 = strtotime($date." ".$return['limit_start']." +1 day");
            }
            $return['next2'] = $next2;
        }else{
            $return['next2'] = 0;
        }

        //统一输出格式
        if(!isset($return['interval'])){
            $return['interval'] = 0;
        }
        if(!isset($return['start_date'])){
            $return['start_date'] = 0;
        }
        if(!isset($return['end_date'])){
            $return['end_date'] = 0;
        }
        if(!isset($return['next'])){
            $return['next'] = 0;
        }
        return $return;
    }


    /**
     * 下单 / 支付，如果没有订单号则为下单，如果已经存在订单号则为支付
     */
    public function pay(){
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid<1){
            return array("state"=>200,"info"=>"请登录");
        }
        $now = time();
        $param = $this->param;
        $ordernum = $param['ordernum'];
        $paytype = $param['paytype'];
        $paytype = $paytype == 'balance' ? 'money' : $paytype;
        $paypwd = $param['paypwd'];
        //下单
        if(empty($ordernum)){
            return $this->deal();
        }
        /*  支付（已有订单号）  */
        //是否存在支付方式？（从订单列表发起时，有ordernum，却没有paytype，只是把已经生成的 payForm，再次返回给前端而已）
        if(empty($paytype)){
            //从paylog表里，取得前面存进去的数据，得到payForm对象，并返回payForm对象
            $orderSql = $dsql->SetQuery("select l.`param_data`,o.`orderdate` from `#@__pay_log` l,`#@__job_order` o where l.`ordernum`=o.`ordernum` and o.`ordernum`='$ordernum'");
            $orderParam = $dsql->getArr($orderSql);
            if($orderParam){
                $order = unserialize($orderParam['param_data']);
                $order['timeout'] = $orderParam['orderdate'];
                return $order;
            }
            //说明这个订单号也是假的，因为正常情况下一定能查出来
            else{
                return array("state"=>200,"info"=>"传递的订单号有误，请认真检查");
            }
        }
        /*  存在支付方式  */

        //取得应该支付的金额
        $money = $this->checkPayAmount();

        //如果校验未能通过？返回错误
        if(is_array($money)){
            return $money;
        }

        //查出下单时的 标题
        $sql = $dsql::SetQuery("select `amount`,`param_data` from `#@__pay_log` where `ordernum`='$ordernum'");
        $paramArr = $dsql->getArr($sql);
        $param_data = $paramArr['param_data'];
        $param_data = unserialize($param_data);
        $subject = $param_data['subject'];

        //查询 job_order 表，取出 id
        $sql = $dsql::SetQuery("select `id` from `#@__job_order` where `ordernum`='$ordernum'");
        $oid = (int)$dsql->getOne($sql);

        // 支付后跳转页面（订单页面，id是 job_order 的id）
        global $cfg_basedomain;
        $urlParam = array(
            "service"  => "custom",
            "param"     => $cfg_basedomain . "/supplier/job?appFullScreen"
        );
        $ser_urlParam = serialize($urlParam);
        $url   = getUrlPath($urlParam);
        //余额支付？
        if($paytype=="money"){
            // 扣除余额
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$money' WHERE `id` = '$uid'");
            $up1 = $dsql->dsqlOper($archives, "update");
            $user = $userLogin->getMemberInfo($uid, 1);  // 获取账户信息
            $usermoney = $user['money'];
            //记录余额日志
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$money', '购买：$subject', '$now','job','xiaofei','$ser_urlParam','$subject','$ordernum','$usermoney')");
            $up2 = $dsql->dsqlOper($archives, "update");
            //执行paySuccess

            $this->paySuccess();

            //返回成功后的url
            //支付成功后跳转页面
            global $cfg_payReturnType;
            global $cfg_payReturnUrlPc;
            global $cfg_payReturnUrlTouch;

            if ($cfg_payReturnType) {
                //移动端自定义跳转链接
                if (isMobile() && $cfg_payReturnUrlTouch) {
                    $url = $cfg_payReturnUrlTouch;
                }
                //电脑端自定义跳转链接
                if (!isMobile() && $cfg_payReturnUrlPc) {
                    $url = $cfg_payReturnUrlPc;
                }
            }
            //获取订单类型
            $sql = $dsql::SetQuery("select `type` from `#@__job_order` where `ordernum`='$ordernum'");
            $type = $dsql->getOne($sql);
            //刷新
            if($type==4 || $type==5){
                //从body取出next 和 next2
                $sql = $dsql::SetQuery("select `body` from `#@__pay_log` where `ordernum`='$ordernum'");
                $body = $dsql->getOne($sql);
                $body = unserialize($body);
                //置顶，从body取出top_start
                if($type==4){
                    $url = array(
                        'url'=>$url,
                        'next'=>$body['next'],
                        'next2'=>$body['next2'],
                        'type'=>"refresh",
                    );
                }
                //刷新：从body取出next 和 next2
                else{
                    $url = array(
                        'url'=>$url,
                        'next'=>$body['next'],
                        'next2'=>$body['next2'],
                        'type'=>"refresh",
                    );
                }
            }
            return $url;
        }
        //其他支付操作（第三方支付）
        return createPayForm("job", $ordernum, $money, $paytype, $subject,array());
    }


    /**
     * 获取增值包列表
     */
    public function packageList(){
        global $dsql;

        $param = $this->param;

        $where = "";

        $type = $param['type'];

        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 100;

        if($type){
            $where .= " AND `type`=$type";
        }

        $sql = $dsql::SetQuery("select * from `#@__job_package` where 1=1" . $where);
        $pageObj = $dsql->getPage($page,$pageSize,$sql);

        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }

        foreach ($pageObj['list'] as & $item){

            $item['id'] = (int)$item['id'];
            $item['type'] = (int)$item['type'];
            $item['mprice'] = (float)$item['mprice'];
            $item['price'] = (float)$item['price'];
            $item['recommand'] = (int)$item['recommand'];
            $item['resume'] = (int)$item['resume'];
            $item['refresh'] = (int)$item['refresh'];
            $item['top'] = (int)$item['top'];
            $item['buy'] = (int)$item['buy'];
            $item['job'] = (int)$item['job'];
        }
        unset($item);
        return $pageObj;
    }


    /**
     * 查询所有的套餐
     */
    public function comboList(){
        global $dsql;

        $param = $this->param;

        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 100;

        $sql = $dsql::SetQuery("select * from `#@__job_combo`");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }

        //获取购买人数最多的
        $sql = $dsql::SetQuery("SELECT `id`,max(`buy`) FROM `#@__job_combo`");
        $max_id = $dsql->getArr($sql);
        $max_id = $max_id['id'];
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $item['money'] = (float)$item['money'];
            $item['buy'] = (int)$item['buy'];
            $item['job'] = (int)$item['job'];
            $item['valid'] = (int)$item['valid'];
            $item['resume'] = (int)$item['resume'];
            $item['refresh'] = (int)$item['refresh'];
            $item['top'] = (int)$item['top'];
            if($max_id==$item['id']){
                $item['buy_max'] = 1;
            }else{
                $item['buy_max'] = 0;
            }

        }
        unset($item);

        return $pageObj;
    }


    /**
     * 我的面试日程
     */
    public function myInterviewList(){
        global $dsql;
        global $userLogin;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $where = "";
        //获取分类
        $state = $param['state']; //不要默认值
        $stateWhere = "";
        if($state!=""){
            if($state==0){ // 状态为待面试，并且时间还未到时间的
                $stateWhere .= " and i.`state`=1 and unix_timestamp(current_timestamp)<=i.`date`";
            }
            if($state==1){  //时间过了，或者状态码改变了
                $stateWhere .= " and (unix_timestamp(current_timestamp)>i.`date` or i.`state`!=1)";
            }
        }
        //0.单投、1.多投、2.受邀
        $batch = $param['batch'];
        $batchWhere = "";
        if($batch!=""){
            $batch = (int)$batch;
            if($batch==2){  //受邀请，未和投递表关联
                $batchWhere .= " and i.`did`=0";
            }
            else{
                $batchWhere .= " and i.`did`=d.`id` and d.`batch`=$batch";
            }
        }
        //查询面试表（job_invitation）  // stating 字段仅判断时间，这里无其他作用。0未到面试时间【待面试】，1.已经过了面试时间
        $sql = $dsql::SetQuery("select i.`id`,i.`cid`,i.`pid`,i.`rid`,i.`userid`,i.`date`,i.`rz_date`,i.`state`,i.`rz_state`,i.`place`,i.`phone`,i.`contacts`,i.`notice`,i.`refuse_msg`,i.`refuse_author`,i.`refuse_time`,i.`pubdate`,i.`u_read`,i.`u_remark`,case when unix_timestamp(current_timestamp)<=i.`date` && i.`state`=1 then 0 
else 1 end as 'stating' from `#@__job_invitation` i left join `#@__job_delivery` d on d.`id`=i.`did` left join `#@__job_post` p on i.`pid`=p.`id` where i.`userid`=$uid and p.`id` IS NOT NULL");
        $orderBy = " order by `stating` asc,i.`u_read` asc";
        if($state==1){
            $orderBy .= ",i.`date` asc";
        }else{
            $orderBy .= ",i.`date` desc";
        }
        $pageObj = $dsql->getPage($page,$pageSize,$sql.$stateWhere.$batchWhere.$orderBy);

        $pageObj['pageInfo']['state0'] = $dsql->count($sql." and i.`state`=1 and i.`date`>=unix_timestamp(current_timestamp)");
        $pageObj['pageInfo']['state1'] = $dsql->count($sql." and (i.`date`<unix_timestamp(current_timestamp) or i.`state`!=1)");
        $pageObj['pageInfo']['totalCountAll'] = $dsql->count($sql); //无条件的统计

        $this->right = true; //打开权限
        foreach ($pageObj['list'] as & $item){

            $item['id'] = (int)$item['id'];
            $item['cid'] = (int)$item['cid'];
            $item['pid'] = (int)$item['pid'];
            $item['rid'] = (int)$item['rid'];
            $item['u_read'] = (int)$item['u_read'];
            unset($item['userid']);
            $item['date'] = (int)$item['date'];
            $item['state'] = (int)$item['state'];
            $item['stating'] = (int)$item['stating'];
            $item['rz_state'] = (int)$item['rz_state'];
            $item['u_remark'] = (int)$item['u_remark'];

            $this->param = array('id'=>$item['rid']);
            $item['resume'] = $this->resumeDetail();
            $this->param = array('id'=>$item['pid']);
            $item['job'] = $this->postDetail();
            $invition_state = 0;  //{0.已面，1.取消，2.拒绝}
            if($item['state']==5){
                $invition_state = 1;
            }
            elseif($item['state']==2){
                $invition_state = 2;
            }
            if($state==0){
                $invition_state = 3;  //面试状态，如果筛选条件传递的 state==0 则这里固定为3
            }
            $item['invition_state'] = $invition_state;
            //获取公司的名称, url
            $sql = $dsql::SetQuery("select `title`,`logo`,`nature`,`scale`,`industry` from `#@__job_company` where `id`={$item['cid']}");
            $companyD = $dsql->getArr($sql);
            $item['companyTitle'] = $companyD['title'];
            $item['companyLogo'] = getFilePath($companyD['logo']);
            $item['companyNature'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$companyD['nature']));
            $item['companyScale'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$companyD['scale']));
            $item['companyIndustry'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".$companyD['industry']));
            $item['companyUrl'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$item['cid']
            ));

            //查询面试地址
            if(is_numeric($item['place'])){
                $ret = $dsql->getArr($dsql::SetQuery("select `addrid`, `address` from `#@__job_address` where id = " . $item['place']));
                if($ret){
                    
                    global $data;
                    $data = "";
                    $addrArr = getParentArr("site_area", $ret['addrid']);
                    $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                    $item['addr'] = $addrArr;

                    $item['place'] = $ret['address'];
                }else{
                    $item['place'] = '未知';
                }
            }
        }
        $this->right = false; //关闭权限
        unset($item);
        return $pageObj;
    }


    /**
     * 面试详情（个人中心）
     */
    public function myInterviewDetail(){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if($userid<0){
            return array("state"=>200,"info"=>"请登录");
        }
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("select * from `#@__job_invitation` where `userid`=$userid and `id`=$id");
        $res = $dsql->getArr($sql);
        if(empty($res)){
            return array("state"=>200,"info"=>"面试不存在");
        }
        else{
            $res['id'] = (int)$res['id'];
            $res['cid'] = (int)$res['cid'];
            $res['pid'] = (int)$res['pid'];
            $res['rid'] = (int)$res['rid'];
            unset($res['userid']);
            $res['date'] = (int)$res['date'];
            $res['state'] = (int)$res['state'];
            $res['rz_state'] = (int)$res['rz_state'];
            $res['u_remark'] = (int)$res['u_remark'];

            $this->right = true; //开权限
            //公司信息
            $this->param = array('id'=> $res['cid']);
            $res['company'] = $this->companyDetail();
            //职位信息
            $this->param = array('id'=>$res['pid']);
            $res['job'] = $this->postDetail();
            $this->right = false; //关权限
            $invitation_state = 0;  //三种状态：0.待面试，1.面试已取消，2.面试时间已过【假设已面试】/已面试
            if($res['state']==1 && $res['date']>time()){
                $invitation_state = 0;
            }
            elseif($res['state']==2){
                $invitation_state = 1;
            }
            else{
                $invitation_state = 2;
            }
            $res['invitation_state'] = $invitation_state;

            //查询面试地址
            $res['lng'] = '';
            $res['lat'] = '';
            if(is_numeric($res['place'])){
                $ret = $dsql->getArr($dsql::SetQuery("select `addrid`, `address`, `lng`, `lat` from `#@__job_address` where id = " . $res['place']));
                if($ret){
                    global $data;
                    $data = "";
                    $addrArr = getParentArr("site_area", $ret['addrid']);
                    $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                    $res['addr'] = $addrArr;

                    $res['place'] = $ret['address'];
                    $res['lng'] = $ret['lng'];
                    $res['lat'] = $ret['lat'];
                }else{                    
                    $res['place'] = '未知';
                }
            }

            //返回结果
            return $res;
        }
    }


    /**
     * 拒绝面试邀请
     */
    public function refuseInterview(){
        global $dsql;
        global $userLogin;

        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }

        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $refuse_msg = $param['refuse_msg'];
        if(empty($refuse_msg)){
            return array("state"=>200,"info"=>"请填写拒绝原因");
        }
        //更新面试状态
        $time = time();
        $sql = $dsql::SetQuery("update `#@__job_invitation` set `state`=2,`refuse_msg`='$refuse_msg',`refuse_author`='member',`refuse_time`=$time where `id`=$id and `userid`=$userid");
        $up = $dsql->update($sql);
        if($up=="ok"){
            //获取企业信息，发送被拒绝面试邀请短信到企业
            $cid = $dsql->getOne($dsql::SetQuery("select `cid` from `#@__job_invitation` where `id`=$id"));
            //查询企业短信设置
            $companyDetail = $dsql->getArr($dsql::SetQuery("select `sms_interviewRefuse`,`userid` from `#@__job_company` where `id`=$cid"));
            $sms_interviewRefuse = $companyDetail['sms_interviewRefuse'];
            //发送短信，根据配置
            $pushSms = false;
            if(!empty($sms_interviewRefuse)){
                $pushSms = true;
            }
            //发送邮件,否
            $pushEmail = false;

            global $cfg_basedomain;
            $urlParam = array("service"=>"custom", "param"=> $cfg_basedomain . "/supplier/job/interviewManage.html");

            //自定义配置
            $jobName = $dsql->getArr($dsql::SetQuery("select p.`title`, i.`date` from `#@__job_post` p inner join `#@__job_invitation` i where i.`pid`=p.`id` and i.`id`=$id"));
            $username = $dsql->getOne($dsql::SetQuery("select r.`name` from `#@__job_resume` r inner join `#@__job_invitation` where i.`rid`=r.`id` where i.`id`=$id"));
            $data = array(
                "post" => $jobName['title'],
                "time" => date('Y-m-d H:i:s', $jobName['date']),
                "user" => $username,
                "fields" => array(
                    'keyword1' => '职位名称',
                    'keyword2' => '面试者姓名'
                )
            );
            updateMemberNotice($companyDetail['userid'], "招聘-面试邀请拒绝", $urlParam, $data,'',array(),0,0,array('pushSms'=>$pushSms,'pushEmail'=>$pushEmail));
            return "操作成功";
        }else{
            return array("state"=>200,"info"=>"操作失败");
        }
    }


    /**
     * 投递动态（个人中心，投递列表与进度）
     */
    public function myDeliveryList(){
        global $dsql;
        global $userLogin;

        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }

        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $state = $param['state'];
        $batch = $param['batch'];
        $orderby = $param['orderby'] ?? 1;  // 1.投递时间倒序，2.更新状态
        $where = " AND p.`id` IS NOT NULL";
        $stateWhere = "";  //状态条件
        if($state!=""){  // 投递状态（新：0.已投递，1.被查看，2.有意向，3.邀面试，4.不合适）
            if($state==0){
                $stateWhere .= " and d.`state`=0 and d.`read`=0";  //未处理、未读
            }elseif($state==1){
                $stateWhere .= " and d.`state`=0 and d.`u_read`=1"; //未处理，已读
            }elseif($state==2){
                $stateWhere .= " ".$dsql::SetQuery(" and d.`state`=1 and !EXISTS(select g.id from `#@__job_invitation` g where g.`did`=d.`id`)"); //初筛通过，但没邀请面试
            }elseif($state==3){
                $stateWhere .= " and d.`state`=1 and i.`did`!=0";  //初筛通过，且已邀请面试。
            }elseif ($state==4){  // 仅初筛失败
                $stateWhere .= " and d.`state`=2";
            }
        }
        $batchWhere = "";
        if($batch!=""){  //0.单投，1.批量投
            $batchWhere .= " and d.`batch`=$batch";
        }
        //查出所有投递消息
        $sql = $dsql::SetQuery("select d.*,i.`state` 'invition_state',i.`id` 'invition_id',i.`pubdate` 'invition_pubdate' from `#@__job_delivery` d left join `#@__job_post` p on d.`pid`=p.`id` left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $userid $where");
        if($orderby!=2){
            $pageObj = $dsql->getPage($page,$pageSize,$sql.$batchWhere.$stateWhere."  order by d.`date` desc");
        }
        //按状态更新时间排序
        else{
            $pageObj = $dsql->getPage($page,$pageSize,$dsql::SetQuery("select d.*,i.`state` 'invition_state',i.`id` 'invition_id',i.`pubdate` 'invition_pubdate',case when i.`pubdate` then i.`pubdate` when d.`state`=2 then d.`refuse_time` when d.`state`=1 then d.`pass_time` when d.`read`=1 then d.`read_time` else d.`date` end 'newTime' from `#@__job_delivery` d left join `#@__job_post` p on d.`pid`=p.`id` left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $userid $where").$batchWhere.$stateWhere."  order by `newTime` desc");
        }
        //统计标头。用户未读【邀请面试的统计是面试时间小于当前时间】
        $pageObj['pageInfo']['state0'] = $dsql->count($sql." and d.`state`=0 and d.`read`=0 and d.`u_read`=0");
        $pageObj['pageInfo']['state1'] = $dsql->count($sql." and d.`state`=0 and d.`read`=1 and d.`u_read`=0");
        $pageObj['pageInfo']['state2'] = $dsql->count($dsql::SetQuery($sql." and d.`state`=1 and !EXISTS(select g.id from `#@__job_invitation` g where g.`did`=d.`id`) and d.`u_read`=0"));
        $pageObj['pageInfo']['state3'] = $dsql->count($sql." and d.`state`=1 and i.`did`!=0 and i.`state`=1");  //无论用户是否阅读
        $pageObj['pageInfo']['state4'] = $dsql->count($sql." and d.`state`=2 and d.`u_read`=0");
        $pageObj['pageInfo']['batch0'] = $dsql->count($sql.$stateWhere." and d.`batch`=0");  //单投
        $pageObj['pageInfo']['batch1'] = $dsql->count($sql.$stateWhere." and d.`batch`=1");  //批量投
        $pageObj['pageInfo']['totalCountAll'] = $dsql->count($sql);  //无条件的统计
        //全部

        $this->right = true;
        foreach ($pageObj['list'] as & $item){

            $this->param = array("id"=>$item['rid']);
            $item['resume'] = $this->resumeDetail();

            $this->param = array('id'=>$item['pid']);
            $item['job'] = $this->postDetail();

            $item['invition_id'] = (int)$item['invition_id'];
            $item['id'] = (int)$item['id'];
            $item['rid'] = (int)$item['rid'];
            $item['cid'] = (int)$item['cid'];
            $item['pid'] = (int)$item['pid'];
            $item['date'] = (int)$item['date'];
            $item['state'] = (int)$item['state'];
            $item['refuse_time'] = (int)$item['refuse_time'];
            $item['pass_time'] = (int)$item['pass_time'];
            $item['userid'] = (int)$item['userid'];
            $item['read'] = (int)$item['read'];
            $item['read_time'] = (int)$item['read_time'];
            unset($item['del']);
            //获取公司的名称, url
            $sql = $dsql::SetQuery("select `title`,`logo`,`nature`,`scale`,`industry` from `#@__job_company` where `id`=".(int)$item['cid']);
            $companyD = $dsql->getArr($sql);
            $item['companyTitle'] = $companyD['title'];
            $item['companyLogo'] = getFilePath($companyD['logo']);
            $item['companyNature'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".(int)$companyD['nature']));
            $item['companyScale'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".(int)$companyD['scale']));
            $item['companyIndustry'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".(int)$companyD['industry']));
            $item['companyUrl'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$item['cid']
            ));
            //投递状态（新：0.已投递，1被查看，2.有意向，3.邀面试，4.不合适）
            $postState = 0;
            $newTime = $item['date'];
            if($item['read']==1){
                $postState = 1;
                $newTime = $item['read_time'];
            }
            if($item['state']==1){
                $postState = 2;
                $newTime = $item['pass_time'];
            }
            if($item['state']==2){
                $postState = 4;
                $newTime = $item['refuse_time'];
            }
            //是否邀请了面试，如果是则
            $invition_state = $item['invition_state'] ?: 0;
            if(!empty($invition_state)){
                $postState = 3;
                $newTime = $item['invition_pubdate']; //面试操作日期

                //面试状态【用户取消】
                if($invition_state==2){
                    $invition_state = 3;
                }
                elseif($invition_state==5){
                    $invition_state = 2;
                }
                elseif($invition_state==1){
                    $invition_state = 0;
                }
            }
            $item['invition_state'] = $invition_state;
            $item['postState'] = $postState;
            $item['newTime'] = $newTime;
        }
        $this->right = false;
        unset($item);
        //阅读处理
        if($state!=""){
            if(in_array($state,array(0,1,2,3,4))){
                $ids = array_column($pageObj['list'],'id');
                if($ids){
//                    $ids_s = join(",",$ids);
//                    $dsql->update($dsql::SetQuery("update `#@__job_delivery` set `u_read`=1 where `id` in($ids_s)")); //弃用这个，全部设置为已读
                    if($page==1){
                        $idsSql = $dsql::SetQuery("select d.`id` from `#@__job_delivery` d left join `#@__job_post` p on d.`pid`=p.`id` left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $userid $where".$batchWhere.$stateWhere);
                        $allIds = $dsql->getArr($idsSql);
                        if($allIds){
                            $allIds = join(",",$allIds);
                            $dsql->update($dsql::SetQuery("update `#@__job_delivery` set `u_read`=1 where `id` in($allIds)"));
                        }
                    }
                    //减少响应的标头
//                    $pageObj['pageInfo']['state'.$state] = $pageObj['pageInfo']['state'.$state] - count($ids);
//                    $pageObj['pageInfo']['state'.$state] = $pageObj['pageInfo']['state'.$state] < 0 ? 0 : $pageObj['pageInfo']['state'.$state];
                    $pageObj['pageInfo']['state'.$state] = 0;
                }
            }
        }
        return $pageObj;
    }


    /**
     * 投递详情（个人中心、个人简历投递详情）
     */
    public function myDeliveryDetail(){
        global $dsql;
        global $userLogin;
        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }

        $param = $this->param;
        $id = $param['id']; //投递id
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        //返回的是一个数组
        $res = array();
        //查出投递时间、阅读时间
        $sql = $dsql::SetQuery("select * from `#@__job_delivery` where `id`=$id and `userid`=$userid");
        $delivery = $dsql->getArr($sql);
        if(empty($delivery)){
            return array("state"=>200,"info"=>"投递信息不存在");
        }
        //投递岗位
        $this->param['id'] = $delivery['pid'];
        $this->right = true;
        $res['job'] = $this->postDetail() ?: array();
        $this->right = false;
        //投递公司
        $this->param['id'] = $delivery['cid'];
        $res['company'] = $this->companyDetail(1) ?: array();
        // 投递时间
        $res['date'] = (int)$delivery['date'];
        //查出阅读时间
        $res['read'] = (int)$delivery['read'];
        $res['read_time'] = (int)$delivery['read_time'];
        //是否通过初筛
        $res['pass_time'] = (int)$delivery['pass_time'];
        $res['refuse_time'] = (int)$delivery['refuse_time'];
        $res['refuse_msg'] = $delivery['refuse_msg'];
        $res['batch'] = (int)$delivery['batch'];
        $res['u_read'] = (int)$delivery['u_read'];
        //是否在投递详情页批量投递过？
        $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$userid and `name`='deliveryDetailPost'");
        $res['deliveryDetailPost'] = (int)$dsql->getOne($sql);
        //返回流程数据
        return $res;
    }


    /**
     * 职位推荐【根据期望简历匹配】
     */
    public function jobRecommend(){
        global $dsql;
        global $userLogin;
        $param = $this->param;
        $types = $param['type'] ?: "";  //前端传递的期望职位
        if(is_string($types) && !empty($types)){
            $types = explode(",",$types);
        }elseif(is_int($types)){
            $types = array($types);
        }
        $uid = $this->getUid();  //是否登录
        $cidCheck = "";
        if(is_array($uid)){
            $uid = 0;
        }else{
            //查询用户的实名认证、手机认证情况
            $sql = $dsql::SetQuery("select `certifyState`,`phoneCheck` from `#@__member` where `id`=$uid");
            $memberInfo = $dsql->getArr($sql);
            $certifyState = (int)$memberInfo['certifyState'];
            $phoneCheck = (int)$memberInfo['phoneCheck'];
            //是否为招聘公司，如果是则不能投递自己
            $cid = $this->getCid();
            if(!is_array($cid)){
                $cidCheck = " and c.`id`!=$cid";
            }
        }
        if(empty($types)){
            $userid = $this->getUid();
            if(is_array($userid)){
                return $userid;
            }
            //查出我的简历列表（改：只需要默认简历、根据期望职位匹配）
            $sql = $dsql::SetQuery("select `job` from `#@__job_resume` where `userid`=$userid and `default`=1 and `del`=0");
            $types = $dsql->getOne($sql);
            if(!empty($types)){
                $types = explode(",",$types);
            }
        }
        $list = array();
        if($types){
            $types = array_unique($types);
            $types = array_slice($types,0,6); //至多取6个职位
            //（每个职位最多推荐3个）
            foreach ($types as $item){
                if($uid){  //登录了，查询能投递的
                    $sql = $dsql::SetQuery("select p.`id` from `#@__job_post` p inner join `#@__job_company` c where p.`type`=$item and p.`del`=0 and p.`off`=0 and p.`state`=1 and p.`company`=c.`id` $cidCheck and (c.`delivery_limit_certifyState`=1 and $certifyState=1 or c.`delivery_limit_certifyState`=0) and (c.`delivery_limit_phoneCheck`=1 and $phoneCheck=1 or c.`delivery_limit_phoneCheck`=0) and !exists(select d.`id` from `#@__job_delivery` d,`#@__job_company` c where d.`cid`=c.`id` and d.`userid`=$uid and d.`date`>(unix_timestamp(current_timestamp)-c.`delivery_limit_interval`*30*86400)) limit 3");
                }else{
                    $sql = $dsql::SetQuery("select `id` from `#@__job_post` where `type`=$item and `del`=0 and `off`=0 and `state`=1 limit 3");
                }
                $res = $dsql->getArr($sql);
                if($res){
                    foreach ($res as $i){
                        $this->param = array('id'=>$i);
                        $list[] = $this->postDetailAll();
                    }
                }
            }
            //如果列表还是不到6，但是职位是存在的，尝试找出每个分类的直接父级
            if(count($list)<6 && $types){
                foreach ($types as $type){
                    //有父级
                    $sql = $dsql::SetQuery("select `parentid` from `#@__job_type` where `id`=$type");
                    $parentId = $dsql->getOne($sql);
                    if($parentId){
                        if($uid){
                            $sql = $dsql::SetQuery("select p.`id` from `#@__job_post` p inner join `#@__job_company` c where p.`type`=$type and p.`del`=0 and p.`off`=0 and p.`state`=1 and p.`company`=c.`id` $cidCheck and (c.`delivery_limit_certifyState`=1 and $certifyState=1 or c.`delivery_limit_certifyState`=0) and (c.`delivery_limit_phoneCheck`=1 and $phoneCheck=1 or c.`delivery_limit_phoneCheck`=0) and !exists(select d.`id` from `#@__job_delivery` d,`#@__job_company` c where d.`cid`=c.`id` and d.`userid`=$uid and d.`date`>(unix_timestamp(current_timestamp)-c.`delivery_limit_interval`*30*86400)) limit 3");
                        }else{
                            $sql = $dsql::SetQuery("select `id` from `#@__job_post` where `type`=$parentId and `del`=0 and `off`=0 and `state`=1 limit 3");
                        }
                        $res = $dsql->getArr($sql);
                        if($res){
                            foreach ($res as $i){
                                $this->param = array('id'=>$i);
                                $list[] = $this->postDetailAll();
                            }
                        }
                    }
                }
            }
            shuffle($list); //打乱顺序
            $list = array_slice($list,0,6);
        }
        //如果没有期望职位，随机取6个职位
        else{
            if($uid){
                $sql = $dsql::SetQuery("select p.`id` from `#@__job_post` p inner join `#@__job_company` c where p.`del`=0 and p.`off`=0 and p.`state`=1 and p.`company`=c.`id` $cidCheck and (c.`delivery_limit_certifyState`=1 and $certifyState=1 or c.`delivery_limit_certifyState`=0) and (c.`delivery_limit_phoneCheck`=1 and $phoneCheck=1 or c.`delivery_limit_phoneCheck`=0) and !exists(select d.`id` from `#@__job_delivery` d,`#@__job_company` c where d.`cid`=c.`id` and d.`userid`=$uid and d.`date`>(unix_timestamp(current_timestamp)-c.`delivery_limit_interval`*30*86400)) limit 6");
            }else{
                $sql = $dsql::SetQuery("select `id` from `#@__job_post` where `del`=0 and `off`=0 and `state`=1 limit 6");
            }
            $res = $dsql->getArr($sql);
            if($res){
                foreach ($res as $i){
                    $this->param = array('id'=>$i);
                    $list[] = $this->postDetailAll();
                }
                shuffle($list);
            }
        }
        return array("pageInfo"=>array("pageSize"=>6,"page"=>1,"totalPage"=>1,"totalCount"=>count($list)),"list"=>$list);
    }


    /**
     * 我的求职、统计（面试邀请、我的投递、收藏职位、关注公司）
     */
    public function myJobHunting(){
        global $dsql;
        global $userLogin;
        $userid = $this->getUid();
        if(is_array($userid)){
            return $userid;
        }
        //查出我的简历
        $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `userid`=$userid and `del`=0");
        $ids = $dsql->getArr($sql);
        if(empty($ids || !is_array($ids))){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        $ids = join(",",$ids);
        //统计面试邀请
        $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `state`=0 and `rid` in ($ids)");
        $count['interview'] = (int)$dsql->getOne($sql);
        //统计我的投递
        $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `userid`=$userid");
        $count['delivery'] = (int)$dsql->getOne($sql);
        //统计收藏职位
        //查询当前用户收藏职位列表
        $collectJob = $dsql->SetQuery("SELECT count(*) FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'job' AND `userid` = $userid");
        $count['job'] = (int)$dsql->getOne($collectJob);
        //统计关注的公司
        $collectJob = $dsql->SetQuery("SELECT count(*) FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'company' AND `userid` = $userid");
        $count['company'] = (int)$dsql->getOne($collectJob);
        return $count;
    }


    /**
     * 等待入职（找出当前企业待入职人员）
     */
    public function pendingBoarding(){
        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }

        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;

        //查找等待入职的人员信息（姓名、职位、入职时间、电话）
        $sql = $dsql::SetQuery("select * from `#@__job_invitation` where `state`=4 and `rz_state`=0 and `cid`=$company");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        //入职信息，开权限
        $this->right = true;
        foreach ($pageObj['list'] as & $val){
            $val['id'] = (int)$val['id'];
            $val['userid'] = (int)$val['userid'];
            $val['date'] = (int)$val['date'];
            $val['cid'] = (int)$val['cid'];
            $val['rid'] = (int)$val['rid'];
            $val['pid'] = (int)$val['pid'];
            $val['rz_state'] = (int)$val['rz_state'];
            unset($val['state']);
            unset($val['rz_state']);

            //根据rid，查找出简历信息
            $this->param = array('id'=>$val['rid']);
            $val['resume'] = $this->resumeDetail();
            //根据pid，查找出职位信息
            $this->param = array('id'=>$val['pid']);
            $val['job'] = $this->postDetail();
        }
        $this->right = false;
        //返回数据
        return $pageObj;
    }


    /**
     * （公司）待面试日程接口（时间、姓名、职位、电话、备注等）
     */
    public function interviewSchedule(){
        global $dsql;
        global $userLogin;
        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        //找出当前企业面试日程信息
        $time = time();
        $sql = $dsql::SetQuery("select * from `#@__job_invitation` where `date`>$time && `cid`=$company and `rz_state`=0 and `state`=1");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        // 面试信息，开权限
        $this->right = true;
        foreach ($pageObj['list'] as & $val){

            $val['id'] = (int)$val['id'];
            $val['userid'] = (int)$val['userid'];
            $val['date'] = (int)$val['date'];
            $val['cid'] = (int)$val['cid'];
            $val['rid'] = (int)$val['rid'];
            $val['pid'] = (int)$val['pid'];
            $val['rz_state'] = (int)$val['rz_state'];
            unset($val['state']);
            //简历id查简历
            $this->param = array('id'=>$val['rid']);
            $val['resume'] = $this->resumeDetail();
            //职位id查职位
            $this->param = array('id'=>$val['pid']);
            $val['post'] = $this->postDetail();
        }
        $this->right = false;
        return $pageObj;
    }

    /**
     * 推荐人才接口
     */
    public function recommendTalents(){
        global  $dsql;
        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }
        $uid = $this->getUid();
        //找出企业在招职位的：职位类别(job_type)
        $sql = $dsql::SetQuery("select `type` from `#@__job_post` where `company`=$company and `del`=0 and `off`=0");
        $types = $dsql->getArr($sql);
        $total_list = array();
        if(empty($types)){
            return array("state"=>200,"info"=>"暂无相关数据");
        }else{
            //尝试抓取该职位类别是否有数据
            foreach ($types as $key => $val){
                // match 简历
                $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `del`=0 and `private`=0 and FIND_IN_SET($val,`type`) and `state`=1");
                $list = $dsql->getArr($sql);
                foreach ($list as $item){
                    $this->param = array('id'=>$item);
                    $total_list[$item] = $this->resumeDetail();
                }
                if(count($total_list)>=9){
                    break;
                }
            }
            //尝试抓取职位下一子级数据
            if(count($total_list)<9){
                foreach ($types as $types_i){
                    $sql = $dsql::SetQuery("select `id` from `#@__job_type` where `parentid`=$types_i");
                    $type_sons = $dsql->getArr($sql);
                    if(!empty($type_sons)){
                        foreach ($type_sons as $key => $val){
                            // match 简历
                            $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `del`=0 and `private`=0 and FIND_IN_SET($val,`type`) and `state`=1");
                            $list = $dsql->getArr($sql);
                            foreach ($list as $item){
                                $this->param = array('id'=>$item);
                                $total_list[$item] = $this->resumeDetail();
                            }
                            if(count($total_list)>=9){
                                break;
                            }
                        }
                    }
                }
            }
        }
        //尝试随机抓取几个
        if(empty($total_list)){
            $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `del`=0 and `private`=0 and `userid`!=$uid  and `state`=1 limit 9");
            $list = $dsql->getArr($sql);
            foreach ($list as $item){
                $this->param = array('id'=>$item);
                $total_list[$item] = $this->resumeDetail();
            }
        }
        if(empty($total_list)){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        shuffle($total_list);
        //最多返回9个数据
        return $total_list ? array_slice($total_list,0,9) : array();
    }


    /**
     * 招聘进展
     */
    public function jobProcess(){

        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }

        $count = array();
        $count['dz'] = 0;
        $count['td'] = 0;
        $count['cs'] = 0;
        $count['down'] = 0;
        $count['ms'] = 0;
        $count['offer'] = 0;
        $count['drz'] = 0;

        //找出该公司的所有在招职位
        $sql = $dsql::SetQuery("select * from `#@__job_post` where `company`=$company  and `del`=0 and `off`=0 and `state`=1 order by `pubdate` desc");
        $jobs = $dsql->getArrList($sql) ?: array();
        //列出每个职位的：招聘人数、待招人数、通过初筛人数、面试人数、沟通offer人数、入职人数
        $newList = array();
        foreach ($jobs as $key => $value){
            $pid = $value['id'];
            $newList[$key]['title'] = $value['title'];
            $newList[$key]['id'] = (int)$value['id'];
            $newList[$key]['type'] = (int)$value['type'];
            //待招人数 = 计划招聘人数 - 已入职人数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `pid`=$pid and `rz_state`=1");
            $one = (int)$dsql->getOne($sql);
            $newList[$key]['dz'] = $value['number'] - $one;
            $count['dz'] += $newList[$key]['dz'];
            //投递人数（所有，但不要已删除）
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `del`=0 and `pid`=$pid");
            $newList[$key]['td'] = (int)$dsql->getOne($sql);
            $count['td'] += $newList[$key]['td'];
            //通过初筛人数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `del`=0 and `state`=1 and `pid`=$pid");
            $newList[$key]['cs'] = (int)$dsql->getOne($sql);
            $count['cs'] += $newList[$key]['cs'];
            //下载简历人数
            $sql = $dsql::SetQuery("select count(rd.`id`) from `#@__job_delivery` d LEFT JOIN `#@__job_resume_download` rd ON d.`rid`=rd.`rid` and d.`cid`=rd.`cid` where d.`pid`=$pid");
            $newList[$key]['down'] = (int)$dsql->getOne($sql);
            $count['down'] += $newList[$key]['down'];
            //面试人数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `pid`=$pid and `state` in (1,2,4,5)");
            $newList[$key]['ms'] = (int)$dsql->getOne($sql);
            $count['ms'] += $newList[$key]['ms'];
            //沟通offer人数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `pid`=$pid and `state`=3");
            $newList[$key]['offer'] = (int)$dsql->getOne($sql);
            $count['offer'] += $newList[$key]['offer'];
            //待入职人数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `pid`=$pid and `state`=4 and `rz_state`=0");
            $newList[$key]['drz'] = (int)$dsql->getOne($sql);
            $count['drz'] += $newList[$key]['drz'];
        }
        $count['job'] = count($jobs);

        return array("count"=>$count,"process"=>$newList);
    }


    /**
     * 招聘管理、统计（面试日程数、未读投递数、简历管理数、职位管理数）
     */
    public function managerCount(){
        global $dsql;
        global $userLogin;

        $cid = $this->getCidCheck(0);

        if(is_array($cid)){
            return $cid;
        }

        //面试日程数（面试）
        $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where `cid`=$cid");
        $count['interview'] = (int)$dsql->getOne($sql);

        //统计未读
        $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `del`=0 and `cid`=$cid and `u_read`=0");
        $count['unRead'] = (int)$dsql->getOne($sql);

        //简历数（投递的）
        $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `del`=0 and `cid`=$cid");
        $count['resume'] = (int)$dsql->getOne($sql);

        //职位数-所有
        $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`=$cid and `del`=0");
        $count['job'] = (int)$dsql->getOne($sql);

        //职位数-在招
        $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`=$cid and `state` = 1 and `off` = 0 and `del`=0");
        $count['job_state_1'] = (int)$dsql->getOne($sql);

        //职位数-待审
        $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`=$cid and `state` = 0 and `off` = 0 and `del`=0");
        $count['job_state_0'] = (int)$dsql->getOne($sql);

        //职位数-下架
        $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`=$cid and `off` = 1 and `del`=0");
        $count['job_off'] = (int)$dsql->getOne($sql);

        return array("state"=>100,"info"=>$count);
    }

    /**
     * 面试日程：商家查询列表（ job_invitation ）
     */
    public function interviewList(){
        global $dsql;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }
        //查询面试日程表
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $where = " AND r.`id` IS NOT NULL AND p.`id` IS NOT NULL";
        //过滤已取消
        $cancel = $param['cancel'];
        if(!empty($cancel)){
            $where .= " AND i.`state`!=2";
        }
        //职位筛选
        $pid = $param['pid'];
        if(!empty($pid)){
            $where .= " AND `pid`=$pid";
        }
        //关键字筛选（简历名）
        $key = $param['keyword'];
        if(!empty($key)){
            $key = trim($key);
            $where .= " AND r.`name` like '%$key%'";
        }
        //指定某天
        if($param['date']!=""){
            $where .= " and i.`date`>=".strtotime($param['date']." 00:00:00")." and i.`date`<=".strtotime($param['date']." 23:59:59");
        }
        //状态筛选
        $state = $param['state'];
        $stateWhere = "";
        if($state!=""){
            if($state==1){ //待面试
                $stateWhere .= " and i.`state`=1 and unix_timestamp(current_timestamp)<=i.`date`";
            }
            elseif($state==-1){ //历史面试记录【待面试之外的】
                $stateWhere .= " and (i.`state`!=1 or unix_timestamp(current_timestamp)>i.`date`)";
            }
            else{
                $stateWhere .= " AND i.`state`=$state";
            }
        }
        //排序
        $orderBy = " order by `stating` asc";
        if($state==1){
            $orderBy .= ",i.`date` asc";
        }else{
            $orderBy .= ",i.`date` desc";
        }
        $baseSql = $dsql::SetQuery("select i.*,case when unix_timestamp(current_timestamp)<=i.`date` && i.`state`=1 then 0 
else 1 end as 'stating' from `#@__job_invitation` i LEFT JOIN `#@__job_resume` r ON r.`id`=i.`rid` left join `#@__job_post` p on i.`pid`=p.`id` where `cid`=$company" .$where);
        $pageObj = $dsql->getPage($page,$pageSize,$baseSql.$stateWhere.$orderBy);
        $stateAll = $dsql->count($baseSql);
        $state1 = $dsql->count($baseSql." AND i.`state`=1 and unix_timestamp(current_timestamp)<=i.`date`");
        $state2 = $dsql->count($baseSql." AND i.`state`=2");
        $state3 = $dsql->count($baseSql." AND i.`state`=3");
        $state4 = $dsql->count($baseSql." AND i.`state`=4");
        $state4_0 = $dsql->count($baseSql." AND i.`state`=4 AND i.`rz_state`=0");
        $state4_1 = $dsql->count($baseSql." AND i.`state`=4 AND i.`rz_state`=1");
        $pageObj['pageInfo']['state'] = $stateAll;
        $pageObj['pageInfo']['state1'] = $state1;
        $pageObj['pageInfo']['state2'] = $state2;
        $pageObj['pageInfo']['state3'] = $state3;
        $pageObj['pageInfo']['state4'] = $state4;
        $pageObj['pageInfo']['state4_0'] = $state4_0;
        $pageObj['pageInfo']['state4_1'] = $state4_1;
        if($pageObj['pageInfo']['totalCount']==0){
            return array("pageInfo"=>$pageObj['pageInfo'],"list"=>array());
        }

        //处理数据
        $this->right = true;
        $calendar = array();  //日历统计
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $item['cid'] = (int)$item['cid'];
            $item['pid'] = (int)$item['pid'];
            $item['rid'] = (int)$item['rid'];
            $item['userid'] = (int)$item['userid'];
            $item['date'] = (int)$item['date'];
            $item['state'] = (int)$item['state'];
            $item['rz_date'] = (int)$item['rz_date'];
            $item['rz_state'] = (int)$item['rz_state'];
            $item['refuse_time'] = (int)$item['refuse_time'];
            //简历信息
            $this->param = array("id"=>$item['rid']);
            $item['resume'] = $this->resumeDetail();
            //职位信息
            $this->param = array("id"=>$item['pid']);
            $item['job'] = $this->postDetail();
            //标注信息
            $item['remark'] = $this->getRemark($item['rid'],$item['cid']);
            //统计待面试日历
            if($item['state']==1 and $item['date']>time()){
                //统计月
                $month = date("Y-m",$item['date']); //实际月份
                $cmonth = $calendar[$month] ?? array();  //日历月份
                //统计日
                $day = date("j",$item['date']); //实际日
                $cday = $cmonth[$day] ?? 0; //日历日
                $cday += 1;
                $cmonth[$day] = $cday;
                $calendar[$month] = $cmonth;  //累加
            }

            //查询面试地址
            if(is_numeric($item['place'])){
                $ret = $dsql->getOne($dsql::SetQuery("select `address` from `#@__job_address` where id = " . $item['place']));
                if($ret){
                    $item['place'] = $ret;
                }else{
                    $item['place'] = '未知';
                }
            }

            //查询公司工作地址
            $this->param = array("method"=>"all");
            $all_addr = $this->op_address();
            if($all_addr['state']==200){
                $all_addr = array();
            }
            $item['company_addr_count'] = count($all_addr);
        }
        //日历排序
        if($calendar){
            //先按年月份升序排好
            ksort($calendar);
            //每日升序排序
            foreach ($calendar as & $month){
                ksort($month);
            }
            unset($month);
        }
        $this->right = false;
        $pageObj["pageInfo"]['calendar'] = $calendar;
        unset($item);
        return $pageObj;
    }



    /**
     * 更新入职标识（ job_invitation ：rz_state ） ||  入职时间
     */
    public function updateBoarding(){
        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }

        // iid ：面试表id
        $param = $this->param;
        $iid = (int)$param['id'];
        $rz_date = $param['rz_date'];
        if(empty($iid)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        //修改后的状态
        $rz_state = $param['rz_state'];
        $iids = explode(",",$iid);
        if(!empty($iids)){
            foreach ($iids as $iid){
                $sql = $dsql::SetQuery("update `#@__job_invitation` set `rz_state`=$rz_state where `id`=$iid and `cid`=$company");
                $dsql->update($sql);
            }
        }
        //修改入职时间
      if($rz_date!=""){
          foreach ($iids as $iid){
              $sql = $dsql::SetQuery("update `#@__job_invitation` set `rz_date`=$rz_date where `id`=$iid and `cid`=$company");
              $dsql->update($sql);
          }
      }

        return "更新成功";
    }


    /**
     * 更新面试：状态 or 标注 （ job_invitation ）
     */
    public function updateInterView(){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }

        //面试信息id
        $param = $this->param;
        $iid = (int)$param['id'];
        if(empty($iid)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }

        $state = $param['state'];
        $date = $param['date'];
        $rz_date = $param['rz_date'];  //入职时间
        $refuse_msg = $param['refuse_msg']; //拒绝原因
        //如果有标记
        if(isset($param['remark'])){
            $sql = $dsql::SetQuery("select rid from `#@__job_invitation` where id=$iid");
            $rid = (int)$dsql->getOne($sql);
            $this->param = array("rid"=>$rid,"update_type"=>"invitation","remark_invitation"=>$param['remark']);
            $this->updateRemark();  //禁止return
        }
        //更新状态
        if($state!=""){
            //入职
            $append = "";
            if($state==4){
                if(empty($rz_date)){
                    return array("state"=>200,"info"=>"缺少入职时间");
                }
                $append .= ",`rz_date`=$rz_date";
            }
            //不合适
            elseif($state==5){
                if(empty($refuse_msg)){
                    return array("state"=>200,"info"=>"缺少拒绝原因");
                }
                $append .= ",`refuse_msg`='$refuse_msg',`refuse_author`='company',`refuse_time`=".time();
            }
            //取消面试
            elseif($state==6){
                $refuse_author = $param['refuse_author'] ?? '';
                if(empty($refuse_author)){
                    return array("state"=>200,"info"=>"缺少参数，refuse_author");
                }else{
                    if($refuse_author!="company" && $refuse_author!='member'){
                        return array("state"=>200,"info"=>"缺少参数");
                    }
                    $append .= ",`refuse_author`='$refuse_author',`refuse_time`=".time();
                }
            }
            //回绝面试
            elseif($state==2){
                $append .= ",`refuse_msg`='',`refuse_author`='member',`refuse_time`=".time();
            }
            $sql = $dsql::SetQuery("update `#@__job_invitation` set `state`=$state $append where `id`=$iid and `cid`=$company");
            $up  = $dsql->update($sql);
            if($up=="ok"){
                return "更新成功";
            }
            else{
                return array("state"=>200,"info"=>"更新失败");
            }
        }
        //更新面试时间
        elseif($date!=""){
            $sql = $dsql::SetQuery("update `#@__job_invitation` set `date`=$date where `id`=$iid and `cid`=$company");
            $up  = $dsql->update($sql);
            if($up=="ok"){
                return "更新成功";
            }
            else{
                return array("state"=>200,"info"=>"更新失败");
            }
        }else{
            return array("state"=>200,"info"=>"参数异常");
        }
    }


    /**
     * 邀请面试
     * @return array
     */
    public function invitation()
    {
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $pid         = (int)$this->param['pid'];  // 职位 id
                $rid         = (int)$this->param['rid'];  // 简历 id
                $areaCode    = (int)$this->param['areaCode'];  //手机区号，例如 +86
                $phone       = (int)$this->param['phone']; // HR联系电话
                $name        = $this->param['name'];  // HR姓名
                $place       = (int)$this->param['place'];  // 面试地点
                $interview_time   = (int)$this->param['interview_time']; // 面试时间、int 毫秒值
                $notice      = $this->param['notice']; //多个标记 、 间隔
            }
        }
        if(empty($pid)){
            return array("state"=>200,"info"=>"缺少参数：pid");
        }
        if(empty($rid)){
            return array("state"=>200,"info"=>"缺少参数：rid");
        }
        if(empty($interview_time)){
            return array("state"=>200,"info"=>"缺少参数：interview_time");
        }
        if(empty($name)){
            return array("state"=>200,"info"=>"缺少参数：name");
        }
        if(empty($notice)){
            // return array("state"=>200,"info"=>"缺少参数：notice");
        }
        if(empty($phone)){
            return array("state"=>200,"info"=>"缺少参数：phone");
        }
        if(empty($place)){
            return array("state"=>200,"info"=>"缺少参数：place");
        }

        //根据登录ID查询公司ID
        $cid = $this->getCidCheck();
        if (is_array($cid)) {
            return $cid;
        }

        //根据职位查询公司信息（是否为当前公司的职位）
        $sql = $dsql->SetQuery("SELECT p.`id`, p.`title`, c.`title` company FROM `#@__job_post` p LEFT JOIN `#@__job_company` c ON c.`id` = p.`company` WHERE p.`id` = $pid AND p.`company` = $cid");
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            return array("state" => 200, "info" => '权限出错，请检查你邀请的职位！');
        }
        $post = $ret[0]['title'];  // 职位名称
        $company = $ret[0]['company']; //公司名称

        //查询简历所属求职者
        $sql = $dsql->SetQuery("SELECT `userid`, `phone`, `email`, `name` FROM `#@__job_resume` WHERE `state` = 1 AND `del`=0 AND `id` = $rid");
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            return array("state" => 200, "info" => '抱歉，简历已删除或在审核中，无法邀请');
        }
        $resume = $ret[0];

        //判断是否已下载该简历，否则不允许下载
        $sql = $dsql::SetQuery("select * from `#@__job_resume_download` where `cid`=$cid and `rid`=$rid");
        $buyArr = $dsql->getArr($sql);
        if(!$buyArr || !is_array($buyArr)){
            return array("state"=>200,"info"=>"必须下载该简历，才能发起在线邀请面试");
        }

        //手机号码增加区号
        $phone = ($areaCode == '86' ? '' : $areaCode) . $phone;

        //尝试取出最后一个符合记录的投递id，让投递表和面试表关联起来
        $sql = $dsql::SetQuery("select `id` from `#@__job_delivery` where `rid`= $rid and `cid`=$cid and `pid`=$pid and `state`=1 order by `date` desc limit 1");
        $did = (int)$dsql->getOne($sql);

        //加入到面试表中【允许重复邀请】
        $time = time();
        $sql = $dsql->SetQuery("INSERT INTO `#@__job_invitation` (`rid`,`userid`, `cid`, `pid`, `date`, `phone`, `contacts`, `place`, `notice`,`pubdate`,`did`) VALUES ($rid, {$resume['userid']}, $cid, $pid,$interview_time, '$phone', '$name' , $place, '$notice','$time',$did)");
        $res = $dsql->dsqlOper($sql, "lastid");
        if(!is_numeric($res)){
            return array("state"=>200,"info"=>"系统繁忙，邀请失败");
        }

        //增加简历备注
        $this->param = array('type' => 1, 'rid' => $rid);
        $this->customRemark();

        $sql = $dsql::SetQuery("select `address` from `#@__job_address` where `id`=$place");
        $address = $dsql->getOne($sql);

        //消息通知
        $user = array(
            'uid' => $resume['userid'],
            'phone' => $resume['phone'],
            'email' => $resume['email'],
            'name' => $resume['name']
        );
        $urlParam = array(
            'service' => 'member',
            'type' => 'user',
            'template' => 'job-invitation',
        );
        $curl = getUrlPath(array(
            "service"=>"job",
            "template"=>"company",
            "id"=>$cid
        ));
        $purl = getUrlPath(array(
            "service"=>"job",
            "template"=>"job",
            "id"=>$pid
        ));
        $config = $this->config();
        $memberClass = new member();
        $memberConfig = $memberClass->config();
        global $cfg_secureAccess;
        global $cfg_basehost;
        $qrCodeModuleUrl = $config['channelDomain'];
        $week = date("N",$interview_time);
        $weekCN = array("一","二","三","四","五","六","日");
        $week = $weekCN[$week-1];
        $param = array(
            'invitationDetailUrl'=>$memberConfig['userDomain']."/post_detail.html?type=invitation&id=".$res,  //会员中心的面试详情链接
            'moduleLogo'=>$config['logoUrl'], //模块logo
            'qrCodeModuleUrl'=>$qrCodeModuleUrl, //模块链接【首页】
            'company' => $company,
            'curl'=>$curl,
            'purl'=>$purl,
            'post' => $post,
            'date' => date("Y-m-d H:i:s",$interview_time),
            'week' => $week,
            'place' => $address,
            'username' => $name,
            'contact' => $name,
            'phone' => $phone,
            'info' => $notice,
            'resumeName' => $user['name'],  //用户名
            "fields" => array(
                'keyword1' => '邀约企业',
                'keyword2' => '面试岗位',
                'keyword3' => '联系人',
                'keyword4' => '联系电话',
                'keyword5' => '面试地点'
            )
        );
        updateMemberNotice($resume['userid'], "会员-面试邀请通知", $urlParam, $param);
        return '邀请成功！';
    }


    /**
     * 下载的简历：列表（商家）
     */
    public function downResumeList(){
        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }

        $param = $this->param;

        $key = $param['keyword']; //搜索关键字（筛选简历）
        $where = "";
        if($key!=""){
            $key = trim($key);
            $where .= " AND r.`name` like '%$key%'";
        }
        $job = $param['job']; //职位筛选
        if($job){
            $where .= " AND FIND_IN_SET('$job',r.`job`)";
        }
        $progress = $param['progress']; //沟通进度筛选
        if($progress!=""){
            $progress = (int)$progress;
            $where .= " AND rm.`remark_type`=$progress";
        }

        $unSuit = $param['unSuit']; //过滤不合适
        if($unSuit){
            $where .= " AND rm.`remark_type`!=5";
        }

        //过滤无效的简历【不存在 or 已删除】
        $unValid = $param['unValid'];
        if(!empty($unValid)){
            $where .= " and r.`id` is not null and r.`del`=0";
        }

        //查询下载的简历
        $sql = $dsql::SetQuery("select d.* from `#@__job_resume_download` d LEFT JOIN `#@__job_resume` r ON d.`rid`=r.`id` LEFT JOIN `#@__job_remark` rm ON d.`rid`=rm.`rid` and d.`cid`=rm.`cid` where d.`cid`=$company and d.`del`=0".$where." order by d.`id` desc");
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 30;
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        //遍历处理
        $this->right = true;  //（简历下载忽略权限）
        foreach ($pageObj['list'] as & $item){

            $item['id'] = (int)$item['id'];
            $item['rid'] = (int)$item['rid'];
            $item['cid'] = (int)$item['cid'];
            $item['delivery'] = (int)$item['delivery'];
            $item['pid'] = (int)$item['pid'];
            $item['use_combo'] = (int)$item['use_combo'];
            $item['del'] = (int)$item['del'];
            $item['pubdate'] = (int)$item['pubdate'];

            //是否已邀请面试（关级联面试表）
            $sql = $dsql::SetQuery("select `id`, `date` from `#@__job_invitation` where `cid`=$company and `rid`={$item['rid']}");
            $ret = $dsql->getArr($sql);
            if($ret){
                $item['interview'] = (int)$ret['id'];
                $item['interview_time'] = (int)$ret['date'];
            }else{
                $item['interview'] = 0;
                $item['interview_time'] = 0;
            }

            //查看简历信息
            $this->param = array("id"=>$item['rid']);
            $item['resume'] = $this->resumeDetail();

            //标注信息
            $item['remark'] = $this->getRemark($item['rid'],$item['cid']);
        }
        $this->right = false;  //关闭权限
        unset($item);
        return $pageObj;
    }

    /**
     * 更新标注
     */
    public function updateRemark(){
        global $dsql;

        $cid = $this->getCidCheck();
        if(is_array($cid)){
            return $cid;
        }

        $param = $this->param;
        $rids = $param['rid'];
        if(empty($rids)){
            return array("state"=>200,"info"=>"缺少参数：rid");
        }
        $type = $param['update_type'] ?: "remark";
        $types = explode(",",$type);
        $rids = explode(",",$rids);
        foreach ($rids as $rid){
            $set = "";
            $is_set = false;
            //仅更新简历备注
            if(in_array("remark",$types)){
                $remark_resume = $param['remark_resume'];
                $remark_resume_time = GetMkTime(time());
                $set .= "`remark_resume`='$remark_resume',`remark_resume_time`=$remark_resume_time";
                $is_set = true;
            }
            //仅更新沟通标注
            if(in_array("type",$types)){
                $remark_type = (int)$param['remark_type'];

                //如果是取消不合适，前端传过来的remark_type是0，这时需要查询下remark_type_last，将上一次的状态更新到remark_type中
                if($remark_type == 0){
                    $sql = $dsql::SetQuery("select `remark_type_last` from `#@__job_remark` where `cid`=$cid and `rid`=$rid");
                    $ret = $dsql->getArr($sql);
                    if($ret){
                        $remark_type = (int)$ret['remark_type_last'];
                    }
                }

                if($is_set){
                    $set .= ",";
                }
                $set .= "`remark_type_last`=`remark_type`,`remark_type`=$remark_type";
                $is_set = true;
            }
            //仅更新面试标注
            if(in_array("invitation",$types)){
                $remark_invitation = $param['remark_invitation'];
                $remark_invitation_time = time();
                $set = "`remark_invitation`='$remark_invitation',`remark_invitation_time`=$remark_invitation_time";
                $is_set = true;
            }
            if($is_set){
                $sql = $dsql::SetQuery("update `#@__job_remark` set $set where `cid`=$cid and `rid`=$rid");
                $dsql->update($sql);
            }
        }
        return "更新成功";
    }


    /**
     * （批量）更新下载的简历：标注 （ job_resume_download ）
     */
    public function updateDownResume(){
        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }

        $param = $this->param;
        $did = (int)$param['id'];
        if(empty($did)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $dids = explode(",",$did);
        $remark_type = (int)$param['remark_type'];
        $remark = $param['remark'];
        $update_type = $param['update_type'];
        if(empty($update_type)){
            return array("state"=>200,"info"=>"缺少参数：update_type，可选值remark,type");
        }
        $now = time();
        foreach ($dids as $did){
            $sql = $dsql::SetQuery("select delivery,rid from `#@__job_resume_download` where id=$did and `cid`=$company");
            $downArr = $dsql->getArr($sql);
            if($downArr && is_array($downArr)){
                $rid = $downArr['rid'];
                //不合适 { 判断是否投递的简历 }
                if($remark_type==5){
                    //查询是否为投递的简历
                    if($downArr['delivery']==1){
                        if(empty($remark)){
                            return array("state"=>200,"info"=>"缺少参数：remark（拒绝原因）");
                        }
                        //更新所有的投递，为拒绝
                        $sql = $dsql::SetQuery("update `#@__job_delivery` set `refuse_msg`='$remark',`refuse_time`=$now,`state`=2 where `rid`=$rid and `cid`=$company");
                        $dsql->update($sql);
                    }
                }
                //普通的更新状态
                $this->param = array("update_type"=>$update_type,"rid"=>$rid,"remark_resume"=>$remark,"remark_type"=>$remark_type);
                $this->updateRemark();
            }
        }
        return "更新成功";
    }

    /**
     * 内部方法，生成一个标记（在投递简历，或下载简历时，自动初始化标签）
     */
    private function addRemark($rid,$cid){
        global $dsql;
        //判断是否存在
        $sql = $dsql::SetQuery("select id from `#@__job_remark` where `cid`=$cid and `rid`=$rid");
        $exist = $dsql->getOne($sql);
        //如果不存在，则新增一条记录
        if(!is_numeric($exist)){
            $sql = $dsql::SetQuery("insert into `#@__job_remark`(`cid`,`rid`) values($cid,$rid)");
            $dsql->update($sql);
        }
    }

    /**
     * 内部方法，获取一个标签
     */
    private function getRemark($rid,$cid){
        global $dsql;
        $sql = $dsql::SetQuery("select * from `#@__job_remark` where `cid`=$cid and `rid`=$rid");
        $remark = $dsql->getArr($sql);
        if(empty($remark)){
            return array();
        }
        $remark['id'] = (int)$remark['id'];
        $remark['cid'] = (int)$remark['cid'];
        $remark['rid'] = (int)$remark['rid'];
        $remark['remark_resume_time'] = (int)$remark['remark_resume_time'];
        $remark['remark_invitation_time'] = (int)$remark['remark_invitation_time'];
        $remark['remark_type'] = (int)$remark['remark_type'];
        $remark['remark_type_last'] = (int)$remark['remark_type_last'];
        $remark['progress'] = (int)$remark['progress'];
        $remark['custom_unsuit'] = (int)$remark['custom_unsuit'];
        return $remark;
    }

    /**
     * 对我感兴趣
     */
    public function interestMe(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $type = $param['type'];
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 10;
        //找出我所有的简历id
        $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `userid`=$uid");
        $rids = $dsql->getArr($sql);
        if(empty($rids)){
            return array("state"=>200,"info"=>"暂无相关数据");  // 没有简历，无法继续进行下去【这种情况下，不应该请求接口】
        }
        $rids = join(",",$rids);
        $collectSql = $dsql::SetQuery("select 'collect' as 'op', c.`aid` 'rid',c.`userid` 'cu',c.`pubdate` 'time' from `#@__member_collect` c left join `#@__job_company` cm on cm.`userid` = c.`userid` where c.`module`='job' and c.`action`='resume' and c.`aid` in ($rids) and cm.`id` is not null");
        $clickSql = $dsql::SetQuery("select 'click' as 'op', h.`aid` 'rid',h.`uid` 'cu',h.`date` 'time' from `#@__job_historyclick` h left join `#@__job_company` cm on cm.`userid` = h.`uid` where h.`module`='job' and h.`module2`='resumeDetail' and h.`fuid`=$uid and cm.`id` is not null");
        //默认情况下，是全部，则两条sql混合
        $allSql = "SELECT * FROM (".$collectSql." UNION ALL ".$clickSql.") t order by `time` desc";
        //收藏我
        $time = time(); //当前时间
        //没有插入配置？收藏我
        $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='collectMe'");
        $exist = $dsql->getOne($sql);
        if(!$exist){
            $dsql->update($dsql::SetQuery("insert into `#@__job_u_common`(`uid`,`name`,`value`) values($uid,'collectMe','1')"));  //从未看过，时间为1秒
        }
        //没有插入配置？点击我
        $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='clickMe'");
        $exist = $dsql->getOne($sql);
        if(!$exist){
            $dsql->update($dsql::SetQuery("insert into `#@__job_u_common`(`uid`,`name`,`value`) values($uid,'clickMe','1')")); //从未看过，时间为1秒
        }
        if($type=="1"){
            $allSql = "SELECT * FROM (".$collectSql.") t order by `time` desc";
            //让收藏我小红点消失
            $dsql->update($dsql::SetQuery("update `#@__job_u_common` set `value`='$time' where `uid`=$uid and `name`='collectMe'"));
            $lastReadCollect = $time;
        }
        //看过我
        elseif($type==2){
            $allSql = "SELECT * FROM (".$clickSql.") t order by `time` desc";
            //让看过我我小红点消失
            $dsql->update($dsql::SetQuery("update `#@__job_u_common` set `value`='$time' where `uid`=$uid and `name`='clickMe'"));
            $lastReadClick = $time;
        }
        //得到信息列表
        $pageObj = $dsql->getPage($page,$pageSize,$allSql);
        //收藏我未读，看过我未读

        $sql = $dsql::SetQuery("select `pubdate` from `#@__member_collect` where `module`='job' and `action`='resume' and `aid` in ($rids) order by `pubdate` desc limit 1");
        $lastCollect = (int)$dsql->getOne($sql); //最后一条收藏我
        $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='collectMe'");
        $lastReadCollect = $lastReadCollect ?: (int)$dsql->getOne($sql); //我最后一次打开收藏
        $pageObj['pageInfo']['state1'] = $lastCollect > $lastReadCollect ? 1 : 0;
        //点击状态
        $sql = $dsql::SetQuery("select `date` from `#@__job_historyclick` where `module`='job' and `module2`='resumeDetail' and `fuid`=$uid order by `date` desc limit 1");
        $lastClick = (int)$dsql->getOne($sql); //最后一次点击我
        $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='clickMe'");
        $lastReadClick = $lastReadClick ?: (int)$dsql->getOne($sql); //我最后一次打开列表
        $pageObj['pageInfo']['state2'] = $lastClick > $lastReadClick ? 1 : 0;

        //找出公司详情
        foreach ($pageObj['list'] as & $item){
            $item['rid'] = (int)$item['rid'];
            $item['time'] = (int)$item['time'];
            $item['showTime'] = FloorTime(time()-$item['time']);
            $item['cu'] = (int)$item['cu'];  //公司的用户id
            //找出简历的信息
            $sql = $dsql::SetQuery("select `alias` from `#@__job_resume` where `id`=".$item['rid']);
            $item['alias'] = $dsql->getOne($sql);
            //找出公司信息
            $sql = $dsql::SetQuery("select `id`,`title`,`logo`,`famous`,`nature`,`industry`,`addrid`,`people_pic`,`people`,`people_job` from `#@__job_company` where `userid`=".$item['cu']);
            $companyDetail = $dsql->getArr($sql);
            $item['companyTitle'] = $companyDetail['title'];
            $item['companyFamous'] = (int)$companyDetail['famous'];
            $item['companyLogo'] = getFilePath($companyDetail['logo']);
            $item['companyNature'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".(int)$companyDetail['nature']));
            $item['companyIndustry'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".(int)$companyDetail['industry']));
            $item['companyAddrid'] = (int)$companyDetail['addrid'];
            $item['companyAddrName'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`=".(int)$companyDetail['addrid']));
            $item['companyPeople_pic'] = getFilePath($companyDetail['people_pic']);
            $item['companyPeople_job'] = $companyDetail['people_job'];
            $item['companyPeople'] = $companyDetail['people'];
            $item['companyUrl'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$companyDetail['id']
            ));
            //获取企业最后登录信息
            $sql = $dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`=$uid order by `id` desc limit 1");
            $loginTime = (int)$dsql->getOne($sql);
            $loginDate = date("Y-m-d",$loginTime); //最后登录的那天
            $currentDate = date("Y-m-d");
            $login = 3;  //假设未登录
            if(abs($loginTime - $time) < 300){ //300秒，5分钟内
                $login = 1;  //5分钟内登录
            }elseif($loginDate==$currentDate){
                $login = 2;  //今日登录了
            }
            $item['login'] = $login;
        }
        unset($item);
        //响应结果，即可
        return $pageObj;
    }


    /**
     * 下载的简历：批量删除（软删除）
     */
    public function delDownResume(){
        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        if(is_array($company)){
            return $company;
        }
        //删除指定下载的简历
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }

        //批量删除数据（必须加上 cid 条件，禁止胡乱删除别人的数据）
        $sql = $dsql::SetQuery("update `#@__job_resume_download` set `del`=1 where `id` in($id) and `cid`=$company");
        $res = $dsql->update($sql);

        if($res=="ok"){
            return "删除成功";
        }
        else{
            return array("state"=>200,"info"=>"删除失败");
        }
    }


    /**
     * 下载的简历：增加下载简历（同时发送简历到邮箱）
     */
    public function downloadResume(){
        global $dsql;
        global $userLogin;

        // 先取出param
        $param = $this->param;
        $id = (int)$param['id'];  // 简历的 rid
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id","type"=>"fail");
        }
        $userid = $this->getUid();
        //下载到本地，直接生成pdf，
        $local = $param['local'];//下载到本地
        if($local){
            global $huoniaoTag;
            if(is_null($huoniaoTag)){
                $huoniaoTag = initTemplateTag();
            }
            global $cfg_staticPath;
            $huoniaoTag->assign("cfg_staticPath",$cfg_staticPath);
            $configs = $this->config();
            $huoniaoTag->assign("job_logoUrl",$configs['logoUrl']);
            $host = $huoniaoTag->tpl_vars["cfg_currentHost"]->value;  //域名
            $huoniaoTag->assign("templets_skin",$host."/templates/poster/job/resume/skin1/");
            $html = $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/header.html');
            $handlers = new handlers("job","resumeDetail");
            $res = $handlers->getHandle(array("id"=>$id));
            if($res['state']==200){  //简历异常
                return $res;
            }
            $res = $res['info'];

            if($res['userid'] != $userid){
                $company = $this->getCid();
                if(is_array($company)){
                    return $company;
                }
            }

            foreach ($res as $key => $item){
                $huoniaoTag->assign("detail_".$key, $item);
            }
            $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/body.html');
            $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/footer.html');
            $pdf = strToPdf($html) ?: array();
            if($pdf && is_array($pdf)){
                if($local==1){
                    header('Content-type: application/pdf');
                    header('Content-Disposition: attachment; filename="'.$res['name'].'的简历.pdf"');
                    readfile($pdf['path']);
                }else{
                    $url = (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == '443') ? 'https://' : 'http://';
                    $url .= $_SERVER['HTTP_HOST'];
                    $url .= substr($pdf['path'],strlen(HUONIAOROOT));
                    return array("state"=>100,"info"=>$url);
                }
            }else{
                return array("state"=>200,"info"=>"系统繁忙"); //下载异常
            }
            die;
        }

        $company = $this->getCid();
        if(is_array($company)){
            return $company;
        }
        
        // 取得完整的store信息（需要套餐信息等）
        $this->param = array('id'=>$company);
        $storeArr = $this->companyDetail();
        //是否发送简历到邮箱
        $postEmail = $param['postEmail'];
        $setPostEmail = (int)$dsql->getOne($dsql::SetQuery("select `email_buyResume` from `#@__job_company` where `id`=$company"));
        if($setPostEmail){ //后端设置过要发送，则一定发送
            $postEmail = 1;
        }
        $customEmail = $param['email'];
        $onlyBuy = (int)$param['onlyBuy'];  //表示只是购买简历，不需要发送到邮箱也不需要下载到本地
        if($onlyBuy){
            $postEmail = 0;
        }
        if($postEmail){
            //校验企业邮件
            $email = $storeArr['email'];
            if(empty($email)){
                if(!empty($customEmail)){
                    //直接更新企业设置
                    $sql = $dsql::SetQuery("update `#@__job_company` set `email`='$email',`email_buyResume`=1 where `id`={$company}");
                    $dsql->update($sql);
                    $email = $customEmail;
                }else{
                    return array("state"=>200,"info"=>"请配置邮箱","type"=>"fail");
                }
            }
        }
        //区分是有已经下载过而删除，如果是则恢复状态（不重复扣钱）
        $sql = $dsql::SetQuery("select `pubdate` from `#@__job_resume_download` where `rid`=$id and `cid`=$company");
        $exist = $dsql->getOne($sql);
        if(is_numeric($exist)){
            $sql = $dsql::SetQuery("update `#@__job_resume_download` set `del`=0");
            $up = $dsql->update($sql);
            if($up=="ok"){
                //如果在投递表中，则强制加投递标识
                $sql = $dsql::SetQuery("select `id` from `#@__job_delivery` where `rid`=$id and `cid`=$company");
                $one = $dsql->getOne($sql);
                if(is_numeric($one)){
                    $sql = $dsql::SetQuery("update `#@__job_resume_download` set `delivery`=1 where `cid`=$company and `rid`=$id");
                    $dsql->update($sql);
                }
                $sql = $dsql::SetQuery("select `name`, `phone` from `#@__job_resume` where `id`=".$id);
                $name = $dsql->getArr($sql);
                $returnValue = array("name" => $name['name'], "phone" => $name['phone'], "message" => "下载成功");
            } else{
                $returnValue = array("state"=>200,"info"=>"下载失败","type"=>"fail");
            }
        }
        //首次下载
        else{
            //区分是否投递的简历 || 购买的简历等
            $sql = $dsql::SetQuery("select `pid` from `#@__job_delivery` where `rid`=$id and `cid`=$company");
            $one = $dsql->getOne($sql);
            $use_combo = 2;  //是否使用套餐资源下载？{1.是，2.否}
            if(is_numeric($one)){
                $is_delivery = 1;
                $pid = $one; // 投递了哪个职位？
            }else{
                $is_delivery = 0;
                $pid = 0;
            }
            //简历购买资源扣除【改：投递的简历也要收费才能下载】
            //1.首先检测套餐剩余（当天可用资源）
            if($storeArr['can_resume_down']==-1 || $storeArr['can_resume_down']>=1){
                //不用手动减余量，余量是通过表查询统计出来的
                $use_combo = 1;
            }
            //检测增值包余量
            elseif($storeArr['package_resume']>=1){
                //减少增值包的余量
                $sql = $dsql::SetQuery("update `#@__job_company` set `package_resume`=`package_resume`-1 where `id`={$storeArr['id']}");
                $dsql->update($sql);
            }
            //下载失败
            else{
                return array("state"=>200,"info"=>"可用资源不足，无法下载，请购买简历","type"=>"pay");
            }
            //插入数据到下载表中
            $time = time();
            $ordernum = create_ordernum();
            $sql = $dsql::SetQuery("insert into `#@__job_resume_download`(`rid`,`cid`,`delivery`,`pubdate`,`use_combo`,`pid`,`ordernum`) values($id,$company,$is_delivery,$time,$use_combo,$pid,'$ordernum')");
            $up = $dsql->update($sql);
            if($up=="ok"){
                //生成订单表【修改后的购买==下载，所以用套餐资源也要加入订单表，否则容易出错】
                $sql = $dsql::SetQuery("insert into `#@__job_order`(`uid`, `type`, `ordernum`, `orderdate`, `aid`, `amount`, `orderstate`, `paydate`, `paytype`) values($userid, 3, '$ordernum', $time, $id, 0, 1, $time, 'money')");
                $dsql->update($sql);
                //info
                $postTitle = $dsql->getArr($dsql::SetQuery("select `name`, `phone` from `#@__job_resume` where `id`=$id"));
                $subject = "下载简历：".$postTitle['name'];
                $paramData = array("service"=>"job","subject"=>$subject);
                $paramData = serialize($paramData);
                $sql = $dsql::SetQuery("insert into `#@__pay_log`(`ordertype`, `ordernum`, `uid`, `amount`, `paytype`, `state`, `pubdate`, `param_data`) values('job','$ordernum',$userid, 0, 'money', 1,$time,'$paramData')");
                $dsql->update($sql);
                //生成标记记录
                $this->addRemark($id,$company);
                $returnValue = array("name" => $postTitle['name'], "phone" => $postTitle['phone'], "message" => "下载成功");
            } else{
                $returnValue = array("state"=>200,"info"=>"下载失败","type"=>"fail");
            }
        }
        //如果下载成功，根据参数决定是否发送邮件到邮箱中
        if(is_array($returnValue) && $postEmail==1){
            //发送简历到邮箱中
            global $huoniaoTag;
            if(is_null($huoniaoTag)){
                $huoniaoTag = initTemplateTag();
            }
            global $cfg_staticPath;
            $huoniaoTag->assign("cfg_staticPath",$cfg_staticPath);
            $host = $huoniaoTag->tpl_vars["cfg_currentHost"]->value;  //域名
            $huoniaoTag->assign("templets_skin",$host."/templates/poster/job/resume/skin1/");
            $html = $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/header.html');
            $handlers = new handlers("job","resumeDetail");
            $res = $handlers->getHandle(array("id"=>$id));
            $res = $res['info'];
            foreach ($res as $key => $item){
                $huoniaoTag->assign("detail_".$key, $item);
            }
            $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/body.html');
            $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/footer.html');
            $pdf = strToPdf($html) ?: array();

            $html = addslashes($html);  // 加反义，否则无法存到数据库

            if($pdf && is_array($pdf)){
                $sql = $dsql::SetQuery("select `name`, `phone` from `#@__job_resume` where `id`=".$id);
                $ret = $dsql->getArr($sql);
                $name = $ret['name'];
                $phone = $ret['phone'];
                global $cfg_shortname_;
                $send = sendmail($email, $name . "的简历【".$cfg_shortname_."】","<small>请直接在附件中下载</small>",array("attaches"=>array(array("path"=>$pdf['path'],"name"=>$name."的简历.pdf"))));

                //如果发送成功，记录日志等（成功时无return）
                if(empty($send)){
                    unlinkFile($pdf['path']);
                    messageLog("email", "resume", $email, "简历下载", $html, $userid, 0, "");
                    $returnValue = array("name" => $name, "phone" => $phone, "message" => "发送成功");
                }
                //发送失败，记录失败邮件日志。
                else{
                    messageLog("email", "resume", $email, "简历下载", $html, $userid, 1, "");
                    return array("state"=>200,"info"=>"发送失败，错误信息：" . $send);
                }
            }
        }
        return $returnValue;
    }


    /**
     * 收藏简历：查询列表（商家）
     */
    public function collectResumeList(){
        global $dsql;
        global $userLogin;

        $company = $this->getCid();
        if(is_array($company)){
            return $company;
        }
        $uid = $this->getUid();
        //查询收藏列表，并关联信息（member_collect）
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $pid = $param['pid'];
        $keyword = $param['keyword'];
        $where = " AND c.`userid`=$uid";
        if($pid!=""){
            $pid = (int)$pid;
            $where .= " AND FIND_IN_SET('$pid',r.`job`)";
        }
        if($keyword!=""){
            $keyword = trim($keyword);
            $where .= " AND r.`name` like '%$keyword%'";
        }
        //过滤无效的简历【不存在 or 已删除】
        $unValid = $param['unValid'];
        if(!empty($unValid)){
            $where .= " and r.`id` is not null and r.`del`=0";
        }
        
        //查询数据
        $sql = $dsql::SetQuery("select c.`aid` from `#@__member_collect` c LEFT JOIN `#@__job_resume` r ON c.`aid`=r.`id` where r.`id` IS NOT NULL AND c.`module`='job' and c.`action`='resume'".$where);
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        //遍历、并查询是否已下载（关联简历下载表）
        $this->right = true;  //改、前端判断权限
        foreach ($pageObj['list'] as & $item){  // 这里的 id 是 rid
            $sql = $dsql::SetQuery("select `id` from `#@__job_resume_download` where `cid`=$company and `rid`={$item['aid']}");
            $down = $dsql->getArr($sql);
            if(is_array($down) && $down){
                $item['download'] = 1;
            }else{
                $item['download'] = 0;
            }
            $this->param['id'] = $item['aid'];
            $item['resume'] = $this->resumeDetail();
        }
        $this->right =false;
        unset($item);
        return $pageObj;
    }


    /**
     * 投递信息：查询列表（公司被投递简历）
     */
    public function deliveryList(){
        global $dsql;

        $param = $this->param;

        $download = (int)$param['download'];  //将数据导出

        $where = "";
        // 登录商家后台获取投递列表（公司）

        $cid = $this->getCidCheck();
        if(is_array($cid)){
            return $cid;
        }
        $where .= " AND d.`cid`=$cid AND d.`del`=0 AND p.`id` IS NOT NULL";

        //状态筛选
        $stateWhere = "";
        $state = $param['state'];
        if($state!=""){
            if($state!=3){
                $state = (int)$state;
                $stateWhere .= " AND d.`state`=$state";
            }
            //状态为3，表示已下载（匹配是否存在下载表）
            else{
                $stateWhere .= " ".$dsql::SetQuery(" AND exists(select rd.`id` from `#@__job_resume_download` rd where rd.`rid`=d.`rid` and rd.`cid`=d.`cid`)");
            }
        }
        //关键字
        $key = $param['keyword'];
        if($key){
            $key = trim($key);
            $where .= " AND r.`name` like '%$key%'";
        }

        //职位id
        $pid = $param['pid'];
        if($pid!=""){
            $pid = (int)$pid;
            $where .= " AND d.`pid`=$pid";
        }
        //过滤不合适
        $unSuit = $param['unSuit'];
        if(!empty($unSuit) && $state == ''){
            $where .= " AND d.`state`!=2";
        }
        $_where = '';
        if(!empty($unSuit)){
            $_where .= " AND d.`state`!=2";
        }
        //过滤无效的简历【不存在 or 已删除】
        $unValid = $param['unValid'];
        if(!empty($unValid)){
            $where .= " and r.`id` is not null and r.`del`=0";
        }
        //性别
        $sex = $param['sex'];
        if($sex!=""){
            $sex = (int)$sex;
            $where .= " AND r.`sex`=$sex";
        }

        //年龄
        $min_age = $param['min_age'];
        if($min_age!=""){
            $min_age = (int)$min_age;
            $cur_year = (int)date("Y");
            $year = (int)($cur_year-$min_age);
            $min_age_str = "".$year.date("-m-d H:i:s");
            $min_age_time = strtotime($min_age_str);
            $where .= " AND r.`birth`<=".$min_age_time;
        }
        $max_age = $param['max_age'];
        if($max_age!=""){
            $max_age = (int)$max_age;
            $cur_year = (int)date("Y");
            $year = (int)($cur_year-$max_age);
            $max_age_str = "".$year.date("-m-d H:i:s");
            $max_age_time = strtotime($max_age_str);
            $where .= " AND r.`birth`>=".$max_age_time;
        }
        //学历筛选（最高学历）
        $education = $param['education'];
        if($education!=""){
            $education = (int)$education;
            $where .= " AND r.`edu_tallest`=$education";
        }
        //专业筛选
        $edu_profession = trim($param['edu_profession']);
        if($edu_profession!=""){
            $where .= " AND r.`edu_profession`=$edu_profession";
        }
        //投递时间
        $start_time = $param['start_time'];
        $end_time = $param['end_time'];
        $start_time = $start_time ? GetMkTime($start_time) : 0;
        $end_time = $end_time ? GetMkTime($end_time) : 0;
        $end_time = $end_time ? $end_time + 86400 : 0;
        if($start_time){
            $where .= " AND d.`date` >= $start_time";
        }
        if($end_time){
            $where .= " AND d.`date` < $end_time";
        }

        $orderby = " order by d.`top` desc,d.`id` desc";

        $sql = $dsql::SetQuery("select d.* from `#@__job_delivery` d LEFT JOIN `#@__job_resume` r ON d.`rid`=r.`id` left join `#@__job_post` p on d.`pid`=p.`id` where 1=1 AND p.`id` IS NOT NULL AND r.`id` IS NOT NULL".$where);
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;

        //如果是导出数据，考虑到性能，暂时最多导出1万条
        if($download){
            $pageSize = 10000;
        }

        $pageObj = $dsql->getPage($page,$pageSize,$sql.$stateWhere.$orderby);
        
        //统计
        $pageObj['pageInfo']['stateA'] = (int)$dsql->count($sql.$_where);
        $pageObj['pageInfo']['state0'] = (int)$dsql->count($sql." and d.`state`=0"." AND d.`cid`=$cid AND d.`del`=0");
        $pageObj['pageInfo']['state1'] = (int)$dsql->count($sql." and d.`state`=1"." AND d.`cid`=$cid AND d.`del`=0");
        $pageObj['pageInfo']['state2'] = (int)$dsql->count(str_replace('AND d.`state`!=2', '', $sql)." and d.`state`=2"." AND d.`cid`=$cid AND d.`del`=0");
        $pageObj['pageInfo']['state3'] = (int)$dsql->count($sql." ".$dsql::SetQuery("and exists(select rd.`id` from `#@__job_resume_download` rd where rd.`rid`=d.`rid` and rd.`cid`=d.`cid`)"." AND d.`cid`=$cid AND d.`del`=0"));

        //导出数据
        if($download){
            $tit = array();
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '姓名'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '年龄'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '性别'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '学历'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '工作经验'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '毕业学校'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '投递职位'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '职位性质'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '期望薪资'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '投递时间'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '简历状态'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下载简历'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '联系电话'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '面试邀请'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '面试时间'));

            $folder = "/uploads/job/file/";
            $fileName = "投递的简历-".$cid."-".create_ordernum().".csv";
            $filePath = HUONIAOROOT.$folder.$fileName;

            MkdirAll(HUONIAOROOT.$folder);
            $file = fopen($filePath, "w");

            //表头
            fputcsv($file, $tit);
        }

        $this->right = true;
        foreach ($pageObj['list'] as & $item){

            //获取简历信息
            $this->param = array('id'=> $item['rid']);
            $item['resume'] = $this->resumeDetail();

            //获取职位信息
            $this->param = array('id'=>$item['pid']);
            $item['post'] = $this->postDetail();

            $item['id'] = (int)$item['id'];
            $item['read'] = (int)$item['read'];
            $item['read_time'] = (int)$item['read_time'];
            unset($item['del']);
            $item['rid'] = (int)$item['rid'];
            $item['pass_time'] = (int)$item['pass_time'];
            $item['refuse_time'] = (int)$item['refuse_time'];
            $item['cid'] = (int)$item['cid'];
            $item['pid'] = (int)$item['pid'];
            $item['date'] = (int)$item['date'];
            $item['state'] = (int)$item['state'];
            $item['userid'] = (int)$item['userid'];
            //是否已下载
            $sql = $dsql::SetQuery("select id from `#@__job_resume_download` where `rid`={$item['rid']} and `cid`={$item['cid']}");
            $_download = (int)$dsql->getOne($sql);
            $item['download'] = $_download ? 1 : 0;

            //获取标签
            $remark = $this->getRemark($item['rid'],$item['cid']);
            $item['remark'] = $remark['remark_resume'] ?: "";
            $item['remark_time'] = $remark['remark_resume_time'] ?: 0;

            //查看是否反复投递？
            $item['post_last'] = $this->getDelivery($cid,$item['userid']);
            //计算投递过几次？
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `cid`={$cid} and `userid`={$item['userid']}");
            $item['deliveryCount'] = (int)$dsql->getOne($sql);

            //导出数据
            if($download){
                $arr = array();
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['name']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['age']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['sex_name']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['edu_tallest_name']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['work_jy_name']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['edu_school']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['post']['title']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['nature_name']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $item['resume']['min_salary'] . '-' . $item['resume']['max_salary']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date('Y-m-d H:i:s', $item['date'])));

                $_state = '';
                if($item['resume']['del']){
                    $_state = '已失效';
                }elseif($item['state'] == 0){
                    $_state = '待处理';
                }elseif($item['state'] == 1){
                    $_state = '通过初筛';
                }elseif($item['state'] == 2){
                    $_state = '不合适';
                }

                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $_state));

                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $_download ? '已下载' : '未下载'));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $_download ? $item['resume']['phone'] : ''));

                $is_interview = 0;
                $interview_time = '';
                if($item['resume']['remark'] && $item['resume']['remark']['remark_type'] == 1){
                    $is_interview = 1;
                    $interview_time = $item['interview_time'] ?: $item['resume']['invitation_time'];
                }
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $is_interview ? '已约面' : ''));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $is_interview && $interview_time ? date('Y-m-d H:i:s', $interview_time) : ''));

                //写入文件
                fputcsv($file, $arr);
            }
        }
        $this->right = false;
        unset($item);

        if($download){
            global $cfg_basedomain;
            $downloadUrl = $cfg_basedomain . $folder . $fileName;
            return $downloadUrl;
        }else{
            return $pageObj;
        }
    }

    /**
     * 获取上次投递信息
     */
    public function getDelivery($cid,$userid){
        global $dsql;
        $sql = $dsql::SetQuery("select * from `#@__job_delivery_last` where `cid`=$cid and `uid`=".$userid);
        $res = $dsql->getArr($sql);
        if($res && is_array($res)){
            $res['id'] = (int)$res['id'];
            $res['cid'] = (int)$res['cid'];
            $res['cid'] = (int)$res['uid'];
            $res['post_date'] = (int)$res['post_date'];
            return (object)$res;
        }
        return (object)array();
    }


    /**
     * 投递信息：更新状态
     */
    public function updateDelivery($cid=0){
        global $dsql;
        global $userLogin;

        //获取公司信息
        if($cid==0){
            $company = $this->getCidCheck();
            if(is_array($company)){
                return $company;
            }
        }else{
            $company = $cid;
        }

        $param = $this->param;
        $dids = $param['id'];  //投递表的id
        $rids = $param['rid'];  //简历id列表【匹配最后一个投递】
        if(empty($dids) && empty($rids)){
            return array("state"=>200,"info"=>"缺少参数：id，或 rid");
        }elseif(empty($dids)){
            //找出这些简历投递的最后一个
            $dids = array();
            $rids = explode(",",$rids);
            foreach ($rids as $ridItem){
                $dids[] = (int)$dsql->getOne($dsql::SetQuery("select `id` from `#@__job_delivery` d where `cid`=$company and `rid`=$ridItem order by `id` desc limit 1"));
            }
        }else{
            $dids = explode(",",$dids);
        }
        $refuse_msg = $param['refuse_msg'];
        foreach ($dids as $did){
            //参数校验
            if(!is_numeric($did)){
                return array("state"=>200,"info"=>"非法参数，请传递id列表，并用逗号分割");
            }
            //如果有state，则更新状态
            if($param['state']!=""){
                $state = (int)$param['state'];  //强制转 int
                $time = time();
                //通过记录通过时间、拒绝记录拒绝时间
                if($state==1){ //通过
                    $sql = $dsql::SetQuery("update `#@__job_delivery` set `state`=1,`pass_time`=$time where `id`=$did and `cid`=$company and `del`=0");
                }
                elseif($state==2){ //拒绝
                    if(empty($refuse_msg)){
                        return array("state"=>200,"info"=>"请填写拒绝原因");
                    }
                    $sql = $dsql::SetQuery("update `#@__job_delivery` set `state`=2,`refuse_time`=$time,`refuse_msg`='$refuse_msg' where `id` =$did and `cid`=$company and `del`=0");

                    //增加处理记录
                    $this->param = array('unsuit' => 1, 'rid' => $rids[0]);
                    $this->customRemark();
                }else{  //待处理
                    $sql = $dsql::SetQuery("update `#@__job_delivery` set `state`=0 where `id`=$did and `cid`=$company and `del`=0");
                }

                //执行更新 sql ，并响应结果
                $res = $dsql->update($sql);
            }
        }
        return "更新成功";
    }


    /**
     * 投递信息：批量删除（软删除、商家不可见、用户可见）
     */
    public function delDelivery(){
        global $dsql;
        global $userLogin;

        $company = $this->getCidCheck();
        //删除指定投递
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $ids = explode(",",$id);
        //循环删除
        foreach ($ids as $key=>$value){
            $sql = $dsql::SetQuery("select r.`del` from `#@__job_delivery` d LEFT JOIN `#@__job_resume` r ON d.`rid`=r.`id` where d.`id`=$value and d.`cid`=$company");
            $resume_is_del = $dsql->getOne($sql);
            $sql = $dsql::SetQuery("update `#@__job_delivery` set `del`=1 where `id`=$value and `cid`=$company and (`state`=2 OR $resume_is_del=1)");
            $dsql->update($sql);
        }
        return "删除成功";
    }


    /**
     * 投递简历：新增 （反复投递、有限制）
     */
    public function delivery(){

        global $dsql;
        global $userLogin;
        $uid   = $userLogin->getMemberID();
        if($uid<0){
            return array("state"=>200,"info"=>"请登录");
        }

        $param = $this->param;
        $time = time();
        //特殊判断
        $rec = $param['rec']; //投递详情页首次投递，则记录到 job_u_common 表中
        if(!empty($rec)){
            $exist = $dsql->getOne($dsql::SetQuery("select `id` from `#@__job_u_common` where `uid`=$uid and `name`='deliveryDetailPost'"));
            if(!$exist){
                $dsql->update($dsql::SetQuery("insert into `#@__job_u_common`(`uid`,`name`,`value`) values($uid,'deliveryDetailPost','$rec')"));
            }
        }
        //rid ，简历id
        $rid = $param['rid'];
        if(empty($rid)){
            return array("state"=>200,"info"=>"缺少参数：rid");
        }
        $sql = $dsql->SetQuery("SELECT `id`, `name`, `birth`, `min_salary`,`max_salary`,`userid`,`edu_tallest`,`completion`,`birth`,`work_jy`,`state` FROM `#@__job_resume` WHERE `id` = " . $rid);
        $ret = $dsql->getArr($sql);
        if(!$ret || !is_array($ret)){
            return array("state"=>200,"info"=>"简历不存在");
        }
        if($ret['state']!=1){
            if($ret['state']==0){
                return array("state"=>200,"info"=>"简历待审核");
            }else{
                return array("state"=>200,"info"=>"简历审核失败");
            }
        }
        $username = $ret['name'];
        //职位id列表，多个使用 , 分割
        $pid = $param['pid'];
        if(empty($pid)){
            return array("state"=>200,"info"=>"缺少参数：pid");
        }
        $ids = explode(",", $pid);
        $is_batch = 0;
        if(count($ids)>1){
            $is_batch = 1;  //是批量投递
        }
        //判断简历的数量
        $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=".$ret['userid']);
        $resumeCount = (int)$dsql->getOne($sql);
        if($resumeCount>1){
            //判断是否多简历后第一次投递
            $multiResumeFirstDelivery = $this->get_u_common($uid,"multiResumeFirstDelivery");
            if(empty($multiResumeFirstDelivery)){
                $this->update_u_common($uid,"multiResumeFirstDelivery","1"); //记录多简历已经投递过
            }
        }
        $result = array();
        foreach ($ids as $pi){
            //根据职位id，查询公司id，以及公司管理人信息（用于发送通知）
            $sql = $dsql::SetQuery("SELECT p.`company` 'cid', p.`title`, `max_salary`,c.`delivery_limit_interval`,c.`delivery_limit_certifyState`,c.`delivery_limit_phoneCheck`,c.`delivery_refuse`,c.`sms_delivery`,c.`email_delivery`, c.`userid`,p.`educational`,p.`min_age`,p.`max_age`,p.`experience` FROM `#@__job_post` p LEFT JOIN `#@__job_company` c ON c.`id` = p.`company` WHERE p.`id` = " . $pi);
            $arr = $dsql->getArr($sql);

            //如果公司存在
            if($arr && is_array($arr)){
                $jobName = $arr['title'];
                $cid = $arr['cid'];
                $cuid = $arr['userid'];
                if($uid == $cuid){ //禁止自己投自己
                    $result[] = array(
                        'pid'=>$pi,
                        'name'=>$jobName,
                        'type'=>'fail',
                        'msg'=>'禁止自己投递自己',
                        'msg2'=>'企业用户不可投递自身职位'
                    );
                    continue;
                }
                //判断是否实名认证，手机
                //查找投递用户信息
                $sql = $dsql::SetQuery("select `certifyState`,`phoneCheck` from `#@__member` where `id`=$uid");
                $userInfo = $dsql->getArr($sql);
                if($arr['delivery_limit_certifyState']==1 && $userInfo['certifyState']!=1){  //实名认证
                    $result[] = array(
                        'pid'=>$pi,
                        'name'=>$jobName,
                        'type'=>'fail',
                        'msg'=>'需要实名认证',
                        'msg2'=>'请先进行实名认证，再投递该职位'
                    );
                    continue;
                }
                if($arr['delivery_limit_phoneCheck']==1 && $userInfo['phoneCheck']!=1){
                    $result[] = array(
                        'pid'=>$pi,
                        'name'=>$jobName,
                        'type'=>'fail',
                        'msg'=>'需要手机认证',
                        'msg2'=>'请先进行手机号认证，再投递该职位'
                    );
                    continue;
                }
                //校验一个简历是否已经投递过（无视职位，只考虑公司）？ 如果已经投递过，则跳过
                $sql = $dsql::SetQuery("select `id`,`date`,`pid`,`state` from `#@__job_delivery` where `userid`=$uid and `cid`={$arr['cid']} order by `date` desc limit 1");
                $postMeta = $dsql->getArr($sql);
                if($postMeta && is_array($postMeta)){
                    //计算上次投递间隔。如果在间隔时间内，直接跳过
                    $pass_time = time()-$postMeta['date'];
                    $pass_date = (int)($pass_time/86400);
                    $month = $arr['delivery_limit_interval']; //间隔的月份
                    if($pass_date < $month*30){
                        if($pi==$postMeta['pid']){
                            $result[] = array(
                                'pid'=>$pi,
                                'name'=>$jobName,
                                'type'=>'fail',
                                'msg'=>"你已投递过该职位",
                                'msg2'=>'请勿在短期内重复投递已投递过的职位'
                            );
                        }else{
                            $result[] = array(
                                'pid'=>$pi,
                                'name'=>$jobName,
                                'type'=>'fail',
                                'msg'=>"近期已投递过该公司",
                                'msg2'=>'请勿在短期内重复投递同一公司的职位<br>如改变求职意向，可与招聘负责人沟通'
                            );
                        }
                        continue;
                    }
                    //否则，说明时间过了，于是记录为已投递过，记录上次投递信息
                    //先获取上次投递职位标题
                    $sql = $dsql::SetQuery("select `title` from `#@__job_post` where `id`=".$postMeta['pid']);
                    $last_title = $dsql->getOne($sql) ?: "未知";
                    //先判断 state ，如果是0.未处理，1.通过初筛，2.初筛拒绝
                    $last_result = "";
                    if($postMeta['state']==0){
                        $last_result = "投递未处理";
                    }
                    elseif($postMeta['state']==2){
                        $last_result = "未通过初筛";
                    }
                    elseif($postMeta['state']==1){
                        $last_result = "初筛通过，无面试";
                        //查询面试信息
                        $sql = $dsql::SetQuery("select * from `#@__job_invitation` where `pid`=".$postMeta['pid']." and rid=$rid");
                        $invition = $dsql->getArr($sql);
                        if($invition && is_array($invition)){
                            //如果存在面试记录
                            if($invition['state']==1){
                                $last_result = "待面试";
                            }
                            elseif($invition['state']==2){
                                $last_result = "已取消面试";
                            }
                            elseif($invition['state']==3){
                                $last_result = "沟通offer";
                            }
                            elseif($invition['state'==4]){
                                $last_result = "待入职";
                                if($invition['rz_state']==1){
                                    $last_result = "已入职";
                                }
                                elseif($invition['rz_state']==2){
                                    $last_result = "取消入职";
                                }
                            }
                            elseif($invition['state']==5){
                                $last_result = "取消入职";
                            }
                        }
                    }
                    //记录到上次投递的表中
                    $sql = $dsql::SetQuery("select * from `#@__job_delivery_last` where `cid`=$cid and `uid`=".$ret['userid']);
                    $exist = $dsql->getArr($sql);
                    //更新
                    if($exist && is_array($exist)){
                        $sql = $dsql::SetQuery("update `#@__job_delivery_last` set `post_title`='$last_title',`result`='$last_result',`post_date`=".$postMeta['date']);
                        $dsql->update($sql);
                    }
                    //插入数据
                    else{
                        $sql = $dsql::SetQuery("insert into `#@__job_delivery_last`(`cid`,`uid`,`post_title`,`result`,`post_date`) values($cid,{$ret['userid']},'$last_title','$last_result',{$postMeta['date']})");
                        $dsql->update($sql);
                    }
                }
                $jobDeliveryTopCount = (int)$this->get_u_common($uid,"jobDeliveryTopCount");
                $is_top = 0;
                if($jobDeliveryTopCount > 0){ //如果有置顶次数，消耗一个置顶次数
                    $is_top = 1;
                    $jobDeliveryTopCount = $jobDeliveryTopCount -1;
                    $this->update_u_common($uid,"jobDeliveryTopCount",$jobDeliveryTopCount);
                }

                //投递前判断是否有浏览记录，如果没有则新增
                $sql = $dsql::SetQuery("select `id` from `#@__job_historyclick` where `uid` = $uid and `aid` = $pid and `module` = 'job' and `module2` = 'postDetail'");
                $_ret = $dsql->getOne($sql);
                if(!$_ret){
                    $sql = $dsql::SetQuery("update `#@__job_post` set `click`=`click`+1 where `id`= $pid");
                    $dsql->update($sql);

                    $uphistoryarr = array(
                        'module'    => 'job',
                        'uid'       => $uid,
                        'aid'       => $pid,
                        'fuid'      => $cuid,
                        'module2'   => 'postDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);

                    $time += 1;  //为了让浏览记录排在前面
                }

                //插入到简历投递表
                $sql = $dsql::SetQuery("insert into `#@__job_delivery`(`rid`,`cid`,`pid`,`date`,`userid`,`batch`,`top`) values($rid,$cid,$pi,$time,$uid,$is_batch,$is_top)");
                $did = $dsql->dsqlOper($sql,"lastid");
                if(is_numeric($did)){
                    $result[] = array(
                        'id'=>$pi,
                        'name'=>$jobName,
                        'type'=>'success',
                        'msg'=>'投递成功',
                        'msg2'=>'您已成功投递该职位'
                    );
                    //生成标记信息
                    $this->addRemark($rid,$cid);

                    //判断对方是否下载过我的简历，把下载表设置为当前投递职位
                    $sql = $dsql::SetQuery("select * from `#@__job_resume_download` where `cid`=$cid and `rid`=$rid order by `pubdate` desc limit 1");
                    $hasDownload = $dsql->getArr($sql);
                    if($hasDownload){
                        //简历下载表，是商家-简历的，和职位无关，仅关联最后一次投递信息
                        $sql = $dsql::SetQuery("update `#@__job_resume_download` set `delivery`=1,`pid`=$pi,`did`=$did where `id`=".$hasDownload['id']);
                        $dsql->update($sql);
                    }
                    //尝试判断是否自动拒绝
                    $delivery_refuse = $arr['delivery_refuse'];
                    if($delivery_refuse){
                        $delivery_refuse = json_decode($delivery_refuse,true);
                        //自动过滤学历
                        $education = $delivery_refuse['education'];
                        if($education==-2){
                            //如果简历职位id < 职位要求学历id，说明学历不够，直接拒绝【学位灵活可自定义，但学历分类id应该按照从低到高生成，否则此规则误判】
                            if($ret['edu_tallest'] < $arr['educational']){
                                $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"学历不匹配");
                                $this->updateDelivery($cid);
                                continue;
                            }
                        }
                        //自动过滤简历完整度（如果简历完整度，简历完整度小于职位完整度则拒绝）
                        $complete = $delivery_refuse['complete'];  //要求的完整度
                        if($complete > $ret['completion']){
                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //完整度太低
                            $this->updateDelivery($cid);
                            continue;
                        }
                        //最大年龄和最小年龄过滤
                        $age = getBirthAge(date("Y-m-d",$ret['birth'])); //取得简历的年龄
                        $min_age = $delivery_refuse['min_age'];  // 要求的年龄筛选
                        if($min_age!=-1){
                            $p_min_age = $arr['min_age'];
                            if($p_min_age!=0){
                                //如果要求相符
                                if($min_age==-2){
                                    if($age < $p_min_age){
                                        $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"年龄太小");
                                        $this->updateDelivery($cid);
                                        continue;
                                    }
                                }
                                //指定相差的岁数
                                else{
                                    if($age+$min_age < $p_min_age){
                                        $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"年龄太小");
                                        $this->updateDelivery($cid);
                                        continue;
                                    }
                                }
                            }
                        }
                        $max_age = $delivery_refuse['max_age'];
                        if($max_age!=-1){
                            $p_max_age = $arr['max_age'];
                            if($p_max_age!=0){
                                //如果要求相符
                                if($max_age==-2){
                                    if($age > $p_max_age){
                                        $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"年龄太大");
                                        $this->updateDelivery($cid);
                                        continue;
                                    }
                                }
                                //指定相差的岁数
                                else{
                                    if($age-$max_age > $p_max_age){
                                        $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"年龄太大");
                                        $this->updateDelivery($cid);
                                        continue;
                                    }
                                }
                            }
                        }
                        //期望薪资过滤
                        $salary = $delivery_refuse['salary'];
                        if($salary!=-1){
                            //不高于发布薪资范围
                            if($salary==-2){
                                if($ret['max_salary'] > $arr['max_salary']){
                                    $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //薪资太高
                                    $this->updateDelivery($cid);
                                    continue;
                                }
                            }else{
                                if($ret['max_salary'] > $arr['max_salary'] + $salary){
                                    $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //薪资太高
                                    $this->updateDelivery($cid);
                                    continue;
                                }
                            }
                        }
                        //工作经验（年限）过滤
                        $experience = $delivery_refuse['experience'];
                        if($experience!=-1){
                            //先校验原数据是否符合规则
                            //简历工作年限【改，现在是数字，n 就是 n 年】
                            $r_experience = $ret['work_jy'];
                            //工作要求的年限
                            $p_experience = $arr['experience'];
                            $p_experience = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$p_experience));
                            //校验格式
                            $f_p_experience = $this->testExperience($p_experience);
                            if($f_p_experience['type']!="fail"){
                                //要求的类型 * 简历的类型，共 3*3 = 9 种判断， 再乘以【发布经验要求、经验相差n年】 2 = 18 种判断， 再加上所有类型均自带大小，至少36种判断
                                if($experience==-2){ //按职位要求判断
                                    if($f_p_experience['type']=="lte"){ //要求小于等于
                                        if($r_experience > $f_p_experience['number']){ //实际大于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太多
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="gte"){ //要求小于
                                        if($r_experience >= $f_p_experience['number']){ //实际大于等于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太多
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="gte"){ //要求大于等于
                                        if($r_experience < $f_p_experience['number']){ //实际小于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太少
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="gte"){ //要求大于
                                        if($r_experience <= $f_p_experience['number']){ //实际小于等于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太少
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="range"){//要求在区间
                                        if($r_experience < $f_p_experience['number']['min'] || $r_experience > $f_p_experience['number']['max']){ //太高或太低
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //不在区间内
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                }
                                else{ // 指定相差年限内
                                    if($f_p_experience['type']=="lte"){ //要求小于等于
                                        if($r_experience > $f_p_experience['number'] - $experience){ //实际大于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太多
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="lte"){ //要求小于
                                        if($r_experience >= $f_p_experience['number'] - $experience){ //实际大于等于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太多
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="gte"){ //要求大于等于
                                        if($r_experience < $f_p_experience['number'] - $experience){ //实际小于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太少
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="gte"){ //要求大于
                                        if($r_experience <= $f_p_experience['number'] - $experience){ //实际小于等于
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //工作经验太少
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                    elseif($f_p_experience['type']=="range"){//要求在区间
                                        if($r_experience <= $f_p_experience['number']['max'] + $experience && $r_experience >= $f_p_experience['number']['min'] - $experience){
                                            //在区间内 [注：实际工作年龄太高，也不符合]
                                        }else{
                                            $this->param = array("id"=>$did,"state"=>2,"refuse_msg"=>"简历不符合需求"); //不在区间内
                                            $this->updateDelivery($cid);
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //往该公司发送通知【根据公司的消息配置，进行对应的消息发送】
                    $sms_delivery = $arr['sms_delivery'];
                    $email_delivery = $arr['email_delivery'];
                    $pushSms = false;
                    //投递发送短信
                    if(!empty($sms_delivery)){
                        $pushSms = true;
                    }
                    //投递发送邮件
                    $pushEmail = false;
                    if(!empty($email_delivery)){
                        $pushEmail = true;
                    }
                    global $cfg_basedomain;
                    $urlParam = array("service"=>"custom", "param"=> $cfg_basedomain . "/supplier/job/resumeManage.html");
                    $this->param = array("id"=>$rid);
                    $this->right = true;
                    $resumeDetail = $this->resumeDetail();
                    $this->right = false;
                    $config = $this->config();
                    $memberClass = new member();
                    $memberConfig = $memberClass->config();
                    global $cfg_secureAccess;
                    global $cfg_basehost;
                    $qrCodeModuleUrl = $config['channelDomain'];
                    if($resumeDetail['state']!=200){
                        $age = $resumeDetail['age']."岁";
                        $workExperience = $resumeDetail['work_jy_name'];
                        $highestEducation = $resumeDetail['edu_tallest_name'];
                        $expectSalary = $resumeDetail['show_salary'];
                        $resumeUrl = $resumeDetail['url'];
                        $lastWorkCompanyName = '';
                        $lastWorkJobName = '';
                        if(is_array($resumeDetail['work_jl'] && !empty($resumeDetail['work_jl']))){
                            $lastWorkCompanyName = $resumeDetail['work_jl']['company'];
                            $lastWorkJobName = $resumeDetail['work_jl']['job'];
                        }
                        $schoolName = $resumeDetail['edu_school'];
                        $subjectName = $resumeDetail['edu_profession'];
                        $photo_url = $resumeDetail['photo_url'];
                    }else{
                        $age = '';
                        $workExperience = '';
                        $expectSalary = '';
                        $resumeUrl = '';
                        $lastWorkCompanyName = '';
                        $lastWorkJobName = '';
                        $schoolName = '';
                        $subjectName = '';
                        $photo_url = '';
                    }
                    $photo_url = $photo_url ? $photo_url : $cfg_secureAccess.$cfg_basehost.'/static/images/noPhoto_100.jpg';
                    //自定义配置
                    $data = array(
                        "post" => $jobName,
                        "user" => $username,
                        "age" => $age,
                        "photo_url" => $photo_url,
                        'moduleLogo'=>$config['logoUrl'], //模块logo
                        'qrCodeModuleUrl'=>$qrCodeModuleUrl, //模块链接【首页】
                        "workExperience" => $workExperience,  //工作经验
                        "highestEducation" => $highestEducation,  //最高学历
                        "expectSalary" => $expectSalary,  //期望薪资
                        "resumeUrl"=>$resumeUrl,
                        "lastWorkCompanyName"=>$lastWorkCompanyName,
                        "lastWorkJobName"=>$lastWorkJobName,
                        "schoolName"=>$schoolName,
                        "subjectName"=>$subjectName,
                        "fields" => array(
                            'keyword1' => '职位名称',
                            'keyword2' => '求职者姓名'
                        )
                    );
                    updateMemberNotice($cuid, "招聘-收到新简历提醒", $urlParam, $data,'',array(),0,0,array('pushSms'=>$pushSms,'pushEmail'=>$pushEmail));
                }
            }else{
                $result = array("state"=>200,"info"=>"职位或公司不存在");
            }
        }
        if(empty($result)){
            return array("state"=>200,"info"=>"系统繁忙");
        }
        return $result;
    }

    public function testExperience($text){
        //原始数据
        $return = array(
            "text"=>$text
        );
        //小于等于
        if(preg_match("/^<=([0-9]+)/",$text,$matches)){
            $return['type'] = "lte";  // less than
            $return['number'] = (int)$matches[1];
            $return['text'] = $matches[1]."年及以下";
        }
        //小于
        elseif(preg_match("/^<([0-9]+)/",$text,$matches)){
            $return['type'] = "lt";  // less than
            $return['number'] = (int)$matches[1];
            $return['text'] = $matches[1]."年以下";
        }
        //大于等于
        elseif(preg_match("/^>=([0-9]+)/",$text,$matches)){
            $return['type'] = "gte";  // more than
            $return['number'] = (int)$matches[1];
            $return['text'] = $matches[1]."年及以上";
        }
        //大于
        elseif(preg_match("/^>([0-9]+)/",$text,$matches)){
            $return['type'] = "gt";  // more than
            $return['number'] = (int)$matches[1];
            $return['text'] = $matches[1]."年以上";
        }
        //区间
        elseif(preg_match("/^([0-9]+)[-]([0-9]+)/",$text,$matches)){
            $return['type'] = "range"; //区间
            $return['number'] = array('min'=>(int)$matches[1],'max'=>(int)$matches['2']);
            $return['text'] = $matches[1]."-".$matches[2]."年";
        }
        else{
            $return['type'] = "fail"; //解析不成功
        }
        return $return;
    }


    //根据工作经验数据库ID，拼接SQL语句
    private function getExperience($val){
        global $dsql;
        $data = array();
        if($val){
            $data = array();
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ($val)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach($ret as $val){
                    if(strstr($val['typename'], '-')){
                        $_val = explode('-', $val['typename']);
                        $s = $_val[0];
                        $e = $_val[1];
                        array_push($data, "`work_jy` BETWEEN " . $s . " AND " . $e);
                    }else{
                        array_push($data, "`work_jy`" . $val['typename']);
                    }
                }
            }
        }
        return join(' OR ', $data);
    }


    /**
     * 简历列表
     */
    public function resumeList(){
        global $dsql;
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;

        $where = " AND `del`=0";  //所有情况下，均不可获取已经删除的

        global $userLogin;
        $userid   = $userLogin->getMemberID();

        $sql = $dsql::SetQuery("select `id` from `#@__job_company` where `userid`=$userid");
        $company = (int)$dsql->getOne($sql); //取得公司

        $u = $param['u']; //获取当前用户登录的所有简历
        if($u){
            if($userid<0){
                return array("state"=>200,"info"=>"请先登录");
            }
            $where .= " AND `userid`=$userid";
        }
        else{
            //人才库或其他，保护隐私，且只能搜索到默认简历，而且必填项目全部填完。
            $where .= " AND `state`=1 AND `private`=0 and `default`=1 and `need_complete`=1";
        }
        //数据共享
        require(HUONIAOINC."/config/job.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare && !$u){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }
        //职位筛选
        $type = $param['type'];
        if($type!=""){
            $where .= " AND `job` in($type)";
        }
        //学历筛选（最高学历）
        $education = $param['education'];
        if($education!=""){
            $where .= " AND `edu_tallest`=$education";
        }

        //工作经验
        $work_jy = $param['experience'];
        if($work_jy!=""){
            $experience = $this->getExperience($work_jy);
            if($experience){
                $where .= " AND (" . $experience . ")";
            }else{
                $where .= " AND 1 = 2";
            }
        }

        //年龄
        $min_age = $param['min_age'];
        if($min_age!=""){
            $cur_year = (int)date("Y");
            $year = (int)($cur_year-$min_age);
            $min_age_str = "".$year.date("-m-d H:i:s");
            $min_age_time = strtotime($min_age_str);
            $where .= " AND `birth`<=".$min_age_time;
        }
        $max_age = $param['max_age'];
        if($max_age!=""){
            $cur_year = (int)date("Y");
            $year = (int)($cur_year-$max_age);
            $max_age_str = "".$year.date("-m-d H:i:s");
            $max_age_time = strtotime($max_age_str);
            $where .= " AND `birth`>=".$max_age_time;
        }
        //薪资
        $min_salary = (int)$param['min_salary'];
        $max_salary = (int)$param['max_salary'];
        if($min_salary || $max_salary){
            if($min_salary && $max_salary){
                $where .= " AND `min_salary`>=$min_salary && `max_salary`<=$max_salary";
            }
            elseif($min_salary){
                $where .= " AND `min_salary`>=$min_salary";
            }
            else{ //max
                $where .= " AND `max_salary`<=$max_salary";
            }
        }
        //到职时间
        $startWork = $param['startWork'];
        if($startWork!=""){
            $where .= " AND `startWork`=$startWork";
        }
        //性别
        $sex = $param['sex'];
        if($sex!=""){
            $where .= " AND `sex`=$sex";
        }
        //职位性质
        $nature = $param['nature'];
        if($nature!=""){
            $where .= " AND `nature`=$nature";
        }

        //关键字
        $key = $param['key'];
        if($key!=""){
            $where .= " AND (`name` like '%$key%' or `ad_tag` like '%$key%'";
            $sql = $dsql::SetQuery("select `id` from `#@__job_type` where `typename` like '%$key%'");
            $likeType = $dsql->getArr($sql);
            if($likeType){
                foreach ($likeType as $typeItem){
                    $where .= " or FIND_IN_SET($typeItem,`job`)";
                }
            }
            $where .= " )";
        }
        //过滤，不合适 （找出不合适的（投递表），not in）
        $pass_unSuit = $param['pass_unSuit'];
        //过滤，已购买 （ 找出我已购买的， not in）
        $pass_buy = $param['pass_buy'];
        if($pass_unSuit || $pass_buy){
            if(!$company){
                return array("state"=>200,"info"=>"公司状态异常");
            }
            if($userid<1){
                return array("state"=>200,"info"=>"登录状态异常");
            }
            if($pass_unSuit){
                //投递不合适
                $sql = $dsql::SetQuery("select `rid` from `#@__job_delivery` where `cid`=$company and `state`=2");
                $unSuitIds = $dsql->getArr($sql);
                //普通标记不合适
                $sql = $dsql::SetQuery("select `rid` from `#@__job_remark` where `cid`=$company and `custom_unsuit`=1");
                $plainUnsuit = $dsql->getArr($sql);
                //面试不合适
                $sql = $dsql::SetQuery("select `rid` from `#@__job_invitation` where `cid`=$company and `state`=5");
                $invitionUnsuit = $dsql->getArr($sql);
                $unSuitIds = array_merge($unSuitIds,$plainUnsuit,$invitionUnsuit);
                if($unSuitIds){
                    $where .= " AND `id` not in(".join(",",$unSuitIds).")";
                }
            }
            if($pass_buy){
/*                //查找job_order表
                $sql = $dsql::SetQuery("select `aid` from `#@__job_order` where `uid`=$userid and `type`=3");
                $buy_ids = $dsql->getArr($sql);
                if($buy_ids){
                    $where .= " AND `id` not in(".join(",",$buy_ids).")";
                }*/
                $cid   = $this->getCid();
                if(is_array($cid)){
                    $where .= " AND 1=2";
                }else{
                    $sql = $dsql::SetQuery("select `rid` from `#@__job_resume_download` where `cid`=$cid");
                    $buy_ids = $dsql->getArr($sql);
                    if($buy_ids) {
                        $where .= " AND `id` not in(" . join(",", $buy_ids) . ")";
                    }
                }
            }
        }
        //过滤，简历完整度（比如低于50%）（简历完整度在新增或更新时计算，记录在一个字段里）
        $pass_completion = $param['pass_completion'];
        if($pass_completion!=""){
             $where .= " AND `completion`>$pass_completion";
        }
        $tag = $param['tag'];//简历标签筛选
        if($tag!=""){
            if(is_string($tag)){
                $tag = explode(",",$tag);
            }
            if(is_array($tag)){
                $where .=" and (";
                $range_index = 0;
                foreach ($tag as $tag_i){
                    if($range_index==0){
                        $where .= " find_in_set('$tag_i',`ad_tag`)";
                    }else{
                        $where .= " or find_in_set('$tag_i',`ad_tag`)";
                    }
                    $range_index++;
                }
                $where .= ")";
            }
        }

        //排序（2.更新时间倒序）
        $order = $param['order'];
        //如果是u=1，则按默认简历排序
        if($u){
            $where .= " order by `default` desc,`update_time` desc";
        }else{
            if($order==2){
                $where .= " order by `update_time` desc";
            }
            else{
                $where .= " order by `isbid` desc, `update_time` desc";
            }
        }

        $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where 1=1".$where);
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }

        foreach ($pageObj['list'] as $key=> $value){
            $this->param = array("id"=>$value['id']);
            $pageObj['list'][$key] = $this->resumeDetail();
        }
        return $pageObj;
    }

    /**
     * 简历详情（如果使用 default，则获取当前用户默认简历，否则必须传递id，如果简历设置了private，且不是当前用户，返回错误）
     */
    public function resumeDetail(){
        global $dsql;
        global $userLogin;
        global $cfg_basedomain;
        $adminId = $userLogin->getUserID();
        if($adminId>0){
            $this->right = true;
        }
        $uid   = $userLogin->getMemberID();

        $param = $this->param;

        if(is_numeric($param)){
            $param = array("id"=>$param);
        }

        $id = is_array($param) ? (int)$param['id'] : 0;

        $default = $param['default'];  //获取当前用户默认简历
        //尝试取默认简历id
        if($default){
            if($uid<0){
                return array("state"=>200,"info"=>"请先登录");
            }
            $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `userid`=$uid and `del`=0 and `default`=1");
            $id = $dsql->getOne($sql);
            if(!is_numeric($id)){
                return array("state"=>200,"info"=>"请创建一个简历");  //没有默认简历，正常情况下是没有简历
            }
        }
        //强制校验传递过来的id
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        //根据 id 获取简历信息
        $sql = $dsql::SetQuery("select * from `#@__job_resume` where `id`=$id");
        $resumeDetail = $dsql->getArr($sql);
        if(empty($resumeDetail) || !is_array($resumeDetail)){
            return array("state"=>200,"info"=>"简历不存在");
        }
        $resumeDetail['id'] = (int)$resumeDetail['id'];
        $resumeDetail['url'] = getUrlPath(array(
            'service'=>'job',
            'template'=>'resume',
            'id'=>$resumeDetail['id']
        ));
        $resumeDetail['cityid'] = (int)$resumeDetail['cityid'];
        $resumeDetail['userid'] = (int)$resumeDetail['userid'];
        $resumeDetail['deliveryTopCount'] = (int)$this->get_u_common($uid,"jobDeliveryTopCount");  //投递置顶数量
        $resumeDetail['sex'] = (int)$resumeDetail['sex'];
        $resumeDetail['sex_name'] = $resumeDetail['sex']==0 ? '男' : '女';
        $resumeDetail['identify'] = (int)$resumeDetail['identify'];
        $sql = $dsql::SetQuery("select `zh` from `#@__job_int_static_dict` where `name`='identify' and `value`=".$resumeDetail['identify']);
        $resumeDetail['identify_name'] = $dsql->getOne($sql) ?: "";
        $resumeDetail['work_jy'] = (int)$resumeDetail['work_jy'];
        $resumeDetail['work_jl_none'] = (int)$resumeDetail['work_jl_none'];
        $resumeDetail['work_jy_name'] = $resumeDetail['work_jy'] ? ( $resumeDetail['work_jy']>10 ? '10年以上' : $resumeDetail['work_jy']."年" ) : "暂无工作经验";
        $resumeDetail['job'] =  json_decode('[' .  $resumeDetail['job'] . ']', true) ?: array();
        $job_name = array();
        $job_list = array();
        $job_list_name = array();
        foreach ($resumeDetail['job'] as $job_i){
            $sql = $dsql::SetQuery("select `typename` from `#@__job_type` where `id`=".$job_i);
            $job_name[] = $dsql->getOne($sql) ?: "";
            //获取父分类
            global $data;
            $data = "";
            $typeArr = getParentArr("job_type", $job_i);
            $ids = array_reverse(parent_foreach($typeArr, "id"));
            if($ids){
                $ids = join(",",$ids);
                $jobs_parent = json_decode("[".$ids."]",true);
            }else{
                $jobs_parent = array($job_i);
            }
            $job_list[] = $jobs_parent;
            global $data;
            $data = "";
            $typeArr = getParentArr("job_type", $job_i);
            $typenames = array_reverse(parent_foreach($typeArr, "typename"));
            $job_list_name[] = $typenames;
        }
        $resumeDetail['job_name'] = $job_name;
        $resumeDetail['job_list'] = $job_list;
        $resumeDetail['job_list_name'] = $job_list_name;

        $resumeDetail['nature'] = (int)$resumeDetail['nature'];
        $sql = $dsql::SetQuery("select `zh` from `#@__job_int_static_dict` where `name`='jobNature' and `value`=".$resumeDetail['nature']);
        $resumeDetail['nature_name'] = $dsql->getOne($sql) ?: "";
        $resumeDetail['workState'] = (int)$resumeDetail['workState'];
        $sql = $dsql::SetQuery("select `zh` from `#@__job_int_static_dict` where `name`='workState' and `value`=".$resumeDetail['workState']);
        $resumeDetail['workState_name'] = $dsql->getOne($sql) ?: "";
        $resumeDetail['min_salary'] = (int)$resumeDetail['min_salary'];
        $resumeDetail['max_salary'] = (int)$resumeDetail['max_salary'];
        //两者大于千，且百位均为0
        $min_salary = $resumeDetail['min_salary'];
        $max_salary = $resumeDetail['max_salary'];
        $resumeDetail['show_salary'] = salaryFormat(1, $min_salary, $max_salary);
        $resumeDetail['startWork'] = (int)$resumeDetail['startWork'];
        $sql = $dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$resumeDetail['startWork']);
        $resumeDetail['startWork_name'] = $dsql->getOne($sql) ?: "";
        $resumeDetail['addr'] = (int)$resumeDetail['addr'];
        $addr_list = $this->getAddr_list($resumeDetail['addr']);
        $resumeDetail['addr_list'] = $addr_list['addr_list'];
        $resumeDetail['addr_list_Name'] = $addr_list['addr_list_Name'];
        $resumeDetail['state'] = (int)$resumeDetail['state'];
        $resumeDetail['click'] = (int)($resumeDetail['click'] ? $resumeDetail['click'] : 1);
        $resumeDetail['weight'] = (int)$resumeDetail['weight'];
        $resumeDetail['edu_tallest'] = (int)$resumeDetail['edu_tallest'];
        $sql = $dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$resumeDetail['edu_tallest']);
        $resumeDetail['edu_tallest_name'] = $dsql->getOne($sql) ?: "";
        $resumeDetail['edu_start'] = (int)$resumeDetail['edu_start'];
        $resumeDetail['edu_end'] = (int)$resumeDetail['edu_end'];
        $resumeDetail['pubdate'] = (int)$resumeDetail['pubdate'];
        $resumeDetail['update_time'] = (int)$resumeDetail['update_time'];
        $resumeDetail['del'] = (int)$resumeDetail['del'];
        $resumeDetail['birth'] = (int)$resumeDetail['birth'];
        $resumeDetail['age'] = getBirthAge(date("Y-m-d",$resumeDetail['birth']));
        $resumeDetail['type'] = json_decode("[".$resumeDetail['type']."]",true);
        $typename_arr = array();
        $type_list = array();
        $type_list_name = array();
        foreach ($resumeDetail['type'] as $type_i){
            $sql = $dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".$type_i);
            $typename_arr[] = $dsql->getOne($sql) ?: "";
            //获取父分类
            global $data;
            $data = "";
            $typeArr = getParentArr("job_industry", $type_i);
            $ids = array_reverse(parent_foreach($typeArr, "id"));
            if($ids){
                $ids = join(",",$ids);
                $type_parent = json_decode("[".$ids."]",true);
            }else{
                $type_parent = array($type_i);
            }
            $type_list[] = $type_parent;
            global $data;
            $data = "";
            $typeArr = getParentArr("job_industry", $type_i);
            $typenames = array_reverse(parent_foreach($typeArr, "typename"));
            $type_list_name[] = $typenames;
        }
        $resumeDetail['type_name'] = $typename_arr;
        $resumeDetail['type_list'] = $type_list;
        $resumeDetail['type_list_name'] = $type_list_name;
        $resumeDetail['default'] = (int)$resumeDetail['default'];
        $resumeDetail['private'] = (int)$resumeDetail['private'];
        $resumeDetail['completion'] = (int)$resumeDetail['completion'];
        $resumeDetail['urgent'] = (int)$resumeDetail['urgent'];
        $resumeDetail['photo_url'] = $resumeDetail['photo'] ? getFilePath($resumeDetail['photo']) : $cfg_basedomain . '/static/images/noPhoto_100.jpg';
        //实名认证，手机认证
        $sql = $dsql::SetQuery("select `certifyState`,`phoneCheck` from `#@__member` where `id`={$resumeDetail['userid']}");
        $userRes = $dsql->getArr($sql);
        $resumeDetail['certifyState'] = (int)$userRes['certifyState'];
        $resumeDetail['phoneCheck'] = (int)$userRes['phoneCheck'];
        $ad_tag = array();
        if($resumeDetail['ad_tag']){
            $ad_tag = explode("||",$resumeDetail['ad_tag']);
        }
        $resumeDetail['ad_tag'] = $ad_tag;
        $resumeDetail['work_jl'] = empty($resumeDetail['work_jl']) ? array() : json_decode(str_replace(array("\r\n", "\r", "\n"), '\r\n', $resumeDetail['work_jl']),true);
        $resumeDetail['work_jl'] = $resumeDetail['work_jl'] ? $resumeDetail['work_jl'] : array();
        //工作时间排序
        if($resumeDetail['work_jl']){
            $datetime =array_column($resumeDetail['work_jl'],'work_start');
            array_multisort($datetime,SORT_DESC,$resumeDetail['work_jl']);
        }
        //计算工作了几年
        $work_time_count = 0;
        if($resumeDetail['work_jl']){
            foreach ($resumeDetail['work_jl'] as & $item){
                //至今
                $work_start = date("Y-m", strtotime(str_replace('/', '-', $item['work_start'])));
                $work_end = date("Y-m", strtotime(str_replace('/', '-', $item['work_end'])));
                if($item['work_end']=="至今"){
                    $work_end = date("Y-m", GetMktime(time()));
                    // $item['work_time_count'] = time()-strtotime($item['work_start']);
                }
                //其他
                else{
                    // $item['work_time_count'] = strtotime($item['work_end'])-strtotime($item['work_start']);
                }
                // $work_time_count += $item['work_time_count'];

                $diffDate = diffDate($work_start.'-01', date('Y-m-d', GetMktime(strtotime('+1 months', GetMktime($work_end))-1)));

                $work_time_count_year = (int)$diffDate['y'];
                $work_time_count_month = (int)$diffDate['m'];
                $work_time_count += (int)$diffDate['a'];  //相差的总天数

                $item['work_time_count'] = ($work_time_count_year ? $work_time_count_year."年" : '').($work_time_count_month ? $work_time_count_month."个月" : '');

                $item['content'] = str_replace("\r\n", "<br>", $item['content']);
            }
            unset($item);
        }
        $resumeDetail['work_time_count'] = floor($work_time_count/365);
        $resumeDetail['education'] = empty($resumeDetail['education']) ? array() : json_decode($resumeDetail['education'],true);
        $resumeDetail['skill'] = empty($resumeDetail['skill']) ? (object)array() : json_decode($resumeDetail['skill']);
        $uid = $this->getUid();
        $cid = $this->getCid();
        $hasDelivery = 0; //是否投递过
        //判断当前是否企业用户
        if(!is_array($cid)){
            $resumeDetail['companyId'] = $cid;
            //检测是否购买【仅已购买】
            $sql = $dsql::SetQuery("select `id` from `#@__job_order` where `aid`={$resumeDetail['id']} and `uid`=$uid and `type`=3");
            $buy = (int)$dsql->getOne($sql);
            $buy = $buy ? 1 : 0;
            $resumeDetail['buy'] = $buy;
            $resumeDetail['remark'] = $this->getRemark($id,$cid);
            //是否投递过
            $sql = $dsql::SetQuery("select `id`, `pid` from `#@__job_delivery` where `cid`=$cid and `rid`=".$resumeDetail['id']);
            $delivery = $dsql->getArr($sql);
            $hasDelivery = $delivery ? 1 : 0;
            $resumeDetail['delivery'] = $hasDelivery;
            $resumeDetail['delivery_pid'] = (int)$delivery['pid'];  //投递的职位ID
            //是否已下载？
            $sql = $dsql::SetQuery("select `id` from `#@__job_resume_download` where `rid`={$resumeDetail['id']} and `cid`={$cid}");
            $is_download = (int)$dsql->getOne($sql);
            $resumeDetail['download'] = $is_download ? 1 : 0;
            //投递过，是否不合适？
            if($hasDelivery){
                $sql = $dsql::SetQuery("select `state`,`refuse_msg` from `#@__job_delivery` where `cid`=$cid and `rid`=".$resumeDetail['id']);
                $deliveryDetail = $dsql->getArr($sql);
                if($deliveryDetail['state']==2){
                    $resumeDetail['unSuit'] = 1;
                    $resumeDetail['unSuitMsg'] = $deliveryDetail['refuse_msg'];
                }else{
                    $resumeDetail['unSuit'] = 0;
                    $resumeDetail['unSuitMsg'] = '';
                }
            }else{
                //没投递，不合适，及其原因
                $sql = $dsql::SetQuery("select `custom_unsuit`,`remark_resume` from `#@__job_remark` where `cid`=$cid and `rid`=".$resumeDetail['id']);
                $remarkDetail = $dsql->getArr($sql);
                if($resumeDetail){
                    $resumeDetail['unSuit'] = (int)$remarkDetail['custom_unsuit'];
                    $resumeDetail['unSuitMsg'] = $remarkDetail['remark_resume'];
                }else{
                    $resumeDetail['unSuit'] = 0;
                    $resumeDetail['unSuitMsg'] = '';
                }
            }
            $resumeDetail['remark'] = $this->getRemark($id,$cid);
            //是否邀请了面试？
            $sql = $dsql::SetQuery("select i.`id`,i.`state`,i.`refuse_msg`,i.`date` from `#@__job_invitation` i left join `#@__job_post` p on p.`id` = i.`pid` where i.`rid`=$id and i.`cid`=$cid and p.`id` is not null and p.`del`=0 and p.`off`=0");
            $invitation = $dsql->getArr($sql);
            if(empty($invitation)){
                $resumeDetail['invitation'] = 0;
            }else{
                $resumeDetail['invitation'] = 1;
                $resumeDetail['invitation_time'] = (int)$invitation['date'];
                if($invitation['state']==5){
                    $resumeDetail['unSuit'] = 1; //取面试的不合适
                    $resumeDetail['unSuitMsg'] = $invitation['refuse_msg']; //取面试的不合适
                }
            }

            //更新投递简历的阅读状态
            $dsql->update($dsql::SetQuery("update `#@__job_delivery` set `u_read`=1 where `rid` = $id and `cid` = $cid"));
        }else{
            $resumeDetail['companyId'] = 0;
            $resumeDetail['buy'] = 0;
            $resumeDetail['unSuit'] = 0;
            $resumeDetail['unSuitMsg'] = '';
            $resumeDetail['delivery'] = 0;
            $resumeDetail['remark'] = array();
            $resumeDetail['invitation'] = 0;
            $resumeDetail['download'] = 0;
        }
        //隐藏联系方式
        if($resumeDetail['buy']!=1 && $resumeDetail['userid']!=$uid){
        // if($resumeDetail['buy']!=1 && $resumeDetail['userid']!=$uid){
            $resumeDetail['phone'] = substr_replace($resumeDetail['phone'],"****",3,4);
        }
        //隐藏用户名？ 不是本人，且不是企业用户，仅可看到第一个字，根据男、女显示先生女士
        if($resumeDetail['userid']!=$uid  && empty($resumeDetail['delivery']) && empty($resumeDetail['download'])){
            $fixName = mb_substr($resumeDetail['name'],0,1);
            $fixName .= $resumeDetail['sex']==0 ? '先生' : '女士';
            $resumeDetail['name'] = $fixName;

            $resumeDetail['email'] = '请先购买简历';
            $resumeDetail['wechat'] = '请先购买简历';
        }
        //验证是否已经收藏
        $params = array(
            "module" => "job",
            "temp" => "resume",
            "type" => "add",
            "id" => $id,
            "check" => 1
        );
        $collect = checkIsCollect($params);
        $resumeDetail['collect'] = $collect == "has" ? 1 : 0;
        //统计简历数量
        $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`={$resumeDetail['userid']} and `del`=0");
        $resumeDetail['resumeCount'] = (int)$dsql->getOne($sql);
        //简历近期是否投递过
        $currentTime = time()-30*86400; //30天
        $sql = $dsql::SetQuery("select `id` from `#@__job_delivery` where `rid`=".$resumeDetail['id']." and `date`>$currentTime");
        $currentDelivery = (int)$dsql->getOne($sql);
        $resumeDetail['currentDelivery'] = $currentDelivery ? 1 : 0;
        //查询简历用户的活跃
        $sql = $dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`={$resumeDetail['userid']} order by `id` desc limit 1");
        $loginTime = (int)$dsql->getOne($sql) ?: 0;
        $loginDate = date("Y-m-d",$loginTime); //最后登录的那天
        $currentDate = date("Y-m-d");
        $login = 3;  //假设未登录
        if(abs($loginTime - time()) < 300){ //300秒，5分钟内
            $login = 1;  //5分钟内登录
        }elseif($loginDate==$currentDate){
            $login = 2;  //今日登录了
        }
        $resumeDetail['loginState'] = $login;

        //计算智能刷新结束日期
        $refreshEnd = 0;
        if($resumeDetail['refreshSmart']){
            $refreshNext = $resumeDetail['refreshNext'];  //下次刷新时间
            $refreshSurplus = $resumeDetail['refreshSurplus'];  //剩余刷新次数
            $refreshSurplus = $refreshSurplus > 0 ? $refreshSurplus - 1 : 0;  //因为是从下次刷新时间开始计算，所以剩余次数需要减1次
            $refreshEnd = $refreshNext + $refreshSurplus * 21600;  //每次刷新间隔6小时，60 * 60 * 6
        }
        $resumeDetail['refreshEnd'] = $refreshEnd;

        //如果简历不是当前登录用户，并且设置了隐私简历，不允许查看
        if($resumeDetail['userid'] != $uid  && ($resumeDetail['private'] || $resumeDetail['state']!=1) && !$this->right && !$hasDelivery){
            if($resumeDetail['private']){
                $resumeDetail = array("state"=>200,"info"=>"隐私简历，无法查看");
            }
            else{
                $resumeDetail = array("state"=>200,"info"=>"简历状态异常，无法查看");
            }
        }


        //如果不是超级权限，不允许查看已删除的简历
        if($resumeDetail['del']==1 && !$this->right){
            $resumeDetail = array("state"=>200,"info"=>"简历不存在");
        }
        if($adminId>0){
            $this->right = false;
        }

        //更新浏览次数
        if(($_GET['service'] && $_GET['action'] == 'resumeDetail') || strstr($_SERVER['REQUEST_URI'], 'resume.html')){
            $sql = $dsql->SetQuery("UPDATE `#@__job_resume` SET `click` = `click` + 1 WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "results");

            //尝试添加浏览记录【新：只有公司才能看别人的简历，用户a无法看用户b的信息】
            if($uid >0 && $resumeDetail['userid'] != $uid && $cid>0) {
                $uphistoryarr = array(
                    'module'    => 'job',
                    'uid'       => $uid,
                    'aid'       => $id,
                    'fuid'      => $resumeDetail['userid'],
                    'module2'   => 'resumeDetail',
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }
        }
        
        return $resumeDetail;
    }

    /**
     * 用户更新面试标记
     */
    public function userUpdateInvitationRemark(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $iid = (int)$param['id'];
        if(empty($iid)){
            return array("state"=>200,"info"=>"缺少参数：id【面试id】");
        }
        $flag = (int)$param['flag'];
        if(empty($flag)){
            return array("state"=>200,"info"=>"缺少参数：flag【标记内容】");
        }
        $sql = $dsql::SetQuery("update `#@__job_invitation` set `u_remark`='$flag' where `id`=$iid");
        $dsql->update($sql);
        return "更新成功";
    }


    /**
     * 删除简历（软删除）
     */
    public function delResume(){
        global $dsql;
        global $userLogin;

        $param = $this->param;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $id = (int)$param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("update `#@__job_resume` set `del`=1 where `userid`=$uid and `id`=$id");

        $dsql->update($sql);
        return "删除成功";
    }

    /**
     * 修改简历隐私（新：该用户所有隐私都会同步）
     */
    public function setResumePrivate(){
        global $dsql;
        global $userLogin;

        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }

        $param = $this->param;
        if(!isset($param['private'])){
            return array("state"=>200,"info"=>"缺少参数：private");
        }
        $private = (int)$param['private']; // 0 or 1

        $private = $private ? 1 : 0; //只能是这两个其中一个值

        $sql = $dsql::SetQuery("update `#@__job_resume` set `private`=$private where `userid`=$uid");
        $dsql->update($sql);
        //把配置保存到配置表中
        //先查询是否有配置
        $sql = $sql = $dsql::SetQuery("select `id` from `#@__job_u_common` where `uid`=$uid and `name`='resume_private'");
        $exist = (int)$dsql->getOne($sql);
        if(!$exist){
            $sql = $dsql::SetQuery("insert into `#@__job_u_common`(uid,name,value) values($uid,'resume_private','$private')");
            $dsql->update($sql);
        }else{
            $sql = $dsql::SetQuery("update `#@__job_u_common` set `value`='$private' where `uid`=$uid and `name`='resume_private'");
            $dsql->update($sql);
        }
        return "修改成功";
    }

    /**
     * 新增、修改期望职位（单个）
     */
    public function opExpectedPosition($setAll=0,$jobsParam=""){
        global $dsql;
        $param = $this->param;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $opration = $param['operation'] ?: "query";  //默认是查询(query)，新增(add)，另外可以 update 或 del ， 或者 all
        $jobId = $param['jobId'];  //期望职位的分类id
        //函数内调用，全部更新
        if($setAll==1 || $opration=="all"){
            $jobsParam = $jobsParam ?: $jobId;  //全部参数
            $jobsParam = $jobsParam ?: '';
            if(empty($jobsParam)){
                return array("state"=>200,"info"=>"请至少保留一个期望职位");
            }
            //如果存在，则尝试去重
            if($jobsParam){
                $jobsParam = explode(",",$jobsParam);
                $jobsParam = array_unique($jobsParam);
                $jobsParam = join(",",$jobsParam);
            }
            //先获取原来的信息
            $sql = $dsql::SetQuery("select `id`,`value` from `#@__job_u_common` where `uid`=$uid and `name`='resume.job'");
            $oldJobs = $dsql->getArr($sql);
            //根本没有该记录，生成一条记录，并记录该id
            if(empty($oldJobs)){
                $dsql->update($dsql::SetQuery("insert into `#@__job_u_common`(`uid`,`name`,`value`) values($uid,'resume.job','$jobsParam')"));
            }
            //说明已经存在记录，则添加一条
            else{
                $dsql->update($dsql::SetQuery("update `#@__job_u_common` set `value`='$jobsParam' where `uid`=$uid and `name`='resume.job'"));
            }
            //冗余
            $sql = $dsql::SetQuery("update `#@__job_resume` set `job`='$jobsParam' where `userid`=$uid");
            $dsql->update($sql);
            return "更新成功";
        }
        $id = $param['id'] ?? -1;  //记录的id，实际是索引（按query返回的顺序）
        //参数校验
        if($opration=="add" || $opration=="update"){
            if(empty($jobId)){
                return array("state"=>200,"info"=>"缺少参数：jobId");
            }
        }
        if($opration=="del" || $opration=="update"){
            if($id=="-1"){
                return array("state"=>200,"info"=>"缺少参数：id");
            }
        }
        if($opration=="query"){
            $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='resume.job'");
            $list = $dsql->getOne($sql);
            if(empty($list)){
                return array("state"=>200,"info"=>"暂无相关数据");
            }
            $list = explode(",",$list); //生成数组
            $tid = array_keys($list);
            $tid = join(",",$tid);
            $tid = json_decode("[".$tid."]",true);
            $jobIds = array_values($list);
            $jobIds = join(",",$jobIds);
            $jobIds = json_decode("[".$jobIds."]",true);
            $res = array(
                "id"=>$tid,
                'jid'=>$jobIds
            );
            $job_name = array();
            $job_list = array();
            $job_list_name = array();
            //循环获取分类名称，父id列表，及其父id列表的name
            foreach ($jobIds as $job_i){
                $job_name[] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_type` where `id`=$job_i"));
                //获取父分类id列表和name列表
                //获取父分类
                global $data;
                $data = "";
                $typeArr = getParentArr("job_type", $job_i);
                $ids = array_reverse(parent_foreach($typeArr, "id"));
                if($ids){
                    $ids = join(",",$ids);
                    $jobs_parent = json_decode("[".$ids."]",true);
                }else{
                    $jobs_parent = array($job_i);
                }
                $job_list[] = $jobs_parent;
                global $data;
                $data = "";
                $typeArr = getParentArr("job_type", $job_i);
                $typenames = array_reverse(parent_foreach($typeArr, "typename"));
                $job_list_name[] = $typenames;
            }
            $res['name'] = $job_name;
            $res['parent_id'] = $job_list;
            $res['parent_name'] = $job_list_name;
            return $res;
        }
        elseif($opration=="add"){
            //先获取原来的信息
            $sql = $dsql::SetQuery("select `id`,`value` from `#@__job_u_common` where `uid`=$uid and `name`='resume.job'");
            $oldJobs = $dsql->getArr($sql);
            //根本没有该记录，生成一条记录，并记录该id
            if(empty($oldJobs)){
                $dsql->update($dsql::SetQuery("insert into `#@__job_u_common`(`uid`,`name`,`value`) values($uid,'resume.job','$jobId')"));
            }
            //说明已经存在记录，则添加一条
            else{
                $jobs = $oldJobs['value'];
                $jobs = explode(",",$jobs);
                if(in_array($jobId,$jobs)){
                    return array("state"=>200,"info"=>"操作失败，添加了重复职位");
                }
                $jobs[] = $jobId;
                $jobs = join(",",$jobs);
                $sql = $dsql::SetQuery("update `#@__job_u_common` set `value`='$jobs' where `uid`=$uid and `name`='resume.job'");
                $dsql->update($sql);
            }
        }
        elseif($opration=="update"){
            //先取出所有，根据index修改
            $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='resume.job'");
            $jobs = $dsql->getOne($sql);
            $jobs = explode(",",$jobs);
            if($jobs[$id]!=$jobId && in_array($jobId,$jobs)){
                return array("state"=>200,"info"=>"操作失败，选择了重复职位");
            }
            $jobs[$id] = $jobId;
            //写回表中
            $jobs = join(",",$jobs);
            $sql = $dsql::SetQuery("update `#@__job_u_common` set `value`='$jobs' where `uid`=$uid and `name`='resume.job'");
            $dsql->update($sql);
        }
        elseif ($opration=="del"){
            //先取出所有，根据index删除
            $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='resume.job'");
            $jobs = $dsql->getOne($sql);
            $jobs = explode(",",$jobs);
            if(empty($jobs[$id])){
                return array("state"=>200,"info"=>"要删除的记录不存在");
            }
            //正常不允许全部删除，应该保留一个
            if(count($jobs)==1){
                return array("state"=>200,"info"=>"不允许删除全部期望职位");
            }
            unset($jobs[$id]);
            //写回表中
            $jobs = join(",",$jobs);
            $sql = $dsql::SetQuery("update `#@__job_u_common` set `value`='$jobs' where `uid`=$uid and `name`='resume.job'");
            $dsql->update($sql);
        }
        else{
            return array("state"=>200,"info"=>"参数错误，仅支持query(默认)|add|update|del");
        }
        if($opration=="update" || $opration=="del" || $opration=="add"){
            //把jobId更新到resume中进行冗余
            $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='resume.job'");
            $jobIds = $dsql->getOne($sql);
            $sql = $dsql::SetQuery("update `#@__job_resume` set `job`='$jobIds' where `userid`=$uid");
            $dsql->update($sql);
        }
        return "更新成功";
    }
    /**
     * 设置求职状态
     */
    public function setWorkState($s_startWork=-1){
        global $dsql;
        $param = $this->param;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $startWork = (int)$param['workState'];
        if($s_startWork!=-1){
            $startWork = $s_startWork;
        }
        if(empty($startWork)){
            return array("state"=>200,"info"=>"请传递正确的参数：workState");
        }
        $this->update_u_common($uid,'workState',$startWork);
        //更新冗余的简历字段
        $sql = $dsql::SetQuery("update `#@__job_resume` set `workState`=$startWork where `userid`=$uid");
        $dsql->update($sql);
        return "修改成功";
    }

    /**
     * 获取简历基础信息
     */
    public function getResumeBasic(){
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $res = array();
        //用户名
        $res['name'] = $this->get_u_common($uid,'resume.name');
        //头像
        $res['photo'] = $this->get_u_common($uid,'resume.photo');
        //性别
        $res['sex'] = $this->get_u_common($uid,'resume.sex');
        //求职身份
        $res['identify'] = $this->get_u_common($uid,'resume.identify');
        //出生年月
        $res['birth'] = $this->get_u_common($uid,'resume.birth');
        //手机号码
        $res['phone'] = $this->get_u_common($uid,'resume.phone');
        //微信
        $res['wechar'] = $this->get_u_common($uid,'resume.wechat');
        //邮箱
        $res['email'] = $this->get_u_common($uid,'resume.email');
        //工作经验
        $res['work_jy'] = $this->get_u_common($uid,"resumeBasicWork_jy");
        return $res;
    }

    /**
     * 校验简历手机号短信
     */
    public function verResumePhone(){
        global $dsql;
        $uid = $this->getUid();
        global $userLogin;
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $phone = $param['phone'];
        if(empty($phone)){
            return array("state"=>200,"info"=>"缺少手机号码");
        }
        //校验会员中心的手机号码，是否和该号码一致，并且已验证
        $memberInfo = $userLogin->getMemberInfo();
        $uPhone = $memberInfo['phone'];
        $uPhoneCheck = $memberInfo['phoneCheck'];
        $oldPhone = $this->get_u_common($uid,"resume.phone");  //原手机号
        //新旧手机号相同，不验证
        if($oldPhone == $phone){
            return array("state"=>100,"info"=>"请输入新的号码");
        }
        //会员中心号码？
        elseif($oldPhone==$uPhone && $uPhoneCheck==1){
            $this->update_u_common($uid,'resume.phone',$phone);
            $dsql->update($dsql::SetQuery("update `#@__job_resume` set `phone`='$phone' where `userid`=$uid"));
            return array("state"=>100,"info"=>"验证成功");
        }
        //新号码，强制认证
        else{
            //强制校验验证码
            $ip = GetIP();
            $vercode  = $param['vercode'];
            if(!$vercode){
                return array("state"=>200,"info"=>"请输入验证码");
            }
            $sql_code = $dsql->SetQuery("SELECT `code` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$phone' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->getOne($sql_code);
            if (strtolower($vercode) != $res_code) {
                return array ('state' => 200, 'info' => "验证码输入错误，请重试！");
            }
            //短信校验通过，尝试完善会员中心电话信息
            if(empty($uPhone) || $uPhoneCheck!=1){
                $sql = $dsql::SetQuery("update `#@__member` set `phone`=$phone,`phoneCheck`=1 where `id`=$uid");
                $dsql->update($sql);
            }
            //更新简历号码
            $this->update_u_common($uid,'resume.phone',$phone);
            $dsql->update($dsql::SetQuery("update `#@__job_resume` set `phone`='$phone' where `userid`=$uid"));
            return array("state"=>100,"info"=>"验证成功");
        }
    }

    /**
     * 更新简历基础信息
     */
    public function updateResumeBasic(){
        global $dsql;
        $uid = $this->getUid();
        global $userLogin;
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        //手机号码【先校验手机号】
        $phone = $param['phone'];
        if(empty($phone)){
            return array("state"=>200,"info"=>"缺少手机号码");
        }
        //校验会员中心的手机号码，是否和该号码一致，并且已验证
        $memberInfo = $userLogin->getMemberInfo();
        $uPhone = $memberInfo['phone'];
        $uPhoneCheck = $memberInfo['phoneCheck'];
        $oldPhone = $this->get_u_common($uid,"resume.phone");
        //新手机号!=原手机号 ，新手机号不等于会员中心手机号，则必然是新的号码，请先走号码校验接口verResumePhone
        if($oldPhone != $phone && $phone != $uPhone){
            return array("state"=>200,"info"=>"非法操作，请先验证手机号verResumePhone");
        }
        //新号码为会员中心号码，尝试校验会员中心号码是否正常
        elseif($phone == $uPhone){
            if(empty($uPhone) || $uPhoneCheck!=1){
                return array("state"=>200,"info"=>"非法操作，请先验证手机号verResumePhone");
            }
        }
        //姓名
        $name = $param['name'];
        if(empty($name)){
            return array("state"=>200,"info"=>"缺少姓名");
        }
        //头像
        $photo = $param['photo'];
        if(empty($photo)){
            return array("state"=>200,"info"=>"缺少头像");
        }
        //性别
        $sex = $param['sex'];
        if($sex==""){
            return array("state"=>200,"info"=>"缺少性别");
        }
        //求职身份
        $identify = $param['identify'];
        if(empty($identify)){
            return array("state"=>200,"info"=>"缺少求职身份");
        }
        //出生年月
        $birth = $param['birth'];
        if(empty($birth)){
            return array("state"=>200,"info"=>"缺少出生时间");
        }
        //微信
        $wechar = $param['wechat'];
        if(empty($wechar)){
            return array("state"=>200,"info"=>"缺少微信");
        }
        //邮箱
        $email = $param['email'] ?: "";
        //工作经验
        $work_jy = $param['work_jy'];
        if(empty($work_jy)){
            return array("state"=>200,"info"=>"缺少工作经验");
        }

        $this->update_u_common($uid,'resume.phone',$phone);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `phone`='$phone' where `userid`=$uid"));

        $this->update_u_common($uid,'resume.name',$name);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `name`='$name' where `userid`=$uid"));

        $this->update_u_common($uid,'resume.photo',$photo);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `photo`='$photo' where `userid`=$uid"));

        $this->update_u_common($uid,'resume.sex',$sex);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `sex`='$sex' where `userid`=$uid"));

        $this->update_u_common($uid,'resume.identify',$identify);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `identify`='$identify' where `userid`=$uid"));
        if($identify=="1"){  //切换为职场人士，实习转全职
            $sql = $dsql::SetQuery("update `#@__job_resume` set `nature`=1 where `nature`=3");
            $dsql->update($sql);
        }

        $cityid = $param['cityid'];
        if(empty($cityid)){
            return array("state"=>200,"info"=>"请传递cityid");
        }
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `cityid`=$cityid where `userid`=$uid"));

        $this->update_u_common($uid,'resume.birth',$birth);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `birth`='$birth' where `userid`=$uid"));

        $this->update_u_common($uid,'resume.wechat',$wechar);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `wechat`='$wechar' where `userid`=$uid"));

        $this->update_u_common($uid,'resume.email',$email);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `email`='$email' where `userid`=$uid"));

        $this->update_u_common($uid,'resumeBasicWork_jy',$work_jy);
        $dsql->update($dsql::SetQuery("update `#@__job_resume` set `work_jy`='$work_jy' where `userid`=$uid"));
        return array("state"=>100,"info"=>"更新成功");
    }

    /**
     * @param $uid
     * @param string $name
     * @param string $value
     */
    public function update_u_common($uid,string $name,string $value){
        global $dsql;
        $sql = $dsql::SetQuery("select `id` from `#@__job_u_common` where `uid`=$uid and `name`='$name'");
        $common_exist = $dsql->getOne($sql);
        if($common_exist){
            $sql = $dsql::SetQuery("update `#@__job_u_common` set `value`='$value' where `id`=$common_exist");
            $dsql->update($sql);
        }else{
            $sql = $dsql::SetQuery("insert into `#@__job_u_common`(`name`,`value`,`uid`) values('$name','$value',$uid)");
            $dsql->update($sql);
        }
    }

    /**
     * @param string $name 名称
     * @param string $default 默认值
     */
    public function get_u_common($uid,string $name, string $default=""){
        global $dsql;
        $sql = $dsql::SetQuery("select `value` from `#@__job_u_common` where `uid`=$uid and `name`='$name'");
        return $dsql->getOne($sql) ?: $default;
    }

    /**
     * 设置到岗时间
     */
    public function setStartWork($s_startWork=-1){
        global $dsql;
        $param = $this->param;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $startWork = (int)$param['startWork'];
        if($s_startWork!=-1){
            $startWork = $s_startWork;
        }
        if(empty($startWork)){
            return array("state"=>200,"info"=>"请传递正确的参数：startWork");
        }
        $this->update_u_common($uid,"startWork",$startWork);
        //更新冗余的简历字段
        $sql = $dsql::SetQuery("update `#@__job_resume` set `startWork`=$startWork where `userid`=$uid");
        $dsql->update($sql);
        return "修改成功";
    }

    /**
     * 获取简历隐私设置
     */
    public function getResumePrivate(){
        global $dsql;
        global $userLogin;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $private = (int)$this->get_u_common($uid,'resume_private'); //强制int，没有的情况下是0
        return array("state"=>100,"info"=>$private);
    }


    /**
     * 更新简历别名
     */
    public function setResumeAlias(){
        global $dsql;

        $param = $this->param;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $id = (int)$param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $name = $param['name'];
        if(empty($name)){
            return array("state"=>200,"info"=>"缺少参数：name");
        }
        $sql = $dsql::SetQuery("update `#@__job_resume` set `alias`='$name' where `userid`=$uid and `id`=$id");
        $dsql->update($sql);
        return "修改成功";
    }


    /**
     * 设置默认简历
     */
    public function setDefaultResume(){
        global $dsql;
        global $userLogin;

        $param = $this->param;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $id = (int)$param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }
        $sql = $dsql::SetQuery("update `#@__job_resume` set `default`= case `id` when $id then 1 else 0 end where `userid`=$uid");
        $dsql->update($sql);
        //重新计算默认简历完善度
        $this->countResumeCompletion($id);
        return "更新成功";
    }


    /**
     * 复制生成简历
     */
    public function copyNewResume(){
        global $dsql;
        global $userLogin;

        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }

        $param = $this->param;
        //旧简历id（要从这个简历里复制数据）
        $oldId = $param['oldId'];
        if(empty($oldId)){
            //取默认简历id
            $sql = $dsql::SetQuery("select `id` from `#@__job_resume` where `userid`=$uid and `default`=1 and `del`=0");
            $oldId = $dsql->getOne($sql);
            if(empty($oldId)){
                return array("state"=>200,"info"=>"缺少参数：oldId");
            }
        }
        $name = $param['name']; //简历别名
        if(empty($name)){
            return array("state"=>200,"info"=>"缺少参数：name");
        }
        $colomns = $param['columns'] ?? "";  // 要复制的字段{ job:求职意向，work:工作经历，education:教育背景，skill:技能/语言，advance：个人优势 }
        //查出旧简历数据
        $sql = $dsql::SetQuery("select * from `#@__job_resume` where `id`=$oldId and `userid`=$uid and `del`=0");
        $resume = $dsql->getArr($sql);
        if(empty($resume)){
            return array("state"=>200,"info"=>"old简历不存在");
        }
        $colomns = explode(",",$colomns);
        $append = array('state' => (int)$resume['state'], 'workState' => (int)$resume['workState']);
        if(in_array("job",$colomns)){
            $append['nature'] = (int)$resume['nature'];
            $append['type'] = $resume['type'];
            // $append['workState'] = (int)$resume['workState'];
            $append['min_salary'] = (int)$resume['min_salary'];
            $append['max_salary'] = (int)$resume['max_salary'];
            $append['startWork'] = (int)$resume['startWork'];
            $append['addr'] = (int)$resume['addr'];
        }
        if(in_array("work",$colomns)){
            $append['work_jl'] = $resume['work_jl'];
        }else{
            $append['work_jl'] = "";
        }
        if(in_array("education",$colomns)){
            $append['education'] = $resume['education'];
            $append['edu_tallest'] = $resume['edu_tallest'];
        }else{
            $append['education'] = "";
        }
        if(in_array("skill",$colomns)){
            $append['skill'] = $resume['skill'];
        }else{
            $append['skill'] = "";
        }
        if(in_array("advance",$colomns)){
            $append['advantage'] = $resume['advantage'];
            $append['ad_tag'] = $resume['ad_tag'];
        }
        //处理name值
        $appendKey = array_keys($append);
        if($appendKey){
            $new_appendKey = "";
            foreach ($appendKey as $item){
                $new_appendKey .= ",`$item`";
            }
            $appendKey = $new_appendKey;
        }
        //处理value值
        $appendValue = array_values($append);
        if($appendValue){
            $new_appendValue = "";
            foreach ($appendValue as $item){
                if(is_string($item)){
                    $new_appendValue .= ",'$item'";
                }
                else{
                    $new_appendValue .= ",$item";
                }
            }
            $appendValue = $new_appendValue;
        }
        //插入数据
        $pubdate = GetMkTime(time());
        $sql = $dsql::SetQuery("insert into `#@__job_resume`(`pubdate`,`alias`,`cityid`,`userid`,`photo`,`name`,`sex`,`phone`,`birth`,`identify`,`email`,`work_jy`,`wechat`,`job`$appendKey) values('$pubdate','$name',{$resume['cityid']},{$resume['userid']},'{$resume['photo']}','{$resume['name']}',{$resume['sex']},'{$resume['phone']}',{$resume['birth']},'{$resume['identify']}','{$resume['email']}','{$resume['work_jy']}','{$resume['wechat']}','{$resume['job']}'$appendValue)");
        $res = $dsql->dsqlOper($sql,"lastid");
        if(is_numeric($res)){
            //重新计算简历完整度
            $this->countResumeCompletion($res);
            return array("state"=>100,"info"=>"操作成功","aid"=>(int)$res);
        }else{
            return array("state"=>200,"info"=>"操作失败");
        }
    }

    /**
     * 批量保存至本地、发送至邮箱、投诉
     */
    public function secResumes(){
        global $dsql;
        $param = $this->param;
        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }
        $rid = $param['rid'];
        //操作的简历列表
        if(empty($rid)){
            return array("state"=>200,"info"=>"缺少简历id：rid");
        }
        //校验这些简历，确认是否已下载，如果没有自动过滤
        $sql = $dsql::SetQuery("select `rid` from `#@__job_resume_download` where `rid` in ($rid) and `cid`=$cid");
        $rids = $dsql->getArr($sql);
        if(empty($rids)){
            return array("state"=>200,"info"=>"简历无效");
        }
        //操作类型
        $operation = $param['operation'];
        $operation = explode(",",$operation);
        //是否发送到邮箱
        $sendEmail = (int)$dsql->getOne($dsql::SetQuery("select `email_buyResume` from `#@__job_company` where `id`=$cid"));
        if($sendEmail){ //后端设置过要发邮箱，则前端传值无效，一定发送
            if(!in_array("sendEmail",$operation)){
                $operation[] = "sendEmail";
            }
        }
        if(!in_array("saveLocal",$operation) && !in_array("saveLocalUrl",$operation) && !in_array("sendEmail",$operation)){
            return array("state"=>200,"info"=>"参数operation错误，不被支持的操作类型");
        }
        $html = "";
        $handlers = new handlers("job","resumeDetail");
        global $huoniaoTag;
        if(is_null($huoniaoTag)){
            $huoniaoTag = initTemplateTag();
        }
        global $cfg_staticPath;
        $huoniaoTag->assign("cfg_staticPath",$cfg_staticPath);
        $configs = $this->config();
        $huoniaoTag->assign("job_logoUrl",$configs['logoUrl']);
        $huoniaoTag->assign("cfg_staticPath",$cfg_staticPath);
        $host = $huoniaoTag->tpl_vars["cfg_currentHost"]->value;  //域名
        $huoniaoTag->assign("templets_skin",$host."/templates/poster/job/resume/skin1/");
        $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/header.html');
        foreach ($rids as $rid){
            $res = $handlers->getHandle(array("id"=>$rid));
            if($res['state']==200){  //简历异常
                return $res;
            }
            $res = $res['info'];
            foreach ($res as $key => $item){
                $huoniaoTag->assign("detail_".$key, $item);
            }
            $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/body.html');
        }
        $html .= $huoniaoTag->fetch(HUONIAOROOT . '/templates/poster/job/resume/skin1/footer.html');
        $pdf = strToPdf($html) ?: array();
        $name = $pdf['name'];
        $path = substr($pdf['path'],strlen(HUONIAOROOT));
        $url = $huoniaoTag->tpl_vars['cfg_currentHost'] . $path;

        //生成下载文件名称
        $sql = $dsql::SetQuery("select `name` from `#@__job_resume` where `id` in(".join(",",$rids).")");
        $names = $dsql->getArr($sql);
        $title = $names[0];
        if(count($names)>1){
            $title = $names[0]."等".count($names)."人";
        }
        //是否发送至邮箱
        $methodReturn = array("state"=>100,"info"=>"操作成功");
        if(in_array("sendEmail",$operation)){
            global $userLogin;
            $userInfo = $userLogin->getMemberInfo();
            $uid = $userInfo['userid'];
            $email = $dsql->getOne($dsql::SetQuery("select `email` from `#@__job_company` where `userid`=".$uid));
            global $cfg_shortname;
            $send = sendmail($email,$title. "的简历【".$cfg_shortname."】","<small>请直接在附件中下载</small>",array("attaches"=>array(array("path"=>$pdf['path'],"name"=>$title."的简历.pdf"))));
            //如果发送成功，记录日志等（成功时无return）
            if(empty($send)){
                //是否删除本地文件
                if(!in_array("saveLocalUrl",$operation) && !in_array("saveLocal",$operation)){
                    unlinkFile($pdf['path']);
                }
                messageLog("email", "resume", $email, "简历下载", $html, $uid, 0, "");
                $methodReturn['info'] = "下载成功";
            }
            //发送失败，记录失败邮件日志。
            else{
                messageLog("email", "resume", $email, "简历下载", $html, $uid, 1, "");
                $methodReturn['info'] = "下载失败";
            }
        }

        if(in_array("saveLocalUrl",$operation)){
            return array("url"=>$url,"tag"=>"<a target='_blank' href='$url'>简历预览：$name</a>");
        }
        elseif(in_array("saveLocal",$operation)){
            header('Content-type: application/pdf');
            header('Content-Disposition: attachment; filename="'.$title.'的简历.pdf"');
            readfile($pdf['path']);die;
        }
        return $methodReturn;
    }

    /**
     * 生成海报
     */
    public function makePoster(){
        global $editor_uploadDir;
        global $dsql;
        $param = $this->param;
        $uid = $this->getUid();
        $uid = is_array($uid) ? 0 : $uid;  //用户id，不一定存在
        $pid = $param['id'];
        $debug = $param['debug'] ?? 0;
        if(empty($pid)){
            return array("state"=>200,"info"=>"缺少参数：id，多个用,分割");
        }
        $type = $param['type'] ?? "post";
        if(!in_array($type,array("post","company"))){
            return array("state"=>200,"info"=>"模板类型错误，仅支持{post职位模板，company公司模板}");
        }
        $mid = $param['mid'] ?? 0;
        if(empty($mid)){
            return array("state"=>200,"info"=>"请指定模板：mid");
        }
        if($type=="post"){
            $firstPid = $pid;
        }
        elseif($type=="company"){
            $pids = explode(",",$pid); //职位id列表
            $firstPid = $pids[0];
        }
        //查询海报模板是否真的存在
        $sql = $dsql::SetQuery("select * from `#@__poster_template` where `id`=$mid");
        $haibaoTemplate = $dsql->getArr($sql);
        if(empty($haibaoTemplate) || !is_array($haibaoTemplate)){
            return array("state"=>200,"info"=>"海报模板不存在");
        }
        //尝试删除过期资源【30天过期】
        $time = time();
        $pass_time = $time - 30 * 86400 ;
        $sql = $dsql::SetQuery("select `path` from `#@__poster` where `module`='job' and `pubdate`<$pass_time"); //是否有数据
        $paths = $dsql->getArr($sql);
        //存在过期未删除资源
        if($paths){
            $paths = join(",",$paths);
            delPicFile($paths,"delPoster","job");  //删除文件
            $sql = $dsql::SetQuery("delete from `#@__poster` where `module`='job' and `pubdate`<$pass_time"); //删除数据库记录
            $dsql->update($sql);
        }
        //先查询一下，是否有数据未过期数据
        $sql = $dsql::SetQuery("select `path` from `#@__poster` where `module`='job' and `ids`='$pid' and `type`='$type' and `mid`=$mid and `pubdate`+300>".$time);  //5分钟内直接返回url
        $hasPic = $dsql->getOne($sql);
        if($hasPic && !$debug){  //如果存在数据，直接返回
            $url = getFilePath($hasPic);
            $hasPic = str_replace("\\","/",$hasPic);
            $name = substr($hasPic,strrpos($hasPic,"/")+1);
            return array("url"=>$url,"tag"=>"<a target='_blank' href='$url'>海报预览：$name</a>");
        }
        //职位模板
        global $huoniaoTag;
        if(is_null($huoniaoTag)){
            $huoniaoTag = initTemplateTag();
        }

        global $cfg_webname;
        global $cfg_description;
        global $siteCityInfo;
        global $cfg_shareTitle;  //海报分享标题
        global $cfg_shareDesc;  //海报分享描述

        $siteCityName = $siteCityInfo['name'];

        //未设置分享标题和描述时，使用网站名称和seo描述
        $cfg_shareTitle = $cfg_shareTitle ? $cfg_shareTitle : $cfg_webname;
        $cfg_shareDesc = $cfg_shareDesc ? $cfg_shareDesc : $cfg_description;

        $huoniaoTag->assign("shareTitle", str_replace('$city', $siteCityName, stripslashes($cfg_shareTitle)));
        $huoniaoTag->assign("shareDesc", str_replace('$city', $siteCityName, stripslashes($cfg_shareDesc)));
        if($type=="post"){
            //处理html
            $this->param = array("id"=>$firstPid);
            $detail = $this->postDetailAll();
            if($detail['state']!=200){
                foreach ($detail as $key => $item){
                    if($key == 'claim' || $key == 'note'){
                        $item = nl2br($item);
                    }
                    $huoniaoTag->assign("detail_".$key,$item);
                }
            }else{
                return array("state"=>200,"info"=>"选择的职位不存在");
            }
            //职位详情地址
            $url = $detail['companyDetail']['logo_url'];
            //调用siteConfig类的getWeixinQrPost方法
            $handlers = new handlers("siteConfig","getWeixinQrPost");
            $res = $handlers->getHandle(array("module"=>"job","type"=>"job","aid"=>$firstPid,"title"=>$detail['title'],"description"=>$detail['note'],"imgUrl"=>$url,"redirect"=>$detail['url']));
            if($res['state']==100){
                $qrCodeUrl = strstr($res['info'], 'weixin.qq.com') ? ($huoniaoTag->tpl_vars["cfg_currentHost"]->value."/include/qrcode.php?data=" . $res['info']) : $res['info'];
            }else{
                $detailUrl = getUrlPath(array('service' => 'job', 'template' => 'job', 'id' => $firstPid));
                $qrCodeUrl = $huoniaoTag->tpl_vars["cfg_currentHost"]->value."/include/qrcode.php?data=".urlencode($detailUrl);
            }
            //生成二维码【这是图片地址，wk会自动提取图片】
            $huoniaoTag->assign("qrCodeUrl",$qrCodeUrl);
        }
        //公司模板
        elseif($type=="company"){
            //处理html
            $cid = $dsql->getOne($dsql::SetQuery("select `company` from `#@__job_post` where `id`=$firstPid"));
            $this->param = array("id"=>$cid);
            $companyDetail = $this->companyDetail(); //公司信息

            //取得职位信息
            $jobs = array();
            foreach ($pids as $pi){
                $this->param = array("id"=>$pi);
                $postDetail = $this->postDetail();
                if($postDetail['state']!=100){
                    $jobs[] = $postDetail;
                }
            }
            //公司信息中包括职位信息
            $companyDetail['posts'] = $jobs;
            //填充到模板中
            foreach ($companyDetail as $key => $item){
                $huoniaoTag->assign("detail_".$key,$item);
            }
            //公司的地址，生成二维码
            $url = $companyDetail['logo_url'];
            //调用siteConfig类的方法getWeixinQrPost方法
            //调用siteConfig类的getWeixinQrPost方法
            $handlers = new handlers("siteConfig","getWeixinQrPost");
            $res = $handlers->getHandle(array("module"=>"job","type"=>"company","aid"=>$cid,"title"=>$companyDetail['title'],"description"=>$companyDetail['body'],"imgUrl"=>$url,"redirect"=>$companyDetail['url']));
            if($res['state']==100){
                $qrCodeUrl = strstr($res['info'], 'weixin.qq.com') ? ($huoniaoTag->tpl_vars["cfg_currentHost"]->value."/include/qrcode.php?data=" . $res['info']) : $res['info'];
            }else{
                $detailUrl = getUrlPath(array('service' => 'job', 'template' => 'company', 'id' => $cid));
                $qrCodeUrl = $huoniaoTag->tpl_vars["cfg_currentHost"]->value."/include/qrcode.php?data=" . urlencode($detailUrl);
            }
            //生成二维码【这是图片地址，wk会自动提取图片】
            $huoniaoTag->assign("qrCodeUrl",$qrCodeUrl);
        }
        //先把原始html模板直接存到文件里，只是为了fetch生成真正的html
        $temp_filePath = HUONIAOROOT."/templates_c/temp.html";
        file_put_contents($temp_filePath,$haibaoTemplate['html']);
        $html = $huoniaoTag->fetch($temp_filePath);
        if(isset($debug) && !empty($debug)){
            echo $html;die;
        }
        unlinkFile($temp_filePath);
        //把html生成图片
        $img = strToImg($html) ?: array();
        $name = $img['name'];
        $path = $img['path'];
        $path = substr($path,strlen(HUONIAOROOT.$editor_uploadDir));
        $url = getFilePath($path);
        //存储到sql中
        $time = time();
        $sql = $dsql::SetQuery("insert into `#@__poster`(`userid`,`ids`,`type`,`mid`,`pubdate`,`path`,`module`) values($uid,'$pid','$type',$mid,$time,'$path','job')");
        $dsql->update($sql);
        return array("url"=>$url,"tag"=>"<a target='_blank' href='$url'>海报预览：$name</a>");
    }

    /**
     * 创建、编辑简历
     */
    public function aeResume(){
        global $dsql;
        global $userLogin;
        $uid   = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        /**
         * 参数处理
         */
        $param = $this->param;
        $cityid = (int)getCityId();  //先直接取cityid，如果没有则前端必须传递
        if(empty($cityid)){
            $cityid       = (int)$param['cityid'];
        }
        $id = $param['id'];  //简历id，可能没有id
        if(empty($cityid)){
            return array("state"=>200,"info"=>"请传递cityid");
        }
        $columns = $param['columns'];  //检测的字段标识
        if(empty($columns)){
            return array("state"=>200,"info"=>"请传递字段标识");
        }
        $checkColumns = array();  //检测的字段
        //pc端生成简历
        if($columns=="pcCreate"){
            $checkColumns = array("name","photo","sex","birth","phone","identify","email","work_jy","wechat","job","nature","type","workState","min_salary","max_salary","startWork","addr","work_jl","education");
        }
        //移动端基础信息
        elseif($columns=="basic"){
            //学生身份需要验证求职状态
            //职场人士需要验证工作经验
            if($param['identify'] == 2){
                $checkColumns = array('name','photo','sex','identify','birth','phone','wechat','email','workState');
            }else{
                $checkColumns = array('name','photo','sex','identify','birth','phone','wechat','email','work_jy');
            }
        }
        //pc端基础信息
        elseif($columns=="basicInfo"){
            $checkColumns = array('name','photo','sex','birth','workState','identify','email','work_jy','wechat');
        }
        //工作经验
        elseif($columns=="work_jl"){
            $checkColumns = array("work_jl");
        }
        //求职意向
        elseif($columns=="type"){
            $checkColumns = array('type','job','nature','addr','min_salary','max_salary','workState','startWork');
        }
        //技能
        elseif($columns=="skill"){
            $checkColumns = array("skill");
        }
        //教育经历
        elseif($columns=="education"){
            $checkColumns = array("education");
        }
        //个人优势
        elseif($columns=="advantage"){
            $checkColumns = array("advantage");
        }
        //个人优势PC
        elseif($columns=="advantagePc"){
            $checkColumns = array("advantage","ad_tag");
        }
        //简历别名
        elseif($columns=="alias"){
            $checkColumns = array("alias");
        }
        //个人加分项
        elseif($columns=="ad_tag"){
            $checkColumns = array("ad_tag");
        }
        //到岗时间
        elseif($columns=="startWork"){
            $checkColumns = array("startWork");
        }
        //求职状态
        elseif($columns=="workState"){
            $checkColumns = array("workState");
        }
        //期望岗位
        elseif($columns=="job"){
            $checkColumns = array("job");
        }
        //求职意向【移动端】
        elseif($columns=="intention"){
            $checkColumns = array('type','job','nature','addr','min_salary','max_salary');
        }
        //求职意向【pc端】
        elseif($columns=="intentionPc"){
            $checkColumns = array('type','job','nature','addr','min_salary','max_salary','workState','startWork');
        }
        //基本信息：pc端基础信息+求职意向【pc端】
        elseif($columns=="basicPc"){
            $checkColumns = array('name','photo','sex','birth','phone','workState','identify','email','work_jy','wechat', 'type','job','nature','addr','min_salary','max_salary','workState','startWork');
        }
        //新建一个默认简历，没有任何简历时【方便移动端】
        elseif($columns=="1"){
            $sql = $dsql::SetQuery("select count(`id`) `#@__jbo_resume` where `userid`=$uid");
            $hasResume = (int)$dsql->getOne($sql);
            if($hasResume){
                return array("state"=>200,"info"=>"当前用户已有简历，禁止使用此方法创建简历");
            }
            $sql = $dsql::SetQuery("insert into `#@__job_resume`(`cityid`,`userid`,`work_jl`,`education`,`skill`,`default`) values($cityid,$uid,'','','',1)");
            $nid = $dsql->dsqlOper($sql,"lastid");
            if(is_numeric($nid)){
                //重新计算简历完整度
                $this->countResumeCompletion($nid);
                return array("state"=>100,"info"=>"简历创建成功","aid"=>(int)$nid);
            }else{
                return array("state"=>100,"info"=>"简历创建失败");
            }
        }
        //其他，暂不支持
        else{
            return array("state"=>200,"info"=>"不支持的字段标识");
        }
        //根据字段校验，开始校验每个字段
        $time      = time();
        if(empty($id)){ //新增
            $dbParam = array("cityid"=>$cityid,"userid"=>$uid,'pubdate'=>$time,'update_time'=>$time);   //拼接的sql参数，后面根据它动态生成sql
        }else{ //编辑
            $dbParam = array('update_time'=>$time);   //拼接的sql参数，后面根据它动态生成sql
        }
        if(in_array("alias",$checkColumns)){
            $alias        = $param['alias'];
            if(empty($alias)){
                return array("state"=>200,"info"=>"缺少简历别名");
            }
            $dbParam['alias'] = $alias;
        }
        //头像
        if(in_array("photo",$checkColumns)){
            $photo        = $param['photo'];
            if(empty($photo)){
                return array("state"=>200,"info"=>"缺少头像");
            }
            $dbParam['photo'] = $photo;
        }
        //姓名
        if(in_array("photo",$checkColumns)){
            $name = filterSensitiveWords(addslashes($param['name']));
            if(empty($name)){
                return array("state"=>200,"info"=>"请填写姓名");
            }
            $dbParam['name'] = $name;
        }
        //性别
        if(in_array("sex",$checkColumns)){
            $sex  = (int)$param['sex'];
            $dbParam['sex'] = $sex;
        }
        //联系电话
        if(in_array("phone",$checkColumns)){
            $phone        = $param['phone'];
            if(empty($phone)){
                return array("state"=>200,"info"=>"缺少联系电话");
            }
            $dbParam['phone'] = $phone;
            //校验会员中心的手机号码，是否和该号码一致，并且已验证
            $memberInfo = $userLogin->getMemberInfo();
            $uPhone = $memberInfo['phone'];
            $uPhoneCheck = $memberInfo['phoneCheck'];
            $oldPhone = $this->get_u_common($uid,"resume.phone");
            //新手机号!=原手机号 ，新手机号不等于会员中心手机号，则必然是新的号码，请先走号码校验接口verResumePhone
            if($oldPhone != $phone && $phone != $uPhone){
                return array("state"=>200,"info"=>"非法操作，请先验证手机号verResumePhone");
            }
            //新号码为会员中心号码，尝试校验会员中心号码是否正常
            elseif($phone == $uPhone){
                if(empty($uPhone) || $uPhoneCheck!=1){
                    return array("state"=>200,"info"=>"非法操作，请先验证手机号verResumePhone");
                }
            }
        }
        //出生日期
        if(in_array("birth",$checkColumns)){
            $birth   = $param['birth'] ?? '';
            if(empty($birth)){
                return array("state"=>200,"info"=>"缺少出生日期");
            }
            $dbParam['birth'] = $birth;
        }
        //身份
        if(in_array("identify",$checkColumns)){
            $identify     = (int)$param['identify'];
            if(empty($identify)){
                return array("state"=>200,"info"=>"请选择身份");
            }
            $dbParam['identify'] = $identify;
        }
        //邮箱
        if(in_array("email",$checkColumns)){
            $email        = $param['email'] ?? '';
            if(empty($email)){
                // return array("state"=>200,"info"=>"缺少邮箱");
            }
            $dbParam['email'] = $email;
        }
        //工作经验
        if(in_array("work_jy",$checkColumns)){
            $work_jy      = (int)$param['work_jy'];
            $dbParam['work_jy'] = $work_jy;
        }
        //微信
        if(in_array("wechat",$checkColumns)){
            $wechat       = $param['wechat'] ?? '';
            $dbParam['wechat'] = $wechat;
        }
        //期望职位
        if(in_array("job",$checkColumns)){
            $job          = $param['job'];
            if(empty($job)){
                return array("state"=>200,"info"=>"请选择期望职位");
            }
            if(is_array($job)){
                $job = join(",",$job);
            }
            $dbParam['job'] = $job;
        }
        //工作性质
        if(in_array("nature",$checkColumns)){
            $nature       = (int)$param['nature'];
            if(empty($nature)){
                return array("state"=>200,"info"=>"请选择工作性质");
            }
            $dbParam['nature'] = $nature;
        }
        //期望行业
        if(in_array("type",$checkColumns)){
            $type         = $param['type'];
            if(empty($type)){
                return array("state"=>200,"info"=>"请选择期望行业");
            }
            if(is_array($type)){
                $type = join(",",$type);
            }
            $dbParam['type'] = $type;
        }
        //求职状态
        if(in_array("workState",$checkColumns)){
            $workState    = (int)$param['workState'];
            if(empty($workState)){
                return array("state"=>200,"info"=>"请选择求职状态");
            }
            $dbParam['workState'] = $workState;
        }
        //最低工资
        if(in_array("min_salary",$checkColumns)){
            $min_salary       = (int)$param['min_salary'];
            if(empty($min_salary)){
                return array("state"=>200,"info"=>"请选择最低期望薪资");
            }
            $dbParam['min_salary'] = $min_salary;
        }
        //最高工资
        if(in_array("max_salary",$checkColumns)){
            $max_salary       = (int)$param['max_salary'];
            if(empty($max_salary)){
                return array("state"=>200,"info"=>"请选择最高期望薪资");
            }
            $dbParam['max_salary'] = $max_salary;
        }
        //到岗时间
        if(in_array("startWork",$checkColumns)){
            $startWork       = (int)$param['startWork'];
            if(empty($startWork)){
                return array("state"=>200,"info"=>"请选择到岗时间");
            }
            $dbParam['startWork'] = $startWork;
        }
        //期望工作地点
        if(in_array('addr',$checkColumns)){
            $addr       = (int)$param['addr'];
            if(empty($addr)){
                return array("state"=>200,"info"=>"请选择期望工作地点");
            }
            $dbParam['addr'] = $addr;
        }
        //工作经历
        if(in_array("work_jl",$checkColumns)){
            $work_jl       = $param['work_jl'] ?? '';
            $work_jl_none  = (int)$param['work_jl_none'];
            if(empty($work_jl) && empty($work_jl_none)){
                return array("state"=>200,"info"=>"请填写工作经历，或选择无工作经验");
            }
            if(is_array($work_jl)){
                $work_jl = json_encode($work_jl);
            }
            $dbParam['work_jl'] = $work_jl;
            $dbParam['work_jl_none'] = $work_jl_none;
        }

        //教育经历
        if(in_array('education',$checkColumns)){
            $education       = $param['education'] ?? '';
            if(is_string($education)){
                $education = json_decode($education,true);
            }
            if(empty($education)){
                return array("state"=>200,"info"=>"请填写教育经历");
            }
            $dbParam['education'] = json_encode($education,256);
            //取第一个学历，自动抽取为最高学历
            //最高学历id
            $firstEdu = $education[0];  //[{"xl":"博士","start":"2013-9-9","end":"2016-3-3","school":"北京大学","zy":"计算机科学与技术","xl_id":3}]
            $edu_tallest = (int)$firstEdu['xl_id'];
            if(empty($edu_tallest)){
                return array("state"=>200,"info"=>"学历id错误【xl_id】");
            }
            $dbParam['edu_tallest'] = $edu_tallest;
            //最高学历入学时间
            $edu_start = (int)$firstEdu['start'];
            if(empty($edu_start)){
                return array("state"=>200,"info"=>"请选择入学时间【start】");
            }
            $dbParam['edu_start'] = $edu_start;
            //最高学历毕业时间
            $edu_end = (int)$firstEdu['end'];
            if(empty($edu_end)){
                return array("state"=>200,"info"=>"请选择毕业时间【end】");
            }
            $dbParam['edu_end'] = $edu_end;
            //最高学历，毕业学校
            $edu_school = $firstEdu['school'] ?? '';
            if(empty($edu_school)){
                return array("state"=>200,"info"=>"请填写毕业学校【school】");
            }
            $dbParam['edu_school'] = $edu_school;
            //最高学历，所学专业
            $edu_profession = $firstEdu['zy'] ?? '';
            if(empty($edu_profession)){
                // return array("state"=>200,"info"=>"请填写所学专业【zy】");
            }
            $dbParam['edu_profession'] = $edu_profession;
        }
        //语言、技能
        if(in_array('skill',$checkColumns)){
            $skill         = $param['skill'] ?? '';
            if(is_array($skill)){
                $skill = json_encode($skill);
            }
            $dbParam['skill'] = $skill;
        }
        //个人优势标签
        if(in_array('advantage',$checkColumns)){
            $advantage         = $param['advantage'] ?? '';
            $dbParam['advantage'] = $advantage;
        }
        //个人优势描述
        if(in_array('ad_tag',$checkColumns)){
            $ad_tag         = $param['ad_tag'] ?? '';
            if(is_array($ad_tag)){
                $ad_tag = join("||",$ad_tag);
            }
            $dbParam['ad_tag'] = $ad_tag;
        }
        
        //审核状态，单独修改求职意向和加分项时，不需要更新状态，因为这两项都是选择项，没有自定义填写输入
        if($columns!="intention" && $columns!="intentionPc" && $columns!="ad_tag"){
            include HUONIAOINC."/config/job.inc.php";
            $state = (int)$custom_fabuResumeCheck;
            $dbParam['state'] = $state;
        }

        $id = $param['id'];
        //编辑
        $sqlRes = false;  //sql是否执行成功
        if($id){
            $dbParamCount = count($dbParam);
            $dbParamIndex = 1;
            $sql = $dsql::SetQuery("update `#@__job_resume` set ");
            foreach ($dbParam as $dbParamK => $dbParamV){
                $sql .= "`".$dbParamK."`=";
                if(is_string($dbParamV)){
                    $dbParamV = addslashes($dbParamV);
                    $sql .= "'$dbParamV'";
                }else{
                    $sql .= strval($dbParamV);
                }
                if($dbParamIndex<$dbParamCount){
                    $sql .= ",";
                }
                $dbParamIndex ++;
            }
            $sql .= " where `id`=$id and `userid`=$uid";
            $ret = $dsql->dsqlOper($sql, "update");
            if ($ret == "ok") {
                $this->countResumeCompletion($id); //计算简历完整度
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'resume',
                    'id'=>$id
                );
                $url = getUrlPath($urlParam);
                //找出简历的名称
                $_sql = $dsql::SetQuery("select `name` from `#@__job_resume` where `id`=$id");
                $name = $dsql->getOne($_sql);
                memberLog($uid, 'job', 'resume', $id, 'update', '更新简历('.$name.')', $url, $sql);
                autoShowUserModule($uid,'job'); // 更新简历
                // 清除缓存
                checkCache("job_resume_list", $id);

                clearCache("job_resume_detail", $id);
                clearCache("job_resume_total", "key");

                $sqlRes = 1;  //更新成功

            } else {
                return array("state" => 200, "info" => '更新失败！');
            }
        }
        //发布简历
        else{
            //如果是第一个简历，则设置为默认简历（其他简历需要手动设置才能成为默认简历）
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=$uid");
            $resume_count = (int)$dsql->getOne($sql);
            //简历别名
            $alias = "简历".($resume_count+1);
            $dbParam['alias'] = $dbParam['alias'] ?? $alias;
            // 是否为默认简历
            $default = $resume_count>0 ? 0 : 1;
            $dbParam['default'] = $default;
            //text字段默认值
            if(!isset($dbParam['work_jl'])){
                $dbParam['work_jl'] = '';
            }
            if(!isset($dbParam['education'])){
                $dbParam['education'] = '';
            }
            if(!isset($dbParam['skill'])){
                $dbParam['skill'] = '';
            }
            $names = array_keys($dbParam);
            $fixNames = array();
            foreach ($names as $namesI){
                $fixNames[] = '`'.$namesI."`";
            }
            $values = array_values($dbParam);
            $fixValue = array();
            foreach ($values as $valueI){
                if(is_string($valueI)){
                    $valueI = addslashes($valueI);
                    $fixValue[] = "'$valueI'";
                }else{
                    $fixValue[] = strval($valueI);
                }
            }
            $sql = $dsql::SetQuery("insert into `#@__job_resume` (".join(",",$fixNames).") values(".join(",",$fixValue).")");
            $aid = $dsql->dsqlOper($sql, "lastid");
            if (is_numeric($aid)) {
                $this->countResumeCompletion($aid); //计算简历完整度
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'resume',
                    'id'=>$aid
                );
                $url = getUrlPath($urlParam);
                memberLog($uid, 'job', 'resume', $aid, 'insert', '新增简历('.$name.')', $url, $sql);
                autoShowUserModule($uid,'job');  // 新增简历
                // 清除缓存
                updateCache("job_resume_list", 300);
                clearCache("job_resume_total", "key");
                $sqlRes = 2; //保存成功
            } else {
                return array("state" => 200, "info" => '保存失败！');
            }
        }

        if($sqlRes){
            //字段冗余到其他简历中
            //头像
            if(in_array('photo',$checkColumns)){
                $this->update_u_common($uid,'resume.photo',$photo);//头像
                $sql = $dsql::SetQuery("update `#@__job_resume` set `photo`='$photo' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //姓名
            if(in_array('name',$checkColumns)){
                $this->update_u_common($uid,'resume.name',$name);
                $dsql->update($dsql::SetQuery("update `#@__job_resume` set `name`='$name' where `userid`=$uid and `id`!=$id"));
            }
            //求职身份
            if(in_array('identify',$checkColumns)){
                $oldIdentify = $this->get_u_common($uid,'resume.identify');
                $this->update_u_common($uid,'resume.identify',$identify);//求职身份
                $sql = $dsql::SetQuery("update `#@__job_resume` set `identify`='$identify' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
                //从学生，转职场人士，如果原来的工作性质是实习，则把工作性质转全职【所有简历】
                if($oldIdentify==2 && $identify==1){
                    $sql = $dsql::SetQuery("update `#@__job_resume` set `nature`=1 where `nature`=3 and `userid`=$uid");
                    $dsql->update($sql);
                }
            }
            //出生时间
            if(in_array('birth',$checkColumns)){
                $this->update_u_common($uid,'resume.birth',$birth);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `birth`='$birth' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //性别
            if(in_array('sex',$checkColumns)){
                $this->update_u_common($uid,'resume.sex',$sex);//性别
                $sql = $dsql::SetQuery("update `#@__job_resume` set `sex`='$sex' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //工作经验
            if(in_array('work_jl',$checkColumns)){
                $this->update_u_common($uid,'resume.work_jl',$work_jl);
                $this->update_u_common($uid,'resume.work_jl_none',$work_jl_none);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `work_jl`='$work_jl',`work_jl_none`=$work_jl_none where `userid`=$uid and `id`=$id");
                $dsql->update($sql);
            }
            //手机号码
            if(in_array('phone',$checkColumns)){
                $this->update_u_common($uid,'resume.phone',$phone);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `phone`='$phone' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //微信
            if(in_array('wechat',$checkColumns)){
                $this->update_u_common($uid,'resume.wechat',$wechat);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `wechat`='$wechat' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //邮箱
            if(in_array('email',$checkColumns)){
                $this->update_u_common($uid,'resume.email',$email);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `email`='$email' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //求职状态
            if(in_array('workState',$checkColumns)){
                $this->update_u_common($uid,'resume.workState',$workState);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `workState`=$workState where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //到岗时间
            if(in_array('startWork',$checkColumns)){
                $this->update_u_common($uid,'resume.startWork',$startWork);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `startWork`=$startWork where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }
            //期望职位
            if(in_array('job',$checkColumns)){
                $this->update_u_common($uid,'resume.job',$job);
                $sql = $dsql::SetQuery("update `#@__job_resume` set `job`='$job' where `userid`=$uid and `id`!=$id");
                $dsql->update($sql);
            }

            return array("state"=>100,"info"=> ($sqlRes==1 ? '更新' : "保存") ."成功","aid"=>$aid ?? $id);
        }

    }

    /**
     * 统计简历的完善度、必填项是否全部已填
    */
    public function countResumeCompletion($rid,$ars=array()){
        global $dsql;
        //统一计算完整度，并更新
        //工作经历、教育、求职意向 -- 60%
        //个人技能、优势 85%
        //详尽，90%
        $sql = $dsql::SetQuery("select `name`,`photo`,`birth`,`phone`,`identify`,`work_jy`,`nature`,`type`,`completion`,`education`,`work_jl`,`work_jl_none`,`workState`,`max_salary`,`addr`,`min_salary`,`work_jl`,`work_jl_none`,`startWork`,`job`,`name`,`skill`,`advantage`,`ad_tag`,`wechat`,`email`,`need_complete` from `#@__job_resume` where `id`=$rid");
        $detail = $dsql->getArr($sql);
        $completion = 0;  //完整度
        //姓名
        if(!empty($detail['name'])){
            $completion += 10;
        }
        //学历
        if(!empty($detail['education'])){
            $completion += 10;
        }
        //工作经历
        if(!empty($detail['work_jl']) || !empty($detail['work_jl_none'])){
            $completion += 10;
        }
        //求职状态
        if(!empty($detail['workState'])){
            $completion += 10;
        }
        //到岗时间
        if(!empty($detail['startWork'])){
            $completion += 10;
        }
        //期望岗位
        if(!empty($detail['job'])){
            $completion += 10;
        }
        //85
        if(!empty($detail['skill'])){
            $completion += 15;
        }
        if(!empty($detail['advantage'])){
            $completion += 5;
        }
        if(!empty($detail['ad_tag'])){
            $completion += 5;
        }
        //其他，少量，100
        if(!empty($detail['wechat'])) $completion += 7;
        if(!empty($detail['email'])) $completion += 8;
        if($completion != $detail['completion']){
            $sql = $dsql::SetQuery("update `#@__job_resume` set `completion`=$completion where `id`=$rid");
            $dsql->update($sql);
        }
        //简历必填项目计算【改：必须需要填写的是，基础信息和求职意向】
        $need_complete = 0;
        if($ars['type']){  //老数据转换，type不校验
            if(!empty($detail['name'])
                && !empty($detail['photo'])
                && !empty($detail['birth'])
                && !empty($detail['phone'])
                && !empty($detail['identify'])
                && !empty($detail['job'])
                && !empty($detail['nature'])
                && !empty($detail['workState'])
                && !empty($detail['min_salary'])
                && !empty($detail['max_salary'])
                && !empty($detail['startWork'])
                && !empty($detail['addr'])){
                $need_complete = 1;
            }
        }else{
            if(!empty($detail['name'])
                && !empty($detail['photo'])
                && !empty($detail['birth'])
                && !empty($detail['phone'])
                && !empty($detail['identify'])
                && !empty($detail['job'])
                && !empty($detail['nature'])
                && !empty($detail['type'])
                && !empty($detail['workState'])
                && !empty($detail['min_salary'])
                && !empty($detail['max_salary'])
                && !empty($detail['startWork'])
                && !empty($detail['addr'])){
                $need_complete = 1;
            }
        }
        if($need_complete!=$detail['need_complete']){
            $sql = $dsql::SetQuery("update `#@__job_resume` set `need_complete`=$need_complete where `id`=$rid");
            $dsql->update($sql);
        }
    }

    /**
     * 更新求职意向
     */
    public function updateResumeIntention($nparam=array()){
        global $dsql;
        $uid = $this->getUid();
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            if(!empty($nparam['id'])){
                $id = $nparam['id'];
            }
            return array("state"=>200,"info"=>"缺少简历id");
        }
        $type         = $param['type'];
        if(empty($type)){
            return array("state"=>200,"info"=>"请选择期望行业");
        }
        if(is_array($type)){
            $type = join(",",$type);
        }
        $job          = $param['job'];
        if(empty($job)){
            return array("state"=>200,"info"=>"请选择期望职位");
        }
        if(is_array($job)){
            $job = join(",",$job);
        }
        $nature       = (int)$param['nature'];
        if(empty($nature)){
            return array("state"=>200,"info"=>"请选择工作性质");
        }
        $addr       = (int)$param['addr'];
        if(empty($addr)){
            return array("state"=>200,"info"=>"请选择希望地点");
        }
        $min_salary       = (int)$param['min_salary'];
        if(empty($min_salary)){
            return array("state"=>200,"info"=>"请选择最低期望薪资");
        }
        $max_salary       = (int)$param['max_salary'];
        if(empty($max_salary)){
            return array("state"=>200,"info"=>"请选择最高期望薪资");
        }
        $workState    = (int)$param['workState'];
        if(empty($workState)){
            return array("state"=>200,"info"=>"请选择求职状态");
        }
        $startWork       = (int)$param['startWork'];
        if(empty($startWork)){
            return array("state"=>200,"info"=>"请选择到岗时间");
        }
        $sql = $dsql::SetQuery("update `#@__job_resume` set `type`='$type',`job`='$job',`nature`=$nature,`addr`=$addr,`min_salary`=$min_salary,`max_salary`=$max_salary,`workState`=$workState,`startWork`='$startWork' where `id`=$id and `userid`=$uid");
        $res = $dsql->update($sql);
        if($res!="ok"){
            return array("state"=>200,"info"=>"操作失败，请检查字段");
        }
        //求职状态、到岗时间、求职岗位是同步的
        $this->update_u_common($uid,"resume.workState",$workState);
        $sql = $dsql::SetQuery("update `#@__job_resume` set `workState`=$workState where `userid`=$uid");
        $dsql->update($sql);
        $this->update_u_common($uid,"resume.startWork",$startWork);
        $sql = $dsql::SetQuery("update `#@__job_resume` set `startWork`=$startWork where `userid`=$uid");
        $dsql->update($sql);
        $this->update_u_common($uid,"resume.job",$job);
        $sql = $dsql::SetQuery("update `#@__job_resume` set `job`='$job' where `userid`=$uid");
        $dsql->update($sql);
        return array("state"=>100,"info"=>"更新成功");
    }


    /**
     * 职位：批量上架、批量下架
     */
    public function updateOffPost(){
        global $dsql;
        global $userLogin;
        //要下架的 id 列表
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少指定参数：id");
        }
        //新的状态
        $off = (int)$param['off'];
        $valid = (int)$param['valid'];
        $long_valid = $param['long_valid']=="true" ? 1 : (int)$param['long_valid'];  //正常要传1或0，前端传了true导致无法识别，这里兼容一下
        $long_valid = $long_valid ? 1 : 0;

        //上架职位需要验证公司状态
        if($off == 0){
            $company = $this->getCidCheck();
            if(is_array($company)){
                return $company;
            }
        }else{
            $company = $this->getCidCheck(0);
            if(is_array($company)){
                return $company;
            }
        }

        //批量更新状态
        $append = "";
        if($off){  //有值，则把职位的有效期更新为当前时间

            $append = ",`offdate`=".time();

            $sql = $dsql::SetQuery("update `#@__job_post` set `off`=$off $append where `id` in($id) and `company`=$company");
            $ret = $dsql->update($sql);

            if($ret == 'ok'){
                return "下架成功";
            }else{
                return array("state"=>200,"info"=>$ret);
            }

        }else{  //上架

            $ids = explode(',', $id);

            //判断可上架职位数
            $this->param = array();
            $companyDetail = $this->companyDetail();
            if(!is_array($companyDetail)){
                return array("state"=>200,"info"=>"公司信息获取失败，请稍候重试！");
            }else{
                $canJobs = (int)$companyDetail['canJobs'];
            }

            if($canJobs == 0 || ($canJobs != -1 && $canJobs < count($ids))){
                return array("state"=>200,"info"=>"可上架职位数不足！");
            }

            $todayTime = GetMkTime(date('Y-m-d', time()));

            foreach($ids as $_id){
                $_id = (int)$_id;

                $append = ",`valid`=$valid,`long_valid`=$long_valid";

                //获取职位更新时间，每个职位每天上架第一次可以更新时间，重新下架再上架时间不再更新，只有修改或刷新后才更改
                $sql = $dsql::SetQuery("select `update_time` from `#@__job_post` where `id`=$_id and `company`=$company");
                $ret = $dsql->getOne($sql);
                if($ret){
                    $update_time = $ret ? GetMkTime(date('Y-m-d', $ret)) : 0;

                    if($update_time != $todayTime){
                        $now = GetMkTime(time());
                        $append .= ",`update_time` = $now";
                    }

                    $sql = $dsql::SetQuery("update `#@__job_post` set `off`=$off $append where `id`=$_id and `company`=$company");
                    $dsql->update($sql);
                }
            }

            return "上架成功";
        }
        
    }

    /**
     * 获取商家已发布职位的分类
     */
    public function postType(){
        global $dsql;
        $param = $this->param;
        $cid = $param['id'];  //如果指定了id，优先取该商家id
        if(empty($cid)){
            $cid = $this->getCid(); //否则取默认登录
            if(is_array($cid)){  //如果当前未登录，报错
                return $cid;
            }
        }
        //获取所有的职位的分类id
        $sql = $dsql::SetQuery("select `type` from `#@__job_post` where `company`=$cid and `off`=0 and `del`=0 order by `pubdate` desc");
        $typeList = $dsql->getArr($sql);
        if(empty($typeList)){
            return array("state"=>200,"info"=>"暂无数据");
        }
        $sql = $dsql::SetQuery("select `id`,`typename` from `#@__job_type` where `id` in(".join(",",$typeList).") order by field(`id`,".join(",",$typeList).")");
        $res = $dsql->getArrList($sql);
        foreach ($res as & $ii){
            $ii['id'] = (int)$ii['id'];
        }
        unset($ii);
        return $res;
    }

    /**
     * 取招聘地区选项
     */
    public function fixFairsAddr(){
        global $dsql;
        //获取所有的招聘会，并取得所有的招聘地区
        $sql = $dsql::SetQuery("select c.`addr` from `#@__job_fairs` f left join `#@__job_fairs_center` c ON f.`fid`=c.`id`");
        $addrs = $dsql->getArr($sql);
        $addrs = array_unique($addrs);
        $addrs = array_filter($addrs);
        //更新到option表中
        $sql = $dsql::SetQuery("update `#@__job_option` set `value`='".join(",",$addrs)."'where `name`='fair_addrs'");
        $dsql->update($sql);
    }

    /**
     * 职位浏览记录
     */
    public function history_postList(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return array("state"=>200,"info"=>"请先登录");
        }
        $param = $this->param;
        $page = $param['page'] ?? 1;
        $pageSize = $param['pageSize'] ?? 5;
        $sql = $dsql::SetQuery("select h.`aid` 'id',p.`title`,p.`dy_salary`,p.`job_addr`,p.`min_salary`,p.`max_salary`,p.`salary_type`,p.`mianyi`,c.`id` 'cid',c.`title` 'ctitle' from `#@__job_historyclick` h left join `#@__job_post` p on h.`aid`=p.`id` left join `#@__job_company` c on c.`id`=p.`company` where h.`uid`=$uid and `module`='job' and `module2`='postDetail' order by `date` desc");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $urlParam = array(
                "service"=>"job",
                "action"=>"job",
                "id"=>$item['id']
            );
            $item['url'] = getUrlPath($urlParam);
            $item['dy_salary'] = (int)$item['dy_salary'];
            //查找地址
            $this->param = array("method"=>"query","id"=>$item["job_addr"]);
            $job_addr_detail = $this->op_address();
            if($job_addr_detail['state']==200){
                $job_addr_detail = array();
            }
            $job_addr_detail = $job_addr_detail[0];
            if($job_addr_detail){
                $item['addrName'] = $job_addr_detail['addrName'];
            }else{
                $item['addrName'] = array();
            }
            //显示金额
            $min_salary = $item['min_salary'];
            $max_salary = $item['max_salary'];
            $item['show_salary'] = salaryFormat($item['salary_type'], $min_salary, $max_salary, $item['mianyi']);
        }
        return $pageObj;
    }

    /**
     * 普工浏览历史
    */
    public function pgBrowseHistory(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $page = $param['page'] ?? 1;
        $pageSize = $param['pageSize'] ?? 5;
        $sql = $dsql::SetQuery("select h.`aid` 'id',p.`title`,p.`salary_type`,p.`min_salary`,p.`max_salary`,`addrid`,`userid`,`nickname` from `#@__job_historyclick` h left join `#@__job_pg` p on h.`aid`=p.`id` where h.`uid`=$uid and `module`='job' and `module2`='pgDetail'");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];  //id
            $item['salary_type'] = (int)$item['salary_type'];  //薪资类型
            $item['salary_type_name'] = $item['salary_type'] == 1 ? '月薪' : '时薪';  //薪资类型
            $item['min_salary'] = (int)$item['min_salary'];
            $item['max_salary'] = (int)$item['max_salary'];
            $item['addrid'] = (int)$item['addrid'];
            $item['addr_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`={$item['addrid']}"));
            $urlParam = array(
                "service"=>"job",
                "action"=>"pg",
                "id"=>$item['id']
            );
            $item['url'] = getUrlPath($urlParam);  //url
            //判断用户是否为企业，如果是企业则使用企业名称
            $sql = $dsql::SetQuery("select `title` from `#@__job_company` where `userid`={$item['userid']}");
            $ctitle = $dsql->getOne($sql);
            if(!empty($ctitle)){
                $item['username'] = $ctitle;
            }
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 求职浏览历史
    */
    public function qzBrowseHistory(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $page = $param['page'] ?? 1;
        $pageSize = $param['pageSize'] ?? 5;
        $sql = $dsql::SetQuery("select h.`aid` 'id',p.`title`,`userid`,`sex`,`education`,`experience`,`age`,`nickname` from `#@__job_historyclick` h left join `#@__job_qz` p on h.`aid`=p.`id` where h.`uid`=$uid and `module`='job' and `module2`='qzDetail'");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $item['sex'] = (int)$item['sex'];
            $item['sex_name'] = $item['sex']==1 ? '男' : '女';
            $item['age'] = (int)$item['age'];
            $item['education'] = (int)$item['education'];
            $item['education_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`={$item['experience']}"));
            $item['experience'] = (int)$item['experience'];
            $item['experience_name'] = $item['experience']."年";
        }
        unset($item);
        return $pageObj;
    }

    /**
     * 求职推荐
    */
    public function pgRecommend(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $limit = $param['limit'] ?: 5;  //最大数量
        $limit = (int)$limit;
        //取出我发布过的所有普工职位，随机匹配求职
        $sql = $dsql::SetQuery("select distinct `job` from `#@__job_pg` where `userid`=$uid");
        $jobs = $dsql->getArr($sql);
        if(empty($jobs)){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        $jobs = join(",",$jobs);
        $jobs = explode(",",$jobs);
        $jobs = array_unique($jobs);    //我所发布过的职位类别

        $find_jobs = array();
        //遍历这些职位类别，逐一寻找
        foreach ($jobs as $jobs_i){
            $sql = $dsql::SetQuery("select `id` from `#@__job_qz` where find_in_set('$jobs_i',`job`) limit $limit");
            $find_item = $dsql->getArr($sql);
            $find_jobs = array_merge($find_jobs,$find_item);
            $find_jobs = array_unique($find_jobs);
            if(count($find_jobs) >= $limit){
                break;
            }
        }
        //如果一个没找到
        if(count($find_jobs)==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        //根据找到的id，查询数据
        $find_jobs = array_slice($find_jobs,0,$limit);
        $find_jobs = join(",",$find_jobs);

        //匹配是否有对应求职
        $sql = $dsql::SetQuery("select `id`,`nickname`,`pubdate`,`education`,`experience`,`addrid`,`sex`,`age`,`job` from `#@__job_qz` where `id` in($find_jobs)");
        $list = $dsql->getArrList($sql);
        foreach ($list as & $item){
            $item['id'] = (int)$item['id'];
            $item['sex'] = (int)$item['sex'];
            $item['sex_name'] = $item['sex']==1 ? '男' : '女';
            $item['age'] = (int)$item['age'];
            $item['addrid'] = (int)$item['addrid'];
            $item['education'] = (int)$item['education'];
            $item['experience'] = (int)$item['experience'];
            $item['experience_name'] = $item['experience']."年";
            $item['education_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`={$item['education']}"));
            $item['job'] = json_decode("[".$item['job']."]",true);
            $job_names = array();
            foreach ($item['job'] as $job_i){
                $job_names[] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_type_pg` where `id`={$job_i}"));
            }
            $item['job_names'] = $job_names;
            //多级地址
            $item['addrid'] = (int)$item['addrid'];
            $item['addrName'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__site_area` where `id`=".$item['addrid']));
            $addrName = getParentArr("site_area", $item['addrid']);
            global $data;
            $data = "";
            $item['addrName'] = array_reverse(parent_foreach($addrName, "typename"));
        }
        unset($item);
        $return['pageInfo']['page'] = 1;
        $return['pageInfo']['pageSize'] = $limit;
        $return['pageInfo']['totalCount'] = count($list);
        $return['pageInfo']['totalPage'] = 1;
        $return['list'] = $list;
        return $return;
    }

    /**
     * 招聘会、资讯最新消息
     */
    public function fairNews(){
        global $dsql;
        $param = $this->param;
        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 10;
        $orderby = " order by `pubdate` desc";
        $fairs_sql = $dsql::SetQuery("select 'zhaopinhui' as 'type', `type` as 'ftype', `id`, `obj`, `title`,`pubdate` from `#@__job_fairs`");
        $news_sql = $dsql::SetQuery("select 'news-detail' as 'type', '' as `ftype`, `id`, '' as 'obj', `title`,`pubdate` from `#@__job_news`");
        $allSql = $dsql->SetQuery("SELECT * FROM (".$fairs_sql." UNION ALL ".$news_sql.") as alls ".$orderby);
        $pageObj = $dsql->getPage($page,$pageSize,$allSql);
        foreach ($pageObj['list'] as & $item){
            $item['pubdate'] = (int)$item['pubdate'];
            $item['id'] = (int)$item['id'];
            $item['ftype'] = (int)$item['ftype'];
            $urlParam = array(
                "service"=>"job",
                "template"=>$item['type'],
                "id"=>$item['id']
            );
            $item['url'] = getUrlPath($urlParam);
        }
        unset($item);
        return $pageObj;
    }


    /**
     * 移动端自定义菜单
     */
    public function getCustomMenu(){
        global $dsql;
        $sql = $dsql::SetQuery("select `value` from `#@__job_option` where `name`='custom_menu'");
        $res = $dsql->getOne($sql) ?: "";
        return json_decode($res,true);;
    }


    /**
     * 职位列表
     */
    public function postList(){
        global $dsql;
        global $userLogin;

        $delWhere = " AND p.`del`=0";
        $where = "";
        $param = $this->param;
        $page = (int)$param['page'] ?: 1;
        $pageSize = (int)$param['pageSize'] ?: 10;
        $id = $this->param['id'];  //指定信息id，多个用,分隔

        $company = (int)$param['company'];  //指定公司id，如果同时指定com，则此参数失效
        $com = (int)$param['com'];  //获取当前会员的职位（当前会员必须是商家）

        //已废弃，state=1,3时，将不对职位状态做限制显示
        $pid = (int)$param['pid'];  //获取指定职位ID，用于企业邀请面试时，指定该职位，如果该职位状态不正常，也强制输出，此数据只在state=1,3时有用

        $platform_name = $param['platform_name'];

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
            $where .= " AND p.`id` IN ($id)";
        }

        $near = $param['near'];  //查询附近？
        $lng = (float)$param['lng'];
        $lat = (float)$param['lat'];
        $address = $param['address'];
        if($near && $lng && $lat){  //附近10公里
            $sql = $dsql::SetQuery("select `id` from `#@__job_address` where ROUND(
                6378.138 * 2 * ASIN(
                    SQRT(POW(SIN(($lat * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(`lng` * PI() / 180) * POW(SIN(($lng * PI() / 180 - `lng` * PI() / 180) / 2), 2))
                ) * 1000
            ) < 100000");
            $addrs = $dsql->getArr($sql);
            if(empty($addrs)){
                $where .= " and 1=2";
            }else{
                $where .= " AND p.`job_addr` in (".join(",",$addrs).")";
            }
            //记录到历史搜索表中【必须已登录的情况下】
            $uid = $this->getUid();
            if(!is_array($uid)){
                $time = time();
                //查询是否已添加过重复记录？
                $sql = $dsql::SetQuery("select `id` from `#@__job_seach_history` where `lng`='$lng' and `lat`='$lat' and `uid`=$uid");
                $sh_exist = $dsql->getOne($sql);
                if(!$sh_exist){ //从未添加过
                    $sql = $dsql::SetQuery("insert into `#@__job_seach_history`(`uid`,`lng`,`lat`,`address`,`pubdate`) values($uid,'$lng','$lat','$address',$time)");
                    $dsql->update($sql);
                }
            }
        }

        $filterId = $param['filterId'] ?: "";
        if(!empty($filterId)){
            $where .= " AND p.`id` not in({$filterId})";
        }

        $collect = $param['collect'];  //查看已收藏列表
        $collectTime = $param['collectTime'] ?? 1; //收藏的时间筛选，1.全部【默认】，2、3个月内收藏

        $uid = $userLogin->getMemberID();
        $time = time();
        //仅获取当前登录商家（后台）
        $current_store = 0;
        if($com){
            $cid = $this->getCidCheck(0);
            if(is_array($cid)){
                return $cid;
            }
            
            $companyInfo = $this->getCid(1);
            $companyState = (int)$companyInfo['state'];

            $where .= " AND p.`company`=$cid";

            $current_store = 1;
        }
        //普通获取（前台）
        else{
            //筛选指定商家id
            if(!empty($company)){
                $where .= " ANd p.`company`=$company AND p.`state`=1 AND p.`del`=0 AND p.`off`=0 AND (p.`valid`=0 OR p.`valid`>$time OR p.`long_valid` = 1)";  //必须是已审核（状态正常）
            }
            //用户级别
            else{
                //获取已收藏
                if($collect){
                    $collectWhere = "";
                    if($collectTime==2){
                        $collectWhere .= " and `pubdate`>=".(time()-90*86400);
                    }
                    //查询当前用户收藏职位列表
                    $collectsql = $dsql->SetQuery("SELECT `aid` FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'job' AND `userid` = '$uid'".$collectWhere);
                    $collectArr = $dsql->getArr($collectsql);
                    if($collectArr){
                        $where .= " AND p.`id` in(".join(",",$collectArr).")";
                    }
                    else{
                        $where .= " AND 1=2";
                    }
                }
                else{ //其他前台操作
                    $where .= " AND p.`state`=1 AND p.`del`=0 AND p.`off`=0 AND (p.`valid`=0 OR p.`valid`>$time OR p.`long_valid` = 1)";
                }
            }
        }


        //指定关键字
        $keyword = $param['keyword'] ? $param['keyword'] : $param['title'];
        $stype = $param['stype'];  //搜索附加选项
        if(!empty($keyword)){
            //搜索公司名称 + 职位名称 + 分类名称
            if($stype=="all"){
                $sql = $dsql::SetQuery("select `id` from `#@__job_type` where `typename` like '%$keyword%'");
                $tids = $dsql->getArr($sql);
                $where .= " AND (p.`title` like '%$keyword%' or c.`title` like '%$keyword%'";
                if($tids){
                    $where .= " or p.`type` in(".join(",",$tids).")";
                }
                $where .= ")";
            }
            //仅搜索职位名称
            else{
                $where .= " AND p.`title` like '%$keyword%'";
            }
        }

        //工作经验
        $experience = (int)$param['experience'];
        if ($experience!="") {
            $where .= " AND p.`experience` = " . $experience;
        }

        //学历
        $educational = $param['educational'];
        if ($educational) {
            $educational = convertArrToStrWithComma($educational);  //将指定数据用逗号分隔，并对数据类型验证
            $where .= " AND p.`educational` in (".$educational.")";
        }

        //性质
        // $nature = (int)$param['nature'];  //暂只支持单选
        $nature = $param['nature'];
        if (strstr($nature, ',')) {
            $nature = convertArrToStrWithComma($nature);  //将指定数据用逗号分隔，并对数据类型验证
            $where .= " AND p.`nature` in (" . $nature . ")";
        }else{
            $nature = (int)$nature;
            if ($nature) {
                $where .= " AND p.`nature` = $nature";
            }
        }

        //工资
        $min_salary = (float)$param['min_salary'];
        $max_salary = (float)$param['max_salary'];
        if(!empty($min_salary) || !empty($max_salary)){

            //兼职和假期工需要兼容时薪的情况
            //兼容和假期工传来单位是时薪，这里要考虑到有月薪的职位，所以需要把时薪换算成月薪，基本公式是：最低薪资*160，最高薪资*200
            if($nature == 2 || $nature == 4 || $nature == '2,4'){

                $salary_type = (int)$param['salary_type'];  //1是月薪  2是时薪，默认是时薪
                if($salary_type == 1){
                    $min_salary_month = $min_salary;
                    $max_salary_month = $max_salary;

                    $min_salary = $min_salary ? (int)($min_salary / 160) : 0;
                    $max_salary = $max_salary ? (int)($max_salary / 200) : 0;
                }

                $min_salary_month = $min_salary * 160;
                $max_salary_month = $max_salary * 200;

                if($min_salary && $max_salary){
                    $where .= " AND `mianyi` = 0 AND ((`salary_type`=2 AND `min_salary`>=$min_salary AND `max_salary`<=$max_salary) OR (`salary_type`=1 AND `min_salary`>=$min_salary_month AND `max_salary`<=$max_salary_month))";
                }
                elseif($min_salary){
                    $where .= " AND `mianyi` = 0 AND ((`salary_type`=2 AND `min_salary`>=$min_salary) OR (`salary_type`=1 AND `min_salary`>=$min_salary_month))";
                }
                else{ //max
                    $where .= " AND `mianyi` = 0 AND ((`salary_type`=2 AND `max_salary`<=$max_salary) OR (`salary_type`=1 AND `max_salary`<=$max_salary_month))";
                }
            }
            else{
                if($min_salary && $max_salary){
                    $where .= " AND `mianyi` = 0 AND `min_salary`>=$min_salary AND `max_salary`<=$max_salary";
                }
                elseif($min_salary){
                    $where .= " AND `mianyi` = 0 AND `min_salary`>=$min_salary";
                }
                else{ //max
                    $where .= " AND `mianyi` = 0 AND `max_salary`<=$max_salary";
                }
            }
        }
        $salary_type = (int)$param['salary_type'];
        if(!empty($salary_type)){
            $where .= " AND `salary_type`=".$salary_type;
        }
        $dy_salary = (int)$param['dy_salary']; // 1 or 0 ，其他不可以
        if ($dy_salary != "") {
            $where .= " AND p.`dy_salary` = " . $dy_salary;
        }

        $rec = (int)$param['rec'];  //置顶
        if($rec==1){
            $where .= " AND p.`is_topping` = 1";
        }

        //数据共享，如果传了指定的区域ID，就不进行分站筛选
        if(!$param['addrid']){
            require(HUONIAOINC."/config/job.inc.php");
            $dataShare = (int)$customDataShare;
            if(!$dataShare && !$com){
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND p.`cityid` = " . $cityid;
                }
            }
        }

        //职位类别
        $type = (int)$param['type'];
        $filterDelivery = $param['filterDelivery'];
        if (!empty($type)) {
            $arr = $dsql->getTypeList($type, "job_type");
            if ($arr) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($arr);
                $lower = $type . "," . join(',', $lower);
            } else {
                $lower = $type;
            }
            if($filterDelivery){  //过滤不能投递的，这里用jobRecommend过滤一下并直接返回
                $this->param['type'] = $lower;
                return $this->jobRecommend();
            }else{
                $where .= " AND p.`type` in ($lower)";
            }
        }
        //行业
        $industry = (int)$param['industry'];
        if (!empty($industry)) {
            $param_ = $this->param;
            $this->param['type'] = $industry;
            $this->param['son'] = 1;
            $arr = $this->industry();
            $this->param = $param_;

            if ($arr) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($arr);
                $lower = $industry . "," . join(',', $lower);
            } else {
                $lower = $industry;
            }

            $comSql    = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `industry` in (" . $lower . ")");
            $comResult = $dsql->dsqlOper($comSql, "results");
            if ($comResult) {
                $_cid = array();
                foreach ($comResult as $key => $comval) {
                    array_push($_cid, $comval['id']);
                }
                if (!empty($_cid)) {
                    $where .= " AND p.`company` in (" . join(",", $_cid) . ")";
                } else {
                    $where .= " AND 1 = 2";
                }
            } else {
                $where .= " AND 1 = 3";
            }
        }
        //公司性质
        $gnature = $param['gnature'];
        if ($gnature) {
            $gnature = convertArrToStrWithComma($gnature);  //将指定数据用逗号分隔，并对数据类型验证
            $comSql    = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `nature` in (" . $gnature .")");
            $comResult = $dsql->getArr($comSql);
            if ($comResult) {
                $_cid = join(",",$comResult);
                if (!empty($_cid)) {
                    $where .= " AND p.`company` in (" . $_cid . ")";
                } else {
                    $where .= " AND 1 = 4";
                }
            } else {
                $where .= " AND 1 = 5";
            }
        }
        //公司规模
        $scale = (int)$param['scale'];
        if ($scale) {
            $comSql    = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `scale` = " . $scale);
            $comResult = $dsql->getArr($comSql);
            if ($comResult) {
                $_cid = join(",",$comResult);
                if (!empty($_cid)) {
                    $where .= " AND p.`company` in (" . $_cid . ")";
                } else {
                    $where .= " AND 1 = 6";
                }
            } else {
                $where .= " AND 1 = 7";
            }
        }

        //工作区域筛选
        $addrid = $param['addrid'];
        if($addrid!="" && $addrid != 0){
            $addrid = convertArrToStrWithComma($addrid);  //将指定数据用逗号分隔，并对数据类型验证
            $addrids = explode(",",$addrid);
            //多个直接 in
            if(count($addrids)>1){
                $sql = $dsql::SetQuery("select `id` from `#@__job_address` where `addrid` in ({$addrid})");
                $address_id = $dsql->getArr($sql);
                if(!empty($address_id)){
                    $address_id = join(",",$address_id);
                    $where .= " and p.`job_addr` in ({$address_id})";
                }else{
                    $where .= " and 1=2";
                }
            }else{
                //单个，可以遍历子级
                if($dsql->getTypeList($addrid, "site_area")){
                    global $arr_data;
                    $arr_data = array();
                    $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));  //该项子id列表
                    $lower[] = $addrid;
                    $lower = join(",",$lower);
                }else{
                    $lower = $addrid;
                }
                $sql = $dsql::SetQuery("select `id` from `#@__job_address` where `addrid` in ({$lower})");
                $address_id = $dsql->getArr($sql);
                if(!empty($address_id)){
                    $address_id = join(",",$address_id);
                    $where .= " and p.`job_addr` in ({$address_id})";
                }else{
                    $where .= " and 1=2";
                }
            }
        }

        //名企职位筛选
        $famous = $param['famous'];
        if(!empty($famous)){
            $where .= " AND c.`famous`=1";
        }

        //抖音端状态
        if($platform_name == 'dy_miniprogram'){
            $where .= " AND p.`douyin` = 1";
        }

        $orderby = (int)$param['orderby'];

        //默认排序（优先置顶、然后是更新时间）
        $order = " order by p.`is_topping` desc,p.`update_time` desc";
        if($orderby == 3){  //按更新时间刷新
            $order = " order by p.`is_topping` desc,p.`update_time` desc";
        }
        elseif($orderby==2){ //最高薪资
            $order = " order by p.`max_salary` desc";
        }
        elseif($orderby==4 && is_numeric($uid)){ //投递排序
            $order = " ".$dsql::SetQuery("order by (select `id` from `#@__job_delivery` where `userid`=$uid and `cid`=c.`id` and `pid`=p.`id` limit 1) desc,p.`is_topping` desc,p.`pubdate` desc");
        }

        //状态
        $stateWhere = "";

        $state = $param['state'];
        if ($state != "") {
            if(is_numeric($state) && $state==1){ //招聘中：off=0 且 state=1

                //如果是企业招聘中心获取职位列表，并且公司状态为待审核时，所有审核通过的职位也要显示为待审核
                if($com && $companyState == 0){
                    $stateWhere = " AND 1 = 8";
                }else{
                    $stateWhere = " AND p.`off`=0 AND p.`state`=1";
                }
                
            }
            elseif(is_numeric($state) && ($state==0 || $state==2)){

                //如果是企业招聘中心获取职位列表，并且公司状态为待审核时，所有审核通过的职位也要显示为待审核，待审核中要显示已经通过审核的职位
                if($com && $companyState == 0 && $state == 0){
                    $stateWhere = " AND p.`off`=0 AND (p.`state`=0 or p.`state`=1)";
                }else{
                    $stateWhere = " AND p.`off`=0 AND p.`state`=$state";
                }
            }
            elseif(is_numeric($state) && $state==3) {
                $stateWhere = " AND p.`off`=1";
            }
            //招聘中的和已经下架的
            elseif($state=='1,3'){
                // $stateWhere = " AND p.`state`=1";
                $stateWhere = '';  //由于此状态是提供给邀请面试时，获取要面试的职位列表，由于在获取时，之前已经投递的职位出现了状态变更，导致职位列表无法显示，所以这里不再对状态进行限制
                $order = " order by p.`off` asc,p.`update_time` desc";
            }
            //待审核/已审核/已下架，不能显示未通过的职位
            elseif($state=='1,3,0'){
                $stateWhere = ' AND (((p.`state`=0 or p.`state`=1) and p.`off`=1) or ((p.`state`=0 or p.`state`=1) and p.`off`=0))';  //由于此状态是提供给邀请面试时，获取要面试的职位列表，由于在获取时，之前已经投递的职位出现了状态变更，导致职位列表无法显示，所以这里不再对状态进行限制
                $order = " order by p.`off` asc,p.`update_time` desc";
            }
        }

        if(!$collect){  //除了收藏外，其他 del 都要删除
            $where .= $delWhere;
        }

        if($cid){
            $baseSql = $dsql::SetQuery("select p.`id` from `#@__job_post` p LEFT JOIN `#@__job_company` c ON p.`company`=c.`id` where 1=1".$where);
        }else{
            $baseSql = $dsql::SetQuery("select p.`id` from `#@__job_post` p LEFT JOIN `#@__job_company` c ON p.`company`=c.`id` where 1=1 and c.`state`=1".$where);
        }

        $sql = $baseSql.$stateWhere.$order;  // 查询数据，需要 state 和 排序
        $pageObj = $dsql->getPage($page,$pageSize,$sql);

        //会员后台统计状态
        if($cid){

            //如果是企业招聘中心获取职位列表，并且公司状态为待审核时，所有审核通过的职位也要显示为待审核，待审核中要显示已经通过审核的职位
            if($com && $companyState == 0){
                $state0 = $dsql->count($baseSql." AND (p.`state`=0 or p.`state` = 1) AND p.`off`=0");
                $state1 = $dsql->count($baseSql." AND 1 = 2");
            }else{
                $state0 = $dsql->count($baseSql." AND p.`state`=0 AND p.`off`=0");
                $state1 = $dsql->count($baseSql." AND p.`state`=1 AND p.`off`=0");
            }
            $state2 = $dsql->count($baseSql." AND p.`state`=2 AND p.`off`=0");
            $state3 = $dsql->count($baseSql." AND p.`off`=1");
            $pageObj['state0'] = $state0;
            $pageObj['state1'] = $state1;
            $pageObj['state2'] = $state2;
            $pageObj['state3'] = $state3;
        }


        //收藏统计
        if($collect){
            $sqls = $dsql::SetQuery("SELECT `aid` FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'job' AND `userid` = '$uid'");
            $aids = $dsql->getArr($sqls);
            if($aids){
                $pageObj['pageInfo']['totalCountAll'] = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_post` where `id` in(".join(",",$aids).")"));  //无条件时的收藏
            }else{
                $pageObj['pageInfo']['totalCountAll'] = 0;
            }
            //尝试把所有数据变已读
            $sqls = $dsql::SetQuery("update `#@__member_collect` set `u_read`=1 where `module` = 'job' AND `action` = 'job' AND `userid` = '$uid' and `u_read`=0");
            $dsql->update($sqls);
        }

        $list = array();

        $hasPid = 0;
        foreach ($pageObj['list'] as $k => $item){

            if($state == '1,3' && $item['id'] == $pid){
                $hasPid = true;
            }

            $this->param = array('id'=>$item['id'],'store'=>$current_store);
            if($collect || $com){
                $this->right = true;
            }
            $postDetail = $this->postDetail();
            if($collect){
                $this->right = false;
            }

            //获取公司信息
            $companyid = (int)$postDetail['company'];
            $sql = $dsql::SetQuery("select `title`,`nature`,`userid`,`scale`,`logo`,`famous`,`industry`,`people`,`people_pic`,`people_job`,`welfare`,`delivery_limit_certifyState`,`delivery_limit_phoneCheck` from `#@__job_company` where `id`=".$companyid);
            $companyArr = $dsql->getArr($sql);
            if($companyArr){
                $companyArr['id'] = $companyid;
                $companyArr['nature'] = (int)$companyArr['nature'];
                $companyArr['scale'] = (int)$companyArr['scale'];
                $companyArr['industry'] = (int)$companyArr['industry'];
                $companyArr['famous'] = (int)$companyArr['famous'];
                $companyArr['delivery_limit_certifyState'] = (int)$companyArr['delivery_limit_certifyState'];
                $companyArr['delivery_limit_phoneCheck'] = (int)$companyArr['delivery_limit_phoneCheck'];
                $companyArr['logo'] = getFilePath($companyArr['logo']);
                $companyArr['people_pic'] = getFilePath($companyArr['people_pic']);
                $companyArr['industry_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".$companyArr['industry']));
                $companyArr['nature_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$companyArr['nature']));
                $companyArr['scale_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$companyArr['scale']));
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'company',
                    'id'=>$companyid
                );
                $companyArr['url'] = getUrlPath($urlParam);
                //获取企业最后登录信息
                $company_uid = (int)$companyArr['userid'];
                $sql = $dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`={$company_uid} order by `id` desc limit 1");
                $loginTime = (int)$dsql->getOne($sql);
                $loginDate = date("Y-m-d",$loginTime); //最后登录的那天
                $currentDate = date("Y-m-d");
                $login = 3;  //假设未登录
                if(abs($loginTime - time()) < 300){ //300秒，5分钟内
                    $login = 1;  //5分钟内登录
                }elseif($loginDate==$currentDate){
                    $login = 2;  //今日登录了
                }
                $companyArr['loginState'] = $login;
                if ($companyArr['welfare']) {
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ({$companyArr['welfare']})");
                    $res = $dsql->getArrList($archives);
                    if($res){
                        $res = array_column($res,"typename");
                    }
                    $res = $res ? $res : array();
                    $companyArr['welfareNames'] = $res;
                    //福利名称和图标
                    $archives = $dsql->SetQuery("SELECT `typename` 'name', `icon` FROM `#@__jobitem` WHERE `id` in ({$companyArr['welfare']})");
                    $res = $dsql->getArrList($archives);
                    $newWfIcon = array();
                    foreach ($res as $wfName){
                        $newWfIconItem = array("title"=>$wfName['name'], "name"=>$wfName['name']);

                        //自定义图标
                        if($wfName['icon']){
                            $newWfIconItem['icon'] = getFilePath($wfName['icon']);
                        }
                        //默认图标
                        else{
                            $pyWf = GetPinyin($wfName['name']);
                            if(file_exists(HUONIAOROOT."/static/images/job/welfare_icon/".$pyWf.".png")){
                                $newWfIconItem['icon'] = getFilePath("/static/images/job/welfare_icon/".$pyWf.".png");
                            }else{
                                $newWfIconItem['icon'] = getFilePath("/static/images/job/welfare_icon/moren.png");
                            }
                        }
                        
                        $newWfIcon[] = $newWfIconItem;
                    }
                    $companyArr['welfareNameIcons'] = $newWfIcon;
                } else {
                    $companyArr['welfareNames'] = array();
                    $companyArr['welfareNameIcons'] = array();
                }
                $welfare = $companyArr['welfare'] ?: "";
                $companyArr['welfare'] = json_decode('[' . $welfare . ']', true);
            }

            $postDetail['companyDetail'] = $companyArr;

            //商家后台的投递列表，额外处理
            if($current_store){
                //统计投递量
                $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `id`=".$item['id']);
                $postDetail['td'] = (int)$dsql->getOne($sql);
                //统计被收藏量
                $sql = $dsql->SetQuery("SELECT count(*) FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'job' AND `aid` =".$item['id']);
                $postDetail['collected'] = (int)$dsql->getOne($sql);
                //是否智能刷新？【商家逻辑不同】
                $sql = $dsql::SetQuery("select `id` from `#@__job_refresh_record` where `type`=2 and `cid`=$cid and FIND_IN_SET({$item['id']},`posts`) and `less`<`refresh_count` limit 1");
                $is_refreshing = (int)$dsql->getOne($sql);
                if($is_refreshing){
                    $postDetail['is_refreshing'] = 1;
                    $postDetail['refreshDetail'] = $this->getSmartyRefresh($postDetail['id']) ?: (object)array();
                }else{
                    $postDetail['refreshDetail'] = (object)[];
                }
                //是否置顶？【商家逻辑不同】
                $sql = $dsql::SetQuery("select `id` from `#@__job_top_recode` where `cid`=$cid and `pid`={$item['id']} and `is_end`=0 limit 1");
                $is_topping = $dsql->getOne($sql);
                if($is_topping){
                    $postDetail['is_topping'] = 1;
                    $postDetail['toppingDetail'] = $this->getTopDetail($postDetail['id']) ?: (object)array();
                }else{
                    $postDetail['toppingDetail'] = (object)[];
                }
            }
            $list[$k] = $postDetail;
        }

        //如果指定了需要调用某个职位
        if($state == '1,3' && $pid && !$hasPid){

            $this->param = array('id'=>$pid,'store'=>$current_store);
            $this->right = true;
            $postDetail = $this->postDetail();

            //获取公司信息
            $companyid = (int)$postDetail['company'];
            $sql = $dsql::SetQuery("select `title`,`nature`,`userid`,`scale`,`logo`,`famous`,`industry`,`people`,`people_pic`,`people_job`,`welfare`,`delivery_limit_certifyState`,`delivery_limit_phoneCheck` from `#@__job_company` where `id`=".$companyid);
            $companyArr = $dsql->getArr($sql);
            if($companyArr){
                $companyArr['id'] = $companyid;
                $companyArr['nature'] = (int)$companyArr['nature'];
                $companyArr['scale'] = (int)$companyArr['scale'];
                $companyArr['industry'] = (int)$companyArr['industry'];
                $companyArr['famous'] = (int)$companyArr['famous'];
                $companyArr['delivery_limit_certifyState'] = (int)$companyArr['delivery_limit_certifyState'];
                $companyArr['delivery_limit_phoneCheck'] = (int)$companyArr['delivery_limit_phoneCheck'];
                $companyArr['logo'] = getFilePath($companyArr['logo']);
                $companyArr['people_pic'] = getFilePath($companyArr['people_pic']);
                $companyArr['industry_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__job_industry` where `id`=".$companyArr['industry']));
                $companyArr['nature_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$companyArr['nature']));
                $companyArr['scale_name'] = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$companyArr['scale']));
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'company',
                    'id'=>$companyid
                );
                $companyArr['url'] = getUrlPath($urlParam);
                //获取企业最后登录信息
                $company_uid = (int)$companyArr['userid'];
                $sql = $dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`={$company_uid} order by `id` desc limit 1");
                $loginTime = (int)$dsql->getOne($sql);
                $loginDate = date("Y-m-d",$loginTime); //最后登录的那天
                $currentDate = date("Y-m-d");
                $login = 3;  //假设未登录
                if(abs($loginTime - time()) < 300){ //300秒，5分钟内
                    $login = 1;  //5分钟内登录
                }elseif($loginDate==$currentDate){
                    $login = 2;  //今日登录了
                }
                $companyArr['loginState'] = $login;
                if ($companyArr['welfare']) {
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ({$companyArr['welfare']})");
                    $res = $dsql->getArrList($archives);
                    if($res){
                        $res = array_column($res,"typename");
                    }
                    $res = $res ? $res : array();
                    $companyArr['welfareNames'] = $res;
                    //福利名称和图标
                    $archives = $dsql->SetQuery("SELECT `typename` 'name', `icon` FROM `#@__jobitem` WHERE `id` in ({$companyArr['welfare']})");
                    $res = $dsql->getArrList($archives);
                    $newWfIcon = array();
                    foreach ($res as $wfName){
                        $newWfIconItem = array("title"=>$wfName['name'], "name"=>$wfName['name']);

                        //自定义图标
                        if($wfName['icon']){
                            $newWfIconItem['icon'] = getFilePath($wfName['icon']);
                        }
                        //默认图标
                        else{
                            $pyWf = GetPinyin($wfName['name']);
                            if(file_exists(HUONIAOROOT."/static/images/job/welfare_icon/".$pyWf.".png")){
                                $newWfIconItem['icon'] = getFilePath("/static/images/job/welfare_icon/".$pyWf.".png");
                            }else{
                                $newWfIconItem['icon'] = getFilePath("/static/images/job/welfare_icon/moren.png");
                            }
                        }
                        
                        $newWfIcon[] = $newWfIconItem;
                    }
                    $companyArr['welfareNameIcons'] = $newWfIcon;
                } else {
                    $companyArr['welfareNames'] = array();
                    $companyArr['welfareNameIcons'] = array();
                }
                $welfare = $companyArr['welfare'] ?: "";
                $companyArr['welfare'] = json_decode('[' . $welfare . ']', true);
            }

            $postDetail['companyDetail'] = $companyArr;

            //商家后台的投递列表，额外处理
            if($current_store){
                //统计投递量
                $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `id`=".$item['id']);
                $postDetail['td'] = (int)$dsql->getOne($sql);
                //统计被收藏量
                $sql = $dsql->SetQuery("SELECT count(*) FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'job' AND `aid` =".$item['id']);
                $postDetail['collected'] = (int)$dsql->getOne($sql);
                //是否智能刷新？【商家逻辑不同】
                $sql = $dsql::SetQuery("select `id` from `#@__job_refresh_record` where `type`=2 and `cid`=$cid and FIND_IN_SET({$item['id']},`posts`) and `less`<`refresh_count` limit 1");
                $is_refreshing = (int)$dsql->getOne($sql);
                if($is_refreshing){
                    $postDetail['is_refreshing'] = 1;
                    $postDetail['refreshDetail'] = $this->getSmartyRefresh($postDetail['id']) ?: (object)array();
                }else{
                    $postDetail['refreshDetail'] = (object)[];
                }
                //是否置顶？【商家逻辑不同】
                $sql = $dsql::SetQuery("select `id` from `#@__job_top_recode` where `cid`=$cid and `pid`={$item['id']} and `is_end`=0 limit 1");
                $is_topping = $dsql->getOne($sql);
                if($is_topping){
                    $postDetail['is_topping'] = 1;
                    $postDetail['toppingDetail'] = $this->getTopDetail($postDetail['id']) ?: (object)array();
                }else{
                    $postDetail['toppingDetail'] = (object)[];
                }
            }

            array_push($list, $postDetail);
        }

        $pageObj['list'] = $list;

        return $pageObj;
    }


    /**
     * 职位详情（复杂版）
     */
    public function postDetailAll(){
        $param = $this->param;
        if(is_numeric($param)){
            $id = (int)$param;
        }else{
            $id = (int)$param['id'];
        }

        //先获取基础信息
        $result = $this->postDetail();
        //如果错误
        if($result['state']==200){
            return $result;
        }
        //职位的公司信息
        $this->param = array("id"=>$result['company']);
        $result['companyDetail'] = $this->companyDetail(1);

        //企业是审核中状态时，职位如果是正常状态，也需要强制显示为审核中
        if($result['companyDetail']['state'] == 0 && $result['state'] == 1){
            $result['state'] = 0;
        }

        global $userLogin;
        global $dsql;
        global $params;
        $uid = $userLogin->getMemberID();
        
        if($uid >0 && $uid!=$result['companyDetail']['userid'] && ($_GET['action'] == 'postDetailAll' || (!isMobile() && $params['template'] == 'job'))) {
            $sql = $dsql::SetQuery("update `#@__job_post` set `click`=`click`+1 where `id`= $id");
            $dsql->update($sql);

            $uphistoryarr = array(
                'module'    => 'job',
                'uid'       => $uid,
                'aid'       => $id,
                'fuid'      => $result['companyDetail']['userid'],
                'module2'   => 'postDetail',
            );
            /*更新浏览足迹表   */
            updateHistoryClick($uphistoryarr);
        }

        return $result;
    }



    /**
     * 职位详情（默认前台查询，必须已审核，如果为商家查询必须登录）（基础版）
     */
    public function postDetail()
    {
        global $userLogin;
        global $dsql;
        $adminId = $userLogin->getUserID();
        if($adminId>0){
            $this->right = true;
        }
        $param = $this->param;
        if(is_numeric($param)){
            $id = (int)$param;
            $param = array();
        }else{
            $id = (int)$param['id'];
        }
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }

        $platform_name = $param['platform_name'];

        $time = strtotime(date("Y-m-d"));

        $where = "";

        $store = $param['store'];   // 商家查询

        $archives = $dsql->SetQuery("SELECT * FROM `#@__job_post` WHERE `id` = " . $id . $where);
         $postDetail  = $dsql->getArr($archives);
        if(!$postDetail || !is_array($postDetail)){
            return array("state"=>200,"info"=>"数据不存在");
        }

        $douyin = (int)$postDetail['douyin'];
        if($platform_name == 'dy_miniprogram' && $douyin == 0){
            return array("state"=>200,"info"=>"该职位未开通在抖音端展示！");
        }

        //职位类别
        $postDetail["typeid"] = (int)$postDetail["type"];
        global $data;
        $data = "";
        $addrName = getParentArr("job_type", $postDetail['typeid']);
        $addrid = array_reverse(parent_foreach($addrName, "id"));
        global $data;
        $data = "";
        $typeNames = array_reverse(parent_foreach($addrName, "typename"));
        if(empty($addrid)){
            $addrid = array();
        }
        foreach ($addrid as $addrid_k => $addrid_i){
            $addrid[$addrid_k] = (int)$addrid_i;
        }
        $postDetail['typeid_list'] = $addrid;
        $postDetail['typename_list'] = $typeNames;
        $postDetail["typeid"] = (int)$postDetail["type"];
        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__job_type` WHERE `id` = " . $postDetail["typeid"]);
        $postDetail['type'] = $dsql->getOne($archives) ?: "";

        $postDetail["id"] = (int)$postDetail["id"];
        $postDetail["url"] = getUrlPath(array(
            'service'=>'job',
            'template'=>'job',
            'id'=>$postDetail["id"]
        ));
        $postDetail["cityid"] = (int)$postDetail["cityid"];
        $postDetail["company"] = (int)$postDetail["company"];
        $postDetail["valid"] = (int)$postDetail["valid"];
        $postDetail["long_valid"] = (int)$postDetail["long_valid"];
        $postDetail["number"] = (int)$postDetail["number"];
        $postDetail["job_addr"] = (int)$postDetail["job_addr"];
        $this->param = array("method"=>"query","id"=>$postDetail["job_addr"]);
        $job_addr_detail = $this->op_address();
        if($job_addr_detail['state']==200){
            $job_addr_detail = array();
        }
        $postDetail["job_addr_detail"] = $job_addr_detail[0];
        $postDetail["click"] = (int)$postDetail["click"];
        $postDetail["state"] = (int)$postDetail["state"];
        $postDetail["weight"] = (int)$postDetail["weight"];
        $postDetail["del"] = (int)$postDetail["del"];
        $postDetail["pubdate"] = (int)$postDetail["pubdate"];
        $postDetail["update_time"] = (int)$postDetail["update_time"];
        $postDetail["min_age"] = (int)$postDetail["min_age"];
        $postDetail["max_age"] = (int)$postDetail["max_age"];
        $postDetail["dy_salary"] = (int)$postDetail["dy_salary"];
        $postDetail["min_salary"] = (float)$postDetail["min_salary"];
        $postDetail["max_salary"] = (float)$postDetail["max_salary"];
        $postDetail["salary_type"] = (float)$postDetail["salary_type"];
        $min_salary = $postDetail['min_salary'];
        $max_salary = $postDetail['max_salary'];
        $postDetail['show_salary'] = salaryFormat($postDetail['salary_type'], $min_salary, $max_salary, $postDetail['mianyi']);
        $postDetail["mianyi"] = (float)$postDetail["mianyi"];
        $postDetail["off"] = (int)$postDetail["off"];
        $postDetail["offdate"] = (int)$postDetail["offdate"];

        //工作经验
        $postDetail["experienceid"] = (int)$postDetail['experience'];
        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $postDetail["experience"]);
        $postDetail['experience'] = $dsql->getOne($archives) ?: "";
        $testExperience = $this->testExperience($postDetail['experience']);
        if($testExperience['type']!="fail"){
            $postDetail['experience'] = $testExperience['text'];
        }

        //性质
        $postDetail["natureid"] = (int)$postDetail['nature'];
        $archives = $dsql->SetQuery("select `zh` from `#@__job_int_static_dict` where `name`='jobNature' and `value`=" . $postDetail["natureid"]);
        $postDetail["nature"] = $dsql->getOne($archives) ?: "";

        $postDetail["educationalid"] = (int)$postDetail["educational"];
        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $postDetail["educationalid"]);
        $postDetail["educational"] = $dsql->getOne($archives) ?: "学历不限";

        $postDetail['postTime'] = FloorTime(time() - $postDetail['pubdate']);
        //职位标签
        $tag = array();
        if($postDetail['tag']){
            $tag = explode("||",$postDetail['tag']);
        }
        $postDetail['tag'] = $tag;

        $param = array(
            "service" => "job",
            "template" => "job",
            "id" => $id
        );
        $postDetail["url"] = getUrlPath($param);

        //验证是否已经收藏
        $params = array(
            "module" => "job",
            "temp" => "job",
            "type" => "add",
            "id" => $id,
            "check" => 1
        );
        $collect = checkIsCollect($params);
        $postDetail['collect'] = $collect == "has" ? 1 : 0;

        $postDetail['is_topping'] = (int)$postDetail["is_topping"];  // 正在置顶
        $postDetail['is_refreshing'] = (int)$postDetail["is_refreshing"]; // 正在智能刷新

        //前台页面显示时，需要格式化换行，修改职位时，不需要格式化
        //程序不做格式化，由前端处理
        // if(!$_GET['store']){
        //     $postDetail['claim'] = nl2br($postDetail['claim']);
        //     $postDetail['note'] = nl2br($postDetail['note']);
        // }

        $uid = $this->getUid();
        if(!is_array($uid)){
            $uid = (int)$uid;
            
            //检测投递状态
            $sql = $dsql::SetQuery("select `id` from `#@__job_delivery` where `del` = 0 and `pid`=$id and `userid`=$uid");
            $has_delivery = $dsql->getOne($sql);
            $postDetail['has_delivery'] = $has_delivery ? 1 : 0;
            //检测用户是否投递过这个公司
            $sql = $dsql::SetQuery("select `date` from `#@__job_delivery` where `del` = 0 and `cid`={$postDetail["company"]} and `userid`=$uid");
            $has_delivery_company = $dsql->getOne($sql);
            // $postDetail['has_delivery_company'] = $has_delivery_company ? 1 : 0;
            //近期不允许再次投递该公司
            if($has_delivery_company){
                //获取该公司的投递限制
                $sql = $dsql::SetQuery("select `delivery_limit_interval` from `#@__job_company` where `id`={$postDetail['company']}");
                $delivery_limit_time = (int)$dsql->getOne($sql);  //投递间隔几个月
                if((time() - $has_delivery_company) < (86400 * 30 * $delivery_limit_time) && $delivery_limit_time > 0){  //最后投递距离当前时间，小于限制时间，不可投递
                    $postDetail['current_delivery_company_limit'] = 1;
                }else{
                    $postDetail['current_delivery_company_limit'] = 0;
                }
            }else{
                $postDetail['current_delivery_company_limit'] = 0;
            }
            $postDetail['has_delivery_company'] = $postDetail['current_delivery_company_limit'];
            //判断简历数量
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=$uid and `del`=0");
            $resumeCount = (int)$dsql->getOne($sql);
            //如果多简历后第一次投递
            if($resumeCount>1){
                //判断是否多简历后第一次投递
                $multiResumeFirstDelivery = $this->get_u_common($uid,"multiResumeFirstDelivery");
                if(empty($multiResumeFirstDelivery)){
                    $postDetail['delivery_tip_f7'] = 1;
                }
            }
            //最近7天未投递
            if($postDetail['delivery_tip_f7']==0){
                $sql = $dsql::SetQuery("select `pubdate` from `#@__job_resume` where `userid`=$uid and `del`=0 order by `id` desc limit 1");
                $lastResumePubdate = $dsql->getOne($sql);
                if($lastResumePubdate < time()-7*86400){
                    $postDetail['delivery_tip_f7'] = 1;
                }
            }
            $postDetail['delivery_tip_f7'] = $postDetail['delivery_tip_f7'] ? 1 : 0;
            //投递职位是否匹配
            $resumeExpectJob = $this->get_u_common($uid,"resume.job");
            if($resumeExpectJob){
                $resumeExpectJob = explode(",",$resumeExpectJob);
                if(!in_array($postDetail["typeid"],$resumeExpectJob)){
                    $postDetail['delivery_tip_noMatch'] = 1;
                }
            }
            $postDetail['delivery_tip_noMatch'] = $postDetail['delivery_tip_noMatch'] ? 1 : 0;
            //简历份数，默认简历id和标题
            $postDetail['resumeCount'] = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=$uid and `del`=0"));
            $defaultResumeDetail = $dsql->getArr($dsql::SetQuery("select `id`,`alias` from `#@__job_resume` where `userid`=$uid and `default`=1 and `del`=0"));
            $postDetail['resumeDefaultId'] = (int)$defaultResumeDetail['id'];
            $postDetail['resumeDefaultName'] = $defaultResumeDetail['alias'];
        }else{
            $postDetail['has_delivery'] = 0;
            $postDetail['has_delivery_company'] = 0;
            $postDetail['current_delivery_company_limit'] = 0;
            $postDetail['delivery_tip_f7'] = 0;     // 多简历第一次投递，或7天未投递
            $postDetail['delivery_tip_noMatch'] = 0;  // 期望职位不匹配提示
            $postDetail['resumeCount'] = 0;
            $postDetail['resumeDefaultId'] = 0;
            $postDetail['resumeDefaultName'] = '';
        }
        $postDetail['pubCalc'] = (int)((time()-$postDetail['pubdate']) / 86400);  //发布时间距离今天多少天
        $postDetail['updateCalc'] = (int)((time()-$postDetail['update_time']) / 86400);  //更新时间距离今天多少天

        //如果没有权限，默认不可以查看已删除数据
        if(!$this->right && $postDetail['del']==1){
            return array("state"=>200,"info"=>"数据不存在");
        }

        //如果不是超级权限，针对不同条件的限制
        if(!$this->right){
            //如果是后台获取
            if($store){
                //判断公司状态是否正常
                $company = $this->getCidCheck();
                if(is_array($company)){
                    return $company;
                }
                //判断该数据，是否属于该公司
                if($company!=$postDetail['company']){
                    return array("state"=>200,"info"=>"数据不存在");
                }
            }
            //前台获取，必须是审核通过，并且有效期内
            else{

                //公司详情
                $this->param = array("id"=>$postDetail['company']);
                $companyDetail = $this->companyDetail(1);
                
                //如果状态不是1， 或者已经过了有效期，则失败
                if($postDetail['state']!=1 && $companyDetail['userid'] != $uid){
                    return array("state"=>200,"info"=>"数据不存在");
                }
            }
        }
        if($adminId>0){
            $this->right = false;
        }
        return $postDetail;
    }


    /**
     * 职位：批量刷新（普通刷新）（不生成订单）
     */
    public function jobRefresh(){
        global $dsql;
        global $userLogin;

        $cid = $this->getCidCheck();
        $uid = $this->getUid();
        if(is_array($cid)){
            return $cid;
        }
        $param = $this->param;
        $id = $param['id'];
        $all = $param['all'];
        //为 all 时，刷新全部正在招聘中的职位
        if($all==1){
            $sql = $dsql::SetQuery("select `id` from `#@__job_post` where `company`=$cid and `del`=0 and `off`=0 and `state`=1 order by `pubdate` desc");
            $ids = $dsql->getArr($sql);
            $id = join(",",$ids);
        }
        //其他情况为传递pid列表
        else{
            if(empty($id)){
                return array("state"=>200,"info"=>"缺少参数：id");
            }
            $ids = explode(",",$id);
        }

        //预计要刷新的职位个数
        $post_count = count($ids);
        //剩余的职位刷新个数
        $this->param = array();
        $this->param['id'] = $cid;
        $company = $this->companyDetail();
        $refresh = $company['can_job_refresh']+$company['package_refresh'];  //当前可用总刷新次数（今日套餐剩余 + 增值包）
        if(!$refresh){
            return array("state"=>200,"info"=>"刷新次数可用为0，刷新失败");
        }
        //每个职位消耗一次刷新次数，则刷新次数可能不足，取最大可刷新次数
        $cur_refresh = $post_count > $refresh ? $refresh : $post_count;

        //如果套餐内可用刷新次数足够，则先扣除套餐资源，其余资源从增值包里扣除
        $package_use = $combo_use = 0;
        //套餐够用
        if($company['can_job_refresh']>=$cur_refresh){
            $combo_use = $cur_refresh;
        }
        //套餐不够用
        else{
            $combo_use = $company['can_job_refresh']; // 套餐全用
            $package_use = $cur_refresh - $combo_use; // 增值包用量为总数-套餐数
        }
        //查询出所有的 id 列表对应的职位，并按时间倒序排序，取得前 n 个职位
        $sql = $dsql::SetQuery("select * from `#@__job_post` where `id` in ($id) and `company`=$cid order by `pubdate` desc limit $cur_refresh");
        $postList = $dsql->getArrList($sql);
        //判断下职位是否有效
        if(empty($postList)){
            return array("state"=>200,"info"=>"参数错误，均为无效职位");
        }
        //开始循环刷新
        $success_id = array_column($postList,"id");
        $time = time();
        foreach ($postList as $item){
            //更新职位的刷新信息，普通刷新就仅仅是把 update_time 时间改为当前时间、智能刷新，是多次的，但是扣费是第下单时计算的
            $sql = $dsql::SetQuery("update `#@__job_post` set `update_time`=$time where `id`=".$item['id']);
            $dsql->update($sql);

            //插入到刷新记录表
            $sql = $dsql::SetQuery("insert into `#@__job_refresh_log`(`cid`,`pid`,`type`,`pubdate`) values($cid,{$item['id']},1,$time)");
            $dsql->update($sql);
        }
        $time = time();
        $ordernum = create_ordernum();
        //info
        $postTitle = $dsql->getOne($dsql::SetQuery("select `title` from `#@__job_post` where `id` in(".join(",",$success_id).") limit 1"));
        $subject = "职位刷新：".$postTitle;
        if(count($postList)>1){
            $subject .= "...等".count($postList)."个职位";
        }
        $paramData = array("service"=>"job","subject"=>$subject);
        $paramData = serialize($paramData);
        $sql = $dsql::SetQuery("insert into `#@__pay_log`(`ordertype`, `ordernum`, `uid`, `amount`, `paytype`, `state`, `pubdate`, `param_data`) values('job','$ordernum',$uid, 0, 'money', 1,$time,'$paramData')");
        $dsql->update($sql);
        $sql = $dsql::SetQuery("insert into `#@__job_order`(`uid`, `type`, `ordernum`, `orderdate`, `aid`, `amount`, `orderstate`, `paydate`, `paytype`) values($uid, 5, '$ordernum', $time, '".join(",",$success_id)."', 0, 1, $time, 'money')");
        $dsql->update($sql);
        //插入到消费表
        $sql = $dsql::SetQuery("insert into `#@__job_refresh_record`(`refresh_count`,`use_combo`,`use_package`,`pubdate`,`cid`,`posts`,`ordernum`) values($cur_refresh,$combo_use,$package_use,$time,$cid,'".join(",",$success_id)."','$ordernum')");
        $dsql->update($sql);
        //一次性扣除增值包资源
        $sql = $dsql::SetQuery("update `#@__job_company` set `package_refresh`=`package_refresh`-$package_use where `id`=$cid");
        $dsql->update($sql);
        clearCache("job_company_detail", $cid);
        //批量刷新，但成功一部分的响应（响应是一个array，返回成功的数量，返回失败的id列表）
        if($post_count!=$cur_refresh){
            $fail_ids = array();
            foreach ($ids as $aid){
                if(!in_array($aid,$success_id)){
                    $fail_ids[] = $aid;
                }
            }
            $fail_ids = join(",",$fail_ids);
            return array("state"=>100,"info"=>array("success"=>$cur_refresh,"success_ids"=>join(",",$success_id),"fail_ids"=>$fail_ids));
        }
        //全部成功的响应（info 是一个字符串）
        else{
            return "全部刷新成功";
        }
    }


    /**
     * 批量删除职位（软删除）
     */
    public function delPost()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid < 0) {
            return array("state" => 200, "info" => "请先登录");
        }
        //校验公司信息
        $sql = $dsql::SetQuery("select `id`,`state` from `#@__job_company` where userid=$userid");
        $storeArr = $dsql->getArr($sql);
        if (empty($storeArr)) {
            return array("state" => 200, "info" => "还未开通招聘公司");
        }
        $company = $storeArr['id'];
        //参数处理
        $param = $this->param;
        $id = $param['id'];
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少参数：id");
        }

        $id = explode(",",$id);

        //遍历删除
        foreach ($id as $key => $value){
            $sql = $dsql::SetQuery("update `#@__job_post` set `del`=1 where id=$value and company = $company");
            $dsql->update($sql);
        }

        return "操作成功";
    }


    /**
     * 新增(add)、编辑(edit) 职位
     */
    public function aePost()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        //登录校验
        if ($userid < 0) {
            return array("state" => 200, "info" => "请先登录");
        }
        //校验公司信息
        $sql = $dsql::SetQuery("select `id`,`state` from `#@__job_company` where userid=$userid");
        $storeArr = $dsql->getArr($sql);
        if (empty($storeArr)) {
            return array("state" => 200, "info" => "还未开通招聘公司");
        }
        //参数处理
        $param = $this->param;
        $id = (int)$param['id'];  // 职位id
        $cityid = (int)$param['cityid']; // 城市id
        if(empty($cityid)){
            // return array("state"=>200,"info"=>"请传递cityid");
        }
        $company = $storeArr['id'];  // 公司id
        $companyState = (int)$storeArr['state'];  //公司状态
        $type = (int)$param['type']; //职位类别
        if (empty($type)) {
            return array("state" => 200, "info" => '请选择职位类别');
        }
        $title = filterSensitiveWords(addslashes($param['title'])); //职位名称
        if (empty($title)) {
            return array("state" => 200, "info" => "请输入职位名称");
        }
        $number = (int)$param['number'];  // 招聘人数
        if (empty($number)) {
            return array("state" => 200, "info" => "请输入招聘人数");
        }
        //薪资
        $min_salary = (float)$param['min_salary'];
        $max_salary = (float)$param['max_salary'];
        $dy_salary = (int)$param['dy_salary'];
        if($dy_salary<12){ //默认值是12
            $dy_salary = 12;
        }
        $mianyi = (int)$param['mianyi'];  //工资面议

        $nature = (int)$param['nature'];  //职位性质
        if (empty($nature)) {
            return array("state" => 200, "info" => "请选择职位性质");
        }
        //有效期
        $valid = (int)$param['valid'];
        $long_valid = (int)$param['long_valid'];

        $educational = (int)$param['educational']; // jobitem
        if (empty($educational)) {
//            return array("state" => 200, "info" => "请选择学历要求");
        }
        $experience = (int)$param['experience'];  // jobitem
        if (empty($experience)) {
//            return array("state" => 200, "info" => "请选择工作经验");
        }
        $note = filterSensitiveWords(addslashes($param['note']));
        if (empty($note)) {
            return array("state" => 200, "info" => "请填写职位描述");
        }
        $salary_type = $param['salary_type'];
        if(empty($salary_type)){
            return array("state"=>200,"info"=>"请选择薪资类型");
        }
        $claim = filterSensitiveWords(addslashes($param['claim']));
        if (empty($claim)) {
            // return array("state" => 200, "info" => "请填写任职要求");
        }
        $min_age = (int)$param['min_age']; //最低年龄限制
        $max_age = (int)$param['max_age']; //最高年龄限制
        $tag = $param['tag'];
        if($tag && is_array($tag)){
            $tag = array_slice($tag, 0 , 3);
            $tag = join("||",$tag);
        }
        $job_addr = (int)$param['job_addr_id'];
        $update_time = time();

        //根据区域ID获取城市ID
        $sql = $dsql->SetQuery("SELECT `cityid`, `addrid` FROM `#@__job_address` WHERE `id` = $job_addr AND `company` = $company");
        $ret = $dsql->getArr($sql);
        if($ret){
            $cityid = $ret['cityid'];
            $addrid = $ret['addrid'];

            //判断addrid所在区域是否开通分站
            if(!$cityid){
                $cityid = getCityidByAddrid($addrid);
            }
        }else{
            return array("state" => 200, "info" => "工作地址不存在，请重新添加！");
        }
        if(!$cityid){
            return array("state" => 200, "info" => "工作地址不在服务范围，请重新选择或联系客服开通！");
        }

        //发布职位审核状态
        include(HUONIAOINC . "/config/job.inc.php");
        $state = (int)$customagentCheck; // 是否需要审核?

        //新增
        if (empty($id)) {

            //发布职位，是否自动上架？（如果套餐内可上架数量充足，则可上架，否则默认为：下架状态）
            $off = 1;
            $this->param = array();
            $companyDetail = $this->companyDetail();
            if(($companyDetail['canJobs']>0 || $companyDetail['canJobs']==-1)){
                $off = 0;
            }
            if($companyState != 1){
                $state = 0;
            }
            $sql = $dsql::SetQuery("insert into `#@__job_post`(`cityid`,`title`,`type`,`company`,`nature`,`valid`,`long_valid`,`number`,`job_addr`,`experience`,`educational`,`min_salary`,`max_salary`,`dy_salary`,`mianyi`,`note`,`claim`,`tag`,`state`,`pubdate`,`update_time`,`off`,`min_age`,`max_age`,`salary_type`) values($cityid,'$title',$type, $company,$nature,$valid,$long_valid,$number,$job_addr,$experience,$educational,$min_salary,$max_salary,$dy_salary,$mianyi,'$note','$claim','$tag',$state,$update_time,$update_time,$off,$min_age,$max_age,$salary_type)");

            $aid = $dsql->dsqlOper($sql, "lastid");

            if (is_numeric($aid)) {
                $this->countCurrentJobs($company);
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'job',
                    'id'=>$aid
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'job', $aid, 'insert', '新增职位('.$title.')', $url, $sql);
                return array("state" => 100, "info" => (int)$aid,"aid"=>(int)$aid);
            } else {
                return array("state" => 200, "info" => "发布失败，请校验字段");
            }
        } //修改
        else {
            $shagnjia = $param['shangjia'];
            $off_append = "";
            if($shagnjia==1){
                $off_append = ",`off`=0";
            }
            $sql = $dsql::SetQuery("update `#@__job_post` set `cityid`=$cityid,`title`='$title',`type`=$type,`company`=$company,`nature`=$nature,`valid`=$valid,`long_valid`=$long_valid,`number`=$number,`job_addr`=$job_addr,`experience`=$experience,`educational`=$educational,`min_salary`=$min_salary,`max_salary`=$max_salary,`dy_salary`=$dy_salary,`mianyi`=$mianyi,`note`='$note',`claim`='$claim',`tag`='$tag',`min_age`=$min_age,`max_age`=$max_age,`update_time`=$update_time,`salary_type`=$salary_type,`state`=$state".$off_append." where `id`=$id and `del`=0 and `company`=$company");
            $res = $dsql->update($sql);
            if ($res == "ok") {
                $this->countCurrentJobs($company);
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'job',
                    'id'=>$id
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'job', $id, 'update', '更新职位('.$title.')', $url, $sql);
                return array("state" => 100, "info" => "更新成功","aid"=>$id);
            } else {
                return array("state" => 200, "info" => "更新失败，请校验字段");
            }
        }
    }

    /**
     * 计算7天内，发布/更新的职位【已上架】
     * @param $cid
     */
    private function countCurrentJobs($cid){
        global $dsql;
        $time = time() - 7*86400;
        $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`=$cid and `del`=0 and `off`=0 and `update_time`>$time");
        $count = $dsql->getOne($sql);
        $sql = $dsql::SetQuery("update `#@__job_company` set `ae_jobs_count`=$count where `id`=$cid");
        $res =  $dsql->update($sql);
        return $res;
    }



    /**
     * 面试/工作地址
     */
    public function op_address(array $cusParam=array())
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        $param = $this->param;
        if(!empty($cusParam)){
            $param = $cusParam;
        }
        global $dsql;
        $method = $param['method'];  // query、add、all、update、del、countJobUsed、setDefault、default
        $lng = $param['lng'];  // 经度
        $lat = $param['lat'];  // 纬度
        $company_addr = $param['company_addr'] ?? 0;  //获取所有地址时，携带公司地址
        $setCompany = $param['setCompany'] ?? 0;  //新增、修改地址时，同时设置为公司地址
        //id校验
        if($method != "delete"){
            $id = (int)$param['id'];
        }else{
            $id = $param['id'];
            $id = explode(",",$id);
            array_filter($id);
            array_filter($id,"is_numeric");
            $id = join(",",$id);
        }
        if ($method == "update" || $method == "delete" || $method == "query" || $method == "setDefault") {
            if (empty($id)) {
                return array("state" => 200, "info" => "缺少参数：id");
            }
        }
        //商家登录校验（已知 query 不需要登录）
        if ($method == "add" || $method == "update" || $method == "delete" || $method == "all" || $method == "setDefault" || $method == "default") {
            $company = $this->getCid();
            if(is_array($company)){
                return $company;
            }
            // 校验指定id地址拥有者（必须传递id，再校验该 id 的 company 和当前登录的 company 对比）
            if($method=="update" || $method == "delete" || $method == "setDefault"){

                if($method!="delete"){
                    $sql = $dsql::SetQuery("select `id` from `#@__job_address` where `company`=$company AND `id`=$id");
                    $one = $dsql->getOne($sql);
                    if (!is_numeric($one)) {
                        return array("state" => 200, "info" => "非法用户操作");
                    }
                }else{
                    $sql = $dsql::SetQuery("select `id` from `#@__job_address` where `company`=$company AND `id` in ($id)");
                    $realids = $dsql->getArr($sql);
                    if(empty($realids)){
                        return array("state" => 200, "info" => "非法参数");
                    }else{
                        $id = join(",",$realids);
                    }
                }
            }
        }
        //其他参数
        if ($method == "add" || $method == "update") {
            $cityid = 0;
            $addrid = (int)$param['addrid'];
            if (empty($addrid)) {
                return array("state" => 200, "info" => "缺少参数：addrid");
            }

            //判断addrid所在区域是否开通分站
            $cityid = getCityidByAddrid($addrid);
            if(!$cityid){
                return array("state" => 200, "info" => "选择的区域不在服务范围内，请重新选择或联系客服开通！");
            }

            $address = $param['address'];
            if (empty($address)) {
                return array("state" => 200, "info" => "缺少参数：address");
            }
        }
        //新增（返回插入成功的记录 id ）
        if ($method == "add") {
            //如果是第一条地址，为默认
            $sql = $dsql::SetQuery("select count(*) from `#@__job_address` where `company`=$company and `type`=2");
            $addr_count = (int)$dsql->getOne($sql);
            $default_addr = $addr_count >=1 ? 0 : 1;
            $sql = $dsql::SetQuery("insert into `#@__job_address`(`company`,`addrid`,`address`,`lng`,`lat`,`default`,`type`) values($company,$addrid,'$address','$lng','$lat',$default_addr,2)");
            $aid = $dsql->dsqlOper($sql, "lastid");
            if (is_numeric($aid)) {
                if($setCompany){
                    //该地址的type为1
                    $sql = $dsql::SetQuery("update `#@__job_address` set `type`= case `id` when $aid then 1 else 2 end where `company`=$company");
                    $res = $dsql->update($sql);
                    //更新到company表中
                    $detail = $dsql->getArr($dsql::SetQuery("select `addrid`,`address`,`lng`,`lat` from `#@__job_address` where `id`=$aid"));
                    $dsql->update("update `#@__job_company` set `addrid`={$detail['addrid']},`address`='{$detail['address']}',`lng`='{$detail['lng']}',`lat`='{$detail['lat']}' where `id`=$company");
                }
                return (int)$aid;
            } else {
                return array("state" => 200, "info" => $aid);
            }
        } //更新
        elseif ($method == "update") {
            $sql = $dsql::SetQuery("update `#@__job_address` set `company`=$company,`addrid`=$addrid,`address`='$address',`lng`='$lng',`lat`='$lat' where `id`=$id");
            $res = $dsql->dsqlOper($sql, "update");
            if ($res == "ok") {
                if($setCompany){
                    //该地址的type为1
                    $sql = $dsql::SetQuery("update `#@__job_address` set `type`= case `id` when $id then 1 else 2 end where `company`=$company");
                    $dsql->update($sql);
                }
                $type = (int)$dsql->getOne($dsql::SetQuery("select `type` from `#@__job_address` where `id`=$id"));
                if($type=="1"){
                    $dsql->update($dsql::SetQuery("update `#@__job_company` set `addrid`=$addrid,`address`='$address',`lng`='$lng',`lat`='$lat' where `id`=$company"));
                }
                return "更新成功";
            } else {
                return array("state" => 200, "info" => $res);
            }
        } //删除
        elseif ($method == "del") {
            $sql = $dsql::SetQuery("delete from `#@__job_address` where `id` in($id) and `type`=2"); //公司地址禁止删除
            $res = $dsql->dsqlOper($sql, "update");
            if ($res == "ok") {
                return "删除成功";
            } else {
                return array("state" => 200, "info" => $res);
            }
        } //获取单条、或所有（无需分页）
        elseif ($method == "all" || $method == "query" || $method == "default") {
            if ($method == "all") {
                $sql = $dsql::SetQuery("select * from `#@__job_address` where `company`=$company");
                //默认情况下不返回公司地址
                if(!$company_addr){
                    $sql .= " and `type`=2";
                }
                $sql .= " order by `type` asc";
            } elseif ($method == "query") {
                $sql = $dsql::SetQuery("select * from `#@__job_address` where `id`=$id");
            } elseif ($method == "default"){
                $sql = $dsql::SetQuery("select * from `#@__job_address` where `company`=$company and `default`=1");
            }
            $arrList = $dsql->getArrList($sql);
            //结果校验
            if (!$arrList || !is_array($arrList)) {
                return array("state" => 200, "info" => "暂无相关数据");
            }
            //数据处理
            foreach ($arrList as & $item) {
                $addrName = getParentArr("site_area", $item['addrid']);
                global $data;
                $data = "";
                $item['addrName'] = array_reverse(parent_foreach($addrName, "typename"));
                $item['id'] = (int)$item['id'];
                $item['company'] = (int)$item['company'];
                $item['addrid'] = (int)$item['addrid'];
                $data = "";
                $addrName = getParentArr("site_area", $item['addrid']);
                $addrid = array_reverse(parent_foreach($addrName, "id"));
                if(empty($addrid)){
                    $addrid = array();
                }
                foreach ($addrid as $addrid_k => $addrid_i){
                    $addrid[$addrid_k] = (int)$addrid_i;
                }
                $item['addrid_list'] = $addrid;
                $item['default'] = (int)$item['default'];
                $item['type'] = (int)$item['type'];
                //统计有多少个job使用了本地址
                $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where FIND_IN_SET({$item['id']},job_addr)");
                $item['count_use'] = (int)$dsql->getOne($sql);
            }
            unset($item);
            return $arrList;
        } //统计有多少个job使用了本地址
        elseif ($method == "countJobUsed") {
            $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where FIND_IN_SET($id,job_addr)");
            $one = $dsql->getOne($sql);
            return array("state" => 100, "info" => (int)$one);
        } //设为默认
        elseif ($method == "setDefault") {
            $sql = $dsql::SetQuery("update `#@__job_address` set `default`= case `id` when $id then 1 else 2 end where `company`=$company");
            $res = $dsql->update($sql);
            if ($res == "ok") {
                return "更新成功";
            } else {
                return array("state" => 200, "info" => $res);
            }
        } //非法参数
        else {
            return array("state" => 200, "info" => "method参数错误");
        }
    }


    /**
     * 添加附近搜索地址
     */
    public function companyListHistoryAdd(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $lng = $param['lng'];
        if(empty($lng)){
            return array("state"=>200,"info"=>"缺少经度");
        }
        $lat = $param['lat'];
        if(empty($lat)){
            return array("state"=>200,"info"=>"缺少纬度");
        }
        $address = $param['address'];
        if(empty($address)){
            return array("state"=>200,"info"=>"缺少详细地址");
        }
        //先查询是否存在
        $sql = $dsql::SetQuery("select `id` from `#@__job_seach_history` where `uid`=$uid and `lng`='$lng' and `lat`='$lat'");
        $sh_exist = $dsql->getOne($sql);
        if($sh_exist){
            return array("state"=>200,"info"=>"已存在相同记录");
        }else{
            $time = time();
            $sql = $dsql::SetQuery("insert into `#@__job_seach_history`(`uid`,`lng`,`lat`,`address`,`pubdate`,`type`) values($uid,'$lng','$lat','$address',$time,2)");
            $res = $dsql->update($sql);
            if($res=="ok"){
                return array("state"=>100,"info"=>"添加成功");
            }else{
                return array("state"=>200,"info"=>"添加失败");
            }
        }
    }


    /**
     * 公司搜索历史记录
     */
    public function companyListHistory(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $page = $param['page'] ?? 1;
        $pageSize = $param['pageSize'] ?? 5;
        $sql = $dsql::SetQuery("select * from `#@__job_seach_history` where `uid`=$uid and `address` != '' group by `address` order by `id` desc");
        $pageObj = $dsql->getPage($page,$pageSize,$sql);
        if($pageObj['pageInfo']['totalCount']==0){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        foreach ($pageObj['list'] as & $item){
            $item['id'] = (int)$item['id'];
            $item['uid'] = (int)$item['uid'];
            $item['pubdate'] = (int)$item['pubdate'];
        }
        unset($item);
        return $pageObj;
    }


    /**
     * 公司列表
     */
    public function companyList(){
        global $dsql;

        global $dsql;
        $uid = $this->getUid();

        $param = $this->param;

        $page = $param['page'] ?: 1;
        $pageSize = $param['pageSize'] ?: 20;
        $collect = $param['collect'];
        $collectTime = $param['collectTime'];

        $where = " AND c.`state` = 1";

        //数据共享
        require(HUONIAOINC."/config/job.inc.php");
        $dataShare = (int)$customDataShare;
        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND c.`cityid` = " . $cityid;
            }
        }

        $filterId = $param['filterId'] ?: "";
        if(!empty($filterId)){
            $where .= " AND c.`id` not in({$filterId})";
        }

        $promotion = $param['promotion'] ?? 0;
        if($promotion==1){
            $where .= " AND c.`promotion`=1";
        }

        //获取已收藏
        if($collect){
            if(is_array($uid)){
                return $uid;
            }
            $collectWhere = "";
            if($collectTime==2){
                $collectWhere .= " and `pubdate`>=".(time()-90*86400);
            }
            //查询当前用户收藏商家列表
            $collectsql = $dsql->SetQuery("SELECT `aid` FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'company' AND `userid` = '$uid'".$collectWhere);
            $collectArr = $dsql->getArr($collectsql);
            if($collectArr){
                $where .= " AND c.`id` in(".join(",",$collectArr).")";
            }
            else{
                $where .= " AND 1=2";
            }
        }

        $near = $param['near'];  //查询附近？
        $lng = $param['lng'];
        $lat = $param['lat'];
        $address = $param['address'];
        if($near && $lng && $lat && $address){  //附近10公里
            $where .= " and ROUND(
                6378.138 * 2 * ASIN(
                    SQRT(POW(SIN(($lat * PI() / 180 - c.`lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(c.`lng` * PI() / 180) * POW(SIN(($lng * PI() / 180 - c.`lng` * PI() / 180) / 2), 2))
                ) * 1000
            ) < 100000";

            //记录到历史搜索表中【必须已登录的情况下】
            if(!is_array($uid)){
                $time = time();
                //查询是否已添加过重复记录？
                $sql = $dsql::SetQuery("select `id` from `#@__job_seach_history` where `lng`='$lng' and `lat`='$lat' and `uid`=$uid");
                $sh_exist = $dsql->getOne($sql);
                if(!$sh_exist){ //从未添加过
                    $sql = $dsql::SetQuery("insert into `#@__job_seach_history`(`uid`,`lng`,`lat`,`address`,`pubdate`) values($uid,'$lng','$lat','$address',$time)");
                    $dsql->update($sql);
                }
            }
        }

        //匹配性质
        $nature   = $param['nature'];
        if (!empty($nature)) {
            $where .= " AND c.`nature` in (". $nature .")";
        }

        //匹配规模
        $scale    = $param['scale'];
        if (!empty($scale)) {
            $where .= " AND c.`scale` in (".$scale.")";
        }

        //行业（2级）
        $industry = $param['industry'];
        if (!empty($industry)) {
            // $arr = $dsql->getTypeList($industry, "job_industry");
            $param_ = $this->param;
            $this->param['type'] = $industry;
            $this->param['son'] = 1;
            $arr = $this->industry();
            $this->param = $param_;

            if ($arr) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($arr);
                $lower = $industry . "," . join(',', $lower);
            } else {
                $lower = $industry;
            }
            $where .= " AND c.`industry` in ($lower)";
        }

        //匹配关键字
        $keyword = $param['keyword'];
        if(!empty($keyword)){
            $where .= " AND c.`title` like '%$keyword%'";
        }

        //筛选名企
        $famous = $param['famous'];
        if(!empty($famous)){
            $where .= " AND c.`famous` =1";
        }

        //筛选地区
        $addrid = $param['addrid'];
        if(!empty($addrid)){
            //匹配子级
            if($dsql->getTypeList($addrid, "site_area")){
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));  //该项子id列表
                $lower[] = $addrid;
                $lower = join(",",$lower);
            }else{
                $lower = $addrid;
            }
            $where .= " AND c.`addrid` in ($lower)";
        }

        //只要有职位的
        $pcount = (int)$param['pcount'];
        if($pcount){
            $where .= " and (select count(*) from `#@__job_post` p where p.`company`=c.`id` and p.`state`=1 and p.`del`=0 and p.`off`=0)>=$pcount";
        }

        $orderby = $param['orderby'];
        $orderByWhere = " order by c.`promotion` desc,c.`weight` desc,c.`id` desc";
        if($orderby==2){
            $orderByWhere = " order by c.`ae_jobs_count` desc,c.`promotion` desc,c.`weight` desc,c.`id` desc";
        }
        $sql = $dsql::SetQuery("select c.* from `#@__job_company` c where 1=1".$where);

        $pageObj = $dsql->getPage($page,$pageSize,$sql.$orderByWhere);
        if($pageObj['pageInfo']['totalCount']==0 && !$collect){
            return array("state"=>200,"info"=>"暂无相关数据");
        }


        if($collect){ //收藏时添加头
            $sqls = $dsql::SetQuery("SELECT `aid` FROM `#@__member_collect` WHERE `module` = 'job' AND `action` = 'company' AND `userid` = '$uid'");
            $aids = $dsql->getArr($sqls);
            if($aids){
                $pageObj['pageInfo']['totalCountAll'] = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_company` where `id` in(".join(",",$aids).")"));  //无条件时的收藏
            }else{
                $pageObj['pageInfo']['totalCountAll'] = 0;
            }
            $sqls = $dsql::SetQuery("update `#@__member_collect` set `u_read`=1  where `module` = 'job' AND `action` = 'company' AND `userid` = '$uid' and `u_read`=0");
            $dsql->update($sqls);
        }

        foreach ($pageObj['list'] as & $item){

            $item['id'] = (int)$item['id'];
            $item['cityid'] = (int)$item['cityid'];
            $item['weight'] = (int)$item['weight'];
            $item['changeState'] = (int)$item['changeState'];
            $item['addrid'] = (int)$item['addrid'];
            $item['pubdate'] = (int)$item['pubdate'];
            $item['changeGs'] = (int)$item['changeGs'];
            $item['userid'] = (int)$item['userid'];
            $item['state'] = (int)$item['state'];
            $item['changeContent'] = $item['changeContent'] ? json_decode($item['changeContent'], true) : array('title' => array(), 'logo' => array(), 'full_name' => array(), 'business_license' => array());

            $nature = $item['nature'];
            if (!empty($nature)) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $nature);
                $typename = getCache("job_item", $archives, 0, array("name" => "typename", "sign" => $nature));
                if ($typename) {
                    $nature = $typename;
                }
            }
            $item["natureid"] = (int)$item['nature'];
            $item["nature"] = $nature;

            $scale = $item['scale'];
            if (!empty($scale)) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $scale);
                $typename = getCache("job_item", $archives, 0, array("name" => "typename", "sign" => $scale));
                if ($typename) {
                    $scale = $typename;
                }
            }
            $item["scaleid"] = (int)$item['scale'];
            $item["scale"] = $scale;

            global $data;
            $data = "";
            $industryArr = getParentArr("job_industry", $item['industry']);
            $industryArr = array_reverse(parent_foreach($industryArr, "typename"));
            $item['industryid'] = (int)$item['industry'];
            $item['industry'] = $industryArr;

            $item["logo"] = $item['logo'] ? $item['logo'] : '/static/images/bus_default.png';
            $item["logo_url"] = $item['logo'] ? getFilePath($item['logo']) : getFilePath('/static/images/bus_default.png');
            $item["people_pic_url"] = getFilePath($item['people_pic']);

            $picsArr = array();
            $pics = $item['pics'];
            if (!empty($pics)) {
                $pics = explode("###", $pics);
                foreach ($pics as $key => $value) {
                    $v = explode("||", $value);
                    array_push($picsArr, array("pic" => getFilePath($v[0]), "picSource" => $v[0], "title" => $v[1]));
                }
            }
            $item['pics'] = $picsArr;

            //公司福利
            if ($item['welfare']) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ({$item['welfare']})");
                $res = $dsql->getArr($archives);
                $item['welfareNames'] = is_array($res) ? $res : array();
            } else {
                $item['welfareNames'] = array();
            }
            $welfare = $item['welfare'] ?: "";
            $item['welfare'] = json_decode('[' . $welfare . ']', true);

            //属性
            if ($item['property']) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ({$item['property']})");
                $res = $dsql->getArr($archives);
                $item['propertyNames'] = is_array($res) ? $res : array();
            } else {
                $item['propertyNames'] = array();
            }
            $property = $item['property'] ?: "";
            $item['property'] = json_decode('[' . $property . ']', true);

            $now = time();
            $sql = $dsql::SetQuery("select `min_salary`,`max_salary` from `#@__job_post` where `company`={$item['id']} and `del`=0 and `state`=1 and `off`=0 and `mianyi`=0 and `min_salary`>0 and `max_salary`>0 and (`valid`=0 OR `valid`>$now OR `long_valid` = 1)");
            $salaryList = $dsql->getArrList($sql);

            $salary_min = PHP_INT_MAX;  // 设置一个很大的初始值
            $salary_max = PHP_INT_MIN;  // 设置一个很大的初始值

            if($salaryList){
                $sum = 0;
                foreach ($salaryList as $ii){
                    $sum += array_sum($ii);

                    if ($ii["min_salary"] < $salary_min) {
                        $salary_min = $ii["min_salary"];
                    }
                    if ($ii["max_salary"] > $salary_max) {
                        $salary_max = $ii["max_salary"];
                    }

                }
                $item['salary_avg'] = (int)($sum/count($salaryList)/2);
            }else{
                $item['salary_avg'] = 0;
                $salary_min = 0;
                $salary_max = 0;
            }

            $item['show_salary'] = salaryFormat(1, $salary_min, $salary_max, $salary_min == $salary_max);


            //统计在招职位
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_post` WHERE `state` = 1 and `off`=0 and `del`=0 and (`valid`=0 OR `valid`>$now OR `long_valid` = 1) AND `company` = " . $item['id']);
            $item['pcount'] = (int)$dsql->getOne($sql);


            //获取企业最后登录信息
            $sql = $dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`={$item['userid']} order by `id` desc limit 1");
            $loginTime = (int)$dsql->getOne($sql) ?: 0;
            $loginDate = date("Y-m-d",$loginTime); //最后登录的那天
            $currentDate = date("Y-m-d");
            $login = 3;  //假设未登录
            if(abs($loginTime - time()) < 300){ //300秒，5分钟内
                $login = 1;  //5分钟内登录
            }elseif($loginDate==$currentDate){
                $login = 2;  //今日登录了
            }
            $item['loginState'] = $login;
            if($item['pcount'] > 0){
                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__job_post` WHERE `state` = 1 and `off`=0 and `del`=0 AND (`valid`=0 OR `valid`>$now OR `long_valid` = 1) AND `company` = " . $item['id'] . " limit 1");
                $item['ptitle'] = $dsql->getOne($sql);
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_post` WHERE `state` = 1 and `off`=0 and `del`=0 AND (`valid`=0 OR `valid`>$now OR `long_valid` = 1) AND `company` = " . $item['id'] . " limit 10");
                $pids = $dsql->getArr($sql);
                foreach ($pids as $pids_i){
                    $this->param = array("id"=>$pids_i);
                    $item['jobs'][] = $this->postDetail();
                }
            }else{
                $item['ptitle'] = "";
                $item['jobs'] = array();
            }
            //验证是否已经收藏
            $params                = array(
                "module" => "job",
                "temp"   => "company",
                "type"   => "add",
                "id"     => $item['id'],
                "check"  => 1
            );
            //查询公司的地址
            $sql = $dsql::SetQuery("select `typename` from `#@__site_area` where `id`=".$item['addrid']);
            $item['addrName'] = $dsql->getOne($sql) ?: "";

            //地址id列表和name列表
            global $data;
            $data = "";
            $addrArr = getParentArr("site_area", $item['addrid']);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $item['addr'] = $addrArr;

            $collect               = checkIsCollect($params);
            $item['collect'] = $collect == "has" ? 1 : 0;

            $item['url'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$item["id"]
            ));
        }
        unset($item);

        return array("state"=>100,"info"=>$pageObj);
    }

    /**
     * 是否投递过某个公司的职位，如果是则返回职位名称和id列表
    */
    public function hasDeliveryCompany(){
        global $dsql;
        $uid = $this->getUid();
        if(is_array($uid)){
            return $uid;
        }
        $param = $this->param;
        $cid = (int)$param['cid'] ?: 0;
        if(empty($cid)){
            return array("state"=>200,"info"=>"请传递cid");
        }
        //查询投递列表
        $sql = $dsql::SetQuery("select distinct `pid` from `#@__job_delivery` where `userid`=$uid and `cid`=$cid");
        $pids = $dsql->getArr($sql);
        if(empty($pids)){
            return array("state"=>200,"info"=>"暂无相关数据");
        }
        $deliveryItem = array();
        foreach ($pids as $pid){
            $title = $dsql->getOne($dsql::SetQuery("select `title` from `#@__job_post` where `id`={$pid}"));
            $deliveryItem[] = array(
                'id'=>(int)$pid,
                'title' => $title
            );
        }
        return $deliveryItem;
    }



    /**
     * 招聘企业详细信息（指定id，或调用当前登录会员的店铺）
     * @return array
     */
    public function companyDetail($from=0)
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        $adminId = $userLogin->getUserID();
        if($adminId>0){
            $this->right = true;
        }

        $param = $this->param;
        $id = $param['id'];

        $other_param = $param['other_param'] ?: "";
        $other_param = explode(",",$other_param);

        $where = "";

        //如果没有指定 id，则默认调用当前登录会员店铺
        if (!is_numeric($id)) {
            $id = $this->getCid();
            if(is_array($id)){
                return $id;
            }
            $is_store_admin = 1;  //是否为调用当前登录用户公司
        }else{
            $is_store_admin = 0;
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__job_company` WHERE `id` = " . $id . $where);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("job_company_detail", $archives, ($is_store_admin ? 1 : 300), $id);
        if ($results) {

            $results = $results[0]; // 取第一个
            $results["logo"] = $results['logo'] ? $results['logo'] : '/static/images/bus_default.png';
            $results["logo_url"] = $results['logo'] ? getFilePath($results['logo']) : getFilePath('/static/images/bus_default.png');
            $results["people_pic_url"] = getFilePath($results['people_pic']);
            $results['random_people_pic'] = (int)$results['random_people_pic']; //随机头像
            $results["business_license_url"] = getFilePath($results['business_license']);

            $results['enterprise_money'] = $results['enterprise_money'] ? $results['enterprise_money'] . "万元" : "";

            //该企业的联系人电话【取会员中心的联系人电话】
            $sql = $dsql::SetQuery("select `phone` from `#@__member` where `id`={$results['userid']}");
            $results['phone'] = $dsql->getOne($sql); //这里是联系人电话【contact为公司电话】
            global $data;
            $data = "";
            $addrArr = getParentArr("site_area", $results['addrid']);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $results['addr'] = $addrArr;
            $nature = $results['nature'];
            if (!empty($nature)) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $nature);
                // $typename = $dsql->dsqlOper($archives, "results");
                $typename = getCache("job_item", $archives, 0, array("name" => "typename", "sign" => $nature));
                if ($typename) {
                    $nature = $typename;
                }
            }
            $results["natureid"] = (int)$results["nature"];
            $results["nature"] = $nature;

            $scale = $results['scale'];
            if (!empty($scale)) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $scale);
                // $typename = $dsql->dsqlOper($archives, "results");
                $typename = getCache("job_item", $archives, 0, array("name" => "typename", "sign" => $scale));
                if ($typename) {
                    $scale = $typename;
                }
            }
            $results["scaleid"] = (int)$results["scale"];
            $results["scale"] = $scale;
            $results["site"] = $results["site"] ? "https://".$results["site"] : "";
            $results['industryid'] = (int)$results['industry'];
            global $data;
            $data = "";
            $industryArr = getParentArr("job_industry", $results['industry']);
            $industryid = array_reverse(parent_foreach($industryArr, "id"));
            foreach ($industryid as $kkk => $vvv){
                $industryid[$kkk] = (int)$vvv;
            }
            $results['industryid_list'] = $industryid;
            $data = "";
            $industryArr = array_reverse(parent_foreach($industryArr, "typename"));
            $results['industry'] = $industryArr;
            //会员信息
            $member = getMemberDetail($results["userid"]);
            $results["license"] = (int)$member['licenseState'];
            //公司福利
            if ($results['welfare']) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ({$results['welfare']})");
                $res = $dsql->getArrList($archives);
                if($res){
                    $res = array_column($res,"typename");
                }
                $res = $res ? $res : array();
                $results['welfareNames'] = $res;

                //福利名称和图标
                $archives = $dsql->SetQuery("SELECT `typename` 'name', `icon` FROM `#@__jobitem` WHERE `id` in ({$results['welfare']})");
                $res = $dsql->getArrList($archives);
                $newWfIcon = array();
                foreach ($res as $wfName){
                    $newWfIconItem = array("title"=>$wfName['name'], "name"=>$wfName['name']);

                    //自定义图标
                    if($wfName['icon']){
                        $newWfIconItem['icon'] = getFilePath($wfName['icon']);
                    }
                    //默认图标
                    else{
                        $pyWf = GetPinyin($wfName['name']);
                        if(file_exists(HUONIAOROOT."/static/images/job/welfare_icon/".$pyWf.".png")){
                            $newWfIconItem['icon'] = getFilePath("/static/images/job/welfare_icon/".$pyWf.".png");
                        }else{
                            $newWfIconItem['icon'] = getFilePath("/static/images/job/welfare_icon/moren.png");
                        }
                    }
                    
                    $newWfIcon[] = $newWfIconItem;
                }


                $results['welfareNameIcons'] = $newWfIcon;
            } else {
                $results['welfareNames'] = array();
                $results['welfareNameIcons'] = array();
            }
            $welfare = $results['welfare'] ?: "";
            $results['welfare'] = json_decode('[' . $welfare . ']', true);

            //属性
            if ($results['property']) {
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` in ({$results['property']})");
                $res = $dsql->getArrList($archives);
                if($res){
                    $res = array_column($res,"typename");
                }
                $results['propertyNames'] = $res;
            } else {
                $results['propertyNames'] = array();
            }
            $property = $results['property'] ?: "";
            $results['property'] = json_decode('[' . $property . ']', true);

            $results['id'] = (int)$results['id'];
            $results['delivery_smart'] = (int)$results['delivery_smart'];
            $results['url'] = getUrlPath(array(
                'service'=>'job',
                'template'=>'company',
                'id'=>$results["id"]
            ));
            $results['weight'] = (int)$results['weight'];
            $results['addrid'] = (int)$results['addrid'];
            global $data;
            $data                 = "";
            $addrName = getParentArr("site_area", $results['addrid']);
            $addrid = array_reverse(parent_foreach($addrName, "id"));
            if(empty($addrid)){
                $addrid = array();
            }
            foreach ($addrid as $addrid_k => $addrid_i){
                $addrid[$addrid_k] = (int)$addrid_i;
            }
            $results['addrid_list'] = $addrid;
            $results['userid'] = (int)$results['userid'];
            $results['cityid'] = (int)$results['cityid'];
            $results['state'] = (int)$results['state'];
            $results['certification'] = (int)$results['certification'];
            $results['lng'] = (float)$results['lng'];
            $results['lat'] = (float)$results['lat'];
            $results['pubdate'] = (int)$results['pubdate'];
            $results['rest_flag'] = (int)$results['rest_flag'];
            $results['famous'] = (int)$results['famous'];
            $results['work_over'] = (int)$results['work_over'];
            //投递限制
            $delivery_limit = array(
                "time"=>$results['delivery_limit_interval']
            );
            $delivery_limit_account = array();
            if($results['delivery_limit_certifyState']==1){
                $delivery_limit_account[] = 1;
            }
            if($results['delivery_limit_phoneCheck']==1){
                $delivery_limit_account[] = 2;
            }
            $delivery_limit['account'] = join(",",$delivery_limit_account);
            $results['delivery_limit'] = $delivery_limit;  //之前单字段存储，现在改多字段，不影响前端情况下先保留此拼接字段，如不再需要直接删除即可
            $results['delivery_limit_interval'] = (int)$results['delivery_limit_interval'];
            $results['delivery_limit_certifyState'] = (int)$results['delivery_limit_certifyState'];
            $results['delivery_limit_phoneCheck'] = (int)$results['delivery_limit_phoneCheck'];
            $results['delivery_refuse'] = json_decode($results['delivery_refuse'],true);
            $results['changeState'] = (int)$results['changeState'];
            $results['changeContent'] = $results['changeContent'] ? json_decode($results['changeContent'], true) : array('title' => array(), 'logo' => array(), 'full_name' => array(), 'business_license' => array());
            $picsArr = array();
            $pics = $results['pics'];
            if (!empty($pics)) {
                $pics = explode("###", $pics);
                foreach ($pics as $key => $value) {
                    $v = explode("||", $value);
                    array_push($picsArr, array("pic" => getFilePath($v[0]), "picSource" => $v[0], "title" => $v[1]));
                }
            }
            $results['pics'] = $picsArr;
            $results['picsArr'] = $picsArr;

            $now = time();

            //统计在招职位（审核通过和待审核的）
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_post` WHERE `off`=0 and `del`=0 and `state` != 2 AND (`valid`=0 OR `valid`>$now OR `long_valid` = 1) AND `company` = " . $id);
            $results['pcount'] = (int)$dsql->getOne($sql);
            //统计在招职位（审核通过）
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_post` WHERE `off`=0 and `del`=0 and `state` = 1 AND (`valid`=0 OR `valid`>$now OR `long_valid` = 1) AND `company` = " . $id);
            $results['post_count'] = (int)$dsql->getOne($sql);
            //统计已下架职位
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__job_post` WHERE `off`=1 and `del`=0  AND `company` = " . $id);
            $results['pcount_off'] = (int)$dsql->getOne($sql);

            //平均工资，先把所有符合条件的职位取出，计算每个职位的平均值（最高+最低）/2，再相加计算得到总平均值
            $sql = $dsql::SetQuery("select `min_salary`,`max_salary` from `#@__job_post` where `company`=$id and `del`=0 and `state`=1 and `off`=0 and `mianyi`=0 and `min_salary`>0 and `max_salary`>0 and (`valid`=0 OR `valid`>$now OR `long_valid` = 1)");
            $salaryList = $dsql->getArrList($sql);
            if($salaryList){
                $sum = 0;
                foreach ($salaryList as $item){
                    $sum += array_sum($item);
                }
                $results['salary_avg'] = (int)($sum/count($salaryList)/2);
            }else{
                $results['salary_avg'] = 0;
            }

            //验证是否已经收藏
            $params                = array(
                "module" => "job",
                "temp"   => "company",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect               = checkIsCollect($params);
            $results['collect'] = $collect == "has" ? 1 : 0;

            $results['changeGs'] = (int)$results['changeGs'];
            //获取企业最后登录信息
            $sql = $dsql::SetQuery("select `logintime` from `#@__member_login` where `userid`=$uid order by `id` desc limit 1");
            $loginTime = (int)$dsql->getOne($sql);
            $loginDate = date("Y-m-d",$loginTime); //最后登录的那天
            $currentDate = date("Y-m-d");
            $login = 3;  //假设未登录
            if(abs($loginTime - time()) < 300){ //300秒，5分钟内
                $login = 1;  //5分钟内登录
            }elseif($loginDate==$currentDate){
                $login = 2;  //今日登录了
            }
            $results['loginState'] = $login;

            //套餐详情
            $results['combo_id'] = (int)$results['combo_id'];  // 套餐id
            if($results['combo_id']){
                //获取套餐名称
                $sql = $dsql::SetQuery("select `title` from `#@__job_combo` where `id`=".$results['combo_id']);
                $results['combo_title'] = $dsql->getOne($sql);
            }else{
                $results['combo_title'] = "未开通套餐";
            }
            $results['combo_enddate'] = (int)$results['combo_enddate']; //套餐过期时间
            $results['combo_job'] = (int)$results['combo_job'];  //职位上架数
            $results['combo_resume'] = (int)$results['combo_resume'];  //简历每天下载数
            $results['combo_refresh'] = (int)$results['combo_refresh']; //简历每天刷新数
            $results['combo_top'] = (int)$results['combo_top']; //套餐置顶剩余时长

            $results['combo_wait'] = json_decode($results['combo_wait'],true) ?: array();  //待生效套餐包
            //如果当前套餐过期了，而且还有待生效套餐，则把待生效套餐立即生效，并清空待生效套餐
            if(time()>$results['combo_enddate'] && $results['combo_enddate']!=-1 && $results['combo_wait']){
                $results['combo_id'] = $results['combo_wait']['id'];;
                $results['combo_title'] = $results['combo_wait']['title'];;
                $results['combo_enddate'] = $results['combo_wait']['enddate'];;
                $results['combo_job'] = $results['combo_wait']['job'];;
                $results['combo_resume'] = $results['combo_wait']['resume'];;
                $results['combo_refresh'] = $results['combo_wait']['refresh'];;
                $results['combo_top'] = $results['combo_wait']['top'];
                $results['combo_wait'] = "";
                //更新到数据库中
                $sql = $dsql::SetQuery("update `#@__job_company` set `combo_id`={$results['combo_id']},`combo_enddate`={$results['combo_enddate']},`combo_job`={$results['combo_job']},`combo_resume`={$results['combo_resume']},`combo_refresh`={$results['combo_refresh']},`combo_top`={$results['combo_top']},`combo_wait`='{$results['combo_wait']}' where `id`=$id");
                $up4 = $dsql->update($sql);
            }

            //增值包相关
            $results['package_job'] = (int)$results['package_job']; //增值包上架职位总数（随套餐生效）
            $results['package_resume'] = (int)$results['package_resume']; //增值包上架职位总数（随套餐生效）
            $results['package_refresh'] = (int)$results['package_refresh']; //增值包上架职位总数（随套餐生效）
            $results['package_top'] = (int)$results['package_top']; //增值包上架职位总数（随套餐生效）

            /* 计算当前可用资源，先判断套餐是否过期 */
            if($results['combo_enddate']!=-1 && $results['combo_enddate']<time()){
                $combo_job = 0;
                $combo_resume = 0;
                $combo_refresh = 0;
            }else{
                $combo_job = $results['combo_job'];  //职位上架数
                $combo_resume = $results['combo_resume'];  //简历每天下载数
                $combo_refresh = $results['combo_refresh']; //简历每天刷新数
            }
            //今天可下载的简历次数
            $start_time = strtotime(date('Y-m-d')."00:00:00");
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume_download` where `pubdate`>$start_time and `cid`=$id and `delivery`=0 and `use_combo`=1");
            $results['use_resume_down'] = (int)$dsql->getOne($sql);
            if(($results['combo_enddate']>=time() || $results['combo_enddate']==-1) && $results['combo_resume']==-1){
                // $results['can_resume_down'] = -1;  //今日剩余无限下载次数
                $results['can_resume_down'] = 999999;  //今日剩余无限下载次数
            }
            else{
                $results['can_resume_down'] = $combo_resume > $results['use_resume_down'] ? $combo_resume - $results['use_resume_down'] : 0;
            }
            //今天可刷新的数量
            $sql = $dsql::SetQuery("select sum(use_combo) from `#@__job_refresh_record` where `pubdate`>$start_time and `cid`=$id");
            $results['use_job_refresh'] = (int)$dsql->getOne($sql);
            $results['can_job_refresh'] = $combo_refresh > $results['use_job_refresh'] ? $combo_refresh - $results['use_job_refresh'] : 0;
            //计算当前可上架的职位数
            if(($results['combo_enddate']>=time() || $results['combo_enddate']==-1) && $results['combo_job']==-1){
                // $results['canJobs'] = -1;  //当前剩余无限次数上架职位
                $results['canJobs'] = 999999;  //当前剩余无限次数上架职位
            }else{
                $results['canJobs'] = ($combo_job+$results['package_job']) > $results['pcount'] ? $combo_job+$results['package_job']-$results['pcount'] : 0;
            }

            if(in_array("addr",$other_param)){
                $this->param = array("method"=>"all");
                $all_addr = $this->op_address();
                if($all_addr['state']==200){
                    $all_addr = array();
                }
                $results['all_addr'] = $all_addr;
            }
            //简历单份下载的金额
            include(HUONIAOINC."/config/job.inc.php");
            $results['config']['job_fee'] = $customJob_fee; //职位单个购买
            $results['config']['resume_fee'] = $customResume_down_fee; //简历单条下载
            $results['config']['top_fee'] = $customJob_top_fee; //置顶一天
            $results['config']['refresh_fee'] = $customJob_refresh_fee; //刷新一次
            $results['config']['gsName'] = $customJobGsName ?: '阿里云'; //工商信息来源

            //如果不是超级权限
            if(!$this->right && $from!=1){
                //非公司登录
                if(!$is_store_admin){
                    //如果状态不正常，且不是当前登录用户（不是商家），直接禁止
                    if($results['state']!=1){
                        return array("state"=>200,"info"=>"公司等待审核中...");
                    }
                }
            }
            if($adminId>0){
                $this->right = false;
            }


            //更新浏览记录
            global $action;
            if($uid >0 && $uid!=$results['userid'] && ($_GET['action'] == 'companyDetail' || $action == "company-detail")) {
                $uphistoryarr = array(
                    'module'    => 'job',
                    'uid'       => $uid,
                    'aid'       => $id,
                    'fuid'      => $results['userid'],
                    'module2'   => 'companyDetail',
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }


            return $results;
        }else{
            return array("state"=>200,"info"=>"数据不存在");
        }
    }

    /**
     * 店铺配置
     */
    public function storeConfig()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        $userid = $userLogin->getMemberID();
        if ($userid < 0) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        $param = $this->param;
        //城市ID
        $cityid = (int)$param['cityid'];
        //公司名称
        $title = filterSensitiveWords(addslashes($param['title']));
        if (empty($title)) {
            return array("state" => 200, "info" => "公司名称不可为空");
        }
        //公司性质
        $nature = (int)$param['nature'];
        if(empty($nature)){
            return array("state" => 200, "info" => "请选择公司性质");
        }
        //公司规模
        $scale = (int)$param['scale'];
        if(empty($scale)){
            return array("state" => 200, "info" => "请选择公司规模");
        }
        //公司经营行业
        $industry = $param['industry'];
        if(empty($industry)){
            return array("state"=>200,"info"=>"请选择公司经营行业");
        }
        if(is_array($industry)){
            $industry = join(",",$industry);
        }
        //logo
        $logo = $param['logo'];
        if (empty($logo)) {
            return array("state" => 200, "info" => "请上传公司logo");
        }
        //联系人
        $people = filterSensitiveWords(addslashes($param['people']));
        $people_pic = $param['people_pic'];
        $random_people_pic = (int)$param['random_people_pic'];
        $people_job = filterSensitiveWords(addslashes($param['people_job']));
        $contact = $param['contact']; //联系电话
        //公司网址
        $site = $param['site'];
        $httpLength = strlen("http://");
        $httpSLength = strlen("https://");
        if(substr($site,0,$httpLength) == "http://"){
            $site = substr($site,$httpLength);
        }
        if(substr($site,0,$httpSLength) == "https://"){
            $site = substr($site,$httpSLength);
        }
        //公司地址
        $addrid = (int)$param['addrid'];

        //根据地址id获取分站信息
        if($addrid){
            $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
            $cityInfoArr = explode(',', $cityInfoArr);
            if($cityInfoArr && $cityInfoArr[0]){
                $cityid = $cityInfoArr[0];
            }
        }

        $address = $param['address'] ?: "";
        $lng = $param['lng'] ?: "";
        $lat = $param['lat'] ?: "";
        //福利
        $welfare = $param['welfare'];  //多选 1,6,8
        if($welfare && is_array($welfare)){
            $welfare = join(",",$welfare);
        }
        //公司介绍
        $body = $param['body'];
        //图集
        $pics = $param['pics'];
        if($pics && is_array($pics)){
            $pic_i = array_column($pics,'picSource');
            $pics = join("||1###",$pic_i);
        }
        /*  ---- 工商信息可以修改  ---- */
        //公司全称
        $full_name = filterSensitiveWords(addslashes($param['full_name']));
        if (empty($full_name)) {
            return array("state" => 200, "info" => "公司全称不可为空");
        }
        //营业执照
        $business_license = $param['business_license'];
        if (empty($business_license)) {
            return array("state" => 200, "info" => "请上传营业执照");
        }
        //企业类型(工商)
        $enterprise_type = $param['enterprise_type'] ?: "";
        //企业成立日期(工商)
        $enterprise_establish = $param['enterprise_establish'] ? GetMkTime($param['enterprise_establish']) : "";
        //法定代表人(工商)
        $enterprise_people = $param['enterprise_people'] ?: "";
        $enterprise_money = $param['enterprise_money'] ?: "";

        $rest_flag = (int)$param['rest_flag'];
        $work_over = (int)$param['work_over'];

        //工作时间
        $work_time_s = $param['work_time_s'];
        $work_time_e = $param['work_time_e'];
        //审核状态
        include HUONIAOINC . "/config/job.inc.php";
        $customNewCheck = (int)$customNewCheck;
        $customChangeCheck = (int)$customChangeCheck;
        //查询是否已开通
        $storeSql = $dsql::SetQuery("SELECT `id`,`title`,`logo`,`full_name`,`enterprise_type`,`business_license`,`enterprise_establish`,`enterprise_money`,`enterprise_people`,`state`,`changeState`,`changeContent` FROM `#@__job_company` WHERE `userid` = " . $userid);
        $storeArr = $dsql->getArr($storeSql);
        //新增店铺
        if (!$storeArr) {
            if(empty($cityid)){
                return array("state"=>200,"info"=>"缺少cityid");
            }
            $state = (int)$customNewCheck;
            $pubdate = time();
            //首次保存时，自动抓取工商信息
            $gs = getEnterpriseBusinessData($full_name);
            $gsInfo = "";
            if ($gs['error_code'] == 50002) {
                $enterprise_code = ""; //社会信用代码
                $gsInfo = "工商信息查询失败，请确认企业全称";
            }else{
                $enterprise_type = $gs['result']['regType'];
                $enterprise_establish = GetMkTime($gs['result']['regDate']);
                $enterprise_people = $gs['result']['faRen'];
                $enterprise_money = (int)$gs['result']['regMoney'];
                $enterprise_code = $gs['result']['creditCode'];
            }
            //首次开通，可能有赠送的体验资源
            $customFree_jobs = (int)$customFree_jobs;
            $customFree_job_resume_down = (int)$customFree_job_resume_down;
            $customFree_job_refresh = (int)$customFree_job_refresh;
            $customFree_job_top = (int)$customFree_job_top;
            //保存到主表
            $archives = $dsql::SetQuery("INSERT INTO `#@__job_company` (`cityid`,`title`,`nature`,`scale`,`industry`,`logo`,`userid`,`people`,`people_pic`,`random_people_pic`,`people_job`,`contact`,`addrid`,`address`,`lng`,`lat`,`site`,`body`,`pics`,`state`,`pubdate`,`welfare`,`full_name`,`business_license`,`enterprise_type`,`enterprise_establish`,`enterprise_people`,`enterprise_money`,`enterprise_code`,`work_time_s`,`work_time_e`,`rest_flag`,`work_over`,`package_job`,`package_resume`,`package_refresh`,`package_top`) values($cityid,'$title',$nature,$scale,'$industry','$logo',$userid,'$people','$people_pic',$random_people_pic,'$people_job','$contact',$addrid,'$address','$lng','$lat','$site','$body','$pics',$state,$pubdate,'$welfare','$full_name','$business_license','$enterprise_type','$enterprise_establish','$enterprise_people','$enterprise_money','$enterprise_code','$work_time_s','$work_time_e',$rest_flag,$work_over,$customFree_jobs,$customFree_job_resume_down,$customFree_job_refresh,$customFree_job_top)");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if (is_numeric($aid)) {
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'company',
                    'id'=>$aid
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'company', $aid, 'insert', '新增公司('.$title.')', $url, $archives);
                //冗余地址
                $sql = $dsql->update($dsql::SetQuery("insert into `#@__job_address`(`company`,`addrid`,`address`,`lng`,`lat`,`type`) values($aid,$addrid,'$address','$lng','$lat',1)"));
                // $dsql->update($sql);
                return array("info"=>"配置成功，您的商铺正在审核中，请耐心等待！","complete"=>0,"gsInfo"=>$gsInfo,"aid"=>$aid);
            } else {
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }
        } //更新店铺
        else {
            //修改信息，必须存在 store
            if(empty($storeArr)){
                return array("state"=>200,"info"=>"请先开通招聘公司");
            }

            //检测是否修改敏感信息（审核通过的信息、并且开启了改配置，才有效）
            $changeAppend = "";
            if ($customChangeCheck && $storeArr['state'] == 1) {
                //初始化修改内容
                // if (!$storeArr['changeState']) {
                //     $changeContent = array();
                // } // 上次修改的还未审批，保留原数组
                // else {
                    $changeContent = $storeArr['changeContent'] ? json_decode($storeArr['changeContent'], true) : array();
                // }
                //检测公司名称是否修改
                $changeState = 0; //是否有新的敏感信息需要审核
                if ($title != $storeArr['title']) {
                    $changeContent['title'] = array('new' => $title, 'name' => '公司名称');
                    $changeState = 1;
                } else {
                    $changeContent['title'] = $changeContent['title'] ? $changeContent['title'] : array();
                    if($changeContent['title'] && !isset($changeContent['title']['refuse'])){
                        $changeState = 1;
                    }
                }
                //检测logo修改
                if ($logo != $storeArr['logo']) {
                    $changeContent['logo'] = array('new' => $logo, 'path' => getFilePath($logo), 'name' => '公司logo');
                    $changeState = 1;
                } else {
                    $changeContent['logo'] = $changeContent['logo'] ? $changeContent['logo'] : array();
                    if($changeContent['logo'] && !isset($changeContent['logo']['refuse'])){
                        $changeState = 1;
                    }
                }
                //公司全称
                if ($full_name != $storeArr['full_name']) {
                    $changeContent['full_name'] = array('new' => $full_name, 'name' => '公司全称');
                    $changeState = 1;
                } else {
                    $changeContent['full_name'] = $changeContent['full_name'] ? $changeContent['full_name'] : array();
                    if($changeContent['full_name'] && !isset($changeContent['full_name']['refuse'])){
                        $changeState = 1;
                    }
                }
                //营业执照
                if ($business_license != $storeArr['business_license']) {
                    $changeContent['business_license'] = array('new' => $business_license, 'path' => getFilePath($business_license), 'name' => '营业执照');
                    $changeState = 1;
                } else {
                    $changeContent['business_license'] = $changeContent['business_license'] ? $changeContent['business_license'] : array();
                    if($changeContent['business_license'] && !isset($changeContent['business_license']['refuse'])){
                        $changeState = 1;
                    }
                }
                //记录最新修改内容
                if ($changeContent['title'] || $changeContent['logo'] || $changeContent['full_name'] || $changeContent['business_license']) {
                    $changeAppend = ",`changeContent`='" . json_encode($changeContent, JSON_UNESCAPED_UNICODE) . "',`changeState`=$changeState";

                } //内容与原来一致，说明没变更，状态改为0
                else {
                    $changeAppend = ",`changeContent`='',changeState=0";
                }
            }
            //允许直接修改
            else{
                $changeAppend = ",`title`='$title',`logo`='$logo',`full_name`='$full_name',`business_license`='$business_license'";
                //如果已经是审核通过，则不改审核状态，如果非审核通过（待审核、审核拒绝）变为待审核
                if($storeArr['state']!=1){
                    $changeAppend .= ",`state`=0";
                }
            }

            //是否修改过工商信息
            $changeGs = 0;

            //判断之前是否修改过，如果是修改过的，不需要再校验
            if($storeArr['changeGs']){
                $changeGs = 1;
            }else{
                if ($logo != $storeArr['logo']) {
                    $changeGs=1;
                }
                if ($full_name != $storeArr['full_name']) {
                    $changeGs=1;
                }
                if ($enterprise_type != $storeArr['enterprise_type']) {
                    $changeGs=1;
                }
                if ($enterprise_establish != $storeArr['enterprise_establish']) {
                    $changeGs=1;
                }
                if ($enterprise_money != $storeArr['enterprise_money']) {
                    $changeGs=1;
                }
                if ($enterprise_people != $storeArr['enterprise_people']) {
                    $changeGs=1;
                }
            }
            $AppendChangeGs = $changeGs ? ",`changeGs`=1" : ""; //是否修改过工商信息
            //必填信息是否已完善？
            if($rest_flag && $work_time_s && $work_time_e && $nature && $scale && $industry  && $site && $full_name && $enterprise_type && $enterprise_establish && $enterprise_money && $enterprise_people && $business_license && $people && $people_pic && $people_job && $contact && $addrid && $address && $welfare && $pics){
                $complete = 1;
            }else{
                $complete = 0;
            }
            $archives = $dsql::SetQuery("update `#@__job_company` set `cityid`='$cityid',`rest_flag`=$rest_flag,`work_over`=$work_over,`work_time_s`='$work_time_s',`work_time_e`='$work_time_e',`nature`=$nature,`scale`=$scale,`industry`='$industry',`people`='$people',`people_pic`='$people_pic',`random_people_pic`=$random_people_pic,`people_job`='$people_job',`contact`='$contact',`addrid`=$addrid,`address`='$address',`lng`='$lng',`lat`='$lat',`site`='$site',`body`='$body',`pics`='$pics',`welfare`='$welfare',`enterprise_type`='$enterprise_type',`enterprise_establish`='$enterprise_establish',`enterprise_people`='$enterprise_people',`enterprise_money`='$enterprise_money',`complete`=$complete". $AppendChangeGs . $changeAppend . " where `id`={$storeArr['id']}");
            $up = $dsql->dsqlOper($archives, "update");
            if ($up == "ok") {
                //行为日志
                $urlParam = array(
                    'service'=>'job',
                    'template'=>'company',
                    'id'=>$storeArr['id']
                );
                $url = getUrlPath($urlParam);
                memberLog($userid, 'job', 'company', $storeArr['id'], 'update', '更新公司('.$title.')', $url, $archives);
                //把addr冗余到job_address表
                $job_addrid = (int)$dsql->getOne($dsql::SetQuery("select `id` from `#@__job_address` where `type`=1 and `company`=".$storeArr['id']));
                $dsql->update($dsql::SetQuery("update `#@__job_address` set `addrid`=$addrid,`address`='$address',`lng`='$lng',`lat`='$lat' where `id`=$job_addrid"));
                clearCache("job_company_detail", $storeArr['id']);
                return array("info"=>"保存成功","complete"=>$complete,"aid"=>$storeArr['id'],"job_addrid"=>$job_addrid);
            } else {
                return array("state" => 200, "info" => '输入的信息不符合要求！');
            }
        }
    }

    

    /**
     * 清除公司的敏感信息提醒
     */
    public function clearStoreChangeTips(){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid < 0) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $cid = $this->getCid();
        if(is_array($cid)){
            return $cid;
        }

        $type = $this->param['type'];  //需要清除的提醒类型  all:全部  info:简称/logo  business:全称/营业执照
        $type = $type ?: 'all';

        //查询是否已开通
        $storeSql = $dsql::SetQuery("SELECT `title`,`logo`,`full_name`,`enterprise_type`,`business_license`,`enterprise_establish`,`enterprise_money`,`enterprise_people`,`state`,`changeState`,`changeContent` FROM `#@__job_company` WHERE `id` = " . $cid);
        $storeArr = $dsql->getArr($storeSql);

        $changeContent = $storeArr['changeContent'] ? json_decode($storeArr['changeContent'], true) : array();

        if($type == 'all'){
            $changeContent = array();
        }elseif($type == 'info'){
            $changeContent['title'] = array();
            $changeContent['logo'] = array();
        }elseif($type == 'business'){
            $changeContent['full_name'] = array();
            $changeContent['business_license'] = array();
        }

        $changeContent = json_encode($changeContent, JSON_UNESCAPED_UNICODE);
        $sql = $dsql::SetQuery("update `#@__job_company` set `changeContent` = '$changeContent' where `id` = $cid");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){
            clearCache("job_company_detail", $cid);
            return '成功';
        }else{
            return $ret;
        }

    }



    /**
     * 私有方法
     */
    public function getItemOne(){
        global $dsql;
        $param = $this->param;
        $name = $param['name']; //多个值，用,分割
        $type = $param['type']; //细化分类
        $uid = $this->getUid();
        $where = "";
        if($name == "nature"){
            $where .= " AND `parentid`=5";
        }
        elseif($name=="scale"){
            $where .= " AND `parentid`=6";
        }
        elseif($name=="welfare"){
            $where .= " AND `parentid`=7";
        }
        elseif($name=="property"){
            $where .= " AND `parentid`=8";
        }
        elseif($name=="startWork"){
            $where .= " AND `parentid`=4";
        }
        elseif($name=="education"){
            $where .= " AND `parentid`=2";
        }
        elseif($name=="jobNature"){ //工作性质
            if($type=="auto"){
                if(is_array($uid)){
                    return $uid;
                }
                $identify = $this->get_u_common($uid,'resume.identify');
                if($identify==1){  //职场人士
                    $where .= " and `value` in(1,2)";
                }else{ //学生
                    $where .= " and `value` in(1,2,3)";
                }
            }
            $sql = $dsql::SetQuery("select `value` 'id',`zh` 'typename' from `#@__job_int_static_dict` where `name`='jobNature'".$where);
            $arrList =  $dsql->getArrList($sql);
        }
        elseif($name=="identify"){//求职身份
            $sql = $dsql::SetQuery("select `value` 'id',`zh` 'typename' from `#@__job_int_static_dict` where `name`='identify'".$where);
            $arrList =  $dsql->getArrList($sql);
        }
        elseif($name=="workState"){ //求职状态
            $sql = $dsql::SetQuery("select `value` 'id',`zh` 'typename' from `#@__job_int_static_dict` where `name`='workState'".$where);
            $arrList =  $dsql->getArrList($sql);
        }
        elseif($name=="advantage"){ //个人优势
            $where .= " AND `parentid`=12";
        }
        elseif($name=="experience"){  //工作经验
            $where .= " AND `parentid`=1";
        }
        elseif($name=="jobTag"){  //职位标签
            $where .= " AND `parentid`=13";
        }
        elseif ($name=="pgeducation"){ //普通学历
            $where .= " AND `parentid`=250";
        }
        elseif ($name=="pgwelfare"){ //普工福利
            $where .= " AND `parentid`=257";
        }
        else{
            return array("缺少参数：name，受支持的值：nature|scale|welfare|property|startWork|education|jobNature|identify|workState||advantage|experience|jobTag");
        }
        $where .= " order by `weight` asc";
        $sql = $dsql::SetQuery("select * from `#@__jobitem` where 1=1".$where);
        $arrList =  isset($arrList) ? $arrList : $dsql->getArrList($sql);
        if(empty($arrList)){
            return array("state"=>200,"info"=>"暂无数据");
        }
        foreach ($arrList as & $item){
            $item['id'] = (int)$item['id'];
            $item['parentid'] = (int)$item['parentid'];
            $item['weight'] = (int)$item['weight'];
            $item['pubdate'] = (int)$item['pubdate'];
            if($name=="experience"){
                $testRes = $this->testExperience($item['typename']);
                $item['typename'] = $testRes['text'];
            }
        }
        unset($item);
        return $arrList;
    }

    /**
     * 招聘分类
     */
    public function getItem(){
        $param = $this->param;
        $name = $param['name']; //多个值，用,分割
        $type = $param['type']; //细化分类
        $names = explode(",",$name);
        $result = array();
        foreach ($names as $name_i){
            $this->param = array("name"=>$name_i,"type"=>$type);
            $result[$name_i] = $this->getItemOne();
        }
        return $result;
    }


    /**
     * 行业类别
     * @return array
     */
    public function industry()
    {
        global $dsql;
        global $type,$son,$page,$pageSize;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        // $results = $dsql->getTypeList($type, "job_industry", $son, $page, $pageSize);
        $results = getCache("job_industry", function() use($dsql, $type, $son, $page, $pageSize){
            return $dsql->getTypeList($type, "job_industry", $son, $page, $pageSize);
        }, 0, array("sign" => $type."_".(int)$son, "savekey" => 1));
        if ($results) {
            return $results;
        }
    }


    /**
     * 递归把 type 中的字符串，转 int
     */
    private function type_int($list){

        $list['id'] = (int)$list['id'];
        $list['parentid'] = (int)$list['parentid'];
        if($list['lower'] && is_array($list['lower'])){
            foreach ($list['lower'] as $k=>$value){
                $list['lower'][$k] = $this->type_int($value);
            }
        }
        return $list;
    }

    /**
     * 职位类别
     * @return array
     */
    public function type()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $tb       = $this->param['tb'];
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        if($tb=="pg"){
            $results = $dsql->getTypeList($type, "job_type_pg", $son, $page, $pageSize);
        }else{
            $results = $dsql->getTypeList($type, "job_type", $son, $page, $pageSize);
        }

        if ($results) {
            if(is_array($results)){
                //一纬数组
                if($results['id']){
                    $results = $this->type_int($results);
                }
                //多维数组
                else{
                    foreach ($results as $kk => $vv){
                        $results[$kk] = $this->type_int($vv);
                    }
                }
            }
            return $results;
        }else{
            return array("state"=>200,"info"=>"暂无相关数据");
        }
    }


    /**
     * 招聘地区（城市列表）
     * @return array
     */
    public function addr()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type = (int)$this->param['type'];
                $page = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son = $this->param['son'] == 0 ? false : true;
                $child = (int)$this->param['child'];
                $company = (int)$this->param['company'];  //公司ID，传入此值表示只查询该公司发布过职位的地区
            }
        }

        //只查询指定公司发布过职位的地区，用于公司详情页区域筛选
        if($company){

            $_data = array();

            //先查出来该公司所有的职位，并以job_addr分组
            $time = GetMkTime(time());
            $sql = $dsql->SetQuery("SELECT `job_addr` FROM `#@__job_post` WHERE `company` = $company AND `state`=1 AND `del`=0 AND `off`=0 AND (`valid`=0 OR `valid`>$time OR `long_valid` = 1)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                //提取地区表ID并统计次数
                $job_addr = array();
                foreach($ret as $val){
                    array_push($job_addr, $val['job_addr']);
                }

                $job_addr_arr = array_count_values($job_addr);

                //根据地区表ID查询addrid并获取区域名称和ID
                if(is_array($job_addr_arr)){

                    $_dataList = array();

                    //key是地区表的ID，val是次数
                    foreach($job_addr_arr as $key => $val){
                        $sql = $dsql->SetQuery("SELECT `addrid` FROM `#@__job_address` WHERE `id` = $key");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $addrid = (int)$ret[0]['addrid'];
                            if($addrid && !$_dataList[$addrid]){
                                global $data;
                                $data = "";
                                $addrArr = getParentArr("site_area", $addrid);
                                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                                
                                array_push($_data, array(
                                    'id' => (int)$addrid,
                                    'typename' => $addrArr[count($addrArr)-1],
                                    'count' => (int)$val
                                ));
                            }
                            $_dataList[$addrid] = 1;
                        }
                    }

                    //按数量多的排序
                    $sort = array_column($_data, 'count');
                    array_multisort($sort, SORT_DESC, $_data);

                    // $_data = array_map("unserialize", array_unique(array_map("serialize", $_data)));

                    return $_data;

                }else{
                    return array("state" => 200, "info" => '区域数据统计错误！');
                }

            }else{
                return array("state" => 200, "info" => '暂无职位！');
            }

            return $_data;
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {

            //数据共享
            require(HUONIAOINC . "/config/job.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $type = getCityId();
            }
        }

        //一级
        if (empty($type)) {
            //可操作的城市，多个以,分隔
            $userLogin = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

            $cityArr = array();
            $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
            $result = $dsql->dsqlOper($sql, "results");
            if ($result) {
                if (!empty($child) || !empty($son)) {

                    //隐藏分站重复区域
                    global $cfg_sameAddr_state;
                    $siteCityArr = array();
                    if (!$cfg_sameAddr_state) {
                        $siteConfigService = new siteConfig();
                        $siteCity = $siteConfigService->siteCity();

                        foreach ($siteCity as $key => $val) {
                            array_push($siteCityArr, $val['cityid']);
                        }
                    }

                    foreach ($result as $key => $value) {

                        $alist = array();
                        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            foreach ($ret as $k_ => $v_) {
                                //隐藏分站重复区域
                                if ($siteCityArr) {
                                    if (!in_array($v_['id'], $siteCityArr)) {
                                        array_push($alist, $v_);
                                    }
                                } else {
                                    array_push($alist, $v_);
                                }
                            }

                        }

                        array_push($cityArr, array(
                            "id" => $value['cid'],
                            "typename" => $value['typename'],
                            "pinyin" => $value['pinyin'],
                            "hot" => $value['hot'],
                            "lower" => $alist
                        ));

                    }
                } else {
                    foreach ($result as $key => $value) {

                        $lowerCount = array();
                        $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                        $ret = $dsql->dsqlOper($sql, "results");
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
            }
            return $cityArr;

        } else {
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
            if ($results) {
                return $results;
            }
        }
    }


    /**
     * 构造函数
     *
     * @param string $action 动作名
     */
    public function __construct($param = array())
    {
        $this->param = $param;
    }

    /**
     * 招聘基本参数（首页路由使用）
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/job.inc.php");

        global $cfg_fileUrl;              //系统附件默认地址
        global $cfg_uploadDir;            //系统附件默认上传目录
        global $cfg_basehost;             //系统主域名
        global $cfg_hotline;              //系统默认咨询热线

        global $cfg_weblogo;              //系统默认logo地址

        global $cfg_map;                  //系统默认地图
        // global $custom_map;               //自定义地图

        // global $customUpload;             //上传配置是否自定义
        global $cfg_softSize;             //系统附件上传限制大小
        global $cfg_softType;             //系统附件上传类型限制
        global $cfg_thumbSize;            //系统缩略图上传限制大小
        global $cfg_thumbType;            //系统缩略图上传类型限制
        global $cfg_atlasSize;            //系统图集上传限制大小
        global $cfg_atlasType;            //系统图集上传类型限制

        //获取当前城市名
        global $siteCityInfo;
        if (is_array($siteCityInfo)) {
            $cityName = $siteCityInfo['name'];
        }

        //如果上传设置为系统默认，则以下参数使用系统默认
        if ($customUpload == 0) {
            $custom_softSize = $cfg_softSize;
            $custom_softType = $cfg_softType;
            $custom_thumbSize = $cfg_thumbSize;
            $custom_thumbType = $cfg_thumbType;
            $custom_atlasSize = $cfg_atlasSize;
            $custom_atlasType = $cfg_atlasType;
        }

        $hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;

        //自定义地图配置
        if ($custom_map == 0) {
            $custom_map = $cfg_map;
        }

        $params = !empty($this->param) && !is_array($this->param) ? explode(',', $this->param) : "";

        // $domainInfo = getDomain('job', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';

        $customChannelDomain = getDomainFullUrl('job', $customSubDomain);

        //分站自定义配置
        $ser = 'job';
        global $siteCityAdvancedConfig;
        if ($siteCityAdvancedConfig && $siteCityAdvancedConfig[$ser]) {
            if ($siteCityAdvancedConfig[$ser]['title']) {
                $customSeoTitle = $siteCityAdvancedConfig[$ser]['title'];
            }
            if ($siteCityAdvancedConfig[$ser]['keywords']) {
                $customSeoKeyword = $siteCityAdvancedConfig[$ser]['keywords'];
            }
            if ($siteCityAdvancedConfig[$ser]['description']) {
                $customSeoDescription = $siteCityAdvancedConfig[$ser]['description'];
            }
            if ($siteCityAdvancedConfig[$ser]['logo']) {
                $customLogoUrl = $siteCityAdvancedConfig[$ser]['logo'];
            }
            if ($siteCityAdvancedConfig[$ser]['hotline']) {
                $hotline = $siteCityAdvancedConfig[$ser]['hotline'];
            }
        }

        $customSeoDescription = trim($customSeoDescription);

        //获取域名信息
        $getDomain = getDomain($ser, "config");

        $return = array();
        if (!empty($params) > 0) {

            foreach ($params as $key => $param) {
                if ($param == "channelName") {
                    $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
                } elseif ($param == "logoUrl") {

                    //自定义LOGO
                    if ($customLogo == 1) {
                        $customLogo = getFilePath($customLogoUrl);
                    } else {
                        $customLogo = getFilePath($cfg_weblogo);
                    }

                    $return['logoUrl'] = $customLogo;
                } elseif ($param == "subDomain") {
                    $return['subDomain'] = $customSubDomain;
                } elseif ($param == "channelDomain") {
                    $return['channelDomain'] = $customChannelDomain;
                } elseif ($param == "channelSwitch") {
                    $return['channelSwitch'] = $customChannelSwitch;
                } elseif ($param == "closeCause") {
                    $return['closeCause'] = $customCloseCause;
                } elseif ($param == "title") {
                    $return['title'] = str_replace('$city', $cityName, $customSeoTitle);
                } elseif ($param == "keywords") {
                    $return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
                } elseif ($param == "description") {
                    $return['description'] = str_replace('$city', $cityName, $customSeoDescription);
                } elseif ($param == "hotline") {
                    $return['hotline'] = $hotline;
                } elseif ($param == "gs_atlasMax") {
                    $return['gs_atlasMax'] = $custom_gs_atlasMax;
                } elseif ($param == "fair_atlasMax") {
                    $return['fair_atlasMax'] = $custom_fair_atlasMax;
                } elseif ($param == "resume_point") {
                    $return['resume_point'] = $resume_point;
                } elseif ($param == "template") {
                    $return['template'] = $customTemplate;
                } elseif ($param == "touchTemplate") {
                    $return['touchTemplate'] = $customTouchTemplate;
                } elseif ($param == "map") {
                    $return['map'] = $custom_map;
                } elseif ($param == "softSize") {
                    $return['softSize'] = $custom_softSize;
                } elseif ($param == "softType") {
                    $return['softType'] = $custom_softType;
                } elseif ($param == "thumbSize") {
                    $return['thumbSize'] = $custom_thumbSize;
                } elseif ($param == "thumbType") {
                    $return['thumbType'] = $custom_thumbType;
                } elseif ($param == "atlasSize") {
                    $return['atlasSize'] = $custom_atlasSize;
                } elseif ($param == "atlasType") {
                    $return['atlasType'] = $custom_atlasType;
                }
            }

        } else {

            //自定义LOGO
            if ($customLogo == 1) {
                $customLogo = getFilePath($customLogoUrl);
            } else {
                $customLogo = getFilePath($cfg_weblogo);
            }

            $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
            $return['logoUrl'] = $customLogo;
            $return['sharePic'] = getAttachemntFile($customSharePic ? $customSharePic : $cfg_sharePic);
            $return['subDomain'] = $customSubDomain;
            $return['channelDomain'] = $customChannelDomain;
            $return['domain']        = $getDomain['domain'];
            $return['channelSwitch'] = $customChannelSwitch;
            $return['closeCause'] = $customCloseCause;
            $return['title'] = str_replace('$city', $cityName, $customSeoTitle);
            $return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
            $return['description'] = str_replace('$city', $cityName, $customSeoDescription);
            $return['hotline'] = $hotline;
            $return['gs_atlasMax'] = $custom_gs_atlasMax;
            $return['fair_atlasMax'] = $custom_fair_atlasMax;
            $return['resume_point'] = $resume_point;
            $return['template'] = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['map'] = $custom_map;
            $return['fair_join_jobs'] = $customFair_join_jobs ?? 2;
            $return['softSize'] = $custom_softSize;
            $return['softType'] = $custom_softType;
            $return['thumbSize'] = $custom_thumbSize;
            $return['thumbType'] = $custom_thumbType;
            $return['pgCustomName'] = $customPgCustomName ?? '普工/店招';
            $return['pgCustomDescription'] = $customPgCustomDescription ?? '求职招工如此简单';
            $return['customJobGsName'] = $customJobGsName ?? '阿里云';
            $return['jobFairJoinState'] = (int)$custom_jobFairJoinState;
            $return['atlasSize'] = $custom_atlasSize;
            $return['atlasType'] = $custom_atlasType;
            $return['newCheck'] = (int)$customNewCheck;
            $return['changeCheck'] = (int)$customChangeCheck;
        }

        return $return;

    }


    /**
     * （内部方法）获取登录用户id
     */
    private function getUid(){
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid<1){
            return array("state"=>200,"info"=>"您还未登录，请先登录。");
        }
        return $uid;
    }

    /**
     * （内部方法）获取登录商家的 cid , 没有校验
     */
    private function getCid($all=0){
        global $dsql;
        $uid = $this->getUid();
        //如果登录校验不通过
        if(is_array($uid)){
            return $uid;
        }
        //查询商家id
        $sql = $dsql->SetQuery("SELECT `id`,`state` FROM `#@__job_company` WHERE `userid` = " . $uid);
        $storeArr = $dsql->getArr($sql);
        if(empty($storeArr)){
            return array("state"=>200,"info"=>"您还未开通招聘公司");
        }

        $storeArr['id'] = (int)$storeArr['id'];
        $storeArr['state'] = (int)$storeArr['state'];

        //是否返回全部？
        if($all){
            return $storeArr;
        }
        //默认返回 id
        return $storeArr['id'];
    }

    /**
     * （内部方法）获取登录商家的 cid , 并校验（默认校验 state ）
     */
    private function getCidCheck($needCheckState = 1){
        $storeArr = $this->getCid(1);
        //不存在 store ？
        if(!$storeArr['id']){
            return $storeArr;
        }
        //校验 state 状态
        if($storeArr['state']!=1 && $needCheckState){
            return array("state"=>200,"info"=>"店铺还在审核中");
        }
        //返回校验通过的cid
        return $storeArr['id'];
    }


    /**
     * 获取招聘企业统计数据
     * 1.面试日程
     * 2.待处理投递
     * 3.下载的简历
     * 4.职位管理
     * 5.收藏的简历
     * 6.浏览的简历
    */
    public function getCompanyStatistics(){

        global $dsql;

        $param = $this->param;
        $ids = convertArrToStrWithComma($param['ids']);
        
        if(!$ids) return array("state"=>200, "info"=>"没有要获取的数据");

        $ids = explode(',', $ids);

        $uid = $this->getUid();
        //如果登录校验不通过
        if(is_array($uid)){
            return $uid;
        }

        $storeArr = $this->getCid(1);
        //不存在 store ？
        if(!$storeArr['id']){
            return $storeArr;
        }
        $cid = (int)$storeArr['id'];
        $state = (int)$storeArr['state'];

        $data = array();

        //今日面试日程
        if(in_array(1, $ids) && $state == 1){
            $sql = $dsql::SetQuery("select count(*) from `#@__job_invitation` where cid=$cid and `pubdate`>".strtotime(date("Y-m-d 00:00:00")));
            $jobInvitationCount = (int)$dsql->getOne($sql);
            $data[1] = $jobInvitationCount;
        }else{
            $data[1] = 0;
        }
    
        //待处理投递
        if(in_array(2, $ids) && $state == 1){
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `cid`=$cid and `state`=0 and `del`=0");
            $pendingDelivery = (int)$dsql->getOne($sql);

            //投递未读消息
            $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` where `cid`=$cid and `u_read`=0 and `del`=0");
            $newDelivery = (int)$dsql->getOne($sql);
            $data[2] = array(
                'pending' => $pendingDelivery,
                'new' => $newDelivery
            );
        }else{
            $data[2] = 0;
        }

        //下载的简历
        if(in_array(3, $ids) && $state == 1){
            $sql = $dsql::SetQuery("select count(*) from `#@__job_resume_download` where `cid`=$cid and `del`=0");
            $resumeDownUserCount = (int)$dsql->getOne($sql);
            $data[3] = $resumeDownUserCount;
        }else{
            $data[3] = 0;
        }

        //职位管理
        if(in_array(4, $ids)){
            $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`=$cid and `del`=0");
            $jobCount = (int)$dsql->getOne($sql);
            $data[4] = $jobCount;
        }

        //收藏的简历
        if(in_array(5, $ids) && $state == 1){
            $sql = $dsql::SetQuery("SELECT count(*) FROM `#@__member_collect` c left join `#@__job_resume` r on c.`aid`=r.`id` WHERE c.`module` = 'job' AND c.`action` = 'job' AND c.`userid` = '$uid' and r.`id` is not null");
            $collectResumeCount = (int)$dsql->getOne($sql);
            $data[5] = $collectResumeCount;
        }else{
            $data[5] = 0;
        }

        //浏览简历统计
        if(in_array(6, $ids) && $state == 1){
            $sql = $dsql::SetQuery("SELECT count(*) FROM `#@__job_historyclick` c left join `#@__job_resume` r on c.`aid`=r.`id` WHERE c.`module` = 'job' AND c.`module2` = 'resumeDetail' AND c.`uid` = '$uid' and r.`id` is not null");
            $clickResumeCount = (int)$dsql->getOne($sql);
            $data[6] = $clickResumeCount;
        }else{
            $data[6] = 0;
        }

        return $data;
    }
}
