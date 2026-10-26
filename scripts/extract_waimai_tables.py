import re

sql_file = "/Users/arvin/Documents/n8n-automation-workspace/01-n8n-automation-core/development/hawaiihub_net_2025-07-27_05-57-59_mysql_data_p5WII.sql"
out_file = "/tmp/waimai_tables.sql"

target_prefixes = ["hn_waimai_", "hn_courier_"]

with open(sql_file, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

valid_table_names = [
    "waimai_addr", "waimai_address", "waimai_album", "waimai_album_type", 
    "waimai_common", "waimai_courier", "waimai_courier_log", "waimai_historyclick", 
    "waimai_list", "waimai_list_type", "waimai_menu", "waimai_menu_type", 
    "waimai_news", "waimai_news_type", "waimai_order", "waimai_order_all", 
    "waimai_order_product", "waimai_order_temp", "waimai_quan", "waimai_quanlist", 
    "waimai_review", "waimai_shop", "waimai_shop_manager", "waimai_shop_type", 
    "waimai_shopprint", "waimai_store", "waimai_system", "waimai_type"
]

statements = re.split(r';\s*\n', content)
extracted = []

for stmt in statements:
    stmt_strip = stmt.strip()
    if not stmt_strip:
        continue
    # Must be DDL or DML for one of the valid tables
    is_valid = False
    for t in valid_table_names:
        if stmt_strip.startswith(f"DROP TABLE IF EXISTS `hn_{t}`") or \
           stmt_strip.startswith(f"CREATE TABLE `hn_{t}`") or \
           stmt_strip.startswith(f"INSERT INTO `hn_{t}`") or \
           stmt_strip.startswith(f"LOCK TABLES `hn_{t}`"):
            is_valid = True
            break
    if is_valid:
        converted = stmt_strip.replace("`hn_", "`huoniao_")

        # 合并表（MRG_MyISAM）补 UNION：上游 hawaiihub 的 `hn_waimai_order_all` 等合并表
        # 定义里只有 ENGINE=MRG_MyISAM，缺 INSERT_METHOD/UNION。原样灌库会得到一张
        # 「成员表列表为空」的合并表 —— 所有 SELECT 恒返回 0 行且不报错（静默空集）。
        # 2026-10 的「下单后看不到订单」事故就是这么来的，且连带取消订单/支付回调/
        # 商家后台打印/3 个订单 cron 全部静默失效，canary 与生产两库同时损坏。
        # 这里在抽取阶段补齐：成员表即去掉 `_all` 后缀的基础表（分表为空时的正确形态）。
        m = re.match(r'CREATE TABLE `hn_([A-Za-z0-9_]+)_all`', stmt_strip)
        if m and "ENGINE=MRG_MyISAM" in converted and "UNION=" not in converted:
            base = m.group(1)
            converted += " INSERT_METHOD=LAST UNION=(`huoniao_%s`)" % base
            print(f"  patched MRG merge table: huoniao_{base}_all -> UNION=(huoniao_{base})")

        extracted.append(converted + ";")

print(f"Extracted {len(extracted)} statements.")
with open(out_file, "w", encoding="utf-8") as f:
    f.write("\n\n".join(extracted))

print(f"Wrote to {out_file}")
