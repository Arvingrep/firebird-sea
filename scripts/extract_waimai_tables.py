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
        extracted.append(converted + ";")

print(f"Extracted {len(extracted)} statements.")
with open(out_file, "w", encoding="utf-8") as f:
    f.write("\n\n".join(extracted))

print(f"Wrote to {out_file}")
