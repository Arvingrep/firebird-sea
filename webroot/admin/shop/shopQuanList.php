<?php
/**
 * 商城优惠券管理
 *
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("shopQuanList");

$dbname = "shop_quanlist";
$templates = "shopQuanList.html";

$action = $_REQUEST['action'];

//删除优惠券
if($action == "delete"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "删除成功！"}';
            exit();
        }else{
            echo '{"state": 200, "info": "删除失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}



$where = "";
global $userLogin;

if($nickname){
    $where .= " AND m.`nickname` like '%".$nickname."%' ";
}

if($shopname){
    $where .= " AND s.`title` like '%".$shopname."%'";
}
$pageSize = 50;

$sql = $dsql->SetQuery("SELECT q.`id`,q.`userid`,q.`qid`,q.`name`,q.`money`,q.`basic_price`,q.`ktime`,q.`etime`,q.`quantype`,q.`shopids`,q.`fid`,q.`pubdate`,q.`state`,q.`usedate`,q.`promotiotype`,q.`promotio`,s.`title`,m.`nickname`,m.`username` FROM `#@__$dbname` q LEFT JOIN `#@__shop_store` s ON s.`id` = q.`shopids`  LEFT JOIN  `#@__member` m ON q.`userid`=m.`id` WHERE  q.`state` != -1 $where ORDER BY q.`id` DESC");

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
    $param         = array(
        "service"  => "shop",
        "template" => "store-detail",
        "id"       => $value['shopids']
    );
    $results[$key]['url'] = getUrlPath($param);

}
$huoniaoTag->assign("list", $results);
$huoniaoTag->assign("nickname", $nickname);
$huoniaoTag->assign("shopname", $shopname);


$pagelist = new pagelist(array(
    "list_rows"   => $pageSize,
    "total_pages" => $totalPage,
    "total_rows"  => $totalCount,
    "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());



//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
    $cssFile = array(
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/chosen.min.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/ace.min.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'admin/shop/shopQuanList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
