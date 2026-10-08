<?php
/**
 * 验证码
 *
 * @version        $Id: vdimgck.class.php 2013-11-21 上午16:32:18 $
 * @package        HuoNiao.Class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class vdimgck {

	//配置参数
	var $code;
	var $type 	    = 1;
	var $width 	    = 100;
	var $height 	= 30;
	var $ttf	    = '/include/data/fonts/ggbi.ttf';
	var $angle	    = 0;
	var $warping 	= 0;
	var $shadow 	= 0;
	var $animator 	= 0;
	var $size 	    = 0;
	var $fontcolor;
	var $im;

	//初始化
	function __construct($config = array()){
		$this->type     = $config['seccodetype'];
		$this->width    = $config['seccodewidth'];
		$this->height   = $config['seccodeheight'];
		$this->ttf      = $config['seccodefamily'];
		$this->angle    = $config['scecodeangle'];
		$this->warping  = $config['scecodewarping'];
		$this->shadow   = $config['scecodeshadow'];
		$this->animator = $config['scecodeanimator'];
	}

	//显示验证码
	function display() {
		if(function_exists('imagecreate') && function_exists('imagecolorset') && function_exists('imagecopyresized') &&
			function_exists('imagecolorallocate') && function_exists('imagechar') && function_exists('imagecolorsforindex') &&
			function_exists('imageline') && function_exists('imagecreatefromstring') && (function_exists('imagegif') || function_exists('imagepng') || function_exists('imagejpeg'))) {
			$this->image();
		}
	}

	//生成图片
	function image() {
		$bgcontent = $this->background();

		//GIF动画
		if($this->animator == 1 && function_exists('imagegif')) {
			include_once dirname(__FILE__).'/gifmerge.class.php';
			$trueframe = mt_rand(1, 9);

			for($i = 0; $i <= 9; $i++) {
				$this->im = imagecreatefromstring($bgcontent);
				$x[$i] = $y[$i] = 0;
				$this->type != 4 && $this->adulterate();
				if($i == $trueframe) {
					$this->vdcode();
					$d[$i] = mt_rand(250, 400);
				} else {
					$this->adulteratefont();
					$d[$i] = mt_rand(5, 15);
				}
				ob_start();
				imagegif($this->im);
				imagedestroy($this->im);
				$frame[$i] = ob_get_contents();
				ob_end_clean();
			}
			$anim = new GifMerge($frame, 255, 255, 255, 0, $d, $x, $y, 'C_MEMORY');
			header('Content-type: image/gif');
			echo $anim->getAnimation();
		} else {
			$this->im = imagecreatefromstring($bgcontent);
			$this->type != 4 && $this->adulterate();
			$this->vdcode();

			if(function_exists('imagepng')) {
				header('Content-type: image/png');
				imagepng($this->im);
			} else {
				header('Content-type: image/jpeg');
				imagejpeg($this->im, '', 100);
			}
			imagedestroy($this->im);
		}
	}

	//随机背景色
	function background() {
		$this->im = imagecreatetruecolor($this->width, $this->height);
		$backgrounds = $c = array();
		if(isset($this->background) && function_exists('imagecreatefromjpeg') && function_exists('imagecolorat') && function_exists('imagecopymerge') &&
			function_exists('imagesetpixel') && function_exists('imageSX') && function_exists('imageSY')) {
			if($handle = @opendir($this->datapath.'background/')) {
				while($bgfile = @readdir($handle)) {
					if(preg_match('/\.jpg$/i', $bgfile)) {
						$backgrounds[] = $this->datapath.'background/'.$bgfile;
					}
				}
				@closedir($handle);
			}
			if($backgrounds) {
				$imwm = imagecreatefromjpeg($backgrounds[array_rand($backgrounds)]);
				$colorindex = imagecolorat($imwm, 0, 0);
				$c = imagecolorsforindex($imwm, $colorindex);
				$colorindex = imagecolorat($imwm, 1, 0);
				imagesetpixel($imwm, 0, 0, $colorindex);
				$c[0] = $c['red'];$c[1] = $c['green'];$c[2] = $c['blue'];
				imagecopymerge($this->im, $imwm, 0, 0, mt_rand(0, 200 - $this->width), mt_rand(0, 80 - $this->height), imageSX($imwm), imageSY($imwm), 100);
				imagedestroy($imwm);
			}
		}
		if(!isset($this->background) || !$backgrounds) {
			for($i = 0;$i < 3;$i++) {
				$start[$i] = mt_rand(200, 255);$end[$i] = mt_rand(100, 150);$step[$i] = ($end[$i] - $start[$i]) / $this->width;$c[$i] = $start[$i];
			}
			for($i = 0;$i < $this->width;$i++) {
				$color = imagecolorallocate($this->im, $c[0], $c[1], $c[2]);
				imageline($this->im, $i, 0, $i, $this->height, $color);
				$c[0] += $step[0];$c[1] += $step[1];$c[2] += $step[2];
			}
			$c[0] -= 20;$c[1] -= 20;$c[2] -= 20;
		}
		ob_start();
		if(function_exists('imagepng')) {
			imagepng($this->im);
		} else {
			imagejpeg($this->im, '', 100);
		}
		imagedestroy($this->im);
		$bgcontent = ob_get_contents();
		ob_end_clean();
		$this->fontcolor = $c;
		return $bgcontent;
	}

	//验证码内容
	function vdcode(){
		$seccode  = $this->code;
		$seccodelength = 4;
		//数字、字母
		if($this->type == 1 || $this->type == 2){
			for($i = 0; $i < 4; $i++){
				//数字
				if ($this->type == 1){
					$seccode .= chr(mt_rand(48, 57));

				//字母
				}elseif($this->type == 2){
					$seccode .= chr(mt_rand(65, 90));
				}
			}

		//汉字
		}elseif($this->type == 3){
			$zhstr = "们以我到他会作时要动国产的一是工就年阶义发成部民可出能方进在了不和有大这主中人上为来分生对于学下级地个用同行面说种过命度革而多子后自社加小机也经力线本电高量长党得实家定深法表着水理化争现所二起政三好十战无农使性前等反体合斗路图把结第里正新开论之物从当两些还天资事队批点育重其思与间内去因件日利相由压员气业代全组数果期导平各基或月毛然如应形想制心样干都向变关问比展那它最及外没看治提五解系林者米群头意只明四道马认次文通但条较克又公孔领军流入接席位情运器并飞原油放立题质指建区验活众很教决特此常石强极土少已根共直团统式转别造切九你取西持总料连任志观调七么山程百报更见必真保热委手改管处己将修支识病象几先老光专什六型具示复安带每东增则完风回南广劳轮科北打积车计给节做务被整联步类集号列温装即毫知轴研单色坚据速防史拉世设达尔场织历花受求传口断况采精金界品判参层止边清至万确究书术状厂须离再目海交权且儿青才证低越际八试规斯近注办布门铁需走议县兵固除般引齿千胜细影济白格效置推空配刀叶率述今选养德话查差半敌始片施响收华觉备名红续均药标记难存测士身紧液派准斤角降维板许破述技消底床田势端感往神便贺村构照容非搞亚磨族火段算适讲按值美态黄易彪服早班麦削信排台声该击素张密害侯草何树肥继右属市严径螺检左页抗苏显苦英快称坏移约巴材省黑武培著河帝仅针怎植京助升王眼她抓含苗副杂普谈围食射源例致酸旧却充足短划剂宣环落首尺波承粉践府鱼随考刻靠够满夫失包住促枝局菌杆周护岩师举曲春元超负砂封换太模贫减阳扬江析亩木言球朝医校古呢稻宋听唯输滑站另卫字鼓刚写刘微略范供阿块某功套友限项余倒卷创律雨让骨远帮初皮播优占死毒圈伟季训控激找叫云互跟裂粮粒母练塞钢顶策双留误础吸阻故寸盾晚丝女散焊功株亲院冷彻弹错散商视艺灭版烈零室轻血倍缺厘泵察绝富城冲喷壤简否柱李望盘磁雄似困巩益洲脱投送奴侧润盖挥距星松送获兴独官混纪依未突架宽冬章湿偏纹吃执阀矿寨责熟稳夺硬价努翻奇甲预职评读背协损棉侵灰虽矛厚罗泥辟告卵箱掌氧恩爱停曾溶营终纲孟钱待尽俄缩沙退陈讨奋械载胞幼哪剥迫旋征槽倒握担仍呀鲜吧卡粗介钻逐弱脚怕盐末阴丰雾冠丙街莱贝辐肠付吉渗瑞惊顿挤秒悬姆烂森糖圣凹陶词迟蚕亿矩康遵牧遭幅园腔订香肉弟屋敏恢忘编印蜂急拿扩伤飞露核缘游振操央伍域甚迅辉异序免纸夜乡久隶缸夹念兰映沟乙吗儒杀汽磷艰晶插埃燃欢铁补咱芽永瓦倾阵碳演威附牙芽永瓦斜灌欧献顺猪洋腐请透司危括脉宜笑若尾束壮暴企菜穗楚汉愈绿拖牛份染既秋遍锻玉夏疗尖殖井费州访吹荣铜沿替滚客召旱悟刺脑措贯藏敢令隙炉壳硫煤迎铸粘探临薄旬善福纵择礼愿伏残雷延烟句纯渐耕跑泽慢栽鲁赤繁境潮横掉锥希池败船假亮谓托伙哲怀割摆贡呈劲财仪沉炼麻罪祖息车穿货销齐鼠抽画饲龙库守筑房歌寒喜哥洗蚀废纳腹乎录镜妇恶脂庄擦险赞钟摇典柄辩竹谷卖乱虚桥奥伯赶垂途额壁网截野遗静谋弄挂课镇妄盛耐援扎虑键归符庆聚绕摩忙舞遇索顾胶羊湖钉仁音迹碎伸灯避泛亡答勇频皇柳哈揭甘诺概宪浓岛袭谁洪谢炮浇斑讯懂灵蛋闭孩释乳巨徒私银伊景坦累匀霉杜乐勒隔弯绩招绍胡呼痛峰零柴簧午跳居尚丁秦稍追梁折耗碱殊岗挖氏刃剧堆赫荷胸衡勤膜篇登驻案刊秧缓凸役剪川雪链渔啦脸户洛孢勃盟买杨宗焦赛旗滤硅炭股坐蒸凝竟陷枪黎救冒暗洞犯筒您宋弧爆谬涂味津臂障褐陆啊健尊豆拔莫抵桑坡缝警挑污冰柬嘴啥饭塑寄赵喊垫丹渡耳刨虎笔稀昆浪萨茶滴浅拥穴覆伦娘吨浸袖珠雌妈紫戏塔锤震岁貌洁剖牢锋疑霸闪埔猛诉刷狠忽灾闹乔唐漏闻沈熔氯荒茎男凡抢像浆旁玻亦忠唱蒙予纷捕锁尤乘乌智淡允叛畜俘摸锈扫毕璃宝芯爷鉴秘净蒋钙肩腾枯抛轨堂拌爸循诱祝励肯酒绳穷塘燥泡袋朗喂铝软渠颗惯贸粪综墙趋彼届墨碍启逆卸航衣孙龄岭骗休借";
			$zhstr = iconv('utf-8', 'gbk', $zhstr);
			for($i = 0; $i < 4; $i++){
				$Xi = mt_rand(0,strlen($zhstr)/2);
				if($Xi%2) $Xi += 1;
				$seccode .= substr($zhstr, $Xi, 2);
			}

		//算术
		}elseif($this->type == 4){
			$s0 = mt_rand(0, 1);
			$s1 = mt_rand(1, 99);
			$s2 = mt_rand(1, 99);
			$result = $s0 ? $s1 - $s2 : $s1 + $s2;
			$seccode = strval($s1) . ($s0 ? "-" : "+") . strval($s2);
			$seccodelength = strlen($seccode);
		}

		if($this->type == 4){
			putSession('huoniao_vdimg_value', $result);
        }elseif($this->type == 3){
            putSession('huoniao_vdimg_value', iconv("gbk", "utf-8", $seccode));
		}else{
			putSession('huoniao_vdimg_value', strtolower($seccode));
		}

		$widthtotal = 0;
		for($i = 0; $i < $seccodelength; $i++) {
			$this->type == 3 ? $textcode = iconv("gb2312", "utf-8", substr($seccode, $i * 2, 2)) : $textcode = $seccode[$i];
			$font[$i]['angle'] = $this->angle ? mt_rand(-30, 30) : 0;
			if($this->type == 3){
				$font[$i]['size'] = $this->width / 8;
			}elseif($this->type == 4){
				$font[$i]['size'] = $this->width / 6;
			}else{
				$font[$i]['size'] = $this->width / 5;
			}
			$this->size && $font[$i]['size'] = mt_rand($font[$i]['size'] - $this->width / 40, $font[$i]['size'] + $this->width / 20);
			$box = imagettfbbox($font[$i]['size'], 0, $this->ttf, $textcode);
			$font[$i]['zheight'] = max($box[1], $box[3]) - min($box[5], $box[7]);
			$box = imagettfbbox($font[$i]['size'], $font[$i]['angle'], $this->ttf, $textcode);
			$font[$i]['height'] = max($box[1], $box[3]) - min($box[5], $box[7]);
			$font[$i]['hd'] = $font[$i]['height'] - $font[$i]['zheight'];
			$font[$i]['width'] = (max($box[2], $box[4]) - min($box[0], $box[6])) + mt_rand(0, $this->type == 3 ? $this->width / 14 : $this->width / 8);
			$font[$i]['width'] = $font[$i]['width'] > $this->width / $seccodelength ? $this->width / $seccodelength : $font[$i]['width'];
			$widthtotal += $font[$i]['width'];
		}

		$x = @mt_rand($font[0]['angle'] > 0 ? cos(deg2rad(90 - $font[0]['angle'])) * $font[0]['zheight'] : 1, $this->width - $widthtotal);
		!isset($this->color) && $text_color = imagecolorallocate($this->im, $this->fontcolor[0], $this->fontcolor[1], $this->fontcolor[2]);

		$x = $this->type == 4 ? 10 : $x;

		for($i = 0; $i < $seccodelength; $i++) {
			$this->type == 3 ? $textcode = iconv("gb2312", "utf-8", substr($seccode, $i * 2, 2)) : $textcode = $seccode[$i];
			$this->fontcolor = array(mt_rand(0, 255), mt_rand(0, 255), mt_rand(0, 255));
			$this->shadow && $text_shadowcolor = imagecolorallocate($this->im, 0, 0, 0);
			$text_color = imagecolorallocate($this->im, $this->fontcolor[0], $this->fontcolor[1], $this->fontcolor[2]);
			if($this->shadow) {
				$text_shadowcolor = imagecolorallocate($this->im, 0, 0, 0);
			}
			$y = $font[0]['angle'] > 0 ? mt_rand($font[$i]['height'], $this->height) : mt_rand($font[$i]['height'] - $font[$i]['hd'], $this->height - $font[$i]['hd']);
			$y = $this->type == 4 ? $this->height - $font[$i]['height'] / 2 : $y;
			$this->shadow && imagettftext($this->im, $font[$i]['size'], $font[$i]['angle'], $x + 1, $y + 1, $text_shadowcolor, $this->ttf, $textcode);
			imagettftext($this->im, $font[$i]['size'], $font[$i]['angle'], $x, $y, $text_color, $this->ttf, $textcode);
			$x += $font[$i]['width'];
		}
		$this->warping && $this->warping($this->im);
	}

	//随机干扰线
	function adulterate(){
		$linenums = $this->height / 10;
		for($i = 0; $i <= $linenums;$i++) {
			$color = isset($this->color) ? imagecolorallocate($this->im, mt_rand(0, 255), mt_rand(0, 255), mt_rand(0, 255)) : imagecolorallocate($this->im, $this->fontcolor[0], $this->fontcolor[1], $this->fontcolor[2]);
			$x = mt_rand(0, $this->width);
			$y = mt_rand(0, $this->height);
			if(mt_rand(0, 1)) {
				$w = mt_rand(0, $this->width);
				$h = mt_rand(0, $this->height);
				$s = mt_rand(0, 360);
				$e = mt_rand(0, 360);
				for($j = 0;$j < 3;$j++) {
					imagearc($this->im, $x + $j, $y, $w, $h, $s, $e, $color);
				}
			} else {
				$xe = mt_rand(0, $this->width);
				$ye = mt_rand(0, $this->height);
				imageline($this->im, $x, $y, $xe, $ye, $color);
				for($j = 0;$j < 3;$j++) {
					imageline($this->im, $x + $j, $y, $xe, $ye, $color);
				}
			}
		}
	}

	//GIF干扰字符
	function adulteratefont() {
		$seccodeunits = 'BCEFGHJKMPQRTVWXY2346789';
		$x = $this->width / 4;
		$y = $this->height / 10;
		$text_color = imagecolorallocate($this->im, $this->fontcolor[0], $this->fontcolor[1], $this->fontcolor[2]);
		for($i = 0; $i <= 3; $i++) {
			$adulteratecode = $seccodeunits[mt_rand(0, 23)];
			imagechar($this->im, 5, $x * $i + mt_rand(0, $x - 10), mt_rand($y, $this->height - 10 - $y), $adulteratecode, $text_color);
		}
	}

	//扭曲
	function warping(&$obj) {
		$rgb = array();
		$direct = rand(0, 1);
		$width = imagesx($obj);
		$height = imagesy($obj);
		$level = $width / 20;
		for($j = 0;$j < $height;$j++) {
			for($i = 0;$i < $width;$i++) {
				$rgb[$i] = imagecolorat($obj, $i , $j);
			}
			for($i = 0;$i < $width;$i++) {
				$r = sin($j / $height * 1.5 * M_PI - M_PI * 0.5) * ($direct ? $level : -$level);
				imagesetpixel($obj, $i + $r , $j , $rgb[$i]);
			}
		}
	}

};
