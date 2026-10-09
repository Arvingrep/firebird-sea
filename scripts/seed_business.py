import os

with open('webroot/install/db_default.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

sqls = []
for i in range(96, 237):
    line = lines[i].strip().rstrip(',;')
    if line.startswith('INSERT INTO `#'):
        sqls.append(line.replace('#@__', 'huoniao_') + ';')
    elif line.startswith('(`id`'):
        sqls.append('INSERT INTO huoniao_business_type ' + line.replace('#@__', 'huoniao_') + ';')

with open('/tmp/business_types.sql', 'w', encoding='utf-8') as out:
    out.write('\n'.join(sqls))

print(f'Generated {len(sqls)} SQL statements to /tmp/business_types.sql')
