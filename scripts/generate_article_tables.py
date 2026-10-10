#!/usr/bin/env python3
import json
import sys

def main():
    db_file = "webroot/data/admin/huoniaoDatabase.txt"
    with open(db_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    prefix = "huoniao_"
    article_tables = [t for t in data["table"].keys() if t.startswith("#@__article")]

    def sqlnull(val):
        if val == "NO":
            return " NOT NULL"
        if val == "YES":
            return " NULL"
        return ""

    def sqldefault(val):
        if val is None:
            return ""
        v = str(val).replace("\\", "\\\\").replace("'", "''")
        return f" DEFAULT '{v}'"

    def sqlextra(val):
        return f" {val.upper()}" if val else ""

    def sqlcomment(val):
        if not val:
            return ""
        v = str(val).replace("\\", "\\\\").replace("'", "''")
        return f" COMMENT '{v}'"

    sqls = []
    for table_name in sorted(article_tables):
        table_detail = data["table"][table_name]
        fields = data["field"][table_name].values()
        table_name_ = table_name.replace("#@__", prefix)

        t = []
        for f in fields:
            f_name = f["Field"]
            f_type = f["Type"].upper()
            f_null = sqlnull(f.get("Null"))
            f_def = sqldefault(f.get("Default"))
            f_extra = sqlextra(f.get("Extra"))
            f_comm = sqlcomment(f.get("Comment"))
            # Avoid DEFAULT on TEXT/BLOB/GEOMETRY in older MySQL if invalid
            if any(t_kw in f_type for t_kw in ["TEXT", "BLOB", "JSON"]):
                f_def = ""
            field_def = f"`{f_name}` {f_type}{f_null}{f_def}{f_extra}{f_comm}"
            t.append(field_def)

        k = []
        if table_name in data.get("index", {}) and data["index"][table_name]:
            indexs = data["index"][table_name]
            for index_name, index_detail in indexs.items():
                cols = "`,`".join(index_detail["Column_name"].values())
                if index_name == "PRIMARY":
                    k.append(f"PRIMARY KEY (`{cols}`)")
                else:
                    k.append(f"KEY `{index_name}` (`{cols}`)")

        charset = table_detail.get("Collation", "utf8mb4_unicode_ci").split("_")[0]
        engine = table_detail.get("Engine", "InnoDB")
        if engine.upper() in ["MRG_MYISAM", "MERGE"]:
            engine = "InnoDB"
        comment = table_detail.get("Comment", "").replace("'", "''")

        col_defs = ", ".join(t)
        if k:
            col_defs += ", " + ", ".join(k)

        sql = f"CREATE TABLE IF NOT EXISTS `{table_name_}` ({col_defs}) ENGINE={engine} DEFAULT CHARSET={charset} COMMENT='{comment}';"
        sqls.append(sql)

    output_sql = "\n\n".join(sqls)
    with open("scripts/article_tables.sql", "w", encoding="utf-8") as out:
        out.write(output_sql + "\n")
    print(f"Generated {len(sqls)} article table DDLs to scripts/article_tables.sql")

if __name__ == "__main__":
    main()
