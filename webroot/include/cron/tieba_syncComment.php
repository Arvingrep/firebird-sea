<?php
// 只能手动新窗口执行

if(defined('HUONIAOINC')){
    return;
}

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
$user = $userLogin->getUserID();
?>

<html>
<head>
    <title>贴吧评论数据同步</title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
<h1 style="padding:50px 0;text-align:center;">贴吧评论数据同步</h1>

<?php

set_time_limit(0);

class checkTiebaTable
{
    public static $write = false;

    public function run($page = 1)
    {
        global $dsql;

        $pageSize = 5000;
        $atpage = $pageSize*($page-1);

        $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__tieba_list` WHERE `del` = 0");
        $tabArr = $dsql->dsqlOper($sql, "results");
        $totalCount = $tabArr[0]['totalCount'];
        $totalPage = ceil($totalCount / $pageSize);

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tieba_list` WHERE `del` = 0 LIMIT $atpage, $pageSize");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret) {
            foreach ($ret as $key => $val) {
                //统计评论回复
                $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__public_comment` WHERE `type` = 'tieba-detail' AND `aid`  = " . $val['id'] . "");
                $count = (int)$dsql->getOne($sql);
                $sql = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `comment` = '$count' WHERE `id` = " . $val['id'] . "");
                $dsql->dsqlOper($sql, "results");
            }
        }

        if ($page < $totalPage){
            ShowMsg('正在同步第'.$page.'页,共'.$totalPage.'页,请稍等...','tieba_syncComment.php?page=' . ++$page . '',0,1000);
        }else{
            DropCookie('confirm_sync');
            ShowMsg('同步完成','tieba_syncComment.php',0,5000);
            die;
        }
    }
}

if($user > 0){
    $check = GetCookie('confirm_sync');
    if($check || isset($_GET['confirm'])){
        PutCookie('confirm_sync', 1, 600);
    }
    if(!$check && !isset($_GET['confirm']) && $user > 0 ){
        $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM `#@__tieba_list`  WHERE `del` = '0'");
        $res = $dsql->dsqlOper($sql, "results");
        $count = $res[0]['total'];
        echo '<center style="padding-top:30px;color:red;">共有'.$count.'条数据需要同步<br><br><a href="?confirm=1">开始</a></center>';

    }else{
        $page = $_GET['page'] ? $_GET['page'] : 1;
        $obj = new checkTiebaTable();
        $obj->run($page);
    }
}else{
    echo '<script>location.href = "/";</script>';
}
?>

</body>
</html>